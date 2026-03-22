import { randomUUID } from "crypto";
import {
  driverCompensationConfigSchema,
  driverProfileSchema,
  driverPayoutRequestSchema,
  orderDriverPayoutSchema,
  orderSchema,
  userProfileSchema,
  type DriverCompensationCategory,
  type DriverCompensationConfig,
  type DriverCompensationRule,
  type DriverPayoutRequest,
  type Order,
  type OrderDriverPayout,
  type UserProfile,
} from "@/lib/domain/schemas";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { appendOrderExecutionEvent, hasOrderExecutionEvent, setOrderDeliveryProof } from "@/lib/orders/execution";
import { ORDER_ACTIVE_STATUSES } from "@/lib/orders/status";
import { getVendorOrder, listVendorOrders, type VendorOrderRecord } from "@/lib/orders/vendor-order";

const DRIVER_COMPENSATION_COLLECTION = "driverCompensationConfigs";
const DRIVER_PAYOUT_REQUEST_COLLECTION = "driverPayoutRequests";

type AuthenticatedActor = {
  uid: string;
  email?: string;
  firstName?: string;
  lastName?: string;
};

export type DriverDirectoryRecord = {
  uid: string;
  name: string;
  email?: string;
  phone?: string;
  status: "pending" | "active" | "inactive";
  vehicleType?: string;
  licensePlate?: string;
  loadedUnits: number;
  createdAt: number;
  updatedAt: number;
  activeOrdersCount: number;
  deliveredOrdersCount: number;
  availableBalanceNaira: number;
  requestedBalanceNaira: number;
  paidBalanceNaira: number;
};

export type DriverPayoutSummary = {
  availableBalanceNaira: number;
  requestedBalanceNaira: number;
  lifetimePaidNaira: number;
  activeAssignedOrders: number;
  deliveredAssignedOrders: number;
  recentAssignedOrders: VendorOrderRecord[];
  recentPayoutRequests: DriverPayoutRequest[];
};

type SaveCommissionConfigInput = {
  bagsRule: DriverCompensationRule;
  bottledRule: DriverCompensationRule;
  bulkRule: DriverCompensationRule;
  otherRule?: DriverCompensationRule;
  priorityFeeToDriver: boolean;
};

function getDriverDisplayName(
  user: Partial<UserProfile> | null,
  fallbackUid: string,
  actor?: Pick<AuthenticatedActor, "email" | "firstName" | "lastName">
) {
  const firstName = typeof user?.firstName === "string" ? user.firstName.trim() : "";
  const lastName = typeof user?.lastName === "string" ? user.lastName.trim() : "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

  if (fullName) {
    return fullName;
  }

  const actorFullName = [actor?.firstName, actor?.lastName]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .join(" ")
    .trim();

  if (actorFullName) {
    return actorFullName;
  }

  if (typeof user?.email === "string" && user.email.trim().length > 0) {
    return user.email;
  }

  if (typeof actor?.email === "string" && actor.email.trim().length > 0) {
    return actor.email;
  }

  return `Driver ${fallbackUid.slice(0, 6)}`;
}

function getDefaultRule(): DriverCompensationRule {
  return {
    mode: "percentage",
    value: 15,
  };
}

function getNormalizedRule(rule: DriverCompensationRule | undefined): DriverCompensationRule {
  return {
    mode: rule?.mode ?? "percentage",
    value: typeof rule?.value === "number" ? rule.value : 15,
  };
}

function getVendorDefaultConfigDocId(vendorId: string) {
  return `${vendorId}__default`;
}

function getDriverOverrideConfigDocId(vendorId: string, driverUid: string) {
  return `${vendorId}__${driverUid}`;
}

function buildDefaultCompensationConfig(vendorId: string): DriverCompensationConfig {
  const now = Date.now();

  return driverCompensationConfigSchema.parse({
    id: getVendorDefaultConfigDocId(vendorId),
    vendorId,
    scope: "vendor_default",
    bagsRule: getDefaultRule(),
    bottledRule: getDefaultRule(),
    bulkRule: getDefaultRule(),
    otherRule: getDefaultRule(),
    priorityFeeToDriver: false,
    createdAt: now,
    updatedAt: now,
  });
}

