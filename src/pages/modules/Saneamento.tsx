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
  Droplets, Waves, Filter, Trash2, Recycle, Building2,
  CheckCircle2, ArrowRight, Loader2, Bot, Sparkles, FileText, 
  AlertTriangle, Target, FileCheck, MapPin
} from 'lucide-react';
import { useInfraAI } from '@/hooks/useInfraAI';
import { toast } from 'sonner';

const subcategories = [
  { id: 'agua', title: 'Saneamento - Água', icon: Droplets, color: 'bg-cyan-500', desc: 'Captação, tratamento e distribuição' },
  { id: 'esgoto', title: 'Saneamento - Esgoto', icon: Waves, color: 'bg-cyan-600', desc: 'Coleta e tratamento de esgoto' },
  { id: 'drenagem', title: 'Saneamento - Drenagem', icon: Filter, color: 'bg-blue-500', desc: 'Drenagem de águas pluviais' },
  { id: 'ete', title: 'Coleta e Tratamento', icon: Building2, color: 'bg-teal-500', desc: 'ETEs e sistemas de tratamento' },
  { id: 'residuos', title: 'Resíduos Sólidos', icon: Trash2, color: 'bg-orange-500', desc: 'Coleta, transbordo e aterros' },
  { id: 'reciclagem', title: 'Reciclagem', icon: Recycle, color: 'bg-green-500', desc: 'Centrais de triagem e reciclagem' },
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
  agua: { 
    label: 'Água',
    subtypes: ['Sistema de Captação', 'ETA - Estação de Tratamento', 'Reservatório', 'Adutora', 'Rede de Distribuição', 'Poço Profundo'] 
  },
  esgoto: { 
    label: 'Esgoto',
    subtypes: ['Rede Coletora', 'Coletor Tronco', 'Interceptor', 'Emissário', 'Estação Elevatória (EEEB)', 'Ligação Domiciliar'] 
  },
  drenagem: { 
    label: 'Drenagem',
    subtypes: ['Microdrenagem', 'Macrodrenagem', 'Piscinão/Reservatório', 'Canal de Drenagem', 'Galeria', 'Bacia de Detenção'] 
  },
  ete: { 
    label: 'Tratamento',
    subtypes: ['ETE - Lodos Ativados', 'ETE - Lagoas', 'ETE - UASB', 'ETE - MBR', 'Reúso de Água', 'Tratamento de Lodo'] 
  },
  residuos: { 
    label: 'Resíduos',
    subtypes: ['Aterro Sanitário', 'Central de Transbordo', 'Coleta Seletiva', 'Coleta Convencional', 'Unidade de Valorização Energética'] 
  },
  reciclagem: { 
    label: 'Reciclagem',
    subtypes: ['Central de Triagem', 'Cooperativa de Catadores', 'Usina de Compostagem', 'CDR - Combustível Derivado de Resíduos'] 
  },
};

