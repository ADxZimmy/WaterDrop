"use client";

import React, { useState } from 'react';
import { BarChart3, TrendingUp, PieChart, Users, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart as RePieChart, Pie, Cell 
} from 'recharts';
import { cn } from "@/lib/utils";

const dailyData = [
  { name: 'Mon', sales: 4000, profit: 2400 },
  { name: 'Tue', sales: 3000, profit: 1398 },
  { name: 'Wed', sales: 2000, profit: 9800 },
  { name: 'Thu', sales: 2780, profit: 3908 },
  { name: 'Fri', sales: 1890, profit: 4800 },
  { name: 'Sat', sales: 2390, profit: 3800 },
  { name: 'Sun', sales: 3490, profit: 4300 },
];

const weeklyData = [
  { name: 'Week 1', sales: 15000, profit: 8400 },
  { name: 'Week 2', sales: 18000, profit: 9200 },
  { name: 'Week 3', sales: 12000, profit: 6800 },
  { name: 'Week 4', sales: 22000, profit: 11500 },
];

const monthlyData = [
  { name: 'Jul', sales: 65000, profit: 32000 },
  { name: 'Aug', sales: 72000, profit: 38000 },
  { name: 'Sep', sales: 68000, profit: 34000 },
  { name: 'Oct', sales: 85000, profit: 42000 },
];

const categoryData = [
  { name: 'Bottled', value: 400 },
  { name: 'Sachet', value: 300 },
  { name: 'Bulk', value: 300 },
  { name: 'Accessories', value: 200 },
];

const COLORS = ['#26A3DB', '#139489', '#FFBB28', '#FF8042'];

export default function VendorAnalyticsPage() {
  const [period, setPeriod] = useState<'days' | 'weeks' | 'months'>('days');

  const chartData = period === 'days' ? dailyData : period === 'weeks' ? weeklyData : monthlyData;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Business Analytics</h1>
        <p className="text-muted-foreground">Deep dive into your sales patterns and business health.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl p-6">
          <CardHeader className="px-0 pt-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Revenue vs Profit</CardTitle>
              <CardDescription>Comparison of total sales against net profit</CardDescription>
            </div>
            <div className="flex gap-1 bg-muted/50 p-1 rounded-xl">
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn("rounded-lg h-8 px-4", period === 'days' && "bg-white shadow-sm text-primary")}
                onClick={() => setPeriod('days')}
              >
                Days
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn("rounded-lg h-8 px-4", period === 'weeks' && "bg-white shadow-sm text-primary")}
                onClick={() => setPeriod('weeks')}
              >
                Weeks
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn("rounded-lg h-8 px-4", period === 'months' && "bg-white shadow-sm text-primary")}
                onClick={() => setPeriod('months')}
              >
                Months
              </Button>
            </div>
          </CardHeader>
          <div className="h-[300px] w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f5f5f5'}} 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="sales" fill="#26A3DB" radius={[4, 4, 0, 0]} name="Total Sales" />
                <Bar dataKey="profit" fill="#139489" radius={[4, 4, 0, 0]} name="Net Profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle>Sales by Category</CardTitle>
            <CardDescription>Distribution across product types</CardDescription>
          </CardHeader>
          <div className="h-[250px] w-full mt-4">
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
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-4">
            {categoryData.map((cat, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-muted-foreground">{cat.name}</span>
                </div>
                <span className="font-bold">{((cat.value / 1200) * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card className="border-none shadow-sm rounded-3xl p-6">
          <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Customer Retention</CardTitle>
            <Info className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <div className="flex flex-col items-center justify-center h-[200px]">
            <h3 className="text-5xl font-bold font-headline text-primary">84%</h3>
            <p className="text-sm text-muted-foreground mt-2 font-medium">Monthly Active Return Rate</p>
            <div className="flex items-center gap-2 text-green-600 mt-4 bg-green-50 px-3 py-1 rounded-full text-xs font-bold">
              <ArrowUpRight className="h-3 w-3" /> +5.2%
            </div>
          </div>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-lg">Avg. Fulfillment Time</CardTitle>
          </CardHeader>
          <div className="flex flex-col items-center justify-center h-[200px]">
            <h3 className="text-5xl font-bold font-headline text-accent">12.5m</h3>
            <p className="text-sm text-muted-foreground mt-2 font-medium">Minutes from order to dispatch</p>
            <div className="flex items-center gap-2 text-green-600 mt-4 bg-green-50 px-3 py-1 rounded-full text-xs font-bold">
              <ArrowDownRight className="h-3 w-3" /> -2.1m faster
            </div>
          </div>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl p-6 bg-primary text-white">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-lg text-white">Projected Growth</CardTitle>
          </CardHeader>
          <div className="space-y-6 mt-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="opacity-80">Next Month Target</span>
                <span className="font-bold">$52,000</span>
              </div>
              <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white w-3/4 rounded-full" />
              </div>
            </div>
            <p className="text-xs opacity-70 leading-relaxed">
              Based on your current trajectory, you are 75% likely to hit your Q4 targets. 
              Adding 2 more drivers could increase efficiency by 12%.
            </p>
            <Button variant="secondary" className="w-full rounded-xl bg-white text-primary">View Strategy</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}