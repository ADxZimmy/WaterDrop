
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { 
  ShoppingCart, 
  Search, 
  Store, 
  Droplets, 
  ArrowRight, 
  User, 
  Truck, 
  Star, 
  MapPin, 
  Download,
  Menu,
  ShoppingBag,
  Heart,
  Settings,
  LogOut,
  Bell,
  ChevronRight,
  LayoutDashboard,
  ChevronLeft
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { PlaceHolderImages } from '@/lib/placeholder-images';

const categories = ["All", "Bottled Water", "Bags of Water"];

const vendors = [
  {
    id: "1",
    name: "Aqua Pure Factory",
    rating: 4.8,
    reviews: 124,
    distance: "1.2 km",
    image: "vendor-1",
    category: "Bottled Water"
  },
  {
    id: "2",
    name: "Blue Wave Distro",
    rating: 4.5,
    reviews: 89,
    distance: "2.4 km",
    image: "vendor-2",
    category: "Bags of Water"
  },
  {
    id: "3",
    name: "Crystal Spring",
    rating: 4.9,
    reviews: 210,
    distance: "0.8 km",
    image: "vendor-1",
    category: "Bottled Water"
  },
  {
    id: "4",
    name: "Oasis Flow",
    rating: 4.7,
    reviews: 156,
    distance: "3.1 km",
    image: "vendor-2",
    category: "Bags of Water"
  },
  {
    id: "5",
    name: "Pure Life Springs",
    rating: 4.6,
    reviews: 95,
    distance: "1.8 km",
    image: "vendor-1",
    category: "Bottled Water"
  }
];

const customerNavItems = [
  { name: 'Marketplace', href: '/', icon: Store },
  { name: 'My Orders', href: '/dashboard/customer/orders', icon: ShoppingBag },
  { name: 'Profile', href: '/dashboard/customer', icon: User },
  { name: 'Favorites', href: '#', icon: Heart },
  { name: 'Settings', href: '#', icon: Settings },
];

export default function Home() {
  const searchParams = useSearchParams();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('loggedin') === 'true') {
      setIsLoggedIn(true);
    }
  }, [searchParams]);

  const filteredVendors = useMemo(() => {
    return vendors.filter(vendor => {
      const matchesCategory = activeCategory === "All" || vendor.category === activeCategory;
      const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            vendor.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory]);

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
        <Link href="/auth/login" onClick={() => setIsLoggedIn(false)}>
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
      {isLoggedIn && (
        <aside className="hidden lg:flex w-64 border-r bg-white flex-col sticky top-0 h-screen">
          <SidebarContent />
        </aside>
      )}

      <div className="flex-1 flex flex-col min-h-screen">
        <nav className="sticky top-0 z-50 glass-effect border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center gap-2">
                {isLoggedIn && (
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
                <Droplets className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold tracking-tight text-primary font-headline">WaterDrop</span>
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
                <Link href="/dashboard/customer/orders">
                  <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/5 rounded-full">
                    <Truck className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/cart">
                  <Button variant="ghost" size="icon" className="relative rounded-full">
                    <ShoppingCart className="h-5 w-5" />
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 rounded-full text-[10px]">2</Badge>
                  </Button>
                </Link>
                
                {!isLoggedIn ? (
                  <>
                    <div className="hidden sm:flex items-center gap-2">
                      <Link href="/dashboard/vendor">
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
                  <Link href="/dashboard/customer" className="hidden sm:block">
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
          <div className="bg-primary/10 border-b border-primary/20 py-3 px-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                  <Truck className="h-4 w-4" />
                </div>
                <p className="text-sm font-bold text-primary">You have an order in transit!</p>
              </div>
              <Link href="/dashboard/customer/orders">
                <Button size="sm" className="rounded-full h-8 px-4 text-xs">View Orders</Button>
              </Link>
            </div>
          </div>

          {!isLoggedIn && (
            <section className="relative h-[550px] flex items-center overflow-hidden">
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
                  <h1 className="text-5xl md:text-6xl font-bold font-headline leading-tight mb-6">
                    Pure Water, <br />
                    <span className="text-primary">Delivered</span> to Your Door.
                  </h1>
                  <p className="text-lg text-muted-foreground mb-8">
                    The largest multi-vendor marketplace for high-quality bottled and sachet water. 
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link href="#vendors">
                      <Button size="lg" className="h-14 px-8 rounded-full text-lg shadow-lg">
                        Shop Now
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="h-14 px-8 rounded-full text-lg gap-2 border-primary/20 text-primary hover:bg-primary/5"
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
                  {categories.map((cat) => (
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

              {filteredVendors.length > 0 ? (
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
                                <h4 className="text-xl font-bold truncate">{vendor.name}</h4>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-2">
                                  <div className="flex items-center gap-1 text-yellow-500 font-bold">
                                    <Star className="h-3 w-3 fill-current" /> {vendor.rating}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" /> {vendor.distance}
                                  </div>
                                </div>
                                <Badge variant="outline" className="text-[10px] uppercase tracking-wider mt-3 w-fit">{vendor.category}</Badge>
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
                  <h3 className="text-xl font-bold">No vendors found</h3>
                  <p className="text-muted-foreground">Try adjusting your search or category filters.</p>
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

        <footer className="bg-white border-t py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
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
                <h4 className="font-bold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="#vendors" className="hover:text-primary">All Vendors</Link></li>
                  <li><Link href="/dashboard/customer/orders" className="hover:text-primary">My Orders</Link></li>
                </ul>
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
                  <li><Link href="/auth/register" className="hover:text-primary">Become a Vendor</Link></li>
                  <li><Link href="/auth/register" className="hover:text-primary">Drive with WaterDrop</Link></li>
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
