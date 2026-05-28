import { beforeEach, describe, expect, it, vi } from "vitest";

import { driverPayoutRequestSchema, orderSchema } from "@/lib/domain/schemas";

type QueryState = {
  filters: Array<{ field: string; value: unknown }>;
  orderBy?: { field: string; direction: "asc" | "desc" };
  limit?: number;
};

function createMockLedgerDb(initialEntries: Record<string, unknown>) {
  const store = {
    payoutLedgerEntries: { ...initialEntries },
  };

  const applyQuery = (query: QueryState) => {
    let values = Object.values(store.payoutLedgerEntries) as Array<Record<string, unknown>>;

    for (const filter of query.filters) {
      values = values.filter((entry) => entry[filter.field] === filter.value);
    }

    if (query.orderBy) {
      const { field, direction } = query.orderBy;
      values = [...values].sort((left, right) => {
        const leftValue = Number(left[field] ?? 0);
        const rightValue = Number(right[field] ?? 0);
        return direction === "desc" ? rightValue - leftValue : leftValue - rightValue;
      });
    }

    if (query.limit !== undefined) {
      values = values.slice(0, query.limit);
    }

    return { docs: values.map((value) => ({ data: () => value })) };
  };

  const collection = () => {
    const query = (state: QueryState) => ({
      where(field: string, _operator: string, value: unknown) {
        return query({
          ...state,
          filters: [...state.filters, { field, value }],
        });
      },
      orderBy(field: string, direction: "asc" | "desc") {
        return query({
          ...state,
          orderBy: { field, direction },
        });
      },
      limit(value: number) {
        return query({
          ...state,
          limit: value,
        });
      },
      async get() {
        return applyQuery(state);
      },
      doc(id: string) {
        return {
          async set(value: unknown) {
            store.payoutLedgerEntries[id] = value;
          },
        };
      },
    });

    return query({ filters: [] });
  };

  return {
    store,
    db: {
      collection,
    },
  };
}

const firebaseAdminMock = vi.hoisted(() => ({
  getFirebaseAdminDb: vi.fn(),
}));

vi.mock("@/lib/firebase/admin", () => firebaseAdminMock);

import {
  listDriverPayoutLedgerEntries,
  listPayoutLedgerEntriesGlobally,
  listVendorPayoutLedgerEntries,
  tryRecordCommissionAccrued,
  tryRecordPayoutRequested,
  tryRecordPayoutReviewed,
} from "@/lib/finance/payout-ledger";

