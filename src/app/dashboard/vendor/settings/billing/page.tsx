"use client";

import React from 'react';
import Link from 'next/link';
import { CreditCard, Plus, ArrowUpRight, CheckCircle2, Building2, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function BillingSettingsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 text-foreground">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/vendor/settings">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold font-headline">Billing & Payouts</h1>
          <p className="text-muted-foreground">Manage your payment methods and view earning statements.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden border-primary/10 bg-white">
          <CardHeader className="bg-primary/5 p-6 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Payout Method</CardTitle>
              <CardDescription>Where your funds are sent after successful orders.</CardDescription>
            </div>
            <Building2 className="h-6 w-6 text-primary opacity-20" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-transparent">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-sm">Chase Business</p>
                  <p className="text-xs text-muted-foreground">Ending in •••• 1245</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-primary font-bold">Edit</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardHeader className="p-6 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Transaction History</CardTitle>
          <Button variant="ghost" className="text-primary text-sm gap-2">
            Download All <ArrowUpRight className="h-4 w-4" />
          </Button>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Transaction ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="text-right pr-6">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              { id: "TXN-2024-001", date: "Oct 12, 2024", amount: "₦45,000.00", status: "Paid" },
              { id: "TXN-2024-002", date: "Sep 12, 2024", amount: "₦32,500.00", status: "Paid" },
              { id: "TXN-2024-003", date: "Aug 12, 2024", amount: "₦28,000.00", status: "Paid" },
            ].map((txn) => (
              <TableRow key={txn.id}>
                <TableCell className="pl-6 font-bold text-primary">{txn.id}</TableCell>
                <TableCell className="text-muted-foreground">{txn.date}</TableCell>
                <TableCell className="font-medium font-bold">{txn.amount}</TableCell>
                <TableCell className="text-right pr-6">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {txn.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
