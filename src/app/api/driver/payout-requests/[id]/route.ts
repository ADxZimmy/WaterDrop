import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/server";
import { getDriverPayoutRequest } from "@/lib/driver/compensation";

export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(["driver"]);
    const { id } = await context.params;
    const payoutRequest = await getDriverPayoutRequest(user.uid, id);

    if (!payoutRequest) {
      return NextResponse.json({ error: "Payout request not found" }, { status: 404 });
    }

    return NextResponse.json({ payoutRequest }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load payout request";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
