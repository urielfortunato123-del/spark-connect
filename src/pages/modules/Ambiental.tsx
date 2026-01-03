import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TreePine, 
  FileCheck, 
  ClipboardCheck, 
  Map, 
  Building,
  Truck,
  Waves,
  Factory,
  Home,
  FileText,
  Droplet,
  Bot,
  Loader2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar
} from 'lucide-react';
import { useInfraAI } from '@/hooks/useInfraAI';
import { toast } from 'sonner';

const subcategories = [
  { id: 'programas', title: 'Programas Ambientais', icon: TreePine, color: 'bg-green-500' },
  { id: 'licenciamento', title: 'Licenciamento Ambiental', icon: FileCheck, color: 'bg-emerald-500' },
  { id: 'acompanhamento', title: 'Acompanhamento Ambiental', icon: ClipboardCheck, color: 'bg-teal-500' },
  { id: 'patrimonial', title: 'Acompanhamento Patrimonial', icon: Building, color: 'bg-green-600' },
  { id: 'transportes', title: 'Transportes', icon: Truck, color: 'bg-blue-500' },
  { id: 'coleta', title: 'Coleta e Tratamento', icon: Waves, color: 'bg-cyan-500' },
  { id: 'drenagem', title: 'Drenagem', icon: Droplet, color: 'bg-sky-500' },
  { id: 'energia', title: 'Engenharia Gás e Energia', icon: Factory, color: 'bg-orange-500' },
  { id: 'urbanizacao', title: 'Urbanização de Favelas', icon: Home, color: 'bg-purple-500' },
  { id: 'fundiaria', title: 'Regularização Fundiária', icon: Map, color: 'bg-amber-500' },
  { id: 'estudos', title: 'Estudos Ambientais', icon: FileText, color: 'bg-lime-500' },
];

const licenseTypes = [
  { id: 'LP', name: 'Licença Prévia', description: 'Fase de planejamento', prazo: '6-12 meses', color: 'amber' },
  { id: 'LI', name: 'Licença de Instalação', description: 'Fase de construção', prazo: '3-6 meses', color: 'blue' },
  { id: 'LO', name: 'Licença de Operação', description: 'Fase de operação', prazo: '2-4 meses', color: 'green' },
];

const workflowSteps = [
  { step: 1, id: 'tipo', title: 'Tipo de Licença' },
  { step: 2, id: 'projeto', title: 'Dados do Projeto' },
  { step: 3, id: 'documentos', title: 'Documentação' },
  { step: 4, id: 'analise', title: 'Análise IA' },
  { step: 5, id: 'resultado', title: 'Resultado' },
];

