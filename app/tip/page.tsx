"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "@/components/ui/icons";
import { useStore } from "@/lib/store";

const TIPS = [
  { label: "No tip", pct: 0 },
  { label: "10%", pct: 10 },
  { label: "15%", pct: 15 },
  { label: "20%", pct: 20 },
  { label: "25%", pct: 25 },
];

const BASE_FARE = 340; // mock fare

export default function TipPage() {
  const router = useRouter();
  const showToast = useStore((s) => s.showToast);
  const [selected, setSelected] = useState<number | null>(null);
  const [custom, setCustom] = useState("");
  const [saved, setSaved] = useState(false);

  const tipAmount =
    selected !== null
      ? (BASE_FARE * selected) / 100
      : custom
      ? parseFloat(custom) || 0
      : 0;

  function confirm() {
    setSaved(true);
    setTimeout(() => {
      showToast(tipAmount > 0 ? `₺${tipAmount.toFixed(2)} tip added — thank you!` : "No tip — your driver was notified", "ok");
      router.back();
    }, 600);
  }

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 360, damping: 36 }}
      className="absolute inset-0 flex flex-col bg-white"
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 pb-3"
        style={{ paddingTop: "calc(var(--sat,0px) + 12px)" }}
      >
        <motion.button
          whileTap={{ scale: 0.9 }}
          aria-label="Back"
          onClick={() => router.back()}
          className="grid h-11 w-11 place-items-center rounded-full bg-chip text-brand"
        >
          <ChevronLeft />
        </motion.button>
        <h1 className="text-xl font-black text-ink">Add a tip</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4">
        {/* Driver info */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-4 rounded-2xl bg-lavender px-5 py-4"
        >
          <div
            className="grid h-14 w-14 shrink-0 place-items-center rounded-full text-2xl"
            style={{ background: "hsl(250 60% 70%)" }}
          >
            🧑‍✈️
          </div>
          <div>
            <p className="text-base font-extrabold text-ink">Mehmet K.</p>
            <p className="text-sm text-muted">Your trip • ₺{BASE_FARE.toFixed(2)}</p>
            <div className="mt-1 flex items-center gap-1">
              {"★★★★★".split("").map((s, i) => (
                <span key={i} className="text-taxi text-sm">{s}</span>
              ))}
              <span className="ml-1 text-xs font-bold text-muted">4.9</span>
            </div>
          </div>
        </motion.div>

        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">Select tip amount</p>

        {/* Tip grid */}
        <div className="grid grid-cols-5 gap-2 mb-5">
          {TIPS.map(({ label, pct }, i) => {
            const active = selected === pct && custom === "";
            return (
              <motion.button
                key={pct}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => { setSelected(pct); setCustom(""); }}
                className="flex flex-col items-center rounded-2xl py-3.5 text-center transition-colors"
                style={{
                  background: active ? "var(--brand)" : "var(--chip)",
                  outline: active ? "none" : "none",
                }}
              >
                <span className={`text-[13px] font-black ${active ? "text-cream" : "text-brand"}`}>{label}</span>
                {pct > 0 && (
                  <span className={`mt-0.5 text-[11px] font-bold ${active ? "text-cream/70" : "text-muted"}`}>
                    ₺{((BASE_FARE * pct) / 100).toFixed(0)}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Custom amount */}
        <div className="mb-6">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted">Or custom amount</p>
          <div className="flex items-center rounded-2xl border-2 border-hairline bg-chip/30 px-4 py-3 focus-within:border-brand">
            <span className="mr-2 text-lg font-black text-brand">₺</span>
            <input
              type="number"
              min={0}
              value={custom}
              onChange={(e) => { setCustom(e.target.value); setSelected(null); }}
              placeholder="0.00"
              className="flex-1 bg-transparent text-[17px] font-black text-ink outline-none placeholder:text-muted"
            />
          </div>
        </div>

        {/* Summary */}
        <AnimatePresence>
          {tipAmount > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 overflow-hidden rounded-2xl bg-brand/5 px-5 py-4 text-center"
            >
              <p className="text-sm font-semibold text-muted">Total tip</p>
              <p className="text-3xl font-black text-brand">₺{tipAmount.toFixed(2)}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CTA */}
      <div
        className="shrink-0 px-5 pt-3"
        style={{ paddingBottom: "calc(1rem + var(--sab,0px))" }}
      >
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={confirm}
          disabled={saved || (selected === null && !custom)}
          className="w-full rounded-2xl bg-brand py-4 text-lg font-black text-cream shadow-lg disabled:opacity-50"
        >
          <AnimatePresence mode="wait">
            {saved ? (
              <motion.span key="saved" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>✓ Saved!</motion.span>
            ) : (
              <motion.span key="confirm">
                {tipAmount > 0 ? `Confirm ₺${tipAmount.toFixed(2)} tip` : "Confirm — no tip"}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.div>
  );
}
