
"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, TrendingUp, Truck, Clock, MapPin, ChevronRight, Package } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const mockTrips = [
  { id: "ORD-9921", time: "14:20", amount: "$8.50", address: "123 Ocean View Dr", customer: "Alice Johnson", status: "Completed" },
  { id: "ORD-9918", time: "11:05", amount: "$12.00", address: "45 River St", customer: "Bob Wilson", status: "Completed" },
  { id: "ORD-9892", time: "09:45", amount: "$15.50", address: "88 Sky Lane", customer: "Clara Davis", status: "Completed" },
  { id: "ORD-9880", time: "08:15", amount: "$6.00", address: "10 Hill Top", customer: "Daniel Lee", status: "Completed" },
];

export default function DriverDailyActivityPage() {
  const params = useParams();
  const dateStr = params.date as string;

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/driver/earnings">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-headline">Activity Details</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" /> {dateStr.replace(/-/g, ' ')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm p-6 bg-primary text-white rounded-3xl">
          <p className="text-xs uppercase font-bold tracking-widest opacity-80">Total Earned</p>
          <h3 className="text-3xl font-bold mt-2">$42.00</h3>
        </Card>
        <Card className="border-none shadow-sm p-6 bg-white rounded-3xl">
          <p className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Trips Done</p>
          <h3 className="text-3xl font-bold mt-2">4</h3>
        </Card>
        <Card className="border-none shadow-sm p-6 bg-white rounded-3xl">
          <p className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Active Hours</p>
          <h3 className="text-3xl font-bold mt-2">6.2h</h3>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-lg px-2">Trip Log</h3>
        <div className="space-y-3">
          {mockTrips.map((trip) => (
            <Link key={trip.id} href={`/dashboard/driver/orders/${trip.id}`}>
              <Card className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden bg-white mb-3">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                        <Package className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">{trip.id}</h4>
                        <p className="text-xs text-muted-foreground">{trip.customer}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-primary">{trip.amount}</p>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px]">
                        {trip.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-muted/50">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {trip.time}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {trip.address}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 gap-1 text-primary group-hover:bg-primary/5">
                      Order Details <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
