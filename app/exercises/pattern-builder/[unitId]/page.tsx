"use client";

import { useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import type {
  ExerciseData,
  SessionAnswer,
  FillExerciseData,
  BuildExerciseData,
  TransformExerciseData,
  SpeakExerciseData,
  MasterExerciseData,
} from "@/components/exercises/pattern-builder/types";
import { FillExercise } from "@/components/exercises/pattern-builder/exercises/FillExercise";
import { BuildExercise } from "@/components/exercises/pattern-builder/exercises/BuildExercise";
import { FeedbackPanel } from "@/components/exercises/pattern-builder/exercises/FeedbackPanel";
import { TransformExercise } from "@/components/exercises/pattern-builder/exercises/TransformExercise";
import { SpeakExercise } from "@/components/exercises/pattern-builder/exercises/SpeakExercise";
import { MasterExercise } from "@/components/exercises/pattern-builder/exercises/MasterExercise";
import { SessionSummary } from "@/components/exercises/pattern-builder/exercises/SessionSummary";

// ─── Mock data import ─────────────────────────────────────────────────────────
import allExercises from "@/data/pattern-builder/unit-01-simple-present/exercises.json";

// ─── Unit name mapping ────────────────────────────────────────────────────────
const UNIT_NAMES: Record<string, string> = {
  "unit-1-simple-present": "Simple Present",
  "unit-1-present-continuous": "Present Continuous",
  "unit-1-simple-past": "Simple Past",
  "unit-1-past-continuous": "Past Continuous",
  "unit-2-present-perfect": "Present Perfect",
};

// ─── Pick 7 exercises for session ─────────────────────────────────────────────
function pickSessionExercises(pool: ExerciseData[]): ExerciseData[] {
  const fill = pool.filter((e) => e.type === "FILL");
  const build = pool.filter((e) => e.type === "BUILD");
  const transform = pool.filter((e) => e.type === "TRANSFORM");
  const speak = pool.filter((e) => e.type === "SPEAK");
  const master = pool.filter((e) => e.type === "MASTER");

  const picked: ExerciseData[] = [
    ...fill.slice(0, 2),
    ...build.slice(0, 2),
    ...transform.slice(0, 1),
    ...speak.slice(0, 1),
    ...master.slice(0, 1),
  ];

  return picked.length >= 7 ? picked.slice(0, 7) : picked;
}

// ─── Skill icon mapping ───────────────────────────────────────────────────────
function getSkillIcon(skill: string): string {
  switch (skill.toLowerCase()) {
    case "speaking": return "🗣";
    case "writing": return "✍️";
    case "reading": return "📖";
    case "listening": return "🎧";
    default: return "📝";
  }
}

// ─── Level badge color ────────────────────────────────────────────────────────
function getLevelStyle(level: string): { bg: string; color: string; border: string } {
  switch (level) {
    case "starter": return { bg: "rgba(13,148,136,0.08)", color: "#0d9488", border: "rgba(13,148,136,0.2)" };
    case "build_up": return { bg: "rgba(59,130,246,0.08)", color: "#2563eb", border: "rgba(59,130,246,0.2)" };
    case "challenge": return { bg: "rgba(245,158,11,0.08)", color: "#b45309", border: "rgba(245,158,11,0.2)" };
    case "master": return { bg: "rgba(139,92,246,0.08)", color: "#7c3aed", border: "rgba(139,92,246,0.2)" };
    default: return { bg: "#f0f4f8", color: "#6b7a87", border: "#e4e8ed" };
  }
}

// ─── Exercise type badge ──────────────────────────────────────────────────────
function getTypeLabel(type: string): string {
  switch (type) {
    case "FILL": return "Fill the Gap";
    case "BUILD": return "Build Sentence";
    case "TRANSFORM": return "Transform";
    case "SPEAK": return "Speak";
    case "MASTER": return "Master";
    default: return type;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function PatternBuilderSessionPage() {
  const params = useParams();
  const router = useRouter();
  const unitId = params.unitId as string;
  const unitName = UNIT_NAMES[unitId] ?? "Grammar Unit";

  // ── Session state ──
  const exercises = useMemo(
    () => pickSessionExercises(allExercises as unknown as ExerciseData[]),
    []
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, SessionAnswer>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);

  const currentExercise = exercises[currentIndex];
  const totalExercises = exercises.length;
  const progressPct = Math.round(((currentIndex + (showFeedback ? 1 : 0)) / totalExercises) * 100);

  // ── Handlers ──
  const handleSubmitAnswer = useCallback(
    (userAnswer: string, isCorrect: boolean) => {
      if (!currentExercise) return;
      setAnswers((prev) => ({
        ...prev,
        [currentExercise.id]: { userAnswer, isCorrect },
      }));
      setShowFeedback(true);
    },
    [currentExercise]
  );

  const handleNext = useCallback(() => {
    setShowFeedback(false);
    if (currentIndex + 1 >= totalExercises) {
      setSessionComplete(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, totalExercises]);

  const handleBack = useCallback(() => {
    if (currentIndex > 0) {
      setShowFeedback(false);
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex]);

  const handleRetry = useCallback(() => {
    setCurrentIndex(0);
    setAnswers({});
    setShowFeedback(false);
    setSessionComplete(false);
  }, []);

  // ── Session Summary ──
  if (sessionComplete) {
    return (
      <main style={{ minHeight: "100vh", background: "#f4f6f8", fontFamily: "var(--font-inter), Inter, sans-serif" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "48px 24px" }}>
          <SessionSummary
            answers={answers}
            exercises={exercises}
            onRetry={handleRetry}
            onNextLevel={() => router.push("/exercises/pattern-builder")}
            onBackToHub={() => router.push("/exercises/pattern-builder")}
          />
        </div>
      </main>
    );
  }

  if (!currentExercise) return null;

  // ── Main session UI ──
  const levelStyle = getLevelStyle(currentExercise.level);

  return (
    <main style={{ minHeight: "100vh", background: "#f4f6f8", fontFamily: "var(--font-inter), Inter, sans-serif" }}>
      {/* ═══ Header ═══ */}
      <header style={{
        background: "#ffffff", borderBottom: "1px solid #e4e8ed",
        padding: "16px 24px",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          {/* Top row: back + unit name + counter */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                onClick={() => router.push("/exercises/pattern-builder")}
                aria-label="Back to Pattern Builder"
                style={{
                  width: 32, height: 32, borderRadius: 6, border: "1px solid #e4e8ed",
                  background: "#ffffff", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#6b7a87", fontSize: 16,
                }}
              >
                ←
              </button>
              <h1 style={{
                margin: 0, fontSize: 15, fontWeight: 700, color: "#1a2f3f",
                fontFamily: "var(--font-plus-jakarta), 'Plus Jakarta Sans', sans-serif",
              }}>
                {unitName}
              </h1>
            </div>
            <span style={{
              fontSize: 12, fontWeight: 700, color: "#6b7a87",
              padding: "4px 10px", borderRadius: 5,
              background: "#f0f4f8", border: "1px solid #e4e8ed",
            }}>
              Exercise {currentIndex + 1} / {totalExercises}
            </span>
          </div>

          {/* Progress bar */}
          <div style={{ height: 4, borderRadius: 9999, background: "#f0f4f8", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 9999,
              width: `${progressPct}%`,
              background: "linear-gradient(90deg, #0d9488, #14b8a6)",
              transition: "width 0.4s ease",
            }} />
          </div>
        </div>
      </header>

      {/* ═══ Body ═══ */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 24px 80px" }}>
        {/* IELTS + Topic badges */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {/* IELTS skill badge */}
          <span style={{
            fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 5,
            background: "rgba(25,74,109,0.06)", color: "#194a6d",
            border: "1px solid rgba(25,74,109,0.12)",
          }}>
            {getSkillIcon(currentExercise.ieltsUse.skill)} {currentExercise.ieltsUse.skill} {currentExercise.ieltsUse.part}
          </span>
          {/* Topic badge */}
          <span style={{
            fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 5,
            background: "#f0f4f8", color: "#6b7a87",
            border: "1px solid #e4e8ed",
            textTransform: "capitalize",
          }}>
            {currentExercise.topic}
          </span>
          {/* Level badge */}
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
            padding: "3px 8px", borderRadius: 4,
            background: levelStyle.bg, color: levelStyle.color,
            border: `1px solid ${levelStyle.border}`,
          }}>
            {currentExercise.level.replace("_", " ")}
          </span>
          {/* Type badge */}
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
            padding: "3px 8px", borderRadius: 4,
            background: "rgba(139,92,246,0.06)", color: "#7c3aed",
            border: "1px solid rgba(139,92,246,0.15)",
          }}>
            {getTypeLabel(currentExercise.type)}
          </span>
        </div>

        {/* ═══ Exercise Card ═══ */}
        <div style={{
          borderRadius: 12, padding: "28px 28px 24px",
          background: "#ffffff", border: "1px solid #e4e8ed",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          marginBottom: 16,
        }}>
          {/* Render exercise based on type */}
          {currentExercise.type === "FILL" && (
            <FillExercise
              exercise={currentExercise}
              onSubmit={handleSubmitAnswer}
              showFeedback={showFeedback}
            />
          )}
          {currentExercise.type === "BUILD" && (
            <BuildExercise
              exercise={currentExercise}
              onSubmit={(answer, isCorrect) => handleSubmitAnswer(answer.join(" → "), isCorrect)}
              showFeedback={showFeedback}
            />
          )}
          {currentExercise.type === "TRANSFORM" && (
            <TransformExercise
              exercise={currentExercise}
              onSubmit={handleSubmitAnswer}
              showFeedback={showFeedback}
            />
          )}
          {currentExercise.type === "SPEAK" && (
            <SpeakExercise
              exercise={currentExercise}
              onSubmit={handleSubmitAnswer}
              showFeedback={showFeedback}
            />
          )}
          {currentExercise.type === "MASTER" && (
            <MasterExercise
              exercise={currentExercise}
              onSubmit={handleSubmitAnswer}
              showFeedback={showFeedback}
            />
          )}
        </div>

        {/* ═══ Feedback Panel (after submit) ═══ */}
        {showFeedback && currentExercise && (
          <div style={{ marginBottom: 16 }}>
            <FeedbackPanel
              feedback={currentExercise.feedback}
              isCorrect={answers[currentExercise.id]?.isCorrect ?? false}
              ieltsUse={currentExercise.ieltsUse}
              reusablePattern={currentExercise.reusablePattern}
              grammarPattern={
                "grammarCheck" in currentExercise && "pattern" in currentExercise.grammarCheck
                  ? (currentExercise.grammarCheck as { pattern?: string }).pattern
                  : undefined
              }
            />
          </div>
        )}

        {/* ═══ Navigation ═══ */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            onClick={handleBack}
            disabled={currentIndex === 0}
            style={{
              fontSize: 12, fontWeight: 600, padding: "8px 16px", borderRadius: 6,
              border: "1px solid #e4e8ed", background: "#ffffff", color: currentIndex === 0 ? "#c4cdd6" : "#6b7a87",
              cursor: currentIndex === 0 ? "not-allowed" : "pointer",
              opacity: currentIndex === 0 ? 0.5 : 1,
            }}
          >
            ← Previous
          </button>

          {showFeedback && (
            <button
              onClick={handleNext}
              style={{
                fontSize: 13, fontWeight: 700, padding: "10px 22px", borderRadius: 6,
                border: "none", background: "#0d9488", color: "#ffffff",
                cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: 6,
              }}
            >
              {currentIndex + 1 >= totalExercises ? "Finish Session" : "Next Exercise →"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
