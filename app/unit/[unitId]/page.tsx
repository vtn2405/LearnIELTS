"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useUserId } from "@/lib/useUserId";
import { unit as unitSimplePresent } from "@/src/lib/content/units/unit-1-simple-present";
import grammarUnitsRaw from "@/app/grammar/grammar-units.json";
import type { WhisperSegment } from "@/app/api/transcribe/route";


type Stage = "theory" | "practice" | "apply" | "speak" | "complete";

interface SpeakingErrorLabel {
  type: string;
  span: string;
  explanation_vi: string;
  suggested_correction: string;
}

interface SpeakingFeedback {
  band_estimate: number;
  criteria?: {
    fluency?: number;
    vocabulary?: number;
    grammar?: number;
    pronunciation?: number;
  };
  strengths_vi: string;
  improvements_vi: string[];
  model_answer_band7: string;
  scholar_tip_vi: string;
  upgraded_sentence?: string;
  pronunciation_note?: string;
  task_relevance?: string;
  error_labels?: SpeakingErrorLabel[];
}

interface ContrastExample {
  wrong?: string;
  incorrect?: string;
  correct: string;
  tipVi?: string;
  tip_vi?: string;
  bandImpact?: string;
  band_impact?: string;
  explanationVi?: string;
}

interface Exercise {
  id: string;
  type: string;
  skill: string;
  question: string;
  options?: string[] | string;
  // JSON camelCase
  correctAnswer?: string;
  feedbackCorrect?: string;
  feedbackWrong?: string;
  ieltsTip?: string;
  // snake_case fallback (unit-1-simple-present)
  correct_answer?: string;
  feedback_correct?: string;
  feedback_wrong?: string;
  ielts_tip?: string;
}

interface WritingFeedback {
  band_estimate: number;
  encouragement?: string;
  criteria?: { ta?: number; cc?: number; lr?: number; gra?: number };
  grammar_used_correctly?: boolean;
  errors: Array<{
    original: string;
    correction: string;
    rule_vi: string;
    category: string;
  }>;
  vocab_upgrades?: Array<{
    original: string;
    upgraded: string;
    register: "academic" | "precise" | "formal";
  }>;
  cohesion?: {
    has_linking_words: boolean;
    found: string[];
    missing_suggestions: string[];
    verdict_vi: string;
  };
  improvement_tips?: string[];
  upgraded_sentence?: {
    original: string;
    upgraded: string;
    changes_vi: string;
  };
}

interface CorrectionState {
  attempt: string;
  loading: boolean;
  result: { ok: boolean; hint?: string } | null;
}

interface UnitData {
  id: string;
  title: string;
  subtitle?: string;
  // JSON camelCase
  bandTarget?: number;
  bandMin?: number;
  // snake_case fallback
  band_target?: number;
  theory: {
    coreRule?: string;
    description?: string;
    // Formation chỉ có trong unit-1-simple-present
    formation?: { affirmative: string; negative: string; question: string };
    contrastExamples?: ContrastExample[];
    contrast_examples?: ContrastExample[];
    keyPoints?: string[];
    key_points?: string[];
    quickExamples?: Array<{ en: string; vi: string }>;
  };
  exercises: { items: Exercise[]; xpPerCorrect?: number };
  apply: {
    // camelCase (JSON)
    writingMini?: {
      prompt: string;
      placeholder?: string;
      wordLimit?: number;
      word_limit?: number;
      grammarMustUse?: string | string[];
      grammar_must_use?: string[];
      modelBand?: number;
      model_band?: number;
      modelAnswer?: string;
      model_answer?: string;
    };
    speakingDrill?: {
      prompt: string;
      timeLimit?: number;
      time_limit?: number;
      grammarTargets?: string[];
      grammar_targets?: string[];
    };
    // snake_case fallback
    writing_mini?: {
      prompt: string;
      placeholder?: string;
      word_limit: number;
      grammar_must_use: string[];
      model_band: number;
      model_answer: string;
    };
    speaking_drill?: {
      prompt: string;
      time_limit: number;
      grammar_targets: string[];
    };
  };
  completion: {
    // camelCase (JSON)
    xpReward?: number;
    nextUnitId?: string | null;
    nextUnitTitle?: string | null;
    nextUnitConnection?: string;
    // snake_case fallback
    xp_reward?: number;
    next_unit_id?: string | null;
    next_unit_title?: string | null;
    next_unit_connection?: string;
    badge?: { icon?: string; name?: string; description_vi?: string };
  };
}

const STAGES: Stage[] = ["theory", "practice", "apply", "speak", "complete"];

const STAGE_LABELS: Record<Stage, string> = {
  theory: "Theory",
  practice: "Practice",
  apply: "Apply",
  speak: "Speak",
  complete: "Complete",
};

const PRACTICE_XP_TARGET = 50;

const UNIT_TITLE_MAP: Record<string, string> = Object.fromEntries(
  (grammarUnitsRaw as Array<{ id: string; title: string }>).map((u) => [
    u.id,
    u.title,
  ]),
);

function getNextUnitFromRoadmap(unitId: string): string | null {
  const units = grammarUnitsRaw as Array<{ id: string }>;
  const idx = units.findIndex((u) => u.id === unitId);
  if (idx === -1 || idx === units.length - 1) return null;
  return units[idx + 1].id;
}

function inferFormation(unitId: string): {
  affirmative: string;
  negative: string;
  question: string;
} | null {
  // All units now carry formation data in grammar-units.json.
  // This function is only a safety net for units added without formation.
  void unitId;
  return null;
}

// inferFormation is available for future use with unit-specific formation data

