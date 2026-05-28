import { beforeEach, describe, expect, it, vi } from "vitest";

import { driverCompensationConfigSchema, driverProfileSchema, driverPayoutRequestSchema, orderSchema, userProfileSchema, type DriverPayoutRequest, type Order } from "@/lib/domain/schemas";

type CollectionStore = Record<string, Record<string, unknown>>;

type QueryFilter = {
  field: string;
  value: unknown;
};

function createSnapshot(data: unknown) {
  return {
    exists: data !== undefined,
    data: () => data,
  };
}

function createMockDb(initial: CollectionStore) {
  const store: CollectionStore = Object.fromEntries(
    Object.entries(initial).map(([collection, docs]) => [collection, { ...docs }])
  );

  const collection = (name: string) => {
    const ensure = () => {
      if (!store[name]) {
        store[name] = {};
      }

      return store[name];
    };

    const getDocs = (filter?: QueryFilter) => {
      const docs = Object.values(ensure())
        .filter((value) => {
          if (!filter) {
            return true;
          }

          return (value as Record<string, unknown>)[filter.field] === filter.value;
        })
        .map((value) => ({
          data: () => value,
          exists: true,
        }));

      return Promise.resolve({ docs });
    };

    return {
      doc(id: string) {
        return {
          async get() {
            return createSnapshot(ensure()[id]);
          },
          async set(value: unknown) {
            ensure()[id] = value;
          },
        };
      },
      where(field: string, _operator: string, value: unknown) {
        return {
          get() {
            return getDocs({ field, value });
          },
        };
      },
      get() {
        return getDocs();
      },
    };
  };

  return {
    store,
    db: {
      collection,
      batch() {
        const operations: Array<{ collectionName: string; id: string; value: unknown }> = [];

        return {
          set(ref: { __collectionName: string; __docId: string } | { set: (value: unknown) => Promise<void> }, value: unknown) {
            if ("__collectionName" in ref) {
              operations.push({
                collectionName: ref.__collectionName,
                id: ref.__docId,
                value,
              });
            }
          },
          async commit() {
            for (const operation of operations) {
              if (!store[operation.collectionName]) {
                store[operation.collectionName] = {};
              }

              store[operation.collectionName][operation.id] = operation.value;
            }
          },
        };
      },
    },
  };
}

function createCollectionRefAdapter(db: ReturnType<typeof createMockDb>["db"]) {
  const originalCollection = db.collection.bind(db);

  db.collection = ((name: string) => {
    const collectionRef = originalCollection(name);
    return {
      ...collectionRef,
      doc(id: string) {
        const docRef = collectionRef.doc(id);
        return {
          ...docRef,
          __collectionName: name,
          __docId: id,
        };
      },
    };
  }) as typeof db.collection;

  return db;
}

const firebaseAdminMock = vi.hoisted(() => ({
  getFirebaseAdminDb: vi.fn(),
}));

const vendorOrderMock = vi.hoisted(() => ({
  getVendorOrder: vi.fn(),
  listVendorOrders: vi.fn(),
}));

const payoutLedgerMock = vi.hoisted(() => ({
  tryRecordCommissionAccrued: vi.fn(),
  tryRecordPayoutRequested: vi.fn(),
  tryRecordPayoutReviewed: vi.fn(),
}));

vi.mock("@/lib/firebase/admin", () => firebaseAdminMock);
vi.mock("@/lib/orders/vendor-order", () => vendorOrderMock);
vi.mock("@/lib/finance/payout-ledger", () => payoutLedgerMock);

import {
  assignDriverToVendorOrder,
  calculateDriverPayoutForOrder,
  confirmDriverArrival,
  confirmDriverDelivery,
  createDriverPayoutRequest,
  normalizeCompensationCategory,
  reportDriverDeliveryFailedAttempt,
  reviewVendorPayoutRequest,
} from "@/lib/driver/compensation";

