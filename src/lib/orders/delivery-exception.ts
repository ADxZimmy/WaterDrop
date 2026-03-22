import {
  orderSchema,
  type Order,
  type OrderDeliveryException,
} from "@/lib/domain/schemas";
import { appendOrderExecutionEvent } from "@/lib/orders/execution";

export function getCustomerDeliveryExceptionBanner(order: {
  deliveryException?: OrderDeliveryException;
}): {
  title: string;
  description: string;
  tone: "amber" | "blue";
} | null {
  if (!order.deliveryException) {
    return null;
  }

  switch (order.deliveryException.state) {
    case "open":
      return {
        title: "Delivery needs attention",
        description:
          "A delivery attempt failed. Your vendor is reviewing this order and will update you shortly.",
        tone: "amber",
      };
    case "rescheduled":
      return {
        title: "Delivery rescheduled",
        description:
          order.deliveryException.customerMessage ??
          "Your vendor is preparing another delivery attempt.",
        tone: "blue",
      };
    case "return_to_vendor":
      return {
        title: "Order returning to vendor",
        description:
          order.deliveryException.customerMessage ??
          "Your order is being returned to the vendor. They will contact you if anything else is needed.",
        tone: "blue",
      };
    case "closed":
      return null;
    default:
      return null;
  }
}

export type VendorDeliveryExceptionResolution = "reschedule" | "return_to_vendor";

export function resolveVendorDeliveryException(
  order: Order,
  vendorUid: string,
  resolution: VendorDeliveryExceptionResolution,
  customerMessage?: string
): Order {
  const now = Date.now();
  const eventType =
    resolution === "reschedule"
      ? "delivery_exception_rescheduled"
      : "delivery_exception_return_to_vendor";

  let next = appendOrderExecutionEvent(order, {
    type: eventType,
    actor: { role: "vendor", uid: vendorUid },
    occurredAt: now,
    note: customerMessage?.trim() ? customerMessage.trim() : undefined,
  });

  next = appendOrderExecutionEvent(next, {
    type: "preparing",
    actor: { role: "vendor", uid: vendorUid },
    occurredAt: now + 1,
  });

  const msg = customerMessage?.trim() ? customerMessage.trim() : undefined;

  return orderSchema.parse({
    ...next,
    status: "preparing",
    deliveryException: {
      state: resolution === "reschedule" ? "rescheduled" : "return_to_vendor",
      openedAt: order.deliveryException?.openedAt ?? now,
      updatedAt: now + 1,
      customerMessage: msg,
    },
    updatedAt: now + 1,
  });
}

export function markDeliveryExceptionClosed(order: Order, at: number): Order {
  if (!order.deliveryException) {
    return order;
  }

  return orderSchema.parse({
    ...order,
    deliveryException: {
      ...order.deliveryException,
      state: "closed",
      updatedAt: at,
    },
    updatedAt: Math.max(order.updatedAt, at),
  });
}
