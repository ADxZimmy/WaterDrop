"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Phone, Mail, Award, CheckCircle2, Info } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export default function AddDriverPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddToFleet = () => {
    setIsSubmitting(true);
    
    // Simulate invitation process
    setTimeout(() => {
      toast({
        title: "Invitation Sent Successfully!",
        description: "The driver's email address has been notified with their login credentials and onboarding steps.",
      });
      setIsSubmitting(false);
      router.push('/dashboard/vendor/drivers');
    }, 1200);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold font-headline">Add New Driver</h1>
      </div>

      <Card className="border-none shadow-lg rounded-3xl overflow-hidden">
        <CardHeader className="bg-primary/5 border-b p-8">
          <CardTitle className="text-xl">Driver Application</CardTitle>
          <CardDescription>Fill out the profile to add a driver to your verified fleet.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" placeholder="e.g. John" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" placeholder="e.g. Smith" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" placeholder="+1 (555) 000-0000" />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-bold flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" /> Vehicle Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="vehicleType">Vehicle Type</Label>
                <Select>
                  <SelectTrigger>
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
                <Label htmlFor="licensePlate">License Plate Number</Label>
                <Input id="licensePlate" placeholder="e.g. AQUA-1234" />
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted/30 rounded-2xl flex gap-3 text-sm">
            <Info className="h-5 w-5 text-primary shrink-0" />
            <p className="text-muted-foreground">
              New drivers will receive an email to set their password and download the Driver App once added.
            </p>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/10 p-8 border-t flex justify-end gap-3">
          <Button variant="ghost" onClick={() => router.back()} disabled={isSubmitting}>Cancel</Button>
          <Button 
            className="rounded-xl px-8 shadow-lg shadow-primary/20 gap-2"
            onClick={handleAddToFleet}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Inviting..." : (
              <>
                <CheckCircle2 className="h-5 w-5" /> Add to Fleet
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
