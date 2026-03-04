"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, User, Phone, MapPin, Package, Truck, CheckCircle, Clock, MessageSquare, ExternalLink, ChevronDown, XCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

const drivers = [
  { id: 1, name: "John Driver", status: "Active" },
  { id: 2, name: "Sarah Delivery", status: "Busy" },
  { id: 4, name: "Dave Logistics", status: "Active" },
];

export default function OrderDetailPage() {
  const params = useParams();
  const [assignedDriver, setAssignedDriver] = useState<string | null>(null);
  const [status, setStatus] = useState<'Pending' | 'Accepted' | 'Declined' | 'Delivering'>('Accepted');

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 text-foreground">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold font-headline">Order {params.id || "#AQ-5521"}</h1>
          <p className="text-muted-foreground">Placed on Oct 24, 2024 at 14:20 PM</p>
        </div>
        <Badge 
          className={`ml-auto px-4 py-1 text-sm font-bold border-none ${
            status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
            status === 'Accepted' ? 'bg-blue-100 text-blue-700' :
            status === 'Delivering' ? 'bg-purple-100 text-purple-700' :
            'bg-red-100 text-red-700'
          }`}
        >
          {status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 p-6">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" /> Order Items
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {[
                  { name: "Premium Bottled Water (Box of 12)", qty: 2, price: 12.50, subtotal: 25.00 },
                  { name: "Bulk Dispenser (19L)", qty: 1, price: 20.00, subtotal: 20.00 },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center group">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-muted rounded-xl flex items-center justify-center text-primary font-bold">
                        {item.qty}x
                      </div>
                      <div>
                        <p className="font-bold text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} per unit</p>
                      </div>
                    </div>
                    <p className="font-bold text-sm">${item.subtotal.toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <Separator className="my-6" />
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">$45.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="font-medium">$0.00</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">$45.00</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/10 p-4 border-t flex gap-3">
              {status === 'Pending' ? (
                <>
                  <Button className="flex-1 h-12 rounded-xl gap-2 bg-green-600 hover:bg-green-700 border-none text-white" onClick={() => setStatus('Accepted')}>
                    <CheckCircle className="h-4 w-4" /> Accept Order
                  </Button>
                  <Button variant="outline" className="flex-1 h-12 rounded-xl gap-2 text-red-600 border-red-200 hover:bg-red-50" onClick={() => setStatus('Declined')}>
                    <XCircle className="h-4 w-4" /> Decline
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    className="flex-1 h-12 rounded-xl gap-2" 
                    disabled={status === 'Delivering' || status === 'Declined'}
                    onClick={() => setStatus('Delivering')}
                  >
                    <Truck className="h-4 w-4" /> Start Delivery
                  </Button>
                  <Button variant="outline" className="flex-1 h-12 rounded-xl gap-2">
                    <MessageSquare className="h-4 w-4" /> Message Customer
                  </Button>
                </>
              )}
            </CardFooter>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Order Timeline</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-muted-foreground/20">
                {[
                  { title: "Order Placed", time: "14:20 PM", desc: "Customer Alice Johnson placed the order", active: false },
                  { title: "Decision", time: status === 'Pending' ? "--:--" : "14:22 PM", desc: status === 'Declined' ? "Order was declined" : "Order accepted by Aqua Pure", active: status === 'Accepted' },
                  { title: "Delivering", time: status === 'Delivering' ? "14:25 PM" : "--:--", desc: "Driver is on the way to customer", active: status === 'Delivering' },
                ].map((event, i) => (
                  <div key={i} className="relative flex items-start gap-8 pl-10">
                    <div className={`absolute left-[-2px] h-4 w-4 rounded-full border-4 border-white shadow-sm ${event.active ? 'bg-primary ring-4 ring-primary/20' : 'bg-muted-foreground'}`} />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className={`font-bold text-sm ${event.active ? 'text-primary' : ''}`}>{event.title}</h4>
                        <span className="text-xs text-muted-foreground">{event.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{event.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-muted overflow-hidden">
                  <img src="https://picsum.photos/seed/alice/100" alt="Customer" className="h-full w-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold">Alice Johnson</h4>
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 text-[10px]">Premium Member</Badge>
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold">Contact</p>
                    <p className="text-sm">+1 (555) 000-8888</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold">Delivery Address</p>
                    <p className="text-sm">123 Ocean View Dr, Blue City, 90210</p>
                    <Button variant="link" size="sm" className="h-auto p-0 gap-1 text-primary text-xs mt-1">
                      <ExternalLink className="h-3 w-3" /> View on Map
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-primary/5 border border-primary/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" /> Logistics Allocation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="p-4 bg-white rounded-xl border border-border">
                {assignedDriver ? (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground uppercase font-bold text-center">Assigned Driver</p>
                    <div className="flex items-center gap-3 justify-center">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        {assignedDriver[0]}
                      </div>
                      <p className="font-bold text-sm">{assignedDriver}</p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full text-xs h-8" onClick={() => setAssignedDriver(null)}>Change Driver</Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-3">No driver assigned yet</p>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button className="w-full rounded-xl gap-2 h-11" disabled={status === 'Declined' || status === 'Pending'}>
                          Assign Driver <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>Available Drivers</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {drivers.map((driver) => (
                          <DropdownMenuItem key={driver.id} onClick={() => setAssignedDriver(driver.name)} className="flex items-center justify-between">
                            <span>{driver.name}</span>
                            <Badge variant="outline" className={driver.status === 'Active' ? 'text-green-600 bg-green-50 border-green-100' : 'text-blue-600 bg-blue-50 border-blue-100'}>
                              {driver.status}
                            </Badge>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Distance:</span>
                <span className="font-bold">1.2 km</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Est. Travel:</span>
                <span className="font-bold">8 mins</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
