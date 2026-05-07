import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

// ── Constants ──────────────────────────────────────────────────────────────
const MAX_BYTES = 6 * 1024 * 1024; // 6 MB

// ── Types ──────────────────────────────────────────────────────────────────

/** Word-level data từ Whisper verbose_json */
export interface WhisperWord {
  word: string;
  start: number; // seconds
  end: number; // seconds
}

/** Segment-level data — đây là nguồn confidence chính */
export interface WhisperSegment {
  id: number;
  start: number;
  end: number;
  text: string;
  avg_logprob: number; // < -0.4 → uncertain
  no_speech_prob: number; // > 0.3  → uncertain
  words?: WhisperWord[]; // có nếu Groq trả về word timestamps
}

/** Shape của response từ endpoint này */
export interface TranscribeResponse {
  transcript: string;
  segments: WhisperSegment[];
  avg_logprob_overall: number; // mean của toàn bộ segments
  no_speech_prob_max: number; // worst-case segment
  duration: number;
  unit_id: string;
  whisper_latency_ms: number;
}

// ── Groq client ────────────────────────────────────────────────────────────
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY ?? "",
  baseURL: "https://api.groq.com/openai/v1",
});

// ── POST /api/transcribe ───────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // 1. Auth guard
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse multipart FormData
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 422 });
  }

  const audioField = formData.get("audio");
  const unitId = formData.get("unit_id");

  // 3. Validate fields
  if (!audioField || !(audioField instanceof Blob)) {
    return NextResponse.json(
      { error: "Missing or invalid 'audio' field (must be a Blob/File)" },
      { status: 422 },
    );
  }
  if (!unitId || typeof unitId !== "string") {
    return NextResponse.json(
      { error: "Missing or invalid 'unit_id' field" },
      { status: 422 },
    );
  }

  // 4. Size guard
  if (audioField.size > MAX_BYTES) {
    return NextResponse.json(
      {
        error: "Audio file exceeds the 6 MB limit",
        size_bytes: audioField.size,
        limit_bytes: MAX_BYTES,
      },
      { status: 413 },
    );
  }

  // 5. Convert Blob → File
  const audioFile = new File([audioField], `recording_${unitId}.webm`, {
    type: audioField.type || "audio/webm",
  });

  // 6. Call Groq Whisper
  const startMs = Date.now();
  try {
    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-large-v3",
      response_format: "verbose_json",
      // language: "en" ← BỎ để Whisper auto-detect
      // Prompt giúp Whisper không "heal" lỗi của Vietnamese speaker
      prompt:
        "Vietnamese English learner answering IELTS Speaking questions. " +
        "Transcribe exactly what is said, including grammatical errors. " +
        "Do not correct mistakes.",
    });

    const whisperLatencyMs = Date.now() - startMs;

    // 7. Extract segments — đây là data quan trọng bị drop trước đây
    const rawSegments =
      (transcription as unknown as { segments?: WhisperSegment[] }).segments ??
      [];

    const segments: WhisperSegment[] = rawSegments.map((seg) => ({
      id: seg.id,
      start: seg.start,
      end: seg.end,
      text: seg.text,
      avg_logprob: seg.avg_logprob,
      no_speech_prob: seg.no_speech_prob,
      words: seg.words, // undefined nếu Groq không trả về
    }));

    // 8. Tính summary confidence metrics để client dùng ngay
    const avg_logprob_overall =
      segments.length > 0
        ? segments.reduce((sum, s) => sum + s.avg_logprob, 0) / segments.length
        : 0;

    const no_speech_prob_max =
      segments.length > 0
        ? Math.max(...segments.map((s) => s.no_speech_prob))
        : 0;

    const durationSec =
      (transcription as { duration?: number }).duration ??
      Math.round((Date.now() - startMs) / 1000);

    const response: TranscribeResponse = {
      transcript: transcription.text,
      segments, // ← MỚI: client dùng để highlight uncertain words
      avg_logprob_overall, // ← MỚI: nếu < -0.4 → toàn bộ clip low confidence
      no_speech_prob_max, // ← MỚI: nếu > 0.3 → có segment im lặng/noise
      duration: durationSec,
      unit_id: unitId,
      whisper_latency_ms: whisperLatencyMs, // ← MỚI: logging
    };

    return NextResponse.json(response);
  } catch (err: unknown) {
    if (isOpenAIError(err)) {
      const status = err.status ?? 500;
      if (status === 429)
        return NextResponse.json(
          { error: "Rate limit reached. Please try again shortly." },
          { status: 429 },
        );
      if (status === 413)
        return NextResponse.json(
          { error: "Audio payload too large for the upstream service." },
          { status: 413 },
        );
      if (status === 422 || status === 400)
        return NextResponse.json(
          { error: err.message ?? "Audio could not be processed." },
          { status: 422 },
        );
      return NextResponse.json(
        { error: err.message ?? "Transcription failed." },
        { status: 500 },
      );
    }
    console.error("[transcribe] unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}

// ── Type guard ─────────────────────────────────────────────────────────────
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
