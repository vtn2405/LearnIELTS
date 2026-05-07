"use client";
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallback() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <svg
          className="animate-spin w-10 h-10 text-[#1a3a5c]"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray="60"
            strokeDashoffset="20"
          />
        </svg>
        <p className="text-slate-500 text-sm">Signing you in…</p>
      </div>
      {/* Dùng signInForceRedirectUrl thay vì afterSignInUrl */}
      {/* Redirect handled by NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL in .env.local */}
      <AuthenticateWithRedirectCallback />
    </div>
  );
}
