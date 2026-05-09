"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CardStatus = "unlocked" | "preview" | "locked";
export type LevelStatus = "done" | "active" | "available" | "locked";

export interface LevelTrack {
  starter: LevelStatus;
  buildUp: LevelStatus;
  challenge: LevelStatus;
  master: LevelStatus;
}

export interface GrammarModule {
  unitNumber: number;
  unitId: string;
  grammarName: string;
  grammarFormula: string;
  band: number;
  communicationContexts: string[];
  topics: string[];
  status: CardStatus;
  isCurrentUnit: boolean;
  levelTrack: LevelTrack;
  lockedReason?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCtaLabel(track: LevelTrack, status: CardStatus): string {
  if (status === "preview") return "Try Guided Fill";
  if (track.master === "active") return "Take Master Test";
  if (track.challenge === "active") return "Try Challenge";
  if (track.buildUp === "active") return "Continue Build Up";
  if (track.starter === "active" || track.starter === "available") return "Starter — Guided Fill";
  if (track.master === "done") return "Review Patterns";
  return "Start";
}

type LevelKey = "starter" | "buildUp" | "challenge" | "master";
const LEVEL_LABELS: Record<LevelKey, string> = {
  starter: "Starter",
  buildUp: "Build Up",
  challenge: "Challenge",
  master: "Master",
};

// ─── Level Dot ───────────────────────────────────────────────────────────────

function LevelDot({ status, label }: { status: LevelStatus; label: string }) {
  const cfg: Record<LevelStatus, { ring: string; fill: string; text: string }> = {
    done:      { ring: "#0d9488", fill: "#0d9488", text: "#0d9488" },
    active:    { ring: "#f59e0b", fill: "#f59e0b", text: "#b45309" },
    available: { ring: "#c8d0d9", fill: "transparent", text: "#a0adb8" },
    locked:    { ring: "#e0e5ea", fill: "transparent", text: "#cdd4db" },
  };
  const c = cfg[status];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 48 }}>
      <div style={{
        width: 8, height: 8, borderRadius: "50%",
        background: c.fill, border: `1.5px solid ${c.ring}`,
        boxShadow: status === "active" ? `0 0 0 3px ${c.fill}25` : "none",
      }} />
      <span style={{
        fontSize: 9, fontWeight: status === "active" ? 700 : 500,
        color: c.text, letterSpacing: "0.04em", textAlign: "center",
        textTransform: "uppercase",
      }}>
        {label}
      </span>
    </div>
  );
}

// ─── SVG Icons ───────────────────────────────────────────────────────────────

function LockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── GrammarCard ─────────────────────────────────────────────────────────────

