"use client";

import type { OverlayLayerId } from "@/lib/layerRegistry";

type OverlayLayerOption = {
  id: OverlayLayerId;
  label: string;
};

type Props = {
  showLayerPanel: boolean;
  setShowLayerPanel: React.Dispatch<React.SetStateAction<boolean>>;
  showTerrain: boolean;
  setShowTerrain: React.Dispatch<React.SetStateAction<boolean>>;
  showSatellite: boolean;
  setShowSatellite: React.Dispatch<React.SetStateAction<boolean>>;
  showRadar: boolean;
  setShowRadar: React.Dispatch<React.SetStateAction<boolean>>;
  enabledOverlays: Record<OverlayLayerId, boolean>;
  toggleOverlay: (id: OverlayLayerId) => void;
  dataLayers: OverlayLayerOption[];
};

export default function LayerControlPanel({
  showLayerPanel,
  setShowLayerPanel,
  showTerrain,
  setShowTerrain,
  showSatellite,
  setShowSatellite,
  showRadar,
  setShowRadar,
  enabledOverlays,
  toggleOverlay,
  dataLayers,
}: Props) {
  return (
    <div className="custom-layer-panel absolute top-0 left-0 z-[1000] w-44 rounded-xl border border-white/10 bg-black/65 backdrop-blur-md shadow-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setShowLayerPanel((prev) => !prev)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-300 border-b border-white/10 hover:bg-white/5 transition"
      >
        <span>Layers</span>
        <span className="text-slate-400">{showLayerPanel ? "−" : "+"}</span>
      </button>

      {showLayerPanel && (
        <div className="p-3 space-y-3">
          {/* MAP */}
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400 mb-1">
              Map
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-2 text-xs text-white/95 leading-tight">
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

              <label className="flex items-center gap-2 text-xs text-white/95 leading-tight">
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

              <label className="flex items-center gap-2 text-xs text-white/95 leading-tight">
                <input
                  type="checkbox"
                  checked={showRadar}
                  onChange={() => setShowRadar((prev) => !prev)}
                />
                Radar
              </label>
            </div>
          </div>

          {/* DATA LAYERS */}
          <div className="pt-2 border-t border-white/10">
            <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400 mb-1">
              Data Layers
            </div>

            <div className="space-y-1">
              {dataLayers.map(({ id, label }) => (
                <label
                  key={id}
                  className="flex items-center gap-2 text-xs text-white/95 leading-tight"
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
        </div>
      )}
    </div>
  );
}
