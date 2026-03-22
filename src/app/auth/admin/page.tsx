"use client";

import React, { Suspense } from "react";
import { SignInPanel } from "@/components/auth/sign-in-panel";

function AdminLoginPageContent() {
  return (
    <SignInPanel
      allowedRoles={["admin"]}
      defaultRole="admin"
      title="Admin Portal"
      description="Sign in with your provisioned platform admin account."
      backHref="/"
      backLabel="Back to home"
      footerNote="Admin access is provisioned internally and is not available through public registration."
    />
  );
}

function AdminLoginPageFallback() {
  return <div className="min-h-screen bg-background" />;
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<AdminLoginPageFallback />}>
      <AdminLoginPageContent />
    </Suspense>
  );
}
