"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, ClerkLoaded, useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { Flame, ChevronsRight, Bell, Settings, Menu, X } from "lucide-react";

const navLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Progress", href: "/progress" },
  { label: "Resources", href: "/resources" },
];

export function TopNavbar({
  currentBand,
  targetBand,
  currentStreak,
}: {
  currentBand?: number | null;
  targetBand?: number;
  currentStreak?: number;
}) {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const hasStats = targetBand !== undefined && targetBand !== null;

  return (
    <header
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-outline-variant/10"
      style={{ height: "56px" }}
    >
      <div className="flex h-full items-center justify-between px-6">
        {/* Logo */}
        <Link
          href="/"
          className="text-sm font-bold text-cyan-900 tracking-tight shrink-0 whitespace-nowrap font-headline"
        >
          The Scholarly Perspective
        </Link>

        <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => {
            let isActive = false;
            if (link.label === "Dashboard") {
              isActive = pathname === "/dashboard" || pathname === "/";
            } else if (link.label === "Progress") {
              isActive = pathname.startsWith("/progress");
            } else if (link.label === "Resources") {
              isActive = pathname.startsWith("/resources");
            }
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-1 text-sm transition-colors ${
                  isActive
                    ? "font-semibold text-cyan-900 border-b-2 border-cyan-800 font-label"
                    : "font-medium text-slate-500 hover:text-cyan-800 font-label"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Streak badge */}
          {hasStats && currentStreak !== undefined && (
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-tertiary-fixed rounded-full">
              <Flame className="text-tertiary w-5 h-5 fill-tertiary" />
              <span className="text-xs font-bold text-tertiary">
                {currentStreak} Ngày
              </span>
            </div>
          )}

          {/* Band badge — 2-tone: light left + dark right button */}
          {hasStats && targetBand !== undefined && (
            <div className="hidden lg:flex items-center gap-0.5 bg-secondary-container/30 rounded-full px-1 py-1 ring-1 ring-secondary/20">
              <div className="flex items-center gap-1 px-2.5 py-1 bg-white rounded-full shadow-sm">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">
                  Hiện tại
                </span>
                <span className="text-xs font-black text-on-surface">
                  {currentBand?.toFixed(1) ?? "—"}
                </span>
                <ChevronsRight className="text-secondary w-4 h-4 mx-0.5" />
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 bg-secondary text-white rounded-full shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-tighter opacity-80">
                  Mục tiêu
                </span>
                <span className="text-xs font-black">
                  {targetBand.toFixed(1)}
                </span>
              </div>
            </div>
          )}

          {/* Notification bell */}
          <button
            id="topnav-notification-btn"
            aria-label="Thông báo"
            className="relative p-2 rounded-full text-cyan-900 hover:bg-slate-50 transition-colors"
          >
            <Bell className="w-6 h-6" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
          </button>

          {/* Settings gear */}
          <button
            id="topnav-settings-btn"
            aria-label="Cài đặt"
            className="p-2 rounded-full text-cyan-900 hover:bg-slate-50 transition-colors"
          >
            <Settings className="w-6 h-6" />
          </button>

          {/* Clerk UserButton */}
          <ClerkLoaded>
            {isSignedIn ? (
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8 ring-2 ring-primary-container/20",
                  },
                }}
              />
            ) : (
              <Link
                href="/sign-in"
                className="rounded-full bg-[#1a3a5c] px-4 py-2 text-sm font-medium text-white hover:bg-[#15304f] transition"
              >
                Đăng nhập
              </Link>
            )}
          </ClerkLoaded>

          {/* Hamburger — mobile only */}
          <button
            id="topnav-hamburger-btn"
            aria-label="Menu"
            className="md:hidden p-2 rounded-full text-cyan-900 hover:bg-slate-50 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown nav */}
      {mobileOpen && (
        <div className="md:hidden absolute top-[56px] left-0 right-0 bg-surface-container-lowest border-b border-outline-variant/20 shadow-md z-50 px-4 py-3 flex flex-col gap-1">
          {navLinks.map((link) => {
            let isActive = false;
            if (link.label === "Dashboard") {
              isActive = pathname === "/dashboard" || pathname === "/";
            } else if (link.label === "Progress") {
              isActive = pathname.startsWith("/progress");
            } else if (link.label === "Resources") {
              isActive = pathname.startsWith("/resources");
            }
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-white font-semibold text-cyan-900 border-b-2 border-cyan-800"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {/* Mobile streak + band */}
          {hasStats && targetBand !== undefined && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 mt-1">
              {currentStreak !== undefined && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-tertiary-fixed rounded-full">
                    <Flame className="text-tertiary w-5 h-5 fill-tertiary" />
                  <span className="text-xs font-bold text-tertiary">
                    {currentStreak} Ngày
                  </span>
                </div>
              )}
              <div className="flex items-center gap-0.5 bg-secondary-container/30 rounded-full px-1 py-1 ring-1 ring-secondary/20">
                <div className="flex items-center gap-1 px-2.5 py-1 bg-white rounded-full shadow-sm">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">
                    Hiện tại
                  </span>
                  <span className="text-xs font-black text-on-surface">
                    {currentBand?.toFixed(1) ?? "—"}
                  </span>
                  <ChevronsRight className="text-secondary w-4 h-4 mx-0.5" />
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 bg-secondary text-white rounded-full shadow-sm">
                  <span className="text-[10px] font-bold uppercase tracking-tighter opacity-80">
                    Mục tiêu
                  </span>
                  <span className="text-xs font-black">
                    {targetBand.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
