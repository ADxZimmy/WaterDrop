"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  ShieldCheck,
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type LayoutUser = {
  email: string;
  firstName?: string;
  lastName?: string;
};

const navItems = [
  { name: "Overview", href: "/dashboard/vendor", icon: LayoutDashboard },
  { name: "Revenue", href: "/dashboard/vendor/revenue", icon: DollarSign },
  { name: "Products", href: "/dashboard/vendor/products", icon: Package },
  { name: "Orders", href: "/dashboard/vendor/orders", icon: ShoppingBag },
  { name: "Drivers", href: "/dashboard/vendor/drivers", icon: Truck },
  { name: "Customers", href: "/dashboard/vendor/customers", icon: Users },
  { name: "Analytics", href: "/dashboard/vendor/analytics", icon: BarChart3 },
  { name: "Settings", href: "/dashboard/vendor/settings", icon: Settings },
];

export function VendorShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: LayoutUser;
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const firstName = user.firstName || "Partner";
  const { isSigningOut, signOut } = useAuthSignOut();

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="p-6 flex items-center gap-2 border-b">
        <Droplets className="h-8 w-8 text-primary" />
        <div className="flex flex-col">
          <span className="text-2xl font-bold tracking-tight text-primary font-headline leading-none">WaterDrop</span>
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">
            Vendor Hub
          </span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <TooltipProvider>
          {navItems.map((item) => {
            const activeLink = pathname === item.href;

            return (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>
                  <Link href={item.href} onClick={() => setIsOpen(false)}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3 h-11 px-4 rounded-xl transition-all",
                        activeLink ? "bg-primary/10 text-primary font-bold shadow-sm" : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <item.icon className={cn("h-5 w-5", activeLink && "text-primary")} />
                      <span className="flex-1 text-left">{item.name}</span>
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Vendor workspace</TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </nav>

      <div className="p-4 border-t bg-muted/5">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl h-11"
          disabled={isSigningOut}
          onClick={() => void signOut()}
        >
          <LogOut className="h-5 w-5" />
          <span className="font-bold">{isSigningOut ? "Signing Out..." : "Sign Out"}</span>
        </Button>
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
            <div className="hidden sm:flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 ml-4">
              <ShieldCheck className="h-3 w-3 text-emerald-600" />
              <span className="text-[10px] font-bold uppercase tracking-tight text-emerald-700">
                {firstName} Workspace
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard/vendor/notifications">
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-full h-10 w-10 hover:bg-muted/50 transition-colors"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 h-2 w-2 bg-destructive rounded-full border-2 border-white"></span>
              </Button>
            </Link>
            <div className="h-9 w-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xs shadow-lg shadow-primary/20">
              {(user.firstName?.[0] ?? user.email[0] ?? "V").toUpperCase()}
              {(user.lastName?.[0] ?? user.email[1] ?? "").toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
