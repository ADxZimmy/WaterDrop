"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Droplets,
  Home,
  LogOut,
  Menu,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Truck,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthSignOut } from "@/hooks/use-auth-sign-out";
import { cn } from "@/lib/utils";

type LayoutUser = {
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
};

type CustomerNotification = {
  title: string;
  description: string;
  time: string;
};

const customerNav = [
  { name: "Marketplace", href: "/dashboard/customer/marketplace", icon: Home },
  { name: "Profile", href: "/dashboard/customer", icon: User },
  { name: "Orders", href: "/dashboard/customer/orders", icon: ShoppingBag },
  { name: "Track", href: "/dashboard/customer/track-order", icon: Truck },
  { name: "Settings", href: "/dashboard/customer/settings", icon: Settings },
];

const mobileNav = [
  { name: "Shop", href: "/dashboard/customer/marketplace", icon: Home },
  { name: "Orders", href: "/dashboard/customer/orders", icon: ShoppingBag },
  { name: "Cart", href: "/cart", icon: ShoppingCart },
  { name: "Track", href: "/dashboard/customer/track-order", icon: Truck },
  { name: "Profile", href: "/dashboard/customer", icon: User },
];

function isActivePath(pathname: string | null, href: string) {
  if (!pathname) {
    return false;
  }

  if (href === "/dashboard/customer") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function getDisplayName(user: LayoutUser) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ") || "Customer";
}

function getInitials(user: LayoutUser) {
  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.trim();
  return (initials || user.email.slice(0, 2) || "CU").toUpperCase();
}

export function CustomerShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: LayoutUser;
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const { isSigningOut, signOut } = useAuthSignOut();
  const displayName = getDisplayName(user);
  const notificationCount = notifications.length;
  const notificationBadge = notificationCount > 9 ? "9+" : String(notificationCount);
  const cartBadge = cartItemsCount > 9 ? "9+" : String(cartItemsCount);

  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      const [latestOrderResponse, cartResponse] = await Promise.all([
        fetch("/api/orders/latest", { method: "GET" }).catch(() => null),
        fetch("/api/cart", { method: "GET" }).catch(() => null),
      ]);
      const nextNotifications: CustomerNotification[] = [];

      if (latestOrderResponse?.ok) {
        const payload = await latestOrderResponse.json();
        if (payload.order) {
          nextNotifications.push({
            title: "Active order update",
            description: `${payload.order.vendorName ?? "Your vendor"} has an active delivery in progress.`,
            time: "Live",
          });
        }
      }

      if (cartResponse?.ok) {
        const payload = await cartResponse.json();
        const cartItemsCount = (payload.cart?.items ?? []).reduce(
          (sum: number, item: { quantity: number }) => sum + item.quantity,
          0
        );

        if (isMounted) {
          setCartItemsCount(cartItemsCount);
        }

        if (cartItemsCount > 0) {
          nextNotifications.push({
            title: "Cart waiting",
            description: `${cartItemsCount} item${cartItemsCount === 1 ? "" : "s"} waiting for checkout.`,
            time: "Now",
          });
        }
      }

      if (isMounted) {
        setNotifications(nextNotifications);
      }
    };

    void loadNotifications().catch(() => {
      if (isMounted) {
        setNotifications([]);
        setCartItemsCount(0);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-white">
      <Link href="/dashboard/customer/marketplace" className="flex items-center gap-3 border-b p-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
          <Droplets className="h-6 w-6" />
        </div>
        <div>
          <span className="block font-headline text-xl font-bold leading-none tracking-tight text-primary">
            WaterDrop
          </span>
          <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Customer Hub
          </span>
        </div>
      </Link>

      <div className="border-b bg-primary/5 p-4">
        <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
          <Avatar className="h-10 w-10 rounded-xl">
            {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={displayName} /> : null}
            <AvatarFallback className="rounded-xl bg-primary text-xs font-bold text-white">
              {getInitials(user)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {customerNav.map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)}>
              <Button
                variant="ghost"
                className={cn(
                  "h-12 w-full justify-start gap-3 rounded-xl px-4 transition-all",
                  active
                    ? "bg-primary/10 font-bold text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <item.icon className={cn("h-5 w-5", active && "text-primary")} />
                <span className="text-sm">{item.name}</span>
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="border-t bg-muted/5 p-4">
        <Button
          variant="ghost"
          className="h-12 w-full justify-start gap-3 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
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
    <div className="flex min-h-dvh bg-muted/10">
      <aside className="sticky top-0 hidden h-screen w-72 flex-col border-r bg-white lg:flex">
        <SidebarContent />
      </aside>

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white/85 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <div className="lg:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl hover:bg-muted">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open customer menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 border-none p-0 shadow-2xl">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Customer Navigation</SheetTitle>
                    <SheetDescription>Access shopping, orders, tracking, and account settings.</SheetDescription>
                  </SheetHeader>
                  <SidebarContent />
                </SheetContent>
              </Sheet>
            </div>
            <Link href="/dashboard/customer/marketplace" className="flex items-center gap-2">
              <Droplets className="h-6 w-6 text-primary" />
              <span className="font-headline text-lg font-bold tracking-tight">WaterDrop</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative h-11 w-11 rounded-xl hover:bg-muted">
                <ShoppingCart className="h-5 w-5" />
                {cartItemsCount > 0 ? (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
                    {cartBadge}
                  </span>
                ) : null}
                <span className="sr-only">Open cart</span>
              </Button>
            </Link>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-11 w-11 rounded-xl hover:bg-muted">
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 ? (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
                      {notificationBadge}
                    </span>
                  ) : null}
                  <span className="sr-only">Open notifications</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-[min(22rem,calc(100vw-2rem))] rounded-2xl p-0 shadow-2xl">
                <div className="border-b p-4">
                  <p className="font-headline text-lg font-bold">Notifications</p>
                  <p className="text-xs text-muted-foreground">
                    Customer alerts and order reminders.
                  </p>
                </div>
                <div className="max-h-80 space-y-1 overflow-y-auto p-2">
                  {notificationCount === 0 ? (
                    <div className="p-6 text-center">
                      <p className="font-bold text-sm">No notifications</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        New order, cart, and delivery alerts will appear here.
                      </p>
                    </div>
                  ) : notifications.map((notification) => (
                    <div key={notification.title} className="rounded-xl p-3 transition-colors hover:bg-muted/70">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-bold">{notification.title}</p>
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                          {notification.time}
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {notification.description}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="border-t p-3">
                  <Link href="/dashboard/customer/track-order">
                    <Button variant="outline" className="h-10 w-full rounded-xl">
                      View live tracking
                    </Button>
                  </Link>
                </div>
              </PopoverContent>
            </Popover>
            <div className="hidden min-w-0 text-right sm:block">
              <p className="truncate text-xs font-bold leading-none">{displayName}</p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                Customer
              </p>
            </div>
            <Avatar className="h-10 w-10 rounded-xl shadow-lg shadow-primary/20">
              {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={displayName} /> : null}
              <AvatarFallback className="rounded-xl bg-primary text-xs font-bold text-white">
                {getInitials(user)}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="min-w-0 flex-1 pb-24 lg:pb-0">{children}</main>

        <nav className="safe-area-bottom fixed inset-x-0 bottom-0 z-50 border-t bg-white/95 backdrop-blur-xl lg:hidden">
          <div className="mx-auto grid h-16 max-w-lg grid-cols-5">
            {mobileNav.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex min-h-11 flex-col items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-tight transition-colors",
                    active ? "text-primary" : "text-muted-foreground hover:text-primary"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", active && "stroke-[2.6px]")} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
