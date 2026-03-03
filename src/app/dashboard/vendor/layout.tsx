
"use client";

import React from 'react';
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
  X
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
  { name: 'Overview', href: '/dashboard/vendor', icon: LayoutDashboard },
  { name: 'Products', href: '/dashboard/vendor/products', icon: Package },
  { name: 'Orders', href: '/dashboard/vendor/orders', icon: ShoppingBag },
  { name: 'Customers', href: '#', icon: Users },
  { name: 'Analytics', href: '#', icon: BarChart3 },
  { name: 'Settings', href: '#', icon: Settings },
];

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 flex items-center gap-2 border-b">
        <Droplets className="h-8 w-8 text-primary" />
        <span className="text-2xl font-bold tracking-tight text-primary font-headline">Vendor Hub</span>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)}>
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
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r bg-white hidden lg:flex flex-col sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg font-headline">Vendor Hub</span>
          </div>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
