"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Package,
  Search,
  Truck,
  XCircle,
} from "lucide-react";
import type { OrderItem, OrderStatus } from "@/lib/domain/schemas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  canCancelOrder,
  getNextProgressStatus,
  getOrderStatusLabel,
} from "@/lib/orders/status";
import { cn } from "@/lib/utils";

type VendorOrderRecord = {
  id: string;
  customerUid: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  vendorName?: string;
  items: OrderItem[];
  totalNaira: number;
  status: OrderStatus;
  deliveryAddress?: string;
  createdAt: number;
  updatedAt: number;
};

type StatusFilter = "all" | OrderStatus;
type OrdersPageInfo = {
  nextCursor: string | null;
  limit: number;
};

function getStatusBadgeClass(status: OrderStatus) {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-700";
    case "accepted":
      return "bg-blue-100 text-blue-700";
    case "preparing":
      return "bg-indigo-100 text-indigo-700";
    case "out_for_delivery":
      return "bg-purple-100 text-purple-700";
    case "delivered":
      return "bg-emerald-100 text-emerald-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function getPrimaryAction(status: OrderStatus) {
  const nextStatus = getNextProgressStatus(status);
  if (!nextStatus) {
    return null;
  }

  const labels: Record<OrderStatus, string> = {
    pending: "Review",
    accepted: "Accept",
    preparing: "Start preparing",
    out_for_delivery: "Dispatch",
    delivered: "Mark delivered",
    cancelled: "Cancel",
  };

  return {
    nextStatus,
    label: labels[nextStatus],
  };
}

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<VendorOrderRecord[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [pageInfo, setPageInfo] = useState<OrdersPageInfo | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const { toast } = useToast();

  const loadOrders = useCallback(async (cursor?: string | null) => {
    if (cursor) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      const params = new URLSearchParams({ limit: "20" });
      if (cursor) {
        params.set("cursor", cursor);
      }

      const response = await fetch(`/api/vendor/orders?${params.toString()}`, { method: "GET" });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Unable to load vendor orders.");
      }

      const payload = await response.json();
      setOrders((currentOrders) =>
        cursor ? [...currentOrders, ...(payload.orders ?? [])] : payload.orders ?? []
      );
      setPageInfo(payload.pageInfo ?? null);
    } catch (error) {
      if (!cursor) {
        setOrders([]);
        setPageInfo(null);
      }
      toast({
        title: "Orders unavailable",
        description: error instanceof Error ? error.message : "Unable to load vendor orders.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadOrders(null);
  }, [loadOrders]);

  const handleStatusUpdate = async (orderId: string, nextStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);

    try {
      const response = await fetch(`/api/vendor/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Unable to update order.");
      }

      const payload = await response.json();
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId ? { ...order, ...payload.order } : order
        )
      );

      toast({
        title: "Order updated",
        description: `Order ${orderId.slice(0, 8)} is now ${getOrderStatusLabel(nextStatus).toLowerCase()}.`,
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Unable to update order.",
        variant: "destructive",
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const matchesSearch =
        query.length === 0 ||
        order.id.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        order.items.some((item) => item.name.toLowerCase().includes(query)) ||
        (order.deliveryAddress ?? "").toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [orders, search, statusFilter]);

  const pendingCount = orders.filter((order) => order.status === "pending").length;
  const preparingCount = orders.filter(
    (order) => order.status === "accepted" || order.status === "preparing"
  ).length;
  const outForDeliveryCount = orders.filter(
    (order) => order.status === "out_for_delivery"
  ).length;
  const revenueNaira = orders
    .filter((order) => order.status !== "cancelled")
    .reduce((total, order) => total + order.totalNaira, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-foreground">Order Fulfillment</h1>
          <p className="text-muted-foreground">Manage incoming orders and keep customer tracking in sync.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl h-11 px-6" onClick={() => void loadOrders(null)}>
            Refresh Queue
          </Button>
          <Link href="/dashboard/vendor/analytics">
            <Button className="rounded-xl h-11 px-6">View Analytics</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">New Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting vendor review</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Preparing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{preparingCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Accepted and in fulfillment</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Out for Delivery</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{outForDeliveryCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently on the road</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gross Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">₦{revenueNaira.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Across {orders.length} recorded orders</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="p-4 border-b flex flex-col md:flex-row gap-4 md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders by ID, customer, item, or address..."
              className="pl-10 h-10 rounded-lg"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
            <SelectTrigger className="w-full md:w-[190px] h-10 rounded-lg">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="preparing">Preparing</SelectItem>
              <SelectItem value="out_for_delivery">Out for delivery</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-24 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="ml-auto h-8 w-24 rounded-lg" /></TableCell>
                </TableRow>
              ))
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  No orders match the current filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => {
                const primaryAction = getPrimaryAction(order.status);
                const isUpdating = updatingOrderId === order.id;
                const itemSummary = order.items
                  .map((item) => `${item.quantity}x ${item.name}`)
                  .join(", ");

                return (
                  <TableRow key={order.id} className="hover:bg-muted/10 group">
                    <TableCell className="font-bold text-primary">
                      <Link href={`/dashboard/vendor/orders/${order.id}`} className="hover:underline">
                        {order.id.slice(0, 8)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.customerPhone ?? order.customerEmail ?? "No customer contact saved"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[260px]">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {order.items.reduce((count, item) => count + item.quantity, 0)} item(s)
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{itemSummary}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">₦{order.totalNaira.toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      <div className="flex items-center gap-1">
                        <Clock3 className="h-3 w-3" />
                        {formatDistanceToNow(order.createdAt, { addSuffix: true })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("rounded-full px-3 border-none", getStatusBadgeClass(order.status))}>
                        {getOrderStatusLabel(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {primaryAction && (
                          <Button
                            size="sm"
                            className={cn(
                              "h-8 rounded-lg gap-1",
                              primaryAction.nextStatus === "delivered"
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                : "bg-primary hover:bg-primary/90 text-white"
                            )}
                            disabled={isUpdating}
                            onClick={() => void handleStatusUpdate(order.id, primaryAction.nextStatus)}
                          >
                            {primaryAction.nextStatus === "delivered" ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : primaryAction.nextStatus === "out_for_delivery" ? (
                              <Truck className="h-3.5 w-3.5" />
                            ) : (
                              <Package className="h-3.5 w-3.5" />
                            )}
                            {isUpdating ? "Saving..." : primaryAction.label}
                          </Button>
                        )}
                        {canCancelOrder(order.status) && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 rounded-lg gap-1 text-red-600 border-red-200 hover:bg-red-50"
                            disabled={isUpdating}
                            onClick={() => void handleStatusUpdate(order.id, "cancelled")}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Cancel
                          </Button>
                        )}
                        <Link href={`/dashboard/vendor/orders/${order.id}`}>
                          <Button size="sm" variant="outline" className="h-8 rounded-lg gap-1">
                            <ArrowUpRight className="h-3.5 w-3.5" />
                            View
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        {pageInfo?.nextCursor && !isLoading ? (
          <div className="border-t p-4 text-center">
            <Button
              variant="outline"
              className="rounded-xl"
              disabled={isLoadingMore}
              onClick={() => void loadOrders(pageInfo.nextCursor)}
            >
              {isLoadingMore ? "Loading orders..." : "Load more orders"}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
