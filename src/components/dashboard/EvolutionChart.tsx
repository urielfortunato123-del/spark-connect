import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

const data5G = [
  { month: "Jan", value: 32000 },
  { month: "Fev", value: 34500 },
  { month: "Mar", value: 37000 },
  { month: "Abr", value: 39500 },
  { month: "Mai", value: 41000 },
  { month: "Jun", value: 42500 },
  { month: "Jul", value: 44000 },
  { month: "Ago", value: 45200 },
  { month: "Set", value: 46100 },
  { month: "Out", value: 47000 },
  { month: "Nov", value: 47800 },
  { month: "Dez", value: 48247 },
];

const dataEV = [
  { month: "Jan", value: 2100 },
  { month: "Fev", value: 2300 },
  { month: "Mar", value: 2550 },
  { month: "Abr", value: 2800 },
  { month: "Mai", value: 3000 },
  { month: "Jun", value: 3200 },
  { month: "Jul", value: 3350 },
  { month: "Ago", value: 3500 },
  { month: "Set", value: 3600 },
  { month: "Out", value: 3700 },
  { month: "Nov", value: 3780 },
  { month: "Dez", value: 3850 },
];

interface EvolutionChartProps {
  type: "5g" | "ev";
}

const EvolutionChart = ({ type }: EvolutionChartProps) => {
  const data = type === "5g" ? data5G : dataEV;
  const title = type === "5g" ? "Evolução Torres 2025" : "Evolução Estações 2025";
  const color = type === "5g" ? "hsl(180, 100%, 50%)" : "hsl(145, 80%, 50%)";

  return (
    <div className="glass-card-hover p-5 animate-scale-in" style={{ animationDelay: "400ms" }}>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-display font-semibold">{title}</h3>
      </div>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(220, 25%, 18%)" 
              vertical={false}
            />
            <XAxis 
              dataKey="month" 
              stroke="hsl(215, 20%, 60%)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="hsl(215, 20%, 60%)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value / 1000}k`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: "hsl(220, 25%, 10%)",
                border: "1px solid hsl(220, 25%, 20%)",
                borderRadius: "8px",
                color: "hsl(210, 40%, 98%)",
              }}
              formatter={(value: number) => [`${value.toLocaleString()}`, ""]}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, fill: color }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EvolutionChart;
