import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { PieChartIcon } from "lucide-react";
import { operatorData } from "@/data/erbData";
import { evStationsData } from "@/data/evStations";
import { useMemo } from "react";

// Data from Anatel Nov/2025
const data5G = operatorData.map((op) => ({
  name: op.operator,
  value: op.erbs5G,
  color: op.color,
  total: op.total,
}));

// Calculate EV data from actual stations
const getEVData = () => {
  const counts: Record<string, number> = {};
  evStationsData.forEach(station => {
    const key = station.operator.includes("Shell") ? "Shell Recharge" : 
                station.operator.includes("Raizen") ? "Raizen" :
                station.operator.includes("Tesla") ? "Tesla" :
                station.operator.includes("Ipiranga") ? "Ipiranga" :
                station.operator.includes("EDP") ? "EDP" :
                station.operator.includes("Petrobras") ? "Petrobras" : "Outros";
    counts[key] = (counts[key] || 0) + 1;
  });
  
  const colors: Record<string, string> = {
    "Shell Recharge": "#ffcc00",
    "Tesla": "#ea384c",
    "Raizen": "#ff6600",
    "Ipiranga": "#ffd700",
    "EDP": "#00a3e0",
    "Petrobras": "#00a651",
    "Outros": "#22c55e",
  };

  return Object.entries(counts).map(([name, value]) => ({
    name,
    value,
    color: colors[name] || "#22c55e",
  }));
};

interface DistributionChartProps {
  type: "5g" | "ev";
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <span 
            className="w-3 h-3 rounded-sm" 
            style={{ backgroundColor: data.color }}
          />
          <span className="font-medium text-sm">{data.name}</span>
        </div>
        <p className="text-lg font-bold text-foreground">
          {data.value.toLocaleString("pt-BR")}
        </p>
        {data.total && (
          <p className="text-xs text-muted-foreground">
            Total ERBs: {data.total.toLocaleString("pt-BR")}
          </p>
        )}
      </div>
    );
  }
  return null;
};

const DistributionChart = ({ type }: DistributionChartProps) => {
  const dataEV = useMemo(() => getEVData(), []);
  const data = type === "5g" ? data5G : dataEV;
  const title = type === "5g" ? "Distribuição por Operadora" : "Distribuição por Rede";
  const total = data.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="glass-card-hover p-3 md:p-5 transition-all duration-300 hover:shadow-gold-glow">
      <div className="flex items-center gap-2 mb-3 md:mb-4">
        <PieChartIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
        <h3 className="text-xs md:text-sm font-display font-semibold">{title}</h3>
      </div>
      
      <div className="h-36 md:h-48 min-h-[144px] md:min-h-[192px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={55}
              paddingAngle={2}
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  className="transition-all duration-200 hover:opacity-80"
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {/* Center label */}
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-foreground"
            >
              <tspan x="50%" dy="-0.3em" fontSize="14" fontWeight="600">
                {total.toLocaleString("pt-BR")}
              </tspan>
              <tspan x="50%" dy="1.4em" fontSize="9" className="fill-muted-foreground">
                {type === "5g" ? "ERBs 5G" : "Estações"}
              </tspan>
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-1.5 md:gap-2 mt-3 md:mt-4">
        {data.slice(0, 6).map((item) => (
          <div key={item.name} className="flex items-center gap-1 md:gap-1.5 group cursor-pointer">
            <span 
              className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-sm flex-shrink-0 transition-transform group-hover:scale-125" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-[10px] md:text-xs text-muted-foreground truncate group-hover:text-foreground transition-colors">
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DistributionChart;
