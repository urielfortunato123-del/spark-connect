import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EVConnection {
  id: number;
  type: string;
  powerKW: number | null;
  currentType: string | null;
  quantity: number;
  statusType: string;
}

export interface OpenChargeStation {
  id: number;
  uuid: string;
  title: string;
  address: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  operator: string;
  operatorWebsite: string | null;
  usageCost: string;
  numPoints: number;
  connections: EVConnection[];
  statusType: string;
  isOperational: boolean;
  dateLastVerified: string | null;
  dateCreated: string | null;
}

interface FetchEVStationsParams {
  countryCode?: string;
  maxResults?: number;
  latitude?: number;
  longitude?: number;
  distance?: number;
}

export const useOpenChargeMap = (params: FetchEVStationsParams = {}) => {
  const { 
    countryCode = 'BR', 
    maxResults = 500,
    latitude,
    longitude,
    distance = 50
  } = params;

  return useQuery({
    queryKey: ['open-charge-map', countryCode, maxResults, latitude, longitude, distance],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        countrycode: countryCode,
        maxresults: maxResults.toString(),
      });

      if (latitude !== undefined && longitude !== undefined) {
        queryParams.append('latitude', latitude.toString());
        queryParams.append('longitude', longitude.toString());
        queryParams.append('distance', distance.toString());
      }

      const { data, error } = await supabase.functions.invoke('fetch-ev-stations', {
        body: null,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Since invoke doesn't support query params directly, we need to use a different approach
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-ev-stations?${queryParams.toString()}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch EV stations');
      }

      const result = await response.json();
      return result as { stations: OpenChargeStation[]; total: number };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Stats aggregation hook
export const useEVStationStats = (stations: OpenChargeStation[]) => {
  const totalStations = stations.length;
  
  const totalChargers = stations.reduce((acc, station) => {
    return acc + (station.numPoints || 1);
  }, 0);

  const uniqueCities = new Set(stations.map(s => s.city).filter(Boolean)).size;
  
  const totalPowerKW = stations.reduce((acc, station) => {
    const stationPower = station.connections.reduce((connAcc, conn) => {
      return connAcc + (conn.powerKW || 0) * (conn.quantity || 1);
    }, 0);
    return acc + stationPower;
  }, 0);

  const operatorStats = stations.reduce((acc, station) => {
    const operator = station.operator || 'Desconhecido';
    acc[operator] = (acc[operator] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const stateStats = stations.reduce((acc, station) => {
    const state = station.state || 'Não informado';
    acc[state] = (acc[state] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const connectionTypeStats = stations.reduce((acc, station) => {
    station.connections.forEach(conn => {
      const type = conn.type || 'Unknown';
      acc[type] = (acc[type] || 0) + (conn.quantity || 1);
    });
    return acc;
  }, {} as Record<string, number>);

  return {
    totalStations,
    totalChargers,
    uniqueCities,
    totalPowerKW,
    operatorStats,
    stateStats,
    connectionTypeStats,
  };
};
