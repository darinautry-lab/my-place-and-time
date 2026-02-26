"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Circle, Marker, useMap } from "react-leaflet";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

type LocationMapProps = {
  lat: number | null;
  lng: number | null;
  loading: boolean;
};

// Fix default marker icon paths
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

// Custom glowing blue marker
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

// Smoothly recenter map when coords update
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, 14, { animate: true, duration: 1.5 });
    }
  }, [center, map]);

  return null;
}

export default function LocationMap({ lat, lng, loading }: LocationMapProps) {
  const hasLocation = lat !== null && lng !== null;

  const center: [number, number] = hasLocation
    ? [lat!, lng!]
    : [40.7128, -74.006]; // fallback (NYC)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
    >
      <div className="relative backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-3xl overflow-hidden">
        {/* Header */}
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

        {/* Map container */}
        <div className="relative h-[350px] md:h-[420px]">
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
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

            {hasLocation && (
              <>
                <MapUpdater center={center} />

                {/* 1 mile radius */}
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
          </MapContainer>
        </div>
      </div>
    </motion.div>
  );
}
