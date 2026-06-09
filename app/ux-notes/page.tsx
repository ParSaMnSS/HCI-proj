"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft } from "@/components/ui/icons";
import { Toast } from "@/components/ui/Toast";
import { setFaultRate, getFaultRate, forceFault, type FaultKind } from "@/lib/mock/faults";
import { useStore } from "@/lib/store";

type Note = { test: string; problem: string; solution: string };

const NOTES: Note[] = [
  { test: "Test 1", problem: "High error rates & misclicks", solution: "Bigger tap targets (min 48px), one action per screen, generous spacing." },
  { test: "Test 1", problem: "No onboarding for first-time users", solution: "4-step first-run coachmark tour over the real controls." },
  { test: "Test 1", problem: "Confusing pickup selection", solution: "Pickup always shown as an editable address tag; tap to adjust." },
  { test: "Test 1", problem: "Long booking completion", solution: "All ride types, fares and ETAs visible on one screen." },
  { test: "Test 2", problem: "No traffic shown on map", solution: "Route drawn with green/orange/red traffic-coloured segments." },
  { test: "Test 2", problem: "Too little driver info", solution: "Rich driver card: avatar, rating, trips, car, colour & plate." },
  { test: "Test 2", problem: "Inaccurate arrival location", solution: "Live animated driver marker + counting-down ETA per phase." },
  { test: "Test 2", problem: "Inconvenient pickup pin", solution: "Pin defaults to your location with a pulsing, adjustable marker." },
  { test: "Test 3", problem: "Unclear how to add/change card", solution: "Step-by-step add-card form with inline live validation." },
  { test: "Test 3", problem: "Unclear feedback after saving", solution: "Explicit success toast + visible 'Default' badge updates instantly." },
  { test: "Test 3", problem: "Low trust entering card info", solution: "Security banner, lock icon, 'encrypted' copy, masked card display." },
  { test: "Test 4", problem: "Poor error recovery", solution: "Every error explains what happened + offers a clear fix + fallback." },
  { test: "Test 4", problem: "Unclear cancellation warnings", solution: "Cancel dialog shows exact consequence (free window or ₺25 fee)." },
  { test: "Test 4", problem: "Rebooking uncertainty after cancel", solution: "One-tap 'Rebook same trip' shown immediately after cancellation." },
  { test: "Test 5", problem: "No onboarding / recovery", solution: "Shared onboarding tour + consistent recovery dialogs everywhere." },
  { test: "Test 5", problem: "Unclear icons & labels", solution: "Every icon button carries a visible text label. ARIA labels on all." },
  { test: "Test 5", problem: "Confusing navigation", solution: "Linear flow with back buttons and clear status text at every step." },
];

const FAULTS: { kind: FaultKind; label: string; emoji: string }[] = [
  { kind: "no-drivers", label: "No drivers found", emoji: "🚫" },
  { kind: "auth-failed", label: "Payment failed", emoji: "💳" },
  { kind: "gps-weak", label: "Weak GPS", emoji: "📍" },
  { kind: "driver-cancelled", label: "Driver cancels", emoji: "❌" },
];

export default function UxNotesPage() {
  const router = useRouter();
  const showToast = useStore((s) => s.showToast);
  const [rate, setRate] = useState(1);
  useEffect(() => setRate(getFaultRate()), []);

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 340, damping: 34 }}
      className="absolute inset-0 flex flex-col bg-white"
    >
      <Toast />

      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 pb-3"
        style={{ paddingTop: "calc(var(--sat, 0px) + 14px)" }}
      >
        <motion.button
          whileTap={{ scale: 0.9 }}
          aria-label="Back"
          onClick={() => router.back()}
          className="grid h-11 w-11 place-items-center rounded-full bg-chip text-brand"
        >
          <ChevronLeft />
        </motion.button>
        <h1 className="text-xl font-black text-ink">HCI improvements</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-8">
        <p className="mb-4 text-sm text-muted leading-relaxed">
          This prototype keeps BiTaksi's visual identity but addresses every usability problem found across 5 user tests. Each improvement is built into the real flows.
        </p>

        {/* Demo controls */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-3xl border border-hairline p-5"
        >
          <h2 className="text-lg font-black text-ink mb-1">Demo controls</h2>
          <p className="text-sm text-muted mb-4">Force a mock error on the next request to demonstrate the improved recovery flow.</p>

          <div className="grid grid-cols-2 gap-2.5 mb-5">
            {FAULTS.map((f) => (
              <motion.button
                key={f.kind}
                whileTap={{ scale: 0.94 }}
                onClick={() => { forceFault(f.kind); showToast(`Next: ${f.label}`, "warn"); }}
                className="flex items-center gap-2 rounded-2xl bg-chip px-4 py-3.5 text-sm font-bold text-brand"
              >
                <span>{f.emoji}</span> {f.label}
              </motion.button>
            ))}
          </div>

          <p className="mb-2 flex justify-between text-sm font-bold text-ink">
            <span>Random error rate</span>
            <span className="text-brand">{Math.round(rate * 100)}%</span>
          </p>
          <input
            type="range" min={0} max={100} value={Math.round(rate * 100)}
            onChange={(e) => { const r = Number(e.target.value) / 100; setRate(r); setFaultRate(r); }}
            className="w-full h-2 rounded-full accent-[var(--brand)]"
            aria-label="Random error rate"
          />
          <div className="mt-1.5 flex justify-between text-xs text-muted">
            <span>0% always succeeds</span><span>100% always fails</span>
          </div>
        </motion.div>

        {/* Notes grouped by test */}
        {["Test 1", "Test 2", "Test 3", "Test 4", "Test 5"].map((t, ti) => (
          <motion.div
            key={t}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + ti * 0.07 }}
            className="mb-5"
          >
            <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand px-4 py-1.5 text-sm font-black text-cream">
              {t}
            </span>
            <div className="space-y-2.5">
              {NOTES.filter((n) => n.test === t).map((n, i) => (
                <div key={i} className="rounded-2xl border border-hairline p-4">
                  <p className="text-sm font-bold text-alert">✕ {n.problem}</p>
                  <p className="mt-1.5 text-sm font-bold text-green">✓ {n.solution}</p>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
