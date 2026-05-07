"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export function NavProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (pathname !== prevPathname.current) {
      // New navigation — animate to 100% then hide
      setProgress(100);
      timerRef.current = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 400);
      prevPathname.current = pathname;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Expose a start function via a click listener on all <a> tags
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http")) return;

      // Start progress bar
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
      setVisible(true);
      setProgress(10);

      // Simulate incremental progress
      let p = 10;
      intervalRef.current = setInterval(() => {
        p += Math.random() * 15;
        if (p >= 85) {
          p = 85;
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
        setProgress(p);
      }, 150);
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none fixed left-0 top-0 z-[9999] h-0.5"
      style={{
        width: `${progress}%`,
        transition: progress === 100 ? "width 200ms ease, opacity 300ms ease 200ms" : "width 200ms ease",
        opacity: progress === 100 ? 0 : 1,
        background: "linear-gradient(90deg, #0d9488, #1a3a5c)",
        boxShadow: "0 0 8px rgba(13,148,136,0.6)",
      }}
    />
  );
}
