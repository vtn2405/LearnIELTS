"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Scaffolding } from "../types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface HintSystemProps {
  scaffolding: Scaffolding;
  onHintUsed?: (level: number) => void;
}

// ─── Button labels per level ──────────────────────────────────────────────────

const BUTTON_LABELS: Record<number, string> = {
  0: "💡 Show Hint",
  1: "💡 More Help",
  2: "💡 Show Pattern",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function HintSystem({ scaffolding, onHintUsed }: HintSystemProps) {
  const [revealedLevel, setRevealedLevel] = useState<0 | 1 | 2 | 3>(0);

  // Build available hints (skip nulls)
  const availableHints = useMemo(() => {
    const hints: { level: 1 | 2 | 3; text: string }[] = [];
    if (scaffolding.hintLevel1) hints.push({ level: 1, text: scaffolding.hintLevel1 });
    if (scaffolding.hintLevel2) hints.push({ level: 2, text: scaffolding.hintLevel2 });
    if (scaffolding.hintLevel3) hints.push({ level: 3, text: scaffolding.hintLevel3 });
    return hints;
  }, [scaffolding]);

  // Reset when scaffolding changes (new exercise)
  useEffect(() => {
    setRevealedLevel(0);
  }, [scaffolding.hintLevel1, scaffolding.hintLevel2, scaffolding.hintLevel3]);

  // How many hints have been revealed
  const revealedHints = availableHints.filter((h) => h.level <= revealedLevel);
  const nextHint = availableHints.find((h) => h.level > revealedLevel);
  const hasMoreHints = !!nextHint;

  // Determine button label based on how many revealed
  const buttonLabel = BUTTON_LABELS[revealedHints.length] ?? "💡 Show Hint";

  const handleRevealNext = useCallback(() => {
    if (!nextHint) return;
    setRevealedLevel(nextHint.level);
    onHintUsed?.(nextHint.level);
  }, [nextHint, onHintUsed]);

  // Don't render anything if no hints available
  if (availableHints.length === 0) return null;

  return (
    <div>
      {/* ── Revealed hints ── */}
      <AnimatePresence mode="sync">
        {revealedHints.length > 0 && (
          <motion.div
            key="hints-container"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{
              marginBottom: 12, padding: "12px 16px", borderRadius: 8,
              background: "rgba(245,158,11,0.04)",
              border: "1px solid rgba(245,158,11,0.15)",
              overflow: "hidden",
            }}
          >
            <p style={{
              margin: "0 0 8px", fontSize: 10, fontWeight: 700,
              letterSpacing: "0.08em", textTransform: "uppercase", color: "#b45309",
            }}>
              💡 Hints ({revealedHints.length}/{availableHints.length})
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {revealedHints.map((hint, i) => (
                <motion.div
                  key={`hint-${hint.level}`}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i === revealedHints.length - 1 ? 0.1 : 0 }}
                  style={{ display: "flex", gap: 8, alignItems: "flex-start" }}
                >
                  <span style={{
                    fontSize: 9, fontWeight: 700, color: "#b45309",
                    background: "rgba(245,158,11,0.12)", borderRadius: 3,
                    padding: "2px 6px", flexShrink: 0, marginTop: 2,
                  }}>
                    {i + 1}
                  </span>
                  <p style={{
                    margin: 0, fontSize: 13, color: "#5a4a20", lineHeight: 1.6,
                    fontFamily: hint.level === 3
                      ? "var(--font-jetbrains-mono), 'JetBrains Mono', monospace"
                      : "inherit",
                    fontWeight: hint.level === 3 ? 500 : 400,
                  }}>
                    {hint.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Reveal button ── */}
      {hasMoreHints && (
        <button
          onClick={handleRevealNext}
          style={{
            fontSize: 12, fontWeight: 600, padding: "7px 14px", borderRadius: 6,
            border: "1.5px solid rgba(245,158,11,0.3)",
            background: "rgba(245,158,11,0.05)", color: "#b45309",
            cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 5,
            transition: "background 0.15s ease, border-color 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(245,158,11,0.1)";
            e.currentTarget.style.borderColor = "rgba(245,158,11,0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(245,158,11,0.05)";
            e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)";
          }}
          aria-label={buttonLabel}
        >
          {buttonLabel}
          <span style={{ fontSize: 10, opacity: 0.6 }}>
            ({revealedHints.length}/{availableHints.length})
          </span>
        </button>
      )}
    </div>
  );
}
