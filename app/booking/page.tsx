"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Wordmark } from "@/components/ui/Brand";
import { IconButton } from "@/components/ui/IconButton";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { Coachmarks } from "@/components/onboarding/Coachmarks";
import { RideTypeRow } from "@/components/booking/RideTypeRow";
import {
  MenuIcon,
  BellIcon,
  TargetIcon,
  SearchIcon,
  PinIcon,
  CardIcon,
  ChevronRight,
  InfoIcon,
} from "@/components/ui/icons";
import {
  PICKUP,
  QUICK_DESTINATIONS,
  RIDE_TYPES,
  type LngLat,
} from "@/lib/mock/data";
import { useStore, tripKm } from "@/lib/store";

const MapView = dynamic(() => import("@/components/map/MapView"), { ssr: false });

// a handful of idle taxis scattered around the pickup
const IDLE_TAXIS: LngLat[] = [
  [29.422, 40.816],
  [29.426, 40.818],
  [29.435, 40.806],
  [29.44, 40.808],
  [29.418, 40.812],
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

      {/* Map fills the top */}
      <div className="relative flex-1">
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
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-2">
          <IconButton label="Menu" tone="white" onClick={() => router.push("/menu")}>
            <MenuIcon />
          </IconButton>
          <IconButton label="Notifications" tone="green">
            <BellIcon size={20} />
          </IconButton>
        </div>

        {/* Brand header */}
        <div className="pointer-events-none absolute inset-x-0 top-4 z-0 flex justify-center">
          <Wordmark />
        </div>

        {/* Pickup address tag */}
        <button
          onClick={() => router.push("/destination")}
          data-coach="pickup"
          className="absolute left-1/2 top-[42%] z-10 flex -translate-x-1/2 items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-lg"
        >
          <span className="rounded-xl bg-brand px-2 py-1 text-xs font-black text-cream">
            1 min
          </span>
          <span className="max-w-[190px] truncate text-sm font-bold text-ink">
            {PICKUP.title}
          </span>
          <ChevronRight size={16} />
        </button>

        {/* Pickup pin (purely visual; the real marker is on the map) */}
        <div className="absolute left-1/2 top-1/2 z-[5] -translate-x-1/2 -translate-y-1/2">
          <span className="relative grid h-6 w-6 place-items-center">
            <span className="pulse-ring absolute inset-0 rounded-full opacity-40" />
            <span className="h-6 w-6 rounded-full border-4 border-white bg-brand shadow" />
          </span>
        </div>
      </div>

      {/* Search + chips floating just above the sheet */}
      <div className="relative z-10 -mb-2 px-3 pb-1">
        <div
          data-coach="search"
          className="flex items-center gap-2 rounded-full bg-white p-1.5 shadow-lg"
        >
          <button
            onClick={() => router.push("/destination")}
            aria-label="Search destination"
            className="grid h-11 w-11 place-items-center rounded-full bg-brand text-white"
          >
            <SearchIcon size={20} />
          </button>
          <button
            onClick={() => router.push("/destination")}
            className="flex-1 text-left text-lg font-extrabold text-ink/70"
          >
            {destination ? destination.title : "Where to?"}
          </button>
          <IconButton
            label="Use my location"
            tone="white"
            onClick={() => showToast("Centered on your location", "ok")}
          >
            <TargetIcon size={20} />
          </IconButton>
        </div>

        <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto pb-1">
          {QUICK_DESTINATIONS.map((d) => (
            <button
              key={d.id}
              onClick={() => setDestination(d)}
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3 py-2 text-sm font-bold text-brand shadow"
            >
              <PinIcon size={16} /> {d.title}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom sheet: ride options + CTA */}
      <Sheet className="relative z-10">
        <div data-coach="rides" className="max-h-[34vh] space-y-1 overflow-y-auto">
          {RIDE_TYPES.map((r, i) => (
            <RideTypeRow
              key={r.id}
              ride={r}
              km={km}
              eta={1 + i}
              selected={rideTypeId === r.id}
              onSelect={() => setRideType(r.id)}
            />
          ))}
        </div>

        {/* toolbar chips */}
        <div className="mt-2 flex gap-2">
          <Button variant="chip" full onClick={() => router.push("/payment")}>
            <CardIcon size={18} /> Add card
          </Button>
          <Button variant="chip" full onClick={() => showToast("Taximeter info (mock)")}>
            Taximeter <ChevronRight size={16} />
          </Button>
          <Button variant="chip" full onClick={() => showToast("Tip options (mock)")}>
            Tip <ChevronRight size={16} />
          </Button>
        </div>

        <div className="mt-3" data-coach="request">
          <Button full onClick={onRequest}>
            request bitaksi
          </Button>
        </div>

        <button
          onClick={() => router.push("/ux-notes")}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl bg-lavender px-3 py-2 text-sm font-bold text-brand"
        >
          <InfoIcon size={16} /> HCI improvements & demo controls
        </button>
      </Sheet>
    </div>
  );
}
