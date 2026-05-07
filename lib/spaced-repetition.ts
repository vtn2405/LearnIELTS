/**
 * Spaced Repetition helper
 *
 * Rules (from CONTEXT.md):
 *   Correct attempt 1  → review after +3 days
 *   Correct attempt 2  → review after +7 days
 *   Correct attempt 3+ → review after +14 days
 *   Wrong              → reset reviewCount to 0, review after +1 day
 */

export function calcNextReviewAt(
  isCorrect: boolean,
  currentReviewCount: number,
): { nextReviewAt: Date; nextReviewCount: number } {
  const now = new Date();

  if (!isCorrect) {
    // Reset: ôn lại sau 1 ngày
    return {
      nextReviewAt: addDays(now, 1),
      nextReviewCount: 0,
    };
  }

  const newCount = currentReviewCount + 1;
  let daysToAdd: number;

  if (newCount === 1) {
    daysToAdd = 3;
  } else if (newCount === 2) {
    daysToAdd = 7;
  } else {
    daysToAdd = 14;
  }

  return {
    nextReviewAt: addDays(now, daysToAdd),
    nextReviewCount: newCount,
  };
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
