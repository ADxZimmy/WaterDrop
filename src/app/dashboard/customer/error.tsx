"use client";

import { RoleErrorBoundary } from "@/components/layouts/role-error-boundary";

export default function CustomerError({
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
      title="Customer workspace hit a snag"
      description="This customer page could not finish loading. Retry the view, or return to the marketplace."
      homeHref="/dashboard/customer/marketplace"
      homeLabel="Marketplace"
    />
  );
}
