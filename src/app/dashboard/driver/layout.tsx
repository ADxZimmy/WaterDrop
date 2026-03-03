"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Truck, 
  History, 
  Wallet, 
  User, 
  LogOut,
  Droplets,
  LayoutDashboard,
  Bell,
  Menu,
  ChevronRight
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";

const driverNav = [
  { name: 'Dashboard', href: '/dashboard/driver', icon: LayoutDashboard },
  { name: 'Earnings', href: '/dashboard/driver/earnings', icon: Wallet },
  { name: 'Trip History', href: '/dashboard/driver/history', icon: History },
  { name: 'Profile', href: '/dashboard/driver/profile', icon: User },
];

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="p-6 flex items-center gap-3 border-b">
        <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
          <Truck className="h-6 w-6" />
        </div>
        <div>
          <span className="text-xl font-bold tracking-tight text-primary font-headline block leading-none">WaterDrop</span>
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Driver Portal</span>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {driverNav.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-12 px-4 rounded-xl transition-all group",
                  isActive 
                    ? "bg-primary/10 text-primary font-bold shadow-sm" 
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <item.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", isActive && "text-primary")} />
                <span className="flex-1">{item.name}</span>
                {isActive && <ChevronRight className="h-4 w-4 opacity-50" />}
              </Button>
            </Link>
          );
        })}
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
    <div className="min-h-screen bg-background flex flex-col lg:flex-row overflow-x-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 border-r bg-white flex-col sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen w-full">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b p-4 px-6 flex justify-between items-center h-20">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Trigger */}
            <div className="lg:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <Menu className="h-6 w-6 text-foreground" />
                    <span className="sr-only">Toggle mobile menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-80 border-none shadow-2xl">
                  <SheetHeader className="sr-only">
                    <SheetTitle>WaterDrop Navigation</SheetTitle>
                    <SheetDescription>Access driver management sections</SheetDescription>
                  </SheetHeader>
                  <SidebarContent />
                </SheetContent>
              </Sheet>
            </div>

            {/* Title / Brand */}
            <div className="flex flex-col">
              <h1 className="text-lg font-bold font-headline hidden lg:block">Welcome back, John</h1>
              <div className="lg:hidden flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                <span className="font-bold text-lg tracking-tight font-headline">WaterDrop</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-green-50 px-4 py-1.5 rounded-full border border-green-100 mr-2">
              <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-bold uppercase tracking-tight text-green-700">Online</span>
            </div>
            
            <Link href="/dashboard/driver/notifications">
              <Button variant="ghost" size="icon" className="rounded-2xl h-11 w-11 bg-muted/20 relative hover:bg-muted/40 transition-all">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-destructive rounded-full border-2 border-white shadow-sm ring-2 ring-destructive/10 animate-pulse"></span>
              </Button>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 bg-muted/10 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}