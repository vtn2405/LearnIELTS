import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { ensureUserExists } from "@/lib/ensureUserExists";

type ProgressTx = {
  unitProgress: typeof prisma.unitProgress;
  userStreak: typeof prisma.userStreak;
};

type Stage = "theory" | "practice" | "apply" | "speak" | "complete";

interface RequestBody {
  unitId: string;
  currentStage: Stage;
  completed?: boolean;
  bestBand?: number;
  xpEarned?: number;
  incrementAttempt?: boolean;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isYesterday(date: Date, today: Date) {
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  return isSameDay(date, yesterday);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 422 });
  }

  const {
    unitId,
    currentStage,
    completed,
    bestBand,
    xpEarned,
    incrementAttempt,
  } = body;

  if (!unitId || typeof unitId !== "string") {
    return NextResponse.json(
      { error: "'unitId' is required" },
      { status: 422 },
    );
  }
  if (
    !currentStage ||
    !["theory", "practice", "apply", "speak", "complete"].includes(currentStage)
  ) {
    return NextResponse.json(
      { error: "'currentStage' is invalid" },
      { status: 422 },
    );
  }

  const safeXp =
    typeof xpEarned === "number" && isFinite(xpEarned) && xpEarned > 0
      ? xpEarned
      : 0;

  await ensureUserExists(userId);

  const now = new Date();

  const [progress] = await prisma.$transaction(async (_tx) => {
    const tx = _tx as typeof _tx & ProgressTx;

    // 1. UnitProgress upsert — KHÔNG set bestBand ở update, xử lý riêng bên dưới
    const unitProgress = await tx.unitProgress.upsert({
      where: { clerkId_unitId: { clerkId: userId, unitId } },
      create: {
        clerkId: userId,
        unitId,
        bestBand: bestBand !== undefined ? Math.max(0, bestBand) : undefined,
        attemptCount: incrementAttempt ? 1 : 0,
        lastAttemptedAt: now,
        completedAt: completed ? now : null,
        xpEarned: safeXp,
      },
      update: {
        lastAttemptedAt: now,
        ...(completed ? { completedAt: now } : {}),
        ...(incrementAttempt ? { attemptCount: { increment: 1 } } : {}),
        ...(safeXp > 0 ? { xpEarned: { increment: safeXp } } : {}),
      },
    });

    // 2. bestBand — chỉ update nếu giá trị mới cao hơn
    if (bestBand !== undefined) {
      const currentBest = unitProgress.bestBand ?? -1;
      if (bestBand > currentBest) {
        await tx.unitProgress.update({
          where: { clerkId_unitId: { clerkId: userId, unitId } },
          data: { bestBand },
        });
      }
    }

    // 3. UserStreak logic
    const existing = await tx.userStreak.findUnique({
      where: { clerkId: userId },
    });

    const last = existing?.lastActiveDate;
    let newStreak = 1;

    if (last) {
      if (isSameDay(last, now)) {
        newStreak = existing!.currentStreak; // hôm nay rồi → giữ
      } else if (isYesterday(last, now)) {
        newStreak = existing!.currentStreak + 1; // hôm qua → tăng
      } else {
        newStreak = 1; // lâu hơn → reset
      }
    }

    await tx.userStreak.upsert({
      where: { clerkId: userId },
      create: {
        clerkId: userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: now,
      },
      update: {
        currentStreak: newStreak,
        longestStreak: Math.max(existing?.longestStreak ?? 0, newStreak),
        lastActiveDate: last && isSameDay(last, now) ? last : now, // ← fix crash
      },
    });

    return [unitProgress];
  });

  return NextResponse.json(progress);
}
