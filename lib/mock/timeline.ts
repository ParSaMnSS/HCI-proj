import { randInt } from "./random";

// Mock timings, all tunable in one place so demo pacing is easy to adjust.
// Times are in milliseconds.

export const TIMINGS = {
  /** How long until a driver accepts the request (randomized per run). */
  acceptMs: () => randInt(3000, 11000),
  /** Driver arrival to pickup after accepting. */
  arriveMs: () => randInt(12000, 26000),
  /** Trip duration from pickup to destination. */
  tripMs: () => randInt(16000, 34000),
  /** Grace window after booking where cancel is free. */
  freeCancelMs: 30000,
};

/** Run a stepped timeline; returns a cancel function. */
export function runTimeline(
  steps: { at: number; run: () => void }[],
): () => void {
  const timers = steps.map((s) => setTimeout(s.run, s.at));
  return () => timers.forEach(clearTimeout);
}

/** Smoothly animate a value from→to over duration, calling onTick(progress 0..1). */
export function animate(
  durationMs: number,
  onTick: (t: number) => void,
  onDone?: () => void,
): () => void {
  const start = performance.now();
  let raf = 0;
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / durationMs);
    onTick(t);
    if (t < 1) raf = requestAnimationFrame(tick);
    else onDone?.();
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}
