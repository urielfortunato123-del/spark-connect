import { useState, useMemo } from "react";
import { MapPin, Building2, Radio, ChevronDown, X, Search, Zap, AlertTriangle } from "lucide-react";
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

// Brazilian states with cities
const statesWithCities: Record<string, { name: string; cities: { name: string; lat: number; lng: number; erbs: number }[] }> = {
  SP: {
    name: "São Paulo",
    cities: [
      { name: "São Paulo", lat: -23.5505, lng: -46.6333, erbs: 8520 },
      { name: "Campinas", lat: -22.9099, lng: -47.0626, erbs: 1245 },
      { name: "Santos", lat: -23.9608, lng: -46.3336, erbs: 892 },
      { name: "Ribeirão Preto", lat: -21.1775, lng: -47.8103, erbs: 756 },
      { name: "São José dos Campos", lat: -23.1896, lng: -45.8841, erbs: 689 },
      { name: "Sorocaba", lat: -23.5015, lng: -47.4526, erbs: 542 },
      { name: "Guarulhos", lat: -23.4538, lng: -46.5333, erbs: 623 },
    ],
  },
  RJ: {
    name: "Rio de Janeiro",
    cities: [
      { name: "Rio de Janeiro", lat: -22.9068, lng: -43.1729, erbs: 5230 },
      { name: "Niterói", lat: -22.8833, lng: -43.1036, erbs: 543 },
      { name: "Duque de Caxias", lat: -22.7856, lng: -43.3116, erbs: 387 },
      { name: "Petrópolis", lat: -22.5112, lng: -43.1781, erbs: 234 },
    ],
  },
  MG: {
    name: "Minas Gerais",
    cities: [
      { name: "Belo Horizonte", lat: -19.9167, lng: -43.9345, erbs: 4120 },
      { name: "Uberlândia", lat: -18.9186, lng: -48.2772, erbs: 876 },
      { name: "Juiz de Fora", lat: -21.7642, lng: -43.3503, erbs: 421 },
    ],
  },
  RS: {
    name: "Rio Grande do Sul",
    cities: [
      { name: "Porto Alegre", lat: -30.0346, lng: -51.2177, erbs: 2890 },
      { name: "Caxias do Sul", lat: -29.1634, lng: -51.1797, erbs: 543 },
    ],
  },
  PR: {
    name: "Paraná",
    cities: [
      { name: "Curitiba", lat: -25.4284, lng: -49.2733, erbs: 3210 },
      { name: "Londrina", lat: -23.3045, lng: -51.1696, erbs: 654 },
      { name: "Maringá", lat: -23.4205, lng: -51.9333, erbs: 487 },
    ],
  },
  BA: {
    name: "Bahia",
    cities: [
      { name: "Salvador", lat: -12.9714, lng: -38.5014, erbs: 2654 },
      { name: "Feira de Santana", lat: -12.2664, lng: -38.9663, erbs: 432 },
    ],
  },
  SC: {
    name: "Santa Catarina",
    cities: [
      { name: "Florianópolis", lat: -27.5954, lng: -48.5480, erbs: 1234 },
      { name: "Joinville", lat: -26.3045, lng: -48.8487, erbs: 654 },
    ],
  },
  CE: {
    name: "Ceará",
    cities: [
      { name: "Fortaleza", lat: -3.7319, lng: -38.5267, erbs: 2876 },
    ],
  },
  PE: {
    name: "Pernambuco",
    cities: [
      { name: "Recife", lat: -8.0476, lng: -34.8770, erbs: 2145 },
    ],
  },
  GO: {
    name: "Goiás",
    cities: [
      { name: "Goiânia", lat: -16.6869, lng: -49.2648, erbs: 1987 },
    ],
  },
  DF: {
    name: "Distrito Federal",
    cities: [
      { name: "Brasília", lat: -15.7942, lng: -47.8822, erbs: 2130 },
    ],
  },
  PA: {
    name: "Pará",
    cities: [
      { name: "Belém", lat: -1.4558, lng: -48.4902, erbs: 1543 },
    ],
  },
  AM: {
    name: "Amazonas",
    cities: [
      { name: "Manaus", lat: -3.1190, lng: -60.0217, erbs: 1432 },
    ],
  },
  MA: {
    name: "Maranhão",
    cities: [
      { name: "São Luís", lat: -2.5297, lng: -44.2625, erbs: 1234 },
    ],
  },
  ES: {
    name: "Espírito Santo",
    cities: [
      { name: "Vitória", lat: -20.3155, lng: -40.3128, erbs: 987 },
    ],
  },
};

