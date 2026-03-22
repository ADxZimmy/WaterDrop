"use client";

import { useEffect, useState } from "react";
import type { DriverWorkspacePayload } from "@/lib/driver/workspace-types";

type DriverWorkspaceResponse = {
  workspace: DriverWorkspacePayload;
};

export function useDriverWorkspace() {
  const [workspace, setWorkspace] = useState<DriverWorkspacePayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadWorkspace = async () => {
      try {
        const response = await fetch("/api/driver/workspace", { method: "GET" });
        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error ?? "Unable to load driver workspace.");
        }

        const payload: DriverWorkspaceResponse = await response.json();
        if (isMounted) {
          setWorkspace(payload.workspace ?? null);
          setError(null);
        }
      } catch (fetchError) {
        if (isMounted) {
          setWorkspace(null);
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Unable to load driver workspace."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadWorkspace();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    workspace,
    isLoading,
    error,
  };
}
