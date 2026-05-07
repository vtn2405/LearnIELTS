import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

// ── Client ────────────────────────────────────────────────────────────────
const ai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY ?? "",
  baseURL:
    process.env.ANTIGRAVITY_BASE_URL ??
    "https://platform.beeknoee.com/api/v1",
});

const MODEL = "deepseek/deepseek-chat-v3.1";

// ── Retry (429 only) ──────────────────────────────────────────────────────
const MAX_RETRY_ATTEMPTS = 3;
const BASE_DELAY_MS = 1000;
const MAX_DELAY_MS = 30_000;

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < MAX_RETRY_ATTEMPTS; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastError = err;
      const status = (err as { status?: number }).status;
      if (status !== 429) throw err;
      const retryAfterSec =
        (err as { headers?: Record<string, string> }).headers?.["retry-after"];
      let delayMs: number;
      if (retryAfterSec) {
        delayMs = Math.min(parseFloat(retryAfterSec) * 1000, MAX_DELAY_MS);
      } else {
        const base = Math.min(BASE_DELAY_MS * Math.pow(2, attempt), MAX_DELAY_MS);
        delayMs = base * (0.75 + Math.random() * 0.5);
      }
      console.warn(
        `[writing-mini-feedback] 429 — attempt ${attempt + 1}/${MAX_RETRY_ATTEMPTS}, waiting ${Math.round(delayMs)}ms`,
      );
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw lastError;
}

// ── Types ─────────────────────────────────────────────────────────────────

interface RequestBody {
  text: string;
  task_prompt: string;
  unitId: string;
  targetBand: number;
  grammarTargets: string[];
}

interface IELTSCriteria {
  ta: number;
  cc: number;
  lr: number;
  gra: number;
}

/** A grammar/vocab error with full pedagogical detail */
interface AnnotatedError {
  /** Exact substring from the learner's text */
  original: string;
  /** Corrected form */
  correction: string;
  /** Rule explained in ≤15 words (e.g. "Third-person singular present needs -s/es") */
  rule_vi: string;
  /** Error category for heatmap tracking */
  category:
    | "subject_verb_agreement"
    | "tense"
    | "article"
    | "preposition"
    | "word_form"
    | "vocabulary"
    | "punctuation"
    | "other";
}

/** A "safe word" replaced with a more academic alternative */
interface VocabUpgrade {
  original: string;
  upgraded: string;
  register: "academic" | "precise" | "formal";
}

/** Cohesion analysis */
interface CohesionAnalysis {
  /** Does the text use linking words? */
  has_linking_words: boolean;
  /** Linking words actually found */
  found: string[];
  /** Suggested additions if weak */
  missing_suggestions: string[];
  /** Overall cohesion verdict */
  verdict_vi: string;
}

/** Upgraded sentence with tracked-change style diff */
interface UpgradedSentence {
  /** Original sentence (worst grammar error) */
  original: string;
  /** Rewritten at targetBand level */
  upgraded: string;
  /** What changed and why (≤20 words Vietnamese) */
  changes_vi: string;
}

interface FeedbackPayload {
  band_estimate: number;
  criteria: IELTSCriteria;
  grammar_used_correctly: boolean;
  errors: AnnotatedError[];
  vocab_upgrades: VocabUpgrade[];
  cohesion: CohesionAnalysis;
  upgraded_sentence: UpgradedSentence;
  encouragement: string;
  improvement_tips: string[];
}

