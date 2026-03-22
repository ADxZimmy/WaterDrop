
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  FileText, 
  CheckCircle2, 
  Upload, 
  ChevronRight, 
  ChevronLeft, 
  Droplets,
  ShieldCheck,
  Store,
  MapPin
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type VendorProfileResponse = {
  profile: null | {
    businessName: string;
    businessType?: string;
    establishmentYear?: number;
    address?: string;
    nafdacNumber?: string;
    cacNumber?: string;
    taxId?: string;
    description?: string;
    deliveryRadiusKm?: number;
    status: 'pending' | 'approved' | 'rejected';
    reviewNotes?: string;
  };
};

const steps = [
  { id: 1, name: 'Business Info', icon: Building2 },
  { id: 2, name: 'Compliance', icon: ShieldCheck },
  { id: 3, name: 'Documents', icon: FileText },
  { id: 4, name: 'Store Setup', icon: Store },
];

export default function VendorOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState({
    businessName: '',
    businessType: '',
    establishmentYear: '',
    address: '',
    nafdacNumber: '',
    cacNumber: '',
    taxId: '',
    description: '',
    deliveryRadiusKm: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    const loadExistingProfile = async () => {
      try {
        const response = await fetch('/api/vendor/profile', { method: 'GET' });
        if (!response.ok) {
          throw new Error('Unable to load existing vendor profile.');
        }

        const payload: VendorProfileResponse = await response.json();
        if (isMounted && payload.profile) {
          setForm({
            businessName: payload.profile.businessName ?? '',
            businessType: payload.profile.businessType ?? '',
            establishmentYear:
              typeof payload.profile.establishmentYear === 'number'
                ? String(payload.profile.establishmentYear)
                : '',
            address: payload.profile.address ?? '',
            nafdacNumber: payload.profile.nafdacNumber ?? '',
            cacNumber: payload.profile.cacNumber ?? '',
            taxId: payload.profile.taxId ?? '',
            description: payload.profile.description ?? '',
            deliveryRadiusKm:
              typeof payload.profile.deliveryRadiusKm === 'number'
                ? String(payload.profile.deliveryRadiusKm)
                : '',
          });
        }
      } catch {
        // Ignore profile bootstrap failures and allow a fresh submission.
      } finally {
        if (isMounted) {
          setIsLoadingProfile(false);
        }
      }
    };

    void loadExistingProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleNext = async () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      try {
        setIsSubmitting(true);
        const response = await fetch('/api/vendor/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessName: form.businessName,
            businessType: form.businessType,
            establishmentYear: Number(form.establishmentYear),
            address: form.address,
            nafdacNumber: form.nafdacNumber,
            cacNumber: form.cacNumber,
            taxId: form.taxId,
            description: form.description,
            deliveryRadiusKm: Number(form.deliveryRadiusKm),
          }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error ?? 'Unable to submit vendor onboarding.');
        }

        toast({
          title: 'Application Submitted',
          description: 'Your vendor profile is now in review.',
        });
        router.push('/dashboard/vendor');
      } catch (error) {
        toast({
          title: 'Submission Failed',
          description: error instanceof Error ? error.message : 'Unable to submit vendor onboarding.',
          variant: 'destructive',
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = (currentStep / steps.length) * 100;

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">Loading your vendor application...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl">
        <div className="flex flex-col items-center mb-8 text-center">
          <Droplets className="h-10 w-10 text-primary mb-2" />
          <h1 className="text-2xl font-bold font-headline">Vendor Verification</h1>
          <p className="text-muted-foreground text-sm">Complete your profile to start selling on WaterDrop</p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between mb-4">
            {steps.map((step) => (
              <div 
                key={step.id} 
                className={`flex flex-col items-center gap-1 transition-opacity ${currentStep >= step.id ? 'opacity-100' : 'opacity-40'}`}
              >
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${currentStep >= step.id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                  {currentStep > step.id ? <CheckCircle2 className="h-5 w-5" /> : step.id}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-tighter hidden sm:block">{step.name}</span>
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-primary/5 border-b p-6">
            <CardTitle className="flex items-center gap-2 text-xl">
              {React.createElement(steps[currentStep - 1].icon, { className: "h-6 w-6 text-primary" })}
              {steps[currentStep - 1].name}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Basic details about your business enterprise."}
              {currentStep === 2 && "Required regulatory and compliance information."}
              {currentStep === 3 && "Upload scanned copies of your official documents."}
              {currentStep === 4 && "Final details for your online water storefront."}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            {currentStep === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Registered Business Name</Label>
                  <Input id="businessName" placeholder="e.g. Blue Crystal Water Ltd" value={form.businessName} onChange={(e) => setForm((prev) => ({ ...prev, businessName: e.target.value }))} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessType">Business Type</Label>
                    <Input id="businessType" placeholder="e.g. Factory / Distributor" value={form.businessType} onChange={(e) => setForm((prev) => ({ ...prev, businessType: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="regYear">Year of Establishment</Label>
                    <Input id="regYear" type="number" placeholder="2024" value={form.establishmentYear} onChange={(e) => setForm((prev) => ({ ...prev, establishmentYear: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Physical Address (Factory/Store)</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="address" className="pl-10" placeholder="123 Production Way, Industrial Estate" value={form.address} onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl flex gap-3 text-sm text-yellow-800">
                  <ShieldCheck className="h-5 w-5 shrink-0" />
                  <p>Accurate regulatory data ensures trust and faster verification of your account.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nafdac">NAFDAC Registration Number</Label>
                  <Input id="nafdac" placeholder="e.g. 01-1234L" value={form.nafdacNumber} onChange={(e) => setForm((prev) => ({ ...prev, nafdacNumber: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cac">CAC / Business Registration Number</Label>
                  <Input id="cac" placeholder="e.g. RC-000000" value={form.cacNumber} onChange={(e) => setForm((prev) => ({ ...prev, cacNumber: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax Identification Number (TIN)</Label>
                  <Input id="taxId" placeholder="e.g. 12345678-0001" value={form.taxId} onChange={(e) => setForm((prev) => ({ ...prev, taxId: e.target.value }))} />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                {[
                  { label: "NAFDAC Certificate", desc: "Scan of your valid NAFDAC permit" },
                  { label: "Business Registration", desc: "CAC Certificate or equivalent" },
                  { label: "Utility Bill", desc: "Proof of factory/store location" },
                ].map((doc, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-dashed rounded-2xl bg-muted/20 gap-4">
                    <div>
                      <p className="font-bold text-sm">{doc.label}</p>
                      <p className="text-xs text-muted-foreground">{doc.desc}</p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2 bg-white rounded-lg">
                      <Upload className="h-4 w-4" /> Upload PDF/JPG
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="storeDescription">Store Description</Label>
                  <Textarea id="storeDescription" placeholder="Tell customers about your water source, purification process, and values..." className="min-h-[120px]" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryRadius">Delivery Radius (km)</Label>
                  <Input id="deliveryRadius" type="number" placeholder="10" value={form.deliveryRadiusKm} onChange={(e) => setForm((prev) => ({ ...prev, deliveryRadiusKm: e.target.value }))} />
                </div>
                <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl">
                  <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Terms of Service</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    By submitting this application, you agree to WaterDrop's Quality Assurance protocols and commission structure. Your store will be public once our team verifies your documents.
                  </p>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="bg-muted/30 p-6 flex justify-between gap-4 border-t">
            <Button 
              variant="ghost" 
              onClick={handleBack} 
              disabled={currentStep === 1}
              className="gap-2 rounded-xl"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
            <Button 
              onClick={handleNext} 
              disabled={isSubmitting}
              className="gap-2 rounded-xl px-8 shadow-lg shadow-primary/20"
            >
              {currentStep === steps.length ? (isSubmitting ? 'Submitting...' : 'Finish & Submit') : 'Continue'} 
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
