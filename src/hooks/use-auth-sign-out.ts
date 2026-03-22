"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut as firebaseSignOut } from "firebase/auth";
import { getFirebaseClientAuth } from "@/lib/firebase/client";
import { useToast } from "@/hooks/use-toast";

export function useAuthSignOut(redirectTo = "/auth/login") {
  const router = useRouter();
  const { toast } = useToast();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const signOut = async () => {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);

    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Unable to sign out right now.");
      }

      await firebaseSignOut(getFirebaseClientAuth()).catch(() => undefined);
      router.replace(redirectTo);
    } catch (error) {
      setIsSigningOut(false);
      toast({
        title: "Sign out failed",
        description:
          error instanceof Error ? error.message : "Unable to sign out right now.",
        variant: "destructive",
      });
    }
  };

  return {
    isSigningOut,
    signOut,
  };
}
