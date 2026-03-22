"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  Truck,
} from "lucide-react";
import type { DeliveryProof, OrderExecutionEvent, OrderStatus } from "@/lib/domain/schemas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getOrderExecutionEventDescription, getOrderExecutionEventLabel } from "@/lib/orders/execution";
import { ORDER_STATUS_STEPS, getOrderStatusLabel } from "@/lib/orders/status";

type LatestOrder = null | {
  id: string;
  vendorName?: string;
  status: OrderStatus;
  deliveryAddress?: string;
  executionEvents?: OrderExecutionEvent[];
  deliveryProof?: DeliveryProof;
  updatedAt: number;
};

export default function TrackOrderPage() {
  const [order, setOrder] = useState<LatestOrder>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadOrder = useCallback(async () => {
    const response = await fetch("/api/orders/latest", { method: "GET" });
    if (!response.ok) {
      throw new Error("Unable to load latest order.");
    }

    const payload = await response.json();
    return (payload.order ?? null) as LatestOrder;
  }, []);

  useEffect(() => {
    let isMounted = true;

    const syncOrder = async () => {
      try {
        const latestOrder = await loadOrder();
        if (isMounted) {
          setOrder(latestOrder);
        }
      } catch {
        if (isMounted) {
          setOrder(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void syncOrder();
    const intervalId = window.setInterval(() => {
      void syncOrder();
    }, 15000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [loadOrder]);

  const activeIndex = useMemo(() => {
    const index = ORDER_STATUS_STEPS.findIndex((step) => step.key === order?.status);
    return index >= 0 ? index : 0;
  }, [order?.status]);

  const currentStep = order
    ? ORDER_STATUS_STEPS.find((step) => step.key === order.status) ?? ORDER_STATUS_STEPS[0]
    : null;
  const recentEvents = [...(order?.executionEvents ?? [])]
    .sort((left, right) => right.occurredAt - left.occurredAt)
    .slice(0, 4);
  const latestFailedAttempt = recentEvents.find(
    (event) => event.type === "delivery_failed_attempt"
  );

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/customer/orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold font-headline">Live Tracking</h1>
            <p className="text-sm text-muted-foreground">Status refreshes automatically every 15 seconds.</p>
          </div>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading latest order...</p>
        ) : !order ? (
          <Card className="border-none shadow-sm p-8 text-center">
            <CardContent className="p-0 space-y-3">
              <h2 className="text-xl font-bold">No active order</h2>
              <p className="text-muted-foreground">Place an order to see live tracking updates here.</p>
              <Link href="/">
                <Button className="rounded-xl">Browse Vendors</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="border-none shadow-lg overflow-hidden bg-primary text-white">
              <CardContent className="p-8">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <Badge className="bg-white/20 text-white border-none mb-4">Live order</Badge>
                    <h2 className="text-3xl font-bold font-headline">
                      {getOrderStatusLabel(order.status)}
                    </h2>
                    <p className="text-primary-foreground/80 mt-1">
                      Order #{order.id.slice(0, 8)} • {order.vendorName ?? "Water Vendor"}
                    </p>
                    <p className="text-xs text-primary-foreground/80 mt-3">
                      Updated {formatDistanceToNow(order.updatedAt, { addSuffix: true })}
                    </p>
                  </div>
                  <Truck className="h-16 w-16 text-white/20 shrink-0" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm p-6">
              <h3 className="font-bold mb-6 flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" /> Delivery Status
              </h3>
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-2.5 before:h-full before:w-0.5 before:bg-muted">
                {ORDER_STATUS_STEPS.map((step, index) => {
                  const done = index <= activeIndex;
                  const active = index === activeIndex;

                  return (
                    <div key={step.key} className="relative flex items-center gap-6 pl-8">
                      <div
                        className={`absolute left-0 h-5 w-5 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${done ? "bg-primary" : "bg-muted"}`}
                      >
                        {done && <CheckCircle2 className="h-3 w-3 text-white" />}
                      </div>
                      <div className="flex-1 flex justify-between items-center gap-4">
                        <div>
                          <h4 className={`font-bold text-sm ${active ? "text-primary" : ""}`}>
                            {step.title}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {active ? step.description : "Pending update"}
                          </p>
                        </div>
                        {active && (
                          <Badge className="bg-primary/10 text-primary border-none text-[10px]">
                            CURRENT
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="border-none shadow-sm p-6">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-sm">Order updates</h4>
                  <p className="text-sm text-muted-foreground">
                    {currentStep?.description ?? "We will surface vendor updates here as the order progresses."}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    WaterDrop is syncing your order with the vendor dashboard in near real time.
                  </p>
                </div>
              </div>
            </Card>

            {latestFailedAttempt ? (
              <Card className="border-none shadow-sm p-6 bg-amber-50 border border-amber-100">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-700 shrink-0">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-sm text-amber-900">Delivery exception</h4>
                    <p className="text-sm text-amber-900">
                      {latestFailedAttempt.note ?? "The driver reported that this delivery attempt could not be completed."}
                    </p>
                    <p className="text-xs text-amber-800">
                      Logged {formatDistanceToNow(latestFailedAttempt.occurredAt, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </Card>
            ) : null}

            {recentEvents.length > 0 ? (
              <Card className="border-none shadow-sm p-6">
                <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-muted-foreground">
                  Recent History
                </h4>
                <div className="space-y-3">
                  {recentEvents.map((event) => (
                    <div key={event.id} className="rounded-xl border border-border p-4">
                      <p className="font-semibold text-sm">
                        {getOrderExecutionEventLabel(event.type)}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {getOrderExecutionEventDescription(event)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(event.occurredAt, { addSuffix: true })}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            ) : null}

            {order.deliveryProof ? (
              <Card className="border-none shadow-sm p-6">
                <h4 className="font-bold mb-2 text-sm uppercase tracking-wider text-muted-foreground">
                  Delivery Confirmation
                </h4>
                <p className="text-sm text-foreground">
                  Received by {order.deliveryProof.recipientName}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Confirmed{" "}
                  {new Date(order.deliveryProof.confirmedAt).toLocaleString("en-NG", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </Card>
            ) : null}

            <Card className="border-none shadow-sm p-6">
              <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-muted-foreground">
                Delivery Address
              </h4>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-sm">Delivery location</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {order.deliveryAddress ?? "Address unavailable"}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
