import L from "leaflet";

export async function fetchRestaurants(bounds: L.LatLngBounds) {
  const south = bounds.getSouth();
  const west = bounds.getWest();
  const north = bounds.getNorth();
  const east = bounds.getEast();

  const query = `
    [out:json];
    node["amenity"="restaurant"]
    (${south},${west},${north},${east});
    out;
  `;

  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: query,
  });

  const data = await response.json();

  return data.elements || [];
}
