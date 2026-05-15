// app/exercises/error-hunter/page.tsx
"use client";

import { useEffect, useReducer, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import ErrorHunterShell from "@/components/exercises/error-hunter/ErrorHunterShell";
import type {
  EhPassageClient,
  EhErrorMeta,
  UserSelection,
  EhSubmitResponse,
  EhNextResponse,
  EhDifficulty,
} from "@/lib/types/error-hunter";

// ─── Difficulty level selector ───────────────────────────────────────────────

type DifficultyKey = "STARTER" | "INTERMEDIATE" | "ADVANCED";

const DIFFICULTY_META: Record<DifficultyKey, {
  icon: string; gradient: string; borderColor: string; badgeColor: string;
  label: string; labelVi: string; band: string; descVi: string; errorCount: string;
}> = {
  STARTER: {
    icon: "🚀", gradient: "linear-gradient(135deg, #1d4ed8 0%, #6366f1 100%)",
    borderColor: "#6366f1", badgeColor: "#1d4ed8",
    label: "Starter", labelVi: "Cơ bản", band: "Band 4.0–5.0",
    descVi: "Lỗi rõ ràng — xây nền tảng phát hiện lỗi",
    errorCount: "3–4 lỗi/đoạn",
  },
  INTERMEDIATE: {
    icon: "⚡", gradient: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
    borderColor: "#a855f7", badgeColor: "#7c3aed",
    label: "Intermediate", labelVi: "Trung cấp", band: "Band 5.0–6.5",
    descVi: "Lỗi tinh tế trong ngữ cảnh dài — mài sắc kỹ năng",
    errorCount: "4–5 lỗi/đoạn",
  },
  ADVANCED: {
    icon: "🏆", gradient: "linear-gradient(135deg, #dc2626 0%, #f97316 100%)",
    borderColor: "#f97316", badgeColor: "#dc2626",
    label: "Advanced", labelVi: "Nâng cao", band: "Band 6.5–7.5",
    descVi: "Bẫy ngữ pháp đa tầng — kết hợp 2–3 loại lỗi",
    errorCount: "5–6 lỗi/đoạn",
  },
};

function DifficultyCard({ meta, onClick }: {
  meta: (typeof DIFFICULTY_META)[DifficultyKey]; onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#fefefe" : "#fff",
        border: `1.5px solid ${hovered ? meta.borderColor : "#e2e8f0"}`,
        borderRadius: 16, padding: "24px 22px", cursor: "pointer",
        transition: "all 0.2s ease",
        transform: hovered ? "translateY(-3px)" : "none",
        boxShadow: hovered ? `0 8px 24px ${meta.borderColor}20` : "0 1px 4px rgba(0,0,0,0.06)",
        textAlign: "left", width: "100%",
        display: "flex", flexDirection: "column", alignItems: "stretch",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12, background: meta.gradient,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
          boxShadow: `0 3px 10px ${meta.borderColor}40`,
        }}>{meta.icon}</div>
        <span style={{
          fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", padding: "2px 10px",
          borderRadius: 20, background: `${meta.badgeColor}15`, color: meta.borderColor,
          border: `1px solid ${meta.borderColor}30`,
        }}>{meta.band}</span>
      </div>
      <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: "#1e3a5f" }}>
        {meta.label}
        <span style={{ fontSize: 13, fontWeight: 500, color: "#64748b", marginLeft: 8 }}>{meta.labelVi}</span>
      </h3>
      <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>{meta.descVi}</p>
      <div style={{ display: "flex", gap: 14, fontSize: 12, color: "#94a3b8", fontWeight: 600, paddingTop: 12, borderTop: "1px solid #f1f5f9", marginTop: "auto" }}>
        <span>{meta.errorCount}</span>
      </div>
    </button>
  );
}

// ─── State machine ────────────────────────────────────────────────────────────

type Phase = "loading" | "playing" | "submitting" | "result";

interface State {
  phase: Phase;
  passage: EhPassageClient | null;
  errorsMeta: EhErrorMeta[];
  selections: UserSelection[];
  result: EhSubmitResponse | null;
  errorMsg: string | null;
}

type Action =
  | { type: "LOAD_START" }
  | { type: "LOAD_OK"; payload: EhNextResponse }
  | { type: "LOAD_FAIL"; message: string }
  | { type: "ADD_SEL"; sel: UserSelection }
  | { type: "REMOVE_SEL"; id: string }
  | { type: "UPDATE_CORRECTION"; id: string; correction: string }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_OK"; result: EhSubmitResponse }
  | { type: "RESET" };

const INIT: State = {
  phase: "loading", passage: null, errorsMeta: [],
  selections: [], result: null, errorMsg: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOAD_START":
      return { ...INIT, phase: "loading" };
    case "LOAD_OK":
      return {
        ...state, phase: "playing",
        passage: action.payload.passage,
        errorsMeta: action.payload.errorsMeta,
        selections: [], result: null, errorMsg: null,
      };
    case "LOAD_FAIL":
      return { ...state, phase: "playing", errorMsg: action.message };
    case "ADD_SEL":
      return { ...state, selections: [...state.selections, action.sel] };
    case "REMOVE_SEL":
      return { ...state, selections: state.selections.filter((s) => s.id !== action.id) };
    case "UPDATE_CORRECTION":
      return {
        ...state,
        selections: state.selections.map((s) =>
          s.id === action.id ? { ...s, userCorrection: action.correction } : s
        ),
      };
    case "SUBMIT_START":
      return { ...state, phase: "submitting" };
    case "SUBMIT_OK":
      return { ...state, phase: "result", result: action.result };
    case "RESET":
      return INIT;
    default:
      return state;
  }
}

