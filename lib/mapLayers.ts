import type L from "leaflet";
import type { ReactNode } from "react";

export type MapLayer<T = unknown> = {
  id: string;
  name: string;
  enabledByDefault?: boolean;

  // Fetch layer data for current map bounds
  fetch?: (bounds: L.LatLngBounds) => Promise<T[]>;

  // Convert layer item into marker position + key
  renderMarker?: (item: T) => {
    key: string | number;
    position: [number, number];
  };

  // Render popup content for a marker
  renderPopup?: (item: T) => ReactNode;

  // Whether this is a tile layer instead of marker layer
  tileUrl?: string;
  opacity?: number;
  attribution?: string;
};

export type AnyMapLayer = {
  id: string;
  name: string;
  enabledByDefault?: boolean;
  fetch?: (bounds: L.LatLngBounds) => Promise<unknown[]>;
  renderMarker?: (item: unknown) => {
    key: string | number;
    position: [number, number];
  };
  renderPopup?: (item: unknown) => ReactNode;
  tileUrl?: string;
  opacity?: number;
  attribution?: string;
};
