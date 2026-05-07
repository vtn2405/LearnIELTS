"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";

// ── Types (mirror TranscribeResponse từ route.ts) ─────────────────────────
interface WhisperWord {
  word: string;
  start: number;
  end: number;
}

interface WhisperSegment {
  id: number;
  start: number;
  end: number;
  text: string;
  avg_logprob: number;
  no_speech_prob: number;
  words?: WhisperWord[];
}

interface TranscribeResponse {
  transcript: string;
  segments: WhisperSegment[];
  avg_logprob_overall: number;
  no_speech_prob_max: number;
  duration: number;
  unit_id: string;
  whisper_latency_ms: number;
}

interface ErrorLabel {
  span: string;
  type:
    | "grammar_error"
    | "vocabulary_error"
    | "possible_stt_error"
    | "pronunciation_proxy";
  explanation_vi: string;
  suggested_correction: string;
}

interface PronunciationDetails {
  overallScore: number;
  accuracyScore: number | null;
  fluencyScore: number | null;
  completenessScore: number | null;
  prosodyScore: number | null;
  words: Array<{ word: string; accuracyScore: number | null; errorType: string | null }>;
}

interface FeedbackResponse {
  band_estimate: number;
  criteria: {
    fluency: number;
    vocabulary: number;
    grammar: number;
    pronunciation: number | null; // number from Azure, null if unavailable
  };
  pronunciation_note: string;
  pronunciation_source: "azure" | "unavailable";
  pronunciation_details: PronunciationDetails | null;
  task_relevance: string;
  error_labels: ErrorLabel[];
  strengths_vi: string;
  improvements_vi: string[];
  model_answer_band7: string;
  upgraded_sentence: string;
  scholar_tip_vi: string;
}

// ── Constants ─────────────────────────────────────────────────────────────
const UNCERTAIN_LOGPROB_THRESHOLD = -0.4;
const UNCERTAIN_NO_SPEECH_THRESHOLD = 0.3;
const UNIT_ID = "unit-1"; // TODO: đọc từ searchParams khi multi-unit
const SPEAKING_PROMPT =
  "Describe your daily routine and how you balance study with other activities.";

type RecordingState = "idle" | "recording" | "stopped" | "transcribing";
type PageState = "record" | "confirm" | "feedback";

// ── Helpers ───────────────────────────────────────────────────────────────

