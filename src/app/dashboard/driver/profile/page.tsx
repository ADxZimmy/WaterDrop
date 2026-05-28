"use client";

import React from "react";
import Link from "next/link";
import {
  Building2,
  ChevronRight,
  LogOut,
  Mail,
  Phone,
  Shield,
  Truck,
  User,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListPageSkeleton } from "@/components/ui/loading-skeletons";
import { useAuthSignOut } from "@/hooks/use-auth-sign-out";
import { useDriverWorkspace } from "@/hooks/use-driver-workspace";

function getDisplayName(firstName?: string, lastName?: string, email?: string) {
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
  return fullName || email || "Driver";
}

function getInitials(firstName?: string, lastName?: string, email?: string) {
  const source = getDisplayName(firstName, lastName, email)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((value) => value[0]?.toUpperCase() ?? "")
    .join("");

  return source || "DR";
}

function formatJoinedDate(timestamp: number | null) {
  if (!timestamp) {
    return "Join date unavailable";
  }

  return `Active since ${new Date(timestamp).toLocaleDateString("en-NG", {
    month: "short",
    year: "numeric",
  })}`;
}

export default function DriverProfilePage() {
  const { workspace, isLoading, error } = useDriverWorkspace();
  const { signOut, isSigningOut } = useAuthSignOut();

  if (isLoading) {
    return <ListPageSkeleton rows={3} className="max-w-4xl p-0" />;
  }

  if (error || !workspace) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <Card className="border-none shadow-sm rounded-3xl">
          <CardContent className="p-8 space-y-2">
            <h1 className="text-2xl font-bold font-headline">Driver profile unavailable</h1>
            <p className="text-sm text-muted-foreground">
              {error ?? "Unable to load driver profile."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { user, driver, vendor, assignments, payouts, capabilities } = workspace;
  const displayName = getDisplayName(user.firstName, user.lastName, user.email);

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col items-center text-center">
        <Avatar className="h-28 w-28 border-4 border-white shadow-xl">
          <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
            {getInitials(user.firstName, user.lastName, user.email)}
          </AvatarFallback>
        </Avatar>
        <h1 className="mt-4 text-2xl font-bold font-headline">{displayName}</h1>
        <p className="text-muted-foreground text-sm">
          {formatJoinedDate(driver?.createdAt ?? user.createdAt)}
        </p>

        <div className="flex flex-wrap justify-center gap-2 mt-6">
          <Badge className="bg-primary/10 text-primary border-none">driver</Badge>
          {driver ? (
            <Badge className="bg-emerald-100 text-emerald-700 border-none">
              {driver.status}
            </Badge>
          ) : (
            <Badge className="bg-amber-100 text-amber-700 border-none">
              setup required
            </Badge>
          )}
          {vendor ? (
            <Badge className="bg-slate-100 text-slate-700 border-none">
              {vendor.businessName}
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="bg-primary/5 p-6 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Driver Assignment
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="rounded-2xl bg-muted/20 p-4">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">
                Vehicle Type
              </p>
              <p className="text-lg font-bold text-slate-900">
                {driver?.vehicleType ?? "Not set"}
              </p>
            </div>
            <div className="rounded-2xl bg-muted/20 p-4">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">
                License Plate
              </p>
              <p className="text-lg font-bold text-slate-900">
                {driver?.licensePlate ?? "Not set"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
              Loaded units: {driver?.loadedUnits.toLocaleString("en-NG") ?? "0"}
              <br />
              Active assignments: {assignments.activeAssignedOrders.toLocaleString("en-NG")}
              <br />
              Available balance: ₦{payouts.availableBalanceNaira.toLocaleString("en-NG")}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="bg-muted/30 p-6">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Email Address</p>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.email}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Phone Number</p>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.phone ?? "Not set"}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Assigned Vendor</p>
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {vendor?.businessName ?? driver?.vendorId ?? "Not assigned"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
        <CardHeader className="bg-muted/30 p-6">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Workspace Limits
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-3 text-sm text-muted-foreground">
          <p>
            Driver assignment: {capabilities.driverAssignments ? "live" : "not wired"}
          </p>
          <p>
            Turn-by-turn navigation:{" "}
            {capabilities.turnByTurnNavigation ? "live" : "external map links only"}
          </p>
          <p>
            Self-service security management:{" "}
            {capabilities.selfServiceSecurity ? "live" : "not yet available"}
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Link href="/dashboard/driver/profile/security" className="block">
          <Button
            variant="ghost"
            className="w-full justify-between h-14 rounded-2xl bg-white shadow-sm border border-transparent hover:border-primary/20"
          >
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <span className="font-bold">Security & Password</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Button>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-between h-14 rounded-2xl bg-white shadow-sm border border-transparent hover:border-primary/20"
          onClick={() => void signOut()}
        >
          <div className="flex items-center gap-3 text-destructive">
            <LogOut className="h-5 w-5" />
            <span className="font-bold">
              {isSigningOut ? "Signing Out..." : "Sign Out"}
            </span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
}
