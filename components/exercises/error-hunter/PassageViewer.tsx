// components/exercises/error-hunter/PassageViewer.tsx
"use client";

import { useRef } from "react";
import { v4 as uuid } from "uuid";
import type { UserSelection, EhPerErrorFeedback } from "@/lib/types/error-hunter";

interface Props {
  passageText: string;
  selections: UserSelection[];
  feedback?: EhPerErrorFeedback[];
  locked: boolean;
  onAddSelection: (sel: UserSelection) => void;
}

const STATUS_BG: Record<string, { bg: string; border: string }> = {
  FOUND_CORRECT:   { bg: "#bbf7d0", border: "#16a34a" },
  FOUND_WRONG_FIX: { bg: "#fde68a", border: "#d97706" },
  MISSED:          { bg: "#fecaca", border: "#dc2626" },
  FALSE_ALARM:     { bg: "#e9d5ff", border: "#7c3aed" },
};

export default function PassageViewer({
  passageText,
  selections,
  feedback,
  locked,
  onAddSelection,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseUp = () => {
    if (locked) return;
    const winSel = window.getSelection();
    if (!winSel || winSel.isCollapsed || winSel.rangeCount === 0) return;

    const range = winSel.getRangeAt(0);
    const container = containerRef.current;
    if (!container || !container.contains(range.commonAncestorContainer)) return;

    // Compute char offsets relative to the container's full text
    const preRange = document.createRange();
    preRange.setStart(container, 0);
    preRange.setEnd(range.startContainer, range.startOffset);
    const startIndex = preRange.toString().length;
    const endIndex = startIndex + range.toString().length;

    if (endIndex <= startIndex) return;

    // Reject if overlaps an existing selection
    const hasOverlap = selections.some(
      (s) => !(endIndex <= s.startIndex || startIndex >= s.endIndex)
    );
    if (hasOverlap) {
      winSel.removeAllRanges();
      return;
    }

    onAddSelection({
      id: uuid(),
      startIndex,
      endIndex,
      selectedText: passageText.slice(startIndex, endIndex),
    });
    winSel.removeAllRanges();
  };

  // Build flat list of annotated segments
  type Seg =
    | { kind: "text"; text: string }
    | { kind: "sel"; sel: UserSelection }
    | { kind: "fb"; fb: EhPerErrorFeedback };

  const markers = locked && feedback
    ? feedback
        .filter((fb) => fb.status !== "FALSE_ALARM") // false alarms are user ranges only
        .map((fb) => ({ start: fb.startIndex, end: fb.endIndex, fb }))
    : selections.map((s) => ({ start: s.startIndex, end: s.endIndex, sel: s }));

  markers.sort((a, b) => a.start - b.start);

  const segments: Seg[] = [];
  let cursor = 0;

  for (const m of markers) {
    if (m.start > cursor) {
      segments.push({ kind: "text", text: passageText.slice(cursor, m.start) });
    }
    if ("fb" in m) {
      segments.push({ kind: "fb", fb: m.fb });
    } else {
      segments.push({ kind: "sel", sel: m.sel });
    }
    cursor = m.end;
  }
  if (cursor < passageText.length) {
    segments.push({ kind: "text", text: passageText.slice(cursor) });
  }

  return (
    <div
      ref={containerRef}
      onMouseUp={handleMouseUp}
      style={{
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: 16.5,
        lineHeight: 1.95,
        color: "#1e293b",
        userSelect: locked ? "none" : "text",
        cursor: locked ? "default" : "text",
        letterSpacing: "0.01em",
      }}
    >
      {segments.map((seg, i) => {
        if (seg.kind === "text") return <span key={i}>{seg.text}</span>;

        if (seg.kind === "sel") {
          return (
            <mark
              key={i}
              style={{
                background: "#fef08a",
                borderBottom: "2.5px solid #ca8a04",
                borderRadius: 3,
                padding: "0 2px",
                cursor: "pointer",
              }}
              title={`Selected: "${seg.sel.selectedText}"`}
            >
              {seg.sel.selectedText}
            </mark>
          );
        }

        // feedback mark
        const style = STATUS_BG[seg.fb.status] ?? { bg: "#f1f5f9", border: "#94a3b8" };
        return (
          <mark
            key={i}
            style={{
              background: style.bg,
              borderBottom: `2.5px solid ${style.border}`,
              borderRadius: 3,
              padding: "0 2px",
            }}
            title={`${seg.fb.status === "MISSED" ? "Missed" : "Found"}: ${seg.fb.correctText}`}
          >
            {seg.fb.errorText}
          </mark>
        );
      })}
    </div>
  );
}
