"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  ArrowLeft, 
  MapPin, 
  Navigation, 
  Phone, 
  MessageSquare, 
  ArrowUp, 
  ArrowUpRight,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function DriverNavigatePage() {
  const params = useParams();
  const router = useRouter();

  return (
    <div className="relative h-screen w-full overflow-hidden bg-muted">
      {/* Mock Map Background */}
      <div className="absolute inset-0 z-0">
        <Image 
          src={PlaceHolderImages.find(img => img.id === 'mock-map')?.imageUrl || ''} 
          alt="Navigation Map"
          fill
          className="object-cover"
          priority
        />
        {/* Mock Map Marker Overlay */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="h-10 w-10 bg-primary/20 rounded-full animate-ping absolute -inset-0"></div>
            <div className="h-10 w-10 bg-primary rounded-full border-4 border-white shadow-xl flex items-center justify-center relative">
              <Navigation className="h-5 w-5 text-white fill-current" />
            </div>
          </div>
        </div>
      </div>

      {/* Top Navigation Instructions */}
      <div className="absolute top-6 inset-x-4 z-10">
        <Card className="bg-primary text-white border-none shadow-2xl rounded-3xl overflow-hidden animate-in slide-in-from-top-4 duration-500">
          <CardContent className="p-6 flex items-center gap-6">
            <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
              <ArrowUpRight className="h-10 w-10" />
            </div>
            <div className="flex-1">
              <p className="text-3xl font-bold font-headline">200m</p>
              <p className="text-lg opacity-80">Turn right onto Blue River Parkway</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floating Action Buttons */}
      <div className="absolute right-4 top-40 z-10 flex flex-col gap-3">
        <Button variant="secondary" size="icon" className="h-14 w-14 rounded-full shadow-xl bg-white text-primary hover:bg-white/90">
          <Phone className="h-6 w-6" />
        </Button>
        <Button variant="secondary" size="icon" className="h-14 w-14 rounded-full shadow-xl bg-white text-primary hover:bg-white/90">
          <MessageSquare className="h-6 w-6" />
        </Button>
      </div>

      <div className="absolute left-4 top-40 z-10">
        <Button 
          variant="secondary" 
          size="icon" 
          className="h-14 w-14 rounded-full shadow-xl bg-white text-foreground"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
      </div>

      {/* Bottom Destination Card */}
      <div className="absolute bottom-6 inset-x-4 z-10">
        <Card className="border-none shadow-2xl rounded-[32px] overflow-hidden bg-white/90 backdrop-blur-xl">
          <CardContent className="p-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Dropoff Destination</h4>
                  <p className="text-sm text-muted-foreground line-clamp-1">123 Ocean View Dr, Blue City</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100 font-bold">
                EST. 4 MINS
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="border-none bg-muted/30 p-4 rounded-2xl">
                <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase font-bold tracking-widest mb-1">
                  <Clock className="h-3 w-3" /> Distance
                </div>
                <p className="text-xl font-bold">1.2 km</p>
              </Card>
              <Card className="border-none bg-muted/30 p-4 rounded-2xl">
                <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase font-bold tracking-widest mb-1">
                  <CheckCircle2 className="h-3 w-3" /> Arrival
                </div>
                <p className="text-xl font-bold">14:45</p>
              </Card>
            </div>

            <Button 
              className="w-full h-16 rounded-[24px] text-xl font-bold mt-6 shadow-xl shadow-primary/20 gap-3"
              onClick={() => router.push('/dashboard/driver')}
            >
              I Have Arrived
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}