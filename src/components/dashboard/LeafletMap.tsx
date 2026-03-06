import { useRef, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  icon?: L.DivIcon;
  popupContent?: string;
}

interface LeafletMapProps {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  className?: string;
  fitBounds?: boolean;
}

export function LeafletMap({
  center = [-15.7801, -47.9292],
  zoom = 4,
  markers = [],
  className = '',
  fitBounds = true,
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView(center, zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) map.removeLayer(layer);
    });

    // Add new markers
    const validMarkers = markers.filter(m => m.lat && m.lng);
    validMarkers.forEach((m) => {
      const marker = L.marker([m.lat, m.lng], m.icon ? { icon: m.icon } : {}).addTo(map);
      if (m.popupContent) {
        marker.bindPopup(m.popupContent);
      }
    });

    // Fit bounds
    if (fitBounds && validMarkers.length > 0) {
      const bounds = L.latLngBounds(validMarkers.map(m => [m.lat, m.lng] as [number, number]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [markers, fitBounds]);

  return <div ref={mapRef} className={className} style={{ height: '100%', width: '100%' }} />;
}
