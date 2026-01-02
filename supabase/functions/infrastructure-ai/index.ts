import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// EV Stations data for searching
const evStationsData = [
  { name: "Tesla Supercharger - Shopping Cidade Jardim", address: "Av. Magalhães de Castro, 12000", city: "São Paulo", state: "SP", lat: -23.6234, lng: -46.6893, operator: "Tesla", connectors: ["Tesla Supercharger"], power: "250kW" },
  { name: "Shell Recharge - Paulista", address: "Av. Paulista, 1500", city: "São Paulo", state: "SP", lat: -23.5613, lng: -46.6566, operator: "Shell Recharge", connectors: ["CCS2", "Tipo 2"], power: "150kW" },
  { name: "Posto Graal - Rodovia Dutra KM 196", address: "Rodovia Presidente Dutra, KM 196", city: "Jacareí", state: "SP", lat: -23.2975, lng: -45.9683, operator: "Raizen", connectors: ["CCS2", "CHAdeMO"], power: "150kW" },
  { name: "Shell Recharge BH Shopping", address: "Rodovia BR-356, 3049", city: "Belo Horizonte", state: "MG", lat: -19.9780, lng: -43.9530, operator: "Shell Recharge", connectors: ["CCS2", "Tipo 2"], power: "150kW" },
  { name: "Tesla Supercharger - BarraShopping", address: "Av. das Américas, 4666", city: "Rio de Janeiro", state: "RJ", lat: -22.9990, lng: -43.3650, operator: "Tesla", connectors: ["Tesla Supercharger"], power: "250kW" },
  { name: "Shell Recharge Iguatemi", address: "Av. João Wallig, 1800", city: "Porto Alegre", state: "RS", lat: -30.0264, lng: -51.1689, operator: "Shell Recharge", connectors: ["CCS2", "Tipo 2"], power: "150kW" },
  { name: "Tesla Supercharger Park Shopping", address: "R. José Izidoro Biazetto, 158", city: "Curitiba", state: "PR", lat: -25.4478, lng: -49.3538, operator: "Tesla", connectors: ["Tesla Supercharger"], power: "250kW" },
  { name: "Tesla Supercharger ParkShopping", address: "SAI/SO Área 6580", city: "Brasília", state: "DF", lat: -15.8337, lng: -47.9624, operator: "Tesla", connectors: ["Tesla Supercharger"], power: "250kW" },
  { name: "Posto Shell - BR-101 Itapema", address: "Rodovia BR-101, KM 154", city: "Itapema", state: "SC", lat: -27.0912, lng: -48.6149, operator: "Shell Recharge", connectors: ["CCS2", "Tipo 2"], power: "150kW" },
  { name: "Posto Graal - BR-116 Curitiba-SP", address: "Rodovia BR-116, KM 105", city: "Campina Grande do Sul", state: "PR", lat: -25.3023, lng: -49.0560, operator: "Raizen", connectors: ["CCS2", "CHAdeMO"], power: "100kW" },
];

