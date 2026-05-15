"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { FillExerciseData } from "../types";
import { HintSystem } from "./HintSystem";

// ─── Props ────────────────────────────────────────────────────────────────────

interface FillExerciseProps {
  exercise: FillExerciseData;
  onSubmit: (answer: string, isCorrect: boolean) => void;
  showFeedback: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FillExercise({ exercise, onSubmit, showFeedback }: FillExerciseProps) {
  const [userInput, setUserInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state when exercise changes
  useEffect(() => {
    setUserInput("");
    setSubmitted(false);
    setIsCorrect(null);
    inputRef.current?.focus();
  }, [exercise.id]);

  // ── Check logic ──
  const handleSubmit = useCallback(() => {
    if (!userInput.trim() || submitted) return;

    const normalized = userInput.trim().toLowerCase();
    const accepted = exercise.answer.acceptedTokens.map((t) => t.toLowerCase());
    const blocked = exercise.answer.blockedTokens.map((t) => t.toLowerCase());

    let correct: boolean;
    if (accepted.includes(normalized)) {
      correct = true;
    } else if (blocked.includes(normalized)) {
      correct = false;
    } else {
      correct = false;
    }

    setIsCorrect(correct);
    setSubmitted(true);
    onSubmit(userInput.trim(), correct);
  }, [userInput, submitted, exercise, onSubmit]);

  // ── Frame rendering ──
  const parts = exercise.prompt.frame.split("[________]");
  const beforeBlank = parts[0] ?? "";
  const afterBlank = parts[1] ?? "";

  // ── Input border/bg based on state ──
  const inputBorder = submitted
    ? isCorrect
      ? "2px solid #0d9488"
      : "2px solid #ef4444"
    : "2px solid #e4e8ed";

  const inputBg = submitted
    ? isCorrect
      ? "rgba(13,148,136,0.05)"
      : "rgba(239,68,68,0.05)"
    : "#fafbfc";

  const inputColor = submitted
    ? isCorrect
      ? "#0d9488"
      : "#ef4444"
    : "#1a2f3f";

  return (
    <div>
      {/* ── Instruction ── */}
      <p style={{
        margin: "0 0 14px", fontSize: 14, fontWeight: 600, color: "#194a6d",
        lineHeight: 1.5,
      }}>
        {exercise.prompt.instruction}
      </p>

      {/* ── Grammar pattern ── */}
      <div style={{
        marginBottom: 20, padding: "8px 14px", borderRadius: 6,
        background: "rgba(25,74,109,0.03)", border: "1px solid rgba(25,74,109,0.08)",
        display: "inline-block",
      }}>
        <code style={{
          fontSize: 12, color: "#5a7080",
          fontFamily: "var(--font-jetbrains-mono), 'JetBrains Mono', monospace",
          fontWeight: 500,
        }}>
          {exercise.grammarCheck.pattern}
        </code>
      </div>

      {/* ── Sentence frame with input ── */}
      <div style={{
        fontSize: 16, lineHeight: 2.4, color: "#1a2f3f", fontWeight: 500,
        marginBottom: 20,
      }}>
        <span>{beforeBlank}</span>
        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
          disabled={submitted}
          placeholder="…"
          autoComplete="off"
          spellCheck={false}
          style={{
            display: "inline-block",
            minWidth: 120,
            width: `${Math.max(120, userInput.length * 11 + 30)}px`,
            maxWidth: "100%",
            padding: "5px 12px",
            fontSize: 16, fontWeight: 600,
            borderRadius: 6,
            border: inputBorder,
            background: inputBg,
            color: inputColor,
            outline: "none",
            textAlign: "center",
            fontFamily: "var(--font-jetbrains-mono), 'JetBrains Mono', monospace",
            transition: "border-color 0.2s ease, background 0.2s ease",
          }}
          aria-label="Fill in the blank"
        />
        <span>{afterBlank}</span>
      </div>

      {/* ── Hint System ── */}
      {!submitted && (
        <HintSystem scaffolding={exercise.scaffolding} />
      )}

      {/* ── Action buttons ── */}
      {!submitted && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={!userInput.trim()}
            style={{
              fontSize: 13, fontWeight: 700, padding: "9px 22px", borderRadius: 6,
              border: "none",
              background: userInput.trim() ? "#0d9488" : "#e4e8ed",
              color: userInput.trim() ? "#ffffff" : "#a0adb8",
              cursor: userInput.trim() ? "pointer" : "not-allowed",
              display: "inline-flex", alignItems: "center", gap: 6,
              marginLeft: "auto",
              transition: "background 0.15s ease",
            }}
          >
            Submit ✓
          </button>
        </div>
      )}

      {/* ── Result indicator (before parent shows full feedback) ── */}
      {submitted && !showFeedback && (
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "8px 0",
        }}>
          <span style={{
            fontSize: 13, fontWeight: 700,
            color: isCorrect ? "#0d9488" : "#ef4444",
          }}>
            {isCorrect ? "✓ Correct!" : "✗ Not quite"}
          </span>
        </div>
      )}

      {/* ── Show accepted answers if wrong ── */}
      {submitted && !isCorrect && (
        <div style={{ marginTop: 10 }}>
          <p style={{ margin: 0, fontSize: 12, color: "#6b7a87" }}>
            <span style={{ fontWeight: 700, color: "#0d9488" }}>Accepted: </span>
            {exercise.answer.acceptedTokens.join(" / ")}
          </p>
        </div>
      )}
    </div>
  );
}
