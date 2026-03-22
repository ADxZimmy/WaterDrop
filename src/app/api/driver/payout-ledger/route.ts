import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/server";
import { listDriverPayoutLedgerEntries } from "@/lib/finance/payout-ledger";

export async function GET(request: Request) {
  try {
    const user = await requireRole(["driver"]);
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Number.parseInt(limitParam, 10) : 50;

    const entries = await listDriverPayoutLedgerEntries(user.uid, Number.isFinite(limit) ? limit : 50);
    return NextResponse.json({ entries }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load ledger";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
