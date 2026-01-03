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
  Fuel, Ship, Factory, Droplet, Flame, ArrowUpDown, Waves,
  CheckCircle2, ArrowRight, Loader2, Bot, Sparkles, FileText, 
  AlertTriangle, Target, FileCheck, MapPin
} from 'lucide-react';
import { useInfraAI } from '@/hooks/useInfraAI';
import { toast } from 'sonner';

const subcategories = [
  { id: 'offshore', title: 'Exploração Offshore', icon: Ship, color: 'bg-amber-500', desc: 'Plataformas e campos marítimos' },
  { id: 'onshore', title: 'Exploração Onshore', icon: Fuel, color: 'bg-amber-600', desc: 'Campos terrestres de petróleo e gás' },
  { id: 'refino', title: 'Refino', icon: Factory, color: 'bg-orange-500', desc: 'Refinarias e unidades de processamento' },
  { id: 'petroquimica', title: 'Petroquímica', icon: Droplet, color: 'bg-yellow-500', desc: 'Plantas petroquímicas' },
  { id: 'dutos', title: 'Oleoduto e Gasoduto', icon: ArrowUpDown, color: 'bg-amber-400', desc: 'Dutos de transporte' },
  { id: 'tratamento', title: 'Gás - Tratamento', icon: Waves, color: 'bg-orange-400', desc: 'UPGNs e unidades de tratamento' },
  { id: 'processamento', title: 'Gás - Processamento', icon: Flame, color: 'bg-red-500', desc: 'Processamento de gás natural' },
  { id: 'distribuicao', title: 'Gás - Distribuição', icon: ArrowUpDown, color: 'bg-yellow-600', desc: 'Redes de distribuição de gás' },
];

const workflowSteps = [
  { step: 1, id: 'tipo', title: 'Tipo de Projeto' },
  { step: 2, id: 'local', title: 'Localização' },
  { step: 3, id: 'tecnico', title: 'Dados Técnicos' },
  { step: 4, id: 'analise', title: 'Análise IA' },
  { step: 5, id: 'resultado', title: 'Resultado' },
];

const brazilianStates = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", 
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", 
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

const projectTypes: Record<string, { label: string; subtypes: string[] }> = {
  offshore: { 
    label: 'Offshore',
    subtypes: ['Plataforma Fixa', 'FPSO', 'Semi-Submersível', 'Jacket', 'TLP', 'SPAR'] 
  },
  onshore: { 
    label: 'Onshore',
    subtypes: ['Campo Terrestre', 'Poços de Desenvolvimento', 'EOR/IOR', 'Gás Não-Convencional'] 
  },
  refino: { 
    label: 'Refino',
    subtypes: ['Refinaria Completa', 'Unidade de Destilação', 'FCC', 'HDT', 'Coqueamento'] 
  },
  petroquimica: { 
    label: 'Petroquímica',
    subtypes: ['Crackeador de Etileno', 'Planta de Polímeros', 'Aromáticos', 'Fertilizantes'] 
  },
  dutos: { 
    label: 'Dutos',
    subtypes: ['Oleoduto', 'Gasoduto', 'Poliduto', 'Duto de GLP', 'Flowline Submarino'] 
  },
  tratamento: { 
    label: 'Tratamento de Gás',
    subtypes: ['UPGN', 'Unidade de Dessulfurização', 'Planta de CO2', 'Unidade de Desidratação'] 
  },
  distribuicao: { 
    label: 'Distribuição',
    subtypes: ['Rede de Média Pressão', 'Rede de Baixa Pressão', 'Estação de Regulagem', 'City Gate'] 
  },
};