function buildOrder(overrides: Partial<Order> = {}): Order {
  return orderSchema.parse({
    id: "order-1",
    customerUid: "customer-1",
    vendorId: "vendor-1",
    vendorName: "WaterDrop Vendor",
    items: [
      {
        productId: "product-1",
        name: "Sachet Water",
        category: "bags",
        quantity: 2,
        unitPriceNaira: 1000,
      },
    ],
    subtotalNaira: 2000,
    deliveryFeeNaira: 500,
    totalNaira: 2500,
    paymentMethod: "cod",
    status: "delivered",
    executionEvents: [],
    createdAt: 1000,
    updatedAt: 1000,
    ...overrides,
  });
}

function useMockDb(dbState: ReturnType<typeof createMockDb>) {
  firebaseAdminMock.getFirebaseAdminDb.mockReturnValue(createCollectionRefAdapter(dbState.db));
  vendorOrderMock.getVendorOrder.mockImplementation(async (vendorId: string, orderId: string) => {
    const order = dbState.store.orders?.[orderId];
    if (!order) {
      return null;
    }

    const parsed = orderSchema.parse(order);
    return parsed.vendorId === vendorId ? parsed : null;
  });
}

describe("driver compensation helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("normalizes messy catalog categories into payout buckets", () => {
    expect(normalizeCompensationCategory("  Sachet Water ")).toBe("bags");
    expect(normalizeCompensationCategory("Bottled water")).toBe("bottled");
    expect(normalizeCompensationCategory("bulk refill")).toBe("bulk");
    expect(normalizeCompensationCategory("cooler dispenser")).toBe("other");
  });

  it("calculates payout using mixed percentage and fixed rules plus delivery fee", () => {
    const nowSpy = vi.spyOn(Date, "now").mockReturnValue(50_000);

    const order = buildOrder({
      items: [
        {
          productId: "product-1",
          name: "Sachet Water",
          category: "bags",
          quantity: 2,
          unitPriceNaira: 1000,
        },
        {
          productId: "product-2",
          name: "Bottle Pack",
          category: "bottled water",
          quantity: 3,
          unitPriceNaira: 750,
        },
      ],
      subtotalNaira: 4250,
      deliveryFeeNaira: 300,
      totalNaira: 4550,
    });

    const config = driverCompensationConfigSchema.parse({
      id: "vendor-1__default",
      vendorId: "vendor-1",
      scope: "vendor_default",
      bagsRule: { mode: "percentage", value: 10 },
      bottledRule: { mode: "fixed", value: 120 },
      bulkRule: { mode: "percentage", value: 5 },
      otherRule: { mode: "fixed", value: 50 },
      priorityFeeToDriver: true,
      createdAt: 1,
      updatedAt: 1,
    });

    expect(calculateDriverPayoutForOrder(order, config, "vendor_default")).toEqual({
      amountNaira: 860,
      status: "accrued",
      source: "vendor_default",
      calculatedAt: 50_000,
    });

    nowSpy.mockRestore();
  });

  it("creates a payout request from all accrued assigned orders and marks them requested", async () => {
    const nowSpy = vi.spyOn(Date, "now").mockReturnValue(60_000);
    const dbState = createMockDb({
      drivers: {
        "driver-1": driverProfileSchema.parse({
          uid: "driver-1",
          vendorId: "vendor-1",
          status: "active",
          loadedUnits: 0,
          createdAt: 1,
          updatedAt: 1,
        }),
      },
      users: {
        "driver-1": userProfileSchema.parse({
          uid: "driver-1",
          role: "driver",
          email: "driver@example.com",
          firstName: "Ada",
          lastName: "Okafor",
          createdAt: 1,
          updatedAt: 1,
        }),
      },
      orders: {},
      driverPayoutRequests: {},
    });

    firebaseAdminMock.getFirebaseAdminDb.mockReturnValue(createCollectionRefAdapter(dbState.db));
    vendorOrderMock.listVendorOrders.mockResolvedValue([
      buildOrder({
        id: "order-1",
        driverAssignment: {
          driverUid: "driver-1",
          driverName: "Ada Okafor",
          assignedAt: 10,
          assignedByUid: "vendor-user-1",
        },
        driverPayout: {
          amountNaira: 1200,
          status: "accrued",
          source: "vendor_default",
          calculatedAt: 55_000,
        },
      }),
      buildOrder({
        id: "order-2",
        driverAssignment: {
          driverUid: "driver-1",
          driverName: "Ada Okafor",
          assignedAt: 10,
          assignedByUid: "vendor-user-1",
        },
        driverPayout: {
          amountNaira: 800,
          status: "requested",
          source: "vendor_default",
          calculatedAt: 55_000,
          payoutRequestId: "older-request",
          requestedAt: 56_000,
        },
      }),
      buildOrder({
        id: "order-3",
        driverAssignment: {
          driverUid: "driver-1",
          driverName: "Ada Okafor",
          assignedAt: 10,
          assignedByUid: "vendor-user-1",
        },
        driverPayout: {
          amountNaira: 400,
          status: "accrued",
          source: "driver_override",
          calculatedAt: 55_000,
        },
      }),
    ]);

    const request = await createDriverPayoutRequest(
      { uid: "driver-1", email: "driver@example.com" },
      "  Zenith Bank - 1234567890  "
    );

    expect(request).toMatchObject({
      vendorId: "vendor-1",
      driverUid: "driver-1",
      driverName: "Ada Okafor",
      amountNaira: 1600,
      orderIds: ["order-1", "order-3"],
      destinationLabel: "Zenith Bank - 1234567890",
      status: "pending",
      requestedAt: 60_000,
    });

    expect(dbState.store.driverPayoutRequests[request.id]).toEqual(request);
    expect(dbState.store.orders["order-1"]).toMatchObject({
      driverPayout: {
        amountNaira: 1200,
        status: "requested",
        payoutRequestId: request.id,
        requestedAt: 60_000,
      },
      updatedAt: 60_000,
    });
    expect(dbState.store.orders["order-3"]).toMatchObject({
      driverPayout: {
        amountNaira: 400,
        status: "requested",
        payoutRequestId: request.id,
        requestedAt: 60_000,
      },
      updatedAt: 60_000,
    });
    expect(payoutLedgerMock.tryRecordPayoutRequested).toHaveBeenCalledWith(request);

    nowSpy.mockRestore();
  });

  it("rejects payout creation when the driver has no accrued balance", async () => {
    const dbState = createMockDb({
      drivers: {
        "driver-1": driverProfileSchema.parse({
          uid: "driver-1",
          vendorId: "vendor-1",
          status: "active",
          loadedUnits: 0,
          createdAt: 1,
          updatedAt: 1,
        }),
      },
      users: {},
      orders: {},
      driverPayoutRequests: {},
    });

    firebaseAdminMock.getFirebaseAdminDb.mockReturnValue(createCollectionRefAdapter(dbState.db));
    vendorOrderMock.listVendorOrders.mockResolvedValue([
      buildOrder({
        id: "order-2",
        driverAssignment: {
          driverUid: "driver-1",
          driverName: "Ada Okafor",
          assignedAt: 10,
          assignedByUid: "vendor-user-1",
        },
        driverPayout: {
          amountNaira: 800,
          status: "requested",
          source: "vendor_default",
          calculatedAt: 55_000,
          payoutRequestId: "older-request",
          requestedAt: 56_000,
        },
      }),
    ]);

    await expect(
      createDriverPayoutRequest({ uid: "driver-1" }, "Bank account")
    ).rejects.toThrow("There is no available payout balance to request.");
  });

  it("marks payout requests paid and updates all linked orders", async () => {
    const nowSpy = vi.spyOn(Date, "now").mockReturnValue(70_000);
    const existingRequest = driverPayoutRequestSchema.parse({
      id: "request-1",
      vendorId: "vendor-1",
      driverUid: "driver-1",
      driverName: "Ada Okafor",
      amountNaira: 1600,
      orderIds: ["order-1", "order-3"],
      destinationLabel: "Zenith Bank",
      status: "pending",
      requestedAt: 60_000,
    });
    const dbState = createMockDb({
      driverPayoutRequests: {
        "request-1": existingRequest,
      },
      orders: {
        "order-1": buildOrder({
          id: "order-1",
          driverAssignment: {
            driverUid: "driver-1",
            driverName: "Ada Okafor",
            assignedAt: 10,
            assignedByUid: "vendor-user-1",
          },
          driverPayout: {
            amountNaira: 1200,
            status: "requested",
            source: "vendor_default",
            calculatedAt: 55_000,
            payoutRequestId: "request-1",
            requestedAt: 60_000,
          },
        }),
        "order-3": buildOrder({
          id: "order-3",
          driverAssignment: {
            driverUid: "driver-1",
            driverName: "Ada Okafor",
            assignedAt: 10,
            assignedByUid: "vendor-user-1",
          },
          driverPayout: {
            amountNaira: 400,
            status: "requested",
            source: "driver_override",
            calculatedAt: 55_000,
            payoutRequestId: "request-1",
            requestedAt: 60_000,
          },
        }),
      },
    });

    firebaseAdminMock.getFirebaseAdminDb.mockReturnValue(createCollectionRefAdapter(dbState.db));

    const reviewed = await reviewVendorPayoutRequest(
      "vendor-1",
      "vendor-user-1",
      "request-1",
      "paid",
      "  Paid via transfer  "
    );

    expect(reviewed).toEqual<DriverPayoutRequest>({
      ...existingRequest,
      status: "paid",
      reviewedAt: 70_000,
      reviewedByUid: "vendor-user-1",
      reviewNote: "Paid via transfer",
    });
    expect(dbState.store.orders["order-1"]).toMatchObject({
      driverPayout: {
        amountNaira: 1200,
        status: "paid",
        payoutRequestId: "request-1",
        paidAt: 70_000,
      },
      updatedAt: 70_000,
    });
    expect(dbState.store.orders["order-3"]).toMatchObject({
      driverPayout: {
        amountNaira: 400,
        status: "paid",
        payoutRequestId: "request-1",
        paidAt: 70_000,
      },
      updatedAt: 70_000,
    });
    expect(payoutLedgerMock.tryRecordPayoutReviewed).toHaveBeenCalledWith(reviewed);

    nowSpy.mockRestore();
  });

  it("restores payout requests back to accrued on rejection", async () => {
    const nowSpy = vi.spyOn(Date, "now").mockReturnValue(80_000);
    const existingRequest = driverPayoutRequestSchema.parse({
      id: "request-2",
      vendorId: "vendor-1",
      driverUid: "driver-1",
      driverName: "Ada Okafor",
      amountNaira: 1200,
      orderIds: ["order-1"],
      destinationLabel: "Zenith Bank",
      status: "pending",
      requestedAt: 60_000,
    });
    const dbState = createMockDb({
      driverPayoutRequests: {
        "request-2": existingRequest,
      },
      orders: {
        "order-1": buildOrder({
          id: "order-1",
          driverAssignment: {
            driverUid: "driver-1",
            driverName: "Ada Okafor",
            assignedAt: 10,
            assignedByUid: "vendor-user-1",
          },
          driverPayout: {
            amountNaira: 1200,
            status: "requested",
            source: "vendor_default",
            calculatedAt: 55_000,
            payoutRequestId: "request-2",
            requestedAt: 60_000,
          },
        }),
      },
    });

    firebaseAdminMock.getFirebaseAdminDb.mockReturnValue(createCollectionRefAdapter(dbState.db));

    const reviewed = await reviewVendorPayoutRequest(
      "vendor-1",
      "vendor-user-1",
      "request-2",
      "rejected"
    );

    expect(reviewed).toMatchObject({
      status: "rejected",
      reviewedAt: 80_000,
      reviewedByUid: "vendor-user-1",
    });
    expect(dbState.store.orders["order-1"]).toMatchObject({
      driverPayout: {
        amountNaira: 1200,
        status: "accrued",
        source: "vendor_default",
        calculatedAt: 55_000,
      },
      updatedAt: 80_000,
    });

    nowSpy.mockRestore();
  });

  it("assigns an active driver and records the assignment event", async () => {
    const nowSpy = vi.spyOn(Date, "now").mockReturnValue(90_000);
    const dbState = createMockDb({
      orders: {
        "order-1": buildOrder({
          id: "order-1",
          status: "preparing",
          updatedAt: 1_000,
        }),
      },
      drivers: {
        "driver-1": driverProfileSchema.parse({
          uid: "driver-1",
          vendorId: "vendor-1",
          status: "active",
          vehicleType: "Bike",
          loadedUnits: 0,
          createdAt: 1,
          updatedAt: 1,
        }),
      },
      users: {
        "driver-1": userProfileSchema.parse({
          uid: "driver-1",
          role: "driver",
          email: "driver@example.com",
          firstName: "Ada",
          lastName: "Okafor",
          createdAt: 1,
          updatedAt: 1,
        }),
      },
    });

    useMockDb(dbState);

    const updated = await assignDriverToVendorOrder(
      "vendor-1",
      "order-1",
      "vendor-user-1",
      "driver-1"
    );

    expect(updated).toMatchObject({
      id: "order-1",
      driverAssignment: {
        driverUid: "driver-1",
        driverName: "Ada Okafor",
        assignedAt: 90_000,
        assignedByUid: "vendor-user-1",
      },
    });
    expect(dbState.store.orders["order-1"]).toMatchObject({
      driverAssignment: {
        driverUid: "driver-1",
        driverName: "Ada Okafor",
      },
      executionEvents: [
        {
          type: "driver_assigned",
          actorRole: "vendor",
          actorUid: "vendor-user-1",
          note: "Ada Okafor",
          occurredAt: 90_000,
        },
      ],
    });

    nowSpy.mockRestore();
  });

  it("rejects assignment when the driver is not active", async () => {
    const dbState = createMockDb({
      orders: {
        "order-1": buildOrder({
          id: "order-1",
          status: "preparing",
        }),
      },
      drivers: {
        "driver-1": driverProfileSchema.parse({
          uid: "driver-1",
          vendorId: "vendor-1",
          status: "inactive",
          loadedUnits: 0,
          createdAt: 1,
          updatedAt: 1,
        }),
      },
      users: {},
    });

    useMockDb(dbState);

    await expect(
      assignDriverToVendorOrder("vendor-1", "order-1", "vendor-user-1", "driver-1")
    ).rejects.toThrow("Only active drivers can be assigned to orders.");
  });

  it("unassigns a driver and clears payout snapshot fields", async () => {
    const nowSpy = vi.spyOn(Date, "now").mockReturnValue(91_000);
    const dbState = createMockDb({
      orders: {
        "order-1": buildOrder({
          id: "order-1",
          status: "out_for_delivery",
          driverAssignment: {
            driverUid: "driver-1",
            driverName: "Ada Okafor",
            assignedAt: 90_000,
            assignedByUid: "vendor-user-1",
          },
          driverPayout: {
            amountNaira: 1200,
            status: "accrued",
            source: "vendor_default",
            calculatedAt: 90_500,
          },
        }),
      },
    });

    useMockDb(dbState);

    const updated = await assignDriverToVendorOrder("vendor-1", "order-1", "vendor-user-1", null);

    expect(updated?.id).toBe("order-1");
    expect(updated?.driverAssignment).toBeUndefined();
    expect(updated?.driverPayout).toBeUndefined();
    expect(dbState.store.orders["order-1"]).toMatchObject({
      executionEvents: [
        {
          type: "driver_unassigned",
          actorRole: "vendor",
          actorUid: "vendor-user-1",
        },
      ],
    });

    nowSpy.mockRestore();
  });

  it("records driver arrival once and returns the same order on duplicate confirmation", async () => {
    const nowSpy = vi.spyOn(Date, "now").mockReturnValue(92_000);
    const baseOrder = buildOrder({
      id: "order-1",
      status: "out_for_delivery",
      driverAssignment: {
        driverUid: "driver-1",
        driverName: "Ada Okafor",
        assignedAt: 90_000,
        assignedByUid: "vendor-user-1",
      },
    });
    const dbState = createMockDb({
      orders: {
        "order-1": baseOrder,
      },
    });

    useMockDb(dbState);

    const first = await confirmDriverArrival("order-1", "driver-1");
    expect(first.executionEvents).toHaveLength(1);
    expect(first.executionEvents[0]).toMatchObject({
      type: "driver_arrived",
      actorRole: "driver",
      actorUid: "driver-1",
      occurredAt: 92_000,
    });

    const second = await confirmDriverArrival("order-1", "driver-1");
    expect(second).toEqual(first);
    expect(orderSchema.parse(dbState.store.orders["order-1"]).executionEvents).toHaveLength(1);

    nowSpy.mockRestore();
  });

  it("confirms delivery, persists proof, and accrues payout from the vendor default config", async () => {
    const nowSpy = vi.spyOn(Date, "now").mockReturnValue(95_000);
    const dbState = createMockDb({
      orders: {
        "order-1": buildOrder({
          id: "order-1",
          status: "out_for_delivery",
          deliveryFeeNaira: 300,
          items: [
            {
              productId: "product-1",
              name: "Sachet Water",
              category: "bags",
              quantity: 2,
              unitPriceNaira: 1000,
            },
          ],
          driverAssignment: {
            driverUid: "driver-1",
            driverName: "Ada Okafor",
            assignedAt: 90_000,
            assignedByUid: "vendor-user-1",
          },
        }),
      },
      driverCompensationConfigs: {
        "vendor-1__default": driverCompensationConfigSchema.parse({
          id: "vendor-1__default",
          vendorId: "vendor-1",
          scope: "vendor_default",
          bagsRule: { mode: "percentage", value: 10 },
          bottledRule: { mode: "percentage", value: 15 },
          bulkRule: { mode: "percentage", value: 5 },
          otherRule: { mode: "percentage", value: 5 },
          priorityFeeToDriver: true,
          createdAt: 1,
          updatedAt: 1,
        }),
      },
    });

    useMockDb(dbState);

    const delivered = await confirmDriverDelivery(
      "order-1",
      "driver-1",
      "  Chinedu  ",
      "  Left at reception  "
    );

    expect(delivered).toMatchObject({
      status: "delivered",
      deliveredAt: 95_000,
      deliveryProof: {
        confirmedAt: 95_000,
        confirmedByUid: "driver-1",
        recipientName: "Chinedu",
        note: "Left at reception",
      },
      driverPayout: {
        amountNaira: 500,
        status: "accrued",
        source: "vendor_default",
        calculatedAt: 95_000,
      },
    });
    expect(delivered.executionEvents.at(-1)).toMatchObject({
      type: "delivered",
      actorRole: "driver",
      actorUid: "driver-1",
      occurredAt: 95_000,
      recipientName: "Chinedu",
      note: "Left at reception",
    });
    expect(payoutLedgerMock.tryRecordCommissionAccrued).toHaveBeenCalledWith(
      expect.objectContaining({ status: "out_for_delivery" }),
      expect.objectContaining({
        status: "delivered",
        driverPayout: expect.objectContaining({ amountNaira: 500 }),
      })
    );

    nowSpy.mockRestore();
  });

  it("opens a delivery exception when the assigned driver reports a failed attempt", async () => {
    const nowSpy = vi.spyOn(Date, "now").mockReturnValue(96_000);
    const dbState = createMockDb({
      orders: {
        "order-1": buildOrder({
          id: "order-1",
          status: "out_for_delivery",
          driverAssignment: {
            driverUid: "driver-1",
            driverName: "Ada Okafor",
            assignedAt: 90_000,
            assignedByUid: "vendor-user-1",
          },
        }),
      },
    });

    useMockDb(dbState);

    const updated = await reportDriverDeliveryFailedAttempt(
      "order-1",
      "driver-1",
      "  Customer unreachable  "
    );

    expect(updated.deliveryException).toEqual({
      state: "open",
      openedAt: 96_000,
      updatedAt: 96_000,
    });
    expect(updated.executionEvents.at(-1)).toMatchObject({
      type: "delivery_failed_attempt",
      actorRole: "driver",
      actorUid: "driver-1",
      note: "Customer unreachable",
      occurredAt: 96_000,
    });

    nowSpy.mockRestore();
  });
});
