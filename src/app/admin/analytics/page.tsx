"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock3,
  DollarSign,
  ShoppingBag,
  Store,
  Truck,
  Users,
} from "lucide-react";
import type { AdminAnalyticsPayload } from "@/lib/admin/ops-types";
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
  Cell,
  Pie,
  PieChart as RePieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";

const COLORS = ["#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6"];

type Period = "days" | "weeks" | "months";
type AdminAnalyticsResponse = {
  analytics: AdminAnalyticsPayload;
};

function formatNaira(value: number) {
  return `₦${value.toLocaleString("en-NG")}`;
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

function getVendorStatusClassName(status: "pending" | "approved" | "rejected") {
  if (status === "approved") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "rejected") {
    return "bg-rose-100 text-rose-700";
  }

  return "bg-amber-100 text-amber-700";
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AdminAnalyticsPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>("months");

  useEffect(() => {
    let isMounted = true;

    const loadAnalytics = async () => {
      try {
        const response = await fetch("/api/admin/analytics", { method: "GET" });
        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error ?? "Unable to load admin analytics.");
        }

        const payload: AdminAnalyticsResponse = await response.json();
        if (isMounted) {
          setAnalytics(payload.analytics ?? null);
          setError(null);
        }
      } catch (fetchError) {
        if (isMounted) {
          setAnalytics(null);
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Unable to load admin analytics."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadAnalytics();

    return () => {
      isMounted = false;
    };
  }, []);

  const chartData = analytics?.charts[period] ?? [];
  const topVendors = useMemo(
    () => (analytics?.vendorRankings ?? []).slice(0, 5),
    [analytics]
  );

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-8 text-sm text-muted-foreground">
        Loading platform analytics...
      </div>
    );
  }

  if (!analytics || error) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <Card className="border-none shadow-sm rounded-3xl">
          <CardContent className="p-8 space-y-4">
            <h1 className="text-2xl font-bold text-slate-900">
              Platform analytics unavailable
            </h1>
            <p className="text-sm text-slate-500">
              {error ?? "Unable to load platform analytics."}
            </p>
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
            Platform Insights
          </h1>
          <p className="text-slate-500">
            Live marketplace revenue, catalog mix, and operational health.
          </p>
        </div>

        <div className="flex gap-1 bg-muted/50 p-1 rounded-xl">
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
            value: formatNaira(analytics.summary.grossRevenueNaira),
            subtitle: `${analytics.summary.totalOrders} total orders`,
            icon: DollarSign,
          },
          {
            title: "This Month",
            value: formatNaira(analytics.summary.monthlyRevenueNaira),
            subtitle: `${analytics.summary.approvedVendors} approved vendors`,
            icon: Calendar,
          },
          {
            title: "Open Orders",
            value: analytics.summary.activeOrders.toLocaleString("en-NG"),
            subtitle: `${analytics.summary.deliveredOrders} delivered`,
            icon: ShoppingBag,
          },
          {
            title: "Avg. Fulfillment",
            value: formatMinutes(analytics.summary.averageFulfillmentMinutes),
            subtitle: `${analytics.summary.totalDrivers} driver profiles`,
            icon: Clock3,
          },
        ].map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm rounded-3xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {stat.title}
                  </p>
                  <h3 className="text-3xl font-bold text-slate-900 mt-2">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl p-6 bg-white">
          <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between mb-6">
            <div>
              <CardTitle>Marketplace Revenue</CardTitle>
              <CardDescription>
                Combined revenue from non-cancelled orders for the selected window
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-900">
                {formatNaira(
                  chartData.reduce((sum, point) => sum + point.revenueNaira, 0)
                )}
              </p>
              <p className="text-xs text-slate-500">
                {chartData.reduce((sum, point) => sum + point.orders, 0)} orders
              </p>
            </div>
          </CardHeader>
          {analytics.summary.totalOrders > 0 ? (
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorGlobalRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
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
                    dataKey="revenueNaira"
                    stroke="#0ea5e9"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorGlobalRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[350px] w-full flex items-center justify-center text-center text-sm text-muted-foreground">
              Revenue analytics will appear once vendors start receiving orders.
            </div>
          )}
        </Card>

        <Card className="border-none shadow-sm rounded-3xl p-6 bg-white">
          <CardHeader className="px-0 pt-0 mb-6">
            <CardTitle>Active Catalog Mix</CardTitle>
            <CardDescription>
              Share of active products by category
            </CardDescription>
          </CardHeader>
          {analytics.categoryDistribution.length > 0 ? (
            <>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={analytics.categoryDistribution}
                      innerRadius={60}
                      outerRadius={82}
                      paddingAngle={4}
                      dataKey="count"
                    >
                      {analytics.categoryDistribution.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [value, "Active products"]}
                    />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4 mt-6">
                {analytics.categoryDistribution.map((category, index) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm font-medium text-slate-600">
                        {category.name}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">
                      {category.value}% ({category.count})
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[250px] w-full flex items-center justify-center text-center text-sm text-muted-foreground">
              Product categories will populate after vendors add active items.
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
          <CardHeader className="p-6 border-b border-slate-50 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Top Performing Vendors</CardTitle>
              <CardDescription>Ranked by current month revenue</CardDescription>
            </div>
            <Link href="/admin/analytics/vendors">
              <Button variant="ghost" size="sm" className="text-primary rounded-lg">
                View Detailed
              </Button>
            </Link>
          </CardHeader>
          {topVendors.length === 0 ? (
            <div className="p-8 text-sm text-slate-500">
              Vendor rankings will appear once approved vendors start taking orders.
            </div>
          ) : (
            <div className="p-0">
              {topVendors.map((vendor) => (
                <div
                  key={vendor.vendorId}
                  className="flex items-center justify-between p-4 px-6 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center text-primary font-bold shrink-0">
                      {vendor.businessName[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-slate-900 truncate">
                        {vendor.businessName}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {vendor.ownerName} • {vendor.totalOrders} orders
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm text-primary">
                      {formatNaira(vendor.monthlyRevenueNaira)}
                    </p>
                    <Badge
                      className={`mt-1 border-none text-[10px] ${getVendorStatusClassName(vendor.status)}`}
                    >
                      {vendor.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 h-fit">
          <Card className="border-none shadow-sm p-6 rounded-3xl bg-slate-900 text-white">
            <p className="text-xs font-bold opacity-60 uppercase tracking-widest">
              Platform Footprint
            </p>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Customers</span>
                <span className="font-bold">{analytics.summary.totalCustomers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Drivers</span>
                <span className="font-bold">{analytics.summary.totalDrivers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Vendors</span>
                <span className="font-bold">{analytics.summary.totalVendors}</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-slate-300 text-xs font-bold">
              <Users className="h-4 w-4 text-primary" />
              {analytics.summary.activeCustomers} customers have placed orders
            </div>
          </Card>

          <Card className="border-none shadow-sm p-6 rounded-3xl bg-primary text-white">
            <p className="text-xs font-bold opacity-70 uppercase tracking-widest">
              Fulfillment Readiness
            </p>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-primary-foreground/70">Approved vendors</span>
                <span className="font-bold">{analytics.summary.approvedVendors}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-primary-foreground/70">Active drivers</span>
                <span className="font-bold">{analytics.summary.activeDrivers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-primary-foreground/70">Cancelled orders</span>
                <span className="font-bold">{analytics.summary.cancelledOrders}</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-white/80 text-xs font-bold">
              <Truck className="h-4 w-4" />
              Avg. order value {formatNaira(analytics.summary.averageOrderValueNaira)}
            </div>
          </Card>

          <Card className="border-none shadow-sm p-6 rounded-3xl bg-white sm:col-span-2">
            <CardTitle className="text-sm mb-4">Order Status Mix</CardTitle>
            <div className="space-y-4">
              {analytics.statusDistribution.map((entry) => {
                const maxCount = Math.max(
                  ...analytics.statusDistribution.map((status) => status.count),
                  1
                );
                const percent = Math.round((entry.count / maxCount) * 100);

                return (
                  <div key={entry.status} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span>{entry.label}</span>
                      <span>{entry.count} orders</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-2 mt-6">
              {analytics.paymentDistribution.map((entry) => (
                <Badge key={entry.method} variant="outline" className="rounded-full">
                  {entry.label}: {entry.count}
                </Badge>
              ))}
              <Badge variant="outline" className="rounded-full">
                <Store className="h-3 w-3 mr-1" />
                {analytics.categoryDistribution.length} active categories
              </Badge>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
