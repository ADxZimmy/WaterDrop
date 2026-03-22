"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  MapPin,
  Package,
  Truck,
} from "lucide-react";
import type { DeliveryProof, OrderExecutionEvent, OrderStatus } from "@/lib/domain/schemas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrderExecutionEventDescription, getOrderExecutionEventLabel } from "@/lib/orders/execution";
import { ORDER_ACTIVE_STATUSES, ORDER_STATUS_STEPS, getOrderStatusLabel } from "@/lib/orders/status";

type CustomerOrderRecord = {
  id: string;
  vendorName?: string;
  status: OrderStatus;
  deliveryAddress?: string;
  totalNaira: number;
  createdAt: number;
  updatedAt: number;
  items: Array<{ productId: string; name: string; quantity: number; unitPriceNaira: number }>;
  executionEvents: OrderExecutionEvent[];
  deliveryProof?: DeliveryProof;
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
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function CustomerOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const orderId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [order, setOrder] = useState<CustomerOrderRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`, { method: "GET" });
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(payload?.error ?? "Unable to load order.");
        }

        if (isMounted) {
          setOrder((payload?.order ?? null) as CustomerOrderRecord | null);
          setError(null);
        }
      } catch (fetchError) {
        if (isMounted) {
          setOrder(null);
          setError(fetchError instanceof Error ? fetchError.message : "Unable to load order.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (orderId) {
      void loadOrder();
    } else {
      setIsLoading(false);
      setError("Order not found.");
    }

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  const activeIndex = useMemo(() => {
    if (!order || order.status === "cancelled") {
      return -1;
    }

    return ORDER_STATUS_STEPS.findIndex((step) => step.key === order.status);
  }, [order]);

  if (isLoading) {
    return <div className="p-4 md:p-8 text-sm text-muted-foreground">Loading order...</div>;
  }

  if (error || !order) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <Card className="border-none shadow-sm rounded-3xl">
          <CardContent className="p-8 space-y-4">
            <h1 className="text-2xl font-bold font-headline">Order unavailable</h1>
            <p className="text-sm text-muted-foreground">{error ?? "Unable to load order."}</p>
            <Button variant="outline" className="rounded-xl" onClick={() => router.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const failedAttemptEvents = order.executionEvents.filter(
    (event) => event.type === "delivery_failed_attempt"
  );

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-headline">Order Details</h1>
            <p className="text-sm text-muted-foreground">
              {order.vendorName ?? "Water Vendor"} • {order.id}
            </p>
          </div>
          <Badge className="ml-auto bg-slate-100 text-slate-700 border-none">
            {getOrderStatusLabel(order.status)}
          </Badge>
        </div>

        <Card className="border-none shadow-lg overflow-hidden bg-primary text-white">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase font-bold tracking-widest text-primary-foreground/70">
                  Order Total
                </p>
                <h2 className="text-3xl font-bold font-headline mt-2">
                  {formatCurrency(order.totalNaira)}
                </h2>
              </div>
              <Truck className="h-12 w-12 text-white/20" />
            </div>
            <p className="text-sm text-primary-foreground/80">
              Created {formatDateTime(order.createdAt)}.
              {ORDER_ACTIVE_STATUSES.has(order.status) ? " This order is still active." : " This order is no longer in active fulfillment."}
            </p>
          </CardContent>
        </Card>

        {failedAttemptEvents.length > 0 ? (
          <Card className="border-none shadow-sm rounded-3xl bg-amber-50 border border-amber-100">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center gap-2 text-amber-900">
                <AlertTriangle className="h-5 w-5" />
                <p className="font-semibold">Delivery exception reported</p>
              </div>
              {failedAttemptEvents.map((event) => (
                <p key={event.id} className="text-sm text-amber-900">
                  {event.note ?? "A delivery attempt could not be completed."} • {formatDateTime(event.occurredAt)}
                </p>
              ))}
            </CardContent>
          </Card>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5 text-primary" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {order.items.map((item) => (
                <div key={item.productId} className="flex justify-between gap-4 text-sm">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-muted-foreground">
                      {item.quantity} x {formatCurrency(item.unitPriceNaira)}
                    </p>
                  </div>
                  <p className="font-semibold">
                    {formatCurrency(item.quantity * item.unitPriceNaira)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-primary" />
                Delivery Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-sm">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Address
                </p>
                <p className="mt-1">{order.deliveryAddress ?? "Address unavailable"}</p>
              </div>
              {order.deliveryProof ? (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-emerald-900">
                  <p className="font-semibold">Delivered to {order.deliveryProof.recipientName}</p>
                  <p className="text-sm mt-1">Confirmed {formatDateTime(order.deliveryProof.confirmedAt)}</p>
                  {order.deliveryProof.note ? <p className="text-sm mt-1">{order.deliveryProof.note}</p> : null}
                </div>
              ) : null}
              {ORDER_ACTIVE_STATUSES.has(order.status) ? (
                <Link href="/dashboard/customer/track-order">
                  <Button className="rounded-xl">Open Active Tracking</Button>
                </Link>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Progress</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-2.5 before:h-full before:w-0.5 before:bg-muted">
              {ORDER_STATUS_STEPS.map((step, index) => {
                const done = activeIndex >= 0 && index <= activeIndex;
                const active = activeIndex === index;

                return (
                  <div key={step.key} className="relative flex items-center gap-6 pl-8">
                    <div className={`absolute left-0 h-5 w-5 rounded-full border-4 border-white shadow-sm ${done ? "bg-primary" : "bg-muted"}`}>
                      {done ? <CheckCircle2 className="h-3 w-3 text-white" /> : null}
                    </div>
                    <div>
                      <p className={`font-semibold text-sm ${active ? "text-primary" : ""}`}>{step.title}</p>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Order History</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {order.executionEvents
              .slice()
              .sort((left, right) => right.occurredAt - left.occurredAt)
              .map((event) => (
                <div key={event.id} className="flex items-start gap-4 rounded-2xl border border-slate-200 p-4">
                  <Clock3 className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-semibold text-sm">{getOrderExecutionEventLabel(event.type)}</p>
                    <p className="text-sm text-muted-foreground">{getOrderExecutionEventDescription(event)}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(event.occurredAt)}</p>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
