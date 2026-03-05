"use client";

import React from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  Users, 
  Store, 
  ShoppingBag, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  DollarSign,
  ShieldCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const data = [
  { name: 'Mon', revenue: 4500 },
  { name: 'Tue', revenue: 5200 },
  { name: 'Wed', revenue: 4800 },
  { name: 'Thu', revenue: 6100 },
  { name: 'Fri', revenue: 5900 },
  { name: 'Sat', revenue: 8200 },
  { name: 'Sun', revenue: 7500 },
];

export default function AdminOverviewPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-bold font-headline text-slate-900">Holistic Overview</h1>
          <p className="text-slate-500 mt-1">Platform performance and system health at a glance.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl h-11 px-6 bg-white border-slate-200">Generate Report</Button>
          <Button className="rounded-xl h-11 px-6 shadow-lg shadow-primary/20">System Settings</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Revenue", value: "$142,500.00", icon: DollarSign, trend: "+12.5%", isUp: true, color: "bg-blue-500" },
          { title: "Active Vendors", value: "84", icon: Store, trend: "+4", isUp: true, color: "bg-emerald-500" },
          { title: "Global Orders", value: "12,402", icon: ShoppingBag, trend: "+8.2%", isUp: true, color: "bg-amber-500" },
          { title: "Support Tickets", value: "5", icon: AlertCircle, trend: "-2", isUp: false, color: "bg-rose-500" },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className={`h-12 w-12 ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-inner`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <Badge variant="outline" className={stat.isUp ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-rose-600 bg-rose-50 border-rose-100'}>
                  {stat.trend}
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">{stat.title}</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm p-6 bg-white rounded-3xl">
          <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between mb-6">
            <div>
              <CardTitle className="text-xl">Revenue Growth</CardTitle>
              <CardDescription>Platform-wide transaction volume this week</CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge className="bg-primary/10 text-primary border-none">LIVE</Badge>
            </div>
          </CardHeader>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorAdminRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} tickFormatter={(v) => `$${v}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={4} fillOpacity={1} fill="url(#colorAdminRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="space-y-8">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-slate-900 text-white">
            <CardHeader className="p-6 border-b border-slate-800">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" /> Application Queue
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {[
                { name: "Blue Crystal Water", date: "2h ago", type: "Factory" },
                { name: "Oasis Springs Ltd", date: "5h ago", type: "Distributor" },
              ].map((app, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-slate-800 rounded-xl flex items-center justify-center text-primary font-bold">
                      {app.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white truncate max-w-[120px]">{app.name}</p>
                      <p className="text-[10px] text-slate-400">{app.type} • {app.date}</p>
                    </div>
                  </div>
                  <Link href="/admin/applications">
                    <Button size="sm" variant="ghost" className="h-8 rounded-lg text-primary hover:text-white hover:bg-primary">
                      Review <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              ))}
              <Link href="/admin/applications" className="block pt-2">
                <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 rounded-xl h-10">
                  View All Applications
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="p-6 border-b border-slate-100">
              <CardTitle className="text-lg">System Health</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                  <span>API Response</span>
                  <span className="text-emerald-600">Healthy (45ms)</span>
                </div>
                <Progress value={98} className="h-1.5" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                  <span>Cloud Storage</span>
                  <span className="text-amber-600">82% Capacity</span>
                </div>
                <Progress value={82} className="h-1.5" />
              </div>
              <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-tight">All systems operational</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
