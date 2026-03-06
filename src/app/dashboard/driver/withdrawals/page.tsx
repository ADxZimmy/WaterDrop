"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, History, Search, Filter, Calendar, Clock, DollarSign, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const withdrawals = [
  { id: 'WID-9921', date: 'Oct 24, 2024', time: '14:20 PM', amount: '₦15,000.00', status: 'Pending', method: 'GTBank Savings (•••• 4452)' },
  { id: 'WID-9882', date: 'Oct 18, 2024', time: '09:15 AM', amount: '₦24,000.00', status: 'Completed', method: 'GTBank Savings (•••• 4452)' },
  { id: 'WID-9851', date: 'Oct 12, 2024', time: '11:30 AM', amount: '₦10,000.00', status: 'Completed', method: 'GTBank Savings (•••• 4452)' },
  { id: 'WID-9820', date: 'Oct 05, 2024', time: '16:45 PM', amount: '₦32,000.00', status: 'Completed', method: 'GTBank Savings (•••• 4452)' },
];

export default function DriverWithdrawalHistoryPage() {
  const handleDownloadReceipt = (withdrawal: typeof withdrawals[0]) => {
    const receiptContent = `
========================================
       WATERDROP WITHDRAWAL RECEIPT
========================================
Receipt ID: ${withdrawal.id}
Date: ${withdrawal.date}
Time: ${withdrawal.time}
Status: ${withdrawal.status}
----------------------------------------
AMOUNT: ${withdrawal.amount}
METHOD: ${withdrawal.method}
----------------------------------------
Transaction processed via WaterDrop Payout System.
Keep this receipt for your records.
----------------------------------------
Thank you for delivering with WaterDrop!
========================================
    `;
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${withdrawal.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/driver/earnings">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold font-headline">Withdrawal History</h1>
          <p className="text-muted-foreground">Track your payout requests and status.</p>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search withdrawals..." className="pl-10 h-11 rounded-xl" />
        </div>
        <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {withdrawals.map((item) => (
          <Card key={item.id} className="border-none shadow-sm overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${item.status === 'Pending' ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'}`}>
                    <History className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{item.id}</h4>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-bold mt-0.5">
                      <Calendar className="h-3 w-3" /> {item.date}
                      <span className="h-1 w-1 bg-muted-foreground/30 rounded-full"></span>
                      <Clock className="h-3 w-3" /> {item.time}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-primary">{item.amount}</p>
                  <Badge 
                    variant="outline" 
                    className={`text-[10px] mt-1 border-none ${
                      item.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {item.status}
                  </Badge>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-muted/50">
                <div className="flex items-center gap-2 text-xs text-muted-foreground italic">
                  <DollarSign className="h-3.5 w-3.5" />
                  {item.method}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 gap-1 text-primary group-hover:bg-primary/5"
                  onClick={() => handleDownloadReceipt(item)}
                >
                  View Receipt <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
