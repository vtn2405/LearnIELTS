// components/exercises/error-hunter/CorrectionInput.tsx
"use client";

import { useState } from "react";
import type { UserSelection } from "@/lib/types/error-hunter";

interface Props {
  selections: UserSelection[];
  onUpdateCorrection: (id: string, correction: string) => void;
  onRemoveSelection: (id: string) => void;
  locked: boolean;
}

export default function CorrectionInput({
  selections,
  onUpdateCorrection,
  onRemoveSelection,
  locked,
}: Props) {
  if (selections.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <p style={{
        margin: 0, fontSize: 11, fontWeight: 700,
        letterSpacing: "0.08em", color: "#92400e", textTransform: "uppercase",
      }}>
        Your selections
      </p>
      {selections.map((sel) => (
        <SelectionRow
          key={sel.id}
          sel={sel}
          locked={locked}
          onUpdate={(v) => onUpdateCorrection(sel.id, v)}
          onRemove={() => onRemoveSelection(sel.id)}
        />
      ))}
    </div>
  );
}

function SelectionRow({
  sel, locked, onUpdate, onRemove,
}: {
  sel: UserSelection;
  locked: boolean;
  onUpdate: (v: string) => void;
  onRemove: () => void;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      background: "#fffbeb", borderRadius: 8,
      padding: "7px 10px", border: "1px solid #fde68a",
    }}>
      {/* Error text */}
      <span style={{
        fontSize: 13, fontWeight: 600, color: "#92400e",
        minWidth: 80, maxWidth: 140,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        flexShrink: 0,
      }}>
        "{sel.selectedText}"
      </span>

      <span style={{ color: "#d97706", fontSize: 13, flexShrink: 0 }}>→</span>

      {/* Correction input */}
      <input
        type="text"
        disabled={locked}
        value={sel.userCorrection ?? ""}
        onChange={(e) => onUpdate(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Type correction (optional)"
        style={{
          flex: 1, fontSize: 13, padding: "3px 8px",
          border: `1px solid ${focused ? "#f59e0b" : "#e2e8f0"}`,
          borderRadius: 6, outline: "none",
          background: locked ? "#f8fafc" : "#fff",
          color: "#1e293b",
          transition: "border-color 0.15s",
        }}
      />

      {/* Remove button */}
      {!locked && (
        <button
          onClick={onRemove}
          title="Remove selection"
          style={{
            border: "none", background: "transparent",
            cursor: "pointer", color: "#94a3b8",
            fontSize: 16, lineHeight: 1, padding: "0 2px",
            flexShrink: 0,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}
