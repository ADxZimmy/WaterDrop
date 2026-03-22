import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/server";
import { listAdminCustomerRecords } from "@/lib/admin/ops";

export async function GET() {
  try {
    await requireRole(["admin"]);
    const customers = await listAdminCustomerRecords();
    return NextResponse.json({ customers }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load admin customers";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
