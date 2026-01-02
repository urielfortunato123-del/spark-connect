import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Map } from "lucide-react";

const data = [
  { region: "Sudeste", coverage: 92, color: "hsl(199, 89%, 48%)" },
  { region: "Sul", coverage: 85, color: "hsl(252, 100%, 69%)" },
  { region: "Nordeste", coverage: 72, color: "hsl(330, 100%, 71%)" },
  { region: "Norte", coverage: 55, color: "hsl(142, 76%, 45%)" },
  { region: "Centro-Oeste", coverage: 68, color: "hsl(45, 100%, 51%)" },
];

const RegionalChart = () => {
  return (
    <div className="glass-card p-5 animate-scale-in" style={{ animationDelay: "500ms" }}>
      <div className="flex items-center gap-2 mb-4">
        <Map className="w-4 h-4 text-operator-vivo" />
        <h3 className="text-sm font-semibold">Cobertura por Região</h3>
      </div>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <XAxis 
              type="number" 
              domain={[0, 100]}
              stroke="hsl(215, 20%, 65%)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
            />
            <YAxis 
              type="category" 
              dataKey="region" 
              stroke="hsl(215, 20%, 65%)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              width={70}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: "hsl(222, 47%, 11%)",
                border: "1px solid hsl(217, 33%, 20%)",
                borderRadius: "8px",
                color: "hsl(210, 40%, 98%)",
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
