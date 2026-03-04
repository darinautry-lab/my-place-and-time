// Base type for data returned by map layers
export type LayerData = unknown;

// Universal map layer definition
export type MapLayer = {
  id: string;
  name: string;
  enabled: boolean;
  fetchData?: (lat: number, lng: number) => Promise<LayerData>;
};

export const layers: MapLayer[] = [
  {
    id: "restaurants",
    name: "Restaurants",
    enabled: true,
  },
  {
    id: "weatherStations",
    name: "Weather Stations",
    enabled: true,
  },
  {
    id: "noaaRadar",
    name: "NOAA Radar",
    enabled: true,
  },
];
