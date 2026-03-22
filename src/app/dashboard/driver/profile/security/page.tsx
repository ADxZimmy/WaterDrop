"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Lock, Monitor, Shield, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DriverSecurityPage() {
  return (
    <div className="p-4 md:p-8 space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/driver/profile">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-headline">Security & Password</h1>
          <p className="text-muted-foreground text-sm">
            This page now shows only the security controls that are truly available today.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardHeader className="bg-muted/30 p-6 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Password Management
            </CardTitle>
            <CardDescription>
              Self-service password changes are not wired on this driver surface yet.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Use the platform authentication provider&apos;s password reset flow or ask an
            internal admin to help recover access. The old mock password form has been removed.
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardHeader className="bg-muted/30 p-6 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Authentication Features
            </CardTitle>
            <CardDescription>
              Per-driver toggles for 2FA and login alerts are not configurable in the app yet.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 text-sm text-muted-foreground">
            There is currently no stored driver preference for two-factor authentication or
            security notifications, so this page does not present fake toggles anymore.
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardHeader className="bg-muted/30 p-6 border-b">
            <CardTitle className="text-lg">Authorized Devices</CardTitle>
            <CardDescription>
              Device sessions are not exposed to drivers through the current backend.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-3 rounded-2xl bg-muted/20 p-4">
              <Smartphone className="h-5 w-5 mt-0.5 text-primary" />
              <p>Mobile-device session history is unavailable.</p>
            </div>
            <div className="flex items-start gap-3 rounded-2xl bg-muted/20 p-4">
              <Monitor className="h-5 w-5 mt-0.5 text-primary" />
              <p>Desktop and tablet session revocation is also not supported yet.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
