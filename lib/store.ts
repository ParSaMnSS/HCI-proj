"use client";

import { create } from "zustand";
import {
  PICKUP,
  RIDE_TYPES,
  INITIAL_CARDS,
  randomDriver,
  tripDistanceKm,
  buildRoute,
  type SavedAddress,
  type RideType,
  type Driver,
  type Card,
  type LngLat,
} from "./mock/data";
import { TIMINGS, runTimeline } from "./mock/timeline";
import { rollFault, type FaultKind } from "./mock/faults";

export type RidePhase =
  | "idle" // choosing on the booking screen
  | "searching" // request sent, waiting for a driver to accept
  | "accepted" // driver assigned, on the way
  | "arriving" // driver about to arrive
  | "arrived" // driver at pickup
  | "ontrip" // moving to destination
  | "completed" // trip finished → rate & pay
  | "cancelled";

export type Active = {
  phase: RidePhase;
  rideTypeId: string;
  pickup: SavedAddress;
  destination: SavedAddress | null;
  driver: Driver | null;
  route: LngLat[];
  etaMin: number; // minutes shown to user
  startedAt: number;
  fault: FaultKind | null; // surfaced error, if any
  rated: number | null;
};

type State = {
  // selection
  rideTypeId: string;
  destination: SavedAddress | null;
  cards: Card[];

  // user's real GPS location (null until granted)
  userLocation: SavedAddress | null;
  locating: boolean;

  // active ride
  active: Active | null;

  // onboarding
  onboarded: boolean;

  // toast
  toast: { id: number; msg: string; tone: "ok" | "warn" } | null;

  // ── actions ──
  setRideType: (id: string) => void;
  setDestination: (a: SavedAddress | null) => void;
  request: () => void;
  clearFault: () => void;
  retryRequest: () => void;
  cancelRide: () => void;
  completeAck: () => void; // close completed screen → back to idle
  rateRide: (stars: number) => void;
  reset: () => void;

  addCard: (c: Omit<Card, "id" | "isDefault">) => void;
  makeDefault: (id: string) => void;
  removeCard: (id: string) => void;

  finishOnboarding: () => void;
  showToast: (msg: string, tone?: "ok" | "warn") => void;

  /** Request the device's real GPS location and store it as the pickup. */
  locateUser: () => void;
};

let _cancelTimeline: (() => void) | null = null;
let _toastId = 0;

export function rideTypeById(id: string): RideType {
  return RIDE_TYPES.find((r) => r.id === id) ?? RIDE_TYPES[0];
}

function startLifecycle(set: (fn: (s: State) => Partial<State>) => void, get: () => State) {
  _cancelTimeline?.();

  const acceptMs = TIMINGS.acceptMs();

  _cancelTimeline = runTimeline([
    {
      // driver accepts (or we roll a "no-drivers" fault here)
      at: acceptMs,
      run: () => {
        const fault = rollFault("no-drivers");
        if (fault) {
          set((s) => ({
            active: s.active ? { ...s.active, fault } : s.active,
          }));
          return;
        }
        const a = get().active;
        if (!a) return;
        const driver = randomDriver();
        set((s) => ({
          active: s.active
            ? { ...s.active, phase: "accepted", driver, etaMin: 3 }
            : s.active,
        }));
        scheduleArrival(set, get);
      },
    },
  ]);
}

function scheduleArrival(
  set: (fn: (s: State) => Partial<State>) => void,
  get: () => State,
) {
  const arriveMs = TIMINGS.arriveMs();
  _cancelTimeline?.();
  _cancelTimeline = runTimeline([
    {
      at: arriveMs * 0.7,
      run: () =>
        set((s) => ({
          active: s.active ? { ...s.active, phase: "arriving", etaMin: 1 } : s.active,
        })),
    },
    {
      at: arriveMs,
      run: () => {
        // small chance the driver cancels right as they arrive
        const fault = rollFault("driver-cancelled");
        if (fault) {
          set((s) => ({ active: s.active ? { ...s.active, fault } : s.active }));
          return;
        }
        set((s) => ({
          active: s.active ? { ...s.active, phase: "arrived", etaMin: 0 } : s.active,
        }));
        scheduleTrip(set, get);
      },
    },
  ]);
}

