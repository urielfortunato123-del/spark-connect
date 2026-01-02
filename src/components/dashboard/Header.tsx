import { Signal, Building2, Users } from "lucide-react";

const Header = () => {
  return (
    <header className="glass-card px-6 py-4 flex items-center justify-between animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Signal className="w-10 h-10 text-primary animate-pulse-glow" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight">
            Mapa 5G Brasil <span className="gradient-text">2025</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            48.247 Torres | Dados Oficiais ANATEL
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <HeaderStat 
          icon={<Signal className="w-5 h-5" />}
          label="ANTENAS ATIVAS"
          value="48.247"
        />
        <HeaderStat 
          icon={<Building2 className="w-5 h-5" />}
          label="MUNICÍPIOS"
          value="1.395"
        />
        <HeaderStat 
          icon={<Users className="w-5 h-5" />}
          label="COBERTURA"
          value="75.8%"
        />
      </div>
    </header>
  );
};

interface HeaderStatProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const HeaderStat = ({ icon, label, value }: HeaderStatProps) => (
  <div className="flex items-center gap-3 px-5 py-2 bg-secondary/50 rounded-lg border border-border/50">
    <div className="text-primary">{icon}</div>
    <div>
      <p className="text-[10px] text-muted-foreground tracking-wider">{label}</p>
      <p className="text-lg font-display font-semibold">{value}</p>
    </div>
  </div>
);

export default Header;
