
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Plus, Trash2, Edit2, Home, Briefcase, Map } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const initialAddresses = [
  { id: 1, label: 'Home', address: '123 Ocean View Dr, Blue City, 90210', icon: Home, isDefault: true },
  { id: 2, label: 'Office', address: '88 Tech Way, Business Park, 90211', icon: Briefcase, isDefault: false },
];

export default function CustomerAddressesSettingsPage() {
  const [addresses, setAddresses] = useState(initialAddresses);
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    setAddresses(addresses.filter(a => id !== a.id));
    toast({
      title: "Address Deleted",
      description: "The selected delivery address has been removed."
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
            <h1 className="text-2xl font-bold font-headline">My Addresses</h1>
          </div>
          <Button size="sm" className="rounded-xl h-9 gap-2 shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4" /> Add New
          </Button>
        </div>

        <div className="space-y-4">
          {addresses.map((addr) => (
            <Card key={addr.id} className="border-none shadow-sm overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                    <addr.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-sm">{addr.label}</h4>
                      {addr.isDefault && <Badge className="text-[10px] h-4 px-1.5 bg-green-100 text-green-700 border-none">Default</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{addr.address}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(addr.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8 border-2 border-dashed border-muted bg-transparent p-10 rounded-[32px] text-center">
          <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
            <Map className="h-8 w-8" />
          </div>
          <h3 className="font-bold text-lg">Add more locations?</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-6">Save your office, friend's house, or gym for even faster water ordering.</p>
          <Button variant="outline" className="rounded-xl px-8 h-11 border-primary/20 text-primary hover:bg-primary/5">
            Add Delivery Address
          </Button>
        </Card>
      </div>
    </div>
  );
}
