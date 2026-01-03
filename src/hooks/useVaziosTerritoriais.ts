import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Municipio {
  id: string;
  codigo_ibge: string;
  nome: string;
  estado: string;
  regiao: string;
  populacao: number;
  area_km2: number | null;
  latitude: number | null;
  longitude: number | null;
}

export interface IndicadorEnergia {
  id: string;
  municipio_id: string;
  qtd_eletropostos: number;
  potencia_total_kw: number | null;
  eletropostos_por_100k_hab: number | null;
  populacao_ref: number;
  distancia_km_mais_proximo: number | null;
  status_cobertura: 'adequada' | 'critica' | 'inexistente';
  is_vazio_territorial: boolean;
  justificativa_vazio: string | null;
  ultima_analise: string | null;
}

export interface MunicipioComIndicadores extends Municipio {
  indicadores: IndicadorEnergia | null;
}

export interface VazioTerritorial {
  municipio: Municipio;
  indicadores: IndicadorEnergia;
  score_criticidade: number; // 0-100
}

// Parâmetros ajustáveis para análise de vazios
export interface ParametrosVazio {
  populacaoMinima: number;        // Mínimo de habitantes para considerar
  eletropostosMinimo: number;     // Abaixo disso é crítico
  distanciaMaximaKm: number;      // Distância máxima do mais próximo
  eletropostosPor100kIdeal: number; // Meta de eletropostos por 100k hab
}

export const PARAMETROS_PADRAO: ParametrosVazio = {
  populacaoMinima: 50000,
  eletropostosMinimo: 1,
  distanciaMaximaKm: 100,
  eletropostosPor100kIdeal: 5, // 5 eletropostos por 100k habitantes
};

// Buscar todos os municípios
export const useMunicipios = () => {
  return useQuery({
    queryKey: ['municipios'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('municipios')
        .select('*')
        .order('populacao', { ascending: false });
      
      if (error) throw error;
      return data as Municipio[];
    },
  });
};

// Buscar indicadores de energia
export const useIndicadoresEnergia = () => {
  return useQuery({
    queryKey: ['indicadores_energia'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('indicadores_energia')
        .select('*');
      
      if (error) throw error;
      return data as IndicadorEnergia[];
    },
  });
};

// Buscar municípios com indicadores
export const useMunicipiosComIndicadores = () => {
  const { data: municipios, isLoading: loadingMunicipios } = useMunicipios();
  const { data: indicadores, isLoading: loadingIndicadores } = useIndicadoresEnergia();

  const municipiosComIndicadores: MunicipioComIndicadores[] = municipios?.map(mun => ({
    ...mun,
    indicadores: indicadores?.find(ind => ind.municipio_id === mun.id) || null,
  })) || [];

  return {
    data: municipiosComIndicadores,
    isLoading: loadingMunicipios || loadingIndicadores,
  };
};

// Calcular score de criticidade (0-100, maior = mais crítico)
export function calcularScoreCriticidade(
  municipio: Municipio,
  indicadores: IndicadorEnergia | null,
  parametros: ParametrosVazio = PARAMETROS_PADRAO
): number {
  if (!indicadores) return 100; // Sem dados = máxima criticidade

  let score = 0;
  
  // Fator 1: Quantidade de eletropostos (40% do score)
  if (indicadores.qtd_eletropostos === 0) {
    score += 40;
  } else if (indicadores.qtd_eletropostos < parametros.eletropostosMinimo) {
    score += 30;
  } else {
    const ratio = indicadores.eletropostos_por_100k_hab || 0;
    const deficit = Math.max(0, parametros.eletropostosPor100kIdeal - ratio) / parametros.eletropostosPor100kIdeal;
    score += deficit * 40;
  }

  // Fator 2: População (30% do score) - mais população = mais crítico se não tem cobertura
  const popNormalizada = Math.min(municipio.populacao / 1000000, 1); // Normalizar até 1M
  if (indicadores.qtd_eletropostos === 0) {
    score += popNormalizada * 30;
  }

  // Fator 3: Distância do mais próximo (30% do score)
  if (indicadores.distancia_km_mais_proximo !== null) {
    const distNormalizada = Math.min(indicadores.distancia_km_mais_proximo / parametros.distanciaMaximaKm, 1);
    score += distNormalizada * 30;
  } else if (indicadores.qtd_eletropostos === 0) {
    score += 30; // Sem dados de distância e sem eletropostos = crítico
  }

  return Math.round(Math.min(score, 100));
}

// Classificar status de cobertura
export function classificarCobertura(
  municipio: Municipio,
  qtdEletropostos: number,
  parametros: ParametrosVazio = PARAMETROS_PADRAO
): 'adequada' | 'critica' | 'inexistente' {
  if (qtdEletropostos === 0) return 'inexistente';
  
  const por100k = (qtdEletropostos / municipio.populacao) * 100000;
  
  if (por100k >= parametros.eletropostosPor100kIdeal * 0.5) {
    return 'adequada';
  }
  return 'critica';
}

