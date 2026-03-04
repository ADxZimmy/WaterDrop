
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Plus, Trash2, ShieldCheck, Wallet } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const initialCards = [
  { id: 1, type: 'Visa', last4: '4452', expiry: '12/26', isDefault: true },
  { id: 2, type: 'Mastercard', last4: '8810', expiry: '08/25', isDefault: false },
];

export default function CustomerPaymentsSettingsPage() {
  const [cards, setCards] = useState(initialCards);
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    setCards(cards.filter(c => id !== c.id));
    toast({
      title: "Payment Method Removed",
      description: "Your card has been securely deleted from our system."
    });
  };

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/customer/settings">
              <Button variant="ghost" size="icon" className="rounded-xl">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold font-headline">Payment Methods</h1>
          </div>
          <Button size="sm" className="rounded-xl h-9 gap-2 shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4" /> Add Card
          </Button>
        </div>

        <div className="space-y-4">
          {cards.map((card) => (
            <Card key={card.id} className="border-none shadow-sm overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-16 bg-muted rounded-xl flex items-center justify-center shrink-0 border border-border">
                    <span className="font-bold italic text-primary">{card.type}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-sm">•••• •••• •••• {card.last4}</h4>
                      {card.isDefault && <Badge className="text-[10px] h-4 px-1.5 bg-primary/10 text-primary border-none">Default</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">Expires {card.expiry}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(card.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8 border-none bg-accent/5 p-6 rounded-3xl border border-accent/10">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm">Secure Payments</h4>
              <p className="text-xs text-muted-foreground">Your payment details are encrypted and securely stored by Stripe.</p>
            </div>
          </div>
        </Card>

        <div className="mt-8 space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground px-2">Other Wallets</h3>
          <Button variant="outline" className="w-full h-14 rounded-2xl justify-between px-6 border-muted hover:bg-muted/50 text-foreground transition-all">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-black rounded-lg flex items-center justify-center text-white">
                <span className="font-bold text-xs">Pay</span>
              </div>
              <span className="font-bold text-sm">Apple Pay</span>
            </div>
            <Badge variant="outline" className="text-[10px] border-muted">Connect</Badge>
          </Button>
          <Button variant="outline" className="w-full h-14 rounded-2xl justify-between px-6 border-muted hover:bg-muted/50 text-foreground transition-all">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-[#4285F4] rounded-lg flex items-center justify-center text-white">
                <span className="font-bold text-xs">G</span>
              </div>
              <span className="font-bold text-sm">Google Pay</span>
            </div>
            <Badge variant="outline" className="text-[10px] border-muted">Connect</Badge>
          </Button>
        </div>
      </div>
    </div>
  );
}
