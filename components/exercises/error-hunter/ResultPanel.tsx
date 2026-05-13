// components/exercises/error-hunter/ResultPanel.tsx
"use client";

import type { EhSubmitResponse, EhPerErrorFeedback, EhErrorStatus, CollocationItem, TipItem } from "@/lib/types/error-hunter";

const STATUS_META: Record<EhErrorStatus, { label: string; color: string; bg: string }> = {
  FOUND_CORRECT:   { label: "✓ Tìm đúng & sửa đúng", color: "#15803d", bg: "#f0fdf4" },
  FOUND_WRONG_FIX: { label: "◑ Tìm đúng, sửa sai",  color: "#b45309", bg: "#fffbeb" },
  MISSED:          { label: "✗ Bỏ sót",             color: "#dc2626", bg: "#fff5f5" },
  FALSE_ALARM:     { label: "⚠ Báo nhầm",           color: "#7c3aed", bg: "#faf5ff" },
};

interface Props {
  result: EhSubmitResponse;
  onNext: () => void;
}

export default function ResultPanel({ result, onNext }: Props) {
  const { score, summary, perErrorFeedback, collocations, tips } = result;

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
          Điểm số (F1)
        </p>
        <p style={{ margin: "0 0 6px", fontSize: 44, fontWeight: 900, color: scoreColor, lineHeight: 1 }}>
          {score.scorePercent}
          <span style={{ fontSize: 18, fontWeight: 600, color: "#94a3b8" }}>%</span>
        </p>
        <p style={{ margin: "0 0 10px", fontSize: 13, color: "#374151", lineHeight: 1.5 }}>
          {summary}
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Chip label={`${score.foundCorrect} tìm đúng`} color="#15803d" />
          <Chip label={`${score.missed} bỏ sót`} color="#dc2626" />
          <Chip label={`${score.falseAlarms} báo nhầm`} color="#7c3aed" />
          {score.fixAccuracy > 0 && (
            <Chip label={`${score.fixAccuracy}% độ chính xác`} color="#0369a1" />
          )}
          <Chip label={`+${score.xpEarned} XP`} color="#d97706" />
        </div>
      </div>

      {/* ── Per-error feedback list ── */}
      <p style={{
        margin: 0, fontSize: 11, fontWeight: 700,
        letterSpacing: "0.08em", color: "#64748b", textTransform: "uppercase",
      }}>
        Chi tiết từng lỗi
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {perErrorFeedback.map((fb) => (
          <ErrorCard key={fb.errorId} fb={fb} />
        ))}
      </div>

      {/* ── Collocations ── */}
      {collocations && collocations.length > 0 && (
        <>
          <p style={{
            margin: 0, fontSize: 11, fontWeight: 700,
            letterSpacing: "0.08em", color: "#64748b", textTransform: "uppercase",
            marginTop: 6,
          }}>
            Collocations trong bài
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {collocations.map((col, i) => (
              <CollocationCard key={i} col={col} />
            ))}
          </div>
        </>
      )}

      {/* ── Tips ── */}
      {tips && tips.length > 0 && (
        <>
          <p style={{
            margin: 0, fontSize: 11, fontWeight: 700,
            letterSpacing: "0.08em", color: "#64748b", textTransform: "uppercase",
            marginTop: 6,
          }}>
            Mẹo viết & nói
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {tips.map((tip, i) => (
              <TipCard key={i} tip={tip} />
            ))}
          </div>
        </>
      )}

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
        Đoạn tiếp theo →
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
                (bạn viết: "{fb.userCorrection}")
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
            💡 Mẹo IELTS: {fb.ieltsTip}
          </p>
        </div>
      )}
    </div>
  );
}

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  speaking: { label: "Speaking", color: "#7c3aed" },
  grammar: { label: "Grammar", color: "#dc2626" },
  vocabulary: { label: "Vocabulary", color: "#0369a1" },
  writing: { label: "Writing", color: "#b45309" },
};

function CollocationCard({ col }: { col: CollocationItem }) {
  return (
    <div style={{
      background: "#f0fdf4", borderRadius: 8,
      padding: "10px 12px",
      border: "1px solid #bbf7d0",
    }}>
      <p style={{ margin: "0 0 3px", fontSize: 13, fontWeight: 700, color: "#15803d" }}>
        {col.phrase}
      </p>
      <p style={{ margin: "0 0 2px", fontSize: 12, color: "#475569", lineHeight: 1.5 }}>
        <strong>Trong bài:</strong> {col.sourceInPassage}
      </p>
      <p style={{ margin: "0 0 2px", fontSize: 12, color: "#475569", lineHeight: 1.5 }}>
        <strong>Nghĩa:</strong> {col.translation}
      </p>
      <p style={{ margin: "0 0 2px", fontSize: 12, color: "#475569", fontStyle: "italic", lineHeight: 1.5 }}>
        {col.exampleSentence}
      </p>
      {col.grammarNote && (
        <p style={{ margin: 0, fontSize: 11.5, color: "#64748b", lineHeight: 1.5 }}>
          {col.grammarNote}
        </p>
      )}
    </div>
  );
}

function TipCard({ tip }: { tip: TipItem }) {
  const cat = CATEGORY_META[tip.category] ?? { label: tip.category, color: "#64748b" };
  return (
    <div style={{
      background: "#eff6ff", borderRadius: 8,
      padding: "10px 12px",
      border: "1px solid #bfdbfe",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <span style={{
          fontSize: 9, fontWeight: 700, color: cat.color,
          background: `${cat.color}15`, border: `1px solid ${cat.color}30`,
          borderRadius: 9999, padding: "1px 8px",
          textTransform: "uppercase", letterSpacing: "0.06em",
        }}>
          {cat.label}
        </span>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: "#1e293b" }}>
          {tip.title}
        </span>
      </div>
      <p style={{ margin: 0, fontSize: 12, color: "#475569", lineHeight: 1.6 }}>
        {tip.body}
      </p>
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
