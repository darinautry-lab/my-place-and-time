"use client";

import "@/lib/leafletDefaults";
import { userLocationIcon } from "@/lib/mapIcons";
import { terrainLayer } from "@/lib/layers/terrain";
import { satelliteLayer } from "@/lib/layers/satellite";
import { noaaRadarLayer } from "@/lib/layers/noaaRadar";
import LayerRenderer from "@/components/LayerRenderer";
import { overlayLayers, type OverlayLayerId } from "@/lib/layerRegistry";
import { useEffect, useState, useRef } from "react";
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

const SEARCH_RADIUS_METERS = 24140; // ~15 miles in meters

/* =========================================================
   MAP CENTER
   (Initial one-time fly-to when user location becomes available)
========================================================= */
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      map.flyTo(center, 11);
      initialized.current = true;
    }
  }, [center, map]);

  return null;
}

/* =========================================================
   FULLSCREEN CONTROL (native browser fullscreen)
========================================================= */
function FullscreenControl() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();

    const control = new L.Control({ position: "topleft" });

    control.onAdd = () => {
      const btn = L.DomUtil.create("button", "leaflet-bar");

      btn.innerHTML = "⛶";
      btn.title = "Fullscreen map";

      btn.style.width = "34px";
      btn.style.height = "34px";
      btn.style.fontSize = "18px";
      btn.style.cursor = "pointer";
      btn.style.background = "white";

      L.DomEvent.on(btn, "click", (e) => {
        L.DomEvent.stopPropagation(e);
        L.DomEvent.preventDefault(e);

        if (!document.fullscreenElement) {
          container.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      });

      return btn;
    };

    control.addTo(map);

    return () => {
      control.remove();
    };
  }, [map]);

  return null;
}

/* =========================================================
   MAIN COMPONENT
========================================================= */
export default function LocationMap({ lat, lng, loading }: LocationMapProps) {
  const hasLocation = lat !== null && lng !== null;

  const center: [number, number] =
    lat !== null && lng !== null ? [lat, lng] : [40.7128, -74.006]; // fallback NYC

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
  const [showRadar, setShowRadar] = useState(false);

  /* =========================================================
     NOAA STATIONS, RIVER, RESTAURANT STATE
  =========================================================*/
  const [enabledOverlays, setEnabledOverlays] = useState<
    Record<OverlayLayerId, boolean>
  >({
    weatherStations: false,
    riverGauges: false,
    restaurants: false,
  });

  const toggleOverlay = (id: OverlayLayerId) => {
    setEnabledOverlays((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const dataLayers = overlayLayers.filter((l) => l.group === "data");

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
              {center[0].toFixed(4)}°, {center[1].toFixed(4)}°
            </span>
          )}
        </div>

        {/* MAP AREA */}
        <div className="relative h-[350px] md:h-[420px]">
          {/* LAYER CONTROLS */}
          <div className="absolute top-4 right-4 z-[1000] bg-black/60 p-3 rounded-lg space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">
              Map
            </div>
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

            {/* DATA LAYERS */}
            <div className="pt-2 border-t border-white/10">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                Data Layers
              </div>

              {dataLayers.map(({ id, label }) => (
                <label
                  key={id}
                  className="flex items-center gap-2 text-xs text-white"
                >
                  <input
                    type="checkbox"
                    checked={enabledOverlays[id]}
                    onChange={() => toggleOverlay(id)}
                  />
                  {label}
                </label>
              ))}
            </div>
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
            attributionControl={true}
          >
            <FullscreenControl />

            {/* BASEMAP */}
            {!showTerrain && !showSatellite && (
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution="&copy; OpenStreetMap contributors &copy; CARTO"
              />
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
                  radius={SEARCH_RADIUS_METERS}
                  pathOptions={{
                    color: "#3b82f6",
                    fillColor: "#3b82f6",
                    fillOpacity: 0.15,
                  }}
                />

                <Marker position={center} icon={userLocationIcon} />
              </>
            )}

            {/* WEATHER, RIVER GAUGES, AND RESTAURANT LAYERS */}
            {overlayLayers.map(({ id, layer }) => (
              <LayerRenderer
                key={id}
                layer={layer}
                enabled={enabledOverlays[id]}
              />
            ))}
          </MapContainer>
        </div>
      </div>
    </motion.div>
  );
}
