// lib/error-hunter/data-loader.ts
// Reads Error Hunter passage data from JSON files in data/error-hunter/.
// Server-side only — never import this from client components.

import fs from "fs";
import path from "path";
import type { EhDifficulty } from "@/lib/types/error-hunter";

// ─── Raw JSON shape (matches the files in data/error-hunter/**) ───────────────

export interface EhPassageRaw {
  slug: string;
  type: string;
  unitId: string;
  unitNum: number;
  grammarFocus: string;
  topic: string;
  taskType: string;
  bandTarget: number;
  difficulty: EhDifficulty;
  title: string;
  titleVi?: string;
  speakingCueCard?: { prompt: string; bulletPoints: string[] } | null;
  questionPrompt: string;
  questionPromptVi?: string;
  passageText: string;
  totalErrors: number;
  errors: EhErrorRaw[];
  falseAlarmZones?: EhFalseAlarmRaw[];
  collocations?: EhCollocationRaw[];
}

export interface EhErrorRaw {
  errorText: string;
  correctText: string;
  acceptedAnswers?: string[];
  errorType: string;
  severity: string;
  explanation: string;
  explanationVi?: string;
  startIndex: number;
  endIndex: number;
}

export interface EhFalseAlarmRaw {
  text: string;
  hint: string;
  startIndex: number;
  endIndex: number;
}

export interface EhCollocationRaw {
  phrase: string;
  sourceInPassage: string;
  translation: string;
  exampleSentence?: string;
  grammarNote?: string;
}

// ─── Loader ───────────────────────────────────────────────────────────────────

const DATA_ROOT = path.join(process.cwd(), "data", "error-hunter");

/** Lazily loaded cache so we only hit the filesystem once per process */
let _cache: EhPassageRaw[] | null = null;

/**
 * Returns all Error Hunter passages loaded from JSON files.
 * Each error gets a stable synthetic `id` derived from its slug + index.
 * Each passage's `slug` is used as its `id`.
 */
export function loadAllPassages(): EhPassageRaw[] {
  if (_cache) return _cache;

  const results: EhPassageRaw[] = [];

  if (!fs.existsSync(DATA_ROOT)) {
    console.warn("[error-hunter] data directory not found:", DATA_ROOT);
    return [];
  }

  // Iterate unit-* sub-directories
  const unitDirs = fs
    .readdirSync(DATA_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => path.join(DATA_ROOT, d.name));

  for (const unitDir of unitDirs) {
    const files = fs
      .readdirSync(unitDir)
      .filter((f) => f.endsWith(".json"));

    for (const file of files) {
      try {
        const raw = fs.readFileSync(path.join(unitDir, file), "utf-8");
        const passage: EhPassageRaw = JSON.parse(raw);
        results.push(passage);
      } catch (err) {
        console.error("[error-hunter] failed to parse:", file, err);
      }
    }
  }

  _cache = results;
  return results;
}

/** Find a single passage by its slug (= passage id). */
export function findPassageBySlug(slug: string): EhPassageRaw | undefined {
  return loadAllPassages().find((p) => p.slug === slug);
}

/** Filter passages by difficulty and optionally by unitId. */
export function filterPassages(opts: {
  difficulty?: string;
  unitIds?: string[]; // if provided, only return passages from these units
  excludeSlugs?: string[]; // recent-attempt exclusion
}): EhPassageRaw[] {
  let passages = loadAllPassages();

  if (opts.difficulty) {
    passages = passages.filter((p) => p.difficulty === opts.difficulty);
  }

  if (opts.unitIds && opts.unitIds.length > 0) {
    passages = passages.filter((p) => opts.unitIds!.includes(p.unitId));
  }

  if (opts.excludeSlugs && opts.excludeSlugs.length > 0) {
    const excl = new Set(opts.excludeSlugs);
    passages = passages.filter((p) => !excl.has(p.slug));
  }

  return passages;
}
