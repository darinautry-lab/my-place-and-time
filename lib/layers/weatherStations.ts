import L from "leaflet";

export type WeatherStation = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  temperature?: number;
  windSpeed?: number;
  windDirection?: number;
};

/* =========================================================
   FETCH WEATHER STATIONS (NOAA / METAR)
========================================================= */

export async function fetchWeatherStations(
  bounds: L.LatLngBounds,
): Promise<WeatherStation[]> {
  const south = bounds.getSouth();
  const west = bounds.getWest();
  const north = bounds.getNorth();
  const east = bounds.getEast();

  const url = `https://api.weather.gov/stations?limit=500`;

  const response = await fetch(url);
  const data = await response.json();

  const stations: WeatherStation[] = [];

  for (const feature of data.features) {
    const coords = feature.geometry.coordinates;

    const lon = coords[0];
    const lat = coords[1];

    if (lat >= south && lat <= north && lon >= west && lon <= east) {
      stations.push({
        id: feature.properties.stationIdentifier,
        name: feature.properties.name,
        lat,
        lon,
      });
    }
  }

  return stations;
}
