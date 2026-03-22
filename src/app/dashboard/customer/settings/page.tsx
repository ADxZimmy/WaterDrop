
"use client";

import React from 'react';
import Link from 'next/link';
import { 
  User, 
  MapPin, 
  Bell, 
  Shield, 
  CreditCard, 
  ChevronRight, 
  ArrowLeft,
  HelpCircle,
  MessageSquare
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const settingLinks = [
  { name: "My Profile", icon: User, href: "/dashboard/customer/settings/profile", desc: "Update your name and phone, and review your email" },
  { name: "Delivery Addresses", icon: MapPin, href: "/dashboard/customer/settings/addresses", desc: "Manage where we deliver your water" },
  { name: "Payment Methods", icon: CreditCard, href: "/dashboard/customer/settings/payments", desc: "Add or remove cards and wallets" },
  { name: "Notifications", icon: Bell, href: "/dashboard/customer/settings/notifications", desc: "Control alerts and promotional news" },
  { name: "Account Security", icon: Shield, href: "/dashboard/customer/settings/security", desc: "Change password and two-factor auth" },
  { name: "Help & Support", icon: HelpCircle, href: "#", desc: "FAQs and contact our support team" },
];

export default function CustomerSettingsPage() {
  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/customer">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold font-headline">Account Settings</h1>
        </div>

        <div className="space-y-3">
          {settingLinks.map((item, i) => (
            <Link key={i} href={item.href}>
              <Card className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden active:scale-[0.98]">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-12 w-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm">{item.name}</h4>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <Card className="mt-8 border-none bg-primary/5 p-6 rounded-3xl border border-primary/10">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm">Need any assistance?</h4>
              <p className="text-xs text-muted-foreground">Our support team is here to help you 24/7.</p>
            </div>
            <Button variant="default" size="sm" className="rounded-xl h-9">Chat Now</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
