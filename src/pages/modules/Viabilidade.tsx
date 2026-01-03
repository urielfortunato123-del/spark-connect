import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Target, 
  TrendingUp, 
  DollarSign, 
  FileCheck,
  Building2,
  Users,
  Zap,
  Calculator,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

const analysisTypes = [
  { 
    title: 'Eletroposto', 
    icon: Zap, 
    color: 'bg-green-500',
    description: 'Análise para estação de recarga EV',
    avgInvestment: 'R$ 150k - R$ 500k',
    avgROI: '24-36 meses'
  },
  { 
    title: 'Torre 5G', 
    icon: Target, 
    color: 'bg-blue-500',
    description: 'Análise para ERB/torre de telecom',
    avgInvestment: 'R$ 80k - R$ 250k',
    avgROI: '18-30 meses'
  },
  { 
    title: 'Subestação', 
    icon: Building2, 
    color: 'bg-amber-500',
    description: 'Análise para subestação elétrica',
    avgInvestment: 'R$ 2M - R$ 15M',
    avgROI: '5-10 anos'
  },
  { 
    title: 'Posto de Combustível', 
    icon: DollarSign, 
    color: 'bg-red-500',
    description: 'Análise para posto com EV',
    avgInvestment: 'R$ 500k - R$ 2M',
    avgROI: '36-60 meses'
  },
];

const steps = [
  { step: 1, title: 'Localização', description: 'Defina o local do projeto', icon: MapPin },
  { step: 2, title: 'Tipo de Projeto', description: 'Selecione a infraestrutura', icon: Target },
  { step: 3, title: 'Análise de Mercado', description: 'Demanda e concorrência', icon: TrendingUp },
  { step: 4, title: 'Viabilidade Financeira', description: 'ROI e payback', icon: Calculator },
  { step: 5, title: 'Licenciamento', description: 'Requisitos legais', icon: FileCheck },
  { step: 6, title: 'Relatório Final', description: 'Decisão de investimento', icon: CheckCircle2 },
];

export default function Viabilidade() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [location, setLocation] = useState({ city: '', state: '' });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
            <MapPin className="h-7 w-7 text-purple-500" />
            Viabilidade
          </h1>
          <p className="text-muted-foreground mt-1">
            Estudos de viabilidade técnica e econômica para projetos de infraestrutura
          </p>
        </div>

        {/* Process Steps */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Processo de Análise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-between gap-4">
              {steps.map((step, index) => (
                <div key={step.step} className="flex items-center gap-3 flex-1 min-w-[150px]">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <step.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{step.title}</p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block w-8 h-px bg-border" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Location Input */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-purple-500" />
              1. Localização do Projeto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input 
                  id="city" 
                  placeholder="Ex: São Paulo"
                  value={location.city}
                  onChange={(e) => setLocation({...location, city: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="state">Estado</Label>
                <Input 
                  id="state" 
                  placeholder="Ex: SP"
                  value={location.state}
                  onChange={(e) => setLocation({...location, state: e.target.value})}
                />
              </div>
              <div className="flex items-end">
                <Button className="w-full">
                  <Target className="h-4 w-4 mr-2" />
                  Analisar Localização
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Types */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-500" />
            2. Tipo de Projeto
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {analysisTypes.map((type) => (
              <Card 
                key={type.title}
                className={`cursor-pointer transition-all duration-300 hover:border-primary/50 ${
                  selectedType === type.title ? 'border-primary ring-2 ring-primary/20' : ''
                }`}
                onClick={() => setSelectedType(type.title)}
              >
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl ${type.color}/10 flex items-center justify-center mb-4`}>
                    <type.icon className={`h-6 w-6 ${type.color.replace('bg-', 'text-')}`} />
                  </div>
                  <h4 className="font-semibold mb-1">{type.title}</h4>
                  <p className="text-sm text-muted-foreground mb-4">{type.description}</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Investimento:</span>
                      <span className="font-medium">{type.avgInvestment}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payback:</span>
                      <span className="font-medium">{type.avgROI}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">847</p>
                <p className="text-xs text-muted-foreground">Análises realizadas</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">78%</p>
                <p className="text-xs text-muted-foreground">Taxa de aprovação</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">48h</p>
                <p className="text-xs text-muted-foreground">Tempo médio análise</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <DollarSign className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">R$ 2.3B</p>
                <p className="text-xs text-muted-foreground">Investimentos analisados</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
