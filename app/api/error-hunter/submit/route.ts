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
import { findPassageBySlug } from "@/lib/error-hunter/data-loader";
import type {
  EhSubmitRequest,
  EhSubmitResponse,
  EhPerErrorFeedback,
  EhCollocation,
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

  // Load ground truth from JSON file (passageId = slug)
  const passage = findPassageBySlug(passageId);

  if (!passage) {
    return NextResponse.json({ error: "Passage not found" }, { status: 404 });
  }

  const groundTruth = passage.errors;
  const falseAlarmZones: FalseAlarmZone[] =
    (passage.falseAlarmZones ?? []).map((z) => ({
      startIndex: z.startIndex,
      endIndex: z.endIndex,
      text: z.text,
      hint: z.hint,
    }));

  const perErrorFeedback: EhPerErrorFeedback[] = [];
  const matchedSelectionIds = new Set<string>();

  // ── Step 1: Match each ground-truth error to a user selection ──────────────
  for (let i = 0; i < groundTruth.length; i++) {
    const err = groundTruth[i];
    const errId = `${passageId}-err-${i}`;

    const match = userSelections.find(
      (s: UserSelection) =>
        !matchedSelectionIds.has(s.id) && selectionOverlapsError(s, err)
    );

    if (match) {
      matchedSelectionIds.add(match.id);
      const userAnswer = match.userCorrection?.trim().toLowerCase() ?? "";
      const accepted = (err.acceptedAnswers && err.acceptedAnswers.length > 0
        ? err.acceptedAnswers
        : [err.correctText]
      ).map((a: string) => a.trim().toLowerCase());
      const fixCorrect = accepted.includes(userAnswer);

      perErrorFeedback.push({
        errorId:        errId,
        status:         fixCorrect ? "FOUND_CORRECT" : "FOUND_WRONG_FIX",
        startIndex:     err.startIndex,
        endIndex:       err.endIndex,
        errorText:      err.errorText,
        correctText:    err.correctText,
        userCorrection: match.userCorrection,
        fixCorrect,
        explanation:    err.explanation,
        explanationVi:  err.explanationVi,
        severity:       err.severity as any,
      });
    } else {
      perErrorFeedback.push({
        errorId:     errId,
        status:      "MISSED",
        startIndex:  err.startIndex,
        endIndex:    err.endIndex,
        errorText:   err.errorText,
        correctText: err.correctText,
        fixCorrect:  false,
        explanation: err.explanation,
        explanationVi: err.explanationVi,
        severity:    err.severity as any,
      });
    }
  }

  // ── Step 2: Unmatched user selections → false alarms ─────────────────────
  for (const sel of userSelections) {
    if (matchedSelectionIds.has(sel.id)) continue;

    const zone = falseAlarmZones.find((z) => selectionOverlapsError(sel, z));
    const explanation =
      zone?.hint ?? "Phần này đúng ngữ pháp — không có lỗi ở đây.";

    perErrorFeedback.push({
      errorId:     "fa-" + sel.id,
      status:      "FALSE_ALARM",
      startIndex:  sel.startIndex,
      endIndex:    sel.endIndex,
      errorText:   sel.selectedText,
      correctText: sel.selectedText,
      fixCorrect:  false,
      explanation,
      severity:    "MINOR",
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

  // ── Step 4: Persist attempt (passageId = slug) ────────────────────────────
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

  // ── Step 5: Build summary message ─────────────────────────────────────────
  let summary: string;
  if (foundCorrect === total && falseAlarms === 0) {
    summary = `Hoàn hảo! Bạn tìm đúng tất cả ${total} lỗi mà không báo nhầm lần nào. 🎉`;
  } else if (scorePercent >= 80) {
    summary = `Tuyệt vời! Bạn tìm được ${foundCorrect}/${total} lỗi.`;
  } else if (scorePercent >= 50) {
    summary = `Khá tốt — tìm được ${foundCorrect}/${total} lỗi. Xem lại những lỗi bỏ sót bên dưới.`;
  } else {
    summary = `Tìm được ${foundCorrect}/${total} lỗi. Hãy xem kỹ phần phân tích để rèn mắt nhé.`;
  }

  // ── Step 6: Extract collocations from passage ──────────────────────────────
  const collocations: EhCollocation[] = (passage.collocations ?? []).map((c) => ({
    phrase:          c.phrase,
    sourceInPassage: c.sourceInPassage,
    translation:     c.translation,
    exampleSentence: c.exampleSentence,
    grammarNote:     c.grammarNote,
  }));

  const response: EhSubmitResponse = {
    score: { scorePercent, foundCorrect, missed, falseAlarms, fixAccuracy, xpEarned },
    summary,
    perErrorFeedback,
    collocations,
  };

  return NextResponse.json(response);
}
