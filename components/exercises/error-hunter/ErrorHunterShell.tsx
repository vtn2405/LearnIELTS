// components/exercises/error-hunter/ErrorHunterShell.tsx
"use client";

import { useState } from "react";
import PassageViewer from "./PassageViewer";
import CorrectionInput from "./CorrectionInput";
import Toolbar from "./Toolbar";
import ResultPanel from "./ResultPanel";
import type {
  EhPassageClient,
  EhErrorMeta,
  EhSubmitResponse,
  UserSelection,
} from "@/lib/types/error-hunter";

type Phase = "loading" | "playing" | "submitting" | "result";

interface Props {
  phase: Phase;
  passage: EhPassageClient | null;
  errorsMeta: EhErrorMeta[];
  selections: UserSelection[];
  result: EhSubmitResponse | null;
  errorMsg: string | null;
  onAddSelection: (sel: UserSelection) => void;
  onRemoveSelection: (id: string) => void;
  onUpdateCorrection: (id: string, correction: string) => void;
  onSubmit: () => void;
  onNext: () => void;
}

export default function ErrorHunterShell({
  phase, passage, errorsMeta, selections, result,
  errorMsg, onAddSelection, onRemoveSelection,
  onUpdateCorrection, onSubmit, onNext,
}: Props) {
  const [hintsVisible, setHintsVisible] = useState(false);
  const locked = phase === "result" || phase === "submitting";

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (phase === "loading") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: 300, color: "#94a3b8", fontSize: 15 }}>
        Loading passage…
      </div>
    );
  }

  if (!passage) {
    return (
      <div style={{ padding: 24, color: "#dc2626", fontSize: 14 }}>
        {errorMsg ?? "Failed to load passage. Please try again."}
      </div>
    );
  }

  // ── Hint panel (ADVANCED only) ────────────────────────────────────────────
  const visibleHints = errorsMeta.filter((m) => m.errorType);

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: phase === "result" ? "1fr 380px" : "1fr",
      gap: 24,
      alignItems: "start",
    }}>
      {/* ── LEFT: Passage column ── */}
      <div>
        {/* Header */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
            <Tag label={passage.topic} color="#0369a1" />
            <Tag label={passage.taskType.replace("_", " ")} color="#7c3aed" />
            <Tag label={`Band ${passage.bandTarget}`} color="#15803d" />
          </div>
          <p style={{ margin: 0, fontSize: 14, color: "#374151",
            background: "#f8fafc", borderRadius: 8, padding: "10px 14px",
            border: "1px solid #e2e8f0", lineHeight: 1.6 }}>
            {passage.questionPrompt}
          </p>
        </div>

        {/* Toolbar */}
        <Toolbar
          selectionCount={selections.length}
          totalErrors={passage.totalErrors}
          difficulty={passage.difficulty}
          errorsMeta={errorsMeta}
          phase={phase}
          hintsVisible={hintsVisible}
          onToggleHints={() => setHintsVisible((v) => !v)}
          onSubmit={onSubmit}
          onClear={() => selections.forEach((s) => onRemoveSelection(s.id))}
        />

        {/* Inline hints (ADVANCED) */}
        {hintsVisible && visibleHints.length > 0 && (
          <div style={{
            background: "#fffbeb", borderRadius: 8, padding: "10px 14px",
            border: "1px solid #fde68a", marginBottom: 14,
            display: "flex", gap: 8, flexWrap: "wrap",
          }}>
            {visibleHints.map((h) => (
              <span key={h.id} style={{
                fontSize: 12, fontWeight: 600, color: "#92400e",
                background: "#fef3c7", borderRadius: 9999,
                padding: "2px 10px", border: "1px solid #fde68a",
              }}>
                {h.errorType}
              </span>
            ))}
          </div>
        )}

        {/* Passage text */}
        <div style={{
          background: "#fff", borderRadius: 12, padding: "22px 26px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
          marginBottom: 16,
        }}>
          <PassageViewer
            passageText={passage.passageText}
            selections={selections}
            feedback={result?.perErrorFeedback}
            locked={locked}
            onAddSelection={onAddSelection}
          />
        </div>

        {/* Correction inputs */}
        {!locked && (
          <CorrectionInput
            selections={selections}
            locked={locked}
            onUpdateCorrection={onUpdateCorrection}
            onRemoveSelection={onRemoveSelection}
          />
        )}

        {/* Legend */}
        {phase === "result" && (
          <div style={{
            display: "flex", gap: 14, marginTop: 12, flexWrap: "wrap",
          }}>
            {[
              { color: "#16a34a", label: "Found & fixed" },
              { color: "#d97706", label: "Found, wrong fix" },
              { color: "#dc2626", label: "Missed" },
              { color: "#7c3aed", label: "False alarm" },
            ].map((item) => (
              <span key={item.label} style={{
                display: "flex", alignItems: "center", gap: 5,
                fontSize: 11.5, color: "#64748b",
              }}>
                <span style={{
                  width: 10, height: 10, borderRadius: 2,
                  background: item.color, display: "inline-block",
                }} />
                {item.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── RIGHT: Result panel (only after submit) ── */}
      {phase === "result" && result && (
        <div style={{ position: "sticky", top: 80 }}>
          <ResultPanel result={result} onNext={onNext} />
        </div>
      )}
    </div>
  );
}

function Tag({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
      color, background: `${color}12`,
      border: `1px solid ${color}30`,
      borderRadius: 9999, padding: "2px 9px",
      textTransform: "uppercase" as const,
    }}>
      {label}
    </span>
  );
}
