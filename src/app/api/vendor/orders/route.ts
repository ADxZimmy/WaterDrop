import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/server";
import { getOrderPageParams } from "@/lib/orders/order-pagination";
import { listVendorOrdersPage } from "@/lib/orders/vendor-order";

export async function GET(request: Request) {
  try {
    const user = await requireRole(["vendor"]);
    const { cursor, limit } = getOrderPageParams(request.url);
    const result = await listVendorOrdersPage(user.uid, { cursor, limit });
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load vendor orders";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
