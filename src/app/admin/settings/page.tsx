"use client";

import React, { useState } from 'react';
import { 
  Settings, 
  ShieldCheck, 
  TrendingUp, 
  Globe, 
  Bell, 
  Lock, 
  Server, 
  Save, 
  AlertTriangle,
  Info,
  Database,
  Truck,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [isSaving, setIsSubmitting] = useState(false);

  const handleSave = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "System Updated",
        description: "Global settings have been successfully applied to the platform.",
      });
    }, 1000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-slate-900">System Settings</h1>
          <p className="text-slate-500">Configure global platform behavior and business rules.</p>
        </div>
        <Button 
          className="rounded-xl h-11 px-8 shadow-lg shadow-primary/20 gap-2"
          onClick={handleSave}
          disabled={isSaving}
        >
          <Save className="h-4 w-4" /> {isSaving ? "Saving Changes..." : "Save All Changes"}
        </Button>
      </div>

      <Tabs defaultValue="platform" className="w-full">
        <TabsList className="bg-white p-1 rounded-2xl border border-slate-200 h-14 w-full justify-start overflow-x-auto no-scrollbar sm:w-auto">
          <TabsTrigger value="platform" className="rounded-xl px-6 h-12 data-[state=active]:bg-primary data-[state=active]:text-white">
            <Globe className="h-4 w-4 mr-2" /> Platform
          </TabsTrigger>
          <TabsTrigger value="financials" className="rounded-xl px-6 h-12 data-[state=active]:bg-primary data-[state=active]:text-white">
            <TrendingUp className="h-4 w-4 mr-2" /> Financials
          </TabsTrigger>
          <TabsTrigger value="compliance" className="rounded-xl px-6 h-12 data-[state=active]:bg-primary data-[state=active]:text-white">
            <ShieldCheck className="h-4 w-4 mr-2" /> Compliance
          </TabsTrigger>
          <TabsTrigger value="infrastructure" className="rounded-xl px-6 h-12 data-[state=active]:bg-primary data-[state=active]:text-white">
            <Server className="h-4 w-4 mr-2" /> Infrastructure
          </TabsTrigger>
        </TabsList>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TabsContent value="platform" className="mt-0 space-y-6">
              <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="bg-slate-50 border-b p-6">
                  <CardTitle className="text-lg">General Configuration</CardTitle>
                  <CardDescription>Core identity and operational settings for WaterDrop.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="appName">Platform Name</Label>
                      <Input id="appName" defaultValue="WaterDrop Marketplace" className="rounded-xl h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supportEmail">Global Support Email</Label>
                      <Input id="supportEmail" defaultValue="support@waterdrop.com" className="rounded-xl h-11" />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-bold">Maintenance Mode</Label>
                      <p className="text-sm text-slate-500">Temporarily disable customer ordering for system updates.</p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-bold">Public Vendor Registration</Label>
                      <p className="text-sm text-slate-500">Allow new businesses to sign up without an invite.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="bg-slate-50 border-b p-6">
                  <CardTitle className="text-lg">Delivery Parameters</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="maxRadius">Max Delivery Radius (km)</Label>
                      <Input id="maxRadius" type="number" defaultValue="25" className="rounded-xl h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="buffer">Buffer Time (mins)</Label>
                      <Input id="buffer" type="number" defaultValue="5" className="rounded-xl h-11" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="financials" className="mt-0 space-y-6">
              <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="bg-emerald-50 border-b border-emerald-100 p-6">
                  <CardTitle className="text-lg text-emerald-900">Revenue & Commissions</CardTitle>
                  <CardDescription className="text-emerald-700/70">Define fixed platform cuts per item type sold.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="bagCommission">Commission per Sachet Bag (₦)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 h-4 w-4 text-slate-400 font-bold">₦</span>
                        <Input id="bagCommission" type="number" defaultValue="100" className="pl-10 rounded-xl h-11" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="refillCommission">Commission per Dispenser Refill (₦)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 h-4 w-4 text-slate-400 font-bold">₦</span>
                        <Input id="refillCommission" type="number" defaultValue="500" className="pl-10 rounded-xl h-11" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="minOrder">Min. Order Value (₦)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 h-4 w-4 text-slate-400 font-bold">₦</span>
                        <Input id="minOrder" type="number" defaultValue="1000" className="pl-10 rounded-xl h-11" />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label className="text-sm font-bold uppercase tracking-widest text-slate-400">Fixed Fees</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="baseDelivery">Base Delivery Fee (₦)</Label>
                        <Input id="baseDelivery" type="number" defaultValue="500" className="rounded-xl h-11" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="priorityFee">Priority Surcharge (₦)</Label>
                        <Input id="priorityFee" type="number" defaultValue="1000" className="rounded-xl h-11" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="compliance" className="mt-0 space-y-6">
              <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="bg-amber-50 border-b border-amber-100 p-6">
                  <CardTitle className="text-lg text-amber-900">Verification Policies</CardTitle>
                  <CardDescription className="text-amber-700/70">Rules for onboarding factories and drivers.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-bold">Auto-Approve Vendors</Label>
                      <p className="text-sm text-slate-500">Allow vendors to go live instantly after email verification.</p>
                    </div>
                    <Switch />
                  </div>
                  
                  <Separator />

                  <div className="space-y-4">
                    <Label className="text-sm font-bold">Mandatory Documents</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { id: 'nafdac', label: 'NAFDAC Certification', checked: true },
                        { id: 'cac', label: 'CAC Registration', checked: true },
                        { id: 'tax', label: 'Tax ID (TIN)', checked: true },
                        { id: 'utility', label: 'Utility Bill', checked: false },
                      ].map((doc) => (
                        <div key={doc.id} className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                          <Switch defaultChecked={doc.checked} />
                          <span className="text-sm font-medium">{doc.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="infrastructure" className="mt-0 space-y-6">
              <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="bg-slate-900 text-white p-6">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Server className="h-5 w-5 text-primary" /> API & Services
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm font-bold uppercase text-slate-400 tracking-tighter">
                      <span>Google Maps API</span>
                      <span className="text-emerald-500">Connected</span>
                    </div>
                    <Input disabled value="AIzaSy...X4y8Z" className="bg-slate-50 font-mono text-xs h-11" />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm font-bold uppercase text-slate-400 tracking-tighter">
                      <span>Payment Gateway</span>
                      <span className="text-emerald-500">Active</span>
                    </div>
                    <Input disabled value="sk_live_...9921" className="bg-slate-50 font-mono text-xs h-11" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>

          <div className="space-y-8">
            <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
              <CardHeader className="p-6 border-b">
                <CardTitle className="text-lg">Platform Health</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                    <span>CPU Usage</span>
                    <span>12%</span>
                  </div>
                  <Progress value={12} className="h-1.5" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                    <span>Memory</span>
                    <span>42%</span>
                  </div>
                  <Progress value={42} className="h-1.5" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                    <span>Cloud Storage</span>
                    <span>82%</span>
                  </div>
                  <Progress value={82} className="h-1.5" />
                </div>
                
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[10px] font-bold text-emerald-800 uppercase">All nodes operational</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-3xl bg-slate-900 text-white p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Emergency Protocol</h4>
                  <p className="text-[10px] text-slate-400">Lock all transactions</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Activating this mode will freeze all payouts and prevent any new orders from being processed. Only use in case of security breach.
              </p>
              <Button variant="destructive" className="w-full rounded-xl h-11 font-bold">
                PLATFORM LOCKDOWN
              </Button>
            </Card>

            <div className="p-6 rounded-3xl border-2 border-dashed border-slate-200 text-center">
              <Database className="h-8 w-8 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-900 text-sm">System Logs</h4>
              <p className="text-xs text-slate-500 mt-1 mb-4">View detailed server and event logs for debugging.</p>
              <Button variant="outline" className="w-full rounded-xl h-10 text-xs">
                Open Log Viewer
              </Button>
            </div>
          </div>
        </div>
      </Tabs>
    </div>
  );
}