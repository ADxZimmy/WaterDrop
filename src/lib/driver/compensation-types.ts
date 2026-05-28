import type {
  DriverCompensationRule,
  DriverPayoutRequest,
} from "@/lib/domain/schemas";
import type { VendorOrderRecord } from "@/lib/orders/vendor-order";

export const DRIVER_COMPENSATION_COLLECTION = "driverCompensationConfigs";
export const DRIVER_PAYOUT_REQUEST_COLLECTION = "driverPayoutRequests";

export type AuthenticatedActor = {
  uid: string;
  email?: string;
  firstName?: string;
  lastName?: string;
};

export type DriverDirectoryRecord = {
  uid: string;
  name: string;
  email?: string;
  phone?: string;
  status: "pending" | "active" | "inactive";
  vehicleType?: string;
  licensePlate?: string;
  loadedUnits: number;
  createdAt: number;
  updatedAt: number;
  activeOrdersCount: number;
  deliveredOrdersCount: number;
  availableBalanceNaira: number;
  requestedBalanceNaira: number;
  paidBalanceNaira: number;
};

export type DriverPayoutSummary = {
  availableBalanceNaira: number;
  requestedBalanceNaira: number;
  lifetimePaidNaira: number;
  activeAssignedOrders: number;
  deliveredAssignedOrders: number;
  recentAssignedOrders: VendorOrderRecord[];
  recentPayoutRequests: DriverPayoutRequest[];
};

export type SaveCommissionConfigInput = {
  bagsRule: DriverCompensationRule;
  bottledRule: DriverCompensationRule;
  bulkRule: DriverCompensationRule;
  otherRule?: DriverCompensationRule;
  priorityFeeToDriver: boolean;
};
