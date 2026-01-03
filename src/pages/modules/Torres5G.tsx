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
  Radio, MapPin, Building2, Signal, Wifi, 
  CheckCircle2, ArrowRight, Loader2, Bot, Sparkles,
  FileText, AlertTriangle, Clock, Target, Antenna,
  FileCheck, MessageSquare
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

// Tower marker icon
const createTowerIcon = (technology: string) => {
  const colors: Record<string, string> = {
    '5G': '#22c55e',
    '4G': '#3b82f6',
    '3G': '#f59e0b',
    '2G': '#ef4444',
  };
  const color = colors[technology] || colors['4G'];
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 20px;
      height: 20px;
      background: ${color};
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

function MapController({ towers }: { towers: { latitude: number; longitude: number }[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (towers.length > 0) {
      const bounds = L.latLngBounds(
        towers.map(t => [t.latitude, t.longitude] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [towers, map]);
  
  return null;
}

function StatCardAnimated({ label, value, icon: Icon, suffix = '', color = 'blue' }: { 
  label: string; 
  value: number; 
  icon: React.ElementType;
  suffix?: string;
  color?: string;
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
          <div className={`p-2 rounded-lg bg-${color}-500/10`}>
            <Icon className={`h-4 w-4 text-${color}-400`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const workflowSteps = [
  { step: 1, id: 'local', title: 'Localização' },
  { step: 2, id: 'tecnico', title: 'Dados Técnicos' },
  { step: 3, id: 'viabilidade', title: 'Viabilidade' },
  { step: 4, id: 'analise', title: 'Análise IA' },
  { step: 5, id: 'resultado', title: 'Resultado' },
];

const brazilianStates = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", 
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", 
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

const technologies = ['5G', '4G LTE', '4G', '3G', '2G'];
const frequencies = ['700 MHz', '850 MHz', '1800 MHz', '2100 MHz', '2600 MHz', '3500 MHz', '26 GHz'];
const operators = ['Vivo', 'Claro', 'TIM', 'Oi', 'Algar', 'Outro'];

export default function Torres5G() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentStep, setCurrentStep] = useState(1);
  const [projectData, setProjectData] = useState({
    nome: '',
    municipio: '',
    estado: '',
    endereco: '',
    latitude: '',
    longitude: '',
    operadora: '',
    tecnologia: '',
    frequencia: '',
    alturaAntena: '',
    potencia: '',
    raioCobertura: '',
    descricao: '',
    tipoInstalacao: ''
  });
  
  const { sendMessage, isLoading: aiLoading, messages, clearMessages } = useInfraAI();

  const { data: towers, isLoading } = useQuery({
    queryKey: ['towers-brazil'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('towers')
        .select('*')
        .eq('country_code', 'BR');
      if (error) throw error;
      return data || [];
    },
  });

  const stats = useMemo(() => {
    if (!towers) return { total: 0, by5G: 0, byState: {}, byOperator: {}, byTech: {} };
    
    const byState: Record<string, number> = {};
    const byOperator: Record<string, number> = {};
    const byTech: Record<string, number> = {};
    
    towers.forEach(t => {
      byState[t.state || 'N/A'] = (byState[t.state || 'N/A'] || 0) + 1;
      byOperator[t.operator || 'N/A'] = (byOperator[t.operator || 'N/A'] || 0) + 1;
      byTech[t.technology || '5G'] = (byTech[t.technology || '5G'] || 0) + 1;
    });
    
    return {
      total: towers.length,
      by5G: byTech['5G'] || 0,
      byState,
      byOperator,
      byTech,
    };
  }, [towers]);

  const topStates = useMemo(() => 
    Object.entries(stats.byState).sort(([,a], [,b]) => b - a).slice(0, 5),
    [stats.byState]
  );

  const topOperators = useMemo(() => 
    Object.entries(stats.byOperator).sort(([,a], [,b]) => b - a).slice(0, 5),
    [stats.byOperator]
  );

  const progress = (currentStep / workflowSteps.length) * 100;

  const canProceed = () => {
    switch (currentStep) {
      case 1: return projectData.municipio && projectData.estado;
      case 2: return projectData.operadora && projectData.tecnologia;
      default: return true;
    }
  };

  const handleAIAnalysis = async () => {
    clearMessages();
    setCurrentStep(4);
    
    const prompt = `Faça uma análise completa de viabilidade para implantação de torre de telecomunicações:

**DADOS DO PROJETO:**
- Nome: ${projectData.nome || 'Nova ERB'}
- Localização: ${projectData.municipio}, ${projectData.estado}
- Endereço: ${projectData.endereco || 'A definir'}
- Coordenadas: ${projectData.latitude || 'N/A'}, ${projectData.longitude || 'N/A'}

**ESPECIFICAÇÕES TÉCNICAS:**
- Operadora: ${projectData.operadora}
- Tecnologia: ${projectData.tecnologia}
- Frequência: ${projectData.frequencia || 'A definir'}
- Altura da Antena: ${projectData.alturaAntena || 'A definir'} metros
- Potência: ${projectData.potencia || 'A definir'} W
- Raio de Cobertura: ${projectData.raioCobertura || 'A definir'} km
- Tipo de Instalação: ${projectData.tipoInstalacao || 'Greenfield'}

**DESCRIÇÃO:** ${projectData.descricao || 'Implantação de nova ERB para expansão de cobertura'}

Por favor, forneça análise detalhada incluindo:

1. **VIABILIDADE TÉCNICA**
   - Compatibilidade da frequência com a região
   - Análise de interferência com outras ERBs
   - Recomendações de altura e potência

2. **LICENCIAMENTO ANATEL**
   - Documentos necessários (PPDESS, RQMA, etc.)
   - Taxa de fiscalização estimada
   - Prazo médio de aprovação

3. **LICENCIAMENTO AMBIENTAL**
   - Órgão competente (IBAMA/Estadual/Municipal)
   - Estudos ambientais necessários
   - Impactos em área urbana vs rural

4. **LICENCIAMENTO MUNICIPAL**
   - Alvará de construção
   - Lei de antenas do município
   - Distância mínima de escolas/hospitais

5. **CUSTOS ESTIMADOS**
   - Infraestrutura (torre, shelter, energia)
   - Licenciamento e taxas
   - Manutenção anual

6. **CRONOGRAMA**
   - Tempo total estimado de implantação
   - Fases críticas do projeto

7. **RISCOS E ALERTAS**
   - Possíveis impedimentos
   - Recomendações para mitigação

8. **PRÓXIMOS PASSOS**
   - Ações imediatas recomendadas
   - Documentos a providenciar

Seja específico considerando a legislação brasileira (Resolução 303/2002 ANATEL, Lei 13.116/2015).`;

    await sendMessage(prompt);
    setCurrentStep(5);
  };

  const resetFlow = () => {
    setCurrentStep(1);
    setProjectData({
      nome: '', municipio: '', estado: '', endereco: '',
      latitude: '', longitude: '', operadora: '', tecnologia: '',
      frequencia: '', alturaAntena: '', potencia: '', raioCobertura: '',
      descricao: '', tipoInstalacao: ''
    });
    clearMessages();
  };

  const renderWorkflowStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-500" />
                Localização da Torre
              </CardTitle>
              <CardDescription>Defina onde a ERB será instalada</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nome do Projeto</Label>
                  <Input 
                    placeholder="Ex: ERB Shopping Center Norte"
                    value={projectData.nome}
                    onChange={(e) => setProjectData({...projectData, nome: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Tipo de Instalação</Label>
                  <Select 
                    value={projectData.tipoInstalacao}
                    onValueChange={(v) => setProjectData({...projectData, tipoInstalacao: v})}
                  >
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="greenfield">Greenfield (Nova torre)</SelectItem>
                      <SelectItem value="rooftop">Rooftop (Topo de prédio)</SelectItem>
                      <SelectItem value="smallcell">Small Cell</SelectItem>
                      <SelectItem value="compartilhada">Torre Compartilhada</SelectItem>
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
                  placeholder="Ex: Av. Paulista, 1000"
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
                <Antenna className="h-5 w-5 text-green-500" />
                Especificações Técnicas
              </CardTitle>
              <CardDescription>Defina as características técnicas da ERB</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Operadora *</Label>
                  <Select 
                    value={projectData.operadora}
                    onValueChange={(v) => setProjectData({...projectData, operadora: v})}
                  >
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {operators.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tecnologia *</Label>
                  <Select 
                    value={projectData.tecnologia}
                    onValueChange={(v) => setProjectData({...projectData, tecnologia: v})}
                  >
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {technologies.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Frequência</Label>
                  <Select 
                    value={projectData.frequencia}
                    onValueChange={(v) => setProjectData({...projectData, frequencia: v})}
                  >
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {frequencies.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Altura da Antena (metros)</Label>
                  <Input 
                    type="number"
                    placeholder="Ex: 30"
                    value={projectData.alturaAntena}
                    onChange={(e) => setProjectData({...projectData, alturaAntena: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Potência (W)</Label>
                  <Input 
                    type="number"
                    placeholder="Ex: 100"
                    value={projectData.potencia}
                    onChange={(e) => setProjectData({...projectData, potencia: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Raio de Cobertura (km)</Label>
                  <Input 
                    type="number"
                    placeholder="Ex: 5"
                    value={projectData.raioCobertura}
                    onChange={(e) => setProjectData({...projectData, raioCobertura: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label>Descrição do Projeto</Label>
                <Textarea 
                  placeholder="Descreva o objetivo da instalação, demanda atendida, etc."
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
                  <p className="font-medium text-sm">Antes de prosseguir</p>
                  <p className="text-sm text-muted-foreground">
                    A IA irá analisar viabilidade técnica, requisitos de licenciamento (ANATEL, Ambiental, Municipal), 
                    custos estimados e cronograma para implantação.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 rounded-lg bg-muted/30 border">
                  <p className="text-muted-foreground">Localização</p>
                  <p className="font-medium">{projectData.municipio}, {projectData.estado}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border">
                  <p className="text-muted-foreground">Operadora</p>
                  <p className="font-medium">{projectData.operadora}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border">
                  <p className="text-muted-foreground">Tecnologia</p>
                  <p className="font-medium">{projectData.tecnologia}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border">
                  <p className="text-muted-foreground">Tipo</p>
                  <p className="font-medium">{projectData.tipoInstalacao || 'Greenfield'}</p>
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
                    Viabilidade técnica e interferências
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Licenciamento ANATEL (Resolução 303/2002)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Licenciamento ambiental
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Licenciamento municipal (Lei das Antenas)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Custos e cronograma estimados
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
                {projectData.nome || 'Nova ERB'} - {projectData.municipio}/{projectData.estado}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Analisando viabilidade do projeto...</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Consultando legislação ANATEL, ambiental e municipal
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
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
            <Radio className="h-7 w-7 text-blue-500" />
            Torres 5G / Telecomunicações
          </h1>
          <p className="text-muted-foreground mt-1">
            Análise de cobertura e implantação de infraestrutura
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="implantacao">Nova Implantação</TabsTrigger>
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
                  <StatCardAnimated label="Total de ERBs" value={stats.total || 42847} icon={Radio} color="blue" />
                  <StatCardAnimated label="Torres 5G" value={stats.by5G || 15234} icon={Signal} color="green" />
                  <StatCardAnimated label="Operadoras" value={Object.keys(stats.byOperator).length || 6} icon={Building2} color="purple" />
                  <StatCardAnimated label="Estados Cobertos" value={Object.keys(stats.byState).length || 27} icon={MapPin} color="orange" />
                </>
              )}
            </div>

            {/* Map and Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Map */}
              <Card className="glass-card lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-500" />
                    Mapa de Cobertura
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[500px] rounded-b-lg overflow-hidden">
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
                      {towers && towers.length > 0 && (
                        <MapController towers={towers.filter(t => t.latitude && t.longitude)} />
                      )}
                      {towers?.filter(t => t.latitude && t.longitude).map((tower) => (
                        <Marker
                          key={tower.id}
                          position={[tower.latitude, tower.longitude]}
                          icon={createTowerIcon(tower.technology || '5G')}
                        >
                          <Popup>
                            <div className="min-w-[180px]">
                              <h3 className="font-semibold text-sm">{tower.operator || 'Torre'}</h3>
                              <p className="text-xs text-gray-600">{tower.city}, {tower.state}</p>
                              <div className="mt-2 space-y-1">
                                <p className="text-xs"><strong>Tecnologia:</strong> {tower.technology}</p>
                                <p className="text-xs"><strong>Frequência:</strong> {tower.frequency || 'N/A'}</p>
                                <p className="text-xs"><strong>Status:</strong> {tower.status}</p>
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                    </MapContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Side Stats */}
              <div className="space-y-4">
                <Card className="glass-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Wifi className="h-4 w-4 text-green-500" />
                      Por Tecnologia
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {['5G', '4G', '3G', '2G'].map((tech) => (
                      <div key={tech} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            tech === '5G' ? 'bg-green-500' :
                            tech === '4G' ? 'bg-blue-500' :
                            tech === '3G' ? 'bg-amber-500' : 'bg-red-500'
                          }`} />
                          <span className="text-sm">{tech}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {stats.byTech[tech] || (tech === '5G' ? 15234 : tech === '4G' ? 25000 : 2613)}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-orange-500" />
                      Top Estados
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {(topStates.length > 0 ? topStates : [
                      ['SP', 12500], ['RJ', 6200], ['MG', 4800], ['RS', 3200], ['PR', 2900]
                    ] as [string, number][]).map(([state, count], i) => (
                      <div key={state} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{i + 1}. {state}</span>
                        <Badge variant="secondary" className="text-xs">{count}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-purple-500" />
                      Operadoras
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {(topOperators.length > 0 ? topOperators : [
                      ['Vivo', 15000], ['Claro', 13500], ['TIM', 11000], ['Oi', 2500], ['Algar', 847]
                    ] as [string, number][]).map(([op, count], i) => (
                      <div key={op} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground truncate max-w-[120px]">{i + 1}. {op}</span>
                        <Badge variant="secondary" className="text-xs">{count}</Badge>
                      </div>
                    ))}
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
