import {
  addDays,
  addMonths,
  addWeeks,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import {
  customerPreferencesSchema,
  driverProfileSchema,
  orderSchema,
  productSchema,
  userProfileSchema,
  vendorProfileSchema,
  type DriverProfile,
  type Order,
  type OrderItem,
  type Product,
  type UserProfile,
  type VendorProfile,
} from "@/lib/domain/schemas";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import {
  ORDER_ACTIVE_STATUSES,
  getOrderStatusLabel,
  getPaymentMethodLabel,
} from "@/lib/orders/status";
import type {
  AdminAnalyticsPayload,
  AdminCategoryDistribution,
  AdminMetricPoint,
  AdminPaymentDistribution,
  AdminStatusDistribution,
  AdminVendorRankingRecord,
  CustomerTier,
} from "@/lib/admin/ops-types";
import { measurePerf } from "@/lib/observability/perf";
import { paginateArray } from "@/lib/pagination";

const DAILY_POINTS = 7;
const WEEKLY_POINTS = 6;
const MONTHLY_POINTS = 6;

function getDisplayName(
  profile: Partial<UserProfile> | null,
  fallbackUid: string,
  fallbackLabel: string
) {
  const firstName = typeof profile?.firstName === "string" ? profile.firstName.trim() : "";
  const lastName = typeof profile?.lastName === "string" ? profile.lastName.trim() : "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

  if (fullName) {
    return fullName;
  }

  if (typeof profile?.email === "string" && profile.email.trim().length > 0) {
    return profile.email;
  }

  return `${fallbackLabel} ${fallbackUid.slice(0, 6)}`;
}

function getVendorName(vendor: VendorProfile | null, vendorId: string) {
  if (vendor?.businessName) {
    return vendor.businessName;
  }

  return `Vendor ${vendorId.slice(0, 6)}`;
}

function getBillableOrders(orders: Order[]) {
  return orders.filter((order) => order.status !== "cancelled");
}

function sumOrderRevenue(orders: Order[]) {
  return getBillableOrders(orders).reduce((sum, order) => sum + order.totalNaira, 0);
}

function buildTimeSeries(orders: Order[], period: "days" | "weeks" | "months"): AdminMetricPoint[] {
  const now = new Date();

  if (period === "days") {
    return Array.from({ length: DAILY_POINTS }, (_, index) => {
      const offset = DAILY_POINTS - index - 1;
      const bucketStart = startOfDay(subDays(now, offset));
      const bucketEnd = addDays(bucketStart, 1);
      const bucketOrders = orders.filter(
        (order) => order.createdAt >= bucketStart.getTime() && order.createdAt < bucketEnd.getTime()
      );

      return {
        name: format(bucketStart, "EEE"),
        revenueNaira: sumOrderRevenue(bucketOrders),
        orders: bucketOrders.length,
      };
    });
  }

  if (period === "weeks") {
    return Array.from({ length: WEEKLY_POINTS }, (_, index) => {
      const offset = WEEKLY_POINTS - index - 1;
      const bucketStart = startOfWeek(subWeeks(now, offset), { weekStartsOn: 1 });
      const bucketEnd = addWeeks(bucketStart, 1);
      const bucketOrders = orders.filter(
        (order) => order.createdAt >= bucketStart.getTime() && order.createdAt < bucketEnd.getTime()
      );

      return {
        name: format(bucketStart, "dd MMM"),
        revenueNaira: sumOrderRevenue(bucketOrders),
        orders: bucketOrders.length,
      };
    });
  }

  return Array.from({ length: MONTHLY_POINTS }, (_, index) => {
    const offset = MONTHLY_POINTS - index - 1;
    const bucketStart = startOfMonth(subMonths(now, offset));
    const bucketEnd = addMonths(bucketStart, 1);
    const bucketOrders = orders.filter(
      (order) => order.createdAt >= bucketStart.getTime() && order.createdAt < bucketEnd.getTime()
    );

    return {
      name: format(bucketStart, "MMM"),
      revenueNaira: sumOrderRevenue(bucketOrders),
      orders: bucketOrders.length,
    };
  });
}

function buildCategoryDistribution(products: Product[]): AdminCategoryDistribution[] {
  const activeProducts = products.filter((product) => product.isActive);
  const totalActiveProducts = activeProducts.length;
  const categoryCounts = new Map<string, number>();

  activeProducts.forEach((product) => {
    categoryCounts.set(product.category, (categoryCounts.get(product.category) ?? 0) + 1);
  });

  return [...categoryCounts.entries()]
    .map(([name, count]) => ({
      name,
      count,
      value:
        totalActiveProducts > 0
          ? Math.round((count / totalActiveProducts) * 100)
          : 0,
    }))
    .sort((left, right) => right.count - left.count);
}

function buildStatusDistribution(orders: Order[]): AdminStatusDistribution[] {
  const statuses = [
    "pending",
    "accepted",
    "preparing",
    "out_for_delivery",
    "delivered",
    "cancelled",
  ] as const;

  return statuses.map((status) => ({
    status,
    label: getOrderStatusLabel(status),
    count: orders.filter((order) => order.status === status).length,
  }));
}

function buildPaymentDistribution(orders: Order[]): AdminPaymentDistribution[] {
  const methods = ["cod", "manual_transfer"] as const;

  return methods.map((method) => ({
    method,
    label: getPaymentMethodLabel(method),
    count: orders.filter((order) => order.paymentMethod === method).length,
  }));
}

function buildItemSummary(items: OrderItem[]) {
  const labels = items.slice(0, 2).map((item) => `${item.quantity}x ${item.name}`);
  if (items.length <= 2) {
    return labels.join(", ");
  }

  return `${labels.join(", ")} +${items.length - 2} more`;
}

function getCustomerTier(orderCount: number, totalSpentNaira: number): CustomerTier {
  if (totalSpentNaira >= 100000 || orderCount >= 20) {
    return "Gold";
  }

  if (totalSpentNaira >= 30000 || orderCount >= 8) {
    return "Silver";
  }

  return "Bronze";
}

type AdminAnalyticsData = {
  customerCount: number;
  vendors: VendorProfile[];
  drivers: DriverProfile[];
  orders: Order[];
  products: Product[];
  vendorOwnerProfilesByUid: Map<string, UserProfile | null>;
};

async function loadUsersByIds(userIds: string[]) {
  const uniqueIds = [...new Set(userIds.filter(Boolean))];
  const db = getFirebaseAdminDb();
  const entries = await Promise.all(
    uniqueIds.map(async (uid) => {
      const snapshot = await db.collection("users").doc(uid).get();
      const parsed = userProfileSchema.safeParse(snapshot.data());
      return [uid, parsed.success ? parsed.data : null] as const;
    })
  );

  return new Map(entries);
}

async function loadVendorsByIds(vendorIds: string[]) {
  const uniqueIds = [...new Set(vendorIds.filter(Boolean))];
  const db = getFirebaseAdminDb();
  const entries = await Promise.all(
    uniqueIds.map(async (vendorId) => {
      const snapshot = await db.collection("vendors").doc(vendorId).get();
      const parsed = vendorProfileSchema.safeParse(snapshot.data());
      return [vendorId, parsed.success ? parsed.data : null] as const;
    })
  );

  return new Map(entries);
}

async function loadCustomerPreferencesByIds(customerUids: string[]) {
  const uniqueIds = [...new Set(customerUids.filter(Boolean))];
  const db = getFirebaseAdminDb();
  const entries = await Promise.all(
    uniqueIds.map(async (customerUid) => {
      const snapshot = await db.collection("customerPreferences").doc(customerUid).get();
      const parsed = customerPreferencesSchema.safeParse(snapshot.data());
      return [customerUid, parsed.success ? parsed.data : null] as const;
    })
  );

  return new Map(entries);
}

async function loadOrdersByCustomerIds(customerUids: string[]) {
  const uniqueIds = [...new Set(customerUids.filter(Boolean))];
  if (uniqueIds.length === 0) {
    return [] as Order[];
  }

  const db = getFirebaseAdminDb();
  const chunks = Array.from({ length: Math.ceil(uniqueIds.length / 10) }, (_, index) =>
    uniqueIds.slice(index * 10, index * 10 + 10)
  );
  const snapshots = await Promise.all(
    chunks.map((chunk) => db.collection("orders").where("customerUid", "in", chunk).get())
  );

  return snapshots.flatMap((snapshot) =>
    snapshot.docs.map((doc) => orderSchema.parse(doc.data()))
  );
}

async function loadAdminAnalyticsData(): Promise<AdminAnalyticsData> {
  return measurePerf("admin.analytics.load-data", async () => {
    const db = getFirebaseAdminDb();
    const [
      customerUsersSnapshot,
      vendorsSnapshot,
      driversSnapshot,
      ordersSnapshot,
      productsSnapshot,
    ] = await Promise.all([
      db.collection("users").where("role", "==", "customer").get(),
      db.collection("vendors").get(),
      db.collection("drivers").get(),
      db.collection("orders").get(),
      db.collection("products").get(),
    ]);

    const vendors = vendorsSnapshot.docs.map((doc) => vendorProfileSchema.parse(doc.data()));
    const ownerProfiles = await loadUsersByIds(vendors.map((vendor) => vendor.ownerUid));

    return {
      customerCount: customerUsersSnapshot.docs.length,
      vendors,
      drivers: driversSnapshot.docs.map((doc) => driverProfileSchema.parse(doc.data())),
      orders: ordersSnapshot.docs
        .map((doc) => orderSchema.parse(doc.data()))
        .sort((left, right) => right.createdAt - left.createdAt),
      products: productsSnapshot.docs.map((doc) => productSchema.parse(doc.data())),
      vendorOwnerProfilesByUid: ownerProfiles,
    };
  });
}

function buildVendorRankings(baseData: {
  vendors: VendorProfile[];
  products: Product[];
  orders: Order[];
  vendorOwnerProfilesByUid: Map<string, UserProfile | null>;
}): AdminVendorRankingRecord[] {
  const currentMonthStart = startOfMonth(new Date()).getTime();
  const metricsByVendor = new Map<
    string,
    {
      productCount: number;
      activeProductCount: number;
      totalOrders: number;
      revenueNaira: number;
      monthlyRevenueNaira: number;
    }
  >();

  baseData.products.forEach((product) => {
    const current = metricsByVendor.get(product.vendorId) ?? {
      productCount: 0,
      activeProductCount: 0,
      totalOrders: 0,
      revenueNaira: 0,
      monthlyRevenueNaira: 0,
    };

    current.productCount += 1;
    if (product.isActive) {
      current.activeProductCount += 1;
    }

    metricsByVendor.set(product.vendorId, current);
  });

  baseData.orders.forEach((order) => {
    const current = metricsByVendor.get(order.vendorId) ?? {
      productCount: 0,
      activeProductCount: 0,
      totalOrders: 0,
      revenueNaira: 0,
      monthlyRevenueNaira: 0,
    };

    current.totalOrders += 1;
    if (order.status !== "cancelled") {
      current.revenueNaira += order.totalNaira;
      if (order.createdAt >= currentMonthStart) {
        current.monthlyRevenueNaira += order.totalNaira;
      }
    }

    metricsByVendor.set(order.vendorId, current);
  });

  return baseData.vendors
    .map((vendor) => {
      const ownerProfile = baseData.vendorOwnerProfilesByUid.get(vendor.ownerUid) ?? null;
      const metrics = metricsByVendor.get(vendor.vendorId) ?? {
        productCount: 0,
        activeProductCount: 0,
        totalOrders: 0,
        revenueNaira: 0,
        monthlyRevenueNaira: 0,
      };

      return {
        vendorId: vendor.vendorId,
        businessName: vendor.businessName,
        ownerName: getDisplayName(ownerProfile, vendor.ownerUid, "Vendor"),
        status: vendor.status,
        totalOrders: metrics.totalOrders,
        revenueNaira: metrics.revenueNaira,
        monthlyRevenueNaira: metrics.monthlyRevenueNaira,
        productCount: metrics.productCount,
        activeProductCount: metrics.activeProductCount,
      };
    })
    .sort((left, right) => {
      if (right.monthlyRevenueNaira !== left.monthlyRevenueNaira) {
        return right.monthlyRevenueNaira - left.monthlyRevenueNaira;
      }

      if (right.revenueNaira !== left.revenueNaira) {
        return right.revenueNaira - left.revenueNaira;
      }

      return right.totalOrders - left.totalOrders;
    });
}

export async function getAdminAnalyticsPayload(): Promise<AdminAnalyticsPayload> {
  return measurePerf("admin.analytics.build-payload", async () => {
    const analyticsData = await loadAdminAnalyticsData();
    const billableOrders = getBillableOrders(analyticsData.orders);
    const deliveredOrders = analyticsData.orders.filter((order) => order.status === "delivered");
    const currentMonthStart = startOfMonth(new Date()).getTime();
    const vendorRankings = buildVendorRankings(analyticsData);
    const averageFulfillmentMinutes =
      deliveredOrders.length > 0
        ? Math.round(
            deliveredOrders.reduce((sum, order) => {
              const elapsedMs = Math.max(order.updatedAt - order.createdAt, 0);
              return sum + elapsedMs / 60000;
            }, 0) / deliveredOrders.length
          )
        : null;

    return {
      summary: {
        grossRevenueNaira: billableOrders.reduce((sum, order) => sum + order.totalNaira, 0),
        monthlyRevenueNaira: billableOrders
          .filter((order) => order.createdAt >= currentMonthStart)
          .reduce((sum, order) => sum + order.totalNaira, 0),
        totalOrders: analyticsData.orders.length,
        activeOrders: analyticsData.orders.filter((order) => ORDER_ACTIVE_STATUSES.has(order.status))
          .length,
        deliveredOrders: deliveredOrders.length,
        cancelledOrders: analyticsData.orders.filter((order) => order.status === "cancelled").length,
        averageOrderValueNaira:
          billableOrders.length > 0
            ? Math.round(
                billableOrders.reduce((sum, order) => sum + order.totalNaira, 0) /
                  billableOrders.length
              )
            : 0,
        averageFulfillmentMinutes,
        totalCustomers: analyticsData.customerCount,
        activeCustomers: new Set(analyticsData.orders.map((order) => order.customerUid)).size,
        totalDrivers: analyticsData.drivers.length,
        activeDrivers: analyticsData.drivers.filter((driver) => driver.status === "active").length,
        totalVendors: analyticsData.vendors.length,
        approvedVendors: analyticsData.vendors.filter((vendor) => vendor.status === "approved").length,
      },
      charts: {
        days: buildTimeSeries(analyticsData.orders, "days"),
        weeks: buildTimeSeries(analyticsData.orders, "weeks"),
        months: buildTimeSeries(analyticsData.orders, "months"),
      },
      categoryDistribution: buildCategoryDistribution(analyticsData.products),
      statusDistribution: buildStatusDistribution(analyticsData.orders),
      paymentDistribution: buildPaymentDistribution(analyticsData.orders),
      vendorRankings,
    };
  });
}

export async function listAdminOrderRecords(options?: { limit?: number; cursor?: string | null }) {
  const ordersSnapshot = await getFirebaseAdminDb().collection("orders").get();
  const orders = ordersSnapshot.docs
    .map((doc) => orderSchema.parse(doc.data()))
    .sort((left, right) => right.createdAt - left.createdAt);
  const paginatedOrders = paginateArray(orders, {
    limit: options?.limit,
    cursor: options?.cursor,
    maxLimit: 100,
  });
  const usersByUid = await loadUsersByIds(paginatedOrders.items.map((order) => order.customerUid));
  const vendorsById = await loadVendorsByIds(paginatedOrders.items.map((order) => order.vendorId));

  const records = paginatedOrders.items.map((order) => {
    const customerProfile = usersByUid.get(order.customerUid) ?? null;
    const vendorProfile = vendorsById.get(order.vendorId) ?? null;

    return {
      id: order.id,
      vendorId: order.vendorId,
      vendorName: order.vendorName ?? getVendorName(vendorProfile, order.vendorId),
      customerUid: order.customerUid,
      customerName: getDisplayName(customerProfile, order.customerUid, "Customer"),
      customerEmail:
        typeof customerProfile?.email === "string" ? customerProfile.email : undefined,
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      itemsSummary: buildItemSummary(order.items),
      totalNaira: order.totalNaira,
      paymentMethod: order.paymentMethod,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  });

  return {
    ...paginatedOrders,
    items: records,
  };
}

export async function listAdminCustomerRecords(options?: {
  limit?: number;
  cursor?: string | null;
}) {
  const customerSnapshot = await getFirebaseAdminDb()
    .collection("users")
    .where("role", "==", "customer")
    .get();
  const customers = customerSnapshot.docs
    .map((doc) => userProfileSchema.parse(doc.data()))
    .sort((left, right) => right.createdAt - left.createdAt);
  const paginatedCustomers = paginateArray(customers, {
    limit: options?.limit,
    cursor: options?.cursor,
    maxLimit: 100,
  });
  const pageCustomerUids = paginatedCustomers.items.map((customer) => customer.uid);
  const [orders, preferencesByCustomerUid] = await Promise.all([
    loadOrdersByCustomerIds(pageCustomerUids),
    loadCustomerPreferencesByIds(pageCustomerUids),
  ]);
  const customerMetrics = new Map<
    string,
    {
      orderCount: number;
      activeOrderCount: number;
      deliveredOrders: number;
      cancelledOrders: number;
      totalSpentNaira: number;
      lastOrderAt: number | null;
    }
  >();

  orders.forEach((order) => {
    const current = customerMetrics.get(order.customerUid) ?? {
      orderCount: 0,
      activeOrderCount: 0,
      deliveredOrders: 0,
      cancelledOrders: 0,
      totalSpentNaira: 0,
      lastOrderAt: null,
    };

    current.orderCount += 1;
    if (ORDER_ACTIVE_STATUSES.has(order.status)) {
      current.activeOrderCount += 1;
    }
    if (order.status === "delivered") {
      current.deliveredOrders += 1;
    }
    if (order.status === "cancelled") {
      current.cancelledOrders += 1;
    } else {
      current.totalSpentNaira += order.totalNaira;
    }
    current.lastOrderAt = current.lastOrderAt
      ? Math.max(current.lastOrderAt, order.createdAt)
      : order.createdAt;

    customerMetrics.set(order.customerUid, current);
  });

  const records = paginatedCustomers.items
    .map((customer) => {
      const metrics = customerMetrics.get(customer.uid) ?? {
        orderCount: 0,
        activeOrderCount: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        totalSpentNaira: 0,
        lastOrderAt: null,
      };
      const preferences = preferencesByCustomerUid.get(customer.uid) ?? null;

      return {
        uid: customer.uid,
        name: getDisplayName(customer, customer.uid, "Customer"),
        email: customer.email,
        phone: customer.phone,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
        orderCount: metrics.orderCount,
        activeOrderCount: metrics.activeOrderCount,
        deliveredOrders: metrics.deliveredOrders,
        cancelledOrders: metrics.cancelledOrders,
        totalSpentNaira: metrics.totalSpentNaira,
        savedAddressesCount: preferences?.addresses.length ?? 0,
        preferredPaymentMethod: preferences?.preferredPaymentMethod ?? null,
        lastOrderAt: metrics.lastOrderAt,
        tier: getCustomerTier(metrics.orderCount, metrics.totalSpentNaira),
      };
    })
    .sort((left, right) => {
      if (right.totalSpentNaira !== left.totalSpentNaira) {
        return right.totalSpentNaira - left.totalSpentNaira;
      }

      return right.createdAt - left.createdAt;
    });

  return {
    ...paginatedCustomers,
    items: records,
  };
}

export async function listAdminDriverRecords(options?: { limit?: number; cursor?: string | null }) {
  const driverSnapshot = await getFirebaseAdminDb().collection("drivers").get();
  const drivers = driverSnapshot.docs.map((doc) => driverProfileSchema.parse(doc.data()));
  const statusOrder = {
    active: 0,
    pending: 1,
    inactive: 2,
  } satisfies Record<DriverProfile["status"], number>;

  const sortedDrivers = [...drivers].sort((left, right) => {
    const statusDiff = statusOrder[left.status] - statusOrder[right.status];
    if (statusDiff !== 0) {
      return statusDiff;
    }

    return right.updatedAt - left.updatedAt;
  });
  const paginatedDrivers = paginateArray(sortedDrivers, {
    limit: options?.limit,
    cursor: options?.cursor,
    maxLimit: 100,
  });
  const usersByUid = await loadUsersByIds(paginatedDrivers.items.map((driver) => driver.uid));
  const vendorsById = await loadVendorsByIds(paginatedDrivers.items.map((driver) => driver.vendorId));

  const records = paginatedDrivers.items
    .map((driver) => {
      const userProfile = usersByUid.get(driver.uid) ?? null;
      const vendorProfile = vendorsById.get(driver.vendorId) ?? null;

      return {
        uid: driver.uid,
        name: getDisplayName(userProfile, driver.uid, "Driver"),
        email:
          typeof userProfile?.email === "string" ? userProfile.email : `${driver.uid}@unknown`,
        phone:
          typeof userProfile?.phone === "string" ? userProfile.phone : undefined,
        vendorId: driver.vendorId,
        vendorName: getVendorName(vendorProfile, driver.vendorId),
        status: driver.status,
        vehicleType: driver.vehicleType,
        licensePlate: driver.licensePlate,
        loadedUnits: driver.loadedUnits,
        createdAt: driver.createdAt,
        updatedAt: driver.updatedAt,
      };
    });

  return {
    ...paginatedDrivers,
    items: records,
  };
}
