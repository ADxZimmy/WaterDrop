import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/server";
import { listVendorPayoutRequests } from "@/lib/driver/compensation";

export async function GET() {
  try {
    const user = await requireRole(["vendor"]);
    const requests = await listVendorPayoutRequests(user.uid);
    return NextResponse.json({ requests }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load payout requests";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
