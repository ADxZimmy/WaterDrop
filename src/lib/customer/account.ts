import {
  customerPreferencesSchema,
  orderSchema,
  userProfileSchema,
  type CustomerPreferences,
  type Order,
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

async function loadCustomerPreferences(uid: string): Promise<CustomerPreferences | null> {
  const snapshot = await getFirebaseAdminDb().collection("customerPreferences").doc(uid).get();
  if (!snapshot.exists) {
    return null;
  }

  const result = customerPreferencesSchema.safeParse(snapshot.data());
  if (!result.success) {
    console.warn("[customer.account] Ignoring invalid customer preferences", {
      uid,
      issues: result.error.issues.map((issue) => issue.message),
    });
    return null;
  }

  return result.data;
}

async function loadCustomerOrders(uid: string): Promise<Order[]> {
  const db = getFirebaseAdminDb();

  try {
    const orderedSnapshot = await db
      .collection("orders")
      .where("customerUid", "==", uid)
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    return parseCustomerOrders(uid, orderedSnapshot.docs.map((doc) => doc.data()));
  } catch (error) {
    console.warn("[customer.account] Falling back to unordered customer order summary", {
      uid,
      error: error instanceof Error ? error.message : "Unknown Firestore error",
    });
  }

  try {
    const unorderedSnapshot = await db
      .collection("orders")
      .where("customerUid", "==", uid)
      .limit(50)
      .get();

    return parseCustomerOrders(uid, unorderedSnapshot.docs.map((doc) => doc.data()));
  } catch (error) {
    console.warn("[customer.account] Unable to load customer order summary", {
      uid,
      error: error instanceof Error ? error.message : "Unknown Firestore error",
    });
    return [];
  }
}

function parseCustomerOrders(uid: string, records: unknown[]): Order[] {
  return records
    .map((record) => {
      const result = orderSchema.safeParse(record);
      if (!result.success) {
        console.warn("[customer.account] Ignoring invalid customer order", {
          uid,
          issues: result.error.issues.map((issue) => issue.message),
        });
        return null;
      }

      return result.data;
    })
    .filter((order): order is Order => Boolean(order))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function getCustomerAccountPayload(
  user: AuthenticatedCustomer,
  profileOverride?: UserProfile
): Promise<CustomerAccountPayload> {
  const db = getFirebaseAdminDb();
  const [profileSnapshotResult, preferencesResult, ordersResult] = await Promise.allSettled([
    profileOverride ? null : db.collection("users").doc(user.uid).get(),
    loadCustomerPreferences(user.uid),
    loadCustomerOrders(user.uid),
  ]);
  const profileSnapshot =
    profileSnapshotResult.status === "fulfilled" ? profileSnapshotResult.value : null;
  const profileResult = profileSnapshot?.exists
    ? userProfileSchema.safeParse(profileSnapshot.data())
    : null;

  const profile =
    profileOverride ??
    (profileResult?.success ? profileResult.data : null) ??
    buildFallbackProfile(user);
  const preferences = preferencesResult.status === "fulfilled" ? preferencesResult.value : null;
  const orders = ordersResult.status === "fulfilled" ? ordersResult.value : [];
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
