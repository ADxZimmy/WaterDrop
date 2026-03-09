"use client";

import React from 'react';
import Link from 'next/link';
import { User, Mail, Phone, MapPin, Shield, Star, Award, Settings, LogOut, ChevronRight, Camera, Percent, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function DriverProfilePage() {
  return (
    <div className="p-4 md:p-8 space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <Avatar className="h-28 w-28 border-4 border-white shadow-xl">
            <AvatarImage src="https://picsum.photos/seed/driver1/200" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <Button size="icon" className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-primary text-white shadow-lg border-2 border-white">
            <Camera className="h-4 w-4" />
          </Button>
        </div>
        <h1 className="mt-4 text-2xl font-bold font-headline">John Driver</h1>
        <p className="text-muted-foreground text-sm">Active since May 2024</p>
        
        <div className="flex gap-4 mt-6">
          <div className="text-center">
            <div className="flex items-center gap-1 text-yellow-500 justify-center">
              <Star className="h-4 w-4 fill-current" />
              <span className="font-bold text-lg">4.9</span>
            </div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold mt-0.5">Rating</p>
          </div>
          <Separator orientation="vertical" className="h-10" />
          <div className="text-center">
            <span className="font-bold text-lg">1,245</span>
            <p className="text-[10px] text-muted-foreground uppercase font-bold mt-0.5">Trips</p>
          </div>
          <Separator orientation="vertical" className="h-10" />
          <div className="text-center">
            <span className="font-bold text-lg">Gold</span>
            <p className="text-[10px] text-muted-foreground uppercase font-bold mt-0.5">Badge</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="bg-primary/5 p-6 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Percent className="h-5 w-5 text-primary" /> Your Commission Rates
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/20 rounded-2xl">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Water Bags</p>
                <p className="text-2xl font-bold text-primary">15%</p>
                <p className="text-[10px] text-muted-foreground mt-1">Per individual bag</p>
              </div>
              <div className="p-4 bg-muted/20 rounded-2xl">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Water Packs</p>
                <p className="text-2xl font-bold text-primary">₦200</p>
                <p className="text-[10px] text-muted-foreground mt-1">Per case/box</p>
              </div>
            </div>
            <div className="flex gap-3 p-3 bg-muted/30 rounded-xl">
              <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                These rates are set by your vendor (Aqua Pure Factory) and apply to all your successful deliveries.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="bg-muted/30 p-6">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" /> Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground font-medium">Email Address</Label>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">john.driver@example.com</span>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground font-medium">Phone Number</Label>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">+1 (555) 000-1234</span>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground font-medium">Vehicle Plate</Label>
              <div className="flex items-center gap-3">
                <Award className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-mono font-bold">AQUA-2024</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <Link href="/dashboard/driver/profile/security" className="block">
          <Button variant="ghost" className="w-full justify-between h-14 rounded-2xl bg-white shadow-sm border border-transparent hover:border-primary/20">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <span className="font-bold">Security & Password</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Button>
        </Link>
        <Link href="/auth/login" className="block">
          <Button variant="ghost" className="w-full justify-between h-14 rounded-2xl bg-white shadow-sm border border-transparent hover:border-primary/20">
            <div className="flex items-center gap-3 text-destructive">
              <LogOut className="h-5 w-5" />
              <span className="font-bold">Sign Out</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
