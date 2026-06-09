# bitaksi (web) — HCI UX-improvement prototype

A web recreation of the **BiTaksi** taxi-hailing app, built for a Human-Computer
Interaction course. It keeps BiTaksi's visual identity (deep indigo + cream +
yellow taxi accents) but **layers in UX improvements** that fix the usability
problems found across 5 user tests.

Everything is **mock** — there is no backend, no real payments, no real drivers.
Timings are simulated and randomized, and errors are injected on purpose so the
improved error-recovery flows can be demonstrated.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
```

`npm run build` produces an optimized production build.

The app is laid out as a phone frame centered in the browser, so it reads like a
mobile app on desktop.

## The flow

1. **Splash** (`/`) → auto-advances to the map.
2. **Booking** (`/booking`) — map with idle taxis, editable pickup tag, search,
   quick-destination chips, ride types with **fares + ETA**, primary CTA. First
   visit shows a 4-step onboarding tour.
3. **Destination** (`/destination`) — origin/destination inputs, add home/work,
   recents, "pick from map".
4. **Ride** (`/ride`) — the full lifecycle, all simulated:
   `searching → driver accepts (random 3–11s) → on the way → arriving → arrived →
   on trip → completed`. Rich **driver info card** (rating, trips, car, plate,
   call/message/safety), live animated driver marker, traffic-coloured route,
   share-trip, and a cancel flow with a clear free-cancel window.
5. **Payment** (`/payment`) — saved cards, add-card with inline validation,
   security reassurance, success feedback, default-card management.
6. **HCI improvements** (`/ux-notes`) — every user-test problem → its solution,
   plus **demo controls** to force a specific mock error or set the random error
   rate (0–100%) so failures are reliably demonstrable.

## Randomness & mock errors

- `lib/mock/random.ts` — seedable RNG.
- `lib/mock/timeline.ts` — all mock timings in one place.
- `lib/mock/faults.ts` — injected errors (no drivers, payment/auth failed, weak
  GPS, driver cancels) with configurable rates. Use the demo controls on the
  **HCI improvements** page to trigger them on demand.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
Zustand (state) · MapLibre GL with free CARTO tiles (no API key).

> Note: the real app uses Apple Maps, which isn't available on the web, so the
> basemap is a close light-styled equivalent.
