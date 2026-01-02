import { Radio, MapPin, Users, Gauge } from "lucide-react";
import StatCard from "./StatCard";

const StatsPanel = () => {
  return (
    <div className="space-y-3 animate-in">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Estatísticas 5G
        </h2>
      </div>

      <StatCard 
        icon={Radio}
        label="Total de Torres"
        value={48247}
        colorClass="bg-gradient-to-br from-primary to-copper"
        delay={100}
      />
      
      <StatCard 
        icon={MapPin}
        label="Municípios Cobertos"
        value={1395}
        suffix=" de 5.570"
        colorClass="bg-operator-claro"
        delay={200}
      />
      
      <StatCard 
        icon={Users}
        label="População Coberta"
        value={161.8}
        suffix="M"
        decimals={1}
        subtitle="75.8% do total"
        colorClass="bg-operator-tim"
        delay={300}
      />
      
      <StatCard 
        icon={Gauge}
        label="Velocidade Média"
        value={450}
        suffix=" Mbps"
        colorClass="bg-operator-algar"
        delay={400}
      />
    </div>
  );
};

export default StatsPanel;
