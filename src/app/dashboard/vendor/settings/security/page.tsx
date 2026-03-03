"use client";

import React from 'react';
import { Shield, Key, Smartphone, Lock, UserCheck, Trash2, Monitor } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function SecuritySettingsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 text-foreground">
      <div>
        <h1 className="text-3xl font-bold font-headline">Security Center</h1>
        <p className="text-muted-foreground">Protect your store and manage account access.</p>
      </div>

      <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
        <CardHeader className="bg-muted/30 border-b p-6">
          <CardTitle className="text-lg">Authentication</CardTitle>
          <CardDescription>Manage how you sign in to your store.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-bold">Two-Factor Authentication (2FA)</Label>
              <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-bold">Login Alerts</Label>
              <p className="text-sm text-muted-foreground">Get notified when someone logs in from a new device.</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
        <CardHeader className="bg-muted/30 border-b p-6">
          <CardTitle className="text-lg">Authorized Devices</CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-4">
          {[
            { name: "iPhone 15 Pro", location: "Blue City, US", active: true },
            { name: "MacBook Pro M2", location: "Blue City, US", active: false },
          ].map((device, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-transparent">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  {device.name.includes('iPhone') ? <Smartphone className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
                </div>
                <div>
                  <p className="font-bold text-sm">{device.name}</p>
                  <p className="text-xs text-muted-foreground">{device.location} {device.active && "• Current"}</p>
                </div>
              </div>
              {!device.active && (
                <Button variant="ghost" size="sm" className="text-destructive font-bold">Revoke</Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="pt-8 flex justify-end">
        <Button variant="ghost" className="text-destructive gap-2 hover:bg-destructive/10 h-12 rounded-xl">
          <Trash2 className="h-5 w-5" /> Deactivate Store
        </Button>
      </div>
    </div>
  );
}