// ─── Page component ───────────────────────────────────────────────────────────

export default function ErrorHunterPage() {
  const router = useRouter();

  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyKey | null>(null);
  const [state, dispatch] = useReducer(reducer, INIT);

  const loadNext = useCallback(async () => {
    if (!selectedDifficulty) return;
    dispatch({ type: "LOAD_START" });
    try {
      const res = await fetch(
        `/api/error-hunter/next?difficulty=${selectedDifficulty}`
      );
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Không tải được đoạn văn.");
      }
      const data: EhNextResponse = await res.json();
      dispatch({ type: "LOAD_OK", payload: data });
    } catch (e: unknown) {
      dispatch({
        type: "LOAD_FAIL",
        message: e instanceof Error ? e.message : "Lỗi không xác định",
      });
    }
  }, [selectedDifficulty]);

  useEffect(() => {
    if (selectedDifficulty) loadNext();
  }, [selectedDifficulty, loadNext]);

  const handleSubmit = async () => {
    if (!state.passage) return;
    dispatch({ type: "SUBMIT_START" });
    try {
      const res = await fetch("/api/error-hunter/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passageId:      state.passage.id,
          userSelections: state.selections,
        }),
      });
      const result: EhSubmitResponse = await res.json();
      dispatch({ type: "SUBMIT_OK", result });
    } catch {
      dispatch({ type: "LOAD_FAIL", message: "Gửi bài thất bại. Vui lòng thử lại." });
    }
  };

  const handleBackToLevels = () => {
    setSelectedDifficulty(null);
    dispatch({ type: "RESET" });
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#f8fafc",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px 60px" }}>
        {/* Back nav */}
        <button
          onClick={() => selectedDifficulty ? handleBackToLevels() : router.push("/exercises")}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 13, fontWeight: 600, color: "#64748b",
            background: "transparent", border: "none",
            cursor: "pointer", marginBottom: 20, padding: 0,
          }}
        >
          {selectedDifficulty ? "← Chọn cấp độ" : "← Exercise Hub"}
        </button>

        {/* Page header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 24 }}>🔍</span>
            <h1 style={{
              margin: 0, fontSize: 24, fontWeight: 800,
              color: "#1e3a5f", letterSpacing: "-0.02em",
            }}>
              Error Hunter{" "}
              <span style={{ fontSize: 14, fontWeight: 500, color: "#64748b" }}>
                Săn lỗi ngữ pháp
              </span>
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: 13.5, color: "#64748b", maxWidth: 560 }}>
            {selectedDifficulty
              ? "Đọc đoạn văn và chọn các lỗi ngữ pháp bạn phát hiện. Bạn có thể gõ bản sửa đúng cho mỗi lỗi."
              : "Chọn cấp độ luyện tập — tìm và sửa lỗi ngữ pháp trong đoạn văn IELTS."}
          </p>
        </div>

        {/* Difficulty selector OR passage shell */}
        {!selectedDifficulty ? (
          <>
            <p style={{
              margin: "0 0 16px", fontSize: 12, fontWeight: 700,
              letterSpacing: "0.08em", color: "#94a3b8", textTransform: "uppercase",
            }}>
              Chọn cấp độ luyện tập
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {(["STARTER", "INTERMEDIATE", "ADVANCED"] as DifficultyKey[]).map((key) => (
                <DifficultyCard key={key} meta={DIFFICULTY_META[key]} onClick={() => setSelectedDifficulty(key)} />
              ))}
            </div>
            <p style={{ textAlign: "center", color: "#94a3b8", fontSize: 12, marginTop: 24 }}>
              Mỗi đoạn văn được thiết kế sát đề IELTS Writing Task 2 và Speaking Part 2/3
            </p>
          </>
        ) : (
          <>
            {/* Passage title */}
            {state.passage?.title && (
              <div style={{
                marginBottom: 16, padding: "10px 16px",
                background: "#eff6ff", borderRadius: 10, border: "1px solid #bfdbfe",
              }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1e40af" }}>
                  {state.passage.titleVi ?? state.passage.title}
                </p>
              </div>
            )}

            <ErrorHunterShell
              phase={state.phase}
              passage={state.passage}
              errorsMeta={state.errorsMeta}
              selections={state.selections}
              result={state.result}
              errorMsg={state.errorMsg}
              onAddSelection={(sel) => dispatch({ type: "ADD_SEL", sel })}
              onRemoveSelection={(id) => dispatch({ type: "REMOVE_SEL", id })}
              onUpdateCorrection={(id, correction) =>
                dispatch({ type: "UPDATE_CORRECTION", id, correction })
              }
              onSubmit={handleSubmit}
              onNext={loadNext}
            />
          </>
        )}
      </div>
    </div>
  );
}
