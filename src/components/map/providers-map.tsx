"use client";

import { useCallback, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { FlashDeal, Provider } from "@/types";
import { useI18n } from "@/i18n/provider";
import { formatMoneyShort } from "@/lib/format";

export interface ProvidersMapProps {
  providers: Provider[];
  deals?: FlashDeal[];
  showDeals?: boolean;
  center?: { lat: number; lng: number };
  zoom?: number;
  userLocation?: { lat: number; lng: number } | null;
  /** draw a search-radius circle around the user */
  radiusKm?: number | null;
  activeId?: string | null;
  onActiveChange?: (id: string | null) => void;
  className?: string;
  /** disable interactions (landing preview) */
  staticMode?: boolean;
  fitToMarkers?: boolean;
  /** receives imperative map controls once the map is mounted */
  onReady?: (api: MapApi) => void;
}

export default function ProvidersMap({
  providers,
  deals = [],
  showDeals = true,
  center,
  zoom = 13,
  userLocation,
  radiusKm,
  activeId,
  onActiveChange,
  className,
  staticMode = false,
  fitToMarkers = true,
  onReady,
}: ProvidersMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const markerRefs = useRef<Map<string, L.Marker>>(new Map());
  const circleRef = useRef<L.Circle | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const didFitRef = useRef(false);
  const { locale, t, tr } = useI18n();

  /* ---------------- init ---------------- */
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: center ? [center.lat, center.lng] : [35.7805, 51.4215],
      zoom,
      zoomControl: !staticMode,
      attributionControl: true,
      dragging: !staticMode,
      scrollWheelZoom: !staticMode,
      doubleClickZoom: !staticMode,
      touchZoom: !staticMode,
      keyboard: !staticMode,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    if (!staticMode) {
      map.zoomControl.setPosition("bottomright");
    }

    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // fix sizing glitches when the container mounts hidden / animates
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(containerRef.current);
    setTimeout(() => map.invalidateSize(), 120);
    setTimeout(() => map.invalidateSize(), 400);

    const markers = markerRefs.current;
    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
      markers.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staticMode]);

  /* ---------------- markers ---------------- */
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    markerRefs.current.clear();

    const points: L.LatLngExpression[] = [];

    providers.forEach((p) => {
      const hasDeal = showDeals && deals.some((d) => d.providerId === p.id);
      const price = Math.min(...p.services.map((s) => s.price));
      const icon = L.divIcon({
        className: "map-pin",
        html: `<div class="map-pin__body"><span>${formatMoneyShort(price, locale)}</span></div>`,
        iconSize: [46, 46],
        iconAnchor: [23, 44],
      });

      const marker = L.marker([p.lat, p.lng], {
        icon,
        title: tr(p.name),
        alt: tr(p.name),
        zIndexOffset: hasDeal ? 400 : 0,
      });

      marker.bindTooltip(
        `<div style="direction:${locale === "fa" ? "rtl" : "ltr"};font-family:inherit;padding:2px 2px;">
           <div style="font-weight:700;font-size:12px;">${escapeHtml(tr(p.name))}</div>
           <div style="font-size:11px;opacity:.75;">${escapeHtml(tr(p.district))} · ★ ${p.rating.toFixed(1)}</div>
         </div>`,
        { direction: "top", offset: [0, -40], opacity: 1, className: "salam-tooltip" },
      );

      marker.on("click", () => {
        onActiveChange?.(p.id);
        map.setView([p.lat, p.lng], Math.max(map.getZoom(), 14), { animate: true });
      });

      marker.addTo(layer);
      markerRefs.current.set(p.id, marker);
      points.push([p.lat, p.lng]);
    });

    if (showDeals) {
      deals.forEach((d) => {
        const percent = Math.round((1 - d.dealPrice / d.originalPrice) * 100);
        const icon = L.divIcon({
          className: "map-pin map-pin--deal",
          html: `<div class="map-pin__body"><span>${locale === "fa" ? toFa(percent) : percent}٪</span></div>`,
          iconSize: [46, 46],
          iconAnchor: [23, 44],
        });
        const marker = L.marker([d.lat + 0.0016, d.lng + 0.0016], {
          icon,
          title: `${t("deals.badge")} — ${tr(d.serviceName)}`,
          zIndexOffset: 900,
        });
        marker.bindTooltip(
          `<div style="direction:${locale === "fa" ? "rtl" : "ltr"};padding:2px;">
             <div style="font-weight:700;font-size:12px;">${escapeHtml(tr(d.serviceName))}</div>
             <div style="font-size:11px;opacity:.8;">${locale === "fa" ? toFa(percent) : percent}% ${locale === "fa" ? "تخفیف" : "off"}</div>
           </div>`,
          { direction: "top", offset: [0, -40], opacity: 1, className: "salam-tooltip" },
        );
        marker.on("click", () => onActiveChange?.(d.providerId));
        marker.addTo(layer);
        points.push([d.lat, d.lng]);
      });
    }

    // user location + radius
    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }
    if (circleRef.current) {
      map.removeLayer(circleRef.current);
      circleRef.current = null;
    }
    if (userLocation) {
      const userIcon = L.divIcon({
        className: "",
        html: `<div style="width:18px;height:18px;border-radius:50%;background:#2563eb;border:3px solid #fff;box-shadow:0 0 0 6px rgba(37,99,235,.18), 0 4px 10px rgba(0,0,0,.25);"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon,
        zIndexOffset: 1200,
        title: t("explore.myLocation"),
        interactive: false,
      }).addTo(map);
      points.push([userLocation.lat, userLocation.lng]);

      if (radiusKm) {
        circleRef.current = L.circle([userLocation.lat, userLocation.lng], {
          radius: radiusKm * 1000,
          className: "map-radius-circle",
          interactive: false,
        }).addTo(map);
      }
    }

    if (fitToMarkers && points.length && !didFitRef.current && !staticMode) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [56, 56], maxZoom: 15 });
      didFitRef.current = true;
    }
  }, [providers, deals, showDeals, locale, userLocation, radiusKm, fitToMarkers, staticMode, tr, t, onActiveChange]);

  /* ---------------- active marker highlight ---------------- */
  useEffect(() => {
    markerRefs.current.forEach((marker, id) => {
      const el = marker.getElement();
      if (!el) return;
      el.classList.toggle("map-pin--active", id === activeId);
      if (id === activeId) {
        el.style.zIndex = "2000";
        const ll = marker.getLatLng();
        mapRef.current?.panTo(ll, { animate: true });
      } else {
        el.style.zIndex = "";
      }
    });
  }, [activeId]);

  /* ---------------- imperative helpers ---------------- */
  const recenter = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const pts = providers.map((p) => [p.lat, p.lng] as L.LatLngTuple);
    if (userLocation) pts.push([userLocation.lat, userLocation.lng]);
    if (!pts.length) return;
    map.flyToBounds(L.latLngBounds(pts), { padding: [56, 56], maxZoom: 15, duration: 0.7 });
  }, [providers, userLocation]);

  const focusOn = useCallback((lat: number, lng: number, z = 15) => {
    mapRef.current?.flyTo([lat, lng], z, { duration: 0.7 });
  }, []);

  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    if (!mapRef.current) return;
    onReadyRef.current?.({
      recenter,
      focusOn,
      invalidate: () => mapRef.current?.invalidateSize(),
    });
  }, [recenter, focusOn]);

  return (
    <div className={className} style={{ position: "relative" }}>
      <div
        ref={containerRef}
        className="h-full w-full"
        role="application"
        aria-label={t("a11y.mapRegion")}
      />
    </div>
  );
}

export interface MapApi {
  recenter: () => void;
  focusOn: (lat: number, lng: number, z?: number) => void;
  invalidate: () => void;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
function toFa(n: number) {
  return String(n).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]);
}
