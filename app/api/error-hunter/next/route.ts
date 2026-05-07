// app/api/error-hunter/next/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import {
  UNIT_ORDER,
  MIN_ALLOWED_UNIT_INDEX,
} from "@/lib/constants/unit-order";
import type { EhNextResponse } from "@/lib/types/error-hunter";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const packId = searchParams.get("packId") ?? undefined;
  const difficulty = searchParams.get("difficulty") ?? undefined;

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

  // 3. Fetch candidates within allowed range
  const candidates = await prisma.errorHunterPassage.findMany({
    where: {
      isActive: true,
      minUnitIndex: { lte: allowedMaxUnit },
      ...(packId ? { packId } : {}),
      ...(difficulty ? { difficulty: difficulty as any } : {}),
      ...(excludeIds.length > 0 ? { id: { notIn: excludeIds } } : {}),
    },
    include: {
      errors: {
        select: { id: true, errorType: true, severity: true },
        // correctText, startIndex, endIndex intentionally excluded
      },
    },
  });

  if (candidates.length === 0) {
    return NextResponse.json(
      { error: "No passages available. Try a different pack or complete more units." },
      { status: 404 }
    );
  }

  // 4. Pick one at random
  const passage = candidates[Math.floor(Math.random() * candidates.length)];

  // 5. errorType is only revealed for ADVANCED difficulty
  const revealType = passage.difficulty === "ADVANCED";

  const response: EhNextResponse = {
    passage: {
      id:               passage.id,
      title:            passage.title,
      titleVi:          passage.titleVi,
      topic:            passage.topic,
      taskType:         passage.taskType as any,
      bandTarget:       passage.bandTarget,
      grammarFocus:     passage.grammarFocus,
      difficulty:       passage.difficulty as any,
      questionPrompt:   passage.questionPrompt,
      questionPromptVi: passage.questionPromptVi,
      passageText:      passage.passageText,
      totalErrors:      passage.totalErrors,
    },
    errorsMeta: passage.errors.map((e: { id: string; errorType: string; severity: string }) => ({
      id:       e.id,
      severity: e.severity as any,
      ...(revealType ? { errorType: e.errorType } : {}),
    })),
  };

  return NextResponse.json(response);
}
