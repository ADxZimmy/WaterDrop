"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Store, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Star, 
  TrendingUp, 
  Package,
  ArrowUpRight,
  ExternalLink,
  FileText,
  History
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

// Mock detailed vendor data
const vendorDetails = {
  id: "1",
  name: "Aqua Pure Factory",
  owner: "John Doe",
  email: "contact@aquapure.com",
  phone: "+234 800 123 4567",
  status: "Active",
  joined: "May 12, 2024",
  address: "123 Industrial Estate, Phase 2, Lagos",
  nafdac: "01-1234L",
  tin: "12345678-0001",
  cac: "RC-998822",
  rating: 4.8,
  reviews: 124,
  totalOrders: 1204,
  totalRevenue: "₦4,250,000.00",
  commissionRate: "10%",
  activeDrivers: 8,
  bio: "Premium purified water direct from the source. We use advanced osmosis and UV filtration to ensure the highest quality for your family."
};

export default function AdminVendorProfilePage() {
  const params = useParams();

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/vendors">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold font-headline text-slate-900">Vendor Profile</h1>
          <p className="text-slate-500">ID: VND-{params?.id || vendorDetails.id}</p>
        </div>
        <Badge className="ml-auto bg-emerald-100 text-emerald-700 border-none px-4 py-1">
          {vendorDetails.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 border-none shadow-sm h-fit rounded-[32px] overflow-hidden">
          <CardContent className="p-8 flex flex-col items-center text-center">
            <Avatar className="h-32 w-32 border-4 border-white shadow-xl mb-6">
              <AvatarImage src={`https://picsum.photos/seed/${params?.id}/200`} />
              <AvatarFallback>{vendorDetails.name[0]}</AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold text-slate-900">{vendorDetails.name}</h2>
            <p className="text-slate-500 text-sm mt-1">Owned by {vendorDetails.owner}</p>
            
            <div className="grid grid-cols-2 w-full gap-4 mt-8">
              <div className="p-4 bg-slate-50 rounded-2xl text-center">
                <Star className="h-4 w-4 text-yellow-500 mx-auto mb-1 fill-current" />
                <p className="text-lg font-bold text-slate-900">{vendorDetails.rating}</p>
                <p className="text-[10px] uppercase text-slate-400 font-bold">Rating</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl text-center">
                <Package className="h-4 w-4 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold text-slate-900">{vendorDetails.totalOrders}</p>
                <p className="text-[10px] uppercase text-slate-400 font-bold">Orders</p>
              </div>
            </div>

            <Separator className="my-8" />

            <div className="w-full space-y-4 text-left">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Email</p>
                  <p className="text-sm font-medium truncate">{vendorDetails.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Phone</p>
                  <p className="text-sm font-medium">{vendorDetails.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Location</p>
                  <p className="text-sm font-medium leading-relaxed">{vendorDetails.address}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm p-6 rounded-[32px] bg-slate-900 text-white">
              <p className="text-xs uppercase font-bold tracking-widest opacity-60">Gross Revenue</p>
              <h3 className="text-3xl font-bold mt-2">{vendorDetails.totalRevenue}</h3>
              <div className="mt-4 flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <ArrowUpRight className="h-4 w-4" /> 12.5% vs last month
              </div>
            </Card>
            <Card className="border-none shadow-sm p-6 rounded-[32px] bg-primary text-white">
              <p className="text-xs uppercase font-bold tracking-widest opacity-60">Platform Commission</p>
              <h3 className="text-3xl font-bold mt-2">{vendorDetails.commissionRate}</h3>
              <p className="text-xs opacity-80 mt-4 italic">Standard Partner Tier</p>
            </Card>
          </div>

          <Card className="border-none shadow-sm rounded-[32px] overflow-hidden">
            <CardHeader className="bg-slate-50 p-8 border-b">
              <CardTitle className="text-xl flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-primary" /> Compliance & Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">NAFDAC Reg</p>
                  <p className="font-mono font-bold text-slate-700">{vendorDetails.nafdac}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TIN Number</p>
                  <p className="font-mono font-bold text-slate-700">{vendorDetails.tin}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CAC Number</p>
                  <p className="font-mono font-bold text-slate-700">{vendorDetails.cac}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-sm text-slate-900 uppercase tracking-tight">Verified Documents</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {['NAFDAC_Certificate.pdf', 'CAC_Registration.pdf', 'Tax_Clearance_2024.pdf'].map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100 cursor-pointer transition-colors group">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-slate-400 group-hover:text-primary" />
                        <span className="text-xs font-medium text-slate-600">{doc}</span>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-300" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-[32px] bg-white p-8">
            <CardTitle className="text-xl mb-4">About the Business</CardTitle>
            <p className="text-slate-600 leading-relaxed text-sm">
              {vendorDetails.bio}
            </p>
            <div className="mt-8 flex gap-4">
              <Link href={`/admin/vendors/${params?.id}/orders`} className="flex-1">
                <Button className="w-full rounded-xl h-12 gap-2">
                  <History className="h-4 w-4" /> View Full Order History
                </Button>
              </Link>
              <Button variant="outline" className="flex-1 rounded-xl h-12 gap-2 border-slate-200">
                <TrendingUp className="h-4 w-4" /> Performance Report
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}