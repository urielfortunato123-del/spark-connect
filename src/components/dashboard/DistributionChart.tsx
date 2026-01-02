import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";

const data = [
  { name: "VIVO", value: 18000, color: "hsl(330, 100%, 71%)" },
  { name: "TIM", value: 14600, color: "hsl(199, 89%, 48%)" },
  { name: "CLARO", value: 13300, color: "hsl(15, 100%, 55%)" },
  { name: "BRISANET", value: 1500, color: "hsl(45, 100%, 51%)" },
  { name: "ALGAR", value: 547, color: "hsl(142, 76%, 45%)" },
  { name: "UNIFIQUE", value: 300, color: "hsl(280, 80%, 65%)" },
];

const DistributionChart = () => {
  return (
    <div className="glass-card p-5 animate-scale-in" style={{ animationDelay: "300ms" }}>
      <div className="flex items-center gap-2 mb-4">
        <PieChartIcon className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold">Distribuição por Operadora</h3>
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
                backgroundColor: "hsl(222, 47%, 11%)",
                border: "1px solid hsl(217, 33%, 20%)",
                borderRadius: "8px",
                color: "hsl(210, 40%, 98%)",
              }}
              formatter={(value: number) => [`${value.toLocaleString()} torres`, ""]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4">
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
