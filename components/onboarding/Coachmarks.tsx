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
const GAP    = 10;     // gap between cutout edge and tooltip arrow tip
const ARROW_H = 8;

// Shared easing for the spotlight glide
const GLIDE = { type: "spring" as const, stiffness: 260, damping: 30, mass: 0.9 };

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

  const label = STEPS[step].label;

  // Cutout geometry (animated targets)
  const cutX = rect ? rect.left - PAD : 0;
  const cutY = rect ? rect.top - PAD : 0;
  const cutW = rect ? rect.width + PAD * 2 : 0;
  const cutH = rect ? rect.height + PAD * 2 : 0;

  // Decide if tooltip sits above or below the cutout
  const cutoutBottom = cutY + cutH;
  const cutoutTop    = cutY;
  const spaceBelow   = vh - cutoutBottom;
  // Flip above when there isn't enough room below for the full tooltip
  // (~50px tooltip + arrow + screen-edge clearance)
  const above        = spaceBelow < 120;

  const winW = typeof window !== "undefined" ? window.innerWidth : 400;
  const tooltipCenterX = rect
    ? Math.min(Math.max(rect.left + rect.width / 2, 120), winW - 120)
    : 200;

  const arrowTipY = above ? cutoutTop - GAP : cutoutBottom + GAP;
  const tooltipTop    = above ? undefined : arrowTipY + ARROW_H;
  const tooltipBottom = above ? vh - arrowTipY + ARROW_H : undefined;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[90]"
      aria-label="Onboarding overlay"
    >
      {/* Dark overlay with an animated spotlight cutout (purely visual) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ display: "block" }}
      >
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {rect && (
              <motion.rect
                initial={false}
                animate={{ x: cutX, y: cutY, width: cutW, height: cutH }}
                transition={GLIDE}
                rx={RADIUS} ry={RADIUS} fill="black"
              />
            )}
          </mask>
        </defs>
        <rect x="0" y="0" width="100%" height="100%"
          fill="rgba(15,10,45,0.78)" mask="url(#spotlight-mask)" />
        {rect && (
          <motion.rect
            initial={false}
            animate={{ x: cutX, y: cutY, width: cutW, height: cutH }}
            transition={GLIDE}
            rx={RADIUS} ry={RADIUS}
            fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5"
          />
        )}
      </svg>

      {/* Full-screen transparent click-catcher — advances on tap anywhere */}
      <button
        type="button"
        onClick={advance}
        aria-label="Continue tutorial"
        className="absolute inset-0 h-full w-full cursor-pointer"
        style={{ background: "transparent", border: 0 }}
      />

      {/* Tooltip pill — glides to point at the active spotlight target.
          pointer-events-none on the wrapper so taps anywhere (even over the
          pill's inflated bounding box) fall through to the click-catcher.
          Only the visible pill + × button re-enable pointer events. */}
      <motion.div
        initial={false}
        animate={{
          left: tooltipCenterX,
          ...(tooltipTop    !== undefined ? { top: tooltipTop }       : {}),
          ...(tooltipBottom !== undefined ? { bottom: tooltipBottom } : {}),
        }}
        transition={GLIDE}
        className="absolute z-10 pointer-events-none"
        style={{ transform: "translateX(-50%)" }}
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
              ? { borderWidth: "8px 7px 0 7px", borderColor: "var(--brand) transparent transparent transparent" }
              : { borderWidth: "0 7px 8px 7px", borderColor: "transparent transparent var(--brand) transparent" }
            ),
          }}
        />

        {/* Pill bubble — text cross-fades on step change. Tapping the pill
            itself also advances (so it's never a dead zone). */}
        <div
          onClick={advance}
          className="flex items-center gap-2 rounded-2xl px-4 py-2.5 shadow-lg pointer-events-auto cursor-pointer"
          style={{ background: "var(--brand)", whiteSpace: "nowrap" }}
        >
          {/* Step dots */}
          <div className="flex items-center gap-1 shrink-0">
            {STEPS.map((_, i) => (
              <motion.span
                key={i}
                animate={{ width: i === step ? 18 : 6 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                style={{
                  display: "block",
                  height: 6,
                  borderRadius: 9999,
                  background: i <= step ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.3)",
                }}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.span
              key={step}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className="text-[13px] font-bold text-white leading-tight"
            >
              {label}
            </motion.span>
          </AnimatePresence>

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
  );
}
