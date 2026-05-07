// app/exercises/error-hunter/page.tsx
"use client";

import { useEffect, useReducer, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ErrorHunterShell from "@/components/exercises/error-hunter/ErrorHunterShell";
import type {
  EhPassageClient,
  EhErrorMeta,
  UserSelection,
  EhSubmitResponse,
  EhNextResponse,
} from "@/lib/types/error-hunter";
import { v4 as uuid } from "uuid";

// ─── State machine ────────────────────────────────────────────────────────────

type Phase = "loading" | "playing" | "submitting" | "result";

interface State {
  phase: Phase;
  passage: EhPassageClient | null;
  errorsMeta: EhErrorMeta[];
  selections: UserSelection[];
  result: EhSubmitResponse | null;
  errorMsg: string | null;
}

type Action =
  | { type: "LOAD_START" }
  | { type: "LOAD_OK"; payload: EhNextResponse }
  | { type: "LOAD_FAIL"; message: string }
  | { type: "ADD_SEL"; sel: UserSelection }
  | { type: "REMOVE_SEL"; id: string }
  | { type: "UPDATE_CORRECTION"; id: string; correction: string }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_OK"; result: EhSubmitResponse }
  | { type: "RESET" };

const INIT: State = {
  phase: "loading", passage: null, errorsMeta: [],
  selections: [], result: null, errorMsg: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOAD_START":
      return { ...INIT, phase: "loading" };
    case "LOAD_OK":
      return {
        ...state, phase: "playing",
        passage: action.payload.passage,
        errorsMeta: action.payload.errorsMeta,
        selections: [], result: null, errorMsg: null,
      };
    case "LOAD_FAIL":
      return { ...state, phase: "playing", errorMsg: action.message };
    case "ADD_SEL":
      return { ...state, selections: [...state.selections, action.sel] };
    case "REMOVE_SEL":
      return { ...state, selections: state.selections.filter((s) => s.id !== action.id) };
    case "UPDATE_CORRECTION":
      return {
        ...state,
        selections: state.selections.map((s) =>
          s.id === action.id ? { ...s, userCorrection: action.correction } : s
        ),
      };
    case "SUBMIT_START":
      return { ...state, phase: "submitting" };
    case "SUBMIT_OK":
      return { ...state, phase: "result", result: action.result };
    case "RESET":
      return INIT;
    default:
      return state;
  }
}

// ─── Page component ───────────────────────────────────────────────────────────

export default function ErrorHunterPage() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const packId = searchParams.get("packId") ?? "pack-units-1-2";

  const [state, dispatch] = useReducer(reducer, INIT);

  const loadNext = useCallback(async () => {
    dispatch({ type: "LOAD_START" });
    try {
      const res = await fetch(`/api/error-hunter/next?packId=${packId}`);
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Failed to load passage.");
      }
      const data: EhNextResponse = await res.json();
      dispatch({ type: "LOAD_OK", payload: data });
    } catch (e: unknown) {
      dispatch({
        type: "LOAD_FAIL",
        message: e instanceof Error ? e.message : "Unknown error",
      });
    }
  }, [packId]);

  useEffect(() => { loadNext(); }, [loadNext]);

  const handleSubmit = async () => {
    if (!state.passage) return;
    dispatch({ type: "SUBMIT_START" });
    try {
      const res = await fetch("/api/error-hunter/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passageId:      state.passage.id,
          userSelections: state.selections,
        }),
      });
      const result: EhSubmitResponse = await res.json();
      dispatch({ type: "SUBMIT_OK", result });
    } catch {
      dispatch({ type: "LOAD_FAIL", message: "Submit failed. Please try again." });
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#f8fafc",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px 60px" }}>
        {/* ── Back nav ── */}
        <button
          onClick={() => router.push("/exercises")}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 13, fontWeight: 600, color: "#64748b",
            background: "transparent", border: "none",
            cursor: "pointer", marginBottom: 20, padding: 0,
          }}
        >
          ← Exercise Hub
        </button>

        {/* ── Page header ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 24 }}>🔍</span>
            <h1 style={{
              margin: 0, fontSize: 24, fontWeight: 800,
              color: "#1e3a5f", letterSpacing: "-0.02em",
            }}>
              Error Hunter
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: 13.5, color: "#64748b", maxWidth: 560 }}>
            Read the passage and select any grammar errors you notice. 
            You can optionally type a correction for each one.
          </p>
        </div>

        {/* ── Main shell ── */}
        <ErrorHunterShell
          phase={state.phase}
          passage={state.passage}
          errorsMeta={state.errorsMeta}
          selections={state.selections}
          result={state.result}
          errorMsg={state.errorMsg}
          onAddSelection={(sel) => dispatch({ type: "ADD_SEL", sel })}
          onRemoveSelection={(id) => dispatch({ type: "REMOVE_SEL", id })}
          onUpdateCorrection={(id, correction) =>
            dispatch({ type: "UPDATE_CORRECTION", id, correction })
          }
          onSubmit={handleSubmit}
          onNext={loadNext}
        />
      </div>
    </div>
  );
}
