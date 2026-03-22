"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CreditCard, ShieldCheck, Truck } from 'lucide-react';
import type { PaymentMethod } from "@/lib/domain/schemas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { getPaymentMethodLabel } from "@/lib/orders/status";

type CustomerPreferencesResponse = {
  preferences: null | {
    preferredPaymentMethod: PaymentMethod;
  };
};

export default function CustomerPaymentsSettingsPage() {
  const [preferredPaymentMethod, setPreferredPaymentMethod] = useState<PaymentMethod>('cod');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    const loadPaymentPreference = async () => {
      try {
        const response = await fetch('/api/customer/preferences', { method: 'GET' });
        if (!response.ok) {
          throw new Error('Unable to load payment preference.');
        }

        const payload: CustomerPreferencesResponse = await response.json();
        if (isMounted) {
          setPreferredPaymentMethod(payload.preferences?.preferredPaymentMethod ?? 'cod');
        }
      } catch (error) {
        if (isMounted) {
          setPreferredPaymentMethod('cod');
          toast({
            title: 'Preferences unavailable',
            description: error instanceof Error ? error.message : 'Unable to load payment preference.',
            variant: 'destructive',
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadPaymentPreference();
    return () => {
      isMounted = false;
    };
  }, [toast]);

  const handlePaymentMethodChange = async (value: string) => {
    const nextMethod = value as PaymentMethod;
    const previousMethod = preferredPaymentMethod;
    setPreferredPaymentMethod(nextMethod);
    setIsSaving(true);

    try {
      const response = await fetch('/api/customer/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferredPaymentMethod: nextMethod }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? 'Unable to save payment preference.');
      }

      toast({
        title: 'Payment Preference Saved',
        description: `${getPaymentMethodLabel(nextMethod)} is now your default checkout method.`,
      });
    } catch (error) {
      setPreferredPaymentMethod(previousMethod);
      toast({
        title: 'Save Failed',
        description: error instanceof Error ? error.message : 'Unable to save payment preference.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/customer/settings">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold font-headline">Payment Methods</h1>
            <p className="text-sm text-muted-foreground">Choose the default payment mode used during checkout.</p>
          </div>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading payment preferences...</p>
        ) : (
          <RadioGroup
            value={preferredPaymentMethod}
            onValueChange={handlePaymentMethodChange}
            className="space-y-4"
          >
            <Label className="block cursor-pointer">
              <Card className="border-none shadow-sm overflow-hidden">
                <CardContent className="p-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                      <Truck className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm">{getPaymentMethodLabel('cod')}</h4>
                        {preferredPaymentMethod === 'cod' && (
                          <Badge className="text-[10px] h-4 px-1.5 bg-primary/10 text-primary border-none">
                            Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        The customer pays when the order is delivered.
                      </p>
                    </div>
                  </div>
                  <RadioGroupItem value="cod" />
                </CardContent>
              </Card>
            </Label>

            <Label className="block cursor-pointer">
              <Card className="border-none shadow-sm overflow-hidden">
                <CardContent className="p-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm">{getPaymentMethodLabel('manual_transfer')}</h4>
                        {preferredPaymentMethod === 'manual_transfer' && (
                          <Badge className="text-[10px] h-4 px-1.5 bg-primary/10 text-primary border-none">
                            Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        The customer receives transfer instructions after vendor confirmation.
                      </p>
                    </div>
                  </div>
                  <RadioGroupItem value="manual_transfer" />
                </CardContent>
              </Card>
            </Label>
          </RadioGroup>
        )}

        <Card className="mt-8 border-none bg-accent/5 p-6 rounded-3xl border border-accent/10">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm">MVP Payment Scope</h4>
              <p className="text-xs text-muted-foreground">
                Card wallets are not part of MVP v1 yet. WaterDrop currently supports only cash on delivery and manual transfer.
              </p>
            </div>
          </div>
        </Card>

        {isSaving && (
          <p className="mt-4 text-xs text-muted-foreground">Saving your preference...</p>
        )}
      </div>
    </div>
  );
}
