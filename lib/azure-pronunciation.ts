/**
 * lib/azure-pronunciation.ts
 *
 * Server-only helper for Azure Speech Pronunciation Assessment via REST API.
 * Uses the Azure Speech-to-Text REST API for short audio — no Azure SDK required.
 *
 * Why REST over the Speech SDK:
 *   The SDK does work in Node.js (Microsoft has Node.js samples), but the REST
 *   approach is simpler, has zero extra SDK dependencies, keeps keys fully
 *   server-side, and integrates cleanly into Next.js App Router route handlers.
 *
 * Audio format required by Azure: audio/wav; codecs=audio/pcm; samplerate=16000
 * Conversion from webm/mp3/m4a is handled by convertToWavPcm16k() via fluent-ffmpeg
 * + ffmpeg-static (bundled binary, no system FFmpeg needed — works on Railway/VPS/Docker).
 *
 * NOTE for Vercel serverless: ffmpeg-static adds ~50MB binary. If deploying to Vercel,
 * require the frontend to send WAV PCM 16kHz mono and skip convertToWavPcm16k().
 *
 * ReferenceText note:
 *   Azure uses ReferenceText to compute accuracy, completeness, and miscue detection.
 *   For free-form IELTS speaking (not read-aloud) we pass the Whisper transcript as
 *   ReferenceText. This is an accepted workaround — but completenessScore and miscue
 *   flags will be affected if Whisper misrecognizes words.
 */

// Node.js built-ins
import { Readable, PassThrough } from "stream";

// Third-party
import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs";

let _ffmpegInitialized = false;

function initFfmpeg(): void {
  if (_ffmpegInitialized) return;

  // Ưu tiên 1: ffmpeg.exe đặt ở root project (E:\Web_IELTS\ffmpeg.exe)
  const localBin = path.join(process.cwd(), "ffmpeg.exe");

  if (fs.existsSync(localBin)) {
    console.log("[azure-pronunciation] ✅ ffmpeg binary found:", localBin);
    ffmpeg.setFfmpegPath(localBin);
    _ffmpegInitialized = true;
    return;
  }

  // Ưu tiên 2: ffmpeg-static (fallback cho Linux/Docker/Railway)
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ffmpegStatic: string | null = require("ffmpeg-static");
    if (ffmpegStatic && fs.existsSync(ffmpegStatic)) {
      console.log(
        "[azure-pronunciation] ✅ ffmpeg-static binary:",
        ffmpegStatic,
      );
      ffmpeg.setFfmpegPath(ffmpegStatic);
      _ffmpegInitialized = true;
      return;
    }
  } catch {
    // ffmpeg-static không có → tiếp tục
  }

  throw new Error(`FFmpeg binary not found. Đặt ffmpeg.exe vào: ${localBin}`);
}

// ── Constants ─────────────────────────────────────────────────────────────

const AZURE_TIMEOUT_MS = 30_000; // FIX: increased from 15s — Azure may need more time for longer audio

/** Cap word-level details returned to client. Full list can be thousands of entries. */
const MAX_WORD_DETAILS = 60;

/** Azure REST short audio endpoint */
function azureEndpoint(region: string): string {
  return (
    `https://${region}.stt.speech.microsoft.com` +
    `/speech/recognition/conversation/cognitiveservices/v1` +
    `?language=en-US&format=detailed`
  );
}

// ── Public types ───────────────────────────────────────────────────────────

export interface PronunciationWord {
  word: string;
  accuracyScore: number | null;
  errorType: string | null;
  /** Included only when Azure returns syllable data */
  syllables?: Array<{ syllable: string; accuracyScore: number | null }>;
  /** Included only when Azure returns phoneme data */
  phonemes?: Array<{ phoneme: string; accuracyScore: number | null }>;
}

/**
 * Normalized result returned by assessAzurePronunciation().
 * All scores are raw Azure 0–100 (HundredMark grading system).
 * Use mapScoreToBand() to convert overallScore to IELTS band scale.
 */
export interface PronunciationAssessment {
  /** Overall pronunciation score, 0–100 */
  overallScore: number | null;
  /** Phoneme accuracy, 0–100 */
  accuracyScore: number | null;
  /**
   * Speech fluency, 0–100.
   * Measures rate, pausing, and naturalness of speech flow.
   */
  fluencyScore: number | null;
  /**
   * Completeness, 0–100.
   * NOTE: affected by Whisper referenceText alignment — a Whisper recognition
   * error will lower this score even if the learner spoke correctly.
   */
  completenessScore: number | null;
  /** Prosody (rhythm, stress, intonation), 0–100. Null if not returned by Azure. */
  prosodyScore: number | null;
  /** Word-level breakdown, capped at MAX_WORD_DETAILS (60) entries. */
  words: PronunciationWord[];
}

// ── Audio conversion ───────────────────────────────────────────────────────

