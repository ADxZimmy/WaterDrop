import type { DriverProfile } from "@/lib/domain/schemas";
import type { DriverPayoutRequest } from "@/lib/domain/schemas";
import type { VendorOrderRecord } from "@/lib/orders/vendor-order";

export type DriverWorkspaceUser = {
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  createdAt: number | null;
};

export type DriverWorkspaceVendor = {
  vendorId: string;
  businessName: string;
  businessType?: string;
  address?: string;
  status: "pending" | "approved" | "rejected";
  reviewNotes?: string;
};

export type DriverWorkspaceAssignmentSummary = {
  totalAssignedOrders: number;
  activeAssignedOrders: number;
  deliveredAssignedOrders: number;
  cancelledAssignedOrders: number;
  latestAssignedOrderUpdatedAt: number | null;
};

export type DriverWorkspacePayoutSummary = {
  availableBalanceNaira: number;
  requestedBalanceNaira: number;
  lifetimePaidNaira: number;
};

export type DriverWorkspaceAssignedOrder = {
  id: string;
  customerName: string;
  deliveryAddress?: string;
  status: VendorOrderRecord["status"];
  totalNaira: number;
  updatedAt: number;
  payoutAmountNaira: number | null;
};

export type DriverWorkspaceCapabilities = {
  driverAssignments: boolean;
  turnByTurnNavigation: boolean;
  payoutTracking: boolean;
  selfServiceSecurity: boolean;
};

export type DriverWorkspacePayload = {
  user: DriverWorkspaceUser;
  driver: DriverProfile | null;
  vendor: DriverWorkspaceVendor | null;
  assignments: DriverWorkspaceAssignmentSummary;
  payouts: DriverWorkspacePayoutSummary;
  activeOrders: DriverWorkspaceAssignedOrder[];
  recentPayoutRequests: DriverPayoutRequest[];
  capabilities: DriverWorkspaceCapabilities;
};

export type DriverOrderReferencePayload = {
  driver: DriverProfile;
  vendor: DriverWorkspaceVendor | null;
  order: VendorOrderRecord;
  capabilities: DriverWorkspaceCapabilities;
  mapsUrl?: string;
};
