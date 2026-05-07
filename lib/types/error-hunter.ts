// lib/types/error-hunter.ts
// Shared types for Error Hunter — used by API routes, components, and scripts.

export type EhDifficulty = "STARTER" | "INTERMEDIATE" | "ADVANCED";
export type EhTaskType =
  | "WRITING_TASK2"
  | "SPEAKING_PART1"
  | "SPEAKING_PART2"
  | "SPEAKING_PART3";
export type EhErrorSeverity = "MINOR" | "MAJOR" | "CRITICAL";
export type EhErrorStatus =
  | "FOUND_CORRECT"
  | "FOUND_WRONG_FIX"
  | "MISSED"
  | "FALSE_ALARM";

// ─── Server-side full shapes (never sent to client before submit) ─────────────

export interface EhPassageFull {
  id: string;
  slug: string;
  title?: string | null;
  titleVi?: string | null;
  topic: string;
  taskType: EhTaskType;
  bandTarget: number;
  minUnitIndex: number;
  maxUnitIndex: number;
  grammarFocus: string[];
  difficulty: EhDifficulty;
  packId: string;
  questionPrompt: string;
  questionPromptVi?: string | null;
  passageText: string;
  totalErrors: number;
  falseAlarmZones: FalseAlarmZone[] | null;
  errors: EhErrorFull[];
}

export interface EhErrorFull {
  id: string;
  passageId: string;
  startIndex: number;
  endIndex: number;
  errorText: string;
  correctText: string; // never sent to client before submit
  errorType: string;
  severity: EhErrorSeverity;
  explanation: string;
  grammarRuleId?: string | null;
  ieltsTipId?: string | null;
  ieltsTip?: { title: string; body: string; bodyVi?: string | null } | null;
}

/** A zone in the passage text that commonly triggers false alarms */
export interface FalseAlarmZone {
  startIndex: number;
  endIndex: number;
  text: string;
  hint: string; // explanation of why this zone is actually correct
}

// ─── Client-safe shapes ───────────────────────────────────────────────────────

/** Passage data sent to client — no correctText, no error positions */
export interface EhPassageClient {
  id: string;
  title?: string | null;
  titleVi?: string | null;
  topic: string;
  taskType: EhTaskType;
  bandTarget: number;
  grammarFocus: string[];
  difficulty: EhDifficulty;
  questionPrompt: string;
  questionPromptVi?: string | null;
  passageText: string;
  totalErrors: number;
}

/**
 * Error metadata sent before submit.
 * - errorType is only included for ADVANCED difficulty.
 * - Positions and correctText are never included.
 */
export interface EhErrorMeta {
  id: string;
  severity: EhErrorSeverity;
  errorType?: string; // undefined = hidden (STARTER / INTERMEDIATE)
}

// ─── User interaction shapes ──────────────────────────────────────────────────

/** A text range the user highlighted as an error */
export interface UserSelection {
  id: string; // client-generated uuid (stable React key)
  startIndex: number;
  endIndex: number;
  selectedText: string; // denormalised slice for display
  userCorrection?: string; // optional typed correction
}

// ─── API: GET /api/error-hunter/next ─────────────────────────────────────────

export interface EhNextResponse {
  passage: EhPassageClient;
  errorsMeta: EhErrorMeta[];
}

// ─── API: POST /api/error-hunter/submit ──────────────────────────────────────

export interface EhSubmitRequest {
  passageId: string;
  userSelections: UserSelection[];
}

export interface EhPerErrorFeedback {
  errorId: string;
  status: EhErrorStatus;
  startIndex: number;
  endIndex: number;
  errorText: string;
  correctText: string; // revealed after submit
  userCorrection?: string;
  fixCorrect: boolean;
  explanation: string;
  ieltsTip?: string;
  severity: EhErrorSeverity;
}

export interface EhScore {
  scorePercent: number; // 0–100, F1-based
  foundCorrect: number;
  missed: number;
  falseAlarms: number;
  fixAccuracy: number; // % of found errors with correct fix
  xpEarned: number;
}

export interface EhSubmitResponse {
  score: EhScore;
  summary: string;
  perErrorFeedback: EhPerErrorFeedback[];
}
