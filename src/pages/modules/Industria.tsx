import { useState } from 'react';
import { CategoryAccordion, CategoryDropdown } from '@/components/dashboard/CategorySelector';
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
  Factory, FileStack, Boxes, Leaf, Fuel, Beaker,
  CheckCircle2, ArrowRight, Loader2, Bot, Sparkles, FileText, 
  AlertTriangle, Target, FileCheck, MapPin
} from 'lucide-react';
import { useInfraAI } from '@/hooks/useInfraAI';
import { useExportPDF } from '@/hooks/useExportPDF';
import { useProjectAnalyses } from '@/hooks/useProjectAnalyses';
import { toast } from 'sonner';

const subcategories = [
  { id: 'celulose', title: 'Papel e Celulose', icon: FileStack, color: 'bg-amber-600', desc: 'Fábricas de celulose, papel e embalagens' },
  { id: 'cimento', title: 'Cimento', icon: Boxes, color: 'bg-stone-500', desc: 'Fábricas de cimento e concreto' },
  { id: 'fertilizantes', title: 'Fertilizantes', icon: Leaf, color: 'bg-green-500', desc: 'Plantas de fertilizantes e agroquímicos' },
  { id: 'biocombustiveis', title: 'Biocombustíveis', icon: Fuel, color: 'bg-emerald-500', desc: 'Usinas de etanol, biodiesel e biogás' },
  { id: 'petroquimica', title: 'Petroquímica', icon: Beaker, color: 'bg-purple-500', desc: 'Plantas petroquímicas e polímeros' },
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
  celulose: { 
    label: 'Papel e Celulose',
    subtypes: ['Fábrica de Celulose Kraft', 'Fábrica de Celulose Solúvel', 'Fábrica de Papel', 'Fábrica de Embalagens', 'Linha de Fibras', 'Planta de Tissue'] 
  },
  cimento: { 
    label: 'Cimento',
    subtypes: ['Fábrica Integrada', 'Moagem de Cimento', 'Planta de Concreto (Batching)', 'Fábrica de Argamassa', 'Planta de Cal'] 
  },
  fertilizantes: { 
    label: 'Fertilizantes',
    subtypes: ['Planta de NPK', 'Fábrica de Fosfatados', 'Fábrica de Nitrogenados', 'Planta de Potássio', 'Defensivos Agrícolas', 'Misturadora'] 
  },
  biocombustiveis: { 
    label: 'Biocombustíveis',
    subtypes: ['Usina de Etanol 1G', 'Usina de Etanol 2G', 'Planta de Biodiesel', 'Planta de Biogás', 'Usina de Cogeração (Biomassa)', 'Planta de SAF'] 
  },
  petroquimica: { 
    label: 'Petroquímica',
    subtypes: ['Central Petroquímica', 'Planta de Polietileno', 'Planta de Polipropileno', 'Planta de PVC', 'Planta de PET', 'Planta de Resinas'] 
  },
};