export default function Petroleo() {
  const [activeTab, setActiveTab] = useState('categorias');
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [projectData, setProjectData] = useState({
    nome: '',
    subtipo: '',
    municipio: '',
    estado: '',
    bacia: '',
    capacidade: '',
    unidadeCapacidade: 'bpd',
    extensao: '',
    diametro: '',
    profundidade: '',
    descricao: '',
    operador: '',
    participantes: ''
  });
  
  const { sendMessage, isLoading: aiLoading, messages, clearMessages } = useInfraAI();

  const progress = (currentStep / workflowSteps.length) * 100;

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedCategory !== null;
      case 2: return projectData.municipio && projectData.estado;
      case 3: return projectData.capacidade || projectData.extensao;
      default: return true;
    }
  };

  const handleAIAnalysis = async () => {
    clearMessages();
    setCurrentStep(4);
    
    const categoryInfo = subcategories.find(c => c.id === selectedCategory);
    const typeInfo = projectTypes[selectedCategory || ''];
    
    const prompt = `Faça uma análise completa de viabilidade para projeto de petróleo e gás:

**TIPO DE PROJETO:** ${categoryInfo?.title || selectedCategory}
**SUBTIPO:** ${projectData.subtipo || typeInfo?.subtypes[0] || 'A definir'}

**DADOS DO PROJETO:**
- Nome: ${projectData.nome || 'Novo Projeto P&G'}
- Localização: ${projectData.municipio}, ${projectData.estado}
${projectData.bacia ? `- Bacia Sedimentar: ${projectData.bacia}` : ''}
- Capacidade: ${projectData.capacidade} ${projectData.unidadeCapacidade}
${projectData.extensao ? `- Extensão: ${projectData.extensao} km` : ''}
${projectData.diametro ? `- Diâmetro: ${projectData.diametro} polegadas` : ''}
${projectData.profundidade ? `- Profundidade/LDA: ${projectData.profundidade} m` : ''}
${projectData.operador ? `- Operador: ${projectData.operador}` : ''}

**DESCRIÇÃO:** ${projectData.descricao || 'Implantação de novo empreendimento de petróleo e gás'}

Por favor, forneça análise detalhada incluindo:

1. **REGULAÇÃO ANP**
   - Rodadas de Licitação aplicáveis
   - Regime de Concessão ou Partilha
   - Certificação de reservas (DPC/ANP)
   - Declaração de Comercialidade
   - Plano de Desenvolvimento (PD)

2. **LICENCIAMENTO AMBIENTAL**
   - Órgão competente (IBAMA obrigatório para offshore)
   - Estudos ambientais necessários (EIA/RIMA, RAA, PEI)
   - Condicionantes típicas
   - Prazo estimado para cada licença

3. **SEGURANÇA OPERACIONAL (SGSO)**
   - Sistema de Gerenciamento de Segurança Operacional
   - Requisitos SGIP/SGSS
   - Certificações necessárias
   - Inspeção de instalações

4. **ASPECTOS TÉCNICOS**
   - Tecnologia recomendada
   - Infraestrutura de escoamento
   - Conexão com sistemas existentes
   - Requisitos de projeto

5. **CUSTOS ESTIMADOS**
   - CAPEX por fase
   - OPEX anual
   - Custos de abandono (provisão ARO)
   - Participações Governamentais (royalties, PE)

6. **CRONOGRAMA**
   - Exploração: X meses
   - Licenciamento: X meses
   - Desenvolvimento: X meses
   - Produção: X anos

7. **RISCOS E RECOMENDAÇÕES**
   - Riscos exploratórios
   - Riscos de mercado
   - Recomendações estratégicas

Considere legislação brasileira: Lei do Petróleo (9.478/97), Lei da Partilha (12.351/10), Resoluções ANP, CONAMA 237/97 e 23/94.`;

    await sendMessage(prompt);
    setCurrentStep(5);
  };

  const resetFlow = () => {
    setCurrentStep(1);
    setSelectedCategory(null);
    setProjectData({
      nome: '', subtipo: '', municipio: '', estado: '', bacia: '',
      capacidade: '', unidadeCapacidade: 'bpd', extensao: '', diametro: '',
      profundidade: '', descricao: '', operador: '', participantes: ''
    });
    clearMessages();
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setActiveTab('projeto');
    setCurrentStep(1);
  };

  const renderWorkflowStep = () => {
    const categoryInfo = subcategories.find(c => c.id === selectedCategory);
    const typeInfo = projectTypes[selectedCategory || ''];
    const isDutos = selectedCategory === 'dutos';
    const isOffshore = selectedCategory === 'offshore';

    switch (currentStep) {
      case 1:
        return (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {categoryInfo && <categoryInfo.icon className={`h-5 w-5 ${categoryInfo.color.replace('bg-', 'text-')}`} />}
                Tipo de Projeto - {categoryInfo?.title}
              </CardTitle>
              <CardDescription>{categoryInfo?.desc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nome do Projeto</Label>
                  <Input 
                    placeholder="Ex: Campo de Búzios - FPSO Almirante"
                    value={projectData.nome}
                    onChange={(e) => setProjectData({...projectData, nome: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Subtipo *</Label>
                  <Select 
                    value={projectData.subtipo}
                    onValueChange={(v) => setProjectData({...projectData, subtipo: v})}
                  >
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {typeInfo?.subtypes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Operador</Label>
                  <Input 
                    placeholder="Ex: Petrobras"
                    value={projectData.operador}
                    onChange={(e) => setProjectData({...projectData, operador: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Bacia Sedimentar</Label>
                  <Select 
                    value={projectData.bacia}
                    onValueChange={(v) => setProjectData({...projectData, bacia: v})}
                  >
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="santos">Santos</SelectItem>
                      <SelectItem value="campos">Campos</SelectItem>
                      <SelectItem value="espirito-santo">Espírito Santo</SelectItem>
                      <SelectItem value="sergipe-alagoas">Sergipe-Alagoas</SelectItem>
                      <SelectItem value="potiguar">Potiguar</SelectItem>
                      <SelectItem value="ceara">Ceará</SelectItem>
                      <SelectItem value="solimoes">Solimões</SelectItem>
                      <SelectItem value="parnaiba">Parnaíba</SelectItem>
                      <SelectItem value="reconcavo">Recôncavo</SelectItem>
                      <SelectItem value="foz-amazonas">Foz do Amazonas</SelectItem>
                    </SelectContent>
                  </Select>
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
                <MapPin className="h-5 w-5 text-blue-500" />
                Localização do Empreendimento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>{isOffshore ? 'Município Base' : 'Município'} *</Label>
                  <Input 
                    placeholder="Ex: Macaé"
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
              {isOffshore && (
                <div>
                  <Label>Profundidade / LDA (metros)</Label>
                  <Input 
                    type="number"
                    placeholder="Ex: 2200"
                    value={projectData.profundidade}
                    onChange={(e) => setProjectData({...projectData, profundidade: e.target.value})}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Fuel className="h-5 w-5 text-amber-500" />
                Dados Técnicos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label>Capacidade *</Label>
                  <Input 
                    type="number"
                    placeholder={isDutos ? 'Ex: 500000' : 'Ex: 150000'}
                    value={projectData.capacidade}
                    onChange={(e) => setProjectData({...projectData, capacidade: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Unidade</Label>
                  <Select 
                    value={projectData.unidadeCapacidade}
                    onValueChange={(v) => setProjectData({...projectData, unidadeCapacidade: v})}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bpd">bpd (barris/dia)</SelectItem>
                      <SelectItem value="boed">boed (óleo equiv.)</SelectItem>
                      <SelectItem value="mm3d">Mm³/d (gás)</SelectItem>
                      <SelectItem value="tpa">t/ano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {isDutos && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Extensão (km)</Label>
                    <Input 
                      type="number"
                      placeholder="Ex: 450"
                      value={projectData.extensao}
                      onChange={(e) => setProjectData({...projectData, extensao: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Diâmetro (polegadas)</Label>
                    <Select 
                      value={projectData.diametro}
                      onValueChange={(v) => setProjectData({...projectData, diametro: v})}
                    >
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6"</SelectItem>
                        <SelectItem value="8">8"</SelectItem>
                        <SelectItem value="12">12"</SelectItem>
                        <SelectItem value="16">16"</SelectItem>
                        <SelectItem value="20">20"</SelectItem>
                        <SelectItem value="24">24"</SelectItem>
                        <SelectItem value="32">32"</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div>
                <Label>Descrição do Projeto</Label>
                <Textarea 
                  placeholder="Descreva o projeto, reservas estimadas, tecnologia..."
                  value={projectData.descricao}
                  onChange={(e) => setProjectData({...projectData, descricao: e.target.value})}
                  rows={3}
                />
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
                {projectData.nome || 'Novo Projeto'} - {categoryInfo?.title} - {projectData.bacia || projectData.municipio}/{projectData.estado}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Analisando viabilidade do projeto...</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Consultando regulação ANP, requisitos IBAMA e aspectos de segurança
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
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                  <p>Erro ao carregar análise. Tente novamente.</p>
                  <Button variant="outline" className="mt-4" onClick={handleAIAnalysis}>
                    Tentar Novamente
                  </Button>
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
            <Fuel className="h-7 w-7 text-amber-500" />
            Petróleo & Gás
          </h1>
          <p className="text-muted-foreground mt-1">
            Exploração, refino, petroquímica e distribuição
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="categorias">Categorias</TabsTrigger>
            <TabsTrigger value="projeto" disabled={!selectedCategory}>
              <Target className="h-4 w-4 mr-2" />
              Novo Projeto
            </TabsTrigger>
          </TabsList>

          <TabsContent value="categorias" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {subcategories.map((sub) => (
                <Card 
                  key={sub.id} 
                  className="group cursor-pointer hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
                  onClick={() => handleCategorySelect(sub.id)}
                >
                  <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                    <div className={`w-14 h-14 rounded-xl ${sub.color}/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <sub.icon className={`h-7 w-7 ${sub.color.replace('bg-', 'text-')}`} />
                    </div>
                    <span className="font-medium text-sm">{sub.title}</span>
                    <span className="text-xs text-muted-foreground">{sub.desc}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="projeto" className="space-y-6">
            {/* Progress Bar */}
            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progresso do Projeto</span>
                  <span className="text-sm text-muted-foreground">{currentStep} de {workflowSteps.length}</span>
                </div>
                <Progress value={progress} className="h-2 mb-4" />
                <div className="flex justify-between">
                  {workflowSteps.map((step) => (
                    <div 
                      key={step.id}
                      className={`flex flex-col items-center ${
                        step.step <= currentStep ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step.step < currentStep 
                          ? 'bg-primary text-primary-foreground' 
                          : step.step === currentStep 
                            ? 'bg-primary/20 border-2 border-primary' 
                            : 'bg-muted'
                      }`}>
                        {step.step < currentStep ? <CheckCircle2 className="h-5 w-5" /> : step.step}
                      </div>
                      <span className="text-xs mt-1 hidden md:block">{step.title}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Current Step Content */}
            {renderWorkflowStep()}

            {/* Navigation Buttons */}
            {currentStep < 4 && (
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : setActiveTab('categorias')}
                >
                  Voltar
                </Button>
                <Button 
                  onClick={() => {
                    if (currentStep === 3) {
                      handleAIAnalysis();
                    } else {
                      setCurrentStep(currentStep + 1);
                    }
                  }}
                  disabled={!canProceed()}
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
