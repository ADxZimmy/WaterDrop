
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Store, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Building2,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export default function AdminNewVendorPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Vendor Created Successfully",
        description: "The new vendor has been added and their account is now active.",
      });
      setIsSubmitting(false);
      router.push('/admin/vendors');
    }, 1500);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/vendors">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold font-headline text-slate-900">Add New Vendor</h1>
          <p className="text-slate-500">Register and verify a new business partner manually.</p>
        </div>
      </div>

      <form onSubmit={handleCreateVendor}>
        <div className="grid grid-cols-1 gap-8">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50 border-b p-8">
              <CardTitle className="text-xl flex items-center gap-2">
                <Store className="h-6 w-6 text-primary" /> Business Identity
              </CardTitle>
              <CardDescription>Core information about the water factory or distributor.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input id="businessName" placeholder="e.g. Pure Oasis Water" className="rounded-xl h-11" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vendorType">Vendor Type</Label>
                  <Select required>
                    <SelectTrigger className="rounded-xl h-11">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="factory">Water Factory</SelectItem>
                      <SelectItem value="distributor">Distributor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Owner/Manager Name</Label>
                  <Input id="ownerName" placeholder="Full name" className="rounded-xl h-11" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Primary Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                    <Input id="email" type="email" placeholder="contact@business.com" className="pl-10 rounded-xl h-11" required />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                    <Input id="phone" placeholder="+1 (555) 000-0000" className="pl-10 rounded-xl h-11" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Physical Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                    <Input id="address" placeholder="123 Industrial Rd" className="pl-10 rounded-xl h-11" required />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50 border-b p-8">
              <CardTitle className="text-xl flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-primary" /> Regulatory Compliance
              </CardTitle>
              <CardDescription>Verified government documentation and tax IDs.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nafdac">NAFDAC Number</Label>
                  <Input id="nafdac" placeholder="01-XXXXL" className="rounded-xl h-11 font-mono" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tin">TIN Number</Label>
                  <Input id="tin" placeholder="12345678-0001" className="rounded-xl h-11 font-mono" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cac">CAC Number</Label>
                  <Input id="cac" placeholder="RC-XXXXXX" className="rounded-xl h-11 font-mono" required />
                </div>
              </div>

              <Separator />

              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex gap-3 text-sm text-primary">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <p>
                  By creating this vendor, they will be automatically marked as <strong>Verified</strong> and will receive an email to set up their dashboard credentials.
                </p>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50 p-8 border-t flex justify-end gap-3">
              <Link href="/admin/vendors">
                <Button variant="ghost" className="rounded-xl h-12 px-8">Cancel</Button>
              </Link>
              <Button 
                type="submit" 
                className="rounded-xl h-12 px-10 shadow-lg shadow-primary/20 gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating Vendor..." : (
                  <>
                    <CheckCircle2 className="h-5 w-5" /> Confirm & Register Vendor
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  );
}
