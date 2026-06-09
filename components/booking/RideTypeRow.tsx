"use client";

import { clsx } from "@/lib/clsx";
import { UserIcon } from "@/components/ui/icons";
import { formatFare, type RideType } from "@/lib/mock/data";

export function RideTypeRow({
  ride,
  km,
  selected,
  eta,
  onSelect,
}: {
  ride: RideType;
  km: number;
  selected: boolean;
  eta: number;
  onSelect: () => void;
}) {
  const hasFare = km > 0;
  return (
    <button
      onClick={onSelect}
      aria-pressed={selected}
      className={clsx(
        "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition",
        selected
          ? "bg-lavender ring-2 ring-brand/40"
          : "bg-transparent hover:bg-chip/60",
      )}
    >
      <div className="relative grid h-14 w-20 shrink-0 place-items-center">
        <span className="text-4xl drop-shadow-sm" aria-hidden>
          {ride.emoji}
        </span>
        {ride.badge === "discount" && (
          <span className="absolute -bottom-0 left-1 grid h-6 w-6 place-items-center rounded-full bg-brand text-[11px] font-black text-cream">
            %
          </span>
        )}
        {ride.badge === "priority" && (
          <span className="absolute -bottom-0 left-1 grid h-6 w-6 place-items-center rounded-full bg-brand text-cream">
            ⚡
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-lg font-extrabold text-ink">{ride.name}</span>
        </div>
        {ride.blurb && !hasFare && (
          <p className="truncate text-sm text-muted">{ride.blurb}</p>
        )}
        {hasFare && (
          <p className="text-base font-bold text-brand">
            {formatFare(km, ride.rate)}
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1 text-muted">
        <span className="rounded-full bg-chip px-2.5 py-1 text-xs font-bold text-ink">
          {eta} min
        </span>
        <span className="flex items-center gap-1 text-sm font-bold">
          <UserIcon size={15} /> {ride.capacity}
        </span>
      </div>
    </button>
  );
}
