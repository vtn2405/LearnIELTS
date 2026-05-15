"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const SpeedDrillModule = dynamic(
  () => import("../../components/exercises/SpeedDrillModule"),
  { ssr: false }
);

// ─── Types ──────────────────────────────────────────────────────────────────

interface ModeCard {
  id: string;
  icon: string;
  tag: string;
  tagColor: string;
  title: string;
  description: string;
  accent: string;
  iconBg: string;
}

// ─── Data ───────────────────────────────────────────────────────────────────

const RECOMMENDED_DRILL = {
  unit: "Simple Present + Articles",
  reason: "Bạn sai bài này 3 lần ở Error mode gần đây. Nắm vững bài này rất quan trọng cho mục tiêu hiện tại.",
  questionsTotal: 12,
  questionsDone: 8,
  xp: 450,
  streak: 5,
};

const MODE_CARDS: ModeCard[] = [
  {
    id: "speed-drill",
    icon: "⚡",
    tag: "PHẢN XẠ",
    tagColor: "#0369a1",
    title: "Speed Drill",
    description: "Luyện tập nhanh với giới hạn thời gian — rèn phản xạ ngữ pháp tức thì.",
    accent: "#0ea5e9",
    iconBg: "#e0f2fe",
  },
  {
    id: "error-hunter",
    icon: "🔍",
    tag: "TÌM LỖI",
    tagColor: "#b45309",
    title: "Error Hunter",
    description: "Tìm và sửa lỗi ngữ pháp ẩn trong câu — mài sắc khả năng phát hiện lỗi.",
    accent: "#f59e0b",
    iconBg: "#fef3c7",
  },
  {
    id: "pattern-builder",
    icon: "🧱",
    tag: "CẤU TRÚC",
    tagColor: "#4338ca",
    title: "Pattern Builder",
    description: "Xây dựng câu theo cấu trúc cho sẵn — củng cố mẫu câu IELTS học thuật.",
    accent: "#6366f1",
    iconBg: "#ede9fe",
  },
  {
    id: "context-challenge",
    icon: "🌐",
    tag: "HỖN HỢP",
    tagColor: "#065f46",
    title: "Context Challenge",
    description: "Điền từ trong ngữ cảnh thực — Essay, Graph, Discussion, Story.",
    accent: "#10b981",
    iconBg: "#d1fae5",
  },
  {
    id: "sentence-rewrite",
    icon: "✏️",
    tag: "BIẾN ĐỔI",
    tagColor: "#7c3aed",
    title: "Sentence Rewrite",
    description: "Viết lại câu theo yêu cầu — luyện paraphrase và diễn đạt đa dạng.",
    accent: "#8b5cf6",
    iconBg: "#ede9fe",
  },
];

const ACCURACY_DATA = [
  { label: "Tenses", value: 92, color: "#10b981" },
  { label: "Articles", value: 84, color: "#0ea5e9" },
  { label: "Conditionals", value: 56, color: "#ef4444" },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function Tag({ label, color }: { label: string; color: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 9px",
        borderRadius: 9999,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.1em",
        background: `${color}18`,
        color: color,
        border: `1px solid ${color}30`,
        lineHeight: 1.6,
      }}
    >
      {label}
    </span>
  );
}

