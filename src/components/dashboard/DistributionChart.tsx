import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { PieChartIcon } from "lucide-react";
import { operatorData, totalERBStats } from "@/data/erbData";

// Data from Anatel Nov/2025
const data5G = operatorData.map((op) => ({
  name: op.operator,
  value: op.erbs5G,
  color: op.color,
}));

const dataEV = [
  { name: "Shell Recharge", value: 15, color: "#ffcc00" },
  { name: "Tesla", value: 4, color: "#ea384c" },
  { name: "Raizen", value: 8, color: "#ff6600" },
  { name: "Ipiranga", value: 6, color: "#ffd700" },
  { name: "EDP", value: 10, color: "#00a3e0" },
  { name: "Outros", value: 7, color: "#22c55e" },
];

interface DistributionChartProps {
  type: "5g" | "ev";
}

const DistributionChart = ({ type }: DistributionChartProps) => {
  const data = type === "5g" ? data5G : dataEV;
  const title = type === "5g" ? "Distribuição por Operadora" : "Distribuição por Rede";

  return (
    <div className="glass-card-hover p-5 animate-scale-in" style={{ animationDelay: "300ms" }}>
      <div className="flex items-center gap-2 mb-4">
        <PieChartIcon className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-display font-semibold">{title}</h3>
      </div>
      
      <div className="h-48 min-h-[192px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: "hsl(220, 20%, 10%)",
                border: "1px solid hsl(220, 15%, 20%)",
                borderRadius: "8px",
                color: "hsl(40, 20%, 95%)",
              }}
              formatter={(value: number) => [`${value.toLocaleString()}`, ""]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <span 
              className="w-2.5 h-2.5 rounded-sm" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-muted-foreground">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DistributionChart;
