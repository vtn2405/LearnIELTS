"use client";

import { useMemo } from "react";
import {
  GrammarCard,
  type GrammarModule,
  type CardStatus,
  type LevelStatus,
  type LevelTrack,
} from "@/components/exercises/pattern-builder/GrammarCard";
import { AcademicProgress } from "@/components/exercises/pattern-builder/AcademicProgress";

// ─── Raw data type ────────────────────────────────────────────────────────────

interface RawModule {
  unitNumber: number;
  unitId: string;
  grammarName: string;
  grammarFormula: string;
  band: number;
  communicationContexts: string[];
  topics: string[];
}

// ─── Grammar data ─────────────────────────────────────────────────────────────

const GRAMMAR_MODULES: RawModule[] = [
  {
    unitNumber: 1, unitId: "unit-1-simple-present",
    grammarName: "Simple Present", grammarFormula: "subject + V (base form)",
    band: 4.0,
    communicationContexts: ["daily habits", "general facts", "routine statements"],
    topics: ["Daily Life", "Health", "Society"],
  },
  {
    unitNumber: 2, unitId: "unit-1-present-continuous",
    grammarName: "Present Continuous", grammarFormula: "am/is/are + V-ing",
    band: 4.0,
    communicationContexts: ["current trends", "temporary situations", "ongoing changes"],
    topics: ["Technology", "Society", "Urban Life"],
  },
  {
    unitNumber: 3, unitId: "unit-1-simple-past",
    grammarName: "Simple Past", grammarFormula: "subject + V-ed / irregular",
    band: 4.5,
    communicationContexts: ["historical events", "narrative sequence", "cause & effect"],
    topics: ["History", "Society", "Education"],
  },
  {
    unitNumber: 4, unitId: "unit-1-past-continuous",
    grammarName: "Past Continuous", grammarFormula: "was/were + V-ing",
    band: 4.5,
    communicationContexts: ["background context", "parallel actions", "interrupted events"],
    topics: ["Narrative", "Events", "Travel"],
  },
  {
    unitNumber: 5, unitId: "unit-2-present-perfect",
    grammarName: "Present Perfect", grammarFormula: "have/has + past participle",
    band: 5.0,
    communicationContexts: ["formal opinions", "trend explanation", "academic reporting"],
    topics: ["Environment", "Technology", "Education"],
  },
  {
    unitNumber: 6, unitId: "unit-2-past-perfect",
    grammarName: "Past Perfect", grammarFormula: "had + past participle",
    band: 5.5,
    communicationContexts: ["sequence before past", "cause and effect", "complex narrative"],
    topics: ["History", "Society", "Research"],
  },
  {
    unitNumber: 7, unitId: "unit-2-future",
    grammarName: "Future (will/going to)", grammarFormula: "will + V / be going to + V",
    band: 4.5,
    communicationContexts: ["predictions", "policy proposals", "plans & intentions"],
    topics: ["Technology", "Policy", "Environment"],
  },
  {
    unitNumber: 8, unitId: "unit-3-modal-ability",
    grammarName: "Modal — Ability", grammarFormula: "can / could / be able to + V",
    band: 5.0,
    communicationContexts: ["capacity claims", "policy discussion", "academic hedging"],
    topics: ["Policy", "Education", "Technology"],
  },
  {
    unitNumber: 9, unitId: "unit-3-modal-possibility",
    grammarName: "Modal — Possibility", grammarFormula: "may / might / could + V",
    band: 5.5,
    communicationContexts: ["hedged claims", "speculation", "academic caution"],
    topics: ["Research", "Climate", "Society"],
  },
  {
    unitNumber: 10, unitId: "unit-3-passive",
    grammarName: "Passive Voice", grammarFormula: "be + past participle",
    band: 5.5,
    communicationContexts: ["process description", "academic objectivity", "IELTS Task 1"],
    topics: ["Environment", "Industry", "Science"],
  },
  {
    unitNumber: 11, unitId: "unit-4-conditional-1",
    grammarName: "Conditional Type 1", grammarFormula: "if + present, will + V",
    band: 5.0,
    communicationContexts: ["realistic scenarios", "policy outcomes", "warnings"],
    topics: ["Policy", "Environment", "Health"],
  },
  {
    unitNumber: 12, unitId: "unit-4-conditional-2",
    grammarName: "Conditional Type 2", grammarFormula: "if + past, would + V",
    band: 6.0,
    communicationContexts: ["hypothetical situations", "argument building", "speculation"],
    topics: ["Society", "Politics", "Economics"],
  },
  {
    unitNumber: 13, unitId: "unit-4-conditional-3",
    grammarName: "Conditional Type 3", grammarFormula: "if + past perfect, would have + V3",
    band: 6.5,
    communicationContexts: ["past counter-factuals", "complex argumentation", "regret"],
    topics: ["History", "Philosophy", "Society"],
  },
  {
    unitNumber: 14, unitId: "unit-5-relative",
    grammarName: "Relative Clauses", grammarFormula: "noun + who/which/that + verb",
    band: 5.5,
    communicationContexts: ["precise description", "sentence embedding", "academic precision"],
    topics: ["Culture", "Science", "Politics"],
  },
  {
    unitNumber: 15, unitId: "unit-5-reported",
    grammarName: "Reported Speech", grammarFormula: "said (that) + backshifted clause",
    band: 6.0,
    communicationContexts: ["citing sources", "academic reporting", "speech summarisation"],
    topics: ["Research", "News", "Academic"],
  },
  {
    unitNumber: 16, unitId: "unit-5-cleft",
    grammarName: "Cleft Sentences", grammarFormula: "It is/was + noun + that/who + clause",
    band: 6.5,
    communicationContexts: ["emphasis & contrast", "formal argument", "high-level academic writing"],
    topics: ["Debate", "Policy", "Academic"],
  },
];

