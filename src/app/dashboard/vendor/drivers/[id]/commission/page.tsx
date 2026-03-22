"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Percent, Save, Info, DollarSign } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function DriverIndividualCommissionPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [driverName, setDriverName] = useState("Driver");
  
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
        const response = await fetch(`/api/vendor/drivers/${params.id}/commission`, {
          method: "GET",
        });
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(payload?.error ?? "Unable to load driver commission settings.");
        }

        if (isMounted) {
          setDriverName(payload?.driver?.name ?? "Driver");
          const config = payload?.override ?? payload?.effectiveConfig;
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
                : "Unable to load driver commission settings.",
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
  }, [params.id, toast]);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const response = await fetch(`/api/vendor/drivers/${params.id}/commission`, {
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
        throw new Error(payload?.error ?? "Unable to save driver commission settings.");
      }

      setIsSaving(false);
      toast({
        title: "Commission Rates Updated",
        description: `Individual rates for ${driverName} have been successfully saved.`,
      });
      router.push(`/dashboard/vendor/drivers/${params.id}`);
    } catch (error) {
      setIsSaving(false);
      toast({
        title: "Save failed",
        description:
          error instanceof Error
            ? error.message
            : "Unable to save driver commission settings.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-sm text-muted-foreground">
        Loading driver commission settings...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 text-foreground">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold font-headline">Individual Commission</h1>
          <p className="text-muted-foreground">Set custom delivery rates for this specific driver.</p>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-primary/5 border border-primary/10">
        <CardContent className="p-6 flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-white shadow-md">
            <AvatarImage src={`https://picsum.photos/seed/${params.id}/100`} />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-xl font-bold">{driverName}</h3>
            <p className="text-sm text-muted-foreground">ID: DRV-{params.id}</p>
          </div>
          <Badge className="ml-auto bg-primary text-white border-none px-3">Custom Rates</Badge>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-8">
        {/* Bags of Water Section */}
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardHeader className="bg-primary/5 p-8 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Percent className="h-5 w-5 text-primary" /> Bags of Water
            </CardTitle>
            <CardDescription>Individual sachet bags commission for this driver.</CardDescription>
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
            <CardDescription>Commission structure for cases or boxes for this driver.</CardDescription>
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
          <CardContent className="p-8">
            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex gap-3">
              <Info className="h-5 w-5 text-primary shrink-0" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                These rates will override your global store commission settings for this driver specifically.
              </p>
            </div>
          </CardContent>
          <CardFooter className="p-8 border-t flex justify-end bg-muted/5 gap-3">
            <Button variant="ghost" onClick={() => router.back()} className="rounded-xl h-12 px-8">Cancel</Button>
            <Button 
              className="rounded-xl px-10 h-12 shadow-lg shadow-primary/20 gap-2"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save className="h-4 w-4" /> {isSaving ? "Updating..." : "Save Individual Rates"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}