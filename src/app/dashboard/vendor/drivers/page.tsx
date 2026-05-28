
"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  MoreVertical,
  Percent,
  Plus,
  Search,
  Truck,
  User,
  Wallet,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ListPageSkeleton } from "@/components/ui/loading-skeletons";
import { useToast } from "@/hooks/use-toast";

type VendorDriverRecord = {
  uid: string;
  name: string;
  email?: string;
  phone?: string;
  status: "pending" | "active" | "inactive";
  vehicleType?: string;
  licensePlate?: string;
  loadedUnits: number;
  activeOrdersCount: number;
  deliveredOrdersCount: number;
  availableBalanceNaira: number;
  requestedBalanceNaira: number;
  paidBalanceNaira: number;
};

type VendorDriversResponse = {
  drivers: VendorDriverRecord[];
  pageInfo?: {
    nextCursor: string | null;
    total: number;
  };
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getStatusBadgeClass(status: VendorDriverRecord["status"]) {
  if (status === "active") {
    return "bg-green-50 text-green-700 border-green-200";
  }

  if (status === "inactive") {
    return "bg-slate-100 text-slate-700 border-slate-200";
  }

  return "bg-yellow-50 text-yellow-700 border-yellow-200";
}

export default function VendorDriversPage() {
  const [drivers, setDrivers] = useState<VendorDriverRecord[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [updatingDriverUid, setUpdatingDriverUid] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [totalDrivers, setTotalDrivers] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    const loadDrivers = async () => {
      try {
        const response = await fetch("/api/vendor/drivers?limit=12", { method: "GET" });
        const payload = (await response.json().catch(() => null)) as VendorDriversResponse | null;

        if (!response.ok) {
          throw new Error((payload as { error?: string } | null)?.error ?? "Unable to load drivers.");
        }

        if (isMounted) {
          setDrivers((payload?.drivers ?? []) as VendorDriverRecord[]);
          setNextCursor(payload?.pageInfo?.nextCursor ?? null);
          setTotalDrivers(payload?.pageInfo?.total ?? payload?.drivers?.length ?? 0);
        }
      } catch (error) {
        if (isMounted) {
          setDrivers([]);
          toast({
            title: "Driver fleet unavailable",
            description: error instanceof Error ? error.message : "Unable to load drivers.",
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadDrivers();

    return () => {
      isMounted = false;
    };
  }, [toast]);

  const handleLoadMore = async () => {
    if (!nextCursor) {
      return;
    }

    setIsLoadingMore(true);

    try {
      const response = await fetch(
        `/api/vendor/drivers?limit=12&cursor=${encodeURIComponent(nextCursor)}`,
        { method: "GET" }
      );
      const payload = (await response.json().catch(() => null)) as VendorDriversResponse | null;

      if (!response.ok) {
        throw new Error((payload as { error?: string } | null)?.error ?? "Unable to load more drivers.");
      }

      setDrivers((current) => {
        const existing = new Set(current.map((driver) => driver.uid));
        const nextDrivers = (payload?.drivers ?? []).filter((driver) => !existing.has(driver.uid));
        return [...current, ...nextDrivers];
      });
      setNextCursor(payload?.pageInfo?.nextCursor ?? null);
      setTotalDrivers(payload?.pageInfo?.total ?? totalDrivers);
    } catch (error) {
      toast({
        title: "Unable to load more drivers",
        description: error instanceof Error ? error.message : "Unable to load more drivers.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMore(false);
    }
  };

  const filteredDrivers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return drivers;
    }

    return drivers.filter((driver) => {
      const haystack = [
        driver.name,
        driver.email ?? "",
        driver.phone ?? "",
        driver.vehicleType ?? "",
        driver.licensePlate ?? "",
        driver.status,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [drivers, search]);

  const onlineCount = drivers.filter((driver) => driver.status === "active").length;
  const totalActiveOrders = drivers.reduce(
    (sum, driver) => sum + driver.activeOrdersCount,
    0
  );
  const availableFleetBalance = drivers.reduce(
    (sum, driver) => sum + driver.availableBalanceNaira,
    0
  );

  const handleStatusUpdate = async (
    driverUid: string,
    nextStatus: VendorDriverRecord["status"]
  ) => {
    setUpdatingDriverUid(driverUid);

    try {
      const response = await fetch(`/api/vendor/drivers/${driverUid}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to update driver status.");
      }

      const updatedDriver = payload?.driver as VendorDriverRecord | null;
      if (!updatedDriver) {
        throw new Error("Driver update response was incomplete.");
      }

      setDrivers((currentDrivers) =>
        currentDrivers.map((driver) =>
          driver.uid === updatedDriver.uid ? { ...driver, ...updatedDriver } : driver
        )
      );

      toast({
        title: "Driver status updated",
        description: `${updatedDriver.name} is now ${updatedDriver.status}.`,
      });
    } catch (error) {
      toast({
        title: "Status update failed",
        description:
          error instanceof Error ? error.message : "Unable to update driver status.",
        variant: "destructive",
      });
    } finally {
      setUpdatingDriverUid((current) => (current === driverUid ? null : current));
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Driver Fleet</h1>
          <p className="text-muted-foreground">Manage your delivery personnel and track performance.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Link href="/dashboard/vendor/drivers/withdrawals" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full rounded-xl h-11 gap-2 border-primary/20 text-primary">
              <Wallet className="h-5 w-5" /> Withdrawals
            </Button>
          </Link>
          <Link href="/dashboard/vendor/drivers/new" className="flex-1 sm:flex-none">
            <Button className="w-full rounded-xl h-11 gap-2 shadow-lg shadow-primary/20">
              <Plus className="h-5 w-5" /> Add New Driver
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-primary/5 border border-primary/10 p-6 rounded-3xl">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
              <Truck className="h-8 w-8" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalDrivers}</p>
              <p className="text-sm text-muted-foreground">Total Drivers</p>
            </div>
          </div>
        </Card>
        <Card className="border-none shadow-sm bg-green-50 border border-green-100 p-6 rounded-3xl">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <p className="text-2xl font-bold">{onlineCount}</p>
              <p className="text-sm text-muted-foreground">Currently Online</p>
            </div>
          </div>
        </Card>
        <Card className="border-none shadow-sm bg-blue-50 border border-blue-100 p-6 rounded-3xl">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
              <Clock className="h-8 w-8" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalActiveOrders}</p>
              <p className="text-sm text-muted-foreground">Active Assigned Orders</p>
            </div>
          </div>
        </Card>
        <Card className="border-none shadow-sm bg-white p-6 rounded-3xl">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <Wallet className="h-8 w-8" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(availableFleetBalance)}</p>
              <p className="text-sm text-muted-foreground">Accrued Driver Balance</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter drivers by name, vehicle, plate, or status..."
            className="pl-10 h-11 rounded-xl"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="lg:col-span-4">
            <ListPageSkeleton rows={4} className="max-w-none px-0 py-0" />
          </div>
        ) : filteredDrivers.length === 0 ? (
          <Card className="border-none shadow-sm overflow-hidden lg:col-span-4">
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              No drivers match the current filter.
            </CardContent>
          </Card>
        ) : filteredDrivers.map((driver) => (
          <Card key={driver.uid} className="border-none shadow-sm overflow-hidden group hover:shadow-md transition-all">
            <CardHeader className="pb-4 flex flex-row items-center justify-between">
              <Badge 
                variant="outline" 
                className={`text-[10px] font-bold ${getStatusBadgeClass(driver.status)}`}
              >
                {driver.status}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl">
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href={`/dashboard/vendor/drivers/${driver.uid}`} className="flex items-center gap-2">
                      <User className="h-4 w-4" /> View Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href={`/dashboard/vendor/drivers/${driver.uid}/commission`} className="flex items-center gap-2">
                      <Percent className="h-4 w-4" /> Individual Commission
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer font-medium"
                    disabled={updatingDriverUid === driver.uid}
                    onClick={() =>
                      void handleStatusUpdate(
                        driver.uid,
                        driver.status === "active" ? "inactive" : "active"
                      )
                    }
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    {updatingDriverUid === driver.uid
                      ? "Updating status..."
                      : driver.status === "active"
                        ? "Suspend Driver"
                        : "Activate Driver"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center pb-6">
              <Avatar className="h-20 w-20 mb-4 border-2 border-primary/10">
                <AvatarFallback>{driver.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <h4 className="font-bold">{driver.name}</h4>
              <p className="text-xs text-muted-foreground mt-1">
                {driver.vehicleType ?? "Vehicle not set"}
                {driver.licensePlate ? ` • ${driver.licensePlate}` : ""}
              </p>
              <div className="mt-4 w-full rounded-2xl bg-muted/30 p-4 text-left space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active orders</span>
                  <span className="font-semibold">{driver.activeOrdersCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivered</span>
                  <span className="font-semibold">{driver.deliveredOrdersCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Accrued</span>
                  <span className="font-semibold text-primary">
                    {formatCurrency(driver.availableBalanceNaira)}
                  </span>
                </div>
              </div>
              <Link href={`/dashboard/vendor/drivers/${driver.uid}`} className="w-full mt-6">
                <Button size="sm" variant="outline" className="w-full rounded-xl gap-2">
                  <User className="h-3 w-3" /> View Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
      {nextCursor ? (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl px-6"
            onClick={() => void handleLoadMore()}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? "Loading more..." : `Load more drivers (${drivers.length}/${totalDrivers})`}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
