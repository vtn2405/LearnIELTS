// app/api/error-hunter/submit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import {
  computeF1Score,
  computeXp,
  computeFixAccuracy,
  selectionOverlapsError,
} from "@/lib/error-hunter/scoring";
import type {
  EhSubmitRequest,
  EhSubmitResponse,
  EhPerErrorFeedback,
  FalseAlarmZone,
  UserSelection,
} from "@/lib/types/error-hunter";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: EhSubmitRequest = await req.json();
  const { passageId, userSelections } = body;

  // Fetch full ground truth — server-side only
  const passage = await prisma.errorHunterPassage.findUnique({
    where: { id: passageId },
    include: {
      errors: {
        include: { ieltsTip: { select: { tipText: true } } },
      },
    },
  });

  if (!passage) {
    return NextResponse.json({ error: "Passage not found" }, { status: 404 });
  }

  const groundTruth = passage.errors;
  const falseAlarmZones: FalseAlarmZone[] =
    (passage.falseAlarmZones as FalseAlarmZone[]) ?? [];

  const perErrorFeedback: EhPerErrorFeedback[] = [];
  const matchedSelectionIds = new Set<string>();

  // ── Step 1: Match each ground-truth error to a user selection ──────────────
  for (const err of groundTruth) {
    const match = userSelections.find(
      (s: UserSelection) =>
        !matchedSelectionIds.has(s.id) && selectionOverlapsError(s, err)
    );

    if (match) {
      matchedSelectionIds.add(match.id);
      const fixCorrect =
        (match.userCorrection?.trim().toLowerCase() ?? "") ===
        err.correctText.trim().toLowerCase();

      perErrorFeedback.push({
        errorId:        err.id,
        status:         fixCorrect ? "FOUND_CORRECT" : "FOUND_WRONG_FIX",
        startIndex:     err.startIndex,
        endIndex:       err.endIndex,
        errorText:      err.errorText,
        correctText:    err.correctText,
        userCorrection: match.userCorrection,
        fixCorrect,
        explanation:    err.explanation,
        ieltsTip:       err.ieltsTip?.tipText ?? undefined,
        severity:       err.severity as any,
      });
    } else {
      perErrorFeedback.push({
        errorId:     err.id,
        status:      "MISSED",
        startIndex:  err.startIndex,
        endIndex:    err.endIndex,
        errorText:   err.errorText,
        correctText: err.correctText,
        fixCorrect:  false,
        explanation: err.explanation,
        ieltsTip:    err.ieltsTip?.tipText ?? undefined,
        severity:    err.severity as any,
      });
    }
  }

  // ── Step 2: Unmatched user selections → false alarms ─────────────────────
  for (const sel of userSelections) {
    if (matchedSelectionIds.has(sel.id)) continue;

    // Check if this false alarm overlaps a known "tricky" zone
    const zone = falseAlarmZones.find(
      (z) => !selectionOverlapsError(sel, z) === false // same overlap logic
    );
    const explanation =
      zone?.hint ??
      "This part is grammatically correct — no error here.";

    perErrorFeedback.push({
      errorId:    "fa-" + sel.id,
      status:     "FALSE_ALARM",
      startIndex: sel.startIndex,
      endIndex:   sel.endIndex,
      errorText:  sel.selectedText,
      correctText: sel.selectedText,
      fixCorrect: false,
      explanation,
      severity:   "MINOR",
    });
  }

  // ── Step 3: Compute scores ────────────────────────────────────────────────
  const foundCorrect = perErrorFeedback.filter(
    (f) => f.status === "FOUND_CORRECT" || f.status === "FOUND_WRONG_FIX"
  ).length;
  const missed      = perErrorFeedback.filter((f) => f.status === "MISSED").length;
  const falseAlarms = perErrorFeedback.filter((f) => f.status === "FALSE_ALARM").length;
  const fixCorrectCount = perErrorFeedback.filter((f) => f.fixCorrect).length;

  const total        = groundTruth.length;
  const scorePercent = computeF1Score(foundCorrect, total, falseAlarms);
  const fixAccuracy  = computeFixAccuracy(foundCorrect, fixCorrectCount);
  const xpEarned     = computeXp(scorePercent);

  // ── Step 4: Persist attempt ───────────────────────────────────────────────
  await prisma.errorHunterAttempt.create({
    data: {
      clerkId:       userId,
      passageId,
      scorePercent,
      foundCorrect,
      missed,
      falseAlarms,
      fixAccuracy,
      userSelections: userSelections as any,
    },
  });

  // ── Step 4b: Feed missed / wrong-fix errors into MistakeLog ─────────────
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  });

  if (dbUser) {
    const mistakeErrors = perErrorFeedback.filter(
      (f) => f.status === "MISSED" || f.status === "FOUND_WRONG_FIX"
    );

    for (const fb of mistakeErrors) {
      const gtError = groundTruth.find((e) => e.id === fb.errorId);
      if (!gtError) continue;

      const existing = await prisma.mistakeLog.findFirst({
        where: { userId: dbUser.id, grammarTag: gtError.errorType },
      });

      if (existing) {
        await prisma.mistakeLog.update({
          where: { id: existing.id },
          data: {
            occurrences: { increment: 1 },
            prompt:      fb.errorText,
            wrongAnswer: fb.userCorrection ?? fb.errorText,
            correction:  fb.correctText,
          },
        });
      } else {
        await prisma.mistakeLog.create({
          data: {
            userId:     dbUser.id,
            grammarTag: gtError.errorType,
            prompt:     fb.errorText,
            wrongAnswer: fb.userCorrection ?? fb.errorText,
            correction: fb.correctText,
          },
        });
      }
    }
  }

  // ── Step 4c: Update adaptive difficulty (ErrorHunterProgress) ───────────
  const existingProgress = await prisma.errorHunterProgress.findUnique({
    where: { clerkId_packId: { clerkId: userId, packId: passage.packId } },
  });

  if (existingProgress) {
    const newConsecHigh = scorePercent >= 80
      ? existingProgress.consecutiveHigh + 1
      : 0;
    const newConsecLow = scorePercent < 40
      ? existingProgress.consecutiveLow + 1
      : 0;

    let newDifficulty = existingProgress.currentDifficulty;
    if (newConsecHigh >= 2 && newDifficulty === "STARTER") {
      newDifficulty = "INTERMEDIATE";
    } else if (newConsecHigh >= 2 && newDifficulty === "INTERMEDIATE") {
      newDifficulty = "ADVANCED";
    } else if (newConsecLow >= 2 && newDifficulty === "ADVANCED") {
      newDifficulty = "INTERMEDIATE";
    } else if (newConsecLow >= 2 && newDifficulty === "INTERMEDIATE") {
      newDifficulty = "STARTER";
    }

    const newTotal = existingProgress.totalAttempts + 1;
    const newAvg =
      (existingProgress.avgScore * existingProgress.totalAttempts + scorePercent) /
      newTotal;

    await prisma.errorHunterProgress.update({
      where: { clerkId_packId: { clerkId: userId, packId: passage.packId } },
      data: {
        currentDifficulty: newDifficulty as any,
        consecutiveHigh:   newConsecHigh,
        consecutiveLow:    newConsecLow,
        totalAttempts:     newTotal,
        avgScore:          newAvg,
      },
    });
  } else {
    await prisma.errorHunterProgress.create({
      data: {
        clerkId:           userId,
        packId:            passage.packId,
        currentDifficulty: "STARTER",
        consecutiveHigh:   scorePercent >= 80 ? 1 : 0,
        consecutiveLow:    scorePercent < 40 ? 1 : 0,
        totalAttempts:     1,
        avgScore:          scorePercent,
      },
    });
  }

  // ── Step 5: Build summary message ─────────────────────────────────────────
  let summary: string;
  if (foundCorrect === total && falseAlarms === 0) {
    summary = `Perfect! You found all ${total} error${total !== 1 ? "s" : ""} with no false alarms. 🎉`;
  } else if (scorePercent >= 80) {
    summary = `Great work! You caught ${foundCorrect}/${total} error${total !== 1 ? "s" : ""}.`;
  } else if (scorePercent >= 50) {
    summary = `Good effort — ${foundCorrect}/${total} found. Review the missed errors below.`;
  } else {
    summary = `${foundCorrect}/${total} found. Study the feedback carefully to sharpen your eye.`;
  }

  const response: EhSubmitResponse = {
    score: { scorePercent, foundCorrect, missed, falseAlarms, fixAccuracy, xpEarned },
    summary,
    perErrorFeedback,
  };

  return NextResponse.json(response);
}
