-- =============================================
-- MÓDULO 01: Eletropostos & Vazios Territoriais
-- =============================================

-- Tabela: municipios (dados IBGE)
CREATE TABLE public.municipios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo_ibge VARCHAR(7) NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  estado VARCHAR(2) NOT NULL,
  regiao TEXT NOT NULL,
  populacao INTEGER NOT NULL DEFAULT 0,
  area_km2 NUMERIC,
  latitude NUMERIC,
  longitude NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_municipios_estado ON public.municipios(estado);
CREATE INDEX idx_municipios_populacao ON public.municipios(populacao DESC);
CREATE INDEX idx_municipios_coords ON public.municipios(latitude, longitude);

-- Tabela: indicadores_energia (análise por município)
CREATE TABLE public.indicadores_energia (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  municipio_id UUID NOT NULL REFERENCES public.municipios(id) ON DELETE CASCADE,
  qtd_eletropostos INTEGER NOT NULL DEFAULT 0,
  potencia_total_kw NUMERIC DEFAULT 0,
  eletropostos_por_100k_hab NUMERIC GENERATED ALWAYS AS (
    CASE WHEN populacao_ref > 0 THEN (qtd_eletropostos::NUMERIC / populacao_ref * 100000) ELSE 0 END
  ) STORED,
  populacao_ref INTEGER NOT NULL DEFAULT 0,
  distancia_km_mais_proximo NUMERIC,
  status_cobertura TEXT NOT NULL DEFAULT 'inexistente' CHECK (status_cobertura IN ('adequada', 'critica', 'inexistente')),
  is_vazio_territorial BOOLEAN NOT NULL DEFAULT false,
  justificativa_vazio TEXT,
  ultima_analise TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(municipio_id)
);

-- Índices para análise de vazios
CREATE INDEX idx_indicadores_status ON public.indicadores_energia(status_cobertura);
CREATE INDEX idx_indicadores_vazio ON public.indicadores_energia(is_vazio_territorial);
CREATE INDEX idx_indicadores_municipio ON public.indicadores_energia(municipio_id);

-- Enable RLS
ALTER TABLE public.municipios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indicadores_energia ENABLE ROW LEVEL SECURITY;

-- Políticas de leitura pública (dados governamentais)
CREATE POLICY "Public read access for municipios"
ON public.municipios FOR SELECT
USING (true);

CREATE POLICY "Public read access for indicadores_energia"
ON public.indicadores_energia FOR SELECT
USING (true);

-- Políticas de escrita (para o sistema/admin)
CREATE POLICY "System insert for municipios"
ON public.municipios FOR INSERT
WITH CHECK (true);

CREATE POLICY "System update for municipios"
ON public.municipios FOR UPDATE
USING (true);

CREATE POLICY "System insert for indicadores_energia"
ON public.indicadores_energia FOR INSERT
WITH CHECK (true);

CREATE POLICY "System update for indicadores_energia"
ON public.indicadores_energia FOR UPDATE
USING (true);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_municipios_updated_at
BEFORE UPDATE ON public.municipios
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_indicadores_energia_updated_at
BEFORE UPDATE ON public.indicadores_energia
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();