// Server Component — không cần "use client"
import Link from "next/link";
import type { UnitProgress } from "@prisma/client";
import { getUnitMeta } from "@/lib/content/unitsMetadata";

interface RoadmapStep {
  id: string;
  label: string;
  sublabel?: string;
  href: string;
  status: "done" | "active" | "upcoming";
}

interface Props {
  continueUnit?: UnitProgress | null;
  grammarPct: number;
  writingPct: number;
  speakingPct: number;
}

export function TodayRoadmap({ continueUnit, grammarPct, writingPct, speakingPct }: Props) {
  const continueTitle = continueUnit
    ? (getUnitMeta(continueUnit.unitId)?.title ??
        continueUnit.unitId
          .replace(/^unit-\d+-/, "")
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c: string) => c.toUpperCase()))
    : null;

  const steps: RoadmapStep[] = [
    {
      id: "grammar",
      label: continueTitle ?? "Grammar Theory",
      sublabel: continueTitle ? "Tiếp tục bài đang học" : "Ôn lý thuyết ngữ pháp",
      href: continueUnit ? `/unit/${continueUnit.unitId}` : "/grammar-theory",
      status: grammarPct >= 100 ? "done" : continueUnit ? "active" : "upcoming",
    },
    {
      id: "exercise",
      label: "Luyện tập Grammar",
      sublabel: "Exercises & drills",
      href: "/grammar",
      status: grammarPct > 0 ? (grammarPct >= 50 ? "done" : "active") : "upcoming",
    },
    {
      id: "writing",
      label: "Writing Task",
      sublabel: "Viết bài luận",
      href: "/writing",
      status: writingPct >= 50 ? "done" : writingPct > 0 ? "active" : "upcoming",
    },
    {
      id: "speaking",
      label: "Speaking Drill",
      sublabel: "Luyện phát âm & fluency",
      href: "/speaking",
      status: speakingPct >= 50 ? "done" : speakingPct > 0 ? "active" : "upcoming",
    },
    {
      id: "review",
      label: "Quick Review",
      sublabel: "5-min flashcards",
      href: "/grammar",
      status: "upcoming",
    },
  ];

  return (
    <aside className="w-[240px] shrink-0 flex flex-col gap-3 pt-1">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-4">
          Lộ trình hôm nay
        </p>

        <ol className="relative space-y-0">
          {steps.map((step, idx) => {
            const isLast = idx === steps.length - 1;
            return (
              <li key={step.id} className="relative flex gap-3">
                {/* Vertical connector line */}
                {!isLast && (
                  <span
                    className={`absolute left-[10px] top-[22px] w-px h-[calc(100%-4px)] ${
                      step.status === "done" ? "bg-teal-400" : "bg-slate-200"
                    }`}
                  />
                )}

                {/* Step dot */}
                <span className="relative flex-shrink-0 mt-1">
                  {step.status === "done" ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-500 ring-2 ring-teal-100">
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M2 6l3 3 5-5"
                          stroke="white"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  ) : step.status === "active" ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1a3a5c] ring-2 ring-blue-100">
                      <span className="h-2 w-2 rounded-full bg-white" />
                    </span>
                  ) : (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-slate-300 bg-white">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                    </span>
                  )}
                </span>

                {/* Step content */}
                <div className="pb-5 min-w-0">
                  <Link
                    href={step.href}
                    className={`block text-[13px] font-semibold leading-tight transition-colors ${
                      step.status === "active"
                        ? "text-[#1a3a5c]"
                        : step.status === "done"
                          ? "text-teal-600"
                          : "text-slate-400"
                    } hover:text-[#1a3a5c]`}
                  >
                    {step.label}
                  </Link>
                  {step.sublabel && (
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                      {step.sublabel}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Mini motivational card */}
      <div className="rounded-2xl bg-gradient-to-br from-[#1a3a5c] to-[#0d6e6e] p-4 text-white">
        <p className="text-[10px] font-semibold text-teal-300 uppercase tracking-widest mb-1">
          Mục tiêu
        </p>
        <p className="text-[22px] font-bold leading-none mb-0.5">Band 7.0</p>
        <p className="text-[11px] text-slate-300">Duy trì streak mỗi ngày 🔥</p>
      </div>
    </aside>
  );
}
