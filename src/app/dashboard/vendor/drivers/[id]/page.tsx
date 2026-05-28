"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Building2, Clock3, History, Mail, Percent, Phone, Truck } from 'lucide-react';
import type { DriverCompensationConfig } from "@/lib/domain/schemas";
import type { VendorOrderRecord } from "@/lib/orders/vendor-order";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ListPageSkeleton } from "@/components/ui/loading-skeletons";

type VendorDriverRecord = {
  uid: string;
  name: string;
  email?: string;
  phone?: string;
  status: "pending" | "active" | "inactive";
  vehicleType?: string;
  licensePlate?: string;
  loadedUnits: number;
  createdAt: number;
  updatedAt: number;
  activeOrdersCount: number;
  deliveredOrdersCount: number;
  availableBalanceNaira: number;
  requestedBalanceNaira: number;
  paidBalanceNaira: number;
};

type DriverProfileResponse = {
  driver: VendorDriverRecord;
  payoutSummary: {
    availableBalanceNaira: number;
    requestedBalanceNaira: number;
    lifetimePaidNaira: number;
    activeAssignedOrders: number;
    deliveredAssignedOrders: number;
    recentAssignedOrders: VendorOrderRecord[];
  };
  commissionConfig: DriverCompensationConfig;
  commissionSource: "vendor_default" | "driver_override";
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStatusBadgeClass(status: VendorDriverRecord["status"]) {
  if (status === "active") {
    return "bg-green-100 text-green-700";
  }

  if (status === "inactive") {
    return "bg-slate-100 text-slate-700";
  }

  return "bg-yellow-100 text-yellow-700";
}

function formatRuleLabel(config: DriverCompensationConfig, key: "bagsRule" | "bottledRule" | "bulkRule") {
  const rule = config[key];
  return rule.mode === "percentage" ? `${rule.value}%` : formatCurrency(rule.value);
}

export default function VendorDriverProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const driverId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [profile, setProfile] = useState<DriverProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const response = await fetch(`/api/vendor/drivers/${driverId}`, { method: "GET" });
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(payload?.error ?? "Unable to load driver profile.");
        }

        if (isMounted) {
          setProfile(payload as DriverProfileResponse);
          setError(null);
        }
      } catch (fetchError) {
        if (isMounted) {
          setProfile(null);
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Unable to load driver profile."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (driverId) {
      void loadProfile();
    } else {
      setIsLoading(false);
      setError("Driver not found.");
    }

    return () => {
      isMounted = false;
    };
  }, [driverId]);

  const recentOrders = useMemo(
    () => profile?.payoutSummary.recentAssignedOrders.slice(0, 5) ?? [],
    [profile]
  );

  if (isLoading) {
    return <ListPageSkeleton rows={4} className="max-w-5xl md:px-8" />;
  }

  if (error || !profile) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <Card className="border-none shadow-sm rounded-3xl">
          <CardContent className="p-8 space-y-4">
            <h1 className="text-2xl font-bold font-headline">Driver profile unavailable</h1>
            <p className="text-sm text-muted-foreground">
              {error ?? "Unable to load driver profile."}
            </p>
            <Button variant="outline" className="rounded-xl" onClick={() => router.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { driver, payoutSummary, commissionConfig, commissionSource } = profile;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold font-headline">Driver Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 border-none shadow-sm h-fit">
          <CardContent className="p-8 flex flex-col items-center text-center">
            <Avatar className="h-32 w-32 border-4 border-white shadow-xl mb-6">
              <AvatarFallback>{driver.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold">{driver.name}</h2>
            <p className="text-muted-foreground text-sm mt-1">Joined {formatDate(driver.createdAt)}</p>

            <Badge className={`mt-4 border-none px-4 ${getStatusBadgeClass(driver.status)}`}>
              {driver.status}
            </Badge>

            <div className="grid grid-cols-2 w-full gap-4 mt-8">
              <div className="p-3 bg-muted/30 rounded-2xl text-center">
                <Truck className="h-4 w-4 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold">{driver.activeOrdersCount}</p>
                <p className="text-[10px] uppercase text-muted-foreground font-bold">Active Orders</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-2xl text-center">
                <History className="h-4 w-4 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold">{driver.deliveredOrdersCount}</p>
                <p className="text-[10px] uppercase text-muted-foreground font-bold">Delivered</p>
              </div>
            </div>

            <div className="w-full mt-8 space-y-4">
              <Card className="border-none bg-primary/5 p-4 rounded-2xl text-left">
                <div className="flex items-center gap-2 mb-3">
                  <Percent className="h-4 w-4 text-primary" />
                  <span className="font-bold text-xs uppercase tracking-wider">Active Commission</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Water Bags</span>
                    <span className="font-bold text-primary">{formatRuleLabel(commissionConfig, "bagsRule")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bottled Water</span>
                    <span className="font-bold text-primary">{formatRuleLabel(commissionConfig, "bottledRule")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bulk Supply</span>
                    <span className="font-bold text-primary">{formatRuleLabel(commissionConfig, "bulkRule")}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Source: {commissionSource === "driver_override" ? "Driver override" : "Vendor default"}
                </p>
                <Link href={`/dashboard/vendor/drivers/${driver.uid}/commission`} className="block mt-4">
                  <Button variant="outline" size="sm" className="w-full h-8 text-[10px] font-bold uppercase rounded-lg border-primary/20 text-primary hover:bg-primary/5">
                    Update Rates
                  </Button>
                </Link>
              </Card>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 p-6">
              <CardTitle className="text-lg">Live Driver Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{driver.email ?? "No email recorded"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{driver.phone ?? "No phone recorded"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <span>{driver.vehicleType ?? "Vehicle not set"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{driver.licensePlate ?? "Plate not set"}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Loaded units</span>
                  <span className="font-bold">{driver.loadedUnits.toLocaleString("en-NG")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Accrued balance</span>
                  <span className="font-bold text-primary">{formatCurrency(driver.availableBalanceNaira)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Requested balance</span>
                  <span className="font-bold">{formatCurrency(driver.requestedBalanceNaira)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Paid lifetime</span>
                  <span className="font-bold">{formatCurrency(payoutSummary.lifetimePaidNaira)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Recent Assigned Orders</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {recentOrders.length === 0 ? (
                <div className="p-6 text-sm text-muted-foreground">
                  No assigned orders for this driver yet.
                </div>
              ) : (
                <div className="divide-y">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 px-6 hover:bg-muted/10">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-muted rounded-xl flex items-center justify-center text-primary">
                          <History className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">{order.id}</p>
                          <p className="text-xs text-muted-foreground">{order.customerName}</p>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-1">
                            <Clock3 className="h-3 w-3" />
                            {formatDate(order.updatedAt)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-primary">{formatCurrency(order.totalNaira)}</p>
                        <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-700 border-slate-200">
                          {order.status.replaceAll("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
