import type { OrderStatus } from "@/lib/domain/schemas";

export type VendorMetricPoint = {
  name: string;
  revenue: number;
  orders: number;
};

export type VendorCategoryInsight = {
  name: string;
  value: number;
};

export type VendorInventoryAlert = {
  id: string;
  name: string;
  category: string;
  stock: number;
  isOutOfStock: boolean;
};

export type VendorRecentOrder = {
  id: string;
  customerName: string;
  itemCount: number;
  itemsSummary: string;
  totalNaira: number;
  status: OrderStatus;
  createdAt: number;
};

export type VendorOperationalSummary = {
  totalOrders: number;
  activeOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  uniqueCustomers: number;
  fulfillmentRate: number;
  grossRevenueNaira: number;
  monthlyRevenueNaira: number;
  averageOrderValueNaira: number;
  averageFulfillmentMinutes: number | null;
  totalProducts: number;
  activeProducts: number;
  totalStockUnits: number;
  lowStockCount: number;
};

export type VendorDashboardSummary = {
  profile: {
    businessName: string;
    status: "pending" | "approved" | "rejected";
    submittedAt?: number;
    reviewedAt?: number;
    reviewNotes?: string;
  } | null;
  summary: VendorOperationalSummary;
  recentOrders: VendorRecentOrder[];
  inventoryAlerts: VendorInventoryAlert[];
  charts: {
    days: VendorMetricPoint[];
    weeks: VendorMetricPoint[];
    months: VendorMetricPoint[];
  };
  categoryInsights: VendorCategoryInsight[];
};
