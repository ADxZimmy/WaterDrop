
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Clock, 
  AlertCircle,
  Building2,
  ShieldCheck,
  FileText,
  Store,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Upload,
  MapPin,
  Lock,
  Droplets
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type SetupStatus = 'new' | 'review' | 'active';

export default function VendorDashboardOverview() {
  const [status, setStatus] = useState<SetupStatus>('new');
  const [showSetup, setShowSetup] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    // Check for dev bypass
    const isApproved = localStorage.getItem('vendor_bypass_approved') === 'true';
    if (isApproved) {
      setStatus('active');
    } else {
      // Simulate checking account status on mount if not bypassed
      if (status === 'new') {
        const timer = setTimeout(() => setShowSetup(true), 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [status]);

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmitSetup = () => {
    setShowSetup(false);
    setStatus('review');
    toast({
      title: "Application Submitted",
      description: "Your business details are now under review. We'll notify you once approved."
    });
  };

  const handleDevApprove = () => {
    localStorage.setItem('vendor_bypass_approved', 'true');
    setStatus('active');
    window.location.reload();
  };

  // 1. "Empty" State for New/Review accounts
  if (status !== 'active') {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold font-headline">Vendor Overview</h1>
            <p className="text-muted-foreground">Welcome to your dashboard.</p>
          </div>
          {status === 'review' && (
            <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none px-4 py-1 animate-pulse">
              Under Review
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border-dashed border-2 bg-muted/5 flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
            <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
              {status === 'new' ? <Building2 className="h-10 w-10" /> : <Clock className="h-10 w-10" />}
            </div>
            {status === 'new' ? (
              <>
                <h2 className="text-2xl font-bold mb-2">Finish Your Store Setup</h2>
                <p className="text-muted-foreground mb-8 max-w-md">Complete your verification to start adding products, managing drivers, and receiving orders.</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={() => setShowSetup(true)} size="lg" className="rounded-xl px-8 shadow-lg shadow-primary/20">
                    Complete Setup Now
                  </Button>
                  <Button variant="outline" size="lg" className="rounded-xl px-8 border-orange-200 text-orange-600 bg-orange-50 hover:bg-orange-100" onClick={handleDevApprove}>
                    [TEMP] Bypass Review
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-2">Verification in Progress</h2>
                <p className="text-muted-foreground mb-8 max-w-md">Our compliance team is currently reviewing your documents. This usually takes 24-48 business hours.</p>
                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100 text-yellow-800 text-sm max-w-sm mb-6">
                  We'll email you at <strong>admin@aquapure.com</strong> once your account is activated.
                </div>
                <Button variant="outline" className="rounded-xl px-8 border-orange-200 text-orange-600 bg-orange-50 hover:bg-orange-100" onClick={handleDevApprove}>
                  [TEMP] Bypass Review
                </Button>
              </>
            )}
          </Card>

          <Card className="border-none shadow-sm h-fit">
            <CardHeader>
              <CardTitle className="text-lg">Checklist</CardTitle>
              <CardDescription>Steps to start selling</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center text-white">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">Verify Email & Phone</span>
              </div>
              <div className="flex items-center gap-3">
                <div className={cn("h-6 w-6 rounded-full flex items-center justify-center text-white", status !== 'new' ? "bg-green-500" : "bg-muted text-muted-foreground")}>
                  {status !== 'new' ? <CheckCircle2 className="h-4 w-4" /> : "2"}
                </div>
                <span className={cn("text-sm", status === 'new' ? "text-muted-foreground" : "font-medium")}>Submit Business Info</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground">3</div>
                <span className="text-sm text-muted-foreground">Admin Approval</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground">4</div>
                <span className="text-sm text-muted-foreground">First Product Listing</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Setup Modal */}
        <Dialog open={showSetup} onOpenChange={setShowSetup}>
          <DialogContent className="sm:max-w-2xl p-0 border-none overflow-hidden rounded-[32px] shadow-2xl">
            <div className="bg-primary p-8 text-white relative">
              <div className="flex items-center gap-3 mb-4">
                <Droplets className="h-8 w-8" />
                <span className="font-bold text-2xl tracking-tight font-headline">WaterDrop Vendor</span>
              </div>
              <DialogTitle className="text-3xl font-bold">Complete Your Setup</DialogTitle>
              <DialogDescription className="text-primary-foreground/80 mt-2">
                Provide your regulatory details to verify your factory or distribution center.
              </DialogDescription>
              
              <div className="flex gap-2 mt-8">
                {[1, 2, 3, 4].map((s) => (
                  <div key={s} className={cn("h-1.5 rounded-full flex-1 transition-all", s <= currentStep ? "bg-white" : "bg-white/20")} />
                ))}
              </div>
            </div>

            <div className="p-8 bg-white max-h-[60vh] overflow-y-auto">
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <div className="flex items-center gap-2 text-primary font-bold text-lg mb-2">
                    <Building2 className="h-5 w-5" /> 1. Business Information
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Registered Business Name</Label>
                      <Input id="businessName" placeholder="e.g. Blue Crystal Water Ltd" className="h-12 rounded-xl" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="businessType">Business Type</Label>
                        <Input id="businessType" placeholder="Factory / Distributor" className="h-12 rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="est">Est. Year</Label>
                        <Input id="est" type="number" placeholder="2024" className="h-12 rounded-xl" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Physical Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input id="address" className="pl-10 h-12 rounded-xl" placeholder="123 Industrial Estate" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <div className="flex items-center gap-2 text-primary font-bold text-lg mb-2">
                    <ShieldCheck className="h-5 w-5" /> 2. Compliance & Tax
                  </div>
                  <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl flex gap-3 text-sm text-yellow-800 mb-4">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p>Accurate regulatory data ensures trust and faster verification of your account.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nafdac">NAFDAC Registration Number</Label>
                      <Input id="nafdac" placeholder="e.g. 01-1234L" className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cac">CAC / Business Reg Number</Label>
                      <Input id="cac" placeholder="e.g. RC-000000" className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tin">Tax Identification Number (TIN)</Label>
                      <Input id="tin" placeholder="e.g. 12345678-0001" className="h-12 rounded-xl" />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <div className="flex items-center gap-2 text-primary font-bold text-lg mb-2">
                    <FileText className="h-5 w-5" /> 3. Document Uploads
                  </div>
                  <div className="space-y-4">
                    {[
                      { label: "NAFDAC Certificate", desc: "Scan of your valid permit" },
                      { label: "Business Registration", desc: "CAC Certificate" },
                      { label: "Utility Bill", desc: "Proof of factory location" },
                    ].map((doc, i) => (
                      <div key={i} className="flex items-center justify-between p-4 border border-dashed rounded-2xl bg-muted/20">
                        <div>
                          <p className="font-bold text-sm">{doc.label}</p>
                          <p className="text-[10px] text-muted-foreground">{doc.desc}</p>
                        </div>
                        <Button variant="outline" size="sm" className="gap-2 bg-white rounded-lg h-8">
                          <Upload className="h-3 w-3" /> Upload
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <div className="flex items-center gap-2 text-primary font-bold text-lg mb-2">
                    <Store className="h-5 w-5" /> 4. Storefront Preview
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="desc">Short Bio / Description</Label>
                      <Textarea id="desc" placeholder="Tell customers about your water source..." className="min-h-[100px] rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="radius">Delivery Radius (km)</Label>
                      <Input id="radius" type="number" placeholder="10" className="h-12 rounded-xl" />
                    </div>
                    <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl">
                      <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Confirmation</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        By submitting, you agree to WaterDrop's quality assurance protocols and commission structure.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 border-t flex justify-between bg-muted/10">
              <Button 
                variant="ghost" 
                onClick={handleBack} 
                disabled={currentStep === 1}
                className="rounded-xl h-12 px-6"
              >
                <ChevronLeft className="h-4 w-4 mr-2" /> Back
              </Button>
              {currentStep === 4 ? (
                <Button onClick={handleSubmitSetup} className="rounded-xl h-12 px-10 shadow-lg shadow-primary/20">
                  Finish & Submit <CheckCircle2 className="h-4 w-4 ml-2" />
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

  // 2. Active Dashboard View
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Vendor Overview</h1>
        <p className="text-muted-foreground">Good morning, Aqua Pure. Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,450.00</div>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" /> +12.5% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,204</div>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" /> +4.3% from last week
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">New Customers</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" /> +18.7% this month
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Customer Satisfaction</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98%</div>
            <Progress value={98} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Orders</CardTitle>
            <Link href="/dashboard/vendor/orders">
              <Button variant="link" size="sm" className="text-primary">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                      <ShoppingBag className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Order #552{i}</p>
                      <p className="text-xs text-muted-foreground">Alice Johnson • 2 items</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">$45.00</p>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-2 w-2" /> 5 mins ago
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Inventory Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-red-50 p-4 rounded-xl border border-red-100">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-red-900">Critical Stock Alert</p>
                  <p className="text-xs text-red-700">750ml Bottled Water is below 50 units.</p>
                </div>
                <Link href="/dashboard/vendor/products">
                  <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white rounded-lg">Restock</Button>
                </Link>
              </div>
              <div className="flex items-center gap-4 bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-yellow-900">Expiring Soon</p>
                  <p className="text-xs text-red-700">Batch #445-B expires in 5 days.</p>
                </div>
                <Link href="/dashboard/vendor/products">
                  <Button size="sm" variant="outline" className="border-yellow-200 text-yellow-800 rounded-lg">Review</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