/** Tính danh sách từ uncertain dựa trên segment confidence */
function computeUncertainWords(segments: WhisperSegment[]): Set<string> {
  const uncertain = new Set<string>();
  for (const seg of segments) {
    const isUncertain =
      seg.avg_logprob < UNCERTAIN_LOGPROB_THRESHOLD ||
      seg.no_speech_prob > UNCERTAIN_NO_SPEECH_THRESHOLD;
    if (isUncertain && seg.words) {
      seg.words.forEach((w) => uncertain.add(w.word.trim().toLowerCase()));
    } else if (isUncertain) {
      // Không có word-level data → mark toàn bộ segment words
      seg.text
        .trim()
        .split(/\s+/)
        .forEach((w) => uncertain.add(w.toLowerCase().replace(/[^a-z']/g, "")));
    }
  }
  return uncertain;
}

/** Màu badge theo error type */
function errorTypeStyle(type: ErrorLabel["type"]) {
  switch (type) {
    case "grammar_error":
      return { bg: "#fee2e2", text: "#b91c1c", label: "🔴 Ngữ pháp" };
    case "vocabulary_error":
      return { bg: "#dbeafe", text: "#1d4ed8", label: "🔵 Từ vựng" };
    case "possible_stt_error":
      return {
        bg: "#fef9c3",
        text: "#a16207",
        label: "🟡 Có thể do nhận dạng",
      };
    case "pronunciation_proxy":
      return {
        bg: "#ffedd5",
        text: "#c2410c",
        label: "🔶 Phát âm (chưa xác nhận)",
      };
  }
}

// ── Main Component ────────────────────────────────────────────────────────
export default function SpeakingPage() {
  // Recording state
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [recordingMs, setRecordingMs] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Amplitude visualiser
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const [amplitude, setAmplitude] = useState(0);

  // Page flow
  const [pageState, setPageState] = useState<PageState>("record");

  // Transcript data
  const [transcribeResult, setTranscribeResult] =
    useState<TranscribeResponse | null>(null);
  const [uncertainWords, setUncertainWords] = useState<Set<string>>(new Set());
  const [confirmedTranscript, setConfirmedTranscript] = useState("");
  const [transcribeError, setTranscribeError] = useState<string | null>(null);

  // Feedback
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // Store the recorded audio blob so we can send it for pronunciation scoring
  const audioBlobRef = useRef<Blob | null>(null);
  // AudioContext ref — closed in cleanup to avoid resource leak
  const audioCtxRef = useRef<AudioContext | null>(null);

  // ── Amplitude animation ────────────────────────────────────────────────
  const startAmplitudeLoop = useCallback((analyser: AnalyserNode) => {
    const buf = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i++) {
        const v = (buf[i] - 128) / 128;
        sum += v * v;
      }
      setAmplitude(Math.sqrt(sum / buf.length));
      animFrameRef.current = requestAnimationFrame(tick);
    };
    animFrameRef.current = requestAnimationFrame(tick);
  }, []);

  const stopAmplitudeLoop = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setAmplitude(0);
  }, []);

  // ── Start recording ────────────────────────────────────────────────────
  const handleRecord = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Web Audio analyser
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      startAmplitudeLoop(analyser);

      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      audioChunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorderRef.current = mr;
      mr.start(200);

      setRecordingState("recording");
      setRecordingMs(0);
      timerRef.current = setInterval(() => setRecordingMs((p) => p + 100), 100);

      // Reset previous results
      setTranscribeResult(null);
      setTranscribeError(null);
      setFeedback(null);
      setFeedbackError(null);
      setPageState("record");
    } catch {
      setTranscribeError(
        "Không thể truy cập microphone. Vui lòng cấp quyền và thử lại.",
      );
    }
  }, [startAmplitudeLoop]);

  // ── Stop recording → transcribe ────────────────────────────────────────
  const handleStop = useCallback(() => {
    const mr = mediaRecorderRef.current;
    if (!mr) return;

    mr.onstop = async () => {
      stopAmplitudeLoop();
      streamRef.current?.getTracks().forEach((t) => t.stop());

      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      audioBlobRef.current = blob; // save for pronunciation assessment
      setRecordingState("transcribing");

      try {
        const fd = new FormData();
        fd.append("audio", blob, "recording.webm");
        fd.append("unit_id", UNIT_ID);

        const res = await fetch("/api/transcribe", {
          method: "POST",
          body: fd,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Transcription failed");
        }

        const data: TranscribeResponse = await res.json();
        setTranscribeResult(data);
        setConfirmedTranscript(data.transcript);

        const uncertain = computeUncertainWords(data.segments);
        setUncertainWords(uncertain);

        setRecordingState("stopped");
        setPageState("confirm");
      } catch (err: unknown) {
        setTranscribeError(
          err instanceof Error ? err.message : "Lỗi không xác định.",
        );
        setRecordingState("idle");
      }
    };

    mr.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    setRecordingState("stopped");
  }, [stopAmplitudeLoop]);

  // ── Submit confirmed transcript → feedback ─────────────────────────────
  const handleSubmitForFeedback = useCallback(async () => {
    if (!confirmedTranscript.trim()) return;

    const sttUncertainSpans =
      transcribeResult?.segments
        .filter(
          (s) =>
            s.avg_logprob < UNCERTAIN_LOGPROB_THRESHOLD ||
            s.no_speech_prob > UNCERTAIN_NO_SPEECH_THRESHOLD,
        )
        .map((s) => s.text.trim()) ?? [];

    setFeedbackLoading(true);
    setFeedbackError(null);

    try {
      // ── [DEBUG] Blob diagnostic ──────────────────────────────────────
      const blob = audioBlobRef.current;
      console.log("[speaking-feedback] 🎙 audioBlobRef present:", blob !== null);
      if (blob) {
        console.log("[speaking-feedback] 🎙 blob.size =", blob.size, "bytes");
        console.log("[speaking-feedback] 🎙 blob.type =", blob.type);
      } else {
        console.warn(
          "[speaking-feedback] ⚠️ audioBlobRef is NULL — audio was never recorded or ref was cleared.",
        );
      }
      // ────────────────────────────────────────────────────────────────

      // Guard: audio is required for pronunciation assessment.
      // If the blob is somehow missing, surface an explicit error so the
      // user records again rather than silently falling back to text-only.
      if (!blob || blob.size === 0) {
        throw new Error(
          "Không tìm thấy file âm thanh. Vui lòng ghi âm lại trước khi nộp.",
        );
      }

      // Always convert Blob → File so filename + MIME are explicit
      const audioFile =
        blob instanceof File
          ? blob
          : new File([blob], "recording.webm", { type: "audio/webm" });

      const metaPayload = JSON.stringify({
        transcript: confirmedTranscript,        // backup for Whisper failure
        stt_uncertain_spans: sttUncertainSpans,
        speaking_prompt: SPEAKING_PROMPT,
        unitId: UNIT_ID,
        targetBand: 6.0,
        grammarTargets: ["simple present", "subject-verb agreement"],
      });

      const fd = new FormData();
      fd.append("audio", audioFile, "recording.webm");
      fd.append("meta", metaPayload);

      // ── [DEBUG] FormData diagnostic ──────────────────────────────────
      console.log("[speaking-feedback] 📦 FormData 'audio' set:", fd.get("audio") !== null);
      console.log("[speaking-feedback] 📦 FormData 'meta' set:", fd.get("meta") !== null);
      console.log("[speaking-feedback] 📦 meta payload:", metaPayload);
      // DO NOT manually set Content-Type — browser must set multipart boundary.
      // ────────────────────────────────────────────────────────────────

      const res = await fetch("/api/ai/speaking-drill-feedback", {
        method: "POST",
        body: fd,
        // ⚠️ No 'headers' here — let the browser set Content-Type: multipart/form-data; boundary=...
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Feedback failed");
      }

      const data: FeedbackResponse = await res.json();
      setFeedback(data);
      setPageState("feedback");
    } catch (err: unknown) {
      setFeedbackError(
        err instanceof Error ? err.message : "Lỗi không xác định.",
      );
    } finally {
      setFeedbackLoading(false);
    }
  }, [confirmedTranscript, transcribeResult]);

  // ── Reset ──────────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setPageState("record");
    setRecordingState("idle");
    setTranscribeResult(null);
    setConfirmedTranscript("");
    setUncertainWords(new Set());
    setFeedback(null);
    setFeedbackError(null);
    setTranscribeError(null);
    setRecordingMs(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopAmplitudeLoop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      audioCtxRef.current?.close();
    };
  }, [stopAmplitudeLoop]);

  // ── Format timer ───────────────────────────────────────────────────────
  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m}:${String(s % 60).padStart(2, "0")}`;
  };

  // ── Render transcript with uncertain word highlighting ─────────────────
  const renderHighlightedTranscript = (text: string) => {
    const words = text.split(/(\s+)/);
    return words.map((token, i) => {
      const clean = token
        .trim()
        .toLowerCase()
        .replace(/[^a-z']/g, "");
      const isUncertain = clean && uncertainWords.has(clean);
      if (isUncertain) {
        return (
          <mark
            key={i}
            style={{
              background: "#fef08a",
              borderBottom: "2px dashed #ca8a04",
              color: "#713f12",
              borderRadius: "2px",
              padding: "0 1px",
            }}
            title="Whisper không chắc chắn về từ này"
          >
            {token}
          </mark>
        );
      }
      return <span key={i}>{token}</span>;
    });
  };

  // ── Uncertain word count ───────────────────────────────────────────────
  const totalWords =
    transcribeResult?.transcript.trim().split(/\s+/).length ?? 0;
  const uncertainCount =
    transcribeResult?.transcript
      .trim()
      .split(/\s+/)
      .filter((w) =>
        uncertainWords.has(w.toLowerCase().replace(/[^a-z']/g, "")),
      ).length ?? 0;

  // ── Score bar component ────────────────────────────────────────────────
  const ScoreBar = ({
    label,
    score,
    disabled,
    note,
  }: {
    label: string;
    score: number | null;
    disabled?: boolean;
    note?: string;
  }) => (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-slate-600">{label}</span>
        {score !== null ? (
          <span className="text-sm font-bold text-slate-800">
            {score.toFixed(1)}
          </span>
        ) : (
          <span className="text-xs text-slate-400 italic">
            Chưa thể đánh giá
          </span>
        )}
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100">
        <div
          className="h-2 rounded-full transition-all duration-700"
          style={{
            width: score !== null ? `${((score - 4) / 5) * 100}%` : "0%",
            background: disabled
              ? "#cbd5e1"
              : score !== null && score >= 7
                ? "#10b981"
                : score !== null && score >= 5.5
                  ? "#f59e0b"
                  : "#ef4444",
          }}
        />
      </div>
      {note && <p className="mt-1 text-[10px] text-slate-400 italic">{note}</p>}
    </div>
  );

  // ── JSX ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-full px-8 py-7 space-y-6">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Quay lại danh sách bài học
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Speaking Practice
        </h1>
        <p className="mt-1 text-sm text-slate-500 max-w-2xl">
          <span className="font-semibold text-slate-700">Câu hỏi: </span>
          {SPEAKING_PROMPT}
        </p>
      </div>

      {/* ── STEP 1: RECORD ── */}
      {pageState === "record" && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
            <div className="flex items-center gap-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#475569"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
              </svg>
              <h2 className="text-sm font-bold text-slate-800">Ghi âm</h2>
            </div>
            {recordingState === "recording" && (
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-bold text-red-500 tabular-nums">
                  {formatTime(recordingMs)}
                </span>
              </div>
            )}
          </div>

          {/* Amplitude visualiser */}
          <div className="flex items-center justify-center gap-5 py-10 bg-slate-50">
            {/* Waveform bars */}
            <div className="flex items-end gap-[3px] h-10">
              {Array.from({ length: 20 }).map((_, i) => {
                const base = 0.08;
                const wave =
                  recordingState === "recording"
                    ? base + amplitude * (0.5 + 0.5 * Math.sin(i * 0.8))
                    : base;
                return (
                  <div
                    key={i}
                    style={{
                      width: 4,
                      height: `${Math.min(100, wave * 200)}%`,
                      background:
                        recordingState === "recording" ? "#1a3a5c" : "#cbd5e1",
                      borderRadius: 2,
                      transition: "height 0.08s ease",
                    }}
                  />
                );
              })}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleRecord}
                disabled={
                  recordingState === "recording" ||
                  recordingState === "transcribing"
                }
                className="flex flex-col items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="grid h-14 w-14 place-items-center rounded-full bg-[#1a3a5c] text-white shadow-lg hover:bg-[#15304f] transition">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
                  </svg>
                </span>
                <span className="text-xs font-medium text-slate-600">
                  Ghi âm
                </span>
              </button>

              <button
                onClick={handleStop}
                disabled={recordingState !== "recording"}
                className="flex flex-col items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="grid h-14 w-14 place-items-center rounded-full bg-slate-200 text-slate-600 shadow hover:bg-slate-300 transition">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <rect x="4" y="4" width="16" height="16" rx="2" />
                  </svg>
                </span>
                <span className="text-xs font-medium text-slate-600">Dừng</span>
              </button>
            </div>
          </div>

          {/* Status */}
          <div className="border-t-2 border-teal-400 bg-white px-5 py-4 min-h-[60px]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600 mb-1">
              Trạng thái
            </p>
            {recordingState === "idle" && (
              <p className="text-xs text-slate-400">
                Bấm <strong>Ghi âm</strong> để bắt đầu. Hãy nói rõ ràng trong
                phòng yên tĩnh.
              </p>
            )}
            {recordingState === "recording" && (
              <p className="text-xs text-slate-600 font-medium">
                🎙 Đang ghi âm — Bấm Dừng khi bạn hoàn thành.
              </p>
            )}
            {recordingState === "transcribing" && (
              <p className="text-xs text-slate-600 font-medium animate-pulse">
                ⏳ Đang nhận dạng giọng nói...
              </p>
            )}
            {transcribeError && (
              <p className="text-xs text-red-600 font-medium">
                ⚠ {transcribeError}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── STEP 2: CONFIRM TRANSCRIPT ── */}
      {pageState === "confirm" && transcribeResult && (
        <div className="rounded-2xl border border-amber-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-amber-100 bg-amber-50 px-5 py-3">
            <div className="flex items-center gap-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#b45309"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              <h2 className="text-sm font-bold text-amber-800">
                Kiểm tra lại trước khi chấm điểm
              </h2>
            </div>
            {/* Confidence badge */}
            <div className="flex items-center gap-1.5 text-xs">
              <span
                className="rounded-full px-2.5 py-0.5 font-semibold"
                style={{
                  background: uncertainCount === 0 ? "#dcfce7" : "#fef9c3",
                  color: uncertainCount === 0 ? "#15803d" : "#a16207",
                }}
              >
                Nhận rõ: {totalWords - uncertainCount}/{totalWords} từ
                {uncertainCount > 0 && ` — ${uncertainCount} từ chưa chắc`}
              </span>
            </div>
          </div>

          {/* Transcript display */}
          <div className="px-5 pt-4 pb-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
              Transcript (
              <span className="text-amber-600">
                nền vàng = Whisper không chắc chắn
              </span>
              )
            </p>
            <p className="text-sm leading-7 text-slate-700">
              {renderHighlightedTranscript(transcribeResult.transcript)}
            </p>
          </div>

          {/* Editable confirmed transcript */}
          <div className="px-5 pb-4 pt-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
              Sửa lại nếu cần (bản này sẽ được chấm điểm)
            </p>
            <textarea
              value={confirmedTranscript}
              onChange={(e) => setConfirmedTranscript(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition"
            />
          </div>

          {/* Low confidence warning */}
          {transcribeResult.avg_logprob_overall <
            UNCERTAIN_LOGPROB_THRESHOLD && (
            <div className="mx-5 mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-xs text-amber-700 font-medium">
                ⚠ Chất lượng âm thanh thấp — hệ thống nhận dạng chỉ tin cậy một
                phần. Hãy kiểm tra kỹ transcript và sửa lỗi nhận dạng trước khi
                nộp.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 border-t border-slate-100 px-5 py-4">
            <button
              onClick={handleSubmitForFeedback}
              disabled={feedbackLoading || !confirmedTranscript.trim()}
              className="rounded-xl bg-[#1a3a5c] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#15304f] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {feedbackLoading ? "Đang phân tích..." : "Nộp để chấm điểm →"}
            </button>
            <button
              onClick={handleReset}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              🎙 Ghi âm lại
            </button>
          </div>

          {feedbackError && (
            <div className="mx-5 mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-xs text-red-700">⚠ {feedbackError}</p>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 3: FEEDBACK ── */}
      {pageState === "feedback" && feedback && (
        <>
          {/* Band + Scores */}
          <div className="rounded-2xl border border-[#1a3a5c] overflow-hidden">
            <div className="flex items-center justify-between bg-[#1a3a5c] px-6 py-3">
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-white/10">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 19.07a10 10 0 0 1 0-14.14" />
                  </svg>
                </div>
                <h2 className="text-sm font-bold text-white">
                  AI Feedback & Analysis
                </h2>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-300">Ngữ pháp + Từ vựng</p>
                <p className="text-2xl font-extrabold text-white">
                  Band {feedback.band_estimate.toFixed(1)}
                </p>
              </div>
            </div>

            <div className="grid bg-white lg:grid-cols-4 divide-x divide-slate-100">
              {/* Scores */}
              <div className="px-5 py-5 lg:col-span-1">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                  Điểm thành phần
                </h3>
                <ScoreBar label="Fluency" score={feedback.criteria.fluency} />
                <ScoreBar
                  label="Vocabulary"
                  score={feedback.criteria.vocabulary}
                />
                <ScoreBar label="Grammar" score={feedback.criteria.grammar} />
                <ScoreBar
                  label="Pronunciation"
                  score={feedback.criteria.pronunciation}
                  disabled={feedback.pronunciation_source === "unavailable"}
                  note={feedback.pronunciation_note}
                />
              </div>

              {/* Error labels */}
              <div className="px-5 py-5 lg:col-span-2">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                  Phân tích lỗi
                </h3>
                {feedback.error_labels.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    Không phát hiện lỗi rõ ràng trong confirmed transcript.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {feedback.error_labels.map((err, i) => {
                      const style = errorTypeStyle(err.type);
                      return (
                        <div
                          key={i}
                          className="rounded-xl border border-slate-100 p-3"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                              style={{
                                background: style.bg,
                                color: style.text,
                              }}
                            >
                              {style.label}
                            </span>
                            <code className="text-xs text-red-700 bg-red-50 px-1.5 py-0.5 rounded">
                              &ldquo;{err.span}&rdquo;
                            </code>
                          </div>
                          <p className="text-xs text-slate-600">
                            {err.explanation_vi}
                          </p>
                          {err.suggested_correction && (
                            <p className="mt-1 text-xs text-teal-700 font-medium">
                              → {err.suggested_correction}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Improvements + Tip */}
              <div className="px-5 py-5 lg:col-span-1">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                  Cần cải thiện
                </h3>
                <ul className="space-y-2 mb-5">
                  {feedback.improvements_vi.map((tip, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs text-slate-600"
                    >
                      <span className="mt-0.5 text-amber-500 font-bold">
                        {i + 1}.
                      </span>
                      {tip}
                    </li>
                  ))}
                </ul>

                <div className="rounded-xl border border-teal-100 bg-teal-50 px-3 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600 mb-1">
                    Scholar Tip
                  </p>
                  <p className="text-xs text-slate-600">
                    {feedback.scholar_tip_vi}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Strengths */}
          {feedback.strengths_vi && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-1">
                Điểm mạnh
              </p>
              <p className="text-sm text-slate-700">{feedback.strengths_vi}</p>
            </div>
          )}

          {/* Model Answer */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm px-5 py-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="rounded-full bg-[#1a3a5c] px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-widest">
                Câu trả lời mẫu Band 7
              </span>
              {feedback.task_relevance === "cannot_assess" && (
                <span className="text-[10px] text-amber-600 italic">
                  ⚠ Mô hình không nhận được câu hỏi — câu mẫu có thể không đúng
                  chủ đề
                </span>
              )}
            </div>
            <p className="text-sm leading-7 text-slate-700 italic">
              &ldquo;{feedback.model_answer_band7}&rdquo;
            </p>
          </div>

          {/* Upgraded sentence */}
          {feedback.upgraded_sentence && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm px-5 py-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                Câu của bạn → nâng cấp lên Band{" "}
                {(Math.ceil(feedback.band_estimate) + 1).toFixed(0)}
              </p>
              <p className="text-sm text-teal-700 font-medium">
                &ldquo;{feedback.upgraded_sentence}&rdquo;
              </p>
            </div>
          )}

          {/* Retry */}
          <div className="flex justify-center pb-4">
            <button
              onClick={handleReset}
              className="rounded-2xl bg-[#1a3a5c] px-8 py-3 text-sm font-bold text-white hover:bg-[#15304f] transition-colors shadow-lg"
            >
              🎙 Ghi âm lại
            </button>
          </div>
        </>
      )}
    </div>
  );
}
