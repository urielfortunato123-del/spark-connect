import { useState, useMemo } from "react";
import { MapPin, Building2, Radio, ChevronDown, X, Search } from "lucide-react";
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

// Brazilian states with cities (sample data - in production would come from IBGE API)
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
      { name: "Osasco", lat: -23.5325, lng: -46.7917, erbs: 478 },
      { name: "Guarulhos", lat: -23.4538, lng: -46.5333, erbs: 623 },
    ],
  },
  RJ: {
    name: "Rio de Janeiro",
    cities: [
      { name: "Rio de Janeiro", lat: -22.9068, lng: -43.1729, erbs: 5230 },
      { name: "Niterói", lat: -22.8833, lng: -43.1036, erbs: 543 },
      { name: "Duque de Caxias", lat: -22.7856, lng: -43.3116, erbs: 387 },
      { name: "Nova Iguaçu", lat: -22.7556, lng: -43.4603, erbs: 312 },
      { name: "Petrópolis", lat: -22.5112, lng: -43.1781, erbs: 234 },
      { name: "Campos dos Goytacazes", lat: -21.7545, lng: -41.3244, erbs: 198 },
    ],
  },
  MG: {
    name: "Minas Gerais",
    cities: [
      { name: "Belo Horizonte", lat: -19.9167, lng: -43.9345, erbs: 4120 },
      { name: "Uberlândia", lat: -18.9186, lng: -48.2772, erbs: 876 },
      { name: "Contagem", lat: -19.9319, lng: -44.0539, erbs: 543 },
      { name: "Juiz de Fora", lat: -21.7642, lng: -43.3503, erbs: 421 },
      { name: "Betim", lat: -19.9678, lng: -44.1983, erbs: 312 },
      { name: "Montes Claros", lat: -16.7350, lng: -43.8617, erbs: 287 },
    ],
  },
  RS: {
    name: "Rio Grande do Sul",
    cities: [
      { name: "Porto Alegre", lat: -30.0346, lng: -51.2177, erbs: 2890 },
      { name: "Caxias do Sul", lat: -29.1634, lng: -51.1797, erbs: 543 },
      { name: "Pelotas", lat: -31.7654, lng: -52.3376, erbs: 312 },
      { name: "Canoas", lat: -29.9178, lng: -51.1839, erbs: 287 },
      { name: "Santa Maria", lat: -29.6868, lng: -53.8149, erbs: 234 },
    ],
  },
  PR: {
    name: "Paraná",
    cities: [
      { name: "Curitiba", lat: -25.4284, lng: -49.2733, erbs: 3210 },
      { name: "Londrina", lat: -23.3045, lng: -51.1696, erbs: 654 },
      { name: "Maringá", lat: -23.4205, lng: -51.9333, erbs: 487 },
      { name: "Ponta Grossa", lat: -25.0945, lng: -50.1633, erbs: 312 },
      { name: "Cascavel", lat: -24.9578, lng: -53.4595, erbs: 234 },
    ],
  },
  BA: {
    name: "Bahia",
    cities: [
      { name: "Salvador", lat: -12.9714, lng: -38.5014, erbs: 2654 },
      { name: "Feira de Santana", lat: -12.2664, lng: -38.9663, erbs: 432 },
      { name: "Vitória da Conquista", lat: -14.8619, lng: -40.8389, erbs: 287 },
      { name: "Camaçari", lat: -12.6996, lng: -38.3263, erbs: 198 },
    ],
  },
  SC: {
    name: "Santa Catarina",
    cities: [
      { name: "Florianópolis", lat: -27.5954, lng: -48.5480, erbs: 1234 },
      { name: "Joinville", lat: -26.3045, lng: -48.8487, erbs: 654 },
      { name: "Blumenau", lat: -26.9194, lng: -49.0661, erbs: 432 },
      { name: "Itajaí", lat: -26.9078, lng: -48.6619, erbs: 287 },
    ],
  },
  CE: {
    name: "Ceará",
    cities: [
      { name: "Fortaleza", lat: -3.7319, lng: -38.5267, erbs: 2876 },
      { name: "Caucaia", lat: -3.7361, lng: -38.6531, erbs: 321 },
      { name: "Juazeiro do Norte", lat: -7.2131, lng: -39.3150, erbs: 234 },
      { name: "Maracanaú", lat: -3.8761, lng: -38.6253, erbs: 187 },
    ],
  },
  PE: {
    name: "Pernambuco",
    cities: [
      { name: "Recife", lat: -8.0476, lng: -34.8770, erbs: 2145 },
      { name: "Jaboatão dos Guararapes", lat: -8.1128, lng: -35.0156, erbs: 432 },
      { name: "Olinda", lat: -8.0089, lng: -34.8553, erbs: 287 },
      { name: "Caruaru", lat: -8.2760, lng: -35.9819, erbs: 198 },
    ],
  },
  GO: {
    name: "Goiás",
    cities: [
      { name: "Goiânia", lat: -16.6869, lng: -49.2648, erbs: 1987 },
      { name: "Aparecida de Goiânia", lat: -16.8231, lng: -49.2469, erbs: 432 },
      { name: "Anápolis", lat: -16.3281, lng: -48.9534, erbs: 287 },
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
      { name: "Ananindeua", lat: -1.3656, lng: -48.3722, erbs: 321 },
      { name: "Santarém", lat: -2.4386, lng: -54.6986, erbs: 187 },
    ],
  },
  AM: {
    name: "Amazonas",
    cities: [
      { name: "Manaus", lat: -3.1190, lng: -60.0217, erbs: 1432 },
      { name: "Parintins", lat: -2.6284, lng: -56.7356, erbs: 87 },
    ],
  },
  MA: {
    name: "Maranhão",
    cities: [
      { name: "São Luís", lat: -2.5297, lng: -44.2625, erbs: 1234 },
      { name: "Imperatriz", lat: -5.5189, lng: -47.4663, erbs: 234 },
    ],
  },
  ES: {
    name: "Espírito Santo",
    cities: [
      { name: "Vitória", lat: -20.3155, lng: -40.3128, erbs: 987 },
      { name: "Vila Velha", lat: -20.3297, lng: -40.2925, erbs: 543 },
      { name: "Serra", lat: -20.1283, lng: -40.3081, erbs: 321 },
    ],
  },
  MT: {
    name: "Mato Grosso",
    cities: [
      { name: "Cuiabá", lat: -15.5989, lng: -56.0949, erbs: 876 },
      { name: "Várzea Grande", lat: -15.6469, lng: -56.1325, erbs: 234 },
      { name: "Rondonópolis", lat: -16.4708, lng: -54.6356, erbs: 187 },
    ],
  },
  MS: {
    name: "Mato Grosso do Sul",
    cities: [
      { name: "Campo Grande", lat: -20.4697, lng: -54.6201, erbs: 765 },
      { name: "Dourados", lat: -22.2211, lng: -54.8056, erbs: 234 },
    ],
  },
  RN: {
    name: "Rio Grande do Norte",
    cities: [
      { name: "Natal", lat: -5.7945, lng: -35.2110, erbs: 1234 },
      { name: "Mossoró", lat: -5.1878, lng: -37.3442, erbs: 287 },
    ],
  },
  PB: {
    name: "Paraíba",
    cities: [
      { name: "João Pessoa", lat: -7.1195, lng: -34.8450, erbs: 987 },
      { name: "Campina Grande", lat: -7.2290, lng: -35.8810, erbs: 432 },
    ],
  },
  PI: {
    name: "Piauí",
    cities: [
      { name: "Teresina", lat: -5.0892, lng: -42.8019, erbs: 876 },
      { name: "Parnaíba", lat: -2.9050, lng: -41.7783, erbs: 187 },
    ],
  },
  AL: {
    name: "Alagoas",
    cities: [
      { name: "Maceió", lat: -9.6658, lng: -35.7350, erbs: 765 },
      { name: "Arapiraca", lat: -9.7522, lng: -36.6614, erbs: 187 },
    ],
  },
  SE: {
    name: "Sergipe",
    cities: [
      { name: "Aracaju", lat: -10.9472, lng: -37.0731, erbs: 654 },
    ],
  },
  TO: {
    name: "Tocantins",
    cities: [
      { name: "Palmas", lat: -10.1689, lng: -48.3317, erbs: 432 },
      { name: "Araguaína", lat: -7.1919, lng: -48.2072, erbs: 187 },
    ],
  },
  RO: {
    name: "Rondônia",
    cities: [
      { name: "Porto Velho", lat: -8.7612, lng: -63.9039, erbs: 432 },
      { name: "Ji-Paraná", lat: -10.8858, lng: -61.9319, erbs: 134 },
    ],
  },
  AC: {
    name: "Acre",
    cities: [
      { name: "Rio Branco", lat: -9.9754, lng: -67.8249, erbs: 234 },
    ],
  },
  AP: {
    name: "Amapá",
    cities: [
      { name: "Macapá", lat: 0.0349, lng: -51.0694, erbs: 287 },
    ],
  },
  RR: {
    name: "Roraima",
    cities: [
      { name: "Boa Vista", lat: 2.8235, lng: -60.6758, erbs: 198 },
    ],
  },
};

