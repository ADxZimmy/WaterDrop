import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/server";
import { listVendorDrivers } from "@/lib/driver/compensation";

export async function GET() {
  try {
    const user = await requireRole(["vendor"]);
    const drivers = await listVendorDrivers(user.uid);
    return NextResponse.json({ drivers }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load drivers";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
