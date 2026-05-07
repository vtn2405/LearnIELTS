"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { BookOpen, Edit, FileText, Mic, Zap, CheckCircle, HelpCircle, LogOut, Flame, Target } from "lucide-react";

const navItems = [
  {
    label: "Grammar Theory",
    href: "/grammar-theory",
    icon: BookOpen,
  },
  {
    label: "Exercise Hub",
    href: "/exercises",
    icon: Edit,
  },
  {
    label: "Writing Tasks",
    href: "/writing",
    icon: FileText,
  },
  {
    label: "Speaking Drills",
    href: "/speaking",
    icon: Mic,
  },
];

// Total grammar units: 15 from grammar-units.json (5B) + 1 seed unit (Phase 5A) = 16
const TOTAL_UNITS = 16;

export interface SidebarProps {
  targetBand?: number;
  currentStreak?: number;
  totalXp?: number;
  unitsDone?: number;
}

export function Sidebar({ targetBand = 7.0, currentStreak = 0, totalXp = 0, unitsDone = 0 }: SidebarProps = {}) {
  const pathname = usePathname();
  const { signOut } = useClerk();

  return (
    <aside className="flex w-64 shrink-0 flex-col bg-slate-50 shadow-inner">
      {/* Learning Modules nav */}
      <div className="px-4 pt-4 pb-2 flex-1">
        <p className="px-2 mb-2 text-sm font-bold text-cyan-900 font-headline">
          Learning Modules
        </p>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href !== "/" &&
              (pathname === item.href || pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-label ${
                  isActive
                    ? "bg-white text-cyan-900 shadow-sm font-bold translate-x-1"
                    : "text-slate-600 hover:bg-slate-200/50"
                }`}
              >
                <span className={isActive ? "text-cyan-900" : "text-slate-500"}>
                  <item.icon className="w-6 h-6" />
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Stats progress */}
      <div className="px-6 py-4 border-t border-slate-200/50">
        <div className="flex items-center gap-2 mb-2">
          <Target className="text-indigo-500 w-5 h-5" />
          <span className="text-sm font-semibold text-slate-700 font-label">
            Target Band {targetBand.toFixed(1)}
          </span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <Flame className="text-tertiary w-5 h-5 fill-tertiary/20" />
          <span className="text-sm font-semibold text-slate-700 font-label">
            {currentStreak} Day Streak
          </span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <Zap className="text-amber-500 w-5 h-5 fill-amber-500/20" />
          <span className="text-sm font-semibold text-slate-700 font-label">
            {totalXp.toLocaleString()} XP
          </span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="text-emerald-600 w-5 h-5" />
          <span className="text-sm font-semibold text-slate-700 font-label">
            {unitsDone} / {TOTAL_UNITS} Units
          </span>
        </div>
      </div>

      {/* Help Center + Logout */}
      <div className="px-4 pb-4 border-t border-slate-200/50 pt-2 space-y-1">
        <Link
          href="/help"
          id="sidebar-help-link"
          className="flex items-center gap-3 px-4 py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-200/50 transition-all font-label"
        >
          <HelpCircle className="w-5 h-5" />
          Help Center
        </Link>
        <button
          id="sidebar-logout-btn"
          onClick={() => signOut()}
          className="flex w-full items-center gap-3 px-4 py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-200/50 transition-all text-left font-label"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
