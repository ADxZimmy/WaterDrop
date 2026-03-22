"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Calendar, Search, ShoppingBag, Star, Users } from "lucide-react";
import type { AdminCustomerRecord } from "@/lib/admin/ops-types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AdminCustomersResponse = {
  customers: AdminCustomerRecord[];
};

function formatNaira(value: number) {
  return `₦${value.toLocaleString("en-NG")}`;
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getTierClassName(tier: AdminCustomerRecord["tier"]) {
  if (tier === "Gold") {
    return "bg-amber-100 text-amber-700";
  }

  if (tier === "Silver") {
    return "bg-slate-100 text-slate-700";
  }

  return "bg-orange-100 text-orange-700";
}

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "CU";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<AdminCustomerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadCustomers = async () => {
      try {
        const response = await fetch("/api/admin/customers", { method: "GET" });
        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error ?? "Unable to load customers.");
        }

        const payload: AdminCustomersResponse = await response.json();
        if (isMounted) {
          setCustomers(payload.customers ?? []);
          setError(null);
        }
      } catch (fetchError) {
        if (isMounted) {
          setCustomers([]);
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Unable to load customers."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadCustomers();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalLifetimeValue = useMemo(
    () => customers.reduce((sum, customer) => sum + customer.totalSpentNaira, 0),
    [customers]
  );
  const averageClv = useMemo(() => {
    if (customers.length === 0) {
      return 0;
    }

    return Math.round(totalLifetimeValue / customers.length);
  }, [customers.length, totalLifetimeValue]);
  const repeatBuyers = useMemo(
    () => customers.filter((customer) => customer.orderCount > 1).length,
    [customers]
  );
  const newThisMonth = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    return customers.filter((customer) => customer.createdAt >= monthStart).length;
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (query.length === 0) {
      return customers;
    }

    return customers.filter((customer) => {
      return (
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.tier.toLowerCase().includes(query) ||
        customer.uid.toLowerCase().includes(query)
      );
    });
  }, [customers, search]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-8 text-sm text-muted-foreground">
        Loading customer directory...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <Card className="border-none shadow-sm rounded-3xl">
          <CardContent className="p-8 space-y-4">
            <h1 className="text-2xl font-bold text-slate-900">
              Customer directory unavailable
            </h1>
            <p className="text-sm text-slate-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-slate-900">
            User Directory
          </h1>
          <p className="text-slate-500">
            Live overview of customer activity, value, and retention signals.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          {
            title: "Total Customers",
            value: customers.length.toLocaleString("en-NG"),
            subtitle: "Registered customer profiles",
            icon: Users,
          },
          {
            title: "Avg. CLV",
            value: formatNaira(averageClv),
            subtitle: "Average non-cancelled spend",
            icon: Star,
          },
          {
            title: "Repeat Buyers",
            value: repeatBuyers.toLocaleString("en-NG"),
            subtitle: "Customers with 2+ orders",
            icon: ShoppingBag,
          },
          {
            title: "New This Month",
            value: newThisMonth.toLocaleString("en-NG"),
            subtitle: "Customer signups this month",
            icon: Calendar,
          },
        ].map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm bg-white p-6 rounded-3xl">
            <div className="flex justify-between items-start gap-3">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {stat.title}
                </p>
                <h3 className="text-2xl font-bold mt-4 text-slate-900">
                  {stat.value}
                </h3>
                <p className="text-xs text-slate-500 mt-2">{stat.subtitle}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search customers by name, email, tier, or user ID..."
            className="pl-10 h-11 rounded-xl bg-white border-slate-200"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        {filteredCustomers.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <h2 className="text-xl font-bold text-slate-900">
              No customers match this view
            </h2>
            <p className="text-sm text-slate-500">
              Try another search term to refine the customer list.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="pl-8">Customer</TableHead>
                <TableHead>Loyalty Tier</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Saved Addresses</TableHead>
                <TableHead className="pr-8">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.uid} className="group hover:bg-slate-50/50">
                  <TableCell className="pl-8">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-slate-100">
                        <AvatarFallback className="bg-slate-100 text-slate-700 font-semibold">
                          {getInitials(customer.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-slate-900 truncate">
                          {customer.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {customer.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`rounded-full px-3 border-none ${getTierClassName(customer.tier)}`}
                    >
                      {customer.tier}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm font-medium text-slate-700">
                    <div>{customer.orderCount}</div>
                    <p className="text-xs text-slate-400 mt-1">
                      {customer.activeOrderCount} active
                    </p>
                  </TableCell>
                  <TableCell className="font-bold text-primary">
                    {formatNaira(customer.totalSpentNaira)}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {customer.savedAddressesCount}
                  </TableCell>
                  <TableCell className="text-sm text-slate-500 pr-8">
                    {formatDate(customer.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}