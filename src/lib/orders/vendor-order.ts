import {
  orderSchema,
  type Order,
  type UserProfile,
} from "@/lib/domain/schemas";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import {
  getOrderPageInfo,
  ORDER_PAGE_DEFAULT_LIMIT,
  type OrderPageCursor,
} from "@/lib/orders/order-pagination";

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

function parseVendorOrders(vendorId: string, records: unknown[]) {
  return records
    .map((record) => {
      const result = orderSchema.safeParse(record);
      if (!result.success) {
        console.warn("[vendor.orders] Ignoring invalid vendor order", {
          vendorId,
          issues: result.error.issues.map((issue) => issue.message),
        });
        return null;
      }

      return result.data;
    })
    .filter((order): order is Order => Boolean(order))
    .sort((a, b) => b.createdAt - a.createdAt);
}

type ListVendorOrdersOptions = {
  cursor?: OrderPageCursor | null;
  limit?: number;
};

export async function listVendorOrdersPage(
  vendorId: string,
  { cursor = null, limit = ORDER_PAGE_DEFAULT_LIMIT }: ListVendorOrdersOptions = {}
) {
  const db = getFirebaseAdminDb();
  let orders: Order[] = [];

  try {
    let query = db
      .collection("orders")
      .where("vendorId", "==", vendorId)
      .orderBy("createdAt", "desc")
      .limit(limit + 1);

    if (cursor) {
      query = query.startAfter(cursor.createdAt);
    }

    const snapshot = await query.get();
    orders = parseVendorOrders(vendorId, snapshot.docs.map((doc) => doc.data()));
  } catch (error) {
    console.warn("[vendor.orders] Falling back to bounded unordered vendor order read", {
      vendorId,
      error: error instanceof Error ? error.message : "Unknown Firestore error",
    });

    const snapshot = await db
      .collection("orders")
      .where("vendorId", "==", vendorId)
      .limit(250)
      .get();

    orders = parseVendorOrders(vendorId, snapshot.docs.map((doc) => doc.data()));
    if (cursor) {
      orders = orders.filter((order) => order.createdAt < cursor.createdAt);
    }
  }

  const page = getOrderPageInfo(orders, limit);
  const customerProfiles = await loadCustomerProfiles(page.orders.map((order) => order.customerUid));

  return {
    orders: page.orders.map((order) =>
      hydrateVendorOrder(order, customerProfiles.get(order.customerUid) ?? null)
    ),
    pageInfo: page.pageInfo,
  };
}

export async function listVendorOrders(vendorId: string) {
  const snapshot = await getFirebaseAdminDb()
    .collection("orders")
    .where("vendorId", "==", vendorId)
    .get();

  const orders = parseVendorOrders(vendorId, snapshot.docs.map((doc) => doc.data()));
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
