import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Battery, MapPin, Building2, Plug, RefreshCw, Loader2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMemo, useEffect } from 'react';
import { useCountUp } from '@/hooks/useCountUp';
import { Button } from '@/components/ui/button';

// Custom marker icon
const createMarkerIcon = (status: string) => {
  const isOperational = status === 'active';
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 24px;
      height: 24px;
      background: ${isOperational ? '#22c55e' : '#ef4444'};
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

function MapController({ stations }: { stations: { latitude: number; longitude: number }[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (stations.length > 0) {
      const bounds = L.latLngBounds(
        stations.map(s => [s.latitude, s.longitude] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [stations, map]);
  
  return null;
}

function StatCardAnimated({ label, value, icon: Icon, suffix = '' }: { 
  label: string; 
  value: number; 
  icon: React.ElementType;
  suffix?: string;
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
          <div className="p-2 rounded-lg bg-green-500/10">
            <Icon className="h-4 w-4 text-green-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Sample EV stations data (fallback when database is empty)
const sampleStations = [
  { id: '1', latitude: -23.5505, longitude: -46.6333, city: 'São Paulo', state: 'SP', operator: 'Shell Recharge', power_kw: 150, num_chargers: 4, status: 'active' },
  { id: '2', latitude: -22.9068, longitude: -43.1729, city: 'Rio de Janeiro', state: 'RJ', operator: 'Tesla', power_kw: 250, num_chargers: 8, status: 'active' },
  { id: '3', latitude: -19.9167, longitude: -43.9345, city: 'Belo Horizonte', state: 'MG', operator: 'Voltbras', power_kw: 100, num_chargers: 2, status: 'active' },
  { id: '4', latitude: -25.4284, longitude: -49.2733, city: 'Curitiba', state: 'PR', operator: 'Shell Recharge', power_kw: 150, num_chargers: 4, status: 'active' },
  { id: '5', latitude: -30.0346, longitude: -51.2177, city: 'Porto Alegre', state: 'RS', operator: 'EDP', power_kw: 50, num_chargers: 2, status: 'active' },
  { id: '6', latitude: -15.7801, longitude: -47.9292, city: 'Brasília', state: 'DF', operator: 'Tesla', power_kw: 250, num_chargers: 6, status: 'active' },
  { id: '7', latitude: -3.7172, longitude: -38.5433, city: 'Fortaleza', state: 'CE', operator: 'Zletric', power_kw: 75, num_chargers: 2, status: 'active' },
  { id: '8', latitude: -8.0476, longitude: -34.8770, city: 'Recife', state: 'PE', operator: 'Voltbras', power_kw: 100, num_chargers: 3, status: 'active' },
];

export default function Eletropostos() {
  const { data: dbStations, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['ev-stations-brazil'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ev_stations')
        .select('*')
        .eq('country_code', 'BR');
      if (error) throw error;
      return data || [];
    },
  });

  // Use database data or fallback to sample data
  const stations = useMemo(() => 
    (dbStations && dbStations.length > 0) ? dbStations : sampleStations,
    [dbStations]
  );

  const stats = useMemo(() => {
    const byState: Record<string, number> = {};
    const byOperator: Record<string, number> = {};
    let totalPower = 0;
    let totalChargers = 0;

    stations.forEach(s => {
      byState[s.state || 'N/A'] = (byState[s.state || 'N/A'] || 0) + 1;
      byOperator[s.operator || 'N/A'] = (byOperator[s.operator || 'N/A'] || 0) + 1;
      totalPower += s.power_kw || 0;
      totalChargers += s.num_chargers || 1;
    });

    return {
      total: stations.length,
      totalChargers,
      totalPower,
      uniqueCities: new Set(stations.map(s => s.city)).size,
      byState,
      byOperator,
    };
  }, [stations]);

  const topOperators = useMemo(() => 
    Object.entries(stats.byOperator).sort(([,a], [,b]) => b - a).slice(0, 5),
    [stats.byOperator]
  );

  const topStates = useMemo(() => 
    Object.entries(stats.byState).sort(([,a], [,b]) => b - a).slice(0, 5),
    [stats.byState]
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
              <Zap className="h-7 w-7 text-green-500" />
              Eletropostos
            </h1>
            <p className="text-muted-foreground mt-1">
              Infraestrutura de recarga para veículos elétricos
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
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
              <StatCardAnimated label="Total de Estações" value={stats.total} icon={Zap} />
              <StatCardAnimated label="Carregadores" value={stats.totalChargers} icon={Battery} />
              <StatCardAnimated label="Municípios" value={stats.uniqueCities} icon={MapPin} />
              <StatCardAnimated label="Potência Total (kW)" value={Math.round(stats.totalPower)} icon={Plug} />
            </>
          )}
        </div>

        {/* Map and Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <Card className="glass-card lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-500" />
                Mapa de Eletropostos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[500px] rounded-b-lg overflow-hidden">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center bg-muted/20">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
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
                    <MapController stations={stations.filter(s => s.latitude && s.longitude)} />
                    {stations.filter(s => s.latitude && s.longitude).map((station) => (
                      <Marker
                        key={station.id}
                        position={[station.latitude, station.longitude]}
                        icon={createMarkerIcon(station.status || 'active')}
                      >
                        <Popup>
                          <div className="min-w-[180px]">
                            <h3 className="font-semibold text-sm">{station.operator}</h3>
                            <p className="text-xs text-gray-600">{station.city}, {station.state}</p>
                            <div className="mt-2 space-y-1">
                              <p className="text-xs"><strong>Potência:</strong> {station.power_kw} kW</p>
                              <p className="text-xs"><strong>Carregadores:</strong> {station.num_chargers}</p>
                              <p className="text-xs"><strong>Status:</strong> {station.status}</p>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Side Stats */}
          <div className="space-y-4">
            {/* Top Operators */}
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-500" />
                  Top Operadores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {topOperators.map(([operator, count], i) => (
                  <div key={operator} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground truncate max-w-[150px]">
                      {i + 1}. {operator}
                    </span>
                    <Badge variant="secondary" className="text-xs">{count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Top States */}
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-orange-500" />
                  Estados com mais estações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {topStates.map(([state, count], i) => (
                  <div key={state} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {i + 1}. {state || 'N/A'}
                    </span>
                    <Badge variant="secondary" className="text-xs">{count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Data Source */}
            <Card className="glass-card bg-green-500/5 border-green-500/20">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">
                  <strong>Fonte:</strong> Banco de dados InfraBrasil
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {dbStations && dbStations.length > 0 
                    ? 'Dados em tempo real' 
                    : 'Dados de demonstração'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
