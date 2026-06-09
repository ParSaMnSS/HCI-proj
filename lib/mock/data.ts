// All mock domain data. Nothing here talks to a real backend.

export type LngLat = [number, number];

export type RideType = {
  id: string;
  name: string;
  blurb?: string;
  capacity: number;
  /** base per-km fare multiplier, used to derive the mock price range */
  rate: number;
  badge?: "discount" | "priority";
  emoji: string; // simple stand-in for the 3D car render
};

export const RIDE_TYPES: RideType[] = [
  { id: "standard", name: "Standard", capacity: 4, rate: 1, emoji: "🚕" },
  {
    id: "discounted",
    name: "Discounted",
    blurb: "Cheaper, may take a little longer.",
    capacity: 4,
    rate: 0.82,
    badge: "discount",
    emoji: "🚖",
  },
  {
    id: "priority",
    name: "Priority",
    blurb: "Your taxi will arrive faster.",
    capacity: 4,
    rate: 1.25,
    badge: "priority",
    emoji: "🚕",
  },
  { id: "large", name: "Large", blurb: "Extra room, up to 8.", capacity: 8, rate: 1.45, emoji: "🚐" },
];

export type SavedAddress = {
  id: string;
  title: string;
  subtitle: string;
  lngLat: LngLat;
  kind: "recent" | "saved";
};

// Pickup is the centre of the screenshots (Gebze / İstanbul Çevre Yolu area).
export const PICKUP: SavedAddress = {
  id: "pickup",
  title: "Huzur Mah., 2. Çevre Yolu, 29",
  subtitle: "Current location",
  lngLat: [29.43, 40.81],
  kind: "saved",
};

export const QUICK_DESTINATIONS: SavedAddress[] = [
  { id: "ist-airport", title: "İstanbul Airport", subtitle: "Arnavutköy", lngLat: [28.7419, 41.2753], kind: "saved" },
  { id: "istinye", title: "İstinye Park", subtitle: "Sarıyer", lngLat: [29.0336, 41.1086], kind: "saved" },
  { id: "taksim", title: "Taksim Square", subtitle: "Beyoğlu", lngLat: [28.9856, 41.0370], kind: "saved" },
  { id: "kadikoy", title: "Kadıköy İskele", subtitle: "Kadıköy", lngLat: [29.0245, 40.9907], kind: "saved" },
];

export const RECENT_ADDRESSES: SavedAddress[] = [
  { id: "r1", title: "Beylikbağı Mah., Aşıroğlu Cad.", subtitle: "Gebze", lngLat: [29.4307, 40.8024], kind: "recent" },
  { id: "r2", title: "Osmangazi Mah., Fatih Sultan Mehmet Cad.", subtitle: "Darıca", lngLat: [29.3855, 40.7669], kind: "recent" },
  { id: "r3", title: "Yunus Emre Mah., Lütfi Aykaç Bulvarı", subtitle: "Sultanbeyli", lngLat: [29.2671, 40.9633], kind: "recent" },
];

export type Driver = {
  name: string;
  rating: number;
  trips: number;
  car: string;
  color: string;
  plate: string;
  photoHue: number; // used to tint a generated avatar
};

const DRIVERS: Driver[] = [
  { name: "Mehmet Yılmaz", rating: 4.9, trips: 4213, car: "Fiat Egea", color: "Yellow", plate: "34 TXI 182", photoHue: 28 },
  { name: "Ayşe Demir", rating: 4.8, trips: 2871, car: "Toyota Corolla", color: "Yellow", plate: "34 BTK 909", photoHue: 320 },
  { name: "Hasan Kaya", rating: 5.0, trips: 5560, car: "Renault Megane", color: "Yellow", plate: "34 ABC 047", photoHue: 200 },
  { name: "Zeynep Şahin", rating: 4.7, trips: 1944, car: "Hyundai i20", color: "Yellow", plate: "34 ZYN 551", photoHue: 150 },
  { name: "Emre Aydın", rating: 4.9, trips: 3380, car: "Volkswagen Passat", color: "Yellow", plate: "34 EMR 312", photoHue: 260 },
];

import { pick, randInt } from "./random";

export function randomDriver(): Driver {
  return pick(DRIVERS);
}

export type Card = {
  id: string;
  brand: "visa" | "mastercard";
  last4: string;
  exp: string;
  holder: string;
  isDefault: boolean;
};

export const INITIAL_CARDS: Card[] = [
  { id: "c1", brand: "mastercard", last4: "4827", exp: "08/27", holder: "P. Mansouri", isDefault: true },
];

export function newCardId() {
  return "c" + randInt(1000, 9999);
}

// ── Geometry helpers ───────────────────────────────────────────────
function haversineKm(a: LngLat, b: LngLat): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function tripDistanceKm(from: LngLat, to: LngLat): number {
  return Math.max(0.5, haversineKm(from, to) * 1.25); // ×1.25 ≈ road vs crow-fly
}

/** Mock price range "₺low - ₺high" for a ride type over a distance. */
export function fareRange(km: number, rate: number): { low: number; high: number } {
  const base = 90;
  const perKm = 38 * rate;
  const mid = base + km * perKm;
  return { low: Math.round(mid * 0.92), high: Math.round(mid * 1.18) };
}

export function formatFare(km: number, rate: number): string {
  const { low, high } = fareRange(km, rate);
  return `₺${low.toLocaleString("tr-TR")} - ${high.toLocaleString("tr-TR")}`;
}

/** Build a simple polyline (few waypoints) between two points for the map route. */
export function buildRoute(from: LngLat, to: LngLat, points = 6): LngLat[] {
  const route: LngLat[] = [];
  for (let i = 0; i <= points; i++) {
    const t = i / points;
    // slight sine wobble so it doesn't look like a ruler line
    const wobble = Math.sin(t * Math.PI) * 0.012;
    const lng = from[0] + (to[0] - from[0]) * t + wobble;
    const lat = from[1] + (to[1] - from[1]) * t - wobble * 0.5;
    route.push([lng, lat]);
  }
  return route;
}
