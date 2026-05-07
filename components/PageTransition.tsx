"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

const EASE = [0.22, 1, 0.36, 1] as const;

const variants = {
  hidden: { opacity: 0, y: 14, filter: "blur(4px)" },
  enter: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.32, ease: EASE },
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: "blur(3px)",
    transition: { duration: 0.2, ease: EASE },
  },
};


export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        variants={variants}
        initial="hidden"
        animate="enter"
        exit="exit"
        className="h-full w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
