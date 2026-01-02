import { Zap, MapPin, Car, TrendingUp, Battery, Clock } from "lucide-react";
import StatCard from "./StatCard";

const EVStatsPanel = () => {
  return (
    <div className="space-y-4 animate-slide-in-left">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full bg-ev-eletroposto animate-pulse" />
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Infraestrutura EV
        </h2>
      </div>

      <StatCard 
        icon={Zap}
        label="Total de Estações"
        value="3.850"
        colorClass="bg-gradient-to-br from-ev-eletroposto to-primary"
        delay={100}
      />
      
      <StatCard 
        icon={Battery}
        label="Carregadores Ativos"
        value="15.400"
        colorClass="bg-ev-shell"
        delay={200}
      />
      
      <StatCard 
        icon={MapPin}
        label="Estados Cobertos"
        value="24 / 27"
        colorClass="bg-ev-tesla"
        delay={300}
      />
      
      <StatCard 
        icon={Car}
        label="Veículos Registrados"
        value="185.000"
        colorClass="bg-ev-other"
        delay={400}
      />

      <StatCard 
        icon={TrendingUp}
        label="Crescimento 2025"
        value="+42%"
        colorClass="bg-accent"
        delay={500}
      />

      <StatCard 
        icon={Clock}
        label="Tempo Médio Recarga"
        value="45 min"
        colorClass="bg-operator-tim"
        delay={600}
      />
    </div>
  );
};

export default EVStatsPanel;
