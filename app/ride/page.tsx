"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { IconButton } from "@/components/ui/IconButton";
import { DriverCard } from "@/components/ride/DriverCard";
import { FaultModal } from "@/components/ride/FaultModal";
import { Modal } from "@/components/ui/Modal";
import { ChevronLeft, ShareIcon, StarIcon, CheckIcon } from "@/components/ui/icons";
import { PICKUP, type LngLat } from "@/lib/mock/data";
import { useStore, rideTypeById } from "@/lib/store";

const MapView = dynamic(() => import("@/components/map/MapView"), { ssr: false });

// driver starts a little away from pickup and drives in
const DRIVER_START: LngLat = [29.46, 40.83];

function lerp(a: LngLat, b: LngLat, t: number): LngLat {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

/** position along a multi-point polyline at fraction t (0..1) */
function alongRoute(route: LngLat[], t: number): LngLat {
  if (route.length < 2) return route[0] ?? PICKUP.lngLat;
  const seg = (route.length - 1) * t;
  const i = Math.min(Math.floor(seg), route.length - 2);
  return lerp(route[i], route[i + 1], seg - i);
}

export default function RidePage() {
  const router = useRouter();
  const active = useStore((s) => s.active);
  const cancelRide = useStore((s) => s.cancelRide);
  const retryRequest = useStore((s) => s.retryRequest);
  const clearFault = useStore((s) => s.clearFault);
  const completeAck = useStore((s) => s.completeAck);
  const rateRide = useStore((s) => s.rateRide);
  const reset = useStore((s) => s.reset);
  const setDestination = useStore((s) => s.setDestination);
  const showToast = useStore((s) => s.showToast);

  const [driverPos, setDriverPos] = useState<LngLat | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const rafRef = useRef<number>(0);

  // guard: no active ride → go home
  useEffect(() => {
    if (!active) router.replace("/booking");
  }, [active, router]);

  const phase = active?.phase;
  const route = active?.route ?? [];
  const dest = active?.destination ?? null;

  // free-cancel countdown
  useEffect(() => {
    if (phase !== "accepted" && phase !== "arriving" && phase !== "searching") return;
    const start = Date.now();
    const id = setInterval(() => {
      const left = Math.max(0, 30 - Math.floor((Date.now() - start) / 1000));
      setSecondsLeft(left);
    }, 500);
    return () => clearInterval(id);
  }, [phase]);

  // animate driver: driving to pickup (accepted/arriving), then along route (ontrip)
  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    if (!phase) return;

    if (phase === "accepted" || phase === "arriving") {
      const from = DRIVER_START;
      const to = PICKUP.lngLat;
      const dur = 16000;
      const t0 = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / dur);
        setDriverPos(lerp(from, to, t));
        if (t < 1) rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } else if (phase === "arrived") {
      setDriverPos(PICKUP.lngLat);
    } else if (phase === "ontrip") {
      const dur = 22000;
      const t0 = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / dur);
        setDriverPos(alongRoute(route, t));
        if (t < 1) rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const rideType = useMemo(
    () => (active ? rideTypeById(active.rideTypeId) : null),
    [active],
  );

  if (!active || !rideType) return null;

  // ── status copy per phase ──
  const statusMap: Record<string, { title: string; sub: string }> = {
    searching: { title: "Finding your closest taxi…", sub: "Matching you with a nearby driver" },
    accepted: { title: `${active.driver?.name?.split(" ")[0]} is on the way`, sub: `Arriving in about ${active.etaMin} min` },
    arriving: { title: "Your taxi is almost here", sub: "Arriving in 1 min — head to the pickup point" },
    arrived: { title: "Your taxi has arrived", sub: "Meet your driver at the pickup point" },
    ontrip: { title: "On the way to your destination", sub: dest ? dest.title : "Enjoy your ride" },
    completed: { title: "You’ve arrived 🎉", sub: "Hope you had a great ride" },
    cancelled: { title: "Ride cancelled", sub: "No driver is on the way" },
  };
  const status = statusMap[active.phase];

  function doCancel() {
    setConfirmCancel(false);
    cancelRide();
  }

  function rebook() {
    reset();
    router.push("/booking");
  }

  // ── COMPLETED screen (rate + pay summary) ──
  if (active.phase === "completed") {
    return <CompletedView />;
  }

  // ── CANCELLED screen ──
  if (active.phase === "cancelled") {
    return (
      <div className="absolute inset-0 flex flex-col bg-surface p-6">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-chip text-brand">
            <ChevronLeft size={30} />
          </div>
          <h1 className="mt-4 text-2xl font-black text-ink">{status.title}</h1>
          <p className="mt-2 text-muted">
            Your request was cancelled and you were not charged.
          </p>
        </div>
        <div className="space-y-2">
          <Button full onClick={rebook}>
            Rebook same trip
          </Button>
          <button
            onClick={() => {
              reset();
              router.push("/booking");
            }}
            className="w-full py-2 font-bold text-brand underline"
          >
            Back to home
          </button>
        </div>
      </div>
    );
  }

  const showDriverCard =
    active.driver &&
    ["accepted", "arriving", "arrived", "ontrip"].includes(active.phase);

  return (
    <div className="absolute inset-0 flex flex-col">
      <Toast />

      <div className="relative flex-1">
        <MapView
          center={PICKUP.lngLat}
          zoom={12}
          pickup={PICKUP.lngLat}
          destination={dest?.lngLat ?? null}
          route={active.phase === "ontrip" ? route : null}
          driver={driverPos}
          fitBounds={active.phase === "ontrip"}
        />

        <div className="absolute left-3 top-3 z-10">
          <IconButton label="Back" tone="white" onClick={() => router.push("/booking")}>
            <ChevronLeft />
          </IconButton>
        </div>
        {showDriverCard && (
          <div className="absolute right-3 top-3 z-10">
            <IconButton
              label="Share trip"
              tone="brand"
              onClick={() => showToast("Trip link copied — share for safety", "ok")}
            >
              <ShareIcon size={20} />
            </IconButton>
          </div>
        )}

        {/* searching animation */}
        {active.phase === "searching" && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <span className="relative grid h-16 w-16 place-items-center">
              <span className="pulse-ring absolute inset-0 rounded-full" />
              <span className="grid h-12 w-12 place-items-center rounded-full bg-brand text-2xl">
                🚕
              </span>
            </span>
          </div>
        )}
      </div>

      <Sheet className="relative z-10">
        {/* status header */}
        <div className="mb-3 flex items-center gap-3 px-1">
          {active.phase === "searching" && (
            <span className="h-6 w-6 shrink-0 rounded-full border-[3px] border-brand/30 border-t-brand animate-spin-slow" />
          )}
          <div className="min-w-0">
            <h1 className="truncate text-xl font-black text-ink">{status.title}</h1>
            <p className="truncate text-sm text-muted">{status.sub}</p>
          </div>
        </div>

        {showDriverCard && active.driver && (
          <DriverCard
            driver={active.driver}
            etaLabel={
              active.phase === "arrived"
                ? "At your pickup point now"
                : active.phase === "ontrip"
                  ? `Heading to ${dest?.title ?? "destination"}`
                  : `Arrives in ~${active.etaMin} min`
            }
          />
        )}

        {/* trip summary chip */}
        <div className="mt-3 flex items-center justify-between rounded-2xl bg-chip px-3 py-2.5">
          <span className="flex items-center gap-2 font-bold text-ink">
            <span className="text-2xl">{rideType.emoji}</span> {rideType.name}
          </span>
          <span className="font-bold text-brand">
            {dest ? "₺3.128 – 3.898" : "Set destination"}
          </span>
        </div>

        {/* cancel / actions */}
        {["searching", "accepted", "arriving"].includes(active.phase) && (
          <button
            onClick={() => setConfirmCancel(true)}
            className="mt-3 w-full rounded-2xl border-2 border-alert/60 py-3 font-bold text-alert"
          >
            Cancel ride
            {secondsLeft > 0 && (
              <span className="ml-1 font-bold text-muted">· free for {secondsLeft}s</span>
            )}
          </button>
        )}
        {active.phase === "arrived" && (
          <p className="mt-3 rounded-2xl bg-lavender px-3 py-3 text-center text-sm font-bold text-brand">
            Look for {active.driver?.car} · {active.driver?.plate}
          </p>
        )}
      </Sheet>

      {/* fault recovery modal */}
      {active.fault && (
        <FaultModal
          fault={active.fault}
          onPrimary={() => {
            const f = active.fault;
            clearFault();
            if (f === "auth-failed" || f === "no-drivers" || f === "driver-cancelled") {
              retryRequest();
            } else if (f === "gps-weak") {
              router.push("/destination");
            }
          }}
          onSecondary={() => {
            const f = active.fault;
            clearFault();
            if (f === "no-drivers") router.push("/booking");
            else if (f === "auth-failed") router.push("/payment");
            else if (f === "driver-cancelled") cancelRide();
            else if (f === "gps-weak") retryRequest();
          }}
        />
      )}

      {/* cancel confirmation (clear warning + consequence) */}
      {confirmCancel && (
        <Modal onDismiss={() => setConfirmCancel(false)}>
          <h2 className="text-xl font-black text-ink">Cancel this ride?</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">
            {secondsLeft > 0
              ? "You’re still within the free-cancel window, so there’s no charge."
              : "A small cancellation fee of ₺25 may apply since your driver is already on the way."}
          </p>
          <div className="mt-5 space-y-2">
            <Button full onClick={doCancel} className="bg-alert hover:bg-alert/90">
              Yes, cancel ride
            </Button>
            <button
              onClick={() => setConfirmCancel(false)}
              className="w-full py-2 font-bold text-brand underline"
            >
              Keep my ride
            </button>
          </div>
        </Modal>
      )}
    </div>
  );

  // ── inline completed view (closure over hooks/state above) ──
  function CompletedView() {
    const a = active!;
    const rt = rideTypeById(a.rideTypeId);
    const fare = 3128 + Math.round((a.rated ?? 0) * 0); // mock fixed fare for summary
    return (
      <div className="absolute inset-0 flex flex-col bg-surface">
        <Toast />
        <div className="flex-1 overflow-y-auto px-5 pt-10">
          <div className="flex flex-col items-center text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-green text-white">
              <CheckIcon size={30} />
            </div>
            <h1 className="mt-4 text-2xl font-black text-ink">You’ve arrived 🎉</h1>
            <p className="mt-1 text-muted">{a.destination?.title}</p>
          </div>

          {/* rate */}
          <div className="mt-6 rounded-2xl border border-hairline p-4">
            <p className="text-center font-bold text-ink">
              How was your ride with {a.driver?.name.split(" ")[0]}?
            </p>
            <div className="mt-3 flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  aria-label={`${s} star${s > 1 ? "s" : ""}`}
                  onClick={() => {
                    rateRide(s);
                    showToast("Thanks for the feedback!", "ok");
                  }}
                  className={(a.rated ?? 0) >= s ? "text-taxi" : "text-hairline"}
                >
                  <StarIcon size={36} filled={(a.rated ?? 0) >= s} />
                </button>
              ))}
            </div>
          </div>

          {/* payment summary */}
          <div className="mt-4 rounded-2xl border border-hairline p-4">
            <h2 className="font-black text-ink">Payment summary</h2>
            <Row label={`${rt.name} fare`} value="₺3.128" />
            <Row label="bitaksiMoney earned" value="+₺77" green />
            <div className="my-2 border-t border-hairline" />
            <Row label="Total (Mastercard ••4827)" value={`₺${fare.toLocaleString("tr-TR")}`} bold />
          </div>
        </div>

        <div className="border-t border-hairline p-4">
          <Button full onClick={() => { completeAck(); reset(); router.push("/booking"); }}>
            Done
          </Button>
        </div>
      </div>
    );
  }
}

function Row({
  label,
  value,
  bold,
  green,
}: {
  label: string;
  value: string;
  bold?: boolean;
  green?: boolean;
}) {
  return (
    <div className="mt-2 flex items-center justify-between">
      <span className={`text-sm ${bold ? "font-black text-ink" : "text-muted"}`}>{label}</span>
      <span
        className={`text-sm font-bold ${green ? "text-green" : bold ? "text-ink" : "text-ink"}`}
      >
        {value}
      </span>
    </div>
  );
}
