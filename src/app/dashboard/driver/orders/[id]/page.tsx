"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Package, 
  Clock, 
  MessageSquare, 
  ExternalLink, 
  CheckCircle2, 
  User,
  Navigation,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function DriverOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  // Mock data for the detailed view
  const orderDetails = {
    id: orderId,
    status: "Completed",
    date: "Oct 24, 2024",
    time: "14:20 PM",
    amount: "$8.50",
    customer: {
      name: "Alice Johnson",
      phone: "+1 (555) 000-8888",
      address: "123 Ocean View Dr, Blue City, 90210",
      image: "https://picsum.photos/seed/alice/100"
    },
    vendor: {
      name: "Aqua Pure Factory",
      address: "Industrial Estate, Way 4"
    },
    items: [
      { name: "Premium Bottled Water (Box of 12)", qty: 2, price: 12.50 },
      { name: "Bulk Dispenser (19L)", qty: 1, price: 20.00 }
    ],
    timeline: [
      { status: "Order Placed", time: "14:05 PM", description: "Customer placed order" },
      { status: "Accepted", time: "14:08 PM", description: "Vendor confirmed order" },
      { status: "Picked Up", time: "14:12 PM", description: "You picked up from vendor" },
      { status: "Delivered", time: "14:20 PM", description: "Successfully delivered" }
    ]
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold font-headline">Order Details</h1>
          <p className="text-muted-foreground text-sm flex items-center gap-2">
            <Calendar className="h-3 w-3" /> {orderDetails.date} • {orderId}
          </p>
        </div>
        <Badge className="ml-auto bg-green-100 text-green-700 hover:bg-green-100 border-none px-4">
          {orderDetails.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Earnings Card */}
          <Card className="border-none shadow-sm bg-primary text-white overflow-hidden rounded-3xl">
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-xs uppercase font-bold tracking-widest opacity-80">Your Earnings</p>
                <h3 className="text-3xl font-bold mt-1">{orderDetails.amount}</h3>
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <DollarSign className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          {/* Delivery Locations */}
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-muted/30 border-b p-6">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" /> Delivery Route
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-8 w-8 bg-muted rounded-lg flex items-center justify-center text-muted-foreground shrink-0 mt-1">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground"></div>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Pickup From</p>
                  <p className="font-bold">{orderDetails.vendor.name}</p>
                  <p className="text-sm text-muted-foreground">{orderDetails.vendor.address}</p>
                </div>
              </div>
              
              <div className="ml-4 h-8 border-l-2 border-dashed border-muted-foreground/30"></div>

              <div className="flex items-start gap-4">
                <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0 mt-1">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-primary uppercase tracking-widest">Dropoff To</p>
                  <p className="font-bold">{orderDetails.customer.address}</p>
                  <Button variant="link" size="sm" className="h-auto p-0 gap-1 text-primary text-xs mt-1">
                    <ExternalLink className="h-3 w-3" /> View on Map
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-muted/30 border-b p-6">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" /> Manifest
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {orderDetails.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs font-bold">
                        {item.qty}x
                      </div>
                      <p className="text-sm font-medium">{item.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Customer Profile */}
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <CardContent className="p-6 text-center space-y-4">
              <Avatar className="h-20 w-20 mx-auto border-2 border-primary/10">
                <AvatarImage src={orderDetails.customer.image} />
                <AvatarFallback>C</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-bold">{orderDetails.customer.name}</h4>
                <p className="text-xs text-muted-foreground">Customer</p>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="p-6 border-b">
              <CardTitle className="text-sm uppercase font-bold tracking-widest text-muted-foreground">History</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative space-y-6 before:absolute before:inset-0 before:ml-2.5 before:h-full before:w-0.5 before:bg-muted">
                {orderDetails.timeline.map((event, i) => (
                  <div key={i} className="relative flex items-start gap-6 pl-8">
                    <div className={`absolute left-0 h-5 w-5 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${i === orderDetails.timeline.length - 1 ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                      {i === orderDetails.timeline.length - 1 && <CheckCircle2 className="h-3 w-3 text-white" />}
                    </div>
                    <div className="flex-1 flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-bold">{event.status}</h4>
                        <p className="text-[10px] text-muted-foreground">{event.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}