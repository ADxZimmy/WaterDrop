import { orderSchema, type Order } from "@/lib/domain/schemas";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import {
  getOrderPageInfo,
  ORDER_PAGE_DEFAULT_LIMIT,
  type OrderPageCursor,
} from "@/lib/orders/order-pagination";

type ListCustomerOrdersOptions = {
  cursor?: OrderPageCursor | null;
  limit?: number;
};

function parseCustomerOrders(customerUid: string, records: unknown[]) {
  return records
    .map((record) => {
      const result = orderSchema.safeParse(record);
      if (!result.success) {
        console.warn("[customer.orders] Ignoring invalid customer order", {
          customerUid,
          issues: result.error.issues.map((issue) => issue.message),
        });
        return null;
      }

      return result.data.customerUid === customerUid ? result.data : null;
    })
    .filter((order): order is Order => Boolean(order))
    .sort((left, right) => right.createdAt - left.createdAt);
}

export async function listCustomerOrdersPage(
  customerUid: string,
  { cursor = null, limit = ORDER_PAGE_DEFAULT_LIMIT }: ListCustomerOrdersOptions = {}
) {
  const db = getFirebaseAdminDb();
  let orders: Order[] = [];

  try {
    let query = db
      .collection("orders")
      .where("customerUid", "==", customerUid)
      .orderBy("createdAt", "desc")
      .limit(limit + 1);

    if (cursor) {
      query = query.startAfter(cursor.createdAt);
    }

    const snapshot = await query.get();
    orders = parseCustomerOrders(customerUid, snapshot.docs.map((doc) => doc.data()));
  } catch (error) {
    console.warn("[customer.orders] Falling back to bounded unordered customer order read", {
      customerUid,
      error: error instanceof Error ? error.message : "Unknown Firestore error",
    });

    const snapshot = await db
      .collection("orders")
      .where("customerUid", "==", customerUid)
      .limit(250)
      .get();

    orders = parseCustomerOrders(customerUid, snapshot.docs.map((doc) => doc.data()));
    if (cursor) {
      orders = orders.filter((order) => order.createdAt < cursor.createdAt);
    }
  }

  return getOrderPageInfo(orders, limit);
}
