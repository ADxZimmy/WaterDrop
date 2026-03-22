"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Droplets, Lock, Mail, ShieldCheck } from "lucide-react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import type { UserRole } from "@/lib/domain/schemas";
import {
  buildAdminLoginPath,
  formatRoleLabel,
  getSafePostLoginDestination,
  inferRoleFromProtectedPath,
  normalizeRole,
} from "@/lib/auth/routing";
import { getFirebaseClientAuth } from "@/lib/firebase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type SignInPanelProps = {
  allowedRoles: UserRole[];
  defaultRole: UserRole;
  title: string;
  description: string;
  backHref: string;
  backLabel: string;
  showRegisterLink?: boolean;
  footerNote?: string;
};

export function SignInPanel({
  allowedRoles,
  defaultRole,
  title,
  description,
  backHref,
  backLabel,
  showRegisterLink = false,
  footerNote,
}: SignInPanelProps) {
  const [role, setRole] = useState<UserRole>(defaultRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const verified = searchParams.get("verified");
    const requestedRole =
      normalizeRole(searchParams.get("role")) ??
      inferRoleFromProtectedPath(searchParams.get("redirect"));

    if (verified === "true") {
      toast({
        title: "Verification Successful",
        description: "Your account is ready. Please log in to continue.",
      });
    }

    if (!requestedRole) {
      return;
    }

    if (!allowedRoles.includes(requestedRole)) {
      if (requestedRole === "admin") {
        router.replace(
          buildAdminLoginPath({
            redirect: searchParams.get("redirect"),
          })
        );
      }
      return;
    }

    setRole(requestedRole);
  }, [allowedRoles, router, searchParams, toast]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    let sessionEstablished = false;

    try {
      const credential = await signInWithEmailAndPassword(
        getFirebaseClientAuth(),
        email,
        password
      );
      const idToken = await credential.user.getIdToken();

      const sessionResponse = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, expectedRole: role }),
      });
      const sessionPayload = await sessionResponse.json().catch(() => null);

      if (!sessionResponse.ok) {
        throw new Error(
          sessionPayload?.error ??
            `Unable to sign in as ${formatRoleLabel(role)}.`
        );
      }
      sessionEstablished = true;

      const resolvedRole = normalizeRole(sessionPayload?.role) ?? role;
      const destination = getSafePostLoginDestination(
        resolvedRole,
        searchParams.get("redirect")
      );

      router.replace(destination);
    } catch (error) {
      if (sessionEstablished) {
        await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
      }
      await signOut(getFirebaseClientAuth()).catch(() => undefined);

      const message =
        error instanceof Error ? error.message : "Login failed. Please try again.";
      toast({
        title: "Login Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSingleRole = allowedRoles.length === 1;

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link
          href={backHref}
          className="flex items-center justify-center gap-2 mb-6 text-primary group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>{backLabel}</span>
        </Link>
        <div className="flex justify-center mb-4">
          {isSingleRole && role === "admin" ? (
            <ShieldCheck className="h-12 w-12 text-primary" />
          ) : (
            <Droplets className="h-12 w-12 text-primary" />
          )}
        </div>
        <h2 className="text-center text-3xl font-extrabold text-foreground font-headline">
          {title}
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="border-none shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-primary text-primary-foreground text-center p-6 pb-4">
            <CardTitle>{isSingleRole ? `${formatRoleLabel(role)} Sign In` : "Login"}</CardTitle>
            <CardDescription className="text-primary-foreground/80">
              {isSingleRole
                ? "Use your provisioned admin account to continue."
                : "Choose your account type"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {isSingleRole ? (
              <div className="mb-8 rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 text-center">
                <p className="text-sm font-semibold text-primary">
                  {formatRoleLabel(role)} access only
                </p>
              </div>
            ) : (
              <Tabs
                value={role}
                onValueChange={(value) => {
                  const nextRole = normalizeRole(value);
                  if (nextRole && allowedRoles.includes(nextRole)) {
                    setRole(nextRole);
                  }
                }}
                className="w-full"
              >
                <TabsList
                  className="grid w-full mb-8"
                  style={{
                    gridTemplateColumns: `repeat(${allowedRoles.length}, minmax(0, 1fr))`,
                  }}
                >
                  {allowedRoles.map((loginRole) => (
                    <TabsTrigger key={loginRole} value={loginRole}>
                      {formatRoleLabel(loginRole)}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-10"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="#" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 rounded-xl shadow-lg shadow-primary/20"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in..." : `Sign In as ${formatRoleLabel(role)}`}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="bg-muted/50 p-6 flex flex-col gap-4">
            {showRegisterLink ? (
              <div className="text-center text-sm">
                <span className="text-muted-foreground">Don't have an account? </span>
                <Link href="/auth/register" className="text-primary font-bold hover:underline">
                  Register Now
                </Link>
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                {footerNote ??
                  "Admin accounts are provisioned internally and are not available for public registration."}
              </p>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