interface StateCitySelectorProps {
  onLocationSelect: (lat: number, lng: number, name: string, erbs: number) => void;
  onClear: () => void;
  selectedState: string | null;
  selectedCity: string | null;
  filteredCount: number;
}

const StateCitySelector = ({
  onLocationSelect,
  onClear,
  selectedState,
  selectedCity,
  filteredCount,
}: StateCitySelectorProps) => {
  const [internalState, setInternalState] = useState<string>(selectedState || "");
  const [internalCity, setInternalCity] = useState<string>(selectedCity || "");
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
    if (!internalState) return [];
    const stateData = statesWithCities[internalState];
    if (!stateData) return [];
    
    let filteredCities = stateData.cities;
    if (searchTerm) {
      filteredCities = filteredCities.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filteredCities.sort((a, b) => b.erbs - a.erbs);
  }, [internalState, searchTerm]);

  const handleStateChange = (stateCode: string) => {
    setInternalState(stateCode);
    setInternalCity("");
    setSearchTerm("");
    
    // Navigate to state center
    const stateData = erbsByState.find(s => s.stateCode === stateCode);
    if (stateData) {
      const stateInfo = statesWithCities[stateCode];
      const totalErbs = stateInfo?.cities.reduce((acc, c) => acc + c.erbs, 0) || stateData.total;
      onLocationSelect(stateData.lat, stateData.lng, stateData.state, totalErbs);
    }
  };

  const handleCityChange = (cityName: string) => {
    setInternalCity(cityName);
    
    const stateData = statesWithCities[internalState];
    const city = stateData?.cities.find(c => c.name === cityName);
    if (city) {
      onLocationSelect(city.lat, city.lng, city.name, city.erbs);
    }
  };

  const handleClear = () => {
    setInternalState("");
    setInternalCity("");
    setSearchTerm("");
    onClear();
  };

  const currentStateErbs = useMemo(() => {
    if (!internalState) return totalERBStats.total;
    const stateInfo = statesWithCities[internalState];
    return stateInfo?.cities.reduce((acc, c) => acc + c.erbs, 0) || 0;
  }, [internalState]);

  const currentCityErbs = useMemo(() => {
    if (!internalCity || !internalState) return null;
    const stateData = statesWithCities[internalState];
    const city = stateData?.cities.find(c => c.name === internalCity);
    return city?.erbs || null;
  }, [internalState, internalCity]);

  return (
    <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-2">
      {/* Main selector card */}
      <div className="glass-card p-3 min-w-[280px] max-w-[320px]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">Mapa de Antenas</span>
          </div>
          {(internalState || internalCity) && (
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
          <Select value={internalState} onValueChange={handleStateChange}>
            <SelectTrigger className="h-9 text-sm bg-background/50">
              <SelectValue placeholder="Selecione um estado" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
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

        {/* City selector (only shows when state is selected) */}
        {internalState && (
          <div className="space-y-2 mt-3 pt-3 border-t border-border/30">
            <div className="flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Cidade</span>
            </div>
            
            {/* Search input for cities */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 pl-8 text-sm bg-background/50"
              />
            </div>

            <Select value={internalCity} onValueChange={handleCityChange}>
              <SelectTrigger className="h-9 text-sm bg-background/50">
                <SelectValue placeholder="Selecione uma cidade" />
              </SelectTrigger>
              <SelectContent className="max-h-[250px]">
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
      </div>

      {/* ERB Counter */}
      <div className="glass-card p-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {internalCity ? "Antenas na cidade" : internalState ? "Antenas no estado" : "Total de Antenas"}
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
        {(internalState || internalCity) && (
          <div className="mt-2 pt-2 border-t border-border/30">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>Brasil</span>
              {internalState && (
                <>
                  <ChevronDown className="w-3 h-3 rotate-[-90deg]" />
                  <span className="text-foreground">{statesWithCities[internalState]?.name}</span>
                </>
              )}
              {internalCity && (
                <>
                  <ChevronDown className="w-3 h-3 rotate-[-90deg]" />
                  <span className="text-primary">{internalCity}</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StateCitySelector;
