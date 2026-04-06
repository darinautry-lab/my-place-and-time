import type { ReactNode } from "react";
import type { MapLayer } from "@/lib/mapLayers";
import { fetchRiverGauges, type RiverGauge } from "@/lib/layers/riverGauges";

export const riverGaugeLayer: MapLayer<RiverGauge> = {
  id: "river-gauges",
  name: "River Gauges",

  fetch: fetchRiverGauges,

  renderMarker: (gauge) => ({
    key: gauge.id,
    position: [gauge.lat, gauge.lon],
  }),

  renderPopup: (gauge): ReactNode => (
    <>
      <strong>{gauge.name}</strong>
      <br />
      Gauge ID: {gauge.id}
    </>
  ),
};
