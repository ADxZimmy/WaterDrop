"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Percent, Save, Info, DollarSign } from 'lucide-react';
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
  
  // State for Bags
  const [bagType, setBagType] = useState<'percentage' | 'fixed'>('percentage');
  const [bagValue, setBagValue] = useState(15);
  
  // State for Packs
  const [packType, setPackType] = useState<'percentage' | 'fixed'>('percentage');
  const [packValue, setPackValue] = useState(15);
  const [priorityFeeToDriver, setPriorityFeeToDriver] = useState(false);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadConfig = async () => {
      try {
        const response = await fetch("/api/vendor/commissions", { method: "GET" });
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(payload?.error ?? "Unable to load commission settings.");
        }

        if (isMounted) {
          const config = payload?.config;
          setBagType(config?.bagsRule?.mode ?? 'percentage');
          setBagValue(config?.bagsRule?.value ?? 15);
          setPackType(config?.bottledRule?.mode ?? 'percentage');
          setPackValue(config?.bottledRule?.value ?? 15);
          setPriorityFeeToDriver(Boolean(config?.priorityFeeToDriver));
        }
      } catch (error) {
        if (isMounted) {
          toast({
            title: "Commission settings unavailable",
            description:
              error instanceof Error
                ? error.message
                : "Unable to load commission settings.",
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadConfig();

    return () => {
      isMounted = false;
    };
  }, [toast]);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const response = await fetch("/api/vendor/commissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bagsRule: { mode: bagType, value: bagValue },
          bottledRule: { mode: packType, value: packValue },
          bulkRule: { mode: packType, value: packValue },
          otherRule: { mode: packType, value: packValue },
          priorityFeeToDriver,
        }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to save commission settings.");
      }

      setIsSaving(false);
      toast({
        title: "Commission Rates Updated",
        description: `Commission settings for bags and packs have been successfully saved.`,
      });
    } catch (error) {
      setIsSaving(false);
      toast({
        title: "Save failed",
        description:
          error instanceof Error ? error.message : "Unable to save commission settings.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-5xl mx-auto text-sm text-muted-foreground">
        Loading commission settings...
      </div>
    );
  }

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
          <p className="text-muted-foreground">Set how much your drivers earn for each successful delivery type.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="md:col-span-1">
          <nav className="space-y-1">
            {/* Store Profile and Account removed per user request to clean up sidebar when this section is active */}
            <Link href="/dashboard/vendor/settings/commissions">
              <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl mb-1 bg-primary/10 text-primary font-bold">
                <Percent className="h-5 w-5" />
                Driver Commissions
              </Button>
            </Link>
          </nav>
        </aside>

        <div className="md:col-span-3 space-y-8">
          {/* Bags of Water Section */}
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-primary/5 p-8 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Percent className="h-5 w-5 text-primary" /> Bags of Water
              </CardTitle>
              <CardDescription>Commission structure for individual sachet bags or bag bundles.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant={bagType === 'percentage' ? 'default' : 'outline'}
                  className="flex-1 h-16 rounded-2xl gap-3"
                  onClick={() => { setBagType('percentage'); setBagValue(15); }}
                >
                  <Percent className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-bold">Percentage</p>
                    <p className="text-[10px] opacity-70 uppercase font-bold tracking-tighter">Based on order total</p>
                  </div>
                </Button>
                <Button 
                  variant={bagType === 'fixed' ? 'default' : 'outline'}
                  className="flex-1 h-16 rounded-2xl gap-3"
                  onClick={() => { setBagType('fixed'); setBagValue(200); }}
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
                      {bagType === 'fixed' ? '₦' : ''}{bagValue}{bagType === 'percentage' ? '%' : ''}
                    </span>
                    <p className="text-xs text-muted-foreground font-medium uppercase mt-1">Earnings per bag</p>
                  </div>
                </div>

                {bagType === 'percentage' ? (
                  <div className="py-4">
                    <Slider 
                      value={[bagValue]} 
                      onValueChange={(vals) => setBagValue(vals[0])} 
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
                      value={bagValue} 
                      onChange={(e) => setBagValue(parseInt(e.target.value) || 0)}
                      className="h-16 pl-10 text-2xl font-bold rounded-2xl"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Packs of Bottled Water Section */}
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-primary/5 p-8 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Percent className="h-5 w-5 text-primary" /> Packs of Bottled Water
              </CardTitle>
              <CardDescription>Commission structure for cases or boxes of bottled water.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant={packType === 'percentage' ? 'default' : 'outline'}
                  className="flex-1 h-16 rounded-2xl gap-3"
                  onClick={() => { setPackType('percentage'); setPackValue(15); }}
                >
                  <Percent className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-bold">Percentage</p>
                    <p className="text-[10px] opacity-70 uppercase font-bold tracking-tighter">Based on order total</p>
                  </div>
                </Button>
                <Button 
                  variant={packType === 'fixed' ? 'default' : 'outline'}
                  className="flex-1 h-16 rounded-2xl gap-3"
                  onClick={() => { setPackType('fixed'); setPackValue(200); }}
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
                      {packType === 'fixed' ? '₦' : ''}{packValue}{packType === 'percentage' ? '%' : ''}
                    </span>
                    <p className="text-xs text-muted-foreground font-medium uppercase mt-1">Earnings per pack</p>
                  </div>
                </div>

                {packType === 'percentage' ? (
                  <div className="py-4">
                    <Slider 
                      value={[packValue]} 
                      onValueChange={(vals) => setPackValue(vals[0])} 
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
                      value={packValue} 
                      onChange={(e) => setPackValue(parseInt(e.target.value) || 0)}
                      className="h-16 pl-10 text-2xl font-bold rounded-2xl"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardContent className="p-8 space-y-6">
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex gap-3">
                <Info className="h-5 w-5 text-primary shrink-0" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  These changes will apply to all <strong>active</strong> and <strong>future</strong> deliveries. Drivers will be notified of the rate change via the Driver Portal.
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="font-bold">Priority Surcharge Bonus</Label>
                  <p className="text-sm text-muted-foreground">Give drivers 100% of the priority delivery fee.</p>
                </div>
                <Switch
                  checked={priorityFeeToDriver}
                  onCheckedChange={setPriorityFeeToDriver}
                />
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
        </div>
      </div>
    </div>
  );
}
