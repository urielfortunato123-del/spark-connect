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
  Lightbulb, Cable, Building2, Zap, Wind, Sun, Atom, Flame,
  CheckCircle2, ArrowRight, Loader2, Bot, Sparkles, FileText, 
  AlertTriangle, Target, FileCheck, MapPin
} from 'lucide-react';
import { useInfraAI } from '@/hooks/useInfraAI';
import { toast } from 'sonner';

const subcategories = [
  { id: 'solar', title: 'Geração Solar', icon: Sun, color: 'bg-amber-500', desc: 'Usinas fotovoltaicas e solares térmicas' },
  { id: 'eolica', title: 'Geração Eólica', icon: Wind, color: 'bg-cyan-500', desc: 'Parques eólicos onshore e offshore' },
  { id: 'hidraulica', title: 'Geração Hidráulica', icon: Zap, color: 'bg-blue-500', desc: 'PCHs, CGHs e UHEs' },
  { id: 'termica', title: 'Geração Térmica', icon: Flame, color: 'bg-orange-500', desc: 'Termelétricas a gás, carvão, biomassa' },
  { id: 'nuclear', title: 'Geração Nuclear', icon: Atom, color: 'bg-purple-500', desc: 'Usinas nucleares' },
  { id: 'transmissao', title: 'Linhas de Transmissão', icon: Cable, color: 'bg-yellow-500', desc: 'LTs de alta tensão' },
  { id: 'subestacao', title: 'Subestações', icon: Building2, color: 'bg-yellow-600', desc: 'SEs de transformação' },
  { id: 'distribuicao', title: 'Distribuição', icon: Zap, color: 'bg-emerald-500', desc: 'Redes de distribuição' },
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
  solar: { 
    label: 'Solar',
    subtypes: ['Usina Solar Fotovoltaica (UFV)', 'Usina Solar Térmica (CSP)', 'Geração Distribuída (GD)', 'Minigeração'] 
  },
  eolica: { 
    label: 'Eólica',
    subtypes: ['Parque Eólico Onshore', 'Parque Eólico Offshore', 'Aerogerador Isolado'] 
  },
  hidraulica: { 
    label: 'Hidráulica',
    subtypes: ['CGH (até 5 MW)', 'PCH (5 a 30 MW)', 'UHE (acima 30 MW)', 'Reversível'] 
  },
  termica: { 
    label: 'Térmica',
    subtypes: ['Gás Natural', 'Carvão', 'Biomassa', 'Resíduos Sólidos', 'Cogeração'] 
  },
  transmissao: { 
    label: 'Transmissão',
    subtypes: ['LT 138 kV', 'LT 230 kV', 'LT 345 kV', 'LT 500 kV', 'LT 765 kV', 'LT CC'] 
  },
  subestacao: { 
    label: 'Subestação',
    subtypes: ['SE Elevadora', 'SE Abaixadora', 'SE Seccionadora', 'SE Conversora'] 
  },
};