export function normalizeCompensationCategory(
  category: string | undefined
): DriverCompensationCategory {
  const normalized = category?.trim().toLowerCase() ?? "";

  if (normalized.includes("bag") || normalized.includes("sachet")) {
    return "bags";
  }

  if (normalized.includes("bottle")) {
    return "bottled";
  }

  if (normalized.includes("bulk")) {
    return "bulk";
  }

  return "other";
}

function getRuleForCategory(
  config: DriverCompensationConfig,
  category: DriverCompensationCategory
) {
  if (category === "bags") {
    return config.bagsRule;
  }

  if (category === "bottled") {
    return config.bottledRule;
  }

  if (category === "bulk") {
    return config.bulkRule;
  }

  return config.otherRule;
}

export function calculateDriverPayoutForOrder(
  order: Order,
  config: DriverCompensationConfig,
  source: OrderDriverPayout["source"]
): OrderDriverPayout {
  const itemTotal = order.items.reduce((total, item) => {
    const lineSubtotal = item.unitPriceNaira * item.quantity;
    const rule = getRuleForCategory(
      config,
      normalizeCompensationCategory(item.category)
    );

    if (rule.mode === "percentage") {
      return total + (lineSubtotal * rule.value) / 100;
    }

    return total + rule.value * item.quantity;
  }, 0);

  const amountNaira = Math.round(
    itemTotal + (config.priorityFeeToDriver ? order.deliveryFeeNaira : 0)
  );

  return orderDriverPayoutSchema.parse({
    amountNaira,
    status: "accrued",
    source,
    calculatedAt: Date.now(),
  });
}

async function loadUserProfiles(uids: string[]) {
  const uniqueUids = [...new Set(uids.filter(Boolean))];
  const db = getFirebaseAdminDb();
  const entries = await Promise.all(
    uniqueUids.map(async (uid) => {
      const snapshot = await db.collection("users").doc(uid).get();
      const parsed = userProfileSchema.safeParse(snapshot.data());
      return [uid, parsed.success ? parsed.data : null] as const;
    })
  );

  return new Map(entries);
}

export async function getVendorCompensationConfig(vendorId: string) {
  const ref = getFirebaseAdminDb()
    .collection(DRIVER_COMPENSATION_COLLECTION)
    .doc(getVendorDefaultConfigDocId(vendorId));
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    return buildDefaultCompensationConfig(vendorId);
  }

  return driverCompensationConfigSchema.parse(snapshot.data());
}

export async function saveVendorCompensationConfig(
  vendorId: string,
  input: SaveCommissionConfigInput
) {
  const existing = await getVendorCompensationConfig(vendorId);
  const now = Date.now();
  const config = driverCompensationConfigSchema.parse({
    ...existing,
    id: getVendorDefaultConfigDocId(vendorId),
    vendorId,
    scope: "vendor_default",
    bagsRule: getNormalizedRule(input.bagsRule),
    bottledRule: getNormalizedRule(input.bottledRule),
    bulkRule: getNormalizedRule(input.bulkRule),
    otherRule: getNormalizedRule(input.otherRule ?? input.bottledRule),
    priorityFeeToDriver: input.priorityFeeToDriver,
    createdAt: existing.createdAt ?? now,
    updatedAt: now,
  });

  await getFirebaseAdminDb()
    .collection(DRIVER_COMPENSATION_COLLECTION)
    .doc(config.id)
    .set(config);

  return config;
}

export async function getDriverCommissionOverride(vendorId: string, driverUid: string) {
  const snapshot = await getFirebaseAdminDb()
    .collection(DRIVER_COMPENSATION_COLLECTION)
    .doc(getDriverOverrideConfigDocId(vendorId, driverUid))
    .get();

  if (!snapshot.exists) {
    return null;
  }

  return driverCompensationConfigSchema.parse(snapshot.data());
}

