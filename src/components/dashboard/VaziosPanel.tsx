import { useState } from "react";
import { AlertTriangle, MapPin, Users, Zap, TrendingDown, Calculator, RefreshCw, Info, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  useVaziosTerritoriais,
  useRecalcularIndicadores,
  simularImpactoEletroposto,
  PARAMETROS_PADRAO,
  type VazioTerritorial,
  type ParametrosVazio,
  type NivelVazio,
} from "@/hooks/useVaziosTerritoriais";
import { toast } from "@/hooks/use-toast";

interface VaziosPanelProps {
  onMunicipioSelect?: (lat: number, lng: number, nome: string) => void;
}

const NivelBadge = ({ nivel }: { nivel: NivelVazio }) => {
  const config = {
    critico: { variant: 'destructive' as const, label: 'Crítico', icon: AlertTriangle },
    moderado: { variant: 'secondary' as const, label: 'Moderado', icon: AlertCircle },
    adequado: { variant: 'default' as const, label: 'Adequado', icon: CheckCircle },
  };
  const { variant, label, icon: Icon } = config[nivel];
  return (
    <Badge variant={variant} className="text-[10px] gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
};

const CriteriosTooltip = ({ vazio }: { vazio: VazioTerritorial }) => {
  const { criterios, indicadores } = vazio;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Info className="h-3 w-3" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-xs">
          <div className="space-y-2 text-xs">
            <p className="font-medium">Critérios Ativados:</p>
            <ul className="space-y-1">
              <li className={criterios.densidadeZero ? 'text-red-400' : 'text-muted-foreground'}>
                • Densidade = 0: {criterios.densidadeZero ? '✓ Sim' : '✗ Não'}
              </li>
              <li className={criterios.densidadeBaixa ? 'text-amber-400' : 'text-muted-foreground'}>
                • Densidade baixa (0.1-0.99): {criterios.densidadeBaixa ? '✓ Sim' : '✗ Não'}
              </li>
              <li className={criterios.distanciaCritica ? 'text-red-400' : 'text-muted-foreground'}>
                • Distância {'>'} 60km: {criterios.distanciaCritica ? '✓ Sim' : '✗ Não'}
              </li>
              <li className={criterios.distanciaModerada ? 'text-amber-400' : 'text-muted-foreground'}>
                • Distância 30-60km: {criterios.distanciaModerada ? '✓ Sim' : '✗ Não'}
              </li>
              <li className={criterios.populacaoRelevante ? 'text-blue-400' : 'text-muted-foreground'}>
                • População ≥ 20.000: {criterios.populacaoRelevante ? '✓ Sim' : '✗ Não'}
              </li>
            </ul>
            <Separator className="my-2" />
            <p className="text-muted-foreground">
              <strong>Valores:</strong><br />
              Eletropostos: {indicadores.qtd_eletropostos}<br />
              Densidade: {(indicadores.eletropostos_por_100k_hab ?? 0).toFixed(2)}/100k hab<br />
              Distância: {indicadores.distancia_km_mais_proximo?.toFixed(0) ?? 'N/D'} km
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const VaziosPanel = ({ onMunicipioSelect }: VaziosPanelProps) => {
  const [parametros, setParametros] = useState<ParametrosVazio>(PARAMETROS_PADRAO);
  const [selectedVazio, setSelectedVazio] = useState<VazioTerritorial | null>(null);
  const [qtdSimular, setQtdSimular] = useState(1);

  const { 
    vaziosCriticos, 
    vaziosModerados, 
    vazios, 
    adequados, 
    total, 
    totalVaziosCriticos,
    totalVaziosModerados,
    isLoading 
  } = useVaziosTerritoriais(parametros);
  
  const recalcular = useRecalcularIndicadores();

  const handleRecalcular = () => {
    recalcular.mutate(undefined, {
      onSuccess: () => {
        toast({
          title: "Indicadores recalculados",
          description: "A análise de vazios foi atualizada com os novos critérios.",
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
    ? simularImpactoEletroposto(selectedVazio.municipio, selectedVazio.indicadores, qtdSimular, parametros)
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

  const VazioItem = ({ vazio, idx, showRank = true }: { vazio: VazioTerritorial; idx: number; showRank?: boolean }) => (
    <button
      key={vazio.municipio.id}
      onClick={() => handleSelectVazio(vazio)}
      className={`w-full text-left p-3 rounded-lg transition-all ${
        selectedVazio?.municipio.id === vazio.municipio.id
          ? 'bg-primary/20 border border-primary/50'
          : 'bg-muted/30 hover:bg-muted/50 border border-transparent'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          {showRank && (
            <span className="text-xs font-bold text-muted-foreground w-5 shrink-0 mt-0.5">
              {idx + 1}º
            </span>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-medium truncate">{vazio.municipio.nome}</p>
              <NivelBadge nivel={vazio.nivel} />
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {vazio.municipio.estado} • {vazio.municipio.populacao.toLocaleString('pt-BR')} hab
            </p>
            <p className="text-[10px] text-muted-foreground/70 mt-1 line-clamp-2">
              {vazio.justificativa}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Badge
            variant={vazio.score_criticidade > 70 ? 'destructive' : vazio.score_criticidade > 40 ? 'secondary' : 'outline'}
            className="text-[10px]"
          >
            {vazio.score_criticidade}%
          </Badge>
          <CriteriosTooltip vazio={vazio} />
        </div>
      </div>
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <Card className="glass-card border-amber-500/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Vazios Energéticos
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
          {/* Summary com 4 colunas */}
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center p-2 rounded-lg bg-red-500/10 border border-red-500/30">
              <p className="text-xl font-bold text-red-400">{totalVaziosCriticos}</p>
              <p className="text-[9px] text-muted-foreground uppercase">Críticos</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <p className="text-xl font-bold text-amber-400">{totalVaziosModerados}</p>
              <p className="text-[9px] text-muted-foreground uppercase">Moderados</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-green-500/10 border border-green-500/30">
              <p className="text-xl font-bold text-green-400">{adequados.length}</p>
              <p className="text-[9px] text-muted-foreground uppercase">Adequados</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/50 border border-border">
              <p className="text-xl font-bold">{total}</p>
              <p className="text-[9px] text-muted-foreground uppercase">Total</p>
            </div>
          </div>

          {/* Coverage bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Cobertura Nacional (pop. ≥20k)</span>
              <span className="font-medium">
                {total > 0 ? Math.round((adequados.length / total) * 100) : 0}%
              </span>
            </div>
            <div className="flex gap-0.5 h-3 rounded-full overflow-hidden">
              <div 
                className="bg-red-500 transition-all" 
                style={{ width: `${(totalVaziosCriticos / total) * 100}%` }} 
              />
              <div 
                className="bg-amber-500 transition-all" 
                style={{ width: `${(totalVaziosModerados / total) * 100}%` }} 
              />
              <div 
                className="bg-green-500 transition-all" 
                style={{ width: `${(adequados.length / total) * 100}%` }} 
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>🔴 Crítico</span>
              <span>🟡 Moderado</span>
              <span>🟢 Adequado</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ranking de Vazios com Tabs */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-red-400" />
            Ranking de Municípios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="criticos">
            <TabsList className="grid w-full grid-cols-2 mb-3">
              <TabsTrigger value="criticos" className="text-xs">
                🔴 Críticos ({totalVaziosCriticos})
              </TabsTrigger>
              <TabsTrigger value="moderados" className="text-xs">
                🟡 Moderados ({totalVaziosModerados})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="criticos">
              <ScrollArea className="h-[220px] pr-2">
                <div className="space-y-2">
                  {vaziosCriticos.slice(0, 15).map((vazio, idx) => (
                    <VazioItem key={vazio.municipio.id} vazio={vazio} idx={idx} />
                  ))}
                  {vaziosCriticos.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500 opacity-50" />
                      <p>Nenhum vazio crítico identificado</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="moderados">
              <ScrollArea className="h-[220px] pr-2">
                <div className="space-y-2">
                  {vaziosModerados.slice(0, 15).map((vazio, idx) => (
                    <VazioItem key={vazio.municipio.id} vazio={vazio} idx={idx} />
                  ))}
                  {vaziosModerados.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500 opacity-50" />
                      <p>Nenhum vazio moderado identificado</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
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
                <NivelBadge nivel={selectedVazio.nivel} />
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
              <p className="text-[10px] text-muted-foreground/70 mt-2 italic">
                {selectedVazio.justificativa}
              </p>
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
                  <div className="p-3 rounded bg-red-500/10 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase">Antes</p>
                    <p className="text-lg font-bold text-red-400">{simulacao.antes.score}%</p>
                    <NivelBadge nivel={simulacao.antes.nivel} />
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {simulacao.antes.densidade.toFixed(2)}/100k
                    </p>
                  </div>
                  <div className="p-3 rounded bg-green-500/10 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase">Depois</p>
                    <p className="text-lg font-bold text-green-400">{simulacao.depois.score}%</p>
                    <NivelBadge nivel={simulacao.depois.nivel} />
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {simulacao.depois.densidade.toFixed(2)}/100k
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                  <p className="text-xs font-medium text-primary mb-2">Impacto Estimado</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Redução de <strong>{simulacao.impacto.reducaoScore}</strong> pontos no score</li>
                    <li>• <strong>{simulacao.impacto.populacaoImpactada.toLocaleString('pt-BR')}</strong> pessoas beneficiadas</li>
                    <li>• Ganho de densidade: <strong>+{simulacao.impacto.ganhoDensidade.toFixed(2)}</strong>/100k hab</li>
                    <li>• Novo nível: <strong className="capitalize">{simulacao.impacto.novoNivel}</strong></li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Critérios Técnicos (Transparência) */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs text-muted-foreground flex items-center gap-2">
            <Info className="h-3 w-3" />
            Critérios Técnicos (v1.0)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-2 rounded bg-muted/30">
              <p className="font-medium mb-1">Densidade</p>
              <p className="text-muted-foreground">
                🟢 ≥ {parametros.densidadeAdequada}/100k<br />
                🟡 {parametros.densidadeBaixa}-{parametros.densidadeAdequada}/100k<br />
                🔴 = 0
              </p>
            </div>
            <div className="p-2 rounded bg-muted/30">
              <p className="font-medium mb-1">Distância</p>
              <p className="text-muted-foreground">
                🟢 ≤ {parametros.distanciaAdequada}km<br />
                🟡 {parametros.distanciaAdequada}-{parametros.distanciaModerada}km<br />
                🔴 {'>'} {parametros.distanciaCritica}km
              </p>
            </div>
          </div>
          <div className="p-2 rounded bg-muted/30">
            <p className="font-medium mb-1">Regra de Classificação</p>
            <p className="text-muted-foreground">
              <strong>Crítico:</strong> densidade = 0 E distância {'>'} 60km<br />
              <strong>Moderado:</strong> densidade baixa OU distância 30-60km<br />
              <strong>Adequado:</strong> atende critérios mínimos
            </p>
          </div>
          <div className="p-2 rounded bg-blue-500/10 border border-blue-500/30">
            <p className="text-muted-foreground">
              <strong>Pop. mínima relevante:</strong> {parametros.populacaoMinima.toLocaleString('pt-BR')} hab
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Ajuste de Parâmetros */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs text-muted-foreground">Ajustar Parâmetros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Pop. mínima relevante</span>
              <span className="font-medium">{parametros.populacaoMinima.toLocaleString('pt-BR')}</span>
            </div>
            <Slider
              value={[parametros.populacaoMinima]}
              onValueChange={([value]) => setParametros(p => ({ ...p, populacaoMinima: value }))}
              min={5000}
              max={100000}
              step={5000}
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Densidade adequada (/100k)</span>
              <span className="font-medium">{parametros.densidadeAdequada}</span>
            </div>
            <Slider
              value={[parametros.densidadeAdequada]}
              onValueChange={([value]) => setParametros(p => ({ ...p, densidadeAdequada: value }))}
              min={0.5}
              max={5}
              step={0.5}
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Distância crítica (km)</span>
              <span className="font-medium">{parametros.distanciaCritica}km</span>
            </div>
            <Slider
              value={[parametros.distanciaCritica]}
              onValueChange={([value]) => setParametros(p => ({ 
                ...p, 
                distanciaCritica: value,
                distanciaModerada: value 
              }))}
              min={30}
              max={150}
              step={10}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VaziosPanel;