// ── POST /api/ai/writing-mini-feedback ────────────────────────────────────
function extractJson(text: string): string {
  const start = text.indexOf("{");
  if (start === -1) throw new Error("No JSON object found");
  let depth = 0;
  let end = -1;
  for (let i = start; i < text.length; i++) {
    if (text[i] === "{") depth++;
    else if (text[i] === "}") {
      depth--;
      if (depth === 0) { end = i; break; }
    }
  }
  if (end === -1) throw new Error("Truncated JSON");
  return text.slice(start, end + 1);
}
export async function POST(req: NextRequest) {
  // 1. Auth
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse
  let body: Partial<RequestBody>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 422 });
  }

  const { text, task_prompt, unitId, targetBand, grammarTargets } = body;

  // 3. Validate
  if (!text || typeof text !== "string" || text.trim() === "") {
    return NextResponse.json(
      { error: "'text' is required and must be a non-empty string" },
      { status: 422 },
    );
  }
  if (!unitId || typeof unitId !== "string") {
    return NextResponse.json({ error: "'unitId' is required" }, { status: 422 });
  }
  if (!targetBand || typeof targetBand !== "number") {
    return NextResponse.json(
      { error: "'targetBand' must be a number (e.g. 7.0)" },
      { status: 422 },
    );
  }
  if (!Array.isArray(grammarTargets) || grammarTargets.length === 0) {
    return NextResponse.json(
      { error: "'grammarTargets' must be a non-empty array" },
      { status: 422 },
    );
  }
  if (!task_prompt || typeof task_prompt !== "string") {
    console.warn("[writing-mini-feedback] task_prompt missing — ta will be less accurate");
  }

  // 4. Build prompts
  const taskContext = task_prompt
    ? `Writing task: "${task_prompt}"`
    : "Writing task: NOT PROVIDED — score ta on internal coherence only.";

  const systemPrompt = `You are a certified IELTS Writing examiner with 10+ years of experience.
Your job is to give precise, pedagogically rich feedback to a Vietnamese learner.
Return ONLY valid JSON — no markdown fences, no extra prose.

═══ IELTS BAND DESCRIPTORS (score strictly by these) ═══

TASK RESPONSE (ta):
  9: Fully addresses all parts. Position clear and fully developed.
  7: Covers all parts. Position clear, ideas well-extended.
  6: Addresses all parts, some more than others. Position clear but not always extended.
  5: Partially addresses task. Position sometimes unclear.
  4: Responds to task minimally. Position difficult to identify.

COHERENCE & COHESION (cc):
  9: Cohesion unnoticeable. Paragraphing seamless.
  7: Information logically organised. Cohesive devices used well, some over/under-use.
  6: Information arranged coherently. Cohesion used but mechanically at times.
  5: Organisation evident but not always logical. Limited cohesive devices.
  4: Information not clearly arranged. Cohesive devices basic/faulty.

LEXICAL RESOURCE (lr):
  9: Full flexibility and precise use. Rare errors.
  7: Sufficient range. Less common items used with some inaccuracy.
  6: Adequate range. Meaning clear despite some errors.
  5: Limited range. Noticeable errors in word choice and formation.
  4: Basic vocab only. Errors distort meaning.

GRAMMATICAL RANGE & ACCURACY (gra):
  9: Wide range, almost error-free.
  7: Variety of complex structures. Errors rare, don't impede communication.
  6: Mix of simple and complex. Some errors but meaning clear.
  5: Limited range. Errors noticeable and may cause difficulty.
  4: Very limited range. Errors frequent.

═══ SCORING RULES ═══
- band_estimate = mean of (ta + cc + lr + gra) rounded to nearest 0.5
- Be STRICT: count each error type. More than 3 grammar errors → gra ≤ 5.5
- grammar_used_correctly = true ONLY if ALL grammar targets are applied correctly

═══ ERROR ANNOTATION RULES ═══
- errors: List EVERY grammar and vocabulary mistake in the text
- "original" must be the EXACT substring — copy-paste from text
- "rule_vi": explain the grammar rule broken in Vietnamese, ≤15 words
  Example: "Động từ ngôi thứ 3 số ít thì hiện tại cần thêm -s/es"
- "category": classify for heatmap tracking

═══ VOCAB UPGRADE RULES ═══
- vocab_upgrades: Find "safe/basic" words (good, bad, important, many, show, etc.)
  and suggest academic alternatives with register label
- Only flag words that genuinely have better alternatives in this context

═══ COHESION RULES ═══
- cohesion.found: list ALL linking words/phrases actually present in the text
- cohesion.missing_suggestions: suggest 2-3 linking devices that would improve flow
- cohesion.verdict_vi: one sentence in Vietnamese assessing overall cohesion

═══ UPGRADED SENTENCE RULES ═══
- Pick the sentence with the WORST combination of errors
- upgraded: rewrite at Band ${targetBand} level — improve grammar, vocabulary, cohesion
- changes_vi: explain in Vietnamese what was changed and why (≤20 words)`;

  const userPrompt = `Unit: ${unitId} | Target Band: ${targetBand}
Grammar focus: ${grammarTargets.join(", ")}
${taskContext}

Learner writing:
"""
${text.trim()}
"""

Return JSON with EXACTLY this shape (no extra keys):
{
  "band_estimate": <number 4.0–9.0 in 0.5 steps>,
  "criteria": {
    "ta": <number 4.0–9.0>,
    "cc": <number 4.0–9.0>,
    "lr": <number 4.0–9.0>,
    "gra": <number 4.0–9.0 — deduct strictly for each grammar error>
  },
  "grammar_used_correctly": <boolean>,
  "errors": [
    {
      "original": "<EXACT substring from learner text — do not paraphrase>",
      "correction": "<corrected form only>",
      "rule_vi": "<quy tắc ngữ pháp bị vi phạm, tối đa 15 từ tiếng Việt>",
      "category": "<subject_verb_agreement|tense|article|preposition|word_form|vocabulary|punctuation|other>"
    }
  ],
  "vocab_upgrades": [
    {
      "original": "<basic word found in text>",
      "upgraded": "<academic/precise alternative>",
      "register": "<academic|precise|formal>"
    }
  ],
  "cohesion": {
    "has_linking_words": <boolean>,
    "found": ["<linking word or phrase>"],
    "missing_suggestions": ["<suggested linking device>"],
    "verdict_vi": "<nhận xét mạch lạc 1 câu tiếng Việt>"
  },
  "upgraded_sentence": {
    "original": "<worst sentence from learner text — exact copy>",
    "upgraded": "<rewritten at Band ${targetBand}>",
    "changes_vi": "<giải thích thay đổi, tối đa 20 từ tiếng Việt>"
  },
  "encouragement": "<động viên cá nhân hóa, tối đa 15 từ tiếng Việt>",
  "improvement_tips": [
    "<mẹo cụ thể cho tiêu chí yếu nhất, tối đa 20 từ tiếng Việt>",
    "<mẹo cụ thể>",
    "<mẹo cụ thể>"
  ]
}`;

  // 5. Call model
  try {
    const completion = await withRetry(() =>
      ai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.1,
        max_tokens: 2500,
      }),
    );

    const raw = completion.choices[0]?.message?.content ?? "";

    // 6. Parse
    let feedback: FeedbackPayload;