export default function UnitPage() {
  const { unitId } = useParams<{ unitId: string }>();
  const router = useRouter();
  const userId = useUserId();

  const [stage, setStage] = useState<Stage>("theory");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showStepper, setShowStepper] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unitData, setUnitData] = useState<UnitData | null>(null);
  const [exStates, setExStates] = useState<
    Record<
      string,
      { selectedOption: string | null; isSubmitted: boolean; xpAwarded?: number }
    >
  >({});
  const [sessionXp, setSessionXp] = useState(0);
  const [xpPopups, setXpPopups] = useState<
    Array<{ id: number; amount: number; label: string }>
  >([]);

  // Writing
  const [writingDraft, setWritingDraft] = useState("");
  const [writingFeedback, setWritingFeedback] = useState<WritingFeedback | null>(null);
  const [writingFeedbackLoading, setWritingFeedbackLoading] = useState(false);
  const [writingFeedbackError, setWritingFeedbackError] = useState<string | null>(null);
  const [correctionStates, setCorrectionStates] = useState<Record<number, CorrectionState>>({});

  // Speaking
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [speakingStep, setSpeakingStep] = useState<
    "idle" | "transcribing" | "confirming" | "analysing" | "done"
  >("idle");

  const [speakingTranscript, setSpeakingTranscript] = useState("");
  const [speakingSegments, setSpeakingSegments] = useState<WhisperSegment[] | null>(null);
  const [speakingAvgLogprob, setSpeakingAvgLogprob] = useState<number>(0);
  const [speakingNoSpeechMax, setSpeakingNoSpeechMax] = useState<number>(0);

  const [speakingFeedback, setSpeakingFeedback] = useState<SpeakingFeedback | null>(null);
  const [speakingError, setSpeakingError] = useState<string | null>(null);
  const [speakingAudioUrl, setSpeakingAudioUrl] = useState<string | null>(null);
  const [confirmedSpeakingTranscript, setConfirmedSpeakingTranscript] = useState<string | null>(null);
  const [completionGateMessage, setCompletionGateMessage] = useState<string | null>(null);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pipelineRef = useRef<(blob: Blob) => Promise<void>>(async () => {});
  const stepperTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completionXpAwarded = useRef(false);
  const processedExerciseXp = useRef(new Set<string>());
  // Store recorded audio blob for pronunciation assessment
  const speakingAudioBlobRef = useRef<Blob | null>(null);

  // Load unit data
  useEffect(() => {
    async function loadUnit() {
      setLoading(true);
      setError(null);
      try {
        const units = grammarUnitsRaw as Array<{ id: string }>;
        const found = (units as Array<Record<string, unknown>>).find(
          (u) => u.id === unitId,
        );
        if (found) {
          setUnitData(found as unknown as UnitData);
        } else if (unitId === "unit-1-simple-present") {
          setUnitData(unitSimplePresent as unknown as UnitData);
        } else {
          setError(`Unit "${unitId}" not found.`);
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load unit.");
      } finally {
        setLoading(false);
      }
    }
    if (unitId) loadUnit();
  }, [unitId]);

  // Select option for exercises
  const selectOption = useCallback((exId: string, option: string) => {
    setExStates((prev) => ({
      ...prev,
      [exId]: {
        ...prev[exId],
        selectedOption: option,
        isSubmitted: false,
      },
    }));
  }, []);

  // Submit exercise and mark correct/wrong
  const submitExercise = useCallback((exId: string, correctAnswer: string) => {
    setExStates((prev) => {
      const current = prev[exId];
      if (!current || current.isSubmitted) return prev;
      const isCorrect = current.selectedOption === correctAnswer;
      return {
        ...prev,
        [exId]: {
          ...current,
          isSubmitted: true,
          xpAwarded: isCorrect ? 10 : 0,
        },
      };
    });
  }, []);

  // Award XP with floating popup
  const awardXp = useCallback((amount: number, label: string = "") => {
    setSessionXp((prev) => prev + amount);
    const id = Date.now() + Math.random();
    setXpPopups((prev) => [
      ...prev,
      { id: Math.floor(id), amount, label },
    ]);
    setTimeout(() => {
      setXpPopups((prev) => prev.filter((p) => p.id !== Math.floor(id)));
    }, 2000);
  }, []);





  // Award XP once per exercise after state commit (safe in React Strict Mode)
  useEffect(() => {
    Object.entries(exStates).forEach(([exId, exState]) => {
      if (exState.xpAwarded === undefined) return;
      if (processedExerciseXp.current.has(exId)) return;

      processedExerciseXp.current.add(exId);
      const label = exState.xpAwarded >= 10 ? "Chính xác!" : "";
      awardXp(exState.xpAwarded, label);
    });
  }, [exStates, awardXp]);

  const totalExercises = unitData?.exercises?.items?.length ?? 0;
  const submittedExercises = Object.values(exStates).filter(
    (ex) => ex.isSubmitted,
  ).length;
  const correctExercises = Object.values(exStates).filter(
    (ex) => ex.isSubmitted && ex.xpAwarded === 10,
  ).length;
  const practiceXpEarned = Object.values(exStates).reduce(
    (sum, ex) => sum + (ex.xpAwarded ?? 0),
    0,
  );
  const hasPerfectPractice =
    totalExercises > 0 && correctExercises === totalExercises;
  const canCompleteUnit =
    hasPerfectPractice &&
    practiceXpEarned >= PRACTICE_XP_TARGET &&
    submittedExercises === totalExercises;

  // Call AI writing feedback API
  const checkWriting = useCallback(async () => {
    if (!writingDraft.trim() || !unitData) return;
    const _bandTarget = unitData.bandTarget ?? unitData.band_target ?? 5;
    const _wm = unitData.apply.writingMini ?? unitData.apply.writing_mini;
    const _grammarTargets: string[] = Array.isArray((_wm as { grammarMustUse?: string | string[] })?.grammarMustUse)
      ? (_wm as { grammarMustUse: string[] }).grammarMustUse
      : typeof (_wm as { grammarMustUse?: string })?.grammarMustUse === "string"
        ? [(_wm as { grammarMustUse: string }).grammarMustUse]
        : (_wm as { grammar_must_use?: string[] })?.grammar_must_use ?? [];
    setWritingFeedbackLoading(true);
    setWritingFeedbackError(null);
    setWritingFeedback(null);
    try {
      const res = await fetch("/api/ai/writing-mini-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: writingDraft,
          task_prompt: wmPrompt,
          unitId: unitData.id,
          targetBand: _bandTarget,
          grammarTargets: _grammarTargets,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const isRateLimit =
          res.status === 429 ||
          (data.error ?? "").toLowerCase().includes("rate limit");
        throw new Error(
          isRateLimit
            ? "⚠️ AI đang bận (rate limit). Vui lòng chờ ~60 giây rồi thử lại."
            : data.error || "Có lỗi xảy ra.",
        );
      }
      setWritingFeedback(data);
    } catch (err: unknown) {
      setWritingFeedbackError(err instanceof Error ? err.message : "Không thể kết nối AI.");
    } finally {
      setWritingFeedbackLoading(false);
    }
  }, [writingDraft, unitData]);



  // Speaking: start recording
  const startRecording = useCallback(async () => {
    setSpeakingError(null);
    setSpeakingFeedback(null);
    setSpeakingStep("idle");
    setSpeakingTranscript("");
    setSpeakingSegments(null);
    setSpeakingAvgLogprob(0);
    setSpeakingNoSpeechMax(0);
    setConfirmedSpeakingTranscript(null);
    setSpeakingAudioUrl(null);
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        // Store blob for pronunciation assessment (used in confirm → submit step)
        speakingAudioBlobRef.current = blob;
        // Create object URL for audio playback
        const url = URL.createObjectURL(blob);
        setSpeakingAudioUrl(url);
        // Use ref so we always call the latest version (avoids stale closure with unitData)
        await pipelineRef.current(blob);
      };
      mr.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(
        () => setRecordingSeconds((s) => s + 1),
        1000,
      );
    } catch {
      setSpeakingError(
        "Không thể truy cập microphone. Hãy cho phép quyền ghi âm.",
      );
    }
  }, []);

  // Speaking: stop recording
  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }, []);

  // Speaking: Step A (transcribe) -> Step B confirm -> Step C AI feedback

  const runSpeakingPipeline = useCallback(
    async (audioBlob: Blob) => {
      if (!unitData) return;
      // Step A: Groq Whisper
      setSpeakingStep("transcribing");
      try {
        const form = new FormData();
        form.append("audio", audioBlob, "recording.webm");
        form.append("unit_id", unitData.id);
        const res = await fetch("/api/transcribe", {
          method: "POST",
          body: form,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Transcription thất bại.");
        setSpeakingTranscript((data.transcript as string) ?? "");
        setSpeakingSegments((data.segments as WhisperSegment[]) ?? []);
        // Store summary metrics — used for confidence badge and uncertain-span logic
        setSpeakingAvgLogprob((data.avg_logprob_overall as number) ?? 0);
        setSpeakingNoSpeechMax((data.no_speech_prob_max as number) ?? 0);
        // Go to confirming — user MUST review before feedback
        setSpeakingStep("confirming");
      } catch (err: unknown) {
        setSpeakingError(
          err instanceof Error ? err.message : "Không thể chuyển âm thanh thành văn bản.",
        );
        setSpeakingStep("idle");
        return;
      }
    },
    [unitData],
  );


  useEffect(() => {
    pipelineRef.current = runSpeakingPipeline;
  }, [runSpeakingPipeline]);

  // Cleanup timer on unmount
  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current);
    },
    [],
  );

  const handleStageChange = useCallback(
    (newStage: Stage) => {
      if (stage === newStage) return;
      if (newStage === "complete" && !canCompleteUnit) {
        setCompletionGateMessage(
          `Bạn cần đúng tất cả câu trắc nghiệm để đủ ${PRACTICE_XP_TARGET}/50 XP phần Practice trước khi hoàn thành unit. Hiện tại: ${correctExercises}/${totalExercises} câu đúng (${practiceXpEarned}/50 XP).`,
        );
        return;
      }
      if (newStage !== "complete") {
        setCompletionGateMessage(null);
      }

      if (stepperTimeoutRef.current) clearTimeout(stepperTimeoutRef.current);
      setShowStepper(true);
      stepperTimeoutRef.current = setTimeout(() => setShowStepper(false), 2500);

      // Award completion bonus once when reaching "complete"
      if (newStage === "complete" && !completionXpAwarded.current && unitData) {
        completionXpAwarded.current = true;
        const bonus = unitData.completion?.xpReward ?? unitData.completion?.xp_reward ?? 50;
        // Slight delay so the animation plays after the stage renders
        setTimeout(() => awardXp(bonus, "Unit hoàn thành! 🏆"), 400);
        // Set localStorage IMMEDIATELY (optimistic) so grammar-theory page
        // can detect completion right away when navigating back.
        localStorage.setItem(`unit-completed-${unitId}`, "1");
        // Then persist to DB in the background.
        fetch("/api/progress/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            unitId,
            currentStage: "complete",
            completed: true,
            incrementAttempt: true,
          }),
        })
          .then((res) => {
            if (!res.ok) {
              throw new Error(`HTTP ${res.status}`);
            }
            return res.json();
          })
          .catch((e) => {
            console.warn("[XP] completion persist failed:", e);
          });
      }
      setIsTransitioning(true);
      setTimeout(() => {
        setStage(newStage);
        setIsTransitioning(false);
      }, 300);
    },
    [
      stage,
      canCompleteUnit,
      correctExercises,
      totalExercises,
      practiceXpEarned,
      unitData,
      unitId,
      awardXp,
    ],
  );

  const handleNext = () => {
    const idx = STAGES.indexOf(stage);
    if (idx < STAGES.length - 1) handleStageChange(STAGES[idx + 1]);
  };

  const handlePrev = () => {
    const idx = STAGES.indexOf(stage);
    if (idx > 0) handleStageChange(STAGES[idx - 1]);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    );
  if (!userId)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-red-600">Please sign in to continue.</p>
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-red-600">{error}</p>
      </div>
    );
  if (!unitData)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600">Loading unit content...</p>
      </div>
    );

  // ── Normalize camelCase JSON ↔ snake_case fallback ──────────────────────
  const bandTarget = unitData.bandTarget ?? unitData.band_target ?? 5;

  // Theory
  const theoryDescription = unitData.theory.coreRule ?? unitData.theory.description ?? "";
  const theoryFormation = unitData.theory.formation ?? inferFormation(unitData.id);
  const contrastExamples: ContrastExample[] = unitData.theory.contrastExamples
    ?? unitData.theory.contrast_examples
    ?? [];
  const keyPoints: string[] = unitData.theory.keyPoints
    ?? unitData.theory.key_points
    ?? [];

  // Writing mini
  const wm = unitData.apply.writingMini ?? unitData.apply.writing_mini;
  const wmPrompt = wm?.prompt ?? "";
  const wmPlaceholder = wm?.placeholder;
  const wmWordLimit = (wm as { wordLimit?: number })?.wordLimit ?? (wm as { word_limit?: number })?.word_limit ?? 30;
  const wmGrammarTargets: string[] = Array.isArray((wm as { grammarMustUse?: string | string[] })?.grammarMustUse)
    ? (wm as { grammarMustUse: string[] }).grammarMustUse
    : typeof (wm as { grammarMustUse?: string })?.grammarMustUse === "string"
      ? [(wm as { grammarMustUse: string }).grammarMustUse]
      : (wm as { grammar_must_use?: string[] })?.grammar_must_use ?? [];
  const wmModelBand = (wm as { modelBand?: number })?.modelBand ?? (wm as { model_band?: number })?.model_band ?? 5;
  const wmModelAnswer = (wm as { modelAnswer?: string })?.modelAnswer ?? (wm as { model_answer?: string })?.model_answer ?? "";

  // Speaking drill
  const sd = unitData.apply.speakingDrill ?? unitData.apply.speaking_drill;
  const sdPrompt = sd?.prompt ?? "";
  const sdTimeLimit = (sd as { timeLimit?: number })?.timeLimit ?? (sd as { time_limit?: number })?.time_limit ?? 60;
  const sdGrammarTargets: string[] = (sd as { grammarTargets?: string[] })?.grammarTargets
    ?? (sd as { grammar_targets?: string[] })?.grammar_targets ?? [];

  // Completion
  const xpReward = unitData.completion.xpReward ?? unitData.completion.xp_reward ?? 50;
  const fallbackNextUnitId = getNextUnitFromRoadmap(unitId);
  const resolvedNextUnitId =
    unitData.completion.nextUnitId ?? unitData.completion.next_unit_id ?? fallbackNextUnitId;
  const resolvedNextUnitTitle =
    unitData.completion.nextUnitTitle ?? unitData.completion.next_unit_title ??
    (resolvedNextUnitId ? UNIT_TITLE_MAP[resolvedNextUnitId] : null);
  const nextUnitConnection = unitData.completion.nextUnitConnection ?? unitData.completion.next_unit_connection;

  const currentStageIndex = STAGES.indexOf(stage);


  return (
    <div className="min-h-screen bg-slate-50">
      {/* Floating XP Popups */}
      <div className="fixed bottom-24 right-6 z-50 flex flex-col-reverse gap-2 pointer-events-none">
        {xpPopups.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-2 bg-yellow-400 text-yellow-900 font-extrabold text-sm px-4 py-2 rounded-full shadow-lg"
            style={{
              animation: "xpFloat 1.8s ease-out forwards",
            }}
          >
            <span className="text-base">{"🌟"}</span>+{p.amount} XP
            <span className="font-normal text-xs opacity-70">{p.label}</span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes xpFloat {
          0%   { opacity: 1; transform: translateY(0) scale(1); }
          60%  { opacity: 1; transform: translateY(-28px) scale(1.08); }
          100% { opacity: 0; transform: translateY(-52px) scale(0.95); }
        }
      `}</style>

      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 py-8 flex items-start justify-between">
          <div>
            <Link href="/grammar-theory" className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-indigo-600 mb-3 transition-colors">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Trở về Lộ trình
            </Link>
            <h1 className="text-3xl font-sans font-extrabold text-slate-900 tracking-tight">
              {unitData.title}
            </h1>
            <p className="text-slate-500 mt-2 font-medium">{unitData.subtitle}</p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              Target Band: {bandTarget}
            </div>
          </div>
          {/* Session XP badge */}
          <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-2 text-sm font-bold text-yellow-700 shadow-sm shrink-0 ml-4 mt-1 transition-all">
            <span className="text-base">{"🌟"}</span>
            {sessionXp} XP
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div
        className={`bg-white sticky top-0 z-10 overflow-hidden transition-all duration-500 ease-in-out ${
          showStepper
            ? "max-h-40 opacity-100 border-b border-slate-100 shadow-sm"
            : "max-h-0 opacity-0 border-transparent"
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between gap-2 relative">
            {/* Background Line */}
            <div className="absolute left-[5%] right-[5%] top-1/2 -translate-y-1/2 h-1.5 bg-slate-100 rounded-full z-0" />
            
            {/* Foreground Line (Progress Fill) */}
            <div 
               className="absolute left-[5%] top-1/2 -translate-y-1/2 h-1.5 bg-emerald-500 rounded-full z-0 transition-all duration-700 ease-in-out" 
               style={{ width: `calc(${(currentStageIndex / (STAGES.length - 1)) * 90}%)` }} 
            />

            {STAGES.map((s, idx) => {
              const isCompleted = idx < currentStageIndex;
              const isCurrent = s === stage;
              return (
                <div key={s} className="relative z-10 flex flex-col items-center">
                  <button
                    onClick={() => handleStageChange(s)}
                    className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-500 ease-in-out ${
                      isCurrent
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-110"
                        : isCompleted
                          ? "bg-emerald-500 text-white shadow-sm scale-110"
                          : "bg-white border-2 border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500"
                    }`}
                    title={STAGE_LABELS[s]}
                  >
                    {isCompleted ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 animate-in zoom-in duration-300 text-white">
                        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span className="text-sm font-bold">{idx + 1}</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {STAGES.map((s, idx) => (
              <div key={s} className={`text-center flex-1 transition-colors duration-500 ${idx === currentStageIndex ? 'text-indigo-600' : idx < currentStageIndex ? 'text-emerald-600' : ''}`}>
                {STAGE_LABELS[s]}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div
          className={`transition-all duration-500 ease-in-out transform ${isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}
        >
          {/* STAGE: Theory */}
          {stage === "theory" && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Learn the Theory
              </h2>
              <div className="prose prose-sm max-w-none text-slate-600">
                <p className="text-slate-700 leading-relaxed text-base">{theoryDescription}</p>
                {theoryFormation && (
                  <>
                    <h3 className="text-lg font-semibold mt-6 text-gray-900">
                      Formation
                    </h3>
                    <div className="bg-gray-50 p-4 rounded border border-gray-200 space-y-2 font-mono text-sm">
                      <p>
                        <strong>Affirmative:</strong>{" "}
                        {theoryFormation.affirmative}
                      </p>
                      <p>
                        <strong>Negative:</strong>{" "}
                        {theoryFormation.negative}
                      </p>
                      <p>
                        <strong>Question:</strong>{" "}
                        {theoryFormation.question}
                      </p>
                    </div>
                  </>
                )}
                {contrastExamples.length > 0 && (
                  <>
                    <h3 className="text-lg font-semibold mt-6 text-gray-900">
                      Contrast Examples
                    </h3>
                    <div className="space-y-4">
                      {contrastExamples.map(
                        (ex: ContrastExample, idx: number) => (
                          <div
                            key={idx}
                            className="border-l-4 border-red-400 bg-red-50 p-4 rounded"
                          >
                            <p className="text-red-700 font-semibold line-through">
                              {"❌"} {ex.wrong ?? ex.incorrect}
                            </p>
                            <p className="text-green-700 font-semibold mt-2">
                              {"✅"} {ex.correct}
                            </p>
                            {(ex.tipVi ?? ex.tip_vi ?? ex.explanationVi) && (
                              <p className="text-sm text-gray-700 mt-2">
                                {"💡"} {ex.tipVi ?? ex.tip_vi ?? ex.explanationVi}
                              </p>
                            )}
                            {(ex.bandImpact ?? ex.band_impact) && (
                              <p className="text-xs text-gray-600 mt-1">
                                {"📊"} {ex.bandImpact ?? ex.band_impact}
                              </p>
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  </>
                )}
                {keyPoints.length > 0 && (
                  <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-teal-500 to-emerald-400 px-6 py-4">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span>🎯</span> Key Points
                      </h3>
                    </div>
                    <div className="p-6">
                      <ul className="space-y-4">
                        {keyPoints.map((point: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-600 text-sm font-bold mt-0.5">
                              {idx + 1}
                            </span>
                            <p className="text-slate-700 leading-relaxed font-medium">
                              {point}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STAGE: Practice (Exercises) */}
          {stage === "practice" && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Practice Exercises
                </h2>
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 px-5 py-3 text-sm text-indigo-800 shadow-sm">
                  Đúng {totalExercises}/{totalExercises} câu để đạt {PRACTICE_XP_TARGET}/50 XP
                  <div className="mt-1 font-bold text-indigo-900">
                    Tiến độ: {correctExercises}/{totalExercises} câu đúng
                    ({practiceXpEarned}/50 XP)
                  </div>
                </div>
              </div>

              {unitData.exercises.items.map((exercise: Exercise, idx: number) => {
                const exCorrectAnswer = exercise.correctAnswer ?? exercise.correct_answer ?? "";
                const exOptions: string[] = Array.isArray(exercise.options)
                  ? exercise.options
                  : typeof exercise.options === "string"
                    ? exercise.options.split(". ").map((s) => s.replace(/^[A-D]\.\s*/, "").trim()).filter(Boolean)
                    : [];
                const exState = exStates[exercise.id] || {
                  selectedOption: null,
                  isSubmitted: false,
                };
                const isCorrect = exState.selectedOption === exCorrectAnswer;

                return (
                  <div
                    key={exercise.id}
                    className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-slate-800 text-lg">
                        Câu {idx + 1} <span className="text-slate-400 font-normal text-sm ml-2">({exercise.type})</span>
                      </h3>
                      <span className="text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-100">
                        {exercise.skill}
                      </span>
                    </div>

                    <p className="text-slate-700 font-medium text-lg mb-6">
                      {exercise.question}
                    </p>

                    {exercise.options && (
                      <div className="space-y-3">
                        {exOptions.map(
                          (option: string, optIdx: number) => {
                            const isSelected =
                              exState.selectedOption === option;
                            const isThisCorrect =
                              option === exCorrectAnswer;

                            let btnClass =
                              "w-full text-left p-4 rounded-xl border transition-all font-medium ";

                            if (!exState.isSubmitted) {
                              btnClass += isSelected
                                ? "bg-indigo-50 border-indigo-400 text-indigo-900 ring-2 ring-indigo-100"
                                : "bg-slate-50/50 border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-700";
                            } else {
                              // After submit: green = correct answer, red = wrong selected
                              if (isThisCorrect) {
                                btnClass +=
                                  "bg-emerald-50 border-emerald-400 text-emerald-900";
                              } else if (isSelected && !isThisCorrect) {
                                btnClass +=
                                  "bg-rose-50 border-rose-400 text-rose-900";
                              } else {
                                btnClass +=
                                  "bg-slate-50 border-slate-200 text-slate-400 opacity-60";
                              }
                            }

                            return (
                              <button
                                key={optIdx}
                                onClick={() =>
                                  selectOption(exercise.id, option)
                                }
                                disabled={exState.isSubmitted}
                                className={btnClass}
                              >
                                <span className="mr-3 font-bold text-sm opacity-50">
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                {option}
                                {exState.isSubmitted && isThisCorrect && (
                                  <span className="ml-2 text-emerald-500 font-bold">
                                    {"✅"}
                                  </span>
                                )}
                                {exState.isSubmitted &&
                                  isSelected &&
                                  !isThisCorrect && (
                                    <span className="ml-2 text-rose-500 font-bold">
                                      {"❌"}
                                    </span>
                                  )}
                              </button>
                            );
                          },
                        )}
                      </div>
                    )}

                    {/* Nút Kiểm tra — chỉ hiện khi đã chọn, chưa submit */}
                    {exState.selectedOption && !exState.isSubmitted && (
                      <div className="mt-6 pt-2">
                        <button
                          onClick={() =>
                            submitExercise(
                              exercise.id,
                              exCorrectAnswer,
                            )
                          }
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md shadow-indigo-200 active:scale-95"
                        >
                          Kiểm tra đáp án
                        </button>
                      </div>
                    )}

                    {/* Feedback sau khi submit */}
                    {exState.isSubmitted && (
                      <div
                        className={`p-4 rounded-lg border-l-4 ${
                          isCorrect
                            ? "bg-green-50 border-green-500 text-green-800"
                            : "bg-red-50 border-red-500 text-red-800"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold">
                            {isCorrect ? "🏆 Chính xác!" : "❌ Chưa đúng!"}
                          </p>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              isCorrect
                                ? "bg-green-200 text-green-800"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {isCorrect ? "+10 XP" : "+0 XP"}
                          </span>
                        </div>
                        <p className="text-sm">
                          {isCorrect
                            ? (exercise.feedbackCorrect ?? exercise.feedback_correct ?? "")
                            : (exercise.feedbackWrong ?? exercise.feedback_wrong ?? "")}
                        </p>
                        {!isCorrect && (
                          <p className="text-sm mt-2">
                            <strong>Đáp án đúng:</strong>{" "}
                            {exCorrectAnswer}
                          </p>
                        )}
                      </div>
                    )}

                    <p className="text-sm text-gray-700 bg-white p-3 rounded">
                      {"💡"} <strong>Tip:</strong> {exercise.ieltsTip ?? exercise.ielts_tip ?? ""}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* STAGE: Apply (Writing) */}
          {stage === "apply" && (
            <div className="space-y-5">
              {/* Writing prompt + editor card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Prompt header */}
                <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-6 py-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="rounded-full bg-white/20 px-3 py-0.5 text-[11px] font-bold text-white tracking-wide">
                      {"✍️"} Writing Practice
                    </span>
                    <span className="ml-auto text-xs text-indigo-100">
                      Mục tiêu: {wmWordLimit} từ
                    </span>
                  </div>
                  <p className="text-white font-medium leading-relaxed">
                    {wmPrompt}
                  </p>
                </div>

                {/* Editor */}
                <div className="p-4">
                  <textarea
                    value={writingDraft}
                    onChange={(e) => {
                      setWritingDraft(e.target.value);
                      setWritingFeedback(null);
                      setWritingFeedbackError(null);
                    }}
                    placeholder={wmPlaceholder}
                    className="w-full h-48 p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm leading-7 text-slate-800 resize-none bg-slate-50"
                  />
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
                      <span
                        className={
                          writingDraft.split(/\s+/).filter(Boolean).length >=
                          wmWordLimit
                            ? "text-emerald-600 font-bold"
                            : "text-slate-500"
                        }
                      >
                        {writingDraft.split(/\s+/).filter(Boolean).length}
                      </span>
                      <span className="text-slate-400">
                        {" "}
                        / {wmWordLimit} từ
                      </span>
                    </span>
                    <button
                      onClick={checkWriting}
                      disabled={!writingDraft.trim() || writingFeedbackLoading}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-indigo-200 active:scale-95"
                    >
                      {writingFeedbackLoading ? (
                        <>
                          <span className="inline-block h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />{" "}
                          Đang chấm AI...
                        </>
                      ) : (
                        <>🤖 Nộp bài &amp; Phân tích AI</>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Grammar targets chip row */}
              <div className="flex flex-wrap gap-2">
                {wmGrammarTargets.map(
                  (g: string, idx: number) => (
                    <span
                      key={idx}
                      className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
                    >
                      {g}
                    </span>
                  ),
                )}
              </div>

              {/* Error alert */}
              {writingFeedbackError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2">
                  <span className="text-base mt-0.5">{"⚠️"}</span>
                  <span>{writingFeedbackError}</span>
                </div>
              )}

              {/* ── AI Feedback Result ── */}
              {writingFeedback && (
                <div className="space-y-4">
                  {/* Overall band hero */}
                  <div className="bg-gradient-to-br from-[#1a3a5c] to-indigo-700 rounded-2xl p-5 text-white flex items-center justify-between shadow-lg">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-indigo-200 mb-1">
                        Kết quả tổng thể
                        {completionGateMessage && (
                          <div className="mb-5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                            {completionGateMessage}
                          </div>
                        )}
                      </p>
                      <p className="text-5xl font-extrabold tracking-tight">
                        Band {writingFeedback.band_estimate.toFixed(1)}
                      </p>
                      <p className="mt-2 text-sm text-indigo-200 italic">
                        {writingFeedback.encouragement}
                      </p>
                    </div>
                    <div className="text-center">
                      <div
                        className="h-20 w-20 rounded-full border-4 border-white/30 flex items-center justify-center text-2xl font-extrabold"
                        style={{
                          background: `conic-gradient(#60a5fa ${Math.round(((writingFeedback.band_estimate - 4) / 5) * 100)}%, rgba(255,255,255,0.1) 0%)`,
                        }}
                      >
                        {Math.round(
                          ((writingFeedback.band_estimate - 4) / 5) * 100,
                        )}
                        %
                      </div>
                      <p className="text-[10px] text-indigo-300 mt-1">
                        Đạt chính xác
                      </p>
                    </div>
                  </div>

                  {/* 4 IELTS Criteria bars */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                      Chi tiết 4 tiêu chí IELTS
                    </p>
                    <div className="space-y-3">
                      {[
                        {
                          key: "ta" as const,
                          label: "Task Achievement",
                          short: "TA",
                          color: "bg-blue-500",
                        },
                        {
                          key: "cc" as const,
                          label: "Coherence & Cohesion",
                          short: "CC",
                          color: "bg-orange-400",
                        },
                        {
                          key: "lr" as const,
                          label: "Lexical Resource",
                          short: "LR",
                          color: "bg-emerald-500",
                        },
                        {
                          key: "gra" as const,
                          label: "Grammatical Range",
                          short: "GRA",
                          color: "bg-purple-500",
                        },
                      ].map(({ key, label, short, color }) => {
                        const score =
                          writingFeedback.criteria?.[key] ??
                          writingFeedback.band_estimate;
                        const pct = ((score - 4) / 5) * 100;
                        return (
                          <div key={key}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`inline-flex h-5 w-8 items-center justify-center rounded text-[9px] font-extrabold text-white ${color}`}
                                >
                                  {short}
                                </span>
                                <span className="text-sm text-slate-600">
                                  {label}
                                </span>
                              </div>
                              <span className="text-sm font-bold text-slate-800">
                                {score.toFixed(1)}
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-slate-100">
                              <div
                                className={`h-2 rounded-full transition-all duration-700 ${color}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Grammar status */}
                  <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                      writingFeedback.grammar_used_correctly
                        ? "bg-green-50 border-green-200 text-green-800"
                        : "bg-yellow-50 border-yellow-200 text-yellow-800"
                    }`}
                  >
                    <span className="text-xl">
                      {writingFeedback.grammar_used_correctly ? "✅" : "⚠️"}
                    </span>
                    <p className="text-sm font-semibold">
                      {writingFeedback.grammar_used_correctly
                        ? "Ngữ pháp mục tiêu được sử dụng đúng!"
                        : "Cần cải thiện ngữ pháp mục tiêu"}
                    </p>
                  </div>

                  {/* ── Grammar Errors ── */}
                  {writingFeedback.errors.length > 0 && (
                    <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
                      <div className="bg-red-50 border-b border-red-100 px-5 py-3 flex items-center gap-2">
                        <span>🔍</span>
                        <p className="text-sm font-bold text-red-700">Lỗi ngữ pháp &amp; từ vựng</p>
                        <span className="ml-auto text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">
                          {writingFeedback.errors.length} lỗi
                        </span>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {writingFeedback.errors.map((err, i: number) => {
                          const cs: CorrectionState = correctionStates[i] ?? { attempt: "", loading: false, result: null };
                          const catLabel: Record<string, string> = {
                            subject_verb_agreement: "Chủ ngữ-động từ",
                            tense: "Thì",
                            article: "Mạo từ",
                            preposition: "Giới từ",
                            word_form: "Dạng từ",
                            vocabulary: "Từ vựng",
                            punctuation: "Dấu câu",
                            other: "Khác",
                          };
                          return (
                            <div key={i} className="px-5 py-4 space-y-2">
                              {/* error + correction row */}
                              <div className="flex flex-wrap items-baseline gap-2 text-sm">
                                <span className="font-mono bg-red-50 line-through text-red-500 px-1.5 py-0.5 rounded">
                                  {err.original}
                                </span>
                                <span className="text-slate-400 font-bold">→</span>
                                <span className="font-mono font-semibold text-green-700 bg-green-50 px-1.5 py-0.5 rounded">
                                  {err.correction}
                                </span>
                                <span className="ml-1 text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                                  {catLabel[err.category] ?? err.category}
                                </span>
                              </div>
                              {/* rule explanation */}
                              <p className="text-xs text-slate-500 leading-relaxed">💡 {err.rule_vi}</p>
                              {/* Viết lại practice */}
                              <div className="mt-2 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/50 px-4 py-3 space-y-2">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">✍️ Viết lại cùng tôi</p>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={cs.attempt}
                                    onChange={(e) =>
                                      setCorrectionStates((prev) => ({
                                        ...prev,
                                        [i]: { ...cs, attempt: e.target.value, result: null },
                                      }))
                                    }
                                    placeholder={`Sửa lại: "${err.original}"`}
                                    className="flex-1 rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                                  />
                                  <button
                                    disabled={!cs.attempt.trim() || cs.loading}
                                    onClick={async () => {
                                      setCorrectionStates((prev) => ({
                                        ...prev,
                                        [i]: { ...cs, loading: true, result: null },
                                      }));
                                      try {
                                        const res = await fetch("/api/ai/check-correction", {
                                          method: "POST",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({
                                            original: err.original,
                                            userAttempt: cs.attempt,
                                            correctAnswer: err.correction,
                                          }),
                                        });
                                        const d = await res.json();
                                        setCorrectionStates((prev) => ({
                                          ...prev,
                                          [i]: { attempt: cs.attempt, loading: false, result: d },
                                        }));
                                      } catch {
                                        setCorrectionStates((prev) => ({
                                          ...prev,
                                          [i]: { attempt: cs.attempt, loading: false, result: { ok: false, hint: "Lỗi kết nối." } },
                                        }));
                                      }
                                    }}
                                    className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-40 transition-all"
                                  >
                                    {cs.loading ? (
                                      <span className="inline-block h-3.5 w-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                    ) : "Kiểm tra"}
                                  </button>
                                </div>
                                {cs.result && (
                                  <p className={`text-xs font-semibold ${cs.result.ok ? "text-green-700" : "text-red-600"}`}>
                                    {cs.result.ok ? "✅ Chính xác!" : `❌ ${cs.result.hint ?? "Chưa đúng, thử lại nhé."}`}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}


                  {/* ── Vocab Upgrades ── */}
                  {(writingFeedback.vocab_upgrades?.length ?? 0) > 0 && (
                    <div className="bg-white rounded-2xl border border-teal-100 shadow-sm overflow-hidden">
                      <div className="bg-teal-50 border-b border-teal-100 px-5 py-3 flex items-center gap-2">
                        <span>💎</span>
                        <p className="text-sm font-bold text-teal-700">Nâng cấp từ vựng</p>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {writingFeedback.vocab_upgrades!.map((v, i: number) => {
                          const regColor: Record<string, string> = {
                            academic: "bg-blue-100 text-blue-700",
                            precise: "bg-purple-100 text-purple-700",
                            formal: "bg-slate-100 text-slate-600",
                          };
                          return (
                            <div key={i} className="px-5 py-3 flex flex-wrap items-center gap-3">
                              <span className="font-mono text-sm line-through text-slate-400">{v.original}</span>
                              <span className="text-slate-400 font-bold">→</span>
                              <span className="font-mono text-sm font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">{v.upgraded}</span>
                              <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${regColor[v.register] ?? "bg-slate-100 text-slate-500"}`}>
                                {v.register}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ── Cohesion Analysis ── */}
                  {writingFeedback.cohesion && (
                    <div className="bg-white rounded-2xl border border-violet-100 shadow-sm overflow-hidden">
                      <div className="bg-violet-50 border-b border-violet-100 px-5 py-3 flex items-center gap-2">
                        <span>🔗</span>
                        <p className="text-sm font-bold text-violet-700">Liên kết &amp; Mạch văn</p>
                        <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${writingFeedback.cohesion.has_linking_words ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                          {writingFeedback.cohesion.has_linking_words ? "✅ Có linking words" : "⚠️ Thiếu linking words"}
                        </span>
                      </div>
                      <div className="px-5 py-4 space-y-3">
                        <p className="text-sm text-slate-700 leading-relaxed">{writingFeedback.cohesion.verdict_vi}</p>
                        {writingFeedback.cohesion.found.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Đã dùng</p>
                            <div className="flex flex-wrap gap-1.5">
                              {writingFeedback.cohesion.found.map((w, i: number) => (
                                <span key={i} className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">{w}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {writingFeedback.cohesion.missing_suggestions.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Gợi ý thêm</p>
                            <div className="flex flex-wrap gap-1.5">
                              {writingFeedback.cohesion.missing_suggestions.map((w, i: number) => (
                                <span key={i} className="border border-dashed border-violet-300 text-violet-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">+ {w}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── Upgraded Sentence ── */}
                  {writingFeedback.upgraded_sentence && (
                    <div className="bg-indigo-50 rounded-2xl border border-indigo-100 overflow-hidden">
                      <div className="bg-indigo-100/60 px-5 py-3 flex items-center gap-2">
                        <span>🚀</span>
                        <p className="text-sm font-bold text-indigo-700">Câu được nâng cấp</p>
                      </div>
                      <div className="px-5 py-4 space-y-3">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Câu gốc:</p>
                          <p className="text-sm text-slate-600 italic">&ldquo;{writingFeedback.upgraded_sentence.original}&rdquo;</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-1">Câu nâng cấp:</p>
                          <p className="text-sm text-indigo-800 font-semibold italic">&ldquo;{writingFeedback.upgraded_sentence.upgraded}&rdquo;</p>
                        </div>
                        {writingFeedback.upgraded_sentence.changes_vi && (
                          <p className="text-xs text-indigo-500 border-t border-indigo-100 pt-2">
                            💬 {writingFeedback.upgraded_sentence.changes_vi}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── Encouragement + Tips ── */}
                  {writingFeedback.encouragement && (
                    <div className="flex items-start gap-3 rounded-2xl bg-amber-50 border border-amber-200 px-5 py-4">
                      <span className="text-2xl shrink-0">🌟</span>
                      <p className="text-sm text-amber-900 leading-relaxed">{writingFeedback.encouragement}</p>
                    </div>
                  )}

                  {writingFeedback.improvement_tips && writingFeedback.improvement_tips.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-orange-100 px-5 py-3">
                        <p className="text-sm font-bold text-orange-800">💡 Lời khuyên nâng band</p>
                      </div>
                      <div className="px-5 py-4 space-y-2">
                        {writingFeedback.improvement_tips.map((tip: string, i: number) => (
                          <div key={i} className="flex items-start gap-3">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[10px] font-bold text-orange-600 mt-0.5">
                              {i + 1}
                            </span>
                            <p className="text-sm text-slate-700 leading-relaxed">{tip}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}


                </div>
              )}


              {/* Model Answer */}
              <details className="group bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  <span>
                    {"📖"} Xem bài mẫu ({wmModelBand}{" "}
                    band)
                  </span>
                  <span className="text-slate-400 group-open:rotate-180 transition-transform">
                    {"▼"}
                  </span>
                </summary>
                <div className="border-t border-slate-100 px-5 py-4">
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {wmModelAnswer}
                  </p>
                </div>
              </details>
            </div>
          )}

          {/* STAGE: Speaking */}
          {stage === "speak" && (
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Speaking Drill</h2>

              {/* Prompt */}
              <div className="bg-purple-50 border border-purple-200 p-6 rounded space-y-3">
                <h3 className="font-semibold text-gray-900">
                  {sdPrompt}
                </h3>
                <p className="text-sm text-gray-600">
                  Thời gian: {sdTimeLimit}s
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {sdGrammarTargets.map(
                    (t: string, i: number) => (
                      <span
                        key={i}
                        className="bg-purple-200 text-purple-900 px-3 py-1 rounded-full text-sm"
                      >
                        {t}
                      </span>
                    ),
                  )}
                </div>
              </div>

              {/* BUOC 1: GHI AM */}
              {speakingStep === "idle" && !speakingTranscript && (
                <div className="flex items-center gap-4">
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl font-bold shadow-md shadow-indigo-200 transition-all active:scale-95"
                    >
                      🎙️ Bắt đầu ghi âm
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-8 py-3.5 rounded-xl font-bold shadow-md shadow-rose-200 transition-all animate-pulse"
                    >
                      ⏹ Dừng ({recordingSeconds}s)
                    </button>
                  )}
                </div>
              )}

              {/* Dang transcribe */}
              {speakingStep === "transcribing" && (
                <p className="text-sm text-purple-600 font-medium animate-pulse">
                  ⏳ Đang chuyển giọng nói thành văn bản...
                </p>
              )}

              {/* Error */}
              {speakingError && (
                <div className="p-4 bg-red-50 border border-red-300 rounded text-red-700 text-sm">
                  ⚠️ {speakingError}
                </div>
              )}

              {/* Audio Playback */}
              {speakingAudioUrl && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                    🎧 Nghe lại bản ghi âm
                  </p>
                  <audio controls src={speakingAudioUrl} className="w-full h-10" />
                </div>
              )}

              {/* BUOC 2: CONFIRM TRANSCRIPT — required step, only shown in 'confirming' state */}
              {speakingStep === "confirming" && speakingTranscript && (
                <div className="rounded-xl border border-amber-200 bg-white overflow-hidden shadow-sm">
                  <div className="flex items-center justify-between border-b border-amber-100 bg-amber-50 px-5 py-3">
                    <div className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      <span className="text-sm font-bold text-amber-800">
                        Kiểm tra lại trước khi chấm điểm
                      </span>
                    </div>
                    {speakingSegments && speakingSegments.length > 0 && (() => {
                      const THRESHOLD = -0.4;
                      const uncertainSegs = speakingSegments.filter(
                        (s) => s.avg_logprob < THRESHOLD || s.no_speech_prob > 0.3,
                      );
                      const totalWords = speakingTranscript.trim().split(/\s+/).length;
                      const uncertainRatio = uncertainSegs.length / speakingSegments.length;
                      const uncertainCount = Math.round(totalWords * uncertainRatio);
                      const clearCount = totalWords - uncertainCount;
                      return (
                        <span
                          className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                          style={{
                            background: uncertainCount === 0 ? "#dcfce7" : "#fef9c3",
                            color: uncertainCount === 0 ? "#15803d" : "#a16207",
                          }}
                        >
                          Nhận rõ: {clearCount}/{totalWords} từ
                          {uncertainCount > 0 && ` - ${uncertainCount} từ chưa chắc`}
                        </span>
                      );
                    })()}
                  </div>

                  <div className="px-5 pt-4 pb-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                      Transcript{" "}
                      {speakingSegments &&
                        speakingSegments.some(
                          (s) => s.avg_logprob < -0.4,
                        ) && (
                          <span className="text-amber-600">
                            (nền vàng = Whisper không chắc chắn)
                          </span>
                        )}
                    </p>
                    <p className="text-sm leading-7 text-slate-700">
                      {(() => {
                        const uncertainWords = new Set<string>();
                        const typedSegments = speakingSegments ?? [];
                        for (const seg of typedSegments) {
                          const isUncertain = seg.avg_logprob < -0.4 || seg.no_speech_prob > 0.3;
                          if (isUncertain) {
                            (seg.words ?? seg.text.trim().split(/\s+/)).forEach(
                              (w: { word?: string } | string) => {
                                const word = typeof w === "string" ? w : w.word ?? "";
                                uncertainWords.add(
                                  word.trim().toLowerCase().replace(/[^a-z']/g, ""),
                                );
                              },
                            );
                          }
                        }
                        return speakingTranscript.split(/(\s+)/).map((token, i) => {
                          const clean = token.trim().toLowerCase().replace(/[^a-z']/g, "");
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
                      })()}
                    </p>
                  </div>

                  <div className="px-5 pb-4 pt-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                      Sửa lại nếu cần (bản này sẽ được chấm điểm)
                    </p>
                    <textarea
                      value={confirmedSpeakingTranscript ?? speakingTranscript}
                      onChange={(e) => setConfirmedSpeakingTranscript(e.target.value)}
                      rows={4}
                      className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition"
                    />
                  </div>

                  {speakingAvgLogprob < -0.4 && (
                    <div className="mx-5 mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                      <p className="text-xs text-amber-700 font-medium">
                        ⚠ Chất lượng âm thanh thấp - hệ thống nhận dạng chỉ tin cậy một phần.
                        Hãy kiểm tra kỹ và sửa lỗi nhận dạng trước khi nộp.
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-3 border-t border-slate-100 px-5 py-4">
                    <button
                      onClick={async () => {
                        const finalTranscript = confirmedSpeakingTranscript ?? speakingTranscript;
                        if (!finalTranscript.trim()) return;
                        const sttUncertainSpans = (speakingSegments ?? [])
                          .filter((s) => s.avg_logprob < -0.4 || s.no_speech_prob > 0.3)
                          .map((s) => s.text.trim());
                        setSpeakingStep("analysing");
                        setSpeakingError(null);
                        try {
                          // ── [DEBUG] Audio blob diagnostic ────────────────────────
                          const rawBlob = speakingAudioBlobRef.current;
                          console.log("[unit-speaking] 🎙 blob present:", rawBlob !== null);
                          if (rawBlob) {
                            console.log("[unit-speaking] 🎙 blob instanceof Blob:", rawBlob instanceof Blob);
                            console.log("[unit-speaking] 🎙 blob instanceof File:", rawBlob instanceof File);
                            console.log("[unit-speaking] 🎙 blob.type:", rawBlob.type);
                            console.log("[unit-speaking] 🎙 blob.size:", rawBlob.size, "bytes");
                          } else {
                            console.warn("[unit-speaking] ⚠️ speakingAudioBlobRef is NULL");
                          }
                          // ────────────────────────────────────────────────────────

                          if (!rawBlob || rawBlob.size === 0) {
                            throw new Error("Không tìm thấy file âm thanh. Vui lòng ghi âm lại.");
                          }

                          // Convert Blob → File so filename + MIME are explicit
                          const audioFile = rawBlob instanceof File
                            ? rawBlob
                            : new File([rawBlob], "recording.webm", { type: "audio/webm" });

                          const metaPayload = JSON.stringify({
                            transcript: finalTranscript,
                            stt_uncertain_spans: sttUncertainSpans,
                            speaking_prompt: sdPrompt,
                            unitId: unitData.id,
                            targetBand: bandTarget,
                            grammarTargets: sdGrammarTargets,
                          });

                          const fd = new FormData();
                          fd.append("audio", audioFile, "recording.webm");
                          fd.append("meta", metaPayload);

                          // ── [DEBUG] FormData diagnostic ──────────────────────────
                          console.log("[unit-speaking] 📦 FormData 'audio' set:", fd.get("audio") !== null);
                          console.log("[unit-speaking] 📦 FormData 'meta' set:", fd.get("meta") !== null);
                          console.log("[unit-speaking] 📦 meta:", metaPayload);
                          // DO NOT set Content-Type manually — browser sets multipart/form-data; boundary=...
                          // ────────────────────────────────────────────────────────

                          const res = await fetch("/api/ai/speaking-drill-feedback", {
                            method: "POST",
                            body: fd,
                            // ⚠️ No headers — browser must set Content-Type with boundary
                          });
                          const d = await res.json();
                          if (!res.ok) throw new Error(d.error || "AI phân tích thất bại.");
                          setSpeakingFeedback(d);
                          setSpeakingStep("done");
                        } catch (e: unknown) {
                          setSpeakingError(
                            e instanceof Error ? e.message : "Lỗi không xác định.",
                          );
                          // Return to confirming so user can retry without re-recording
                          setSpeakingStep("confirming");
                        }
                      }}
                      className="rounded-xl bg-purple-600 hover:bg-purple-700 px-6 py-2.5 text-sm font-bold text-white transition disabled:opacity-50"
                    >
                      🤖 Nộp để chấm điểm →
                    </button>
                    <button
                      onClick={() => {
                        setSpeakingTranscript("");
                        setConfirmedSpeakingTranscript(null);
                        setSpeakingSegments(null);
                        setSpeakingAvgLogprob(0);
                        setSpeakingNoSpeechMax(0);
                        setSpeakingFeedback(null);
                        setSpeakingError(null);
                        setSpeakingStep("idle");
                      }}
                      className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                    >
                      🎙️ Ghi âm lại
                    </button>
                  </div>
                </div>
              )}

              {/* Dang phan tich */}
              {speakingStep === "analysing" && (
                <p className="text-sm text-indigo-600 font-medium animate-pulse">
                  🤖 AI đang phân tích...
                </p>
              )}

              {/* BUOC 3: FEEDBACK */}
              {speakingFeedback && speakingStep === "done" && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-[#1a3a5c] to-indigo-700 rounded-2xl p-5 text-white flex items-center justify-between shadow-lg">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-indigo-200 mb-1">
                        Ngữ pháp + Từ vựng
                      </p>
                      <p className="text-5xl font-extrabold tracking-tight">
                        {speakingFeedback.band_estimate.toFixed(1)}
                      </p>
                    </div>
                    <div className="text-right space-y-1 text-sm text-indigo-200">
                      <p>Fluency: <span className="font-bold text-white">{speakingFeedback.criteria?.fluency?.toFixed(1)}</span></p>
                      <p>Vocabulary: <span className="font-bold text-white">{speakingFeedback.criteria?.vocabulary?.toFixed(1)}</span></p>
                      <p>Grammar: <span className="font-bold text-white">{speakingFeedback.criteria?.grammar?.toFixed(1)}</span></p>
                      <p className="text-indigo-300 italic text-xs">Pronunciation: chưa thể đánh giá</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                      Chi tiết tiêu chí IELTS
                    </p>
                    <div className="space-y-3">
                      {[
                        { key: "fluency" as const, label: "Fluency & Coherence", color: "bg-teal-500" },
                        { key: "vocabulary" as const, label: "Lexical Resource", color: "bg-blue-500" },
                        { key: "grammar" as const, label: "Grammatical Range", color: "bg-purple-500" },
                      ].map(({ key, label, color }) => {
                        const score = speakingFeedback.criteria?.[key] ?? speakingFeedback.band_estimate;
                        const pct = ((score - 4) / 5) * 100;
                        return (
                          <div key={key}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-slate-600">{label}</span>
                              <span className="text-sm font-bold text-slate-800">{score.toFixed(1)}</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-slate-100">
                              <div className={`h-2 rounded-full transition-all duration-700 ${color}`} style={{ width: `${Math.max(pct, 0)}%` }} />
                            </div>
                          </div>
                        );
                      })}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-slate-400">Pronunciation</span>
                          <span className="text-xs text-slate-400 italic">Chưa thể đánh giá</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100">
                          <div className="h-2 rounded-full bg-slate-200" style={{ width: "0%" }} />
                        </div>
                        {speakingFeedback.pronunciation_note && (
                          <p className="mt-1 text-[10px] text-slate-400 italic">
                            {speakingFeedback.pronunciation_note}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {(speakingFeedback.error_labels?.length ?? 0) > 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                        Phân tích lỗi
                      </p>
                      <div className="space-y-3">
                        {speakingFeedback.error_labels!.map((err, i: number) => {
                          const styleMap: Record<string, { bg: string; text: string; label: string }> = {
                            grammar_error: { bg: "#fee2e2", text: "#b91c1c", label: "🔴 Ngữ pháp" },
                            vocabulary_error: { bg: "#dbeafe", text: "#1d4ed8", label: "🔵 Từ vựng" },
                            possible_stt_error: { bg: "#fef9c3", text: "#a16207", label: "🟡 Có thể do nhận dạng" },
                            pronunciation_proxy: { bg: "#ffedd5", text: "#c2410c", label: "🔶 Phát âm (chưa xác nhận)" },
                          };
                          const style = styleMap[err.type] ?? styleMap.grammar_error;
                          return (
                            <div key={i} className="rounded-xl border border-slate-100 p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                                  style={{ background: style.bg, color: style.text }}
                                >
                                  {style.label}
                                </span>
                                <code className="text-xs text-red-700 bg-red-50 px-1.5 py-0.5 rounded">
                                  &ldquo;{err.span}&rdquo;
                                </code>
                              </div>
                              <p className="text-xs text-slate-600">{err.explanation_vi}</p>
                              {err.suggested_correction && (
                                <p className="mt-1 text-xs text-teal-700 font-medium">
                                  → {err.suggested_correction}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 text-emerald-500 text-lg">✅</span>
                      <div>
                        <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
                          Điểm mạnh
                        </p>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {speakingFeedback.strengths_vi}
                        </p>
                      </div>
                    </div>
                    <div className="border-t border-slate-100 pt-3">
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 text-red-500 text-lg">❌</span>
                        <div>
                          <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2">
                            Cần cải thiện
                          </p>
                          <ul className="space-y-1.5">
                            {(speakingFeedback.improvements_vi ?? []).map((tip, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                <span className="mt-0.5 shrink-0 h-4 w-4 rounded-full bg-red-100 text-red-600 text-[10px] font-bold flex items-center justify-center">
                                  {i + 1}
                                </span>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-indigo-200 overflow-hidden shadow-sm">
                    <div className="flex items-center gap-2 bg-indigo-50 border-b border-indigo-100 px-5 py-3">
                      <span className="text-base">✨</span>
                      <p className="text-sm font-bold text-indigo-800">Câu trả lời mẫu Band 7</p>
                      {speakingFeedback.task_relevance === "cannot_assess" && (
                        <span className="ml-2 text-[10px] text-amber-600 italic">
                          ⚠ Câu mẫu có thể không đúng chủ đề
                        </span>
                      )}
                      <span className="ml-auto rounded-full bg-indigo-600 px-2.5 py-0.5 text-[11px] font-bold text-white">
                        Recommended
                      </span>
                    </div>
                    <div className="px-5 py-4">
                      <p className="text-sm text-slate-700 leading-relaxed italic">
                        &quot;{speakingFeedback.model_answer_band7}&quot;
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-amber-50 border border-amber-200 px-5 py-4 flex items-start gap-3">
                    <span className="text-xl mt-0.5">💡</span>
                    <div>
                      <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
                        Scholar Tip
                      </p>
                      <p className="text-sm text-amber-900">{speakingFeedback.scholar_tip_vi}</p>
                    </div>
                  </div>

                  {speakingFeedback.upgraded_sentence && (
                    <div className="bg-indigo-50 rounded-2xl border border-indigo-100 p-5">
                      <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">
                        🚀 Câu được nâng cấp
                      </p>
                      <p className="text-slate-800 italic leading-relaxed">
                        {speakingFeedback.upgraded_sentence}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-center pt-2">
                    <button
                      onClick={() => {
                        setSpeakingTranscript("");
                        setConfirmedSpeakingTranscript(null);
                        setSpeakingSegments(null);
                        setSpeakingAvgLogprob(0);
                        setSpeakingNoSpeechMax(0);
                        setSpeakingFeedback(null);
                        setSpeakingError(null);
                        setSpeakingStep("idle");
                      }}
                      className="rounded-2xl bg-[#1a3a5c] px-8 py-3 text-sm font-bold text-white hover:bg-[#15304f] transition-colors shadow-lg"
                    >
                      🎙️ Ghi âm lại
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STAGE: Complete */}
          {stage === "complete" && (
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6 text-center">
              <div className="text-6xl mb-4">{"🎉"}</div>
              <h2 className="text-3xl font-bold text-gray-900">
                Congratulations!
              </h2>
              <p className="text-lg text-gray-700">
                You&apos;ve completed {unitData.title}
              </p>

              {/* Badge */}
              <div className="bg-yellow-50 border-2 border-yellow-400 p-6 rounded-lg my-6">
                <div className="text-4xl font-bold text-yellow-600 mb-2">
                  {unitData.completion.badge?.icon}
                </div>
                <p className="font-semibold text-gray-900">
                  {unitData.completion.badge?.name}
                </p>
                <p className="text-gray-700 mt-2">
                  {unitData.completion.badge?.description_vi}
                </p>
              </div>

              {/* XP summary */}
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-6 text-white shadow-lg">
                <p className="text-sm font-bold uppercase tracking-widest opacity-80 mb-1">
                  Tổng XP phiên này
                </p>
                <p className="text-5xl font-extrabold">{"✨"} {sessionXp} XP</p>
                <div className="mt-3 flex justify-center gap-6 text-xs opacity-90">
                  <span>📝 Trắc nghiệm: +10 XP/câu (5 câu = 50 XP)</span>
                  <span>
                    {"🏆"} Hoàn thành: +{xpReward} XP
                  </span>
                </div>
              </div>

              {/* Next unit {"⏭"} fallback theo roadmap nếu content chưa khai báo */}
              {resolvedNextUnitId && (
                <div className="mt-4 p-6 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-gray-900 font-semibold mb-2">
                    Next Challenge:
                  </p>
                  <p className="text-lg text-indigo-600 font-semibold">
                    {resolvedNextUnitTitle}
                  </p>
                  <p className="text-sm text-gray-700 mt-2">
                    {nextUnitConnection}
                  </p>
                </div>
              )}

              {/* Action buttons */}
              {resolvedNextUnitId ? (
                <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                  <button
                    onClick={() => {
                      router.push(`/unit/${resolvedNextUnitId}`);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors shadow-sm"
                  >
                    Continue to Next Unit {"→"}
                  </button>
                  <button
                    onClick={() => router.push("/grammar-theory")}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-8 py-3 rounded-xl font-semibold transition-colors"
                  >
                    {"📖"} Về trang Grammar
                  </button>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  <div className="rounded-xl bg-green-50 border border-green-200 px-6 py-5 text-center">
                    <p className="text-3xl mb-2">{"🌟"}</p>
                    <p className="font-bold text-green-800 text-lg">
                      Bạn đã hoàn thành tất cả units!
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      Tiếp tục luyện tập để củng cố kiến thức nhé.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => router.push("/grammar-theory")}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors shadow-sm"
                    >
                      {"📚"} Về trang Grammar
                    </button>
                    <button
                      onClick={() => router.push("/")}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-8 py-3 rounded-xl font-semibold transition-colors"
                    >
                      {"🏠"} Dashboard
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="bg-white border-t sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 py-6 flex justify-between items-center">
          <button
            onClick={handlePrev}
            disabled={currentStageIndex === 0}
            className="px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gray-200 hover:bg-gray-300 text-gray-900"
          >
            {"←"} Previous
          </button>
          <div className="text-sm text-gray-600">
            Stage {currentStageIndex + 1} of {STAGES.length}
          </div>
          <button
            onClick={handleNext}
            disabled={currentStageIndex === STAGES.length - 1}
            className="px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Next {"→"}
          </button>
        </div>
      </div>
    </div>
  );
}
