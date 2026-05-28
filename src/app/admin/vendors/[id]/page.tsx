"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock3,
  DollarSign,
  History,
  Mail,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Store,
} from "lucide-react";
import type { AdminVendorReviewRecord } from "@/lib/admin/vendor-review-types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ListPageSkeleton } from "@/components/ui/loading-skeletons";
import { Separator } from "@/components/ui/separator";

type AdminVendorResponse = {
  vendor: AdminVendorReviewRecord;
};

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
    return "Not available";
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

export default function AdminVendorProfilePage() {
  const params = useParams();
  const vendorId = typeof params?.id === "string" ? params.id : "";
  const [vendor, setVendor] = useState<AdminVendorReviewRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!vendorId) {
      setIsLoading(false);
      setError("Vendor not found.");
      return;
    }

    let isMounted = true;

    const loadVendor = async () => {
      try {
        const response = await fetch(`/api/admin/vendors/${vendorId}`, {
          method: "GET",
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error ?? "Unable to load vendor profile.");
        }

        const payload: AdminVendorResponse = await response.json();
        if (isMounted) {
          setVendor(payload.vendor ?? null);
          setError(null);
        }
      } catch (fetchError) {
        if (isMounted) {
          setVendor(null);
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Unable to load vendor profile."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadVendor();

    return () => {
      isMounted = false;
    };
  }, [vendorId]);

  const catalogLabel = useMemo(() => {
    if (!vendor) {
      return "0 active / 0 total";
    }

    return `${vendor.activeProductCount} active / ${vendor.productCount} total`;
  }, [vendor]);

  if (isLoading) {
    return <ListPageSkeleton rows={4} className="max-w-5xl p-0" />;
  }

  if (!vendor || error) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <Card className="border-none shadow-sm rounded-3xl">
          <CardContent className="p-8 space-y-4">
            <h1 className="text-2xl font-bold text-slate-900">
              Vendor profile unavailable
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
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/vendors">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold font-headline text-slate-900">
              Vendor Profile
            </h1>
            <p className="text-slate-500">ID: {vendor.vendorId}</p>
          </div>
          <Badge
            className={`ml-auto border-none px-4 py-1 ${getStatusClassName(vendor.status)}`}
          >
            {getStatusLabel(vendor.status)}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href={`/admin/vendors/${vendor.vendorId}/orders`}>
            <Button className="rounded-xl h-11 gap-2">
              <History className="h-4 w-4" />
              View Order History
            </Button>
          </Link>
          <Link href="/admin/applications">
            <Button variant="outline" className="rounded-xl h-11 border-slate-200">
              Open Review Queue
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 border-none shadow-sm h-fit rounded-[32px] overflow-hidden">
          <CardContent className="p-8 flex flex-col items-center text-center">
            <Avatar className="h-28 w-28 border-4 border-white shadow-xl mb-6">
              <AvatarFallback className="bg-slate-100 text-slate-700 text-3xl font-semibold">
                {getInitials(vendor.businessName)}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold text-slate-900">
              {vendor.businessName}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Owned by {vendor.ownerName}
            </p>
            {vendor.businessType ? (
              <p className="text-[11px] uppercase tracking-widest text-slate-400 mt-3">
                {vendor.businessType}
              </p>
            ) : null}

            <div className="grid grid-cols-2 w-full gap-4 mt-8">
              <div className="p-4 bg-slate-50 rounded-2xl text-center">
                <ShoppingBag className="h-4 w-4 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold text-slate-900">
                  {vendor.totalOrders.toLocaleString("en-NG")}
                </p>
                <p className="text-[10px] uppercase text-slate-400 font-bold">
                  Orders
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl text-center">
                <Package className="h-4 w-4 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold text-slate-900">
                  {vendor.activeProductCount}
                </p>
                <p className="text-[10px] uppercase text-slate-400 font-bold">
                  Active Products
                </p>
              </div>
            </div>

            <Separator className="my-8" />

            <div className="w-full space-y-4 text-left">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold text-slate-400">
                    Email
                  </p>
                  <p className="text-sm font-medium truncate">
                    {vendor.ownerEmail || "No email on file"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">
                    Phone
                  </p>
                  <p className="text-sm font-medium">
                    {vendor.ownerPhone ?? "No phone on file"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">
                    Location
                  </p>
                  <p className="text-sm font-medium leading-relaxed">
                    {vendor.address ?? "No business address submitted"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm p-6 rounded-[32px] bg-slate-900 text-white">
              <p className="text-xs uppercase font-bold tracking-widest opacity-60">
                Gross Revenue
              </p>
              <h3 className="text-3xl font-bold mt-2">
                {formatNaira(vendor.revenueNaira)}
              </h3>
              <div className="mt-4 flex items-center gap-2 text-slate-300 text-xs font-bold">
                <DollarSign className="h-4 w-4 text-primary" />
                Live non-cancelled order revenue
              </div>
            </Card>
            <Card className="border-none shadow-sm p-6 rounded-[32px] bg-primary text-white">
              <p className="text-xs uppercase font-bold tracking-widest opacity-70">
                Catalog Coverage
              </p>
              <h3 className="text-3xl font-bold mt-2">{catalogLabel}</h3>
              <p className="text-xs opacity-80 mt-4 italic">
                Active listings currently available to customers
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card className="border-none shadow-sm rounded-3xl bg-white">
              <CardContent className="p-5">
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                  Submitted
                </p>
                <p className="font-bold text-slate-900 mt-2">
                  {formatDate(vendor.submittedAt)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm rounded-3xl bg-white">
              <CardContent className="p-5">
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                  Reviewed
                </p>
                <p className="font-bold text-slate-900 mt-2">
                  {formatDate(vendor.reviewedAt)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm rounded-3xl bg-white">
              <CardContent className="p-5">
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                  Delivery Radius
                </p>
                <p className="font-bold text-slate-900 mt-2">
                  {typeof vendor.deliveryRadiusKm === "number"
                    ? `${vendor.deliveryRadiusKm} km`
                    : "Not set"}
                </p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm rounded-3xl bg-white">
              <CardContent className="p-5">
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                  Store Status
                </p>
                <p className="font-bold text-slate-900 mt-2">
                  {getStatusLabel(vendor.status)}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-sm rounded-[32px] overflow-hidden">
            <CardHeader className="bg-slate-50 p-8 border-b">
              <CardTitle className="text-xl flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-primary" />
                Compliance & Review
              </CardTitle>
              <CardDescription>
                Submitted compliance metadata and latest admin review state.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    NAFDAC Reg
                  </p>
                  <p className="font-mono font-bold text-slate-700">
                    {vendor.nafdacNumber ?? "Not submitted"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    TIN Number
                  </p>
                  <p className="font-mono font-bold text-slate-700">
                    {vendor.taxId ?? "Not submitted"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    CAC Number
                  </p>
                  <p className="font-mono font-bold text-slate-700">
                    {vendor.cacNumber ?? "Not submitted"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-slate-900 font-semibold">
                    <Calendar className="h-4 w-4 text-primary" />
                    Submission Timeline
                  </div>
                  <p className="text-sm text-slate-600 mt-3">
                    Submitted {formatDate(vendor.submittedAt)}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    Last reviewed {formatDate(vendor.reviewedAt)}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-slate-900 font-semibold">
                    <Clock3 className="h-4 w-4 text-primary" />
                    Current Review State
                  </div>
                  <p className="text-sm text-slate-600 mt-3">
                    {getStatusLabel(vendor.status)}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    {vendor.reviewedBy
                      ? `Reviewed by admin ${vendor.reviewedBy.slice(0, 8)}`
                      : "Awaiting admin action"}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Review Notes
                </p>
                <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                  {vendor.reviewNotes ??
                    "No admin notes recorded for this vendor yet."}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-[32px] bg-white p-8">
            <CardTitle className="text-xl mb-4">About the Business</CardTitle>
            <div className="space-y-4 text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <Store className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <p className="leading-relaxed">
                  {vendor.description ?? "No business summary submitted yet."}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Package className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <p className="leading-relaxed">
                  {catalogLabel} in catalog and{" "}
                  {vendor.totalOrders.toLocaleString("en-NG")} total orders on
                  WaterDrop so far.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <p className="leading-relaxed">
                  Delivery coverage:{" "}
                  {typeof vendor.deliveryRadiusKm === "number"
                    ? `${vendor.deliveryRadiusKm} km radius`
                    : "not specified"}.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
