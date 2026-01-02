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
    <div className="min-h-screen bg-background p-4 md:p-6 grid-pattern">
      <div className="max-w-[1800px] mx-auto space-y-5">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_380px] gap-5">
          {/* Left Sidebar */}
          <div className="space-y-4">
            {activeTab === "5g" && (
              <>
                <StatsPanel />
                <FilterPanel 
                  activeView={activeView}
                  setActiveView={setActiveView}
                  selectedOperators={selectedOperators}
                  toggleOperator={toggleOperator}
                />
              </>
            )}
            {activeTab === "ev" && <EVStatsPanel />}
            {activeTab === "ai" && (
              <AIAnalysisPanel onRecommendationsUpdate={setAIRecommendations} />
            )}
          </div>

          {/* Map */}
          <div className="space-y-5">
            <div className="h-[500px] lg:h-[600px] animate-in animate-in-delay-2">
              <InfrastructureMap 
                selectedOperators={selectedOperators}
                showEVStations={activeTab === "ev"}
                showTowers={activeTab === "5g"}
                aiRecommendations={aiRecommendations}
              />
            </div>

            {(activeTab === "5g" || activeTab === "ev") && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <DistributionChart type={activeTab} />
                <EvolutionChart type={activeTab} />
                <RegionalChart type={activeTab} />
              </div>
            )}
          </div>

          {/* Right Panel - Chat */}
          <div className="h-[500px] lg:h-[600px] animate-in animate-in-delay-3">
            <InfraChat />
          </div>
        </div>

        {/* Footer */}
        <div className="divider-gold mt-8" />
        <footer className="text-center py-4">
          <p className="text-xs text-muted-foreground">
            © 2025 InfraBrasil — Plataforma de Infraestrutura Nacional
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