// ─── Demo config ──────────────────────────────────────────────────────────────
// In production: derive from userProgress fetched from /api/progress/units

const USER_CURRENT_UNIT_NUMBER = 10;

// ─── Derive level track ───────────────────────────────────────────────────────

function deriveLevelTrack(unitNumber: number, current: number): LevelTrack {
  const d = current - unitNumber; // how far behind current
  const done: LevelStatus    = "done";
  const active: LevelStatus  = "active";
  const avail: LevelStatus   = "available";
  const locked: LevelStatus  = "locked";

  if (d >= 3) return { starter: done,  buildUp: done,   challenge: done,   master: done };
  if (d === 2) return { starter: done,  buildUp: done,   challenge: done,   master: active };
  if (d === 1) return { starter: done,  buildUp: done,   challenge: active, master: locked };
  if (d === 0) return { starter: done,  buildUp: active, challenge: locked, master: locked };
  if (d === -1) return { starter: avail, buildUp: locked, challenge: locked, master: locked };
  return { starter: locked, buildUp: locked, challenge: locked, master: locked };
}

// ─── Derive full modules ───────────────────────────────────────────────────────

function deriveModules(raw: RawModule[], current: number): GrammarModule[] {
  return raw.map((m) => {
    const diff = current - m.unitNumber;
    let status: CardStatus = "locked";
    if (diff >= 0)       status = "unlocked";
    else if (diff === -1) status = "preview";

    const prev = raw.find((r) => r.unitNumber === m.unitNumber - 1);

    return {
      ...m,
      status,
      isCurrentUnit: m.unitNumber === current,
      levelTrack: deriveLevelTrack(m.unitNumber, current),
      lockedReason: prev ? `Complete "${prev.grammarName}" first` : "Complete earlier units first",
    };
  });
}

// ─── Static mock content ──────────────────────────────────────────────────────

const CURRENT_TOPIC_QUEUE = ["Environment", "Technology", "Education", "Policy", "Society"];

const SPEAKING_PROMPT = {
  timeSeconds: 15,
  instruction: "Use passive voice to describe an industrial process.",
  hint: "Try to use at least 2 passive constructions.",
  example: "e.g. \"Raw materials are transported to the factory, where they are processed\u2026\"",
};

const PATTERNS_TODAY = [
  "Carbon emissions are produced by industrial activity.",
  "Recycled materials are then processed and reused.",
  "Waste is collected twice a week by local councils.",
];

const WEAKNESS = {
  grammarName: "Present Perfect",
  accuracy: 45,
  tip: "Confusing 'have done' with 'did' in academic contexts.",
};

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      margin: "0 0 10px",
      fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
      textTransform: "uppercase", color: "#a0adb8",
    }}>
      {children}
    </p>
  );
}

// ─── Mic SVG (clean, no emoji) ────────────────────────────────────────────────

function MicIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="9" y="2" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M5 10a7 7 0 0 0 14 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="9" y1="21" x2="15" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PatternBuilderPage() {
  const modules = useMemo(() => deriveModules(GRAMMAR_MODULES, USER_CURRENT_UNIT_NUMBER), []);

  const currentModule   = modules.find((m) => m.isCurrentUnit)!;
  const previewModule   = modules.find((m) => m.status === "preview");
  const unlockedOthers  = modules.filter((m) => !m.isCurrentUnit && m.status === "unlocked");
  const lockedModules   = modules.filter((m) => m.status === "locked");
  const gridModules     = [...unlockedOthers, ...(previewModule ? [previewModule] : []), ...lockedModules];

  const totalUnits   = modules.length;
  const doneUnits    = modules.filter((m) => m.levelTrack.master === "done").length;
  const progressPct  = Math.round((doneUnits / totalUnits) * 100);

  function handleCta(unitId: string) {
    window.location.href = `/exercises/pattern-builder/${unitId}`;
  }

  return (
    <main
      id="pattern-builder-home"
      style={{
        minHeight: "100vh",
        background: "#f4f6f8",
        paddingBottom: 80,
        fontFamily: "var(--font-inter), Inter, sans-serif",
      }}
    >
      {/* ═══════════════════════════════════════
          PAGE HEADER
      ═══════════════════════════════════════ */}
      <div style={{
        borderBottom: "1px solid #e4e8ed",
        background: "#ffffff",
        padding: "22px 24px 20px",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "#a0adb8" }}>
            Exercise Hub › <span style={{ color: "#8594a3" }}>Pattern Builder</span>
          </p>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 style={{
                margin: 0, fontSize: 22, fontWeight: 700,
                color: "#1a2f3f", lineHeight: 1.2, letterSpacing: "-0.02em",
                fontFamily: "var(--font-plus-jakarta), 'Plus Jakarta Sans', sans-serif",
              }}>
                Pattern Builder
              </h1>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7a87" }}>
                Build academic sentences from grammar structures — topic by topic.
              </p>
            </div>
            <span style={{
              fontSize: 12, fontWeight: 600, color: "#0d9488",
              padding: "4px 10px", borderRadius: 5,
              background: "rgba(13,148,136,0.07)", border: "1px solid rgba(13,148,136,0.16)",
            }}>
              {USER_CURRENT_UNIT_NUMBER} / {totalUnits} units active
            </span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          BODY
      ═══════════════════════════════════════ */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px 0" }}>

        {/* ══════ 1. CURRENT FOCUS ══════ */}
        <section id="current-focus" style={{ marginBottom: 24 }}>
          <SectionLabel>Current Focus</SectionLabel>
          {currentModule && (
            <GrammarCard module={currentModule} onCta={handleCta} featured />
          )}
        </section>

        {/* ══════ 2. ADAPTIVE GUIDANCE ══════ */}
        <section id="adaptive-guidance" style={{ marginBottom: 24 }}>
          <SectionLabel>Adaptive Guidance</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>

            {/* Next recommended */}
            <div style={{
              borderRadius: 8, padding: "14px 16px",
              background: "#ffffff", border: "1px solid #e4e8ed",
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            }}>
              <p style={{ margin: "0 0 4px", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#0d9488" }}>
                Recommended Next
              </p>
              {previewModule ? (
                <>
                  <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, color: "#1a2f3f" }}>
                    {previewModule.grammarName}
                  </p>
                  <code style={{
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: 11, color: "#5a7080",
                  }}>
                    {previewModule.grammarFormula}
                  </code>
                  <p style={{ margin: "6px 0 10px", fontSize: 11, color: "#6b7a87", lineHeight: 1.5 }}>
                    {previewModule.communicationContexts[0]} · {previewModule.communicationContexts[1]}
                  </p>
                  <button
                    onClick={() => handleCta(previewModule.unitId)}
                    style={{
                      fontSize: 11, fontWeight: 700, padding: "6px 12px", borderRadius: 5,
                      border: "1.5px solid #f59e0b", background: "transparent", color: "#b45309",
                      cursor: "pointer",
                    }}>
                    Try Guided Fill →
                  </button>
                </>
              ) : (
                <p style={{ margin: 0, fontSize: 12, color: "#a0adb8" }}>All upcoming units locked.</p>
              )}
            </div>

            {/* Weakness focus */}
            <div style={{
              borderRadius: 8, padding: "14px 16px",
              background: "#fffbf5", border: "1px solid #fde9c3",
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            }}>
              <p style={{ margin: "0 0 4px", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#b45309" }}>
                Weakness Focus
              </p>
              <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700, color: "#1a2f3f" }}>{WEAKNESS.grammarName}</p>
              <p style={{ margin: "0 0 6px", fontSize: 11, color: "#8a7040", lineHeight: 1.5, fontStyle: "italic" }}>
                {WEAKNESS.tip}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ flex: 1, height: 4, borderRadius: 9999, background: "#fde9c3", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${WEAKNESS.accuracy}%`, background: "#f59e0b", borderRadius: 9999 }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#b45309" }}>{WEAKNESS.accuracy}%</span>
              </div>
              <button style={{
                fontSize: 11, fontWeight: 700, padding: "6px 12px", borderRadius: 5,
                border: "none", background: "#f59e0b", color: "#ffffff", cursor: "pointer",
              }}>
                Retry Structure →
              </button>
            </div>
          </div>
        </section>

        {/* ══════ 3. TOPIC ROTATION QUEUE ══════ */}
        <section id="topic-rotation" style={{ marginBottom: 24 }}>
          <SectionLabel>Topic Rotation Queue</SectionLabel>
          <div style={{
            borderRadius: 8, padding: "12px 16px",
            background: "#ffffff", border: "1px solid #e4e8ed",
            display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
          }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#a0adb8", flexShrink: 0 }}>
              Practice with:
            </span>
            {CURRENT_TOPIC_QUEUE.map((topic, i) => (
              <span key={topic} style={{
                fontSize: 11, fontWeight: 600,
                padding: "4px 10px", borderRadius: 20,
                background: i === 0 ? "rgba(13,148,136,0.1)" : "#f0f4f8",
                color: i === 0 ? "#0d9488" : "#6b7a87",
                border: i === 0 ? "1px solid rgba(13,148,136,0.25)" : "1px solid #e4e8ed",
                cursor: "pointer",
              }}>
                {i === 0 ? `${topic} ←` : topic}
              </span>
            ))}
            <span style={{ fontSize: 10, color: "#c4cdd6", marginLeft: "auto" }}>→ rotates each session</span>
          </div>
        </section>

        {/* ══════ 4. PATTERN GRID ══════ */}
        <section id="pattern-grid" style={{ marginBottom: 24 }}>
          <SectionLabel>All Patterns</SectionLabel>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 10,
          }}>
            {gridModules.map((m) => (
              <GrammarCard key={m.unitId} module={m} onCta={handleCta} />
            ))}
          </div>
        </section>

        {/* ══════ 5. SPEAKING PRACTICE ══════ */}
        <section id="speaking-practice" style={{ marginBottom: 24 }}>
          <SectionLabel>Speaking Practice</SectionLabel>
          <div style={{
            borderRadius: 8,
            padding: "20px 22px",
            background: "#f8f7f5",
            border: "1px solid #e8e4de",
            borderLeft: "3px solid #194a6d",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                background: "rgba(25,74,109,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#194a6d",
              }}>
                <MicIcon />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#1a2f3f" }}>
                    Speak Now
                  </span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                    padding: "2px 7px", borderRadius: 3,
                    background: "rgba(25,74,109,0.08)", color: "#194a6d",
                    border: "1px solid rgba(25,74,109,0.15)",
                  }}>
                    {SPEAKING_PROMPT.timeSeconds}s
                  </span>
                  <span style={{
                    fontSize: 10, fontWeight: 600, color: "#6b7a87",
                    padding: "2px 7px", borderRadius: 3,
                    background: "#f0f4f8", border: "1px solid #e4e8ed",
                  }}>
                    Passive Voice · Environment
                  </span>
                </div>
                <p style={{ margin: "0 0 6px", fontSize: 13, color: "#2d4a5e", lineHeight: 1.6, fontWeight: 500 }}>
                  {SPEAKING_PROMPT.instruction}
                </p>
                <p style={{ margin: "0 0 14px", fontSize: 11, color: "#8594a3", lineHeight: 1.5, fontStyle: "italic" }}>
                  {SPEAKING_PROMPT.hint}
                </p>
                <p style={{ margin: "0 0 14px", fontSize: 11, color: "#a0adb8", lineHeight: 1.5 }}>
                  {SPEAKING_PROMPT.example}
                </p>
                <button
                  id="speaking-record-btn"
                  style={{
                    fontSize: 12, fontWeight: 700, padding: "8px 18px", borderRadius: 5,
                    border: "none", background: "#194a6d", color: "#ffffff",
                    cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
                  }}>
                  <MicIcon />
                  Record Response
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ══════ 6. PATTERNS BUILT TODAY ══════ */}
        <section id="patterns-today" style={{ marginBottom: 24 }}>
          <SectionLabel>Patterns Built Today</SectionLabel>
          <div style={{
            borderRadius: 8, padding: "16px 20px",
            background: "#ffffff", border: "1px solid #e4e8ed",
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {PATTERNS_TODAY.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#0d9488", marginTop: 2, flexShrink: 0 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p style={{
                    margin: 0, fontSize: 13, color: "#2d4a5e", lineHeight: 1.55,
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontStyle: "italic",
                  }}>
                    {p}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════ 7. ACADEMIC PROGRESS ══════ */}
        <AcademicProgress
          completedModules={doneUnits}
          totalModules={totalUnits}
          progressPercent={progressPct}
          nextUnit={previewModule?.grammarName ?? "—"}
        />
      </div>
    </main>
  );
}
