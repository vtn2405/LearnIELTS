"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import type { MasterExerciseData } from "../types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface MasterExerciseProps {
  exercise: MasterExerciseData;
  onSubmit: (answer: string, isCorrect: boolean) => void;
  showFeedback: boolean;
}

// ─── Timer color logic ────────────────────────────────────────────────────────

function getTimerColor(remaining: number, total: number): string {
  const ratio = remaining / total;
  if (ratio <= 0.25) return "#ef4444"; // red < 25%
  if (ratio <= 0.5) return "#f59e0b";  // amber < 50%
  return "#7c3aed";                     // purple (default)
}

function getTimerBg(remaining: number, total: number): string {
  const ratio = remaining / total;
  if (ratio <= 0.25) return "rgba(239,68,68,0.08)";
  if (ratio <= 0.5) return "rgba(245,158,11,0.08)";
  return "rgba(139,92,246,0.08)";
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MasterExercise({ exercise, onSubmit, showFeedback }: MasterExerciseProps) {
  const timerSeconds = 20;
  const [timeRemaining, setTimeRemaining] = useState(timerSeconds);
  const [timerActive, setTimerActive] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const submittedRef = useRef(false); // prevent double-submit from timer

  // Reset on exercise change
  useEffect(() => {
    setTimeRemaining(timerSeconds);
    setTimerActive(false);
    setUserInput("");
    setSubmitted(false);
    setIsCorrect(null);
    submittedRef.current = false;
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [exercise.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!timerActive || submitted) return;

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time's up — auto-submit
          if (intervalRef.current) clearInterval(intervalRef.current);
          // Use ref to prevent race condition
          if (!submittedRef.current) {
            submittedRef.current = true;
            // Defer to next tick so state is consistent
            setTimeout(() => {
              doSubmit();
            }, 0);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerActive, submitted]);

  // ── Start timer (on first keystroke) ──
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value);
    if (!timerActive && !submitted) {
      setTimerActive(true);
    }
  }, [timerActive, submitted]);

  // ── Submit logic ──
  const doSubmit = useCallback(() => {
    const answer = userInput.toLowerCase().trim();

    const hasRequired = exercise.answer.requiredTokens.every(
      (t) => answer.includes(t.toLowerCase())
    );

    const hasIdeas = exercise.answer.requiredIdeas.some((idea) =>
      idea.split(" ").some((word) => answer.includes(word.toLowerCase()))
    );

    const correct = hasRequired && hasIdeas && answer.length > 20;

    setIsCorrect(correct);
    setSubmitted(true);
    setTimerActive(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    onSubmit(userInput.trim() || "[time expired — no answer]", correct);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInput, exercise, onSubmit]);

  const handleSubmit = useCallback(() => {
    if (submitted || submittedRef.current) return;
    submittedRef.current = true;
    doSubmit();
  }, [submitted, doSubmit]);

  // ── Start button (explicit start) ──
  const handleStart = useCallback(() => {
    setTimerActive(true);
    textareaRef.current?.focus();
  }, []);

  const timerColor = getTimerColor(timeRemaining, timerSeconds);
  const timerBg = getTimerBg(timeRemaining, timerSeconds);
  const progressPct = (timeRemaining / timerSeconds) * 100;

  return (
    <div>
      {/* ── Master mode header ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8, marginBottom: 16,
      }}>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
          padding: "3px 8px", borderRadius: 4,
          background: "rgba(139,92,246,0.08)", color: "#7c3aed",
          border: "1px solid rgba(139,92,246,0.2)",
        }}>
          ⏱ Master Mode
        </span>
      </div>

      {/* ── Timer display ── */}
      <div style={{
        marginBottom: 18, padding: "12px 16px", borderRadius: 8,
        background: timerBg, border: `1px solid ${timerColor}22`,
        transition: "background 0.3s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{
            fontSize: 11, fontWeight: 600, color: timerColor,
            transition: "color 0.3s ease",
          }}>
            {timerActive ? "Time remaining" : "Timer starts when you type"}
          </span>
          <span style={{
            fontSize: 20, fontWeight: 700, color: timerColor,
            fontFamily: "var(--font-jetbrains-mono), 'JetBrains Mono', monospace",
            transition: "color 0.3s ease",
          }}>
            {timeRemaining}s
          </span>
        </div>
        <div style={{ height: 6, borderRadius: 9999, background: `${timerColor}15`, overflow: "hidden" }}>
          <motion.div
            style={{
              height: "100%", borderRadius: 9999,
              background: timerColor,
            }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.5, ease: "linear" }}
          />
        </div>
      </div>

      {/* ── Instruction ── */}
      <p style={{
        margin: "0 0 12px", fontSize: 14, fontWeight: 600, color: "#194a6d",
        lineHeight: 1.5,
      }}>
        {exercise.prompt.instruction}
      </p>

      {/* ── Cue ── */}
      <div style={{
        marginBottom: 14, padding: "14px 18px", borderRadius: 8,
        background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.15)",
      }}>
        <p style={{
          margin: 0, fontSize: 15, color: "#2d4a5e", lineHeight: 1.7, fontWeight: 500,
        }}>
          {exercise.prompt.cue}
        </p>
      </div>

      {/* ── Constraints ── */}
      <div style={{ marginBottom: 16 }}>
        <p style={{
          margin: "0 0 6px", fontSize: 10, fontWeight: 700,
          letterSpacing: "0.08em", textTransform: "uppercase", color: "#a0adb8",
        }}>
          Constraints
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {exercise.prompt.constraints.map((constraint, i) => (
            <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
              <span style={{ fontSize: 11, color: "#7c3aed", marginTop: 3, flexShrink: 0 }}>•</span>
              <p style={{ margin: 0, fontSize: 12, color: "#5a7080", lineHeight: 1.6 }}>
                {constraint}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Start button (if not yet started) ── */}
      {!timerActive && !submitted && (
        <button
          onClick={handleStart}
          style={{
            marginBottom: 14, fontSize: 13, fontWeight: 700,
            padding: "9px 20px", borderRadius: 6,
            border: "none", background: "#7c3aed", color: "#ffffff",
            cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 6,
          }}
        >
          ⏱ Start Writing
        </button>
      )}

      {/* ── Textarea ── */}
      {(timerActive || submitted) && (
        <div style={{ marginBottom: 14 }}>
          <textarea
            ref={textareaRef}
            value={userInput}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.ctrlKey) handleSubmit();
            }}
            disabled={submitted}
            placeholder="Write your sentence here…"
            rows={4}
            autoFocus
            style={{
              width: "100%", padding: "14px 16px", borderRadius: 8,
              border: submitted
                ? isCorrect
                  ? "2px solid #0d9488"
                  : "2px solid #ef4444"
                : `1.5px solid rgba(139,92,246,0.3)`,
              background: submitted
                ? isCorrect
                  ? "rgba(13,148,136,0.03)"
                  : "rgba(239,68,68,0.03)"
                : "#fafbfc",
              fontSize: 14, color: "#1a2f3f", lineHeight: 1.7,
              resize: "none", // no resize in timed mode
              fontFamily: "var(--font-inter), Inter, sans-serif",
              outline: "none",
              transition: "border-color 0.2s ease",
            }}
            aria-label="Master exercise input"
          />
        </div>
      )}

      {/* ── Submit button ── */}
      {timerActive && !submitted && (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 11, color: "#a0adb8" }}>
            Ctrl+Enter to submit early
          </span>
          <button
            onClick={handleSubmit}
            disabled={!userInput.trim()}
            style={{
              fontSize: 13, fontWeight: 700, padding: "9px 22px", borderRadius: 6,
              border: "none",
              background: userInput.trim() ? "#7c3aed" : "#e4e8ed",
              color: userInput.trim() ? "#ffffff" : "#a0adb8",
              cursor: userInput.trim() ? "pointer" : "not-allowed",
              display: "inline-flex", alignItems: "center", gap: 6,
              marginLeft: "auto",
            }}
          >
            Submit ✓
          </button>
        </div>
      )}

      {/* ── Result indicator ── */}
      {submitted && !showFeedback && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0" }}>
          <span style={{
            fontSize: 13, fontWeight: 700,
            color: isCorrect ? "#0d9488" : "#ef4444",
          }}>
            {isCorrect ? "✓ Excellent!" : "✗ Not quite"}
          </span>
          {timeRemaining === 0 && !userInput.trim() && (
            <span style={{ fontSize: 11, color: "#a0adb8" }}>
              (time expired)
            </span>
          )}
        </div>
      )}

      {/* ── Sample answer if wrong ── */}
      {submitted && !isCorrect && (
        <div style={{ marginTop: 12 }}>
          <p style={{
            margin: "0 0 4px", fontSize: 10, fontWeight: 700,
            letterSpacing: "0.08em", textTransform: "uppercase", color: "#a0adb8",
          }}>
            Sample Answer
          </p>
          <p style={{
            margin: 0, fontSize: 13, color: "#7c3aed", lineHeight: 1.7,
            fontStyle: "italic",
            padding: "10px 14px", borderRadius: 6,
            background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.12)",
          }}>
            {exercise.answer.sampleAnswer}
          </p>
        </div>
      )}
    </div>
  );
}
