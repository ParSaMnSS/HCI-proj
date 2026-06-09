"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "@/components/ui/icons";
import { useStore } from "@/lib/store";

const CONTACTS = [
  { id: "c1", name: "Anne", phone: "+90 533 111 22 33", emoji: "👩" },
  { id: "c2", name: "Mert Abim", phone: "+90 555 987 65 43", emoji: "👨" },
];

export default function SafetyPage() {
  const router = useRouter();
  const showToast = useStore((s) => s.showToast);
  const [sosPressed, setSosPressed] = useState(false);
  const [sosCountdown, setSosCountdown] = useState(3);
  const [sharing, setSharing] = useState(false);

  function pressSOS() {
    if (sosPressed) return;
    setSosPressed(true);
    let n = 3;
    const id = setInterval(() => {
      n -= 1;
      setSosCountdown(n);
      if (n === 0) {
        clearInterval(id);
        showToast("🚨 Emergency services notified — help is on the way", "warn");
        router.back();
      }
    }, 1000);
  }

  function shareTrip() {
    setSharing(true);
    setTimeout(() => {
      setSharing(false);
      showToast("Trip link copied — share it with your contacts", "ok");
    }, 800);
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
        <h1 className="text-xl font-black text-ink">Safety Center</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-5">
        {/* SOS */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-alert/5 p-5 border-2 border-alert/20"
        >
          <p className="text-sm font-bold text-alert mb-3">Emergency SOS</p>
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={pressSOS}
            disabled={sosPressed}
            className="w-full rounded-2xl py-5 text-xl font-black text-white shadow-lg"
            animate={{ backgroundColor: sosPressed ? "#c0392b" : "#e8470f" }}
          >
            {sosPressed ? `Calling in ${sosCountdown}s… Tap again to cancel` : "🚨 Emergency SOS"}
          </motion.button>
          <p className="mt-2 text-xs text-muted text-center">
            Calls 112 and shares your live location with emergency services
          </p>
        </motion.div>

        {/* Share trip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.07 }}
          className="rounded-3xl border border-hairline p-5"
        >
          <p className="text-base font-extrabold text-ink mb-1">Share your trip</p>
          <p className="text-sm text-muted mb-4">Let someone follow your ride in real time.</p>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={shareTrip}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-4 text-[15px] font-black text-cream"
          >
            {sharing ? "Copying…" : "📤 Copy trip link"}
          </motion.button>
          <div className="mt-3 flex gap-2">
            {["WhatsApp", "SMS", "Copy"].map((app) => (
              <motion.button
                key={app}
                whileTap={{ scale: 0.93 }}
                onClick={() => showToast(`Shared via ${app}`, "ok")}
                className="flex-1 rounded-2xl border border-hairline py-2.5 text-sm font-bold text-brand"
              >
                {app}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Trusted contacts */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="rounded-3xl border border-hairline p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-base font-extrabold text-ink">Trusted contacts</p>
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => showToast("Add contact feature — coming soon", "ok")}
              className="text-sm font-bold text-brand"
            >
              + Add
            </motion.button>
          </div>
          <div className="space-y-2">
            {CONTACTS.map((c) => (
              <div key={c.id} className="flex items-center gap-4 rounded-2xl bg-chip/40 px-4 py-3.5">
                <span className="text-2xl">{c.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-ink">{c.name}</p>
                  <p className="text-sm text-muted">{c.phone}</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => showToast(`Notifying ${c.name}…`, "ok")}
                  className="rounded-xl bg-brand px-4 py-2 text-sm font-bold text-cream"
                >
                  Alert
                </motion.button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Ride details */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.17 }}
          className="rounded-3xl bg-lavender p-5"
        >
          <p className="text-base font-extrabold text-brand mb-3">Your current ride</p>
          <div className="space-y-1">
            {[
              { label: "Driver", value: "Mehmet K. · ★ 4.9" },
              { label: "Plate", value: "34 ZYN 551" },
              { label: "Car", value: "Hyundai i20 · Yellow" },
              { label: "Route tracked", value: "🟢 Active" },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-1">
                <span className="text-sm text-brand/70 font-semibold">{label}</span>
                <span className="text-sm font-bold text-brand">{value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
