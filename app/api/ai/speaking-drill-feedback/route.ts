/**
 * app/api/ai/speaking-drill-feedback/route.ts
 *
 * Pipeline:
 *   multipart/form-data (audio + metadata)
 *     → 1. Clerk auth
 *     → 2. Parse + validate
 *     → 3. Groq Whisper  → transcript  (uses original audio buffer)
 *     → 4. Azure REST    → pronunciation scores (uses converted WAV PCM 16kHz)
 *     → 5. Gemini        → feedback synthesis (transcript + Azure data)
 *     → 6. Merged JSON response
 *
 * Audio length limit: 10 MB upload / ≤30s audio (Azure short audio REST constraint).
 * Azure failure degrades gracefully — pronunciation = null, source = "unavailable".
 *
 * Required env vars:
 *   GROQ_API_KEY            Groq Whisper API key
 *   AZURE_SPEECH_KEY        Azure Cognitive Services subscription key
 *   AZURE_SPEECH_REGION     e.g. "eastasia"
 *   GEMINI_API_KEY          Gemini proxy key
 *   ANTIGRAVITY_BASE_URL    Optional; defaults to https://platform.beeknoee.com/api/v1
 */

// ── Runtime declaration ────────────────────────────────────────────────────
// REQUIRED: fluent-ffmpeg, ffmpeg-static, stream, and Buffer are Node.js-only.
// Without this, Next.js 14 App Router may route to Edge runtime, causing a
// silent import-time crash BEFORE any handler code executes.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import {
  convertToWavPcm16k,
  assessAzurePronunciation,
  mapScoreToBand,
  type PronunciationAssessment,
} from "@/lib/azure-pronunciation";

console.log("[speaking-drill-feedback] module loaded — runtime: nodejs");

// ── Clients (lazy) ─────────────────────────────────────────────────────────
// Constructed inside getter functions to avoid module-scope side effects.
// OpenAI constructor does NOT make network calls, but lazy init is safer:
// it defers env-var reads until request time, so missing vars produce
// clear 401/403 errors rather than silent module-load issues.

let _ai: OpenAI | null = null;
let _groq: OpenAI | null = null;

function getAiClient(): OpenAI {
  if (!_ai) {
    _ai = new OpenAI({
      apiKey: process.env.GEMINI_API_KEY ?? "",
      baseURL:
        process.env.ANTIGRAVITY_BASE_URL ??
        "https://platform.beeknoee.com/api/v1",
    });
  }
  return _ai;
}

function getGroqClient(): OpenAI {
  if (!_groq) {
    _groq = new OpenAI({
      apiKey: process.env.GROQ_API_KEY ?? "",
      baseURL: "https://api.groq.com/openai/v1",
    });
  }
  return _groq;
}

const GEMINI_MODEL = "deepseek/deepseek-chat-v3.1";
const WHISPER_MODEL = "whisper-large-v3";

// ── Constants ─────────────────────────────────────────────────────────────

/**
 * 10 MB upload limit for audio files.
 * Azure short audio REST is intended for ≤30s audio.
 * 10 MB is generous for 30s of any compressed format (typical: 1–5 MB).
 */
const MAX_AUDIO_BYTES = 10 * 1024 * 1024;

// ── Retry (Gemini 429 only) ───────────────────────────────────────────────

const MAX_RETRY = 3;
const BASE_DELAY = 1_000;
const MAX_DELAY = 30_000;

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < MAX_RETRY; i++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastErr = err;
      const status = (err as { status?: number }).status;
      if (status !== 429) throw err;

      const retryAfter = (err as { headers?: Record<string, string> })
        .headers?.["retry-after"];
      let delay: number;
      if (retryAfter) {
        delay = Math.min(parseFloat(retryAfter) * 1_000, MAX_DELAY);
      } else {
        const base = Math.min(BASE_DELAY * Math.pow(2, i), MAX_DELAY);
        delay = base * (0.75 + Math.random() * 0.5);
      }
      console.warn(
        `[speaking-drill-feedback] Gemini 429 — attempt ${i + 1}/${MAX_RETRY}, waiting ${Math.round(delay)}ms`,
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
}

