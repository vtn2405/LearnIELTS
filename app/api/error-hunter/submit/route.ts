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
  CollocationItem,
  TipItem,
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
        include: { ieltsTip: { select: { title: true, body: true, bodyVi: true } } },
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
        ieltsTip:       err.ieltsTip?.body ?? undefined,
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
        ieltsTip:    err.ieltsTip?.body ?? undefined,
        severity:    err.severity as any,
      });
    }
  }

  // ── Step 2: Unmatched user selections → false alarms ─────────────────────
  for (const sel of userSelections) {
    if (matchedSelectionIds.has(sel.id)) continue;

    // Check if this false alarm overlaps a known "tricky" zone
    const zone = falseAlarmZones.find(
      (z) => selectionOverlapsError(sel, z)
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

  // ── Step 5: Extract collocations & tips ───────────────────────────────────
  const collocations = (passage.collocations as CollocationItem[]) ?? undefined;
  const tips = (passage.tips as TipItem[]) ?? undefined;

  // ── Step 6: Build summary message ─────────────────────────────────────────
  let summary: string;
  if (foundCorrect === total && falseAlarms === 0) {
    summary = `Tìm được tất cả ${total} lỗi, không có báo nhầm. 🎉`;
  } else if (scorePercent >= 80) {
    summary = `Tốt lắm! Tìm được ${foundCorrect}/${total} lỗi.`;
  } else if (scorePercent >= 50) {
    summary = `Khá tốt — tìm được ${foundCorrect}/${total} lỗi. Hãy xem kỹ phần phân tích bên dưới.`;
  } else {
    summary = `Tìm được ${foundCorrect}/${total} lỗi. Hãy xem kỹ phần phân tích để rèn mắt nhé.`;
  }

  const response: EhSubmitResponse = {
    score: { scorePercent, foundCorrect, missed, falseAlarms, fixAccuracy, xpEarned },
    summary,
    perErrorFeedback,
    ...(collocations && collocations.length > 0 ? { collocations } : {}),
    ...(tips && tips.length > 0 ? { tips } : {}),
  };

  return NextResponse.json(response);
}
