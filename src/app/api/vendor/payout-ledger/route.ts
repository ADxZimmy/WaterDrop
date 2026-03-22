import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/server";
import { formatPayoutLedgerEntriesAsCsv } from "@/lib/finance/payout-ledger-csv";
import { listVendorPayoutLedgerEntries } from "@/lib/finance/payout-ledger";

export async function GET(request: Request) {
  try {
    const user = await requireRole(["vendor"]);
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Number.parseInt(limitParam, 10) : 50;
    const isCsv = searchParams.get("format") === "csv";

    const entries = await listVendorPayoutLedgerEntries(user.uid, Number.isFinite(limit) ? limit : 50);

    if (isCsv) {
      const csv = formatPayoutLedgerEntriesAsCsv(entries);
      const safe = user.uid.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 12) || "vendor";
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="waterdrop-payout-ledger-${safe}.csv"`,
        },
      });
    }

    return NextResponse.json({ entries }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load ledger";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
