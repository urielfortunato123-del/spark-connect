import { useEffect, useRef, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { evStationsData, operatorColors as evOperatorColors } from "@/data/evStations";
import { 
  generateTowersFromStateData, 
  operatorColors, 
  totalERBStats, 
  operatorData 
} from "@/data/erbData";

interface AIRecommendation {
  lat: number;
  lng: number;
  type: "tower" | "ev";
  priority: string;
}

interface InfrastructureMapProps {
  selectedOperators: string[];
  showEVStations: boolean;
  showTowers: boolean;
  aiRecommendations?: AIRecommendation[];
}

const InfrastructureMap = ({ 
  selectedOperators, 
  showEVStations, 
  showTowers,
  aiRecommendations = []
}: InfrastructureMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);
  const recommendationsRef = useRef<L.Marker[]>([]);
  
  // Generate towers from real Anatel data
  const towers = useMemo(() => generateTowersFromStateData(), []);

  useEffect(() => {
    if (!mapRef.current) return;
    
    // Cleanup existing map if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Wait for container to have dimensions
    const container = mapRef.current;
    if (container.offsetWidth === 0 || container.offsetHeight === 0) {
      // Retry after a short delay if container isn't ready
      const timeout = setTimeout(() => {
        if (container.offsetWidth > 0 && container.offsetHeight > 0) {
          initMap();
        }
      }, 100);
      return () => clearTimeout(timeout);
    }

    initMap();

    function initMap() {
      if (!container || mapInstanceRef.current) return;

      const map = L.map(container, {
        center: [-14.235, -51.9253],
        zoom: 4,
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Force size recalculation after mount
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add tower markers
    if (showTowers) {
      const filteredTowers = towers.filter((tower) => 
        selectedOperators.includes(tower.operator)
      );

      filteredTowers.forEach((tower) => {
        const marker = L.circleMarker([tower.lat, tower.lng], {
          radius: 10,
          fillColor: operatorColors[tower.operator],
          color: "#ffffff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9,
        });

        marker.bindPopup(`
          <div style="font-family: 'Inter', sans-serif; padding: 8px; min-width: 180px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="width: 12px; height: 12px; border-radius: 4px; background: ${operatorColors[tower.operator]}"></span>
              <strong style="color: #fff; font-size: 14px;">${tower.operator}</strong>
            </div>
            <p style="color: #94a3b8; margin: 0; font-size: 12px;">📍 ${tower.city} - ${tower.state}</p>
            <p style="color: #22c55e; margin: 4px 0 0; font-size: 11px;">📡 Torre ${tower.technology} Ativa</p>
            <p style="color: #64748b; margin: 4px 0 0; font-size: 10px;">Fonte: Anatel Nov/2025</p>
          </div>
        `);

        marker.addTo(mapInstanceRef.current!);
        markersRef.current.push(marker);
      });
    }

    // Add EV station markers from real data
    if (showEVStations) {
      evStationsData.forEach((station) => {
        const color = evOperatorColors[station.operator] || "#22c55e";
        const marker = L.circleMarker([station.lat, station.lng], {
          radius: 10,
          fillColor: color,
          color: "#ffffff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.85,
        });

        marker.bindPopup(`
          <div style="font-family: 'Inter', sans-serif; padding: 8px; min-width: 200px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="font-size: 18px;">⚡</span>
              <strong style="color: #fff; font-size: 13px;">${station.name}</strong>
            </div>
            <p style="color: #94a3b8; margin: 0; font-size: 11px;">📍 ${station.address}</p>
            <p style="color: #94a3b8; margin: 4px 0; font-size: 11px;">${station.city} - ${station.state}</p>
            <p style="color: #22c55e; margin: 4px 0; font-size: 12px;">🔌 ${station.chargers} carregadores • ${station.power}</p>
            <p style="color: #60a5fa; margin: 4px 0 0; font-size: 11px;">${station.connectors.join(", ")}</p>
            <button onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}', '_blank')" 
              style="margin-top: 8px; padding: 6px 12px; background: #22c55e; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 11px; width: 100%;">
              🧭 Navegar até aqui
            </button>
          </div>
        `);

        marker.addTo(mapInstanceRef.current!);
        markersRef.current.push(marker);
      });
    }
  }, [selectedOperators, showEVStations, showTowers]);

  // Handle AI recommendations
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    recommendationsRef.current.forEach((marker) => marker.remove());
    recommendationsRef.current = [];

    aiRecommendations.forEach((rec) => {
      const icon = L.divIcon({
        className: 'ai-recommendation-marker',
        html: `
          <div style="
            width: 30px; 
            height: 30px; 
            background: ${rec.priority === 'alta' ? '#ef4444' : rec.priority === 'media' ? '#f59e0b' : '#22c55e'};
            border: 3px solid #fff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            animation: pulse 2s infinite;
            box-shadow: 0 0 20px ${rec.priority === 'alta' ? 'rgba(239,68,68,0.6)' : 'rgba(34,197,94,0.6)'};
          ">
            ${rec.type === 'tower' ? '📡' : '⚡'}
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const marker = L.marker([rec.lat, rec.lng], { icon });
      marker.addTo(mapInstanceRef.current!);
      recommendationsRef.current.push(marker);
    });
  }, [aiRecommendations]);

  return (
    <div className="relative h-full w-full min-h-[300px] rounded-xl overflow-hidden border border-border/50">
      <div ref={mapRef} className="absolute inset-0" style={{ minHeight: '300px' }} />
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 glass-card p-4 z-[1000] max-w-xs">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <h3 className="text-sm font-display font-semibold">Legenda</h3>
        </div>
        
        {showTowers && (
          <div className="mb-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Torres 5G</p>
            <div className="grid grid-cols-2 gap-1">
              {Object.entries(operatorColors).map(([operator, color]) => (
                <div key={operator} className="flex items-center gap-1.5 text-xs">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
                  <span className="text-muted-foreground">{operator}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {showEVStations && (
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Estações EV</p>
            <div className="grid grid-cols-2 gap-1">
              {["Tesla", "Shell Recharge", "Raizen", "Ipiranga", "EDP", "Petrobras"].map((provider) => (
                <div key={provider} className="flex items-center gap-1.5 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: evOperatorColors[provider] || "#22c55e" }} />
                  <span className="text-muted-foreground">{provider}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Scan effect overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="scan-line absolute inset-0" />
      </div>
    </div>
  );
};

export default InfrastructureMap;
