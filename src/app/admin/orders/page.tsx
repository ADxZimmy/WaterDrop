"use client";

import React from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Clock, 
  MapPin, 
  Truck, 
  User, 
  Store,
  ChevronRight,
  MoreHorizontal,
  ArrowUpRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const orders = [
  { id: "AQ-5521", vendor: "Aqua Pure", customer: "Alice Johnson", items: "5x Bottled", total: "₦6,250.00", status: "Delivering", time: "12m ago" },
  { id: "AQ-5522", vendor: "Blue Wave", customer: "Bob Wilson", items: "10x Sachet", total: "₦3,500.00", status: "Accepted", time: "25m ago" },
  { id: "AQ-5523", vendor: "Crystal Spring", customer: "Clara Davis", items: "2x 19L Dispenser", total: "₦3,000.00", status: "Completed", time: "1h ago" },
  { id: "AQ-5524", vendor: "Oasis Flow", customer: "Daniel Lee", items: "20x 750ml", total: "₦2,400.00", status: "Cancelled", time: "2h ago" },
];

export default function AdminOrdersPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-slate-900">Platform Orders</h1>
          <p className="text-slate-500">Live feed of all transactions across the WaterDrop network.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl h-11 px-6 bg-white border-slate-200">Export All CSV</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-white p-6 rounded-3xl">
          <div className="flex justify-between items-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Deliveries</p>
            <Truck className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-3xl font-bold mt-2">142</h3>
          <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
            <ArrowUpRight className="h-3 w-3" /> 8.5% increase today
          </p>
        </Card>
        <Card className="border-none shadow-sm bg-white p-6 rounded-3xl">
          <div className="flex justify-between items-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Avg. Ticket Size</p>
            <ShoppingBag className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-3xl font-bold mt-2">₦2,840.00</h3>
          <p className="text-xs text-slate-500 mt-1">Platform average per order</p>
        </Card>
        <Card className="border-none shadow-sm bg-primary text-white p-6 rounded-3xl">
          <div className="flex justify-between items-center">
            <p className="text-xs font-bold opacity-70 uppercase tracking-widest">System Load</p>
            <Clock className="h-4 w-4 opacity-70" />
          </div>
          <h3 className="text-3xl font-bold mt-2">Optimal</h3>
          <p className="text-xs opacity-70 mt-1">Avg. fulfillment time: 18m</p>
        </Card>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Search by Order ID, Customer, or Vendor..." className="pl-10 h-11 rounded-xl bg-white border-slate-200" />
        </div>
        <Button variant="outline" className="h-11 px-6 rounded-xl bg-white border-slate-200">Date Range</Button>
      </div>

      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="pl-8">Order ID</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-8">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} className="group hover:bg-slate-50/50">
                <TableCell className="pl-8 font-bold text-primary">{order.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Store className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">{order.vendor}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-sm text-slate-600">{order.customer}</span>
                  </div>
                </TableCell>
                <TableCell className="font-bold text-slate-900">{order.total}</TableCell>
                <TableCell>
                  <Badge 
                    className={`rounded-full px-3 border-none ${
                      order.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 
                      order.status === 'Delivering' ? 'bg-blue-100 text-blue-700' : 
                      order.status === 'Accepted' ? 'bg-amber-100 text-amber-700' : 
                      'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-slate-500 italic pr-8">
                  {order.time}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}