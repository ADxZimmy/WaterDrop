"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Percent, Save, Info, Truck, DollarSign } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function DriverCommissionsSettingsPage() {
  const { toast } = useToast();
  const [commissionType, setCommissionType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState(15);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Commission Rates Updated",
        description: `Drivers will now receive ${value}${commissionType === 'percentage' ? '%' : ' ₦'} per delivery.`,
      });
    }, 1000);
  };

  const settingLinks = [
    { name: "Store Profile", icon: Truck, href: "/dashboard/vendor/settings" },
    { name: "Driver Commissions", icon: Percent, href: "/dashboard/vendor/settings/commissions", active: true },
    { name: "Account", icon: Save, href: "/dashboard/vendor/settings/account" },
    { name: "Notifications", icon: Info, href: "/dashboard/vendor/settings/notifications" },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10 text-foreground">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/vendor/settings">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold font-headline">Driver Commissions</h1>
          <p className="text-muted-foreground">Set how much your drivers earn for each successful delivery.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="md:col-span-1">
          <nav className="space-y-1">
            <Link href="/dashboard/vendor/settings">
              <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl mb-1 text-muted-foreground hover:bg-muted">
                <Truck className="h-5 w-5" />
                Store Profile
              </Button>
            </Link>
            <Link href="/dashboard/vendor/settings/commissions">
              <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl mb-1 bg-primary/10 text-primary font-bold">
                <Percent className="h-5 w-5" />
                Driver Commissions
              </Button>
            </Link>
            <Link href="/dashboard/vendor/settings/account">
              <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl mb-1 text-muted-foreground hover:bg-muted">
                <Save className="h-5 w-5" />
                Account
              </Button>
            </Link>
          </nav>
        </aside>

        <div className="md:col-span-3 space-y-8">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-primary/5 p-8 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Percent className="h-5 w-5 text-primary" /> Payout Structure
              </CardTitle>
              <CardDescription>Choose between a percentage-based or a fixed flat fee for your fleet.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant={commissionType === 'percentage' ? 'default' : 'outline'}
                  className="flex-1 h-16 rounded-2xl gap-3"
                  onClick={() => { setCommissionType('percentage'); setValue(15); }}
                >
                  <Percent className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-bold">Percentage</p>
                    <p className="text-[10px] opacity-70 uppercase font-bold tracking-tighter">Based on order total</p>
                  </div>
                </Button>
                <Button 
                  variant={commissionType === 'fixed' ? 'default' : 'outline'}
                  className="flex-1 h-16 rounded-2xl gap-3"
                  onClick={() => { setCommissionType('fixed'); setValue(200); }}
                >
                  <DollarSign className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-bold">Fixed Fee</p>
                    <p className="text-[10px] opacity-70 uppercase font-bold tracking-tighter">Per trip completed</p>
                  </div>
                </Button>
              </div>

              <Separator />

              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <Label className="text-lg font-bold">Rate Value</Label>
                  <div className="text-right">
                    <span className="text-4xl font-bold text-primary">
                      {commissionType === 'fixed' ? '₦' : ''}{value}{commissionType === 'percentage' ? '%' : ''}
                    </span>
                    <p className="text-xs text-muted-foreground font-medium uppercase mt-1">Earnings per delivery</p>
                  </div>
                </div>

                {commissionType === 'percentage' ? (
                  <div className="py-4">
                    <Slider 
                      value={[value]} 
                      onValueChange={(vals) => setValue(vals[0])} 
                      max={50} 
                      step={1} 
                      className="py-4"
                    />
                    <div className="flex justify-between text-xs font-bold text-muted-foreground px-1">
                      <span>0%</span>
                      <span>25%</span>
                      <span>50%</span>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground text-xl">₦</span>
                    <Input 
                      type="number" 
                      value={value} 
                      onChange={(e) => setValue(parseInt(e.target.value) || 0)}
                      className="h-16 pl-10 text-2xl font-bold rounded-2xl"
                    />
                  </div>
                )}
              </div>

              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex gap-3">
                <Info className="h-5 w-5 text-primary shrink-0" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  These changes will apply to all <strong>active</strong> and <strong>future</strong> deliveries. Drivers will be notified of the rate change via the Driver Portal.
                </p>
              </div>
            </CardContent>
            <CardFooter className="p-8 border-t flex justify-end bg-muted/5">
              <Button 
                className="rounded-xl px-10 h-12 shadow-lg shadow-primary/20 gap-2"
                onClick={handleSave}
                disabled={isSaving}
              >
                <Save className="h-4 w-4" /> {isSaving ? "Updating..." : "Save Commission Rules"}
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="p-6 border-b">
              <CardTitle className="text-lg">Commission Exceptions</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="font-bold">Priority Surcharge Bonus</Label>
                  <p className="text-sm text-muted-foreground">Give drivers 100% of the priority delivery fee.</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
