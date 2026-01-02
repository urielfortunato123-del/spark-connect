import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Tower {
  id: string;
  lat: number;
  lng: number;
  operator: string;
  city: string;
}

// Sample tower data across Brazil
const towers: Tower[] = [
  // Norte
  { id: "1", lat: -3.1190, lng: -60.0217, operator: "VIVO", city: "Manaus" },
  { id: "2", lat: -1.4558, lng: -48.4902, operator: "TIM", city: "Belém" },
  { id: "3", lat: -2.5297, lng: -44.2625, operator: "CLARO", city: "São Luís" },
  { id: "4", lat: 2.8235, lng: -60.6758, operator: "VIVO", city: "Boa Vista" },
  { id: "5", lat: -3.7319, lng: -38.5267, operator: "TIM", city: "Fortaleza" },
  
  // Nordeste
  { id: "6", lat: -8.0476, lng: -34.8770, operator: "CLARO", city: "Recife" },
  { id: "7", lat: -12.9714, lng: -38.5014, operator: "VIVO", city: "Salvador" },
  { id: "8", lat: -5.7945, lng: -35.2110, operator: "TIM", city: "Natal" },
  { id: "9", lat: -7.1195, lng: -34.8450, operator: "BRISANET", city: "João Pessoa" },
  { id: "10", lat: -9.6658, lng: -35.7350, operator: "CLARO", city: "Maceió" },
  
  // Sudeste
  { id: "11", lat: -23.5505, lng: -46.6333, operator: "VIVO", city: "São Paulo" },
  { id: "12", lat: -22.9068, lng: -43.1729, operator: "TIM", city: "Rio de Janeiro" },
  { id: "13", lat: -19.9167, lng: -43.9345, operator: "CLARO", city: "Belo Horizonte" },
  { id: "14", lat: -20.3155, lng: -40.3128, operator: "VIVO", city: "Vitória" },
  { id: "15", lat: -22.9099, lng: -47.0626, operator: "TIM", city: "Campinas" },
  
  // Sul
  { id: "16", lat: -25.4284, lng: -49.2733, operator: "TIM", city: "Curitiba" },
  { id: "17", lat: -30.0346, lng: -51.2177, operator: "VIVO", city: "Porto Alegre" },
  { id: "18", lat: -27.5954, lng: -48.5480, operator: "UNIFIQUE", city: "Florianópolis" },
  { id: "19", lat: -26.3045, lng: -48.8487, operator: "TIM", city: "Joinville" },
  
  // Centro-Oeste
  { id: "20", lat: -15.7942, lng: -47.8822, operator: "CLARO", city: "Brasília" },
  { id: "21", lat: -16.6869, lng: -49.2648, operator: "ALGAR", city: "Goiânia" },
  { id: "22", lat: -15.5989, lng: -56.0949, operator: "VIVO", city: "Cuiabá" },
  { id: "23", lat: -20.4697, lng: -54.6201, operator: "TIM", city: "Campo Grande" },
];

const operatorColors: Record<string, string> = {
  VIVO: "#ff69b4",
  TIM: "#00bcd4",
  CLARO: "#ff5722",
  BRISANET: "#ffc107",
  ALGAR: "#4caf50",
  UNIFIQUE: "#9c27b0",
};

interface BrazilMapProps {
  selectedOperators: string[];
}

const BrazilMap = ({ selectedOperators }: BrazilMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current, {
      center: [-14.235, -51.9253],
      zoom: 4,
      zoomControl: true,
      attributionControl: true,
    });

    // Add dark tile layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
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

    // Add markers for selected operators
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
        <div style="font-family: 'Inter', sans-serif; padding: 4px;">
          <strong style="color: ${operatorColors[tower.operator]}">${tower.operator}</strong>
          <br/>
          <span style="color: #94a3b8">${tower.city}</span>
        </div>
      `);

      marker.addTo(mapInstanceRef.current!);
      markersRef.current.push(marker);
    });
  }, [selectedOperators]);

  return (
    <div className="relative h-full w-full rounded-xl overflow-hidden border border-border/50">
      <div ref={mapRef} className="h-full w-full" />
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 glass-card p-4 z-[1000]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <h3 className="text-sm font-semibold">Legenda</h3>
        </div>
        <div className="space-y-2">
          {Object.entries(operatorColors).map(([operator, color]) => (
            <div key={operator} className="flex items-center gap-2 text-xs">
              <span 
                className="w-3 h-3 rounded-sm" 
                style={{ backgroundColor: color }}
              />
              <span>{operator}</span>
              <span className="text-muted-foreground">
                ({towers.filter(t => t.operator === operator).length * 1000})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrazilMap;
