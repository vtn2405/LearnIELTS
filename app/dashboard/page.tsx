import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { BandHistoryChart } from "@/components/dashboard/BandHistoryChart";
import { ContinueLearning } from "@/components/dashboard/ContinueLearning";
import { LearningProgress } from "@/components/dashboard/LearningProgress";
import { NextActions } from "@/components/dashboard/NextActions";
import { TodayRoadmap } from "@/components/dashboard/TodayRoadmap";
import { ensureUserExists } from "@/lib/ensureUserExists";
import { prisma } from "@/lib/prisma";

// Total units = 16 (15 from grammar-units.json Phase 5B + 1 Simple Present Phase 5A)
const TOTAL_UNITS = 16;
const WRITING_TOTAL = 20;
const SPEAKING_TOTAL = 20;

function roundToNearestHalf(value: number): number {
  return Math.round(value * 2) / 2;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "buổi sáng";
  if (hour < 18) return "buổi chiều";
  return "buổi tối";
}

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  await ensureUserExists(userId);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [bandHistory, unitProgress, user, writingCount, speakingCount] =
    await Promise.all([
      prisma.exerciseResult.findMany({
        where: {
          clerkId: userId,
          createdAt: { gte: sevenDaysAgo },
          bandEstimate: { not: null },
        },
        orderBy: { createdAt: "asc" },
        select: { bandEstimate: true, createdAt: true, skill: true },
      }),
      prisma.unitProgress.findMany({
        where: { clerkId: userId },
        orderBy: { lastAttemptedAt: "desc" },
      }),
      prisma.user.findUnique({
        where: { clerkId: userId },
        select: { targetBand: true, currentBand: true, name: true },
      }),
      prisma.writingSubmission.count({
        where: { user: { clerkId: userId } },
      }),
      prisma.speakingSubmission.count({
        where: { user: { clerkId: userId } },
      }),
    ]);

  // currentBand: avg top-5 nếu đủ 3 bài thực tế, fallback về user.currentBand
  const bestBands = unitProgress
    .map((p: { bestBand: number | null }) => p.bestBand)
    .filter((b: number | null): b is number => b !== null)
    .sort((a: number, b: number) => b - a)
    .slice(0, 5);

  const currentBand =
    bestBands.length >= 3
      ? roundToNearestHalf(
          bestBands.reduce((s: number, b: number) => s + b, 0) / bestBands.length,
        )
      : (user?.currentBand ?? null);

  const continueUnit =
    unitProgress.find((p: { lastAttemptedAt: Date | null; completedAt: Date | null }) => p.lastAttemptedAt && !p.completedAt) ?? null;

  // Grammar %: dựa trên TOTAL_UNITS cố định
  const completedUnits = unitProgress.filter((p: { completedAt: Date | null }) => p.completedAt).length;
  const grammarPct = Math.round((completedUnits / TOTAL_UNITS) * 100);

  // Writing & Speaking %: dựa trên submission count / max
  const writingPct = Math.min(
    100,
    Math.round((writingCount / WRITING_TOTAL) * 100),
  );
  const speakingPct = Math.min(
    100,
    Math.round((speakingCount / SPEAKING_TOTAL) * 100),
  );

  const userName = user?.name?.split(" ")[0] ?? "bạn";
  const greeting = getGreeting();

  // Suppress unused variable warning — currentBand kept for future use
  void currentBand;

  return (
    /* 3-column layout: [sidebar from layout.tsx] [main] [right rail]
       Container centered, max 1200px, padding top/bottom 24px, left/right 32px */
    <div className="flex gap-6 px-8 py-6 max-w-[1200px] mx-auto w-full">

      {/* ── Main content column ── */}
      <div className="flex-1 min-w-0 space-y-5">

        {/* Hero header */}
        <div className="pt-1">
          <h1 className="text-[28px] font-bold text-slate-800 leading-tight tracking-tight">
            Chào {greeting}, {userName}!
          </h1>
          <p className="mt-1.5 text-slate-500 text-[14px]">
            Sẵn sàng cho bài thi IELTS Writing hôm nay?
          </p>
        </div>

        {/* Band History Chart — full width */}
        <BandHistoryChart
          data={bandHistory}
          targetBand={user?.targetBand ?? 7.0}
        />

        {/* Learning Progress row: progress bars left, ContinueLearning card right */}
        <div className="flex gap-5 items-stretch">
          <LearningProgress
            grammarPct={grammarPct}
            writingPct={writingPct}
            speakingPct={speakingPct}
          />
          {continueUnit && <ContinueLearning unit={continueUnit} />}
        </div>

        {/* Tiếp theo cho bạn */}
        <NextActions />
      </div>

      {/* ── Right rail: Lộ trình hôm nay ── */}
      <TodayRoadmap
        continueUnit={continueUnit}
        grammarPct={grammarPct}
        writingPct={writingPct}
        speakingPct={speakingPct}
      />
    </div>
  );
}
