"use client";

import React, { useState } from 'react';
import { TrendingUp, DollarSign, Calendar, ArrowUpRight, ArrowDownRight, Download, Filter, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const weekData = [
  { name: 'Mon', revenue: 12000 },
  { name: 'Tue', revenue: 19000 },
  { name: 'Wed', revenue: 15000 },
  { name: 'Thu', revenue: 25000 },
  { name: 'Fri', revenue: 32000 },
  { name: 'Sat', revenue: 45000 },
  { name: 'Sun', revenue: 38000 },
];

const monthData = [
  { name: 'Week 1', revenue: 120000 },
  { name: 'Week 2', revenue: 145000 },
  { name: 'Week 3', revenue: 110000 },
  { name: 'Week 4', revenue: 165000 },
];

const yearData = [
  { name: 'Jan', revenue: 450000 },
  { name: 'Feb', revenue: 520000 },
  { name: 'Mar', revenue: 480000 },
  { name: 'Apr', revenue: 610000 },
  { name: 'May', revenue: 590000 },
  { name: 'Jun', revenue: 820000 },
  { name: 'Jul', revenue: 750000 },
  { name: 'Aug', revenue: 880000 },
  { name: 'Sep', revenue: 920000 },
  { name: 'Oct', revenue: 950000 },
  { name: 'Nov', revenue: 1100000 },
  { name: 'Dec', revenue: 1250000 },
];

const transactions = [
  { date: "Oct 24, 2024", id: "#5521", customer: "Alice Johnson", status: "Success", amount: "₦4,500.00" },
  { date: "Oct 24, 2024", id: "#5522", customer: "Bob Wilson", status: "Success", amount: "₦1,250.00" },
  { date: "Oct 23, 2024", id: "#5523", customer: "Clara Davis", status: "Processing", amount: "₦3,000.00" },
];

export default function VendorRevenuePage() {
  const [timeRange, setTimeRange] = useState<'Week' | 'Month' | 'Year'>('Week');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const chartData = timeRange === 'Week' ? weekData : timeRange === 'Month' ? monthData : yearData;

  const filteredTransactions = transactions.filter(t => 
    statusFilter === 'All' || t.status === statusFilter
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Revenue Analysis</h1>
          <p className="text-muted-foreground">Detailed breakdown of your store's financial performance.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl h-11 px-6 gap-2">
            <Download className="h-4 w-4" /> Export Report
          </Button>
          <Button className="rounded-xl h-11 px-6 gap-2">
            <Calendar className="h-4 w-4" /> Custom Range
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: "Total Revenue", value: "₦452,100.00", icon: DollarSign, trend: "up", percent: "12.5%" },
          { title: "Avg. Order Value", value: "₦3,240.00", icon: TrendingUp, trend: "up", percent: "4.2%" },
          { title: "Gross Profit", value: "₦184,500.00", icon: DollarSign, trend: "down", percent: "1.8%" },
          { title: "Net Revenue", value: "₦148,800.00", icon: DollarSign, trend: "up", percent: "8.7%" },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs mt-1 flex items-center gap-1 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {stat.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {stat.percent} from last period
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm p-6">
        <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between">
          <div>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>{timeRange}ly sales revenue breakdown</CardDescription>
          </div>
          <div className="flex gap-2">
            {(['Week', 'Month', 'Year'] as const).map((range) => (
              <Button 
                key={range}
                variant="ghost" 
                size="sm" 
                className={cn("rounded-lg h-8 px-4", timeRange === range ? "bg-primary/10 text-primary font-bold" : "text-slate-500")}
                onClick={() => setTimeRange(range)}
              >
                {range}
              </Button>
            ))}
          </div>
        </CardHeader>
        <div className="h-[350px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#26A3DB" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#26A3DB" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#888'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#888'}} tickFormatter={(v) => `₦${v/1000}k`} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#26A3DB" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h3 className="font-bold">Recent Transactions</h3>
            {statusFilter !== 'All' && (
              <Badge variant="secondary" className="text-[10px] h-5">{statusFilter}</Badge>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-3 w-3" /> {statusFilter === 'All' ? 'Filter' : statusFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setStatusFilter('All')}>All Transactions</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('Success')}>Success Only</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('Processing')}>Processing Only</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((row, i) => (
              <TableRow key={i}>
                <TableCell className="text-muted-foreground text-sm">{row.date}</TableCell>
                <TableCell className="font-bold text-primary">{row.id}</TableCell>
                <TableCell>{row.customer}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={row.status === 'Success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'}>
                    {row.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-bold">{row.amount}</TableCell>
              </TableRow>
            ))}
            {filteredTransactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No transactions found for the selected filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
