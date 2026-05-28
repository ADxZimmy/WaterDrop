import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/server";
import { getAdminAnalyticsPayload } from "@/lib/admin/ops";
import { logPerf } from "@/lib/observability/perf";

export async function GET() {
  const start = performance.now();

  try {
    await requireRole(["admin"]);
    const analytics = await getAdminAnalyticsPayload();
    logPerf("/api/admin/analytics", performance.now() - start, {
      totalOrders: analytics.summary.totalOrders,
      totalVendors: analytics.summary.totalVendors,
      totalDrivers: analytics.summary.totalDrivers,
    });
    return NextResponse.json({ analytics }, { status: 200 });
  } catch (error) {
    logPerf("/api/admin/analytics", performance.now() - start, {
      error: true,
    });
    const message =
      error instanceof Error ? error.message : "Unable to load admin analytics";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
