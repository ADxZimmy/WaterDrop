import {
  orderSchema,
  type Order,
  type UserProfile,
} from "@/lib/domain/schemas";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";

export type VendorOrderRecord = Order & {
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
};

function getCustomerName(profile: Partial<UserProfile> | null, fallbackUid: string) {
  const firstName = typeof profile?.firstName === "string" ? profile.firstName.trim() : "";
  const lastName = typeof profile?.lastName === "string" ? profile.lastName.trim() : "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

  if (fullName) {
    return fullName;
  }

  if (typeof profile?.email === "string" && profile.email.trim().length > 0) {
    return profile.email;
  }

  return `Customer ${fallbackUid.slice(0, 6)}`;
}

async function loadCustomerProfiles(customerUids: string[]) {
  const uniqueCustomerUids = [...new Set(customerUids)];
  const db = getFirebaseAdminDb();

  const entries = await Promise.all(
    uniqueCustomerUids.map(async (uid) => {
      const snapshot = await db.collection("users").doc(uid).get();
      return [uid, snapshot.exists ? (snapshot.data() as Partial<UserProfile>) : null] as const;
    })
  );

  return new Map(entries);
}

function hydrateVendorOrder(order: Order, customerProfile: Partial<UserProfile> | null): VendorOrderRecord {
  return {
    ...order,
    customerName: getCustomerName(customerProfile, order.customerUid),
    customerEmail:
      typeof customerProfile?.email === "string" ? customerProfile.email : undefined,
    customerPhone:
      typeof customerProfile?.phone === "string" ? customerProfile.phone : undefined,
  };
}

export async function listVendorOrders(vendorId: string) {
  const snapshot = await getFirebaseAdminDb()
    .collection("orders")
    .where("vendorId", "==", vendorId)
    .get();

  const orders = snapshot.docs
    .map((doc) => orderSchema.parse(doc.data()))
    .sort((a, b) => b.createdAt - a.createdAt);

  const customerProfiles = await loadCustomerProfiles(orders.map((order) => order.customerUid));
  return orders.map((order) =>
    hydrateVendorOrder(order, customerProfiles.get(order.customerUid) ?? null)
  );
}

export async function getVendorOrder(vendorId: string, orderId: string) {
  const snapshot = await getFirebaseAdminDb().collection("orders").doc(orderId).get();
  if (!snapshot.exists) {
    return null;
  }

  const order = orderSchema.parse(snapshot.data());
  if (order.vendorId !== vendorId) {
    return null;
  }

  const customerSnapshot = await getFirebaseAdminDb()
    .collection("users")
    .doc(order.customerUid)
    .get();

  return hydrateVendorOrder(
    order,
    customerSnapshot.exists ? (customerSnapshot.data() as Partial<UserProfile>) : null
  );
}
