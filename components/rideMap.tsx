"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";

interface Coords {
  lat: number;
  lng: number;
  label: string;
}

interface rideMapProps {
  pickup: Coords | null;
  dropoff: Coords | null;
}

export default function rideMap({ pickup, dropoff }: rideMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    document.title = "CabGo | RideMap";
  }, []);
  useEffect(() => {
    if (!containRef.current || mapRef.current) return;

    const map = L.map(containRef.current).setView([11.5564, 104.9282], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    markerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layerGroup = markerRef.current;

    if (!map || !layerGroup) return;

    layerGroup.clearLayers();
    const points: L.LatLngExpression[] = [];

    const createPin = (color: string) =>
      L.divIcon({
        className: "custom-pin",
        html: `<div style="background:${color}; width:18px; height:18px; border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
    if (pickup) {
      L.marker([pickup.lat, pickup.lng], { icon: createPin("#10b981") })
        .bindPopup(`Pickup: ${pickup.label}`)
        .addTo(layerGroup);
      points.push([pickup.lat, pickup.lng]);
    }

    if (dropoff) {
      L.marker([dropoff.lat, dropoff.lng], { icon: createPin("#ef4444") })
        .bindPopup(`Drop-off: ${dropoff.label}`)
        .addTo(layerGroup);
      points.push([dropoff.lat, dropoff.lng]);
    }

    if (points.length === 2) {
      L.polyline(points, {
        color: "#3b82f6",
        weight: 4,
        dashArray: "6, 8",
      }).addTo(layerGroup);
      map.fitBounds(L.latLngBounds(points), { padding: [50, 50] });
    } else if (points.length === 1) {
      map.setView(points[0], 15);
    }
  }, [pickup, dropoff]);

  return <div ref={containRef} className="h-full w-full rounded-xl z-0" />;
}
