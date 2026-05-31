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
  orderSchema,
  productSchema,
  userProfileSchema,
  vendorProfileSchema,
  type Product,
  type UserProfile,
} from "@/lib/domain/schemas";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { logBroadReadWarning, measurePerf } from "@/lib/observability/perf";
import { ORDER_ACTIVE_STATUSES } from "@/lib/orders/status";
import type { VendorOrderRecord } from "@/lib/orders/vendor-order";
import type {
  VendorDashboardSummary,
  VendorMetricPoint,
  VendorOperationalSummary,
} from "@/lib/vendor/summary-types";

const DAILY_POINTS = 7;
const WEEKLY_POINTS = 6;
const MONTHLY_POINTS = 6;
const LOW_STOCK_THRESHOLD = 50;
const VENDOR_PRODUCTS_BROAD_READ_WARNING_DOCS = 250;
const VENDOR_ORDERS_BROAD_READ_WARNING_DOCS = 500;

type SummaryOrder = {
  status: "pending" | "accepted" | "preparing" | "out_for_delivery" | "delivered" | "cancelled";
  totalNaira: number;
  createdAt: number;
  updatedAt: number;
  customerUid: string;
};

function createEmptySummary(): VendorOperationalSummary {
  return {
    totalOrders: 0,
    activeOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    uniqueCustomers: 0,
    fulfillmentRate: 0,
    grossRevenueNaira: 0,
    monthlyRevenueNaira: 0,
    averageOrderValueNaira: 0,
    averageFulfillmentMinutes: null,
    totalProducts: 0,
    activeProducts: 0,
    totalStockUnits: 0,
    lowStockCount: 0,
  };
}

function createEmptyDashboardSummary(): VendorDashboardSummary {
  return {
    profile: null,
    summary: createEmptySummary(),
    recentOrders: [],
    inventoryAlerts: [],
    charts: {
      days: [],
      weeks: [],
      months: [],
    },
    categoryInsights: [],
  };
}

function getBillableOrders<T extends SummaryOrder>(orders: T[]) {
  return orders.filter((order) => order.status !== "cancelled");
}

function sumOrderRevenue<T extends SummaryOrder>(orders: T[]) {
  return getBillableOrders(orders).reduce((sum, order) => sum + order.totalNaira, 0);
}

function buildTimeSeries(
  orders: SummaryOrder[],
  period: "days" | "weeks" | "months"
): VendorMetricPoint[] {
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
        revenue: sumOrderRevenue(bucketOrders),
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
        revenue: sumOrderRevenue(bucketOrders),
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
      revenue: sumOrderRevenue(bucketOrders),
      orders: bucketOrders.length,
    };
  });
}

function buildCategoryInsights(products: Product[]) {
  const activeProducts = products.filter((product) => product.isActive);
  const categoryCounts = new Map<string, number>();

  activeProducts.forEach((product) => {
    categoryCounts.set(product.category, (categoryCounts.get(product.category) ?? 0) + 1);
  });

  return [...categoryCounts.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((left, right) => right.value - left.value);
}

function buildInventoryAlerts(products: Product[]) {
  return products
    .filter((product) => product.isActive && product.stock <= LOW_STOCK_THRESHOLD)
    .sort((left, right) => left.stock - right.stock)
    .slice(0, 5)
    .map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category,
      stock: product.stock,
      isOutOfStock: product.stock === 0,
    }));
}

function buildRecentOrders(orders: VendorOrderRecord[]) {
  return orders.slice(0, 5).map((order) => ({
    id: order.id,
    customerName: order.customerName,
    itemCount: order.items.reduce((count, item) => count + item.quantity, 0),
    itemsSummary: order.items.map((item) => `${item.quantity}x ${item.name}`).join(", "),
    totalNaira: order.totalNaira,
    status: order.status,
    createdAt: order.createdAt,
  }));
}

async function loadVendorProfile(vendorId: string) {
  const snapshot = await getFirebaseAdminDb().collection("vendors").doc(vendorId).get();
  if (!snapshot.exists) {
    return null;
  }

  return vendorProfileSchema.parse(snapshot.data());
}

async function loadVendorProducts(vendorId: string) {
  let documentCount = 0;

  return measurePerf("vendor.summary.load-products", async () => {
    const snapshot = await getFirebaseAdminDb()
      .collection("products")
      .where("vendorId", "==", vendorId)
      .get();
    documentCount = snapshot.size;
    logBroadReadWarning(
      "vendor.summary.load-products",
      documentCount,
      VENDOR_PRODUCTS_BROAD_READ_WARNING_DOCS,
      { vendorId }
    );

    return snapshot.docs.map((doc) => productSchema.parse(doc.data()));
  }, () => ({ vendorId, documents: documentCount }));
}

async function loadVendorOrders(vendorId: string) {
  let documentCount = 0;

  return measurePerf("vendor.summary.load-orders", async () => {
    const snapshot = await getFirebaseAdminDb()
      .collection("orders")
      .where("vendorId", "==", vendorId)
      .get();
    documentCount = snapshot.size;
    logBroadReadWarning(
      "vendor.summary.load-orders",
      documentCount,
      VENDOR_ORDERS_BROAD_READ_WARNING_DOCS,
      { vendorId }
    );

    return snapshot.docs
      .map((doc) => orderSchema.parse(doc.data()))
      .sort((left, right) => right.createdAt - left.createdAt);
  }, () => ({ vendorId, documents: documentCount }));
}

