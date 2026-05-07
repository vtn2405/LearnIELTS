// components/exercises/error-hunter/ResultPanel.tsx
"use client";

import { useState } from "react";
import type { EhSubmitResponse, EhPerErrorFeedback, EhErrorStatus } from "@/lib/types/error-hunter";

const STATUS_META: Record<EhErrorStatus, { label: string; color: string; bg: string }> = {
  FOUND_CORRECT:   { label: "✓ Found & Fixed",    color: "#15803d", bg: "#f0fdf4" },
  FOUND_WRONG_FIX: { label: "◑ Found, wrong fix", color: "#b45309", bg: "#fffbeb" },
  MISSED:          { label: "✗ Missed",            color: "#dc2626", bg: "#fff5f5" },
  FALSE_ALARM:     { label: "⚠ False alarm",       color: "#7c3aed", bg: "#faf5ff" },
};

interface Props {
  result: EhSubmitResponse;
  passageText?: string;
  onNext: () => void;
}

export default function ResultPanel({ result, passageText, onNext }: Props) {
  const { score, summary, perErrorFeedback } = result;
  const [showCorrected, setShowCorrected] = useState(false);

  const scoreColor =
    score.scorePercent >= 80 ? "#15803d"
    : score.scorePercent >= 50 ? "#b45309"
    : "#dc2626";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* ── Score card ── */}
      <div style={{
        background: "#f8fafc", borderRadius: 12,
        padding: "16px 20px", border: "1px solid #e2e8f0",
      }}>
        <p style={{
          margin: "0 0 2px", fontSize: 10, fontWeight: 700,
          letterSpacing: "0.1em", color: "#64748b", textTransform: "uppercase",
        }}>
          Your Score (F1)
        </p>
        <p style={{ margin: "0 0 6px", fontSize: 44, fontWeight: 900, color: scoreColor, lineHeight: 1 }}>
          {score.scorePercent}
          <span style={{ fontSize: 18, fontWeight: 600, color: "#94a3b8" }}>%</span>
        </p>
        <p style={{ margin: "0 0 10px", fontSize: 13, color: "#374151", lineHeight: 1.5 }}>
          {summary}
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Chip label={`${score.foundCorrect} found`} color="#15803d" />
          <Chip label={`${score.missed} missed`} color="#dc2626" />
          <Chip label={`${score.falseAlarms} false alarms`} color="#7c3aed" />
          {score.fixAccuracy > 0 && (
            <Chip label={`${score.fixAccuracy}% fix accuracy`} color="#0369a1" />
          )}
          <Chip label={`+${score.xpEarned} XP`} color="#d97706" />
        </div>
      </div>

      {/* ── Corrected passage view ── */}
      {passageText && (
        <div>
          <button
            onClick={() => setShowCorrected((v) => !v)}
            style={{
              background: "none", border: "1px solid #cbd5e1", borderRadius: 8,
              padding: "6px 14px", fontSize: 12, fontWeight: 600,
              color: "#475569", cursor: "pointer", marginBottom: 8,
            }}
          >
            {showCorrected ? "Hide" : "Show"} corrected passage
          </button>
          {showCorrected && (
            <CorrectedPassage
              passageText={passageText}
              feedback={perErrorFeedback.filter((f) => f.status !== "FALSE_ALARM")}
            />
          )}
        </div>
      )}

      {/* ── Per-error feedback list ── */}
      <p style={{
        margin: 0, fontSize: 11, fontWeight: 700,
        letterSpacing: "0.08em", color: "#64748b", textTransform: "uppercase",
      }}>
        Error breakdown
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {perErrorFeedback.map((fb) => (
          <ErrorCard key={fb.errorId} fb={fb} />
        ))}
      </div>

      {/* ── Next passage ── */}
      <button
        onClick={onNext}
        style={{
          padding: "11px 24px", borderRadius: 10,
          background: "#006b5f", color: "#fff",
          fontWeight: 700, fontSize: 14, border: "none",
          cursor: "pointer", alignSelf: "flex-start",
          marginTop: 4,
        }}
      >
        Next Passage →
      </button>
    </div>
  );
}

