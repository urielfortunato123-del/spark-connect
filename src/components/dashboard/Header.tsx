import { Signal, Building2, Users, Zap, Car, Brain } from "lucide-react";

interface HeaderProps {
  activeTab: "5g" | "ev" | "ai";
  setActiveTab: (tab: "5g" | "ev" | "ai") => void;
}

const Header = ({ activeTab, setActiveTab }: HeaderProps) => {
  return (
    <header className="glass-card px-6 py-4 animate-fade-in">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse-glow" />
            <Signal className="w-12 h-12 text-primary relative z-10" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold tracking-tight">
              <span className="gradient-text-cyber">InfraBrasil</span>{" "}
              <span className="text-muted-foreground text-lg">2025</span>
            </h1>
            <p className="text-xs text-muted-foreground tracking-widest uppercase">
              Sistema Integrado de Infraestrutura Inteligente
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-secondary/50 rounded-xl p-1 border border-border/50">
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
            label="Estações EV"
          />
          <TabButton 
            active={activeTab === "ai"}
            onClick={() => setActiveTab("ai")}
            icon={<Brain className="w-4 h-4" />}
            label="Análise IA"
          />
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-4">
          <QuickStat icon={<Signal className="w-4 h-4" />} value="48.247" label="Torres" />
          <QuickStat icon={<Zap className="w-4 h-4" />} value="3.850" label="Estações" />
          <QuickStat icon={<Users className="w-4 h-4" />} value="75.8%" label="Cobertura" />
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
    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 font-display text-sm ${
      active 
        ? "bg-primary text-primary-foreground neon-glow" 
        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
    }`}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);

interface QuickStatProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

const QuickStat = ({ icon, value, label }: QuickStatProps) => (
  <div className="flex items-center gap-2 px-3 py-2 bg-secondary/30 rounded-lg border border-border/30">
    <div className="text-primary">{icon}</div>
    <div className="text-right">
      <p className="text-sm font-display font-bold">{value}</p>
      <p className="text-[10px] text-muted-foreground uppercase">{label}</p>
    </div>
  </div>
);

export default Header;
