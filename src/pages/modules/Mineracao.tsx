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
  Mountain, Factory, Gem, Truck, Building, HardHat,
  CheckCircle2, ArrowRight, Loader2, Bot, Sparkles, FileText, 
  AlertTriangle, Target, FileCheck, MapPin
} from 'lucide-react';
import { useInfraAI } from '@/hooks/useInfraAI';
import { toast } from 'sonner';

const subcategories = [
  { id: 'extracao', title: 'Mineração', icon: Mountain, color: 'bg-stone-500', desc: 'Extração mineral a céu aberto e subterrânea' },
  { id: 'infraestrutura', title: 'Infraestrutura Mineral', icon: Factory, color: 'bg-stone-600', desc: 'Usinas de beneficiamento e processamento' },
  { id: 'patrimonial', title: 'Patrimonial', icon: Building, color: 'bg-amber-600', desc: 'Gestão de patrimônio mineral' },
  { id: 'jazidas', title: 'Jazidas e Minas', icon: Gem, color: 'bg-purple-500', desc: 'Pesquisa e desenvolvimento de jazidas' },
  { id: 'logistica', title: 'Logística Mineral', icon: Truck, color: 'bg-orange-500', desc: 'Transporte e escoamento' },
  { id: 'concessao', title: 'Áreas de Concessão', icon: HardHat, color: 'bg-emerald-500', desc: 'Gestão de títulos e direitos minerários' },
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
  extracao: { 
    label: 'Extração',
    subtypes: ['Mina a Céu Aberto', 'Mina Subterrânea', 'Lavra de Aluvião', 'Garimpo', 'Pedreira'] 
  },
  infraestrutura: { 
    label: 'Infraestrutura',
    subtypes: ['Usina de Beneficiamento', 'Planta de Pelotização', 'Concentrador', 'Barragem de Rejeitos', 'Pilha de Estéril'] 
  },
  patrimonial: { 
    label: 'Patrimonial',
    subtypes: ['Aquisição de Direitos', 'Joint Venture', 'Cessão de Direitos', 'Arrendamento'] 
  },
  jazidas: { 
    label: 'Jazidas',
    subtypes: ['Pesquisa Mineral', 'Avaliação de Recursos', 'Estudo de Pré-Viabilidade', 'Estudo de Viabilidade (FS)'] 
  },
  logistica: { 
    label: 'Logística',
    subtypes: ['Mineroduto', 'Correia Transportadora', 'Terminal Portuário', 'Ramal Ferroviário'] 
  },
  concessao: { 
    label: 'Concessão',
    subtypes: ['Requerimento de Pesquisa', 'Portaria de Lavra', 'Licenciamento', 'PLG', 'Guia de Utilização'] 
  },
};

const mineralTypes = [
  "Minério de Ferro", "Bauxita", "Manganês", "Ouro", "Cobre", 
  "Níquel", "Nióbio", "Lítio", "Fosfato", "Potássio",
  "Calcário", "Granito", "Areia", "Argila", "Gipsita",
  "Caulim", "Grafita", "Terras Raras", "Diamante", "Estanho"
];

