
"use client";

import React, { Suspense } from "react";
import { publicAuthRoles } from "@/lib/auth/routing";
import { SignInPanel } from "@/components/auth/sign-in-panel";

function LoginPageContent() {
  return (
    <SignInPanel
      allowedRoles={publicAuthRoles}
      defaultRole="customer"
      title="Welcome back to WaterDrop"
      description="Sign in with the exact account type you registered for."
      backHref="/"
      backLabel="Back to home"
      showRegisterLink
    />
  );
}

function LoginPageFallback() {
  return <div className="min-h-screen bg-background" />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPageContent />
    </Suspense>
  );
}