// Calculate charging time based on car model and charger power
function calculateChargingTime(carModel: string, chargerPower: string): string {
  const batteryCapacities: Record<string, number> = {
    "tesla model 3": 60,
    "tesla model y": 75,
    "tesla model s": 100,
    "tesla model x": 100,
    "byd dolphin": 44.9,
    "byd seal": 82.5,
    "byd han": 85.4,
    "byd tang": 86.4,
    "volvo xc40": 78,
    "volvo c40": 78,
    "bmw ix1": 66.5,
    "bmw ix3": 80,
    "bmw i4": 83.9,
    "audi e-tron": 95,
    "audi q4": 82,
    "mercedes eqa": 66.5,
    "mercedes eqb": 66.5,
    "mercedes eqs": 107.8,
    "porsche taycan": 93.4,
    "hyundai ioniq 5": 77.4,
    "hyundai kona": 64,
    "kia ev6": 77.4,
    "nissan leaf": 62,
    "renault zoe": 52,
    "chevrolet bolt": 65,
    "fiat 500e": 42,
    "mini cooper se": 32.6,
    "peugeot e-208": 50,
    "gwm ora 03": 63,
  };

  const powerKw = parseInt(chargerPower.replace("kW", ""));
  const modelLower = carModel.toLowerCase();
  
  let capacity = 60; // default
  for (const [model, cap] of Object.entries(batteryCapacities)) {
    if (modelLower.includes(model)) {
      capacity = cap;
      break;
    }
  }
  
  // Calculate time from 10% to 80% (typical fast charge)
  const chargeRange = capacity * 0.7; // 70% of battery
  const efficiency = powerKw > 100 ? 0.85 : 0.9; // DC chargers have some loss
  const timeHours = chargeRange / (powerKw * efficiency);
  
  if (timeHours < 1) {
    return `${Math.round(timeHours * 60)} minutos`;
  } else {
    const hours = Math.floor(timeHours);
    const minutes = Math.round((timeHours - hours) * 60);
    return `${hours}h ${minutes}min`;
  }
}

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

    if (type === "chat") {
      // Chat mode - comprehensive infrastructure assistant
      systemPrompt = `Você é o assistente de infraestrutura InfraBrasil 2025, um especialista em:

1. **Veículos Elétricos (EV)**:
   - Tempos de carregamento para diferentes modelos (Tesla, BYD, Volvo, BMW, Audi, Mercedes, Porsche, Hyundai, etc.)
   - Tipos de conectores: CCS2 (padrão brasileiro), CHAdeMO (Nissan/Mitsubishi), Tipo 2 (AC), Tesla Supercharger
   - Custos de carregamento (média R$0,80-1,50/kWh em eletropostos públicos)
   - Autonomia de veículos elétricos
   - Rede de carregamento no Brasil (Shell Recharge, Raizen, Ipiranga, Tesla, EDP)

2. **Telecomunicações 5G**:
   - Cobertura 5G no Brasil (Vivo, Tim, Claro são as principais)
   - Frequências utilizadas (3.5GHz, 2.3GHz, 26GHz)
   - Diferenças entre 4G e 5G
   - Processo de instalação de torres
   - Latência e velocidades típicas

3. **Fibra Óptica**:
   - Principais provedores (Vivo Fibra, Tim Live, Claro, Brisanet, etc.)
   - Velocidades disponíveis
   - Processo de instalação
   - Diferenças GPON vs EPON

4. **Infraestrutura Geral**:
   - Custos de instalação
   - Regulamentação ANATEL
   - Processo de licenciamento
   - Manutenção e operação

Regras:
- Responda sempre em português brasileiro
- Seja conciso mas informativo
- Use dados reais quando disponíveis
- Se perguntarem sobre estações de recarga, inclua no JSON "needsStationSearch: true" e os termos de busca
- Para cálculos de tempo de carga, considere: carregamento típico de 10% a 80% da bateria
- Formate valores monetários em Reais (R$)

Formato de resposta JSON:
{
  "response": "Sua resposta aqui",
  "needsStationSearch": true/false,
  "searchTerms": ["cidade", "estado", "rodovia"] // se needsStationSearch for true
}`;

      const history = data.history?.map((m: any) => `${m.role === 'user' ? 'Usuário' : 'Assistente'}: ${m.content}`).join('\n') || '';
      userPrompt = `${history ? 'Histórico da conversa:\n' + history + '\n\n' : ''}Pergunta atual do usuário: ${data.message}`;

    } else if (type === "tower_analysis") {
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

    console.log(`Processing ${type} request`);

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
      parsedContent = { response: content };
    }

    // Handle chat type with station search
    if (type === "chat") {
      let stations: any[] = [];
      
      if (parsedContent.needsStationSearch && parsedContent.searchTerms) {
        const searchTerms = parsedContent.searchTerms.map((t: string) => t.toLowerCase());
        stations = evStationsData.filter(station => {
          const searchString = `${station.name} ${station.city} ${station.state} ${station.address} ${station.operator}`.toLowerCase();
          return searchTerms.some((term: string) => searchString.includes(term));
        }).slice(0, 5);
      }

      // Check if asking about charging time
      const message = data.message.toLowerCase();
      if (message.includes("tempo") && message.includes("carreg")) {
        const carModels = ["tesla model 3", "tesla model y", "tesla model s", "byd dolphin", "byd seal", "volvo xc40"];
        for (const model of carModels) {
          if (message.includes(model.split(" ")[0])) {
            const times = {
              "Supercharger 250kW": calculateChargingTime(model, "250kW"),
              "Fast Charger 150kW": calculateChargingTime(model, "150kW"),
              "Carregador 50kW": calculateChargingTime(model, "50kW"),
              "Carregador AC 22kW": calculateChargingTime(model, "22kW"),
            };
            parsedContent.response += `\n\n**Tempos estimados de carregamento (10% a 80%):**\n`;
            for (const [charger, time] of Object.entries(times)) {
              parsedContent.response += `• ${charger}: ${time}\n`;
            }
            break;
          }
        }
      }

      return new Response(JSON.stringify({ 
        success: true, 
        data: { 
          response: parsedContent.response,
          stations: stations
        } 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`${type} completed successfully`);

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
