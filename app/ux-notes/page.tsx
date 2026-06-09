"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "@/components/ui/icons";
import { Toast } from "@/components/ui/Toast";
import { useStore } from "@/lib/store";
import { DEMO_CONTROLS, type DemoButton, type DemoSlider, type DemoToggle } from "@/lib/demo/controls";

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

// Split controls by type for rendering
const buttonControls = DEMO_CONTROLS.filter((c): c is DemoButton => c.type === "button");
const sliderControls = DEMO_CONTROLS.filter((c): c is DemoSlider => c.type === "slider");
const toggleControls = DEMO_CONTROLS.filter((c): c is DemoToggle => c.type === "toggle");

export default function UxNotesPage() {
  const router = useRouter();
  const showToast = useStore((s) => s.showToast);

  // Slider values — hydrated from each slider's getValue()
  const [sliderValues, setSliderValues] = useState<Record<string, number>>({});
  const [toggleValues, setToggleValues] = useState<Record<string, boolean>>({});
  const [firedButton, setFiredButton] = useState<string | null>(null);

  useEffect(() => {
    const sv: Record<string, number> = {};
    sliderControls.forEach((s) => { sv[s.id] = s.getValue(); });
    setSliderValues(sv);

    const tv: Record<string, boolean> = {};
    toggleControls.forEach((t) => { tv[t.id] = t.getValue(); });
    setToggleValues(tv);
  }, []);

  function fireButton(b: DemoButton) {
    b.action();
    setFiredButton(b.id);
    showToast(`Next ride: ${b.label}`, "warn");
    setTimeout(() => setFiredButton(null), 1800);
  }

  function updateSlider(s: DemoSlider, raw: number) {
    s.setValue(raw);
    setSliderValues((prev) => ({ ...prev, [s.id]: raw }));
  }

  function updateToggle(t: DemoToggle, val: boolean) {
    t.setValue(val);
    setToggleValues((prev) => ({ ...prev, [t.id]: val }));
  }

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
        <p className="mb-5 text-sm text-muted leading-relaxed">
          This prototype keeps BiTaksi&apos;s visual identity but addresses every usability problem found across 5 user tests. Each improvement is built into the real flows.
        </p>

        {/* ── Demo controls ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-3xl border border-hairline p-5"
        >
          <h2 className="text-lg font-black text-ink mb-1">Demo controls</h2>
          <p className="text-sm text-muted mb-5">
            Force errors and tweak behaviour to demonstrate the improved recovery flows.
            New controls register in <code className="rounded bg-chip px-1 py-0.5 text-xs font-mono text-brand">lib/demo/controls.ts</code>.
          </p>

          {/* Fault buttons */}
          {buttonControls.length > 0 && (
            <div className="mb-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted">Force next error</p>
              <div className="grid grid-cols-2 gap-2.5">
                {buttonControls.map((b) => (
                  <motion.button
                    key={b.id}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => fireButton(b)}
                    className="relative flex items-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-bold text-brand overflow-hidden"
                    animate={{ backgroundColor: firedButton === b.id ? "#2e1a8f" : "#eef0f6" }}
                  >
                    <AnimatePresence mode="wait">
                      {firedButton === b.id ? (
                        <motion.span
                          key="fired"
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2 text-cream w-full"
                        >
                          <span>✓</span> <span>Queued</span>
                        </motion.span>
                      ) : (
                        <motion.span
                          key="idle"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-2"
                        >
                          <span>{b.emoji}</span> <span>{b.label}</span>
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Sliders */}
          {sliderControls.map((s) => {
            const val = sliderValues[s.id] ?? s.getValue();
            return (
              <div key={s.id} className="mb-4">
                <div className="mb-2 flex justify-between text-sm font-bold text-ink">
                  <span>{s.label}</span>
                  <span className="text-brand">{val}{s.unit}</span>
                </div>
                <input
                  type="range"
                  min={s.min}
                  max={s.max}
                  step={s.step}
                  value={val}
                  onChange={(e) => updateSlider(s, Number(e.target.value))}
                  className="w-full h-2 rounded-full accent-[var(--brand)]"
                  aria-label={s.label}
                />
                <div className="mt-1 flex justify-between text-xs text-muted">
                  <span>{s.min}{s.unit} — always succeeds</span>
                  <span>{s.max}{s.unit} — always fails</span>
                </div>
              </div>
            );
          })}

          {/* Toggles */}
          {toggleControls.map((t) => {
            const val = toggleValues[t.id] ?? t.getValue();
            return (
              <div key={t.id} className="flex items-center justify-between py-3 border-t border-hairline">
                <div className="min-w-0 pr-4">
                  <p className="text-sm font-bold text-ink">{t.label}</p>
                  <p className="text-xs text-muted">{t.description}</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => updateToggle(t, !val)}
                  className="relative h-7 w-12 shrink-0 rounded-full transition-colors"
                  animate={{ backgroundColor: val ? "var(--brand)" : "var(--chip)" }}
                >
                  <motion.span
                    className="absolute top-[3px] h-[22px] w-[22px] rounded-full bg-white shadow"
                    animate={{ x: val ? 22 : 3 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </motion.button>
              </div>
            );
          })}
        </motion.div>

        {/* ── UX improvement notes ──────────────────────────────── */}
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
