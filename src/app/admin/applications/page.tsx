"use client";

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Store, 
  MapPin, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  ArrowLeft,
  Building2,
  Info,
  Clock,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

const initialApps = [
  { 
    id: "APP-8821", 
    businessName: "Blue Crystal Water Ltd", 
    type: "Factory", 
    owner: "Samuel Adams", 
    date: "Oct 24, 2024", 
    status: "Pending",
    nafdac: "01-1234L",
    tin: "12345678-0001",
    cac: "RC-998822",
    address: "123 Industrial Estate, Phase 2"
  },
  { 
    id: "APP-8815", 
    businessName: "Oasis Flow Distribution", 
    type: "Distributor", 
    owner: "Janice Miller", 
    date: "Oct 23, 2024", 
    status: "Pending",
    nafdac: "01-5566X",
    tin: "88776655-0002",
    cac: "BN-443311",
    address: "Way 4, Port Road Junction"
  },
  { 
    id: "APP-8790", 
    businessName: "Pure Life Springs", 
    type: "Factory", 
    owner: "Michael Scott", 
    date: "Oct 20, 2024", 
    status: "Approved",
    nafdac: "01-0099Z",
    tin: "11223344-0005",
    cac: "RC-112233",
    address: "Crystal Valley, North Side"
  },
];

export default function AdminApplicationsPage() {
  const [apps, setApps] = useState(initialApps);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const { toast } = useToast();

  const handleApprove = (id: string) => {
    setApps(apps.map(a => a.id === id ? { ...a, status: 'Approved' } : a));
    setSelectedApp(null);
    toast({
      title: "Vendor Approved",
      description: "Business has been activated and the vendor notified.",
    });
  };

  const handleReject = (id: string) => {
    setApps(apps.map(a => a.id === id ? { ...a, status: 'Rejected' } : a));
    setSelectedApp(null);
    toast({
      title: "Application Rejected",
      variant: "destructive",
      description: "The application has been declined.",
    });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-slate-900">Vendor Applications</h1>
          <p className="text-slate-500">Review and verify new business registrations.</p>
        </div>
      </div>

      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="pl-8">Application ID</TableHead>
              <TableHead>Business Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date Submitted</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right pr-8">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apps.map((app) => (
              <TableRow key={app.id} className="group hover:bg-slate-50/50">
                <TableCell className="pl-8 font-mono text-xs font-bold text-slate-500">{app.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-slate-100 rounded-lg flex items-center justify-center text-primary font-bold">
                      {app.businessName[0]}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900">{app.businessName}</p>
                      <p className="text-xs text-slate-500">{app.owner}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="rounded-full border-slate-200 text-slate-600 font-medium">
                    {app.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" /> {app.date}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    className={`rounded-full px-3 border-none ${
                      app.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 
                      app.status === 'Pending' ? 'bg-amber-100 text-amber-700 animate-pulse' : 
                      'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {app.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right pr-8">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-lg h-8 gap-2 border-slate-200 hover:bg-primary hover:text-white hover:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-500"
                    onClick={() => setSelectedApp(app)}
                    disabled={app.status === 'Approved'}
                  >
                    <Eye className="h-3.5 w-3.5" /> Inspect
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Inspection Modal */}
      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="sm:max-w-2xl p-0 border-none overflow-hidden rounded-[32px] shadow-2xl">
          <div className="bg-slate-900 p-8 text-white relative">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="h-8 w-8 text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Compliance Verification</span>
            </div>
            <DialogTitle className="text-3xl font-bold font-headline">{selectedApp?.businessName}</DialogTitle>
            <DialogDescription className="text-slate-400 mt-2">
              Reviewing {selectedApp?.type} application from {selectedApp?.owner}.
            </DialogDescription>
          </div>

          <div className="p-8 bg-white max-h-[60vh] overflow-y-auto space-y-8">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">NAFDAC Number</p>
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 font-mono font-bold text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  {selectedApp?.nafdac}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TIN Number</p>
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 font-mono font-bold text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  {selectedApp?.tin}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold flex items-center gap-2 text-slate-900">
                <Building2 className="h-5 w-5 text-primary" /> Business Location
              </h4>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-sm text-slate-600 leading-relaxed">
                  <MapPin className="h-4 w-4 inline mr-2 text-slate-400" />
                  {selectedApp?.address}
                </p>
                <Button variant="link" size="sm" className="h-auto p-0 mt-2 text-xs gap-1">
                  <ExternalLink className="h-3 w-3" /> View on Satellite Map
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold flex items-center gap-2 text-slate-900">
                <FileText className="h-5 w-5 text-primary" /> Uploaded Documents
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {['NAFDAC_Cert.pdf', 'CAC_Reg_Docs.pdf', 'Utility_Bill.jpg'].map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                    <span className="text-xs font-medium text-slate-600 truncate max-w-[150px]">{doc}</span>
                    <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg">
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="p-8 bg-slate-50 border-t flex justify-end gap-3">
            <Button 
              variant="outline" 
              className="rounded-xl h-12 px-8 border-rose-200 text-rose-600 hover:bg-rose-50"
              onClick={() => handleReject(selectedApp?.id)}
            >
              <XCircle className="h-4 w-4 mr-2" /> Reject
            </Button>
            <Button 
              className="rounded-xl h-12 px-10 shadow-lg shadow-primary/20"
              onClick={() => handleApprove(selectedApp?.id)}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" /> Approve Business
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
