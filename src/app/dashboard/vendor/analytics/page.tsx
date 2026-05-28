"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock3,
  DollarSign,
  Package,
  ShoppingBag,
  Users,
} from 'lucide-react';
import type { VendorDashboardSummary } from "@/lib/vendor/summary-types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardSkeleton } from "@/components/ui/loading-skeletons";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  Pie,
  PieChart as RePieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { cn } from "@/lib/utils";

const COLORS = ['#26A3DB', '#139489', '#FFBB28', '#FF8042'];

function formatMinutes(value: number | null) {
  if (value === null) {
    return "N/A";
  }

  if (value < 60) {
    return `${value}m`;
  }

  const hours = value / 60;
  return `${hours.toFixed(hours >= 10 ? 0 : 1)}h`;
}

export default function VendorAnalyticsPage() {
  const [summary, setSummary] = useState<VendorDashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'days' | 'weeks' | 'months'>('days');

  useEffect(() => {
    let isMounted = true;

    const loadSummary = async () => {
      try {
        const response = await fetch('/api/vendor/summary', { method: 'GET' });
        if (!response.ok) {
          throw new Error('Unable to load analytics.');
        }

        const payload: VendorDashboardSummary = await response.json();
        if (isMounted) {
          setSummary(payload);
        }
      } catch {
        if (isMounted) {
          setSummary(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadSummary();
    return () => {
      isMounted = false;
    };
  }, []);

  const chartData = summary?.charts[period] ?? [];
  const profile = summary?.profile ?? null;
  const stockHealth = useMemo(() => {
    if (!summary || summary.summary.activeProducts === 0) {
      return 100;
    }

    return Math.max(
      0,
      Math.round(
        ((summary.summary.activeProducts - summary.summary.lowStockCount) /
          summary.summary.activeProducts) *
          100
      )
    );
  }, [summary]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!profile || profile.status !== 'approved') {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <Card className="border-none shadow-sm p-10 text-center">
          <CardContent className="p-0 space-y-4">
            <h1 className="text-3xl font-bold font-headline">Analytics unlock after approval</h1>
            <p className="text-muted-foreground">
              Complete onboarding and receive vendor approval before WaterDrop starts tracking your operational analytics here.
            </p>
            <div className="flex justify-center gap-3">
              <Link href="/auth/onboarding/vendor">
                <Button className="rounded-xl">Review Application</Button>
              </Link>
              <Link href="/dashboard/vendor">
                <Button variant="outline" className="rounded-xl">Back to Overview</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Order Analytics</h1>
          <p className="text-muted-foreground">
            Live revenue, order volume, and catalog health for {profile.businessName}.
          </p>
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
          {
            title: "Total Orders",
            value: `${summary?.summary.totalOrders ?? 0}`,
            subtitle: `${summary?.summary.activeOrders ?? 0} active`,
            icon: ShoppingBag,
            color: "bg-blue-500",
          },
          {
            title: "Gross Revenue",
            value: `₦${summary?.summary.grossRevenueNaira.toLocaleString() ?? "0"}`,
            subtitle: `₦${summary?.summary.monthlyRevenueNaira.toLocaleString() ?? "0"} this month`,
            icon: DollarSign,
            color: "bg-emerald-500",
          },
          {
            title: "Unique Customers",
            value: `${summary?.summary.uniqueCustomers ?? 0}`,
            subtitle: `${summary?.summary.deliveredOrders ?? 0} delivered orders`,
            icon: Users,
            color: "bg-amber-500",
          },
          {
            title: "Fulfillment Rate",
            value: `${summary?.summary.fulfillmentRate ?? 0}%`,
            subtitle: `${summary?.summary.cancelledOrders ?? 0} cancelled`,
            icon: CheckCircle2,
            color: "bg-indigo-500",
          },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm rounded-3xl p-6 bg-white overflow-hidden relative group">
            <div className={`absolute top-0 left-0 w-1 h-full ${stat.color}`}></div>
            <div className="flex justify-between items-start">
              <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center text-white", stat.color)}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mt-4">{stat.value}</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.title}</p>
            <p className="text-xs text-muted-foreground mt-2">{stat.subtitle}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl p-6 bg-white">
          <CardHeader className="px-0 pt-0 mb-6 flex flex-row items-center justify-between">
            <div>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Revenue generated from non-cancelled orders</CardDescription>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-tighter">
              <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-[#26A3DB]" /> Revenue</div>
            </div>
          </CardHeader>
          {summary && summary.summary.totalOrders > 0 ? (
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#26A3DB" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#26A3DB" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} tickFormatter={(v) => `₦${Math.round(v / 1000)}k`} />
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`₦${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#26A3DB" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[350px] w-full flex items-center justify-center text-center text-sm text-muted-foreground">
              Revenue charts will appear once customers place orders with this vendor.
            </div>
          )}
        </Card>

        <Card className="border-none shadow-sm rounded-3xl p-6 bg-white">
          <CardHeader className="px-0 pt-0 mb-6">
            <CardTitle>Category Insights</CardTitle>
            <CardDescription>Active catalog listings by category</CardDescription>
          </CardHeader>
          {summary && summary.categoryInsights.length > 0 ? (
            <>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={summary.categoryInsights}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {summary.categoryInsights.map((entry, index) => (
                        <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4 mt-6">
                {summary.categoryInsights.map((category, index) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-sm font-medium text-slate-600">{category.name}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{category.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[250px] w-full flex items-center justify-center text-center text-sm text-muted-foreground">
              Add active products to see category breakdowns here.
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm rounded-3xl p-6 bg-slate-900 text-white">
          <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between mb-6">
            <div>
              <CardTitle>Order Velocity</CardTitle>
              <CardDescription className="text-slate-400">Order counts for the selected time window</CardDescription>
            </div>
            <Package className="h-6 w-6 text-primary" />
          </CardHeader>
          {summary && summary.summary.totalOrders > 0 ? (
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
          ) : (
            <div className="h-[250px] w-full flex items-center justify-center text-center text-sm text-slate-400">
              Order volume will appear here as soon as the vendor receives live customer orders.
            </div>
          )}
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 h-fit">
          <Card className="border-none shadow-sm p-6 rounded-3xl bg-white flex flex-col items-center justify-center text-center">
            <div className="h-14 w-14 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
              <Clock3 className="h-7 w-7" />
            </div>
            <h4 className="text-3xl font-bold">{formatMinutes(summary?.summary.averageFulfillmentMinutes ?? null)}</h4>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Avg. Fulfillment</p>
            <p className="text-[10px] text-muted-foreground mt-2 font-bold">
              Based on delivered orders only
            </p>
          </Card>
          
          <Card className="border-none shadow-sm p-6 rounded-3xl bg-white flex flex-col items-center justify-center text-center">
            <div className="h-14 w-14 bg-accent/10 rounded-full flex items-center justify-center text-accent mb-4">
              <DollarSign className="h-7 w-7" />
            </div>
            <h4 className="text-3xl font-bold">₦{summary?.summary.averageOrderValueNaira.toLocaleString() ?? "0"}</h4>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Avg. Ticket Size</p>
            <p className="text-[10px] text-muted-foreground mt-2 font-bold">
              Non-cancelled orders only
            </p>
          </Card>

          <Card className="border-none shadow-sm p-6 rounded-3xl bg-white sm:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-sm">Operational Snapshot</h4>
              <Badge className={cn(
                "border-none",
                summary && summary.summary.lowStockCount > 0
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-emerald-100 text-emerald-700"
              )}>
                {summary && summary.summary.lowStockCount > 0 ? "ATTENTION NEEDED" : "HEALTHY"}
              </Badge>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                  <span>Fulfillment Progress</span>
                  <span>{summary?.summary.fulfillmentRate ?? 0}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${summary?.summary.fulfillmentRate ?? 0}%` }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                  <span>Catalog Health</span>
                  <span>{stockHealth}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: `${stockHealth}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2 text-sm">
                <div className="rounded-2xl bg-muted/40 p-3">
                  <p className="text-muted-foreground text-xs uppercase font-bold">Active Products</p>
                  <p className="font-bold mt-1">{summary?.summary.activeProducts ?? 0}</p>
                </div>
                <div className="rounded-2xl bg-muted/40 p-3">
                  <p className="text-muted-foreground text-xs uppercase font-bold">Low Stock Alerts</p>
                  <p className="font-bold mt-1">{summary?.summary.lowStockCount ?? 0}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
