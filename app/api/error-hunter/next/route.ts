// app/api/error-hunter/next/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import {
  UNIT_ORDER,
  MIN_ALLOWED_UNIT_INDEX,
} from "@/lib/constants/unit-order";
import { filterPassages } from "@/lib/error-hunter/data-loader";
import type { EhNextResponse } from "@/lib/types/error-hunter";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const difficulty = searchParams.get("difficulty") ?? undefined;

  // 1. Determine which units the user has unlocked
  const completedUnits = await prisma.unitProgress.findMany({
    where: { clerkId: userId, completedAt: { not: null } },
    select: { unitId: true },
  });

  const highestIndex = completedUnits.reduce(
    (max: number, u: { unitId: string }) =>
      Math.max(max, UNIT_ORDER[u.unitId] ?? 0),
    0
  );
  const allowedMaxUnit = Math.max(highestIndex, MIN_ALLOWED_UNIT_INDEX);

  // Build the set of allowed unitIds from unit-order
  const allowedUnitIds = Object.entries(UNIT_ORDER)
    .filter(([, idx]) => idx <= allowedMaxUnit)
    .map(([id]) => id);

  // 2. Exclude passages attempted in the last 7 days
  const recentAttempts = await prisma.errorHunterAttempt.findMany({
    where: {
      clerkId: userId,
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
    select: { passageId: true },
  });
  const excludeSlugs = recentAttempts.map((a: { passageId: string }) => a.passageId);

  // 3. Filter passages from JSON files
  const candidates = filterPassages({
    difficulty,
    unitIds: allowedUnitIds,
    excludeSlugs,
  });

  if (candidates.length === 0) {
    return NextResponse.json(
      { error: "Không có đoạn văn nào phù hợp. Hãy thử cấp độ khác hoặc hoàn thành thêm unit." },
      { status: 404 }
    );
  }

  // 4. Pick one at random
  const passage = candidates[Math.floor(Math.random() * candidates.length)];

  // 5. errorType is only revealed for ADVANCED difficulty
  const revealType = passage.difficulty === "ADVANCED";

  // 6. Build client-safe response
  const response: EhNextResponse = {
    passage: {
      id:               passage.slug,
      title:            passage.title,
      titleVi:          passage.titleVi ?? null,
      topic:            passage.topic,
      taskType:         passage.taskType as any,
      bandTarget:       passage.bandTarget,
      grammarFocus:     [passage.grammarFocus],
      difficulty:       passage.difficulty,
      questionPrompt:   passage.questionPrompt,
      questionPromptVi: passage.questionPromptVi ?? null,
      passageText:      passage.passageText,
      totalErrors:      passage.totalErrors,
      speakingCueCard:  passage.speakingCueCard ?? null,
    },
    errorsMeta: passage.errors.map((e, i) => ({
      id:       `${passage.slug}-err-${i}`,
      severity: e.severity as any,
      ...(revealType ? { errorType: e.errorType } : {}),
    })),
  };

  return NextResponse.json(response);
}
