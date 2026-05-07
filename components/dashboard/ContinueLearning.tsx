// Server Component — không cần "use client"
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { UnitProgress } from "@prisma/client";

import { getUnitMeta } from "@/lib/content/unitsMetadata";

interface Props {
  unit: UnitProgress;
}

export function ContinueLearning({ unit }: Props) {
  const meta = getUnitMeta(unit.unitId);
  const title =
    meta?.title ??
    unit.unitId
      .replace(/^unit-\d+-/, "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c: string) => c.toUpperCase());

  const pct = unit.bestBand ? Math.round(((unit.bestBand - 4) / 5) * 100) : 0;

  return (
    <div className="w-[280px] shrink-0 rounded-xl bg-primary p-8 text-white ring-1 ring-primary-container shadow-xl relative overflow-hidden">
      <p className="text-[11px] font-semibold text-teal-300 uppercase tracking-widest mb-2">
        Đang học dở
      </p>
      <h3 className="text-xl font-bold leading-snug mb-1">{title}</h3>
      <p className="text-[13px] text-slate-300 mb-4">
        {unit.attemptCount} lần thử
        {unit.bestBand ? ` · Best: Band ${unit.bestBand.toFixed(1)}` : ""}
      </p>

      {/* Mini progress bar */}
      <div className="h-1 w-full rounded-full bg-white/20 mb-5 overflow-hidden">
        <div
          className="h-full rounded-full bg-teal-400"
          style={{ width: `${pct}%` }}
        />
      </div>

      <Link
        href={`/unit/${unit.unitId}`}
        className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-xl font-bold text-sm hover:bg-surface-bright transition-colors"
      >
        Tiếp tục học
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
