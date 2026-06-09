"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import { MAP_STYLE } from "@/lib/mapStyle";
import type { LngLat } from "@/lib/mock/data";

export type MapViewProps = {
  center: LngLat;
  zoom?: number;
  pickup?: LngLat | null;
  destination?: LngLat | null;
  route?: LngLat[] | null;
  driver?: LngLat | null;
  idleTaxis?: LngLat[];
  fitBounds?: boolean;
  interactive?: boolean;
};

function pinEl(kind: "pickup" | "dest") {
  const el = document.createElement("div");
  el.style.cssText =
    "width:26px;height:26px;border-radius:50%;display:grid;place-items:center;" +
    "box-shadow:0 4px 10px rgba(20,20,40,.35);border:3px solid #fff;background:#2e1a8f;";
  const dot = document.createElement("div");
  dot.style.cssText = "width:9px;height:9px;border-radius:50%;background:#fff;";
  el.appendChild(dot);
  if (kind === "dest") el.style.background = "#e8470f";
  return el;
}

function taxiEl() {
  const el = document.createElement("div");
  el.textContent = "🚕";
  el.style.cssText =
    "font-size:24px;filter:drop-shadow(0 3px 4px rgba(0,0,0,.3));transform:translateY(2px);";
  return el;
}

function driverEl() {
  const el = document.createElement("div");
  el.style.cssText = "position:relative;width:42px;height:42px;";
  el.innerHTML =
    '<div style="position:absolute;inset:0;border-radius:50%;background:rgba(46,26,143,.18)"></div>' +
    '<div style="position:absolute;inset:6px;border-radius:50%;background:#fff;border:3px solid #2e1a8f;display:grid;place-items:center;font-size:18px">🚕</div>';
  return el;
}

export default function MapView(props: MapViewProps) {
  const {
    center,
    zoom = 14,
    pickup,
    destination,
    route,
    driver,
    idleTaxis,
    fitBounds,
    interactive = true,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const driverMarkerRef = useRef<maplibregl.Marker | null>(null);
  const readyRef = useRef(false);

  // init once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center,
      zoom,
      attributionControl: false,
      interactive,
    });
    mapRef.current = map;

    map.on("load", () => {
      readyRef.current = true;
      // Defer resize by one frame so the browser has committed the flex layout
      setTimeout(() => map.resize(), 0);
      drawRoute();
      drawStaticMarkers();
    });

    // ResizeObserver keeps the map properly sized if the container changes
    const ro = new ResizeObserver(() => {
      if (mapRef.current) mapRef.current.resize();
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      readyRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function drawRoute() {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    const SRC = "route";
    const coords = route ?? [];

    if (map.getLayer("route-line")) map.removeLayer("route-line");
    if (map.getLayer("route-casing")) map.removeLayer("route-casing");
    if (map.getSource(SRC)) map.removeSource(SRC);
    if (coords.length < 2) return;

    const trafficColors = ["#1e9e5a", "#f5c518", "#e8470f"];
    const features = [];
    for (let i = 0; i < coords.length - 1; i++) {
      features.push({
        type: "Feature" as const,
        properties: { color: trafficColors[i % 3 === 2 ? 2 : i % 3] },
        geometry: {
          type: "LineString" as const,
          coordinates: [coords[i], coords[i + 1]],
        },
      });
    }
    map.addSource(SRC, {
      type: "geojson",
      data: { type: "FeatureCollection", features },
    });
    map.addLayer({
      id: "route-casing",
      type: "line",
      source: SRC,
      paint: { "line-color": "#ffffff", "line-width": 9, "line-opacity": 0.9 },
      layout: { "line-cap": "round", "line-join": "round" },
    });
    map.addLayer({
      id: "route-line",
      type: "line",
      source: SRC,
      paint: { "line-color": ["get", "color"], "line-width": 5 },
      layout: { "line-cap": "round", "line-join": "round" },
    });
  }

  function clearMarkers() {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
  }

  function drawStaticMarkers() {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    clearMarkers();
    (idleTaxis ?? []).forEach((t) => {
      markersRef.current.push(
        new maplibregl.Marker({ element: taxiEl() }).setLngLat(t).addTo(map),
      );
    });
    if (pickup) {
      markersRef.current.push(
        new maplibregl.Marker({ element: pinEl("pickup") }).setLngLat(pickup).addTo(map),
      );
    }
    if (destination) {
      markersRef.current.push(
        new maplibregl.Marker({ element: pinEl("dest") }).setLngLat(destination).addTo(map),
      );
    }
  }

  useEffect(() => {
    drawRoute();
    drawStaticMarkers();
    const map = mapRef.current;
    if (map && readyRef.current && fitBounds && pickup && destination) {
      const b = new maplibregl.LngLatBounds(pickup, pickup);
      b.extend(destination);
      if (driver) b.extend(driver);
      map.fitBounds(b, { padding: { top: 90, bottom: 320, left: 60, right: 60 }, duration: 700 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    JSON.stringify(route),
    JSON.stringify(pickup),
    JSON.stringify(destination),
    JSON.stringify(idleTaxis),
    fitBounds,
  ]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!driver) {
      driverMarkerRef.current?.remove();
      driverMarkerRef.current = null;
      return;
    }
    if (!driverMarkerRef.current) {
      driverMarkerRef.current = new maplibregl.Marker({ element: driverEl() })
        .setLngLat(driver)
        .addTo(map);
    } else {
      driverMarkerRef.current.setLngLat(driver);
    }
  }, [driver]);

  useEffect(() => {
    const map = mapRef.current;
    if (map && readyRef.current && !fitBounds) {
      map.easeTo({ center, zoom, duration: 600 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(center), zoom]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      aria-label="Map"
      // Explicit min dimensions ensure MapLibre always has a real size to measure
      style={{ minWidth: 1, minHeight: 1 }}
    />
  );
}