try {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  const jsonStr = extractJson(cleaned);
  feedback = JSON.parse(jsonStr) as FeedbackPayload;
} catch {
  console.error("[writing-mini-feedback] non-JSON response:", raw.slice(0, 300));
  return NextResponse.json(
    { error: "AI returned malformed response. Please retry." },
    { status: 502 },
  );
}

    // 7. Shape check
    const requiredKeys: (keyof FeedbackPayload)[] = [
      "band_estimate",
      "criteria",
      "grammar_used_correctly",
      "errors",
      "vocab_upgrades",
      "cohesion",
      "upgraded_sentence",
      "encouragement",
      "improvement_tips",
    ];
    for (const key of requiredKeys) {
      if (!(key in feedback)) {
        return NextResponse.json(
          { error: `AI response missing field: ${key}` },
          { status: 502 },
        );
      }
    }

    // 8. Normalise
    if (!Array.isArray(feedback.errors)) feedback.errors = [];
    if (!Array.isArray(feedback.vocab_upgrades)) feedback.vocab_upgrades = [];
    if (!Array.isArray(feedback.improvement_tips)) feedback.improvement_tips = [];
    if (!feedback.cohesion || typeof feedback.cohesion !== "object") {
      feedback.cohesion = {
        has_linking_words: false,
        found: [],
        missing_suggestions: [],
        verdict_vi: "Chưa đánh giá được.",
      };
    }
    if (!feedback.criteria || typeof feedback.criteria !== "object") {
      feedback.criteria = {
        ta: feedback.band_estimate,
        cc: feedback.band_estimate,
        lr: feedback.band_estimate,
        gra: feedback.band_estimate,
      };
    }

    return NextResponse.json(feedback);
  } catch (err: unknown) {
    if (isOpenAIError(err)) {
      const status = err.status ?? 500;
      if (status === 429)
        return NextResponse.json(
          { error: "Rate limit reached. Please try again shortly." },
          { status: 429 },
        );
      if (status === 401 || status === 403)
        return NextResponse.json(
          { error: "AI service authentication failed." },
          { status: 502 },
        );
      return NextResponse.json(
        { error: err.message ?? "AI feedback generation failed." },
        { status: 500 },
      );
    }
    console.error("[writing-mini-feedback] unexpected error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// ── Type guard ────────────────────────────────────────────────────────────
interface OpenAILikeError {
  status?: number;
  message?: string;
}
function isOpenAIError(err: unknown): err is OpenAILikeError {
  return (
    typeof err === "object" &&
    err !== null &&
    ("status" in err || "message" in err)
  );
}