import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/server";
import { listVendorOrders } from "@/lib/orders/vendor-order";

export async function GET() {
  try {
    const user = await requireRole(["vendor"]);
    const orders = await listVendorOrders(user.uid);
    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load vendor orders";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
