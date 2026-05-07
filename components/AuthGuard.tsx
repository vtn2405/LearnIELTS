"use client";

import { useAuth } from "@clerk/nextjs";
import { type ReactNode } from "react";

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * AuthGuard chỉ hiển thị loading khi Clerk chưa load xong.
 * Việc redirect về /sign-in đã được xử lý hoàn toàn ở middleware.ts —
 * KHÔNG redirect ở đây để tránh race condition giữa client + server.
 */
export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a3a5c]" />
        </div>
      )
    );
  }

  // Middleware đã bảo vệ route — nếu render được đến đây, user đã login
  return <>{children}</>;
}
