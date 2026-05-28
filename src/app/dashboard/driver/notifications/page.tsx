"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock,
  Info,
  Package,
  Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListPageSkeleton } from "@/components/ui/loading-skeletons";
import { useDriverWorkspace } from "@/hooks/use-driver-workspace";

type DriverNotification = {
  id: string;
  title: string;
  description: string;
  href: string;
  unread: boolean;
  timestamp: number;
  icon: LucideIcon;
  color: string;
};

type DriverOrderRecord = {
  id: string;
  customerName: string;
  deliveryAddress?: string;
  status: string;
  updatedAt: number;
};

function formatRelativeTime(timestamp: number) {
  const diffMs = timestamp - Date.now();
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const minutes = Math.round(diffMs / (1000 * 60));

  if (Math.abs(minutes) < 60) {
    return formatter.format(minutes, "minute");
  }

  const hours = Math.round(diffMs / (1000 * 60 * 60));
  if (Math.abs(hours) < 24) {
    return formatter.format(hours, "hour");
  }

  const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return formatter.format(days, "day");
}

export default function DriverNotificationsPage() {
  const { workspace, isLoading, error } = useDriverWorkspace();
  const [orders, setOrders] = useState<DriverOrderRecord[]>([]);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadOrders = async () => {
      try {
        const response = await fetch("/api/driver/orders", { method: "GET" });
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(payload?.error ?? "Unable to load driver notifications.");
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
              : "Unable to load driver notifications."
          );
        }
      }
    };

    void loadOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  const notifications = useMemo(() => {
    if (!workspace) {
      return [] as DriverNotification[];
    }

    const derivedNotifications: DriverNotification[] = [];

    if (workspace.driver && workspace.driver.status !== "active") {
      derivedNotifications.push({
        id: "driver-status",
        title: "Driver account not active",
        description:
          workspace.driver.status === "pending"
            ? "Your vendor assignment exists, but dispatch tools stay locked until the profile is activated."
            : "Your vendor has suspended this driver profile. Contact the vendor before accepting more assignments.",
        href: "/dashboard/driver/profile",
        unread: true,
        timestamp: workspace.driver.updatedAt,
        icon: AlertCircle,
        color: "bg-amber-100 text-amber-700",
      });
    }

    if (workspace.vendor?.reviewNotes) {
      derivedNotifications.push({
        id: "vendor-note",
        title: "Vendor review note",
        description: workspace.vendor.reviewNotes,
        href: "/dashboard/driver",
        unread: true,
        timestamp: workspace.driver?.updatedAt ?? Date.now(),
        icon: Info,
        color: "bg-slate-100 text-slate-700",
      });
    }

    derivedNotifications.push(
      ...orders.slice(0, 4).map((order) => ({
        id: `order-${order.id}`,
        title: "Assignment updated",
        description: `${order.id} for ${order.customerName} is currently ${order.status.replaceAll("_", " ")}.`,
        href: `/dashboard/driver/orders/${order.id}`,
        unread: workspace.activeOrders.some((activeOrder) => activeOrder.id === order.id),
        timestamp: order.updatedAt,
        icon: Package,
        color: "bg-blue-100 text-blue-600",
      }))
    );

    derivedNotifications.push(
      ...workspace.recentPayoutRequests.slice(0, 4).map((request) => ({
        id: `payout-${request.id}`,
        title:
          request.status === "pending"
            ? "Withdrawal request submitted"
            : request.status === "paid"
              ? "Withdrawal request paid"
              : "Withdrawal request rejected",
        description: `${request.destinationLabel} • ₦${request.amountNaira.toLocaleString("en-NG")}`,
        href: `/dashboard/driver/withdrawals/${request.id}/receipt`,
        unread: request.status === "pending",
        timestamp: request.reviewedAt ?? request.requestedAt,
        icon: request.status === "paid" ? CheckCircle2 : Wallet,
        color:
          request.status === "paid"
            ? "bg-green-100 text-green-600"
            : request.status === "rejected"
              ? "bg-rose-100 text-rose-600"
              : "bg-amber-100 text-amber-700",
      }))
    );

    return derivedNotifications.sort((left, right) => right.timestamp - left.timestamp);
  }, [orders, workspace]);

  if (isLoading) {
    return <ListPageSkeleton rows={4} className="max-w-3xl p-0" />;
  }

  if (error || !workspace) {
    return (
      <div className="p-4 md:p-8 max-w-3xl mx-auto">
        <Card className="border-none shadow-sm rounded-3xl">
          <CardContent className="p-8 space-y-2">
            <h1 className="text-2xl font-bold font-headline">Notifications unavailable</h1>
            <p className="text-sm text-muted-foreground">
              {error ?? "Unable to load driver notifications."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline text-foreground">Notifications</h1>
          <p className="text-muted-foreground">Live assignment, payout, and account-state updates.</p>
        </div>
        <Badge variant="outline" className="h-8">Live feed</Badge>
      </div>

      {ordersError ? (
        <Card className="border-none shadow-sm rounded-3xl bg-white">
          <CardContent className="p-4 text-sm text-destructive">{ordersError}</CardContent>
        </Card>
      ) : null}

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <Card className="border-none shadow-sm rounded-3xl bg-white">
            <CardContent className="p-8 text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                No live driver notifications are available yet.
              </p>
              <p className="text-xs text-muted-foreground">
                WaterDrop does not track read receipts, marketing alerts, or route telemetry here.
              </p>
            </CardContent>
          </Card>
        ) : notifications.map((notif) => (
          <Link key={notif.id} href={notif.href}>
            <Card className={`border-none shadow-sm overflow-hidden hover:shadow-md transition-all group mb-3 ${notif.unread ? 'bg-primary/5 border-l-4 border-primary' : 'bg-white border-l-4 border-transparent'}`}>
              <CardContent className="p-4 flex gap-4">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${notif.color}`}>
                  <notif.icon className="h-6 w-6" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <h4 className={`font-bold text-sm ${notif.unread ? 'text-primary' : ''}`}>{notif.title}</h4>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {formatRelativeTime(notif.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{notif.description}</p>
                  {notif.unread && (
                    <Badge className="bg-primary h-1.5 w-1.5 p-0 rounded-full mt-2"></Badge>
                  )}
                </div>
                <div className="flex items-center">
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
