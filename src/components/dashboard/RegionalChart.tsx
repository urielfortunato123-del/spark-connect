import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Map } from "lucide-react";

const data5G = [
  { region: "Sudeste", coverage: 92, color: "hsl(38, 75%, 55%)" },
  { region: "Sul", coverage: 85, color: "hsl(40, 80%, 65%)" },
  { region: "Nordeste", coverage: 72, color: "hsl(25, 80%, 50%)" },
  { region: "Norte", coverage: 55, color: "hsl(145, 60%, 45%)" },
  { region: "Centro-Oeste", coverage: 68, color: "hsl(195, 100%, 45%)" },
];

const dataEV = [
  { region: "Sudeste", coverage: 78, color: "hsl(145, 80%, 50%)" },
  { region: "Sul", coverage: 65, color: "hsl(0, 85%, 55%)" },
  { region: "Nordeste", coverage: 35, color: "hsl(45, 100%, 50%)" },
  { region: "Norte", coverage: 18, color: "hsl(200, 80%, 55%)" },
  { region: "Centro-Oeste", coverage: 45, color: "hsl(270, 100%, 65%)" },
];

interface RegionalChartProps {
  type: "5g" | "ev";
}

const RegionalChart = ({ type }: RegionalChartProps) => {
  const data = type === "5g" ? data5G : dataEV;
  const title = type === "5g" ? "Cobertura 5G por Região" : "Estações EV por Região";

  return (
    <div className="glass-card-hover p-5 animate-scale-in" style={{ animationDelay: "500ms" }}>
      <div className="flex items-center gap-2 mb-4">
        <Map className="w-4 h-4 text-accent" />
        <h3 className="text-sm font-display font-semibold">{title}</h3>
      </div>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <XAxis 
              type="number" 
              domain={[0, 100]}
              stroke="hsl(215, 20%, 60%)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
            />
            <YAxis 
              type="category" 
              dataKey="region" 
              stroke="hsl(215, 20%, 60%)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              width={70}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: "hsl(220, 20%, 10%)",
                border: "1px solid hsl(220, 15%, 20%)",
                borderRadius: "8px",
                color: "hsl(40, 20%, 95%)",
              }}
              formatter={(value: number) => [`${value}%`, "Cobertura"]}
            />
            <Bar 
              dataKey="coverage" 
              radius={[0, 4, 4, 0]}
              barSize={20}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RegionalChart;
