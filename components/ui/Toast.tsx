"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { CheckIcon, AlertIcon } from "./icons";

export function Toast() {
  const toast = useStore((s) => s.toast);
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: -16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className="pointer-events-none absolute inset-x-4 z-[60] flex justify-center"
          style={{ top: "calc(var(--sat, 0px) + 12px)" }}
          role="status"
        >
          <div
            className="flex items-center gap-2.5 rounded-2xl px-5 py-3.5 text-sm font-bold text-white shadow-xl"
            style={{ background: toast.tone === "ok" ? "var(--green)" : "var(--alert)" }}
          >
            {toast.tone === "ok" ? <CheckIcon size={17} /> : <AlertIcon size={17} />}
            {toast.msg}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
