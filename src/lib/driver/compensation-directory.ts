import { driverProfileSchema } from "@/lib/domain/schemas";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { ORDER_ACTIVE_STATUSES } from "@/lib/orders/status";
import { listVendorOrders } from "@/lib/orders/vendor-order";

import { loadUserProfiles, getDriverDisplayName } from "@/lib/driver/compensation-shared";
import { paginateArray } from "@/lib/pagination";

export async function listVendorDrivers(
  vendorId: string,
  options?: { limit?: number; cursor?: string | null }
) {
  const db = getFirebaseAdminDb();
  const [driversSnapshot, orders] = await Promise.all([
    db.collection("drivers").where("vendorId", "==", vendorId).get(),
    listVendorOrders(vendorId),
  ]);

  const drivers = driversSnapshot.docs.map((doc) => driverProfileSchema.parse(doc.data()));
  if (drivers.length === 0) {
    return paginateArray([], { limit: options?.limit, cursor: options?.cursor, maxLimit: 50 });
  }

  const sortedDrivers = [...drivers].sort((left, right) => right.updatedAt - left.updatedAt);
  const paginatedDrivers = paginateArray(sortedDrivers, {
    limit: options?.limit,
    cursor: options?.cursor,
    maxLimit: 50,
  });
  const pageDriverUids = new Set(paginatedDrivers.items.map((driver) => driver.uid));
  const usersByUid = await loadUserProfiles(paginatedDrivers.items.map((driver) => driver.uid));
  const metricsByDriverUid = new Map<
    string,
    {
      activeOrdersCount: number;
      deliveredOrdersCount: number;
      availableBalanceNaira: number;
      requestedBalanceNaira: number;
      paidBalanceNaira: number;
    }
  >();

  for (const order of orders) {
    const driverUid = order.driverAssignment?.driverUid;
    if (!driverUid || !pageDriverUids.has(driverUid)) {
      continue;
    }

    const current = metricsByDriverUid.get(driverUid) ?? {
      activeOrdersCount: 0,
      deliveredOrdersCount: 0,
      availableBalanceNaira: 0,
      requestedBalanceNaira: 0,
      paidBalanceNaira: 0,
    };

    if (ORDER_ACTIVE_STATUSES.has(order.status)) {
      current.activeOrdersCount += 1;
    }
    if (order.status === "delivered") {
      current.deliveredOrdersCount += 1;
    }
    if (order.driverPayout?.status === "accrued") {
      current.availableBalanceNaira += order.driverPayout.amountNaira;
    }
    if (order.driverPayout?.status === "requested") {
      current.requestedBalanceNaira += order.driverPayout.amountNaira;
    }
    if (order.driverPayout?.status === "paid") {
      current.paidBalanceNaira += order.driverPayout.amountNaira;
    }

    metricsByDriverUid.set(driverUid, current);
  }

  return {
    ...paginatedDrivers,
    items: paginatedDrivers.items.map((driver) => {
      const user = usersByUid.get(driver.uid) ?? null;
      const metrics = metricsByDriverUid.get(driver.uid) ?? {
        activeOrdersCount: 0,
        deliveredOrdersCount: 0,
        availableBalanceNaira: 0,
        requestedBalanceNaira: 0,
        paidBalanceNaira: 0,
      };

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
        activeOrdersCount: metrics.activeOrdersCount,
        deliveredOrdersCount: metrics.deliveredOrdersCount,
        availableBalanceNaira: metrics.availableBalanceNaira,
        requestedBalanceNaira: metrics.requestedBalanceNaira,
        paidBalanceNaira: metrics.paidBalanceNaira,
      };
    }),
  };
}

export async function getVendorDriver(vendorId: string, driverUid: string) {
  const { items } = await listVendorDrivers(vendorId, { limit: 500 });
  return items.find((driver) => driver.uid === driverUid) ?? null;
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
