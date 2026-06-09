"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { IconButton } from "@/components/ui/IconButton";
import { DriverCard } from "@/components/ride/DriverCard";
import { FaultModal } from "@/components/ride/FaultModal";
import { Modal } from "@/components/ui/Modal";
import { ChevronLeft, ShareIcon, StarIcon, CheckIcon } from "@/components/ui/icons";
import { PICKUP, type LngLat } from "@/lib/mock/data";
import { useStore, rideTypeById, type Active } from "@/lib/store";

const MapView = dynamic(() => import("@/components/map/MapView"), { ssr: false });

const DRIVER_START: LngLat = [29.46, 40.83];

function lerp(a: LngLat, b: LngLat, t: number): LngLat {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}
function alongRoute(route: LngLat[], t: number): LngLat {
  if (route.length < 2) return route[0] ?? PICKUP.lngLat;
  const seg = (route.length - 1) * t;
  const i = Math.min(Math.floor(seg), route.length - 2);
  return lerp(route[i], route[i + 1], seg - i);
}

const STATUS: Record<string, { title: string; sub: string }> = {
  searching: { title: "Finding your closest taxi…", sub: "Matching you with a nearby driver" },
  accepted: { title: "Driver is on the way", sub: "Arriving in about 3 min" },
  arriving: { title: "Your taxi is almost here", sub: "Arriving in 1 min — head to pickup" },
  arrived: { title: "Your taxi has arrived!", sub: "Meet your driver at the pickup point" },
  ontrip: { title: "On the way", sub: "Enjoy your ride" },
  completed: { title: "You've arrived 🎉", sub: "Hope you had a great ride" },
  cancelled: { title: "Ride cancelled", sub: "You were not charged" },
};