export default function Industria() {
  const [activeTab, setActiveTab] = useState('categorias');
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [projectData, setProjectData] = useState({
    nome: '',
    subtipo: '',
    municipio: '',
    estado: '',
    capacidade: '',
    unidadeCapacidade: 'tpa',
    areaTerrenoHa: '',
    materiasPrimas: '',
    descricao: '',
    investidor: ''
  });
  
  const { sendMessage, isLoading: aiLoading, messages, clearMessages } = useInfraAI();
  const { exportPDF } = useExportPDF();
  const { saveAnalysis } = useProjectAnalyses();

  const progress = (currentStep / workflowSteps.length) * 100;

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedCategory !== null;
      case 2: return projectData.municipio && projectData.estado;
      case 3: return projectData.capacidade;
      default: return true;
    }
  };

  const handleAIAnalysis = async () => {
    clearMessages();
    setCurrentStep(4);
    
    const categoryInfo = subcategories.find(c => c.id === selectedCategory);
    const typeInfo = projectTypes[selectedCategory || ''];
    
    const prompt = `Faça uma análise completa de viabilidade para projeto industrial:

**TIPO DE PROJETO:** ${categoryInfo?.title || selectedCategory}
**SUBTIPO:** ${projectData.subtipo || typeInfo?.subtypes[0] || 'A definir'}

**DADOS DO PROJETO:**
- Nome: ${projectData.nome || 'Novo Projeto Industrial'}
- Localização: ${projectData.municipio}, ${projectData.estado}
- Capacidade: ${projectData.capacidade} ${projectData.unidadeCapacidade}
${projectData.areaTerrenoHa ? `- Área do Terreno: ${projectData.areaTerrenoHa} hectares` : ''}
${projectData.materiasPrimas ? `- Matérias-Primas: ${projectData.materiasPrimas}` : ''}
${projectData.investidor ? `- Investidor/Grupo: ${projectData.investidor}` : ''}

**DESCRIÇÃO:** ${projectData.descricao || 'Implantação de novo empreendimento industrial'}

Por favor, forneça análise detalhada incluindo:

1. **LICENCIAMENTO AMBIENTAL**
   - Órgão competente (IBAMA/Estadual)
   - Estudos necessários (EIA/RIMA, RAP, PCA)
   - Emissões atmosféricas (CONAMA 436/2011)
   - Gestão de efluentes (CONAMA 430/2011)
   - Gestão de resíduos sólidos (PNRS)
   - Prazo estimado para cada licença

2. **INCENTIVOS FISCAIS E TRIBUTÁRIOS**
   - Zona Franca de Manaus (se aplicável)
   - SUDAM/SUDENE
   - Incentivos estaduais/municipais
   - REIDI - Regime Especial de Incentivos
   - Lei do Bem (inovação)
   - Créditos de carbono

3. **ASPECTOS TÉCNICOS**
   - Tecnologia recomendada
   - Utilidades (água, energia, vapor, gás)
   - Logística de matérias-primas
   - Escoamento da produção
   - Normas técnicas (ABNT, NR)

4. **INFRAESTRUTURA NECESSÁRIA**
   - Acesso rodoviário/ferroviário
   - Suprimento energético
   - Abastecimento de água
   - Tratamento de efluentes
   - Área industrial/distrito industrial

5. **CUSTOS ESTIMADOS**
   - CAPEX total (R$/t de capacidade)
   - OPEX anual
   - Custos de utilidades
   - Custos logísticos
   - Capital de giro

6. **CRONOGRAMA**
   - Estudos/Engenharia: X meses
   - Licenciamento: X meses
   - Construção: X meses
   - Comissionamento: X meses
   - Ramp-up: X meses

7. **MERCADO E COMPETITIVIDADE**
   - Análise de mercado
   - Concorrência
   - Preços de referência
   - Mercado externo/exportação

8. **RISCOS E RECOMENDAÇÕES**
   - Riscos ambientais
   - Riscos de mercado
   - Riscos de suprimento
   - Recomendações estratégicas

Considere legislação brasileira: PNRS (Lei 12.305/10), Política Nacional de Biocombustíveis (RenovaBio), Lei de Incentivos Regionais, normas setoriais.`;

    await sendMessage(prompt);
    setCurrentStep(5);
  };

  const resetFlow = () => {
    setCurrentStep(1);
    setSelectedCategory(null);
    setProjectData({
      nome: '', subtipo: '', municipio: '', estado: '',
      capacidade: '', unidadeCapacidade: 'tpa', areaTerrenoHa: '',
      materiasPrimas: '', descricao: '', investidor: ''
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
                    placeholder="Ex: Planta de Celulose Veracel II"
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
              <div>
                <Label>Investidor/Grupo</Label>
                <Input 
                  placeholder="Ex: Suzano, Votorantim, Raízen"
                  value={projectData.investidor}
                  onChange={(e) => setProjectData({...projectData, investidor: e.target.value})}
                />
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
                    placeholder="Ex: Imperatriz"
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
                <Label>Área do Terreno (hectares)</Label>
                <Input 
                  type="number"
                  placeholder="Ex: 500"
                  value={projectData.areaTerrenoHa}
                  onChange={(e) => setProjectData({...projectData, areaTerrenoHa: e.target.value})}
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
                <Factory className="h-5 w-5 text-indigo-500" />
                Dados Técnicos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label>Capacidade de Produção *</Label>
                  <Input 
                    type="number"
                    placeholder="Ex: 2400000"
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
                      <SelectItem value="tpa">t/ano</SelectItem>
                      <SelectItem value="m3ano">m³/ano</SelectItem>
                      <SelectItem value="tdia">t/dia</SelectItem>
                      <SelectItem value="litrosano">litros/ano</SelectItem>
                      <SelectItem value="MW">MW (cogeração)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Matérias-Primas Principais</Label>
                <Input 
                  placeholder="Ex: Eucalipto, cana-de-açúcar, calcário"
                  value={projectData.materiasPrimas}
                  onChange={(e) => setProjectData({...projectData, materiasPrimas: e.target.value})}
                />
              </div>

              <div>
                <Label>Descrição do Projeto</Label>
                <Textarea 
                  placeholder="Descreva o projeto, tecnologia, produtos, mercado alvo..."
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
                    Consultando legislação ambiental, incentivos fiscais e requisitos setoriais
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
                    <Button onClick={() => {
                      const categoryInfo = subcategories.find(c => c.id === selectedCategory);
                      const content = messages.filter(m => m.role === 'assistant').slice(-1)[0]?.content || '';
                      saveAnalysis.mutate({ module: 'Indústria', category: categoryInfo?.title, projectName: projectData.nome || 'Novo Projeto', projectData, analysisContent: content });
                    }} disabled={saveAnalysis.isPending}>
                      <FileCheck className="h-4 w-4 mr-2" />
                      {saveAnalysis.isPending ? 'Salvando...' : 'Salvar'}
                    </Button>
                    <Button variant="outline" onClick={() => {
                      const categoryInfo = subcategories.find(c => c.id === selectedCategory);
                      const content = messages.filter(m => m.role === 'assistant').slice(-1)[0]?.content || '';
                      exportPDF({
                        title: 'Relatório de Viabilidade',
                        subtitle: categoryInfo?.title,
                        moduleName: 'Indústria',
                        projectData: { ...projectData, categoria: categoryInfo?.title, nome: projectData.nome || 'Novo Projeto' },
                        analysisContent: content,
                      });
                    }}>
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
                  <p>Erro ao gerar análise. Tente novamente.</p>
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
            <Factory className="h-7 w-7 text-indigo-500" />
            Indústria
          </h1>
          <p className="text-muted-foreground mt-1">
            Papel e celulose, cimento, fertilizantes, biocombustíveis e petroquímica
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="categorias">Categorias</TabsTrigger>
            <TabsTrigger value="projeto" disabled={!selectedCategory}>
              Projeto
              {selectedCategory && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {subcategories.find(c => c.id === selectedCategory)?.title}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="categorias" className="mt-6">
            <CategoryAccordion 
              categories={subcategories} 
              onSelect={handleCategorySelect}
              selectedCategory={selectedCategory}
            />
          </TabsContent>

          <TabsContent value="projeto" className="mt-6 space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">Categoria:</span>
              <CategoryDropdown 
                categories={subcategories} 
                value={selectedCategory} 
                onValueChange={(v) => { setSelectedCategory(v); setCurrentStep(1); }}
              />
            </div>
            {/* Progress Bar */}
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progresso</span>
                  <span className="text-sm text-muted-foreground">{currentStep} de {workflowSteps.length}</span>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between mt-2">
                  {workflowSteps.map((step) => (
                    <div key={step.id} className="flex flex-col items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                        currentStep >= step.step 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {currentStep > step.step ? <CheckCircle2 className="h-4 w-4" /> : step.step}
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1 hidden md:block">{step.title}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Current Step */}
            {renderWorkflowStep()}

            {/* Navigation Buttons */}
            {currentStep <= 3 && (
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : setActiveTab('categorias')}
                >
                  {currentStep === 1 ? 'Voltar às Categorias' : 'Voltar'}
                </Button>
                
                {currentStep < 3 ? (
                  <Button 
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={!canProceed()}
                  >
                    Próximo
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleAIAnalysis}
                    disabled={!canProceed() || aiLoading}
                    className="bg-primary"
                  >
                    {aiLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analisando...
                      </>
                    ) : (
                      <>
                        <Target className="h-4 w-4 mr-2" />
                        Analisar Viabilidade
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