export default function Saneamento() {
  const [activeTab, setActiveTab] = useState('categorias');
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [projectData, setProjectData] = useState({
    nome: '',
    subtipo: '',
    municipio: '',
    estado: '',
    populacao: '',
    capacidade: '',
    unidadeCapacidade: 'L/s',
    extensao: '',
    modeloContratual: '',
    descricao: '',
    concessionaria: ''
  });
  
  const { sendMessage, isLoading: aiLoading, messages, clearMessages } = useInfraAI();

  const progress = (currentStep / workflowSteps.length) * 100;

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedCategory !== null;
      case 2: return projectData.municipio && projectData.estado;
      case 3: return projectData.capacidade || projectData.populacao;
      default: return true;
    }
  };

  const handleAIAnalysis = async () => {
    clearMessages();
    setCurrentStep(4);
    
    const categoryInfo = subcategories.find(c => c.id === selectedCategory);
    const typeInfo = projectTypes[selectedCategory || ''];
    
    const prompt = `Faça uma análise completa de viabilidade para projeto de saneamento básico:

**TIPO DE PROJETO:** ${categoryInfo?.title || selectedCategory}
**SUBTIPO:** ${projectData.subtipo || typeInfo?.subtypes[0] || 'A definir'}

**DADOS DO PROJETO:**
- Nome: ${projectData.nome || 'Novo Projeto de Saneamento'}
- Localização: ${projectData.municipio}, ${projectData.estado}
${projectData.populacao ? `- População Atendida: ${projectData.populacao} habitantes` : ''}
- Capacidade: ${projectData.capacidade} ${projectData.unidadeCapacidade}
${projectData.extensao ? `- Extensão de Rede: ${projectData.extensao} km` : ''}
${projectData.modeloContratual ? `- Modelo Contratual: ${projectData.modeloContratual}` : ''}
${projectData.concessionaria ? `- Concessionária/Operador: ${projectData.concessionaria}` : ''}

**DESCRIÇÃO:** ${projectData.descricao || 'Implantação de novo sistema de saneamento básico'}

Por favor, forneça análise detalhada incluindo:

1. **MARCO LEGAL DO SANEAMENTO**
   - Lei 11.445/07 (Lei do Saneamento)
   - Lei 14.026/20 (Novo Marco do Saneamento)
   - Decreto 10.710/21 (Metas de universalização)
   - Metas: 99% água e 90% esgoto até 2033
   - Regionalização e blocos de saneamento

2. **REGULAÇÃO E TARIFAS**
   - Agência reguladora competente
   - Estrutura tarifária
   - Subsídios cruzados
   - Revisão tarifária periódica
   - Indicadores de desempenho

3. **LICENCIAMENTO AMBIENTAL**
   - Órgão competente
   - Estudos necessários (EIA/RIMA, RAP, etc.)
   - Outorga de recursos hídricos
   - Padrões de lançamento (CONAMA 430)
   - Condicionantes típicas

4. **ASPECTOS TÉCNICOS**
   - Tecnologia recomendada
   - Normas técnicas aplicáveis (ABNT)
   - Dimensionamento
   - Eficiência esperada
   - Indicadores operacionais

5. **MODELOS DE CONTRATAÇÃO**
   - Concessão Plena
   - PPP (Patrocinada/Administrativa)
   - Contrato de Programa
   - Prestação Direta
   - Subdelegação

6. **CUSTOS ESTIMADOS**
   - CAPEX (R$/habitante ou R$/L/s)
   - OPEX (R$/m³ ou R$/t)
   - Custos de conexão
   - Investimentos em expansão

7. **CRONOGRAMA**
   - Estudos/Projeto: X meses
   - Licenciamento: X meses
   - Licitação: X meses
   - Implantação: X meses
   - Operação: X anos

8. **FINANCIAMENTO**
   - Recursos da União (PAC, FGTS)
   - BNDES
   - Debêntures incentivadas
   - Project Finance

9. **RISCOS E RECOMENDAÇÕES**
   - Riscos de demanda
   - Riscos regulatórios
   - Inadimplência
   - Recomendações estratégicas

Considere legislação brasileira: Lei 11.445/07, Lei 14.026/20, Decreto 7.217/10, Resolução CONAMA 430/11, Portaria GM/MS 888/21.`;

    await sendMessage(prompt);
    setCurrentStep(5);
  };

  const resetFlow = () => {
    setCurrentStep(1);
    setSelectedCategory(null);
    setProjectData({
      nome: '', subtipo: '', municipio: '', estado: '', populacao: '',
      capacidade: '', unidadeCapacidade: 'L/s', extensao: '',
      modeloContratual: '', descricao: '', concessionaria: ''
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
    const isResiduos = selectedCategory === 'residuos' || selectedCategory === 'reciclagem';

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
                    placeholder="Ex: ETE Zona Sul - Fase II"
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
                  <Label>Concessionária/Operador</Label>
                  <Input 
                    placeholder="Ex: SABESP, Aegea, BRK"
                    value={projectData.concessionaria}
                    onChange={(e) => setProjectData({...projectData, concessionaria: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Modelo Contratual</Label>
                  <Select 
                    value={projectData.modeloContratual}
                    onValueChange={(v) => setProjectData({...projectData, modeloContratual: v})}
                  >
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="concessao">Concessão Plena</SelectItem>
                      <SelectItem value="ppp-patrocinada">PPP Patrocinada</SelectItem>
                      <SelectItem value="ppp-administrativa">PPP Administrativa</SelectItem>
                      <SelectItem value="contrato-programa">Contrato de Programa</SelectItem>
                      <SelectItem value="prestacao-direta">Prestação Direta</SelectItem>
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
                <Label>População Atendida (habitantes)</Label>
                <Input 
                  type="number"
                  placeholder="Ex: 500000"
                  value={projectData.populacao}
                  onChange={(e) => setProjectData({...projectData, populacao: e.target.value})}
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
                <Droplets className="h-5 w-5 text-cyan-500" />
                Dados Técnicos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label>Capacidade *</Label>
                  <Input 
                    type="number"
                    placeholder={isResiduos ? 'Ex: 1000' : 'Ex: 500'}
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
                      <SelectItem value="L/s">L/s (litros/segundo)</SelectItem>
                      <SelectItem value="m3/s">m³/s</SelectItem>
                      <SelectItem value="m3/dia">m³/dia</SelectItem>
                      <SelectItem value="t/dia">t/dia (resíduos)</SelectItem>
                      <SelectItem value="hab">habitantes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {!isResiduos && (
                <div>
                  <Label>Extensão de Rede (km)</Label>
                  <Input 
                    type="number"
                    placeholder="Ex: 150"
                    value={projectData.extensao}
                    onChange={(e) => setProjectData({...projectData, extensao: e.target.value})}
                  />
                </div>
              )}

              <div>
                <Label>Descrição do Projeto</Label>
                <Textarea 
                  placeholder="Descreva o projeto, tecnologia, área de abrangência..."
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
                {projectData.nome || 'Novo Projeto'} - {categoryInfo?.title} - {projectData.municipio}/{projectData.estado}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Analisando viabilidade do projeto...</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Consultando marco legal do saneamento, metas de universalização e requisitos técnicos
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
            <Droplets className="h-7 w-7 text-cyan-500" />
            Saneamento Básico
          </h1>
          <p className="text-muted-foreground mt-1">
            Água, esgoto, drenagem e resíduos sólidos
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
