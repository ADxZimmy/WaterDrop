"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2, Plus, Minus, CreditCard, Truck, MapPin, CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const cartItems = [
  { id: 1, name: "Premium Bottled Water (Box of 12)", price: 12.50, qty: 1, vendor: "Aqua Pure" },
  { id: 2, name: "Dispenser Refill 19L", price: 8.00, qty: 1, vendor: "Aqua Pure" },
];

export default function CartPage() {
  const [step, setStep] = sea<'cart' | 'checkout' | 'success'>('cart');
  
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const deliveryFee = 2.50;
  const total = subtotal + deliveryFee;

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6 animate-bounce">
          <CheckCircle2 className="h-12 w-12" />
        </div>
        <h1 className="text-3xl font-bold font-headline mb-2">Order Confirmed!</h1>
        <p className="text-muted-foreground mb-8 max-w-xs">Your water is being prepared and will be delivered in approximately 20 minutes.</p>
        <div className="space-y-3 w-full max-w-xs">
          <Link href="/dashboard/customer/orders">
            <Button className="w-full h-12 rounded-xl">Track Order</Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full h-12 rounded-xl">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => step === 'checkout' ? setStep('cart') : window.history.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold font-headline">{step === 'cart' ? 'Shopping Cart' : 'Checkout'}</h1>
        </div>

        {step === 'cart' ? (
          <div className="space-y-6">
            <div className="space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="border-none shadow-sm overflow-hidden">
                  <CardContent className="p-4 flex gap-4">
                    <div className="h-20 w-20 bg-muted rounded-xl shrink-0" />
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm">{item.name}</h4>
                          <p className="text-xs text-muted-foreground">{item.vendor}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="font-bold text-primary">${item.price.toFixed(2)}</p>
                        <div className="flex items-center gap-3 bg-muted rounded-lg p-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md">
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-bold w-4 text-center">{item.qty}</span>
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md">
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-none shadow-lg mt-8 p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="font-medium">${deliveryFee.toFixed(2)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </div>
              <Button className="w-full h-14 rounded-2xl text-lg shadow-lg shadow-primary/20" onClick={() => setStep('checkout')}>
                Proceed to Checkout
              </Button>
            </Card>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="space-y-6">
              <section>
                <h3 className="font-bold mb-4 flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Delivery Address</h3>
                <Card className="border-none shadow-sm p-4 bg-primary/5 border border-primary/10">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-sm">Home</p>
                      <p className="text-sm text-muted-foreground">123 Ocean View Dr, Blue City, 90210</p>
                    </div>
                    <Button variant="link" size="sm" className="h-auto p-0 text-primary">Change</Button>
                  </div>
                </Card>
              </section>

              <section>
                <h3 className="font-bold mb-4 flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" /> Payment Method</h3>
                <RadioGroup defaultValue="card" className="space-y-3">
                  <Label className="flex items-center justify-between p-4 bg-white rounded-xl border cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <div className="space-y-0.5">
                        <p className="font-bold text-sm">Credit / Debit Card</p>
                        <p className="text-xs text-muted-foreground">Ending in 4452</p>
                      </div>
                    </div>
                    <RadioGroupItem value="card" />
                  </Label>
                  <Label className="flex items-center justify-between p-4 bg-white rounded-xl border cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center text-white text-[10px]">$</div>
                      <p className="font-bold text-sm">Cash on Delivery</p>
                    </div>
                    <RadioGroupItem value="cash" />
                  </Label>
                </RadioGroup>
              </section>

              <section>
                <h3 className="font-bold mb-4 flex items-center gap-2"><Truck className="h-5 w-5 text-primary" /> Delivery Options</h3>
                <Card className="border-none shadow-sm p-4">
                  <div className="flex justify-between items-center">
                    <div className="space-y-0.5">
                      <p className="font-bold text-sm">Standard Delivery</p>
                      <p className="text-xs text-muted-foreground">Arriving in 15-25 mins</p>
                    </div>
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10">Free</Badge>
                  </div>
                </Card>
              </section>
            </div>

            <Card className="border-none shadow-lg p-6 space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">Total Amount</span>
                <span className="text-2xl font-bold text-primary">${total.toFixed(2)}</span>
              </div>
              <Button className="w-full h-14 rounded-2xl text-lg shadow-lg shadow-primary/20" onClick={() => setStep('success')}>
                Place Order
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
