// Server Component — không cần "use client"
import Link from "next/link";
import { Sparkles, ClipboardList, Brain, ChevronRight } from "lucide-react";

export function NextActions() {
  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold font-headline text-on-surface mb-4">
        Tiếp theo cho bạn
      </h3>
      <div className="grid grid-cols-3 gap-4">
        {/* Card 1: Quick Review — vertical */}
        <Link
          href="/grammar"
          className="block rounded-xl ring-1 ring-outline-variant/15 bg-surface-container-lowest p-6 hover:bg-white transition-all"
        >
          <Sparkles className="text-primary-container mb-2 w-6 h-6" />
          <p className="font-bold text-sm text-on-surface">Quick Review</p>
          <p className="text-xs text-on-surface-variant mt-1">
            5-min flashcards
          </p>
        </Link>

        {/* Card 2: Mock Test — vertical, disabled */}
        <div className="relative">
          <span className="absolute -top-2 right-3 text-[10px] font-semibold bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full z-10">
            Sắp ra mắt
          </span>
          <div className="block rounded-xl ring-1 ring-outline-variant/15 bg-surface-container-lowest p-6 opacity-50 cursor-not-allowed">
            <ClipboardList className="text-primary-container mb-2 w-6 h-6" />
            <p className="font-bold text-sm text-on-surface">Mock Test</p>
            <p className="text-xs text-on-surface-variant mt-1">
              Full simulation
            </p>
          </div>
        </div>

        {/* Card 3: Academic Vocabulary — horizontal with arrow */}
        <Link
          href="/grammar"
          className="flex items-center gap-4 rounded-xl ring-1 ring-outline-variant/15 bg-surface-container-lowest px-5 py-4 hover:bg-white transition-all"
        >
          <Brain className="text-primary shrink-0 w-6 h-6" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-on-surface">
              Academic Vocabulary
            </p>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Focus on Humanities terms
            </p>
          </div>
          <ChevronRight className="text-on-surface-variant shrink-0 w-6 h-6" />
        </Link>
      </div>
    </div>
  );
}
