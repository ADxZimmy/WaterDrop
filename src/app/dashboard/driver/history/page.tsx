
"use client";

import React from 'react';
import Link from 'next/link';
import { Search, Filter, History, MapPin, Calendar, Clock, ChevronRight } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const history = [
  { id: "ORD-9921", date: "Oct 24, 2024", time: "14:20", status: "Completed", amount: "$8.50", address: "123 Ocean View Dr", items: "5x PureLife" },
  { id: "ORD-9918", date: "Oct 24, 2024", time: "11:05", status: "Completed", amount: "$12.00", address: "45 River St", items: "10x Sachet Packs" },
  { id: "ORD-9882", date: "Oct 23, 2024", time: "18:45", status: "Completed", amount: "$6.50", address: "88 Sky Lane", items: "2x 19L Dispenser" },
  { id: "ORD-9851", date: "Oct 23, 2024", time: "15:30", status: "Cancelled", amount: "$0.00", address: "22 Park Ave", items: "1x Bulk Pack" },
  { id: "ORD-9840", date: "Oct 23, 2024", time: "09:15", status: "Completed", amount: "$10.00", address: "10 Hill Top", items: "8x 750ml Bottled" },
];

export default function DriverHistoryPage() {
  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold font-headline">Trip History</h1>
        <p className="text-muted-foreground">Review your past deliveries and activities.</p>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search orders..." className="pl-10 h-11 rounded-xl" />
        </div>
        <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {history.map((trip) => (
          <Link key={trip.id} href={`/dashboard/driver/orders/${trip.id}`}>
            <Card className="border-none shadow-sm overflow-hidden hover:shadow-md transition-shadow group mb-4">
              <CardContent className="p-4 sm:p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${trip.status === 'Completed' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      <History className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{trip.id}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-medium mt-0.5">
                        <Calendar className="h-3 w-3" /> {trip.date}
                        <span className="h-1 w-1 bg-muted-foreground/30 rounded-full"></span>
                        <Clock className="h-3 w-3" /> {trip.time}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg ${trip.status === 'Completed' ? 'text-primary' : 'text-muted-foreground'}`}>{trip.amount}</p>
                    <Badge variant="outline" className={`text-[10px] mt-1 ${trip.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                      {trip.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-muted/50">
                  <div className="flex items-start gap-2 max-w-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground line-clamp-1">{trip.address}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 gap-1 text-primary group-hover:bg-primary/5">
                    Details <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
