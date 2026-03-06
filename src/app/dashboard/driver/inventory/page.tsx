
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package, Save, Plus, Minus, Info } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function DriverInventoryUpdatePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loadedBags, setLoadedBags] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const savedInventory = localStorage.getItem('driver_loaded_bags');
    if (savedInventory) {
      setLoadedBags(parseInt(savedInventory));
    }
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API delay
    setTimeout(() => {
      localStorage.setItem('driver_loaded_bags', loadedBags.toString());
      toast({
        title: "Inventory Updated",
        description: `Your loaded stock has been set to ${loadedBags} units.`
      });
      setIsSaving(false);
      router.push('/dashboard/driver');
    }, 800);
  };

  const adjustQuantity = (amount: number) => {
    setLoadedBags(prev => Math.max(0, prev + amount));
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold font-headline text-foreground">Update Inventory</h1>
          <p className="text-muted-foreground text-sm">Log the total units currently loaded in your vehicle.</p>
        </div>
      </div>

      <Card className="border-none shadow-xl rounded-[32px] overflow-hidden">
        <CardHeader className="bg-primary p-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Package className="h-8 w-8" />
            <CardTitle className="text-2xl">Loaded Units</CardTitle>
          </div>
          <CardDescription className="text-primary-foreground/80">
            Ensure this number matches the actual stock in your car to avoid delivery delays.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8 text-center">
          <div className="flex items-center justify-center gap-8">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-16 w-16 rounded-2xl border-2 hover:bg-muted"
              onClick={() => adjustQuantity(-5)}
            >
              <Minus className="h-8 w-8 text-muted-foreground" />
            </Button>
            
            <div className="space-y-2">
              <Input 
                type="number" 
                value={loadedBags}
                onChange={(e) => setLoadedBags(parseInt(e.target.value) || 0)}
                className="h-24 w-32 text-center text-5xl font-bold rounded-3xl border-4 focus:border-primary transition-all bg-muted/30"
              />
              <Label className="text-xs uppercase font-bold text-muted-foreground tracking-widest">Total Units</Label>
            </div>

            <Button 
              variant="outline" 
              size="icon" 
              className="h-16 w-16 rounded-2xl border-2 hover:bg-muted"
              onClick={() => adjustQuantity(5)}
            >
              <Plus className="h-8 w-8 text-primary" />
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[10, 20, 50].map((val) => (
              <Button 
                key={val} 
                variant="ghost" 
                className="h-12 rounded-xl bg-muted/50 hover:bg-primary/10 hover:text-primary font-bold"
                onClick={() => setLoadedBags(val)}
              >
                Set to {val}
              </Button>
            ))}
          </div>

          <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex gap-3 text-left">
            <Info className="h-5 w-5 text-primary shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Updates to inventory are reflected immediately on your dashboard. Your vendor can see these levels to optimize dispatching.
            </p>
          </div>
        </CardContent>
        <CardFooter className="p-8 pt-0">
          <Button 
            className="w-full h-16 rounded-2xl text-xl font-bold shadow-xl shadow-primary/20 gap-2"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : (
              <>
                <Save className="h-6 w-6" /> Save Inventory
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