export default function RidePage() {
  const router = useRouter();
  const active = useStore((s) => s.active);
  const cancelRide = useStore((s) => s.cancelRide);
  const retryRequest = useStore((s) => s.retryRequest);
  const clearFault = useStore((s) => s.clearFault);
  const completeAck = useStore((s) => s.completeAck);
  const rateRide = useStore((s) => s.rateRide);
  const reset = useStore((s) => s.reset);
  const showToast = useStore((s) => s.showToast);

  const [driverPos, setDriverPos] = useState<LngLat | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancellingNow, setCancellingNow] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!active) router.replace("/booking");
  }, [active, router]);

  const phase = active?.phase;
  const route = active?.route ?? [];
  const dest = active?.destination ?? null;

  // free-cancel countdown
  useEffect(() => {
    if (!["searching", "accepted", "arriving"].includes(phase ?? "")) return;
    const start = Date.now();
    const id = setInterval(() => {
      setSecondsLeft(Math.max(0, 30 - Math.floor((Date.now() - start) / 1000)));
    }, 500);
    return () => clearInterval(id);
  }, [phase]);

  // driver position animation
  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    if (!phase) return;
    if (phase === "accepted" || phase === "arriving") {
      const t0 = performance.now(), dur = 16000;
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / dur);
        setDriverPos(lerp(DRIVER_START, PICKUP.lngLat, t));
        if (t < 1) rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } else if (phase === "arrived") {
      setDriverPos(PICKUP.lngLat);
    } else if (phase === "ontrip") {
      const t0 = performance.now(), dur = 22000;
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

  const rideType = useMemo(() => active ? rideTypeById(active.rideTypeId) : null, [active]);
  if (!active || !rideType) return null;

  const status = STATUS[active.phase] ?? STATUS.searching;
  const showDriverCard = !!active.driver && ["accepted", "arriving", "arrived", "ontrip"].includes(active.phase);

  // ── COMPLETED ──
  if (active.phase === "completed") {
    return <CompletedScreen active={active} rideType={rideType} rateRide={rateRide} showToast={showToast} completeAck={completeAck} reset={reset} router={router} />;
  }

  // ── CANCELLED ──
  if (active.phase === "cancelled") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 flex flex-col items-center justify-center bg-white px-8 text-center gap-5"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="grid h-20 w-20 place-items-center rounded-full bg-chip text-muted text-4xl"
        >
          ✕
        </motion.div>
        <div>
          <h1 className="text-2xl font-black text-ink">{status.title}</h1>
          <p className="mt-1 text-muted">{status.sub}</p>
        </div>
        <div className="w-full space-y-3 mt-4">
          <Button full onClick={() => { reset(); router.push("/booking"); }}>
            Rebook same trip
          </Button>
          <button onClick={() => { reset(); router.push("/booking"); }} className="w-full py-2 font-bold text-brand underline">
            Back to home
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden" style={{ flex: "1 1 0", minHeight: 0, width: "100%" }}>
      <Toast />

      {/* Map — fixed at 48% so it's always visible */}
      <div className="relative" style={{ flex: "0 0 48%", minHeight: "180px" }}>
        <MapView
          center={PICKUP.lngLat} zoom={12}
          pickup={PICKUP.lngLat}
          destination={dest?.lngLat ?? null}
          route={active.phase === "ontrip" ? route : null}
          driver={driverPos}
          fitBounds={active.phase === "ontrip"}
        />

        {/* Back button */}
        <div className="absolute left-4 z-10" style={{ top: "calc(var(--sat, 0px) + 14px)" }}>
          <IconButton label="Back" tone="white" onClick={() => router.push("/booking")}>
            <ChevronLeft />
          </IconButton>
        </div>

        {/* Share trip */}
        <AnimatePresence>
          {showDriverCard && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute right-4 z-10"
              style={{ top: "calc(var(--sat, 0px) + 14px)" }}
            >
              <IconButton
                label="Share trip"
                tone="brand"
                onClick={() => router.push("/safety")}
              >
                <ShareIcon size={20} />
              </IconButton>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Searching pulse */}
        <AnimatePresence>
          {active.phase === "searching" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <span className="relative grid h-20 w-20 place-items-center">
                <span className="pulse-ring absolute inset-0 rounded-full" />
                <motion.span
                  animate={{ rotate: [0, 10, -10, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="grid h-14 w-14 place-items-center rounded-full bg-brand text-3xl shadow-xl"
                >
                  🚕
                </motion.span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom sheet — fills remaining 52% */}
      <Sheet className="flex-1 overflow-y-auto">
        {/* Status — cross-fades on phase change */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active.phase}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="mb-4 flex items-center gap-3 px-1"
          >
            {active.phase === "searching" && (
              <span className="spin h-6 w-6 shrink-0 rounded-full border-[3px] border-brand/20 border-t-brand" />
            )}
            {(active.phase === "accepted" || active.phase === "arriving") && (
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.4 }}
                className="h-3 w-3 shrink-0 rounded-full bg-brand"
              />
            )}
            {active.phase === "ontrip" && (
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.8 }}
                className="h-3 w-3 shrink-0 rounded-full bg-green"
              />
            )}
            {active.phase === "arrived" && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-green text-white text-sm"
              >
                ✓
              </motion.span>
            )}
            <div>
              <h1 className="text-xl font-black text-ink">{status.title}</h1>
              <p className="text-sm text-muted">{status.sub}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Driver card slides up */}
        <AnimatePresence>
          {showDriverCard && active.driver && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
            >
              <DriverCard
                driver={active.driver}
                etaLabel={
                  active.phase === "arrived" ? "At your pickup now" :
                  active.phase === "ontrip" ? `Heading to ${dest?.title ?? "destination"}` :
                  `Arrives in ~${active.etaMin} min`
                }
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trip chip */}
        <motion.div
          layout
          className="mt-3 flex items-center justify-between rounded-2xl bg-chip px-4 py-3.5"
        >
          <span className="flex items-center gap-2 font-bold text-ink">
            <span className="text-2xl">{rideType.emoji}</span> {rideType.name}
          </span>
          <span className="font-bold text-brand">
            {dest ? "₺3.128 – 3.898" : "Set destination"}
          </span>
        </motion.div>

        {/* Cancel */}
        <AnimatePresence>
          {["searching", "accepted", "arriving"].includes(active.phase) && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setConfirmCancel(true)}
              className="mt-3 w-full min-h-[52px] rounded-2xl border-2 border-alert/50 font-bold text-alert flex items-center justify-center gap-2"
            >
              Cancel ride
              {secondsLeft > 0 && (
                <span className="font-semibold text-muted text-sm">· free for {secondsLeft}s</span>
              )}
            </motion.button>
          )}
        </AnimatePresence>

        {active.phase === "arrived" && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 rounded-2xl bg-lavender px-4 py-3.5 text-center text-sm font-bold text-brand"
          >
            Look for {active.driver?.car} · <span className="font-black">{active.driver?.plate}</span>
          </motion.p>
        )}
      </Sheet>

      {/* Fault modal */}
      <AnimatePresence>
        {active.fault && (
          <FaultModal
            fault={active.fault}
            onPrimary={() => {
              const f = active.fault;
              clearFault();
              if (f === "gps-weak") router.push("/destination");
              else retryRequest();
            }}
            onSecondary={() => {
              const f = active.fault;
              clearFault();
              if (f === "auth-failed") router.push("/payment");
              else if (f === "no-drivers") router.push("/booking");
              else if (f === "driver-cancelled") cancelRide();
              else retryRequest();
            }}
          />
        )}
      </AnimatePresence>

      {/* Cancel confirmation */}
      <AnimatePresence>
        {confirmCancel && (
          <Modal onDismiss={() => setConfirmCancel(false)}>
            <h2 className="text-xl font-black text-ink">Cancel this ride?</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">
              {secondsLeft > 0
                ? "You're within the free-cancel window — no charge."
                : "A ₺25 cancellation fee may apply as your driver is already on the way."}
            </p>
            <div className="mt-5 space-y-2">
              <Button
                full
                loading={cancellingNow}
                onClick={() => {
                  setCancellingNow(true);
                  setTimeout(() => {
                    setConfirmCancel(false);
                    setCancellingNow(false);
                    cancelRide();
                  }, 500);
                }}
              >
                {cancellingNow ? "Cancelling…" : "Yes, cancel"}
              </Button>
              <button onClick={() => setConfirmCancel(false)} className="w-full py-2 font-bold text-brand underline">
                Keep my ride
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Completed / rating screen ──────────────────────────────────────────────
function CompletedScreen({ active, rideType, rateRide, showToast, completeAck, reset, router }: {
  active: Active;
  rideType: ReturnType<typeof rideTypeById>;
  rateRide: (s: number) => void;
  showToast: (m: string, t?: "ok" | "warn") => void;
  completeAck: () => void;
  reset: () => void;
  router: ReturnType<typeof useRouter>;
}) {
  const rated = active.rated;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 flex flex-col bg-white"
    >
      <Toast />
      <div className="flex-1 overflow-y-auto px-5 pt-12 pb-4">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
            className="grid h-20 w-20 place-items-center rounded-full bg-green text-white"
          >
            <CheckIcon size={36} />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-5 text-3xl font-black text-ink"
          >
            You've arrived 🎉
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="mt-1 text-muted text-base"
          >
            {active.destination?.title}
          </motion.p>
        </div>

        {/* Rating */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-7 rounded-3xl border border-hairline p-5"
        >
          <p className="text-center text-lg font-bold text-ink">
            How was your ride with {active.driver?.name.split(" ")[0]}?
          </p>
          <div className="mt-4 flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <motion.button
                key={s}
                whileTap={{ scale: 0.85 }}
                whileHover={{ scale: 1.15 }}
                aria-label={`${s} star${s > 1 ? "s" : ""}`}
                onClick={() => { rateRide(s); showToast("Thanks for the rating!", "ok"); }}
                className={(rated ?? 0) >= s ? "text-taxi" : "text-hairline"}
              >
                <StarIcon size={40} filled={(rated ?? 0) >= s} />
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Payment summary */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 rounded-3xl border border-hairline p-5"
        >
          <h2 className="text-lg font-black text-ink mb-3">Payment summary</h2>
          <SummaryRow label={`${rideType?.name} fare`} value="₺3.128" />
          <SummaryRow label="bitaksiMoney earned" value="+₺77" green />
          <div className="my-3 border-t border-hairline" />
          <SummaryRow label="Total · Mastercard ••4827" value="₺3.128" bold />
        </motion.div>
      </div>

      <div className="border-t border-hairline px-5 pt-3" style={{ paddingBottom: "calc(1.25rem + var(--sab, 0px))" }}>
        <Button full onClick={() => { completeAck(); reset(); router.push("/booking"); }}>
          Done
        </Button>
      </div>
    </motion.div>
  );
}

function SummaryRow({ label, value, bold, green }: { label: string; value: string; bold?: boolean; green?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className={`text-sm ${bold ? "font-black text-ink" : "text-muted"}`}>{label}</span>
      <span className={`text-sm font-bold ${green ? "text-green" : "text-ink"}`}>{value}</span>
    </div>
  );
}