export default function Mineracao() {
  const [activeTab, setActiveTab] = useState('categorias');
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [projectData, setProjectData] = useState({
    nome: '',
    subtipo: '',
    municipio: '',
    estado: '',
    mineral: '',
    capacidade: '',
    unidadeCapacidade: 'Mtpa',
    areaHa: '',
    processoANM: '',
    metodoLavra: '',
    descricao: '',
  });
  
  const { sendMessage, isLoading: aiLoading, messages, clearMessages } = useInfraAI();

  const progress = (currentStep / workflowSteps.length) * 100;

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedCategory !== null && projectData.mineral;
      case 2: return projectData.municipio && projectData.estado;
      case 3: return projectData.capacidade || projectData.areaHa;
      default: return true;
    }
  };

  const handleAIAnalysis = async () => {
    clearMessages();
    setCurrentStep(4);
    
    const categoryInfo = subcategories.find(c => c.id === selectedCategory);
    const typeInfo = projectTypes[selectedCategory || ''];
    
    const prompt = `Faça uma análise completa de viabilidade para projeto de mineração:

**TIPO DE PROJETO:** ${categoryInfo?.title || selectedCategory}
**SUBTIPO:** ${projectData.subtipo || typeInfo?.subtypes[0] || 'A definir'}

**DADOS DO PROJETO:**
- Nome: ${projectData.nome || 'Novo Projeto de Mineração'}
- Localização: ${projectData.municipio}, ${projectData.estado}
- Substância Mineral: ${projectData.mineral}
- Capacidade: ${projectData.capacidade} ${projectData.unidadeCapacidade}
${projectData.areaHa ? `- Área: ${projectData.areaHa} hectares` : ''}
${projectData.processoANM ? `- Processo ANM: ${projectData.processoANM}` : ''}
${projectData.metodoLavra ? `- Método de Lavra: ${projectData.metodoLavra}` : ''}

**DESCRIÇÃO:** ${projectData.descricao || 'Implantação de novo empreendimento minerário'}

Por favor, forneça análise detalhada incluindo:

1. **REGULAÇÃO ANM**
   - Regime de aproveitamento (Concessão, Licenciamento, PLG)
   - Fases do processo (Pesquisa → Lavra)
   - PAE - Plano de Aproveitamento Econômico
   - RAL - Relatório Anual de Lavra
   - CFEM - compensação financeira
   - Taxa Anual por Hectare (TAH)

2. **LICENCIAMENTO AMBIENTAL**
   - Órgão competente (IBAMA/Estadual)
   - Estudos necessários (EIA/RIMA, PCA, RCA, PRAD)
   - Licenças: LP, LI, LO
   - Condicionantes típicas
   - Prazo estimado

3. **ASPECTOS DE SEGURANÇA**
   - PNSB - Política Nacional de Segurança de Barragens (se aplicável)
   - NR-22 - Segurança e Saúde na Mineração
   - Plano de Emergência
   - Auditoria de barragens

4. **ASPECTOS TÉCNICOS**
   - Método de lavra recomendado
   - Processamento e beneficiamento
   - Gestão de rejeitos e estéril
   - Fechamento de mina (PRAD)

5. **CUSTOS ESTIMADOS**
   - CAPEX (R$/t de capacidade)
   - OPEX (R$/t produzida)
   - Sustaining CAPEX
   - Provisão para fechamento

6. **CRONOGRAMA**
   - Pesquisa: X meses
   - Licenciamento: X meses
   - Implantação: X meses
   - Operação: X anos
   - Fechamento: X anos

7. **RISCOS E RECOMENDAÇÕES**
   - Riscos geológicos
   - Riscos ambientais
   - Riscos sociais
   - Recomendações estratégicas

Considere legislação brasileira: Código de Mineração (Decreto-Lei 227/67), Lei 13.575/17 (ANM), PNSB (Lei 12.334/10), Resolução ANM 95/2022 (barragens).`;

    await sendMessage(prompt);
    setCurrentStep(5);
  };

  const resetFlow = () => {
    setCurrentStep(1);
    setSelectedCategory(null);
    setProjectData({
      nome: '', subtipo: '', municipio: '', estado: '', mineral: '',
      capacidade: '', unidadeCapacidade: 'Mtpa', areaHa: '',
      processoANM: '', metodoLavra: '', descricao: ''
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
                    placeholder="Ex: Mina Serra Norte S11D"
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
                  <Label>Substância Mineral *</Label>
                  <Select 
                    value={projectData.mineral}
                    onValueChange={(v) => setProjectData({...projectData, mineral: v})}
                  >
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {mineralTypes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Processo ANM</Label>
                  <Input 
                    placeholder="Ex: 830.123/2024"
                    value={projectData.processoANM}
                    onChange={(e) => setProjectData({...projectData, processoANM: e.target.value})}
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
                <MapPin className="h-5 w-5 text-blue-500" />
                Localização do Empreendimento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Município *</Label>
                  <Input 
                    placeholder="Ex: Canaã dos Carajás"
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
                <Label>Área Total (hectares)</Label>
                <Input 
                  type="number"
                  placeholder="Ex: 5000"
                  value={projectData.areaHa}
                  onChange={(e) => setProjectData({...projectData, areaHa: e.target.value})}
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
                <Mountain className="h-5 w-5 text-stone-500" />
                Dados Técnicos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label>Capacidade de Produção *</Label>
                  <Input 
                    type="number"
                    placeholder="Ex: 90"
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
                      <SelectItem value="Mtpa">Mtpa (milhões t/ano)</SelectItem>
                      <SelectItem value="ktpa">ktpa (mil t/ano)</SelectItem>
                      <SelectItem value="tpd">t/dia</SelectItem>
                      <SelectItem value="m3mes">m³/mês</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Método de Lavra</Label>
                <Select 
                  value={projectData.metodoLavra}
                  onValueChange={(v) => setProjectData({...projectData, metodoLavra: v})}
                >
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ceuaberto">Céu Aberto - Bancadas</SelectItem>
                    <SelectItem value="ceuaberto-cava">Céu Aberto - Cava</SelectItem>
                    <SelectItem value="subterraneo-camara">Subterrâneo - Câmaras e Pilares</SelectItem>
                    <SelectItem value="subterraneo-sublevel">Subterrâneo - Sublevel Stoping</SelectItem>
                    <SelectItem value="subterraneo-blockcaving">Subterrâneo - Block Caving</SelectItem>
                    <SelectItem value="aluviao">Lavra de Aluvião</SelectItem>
                    <SelectItem value="insitu">In-Situ Recovery (ISR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Descrição do Projeto</Label>
                <Textarea 
                  placeholder="Descreva o projeto, recursos, reservas, infraestrutura..."
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
                {projectData.nome || 'Novo Projeto'} - {projectData.mineral} - {projectData.municipio}/{projectData.estado}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Analisando viabilidade do projeto...</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Consultando regulação ANM, requisitos ambientais e aspectos de segurança
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
            <Mountain className="h-7 w-7 text-stone-500" />
            Mineração
          </h1>
          <p className="text-muted-foreground mt-1">
            Mineração, infraestrutura mineral e gestão patrimonial
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