export async function getEffectiveDriverCompensationConfig(
  vendorId: string,
  driverUid: string
) {
  const override = await getDriverCommissionOverride(vendorId, driverUid);
  if (override) {
    return {
      config: override,
      source: "driver_override" as const,
    };
  }

  return {
    config: await getVendorCompensationConfig(vendorId),
    source: "vendor_default" as const,
  };
}

export async function saveDriverCommissionOverride(
  vendorId: string,
  driverUid: string,
  input: SaveCommissionConfigInput
) {
  const existing = await getDriverCommissionOverride(vendorId, driverUid);
  const base = existing ?? buildDefaultCompensationConfig(vendorId);
  const now = Date.now();
  const config = driverCompensationConfigSchema.parse({
    ...base,
    id: getDriverOverrideConfigDocId(vendorId, driverUid),
    vendorId,
    scope: "driver_override",
    driverUid,
    bagsRule: getNormalizedRule(input.bagsRule),
    bottledRule: getNormalizedRule(input.bottledRule),
    bulkRule: getNormalizedRule(input.bulkRule),
    otherRule: getNormalizedRule(input.otherRule ?? input.bottledRule),
    priorityFeeToDriver: input.priorityFeeToDriver,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  });

  await getFirebaseAdminDb()
    .collection(DRIVER_COMPENSATION_COLLECTION)
    .doc(config.id)
    .set(config);

  return config;
}

export async function listVendorDrivers(vendorId: string): Promise<DriverDirectoryRecord[]> {
  const db = getFirebaseAdminDb();
  const [driversSnapshot, orders] = await Promise.all([
    db.collection("drivers").where("vendorId", "==", vendorId).get(),
    listVendorOrders(vendorId),
  ]);

  const drivers = driversSnapshot.docs.map((doc) => driverProfileSchema.parse(doc.data()));
  if (drivers.length === 0) {
    return [];
  }

  const usersByUid = await loadUserProfiles(drivers.map((driver) => driver.uid));

  return drivers
    .map((driver) => {
      const user = usersByUid.get(driver.uid) ?? null;
      const assignedOrders = orders.filter(
        (order) => order.driverAssignment?.driverUid === driver.uid
      );
      const availableBalanceNaira = assignedOrders.reduce((sum, order) => {
        if (order.driverPayout?.status !== "accrued") {
          return sum;
        }
        return sum + order.driverPayout.amountNaira;
      }, 0);
      const requestedBalanceNaira = assignedOrders.reduce((sum, order) => {
        if (order.driverPayout?.status !== "requested") {
          return sum;
        }
        return sum + order.driverPayout.amountNaira;
      }, 0);
      const paidBalanceNaira = assignedOrders.reduce((sum, order) => {
        if (order.driverPayout?.status !== "paid") {
          return sum;
        }
        return sum + order.driverPayout.amountNaira;
      }, 0);

      return {
        uid: driver.uid,
        name: getDriverDisplayName(user, driver.uid),
        email: user?.email,
        phone: user?.phone,
        status: driver.status,
        vehicleType: driver.vehicleType,
        licensePlate: driver.licensePlate,
        loadedUnits: driver.loadedUnits,
        createdAt: driver.createdAt,
        updatedAt: driver.updatedAt,
        activeOrdersCount: assignedOrders.filter((order) =>
          ORDER_ACTIVE_STATUSES.has(order.status)
        ).length,
        deliveredOrdersCount: assignedOrders.filter((order) => order.status === "delivered")
          .length,
        availableBalanceNaira,
        requestedBalanceNaira,
        paidBalanceNaira,
      };
    })
    .sort((left, right) => right.updatedAt - left.updatedAt);
}

export async function getVendorDriver(vendorId: string, driverUid: string) {
  const drivers = await listVendorDrivers(vendorId);
  return drivers.find((driver) => driver.uid === driverUid) ?? null;
}

