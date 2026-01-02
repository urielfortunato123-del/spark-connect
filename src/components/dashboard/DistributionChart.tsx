import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";

const data5G = [
  { name: "VIVO", value: 18000, color: "hsl(330, 100%, 65%)" },
  { name: "TIM", value: 14600, color: "hsl(195, 100%, 50%)" },
  { name: "CLARO", value: 13300, color: "hsl(25, 100%, 55%)" },
  { name: "BRISANET", value: 1500, color: "hsl(45, 100%, 50%)" },
  { name: "ALGAR", value: 547, color: "hsl(145, 80%, 45%)" },
  { name: "UNIFIQUE", value: 300, color: "hsl(280, 80%, 60%)" },
];

const dataEV = [
  { name: "Eletroposto", value: 1500, color: "hsl(145, 80%, 50%)" },
  { name: "Tesla", value: 850, color: "hsl(0, 85%, 55%)" },
  { name: "Shell Recharge", value: 1200, color: "hsl(45, 100%, 50%)" },
  { name: "Outros", value: 300, color: "hsl(200, 80%, 55%)" },
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
      
      <div className="h-48">
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
