import { useState } from 'react';
import { CategoryGrid, CategoryDropdown as CategoryDropdownNew, SubtypeSelector, useProjectSelector } from '@/components/dashboard/ProjectSelector';
import { BRAZILIAN_STATES, DEFAULT_WORKFLOW_STEPS } from '@/data/moduleRegistry';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  TreePine,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Bot,
  Sparkles,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';
import { useInfraAI } from '@/hooks/useInfraAI';
import { useExportPDF } from '@/hooks/useExportPDF';
import { useProjectAnalyses } from '@/hooks/useProjectAnalyses';
import { toast } from 'sonner';

const MODULE_ID = 'ambiental' as const;

export default function Ambiental() {
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
    area: '',
    descricao: '',
  });

  const { sendMessage, isLoading, messages, clearMessages } = useInfraAI();
  const { exportPDF } = useExportPDF();
  const { saveAnalysis } = useProjectAnalyses();

  const progress = (currentStep / workflowSteps.length) * 100;

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedCategory !== null;
      case 2: return projectData.municipio && projectData.estado;
      case 3: return projectData.nome;
      default: return true;
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setProjectData((prev) => ({ ...prev, subtipo: '' }));
    setActiveTab('licenciamento');
    const cat = getCategoryInfo(categoryId);
    toast.info(`Categoria: ${cat?.title}`);
  };

  const handleAIAnalysis = async () => {
    clearMessages();
    setCurrentStep(4);
    const categoryInfo = getCategoryInfo(selectedCategory);

    const prompt = `Faça uma análise completa de licenciamento/gestão ambiental:

**CATEGORIA:** ${categoryInfo?.title || selectedCategory}
**SUBTIPO:** ${projectData.subtipo || 'A definir'}
**PROJETO:** ${projectData.nome}
**LOCALIZAÇÃO:** ${projectData.municipio}, ${projectData.estado}
**ÁREA:** ${projectData.area}
**DESCRIÇÃO:** ${projectData.descricao}

Forneça:
1. **Enquadramento Legal** - Leis e resoluções aplicáveis
2. **Órgão Competente** - IBAMA, CETESB, órgão estadual, etc.
3. **Documentos Necessários** - Lista detalhada
4. **Estudos Ambientais** - EIA/RIMA, RAP, PBA, etc.
5. **Condicionantes Prováveis** - Principais exigências
6. **Prazo Estimado** - Tempo de tramitação
7. **Custos Aproximados** - Taxas e estudos
8. **Riscos e Alertas** - Possíveis impedimentos

Seja específico e forneça informações práticas baseadas na legislação brasileira vigente.`;

    await sendMessage(prompt);
  };

  const handleNextStep = () => {
    if (currentStep === 3) {
      handleAIAnalysis();
    } else if (currentStep < workflowSteps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="flex-1">
                <Label>Categoria *</Label>
                <CategoryDropdownNew
                  moduleId={MODULE_ID}
                  value={selectedCategory}
                  onValueChange={(id) => {
                    setSelectedCategory(id);
                    setProjectData((prev) => ({ ...prev, subtipo: '' }));
                  }}
                  placeholder="Selecione a categoria"
                />
              </div>
              <div className="flex-1">
                <SubtypeSelector
                  moduleId={MODULE_ID}
                  categoryId={selectedCategory}
                  value={projectData.subtipo}
                  onValueChange={(v) => setProjectData({ ...projectData, subtipo: v })}
                  label="Subtipo / Serviço *"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Localização</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label>Município *</Label>
                  <Input
                    placeholder="Ex: Ribeirão Preto"
                    value={projectData.municipio}
                    onChange={(e) => setProjectData({ ...projectData, municipio: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Estado *</Label>
                  <Select
                    value={projectData.estado || undefined}
                    onValueChange={(v) => setProjectData({ ...projectData, estado: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                    <SelectContent>
                      {brazilianStates.map((uf) => (
                        <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-green-500" />
                Dados do Projeto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label>Nome do Projeto *</Label>
                  <Input
                    placeholder="Ex: Usina Solar Fotovoltaica XYZ"
                    value={projectData.nome}
                    onChange={(e) => setProjectData({ ...projectData, nome: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Área Total</Label>
                  <Input
                    placeholder="Ex: 50 hectares"
                    value={projectData.area}
                    onChange={(e) => setProjectData({ ...projectData, area: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Descrição do Projeto</Label>
                <Textarea
                  placeholder="Descreva brevemente o projeto, atividades previstas e potenciais impactos..."
                  value={projectData.descricao}
                  onChange={(e) => setProjectData({ ...projectData, descricao: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Ao prosseguir</p>
                  <p className="text-sm text-muted-foreground">
                    A IA irá analisar seu projeto e listar todos os documentos, estudos e condicionantes necessários com base na legislação vigente.
                  </p>
                </div>
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
                Análise Ambiental
                <Badge variant="outline">
                  <Sparkles className="mr-1 h-3 w-3" />
                  IA
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">Analisando requisitos ambientais...</p>
                  <p className="mt-1 text-xs text-muted-foreground">Consultando legislação e normas ambientais</p>
                </div>
              ) : messages.filter((m) => m.role === 'assistant').length > 0 ? (
                <div className="space-y-4">
                  <div className="max-h-[500px] overflow-y-auto rounded-lg border bg-muted/30 p-4">
                    <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                      {messages.filter((m) => m.role === 'assistant').slice(-1)[0]?.content}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        const catInfo = getCategoryInfo(selectedCategory);
                        const content = messages.filter((m) => m.role === 'assistant').slice(-1)[0]?.content || '';
                        saveAnalysis.mutate({
                          module: 'Ambiental',
                          category: catInfo?.title,
                          projectName: projectData.nome || 'Novo Projeto',
                          projectData,
                          analysisContent: content,
                        });
                      }}
                      disabled={saveAnalysis.isPending}
                    >
                      {saveAnalysis.isPending ? 'Salvando...' : 'Salvar Análise'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const catInfo = getCategoryInfo(selectedCategory);
                        const content = messages.filter((m) => m.role === 'assistant').slice(-1)[0]?.content || '';
                        exportPDF({
                          title: 'Análise Ambiental',
                          subtitle: catInfo?.title,
                          moduleName: 'Ambiental',
                          projectData: { ...projectData, categoria: catInfo?.title },
                          analysisContent: content,
                        });
                      }}
                    >
                      Exportar PDF
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCurrentStep(1);
                        setSelectedCategory(null);
                        setProjectData({ nome: '', subtipo: '', municipio: '', estado: '', area: '', descricao: '' });
                      }}
                    >
                      Nova Consulta
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <Bot className="mb-4 h-12 w-12 text-muted-foreground/30" />
                  <p className="text-muted-foreground">Análise não realizada</p>
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
          <h1 className="flex items-center gap-3 text-2xl font-display font-bold text-foreground">
            <TreePine className="h-7 w-7 text-green-500" />
            Ambiental
          </h1>
          <p className="mt-1 text-muted-foreground">
            Licenciamento e programas ambientais com análise inteligente
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="categorias">Categorias</TabsTrigger>
            <TabsTrigger value="licenciamento">Projeto</TabsTrigger>
          </TabsList>

          <TabsContent value="categorias" className="mt-6">
            <CategoryGrid
              moduleId={MODULE_ID}
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategorySelect}
            />
          </TabsContent>

          <TabsContent value="licenciamento" className="mt-6 space-y-6">
            {/* Progress */}
            <Card className="glass-card">
              <CardContent className="py-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Processo de Licenciamento</span>
                  <span className="text-sm text-muted-foreground">
                    {currentStep} de {workflowSteps.length}
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="mt-4 flex justify-between">
                  {workflowSteps.map((step, index) => (
                    <div
                      key={step.id}
                      className={`flex flex-col items-center ${
                        index + 1 <= currentStep ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      <div
                        className={`mb-1 flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                          index + 1 < currentStep
                            ? 'bg-primary text-primary-foreground'
                            : index + 1 === currentStep
                              ? 'border-2 border-primary bg-primary/20'
                              : 'bg-muted'
                        }`}
                      >
                        {index + 1 < currentStep ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                      </div>
                      <span className="hidden text-xs md:block">{step.title}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {renderStepContent()}

            {currentStep < 4 && (
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                  disabled={currentStep === 1}
                >
                  Voltar
                </Button>
                <Button onClick={handleNextStep} disabled={!canProceed() || isLoading}>
                  {currentStep === 3 ? (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Analisar com IA
                    </>
                  ) : (
                    <>
                      Próximo
                      <ArrowRight className="ml-2 h-4 w-4" />
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
