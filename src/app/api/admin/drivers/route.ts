import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/server";
import { listAdminDriverRecords } from "@/lib/admin/ops";

export async function GET() {
  try {
    await requireRole(["admin"]);
    const drivers = await listAdminDriverRecords();
    return NextResponse.json({ drivers }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load admin drivers";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