function scheduleTrip(
  set: (fn: (s: State) => Partial<State>) => void,
  get: () => State,
) {
  const tripMs = TIMINGS.tripMs();
  _cancelTimeline?.();
  _cancelTimeline = runTimeline([
    {
      at: 2500,
      run: () =>
        set((s) => ({
          active: s.active ? { ...s.active, phase: "ontrip" } : s.active,
        })),
    },
    {
      at: tripMs,
      run: () =>
        set((s) => ({
          active: s.active ? { ...s.active, phase: "completed" } : s.active,
        })),
    },
  ]);
}

export const useStore = create<State>((set, get) => ({
  rideTypeId: "standard",
  destination: null,
  cards: INITIAL_CARDS,
  userLocation: null,
  locating: false,
  active: null,
  onboarded: false,
  toast: null,

  setRideType: (id) => set({ rideTypeId: id }),
  setDestination: (a) => set({ destination: a }),

  request: () => {
    const { rideTypeId, destination, userLocation } = get();
    const dest = destination;
    const origin = userLocation ?? PICKUP; // start from real GPS if granted
    const route = dest ? buildRoute(origin.lngLat, dest.lngLat) : [];

    // payment / auth fault can fire at request time
    const payFault = rollFault("auth-failed");

    set({
      active: {
        phase: "searching",
        rideTypeId,
        pickup: origin,
        destination: dest,
        driver: null,
        route,
        etaMin: 0,
        startedAt: Date.now(),
        fault: payFault,
        rated: null,
      },
    });

    if (!payFault) startLifecycle(set, get);
  },

  clearFault: () =>
    set((s) => ({ active: s.active ? { ...s.active, fault: null } : s.active })),

  retryRequest: () => {
    const a = get().active;
    if (!a) return;
    // clear fault, go back to searching, re-run the lifecycle
    set({
      active: { ...a, fault: null, phase: "searching", driver: null },
    });
    const payFault = rollFault("auth-failed");
    if (payFault) {
      set((s) => ({ active: s.active ? { ...s.active, fault: payFault } : s.active }));
      return;
    }
    startLifecycle(set, get);
  },

  cancelRide: () => {
    _cancelTimeline?.();
    _cancelTimeline = null;
    set((s) => ({ active: s.active ? { ...s.active, phase: "cancelled" } : s.active }));
  },

  completeAck: () => {
    _cancelTimeline?.();
    _cancelTimeline = null;
    set({ active: null });
  },

  rateRide: (stars) =>
    set((s) => ({ active: s.active ? { ...s.active, rated: stars } : s.active })),

  reset: () => {
    _cancelTimeline?.();
    _cancelTimeline = null;
    set({ active: null, destination: null, rideTypeId: "standard" });
  },

  addCard: (c) =>
    set((s) => {
      const id = "c" + Math.floor(1000 + Math.random() * 9000);
      const makeDefault = s.cards.length === 0;
      const cards = s.cards.map((x) => ({ ...x, isDefault: makeDefault ? false : x.isDefault }));
      cards.push({ ...c, id, isDefault: makeDefault });
      return { cards };
    }),

  makeDefault: (id) =>
    set((s) => ({
      cards: s.cards.map((c) => ({ ...c, isDefault: c.id === id })),
    })),

  removeCard: (id) =>
    set((s) => {
      let cards = s.cards.filter((c) => c.id !== id);
      if (cards.length && !cards.some((c) => c.isDefault)) {
        cards = cards.map((c, i) => ({ ...c, isDefault: i === 0 }));
      }
      return { cards };
    }),

  finishOnboarding: () => set({ onboarded: true }),

  showToast: (msg, tone = "ok") => {
    const id = ++_toastId;
    set({ toast: { id, msg, tone } });
    setTimeout(() => {
      if (get().toast?.id === id) set({ toast: null });
    }, 2600);
  },

  locateUser: () => {
    const { showToast } = get();
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      showToast("Location isn't supported on this device", "warn");
      return;
    }
    set({ locating: true });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lngLat: LngLat = [pos.coords.longitude, pos.coords.latitude];
        set({
          locating: false,
          userLocation: {
            id: "user-location",
            title: "Your current location",
            subtitle: "Detected via GPS",
            lngLat,
            kind: "saved",
          },
        });
        showToast("Centered on your location", "ok");
      },
      (err) => {
        set({ locating: false });
        showToast(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied"
            : "Couldn't get your location",
          "warn",
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );
  },
}));

// Derived helpers used by screens
export function tripKm(dest: SavedAddress | null): number {
  if (!dest) return 0;
  return tripDistanceKm(PICKUP.lngLat, dest.lngLat);
}
