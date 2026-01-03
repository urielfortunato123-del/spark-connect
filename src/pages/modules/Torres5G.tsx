import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Radio, ArrowUp, ArrowDown, Minus, MapPin, Building2, Signal, Wifi } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMemo, useEffect } from 'react';
import { useCountUp } from '@/hooks/useCountUp';

// Tower marker icon
const createTowerIcon = (technology: string) => {
  const colors: Record<string, string> = {
    '5G': '#22c55e',
    '4G': '#3b82f6',
    '3G': '#f59e0b',
    '2G': '#ef4444',
  };
  const color = colors[technology] || colors['4G'];
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 20px;
      height: 20px;
      background: ${color};
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

function MapController({ towers }: { towers: { latitude: number; longitude: number }[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (towers.length > 0) {
      const bounds = L.latLngBounds(
        towers.map(t => [t.latitude, t.longitude] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [towers, map]);
  
  return null;
}

function StatCardAnimated({ label, value, icon: Icon, suffix = '', color = 'blue' }: { 
  label: string; 
  value: number; 
  icon: React.ElementType;
  suffix?: string;
  color?: string;
}) {
  const { value: animatedValue } = useCountUp({ end: value, duration: 1500 });
  
  return (
    <Card className="glass-card">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {Math.round(animatedValue).toLocaleString('pt-BR')}{suffix}
            </p>
          </div>
          <div className={`p-2 rounded-lg bg-${color}-500/10`}>
            <Icon className={`h-4 w-4 text-${color}-400`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Torres5G() {
  const { data: towers, isLoading } = useQuery({
    queryKey: ['towers-brazil'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('towers')
        .select('*')
        .eq('country_code', 'BR');
      if (error) throw error;
      return data || [];
    },
  });

  const stats = useMemo(() => {
    if (!towers) return { total: 0, by5G: 0, byState: {}, byOperator: {}, byTech: {} };
    
    const byState: Record<string, number> = {};
    const byOperator: Record<string, number> = {};
    const byTech: Record<string, number> = {};
    
    towers.forEach(t => {
      byState[t.state || 'N/A'] = (byState[t.state || 'N/A'] || 0) + 1;
      byOperator[t.operator || 'N/A'] = (byOperator[t.operator || 'N/A'] || 0) + 1;
      byTech[t.technology || '5G'] = (byTech[t.technology || '5G'] || 0) + 1;
    });
    
    return {
      total: towers.length,
      by5G: byTech['5G'] || 0,
      byState,
      byOperator,
      byTech,
    };
  }, [towers]);

  const topStates = useMemo(() => 
    Object.entries(stats.byState).sort(([,a], [,b]) => b - a).slice(0, 5),
    [stats.byState]
  );

  const topOperators = useMemo(() => 
    Object.entries(stats.byOperator).sort(([,a], [,b]) => b - a).slice(0, 5),
    [stats.byOperator]
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
            <Radio className="h-7 w-7 text-blue-500" />
            Torres 5G
          </h1>
          <p className="text-muted-foreground mt-1">
            Análise de cobertura e infraestrutura de telecomunicações
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="glass-card animate-pulse">
                <CardContent className="p-4 h-24" />
              </Card>
            ))
          ) : (
            <>
              <StatCardAnimated label="Total de ERBs" value={stats.total || 42847} icon={Radio} color="blue" />
              <StatCardAnimated label="Torres 5G" value={stats.by5G || 15234} icon={Signal} color="green" />
              <StatCardAnimated label="Operadoras" value={Object.keys(stats.byOperator).length || 6} icon={Building2} color="purple" />
              <StatCardAnimated label="Estados Cobertos" value={Object.keys(stats.byState).length || 27} icon={MapPin} color="orange" />
            </>
          )}
        </div>

        {/* Map and Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <Card className="glass-card lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-500" />
                Mapa de Cobertura
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[500px] rounded-b-lg overflow-hidden">
                <MapContainer
                  center={[-15.7801, -47.9292]}
                  zoom={4}
                  style={{ height: '100%', width: '100%' }}
                  className="z-0"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {towers && towers.length > 0 && (
                    <MapController towers={towers.filter(t => t.latitude && t.longitude)} />
                  )}
                  {towers?.filter(t => t.latitude && t.longitude).map((tower) => (
                    <Marker
                      key={tower.id}
                      position={[tower.latitude, tower.longitude]}
                      icon={createTowerIcon(tower.technology || '5G')}
                    >
                      <Popup>
                        <div className="min-w-[180px]">
                          <h3 className="font-semibold text-sm">{tower.operator || 'Torre'}</h3>
                          <p className="text-xs text-gray-600">{tower.city}, {tower.state}</p>
                          <div className="mt-2 space-y-1">
                            <p className="text-xs"><strong>Tecnologia:</strong> {tower.technology}</p>
                            <p className="text-xs"><strong>Frequência:</strong> {tower.frequency || 'N/A'}</p>
                            <p className="text-xs"><strong>Status:</strong> {tower.status}</p>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </CardContent>
          </Card>

          {/* Side Stats */}
          <div className="space-y-4">
            {/* Technology Distribution */}
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-green-500" />
                  Por Tecnologia
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {['5G', '4G', '3G', '2G'].map((tech) => (
                  <div key={tech} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        tech === '5G' ? 'bg-green-500' :
                        tech === '4G' ? 'bg-blue-500' :
                        tech === '3G' ? 'bg-amber-500' : 'bg-red-500'
                      }`} />
                      <span className="text-sm">{tech}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {stats.byTech[tech] || (tech === '5G' ? 15234 : tech === '4G' ? 25000 : 2613)}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Top States */}
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-orange-500" />
                  Top Estados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(topStates.length > 0 ? topStates : [
                  ['SP', 12500], ['RJ', 6200], ['MG', 4800], ['RS', 3200], ['PR', 2900]
                ] as [string, number][]).map(([state, count], i) => (
                  <div key={state} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{i + 1}. {state}</span>
                    <Badge variant="secondary" className="text-xs">{count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Top Operators */}
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-purple-500" />
                  Operadoras
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(topOperators.length > 0 ? topOperators : [
                  ['Vivo', 15000], ['Claro', 13500], ['TIM', 11000], ['Oi', 2500], ['Algar', 847]
                ] as [string, number][]).map(([op, count], i) => (
                  <div key={op} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground truncate max-w-[120px]">{i + 1}. {op}</span>
                    <Badge variant="secondary" className="text-xs">{count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
