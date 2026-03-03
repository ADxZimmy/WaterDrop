
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Truck, 
  History, 
  Wallet, 
  User, 
  LogOut,
  Droplets,
  MapPin,
  LayoutDashboard
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const driverNav = [
  { name: 'Active', href: '/dashboard/driver', icon: Truck },
  { name: 'Earnings', href: '/dashboard/driver/earnings', icon: Wallet },
  { name: 'History', href: '/dashboard/driver/history', icon: History },
  { name: 'Profile', href: '/dashboard/driver/profile', icon: User },
];

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      <aside className="hidden lg:flex w-64 border-r bg-white flex-col sticky top-0 h-screen">
        <div className="p-6 flex items-center gap-2 border-b">
          <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center text-white">
            <Truck className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-primary font-headline">Driver Portal</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {driverNav.map((item) => (
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

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="lg:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-white">
                <Truck className="h-5 w-5" />
              </div>
              <h1 className="text-lg font-bold font-headline">Driver Portal</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-medium">Online</span>
            </div>
          </div>
        </header>

        <main className="flex-1 pb-20 lg:pb-0 bg-muted/10">
          {children}
        </main>

        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t h-16 flex justify-around items-center z-50 safe-area-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          {driverNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} className="flex-1 flex flex-col items-center justify-center gap-1 transition-all">
                <div className={cn("p-1 rounded-lg transition-colors", isActive && "bg-primary/10")}>
                  <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                </div>
                <span className={cn("text-[10px] font-bold uppercase tracking-tight", isActive ? "text-primary" : "text-muted-foreground")}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
