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
      className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left transition-colors"
      animate={{ backgroundColor: selected ? "#eaeafb" : "transparent" }}
      style={{ outline: selected ? "2px solid rgba(46,26,143,0.25)" : "2px solid transparent", borderRadius: 14 }}
    >
      {/* Car + badge */}
      <div className="relative grid h-11 w-14 shrink-0 place-items-center">
        <span className="text-[2rem] drop-shadow-sm" aria-hidden>{ride.emoji}</span>
        {ride.badge === "discount" && (
          <span className="absolute -bottom-0.5 left-0 grid h-5 w-5 place-items-center rounded-full bg-brand text-[10px] font-black text-cream">%</span>
        )}
        {ride.badge === "priority" && (
          <span className="absolute -bottom-0.5 left-0 grid h-5 w-5 place-items-center rounded-full bg-brand text-cream text-[10px]">⚡</span>
        )}
      </div>

      {/* Name + fare/blurb */}
      <div className="min-w-0 flex-1">
        <span className="text-[15px] font-extrabold text-ink leading-tight">{ride.name}</span>
        {hasFare ? (
          <p className="text-[13px] font-bold text-brand leading-tight">{formatFare(km, ride.rate)}</p>
        ) : ride.blurb ? (
          <p className="truncate text-[12px] text-muted leading-tight">{ride.blurb}</p>
        ) : null}
      </div>

      {/* ETA + capacity */}
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="rounded-full bg-chip px-2.5 py-1 text-[11px] font-bold text-ink">{eta} min</span>
        <span className="flex items-center gap-0.5 text-[11px] font-bold text-muted">
          <UserIcon size={12} /> {ride.capacity}
        </span>
      </div>
    </motion.button>
  );
}
