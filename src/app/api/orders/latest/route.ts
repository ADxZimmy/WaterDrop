import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/server";
import { orderSchema } from "@/lib/domain/schemas";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { ORDER_ACTIVE_STATUSES } from "@/lib/orders/status";

export async function GET() {
  try {
    const user = await requireRole(["customer"]);
    const snapshot = await getFirebaseAdminDb()
      .collection("orders")
      .where("customerUid", "==", user.uid)
      .get();

    const orders = snapshot.docs
      .map((doc) => orderSchema.parse(doc.data()))
      .sort((a, b) => b.createdAt - a.createdAt);

    const activeOrder = orders.find((order) => ORDER_ACTIVE_STATUSES.has(order.status)) ?? null;
    return NextResponse.json({ order: activeOrder }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load latest order";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
