import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/server";
import { orderSchema, orderStatusSchema } from "@/lib/domain/schemas";
import {
  applyDriverPayoutSnapshot,
  assignDriverToVendorOrder,
} from "@/lib/driver/compensation";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";
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

const updateVendorOrderMutationSchema = z
  .object({
    status: orderStatusSchema.optional(),
    assignedDriverUid: z.string().min(1).nullable().optional(),
  })
  .refine(
    (input) =>
      typeof input.status !== "undefined" ||
      Object.prototype.hasOwnProperty.call(input, "assignedDriverUid"),
    {
      message: "Provide a status update or driver assignment.",
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

    if (input.status === "out_for_delivery" && !existingOrder.driverAssignment) {
      return NextResponse.json(
        {
          error: "Assign an active driver before dispatching this order.",
        },
        { status: 400 }
      );
    }

    let baseOrder = orderSchema.parse({
      ...existingOrder,
      status: input.status,
      deliveredAt:
        input.status === "delivered"
          ? existingOrder.deliveredAt ?? Date.now()
          : existingOrder.deliveredAt,
      updatedAt: Date.now(),
    });
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

    const hydratedOrder = await getVendorOrder(user.uid, id);
    return NextResponse.json({ order: hydratedOrder ?? updatedOrder }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update order";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
