"use client";

import React from "react";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  Clock3,
  Edit2,
  MapPin,
  Navigation,
  Truck,
  User,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDriverWorkspace } from "@/hooks/use-driver-workspace";

function getDisplayName(firstName?: string, lastName?: string, email?: string) {
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
  return fullName || email || "Driver";
}

function formatDateTime(timestamp: number | null) {
  if (!timestamp) {
    return "No activity yet";
  }

  return new Date(timestamp).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getDriverStatusClassName(status: "pending" | "active" | "inactive") {
  if (status === "active") {
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }

  if (status === "inactive") {
    return "bg-slate-100 text-slate-700 border-slate-200";
  }

  return "bg-amber-100 text-amber-700 border-amber-200";
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

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function DriverDashboard() {
  const { workspace, isLoading, error } = useDriverWorkspace();

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 text-sm text-muted-foreground">
        Loading driver workspace...
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <Card className="border-none shadow-sm rounded-3xl">
          <CardContent className="p-8 space-y-2">
            <h1 className="text-2xl font-bold font-headline">Driver workspace unavailable</h1>
            <p className="text-sm text-muted-foreground">
              {error ?? "Unable to load driver workspace."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { user, driver, vendor, assignments, payouts, activeOrders, recentPayoutRequests, capabilities } = workspace;

  if (!driver || driver.status !== "active") {
    return (
      <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-headline">Driver Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Finish your live profile setup before delivery tools can unlock.
            </p>
          </div>
          <Badge
            variant="outline"
            className={driver ? getDriverStatusClassName(driver.status) : "bg-amber-50 text-amber-700 border-amber-200"}
          >
            {driver ? driver.status : "setup required"}
          </Badge>
        </div>

        <Card className="border-dashed border-2 bg-muted/5 rounded-[32px]">
          <CardContent className="p-12 text-center space-y-6">
            <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto">
              <Truck className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Complete Your Driver Profile</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Link your account to a registered WaterDrop vendor and provide your
                vehicle details. Orders and payouts only become available after your
                profile is active and your vendor starts assigning deliveries to you.
              </p>
            </div>
            {driver ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 text-left max-w-xl mx-auto space-y-2">
                <p className="text-sm font-semibold text-slate-900">
                  Existing profile
                </p>
                <p className="text-sm text-slate-600">
                  Vendor ID: {driver.vendorId}
                </p>
                <p className="text-sm text-slate-600">
                  Vehicle: {driver.vehicleType ?? "Not set"}
                </p>
                <p className="text-sm text-slate-600">
                  Plate: {driver.licensePlate ?? "Not set"}
                </p>
                <p className="text-sm text-slate-600">
                  Loaded units: {driver.loadedUnits.toLocaleString("en-NG")}
                </p>
              </div>
            ) : null}
            <Link href="/auth/onboarding/driver">
              <Button size="lg" className="rounded-xl px-8 shadow-lg shadow-primary/20">
                {driver ? "Continue Setup" : "Start Setup Now"}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">
            Welcome back, {getDisplayName(user.firstName, user.lastName, user.email)}
          </h1>
          <p className="text-sm text-muted-foreground">
              Live driver profile, active delivery assignments, and payout snapshot.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={getDriverStatusClassName(driver.status)}>
            {driver.status}
          </Badge>
          {vendor ? (
            <Badge className={`border-none ${getVendorStatusClassName(vendor.status)}`}>
              {vendor.businessName}
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm rounded-3xl bg-white">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Truck className="h-6 w-6" />
              </div>
              <Link href="/dashboard/driver/inventory">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg border-primary/20 text-primary"
                >
                  <Edit2 className="h-3 w-3 mr-1" />
                  Update
                </Button>
              </Link>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Loaded Units
              </p>
              <h2 className="text-3xl font-bold text-slate-900 mt-2">
                {driver.loadedUnits.toLocaleString("en-NG")}
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Live stock count from your driver inventory profile.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl bg-white">
          <CardContent className="p-6 space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Vendor Assignment
              </p>
              <h2 className="text-xl font-bold text-slate-900 mt-2">
                {vendor?.businessName ?? driver.vendorId}
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                {driver.vehicleType ?? "Vehicle type not set"}{" "}
                {driver.licensePlate ? `• ${driver.licensePlate}` : ""}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl bg-white">
          <CardContent className="p-6 space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Active Assignments
              </p>
              <h2 className="text-3xl font-bold text-slate-900 mt-2">
                {assignments.activeAssignedOrders.toLocaleString("en-NG")}
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Orders currently assigned to your driver account and still in progress.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl bg-white">
          <CardContent className="p-6 space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Available Balance
              </p>
              <h2 className="text-lg font-bold text-slate-900 mt-2">
                {formatCurrency(payouts.availableBalanceNaira)}
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Accrued from delivered orders that have not yet been withdrawn.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 border-none shadow-sm rounded-3xl bg-white">
          <CardHeader className="border-b bg-slate-50 rounded-t-3xl">
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Assigned Deliveries
            </CardTitle>
            <CardDescription>
              Orders below are truly linked to your driver account.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {activeOrders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-muted-foreground">
                No active deliveries are assigned to you right now.
              </div>
            ) : (
              activeOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-2xl border border-slate-200 p-4 flex flex-col xl:flex-row xl:items-center gap-4"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-900">{order.id}</p>
                      <Badge className="bg-slate-100 text-slate-700 border-none">
                        {order.status.replaceAll("_", " ")}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{order.customerName}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-slate-600">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span>{order.deliveryAddress ?? "Delivery address unavailable"}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Total {formatCurrency(order.totalNaira)}</span>
                      <span>Updated {formatDateTime(order.updatedAt)}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link href={`/dashboard/driver/orders/${order.id}`}>
                      <Button variant="outline" className="rounded-xl">
                        View Details
                      </Button>
                    </Link>
                    <Link href={`/dashboard/driver/navigate/${order.id}`}>
                      <Button className="rounded-xl shadow-lg shadow-primary/20">
                        <Navigation className="h-4 w-4 mr-2" />
                        Navigate
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
            {vendor?.reviewNotes ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
                <p className="font-semibold text-slate-900 mb-1">Latest vendor review note</p>
                <p>{vendor.reviewNotes}</p>
              </div>
            ) : null}
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard/driver/inventory">
                <Button className="rounded-xl shadow-lg shadow-primary/20">
                  Manage Inventory
                </Button>
              </Link>
              <Link href="/dashboard/driver/profile">
                <Button variant="outline" className="rounded-xl">
                  Review Driver Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl bg-white">
          <CardHeader className="border-b bg-slate-50 rounded-t-3xl">
            <CardTitle className="flex items-center gap-2">
              <Clock3 className="h-5 w-5 text-primary" />
              Payout Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Available</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(payouts.availableBalanceNaira)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Requested</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(payouts.requestedBalanceNaira)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Paid lifetime</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(payouts.lifetimePaidNaira)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Pending requests</span>
              <span className="font-semibold text-slate-900">
                {recentPayoutRequests.filter((request) => request.status === "pending").length}
              </span>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4 text-sm text-muted-foreground">
              Driver assignment and payout accrual are live. Navigation telemetry and
              self-service security controls remain deferred.
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Assignments</span>
              <Badge className={capabilities.driverAssignments ? "bg-emerald-100 text-emerald-700 border-none" : "bg-slate-100 text-slate-700 border-none"}>
                {capabilities.driverAssignments ? "Live" : "Deferred"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Navigation guidance</span>
              <Badge className={capabilities.turnByTurnNavigation ? "bg-emerald-100 text-emerald-700 border-none" : "bg-slate-100 text-slate-700 border-none"}>
                {capabilities.turnByTurnNavigation ? "Live" : "External maps only"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
