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
  LayoutDashboard,
  Bell,
  Menu
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
  const [isOpen, setIsOpen] = React.useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 flex items-center gap-2 border-b">
        <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white">
          <Truck className="h-6 w-6" />
        </div>
        <span className="text-xl font-bold tracking-tight text-primary font-headline">WaterDrop</span>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {driverNav.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-12 px-4 rounded-xl transition-all",
                  isActive 
                    ? "bg-primary/10 text-primary font-bold" 
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <Link href="/auth/login">
          <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/5 rounded-xl">
            <LogOut className="h-5 w-5" />
            Sign Out
          </Button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      <aside className="hidden lg:flex w-64 border-r bg-white flex-col sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b p-4 px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="lg:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72">
                  <SheetHeader className="sr-only">
                    <SheetTitle>WaterDrop Navigation</SheetTitle>
                    <SheetDescription>Access driver management sections</SheetDescription>
                  </SheetHeader>
                  <SidebarContent />
                </SheetContent>
              </Sheet>
            </div>
            <h1 className="text-lg font-bold font-headline hidden lg:block">Welcome back, Driver</h1>
            <div className="lg:hidden flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              <span className="font-bold">WaterDrop</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/driver/notifications">
              <Button variant="ghost" size="icon" className="rounded-full relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 h-2 w-2 bg-destructive rounded-full border-2 border-white"></span>
              </Button>
            </Link>
            <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full border border-green-100">
              <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-bold uppercase tracking-tight text-green-700">Online</span>
            </div>
          </div>
        </header>

        <main className="flex-1 bg-muted/10">
          {children}
        </main>
      </div>
    </div>
  );
}
