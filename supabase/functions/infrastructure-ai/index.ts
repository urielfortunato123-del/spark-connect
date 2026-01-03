import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// System prompt with comprehensive knowledge about the platform
const SYSTEM_PROMPT = `Você é o InfraBot, o assistente de IA especializado em infraestrutura do Brasil. Você tem acesso completo a todos os dados e módulos da plataforma InfraBrasil.

## Seus Módulos e Conhecimentos:

### 1. Torres 5G e Telecomunicações
- ERBs (Estações Rádio Base) - instalação, cobertura, tecnologias (2G, 3G, 4G, 5G)
- Operadoras: Vivo, Claro, TIM, Oi, Algar, Brisanet
- Frequências: 700MHz, 1800MHz, 2100MHz, 2600MHz, 3.5GHz (5G)
- Cobertura por estado e município
- Vazios de telecomunicações

### 2. Eletropostos e Mobilidade Elétrica
- Estações de recarga para veículos elétricos
- Tipos de conectores: CCS, CHAdeMO, Type 2, Tesla Supercharger
- Potência de carregadores: AC (até 22kW), DC Fast (50-150kW), Ultra-Fast (350kW+)
- Operadores: Shell Recharge, Voltbras, Tupinambá, Zletric, EDP, Enel X, Tesla
- Cobertura por rodovias e cidades
- Tempos de carregamento por modelo de veículo

### 3. Viabilidade de Projetos
- Análise técnica de localização
- Estudos de demanda
- Análise de concorrência
- ROI e payback
- Licenciamento

### 4. Ambiental
- Licenciamento ambiental (LP, LI, LO)
- Programas ambientais
- EIA/RIMA
- Compensação ambiental
- Monitoramento

### 5. Petróleo & Gás
- Exploração offshore e onshore
- Refino e petroquímica
- Oleodutos e gasodutos
- Campos de produção (Pré-sal, Pós-sal)
- ANP e regulação

### 6. Energia Elétrica
- Geração (hidrelétrica, solar, eólica, térmica, nuclear)
- Transmissão (linhas de alta tensão, subestações)
- Distribuição (concessionárias, tarifas)
- ANEEL e regulação
- Leilões de energia

### 7. Mineração
- Minério de ferro, bauxita, manganês, nióbio, ouro
- Títulos minerários (pesquisa, lavra, licenciamento)
- CFEM (royalties)
- ANM e regulação
- Impactos ambientais e recuperação de áreas

### 8. Saneamento
- Abastecimento de água
- Esgotamento sanitário
- Manejo de resíduos sólidos
- Drenagem urbana
- Marco do Saneamento (Lei 14.026/2020)
- Metas de universalização

### 9. Infraestrutura Geral
- Rodovias (federais, estaduais, concessões)
- Ferrovias (Norte-Sul, FIOL, Ferrogrão)
- Portos (Santos, Paranaguá, Rio Grande)
- Aeroportos (concessões, infraestrutura)
- PPPs e concessões

### 10. Indústria
- Papel e celulose (Suzano, Klabin)
- Cimento (Votorantim, InterCement)
- Fertilizantes (Mosaic, Yara)
- Biocombustíveis (etanol, biodiesel)
- Petroquímica (Braskem, polos)

## Estilo de Resposta:
- Seja conciso mas completo
- Use dados e números quando disponíveis
- Forneça insights acionáveis
- Sugira análises relacionadas
- Use formatação markdown
- Responda sempre em português brasileiro
- Use emojis moderadamente para organização

## Capacidades:
- Análise de dados de infraestrutura
- Comparações entre estados e regiões
- Identificação de vazios territoriais
- Sugestões de investimento
- Explicação de regulamentações
- Tendências de mercado
- Cálculo de tempos de carregamento EV`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Handle streaming chat
    if (body.messages) {
      // Create Supabase client to fetch context
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Fetch relevant data for context
      const [
        { count: municipioCount },
        { data: towers },
        { data: evStations },
        { data: indicadores }
      ] = await Promise.all([
        supabase.from('municipios').select('*', { count: 'exact', head: true }),
        supabase.from('towers').select('state, technology').eq('country_code', 'BR'),
        supabase.from('ev_stations').select('state, operator, power_kw').eq('country_code', 'BR'),
        supabase.from('indicadores_energia').select('is_vazio_territorial, status_cobertura').limit(100)
      ]);

      // Build context string
      const towersByTech: Record<string, number> = {};
      towers?.forEach(t => {
        towersByTech[t.technology || '5G'] = (towersByTech[t.technology || '5G'] || 0) + 1;
      });

      const evByOperator: Record<string, number> = {};
      let totalPowerKW = 0;
      evStations?.forEach(e => {
        evByOperator[e.operator || 'N/A'] = (evByOperator[e.operator || 'N/A'] || 0) + 1;
        totalPowerKW += e.power_kw || 0;
      });

      const vazios = indicadores?.filter(i => i.is_vazio_territorial).length || 0;

      const contextData = `
## Dados Atuais do Sistema (tempo real):
- Municípios cadastrados: ${municipioCount || 0}
- Torres de telecomunicação: ${towers?.length || 0}
- Eletropostos cadastrados: ${evStations?.length || 0}
- Potência total instalada: ${totalPowerKW.toFixed(0)} kW
- Vazios territoriais identificados: ${vazios}

### Torres por Tecnologia:
${Object.entries(towersByTech).map(([k, v]) => `- ${k}: ${v}`).join('\n') || '- Sem dados'}

### Eletropostos por Operador (Top 5):
${Object.entries(evByOperator).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => `- ${k}: ${v}`).join('\n') || '- Sem dados'}
`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: SYSTEM_PROMPT + "\n\n" + contextData },
            ...body.messages,
          ],
          stream: true,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Limite de requisições excedido. Aguarde alguns segundos." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const errorText = await response.text();
        console.error("AI gateway error:", response.status, errorText);
        return new Response(JSON.stringify({ error: "Erro no serviço de IA" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // Handle legacy non-streaming requests (type-based)
    const { type, data } = body;
    
    let systemPrompt = SYSTEM_PROMPT;
    let userPrompt = "";

    if (type === "vazio_analysis") {
      userPrompt = `Analise o seguinte município/vazio territorial:
**Município**: ${data.municipio?.nome || 'N/D'} - ${data.municipio?.estado || 'N/D'}
**População**: ${data.municipio?.populacao?.toLocaleString('pt-BR') || 'N/D'} habitantes
**Indicadores**: Eletropostos: ${data.indicadores?.qtd_eletropostos ?? 0}, Potência: ${data.indicadores?.potencia_total_kw ?? 0} kW
Forneça uma análise estratégica e recomendações.`;
    } else if (type === "tower_analysis") {
      userPrompt = `Analise a situação de torres 5G: Total: ${data.totalTowers}, Cobertura: ${data.populationCoverage}%. Sugira locais prioritários.`;
    } else if (type === "ev_station_analysis") {
      userPrompt = `Analise estações EV: Total: ${data.totalStations}, Estados: ${data.coveredStates}. Sugira locais para novas estações.`;
    } else {
      userPrompt = data.message || "Olá";
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI error:", response.status, errorText);
      throw new Error(`AI error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || "Desculpe, não consegui processar sua solicitação.";

    return new Response(JSON.stringify({ success: true, data: { response: content } }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in infrastructure-ai:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
