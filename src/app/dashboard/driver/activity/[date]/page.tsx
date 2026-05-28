"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  Clock,
  MapPin,
  Package,
  Wallet,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDisplayDate(date: Date) {
  return new Intl.DateTimeFormat("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat("en-NG", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

function parseDateParam(dateStr: string) {
  const parsed = new Date(`${dateStr}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getLocalDayKey(value: number | Date) {
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function DriverDailyActivityPage() {
  const { workspace, isLoading, error } = useDriverWorkspace();
  const params = useParams();
  const dateStr = params.date as string;
  const selectedDate = useMemo(() => parseDateParam(dateStr), [dateStr]);
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
          throw new Error(payload?.error ?? "Unable to load driver activity.");
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
              : "Unable to load driver activity."
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

  const dayOrders = useMemo(() => {
    if (!selectedDate) {
      return [];
    }

    const dayKey = getLocalDayKey(selectedDate);
    return orders.filter((order) => getLocalDayKey(order.updatedAt) === dayKey);
  }, [orders, selectedDate]);

  const earnedNaira = dayOrders.reduce(
    (sum, order) => sum + (order.driverPayout?.amountNaira ?? 0),
    0
  );

  if (isLoading) {
    return <ListPageSkeleton rows={4} className="max-w-5xl p-0" />;
  }

  if (error || !workspace) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <Card className="border-none shadow-sm rounded-3xl">
          <CardContent className="p-8 space-y-2">
            <h1 className="text-2xl font-bold font-headline">Driver activity unavailable</h1>
            <p className="text-sm text-muted-foreground">
              {error ?? "Unable to load driver activity."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!selectedDate) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <Card className="border-none shadow-sm rounded-3xl">
          <CardContent className="p-8 space-y-4">
            <h1 className="text-2xl font-bold font-headline">Activity Details</h1>
            <p className="text-sm text-muted-foreground">
              The requested activity date is invalid.
            </p>
            <Link href="/dashboard/driver/history">
              <Button className="rounded-xl shadow-lg shadow-primary/20">Back to History</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/driver/history">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-headline">Activity Details</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" /> {formatDisplayDate(selectedDate)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm p-6 bg-primary text-white rounded-3xl">
          <p className="text-xs uppercase font-bold tracking-widest opacity-80">Total Earned</p>
          <h3 className="text-3xl font-bold mt-2">{formatCurrency(earnedNaira)}</h3>
        </Card>
        <Card className="border-none shadow-sm p-6 bg-white rounded-3xl">
          <p className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Trips Done</p>
          <h3 className="text-3xl font-bold mt-2">{dayOrders.length}</h3>
        </Card>
        <Card className="border-none shadow-sm p-6 bg-white rounded-3xl">
          <p className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Telemetry</p>
          <h3 className="text-3xl font-bold mt-2">N/A</h3>
          <p className="text-sm text-muted-foreground mt-2">Route hours are not tracked yet.</p>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-lg px-2">Trip Log</h3>
        {ordersLoading ? (
          <ListPageSkeleton rows={3} className="max-w-none px-0 py-0" />
        ) : ordersError ? (
          <Card className="border-none shadow-sm rounded-3xl bg-white">
            <CardContent className="p-6 text-sm text-destructive">{ordersError}</CardContent>
          </Card>
        ) : dayOrders.length === 0 ? (
          <Card className="border-none shadow-sm rounded-3xl bg-white">
            <CardContent className="p-8 space-y-3 text-center">
              <p className="text-sm text-muted-foreground">
                No assigned order updates were recorded for this date.
              </p>
              <p className="text-xs text-muted-foreground">
                Delivery route duration and arrival telemetry are still handled outside WaterDrop.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
          {dayOrders.map((trip) => (
            <Link key={trip.id} href={`/dashboard/driver/orders/${trip.id}`}>
              <Card className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden bg-white mb-3">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                        <Package className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">{trip.id}</h4>
                        <p className="text-xs text-muted-foreground">{trip.customerName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-primary">
                        {formatCurrency(trip.driverPayout?.amountNaira ?? trip.totalNaira)}
                      </p>
                      <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200 text-[10px]">
                        {trip.status.replaceAll("_", " ")}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-muted/50">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {formatTime(trip.updatedAt)}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {trip.deliveryAddress ?? "Delivery address unavailable"}</span>
                      <span className="flex items-center gap-1"><Wallet className="h-3.5 w-3.5" /> {formatCurrency(trip.totalNaira)}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 gap-1 text-primary group-hover:bg-primary/5">
                      Order Details <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          </div>
        )}
      </div>
    </div>
  );
}
