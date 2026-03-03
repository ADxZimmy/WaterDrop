
"use client";

import React from 'react';
import { Store, User, Shield, Bell, CreditCard, HelpCircle, MapPin, Clock, Camera } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function VendorSettingsPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10">
      <div>
        <h1 className="text-3xl font-bold font-headline">Store Settings</h1>
        <p className="text-muted-foreground">Configure your business profile and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="md:col-span-1">
          <nav className="space-y-1">
            {[
              { name: "Store Profile", icon: Store, active: true },
              { name: "Account", icon: User },
              { name: "Notifications", icon: Bell },
              { name: "Billing", icon: CreditCard },
              { name: "Security", icon: Shield },
              { name: "Help", icon: HelpCircle },
            ].map((item, i) => (
              <Button key={i} variant="ghost" className={`w-full justify-start gap-3 rounded-xl ${item.active ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}>
                <item.icon className="h-5 w-5" />
                {item.name}
              </Button>
            ))}
          </nav>
        </aside>

        <div className="md:col-span-3 space-y-8">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-muted/30 border-b p-6">
              <CardTitle className="text-lg">Public Storefront</CardTitle>
              <CardDescription>This information will be visible to customers.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 rounded-2xl">
                    <AvatarImage src="https://picsum.photos/seed/vendor1/200" />
                    <AvatarFallback>AP</AvatarFallback>
                  </Avatar>
                  <Button size="icon" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full border-2 border-white">
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold">Store Logo</h3>
                  <p className="text-xs text-muted-foreground">JPG, GIF or PNG. Max size of 2MB.</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Replace</Button>
                    <Button variant="ghost" size="sm" className="text-destructive">Remove</Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input id="storeName" defaultValue="Aqua Pure Factory" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Main Category</Label>
                  <Select defaultValue="bottled">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bottled">Bottled Water</SelectItem>
                      <SelectItem value="bulk">Bulk Supply</SelectItem>
                      <SelectItem value="bags">Sachet Water</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="bio">Store Bio</Label>
                  <Textarea id="bio" placeholder="Tell customers about your water source..." className="min-h-[100px]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-muted/30 border-b p-6">
              <CardTitle className="text-lg">Operational Status</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-bold">Accepting New Orders</Label>
                  <p className="text-sm text-muted-foreground">When off, your store will appear closed to customers.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-bold">Automated Dispatch</Label>
                  <p className="text-sm text-muted-foreground">Automatically assign orders to the nearest available driver.</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline" className="rounded-xl px-8 h-12">Cancel</Button>
            <Button className="rounded-xl px-8 h-12">Save Changes</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
