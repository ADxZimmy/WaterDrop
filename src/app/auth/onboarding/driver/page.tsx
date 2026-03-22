"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Truck,
  Link as LinkIcon,
  CheckCircle2,
  ArrowRight,
  Building2,
  ShieldAlert
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function DriverOnboarding() {
  const [vendorId, setVendorId] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLinkVendor = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vendorId.trim() || !vehicleType.trim() || !licensePlate.trim()) {
      toast({
        title: "ID Required",
        description: "Please complete the vendor and vehicle details to continue.",
        variant: "destructive"
      });
      return;
    }

    setIsLinking(true);

    try {
      const response = await fetch('/api/driver/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId,
          vehicleType,
          licensePlate,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? 'Unable to link driver profile.');
      }

      toast({
        title: "Account Linked!",
        description: "Successfully connected to the vendor. You can now receive orders."
      });
      router.push('/dashboard/driver');
    } catch (error) {
      toast({
        title: "Linking Failed",
        description: error instanceof Error ? error.message : 'Unable to link driver profile.',
        variant: "destructive"
      });
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4 shadow-inner">
            <Truck className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-bold font-headline text-foreground">Driver Connection</h1>
          <p className="text-muted-foreground text-sm mt-2">Link your account to a registered WaterDrop vendor to start delivering.</p>
        </div>

        <Card className="border-none shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-primary text-primary-foreground p-8 text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <LinkIcon className="h-6 w-6" />
              Connect to Vendor
            </CardTitle>
            <CardDescription className="text-primary-foreground/80">
              Enter the unique ID provided by your water factory or distributor.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8 pt-10">
            <form onSubmit={handleLinkVendor} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="vendorId" className="text-foreground font-bold">Vendor ID</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="vendorId"
                    placeholder="e.g. VND-8821-X"
                    className="pl-10 h-12 rounded-xl border-2 focus:border-primary transition-all text-lg tracking-wider font-mono"
                    value={vendorId}
                    onChange={(e) => setVendorId(e.target.value)}
                    required
                  />
                </div>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1 px-1">
                  <ShieldAlert className="h-3 w-3" />
                  Contact your vendor manager if you don't have an ID yet.
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="vehicleType" className="text-foreground font-bold">Vehicle Type</Label>
                <Input
                  id="vehicleType"
                  placeholder="e.g. Delivery Van"
                  className="h-12 rounded-xl"
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="licensePlate" className="text-foreground font-bold">License Plate</Label>
                <Input
                  id="licensePlate"
                  placeholder="e.g. WD-204-LAG"
                  className="h-12 rounded-xl uppercase font-mono"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 gap-2 mt-4"
                disabled={isLinking}
              >
                {isLinking ? "Connecting..." : "Link Account"}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </form>
          </CardContent>

          <CardFooter className="bg-muted/30 p-6 flex flex-col gap-4 border-t border-muted">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Linking allows automatic order assignment</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Direct payout synchronization with vendor</span>
            </div>
          </CardFooter>
        </Card>

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/dashboard/driver')}
            className="text-sm text-primary hover:underline font-medium"
          >
            Skip for now (Limited access)
          </button>
        </div>
      </div>
    </div>
  );
}