/**
 * Converts any audio buffer (wav/webm/mp3/m4a/ogg/flac) to WAV PCM 16kHz mono.
 * Required format for Azure Speech REST short audio API.
 *
 * Processes entirely in-memory (no temp files).
 * Whisper should receive the ORIGINAL buffer directly — this conversion is only
 * for Azure, to avoid unnecessary double-encoding.
 */
export function convertToWavPcm16k(inputBuffer: Buffer): Promise<Buffer> {
  // Lazy-init ffmpeg binary path — safe to call here, inside a function
  try {
    initFfmpeg();
  } catch (initErr) {
    return Promise.reject(initErr);
  }

  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    let pushed = false;
    const inputStream = new Readable({
      read() {
        if (!pushed) {
          this.push(inputBuffer);
          pushed = true;
        }
        this.push(null);
      },
    });
    const output = new PassThrough();

    output.on("data", (chunk: Uint8Array) => chunks.push(chunk));
    output.on("end", () => {
      const result = Buffer.concat(chunks);
      // WAV header is 44 bytes; anything smaller is invalid
      if (result.length < 100) {
        reject(new Error("FFmpeg produced empty/invalid WAV output"));
        return;
      }
      resolve(result);
    });
    output.on("error", reject);

    ffmpeg(inputStream)
      // FIX: removed hardcoded .inputFormat("webm") — let ffmpeg auto-detect
      .audioFrequency(16000)
      .audioChannels(1)
      .audioCodec("pcm_s16le")
      .format("wav")
      .on("error", (err: Error) =>
        reject(new Error(`FFmpeg conversion failed: ${err.message}`)),
      )
      .pipe(output, { end: true });
  });
}

// ── Azure REST assessment ──────────────────────────────────────────────────

/**
 * Sends WAV PCM 16kHz mono audio to Azure Speech REST API with pronunciation
 * assessment enabled. Returns normalized PronunciationAssessment.
 *
 * Throws on hard errors (4xx from Azure, network failure, timeout).
 * Caller should catch and degrade gracefully (pronunciation = null).
 *
 * @param wavBuffer  WAV PCM 16kHz mono buffer (output of convertToWavPcm16k)
 * @param referenceText  Whisper transcript used as reference for scoring.
 *   For read-aloud tasks, pass the target script for higher accuracy.
 */
export async function assessAzurePronunciation(
  wavBuffer: Buffer,
  referenceText: string,
): Promise<PronunciationAssessment> {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION ?? "eastasia";

  if (!key) throw new Error("AZURE_SPEECH_KEY is not configured");

  const assessmentParams = {
    ReferenceText: referenceText,
    GradingSystem: "HundredMark", // All scores 0–100
    Granularity: "Phoneme", // Word > Syllable > Phoneme detail
    Dimension: "Comprehensive", // FIX: Required for FluencyScore, CompletenessScore, PronScore
    // Default "Basic" only returns AccuracyScore!
    EnableMiscue: "True", // FIX: Azure expects string "True"/"False", not boolean
    EnableProsodyAssessment: "True", // FIX: Azure expects string "True"/"False", not boolean
  };
  // Pronunciation-Assessment header must be base64(JSON.stringify(params)) — no newlines
  const assessmentConfig = Buffer.from(
    JSON.stringify(assessmentParams),
  ).toString("base64");

  const endpoint = azureEndpoint(region);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AZURE_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": "audio/wav; codecs=audio/pcm; samplerate=16000",
        "Pronunciation-Assessment": assessmentConfig,
      },
      body: new Uint8Array(wavBuffer),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const errorText = await res.text().catch(() => "<could not read body>");
    const requestId =
      res.headers.get("x-requestid") ??
      res.headers.get("x-ms-request-id") ??
      "N/A";
    console.error(
      "[azure-pronunciation] Azure error status:",
      res.status,
      "X-RequestId:",
      requestId,
    );
    console.error("[azure-pronunciation] Azure error body:", errorText);
    throw new Error(`Azure Speech ${res.status}: ${errorText.slice(0, 300)}`);
  }

  const json = (await res.json()) as AzureRestResponse;

  return normalizeAzureResponse(json);
}

// ── Score mapping ──────────────────────────────────────────────────────────

/**
 * Maps Azure raw 0–100 HundredMark score to IELTS band scale (0–9, 0.5 steps).
 *
 * Formula: band = clamp(round(score / 100 * 9 * 2) / 2, 0, 9)
 * Examples:
 *   100 → 9.0 | 90 → 8.0 | 75 → 6.5 | 55 → 5.0 | 30 → 2.5 | 0 → 0.0
 *
 * Raw scores are preserved in pronunciation_details for frontend display.
 */
export function mapScoreToBand(overallScore: number): number {
  const raw = (overallScore / 100) * 9;
  return Math.round(Math.min(raw, 9) * 2) / 2;
}

// ── Internal types + normalization ────────────────────────────────────────

