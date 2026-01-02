import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  subtitle?: string;
  colorClass?: string;
  delay?: number;
}

const StatCard = ({ icon: Icon, label, value, subtitle, colorClass = "bg-primary", delay = 0 }: StatCardProps) => {
  return (
    <div 
      className="glass-card p-4 flex items-center gap-4 hover:border-primary/50 transition-all duration-300"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`w-12 h-12 rounded-xl ${colorClass} flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-primary-foreground" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-xl font-display font-bold">{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
};

export default StatCard;
