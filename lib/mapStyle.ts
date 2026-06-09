import type { StyleSpecification } from "maplibre-gl";

// No API key required: CARTO "Positron" raster tiles — a clean, light basemap
// close to BiTaksi's pale map look. Falls back gracefully if offline (grey bg).
export const MAP_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    carto: {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        "https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        "https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "© OpenStreetMap © CARTO",
    },
  },
  layers: [
    { id: "bg", type: "background", paint: { "background-color": "#e8eef3" } },
    { id: "carto", type: "raster", source: "carto" },
  ],
};
