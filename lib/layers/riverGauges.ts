import L from "leaflet";

export type RiverGauge = {
  id: string;
  name: string;
  lat: number;
  lon: number;
};

export async function fetchRiverGauges(
  bounds: L.LatLngBounds,
): Promise<RiverGauge[]> {
  const south = bounds.getSouth().toFixed(6);
  const west = bounds.getWest().toFixed(6);
  const north = bounds.getNorth().toFixed(6);
  const east = bounds.getEast().toFixed(6);

  const url =
    `https://waterservices.usgs.gov/nwis/site/?format=rdb` +
    `&siteType=ST` +
    `&bBox=${west},${south},${east},${north}`;

  const res = await fetch(url);
  const text = await res.text();

  const lines = text.split("\n");

  const gauges: RiverGauge[] = [];

  for (const line of lines) {
    if (
      line.startsWith("#") ||
      line.startsWith("agency_cd") ||
      line.startsWith("5s") ||
      line.trim() === ""
    ) {
      continue;
    }

    const parts = line.split("\t");

    if (parts.length < 6) continue;

    const lat = parseFloat(parts[4]);
    const lon = parseFloat(parts[5]);

    if (isNaN(lat) || isNaN(lon)) continue;

    gauges.push({
      id: parts[1],
      name: parts[2],
      lat,
      lon,
    });
  }

  return gauges;
}
