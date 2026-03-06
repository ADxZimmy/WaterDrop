"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Download, Droplets, Calendar, Clock, Building2, FileText } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Mock data (matching the list page)
const withdrawals = [
  { id: 'WID-9921', date: 'Oct 24, 2024', time: '14:20 PM', amount: '₦15,000.00', status: 'Pending', method: 'GTBank Savings (•••• 4452)' },
  { id: 'WID-9882', date: 'Oct 18, 2024', time: '09:15 AM', amount: '₦24,000.00', status: 'Completed', method: 'GTBank Savings (•••• 4452)' },
  { id: 'WID-9851', date: 'Oct 12, 2024', time: '11:30 AM', amount: '₦10,000.00', status: 'Completed', method: 'GTBank Savings (•••• 4452)' },
  { id: 'WID-9820', date: 'Oct 05, 2024', time: '16:45 PM', amount: '₦32,000.00', status: 'Completed', method: 'GTBank Savings (•••• 4452)' },
];

export default function WithdrawalReceiptPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const withdrawal = withdrawals.find(w => w.id === id) || withdrawals[0];

  const handleDownload = () => {
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
    <div className="min-h-screen bg-muted/30 p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-lg space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold font-headline text-foreground">Transaction Receipt</h1>
        </div>

        <Card className="border-none shadow-2xl rounded-[32px] overflow-hidden bg-white">
          <CardHeader className="bg-primary p-8 text-white text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <Droplets className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold font-headline">WaterDrop Payout</CardTitle>
            <p className="text-primary-foreground/80 text-sm">Official Transaction Record</p>
          </CardHeader>

          <CardContent className="p-8 space-y-8">
            <div className="text-center space-y-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Amount</p>
              <h2 className="text-4xl font-bold text-slate-900">{withdrawal.amount}</h2>
              <Badge 
                className={`mt-2 border-none rounded-full px-4 ${
                  withdrawal.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                }`}
              >
                {withdrawal.status}
              </Badge>
            </div>

            <Separator />

            <div className="grid grid-cols-1 gap-6">
              <div className="flex justify-between items-center text-sm text-foreground">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Receipt ID</span>
                </div>
                <span className="font-bold font-mono">{withdrawal.id}</span>
              </div>

              <div className="flex justify-between items-center text-sm text-foreground">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Date</span>
                </div>
                <span className="font-medium text-slate-700">{withdrawal.date}</span>
              </div>

              <div className="flex justify-between items-center text-sm text-foreground">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Time</span>
                </div>
                <span className="font-medium text-slate-700">{withdrawal.time}</span>
              </div>

              <div className="flex justify-between items-start text-sm text-foreground">
                <div className="flex items-center gap-2 text-muted-foreground shrink-0">
                  <Building2 className="h-4 w-4" />
                  <span>Payment Method</span>
                </div>
                <span className="font-medium text-slate-700 text-right max-w-[180px]">{withdrawal.method}</span>
              </div>
            </div>

            <Separator />

            <div className="p-4 bg-muted/20 rounded-2xl border border-dashed border-muted-foreground/20 text-center text-foreground">
              <p className="text-[10px] text-muted-foreground leading-relaxed uppercase font-bold tracking-tighter">
                This receipt confirms that the withdrawal request has been initiated. 
                Completion time depends on your financial institution.
              </p>
            </div>
          </CardContent>

          <CardFooter className="p-8 pt-0 flex flex-col gap-3">
            <Button 
              className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 gap-2"
              onClick={handleDownload}
            >
              <Download className="h-5 w-5" /> Download PDF
            </Button>
            <Button 
              variant="ghost" 
              className="w-full h-12 rounded-xl text-muted-foreground"
              onClick={() => router.back()}
            >
              Close
            </Button>
          </CardFooter>
        </Card>

        <div className="text-center">
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">© 2024 WaterDrop Marketplace</p>
        </div>
      </div>
    </div>
  );
}