/**
 * Azure REST API response shape.
 *
 * IMPORTANT — score field location differs by object level:
 *   NBest[0].PronunciationAssessment  → has PronScore, AccuracyScore, FluencyScore,
 *                                        CompletenessScore, ProsodyScore  (sub-object, correct)
 *   Words[n]                          → AccuracyScore, ErrorType DIRECTLY on the Word object
 *                                        (NOT inside a PronunciationAssessment sub-object)
 *   Syllables[n]                      → AccuracyScore DIRECTLY on the Syllable object
 *   Phonemes[n]                       → AccuracyScore DIRECTLY on the Phoneme object
 *
 * Some older SDK versions wrap word/syllable/phoneme scores in a PronunciationAssessment
 * sub-object — both shapes are handled below via fallback.
 */
interface AzureRestResponse {
  RecognitionStatus?: string;
  NBest?: Array<{
    /** Scores nested in sub-object (some SDK/API versions) */
    PronunciationAssessment?: {
      AccuracyScore?: number;
      FluencyScore?: number;
      CompletenessScore?: number;
      PronScore?: number;
      ProsodyScore?: number;
    };
    /** Scores directly on NBest[0] (REST API with Dimension=Comprehensive) */
    AccuracyScore?: number;
    FluencyScore?: number;
    CompletenessScore?: number;
    PronScore?: number;
    ProsodyScore?: number;
    Words?: Array<{
      Word?: string;
      /** Accuracy score — directly on Word in REST API responses */
      AccuracyScore?: number;
      /** Error type — directly on Word in REST API responses */
      ErrorType?: string;
      /**
       * Fallback for SDK-style responses that nest scores in a sub-object.
       * Primary path is AccuracyScore/ErrorType directly on Word.
       */
      PronunciationAssessment?: {
        AccuracyScore?: number;
        ErrorType?: string;
      };
      Syllables?: Array<{
        Syllable?: string;
        /** Accuracy score — directly on Syllable in REST API responses */
        AccuracyScore?: number;
        /** Fallback for SDK-style nesting */
        PronunciationAssessment?: { AccuracyScore?: number };
      }>;
      Phonemes?: Array<{
        Phoneme?: string;
        /** Accuracy score — directly on Phoneme in REST API responses */
        AccuracyScore?: number;
        /** Fallback for SDK-style nesting */
        PronunciationAssessment?: { AccuracyScore?: number };
      }>;
    }>;
  }>;
}

function normalizeAzureResponse(
  json: AzureRestResponse,
): PronunciationAssessment {
  const status = json.RecognitionStatus;
  if (status && status !== "Success") {
    // Caller catches → pronunciationSource = "unavailable" with clear error message
    throw new Error(`Azure recognition failed: ${status}`);
  }

  const best = json.NBest?.[0];

  // FIX: Azure REST API with Dimension=Comprehensive returns scores
  // DIRECTLY on NBest[0], not inside a PronunciationAssessment sub-object.
  // Fallback to sub-object for SDK-style responses.
  const pa = best?.PronunciationAssessment;
  const overallScore = pa?.PronScore ?? best?.PronScore ?? null;
  const accuracyScore = pa?.AccuracyScore ?? best?.AccuracyScore ?? null;
  const fluencyScore = pa?.FluencyScore ?? best?.FluencyScore ?? null;
  const completenessScore =
    pa?.CompletenessScore ?? best?.CompletenessScore ?? null;
  const prosodyScore = pa?.ProsodyScore ?? best?.ProsodyScore ?? null;

  console.log(
    "[azure-pronunciation] scores resolved — overall:",
    overallScore,
    "fluency:",
    fluencyScore,
    "accuracy:",
    accuracyScore,
  );

  const words: PronunciationWord[] = (best?.Words ?? [])
    .slice(0, MAX_WORD_DETAILS)
    .map((w) => {
      // Primary: scores directly on Word (REST API)
      // Fallback: scores nested in PronunciationAssessment sub-object (SDK style)
      const wordAccuracy =
        w.AccuracyScore ?? w.PronunciationAssessment?.AccuracyScore ?? null;
      const wordErrorType =
        w.ErrorType ?? w.PronunciationAssessment?.ErrorType ?? null;

      const entry: PronunciationWord = {
        word: w.Word ?? "",
        accuracyScore: wordAccuracy,
        errorType: wordErrorType,
      };

      if (w.Syllables?.length) {
        entry.syllables = w.Syllables.map((s) => ({
          syllable: s.Syllable ?? "",
          // Primary: directly on Syllable; fallback: nested sub-object
          accuracyScore:
            s.AccuracyScore ?? s.PronunciationAssessment?.AccuracyScore ?? null,
        }));
      }

      if (w.Phonemes?.length) {
        entry.phonemes = w.Phonemes.map((p) => ({
          phoneme: p.Phoneme ?? "",
          // Primary: directly on Phoneme; fallback: nested sub-object
          accuracyScore:
            p.AccuracyScore ?? p.PronunciationAssessment?.AccuracyScore ?? null,
        }));
      }

      return entry;
    });

  return {
    overallScore,
    accuracyScore,
    fluencyScore,
    completenessScore,
    prosodyScore,
    words,
  };
}
