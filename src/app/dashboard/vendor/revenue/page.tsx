"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  DollarSign,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import type { VendorDashboardSummary } from "@/lib/vendor/summary-types";
import type { OrderStatus, PaymentMethod } from "@/lib/domain/schemas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  ORDER_ACTIVE_STATUSES,
  getOrderStatusLabel,
  getPaymentMethodLabel,
} from "@/lib/orders/status";

type VendorOrderRecord = {
  id: string;
  totalNaira: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: number;
  customerName: string;
};

type VendorOrdersResponse = {
  orders: VendorOrderRecord[];
};

type Period = "days" | "weeks" | "months";
type TransactionFilter = "all" | "active" | "delivered" | "cancelled";

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

function formatMinutes(value: number | null) {
  if (value === null) {
    return "N/A";
  }

  if (value < 60) {
    return `${value}m`;
  }

  const hours = value / 60;
  return `${hours.toFixed(hours >= 10 ? 0 : 1)}h`;
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

export default function VendorRevenuePage() {
  const [summary, setSummary] = useState<VendorDashboardSummary | null>(null);
  const [orders, setOrders] = useState<VendorOrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>("days");
  const [statusFilter, setStatusFilter] = useState<TransactionFilter>("all");

  useEffect(() => {
    let isMounted = true;

    const loadRevenueData = async () => {
      try {
        const [summaryResponse, ordersResponse] = await Promise.all([
          fetch("/api/vendor/summary", { method: "GET" }),
          fetch("/api/vendor/orders", { method: "GET" }),
        ]);

        if (!summaryResponse.ok) {
          const payload = await summaryResponse.json().catch(() => null);
          throw new Error(payload?.error ?? "Unable to load revenue summary.");
        }

        if (!ordersResponse.ok) {
          const payload = await ordersResponse.json().catch(() => null);
          throw new Error(payload?.error ?? "Unable to load vendor orders.");
        }

        const [summaryPayload, ordersPayload] = await Promise.all([
          summaryResponse.json() as Promise<VendorDashboardSummary>,
          ordersResponse.json() as Promise<VendorOrdersResponse>,
        ]);

        if (isMounted) {
          setSummary(summaryPayload);
          setOrders(ordersPayload.orders ?? []);
          setError(null);
        }
      } catch (fetchError) {
        if (isMounted) {
          setSummary(null);
          setOrders([]);
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Unable to load revenue summary."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadRevenueData();

    return () => {
      isMounted = false;
    };
  }, []);

  const chartData = summary?.charts[period] ?? [];
  const profile = summary?.profile ?? null;

  const deliveredRevenueNaira = useMemo(
    () =>
      orders
        .filter((order) => order.status === "delivered")
        .reduce((sum, order) => sum + order.totalNaira, 0),
    [orders]
  );
  const activeOrderValueNaira = useMemo(
    () =>
      orders
        .filter((order) => ORDER_ACTIVE_STATUSES.has(order.status))
        .reduce((sum, order) => sum + order.totalNaira, 0),
    [orders]
  );
  const cancelledValueNaira = useMemo(
    () =>
      orders
        .filter((order) => order.status === "cancelled")
        .reduce((sum, order) => sum + order.totalNaira, 0),
    [orders]
  );

  const filteredTransactions = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter === "all") {
        return true;
      }

      if (statusFilter === "active") {
        return ORDER_ACTIVE_STATUSES.has(order.status);
      }

      if (statusFilter === "delivered") {
        return order.status === "delivered";
      }

      return order.status === "cancelled";
    });
  }, [orders, statusFilter]);

  if (isLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto text-sm text-muted-foreground">
        Loading live revenue analytics...
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <Card className="border-none shadow-sm p-10">
          <CardContent className="p-0 space-y-4">
            <h1 className="text-3xl font-bold font-headline">
              Revenue analytics unavailable
            </h1>
            <p className="text-muted-foreground">
              {error ?? "Unable to load revenue analytics."}
            </p>
            <Link href="/dashboard/vendor">
              <Button className="rounded-xl">Back to overview</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile || profile.status !== "approved") {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <Card className="border-none shadow-sm p-10 text-center">
          <CardContent className="p-0 space-y-4">
            <h1 className="text-3xl font-bold font-headline">
              Revenue analytics unlock after approval
            </h1>
            <p className="text-muted-foreground">
              Complete onboarding and receive vendor approval before WaterDrop
              starts tracking financial performance here.
            </p>
            <div className="flex justify-center gap-3">
              <Link href="/auth/onboarding/vendor">
                <Button className="rounded-xl">Review Application</Button>
              </Link>
              <Link href="/dashboard/vendor">
                <Button variant="outline" className="rounded-xl">
                  Back to Overview
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">
            Revenue Analysis
          </h1>
          <p className="text-muted-foreground">
            Live revenue, collections, and transaction flow for{" "}
            {profile.businessName}.
          </p>
        </div>
        <div className="flex gap-1 bg-muted/50 p-1 rounded-xl w-fit">
          {(["days", "weeks", "months"] as const).map((value) => (
            <Button
              key={value}
              variant="ghost"
              size="sm"
              className={cn(
                "rounded-lg h-8 px-4 capitalize",
                period === value && "bg-white shadow-sm text-primary font-bold"
              )}
              onClick={() => setPeriod(value)}
            >
              {value}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          {
            title: "Gross Revenue",
            value: formatNaira(summary.summary.grossRevenueNaira),
            subtitle: `${summary.summary.totalOrders} total orders`,
            icon: DollarSign,
          },
          {
            title: "This Month",
            value: formatNaira(summary.summary.monthlyRevenueNaira),
            subtitle: `${summary.summary.deliveredOrders} delivered orders`,
            icon: TrendingUp,
          },
          {
            title: "Avg. Order Value",
            value: formatNaira(summary.summary.averageOrderValueNaira),
            subtitle: "Non-cancelled orders only",
            icon: ShoppingBag,
          },
          {
            title: "Active Order Value",
            value: formatNaira(activeOrderValueNaira),
            subtitle: `${summary.summary.activeOrders} open orders`,
            icon: Activity,
          },
        ].map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm rounded-3xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs mt-2 text-muted-foreground">
                {stat.subtitle}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <Card className="xl:col-span-2 border-none shadow-sm p-6">
          <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between">
            <div>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>
                Revenue generated from non-cancelled orders
              </CardDescription>
            </div>
          </CardHeader>
          {summary.summary.totalOrders > 0 ? (
            <div className="h-[350px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="vendorRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#26A3DB" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#26A3DB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#64748b" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    tickFormatter={(value: number) => `₦${Math.round(value / 1000)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "16px",
                      border: "none",
                      boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: number) => [formatNaira(value), "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#26A3DB"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#vendorRevenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[350px] w-full flex items-center justify-center text-center text-sm text-muted-foreground">
              Revenue charts will appear once customers place orders with this
              vendor.
            </div>
          )}
        </Card>

        <Card className="border-none shadow-sm rounded-3xl p-6 bg-white">
          <CardHeader className="px-0 pt-0 mb-6">
            <CardTitle>Collection Snapshot</CardTitle>
            <CardDescription>
              Live financial health across current orders
            </CardDescription>
          </CardHeader>
          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Delivered Revenue
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                {formatNaira(deliveredRevenueNaira)}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Cancelled Value
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                {formatNaira(cancelledValueNaira)}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-muted/40 p-4">
                <p className="text-[10px] uppercase font-bold text-slate-400">
                  Fulfillment Rate
                </p>
                <p className="font-bold mt-2 text-slate-900">
                  {summary.summary.fulfillmentRate}%
                </p>
              </div>
              <div className="rounded-2xl bg-muted/40 p-4">
                <p className="text-[10px] uppercase font-bold text-slate-400">
                  Avg. Fulfillment
                </p>
                <p className="font-bold mt-2 text-slate-900">
                  {formatMinutes(summary.summary.averageFulfillmentMinutes)}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h3 className="font-bold">Recent Transactions</h3>
              {statusFilter !== "all" ? (
                <Badge variant="secondary" className="text-[10px] h-5 capitalize">
                  {statusFilter}
                </Badge>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["all", "active", "delivered", "cancelled"] as const).map(
              (filterValue) => (
                <Button
                  key={filterValue}
                  type="button"
                  variant={statusFilter === filterValue ? "default" : "outline"}
                  size="sm"
                  className="rounded-lg capitalize"
                  onClick={() => setStatusFilter(filterValue)}
                >
                  {filterValue === "all" ? "All transactions" : filterValue}
                </Button>
              )
            )}
          </div>
        </div>
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDateTime(row.createdAt)}
                </TableCell>
                <TableCell className="font-bold text-primary">{row.id}</TableCell>
                <TableCell>{row.customerName}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {getPaymentMethodLabel(row.paymentMethod)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={getOrderStatusClassName(row.status)}
                  >
                    {getOrderStatusLabel(row.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-bold">
                  {formatNaira(row.totalNaira)}
                </TableCell>
              </TableRow>
            ))}
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No transactions found for the selected filter.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
