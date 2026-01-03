import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  LineChart,
  PieChart,
  Target,
  Lightbulb,
  Zap,
  Building2
} from 'lucide-react';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';

const growthData = [
  { year: '2020', torres: 25000, eletropostos: 150, evs: 12000 },
  { year: '2021', torres: 32000, eletropostos: 350, evs: 28000 },
  { year: '2022', torres: 38000, eletropostos: 800, evs: 52000 },
  { year: '2023', torres: 42000, eletropostos: 1500, evs: 94000 },
  { year: '2024', torres: 48000, eletropostos: 2800, evs: 180000 },
  { year: '2025', torres: 55000, eletropostos: 5000, evs: 320000 },
  { year: '2026', torres: 65000, eletropostos: 8500, evs: 520000 },
];

const scenarioData = [
  { name: 'Pessimista', torres: 55000, eletropostos: 6000, investment: 8 },
  { name: 'Base', torres: 65000, eletropostos: 8500, investment: 12 },
  { name: 'Otimista', torres: 80000, eletropostos: 15000, investment: 18 },
];

const regionData = [
  { region: 'Sudeste', torres: 45, eletropostos: 62, population: 42 },
  { region: 'Sul', torres: 22, eletropostos: 18, population: 14 },
  { region: 'Nordeste', torres: 18, eletropostos: 10, population: 27 },
  { region: 'Centro-Oeste', torres: 10, eletropostos: 7, population: 8 },
  { region: 'Norte', torres: 5, eletropostos: 3, population: 9 },
];

export default function Cenarios() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
            <BarChart3 className="h-7 w-7 text-indigo-500" />
            Cenários
          </h1>
          <p className="text-muted-foreground mt-1">
            Projeções e análise de cenários para infraestrutura
          </p>
        </div>

        {/* Key Projections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass-card border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">EVs até 2030</span>
                <Badge className="bg-green-500/10 text-green-500">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +340%
                </Badge>
              </div>
              <p className="text-3xl font-bold">2.5M</p>
              <p className="text-xs text-muted-foreground mt-1">veículos elétricos</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Torres 5G 2030</span>
                <Badge className="bg-blue-500/10 text-blue-500">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +85%
                </Badge>
              </div>
              <p className="text-3xl font-bold">120K</p>
              <p className="text-xs text-muted-foreground mt-1">estações instaladas</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-amber-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Investimento</span>
                <Badge className="bg-amber-500/10 text-amber-500">
                  <Target className="h-3 w-3 mr-1" />
                  2024-2030
                </Badge>
              </div>
              <p className="text-3xl font-bold">R$ 85B</p>
              <p className="text-xs text-muted-foreground mt-1">em infraestrutura</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Growth Projection */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <LineChart className="h-5 w-5 text-indigo-500" />
                Projeção de Crescimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="year" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))' 
                      }} 
                    />
                    <Area type="monotone" dataKey="torres" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Torres" />
                    <Area type="monotone" dataKey="eletropostos" stackId="2" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} name="Eletropostos" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Scenario Analysis */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-500" />
                Análise de Cenários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scenarioData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))' 
                      }} 
                    />
                    <Bar dataKey="torres" fill="#3b82f6" name="Torres (mil)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="eletropostos" fill="#22c55e" name="Eletropostos" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Regional Distribution */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChart className="h-5 w-5 text-indigo-500" />
              Distribuição Regional (%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {regionData.map((region) => (
                <div key={region.region} className="text-center p-4 rounded-lg bg-muted/30">
                  <h4 className="font-semibold mb-3">{region.region}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Torres:</span>
                      <Badge variant="outline" className="text-blue-500">{region.torres}%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">EVs:</span>
                      <Badge variant="outline" className="text-green-500">{region.eletropostos}%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pop:</span>
                      <Badge variant="outline">{region.population}%</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Insights */}
        <Card className="glass-card bg-gradient-to-r from-indigo-500/5 to-purple-500/5 border-indigo-500/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-indigo-500/10">
                <Lightbulb className="h-6 w-6 text-indigo-500" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Principais Insights</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• O Sudeste concentra 62% dos eletropostos mas apenas 42% da população</li>
                  <li>• Norte e Nordeste representam 36% da população mas apenas 13% da infraestrutura</li>
                  <li>• A demanda por EVs deve crescer 340% até 2030, exigindo 15x mais eletropostos</li>
                  <li>• Cobertura 5G deve atingir 95% dos municípios até 2028</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
