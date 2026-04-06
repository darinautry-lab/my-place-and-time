import L from "leaflet";

export const userLocationIcon = new L.DivIcon({
  html: `<div style="
    width: 20px;
    height: 20px;
    background: #3B82F6;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 0 20px rgba(59,130,246,0.5), 0 2px 8px rgba(0,0,0,0.3);
  "></div>`,
  className: "",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});
