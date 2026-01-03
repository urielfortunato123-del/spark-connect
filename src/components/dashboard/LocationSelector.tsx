import { useState, useMemo, useEffect } from "react";
import { MapPin, Building2, Radio, ChevronRight, X, Search, Zap, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { erbsByState, totalERBStats } from "@/data/erbData";
import { supabase } from "@/integrations/supabase/client";

// Brazilian states
const brazilianStates: Record<string, { name: string; lat: number; lng: number }> = {
  AC: { name: "Acre", lat: -9.0238, lng: -70.8120 },
  AL: { name: "Alagoas", lat: -9.5713, lng: -36.7820 },
  AP: { name: "Amapá", lat: 1.4102, lng: -51.7767 },
  AM: { name: "Amazonas", lat: -3.4168, lng: -65.8561 },
  BA: { name: "Bahia", lat: -12.5797, lng: -41.7007 },
  CE: { name: "Ceará", lat: -5.4984, lng: -39.3206 },
  DF: { name: "Distrito Federal", lat: -15.7942, lng: -47.8822 },
  ES: { name: "Espírito Santo", lat: -19.1834, lng: -40.3089 },
  GO: { name: "Goiás", lat: -15.8270, lng: -49.8362 },
  MA: { name: "Maranhão", lat: -5.4199, lng: -45.2585 },
  MT: { name: "Mato Grosso", lat: -12.6819, lng: -56.9211 },
  MS: { name: "Mato Grosso do Sul", lat: -20.7722, lng: -54.7852 },
  MG: { name: "Minas Gerais", lat: -18.5122, lng: -44.5550 },
  PA: { name: "Pará", lat: -3.4168, lng: -52.2166 },
  PB: { name: "Paraíba", lat: -7.2399, lng: -36.7819 },
  PR: { name: "Paraná", lat: -24.8937, lng: -51.5533 },
  PE: { name: "Pernambuco", lat: -8.3137, lng: -37.8600 },
  PI: { name: "Piauí", lat: -7.7183, lng: -42.7289 },
  RJ: { name: "Rio de Janeiro", lat: -22.2524, lng: -42.6550 },
  RN: { name: "Rio Grande do Norte", lat: -5.8126, lng: -36.5951 },
  RS: { name: "Rio Grande do Sul", lat: -29.7545, lng: -53.2225 },
  RO: { name: "Rondônia", lat: -10.9435, lng: -62.8278 },
  RR: { name: "Roraima", lat: 2.7376, lng: -62.0751 },
  SC: { name: "Santa Catarina", lat: -27.2423, lng: -50.2189 },
  SP: { name: "São Paulo", lat: -22.1965, lng: -48.7934 },
  SE: { name: "Sergipe", lat: -10.5741, lng: -37.3857 },
  TO: { name: "Tocantins", lat: -10.1753, lng: -48.2982 },
};

interface Municipio {
  id: string;
  nome: string;
  estado: string;
  populacao: number;
  latitude: number | null;
  longitude: number | null;
}

interface LocationSelectorProps {
  onNavigate: (lat: number, lng: number, zoom: number) => void;
  variant?: "5g" | "ev" | "vazios" | "ai";
  evCount?: number;
  vaziosCount?: number;
}

const LocationSelector = ({ onNavigate, variant = "5g", evCount = 0, vaziosCount = 0 }: LocationSelectorProps) => {
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch municipalities when state changes
  useEffect(() => {
    if (!selectedState) {
      setMunicipios([]);
      return;
    }

    const fetchMunicipios = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('municipios')
          .select('id, nome, estado, populacao, latitude, longitude')
          .eq('estado', selectedState)
          .order('populacao', { ascending: false });

        if (error) throw error;
        setMunicipios(data || []);
      } catch (err) {
        console.error('Error fetching municipios:', err);
        setMunicipios([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMunicipios();
  }, [selectedState]);

  const states = useMemo(() => {
    return Object.entries(brazilianStates)
      .map(([code, data]) => ({
        code,
        name: data.name,
        erbs: erbsByState.find(s => s.stateCode === code)?.total || 0,
      }))
      .sort((a, b) => b.erbs - a.erbs);
  }, []);

  const filteredCities = useMemo(() => {
    if (!searchTerm) return municipios.slice(0, 50); // Show top 50 by population
    
    return municipios
      .filter(m => m.nome.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 50);
  }, [municipios, searchTerm]);

  const handleStateChange = (stateCode: string) => {
    setSelectedState(stateCode);
    setSelectedCity("");
    setSearchTerm("");
    
    const stateData = brazilianStates[stateCode];
    if (stateData) {
      onNavigate(stateData.lat, stateData.lng, 7);
    }
  };

  const handleCityChange = (cityId: string) => {
    const city = municipios.find(m => m.id === cityId);
    if (city) {
      setSelectedCity(city.nome);
      if (city.latitude && city.longitude) {
        onNavigate(city.latitude, city.longitude, 12);
      }
    }
  };

  const handleClear = () => {
    setSelectedState("");
    setSelectedCity("");
    setSearchTerm("");
    onNavigate(-14.235, -51.9253, 4);
  };

  const currentStateErbs = useMemo(() => {
    if (!selectedState) return totalERBStats.total;
    return erbsByState.find(s => s.stateCode === selectedState)?.total || 0;
  }, [selectedState]);

  // Get the count based on variant
  const getMainCount = () => {
    if (variant === "ev") return evCount;
    if (variant === "vazios") return vaziosCount;
    return currentStateErbs || totalERBStats.total;
  };

  const getSourceLabel = () => {
    if (variant === "ev") return "Fonte: ABVE / ANEEL";
    if (variant === "vazios") return "Fonte: Análise IBGE";
    return "Fonte: Anatel";
  };

  const getIcon = () => {
    switch (variant) {
      case "ev": return <Zap className="w-4 h-4 text-green-500" />;
      case "vazios": return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default: return <Radio className="w-4 h-4 text-primary" />;
    }
  };

  const getTitle = () => {
    switch (variant) {
      case "ev": return "Buscar Eletropostos";
      case "vazios": return "Buscar Vazios";
      default: return "Buscar Antenas";
    }
  };

  const getCountLabel = () => {
    if (variant === "ev") {
      return selectedCity ? "Estações na cidade" : selectedState ? "Estações no estado" : "Total de Eletropostos";
    }
    if (variant === "vazios") {
      return selectedCity ? "Vazios na cidade" : selectedState ? "Vazios no estado" : "Vazios Territoriais";
    }
    return selectedCity ? "Antenas na cidade" : selectedState ? "Antenas no estado" : "Total de Antenas";
  };

  return (
    <div className="glass-card p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getIcon()}
          <span className="text-xs font-semibold text-foreground">{getTitle()}</span>
        </div>
        {(selectedState || selectedCity) && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0"
            onClick={handleClear}
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      {/* State selector */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Estado (UF)</span>
        </div>
        <Select value={selectedState} onValueChange={handleStateChange}>
          <SelectTrigger className="h-9 text-sm bg-background border-border">
            <SelectValue placeholder="Selecione um estado" />
          </SelectTrigger>
          <SelectContent 
            className="max-h-[300px] bg-popover border-border shadow-lg"
            position="popper"
            sideOffset={4}
          >
            {states.map((state) => (
              <SelectItem key={state.code} value={state.code}>
                <div className="flex items-center justify-between w-full gap-4">
                  <span>{state.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {state.erbs.toLocaleString("pt-BR")} ERBs
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* City selector */}
      {selectedState && (
        <div className="space-y-2 pt-2 border-t border-border/30">
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Cidade</span>
          </div>
          
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar cidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 pl-8 text-sm bg-background/50"
            />
          </div>

          <Select value="" onValueChange={handleCityChange}>
            <SelectTrigger className="h-9 text-sm bg-background border-border">
              <SelectValue placeholder={selectedCity || "Selecione uma cidade"} />
            </SelectTrigger>
            <SelectContent 
              className="max-h-[250px] bg-popover border-border shadow-lg"
              position="popper"
              sideOffset={4}
            >
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Carregando...</span>
                </div>
              ) : filteredCities.length === 0 ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  Nenhuma cidade encontrada
                </div>
              ) : (
                filteredCities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    <div className="flex items-center justify-between w-full gap-4">
                      <span>{city.nome}</span>
                      <span className="text-xs text-muted-foreground">
                        {city.populacao.toLocaleString("pt-BR")} hab
                      </span>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          
          {municipios.length > 0 && (
            <p className="text-[10px] text-muted-foreground">
              {municipios.length} municípios no estado
            </p>
          )}
        </div>
      )}

      {/* Counter */}
      <div className="pt-2 border-t border-border/30">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {getCountLabel()}
            </p>
            <p className="text-lg font-bold text-foreground">
              {getMainCount().toLocaleString("pt-BR")}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">{getSourceLabel()}</p>
            <p className="text-[10px] text-primary">{totalERBStats.lastUpdate}</p>
          </div>
        </div>
        
        {/* Breadcrumb */}
        {(selectedState || selectedCity) && (
          <div className="mt-2 pt-2 border-t border-border/30">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>Brasil</span>
              {selectedState && (
                <>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-foreground">{brazilianStates[selectedState]?.name}</span>
                </>
              )}
              {selectedCity && (
                <>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-primary">{selectedCity}</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationSelector;
