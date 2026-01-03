import { useState, useEffect } from "react";
import { X, Loader2, Brain, AlertTriangle, TrendingUp, MapPin, Users, Zap, Target, CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { VazioTerritorial, NivelVazio } from "@/hooks/useVaziosTerritoriais";

interface VazioInsightsPanelProps {
  vazio: VazioTerritorial | null;
  onClose: () => void;
}

interface AIAnalysis {
  summary: string;
  situacao_atual: {
    nivel: string;
    principais_problemas: string[];
    pontos_positivos: string[];
  };
  analise_regional: {
    caracteristicas: string;
    economia_local: string;
    potencial_ev: string;
  };
  recomendacoes: Array<{
    tipo: string;
    descricao: string;
    prioridade: string;
    investimento_estimado: string;
    impacto_esperado: string;
  }>;
  proximos_passos: string[];
  score_oportunidade: number;
}

const NivelBadge = ({ nivel }: { nivel: NivelVazio }) => {
  const config = {
    critico: { variant: 'destructive' as const, label: 'Crítico', color: 'text-red-400' },
    moderado: { variant: 'secondary' as const, label: 'Moderado', color: 'text-amber-400' },
    adequado: { variant: 'default' as const, label: 'Adequado', color: 'text-green-400' },
  };
  const { variant, label, color } = config[nivel];
  return <Badge variant={variant} className={`${color}`}>{label}</Badge>;
};

const VazioInsightsPanel = ({ vazio, onClose }: VazioInsightsPanelProps) => {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (vazio) {
      fetchAIAnalysis();
    }
  }, [vazio?.municipio?.id]);

  const fetchAIAnalysis = async () => {
    if (!vazio) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke("infrastructure-ai", {
        body: {
          type: "vazio_analysis",
          data: {
            municipio: vazio.municipio,
            indicadores: vazio.indicadores,
            nivel: vazio.nivel,
            score_criticidade: vazio.score_criticidade,
            justificativa: vazio.justificativa,
            criterios: vazio.criterios,
          },
        },
      });

      if (error) throw error;

      if (data?.success && data?.data) {
        setAnalysis(data.data);
      } else {
        throw new Error("Invalid response from AI");
      }
    } catch (err: any) {
      console.error("AI analysis error:", err);
      setError(err.message || "Erro ao analisar o município");
      toast({
        title: "Erro na análise",
        description: "Não foi possível gerar a análise de IA. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!vazio) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[450px] lg:w-[500px] bg-background/95 backdrop-blur-lg border-l border-border/50 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 border-b border-border/50 bg-gradient-to-r from-primary/10 to-transparent">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center shadow-lg">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-lg flex items-center gap-2">
                {vazio.municipio.nome}
                <NivelBadge nivel={vazio.nivel} />
              </h2>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {vazio.municipio.estado} • {vazio.municipio.regiao}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <Users className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-sm font-bold">{vazio.municipio.populacao.toLocaleString('pt-BR')}</p>
            <p className="text-[9px] text-muted-foreground">habitantes</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <Zap className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-sm font-bold">{vazio.indicadores.qtd_eletropostos}</p>
            <p className="text-[9px] text-muted-foreground">eletropostos</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <Target className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-sm font-bold">{vazio.score_criticidade}%</p>
            <p className="text-[9px] text-muted-foreground">criticidade</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Justificativa Técnica */}
          <Card className="bg-amber-500/10 border-amber-500/30">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-amber-400 mb-1">Justificativa Técnica</p>
                  <p className="text-xs text-muted-foreground">{vazio.justificativa}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isLoading && (
            <Card className="border-primary/30">
              <CardContent className="p-8 flex flex-col items-center justify-center">
                <div className="relative">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                  <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-amber-400 animate-pulse" />
                </div>
                <p className="text-sm text-muted-foreground mt-4">Analisando com IA...</p>
                <p className="text-xs text-muted-foreground">Gerando insights estratégicos</p>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <Card className="border-destructive/30">
              <CardContent className="p-4 text-center">
                <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" />
                <p className="text-sm text-destructive mb-2">{error}</p>
                <Button size="sm" variant="outline" onClick={fetchAIAnalysis}>
                  Tentar novamente
                </Button>
              </CardContent>
            </Card>
          )}

          {/* AI Analysis Results */}
          {analysis && !isLoading && (
            <>
              {/* Summary */}
              <Card className="border-primary/30 bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Resumo Executivo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/90">{analysis.summary}</p>
                  
                  {/* Opportunity Score */}
                  <div className="mt-4 p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">Score de Oportunidade</span>
                      <span className="text-lg font-bold text-primary">{analysis.score_oportunidade}/100</span>
                    </div>
                    <Progress value={analysis.score_oportunidade} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Current Situation */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Situação Atual</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysis.situacao_atual.principais_problemas.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-destructive mb-1">Problemas Identificados</p>
                      <ul className="space-y-1">
                        {analysis.situacao_atual.principais_problemas.map((p, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                            <span className="text-destructive">•</span> {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {analysis.situacao_atual.pontos_positivos.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-green-400 mb-1">Pontos Positivos</p>
                      <ul className="space-y-1">
                        {analysis.situacao_atual.pontos_positivos.map((p, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                            <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 shrink-0" /> {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Regional Analysis */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Análise Regional</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs text-muted-foreground">
                  <p><strong className="text-foreground">Características:</strong> {analysis.analise_regional.caracteristicas}</p>
                  <p><strong className="text-foreground">Economia:</strong> {analysis.analise_regional.economia_local}</p>
                  <p>
                    <strong className="text-foreground">Potencial EV:</strong>{' '}
                    <Badge variant={analysis.analise_regional.potencial_ev === 'alto' ? 'default' : 'secondary'} className="text-[10px]">
                      {analysis.analise_regional.potencial_ev?.toUpperCase()}
                    </Badge>
                  </p>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Recomendações Estratégicas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysis.recomendacoes.map((rec, i) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant={rec.prioridade === 'alta' ? 'destructive' : rec.prioridade === 'media' ? 'secondary' : 'outline'} className="text-[10px]">
                          {rec.prioridade?.toUpperCase()}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">{rec.tipo}</span>
                      </div>
                      <p className="text-xs font-medium mb-1">{rec.descricao}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
                        <span>💰 {rec.investimento_estimado}</span>
                        <span>📈 {rec.impacto_esperado}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card className="border-primary/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ArrowRight className="w-4 h-4" />
                    Próximos Passos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2">
                    {analysis.proximos_passos.map((step, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-border/50 bg-muted/30">
        <p className="text-[10px] text-center text-muted-foreground">
          Análise gerada por IA • InfraBrasil 2026
        </p>
      </div>
    </div>
  );
};

export default VazioInsightsPanel;
