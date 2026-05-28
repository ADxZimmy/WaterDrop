"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Clock3, History, MapPin, Truck, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ListPageSkeleton } from "@/components/ui/loading-skeletons";
import { useDriverWorkspace } from "@/hooks/use-driver-workspace";

type DriverOrderRecord = {
  id: string;
  customerName: string;
  deliveryAddress?: string;
  totalNaira: number;
  status: string;
  updatedAt: number;
  driverPayout?: {
    amountNaira: number;
  };
};

function formatDateTime(timestamp: number | null) {
  if (!timestamp) {
    return "No activity yet";
  }

  return new Date(timestamp).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function DriverHistoryPage() {
  const { workspace, isLoading, error } = useDriverWorkspace();
  const [orders, setOrders] = useState<DriverOrderRecord[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadOrders = async () => {
      try {
        const response = await fetch("/api/driver/orders", { method: "GET" });
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(payload?.error ?? "Unable to load assigned order history.");
        }

        if (isMounted) {
          setOrders((payload?.orders ?? []) as DriverOrderRecord[]);
          setOrdersError(null);
        }
      } catch (fetchError) {
        if (isMounted) {
          setOrders([]);
          setOrdersError(
            fetchError instanceof Error
              ? fetchError.message
              : "Unable to load assigned order history."
          );
        }
      } finally {
        if (isMounted) {
          setOrdersLoading(false);
        }
      }
    };

    void loadOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return <ListPageSkeleton rows={4} className="max-w-5xl p-0" />;
  }

  if (error || !workspace) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <Card className="border-none shadow-sm rounded-3xl">
          <CardContent className="p-8 space-y-2">
            <h1 className="text-2xl font-bold font-headline">Driver history unavailable</h1>
            <p className="text-sm text-muted-foreground">
              {error ?? "Unable to load driver history."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { driver } = workspace;

  if (!driver) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <Card className="border-none shadow-sm rounded-3xl">
          <CardContent className="p-8 space-y-4">
            <h1 className="text-2xl font-bold font-headline">Trip History</h1>
            <p className="text-sm text-muted-foreground">
              Complete your driver setup before trip history can be evaluated.
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
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold font-headline">Trip History</h1>
        <p className="text-muted-foreground">
          Assigned orders now form your live delivery history.
        </p>
      </div>

      {ordersLoading ? (
        <ListPageSkeleton rows={3} className="max-w-none px-0 py-0" />
      ) : ordersError ? (
        <Card className="border-none shadow-sm rounded-3xl bg-white">
          <CardContent className="p-8 text-sm text-destructive">{ordersError}</CardContent>
        </Card>
      ) : orders.length === 0 ? (
        <Card className="border-none shadow-sm rounded-3xl bg-white">
          <CardContent className="p-8 space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              No orders have been assigned to your driver account yet.
            </p>
            <Link href="/dashboard/driver">
              <Button className="rounded-xl shadow-lg shadow-primary/20">
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="border-none shadow-sm rounded-3xl bg-white">
              <CardContent className="p-6 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-slate-900">{order.id}</p>
                    <Badge className="bg-slate-100 text-slate-700 border-none">
                      {order.status.replaceAll("_", " ")}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <History className="h-4 w-4 text-muted-foreground" />
                    <span>{order.customerName}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-slate-600">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>{order.deliveryAddress ?? "Delivery address unavailable"}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDateTime(order.updatedAt)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Wallet className="h-3.5 w-3.5" />
                      ₦{order.totalNaira.toLocaleString("en-NG")}
                    </span>
                    {order.driverPayout ? (
                      <span className="inline-flex items-center gap-1">
                        <Truck className="h-3.5 w-3.5" />
                        Payout ₦{order.driverPayout.amountNaira.toLocaleString("en-NG")}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Link href={`/dashboard/driver/orders/${order.id}`}>
                    <Button variant="outline" className="rounded-xl">
                      Details
                    </Button>
                  </Link>
                  <Link href={`/dashboard/driver/navigate/${order.id}`}>
                    <Button className="rounded-xl shadow-lg shadow-primary/20">
                      Route
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="border-none shadow-sm rounded-3xl bg-white">
        <CardContent className="p-6 flex items-center gap-3 text-sm text-muted-foreground">
          <Clock3 className="h-4 w-4" />
          Assignment and payout history are live. Turn-by-turn telemetry is still handled outside
          WaterDrop.
        </CardContent>
      </Card>
    </div>
  );
}
