import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Country {
  id: string;
  code: string;
  name: string;
  name_pt: string | null;
  continent: string;
  latitude: number | null;
  longitude: number | null;
}

export interface Tower {
  id: string;
  country_code: string;
  city: string | null;
  state: string | null;
  latitude: number;
  longitude: number;
  operator: string | null;
  technology: string | null;
  frequency: string | null;
  status: string | null;
  installed_at: string | null;
}

export interface EVStation {
  id: string;
  country_code: string;
  city: string | null;
  state: string | null;
  latitude: number;
  longitude: number;
  operator: string | null;
  connector_types: string[] | null;
  power_kw: number | null;
  num_chargers: number | null;
  status: string | null;
  installed_at: string | null;
}

export const useCountries = () => {
  return useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Country[];
    },
  });
};

export const useTowers = (countryCode?: string) => {
  return useQuery({
    queryKey: ['towers', countryCode],
    queryFn: async () => {
      let query = supabase.from('towers').select('*');
      
      if (countryCode) {
        query = query.eq('country_code', countryCode);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Tower[];
    },
  });
};

export const useEVStations = (countryCode?: string) => {
  return useQuery({
    queryKey: ['ev_stations', countryCode],
    queryFn: async () => {
      let query = supabase.from('ev_stations').select('*');
      
      if (countryCode) {
        query = query.eq('country_code', countryCode);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as EVStation[];
    },
  });
};

export const useInfrastructureStats = (countryCode?: string) => {
  const { data: towers, isLoading: towersLoading } = useTowers(countryCode);
  const { data: evStations, isLoading: evLoading } = useEVStations(countryCode);
  const { data: countries, isLoading: countriesLoading } = useCountries();

  const stats = {
    totalTowers: towers?.length || 0,
    totalEVStations: evStations?.length || 0,
    totalChargers: evStations?.reduce((acc, station) => acc + (station.num_chargers || 1), 0) || 0,
    countries: countries?.length || 0,
    towersByCountry: {} as Record<string, number>,
    evByCountry: {} as Record<string, number>,
  };

  towers?.forEach(tower => {
    stats.towersByCountry[tower.country_code] = (stats.towersByCountry[tower.country_code] || 0) + 1;
  });

  evStations?.forEach(station => {
    stats.evByCountry[station.country_code] = (stats.evByCountry[station.country_code] || 0) + 1;
  });

  return {
    stats,
    towers: towers || [],
    evStations: evStations || [],
    countries: countries || [],
    isLoading: towersLoading || evLoading || countriesLoading,
  };
};