export async function updateVendorDriverStatus(
  vendorId: string,
  driverUid: string,
  status: "pending" | "active" | "inactive"
) {
  const driverRef = getFirebaseAdminDb().collection("drivers").doc(driverUid);
  const snapshot = await driverRef.get();

  if (!snapshot.exists) {
    throw new Error("Driver not found.");
  }

  const existingDriver = driverProfileSchema.parse(snapshot.data());
  if (existingDriver.vendorId !== vendorId) {
    throw new Error("Driver not found.");
  }

  if (existingDriver.status === status) {
    return existingDriver;
  }

  const nextDriver = driverProfileSchema.parse({
    ...existingDriver,
    status,
    updatedAt: Date.now(),
  });

  await driverRef.set(nextDriver);
  return nextDriver;
}

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

  const driverProfile = driverProfileSchema.parse(driverDoc.data());
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
    throw new Error("Failed delivery attempts can only be reported while the order is out for delivery.");
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

export async function listDriverPayoutRequests(driverUid: string) {
  const snapshot = await getFirebaseAdminDb()
    .collection(DRIVER_PAYOUT_REQUEST_COLLECTION)
    .where("driverUid", "==", driverUid)
    .get();

  return snapshot.docs
    .map((doc) => driverPayoutRequestSchema.parse(doc.data()))
    .sort((left, right) => right.requestedAt - left.requestedAt);
}

export async function getDriverPayoutRequest(driverUid: string, requestId: string) {
  const snapshot = await getFirebaseAdminDb()
    .collection(DRIVER_PAYOUT_REQUEST_COLLECTION)
    .doc(requestId)
    .get();

  if (!snapshot.exists) {
    return null;
  }

  const request = driverPayoutRequestSchema.parse(snapshot.data());
  if (request.driverUid !== driverUid) {
    return null;
  }

  return request;
}

export async function getDriverPayoutSummary(
  driverUid: string,
  vendorId: string
): Promise<DriverPayoutSummary> {
  const [orders, requests] = await Promise.all([
    listDriverAssignedOrders(driverUid, vendorId),
    listDriverPayoutRequests(driverUid),
  ]);

  return {
    availableBalanceNaira: orders.reduce((sum, order) => {
      if (order.driverPayout?.status !== "accrued") {
        return sum;
      }
      return sum + order.driverPayout.amountNaira;
    }, 0),
    requestedBalanceNaira: orders.reduce((sum, order) => {
      if (order.driverPayout?.status !== "requested") {
        return sum;
      }
      return sum + order.driverPayout.amountNaira;
    }, 0),
    lifetimePaidNaira: orders.reduce((sum, order) => {
      if (order.driverPayout?.status !== "paid") {
        return sum;
      }
      return sum + order.driverPayout.amountNaira;
    }, 0),
    activeAssignedOrders: orders.filter((order) => ORDER_ACTIVE_STATUSES.has(order.status)).length,
    deliveredAssignedOrders: orders.filter((order) => order.status === "delivered").length,
    recentAssignedOrders: orders.slice(0, 5),
    recentPayoutRequests: requests.slice(0, 5),
  };
}

