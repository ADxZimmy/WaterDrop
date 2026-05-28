import { orderSchema, userProfileSchema, type Order } from "@/lib/domain/schemas";
import {
  tryRecordCommissionAccrued,
} from "@/lib/finance/payout-ledger";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import {
  appendOrderExecutionEvent,
  hasOrderExecutionEvent,
  setOrderDeliveryProof,
} from "@/lib/orders/execution";
import { getVendorOrder, listVendorOrders } from "@/lib/orders/vendor-order";

import { getEffectiveDriverCompensationConfig } from "@/lib/driver/compensation-config";
import {
  calculateDriverPayoutForOrder,
  getDriverDisplayName,
} from "@/lib/driver/compensation-shared";

export async function assignDriverToVendorOrder(
  vendorId: string,
  orderId: string,
  assignedByUid: string,
  driverUid: string | null
) {
  const orderRef = getFirebaseAdminDb().collection("orders").doc(orderId);
  const snapshot = await orderRef.get();

  if (!snapshot.exists) {
    throw new Error("Order not found.");
  }

  const order = orderSchema.parse(snapshot.data());
  if (order.vendorId !== vendorId) {
    throw new Error("Order not found.");
  }

  if (order.status === "delivered" || order.status === "cancelled") {
    throw new Error("Driver assignment can only be changed before an order is completed.");
  }

  if (!driverUid) {
    const nextOrderInput: Record<string, unknown> = {
      ...order,
      updatedAt: Date.now(),
    };
    delete nextOrderInput.driverAssignment;
    delete nextOrderInput.driverPayout;
    let updatedOrder = orderSchema.parse(nextOrderInput);
    updatedOrder = appendOrderExecutionEvent(updatedOrder, {
      type: "driver_unassigned",
      actor: { role: "vendor", uid: assignedByUid },
    });
    await orderRef.set(updatedOrder);
    return getVendorOrder(vendorId, orderId);
  }

  const driverDoc = await getFirebaseAdminDb().collection("drivers").doc(driverUid).get();
  if (!driverDoc.exists) {
    throw new Error("Driver not found.");
  }

  const driverProfile = (await import("@/lib/domain/schemas")).driverProfileSchema.parse(
    driverDoc.data()
  );
  if (driverProfile.vendorId !== vendorId) {
    throw new Error("Driver does not belong to this vendor.");
  }

  if (driverProfile.status !== "active") {
    throw new Error("Only active drivers can be assigned to orders.");
  }

  const userDoc = await getFirebaseAdminDb().collection("users").doc(driverUid).get();
  const parsedUser = userProfileSchema.safeParse(userDoc.data());
  const driverName = getDriverDisplayName(parsedUser.success ? parsedUser.data : null, driverUid);

  const updatedOrderWithAssignment = orderSchema.parse({
    ...order,
    driverAssignment: {
      driverUid,
      driverName,
      assignedAt: Date.now(),
      assignedByUid,
    },
    updatedAt: Date.now(),
  });
  const updatedOrder = appendOrderExecutionEvent(updatedOrderWithAssignment, {
    type: "driver_assigned",
    actor: { role: "vendor", uid: assignedByUid },
    note: driverName,
  });

  await orderRef.set(updatedOrder);
  return getVendorOrder(vendorId, orderId);
}

export async function applyDriverPayoutSnapshot(order: Order) {
  if (order.status !== "delivered") {
    return order;
  }

  if (!order.driverAssignment) {
    return orderSchema.parse({
      ...order,
      deliveredAt: order.deliveredAt ?? Date.now(),
    });
  }

  if (order.driverPayout) {
    return orderSchema.parse({
      ...order,
      deliveredAt: order.deliveredAt ?? Date.now(),
    });
  }

  const { config, source } = await getEffectiveDriverCompensationConfig(
    order.vendorId,
    order.driverAssignment.driverUid
  );

  return orderSchema.parse({
    ...order,
    deliveredAt: order.deliveredAt ?? Date.now(),
    driverPayout: calculateDriverPayoutForOrder(order, config, source),
  });
}

