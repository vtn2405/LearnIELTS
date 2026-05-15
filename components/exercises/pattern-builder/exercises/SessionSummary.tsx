"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { ExerciseData, SessionAnswer } from "../types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface SessionSummaryProps {
  answers: Record<string, SessionAnswer>;
  exercises: ExerciseData[];
  onRetry: () => void;
  onNextLevel: () => void;
  onBackToHub: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SessionSummary({
  answers,
  exercises,
  onRetry,
  onNextLevel,
  onBackToHub,
}: SessionSummaryProps) {
  // ── Derived data ──
  const totalExercises = exercises.length;
  const correctCount = useMemo(
    () => Object.values(answers).filter((a) => a.isCorrect).length,
    [answers]
  );
  const accuracy = Math.round((correctCount / totalExercises) * 100);

  // Patterns built (from correct exercises)
  const patternsBuilt = useMemo(
    () =>
      exercises
        .filter((ex) => answers[ex.id]?.isCorrect)
        .map((ex) => ex.reusablePattern),
    [exercises, answers]
  );

  // Areas to improve (from incorrect exercises)
  const areasToImprove = useMemo(
    () =>
      exercises
        .filter((ex) => answers[ex.id] && !answers[ex.id].isCorrect)
        .map((ex) => ex.feedback.commonMistake),
    [exercises, answers]
  );

  // Score tier for emoji/message
  const tier = accuracy >= 85 ? "excellent" : accuracy >= 60 ? "good" : "needs-work";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* ═══ Header ═══ */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%", margin: "0 auto 14px",
          background: tier === "excellent"
            ? "rgba(13,148,136,0.1)"
            : tier === "good"
            ? "rgba(245,158,11,0.1)"
            : "rgba(239,68,68,0.08)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28,
        }}>
          {tier === "excellent" ? "🎉" : tier === "good" ? "💪" : "📝"}
        </div>
        <h2 style={{
          margin: "0 0 6px", fontSize: 20, fontWeight: 700, color: "#1a2f3f",
          fontFamily: "var(--font-plus-jakarta), 'Plus Jakarta Sans', sans-serif",
        }}>
          Session Complete!
        </h2>
        <p style={{ margin: 0, fontSize: 13, color: "#6b7a87" }}>
          {tier === "excellent"
            ? "Outstanding work — you nailed it!"
            : tier === "good"
            ? "Solid session — keep building!"
            : "Good effort — review the patterns below."}
        </p>
      </div>

      {/* ═══ Score Card ═══ */}
      <div style={{
        borderRadius: 12, padding: "22px 24px", marginBottom: 20,
        background: "#ffffff", border: "1px solid #e4e8ed",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#6b7a87" }}>Accuracy</span>
          <span style={{
            fontSize: 26, fontWeight: 700,
            color: accuracy >= 70 ? "#0d9488" : accuracy >= 50 ? "#f59e0b" : "#ef4444",
            fontFamily: "var(--font-jetbrains-mono), 'JetBrains Mono', monospace",
          }}>
            {accuracy}%
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ height: 6, borderRadius: 9999, background: "#f0f4f8", overflow: "hidden", marginBottom: 12 }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${accuracy}%` }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            style={{
              height: "100%", borderRadius: 9999,
              background: accuracy >= 70
                ? "linear-gradient(90deg, #0d9488, #14b8a6)"
                : accuracy >= 50
                ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                : "linear-gradient(90deg, #ef4444, #f87171)",
            }}
          />
        </div>

        {/* Correct / Incorrect counts */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: "#0d9488", fontWeight: 600 }}>
            ✓ {correctCount} correct
          </span>
          <span style={{ fontSize: 12, color: "#ef4444", fontWeight: 600 }}>
            ✗ {totalExercises - correctCount} incorrect
          </span>
        </div>
      </div>

      {/* ═══ Patterns Built ═══ */}
      {patternsBuilt.length > 0 && (
        <div style={{
          borderRadius: 12, padding: "18px 22px", marginBottom: 16,
          background: "#ffffff", border: "1px solid #e4e8ed",
        }}>
          <p style={{
            margin: "0 0 12px", fontSize: 11, fontWeight: 700,
            letterSpacing: "0.1em", textTransform: "uppercase", color: "#0d9488",
          }}>
            ✓ Patterns You Built
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {patternsBuilt.map((pattern, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: "#0d9488",
                  marginTop: 3, flexShrink: 0,
                  background: "rgba(13,148,136,0.08)", borderRadius: 3,
                  padding: "1px 5px",
                }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p style={{
                  margin: 0, fontSize: 13, color: "#2d4a5e", lineHeight: 1.6,
                  fontFamily: "var(--font-jetbrains-mono), 'JetBrains Mono', monospace",
                  fontStyle: "italic",
                }}>
                  {pattern.length > 90 ? pattern.slice(0, 90) + "…" : pattern}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ Areas to Improve ═══ */}
      {areasToImprove.length > 0 && (
        <div style={{
          borderRadius: 12, padding: "18px 22px", marginBottom: 16,
          background: "#fffbf5", border: "1px solid #fde9c3",
        }}>
          <p style={{
            margin: "0 0 12px", fontSize: 11, fontWeight: 700,
            letterSpacing: "0.1em", textTransform: "uppercase", color: "#b45309",
          }}>
            ⚠ Areas to Improve
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {areasToImprove.map((mistake, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{
                  fontSize: 11, color: "#f59e0b", marginTop: 3, flexShrink: 0,
                }}>
                  •
                </span>
                <p style={{
                  margin: 0, fontSize: 13, color: "#5a4a20", lineHeight: 1.6,
                }}>
                  {mistake}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ Next Steps ═══ */}
      <div style={{
        borderRadius: 12, padding: "18px 22px", marginBottom: 20,
        background: "#ffffff", border: "1px solid #e4e8ed",
      }}>
        <p style={{
          margin: "0 0 14px", fontSize: 11, fontWeight: 700,
          letterSpacing: "0.1em", textTransform: "uppercase", color: "#a0adb8",
        }}>
          Next Steps
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Retry */}
          <button
            onClick={onRetry}
            style={{
              width: "100%", textAlign: "left",
              fontSize: 13, fontWeight: 600, padding: "11px 16px", borderRadius: 8,
              border: "1.5px solid #e4e8ed", background: "#fafbfc", color: "#1a2f3f",
              cursor: "pointer",
              display: "flex", alignItems: "center", gap: 10,
              transition: "border-color 0.15s ease, background 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#0d9488";
              e.currentTarget.style.background = "rgba(13,148,136,0.03)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e4e8ed";
              e.currentTarget.style.background = "#fafbfc";
            }}
          >
            <span style={{ fontSize: 16 }}>🔄</span>
            <div>
              <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a2f3f" }}>
                Retry with new topic
              </span>
              <span style={{ fontSize: 11, color: "#6b7a87" }}>
                Practice the same grammar with different sentences
              </span>
            </div>
          </button>

          {/* Next level */}
          <button
            onClick={onNextLevel}
            style={{
              width: "100%", textAlign: "left",
              fontSize: 13, fontWeight: 600, padding: "11px 16px", borderRadius: 8,
              border: "1.5px solid rgba(13,148,136,0.3)", background: "rgba(13,148,136,0.04)", color: "#1a2f3f",
              cursor: "pointer",
              display: "flex", alignItems: "center", gap: 10,
              transition: "border-color 0.15s ease, background 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#0d9488";
              e.currentTarget.style.background = "rgba(13,148,136,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(13,148,136,0.3)";
              e.currentTarget.style.background = "rgba(13,148,136,0.04)";
            }}
          >
            <span style={{ fontSize: 16 }}>📈</span>
            <div>
              <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#0d9488" }}>
                Move to Challenge level
              </span>
              <span style={{ fontSize: 11, color: "#6b7a87" }}>
                Harder exercises with less scaffolding
              </span>
            </div>
          </button>

          {/* Apply in Writing */}
          <button
            onClick={onBackToHub}
            style={{
              width: "100%", textAlign: "left",
              fontSize: 13, fontWeight: 600, padding: "11px 16px", borderRadius: 8,
              border: "1.5px solid rgba(25,74,109,0.2)", background: "rgba(25,74,109,0.03)", color: "#1a2f3f",
              cursor: "pointer",
              display: "flex", alignItems: "center", gap: 10,
              transition: "border-color 0.15s ease, background 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#194a6d";
              e.currentTarget.style.background = "rgba(25,74,109,0.06)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(25,74,109,0.2)";
              e.currentTarget.style.background = "rgba(25,74,109,0.03)";
            }}
          >
            <span style={{ fontSize: 16 }}>✍️</span>
            <div>
              <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#194a6d" }}>
                Apply in Writing Task 2
              </span>
              <span style={{ fontSize: 11, color: "#6b7a87" }}>
                Use these patterns in a full essay
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* ═══ Back to hub ═══ */}
      <div style={{ textAlign: "center" }}>
        <button
          onClick={onBackToHub}
          style={{
            fontSize: 12, fontWeight: 600, padding: "8px 16px", borderRadius: 6,
            border: "none", background: "transparent", color: "#6b7a87",
            cursor: "pointer", textDecoration: "underline",
          }}
        >
          ← Back to Pattern Builder
        </button>
      </div>
    </motion.div>
  );
}
