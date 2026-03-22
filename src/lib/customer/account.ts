import {
  customerPreferencesSchema,
  orderSchema,
  userProfileSchema,
  type UserProfile,
} from "@/lib/domain/schemas";
import { formatCustomerAddress, getDefaultCustomerAddress } from "@/lib/customer/preferences";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { ORDER_ACTIVE_STATUSES } from "@/lib/orders/status";
import type { CustomerAccountPayload } from "@/lib/customer/account-types";

type AuthenticatedCustomer = {
  uid: string;
  email: string;
  role: "customer";
  firstName?: string;
  lastName?: string;
  phone?: string;
};

function buildFallbackProfile(user: AuthenticatedCustomer) {
  const now = Date.now();

  return userProfileSchema.parse({
    uid: user.uid,
    role: "customer",
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    createdAt: now,
    updatedAt: now,
  });
}

export async function getCustomerAccountPayload(
  user: AuthenticatedCustomer,
  profileOverride?: UserProfile
): Promise<CustomerAccountPayload> {
  const db = getFirebaseAdminDb();
  const [profileSnapshot, preferencesSnapshot, ordersSnapshot] = await Promise.all([
    profileOverride ? null : db.collection("users").doc(user.uid).get(),
    db.collection("customerPreferences").doc(user.uid).get(),
    db.collection("orders").where("customerUid", "==", user.uid).get(),
  ]);

  const profile =
    profileOverride ??
    (profileSnapshot?.exists ? userProfileSchema.parse(profileSnapshot.data()) : null) ??
    buildFallbackProfile(user);
  const preferences = preferencesSnapshot.exists
    ? customerPreferencesSchema.parse(preferencesSnapshot.data())
    : null;
  const orders = ordersSnapshot.docs
    .map((doc) => orderSchema.parse(doc.data()))
    .sort((left, right) => right.createdAt - left.createdAt);
  const nonCancelledOrders = orders.filter((order) => order.status !== "cancelled");
  const defaultAddress = preferences
    ? getDefaultCustomerAddress(preferences.addresses)
    : null;
  const latestOrder = orders[0] ?? null;

  return {
    profile,
    summary: {
      totalOrders: orders.length,
      activeOrders: orders.filter((order) => ORDER_ACTIVE_STATUSES.has(order.status)).length,
      deliveredOrders: orders.filter((order) => order.status === "delivered").length,
      cancelledOrders: orders.filter((order) => order.status === "cancelled").length,
      lifetimeSpendNaira: nonCancelledOrders.reduce((sum, order) => sum + order.totalNaira, 0),
      savedAddressesCount: preferences?.addresses.length ?? 0,
      defaultAddressLabel: defaultAddress?.label ?? null,
      defaultAddress: defaultAddress ? formatCustomerAddress(defaultAddress) : null,
      preferredPaymentMethod: preferences?.preferredPaymentMethod ?? null,
      lastOrderAt: latestOrder?.createdAt ?? null,
      latestOrder: latestOrder
        ? {
            id: latestOrder.id,
            vendorName: latestOrder.vendorName,
            status: latestOrder.status,
            totalNaira: latestOrder.totalNaira,
            createdAt: latestOrder.createdAt,
          }
        : null,
    },
  };
}
