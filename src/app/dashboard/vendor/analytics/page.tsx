"use client";

import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight, 
  Info,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Package,
  Droplet
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart as RePieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { cn } from "@/lib/utils";

const dailyData = [
  { name: 'Mon', sales: 45000, profit: 12000, orders: 12 },
  { name: 'Tue', sales: 32000, profit: 8000, orders: 8 },
  { name: 'Wed', sales: 58000, profit: 15000, orders: 15 },
  { name: 'Thu', sales: 41000, profit: 11000, orders: 11 },
  { name: 'Fri', sales: 72000, profit: 20000, orders: 18 },
  { name: 'Sat', sales: 95000, profit: 28000, orders: 24 },
  { name: 'Sun', sales: 84000, profit: 24000, orders: 21 },
];

const weeklyData = [
  { name: 'Week 1', sales: 150000, profit: 42000, orders: 85 },
  { name: 'Week 2', sales: 185000, profit: 51000, orders: 102 },
  { name: 'Week 3', sales: 120000, profit: 34000, orders: 68 },
  { name: 'Week 4', sales: 220000, profit: 62000, orders: 124 },
];

const monthlyData = [
  { name: 'Jul', sales: 650000, profit: 180000, orders: 420 },
  { name: 'Aug', sales: 720000, profit: 210000, orders: 480 },
  { name: 'Sep', sales: 680000, profit: 195000, orders: 450 },
  { name: 'Oct', sales: 850000, profit: 245000, orders: 560 },
];

const categoryData = [
  { name: 'Bottled', value: 450 },
  { name: 'Sachet', value: 320 },
  { name: 'Bulk', value: 180 },
  { name: 'Distilled', value: 150 },
];

const COLORS = ['#26A3DB', '#139489', '#FFBB28', '#FF8042'];

export default function VendorAnalyticsPage() {
  const [period, setPeriod] = useState<'days' | 'weeks' | 'months'>('days');

  const chartData = period === 'days' ? dailyData : period === 'weeks' ? weeklyData : monthlyData;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Order Analytics</h1>
          <p className="text-muted-foreground">Comprehensive insights into your water fulfillment operations.</p>
        </div>
        <div className="flex gap-1 bg-muted/50 p-1 rounded-xl">
          {(['days', 'weeks', 'months'] as const).map((p) => (
            <Button 
              key={p}
              variant="ghost" 
              size="sm" 
              className={cn("rounded-lg h-8 px-4 capitalize", period === p && "bg-white shadow-sm text-primary font-bold")}
              onClick={() => setPeriod(p)}
            >
              {p}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Orders", value: "1,204", icon: ShoppingBag, trend: "+12.5%", color: "bg-blue-500" },
          { title: "Fulfillment Rate", value: "98.2%", icon: CheckCircle2, trend: "+0.5%", color: "bg-emerald-500" },
          { title: "Repeat Customers", value: "64%", icon: Users, trend: "+4.2%", color: "bg-amber-500" },
          { title: "Avg. Wait Time", value: "12.5m", icon: Clock, trend: "-2.1m", color: "bg-indigo-500" },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm rounded-3xl p-6 bg-white overflow-hidden relative group">
            <div className={`absolute top-0 left-0 w-1 h-full ${stat.color}`}></div>
            <div className="flex justify-between items-start">
              <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center text-white", stat.color)}>
                <stat.icon className="h-5 w-5" />
              </div>
              <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-600 border-emerald-100">
                {stat.trend}
              </Badge>
            </div>
            <h3 className="text-2xl font-bold mt-4">{stat.value}</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.title}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl p-6 bg-white">
          <CardHeader className="px-0 pt-0 mb-6 flex flex-row items-center justify-between">
            <div>
              <CardTitle>Sales & Profit Overview</CardTitle>
              <CardDescription>Daily financial performance in Naira (₦)</CardDescription>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-tighter">
              <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-[#26A3DB]" /> Revenue</div>
              <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-[#139489]" /> Profit</div>
            </div>
          </CardHeader>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#26A3DB" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#26A3DB" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#139489" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#139489" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} tickFormatter={(v) => `₦${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`₦${value.toLocaleString()}`, '']}
                />
                <Area type="monotone" dataKey="sales" stroke="#26A3DB" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="profit" stroke="#139489" strokeWidth={4} fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl p-6 bg-white">
          <CardHeader className="px-0 pt-0 mb-6">
            <CardTitle>Category Insights</CardTitle>
            <CardDescription>Product type distribution</CardDescription>
          </CardHeader>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
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
                <span className="text-sm font-bold text-slate-900">{((cat.value / 1100) * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm rounded-3xl p-6 bg-slate-900 text-white">
          <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between mb-6">
            <div>
              <CardTitle>Order Velocity</CardTitle>
              <CardDescription className="text-slate-400">Monthly fulfillment volume</CardDescription>
            </div>
            <Package className="h-6 w-6 text-primary" />
          </CardHeader>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <Tooltip 
                  cursor={{fill: '#1e293b'}}
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="orders" fill="#26A3DB" radius={[4, 4, 0, 0]} name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 h-fit">
          <Card className="border-none shadow-sm p-6 rounded-3xl bg-white flex flex-col items-center justify-center text-center">
            <div className="h-14 w-14 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
              <Clock className="h-7 w-7" />
            </div>
            <h4 className="text-3xl font-bold">12.5m</h4>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Avg. Fulfillment</p>
            <p className="text-[10px] text-emerald-600 mt-2 font-bold">-2.1m vs last week</p>
          </Card>
          
          <Card className="border-none shadow-sm p-6 rounded-3xl bg-white flex flex-col items-center justify-center text-center">
            <div className="h-14 w-14 bg-accent/10 rounded-full flex items-center justify-center text-accent mb-4">
              <Droplet className="h-7 w-7" />
            </div>
            <h4 className="text-3xl font-bold">₦3,240</h4>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Avg. Ticket Size</p>
            <p className="text-[10px] text-emerald-600 mt-2 font-bold">+12.5% today</p>
          </Card>

          <Card className="border-none shadow-sm p-6 rounded-3xl bg-white sm:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-sm">Real-time Performance Status</h4>
              <Badge className="bg-emerald-100 text-emerald-700 border-none">OPTIMAL</Badge>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                  <span>System Efficiency</span>
                  <span>98%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '98%' }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                  <span>Driver Availability</span>
                  <span>85%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}