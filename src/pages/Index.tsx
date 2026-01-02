import { useState } from "react";
import Header from "@/components/dashboard/Header";
import StatsPanel from "@/components/dashboard/StatsPanel";
import FilterPanel from "@/components/dashboard/FilterPanel";
import BrazilMap from "@/components/dashboard/BrazilMap";
import DistributionChart from "@/components/dashboard/DistributionChart";
import EvolutionChart from "@/components/dashboard/EvolutionChart";
import RegionalChart from "@/components/dashboard/RegionalChart";

const Index = () => {
  const [activeView, setActiveView] = useState<"markers" | "heat" | "clusters">("markers");
  const [selectedOperators, setSelectedOperators] = useState([
    "VIVO", "TIM", "CLARO", "BRISANET", "ALGAR", "UNIFIQUE"
  ]);

  const toggleOperator = (operator: string) => {
    setSelectedOperators((prev) =>
      prev.includes(operator)
        ? prev.filter((o) => o !== operator)
        : [...prev, operator]
    );
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-[1600px] mx-auto space-y-4">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
          {/* Left Sidebar */}
          <div className="space-y-4">
            <StatsPanel />
            <FilterPanel 
              activeView={activeView}
              setActiveView={setActiveView}
              selectedOperators={selectedOperators}
              toggleOperator={toggleOperator}
            />
          </div>

          {/* Map and Charts */}
          <div className="space-y-4">
            {/* Map */}
            <div className="h-[450px] lg:h-[500px]">
              <BrazilMap selectedOperators={selectedOperators} />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DistributionChart />
              <EvolutionChart />
              <RegionalChart />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
