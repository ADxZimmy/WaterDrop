
"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ShoppingBag, 
  Search, 
  Filter, 
  Clock, 
  User, 
  ChevronRight,
  MoreHorizontal,
  ArrowUpRight,
  Download,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const mockOrders = [
  { id: "AQ-5521", customer: "Alice Johnson", items: "5x Bottled", total: "$62.50", status: "Delivering", date: "Oct 24, 2024", time: "14:20" },
  { id: "AQ-5522", customer: "Bob Wilson", items: "10x Sachet", total: "$35.00", status: "Completed", date: "Oct 24, 2024", time: "11:05" },
  { id: "AQ-5523", customer: "Clara Davis", items: "2x 19L Dispenser", total: "$30.00", status: "Completed", date: "Oct 23, 2024", time: "18:45" },
  { id: "AQ-5524", customer: "Daniel Lee", items: "20x 750ml", total: "$24.00", status: "Cancelled", date: "Oct 23, 2024", time: "15:30" },
  { id: "AQ-5525", customer: "Eva Martinez", items: "1x Bulk Pack", total: "$120.00", status: "Completed", date: "Oct 22, 2024", time: "09:15" },
];

export default function AdminVendorOrdersPage() {
  const params = useParams();

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href={`/admin/vendors/${params.id}`}>
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold font-headline text-slate-900">Order History</h1>
          <p className="text-slate-500">Transaction log for Aqua Pure Factory</p>
        </div>
        <Button variant="outline" className="ml-auto rounded-xl h-11 px-6 bg-white border-slate-200 gap-2">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-white p-6 rounded-[32px]">
          <p className="text-xs uppercase font-bold tracking-widest text-slate-400">Total Lifetime Orders</p>
          <h3 className="text-3xl font-bold mt-2 text-slate-900">1,204</h3>
        </Card>
        <Card className="border-none shadow-sm bg-white p-6 rounded-[32px]">
          <p className="text-xs uppercase font-bold tracking-widest text-slate-400">Completion Rate</p>
          <h3 className="text-3xl font-bold mt-2 text-emerald-600">98.2%</h3>
        </Card>
        <Card className="border-none shadow-sm bg-white p-6 rounded-[32px]">
          <p className="text-xs uppercase font-bold tracking-widest text-slate-400">Vendor Status</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="h-3 w-3 bg-emerald-500 rounded-full"></div>
            <span className="text-xl font-bold text-slate-900">Healthy</span>
          </div>
        </Card>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Search by Order ID or Customer..." className="pl-10 h-11 rounded-xl bg-white border-slate-200" />
        </div>
        <Button variant="outline" className="h-11 px-6 rounded-xl bg-white border-slate-200 gap-2">
          <Calendar className="h-4 w-4" /> Date Range
        </Button>
      </div>

      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="pl-8">Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right pr-8">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockOrders.map((order) => (
              <TableRow key={order.id} className="group hover:bg-slate-50/50">
                <TableCell className="pl-8 font-bold text-primary">{order.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    {order.customer}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-slate-600">{order.items}</TableCell>
                <TableCell className="font-bold text-slate-900">{order.total}</TableCell>
                <TableCell className="text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {order.date}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    className={`rounded-full px-3 border-none ${
                      order.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 
                      order.status === 'Delivering' ? 'bg-blue-100 text-blue-700' : 
                      order.status === 'Cancelled' ? 'bg-rose-100 text-rose-700' :
                      'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right pr-8">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
