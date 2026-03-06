"use client";

import React from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  ShoppingBag, 
  Star, 
  Mail, 
  Calendar,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const customers = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", orders: 42, spent: "₦125,000.00", joined: "May 2024", tier: "Gold" },
  { id: 2, name: "Bob Wilson", email: "bob@example.com", orders: 12, spent: "₦45,020.00", joined: "Jun 2024", tier: "Silver" },
  { id: 3, name: "Clara Davis", email: "clara@example.com", orders: 8, spent: "₦18,050.00", joined: "Jul 2024", tier: "Bronze" },
  { id: 4, name: "Daniel Lee", email: "daniel@example.com", orders: 25, spent: "₦89,000.00", joined: "Aug 2024", tier: "Silver" },
  { id: 5, name: "Eva Martinez", email: "eva@example.com", orders: 56, spent: "₦210,000.00", joined: "Apr 2024", tier: "Gold" },
];

export default function AdminCustomersPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-slate-900">User Directory</h1>
          <p className="text-slate-500">Detailed overview of all platform customers.</p>
        </div>
        <Button className="rounded-xl h-11 px-6 shadow-lg shadow-primary/20">Platform Announcement</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: "Total Users", value: "12,402", icon: Users, trend: "+12%", color: "bg-blue-500" },
          { title: "Avg. CLV", value: "₦18,240.40", icon: Star, trend: "+5.2%", color: "bg-amber-500" },
          { title: "Retention", value: "84%", icon: ArrowUpRight, trend: "+2.1%", color: "bg-emerald-500" },
          { title: "New Today", value: "42", icon: Calendar, trend: "+8", color: "bg-indigo-500" },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm bg-white p-6 rounded-3xl group">
            <div className="flex justify-between items-start">
              <div className={`h-10 w-10 ${stat.color} rounded-xl flex items-center justify-center text-white`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-600 border-emerald-100">
                {stat.trend}
              </Badge>
            </div>
            <h3 className="text-2xl font-bold mt-4">{stat.value}</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.title}</p>
          </Card>
        ))}
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Search customers by name, email or tier..." className="pl-10 h-11 rounded-xl bg-white border-slate-200" />
        </div>
        <Button variant="outline" className="h-11 px-6 rounded-xl bg-white border-slate-200">
          Export CSV
        </Button>
      </div>

      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="pl-8">Customer</TableHead>
              <TableHead>Loyalty Tier</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead className="pr-8">Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id} className="group hover:bg-slate-50/50">
                <TableCell className="pl-8">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-slate-100">
                      <AvatarImage src={`https://picsum.photos/seed/${customer.id}/100`} />
                      <AvatarFallback>{customer.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-sm text-slate-900">{customer.name}</p>
                      <p className="text-xs text-slate-500">{customer.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    className={`rounded-full px-3 border-none ${
                      customer.tier === 'Gold' ? 'bg-amber-100 text-amber-700' : 
                      customer.tier === 'Silver' ? 'bg-slate-100 text-slate-700' : 
                      'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {customer.tier}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm font-medium text-slate-700">{customer.orders}</TableCell>
                <TableCell className="font-bold text-primary">{customer.spent}</TableCell>
                <TableCell className="text-sm text-slate-500 pr-8">{customer.joined}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}