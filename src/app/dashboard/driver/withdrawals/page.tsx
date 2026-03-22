"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  DollarSign,
  History,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type DriverPayoutRequestRecord = {
  id: string;
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

export default function DriverWithdrawalHistoryPage() {
  const [requests, setRequests] = useState<DriverPayoutRequestRecord[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadRequests = async () => {
      try {
        const response = await fetch("/api/driver/payout-requests", { method: "GET" });
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(payload?.error ?? "Unable to load payout requests.");
        }

        if (isMounted) {
          setRequests((payload?.requests ?? []) as DriverPayoutRequestRecord[]);
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
        request.destinationLabel.toLowerCase().includes(normalizedQuery) ||
        request.status.toLowerCase().includes(normalizedQuery)
    );
  }, [query, requests]);

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/driver/earnings">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold font-headline">Withdrawal History</h1>
          <p className="text-muted-foreground">Track your live payout requests and status.</p>
        </div>
      </div>

      <div className="flex gap-2 text-foreground">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search requests..."
            className="pl-10 h-11 rounded-xl"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <Card className="border-none shadow-sm rounded-3xl bg-white">
          <CardContent className="p-8 text-sm text-muted-foreground">
            Loading withdrawal history...
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="border-none shadow-sm rounded-3xl bg-white">
          <CardContent className="p-8 text-sm text-destructive">{error}</CardContent>
        </Card>
      ) : filteredRequests.length === 0 ? (
        <Card className="border-none shadow-sm rounded-3xl bg-white">
          <CardContent className="p-8 text-sm text-muted-foreground">
            No payout requests match your search.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((item) => (
            <Card key={item.id} className="border-none shadow-sm overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
                        item.status === "pending"
                          ? "bg-yellow-50 text-yellow-600"
                          : item.status === "paid"
                            ? "bg-green-50 text-green-600"
                            : "bg-red-50 text-red-600"
                      }`}
                    >
                      <History className="h-6 w-6" />
                    </div>
                    <div className="text-foreground">
                      <h4 className="font-bold text-sm">{item.id}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-bold mt-0.5">
                        <Calendar className="h-3 w-3" /> {formatDateTime(item.requestedAt)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-primary">
                      {formatCurrency(item.amountNaira)}
                    </p>
                    <Badge
                      variant="outline"
                      className={`text-[10px] mt-1 border-none ${
                        item.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : item.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.status}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-muted/50">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground italic">
                    <DollarSign className="h-3.5 w-3.5" />
                    {item.destinationLabel}
                  </div>
                  <Link href={`/dashboard/driver/withdrawals/${item.id}/receipt`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1 text-primary group-hover:bg-primary/5"
                    >
                      View Receipt <ChevronRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
