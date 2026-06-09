// Demo control registry — add new controls here without touching the UI page.
// Each control is either a "button" (one-shot action) or a "slider" (numeric value)
// or a "toggle" (boolean). The ux-notes page renders whatever is registered here.

import { forceFault, setFaultRate, getFaultRate, type FaultKind } from "@/lib/mock/faults";

export type DemoButton = {
  type: "button";
  id: string;
  label: string;
  emoji: string;
  description: string;
  action: () => void;
};

export type DemoSlider = {
  type: "slider";
  id: string;
  label: string;
  description: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  getValue: () => number;
  setValue: (v: number) => void;
};

export type DemoToggle = {
  type: "toggle";
  id: string;
  label: string;
  description: string;
  getValue: () => boolean;
  setValue: (v: boolean) => void;
};

export type DemoControl = DemoButton | DemoSlider | DemoToggle;

// ── Fault buttons ──────────────────────────────────────────────────────────
const FAULT_BUTTONS: DemoButton[] = (
  [
    { kind: "no-drivers" as FaultKind, label: "No drivers found", emoji: "🚫", description: "Next request returns zero available drivers." },
    { kind: "auth-failed" as FaultKind, label: "Payment failed", emoji: "💳", description: "Next request triggers a payment auth failure." },
    { kind: "gps-weak" as FaultKind, label: "Weak GPS", emoji: "📍", description: "Next request shows the GPS accuracy warning." },
    { kind: "driver-cancelled" as FaultKind, label: "Driver cancels", emoji: "❌", description: "Driver accepts then cancels mid-way to pickup." },
  ] as { kind: FaultKind; label: string; emoji: string; description: string }[]
).map(({ kind, label, emoji, description }) => ({
  type: "button" as const,
  id: `fault-${kind}`,
  label,
  emoji,
  description,
  action: () => forceFault(kind),
}));

// ── Error rate slider ──────────────────────────────────────────────────────
const ERROR_RATE_SLIDER: DemoSlider = {
  type: "slider",
  id: "error-rate",
  label: "Random error rate",
  description: "0% = always succeeds. 100% = always fails. Default 15%.",
  min: 0,
  max: 100,
  step: 1,
  unit: "%",
  getValue: () => Math.round(getFaultRate() * 100),
  setValue: (v: number) => setFaultRate(v / 100),
};

// ── Master registry ────────────────────────────────────────────────────────
// Add new controls to this array — they'll appear automatically in the UI.
export const DEMO_CONTROLS: DemoControl[] = [
  ...FAULT_BUTTONS,
  ERROR_RATE_SLIDER,
  // Add more controls here, e.g.:
  // { type: "toggle", id: "show-traffic", label: "Show traffic colours", ... },
  // { type: "slider", id: "driver-speed", label: "Driver speed multiplier", ... },
];
