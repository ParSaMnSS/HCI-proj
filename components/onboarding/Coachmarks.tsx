"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/Button";

// First-run onboarding overlay (UX improvement: BiTaksi has none).
// Walks first-time users through the 4 key controls with plain-language tips.
const STEPS = [
  {
    sel: "search",
    title: "1 · Set where you’re going",
    body: "Tap here to search a destination, pick a saved place, or choose it on the map.",
  },
  {
    sel: "pickup",
    title: "2 · Check your pickup",
    body: "This is where your taxi will meet you. Tap it any time to adjust the exact spot.",
  },
  {
    sel: "rides",
    title: "3 · Pick a ride & see the price",
    body: "Every ride type shows its fare and arrival time up front — no surprises.",
  },
  {
    sel: "request",
    title: "4 · Request your bitaksi",
    body: "One tap to book. You can cancel free for the first 30 seconds if you change your mind.",
  },
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
    <div className="absolute inset-0 z-[70] bg-black/55 animate-fade">
      <div className="absolute inset-x-5 top-1/2 -translate-y-1/2 rounded-3xl bg-surface p-6 shadow-2xl animate-pop">
        <div className="mb-3 flex gap-1.5">
          {STEPS.map((_, idx) => (
            <span
              key={idx}
              className={`h-1.5 flex-1 rounded-full ${idx <= i ? "bg-brand" : "bg-hairline"}`}
            />
          ))}
        </div>
        <h2 className="text-xl font-black text-ink">{step.title}</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">{step.body}</p>
        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            onClick={finish}
            className="text-sm font-bold text-muted underline"
          >
            Skip tour
          </button>
          <Button onClick={() => (last ? finish() : setI(i + 1))} className="px-6 py-3 text-base">
            {last ? "Got it" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
