import type { MapLayer } from "@/lib/mapLayers";
import type L from "leaflet";
import { fetchRestaurants } from "@/lib/layers/restaurants";

export type Restaurant = {
  id: number;
  lat: number;
  lon: number;
  tags?: {
    name?: string;
    cuisine?: string;
  };
};

export const restaurantLayer: MapLayer<Restaurant> = {
  id: "restaurants",
  name: "Restaurants",
  enabledByDefault: false,

  fetch: async (bounds: L.LatLngBounds) => {
    return fetchRestaurants(bounds);
  },

  renderMarker: (restaurant) => ({
    key: restaurant.id,
    position: [restaurant.lat, restaurant.lon],
  }),

  renderPopup: (restaurant) => (
    <>
      <strong>{restaurant.tags?.name || "Unnamed Restaurant"}</strong>
      <br />
      {restaurant.tags?.cuisine || "Cuisine not specified"}
    </>
  ),
};