export async function createDriverPayoutRequest(
  actor: AuthenticatedActor,
  destinationLabel: string
) {
  const driverSnapshot = await getFirebaseAdminDb().collection("drivers").doc(actor.uid).get();
  if (!driverSnapshot.exists) {
    throw new Error("Driver profile not found.");
  }

  const driver = driverProfileSchema.parse(driverSnapshot.data());
  const availableOrders = (await listDriverAssignedOrders(actor.uid, driver.vendorId)).filter(
    (order) => order.driverPayout?.status === "accrued"
  );

  if (availableOrders.length === 0) {
    throw new Error("There is no available payout balance to request.");
  }

  const userSnapshot = await getFirebaseAdminDb().collection("users").doc(actor.uid).get();
  const parsedUser = userProfileSchema.safeParse(userSnapshot.data());
  const driverName = getDriverDisplayName(
    parsedUser.success ? parsedUser.data : null,
    actor.uid,
    actor
  );
  const now = Date.now();
  const request = driverPayoutRequestSchema.parse({
    id: randomUUID(),
    vendorId: driver.vendorId,
    driverUid: actor.uid,
    driverName,
    amountNaira: availableOrders.reduce(
      (sum, order) => sum + (order.driverPayout?.amountNaira ?? 0),
      0
    ),
    orderIds: availableOrders.map((order) => order.id),
    destinationLabel: destinationLabel.trim(),
    status: "pending",
    requestedAt: now,
  });

  const db = getFirebaseAdminDb();
  const batch = db.batch();
  batch.set(db.collection(DRIVER_PAYOUT_REQUEST_COLLECTION).doc(request.id), request);

  for (const order of availableOrders) {
    batch.set(
      db.collection("orders").doc(order.id),
      orderSchema.parse({
        ...order,
        driverPayout: order.driverPayout
          ? {
              ...order.driverPayout,
              status: "requested",
              payoutRequestId: request.id,
              requestedAt: now,
            }
          : undefined,
        updatedAt: now,
      })
    );
  }

  await batch.commit();
  return request;
}

export async function listVendorPayoutRequests(vendorId: string) {
  const snapshot = await getFirebaseAdminDb()
    .collection(DRIVER_PAYOUT_REQUEST_COLLECTION)
    .where("vendorId", "==", vendorId)
    .get();

  return snapshot.docs
    .map((doc) => driverPayoutRequestSchema.parse(doc.data()))
    .sort((left, right) => right.requestedAt - left.requestedAt);
}

export async function getVendorPayoutRequest(vendorId: string, requestId: string) {
  const snapshot = await getFirebaseAdminDb()
    .collection(DRIVER_PAYOUT_REQUEST_COLLECTION)
    .doc(requestId)
    .get();

  if (!snapshot.exists) {
    return null;
  }

  const request = driverPayoutRequestSchema.parse(snapshot.data());
  if (request.vendorId !== vendorId) {
    return null;
  }

  return request;
}

export async function reviewVendorPayoutRequest(
  vendorId: string,
  reviewerUid: string,
  requestId: string,
  action: "paid" | "rejected",
  reviewNote?: string
) {
  const existingRequest = await getVendorPayoutRequest(vendorId, requestId);
  if (!existingRequest) {
    throw new Error("Payout request not found.");
  }

  if (existingRequest.status !== "pending") {
    throw new Error("This payout request has already been reviewed.");
  }

  const db = getFirebaseAdminDb();
  const orderSnapshots = await Promise.all(
    existingRequest.orderIds.map((orderId) => db.collection("orders").doc(orderId).get())
  );
  const orders = orderSnapshots
    .filter((snapshot) => snapshot.exists)
    .map((snapshot) => orderSchema.parse(snapshot.data()));
  const now = Date.now();
  const nextRequest = driverPayoutRequestSchema.parse({
    ...existingRequest,
    status: action,
    reviewedAt: now,
    reviewedByUid: reviewerUid,
    reviewNote: reviewNote?.trim() ? reviewNote.trim() : undefined,
  });

  const batch = db.batch();
  batch.set(db.collection(DRIVER_PAYOUT_REQUEST_COLLECTION).doc(requestId), nextRequest);

  for (const order of orders) {
    const nextPayout =
      order.driverPayout && action === "paid"
        ? {
            ...order.driverPayout,
            status: "paid" as const,
            payoutRequestId: requestId,
            paidAt: now,
          }
        : order.driverPayout
          ? {
              amountNaira: order.driverPayout.amountNaira,
              status: "accrued" as const,
              source: order.driverPayout.source,
              calculatedAt: order.driverPayout.calculatedAt,
            }
          : undefined;

    batch.set(
      db.collection("orders").doc(order.id),
      orderSchema.parse({
        ...order,
        driverPayout: nextPayout,
        updatedAt: now,
      })
    );
  }

  await batch.commit();
  return nextRequest;
}