// ── Types ─────────────────────────────────────────────────────────────────

/** Compact word entry exposed in pronunciation_details (no syllable/phoneme to keep payload small) */
interface PronunciationWordCompact {
  word: string;
  accuracyScore: number | null;
  errorType: string | null;
}

/** pronunciation_details sent to client — raw Azure 0–100 scores */
interface PronunciationDetails {
  overallScore: number;
  accuracyScore: number | null;
  fluencyScore: number | null;
  /**
   * Completeness score, 0–100.
   * NOTE: affected by Whisper ReferenceText alignment — a Whisper recognition
   * error will lower this score even if the learner spoke correctly.
   */
  completenessScore: number | null;
  prosodyScore: number | null;
  /** Capped at 60 words. RawJson is logged server-side only. */
  words: PronunciationWordCompact[];
}

export interface SpeakingCriteria {
  fluency: number;
  vocabulary: number;
  grammar: number;
  /**
   * Azure overallScore (0–100) mapped to IELTS band scale (0–9, 0.5 steps):
   *   band = clamp(round(score / 100 * 9 * 2) / 2, 0, 9)
   * null when Azure assessment is unavailable.
   */
  pronunciation: number | null;
}

export interface ErrorLabel {
  span: string;
  type:
    | "grammar_error"
    | "vocabulary_error"
    | "possible_stt_error"
    | "pronunciation_proxy";
  explanation_vi: string;
  suggested_correction: string;
}

export interface SpeakingFeedbackPayload {
  band_estimate: number;
  criteria: SpeakingCriteria;
  pronunciation_note: string;
  /**
   * "azure"       = pronunciation scored from real audio via Azure
   * "unavailable" = Azure failed or no audio provided; pronunciation = null
   */
  pronunciation_source: "azure" | "unavailable";
  /** null when pronunciation_source === "unavailable" */
  pronunciation_details: PronunciationDetails | null;
  task_relevance: "on_topic" | "off_topic" | "cannot_assess";
  error_labels: ErrorLabel[];
  strengths_vi: string;
  improvements_vi: string[];
  model_answer_band7: string;
  upgraded_sentence: string;
  scholar_tip_vi: string;
}

// ── POST /api/ai/speaking-drill-feedback ──────────────────────────────────

