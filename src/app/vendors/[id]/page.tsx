
"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { ArrowLeft, Star, Clock, MapPin, Phone, Info, ShoppingCart, Store } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlaceHolderImages } from '@/lib/placeholder-images';

const vendorData = {
  id: "1",
  name: "Aqua Pure Factory",
  rating: 4.8,
  reviews: 124,
  deliveryTime: "15-25 min",
  distance: "1.2 km",
  description: "Premium purified water direct from the source. We use advanced osmosis and UV filtration to ensure the highest quality for your family.",
  categories: ["All", "Bottled", "Bags", "Bulk"],
  products: [
    { id: 101, name: "Premium 750ml (Box of 12)", price: 12.50, image: "bottle-1", category: "Bottled" },
    { id: 102, name: "Dispenser Refill 19L", price: 8.00, image: "hero-water", category: "Bulk" },
    { id: 103, name: "Sachet Water (Pack 20)", price: 5.00, image: "bag-water", category: "Bags" },
    { id: 104, name: "Distilled 5L Jug", price: 4.50, image: "bottle-1", category: "Bottled" },
  ]
};

export default function VendorDetailPage() {
  const params = useParams();

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
        <Link href="/" className="absolute top-6 left-6 z-10">
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
                <CardTitle className="text-3xl font-bold font-headline">{vendorData.name}</CardTitle>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1 text-yellow-500 font-bold">
                    <Star className="h-4 w-4 fill-current" /> {vendorData.rating} <span className="text-muted-foreground font-normal">({vendorData.reviews} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" /> {vendorData.deliveryTime}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {vendorData.distance}
                  </div>
                </div>
              </div>
              <Button size="icon" variant="outline" className="rounded-full h-12 w-12 border-primary/20 text-primary">
                <Phone className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">{vendorData.description}</p>
            
            <Tabs defaultValue="All" className="w-full">
              <TabsList className="bg-muted/50 p-1 mb-6 inline-flex overflow-x-auto no-scrollbar w-full sm:w-auto">
                {vendorData.categories.map(cat => (
                  <TabsTrigger key={cat} value={cat} className="rounded-lg px-6">{cat}</TabsTrigger>
                ))}
              </TabsList>

              {vendorData.categories.map(cat => (
                <TabsContent key={cat} value={cat} className="mt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {vendorData.products.filter(p => cat === "All" || p.category === cat).map(product => (
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
                            <h4 className="font-bold text-sm leading-tight">{product.name}</h4>
                            <p className="text-primary font-bold mt-1">${product.price.toFixed(2)}</p>
                          </div>
                          <Button size="sm" className="h-8 rounded-lg w-fit gap-1">
                            <ShoppingCart className="h-3 w-3" /> Add
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50">
        <Link href="/cart">
          <Button className="w-full h-14 rounded-2xl shadow-2xl shadow-primary/40 text-lg font-bold flex justify-between px-8">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-6 w-6" />
              <span>2 Items in Cart</span>
            </div>
            <span>$20.50</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
