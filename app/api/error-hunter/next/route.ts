// app/api/error-hunter/next/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import {
  UNIT_ORDER,
  MIN_ALLOWED_UNIT_INDEX,
} from "@/lib/constants/unit-order";
import type { EhNextResponse, EhDifficulty } from "@/lib/types/error-hunter";

/** Weighted random pick: items with higher weight are more likely chosen. */
function weightedPick<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((s, w) => s + w, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const packId = searchParams.get("packId") ?? undefined;

  // 1. Determine allowed unit range from the user's highest completed unit
  const completedUnits = await prisma.unitProgress.findMany({
    where: { clerkId: userId, completedAt: { not: null } },
    select: { unitId: true },
  });

  const highestIndex = completedUnits.reduce(
    (max: number, u: { unitId: string }) => Math.max(max, UNIT_ORDER[u.unitId] ?? 0),
    0
  );
  const allowedMaxUnit = Math.max(highestIndex, MIN_ALLOWED_UNIT_INDEX);

  // 2. Exclude passages attempted in the last 7 days to avoid repetition
  const recentAttempts = await prisma.errorHunterAttempt.findMany({
    where: {
      clerkId: userId,
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
    select: { passageId: true },
  });
  const excludeIds = recentAttempts.map((a: { passageId: string }) => a.passageId);

  // 2b. Look up adaptive difficulty for this pack (if packId provided)
  let preferredDifficulty: EhDifficulty | null = null;
  if (packId) {
    const progress = await prisma.errorHunterProgress.findUnique({
      where: { clerkId_packId: { clerkId: userId, packId } },
    });
    if (progress) {
      preferredDifficulty = progress.currentDifficulty as EhDifficulty;
    }
  }

  // 3. Fetch candidates within allowed range
  const candidates = await prisma.errorHunterPassage.findMany({
    where: {
      isActive: true,
      minUnitIndex: { lte: allowedMaxUnit },
      ...(packId ? { packId } : {}),
      ...(excludeIds.length > 0 ? { id: { notIn: excludeIds } } : {}),
    },
    include: {
      errors: {
        select: { id: true, errorType: true, severity: true },
      },
    },
  });

  if (candidates.length === 0) {
    return NextResponse.json(
      { error: "No passages available. Try a different pack or complete more units." },
      { status: 404 }
    );
  }

  // 4. Weighted passage selection:
  //    - Passage covering the latest completed unit → weight 3x
  //    - Passage matching preferred adaptive difficulty → weight 2x
  //    - Cumulative review (minUnit=1) → weight 1.5x
  //    - Base weight → 1x
  const weights = candidates.map((p) => {
    let w = 1;
    if (p.maxUnitIndex === allowedMaxUnit) w *= 3;
    else if (p.maxUnitIndex >= allowedMaxUnit - 1) w *= 2;
    if (p.minUnitIndex === 1) w *= 1.5;
    if (preferredDifficulty && p.difficulty === preferredDifficulty) w *= 2;
    return w;
  });

  const passage = weightedPick(candidates, weights);

  // 5. errorType is only revealed for ADVANCED difficulty
  const revealType = passage.difficulty === "ADVANCED";

  const response: EhNextResponse = {
    passage: {
      id:             passage.id,
      topic:          passage.topic,
      taskType:       passage.taskType as any,
      bandTarget:     passage.bandTarget,
      grammarFocus:   passage.grammarFocus,
      difficulty:     passage.difficulty as any,
      questionPrompt: passage.questionPrompt,
      passageText:    passage.passageText,
      totalErrors:    passage.totalErrors,
    },
    errorsMeta: passage.errors.map((e: { id: string; errorType: string; severity: string }) => ({
      id:       e.id,
      severity: e.severity as any,
      ...(revealType ? { errorType: e.errorType } : {}),
    })),
  };

  return NextResponse.json(response);
}
