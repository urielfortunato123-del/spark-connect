import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, 
  Target, 
  TrendingUp, 
  DollarSign, 
  FileCheck,
  Building2,
  Zap,
  Calculator,
  Clock,
  CheckCircle2,
  Bot,
  Send,
  Loader2,
  ArrowRight,
  FileText,
  Sparkles,
  Save,
  Download
} from 'lucide-react';
import { useInfraAI } from '@/hooks/useInfraAI';
import { toast } from 'sonner';

const analysisTypes = [
  { 
    id: 'eletroposto',
    title: 'Eletroposto', 
    icon: Zap, 
    color: 'bg-green-500',
    description: 'Estação de recarga EV',
    avgInvestment: 'R$ 150k - R$ 500k',
    avgROI: '24-36 meses'
  },
  { 
    id: 'torre5g',
    title: 'Torre 5G', 
    icon: Target, 
    color: 'bg-blue-500',
    description: 'ERB/torre de telecom',
    avgInvestment: 'R$ 80k - R$ 250k',
    avgROI: '18-30 meses'
  },
  { 
    id: 'subestacao',
    title: 'Subestação', 
    icon: Building2, 
    color: 'bg-amber-500',
    description: 'Subestação elétrica',
    avgInvestment: 'R$ 2M - R$ 15M',
    avgROI: '5-10 anos'
  },
  { 
    id: 'posto',
    title: 'Posto + EV', 
    icon: DollarSign, 
    color: 'bg-red-500',
    description: 'Posto com EV',
    avgInvestment: 'R$ 500k - R$ 2M',
    avgROI: '36-60 meses'
  },
];

const workflowSteps = [
  { step: 1, id: 'localizacao', title: 'Localização', icon: MapPin },
  { step: 2, id: 'projeto', title: 'Tipo de Projeto', icon: Target },
  { step: 3, id: 'mercado', title: 'Análise de Mercado', icon: TrendingUp },
  { step: 4, id: 'financeiro', title: 'Viabilidade Financeira', icon: Calculator },
  { step: 5, id: 'licenciamento', title: 'Licenciamento', icon: FileCheck },
  { step: 6, id: 'relatorio', title: 'Relatório Final', icon: FileText },
];

