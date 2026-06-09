"use client";

// Persistent in-ride status bar — shows the current phase as a slim banner
// at the top of pages that need real-time status context.

import { motion, AnimatePresence } from "framer-motion";

type StatusBarProps = {
  message: string;
  tone?: "brand" | "green" | "alert" | "warn";
  visible: boolean;
};

const BG: Record<string, string> = {
  brand: "var(--brand)",
  green: "var(--green)",
  alert: "var(--alert)",
  warn: "#b45309",
};

export function StatusBar({ message, tone = "brand", visible }: StatusBarProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 36 }}
          style={{ background: BG[tone], overflow: "hidden" }}
          className="w-full"
        >
          <p className="px-4 py-2 text-center text-xs font-bold text-white tracking-wide">
            {message}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
