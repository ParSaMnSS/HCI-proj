"use client";

import { motion } from "framer-motion";
import { UserIcon } from "@/components/ui/icons";
import { formatFare, type RideType } from "@/lib/mock/data";

export function RideTypeRow({ ride, km, selected, eta, onSelect }: {
  ride: RideType; km: number; selected: boolean; eta: number; onSelect: () => void;
}) {
  const hasFare = km > 0;
  return (
    <motion.button
      onClick={onSelect}
      whileTap={{ scale: 0.98 }}
      aria-pressed={selected}
      className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors"
      animate={{ backgroundColor: selected ? "var(--lavender)" : "transparent" }}
      style={{ outline: selected ? "2px solid rgba(46,26,143,0.3)" : "2px solid transparent" }}
    >
      {/* Car icon area */}
      <div className="relative grid h-14 w-20 shrink-0 place-items-center">
        <span className="text-[2.8rem] drop-shadow-sm" aria-hidden>{ride.emoji}</span>
        {ride.badge === "discount" && (
          <span className="absolute -bottom-0.5 left-1 grid h-6 w-6 place-items-center rounded-full bg-brand text-[11px] font-black text-cream">%</span>
        )}
        {ride.badge === "priority" && (
          <span className="absolute -bottom-0.5 left-1 grid h-6 w-6 place-items-center rounded-full bg-brand text-cream text-xs">⚡</span>
        )}
      </div>

      {/* Name + fare */}
      <div className="min-w-0 flex-1">
        <span className="text-[17px] font-extrabold text-ink">{ride.name}</span>
        {ride.blurb && !hasFare && (
          <p className="truncate text-sm text-muted">{ride.blurb}</p>
        )}
        {hasFare && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-base font-bold text-brand"
          >
            {formatFare(km, ride.rate)}
          </motion.p>
        )}
      </div>

      {/* ETA + capacity */}
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <span className="rounded-full bg-chip px-3 py-1.5 text-xs font-bold text-ink">{eta} min</span>
        <span className="flex items-center gap-1 text-sm font-bold text-muted">
          <UserIcon size={14} /> {ride.capacity}
        </span>
      </div>
    </motion.button>
  );
}
