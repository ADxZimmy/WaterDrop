
"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Bell, Mail, Smartphone, MessageSquare } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export default function CustomerNotificationsSettingsPage() {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your notification preferences have been updated."
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
          <h1 className="text-2xl font-bold font-headline">Notifications</h1>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm rounded-[32px] overflow-hidden">
            <CardHeader className="bg-primary/5 p-8 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-primary" /> App Notifications
              </CardTitle>
              <CardDescription>Stay updated with real-time alerts on your device.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold">Order Status</Label>
                  <p className="text-xs text-muted-foreground">Alerts when your water is out for delivery</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold">Driver Messages</Label>
                  <p className="text-xs text-muted-foreground">Get notified when a driver chats with you</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold">Promotions</Label>
                  <p className="text-xs text-muted-foreground">Discounts and weekly special offers</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-[32px] overflow-hidden">
            <CardHeader className="bg-accent/5 p-8 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-5 w-5 text-accent" /> Email & SMS
              </CardTitle>
              <CardDescription>Receipts and long-form account updates.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold">Email Receipts</Label>
                  <p className="text-xs text-muted-foreground">Sent after every successful purchase</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold">SMS Verification</Label>
                  <p className="text-xs text-muted-foreground">Security codes for login and changes</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
            <CardFooter className="bg-muted/10 p-6 border-t flex justify-end">
              <Button onClick={handleSave} className="rounded-xl px-8 h-11 shadow-lg shadow-primary/20">Save Preferences</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
