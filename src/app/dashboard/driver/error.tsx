"use client";

import { RoleErrorBoundary } from "@/components/layouts/role-error-boundary";

export default function DriverError({
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
      title="Driver workspace hit a snag"
      description="This driver page could not finish loading. Retry the view, or return to the driver dashboard."
      homeHref="/dashboard/driver"
      homeLabel="Driver dashboard"
    />
  );
}
