"use client";

import React from 'react';
import { 
  Truck, 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  Phone, 
  MoreHorizontal, 
  CheckCircle2, 
  Clock, 
  User, 
  ShieldAlert,
  Building2
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const drivers = [
  { id: "DRV-101", name: "John Smith", vendor: "Aqua Pure Factory", rating: 4.9, status: "Online", trips: 1245, phone: "+1 555-0101" },
  { id: "DRV-102", name: "Sarah Miller", vendor: "Blue Wave Distro", rating: 4.8, status: "In Delivery", trips: 890, phone: "+1 555-0102" },
  { id: "DRV-103", name: "Mike Johnson", vendor: "Crystal Spring", rating: 4.7, status: "Offline", trips: 2100, phone: "+1 555-0103" },
  { id: "DRV-104", name: "Emily Davis", vendor: "Oasis Flow", rating: 4.5, status: "Online", trips: 420, phone: "+1 555-0104" },
  { id: "DRV-105", name: "Robert Wilson", vendor: "Aqua Pure Factory", rating: 4.9, status: "Offline", trips: 1560, phone: "+1 555-0105" },
];

export default function AdminDriversPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-slate-900">Platform Drivers</h1>
          <p className="text-slate-500">Global fleet management and performance oversight.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl h-11 px-6 bg-white border-slate-200">Broadcast Message</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-white p-6 rounded-3xl">
          <div className="flex justify-between items-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Fleet</p>
            <Truck className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-3xl font-bold mt-2">248</h3>
          <p className="text-xs text-slate-500 mt-1">Across 84 active vendors</p>
        </Card>
        <Card className="border-none shadow-sm bg-white p-6 rounded-3xl">
          <div className="flex justify-between items-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Currently Active</p>
            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
          </div>
          <h3 className="text-3xl font-bold mt-2">142</h3>
          <p className="text-xs text-emerald-600 mt-1">Online and ready for orders</p>
        </Card>
        <Card className="border-none shadow-sm bg-white p-6 rounded-3xl">
          <div className="flex justify-between items-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Avg. Rating</p>
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
          </div>
          <h3 className="text-3xl font-bold mt-2">4.82</h3>
          <p className="text-xs text-slate-500 mt-1">Global driver satisfaction</p>
        </Card>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Search drivers by name, ID, or vendor..." className="pl-10 h-11 rounded-xl bg-white border-slate-200" />
        </div>
        <Button variant="outline" className="h-11 px-6 rounded-xl bg-white border-slate-200 gap-2">
          <Filter className="h-4 w-4" /> Filters
        </Button>
      </div>

      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="pl-8">Driver</TableHead>
              <TableHead>Affiliated Vendor</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Total Trips</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right pr-8">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drivers.map((driver) => (
              <TableRow key={driver.id} className="group hover:bg-slate-50/50">
                <TableCell className="pl-8">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-slate-100">
                      <AvatarImage src={`https://picsum.photos/seed/${driver.id}/100`} />
                      <AvatarFallback>{driver.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-sm text-slate-900">{driver.name}</p>
                      <p className="text-[10px] font-mono text-slate-500 uppercase">{driver.id}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-sm text-slate-600">{driver.vendor}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                    <Star className="h-3 w-3 fill-current" /> {driver.rating}
                  </div>
                </TableCell>
                <TableCell className="text-sm font-medium text-slate-700">
                  {driver.trips.toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge 
                    className={`rounded-full px-3 border-none ${
                      driver.status === 'Online' ? 'bg-emerald-100 text-emerald-700' : 
                      driver.status === 'In Delivery' ? 'bg-blue-100 text-blue-700' : 
                      'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {driver.status}
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
                      <DropdownMenuItem className="gap-2 cursor-pointer">
                        <User className="h-4 w-4" /> View Full Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 cursor-pointer">
                        <Clock className="h-4 w-4" /> Shift History
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
