import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Map } from "lucide-react";
import { erbsByState, totalERBStats } from "@/data/erbData";

// Calculate regional totals from state data
const getRegionalData = () => {
  const regions: Record<string, { total: number; states: string[] }> = {
    "Sudeste": { total: 0, states: ["SP", "RJ", "MG", "ES"] },
    "Sul": { total: 0, states: ["PR", "SC", "RS"] },
    "Nordeste": { total: 0, states: ["BA", "PE", "CE", "MA", "PB", "RN", "AL", "SE", "PI"] },
    "Norte": { total: 0, states: ["AM", "PA", "RO", "AC", "AP", "RR", "TO"] },
    "Centro-Oeste": { total: 0, states: ["GO", "MT", "MS", "DF"] },
  };

  erbsByState.forEach(state => {
    Object.entries(regions).forEach(([region, data]) => {
      if (data.states.includes(state.stateCode)) {
        regions[region].total += state.total;
      }
    });
  });

  const maxTotal = Math.max(...Object.values(regions).map(r => r.total));
  
  return Object.entries(regions).map(([region, data]) => ({
    region,
    total: data.total,
    coverage: Math.round((data.total / maxTotal) * 100),
    color: region === "Sudeste" ? "#ff4da6" : 
           region === "Sul" ? "#00d4ff" : 
           region === "Nordeste" ? "#ff6b35" : 
           region === "Norte" ? "#00cc66" : "#a855f7",
  }));
};

const data5G = getRegionalData();

const dataEV = [
  { region: "Sudeste", coverage: 78, total: 35, color: "#22c55e" },
  { region: "Sul", coverage: 65, total: 10, color: "#00d4ff" },
  { region: "Nordeste", coverage: 15, total: 3, color: "#ff6b35" },
  { region: "Norte", coverage: 8, total: 1, color: "#ffd000" },
  { region: "Centro-Oeste", coverage: 20, total: 2, color: "#a855f7" },
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
