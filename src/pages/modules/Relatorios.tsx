import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  Calendar,
  BarChart3,
  MapPin,
  Zap,
  Radio,
  FileCheck,
  Clock,
  Eye,
  Plus,
  Bot,
  Loader2,
  Sparkles,
  Send,
  CheckCircle2
} from 'lucide-react';
import { useInfraAI } from '@/hooks/useInfraAI';
import { toast } from 'sonner';

const reportTypes = [
  { 
    id: 'cobertura_5g',
    title: 'Relatório de Cobertura 5G',
    description: 'Análise completa de cobertura por estado e município',
    icon: Radio,
    color: 'bg-blue-500',
  },
  { 
    id: 'eletropostos',
    title: 'Mapa de Eletropostos',
    description: 'Distribuição geográfica e análise de densidade',
    icon: Zap,
    color: 'bg-green-500',
  },
  { 
    id: 'vazios',
    title: 'Vazios Territoriais',
    description: 'Identificação de áreas sem infraestrutura adequada',
    icon: MapPin,
    color: 'bg-orange-500',
  },
  { 
    id: 'mercado_ev',
    title: 'Análise de Mercado EV',
    description: 'Tendências e projeções do mercado de veículos elétricos',
    icon: BarChart3,
    color: 'bg-purple-500',
  },
  { 
    id: 'regulatorio',
    title: 'Relatório Regulatório',
    description: 'Atualizações de ANATEL, ANEEL e outras agências',
    icon: FileCheck,
    color: 'bg-amber-500',
  },
];

const savedReports = [
  { id: '1', name: 'relatorio_5g_dez2025.pdf', type: 'cobertura_5g', size: '2.4 MB', date: '28/12/2025', downloads: 47 },
  { id: '2', name: 'eletropostos_brasil_q4.pdf', type: 'eletropostos', size: '1.8 MB', date: '22/12/2025', downloads: 89 },
  { id: '3', name: 'vazios_territoriais_norte.pdf', type: 'vazios', size: '3.1 MB', date: '18/12/2025', downloads: 34 },
  { id: '4', name: 'projecoes_2026_telecom.pdf', type: 'mercado_ev', size: '1.2 MB', date: '15/12/2025', downloads: 156 },
];