function ProgressBar({
  value,
  color,
  height = 6,
}: {
  value: number;
  color: string;
  height?: number;
}) {
  return (
    <div
      style={{
        width: "100%",
        height,
        borderRadius: 9999,
        background: "#f1f5f9",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${value}%`,
          background: color,
          borderRadius: 9999,
          transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
        }}
      />
    </div>
  );
}

function LaunchButton({
  label = "Launch →",
  primary = false,
  color = "#194a6d",
}: {
  label?: string;
  primary?: boolean;
  color?: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: primary ? "10px 22px" : "7px 16px",
        borderRadius: 10,
        border: primary ? "none" : `1.5px solid ${color}30`,
        background: primary
          ? hovered
            ? "#0d6b55"
            : "#006b5f"
          : hovered
          ? `${color}10`
          : "transparent",
        color: primary ? "#fff" : color,
        fontSize: primary ? 14 : 13,
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.15s ease",
        letterSpacing: "0.01em",
        boxShadow: primary && hovered ? "0 4px 14px rgba(0,107,95,0.3)" : "none",
      }}
    >
      {label}
    </button>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ExercisesPage() {
  const { questionsTotal, questionsDone, xp, streak } = RECOMMENDED_DRILL;
  const drillProgress = Math.round((questionsDone / questionsTotal) * 100);
  const [showSpeedDrill, setShowSpeedDrill] = useState(false);
  const router = useRouter();

  // Fullscreen overlay for Speed Drill
  if (showSpeedDrill) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 1000, overflowY: "auto" }}>
        <SpeedDrillModule unitId={1} onBackHub={() => setShowSpeedDrill(false)} />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        paddingBottom: 80,
      }}
    >
      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "36px 24px 0",
        }}
      >
        {/* ══════════════════════════════════════════════════════════════
            HERO SECTION
        ══════════════════════════════════════════════════════════════ */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: 16,
            padding: "28px 32px",
            boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
            border: "1px solid #e2e8f0",
            marginBottom: 20,
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 24,
            alignItems: "start",
          }}
        >
          {/* Left: badge, title, subtitle, CTA */}
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <Tag label="AUTHORITY MODE" color="#0369a1" />
              <Tag label="LEVEL: STARTER" color="#7c3aed" />
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: 26,
                fontWeight: 800,
                color: "#1e3a5f",
                lineHeight: 1.25,
                letterSpacing: "-0.02em",
              }}
            >
              Focus today:{" "}
              <span style={{ color: "#006b5f" }}>
                {RECOMMENDED_DRILL.unit}
              </span>
            </h1>

            <div
              style={{
                marginTop: 10,
                padding: "9px 14px",
                background: "#f0fdf4",
                borderLeft: "3px solid #10b981",
                borderRadius: "0 8px 8px 0",
                maxWidth: 480,
              }}
            >
              <p style={{ margin: 0, fontSize: 13, color: "#374151", lineHeight: 1.55 }}>
                <em>{RECOMMENDED_DRILL.reason}</em>
              </p>
            </div>

            <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <LaunchButton
                label="Bắt đầu luyện ngay (Start) ▶"
                primary
              />
              <div style={{ display: "flex", gap: 20 }}>
                <StatChip label={`+${xp} XP`} color="#f59e0b" />
                <StatChip label={`Streak ${streak}D`} color="#ef4444" />
              </div>
            </div>
          </div>

          {/* Right: progress panel */}
          <div
            style={{
              background: "#f8fafc",
              borderRadius: 12,
              padding: "16px 20px",
              border: "1px solid #e2e8f0",
              minWidth: 180,
              textAlign: "center",
            }}
          >
            <p style={{ margin: "0 0 4px", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#94a3b8", textTransform: "uppercase" }}>
              Daily Drill Progress
            </p>
            <p style={{ margin: "0 0 10px", fontSize: 28, fontWeight: 800, color: "#1e3a5f" }}>
              {questionsDone}
              <span style={{ fontSize: 15, fontWeight: 600, color: "#94a3b8" }}>
                /{questionsTotal}
              </span>
            </p>
            <ProgressBar value={drillProgress} color="#006b5f" height={7} />
            <p style={{ margin: "6px 0 0", fontSize: 12, color: "#64748b" }}>
              Questions
            </p>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            RECOMMENDED STRIP
        ══════════════════════════════════════════════════════════════ */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
            marginBottom: 20,
          }}
        >
          <RecommendedCard
            icon="▶"
            iconBg="#e0f2fe"
            iconColor="#0369a1"
            label="Tiếp tục bài hôm nay"
            sublabel="Simple Present · 8/12 câu"
          />
          <RecommendedCard
            icon="⚠"
            iconBg="#fee2e2"
            iconColor="#dc2626"
            label="Sửa lỗi tái diễn"
            sublabel="Articles · 3 lỗi lặp lại tuần này"
            isWarning
          />
        </div>

        {/* ══════════════════════════════════════════════════════════════
            CUSTOM MODES GRID  (3 + 2)
        ══════════════════════════════════════════════════════════════ */}
        <SectionTitle label="Chế độ luyện tập" />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 14,
            marginBottom: 24,
          }}
        >
          {MODE_CARDS.slice(0, 3).map((card) => (
            <ModeCardComponent
              key={card.id}
              card={card}
              onClick={
                card.id === "speed-drill"
                  ? () => router.push("/exercises/speed-drill")
                  : card.id === "error-hunter"
                  ? () => router.push("/exercises/error-hunter")
                  : card.id === "pattern-builder"
                  ? () => router.push("/exercises/pattern-builder")
                  : undefined
              }
            />
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════
            WEAK POINT KILLER  (highlight block)
        ══════════════════════════════════════════════════════════════ */}
        <SectionTitle label="Điểm yếu cần khắc phục" />

        <div
          style={{
            background: "#fff5f5",
            border: "1px solid #fecaca",
            borderLeft: "4px solid #dc2626",
            borderRadius: 14,
            padding: "22px 26px",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
              <Tag label="ADAPTIVE" color="#dc2626" />
              <Tag label="AI Phân tích điểm yếu" color="#7c3aed" />
            </div>
            <h2 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 800, color: "#991b1b" }}>
              Weak Point Killer 🎯 Điểm yếu
            </h2>
            <p style={{ margin: "0 0 14px", fontSize: 13, color: "#4b5563", lineHeight: 1.6 }}>
              Hệ thống phát hiện{" "}
              <strong style={{ color: "#dc2626" }}>Relative Clauses (Mệnh đề quan hệ)</strong>{" "}
              là điểm yếu đặc biệt. Chỉ đúng 15% trong 5 lần luyện gần nhất.
            </p>
            <LaunchButton label="Fix my weakness 🔥" primary color="#dc2626" />
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#dc2626", textTransform: "uppercase" }}>
              Failure Rate
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 40, fontWeight: 900, color: "#dc2626", lineHeight: 1 }}>
              15%
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94a3b8" }}>
              Target: 70%
            </p>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            CONTEXT & REWRITE CARDS
        ══════════════════════════════════════════════════════════════ */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
            marginBottom: 24,
          }}
        >
          <ContextCard
            icon="🌐"
            tag="HỖN HỢP"
            tagColor="#065f46"
            title="Context Challenge (Hỗn hợp)"
            description="Luyện với Daily Mix (Essay, Graph, Discussion, Story) — ngữ cảnh thực tế."
            sublabel="GRAMMAR IN CONTEXT"
            sublabelColor="#065f46"
          />
          <ContextCard
            icon="✏️"
            tag="CHALLENGE"
            tagColor="#7c3aed"
            title="Sentence Rewrite (Biến đổi)"
            description="Viết lại câu theo Paraphrase — luyện diễn đạt học thuật đa dạng hơn."
            sublabel="ADVANCED CONTROL"
            sublabelColor="#7c3aed"
          />
        </div>

        {/* ══════════════════════════════════════════════════════════════
            ANALYTICS FOOTER
        ══════════════════════════════════════════════════════════════ */}
        <SectionTitle label="Phân tích luyện tập" />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 14,
          }}
        >
          {/* Accuracy breakdown */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: 12,
              padding: "18px 20px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            }}
          >
            <p style={{ margin: "0 0 12px", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#94a3b8", textTransform: "uppercase" }}>
              Grammar Accuracy (7 ngày)
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {ACCURACY_DATA.map((item) => (
                <div key={item.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{item.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: item.color }}>{item.value}%</span>
                  </div>
                  <ProgressBar value={item.value} color={item.color} height={5} />
                </div>
              ))}
            </div>
          </div>

          {/* Speed trend */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: 12,
              padding: "18px 20px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            }}
          >
            <p style={{ margin: "0 0 4px", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#94a3b8", textTransform: "uppercase" }}>
              Speed Trend
            </p>
            <p style={{ margin: "0 0 14px", fontSize: 24, fontWeight: 800, color: "#1e3a5f" }}>
              Faster by 12%
            </p>
            <SpeedChart />
          </div>

          {/* Weakest area */}
          <div
            style={{
              background: "#fff5f5",
              borderRadius: 12,
              padding: "18px 20px",
              border: "1px solid #fecaca",
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            }}
          >
            <p style={{ margin: "0 0 4px", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#dc2626", textTransform: "uppercase" }}>
              Weakest Area
            </p>
            <p style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: "#991b1b" }}>
              Relative Clauses
            </p>
            <p style={{ margin: "0 0 14px", fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>
              Bạn thường quên dùng &ldquo;which&rdquo; hoặc &ldquo;that&rdquo; trong mệnh đề quan hệ phức tạp.
            </p>
            <button
              style={{
                padding: "7px 14px",
                borderRadius: 8,
                background: "#dc2626",
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                letterSpacing: "0.02em",
              }}
            >
              Fix Now →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Helper components ────────────────────────────────────────────────────────

function StatChip({ label, color }: { label: string; color: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 13,
        fontWeight: 700,
        color,
      }}
    >
      {label}
    </span>
  );
}

function SectionTitle({ label }: { label: string }) {
  return (
    <p
      style={{
        margin: "0 0 12px",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "#94a3b8",
      }}
    >
      {label}
    </p>
  );
}

function RecommendedCard({
  icon,
  iconBg,
  iconColor,
  label,
  sublabel,
  isWarning = false,
}: {
  icon: string;
  iconBg: string;
  iconColor: string;
  label: string;
  sublabel: string;
  isWarning?: boolean;
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 12,
        padding: "16px 18px",
        border: isWarning ? "1px solid #fecaca" : "1px solid #e2e8f0",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        cursor: "pointer",
        transition: "box-shadow 0.15s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            color: iconColor,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1e3a5f" }}>{label}</p>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748b" }}>{sublabel}</p>
        </div>
      </div>
      <span style={{ fontSize: 16, color: "#94a3b8" }}>›</span>
    </div>
  );
}

function ModeCardComponent({ card, onClick }: { card: ModeCard; onClick?: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        background: "#ffffff",
        borderRadius: 14,
        padding: "20px 18px",
        border: `1px solid ${hovered ? card.accent + "40" : "#e2e8f0"}`,
        boxShadow: hovered
          ? `0 4px 18px ${card.accent}20`
          : "0 1px 4px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        cursor: "pointer",
        transition: "all 0.18s ease",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
      }}
    >
      {/* Icon + tag row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            background: card.iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
          }}
        >
          {card.icon}
        </div>
        <Tag label={card.tag} color={card.tagColor} />
      </div>

      {/* Title */}
      <h3
        style={{
          margin: 0,
          fontSize: 15,
          fontWeight: 700,
          color: "#1e3a5f",
          lineHeight: 1.3,
        }}
      >
        {card.title}
      </h3>

      {/* Description */}
      <p style={{ margin: 0, fontSize: 12.5, color: "#64748b", lineHeight: 1.55, flex: 1 }}>
        {card.description}
      </p>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 8,
          borderTop: "1px solid #f1f5f9",
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em" }}>
          No Review
        </span>
        <button
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: card.accent,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            letterSpacing: "0.01em",
            padding: 0,
          }}
        >
          Launch →
        </button>
      </div>
    </div>
  );
}

function ContextCard({
  icon,
  tag,
  tagColor,
  title,
  description,
  sublabel,
  sublabelColor,
}: {
  icon: string;
  tag: string;
  tagColor: string;
  title: string;
  description: string;
  sublabel: string;
  sublabelColor: string;
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 14,
        padding: "20px 22px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <Tag label={tag} color={tagColor} />
      </div>
      <div>
        <p
          style={{
            margin: "0 0 2px",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: sublabelColor,
            textTransform: "uppercase",
          }}
        >
          {sublabel}
        </p>
        <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: "#1e3a5f" }}>
          {title}
        </h3>
        <p style={{ margin: 0, fontSize: 12.5, color: "#64748b", lineHeight: 1.55 }}>
          {description}
        </p>
      </div>
      <div
        style={{
          marginTop: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em" }}>
          Advanced Control
        </span>
        <button
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: tagColor,
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          Launch →
        </button>
      </div>
    </div>
  );
}

function SpeedChart() {
  const bars = [3, 5, 4, 7, 6, 8, 9];
  const max = Math.max(...bars);

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 48 }}>
      {bars.map((val, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${(val / max) * 100}%`,
            borderRadius: "3px 3px 0 0",
            background:
              i === bars.length - 1
                ? "#006b5f"
                : i === bars.length - 2
                ? "#34d39980"
                : "#e2e8f0",
            transition: "height 0.4s ease",
          }}
        />
      ))}
    </div>
  );
}
