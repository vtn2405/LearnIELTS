"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { SD } from "../../constants/speedDrillTheme";
import { EASE_STANDARD, EASE_SPRING } from "../../utils/animation";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DrillItem {
  item_id: string;
  stem: string;
  options: string[];
  correct_index: number;
  correct_answer: string;
  explanation_short: string;
  explanation_long: string;
  feedback_correct: string;
  feedback_wrong: string;
  wrong_answer_feedbacks?: Record<string, string>;
  ielts_tip: string;
  grammar_tag: string;
  error_tag: string;
  difficulty_tier: string;
}

export interface LevelRule {
  label: string;
  label_vi: string;
  band_range: string;
  description_vi: string;
  question_count: number;
  timer_seconds: number;
  max_score: number;
  score_tiers: { min: number; max: number; label: string }[];
}

export interface ScoreRule {
  speed_scoring: { tiers: { max_seconds?: number; points: number; condition?: string }[] };
  streak_bonus: { milestones: { streak: number; bonus_points: number; label: string }[] };
}

interface GameState {
  items: DrillItem[];
  currentIndex: number;
  score: number;
  streak: number;
  maxStreak: number;
  answers: { item: DrillItem; chosen: number; correct: boolean; timeUsed: number; points: number }[];
  phase: "question" | "feedback" | "done";
  chosenIndex: number | null;
  timeLeft: number;
  timerSeconds: number;
  bonusLabel: string | null;
}

interface Props {
  items: DrillItem[];
  levelRule: LevelRule;
  scoreRule: ScoreRule;
  levelKey: "starter" | "build_up" | "challenge";
  onDone: (result: GameState) => void;
  onBack: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcSpeedPoints(timeUsed: number, _timerSeconds: number, scoreRule: ScoreRule): number {
  const tiers = scoreRule.speed_scoring.tiers;
  for (const tier of tiers) {
    if (tier.condition === "wrong_or_timeout") return 0;
    if (tier.max_seconds !== undefined && timeUsed <= tier.max_seconds) return tier.points;
  }
  return 60;
}

function checkStreakBonus(streak: number, scoreRule: ScoreRule): { bonus: number; label: string } | null {
  const milestones = [...scoreRule.streak_bonus.milestones].sort((a, b) => b.streak - a.streak);
  for (const m of milestones) {
    if (streak === m.streak) return { bonus: m.bonus_points, label: m.label };
  }
  return null;
}

const OPTION_COLORS = [
  { bg: "#e21b3c", text: "#ffffff" },
  { bg: "#26890c", text: "#ffffff" },
  { bg: "#d89e00", text: "#ffffff" },
  { bg: "#1368ce", text: "#ffffff" },
];

// ─── Timer Ring ───────────────────────────────────────────────────────────────

function TimerRing({ timeLeft, total }: { timeLeft: number; total: number }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const pct = timeLeft / total;
  const color = pct > 0.5 ? SD.correct : pct > 0.25 ? SD.timer : SD.wrong;

  return (
    <div style={{ position: "relative", width: 96, height: 96, flexShrink: 0 }}>
      <svg width={96} height={96} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={48} cy={48} r={r} fill="none" stroke={SD.borderAlt} strokeWidth={2} />
        <circle
          cx={48} cy={48} r={r} fill="none"
          stroke={color} strokeWidth={2}
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex",
        alignItems: "center", justifyContent: "center",
        fontSize: 32, fontWeight: 300, color: SD.textPrimary,
      }}>
        {timeLeft}
      </div>
    </div>
  );
}

// ─── Progress Bar (smooth linear transition) ──────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = (current / total) * 100;
  return (
    <div style={{
      width: "100%", height: 4, borderRadius: 9999,
      background: SD.borderAlt, overflow: "hidden",
    }}>
      <div style={{
        height: "100%", borderRadius: 9999,
        width: `${pct}%`,
        background: "linear-gradient(90deg, #6366f1, #a855f7)",
        transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
      }} />
    </div>
  );
}

// ─── Main Game Component ──────────────────────────────────────────────────────

