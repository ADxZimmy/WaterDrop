"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Briefcase, Home, Map, Plus, Trash2 } from 'lucide-react';
import type { CustomerAddress } from "@/lib/domain/schemas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ListPageSkeleton } from "@/components/ui/loading-skeletons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCustomerAddress, normalizeCustomerAddresses } from "@/lib/customer/preferences";
import { useToast } from "@/hooks/use-toast";

type CustomerPreferencesResponse = {
  preferences: null | {
    addresses: CustomerAddress[];
  };
};

function getAddressIcon(label: string) {
  return label.toLowerCase().includes('office') ? Briefcase : Home;
}

export default function CustomerAddressesSettingsPage() {
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Nigeria',
  });
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    const loadAddresses = async () => {
      try {
        const response = await fetch('/api/customer/preferences', { method: 'GET' });
        if (!response.ok) {
          throw new Error('Unable to load saved addresses.');
        }

        const payload: CustomerPreferencesResponse = await response.json();
        if (isMounted) {
          setAddresses(payload.preferences?.addresses ?? []);
        }
      } catch (error) {
        if (isMounted) {
          setAddresses([]);
          toast({
            title: 'Addresses unavailable',
            description: error instanceof Error ? error.message : 'Unable to load saved addresses.',
            variant: 'destructive',
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadAddresses();
    return () => {
      isMounted = false;
    };
  }, [toast]);

  const saveAddresses = async (nextAddresses: CustomerAddress[], successMessage: string) => {
    const response = await fetch('/api/customer/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ addresses: normalizeCustomerAddresses(nextAddresses) }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.error ?? 'Unable to save addresses.');
    }

    const payload: CustomerPreferencesResponse = await response.json();
    setAddresses(payload.preferences?.addresses ?? []);
    toast({
      title: 'Addresses Updated',
      description: successMessage,
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await saveAddresses(
        addresses.filter((address) => address.id !== id),
        'The selected delivery address has been removed.'
      );
    } catch (error) {
      toast({
        title: 'Delete Failed',
        description: error instanceof Error ? error.message : 'Unable to delete address.',
        variant: 'destructive',
      });
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await saveAddresses(
        addresses.map((address) => ({ ...address, isDefault: address.id === id })),
        'Your default delivery address has been updated.'
      );
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'Unable to update default address.',
        variant: 'destructive',
      });
    }
  };

  const handleAddAddress = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      await saveAddresses(
        [
          ...addresses,
          {
            id: crypto.randomUUID(),
            label: newAddress.label,
            street: newAddress.street,
            city: newAddress.city,
            state: newAddress.state,
            postalCode: newAddress.postalCode,
            country: newAddress.country,
            isDefault: addresses.length === 0,
          },
        ],
        'Your new delivery address has been saved.'
      );
      setNewAddress({
        label: 'Home',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'Nigeria',
      });
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: error instanceof Error ? error.message : 'Unable to save address.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/customer/settings">
              <Button variant="ghost" size="icon" className="rounded-xl">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold font-headline">My Addresses</h1>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-xl h-9 gap-2 shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4" /> Add New
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Delivery Address</DialogTitle>
                <DialogDescription>Save a new address for faster future checkout.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddAddress} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="label">Label</Label>
                  <Input
                    id="label"
                    value={newAddress.label}
                    onChange={(event) =>
                      setNewAddress((current) => ({ ...current, label: event.target.value }))
                    }
                    placeholder="Home"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="street">Street</Label>
                  <Input
                    id="street"
                    value={newAddress.street}
                    onChange={(event) =>
                      setNewAddress((current) => ({ ...current, street: event.target.value }))
                    }
                    placeholder="123 Blue Spring Rd"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={newAddress.city}
                      onChange={(event) =>
                        setNewAddress((current) => ({ ...current, city: event.target.value }))
                      }
                      placeholder="Lagos"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={newAddress.state}
                      onChange={(event) =>
                        setNewAddress((current) => ({ ...current, state: event.target.value }))
                      }
                      placeholder="Lagos State"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={newAddress.postalCode}
                      onChange={(event) =>
                        setNewAddress((current) => ({
                          ...current,
                          postalCode: event.target.value,
                        }))
                      }
                      placeholder="100001"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={newAddress.country}
                      onChange={(event) =>
                        setNewAddress((current) => ({ ...current, country: event.target.value }))
                      }
                      placeholder="Nigeria"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full rounded-xl">
                  Save Address
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <ListPageSkeleton rows={3} className="px-0 py-0" />
        ) : addresses.length > 0 ? (
          <div className="space-y-4">
            {addresses.map((address) => {
              const AddressIcon = getAddressIcon(address.label);

              return (
                <Card key={address.id} className="border-none shadow-sm overflow-hidden group">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                        <AddressIcon className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-sm">{address.label}</h4>
                          {address.isDefault && (
                            <Badge className="text-[10px] h-4 px-1.5 bg-green-100 text-green-700 border-none">
                              Default
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {formatCustomerAddress(address)}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        {!address.isDefault && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-lg"
                            onClick={() => void handleSetDefault(address.id)}
                          >
                            Make Default
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive self-end"
                          onClick={() => void handleDelete(address.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="border-2 border-dashed border-muted bg-transparent p-10 rounded-[32px] text-center">
            <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
              <Map className="h-8 w-8" />
            </div>
            <h3 className="font-bold text-lg">No saved addresses yet</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-6">
              Add your primary delivery location so checkout can use real saved data.
            </p>
            <Button variant="outline" className="rounded-xl px-8 h-11 border-primary/20 text-primary hover:bg-primary/5" onClick={() => setIsDialogOpen(true)}>
              Add Delivery Address
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
