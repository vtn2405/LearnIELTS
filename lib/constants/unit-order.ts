// lib/constants/unit-order.ts
// Single source of truth for unit ordinal positions.
// Derived from grammar-units.json — no manual maintenance needed.

import grammarUnits from "@/app/grammar/grammar-units.json";

interface GrammarUnitMeta {
  id: string;
}

/**
 * Maps unitId → 1-based ordinal index.
 * Example: "unit-1-simple-present" → 1, "unit-5-cleft" → 16
 */
export const UNIT_ORDER: Record<string, number> = Object.fromEntries(
  (grammarUnits as GrammarUnitMeta[]).map((u, i) => [u.id, i + 1])
);

/** Total number of grammar units in the app */
export const MAX_UNIT_INDEX: number = grammarUnits.length;

/** Minimum unit index allowed for new users (always allow first 2 units) */
export const MIN_ALLOWED_UNIT_INDEX = 2;