export async function confirmDriverArrival(orderId: string, driverUid: string) {
  const orderRef = getFirebaseAdminDb().collection("orders").doc(orderId);
  const snapshot = await orderRef.get();

  if (!snapshot.exists) {
    throw new Error("Order not found.");
  }

  const order = orderSchema.parse(snapshot.data());
  if (order.driverAssignment?.driverUid !== driverUid) {
    throw new Error("Order not found.");
  }

  if (order.status !== "out_for_delivery") {
    throw new Error("Arrival can only be confirmed while the order is out for delivery.");
  }

  if (hasOrderExecutionEvent(order, "driver_arrived")) {
    return order;
  }

  const updatedOrder = appendOrderExecutionEvent(order, {
    type: "driver_arrived",
    actor: { role: "driver", uid: driverUid },
  });

  await orderRef.set(updatedOrder);
  return updatedOrder;
}

export async function confirmDriverDelivery(
  orderId: string,
  driverUid: string,
  recipientName: string,
  note?: string
) {
  const orderRef = getFirebaseAdminDb().collection("orders").doc(orderId);
  const snapshot = await orderRef.get();

  if (!snapshot.exists) {
    throw new Error("Order not found.");
  }

  const order = orderSchema.parse(snapshot.data());
  if (order.driverAssignment?.driverUid !== driverUid) {
    throw new Error("Order not found.");
  }

  if (order.status !== "out_for_delivery") {
    throw new Error("Delivery can only be confirmed while the order is out for delivery.");
  }

  let updatedOrder = setOrderDeliveryProof(order, {
    confirmedByUid: driverUid,
    recipientName,
    note,
  });
  updatedOrder = appendOrderExecutionEvent(updatedOrder, {
    type: "delivered",
    actor: { role: "driver", uid: driverUid },
    note,
    recipientName,
    occurredAt: updatedOrder.deliveryProof?.confirmedAt,
  });
  updatedOrder = orderSchema.parse({
    ...updatedOrder,
    status: "delivered",
    deliveredAt: updatedOrder.deliveryProof?.confirmedAt ?? Date.now(),
    updatedAt: updatedOrder.deliveryProof?.confirmedAt ?? Date.now(),
  });
  updatedOrder = await applyDriverPayoutSnapshot(updatedOrder);

  await orderRef.set(updatedOrder);
  await tryRecordCommissionAccrued(order, updatedOrder);
  return updatedOrder;
}

export async function reportDriverDeliveryFailedAttempt(
  orderId: string,
  driverUid: string,
  note: string
) {
  const orderRef = getFirebaseAdminDb().collection("orders").doc(orderId);
  const snapshot = await orderRef.get();

  if (!snapshot.exists) {
    throw new Error("Order not found.");
  }

  const order = orderSchema.parse(snapshot.data());
  if (order.driverAssignment?.driverUid !== driverUid) {
    throw new Error("Order not found.");
  }

  if (order.status !== "out_for_delivery") {
    throw new Error(
      "Failed delivery attempts can only be reported while the order is out for delivery."
    );
  }

  const now = Date.now();
  const withEvent = appendOrderExecutionEvent(order, {
    type: "delivery_failed_attempt",
    actor: { role: "driver", uid: driverUid },
    note,
    occurredAt: now,
  });

  const updatedOrder = orderSchema.parse({
    ...withEvent,
    deliveryException: {
      state: "open",
      openedAt: order.deliveryException?.openedAt ?? now,
      updatedAt: now,
    },
    updatedAt: now,
  });

  await orderRef.set(updatedOrder);
  return updatedOrder;
}

export async function listDriverAssignedOrders(driverUid: string, vendorId: string) {
  const orders = await listVendorOrders(vendorId);
  return orders.filter((order) => order.driverAssignment?.driverUid === driverUid);
}

export async function getDriverAssignedOrder(
  driverUid: string,
  vendorId: string,
  orderId: string
) {
  const order = await getVendorOrder(vendorId, orderId);
  if (!order || order.driverAssignment?.driverUid !== driverUid) {
    return null;
  }

  return order;
}
