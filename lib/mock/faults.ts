import { chance } from "./random";

// Configurable random error injection. This is what lets the prototype
// *demonstrate* the improved error-recovery UX (vs BiTaksi's terse dialogs).
// The UX Notes page exposes a control to force a fault or set rate to 0/100%.

export type FaultKind =
  | "no-drivers" // no taxi accepted the request
  | "auth-failed" // payment/auth failure (matches BiTaksi screenshot)
  | "gps-weak" // could not get accurate location
  | "driver-cancelled"; // driver cancelled after accepting

type FaultConfig = {
  /** Master multiplier: 0 disables all faults, 1 = base rates. */
  rate: number;
  /** Force the next relevant request to fail with this fault, then clear. */
  force: FaultKind | null;
  /** Base probability per fault kind (before multiplier). */
  base: Record<FaultKind, number>;
};

const config: FaultConfig = {
  rate: 1,
  force: null,
  base: {
    "no-drivers": 0.15,
    "auth-failed": 0.1,
    "gps-weak": 0.08,
    "driver-cancelled": 0.07,
  },
};

export function setFaultRate(rate: number) {
  config.rate = Math.max(0, Math.min(1, rate));
}

export function getFaultRate() {
  return config.rate;
}

export function forceFault(kind: FaultKind | null) {
  config.force = kind;
}

export function getForcedFault() {
  return config.force;
}

/**
 * Roll for a fault of one of the given kinds. Honors a forced fault first,
 * then base probability × master rate. Returns the kind that fired, or null.
 */
export function rollFault(...kinds: FaultKind[]): FaultKind | null {
  if (config.force && kinds.includes(config.force)) {
    const k = config.force;
    config.force = null;
    return k;
  }
  for (const k of kinds) {
    if (chance(config.base[k] * config.rate)) return k;
  }
  return null;
}

export const FAULT_COPY: Record<
  FaultKind,
  { title: string; message: string; primary: string; secondary?: string }
> = {
  "no-drivers": {
    title: "No drivers nearby right now",
    message:
      "All taxis around you are busy. We can keep searching, or you can try a different ride type.",
    primary: "Keep searching",
    secondary: "Change ride type",
  },
  "auth-failed": {
    title: "Payment couldn’t be verified",
    message:
      "We couldn’t confirm your payment method. Your card was not charged. Try again or pick another card.",
    primary: "Try again",
    secondary: "Use another card",
  },
  "gps-weak": {
    title: "We’re not sure where you are",
    message:
      "Your location signal is weak, so your pickup pin may be off. Set it on the map to be sure.",
    primary: "Set pickup on map",
    secondary: "Retry location",
  },
  "driver-cancelled": {
    title: "Your driver had to cancel",
    message:
      "Sorry about that — it happens. We’ll find you another nearby driver right away.",
    primary: "Find another driver",
    secondary: "Cancel request",
  },
};
