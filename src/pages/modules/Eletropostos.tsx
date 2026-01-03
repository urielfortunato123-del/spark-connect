import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, ArrowUp, Battery, MapPin, Building2, Loader2, RefreshCw, Plug } from 'lucide-react';
import { useOpenChargeMap, useEVStationStats } from '@/hooks/useOpenChargeMap';
import { Button } from '@/components/ui/button';
import { useCountUp } from '@/hooks/useCountUp';
import { useMemo, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom marker icon
const createMarkerIcon = (isOperational: boolean) => {
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

export default function Eletropostos() {
  const { data, isLoading, error, refetch, isFetching } = useOpenChargeMap({ 
    countryCode: 'BR',
    maxResults: 1000 
  });
  
  const stations = useMemo(() => data?.stations || [], [data]);
  const stats = useEVStationStats(stations);

  const topOperators = useMemo(() => {
    return Object.entries(stats.operatorStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  }, [stats.operatorStats]);

  const topStates = useMemo(() => {
    return Object.entries(stats.stateStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  }, [stats.stateStats]);

  if (error) {
    return (
      <AppLayout title="Eletropostos" subtitle="Infraestrutura de recarga para veículos elétricos">
        <div className="p-6">
          <Card className="glass-card">
            <CardContent className="p-8 text-center">
              <Zap className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground">Erro ao carregar dados</h3>
              <p className="text-sm text-muted-foreground mt-2 mb-4">
                Não foi possível buscar as estações de recarga.
              </p>
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Eletropostos" subtitle="Infraestrutura de recarga para veículos elétricos">
      <div className="p-6 space-y-6">
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
              <StatCardAnimated 
                label="Total de Estações" 
                value={stats.totalStations} 
                icon={Zap} 
              />
              <StatCardAnimated 
                label="Carregadores" 
                value={stats.totalChargers} 
                icon={Battery} 
              />
              <StatCardAnimated 
                label="Municípios" 
                value={stats.uniqueCities} 
                icon={MapPin} 
              />
              <StatCardAnimated 
                label="Potência Total (kW)" 
                value={Math.round(stats.totalPowerKW)} 
                icon={Plug}
              />
            </>
          )}
        </div>

        {/* Map and Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <Card className="glass-card lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-green-500" />
                  Mapa de Eletropostos
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => refetch()}
                  disabled={isFetching}
                >
                  <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                </Button>
              </div>
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
                    {stations
                      .filter(s => s.latitude && s.longitude)
                      .map((station) => (
                        <Marker
                          key={station.id}
                          position={[station.latitude, station.longitude]}
                          icon={createMarkerIcon(station.isOperational)}
                        >
                          <Popup>
                            <div className="min-w-[200px]">
                              <h3 className="font-semibold text-sm">{station.title}</h3>
                              <p className="text-xs text-gray-600 mt-1">{station.address}</p>
                              <p className="text-xs text-gray-600">{station.city}, {station.state}</p>
                              <div className="mt-2 space-y-1">
                                <p className="text-xs"><strong>Operador:</strong> {station.operator}</p>
                                <p className="text-xs"><strong>Pontos:</strong> {station.numPoints}</p>
                                <p className="text-xs"><strong>Status:</strong> {station.statusType}</p>
                                {station.usageCost !== 'Não informado' && (
                                  <p className="text-xs"><strong>Custo:</strong> {station.usageCost}</p>
                                )}
                              </div>
                              {station.connections.length > 0 && (
                                <div className="mt-2 pt-2 border-t">
                                  <p className="text-xs font-semibold mb-1">Conectores:</p>
                                  {station.connections.slice(0, 3).map((conn, i) => (
                                    <p key={i} className="text-xs text-gray-600">
                                      • {conn.type} {conn.powerKW ? `(${conn.powerKW}kW)` : ''}
                                    </p>
                                  ))}
                                  {station.connections.length > 3 && (
                                    <p className="text-xs text-gray-400">
                                      +{station.connections.length - 3} mais
                                    </p>
                                  )}
                                </div>
                              )}
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
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-8 bg-muted/20 rounded animate-pulse" />
                  ))
                ) : (
                  topOperators.map(([operator, count], i) => (
                    <div key={operator} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground truncate max-w-[150px]">
                        {i + 1}. {operator}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {count}
                      </Badge>
                    </div>
                  ))
                )}
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
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-8 bg-muted/20 rounded animate-pulse" />
                  ))
                ) : (
                  topStates.map(([state, count], i) => (
                    <div key={state} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {i + 1}. {state || 'Não informado'}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {count}
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Data Source */}
            <Card className="glass-card bg-green-500/5 border-green-500/20">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">
                  <strong>Fonte:</strong> OpenChargeMap API
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Dados atualizados em tempo real
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
