import type { PayoutLedgerEntry } from "@/lib/domain/schemas";

export function getPayoutLedgerKindLabel(kind: PayoutLedgerEntry["kind"]) {
  const labels: Record<PayoutLedgerEntry["kind"], string> = {
    commission_accrued: "Commission accrued",
    payout_requested: "Payout requested",
    payout_paid: "Payout marked paid",
    payout_rejected: "Payout rejected (restored)",
  };
  return labels[kind];
}