export default function Relatorios() {
  const [activeTab, setActiveTab] = useState('gerar');
  const [selectedReportType, setSelectedReportType] = useState<string | null>(null);
  const [reportParams, setReportParams] = useState({
    estado: '',
    periodo: 'ultimo_mes',
    detalhamento: 'resumido',
    customPrompt: ''
  });
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { sendMessage, isLoading, messages } = useInfraAI();

  const handleGenerateReport = async () => {
    if (!selectedReportType) {
      toast.error('Selecione um tipo de relatório');
      return;
    }

    setIsGenerating(true);
    
    const reportConfig = reportTypes.find(r => r.id === selectedReportType);
    
    const prompt = `Gere um relatório profissional de ${reportConfig?.title}:
    
**Parâmetros:**
- Estado/Região: ${reportParams.estado || 'Brasil (nacional)'}
- Período: ${reportParams.periodo === 'ultimo_mes' ? 'Último mês' : reportParams.periodo === 'ultimo_trimestre' ? 'Último trimestre' : 'Último ano'}
- Detalhamento: ${reportParams.detalhamento === 'resumido' ? 'Resumo executivo' : 'Análise detalhada'}
${reportParams.customPrompt ? `- Instruções adicionais: ${reportParams.customPrompt}` : ''}

**Estruture o relatório com:**
1. Sumário Executivo
2. Panorama Atual
3. Análise por Região/Estado
4. Principais Indicadores (com números)
5. Tendências e Projeções
6. Recomendações Estratégicas
7. Conclusão

Use dados relevantes do banco de dados e forneça insights acionáveis.`;

    await sendMessage(prompt);
    
    // Get last assistant message
    setTimeout(() => {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.role === 'assistant') {
        setGeneratedReport(lastMessage.content);
      }
      setIsGenerating(false);
    }, 500);
  };

  const handleSaveReport = () => {
    toast.success('Relatório salvo com sucesso!', {
      description: 'O relatório foi adicionado à sua biblioteca.'
    });
  };

  const handleExportPDF = () => {
    toast.info('Gerando PDF...', {
      description: 'O download iniciará em instantes.'
    });
    // PDF generation would go here
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
              <FileText className="h-7 w-7 text-cyan-500" />
              Relatórios
            </h1>
            <p className="text-muted-foreground mt-1">
              Geração e gestão de relatórios de infraestrutura com IA
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="gerar" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Gerar Relatório
            </TabsTrigger>
            <TabsTrigger value="salvos" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Relatórios Salvos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gerar" className="space-y-6 mt-6">
            {/* Report Type Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-4">1. Selecione o Tipo de Relatório</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reportTypes.map((report) => (
                  <Card 
                    key={report.id} 
                    className={`cursor-pointer hover:border-primary/50 transition-all ${
                      selectedReportType === report.id ? 'border-primary ring-2 ring-primary/20' : ''
                    }`}
                    onClick={() => setSelectedReportType(report.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg ${report.color}/10 flex items-center justify-center shrink-0`}>
                          <report.icon className={`h-5 w-5 ${report.color.replace('bg-', 'text-')}`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{report.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{report.description}</p>
                        </div>
                        {selectedReportType === report.id && (
                          <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Report Parameters */}
            {selectedReportType && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg">2. Configurar Parâmetros</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="estado">Estado/Região</Label>
                      <Input
                        id="estado"
                        placeholder="Ex: SP, RJ ou deixe vazio para nacional"
                        value={reportParams.estado}
                        onChange={(e) => setReportParams({...reportParams, estado: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="periodo">Período</Label>
                      <Select 
                        value={reportParams.periodo} 
                        onValueChange={(v) => setReportParams({...reportParams, periodo: v})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ultimo_mes">Último mês</SelectItem>
                          <SelectItem value="ultimo_trimestre">Último trimestre</SelectItem>
                          <SelectItem value="ultimo_ano">Último ano</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="detalhamento">Detalhamento</Label>
                      <Select 
                        value={reportParams.detalhamento} 
                        onValueChange={(v) => setReportParams({...reportParams, detalhamento: v})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="resumido">Resumo executivo</SelectItem>
                          <SelectItem value="detalhado">Análise detalhada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="customPrompt">Instruções Adicionais (opcional)</Label>
                    <Textarea
                      id="customPrompt"
                      placeholder="Ex: Foque em oportunidades de investimento, inclua comparativo com ano anterior..."
                      value={reportParams.customPrompt}
                      onChange={(e) => setReportParams({...reportParams, customPrompt: e.target.value})}
                      rows={2}
                    />
                  </div>

                  <Button 
                    onClick={handleGenerateReport} 
                    disabled={isGenerating || isLoading}
                    className="w-full md:w-auto"
                  >
                    {isGenerating || isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Gerando relatório...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Gerar com IA
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Generated Report */}
            {(generatedReport || messages.length > 0) && (
              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    Relatório Gerado
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleSaveReport}>
                      <FileCheck className="h-4 w-4 mr-1" />
                      Salvar
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExportPDF}>
                      <Download className="h-4 w-4 mr-1" />
                      PDF
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none p-4 rounded-lg bg-muted/30 border max-h-[500px] overflow-y-auto">
                    {isLoading ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processando...
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">
                        {messages.filter(m => m.role === 'assistant').slice(-1)[0]?.content || generatedReport}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="salvos" className="space-y-6 mt-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="glass-card">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-cyan-500">{savedReports.length}</p>
                  <p className="text-sm text-muted-foreground">Relatórios salvos</p>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-green-500">326</p>
                  <p className="text-sm text-muted-foreground">Downloads total</p>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-amber-500">12</p>
                  <p className="text-sm text-muted-foreground">Gerados este mês</p>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-purple-500">5</p>
                  <p className="text-sm text-muted-foreground">Tipos diferentes</p>
                </CardContent>
              </Card>
            </div>

            {/* Saved Reports List */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-cyan-500" />
                  Biblioteca de Relatórios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {savedReports.map((report) => {
                    const reportConfig = reportTypes.find(r => r.id === report.type);
                    return (
                      <div 
                        key={report.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${reportConfig?.color || 'bg-cyan-500'}/10`}>
                            {reportConfig?.icon ? (
                              <reportConfig.icon className={`h-4 w-4 ${reportConfig.color.replace('bg-', 'text-')}`} />
                            ) : (
                              <FileText className="h-4 w-4 text-cyan-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{report.name}</p>
                            <p className="text-xs text-muted-foreground">{report.size} • {report.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            <Download className="h-3 w-3 mr-1" />
                            {report.downloads}
                          </Badge>
                          <Button size="icon" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
