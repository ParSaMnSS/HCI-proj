"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, PlusIcon, ClockIcon, MapIcon, PinIcon } from "@/components/ui/icons";
import { PICKUP, RECENT_ADDRESSES, QUICK_DESTINATIONS, type SavedAddress } from "@/lib/mock/data";
import { useStore } from "@/lib/store";

export default function DestinationPage() {
  const router = useRouter();
  const setDestination = useStore((s) => s.setDestination);
  const [query, setQuery] = useState("");

  const all = [...QUICK_DESTINATIONS, ...RECENT_ADDRESSES];
  const results = query
    ? all.filter((a) => (a.title + a.subtitle).toLowerCase().includes(query.toLowerCase()))
    : RECENT_ADDRESSES;

  function choose(a: SavedAddress) {
    setDestination(a);
    router.push("/booking");
  }

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 380, damping: 36 }}
      className="absolute inset-0 flex flex-col bg-white"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 pb-3"
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

        <motion.button
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-bold text-cream"
        >
          👤 For someone else
        </motion.button>

        <div className="w-11" />
      </div>

      {/* Origin → Destination inputs */}
      <div className="px-5 pb-4">
        <div className="flex items-start gap-4">
          {/* connector dots */}
          <div className="mt-4 flex flex-col items-center gap-1.5 pt-1">
            <span className="h-4 w-4 rounded-full border-[3px] border-brand" />
            <span className="h-1.5 w-1.5 rounded-full bg-brand/30" />
            <span className="h-1.5 w-1.5 rounded-full bg-brand/30" />
            <span className="h-1.5 w-1.5 rounded-full bg-brand/30" />
            <span className="mt-0.5 text-brand"><PinIcon size={18} /></span>
          </div>

          <div className="flex-1 space-y-2">
            {/* Origin */}
            <div className="rounded-2xl border-2 border-hairline bg-chip/50 px-4 py-3.5">
              <p className="text-base font-bold text-ink">{PICKUP.title}</p>
            </div>
            {/* Destination */}
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Where to?"
                className="flex-1 rounded-2xl border-2 border-brand bg-lavender/40 px-4 py-3.5 text-base font-bold text-ink outline-none placeholder:font-semibold placeholder:text-muted"
              />
              <motion.button
                whileTap={{ scale: 0.9 }}
                aria-label="Add stop"
                className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-2 border-brand text-brand"
              >
                <PlusIcon size={20} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Add home / work */}
        <div className="mt-4 flex gap-3">
          {["Add home", "Add work"].map((label) => (
            <motion.button
              key={label}
              whileTap={{ scale: 0.95 }}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-brand px-3 py-3.5 font-bold text-brand"
            >
              <PlusIcon size={17} /> {label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto border-t border-hairline">
        <AnimatePresence mode="wait">
          <motion.div
            key={query}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.12 }}
          >
            {results.length === 0 ? (
              <p className="py-10 text-center text-muted">No places match "{query}"</p>
            ) : (
              results.map((a, i) => (
                <motion.button
                  key={a.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileTap={{ backgroundColor: "#eaeafb" }}
                  onClick={() => choose(a)}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left border-b border-hairline/60"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-chip text-brand">
                    {a.kind === "recent" ? <ClockIcon size={20} /> : <PinIcon size={20} />}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-base font-bold text-ink">{a.title}</span>
                    <span className="block truncate text-sm text-muted">{a.subtitle}</span>
                  </span>
                </motion.button>
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pick from map — sticky */}
      <div
        className="border-t border-hairline bg-white px-5 pt-3"
        style={{ paddingBottom: "calc(1rem + var(--sab, 0px))" }}
      >
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => choose(QUICK_DESTINATIONS[0])}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-brand py-4 text-lg font-extrabold text-brand"
        >
          <MapIcon size={22} /> Pick from map
        </motion.button>
      </div>
    </motion.div>
  );
}
