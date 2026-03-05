
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Store, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Star, 
  MapPin, 
  ShoppingBag, 
  ArrowUpRight,
  User,
  ShieldAlert,
  XCircle,
  History,
  ExternalLink,
  Plus
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const initialVendors = [
  { id: 1, name: "Aqua Pure Factory", owner: "John Doe", status: "Active", orders: 1204, rating: 4.8, revenue: "$42,500", joined: "May 2024" },
  { id: 2, name: "Blue Wave Distro", owner: "Sarah Smith", status: "Active", orders: 890, rating: 4.5, revenue: "$28,200", joined: "Jun 2024" },
  { id: 3, name: "Crystal Spring", owner: "Michael Scott", status: "Warning", orders: 450, rating: 3.9, revenue: "$12,400", joined: "Jul 2024" },
  { id: 4, name: "Oasis Flow", owner: "Janice Miller", status: "Active", orders: 670, rating: 4.7, revenue: "$19,800", joined: "Aug 2024" },
];

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState(initialVendors);
  const { toast } = useToast();

  const handleUpdateStatus = (id: number, newStatus: string) => {
    setVendors(prev => prev.map(v => v.id === id ? { ...v, status: newStatus } : v));
    toast({
      title: "Vendor Status Updated",
      description: `Vendor has been set to ${newStatus}.`,
      variant: newStatus === 'Suspended' ? 'destructive' : 'default',
    });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-slate-900">Partner Vendors</h1>
          <p className="text-slate-500">Managing all verified water suppliers on the platform.</p>
        </div>
        <Link href="/admin/vendors/new">
          <Button className="rounded-xl h-11 px-6 shadow-lg shadow-primary/20 gap-2">
            <Plus className="h-4 w-4" /> Add New Vendor
          </Button>
        </Link>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Search vendors by name, ID or owner..." className="pl-10 h-11 rounded-xl bg-white border-slate-200" />
        </div>
        <Button variant="outline" className="h-11 px-6 rounded-xl bg-white border-slate-200 gap-2">
          <Filter className="h-4 w-4" /> Filters
        </Button>
      </div>

      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="pl-8">Vendor</TableHead>
              <TableHead>Performance</TableHead>
              <TableHead>Total Orders</TableHead>
              <TableHead>Revenue Share</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right pr-8">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.map((vendor) => (
              <TableRow key={vendor.id} className="group hover:bg-slate-50/50">
                <TableCell className="pl-8">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-slate-100">
                      <AvatarImage src={`https://picsum.photos/seed/${vendor.id}/100`} />
                      <AvatarFallback>{vendor.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-sm text-slate-900">{vendor.name}</p>
                      <p className="text-xs text-slate-500">{vendor.owner}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                    <Star className="h-3 w-3 fill-current" /> {vendor.rating}
                  </div>
                </TableCell>
                <TableCell className="font-medium text-slate-700">{vendor.orders.toLocaleString()}</TableCell>
                <TableCell className="font-bold text-primary">{vendor.revenue}</TableCell>
                <TableCell className="text-sm text-slate-500">{vendor.joined}</TableCell>
                <TableCell>
                  <Badge 
                    className={`rounded-full px-3 border-none ${
                      vendor.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 
                      vendor.status === 'Warning' ? 'bg-amber-100 text-amber-700' : 
                      'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {vendor.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right pr-8">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-slate-100">
                      <DropdownMenuItem className="gap-2 cursor-pointer" asChild>
                        <Link href={`/admin/vendors/${vendor.id}`}>
                          <User className="h-4 w-4" /> View Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 cursor-pointer" asChild>
                        <Link href={`/admin/vendors/${vendor.id}/orders`}>
                          <History className="h-4 w-4" /> Order History
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="gap-2 text-amber-600 cursor-pointer"
                        onClick={() => handleUpdateStatus(vendor.id, 'Warning')}
                      >
                        <ShieldAlert className="h-4 w-4" /> Issue Warning
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="gap-2 text-rose-600 cursor-pointer"
                        onClick={() => handleUpdateStatus(vendor.id, 'Suspended')}
                      >
                        <XCircle className="h-4 w-4" /> Suspend Vendor
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
