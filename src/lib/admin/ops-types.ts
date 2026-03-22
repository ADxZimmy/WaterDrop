import type {
  DriverProfile,
  OrderStatus,
  PaymentMethod,
  VendorProfile,
} from "@/lib/domain/schemas";

export type AdminMetricPoint = {
  name: string;
  revenueNaira: number;
  orders: number;
};

export type AdminCategoryDistribution = {
  name: string;
  value: number;
  count: number;
};

export type AdminStatusDistribution = {
  status: OrderStatus;
  label: string;
  count: number;
};

export type AdminPaymentDistribution = {
  method: PaymentMethod;
  label: string;
  count: number;
};

export type AdminVendorRankingRecord = {
  vendorId: string;
  businessName: string;
  ownerName: string;
  status: VendorProfile["status"];
  totalOrders: number;
  revenueNaira: number;
  monthlyRevenueNaira: number;
  productCount: number;
  activeProductCount: number;
};

export type AdminAnalyticsSummary = {
  grossRevenueNaira: number;
  monthlyRevenueNaira: number;
  totalOrders: number;
  activeOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  averageOrderValueNaira: number;
  averageFulfillmentMinutes: number | null;
  totalCustomers: number;
  activeCustomers: number;
  totalDrivers: number;
  activeDrivers: number;
  totalVendors: number;
  approvedVendors: number;
};

export type AdminAnalyticsPayload = {
  summary: AdminAnalyticsSummary;
  charts: {
    days: AdminMetricPoint[];
    weeks: AdminMetricPoint[];
    months: AdminMetricPoint[];
  };
  categoryDistribution: AdminCategoryDistribution[];
  statusDistribution: AdminStatusDistribution[];
  paymentDistribution: AdminPaymentDistribution[];
  vendorRankings: AdminVendorRankingRecord[];
};

export type AdminOrderRecord = {
  id: string;
  vendorId: string;
  vendorName: string;
  customerUid: string;
  customerName: string;
  customerEmail?: string;
  itemCount: number;
  itemsSummary: string;
  totalNaira: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: number;
  updatedAt: number;
};

export type CustomerTier = "Gold" | "Silver" | "Bronze";

export type AdminCustomerRecord = {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: number;
  updatedAt: number;
  orderCount: number;
  activeOrderCount: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalSpentNaira: number;
  savedAddressesCount: number;
  preferredPaymentMethod: PaymentMethod | null;
  lastOrderAt: number | null;
  tier: CustomerTier;
};

export type AdminDriverRecord = {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  vendorId: string;
  vendorName: string;
  status: DriverProfile["status"];
  vehicleType?: string;
  licensePlate?: string;
  loadedUnits: number;
  createdAt: number;
  updatedAt: number;
};
