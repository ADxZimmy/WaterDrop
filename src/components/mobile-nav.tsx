
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, User, Truck } from 'lucide-react';
import { cn } from "@/lib/utils";

const mobileItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Orders', href: '/dashboard/customer/orders', icon: Truck },
  { name: 'Cart', href: '/cart', icon: ShoppingBag },
  { name: 'Profile', href: '/dashboard/customer', icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  // Hide mobile nav in auth and dashboard screens to use role-specific navigation
  // Note: We keep it for /dashboard/customer to provide easy back-to-home access
  const isAuth = pathname?.startsWith('/auth');
  const isVendorDashboard = pathname?.startsWith('/dashboard/vendor');
  const isDriverDashboard = pathname?.startsWith('/dashboard/driver');

  if (isAuth || isVendorDashboard || isDriverDashboard) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t safe-area-bottom">
      <nav className="flex justify-around items-center h-16">
        {mobileItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-200",
                isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-primary"
              )}
            >
              <item.icon className={cn("h-5 w-5 transition-transform", isActive && "stroke-[2.5px]")} />
              <span className="text-[10px] font-semibold uppercase tracking-tighter">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
