"use client";

import { motion } from "framer-motion";
import type { Feedback, IeltsUse } from "../types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface FeedbackPanelProps {
  feedback: Feedback;
  isCorrect: boolean;
  ieltsUse: IeltsUse;
  reusablePattern: string;
  grammarPattern?: string;
}

// ─── Skill icon ───────────────────────────────────────────────────────────────

function getSkillIcon(skill: string): string {
  switch (skill.toLowerCase()) {
    case "speaking": return "🗣";
    case "writing": return "✍️";
    case "reading": return "📖";
    case "listening": return "🎧";
    default: return "📝";
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FeedbackPanel({
  feedback,
  isCorrect,
  ieltsUse,
  reusablePattern,
  grammarPattern,
}: FeedbackPanelProps) {
  const accentColor = isCorrect ? "#0d9488" : "#ef4444";
  const accentBg = isCorrect ? "rgba(13,148,136,0.04)" : "rgba(239,68,68,0.04)";
  const accentBorder = isCorrect ? "rgba(13,148,136,0.2)" : "rgba(239,68,68,0.2)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{
        borderRadius: 12, padding: "20px 24px",
        background: accentBg,
        border: `1px solid ${accentBorder}`,
        borderLeft: `3px solid ${accentColor}`,
      }}
    >
      {/* ── Header: Correct / Not quite ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8, marginBottom: 16,
      }}>
        <span style={{
          width: 24, height: 24, borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 700,
          background: isCorrect ? "rgba(13,148,136,0.12)" : "rgba(239,68,68,0.12)",
          color: accentColor,
        }}>
          {isCorrect ? "✓" : "✗"}
        </span>
        <span style={{
          fontSize: 15, fontWeight: 700, color: accentColor,
          fontFamily: "var(--font-plus-jakarta), 'Plus Jakarta Sans', sans-serif",
        }}>
          {isCorrect ? "Correct!" : "Not quite"}
        </span>
      </div>

      {/* ── Feedback sections ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* 1. Structure / Explanation */}
        <FeedbackSection
          icon="✓"
          label="Structure"
          text={feedback.correct}
          accentColor="#194a6d"
        />

        {/* 2. IELTS Usage */}
        <FeedbackSection
          icon={getSkillIcon(ieltsUse.skill)}
          label={`IELTS Usage — ${ieltsUse.skill} ${ieltsUse.part}`}
          text={feedback.ieltsUsage}
          accentColor="#194a6d"
        />

        {/* 3. Band Tip */}
        <FeedbackSection
          icon="📈"
          label="Band Tip"
          text={feedback.bandTip}
          accentColor="#b45309"
        />

        {/* 4. Common Mistake */}
        <FeedbackSection
          icon="⚠"
          label="Common Mistake"
          text={feedback.commonMistake}
          accentColor="#dc2626"
        />
      </div>

      {/* ── Grammar pattern ── */}
      {grammarPattern && (
        <div style={{
          marginTop: 16, padding: "8px 14px", borderRadius: 6,
          background: "rgba(25,74,109,0.04)", border: "1px solid rgba(25,74,109,0.1)",
        }}>
          <p style={{
            margin: "0 0 2px", fontSize: 9, fontWeight: 700,
            letterSpacing: "0.1em", textTransform: "uppercase", color: "#a0adb8",
          }}>
            Pattern
          </p>
          <code style={{
            fontSize: 12, color: "#194a6d", lineHeight: 1.5,
            fontFamily: "var(--font-jetbrains-mono), 'JetBrains Mono', monospace",
            fontWeight: 500,
          }}>
            {grammarPattern}
          </code>
        </div>
      )}

      {/* ── Reusable pattern ── */}
      <div style={{
        marginTop: 14, padding: "10px 14px", borderRadius: 6,
        borderLeft: "3px solid #0d9488",
        background: "rgba(13,148,136,0.03)",
      }}>
        <p style={{
          margin: "0 0 4px", fontSize: 9, fontWeight: 700,
          letterSpacing: "0.1em", textTransform: "uppercase", color: "#a0adb8",
        }}>
          Reusable Pattern
        </p>
        <p style={{
          margin: 0, fontSize: 13, color: "#194a6d", lineHeight: 1.7,
          fontStyle: "italic",
          fontFamily: "var(--font-jetbrains-mono), 'JetBrains Mono', monospace",
        }}>
          {reusablePattern}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Feedback Section Row ─────────────────────────────────────────────────────

function FeedbackSection({
  icon,
  label,
  text,
  accentColor,
}: {
  icon: string;
  label: string;
  text: string;
  accentColor: string;
}) {
  return (
    <div style={{
      padding: "10px 14px", borderRadius: 8,
      background: "#ffffff", border: "1px solid rgba(0,0,0,0.04)",
    }}>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <p style={{
            margin: "0 0 3px", fontSize: 10, fontWeight: 700,
            letterSpacing: "0.06em", textTransform: "uppercase",
            color: accentColor, opacity: 0.7,
          }}>
            {label}
          </p>
          <p style={{
            margin: 0, fontSize: 13, color: "#2d4a5e", lineHeight: 1.65,
          }}>
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}