interface LocationSelectorProps {
  onNavigate: (lat: number, lng: number, zoom: number) => void;
  variant?: "5g" | "ev" | "vazios" | "ai";
}

const LocationSelector = ({ onNavigate, variant = "5g" }: LocationSelectorProps) => {
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  const states = useMemo(() => {
    return Object.entries(statesWithCities)
      .map(([code, data]) => ({
        code,
        name: data.name,
        erbs: erbsByState.find(s => s.stateCode === code)?.total || 0,
      }))
      .sort((a, b) => b.erbs - a.erbs);
  }, []);

  const cities = useMemo(() => {
    if (!selectedState) return [];
    const stateData = statesWithCities[selectedState];
    if (!stateData) return [];
    
    let filteredCities = stateData.cities;
    if (searchTerm) {
      filteredCities = filteredCities.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filteredCities.sort((a, b) => b.erbs - a.erbs);
  }, [selectedState, searchTerm]);

  const handleStateChange = (stateCode: string) => {
    setSelectedState(stateCode);
    setSelectedCity("");
    setSearchTerm("");
    
    const stateData = erbsByState.find(s => s.stateCode === stateCode);
    if (stateData) {
      onNavigate(stateData.lat, stateData.lng, 7);
    }
  };

  const handleCityChange = (cityName: string) => {
    setSelectedCity(cityName);
    
    const stateData = statesWithCities[selectedState];
    const city = stateData?.cities.find(c => c.name === cityName);
    if (city) {
      onNavigate(city.lat, city.lng, 12);
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
    const stateInfo = statesWithCities[selectedState];
    return stateInfo?.cities.reduce((acc, c) => acc + c.erbs, 0) || 0;
  }, [selectedState]);

  const currentCityErbs = useMemo(() => {
    if (!selectedCity || !selectedState) return null;
    const stateData = statesWithCities[selectedState];
    const city = stateData?.cities.find(c => c.name === selectedCity);
    return city?.erbs || null;
  }, [selectedState, selectedCity]);

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
          <SelectTrigger className="h-9 text-sm bg-background/50">
            <SelectValue placeholder="Selecione um estado" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px] z-[9999] bg-popover">
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

          <Select value={selectedCity} onValueChange={handleCityChange}>
            <SelectTrigger className="h-9 text-sm bg-background/50">
              <SelectValue placeholder="Selecione uma cidade" />
            </SelectTrigger>
            <SelectContent className="max-h-[250px] z-[9999] bg-popover">
              {cities.map((city) => (
                <SelectItem key={city.name} value={city.name}>
                  <div className="flex items-center justify-between w-full gap-4">
                    <span>{city.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {city.erbs.toLocaleString("pt-BR")} ERBs
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
              {(currentCityErbs || currentStateErbs || totalERBStats.total).toLocaleString("pt-BR")}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">Fonte: Anatel</p>
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
                  <ChevronDown className="w-3 h-3 rotate-[-90deg]" />
                  <span className="text-foreground">{statesWithCities[selectedState]?.name}</span>
                </>
              )}
              {selectedCity && (
                <>
                  <ChevronDown className="w-3 h-3 rotate-[-90deg]" />
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
