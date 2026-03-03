import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Search, Store, Droplets, ArrowRight, User, Truck, Star, MapPin } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  }
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <nav className="sticky top-0 z-50 glass-effect border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <Droplets className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold tracking-tight text-primary font-headline">WaterDrop</span>
            </div>
            
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search for water products..." className="pl-10 w-full rounded-full" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/dashboard/customer/orders">
                <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/5">
                  <Truck className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 rounded-full text-[10px]">2</Badge>
                </Button>
              </Link>
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/dashboard/vendor">
                  <Button variant="outline" size="sm" className="gap-2 border-primary/20 hover:bg-primary/5 text-primary">
                    <Store className="h-4 w-4" />
                    Vendor
                  </Button>
                </Link>
                <Link href="/dashboard/driver">
                  <Button variant="outline" size="sm" className="gap-2 border-accent/20 hover:bg-accent/5 text-accent">
                    <Truck className="h-4 w-4" />
                    Driver
                  </Button>
                </Link>
              </div>
              <Link href="/auth/login">
                <Button variant="default" className="hidden sm:flex items-center gap-2 rounded-xl">
                  <User className="h-4 w-4" />
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {/* Active Order Banner */}
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

        <section className="relative h-[500px] flex items-center overflow-hidden">
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
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="#vendors">
                  <Button size="lg" className="h-14 px-8 rounded-full text-lg shadow-lg">
                    Shop Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-white" id="vendors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
              <div>
                <h2 className="text-3xl font-bold font-headline">Verified Vendors</h2>
                <p className="text-muted-foreground">Order direct from the best sources near you</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {categories.map((cat) => (
                  <Button key={cat} variant={cat === "All" ? "default" : "outline"} className="rounded-full px-6">
                    {cat}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex overflow-x-auto gap-6 pb-8 no-scrollbar snap-x">
              {vendors.map((vendor) => (
                <Link key={vendor.id} href={`/vendors/${vendor.id}`} className="snap-start shrink-0">
                  <Card className="w-72 group hover:shadow-2xl transition-all duration-300 border-none bg-white rounded-3xl overflow-hidden flex flex-col h-full">
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
              ))}
            </div>
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
  );
}
