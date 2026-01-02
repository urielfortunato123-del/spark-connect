import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { TrendingUp } from "lucide-react";
import { historicalData, totalERBStats } from "@/data/erbData";

// ERB evolution data - monthly 2025 (based on official growth rates)
const data5G = [
  { month: "Jan", value: 93835 + Math.round((109100 - 93835) * 0.08) },
  { month: "Fev", value: 93835 + Math.round((109100 - 93835) * 0.16) },
  { month: "Mar", value: 93835 + Math.round((109100 - 93835) * 0.25) },
  { month: "Abr", value: 93835 + Math.round((109100 - 93835) * 0.33) },
  { month: "Mai", value: 93835 + Math.round((109100 - 93835) * 0.42) },
  { month: "Jun", value: 93835 + Math.round((109100 - 93835) * 0.50) },
  { month: "Jul", value: 93835 + Math.round((109100 - 93835) * 0.58) },
  { month: "Ago", value: 93835 + Math.round((109100 - 93835) * 0.67) },
  { month: "Set", value: 93835 + Math.round((109100 - 93835) * 0.75) },
  { month: "Out", value: 108346 },
  { month: "Nov", value: 109100 },
];

// 5G evolution - monthly 2025
const data5GOnly = [
  { month: "Jan", value: 37991 + Math.round((51447 - 37991) * 0.08) },
  { month: "Fev", value: 37991 + Math.round((51447 - 37991) * 0.16) },
  { month: "Mar", value: 37991 + Math.round((51447 - 37991) * 0.25) },
  { month: "Abr", value: 37991 + Math.round((51447 - 37991) * 0.33) },
  { month: "Mai", value: 37991 + Math.round((51447 - 37991) * 0.42) },
  { month: "Jun", value: 37991 + Math.round((51447 - 37991) * 0.50) },
  { month: "Jul", value: 37991 + Math.round((51447 - 37991) * 0.58) },
  { month: "Ago", value: 37991 + Math.round((51447 - 37991) * 0.67) },
  { month: "Set", value: 37991 + Math.round((51447 - 37991) * 0.75) },
  { month: "Out", value: 50643 },
  { month: "Nov", value: 51447 },
];

const dataEV = [
  { month: "Jan", value: 35 },
  { month: "Fev", value: 37 },
  { month: "Mar", value: 39 },
  { month: "Abr", value: 41 },
  { month: "Mai", value: 43 },
  { month: "Jun", value: 45 },
  { month: "Jul", value: 46 },
  { month: "Ago", value: 47 },
  { month: "Set", value: 48 },
  { month: "Out", value: 49 },
  { month: "Nov", value: 50 },
];

interface EvolutionChartProps {
  type: "5g" | "ev";
}

const EvolutionChart = ({ type }: EvolutionChartProps) => {
  const data = type === "5g" ? data5GOnly : dataEV;
  const title = type === "5g" ? "Evolução 5G 2025" : "Evolução Estações EV 2025";
  const color = type === "5g" ? "#00d4ff" : "hsl(145, 60%, 45%)";

  return (
    <div className="glass-card-hover p-5 animate-scale-in" style={{ animationDelay: "400ms" }}>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-display font-semibold">{title}</h3>
      </div>
      
      <div className="h-48 min-h-[192px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(220, 15%, 18%)" 
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
                backgroundColor: "hsl(220, 20%, 10%)",
                border: "1px solid hsl(220, 15%, 20%)",
                borderRadius: "8px",
                color: "hsl(40, 20%, 95%)",
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