export default function Energia() {
  const [activeTab, setActiveTab] = useState('categorias');
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [projectData, setProjectData] = useState({
    nome: '',
    subtipo: '',
    municipio: '',
    estado: '',
    capacidade: '',
    unidadeCapacidade: 'MW',
    tensao: '',
    extensao: '',
    descricao: '',
    conexaoSIN: 'sim',
    modeloComercial: ''
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
    
    const prompt = `Faça uma análise completa de viabilidade para projeto de energia:

**TIPO DE PROJETO:** ${categoryInfo?.title || selectedCategory}
**SUBTIPO:** ${projectData.subtipo || typeInfo?.subtypes[0] || 'A definir'}

**DADOS DO PROJETO:**
- Nome: ${projectData.nome || 'Novo Projeto de Energia'}
- Localização: ${projectData.municipio}, ${projectData.estado}
- Capacidade: ${projectData.capacidade} ${projectData.unidadeCapacidade}
${projectData.tensao ? `- Tensão: ${projectData.tensao} kV` : ''}
${projectData.extensao ? `- Extensão: ${projectData.extensao} km` : ''}
- Conexão ao SIN: ${projectData.conexaoSIN}
- Modelo Comercial: ${projectData.modeloComercial || 'A definir'}

**DESCRIÇÃO:** ${projectData.descricao || 'Implantação de novo empreendimento de geração/transmissão de energia'}

Por favor, forneça análise detalhada incluindo:

1. **VIABILIDADE TÉCNICA**
   - Recurso disponível (irradiação, vento, vazão, etc.)
   - Fator de capacidade estimado
   - Tecnologia recomendada

2. **LICENCIAMENTO AMBIENTAL**
   - Órgão competente (IBAMA/Estadual)
   - Estudos necessários (EIA/RIMA, RAP, etc.)
   - Prazo estimado

3. **REGULAÇÃO ANEEL**
   - Registro/Autorização necessária
   - Outorga de geração ou transmissão
   - Requisitos de conexão ao SIN
   - Procedimentos de Rede (PRODIST/ONS)

4. **CONEXÃO E ACESSO**
   - Ponto de conexão sugerido
   - Obras de reforço necessárias
   - Parecer de acesso (estimativa)

5. **COMERCIALIZAÇÃO**
   - ACR (Leilões) vs ACL (Mercado Livre)
   - PPA corporativo
   - Autoprodução

6. **CUSTOS ESTIMADOS**
   - CAPEX (R$/kW ou R$/km)
   - OPEX anual
   - Custo de conexão

7. **CRONOGRAMA**
   - Licenciamento: X meses
   - Construção: X meses
   - Comissionamento: X meses

8. **RISCOS E RECOMENDAÇÕES**
   - Principais riscos do projeto
   - Recomendações para mitigação

Considere legislação brasileira: Lei 9.074/95, Lei 10.848/04, Resoluções ANEEL, Procedimentos de Rede ONS.`;

    await sendMessage(prompt);
    setCurrentStep(5);
  };

  const resetFlow = () => {
    setCurrentStep(1);
    setSelectedCategory(null);
    setProjectData({
      nome: '', subtipo: '', municipio: '', estado: '',
      capacidade: '', unidadeCapacidade: 'MW', tensao: '',
      extensao: '', descricao: '', conexaoSIN: 'sim', modeloComercial: ''
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
    const isTransmission = selectedCategory === 'transmissao' || selectedCategory === 'subestacao';

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
                    placeholder="Ex: UFV Serra do Sol I"
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
                <Label>Modelo Comercial</Label>
                <Select 
                  value={projectData.modeloComercial}
                  onValueChange={(v) => setProjectData({...projectData, modeloComercial: v})}
                >
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="acr">ACR - Ambiente de Contratação Regulada (Leilões)</SelectItem>
                    <SelectItem value="acl">ACL - Ambiente de Contratação Livre</SelectItem>
                    <SelectItem value="ppa">PPA Corporativo</SelectItem>
                    <SelectItem value="autoprodução">Autoprodução</SelectItem>
                    <SelectItem value="gd">Geração Distribuída</SelectItem>
                  </SelectContent>
                </Select>
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
                    placeholder="Ex: Bom Jesus da Lapa"
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
                <Label>Conexão ao SIN</Label>
                <Select 
                  value={projectData.conexaoSIN}
                  onValueChange={(v) => setProjectData({...projectData, conexaoSIN: v})}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sim">Sim - Conectado ao SIN</SelectItem>
                    <SelectItem value="isolado">Sistema Isolado</SelectItem>
                    <SelectItem value="gd">Geração Distribuída (MT/BT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Dados Técnicos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label>{isTransmission ? 'Capacidade de Transporte' : 'Capacidade Instalada'} *</Label>
                  <Input 
                    type="number"
                    placeholder={isTransmission ? 'Ex: 500' : 'Ex: 150'}
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
                      <SelectItem value="MW">MW</SelectItem>
                      <SelectItem value="MWp">MWp (solar)</SelectItem>
                      <SelectItem value="MVA">MVA</SelectItem>
                      <SelectItem value="kW">kW</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {isTransmission && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Tensão (kV)</Label>
                    <Select 
                      value={projectData.tensao}
                      onValueChange={(v) => setProjectData({...projectData, tensao: v})}
                    >
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="138">138 kV</SelectItem>
                        <SelectItem value="230">230 kV</SelectItem>
                        <SelectItem value="345">345 kV</SelectItem>
                        <SelectItem value="500">500 kV</SelectItem>
                        <SelectItem value="765">765 kV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Extensão (km)</Label>
                    <Input 
                      type="number"
                      placeholder="Ex: 250"
                      value={projectData.extensao}
                      onChange={(e) => setProjectData({...projectData, extensao: e.target.value})}
                    />
                  </div>
                </div>
              )}

              <div>
                <Label>Descrição do Projeto</Label>
                <Textarea 
                  placeholder="Descreva o projeto, tecnologia, equipamentos principais..."
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
                    Consultando regulação ANEEL, ONS e requisitos ambientais
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
            <Lightbulb className="h-7 w-7 text-yellow-500" />
            Energia Elétrica
          </h1>
          <p className="text-muted-foreground mt-1">
            Geração, transmissão e distribuição de energia
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="categorias">Categorias</TabsTrigger>
            <TabsTrigger value="projeto" disabled={!selectedCategory}>
              Novo Projeto {selectedCategory && `(${subcategories.find(c => c.id === selectedCategory)?.title})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="categorias" className="mt-6">
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

          <TabsContent value="projeto" className="space-y-6 mt-6">
            {/* Progress Bar */}
            <Card className="glass-card">
              <CardContent className="py-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Processo de Análise</span>
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
                  onClick={() => {
                    if (currentStep === 1) {
                      setActiveTab('categorias');
                    } else {
                      setCurrentStep(prev => prev - 1);
                    }
                  }}
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
