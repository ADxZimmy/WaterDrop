
"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Smartphone, Monitor, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export default function CustomerSecuritySettingsPage() {
  const { toast } = useToast();

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Password Updated",
      description: "Your account security has been strengthened."
    });
  };

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/customer/settings">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold font-headline">Security</h1>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm rounded-[32px] overflow-hidden">
            <CardHeader className="bg-primary/5 p-8 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" /> Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current">Current Password</Label>
                  <Input id="current" type="password" placeholder="••••••••" className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new">New Password</Label>
                  <Input id="new" type="password" placeholder="••••••••" className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm New Password</Label>
                  <Input id="confirm" type="password" placeholder="••••••••" className="h-12 rounded-xl" />
                </div>
                <Button type="submit" className="w-full h-12 rounded-xl mt-2 font-bold">Update Password</Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-[32px] overflow-hidden">
            <CardHeader className="bg-muted/30 p-8 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" /> Extra Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold">Two-Factor Auth (2FA)</Label>
                  <p className="text-xs text-muted-foreground">Verify login attempts with a code</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold">Login Notifications</Label>
                  <p className="text-xs text-muted-foreground">Alert you when a new device logs in</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
            <CardHeader className="bg-muted/30 p-8 border-b">
              <CardTitle className="text-lg">Logged-in Devices</CardTitle>
              <CardDescription>Manage active sessions on other browsers or phones.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              {[
                { device: "iPhone 15 Pro", location: "Blue City, US", current: true },
                { device: "Safari on MacBook", location: "Blue City, US", current: false },
              ].map((session, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                      {session.device.includes('iPhone') ? <Smartphone className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">{session.device}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{session.location} {session.current && "• Current Session"}</p>
                    </div>
                  </div>
                  {!session.current && (
                    <Button variant="ghost" size="sm" className="text-destructive font-bold hover:bg-destructive/5 h-8">Logout</Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
