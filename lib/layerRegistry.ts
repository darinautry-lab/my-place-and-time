import type { AnyMapLayer } from "@/lib/mapLayers";
import { restaurantLayer } from "@/lib/layers/restaurantLayer";
import { weatherStationLayer } from "@/lib/layers/weatherStationLayer";
import { riverGaugeLayer } from "@/lib/layers/riverGaugeLayer";

export type OverlayLayerId = "weatherStations" | "riverGauges" | "restaurants";

type OverlayLayerConfig = {
  id: OverlayLayerId;
  label: string;
  group: "data"; // future-proofing
  layer: AnyMapLayer;
};

export const overlayLayers: OverlayLayerConfig[] = [
  {
    id: "weatherStations",
    label: "Weather Stations",
    group: "data",
    layer: weatherStationLayer as AnyMapLayer,
  },
  {
    id: "riverGauges",
    label: "River Gauges",
    group: "data",
    layer: riverGaugeLayer as AnyMapLayer,
  },
  {
    id: "restaurants",
    label: "Restaurants",
    group: "data",
    layer: restaurantLayer as AnyMapLayer,
  },
];
