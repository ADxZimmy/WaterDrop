
"use client";

import React, { Suspense, useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ShoppingCart, 
  Search, 
  Store, 
  Droplets, 
  ArrowRight, 
  User, 
  Truck, 
  MapPin, 
  Download,
  Menu,
  ShoppingBag,
  Settings,
  LogOut,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import type { CustomerAddress, OrderStatus, PaymentMethod } from "@/lib/domain/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useToast } from "@/hooks/use-toast";
import { getOrderStatusLabel } from "@/lib/orders/status";

type VendorCatalogRecord = {
  vendorId: string;
  businessName: string;
  businessType?: string;
  description?: string;
  deliveryRadiusKm?: number;
  productCount?: number;
  catalogCategories?: string[];
};

type CustomerPreferencesResponse = {
  preferences: null | {
    addresses: CustomerAddress[];
    preferredPaymentMethod: PaymentMethod;
  };
};

type CartResponse = {
  cart: null | {
    items: Array<{
      quantity: number;
    }>;
  };
};

type LatestOrderResponse = {
  order: null | {
    id: string;
    vendorName?: string;
    status: OrderStatus;
  };
};

type HomeBootstrapState = {
  role: string | null;
  vendors: VendorCatalogRecord[];
  preferences: CustomerPreferencesResponse["preferences"];
  cartItemsCount: number;
  activeOrder: LatestOrderResponse["order"];
};

const customerNavItems = [
  { name: 'Marketplace', href: '/dashboard/customer/marketplace', icon: Store },
  { name: 'My Orders', href: '/dashboard/customer/orders', icon: ShoppingBag },
  { name: 'Profile', href: '/dashboard/customer', icon: User },
  { name: 'Settings', href: '/dashboard/customer/settings', icon: Settings },
];

function VendorCarouselSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="overflow-hidden rounded-3xl border-none bg-white shadow-sm">
          <Skeleton className="h-44 w-full rounded-none" />
          <CardContent className="space-y-4 p-6">
            <div className="flex items-start justify-between gap-3">
              <Skeleton className="h-6 w-36 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full rounded-full" />
            <Skeleton className="h-4 w-2/3 rounded-full" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function HomePageContent() {
  const { toast } = useToast();
  const [sessionRole, setSessionRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [vendorCatalog, setVendorCatalog] = useState<VendorCatalogRecord[]>([]);
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const [isHomeReady, setIsHomeReady] = useState(false);
  const [customerPreferences, setCustomerPreferences] = useState<CustomerPreferencesResponse["preferences"]>(null);
  const [isSavingOnboarding, setIsSavingOnboarding] = useState(false);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [activeOrder, setActiveOrder] = useState<LatestOrderResponse["order"]>(null);
  const [addressDraft, setAddressDraft] = useState({
    street: "",
    city: "",
    postalCode: "",
    state: "",
    country: "Nigeria",
  });

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      try {
        const response = await fetch('/api/auth/me', { method: 'GET' });

        if (!response.ok) {
          return null;
        }

        const profile = await response.json();
        return (profile?.role ?? "customer") as string;
      } catch {
        return null;
      }
    };

    const loadVendors = async () => {
      try {
        const response = await fetch('/api/vendors', { method: 'GET' });
        if (!response.ok) {
          return [];
        }

        const payload = await response.json();
        return (payload.vendors ?? []) as VendorCatalogRecord[];
      } catch {
        return [];
      }
    };

    const loadCustomerState = async (role: string | null) => {
      if (role !== "customer") {
        return {
          preferences: null,
          cartItemsCount: 0,
          activeOrder: null,
        } satisfies Pick<HomeBootstrapState, "preferences" | "cartItemsCount" | "activeOrder">;
      }

      const [preferencesResponse, cartResponse, latestOrderResponse] = await Promise.all([
        fetch('/api/customer/preferences', { method: 'GET' }).catch(() => null),
        fetch('/api/cart', { method: 'GET' }).catch(() => null),
        fetch('/api/orders/latest', { method: 'GET' }).catch(() => null),
      ]);

      let preferences: CustomerPreferencesResponse["preferences"] = null;
      let nextCartCount = 0;
      let nextActiveOrder: LatestOrderResponse["order"] = null;

      if (preferencesResponse?.ok) {
        const preferencesPayload: CustomerPreferencesResponse = await preferencesResponse.json();
        preferences = preferencesPayload.preferences;
      }

      if (cartResponse?.ok) {
        const cartPayload: CartResponse = await cartResponse.json();
        nextCartCount = (cartPayload.cart?.items ?? []).reduce(
          (sum, item) => sum + item.quantity,
          0
        );
      }

      if (latestOrderResponse?.ok) {
        const latestOrderPayload: LatestOrderResponse = await latestOrderResponse.json();
        nextActiveOrder = latestOrderPayload.order;
      }

      return {
        preferences,
        cartItemsCount: nextCartCount,
        activeOrder: nextActiveOrder,
      } satisfies Pick<HomeBootstrapState, "preferences" | "cartItemsCount" | "activeOrder">;
    };

    const loadHomeData = async () => {
      const [role, vendors] = await Promise.all([loadSession(), loadVendors()]);
      const customerState = await loadCustomerState(role);

      if (isMounted) {
        const nextState: HomeBootstrapState = {
          role,
          vendors,
          ...customerState,
        };

        setSessionRole(nextState.role);
        setVendorCatalog(nextState.vendors);
        setCustomerPreferences(nextState.preferences);
        setCartItemsCount(nextState.cartItemsCount);
        setActiveOrder(nextState.activeOrder);
        setShowOnboarding(
          nextState.role === "customer" &&
            (nextState.preferences?.addresses.length ?? 0) === 0
        );
        setIsHomeReady(true);
        setIsCatalogLoading(false);
      }
    };

    void loadHomeData().catch(() => {
      if (isMounted) {
        setSessionRole(null);
        setVendorCatalog([]);
        setCustomerPreferences(null);
        setCartItemsCount(0);
        setActiveOrder(null);
        setShowOnboarding(false);
        setIsHomeReady(true);
        setIsCatalogLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const isLoggedIn = isHomeReady && sessionRole !== null;
  const isCustomerSession = sessionRole === "customer";
  const shouldShowGuestHero = !isCustomerSession;
  const homeHref = isCustomerSession ? "/dashboard/customer" : "/";
  const dashboardHref =
    sessionRole === "vendor"
      ? "/dashboard/vendor"
      : sessionRole === "driver"
        ? "/dashboard/driver"
        : sessionRole === "admin"
          ? "/admin"
          : "/dashboard/customer";
  const riderSignInHref = sessionRole === "driver" ? "/dashboard/driver" : "/auth/login?role=driver";

  const availableCategories = useMemo(() => {
    const categories = vendorCatalog.flatMap((vendor) => vendor.catalogCategories ?? []);
    return ["All", ...new Set(categories.filter(Boolean))];
  }, [vendorCatalog]);

  const resolvedVendors = useMemo(() => {
    return vendorCatalog.map((vendor, index) => ({
      id: vendor.vendorId,
      name: vendor.businessName,
      description:
        vendor.description?.trim() || "Approved WaterDrop vendor ready for delivery orders.",
      distance:
        vendor.deliveryRadiusKm
          ? `${vendor.deliveryRadiusKm} km delivery radius`
          : "Delivery radius available on request",
      image: index % 2 === 0 ? "vendor-1" : "vendor-2",
      productCount: vendor.productCount ?? 0,
      businessType: vendor.businessType ?? "Water supplier",
      categoryLabels:
        vendor.catalogCategories && vendor.catalogCategories.length > 0
          ? vendor.catalogCategories
          : [vendor.businessType ?? "Water supply"],
    }));
  }, [vendorCatalog]);

  const filteredVendors = useMemo(() => {
    return resolvedVendors.filter(vendor => {
      const matchesCategory =
        activeCategory === "All" || vendor.categoryLabels.includes(activeCategory);
      const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            vendor.businessType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            vendor.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            vendor.categoryLabels.some((category) =>
                              category.toLowerCase().includes(searchQuery.toLowerCase())
                            );
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory, resolvedVendors]);

  const handleSaveOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingOnboarding(true);

    try {
      const response = await fetch('/api/customer/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addresses: [
            {
              id: 'home',
              label: 'Home',
              street: addressDraft.street,
              city: addressDraft.city,
              postalCode: addressDraft.postalCode,
              state: addressDraft.state,
              country: addressDraft.country,
              isDefault: true,
            },
          ],
          preferredPaymentMethod: customerPreferences?.preferredPaymentMethod ?? 'cod',
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? 'Unable to save delivery address.');
      }

      const payload: CustomerPreferencesResponse = await response.json();
      setCustomerPreferences(payload.preferences);
      setShowOnboarding(false);
      setAddressDraft({
        street: "",
        city: "",
        postalCode: "",
        state: "",
        country: "Nigeria",
      });
      toast({
        title: "Profile Completed!",
        description: "Your delivery address has been saved successfully."
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Unable to save delivery address.",
        variant: "destructive",
      });
    } finally {
      setIsSavingOnboarding(false);
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="p-6 flex items-center gap-3 border-b">
        <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
          <Droplets className="h-6 w-6" />
        </div>
        <div>
          <span className="text-xl font-bold tracking-tight text-primary font-headline block leading-none">WaterDrop</span>
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Customer Hub</span>
        </div>
      </div>
      
      <div className="p-6 border-b bg-muted/5">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-primary/10">
            <AvatarImage src="https://picsum.photos/seed/user-44/200" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">John Doe</p>
            <p className="text-[10px] text-muted-foreground truncate font-medium">Gold Member</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {customerNavItems.map((item) => (
          <Link key={item.name} href={item.href} onClick={() => setIsSidebarOpen(false)}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 h-12 px-4 rounded-xl transition-all group",
                item.href === '/' ? "bg-primary/5 text-primary font-bold" : "text-muted-foreground hover:bg-muted"
              )}
            >
              <item.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", item.href === '/' && "text-primary")} />
              <span className="text-sm">{item.name}</span>
              {item.href === '/' && <ChevronRight className="ml-auto h-4 w-4 opacity-50" />}
            </Button>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t bg-muted/5">
        <Link href="/auth/login">
          <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl h-12">
            <LogOut className="h-5 w-5" />
            <span className="font-bold">Sign Out</span>
          </Button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {isCustomerSession && (
        <aside className="hidden lg:flex w-64 border-r bg-white flex-col sticky top-0 h-screen">
          <SidebarContent />
        </aside>
      )}

      <div className="flex-1 flex flex-col min-h-screen">
        <nav className="sticky top-0 z-50 glass-effect border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center gap-2">
                {isCustomerSession && (
                  <div className="lg:hidden">
                    <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                      <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-muted mr-2">
                          <Menu className="h-6 w-6 text-foreground" />
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="left" className="p-0 w-72 border-none shadow-2xl">
                        <SheetHeader className="sr-only">
                          <SheetTitle>Menu</SheetTitle>
                          <SheetDescription>Access your account sections</SheetDescription>
                        </SheetHeader>
                        <SidebarContent />
                      </SheetContent>
                    </Sheet>
                  </div>
                )}
                <Link href={homeHref} className="flex items-center gap-2">
                  <Droplets className="h-8 w-8 text-primary" />
                  <span className="text-2xl font-bold tracking-tight text-primary font-headline">WaterDrop</span>
                </Link>
              </div>
              
              <div className="hidden md:flex flex-1 max-w-md mx-8">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search for water products..." 
                    className="pl-10 w-full rounded-full bg-muted/30 border-transparent focus:bg-white focus:border-primary transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link href={riderSignInHref}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-primary hover:bg-primary/5 rounded-full"
                    aria-label="Rider sign in"
                  >
                    <Truck className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/cart">
                  <Button variant="ghost" size="icon" className="relative rounded-full">
                    <ShoppingCart className="h-5 w-5" />
                    {cartItemsCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center px-1 rounded-full text-[10px]">
                        {cartItemsCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
                
                {!isHomeReady ? (
                  <div className="hidden sm:flex items-center gap-2">
                    <Skeleton className="h-10 w-24 rounded-xl" />
                    <Skeleton className="h-10 w-28 rounded-xl" />
                  </div>
                ) : !isLoggedIn ? (
                  <>
                    <div className="hidden sm:flex items-center gap-2">
                      <Link href="/auth/login?role=vendor">
                        <Button variant="outline" size="sm" className="gap-2 border-primary/20 hover:bg-primary/5 text-primary rounded-xl">
                          <Store className="h-4 w-4" />
                          Vendor
                        </Button>
                      </Link>
                    </div>
                    <Link href="/auth/login">
                      <Button variant="default" className="hidden sm:flex items-center gap-2 rounded-xl h-10 px-6">
                        <User className="h-4 w-4" />
                        Sign In
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Link href={dashboardHref} className="hidden sm:block">
                    <Avatar className="h-9 w-9 border-2 border-primary/10 hover:border-primary/30 transition-all">
                      <AvatarImage src="https://picsum.photos/seed/user-44/200" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-grow">
          {isCustomerSession && activeOrder && (
            <div className="bg-primary/10 border-b border-primary/20 py-3 px-4">
              <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
                    <Truck className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-bold text-primary truncate">
                    Active order: {getOrderStatusLabel(activeOrder.status)}
                    {activeOrder.vendorName ? ` with ${activeOrder.vendorName}` : ""}
                  </p>
                </div>
                <Link href="/dashboard/customer/track-order">
                  <Button size="sm" className="rounded-full h-8 px-4 text-xs">Track Order</Button>
                </Link>
              </div>
            </div>
          )}

          {shouldShowGuestHero && (
            <section className="relative flex min-h-[calc(100dvh-4rem)] items-center overflow-hidden py-16 sm:py-20 md:min-h-[620px]">
              <div className="absolute inset-0 z-0">
                <Image 
                  src={PlaceHolderImages.find(img => img.id === 'hero-water')?.imageUrl || ''} 
                  alt="Fresh water"
                  fill
                  className="object-cover opacity-20"
                  priority
                />
              </div>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-2xl">
                  <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-1">
                    Fast & Fresh Delivery
                  </Badge>
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-headline leading-[1.05] mb-6">
                    Pure Water, <br />
                    <span className="text-primary">Delivered</span> to Your Door.
                  </h1>
                  <p className="max-w-xl text-base leading-7 text-muted-foreground mb-8 sm:text-lg">
                    The largest multi-vendor marketplace for high-quality bottled and sachet water. 
                  </p>
                  <div className="grid gap-3 sm:flex sm:flex-wrap sm:gap-4">
                    <Link href="#vendors" className="w-full sm:w-auto">
                      <Button size="lg" className="h-14 w-full px-8 rounded-full text-base shadow-lg sm:w-auto sm:text-lg">
                        Shop Now
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="h-14 w-full px-8 rounded-full text-base gap-2 border-primary/20 text-primary hover:bg-primary/5 sm:w-auto sm:text-lg"
                    >
                      <Download className="h-5 w-5" />
                      Get the App
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          )}

          <div className="md:hidden px-4 pt-6 bg-white">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search for water products..." 
                className="pl-10 w-full rounded-full bg-muted/20 border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <section className={cn("py-12", isLoggedIn ? "bg-muted/10" : "bg-white")} id="vendors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                <div>
                  <h2 className="text-3xl font-bold font-headline">Verified Vendors</h2>
                  <p className="text-muted-foreground">Order direct from the best sources near you</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {availableCategories.map((cat) => (
                    <Button 
                      key={cat} 
                      variant={activeCategory === cat ? "default" : "outline"} 
                      className="rounded-full px-6 transition-all"
                      onClick={() => setActiveCategory(cat)}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>

              {isCatalogLoading ? (
                <VendorCarouselSkeleton />
              ) : filteredVendors.length > 0 ? (
                <div className="relative group">
                  <Carousel
                    opts={{
                      align: "start",
                      loop: false,
                    }}
                    className="w-full"
                  >
                    <CarouselContent className="-ml-4">
                      {filteredVendors.map((vendor) => (
                        <CarouselItem key={vendor.id} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                          <Link href={`/vendors/${vendor.id}`}>
                            <Card className="group hover:shadow-2xl transition-all duration-300 border-none bg-white rounded-3xl overflow-hidden flex flex-col h-full">
                              <div className="relative w-full h-44 overflow-hidden shrink-0">
                                <Image 
                                  src={PlaceHolderImages.find(img => img.id === vendor.image)?.imageUrl || ''} 
                                  alt={vendor.name}
                                  fill
                                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                              </div>
                              <CardContent className="p-6 flex-1 flex flex-col justify-center">
                                <div className="flex items-start justify-between gap-3">
                                  <h4 className="text-xl font-bold truncate">{vendor.name}</h4>
                                  <Badge variant="outline" className="text-[10px] uppercase tracking-wider shrink-0">
                                    {vendor.productCount} item{vendor.productCount === 1 ? "" : "s"}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed mt-2 line-clamp-2">
                                  {vendor.description}
                                </p>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-3">
                                  <div className="flex items-center gap-1">
                                    <ShoppingBag className="h-3 w-3" /> {vendor.businessType}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" /> {vendor.distance}
                                  </div>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {vendor.categoryLabels.slice(0, 2).map((category) => (
                                    <Badge key={category} variant="outline" className="text-[10px] uppercase tracking-wider">
                                      {category}
                                    </Badge>
                                  ))}
                                </div>
                                <div className="mt-4 flex items-center gap-1 text-primary text-sm font-bold group-hover:gap-2 transition-all">
                                  View Products <ArrowRight className="h-4 w-4" />
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <div className="hidden md:flex">
                      <CarouselPrevious className="h-12 w-12 bg-white/90 border-primary/20 text-primary shadow-xl hover:bg-primary hover:text-white transition-all -left-6 opacity-0 group-hover:opacity-100" />
                      <CarouselNext className="h-12 w-12 bg-white/90 border-primary/20 text-primary shadow-xl hover:bg-primary hover:text-white transition-all -right-6 opacity-0 group-hover:opacity-100" />
                    </div>
                  </Carousel>
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed">
                  <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                    <Search className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold">
                    {resolvedVendors.length === 0 ? "No verified vendors live yet" : "No vendors found"}
                  </h3>
                  <p className="text-muted-foreground">
                    {resolvedVendors.length === 0
                      ? "Approved vendors with active products will appear here once their catalogs are published."
                      : "Try adjusting your search or category filters."}
                  </p>
                  <Button 
                    variant="link" 
                    className="mt-2 text-primary"
                    onClick={() => {
                      setSearchQuery("");
                      setActiveCategory("All");
                    }}
                  >
                    Clear all filters
                  </Button>
                </div>
              )}
            </div>
          </section>
        </main>

        {/* Onboarding Dialog */}
        <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
          <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl">
            <DialogHeader className="flex flex-col items-center text-center pt-4">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 animate-bounce">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <DialogTitle className="text-2xl font-bold font-headline">Complete sign-up</DialogTitle>
              <DialogDescription className="text-muted-foreground mt-2">
                We're glad you're here! Please provide your primary delivery address to start ordering.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveOnboarding} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="street">Street Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="street"
                    placeholder="123 Blue Spring Rd"
                    className="pl-10 h-12 rounded-xl"
                    required
                    value={addressDraft.street}
                    onChange={(e) => setAddressDraft((current) => ({ ...current, street: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="Lagos"
                    className="h-12 rounded-xl"
                    required
                    value={addressDraft.city}
                    onChange={(e) => setAddressDraft((current) => ({ ...current, city: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input
                    id="zip"
                    placeholder="100001"
                    className="h-12 rounded-xl"
                    required
                    value={addressDraft.postalCode}
                    onChange={(e) => setAddressDraft((current) => ({ ...current, postalCode: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State / Province</Label>
                <Input
                  id="state"
                  placeholder="Lagos State"
                  className="h-12 rounded-xl"
                  required
                  value={addressDraft.state}
                  onChange={(e) => setAddressDraft((current) => ({ ...current, state: e.target.value }))}
                />
              </div>
              <Button
                type="submit"
                className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20 mt-4"
                disabled={isSavingOnboarding}
              >
                {isSavingOnboarding ? "Saving..." : "Save & Continue"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <footer className="bg-white border-t py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
              <div className="col-span-1 md:col-span-1">
                <div className="flex items-center gap-2 mb-6">
                  <Droplets className="h-6 w-6 text-primary" />
                  <span className="text-xl font-bold tracking-tight text-primary font-headline">WaterDrop</span>
                </div>
                <p className="text-sm text-muted-foreground">The ultimate marketplace for water.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-6 rounded-xl gap-2 h-10 w-full"
                  onClick={() => {
                    localStorage.removeItem('pwa-prompt-dismissed');
                    window.location.reload();
                  }}
                >
                  <Download className="h-4 w-4" /> Install App
                </Button>
              </div>
              <div>
                <h4 className="font-bold mb-4">Support</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="#" className="hover:text-primary">Help Center</Link></li>
                  <li><Link href="#" className="hover:text-primary">Terms of Service</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Join Us</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="/auth/register?role=vendor" className="hover:text-primary">Become a Vendor</Link></li>
                  <li><Link href="/auth/register?role=driver" className="hover:text-primary">Drive with WaterDrop</Link></li>
                </ul>
              </div>
            </div>
            <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
              © 2024 WaterDrop Marketplace. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function HomePageFallback() {
  return <div className="min-h-screen bg-background" />;
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomePageFallback />}>
      <HomePageContent />
    </Suspense>
  );
}
