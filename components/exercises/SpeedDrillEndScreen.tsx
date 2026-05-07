"use client";

import { useMemo } from "react";
import type { DrillItem, LevelRule } from "./SpeedDrillGame";
import { SD } from "../../constants/speedDrillTheme";

interface Answer {
  item: DrillItem;
  chosen: number;
  correct: boolean;
  timeUsed: number;
  points: number;
}

interface Props {
  score: number;
  maxScore: number;
  streak: number;
  maxStreak: number;
  answers: Answer[];
  levelRule: LevelRule;
  levelKey: "starter" | "build_up" | "challenge";
  onRetry: () => void;
  onBackModes: () => void;
  onBackHub: () => void;
  onNext?: () => void;
}

const LEVEL_GRADIENT: Record<string, string> = {
  starter: "linear-gradient(135deg, #1d4ed8, #6366f1)",
  build_up: "linear-gradient(135deg, #7c3aed, #a855f7)",
  challenge: "linear-gradient(135deg, #dc2626, #f97316)",
};

export default function SpeedDrillEndScreen({
  score, maxScore, streak, maxStreak, answers,
  levelRule, levelKey, onRetry, onBackModes, onBackHub, onNext,
}: Props) {
  const accuracy = Math.round((answers.filter(a => a.correct).length / answers.length) * 100);
  const avgTime = (answers.reduce((s, a) => s + a.timeUsed, 0) / answers.length).toFixed(1);

  const scoreTier = levelRule.score_tiers.find(t => score >= t.min && score <= t.max);

  // Weak tags = grammar_tag where wrong
  const weakTags = useMemo(() => {
    const tagMap: Record<string, { wrong: number; total: number }> = {};
    answers.forEach(a => {
      const t = a.item.grammar_tag;
      if (!tagMap[t]) tagMap[t] = { wrong: 0, total: 0 };
      tagMap[t].total++;
      if (!a.correct) tagMap[t].wrong++;
    });
    return Object.entries(tagMap)
      .filter(([, v]) => v.wrong > 0)
      .sort((a, b) => b[1].wrong - a[1].wrong)
      .map(([tag, v]) => ({ tag, wrong: v.wrong, total: v.total }));
  }, [answers]);

  const pct = Math.round((score / maxScore) * 100);
  const passed = score >= (levelRule.score_tiers[1]?.min ?? 0);

  return (
    <div style={{
      minHeight: "100vh", background: "#0f172a",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "32px 20px",
      fontFamily: "var(--font-inter), Inter, sans-serif",
    }}>
      <div style={{ width: "100%", maxWidth: 600 }}>
        {/* Header card */}
        <div style={{
          background: LEVEL_GRADIENT[levelKey],
          borderRadius: "20px 20px 0 0",
          padding: "32px 28px 24px",
          textAlign: "center",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", inset: 0, opacity: 0.1,
            backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }} />

          <div style={{ fontSize: 52, marginBottom: 8 }}>
            {accuracy >= 90 ? "🏆" : accuracy >= 70 ? "⭐" : accuracy >= 50 ? "💪" : "📚"}
          </div>

          <h1 style={{ margin: "0 0 4px", fontSize: 32, fontWeight: 900, color: "#fff" }}>
            {score.toLocaleString()}
          </h1>
          <p style={{ margin: "0 0 12px", fontSize: 14, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>
            / {maxScore.toLocaleString()} điểm tối đa
          </p>

          {scoreTier && (
            <div style={{
              display: "inline-block", padding: "6px 16px",
              background: "rgba(255,255,255,0.2)", borderRadius: 20,
              fontSize: 15, fontWeight: 800, color: "#fff",
              backdropFilter: "blur(4px)",
            }}>
              {scoreTier.label}
            </div>
          )}

          {/* Score bar */}
          <div style={{ marginTop: 16, background: "rgba(0,0,0,0.25)", borderRadius: 10, height: 10 }}>
            <div style={{
              height: "100%", width: `${pct}%`, borderRadius: 10,
              background: "#fff",
              transition: "width 1s cubic-bezier(0.4,0,0.2,1)",
            }} />
          </div>
        </div>

        {/* Stats row */}
        <div style={{
          background: "#1e293b", display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          borderBottom: `1px solid ${SD.borderAlt}`,
        }}>
          {[
            { label: "Accuracy", value: `${accuracy}%`, icon: "🎯", color: accuracy >= 70 ? SD.correct : SD.wrong },
            { label: "Max Streak", value: `${maxStreak} 🔥`, icon: "⚡", color: "#f97316" },
            { label: "Avg Time", value: `${avgTime}s`, icon: "⏱", color: "#60a5fa" },
          ].map((s, i) => (
            <div key={i} style={{
              padding: "16px 8px", textAlign: "center",
              borderRight: i < 2 ? "1px solid #334155" : "none",
            }}>
              <div style={{ fontSize: 20 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: SD.textMuted, fontWeight: 700, letterSpacing: "0.08em" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Answer review */}
        <div style={{ background: "#1e293b", padding: "16px 20px", borderBottom: `1px solid ${SD.borderAlt}` }}>
          <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: SD.textMuted, letterSpacing: "0.1em" }}>
            REVIEW ({answers.length} câu)
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {answers.map((a, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: 10,
                padding: "10px 12px", borderRadius: 10,
                background: a.correct ? "#064e3b30" : "#450a0a30",
                border: `1px solid ${a.correct ? `${SD.correct}30` : `${SD.wrong}30`}`,
              }}>
                <span style={{ fontSize: 16, flexShrink: 0, marginTop: 2 }}>{a.correct ? "✅" : "❌"}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: "0 0 2px", fontSize: 12, color: "#e2e8f0", fontWeight: 600, lineHeight: 1.4 }}>
                    {a.item.stem.length > 80 ? a.item.stem.slice(0, 80) + "…" : a.item.stem}
                  </p>
                  {!a.correct && (
                    <p style={{ margin: 0, fontSize: 11, color: SD.textSecondary }}>
                      ✓ {a.item.correct_answer} — {a.item.explanation_short}
                    </p>
                  )}
                </div>
                <span style={{ fontSize: 13, fontWeight: 800, color: a.correct ? SD.correct : SD.wrong, flexShrink: 0 }}>
                  +{a.points}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Weak tags */}
        {weakTags.length > 0 && (
          <div style={{ background: "#1e293b", padding: "14px 20px", borderBottom: `1px solid ${SD.borderAlt}` }}>
            <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: "#f97316", letterSpacing: "0.1em" }}>
              ⚠ WEAK POINTS — CẦN ÔN THÊM
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {weakTags.map(({ tag, wrong, total }) => (
                <span key={tag} style={{
                  padding: "4px 10px", borderRadius: 20,
                  background: "#450a0a", border: "1px solid #ef444450",
                  fontSize: 12, fontWeight: 700, color: "#fca5a5",
                }}>
                  {tag.replace(/_/g, " ")} ({wrong}/{total})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div style={{
          background: "#1e293b", borderRadius: "0 0 20px 20px",
          padding: "20px", display: "flex", flexDirection: "column", gap: 10,
        }}>
          {/* Primary action */}
          {onNext && passed && (
            <button onClick={onNext} style={{
              width: "100%", padding: "14px", borderRadius: 12,
              background: LEVEL_GRADIENT[levelKey],
              color: "#fff", fontSize: 15, fontWeight: 800, border: "none",
              cursor: "pointer", letterSpacing: "0.02em",
            }}>
              Next Level →
            </button>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <button onClick={onRetry} style={{
              padding: "12px", borderRadius: 12,
              background: "transparent", border: "2px solid #475569",
              color: SD.textSecondary, fontSize: 14, fontWeight: 700, cursor: "pointer",
            }}>
              🔄 Retry
            </button>
            <button onClick={onBackModes} style={{
              padding: "12px", borderRadius: 12,
              background: "transparent", border: "2px solid #475569",
              color: SD.textSecondary, fontSize: 14, fontWeight: 700, cursor: "pointer",
            }}>
              ← Modes
            </button>
          </div>

          <button onClick={onBackHub} style={{
            padding: "10px", borderRadius: 12,
            background: "transparent", border: "none",
            color: "#475569", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>
            ↩ Back to Exercise Hub
          </button>
        </div>
      </div>
    </div>
  );
}
