// ERB (Estações Rádio Base) data based on official Anatel data - Nov/2025
// Source: Anatel/Teleco - https://www.teleco.com.br/erb.asp

export interface ERBOperatorData {
  operator: string;
  total: number;
  erbs2G: number;
  erbs3G: number;
  erbs4G: number;
  erbs5G: number;
  color: string;
  growth: number; // monthly growth
}

export interface ERBByState {
  state: string;
  stateCode: string;
  total: number;
  lat: number;
  lng: number;
}

export interface ERBByRegion {
  region: string;
  total: number;
}

// Official operator data - Nov/2025
export const operatorData: ERBOperatorData[] = [
  { operator: "VIVO", total: 37631, erbs2G: 16033, erbs3G: 26454, erbs4G: 34506, erbs5G: 18884, color: "#ff4da6", growth: 95 },
  { operator: "TIM", total: 37200, erbs2G: 18348, erbs3G: 20084, erbs4G: 32265, erbs5G: 15332, color: "#00d4ff", growth: 193 },
  { operator: "CLARO", total: 30537, erbs2G: 20112, erbs3G: 25031, erbs4G: 29902, erbs5G: 14683, color: "#ff6b35", growth: 262 },
  { operator: "BRISANET", total: 2366, erbs2G: 0, erbs3G: 0, erbs4G: 2198, erbs5G: 1852, color: "#ffd000", growth: 8 },
  { operator: "ALGAR", total: 753, erbs2G: 392, erbs3G: 611, erbs4G: 573, erbs5G: 193, color: "#00cc66", growth: 1 },
  { operator: "UNIFIQUE", total: 562, erbs2G: 0, erbs3G: 0, erbs4G: 558, erbs5G: 496, color: "#a855f7", growth: 195 },
  { operator: "SERCOMTEL", total: 51, erbs2G: 38, erbs3G: 42, erbs4G: 0, erbs5G: 7, color: "#14b8a6", growth: 0 },
];

// Total stats
export const totalERBStats = {
  total: 109100,
  erbs2G: 54923,
  erbs3G: 72222,
  erbs4G: 100002,
  erbs5G: 51447,
  monthlyGrowth: 754,
  lastUpdate: "Nov/2025",
};

// ERBs by state - Nov/2025 (based on Anatel data)
export const erbsByState: ERBByState[] = [
  { state: "São Paulo", stateCode: "SP", total: 24378, lat: -23.5505, lng: -46.6333 },
  { state: "Minas Gerais", stateCode: "MG", total: 12533, lat: -19.9167, lng: -43.9345 },
  { state: "Rio de Janeiro", stateCode: "RJ", total: 10234, lat: -22.9068, lng: -43.1729 },
  { state: "Rio Grande do Sul", stateCode: "RS", total: 6589, lat: -30.0346, lng: -51.2177 },
  { state: "Paraná", stateCode: "PR", total: 6514, lat: -25.4284, lng: -49.2733 },
  { state: "Bahia", stateCode: "BA", total: 5636, lat: -12.9714, lng: -38.5014 },
  { state: "Ceará", stateCode: "CE", total: 4938, lat: -3.7319, lng: -38.5267 },
  { state: "Santa Catarina", stateCode: "SC", total: 4699, lat: -27.5954, lng: -48.5480 },
  { state: "Pernambuco", stateCode: "PE", total: 3961, lat: -8.0476, lng: -34.8770 },
  { state: "Goiás", stateCode: "GO", total: 3585, lat: -16.6869, lng: -49.2648 },
  { state: "Pará", stateCode: "PA", total: 3168, lat: -1.4558, lng: -48.4902 },
  { state: "Espírito Santo", stateCode: "ES", total: 2981, lat: -20.3155, lng: -40.3128 },
  { state: "Maranhão", stateCode: "MA", total: 2392, lat: -2.5297, lng: -44.2625 },
  { state: "Distrito Federal", stateCode: "DF", total: 2130, lat: -15.7942, lng: -47.8822 },
  { state: "Mato Grosso", stateCode: "MT", total: 2004, lat: -15.5989, lng: -56.0949 },
  { state: "Rio Grande do Norte", stateCode: "RN", total: 1942, lat: -5.7945, lng: -35.2110 },
  { state: "Paraíba", stateCode: "PB", total: 1910, lat: -7.1195, lng: -34.8450 },
  { state: "Amazonas", stateCode: "AM", total: 1740, lat: -3.1190, lng: -60.0217 },
  { state: "Piauí", stateCode: "PI", total: 1558, lat: -5.0892, lng: -42.8019 },
  { state: "Mato Grosso do Sul", stateCode: "MS", total: 1440, lat: -20.4697, lng: -54.6201 },
  { state: "Alagoas", stateCode: "AL", total: 1277, lat: -9.6658, lng: -35.7350 },
  { state: "Sergipe", stateCode: "SE", total: 979, lat: -10.9472, lng: -37.0731 },
  { state: "Tocantins", stateCode: "TO", total: 848, lat: -10.1689, lng: -48.3317 },
  { state: "Rondônia", stateCode: "RO", total: 690, lat: -8.7612, lng: -63.9039 },
  { state: "Amapá", stateCode: "AP", total: 385, lat: 0.0349, lng: -51.0694 },
  { state: "Acre", stateCode: "AC", total: 322, lat: -9.9754, lng: -67.8249 },
  { state: "Roraima", stateCode: "RR", total: 267, lat: 2.8235, lng: -60.6758 },
];

