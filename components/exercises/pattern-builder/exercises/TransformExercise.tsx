"use client";

import { useState, useEffect, useCallback } from "react";
import type { TransformExerciseData } from "../types";
import { HintSystem } from "./HintSystem";

// ─── Props ────────────────────────────────────────────────────────────────────

interface TransformExerciseProps {
  exercise: TransformExerciseData;
  onSubmit: (answer: string, isCorrect: boolean) => void;
  showFeedback: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_CHARS = 200;

// ─── Component ────────────────────────────────────────────────────────────────

export function TransformExercise({ exercise, onSubmit, showFeedback }: TransformExerciseProps) {
  const [userInput, setUserInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Reset on exercise change
  useEffect(() => {
    setUserInput("");
    setSubmitted(false);
    setIsCorrect(null);
  }, [exercise.id]);

  // ── Mock grading logic ──
  const handleSubmit = useCallback(() => {
    if (!userInput.trim() || submitted) return;

    const answer = userInput.toLowerCase().trim();

    const hasRequired = exercise.answer.requiredTokens.every(
      (t) => answer.includes(t.toLowerCase())
    );

    const noBlocked = exercise.answer.blockedTokens.every(
      (t) => !answer.includes(t.toLowerCase())
    );

    const hasIdeas = exercise.answer.requiredIdeas.some((idea) =>
      idea.split(" ").some((word) => answer.includes(word.toLowerCase()))
    );

    const correct = hasRequired && noBlocked && hasIdeas && answer.length > 20;

    setIsCorrect(correct);
    setSubmitted(true);
    onSubmit(userInput.trim(), correct);
  }, [userInput, submitted, exercise, onSubmit]);

  const charCount = userInput.length;
  const isOverLimit = charCount > MAX_CHARS;

  return (
    <div>
      {/* ── Instruction ── */}
      <p style={{
        margin: "0 0 14px", fontSize: 14, fontWeight: 600, color: "#194a6d",
        lineHeight: 1.5,
      }}>
        {exercise.prompt.instruction}
      </p>

      {/* ── Source sentences ── */}
      <div style={{
        marginBottom: 16, padding: "14px 18px", borderRadius: 8,
        background: "#f8f9fa", border: "1px solid #e4e8ed",
      }}>
        <p style={{
          margin: "0 0 6px", fontSize: 10, fontWeight: 700,
          letterSpacing: "0.08em", textTransform: "uppercase", color: "#a0adb8",
        }}>
          Source sentences
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {exercise.prompt.sourceSentences.map((sentence, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span style={{
                fontSize: 11, fontWeight: 700, color: "#194a6d",
                background: "rgba(25,74,109,0.06)", borderRadius: 3,
                padding: "1px 6px", flexShrink: 0, marginTop: 2,
              }}>
                {i + 1}
              </span>
              <p style={{
                margin: 0, fontSize: 14, color: "#2d4a5e", lineHeight: 1.65,
              }}>
                {sentence}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Constraints ── */}
      <div style={{ marginBottom: 16 }}>
        <p style={{
          margin: "0 0 8px", fontSize: 10, fontWeight: 700,
          letterSpacing: "0.08em", textTransform: "uppercase", color: "#a0adb8",
        }}>
          Constraints
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {exercise.prompt.constraints.map((constraint, i) => (
            <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
              <span style={{
                fontSize: 11, color: "#f59e0b", marginTop: 3, flexShrink: 0,
              }}>
                •
              </span>
              <p style={{
                margin: 0, fontSize: 12, color: "#5a7080", lineHeight: 1.6,
              }}>
                {constraint}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Textarea ── */}
      <div style={{ marginBottom: 12 }}>
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.ctrlKey) handleSubmit();
          }}
          disabled={submitted}
          placeholder="Write your combined sentence here…"
          rows={4}
          style={{
            width: "100%", padding: "14px 16px", borderRadius: 8,
            border: submitted
              ? isCorrect
                ? "2px solid #0d9488"
                : "2px solid #ef4444"
              : "1.5px solid #e4e8ed",
            background: submitted
              ? isCorrect
                ? "rgba(13,148,136,0.03)"
                : "rgba(239,68,68,0.03)"
              : "#fafbfc",
            fontSize: 14, color: "#1a2f3f", lineHeight: 1.7,
            resize: "vertical",
            fontFamily: "var(--font-inter), Inter, sans-serif",
            outline: "none",
            transition: "border-color 0.2s ease, background 0.2s ease",
          }}
          aria-label="Transform sentence input"
        />

        {/* Character count */}
        <div style={{
          display: "flex", justifyContent: "flex-end", marginTop: 4,
        }}>
          <span style={{
            fontSize: 11, fontWeight: 500,
            color: isOverLimit ? "#ef4444" : charCount > MAX_CHARS * 0.8 ? "#f59e0b" : "#a0adb8",
          }}>
            {charCount}/{MAX_CHARS}
          </span>
        </div>
      </div>

      {/* ── Hint System ── */}
      {!submitted && (
        <div style={{ marginBottom: 12 }}>
          <HintSystem scaffolding={exercise.scaffolding} />
        </div>
      )}

      {/* ── Action buttons ── */}
      {!submitted && (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 11, color: "#a0adb8" }}>
            Ctrl+Enter to submit
          </span>
          <button
            onClick={handleSubmit}
            disabled={!userInput.trim() || isOverLimit}
            style={{
              fontSize: 13, fontWeight: 700, padding: "9px 22px", borderRadius: 6,
              border: "none",
              background: userInput.trim() && !isOverLimit ? "#0d9488" : "#e4e8ed",
              color: userInput.trim() && !isOverLimit ? "#ffffff" : "#a0adb8",
              cursor: userInput.trim() && !isOverLimit ? "pointer" : "not-allowed",
              display: "inline-flex", alignItems: "center", gap: 6,
              marginLeft: "auto",
              transition: "background 0.15s ease",
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
            {isCorrect ? "✓ Correct!" : "✗ Not quite"}
          </span>
        </div>
      )}

      {/* ── Show sample answer if wrong ── */}
      {submitted && !isCorrect && (
        <div style={{ marginTop: 12 }}>
          <p style={{
            margin: "0 0 4px", fontSize: 10, fontWeight: 700,
            letterSpacing: "0.08em", textTransform: "uppercase", color: "#a0adb8",
          }}>
            Sample Answer
          </p>
          <p style={{
            margin: 0, fontSize: 13, color: "#0d9488", lineHeight: 1.7,
            fontStyle: "italic",
            padding: "10px 14px", borderRadius: 6,
            background: "rgba(13,148,136,0.04)", border: "1px solid rgba(13,148,136,0.12)",
          }}>
            {exercise.answer.sampleAnswer}
          </p>
        </div>
      )}
    </div>
  );
}
