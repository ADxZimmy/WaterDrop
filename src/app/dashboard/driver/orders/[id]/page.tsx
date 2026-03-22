"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  Package,
  Phone,
  Route,
  ShieldAlert,
  Wallet,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { DriverOrderReferencePayload } from "@/lib/driver/workspace-types";
import { getOrderExecutionEventDescription, getOrderExecutionEventLabel } from "@/lib/orders/execution";
import {
  ORDER_STATUS_STEPS,
  getOrderStatusLabel,
  getPaymentMethodLabel,
} from "@/lib/orders/status";

type DriverOrderReferenceResponse = {
  reference: DriverOrderReferencePayload;
};

function formatDateTime(timestamp: number) {
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

function getInitials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function DriverOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [reference, setReference] = useState<DriverOrderReferencePayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [failedAttemptNote, setFailedAttemptNote] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadReference = async () => {
      try {
        const response = await fetch(`/api/driver/orders/${orderId}`, {
          method: "GET",
        });
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(payload?.error ?? "Unable to load driver order reference.");
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
              : "Unable to load driver order reference."
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
      <div className="p-4 md:p-8 text-sm text-muted-foreground">
        Loading order reference...
      </div>
    );
  }

  if (error || !reference) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <Card className="border-none shadow-sm rounded-3xl">
          <CardContent className="p-8 space-y-4">
            <h1 className="text-2xl font-bold font-headline">Order reference unavailable</h1>
            <p className="text-sm text-muted-foreground">
              {error ?? "Unable to load driver order reference."}
            </p>
            <Button variant="outline" className="rounded-xl" onClick={() => router.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { order, vendor, capabilities } = reference;
  const currentStepIndex = ORDER_STATUS_STEPS.findIndex((step) => step.key === order.status);
  const arrivalRecorded = order.executionEvents.some((event) => event.type === "driver_arrived");
  const canConfirmArrival = order.status === "out_for_delivery" && !arrivalRecorded;
  const canConfirmDelivery = order.status === "out_for_delivery" && !order.deliveryProof;

  const handleDriverUpdate = async (
    payload:
      | { action: "confirm_arrival" }
      | { action: "confirm_delivery"; recipientName: string; note?: string }
      | { action: "report_failed_attempt"; note: string }
  ) => {
    setIsUpdating(true);

    try {
      const response = await fetch(`/api/driver/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const responsePayload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(responsePayload?.error ?? "Unable to update delivery progress.");
      }

      const nextReference = (responsePayload as DriverOrderReferenceResponse).reference ?? null;
      setReference(nextReference);
      if (payload.action === "confirm_delivery") {
        setRecipientName("");
        setDeliveryNote("");
      }
      if (payload.action === "report_failed_attempt") {
        setFailedAttemptNote("");
      }
      setError(null);
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Unable to update delivery progress."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="rounded-xl"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold font-headline">Order Reference</h1>
          <p className="text-muted-foreground text-sm flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            {formatDateTime(order.createdAt)} • {order.id}
          </p>
        </div>
        <Badge className="ml-auto bg-slate-100 text-slate-700 hover:bg-slate-100 border-none px-4">
          {getOrderStatusLabel(order.status)}
        </Badge>
      </div>

      <Card className="border-none shadow-sm rounded-3xl bg-primary text-white overflow-hidden">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase font-bold tracking-widest text-primary-foreground/70">
                Vendor Order Total
              </p>
              <h2 className="text-4xl font-bold font-headline mt-2">
                {formatCurrency(order.totalNaira)}
              </h2>
            </div>
            <div className="rounded-2xl bg-white/15 px-4 py-3 text-sm">
              Payment: {getPaymentMethodLabel(order.paymentMethod)}
            </div>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 text-sm text-primary-foreground">
            This order is live and assigned to your driver account.
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-muted/30 border-b p-6">
              <CardTitle className="text-lg flex items-center gap-2">
                <Route className="h-5 w-5 text-primary" />
                Delivery Route
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Pickup From
                </p>
                <p className="font-bold mt-1">{vendor?.businessName ?? order.vendorName}</p>
                <p className="text-sm text-muted-foreground">
                  {vendor?.address ?? "Vendor pickup address not stored yet."}
                </p>
              </div>

              <div className="border-l-2 border-dashed border-muted-foreground/20 pl-6">
                <p className="text-xs font-bold text-primary uppercase tracking-widest">
                  Dropoff To
                </p>
                <p className="font-bold mt-1">{order.deliveryAddress}</p>
                {reference.mapsUrl ? (
                  <a
                    href={reference.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex mt-2"
                  >
                    <Button variant="outline" size="sm" className="rounded-xl">
                      <MapPin className="h-4 w-4 mr-2" />
                      Open in Maps
                    </Button>
                  </a>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-muted/30 border-b p-6">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Manifest
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between rounded-2xl bg-muted/20 p-4"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} x {formatCurrency(item.unitPriceNaira)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">
                      {formatCurrency(item.quantity * item.unitPriceNaira)}
                    </p>
                  </div>
                </div>
              ))}
              <div className="rounded-2xl border border-slate-200 p-4 flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(order.subtotalNaira)}
                </span>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4 flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(order.deliveryFeeNaira)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <CardContent className="p-6 text-center space-y-4">
              <Avatar className="h-20 w-20 mx-auto border-2 border-primary/10">
                <AvatarFallback>{getInitials(order.customerName)}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-bold">{order.customerName}</h4>
                <p className="text-xs text-muted-foreground">Customer</p>
              </div>
              <div className="space-y-2 text-sm text-left">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{order.customerEmail ?? "Email unavailable"}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{order.customerPhone ?? "Phone unavailable"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="p-6 border-b">
              <CardTitle className="text-sm uppercase font-bold tracking-widest text-muted-foreground">
                Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {order.status === "cancelled" ? (
                <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-900">
                  This vendor order was cancelled on {formatDateTime(order.updatedAt)}.
                </div>
              ) : (
                ORDER_STATUS_STEPS.map((step, index) => {
                  const reached = currentStepIndex >= index;
                  const isCurrent = currentStepIndex === index;

                  return (
                    <div key={step.key} className="flex items-start gap-4">
                      <div
                        className={`mt-1 h-5 w-5 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${
                          reached ? "bg-primary" : "bg-muted-foreground/20"
                        }`}
                      >
                        {isCurrent ? (
                          <CheckCircle2 className="h-3 w-3 text-white" />
                        ) : null}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <CardContent className="p-6 text-sm text-muted-foreground space-y-3">
              {canConfirmArrival || canConfirmDelivery ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-4">
                  <p className="font-semibold text-slate-900">Driver completion</p>
                  {canConfirmArrival ? (
                    <Button
                      className="w-full rounded-xl"
                      disabled={isUpdating}
                      onClick={() => void handleDriverUpdate({ action: "confirm_arrival" })}
                    >
                      {isUpdating ? "Saving..." : "Confirm arrival"}
                    </Button>
                  ) : null}
                  {canConfirmDelivery ? (
                    <div className="space-y-3">
                      <Input
                        value={recipientName}
                        onChange={(event) => setRecipientName(event.target.value)}
                        placeholder="Recipient name"
                        disabled={isUpdating}
                      />
                      <Textarea
                        value={deliveryNote}
                        onChange={(event) => setDeliveryNote(event.target.value)}
                        placeholder="Delivery note (optional)"
                        disabled={isUpdating}
                        className="min-h-[96px] rounded-xl"
                      />
                      <Button
                        className="w-full rounded-xl shadow-lg shadow-primary/20"
                        disabled={isUpdating || recipientName.trim().length === 0}
                        onClick={() =>
                          void handleDriverUpdate({
                            action: "confirm_delivery",
                            recipientName,
                            note: deliveryNote,
                          })
                        }
                      >
                        {isUpdating ? "Saving..." : "Confirm delivery"}
                      </Button>
                    </div>
                  ) : null}
                  {order.status === "out_for_delivery" && !order.deliveryProof ? (
                    <div className="space-y-3 border-t border-slate-200 pt-4">
                      <p className="text-sm font-medium text-slate-900">Report failed attempt</p>
                      <Textarea
                        value={failedAttemptNote}
                        onChange={(event) => setFailedAttemptNote(event.target.value)}
                        placeholder="Reason the delivery could not be completed"
                        disabled={isUpdating}
                        className="min-h-[88px] rounded-xl"
                      />
                      <Button
                        variant="outline"
                        className="w-full rounded-xl border-amber-200 text-amber-700 hover:bg-amber-50"
                        disabled={isUpdating || failedAttemptNote.trim().length === 0}
                        onClick={() =>
                          void handleDriverUpdate({
                            action: "report_failed_attempt",
                            note: failedAttemptNote,
                          })
                        }
                      >
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        {isUpdating ? "Saving..." : "Report failed attempt"}
                      </Button>
                    </div>
                  ) : null}
                </div>
              ) : null}
              {order.deliveryProof ? (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-emerald-900">
                  <p className="font-semibold">Proof of delivery recorded</p>
                  <p className="text-sm mt-1">
                    Recipient: {order.deliveryProof.recipientName}
                  </p>
                  <p className="text-sm">
                    Confirmed {formatDateTime(order.deliveryProof.confirmedAt)}
                  </p>
                  {order.deliveryProof.note ? (
                    <p className="text-sm mt-1">{order.deliveryProof.note}</p>
                  ) : null}
                </div>
              ) : null}
              {order.driverPayout ? (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-emerald-900">
                  <p className="font-semibold">Driver payout snapshot</p>
                  <p className="text-sm mt-1">
                    {formatCurrency(order.driverPayout.amountNaira)} • {order.driverPayout.status}
                  </p>
                </div>
              ) : null}
              <div className="flex items-start gap-3">
                <ShieldAlert className="h-4 w-4 mt-0.5 text-primary" />
                <p>
                  WaterDrop now stores arrival and recipient-confirmed delivery events. Photo,
                  OTP, and route telemetry are still not captured.
                </p>
              </div>
              <Link href={`/dashboard/driver/navigate/${order.id}`}>
                <Button className="w-full rounded-xl shadow-lg shadow-primary/20">
                  <MapPin className="h-4 w-4 mr-2" />
                  Open Delivery Guidance
                </Button>
              </Link>
              {order.executionEvents.length > 0 ? (
                <div className="rounded-2xl border border-slate-200 p-4 space-y-3">
                  <p className="font-semibold text-slate-900">Execution log</p>
                  {order.executionEvents
                    .slice()
                    .sort((left, right) => right.occurredAt - left.occurredAt)
                    .map((event) => (
                      <div key={event.id} className="flex items-start gap-3 text-sm">
                        <Clock3 className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-slate-900">
                            {getOrderExecutionEventLabel(event.type)}
                          </p>
                          <p className="text-muted-foreground">
                            {getOrderExecutionEventDescription(event)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(event.occurredAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              ) : null}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Wallet className="h-4 w-4" />
                {capabilities.driverAssignments ? "Assigned delivery" : "Updated"}{" "}
                {formatDateTime(order.updatedAt)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
