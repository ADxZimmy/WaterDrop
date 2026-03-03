
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Wallet, Building2, CreditCard, CheckCircle2, ChevronRight, DollarSign } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function WithdrawalPage() {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('100.00');

  if (step === 3) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6 animate-bounce">
          <CheckCircle2 className="h-12 w-12" />
        </div>
        <h1 className="text-3xl font-bold font-headline mb-2">Request Submitted!</h1>
        <p className="text-muted-foreground mb-8 max-w-xs">Your withdrawal of ${amount} is being processed and will arrive in your bank account within 24 hours.</p>
        <Link href="/dashboard/driver/earnings">
          <Button className="w-full max-w-xs h-12 rounded-xl">Back to Earnings</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/driver/earnings">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold font-headline">Withdraw Funds</h1>
      </div>

      <div className="space-y-6">
        {step === 1 && (
          <Card className="border-none shadow-xl rounded-3xl overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
            <CardHeader className="bg-primary text-white p-8">
              <CardTitle className="text-lg">Enter Amount</CardTitle>
              <CardDescription className="text-primary-foreground/80">Current balance available: $452.80</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground" />
                <Input 
                  className="h-20 text-4xl font-bold pl-14 rounded-2xl border-2 focus:border-primary transition-all" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  type="number"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {['50.00', '100.00', '250.00'].map((val) => (
                  <Button 
                    key={val} 
                    variant="outline" 
                    className="h-12 rounded-xl font-bold"
                    onClick={() => setAmount(val)}
                  >
                    ${val}
                  </Button>
                ))}
              </div>
            </CardContent>
            <CardFooter className="p-8 pt-0">
              <Button className="w-full h-14 rounded-2xl text-lg gap-2" onClick={() => setStep(2)}>
                Continue <ChevronRight className="h-5 w-5" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 2 && (
          <Card className="border-none shadow-xl rounded-3xl overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
            <CardHeader className="bg-primary text-white p-8">
              <CardTitle className="text-lg">Select Bank Account</CardTitle>
              <CardDescription className="text-primary-foreground/80">Where should we send your money?</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <RadioGroup defaultValue="bank1" className="space-y-4">
                <Label className="flex items-center justify-between p-6 bg-white rounded-2xl border-2 cursor-pointer hover:border-primary/50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold">Chase Savings</p>
                      <p className="text-xs text-muted-foreground">Ending in •••• 4452</p>
                    </div>
                  </div>
                  <RadioGroupItem value="bank1" />
                </Label>
                <Label className="flex items-center justify-between p-6 bg-white rounded-2xl border-2 cursor-pointer hover:border-primary/50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-muted rounded-xl flex items-center justify-center text-muted-foreground">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold text-muted-foreground">Add New Account</p>
                      <p className="text-xs text-muted-foreground">Link a new bank via Plaid</p>
                    </div>
                  </div>
                  <RadioGroupItem value="new" disabled />
                </Label>
              </RadioGroup>
            </CardContent>
            <CardFooter className="p-8 pt-0 flex gap-3">
              <Button variant="outline" className="h-14 rounded-2xl px-8" onClick={() => setStep(1)}>Back</Button>
              <Button className="flex-1 h-14 rounded-2xl text-lg gap-2" onClick={() => setStep(3)}>
                Withdraw ${amount} <CheckCircle2 className="h-5 w-5" />
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
