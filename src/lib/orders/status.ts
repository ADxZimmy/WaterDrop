import type { OrderStatus, PaymentMethod } from "@/lib/domain/schemas";

export type TrackableOrderStatus = Exclude<OrderStatus, "cancelled">;

export const ORDER_STATUS_STEPS: ReadonlyArray<{
  key: TrackableOrderStatus;
  title: string;
  description: string;
}> = [
  {
    key: "pending",
    title: "Order placed",
    description: "The customer has submitted the order and is waiting for vendor review.",
  },
  {
    key: "accepted",
    title: "Accepted",
    description: "The vendor has confirmed the order and will start fulfillment.",
  },
  {
    key: "preparing",
    title: "Preparing",
    description: "The order is being prepared and packaged for dispatch.",
  },
  {
    key: "out_for_delivery",
    title: "Out for delivery",
    description: "The order is on the way to the customer.",
  },
  {
    key: "delivered",
    title: "Delivered",
    description: "The order has reached the customer.",
  },
];

export const ORDER_ACTIVE_STATUSES = new Set<OrderStatus>([
  "pending",
  "accepted",
  "preparing",
  "out_for_delivery",
]);

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  preparing: "Preparing",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["accepted", "cancelled"],
  accepted: ["preparing", "cancelled"],
  preparing: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered", "preparing", "cancelled"],
  delivered: [],
  cancelled: [],
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cod: "Cash on delivery",
  manual_transfer: "Manual transfer",
};

export function getOrderStatusLabel(status: OrderStatus) {
  return ORDER_STATUS_LABELS[status];
}

export function getPaymentMethodLabel(method: PaymentMethod) {
  return PAYMENT_METHOD_LABELS[method];
}

export function getNextProgressStatus(status: OrderStatus) {
  return ORDER_STATUS_TRANSITIONS[status].find((candidate) => candidate !== "cancelled") ?? null;
}

export function canCancelOrder(status: OrderStatus) {
  return ORDER_STATUS_TRANSITIONS[status].includes("cancelled");
}
