"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";

export default function CallPage() {
  const router = useRouter();
  const active = useStore((s) => s.active);
  const [phase, setPhase] = useState<"ringing" | "connected" | "ended">("ringing");
  const [seconds, setSeconds] = useState(0);

  const driverName = active?.driver?.name ?? "Mehmet K.";

  useEffect(() => {
    const t = setTimeout(() => setPhase("connected"), 2400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase !== "connected") return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  function hangUp() {
    setPhase("ended");
    setTimeout(() => router.back(), 900);
  }

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const timeStr = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex flex-col items-center justify-between bg-brand"
      style={{ paddingTop: "calc(var(--sat,0px) + 40px)", paddingBottom: "calc(var(--sab,0px) + 48px)" }}
    >
      {/* Status label */}
      <AnimatePresence mode="wait">
        <motion.p
          key={phase}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="text-cream/70 font-semibold text-sm"
        >
          {phase === "ringing" ? "Calling…" : phase === "connected" ? timeStr : "Call ended"}
        </motion.p>
      </AnimatePresence>

      {/* Avatar */}
      <div className="flex flex-col items-center gap-5">
        <motion.div
          animate={phase === "ringing" ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          transition={{ repeat: Infinity, duration: 1.6 }}
          className="relative"
        >
          {phase === "ringing" && (
            <>
              <motion.span
                animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
                transition={{ repeat: Infinity, duration: 1.4 }}
                className="absolute inset-0 rounded-full bg-cream/20"
              />
              <motion.span
                animate={{ scale: [1, 1.9], opacity: [0.2, 0] }}
                transition={{ repeat: Infinity, duration: 1.4, delay: 0.3 }}
                className="absolute inset-0 rounded-full bg-cream/10"
              />
            </>
          )}
          <div
            className="relative grid h-28 w-28 place-items-center rounded-full text-5xl z-10"
            style={{ background: "hsl(250 60% 50%)" }}
          >
            🧑‍✈️
          </div>
        </motion.div>

        <div className="text-center">
          <h1 className="text-3xl font-black text-cream">{driverName}</h1>
          <p className="mt-1 text-cream/60 font-semibold text-sm">Your driver · 34 ZYN 551</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-8">
        <div className="flex items-center gap-8">
          {/* Mute */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="grid h-16 w-16 place-items-center rounded-full bg-white/15">
              🔇
            </div>
            <span className="text-cream/60 text-xs font-semibold">Mute</span>
          </motion.button>

          {/* Hang up */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={hangUp}
            disabled={phase === "ended"}
            className="grid h-20 w-20 place-items-center rounded-full bg-alert shadow-xl text-white text-3xl"
          >
            📵
          </motion.button>

          {/* Speaker */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="grid h-16 w-16 place-items-center rounded-full bg-white/15">
              🔊
            </div>
            <span className="text-cream/60 text-xs font-semibold">Speaker</span>
          </motion.button>
        </div>

        <p className="text-cream/40 text-xs">
          {phase === "ringing" ? "Connecting to driver…" : phase === "connected" ? "Encrypted call · BiTaksi" : ""}
        </p>
      </div>
    </motion.div>
  );
}
