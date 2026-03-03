
"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Truck, CheckCircle2, Phone, Clock, MessageSquare, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function TrackOrderPage() {
  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/customer/orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold font-headline">Track Order</h1>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-lg overflow-hidden bg-primary text-white">
            <CardContent className="p-8">
              <div className="flex justify-between items-start">
                <div>
                  <Badge className="bg-white/20 text-white border-none mb-4">Arriving in 12 mins</Badge>
                  <h2 className="text-3xl font-bold font-headline">Out for Delivery</h2>
                  <p className="text-primary-foreground/80 mt-1">Order #AQ-5521</p>
                </div>
                <Truck className="h-16 w-16 text-white/20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm p-6 space-y-8">
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-2.5 before:h-full before:w-0.5 before:bg-muted">
              {[
                { title: "Order Confirmed", time: "14:20 PM", done: true },
                { title: "Order Prepared", time: "14:25 PM", done: true },
                { title: "Out for Delivery", time: "14:32 PM", done: true, active: true },
                { title: "Arrived", time: "Est. 14:45 PM", done: false },
              ].map((step, i) => (
                <div key={i} className="relative flex items-center gap-6 pl-8">
                  <div className={`absolute left-0 h-5 w-5 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${step.done ? 'bg-primary' : 'bg-muted'}`}>
                    {step.done && <CheckCircle2 className="h-3 w-3 text-white" />}
                  </div>
                  <div className="flex-1 flex justify-between items-center">
                    <div>
                      <h4 className={`font-bold text-sm ${step.active ? 'text-primary' : ''}`}>{step.title}</h4>
                      <p className="text-xs text-muted-foreground">{step.time}</p>
                    </div>
                    {step.active && (
                      <Badge className="bg-primary/10 text-primary border-none text-[10px]">CURRENT</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Delivery Driver</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-muted overflow-hidden">
                    <img src="https://picsum.photos/seed/driver/200" alt="Driver" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold">John Driver</h4>
                    <div className="flex items-center gap-1 text-yellow-500 text-xs">
                      <Clock className="h-3 w-3" /> 4.9 Rating
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="rounded-xl h-12 w-12 text-primary border-primary/20">
                    <Phone className="h-5 w-5" />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-xl h-12 w-12 text-primary border-primary/20">
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm p-6">
            <h4 className="font-bold mb-4">Delivery Address</h4>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="font-medium text-sm">Home</p>
                <p className="text-sm text-muted-foreground leading-relaxed">123 Ocean View Dr, Blue City, 90210</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
