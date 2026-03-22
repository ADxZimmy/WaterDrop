import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/server";
import { getVendorDashboardSummary } from "@/lib/vendor/summary";

export async function GET() {
  try {
    const user = await requireRole(["vendor"]);
    const summary = await getVendorDashboardSummary(user.uid);
    return NextResponse.json(summary, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load vendor summary";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