function getCustomerName(profile: Partial<UserProfile> | null, fallbackUid: string) {
  const firstName = typeof profile?.firstName === "string" ? profile.firstName.trim() : "";
  const lastName = typeof profile?.lastName === "string" ? profile.lastName.trim() : "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

  if (fullName) {
    return fullName;
  }

  if (typeof profile?.email === "string" && profile.email.trim().length > 0) {
    return profile.email;
  }

  return `Customer ${fallbackUid.slice(0, 6)}`;
}

async function loadCustomerProfiles(customerUids: string[]) {
  const uniqueCustomerUids = [...new Set(customerUids.filter(Boolean))];
  const db = getFirebaseAdminDb();
  const entries = await Promise.all(
    uniqueCustomerUids.map(async (uid) => {
      const snapshot = await db.collection("users").doc(uid).get();
      const parsed = userProfileSchema.safeParse(snapshot.data());
      return [uid, parsed.success ? parsed.data : null] as const;
    })
  );

  return new Map(entries);
}

export async function getVendorDashboardSummary(vendorId: string): Promise<VendorDashboardSummary> {
  return measurePerf("vendor.summary.build-payload", async () => {
    const [profile, orders, products] = await Promise.all([
      loadVendorProfile(vendorId),
      loadVendorOrders(vendorId),
      loadVendorProducts(vendorId),
    ]);

    if (!profile) {
      return createEmptyDashboardSummary();
    }

    const billableOrders = getBillableOrders(orders);
    const now = new Date();
    const currentMonthStart = startOfMonth(now).getTime();
    const currentMonthRevenue = billableOrders
      .filter((order) => order.createdAt >= currentMonthStart)
      .reduce((sum, order) => sum + order.totalNaira, 0);
    const deliveredOrders = orders.filter((order) => order.status === "delivered");
    const averageFulfillmentMinutes =
      deliveredOrders.length > 0
        ? deliveredOrders.reduce((sum, order) => {
            const elapsedMs = Math.max(order.updatedAt - order.createdAt, 0);
            return sum + elapsedMs / 60000;
          }, 0) / deliveredOrders.length
        : null;
    const activeProducts = products.filter((product) => product.isActive);
    const recentOrderBase = orders.slice(0, 5);
    const customerProfiles = await loadCustomerProfiles(
      recentOrderBase.map((order) => order.customerUid)
    );
    const recentOrders: VendorOrderRecord[] = recentOrderBase.map((order) => {
      const customerProfile = customerProfiles.get(order.customerUid) ?? null;

      return {
        ...order,
        customerName: getCustomerName(customerProfile, order.customerUid),
        customerEmail:
          typeof customerProfile?.email === "string" ? customerProfile.email : undefined,
        customerPhone:
          typeof customerProfile?.phone === "string" ? customerProfile.phone : undefined,
      };
    });

    return {
      profile: {
        businessName: profile.businessName,
        status: profile.status,
        submittedAt: profile.submittedAt,
        reviewedAt: profile.reviewedAt,
        reviewNotes: profile.reviewNotes,
      },
      summary: {
        totalOrders: orders.length,
        activeOrders: orders.filter((order) => ORDER_ACTIVE_STATUSES.has(order.status)).length,
        deliveredOrders: deliveredOrders.length,
        cancelledOrders: orders.filter((order) => order.status === "cancelled").length,
        uniqueCustomers: new Set(orders.map((order) => order.customerUid)).size,
        fulfillmentRate:
          orders.length > 0 ? Math.round((deliveredOrders.length / orders.length) * 100) : 0,
        grossRevenueNaira: billableOrders.reduce((sum, order) => sum + order.totalNaira, 0),
        monthlyRevenueNaira: currentMonthRevenue,
        averageOrderValueNaira:
          billableOrders.length > 0
            ? Math.round(
                billableOrders.reduce((sum, order) => sum + order.totalNaira, 0) /
                  billableOrders.length
              )
            : 0,
        averageFulfillmentMinutes:
          averageFulfillmentMinutes !== null ? Math.round(averageFulfillmentMinutes) : null,
        totalProducts: products.length,
        activeProducts: activeProducts.length,
        totalStockUnits: activeProducts.reduce((sum, product) => sum + product.stock, 0),
        lowStockCount: activeProducts.filter((product) => product.stock <= LOW_STOCK_THRESHOLD)
          .length,
      },
      recentOrders: buildRecentOrders(recentOrders),
      inventoryAlerts: buildInventoryAlerts(products),
      charts: {
        days: buildTimeSeries(orders, "days"),
        weeks: buildTimeSeries(orders, "weeks"),
        months: buildTimeSeries(orders, "months"),
      },
      categoryInsights: buildCategoryInsights(products),
    };
  }, { vendorId });
}
