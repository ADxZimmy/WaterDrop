import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/server";
import { formatPayoutLedgerEntriesAsCsv } from "@/lib/finance/payout-ledger-csv";
import {
  listPayoutLedgerEntriesGlobally,
  listVendorPayoutLedgerEntries,
} from "@/lib/finance/payout-ledger";

export async function GET(request: Request) {
  try {
    await requireRole(["admin"]);
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const vendorId = searchParams.get("vendorId")?.trim();
    const limit = limitParam ? Number.parseInt(limitParam, 10) : 100;
    const isCsv = searchParams.get("format") === "csv";
    const bounded = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 200) : 100;

    const entries = vendorId
      ? await listVendorPayoutLedgerEntries(vendorId, bounded)
      : await listPayoutLedgerEntriesGlobally(bounded);

    if (isCsv) {
      const csv = formatPayoutLedgerEntriesAsCsv(entries);
      const safe = vendorId ? vendorId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 16) : "all-platform";
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
