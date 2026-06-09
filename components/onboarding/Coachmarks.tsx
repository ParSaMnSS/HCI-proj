"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";

const STEPS: { coach: string; label: string }[] = [
  { coach: "search",  label: "Tap here to enter your destination" },
  { coach: "addcard", label: "Add a payment card before booking" },
  { coach: "request", label: "Tap here to book your ride" },
];

interface Rect { top: number; left: number; width: number; height: number }

function getCoachRect(coach: string): Rect | null {
  const el = document.querySelector(`[data-coach="${coach}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

const PAD    = 8;
const RADIUS = 16;
const GAP    = 10; // gap between cutout edge and tooltip arrow tip

export function Spotlight() {
  const onboarded = useStore((s) => s.onboarded);
  const finish    = useStore((s) => s.finishOnboarding);

  const [step, setStep]       = useState(0);
  const [rect, setRect]       = useState<Rect | null>(null);
  const [vh, setVh]           = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); setVh(window.innerHeight); }, []);

  useLayoutEffect(() => {
    if (!mounted || onboarded) return;
    setVh(window.innerHeight);
    setRect(getCoachRect(STEPS[step].coach));
  }, [step, mounted, onboarded]);

  if (!mounted || onboarded) return null;

  function advance() {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else finish();
  }

  const label  = STEPS[step].label;
  const isLast = step === STEPS.length - 1;

  // Decide if tooltip sits above or below the cutout
  const cutoutBottom = rect ? rect.top + rect.height + PAD : 0;
  const cutoutTop    = rect ? rect.top - PAD : 0;
  const spaceBelow   = vh - cutoutBottom;
  const above        = spaceBelow < 90; // not enough room below → flip above

  // Horizontal center of the spotlight target, clamped so tooltip stays on screen
  const tooltipCenterX = rect
    ? Math.min(Math.max(rect.left + rect.width / 2, 120), (typeof window !== "undefined" ? window.innerWidth : 400) - 120)
    : 200;

  // Arrow tip Y position (where the arrow points)
  const arrowTipY = above ? cutoutTop - GAP : cutoutBottom + GAP;

  // Tooltip box top (below) or bottom (above)
  const ARROW_H = 8;
  const tooltipTop    = above ? undefined : arrowTipY + ARROW_H;
  const tooltipBottom = above ? vh - arrowTipY + ARROW_H : undefined;

  return (
    <AnimatePresence>
      <motion.div
        key={step}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 z-[90] pointer-events-auto"
        onClick={advance}
        aria-label="Onboarding overlay"
      >
        {/* Dark overlay with cutout */}
        <svg className="absolute inset-0 w-full h-full" style={{ display: "block" }}>
          <defs>
            <mask id="spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {rect && (
                <rect
                  x={rect.left - PAD} y={rect.top - PAD}
                  width={rect.width + PAD * 2} height={rect.height + PAD * 2}
                  rx={RADIUS} ry={RADIUS} fill="black"
                />
              )}
            </mask>
          </defs>
          <rect x="0" y="0" width="100%" height="100%"
            fill="rgba(15,10,45,0.78)" mask="url(#spotlight-mask)" />
          {rect && (
            <rect
              x={rect.left - PAD} y={rect.top - PAD}
              width={rect.width + PAD * 2} height={rect.height + PAD * 2}
              rx={RADIUS} ry={RADIUS}
              fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5"
            />
          )}
        </svg>

        {/* Tooltip pill — points at the spotlight target */}
        <motion.div
          key={`tip-${step}`}
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.88 }}
          transition={{ type: "spring", stiffness: 340, damping: 26, delay: 0.08 }}
          className="absolute pointer-events-auto"
          style={{
            left: tooltipCenterX,
            transform: "translateX(-50%)",
            ...(tooltipTop    !== undefined ? { top: tooltipTop }       : {}),
            ...(tooltipBottom !== undefined ? { bottom: tooltipBottom } : {}),
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Arrow pointing toward the element */}
          <span
            style={{
              display: "block",
              width: 0,
              height: 0,
              margin: "0 auto",
              borderStyle: "solid",
              ...(above
                // arrow points DOWN (tooltip is above the element)
                ? { borderWidth: "8px 7px 0 7px", borderColor: "var(--brand) transparent transparent transparent" }
                // arrow points UP (tooltip is below the element)
                : { borderWidth: "0 7px 8px 7px", borderColor: "transparent transparent var(--brand) transparent" }
              ),
            }}
          />

          {/* Pill bubble */}
          <div
            className="flex items-center gap-2 rounded-2xl px-4 py-2.5 shadow-lg"
            style={{ background: "var(--brand)", whiteSpace: "nowrap" }}
          >
            {/* Step dots */}
            <div className="flex items-center gap-1 shrink-0">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  style={{
                    display: "block",
                    width: i === step ? 18 : 6,
                    height: 6,
                    borderRadius: 9999,
                    background: i <= step ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.3)",
                    transition: "width 0.25s",
                  }}
                />
              ))}
            </div>

            <span className="text-[13px] font-bold text-white leading-tight">{label}</span>

            <button
              onClick={(e) => { e.stopPropagation(); finish(); }}
              className="shrink-0 grid h-5 w-5 place-items-center rounded-full bg-white/25 text-white text-[11px] font-black ml-1"
              aria-label="Skip tutorial"
            >
              ×
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
