import { Radio, MapPin, Users, Gauge } from "lucide-react";
import StatCard from "./StatCard";

const StatsPanel = () => {
  return (
    <div className="space-y-4 animate-slide-in-left">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Estatísticas Gerais
        </h2>
      </div>

      <StatCard 
        icon={Radio}
        label="Total de Torres"
        value="48.247"
        colorClass="bg-gradient-to-br from-primary to-accent"
        delay={100}
      />
      
      <StatCard 
        icon={MapPin}
        label="Municípios Cobertos"
        value="1.395 / 5.570"
        colorClass="bg-operator-claro"
        delay={200}
      />
      
      <StatCard 
        icon={Users}
        label="População Coberta"
        value="161.8M (75.8%)"
        colorClass="bg-operator-tim"
        delay={300}
      />
      
      <StatCard 
        icon={Gauge}
        label="Velocidade Média"
        value="450 Mbps"
        colorClass="bg-operator-algar"
        delay={400}
      />
    </div>
  );
};

export default StatsPanel;
