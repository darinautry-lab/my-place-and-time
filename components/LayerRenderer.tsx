"use client";

import { useEffect, useState } from "react";
import { Marker, Popup, useMap } from "react-leaflet";
import type { MapLayer } from "@/lib/mapLayers";

type Props<T> = {
  layer: MapLayer<T>;
  enabled: boolean;
};

export default function LayerRenderer<T>({ layer, enabled }: Props<T>) {
  const map = useMap();
  const [data, setData] = useState<T[]>([]);

  useEffect(() => {
    if (!enabled || !layer.fetch) return;

    let cancelled = false;

    const fetchData = async () => {
      const bounds = map.getBounds();
      const result = await layer.fetch!(bounds);

      if (!cancelled) {
        setData(result);
      }
    };

    const handleMoveEnd = () => {
      fetchData();
    };

    map.on("moveend", handleMoveEnd);

    fetchData();

    return () => {
      cancelled = true;
      map.off("moveend", handleMoveEnd);
    };
  }, [enabled, map, layer]);

  if (!enabled || !layer.renderMarker || !layer.renderPopup) return null;

  return (
    <>
      {data.map((item) => {
        const marker = layer.renderMarker!(item);

        return (
          <Marker key={marker.key} position={marker.position}>
            <Popup>{layer.renderPopup!(item)}</Popup>
          </Marker>
        );
      })}
    </>
  );
}
