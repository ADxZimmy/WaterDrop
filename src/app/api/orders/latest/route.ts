import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/server";
import { listCustomerOrdersPage } from "@/lib/orders/customer-order";
import { ORDER_ACTIVE_STATUSES } from "@/lib/orders/status";

export async function GET() {
  try {
    const user = await requireRole(["customer"]);
    const { orders } = await listCustomerOrdersPage(user.uid, { limit: 10 });
    const activeOrder =
      orders.find((order) => ORDER_ACTIVE_STATUSES.has(order.status)) ?? null;
    return NextResponse.json({ order: activeOrder }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load latest order";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
