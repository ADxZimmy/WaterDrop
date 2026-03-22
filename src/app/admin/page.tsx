"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronRight,
  DollarSign,
  Server,
  ShieldCheck,
  ShoppingBag,
  Store,
  Users,
} from "lucide-react";
import type { AdminAnalyticsPayload } from "@/lib/admin/ops-types";
import type { AdminSystemSnapshot } from "@/lib/admin/system-types";
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
import { cn } from "@/lib/utils";

type Period = "days" | "weeks" | "months";
type AdminAnalyticsResponse = {
  analytics: AdminAnalyticsPayload;
};
type AdminSystemResponse = {
  system: AdminSystemSnapshot;
};

function formatNaira(value: number) {
  return `₦${value.toLocaleString("en-NG")}`;
}

function formatSubmittedAgo(timestamp: number | null) {
  if (!timestamp) {
    return "just now";
  }

  const elapsedHours = Math.max(1, Math.round((Date.now() - timestamp) / 3600000));
  if (elapsedHours < 24) {
    return `${elapsedHours}h ago`;
  }

  const elapsedDays = Math.round(elapsedHours / 24);
  return `${elapsedDays}d ago`;
}

export default function AdminOverviewPage() {
  const [analytics, setAnalytics] = useState<AdminAnalyticsPayload | null>(null);
  const [system, setSystem] = useState<AdminSystemSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>("days");

  useEffect(() => {
    let isMounted = true;

    const loadOverview = async () => {
      try {
        const [analyticsResponse, systemResponse] = await Promise.all([
          fetch("/api/admin/analytics", { method: "GET" }),
          fetch("/api/admin/system", { method: "GET" }),
        ]);

        if (!analyticsResponse.ok) {
          const payload = await analyticsResponse.json().catch(() => null);
          throw new Error(payload?.error ?? "Unable to load admin analytics.");
        }

        if (!systemResponse.ok) {
          const payload = await systemResponse.json().catch(() => null);
          throw new Error(payload?.error ?? "Unable to load admin system snapshot.");
        }

        const [analyticsPayload, systemPayload] = await Promise.all([
          analyticsResponse.json() as Promise<AdminAnalyticsResponse>,
          systemResponse.json() as Promise<AdminSystemResponse>,
        ]);

        if (isMounted) {
          setAnalytics(analyticsPayload.analytics ?? null);
          setSystem(systemPayload.system ?? null);
          setError(null);
        }
      } catch (fetchError) {
        if (isMounted) {
          setAnalytics(null);
          setSystem(null);
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Unable to load admin overview."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadOverview();

    return () => {
      isMounted = false;
    };
  }, []);

  const chartData = analytics?.charts[period] ?? [];
  const applicationQueueLabel = useMemo(() => {
    const count = system?.summary.pendingVendorApplications ?? 0;
    if (count === 0) {
      return "No pending applications";
    }

    return `${count} pending review${count === 1 ? "" : "s"}`;
  }, [system?.summary.pendingVendorApplications]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-8 text-sm text-muted-foreground">
        Loading admin overview...
      </div>
    );
  }

  if (!analytics || !system || error) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <Card className="border-none shadow-sm rounded-3xl">
          <CardContent className="p-8 space-y-4">
            <h1 className="text-2xl font-bold text-slate-900">
              Admin overview unavailable
            </h1>
            <p className="text-sm text-slate-500">
              {error ?? "Unable to load admin overview."}
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
          <h1 className="text-4xl font-bold font-headline text-slate-900">
            Holistic Overview
          </h1>
          <p className="text-slate-500 mt-1">
            Live platform performance and readiness snapshot.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/analytics">
            <Button variant="outline" className="rounded-xl h-11 px-6 bg-white border-slate-200">
              Open Analytics
            </Button>
          </Link>
          <Link href="/admin/settings">
            <Button className="rounded-xl h-11 px-6 shadow-lg shadow-primary/20">
              System Settings
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "Gross Revenue",
            value: formatNaira(system.summary.grossRevenueNaira),
            subtitle: `${analytics.summary.deliveredOrders} delivered orders`,
            icon: DollarSign,
            color: "bg-blue-500",
          },
          {
            title: "Approved Vendors",
            value: system.summary.approvedVendors.toLocaleString("en-NG"),
            subtitle: `${system.summary.totalVendors} total vendors`,
            icon: Store,
            color: "bg-emerald-500",
          },
          {
            title: "Open Orders",
            value: system.summary.openOrders.toLocaleString("en-NG"),
            subtitle: `${analytics.summary.cancelledOrders} cancelled`,
            icon: ShoppingBag,
            color: "bg-amber-500",
          },
          {
            title: "Active Customers",
            value: analytics.summary.activeCustomers.toLocaleString("en-NG"),
            subtitle: `${system.summary.totalCustomers} registered customers`,
            icon: Users,
            color: "bg-indigo-500",
          },
        ].map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className={`h-12 w-12 ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-inner`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-600">
                  Live
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">
                  {stat.title}
                </p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
                <p className="text-xs text-slate-500 mt-2">{stat.subtitle}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm p-6 bg-white rounded-3xl">
          <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between mb-6">
            <div>
              <CardTitle className="text-xl">Revenue Growth</CardTitle>
              <CardDescription>
                Platform-wide billable order revenue for the selected window
              </CardDescription>
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
          </CardHeader>
          {analytics.summary.totalOrders > 0 ? (
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorAdminRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
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
                    fill="url(#colorAdminRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[350px] w-full flex items-center justify-center text-center text-sm text-muted-foreground">
              Revenue analytics will appear once the marketplace receives live orders.
            </div>
          )}
        </Card>

        <div className="space-y-8">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-slate-900 text-white">
            <CardHeader className="p-6 border-b border-slate-800">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" /> Application Queue
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                {applicationQueueLabel}
              </p>
              {system.pendingApplications.length > 0 ? (
                system.pendingApplications.map((application) => (
                  <div key={application.vendorId} className="flex items-center justify-between group gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 bg-slate-800 rounded-xl flex items-center justify-center text-primary font-bold shrink-0">
                        {application.businessName[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">
                          {application.businessName}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {application.businessType ?? "Vendor"} • {application.ownerName} •{" "}
                          {formatSubmittedAgo(application.submittedAt)}
                        </p>
                      </div>
                    </div>
                    <Link href="/admin/applications">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 rounded-lg text-primary hover:text-white hover:bg-primary"
                      >
                        Review <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl bg-slate-800 p-4 text-sm text-slate-400">
                  All vendor applications have been reviewed.
                </div>
              )}
              <Link href="/admin/applications" className="block pt-2">
                <Button
                  variant="outline"
                  className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 rounded-xl h-10"
                >
                  View All Applications
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="p-6 border-b border-slate-100">
              <CardTitle className="text-lg flex items-center gap-2">
                <Server className="h-5 w-5 text-primary" /> Runtime Readiness
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Firebase Client
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    Public app configuration for browser flows
                  </p>
                </div>
                <Badge
                  className={`border-none ${
                    system.environment.firebaseClientConfigured
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {system.environment.firebaseClientConfigured ? "Ready" : "Missing"}
                </Badge>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Firebase Admin
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    Server credentials for protected API operations
                  </p>
                </div>
                <Badge
                  className={`border-none ${
                    system.environment.firebaseAdminConfigured
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {system.environment.firebaseAdminConfigured ? "Ready" : "Missing"}
                </Badge>
              </div>
              <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-tight">
                  Admin surfaces now read live Firestore-backed platform data
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}