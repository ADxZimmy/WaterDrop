"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Store,
  Users,
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

type AdminSystemResponse = {
  system: AdminSystemSnapshot;
};

export default function AdminNewVendorPage() {
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
          throw new Error(payload?.error ?? "Unable to load vendor onboarding workflow.");
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
              : "Unable to load vendor onboarding workflow."
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
    return (
      <div className="max-w-4xl mx-auto p-8 text-sm text-muted-foreground">
        Loading vendor onboarding workflow...
      </div>
    );
  }

  if (!system || error) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <Card className="border-none shadow-sm rounded-3xl">
          <CardContent className="p-8 space-y-4">
            <h1 className="text-2xl font-bold text-slate-900">
              Vendor bootstrap workflow unavailable
            </h1>
            <p className="text-sm text-slate-500">
              {error ?? "Unable to load vendor onboarding workflow."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/vendors">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold font-headline text-slate-900">
            Add New Vendor
          </h1>
          <p className="text-slate-500">
            Manual vendor creation is not implemented in the MVP yet.
          </p>
        </div>
      </div>

      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardHeader className="bg-slate-50 border-b p-8">
          <CardTitle className="text-xl flex items-center gap-2">
            <Store className="h-6 w-6 text-primary" />
            Current Supported Workflow
          </CardTitle>
          <CardDescription>
            Vendors currently enter the system through self-registration and admin review.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 space-y-2">
              <Badge className="bg-primary/10 text-primary border-none">Step 1</Badge>
              <h3 className="font-bold text-slate-900">Vendor self-registers</h3>
              <p className="text-sm text-slate-600">
                Public vendor registration is enabled and routes the business into onboarding.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 space-y-2">
              <Badge className="bg-primary/10 text-primary border-none">Step 2</Badge>
              <h3 className="font-bold text-slate-900">Admin reviews application</h3>
              <p className="text-sm text-slate-600">
                Compliance details are checked inside the vendor applications queue.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 space-y-2">
              <Badge className="bg-primary/10 text-primary border-none">Step 3</Badge>
              <h3 className="font-bold text-slate-900">Approved vendor goes live</h3>
              <p className="text-sm text-slate-600">
                Only approved vendors with active products appear in the storefront.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 space-y-2">
            <div className="flex items-center gap-2 text-amber-800">
              <ShieldCheck className="h-5 w-5" />
              <h3 className="font-bold">Why this page is read-only</h3>
            </div>
            <p className="text-sm text-amber-900/80">
              Direct admin-side vendor bootstrap would need a real user account creation flow,
              secure invite handling, and persisted compliance assets. Those are not implemented yet,
              so this page now reflects the actual supported process instead of simulating a save.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm rounded-3xl bg-slate-900 text-white">
          <CardContent className="p-6">
            <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">
              Pending Reviews
            </p>
            <h3 className="text-3xl font-bold mt-3">
              {system.summary.pendingVendorApplications}
            </h3>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-3xl bg-white">
          <CardContent className="p-6">
            <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">
              Approved Vendors
            </p>
            <h3 className="text-3xl font-bold mt-3 text-slate-900">
              {system.summary.approvedVendors}
            </h3>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-3xl bg-white">
          <CardContent className="p-6">
            <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">
              Active Marketplace Footprint
            </p>
            <h3 className="text-3xl font-bold mt-3 text-slate-900">
              {system.summary.totalVendors}
            </h3>
            <p className="text-xs text-slate-500 mt-2">Total vendor profiles</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardHeader className="bg-slate-50 border-b p-8">
          <CardTitle className="text-xl flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Next Best Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-4">
          <div className="rounded-2xl border border-slate-100 bg-white p-4 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-slate-900">Review pending applications</p>
              <p className="text-sm text-slate-600">
                Use the live admin review queue to approve businesses that have already self-registered.
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-4 flex items-start gap-3">
            <FileText className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-slate-900">Track onboarding gaps</p>
              <p className="text-sm text-slate-600">
                Document storage and direct admin invites still need backend support before manual creation can be added safely.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/admin/applications">
              <Button className="rounded-xl h-11 px-6 shadow-lg shadow-primary/20">
                Open Review Queue
              </Button>
            </Link>
            <Link href="/admin/vendors">
              <Button variant="outline" className="rounded-xl h-11 px-6 border-slate-200">
                View Vendor Directory
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
