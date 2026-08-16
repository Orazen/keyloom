"use client";

import { type AuthUser, LOCAL_USER } from "@/lib/auth";

/**
 * Client-side counterpart to `withAuth()`. There is no session to load and no
 * session to end, so `loading` is always false and `signOut` is a no-op that
 * returns the caller to the given route.
 */
export function useAuth(): {
  user: AuthUser;
  loading: boolean;
  signOut: (options?: { returnTo?: string }) => void;
} {
  return {
    user: LOCAL_USER,
    loading: false,
    signOut: ({ returnTo }: { returnTo?: string } = {}) => {
      if (returnTo) window.location.href = returnTo;
    },
  };
}
