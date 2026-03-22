import type { PayoutLedgerEntry } from "@/lib/domain/schemas";
import { getPayoutLedgerKindLabel } from "@/lib/finance/payout-ledger-labels";

function escapeCsvCell(value: string) {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function formatPayoutLedgerEntriesAsCsv(entries: PayoutLedgerEntry[]) {
  const header = [
    "id",
    "kind",
    "kind_label",
    "created_at_iso",
    "currency",
    "amount_naira",
    "vendor_id",
    "driver_uid",
    "order_id",
    "payout_request_id",
    "order_ids",
    "note",
  ];

  const lines = [header.join(",")];

  for (const entry of entries) {
    const row = [
      entry.id,
      entry.kind,
      getPayoutLedgerKindLabel(entry.kind),
      new Date(entry.createdAt).toISOString(),
      entry.currency,
      String(entry.amountNaira),
      entry.vendorId,
      entry.driverUid,
      entry.orderId ?? "",
      entry.payoutRequestId ?? "",
      entry.orderIds?.join(";") ?? "",
      entry.note ?? "",
    ].map((cell) => escapeCsvCell(String(cell)));
    lines.push(row.join(","));
  }

  return lines.join("\r\n");
}
