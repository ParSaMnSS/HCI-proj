"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wordmark } from "@/components/ui/Brand";
import { IconButton } from "@/components/ui/IconButton";
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
  const rideTypeId  = useStore((s) => s.rideTypeId);
  const destination = useStore((s) => s.destination);
  const setRideType = useStore((s) => s.setRideType);
  const setDestination = useStore((s) => s.setDestination);
  const request     = useStore((s) => s.request);
  const showToast   = useStore((s) => s.showToast);
  const km = useMemo(() => tripKm(destination), [destination]);

  function onRequest() { request(); router.push("/ride"); }

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden">
      <Toast />
      <Coachmarks />

      {/* ════════ MAP — always at least 44% of the screen ════════ */}
      <div className="relative" style={{ flex: "0 0 44%" }}>
        <MapView
          center={destination ? destination.lngLat : PICKUP.lngLat}
          zoom={destination ? 11 : 14}
          pickup={PICKUP.lngLat}
          destination={destination?.lngLat ?? null}
          route={null}
          idleTaxis={destination ? [] : IDLE_TAXIS}
          fitBounds={!!destination}
        />

        {/* Top-left stacked controls */}
        <div
          className="absolute left-3 z-10 flex flex-col gap-2"
          style={{ top: "calc(var(--sat,0px) + 10px)" }}
        >
          <IconButton label="Menu" tone="white" onClick={() => router.push("/menu")}>
            <MenuIcon />
          </IconButton>
          <IconButton label="Notifications" tone="green">
            <BellIcon size={18} />
          </IconButton>
        </div>

        {/* Wordmark */}
        <div
          className="pointer-events-none absolute inset-x-0 z-0 flex justify-center"
          style={{ top: "calc(var(--sat,0px) + 10px)" }}
        >
          <Wordmark />
        </div>

        {/* Pickup address tag — floats in the map */}
        <motion.button
          onClick={() => router.push("/destination")}
          whileTap={{ scale: 0.97 }}
          data-coach="pickup"
          className="absolute left-1/2 z-10 -translate-x-1/2 flex items-center gap-2 rounded-2xl bg-white px-3 py-2.5 shadow-xl"
          style={{ top: "45%" }}
        >
          <span className="rounded-lg bg-brand px-2 py-1 text-[11px] font-black text-cream leading-none">
            1 min
          </span>
          <span className="max-w-[170px] truncate text-sm font-bold text-ink">
            {PICKUP.title}
          </span>
          <ChevronRight size={14} />
        </motion.button>

        {/* Pulsing pin */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-[5] -translate-x-1/2 -translate-y-1/2">
          <span className="relative grid h-6 w-6 place-items-center">
            <span className="pulse-ring absolute inset-0 rounded-full opacity-50" />
            <span className="h-6 w-6 rounded-full border-[3px] border-white bg-brand shadow-lg" />
          </span>
        </div>

        {/* GPS button — right side of map */}
        <div className="absolute bottom-3 right-3 z-10">
          <IconButton
            label="Use my location" tone="white"
            onClick={() => showToast("Centered on your location", "ok")}
          >
            <TargetIcon size={18} />
          </IconButton>
        </div>
      </div>

      {/* ════════ BOTTOM PANEL — fills remaining space ════════ */}
      <div className="flex flex-col bg-white" style={{ flex: "1 1 0", overflow: "hidden" }}>

        {/* Search bar */}
        <div className="px-4 pt-3 pb-0">
          <motion.button
            data-coach="search"
            initial={{ y: 6, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.08 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/destination")}
            className="flex w-full items-center gap-3 rounded-full bg-chip px-2 py-2 shadow-sm"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand text-white">
              <SearchIcon size={20} />
            </span>
            <AnimatePresence mode="wait">
              <motion.span
                key={destination?.id ?? "placeholder"}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.14 }}
                className="flex-1 text-left text-[16px] font-extrabold text-ink/60"
              >
                {destination ? destination.title : "Where to?"}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Quick-destination chips */}
        <div className="no-scrollbar mt-2.5 flex gap-2 overflow-x-auto px-4 pb-0">
          {QUICK_DESTINATIONS.map((d, i) => (
            <motion.button
              key={d.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.04 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => setDestination(d)}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-hairline bg-white px-3 py-2 text-xs font-bold text-brand shadow-sm"
            >
              <PinIcon size={13} /> {d.title}
            </motion.button>
          ))}
        </div>

        {/* Thin divider */}
        <div className="mx-4 mt-3 h-px bg-hairline" />

        {/* Ride list — scrollable, compact rows */}
        <div
          data-coach="rides"
          className="no-scrollbar flex-1 overflow-y-auto px-3 pt-1 pb-0"
          style={{ minHeight: 0 }}
        >
          {RIDE_TYPES.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <RideTypeRow
                ride={r} km={km} eta={1 + i}
                selected={rideTypeId === r.id}
                onSelect={() => setRideType(r.id)}
              />
            </motion.div>
          ))}
        </div>

        {/* Bottom actions — fixed to bottom of panel */}
        <div
          className="shrink-0 px-4 pt-2 pb-2 space-y-2"
          style={{ paddingBottom: "calc(0.6rem + var(--sab,0px))" }}
        >
          {/* Toolbar chips */}
          <div className="flex gap-2" data-coach="request">
            <Button variant="chip" full onClick={() => router.push("/payment")}>
              <CardIcon size={15} /> Add card
            </Button>
            <Button variant="chip" full onClick={() => router.push("/taximeter")}>
              Taximeter <ChevronRight size={13} />
            </Button>
            <Button variant="chip" full onClick={() => router.push("/tip")}>
              Tip <ChevronRight size={13} />
            </Button>
          </div>

          {/* Primary CTA */}
          <Button full onClick={onRequest}>
            request bitaksi
          </Button>

          {/* HCI link */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/ux-notes")}
            className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-lavender px-3 py-2.5 text-xs font-bold text-brand"
          >
            <InfoIcon size={14} /> HCI improvements & demo controls
          </motion.button>
        </div>
      </div>
    </div>
  );
}
