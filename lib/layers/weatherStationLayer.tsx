import type { ReactNode } from "react";
import type { MapLayer } from "@/lib/mapLayers";
import {
  fetchWeatherStations,
  type WeatherStation,
} from "@/lib/layers/weatherStations";

export const weatherStationLayer: MapLayer<WeatherStation> = {
  id: "weather-stations",
  name: "Weather Stations",

  fetch: fetchWeatherStations,

  renderMarker: (station) => ({
    key: station.id,
    position: [station.lat, station.lon],
  }),

  renderPopup: (station): ReactNode => (
    <>
      <strong>{station.name}</strong>
      <br />
      Station: {station.id}
      <br />
      {station.temperature !== undefined && (
        <>
          Temp: {((station.temperature * 9) / 5 + 32).toFixed(1)} °F
          <br />
        </>
      )}
      {station.windSpeed !== undefined && (
        <>
          Wind: {(station.windSpeed * 2.23694).toFixed(1)} mph
          <br />
        </>
      )}
      {station.windDirection !== undefined && (
        <>
          Dir: {station.windDirection.toFixed(0)}°
          <br />
        </>
      )}
      {station.humidity !== undefined && (
        <>
          Humidity: {station.humidity.toFixed(0)} %
          <br />
        </>
      )}
      {station.pressure !== undefined && (
        <>
          Pressure: {(station.pressure / 100).toFixed(1)} mb
          <br />
        </>
      )}
      {station.timestamp && (
        <>Updated: {new Date(station.timestamp).toLocaleString()}</>
      )}
    </>
  ),
};
