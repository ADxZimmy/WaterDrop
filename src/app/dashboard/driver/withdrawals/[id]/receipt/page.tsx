"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  Download,
  Droplets,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ListPageSkeleton } from "@/components/ui/loading-skeletons";
import { Separator } from "@/components/ui/separator";

type DriverPayoutRequestRecord = {
  id: string;
  amountNaira: number;
  destinationLabel: string;
  status: "pending" | "paid" | "rejected";
  requestedAt: number;
  reviewedAt?: number;
  reviewNote?: string;
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

export default function WithdrawalReceiptPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [payoutRequest, setPayoutRequest] = useState<DriverPayoutRequestRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadPayoutRequest = async () => {
      try {
        const response = await fetch(`/api/driver/payout-requests/${id}`, {
          method: "GET",
        });
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(payload?.error ?? "Unable to load payout receipt.");
        }

        if (isMounted) {
          setPayoutRequest((payload?.payoutRequest ?? null) as DriverPayoutRequestRecord | null);
          setError(null);
        }
      } catch (fetchError) {
        if (isMounted) {
          setPayoutRequest(null);
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Unable to load payout receipt."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (id) {
      void loadPayoutRequest();
    } else {
      setIsLoading(false);
      setError("Payout request not found.");
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleDownload = () => {
    if (!payoutRequest) {
      return;
    }

    const receiptContent = `
========================================
       WATERDROP WITHDRAWAL RECEIPT
========================================
Receipt ID: ${payoutRequest.id}
Requested: ${formatDateTime(payoutRequest.requestedAt)}
Status: ${payoutRequest.status}
----------------------------------------
AMOUNT: ${formatCurrency(payoutRequest.amountNaira)}
DESTINATION: ${payoutRequest.destinationLabel}
${payoutRequest.reviewedAt ? `REVIEWED: ${formatDateTime(payoutRequest.reviewedAt)}` : ""}
${payoutRequest.reviewNote ? `NOTE: ${payoutRequest.reviewNote}` : ""}
----------------------------------------
Transaction recorded via WaterDrop payout workflow.
Keep this receipt for your records.
========================================
    `;
    const blob = new Blob([receiptContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `receipt-${payoutRequest.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 p-4 md:p-8 flex flex-col items-center">
        <ListPageSkeleton rows={3} className="max-w-lg px-0 py-0" />
      </div>
    );
  }

  if (error || !payoutRequest) {
    return (
      <div className="min-h-screen bg-muted/30 p-4 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-lg">
          <Card className="border-none shadow-sm rounded-3xl bg-white">
            <CardContent className="p-8 space-y-4">
              <h1 className="text-2xl font-bold font-headline">Receipt unavailable</h1>
              <p className="text-sm text-muted-foreground">
                {error ?? "Unable to load payout receipt."}
              </p>
              <Button variant="outline" className="rounded-xl" onClick={() => router.back()}>
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-lg space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold font-headline text-foreground">Transaction Receipt</h1>
        </div>

        <Card className="border-none shadow-2xl rounded-[32px] overflow-hidden bg-white">
          <CardHeader className="bg-primary p-8 text-white text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <Droplets className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold font-headline">WaterDrop Payout</CardTitle>
            <p className="text-primary-foreground/80 text-sm">Official Transaction Record</p>
          </CardHeader>

          <CardContent className="p-8 space-y-8">
            <div className="text-center space-y-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Total Amount
              </p>
              <h2 className="text-4xl font-bold text-slate-900">
                {formatCurrency(payoutRequest.amountNaira)}
              </h2>
              <Badge
                className={`mt-2 border-none rounded-full px-4 ${
                  payoutRequest.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : payoutRequest.status === "paid"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                }`}
              >
                {payoutRequest.status}
              </Badge>
            </div>

            <Separator />

            <div className="grid grid-cols-1 gap-6">
              <div className="flex justify-between items-center text-sm text-foreground">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Receipt ID</span>
                </div>
                <span className="font-bold font-mono">{payoutRequest.id}</span>
              </div>

              <div className="flex justify-between items-center text-sm text-foreground">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Requested</span>
                </div>
                <span className="font-medium text-slate-700">
                  {formatDateTime(payoutRequest.requestedAt)}
                </span>
              </div>

              {payoutRequest.reviewedAt ? (
                <div className="flex justify-between items-center text-sm text-foreground">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Reviewed</span>
                  </div>
                  <span className="font-medium text-slate-700">
                    {formatDateTime(payoutRequest.reviewedAt)}
                  </span>
                </div>
              ) : null}

              <div className="flex justify-between items-start text-sm text-foreground">
                <div className="flex items-center gap-2 text-muted-foreground shrink-0">
                  <Building2 className="h-4 w-4" />
                  <span>Destination</span>
                </div>
                <span className="font-medium text-slate-700 text-right max-w-[180px]">
                  {payoutRequest.destinationLabel}
                </span>
              </div>

              {payoutRequest.reviewNote ? (
                <div className="flex justify-between items-start text-sm text-foreground">
                  <div className="flex items-center gap-2 text-muted-foreground shrink-0">
                    <FileText className="h-4 w-4" />
                    <span>Review note</span>
                  </div>
                  <span className="font-medium text-slate-700 text-right max-w-[180px]">
                    {payoutRequest.reviewNote}
                  </span>
                </div>
              ) : null}
            </div>

            <Separator />

            <div className="p-4 bg-muted/20 rounded-2xl border border-dashed border-muted-foreground/20 text-center text-foreground">
              <p className="text-[10px] text-muted-foreground leading-relaxed uppercase font-bold tracking-tighter">
                This receipt confirms that the payout request has been recorded in WaterDrop.
                Final settlement timing depends on vendor review and transfer processing.
              </p>
            </div>
          </CardContent>

          <CardFooter className="p-8 pt-0 flex flex-col gap-3">
            <Button
              className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 gap-2"
              onClick={handleDownload}
            >
              <Download className="h-5 w-5" /> Download Receipt
            </Button>
            <Button
              variant="ghost"
              className="w-full h-12 rounded-xl text-muted-foreground"
              onClick={() => router.back()}
            >
              Close
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
