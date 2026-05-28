"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Boxes,
  Search,
  ShoppingBag,
  TrendingUp,
  Trophy,
} from "lucide-react";
import type { AdminAnalyticsPayload } from "@/lib/admin/ops-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ListPageSkeleton } from "@/components/ui/loading-skeletons";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AdminAnalyticsResponse = {
  analytics: AdminAnalyticsPayload;
};

function formatNaira(value: number) {
  return `₦${value.toLocaleString("en-NG")}`;
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

export default function AdminVendorRankingsPage() {
  const [analytics, setAnalytics] = useState<AdminAnalyticsPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadAnalytics = async () => {
      try {
        const response = await fetch("/api/admin/analytics", { method: "GET" });
        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error ?? "Unable to load vendor rankings.");
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
              : "Unable to load vendor rankings."
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

  const rankings = useMemo(() => {
    const query = search.trim().toLowerCase();
    const records = analytics?.vendorRankings ?? [];

    return records.filter((vendor) => {
      if (query.length === 0) {
        return true;
      }

      return (
        vendor.businessName.toLowerCase().includes(query) ||
        vendor.ownerName.toLowerCase().includes(query) ||
        vendor.vendorId.toLowerCase().includes(query)
      );
    });
  }, [analytics, search]);

  const highestEarner = rankings[0] ?? null;
  const averageMonthlyRevenue = useMemo(() => {
    if (rankings.length === 0) {
      return 0;
    }

    return Math.round(
      rankings.reduce((sum, vendor) => sum + vendor.monthlyRevenueNaira, 0) /
        rankings.length
    );
  }, [rankings]);
  const topCatalogVendor = useMemo(
    () =>
      [...rankings].sort(
        (left, right) => right.activeProductCount - left.activeProductCount
      )[0] ?? null,
    [rankings]
  );

  if (isLoading) {
    return (
      <ListPageSkeleton rows={6} className="max-w-7xl p-0" />
    );
  }

  if (!analytics || error) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <Card className="border-none shadow-sm rounded-3xl">
          <CardContent className="p-8 space-y-4">
            <h1 className="text-2xl font-bold text-slate-900">
              Vendor rankings unavailable
            </h1>
            <p className="text-sm text-slate-500">
              {error ?? "Unable to load vendor rankings."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/analytics">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold font-headline text-slate-900">
            Vendor Performance Rankings
          </h1>
          <p className="text-slate-500">
            Marketplace leaderboard based on current month revenue.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-slate-900 text-white p-6 rounded-[32px]">
          <p className="text-xs uppercase font-bold tracking-widest opacity-60">
            Highest Earner
          </p>
          <h3 className="text-2xl font-bold mt-2">
            {highestEarner?.businessName ?? "No vendors yet"}
          </h3>
          <div className="mt-4 flex items-center gap-2 text-emerald-400 text-xs font-bold">
            <TrendingUp className="h-4 w-4" />
            {highestEarner
              ? formatNaira(highestEarner.monthlyRevenueNaira)
              : "Awaiting live orders"}
          </div>
        </Card>
        <Card className="border-none shadow-sm bg-primary text-white p-6 rounded-[32px]">
          <p className="text-xs uppercase font-bold tracking-widest opacity-60">
            Avg. Monthly Revenue
          </p>
          <h3 className="text-2xl font-bold mt-2">
            {formatNaira(averageMonthlyRevenue)}
          </h3>
          <div className="mt-4 text-white/80 text-xs font-bold">
            Across {rankings.length} registered vendors
          </div>
        </Card>
        <Card className="border-none shadow-sm bg-white p-6 rounded-[32px]">
          <p className="text-xs uppercase font-bold tracking-widest text-slate-400">
            Deepest Active Catalog
          </p>
          <h3 className="text-2xl font-bold mt-2">
            {topCatalogVendor?.businessName ?? "No vendors yet"}
          </h3>
          <div className="mt-4 flex items-center gap-1 text-primary text-xs font-bold">
            <Boxes className="h-4 w-4" />
            {topCatalogVendor
              ? `${topCatalogVendor.activeProductCount} active products`
              : "Awaiting catalog data"}
          </div>
        </Card>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search vendors by business name, owner, or ID..."
            className="pl-10 h-11 rounded-xl bg-white border-slate-200"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        {rankings.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <h2 className="text-xl font-bold text-slate-900">
              No vendor rankings match this view
            </h2>
            <p className="text-sm text-slate-500">
              Try another search term or wait for new marketplace activity.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[80px] pl-8 text-center">Rank</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Monthly Revenue</TableHead>
                <TableHead>Gross Revenue</TableHead>
                <TableHead>Total Orders</TableHead>
                <TableHead>Active Catalog</TableHead>
                <TableHead className="pr-8">Compliance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rankings.map((vendor, index) => (
                <TableRow key={vendor.vendorId} className="group hover:bg-slate-50/50">
                  <TableCell className="pl-8 text-center">
                    <div className="flex justify-center">
                      {index === 0 ? (
                        <Trophy className="h-5 w-5 text-yellow-500" />
                      ) : (
                        <span className="text-xs font-bold text-slate-400">
                          #{index + 1}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/vendors/${vendor.vendorId}`}>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 border border-slate-100 rounded-xl flex items-center justify-center bg-slate-100 text-primary font-semibold">
                          {vendor.businessName[0]}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-sm text-slate-900 truncate">
                            {vendor.businessName}
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase tracking-tighter truncate">
                            {vendor.vendorId} • {vendor.ownerName}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="font-bold text-slate-900">
                    {formatNaira(vendor.monthlyRevenueNaira)}
                  </TableCell>
                  <TableCell className="font-medium text-primary">
                    {formatNaira(vendor.revenueNaira)}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-slate-600">
                    <div className="flex items-center gap-1">
                      <ShoppingBag className="h-3.5 w-3.5 text-slate-400" />
                      {vendor.totalOrders.toLocaleString("en-NG")}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {vendor.activeProductCount} / {vendor.productCount}
                  </TableCell>
                  <TableCell className="pr-8">
                    <Badge
                      className={`rounded-full px-3 border-none text-[10px] font-bold ${getVendorStatusClassName(vendor.status)}`}
                    >
                      {vendor.status}
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
