import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/server";
import { listAdminVendorReviewRecords } from "@/lib/admin/vendor-review";

export async function GET() {
  try {
    await requireRole(["admin"]);
    const vendors = await listAdminVendorReviewRecords();
    return NextResponse.json({ vendors }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load admin vendors";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
