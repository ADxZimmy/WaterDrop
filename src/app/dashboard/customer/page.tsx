
"use client";

import React from 'react';
import Link from 'next/link';
import { 
  User, 
  MapPin, 
  ShoppingBag, 
  Settings, 
  ChevronRight, 
  CreditCard, 
  LogOut, 
  Bell, 
  Heart,
  Droplets
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function CustomerDashboard() {
  const profile = {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 000-1234",
    memberSince: "Oct 2024",
    ordersCount: 42,
    loyaltyPoints: 1250
  };

  const menuItems = [
    { name: "My Orders", icon: ShoppingBag, href: "/dashboard/customer/orders", desc: "Track, return, or buy items again" },
    { name: "Saved Addresses", icon: MapPin, href: "/dashboard/customer/settings/addresses", desc: "Manage your delivery locations" },
    { name: "Payment Methods", icon: CreditCard, href: "/dashboard/customer/settings/payments", desc: "Manage your cards and wallet" },
    { name: "Notifications", icon: Bell, href: "/dashboard/customer/settings/notifications", desc: "Manage alerts and news", badge: "2" },
    { name: "Settings", icon: Settings, href: "/dashboard/customer/settings", desc: "Privacy, security, and account preferences" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-8 pb-20 rounded-b-[40px] shadow-lg">
        <div className="max-w-2xl mx-auto flex justify-between items-center mb-8">
          <Link href="/?loggedin=true" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Droplets className="h-6 w-6" />
            <span className="font-bold text-xl tracking-tight font-headline">WaterDrop</span>
          </Link>
          <Link href="/dashboard/customer/settings/notifications">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
              <Bell className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        <div className="max-w-2xl mx-auto flex items-center gap-6">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-white shadow-xl">
              <AvatarImage src="https://picsum.photos/seed/user-44/200" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-accent text-white border-none px-3">
              Gold Member
            </Badge>
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold font-headline">{profile.name}</h1>
            <p className="text-primary-foreground/80 text-sm flex items-center gap-2">
              {profile.email} • Member since {profile.memberSince}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 -mt-12 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
            <CardContent className="p-6 text-center space-y-1">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Orders</p>
              <p className="text-2xl font-bold text-primary">{profile.ordersCount}</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
            <CardContent className="p-6 text-center space-y-1">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Drop Points</p>
              <p className="text-2xl font-bold text-accent">{profile.loyaltyPoints}</p>
            </CardContent>
          </Card>
        </div>

        {/* Menu Grid */}
        <div className="space-y-3">
          {menuItems.map((item, i) => (
            <Link key={i} href={item.href}>
              <Card className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden active:scale-[0.98]">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-12 w-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm">{item.name}</h4>
                      {item.badge && (
                        <Badge className="h-5 w-5 p-0 flex items-center justify-center rounded-full bg-destructive border-none text-[10px]">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Logout */}
        <Link href="/auth/login" className="block pt-4">
          <Button variant="ghost" className="w-full h-14 rounded-2xl text-destructive hover:text-destructive hover:bg-destructive/5 gap-3 font-bold">
            <LogOut className="h-5 w-5" />
            Sign Out
          </Button>
        </Link>

        {/* Footer Info */}
        <div className="text-center space-y-1 py-6">
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">WaterDrop v1.0.4</p>
          <p className="text-[10px] text-muted-foreground">© 2024 WaterDrop Marketplace</p>
        </div>
      </div>
    </div>
  );
}
