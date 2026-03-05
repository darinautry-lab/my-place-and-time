"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Circle,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { terrainLayer } from "@/lib/layers/terrain";
import { satelliteLayer } from "@/lib/layers/satellite";
import { noaaRadarLayer } from "@/lib/layers/noaaRadar";
import { fetchRestaurants } from "@/lib/layers/restaurants";

type LocationMapProps = {
  lat: number | null;
  lng: number | null;
  loading: boolean;
};

type Restaurant = {
  id: number;
  lat: number;
  lon: number;
  tags?: {
    name?: string;
    cuisine?: string;
  };
};

/* =========================================================
   FIX DEFAULT LEAFLET MARKER ICON PATHS
   (Leaflet does not auto-resolve CDN icons in Next.js)
========================================================= */
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: () => string })
  ._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

/* =========================================================
   CUSTOM USER LOCATION MARKER
========================================================= */
const customIcon = new L.DivIcon({
  html: `<div style="
    width: 20px;
    height: 20px;
    background: #3B82F6;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 0 20px rgba(59,130,246,0.5), 0 2px 8px rgba(0,0,0,0.3);
  "></div>`,
  className: "",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const ONE_MILE_METERS = 1609.34;

/* =========================================================
   MAP RECENTER HELPER
   (Re-centers map when user location changes)
========================================================= */
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, 14, { animate: true, duration: 1.5 });
  }, [center, map]);

  return null;
}

/* =========================================================
   RESTAURANT FETCHER COMPONENT
   This listens for map movement and triggers fetch
========================================================= */
function RestaurantFetcher({
  enabled,
  onFetch,
}: {
  enabled: boolean;
  onFetch: (bounds: L.LatLngBounds) => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (!enabled) return;

    const handleMoveEnd = () => {
      const bounds = map.getBounds();
      onFetch(bounds);
    };

    map.on("moveend", handleMoveEnd);

    // Initial load
    handleMoveEnd();

    return () => {
      map.off("moveend", handleMoveEnd);
    };
  }, [map, enabled, onFetch]);

  return null;
}

/* =========================================================
   MAIN COMPONENT
========================================================= */
export default function LocationMap({ lat, lng, loading }: LocationMapProps) {
  const hasLocation = lat !== null && lng !== null;

  const center: [number, number] = hasLocation
    ? [lat!, lng!]
    : [40.7128, -74.006]; // fallback NYC

  /* =========================================================
     TERRAIN STATE
  ========================================================= */
  const [showTerrain, setShowTerrain] = useState(false);

  /* =========================================================
     SATELLITE STATE
  ========================================================= */
  const [showSatellite, setShowSatellite] = useState(false);

  /* =========================================================
     NOAA RADAR STATE
  ========================================================= */
  const [showRadar, setShowRadar] = useState(true);

  /* =========================================================
     RESTAURANT STATE
     This stores restaurant results from Overpass
  ========================================================= */
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [showRestaurants, setShowRestaurants] = useState(false);

  const handleRestaurantFetch = async (bounds: L.LatLngBounds) => {
    const data = await fetchRestaurants(bounds);
    setRestaurants(data);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
    >
      <div className="relative backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-3xl overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center gap-2 px-8 pt-6 pb-4">
          <MapPin className="w-4 h-4 text-blue-400/70" />
          <span className="text-xs font-medium tracking-[0.2em] uppercase text-slate-400">
            Your Location
          </span>

          {hasLocation && (
            <span className="ml-auto text-xs text-slate-500 font-mono">
              {lat!.toFixed(4)}°, {lng!.toFixed(4)}°
            </span>
          )}
        </div>

        {/* MAP AREA */}
        <div className="relative h-[350px] md:h-[420px]">
          {/* LAYER CONTROLS */}
          <div className="absolute top-4 right-4 z-[1000] bg-black/60 p-3 rounded-lg space-y-1">
            <label className="flex items-center gap-2 text-xs text-white">
              <input
                type="checkbox"
                checked={showTerrain}
                onChange={() => {
                  setShowTerrain((prev) => {
                    const next = !prev;
                    if (next) setShowSatellite(false);
                    return next;
                  });
                }}
              />
              Terrain
            </label>

            <label className="flex items-center gap-2 text-xs text-white">
              <input
                type="checkbox"
                checked={showSatellite}
                onChange={() => {
                  setShowSatellite((prev) => {
                    const next = !prev;
                    if (next) setShowTerrain(false);
                    return next;
                  });
                }}
              />
              Satellite
            </label>

            <label className="flex items-center gap-2 text-xs text-white">
              <input
                type="checkbox"
                checked={showRadar}
                onChange={() => setShowRadar((prev) => !prev)}
              />
              Radar
            </label>

            <label className="flex items-center gap-2 text-xs text-white">
              <input
                type="checkbox"
                checked={showRestaurants}
                onChange={() => {
                  setShowRestaurants((prev) => {
                    const next = !prev;

                    if (!next) {
                      setRestaurants([]);
                    }

                    return next;
                  });
                }}
              />
              Restaurants
            </label>
          </div>
          {/* LOADING OVERLAY */}
          {loading && (
            <div className="absolute inset-0 z-[1000] bg-[#0A0F1C]/80 backdrop-blur-sm flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-400 rounded-full animate-spin" />
                <span className="text-sm text-slate-400">
                  Detecting location...
                </span>
              </div>
            </div>
          )}

          <MapContainer
            center={center}
            zoom={14}
            style={{ height: "100%", width: "100%" }}
            zoomControl={false}
            attributionControl={false}
          >
            {/* BASEMAP */}
            {!showTerrain && !showSatellite && (
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            )}

            {/* TERRAIN */}
            {showTerrain && (
              <TileLayer
                url={terrainLayer.url}
                attribution={terrainLayer.attribution}
              />
            )}

            {showSatellite && (
              <TileLayer
                url={satelliteLayer.url}
                attribution={satelliteLayer.attribution}
              />
            )}

            {/* NOAA RADAR LAYER */}
            {showRadar && (
              <TileLayer
                url={noaaRadarLayer.tileUrl}
                opacity={noaaRadarLayer.opacity}
              />
            )}

            {hasLocation && (
              <>
                <MapUpdater center={center} />

                <Circle
                  center={center}
                  radius={ONE_MILE_METERS}
                  pathOptions={{
                    color: "#3b82f6",
                    fillColor: "#3b82f6",
                    fillOpacity: 0.15,
                  }}
                />

                <Marker position={center} icon={customIcon} />
              </>
            )}

            {/* RESTAURANT LAYER */}
            {showRestaurants && (
              <>
                <RestaurantFetcher
                  enabled={showRestaurants}
                  onFetch={handleRestaurantFetch}
                />

                {restaurants.map((r) => (
                  <Marker key={r.id} position={[r.lat, r.lon]}>
                    <Popup>
                      <strong>{r.tags?.name || "Unnamed Restaurant"}</strong>
                      <br />
                      {r.tags?.cuisine || "Cuisine not specified"}
                    </Popup>
                  </Marker>
                ))}
              </>
            )}
          </MapContainer>
        </div>
      </div>
    </motion.div>
  );
}
