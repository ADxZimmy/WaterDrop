import { describe, expect, it, vi } from "vitest";

import { orderSchema, type Order } from "@/lib/domain/schemas";
import {
  getCustomerDeliveryExceptionBanner,
  markDeliveryExceptionClosed,
  resolveVendorDeliveryException,
} from "@/lib/orders/delivery-exception";

function buildOrder(overrides: Partial<Order> = {}): Order {
  return orderSchema.parse({
    id: "order-1",
    customerUid: "customer-1",
    vendorId: "vendor-1",
    vendorName: "WaterDrop Vendor",
    items: [
      {
        productId: "product-1",
        name: "20L Water",
        category: "bags",
        quantity: 2,
        unitPriceNaira: 2500,
      },
    ],
    subtotalNaira: 5000,
    deliveryFeeNaira: 500,
    totalNaira: 5500,
    paymentMethod: "cod",
    status: "out_for_delivery",
    deliveryAddress: "12 Marina Road, Lagos",
    executionEvents: [],
    createdAt: 1_000,
    updatedAt: 1_000,
    ...overrides,
  });
}

describe("delivery exception helpers", () => {
  it("returns the expected customer banner for each visible exception state", () => {
    expect(
      getCustomerDeliveryExceptionBanner({
        deliveryException: {
          state: "open",
          openedAt: 1_000,
          updatedAt: 1_000,
        },
      })
    ).toEqual({
      title: "Delivery needs attention",
      description:
        "A delivery attempt failed. Your vendor is reviewing this order and will update you shortly.",
      tone: "amber",
    });

    expect(
      getCustomerDeliveryExceptionBanner({
        deliveryException: {
          state: "rescheduled",
          openedAt: 1_000,
          updatedAt: 1_200,
          customerMessage: "New attempt tomorrow morning.",
        },
      })
    ).toEqual({
      title: "Delivery rescheduled",
      description: "New attempt tomorrow morning.",
      tone: "blue",
    });

    expect(
      getCustomerDeliveryExceptionBanner({
        deliveryException: {
          state: "return_to_vendor",
          openedAt: 1_000,
          updatedAt: 1_300,
        },
      })
    ).toEqual({
      title: "Order returning to vendor",
      description:
        "Your order is being returned to the vendor. They will contact you if anything else is needed.",
      tone: "blue",
    });

    expect(
      getCustomerDeliveryExceptionBanner({
        deliveryException: {
          state: "closed",
          openedAt: 1_000,
          updatedAt: 1_400,
        },
      })
    ).toBeNull();
  });

  it("resolves a failed delivery by rescheduling and records the follow-up events", () => {
    const nowSpy = vi.spyOn(Date, "now").mockReturnValue(20_000);

    const order = buildOrder({
      deliveryException: {
        state: "open",
        openedAt: 19_000,
        updatedAt: 19_500,
      },
    });

    const resolved = resolveVendorDeliveryException(
      order,
      "vendor-user-1",
      "reschedule",
      "  Deliver after 4pm.  "
    );

    expect(resolved.status).toBe("preparing");
    expect(resolved.updatedAt).toBe(20_001);
    expect(resolved.deliveryException).toEqual({
      state: "rescheduled",
      openedAt: 19_000,
      updatedAt: 20_001,
      customerMessage: "Deliver after 4pm.",
    });
    expect(resolved.executionEvents).toHaveLength(2);
    expect(resolved.executionEvents.map((event) => event.type)).toEqual([
      "delivery_exception_rescheduled",
      "preparing",
    ]);
    expect(resolved.executionEvents[0]).toMatchObject({
      actorRole: "vendor",
      actorUid: "vendor-user-1",
      occurredAt: 20_000,
      note: "Deliver after 4pm.",
    });
    expect(resolved.executionEvents[1]).toMatchObject({
      actorRole: "vendor",
      actorUid: "vendor-user-1",
      occurredAt: 20_001,
    });

    nowSpy.mockRestore();
  });

  it("returns orders to the vendor even when the exception metadata did not exist yet", () => {
    const nowSpy = vi.spyOn(Date, "now").mockReturnValue(30_000);

    const resolved = resolveVendorDeliveryException(
      buildOrder(),
      "vendor-user-2",
      "return_to_vendor"
    );

    expect(resolved.status).toBe("preparing");
    expect(resolved.deliveryException).toEqual({
      state: "return_to_vendor",
      openedAt: 30_000,
      updatedAt: 30_001,
    });
    expect(resolved.executionEvents.map((event) => event.type)).toEqual([
      "delivery_exception_return_to_vendor",
      "preparing",
    ]);

    nowSpy.mockRestore();
  });

  it("closes an existing exception without regressing updatedAt", () => {
    const order = buildOrder({
      status: "preparing",
      updatedAt: 4_000,
      deliveryException: {
        state: "rescheduled",
        openedAt: 1_000,
        updatedAt: 3_000,
        customerMessage: "Try gate B",
      },
    });

    expect(markDeliveryExceptionClosed(order, 3_500)).toEqual({
      ...order,
      deliveryException: {
        state: "closed",
        openedAt: 1_000,
        updatedAt: 3_500,
        customerMessage: "Try gate B",
      },
      updatedAt: 4_000,
    });
  });

  it("leaves the order unchanged when there is no exception to close", () => {
    const order = buildOrder({ status: "preparing" });

    expect(markDeliveryExceptionClosed(order, 4_500)).toBe(order);
  });
});
