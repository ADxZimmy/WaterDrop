"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Search,
  Wallet,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

type VendorPayoutRequestRecord = {
  id: string;
  driverName: string;
  amountNaira: number;
  destinationLabel: string;
  status: "pending" | "paid" | "rejected";
  requestedAt: number;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDateTime(timestamp: number) {
  return new Date(timestamp).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function VendorWithdrawalsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [requests, setRequests] = useState<VendorPayoutRequestRecord[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadRequests = async () => {
      try {
        const response = await fetch("/api/vendor/payout-requests", { method: "GET" });
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(payload?.error ?? "Unable to load payout requests.");
        }

        if (isMounted) {
          setRequests((payload?.requests ?? []) as VendorPayoutRequestRecord[]);
          setError(null);
        }
      } catch (fetchError) {
        if (isMounted) {
          setRequests([]);
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Unable to load payout requests."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadRequests();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredRequests = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return requests;
    }

    return requests.filter(
      (request) =>
        request.id.toLowerCase().includes(normalizedQuery) ||
        request.driverName.toLowerCase().includes(normalizedQuery) ||
        request.destinationLabel.toLowerCase().includes(normalizedQuery) ||
        request.status.toLowerCase().includes(normalizedQuery)
    );
  }, [query, requests]);

  const pendingCount = requests.filter((request) => request.status === "pending").length;
  const paidTotalNaira = requests
    .filter((request) => request.status === "paid")
    .reduce((sum, request) => sum + request.amountNaira, 0);

  const handleReview = async (requestId: string, action: "paid" | "rejected") => {
    setUpdatingId(requestId);

    try {
      const response = await fetch(`/api/vendor/payout-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to review payout request.");
      }

      setRequests((currentRequests) =>
        currentRequests.map((request) =>
          request.id === requestId ? { ...request, ...payload.payoutRequest } : request
        )
      );

      toast({
        title: action === "paid" ? "Payout marked paid" : "Payout request rejected",
        description: `Request ${requestId} has been updated.`,
      });
    } catch (reviewError) {
      toast({
        title: "Review failed",
        description:
          reviewError instanceof Error
            ? reviewError.message
            : "Unable to review payout request.",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold font-headline">Withdrawal Requests</h1>
          <p className="text-muted-foreground">Manage live payout requests for your delivery fleet.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm p-6 rounded-3xl bg-white">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase font-bold tracking-widest text-muted-foreground">
              Pending Approval
            </p>
            <Badge className="bg-yellow-100 text-yellow-700 border-none text-[10px] px-2 py-0">
              Action
            </Badge>
          </div>
          <h3 className="text-3xl font-bold mt-2">{pendingCount}</h3>
        </Card>

        <Card className="border-none shadow-sm p-6 rounded-3xl bg-white">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase font-bold tracking-widest text-muted-foreground">
              Total Paid
            </p>
            <Wallet className="h-4 w-4 text-emerald-500" />
          </div>
          <h3 className="text-3xl font-bold mt-2">{formatCurrency(paidTotalNaira)}</h3>
        </Card>

        <Card className="border-none shadow-sm p-6 rounded-3xl bg-primary text-white">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase font-bold tracking-widest opacity-80">
              Total Requests
            </p>
            <Clock className="h-4 w-4 opacity-40" />
          </div>
          <h3 className="text-2xl font-bold mt-2">{requests.length}</h3>
        </Card>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-border overflow-hidden">
        <div className="p-6 border-b flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by driver, destination, or ID..."
              className="pl-10 h-11 rounded-xl"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-sm text-muted-foreground">Loading payout requests...</div>
        ) : error ? (
          <div className="p-8 text-sm text-destructive">{error}</div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-8 text-sm text-muted-foreground">No payout requests found.</div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="pl-6">Driver</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead className="text-right pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((req) => (
                <TableRow key={req.id} className="group">
                  <TableCell className="pl-6">
                    <div>
                      <p className="font-bold text-sm text-foreground">{req.driverName}</p>
                      <p className="text-[10px] text-muted-foreground">{req.id}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-primary">
                    {formatCurrency(req.amountNaira)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(req.requestedAt)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`rounded-full px-3 border-none ${
                        req.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : req.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {req.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground italic">
                    {req.destinationLabel}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    {req.status === "pending" ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 rounded-lg border-green-200 text-green-600 hover:bg-green-50"
                          onClick={() => void handleReview(req.id, "paid")}
                          disabled={updatingId === req.id}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          {updatingId === req.id ? "Saving..." : "Mark Paid"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 rounded-lg border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => void handleReview(req.id, "rejected")}
                          disabled={updatingId === req.id}
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1" />
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {req.status === "paid" ? "Settled" : "Rejected"}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}



