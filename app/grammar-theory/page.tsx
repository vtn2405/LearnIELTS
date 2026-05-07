"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type UnitStatus = "completed" | "learning" | "locked";

interface Unit {
  id: string;
  title: string;
  band: string;
  apply: string;
  status: UnitStatus;
}

interface Chapter {
  number: number;
  title: string;
  subtitle: string;
  units: Unit[];
}

interface ProgressResponse {
  completedUnitIds: string[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const CHAPTERS: Chapter[] = [
  {
    number: 1,
    title: "Chương 1",
    subtitle: "Nền tảng Thời thì",
    units: [
      {
        id: "unit-1-simple-present",
        title: "Simple Present",
        band: "4.0+",
        apply: "Speaking P1 · Writing T2",
        status: "learning",
      },
      {
        id: "unit-1-present-continuous",
        title: "Present Continuous",
        band: "4.0+",
        apply: "Speaking P1 · Writing T1",
        status: "locked",
      },
      {
        id: "unit-1-simple-past",
        title: "Simple Past",
        band: "4.5+",
        apply: "Speaking P2",
        status: "locked",
      },
      {
        id: "unit-1-past-continuous",
        title: "Past Continuous",
        band: "4.5+",
        apply: "Speaking P2",
        status: "locked",
      },
    ],
  },
  {
    number: 2,
    title: "Chương 2",
    subtitle: "Thì Hoàn thành & Tương lai",
    units: [
      {
        id: "unit-2-present-perfect",
        title: "Present Perfect",
        band: "5.0+",
        apply: "Speaking P3 · Writing T1",
        status: "locked",
      },
      {
        id: "unit-2-past-perfect",
        title: "Past Perfect",
        band: "5.5+",
        apply: "Speaking P2",
        status: "locked",
      },
      {
        id: "unit-2-future",
        title: "Future (will/going to)",
        band: "4.5+",
        apply: "Writing T1 Prediction",
        status: "locked",
      },
      {
        id: "unit-3-modal-ability",
        title: "Modal Ability",
        band: "6.0+",
        apply: "Writing T2",
        status: "locked",
      },
      {
        id: "unit-3-modal-possibility",
        title: "Modal Possibility",
        band: "6.5+",
        apply: "Speaking P3",
        status: "locked",
      },
      {
        id: "unit-3-passive",
        title: "Passive Voice",
        band: "6.0+",
        apply: "Writing T1 Process",
        status: "locked",
      },
    ],
  },
  {
    number: 3,
    title: "Chương 3",
    subtitle: "Câu Điều kiện",
    units: [
      {
        id: "unit-4-conditional-1",
        title: "Conditional Type 1",
        band: "6.0+",
        apply: "Writing T2",
        status: "locked",
      },
      {
        id: "unit-4-conditional-2",
        title: "Conditional Type 2",
        band: "7.0+",
        apply: "Speaking P3",
        status: "locked",
      },
      {
        id: "unit-4-conditional-3",
        title: "Conditional Type 3",
        band: "7.5+",
        apply: "Speaking P3 Speculation",
        status: "locked",
      },
    ],
  },
  {
    number: 4,
    title: "Chương 4",
    subtitle: "Mệnh đề",
    units: [
      {
        id: "unit-5-relative",
        title: "Relative Clauses",
        band: "6.5+",
        apply: "Writing T2 Complex",
        status: "locked",
      },
      {
        id: "unit-5-reported",
        title: "Reported Speech",
        band: "6.0+",
        apply: "Writing T2",
        status: "locked",
      },
    ],
  },
  {
    number: 5,
    title: "Chương 5",
    subtitle: "Cấu trúc Nâng cao",
    units: [
      {
        id: "unit-5-cleft",
        title: "Cleft Sentences",
        band: "8.0+",
        apply: "Writing T2 Emphasis",
        status: "locked",
      },
    ],
  },
];

function applyProgress(
  baseChapters: Chapter[],
  completedUnitIds: Set<string>,
): Chapter[] {
  const allUnits = baseChapters.flatMap((chapter) => chapter.units);
  const firstIncomplete = allUnits.find(
    (unit) => !completedUnitIds.has(unit.id),
  );
  const learningId = firstIncomplete?.id;

  return baseChapters.map((chapter) => ({
    ...chapter,
    units: chapter.units.map((unit) => {
      if (completedUnitIds.has(unit.id)) {
        return { ...unit, status: "completed" as UnitStatus };
      }
      if (learningId && unit.id === learningId) {
        return { ...unit, status: "learning" as UnitStatus };
      }
      return { ...unit, status: "locked" as UnitStatus };
    }),
  }));
}

// ─── Icons ───────────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 11V7C8 4.79086 9.79086 3 12 3V3C14.2091 3 16 4.79086 16 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
    </svg>
  );
}

function FireIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C12 2 15 6 15 9C15 11 13 13 13 13C13 13 14 10 14 10C14 10 18 12 18 16C18 20 15 22 12 22C9 22 6 20 6 16C6 13 8 11 8 11C8 11 7 13 7 13C7 13 5 11 5 9C5 6 8 2 8 2C8 2 10 6 10 6C10 6 12 2 12 2Z" fill="#c2410c"/>
    </svg>
  )
}

function BandBadge({ band }: { band: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
      Band {band}
    </span>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function UnitCard({ unit }: { unit: Unit }) {
  const isCompleted = unit.status === "completed";
  const isLearning = unit.status === "learning";
  const isLocked = unit.status === "locked";

  const cardClasses = `flex flex-col rounded-2xl overflow-hidden transition-all duration-300 ${
    isLocked
      ? "bg-slate-50 border border-dashed border-slate-200 opacity-60 cursor-not-allowed"
      : isLearning
        ? "bg-white border border-indigo-500 shadow-md shadow-indigo-100 cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-200"
        : "bg-white border border-emerald-200 cursor-pointer shadow-sm hover:-translate-y-1 hover:shadow-md"
  }`;

  const inner = (
    <div className={cardClasses}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4">
        {/* Left: icon + title + band */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Status icon circle */}
          <div
            className={`w-12 h-12 rounded-full shrink-0 flex items-center justify-center ${
              isCompleted
                ? "bg-emerald-100 text-emerald-600"
                : isLearning
                  ? "bg-indigo-100 text-indigo-600"
                  : "bg-slate-200 text-slate-400"
            }`}
          >
            {isCompleted && <CheckIcon />}
            {isLearning && <PlayIcon />}
            {isLocked && <LockIcon />}
          </div>

          {/* Text */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span
                className={`text-lg font-bold leading-tight ${
                  isLocked ? "text-slate-400" : "text-slate-900"
                }`}
              >
                {unit.title}
              </span>
              <BandBadge band={unit.band} />
            </div>
            <span className="text-[13px] font-medium text-slate-500 leading-snug hidden sm:block">
              {unit.apply}
            </span>
          </div>
        </div>

        {/* Right: Status label */}
        <div className="flex flex-col sm:items-end gap-1 shrink-0 ml-16 sm:ml-0">
          <span className="text-[13px] font-medium text-slate-500 leading-snug sm:hidden mb-1">
            {unit.apply}
          </span>
          {isCompleted && (
            <span className="text-[11px] font-bold text-emerald-600 tracking-wider uppercase">
              Đã xong
            </span>
          )}
          {isLearning && (
            <span className="text-[11px] font-bold text-indigo-600 tracking-wider uppercase">
              Đang học
            </span>
          )}
          {isLocked && (
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
              Chưa mở
            </span>
          )}
        </div>
      </div>

      {/* Progress bar for "learning" */}
      {isLearning && (
        <div className="h-1 bg-indigo-50 relative">
          <div className="absolute left-0 top-0 h-full w-[25%] bg-indigo-500 rounded-r-full" />
        </div>
      )}
    </div>
  );

  if (isLocked) {
    return (
      <div aria-disabled="true" className="cursor-not-allowed">
        {inner}
      </div>
    );
  }

  return (
    <Link href={`/unit/${unit.id}`} className="block outline-none focus:ring-2 focus:ring-indigo-400 rounded-2xl">
      {inner}
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GrammarTheoryPage() {
  const [completedUnitIds, setCompletedUnitIds] = useState<string[]>([]);

  useEffect(() => {
    let active = true;

    const allUnitIds = CHAPTERS.flatMap((chapter) =>
      chapter.units.map((unit) => unit.id),
    );

    function getOptimisticCompletedIds(): string[] {
      if (typeof window === "undefined") return [];
      return allUnitIds.filter(
        (id) => localStorage.getItem(`unit-completed-${id}`) === "1",
      );
    }

    async function fetchProgress() {
      try {
        const res = await fetch("/api/progress/units", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        if (!res.ok) {
          if (active) setCompletedUnitIds(getOptimisticCompletedIds());
          return;
        }

        const data = (await res.json()) as ProgressResponse;
        if (active) {
          const fromServer = Array.isArray(data.completedUnitIds)
            ? data.completedUnitIds
            : [];
          setCompletedUnitIds(fromServer);

          const serverSet = new Set(fromServer);
          allUnitIds.forEach((id) => {
            if (!serverSet.has(id)) {
              localStorage.removeItem(`unit-completed-${id}`);
            }
          });
        }
      } catch {
        if (active) {
          setCompletedUnitIds(getOptimisticCompletedIds());
        }
      }
    }

    setCompletedUnitIds(getOptimisticCompletedIds());
    fetchProgress();

    const onFocus = () => fetchProgress();
    window.addEventListener("focus", onFocus);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchProgress();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) fetchProgress();
    };
    window.addEventListener("pageshow", onPageShow);

    return () => {
      active = false;
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  const chapters = useMemo(
    () => applyProgress(CHAPTERS, new Set(completedUnitIds)),
    [completedUnitIds],
  );

  const totalUnits = chapters.reduce((sum, ch) => sum + ch.units.length, 0);
  const completedUnits = chapters.reduce(
    (sum, ch) => sum + ch.units.filter((u) => u.status === "completed").length,
    0,
  );
  const learningUnit = chapters
    .flatMap((ch) => ch.units)
    .find((u) => u.status === "learning");

  return (
    <div className="min-h-screen bg-slate-50 font-body">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 pb-24">
        
        {/* 1. HERO SECTION (Continue Learning) */}
        <div className="mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-headline">
                Welcome back! 👋
              </h1>
              <p className="text-slate-500 font-medium mt-1">
                Sẵn sàng chinh phục mục tiêu IELTS của bạn chưa?
              </p>
            </div>
            {/* Streak indicator */}
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 px-4 py-2 rounded-xl shadow-sm self-start sm:self-auto">
              <FireIcon />
              <span className="font-bold text-orange-700">3 ngày liên tiếp</span>
            </div>
          </div>

          <div className="bg-indigo-600 rounded-3xl p-8 sm:p-10 shadow-xl shadow-indigo-200/50 relative overflow-hidden group">
            {/* Decorative background circle */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-50 pointer-events-none transition-transform duration-700 group-hover:scale-110" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div>
                <span className="inline-block px-3 py-1 bg-white/20 text-white text-[11px] font-bold uppercase tracking-widest rounded-full mb-4">
                  Tiếp tục hành trình
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-headline text-white mb-2 leading-tight">
                  {learningUnit ? learningUnit.title : "Bắt đầu bài đầu tiên!"}
                </h2>
                <p className="text-indigo-100 font-medium">
                  {learningUnit ? `Mục tiêu Band ${learningUnit.band} · Ứng dụng: ${learningUnit.apply}` : "Khởi động nền tảng ngữ pháp ngay hôm nay."}
                </p>
              </div>
              <Link
                href={learningUnit ? `/unit/${learningUnit.id}` : "/unit/unit-1-simple-present"}
                className="shrink-0 w-full md:w-auto text-center bg-white text-indigo-600 hover:bg-slate-50 px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl active:scale-95 animate-pulse"
              >
                Tiếp tục học →
              </Link>
            </div>
          </div>
        </div>

        {/* 2. PROGRESS OVERVIEW */}
        <div className="mb-14">
          <div className="flex justify-between items-end mb-3">
            <h3 className="text-lg font-bold font-headline text-slate-900">Tiến độ tổng thể</h3>
            <span className="text-sm font-semibold text-slate-500">
              {completedUnits} / {totalUnits} Units
            </span>
          </div>
          <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${Math.round((completedUnits / Math.max(totalUnits, 1)) * 100)}%` }}
            />
          </div>
        </div>

        {/* 3. LEARNING ROADMAP */}
        <div className="relative mb-20">
          {chapters.map((chapter, chIdx) => {
            const completedInChapter = chapter.units.filter((u) => u.status === "completed").length;
            const isLastChapter = chIdx === chapters.length - 1;

            return (
              <div key={chapter.number} className="flex gap-4 sm:gap-6">
                {/* Connector Column */}
                <div className="flex flex-col items-center w-10 sm:w-12 shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-md z-10 relative">
                    {chapter.number}
                  </div>
                  {!isLastChapter && (
                    <div className="w-[3px] flex-1 bg-slate-200 my-2" />
                  )}
                </div>

                {/* Content Column */}
                <div className="flex-1 pb-12">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-6 gap-2">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        {chapter.title}
                      </p>
                      <h2 className="text-xl sm:text-2xl font-bold font-headline text-slate-900">
                        {chapter.subtitle}
                      </h2>
                    </div>
                    <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full self-start sm:self-auto">
                      {completedInChapter}/{chapter.units.length} bài
                    </span>
                  </div>

                  <div className="flex flex-col gap-5">
                    {chapter.units.map((unit) => (
                      <UnitCard key={unit.id} unit={unit} />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 4. DAILY TRAINING MODULES (Side Quests) */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-xl font-bold font-headline text-slate-900">Nhiệm vụ rèn luyện</h3>
            <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-md">Bổ trợ</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Speed Drill Card */}
            <Link href="/speed-drill" className="block outline-none group">
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-100/50 h-full flex flex-col">
                <div className="text-4xl mb-4">⚡</div>
                <h4 className="text-lg font-bold font-headline text-amber-900 mb-2">Speed Drill</h4>
                <p className="text-sm text-amber-700 font-medium mt-auto">Luyện phản xạ chia thì và ngôi trong 60 giây.</p>
              </div>
            </Link>

            {/* Error Hunter Card */}
            <Link href="/error-hunter" className="block outline-none group">
              <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-rose-100/50 h-full flex flex-col">
                <div className="text-4xl mb-4">🕵️</div>
                <h4 className="text-lg font-bold font-headline text-rose-900 mb-2">Error Hunter</h4>
                <p className="text-sm text-rose-700 font-medium mt-auto">Truy tìm và sửa các lỗi sai ngữ pháp kinh điển.</p>
              </div>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
