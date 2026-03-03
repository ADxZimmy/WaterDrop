
import React from 'react';
import { MapPin, Phone, Truck, CheckCircle, Navigation, Clock, User, MessageSquare, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const activeDeliveries = [
  {
    id: "ORD-1245",
    customer: "John Doe",
    address: "123 Ocean View Dr, Blue City",
    distance: "1.2 km",
    items: "5x PureLife Bottled (Pack)",
    status: "Picking Up",
    vendor: "Aqua Pure Factory",
    price: "$8.50"
  },
  {
    id: "ORD-1248",
    customer: "Sarah Smith",
    address: "45 River St, Spring Hills",
    distance: "3.5 km",
    items: "10x Sachet Water Bags",
    status: "In Transit",
    vendor: "Blue Wave Distro",
    price: "$12.00"
  }
];

export default function DriverDashboard() {
  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-headline">Active Deliveries</h2>
          <p className="text-sm text-muted-foreground">You have {activeDeliveries.length} tasks assigned</p>
        </div>
        <Badge className="bg-primary px-3 py-1">2 Active</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeDeliveries.map((delivery) => (
          <Card key={delivery.id} className="border-none shadow-lg overflow-hidden relative">
            <div className={`absolute top-0 left-0 w-1 h-full ${delivery.status === 'Picking Up' ? 'bg-yellow-400' : 'bg-primary'}`}></div>
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{delivery.id}</CardTitle>
                    <Badge variant="outline" className="text-[10px]">{delivery.status}</Badge>
                  </div>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <User className="h-3 w-3" /> {delivery.customer}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">{delivery.price}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Estimated Earning</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-5 w-5 bg-muted rounded flex items-center justify-center text-muted-foreground">
                    <ChevronRight className="h-3 w-3" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Pickup</p>
                    <p className="text-sm font-bold">{delivery.vendor}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-5 w-5 bg-primary rounded flex items-center justify-center text-white">
                    <MapPin className="h-3 w-3" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Dropoff</p>
                    <p className="text-sm font-bold">{delivery.address}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs py-3 border-t">
                <span className="text-muted-foreground">Items:</span>
                <span className="font-semibold">{delivery.items}</span>
              </div>
            </CardContent>
            <CardFooter className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="rounded-xl h-11 gap-2">
                <Navigation className="h-4 w-4" />
                Navigate
              </Button>
              <Button className="rounded-xl h-11 gap-2">
                <CheckCircle className="h-4 w-4" />
                Complete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card className="border-none bg-primary text-white p-6 rounded-2xl shadow-xl shadow-primary/20">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-primary-foreground/70 text-sm font-medium">Daily Earnings</p>
            <h3 className="text-3xl font-bold font-headline mt-1">$142.50</h3>
          </div>
          <div className="text-right">
            <p className="text-primary-foreground/70 text-sm font-medium">Total Trips</p>
            <h3 className="text-3xl font-bold font-headline mt-1">12</h3>
          </div>
        </div>
      </Card>
    </div>
  );
}
