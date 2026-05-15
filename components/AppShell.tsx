"use client";

import { usePathname } from "next/navigation";
import { TopNavbar } from "./TopNavbar";
import { Sidebar } from "./Sidebar";
import { NavProgress } from "./NavProgress";
import { PageTransition } from "./PageTransition";
import type { ReactNode } from "react";

const AUTH_ROUTES = ["/sign-in", "/sign-up", "/sso-callback"];
// Routes where the sidebar should be hidden so users can focus on content
const NO_SIDEBAR_ROUTES = [
  "/unit/",
  "/dashboard",
  "/exercises/error-hunter",
  "/exercises/pattern-builder",
  "/exercises/speed-drill",
];

export function AppShell({
  children,
  userStats,
}: {
  children: ReactNode;
  userStats?: {
    targetBand: number;
    currentBand: number | null;
    currentStreak: number;
  } | null;
}) {
  const pathname = usePathname();
  const isAuthPage = AUTH_ROUTES.some((r) => pathname.startsWith(r));
  const hideSidebar = NO_SIDEBAR_ROUTES.some((r) => pathname.startsWith(r));

  if (isAuthPage) {
    // Auth pages: render children only, no chrome
    return <>{children}</>;
  }

  return (
    <>
      <NavProgress />
      <TopNavbar
        targetBand={userStats?.targetBand}
        currentBand={userStats?.currentBand}
        currentStreak={userStats?.currentStreak}
      />
      <div className="flex h-[calc(100vh-56px)]">
        {!hideSidebar && <Sidebar />}
        <main className="flex-1 overflow-y-auto">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </>
  );
}
