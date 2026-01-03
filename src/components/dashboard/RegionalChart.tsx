import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import { Map } from "lucide-react";
import { erbsByState } from "@/data/erbData";
import { evStationsData } from "@/data/evStations";
import { useMemo } from "react";

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

const getEVRegionalData = () => {
  const regions: Record<string, { count: number; states: string[] }> = {
    "Sudeste": { count: 0, states: ["SP", "RJ", "MG", "ES"] },
    "Sul": { count: 0, states: ["PR", "SC", "RS"] },
    "Nordeste": { count: 0, states: ["BA", "PE", "CE", "MA", "PB", "RN", "AL", "SE", "PI"] },
    "Norte": { count: 0, states: ["AM", "PA", "RO", "AC", "AP", "RR", "TO"] },
    "Centro-Oeste": { count: 0, states: ["GO", "MT", "MS", "DF"] },
  };

  evStationsData.forEach(station => {
    Object.entries(regions).forEach(([region, data]) => {
      if (data.states.includes(station.state)) {
        regions[region].count += 1;
      }
    });
  });

  const maxCount = Math.max(...Object.values(regions).map(r => r.count));
  
  return Object.entries(regions).map(([region, data]) => ({
    region,
    total: data.count,
    coverage: Math.round((data.count / maxCount) * 100),
    color: region === "Sudeste" ? "#22c55e" : 
           region === "Sul" ? "#00d4ff" : 
           region === "Nordeste" ? "#ff6b35" : 
           region === "Norte" ? "#ffd000" : "#a855f7",
  }));
};

interface RegionalChartProps {
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
          <span className="font-medium text-sm">{data.region}</span>
        </div>
        <p className="text-lg font-bold text-foreground">
          {data.total.toLocaleString("pt-BR")}
        </p>
        <p className="text-xs text-muted-foreground">
          {data.coverage}% da concentração máxima
        </p>
      </div>
    );
  }
  return null;
};

const RegionalChart = ({ type }: RegionalChartProps) => {
  const data5G = useMemo(() => getRegionalData(), []);
  const dataEV = useMemo(() => getEVRegionalData(), []);
  
  const data = type === "5g" ? data5G : dataEV;
  const title = type === "5g" ? "Cobertura 5G por Região" : "Estações EV por Região";

  // Find leader
  const leader = data.reduce((a, b) => a.total > b.total ? a : b);

  return (
    <div className="glass-card-hover p-3 md:p-5 transition-all duration-300 hover:shadow-gold-glow">
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <div className="flex items-center gap-2">
          <Map className="w-3.5 h-3.5 md:w-4 md:h-4 text-accent" />
          <h3 className="text-xs md:text-sm font-display font-semibold">{title}</h3>
        </div>
        <span className="text-[10px] text-muted-foreground">
          Líder: <span className="text-foreground font-medium">{leader.region}</span>
        </span>
      </div>
      
      <div className="h-36 md:h-48 min-h-[144px] md:min-h-[192px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <XAxis 
              type="number" 
              domain={[0, 100]}
              stroke="hsl(215, 20%, 60%)"
              fontSize={9}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
            />
            <YAxis 
              type="category" 
              dataKey="region" 
              stroke="hsl(215, 20%, 60%)"
              fontSize={9}
              tickLine={false}
              axisLine={false}
              width={55}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(220, 15%, 15%)' }} />
            <Bar 
              dataKey="coverage" 
              radius={[0, 4, 4, 0]}
              barSize={16}
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  className="transition-opacity duration-200 hover:opacity-80"
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RegionalChart;
