"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight, 
  Info,
  DollarSign,
  ShoppingBag,
  Store,
  Calendar,
  Star,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart as RePieChart, Pie, Cell 
} from 'recharts';
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const dataSets: Record<string, any[]> = {
  'D': [
    { name: '08:00', rev: 45000, orders: 120 },
    { name: '10:00', rev: 52000, orders: 145 },
    { name: '12:00', rev: 88000, orders: 230 },
    { name: '14:00', rev: 61000, orders: 180 },
    { name: '16:00', rev: 59000, orders: 175 },
    { name: '18:00', rev: 82000, orders: 240 },
  ],
  'W': [
    { name: 'Mon', rev: 120000, orders: 350 },
    { name: 'Tue', rev: 145000, orders: 410 },
    { name: 'Wed', rev: 110000, orders: 320 },
    { name: 'Thu', rev: 165000, orders: 480 },
    { name: 'Fri', rev: 190000, orders: 550 },
    { name: 'Sat', rev: 245000, orders: 720 },
    { name: 'Sun', rev: 210000, orders: 610 },
  ],
  '1m': [
    { name: 'Wk 1', rev: 350000, orders: 900 },
    { name: 'Wk 2', rev: 420000, orders: 1150 },
    { name: 'Wk 3', rev: 380000, orders: 1050 },
    { name: 'Wk 4', rev: 550000, orders: 1400 },
  ],
  '3m': [
    { name: 'Oct', rev: 1450000, orders: 4200 },
    { name: 'Nov', rev: 1520000, orders: 4450 },
    { name: 'Dec', rev: 1880000, orders: 5300 },
  ],
  '6m': [
    { name: 'Jul', rev: 450000, orders: 1200 },
    { name: 'Aug', rev: 520000, orders: 1450 },
    { name: 'Sep', rev: 480000, orders: 1300 },
    { name: 'Oct', rev: 610000, orders: 1800 },
    { name: 'Nov', rev: 590000, orders: 1750 },
    { name: 'Dec', rev: 820000, orders: 2400 },
  ],
  '1y': [
    { name: 'H1', rev: 6450000, orders: 18200 },
    { name: 'H2', rev: 7800000, orders: 22450 },
  ],
};

const categoryData = [
  { name: 'Bottled Water', value: 45 },
  { name: 'Sachet Bags', value: 35 },
  { name: 'Bulk Dispenser', value: 15 },
  { name: 'Accessories', value: 5 },
];

const topVendors = [
  { name: "Aqua Pure Factory", revenue: "₦1,245,000", orders: 420, rating: 4.9 },
  { name: "Blue Wave Distro", revenue: "₦920,000", orders: 310, rating: 4.8 },
  { name: "Crystal Spring", revenue: "₦880,000", orders: 280, rating: 4.7 },
  { name: "Oasis Flow", revenue: "₦750,000", orders: 240, rating: 4.5 },
];

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('6m');

  const revenueData = useMemo(() => dataSets[timeRange] || dataSets['6m'], [timeRange]);

  const totalRev = useMemo(() => {
    const sum = revenueData.reduce((acc, curr) => acc + curr.rev, 0);
    return sum.toLocaleString();
  }, [revenueData]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-slate-900">Platform Insights</h1>
          <p className="text-slate-500">Visualizing global marketplace growth and metrics.</p>
        </div>
        
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[140px] rounded-xl h-11 border-slate-200 bg-white shadow-sm font-bold text-slate-700">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <SelectValue placeholder="Range" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-xl shadow-xl border-slate-100">
            <SelectItem value="D" className="font-bold">D (Day)</SelectItem>
            <SelectItem value="W" className="font-bold">W (Week)</SelectItem>
            <SelectItem value="1m" className="font-bold">1M</SelectItem>
            <SelectItem value="3m" className="font-bold">3M</SelectItem>
            <SelectItem value="6m" className="font-bold">6M</SelectItem>
            <SelectItem value="1y" className="font-bold">1Y</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl p-6 bg-white">
          <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between mb-6">
            <div>
              <CardTitle>Global Revenue</CardTitle>
              <CardDescription>Consolidated earnings across all vendors ({timeRange.toUpperCase()})</CardDescription>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-900">₦{totalRev}</p>
              <p className="text-xs text-emerald-600 flex items-center justify-end gap-1">
                <ArrowUpRight className="h-3 w-3" /> +12.5%
              </p>
            </div>
          </CardHeader>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorGlobalRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} tickFormatter={(v) => `₦${v >= 1000 ? (v/1000).toFixed(0) + 'k' : v}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`₦${value.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="rev" stroke="#0ea5e9" strokeWidth={4} fillOpacity={1} fill="url(#colorGlobalRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl p-6 bg-white">
          <CardHeader className="px-0 pt-0 mb-6">
            <CardTitle>Product Distribution</CardTitle>
            <CardDescription>Sales volume by category</CardDescription>
          </CardHeader>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={categoryData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4 mt-6">
            {categoryData.map((cat, i) => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-sm font-medium text-slate-600">{cat.name}</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{cat.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
          <CardHeader className="p-6 border-b border-slate-50 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Top Performing Vendors</CardTitle>
              <CardDescription>Ranked by monthly gross revenue</CardDescription>
            </div>
            <Link href="/admin/analytics/vendors">
              <Button variant="ghost" size="sm" className="text-primary rounded-lg">View Detailed</Button>
            </Link>
          </CardHeader>
          <div className="p-0">
            {topVendors.map((vendor, i) => (
              <div key={i} className="flex items-center justify-between p-4 px-6 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center text-primary font-bold">
                    {vendor.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-900">{vendor.name}</p>
                    <p className="text-xs text-slate-500">{vendor.orders} Orders this month</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-primary">{vendor.revenue}</p>
                  <div className="flex items-center justify-end gap-1 text-yellow-500 text-[10px] font-bold mt-0.5">
                    <Star className="h-2.5 w-2.5 fill-current" /> {vendor.rating}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 h-fit">
          <Card className="border-none shadow-sm p-6 rounded-3xl bg-slate-900 text-white">
            <p className="text-xs font-bold opacity-60 uppercase tracking-widest">Active Orders</p>
            <h3 className="text-4xl font-bold mt-2">1,204</h3>
            <div className="mt-4 flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <ArrowUpRight className="h-4 w-4" /> 18.5% growth
            </div>
          </Card>
          <Card className="border-none shadow-sm p-6 rounded-3xl bg-primary text-white">
            <p className="text-xs font-bold opacity-60 uppercase tracking-widest">Avg. Completion</p>
            <h3 className="text-4xl font-bold mt-2">18m</h3>
            <div className="mt-4 flex items-center gap-2 text-white/80 text-xs font-bold">
              <Clock className="h-4 w-4" /> Optimal Load
            </div>
          </Card>
          <Card className="border-none shadow-sm p-6 rounded-3xl bg-white sm:col-span-2">
            <CardTitle className="text-sm mb-4">Regional Order Density</CardTitle>
            <div className="space-y-4">
              {[
                { city: 'Lagos Island', count: 420, percent: 85 },
                { city: 'Ikeja', count: 310, percent: 62 },
                { city: 'Lekki Phase 1', count: 120, percent: 24 },
              ].map((region) => (
                <div key={region.city} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span>{region.city}</span>
                    <span>{region.count} orders</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${region.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
