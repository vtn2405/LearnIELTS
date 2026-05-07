"use client";

import { useState, useEffect } from "react";
import SpeedDrillGame from "./SpeedDrillGame";
import SpeedDrillEndScreen from "./SpeedDrillEndScreen";
import type { DrillItem, LevelRule, ScoreRule } from "./SpeedDrillGame";
import useSpeedDrillShell from "../../hooks/useSpeedDrillShell";
import { SD } from "../../constants/speedDrillTheme";
import { EASE_STANDARD } from "../../utils/animation";

// ─── Types ────────────────────────────────────────────────────────────────────

type LevelKey = "starter" | "build_up" | "challenge";

type View = "modes" | "playing" | "results";

interface DrillData {
  blueprint: {
    level_rules: Record<LevelKey, LevelRule>;
    scoring_rule: ScoreRule;
    items_by_level: Record<LevelKey, DrillItem[]>;
  };
  metadata: { grammar_point: string; subtitle_vi: string };
}

interface GameResult {
  score: number;
  maxStreak: number;
  answers: { item: DrillItem; chosen: number; correct: boolean; timeUsed: number; points: number }[];
}

interface Props {
  onBackHub: () => void;
}

// ─── Mode config ──────────────────────────────────────────────────────────────

const MODE_META: Record<LevelKey, {
  icon: string; gradient: string; borderColor: string;
  badgeColor: string; label: string; labelVi: string;
  band: string; timer: string; desc: string;
}> = {
  starter: {
    icon: "🚀", gradient: "linear-gradient(135deg, #1d4ed8 0%, #6366f1 100%)",
    borderColor: "#6366f1", badgeColor: "#1d4ed8",
    label: "Starter", labelVi: "Nền tảng", band: "Band 4.0–4.5",
    timer: "5s/câu", desc: "Lỗi rõ ràng — rèn phản xạ nền tảng",
  },
  build_up: {
    icon: "⚡", gradient: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
    borderColor: "#a855f7", badgeColor: "#7c3aed",
    label: "Build Up", labelVi: "Nâng cấp", band: "Band 4.5–5.5",
    timer: "6s/câu", desc: "Ngữ cảnh dài — lỗi tinh tế hơn",
  },
  challenge: {
    icon: "🏆", gradient: "linear-gradient(135deg, #dc2626 0%, #f97316 100%)",
    borderColor: "#f97316", badgeColor: "#dc2626",
    label: "Challenge", labelVi: "Thử thách", band: "Band 5.5–6.5",
    timer: "8s/câu", desc: "Lỗi tinh tế — 2-3 lớp ngữ pháp",
  },
};

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: 300, gap: 16,
    }}>
      <div style={{
        width: 48, height: 48, border: `4px solid ${SD.borderAlt}`,
        borderTop: "4px solid #6366f1", borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <p style={{ color: SD.textMuted, fontSize: 14, fontWeight: 600, margin: 0 }}>Đang tải dữ liệu…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Mode Card ────────────────────────────────────────────────────────────────

function ModeCard({
  levelKey, meta, rule, onClick, unlocked,
}: {
  levelKey: LevelKey;
  meta: typeof MODE_META[LevelKey];
  rule: LevelRule;
  onClick: () => void;
  unlocked: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={unlocked ? onClick : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered && unlocked
          ? `linear-gradient(135deg, ${meta.gradient.match(/#[a-f0-9]{6}/gi)?.[0] ?? "#1e293b"}15, ${meta.gradient.match(/#[a-f0-9]{6}/gi)?.[1] ?? "#334155"}10)`
          : "#1e293b",
        border: `1px solid ${hovered && unlocked ? meta.borderColor : SD.borderAlt}`,
        borderRadius: 20, padding: "30px 28px",
        cursor: unlocked ? "pointer" : "not-allowed",
        opacity: unlocked ? 1 : 0.5,
        transition: `transform 0.2s ${EASE_STANDARD}, box-shadow 0.3s ${EASE_STANDARD}, background 0.3s ${EASE_STANDARD}, border-color 0.3s ${EASE_STANDARD}`,
        transform: hovered && unlocked ? "translateY(-4px)" : "none",
        boxShadow: hovered && unlocked ? `0 12px 32px ${meta.borderColor}20` : "none",
        textAlign: "left", width: "100%",
        position: "relative", overflow: "hidden",
        display: "flex", flexDirection: "column", alignItems: "stretch",
      }}
    >
      {/* Glow bg on hover */}
      {hovered && unlocked && (
        <div style={{
          position: "absolute", top: -40, right: -40, width: 140, height: 140,
          borderRadius: "50%",
          background: meta.gradient,
          opacity: 0.08, pointerEvents: "none",
        }} />
      )}

      {/* Icon + badge row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: meta.gradient, display: "flex",
          alignItems: "center", justifyContent: "center",
          fontSize: 26, boxShadow: `0 4px 14px ${meta.borderColor}60`,
        }}>
          {meta.icon}
        </div>
        <span style={{
          fontSize: 11, fontWeight: 800, letterSpacing: "0.08em",
          padding: "3px 10px", borderRadius: 20,
          background: `${meta.badgeColor}30`, color: meta.borderColor,
          border: `1px solid ${meta.borderColor}50`,
        }}>
          {meta.band}
        </span>
      </div>

      {/* Title */}
      <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700, color: "#e2e8f0" }}>
        {meta.label}
        <span style={{ fontSize: 14, fontWeight: 500, color: SD.textMuted, marginLeft: 8 }}>{meta.labelVi}</span>
      </h3>

      {/* Desc */}
      <p style={{ margin: "0 0 24px", fontSize: 14, color: SD.textSecondary, lineHeight: 1.5, fontWeight: 400 }}>
        {meta.desc}
      </p>

      {/* Stats row */}
      <div style={{ 
        display: "flex", gap: 16, fontSize: 13, color: SD.textSecondary, fontWeight: 500,
        paddingTop: 16, borderTop: "1px solid #1e293b", marginTop: "auto"
      }}>
        <span>⏱ {meta.timer}</span>
        <span>❓ {rule.question_count} câu</span>
        <span>🏅 {rule.max_score} pts</span>
      </div>

      {!unlocked && (
        <div style={{
          marginTop: 12, fontSize: 12, color: SD.timer, fontWeight: 700,
        }}>
          🔒 Hoàn thành cấp trước để mở khóa
        </div>
      )}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SpeedDrillModule({ onBackHub }: Props) {
  useSpeedDrillShell();
  const [data, setData] = useState<DrillData | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [view, setView] = useState<View>("modes");
  const [activeLevel, setActiveLevel] = useState<LevelKey>("starter");
  const [result, setResult] = useState<GameResult | null>(null);

  // localStorage progress keys
  const LS_KEY_STARTER = "sd_unit1_starter_pass";
  const LS_KEY_BUILDUP = "sd_unit1_buildup_pass";

  const starterPassed = typeof window !== "undefined" && localStorage.getItem(LS_KEY_STARTER) === "1";
  const buildUpPassed = typeof window !== "undefined" && localStorage.getItem(LS_KEY_BUILDUP) === "1";

  useEffect(() => {
    fetch("/speed-drill-unit1-v4-final.json")
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json: DrillData) => setData(json))
      .catch((e: Error) => setLoadErr(e.message));
  }, []);

  function startLevel(level: LevelKey) {
    setActiveLevel(level);
    setResult(null);
    setView("playing");
  }

  function handleDone(gameState: {
    score: number; maxStreak: number;
    answers: GameResult["answers"];
  }) {
    const levelRule = data!.blueprint.level_rules[activeLevel];
    const passMark = levelRule.score_tiers[1]?.min ?? 0;
    if (gameState.score >= passMark) {
      if (activeLevel === "starter") localStorage.setItem(LS_KEY_STARTER, "1");
      if (activeLevel === "build_up") localStorage.setItem(LS_KEY_BUILDUP, "1");
    }
    setResult({ score: gameState.score, maxStreak: gameState.maxStreak, answers: gameState.answers });
    setView("results");
  }

  // ── Results view ──
  if (view === "results" && result && data) {
    const levelRule = data.blueprint.level_rules[activeLevel];
    return (
      <SpeedDrillEndScreen
        score={result.score}
        maxScore={levelRule.max_score}
        streak={0}
        maxStreak={result.maxStreak}
        answers={result.answers}
        levelRule={levelRule}
        levelKey={activeLevel}
        onRetry={() => startLevel(activeLevel)}
        onBackModes={() => setView("modes")}
        onBackHub={onBackHub}
        onNext={
          activeLevel === "starter" ? () => startLevel("build_up")
          : activeLevel === "build_up" ? () => startLevel("challenge")
          : undefined
        }
      />
    );
  }

  // ── Playing view ──
  if (view === "playing" && data) {
    const items = data.blueprint.items_by_level[activeLevel];
    const levelRule = data.blueprint.level_rules[activeLevel];
    const scoreRule = data.blueprint.scoring_rule;
    return (
      <SpeedDrillGame
        items={items}
        levelRule={levelRule}
        scoreRule={scoreRule}
        levelKey={activeLevel}
        onDone={handleDone}
        onBack={() => setView("modes")}
      />
    );
  }

  // ── Mode selector ──
  return (
    <div style={{
      minHeight: "100vh", background: "#0f172a",
      fontFamily: "var(--font-inter), Inter, sans-serif",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
        borderBottom: `1px solid ${SD.surfaceAlt}`,
        padding: "24px 24px 20px",
      }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <button onClick={onBackHub} style={{
              background: "transparent", border: `1px solid ${SD.borderAlt}`,
              color: SD.textMuted, borderRadius: 8, padding: "5px 12px",
              fontSize: 13, cursor: "pointer", fontWeight: 600,
            }}>
              ← Hub
            </button>
            <span style={{ color: "#334155" }}>›</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: SD.textMuted }}>Speed Drill</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, fontSize: 28,
              background: "linear-gradient(135deg, #6366f1, #a855f7)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 20px #6366f160",
            }}>⚡</div>
            <div>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: "#f1f5f9" }}>
                Speed Drill — Unit 1
              </h1>
              <p style={{ margin: 0, fontSize: 14, color: SD.textMuted, fontWeight: 600 }}>
                {data ? `${data.metadata.grammar_point} · ${data.metadata.subtitle_vi}` : "Simple Present · Thì hiện tại đơn"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "28px 20px" }}>
        {loadErr ? (
          <div style={{
            background: "#450a0a", borderRadius: 14, padding: 24,
            border: "1px solid #ef4444", color: "#fca5a5", textAlign: "center",
          }}>
            <p style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700 }}>⚠ Lỗi tải dữ liệu</p>
            <p style={{ margin: 0, fontSize: 13 }}>{loadErr}</p>
          </div>
        ) : !data ? (
          <LoadingSkeleton />
        ) : (
          <>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: "#475569", fontWeight: 600, textAlign: "center" }}>
              Chọn cấp độ luyện tập — 10 câu/vòng
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {(["starter", "build_up", "challenge"] as LevelKey[]).map(key => {
                const unlocked =
                  key === "starter" ? true
                  : key === "build_up" ? starterPassed
                  : buildUpPassed;

                return (
                  <ModeCard
                    key={key}
                    levelKey={key}
                    meta={MODE_META[key]}
                    rule={data.blueprint.level_rules[key]}
                    onClick={() => startLevel(key)}
                    unlocked={unlocked}
                  />
                );
              })}
            </div>

            {/* Keyboard hint */}
            <p style={{ textAlign: "center", color: "#334155", fontSize: 12, marginTop: 24 }}>
              💡 Trong lúc chơi: phím <kbd style={{ background: "#1e293b", border: `1px solid ${SD.borderAlt}`, borderRadius: 4, padding: "1px 6px", color: SD.textSecondary }}>1</kbd>
              {" "}<kbd style={{ background: "#1e293b", border: `1px solid ${SD.borderAlt}`, borderRadius: 4, padding: "1px 6px", color: SD.textSecondary }}>2</kbd>
              {" "}<kbd style={{ background: "#1e293b", border: `1px solid ${SD.borderAlt}`, borderRadius: 4, padding: "1px 6px", color: SD.textSecondary }}>3</kbd>
              {" "}<kbd style={{ background: "#1e293b", border: `1px solid ${SD.borderAlt}`, borderRadius: 4, padding: "1px 6px", color: SD.textSecondary }}>4</kbd>
              {" "}để chọn đáp án · <kbd style={{ background: "#1e293b", border: `1px solid ${SD.borderAlt}`, borderRadius: 4, padding: "1px 6px", color: SD.textSecondary }}>Space</kbd> để tiếp
            </p>
          </>
        )}
      </div>
    </div>
  );
}
