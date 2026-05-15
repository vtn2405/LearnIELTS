"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

// ─── Unit metadata ───────────────────────────────────────────────────────────

const UNITS = [
  { unit: 1, title: "Simple Present", subtitle: "Thì hiện tại đơn", band: "4.0–6.5" },
  { unit: 2, title: "Present Continuous", subtitle: "Thì hiện tại tiếp diễn", band: "4.0–5.5" },
  { unit: 3, title: "Simple Past", subtitle: "Thì quá khứ đơn", band: "4.0–5.5" },
  { unit: 4, title: "Past Continuous", subtitle: "Thì quá khứ tiếp diễn", band: "4.0–5.5" },
  { unit: 5, title: "Present Perfect", subtitle: "Thì hiện tại hoàn thành", band: "4.5–6.0" },
  { unit: 6, title: "Past Perfect", subtitle: "Thì quá khứ hoàn thành", band: "4.5–6.0" },
  { unit: 7, title: "Future (will / going to)", subtitle: "Thì tương lai", band: "4.0–5.5" },
  { unit: 8, title: "Modal: can / could", subtitle: "Modal: can / could", band: "4.0–5.5" },
  { unit: 9, title: "Modal: may / might", subtitle: "Modal: may / might", band: "4.5–6.0" },
  { unit: 10, title: "Passive Voice", subtitle: "Câu bị động", band: "5.0–6.5" },
  { unit: 11, title: "Conditional Type 1", subtitle: "Câu điều kiện loại 1", band: "4.5–6.0" },
  { unit: 12, title: "Conditional Type 2", subtitle: "Câu điều kiện loại 2", band: "5.0–6.5" },
  { unit: 13, title: "Conditional Type 3", subtitle: "Câu điều kiện loại 3", band: "5.5–6.5" },
  { unit: 14, title: "Relative Clauses", subtitle: "Mệnh đề quan hệ", band: "5.0–6.5" },
  { unit: 15, title: "Reported Speech", subtitle: "Câu tường thuật", band: "5.0–6.5" },
  { unit: 16, title: "Cleft Sentences", subtitle: "Câu chẻ", band: "5.5–6.5" },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SpeedDrillUnitsPage() {
  const router = useRouter();
  const [hoveredUnit, setHoveredUnit] = useState<number | null>(null);
  const [expandingUnit, setExpandingUnit] = useState<number | null>(null);
  const [expandRect, setExpandRect] = useState<DOMRect | null>(null);
  const cardRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  const handleUnitClick = useCallback((unitNum: number) => {
    const el = cardRefs.current[unitNum];
    if (!el) {
      router.push(`/exercises/speed-drill/${unitNum}`);
      return;
    }
    const rect = el.getBoundingClientRect();
    setExpandRect(rect);
    setExpandingUnit(unitNum);

    // Navigate after animation completes
    setTimeout(() => {
      router.push(`/exercises/speed-drill/${unitNum}`);
    }, 450);
  }, [router]);

  return (
    <div
      data-sd-route
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        fontFamily: "var(--font-inter), Inter, sans-serif",
        animation: "sdPageFadeIn 0.4s ease-out",
      }}
    >
      {/* Hero Expand Overlay */}
      {expandingUnit !== null && expandRect && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: expandRect.left,
              top: expandRect.top,
              width: expandRect.width,
              height: expandRect.height,
              background: "linear-gradient(135deg, #1e293b, #0f172a)",
              border: "1px solid #6366f1",
              borderRadius: 14,
              animation: "sdHeroExpand 0.45s cubic-bezier(0.4, 0, 0.2, 1) forwards",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {/* Content inside expanding card */}
            <div style={{ animation: "sdHeroContentFade 0.45s ease forwards", opacity: 0 }}>
              <div style={{
                fontSize: 40,
                marginBottom: 12,
                textAlign: "center",
              }}>⚡</div>
              <p style={{
                color: "#a5b4fc",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textAlign: "center",
                margin: 0,
              }}>
                UNIT {expandingUnit}
              </p>
              <p style={{
                color: "#f1f5f9",
                fontSize: 20,
                fontWeight: 800,
                textAlign: "center",
                margin: "8px 0 0",
              }}>
                {UNITS.find(u => u.unit === expandingUnit)?.title}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
          borderBottom: "1px solid #1e293b",
          padding: "24px 24px 20px",
        }}
      >
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <button
              onClick={() => router.push("/exercises")}
              style={{
                background: "transparent",
                border: "1px solid #334155",
                color: "#64748b",
                borderRadius: 8,
                padding: "5px 12px",
                fontSize: 13,
                cursor: "pointer",
                fontWeight: 600,
                transition: "all 0.15s ease",
              }}
            >
              ← Exercises
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                fontSize: 28,
                background: "linear-gradient(135deg, #6366f1, #a855f7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 20px #6366f160",
              }}
            >
              ⚡
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: "#f1f5f9" }}>
                Speed Drill
              </h1>
              <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b", fontWeight: 500 }}>
                Chọn unit để luyện tập — 30 câu/unit (3 cấp độ × 10 câu)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Units Grid — 4 columns */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "28px 20px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 14,
          }}
        >
          {UNITS.map((u, idx) => {
            const isHovered = hoveredUnit === u.unit;
            const isExpanding = expandingUnit === u.unit;

            return (
              <button
                key={u.unit}
                ref={(el) => { cardRefs.current[u.unit] = el; }}
                onClick={() => handleUnitClick(u.unit)}
                onMouseEnter={() => setHoveredUnit(u.unit)}
                onMouseLeave={() => setHoveredUnit(null)}
                style={{
                  background: isHovered ? "#1e293b" : "#0f172a",
                  border: `1px solid ${isHovered ? "#6366f1" : "#1e293b"}`,
                  borderRadius: 14,
                  padding: "18px 20px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  transform: isHovered ? "translateY(-3px) scale(1.02)" : "none",
                  boxShadow: isHovered ? "0 12px 32px #6366f125" : "none",
                  opacity: isExpanding ? 0 : 1,
                  animation: `sdCardStagger 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${idx * 0.04}s both`,
                }}
              >
                {/* Unit number badge */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                      padding: "3px 8px",
                      borderRadius: 6,
                      background: "#6366f120",
                      color: "#a5b4fc",
                    }}
                  >
                    UNIT {u.unit}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#64748b",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {u.band}
                  </span>
                </div>

                {/* Title */}
                <h3
                  style={{
                    margin: "0 0 4px",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#e2e8f0",
                    lineHeight: 1.3,
                  }}
                >
                  {u.title}
                </h3>

                {/* Subtitle */}
                <p
                  style={{
                    margin: 0,
                    fontSize: 11,
                    color: "#64748b",
                    fontWeight: 500,
                  }}
                >
                  {u.subtitle}
                </p>

                {/* Footer */}
                <div
                  style={{
                    marginTop: 12,
                    paddingTop: 10,
                    borderTop: "1px solid #1e293b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ fontSize: 10, color: "#475569", fontWeight: 600 }}>
                    30 câu · 3 levels
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: isHovered ? "#a5b4fc" : "#475569",
                      transition: "color 0.2s",
                    }}
                  >
                    Play →
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes sdPageFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes sdCardStagger {
          from { opacity: 0; transform: translateY(16px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes sdHeroExpand {
          0% { border-radius: 14px; }
          100% {
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            border-radius: 0;
            border-color: transparent;
          }
        }
        @keyframes sdHeroContentFade {
          0% { opacity: 0; transform: scale(0.8); }
          50% { opacity: 0; }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
