"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShoppingBag, Clock, ChevronRight, Package, CheckCircle2, Truck } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const orders = [
  { 
    id: "AQ-5521", 
    vendor: "Aqua Pure Factory", 
    date: "Oct 24, 2024", 
    total: 4500.00, 
    status: "In Transit", 
    items: "5x Premium Bottled, 1x Bulk Dispenser" 
  },
  { 
    id: "AQ-5510", 
    vendor: "Blue Wave Distro", 
    date: "Oct 22, 2024", 
    total: 1250.00, 
    status: "Delivered", 
    items: "2x Sachet Water Bags" 
  },
  { 
    id: "AQ-5488", 
    vendor: "Crystal Spring", 
    date: "Oct 18, 2024", 
    total: 2000.00, 
    status: "Delivered", 
    items: "1x 19L Dispenser" 
  },
];

export default function MyOrdersPage() {
  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/?loggedin=true">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold font-headline">My Orders</h1>
        </div>

        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} href={order.status === 'In Transit' ? '/dashboard/customer/track-order' : '#'}>
              <Card className={`border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden group mb-4 ${order.status === 'In Transit' ? 'bg-primary/5 border border-primary/20' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${order.status === 'In Transit' ? 'bg-primary text-white shadow-lg shadow-primary/20 animate-pulse' : 'bg-muted text-muted-foreground'}`}>
                        {order.status === 'In Transit' ? <Truck className="h-6 w-6" /> : <Package className="h-6 w-6" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">{order.vendor}</h4>
                        <p className="text-xs text-muted-foreground">{order.date} • {order.id}</p>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={order.status === 'In Transit' ? 'bg-primary text-white border-none' : 'bg-green-50 text-green-700 border-green-200'}
                    >
                      {order.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-muted/50">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground line-clamp-1">{order.items}</p>
                      <p className="font-bold text-primary">₦{order.total.toLocaleString()}</p>
                    </div>
                    {order.status === 'In Transit' ? (
                      <Button variant="default" size="sm" className="h-8 gap-1 rounded-lg">
                        Track Live <ChevronRight className="h-3 w-3" />
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" className="h-8 gap-1 text-muted-foreground group-hover:bg-muted">
                        Details <ChevronRight className="h-3 w-3" />
                      </Button>
                    )}
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