"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Mail,
  MapPin,
  Navigation,
  Phone,
  Route,
  ShieldAlert,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListPageSkeleton } from "@/components/ui/loading-skeletons";
import type { DriverOrderReferencePayload } from "@/lib/driver/workspace-types";
import { getOrderStatusLabel, getPaymentMethodLabel } from "@/lib/orders/status";

type DriverOrderReferenceResponse = {
  reference: DriverOrderReferencePayload;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function DriverNavigatePage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [reference, setReference] = useState<DriverOrderReferencePayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadReference = async () => {
      try {
        const response = await fetch(`/api/driver/orders/${orderId}`, {
          method: "GET",
        });
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(payload?.error ?? "Unable to load delivery guidance.");
        }

        if (isMounted) {
          const data = payload as DriverOrderReferenceResponse;
          setReference(data.reference ?? null);
          setError(null);
        }
      } catch (fetchError) {
        if (isMounted) {
          setReference(null);
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Unable to load delivery guidance."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (orderId) {
      void loadReference();
    } else {
      setIsLoading(false);
      setError("Order not found.");
    }

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  if (isLoading) {
    return (
      <ListPageSkeleton rows={4} className="max-w-5xl p-0" />
    );
  }

  if (error || !reference) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <Card className="border-none shadow-sm rounded-3xl">
          <CardContent className="p-8 space-y-4">
            <h1 className="text-2xl font-bold font-headline">Delivery guidance unavailable</h1>
            <p className="text-sm text-muted-foreground">
              {error ?? "Unable to load delivery guidance."}
            </p>
            <Button variant="outline" className="rounded-xl" onClick={() => router.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { order, vendor, capabilities, mapsUrl } = reference;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold font-headline">Delivery Guidance</h1>
          <p className="text-sm text-muted-foreground">
            Live destination and contact reference for your assigned order {order.id}.
          </p>
        </div>
        <Badge className="ml-auto bg-slate-100 text-slate-700 hover:bg-slate-100 border-none">
          {getOrderStatusLabel(order.status)}
        </Badge>
      </div>

      <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-primary text-white">
        <CardContent className="p-8 space-y-4">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
              <Navigation className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-widest text-primary-foreground/70">
                Dropoff Destination
              </p>
              <h2 className="text-2xl font-bold mt-2">{order.deliveryAddress}</h2>
              <p className="text-sm text-primary-foreground/80 mt-2">
                WaterDrop does not store turn-by-turn map telemetry yet. Use your device&apos;s
                map application for live navigation.
              </p>
            </div>
          </div>
          {mapsUrl ? (
            <a href={mapsUrl} target="_blank" rel="noreferrer">
              <Button className="bg-white text-primary hover:bg-white/90 rounded-2xl h-12 font-bold shadow-lg">
                <MapPin className="h-4 w-4 mr-2" />
                Open in Maps
              </Button>
            </a>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Route className="h-5 w-5 text-primary" />
              Route Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Pickup From
              </p>
              <p className="font-semibold text-slate-900 mt-1">
                {vendor?.businessName ?? order.vendorName}
              </p>
              <p className="text-sm text-muted-foreground">
                {vendor?.address ?? "Vendor pickup address not stored yet."}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Dropoff To
              </p>
              <p className="font-semibold text-slate-900 mt-1">{order.deliveryAddress}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4 text-sm text-muted-foreground">
              Payment method: {getPaymentMethodLabel(order.paymentMethod)}
              <br />
              Order total: {formatCurrency(order.totalNaira)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-primary" />
              Customer Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4 text-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Customer
              </p>
              <p className="font-semibold text-slate-900 mt-1">{order.customerName}</p>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{order.customerEmail ?? "Email unavailable"}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{order.customerPhone ?? "Phone unavailable"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldAlert className="h-5 w-5 text-primary" />
            Delivery Completion
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            Arrival and delivery confirmation now live on the driver order reference page. This
            screen still does not store turn-by-turn telemetry, photos, or OTP checks.
          </div>
          {order.deliveryProof ? (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
              Delivery confirmed for {order.deliveryProof.recipientName}.
            </div>
          ) : null}
          {order.driverPayout ? (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
              Delivery payout on completion: {formatCurrency(order.driverPayout.amountNaira)}.
            </div>
          ) : null}
          <div className="rounded-2xl border border-slate-200 p-4 flex items-center gap-3 text-sm text-muted-foreground">
            <Wallet className="h-4 w-4" />
            Driver assignment status: {capabilities.driverAssignments ? "live" : "not wired"}
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={`/dashboard/driver/orders/${order.id}`}>
              <Button variant="outline" className="rounded-xl">
                View Order Reference
              </Button>
            </Link>
            <Link href="/dashboard/driver">
              <Button className="rounded-xl shadow-lg shadow-primary/20">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
