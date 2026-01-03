import { useState, useCallback } from "react";
import Header from "@/components/dashboard/Header";
import StatsPanel from "@/components/dashboard/StatsPanel";
import FilterPanel from "@/components/dashboard/FilterPanel";
import LocationSelector from "@/components/dashboard/LocationSelector";
import InfrastructureMap from "@/components/dashboard/InfrastructureMap";
import AIAnalysisPanel from "@/components/dashboard/AIAnalysisPanel";
import DistributionChart from "@/components/dashboard/DistributionChart";
import EvolutionChart from "@/components/dashboard/EvolutionChart";
import OperatorEvolutionChart from "@/components/dashboard/OperatorEvolutionChart";
import RegionalChart from "@/components/dashboard/RegionalChart";
import EVStatsPanel from "@/components/dashboard/EVStatsPanel";
import InfraChat from "@/components/dashboard/InfraChat";
import ExportButton from "@/components/dashboard/ExportButton";
import DataImportButton from "@/components/dashboard/DataImportButton";
import VaziosPanel from "@/components/dashboard/VaziosPanel";
import VazioInsightsPanel from "@/components/dashboard/VazioInsightsPanel";
import { useEVStations } from "@/hooks/useInfrastructureData";
import { useVaziosTerritoriais } from "@/hooks/useVaziosTerritoriais";
import type { VazioTerritorial } from "@/hooks/useVaziosTerritoriais";

const Index = () => {
  const [activeTab, setActiveTab] = useState<"5g" | "ev" | "vazios" | "ai">("5g");
  const [activeView, setActiveView] = useState<"markers" | "heat" | "clusters">("markers");
  const [selectedOperators, setSelectedOperators] = useState([
    "VIVO", "TIM", "CLARO", "BRISANET", "ALGAR", "UNIFIQUE"
  ]);
  const [aiRecommendations, setAIRecommendations] = useState<any[]>([]);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [selectedVazio, setSelectedVazio] = useState<VazioTerritorial | null>(null);
  const [mapNavigateTo, setMapNavigateTo] = useState<{ lat: number; lng: number; zoom: number } | null>(null);

  // Data hooks for counts
  const { data: evStations } = useEVStations("BR");
  const { totalVazios } = useVaziosTerritoriais();

  const toggleOperator = (operator: string) => {
    setSelectedOperators((prev) =>
      prev.includes(operator)
        ? prev.filter((o) => o !== operator)
        : [...prev, operator]
    );
  };

  const handleMunicipioSelect = useCallback((lat: number, lng: number, nome: string) => {
    setMapCenter({ lat, lng, name: nome });
  }, []);

  const handleVazioSelect = useCallback((vazio: VazioTerritorial) => {
    setSelectedVazio(vazio);
    if (vazio.municipio.latitude && vazio.municipio.longitude) {
      setMapCenter({ lat: vazio.municipio.latitude, lng: vazio.municipio.longitude, name: vazio.municipio.nome });
    }
  }, []);

  const handleCloseInsights = useCallback(() => {
    setSelectedVazio(null);
  }, []);

  const handleMapNavigate = useCallback((lat: number, lng: number, zoom: number) => {
    setMapNavigateTo({ lat, lng, zoom });
  }, []);

  return (
    <div className="min-h-screen bg-background p-3 md:p-6 grid-pattern">
      <div className="max-w-[1800px] mx-auto space-y-4 md:space-y-5">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Data Import Controls */}
        <div className="flex flex-wrap items-center justify-end gap-3">
          {activeTab === "5g" && <DataImportButton dataType="towers" />}
          {activeTab === "ev" && <DataImportButton dataType="ev_stations" />}
        </div>

        {/* Mobile: Stack layout, Desktop: Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_340px] xl:grid-cols-[300px_1fr_380px] gap-4 lg:gap-5">
          {/* Left Sidebar */}
          <div className="space-y-4 order-2 lg:order-1">
            {/* Location Selector - visible on all tabs */}
            <LocationSelector 
              onNavigate={handleMapNavigate} 
              variant={activeTab}
              evCount={evStations?.length || 0}
              vaziosCount={totalVazios}
            />

            {activeTab === "5g" && (
              <>
                <StatsPanel />
                <div className="hidden md:block">
                  <FilterPanel 
                    activeView={activeView}
                    setActiveView={setActiveView}
                    selectedOperators={selectedOperators}
                    toggleOperator={toggleOperator}
                  />
                </div>
                {/* Export Button */}
                <div className="hidden md:flex justify-center">
                  <ExportButton type="5g" selectedOperators={selectedOperators} />
                </div>
              </>
            )}
            {activeTab === "ev" && (
              <>
                <EVStatsPanel />
                {/* Export Button */}
                <div className="hidden md:flex justify-center">
                  <ExportButton type="ev" />
                </div>
              </>
            )}
            {activeTab === "vazios" && (
              <VaziosPanel 
                onMunicipioSelect={handleMunicipioSelect} 
                onVazioSelect={handleVazioSelect}
              />
            )}
            {activeTab === "ai" && (
              <AIAnalysisPanel onRecommendationsUpdate={setAIRecommendations} />
            )}
          </div>

          {/* Map - Full width on mobile, centered on desktop */}
          <div className="space-y-4 md:space-y-5 order-1 lg:order-2">
            {/* Mobile Filter Toggle */}
            {activeTab === "5g" && (
              <div className="md:hidden">
                <FilterPanel 
                  activeView={activeView}
                  setActiveView={setActiveView}
                  selectedOperators={selectedOperators}
                  toggleOperator={toggleOperator}
                />
              </div>
            )}
            
            <div className="h-[350px] sm:h-[400px] md:h-[500px] lg:h-[600px]">
              <InfrastructureMap 
                selectedOperators={selectedOperators}
                showEVStations={activeTab === "ev"}
                showTowers={activeTab === "5g" || activeTab === "ai"}
                showVazios={activeTab === "vazios"}
                aiRecommendations={aiRecommendations}
                viewMode={activeView}
                countryFilter="BR"
                onMunicipioClick={handleMunicipioSelect}
                onVazioClick={handleVazioSelect}
                navigateTo={mapNavigateTo}
              />
            </div>

            {activeTab === "5g" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  <DistributionChart type="5g" />
                  <EvolutionChart type="5g" />
                  <RegionalChart type="5g" />
                </div>
                <OperatorEvolutionChart />
              </>
            )}

            {activeTab === "ev" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                <DistributionChart type="ev" />
                <EvolutionChart type="ev" />
                <RegionalChart type="ev" />
              </div>
            )}

            {/* Mobile Export Button */}
            {(activeTab === "5g" || activeTab === "ev") && (
              <div className="md:hidden flex justify-center">
                <ExportButton type={activeTab} selectedOperators={activeTab === "5g" ? selectedOperators : undefined} />
              </div>
            )}
          </div>

          {/* Right Panel - Chat */}
          <div className="h-[400px] sm:h-[450px] md:h-[500px] lg:h-[600px] order-3">
            <InfraChat />
          </div>
        </div>

        {/* Footer */}
        <div className="divider-gold mt-6 md:mt-8" />
        <footer className="text-center py-3 md:py-4">
          <p className="text-xs text-muted-foreground">
            © 2026 InfraBrasil — Plataforma Integrada de Infraestrutura Nacional
          </p>
        </footer>
      </div>

      {/* Vazio Insights Panel - Slide from right */}
      <VazioInsightsPanel 
        vazio={selectedVazio} 
        onClose={handleCloseInsights} 
      />
    </div>
  );
};

export default Index;
