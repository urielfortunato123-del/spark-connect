import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { TrendingUp } from "lucide-react";
import { totalERBStats } from "@/data/erbData";

// ERB evolution data - monthly 2025 (based on official growth rates)
const data5GOnly = [
  { month: "Jan", value: 37991 + Math.round((51447 - 37991) * 0.08), label: "Janeiro" },
  { month: "Fev", value: 37991 + Math.round((51447 - 37991) * 0.16), label: "Fevereiro" },
  { month: "Mar", value: 37991 + Math.round((51447 - 37991) * 0.25), label: "Março" },
  { month: "Abr", value: 37991 + Math.round((51447 - 37991) * 0.33), label: "Abril" },
  { month: "Mai", value: 37991 + Math.round((51447 - 37991) * 0.42), label: "Maio" },
  { month: "Jun", value: 37991 + Math.round((51447 - 37991) * 0.50), label: "Junho" },
  { month: "Jul", value: 37991 + Math.round((51447 - 37991) * 0.58), label: "Julho" },
  { month: "Ago", value: 37991 + Math.round((51447 - 37991) * 0.67), label: "Agosto" },
  { month: "Set", value: 37991 + Math.round((51447 - 37991) * 0.75), label: "Setembro" },
  { month: "Out", value: 50643, label: "Outubro" },
  { month: "Nov", value: 51447, label: "Novembro" },
];

const dataEV = [
  { month: "Jan", value: 35, label: "Janeiro" },
  { month: "Fev", value: 37, label: "Fevereiro" },
  { month: "Mar", value: 39, label: "Março" },
  { month: "Abr", value: 41, label: "Abril" },
  { month: "Mai", value: 43, label: "Maio" },
  { month: "Jun", value: 45, label: "Junho" },
  { month: "Jul", value: 46, label: "Julho" },
  { month: "Ago", value: 47, label: "Agosto" },
  { month: "Set", value: 48, label: "Setembro" },
  { month: "Out", value: 49, label: "Outubro" },
  { month: "Nov", value: 50, label: "Novembro" },
];

interface EvolutionChartProps {
  type: "5g" | "ev";
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-xl">
        <p className="text-xs text-muted-foreground mb-1">{data.label} 2025</p>
        <p className="text-lg font-bold text-foreground">
          {payload[0].value.toLocaleString("pt-BR")}
        </p>
        <p className="text-xs text-primary">
          {payload[0].dataKey === "value" ? "ERBs 5G" : "Estações"}
        </p>
      </div>
    );
  }
  return null;
};

const EvolutionChart = ({ type }: EvolutionChartProps) => {
  const data = type === "5g" ? data5GOnly : dataEV;
  const title = type === "5g" ? "Evolução 5G 2025" : "Evolução Estações EV 2025";
  const color = type === "5g" ? "#00d4ff" : "hsl(145, 60%, 45%)";
  const gradientId = type === "5g" ? "gradient5g" : "gradientEV";

  // Calculate growth
  const firstValue = data[0].value;
  const lastValue = data[data.length - 1].value;
  const growth = ((lastValue - firstValue) / firstValue * 100).toFixed(1);

  return (
    <div className="glass-card-hover p-3 md:p-5 transition-all duration-300 hover:shadow-gold-glow">
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
          <h3 className="text-xs md:text-sm font-display font-semibold">{title}</h3>
        </div>
        <span className="text-[10px] md:text-xs text-green-500 font-medium bg-green-500/10 px-1.5 py-0.5 rounded">
          +{growth}%
        </span>
      </div>
      
      <div className="h-36 md:h-48 min-h-[144px] md:min-h-[192px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(220, 15%, 18%)" 
              vertical={false}
            />
            <XAxis 
              dataKey="month" 
              stroke="hsl(215, 20%, 60%)"
              fontSize={9}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis 
              stroke="hsl(215, 20%, 60%)"
              fontSize={9}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => type === "5g" ? `${value / 1000}k` : `${value}`}
              width={30}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              animationBegin={0}
              animationDuration={1000}
              animationEasing="ease-out"
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, strokeWidth: 0, r: 2 }}
              activeDot={{ r: 5, fill: color, stroke: "#fff", strokeWidth: 2 }}
              animationBegin={0}
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EvolutionChart;
