import { randomUUID } from "crypto";
import {
  payoutLedgerEntrySchema,
  type DriverPayoutRequest,
  type Order,
  type PayoutLedgerEntry,
} from "@/lib/domain/schemas";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";

const COLLECTION = "payoutLedgerEntries";

function persistEntry(entry: PayoutLedgerEntry) {
  const db = getFirebaseAdminDb();
  return db.collection(COLLECTION).doc(entry.id).set(payoutLedgerEntrySchema.parse(entry));
}

export async function tryRecordCommissionAccrued(prev: Order, next: Order) {
  try {
    if (prev.driverPayout || next.driverPayout?.status !== "accrued") {
      return;
    }
    const assignment = next.driverAssignment;
    if (!assignment || !next.driverPayout) {
      return;
    }

    const now = Date.now();
    await persistEntry({
      id: randomUUID(),
      kind: "commission_accrued",
      createdAt: now,
      currency: "NGN",
      amountNaira: next.driverPayout.amountNaira,
      vendorId: next.vendorId,
      driverUid: assignment.driverUid,
      orderId: next.id,
    });
  } catch (error) {
    console.error("[payout-ledger] commission_accrued failed", error);
  }
}

export async function tryRecordPayoutRequested(request: DriverPayoutRequest) {
  try {
    const now = Date.now();
    await persistEntry({
      id: randomUUID(),
      kind: "payout_requested",
      createdAt: now,
      currency: "NGN",
      amountNaira: request.amountNaira,
      vendorId: request.vendorId,
      driverUid: request.driverUid,
      orderIds: request.orderIds,
      payoutRequestId: request.id,
    });
  } catch (error) {
    console.error("[payout-ledger] payout_requested failed", error);
  }
}

export async function tryRecordPayoutReviewed(request: DriverPayoutRequest) {
  try {
    const now = Date.now();
    await persistEntry({
      id: randomUUID(),
      kind: request.status === "paid" ? "payout_paid" : "payout_rejected",
      createdAt: now,
      currency: "NGN",
      amountNaira: request.amountNaira,
      vendorId: request.vendorId,
      driverUid: request.driverUid,
      orderIds: request.orderIds,
      payoutRequestId: request.id,
      note: request.reviewNote,
    });
  } catch (error) {
    console.error("[payout-ledger] payout review failed", error);
  }
}

export async function listVendorPayoutLedgerEntries(
  vendorId: string,
  limit = 50
): Promise<PayoutLedgerEntry[]> {
  const snapshot = await getFirebaseAdminDb()
    .collection(COLLECTION)
    .where("vendorId", "==", vendorId)
    .orderBy("createdAt", "desc")
    .limit(Math.min(Math.max(limit, 1), 200))
    .get();

  return snapshot.docs.map((doc) => payoutLedgerEntrySchema.parse(doc.data()));
}

export async function listDriverPayoutLedgerEntries(
  driverUid: string,
  limit = 50
): Promise<PayoutLedgerEntry[]> {
  const snapshot = await getFirebaseAdminDb()
    .collection(COLLECTION)
    .where("driverUid", "==", driverUid)
    .orderBy("createdAt", "desc")
    .limit(Math.min(Math.max(limit, 1), 200))
    .get();

  return snapshot.docs.map((doc) => payoutLedgerEntrySchema.parse(doc.data()));
}

export async function listPayoutLedgerEntriesGlobally(limit = 100): Promise<PayoutLedgerEntry[]> {
  const snapshot = await getFirebaseAdminDb()
    .collection(COLLECTION)
    .orderBy("createdAt", "desc")
    .limit(Math.min(Math.max(limit, 1), 200))
    .get();

  return snapshot.docs.map((doc) => payoutLedgerEntrySchema.parse(doc.data()));
}
