import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/server";
import { getAdminAnalyticsPayload } from "@/lib/admin/ops";

export async function GET() {
  try {
    await requireRole(["admin"]);
    const analytics = await getAdminAnalyticsPayload();
    return NextResponse.json({ analytics }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load admin analytics";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
