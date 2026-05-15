"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SpeakExerciseData } from "../types";
import { HintSystem } from "./HintSystem";

// ─── Props ────────────────────────────────────────────────────────────────────

interface SpeakExerciseProps {
  exercise: SpeakExerciseData;
  onSubmit: (answer: string, isCorrect: boolean) => void;
  showFeedback: boolean;
}

// ─── Mode type ────────────────────────────────────────────────────────────────

type Mode = "idle" | "recording" | "typing" | "done";

// ─── Component ────────────────────────────────────────────────────────────────

export function SpeakExercise({ exercise, onSubmit, showFeedback }: SpeakExerciseProps) {
  const [mode, setMode] = useState<Mode>("idle");
  const [userInput, setUserInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const duration = exercise.speakingConfig.durationSeconds;

  // Reset on exercise change
  useEffect(() => {
    setMode("idle");
    setUserInput("");
    setSubmitted(false);
    setIsCorrect(null);
    setElapsed(0);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [exercise.id]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // ── Recording simulation ──
  const handleStartRecording = useCallback(() => {
    setMode("recording");
    setElapsed(0);

    timerRef.current = setInterval(() => {
      setElapsed((prev) => {
        if (prev + 1 >= duration) {
          // Auto-stop when time is up
          if (timerRef.current) clearInterval(timerRef.current);
          setMode("done");
          setUserInput("[spoken response — mock recording]");
          return duration;
        }
        return prev + 1;
      });
    }, 1000);
  }, [duration]);

  const handleStopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setMode("done");
    setUserInput("[spoken response — mock recording]");
  }, []);

  // ── Type instead ──
  const handleTypeInstead = useCallback(() => {
    setMode("typing");
  }, []);

  // ── Submit ──
  const handleSubmit = useCallback(() => {
    if (submitted) return;

    const answer = userInput.toLowerCase().trim();

    // Mock grading: accept if meaningful length
    const hasIdeas = exercise.answer.requiredIdeas.some((idea) =>
      idea.split(" ").some((word) => answer.includes(word.toLowerCase()))
    );
    const correct = mode === "done"
      ? true // Mock: recording always passes
      : hasIdeas && answer.length > 15;

    setIsCorrect(correct);
    setSubmitted(true);
    onSubmit(userInput.trim(), correct);
  }, [userInput, submitted, exercise, onSubmit, mode]);

  // ── Skip ──
  const handleSkip = useCallback(() => {
    if (submitted) return;
    setIsCorrect(false);
    setSubmitted(true);
    onSubmit("[skipped]", false);
  }, [submitted, onSubmit]);

  const progressPct = Math.min((elapsed / duration) * 100, 100);

  return (
    <div>
      {/* ── Instruction ── */}
      <p style={{
        margin: "0 0 14px", fontSize: 14, fontWeight: 600, color: "#194a6d",
        lineHeight: 1.5,
      }}>
        {exercise.prompt.instruction}
      </p>

      {/* ── Cue card ── */}
      <div style={{
        marginBottom: 20, padding: "16px 20px", borderRadius: 8,
        background: "#f8f7f5", border: "1px solid #e8e4de",
        borderLeft: "3px solid #194a6d",
      }}>
        <p style={{
          margin: 0, fontSize: 15, color: "#2d4a5e", lineHeight: 1.7, fontWeight: 500,
        }}>
          {exercise.prompt.cue}
        </p>
      </div>

      {/* ── Duration badge ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8, marginBottom: 18,
      }}>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
          padding: "3px 8px", borderRadius: 4,
          background: "rgba(25,74,109,0.06)", color: "#194a6d",
          border: "1px solid rgba(25,74,109,0.12)",
        }}>
          ⏱ {duration}s
        </span>
      </div>

      {/* ── Main interaction area ── */}
      <AnimatePresence mode="wait">
        {/* IDLE: Show Record + Type Instead */}
        {mode === "idle" && !submitted && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={{
              padding: "24px 20px", borderRadius: 10,
              background: "#fafbfc", border: "1.5px dashed #d1d9e0",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
            }}
          >
            {/* Record button */}
            <button
              onClick={handleStartRecording}
              style={{
                fontSize: 14, fontWeight: 700, padding: "12px 28px", borderRadius: 8,
                border: "none", background: "#194a6d", color: "#ffffff",
                cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: 8,
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#1e3a5f"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#194a6d"; }}
            >
              <MicIcon />
              Record Response
            </button>

            {/* Divider */}
            {exercise.speakingConfig.allowTypeInstead && (
              <>
                <div style={{
                  display: "flex", alignItems: "center", gap: 12, width: "100%",
                }}>
                  <div style={{ flex: 1, height: 1, background: "#e4e8ed" }} />
                  <span style={{ fontSize: 11, color: "#a0adb8", fontWeight: 500 }}>or</span>
                  <div style={{ flex: 1, height: 1, background: "#e4e8ed" }} />
                </div>

                {/* Type instead button */}
                <button
                  onClick={handleTypeInstead}
                  style={{
                    fontSize: 12, fontWeight: 600, padding: "8px 16px", borderRadius: 6,
                    border: "1.5px solid #e4e8ed", background: "#ffffff", color: "#6b7a87",
                    cursor: "pointer",
                    display: "inline-flex", alignItems: "center", gap: 6,
                  }}
                >
                  ✏️ Type Instead
                </button>
              </>
            )}
          </motion.div>
        )}

        {/* RECORDING: Timer + Stop */}
        {mode === "recording" && (
          <motion.div
            key="recording"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={{
              padding: "20px 24px", borderRadius: 10,
              background: "rgba(239,68,68,0.03)", border: "1.5px solid rgba(239,68,68,0.2)",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
            }}
          >
            {/* Recording indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                width: 10, height: 10, borderRadius: "50%",
                background: "#ef4444",
                animation: "pulse 1.2s ease-in-out infinite",
              }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#ef4444" }}>
                Recording...
              </span>
              <span style={{
                fontSize: 16, fontWeight: 700, color: "#1a2f3f",
                fontFamily: "var(--font-jetbrains-mono), monospace",
              }}>
                {elapsed}s / {duration}s
              </span>
            </div>

            {/* Progress bar */}
            <div style={{ width: "100%", height: 6, borderRadius: 9999, background: "#fde8e8", overflow: "hidden" }}>
              <motion.div
                style={{
                  height: "100%", borderRadius: 9999,
                  background: "linear-gradient(90deg, #ef4444, #f87171)",
                }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.3, ease: "linear" }}
              />
            </div>

            {/* Stop button */}
            <button
              onClick={handleStopRecording}
              style={{
                fontSize: 12, fontWeight: 700, padding: "8px 18px", borderRadius: 6,
                border: "none", background: "#ef4444", color: "#ffffff",
                cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: 6,
              }}
            >
              ⏹ Stop
            </button>
          </motion.div>
        )}

        {/* DONE (after recording): Show mock transcript */}
        {mode === "done" && !submitted && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={{
              padding: "16px 20px", borderRadius: 8,
              background: "rgba(13,148,136,0.04)", border: "1px solid rgba(13,148,136,0.15)",
            }}
          >
            <p style={{
              margin: "0 0 4px", fontSize: 10, fontWeight: 700,
              letterSpacing: "0.08em", textTransform: "uppercase", color: "#a0adb8",
            }}>
              Recording captured ({elapsed}s)
            </p>
            <p style={{
              margin: 0, fontSize: 13, color: "#5a7080", fontStyle: "italic",
            }}>
              [Mock: voice transcript will appear here in Phase 2]
            </p>
          </motion.div>
        )}

        {/* TYPING: Textarea */}
        {mode === "typing" && !submitted && (
          <motion.div
            key="typing"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) handleSubmit();
              }}
              placeholder="Type your spoken response here…"
              rows={4}
              autoFocus
              style={{
                width: "100%", padding: "14px 16px", borderRadius: 8,
                border: "1.5px solid #e4e8ed", background: "#fafbfc",
                fontSize: 14, color: "#1a2f3f", lineHeight: 1.7,
                resize: "vertical",
                fontFamily: "var(--font-inter), Inter, sans-serif",
                outline: "none",
              }}
              aria-label="Type your spoken response"
            />
            <p style={{ margin: "4px 0 0", fontSize: 11, color: "#a0adb8" }}>
              Ctrl+Enter to submit
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Submitted state: show textarea content ── */}
      {submitted && mode === "typing" && (
        <div style={{
          padding: "12px 16px", borderRadius: 8,
          border: isCorrect ? "2px solid #0d9488" : "2px solid #ef4444",
          background: isCorrect ? "rgba(13,148,136,0.03)" : "rgba(239,68,68,0.03)",
        }}>
          <p style={{ margin: 0, fontSize: 14, color: "#2d4a5e", lineHeight: 1.7 }}>
            {userInput}
          </p>
        </div>
      )}

      {/* ── Hint System ── */}
      {!submitted && mode !== "recording" && (
        <div style={{ marginTop: 16 }}>
          <HintSystem scaffolding={exercise.scaffolding} />
        </div>
      )}

      {/* ── Action buttons ── */}
      {!submitted && mode !== "recording" && (mode === "typing" || mode === "done") && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
          {/* Skip button */}
          {exercise.speakingConfig.allowSkip && (
            <button
              onClick={handleSkip}
              style={{
                fontSize: 12, fontWeight: 600, padding: "8px 14px", borderRadius: 6,
                border: "1.5px solid #e4e8ed", background: "#ffffff", color: "#6b7a87",
                cursor: "pointer",
              }}
            >
              Skip →
            </button>
          )}

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={mode === "typing" && !userInput.trim()}
            style={{
              fontSize: 13, fontWeight: 700, padding: "9px 22px", borderRadius: 6,
              border: "none",
              background: (mode === "done" || userInput.trim()) ? "#0d9488" : "#e4e8ed",
              color: (mode === "done" || userInput.trim()) ? "#ffffff" : "#a0adb8",
              cursor: (mode === "done" || userInput.trim()) ? "pointer" : "not-allowed",
              display: "inline-flex", alignItems: "center", gap: 6,
              marginLeft: "auto",
            }}
          >
            Submit ✓
          </button>
        </div>
      )}

      {/* ── Skip in idle mode ── */}
      {!submitted && mode === "idle" && exercise.speakingConfig.allowSkip && (
        <div style={{ marginTop: 14, textAlign: "center" }}>
          <button
            onClick={handleSkip}
            style={{
              fontSize: 11, fontWeight: 500, padding: "6px 12px", borderRadius: 5,
              border: "none", background: "transparent", color: "#a0adb8",
              cursor: "pointer", textDecoration: "underline",
            }}
          >
            Skip this exercise
          </button>
        </div>
      )}

      {/* ── Result indicator ── */}
      {submitted && !showFeedback && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", marginTop: 12 }}>
          <span style={{
            fontSize: 13, fontWeight: 700,
            color: isCorrect ? "#0d9488" : "#ef4444",
          }}>
            {isCorrect ? "✓ Good job!" : "✗ Not quite"}
          </span>
        </div>
      )}

      {/* ── Sample answer (always show after submit) ── */}
      {submitted && (
        <div style={{ marginTop: 14 }}>
          <p style={{
            margin: "0 0 4px", fontSize: 10, fontWeight: 700,
            letterSpacing: "0.08em", textTransform: "uppercase", color: "#a0adb8",
          }}>
            Sample Answer
          </p>
          <p style={{
            margin: 0, fontSize: 13, color: "#5a7080", lineHeight: 1.7,
            fontStyle: "italic",
            padding: "10px 14px", borderRadius: 6,
            background: "rgba(25,74,109,0.03)", border: "1px solid rgba(25,74,109,0.08)",
          }}>
            {exercise.answer.sampleAnswer}
          </p>
        </div>
      )}

      {/* ── Pulse animation ── */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}

// ─── Mic Icon ─────────────────────────────────────────────────────────────────

function MicIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="9" y="2" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M5 10a7 7 0 0 0 14 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="9" y1="21" x2="15" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
