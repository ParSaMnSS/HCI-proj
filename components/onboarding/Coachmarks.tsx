"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";

// Each step: which element to spotlight (by data-coach attr) + the label shown
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

export function Spotlight() {
  const onboarded = useStore((s) => s.onboarded);
  const finish    = useStore((s) => s.finishOnboarding);

  const [step, setStep]       = useState(0);
  const [rect, setRect]       = useState<Rect | null>(null);
  const [mounted, setMounted] = useState(false);

  // Measure target element whenever step changes
  useEffect(() => { setMounted(true); }, []);

  useLayoutEffect(() => {
    if (!mounted || onboarded) return;
    const r = getCoachRect(STEPS[step].coach);
    setRect(r);
  }, [step, mounted, onboarded]);

  if (!mounted || onboarded) return null;

  const PAD = 10; // padding around the spotlight cutout (px)
  const RADIUS = 18;

  function advance() {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      finish();
    }
  }

  const label = STEPS[step].label;
  const isLast = step === STEPS.length - 1;

  // Position the label bubble: below the cutout if there's room, otherwise above
  const bubbleTop = rect
    ? rect.top + rect.height + PAD + 14
    : "50%";

  return (
    <AnimatePresence>
      <motion.div
        key={step}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="absolute inset-0 z-[90] pointer-events-auto"
        onClick={advance}
        aria-label="Onboarding overlay"
      >
        {/* SVG overlay with a rectangular cutout for the spotlight */}
        <svg
          className="absolute inset-0 w-full h-full"
          style={{ display: "block" }}
        >
          <defs>
            <mask id="spotlight-mask">
              {/* White = visible (dark overlay shows) */}
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {/* Black = transparent (punches hole) */}
              {rect && (
                <rect
                  x={rect.left - PAD}
                  y={rect.top - PAD}
                  width={rect.width + PAD * 2}
                  height={rect.height + PAD * 2}
                  rx={RADIUS}
                  ry={RADIUS}
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            x="0" y="0" width="100%" height="100%"
            fill="rgba(15,10,45,0.78)"
            mask="url(#spotlight-mask)"
          />
          {/* Soft glow border around the cutout */}
          {rect && (
            <rect
              x={rect.left - PAD}
              y={rect.top - PAD}
              width={rect.width + PAD * 2}
              height={rect.height + PAD * 2}
              rx={RADIUS}
              ry={RADIUS}
              fill="none"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="1.5"
            />
          )}
        </svg>

        {/* Label bubble */}
        <motion.div
          key={`label-${step}`}
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 320, damping: 26, delay: 0.1 }}
          className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
          style={{ top: bubbleTop, width: "calc(100% - 48px)", maxWidth: 320 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-full rounded-3xl bg-white px-5 py-4 shadow-2xl">
            {/* Step dots */}
            <div className="mb-3 flex gap-1.5">
              {STEPS.map((_, i) => (
                <motion.span
                  key={i}
                  animate={{ width: i === step ? "1.75rem" : "0.5rem" }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                  className="h-1.5 rounded-full"
                  style={{ background: i <= step ? "var(--brand)" : "var(--hairline)", display: "block" }}
                />
              ))}
            </div>
            <p className="text-[15px] font-extrabold leading-snug text-ink">{label}</p>
            <p className="mt-1 text-[12px] text-muted font-semibold">
              {isLast ? "Tap anywhere to finish" : "Tap anywhere to continue"}
            </p>
          </div>

          {/* Skip link */}
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
