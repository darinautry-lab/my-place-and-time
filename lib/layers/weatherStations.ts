import L from "leaflet";

export type WeatherStation = {
  id: string;
  name: string;
  lat: number;
  lon: number;

  temperature?: number;
  windSpeed?: number;
  windDirection?: number;
  humidity?: number;
  pressure?: number;

  timestamp?: string;
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

  const response = await fetch("https://api.weather.gov/stations?limit=500");
  const data = await response.json();

  const stations: WeatherStation[] = [];

  for (const feature of data.features) {
    const coords = feature.geometry.coordinates;

    const lon = coords[0];
    const lat = coords[1];

    if (lat >= south && lat <= north && lon >= west && lon <= east) {
      const id = feature.properties.stationIdentifier;

      let observation = null;

      try {
        const obsResponse = await fetch(
          `https://api.weather.gov/stations/${id}/observations/latest`,
        );

        const obsData = await obsResponse.json();
        observation = obsData.properties;
      } catch {
        observation = null;
      }

      stations.push({
        id,
        name: feature.properties.name,
        lat,
        lon,

        temperature: observation?.temperature?.value ?? undefined,
        windSpeed: observation?.windSpeed?.value ?? undefined,
        windDirection: observation?.windDirection?.value ?? undefined,
        humidity: observation?.relativeHumidity?.value ?? undefined,
        pressure: observation?.barometricPressure?.value ?? undefined,
        timestamp: observation?.timestamp,
      });
    }
  }

  return stations;
}
