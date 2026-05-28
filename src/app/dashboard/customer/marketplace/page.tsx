"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Search, ShoppingBag, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PlaceHolderImages } from "@/lib/placeholder-images";

type VendorCatalogRecord = {
  vendorId: string;
  businessName: string;
  businessType?: string;
  description?: string;
  deliveryRadiusKm?: number;
  productCount?: number;
  catalogCategories?: string[];
};

function getVendorImage(index: number) {
  const id = index % 2 === 0 ? "vendor-1" : "vendor-2";
  return PlaceHolderImages.find((image) => image.id === id)?.imageUrl ?? "";
}

function MarketplaceSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="overflow-hidden rounded-3xl border-none bg-white shadow-sm">
          <Skeleton className="h-48 w-full rounded-none" />
          <CardContent className="space-y-4 p-5">
            <Skeleton className="h-6 w-2/3 rounded-full" />
            <Skeleton className="h-4 w-full rounded-full" />
            <Skeleton className="h-4 w-3/4 rounded-full" />
            <div className="flex gap-2">
              <Skeleton className="h-7 w-24 rounded-full" />
              <Skeleton className="h-7 w-28 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function CustomerMarketplacePage() {
  const [vendors, setVendors] = useState<VendorCatalogRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    let isMounted = true;

    const loadVendors = async () => {
      try {
        const response = await fetch("/api/vendors", { method: "GET" });
        if (!response.ok) {
          throw new Error("Unable to load vendors.");
        }

        const payload = await response.json();
        if (isMounted) {
          setVendors(payload.vendors ?? []);
        }
      } catch {
        if (isMounted) {
          setVendors([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadVendors();
    return () => {
      isMounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    const nextCategories = vendors.flatMap((vendor) => vendor.catalogCategories ?? []);
    return ["All", ...new Set(nextCategories.filter(Boolean))];
  }, [vendors]);

  const filteredVendors = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return vendors.filter((vendor) => {
      const categoryLabels =
        vendor.catalogCategories && vendor.catalogCategories.length > 0
          ? vendor.catalogCategories
          : [vendor.businessType ?? "Water supply"];
      const matchesCategory = activeCategory === "All" || categoryLabels.includes(activeCategory);
      const matchesSearch =
        query.length === 0 ||
        vendor.businessName.toLowerCase().includes(query) ||
        (vendor.businessType ?? "").toLowerCase().includes(query) ||
        (vendor.description ?? "").toLowerCase().includes(query) ||
        categoryLabels.some((category) => category.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery, vendors]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[2rem] bg-primary p-6 text-primary-foreground shadow-xl shadow-primary/10 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div className="space-y-5">
              <Badge className="border-white/20 bg-white/15 text-white">Customer marketplace</Badge>
              <div className="space-y-3">
                <h1 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  Shop approved water vendors without leaving your dashboard.
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-primary-foreground/80 sm:text-base">
                  Search vendors, compare catalog types, and continue into checkout from the customer workspace.
                </p>
              </div>
            </div>

            <Card className="border-white/20 bg-white/95 shadow-none">
              <CardContent className="space-y-4 p-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search vendors, sachet, bottled..."
                    className="h-12 rounded-2xl border-none bg-muted pl-11"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      type="button"
                      size="sm"
                      variant={activeCategory === category ? "default" : "outline"}
                      className="rounded-full"
                      onClick={() => setActiveCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {isLoading ? (
          <MarketplaceSkeleton />
        ) : filteredVendors.length === 0 ? (
          <Card className="border-none shadow-sm">
            <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
              <Store className="h-10 w-10 text-muted-foreground" />
              <h2 className="font-headline text-2xl font-bold">No vendors found</h2>
              <p className="max-w-md text-sm text-muted-foreground">
                Try a different search or category. Approved vendors with active products will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredVendors.map((vendor, index) => {
              const categoryLabels =
                vendor.catalogCategories && vendor.catalogCategories.length > 0
                  ? vendor.catalogCategories
                  : [vendor.businessType ?? "Water supply"];

              return (
                <Link key={vendor.vendorId} href={`/vendors/${vendor.vendorId}`}>
                  <Card className="group h-full overflow-hidden rounded-3xl border-none bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={getVendorImage(index)}
                        alt={vendor.businessName}
                        fill
                        sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <Badge className="absolute bottom-4 left-4 border-none bg-white text-primary">
                        {vendor.productCount ?? 0} item{vendor.productCount === 1 ? "" : "s"}
                      </Badge>
                    </div>
                    <CardContent className="space-y-4 p-5">
                      <div className="space-y-2">
                        <h3 className="font-headline text-xl font-bold">{vendor.businessName}</h3>
                        <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                          {vendor.description?.trim() || "Approved WaterDrop vendor ready for delivery orders."}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <Badge variant="secondary" className="gap-1 rounded-full">
                          <ShoppingBag className="h-3 w-3" />
                          {vendor.businessType ?? "Water supplier"}
                        </Badge>
                        <Badge variant="outline" className="gap-1 rounded-full">
                          <MapPin className="h-3 w-3" />
                          {vendor.deliveryRadiusKm
                            ? `${vendor.deliveryRadiusKm} km radius`
                            : "Radius on request"}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {categoryLabels.slice(0, 3).map((category) => (
                          <span key={category} className="rounded-full bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                            {category}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
