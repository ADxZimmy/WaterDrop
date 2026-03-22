import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/server";
import { orderSchema, orderStatusSchema } from "@/lib/domain/schemas";
import {
  applyDriverPayoutSnapshot,
  assignDriverToVendorOrder,
} from "@/lib/driver/compensation";
import { tryRecordCommissionAccrued } from "@/lib/finance/payout-ledger";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import {
  markDeliveryExceptionClosed,
  resolveVendorDeliveryException,
} from "@/lib/orders/delivery-exception";
import { appendOrderExecutionEvent } from "@/lib/orders/execution";
import { ORDER_STATUS_TRANSITIONS, getOrderStatusLabel } from "@/lib/orders/status";
import { getVendorOrder } from "@/lib/orders/vendor-order";

const ORDER_STATUS_EVENT_MAP = {
  accepted: "accepted",
  preparing: "preparing",
  out_for_delivery: "out_for_delivery",
  delivered: "delivered",
  cancelled: "cancelled",
} as const;

const deliveryExceptionResolutionSchema = z.enum(["reschedule", "return_to_vendor"]);

const updateVendorOrderMutationSchema = z
  .object({
    status: orderStatusSchema.optional(),
    assignedDriverUid: z.string().min(1).nullable().optional(),
    deliveryExceptionResolution: deliveryExceptionResolutionSchema.optional(),
    customerMessage: z.string().trim().max(280).optional(),
  })
  .refine((input) => !(input.deliveryExceptionResolution && typeof input.status !== "undefined"), {
    message: "Do not send status together with deliveryExceptionResolution; status is applied automatically.",
  })
  .refine(
    (input) =>
      typeof input.deliveryExceptionResolution !== "undefined" ||
      typeof input.status !== "undefined" ||
      Object.prototype.hasOwnProperty.call(input, "assignedDriverUid"),
    {
      message: "Provide a status update, driver assignment, or delivery exception resolution.",
    }
  );

export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(["vendor"]);
    const { id } = await context.params;
    const order = await getVendorOrder(user.uid, id);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load order";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(["vendor"]);
    const { id } = await context.params;
    const input = updateVendorOrderMutationSchema.parse(await request.json());
    const orderRef = getFirebaseAdminDb().collection("orders").doc(id);
    let snapshot = await orderRef.get();

    if (!snapshot.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    let existingOrder = orderSchema.parse(snapshot.data());
    if (existingOrder.vendorId !== user.uid) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (input.deliveryExceptionResolution) {
      if (existingOrder.status !== "out_for_delivery") {
        return NextResponse.json(
          { error: "Delivery exceptions can only be resolved while the order is out for delivery." },
          { status: 400 }
        );
      }
      if (existingOrder.deliveryException?.state !== "open") {
        return NextResponse.json(
          { error: "This order does not have an open delivery exception to resolve." },
          { status: 400 }
        );
      }

      const resolved = resolveVendorDeliveryException(
        existingOrder,
        user.uid,
        input.deliveryExceptionResolution,
        input.customerMessage
      );
      await orderRef.set(resolved);
      const hydratedOrder = await getVendorOrder(user.uid, id);
      return NextResponse.json({ order: hydratedOrder ?? resolved }, { status: 200 });
    }

    if (Object.prototype.hasOwnProperty.call(input, "assignedDriverUid")) {
      const hydratedOrder = await assignDriverToVendorOrder(
        user.uid,
        id,
        user.uid,
        input.assignedDriverUid ?? null
      );

      if (!input.status) {
        return NextResponse.json({ order: hydratedOrder }, { status: 200 });
      }

      snapshot = await orderRef.get();
      existingOrder = orderSchema.parse(snapshot.data());
    }

    if (!input.status || existingOrder.status === input.status) {
      const hydratedOrder = await getVendorOrder(user.uid, id);
      return NextResponse.json({ order: hydratedOrder }, { status: 200 });
    }

    const allowedTransitions = ORDER_STATUS_TRANSITIONS[existingOrder.status];
    if (!allowedTransitions.includes(input.status)) {
      return NextResponse.json(
        {
          error: `Cannot move order from ${getOrderStatusLabel(existingOrder.status)} to ${getOrderStatusLabel(input.status)}.`,
        },
        { status: 400 }
      );
    }

    if (
      existingOrder.status === "out_for_delivery" &&
      input.status === "preparing"
    ) {
      return NextResponse.json(
        {
          error:
            "Use deliveryExceptionResolution (reschedule or return_to_vendor) to move this order back to preparing after a failed delivery attempt.",
        },
        { status: 400 }
      );
    }

    if (input.status === "delivered" && existingOrder.deliveryException?.state === "open") {
      return NextResponse.json(
        {
          error:
            "Resolve the open delivery exception before marking this order delivered.",
        },
        { status: 400 }
      );
    }

    if (input.status === "out_for_delivery" && !existingOrder.driverAssignment) {
      return NextResponse.json(
        {
          error: "Assign an active driver before dispatching this order.",
        },
        { status: 400 }
      );
    }

    const now = Date.now();
    let baseOrder = orderSchema.parse({
      ...existingOrder,
      status: input.status,
      deliveredAt:
        input.status === "delivered"
          ? existingOrder.deliveredAt ?? now
          : existingOrder.deliveredAt,
      updatedAt: now,
    });

    if (input.status === "cancelled" && existingOrder.deliveryException) {
      baseOrder = markDeliveryExceptionClosed(baseOrder, now);
    }

    if (input.status === "delivered" && baseOrder.deliveryException?.state !== "closed") {
      baseOrder = markDeliveryExceptionClosed(baseOrder, now);
    }

    const executionEventType =
      input.status in ORDER_STATUS_EVENT_MAP
        ? ORDER_STATUS_EVENT_MAP[
            input.status as keyof typeof ORDER_STATUS_EVENT_MAP
          ]
        : null;
    if (executionEventType) {
      baseOrder = appendOrderExecutionEvent(baseOrder, {
        type: executionEventType,
        actor: { role: "vendor", uid: user.uid },
        occurredAt: baseOrder.updatedAt,
      });
    }
    const updatedOrder =
      input.status === "delivered"
        ? await applyDriverPayoutSnapshot(baseOrder)
        : baseOrder;

    await orderRef.set(updatedOrder);
    await tryRecordCommissionAccrued(existingOrder, updatedOrder);

    const hydratedOrder = await getVendorOrder(user.uid, id);
    return NextResponse.json({ order: hydratedOrder ?? updatedOrder }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update order";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
