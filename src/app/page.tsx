import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Search, Store, Droplets, ArrowRight, User, Truck } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlaceHolderImages } from '@/lib/placeholder-images';

const categories = ["All", "Bottled Water", "Bags of Water", "Bulk Supply"];

const featuredProducts = [
  {
    id: 1,
    name: "PureLife Premium Bottled Water",
    vendor: "Aqua Pure",
    price: 12.50,
    category: "Bottled Water",
    image: "bottle-1",
    rating: 4.8
  },
  {
    id: 2,
    name: "Crystal Sachet Water (Pack of 20)",
    vendor: "Blue Wave",
    price: 5.00,
    category: "Bags of Water",
    image: "bag-water",
    rating: 4.5
  },
  {
    id: 3,
    name: "AquaMart Bulk Dispenser Refill",
    vendor: "Aqua Pure",
    price: 8.00,
    category: "Bulk Supply",
    image: "hero-water",
    rating: 4.9
  },
  {
    id: 4,
    name: "Spring Fresh Bottled 750ml",
    vendor: "Blue Wave",
    price: 1.20,
    category: "Bottled Water",
    image: "bottle-1",
    rating: 4.7
  }
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass-effect border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <Droplets className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold tracking-tight text-primary font-headline">AquaMart</span>
            </div>
            
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search for water products..." className="pl-10 w-full rounded-full" />
              </div>
            </div>

            <div className="flex items-center gap-3">
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
        {/* Hero Section */}
        <section className="relative h-[500px] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image 
              src={PlaceHolderImages.find(img => img.id === 'hero-water')?.imageUrl || ''} 
              alt="Fresh water"
              fill
              className="object-cover opacity-20"
              priority
              data-ai-hint="water splash"
            />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-2xl">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 px-4 py-1">
                Fast & Fresh Delivery
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold font-headline leading-tight mb-6">
                Pure Water, <br />
                <span className="text-primary">Delivered</span> to Your Door.
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                The largest multi-vendor marketplace for high-quality bottled and sachet water. 
                Order from local vendors and get instant delivery.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="h-14 px-8 rounded-full text-lg shadow-lg">
                  Shop Now
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 rounded-full text-lg">
                  View Vendors
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-4 justify-center">
              {categories.map((cat) => (
                <Button key={cat} variant={cat === "All" ? "default" : "outline"} className="rounded-full px-6">
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-3xl font-bold font-headline">Featured Products</h2>
                <p className="text-muted-foreground">Top-rated water from verified vendors</p>
              </div>
              <Button variant="link" className="text-primary flex items-center gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 border-none bg-white rounded-2xl overflow-hidden">
                  <CardHeader className="p-0 relative h-64">
                    <Image 
                      src={PlaceHolderImages.find(img => img.id === product.image)?.imageUrl || ''} 
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <Badge className="absolute top-4 right-4 bg-white/90 text-primary hover:bg-white">{product.category}</Badge>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-lg font-bold line-clamp-1">{product.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                      <Store className="h-3 w-3" />
                      {product.vendor}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-primary">${product.price.toFixed(2)}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">★</span>
                        <span className="text-sm">{product.rating}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="px-6 pb-6 pt-0">
                    <Button className="w-full rounded-xl gap-2 shadow-sm">
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose AquaMart */}
        <section className="py-20 bg-primary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold font-headline mb-4">Why Choose AquaMart?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">We connect you with the best local water suppliers ensuring quality and speed.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 bg-white rounded-2xl shadow-md flex items-center justify-center text-primary mb-6">
                  <Droplets className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">Pure Quality</h3>
                <p className="text-muted-foreground">Every vendor on our platform goes through a rigorous quality verification process.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 bg-white rounded-2xl shadow-md flex items-center justify-center text-primary mb-6">
                  <Truck className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">Speedy Delivery</h3>
                <p className="text-muted-foreground">Our network of dedicated drivers ensures your water arrives in minutes, not hours.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 bg-white rounded-2xl shadow-md flex items-center justify-center text-primary mb-6">
                  <Store className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">Multi-Vendor</h3>
                <p className="text-muted-foreground">Compare prices and quality from multiple vendors in your neighborhood.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <Droplets className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold tracking-tight text-primary font-headline">AquaMart</span>
              </div>
              <p className="text-sm text-muted-foreground">The ultimate marketplace for water. Connecting vendors, drivers, and customers.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">All Products</Link></li>
                <li><Link href="#" className="hover:text-primary">Featured Vendors</Link></li>
                <li><Link href="/cart" className="hover:text-primary">Shopping Cart</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">Help Center</Link></li>
                <li><Link href="#" className="hover:text-primary">Track Order</Link></li>
                <li><Link href="#" className="hover:text-primary">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Join Us</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/auth/register" className="hover:text-primary">Become a Vendor</Link></li>
                <li><Link href="/auth/register" className="hover:text-primary">Drive with AquaMart</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
            © 2024 AquaMart Marketplace. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
