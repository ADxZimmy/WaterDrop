"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { MobileNav } from "@/components/mobile-nav";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

function shouldShowPublicMobileNav(pathname: string | null) {
  if (!pathname) {
    return true;
  }

  return !(
    pathname.startsWith("/auth") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin")
  );
}

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showMobileNav = shouldShowPublicMobileNav(pathname);
  const showInstallPrompt = pathname === "/";

  return (
    <div className="flex min-h-dvh flex-col">
      <main
        className={cn(
          "relative w-full max-w-full flex-1",
          showMobileNav && "pb-16 md:pb-0"
        )}
      >
        {children}
      </main>
      {showMobileNav ? <MobileNav /> : null}
      {showInstallPrompt ? <PwaInstallPrompt /> : null}
      <Toaster />
    </div>
  );
}
