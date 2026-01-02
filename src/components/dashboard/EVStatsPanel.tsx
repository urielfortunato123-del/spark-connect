import { Zap, MapPin, Car, TrendingUp, Battery, Clock } from "lucide-react";
import StatCard from "./StatCard";

const EVStatsPanel = () => {
  return (
    <div className="space-y-3 animate-in">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-1.5 rounded-full bg-ev-green" />
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Infraestrutura EV
        </h2>
      </div>

      <StatCard 
        icon={Zap}
        label="Total de Estações"
        value={3850}
        colorClass="bg-gradient-to-br from-ev-green to-primary"
        delay={100}
      />
      
      <StatCard 
        icon={Battery}
        label="Carregadores Ativos"
        value={15400}
        colorClass="bg-ev-shell"
        delay={200}
      />
      
      <StatCard 
        icon={MapPin}
        label="Estados Cobertos"
        value={24}
        suffix=" de 27"
        colorClass="bg-ev-tesla"
        delay={300}
      />
      
      <StatCard 
        icon={Car}
        label="Veículos Registrados"
        value={185000}
        colorClass="bg-primary"
        delay={400}
      />

      <StatCard 
        icon={TrendingUp}
        label="Crescimento 2025"
        value={42}
        prefix="+"
        suffix="%"
        colorClass="bg-accent"
        delay={500}
      />

      <StatCard 
        icon={Clock}
        label="Tempo Médio Recarga"
        value={45}
        suffix=" min"
        colorClass="bg-operator-tim"
        delay={600}
      />
    </div>
  );
};

export default EVStatsPanel;
