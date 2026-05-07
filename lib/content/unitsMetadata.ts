export const UNITS_BY_CHAPTER: Record<string, string[]> = {
  "1": [
    "unit-1-simple-present",
    "unit-1-present-continuous",
    "unit-1-simple-past",
    "unit-1-past-continuous",
  ],
  "2": ["unit-2-present-perfect", "unit-2-past-perfect", "unit-2-future"],
  "3": ["unit-3-modal-ability", "unit-3-modal-possibility", "unit-3-passive"],
  "4": ["unit-4-conditional-1", "unit-4-conditional-2", "unit-4-conditional-3"],
  "5": ["unit-5-relative", "unit-5-reported", "unit-5-cleft"],
};

export function getUnitMeta(
  unitId: string,
): { chapter: string; title: string } | null {
  for (const [chapter, units] of Object.entries(UNITS_BY_CHAPTER)) {
    if (units.includes(unitId)) {
      const title = unitId
        .replace(/^unit-\d+-/, "")
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      return { chapter, title };
    }
  }
  return null;
}

export function getTotalUnits(): number {
  return Object.values(UNITS_BY_CHAPTER).flat().length;
}

export function getAllUnitIds(): string[] {
  return Object.values(UNITS_BY_CHAPTER).flat();
}
