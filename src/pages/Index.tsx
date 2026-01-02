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

const Index = () => {
  const [activeTab, setActiveTab] = useState<"5g" | "ev" | "ai">("5g");
  const [activeView, setActiveView] = useState<"markers" | "heat" | "clusters">("markers");
  const [selectedOperators, setSelectedOperators] = useState([
    "VIVO", "TIM", "CLARO", "BRISANET", "ALGAR", "UNIFIQUE"
  ]);
  const [showEVStations, setShowEVStations] = useState(true);
  const [showTowers, setShowTowers] = useState(true);
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
      <div className="max-w-[1800px] mx-auto space-y-4">
        {/* Header */}
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_350px] gap-4">
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
              <div className="glass-card p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Use o painel à direita para executar análises com IA
                </p>
              </div>
            )}
          </div>

          {/* Map */}
          <div className="space-y-4">
            <div className="h-[500px] lg:h-[600px]">
              <InfrastructureMap 
                selectedOperators={selectedOperators}
                showEVStations={activeTab === "ev" || activeTab === "ai" ? showEVStations : false}
                showTowers={activeTab === "5g" || activeTab === "ai" ? showTowers : false}
                aiRecommendations={aiRecommendations}
              />
            </div>

            {/* Charts Row */}
            {(activeTab === "5g" || activeTab === "ev") && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <DistributionChart type={activeTab} />
                <EvolutionChart type={activeTab} />
                <RegionalChart type={activeTab} />
              </div>
            )}
          </div>

          {/* Right Panel - AI Analysis */}
          <div className="h-[500px] lg:h-[600px]">
            <AIAnalysisPanel onRecommendationsUpdate={setAIRecommendations} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
