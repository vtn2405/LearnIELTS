import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { prisma } from "@/lib/prisma";
import { ensureUserExists } from "@/lib/ensureUserExists";
import { Sidebar } from "@/components/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Ensure user row exists in DB (creates with defaults if first login)
  await ensureUserExists(userId);

  // Fetch all data needed by Sidebar in a single round-trip
  const [user, streak, unitsDone] = await Promise.all([
    prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        name: true,
        totalXp: true,
        targetBand: true,
        currentBand: true,
      },
    }),
    prisma.userStreak.findUnique({
      where: { clerkId: userId },
      select: { currentStreak: true },
    }),
    prisma.unitProgress.count({
      where: {
        clerkId: userId,
        completedAt: { not: null },
      },
    }),
  ]);

  const sidebarData = {
    targetBand: user?.targetBand ?? 7.0,
    currentBand: user?.currentBand ?? null,
    totalXp: user?.totalXp ?? 0,
    currentStreak: streak?.currentStreak ?? 0,
    unitsDone,
  };

  return (
    // Override the AppShell sidebar (which renders hardcoded data) by
    // providing a scoped layout. The root AppShell sidebar is hidden for
    // /dashboard/* via the NO_SIDEBAR_ROUTES pattern — see AppShell.tsx.
    // This layout renders its own data-driven sidebar + content area.
    <div className="flex h-[calc(100vh-56px)] bg-[#f5f6f8]">
      <Sidebar
        targetBand={sidebarData.targetBand}
        currentStreak={sidebarData.currentStreak}
        totalXp={sidebarData.totalXp}
        unitsDone={sidebarData.unitsDone}
      />
      <main className="flex-1 overflow-y-auto bg-[#f5f6f8]">{children}</main>
    </div>
  );
}
