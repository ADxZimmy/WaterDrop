
"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, User, Star, Award, MapPin, Truck, History, Wallet, CheckCircle2, Clock, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function VendorDriverProfilePage() {
  const params = useParams();

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold font-headline">Driver Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 border-none shadow-sm h-fit">
          <CardContent className="p-8 flex flex-col items-center text-center">
            <Avatar className="h-32 w-32 border-4 border-white shadow-xl mb-6">
              <AvatarImage src={`https://picsum.photos/seed/${params.id}/200`} />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold">John Driver</h2>
            <p className="text-muted-foreground text-sm mt-1">Hired May 12, 2024</p>
            
            <Badge className="mt-4 bg-green-100 text-green-700 hover:bg-green-100 border-none px-4">
              Active Now
            </Badge>

            <div className="grid grid-cols-2 w-full gap-4 mt-8">
              <div className="p-3 bg-muted/30 rounded-2xl text-center">
                <Star className="h-4 w-4 text-yellow-500 mx-auto mb-1 fill-current" />
                <p className="text-lg font-bold">4.9</p>
                <p className="text-[10px] uppercase text-muted-foreground font-bold">Rating</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-2xl text-center">
                <Truck className="h-4 w-4 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold">1,245</p>
                <p className="text-[10px] uppercase text-muted-foreground font-bold">Trips</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 p-6">
              <CardTitle className="text-lg">Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Order Acceptance Rate</span>
                  <span className="font-bold">98.5%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[98.5%]"></div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">On-Time Delivery</span>
                  <span className="font-bold">92.0%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-accent w-[92%]"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Recent Deliveries</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {[
                  { id: "ORD-9921", time: "2h ago", amount: "$8.50", status: "Success" },
                  { id: "ORD-9918", time: "5h ago", amount: "$12.00", status: "Success" },
                  { id: "ORD-9882", time: "Yesterday", amount: "$6.50", status: "Success" },
                ].map((trip, i) => (
                  <div key={i} className="flex items-center justify-between p-4 px-6 hover:bg-muted/10">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-muted rounded-xl flex items-center justify-center text-primary">
                        <History className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{trip.id}</p>
                        <p className="text-xs text-muted-foreground">{trip.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{trip.amount}</p>
                      <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">
                        {trip.status}
                      </Badge>
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