export function GrammarCard({
  module,
  onCta,
  featured = false,
}: {
  module: GrammarModule;
  onCta?: (unitId: string) => void;
  featured?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const isLocked  = module.status === "locked";
  const isPreview = module.status === "preview";

  const ctaLabel = getCtaLabel(module.levelTrack, module.status);
  const showCta  = !isLocked;

  const levelKeys: LevelKey[] = ["starter", "buildUp", "challenge", "master"];

  // determine dominant active level for CTA color
  const isChallengePlus =
    module.levelTrack.master  === "active" ||
    module.levelTrack.challenge === "active";

  const borderColor = isLocked
    ? "#ebebeb"
    : isPreview
    ? hovered ? "#f59e0b70" : "#f59e0b30"
    : featured
    ? hovered ? "#194a6d40" : "#194a6d22"
    : hovered ? "rgba(25,74,109,0.2)" : "#e4e8ed";

  return (
    <article
      id={`grammar-card-${module.unitId}`}
      onMouseEnter={() => !isLocked && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 8,
        padding: featured ? "20px 22px" : "14px 16px",
        background: isLocked ? "#f9fafb" : "#ffffff",
        border: `1px solid ${borderColor}`,
        borderLeft: featured && !isLocked ? "3px solid #0d9488" : undefined,
        opacity: isLocked ? 0.5 : 1,
        cursor: isLocked ? "not-allowed" : "default",
        boxShadow: !isLocked && hovered ? "0 4px 16px rgba(0,0,0,0.07)" : "0 1px 3px rgba(0,0,0,0.03)",
        transform: !isLocked && hovered ? "translateY(-1px)" : "translateY(0)",
        transition: "all 0.16s ease",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {/* ── Row 1: Unit label + band + lock ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
            textTransform: "uppercase", color: isLocked ? "#b8c0c8" : "#8594a3",
          }}>
            Unit {module.unitNumber}
          </span>
          {module.isCurrentUnit && !isLocked && (
            <span style={{ fontSize: 10, fontWeight: 600, color: "#0d9488" }}>← here</span>
          )}
          {isPreview && (
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
              padding: "1px 6px", borderRadius: 3,
              background: "rgba(245,158,11,0.1)", color: "#b45309",
              border: "1px solid rgba(245,158,11,0.22)",
            }}>Preview</span>
          )}
        </div>
        {isLocked
          ? <span style={{ color: "#c4cdd6" }}><LockIcon /></span>
          : <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
              padding: "1px 6px", borderRadius: 3,
              background: "rgba(13,148,136,0.08)", color: "#0d9488",
              border: "1px solid rgba(13,148,136,0.18)",
            }}>
              Band {module.band.toFixed(1)}+
            </span>
        }
      </div>

      {/* ── Row 2: Grammar name ── */}
      <h3 style={{
        margin: 0,
        fontSize: featured ? 16 : 14,
        fontWeight: 700,
        color: isLocked ? "#9ca3af" : "#1a2f3f",
        lineHeight: 1.3,
        fontFamily: "var(--font-plus-jakarta), 'Plus Jakarta Sans', sans-serif",
        letterSpacing: "-0.01em",
      }}>
        {module.grammarName}
      </h3>

      {/* ── Row 3: Formula ── */}
      <div style={{
        padding: "5px 10px", borderRadius: 5, display: "inline-block",
        background: isLocked ? "#f5f5f5" : "rgba(25,74,109,0.04)",
        border: isLocked ? "1px solid #f0f0f0" : "1px solid rgba(25,74,109,0.08)",
      }}>
        <code style={{
          fontFamily: "var(--font-jetbrains-mono), 'JetBrains Mono', monospace",
          fontSize: 11, fontWeight: 500,
          color: isLocked ? "#9ca3af" : "#2d4a5e",
        }}>
          {module.grammarFormula}
        </code>
      </div>

      {/* ── Row 4: Communication contexts ── */}
      {!isLocked && module.communicationContexts.length > 0 && (
        <div>
          <p style={{ margin: "0 0 3px", fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#a0adb8" }}>
            Used for
          </p>
          <p style={{ margin: 0, fontSize: 11, color: "#6b7a87", lineHeight: 1.55 }}>
            {module.communicationContexts.join(" · ")}
          </p>
        </div>
      )}

      {/* ── Row 5: Topic tags ── */}
      {!isLocked && module.topics.length > 0 && (
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {module.topics.map((t) => (
            <span key={t} style={{
              fontSize: 9, fontWeight: 600, letterSpacing: "0.05em",
              padding: "2px 7px", borderRadius: 3,
              background: "#f0f4f8", color: "#6b7a87",
              border: "1px solid #e4e8ed",
            }}>{t}</span>
          ))}
        </div>
      )}

      {/* ── Locked reason ── */}
      {isLocked && (
        <p style={{ margin: 0, fontSize: 11, color: "#a8b2bc", lineHeight: 1.5 }}>
          {module.lockedReason ?? `Complete an earlier unit first`}
        </p>
      )}

      {/* ── Divider + Level track + CTA ── */}
      {!isLocked && (
        <div style={{ borderTop: "1px solid #f0f3f6", paddingTop: 10, marginTop: 2 }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8 }}>
            {/* Level track */}
            <div style={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
              {levelKeys.map((key, i) => (
                <div key={key} style={{ display: "flex", alignItems: "center" }}>
                  <LevelDot status={module.levelTrack[key]} label={LEVEL_LABELS[key]} />
                  {i < levelKeys.length - 1 && (
                    <div style={{ width: 12, height: 1, background: "#e8ecef", marginTop: -6, marginLeft: -2, marginRight: -2 }} />
                  )}
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              id={`cta-btn-${module.unitId}`}
              onClick={() => onCta?.(module.unitId)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "6px 12px", borderRadius: 5, cursor: "pointer",
                fontSize: 11, fontWeight: 700, letterSpacing: "0.01em",
                whiteSpace: "nowrap", flexShrink: 0,
                transition: "all 0.15s ease",
                ...(isPreview
                  ? { border: "1.5px solid #f59e0b", background: hovered ? "rgba(245,158,11,0.08)" : "transparent", color: "#b45309" }
                  : isChallengePlus
                  ? { border: "none", background: hovered ? "#1e3a5f" : "#194a6d", color: "#fff" }
                  : module.levelTrack.master === "done"
                  ? { border: "1.5px solid #d1d9e0", background: "transparent", color: "#8594a3" }
                  : { border: "none", background: hovered ? "#0b7a70" : "#0d9488", color: "#fff" }
                ),
              }}
            >
              {ctaLabel}
              <ChevronRight />
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
