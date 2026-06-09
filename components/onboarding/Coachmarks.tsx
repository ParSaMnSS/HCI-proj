"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";

const STEPS: { coach: string; label: string }[] = [
  { coach: "search",  label: "Tap here to enter your destination" },
  { coach: "addcard", label: "Add a payment card before booking" },
  { coach: "request", label: "Tap here to confirm and book your ride" },
];

interface Rect { top: number; left: number; width: number; height: number }

function getCoachRect(coach: string): Rect | null {
  const el = document.querySelector(`[data-coach="${coach}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

const PAD    = 10;   // spotlight cutout padding
const RADIUS = 18;
const BUBBLE_MARGIN = 14;    // gap between spotlight edge and bubble
const SCREEN_EDGE   = 16;    // min distance from screen edge

export function Spotlight() {
  const onboarded = useStore((s) => s.onboarded);
  const finish    = useStore((s) => s.finishOnboarding);

  const [step, setStep]       = useState(0);
  const [rect, setRect]       = useState<Rect | null>(null);
  const [vh, setVh]           = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setVh(window.innerHeight);
  }, []);

  useLayoutEffect(() => {
    if (!mounted || onboarded) return;
    setVh(window.innerHeight);
    const r = getCoachRect(STEPS[step].coach);
    setRect(r);
  }, [step, mounted, onboarded]);

  if (!mounted || onboarded) return null;

  function advance() {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else finish();
  }

  const label  = STEPS[step].label;
  const isLast = step === STEPS.length - 1;

  // Decide whether bubble goes above or below the spotlight cutout.
  // "Below" is preferred; switch to "above" if the target is in the lower 55%
  // of the screen (so there's enough room above it).
  let bubbleStyle: React.CSSProperties = { top: "40%" }; // fallback: center-ish

  if (rect && vh > 0) {
    const cutoutBottom = rect.top + rect.height + PAD;
    const cutoutTop    = rect.top - PAD;
    const spaceBelow   = vh - cutoutBottom;
    const spaceAbove   = cutoutTop;
    // Estimated bubble height: ~120px (card) + 32px (skip) + 12px (gap)
    const BUBBLE_H = 164;

    if (spaceBelow >= BUBBLE_H + BUBBLE_MARGIN + SCREEN_EDGE) {
      // Plenty of room below — place it below
      const top = Math.min(
        cutoutBottom + BUBBLE_MARGIN,
        vh - BUBBLE_H - SCREEN_EDGE,
      );
      bubbleStyle = { top };
    } else {
      // Not enough room below — place it above
      const bottom = Math.min(
        vh - cutoutTop + BUBBLE_MARGIN,
        vh - SCREEN_EDGE,
      );
      bubbleStyle = { bottom };
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        key={step}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        className="absolute inset-0 z-[90] pointer-events-auto"
        onClick={advance}
        aria-label="Onboarding overlay"
      >
        {/* Dark overlay with spotlight cutout */}
        <svg className="absolute inset-0 w-full h-full" style={{ display: "block" }}>
          <defs>
            <mask id="spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {rect && (
                <rect
                  x={rect.left - PAD}
                  y={rect.top - PAD}
                  width={rect.width + PAD * 2}
                  height={rect.height + PAD * 2}
                  rx={RADIUS} ry={RADIUS}
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect x="0" y="0" width="100%" height="100%"
            fill="rgba(15,10,45,0.80)" mask="url(#spotlight-mask)" />
          {rect && (
            <rect
              x={rect.left - PAD} y={rect.top - PAD}
              width={rect.width + PAD * 2} height={rect.height + PAD * 2}
              rx={RADIUS} ry={RADIUS}
              fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"
            />
          )}
        </svg>

        {/* Label bubble — positioned to always stay fully on screen */}
        <motion.div
          key={`label-${step}`}
          initial={{ opacity: 0, scale: 0.93 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.93 }}
          transition={{ type: "spring", stiffness: 320, damping: 26, delay: 0.08 }}
          className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
          style={{
            ...bubbleStyle,
            width: "calc(100% - 40px)",
            maxWidth: 340,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-full rounded-3xl bg-white px-5 py-4 shadow-2xl">
            {/* Step progress dots */}
            <div className="mb-3 flex gap-1.5">
              {STEPS.map((_, i) => (
                <motion.span
                  key={i}
                  animate={{ width: i === step ? "1.75rem" : "0.5rem" }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                  className="h-1.5 rounded-full"
                  style={{
                    background: i <= step ? "var(--brand)" : "var(--hairline)",
                    display: "block",
                  }}
                />
              ))}
            </div>
            <p className="text-[15px] font-extrabold leading-snug text-ink">{label}</p>
            <p className="mt-1 text-[12px] font-semibold text-muted">
              {isLast ? "Tap anywhere to finish" : "Tap anywhere to continue"}
            </p>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); finish(); }}
            className="text-xs font-bold text-white/60 underline underline-offset-2"
          >
            Skip tutorial
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
