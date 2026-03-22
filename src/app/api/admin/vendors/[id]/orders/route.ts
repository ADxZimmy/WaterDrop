import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/server";
import { getAdminVendorReviewRecord } from "@/lib/admin/vendor-review";
import { listVendorOrders } from "@/lib/orders/vendor-order";

export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["admin"]);
    const { id } = await context.params;
    const [vendor, orders] = await Promise.all([
      getAdminVendorReviewRecord(id),
      listVendorOrders(id),
    ]);

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    return NextResponse.json({ vendor, orders }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load vendor orders";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
