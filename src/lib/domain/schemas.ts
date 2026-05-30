import { z } from "zod";

export const userRoleSchema = z.enum(["customer", "vendor", "driver", "admin"]);

export const userProfileSchema = z.object({
  uid: z.string().min(1),
  role: userRoleSchema,
  email: z.string().email(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  avatarUrl: z.string().min(1).max(500000).optional(),
  createdAt: z.number().int(),
  updatedAt: z.number().int(),
});

export const vendorProfileSchema = z.object({
  vendorId: z.string().min(1),
  ownerUid: z.string().min(1),
  businessName: z.string().min(1),
  status: z.enum(["pending", "approved", "rejected"]),
  businessType: z.string().min(1).optional(),
  establishmentYear: z.number().int().optional(),
  address: z.string().min(1).optional(),
  nafdacNumber: z.string().min(1).optional(),
  cacNumber: z.string().min(1).optional(),
  taxId: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  deliveryRadiusKm: z.number().int().nonnegative().optional(),
  submittedAt: z.number().int().optional(),
  reviewedAt: z.number().int().optional(),
  reviewedBy: z.string().min(1).optional(),
  reviewNotes: z.string().min(1).optional(),
  createdAt: z.number().int(),
  updatedAt: z.number().int(),
});

export const driverProfileSchema = z.object({
  uid: z.string().min(1),
  vendorId: z.string().min(1),
  status: z.enum(["pending", "active", "inactive"]),
  vehicleType: z.string().min(1).optional(),
  licensePlate: z.string().min(1).optional(),
  loadedUnits: z.number().int().nonnegative().default(0),
  createdAt: z.number().int(),
  updatedAt: z.number().int(),
});

export const productSchema = z.object({
  id: z.string().min(1),
  vendorId: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  priceNaira: z.number().nonnegative(),
  stock: z.number().int().nonnegative(),
  description: z.string().default(""),
  isActive: z.boolean().default(true),
  createdAt: z.number().int(),
  updatedAt: z.number().int(),
});

export const orderStatusSchema = z.enum([
  "pending",
  "accepted",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
]);

export const paymentMethodSchema = z.enum(["cod", "manual_transfer"]);

export const driverCompensationModeSchema = z.enum(["percentage", "fixed"]);

export const driverCompensationCategorySchema = z.enum([
  "bags",
  "bottled",
  "bulk",
  "other",
]);

export const driverPayoutStatusSchema = z.enum(["accrued", "requested", "paid"]);

export const driverPayoutRequestStatusSchema = z.enum(["pending", "paid", "rejected"]);

export const customerAddressSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1).default("Nigeria"),
  isDefault: z.boolean().default(false),
});

export const customerPreferencesSchema = z.object({
  customerUid: z.string().min(1),
  addresses: z.array(customerAddressSchema).default([]),
  preferredPaymentMethod: paymentMethodSchema.default("cod"),
  createdAt: z.number().int(),
  updatedAt: z.number().int(),
});

export const orderItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1).optional(),
  quantity: z.number().int().positive(),
  unitPriceNaira: z.number().nonnegative(),
});

export const cartSchema = z.object({
  customerUid: z.string().min(1),
  vendorId: z.string().min(1),
  vendorName: z.string().min(1),
  items: z.array(orderItemSchema),
  updatedAt: z.number().int(),
});

export const driverAssignmentSchema = z.object({
  driverUid: z.string().min(1),
  driverName: z.string().min(1),
  assignedAt: z.number().int(),
  assignedByUid: z.string().min(1),
});

export const orderExecutionEventTypeSchema = z.enum([
  "driver_assigned",
  "driver_unassigned",
  "accepted",
  "preparing",
  "out_for_delivery",
  "driver_arrived",
  "delivery_failed_attempt",
  "delivery_exception_rescheduled",
  "delivery_exception_return_to_vendor",
  "delivered",
  "cancelled",
]);

export const orderExecutionEventSchema = z.object({
  id: z.string().min(1),
  type: orderExecutionEventTypeSchema,
  actorRole: userRoleSchema,
  actorUid: z.string().min(1),
  occurredAt: z.number().int(),
  note: z.string().min(1).max(280).optional(),
  recipientName: z.string().min(1).max(120).optional(),
});

export const deliveryProofSchema = z.object({
  confirmedAt: z.number().int(),
  confirmedByUid: z.string().min(1),
  recipientName: z.string().min(1).max(120),
  note: z.string().min(1).max(280).optional(),
});

export const orderDriverPayoutSchema = z.object({
  amountNaira: z.number().nonnegative(),
  status: driverPayoutStatusSchema,
  source: z.enum(["vendor_default", "driver_override"]),
  calculatedAt: z.number().int(),
  payoutRequestId: z.string().min(1).optional(),
  requestedAt: z.number().int().optional(),
  paidAt: z.number().int().optional(),
});

export const deliveryExceptionStateSchema = z.enum([
  "open",
  "rescheduled",
  "return_to_vendor",
  "closed",
]);

export const orderDeliveryExceptionSchema = z.object({
  state: deliveryExceptionStateSchema,
  openedAt: z.number().int(),
  updatedAt: z.number().int(),
  customerMessage: z.string().max(280).optional(),
});

