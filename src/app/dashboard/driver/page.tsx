import React from 'react';
import { MapPin, Phone, Truck, CheckCircle, Navigation, Clock, User, MessageSquare } from 'lucide-react';
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
    vendor: "Aqua Pure Factory"
  },
  {
    id: "ORD-1248",
    customer: "Sarah Smith",
    address: "45 River St, Spring Hills",
    distance: "3.5 km",
    items: "10x Sachet Water Bags",
    status: "In Transit",
    vendor: "Blue Wave Distro"
  }
];

export default function DriverDashboard() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-effect sticky top-0 z-40 border-b p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center text-white">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-headline">Driver Dashboard</h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                Online & Ready
              </div>
            </div>
          </div>
          <Badge variant="outline" className="bg-primary/5 text-primary">Shift: 4h 20m</Badge>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Deliveries */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold font-headline">Active Deliveries</h2>
            <Badge className="bg-accent">{activeDeliveries.length} Tasks</Badge>
          </div>

          <div className="grid gap-6">
            {activeDeliveries.map((delivery) => (
              <Card key={delivery.id} className="border-none shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                <div className={`h-1.5 w-full ${delivery.status === 'Picking Up' ? 'bg-yellow-400' : 'bg-primary'}`}></div>
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {delivery.id}
                        <Badge variant="outline" className="text-[10px] font-normal uppercase tracking-wider">
                          {delivery.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <User className="h-3 w-3" /> {delivery.customer}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary">{delivery.distance}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">Estimated Distance</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/30 p-4 rounded-xl space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 h-5 w-5 bg-white rounded flex items-center justify-center border text-muted-foreground">
                        <Navigation className="h-3 w-3" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground font-medium uppercase">Pickup Point</p>
                        <p className="text-sm font-bold">{delivery.vendor}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 border-l-2 border-dashed border-muted ml-2.5 pl-6 pb-1"></div>
                    <div className="flex items-start gap-3">
                      <div className="mt-1 h-5 w-5 bg-primary rounded flex items-center justify-center text-white">
                        <MapPin className="h-3 w-3" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground font-medium uppercase">Dropoff Point</p>
                        <p className="text-sm font-bold">{delivery.address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm py-2 px-1 border-b">
                    <span className="text-muted-foreground">Items to Deliver:</span>
                    <span className="font-semibold">{delivery.items}</span>
                  </div>
                </CardContent>
                <CardFooter className="grid grid-cols-3 gap-3">
                  <Button variant="outline" className="rounded-xl gap-2 h-11">
                    <Phone className="h-4 w-4" />
                    Call
                  </Button>
                  <Button variant="outline" className="rounded-xl gap-2 h-11">
                    <MessageSquare className="h-4 w-4" />
                    Chat
                  </Button>
                  <Button className="rounded-xl gap-2 h-11">
                    <CheckCircle className="h-4 w-4" />
                    Complete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar / Earnings */}
        <div className="space-y-6">
          <Card className="border-none shadow-md bg-primary text-white">
            <CardHeader>
              <CardTitle className="text-primary-foreground/80 text-sm font-medium">Daily Earnings</CardTitle>
              <div className="text-4xl font-bold font-headline">$142.50</div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center text-sm mb-4">
                <span>Completed Orders</span>
                <span className="font-bold">12</span>
              </div>
              <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                <div className="bg-white h-full w-[70%]"></div>
              </div>
              <p className="text-[10px] mt-2 text-white/70">70% of daily goal reached</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Recent History</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between py-4 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Order #123{i}</p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-green-600">+$8.50</div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}