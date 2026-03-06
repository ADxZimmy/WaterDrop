
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MapPin, 
  Phone, 
  Truck, 
  CheckCircle, 
  Navigation, 
  Clock, 
  User, 
  MessageSquare, 
  ChevronRight, 
  Building2, 
  Award, 
  Link as LinkIcon, 
  ShieldAlert, 
  CheckCircle2, 
  ChevronLeft,
  Droplets,
  AlertTriangle,
  Package,
  Edit2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const initialDeliveries = [
  {
    id: "ORD-1245",
    customer: "John Doe",
    address: "123 Ocean View Dr, Blue City",
    distance: "1.2 km",
    items: "5x PureLife Bottled (Pack)",
    quantity: 5,
    status: "Accepted",
    vendor: "Aqua Pure Factory",
    price: "₦850.00"
  },
  {
    id: "ORD-1248",
    customer: "Sarah Smith",
    address: "45 River St, Spring Hills",
    distance: "3.5 km",
    items: "10x Sachet Water Bags",
    quantity: 10,
    status: "Accepted",
    vendor: "Blue Wave Distro",
    price: "₦1,200.00"
  }
];

export default function DriverDashboard() {
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [deliveries, setDeliveries] = useState(initialDeliveries);
  const [loadedBags, setLoadedBags] = useState(20); // Default for demo
  const { toast } = useToast();

  useEffect(() => {
    // Load inventory from localStorage
    const savedInventory = localStorage.getItem('driver_loaded_bags');
    if (savedInventory) {
      setLoadedBags(parseInt(savedInventory));
    }

    // Check for dev bypass
    const isDriverSetup = localStorage.getItem('driver_setup_complete') === 'true';
    if (isDriverSetup) {
      setIsSetupComplete(true);
    } else {
      const timer = setTimeout(() => setShowSetup(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < 2) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmitSetup = () => {
    localStorage.setItem('driver_setup_complete', 'true');
    setIsSetupComplete(true);
    setShowSetup(false);
    toast({
      title: "Account Ready!",
      description: "You are now linked to your vendor and ready to receive orders."
    });
  };

  const handleDevBypass = () => {
    localStorage.setItem('driver_setup_complete', 'true');
    setIsSetupComplete(true);
    setShowSetup(false);
    window.location.reload();
  };

  const handleStartDelivery = (id: string) => {
    const hasActiveDelivery = deliveries.some(d => d.status === 'Delivering');
    
    if (hasActiveDelivery) {
      toast({
        title: "Active Delivery in Progress",
        description: "You can only have one delivery in transit at a time. Please complete your current task.",
        variant: "destructive"
      });
      return;
    }

    setDeliveries(prev => prev.map(delivery => 
      delivery.id === id ? { ...delivery, status: 'Delivering' } : delivery
    ));
    toast({
      title: "Delivery Started",
      description: `Order ${id} is now in transit.`
    });
  };

  const totalRequired = deliveries
    .filter(d => d.status !== 'Completed')
    .reduce((acc, curr) => acc + curr.quantity, 0);
  
  const isSufficient = loadedBags >= totalRequired;

  if (!isSetupComplete) {
    return (
      <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold font-headline">Driver Dashboard</h2>
            <p className="text-sm text-muted-foreground">Setup required to start delivering</p>
          </div>
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending Setup</Badge>
        </div>

        <Card className="border-dashed border-2 bg-muted/5 flex flex-col items-center justify-center p-12 text-center min-h-[400px] rounded-[32px]">
          <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
            <Truck className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Complete Your Driver Profile</h2>
          <p className="text-muted-foreground mb-8 max-md">Link your account to a registered WaterDrop vendor and provide your vehicle details to start accepting orders.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={() => setShowSetup(true)} size="lg" className="rounded-xl px-8 shadow-lg shadow-primary/20">
              Start Setup Now
            </Button>
            <Button variant="outline" size="lg" className="rounded-xl px-8 border-orange-200 text-orange-600 bg-orange-50 hover:bg-orange-100" onClick={handleDevBypass}>
              [DEV] Bypass Setup
            </Button>
          </div>
        </Card>

        <Dialog open={showSetup} onOpenChange={setShowSetup}>
          <DialogContent className="sm:max-w-md p-0 border-none overflow-hidden rounded-[32px] shadow-2xl">
            <div className="bg-primary p-8 text-white">
              <div className="flex items-center gap-3 mb-4">
                <Truck className="h-8 w-8" />
                <span className="font-bold text-2xl tracking-tight font-headline">Driver Setup</span>
              </div>
              <DialogTitle className="text-2xl font-bold">Link Your Account</DialogTitle>
              <DialogDescription className="text-primary-foreground/80 mt-2">
                Connect with your water supplier and verify your vehicle.
              </DialogDescription>
              <div className="flex gap-2 mt-6">
                {[1, 2].map((s) => (
                  <div key={s} className={cn("h-1.5 rounded-full flex-1 transition-all", s <= currentStep ? "bg-white" : "bg-white/20")} />
                ))}
              </div>
            </div>

            <div className="p-8 bg-white">
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <div className="flex items-center gap-2 text-primary font-bold text-lg mb-2">
                    <Building2 className="h-5 w-5" /> 1. Vendor Connection
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="vendorId">Vendor ID</Label>
                      <div className="relative">
                        <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input id="vendorId" placeholder="e.g. VND-8821-X" className="pl-10 h-12 rounded-xl border-2" />
                      </div>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <ShieldAlert className="h-3 w-3" /> Get this ID from your water factory manager.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <div className="flex items-center gap-2 text-primary font-bold text-lg mb-2">
                    <Award className="h-5 w-5" /> 2. Vehicle Details
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="vehicleType">Vehicle Type</Label>
                      <Select>
                        <SelectTrigger className="h-12 rounded-xl">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bike">Motorcycle / Scooter</SelectItem>
                          <SelectItem value="van">Delivery Van</SelectItem>
                          <SelectItem value="truck">Light Truck</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="license">License Plate Number</Label>
                      <Input id="license" placeholder="e.g. AQUA-2024" className="h-12 rounded-xl border-2 uppercase font-mono" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 border-t flex justify-between bg-muted/10">
              <Button variant="ghost" onClick={handleBack} disabled={currentStep === 1} className="rounded-xl h-12">
                <ChevronLeft className="h-4 w-4 mr-2" /> Back
              </Button>
              {currentStep === 2 ? (
                <Button onClick={handleSubmitSetup} className="rounded-xl h-12 px-10 shadow-lg shadow-primary/20">
                  Complete & Start <CheckCircle2 className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleNext} className="rounded-xl h-12 px-10">
                  Continue <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  const isAnyDeliveryActive = deliveries.some(d => d.status === 'Delivering');

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
        <Card className="border-none shadow-sm p-6 bg-white rounded-3xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className={cn(
                "h-14 w-14 rounded-2xl flex items-center justify-center transition-colors",
                isSufficient ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
              )}>
                {isSufficient ? <CheckCircle2 className="h-8 w-8" /> : <AlertTriangle className="h-8 w-8" />}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Inventory Level</p>
                <h3 className="text-2xl font-bold mt-1">{loadedBags} Units Loaded</h3>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className={cn(
                "rounded-full px-3 border-none",
                isSufficient ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
              )}>
                {isSufficient ? "Enough for delivery" : "Stock Low"}
              </Badge>
              <Link href="/dashboard/driver/inventory">
                <Button variant="outline" size="sm" className="h-8 text-[10px] uppercase font-bold tracking-tight rounded-lg gap-1 border-primary/20 text-primary hover:bg-primary/5 transition-all">
                  <Edit2 className="h-3 w-3" /> Update
                </Button>
              </Link>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Required for pending tasks:</span>
            <span className={cn("font-bold", isSufficient ? "text-slate-900" : "text-rose-600")}>
              {totalRequired} units
            </span>
          </div>
          {!isSufficient && (
            <div className="mt-4 p-3 bg-rose-50 border border-rose-100 rounded-xl flex gap-3 text-rose-800 text-xs">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <p>Warning: You do not have enough water bags loaded for all assigned orders.</p>
            </div>
          )}
        </Card>

        <Card className="border-none bg-primary text-white p-6 rounded-3xl shadow-xl shadow-primary/20 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <p className="text-primary-foreground/70 text-xs font-bold uppercase tracking-widest">Performance Today</p>
            <Award className="h-5 w-5 opacity-50" />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-2xl font-bold font-headline">₦14,250</p>
              <p className="text-[10px] text-primary-foreground/70 uppercase">Daily Earnings</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold font-headline">12</p>
              <p className="text-[10px] text-primary-foreground/70 uppercase">Trips Done</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-headline">Active Deliveries</h2>
          <p className="text-sm text-muted-foreground">You have {deliveries.filter(d => d.status !== 'Completed').length} tasks assigned</p>
        </div>
        <Badge className="bg-primary px-3 py-1">{deliveries.filter(d => d.status !== 'Completed').length} Active</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {deliveries.map((delivery) => (
          <Card 
            key={delivery.id} 
            className={cn(
              "border-none shadow-lg overflow-hidden relative transition-all duration-300", 
              delivery.status === 'Delivering' ? "bg-primary/5 ring-2 ring-primary/20 scale-[1.02]" : "bg-white"
            )}
          >
            <div className={`absolute top-0 left-0 w-1.5 h-full ${delivery.status === 'Accepted' ? 'bg-blue-400' : 'bg-primary'}`}></div>
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{delivery.id}</CardTitle>
                    <Badge variant="outline" className={cn("text-[10px] font-bold", delivery.status === 'Delivering' ? "bg-primary text-white border-none" : "")}>
                      {delivery.status === 'Accepted' ? 'Ready for Pickup' : 'In Transit'}
                    </Badge>
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
              <Link href={`/dashboard/driver/navigate/${delivery.id}`} className="w-full">
                <Button variant="outline" className="w-full rounded-xl h-11 gap-2">
                  <Navigation className="h-4 w-4" />
                  Navigate
                </Button>
              </Link>
              <Button 
                className={cn(
                  "rounded-xl h-11 gap-2 transition-all", 
                  delivery.status === 'Delivering' ? "bg-accent hover:bg-accent/90 cursor-default" : "shadow-lg shadow-primary/20"
                )}
                onClick={() => delivery.status !== 'Delivering' && handleStartDelivery(delivery.id)}
                disabled={delivery.status !== 'Delivering' && isAnyDeliveryActive}
              >
                {delivery.status === 'Delivering' ? (
                  <>
                    <Truck className="h-4 w-4 animate-bounce" />
                    In Transit
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Start Delivery
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
