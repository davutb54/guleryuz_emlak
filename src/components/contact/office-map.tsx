"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

const OFFICE_LOCATION: [number, number] = [39.7767, 30.5206];

const officeIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:18px;height:18px;border-radius:50%;
    background:#D4A744;border:3px solid #fff;
    box-shadow:0 2px 10px rgba(0,0,0,0.5);
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
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${center[0]},${center[1]}`;

  return (
    <div style={{ height: "100%", width: "100%", isolation: "isolate" }}>
      <style>{`
        .leaflet-popup-content-wrapper {
          background: #0E2545;
          border: 1px solid rgba(212,167,68,0.22);
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.55);
          padding: 0;
          overflow: hidden;
        }
        .leaflet-popup-content {
          margin: 0;
          width: auto !important;
        }
        .leaflet-popup-tip-container { display: none; }
        .leaflet-popup-close-button {
          color: #9ca3af !important;
          top: 6px !important;
          right: 8px !important;
          font-size: 20px !important;
          line-height: 1 !important;
          z-index: 10;
          background: rgba(14,37,69,0.8) !important;
          border-radius: 50% !important;
          width: 20px !important;
          height: 20px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        .leaflet-popup-close-button:hover { color: #D4A744 !important; }
        .leaflet-container { font-family: inherit; }
        .leaflet-control-attribution {
          background: rgba(14,37,69,0.75) !important;
          color: #9ca3af !important;
          font-size: 10px !important;
        }
        .leaflet-control-attribution a { color: #D4A744 !important; }
        .leaflet-control-zoom a {
          background: #0E2545 !important;
          color: #D4A744 !important;
          border-color: rgba(212,167,68,0.2) !important;
        }
        .leaflet-control-zoom a:hover { background: #132f58 !important; }
      `}</style>

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
          <Popup minWidth={220} maxWidth={260} closeButton>
            <div style={{ width: 220, padding: "12px 14px 14px" }}>
              <p style={{ fontWeight: 700, fontSize: 13, color: "#D4A744", margin: "0 0 4px" }}>
                Güleryüz Gayrimenkul
              </p>
              {address && (
                <p style={{ fontSize: 12, color: "#9098A6", lineHeight: 1.5, margin: "0 0 12px" }}>
                  {address}
                </p>
              )}
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                  padding: "8px 0",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#D4A744",
                  background: "transparent",
                  border: "1.5px solid rgba(212,167,68,0.45)",
                  textDecoration: "none",
                  width: "100%",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                </svg>
                Yol Tarifi Al
              </a>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
