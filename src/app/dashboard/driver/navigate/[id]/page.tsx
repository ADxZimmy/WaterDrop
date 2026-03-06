"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  ArrowLeft, 
  MapPin, 
  Navigation, 
  Phone, 
  MessageSquare, 
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useToast } from "@/hooks/use-toast";

export default function DriverNavigatePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 4) {
      toast({
        title: "Invalid Code",
        description: "Please enter the full 4-digit confirmation code.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API verification
    setTimeout(() => {
      toast({
        title: "Delivery Confirmed!",
        description: "Order #AQ-5521 has been marked as completed."
      });
      setIsSubmitting(false);
      setShowConfirmModal(false);
      router.push('/dashboard/driver');
    }, 1500);
  };

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
              onClick={() => setShowConfirmModal(true)}
            >
              I Have Arrived
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-md rounded-[32px] border-none shadow-2xl overflow-hidden p-0">
          <div className="bg-primary p-8 text-white text-center">
            <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8" />
            </div>
            <DialogTitle className="text-2xl font-bold font-headline">Verify Delivery</DialogTitle>
            <DialogDescription className="text-primary-foreground/80 mt-2">
              Please enter the 4-digit code provided by the customer to complete this order.
            </DialogDescription>
          </div>
          
          <form onSubmit={handleConfirmDelivery} className="p-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="code" className="sr-only">Verification Code</Label>
              <Input 
                id="code" 
                type="text" 
                inputMode="numeric"
                maxLength={4}
                placeholder="0 0 0 0" 
                className="h-16 text-center text-4xl font-bold tracking-[0.5em] rounded-2xl border-2 focus:border-primary transition-all bg-muted/30"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                required
                autoFocus
              />
            </div>
            <DialogFooter className="flex flex-col gap-3">
              <Button 
                type="submit" 
                className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20 gap-2"
                disabled={isSubmitting || code.length < 4}
              >
                {isSubmitting ? "Verifying..." : "Complete Delivery"}
                {!isSubmitting && <CheckCircle2 className="h-5 w-5" />}
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full rounded-xl"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
