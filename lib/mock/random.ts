// Seedable RNG so demos can be reproducible if desired.
// mulberry32 — tiny, fast, good enough for mock jitter.

let _state = (Date.now() ^ 0x9e3779b9) >>> 0;

export function seed(n: number) {
  _state = n >>> 0;
}

export function rng(): number {
  _state |= 0;
  _state = (_state + 0x6d2b79f5) | 0;
  let t = Math.imul(_state ^ (_state >>> 15), 1 | _state);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** Random integer in [min, max] inclusive. */
export function randInt(min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

/** Random float in [min, max). */
export function randFloat(min: number, max: number): number {
  return rng() * (max - min) + min;
}

/** True with probability p (0..1). */
export function chance(p: number): boolean {
  return rng() < p;
}

/** Pick a random element. */
export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

/** value ± jitterPct (e.g. jitter(100, 0.2) → 80..120). */
export function jitter(value: number, jitterPct: number): number {
  return value * (1 + randFloat(-jitterPct, jitterPct));
}
