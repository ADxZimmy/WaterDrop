"use client";

import React from 'react';
import Link from 'next/link';
import { Bell, Mail, Smartphone, Monitor, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function NotificationsSettingsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/vendor/settings">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold font-headline text-foreground">Notifications</h1>
          <p className="text-muted-foreground">Control how and when you receive alerts from WaterDrop.</p>
        </div>
      </div>

      <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
        <CardHeader className="bg-muted/30 border-b p-6 text-foreground">
          <CardTitle className="text-lg">Email Notifications</CardTitle>
          <CardDescription>Updates sent directly to your inbox.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-bold text-foreground">New Order Alerts</Label>
              <p className="text-sm text-muted-foreground">Receive an email for every incoming order.</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-bold text-foreground">Inventory Reports</Label>
              <p className="text-sm text-muted-foreground">Weekly summary of stock levels and alerts.</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-bold text-foreground">Marketing Updates</Label>
              <p className="text-sm text-muted-foreground">Tips and news for growing your business.</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
        <CardHeader className="bg-muted/30 border-b p-6 text-foreground">
          <CardTitle className="text-lg">System Alerts</CardTitle>
          <CardDescription>Real-time notifications in the Vendor Hub.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-bold text-foreground">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Desktop and mobile push alerts.</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-bold text-foreground">Browser Sound</Label>
              <p className="text-sm text-muted-foreground">Play a chime when a new order arrives.</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
        <CardFooter className="p-6 border-t flex justify-end bg-muted/10">
          <Button className="rounded-xl px-8 h-11">Save Preferences</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
