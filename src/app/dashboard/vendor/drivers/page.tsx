"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Truck, Search, Plus, Star, MapPin, Phone, MessageSquare, MoreVertical, CheckCircle2, Clock, User, Wallet, Power, PowerOff } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const initialDrivers = [
  { id: 1, name: "John Driver", rating: 4.9, status: "Active", trips: 124, image: "https://picsum.photos/seed/d1/100" },
  { id: 2, name: "Sarah Delivery", rating: 4.8, status: "Busy", trips: 89, image: "https://picsum.photos/seed/d2/100" },
  { id: 3, name: "Mike Moto", rating: 4.7, status: "Offline", trips: 256, image: "https://picsum.photos/seed/d3/100" },
  { id: 4, name: "Dave Logistics", rating: 4.5, status: "Active", trips: 42, image: "https://picsum.photos/seed/d4/100" },
];

export default function VendorDriversPage() {
  const [drivers, setDrivers] = useState(initialDrivers);
  const { toast } = useToast();

  const toggleDriverStatus = (id: number) => {
    setDrivers(prev => prev.map(driver => {
      if (driver.id === id) {
        const isDeactivated = driver.status === 'Deactivated';
        const newStatus = isDeactivated ? 'Offline' : 'Deactivated';
        
        toast({
          title: isDeactivated ? "Driver Activated" : "Driver Deactivated",
          description: `${driver.name} has been set to ${newStatus.toLowerCase()}.`,
          variant: isDeactivated ? "default" : "destructive"
        });

        return { ...driver, status: newStatus };
      }
      return driver;
    }));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Driver Fleet</h1>
          <p className="text-muted-foreground">Manage your delivery personnel and track performance.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Link href="/dashboard/vendor/drivers/withdrawals" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full rounded-xl h-11 gap-2 border-primary/20 text-primary">
              <Wallet className="h-5 w-5" /> Withdrawals
            </Button>
          </Link>
          <Link href="/dashboard/vendor/drivers/new" className="flex-1 sm:flex-none">
            <Button className="w-full rounded-xl h-11 gap-2 shadow-lg shadow-primary/20">
              <Plus className="h-5 w-5" /> Add New Driver
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-primary/5 border border-primary/10 p-6 rounded-3xl">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
              <Truck className="h-8 w-8" />
            </div>
            <div>
              <p className="text-2xl font-bold">{drivers.length}</p>
              <p className="text-sm text-muted-foreground">Total Drivers</p>
            </div>
          </div>
        </Card>
        <Card className="border-none shadow-sm bg-green-50 border border-green-100 p-6 rounded-3xl">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <p className="text-2xl font-bold">{drivers.filter(d => d.status !== 'Deactivated' && d.status !== 'Offline').length}</p>
              <p className="text-sm text-muted-foreground">Currently Online</p>
            </div>
          </div>
        </Card>
        <Card className="border-none shadow-sm bg-blue-50 border border-blue-100 p-6 rounded-3xl">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
              <Clock className="h-8 w-8" />
            </div>
            <div>
              <p className="text-2xl font-bold">15m</p>
              <p className="text-sm text-muted-foreground">Avg. Delivery Time</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Filter drivers by name or status..." className="pl-10 h-11 rounded-xl" />
        </div>
        <Button variant="outline" className="h-11 px-6 rounded-xl">All Status</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {drivers.map((driver) => (
          <Card key={driver.id} className={cn(
            "border-none shadow-sm overflow-hidden group hover:shadow-md transition-all",
            driver.status === 'Deactivated' && "opacity-75 grayscale-[0.5]"
          )}>
            <CardHeader className="pb-4 flex flex-row items-center justify-between">
              <Badge 
                variant="outline" 
                className={`text-[10px] font-bold ${
                  driver.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 
                  driver.status === 'Busy' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                  driver.status === 'Deactivated' ? 'bg-red-50 text-red-700 border-red-200' :
                  'bg-gray-50 text-gray-700 border-gray-200'
                }`}
              >
                {driver.status}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl">
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href={`/dashboard/vendor/drivers/${driver.id}`} className="flex items-center gap-2">
                      <User className="h-4 w-4" /> View Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={cn(
                      "cursor-pointer font-medium",
                      driver.status === 'Deactivated' ? "text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50" : "text-destructive focus:text-destructive focus:bg-destructive/5"
                    )}
                    onClick={() => toggleDriverStatus(driver.id)}
                  >
                    {driver.status === 'Deactivated' ? (
                      <>
                        <Power className="h-4 w-4 mr-2" /> Activate Driver
                      </>
                    ) : (
                      <>
                        <PowerOff className="h-4 w-4 mr-2" /> Deactivate Driver
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center pb-6">
              <Avatar className="h-20 w-20 mb-4 border-2 border-primary/10">
                <AvatarImage src={driver.image} />
                <AvatarFallback>{driver.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <h4 className="font-bold">{driver.name}</h4>
              <div className="flex items-center gap-1 text-yellow-500 text-sm mt-1">
                <Star className="h-3 w-3 fill-current" />
                <span>{driver.rating}</span>
                <span className="text-muted-foreground ml-1">({driver.trips} trips)</span>
              </div>
              <Link href={`/dashboard/vendor/drivers/${driver.id}`} className="w-full mt-6">
                <Button size="sm" variant="outline" className="w-full rounded-xl gap-2">
                  <User className="h-3 w-3" /> View Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
