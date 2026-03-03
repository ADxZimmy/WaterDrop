
"use client";

import React from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Pass-through layout to allow role-specific layouts in subdirectories
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
