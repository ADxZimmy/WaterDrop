
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Settings, 
  Droplets,
  LogOut,
  BarChart3,
  Menu,
  Truck,
  DollarSign,
  Bell,
  Lock,
  ShieldCheck
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = [
  { name: 'Overview', href: '/dashboard/vendor', icon: LayoutDashboard, requiresActive: false },
  { name: 'Revenue', href: '/dashboard/vendor/revenue', icon: DollarSign, requiresActive: true },
  { name: 'Products', href: '/dashboard/vendor/products', icon: Package, requiresActive: true },
  { name: 'Orders', href: '/dashboard/vendor/orders', icon: ShoppingBag, requiresActive: true },
  { name: 'Drivers', href: '/dashboard/vendor/drivers', icon: Truck, requiresActive: true },
  { name: 'Customers', href: '/dashboard/vendor/customers', icon: Users, requiresActive: true },
  { name: 'Analytics', href: '/dashboard/vendor/analytics', icon: BarChart3, requiresActive: true },
  { name: 'Settings', href: '/dashboard/vendor/settings', icon: Settings, requiresActive: false },
];

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  
  // Simulated status - in a real app this would come from a user context
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Check for dev bypass
    const isApproved = localStorage.getItem('vendor_bypass_approved') === 'true';
    setIsActive(isApproved);
  }, []);

  const handleToggleBypass = () => {
    const newState = !isActive;
    setIsActive(newState);
    localStorage.setItem('vendor_bypass_approved', newState ? 'true' : 'false');
    window.location.reload();
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="p-6 flex items-center gap-2 border-b">
        <Droplets className="h-8 w-8 text-primary" />
        <div className="flex flex-col">
          <span className="text-2xl font-bold tracking-tight text-primary font-headline leading-none">WaterDrop</span>
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Vendor Hub</span>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        <TooltipProvider>
          {navItems.map((item) => {
            const activeLink = pathname === item.href;
            const disabled = item.requiresActive && !isActive;
            
            const LinkContent = (
              <Button
                variant="ghost"
                disabled={disabled}
                className={cn(
                  "w-full justify-start gap-3 h-11 px-4 rounded-xl transition-all",
                  activeLink 
                    ? "bg-primary/10 text-primary font-bold shadow-sm" 
                    : "text-muted-foreground hover:bg-muted",
                  disabled && "opacity-50 cursor-not-allowed grayscale"
                )}
              >
                <item.icon className={cn("h-5 w-5", activeLink && "text-primary")} />
                <span className="flex-1 text-left">{item.name}</span>
                {disabled && <Lock className="h-3 w-3 text-muted-foreground/50" />}
              </Button>
            );

            return disabled ? (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>
                  <div className="w-full">{LinkContent}</div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  Account review required
                </TooltipContent>
              </Tooltip>
            ) : (
              <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)}>
                {LinkContent}
              </Link>
            );
          })}
        </TooltipProvider>
      </nav>

      <div className="p-4 border-t bg-muted/5">
        <Link href="/auth/login">
          <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl h-11">
            <LogOut className="h-5 w-5" />
            <span className="font-bold">Sign Out</span>
          </Button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 border-r bg-white hidden lg:flex flex-col sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b p-4 px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="lg:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-muted">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72 border-none shadow-2xl">
                  <SheetHeader className="sr-only">
                    <SheetTitle>WaterDrop Vendor Hub</SheetTitle>
                    <SheetDescription>Main navigation for the vendor dashboard</SheetDescription>
                  </SheetHeader>
                  <SidebarContent />
                </SheetContent>
              </Sheet>
            </div>
            <div className="lg:hidden flex items-center gap-2">
              <Droplets className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg font-headline">WaterDrop</span>
            </div>
            {!isActive ? (
              <div className="hidden sm:flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100 ml-4">
                <span className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-bold uppercase tracking-tight text-yellow-700">Account Review Pending</span>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 ml-4">
                <ShieldCheck className="h-3 w-3 text-emerald-600" />
                <span className="text-[10px] font-bold uppercase tracking-tight text-emerald-700">Verified Partner</span>
              </div>
            )}
            
            {/* DEV BYPASS BUTTON */}
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-4 h-8 rounded-lg border-orange-200 text-orange-600 bg-orange-50 hover:bg-orange-100 text-[10px] font-bold"
              onClick={handleToggleBypass}
            >
              [DEV] {isActive ? "REVOKE ACCESS" : "BYPASS APPROVAL"}
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/dashboard/vendor/notifications">
              <Button variant="ghost" size="icon" className="relative rounded-full h-10 w-10 hover:bg-muted/50 transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 h-2 w-2 bg-destructive rounded-full border-2 border-white"></span>
              </Button>
            </Link>
            <div className="h-9 w-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xs shadow-lg shadow-primary/20">
              AP
            </div>
          </div>
        </header>

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
