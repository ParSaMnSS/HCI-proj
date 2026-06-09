"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wordmark } from "@/components/ui/Brand";
import { IconButton } from "@/components/ui/IconButton";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { Coachmarks } from "@/components/onboarding/Coachmarks";
import { RideTypeRow } from "@/components/booking/RideTypeRow";
import {
  MenuIcon, BellIcon, TargetIcon, SearchIcon,
  PinIcon, CardIcon, ChevronRight, InfoIcon,
} from "@/components/ui/icons";
import { PICKUP, QUICK_DESTINATIONS, RIDE_TYPES, type LngLat } from "@/lib/mock/data";
import { useStore, tripKm } from "@/lib/store";

const MapView = dynamic(() => import("@/components/map/MapView"), { ssr: false });

const IDLE_TAXIS: LngLat[] = [
  [29.422, 40.816], [29.426, 40.818],
  [29.435, 40.806], [29.44, 40.808], [29.418, 40.812],
];

export default function BookingPage() {
  const router = useRouter();
  const rideTypeId = useStore((s) => s.rideTypeId);
  const destination = useStore((s) => s.destination);
  const setRideType = useStore((s) => s.setRideType);
  const setDestination = useStore((s) => s.setDestination);
  const request = useStore((s) => s.request);
  const showToast = useStore((s) => s.showToast);
  const km = useMemo(() => tripKm(destination), [destination]);

  function onRequest() {
    request();
    router.push("/ride");
  }

  return (
    <div className="absolute inset-0 flex flex-col">
      <Toast />
      <Coachmarks />

      {/* ── Map ── */}
      <div className="relative flex-1 min-h-0">
        <MapView
          center={destination ? destination.lngLat : PICKUP.lngLat}
          zoom={destination ? 11 : 14}
          pickup={PICKUP.lngLat}
          destination={destination?.lngLat ?? null}
          route={null}
          idleTaxis={destination ? [] : IDLE_TAXIS}
          fitBounds={!!destination}
        />

        {/* safe-area top controls */}
        <div
          className="absolute left-4 z-10 flex flex-col gap-3"
          style={{ top: "calc(var(--sat, 0px) + 14px)" }}
        >
          <IconButton label="Menu" tone="white" onClick={() => router.push("/menu")}>
            <MenuIcon />
          </IconButton>
          <IconButton label="Notifications" tone="green">
            <BellIcon size={20} />
          </IconButton>
        </div>

        {/* Brand wordmark */}
        <div
          className="pointer-events-none absolute inset-x-0 z-0 flex justify-center"
          style={{ top: "calc(var(--sat, 0px) + 16px)" }}
        >
          <Wordmark />
        </div>

        {/* Pickup address tag */}
        <motion.button
          onClick={() => router.push("/destination")}
          whileTap={{ scale: 0.97 }}
          data-coach="pickup"
          className="absolute left-1/2 z-10 -translate-x-1/2 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-xl"
          style={{ top: "38%" }}
        >
          <span className="rounded-xl bg-brand px-2.5 py-1.5 text-xs font-black text-cream">
            1 min
          </span>
          <span className="max-w-[180px] truncate text-sm font-bold text-ink">
            {PICKUP.title}
          </span>
          <ChevronRight size={16} />
        </motion.button>

        {/* Pulsing pickup pin */}
        <div className="absolute left-1/2 top-1/2 z-[5] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <span className="relative grid h-7 w-7 place-items-center">
            <span className="pulse-ring absolute inset-0 rounded-full opacity-50" />
            <span className="h-7 w-7 rounded-full border-[3px] border-white bg-brand shadow-lg" />
          </span>
        </div>

        {/* Location button bottom-right of map */}
        <motion.div
          whileTap={{ scale: 0.92 }}
          className="absolute bottom-4 right-4 z-10"
        >
          <IconButton
            label="Use my location"
            tone="white"
            onClick={() => showToast("Centered on your location", "ok")}
          >
            <TargetIcon size={20} />
          </IconButton>
        </motion.div>
      </div>

      {/* ── Search bar + chips ── */}
      <div className="relative z-10 bg-transparent px-4 pt-3 pb-2">
        <motion.div
          data-coach="search"
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 rounded-full bg-white px-2 py-2 shadow-lg"
        >
          <button
            onClick={() => router.push("/destination")}
            aria-label="Search destination"
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand text-white"
          >
            <SearchIcon size={22} />
          </button>
          <button
            onClick={() => router.push("/destination")}
            className="flex-1 text-left text-[17px] font-extrabold text-ink/60 py-1"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={destination?.id ?? "placeholder"}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="block"
              >
                {destination ? destination.title : "Where to?"}
              </motion.span>
            </AnimatePresence>
          </button>
        </motion.div>

        {/* Quick-destination chips */}
        <div className="no-scrollbar mt-3 flex gap-2.5 overflow-x-auto pb-1">
          {QUICK_DESTINATIONS.map((d, i) => (
            <motion.button
              key={d.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12 + i * 0.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDestination(d)}
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-brand shadow-sm border border-hairline"
            >
              <PinIcon size={15} /> {d.title}
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Bottom sheet ── */}
      <Sheet className="relative z-10">
        <div data-coach="rides" className="space-y-1.5 max-h-[36vh] overflow-y-auto pr-0.5">
          <AnimatePresence>
            {RIDE_TYPES.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <RideTypeRow
                  ride={r}
                  km={km}
                  eta={1 + i}
                  selected={rideTypeId === r.id}
                  onSelect={() => setRideType(r.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Toolbar chips */}
        <div className="mt-3 flex gap-2.5">
          <Button variant="chip" full onClick={() => router.push("/payment")}>
            <CardIcon size={17} /> Add card
          </Button>
          <Button variant="chip" full onClick={() => showToast("Taximeter info (mock)")}>
            Taximeter <ChevronRight size={15} />
          </Button>
          <Button variant="chip" full onClick={() => showToast("Tip options (mock)")}>
            Tip <ChevronRight size={15} />
          </Button>
        </div>

        {/* Primary CTA */}
        <div className="mt-3" data-coach="request">
          <Button full onClick={onRequest}>
            request bitaksi
          </Button>
        </div>

        {/* HCI notes link */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/ux-notes")}
          className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-2xl bg-lavender px-4 py-3 text-sm font-bold text-brand"
        >
          <InfoIcon size={16} /> HCI improvements & demo controls
        </motion.button>
      </Sheet>
    </div>
  );
}