export const orderSchema = z.object({
  id: z.string().min(1),
  customerUid: z.string().min(1),
  vendorId: z.string().min(1),
  vendorName: z.string().min(1).optional(),
  items: z.array(orderItemSchema).min(1),
  subtotalNaira: z.number().nonnegative(),
  deliveryFeeNaira: z.number().nonnegative(),
  totalNaira: z.number().nonnegative(),
  paymentMethod: paymentMethodSchema,
  status: orderStatusSchema,
  deliveryAddress: z.string().min(1).optional(),
  driverAssignment: driverAssignmentSchema.optional(),
  driverPayout: orderDriverPayoutSchema.optional(),
  executionEvents: z.array(orderExecutionEventSchema).default([]),
  deliveryProof: deliveryProofSchema.optional(),
  deliveryException: orderDeliveryExceptionSchema.optional(),
  deliveredAt: z.number().int().optional(),
  createdAt: z.number().int(),
  updatedAt: z.number().int(),
});

export const driverCompensationRuleSchema = z.object({
  mode: driverCompensationModeSchema,
  value: z.number().nonnegative(),
});

export const driverCompensationConfigSchema = z.object({
  id: z.string().min(1),
  vendorId: z.string().min(1),
  scope: z.enum(["vendor_default", "driver_override"]),
  driverUid: z.string().min(1).optional(),
  bagsRule: driverCompensationRuleSchema,
  bottledRule: driverCompensationRuleSchema,
  bulkRule: driverCompensationRuleSchema,
  otherRule: driverCompensationRuleSchema,
  priorityFeeToDriver: z.boolean().default(false),
  createdAt: z.number().int(),
  updatedAt: z.number().int(),
});

export const driverPayoutRequestSchema = z.object({
  id: z.string().min(1),
  vendorId: z.string().min(1),
  driverUid: z.string().min(1),
  driverName: z.string().min(1),
  amountNaira: z.number().positive(),
  orderIds: z.array(z.string().min(1)).min(1),
  destinationLabel: z.string().min(1),
  status: driverPayoutRequestStatusSchema,
  requestedAt: z.number().int(),
  reviewedAt: z.number().int().optional(),
  reviewedByUid: z.string().min(1).optional(),
  reviewNote: z.string().min(1).optional(),
});

/** Append-only audit rows for driver commission / payout lifecycle (separate from mutable order docs). */
export const payoutLedgerEntryKindSchema = z.enum([
  "commission_accrued",
  "payout_requested",
  "payout_paid",
  "payout_rejected",
]);

export const payoutLedgerEntrySchema = z.object({
  id: z.string().min(1),
  kind: payoutLedgerEntryKindSchema,
  createdAt: z.number().int(),
  currency: z.literal("NGN"),
  amountNaira: z.number().nonnegative(),
  vendorId: z.string().min(1),
  driverUid: z.string().min(1),
  orderId: z.string().min(1).optional(),
  orderIds: z.array(z.string().min(1)).optional(),
  payoutRequestId: z.string().min(1).optional(),
  note: z.string().max(280).optional(),
});

export type UserRole = z.infer<typeof userRoleSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
export type VendorProfile = z.infer<typeof vendorProfileSchema>;
export type DriverProfile = z.infer<typeof driverProfileSchema>;
export type CustomerAddress = z.infer<typeof customerAddressSchema>;
export type CustomerPreferences = z.infer<typeof customerPreferencesSchema>;
export type Cart = z.infer<typeof cartSchema>;
export type Product = z.infer<typeof productSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;
export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export type DriverAssignment = z.infer<typeof driverAssignmentSchema>;
export type OrderExecutionEventType = z.infer<typeof orderExecutionEventTypeSchema>;
export type OrderExecutionEvent = z.infer<typeof orderExecutionEventSchema>;
export type DeliveryProof = z.infer<typeof deliveryProofSchema>;
export type OrderDriverPayout = z.infer<typeof orderDriverPayoutSchema>;
export type DeliveryExceptionState = z.infer<typeof deliveryExceptionStateSchema>;
export type OrderDeliveryException = z.infer<typeof orderDeliveryExceptionSchema>;
export type Order = z.infer<typeof orderSchema>;
export type DriverCompensationMode = z.infer<typeof driverCompensationModeSchema>;
export type DriverCompensationCategory = z.infer<typeof driverCompensationCategorySchema>;
export type DriverPayoutStatus = z.infer<typeof driverPayoutStatusSchema>;
export type DriverPayoutRequestStatus = z.infer<typeof driverPayoutRequestStatusSchema>;
export type DriverCompensationRule = z.infer<typeof driverCompensationRuleSchema>;
export type DriverCompensationConfig = z.infer<typeof driverCompensationConfigSchema>;
export type DriverPayoutRequest = z.infer<typeof driverPayoutRequestSchema>;
export type PayoutLedgerEntryKind = z.infer<typeof payoutLedgerEntryKindSchema>;
export type PayoutLedgerEntry = z.infer<typeof payoutLedgerEntrySchema>;
