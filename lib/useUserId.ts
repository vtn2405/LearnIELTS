"use client";

import { useAuth } from "@clerk/nextjs";

export function useUserId() {
  const { isLoaded, userId } = useAuth();
  return {
    userId: userId ?? null,
    loading: !isLoaded,
  };
}
