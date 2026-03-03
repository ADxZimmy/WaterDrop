"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Truck, 
  Users, 
  Settings, 
  Droplets,
  LogOut,
  BarChart3
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: 'Overview', href: '/dashboard/vendor', icon: LayoutDashboard },
  { name: 'Products', href: '/dashboard/vendor/products', icon: Package },
  { name: 'Orders', href: '/dashboard/vendor/orders', icon: ShoppingBag },
  { name: 'Drivers', href: '/dashboard/driver', icon: Truck },
  { name: 'Analytics', href: '#', icon: BarChart3 },
  { name: 'Customers', href: '#', icon: Users },
  { name: 'Settings', href: '#', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r bg-white hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6 flex items-center gap-2 border-b">
          <Droplets className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold tracking-tight text-primary font-headline">AquaMart</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.name} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-11 px-4 rounded-xl transition-all",
                  pathname === item.href 
                    ? "bg-primary/10 text-primary font-bold" 
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <item.icon className={cn("h-5 w-5", pathname === item.href && "text-primary")} />
                {item.name}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t">
          <Link href="/auth/login">
            <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/5 rounded-xl">
              <LogOut className="h-5 w-5" />
              Sign Out
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}