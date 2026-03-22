"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShieldCheck,
  Store,
  Users,
  Truck,
  ShoppingBag,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  Bell,
  Search,
  ScrollText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthSignOut } from "@/hooks/use-auth-sign-out";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type LayoutUser = {
  email: string;
  firstName?: string;
  lastName?: string;
};

const adminNav = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Applications", href: "/admin/applications", icon: ShieldCheck, badge: "2" },
  { name: "Vendors", href: "/admin/vendors", icon: Store },
  { name: "Drivers", href: "/admin/drivers", icon: Truck },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Payout ledger", href: "/admin/payout-ledger", icon: ScrollText },
  { name: "System Settings", href: "/admin/settings", icon: Settings },
];

function getInitials(user: LayoutUser) {
  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.trim();
  if (initials) {
    return initials.toUpperCase();
  }

  return user.email.slice(0, 2).toUpperCase();
}

export function AdminShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: LayoutUser;
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Platform Owner";
  const { isSigningOut, signOut } = useAuthSignOut("/auth/admin");

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div className="text-left">
          <span className="text-xl font-bold tracking-tight text-white font-headline block leading-none">
            WaterDrop
          </span>
          <span className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">
            Super Admin
          </span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {adminNav.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-11 px-4 rounded-xl transition-all group hover:bg-slate-800 hover:text-white",
                  isActive ? "bg-primary text-white font-bold shadow-lg shadow-primary/20" : "text-slate-400"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "group-hover:text-primary")} />
                <span className="flex-1 text-left">{item.name}</span>
                {item.badge && (
                  <span className="bg-destructive text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl h-11"
          disabled={isSigningOut}
          onClick={() => void signOut()}
        >
          <LogOut className="h-5 w-5 text-destructive" />
          <span className="font-bold">{isSigningOut ? "Exiting..." : "Exit Admin"}</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row overflow-x-hidden">
      <aside className="hidden lg:flex w-64 bg-slate-900 flex-col sticky top-0 h-screen shadow-2xl">
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b p-4 px-6 flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <div className="lg:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-100">
                    <Menu className="h-6 w-6 text-slate-600" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72 border-none shadow-2xl">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Admin Navigation</SheetTitle>
                    <SheetDescription>Platform management controls</SheetDescription>
                  </SheetHeader>
                  <SidebarContent />
                </SheetContent>
              </Sheet>
            </div>
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full w-64">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search everything..."
                className="bg-transparent border-none outline-none text-xs w-full text-slate-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-slate-100">
              <Bell className="h-5 w-5 text-slate-600" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-destructive rounded-full border-2 border-white"></span>
            </Button>
            <div className="h-px w-4 bg-slate-200 rotate-90 hidden sm:block"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-none">{displayName}</p>
                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-tighter">Super Admin</p>
              </div>
              <Avatar className="h-9 w-9 border-2 border-primary/20">
                <AvatarImage src="https://picsum.photos/seed/admin/100" />
                <AvatarFallback>{getInitials(user)}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
