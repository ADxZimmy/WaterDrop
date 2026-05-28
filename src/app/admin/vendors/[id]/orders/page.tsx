"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Search,
  User,
} from "lucide-react";
import type { AdminVendorReviewRecord } from "@/lib/admin/vendor-review-types";
import type { OrderStatus, PaymentMethod } from "@/lib/domain/schemas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ListPageSkeleton } from "@/components/ui/loading-skeletons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ORDER_ACTIVE_STATUSES,
  getOrderStatusLabel,
  getPaymentMethodLabel,
} from "@/lib/orders/status";

type AdminVendorOrderRecord = {
  id: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPriceNaira: number;
  }>;
  totalNaira: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: number;
  customerName: string;
  customerEmail?: string;
};

type AdminVendorOrdersResponse = {
  vendor: AdminVendorReviewRecord;
  orders: AdminVendorOrderRecord[];
};

type OrderFilter = "all" | "active" | "delivered" | "cancelled";

function formatNaira(value: number) {
  return `₦${value.toLocaleString("en-NG")}`;
}

function formatDateTime(timestamp: number) {
  return new Date(timestamp).toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getVendorStatusLabel(status: AdminVendorReviewRecord["status"]) {
  if (status === "approved") {
    return "Approved";
  }

  if (status === "rejected") {
    return "Rejected";
  }

  return "Pending";
}

function getVendorStatusClassName(status: AdminVendorReviewRecord["status"]) {
  if (status === "approved") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "rejected") {
    return "bg-rose-100 text-rose-700";
  }

  return "bg-amber-100 text-amber-700";
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

function getItemsLabel(items: AdminVendorOrderRecord["items"]) {
  const quantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const firstItem = items[0]?.name ?? "Items";

  if (items.length === 1) {
    return `${quantity} x ${firstItem}`;
  }

  return `${quantity} items across ${items.length} products`;
}

export default function AdminVendorOrdersPage() {
  const params = useParams();
  const vendorId = typeof params?.id === "string" ? params.id : "";
  const [vendor, setVendor] = useState<AdminVendorReviewRecord | null>(null);
  const [orders, setOrders] = useState<AdminVendorOrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<OrderFilter>("all");

  useEffect(() => {
    if (!vendorId) {
      setIsLoading(false);
      setError("Vendor not found.");
      return;
    }

    let isMounted = true;

    const loadVendorOrders = async () => {
      try {
        const response = await fetch(`/api/admin/vendors/${vendorId}/orders`, {
          method: "GET",
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error ?? "Unable to load vendor order history.");
        }

        const payload: AdminVendorOrdersResponse = await response.json();
        if (isMounted) {
          setVendor(payload.vendor ?? null);
          setOrders(payload.orders ?? []);
          setError(null);
        }
      } catch (fetchError) {
        if (isMounted) {
          setVendor(null);
          setOrders([]);
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Unable to load vendor order history."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadVendorOrders();

    return () => {
      isMounted = false;
    };
  }, [vendorId]);

  const deliveredOrders = useMemo(
    () => orders.filter((order) => order.status === "delivered").length,
    [orders]
  );
  const activeOrders = useMemo(
    () => orders.filter((order) => ORDER_ACTIVE_STATUSES.has(order.status)).length,
    [orders]
  );
  const completionRate = useMemo(() => {
    if (orders.length === 0) {
      return 0;
    }

    return Math.round((deliveredOrders / orders.length) * 1000) / 10;
  }, [deliveredOrders, orders.length]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        query.length === 0 ||
        order.id.toLowerCase().includes(query) ||
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
    return <ListPageSkeleton rows={6} className="max-w-6xl p-0" />;
  }

  if (!vendor || error) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <Card className="border-none shadow-sm rounded-3xl">
          <CardContent className="p-8 space-y-4">
            <h1 className="text-2xl font-bold text-slate-900">
              Order history unavailable
            </h1>
            <p className="text-sm text-slate-500">
              {error ?? "This vendor could not be found."}
            </p>
            <Link href="/admin/vendors">
              <Button className="rounded-xl">Back to vendors</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href={`/admin/vendors/${vendor.vendorId}`}>
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold font-headline text-slate-900">
            Order History
          </h1>
          <p className="text-slate-500">
            Transaction log for {vendor.businessName}
          </p>
        </div>
        <Badge
          className={`ml-auto border-none px-4 py-1 ${getVendorStatusClassName(vendor.status)}`}
        >
          {getVendorStatusLabel(vendor.status)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm bg-white rounded-[32px]">
          <CardContent className="p-6">
            <p className="text-xs uppercase font-bold tracking-widest text-slate-400">
              Total Lifetime Orders
            </p>
            <h3 className="text-3xl font-bold mt-2 text-slate-900">
              {orders.length.toLocaleString("en-NG")}
            </h3>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white rounded-[32px]">
          <CardContent className="p-6">
            <p className="text-xs uppercase font-bold tracking-widest text-slate-400">
              Completion Rate
            </p>
            <h3 className="text-3xl font-bold mt-2 text-emerald-600">
              {completionRate.toFixed(1)}%
            </h3>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white rounded-[32px]">
          <CardContent className="p-6">
            <p className="text-xs uppercase font-bold tracking-widest text-slate-400">
              Gross Revenue
            </p>
            <h3 className="text-3xl font-bold mt-2 text-slate-900">
              {formatNaira(vendor.revenueNaira)}
            </h3>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white rounded-[32px]">
          <CardContent className="p-6">
            <p className="text-xs uppercase font-bold tracking-widest text-slate-400">
              Active Orders
            </p>
            <h3 className="text-3xl font-bold mt-2 text-primary">
              {activeOrders.toLocaleString("en-NG")}
            </h3>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by order ID, customer name, or customer email..."
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
              Try another search term or switch to a different order filter.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="pl-8">Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="pr-8">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id} className="group hover:bg-slate-50/50">
                  <TableCell className="pl-8 font-bold text-primary">
                    {order.id}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      <div className="min-w-0">
                        <p className="truncate">{order.customerName}</p>
                        {order.customerEmail ? (
                          <p className="text-xs text-slate-400 truncate">
                            {order.customerEmail}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {getItemsLabel(order.items)}
                  </TableCell>
                  <TableCell className="font-bold text-slate-900">
                    {formatNaira(order.totalNaira)}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {getPaymentMethodLabel(order.paymentMethod)}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDateTime(order.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell className="pr-8">
                    <Badge
                      className={`rounded-full px-3 border-none ${getOrderStatusClassName(order.status)}`}
                    >
                      {getOrderStatusLabel(order.status)}
                    </Badge>
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
