"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";

export type TipId = "search" | "addcard" | "request";

const TIP_TEXT: Record<TipId, string> = {
  search:  "Tap here to enter your destination",
  addcard: "Add a payment card here",
  request: "Tap to book your ride",
};

interface TooltipProps {
  text: string;
  side?: "top" | "bottom";
  onDismiss: () => void;
}

function Tooltip({ text, side = "bottom", onDismiss }: TooltipProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.88, y: side === "bottom" ? -4 : 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.88, y: side === "bottom" ? -4 : 4 }}
      transition={{ type: "spring", stiffness: 340, damping: 24 }}
      className="absolute z-[80] pointer-events-auto"
      style={{
        ...(side === "bottom"
          ? { top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)" }
          : { bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)" }),
        width: "max-content",
        maxWidth: 210,
      }}
    >
      {/* Arrow pointing up toward the element (for bottom tooltip) */}
      <span
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          borderStyle: "solid",
          ...(side === "bottom"
            ? { bottom: "100%", borderWidth: "0 6px 7px 6px", borderColor: "transparent transparent var(--brand) transparent" }
            : { top: "100%",    borderWidth: "7px 6px 0 6px",   borderColor: "var(--brand) transparent transparent transparent" }),
        }}
      />
      <div
        className="flex items-center gap-2 rounded-2xl px-3 py-2 shadow-lg"
        style={{ background: "var(--brand)" }}
      >
        <span className="text-[12px] font-bold leading-snug text-white">{text}</span>
        <button
          onClick={onDismiss}
          className="shrink-0 grid h-5 w-5 place-items-center rounded-full bg-white/25 text-white text-[11px] font-black"
          aria-label="Dismiss tip"
        >
          ×
        </button>
      </div>
    </motion.div>
  );
}

export function TipAnchor({
  id,
  side = "bottom",
  children,
}: {
  id: TipId;
  side?: "top" | "bottom";
  children: React.ReactNode;
}) {
  const onboarded     = useStore((s) => s.onboarded);
  const dismissedTips = useStore((s) => s.dismissedTips);
  const dismissTip    = useStore((s) => s.dismissTip);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const visible = mounted && !onboarded && !dismissedTips.includes(id);

  return (
    <div className="relative">
      {children}
      <AnimatePresence>
        {visible && (
          <Tooltip
            text={TIP_TEXT[id]}
            side={side}
            onDismiss={() => dismissTip(id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
