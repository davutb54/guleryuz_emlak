"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

const OFFICE_LOCATION: [number, number] = [39.7767, 30.5206]; // Eskişehir merkez

const officeIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:18px;height:18px;border-radius:50%;
    background:#D4A744;border:3px solid #fff;
    box-shadow:0 2px 10px rgba(0,0,0,0.5);
    position:relative;
  "></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -12],
});

export default function OfficeMap({
  lat,
  lng,
  address,
}: {
  lat?: number;
  lng?: number;
  address?: string;
}) {
  const center: [number, number] = lat && lng ? [lat, lng] : OFFICE_LOCATION;

  return (
    <div style={{ height: "100%", width: "100%", isolation: "isolate" }}>
    <MapContainer
      center={center}
      zoom={15}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={false}
      className="rounded-2xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={center} icon={officeIcon}>
        <Popup>
          <div
            style={{
              background: "#0E1D33",
              color: "#F5F1E8",
              padding: "10px 14px",
              borderRadius: "10px",
              minWidth: "160px",
            }}
          >
            <p style={{ fontWeight: 700, fontSize: "13px", marginBottom: 4 }}>
              Güleryüz Gayrimenkul
            </p>
            {address && (
              <p style={{ fontSize: "12px", color: "#9098A6", lineHeight: 1.4 }}>
                {address}
              </p>
            )}
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${center[0]},${center[1]}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                marginTop: 8,
                padding: "4px 12px",
                background: "#D4A744",
                color: "#0A1628",
                borderRadius: "20px",
                fontSize: "11px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Yol Tarifi Al
            </a>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
    </div>
  );
}
