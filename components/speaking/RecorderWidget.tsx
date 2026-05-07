"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ── Constants ──────────────────────────────────────────────────────────────
const BAR_COUNT = 20;
const MIME_TYPES = ["audio/webm;codecs=opus", "audio/mp4"];
const MAX_RECORD_MS = 120_000; // 2 min hard cap

function getSupportedMimeType(): string {
  for (const mt of MIME_TYPES) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(mt)) {
      return mt;
    }
  }
  return "";
}

// ── State machine ──────────────────────────────────────────────────────────
type RecorderState = "IDLE" | "RECORDING" | "PROCESSING" | "DONE";

// ── Public props ───────────────────────────────────────────────────────────
export interface RecorderResult {
  transcript: string;
  duration: number;
  audioBlob: Blob;
}

export interface RecorderWidgetProps {
  unitId: string;
  /** Called when transcription succeeds */
  onResult?: (result: RecorderResult) => void;
  /** Called when user clicks "Tôi muốn gõ thay vì nói" */
  onTypeInstead?: () => void;
  /** Extra className wrapper */
  className?: string;
}

// ── Component ──────────────────────────────────────────────────────────────
export function RecorderWidget({
  unitId,
  onResult,
  onTypeInstead,
  className = "",
}: RecorderWidgetProps) {
  const [recState, setRecState] = useState<RecorderState>("IDLE");
  const [bars, setBars] = useState<number[]>(Array(BAR_COUNT).fill(0));
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0); // seconds

  // Refs — never trigger re-render
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hardCapRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Waveform animation loop ──────────────────────────────────────────────
  const startWaveform = useCallback((analyser: AnalyserNode) => {
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      analyser.getByteFrequencyData(dataArray);
      // Sample BAR_COUNT evenly-spaced frequency bins
      const step = Math.floor(dataArray.length / BAR_COUNT);
      const next = Array.from({ length: BAR_COUNT }, (_, i) => {
        const v = dataArray[i * step] ?? 0;
        return Math.round((v / 255) * 100); // 0–100 %
      });
      setBars(next);
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
  }, []);

  const stopWaveform = useCallback(() => {
    if (animRef.current !== null) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
    setBars(Array(BAR_COUNT).fill(0));
  }, []);

  // ── Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopWaveform();
      if (timerRef.current) clearInterval(timerRef.current);
      if (hardCapRef.current) clearTimeout(hardCapRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [stopWaveform]);

  // ── Start recording ──────────────────────────────────────────────────────
  const startRecording = useCallback(async () => {
    setError(null);
    setElapsed(0);
    chunksRef.current = [];

    // 1. Get mic
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("Không thể truy cập micro. Hãy cấp quyền và thử lại.");
      return;
    }
    streamRef.current = stream;

    // 2. Wire up Web Audio analyser
    const ctx = new AudioContext();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyserRef.current = analyser;

    // 3. Create MediaRecorder
    const mimeType = getSupportedMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
    mediaRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = async () => {
      stopWaveform();
      stream.getTracks().forEach((t) => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);
      if (hardCapRef.current) clearTimeout(hardCapRef.current);

      const blob = new Blob(chunksRef.current, {
        type: mimeType || "audio/webm",
      });
      await sendToApi(blob);
    };

    recorder.start(100); // collect chunks every 100 ms
    setRecState("RECORDING");
    startWaveform(analyser);

    // Elapsed timer
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);

    // Hard cap
    hardCapRef.current = setTimeout(() => {
      if (mediaRef.current?.state === "recording") mediaRef.current.stop();
    }, MAX_RECORD_MS);
  }, [startWaveform, stopWaveform]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Stop recording ───────────────────────────────────────────────────────
  const stopRecording = useCallback(() => {
    if (mediaRef.current?.state === "recording") {
      setRecState("PROCESSING");
      mediaRef.current.stop();
    }
  }, []);

  // ── Send to /api/transcribe ──────────────────────────────────────────────
  const sendToApi = useCallback(
    async (blob: Blob) => {
      const form = new FormData();
      form.append("audio", blob, "recording.webm");
      form.append("unit_id", unitId);

      try {
        const res = await fetch("/api/transcribe", { method: "POST", body: form });

        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error ?? `HTTP ${res.status}`);
        }

        const data = (await res.json()) as { transcript: string; duration: number };
        setRecState("DONE");
        onResult?.({ transcript: data.transcript, duration: data.duration, audioBlob: blob });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Transcription thất bại.";
        setError(msg);
        setRecState("IDLE");
      }
    },
    [unitId, onResult]
  );

  // ── Retry ────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    setRecState("IDLE");
    setError(null);
    setElapsed(0);
    setBars(Array(BAR_COUNT).fill(0));
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={`flex flex-col items-center gap-5 ${className}`}>

      {/* ── Waveform ── */}
      <div
        aria-hidden="true"
        className="flex items-end gap-[3px] h-14 w-full max-w-xs"
      >
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-full transition-all duration-75"
            style={{
              height: `${Math.max(4, h)}%`,
              background:
                recState === "RECORDING"
                  ? `hsl(${170 + i * 2}, 70%, 45%)`
                  : recState === "PROCESSING"
                  ? "#94a3b8"
                  : "#e2e8f0",
            }}
          />
        ))}
      </div>

      {/* ── Status label ── */}
      <div className="flex items-center gap-2 h-6">
        {recState === "IDLE" && (
          <span className="text-sm text-slate-400">Nhấn để bắt đầu ghi âm</span>
        )}
        {recState === "RECORDING" && (
          <>
            {/* Pulsing red dot */}
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
            </span>
            <span className="text-sm font-semibold text-red-600 tabular-nums">
              Đang ghi — {formatTime(elapsed)}
            </span>
          </>
        )}
        {recState === "PROCESSING" && (
          <>
            <svg
              className="h-4 w-4 animate-spin text-teal-600"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span className="text-sm font-medium text-teal-700">
              Đang phân tích giọng nói…
            </span>
          </>
        )}
        {recState === "DONE" && (
          <>
            <svg className="h-4 w-4 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="text-sm font-semibold text-emerald-700">Hoàn thành!</span>
          </>
        )}
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600 w-full max-w-xs">
          <svg className="h-4 w-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* ── Main action button ── */}
      {recState === "IDLE" && (
        <button
          id="recorder-start-btn"
          onClick={startRecording}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1a3a5c] text-white shadow-lg
                     hover:bg-[#15304f] active:scale-95 transition-all duration-150"
          aria-label="Bắt đầu ghi âm"
        >
          {/* Mic icon */}
          <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
        </button>
      )}

      {recState === "RECORDING" && (
        <button
          id="recorder-stop-btn"
          onClick={stopRecording}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white shadow-lg
                     hover:bg-red-600 active:scale-95 transition-all duration-150
                     ring-4 ring-red-200 animate-pulse"
          aria-label="Dừng ghi âm"
        >
          {/* Stop square */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <rect x="4" y="4" width="16" height="16" rx="2" />
          </svg>
        </button>
      )}

      {recState === "PROCESSING" && (
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100"
          aria-label="Đang xử lý"
        >
          <svg className="h-7 w-7 animate-spin text-teal-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
      )}

      {recState === "DONE" && (
        <button
          id="recorder-retry-btn"
          onClick={reset}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5
                     text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
          aria-label="Thử lại"
        >
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <polyline points="1 4 1 10 7 10"/>
            <path d="M3.51 15a9 9 0 1 0 .49-4.95"/>
          </svg>
          Ghi lại
        </button>
      )}

      {/* ── "Tôi muốn gõ thay vì nói" — luôn hiển thị ── */}
      <button
        id="recorder-type-instead-btn"
        onClick={onTypeInstead}
        disabled={recState === "PROCESSING"}
        className="mt-1 text-[13px] text-slate-400 underline underline-offset-2
                   hover:text-slate-600 disabled:pointer-events-none disabled:opacity-40
                   transition-colors"
      >
        Tôi muốn gõ thay vì nói
      </button>
    </div>
  );
}
