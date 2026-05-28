import { describe, expect, it } from "vitest";

import {
  ORDER_ACTIVE_STATUSES,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_STEPS,
  ORDER_STATUS_TRANSITIONS,
  canCancelOrder,
  getNextProgressStatus,
  getOrderStatusLabel,
  getPaymentMethodLabel,
} from "@/lib/orders/status";

describe("order status helpers", () => {
  it("keeps the public progress steps aligned with trackable statuses", () => {
    expect(ORDER_STATUS_STEPS.map((step) => step.key)).toEqual([
      "pending",
      "accepted",
      "preparing",
      "out_for_delivery",
      "delivered",
    ]);
  });

  it("returns the next non-cancelled progress state", () => {
    expect(getNextProgressStatus("pending")).toBe("accepted");
    expect(getNextProgressStatus("accepted")).toBe("preparing");
    expect(getNextProgressStatus("preparing")).toBe("out_for_delivery");
    expect(getNextProgressStatus("out_for_delivery")).toBe("delivered");
  });

  it("returns null once an order is terminal", () => {
    expect(getNextProgressStatus("delivered")).toBeNull();
    expect(getNextProgressStatus("cancelled")).toBeNull();
  });

  it("allows cancellation only for active states", () => {
    for (const status of ORDER_ACTIVE_STATUSES) {
      expect(canCancelOrder(status)).toBe(true);
    }

    expect(canCancelOrder("delivered")).toBe(false);
    expect(canCancelOrder("cancelled")).toBe(false);
  });

  it("keeps the reschedule transition from delivery back to preparing", () => {
    expect(ORDER_STATUS_TRANSITIONS.out_for_delivery).toContain("preparing");
  });

  it("exposes stable display labels for orders and payment methods", () => {
    expect(getOrderStatusLabel("out_for_delivery")).toBe(
      ORDER_STATUS_LABELS.out_for_delivery
    );
    expect(getPaymentMethodLabel("cod")).toBe("Cash on delivery");
    expect(getPaymentMethodLabel("manual_transfer")).toBe("Manual transfer");
  });
});
