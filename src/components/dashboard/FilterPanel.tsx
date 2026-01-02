import { Filter, MapPin, Flame, Layers } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const operators = [
  { name: "VIVO", count: "18.000", colorClass: "bg-operator-vivo" },
  { name: "TIM", count: "14.600", colorClass: "bg-operator-tim" },
  { name: "CLARO", count: "13.300", colorClass: "bg-operator-claro" },
  { name: "BRISANET", count: "1.500", colorClass: "bg-operator-brisanet" },
  { name: "ALGAR", count: "547", colorClass: "bg-operator-algar" },
  { name: "UNIFIQUE", count: "300", colorClass: "bg-operator-unifique" },
];

interface FilterPanelProps {
  activeView: "markers" | "heat" | "clusters";
  setActiveView: (view: "markers" | "heat" | "clusters") => void;
  selectedOperators: string[];
  toggleOperator: (operator: string) => void;
}

const FilterPanel = ({ 
  activeView, 
  setActiveView, 
  selectedOperators, 
  toggleOperator 
}: FilterPanelProps) => {
  return (
    <div className="glass-card p-4 md:p-0 md:bg-transparent md:backdrop-blur-none md:border-none space-y-4 md:space-y-6 animate-slide-in-left" style={{ animationDelay: "200ms" }}>
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-primary" />
        <h2 className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Filtros
        </h2>
      </div>

      {/* View Mode */}
      <div>
        <p className="text-[10px] md:text-xs text-muted-foreground mb-2 md:mb-3 uppercase tracking-wider">
          Modo de Visualização
        </p>
        <div className="flex gap-1.5 md:gap-2">
          <ViewButton 
            active={activeView === "markers"}
            onClick={() => setActiveView("markers")}
            icon={<MapPin className="w-3 h-3 md:w-4 md:h-4" />}
            label="Marcadores"
          />
          <ViewButton 
            active={activeView === "heat"}
            onClick={() => setActiveView("heat")}
            icon={<Flame className="w-3 h-3 md:w-4 md:h-4" />}
            label="Calor"
          />
          <ViewButton 
            active={activeView === "clusters"}
            onClick={() => setActiveView("clusters")}
            icon={<Layers className="w-3 h-3 md:w-4 md:h-4" />}
            label="Clusters"
          />
        </div>
      </div>

      {/* Operators */}
      <div>
        <p className="text-[10px] md:text-xs text-muted-foreground mb-2 md:mb-3 uppercase tracking-wider">
          Operadoras
        </p>
        <div className="grid grid-cols-2 md:grid-cols-1 gap-1.5 md:gap-2">
          {operators.map((op) => (
            <label 
              key={op.name}
              className="flex items-center justify-between p-1.5 md:p-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 md:gap-3">
                <Checkbox 
                  checked={selectedOperators.includes(op.name)}
                  onCheckedChange={() => toggleOperator(op.name)}
                  className="h-4 w-4"
                />
                <span className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-sm ${op.colorClass}`} />
                <span className="text-xs md:text-sm font-medium">{op.name}</span>
              </div>
              <span className="text-[10px] md:text-sm text-muted-foreground hidden md:inline">{op.count}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

interface ViewButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const ViewButton = ({ active, onClick, icon, label }: ViewButtonProps) => (
  <button
    onClick={onClick}
    className={`flex-1 flex flex-col items-center gap-0.5 md:gap-1 py-2 md:py-3 px-1.5 md:px-2 rounded-lg border transition-all duration-300 ${
      active 
        ? "bg-primary text-primary-foreground border-primary" 
        : "bg-secondary/50 border-border hover:border-primary/50"
    }`}
  >
    {icon}
    <span className="text-[10px] md:text-xs">{label}</span>
  </button>
);

export default FilterPanel;
