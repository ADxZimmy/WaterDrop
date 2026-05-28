"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, CheckCircle2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ListPageSkeleton } from "@/components/ui/loading-skeletons";
import { useDriverWorkspace } from "@/hooks/use-driver-workspace";
import { useToast } from "@/hooks/use-toast";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function WithdrawalPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { workspace, isLoading, error } = useDriverWorkspace();
  const [destinationLabel, setDestinationLabel] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!destinationLabel.trim()) {
      toast({
        title: "Destination required",
        description: "Enter the bank or payout destination label for this request.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/driver/payout-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinationLabel }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to create payout request.");
      }

      toast({
        title: "Payout request submitted",
        description: "Your live withdrawal request has been sent to your vendor for review.",
      });

      router.push(`/dashboard/driver/withdrawals/${payload.payoutRequest.id}/receipt`);
    } catch (submitError) {
      toast({
        title: "Request failed",
        description:
          submitError instanceof Error
            ? submitError.message
            : "Unable to create payout request.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <ListPageSkeleton rows={3} className="max-w-3xl p-0" />;
  }

  if (error || !workspace) {
    return (
      <div className="p-4 md:p-8 max-w-3xl mx-auto">
        <Card className="border-none shadow-sm rounded-3xl">
          <CardContent className="p-8 space-y-2">
            <h1 className="text-2xl font-bold font-headline">Withdrawal unavailable</h1>
            <p className="text-sm text-muted-foreground">
              {error ?? "Unable to load withdrawal form."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const availableBalanceNaira = workspace.payouts.availableBalanceNaira;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/driver/earnings">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold font-headline">Request Withdrawal</h1>
      </div>

      <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
        <CardHeader className="bg-primary text-white p-8">
          <CardTitle className="text-lg">Available Balance</CardTitle>
          <CardDescription className="text-primary-foreground/80">
            WaterDrop currently withdraws the full available accrued balance per request.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="rounded-3xl bg-primary/5 border border-primary/10 p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs uppercase font-bold tracking-widest text-muted-foreground">
                  Amount to Request
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {formatCurrency(availableBalanceNaira)}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="destinationLabel">Payout destination</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="destinationLabel"
                placeholder="e.g. GTBank Savings (•••• 4452)"
                className="pl-10 h-12 rounded-2xl"
                value={destinationLabel}
                onChange={(event) => setDestinationLabel(event.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              This label is stored with the payout request so your vendor can identify the destination.
            </p>
          </div>

          {availableBalanceNaira === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-muted-foreground">
              You do not have any accrued delivered-order balance available yet.
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
              Submitting this request will move all currently available accrued payouts into a pending vendor review.
            </div>
          )}
        </CardContent>
        <CardFooter className="p-8 pt-0 flex gap-3">
          <Link href="/dashboard/driver/earnings" className="flex-1">
            <Button variant="outline" className="w-full h-12 rounded-2xl">
              Cancel
            </Button>
          </Link>
          <Button
            className="flex-1 h-12 rounded-2xl shadow-lg shadow-primary/20 gap-2"
            onClick={() => void handleSubmit()}
            disabled={isSubmitting || availableBalanceNaira <= 0}
          >
            <CheckCircle2 className="h-4 w-4" />
            {isSubmitting ? "Submitting..." : "Submit Payout Request"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
