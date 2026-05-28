"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Boxes, Search, ShieldAlert, Truck } from "lucide-react";
import type { AdminDriverRecord } from "@/lib/admin/ops-types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ListPageSkeleton } from "@/components/ui/loading-skeletons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type DriverFilter = "all" | "active" | "pending" | "inactive";
type AdminDriversResponse = {
  drivers: AdminDriverRecord[];
  pageInfo?: {
    nextCursor: string | null;
    total: number;
  };
};

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getDriverStatusLabel(status: AdminDriverRecord["status"]) {
  if (status === "active") {
    return "Active";
  }

  if (status === "inactive") {
    return "Inactive";
  }

  return "Pending";
}

function getDriverStatusClassName(status: AdminDriverRecord["status"]) {
  if (status === "active") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "inactive") {
    return "bg-slate-100 text-slate-700";
  }

  return "bg-amber-100 text-amber-700";
}

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "DR";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState<AdminDriverRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<DriverFilter>("all");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [totalDrivers, setTotalDrivers] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadDrivers = async () => {
      try {
        const response = await fetch("/api/admin/drivers?limit=25", { method: "GET" });
        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error ?? "Unable to load drivers.");
        }

        const payload: AdminDriversResponse = await response.json();
        if (isMounted) {
          setDrivers(payload.drivers ?? []);
          setNextCursor(payload.pageInfo?.nextCursor ?? null);
          setTotalDrivers(payload.pageInfo?.total ?? payload.drivers?.length ?? 0);
          setError(null);
        }
      } catch (fetchError) {
        if (isMounted) {
          setDrivers([]);
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Unable to load drivers."
          );
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
  }, []);

  const handleLoadMore = async () => {
    if (!nextCursor) {
      return;
    }

    setIsLoadingMore(true);

    try {
      const response = await fetch(
        `/api/admin/drivers?limit=25&cursor=${encodeURIComponent(nextCursor)}`,
        { method: "GET" }
      );
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Unable to load drivers.");
      }

      const payload: AdminDriversResponse = await response.json();
      setDrivers((current) => {
        const existing = new Set(current.map((driver) => driver.uid));
        const nextDrivers = (payload.drivers ?? []).filter((driver) => !existing.has(driver.uid));
        return [...current, ...nextDrivers];
      });
      setNextCursor(payload.pageInfo?.nextCursor ?? null);
      setTotalDrivers(payload.pageInfo?.total ?? totalDrivers);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error ? fetchError.message : "Unable to load drivers."
      );
    } finally {
      setIsLoadingMore(false);
    }
  };

  const activeDrivers = useMemo(
    () => drivers.filter((driver) => driver.status === "active").length,
    [drivers]
  );
  const pendingDrivers = useMemo(
    () => drivers.filter((driver) => driver.status === "pending").length,
    [drivers]
  );
  const linkedVendors = useMemo(
    () => new Set(drivers.map((driver) => driver.vendorId)).size,
    [drivers]
  );
  const averageLoadedUnits = useMemo(() => {
    if (drivers.length === 0) {
      return 0;
    }

    return Math.round(
      drivers.reduce((sum, driver) => sum + driver.loadedUnits, 0) / drivers.length
    );
  }, [drivers]);

  const filteredDrivers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return drivers.filter((driver) => {
      const matchesSearch =
        query.length === 0 ||
        driver.name.toLowerCase().includes(query) ||
        driver.email.toLowerCase().includes(query) ||
        driver.vendorName.toLowerCase().includes(query) ||
        driver.uid.toLowerCase().includes(query) ||
        (driver.licensePlate?.toLowerCase().includes(query) ?? false);

      const matchesFilter = filter === "all" || driver.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [drivers, filter, search]);

  if (isLoading) {
    return <ListPageSkeleton rows={6} className="max-w-7xl p-0" />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <Card className="border-none shadow-sm rounded-3xl">
          <CardContent className="p-8 space-y-4">
            <h1 className="text-2xl font-bold text-slate-900">
              Driver directory unavailable
            </h1>
            <p className="text-sm text-slate-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-slate-900">
            Platform Drivers
          </h1>
          <p className="text-slate-500">
            Live fleet directory based on registered driver profiles.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          {
            title: "Total Fleet",
            value: totalDrivers.toLocaleString("en-NG"),
            subtitle: `${linkedVendors} linked vendors`,
            icon: Truck,
          },
          {
            title: "Currently Active",
            value: activeDrivers.toLocaleString("en-NG"),
            subtitle: "Active driver profiles",
            icon: Truck,
          },
          {
            title: "Pending Setup",
            value: pendingDrivers.toLocaleString("en-NG"),
            subtitle: "Drivers awaiting readiness",
            icon: ShieldAlert,
          },
          {
            title: "Avg. Loaded Units",
            value: averageLoadedUnits.toLocaleString("en-NG"),
            subtitle: "Current stock logged per driver",
            icon: Boxes,
          },
        ].map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm bg-white p-6 rounded-3xl">
            <div className="flex justify-between items-start gap-3">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {stat.title}
                </p>
                <h3 className="text-3xl font-bold mt-2 text-slate-900">
                  {stat.value}
                </h3>
                <p className="text-xs text-slate-500 mt-2">{stat.subtitle}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search drivers by name, email, vendor, ID, or plate..."
            className="pl-10 h-11 rounded-xl bg-white border-slate-200"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", "active", "pending", "inactive"] as const).map(
            (filterValue) => (
              <Button
                key={filterValue}
                type="button"
                variant={filter === filterValue ? "default" : "outline"}
                className="rounded-xl h-10 px-4 capitalize"
                onClick={() => setFilter(filterValue)}
              >
                {filterValue === "all" ? "All statuses" : filterValue}
              </Button>
            )
          )}
        </div>
      </div>

      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        {filteredDrivers.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <h2 className="text-xl font-bold text-slate-900">
              No drivers match this view
            </h2>
            <p className="text-sm text-slate-500">
              Try another search term or driver status filter.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="pl-8">Driver</TableHead>
                <TableHead>Affiliated Vendor</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Loaded Units</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-8">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDrivers.map((driver) => (
                <TableRow key={driver.uid} className="group hover:bg-slate-50/50">
                  <TableCell className="pl-8">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-slate-100">
                        <AvatarFallback className="bg-slate-100 text-slate-700 font-semibold">
                          {getInitials(driver.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-slate-900 truncate">
                          {driver.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {driver.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/vendors/${driver.vendorId}`}>
                      <span className="text-sm text-slate-600 hover:text-primary transition-colors">
                        {driver.vendorName}
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    <div>{driver.vehicleType ?? "No vehicle type"}</div>
                    <p className="text-xs text-slate-400 mt-1">
                      {driver.licensePlate ?? "No plate on file"}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm font-medium text-slate-700">
                    {driver.loadedUnits.toLocaleString("en-NG")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`rounded-full px-3 border-none ${getDriverStatusClassName(driver.status)}`}
                    >
                      {getDriverStatusLabel(driver.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500 pr-8">
                    {formatDate(driver.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
      {nextCursor ? (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
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
