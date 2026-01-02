import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "tower_analysis") {
      systemPrompt = `Você é um especialista em infraestrutura de telecomunicações 5G no Brasil. 
Analise os dados fornecidos e sugira locais estratégicos para instalação de novas torres 5G.
Considere:
- Densidade populacional
- Cobertura atual
- Infraestrutura existente
- Demanda de tráfego de dados
- Viabilidade de instalação
Responda em JSON com o formato: { "recommendations": [{ "city": "", "state": "", "priority": "alta/media/baixa", "reason": "", "estimatedPopulation": 0, "coordinates": { "lat": 0, "lng": 0 } }] }`;
      userPrompt = `Analise a situação atual das torres 5G no Brasil:
- Total de torres: ${data.totalTowers}
- Municípios cobertos: ${data.coveredMunicipalities} de 5.570
- População coberta: ${data.populationCoverage}%
- Regiões com menos cobertura: ${data.lowCoverageRegions?.join(", ")}

Sugira 5 locais prioritários para novas torres.`;
    } else if (type === "ev_station_analysis") {
      systemPrompt = `Você é um especialista em infraestrutura de mobilidade elétrica no Brasil.
Analise os dados fornecidos e sugira locais estratégicos para instalação de estações de recarga para veículos elétricos.
Considere:
- Principais rodovias e fluxo de veículos
- Distância entre pontos de recarga existentes
- Grandes centros urbanos
- Pontos turísticos e comerciais
- Infraestrutura elétrica disponível
Responda em JSON com o formato: { "recommendations": [{ "location": "", "type": "highway/urban/commercial", "priority": "alta/media/baixa", "reason": "", "estimatedDailyTraffic": 0, "chargersRecommended": 0, "coordinates": { "lat": 0, "lng": 0 } }] }`;
      userPrompt = `Analise a situação atual da infraestrutura de recarga EV no Brasil:
- Total de estações: ${data.totalStations}
- Estados cobertos: ${data.coveredStates}
- Principais rodovias: ${data.highways?.join(", ")}
- Gaps identificados: ${data.gaps?.join(", ")}

Sugira 5 locais prioritários para novas estações de recarga.`;
    } else if (type === "strategic_report") {
      systemPrompt = `Você é um consultor estratégico especializado em infraestrutura digital e mobilidade sustentável no Brasil.
Gere um relatório executivo completo analisando oportunidades de investimento.
Considere sinergias entre infraestrutura 5G e estações de recarga EV.
Responda em JSON com o formato: { "executiveSummary": "", "marketOpportunities": [], "risks": [], "timeline": "", "estimatedInvestment": "", "roi": "" }`;
      userPrompt = `Gere um relatório estratégico baseado nos dados:
Torres 5G: ${data.towers5g} instaladas
Estações EV: ${data.evStations} instaladas
Cobertura nacional: ${data.coverage}%
Meta 2027: ${data.target2027}`;
    }

    console.log(`Processing ${type} analysis request`);

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
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch {
      parsedContent = { raw: content };
    }

    console.log(`${type} analysis completed successfully`);

    return new Response(JSON.stringify({ success: true, data: parsedContent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in infrastructure-ai function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
