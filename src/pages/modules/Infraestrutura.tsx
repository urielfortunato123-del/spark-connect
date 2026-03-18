import { useState } from 'react';
import { CategoryGrid, CategoryDropdown as CategoryDropdownNew, SubtypeSelector, useProjectSelector } from '@/components/dashboard/ProjectSelector';
import { BRAZILIAN_STATES, DEFAULT_WORKFLOW_STEPS } from '@/data/moduleRegistry';
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
  Building, Route, Train, Ship, Plane, Truck, Warehouse,
  CheckCircle2, ArrowRight, Loader2, Bot, Sparkles, FileText, 
  AlertTriangle, Target, FileCheck, MapPin
} from 'lucide-react';
import { useInfraAI } from '@/hooks/useInfraAI';
import { useExportPDF } from '@/hooks/useExportPDF';
import { useProjectAnalyses } from '@/hooks/useProjectAnalyses';
import { toast } from 'sonner';

const MODULE_ID = 'infraestrutura' as const;

export default function Infraestrutura() {
  const { categories: subcategories, getCategoryInfo, getCategorySubtypes } = useProjectSelector(MODULE_ID);
  const workflowSteps = DEFAULT_WORKFLOW_STEPS;
  const brazilianStates = BRAZILIAN_STATES;
  const [activeTab, setActiveTab] = useState('categorias');
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [projectData, setProjectData] = useState({
    nome: '',
    subtipo: '',
    municipio: '',
    estado: '',
    capacidade: '',
    unidadeCapacidade: 'km',
    extensao: '',
    areaTerrenoHa: '',
    modeloContratual: '',
    descricao: '',
    operador: ''
  });
  
  const { sendMessage, isLoading: aiLoading, messages, clearMessages } = useInfraAI();
  const { exportPDF } = useExportPDF();
  const { saveAnalysis } = useProjectAnalyses();

  const progress = (currentStep / workflowSteps.length) * 100;

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedCategory !== null;
      case 2: return projectData.municipio && projectData.estado;
      case 3: return projectData.capacidade || projectData.extensao || projectData.areaTerrenoHa;
      default: return true;
    }
  };

  const handleAIAnalysis = async () => {
    clearMessages();
    setCurrentStep(4);
    
    const categoryInfo = getCategoryInfo(selectedCategory);
    
    
    const prompt = `Faça uma análise completa de viabilidade para projeto de infraestrutura e transportes:

**TIPO DE PROJETO:** ${categoryInfo?.title || selectedCategory}
**SUBTIPO:** ${projectData.subtipo || 'A definir'}

**DADOS DO PROJETO:**
- Nome: ${projectData.nome || 'Novo Projeto de Infraestrutura'}
- Localização: ${projectData.municipio}, ${projectData.estado}
- Capacidade: ${projectData.capacidade} ${projectData.unidadeCapacidade}
${projectData.extensao ? `- Extensão: ${projectData.extensao} km` : ''}
${projectData.areaTerrenoHa ? `- Área do Terreno: ${projectData.areaTerrenoHa} hectares` : ''}
${projectData.modeloContratual ? `- Modelo Contratual: ${projectData.modeloContratual}` : ''}
${projectData.operador ? `- Operador/Concessionária: ${projectData.operador}` : ''}

**DESCRIÇÃO:** ${projectData.descricao || 'Implantação de novo empreendimento de infraestrutura'}

Por favor, forneça análise detalhada incluindo:

1. **REGULAÇÃO E CONCESSÃO**
   - Órgão regulador (ANTT, ANTAQ, ANAC, DNIT)
   - Modelo de concessão/PPP/autorização
   - Requisitos de licitação
   - Prazo de concessão
   - Obrigações contratuais

2. **LICENCIAMENTO AMBIENTAL**
   - Órgão competente (IBAMA/Estadual)
   - Estudos necessários (EIA/RIMA, RAP, PBA)
   - Condicionantes típicas
   - Faixa de domínio / área de influência
   - Prazo estimado para cada licença

3. **ASPECTOS TÉCNICOS**
   - Projeto geométrico / layout
   - Especificações técnicas (DNIT, ABNT)
   - Capacidade de tráfego / movimentação
   - Tecnologia recomendada
   - Integração com sistemas existentes

4. **DESAPROPRIAÇÃO E INTERFERÊNCIAS**
   - Faixa de domínio necessária
   - Estimativa de desapropriações
   - Remanejamento de utilidades
   - Comunidades afetadas

5. **CUSTOS ESTIMADOS**
   - CAPEX por fase (R$/km ou R$/m²)
   - OPEX anual estimado
   - Custos de desapropriação
   - Investimentos em segurança

6. **CRONOGRAMA**
   - Estudos/Projeto: X meses
   - Licenciamento: X meses
   - Licitação: X meses
   - Construção: X meses
   - Operação: X anos

7. **FINANCIAMENTO**
   - Recursos federais (PAC, BNDES)
   - Pedágio / tarifas
   - Project Finance
   - Debêntures incentivadas

8. **RISCOS E RECOMENDAÇÕES**
   - Riscos de demanda
   - Riscos de construção
   - Riscos regulatórios
   - Recomendações estratégicas

Considere legislação brasileira: Lei 8.987/95 (Concessões), Lei 11.079/04 (PPPs), Lei 10.233/01 (ANTT/ANTAQ), Marco Legal do Transporte Ferroviário, PNL.`;

    await sendMessage(prompt);
    setCurrentStep(5);
  };

  const resetFlow = () => {
    setCurrentStep(1);
    setSelectedCategory(null);
    setProjectData({
      nome: '', subtipo: '', municipio: '', estado: '',
      capacidade: '', unidadeCapacidade: 'km', extensao: '',
      areaTerrenoHa: '', modeloContratual: '', descricao: '', operador: ''
    });
    clearMessages();
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setProjectData((current) => ({ ...current, subtipo: '' }));
    setActiveTab('projeto');
    setCurrentStep(1);
  };

  const renderWorkflowStep = () => {
    const categoryInfo = getCategoryInfo(selectedCategory);
    
    const isLinear = selectedCategory === 'rodovias' || selectedCategory === 'ferrovias';
    const isTerminal = selectedCategory === 'portos' || selectedCategory === 'aeroportos' || selectedCategory === 'armazenamento';

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
                    placeholder="Ex: BR-101/NE - Duplicação"
                    value={projectData.nome}
                    onChange={(e) => setProjectData({...projectData, nome: e.target.value})}
                  />
                </div>
                <SubtypeSelector
                  moduleId={MODULE_ID}
                  categoryId={selectedCategory}
                  value={projectData.subtipo}
                  onValueChange={(v) => setProjectData({...projectData, subtipo: v})}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Operador/Concessionária</Label>
                  <Input 
                    placeholder="Ex: CCR, EcoRodovias, DNIT"
                    value={projectData.operador}
                    onChange={(e) => setProjectData({...projectData, operador: e.target.value})}
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
                      <SelectItem value="concessao">Concessão</SelectItem>
                      <SelectItem value="ppp">PPP</SelectItem>
                      <SelectItem value="autorizacao">Autorização</SelectItem>
                      <SelectItem value="obra-publica">Obra Pública</SelectItem>
                      <SelectItem value="arrendamento">Arrendamento Portuário</SelectItem>
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
                    placeholder="Ex: Santos"
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
              {isTerminal && (
                <div>
                  <Label>Área do Terreno (hectares)</Label>
                  <Input 
                    type="number"
                    placeholder="Ex: 200"
                    value={projectData.areaTerrenoHa}
                    onChange={(e) => setProjectData({...projectData, areaTerrenoHa: e.target.value})}
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
                <Building className="h-5 w-5 text-blue-500" />
                Dados Técnicos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label>{isLinear ? 'Extensão' : 'Capacidade'} *</Label>
                  <Input 
                    type="number"
                    placeholder={isLinear ? 'Ex: 450' : 'Ex: 50000'}
                    value={isLinear ? projectData.extensao : projectData.capacidade}
                    onChange={(e) => isLinear 
                      ? setProjectData({...projectData, extensao: e.target.value})
                      : setProjectData({...projectData, capacidade: e.target.value})
                    }
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
                      <SelectItem value="km">km</SelectItem>
                      <SelectItem value="TEU/ano">TEU/ano (contêineres)</SelectItem>
                      <SelectItem value="t/ano">t/ano (carga)</SelectItem>
                      <SelectItem value="pax/ano">passageiros/ano</SelectItem>
                      <SelectItem value="veic/dia">veículos/dia</SelectItem>
                      <SelectItem value="m2">m² (área)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {!isLinear && (
                <div>
                  <Label>Extensão de acesso (km)</Label>
                  <Input 
                    type="number"
                    placeholder="Ex: 15"
                    value={projectData.extensao}
                    onChange={(e) => setProjectData({...projectData, extensao: e.target.value})}
                  />
                </div>
              )}

              <div>
                <Label>Descrição do Projeto</Label>
                <Textarea 
                  placeholder="Descreva o projeto, trechos, infraestrutura de apoio..."
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
                    Consultando regulação ANTT/ANTAQ/ANAC, requisitos DNIT e aspectos ambientais
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
                      const categoryInfo = getCategoryInfo(selectedCategory);
                      const content = messages.filter(m => m.role === 'assistant').slice(-1)[0]?.content || '';
                      saveAnalysis.mutate({ module: 'Infraestrutura', category: categoryInfo?.title, projectName: projectData.nome || 'Novo Projeto', projectData, analysisContent: content });
                    }} disabled={saveAnalysis.isPending}>
                      <FileCheck className="h-4 w-4 mr-2" />
                      {saveAnalysis.isPending ? 'Salvando...' : 'Salvar'}
                    </Button>
                    <Button variant="outline" onClick={() => {
                      const categoryInfo = getCategoryInfo(selectedCategory);
                      const content = messages.filter(m => m.role === 'assistant').slice(-1)[0]?.content || '';
                      exportPDF({
                        title: 'Relatório de Viabilidade',
                        subtitle: categoryInfo?.title,
                        moduleName: 'Infraestrutura',
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
            <Building className="h-7 w-7 text-blue-500" />
            Infraestrutura & Transportes
          </h1>
          <p className="text-muted-foreground mt-1">
            Rodovias, ferrovias, portos, aeroportos e logística
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="categorias">Categorias</TabsTrigger>
            <TabsTrigger value="projeto" disabled={!selectedCategory}>
              Projeto
              {selectedCategory && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {getCategoryInfo(selectedCategory)?.title}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="categorias" className="mt-6">
            <CategoryGrid
              moduleId={MODULE_ID}
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategorySelect}
            />
          </TabsContent>

          <TabsContent value="projeto" className="mt-6 space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">Categoria:</span>
              <CategoryDropdownNew
                moduleId={MODULE_ID}
                value={selectedCategory}
                onValueChange={(v) => {
                  setSelectedCategory(v);
                  setProjectData((current) => ({ ...current, subtipo: '' }));
                  setCurrentStep(1);
                }}
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
