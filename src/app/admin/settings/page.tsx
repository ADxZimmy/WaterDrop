"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  CircleAlert,
  Database,
  Server,
  Settings2,
  ShieldCheck,
  Store,
  Wallet,
} from "lucide-react";
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
import { DashboardSkeleton } from "@/components/ui/loading-skeletons";

type AdminSystemResponse = {
  system: AdminSystemSnapshot;
};

function formatNaira(value: number) {
  return `₦${value.toLocaleString("en-NG")}`;
}

function getStatusBadgeClassName(isReady: boolean) {
  return isReady
    ? "bg-emerald-100 text-emerald-700"
    : "bg-rose-100 text-rose-700";
}

export default function AdminSettingsPage() {
  const [system, setSystem] = useState<AdminSystemSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadSystem = async () => {
      try {
        const response = await fetch("/api/admin/system", { method: "GET" });
        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error ?? "Unable to load system snapshot.");
        }

        const payload: AdminSystemResponse = await response.json();
        if (isMounted) {
          setSystem(payload.system ?? null);
          setError(null);
        }
      } catch (fetchError) {
        if (isMounted) {
          setSystem(null);
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Unable to load system snapshot."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadSystem();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return <DashboardSkeleton className="p-0" />;
  }

  if (!system || error) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <Card className="border-none shadow-sm rounded-3xl">
          <CardContent className="p-8 space-y-4">
            <h1 className="text-2xl font-bold text-slate-900">
              System settings unavailable
            </h1>
            <p className="text-sm text-slate-500">
              {error ?? "Unable to load system settings snapshot."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-slate-900">
            System Settings
          </h1>
          <p className="text-slate-500">
            Read-only operational snapshot for the current MVP runtime.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin">
            <Button variant="outline" className="rounded-xl h-11 px-6 bg-white border-slate-200">
              Back to Overview
            </Button>
          </Link>
          <Link href="/admin/applications">
            <Button className="rounded-xl h-11 px-6 shadow-lg shadow-primary/20">
              Review Applications
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          {
            title: "Gross Revenue",
            value: formatNaira(system.summary.grossRevenueNaira),
            subtitle: "Billable orders to date",
            icon: Wallet,
          },
          {
            title: "Open Orders",
            value: system.summary.openOrders.toLocaleString("en-NG"),
            subtitle: "Orders still in active workflow",
            icon: Store,
          },
          {
            title: "Pending Vendor Reviews",
            value: system.summary.pendingVendorApplications.toLocaleString("en-NG"),
            subtitle: `${system.summary.approvedVendors} approved vendors`,
            icon: ShieldCheck,
          },
          {
            title: "Driver Profiles",
            value: system.summary.totalDrivers.toLocaleString("en-NG"),
            subtitle: "Registered driver accounts",
            icon: Settings2,
          },
        ].map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm rounded-3xl bg-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-start gap-3">
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
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50 border-b p-6">
              <CardTitle className="text-lg">Current Operating Policies</CardTitle>
              <CardDescription>
                These reflect what the MVP actually supports today.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Vendor Onboarding
                </p>
                <h3 className="font-bold text-slate-900">Self-service + admin review</h3>
                <p className="text-sm text-slate-600">
                  Vendors register through onboarding and stay pending until an admin approves them.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Payments
                </p>
                <h3 className="font-bold text-slate-900">COD and manual transfer</h3>
                <p className="text-sm text-slate-600">
                  Supported payment modes are {system.policies.paymentMethods.join(" and ")} only.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Manual Vendor Creation
                </p>
                <h3 className="font-bold text-slate-900">
                  {system.policies.manualVendorCreation ? "Available" : "Not implemented"}
                </h3>
                <p className="text-sm text-slate-600">
                  Admins currently manage vendors through the review queue instead of direct bootstrap.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Driver Telemetry
                </p>
                <h3 className="font-bold text-slate-900">
                  {system.policies.driverTelemetry ? "Available" : "Deferred"}
                </h3>
                <p className="text-sm text-slate-600">
                  Driver profiles and loaded stock are live, but trip scoring and detailed fleet telemetry are not yet stored.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50 border-b p-6">
              <CardTitle className="text-lg">Compliance and Storage Snapshot</CardTitle>
              <CardDescription>
                Current readiness of supporting operational infrastructure.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              <div className="rounded-2xl border border-slate-100 bg-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold text-slate-900">Vendor document storage</p>
                    <p className="text-sm text-slate-600">
                      Admin notes and approval state are persisted, but uploaded document assets are not yet stored.
                    </p>
                  </div>
                </div>
                <Badge className={getStatusBadgeClassName(system.policies.vendorDocumentStorage)}>
                  {system.policies.vendorDocumentStorage ? "Ready" : "Pending"}
                </Badge>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold text-slate-900">Public vendor registration</p>
                    <p className="text-sm text-slate-600">
                      Self-serve business registration is open and routed through admin approval.
                    </p>
                  </div>
                </div>
                <Badge className={getStatusBadgeClassName(system.policies.publicVendorRegistration)}>
                  {system.policies.publicVendorRegistration ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="p-6 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Server className="h-5 w-5 text-primary" />
                Runtime Readiness
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">Firebase client env</p>
                  <p className="text-sm text-slate-600">Browser-side configuration present</p>
                </div>
                <Badge className={getStatusBadgeClassName(system.environment.firebaseClientConfigured)}>
                  {system.environment.firebaseClientConfigured ? "Ready" : "Missing"}
                </Badge>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">Firebase admin env</p>
                  <p className="text-sm text-slate-600">Protected server credentials present</p>
                </div>
                <Badge className={getStatusBadgeClassName(system.environment.firebaseAdminConfigured)}>
                  {system.environment.firebaseAdminConfigured ? "Ready" : "Missing"}
                </Badge>
              </div>
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <p className="text-sm text-emerald-800">
                  Core admin APIs are live and reading from Firestore-backed collections.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-3xl bg-slate-900 text-white p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                <CircleAlert className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Hardening Backlog</h4>
                <p className="text-[10px] text-slate-400">Current non-blocking gaps</p>
              </div>
            </div>
            <div className="space-y-3 text-sm text-slate-300">
              <p>Remaining settings and telemetry pages still need warning cleanup.</p>
              <p>`npm audit` still reports vulnerabilities that should be remediated in Phase 4.</p>
              <p>Document asset storage and detailed driver execution metrics are still deferred.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