// Gerar justificativa de vazio
export function gerarJustificativaVazio(
  municipio: Municipio,
  indicadores: IndicadorEnergia,
  parametros: ParametrosVazio = PARAMETROS_PADRAO
): string {
  const razoes: string[] = [];

  if (indicadores.qtd_eletropostos === 0) {
    razoes.push('Nenhum eletroposto cadastrado');
  } else if (indicadores.qtd_eletropostos < parametros.eletropostosMinimo) {
    razoes.push(`Apenas ${indicadores.qtd_eletropostos} eletroposto(s)`);
  }

  if (municipio.populacao >= parametros.populacaoMinima) {
    razoes.push(`População de ${municipio.populacao.toLocaleString('pt-BR')} habitantes`);
  }

  if (indicadores.distancia_km_mais_proximo && indicadores.distancia_km_mais_proximo > parametros.distanciaMaximaKm) {
    razoes.push(`Distância de ${indicadores.distancia_km_mais_proximo.toFixed(0)}km do eletroposto mais próximo`);
  }

  return razoes.join('; ');
}

// Hook para análise de vazios territoriais
export const useVaziosTerritoriais = (parametros: ParametrosVazio = PARAMETROS_PADRAO) => {
  const { data: municipiosComIndicadores, isLoading } = useMunicipiosComIndicadores();

  const vazios: VazioTerritorial[] = [];
  const adequados: MunicipioComIndicadores[] = [];

  municipiosComIndicadores?.forEach(mun => {
    const score = calcularScoreCriticidade(mun, mun.indicadores, parametros);
    
    // Considerar vazio se score > 50 e população relevante
    if (score > 50 && mun.populacao >= parametros.populacaoMinima) {
      vazios.push({
        municipio: mun,
        indicadores: mun.indicadores || {
          id: '',
          municipio_id: mun.id,
          qtd_eletropostos: 0,
          potencia_total_kw: null,
          eletropostos_por_100k_hab: null,
          populacao_ref: mun.populacao,
          distancia_km_mais_proximo: null,
          status_cobertura: 'inexistente',
          is_vazio_territorial: true,
          justificativa_vazio: 'Sem dados de cobertura',
          ultima_analise: null,
        },
        score_criticidade: score,
      });
    } else {
      adequados.push(mun);
    }
  });

  // Ordenar vazios por criticidade
  vazios.sort((a, b) => b.score_criticidade - a.score_criticidade);

  return {
    vazios,
    adequados,
    total: municipiosComIndicadores?.length || 0,
    totalVazios: vazios.length,
    isLoading,
  };
};

// Hook para recalcular indicadores baseado nos eletropostos
export const useRecalcularIndicadores = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Buscar municípios e eletropostos
      const { data: municipios } = await supabase.from('municipios').select('*');
      const { data: evStations } = await supabase.from('ev_stations').select('*').eq('country_code', 'BR');

      if (!municipios) return;

      // Para cada município, calcular indicadores
      for (const mun of municipios) {
        // Contar eletropostos no município (aproximação por cidade/estado)
        const estacoesMunicipio = evStations?.filter(
          ev => ev.city?.toLowerCase() === mun.nome.toLowerCase() || 
                ev.state === mun.estado
        ) || [];

        const qtd = estacoesMunicipio.length;
        const potencia = estacoesMunicipio.reduce((acc, ev) => acc + (ev.power_kw || 0), 0);

        const status = classificarCobertura(mun as Municipio, qtd);
        const isVazio = status === 'inexistente' && mun.populacao >= PARAMETROS_PADRAO.populacaoMinima;

        // Upsert indicadores
        await supabase.from('indicadores_energia').upsert({
          municipio_id: mun.id,
          qtd_eletropostos: qtd,
          potencia_total_kw: potencia,
          populacao_ref: mun.populacao,
          status_cobertura: status,
          is_vazio_territorial: isVazio,
          justificativa_vazio: isVazio ? gerarJustificativaVazio(
            mun as Municipio,
            { qtd_eletropostos: qtd } as IndicadorEnergia
          ) : null,
          ultima_analise: new Date().toISOString(),
        }, { onConflict: 'municipio_id' });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['indicadores_energia'] });
    },
  });
};

// Simular impacto de adicionar eletroposto
export function simularImpactoEletroposto(
  municipio: Municipio,
  indicadoresAtuais: IndicadorEnergia | null,
  qtdAdicionar: number = 1
): {
  antes: { status: string; score: number };
  depois: { status: string; score: number };
  impacto: {
    reducaoScore: number;
    novoStatus: string;
    populacaoImpactada: number;
  };
} {
  const qtdAtual = indicadoresAtuais?.qtd_eletropostos || 0;
  const qtdNova = qtdAtual + qtdAdicionar;

  const statusAntes = classificarCobertura(municipio, qtdAtual);
  const scoreAntes = calcularScoreCriticidade(municipio, indicadoresAtuais);

  const indicadoresSimulados: IndicadorEnergia = {
    ...indicadoresAtuais || {
      id: '',
      municipio_id: municipio.id,
      potencia_total_kw: null,
      eletropostos_por_100k_hab: null,
      populacao_ref: municipio.populacao,
      distancia_km_mais_proximo: null,
      is_vazio_territorial: false,
      justificativa_vazio: null,
      ultima_analise: null,
    },
    qtd_eletropostos: qtdNova,
    status_cobertura: classificarCobertura(municipio, qtdNova),
  };

  const statusDepois = indicadoresSimulados.status_cobertura;
  const scoreDepois = calcularScoreCriticidade(municipio, indicadoresSimulados);

  return {
    antes: { status: statusAntes, score: scoreAntes },
    depois: { status: statusDepois, score: scoreDepois },
    impacto: {
      reducaoScore: scoreAntes - scoreDepois,
      novoStatus: statusDepois,
      populacaoImpactada: municipio.populacao,
    },
  };
}
