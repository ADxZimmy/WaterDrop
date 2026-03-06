"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  TrendingUp, 
  Star, 
  ShoppingBag, 
  DollarSign, 
  Search,
  Filter,
  ArrowUpRight,
  Trophy,
  Medal,
  Award,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const allVendorsRanked = [
  { id: 1, name: "Aqua Pure Factory", revenue: 1245000, orders: 420, rating: 4.9, status: "Active" },
  { id: 2, name: "Blue Wave Distro", revenue: 920000, orders: 310, rating: 4.8, status: "Active" },
  { id: 3, name: "Crystal Spring", revenue: 880000, orders: 280, rating: 4.7, status: "Warning" },
  { id: 4, name: "Oasis Flow", revenue: 750000, orders: 240, rating: 4.5, status: "Active" },
  { id: 5, name: "Pure Life Springs", revenue: 620000, orders: 190, rating: 4.6, status: "Active" },
  { id: 6, name: "Deep Well Co", revenue: 510000, orders: 150, rating: 4.4, status: "Active" },
  { id: 7, name: "Nature's Gift", revenue: 420000, orders: 120, rating: 4.2, status: "Suspended" },
  { id: 8, name: "Arctic Chill", revenue: 380000, orders: 110, rating: 4.3, status: "Active" },
  { id: 9, name: "Clear Stream Ltd", revenue: 310000, orders: 95, rating: 4.1, status: "Active" },
  { id: 10, name: "Hydra Flow", revenue: 285000, orders: 82, rating: 4.0, status: "Active" },
];

export default function AdminVendorRankingsPage() {
  const [search, setSearch] = useState("");

  const filteredRankings = useMemo(() => {
    return allVendorsRanked
      .filter(v => v.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.revenue - a.revenue);
  }, [search]);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 1: return <Medal className="h-5 w-5 text-slate-400" />;
      case 2: return <Award className="h-5 w-5 text-amber-600" />;
      default: return <span className="text-xs font-bold text-slate-400">#{index + 1}</span>;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/analytics">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold font-headline text-slate-900">Vendor Performance rankings</h1>
          <p className="text-slate-500">Global leaderboard based on monthly gross revenue.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-slate-900 text-white p-6 rounded-[32px]">
          <p className="text-xs uppercase font-bold tracking-widest opacity-60">Highest Earner</p>
          <h3 className="text-2xl font-bold mt-2">Aqua Pure Factory</h3>
          <div className="mt-4 flex items-center gap-2 text-emerald-400 text-xs font-bold">
            <TrendingUp className="h-4 w-4" /> Leading by ₦325k
          </div>
        </Card>
        <Card className="border-none shadow-sm bg-primary text-white p-6 rounded-[32px]">
          <p className="text-xs uppercase font-bold tracking-widest opacity-60">Avg. Revenue / Vendor</p>
          <h3 className="text-2xl font-bold mt-2">₦682,000</h3>
          <div className="mt-4 text-white/80 text-xs font-bold">
            Based on active platform vendors
          </div>
        </Card>
        <Card className="border-none shadow-sm bg-white p-6 rounded-[32px]">
          <p className="text-xs uppercase font-bold tracking-widest text-slate-400">Top Satisfaction</p>
          <h3 className="text-2xl font-bold mt-2">Crystal Spring</h3>
          <div className="mt-4 flex items-center gap-1 text-yellow-500 text-xs font-bold">
            <Star className="h-4 w-4 fill-current" /> 4.9 Rating
          </div>
        </Card>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search vendors by name..." 
            className="pl-10 h-11 rounded-xl bg-white border-slate-200"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-11 px-6 rounded-xl bg-white border-slate-200 gap-2">
          <Filter className="h-4 w-4" /> Rank Filters
        </Button>
      </div>

      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[80px] pl-8 text-center">Rank</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Monthly Revenue</TableHead>
              <TableHead>Total Orders</TableHead>
              <TableHead>Avg. Rating</TableHead>
              <TableHead className="pr-8">Compliance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRankings.map((vendor, index) => (
              <TableRow key={vendor.id} className="group hover:bg-slate-50/50">
                <TableCell className="pl-8 text-center">
                  <div className="flex justify-center">
                    {getRankIcon(index)}
                  </div>
                </TableCell>
                <TableCell>
                  <Link href={`/admin/vendors/${vendor.id}`} className="group/vendor">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-slate-100 group-hover/vendor:border-primary/30 transition-colors">
                        <AvatarImage src={`https://picsum.photos/seed/${vendor.id}/100`} />
                        <AvatarFallback>{vendor.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-slate-900 group-hover/vendor:text-primary transition-colors">{vendor.name}</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-tighter">VND-{vendor.id}</span>
                      </div>
                    </div>
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 font-bold text-slate-900">
                    ₦{vendor.revenue.toLocaleString()}
                    {index < 3 && <ArrowUpRight className="h-3 w-3 text-emerald-500" />}
                  </div>
                </TableCell>
                <TableCell className="text-sm font-medium text-slate-600">
                  {vendor.orders.toLocaleString()} orders
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                    <Star className="h-3 w-3 fill-current" /> {vendor.rating}
                  </div>
                </TableCell>
                <TableCell className="pr-8">
                  <Link href={`/admin/vendors/${vendor.id}`}>
                    <Badge 
                      className={`rounded-full px-3 border-none text-[10px] font-bold cursor-pointer hover:opacity-80 transition-opacity ${
                        vendor.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 
                        vendor.status === 'Warning' ? 'bg-amber-100 text-amber-700' : 
                        'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {vendor.status}
                    </Badge>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
