"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wordmark } from "@/components/ui/Brand";
import { IconButton } from "@/components/ui/IconButton";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { Spotlight } from "@/components/onboarding/Coachmarks";
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
  const userLocation = useStore((s) => s.userLocation);
  const locating     = useStore((s) => s.locating);
  const locateUser   = useStore((s) => s.locateUser);
  const km = useMemo(() => tripKm(destination), [destination]);

  // Pickup is the user's real GPS location once granted, else the mock default
  const pickup = userLocation ?? PICKUP;

  const [requesting, setRequesting] = useState(false);

  function onRequest() {
    setRequesting(true);
    // brief delay so button feedback is visible before navigation
    setTimeout(() => {
      request();
      router.push("/ride");
    }, 340);
  }

  return (
    <div className="flex flex-col overflow-hidden" style={{ flex: "1 1 0", minHeight: 0, width: "100%" }}>
      <Toast />
      <Spotlight />

      {/* ════════ HEADER — menu + wordmark, sits ABOVE the map ════════ */}
      <div
        className="relative z-20 flex shrink-0 items-center bg-white px-3 pb-2"
        style={{ paddingTop: "calc(var(--sat,0px) + 10px)" }}
      >
        <IconButton label="Menu" tone="white" onClick={() => router.push("/menu")}>
          <MenuIcon />
        </IconButton>
        <div className="pointer-events-none absolute inset-x-0 flex justify-center">
          <Wordmark />
        </div>
        <div className="ml-auto">
          <IconButton label="Notifications" tone="green">
            <BellIcon size={18} />
          </IconButton>
        </div>
      </div>

      {/* ════════ MAP — fills space between header and ride-type selector ════════ */}
      <div className="relative" style={{ flex: "0 0 40%", minHeight: "180px" }}>
        <MapView
          center={destination ? destination.lngLat : pickup.lngLat}
          zoom={destination ? 11 : 14}
          pickup={pickup.lngLat}
          destination={destination?.lngLat ?? null}
          route={null}
          idleTaxis={destination ? [] : IDLE_TAXIS}
          fitBounds={!!destination}
        />

        {/* GPS button — the ONLY overlay on the map. Requests real location. */}
        <div className="absolute bottom-3 right-3 z-10">
          <IconButton
            label="My location" tone="white"
            onClick={locateUser}
          >
            {locating
              ? <span className="spin h-[18px] w-[18px] rounded-full border-2 border-brand/30 border-t-brand" />
              : <TargetIcon size={18} />}
          </IconButton>
        </div>
      </div>

      {/* ════════ BOTTOM PANEL ════════ */}
      <div className="flex flex-col bg-white" style={{ flex: "1 1 0", minHeight: 0, overflow: "hidden" }}>

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
                className={`flex-1 text-left text-[16px] font-extrabold ${destination ? "text-ink" : "text-ink/60"}`}
              >
                {destination ? destination.title : "Where to?"}
              </motion.span>
            </AnimatePresence>
            {destination && (
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={(e) => { e.stopPropagation(); setDestination(null); }}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-hairline text-muted text-lg font-black"
                aria-label="Clear destination"
              >
                ×
              </motion.button>
            )}
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
              style={{ outline: destination?.id === d.id ? "2px solid var(--brand)" : undefined }}
            >
              <PinIcon size={13} /> {d.title}
            </motion.button>
          ))}
        </div>

        {/* Divider */}
        <div className="mx-4 mt-3 h-px bg-hairline" />

        {/* Ride type list */}
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

        {/* Bottom actions */}
        <div
          className="shrink-0 px-4 pt-2 space-y-2"
          style={{ paddingBottom: "calc(0.6rem + var(--sab,0px))" }}
        >
          {/* Toolbar chips */}
          <div className="flex gap-2">
            <Button variant="chip" full data-coach="addcard" onClick={() => router.push("/payment")}>
              <CardIcon size={15} /> Add card
            </Button>
            <Button variant="chip" full onClick={() => router.push("/taximeter")}>
              Taximeter <ChevronRight size={13} />
            </Button>
            <Button variant="chip" full onClick={() => router.push("/tip")}>
              Tip <ChevronRight size={13} />
            </Button>
          </div>

          {/* Primary CTA with loading state */}
          <Button full loading={requesting} data-coach="request" onClick={onRequest}>
            {requesting ? "Finding your taxi…" : "request bitaksi"}
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
