import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/server";
import { getVendorDashboardSummary } from "@/lib/vendor/summary";
import { logPerf } from "@/lib/observability/perf";

export async function GET() {
  const start = performance.now();

  try {
    const user = await requireRole(["vendor"]);
    const summary = await getVendorDashboardSummary(user.uid);
    logPerf("/api/vendor/summary", performance.now() - start, {
      vendorId: user.uid,
      totalOrders: summary.summary.totalOrders,
      totalProducts: summary.summary.totalProducts,
    });
    return NextResponse.json(summary, { status: 200 });
  } catch (error) {
    logPerf("/api/vendor/summary", performance.now() - start, {
      error: true,
    });
    const message = error instanceof Error ? error.message : "Unable to load vendor summary";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
