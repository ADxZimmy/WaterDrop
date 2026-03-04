
"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Smartphone, Monitor, CheckCircle2, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export default function DriverSecurityPage() {
  const { toast } = useToast();

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Password Updated",
      description: "Your security credentials have been changed successfully."
    });
  };

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
          <p className="text-muted-foreground text-sm">Manage your login credentials and account protection.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Change Password Card */}
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardHeader className="bg-muted/30 p-6 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" /> Update Password
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current">Current Password</Label>
                <Input id="current" type="password" placeholder="••••••••" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new">New Password</Label>
                  <Input id="new" type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm New Password</Label>
                  <Input id="confirm" type="password" placeholder="••••••••" />
                </div>
              </div>
              <Button type="submit" className="w-full sm:w-auto px-8 rounded-xl h-11 shadow-lg shadow-primary/20 mt-2">
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 2FA Card */}
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardHeader className="bg-muted/30 p-6 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold">Two-Factor Authentication (2FA)</Label>
                <p className="text-xs text-muted-foreground">Secure your account with SMS or App codes</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold">Login Notifications</Label>
                <p className="text-xs text-muted-foreground">Get an alert when a new device logs in</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Sessions Card */}
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardHeader className="bg-muted/30 p-6 border-b">
            <CardTitle className="text-lg">Authorized Devices</CardTitle>
            <CardDescription>Devices that are currently logged into your account.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {[
              { device: "iPhone 15 Pro", location: "Blue City, US", current: true },
              { device: "Android Tablet", location: "Spring Hills, US", current: false },
            ].map((session, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    {session.device.includes('iPhone') ? <Smartphone className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{session.device}</p>
                    <p className="text-xs text-muted-foreground">{session.location} {session.current && "• Current"}</p>
                  </div>
                </div>
                {!session.current && (
                  <Button variant="ghost" size="sm" className="text-destructive font-bold hover:bg-destructive/5">Logout</Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