export async function POST(req: NextRequest) {
  console.log("[speaking-drill-feedback] ▶️ POST received");

  // 1. Clerk auth guard
  console.log("[speaking-drill-feedback] stage: auth()");
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  console.log(
    "[speaking-drill-feedback] stage: auth OK, userId:",
    userId.slice(0, 8) + "...",
  );

  const contentType = req.headers.get("content-type") ?? "";

  // 2. Parse request ──────────────────────────────────────────────────────
  let audioBuffer: Buffer | null = null;
  let transcript = "";
  let confirmedTranscript = ""; // FIX: preserve user-confirmed transcript
  let stt_uncertain_spans: string[] = [];
  let speaking_prompt: string | undefined;
  let unitId = "";
  let targetBand = 0;
  let grammarTargets: string[] = [];

  console.log(
    "[speaking-drill-feedback] stage: parsing request, content-type:",
    contentType.slice(0, 60),
  );

  if (contentType.includes("multipart/form-data")) {
    // Audio path: form-data with an audio file + JSON metadata fields
    let formData: FormData;
    console.log("[speaking-drill-feedback] stage: req.formData() start");
    try {
      formData = await req.formData();
    } catch (e) {
      console.error("[speaking-drill-feedback] req.formData() threw:", e);
      return NextResponse.json(
        { error: "Failed to parse form-data" },
        { status: 422 },
      );
    }
    console.log("[speaking-drill-feedback] stage: req.formData() done");

    const audioFile = formData.get("audio") as File | null;

    // ── [DEBUG] Server-side FormData diagnostic ─────────────────────
    console.log(
      "[speaking-drill-feedback] 📦 formData.get('audio') exists:",
      audioFile !== null,
    );
    if (audioFile) {
      console.log(
        "[speaking-drill-feedback] 📦 audio file size:",
        audioFile.size,
        "bytes",
      );
      console.log(
        "[speaking-drill-feedback] 📦 audio file type:",
        audioFile.type,
      );
      console.log(
        "[speaking-drill-feedback] 📦 audio file name:",
        audioFile.name,
      );
    }
    // ─────────────────────────────────────────────────────────

    if (!audioFile) {
      return NextResponse.json(
        { error: "'audio' file is required in form-data" },
        { status: 422 },
      );
    }

    // Guard: Azure short audio REST is for ≤30s clips
    if (audioFile.size > MAX_AUDIO_BYTES) {
      return NextResponse.json(
        {
          error: `Audio too large (max ${MAX_AUDIO_BYTES / 1024 / 1024} MB). Keep under 30 seconds.`,
        },
        { status: 422 },
      );
    }

    audioBuffer = Buffer.from(await audioFile.arrayBuffer());

    // Metadata fields sent as individual form entries (or a "meta" JSON blob)
    const metaRaw = formData.get("meta") as string | null;
    if (metaRaw) {
      try {
        const meta = JSON.parse(metaRaw) as Record<string, unknown>;
        unitId = (meta.unitId as string) ?? "";
        targetBand = Number(meta.targetBand) || 0;
        grammarTargets = Array.isArray(meta.grammarTargets)
          ? (meta.grammarTargets as string[])
          : [];
        speaking_prompt = (meta.speaking_prompt as string) || undefined;
        stt_uncertain_spans = Array.isArray(meta.stt_uncertain_spans)
          ? (meta.stt_uncertain_spans as string[])
          : [];
        // FIX: Always save user's confirmed transcript — used for Azure
        // referenceText and Gemini analysis (more reliable than Whisper re-transcription)
        if (typeof meta.transcript === "string" && meta.transcript.trim()) {
          confirmedTranscript = meta.transcript;
          transcript = meta.transcript;
        }
      } catch {
        return NextResponse.json(
          { error: "'meta' field must be valid JSON" },
          { status: 422 },
        );
      }
    } else {
      // Accept individual fields too
      unitId = (formData.get("unitId") as string) ?? "";
      targetBand = Number(formData.get("targetBand")) || 0;
      const gt = formData.get("grammarTargets");
      grammarTargets = gt ? JSON.parse(gt as string) : [];
      speaking_prompt =
        (formData.get("speaking_prompt") as string) || undefined;
    }
  } else {
    // Text-only fallback: JSON body with pre-confirmed transcript
    // Pronunciation will be null / source = "unavailable"
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 422 });
    }
    transcript = (body.transcript as string) ?? "";
    stt_uncertain_spans = Array.isArray(body.stt_uncertain_spans)
      ? (body.stt_uncertain_spans as string[])
      : [];
    speaking_prompt = (body.speaking_prompt as string) || undefined;
    unitId = (body.unitId as string) ?? "";
    targetBand = Number(body.targetBand) || 0;
    grammarTargets = Array.isArray(body.grammarTargets)
      ? (body.grammarTargets as string[])
      : [];
  }

  // 3. Validate shared fields ────────────────────────────────────────────
  if (!unitId) {
    return NextResponse.json(
      { error: "'unitId' is required" },
      { status: 422 },
    );
  }
  if (!targetBand || typeof targetBand !== "number" || targetBand < 1) {
    return NextResponse.json(
      { error: "'targetBand' must be a positive number (e.g. 7.0)" },
      { status: 422 },
    );
  }
  if (!Array.isArray(grammarTargets) || grammarTargets.length === 0) {
    return NextResponse.json(
      { error: "'grammarTargets' must be a non-empty array" },
      { status: 422 },
    );
  }
  if (!speaking_prompt) {
    console.warn(
      "[speaking-drill-feedback] speaking_prompt missing — task_relevance will be cannot_assess",
    );
  }

  // 4. Groq Whisper transcription ────────────────────────────────────────
  // Only runs when audio is provided; otherwise we use transcript from JSON body.
  if (audioBuffer) {
    try {
      // Groq accepts the original format natively (webm/mp3/m4a/wav/etc.)
      // No conversion needed — conversion is only for Azure below.
      // Convert Buffer → Uint8Array (Buffer is not BlobPart in strict TS)
      console.log(
        "[speaking-drill-feedback] stage: Whisper transcription start",
      );
      const audioUint8 = new Uint8Array(audioBuffer);
      const audioFile = new File([audioUint8], "audio.webm", {
        type: "audio/webm",
      });
      const whisperResult = await getGroqClient().audio.transcriptions.create({
        file: audioFile,
        model: WHISPER_MODEL,
        response_format: "verbose_json",
        timestamp_granularities: ["segment"],
        language: "en",
        prompt:
          "Transcribe exactly as spoken. Do not correct grammar or normalize words. Preserve filler words like uh, um, gonna, wanna.",
      });

      const whisperTranscript = whisperResult.text ?? "";
      console.log(
        "✅ Whisper done, transcript length:",
        whisperTranscript.length,
      );

      // FIX: Only use Whisper transcript if user didn't provide a confirmed one.
      // User's confirmed transcript is more accurate (user can fix Whisper errors).
      if (!confirmedTranscript.trim()) {
        transcript = whisperTranscript;
      } else {
        console.log(
          "[speaking-drill-feedback] Using confirmed transcript instead of Whisper re-transcription",
        );
      }

      // Extract low-confidence segments as uncertain spans
      // verbose_json segments have avg_logprob; < -0.5 indicates low confidence
      if (whisperResult.segments && Array.isArray(whisperResult.segments)) {
        stt_uncertain_spans = (
          whisperResult.segments as Array<{
            avg_logprob?: number;
            text?: string;
          }>
        )
          .filter((s) => (s.avg_logprob ?? 0) < -0.5)
          .map((s) => s.text?.trim() ?? "")
          .filter(Boolean);
      }
    } catch (err) {
      console.error("[speaking-drill-feedback] Whisper error:", err);
      return NextResponse.json(
        { error: "Transcription failed. Please try again." },
        { status: 502 },
      );
    }
  }

  if (!transcript || transcript.trim() === "") {
    return NextResponse.json(
      {
        error: "Transcript is empty — please provide audio or transcript text.",
      },
      { status: 422 },
    );
  }

  // 5. Azure Pronunciation Assessment ───────────────────────────────────
  // Runs only when audio is provided. Degrades gracefully on any failure.
  let pronunciationAssessment: PronunciationAssessment | null = null;
  let pronunciationSource: "azure" | "unavailable" = "unavailable";
  let pronunciationError: string | null = null; // captured for dev diagnostics

  if (audioBuffer) {
    let wavBuffer: Buffer | null = null;

    // Step A: Convert audio to WAV PCM 16kHz for Azure
    console.log(
      "[speaking-drill-feedback] 🔊 Azure branch entered — converting audio to WAV PCM 16kHz",
    );
    try {
      wavBuffer = await convertToWavPcm16k(audioBuffer);
      console.log(
        "[speaking-drill-feedback] 🔊 WAV conversion OK, size:",
        wavBuffer?.length ?? 0,
        "bytes",
      );
    } catch (convErr) {
      const msg = convErr instanceof Error ? convErr.message : String(convErr);
      pronunciationError = `FFmpeg: ${msg}`;
      console.error("[speaking-drill-feedback] FFmpeg conversion failed:", msg);
    }

    // Step B: Azure Pronunciation Assessment (only if conversion succeeded)
    if (wavBuffer) {
      console.log(
        "[speaking-drill-feedback] 🔊 calling Azure Pronunciation Assessment",
      );
      try {
        pronunciationAssessment = await assessAzurePronunciation(
          wavBuffer,
          transcript.trim(),
        );
        pronunciationSource = "azure";
        console.log(
          "[speaking-drill-feedback] ✅ Azure assessment OK, overallScore:",
          pronunciationAssessment?.overallScore,
        );
      } catch (azureErr) {
        const msg =
          azureErr instanceof Error ? azureErr.message : String(azureErr);
        pronunciationError = `Azure: ${msg}`;
        console.error("[speaking-drill-feedback] Azure API failed:", msg);
        pronunciationAssessment = null;
        pronunciationSource = "unavailable";
      }
    } else if (!pronunciationError) {
      pronunciationError = "WAV conversion produced null buffer";
    }

    // pronunciationError is now in request scope — no globalThis needed
  }

  // 6. Build Gemini prompt ───────────────────────────────────────────────

  const uncertainCtx =
    stt_uncertain_spans.length > 0
      ? `\nSTT_UNCERTAIN spans (do NOT penalize grammar/vocabulary here): ${stt_uncertain_spans.map((s) => `"${s}"`).join(", ")}`
      : "\nNo STT_UNCERTAIN spans reported.";

  const promptCtx = speaking_prompt
    ? `Speaking prompt: "${speaking_prompt}"`
    : "Speaking prompt: NOT PROVIDED — set task_relevance to cannot_assess";

  // Summarize Azure data for Gemini context
  const azureCtx =
    pronunciationAssessment && pronunciationSource === "azure"
      ? `
Azure Pronunciation Assessment (HundredMark, 0–100):
  Overall: ${pronunciationAssessment.overallScore ?? "N/A"}
  Accuracy: ${pronunciationAssessment.accuracyScore ?? "N/A"}
  Fluency: ${pronunciationAssessment.fluencyScore ?? "N/A"}
  Completeness: ${pronunciationAssessment.completenessScore ?? "N/A"} (may be affected by Whisper reference alignment)
  Prosody: ${pronunciationAssessment.prosodyScore ?? "N/A"}
  Word errors (first 10): ${JSON.stringify(
    pronunciationAssessment.words
      .filter((w) => w.errorType && w.errorType !== "None")
      .slice(0, 10)
      .map((w) => ({
        word: w.word,
        error: w.errorType,
        score: w.accuracyScore,
      })),
  )}`
      : "Azure Pronunciation Assessment: UNAVAILABLE — do not invent pronunciation data.";

  const systemPrompt = `You are an expert IELTS Speaking examiner evaluating a Vietnamese learner's spoken response.

CRITICAL CONSTRAINTS:
1. Transcript produced by Whisper STT. STT_UNCERTAIN spans have low confidence — do NOT penalize grammar/vocabulary within those spans.
2. Grammar, vocabulary, fluency, and coherence must be evaluated from the confirmed transcript text only.
3. PRONUNCIATION RULE (strict):
   - criteria.pronunciation in your JSON MUST be null — the server overrides it with the real Azure band score.
   - Write pronunciation_note based on the Azure data provided. If unavailable, state that clearly.
   - NEVER invent a numeric pronunciation score.
4. band_estimate reflects grammar + vocabulary + fluency from confirmed text. Do not inflate.
5. The learner targets Band ${targetBand}. Grammar focus: ${grammarTargets.join(", ")}.
6. Return ONLY valid JSON, no markdown fences, no extra text.`;

  // Build pronunciation_note instruction dynamically so Gemini has concrete
  // Azure metrics to reference — not a vague placeholder.
  const pronunciationNoteInstruction =
    pronunciationSource === "azure" && pronunciationAssessment
      ? `"<Vietnamese note on pronunciation: Azure overall score ${pronunciationAssessment.overallScore ?? "N/A"}/100. Mention accuracy (${pronunciationAssessment.accuracyScore ?? "N/A"}), fluency (${pronunciationAssessment.fluencyScore ?? "N/A"}). Up to 2 word errors if present. Max 2 sentences.>"`
      : `"Điểm phát âm chưa được đánh giá lần này — dữ liệu âm thanh từ Azure không khả dụng. Sẽ cải thiện ở phiên sau."`;

  const userPrompt = `Unit: ${unitId} | Target Band: ${targetBand}
Grammar focus: ${grammarTargets.join(", ")}
${promptCtx}
${uncertainCtx}

${azureCtx}

Learner confirmed transcript:
"""
${transcript.trim()}
"""

STRICT ANALYSIS RULES:
1. Scan the transcript word by word. Find ALL grammar errors (tense, article, 
   preposition, subject-verb agreement, word form). Do NOT skip any.
2. For each error_label: "span" must be the EXACT substring from the transcript above.
3. "suggested_correction" must fix ONLY that span — do not rewrite the whole sentence.
4. improvements_vi must reference the EXACT span from error_labels — not generic advice.
5. model_answer_band7: Write a Band ${targetBand}+ answer to the speaking prompt.
   Keep the SAME IDEAS and TOPIC as the learner's transcript but upgrade grammar,
   vocabulary, and coherence. 3-5 sentences.
6. upgraded_sentence: Take the sentence with the WORST grammar error from the transcript.
   Rewrite it at Band ${targetBand} level. Show clearly what changed.
7. band_estimate: Be STRICT. Count grammar errors. More than 3 errors → max Band 5.5.

COMMON ERRORS TO CHECK (grammar focus: ${grammarTargets.join(", ")}):
- Wrong preposition: "on the future" → "in the future"
- Missing article: "get good job" → "get a good job"
- Wrong tense, wrong verb form
- Countable/uncountable noun errors

Return ONLY valid JSON with EXACTLY this shape (no markdown, no extra text):
{
  "band_estimate": <strict score based on actual error count>,
  "criteria": {
    "fluency": <number 4.0–9.0 in 0.5 steps>,
    "vocabulary": <number 4.0–9.0 in 0.5 steps>,
    "grammar": <number — deduct for each error found>,
    "pronunciation": null
  },
  "pronunciation_note": ${pronunciationNoteInstruction},
  "task_relevance": "<on_topic | off_topic | cannot_assess>",
  "error_labels": [
    {
      "span": "<EXACT text from transcript — copy-paste, do not paraphrase>",
      "type": "<grammar_error | vocabulary_error | possible_stt_error | pronunciation_proxy>",
      "explanation_vi": "<giải thích lỗi cụ thể, tối đa 15 từ tiếng Việt>",
      "suggested_correction": "<chỉ sửa span đó, không viết lại cả câu>"
    }
  ],
  "strengths_vi": "<1–2 câu tiếng Việt khen điểm mạnh CỤ THỂ từ bài nói>",
  "improvements_vi": [
    "<tip cụ thể trích dẫn span lỗi, tối đa 15 từ tiếng Việt>",
    "<tip cụ thể>",
    "<tip cụ thể>"
  ],
  "model_answer_band7": "<bài mẫu Band ${targetBand} cùng chủ đề với learner, 3-5 câu tiếng Anh>",
  "upgraded_sentence": "<câu tệ nhất được viết lại ở Band ${targetBand}, ghi rõ phần đã sửa>",
  "scholar_tip_vi": "<1 mẹo ngữ pháp/từ vựng cụ thể từ lỗi trong bài, tối đa 20 từ>"
}

IMPORTANT: criteria.pronunciation MUST be null — server replaces it with real Azure score.`;

  // 7. Call Gemini ────────────────────────────────────────────────────────
  let feedback: SpeakingFeedbackPayload;
  try {
    console.log("[speaking-drill-feedback] stage: Gemini request start");
    const completion = await withRetry(() =>
      getAiClient().chat.completions.create({
        model: GEMINI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.0,
        max_tokens: 2000,
      }),
    );

    const raw = completion.choices[0]?.message?.content ?? "";

    // Strip markdown fences if proxy leaks them
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error(
        "[speaking-drill-feedback] model non-JSON:",
        raw.slice(0, 300),
      );
      return NextResponse.json(
        { error: "AI returned malformed response. Please retry." },
        { status: 502 },
      );
    }

    try {
      feedback = JSON.parse(jsonMatch[0]) as SpeakingFeedbackPayload;
    } catch {
      return NextResponse.json(
        { error: "AI returned invalid JSON. Please retry." },
        { status: 502 },
      );
    }
  } catch (err: unknown) {
    if (isOpenAILikeError(err)) {
      const status = err.status ?? 500;
      if (status === 429) {
        return NextResponse.json(
          { error: "Rate limit reached. Please try again shortly." },
          { status: 429 },
        );
      }
      if (status === 401 || status === 403) {
        return NextResponse.json(
          { error: "AI service authentication failed." },
          { status: 502 },
        );
      }
      return NextResponse.json(
        { error: err.message ?? "AI feedback generation failed." },
        { status: 500 },
      );
    }
    console.error("[speaking-drill-feedback] unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }

  // 8. Shape validation ──────────────────────────────────────────────────
  const requiredKeys: (keyof SpeakingFeedbackPayload)[] = [
    "band_estimate",
    "criteria",
    "pronunciation_note",
    "task_relevance",
    "error_labels",
    "strengths_vi",
    "improvements_vi",
    "model_answer_band7",
    "upgraded_sentence",
    "scholar_tip_vi",
  ];
  for (const key of requiredKeys) {
    if (!(key in feedback)) {
      return NextResponse.json(
        { error: `AI response missing field: ${key}` },
        { status: 502 },
      );
    }
  }

  // 9. Override pronunciation from Azure (server-authoritative) ──────────
  if (!feedback.criteria) feedback.criteria = {} as SpeakingCriteria;

  if (
    pronunciationSource === "azure" &&
    pronunciationAssessment?.overallScore != null
  ) {
    // Map Azure 0–100 → IELTS band scale (0–9, 0.5 steps)
    const band = mapScoreToBand(pronunciationAssessment.overallScore);
    feedback.criteria.pronunciation = band;
    console.log(
      "[speaking-drill-feedback] 🎯 pronunciation override: overallScore =",
      pronunciationAssessment.overallScore,
      "→ band =",
      band,
    );
  } else {
    // Gemini is not allowed to produce pronunciation scores
    feedback.criteria.pronunciation = null;
    console.log(
      "[speaking-drill-feedback] ⚠️ pronunciation = null. source:",
      pronunciationSource,
      "overallScore:",
      pronunciationAssessment?.overallScore,
    );
  }

  // Fallback for other numeric criteria
  const numericCriteria = ["fluency", "vocabulary", "grammar"] as const;
  for (const key of numericCriteria) {
    if (typeof feedback.criteria[key] !== "number") {
      feedback.criteria[key] = feedback.band_estimate;
    }
  }

  // Ensure arrays
  if (!Array.isArray(feedback.error_labels)) feedback.error_labels = [];
  if (!Array.isArray(feedback.improvements_vi)) feedback.improvements_vi = [];

  // 10. Build pronunciation_details for client ───────────────────────────
  let pronunciationDetails: PronunciationDetails | null = null;
  if (pronunciationSource === "azure" && pronunciationAssessment) {
    const pa = pronunciationAssessment;
    pronunciationDetails = {
      overallScore: pa.overallScore ?? 0,
      accuracyScore: pa.accuracyScore,
      fluencyScore: pa.fluencyScore,
      completenessScore: pa.completenessScore,
      prosodyScore: pa.prosodyScore,
      // Strip syllable/phoneme arrays from client response to keep payload lean
      words: pa.words.map((w) => ({
        word: w.word,
        accuracyScore: w.accuracyScore,
        errorType: w.errorType,
      })),
    };
  }

  // 11. Return merged response ───────────────────────────────────────────
  const response: SpeakingFeedbackPayload & {
    _debug_pronunciation_error?: string;
  } = {
    ...feedback,
    pronunciation_source: pronunciationSource,
    pronunciation_details: pronunciationDetails,
    // Dev-only: expose the exact error so you can see it in Network tab
    // without needing to read server logs. Remove or gate on NODE_ENV in prod.
    ...(process.env.NODE_ENV !== "production" && pronunciationError
      ? { _debug_pronunciation_error: pronunciationError }
      : {}),
  };

  console.log(
    "[speaking-drill-feedback] 📤 FINAL response criteria:",
    JSON.stringify(response.criteria),
    "| pronunciation_source:",
    response.pronunciation_source,
  );

  return NextResponse.json(response);
}

// ── Type guard ─────────────────────────────────────────────────────────────

interface OpenAILikeError {
  status?: number;
  message?: string;
  headers?: Record<string, string>;
}

function isOpenAILikeError(err: unknown): err is OpenAILikeError {
  return (
    typeof err === "object" &&
    err !== null &&
    ("status" in err || "message" in err)
  );
}
