// Server Component — không cần "use client"
import { BookOpen, FileText, Mic } from "lucide-react";

interface Props {
  grammarPct: number;
  writingPct: number;
  speakingPct: number;
}

const modules = [
  {
    key: "grammar",
    label: "Grammar",
    icon: BookOpen,
    color: "bg-secondary",
    iconBg: "bg-secondary-container/30",
    iconText: "text-secondary",
  },
  {
    key: "writing",
    label: "Writing",
    icon: FileText,
    color: "bg-primary",
    iconBg: "bg-primary-container/20",
    iconText: "text-primary",
  },
  {
    key: "speaking",
    label: "Speaking",
    icon: Mic,
    color: "bg-tertiary",
    iconBg: "bg-tertiary-fixed",
    iconText: "text-tertiary",
  },
];

export function LearningProgress({
  grammarPct,
  writingPct,
  speakingPct,
}: Props) {
  const pcts: Record<string, number> = {
    grammar: grammarPct,
    writing: writingPct,
    speaking: speakingPct,
  };

  return (
    <div className="flex-1 rounded-xl ring-1 ring-outline-variant/15 bg-surface-container-low p-8">
      <h3 className="text-xl font-bold font-headline text-on-surface mb-8">
        Learning Progress
      </h3>
      <div className="space-y-5">
        {modules.map((mod) => (
          <div key={mod.key} className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-xl ${mod.iconBg} flex items-center justify-center shrink-0`}
            >
              <mod.icon className={`${mod.iconText} w-6 h-6`} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between mb-1.5">
                <span className="text-sm font-bold text-on-surface font-headline">
                  {mod.label}
                </span>
                <span className="text-sm font-bold text-on-surface-variant font-label">
                  {pcts[mod.key]}%
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-surface-variant overflow-hidden">
                <div
                  className={`h-full rounded-full ${mod.color} transition-all duration-500`}
                  style={{ width: `${pcts[mod.key]}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
