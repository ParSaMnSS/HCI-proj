"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/Button";

const STEPS = [
  { title: "1 · Set your destination", body: "Tap here to search a place, pick a recent, or choose it on the map." },
  { title: "2 · Check your pickup", body: "Tap the address tag on the map to adjust exactly where your taxi meets you." },
  { title: "3 · Pick a ride type", body: "All types show their fare and arrival time right here — no surprises." },
  { title: "4 · Request your bitaksi", body: "One tap to book. Cancel free within the first 30 seconds if you change your mind." },
];

export function Coachmarks() {
  const onboarded = useStore((s) => s.onboarded);
  const finish = useStore((s) => s.finishOnboarding);
  const [i, setI] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted || onboarded) return null;

  const step = STEPS[i];
  const last = i === STEPS.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-[70] flex items-center justify-center px-5"
      style={{ background: "rgba(20,15,55,0.65)" }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        className="w-full max-w-[360px] rounded-3xl bg-white p-7 shadow-2xl"
      >
        {/* Progress dots */}
        <div className="mb-5 flex gap-2">
          {STEPS.map((_, idx) => (
            <motion.span
              key={idx}
              animate={{ width: idx === i ? "2.5rem" : "0.5rem" }}
              className="h-2 rounded-full bg-brand/20"
              style={{ backgroundColor: idx <= i ? "var(--brand)" : undefined }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-2xl font-black text-ink">{step.title}</h2>
            <p className="mt-3 text-base leading-relaxed text-muted">{step.body}</p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-7 flex items-center justify-between gap-4">
          <button onClick={finish} className="text-sm font-bold text-muted underline">
            Skip tour
          </button>
          <Button onClick={() => last ? finish() : setI(i + 1)}>
            {last ? "Got it!" : "Next →"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
