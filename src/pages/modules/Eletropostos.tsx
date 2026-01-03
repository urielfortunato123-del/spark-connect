import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Zap, Battery, MapPin, Building2, Plug, RefreshCw, Loader2,
  CheckCircle2, ArrowRight, Bot, Sparkles, FileText, AlertTriangle,
  Clock, Target, FileCheck, Car, Fuel
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMemo, useEffect } from 'react';
import { useCountUp } from '@/hooks/useCountUp';
import { useInfraAI } from '@/hooks/useInfraAI';
import { toast } from 'sonner';

const createMarkerIcon = (status: string) => {
  const isOperational = status === 'active';
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 24px;
      height: 24px;
      background: ${isOperational ? '#22c55e' : '#ef4444'};
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

function MapController({ stations }: { stations: { latitude: number; longitude: number }[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (stations.length > 0) {
      const bounds = L.latLngBounds(
        stations.map(s => [s.latitude, s.longitude] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [stations, map]);
  
  return null;
}

function StatCardAnimated({ label, value, icon: Icon, suffix = '' }: { 
  label: string; 
  value: number; 
  icon: React.ElementType;
  suffix?: string;
}) {
  const { value: animatedValue } = useCountUp({ end: value, duration: 1500 });
  
  return (
    <Card className="glass-card">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {Math.round(animatedValue).toLocaleString('pt-BR')}{suffix}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-green-500/10">
            <Icon className="h-4 w-4 text-green-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const sampleStations = [
  { id: '1', latitude: -23.5505, longitude: -46.6333, city: 'São Paulo', state: 'SP', operator: 'Shell Recharge', power_kw: 150, num_chargers: 4, status: 'active' },
  { id: '2', latitude: -22.9068, longitude: -43.1729, city: 'Rio de Janeiro', state: 'RJ', operator: 'Tesla', power_kw: 250, num_chargers: 8, status: 'active' },
  { id: '3', latitude: -19.9167, longitude: -43.9345, city: 'Belo Horizonte', state: 'MG', operator: 'Voltbras', power_kw: 100, num_chargers: 2, status: 'active' },
  { id: '4', latitude: -25.4284, longitude: -49.2733, city: 'Curitiba', state: 'PR', operator: 'Shell Recharge', power_kw: 150, num_chargers: 4, status: 'active' },
  { id: '5', latitude: -30.0346, longitude: -51.2177, city: 'Porto Alegre', state: 'RS', operator: 'EDP', power_kw: 50, num_chargers: 2, status: 'active' },
  { id: '6', latitude: -15.7801, longitude: -47.9292, city: 'Brasília', state: 'DF', operator: 'Tesla', power_kw: 250, num_chargers: 6, status: 'active' },
  { id: '7', latitude: -3.7172, longitude: -38.5433, city: 'Fortaleza', state: 'CE', operator: 'Zletric', power_kw: 75, num_chargers: 2, status: 'active' },
  { id: '8', latitude: -8.0476, longitude: -34.8770, city: 'Recife', state: 'PE', operator: 'Voltbras', power_kw: 100, num_chargers: 3, status: 'active' },
];

const workflowSteps = [
  { step: 1, id: 'local', title: 'Localização' },
  { step: 2, id: 'tecnico', title: 'Especificações' },
  { step: 3, id: 'viabilidade', title: 'Viabilidade' },
  { step: 4, id: 'analise', title: 'Análise IA' },
  { step: 5, id: 'resultado', title: 'Resultado' },
];

const brazilianStates = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", 
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", 
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

const connectorTypes = [
  'CCS Combo 2', 'CHAdeMO', 'Type 2 (Mennekes)', 'Type 1 (J1772)', 
  'Tesla Supercharger', 'GB/T', 'Tomada Comum'
];

const locationTypes = [
  'Shopping Center', 'Posto de Combustível', 'Estacionamento Público',
  'Supermercado', 'Hotel', 'Restaurante', 'Condomínio', 
  'Empresa/Escritório', 'Rodovia', 'Aeroporto', 'Outro'
];

export default function Eletropostos() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentStep, setCurrentStep] = useState(1);
  const [projectData, setProjectData] = useState({
    nome: '',
    municipio: '',
    estado: '',
    endereco: '',
    latitude: '',
    longitude: '',
    tipoLocal: '',
    operadora: '',
    qtdCarregadores: '',
    potenciaTotal: '',
    conectores: [] as string[],
    acessoPublico: 'sim',
    horarioFuncionamento: '24h',
    descricao: ''
  });
  
  const { sendMessage, isLoading: aiLoading, messages, clearMessages } = useInfraAI();

  const { data: dbStations, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['ev-stations-brazil'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ev_stations')
        .select('*')
        .eq('country_code', 'BR');
      if (error) throw error;
      return data || [];
    },
  });

  const stations = useMemo(() => 
    (dbStations && dbStations.length > 0) ? dbStations : sampleStations,
    [dbStations]
  );

  const stats = useMemo(() => {
    const byState: Record<string, number> = {};
    const byOperator: Record<string, number> = {};
    let totalPower = 0;
    let totalChargers = 0;

    stations.forEach(s => {
      byState[s.state || 'N/A'] = (byState[s.state || 'N/A'] || 0) + 1;
      byOperator[s.operator || 'N/A'] = (byOperator[s.operator || 'N/A'] || 0) + 1;
      totalPower += s.power_kw || 0;
      totalChargers += s.num_chargers || 1;
    });

    return {
      total: stations.length,
      totalChargers,
      totalPower,
      uniqueCities: new Set(stations.map(s => s.city)).size,
      byState,
      byOperator,
    };
  }, [stations]);

  const topOperators = useMemo(() => 
    Object.entries(stats.byOperator).sort(([,a], [,b]) => b - a).slice(0, 5),
    [stats.byOperator]
  );

  const topStates = useMemo(() => 
    Object.entries(stats.byState).sort(([,a], [,b]) => b - a).slice(0, 5),
    [stats.byState]
  );

  const progress = (currentStep / workflowSteps.length) * 100;

  const canProceed = () => {
    switch (currentStep) {
      case 1: return projectData.municipio && projectData.estado && projectData.tipoLocal;
      case 2: return projectData.qtdCarregadores && projectData.potenciaTotal;
      default: return true;
    }
  };

  const handleAIAnalysis = async () => {
    clearMessages();
    setCurrentStep(4);
    
    const prompt = `Faça uma análise completa de viabilidade para implantação de estação de recarga de veículos elétricos:

**DADOS DO PROJETO:**
- Nome: ${projectData.nome || 'Nova Estação de Recarga'}
- Localização: ${projectData.municipio}, ${projectData.estado}
- Endereço: ${projectData.endereco || 'A definir'}
- Coordenadas: ${projectData.latitude || 'N/A'}, ${projectData.longitude || 'N/A'}
- Tipo de Local: ${projectData.tipoLocal}

**ESPECIFICAÇÕES TÉCNICAS:**
- Operadora/Rede: ${projectData.operadora || 'A definir'}
- Quantidade de Carregadores: ${projectData.qtdCarregadores}
- Potência Total: ${projectData.potenciaTotal} kW
- Tipos de Conectores: ${projectData.conectores.join(', ') || 'A definir'}
- Acesso Público: ${projectData.acessoPublico}
- Horário: ${projectData.horarioFuncionamento}

**DESCRIÇÃO:** ${projectData.descricao || 'Implantação de nova estação de recarga para veículos elétricos'}

Por favor, forneça análise detalhada incluindo:

1. **VIABILIDADE TÉCNICA**
   - Análise de demanda de energia
   - Requisitos de infraestrutura elétrica
   - Compatibilidade de conectores com frota brasileira

2. **ANÁLISE DE MERCADO**
   - Demanda estimada na região
   - Concorrência (outras estações próximas)
   - Público-alvo (frotas, particulares, delivery)

3. **LICENCIAMENTO E REGULAÇÃO**
   - Requisitos INMETRO para medidores
   - Normas ABNT (NBR IEC 61851, NBR 17019)
   - Regulamentação ANEEL para venda de energia
   - Alvará municipal

4. **INFRAESTRUTURA ELÉTRICA**
   - Potência necessária na entrada
   - Tipo de transformador recomendado
   - Requisitos de aterramento e proteção
   - Estimativa de obras civis

5. **CUSTOS ESTIMADOS**
   - Equipamentos (carregadores, cabos)
   - Infraestrutura elétrica
   - Obras civis
   - Licenciamento
   - Manutenção anual

6. **MODELO DE NEGÓCIO**
   - Precificação sugerida (R$/kWh)
   - Tempo médio de recarga por veículo
   - Estimativa de receita mensal
   - Payback estimado

7. **CRONOGRAMA**
   - Tempo total de implantação
   - Fases do projeto

8. **RISCOS E RECOMENDAÇÕES**
   - Pontos de atenção
   - Recomendações para sucesso

Considere o contexto brasileiro atual (Programa Rota 2030, incentivos estaduais, crescimento de EVs no Brasil).`;

    await sendMessage(prompt);
    setCurrentStep(5);
  };

  const resetFlow = () => {
    setCurrentStep(1);
    setProjectData({
      nome: '', municipio: '', estado: '', endereco: '',
      latitude: '', longitude: '', tipoLocal: '', operadora: '',
      qtdCarregadores: '', potenciaTotal: '', conectores: [],
      acessoPublico: 'sim', horarioFuncionamento: '24h', descricao: ''
    });
    clearMessages();
  };

  const toggleConnector = (connector: string) => {
    setProjectData(prev => ({
      ...prev,
      conectores: prev.conectores.includes(connector)
        ? prev.conectores.filter(c => c !== connector)
        : [...prev.conectores, connector]
    }));
  };

  const renderWorkflowStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-500" />
                Localização da Estação
              </CardTitle>
              <CardDescription>Defina onde a estação de recarga será instalada</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nome do Projeto</Label>
                  <Input 
                    placeholder="Ex: Eletroposto Shopping Iguatemi"
                    value={projectData.nome}
                    onChange={(e) => setProjectData({...projectData, nome: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Tipo de Local *</Label>
                  <Select 
                    value={projectData.tipoLocal}
                    onValueChange={(v) => setProjectData({...projectData, tipoLocal: v})}
                  >
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {locationTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Município *</Label>
                  <Input 
                    placeholder="Ex: São Paulo"
                    value={projectData.municipio}
                    onChange={(e) => setProjectData({...projectData, municipio: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Estado *</Label>
                  <Select 
                    value={projectData.estado}
                    onValueChange={(v) => setProjectData({...projectData, estado: v})}
                  >
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {brazilianStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Endereço Completo</Label>
                <Input 
                  placeholder="Ex: Av. Brigadeiro Faria Lima, 3477"
                  value={projectData.endereco}
                  onChange={(e) => setProjectData({...projectData, endereco: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Latitude</Label>
                  <Input 
                    placeholder="Ex: -23.5505"
                    value={projectData.latitude}
                    onChange={(e) => setProjectData({...projectData, latitude: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Longitude</Label>
                  <Input 
                    placeholder="Ex: -46.6333"
                    value={projectData.longitude}
                    onChange={(e) => setProjectData({...projectData, longitude: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plug className="h-5 w-5 text-green-500" />
                Especificações Técnicas
              </CardTitle>
              <CardDescription>Defina as características dos carregadores</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Operadora/Rede</Label>
                  <Input 
                    placeholder="Ex: Shell Recharge, Tesla, Voltbras"
                    value={projectData.operadora}
                    onChange={(e) => setProjectData({...projectData, operadora: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Qtd. Carregadores *</Label>
                  <Input 
                    type="number"
                    placeholder="Ex: 4"
                    value={projectData.qtdCarregadores}
                    onChange={(e) => setProjectData({...projectData, qtdCarregadores: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Potência Total (kW) *</Label>
                  <Input 
                    type="number"
                    placeholder="Ex: 150"
                    value={projectData.potenciaTotal}
                    onChange={(e) => setProjectData({...projectData, potenciaTotal: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <Label className="mb-3 block">Tipos de Conectores</Label>
                <div className="flex flex-wrap gap-2">
                  {connectorTypes.map(connector => (
                    <Badge
                      key={connector}
                      variant={projectData.conectores.includes(connector) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleConnector(connector)}
                    >
                      {connector}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Acesso Público</Label>
                  <Select 
                    value={projectData.acessoPublico}
                    onValueChange={(v) => setProjectData({...projectData, acessoPublico: v})}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sim">Sim - Aberto ao público</SelectItem>
                      <SelectItem value="restrito">Restrito - Clientes/funcionários</SelectItem>
                      <SelectItem value="privado">Privado - Uso exclusivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Horário de Funcionamento</Label>
                  <Select 
                    value={projectData.horarioFuncionamento}
                    onValueChange={(v) => setProjectData({...projectData, horarioFuncionamento: v})}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">24 horas</SelectItem>
                      <SelectItem value="comercial">Horário comercial</SelectItem>
                      <SelectItem value="estendido">Horário estendido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Descrição do Projeto</Label>
                <Textarea 
                  placeholder="Descreva o objetivo, público-alvo esperado, diferenciais..."
                  value={projectData.descricao}
                  onChange={(e) => setProjectData({...projectData, descricao: e.target.value})}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-amber-500" />
                Confirmação de Viabilidade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Análise Completa</p>
                  <p className="text-sm text-muted-foreground">
                    A IA irá analisar viabilidade técnica, mercado, infraestrutura elétrica, 
                    custos, modelo de negócio e cronograma completo.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 rounded-lg bg-muted/30 border">
                  <p className="text-muted-foreground">Localização</p>
                  <p className="font-medium">{projectData.municipio}, {projectData.estado}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border">
                  <p className="text-muted-foreground">Tipo de Local</p>
                  <p className="font-medium">{projectData.tipoLocal}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border">
                  <p className="text-muted-foreground">Carregadores</p>
                  <p className="font-medium">{projectData.qtdCarregadores} unidades</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border">
                  <p className="text-muted-foreground">Potência Total</p>
                  <p className="font-medium">{projectData.potenciaTotal} kW</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/30 border">
                <div className="flex items-center gap-2 mb-3">
                  <Bot className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">O InfraBot irá analisar:</span>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Viabilidade técnica e infraestrutura elétrica
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Análise de mercado e demanda
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Normas INMETRO e ABNT
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Modelo de negócio e payback
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Custos e cronograma completo
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        );

      case 4:
      case 5:
        return (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                Análise de Viabilidade
                <Badge variant="outline">
                  <Sparkles className="h-3 w-3 mr-1" />
                  IA
                </Badge>
              </CardTitle>
              <CardDescription>
                {projectData.nome || 'Nova Estação'} - {projectData.municipio}/{projectData.estado}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Analisando viabilidade do projeto...</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Consultando normas, mercado e infraestrutura
                  </p>
                </div>
              ) : messages.filter(m => m.role === 'assistant').length > 0 ? (
                <div className="space-y-4">
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <div className="whitespace-pre-wrap">
                        {messages.filter(m => m.role === 'assistant').slice(-1)[0]?.content}
                      </div>
                    </div>
                  </ScrollArea>
                  <div className="flex gap-2 pt-4 border-t">
                    <Button onClick={() => toast.success('Análise salva!')}>
                      <FileCheck className="h-4 w-4 mr-2" />
                      Salvar
                    </Button>
                    <Button variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Exportar PDF
                    </Button>
                    <Button variant="outline" onClick={resetFlow}>
                      Nova Análise
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <Bot className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">Aguardando análise</p>
                </div>
              )}
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
              <Zap className="h-7 w-7 text-green-500" />
              Eletropostos
            </h1>
            <p className="text-muted-foreground mt-1">
              Infraestrutura de recarga para veículos elétricos
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="implantacao">Nova Estação</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6 mt-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="glass-card animate-pulse">
                    <CardContent className="p-4 h-24" />
                  </Card>
                ))
              ) : (
                <>
                  <StatCardAnimated label="Total de Estações" value={stats.total} icon={Zap} />
                  <StatCardAnimated label="Carregadores" value={stats.totalChargers} icon={Battery} />
                  <StatCardAnimated label="Municípios" value={stats.uniqueCities} icon={MapPin} />
                  <StatCardAnimated label="Potência Total (kW)" value={Math.round(stats.totalPower)} icon={Plug} />
                </>
              )}
            </div>

            {/* Map and Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Map */}
              <Card className="glass-card lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-green-500" />
                    Mapa de Eletropostos
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[500px] rounded-b-lg overflow-hidden">
                    {isLoading ? (
                      <div className="h-full flex items-center justify-center bg-muted/20">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <MapContainer
                        center={[-15.7801, -47.9292]}
                        zoom={4}
                        style={{ height: '100%', width: '100%' }}
                        className="z-0"
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapController stations={stations.filter(s => s.latitude && s.longitude)} />
                        {stations.filter(s => s.latitude && s.longitude).map((station) => (
                          <Marker
                            key={station.id}
                            position={[station.latitude, station.longitude]}
                            icon={createMarkerIcon(station.status || 'active')}
                          >
                            <Popup>
                              <div className="min-w-[180px]">
                                <h3 className="font-semibold text-sm">{station.operator}</h3>
                                <p className="text-xs text-gray-600">{station.city}, {station.state}</p>
                                <div className="mt-2 space-y-1">
                                  <p className="text-xs"><strong>Potência:</strong> {station.power_kw} kW</p>
                                  <p className="text-xs"><strong>Carregadores:</strong> {station.num_chargers}</p>
                                  <p className="text-xs"><strong>Status:</strong> {station.status}</p>
                                </div>
                              </div>
                            </Popup>
                          </Marker>
                        ))}
                      </MapContainer>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Side Stats */}
              <div className="space-y-4">
                <Card className="glass-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-500" />
                      Top Operadores
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {topOperators.map(([operator, count], i) => (
                      <div key={operator} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground truncate max-w-[150px]">
                          {i + 1}. {operator}
                        </span>
                        <Badge variant="secondary" className="text-xs">{count}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-orange-500" />
                      Estados com mais estações
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {topStates.map(([state, count], i) => (
                      <div key={state} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {i + 1}. {state || 'N/A'}
                        </span>
                        <Badge variant="secondary" className="text-xs">{count}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="glass-card bg-green-500/5 border-green-500/20">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">
                      <strong>Fonte:</strong> Banco de dados InfraBrasil
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {dbStations && dbStations.length > 0 
                        ? 'Dados em tempo real' 
                        : 'Dados de demonstração'}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="implantacao" className="space-y-6 mt-6">
            {/* Progress Bar */}
            <Card className="glass-card">
              <CardContent className="py-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Processo de Implantação</span>
                  <span className="text-sm text-muted-foreground">{currentStep} de {workflowSteps.length}</span>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between mt-4">
                  {workflowSteps.map((step, index) => (
                    <div 
                      key={step.id}
                      className={`flex flex-col items-center ${
                        index + 1 <= currentStep ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 text-sm font-medium ${
                        index + 1 < currentStep ? 'bg-primary text-primary-foreground' :
                        index + 1 === currentStep ? 'bg-primary/20 border-2 border-primary' :
                        'bg-muted'
                      }`}>
                        {index + 1 < currentStep ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                      </div>
                      <span className="text-xs hidden md:block">{step.title}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Step Content */}
            {renderWorkflowStep()}

            {/* Navigation */}
            {currentStep < 4 && (
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                  disabled={currentStep === 1}
                >
                  Voltar
                </Button>
                <Button 
                  onClick={() => {
                    if (currentStep === 3) {
                      handleAIAnalysis();
                    } else {
                      setCurrentStep(prev => prev + 1);
                    }
                  }}
                  disabled={!canProceed() || aiLoading}
                >
                  {currentStep === 3 ? (
                    <>
                      <Bot className="h-4 w-4 mr-2" />
                      Analisar com IA
                    </>
                  ) : (
                    <>
                      Próximo
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
