"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeft } from "@/components/ui/icons";
import { Toast } from "@/components/ui/Toast";
import {
  setFaultRate,
  getFaultRate,
  forceFault,
  type FaultKind,
} from "@/lib/mock/faults";
import { useStore } from "@/lib/store";

type Note = { test: string; problem: string; solution: string };

const NOTES: Note[] = [
  { test: "Test 1", problem: "High error rates & misclicks", solution: "Bigger tap targets, one primary action per screen, generous spacing." },
  { test: "Test 1", problem: "No onboarding for first-time users", solution: "4-step first-run coachmark tour over the real controls." },
  { test: "Test 1", problem: "Confusing pickup selection", solution: "Pickup is always shown as an editable tag; tap to adjust on map." },
  { test: "Test 1", problem: "Long booking completion", solution: "All ride types, fares and ETAs visible on one screen." },
  { test: "Test 2", problem: "No traffic shown on map", solution: "Route drawn with green/orange/red traffic-coloured segments." },
  { test: "Test 2", problem: "Too little driver info", solution: "Rich driver card: photo, rating, trips, car, colour & plate." },
  { test: "Test 2", problem: "Inaccurate arrival location", solution: "Live animated driver marker + counting-down ETA." },
  { test: "Test 2", problem: "Inconvenient pickup pin", solution: "Pin defaults to your location with a pulsing, draggable marker." },
  { test: "Test 3", problem: "Unclear how to add/change card", solution: "Clear step-by-step add-card form with inline validation." },
  { test: "Test 3", problem: "Unclear feedback after saving", solution: "Explicit success toast + visible ‘Default’ badge updates." },
  { test: "Test 3", problem: "Low trust entering card info", solution: "Security banner, lock icon & ‘encrypted’ copy; masked numbers." },
  { test: "Test 4", problem: "Poor error recovery", solution: "Every error offers a clear primary fix + a fallback action." },
  { test: "Test 4", problem: "Unclear warnings", solution: "Cancel dialog states the exact consequence (fee / free window)." },
  { test: "Test 4", problem: "Rebooking uncertainty", solution: "One-tap ‘Rebook same trip’ after a cancellation." },
  { test: "Test 5", problem: "No onboarding / recovery", solution: "Shared onboarding + consistent recovery dialogs everywhere." },
  { test: "Test 5", problem: "Unclear icons & labels", solution: "Every icon button carries a visible text label." },
  { test: "Test 5", problem: "Confusing navigation", solution: "Linear flow with back buttons and clear status at every step." },
];

const FAULTS: { kind: FaultKind; label: string }[] = [
  { kind: "no-drivers", label: "No drivers found" },
  { kind: "auth-failed", label: "Payment / auth failed" },
  { kind: "gps-weak", label: "Weak GPS signal" },
  { kind: "driver-cancelled", label: "Driver cancels" },
];

export default function UxNotesPage() {
  const router = useRouter();
  const showToast = useStore((s) => s.showToast);
  const [rate, setRate] = useState(1);

  useEffect(() => setRate(getFaultRate()), []);

  return (
    <div className="absolute inset-0 flex flex-col bg-surface">
      <Toast />
      <div className="flex items-center gap-2 px-3 pt-3 pb-1">
        <button
          aria-label="Back"
          onClick={() => router.back()}
          className="grid h-10 w-10 place-items-center rounded-full text-brand"
        >
          <ChevronLeft />
        </button>
        <h1 className="text-xl font-black text-ink">HCI improvements</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <p className="mt-1 text-sm text-muted">
          This prototype keeps BiTaksi’s look but fixes the usability problems
          found in 5 user tests. Below: every problem → how this build solves it.
        </p>

        {/* demo controls */}
        <div className="mt-4 rounded-2xl border border-hairline p-4">
          <h2 className="font-black text-ink">Demo controls</h2>
          <p className="mt-1 text-sm text-muted">
            Force a mock error on your next ride request to show the improved
            recovery flow, or tune how often random errors happen.
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {FAULTS.map((f) => (
              <button
                key={f.kind}
                onClick={() => {
                  forceFault(f.kind);
                  showToast(`Next request will trigger: ${f.label}`, "warn");
                }}
                className="rounded-xl bg-chip px-3 py-2.5 text-sm font-bold text-brand"
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="mt-4">
            <div className="mb-1 flex justify-between text-sm font-bold text-ink">
              <span>Random error rate</span>
              <span>{Math.round(rate * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(rate * 100)}
              onChange={(e) => {
                const r = Number(e.target.value) / 100;
                setRate(r);
                setFaultRate(r);
              }}
              className="w-full accent-[var(--brand)]"
              aria-label="Random error rate"
            />
            <div className="mt-1 flex justify-between text-xs text-muted">
              <span>0% — always succeeds</span>
              <span>100% — always fails</span>
            </div>
          </div>

          <p className="mt-3 text-xs text-muted">
            Acceptance time is also randomized (≈3–11s) on every request, so each
            run feels live.
          </p>
        </div>

        {/* notes grouped by test */}
        {["Test 1", "Test 2", "Test 3", "Test 4", "Test 5"].map((t) => (
          <div key={t} className="mt-5">
            <h3 className="mb-2 inline-block rounded-full bg-brand px-3 py-1 text-sm font-black text-cream">
              {t}
            </h3>
            <div className="space-y-2">
              {NOTES.filter((n) => n.test === t).map((n, i) => (
                <div key={i} className="rounded-2xl border border-hairline p-3">
                  <p className="text-sm font-bold text-alert">✗ {n.problem}</p>
                  <p className="mt-1 text-sm font-bold text-green">✓ {n.solution}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
