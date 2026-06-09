"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft } from "@/components/ui/icons";

export default function TaximeterPage() {
  const router = useRouter();
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const fare = 90 + seconds * 0.52;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  const RATES = [
    { label: "Opening fee", value: "₺90.00" },
    { label: "Per km", value: "₺38.00" },
    { label: "Per minute (traffic)", value: "₺3.20" },
    { label: "Night surcharge (00–06)", value: "+50%" },
  ];

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
        <h1 className="text-xl font-black text-ink">Taximeter</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {/* Live meter */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-3xl bg-brand p-6 text-center shadow-lg"
        >
          <p className="text-sm font-bold text-cream/70 mb-1">Current fare estimate</p>
          <motion.p
            key={Math.floor(fare)}
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            className="text-5xl font-black text-cream tracking-tight"
          >
            ₺{fare.toFixed(2)}
          </motion.p>
          <p className="mt-2 text-sm font-semibold text-cream/60">
            {mins > 0 && `${mins}m `}{secs.toString().padStart(2, "0")}s elapsed
          </p>

          <div className="mt-5 flex gap-3 justify-center">
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => setRunning((r) => !r)}
              className="rounded-2xl bg-white/20 px-6 py-3 text-sm font-black text-cream"
            >
              {running ? "⏸ Pause" : "▶ Start demo"}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => { setSeconds(0); setRunning(false); }}
              className="rounded-2xl bg-white/10 px-6 py-3 text-sm font-black text-cream"
            >
              ↺ Reset
            </motion.button>
          </div>
        </motion.div>

        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">Istanbul taxi rates (2024)</p>
        <div className="space-y-2">
          {RATES.map((r, i) => (
            <motion.div
              key={r.label}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className="flex items-center justify-between rounded-2xl border border-hairline px-4 py-4"
            >
              <span className="text-[15px] font-semibold text-ink">{r.label}</span>
              <span className="text-[15px] font-black text-brand">{r.value}</span>
            </motion.div>
          ))}
        </div>

        <div className="mt-5 rounded-2xl bg-lavender p-4">
          <p className="text-sm font-semibold text-brand leading-relaxed">
            💡 The taximeter fare is calculated by your driver's official taximeter device.
            The estimate above is for reference only.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
