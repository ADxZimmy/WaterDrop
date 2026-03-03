
"use client";

import React from 'react';
import { Users, Search, Mail, Phone, Calendar, Star, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const customers = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", phone: "+1 555-101", orders: 42, totalSpent: 1250.00, lastOrder: "2 hours ago", loyalty: "Premium" },
  { id: 2, name: "Bob Wilson", email: "bob@example.com", phone: "+1 555-102", orders: 12, totalSpent: 450.20, lastOrder: "1 day ago", loyalty: "Standard" },
  { id: 3, name: "Clara Davis", email: "clara@example.com", phone: "+1 555-103", orders: 8, totalSpent: 180.50, lastOrder: "3 days ago", loyalty: "New" },
  { id: 4, name: "Daniel Lee", email: "daniel@example.com", phone: "+1 555-104", orders: 25, totalSpent: 890.00, lastOrder: "5 hours ago", loyalty: "Premium" },
];

export default function VendorCustomersPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold font-headline">Customer Base</h1>
          <p className="text-muted-foreground">Understand your audience and manage relationships.</p>
        </div>
        <Button variant="outline" className="rounded-xl h-11 px-6">View Segments</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: "Total Customers", value: "1,204", icon: Users, color: "bg-primary/10 text-primary" },
          { title: "New This Month", value: "142", icon: Star, color: "bg-yellow-100 text-yellow-600" },
          { title: "Active Today", value: "85", icon: Calendar, color: "bg-green-100 text-green-600" },
          { title: "Avg. Life Value", value: "$185.20", icon: Star, color: "bg-purple-100 text-purple-600" },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm p-6 rounded-3xl">
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-xl font-bold">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-border overflow-hidden">
        <div className="p-6 border-b flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search customers..." className="pl-10 h-11 rounded-xl" />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" className="rounded-xl flex-1 md:flex-none">Export</Button>
            <Button variant="outline" className="rounded-xl flex-1 md:flex-none">Filter</Button>
          </div>
        </div>

        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="pl-6">Customer</TableHead>
              <TableHead>Loyalty</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Last Order</TableHead>
              <TableHead className="text-right pr-6">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id} className="group">
                <TableCell className="pl-6">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`https://picsum.photos/seed/${customer.id}/100`} />
                      <AvatarFallback>{customer.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-sm">{customer.name}</p>
                      <p className="text-xs text-muted-foreground">{customer.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    className={`rounded-full px-3 border-none ${
                      customer.loyalty === 'Premium' ? 'bg-purple-100 text-purple-700' : 
                      customer.loyalty === 'Standard' ? 'bg-blue-100 text-blue-700' : 
                      'bg-green-100 text-green-700'
                    }`}
                  >
                    {customer.loyalty}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{customer.orders}</TableCell>
                <TableCell className="font-bold">${customer.totalSpent.toFixed(2)}</TableCell>
                <TableCell className="text-muted-foreground text-xs">{customer.lastOrder}</TableCell>
                <TableCell className="text-right pr-6">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
