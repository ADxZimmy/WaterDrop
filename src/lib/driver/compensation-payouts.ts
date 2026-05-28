import { randomUUID } from "crypto";

import {
  driverPayoutRequestSchema,
  driverProfileSchema,
  orderSchema,
} from "@/lib/domain/schemas";
import {
  tryRecordPayoutRequested,
  tryRecordPayoutReviewed,
} from "@/lib/finance/payout-ledger";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { ORDER_ACTIVE_STATUSES } from "@/lib/orders/status";

import { getDriverDisplayName } from "@/lib/driver/compensation-shared";
import {
  DRIVER_PAYOUT_REQUEST_COLLECTION,
  type AuthenticatedActor,
  type DriverPayoutSummary,
} from "@/lib/driver/compensation-types";
import { listDriverAssignedOrders } from "@/lib/driver/compensation-orders";

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
  const parsedUser = (await import("@/lib/domain/schemas")).userProfileSchema.safeParse(
    userSnapshot.data()
  );
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
  await tryRecordPayoutRequested(request);
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
  await tryRecordPayoutReviewed(nextRequest);
  return nextRequest;
}
