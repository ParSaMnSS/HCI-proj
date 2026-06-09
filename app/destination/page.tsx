"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, PlusIcon, ClockIcon, MapIcon, PinIcon } from "@/components/ui/icons";
import {
  PICKUP,
  RECENT_ADDRESSES,
  QUICK_DESTINATIONS,
  type SavedAddress,
} from "@/lib/mock/data";
import { useStore } from "@/lib/store";

export default function DestinationPage() {
  const router = useRouter();
  const setDestination = useStore((s) => s.setDestination);
  const [query, setQuery] = useState("");

  const all = [...QUICK_DESTINATIONS, ...RECENT_ADDRESSES];
  const results = query
    ? all.filter((a) =>
        (a.title + a.subtitle).toLowerCase().includes(query.toLowerCase()),
      )
    : RECENT_ADDRESSES;

  function choose(a: SavedAddress) {
    setDestination(a);
    router.push("/booking");
  }

  return (
    <div className="absolute inset-0 flex flex-col bg-surface">
      {/* header */}
      <div className="flex items-center gap-2 px-3 pt-3 pb-1">
        <button
          aria-label="Back"
          onClick={() => router.back()}
          className="grid h-10 w-10 place-items-center rounded-full text-brand"
        >
          <ChevronLeft />
        </button>
        <div className="flex-1" />
        <span className="rounded-full bg-brand px-3 py-1.5 text-sm font-bold text-cream">
          + For someone else
        </span>
        <div className="flex-1" />
        <div className="w-10" />
      </div>

      {/* origin / destination inputs */}
      <div className="px-4 pt-2">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center pt-3">
            <span className="h-4 w-4 rounded-full border-[3px] border-brand" />
            <span className="my-1 flex flex-col gap-1">
              <span className="h-1 w-1 rounded-full bg-brand/40" />
              <span className="h-1 w-1 rounded-full bg-brand/40" />
              <span className="h-1 w-1 rounded-full bg-brand/40" />
            </span>
            <PinIcon size={18} />
          </div>
          <div className="flex-1">
            <div className="border-b border-hairline pb-2 text-base font-bold text-ink">
              {PICKUP.title}
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Where to?"
                className="w-full border-b-2 border-brand pb-2 text-base font-bold text-ink outline-none placeholder:font-bold placeholder:text-muted"
              />
              <button
                aria-label="Add stop"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border-2 border-brand text-brand"
              >
                <PlusIcon size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* add home / work */}
        <div className="mt-4 flex gap-3">
          <button className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-brand px-3 py-3 font-bold text-brand">
            <PlusIcon size={18} /> Add home
          </button>
          <button className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-brand px-3 py-3 font-bold text-brand">
            <PlusIcon size={18} /> Add work
          </button>
        </div>
      </div>

      {/* results / recents */}
      <div className="mt-4 flex-1 overflow-y-auto border-t border-hairline px-4 pt-3">
        {results.length === 0 && (
          <p className="py-6 text-center text-muted">No places match “{query}”.</p>
        )}
        {results.map((a) => (
          <button
            key={a.id}
            onClick={() => choose(a)}
            className="flex w-full items-center gap-3 py-3 text-left"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-chip text-brand">
              {a.kind === "recent" ? <ClockIcon size={20} /> : <PinIcon size={20} />}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-base font-bold text-ink">{a.title}</span>
              <span className="block truncate text-sm text-muted">{a.subtitle}</span>
            </span>
          </button>
        ))}
      </div>

      {/* pick from map (sticky) */}
      <div className="border-t border-hairline bg-surface p-4">
        <button
          onClick={() => choose(QUICK_DESTINATIONS[0])}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-brand py-4 text-lg font-extrabold text-brand"
        >
          <MapIcon size={22} /> Pick from map
        </button>
      </div>
    </div>
  );
}
