"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export type MapListing = {
  id: string;
  slug: string;
  titleTr: string;
  price: number;
  currency: string;
  district: string;
  neighborhood: string | null;
  latitude: number | null;
  longitude: number | null;
  images: { url: string; alt: string | null }[];
};

const ESKISEHIR_CENTER: [number, number] = [39.7767, 30.5206];

const markerIcon = L.divIcon({
  className: "",
  html: `<div style="width:14px;height:14px;border-radius:50%;background:#D4A744;border:2.5px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.5);cursor:pointer"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  popupAnchor: [0, -10],
});

function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: currency || "TRY",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function ListingMap({
  listings,
  center,
  zoom,
}: {
  listings: MapListing[];
  center?: [number, number];
  zoom?: number;
}) {
  const withCoords = listings.filter(
    (l): l is MapListing & { latitude: number; longitude: number } =>
      l.latitude != null && l.longitude != null
  );

  const mapCenter = center ?? ESKISEHIR_CENTER;
  const mapZoom = zoom ?? 12;

  return (
    <div style={{ height: "100%", width: "100%", isolation: "isolate" }}>
      {/* Leaflet popup renk overrides */}
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
        center={mapCenter}
        zoom={mapZoom}
        style={{ width: "100%", height: "100%" }}
        zoomControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {withCoords.map((listing) => (
          <Marker
            key={listing.id}
            position={[listing.latitude, listing.longitude]}
            icon={markerIcon}
          >
            <Popup minWidth={220} maxWidth={260} closeButton>
              <div style={{ width: 220 }}>
                {/* Thumbnail */}
                {listing.images[0] ? (
                  <div style={{ width: "100%", height: 120, overflow: "hidden" }}>
                    <img
                      src={listing.images[0].url}
                      alt={listing.images[0].alt ?? listing.titleTr}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  </div>
                ) : (
                  <div style={{ width: "100%", height: 80, background: "#132f58", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ color: "#4b6a8e", fontSize: 12 }}>Fotoğraf yok</span>
                  </div>
                )}

                {/* Bilgi */}
                <div style={{ padding: "10px 12px 12px" }}>
                  <p style={{ fontSize: 11, color: "#D4A744", fontWeight: 600, margin: "0 0 3px", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                    {listing.district}{listing.neighborhood ? ` · ${listing.neighborhood}` : ""}
                  </p>
                  <p style={{ fontSize: 13, color: "#F5F1E8", fontWeight: 500, margin: "0 0 6px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {listing.titleTr}
                  </p>
                  <p style={{ fontSize: 16, fontWeight: 700, color: "#E5C77A", margin: "0 0 10px" }}>
                    {formatPrice(listing.price, listing.currency)}
                  </p>
                  {/* Aksiyon butonları */}
                  <div style={{ display: "flex", gap: 6 }}>
                    <a
                      href={`/tr/ilan/${listing.slug}`}
                      style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "7px 0", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#0A1F3A", background: "#D4A744", textDecoration: "none" }}
                    >
                      İlanı Gör
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </a>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${listing.latitude},${listing.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Google Maps'te yol tarifi al"
                      style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "7px 0", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#D4A744", background: "transparent", border: "1.5px solid rgba(212,167,68,0.45)", textDecoration: "none" }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                      </svg>
                      Yol Tarifi
                    </a>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
