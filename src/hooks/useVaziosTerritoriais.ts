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
  status_cobertura: 'adequada' | 'atencao' | 'critica' | 'inexistente';
  is_vazio_territorial: boolean;
  justificativa_vazio: string | null;
  ultima_analise: string | null;
}

export interface MunicipioComIndicadores extends Municipio {
  indicadores: IndicadorEnergia | null;
}

// Níveis de severidade do vazio energético
export type NivelVazio = 'critico' | 'moderado' | 'adequado';

export interface CriteriosAtivados {
  densidadeZero: boolean;
  densidadeBaixa: boolean;
  distanciaCritica: boolean;      // > 60km
  distanciaModerada: boolean;     // 30-60km
  populacaoRelevante: boolean;    // >= 20.000
}

export interface VazioTerritorial {
  municipio: Municipio;
  indicadores: IndicadorEnergia;
  nivel: NivelVazio;
  score_criticidade: number;
  criterios: CriteriosAtivados;
  justificativa: string;
}

// Parâmetros técnicos ajustáveis (conforme documento)
export interface ParametrosVazio {
  // Indicador 1: Densidade
  densidadeAdequada: number;      // >= 1.0 eletropostos/100k hab
  densidadeBaixa: number;         // 0.1 a 0.99

  // Indicador 2: Distância
  distanciaAdequada: number;      // <= 30 km
  distanciaModerada: number;      // 30-60 km
  distanciaCritica: number;       // > 60 km

  // Indicador 3: População mínima relevante
  populacaoMinima: number;        // >= 20.000 habitantes
}

