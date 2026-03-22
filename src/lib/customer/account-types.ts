import type { OrderStatus, PaymentMethod, UserProfile } from "@/lib/domain/schemas";

export type CustomerAccountProfile = UserProfile;

export type CustomerLatestOrder = {
  id: string;
  vendorName?: string;
  status: OrderStatus;
  totalNaira: number;
  createdAt: number;
};

export type CustomerAccountSummary = {
  totalOrders: number;
  activeOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  lifetimeSpendNaira: number;
  savedAddressesCount: number;
  defaultAddressLabel: string | null;
  defaultAddress: string | null;
  preferredPaymentMethod: PaymentMethod | null;
  lastOrderAt: number | null;
  latestOrder: CustomerLatestOrder | null;
};

export type CustomerAccountPayload = {
  profile: CustomerAccountProfile;
  summary: CustomerAccountSummary;
};
