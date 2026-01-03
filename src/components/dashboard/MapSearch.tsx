import { useState, useRef, useEffect } from "react";
import { Search, MapPin, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { erbsByState } from "@/data/erbData";
import { evStationsData } from "@/data/evStations";

interface SearchResult {
  type: "city" | "state" | "ev";
  name: string;
  subtitle: string;
  lat: number;
  lng: number;
}

interface MapSearchProps {
  onLocationSelect: (lat: number, lng: number, zoom?: number) => void;
  showEV?: boolean;
}

const MapSearch = ({ onLocationSelect, showEV = false }: MapSearchProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchLocations = (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    const query = searchQuery.toLowerCase();
    const matches: SearchResult[] = [];

    // Search states
    erbsByState.forEach(state => {
      if (
        state.state.toLowerCase().includes(query) ||
        state.stateCode.toLowerCase().includes(query)
      ) {
        matches.push({
          type: "state",
          name: state.state,
          subtitle: `${state.stateCode} • ${state.total.toLocaleString("pt-BR")} torres`,
          lat: state.lat,
          lng: state.lng,
        });
      }
    });

    // Search EV stations if enabled
    if (showEV) {
      evStationsData.forEach(station => {
        if (
          station.name.toLowerCase().includes(query) ||
          station.city.toLowerCase().includes(query) ||
          station.address.toLowerCase().includes(query)
        ) {
          matches.push({
            type: "ev",
            name: station.name,
            subtitle: `${station.city}, ${station.state} • ${station.power}`,
            lat: station.lat,
            lng: station.lng,
          });
        }
      });
    }

    // Limit results
    setResults(matches.slice(0, 8));
    setIsLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);
    searchLocations(value);
  };

  const handleSelect = (result: SearchResult) => {
    onLocationSelect(result.lat, result.lng, result.type === "ev" ? 14 : 8);
    setQuery(result.name);
    setIsOpen(false);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative z-[1001]">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder="Buscar cidade, estado ou local..."
          className="pl-9 pr-8 bg-background/80 backdrop-blur-sm border-border/50 text-sm h-9"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-secondary"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {isOpen && (query.length >= 2 || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card/95 backdrop-blur-xl border border-border rounded-lg shadow-xl overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          ) : results.length > 0 ? (
            <ul className="max-h-64 overflow-y-auto">
              {results.map((result, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => handleSelect(result)}
                    className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-secondary/60 transition-colors text-left"
                  >
                    <div className={`mt-0.5 p-1.5 rounded-md ${
                      result.type === "ev" 
                        ? "bg-ev-green/20 text-ev-green" 
                        : "bg-primary/20 text-primary"
                    }`}>
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{result.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-4 text-center text-sm text-muted-foreground">
              Nenhum resultado encontrado
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MapSearch;
