import { Signal, Zap, Users, Brain, MapPin } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";

interface HeaderProps {
  activeTab: "5g" | "ev" | "ai";
  setActiveTab: (tab: "5g" | "ev" | "ai") => void;
}

const Header = ({ activeTab, setActiveTab }: HeaderProps) => {
  return (
    <header className="glass-card px-6 py-5 animate-in">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl" />
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-dark via-primary to-gold-light flex items-center justify-center relative z-10 shadow-lg">
              <MapPin className="w-7 h-7 text-primary-foreground" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold tracking-tight">
              <span className="gradient-text-gold">InfraBrasil</span>{" "}
              <span className="text-muted-foreground text-base font-sans font-normal">2025</span>
            </h1>
            <p className="text-xs text-muted-foreground tracking-wide">
              Plataforma Integrada de Infraestrutura Nacional
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-secondary/50 rounded-xl p-1.5 border border-border/50 shadow-inner">
          <TabButton 
            active={activeTab === "5g"}
            onClick={() => setActiveTab("5g")}
            icon={<Signal className="w-4 h-4" />}
            label="Torres 5G"
          />
          <TabButton 
            active={activeTab === "ev"}
            onClick={() => setActiveTab("ev")}
            icon={<Zap className="w-4 h-4" />}
            label="Abastecimento Elétrico"
          />
          <TabButton 
            active={activeTab === "ai"}
            onClick={() => setActiveTab("ai")}
            icon={<Brain className="w-4 h-4" />}
            label="Análise IA"
          />
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-3">
          <AnimatedQuickStat icon={<Signal className="w-4 h-4" />} value={48247} label="Torres" delay={100} />
          <AnimatedQuickStat icon={<Zap className="w-4 h-4" />} value={3850} label="Estações" delay={200} />
          <AnimatedQuickStat icon={<Users className="w-4 h-4" />} value={75.8} label="Cobertura" suffix="%" decimals={1} delay={300} />
        </div>
      </div>
    </header>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const TabButton = ({ active, onClick, icon, label }: TabButtonProps) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-300 text-sm font-medium ${
      active 
        ? "bg-primary text-primary-foreground shadow-lg" 
        : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
    }`}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);

interface AnimatedQuickStatProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  suffix?: string;
  decimals?: number;
  delay?: number;
}

const AnimatedQuickStat = ({ icon, value, label, suffix = "", decimals = 0, delay = 0 }: AnimatedQuickStatProps) => {
  const { formattedValue } = useCountUp({
    end: value,
    duration: 2000,
    delay: delay + 500,
    decimals,
    suffix
  });

  return (
    <div className="flex items-center gap-2 px-3 py-2.5 bg-secondary/40 rounded-xl border border-border/30 hover:border-primary/30 transition-all duration-300">
      <div className="text-primary">{icon}</div>
      <div className="text-right">
        <p className="text-sm font-semibold stat-value">{formattedValue}</p>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
};

export default Header;
