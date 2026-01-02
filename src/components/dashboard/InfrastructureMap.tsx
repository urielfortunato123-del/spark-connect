import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { evStationsData, operatorColors as evOperatorColors } from "@/data/evStations";

interface Tower {
  id: string;
  lat: number;
  lng: number;
  operator: string;
  city: string;
}

interface AIRecommendation {
  lat: number;
  lng: number;
  type: "tower" | "ev";
  priority: string;
}

// Sample tower data across Brazil
const towers: Tower[] = [
  { id: "1", lat: -3.1190, lng: -60.0217, operator: "VIVO", city: "Manaus" },
  { id: "2", lat: -1.4558, lng: -48.4902, operator: "TIM", city: "Belém" },
  { id: "3", lat: -2.5297, lng: -44.2625, operator: "CLARO", city: "São Luís" },
  { id: "4", lat: 2.8235, lng: -60.6758, operator: "VIVO", city: "Boa Vista" },
  { id: "5", lat: -3.7319, lng: -38.5267, operator: "TIM", city: "Fortaleza" },
  { id: "6", lat: -8.0476, lng: -34.8770, operator: "CLARO", city: "Recife" },
  { id: "7", lat: -12.9714, lng: -38.5014, operator: "VIVO", city: "Salvador" },
  { id: "8", lat: -5.7945, lng: -35.2110, operator: "TIM", city: "Natal" },
  { id: "9", lat: -7.1195, lng: -34.8450, operator: "BRISANET", city: "João Pessoa" },
  { id: "10", lat: -9.6658, lng: -35.7350, operator: "CLARO", city: "Maceió" },
  { id: "11", lat: -23.5505, lng: -46.6333, operator: "VIVO", city: "São Paulo" },
  { id: "12", lat: -22.9068, lng: -43.1729, operator: "TIM", city: "Rio de Janeiro" },
  { id: "13", lat: -19.9167, lng: -43.9345, operator: "CLARO", city: "Belo Horizonte" },
  { id: "14", lat: -20.3155, lng: -40.3128, operator: "VIVO", city: "Vitória" },
  { id: "15", lat: -22.9099, lng: -47.0626, operator: "TIM", city: "Campinas" },
  { id: "16", lat: -25.4284, lng: -49.2733, operator: "TIM", city: "Curitiba" },
  { id: "17", lat: -30.0346, lng: -51.2177, operator: "VIVO", city: "Porto Alegre" },
  { id: "18", lat: -27.5954, lng: -48.5480, operator: "UNIFIQUE", city: "Florianópolis" },
  { id: "19", lat: -26.3045, lng: -48.8487, operator: "TIM", city: "Joinville" },
  { id: "20", lat: -15.7942, lng: -47.8822, operator: "CLARO", city: "Brasília" },
  { id: "21", lat: -16.6869, lng: -49.2648, operator: "ALGAR", city: "Goiânia" },
  { id: "22", lat: -15.5989, lng: -56.0949, operator: "VIVO", city: "Cuiabá" },
  { id: "23", lat: -20.4697, lng: -54.6201, operator: "TIM", city: "Campo Grande" },
];

const operatorColors: Record<string, string> = {
  VIVO: "#ff4da6",
  TIM: "#00d4ff",
  CLARO: "#ff6b35",
  BRISANET: "#ffd000",
  ALGAR: "#00cc66",
  UNIFIQUE: "#a855f7",
};

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

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
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

    return () => {
      map.remove();
      mapInstanceRef.current = null;
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
          <div style="font-family: 'Inter', sans-serif; padding: 8px; min-width: 150px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="width: 12px; height: 12px; border-radius: 4px; background: ${operatorColors[tower.operator]}"></span>
              <strong style="color: #fff; font-size: 14px;">${tower.operator}</strong>
            </div>
            <p style="color: #94a3b8; margin: 0; font-size: 12px;">📍 ${tower.city}</p>
            <p style="color: #94a3b8; margin: 4px 0 0; font-size: 11px;">Torre 5G Ativa</p>
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
    <div className="relative h-full w-full rounded-xl overflow-hidden border border-border/50">
      <div ref={mapRef} className="h-full w-full" />
      
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
              {Object.entries(evColors).map(([provider, color]) => (
                <div key={provider} className="flex items-center gap-1.5 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
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
