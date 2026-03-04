"use client";

import React, { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const dailyData = [
  { label: 'Mon', amount: 45 },
  { label: 'Tue', amount: 52 },
  { label: 'Wed', amount: 38 },
  { label: 'Thu', amount: 65 },
  { label: 'Fri', amount: 80 },
  { label: 'Sat', amount: 120 },
  { label: 'Sun', amount: 95 },
];

const weeklyData = [
  { label: 'Week 1', amount: 450 },
  { label: 'Week 2', amount: 520 },
  { label: 'Week 3', amount: 380 },
  { label: 'Week 4', amount: 650 },
];

const monthlyData = [
  { label: 'Jul', amount: 1800 },
  { label: 'Aug', amount: 2100 },
  { label: 'Sep', amount: 1950 },
  { label: 'Oct', amount: 2450 },
];

export default function DriverEarningsPage() {
  const [period, setPeriod] = useState<string>('week');

  const chartData = period === 'day' ? dailyData : period === 'week' ? weeklyData : monthlyData;
  const chartTitle = period === 'day' ? 'Daily Performance' : period === 'week' ? 'Weekly Performance' : 'Monthly Performance';

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold font-headline">Earnings</h1>
          <p className="text-muted-foreground">Track your daily and weekly income.</p>
        </div>
        <Select defaultValue="week" onValueChange={setPeriod}>
          <SelectTrigger className="w-[140px] rounded-xl h-11 border-primary/20 text-primary gap-2">
            <Calendar className="h-4 w-4" />
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Days</SelectItem>
            <SelectItem value="week">Weeks</SelectItem>
            <SelectItem value="month">Months</SelectItem>
          </SelectContent>
        </Select>
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
            <CardTitle className="text-lg">{chartTitle}</CardTitle>
          </CardHeader>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#888'}} />
                <Tooltip cursor={{fill: '#f5f5f5'}} />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#26A3DB' : '#e2e8f0'} />
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
            { date: 'Oct-24-2024', label: 'Today, Oct 24', trips: 12, earnings: '$142.50' },
            { date: 'Oct-23-2024', label: 'Yesterday, Oct 23', trips: 8, earnings: '$88.20' },
            { date: 'Oct-22-2024', label: 'Wednesday, Oct 22', trips: 15, earnings: '$185.00' },
          ].map((day, i) => (
            <Link key={i} href={`/dashboard/driver/activity/${day.date}`}>
              <div className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-transparent hover:border-primary/20 transition-all group cursor-pointer mb-3">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary transition-transform group-hover:scale-110">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{day.label}</p>
                    <p className="text-xs text-muted-foreground">{day.trips} Trips completed</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <p className="font-bold text-lg text-primary">{day.earnings}</p>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
