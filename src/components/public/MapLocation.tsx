"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icon issue
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export function MapLocation({
  center = [19.4326, -99.1332],
  zoom = 15,
  address = "Centro, Tu Ciudad",
}: {
  center?: [number, number];
  zoom?: number;
  address?: string;
}) {
  return (
    <div className="h-[400px] w-full overflow-hidden rounded-2xl shadow-lg border border-gray-100">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        className="h-full w-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center} icon={icon}>
          <Popup>
            <div className="font-sans">
              <p className="font-semibold text-gray-900">Bordados Rocio</p>
              <p className="text-sm text-gray-500">{address}</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
