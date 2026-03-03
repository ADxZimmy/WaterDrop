"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Wallet, CheckCircle2, XCircle, Clock, Search, Filter, MoreHorizontal, DollarSign, ArrowUpRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const withdrawalRequests = [
  { 
    id: "WID-9921", 
    driver: "John Driver", 
    amount: 142.50, 
    date: "2 hours ago", 
    status: "Pending", 
    method: "Chase Savings (•••• 4452)",
    image: "https://picsum.photos/seed/d1/100"
  },
  { 
    id: "WID-9918", 
    driver: "Sarah Delivery", 
    amount: 88.20, 
    date: "5 hours ago", 
    status: "Approved", 
    method: "Bank of America (•••• 1122)",
    image: "https://picsum.photos/seed/d2/100"
  },
  { 
    id: "WID-9882", 
    driver: "Mike Moto", 
    amount: 350.00, 
    date: "Yesterday", 
    status: "Approved", 
    method: "Wells Fargo (•••• 8877)",
    image: "https://picsum.photos/seed/d3/100"
  },
  { 
    id: "WID-9840", 
    driver: "Dave Logistics", 
    amount: 45.00, 
    date: "Oct 22, 2024", 
    status: "Rejected", 
    method: "PayPal (dave@logistics.com)",
    image: "https://picsum.photos/seed/d4/100"
  },
];

export default function VendorWithdrawalsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => window.history.back()} className="rounded-xl">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold font-headline">Withdrawal Requests</h1>
          <p className="text-muted-foreground">Manage and approve payouts for your delivery fleet.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm p-6 rounded-3xl bg-white">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Pending Approval</p>
            <Badge className="bg-yellow-100 text-yellow-700 border-none text-[10px] px-2 py-0">Action</Badge>
          </div>
          <h3 className="text-3xl font-bold mt-2">1</h3>
        </Card>

        <Card className="border-none shadow-sm p-6 rounded-3xl bg-white">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Total Paid (MTD)</p>
            <div className="flex items-center gap-1 text-green-600 text-[10px] font-bold bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
              <ArrowUpRight className="h-3 w-3" /> +12%
            </div>
          </div>
          <h3 className="text-3xl font-bold mt-2">$1,240.00</h3>
        </Card>

        <Card className="border-none shadow-sm p-6 rounded-3xl bg-white">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Avg. Processing</p>
            <Clock className="h-4 w-4 text-primary/40" />
          </div>
          <h3 className="text-3xl font-bold mt-2">4.2h</h3>
        </Card>

        <Card className="border-none shadow-sm p-6 rounded-3xl bg-primary text-white">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase font-bold tracking-widest opacity-80">Next Payout</p>
            <Wallet className="h-4 w-4 opacity-40" />
          </div>
          <h3 className="text-2xl font-bold mt-2">Tomorrow</h3>
        </Card>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-border overflow-hidden">
        <div className="p-6 border-b flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by driver or ID..." className="pl-10 h-11 rounded-xl" />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" className="rounded-xl flex-1 md:flex-none">
              <Filter className="h-4 w-4 mr-2" /> Filter
            </Button>
            <Button variant="outline" className="rounded-xl flex-1 md:flex-none">Export CSV</Button>
          </div>
        </div>

        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="pl-6">Driver</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Method</TableHead>
              <TableHead className="text-right pr-6">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {withdrawalRequests.map((req) => (
              <TableRow key={req.id} className="group">
                <TableCell className="pl-6">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={req.image} />
                      <AvatarFallback>{req.driver[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-sm text-foreground">{req.driver}</p>
                      <p className="text-[10px] text-muted-foreground">{req.id}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-bold text-primary">
                  ${req.amount.toFixed(2)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {req.date}
                </TableCell>
                <TableCell>
                  <Badge 
                    className={`rounded-full px-3 border-none ${
                      req.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                      req.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-red-100 text-red-700'
                    }`}
                  >
                    {req.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground italic">
                  {req.method}
                </TableCell>
                <TableCell className="text-right pr-6">
                  {req.status === 'Pending' ? (
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" className="h-8 rounded-lg border-green-200 text-green-600 hover:bg-green-50">
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 rounded-lg border-red-200 text-red-600 hover:bg-red-50">
                        <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                      </Button>
                    </div>
                  ) : (
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