export default function Ambiental() {
  const [activeTab, setActiveTab] = useState('categorias');
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedLicense, setSelectedLicense] = useState<string | null>(null);
  const [projectData, setProjectData] = useState({
    nome: '',
    tipo: '',
    localizacao: '',
    area: '',
    descricao: ''
  });
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  
  const { sendMessage, isLoading, messages } = useInfraAI();

  const progress = (currentStep / workflowSteps.length) * 100;

  const handleAIAnalysis = async () => {
    const license = licenseTypes.find(l => l.id === selectedLicense);
    
    const prompt = `Faça uma análise de licenciamento ambiental para:

**Projeto:** ${projectData.nome}
**Tipo de Empreendimento:** ${projectData.tipo}
**Localização:** ${projectData.localizacao}
**Área:** ${projectData.area}
**Descrição:** ${projectData.descricao}

**Licença Solicitada:** ${license?.name} (${license?.id})

Forneça:
1. **Enquadramento Legal** - Leis e resoluções aplicáveis
2. **Órgão Competente** - IBAMA, CETESB, etc.
3. **Documentos Necessários** - Lista detalhada
4. **Estudos Ambientais** - EIA/RIMA, RAP, PBA, etc.
5. **Condicionantes Prováveis** - Principais exigências
6. **Prazo Estimado** - Tempo de tramitação
7. **Custos Aproximados** - Taxas e estudos
8. **Riscos e Alertas** - Possíveis impedimentos

Seja específico e forneça informações práticas.`;

    await sendMessage(prompt);
    setCurrentStep(4);
    
    setTimeout(() => {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.role === 'assistant') {
        setAiAnalysis(lastMessage.content);
      }
    }, 500);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedLicense !== null;
      case 2: return projectData.nome && projectData.tipo && projectData.localizacao;
      default: return true;
    }
  };

  const handleNextStep = () => {
    if (currentStep === 3) {
      handleAIAnalysis();
    } else if (currentStep < workflowSteps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Selecione o Tipo de Licença</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {licenseTypes.map((license) => (
                <Card 
                  key={license.id}
                  className={`cursor-pointer transition-all hover:border-primary/50 ${
                    selectedLicense === license.id ? 'border-primary ring-2 ring-primary/20' : ''
                  }`}
                  onClick={() => setSelectedLicense(license.id)}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 rounded-full bg-${license.color}-500/10 flex items-center justify-center mx-auto mb-4`}>
                      <span className={`text-2xl font-bold text-${license.color}-500`}>{license.id}</span>
                    </div>
                    <h4 className="font-semibold mb-1">{license.name}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{license.description}</p>
                    <Badge variant="outline">Prazo: {license.prazo}</Badge>
                    {selectedLicense === license.id && (
                      <CheckCircle2 className="h-5 w-5 text-primary mx-auto mt-3" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
        
      case 2:
        return (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Dados do Projeto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome do Projeto *</Label>
                  <Input
                    id="nome"
                    placeholder="Ex: Usina Solar Fotovoltaica XYZ"
                    value={projectData.nome}
                    onChange={(e) => setProjectData({...projectData, nome: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="tipo">Tipo de Empreendimento *</Label>
                  <Input
                    id="tipo"
                    placeholder="Ex: Usina solar, Linha de transmissão, Eletroposto"
                    value={projectData.tipo}
                    onChange={(e) => setProjectData({...projectData, tipo: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="localizacao">Localização *</Label>
                  <Input
                    id="localizacao"
                    placeholder="Ex: Município de Ribeirão Preto, SP"
                    value={projectData.localizacao}
                    onChange={(e) => setProjectData({...projectData, localizacao: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="area">Área Total</Label>
                  <Input
                    id="area"
                    placeholder="Ex: 50 hectares"
                    value={projectData.area}
                    onChange={(e) => setProjectData({...projectData, area: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="descricao">Descrição do Projeto</Label>
                <Textarea
                  id="descricao"
                  placeholder="Descreva brevemente o projeto, atividades previstas e potenciais impactos..."
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
                <FileCheck className="h-5 w-5 text-green-500" />
                Documentação Necessária
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Antes de prosseguir</p>
                    <p className="text-sm text-muted-foreground">
                      A IA irá analisar seu projeto e listar todos os documentos e estudos necessários 
                      com base na legislação vigente.
                    </p>
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
                      Enquadramento legal do empreendimento
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Órgão ambiental competente
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Lista de documentos obrigatórios
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Estudos ambientais necessários
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Prazos e custos estimados
                    </li>
                  </ul>
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
                Análise de Licenciamento
                <Badge variant="outline">
                  <Sparkles className="h-3 w-3 mr-1" />
                  IA
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Analisando requisitos de licenciamento...</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Consultando legislação e normas ambientais
                  </p>
                </div>
              ) : messages.filter(m => m.role === 'assistant').length > 0 ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/30 border max-h-[500px] overflow-y-auto">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <div className="whitespace-pre-wrap">
                        {messages.filter(m => m.role === 'assistant').slice(-1)[0]?.content}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => toast.success('Análise salva!')}>
                      Salvar Análise
                    </Button>
                    <Button variant="outline">
                      Exportar PDF
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setCurrentStep(1);
                      setSelectedLicense(null);
                      setProjectData({ nome: '', tipo: '', localizacao: '', area: '', descricao: '' });
                    }}>
                      Nova Consulta
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <Bot className="h-12 w-12 text-muted-foreground/30 mb-4" />
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
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
            <TreePine className="h-7 w-7 text-green-500" />
            Ambiental
          </h1>
          <p className="text-muted-foreground mt-1">
            Licenciamento e programas ambientais com análise inteligente
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="categorias">Categorias</TabsTrigger>
            <TabsTrigger value="licenciamento">Licenciamento</TabsTrigger>
          </TabsList>

          <TabsContent value="categorias" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {subcategories.map((sub) => (
                <Card 
                  key={sub.id} 
                  className="group cursor-pointer hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
                  onClick={() => {
                    setActiveTab('licenciamento');
                    toast.info(`Iniciando fluxo de ${sub.title}`);
                  }}
                >
                  <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                    <div className={`w-14 h-14 rounded-xl ${sub.color}/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <sub.icon className={`h-7 w-7 ${sub.color.replace('bg-', 'text-')}`} />
                    </div>
                    <span className="font-medium text-sm">{sub.title}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="licenciamento" className="space-y-6 mt-6">
            {/* Progress */}
            <Card className="glass-card">
              <CardContent className="py-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Processo de Licenciamento</span>
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
            {renderStepContent()}

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
                  onClick={handleNextStep}
                  disabled={!canProceed() || isLoading}
                >
                  {currentStep === 3 ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
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
