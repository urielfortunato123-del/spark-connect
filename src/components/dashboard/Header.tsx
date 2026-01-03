import { Signal, Zap, Users, Brain, MapPin, AlertTriangle } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";
import { ThemeToggle } from "@/components/ThemeToggle";

interface HeaderProps {
  activeTab: "5g" | "ev" | "vazios" | "ai";
  setActiveTab: (tab: "5g" | "ev" | "vazios" | "ai") => void;
}

const Header = ({ activeTab, setActiveTab }: HeaderProps) => {
  return (
    <header className="glass-card px-4 md:px-6 py-4 md:py-5">
      <div className="flex flex-col gap-4">
        {/* Top Row: Logo + Theme Toggle + Quick Stats */}
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 md:gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-xl md:rounded-2xl blur-xl" />
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-gold-dark via-primary to-gold-light flex items-center justify-center relative z-10 shadow-lg">
                <MapPin className="w-5 h-5 md:w-7 md:h-7 text-primary-foreground" />
              </div>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-display font-bold tracking-tight">
                <span className="gradient-text-gold">InfraBrasil</span>{" "}
                <span className="text-muted-foreground text-sm md:text-base font-sans font-normal">2025</span>
              </h1>
              <p className="text-[10px] md:text-xs text-muted-foreground tracking-wide hidden sm:block">
                Plataforma Integrada de Infraestrutura Nacional
              </p>
            </div>
          </div>

          {/* Quick Stats + Theme Toggle */}
          <div className="flex items-center gap-2 lg:gap-3">
            {/* Quick Stats - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-2 lg:gap-3">
              <AnimatedQuickStat icon={<Signal className="w-4 h-4" />} value={48247} label="Torres" delay={100} />
              <AnimatedQuickStat icon={<Zap className="w-4 h-4" />} value={3850} label="Estações" delay={200} />
              <AnimatedQuickStat icon={<Users className="w-4 h-4" />} value={75.8} label="Cobertura" suffix="%" decimals={1} delay={300} />
            </div>
            
            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>

        {/* Navigation Tabs - Full width on mobile */}
        <div className="flex bg-secondary/50 rounded-xl p-1 md:p-1.5 border border-border/50 shadow-inner overflow-x-auto">
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
            label="Eletropostos"
          />
          <TabButton 
            active={activeTab === "vazios"}
            onClick={() => setActiveTab("vazios")}
            icon={<AlertTriangle className="w-4 h-4" />}
            label="Vazios"
          />
          <TabButton 
            active={activeTab === "ai"}
            onClick={() => setActiveTab("ai")}
            icon={<Brain className="w-4 h-4" />}
            label="Análise IA"
          />
        </div>

        {/* Mobile Quick Stats */}
        <div className="flex md:hidden items-center justify-between gap-2 overflow-x-auto">
          <AnimatedQuickStat icon={<Signal className="w-3 h-3" />} value={48247} label="Torres" delay={100} />
          <AnimatedQuickStat icon={<Zap className="w-3 h-3" />} value={3850} label="Estações" delay={200} />
          <AnimatedQuickStat icon={<Users className="w-3 h-3" />} value={75.8} label="%" suffix="%" decimals={1} delay={300} />
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
    className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-lg transition-all duration-300 text-xs md:text-sm font-medium whitespace-nowrap ${
      active 
        ? "bg-primary text-primary-foreground shadow-lg" 
        : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
    }`}
  >
    {icon}
    <span>{label}</span>
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
    <div className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 md:py-2.5 bg-secondary/40 rounded-lg md:rounded-xl border border-border/30 hover:border-primary/30 transition-all duration-300">
      <div className="text-primary">{icon}</div>
      <div className="text-right">
        <p className="text-xs md:text-sm font-semibold stat-value">{formattedValue}</p>
        <p className="text-[8px] md:text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
};

export default Header;
