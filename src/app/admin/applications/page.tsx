"use client";

import React, { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  MapPin,
  ShieldCheck,
  Store,
  XCircle,
} from 'lucide-react';
import type { AdminVendorReviewRecord } from "@/lib/admin/vendor-review-types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ListPageSkeleton } from "@/components/ui/loading-skeletons";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type AdminVendorsResponse = {
  vendors: AdminVendorReviewRecord[];
};

function getStatusLabel(status: AdminVendorReviewRecord["status"]) {
  if (status === "approved") {
    return "Approved";
  }

  if (status === "rejected") {
    return "Rejected";
  }

  return "Pending";
}

function getStatusClassName(status: AdminVendorReviewRecord["status"]) {
  if (status === "approved") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "rejected") {
    return "bg-rose-100 text-rose-700";
  }

  return "bg-amber-100 text-amber-700 animate-pulse";
}

function formatApplicationDate(timestamp: number | null) {
  if (!timestamp) {
    return "Unknown";
  }

  return new Date(timestamp).toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminApplicationsPage() {
  const [apps, setApps] = useState<AdminVendorReviewRecord[]>([]);
  const [selectedApp, setSelectedApp] = useState<AdminVendorReviewRecord | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingStatus, setIsSavingStatus] = useState<"approved" | "rejected" | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    const loadApplications = async () => {
      try {
        const response = await fetch('/api/admin/vendors', { method: 'GET' });
        if (!response.ok) {
          throw new Error('Unable to load vendor applications.');
        }

        const payload: AdminVendorsResponse = await response.json();
        if (isMounted) {
          setApps(payload.vendors ?? []);
        }
      } catch (error) {
        if (isMounted) {
          setApps([]);
          toast({
            title: "Applications unavailable",
            description: error instanceof Error ? error.message : "Unable to load vendor applications.",
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadApplications();
    return () => {
      isMounted = false;
    };
  }, [toast]);

  const counts = useMemo(
    () => ({
      pending: apps.filter((app) => app.status === "pending").length,
      approved: apps.filter((app) => app.status === "approved").length,
      rejected: apps.filter((app) => app.status === "rejected").length,
    }),
    [apps]
  );

  const openApplication = (application: AdminVendorReviewRecord) => {
    setSelectedApp(application);
    setReviewNotes(application.reviewNotes ?? "");
  };

  const closeApplication = () => {
    if (isSavingStatus) {
      return;
    }

    setSelectedApp(null);
    setReviewNotes("");
  };

  const handleStatusUpdate = async (status: "approved" | "rejected") => {
    if (!selectedApp) {
      return;
    }

    if (status === "rejected" && reviewNotes.trim().length === 0) {
      toast({
        title: "Review note required",
        description: "Add a short reason so the vendor knows what to fix before resubmitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingStatus(status);

    try {
      const response = await fetch(`/api/admin/vendors/${selectedApp.vendorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          reviewNotes: reviewNotes.trim(),
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? 'Unable to update vendor status.');
      }

      const payload = await response.json();
      const updatedApplication = payload.vendor as AdminVendorReviewRecord;
      setApps((current) =>
        current.map((application) =>
          application.vendorId === updatedApplication.vendorId ? updatedApplication : application
        )
      );
      closeApplication();
      toast({
        title: status === "approved" ? "Vendor Approved" : "Application Rejected",
        description:
          status === "approved"
            ? "The business is now verified and can operate on WaterDrop."
            : "The vendor can review the feedback and resubmit their application.",
        variant: status === "approved" ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Review Failed",
        description: error instanceof Error ? error.message : "Unable to update vendor status.",
        variant: "destructive",
      });
    } finally {
      setIsSavingStatus(null);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-slate-900">Vendor Applications</h1>
          <p className="text-slate-500">Review and verify new business registrations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm rounded-3xl bg-white">
          <CardContent className="p-6">
            <p className="text-xs uppercase font-bold tracking-widest text-slate-400">Pending Reviews</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-2">{counts.pending}</h3>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-3xl bg-white">
          <CardContent className="p-6">
            <p className="text-xs uppercase font-bold tracking-widest text-slate-400">Approved Vendors</p>
            <h3 className="text-3xl font-bold text-emerald-600 mt-2">{counts.approved}</h3>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-3xl bg-white">
          <CardContent className="p-6">
            <p className="text-xs uppercase font-bold tracking-widest text-slate-400">Rejected Applications</p>
            <h3 className="text-3xl font-bold text-rose-600 mt-2">{counts.rejected}</h3>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        {isLoading ? (
          <ListPageSkeleton rows={5} className="max-w-none px-0 py-0" />
        ) : apps.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <h2 className="text-xl font-bold text-slate-900">No vendor applications yet</h2>
            <p className="text-sm text-slate-500">
              New vendor registrations will appear here for admin review.
            </p>
          </div>
        ) : (
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
                <TableRow key={app.vendorId} className="group hover:bg-slate-50/50">
                  <TableCell className="pl-8 font-mono text-xs font-bold text-slate-500">
                    {app.vendorId.slice(0, 8).toUpperCase()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 bg-slate-100 rounded-lg flex items-center justify-center text-primary font-bold">
                        {app.businessName[0]}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-900">{app.businessName}</p>
                        <p className="text-xs text-slate-500">{app.ownerName}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="rounded-full border-slate-200 text-slate-600 font-medium">
                      {app.businessType ?? "Vendor"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" /> {formatApplicationDate(app.submittedAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`rounded-full px-3 border-none ${getStatusClassName(app.status)}`}>
                      {getStatusLabel(app.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg h-8 gap-2 border-slate-200 hover:bg-primary hover:text-white hover:border-primary transition-all"
                      onClick={() => openApplication(app)}
                    >
                      <Eye className="h-3.5 w-3.5" /> Inspect
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={!!selectedApp} onOpenChange={(open) => !open && closeApplication()}>
        <DialogContent className="sm:max-w-2xl p-0 border-none overflow-hidden rounded-[32px] shadow-2xl">
          <div className="bg-slate-900 p-8 text-white relative">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="h-8 w-8 text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Compliance Review</span>
            </div>
            <DialogTitle className="text-3xl font-bold font-headline">
              {selectedApp?.businessName}
            </DialogTitle>
            <DialogDescription className="text-slate-400 mt-2">
              Reviewing {selectedApp?.businessType ?? "vendor"} application from {selectedApp?.ownerName}.
            </DialogDescription>
          </div>

          <div className="p-8 bg-white max-h-[60vh] overflow-y-auto space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">NAFDAC Number</p>
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 font-mono font-bold text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  {selectedApp?.nafdacNumber ?? "Not submitted"}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CAC Number</p>
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 font-mono font-bold text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  {selectedApp?.cacNumber ?? "Not submitted"}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TIN Number</p>
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 font-mono font-bold text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  {selectedApp?.taxId ?? "Not submitted"}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Submitted</p>
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 font-bold text-slate-700">
                  <Clock3 className="h-4 w-4 text-primary" />
                  {formatApplicationDate(selectedApp?.submittedAt ?? null)}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold flex items-center gap-2 text-slate-900">
                <Building2 className="h-5 w-5 text-primary" /> Business Summary
              </h4>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-3 text-sm text-slate-600">
                <p><strong className="text-slate-900">Owner:</strong> {selectedApp?.ownerName} ({selectedApp?.ownerEmail || "No email"})</p>
                {selectedApp?.ownerPhone && (
                  <p><strong className="text-slate-900">Phone:</strong> {selectedApp.ownerPhone}</p>
                )}
                <p className="leading-relaxed">
                  <MapPin className="h-4 w-4 inline mr-2 text-slate-400" />
                  {selectedApp?.address ?? "No business address submitted."}
                </p>
                {selectedApp?.description && (
                  <p className="leading-relaxed">
                    <Store className="h-4 w-4 inline mr-2 text-slate-400" />
                    {selectedApp.description}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold flex items-center gap-2 text-slate-900">
                <FileText className="h-5 w-5 text-primary" /> Review Notes
              </h4>
              <Textarea
                value={reviewNotes}
                onChange={(event) => setReviewNotes(event.target.value)}
                placeholder="Add approval context or explain what the vendor should fix before resubmitting..."
                className="min-h-[120px]"
              />
              <p className="text-xs text-slate-500">
                Rejection notes are required and will be shown back to the vendor on their dashboard.
              </p>
              {selectedApp?.reviewedAt && (
                <p className="text-xs text-slate-500">
                  Last reviewed on {formatApplicationDate(selectedApp.reviewedAt)}.
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="p-8 bg-slate-50 border-t flex justify-end gap-3">
            <Button
              variant="outline"
              className="rounded-xl h-12 px-8 border-rose-200 text-rose-600 hover:bg-rose-50"
              onClick={() => void handleStatusUpdate("rejected")}
              disabled={isSavingStatus !== null}
            >
              <XCircle className="h-4 w-4 mr-2" />
              {isSavingStatus === "rejected" ? "Rejecting..." : "Reject"}
            </Button>
            <Button
              className="rounded-xl h-12 px-10 shadow-lg shadow-primary/20"
              onClick={() => void handleStatusUpdate("approved")}
              disabled={isSavingStatus !== null}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {isSavingStatus === "approved" ? "Approving..." : "Approve Business"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
