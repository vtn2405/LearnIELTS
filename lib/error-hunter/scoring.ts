// lib/error-hunter/scoring.ts

/**
 * Compute Error Hunter score as F1 (harmonic mean of precision and recall).
 *
 * Rationale over arithmetic mean:
 * - Arithmetic mean inflates score when one metric dominates.
 *   e.g. recall=1.0, precision=0.0 → arithmetic=50%, F1=0%.
 * - F1 penalises both false alarms and missed errors equally,
 *   which matches the IELTS examiner mindset: you must find errors
 *   without flagging correct text.
 *
 * @returns integer 0–100
 */
export function computeF1Score(
  foundCorrect: number,
  total: number,
  falseAlarms: number
): number {
  if (total === 0) return 100;

  const recall =
    total > 0 ? foundCorrect / total : 0;

  const precision =
    foundCorrect + falseAlarms > 0
      ? foundCorrect / (foundCorrect + falseAlarms)
      : 1; // no selections at all → no false alarms → precision = 1

  if (recall + precision === 0) return 0;

  const f1 = (2 * precision * recall) / (precision + recall);
  return Math.round(f1 * 100);
}

/**
 * XP reward: 5 XP per 10 score points (max 50 XP per passage).
 */
export function computeXp(scorePercent: number): number {
  return Math.round(scorePercent / 10) * 5;
}

/**
 * Fix accuracy: % of found errors where the user's correction was exact.
 * 0 if no errors were found.
 */
export function computeFixAccuracy(
  foundCorrect: number,
  fixCorrectCount: number
): number {
  return foundCorrect > 0
    ? Math.round((fixCorrectCount / foundCorrect) * 100)
    : 0;
}

/**
 * IoU-based overlap check between a user selection and a ground-truth error.
 * Returns true if the intersection / union length ratio ≥ threshold (default 0.5).
 */
export function selectionOverlapsError(
  sel: { startIndex: number; endIndex: number },
  err: { startIndex: number; endIndex: number },
  iouThreshold = 0.5
): boolean {
  const overlapStart = Math.max(sel.startIndex, err.startIndex);
  const overlapEnd = Math.min(sel.endIndex, err.endIndex);
  if (overlapStart >= overlapEnd) return false;

  const overlapLen = overlapEnd - overlapStart;
  const unionLen =
    Math.max(sel.endIndex, err.endIndex) -
    Math.min(sel.startIndex, err.startIndex);

  return overlapLen / unionLen >= iouThreshold;
}
