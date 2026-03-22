import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/server";
import { listAdminOrderRecords } from "@/lib/admin/ops";

export async function GET() {
  try {
    await requireRole(["admin"]);
    const orders = await listAdminOrderRecords();
    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load admin orders";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
