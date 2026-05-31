"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Home, RefreshCw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type RoleErrorBoundaryProps = {
  error: Error & { digest?: string };
  reset: () => void;
  title: string;
  description: string;
  homeHref: string;
  homeLabel: string;
};

export function RoleErrorBoundary({
  error,
  reset,
  title,
  description,
  homeHref,
  homeLabel,
}: RoleErrorBoundaryProps) {
  useEffect(() => {
    console.error("[role-error-boundary]", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center px-4 py-10">
      <Card className="w-full border-border/70 shadow-sm">
        <CardContent className="space-y-6 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <TriangleAlert className="h-5 w-5" />
            </div>
            <div className="min-w-0 space-y-2">
              <h2 className="text-xl font-semibold text-foreground">{title}</h2>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="button" className="rounded-md" onClick={reset}>
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>
            <Button asChild variant="outline" className="rounded-md">
              <Link href={homeHref}>
                <Home className="h-4 w-4" />
                {homeLabel}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
