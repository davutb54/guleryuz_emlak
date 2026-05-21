"use client";

import { useEffect, useRef } from "react";
import { MapPin } from "lucide-react";

interface LocationPickerProps {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
  defaultCenter?: [number, number];
}

const DEFAULT_CENTER: [number, number] = [39.7767, 30.5206]; // Eskişehir merkez

export default function LocationPicker({
  lat,
  lng,
  onChange,
  defaultCenter = DEFAULT_CENTER,
}: LocationPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let cancelled = false;
    let destroyMap: (() => void) | undefined;

    import("leaflet").then((leaflet) => {
      if (cancelled || !containerRef.current || mapRef.current) return;

      const L = leaflet.default;

      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const center: [number, number] = lat && lng ? [lat, lng] : defaultCenter;
      const map = L.map(containerRef.current!, { zoom: 14, center });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      if (lat && lng) {
        const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
        markerRef.current = marker;
        marker.on("dragend", () => {
          const pos = marker.getLatLng();
          onChange(Math.round(pos.lat * 1000000) / 1000000, Math.round(pos.lng * 1000000) / 1000000);
        });
      }

      map.on("click", (e: any) => {
        const clickLat = Math.round(e.latlng.lat * 1000000) / 1000000;
        const clickLng = Math.round(e.latlng.lng * 1000000) / 1000000;
        if (markerRef.current) {
          markerRef.current.setLatLng([clickLat, clickLng]);
        } else {
          const marker = L.marker([clickLat, clickLng], { draggable: true }).addTo(map);
          markerRef.current = marker;
          marker.on("dragend", () => {
            const pos = marker.getLatLng();
            onChange(Math.round(pos.lat * 1000000) / 1000000, Math.round(pos.lng * 1000000) / 1000000);
          });
        }
        onChange(clickLat, clickLng);
      });

      destroyMap = () => {
        map.remove();
        mapRef.current = null;
        markerRef.current = null;
      };
    });

    return () => {
      cancelled = true;
      destroyMap?.();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync marker when lat/lng props change externally
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    if (lat && lng) markerRef.current.setLatLng([lat, lng]);
  }, [lat, lng]);

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className="w-full h-64 rounded-xl overflow-hidden border border-[var(--border-subtle)] bg-navy-800"
      />
      <p className="text-xs text-silver-500 flex items-center gap-1">
        <MapPin size={11} className="text-gold-500" />
        {typeof lat === "number" && !isNaN(lat) && typeof lng === "number" && !isNaN(lng)
          ? `${lat.toFixed(6)}, ${lng.toFixed(6)} — Konumu değiştirmek için haritaya tıklayın veya işaretçiyi sürükleyin.`
          : "Konum seçmek için haritaya tıklayın."}
      </p>
    </div>
  );
}
