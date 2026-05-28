"use client";

import React, { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { ArrowLeft, Building2, MapPin, Package, ShoppingCart } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CatalogSkeleton } from "@/components/ui/loading-skeletons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useToast } from "@/hooks/use-toast";

type CatalogItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  stock: number;
};

type VendorRecord = {
  vendorId: string;
  businessName: string;
  businessType?: string;
  description?: string;
  address?: string;
  deliveryRadiusKm?: number;
  productCount: number;
  catalogCategories: string[];
};

function VendorDetailPageContent() {
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const [catalog, setCatalog] = React.useState<CatalogItem[]>([]);
  const [vendor, setVendor] = React.useState<VendorRecord | null>(null);
  const [cartItemsCount, setCartItemsCount] = React.useState(0);
  const [cartTotal, setCartTotal] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;

    const loadVendor = async () => {
      const response = await fetch(`/api/vendors/${params.id}`, { method: 'GET' });
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }

        throw new Error('Unable to load vendor.');
      }

      const payload = await response.json();
      return (payload.vendor ?? null) as VendorRecord | null;
    };

    const loadProducts = async () => {
      const response = await fetch(`/api/vendors/${params.id}/products`, { method: 'GET' });
      if (!response.ok) {
        throw new Error('Unable to load vendor products.');
      }

      const payload = await response.json();
      return Array.isArray(payload.products)
        ? payload.products.map((product: {
            id: string;
            name: string;
            category: string;
            priceNaira: number;
            stock: number;
            description?: string;
          }) => ({
            id: product.id,
            name: product.name,
            price: product.priceNaira,
            image: product.category.toLowerCase().includes('bag') ? 'bag-water' : 'bottle-1',
            category: product.category,
            description: product.description ?? "",
            stock: product.stock,
          }))
        : [];
    };

    const loadCart = async () => {
      try {
        const response = await fetch('/api/cart', { method: 'GET' });
        if (!response.ok) {
          return;
        }

        const payload = await response.json();
        const items = payload?.cart?.items ?? [];
        if (isMounted) {
          setCartItemsCount(items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0));
          setCartTotal(items.reduce((sum: number, item: { quantity: number; unitPriceNaira: number }) => sum + item.quantity * item.unitPriceNaira, 0));
        }
      } catch {
        if (isMounted) {
          setCartItemsCount(0);
          setCartTotal(0);
        }
      }
    };

    const loadPage = async () => {
      try {
        const [nextVendor, nextCatalog] = await Promise.all([loadVendor(), loadProducts()]);
        if (isMounted) {
          setVendor(nextVendor);
          setCatalog(nextCatalog);
        }
      } catch {
        if (isMounted) {
          setVendor(null);
          setCatalog([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void Promise.all([loadPage(), loadCart()]);

    return () => {
      isMounted = false;
    };
  }, [params.id]);

  const addToCart = async (productId: string) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? 'Unable to add item to cart.');
      }

      const payload = await response.json();
      const items = payload?.cart?.items ?? [];
      setCartItemsCount(items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0));
      setCartTotal(items.reduce((sum: number, item: { quantity: number; unitPriceNaira: number }) => sum + item.quantity * item.unitPriceNaira, 0));
      toast({
        title: 'Added to Cart',
        description: 'The item has been saved to your cart.',
      });
    } catch (error) {
      toast({
        title: 'Add Failed',
        description: error instanceof Error ? error.message : 'Unable to add item to cart.',
        variant: 'destructive',
      });
    }
  };

  const categories = React.useMemo(
    () => ["All", ...new Set(catalog.map((product) => product.category))],
    [catalog]
  );

  if (isLoading) {
    return <CatalogSkeleton />;
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="border-none shadow-sm p-8 text-center max-w-md">
          <CardContent className="p-0 space-y-4">
            <h1 className="text-2xl font-bold font-headline">Vendor unavailable</h1>
            <p className="text-muted-foreground">
              This vendor is not currently available for public ordering.
            </p>
            <Link href="/dashboard/customer/marketplace">
              <Button className="rounded-xl">Browse Other Vendors</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="relative h-64 w-full">
        <Image
          src={PlaceHolderImages.find(img => img.id === 'vendor-1')?.imageUrl || ''}
          alt="Vendor Banner"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <Link href="/dashboard/customer/marketplace" className="absolute top-6 left-6 z-10">
          <Button variant="secondary" size="icon" className="rounded-full shadow-lg">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-10">
        <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-white p-8 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <Badge className="mb-2 bg-green-100 text-green-700 hover:bg-green-100 border-none">Open Now</Badge>
                <CardTitle className="text-3xl font-bold font-headline">{vendor.businessName}</CardTitle>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Package className="h-4 w-4" /> {vendor.productCount} active product{vendor.productCount === 1 ? '' : 's'}
                  </div>
                  <div className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" /> {vendor.businessType ?? 'Water supplier'}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {vendor.deliveryRadiusKm ? `${vendor.deliveryRadiusKm} km delivery radius` : vendor.address ?? 'Delivery details available on request'}
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="border-primary/20 text-primary">
                Approved vendor
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              {vendor.description?.trim() || `${vendor.businessName} is live on WaterDrop and accepting customer orders.`}
            </p>

            <Tabs defaultValue="All" className="w-full">
              <TabsList className="bg-muted/50 p-1 mb-6 inline-flex overflow-x-auto no-scrollbar w-full sm:w-auto">
                {categories.map((cat) => (
                  <TabsTrigger key={cat} value={cat} className="rounded-lg px-6">{cat}</TabsTrigger>
                ))}
              </TabsList>

              {categories.map((cat) => (
                <TabsContent key={cat} value={cat} className="mt-0">
                  {catalog.filter((product) => cat === "All" || product.category === cat).length === 0 ? (
                    <div className="rounded-3xl border-2 border-dashed p-10 text-center text-muted-foreground">
                      No products are available in this category yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {catalog.filter((product) => cat === "All" || product.category === cat).map((product) => (
                        <div key={product.id} className="flex gap-4 p-3 bg-muted/30 rounded-2xl border border-transparent hover:border-primary/20 transition-all group">
                          <div className="relative h-24 w-24 rounded-xl overflow-hidden shrink-0">
                            <Image
                              src={PlaceHolderImages.find(img => img.id === product.image)?.imageUrl || ''}
                              alt={product.name}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                          <div className="flex flex-col justify-between flex-1 py-1">
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-bold text-sm leading-tight">{product.name}</h4>
                                <Badge variant="outline" className="text-[10px] shrink-0">
                                  {product.stock} left
                                </Badge>
                              </div>
                              <p className="text-primary font-bold mt-1">₦{product.price.toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                {product.description || "Fresh water product available for immediate order."}
                              </p>
                            </div>
                            <Button size="sm" className="h-8 rounded-lg w-fit gap-1" onClick={() => addToCart(product.id)}>
                              <ShoppingCart className="h-3 w-3" /> Add
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {cartItemsCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50">
          <Link href="/cart">
            <Button className="w-full h-14 rounded-2xl shadow-2xl shadow-primary/40 text-lg font-bold flex justify-between px-8">
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-6 w-6" />
                <span>{cartItemsCount} Items in Cart</span>
              </div>
              <span>₦{cartTotal.toLocaleString()}</span>
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

function VendorDetailFallback() {
  return <div className="min-h-screen bg-background" />;
}

export default function VendorDetailPage() {
  return (
    <Suspense fallback={<VendorDetailFallback />}>
      <VendorDetailPageContent />
    </Suspense>
  );
}
