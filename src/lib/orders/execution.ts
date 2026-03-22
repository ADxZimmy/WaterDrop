import { randomUUID } from "crypto";
import {
  deliveryProofSchema,
  orderExecutionEventSchema,
  orderSchema,
  type DeliveryProof,
  type Order,
  type OrderExecutionEvent,
  type OrderExecutionEventType,
  type UserRole,
} from "@/lib/domain/schemas";

type ExecutionActor = {
  role: UserRole;
  uid: string;
};

type ExecutionEventInput = {
  type: OrderExecutionEventType;
  actor: ExecutionActor;
  occurredAt?: number;
  note?: string;
  recipientName?: string;
};

type DeliveryProofInput = {
  confirmedAt?: number;
  confirmedByUid: string;
  recipientName: string;
  note?: string;
};

export function createOrderExecutionEvent(input: ExecutionEventInput): OrderExecutionEvent {
  return orderExecutionEventSchema.parse({
    id: randomUUID(),
    type: input.type,
    actorRole: input.actor.role,
    actorUid: input.actor.uid,
    occurredAt: input.occurredAt ?? Date.now(),
    note: input.note?.trim() ? input.note.trim() : undefined,
    recipientName: input.recipientName?.trim() ? input.recipientName.trim() : undefined,
  });
}

export function appendOrderExecutionEvent(
  order: Order,
  input: ExecutionEventInput
): Order {
  const event = createOrderExecutionEvent(input);
  return orderSchema.parse({
    ...order,
    executionEvents: [...order.executionEvents, event],
    updatedAt: Math.max(order.updatedAt, event.occurredAt),
  });
}

export function setOrderDeliveryProof(
  order: Order,
  input: DeliveryProofInput
): Order {
  const proof = deliveryProofSchema.parse({
    confirmedAt: input.confirmedAt ?? Date.now(),
    confirmedByUid: input.confirmedByUid,
    recipientName: input.recipientName.trim(),
    note: input.note?.trim() ? input.note.trim() : undefined,
  });

  return orderSchema.parse({
    ...order,
    deliveryProof: proof,
    updatedAt: Math.max(order.updatedAt, proof.confirmedAt),
  });
}

export function hasOrderExecutionEvent(order: Order, type: OrderExecutionEventType) {
  return order.executionEvents.some((event) => event.type === type);
}

export function getOrderExecutionEventLabel(type: OrderExecutionEventType) {
  const labels: Record<OrderExecutionEventType, string> = {
    driver_assigned: "Driver assigned",
    driver_unassigned: "Driver removed",
    accepted: "Accepted",
    preparing: "Preparing",
    out_for_delivery: "Out for delivery",
    driver_arrived: "Driver arrived",
    delivery_failed_attempt: "Delivery attempt failed",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };

  return labels[type];
}

export function getOrderExecutionEventDescription(event: OrderExecutionEvent) {
  if (event.type === "driver_assigned") {
    return "A vendor assigned a driver to this order.";
  }

  if (event.type === "driver_unassigned") {
    return "The vendor removed the driver assignment.";
  }

  if (event.type === "driver_arrived") {
    return "The driver marked arrival at the delivery destination.";
  }

  if (event.type === "delivery_failed_attempt") {
    return event.note
      ? `Delivery attempt failed: ${event.note}`
      : "The driver reported that delivery could not be completed.";
  }

  if (event.type === "delivered") {
    return event.recipientName
      ? `Confirmed with recipient ${event.recipientName}.`
      : "The order was marked delivered.";
  }

  return `Order moved to ${getOrderExecutionEventLabel(event.type).toLowerCase()}.`;
}

export function normalizeDeliveryProof(
  proof: DeliveryProof | undefined
): DeliveryProof | undefined {
  return proof ? deliveryProofSchema.parse(proof) : undefined;
}
