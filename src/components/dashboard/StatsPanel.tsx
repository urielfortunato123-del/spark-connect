import { Radio, MapPin, Users, Gauge } from "lucide-react";
import StatCard from "./StatCard";
import { totalERBStats } from "@/data/erbData";

const StatsPanel = () => {
  return (
    <div className="space-y-3 animate-in">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Estatísticas ERBs
        </h2>
      </div>

      <StatCard 
        icon={Radio}
        label="Total de ERBs"
        value={totalERBStats.total}
        colorClass="bg-gradient-to-br from-primary to-copper"
        delay={100}
      />
      
      <StatCard 
        icon={Radio}
        label="Torres 5G"
        value={totalERBStats.erbs5G}
        suffix={` (${((totalERBStats.erbs5G / totalERBStats.total) * 100).toFixed(1)}%)`}
        colorClass="bg-operator-tim"
        delay={200}
      />
      
      <StatCard 
        icon={MapPin}
        label="Cobertura 4G"
        value={totalERBStats.erbs4G}
        suffix={` (${((totalERBStats.erbs4G / totalERBStats.total) * 100).toFixed(1)}%)`}
        colorClass="bg-operator-claro"
        delay={300}
      />
      
      <StatCard 
        icon={Gauge}
        label="Novas ERBs/mês"
        value={totalERBStats.monthlyGrowth}
        subtitle={`Atualizado: ${totalERBStats.lastUpdate}`}
        colorClass="bg-operator-algar"
        delay={400}
      />
    </div>
  );
};

export default StatsPanel;
