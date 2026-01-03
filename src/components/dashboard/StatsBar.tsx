import { BarChart3, Zap, Users, Radio } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";
import { totalERBStats } from "@/data/erbData";
import { ThemeToggle } from "@/components/ThemeToggle";

interface StatItemProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  suffix?: string;
  decimals?: number;
  delay?: number;
}

const StatItem = ({ icon, value, label, suffix = "", decimals = 0, delay = 0 }: StatItemProps) => {
  const { formattedValue } = useCountUp({
    end: value,
    duration: 2000,
    delay: delay + 300,
    decimals,
    suffix,
  });

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-card/50 backdrop-blur-sm rounded-xl border border-border/30">
      <div className="text-primary">{icon}</div>
      <div className="flex flex-col">
        <span className="text-lg font-bold text-foreground leading-tight">{formattedValue}</span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
    </div>
  );
};

const StatsBar = () => {
  const coveragePercent = ((totalERBStats.erbs4G + totalERBStats.erbs5G) / totalERBStats.total) * 100;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <StatItem
        icon={<BarChart3 className="w-5 h-5" />}
        value={totalERBStats.total}
        label="Torres"
        delay={0}
      />
      <StatItem
        icon={<Zap className="w-5 h-5" />}
        value={totalERBStats.erbs5G}
        label="Estações 5G"
        delay={100}
      />
      <StatItem
        icon={<Users className="w-5 h-5" />}
        value={coveragePercent}
        label="Cobertura"
        suffix="%"
        decimals={1}
        delay={200}
      />
      <ThemeToggle />
    </div>
  );
};

export default StatsBar;