export default function Viabilidade() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [location, setLocation] = useState({ city: '', state: '', address: '' });
  const [projectData, setProjectData] = useState({
    investimento: '',
    capacidade: '',
    observacoes: ''
  });
  const [aiAnalysis, setAiAnalysis] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const { sendMessage, isLoading, messages } = useInfraAI();

  const progress = (currentStep / workflowSteps.length) * 100;

  const runAIAnalysis = async (stepId: string) => {
    setIsAnalyzing(true);
    
    const projectType = analysisTypes.find(t => t.id === selectedType);
    
    const prompts: Record<string, string> = {
      mercado: `Faça uma análise de mercado para instalação de ${projectType?.title || 'infraestrutura'} em ${location.city}, ${location.state}. 
        Considere: demanda local, concorrência, potencial de crescimento, público-alvo.
        Forneça dados específicos e recomendações.`,
      financeiro: `Faça uma análise de viabilidade financeira para ${projectType?.title || 'infraestrutura'} em ${location.city}, ${location.state}.
        Investimento estimado: ${projectType?.avgInvestment || projectData.investimento}.
        Calcule: ROI, payback, VPL, TIR, custos operacionais, receita projetada.`,
      licenciamento: `Liste todos os requisitos de licenciamento para ${projectType?.title || 'infraestrutura'} em ${location.city}, ${location.state}.
        Inclua: licenças necessárias, órgãos responsáveis, documentação, prazos médios, custos de taxas.`,
      relatorio: `Gere um relatório executivo completo do estudo de viabilidade:
        - Projeto: ${projectType?.title}
        - Local: ${location.city}, ${location.state}
        - Investimento: ${projectType?.avgInvestment}
        - Análise de Mercado: ${aiAnalysis.mercado ? 'Realizada' : 'Pendente'}
        - Análise Financeira: ${aiAnalysis.financeiro ? 'Realizada' : 'Pendente'}
        - Licenciamento: ${aiAnalysis.licenciamento ? 'Verificado' : 'Pendente'}
        
        Forneça uma recomendação final de investimento com score de viabilidade (0-100).`
    };

    const prompt = prompts[stepId];
    if (prompt) {
      await sendMessage(prompt);
      
      // Get the last assistant message
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.role === 'assistant') {
        setAiAnalysis(prev => ({ ...prev, [stepId]: lastMessage.content }));
      }
    }
    
    setIsAnalyzing(false);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return location.city && location.state;
      case 2: return selectedType !== null;
      default: return true;
    }
  };

  const handleNextStep = () => {
    if (currentStep < workflowSteps.length) {
      setCurrentStep(prev => prev + 1);
      
      // Auto-run AI analysis for relevant steps
      const nextStep = workflowSteps[currentStep];
      if (['mercado', 'financeiro', 'licenciamento', 'relatorio'].includes(nextStep.id)) {
        setTimeout(() => runAIAnalysis(nextStep.id), 500);
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSaveReport = () => {
    toast.success('Relatório salvo com sucesso!', {
      description: 'Você pode acessá-lo no módulo de Relatórios.'
    });
  };

  const renderStepContent = () => {
    const currentStepData = workflowSteps[currentStep - 1];
    
    switch (currentStepData.id) {
      case 'localizacao':
        return (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-purple-500" />
                Localização do Projeto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">Cidade *</Label>
                  <Input 
                    id="city" 
                    placeholder="Ex: São Paulo"
                    value={location.city}
                    onChange={(e) => setLocation({...location, city: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="state">Estado *</Label>
                  <Input 
                    id="state" 
                    placeholder="Ex: SP"
                    value={location.state}
                    onChange={(e) => setLocation({...location, state: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Endereço (opcional)</Label>
                  <Input 
                    id="address" 
                    placeholder="Av. Paulista, 1000"
                    value={location.address}
                    onChange={(e) => setLocation({...location, address: e.target.value})}
                  />
                </div>
              </div>
              <div className="pt-4 p-4 rounded-lg bg-muted/30 border">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Dica do InfraBot</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Informe a cidade e estado para que eu possa buscar dados de mercado, 
                  concorrência e regulamentação específicos da região.
                </p>
              </div>
            </CardContent>
          </Card>
        );
        
      case 'projeto':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-500" />
              Selecione o Tipo de Projeto
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {analysisTypes.map((type) => (
                <Card 
                  key={type.id}
                  className={`cursor-pointer transition-all duration-300 hover:border-primary/50 ${
                    selectedType === type.id ? 'border-primary ring-2 ring-primary/20' : ''
                  }`}
                  onClick={() => setSelectedType(type.id)}
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
                    {selectedType === type.id && (
                      <Badge className="mt-3 w-full justify-center">Selecionado</Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
        
      case 'mercado':
      case 'financeiro':
      case 'licenciamento':
        return (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <currentStepData.icon className="h-5 w-5 text-purple-500" />
                {currentStepData.title}
                <Badge variant="outline" className="ml-2">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Análise IA
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading || isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Analisando dados...</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    InfraBot está processando informações de {location.city}, {location.state}
                  </p>
                </div>
              ) : aiAnalysis[currentStepData.id] ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/30 border max-h-[400px] overflow-y-auto">
                    <div className="flex items-center gap-2 mb-3">
                      <Bot className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Análise do InfraBot</span>
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <div className="whitespace-pre-wrap text-sm">
                        {aiAnalysis[currentStepData.id]}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => runAIAnalysis(currentStepData.id)}>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Refazer Análise
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <Bot className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground mb-4">Análise ainda não realizada</p>
                  <Button onClick={() => runAIAnalysis(currentStepData.id)}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Iniciar Análise com IA
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
        
      case 'relatorio':
        const projectType = analysisTypes.find(t => t.id === selectedType);
        return (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-500" />
                Relatório Final
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-muted/30 text-center">
                  <p className="text-xs text-muted-foreground">Projeto</p>
                  <p className="font-semibold">{projectType?.title || '-'}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 text-center">
                  <p className="text-xs text-muted-foreground">Localização</p>
                  <p className="font-semibold">{location.city}, {location.state}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 text-center">
                  <p className="text-xs text-muted-foreground">Investimento</p>
                  <p className="font-semibold">{projectType?.avgInvestment || '-'}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 text-center">
                  <p className="text-xs text-muted-foreground">Payback Estimado</p>
                  <p className="font-semibold">{projectType?.avgROI || '-'}</p>
                </div>
              </div>

              {/* AI Final Analysis */}
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Gerando relatório final...</p>
                </div>
              ) : aiAnalysis.relatorio ? (
                <div className="p-4 rounded-lg bg-muted/30 border">
                  <div className="flex items-center gap-2 mb-3">
                    <Bot className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Parecer do InfraBot</span>
                  </div>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-sm">
                      {aiAnalysis.relatorio}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <Button onClick={() => runAIAnalysis('relatorio')}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Gerar Parecer Final
                  </Button>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t">
                <Button onClick={handleSaveReport}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Relatório
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar PDF
                </Button>
                <Button variant="outline" onClick={() => {
                  setCurrentStep(1);
                  setAiAnalysis({});
                  setSelectedType(null);
                  setLocation({ city: '', state: '', address: '' });
                }}>
                  Nova Análise
                </Button>
              </div>
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
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
            <MapPin className="h-7 w-7 text-purple-500" />
            Viabilidade
          </h1>
          <p className="text-muted-foreground mt-1">
            Estudos de viabilidade técnica e econômica com análise de IA
          </p>
        </div>

        {/* Progress */}
        <Card className="glass-card">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progresso do Estudo</span>
              <span className="text-sm text-muted-foreground">{currentStep} de {workflowSteps.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-4">
              {workflowSteps.map((step, index) => (
                <div 
                  key={step.id}
                  className={`flex flex-col items-center cursor-pointer ${
                    index + 1 <= currentStep ? 'text-primary' : 'text-muted-foreground'
                  }`}
                  onClick={() => index + 1 <= currentStep && setCurrentStep(index + 1)}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                    index + 1 < currentStep ? 'bg-primary text-primary-foreground' :
                    index + 1 === currentStep ? 'bg-primary/20 border-2 border-primary' :
                    'bg-muted'
                  }`}>
                    {index + 1 < currentStep ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <step.icon className="h-4 w-4" />
                    )}
                  </div>
                  <span className="text-xs hidden md:block">{step.title}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        {renderStepContent()}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handlePrevStep}
            disabled={currentStep === 1}
          >
            Voltar
          </Button>
          <Button 
            onClick={handleNextStep}
            disabled={currentStep === workflowSteps.length || !canProceed()}
          >
            {currentStep === workflowSteps.length - 1 ? 'Finalizar' : 'Próximo'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
