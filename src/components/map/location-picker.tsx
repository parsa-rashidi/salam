"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useI18n } from "@/i18n/provider";
import { localDigits } from "@/lib/format";
import { cn } from "@/lib/cn";

/**
 * Map with a draggable pin — used by the stylist to place their salon
 * on the map and to preview their at-home service radius.
 */
export default function LocationPicker({
  position,
  radiusKm,
  onChange,
  className,
  zoom = 14,
}: {
  position: { lat: number; lng: number };
  radiusKm?: number | null;
  onChange?: (p: { lat: number; lng: number }) => void;
  className?: string;
  zoom?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const { t, locale } = useI18n();

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = L.map(ref.current, {
      center: [position.lat, position.lng],
      zoom,
      zoomControl: true,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    map.zoomControl.setPosition("bottomright");

    const icon = L.divIcon({
      className: "map-pin map-pin--active",
      html: `<div class="map-pin__body"><span>📍</span></div>`,
      iconSize: [46, 46],
      iconAnchor: [23, 44],
    });

    const marker = L.marker([position.lat, position.lng], {
      icon,
      draggable: true,
      autoPan: true,
    }).addTo(map);

    marker.on("dragend", () => {
      const ll = marker.getLatLng();
      onChange?.({ lat: ll.lat, lng: ll.lng });
    });

    markerRef.current = marker;
    mapRef.current = map;

    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(ref.current);
    setTimeout(() => map.invalidateSize(), 150);

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      circleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // keep circle in sync with the radius slider
  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;
    if (circleRef.current) {
      map.removeLayer(circleRef.current);
      circleRef.current = null;
    }
    if (radiusKm) {
      circleRef.current = L.circle(marker.getLatLng(), {
        radius: radiusKm * 1000,
        className: "map-radius-circle",
        interactive: false,
      }).addTo(map);
    }
  }, [radiusKm]);

  // follow external position changes (e.g. "use my salon address")
  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;
    const cur = marker.getLatLng();
    if (Math.abs(cur.lat - position.lat) > 1e-6 || Math.abs(cur.lng - position.lng) > 1e-6) {
      marker.setLatLng([position.lat, position.lng]);
      circleRef.current?.setLatLng([position.lat, position.lng]);
      map.panTo([position.lat, position.lng], { animate: true });
    }
  }, [position.lat, position.lng]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div ref={ref} className="h-full w-full" role="application" aria-label={t("pp.set.mapPosition")} />
      <div className="pointer-events-none absolute bottom-3 start-3 rounded-lg border border-ink-200 bg-white/95 px-2.5 py-1.5 shadow-sm backdrop-blur">
        <p className="tnum text-[11px] font-bold text-ink-800" dir="ltr">
          {localDigits(position.lat.toFixed(5), locale)}, {localDigits(position.lng.toFixed(5), locale)}
        </p>
      </div>
    </div>
  );
}
