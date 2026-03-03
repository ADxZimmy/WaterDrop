
"use client";

import React from 'react';
import Link from 'next/link';
import { Wallet, TrendingUp, Calendar, ArrowUpRight, ChevronRight, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

const data = [
  { day: 'Mon', amount: 45 },
  { day: 'Tue', amount: 52 },
  { day: 'Wed', amount: 38 },
  { day: 'Thu', amount: 65 },
  { day: 'Fri', amount: 80 },
  { day: 'Sat', amount: 120 },
  { day: 'Sun', amount: 95 },
];

export default function DriverEarningsPage() {
  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold font-headline">Earnings</h1>
          <p className="text-muted-foreground">Track your daily and weekly income.</p>
        </div>
        <Button variant="outline" className="rounded-xl h-11 gap-2 border-primary/20 text-primary">
          <Calendar className="h-4 w-4" />
          This Week
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none bg-primary text-white p-6 rounded-[32px] shadow-xl shadow-primary/20">
          <div className="flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
              <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Wallet className="h-5 w-5" />
              </div>
              <Badge className="bg-white/20 text-white border-none">Active Balance</Badge>
            </div>
            <div className="mt-8">
              <h2 className="text-4xl font-bold font-headline">$452.80</h2>
              <p className="text-primary-foreground/70 text-sm mt-1 flex items-center gap-1">
                Available for withdrawal
              </p>
            </div>
            <Link href="/dashboard/driver/withdraw" className="mt-6">
              <Button className="bg-white text-primary hover:bg-white/90 rounded-2xl h-12 w-full font-bold shadow-lg">
                Withdraw Now
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="border-none shadow-sm p-6 rounded-[32px] md:col-span-2 bg-white">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-lg">Weekly Performance</CardTitle>
          </CardHeader>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#888'}} />
                <Tooltip cursor={{fill: '#f5f5f5'}} />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 5 ? '#26A3DB' : '#e2e8f0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-lg">Daily Activity</h3>
        <div className="space-y-3">
          {[
            { date: 'Today, Oct 24', trips: 12, earnings: '$142.50' },
            { date: 'Yesterday, Oct 23', trips: 8, earnings: '$88.20' },
            { date: 'Wednesday, Oct 22', trips: 15, earnings: '$185.00' },
          ].map((day, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-transparent hover:border-primary/20 transition-all group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary transition-transform group-hover:scale-110">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-sm">{day.date}</p>
                  <p className="text-xs text-muted-foreground">{day.trips} Trips completed</p>
                </div>
              </div>
              <div className="text-right flex items-center gap-3">
                <p className="font-bold text-lg text-primary">{day.earnings}</p>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
