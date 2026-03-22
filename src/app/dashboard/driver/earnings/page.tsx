"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Clock3, Download, ScrollText, Truck, Wallet } from "lucide-react";
import type { PayoutLedgerEntry } from "@/lib/domain/schemas";
import { getPayoutLedgerKindLabel } from "@/lib/finance/payout-ledger-labels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDriverWorkspace } from "@/hooks/use-driver-workspace";

function formatDateTime(timestamp: number | null) {
  if (!timestamp) {
    return "No activity yet";
  }

  return new Date(timestamp).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function DriverEarningsPage() {
  const { workspace, isLoading, error } = useDriverWorkspace();
  const [ledgerEntries, setLedgerEntries] = useState<PayoutLedgerEntry[]>([]);
  const [ledgerError, setLedgerError] = useState<string | null>(null);
  const [ledgerLoading, setLedgerLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadLedger = async () => {
      try {
        const response = await fetch("/api/driver/payout-ledger?limit=30", { method: "GET" });
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(payload?.error ?? "Unable to load payout ledger.");
        }
        if (isMounted) {
          setLedgerEntries((payload?.entries ?? []) as PayoutLedgerEntry[]);
          setLedgerError(null);
        }
      } catch (fetchError) {
        if (isMounted) {
          setLedgerEntries([]);
          setLedgerError(
            fetchError instanceof Error ? fetchError.message : "Unable to load payout ledger."
          );
        }
      } finally {
        if (isMounted) {
          setLedgerLoading(false);
        }
      }
    };

    void loadLedger();
    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 text-sm text-muted-foreground">
        Loading driver earnings...
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <Card className="border-none shadow-sm rounded-3xl">
          <CardContent className="p-8 space-y-2">
            <h1 className="text-2xl font-bold font-headline">Driver earnings unavailable</h1>
            <p className="text-sm text-muted-foreground">
              {error ?? "Unable to load driver earnings."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { driver, vendor, assignments, payouts, recentPayoutRequests, capabilities } = workspace;

  if (!driver) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <Card className="border-none shadow-sm rounded-3xl">
          <CardContent className="p-8 space-y-4">
            <h1 className="text-2xl font-bold font-headline">Driver earnings</h1>
            <p className="text-sm text-muted-foreground">
              Complete your driver setup before any driver workspace data can be shown.
            </p>
            <Link href="/auth/onboarding/driver">
              <Button className="rounded-xl shadow-lg shadow-primary/20">
                Complete Driver Setup
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold font-headline">Earnings & Payouts</h1>
        <p className="text-muted-foreground">
          Delivered assigned orders now accrue driver payouts automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none bg-primary text-white p-6 rounded-[32px] shadow-xl shadow-primary/20">
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Wallet className="h-5 w-5" />
              </div>
              <Badge className="bg-white/20 text-white border-none">
                {capabilities.payoutTracking ? "Live" : "Not wired"}
              </Badge>
            </div>
            <div>
              <p className="text-xs uppercase font-bold tracking-widest text-primary-foreground/70">
                Available Balance
              </p>
              <h2 className="text-4xl font-bold font-headline mt-2">
                {formatCurrency(payouts.availableBalanceNaira)}
              </h2>
              <p className="text-primary-foreground/80 text-sm mt-2">
                Ready to withdraw from delivered orders that have not entered a payout request.
              </p>
            </div>
            <Link href="/dashboard/driver/withdraw">
              <Button className="bg-white text-primary hover:bg-white/90 rounded-2xl h-11 font-bold">
                Request Withdrawal
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="border-none shadow-sm rounded-[32px] bg-white">
          <CardContent className="p-6 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase font-bold tracking-widest text-slate-400">
                Assigned Vendor
              </p>
              <h2 className="text-2xl font-bold mt-2 text-slate-900">
                {vendor?.businessName ?? driver.vendorId}
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Delivered assignments: {assignments.deliveredAssignedOrders.toLocaleString("en-NG")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-[32px] bg-white">
          <CardContent className="p-6 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase font-bold tracking-widest text-slate-400">
                Requested Balance
              </p>
              <h2 className="text-2xl font-bold mt-2 text-slate-900">
                {formatCurrency(payouts.requestedBalanceNaira)}
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Waiting on vendor review or settlement.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle>Recent Payout Requests</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {recentPayoutRequests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-muted-foreground">
              No payout requests yet. Withdrawals will appear here after you submit one.
            </div>
          ) : (
            recentPayoutRequests.map((request) => (
              <div
                key={request.id}
                className="rounded-2xl border border-slate-200 p-4 flex flex-col md:flex-row md:items-center gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-slate-900">{request.id}</p>
                    <Badge
                      className={`border-none ${
                        request.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : request.status === "paid"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {request.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {request.destinationLabel}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                    <Clock3 className="h-3.5 w-3.5" />
                    Requested {formatDateTime(request.requestedAt)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-bold text-slate-900">
                    {formatCurrency(request.amountNaira)}
                  </p>
                  <Link href={`/dashboard/driver/withdrawals/${request.id}/receipt`}>
                    <Button variant="outline" className="rounded-xl">
                      Receipt
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          )}
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/driver/withdrawals">
              <Button variant="outline" className="rounded-xl">
                View Withdrawal History
              </Button>
            </Link>
            <Link href="/dashboard/driver/withdraw">
              <Button className="rounded-xl shadow-lg shadow-primary/20">
                Request New Withdrawal
              </Button>
            </Link>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4 text-sm text-muted-foreground">
            Lifetime paid: {formatCurrency(payouts.lifetimePaidNaira)}.
            {capabilities.turnByTurnNavigation
              ? " Driver navigation telemetry is live."
              : " Turn-by-turn telemetry is still handled outside WaterDrop."}
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
        <CardHeader className="bg-slate-50 border-b flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex items-start gap-2">
            <ScrollText className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <CardTitle>Payout audit log</CardTitle>
              <p className="text-sm font-normal text-muted-foreground mt-1">
                Append-only history of accruals and payout actions (NGN).
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="rounded-xl gap-2 shrink-0" asChild>
            <a href="/api/driver/payout-ledger?format=csv&limit=100">
              <Download className="h-4 w-4" />
              Download CSV
            </a>
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          {ledgerLoading ? (
            <p className="text-sm text-muted-foreground">Loading ledger…</p>
          ) : ledgerError ? (
            <p className="text-sm text-destructive">{ledgerError}</p>
          ) : ledgerEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No ledger entries yet. Deliver orders to accrue commission; withdrawal actions appear here.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="pl-4">When</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="pr-4">Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledgerEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="pl-4 text-sm text-muted-foreground whitespace-nowrap">
                        {formatDateTime(entry.createdAt)}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {getPayoutLedgerKindLabel(entry.kind)}
                      </TableCell>
                      <TableCell className="text-sm font-semibold">
                        {formatCurrency(entry.amountNaira)}
                      </TableCell>
                      <TableCell className="pr-4 text-xs text-muted-foreground max-w-[180px] truncate">
                        {entry.orderId
                          ? `Order ${entry.orderId.slice(0, 8)}`
                          : entry.payoutRequestId
                            ? `Payout ${entry.payoutRequestId.slice(0, 8)}`
                            : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}