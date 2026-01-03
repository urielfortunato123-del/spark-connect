import { useState } from "react";
import { AlertTriangle, MapPin, Users, Zap, TrendingDown, Calculator, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  useVaziosTerritoriais,
  useRecalcularIndicadores,
  simularImpactoEletroposto,
  PARAMETROS_PADRAO,
  type VazioTerritorial,
  type ParametrosVazio,
} from "@/hooks/useVaziosTerritoriais";
import { toast } from "@/hooks/use-toast";

interface VaziosPanelProps {
  onMunicipioSelect?: (lat: number, lng: number, nome: string) => void;
}

const VaziosPanel = ({ onMunicipioSelect }: VaziosPanelProps) => {
  const [parametros, setParametros] = useState<ParametrosVazio>(PARAMETROS_PADRAO);
  const [selectedVazio, setSelectedVazio] = useState<VazioTerritorial | null>(null);
  const [qtdSimular, setQtdSimular] = useState(1);

  const { vazios, adequados, total, totalVazios, isLoading } = useVaziosTerritoriais(parametros);
  const recalcular = useRecalcularIndicadores();

  const handleRecalcular = () => {
    recalcular.mutate(undefined, {
      onSuccess: () => {
        toast({
          title: "Indicadores recalculados",
          description: "A análise de vazios foi atualizada.",
        });
      },
      onError: () => {
        toast({
          title: "Erro ao recalcular",
          description: "Tente novamente mais tarde.",
          variant: "destructive",
        });
      },
    });
  };

  const handleSelectVazio = (vazio: VazioTerritorial) => {
    setSelectedVazio(vazio);
    if (vazio.municipio.latitude && vazio.municipio.longitude && onMunicipioSelect) {
      onMunicipioSelect(vazio.municipio.latitude, vazio.municipio.longitude, vazio.municipio.nome);
    }
  };

  const simulacao = selectedVazio
    ? simularImpactoEletroposto(selectedVazio.municipio, selectedVazio.indicadores, qtdSimular)
    : null;

  if (isLoading) {
    return (
      <Card className="glass-card animate-pulse">
        <CardContent className="p-6">
          <div className="h-40 bg-muted/50 rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <Card className="glass-card border-amber-500/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Vazios Territoriais
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRecalcular}
              disabled={recalcular.isPending}
              className="text-xs"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${recalcular.isPending ? 'animate-spin' : ''}`} />
              Recalcular
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <p className="text-2xl font-bold text-red-400">{totalVazios}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Vazios</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/30">
              <p className="text-2xl font-bold text-green-400">{adequados.length}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Adequados</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-2xl font-bold">{total}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Analisados</p>
            </div>
          </div>

          {/* Coverage bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Cobertura Nacional</span>
              <span className="font-medium">
                {total > 0 ? Math.round((adequados.length / total) * 100) : 0}%
              </span>
            </div>
            <Progress
              value={total > 0 ? (adequados.length / total) * 100 : 0}
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Ranking de Vazios */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-red-400" />
            Municípios Críticos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px] pr-2">
            <div className="space-y-2">
              {vazios.slice(0, 10).map((vazio, idx) => (
                <button
                  key={vazio.municipio.id}
                  onClick={() => handleSelectVazio(vazio)}
                  className={`w-full text-left p-2 rounded-lg transition-all ${
                    selectedVazio?.municipio.id === vazio.municipio.id
                      ? 'bg-primary/20 border border-primary/50'
                      : 'bg-muted/30 hover:bg-muted/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground w-5">
                        {idx + 1}º
                      </span>
                      <div>
                        <p className="text-sm font-medium">{vazio.municipio.nome}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {vazio.municipio.estado} • {vazio.municipio.populacao.toLocaleString('pt-BR')} hab
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={vazio.score_criticidade > 70 ? 'destructive' : 'secondary'}
                      className="text-[10px]"
                    >
                      {vazio.score_criticidade}%
                    </Badge>
                  </div>
                </button>
              ))}
              {vazios.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhum vazio territorial identificado</p>
                  <p className="text-xs">Com os parâmetros atuais</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Simulador */}
      {selectedVazio && (
        <Card className="glass-card border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calculator className="h-4 w-4 text-primary" />
              Simulador de Impacto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="font-medium">{selectedVazio.municipio.nome}</span>
                <Badge variant="outline" className="text-[10px]">
                  {selectedVazio.municipio.estado}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {selectedVazio.municipio.populacao.toLocaleString('pt-BR')}
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  {selectedVazio.indicadores.qtd_eletropostos} eletropostos
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Adicionar eletropostos</span>
                <span className="font-bold text-primary">+{qtdSimular}</span>
              </div>
              <Slider
                value={[qtdSimular]}
                onValueChange={([value]) => setQtdSimular(value)}
                min={1}
                max={10}
                step={1}
              />
            </div>

            <Separator />

            {simulacao && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2 rounded bg-red-500/10 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase">Antes</p>
                    <p className="text-lg font-bold text-red-400">{simulacao.antes.score}%</p>
                    <Badge variant="destructive" className="text-[9px]">
                      {simulacao.antes.status}
                    </Badge>
                  </div>
                  <div className="p-2 rounded bg-green-500/10 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase">Depois</p>
                    <p className="text-lg font-bold text-green-400">{simulacao.depois.score}%</p>
                    <Badge
                      variant={simulacao.depois.status === 'adequada' ? 'default' : 'secondary'}
                      className="text-[9px]"
                    >
                      {simulacao.depois.status}
                    </Badge>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                  <p className="text-xs font-medium text-primary mb-1">Impacto Estimado</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Redução de {simulacao.impacto.reducaoScore} pontos no score de criticidade</li>
                    <li>• {simulacao.impacto.populacaoImpactada.toLocaleString('pt-BR')} pessoas beneficiadas</li>
                    <li>• Novo status: <span className="font-medium">{simulacao.impacto.novoStatus}</span></li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Parâmetros */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs text-muted-foreground">Parâmetros de Análise</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Pop. mínima</span>
              <span className="font-medium">{parametros.populacaoMinima.toLocaleString('pt-BR')}</span>
            </div>
            <Slider
              value={[parametros.populacaoMinima]}
              onValueChange={([value]) => setParametros(p => ({ ...p, populacaoMinima: value }))}
              min={10000}
              max={200000}
              step={10000}
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Eletropostos/100k ideal</span>
              <span className="font-medium">{parametros.eletropostosPor100kIdeal}</span>
            </div>
            <Slider
              value={[parametros.eletropostosPor100kIdeal]}
              onValueChange={([value]) => setParametros(p => ({ ...p, eletropostosPor100kIdeal: value }))}
              min={1}
              max={20}
              step={1}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VaziosPanel;