describe("payout ledger helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("records commission accrual only for newly-accrued driver payouts", async () => {
    const nowSpy = vi.spyOn(Date, "now").mockReturnValue(10_000);
    const dbState = createMockLedgerDb({});
    firebaseAdminMock.getFirebaseAdminDb.mockReturnValue(dbState.db);

    const prev = orderSchema.parse({
      id: "order-1",
      customerUid: "customer-1",
      vendorId: "vendor-1",
      items: [{ productId: "p1", name: "Water", quantity: 1, unitPriceNaira: 1000 }],
      subtotalNaira: 1000,
      deliveryFeeNaira: 300,
      totalNaira: 1300,
      paymentMethod: "cod",
      status: "out_for_delivery",
      createdAt: 1,
      updatedAt: 1,
      executionEvents: [],
    });
    const next = orderSchema.parse({
      ...prev,
      status: "delivered",
      driverAssignment: {
        driverUid: "driver-1",
        driverName: "Ada",
        assignedAt: 1,
        assignedByUid: "vendor-user-1",
      },
      driverPayout: {
        amountNaira: 450,
        status: "accrued",
        source: "vendor_default",
        calculatedAt: 9_000,
      },
      updatedAt: 9_000,
    });

    await tryRecordCommissionAccrued(prev, next);

    const entry = Object.values(dbState.store.payoutLedgerEntries)[0] as Record<string, unknown>;
    expect(entry).toMatchObject({
      kind: "commission_accrued",
      createdAt: 10_000,
      amountNaira: 450,
      vendorId: "vendor-1",
      driverUid: "driver-1",
      orderId: "order-1",
    });

    await tryRecordCommissionAccrued(next, next);
    expect(Object.keys(dbState.store.payoutLedgerEntries)).toHaveLength(1);

    nowSpy.mockRestore();
  });

  it("records payout request and payout review entries", async () => {
    const nowSpy = vi.spyOn(Date, "now").mockReturnValue(20_000);
    const dbState = createMockLedgerDb({});
    firebaseAdminMock.getFirebaseAdminDb.mockReturnValue(dbState.db);

    const request = driverPayoutRequestSchema.parse({
      id: "request-1",
      vendorId: "vendor-1",
      driverUid: "driver-1",
      driverName: "Ada",
      amountNaira: 1600,
      orderIds: ["order-1", "order-2"],
      destinationLabel: "Bank",
      status: "pending",
      requestedAt: 19_000,
    });

    await tryRecordPayoutRequested(request);
    await tryRecordPayoutReviewed(
      driverPayoutRequestSchema.parse({
        ...request,
        status: "paid",
        reviewNote: "Paid by transfer",
      })
    );

    const entries = Object.values(dbState.store.payoutLedgerEntries) as Array<Record<string, unknown>>;
    expect(entries).toHaveLength(2);
    expect(entries[0]).toMatchObject({
      kind: "payout_requested",
      payoutRequestId: "request-1",
      orderIds: ["order-1", "order-2"],
      amountNaira: 1600,
    });
    expect(entries[1]).toMatchObject({
      kind: "payout_paid",
      payoutRequestId: "request-1",
      note: "Paid by transfer",
    });

    nowSpy.mockRestore();
  });

  it("swallows persistence failures and logs them", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    firebaseAdminMock.getFirebaseAdminDb.mockReturnValue({
      collection() {
        return {
          doc() {
            return {
              async set() {
                throw new Error("db unavailable");
              },
            };
          },
        };
      },
    });

    const request = driverPayoutRequestSchema.parse({
      id: "request-2",
      vendorId: "vendor-1",
      driverUid: "driver-1",
      driverName: "Ada",
      amountNaira: 500,
      orderIds: ["order-1"],
      destinationLabel: "Bank",
      status: "rejected",
      requestedAt: 1,
    });

    await expect(tryRecordPayoutReviewed(request)).resolves.toBeUndefined();
    expect(errorSpy).toHaveBeenCalledWith(
      "[payout-ledger] payout review failed",
      expect.any(Error)
    );

    errorSpy.mockRestore();
  });

  it("lists vendor, driver, and global entries with sane limit clamping", async () => {
    const dbState = createMockLedgerDb({
      "entry-1": {
        id: "entry-1",
        kind: "payout_requested",
        createdAt: 100,
        currency: "NGN",
        amountNaira: 200,
        vendorId: "vendor-1",
        driverUid: "driver-1",
      },
      "entry-2": {
        id: "entry-2",
        kind: "payout_paid",
        createdAt: 200,
        currency: "NGN",
        amountNaira: 300,
        vendorId: "vendor-1",
        driverUid: "driver-2",
      },
      "entry-3": {
        id: "entry-3",
        kind: "commission_accrued",
        createdAt: 300,
        currency: "NGN",
        amountNaira: 400,
        vendorId: "vendor-2",
        driverUid: "driver-1",
      },
    });
    firebaseAdminMock.getFirebaseAdminDb.mockReturnValue(dbState.db);

    const vendorEntries = await listVendorPayoutLedgerEntries("vendor-1", 1);
    expect(vendorEntries.map((entry) => entry.id)).toEqual(["entry-2"]);

    const driverEntries = await listDriverPayoutLedgerEntries("driver-1", 999);
    expect(driverEntries.map((entry) => entry.id)).toEqual(["entry-3", "entry-1"]);

    const globalEntries = await listPayoutLedgerEntriesGlobally(0);
    expect(globalEntries.map((entry) => entry.id)).toEqual(["entry-3"]);
  });
});
