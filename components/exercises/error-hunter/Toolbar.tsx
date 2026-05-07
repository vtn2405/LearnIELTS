// components/exercises/error-hunter/Toolbar.tsx
"use client";

import type { EhDifficulty, EhErrorMeta } from "@/lib/types/error-hunter";

interface Props {
  selectionCount: number;
  totalErrors: number;
  difficulty: EhDifficulty;
  errorsMeta: EhErrorMeta[];
  phase: "playing" | "submitting" | "result";
  hintsVisible: boolean;
  onToggleHints: () => void;
  onSubmit: () => void;
  onClear: () => void;
}

const DIFF_COLOR: Record<EhDifficulty, string> = {
  STARTER:      "#0369a1",
  INTERMEDIATE: "#d97706",
  ADVANCED:     "#7c3aed",
};

export default function Toolbar({
  selectionCount,
  totalErrors,
  difficulty,
  errorsMeta,
  phase,
  hintsVisible,
  onToggleHints,
  onSubmit,
  onClear,
}: Props) {
  const isPlaying   = phase === "playing";
  const isSubmitting = phase === "submitting";
  const dColor      = DIFF_COLOR[difficulty];

  // Hints available = errorsMeta that have errorType (ADVANCED only)
  const hintCount = errorsMeta.filter((m) => m.errorType).length;

  return (
    <div style={{
      display: "flex", alignItems: "center",
      justifyContent: "space-between", flexWrap: "wrap", gap: 10,
      padding: "10px 0", borderBottom: "1px solid #e2e8f0",
      marginBottom: 14,
    }}>
      {/* Left: difficulty + selection counter */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
          color: dColor, background: `${dColor}15`,
          border: `1px solid ${dColor}30`,
          borderRadius: 9999, padding: "2px 9px",
          textTransform: "uppercase",
        }}>
          {difficulty}
        </span>

        <span style={{
          fontSize: 13, fontWeight: 600, color: "#374151",
        }}>
          🔍 {selectionCount} đã chọn
          <span style={{ color: "#94a3b8", fontWeight: 400 }}>
            {" "}/ {totalErrors} lỗi trong đoạn văn
          </span>
        </span>
      </div>

      {/* Right: actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Hints toggle — only visible if hints exist (ADVANCED or unlocked) */}
        {hintCount > 0 && isPlaying && (
          <button
            onClick={onToggleHints}
            style={{
              padding: "6px 14px", borderRadius: 8,
              border: "1.5px solid #d97706",
              background: hintsVisible ? "#fef3c7" : "transparent",
              color: "#d97706", fontSize: 12, fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {hintsVisible ? "Ẩn gợi ý" : `💡 Gợi ý (${hintCount})`}
          </button>
        )}

        {/* Clear all */}
        {isPlaying && selectionCount > 0 && (
          <button
            onClick={onClear}
            style={{
              padding: "6px 14px", borderRadius: 8,
              border: "1.5px solid #e2e8f0",
              background: "transparent",
              color: "#64748b", fontSize: 12, fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Xóa tất cả
          </button>
        )}

        {/* Submit */}
        {(isPlaying || isSubmitting) && (
          <button
            disabled={selectionCount === 0 || isSubmitting}
            onClick={onSubmit}
            style={{
              padding: "7px 20px", borderRadius: 8,
              background: selectionCount === 0 ? "#e2e8f0" : "#006b5f",
              color: selectionCount === 0 ? "#94a3b8" : "#fff",
              fontSize: 13, fontWeight: 700, border: "none",
              cursor: selectionCount === 0 || isSubmitting ? "not-allowed" : "pointer",
              transition: "background 0.15s",
            }}
          >
            {isSubmitting ? "Đang chấm…" : "Nộp bài →"}
          </button>
        )}
      </div>
    </div>
  );
}
