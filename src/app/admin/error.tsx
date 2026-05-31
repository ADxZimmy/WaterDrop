"use client";

import { RoleErrorBoundary } from "@/components/layouts/role-error-boundary";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RoleErrorBoundary
      error={error}
      reset={reset}
      title="Admin workspace hit a snag"
      description="The admin view could not finish loading. Retry the view, or return to the admin overview."
      homeHref="/admin"
      homeLabel="Admin overview"
    />
  );
}
