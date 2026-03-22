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
  type CustomerPreferences,
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
  AdminCustomerRecord,
  AdminDriverRecord,
  AdminMetricPoint,
  AdminOrderRecord,
  AdminPaymentDistribution,
  AdminStatusDistribution,
  AdminVendorRankingRecord,
  CustomerTier,
} from "@/lib/admin/ops-types";

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

type AdminBaseData = {
  users: UserProfile[];
  vendors: VendorProfile[];
  drivers: DriverProfile[];
  orders: Order[];
  products: Product[];
  customerPreferences: CustomerPreferences[];
  usersByUid: Map<string, UserProfile>;
  vendorsById: Map<string, VendorProfile>;
  preferencesByCustomerUid: Map<string, CustomerPreferences>;
};

async function loadAdminBaseData(): Promise<AdminBaseData> {
  const db = getFirebaseAdminDb();
  const [
    usersSnapshot,
    vendorsSnapshot,
    driversSnapshot,
    ordersSnapshot,
    productsSnapshot,
    preferencesSnapshot,
  ] = await Promise.all([
    db.collection("users").get(),
    db.collection("vendors").get(),
    db.collection("drivers").get(),
    db.collection("orders").get(),
    db.collection("products").get(),
    db.collection("customerPreferences").get(),
  ]);

  const users = usersSnapshot.docs.map((doc) => userProfileSchema.parse(doc.data()));
  const vendors = vendorsSnapshot.docs.map((doc) => vendorProfileSchema.parse(doc.data()));
  const drivers = driversSnapshot.docs.map((doc) => driverProfileSchema.parse(doc.data()));
  const orders = ordersSnapshot.docs
    .map((doc) => orderSchema.parse(doc.data()))
    .sort((left, right) => right.createdAt - left.createdAt);
  const products = productsSnapshot.docs.map((doc) => productSchema.parse(doc.data()));
  const customerPreferences = preferencesSnapshot.docs.map((doc) =>
    customerPreferencesSchema.parse(doc.data())
  );

  return {
    users,
    vendors,
    drivers,
    orders,
    products,
    customerPreferences,
    usersByUid: new Map(users.map((user) => [user.uid, user])),
    vendorsById: new Map(vendors.map((vendor) => [vendor.vendorId, vendor])),
    preferencesByCustomerUid: new Map(
      customerPreferences.map((preferences) => [preferences.customerUid, preferences])
    ),
  };
}

function buildVendorRankings(baseData: AdminBaseData): AdminVendorRankingRecord[] {
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
      const ownerProfile = baseData.usersByUid.get(vendor.ownerUid) ?? null;
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
  const baseData = await loadAdminBaseData();
  const billableOrders = getBillableOrders(baseData.orders);
  const deliveredOrders = baseData.orders.filter((order) => order.status === "delivered");
  const currentMonthStart = startOfMonth(new Date()).getTime();
  const vendorRankings = buildVendorRankings(baseData);
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
      totalOrders: baseData.orders.length,
      activeOrders: baseData.orders.filter((order) => ORDER_ACTIVE_STATUSES.has(order.status))
        .length,
      deliveredOrders: deliveredOrders.length,
      cancelledOrders: baseData.orders.filter((order) => order.status === "cancelled").length,
      averageOrderValueNaira:
        billableOrders.length > 0
          ? Math.round(
              billableOrders.reduce((sum, order) => sum + order.totalNaira, 0) /
                billableOrders.length
            )
          : 0,
      averageFulfillmentMinutes,
      totalCustomers: baseData.users.filter((user) => user.role === "customer").length,
      activeCustomers: new Set(baseData.orders.map((order) => order.customerUid)).size,
      totalDrivers: baseData.drivers.length,
      activeDrivers: baseData.drivers.filter((driver) => driver.status === "active").length,
      totalVendors: baseData.vendors.length,
      approvedVendors: baseData.vendors.filter((vendor) => vendor.status === "approved").length,
    },
    charts: {
      days: buildTimeSeries(baseData.orders, "days"),
      weeks: buildTimeSeries(baseData.orders, "weeks"),
      months: buildTimeSeries(baseData.orders, "months"),
    },
    categoryDistribution: buildCategoryDistribution(baseData.products),
    statusDistribution: buildStatusDistribution(baseData.orders),
    paymentDistribution: buildPaymentDistribution(baseData.orders),
    vendorRankings,
  };
}

export async function listAdminOrderRecords(): Promise<AdminOrderRecord[]> {
  const baseData = await loadAdminBaseData();

  return baseData.orders.map((order) => {
    const customerProfile = baseData.usersByUid.get(order.customerUid) ?? null;
    const vendorProfile = baseData.vendorsById.get(order.vendorId) ?? null;

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
}

export async function listAdminCustomerRecords(): Promise<AdminCustomerRecord[]> {
  const baseData = await loadAdminBaseData();
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

  baseData.orders.forEach((order) => {
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

  return baseData.users
    .filter((user) => user.role === "customer")
    .map((customer) => {
      const metrics = customerMetrics.get(customer.uid) ?? {
        orderCount: 0,
        activeOrderCount: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        totalSpentNaira: 0,
        lastOrderAt: null,
      };
      const preferences = baseData.preferencesByCustomerUid.get(customer.uid) ?? null;

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
}

export async function listAdminDriverRecords(): Promise<AdminDriverRecord[]> {
  const baseData = await loadAdminBaseData();
  const statusOrder = {
    active: 0,
    pending: 1,
    inactive: 2,
  } satisfies Record<DriverProfile["status"], number>;

  return baseData.drivers
    .map((driver) => {
      const userProfile = baseData.usersByUid.get(driver.uid) ?? null;
      const vendorProfile = baseData.vendorsById.get(driver.vendorId) ?? null;

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
    })
    .sort((left, right) => {
      const statusDiff = statusOrder[left.status] - statusOrder[right.status];
      if (statusDiff !== 0) {
        return statusDiff;
      }

      return right.updatedAt - left.updatedAt;
    });
}
