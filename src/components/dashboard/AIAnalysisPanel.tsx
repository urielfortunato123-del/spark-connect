import { useState } from "react";
import { Brain, Sparkles, Loader2, MapPin, Zap, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Recommendation {
  city?: string;
  location?: string;
  state?: string;
  type?: string;
  priority: string;
  reason: string;
  coordinates?: { lat: number; lng: number };
}

interface AIAnalysisPanelProps {
  onRecommendationsUpdate: (recommendations: any[]) => void;
}

const AIAnalysisPanel = ({ onRecommendationsUpdate }: AIAnalysisPanelProps) => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisType, setAnalysisType] = useState<"tower" | "ev" | "strategic" | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  const runAnalysis = async (type: "tower" | "ev" | "strategic") => {
    setIsAnalyzing(true);
    setAnalysisType(type);
    setRecommendations([]);

    try {
      let requestData = {};
      let apiType = "";

      if (type === "tower") {
        apiType = "tower_analysis";
        requestData = {
          totalTowers: 48247,
          coveredMunicipalities: 1395,
          populationCoverage: 75.8,
          lowCoverageRegions: ["Norte", "Centro-Oeste", "Interior do Nordeste"]
        };
      } else if (type === "ev") {
        apiType = "ev_station_analysis";
        requestData = {
          totalStations: 3850,
          coveredStates: 24,
          highways: ["BR-116", "BR-101", "BR-040", "BR-381"],
          gaps: ["Interior de Minas", "Norte do Paraná", "Litoral do Nordeste"]
        };
      } else {
        apiType = "strategic_report";
        requestData = {
          towers5g: 48247,
          evStations: 3850,
          coverage: 75.8,
          target2027: "95% cobertura urbana"
        };
      }

      const { data, error } = await supabase.functions.invoke("infrastructure-ai", {
        body: { type: apiType, data: requestData }
      });

      if (error) throw error;

      if (data?.data?.recommendations) {
        setRecommendations(data.data.recommendations);
        
        // Format for map display
        const mapRecommendations = data.data.recommendations
          .filter((r: Recommendation) => r.coordinates)
          .map((r: Recommendation) => ({
            lat: r.coordinates!.lat,
            lng: r.coordinates!.lng,
            type: type === "ev" ? "ev" : "tower",
            priority: r.priority
          }));
        
        onRecommendationsUpdate(mapRecommendations);
      }

      toast({
        title: "Análise Concluída",
        description: `A IA identificou ${data?.data?.recommendations?.length || 0} recomendações estratégicas.`,
      });

    } catch (error: any) {
      console.error("Analysis error:", error);
      toast({
        title: "Erro na Análise",
        description: error.message || "Não foi possível completar a análise.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="glass-card p-5 h-full overflow-hidden flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <div className="absolute inset-0 bg-accent/30 rounded-full blur-lg animate-pulse" />
          <Brain className="w-8 h-8 text-accent relative z-10" />
        </div>
        <div>
          <h2 className="text-lg font-display font-bold gradient-text-cyber">
            Análise com IA
          </h2>
          <p className="text-xs text-muted-foreground">
            Recomendações estratégicas em tempo real
          </p>
        </div>
      </div>

      {/* Analysis Buttons */}
      <div className="grid grid-cols-1 gap-3 mb-6">
        <AnalysisButton
          icon={<MapPin className="w-4 h-4" />}
          label="Analisar Novas Torres 5G"
          description="Identifica locais prioritários para expansão"
          onClick={() => runAnalysis("tower")}
          isLoading={isAnalyzing && analysisType === "tower"}
          disabled={isAnalyzing}
        />
        <AnalysisButton
          icon={<Zap className="w-4 h-4" />}
          label="Analisar Estações EV"
          description="Sugere pontos de recarga estratégicos"
          onClick={() => runAnalysis("ev")}
          isLoading={isAnalyzing && analysisType === "ev"}
          disabled={isAnalyzing}
        />
        <AnalysisButton
          icon={<TrendingUp className="w-4 h-4" />}
          label="Relatório Estratégico"
          description="Visão geral de oportunidades"
          onClick={() => runAnalysis("strategic")}
          isLoading={isAnalyzing && analysisType === "strategic"}
          disabled={isAnalyzing}
        />
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <Loader2 className="w-12 h-12 text-primary animate-spin relative z-10" />
            </div>
            <p className="text-sm text-muted-foreground animate-pulse">
              Processando análise com IA...
            </p>
          </div>
        )}

        {!isAnalyzing && recommendations.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">
                {recommendations.length} Recomendações
              </span>
            </div>
            
            {recommendations.map((rec, index) => (
              <RecommendationCard key={index} recommendation={rec} index={index} />
            ))}
          </div>
        )}

        {!isAnalyzing && recommendations.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">
              Selecione uma análise para iniciar
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

interface AnalysisButtonProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  isLoading: boolean;
  disabled: boolean;
}

const AnalysisButton = ({ icon, label, description, onClick, isLoading, disabled }: AnalysisButtonProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="w-full text-left p-4 rounded-xl bg-secondary/50 border border-border/50 hover:border-primary/50 hover:bg-secondary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
  >
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg bg-primary/20 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all ${isLoading ? 'animate-pulse' : ''}`}>
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      </div>
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  </button>
);

interface RecommendationCardProps {
  recommendation: Recommendation;
  index: number;
}

const RecommendationCard = ({ recommendation, index }: RecommendationCardProps) => {
  const priorityColors = {
    alta: "bg-red-500/20 text-red-400 border-red-500/30",
    media: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    baixa: "bg-green-500/20 text-green-400 border-green-500/30",
  };

  const priorityClass = priorityColors[recommendation.priority as keyof typeof priorityColors] || priorityColors.media;

  return (
    <div 
      className="p-4 rounded-xl bg-secondary/30 border border-border/30 hover:border-primary/30 transition-all animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-sm">
          {recommendation.city || recommendation.location}
          {recommendation.state && <span className="text-muted-foreground"> - {recommendation.state}</span>}
        </h4>
        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold border ${priorityClass}`}>
          {recommendation.priority}
        </span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {recommendation.reason}
      </p>
    </div>
  );
};

export default AIAnalysisPanel;
