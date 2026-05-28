"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, ScrollText } from "lucide-react";
import type { PayoutLedgerEntry } from "@/lib/domain/schemas";
import { getPayoutLedgerKindLabel } from "@/lib/finance/payout-ledger-labels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ListPageSkeleton } from "@/components/ui/loading-skeletons";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDateTime(timestamp: number) {
  return new Date(timestamp).toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function AdminPayoutLedgerPage() {
  const [entries, setEntries] = useState<PayoutLedgerEntry[]>([]);
  const [vendorFilter, setVendorFilter] = useState("");
  const [appliedVendor, setAppliedVendor] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEntries = useCallback(async (vendorId: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ limit: "150" });
      if (vendorId.trim()) {
        params.set("vendorId", vendorId.trim());
      }
      const response = await fetch(`/api/admin/payout-ledger?${params.toString()}`, {
        method: "GET",
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to load payout ledger.");
      }
      setEntries((payload?.entries ?? []) as PayoutLedgerEntry[]);
      setError(null);
    } catch (fetchError) {
      setEntries([]);
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load payout ledger.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEntries("");
  }, [loadEntries]);

  const csvHref = `/api/admin/payout-ledger?format=csv&limit=200${
    appliedVendor.trim() ? `&vendorId=${encodeURIComponent(appliedVendor.trim())}` : ""
  }`;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-xl w-fit">
          <Link href="/admin">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <ScrollText className="h-8 w-8 text-primary" />
            Payout settlement ledger
          </h1>
          <p className="text-muted-foreground mt-1">
            Read-only append-only audit of commission accruals and payout actions across vendors (NGN).
          </p>
        </div>
        <Button variant="outline" className="rounded-xl gap-2" asChild>
          <a href={csvHref}>
            <Download className="h-4 w-4" />
            Export CSV
          </a>
        </Button>
      </div>

      <Card className="border-none shadow-sm rounded-3xl">
        <CardHeader>
          <CardTitle>Filter</CardTitle>
          <CardDescription>
            Leave blank for platform-wide recent entries, or enter a vendor UID to scope the list and
            export.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3 max-w-xl">
          <Input
            placeholder="Vendor UID (optional)"
            className="rounded-xl"
            value={vendorFilter}
            onChange={(e) => setVendorFilter(e.target.value)}
          />
          <Button
            className="rounded-xl"
            onClick={() => {
              setAppliedVendor(vendorFilter);
              void loadEntries(vendorFilter);
            }}
            disabled={isLoading}
          >
            Apply
          </Button>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="text-lg">Ledger rows</CardTitle>
          <CardDescription>
            {appliedVendor.trim()
              ? `Filtered to vendor ${appliedVendor.trim().slice(0, 12)}…`
              : "Most recent platform-wide events."}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <ListPageSkeleton rows={5} className="max-w-none px-6 py-6" />
          ) : error ? (
            <p className="p-6 text-sm text-destructive">{error}</p>
          ) : entries.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No ledger entries yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20">
                    <TableHead className="pl-6">When</TableHead>
                    <TableHead>Kind</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead className="pr-6">Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="pl-6 text-sm text-muted-foreground whitespace-nowrap">
                        {formatDateTime(entry.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal">
                          {getPayoutLedgerKindLabel(entry.kind)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">{formatCurrency(entry.amountNaira)}</TableCell>
                      <TableCell className="font-mono text-xs">{entry.vendorId.slice(0, 10)}…</TableCell>
                      <TableCell className="font-mono text-xs">{entry.driverUid.slice(0, 10)}…</TableCell>
                      <TableCell className="pr-6 text-xs text-muted-foreground max-w-[220px] truncate">
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
