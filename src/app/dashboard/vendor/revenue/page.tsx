"use client";

import React from 'react';
import { TrendingUp, DollarSign, Calendar, ArrowUpRight, ArrowDownRight, Download, Filter } from 'lucide-react';
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

const data = [
  { name: 'Mon', revenue: 1200 },
  { name: 'Tue', revenue: 1900 },
  { name: 'Wed', revenue: 1500 },
  { name: 'Thu', revenue: 2500 },
  { name: 'Fri', revenue: 3200 },
  { name: 'Sat', revenue: 4500 },
  { name: 'Sun', revenue: 3800 },
];

export default function VendorRevenuePage() {
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
          { title: "Total Revenue", value: "$45,210.00", icon: DollarSign, trend: "up", percent: "12.5%" },
          { title: "Avg. Order Value", value: "$32.40", icon: TrendingUp, trend: "up", percent: "4.2%" },
          { title: "Gross Profit", value: "$18,450.00", icon: DollarSign, trend: "down", percent: "1.8%" },
          { title: "Net Revenue", value: "$14,880.00", icon: DollarSign, trend: "up", percent: "8.7%" },
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
            <CardDescription>Daily sales revenue for the current week</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="bg-primary/10 text-primary">Week</Button>
            <Button variant="ghost" size="sm">Month</Button>
            <Button variant="ghost" size="sm">Year</Button>
          </div>
        </CardHeader>
        <div className="h-[350px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#26A3DB" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#26A3DB" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#888'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#888'}} tickFormatter={(v) => `$${v}`} />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#26A3DB" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-bold">Recent Transactions</h3>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-3 w-3" /> Filter
          </Button>
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
            {[
              { date: "Oct 24, 2024", id: "#5521", customer: "Alice Johnson", status: "Success", amount: "$45.00" },
              { date: "Oct 24, 2024", id: "#5522", customer: "Bob Wilson", status: "Success", amount: "$12.50" },
              { date: "Oct 23, 2024", id: "#5523", customer: "Clara Davis", status: "Processing", amount: "$30.00" },
            ].map((row, i) => (
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
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
