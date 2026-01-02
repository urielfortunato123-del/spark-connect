import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

const data = [
  { month: "Jan", torres: 32000 },
  { month: "Fev", torres: 34500 },
  { month: "Mar", torres: 37000 },
  { month: "Abr", torres: 39500 },
  { month: "Mai", torres: 41000 },
  { month: "Jun", torres: 42500 },
  { month: "Jul", torres: 44000 },
  { month: "Ago", torres: 45200 },
  { month: "Set", torres: 46100 },
  { month: "Out", torres: 47000 },
  { month: "Nov", torres: 47800 },
  { month: "Dez", torres: 48247 },
];

const EvolutionChart = () => {
  return (
    <div className="glass-card p-5 animate-scale-in" style={{ animationDelay: "400ms" }}>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-accent" />
        <h3 className="text-sm font-semibold">Evolução Mensal 2025</h3>
      </div>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(217, 33%, 20%)" 
              vertical={false}
            />
            <XAxis 
              dataKey="month" 
              stroke="hsl(215, 20%, 65%)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="hsl(215, 20%, 65%)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value / 1000}k`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: "hsl(222, 47%, 11%)",
                border: "1px solid hsl(217, 33%, 20%)",
                borderRadius: "8px",
                color: "hsl(210, 40%, 98%)",
              }}
              formatter={(value: number) => [`${value.toLocaleString()} torres`, ""]}
            />
            <Line 
              type="monotone" 
              dataKey="torres" 
              stroke="hsl(199, 89%, 48%)"
              strokeWidth={2}
              dot={{ fill: "hsl(199, 89%, 48%)", strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, fill: "hsl(199, 89%, 48%)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EvolutionChart;