export const PARAMETROS_PADRAO: ParametrosVazio = {
  densidadeAdequada: 1.0,
  densidadeBaixa: 0.1,
  distanciaAdequada: 30,
  distanciaModerada: 60,
  distanciaCritica: 60,
  populacaoMinima: 20000,
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

// Calcular densidade de eletropostos por 100k habitantes
export function calcularDensidade(qtdEletropostos: number, populacao: number): number {
  if (populacao === 0) return 0;
  return (qtdEletropostos / populacao) * 100000;
}

// Avaliar critérios ativados para um município
export function avaliarCriterios(
  municipio: Municipio,
  indicadores: IndicadorEnergia | null,
  parametros: ParametrosVazio = PARAMETROS_PADRAO
): CriteriosAtivados {
  const densidade = indicadores?.eletropostos_por_100k_hab ?? 
    calcularDensidade(indicadores?.qtd_eletropostos ?? 0, municipio.populacao);
  
  const distancia = indicadores?.distancia_km_mais_proximo ?? null;

  return {
    densidadeZero: densidade === 0,
    densidadeBaixa: densidade > 0 && densidade < parametros.densidadeAdequada,
    distanciaCritica: distancia !== null ? distancia > parametros.distanciaCritica : (indicadores?.qtd_eletropostos ?? 0) === 0,
    distanciaModerada: distancia !== null ? (distancia > parametros.distanciaAdequada && distancia <= parametros.distanciaModerada) : false,
    populacaoRelevante: municipio.populacao >= parametros.populacaoMinima,
  };
}

// Classificar nível de vazio energético
export function classificarNivelVazio(criterios: CriteriosAtivados): NivelVazio {
  // 🔴 Vazio Crítico: densidade = 0 E distância > 60km
  if (criterios.densidadeZero && criterios.distanciaCritica) {
    return 'critico';
  }

  // 🟡 Vazio Moderado: densidade baixa OU distância entre 30-60km
  if (criterios.densidadeBaixa || criterios.distanciaModerada) {
    return 'moderado';
  }

  // 🟢 Cobertura Aceitável
  return 'adequado';
}

// Classificar status de cobertura (para banco de dados)
export function classificarCobertura(
  densidade: number,
  distancia: number | null,
  parametros: ParametrosVazio = PARAMETROS_PADRAO
): 'adequada' | 'atencao' | 'critica' | 'inexistente' {
  if (densidade === 0) return 'inexistente';
  
  if (densidade >= parametros.densidadeAdequada && 
      (distancia === null || distancia <= parametros.distanciaAdequada)) {
    return 'adequada';
  }
  
  if (densidade >= parametros.densidadeBaixa) {
    return 'atencao';
  }
  
  return 'critica';
}

// Calcular score de criticidade (0-100, maior = mais crítico)
export function calcularScoreCriticidade(
  municipio: Municipio,
  indicadores: IndicadorEnergia | null,
  criterios: CriteriosAtivados,
  parametros: ParametrosVazio = PARAMETROS_PADRAO
): number {
  if (!indicadores) return criterios.populacaoRelevante ? 100 : 50;

  let score = 0;
  
  // Fator 1: Densidade (40% do score)
  if (criterios.densidadeZero) {
    score += 40;
  } else if (criterios.densidadeBaixa) {
    const densidade = indicadores.eletropostos_por_100k_hab ?? 0;
    const deficit = (parametros.densidadeAdequada - densidade) / parametros.densidadeAdequada;
    score += Math.min(deficit * 40, 30);
  }

  // Fator 2: Distância (35% do score)
  if (criterios.distanciaCritica) {
    score += 35;
  } else if (criterios.distanciaModerada) {
    score += 20;
  }

  // Fator 3: População (25% do score) - amplifica criticidade
  if (criterios.populacaoRelevante) {
    const popNormalizada = Math.min(municipio.populacao / 500000, 1);
    if (criterios.densidadeZero || criterios.distanciaCritica) {
      score += popNormalizada * 25;
    }
  }

  return Math.round(Math.min(score, 100));
}

// Gerar justificativa técnica transparente
export function gerarJustificativa(
  municipio: Municipio,
  indicadores: IndicadorEnergia | null,
  criterios: CriteriosAtivados,
  nivel: NivelVazio,
  parametros: ParametrosVazio = PARAMETROS_PADRAO
): string {
  const razoes: string[] = [];
  const densidade = indicadores?.eletropostos_por_100k_hab ?? 
    calcularDensidade(indicadores?.qtd_eletropostos ?? 0, municipio.populacao);
  const distancia = indicadores?.distancia_km_mais_proximo;

  if (nivel === 'critico') {
    razoes.push('Classificado como Vazio Crítico');
  } else if (nivel === 'moderado') {
    razoes.push('Classificado como Vazio Moderado');
  } else {
    razoes.push('Cobertura Aceitável');
  }

  if (criterios.densidadeZero) {
    razoes.push('ausência de eletropostos');
  } else if (criterios.densidadeBaixa) {
    razoes.push(`densidade baixa (${densidade.toFixed(2)}/100k hab, ideal ≥${parametros.densidadeAdequada})`);
  }

  if (criterios.distanciaCritica && distancia) {
    razoes.push(`distância superior a ${parametros.distanciaCritica}km (${distancia.toFixed(0)}km)`);
  } else if (criterios.distanciaModerada && distancia) {
    razoes.push(`distância moderada de ${distancia.toFixed(0)}km`);
  }

  if (criterios.populacaoRelevante) {
    razoes.push(`população de ${municipio.populacao.toLocaleString('pt-BR')} habitantes`);
  }

  return razoes.join(' por ') + '.';
}

// Hook principal para análise de vazios territoriais
export const useVaziosTerritoriais = (parametros: ParametrosVazio = PARAMETROS_PADRAO) => {
  const { data: municipiosComIndicadores, isLoading } = useMunicipiosComIndicadores();

  const vaziosCriticos: VazioTerritorial[] = [];
  const vaziosModerados: VazioTerritorial[] = [];
  const adequados: MunicipioComIndicadores[] = [];

  municipiosComIndicadores?.forEach(mun => {
    const criterios = avaliarCriterios(mun, mun.indicadores, parametros);
    const nivel = classificarNivelVazio(criterios);
    
    // Só considera para ranking se tem população relevante
    if (!criterios.populacaoRelevante) {
      adequados.push(mun);
      return;
    }

    const indicadores = mun.indicadores || {
      id: '',
      municipio_id: mun.id,
      qtd_eletropostos: 0,
      potencia_total_kw: null,
      eletropostos_por_100k_hab: 0,
      populacao_ref: mun.populacao,
      distancia_km_mais_proximo: null,
      status_cobertura: 'inexistente' as const,
      is_vazio_territorial: true,
      justificativa_vazio: null,
      ultima_analise: null,
    };

    const score = calcularScoreCriticidade(mun, mun.indicadores, criterios, parametros);
    const justificativa = gerarJustificativa(mun, mun.indicadores, criterios, nivel, parametros);

    const vazio: VazioTerritorial = {
      municipio: mun,
      indicadores,
      nivel,
      score_criticidade: score,
      criterios,
      justificativa,
    };

    if (nivel === 'critico') {
      vaziosCriticos.push(vazio);
    } else if (nivel === 'moderado') {
      vaziosModerados.push(vazio);
    } else {
      adequados.push(mun);
    }
  });

  // Ordenar por criticidade
  vaziosCriticos.sort((a, b) => b.score_criticidade - a.score_criticidade);
  vaziosModerados.sort((a, b) => b.score_criticidade - a.score_criticidade);

  const todosVazios = [...vaziosCriticos, ...vaziosModerados];

  return {
    vaziosCriticos,
    vaziosModerados,
    vazios: todosVazios,
    adequados,
    total: municipiosComIndicadores?.length || 0,
    totalVaziosCriticos: vaziosCriticos.length,
    totalVaziosModerados: vaziosModerados.length,
    totalVazios: todosVazios.length,
    isLoading,
    parametros,
  };
};

// Hook para recalcular indicadores baseado nos eletropostos
export const useRecalcularIndicadores = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data: municipios } = await supabase.from('municipios').select('*');
      const { data: evStations } = await supabase.from('ev_stations').select('*').eq('country_code', 'BR');

      if (!municipios) return;

      for (const mun of municipios) {
        const estacoesMunicipio = evStations?.filter(
          ev => ev.city?.toLowerCase() === mun.nome.toLowerCase() && 
                ev.state === mun.estado
        ) || [];

        const qtd = estacoesMunicipio.length;
        const potencia = estacoesMunicipio.reduce((acc, ev) => acc + (Number(ev.power_kw) || 0), 0);
        const densidade = calcularDensidade(qtd, mun.populacao);
        
        const criterios = avaliarCriterios(mun as Municipio, {
          qtd_eletropostos: qtd,
          eletropostos_por_100k_hab: densidade,
          distancia_km_mais_proximo: null,
        } as IndicadorEnergia);
        
        const nivel = classificarNivelVazio(criterios);
        const isVazio = nivel !== 'adequado' && mun.populacao >= PARAMETROS_PADRAO.populacaoMinima;
        const status = classificarCobertura(densidade, null);

        await supabase.from('indicadores_energia').upsert({
          municipio_id: mun.id,
          qtd_eletropostos: qtd,
          potencia_total_kw: potencia,
          eletropostos_por_100k_hab: densidade,
          populacao_ref: mun.populacao,
          status_cobertura: status,
          is_vazio_territorial: isVazio,
          justificativa_vazio: isVazio ? gerarJustificativa(
            mun as Municipio,
            { qtd_eletropostos: qtd, eletropostos_por_100k_hab: densidade, distancia_km_mais_proximo: null } as IndicadorEnergia,
            criterios,
            nivel
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
  qtdAdicionar: number = 1,
  parametros: ParametrosVazio = PARAMETROS_PADRAO
): {
  antes: { nivel: NivelVazio; status: string; score: number; densidade: number };
  depois: { nivel: NivelVazio; status: string; score: number; densidade: number };
  impacto: {
    reducaoScore: number;
    novoNivel: NivelVazio;
    populacaoImpactada: number;
    ganhoDensidade: number;
  };
} {
  const qtdAtual = indicadoresAtuais?.qtd_eletropostos || 0;
  const qtdNova = qtdAtual + qtdAdicionar;

  const densidadeAntes = calcularDensidade(qtdAtual, municipio.populacao);
  const densidadeDepois = calcularDensidade(qtdNova, municipio.populacao);

  const criteriosAntes = avaliarCriterios(municipio, indicadoresAtuais, parametros);
  const nivelAntes = classificarNivelVazio(criteriosAntes);
  const scoreAntes = calcularScoreCriticidade(municipio, indicadoresAtuais, criteriosAntes, parametros);
  const statusAntes = classificarCobertura(densidadeAntes, indicadoresAtuais?.distancia_km_mais_proximo ?? null, parametros);

  const indicadoresSimulados: IndicadorEnergia = {
    ...indicadoresAtuais || {
      id: '',
      municipio_id: municipio.id,
      potencia_total_kw: null,
      populacao_ref: municipio.populacao,
      distancia_km_mais_proximo: 0, // Assumindo que novo eletroposto está no município
      is_vazio_territorial: false,
      justificativa_vazio: null,
      ultima_analise: null,
    },
    qtd_eletropostos: qtdNova,
    eletropostos_por_100k_hab: densidadeDepois,
    distancia_km_mais_proximo: 0, // Novo eletroposto no município
    status_cobertura: classificarCobertura(densidadeDepois, 0, parametros),
  };

  const criteriosDepois = avaliarCriterios(municipio, indicadoresSimulados, parametros);
  const nivelDepois = classificarNivelVazio(criteriosDepois);
  const scoreDepois = calcularScoreCriticidade(municipio, indicadoresSimulados, criteriosDepois, parametros);
  const statusDepois = indicadoresSimulados.status_cobertura;

  return {
    antes: { nivel: nivelAntes, status: statusAntes, score: scoreAntes, densidade: densidadeAntes },
    depois: { nivel: nivelDepois, status: statusDepois, score: scoreDepois, densidade: densidadeDepois },
    impacto: {
      reducaoScore: scoreAntes - scoreDepois,
      novoNivel: nivelDepois,
      populacaoImpactada: municipio.populacao,
      ganhoDensidade: densidadeDepois - densidadeAntes,
    },
  };
}
