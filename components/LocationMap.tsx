"use client";

import "@/lib/leafletDefaults";
import { userLocationIcon } from "@/lib/mapIcons";
import { terrainLayer } from "@/lib/layers/terrain";
import { satelliteLayer } from "@/lib/layers/satellite";
import { noaaRadarLayer } from "@/lib/layers/noaaRadar";
import LayerRenderer from "@/components/LayerRenderer";
import { overlayLayers, type OverlayLayerId } from "@/lib/layerRegistry";
import LayerControlPanel from "@/components/LayerControlPanel";
import { useEffect, useState } from "react";
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
function MapUpdater({
  center,
  followMode,
  lockToUser,
  followTargetId,
}: {
  center: [number, number];
  followMode: boolean;
  lockToUser: boolean;
  followTargetId: string | null;
}) {
  const map = useMap();

  useEffect(() => {
    // Resolve which position to follow
    const targetPosition = followTargetId === "user" ? center : center; // future: swap for real entities

    console.log("🚀 MapUpdater fired:", {
      center,
      followMode,
      lockToUser,
      followTargetId,
    });

    if (lockToUser || followMode) {
      console.log("🧭 Flying to:", targetPosition);

      map.flyTo(targetPosition, map.getZoom(), {
        animate: true,
        duration: 0.75,
      });
    }
  }, [center, followMode, lockToUser, followTargetId, map]);

  return null;
}

/* =========================================================
   FOLLOW MODE HANDLER
   (Disables follow mode when user manually interacts with the map)
========================================================= */
function FollowModeHandler({
  followMode,
  lockToUser,
  setFollowMode,
}: {
  followMode: boolean;
  lockToUser: boolean;
  setFollowMode: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const map = useMap();

  useEffect(() => {
    const handleDragStart = () => {
      // If locked, ignore user movement entirely
      if (lockToUser) return;

      // If following, disable follow on manual drag
      if (followMode) {
        setFollowMode(false);
      }
    };

    map.on("dragstart", handleDragStart);

    return () => {
      map.off("dragstart", handleDragStart);
    };
  }, [map, followMode, lockToUser, setFollowMode]);

  return null;
}

/* =========================================================
   FULLSCREEN CONTROL (native browser fullscreen)
========================================================= */
function FullscreenControl() {
  const map = useMap();

  useEffect(() => {
    const control = new L.Control({ position: "topright" });

    control.onAdd = () => {
      const btn = L.DomUtil.create(
        "div",
        "leaflet-bar custom-fullscreen-button",
      );

      btn.innerHTML = `
        <div style="
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
        ">
          ⛶
        </div>
      `;

      btn.title = "Fullscreen map";
      btn.style.cursor = "pointer";

      L.DomEvent.on(btn, "click", (e) => {
        L.DomEvent.stopPropagation(e);
        L.DomEvent.preventDefault(e);

        const container = map
          .getContainer()
          .closest(".map-shell") as HTMLElement | null;

        if (!container) return;

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

  console.log("🗺️ Map received:", lat, lng);

  const center: [number, number] =
    lat !== null && lng !== null ? [lat, lng] : [40.7128, -74.006]; // fallback NYC

  console.log("📍 Center computed:", center);

  //const userEntity = {
  //  id: "user",
  //  position: center,
  //};

  const [followMode, setFollowMode] = useState(true); // User Location Update State (follow mode on by default)

  const [lockToUser, setLockToUser] = useState(false); // If true, user movement is ignored and follow mode cannot be disabled (used when user clicks "recenter" button in layer panel)

  //const [followTargetId, _setFollowTargetId] = useState<string | null>("user"); // ID of the entity to follow (currently only "user", but can be extended to other entities in the future)
  const [followTargetId] = useState<string | null>("user");

  /* =========================================================
     LAYER PANEL STATE
  ========================================================= */
  const [showLayerPanel, setShowLayerPanel] = useState(true);

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
        <div className="map-shell relative h-[410px] md:h-[500px]">
          {/* LAYER CONTROLS */}
          <LayerControlPanel
            showLayerPanel={showLayerPanel}
            setShowLayerPanel={setShowLayerPanel}
            showTerrain={showTerrain}
            setShowTerrain={setShowTerrain}
            showSatellite={showSatellite}
            setShowSatellite={setShowSatellite}
            showRadar={showRadar}
            setShowRadar={setShowRadar}
            enabledOverlays={enabledOverlays}
            toggleOverlay={toggleOverlay}
            dataLayers={dataLayers}
            followMode={followMode}
            setFollowMode={setFollowMode}
            lockToUser={lockToUser}
            setLockToUser={setLockToUser}
          />

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
                <MapUpdater
                  center={center}
                  followMode={followMode}
                  lockToUser={lockToUser}
                  followTargetId={followTargetId}
                />

                <FollowModeHandler
                  followMode={followMode}
                  lockToUser={lockToUser}
                  setFollowMode={setFollowMode}
                />

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
