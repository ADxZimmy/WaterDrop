"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
  Clock3,
  AlertCircle,
  Building2,
  CheckCircle2,
  Package,
} from 'lucide-react';
import type { VendorDashboardSummary } from "@/lib/vendor/summary-types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { getOrderStatusLabel } from "@/lib/orders/status";
import { cn } from "@/lib/utils";

export default function VendorDashboardOverview() {
  const [summary, setSummary] = useState<VendorDashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadSummary = async () => {
      try {
        const response = await fetch('/api/vendor/summary', { method: 'GET' });
        if (!response.ok) {
          throw new Error('Unable to load vendor summary.');
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

  const profile = summary?.profile ?? null;

  if (isLoading) {
    return <div className="p-8 max-w-7xl mx-auto text-sm text-muted-foreground">Loading vendor workspace...</div>;
  }

  if (!profile || profile.status !== 'approved') {
    const isPending = profile?.status === 'pending';
    const isRejected = profile?.status === 'rejected';

    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold font-headline">Vendor Overview</h1>
            <p className="text-muted-foreground">Complete your vendor setup to unlock operations.</p>
          </div>
          {isPending && (
            <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none px-4 py-1 animate-pulse">
              Under Review
            </Badge>
          )}
          {isRejected && (
            <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none px-4 py-1">
              Needs Update
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border-dashed border-2 bg-muted/5 flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
            <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
              <Building2 className="h-10 w-10" />
            </div>
            {!profile ? (
              <>
                <h2 className="text-2xl font-bold mb-2">Finish Your Store Setup</h2>
                <p className="text-muted-foreground mb-8 max-w-md">Submit your business profile and compliance details to start adding products and receiving orders.</p>
                <Link href="/auth/onboarding/vendor">
                  <Button size="lg" className="rounded-xl px-8 shadow-lg shadow-primary/20">
                    Complete Setup Now
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-2">{isRejected ? 'Update Your Application' : 'Verification in Progress'}</h2>
                <p className="text-muted-foreground mb-8 max-w-md">
                  {isRejected
                    ? 'Your previous application needs changes. Review and resubmit your business details.'
                    : 'Our compliance team is reviewing your documents. You will be able to operate once approved.'}
                </p>
                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100 text-yellow-800 text-sm max-w-sm mb-6">
                  Current store: <strong>{profile.businessName}</strong>
                </div>
                {profile.reviewNotes && (
                  <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-red-800 text-sm max-w-md mb-6">
                    <strong>Admin feedback:</strong> {profile.reviewNotes}
                  </div>
                )}
                {profile.submittedAt && (
                  <p className="text-xs text-muted-foreground mb-6">
                    Last submitted {formatDistanceToNow(profile.submittedAt, { addSuffix: true })}.
                  </p>
                )}
                <Link href="/auth/onboarding/vendor">
                  <Button variant="outline" className="rounded-xl px-8">
                    {isRejected ? 'Update Submission' : 'Review Submission'}
                  </Button>
                </Link>
              </>
            )}
          </Card>

          <Card className="border-none shadow-sm h-fit">
            <CardHeader>
              <CardTitle className="text-lg">Checklist</CardTitle>
              <CardDescription>Phase 1 setup completion</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center text-white">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">Verify Email & Phone</span>
              </div>
              <div className="flex items-center gap-3">
                <div className={cn("h-6 w-6 rounded-full flex items-center justify-center text-white", profile ? "bg-green-500" : "bg-muted text-muted-foreground")}>
                  {profile ? <CheckCircle2 className="h-4 w-4" /> : "2"}
                </div>
                <span className={cn("text-sm", profile ? "font-medium" : "text-muted-foreground")}>Submit Business Info</span>
              </div>
              <div className="flex items-center gap-3">
                <div className={cn("h-6 w-6 rounded-full flex items-center justify-center text-white", isPending ? "bg-yellow-500" : profile?.status === 'approved' ? "bg-green-500" : "bg-muted text-muted-foreground")}>
                  {profile?.status === 'approved' ? <CheckCircle2 className="h-4 w-4" /> : "3"}
                </div>
                <span className={cn("text-sm", profile?.status === 'approved' ? "font-medium" : "text-muted-foreground")}>Admin Approval</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground">4</div>
                <span className="text-sm text-muted-foreground">First Product Listing</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Vendor Overview</h1>
        <p className="text-muted-foreground">
          Good morning, {profile.businessName}. Here&apos;s your live operations snapshot from Firestore.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{summary?.summary.monthlyRevenueNaira.toLocaleString() ?? "0"}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" /> Current calendar month
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.summary.totalOrders ?? 0}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Clock3 className="h-3 w-3" /> {summary?.summary.activeOrders ?? 0} active right now
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unique Customers</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.summary.uniqueCustomers ?? 0}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <ShoppingBag className="h-3 w-3" /> {summary?.summary.deliveredOrders ?? 0} delivered orders
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fulfillment Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.summary.fulfillmentRate ?? 0}%</div>
            <Progress value={summary?.summary.fulfillmentRate ?? 0} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Delivered vs all recorded orders
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Orders</CardTitle>
            <Link href="/dashboard/vendor/orders">
              <Button variant="link" size="sm" className="text-primary">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {summary && summary.recentOrders.length > 0 ? (
              <div className="space-y-6">
                {summary.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0 gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                        <ShoppingBag className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {order.customerName} • {order.itemCount} item{order.itemCount === 1 ? "" : "s"}
                        </p>
                        <Badge variant="outline" className="mt-2 text-[10px]">
                          {getOrderStatusLabel(order.status)}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-sm">₦{order.totalNaira.toLocaleString()}</p>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground justify-end">
                        <Clock3 className="h-2.5 w-2.5" /> {formatDistanceToNow(order.createdAt, { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-sm text-muted-foreground">
                Orders will appear here once customers start checking out.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Inventory Alerts</CardTitle>
            <CardDescription>Products that need immediate restocking attention.</CardDescription>
          </CardHeader>
          <CardContent>
            {summary && summary.inventoryAlerts.length > 0 ? (
              <div className="space-y-4">
                {summary.inventoryAlerts.map((alert) => {
                  const tone = alert.isOutOfStock
                    ? {
                        wrapper: "bg-red-50 border-red-100",
                        icon: "text-red-600",
                        title: "text-red-900",
                        body: "text-red-700",
                        button:
                          "bg-red-600 hover:bg-red-700 text-white rounded-lg",
                      }
                    : {
                        wrapper: "bg-yellow-50 border-yellow-100",
                        icon: "text-yellow-600",
                        title: "text-yellow-900",
                        body: "text-yellow-700",
                        button:
                          "border-yellow-200 text-yellow-800 rounded-lg",
                      };

                  return (
                    <div
                      key={alert.id}
                      className={cn("flex items-center gap-4 p-4 rounded-xl border", tone.wrapper)}
                    >
                      <AlertCircle className={cn("h-5 w-5", tone.icon)} />
                      <div className="flex-1">
                        <p className={cn("text-sm font-bold", tone.title)}>
                          {alert.isOutOfStock ? "Out of stock" : "Low stock alert"}
                        </p>
                        <p className={cn("text-xs", tone.body)}>
                          {alert.name} ({alert.category}) has {alert.stock} unit{alert.stock === 1 ? "" : "s"} remaining.
                        </p>
                      </div>
                      <Link href="/dashboard/vendor/products">
                        <Button
                          size="sm"
                          variant={alert.isOutOfStock ? "default" : "outline"}
                          className={tone.button}
                        >
                          Restock
                        </Button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 flex items-start gap-3">
                <Package className="h-5 w-5 text-emerald-600 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-emerald-900">Inventory looks healthy</p>
                  <p className="text-xs text-emerald-700">
                    No active products are currently below the low-stock threshold.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