// ERBs by region
export const erbsByRegion: ERBByRegion[] = [
  { region: "Região I (Sudeste + Norte + Nordeste)", total: 55901 },
  { region: "Região II (Sul + Centro-Oeste)", total: 28821 },
  { region: "Região III (São Paulo)", total: 24378 },
];

// Historical data for evolution charts
export const historicalData = [
  { year: "2020", total: 78520, erbs5G: 0 },
  { year: "2021", total: 82345, erbs5G: 1250 },
  { year: "2022", total: 87654, erbs5G: 8540 },
  { year: "2023", total: 93835, erbs5G: 18537 },
  { year: "2024", total: 102908, erbs5G: 37991 },
  { year: "2025", total: 109100, erbs5G: 51447 },
];

// Generate sample tower locations for map visualization
// In production, this would come from the Anatel API
export interface Tower {
  id: string;
  lat: number;
  lng: number;
  operator: string;
  city: string;
  state: string;
  technology: "2G" | "3G" | "4G" | "5G";
}

// Generate representative towers for each state based on real data distribution
export function generateTowersFromStateData(): Tower[] {
  const towers: Tower[] = [];
  const operators = operatorData.map(o => o.operator);
  
  erbsByState.forEach(stateData => {
    // Calculate proportional distribution for each operator
    const operatorDistribution = operatorData.map(op => ({
      operator: op.operator,
      count: Math.round((stateData.total * op.total) / totalERBStats.total),
      color: op.color,
    }));

    // Generate sample towers (limit for performance)
    const maxTowersPerState = Math.min(Math.round(stateData.total / 1000), 30);
    
    operatorDistribution.forEach(opData => {
      const towersForOperator = Math.max(1, Math.round((opData.count / stateData.total) * maxTowersPerState));
      
      for (let i = 0; i < towersForOperator; i++) {
        // Add slight random offset to spread towers
        const latOffset = (Math.random() - 0.5) * 2;
        const lngOffset = (Math.random() - 0.5) * 2;
        
        towers.push({
          id: `${stateData.stateCode}-${opData.operator}-${i}`,
          lat: stateData.lat + latOffset,
          lng: stateData.lng + lngOffset,
          operator: opData.operator,
          city: stateData.state,
          state: stateData.stateCode,
          technology: Math.random() > 0.5 ? "5G" : "4G",
        });
      }
    });
  });

  return towers;
}

// Operator colors for map visualization
export const operatorColors: Record<string, string> = {
  VIVO: "#ff4da6",
  TIM: "#00d4ff",
  CLARO: "#ff6b35",
  BRISANET: "#ffd000",
  ALGAR: "#00cc66",
  UNIFIQUE: "#a855f7",
  SERCOMTEL: "#14b8a6",
};

// Get operator stats summary
export function getOperatorSummary() {
  return operatorData.map(op => ({
    name: op.operator,
    total: op.total,
    percentage: ((op.total / totalERBStats.total) * 100).toFixed(1),
    erbs5G: op.erbs5G,
    color: op.color,
    growth: op.growth,
  }));
}
