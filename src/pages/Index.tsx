import { useState } from "react";
import Header from "@/components/dashboard/Header";
import StatsPanel from "@/components/dashboard/StatsPanel";
import FilterPanel from "@/components/dashboard/FilterPanel";
import InfrastructureMap from "@/components/dashboard/InfrastructureMap";
import AIAnalysisPanel from "@/components/dashboard/AIAnalysisPanel";
import DistributionChart from "@/components/dashboard/DistributionChart";
import EvolutionChart from "@/components/dashboard/EvolutionChart";
import RegionalChart from "@/components/dashboard/RegionalChart";
import EVStatsPanel from "@/components/dashboard/EVStatsPanel";
import InfraChat from "@/components/dashboard/InfraChat";

const Index = () => {
  const [activeTab, setActiveTab] = useState<"5g" | "ev" | "ai">("5g");
  const [activeView, setActiveView] = useState<"markers" | "heat" | "clusters">("markers");
  const [selectedOperators, setSelectedOperators] = useState([
    "VIVO", "TIM", "CLARO", "BRISANET", "ALGAR", "UNIFIQUE"
  ]);
  const [aiRecommendations, setAIRecommendations] = useState<any[]>([]);

  const toggleOperator = (operator: string) => {
    setSelectedOperators((prev) =>
      prev.includes(operator)
        ? prev.filter((o) => o !== operator)
        : [...prev, operator]
    );
  };

  return (
    <div className="min-h-screen bg-background p-3 md:p-6 grid-pattern">
      <div className="max-w-[1800px] mx-auto space-y-4 md:space-y-5">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Mobile: Stack layout, Desktop: Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_340px] xl:grid-cols-[300px_1fr_380px] gap-4 lg:gap-5">
          {/* Left Sidebar */}
          <div className="space-y-4 order-2 lg:order-1">
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
              </>
            )}
            {activeTab === "ev" && <EVStatsPanel />}
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
                showTowers={activeTab === "5g"}
                aiRecommendations={aiRecommendations}
              />
            </div>

            {(activeTab === "5g" || activeTab === "ev") && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                <DistributionChart type={activeTab} />
                <EvolutionChart type={activeTab} />
                <RegionalChart type={activeTab} />
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
            © 2025 InfraBrasil — Plataforma de Infraestrutura Nacional
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
