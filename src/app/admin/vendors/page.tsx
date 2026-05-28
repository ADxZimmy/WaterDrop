"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock3,
  Eye,
  History,
  MoreHorizontal,
  Search,
  Store,
  TrendingUp,
  XCircle,
} from "lucide-react";
import type { AdminVendorReviewRecord } from "@/lib/admin/vendor-review-types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

type AdminVendorsResponse = {
  vendors: AdminVendorReviewRecord[];
};

type StatusFilter = "all" | AdminVendorReviewRecord["status"];

function getStatusLabel(status: AdminVendorReviewRecord["status"]) {
  if (status === "approved") {
    return "Approved";
  }

  if (status === "rejected") {
    return "Rejected";
  }

  return "Pending";
}

function getStatusClassName(status: AdminVendorReviewRecord["status"]) {
  if (status === "approved") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "rejected") {
    return "bg-rose-100 text-rose-700";
  }

  return "bg-amber-100 text-amber-700";
}

function formatNaira(value: number) {
  return `₦${value.toLocaleString("en-NG")}`;
}

function formatDate(timestamp: number | null) {
  if (!timestamp) {
    return "Unknown";
  }

  return new Date(timestamp).toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "VD";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<AdminVendorReviewRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    let isMounted = true;

    const loadVendors = async () => {
      try {
        const response = await fetch("/api/admin/vendors", { method: "GET" });
        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error ?? "Unable to load vendors.");
        }

        const payload: AdminVendorsResponse = await response.json();
        if (isMounted) {
          setVendors(payload.vendors ?? []);
          setError(null);
        }
      } catch (fetchError) {
        if (isMounted) {
          setVendors([]);
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Unable to load vendors."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadVendors();

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(
    () => ({
      total: vendors.length,
      approved: vendors.filter((vendor) => vendor.status === "approved").length,
      pending: vendors.filter((vendor) => vendor.status === "pending").length,
      rejected: vendors.filter((vendor) => vendor.status === "rejected").length,
      revenueNaira: vendors.reduce(
        (sum, vendor) => sum + vendor.revenueNaira,
        0
      ),
    }),
    [vendors]
  );

  const filteredVendors = useMemo(() => {
    const query = search.trim().toLowerCase();

    return vendors.filter((vendor) => {
      const matchesSearch =
        query.length === 0 ||
        vendor.businessName.toLowerCase().includes(query) ||
        vendor.ownerName.toLowerCase().includes(query) ||
        vendor.ownerEmail.toLowerCase().includes(query) ||
        vendor.vendorId.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" || vendor.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, vendors]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-slate-900">
            Partner Vendors
          </h1>
          <p className="text-slate-500">
            Live directory of vendor applications, approvals, and operating
            stores.
          </p>
        </div>
        <Link href="/admin/applications">
          <Button className="rounded-xl h-11 px-6 shadow-lg shadow-primary/20">
            Open Review Queue
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm rounded-3xl bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase font-bold tracking-widest text-slate-400">
                  Total Vendors
                </p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">
                  {stats.total}
                </h3>
              </div>
              <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Store className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase font-bold tracking-widest text-slate-400">
                  Approved
                </p>
                <h3 className="text-3xl font-bold text-emerald-600 mt-2">
                  {stats.approved}
                </h3>
              </div>
              <div className="h-11 w-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase font-bold tracking-widest text-slate-400">
                  Awaiting Review
                </p>
                <h3 className="text-3xl font-bold text-amber-600 mt-2">
                  {stats.pending}
                </h3>
                <p className="text-xs text-slate-500 mt-2">
                  {stats.rejected} previously rejected
                </p>
              </div>
              <div className="h-11 w-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock3 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl bg-slate-900 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase font-bold tracking-widest text-slate-400">
                  Gross Vendor Revenue
                </p>
                <h3 className="text-3xl font-bold mt-2">
                  {formatNaira(stats.revenueNaira)}
                </h3>
              </div>
              <div className="h-11 w-11 rounded-2xl bg-white/10 text-primary flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by business name, owner, email, or vendor ID..."
            className="pl-10 h-11 rounded-xl bg-white border-slate-200"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", "approved", "pending", "rejected"] as const).map(
            (filterValue) => (
              <Button
                key={filterValue}
                type="button"
                variant={statusFilter === filterValue ? "default" : "outline"}
                className="rounded-xl h-10 px-4 capitalize"
                onClick={() => setStatusFilter(filterValue)}
              >
                {filterValue === "all" ? "All statuses" : getStatusLabel(filterValue)}
              </Button>
            )
          )}
        </div>
      </div>

      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        {isLoading ? (
          <ListPageSkeleton rows={6} className="max-w-none px-0 py-0" />
        ) : error ? (
          <div className="p-10 text-center space-y-3">
            <h2 className="text-xl font-bold text-slate-900">
              Vendor directory unavailable
            </h2>
            <p className="text-sm text-slate-500">{error}</p>
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <h2 className="text-xl font-bold text-slate-900">No vendors match this view</h2>
            <p className="text-sm text-slate-500">
              Try another search term or switch to a different status filter.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="pl-8">Vendor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Orders</TableHead>
                <TableHead>Gross Revenue</TableHead>
                <TableHead>Catalog</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right pr-8">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVendors.map((vendor) => (
                <TableRow key={vendor.vendorId} className="group hover:bg-slate-50/50">
                  <TableCell className="pl-8">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-10 w-10 border border-slate-100">
                        <AvatarFallback className="bg-slate-100 text-slate-700 font-semibold">
                          {getInitials(vendor.businessName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-slate-900 truncate">
                          {vendor.businessName}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {vendor.ownerName}
                          {vendor.ownerEmail ? ` • ${vendor.ownerEmail}` : ""}
                        </p>
                        {vendor.businessType ? (
                          <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-1">
                            {vendor.businessType}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`rounded-full px-3 border-none ${getStatusClassName(vendor.status)}`}>
                      {getStatusLabel(vendor.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-slate-700">
                    {vendor.totalOrders.toLocaleString("en-NG")}
                  </TableCell>
                  <TableCell className="font-bold text-primary">
                    {formatNaira(vendor.revenueNaira)}
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {vendor.activeProductCount} active / {vendor.productCount} total
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {formatDate(vendor.submittedAt)}
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-slate-100">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/vendors/${vendor.vendorId}`}>
                            <Eye className="h-4 w-4" />
                            View Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/vendors/${vendor.vendorId}/orders`}>
                            <History className="h-4 w-4" />
                            Order History
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin/applications">
                            {vendor.status === "rejected" ? (
                              <XCircle className="h-4 w-4 text-rose-600" />
                            ) : (
                              <Clock3 className="h-4 w-4 text-amber-600" />
                            )}
                            Open Review Queue
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
