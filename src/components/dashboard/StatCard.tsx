import { LucideIcon } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  subtitle?: string;
  colorClass?: string;
  delay?: number;
}

const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  suffix = "",
  prefix = "",
  decimals = 0,
  subtitle, 
  colorClass = "bg-primary", 
  delay = 0 
}: StatCardProps) => {
  const { formattedValue } = useCountUp({
    end: value,
    duration: 2000,
    delay: delay + 300,
    decimals,
    suffix,
    prefix
  });

  return (
    <div 
      className="glass-card-hover p-4 flex items-center gap-4 animate-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`w-12 h-12 rounded-xl ${colorClass} flex items-center justify-center shadow-lg`}>
        <Icon className="w-6 h-6 text-primary-foreground" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
        <p className="text-2xl font-display font-bold stat-value text-foreground">{formattedValue}</p>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
};

export default StatCard;
