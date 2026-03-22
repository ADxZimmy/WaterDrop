"use client";

import React, { useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Calendar,
  Search,
  ShoppingBag,
  Store,
  Truck,
  User,
} from "lucide-react";
import type { AdminOrderRecord } from "@/lib/admin/ops-types";
import type { OrderStatus } from "@/lib/domain/schemas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ORDER_ACTIVE_STATUSES, getOrderStatusLabel } from "@/lib/orders/status";

type StatusFilter = "all" | "active" | "delivered" | "cancelled";
type AdminOrdersResponse = {
  orders: AdminOrderRecord[];
};

function formatNaira(value: number) {
  return `₦${value.toLocaleString("en-NG")}`;
}

function getOrderStatusClassName(status: OrderStatus) {
  if (status === "delivered") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "cancelled") {
    return "bg-rose-100 text-rose-700";
  }

  if (status === "pending") {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-blue-100 text-blue-700";
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    let isMounted = true;

    const loadOrders = async () => {
      try {
        const response = await fetch("/api/admin/orders", { method: "GET" });
        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error ?? "Unable to load platform orders.");
        }

        const payload: AdminOrdersResponse = await response.json();
        if (isMounted) {
          setOrders(payload.orders ?? []);
          setError(null);
        }
      } catch (fetchError) {
        if (isMounted) {
          setOrders([]);
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Unable to load platform orders."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  const openOrders = useMemo(
    () => orders.filter((order) => ORDER_ACTIVE_STATUSES.has(order.status)).length,
    [orders]
  );
  const inDeliveryOrders = useMemo(
    () => orders.filter((order) => order.status === "out_for_delivery").length,
    [orders]
  );
  const billableOrders = useMemo(
    () => orders.filter((order) => order.status !== "cancelled"),
    [orders]
  );
  const averageTicketSize = useMemo(() => {
    if (billableOrders.length === 0) {
      return 0;
    }

    return Math.round(
      billableOrders.reduce((sum, order) => sum + order.totalNaira, 0) /
        billableOrders.length
    );
  }, [billableOrders]);
  const placedToday = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayStartMs = startOfToday.getTime();

    return orders.filter((order) => order.createdAt >= todayStartMs).length;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        query.length === 0 ||
        order.id.toLowerCase().includes(query) ||
        order.vendorName.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        (order.customerEmail?.toLowerCase().includes(query) ?? false);

      const matchesFilter =
        filter === "all" ||
        (filter === "active" && ORDER_ACTIVE_STATUSES.has(order.status)) ||
        (filter === "delivered" && order.status === "delivered") ||
        (filter === "cancelled" && order.status === "cancelled");

      return matchesSearch && matchesFilter;
    });
  }, [filter, orders, search]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-8 text-sm text-muted-foreground">
        Loading platform orders...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <Card className="border-none shadow-sm rounded-3xl">
          <CardContent className="p-8 space-y-4">
            <h1 className="text-2xl font-bold text-slate-900">
              Platform orders unavailable
            </h1>
            <p className="text-sm text-slate-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-slate-900">
            Platform Orders
          </h1>
          <p className="text-slate-500">
            Live transaction feed across every WaterDrop vendor.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          {
            title: "Open Orders",
            value: openOrders.toLocaleString("en-NG"),
            subtitle: `${orders.length} total orders`,
            icon: ShoppingBag,
          },
          {
            title: "In Delivery",
            value: inDeliveryOrders.toLocaleString("en-NG"),
            subtitle: "Orders currently on the road",
            icon: Truck,
          },
          {
            title: "Avg. Ticket Size",
            value: formatNaira(averageTicketSize),
            subtitle: "Across non-cancelled orders",
            icon: Store,
          },
          {
            title: "Placed Today",
            value: placedToday.toLocaleString("en-NG"),
            subtitle: "Orders created since midnight",
            icon: Calendar,
          },
        ].map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm bg-white rounded-3xl">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {stat.title}
                  </p>
                  <h3 className="text-3xl font-bold mt-2 text-slate-900">
                    {stat.value}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2">{stat.subtitle}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by order ID, customer, vendor, or email..."
            className="pl-10 h-11 rounded-xl bg-white border-slate-200"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", "active", "delivered", "cancelled"] as const).map(
            (filterValue) => (
              <Button
                key={filterValue}
                type="button"
                variant={filter === filterValue ? "default" : "outline"}
                className="rounded-xl h-10 px-4 capitalize"
                onClick={() => setFilter(filterValue)}
              >
                {filterValue === "all" ? "All orders" : filterValue}
              </Button>
            )
          )}
        </div>
      </div>

      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        {filteredOrders.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <h2 className="text-xl font-bold text-slate-900">
              No orders match this view
            </h2>
            <p className="text-sm text-slate-500">
              Try another search term or switch to a different status filter.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="pl-8">Order ID</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-8">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id} className="group hover:bg-slate-50/50">
                  <TableCell className="pl-8 font-bold text-primary">
                    {order.id}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Store className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-sm font-medium text-slate-700">
                        {order.vendorName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 min-w-0">
                      <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-slate-600 truncate">
                          {order.customerName}
                        </p>
                        {order.customerEmail ? (
                          <p className="text-xs text-slate-400 truncate">
                            {order.customerEmail}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    <div>{order.itemsSummary}</div>
                    <p className="text-xs text-slate-400 mt-1">
                      {order.itemCount} item{order.itemCount === 1 ? "" : "s"}
                    </p>
                  </TableCell>
                  <TableCell className="font-bold text-slate-900">
                    {formatNaira(order.totalNaira)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`rounded-full px-3 border-none ${getOrderStatusClassName(order.status)}`}
                    >
                      {getOrderStatusLabel(order.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 italic pr-8">
                    {formatDistanceToNow(order.createdAt, { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}