"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, Save, User } from 'lucide-react';
import type { CustomerAccountPayload } from "@/lib/customer/account-types";
import { getPaymentMethodLabel } from "@/lib/orders/status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ListPageSkeleton } from "@/components/ui/loading-skeletons";
import { useToast } from "@/hooks/use-toast";

type ProfileFormState = {
  firstName: string;
  lastName: string;
  phone: string;
};

function getDisplayName(account: CustomerAccountPayload | null, form: ProfileFormState) {
  const fullName = [form.firstName.trim(), form.lastName.trim()].filter(Boolean).join(' ').trim();

  return fullName || [account?.profile.firstName, account?.profile.lastName].filter(Boolean).join(' ') || account?.profile.email || 'Customer';
}

function getInitials(account: CustomerAccountPayload | null, form: ProfileFormState) {
  const initials = `${form.firstName[0] ?? ''}${form.lastName[0] ?? ''}`.trim().toUpperCase();

  return initials || `${account?.profile.firstName?.[0] ?? ''}${account?.profile.lastName?.[0] ?? ''}`.trim().toUpperCase() || account?.profile.email.slice(0, 2).toUpperCase() || 'CU';
}

function getMemberSinceLabel(timestamp: number) {
  return new Date(timestamp).toLocaleDateString('en-NG', {
    month: 'short',
    year: 'numeric',
  });
}

export default function CustomerProfileSettingsPage() {
  const [account, setAccount] = useState<CustomerAccountPayload | null>(null);
  const [form, setForm] = useState<ProfileFormState>({
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    const loadAccount = async () => {
      try {
        const response = await fetch('/api/customer/account', { method: 'GET' });
        if (!response.ok) {
          throw new Error('Unable to load your profile.');
        }

        const payload: CustomerAccountPayload = await response.json();
        if (isMounted) {
          setAccount(payload);
          setForm({
            firstName: payload.profile.firstName ?? '',
            lastName: payload.profile.lastName ?? '',
            phone: payload.profile.phone ?? '',
          });
        }
      } catch (error) {
        if (isMounted) {
          setAccount(null);
          toast({
            title: 'Profile unavailable',
            description: error instanceof Error ? error.message : 'Unable to load your profile.',
            variant: 'destructive',
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadAccount();
    return () => {
      isMounted = false;
    };
  }, [toast]);

  const helperText = useMemo(() => {
    if (!account) {
      return '';
    }

    return `${account.summary.totalOrders} order${account.summary.totalOrders === 1 ? '' : 's'} placed • ${account.summary.savedAddressesCount} saved address${account.summary.savedAddressesCount === 1 ? '' : 'es'}${
      account.summary.preferredPaymentMethod
        ? ` • ${getPaymentMethodLabel(account.summary.preferredPaymentMethod)} default`
        : ''
    }`;
  }, [account]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast({
        title: 'Missing information',
        description: 'First name and last name are required.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch('/api/customer/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          phone: form.phone.trim(),
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? 'Unable to update your profile.');
      }

      const payload: CustomerAccountPayload = await response.json();
      setAccount(payload);
      setForm({
        firstName: payload.profile.firstName ?? '',
        lastName: payload.profile.lastName ?? '',
        phone: payload.profile.phone ?? '',
      });
      toast({
        title: 'Profile Updated',
        description: 'Your account details have been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: error instanceof Error ? error.message : 'Unable to update your profile.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <ListPageSkeleton rows={3} />;
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-background pb-10">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Card className="border-none shadow-sm p-8 text-center">
            <CardContent className="p-0 space-y-4">
              <h1 className="text-2xl font-bold font-headline">Profile unavailable</h1>
              <p className="text-sm text-muted-foreground">
                We could not load your customer profile right now.
              </p>
              <Button className="rounded-xl" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/customer/settings">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold font-headline">My Profile</h1>
        </div>

        <form onSubmit={handleSave}>
          <Card className="border-none shadow-xl rounded-[32px] overflow-hidden">
            <CardHeader className="bg-primary/5 p-8 text-center flex flex-col items-center">
              <Avatar className="h-28 w-28 border-4 border-white shadow-xl">
                <AvatarFallback>{getInitials(account, form)}</AvatarFallback>
              </Avatar>
              <CardTitle className="mt-4 text-xl">{getDisplayName(account, form)}</CardTitle>
              <CardDescription>Customer account since {getMemberSinceLabel(account.profile.createdAt)}</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border border-border/60 shadow-none rounded-2xl">
                  <CardContent className="p-4 text-center space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Orders</p>
                    <p className="text-lg font-bold text-primary">{account.summary.totalOrders}</p>
                  </CardContent>
                </Card>
                <Card className="border border-border/60 shadow-none rounded-2xl">
                  <CardContent className="p-4 text-center space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Addresses</p>
                    <p className="text-lg font-bold text-accent">{account.summary.savedAddressesCount}</p>
                  </CardContent>
                </Card>
                <Card className="border border-border/60 shadow-none rounded-2xl">
                  <CardContent className="p-4 text-center space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Default Payment</p>
                    <p className="text-sm font-bold text-primary">
                      {account.summary.preferredPaymentMethod
                        ? getPaymentMethodLabel(account.summary.preferredPaymentMethod)
                        : 'Not Set'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={form.firstName}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, firstName: event.target.value }))
                    }
                    className="h-12 rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={form.lastName}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, lastName: event.target.value }))
                    }
                    className="h-12 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={account.profile.email}
                    readOnly
                    disabled
                    className="pl-10 h-12 rounded-xl bg-muted/40 text-muted-foreground"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Email changes are not part of the current MVP flow yet.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, phone: event.target.value }))
                    }
                    className="pl-10 h-12 rounded-xl"
                    placeholder="+234..."
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-muted/40 p-4 flex items-start gap-3">
                <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Account snapshot</p>
                  <p className="text-xs text-muted-foreground mt-1">{helperText}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-8 pt-0">
              <Button
                type="submit"
                className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20 gap-2"
                disabled={isSaving}
              >
                <Save className="h-5 w-5" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}
