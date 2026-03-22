"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronRight,
  Droplets,
  LogOut,
  MapPin,
  Settings,
  ShoppingBag,
  Truck,
  Wallet,
} from 'lucide-react';
import type { CustomerAccountPayload } from "@/lib/customer/account-types";
import { getOrderStatusLabel, getPaymentMethodLabel } from "@/lib/orders/status";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuthSignOut } from "@/hooks/use-auth-sign-out";
import { useToast } from "@/hooks/use-toast";

function getDisplayName(account: CustomerAccountPayload | null) {
  const firstName = account?.profile.firstName?.trim() ?? '';
  const lastName = account?.profile.lastName?.trim() ?? '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();

  return fullName || account?.profile.email || 'Customer';
}

function getInitials(account: CustomerAccountPayload | null) {
  const firstInitial = account?.profile.firstName?.[0] ?? '';
  const lastInitial = account?.profile.lastName?.[0] ?? '';
  const initials = `${firstInitial}${lastInitial}`.trim().toUpperCase();

  return initials || account?.profile.email.slice(0, 2).toUpperCase() || 'CU';
}

function getMemberSinceLabel(timestamp: number) {
  return new Date(timestamp).toLocaleDateString('en-NG', {
    month: 'short',
    year: 'numeric',
  });
}

function getAccountBadgeLabel(account: CustomerAccountPayload | null) {
  if (!account) {
    return 'Customer Account';
  }

  if (account.summary.activeOrders > 0) {
    return 'Order In Progress';
  }

  if (account.summary.totalOrders > 0) {
    return 'Returning Customer';
  }

  return 'New Customer';
}

export default function CustomerDashboard() {
  const [account, setAccount] = useState<CustomerAccountPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isSigningOut, signOut } = useAuthSignOut();
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    const loadAccount = async () => {
      try {
        const response = await fetch('/api/customer/account', { method: 'GET' });
        if (!response.ok) {
          throw new Error('Unable to load your account.');
        }

        const payload: CustomerAccountPayload = await response.json();
        if (isMounted) {
          setAccount(payload);
        }
      } catch (error) {
        if (isMounted) {
          setAccount(null);
          toast({
            title: 'Account unavailable',
            description: error instanceof Error ? error.message : 'Unable to load your account.',
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

  const menuItems = useMemo(
    () => [
      {
        name: 'My Orders',
        icon: ShoppingBag,
        href: '/dashboard/customer/orders',
        desc: account?.summary.latestOrder
          ? `Latest order is ${getOrderStatusLabel(account.summary.latestOrder.status).toLowerCase()}.`
          : 'Track and manage your water deliveries.',
      },
      {
        name: 'Account Settings',
        icon: Settings,
        href: '/dashboard/customer/settings',
        desc:
          account?.summary.savedAddressesCount || account?.summary.preferredPaymentMethod
            ? `${account.summary.savedAddressesCount} address${account.summary.savedAddressesCount === 1 ? '' : 'es'} saved${
                account.summary.preferredPaymentMethod
                  ? ` • ${getPaymentMethodLabel(account.summary.preferredPaymentMethod)} default`
                  : ''
              }`
            : 'Manage profile, addresses, and security.',
      },
    ],
    [account]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="max-w-2xl mx-auto px-4 py-10 text-sm text-muted-foreground">
          Loading your account...
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="max-w-2xl mx-auto px-4 py-10">
          <Card className="border-none shadow-sm p-8 text-center">
            <CardContent className="p-0 space-y-4">
              <h1 className="text-2xl font-bold font-headline">Account unavailable</h1>
              <p className="text-sm text-muted-foreground">
                We could not load your customer profile right now. Refresh and try again.
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
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-primary text-primary-foreground p-8 pb-20 rounded-b-[40px] shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center mb-8">
          <Link href="/" className="mr-4">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Droplets className="h-6 w-6" />
            <span className="font-bold text-xl tracking-tight font-headline">WaterDrop</span>
          </Link>
        </div>

        <div className="max-w-2xl mx-auto flex items-center gap-6">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-white shadow-xl">
              <AvatarFallback>{getInitials(account)}</AvatarFallback>
            </Avatar>
            <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-accent text-white border-none px-3 whitespace-nowrap">
              {getAccountBadgeLabel(account)}
            </Badge>
          </div>
          <div className="space-y-1 min-w-0">
            <h1 className="text-3xl font-bold font-headline truncate">{getDisplayName(account)}</h1>
            <p className="text-primary-foreground/80 text-sm">
              {account.profile.email} • Member since {getMemberSinceLabel(account.profile.createdAt)}
            </p>
            {account.profile.phone && (
              <p className="text-primary-foreground/80 text-sm">{account.profile.phone}</p>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 -mt-12 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
            <CardContent className="p-6 text-center space-y-1">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Orders</p>
              <p className="text-2xl font-bold text-primary">{account.summary.totalOrders}</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
            <CardContent className="p-6 text-center space-y-1">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Active Orders</p>
              <p className="text-2xl font-bold text-accent">{account.summary.activeOrders}</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
            <CardContent className="p-6 text-center space-y-1">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Saved Addresses</p>
              <p className="text-2xl font-bold text-primary">{account.summary.savedAddressesCount}</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
            <CardContent className="p-6 text-center space-y-1">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Lifetime Spend</p>
              <p className="text-2xl font-bold text-accent">₦{account.summary.lifetimeSpendNaira.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
                <MapPin className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm">Default Delivery Address</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {account.summary.defaultAddress
                    ? `${account.summary.defaultAddressLabel ? `${account.summary.defaultAddressLabel}: ` : ''}${account.summary.defaultAddress}`
                    : 'No default address saved yet. Add one from account settings for faster checkout.'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
                <Wallet className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm">Preferred Payment Method</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {account.summary.preferredPaymentMethod
                    ? `${getPaymentMethodLabel(account.summary.preferredPaymentMethod)} is currently your default checkout option.`
                    : 'You have not chosen a default payment method yet.'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
                <Truck className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm">Latest Order</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {account.summary.latestOrder
                    ? `${account.summary.latestOrder.vendorName ?? 'Water Vendor'} • ${getOrderStatusLabel(account.summary.latestOrder.status)} • ₦${account.summary.latestOrder.totalNaira.toLocaleString()}`
                    : 'Your latest order details will appear here once you complete checkout.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {menuItems.map((item, index) => (
            <Link key={index} href={item.href}>
              <Card className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden active:scale-[0.98]">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-12 w-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm">{item.name}</h4>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <Button
          variant="ghost"
          className="w-full h-14 rounded-2xl text-destructive hover:text-destructive hover:bg-destructive/5 gap-3 font-bold"
          onClick={() => void signOut()}
          disabled={isSigningOut}
        >
          <LogOut className="h-5 w-5" />
          {isSigningOut ? 'Signing Out...' : 'Sign Out'}
        </Button>

        <div className="text-center space-y-1 py-6">
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">WaterDrop v1.0.4</p>
          <p className="text-[10px] text-muted-foreground">© 2024 WaterDrop Marketplace</p>
        </div>
      </div>
    </div>
  );
}