function ErrorCard({ fb }: { fb: EhPerErrorFeedback }) {
  const meta = STATUS_META[fb.status];

  return (
    <div style={{
      background: meta.bg, borderRadius: 10,
      padding: "12px 14px",
      border: `1px solid ${meta.color}25`,
      borderLeft: `3px solid ${meta.color}`,
    }}>
      <p style={{
        margin: "0 0 4px", fontSize: 10, fontWeight: 700,
        color: meta.color, textTransform: "uppercase", letterSpacing: "0.08em",
      }}>
        {meta.label}
      </p>

      {fb.status !== "FALSE_ALARM" ? (
        <>
          <p style={{ margin: "0 0 2px", fontSize: 13.5, lineHeight: 1.5 }}>
            <span style={{ color: "#dc2626", textDecoration: "line-through" }}>
              {fb.errorText}
            </span>
            {" → "}
            <strong style={{ color: "#15803d" }}>{fb.correctText}</strong>
            {fb.userCorrection && fb.status === "FOUND_WRONG_FIX" && (
              <span style={{ color: "#b45309", marginLeft: 6, fontSize: 12 }}>
                (you wrote: "{fb.userCorrection}")
              </span>
            )}
          </p>
          <p style={{ margin: "0 0 6px", fontSize: 12.5, color: "#475569", lineHeight: 1.55 }}>
            {fb.explanation}
          </p>
        </>
      ) : (
        <p style={{ margin: "0 0 6px", fontSize: 12.5, color: "#475569", lineHeight: 1.55 }}>
          <strong style={{ color: "#7c3aed" }}>"{fb.errorText}"</strong>
          {" — "}{fb.explanation}
        </p>
      )}

      {fb.ieltsTip && (
        <div style={{
          background: "#eff6ff", borderRadius: 6,
          padding: "6px 10px", marginTop: 4,
        }}>
          <p style={{ margin: 0, fontSize: 11.5, color: "#0369a1", lineHeight: 1.5 }}>
            💡 IELTS tip: {fb.ieltsTip}
          </p>
        </div>
      )}
    </div>
  );
}

/** Renders the passage text with corrections highlighted inline. */
function CorrectedPassage({
  passageText,
  feedback,
}: {
  passageText: string;
  feedback: EhPerErrorFeedback[];
}) {
  const sorted = [...feedback]
    .filter((f) => f.startIndex != null)
    .sort((a, b) => a.startIndex - b.startIndex);

  const parts: React.ReactNode[] = [];
  let cursor = 0;

  for (const fb of sorted) {
    if (fb.startIndex > cursor) {
      parts.push(passageText.slice(cursor, fb.startIndex));
    }
    const statusColor =
      fb.status === "FOUND_CORRECT" ? "#15803d"
      : fb.status === "FOUND_WRONG_FIX" ? "#b45309"
      : "#dc2626";
    parts.push(
      <span key={fb.errorId} style={{ fontWeight: 700, color: statusColor }}>
        {fb.correctText}
      </span>
    );
    cursor = fb.endIndex;
  }

  if (cursor < passageText.length) {
    parts.push(passageText.slice(cursor));
  }

  return (
    <div style={{
      background: "#f0fdf4", borderRadius: 10, padding: "12px 16px",
      border: "1px solid #bbf7d0", fontSize: 13.5, lineHeight: 1.7,
      color: "#1e293b", whiteSpace: "pre-wrap", marginBottom: 6,
    }}>
      <p style={{
        margin: "0 0 6px", fontSize: 10, fontWeight: 700,
        letterSpacing: "0.08em", color: "#15803d", textTransform: "uppercase",
      }}>
        Corrected passage
      </p>
      {parts}
    </div>
  );
}

function Chip({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      fontSize: 11.5, fontWeight: 700, color,
      background: `${color}15`,
      border: `1px solid ${color}30`,
      borderRadius: 9999, padding: "2px 10px",
    }}>
      {label}
    </span>
  );
}
