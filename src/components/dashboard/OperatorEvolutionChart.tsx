import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp } from "lucide-react";
import { operatorData, operatorColors } from "@/data/erbData";

// Monthly evolution data per operator (2025) - based on growth rates
const generateOperatorMonthlyData = () => {
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov"];
  
  // Starting values (Dec 2024) - approximate based on annual growth
  const startValues: Record<string, number> = {
    VIVO: 36000,
    TIM: 35500,
    CLARO: 29000,
    BRISANET: 2200,
    ALGAR: 740,
    UNIFIQUE: 400,
    SERCOMTEL: 51,
  };
  
  return months.map((month, index) => {
    const progress = (index + 1) / 11; // Progress through the year
    const dataPoint: Record<string, string | number> = { month };
    
    operatorData.forEach(op => {
      const start = startValues[op.operator] || op.total * 0.9;
      const end = op.total;
      dataPoint[op.operator] = Math.round(start + (end - start) * progress);
    });
    
    return dataPoint;
  });
};

const data = generateOperatorMonthlyData();

// Only show main operators for clarity
const mainOperators = ["VIVO", "TIM", "CLARO"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-xl min-w-[150px]">
        <p className="text-xs text-muted-foreground mb-2 font-medium">{label} 2025</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 text-xs">
            <span style={{ color: entry.color }}>{entry.name}</span>
            <span className="font-bold text-foreground">
              {entry.value.toLocaleString("pt-BR")}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const OperatorEvolutionChart = () => {
  return (
    <div className="glass-card-hover p-3 md:p-5 transition-all duration-300 hover:shadow-gold-glow">
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
          <h3 className="text-xs md:text-sm font-display font-semibold">Evolução por Operadora 2025</h3>
        </div>
        <div className="flex gap-1">
          {mainOperators.map(op => (
            <span 
              key={op}
              className="text-[8px] md:text-[10px] px-1.5 py-0.5 rounded"
              style={{ 
                backgroundColor: `${operatorColors[op]}20`,
                color: operatorColors[op]
              }}
            >
              {op}
            </span>
          ))}
        </div>
      </div>
      
      <div className="h-36 md:h-48 min-h-[144px] md:min-h-[192px]">
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
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              width={30}
            />
            <Tooltip content={<CustomTooltip />} />
            {mainOperators.map(operator => (
              <Line
                key={operator}
                type="monotone"
                dataKey={operator}
                stroke={operatorColors[operator]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: operatorColors[operator], stroke: "#fff", strokeWidth: 2 }}
                animationBegin={0}
                animationDuration={1000}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Secondary operators summary */}
      <div className="mt-3 pt-3 border-t border-border/30">
        <div className="flex flex-wrap gap-2 justify-center">
          {operatorData
            .filter(op => !mainOperators.includes(op.operator))
            .map(op => (
              <div 
                key={op.operator}
                className="flex items-center gap-1 text-[9px] text-muted-foreground"
              >
                <span 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: op.color }}
                />
                <span>{op.operator}: {op.total.toLocaleString("pt-BR")}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default OperatorEvolutionChart;
