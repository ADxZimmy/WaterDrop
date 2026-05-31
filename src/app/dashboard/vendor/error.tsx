"use client";

import { RoleErrorBoundary } from "@/components/layouts/role-error-boundary";

export default function VendorError({
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
      title="Vendor workspace hit a snag"
      description="This vendor page could not finish loading. Retry the view, or return to the vendor dashboard."
      homeHref="/dashboard/vendor"
      homeLabel="Vendor dashboard"
    />
  );
}
