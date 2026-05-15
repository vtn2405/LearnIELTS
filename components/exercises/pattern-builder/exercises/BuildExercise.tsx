"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import type { BuildExerciseData } from "../types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface BuildExerciseProps {
  exercise: BuildExerciseData;
  onSubmit: (answer: string[], isCorrect: boolean) => void;
  showFeedback: boolean;
}

// ─── Shuffle utility ──────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BuildExercise({ exercise, onSubmit, showFeedback }: BuildExerciseProps) {
  const [availableChips, setAvailableChips] = useState<string[]>([]);
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Shuffle chips on exercise change
  useEffect(() => {
    setAvailableChips(shuffle(exercise.chips));
    setSelectedChips([]);
    setSubmitted(false);
    setIsCorrect(null);
  }, [exercise.id, exercise.chips]);

  // Distractors set for highlighting
  const distractors = useMemo(
    () => new Set(exercise.answer.distractors.map((d) => d.toLowerCase())),
    [exercise.answer.distractors]
  );

  // ── Handlers ──
  const handleSelectChip = useCallback((chip: string, index: number) => {
    if (submitted) return;
    setAvailableChips((prev) => prev.filter((_, i) => i !== index));
    setSelectedChips((prev) => [...prev, chip]);
  }, [submitted]);

  const handleRemoveChip = useCallback((chip: string, index: number) => {
    if (submitted) return;
    setSelectedChips((prev) => prev.filter((_, i) => i !== index));
    setAvailableChips((prev) => [...prev, chip]);
  }, [submitted]);

  const handleClear = useCallback(() => {
    if (submitted) return;
    setAvailableChips(shuffle([...availableChips, ...selectedChips]));
    setSelectedChips([]);
  }, [submitted, availableChips, selectedChips]);

  const handleSubmit = useCallback(() => {
    if (selectedChips.length === 0 || submitted) return;

    const correct =
      selectedChips.length === exercise.answer.correctOrder.length &&
      selectedChips.every((chip, i) => chip === exercise.answer.correctOrder[i]);

    setIsCorrect(correct);
    setSubmitted(true);
    onSubmit(selectedChips, correct);
  }, [selectedChips, submitted, exercise.answer.correctOrder, onSubmit]);

  // ── Per-chip correctness (for wrong state highlighting) ──
  const getChipStatus = (chip: string, index: number): "correct" | "wrong-position" | "distractor" | "neutral" => {
    if (!submitted || isCorrect) return "neutral";
    // Check if this chip is a distractor
    if (distractors.has(chip.toLowerCase())) return "distractor";
    // Check if it's in the correct position
    if (index < exercise.answer.correctOrder.length && exercise.answer.correctOrder[index] === chip) {
      return "correct";
    }
    return "wrong-position";
  };

  return (
    <div>
      {/* ── Instruction ── */}
      <p style={{
        margin: "0 0 14px", fontSize: 14, fontWeight: 600, color: "#194a6d",
        lineHeight: 1.5,
      }}>
        {exercise.prompt.instruction}
      </p>

      {/* ── Base sentence ── */}
      <div style={{
        marginBottom: 20, padding: "12px 16px", borderRadius: 8,
        background: "#f8f9fa", border: "1px solid #e4e8ed",
      }}>
        <p style={{
          margin: 0, fontSize: 14, color: "#2d4a5e", lineHeight: 1.7,
          fontWeight: 500,
        }}>
          {exercise.prompt.baseSentence}
        </p>
      </div>

      <LayoutGroup>
        {/* ── Selected chips (drop zone) ── */}
        <div style={{
          marginBottom: 16,
        }}>
          <p style={{
            margin: "0 0 8px", fontSize: 10, fontWeight: 700,
            letterSpacing: "0.08em", textTransform: "uppercase", color: "#a0adb8",
          }}>
            Your answer
          </p>
          <div style={{
            minHeight: 56, padding: "10px 14px", borderRadius: 8,
            border: submitted
              ? isCorrect
                ? "2px solid #0d9488"
                : "2px solid #ef4444"
              : "2px dashed #d1d9e0",
            background: submitted
              ? isCorrect
                ? "rgba(13,148,136,0.03)"
                : "rgba(239,68,68,0.03)"
              : "#fafbfc",
            display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center",
            transition: "border-color 0.2s ease, background 0.2s ease",
          }}>
            {selectedChips.length === 0 && (
              <span style={{ fontSize: 12, color: "#a0adb8", fontStyle: "italic" }}>
                Click chips below to build the sentence…
              </span>
            )}
            <AnimatePresence mode="popLayout">
              {selectedChips.map((chip, i) => {
                const status = getChipStatus(chip, i);
                return (
                  <motion.button
                    key={`selected-${chip}-${i}`}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    onClick={() => handleRemoveChip(chip, i)}
                    disabled={submitted}
                    style={{
                      fontSize: 13, fontWeight: 600,
                      padding: "6px 12px", borderRadius: 6,
                      cursor: submitted ? "default" : "pointer",
                      display: "inline-flex", alignItems: "center", gap: 6,
                      border: status === "correct"
                        ? "1.5px solid #0d9488"
                        : status === "wrong-position"
                        ? "1.5px solid #ef4444"
                        : status === "distractor"
                        ? "1.5px solid #ef4444"
                        : "1.5px solid #0d9488",
                      background: status === "correct"
                        ? "rgba(13,148,136,0.08)"
                        : status === "wrong-position"
                        ? "rgba(239,68,68,0.08)"
                        : status === "distractor"
                        ? "rgba(239,68,68,0.06)"
                        : "rgba(13,148,136,0.06)",
                      color: status === "correct"
                        ? "#0d9488"
                        : status === "wrong-position"
                        ? "#ef4444"
                        : status === "distractor"
                        ? "#ef4444"
                        : "#0d9488",
                      textDecoration: status === "distractor" ? "line-through" : "none",
                    }}
                  >
                    <span style={{
                      fontSize: 9, fontWeight: 700, opacity: 0.6,
                      minWidth: 14, textAlign: "center",
                    }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {chip}
                    {!submitted && (
                      <span style={{ fontSize: 10, opacity: 0.5, marginLeft: 2 }}>×</span>
                    )}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Available chips ── */}
        <div style={{ marginBottom: 20 }}>
          <p style={{
            margin: "0 0 8px", fontSize: 10, fontWeight: 700,
            letterSpacing: "0.08em", textTransform: "uppercase", color: "#a0adb8",
          }}>
            Available chips
          </p>
          <div style={{
            minHeight: 44, display: "flex", flexWrap: "wrap", gap: 8,
          }}>
            <AnimatePresence mode="popLayout">
              {availableChips.map((chip, i) => (
                <motion.button
                  key={`available-${chip}-${i}`}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  onClick={() => handleSelectChip(chip, i)}
                  disabled={submitted}
                  style={{
                    fontSize: 13, fontWeight: 500,
                    padding: "6px 14px", borderRadius: 6,
                    border: "1.5px dashed #d1d9e0",
                    background: "#ffffff",
                    color: "#2d4a5e",
                    cursor: submitted ? "default" : "pointer",
                    opacity: submitted ? 0.5 : 1,
                    transition: "border-color 0.15s ease, background 0.15s ease",
                  }}
                >
                  {chip}
                </motion.button>
              ))}
            </AnimatePresence>
            {availableChips.length === 0 && !submitted && (
              <span style={{ fontSize: 12, color: "#c4cdd6", fontStyle: "italic" }}>
                All chips selected
              </span>
            )}
          </div>
        </div>
      </LayoutGroup>

      {/* ── Action buttons ── */}
      {!submitted && (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Clear button */}
          {selectedChips.length > 0 && (
            <button
              onClick={handleClear}
              style={{
                fontSize: 12, fontWeight: 600, padding: "8px 14px", borderRadius: 6,
                border: "1.5px solid #e4e8ed", background: "#ffffff", color: "#6b7a87",
                cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: 5,
              }}
            >
              ↺ Clear
            </button>
          )}

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={selectedChips.length === 0}
            style={{
              fontSize: 13, fontWeight: 700, padding: "9px 22px", borderRadius: 6,
              border: "none",
              background: selectedChips.length > 0 ? "#0d9488" : "#e4e8ed",
              color: selectedChips.length > 0 ? "#ffffff" : "#a0adb8",
              cursor: selectedChips.length > 0 ? "pointer" : "not-allowed",
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
            {isCorrect ? "✓ Correct!" : "✗ Not quite"}
          </span>
        </div>
      )}

      {/* ── Show correct order if wrong ── */}
      {submitted && !isCorrect && (
        <div style={{ marginTop: 12 }}>
          <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#a0adb8" }}>
            Correct order
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {exercise.answer.correctOrder.map((chip, i) => (
              <span key={i} style={{
                fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 5,
                background: "rgba(13,148,136,0.08)", color: "#0d9488",
                border: "1px solid rgba(13,148,136,0.2)",
                display: "inline-flex", alignItems: "center", gap: 4,
              }}>
                <span style={{ fontSize: 9, fontWeight: 700, opacity: 0.6 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                {chip}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