export default function SpeedDrillGame({ items, levelRule, scoreRule, levelKey, onDone, onBack }: Props) {
  const timerSeconds = levelRule.timer_seconds;
  const totalQ = items.length;

  const [hoveredOption, setHoveredOption] = useState<number | null>(null);

  const [state, setState] = useState<GameState>({
    items, currentIndex: 0, score: 0, streak: 0, maxStreak: 0,
    answers: [], phase: "question", chosenIndex: null,
    timeLeft: timerSeconds, timerSeconds, bonusLabel: null,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const handleAnswer = useCallback((chosenIndex: number, timedOut = false) => {
    const s = stateRef.current;
    if (s.phase !== "question") return;

    const item = s.items[s.currentIndex];
    const timeUsed = timedOut ? s.timerSeconds + 1 : s.timerSeconds - s.timeLeft;
    const correct = !timedOut && chosenIndex === item.correct_index;
    const basePoints = correct ? calcSpeedPoints(timeUsed, s.timerSeconds, scoreRule) : 0;

    const newStreak = correct ? s.streak + 1 : 0;
    const newMaxStreak = Math.max(s.maxStreak, newStreak);
    const bonus = correct ? checkStreakBonus(newStreak, scoreRule) : null;
    const totalPoints = basePoints + (bonus?.bonus ?? 0);
    const newScore = s.score + totalPoints;

    setState(prev => ({
      ...prev,
      phase: "feedback",
      chosenIndex: timedOut ? -1 : chosenIndex,
      score: newScore,
      streak: newStreak,
      maxStreak: newMaxStreak,
      bonusLabel: bonus?.label ?? null,
      answers: [...prev.answers, { item, chosen: timedOut ? -1 : chosenIndex, correct, timeUsed, points: totalPoints }],
    }));

    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [scoreRule]);

  // Timer
  useEffect(() => {
    if (state.phase !== "question") return;
    intervalRef.current = setInterval(() => {
      setState(prev => {
        if (prev.phase !== "question") return prev;
        const next = prev.timeLeft - 1;
        if (next <= 0) {
          setTimeout(() => handleAnswer(-1, true), 0);
          return { ...prev, timeLeft: 0 };
        }
        return { ...prev, timeLeft: next };
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [state.phase, state.currentIndex, handleAnswer]);

  // Keyboard shortcuts
  const goNextRef = useRef<() => void>(() => {});
  goNextRef.current = () => {
    const s = stateRef.current;
    const nextIndex = s.currentIndex + 1;
    if (nextIndex >= totalQ) {
      setState(prev => ({ ...prev, phase: "done" }));
      setTimeout(() => onDone(stateRef.current), 100);
      return;
    }
    setState(prev => ({
      ...prev,
      phase: "question",
      currentIndex: nextIndex,
      chosenIndex: null,
      bonusLabel: null,
      timeLeft: timerSeconds,
    }));
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (stateRef.current.phase === "question") {
        if (e.key === "1") handleAnswer(0);
        if (e.key === "2") handleAnswer(1);
        if (e.key === "3") handleAnswer(2);
        if (e.key === "4") handleAnswer(3);
      } else if (stateRef.current.phase === "feedback" && e.key === " ") {
        goNextRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleAnswer]);

  function goNext() {
    goNextRef.current();
  }

  const item = state.items[state.currentIndex];
  const qNum = state.currentIndex + 1;
  const isCorrect = state.chosenIndex === item.correct_index;

  // Determine animation class for each option in feedback phase
  function getOptionAnimation(i: number): string {
    if (state.phase !== "feedback") return "";
    if (i === item.correct_index) return "sdPulseCorrect";
    if (i === state.chosenIndex && i !== item.correct_index) return "sdShakeWrong";
    return "";
  }

  return (
    <div style={{
      minHeight: "100vh", background: SD.bg,
      display: "flex", flexDirection: "column",
      fontFamily: "var(--font-inter), Inter, sans-serif",
      animation: "sdGameFadeIn 0.35s ease-out",
    }}>
      {/* Top Bar */}
      <div style={{
        background: SD.bg, borderBottom: `1px solid ${SD.border}`,
        padding: "12px 20px", display: "flex", flexDirection: "column", gap: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={onBack} style={{
              background: "transparent", border: "1px solid #475569",
              color: SD.textSecondary, borderRadius: 8, padding: "5px 12px",
              fontSize: 13, cursor: "pointer", fontWeight: 600,
            }}>← Back</button>
            <div style={{ display: "flex", gap: 6 }}>
              {state.items.map((_, i) => (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: i < state.currentIndex
                    ? (state.answers[i]?.correct ? SD.correct : SD.wrong)
                    : i === state.currentIndex ? SD.timer : SD.borderAlt,
                  transition: `background 0.3s ${EASE_STANDARD}`,
                }} />
              ))}
            </div>
            <span style={{ color: SD.textSecondary, fontSize: 13, fontWeight: 600 }}>
              {qNum}/{totalQ}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, color: SD.textMuted, fontWeight: 700, letterSpacing: "0.1em" }}>SCORE</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: SD.textPrimary }}>{state.score}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, color: SD.textMuted, fontWeight: 700, letterSpacing: "0.1em" }}>🔥 STREAK</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: state.streak > 0 ? "#f97316" : "#f8fafc" }}>
                {state.streak}
              </div>
            </div>
            <div style={{
              padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 800,
              background: levelKey === "starter" ? "#1d4ed8" : levelKey === "build_up" ? "#7c3aed" : "#dc2626",
              color: "#fff", letterSpacing: "0.08em",
            }}>
              {levelRule.label.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Smooth Progress Bar */}
        <ProgressBar current={state.currentIndex + (state.phase === "feedback" ? 1 : 0)} total={totalQ} />
      </div>

      {/* Bonus Banner */}
      {state.bonusLabel && state.phase === "feedback" && (
        <div style={{
          background: "linear-gradient(90deg, #f97316, #ef4444)",
          padding: "8px 20px", textAlign: "center",
          fontSize: 16, fontWeight: 900, color: "#fff",
          letterSpacing: "0.05em",
          animation: "sdSlideDown 0.3s ease",
        }}>
          {state.bonusLabel}
        </div>
      )}

      {/* Main Content */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", padding: "24px 20px", maxWidth: 760,
        margin: "0 auto", width: "100%",
      }}>
        {/* Timer + Stem */}
        <div style={{
          width: "100%", background: SD.surface, borderRadius: 16,
          padding: "24px 28px", marginBottom: 20,
          border: `1px solid ${SD.border}`,
          animation: "sdFadeUp 0.3s ease-out",
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
            <TimerRing timeLeft={state.timeLeft} total={timerSeconds} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#71717a", letterSpacing: "0.1em", marginBottom: 10 }}>
                QUESTION {qNum} OF {totalQ}
              </div>
              <p style={{
                margin: 0, fontSize: 18, fontWeight: 600,
                color: "#fafafa", lineHeight: 1.6,
                whiteSpace: "pre-line",
              }}>
                {item.stem}
              </p>
            </div>
          </div>
        </div>

        {/* Options */}
        <div style={{
          width: "100%", display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16, marginBottom: 20,
        }}>
          {item.options.map((opt, i) => {
            const col = OPTION_COLORS[i % 4];
            const animClass = getOptionAnimation(i);
            let transform = "scale(1)";
            let opacity = 1;
            let boxShadow = "none";
            let zIndex = 1;

            if (state.phase === "feedback") {
              if (i === item.correct_index) {
                boxShadow = "0 0 24px #10b98150, 0 4px 20px #10b98130";
                transform = "scale(1.04)";
                zIndex = 10;
              } else if (i === state.chosenIndex) {
                boxShadow = "0 0 24px #ef444450, 0 4px 20px #ef444430";
                transform = "scale(1.04)";
                zIndex = 10;
              } else {
                opacity = 0.35;
              }
            } else if (state.phase === "question" && hoveredOption === i) {
              transform = "scale(1.03)";
              boxShadow = "0 6px 20px rgba(0,0,0,0.3)";
            }

            return (
              <button
                key={i}
                onClick={() => state.phase === "question" && handleAnswer(i)}
                onMouseEnter={() => state.phase === "question" && setHoveredOption(i)}
                onMouseLeave={() => setHoveredOption(null)}
                disabled={state.phase === "feedback"}
                className={animClass}
                style={{
                  background: col.bg,
                  borderRadius: 12,
                  padding: "24px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: 12,
                  cursor: state.phase === "question" ? "pointer" : "default",
                  transition: `transform 0.2s ${EASE_SPRING}, opacity 0.25s ease, box-shadow 0.25s ease`,
                  textAlign: "center",
                  boxShadow,
                  transform,
                  opacity,
                  position: "relative",
                  zIndex,
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  minHeight: 120,
                }}
              >
                <span style={{
                  fontSize: 22,
                  fontWeight: 600,
                  color: col.text,
                  lineHeight: 1.4,
                }}>
                  {opt}
                </span>
              </button>
            );
          })}
        </div>

        {/* Feedback Panel */}
        {state.phase === "feedback" && (
          <div style={{
            width: "100%", borderRadius: 16, overflow: "hidden",
            border: `1px solid ${isCorrect ? SD.correct : SD.wrong}`,
            animation: "sdFeedbackSlideUp 0.3s ease-out",
          }}>
            {/* Feedback header */}
            <div style={{
              background: isCorrect
                ? "linear-gradient(135deg, #064e3b, #065f46)"
                : "linear-gradient(135deg, #450a0a, #7f1d1d)",
              padding: "14px 20px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 22 }}>{isCorrect ? "✅" : "❌"}</span>
                <span style={{
                  fontSize: 16, fontWeight: 600,
                  color: isCorrect ? "#6ee7b7" : "#fca5a5",
                }}>
                  {state.chosenIndex === -1
                    ? "⏰ Time's up — let's review"
                    : isCorrect
                    ? item.feedback_correct
                    : (() => {
                        const chosenText = state.chosenIndex !== null
                          ? item.options[state.chosenIndex]
                          : "";
                        return `❌ "${chosenText}" — đúng là: "${item.correct_answer}"`;
                      })()}
                </span>
              </div>
              <button
                onClick={goNext}
                style={{
                  background: isCorrect ? SD.correct : SD.wrong,
                  border: "none", color: "#fff", borderRadius: 10,
                  padding: "8px 18px", fontSize: 14, fontWeight: 600,
                  cursor: "pointer",
                  transition: "transform 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                {state.currentIndex + 1 >= totalQ ? "Kết quả →" : "Tiếp →"}
              </button>
            </div>

            {/* Explanation */}
            <div style={{ background: SD.bg, padding: "16px 20px" }}>
              {!isCorrect && state.chosenIndex !== -1 && (() => {
                const chosenText = state.chosenIndex !== null && state.chosenIndex >= 0
                  ? item.options[state.chosenIndex] : "";
                const msg = item.wrong_answer_feedbacks?.[chosenText] ?? item.feedback_wrong;
                return (
                  <div style={{
                    marginBottom: 10, padding: "8px 12px",
                    background: "#450a0a50", borderRadius: 8,
                    borderLeft: `3px solid ${SD.wrong}`,
                  }}>
                    <p style={{ margin: 0, fontSize: 13, color: "#fca5a5", fontWeight: 600 }}>
                      💬 {msg}
                    </p>
                  </div>
                );
              })()}
              <p style={{ margin: "0 0 8px", fontSize: 14, color: "#cbd5e1", lineHeight: 1.6 }}>
                <strong style={{ color: "#e2e8f0" }}>📖 Giải thích:</strong> {item.explanation_long}
              </p>
              <div style={{
                marginTop: 10, padding: "10px 14px",
                background: SD.surfaceAlt, borderRadius: 10,
                borderLeft: `3px solid ${SD.timer}`,
              }}>
                <p style={{ margin: 0, fontSize: 13, color: "#fde68a", fontWeight: 600 }}>
                  💡 IELTS Tip: {item.ielts_tip}
                </p>
              </div>
              <p style={{ margin: "8px 0 0", fontSize: 12, color: "#475569" }}>
                Press <kbd style={{
                  background: SD.surfaceAlt, border: "1px solid #475569",
                  borderRadius: 4, padding: "1px 6px", fontSize: 11, color: SD.textSecondary,
                }}>Space</kbd> to continue
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes sdGameFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes sdFadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes sdSlideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes sdFeedbackSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes sdPulseCorrectKf {
          0% { transform: scale(1.04); box-shadow: 0 0 0 0 rgba(16,185,129,0.5); }
          50% { transform: scale(1.08); box-shadow: 0 0 30px 8px rgba(16,185,129,0.3); }
          100% { transform: scale(1.04); box-shadow: 0 0 24px 4px rgba(16,185,129,0.2); }
        }
        @keyframes sdShakeWrongKf {
          0% { transform: translateX(0) scale(1.04); }
          15% { transform: translateX(-6px) scale(1.04); }
          30% { transform: translateX(6px) scale(1.04); }
          45% { transform: translateX(-4px) scale(1.04); }
          60% { transform: translateX(4px) scale(1.04); }
          75% { transform: translateX(-2px) scale(1.04); }
          100% { transform: translateX(0) scale(1.04); }
        }
        .sdPulseCorrect {
          animation: sdPulseCorrectKf 0.6s ease-out !important;
        }
        .sdShakeWrong {
          animation: sdShakeWrongKf 0.5s ease-out !important;
        }
      `}</style>
    </div>
  );
}
