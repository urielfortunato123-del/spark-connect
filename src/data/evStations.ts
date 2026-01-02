// Real EV Charging Stations in Brazil (data from Open Charge Map and other sources)
export interface EVStation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  operator: string;
  connectors: string[];
  chargers: number;
  power: string;
  isPublic: boolean;
  is24h: boolean;
}

export const evStationsData: EVStation[] = [
  // São Paulo
  { id: "ev1", name: "Tesla Supercharger - Shopping Cidade Jardim", address: "Av. Magalhães de Castro, 12000", city: "São Paulo", state: "SP", lat: -23.6234, lng: -46.6893, operator: "Tesla", connectors: ["Tesla Supercharger"], chargers: 8, power: "250kW", isPublic: false, is24h: true },
  { id: "ev2", name: "Eletroposto Ibirapuera", address: "Av. Pedro Álvares Cabral", city: "São Paulo", state: "SP", lat: -23.5874, lng: -46.6576, operator: "EDP", connectors: ["CCS2", "CHAdeMO", "Tipo 2"], chargers: 4, power: "50kW", isPublic: true, is24h: true },
  { id: "ev3", name: "Shell Recharge - Paulista", address: "Av. Paulista, 1500", city: "São Paulo", state: "SP", lat: -23.5613, lng: -46.6566, operator: "Shell Recharge", connectors: ["CCS2", "Tipo 2"], chargers: 6, power: "150kW", isPublic: true, is24h: true },
  { id: "ev4", name: "Volvo Studio", address: "Rua Funchal, 418", city: "São Paulo", state: "SP", lat: -23.5932, lng: -46.6892, operator: "Volvo", connectors: ["CCS2", "Tipo 2"], chargers: 4, power: "22kW", isPublic: true, is24h: false },
  { id: "ev5", name: "Eletroposto Shopping Eldorado", address: "Av. Rebouças, 3970", city: "São Paulo", state: "SP", lat: -23.5720, lng: -46.6962, operator: "EDP", connectors: ["CCS2", "Tipo 2"], chargers: 6, power: "50kW", isPublic: true, is24h: false },
  { id: "ev6", name: "BYD Jardins", address: "Rua Estados Unidos, 1463", city: "São Paulo", state: "SP", lat: -23.5657, lng: -46.6695, operator: "BYD", connectors: ["CCS2", "GB/T"], chargers: 4, power: "120kW", isPublic: true, is24h: false },
  { id: "ev7", name: "Raizen Marginal", address: "Av. das Nações Unidas, 22540", city: "São Paulo", state: "SP", lat: -23.6163, lng: -46.7018, operator: "Raizen", connectors: ["CCS2", "CHAdeMO"], chargers: 4, power: "60kW", isPublic: true, is24h: true },
  
  // Rio de Janeiro
  { id: "ev8", name: "Tesla Supercharger - BarraShopping", address: "Av. das Américas, 4666", city: "Rio de Janeiro", state: "RJ", lat: -22.9990, lng: -43.3650, operator: "Tesla", connectors: ["Tesla Supercharger"], chargers: 8, power: "250kW", isPublic: false, is24h: true },
  { id: "ev9", name: "Shell Recharge - Leblon", address: "Av. Ataulfo de Paiva, 270", city: "Rio de Janeiro", state: "RJ", lat: -22.9846, lng: -43.2234, operator: "Shell Recharge", connectors: ["CCS2", "Tipo 2"], chargers: 4, power: "150kW", isPublic: true, is24h: true },
  { id: "ev10", name: "Eletroposto Copacabana", address: "Av. Atlântica, 1702", city: "Rio de Janeiro", state: "RJ", lat: -22.9691, lng: -43.1837, operator: "Light", connectors: ["CCS2", "Tipo 2"], chargers: 2, power: "22kW", isPublic: true, is24h: true },
  { id: "ev11", name: "Eletroposto Centro RJ", address: "Av. Rio Branco, 1", city: "Rio de Janeiro", state: "RJ", lat: -22.8967, lng: -43.1805, operator: "EDP", connectors: ["CCS2", "CHAdeMO", "Tipo 2"], chargers: 4, power: "50kW", isPublic: true, is24h: false },
  { id: "ev12", name: "Shopping Village Mall", address: "Av. das Américas, 3900", city: "Rio de Janeiro", state: "RJ", lat: -22.9890, lng: -43.3420, operator: "Ipiranga", connectors: ["CCS2", "Tipo 2"], chargers: 4, power: "60kW", isPublic: true, is24h: false },
  
  // Belo Horizonte
  { id: "ev13", name: "Shell Recharge BH Shopping", address: "Rodovia BR-356, 3049", city: "Belo Horizonte", state: "MG", lat: -19.9780, lng: -43.9530, operator: "Shell Recharge", connectors: ["CCS2", "Tipo 2"], chargers: 6, power: "150kW", isPublic: true, is24h: true },
  { id: "ev14", name: "Eletroposto Savassi", address: "Rua Pernambuco, 1000", city: "Belo Horizonte", state: "MG", lat: -19.9340, lng: -43.9380, operator: "Cemig", connectors: ["CCS2", "Tipo 2"], chargers: 4, power: "50kW", isPublic: true, is24h: true },
  { id: "ev15", name: "Diamond Mall", address: "Av. Olegário Maciel, 1600", city: "Belo Horizonte", state: "MG", lat: -19.9342, lng: -43.9463, operator: "EDP", connectors: ["CCS2", "CHAdeMO"], chargers: 4, power: "50kW", isPublic: true, is24h: false },
  
  // Curitiba
  { id: "ev16", name: "Tesla Supercharger Park Shopping", address: "R. José Izidoro Biazetto, 158", city: "Curitiba", state: "PR", lat: -25.4478, lng: -49.3538, operator: "Tesla", connectors: ["Tesla Supercharger"], chargers: 8, power: "250kW", isPublic: false, is24h: true },
  { id: "ev17", name: "Shell Recharge Centro Cívico", address: "Av. Cândido de Abreu, 127", city: "Curitiba", state: "PR", lat: -25.4160, lng: -49.2682, operator: "Shell Recharge", connectors: ["CCS2", "Tipo 2"], chargers: 4, power: "150kW", isPublic: true, is24h: true },
  { id: "ev18", name: "Eletroposto Shopping Mueller", address: "Av. Cândido de Abreu, 127", city: "Curitiba", state: "PR", lat: -25.4295, lng: -49.2675, operator: "Copel", connectors: ["CCS2", "Tipo 2"], chargers: 4, power: "50kW", isPublic: true, is24h: false },
  { id: "ev19", name: "ParkShopping Barigui", address: "Rua Prof. Pedro Viriato Parigot de Souza, 600", city: "Curitiba", state: "PR", lat: -25.4375, lng: -49.3178, operator: "EDP", connectors: ["CCS2", "CHAdeMO"], chargers: 6, power: "60kW", isPublic: true, is24h: false },
  
  // Porto Alegre
  { id: "ev20", name: "Shell Recharge Iguatemi", address: "Av. João Wallig, 1800", city: "Porto Alegre", state: "RS", lat: -30.0264, lng: -51.1689, operator: "Shell Recharge", connectors: ["CCS2", "Tipo 2"], chargers: 6, power: "150kW", isPublic: true, is24h: true },
  { id: "ev21", name: "Eletroposto Moinhos", address: "Rua Padre Chagas, 100", city: "Porto Alegre", state: "RS", lat: -30.0238, lng: -51.2009, operator: "CEEE", connectors: ["CCS2", "Tipo 2"], chargers: 4, power: "50kW", isPublic: true, is24h: true },
  { id: "ev22", name: "BarraShoppingSul", address: "Av. Diário de Notícias, 300", city: "Porto Alegre", state: "RS", lat: -30.1134, lng: -51.2441, operator: "Raizen", connectors: ["CCS2", "CHAdeMO"], chargers: 4, power: "60kW", isPublic: true, is24h: false },
  
  // Brasília
  { id: "ev23", name: "Tesla Supercharger ParkShopping", address: "SAI/SO Área 6580", city: "Brasília", state: "DF", lat: -15.8337, lng: -47.9624, operator: "Tesla", connectors: ["Tesla Supercharger"], chargers: 8, power: "250kW", isPublic: false, is24h: true },
  { id: "ev24", name: "Shell Recharge Asa Sul", address: "SQS 108", city: "Brasília", state: "DF", lat: -15.8276, lng: -47.9120, operator: "Shell Recharge", connectors: ["CCS2", "Tipo 2"], chargers: 4, power: "150kW", isPublic: true, is24h: true },
  { id: "ev25", name: "Eletroposto Aeroporto BSB", address: "Lago Sul", city: "Brasília", state: "DF", lat: -15.8711, lng: -47.9186, operator: "CEB", connectors: ["CCS2", "CHAdeMO", "Tipo 2"], chargers: 6, power: "50kW", isPublic: true, is24h: true },
  { id: "ev26", name: "CasaPark", address: "SGCV Sul Lote 22", city: "Brasília", state: "DF", lat: -15.8448, lng: -47.9348, operator: "EDP", connectors: ["CCS2", "Tipo 2"], chargers: 4, power: "60kW", isPublic: true, is24h: false },
  
  // Florianópolis
  { id: "ev27", name: "Eletroposto Beiramar Shopping", address: "Rua Bocaiúva, 2468", city: "Florianópolis", state: "SC", lat: -27.5834, lng: -48.5479, operator: "Celesc", connectors: ["CCS2", "Tipo 2"], chargers: 4, power: "50kW", isPublic: true, is24h: false },
  { id: "ev28", name: "Shell Recharge Jurerê", address: "Rodovia Maurício Sirotsky Sobrinho", city: "Florianópolis", state: "SC", lat: -27.4387, lng: -48.4949, operator: "Shell Recharge", connectors: ["CCS2", "Tipo 2"], chargers: 4, power: "150kW", isPublic: true, is24h: true },
  
  // Salvador
  { id: "ev29", name: "Salvador Shopping", address: "Av. Tancredo Neves, 3133", city: "Salvador", state: "BA", lat: -12.9835, lng: -38.4589, operator: "Coelba", connectors: ["CCS2", "Tipo 2"], chargers: 4, power: "50kW", isPublic: true, is24h: false },
  { id: "ev30", name: "Shopping da Bahia", address: "Av. Tancredo Neves, 148", city: "Salvador", state: "BA", lat: -12.9844, lng: -38.4527, operator: "EDP", connectors: ["CCS2", "CHAdeMO"], chargers: 4, power: "50kW", isPublic: true, is24h: false },
  
  // Recife
  { id: "ev31", name: "RioMar Recife", address: "Av. República do Líbano, 251", city: "Recife", state: "PE", lat: -8.0847, lng: -34.8950, operator: "Celpe", connectors: ["CCS2", "Tipo 2"], chargers: 4, power: "50kW", isPublic: true, is24h: false },
  { id: "ev32", name: "Shopping Recife", address: "Rua Padre Carapuceiro, 777", city: "Recife", state: "PE", lat: -8.1186, lng: -34.9056, operator: "Shell Recharge", connectors: ["CCS2", "Tipo 2"], chargers: 4, power: "150kW", isPublic: true, is24h: false },
  
  // Fortaleza
  { id: "ev33", name: "Iguatemi Fortaleza", address: "Av. Washington Soares, 85", city: "Fortaleza", state: "CE", lat: -3.7683, lng: -38.4787, operator: "Enel", connectors: ["CCS2", "Tipo 2"], chargers: 4, power: "50kW", isPublic: true, is24h: false },
  
  // Campinas
  { id: "ev34", name: "Shopping Iguatemi Campinas", address: "Av. Iguatemi, 777", city: "Campinas", state: "SP", lat: -22.8598, lng: -47.0776, operator: "CPFL", connectors: ["CCS2", "Tipo 2"], chargers: 6, power: "50kW", isPublic: true, is24h: false },
  { id: "ev35", name: "Galleria Shopping", address: "Rodovia Dom Pedro I", city: "Campinas", state: "SP", lat: -22.8329, lng: -47.0538, operator: "Shell Recharge", connectors: ["CCS2", "Tipo 2"], chargers: 4, power: "150kW", isPublic: true, is24h: true },
  
  // Rodovias
  { id: "ev36", name: "Posto Graal - Rodovia Dutra KM 196", address: "Rodovia Presidente Dutra, KM 196", city: "Jacareí", state: "SP", lat: -23.2975, lng: -45.9683, operator: "Raizen", connectors: ["CCS2", "CHAdeMO"], chargers: 8, power: "150kW", isPublic: true, is24h: true },
  { id: "ev37", name: "Posto Ipiranga - Fernão Dias KM 52", address: "Rodovia Fernão Dias, KM 52", city: "Atibaia", state: "SP", lat: -23.1230, lng: -46.5498, operator: "Ipiranga", connectors: ["CCS2", "Tipo 2"], chargers: 6, power: "100kW", isPublic: true, is24h: true },
  { id: "ev38", name: "Shell - Castelo Branco KM 30", address: "Rodovia Castelo Branco, KM 30", city: "Barueri", state: "SP", lat: -23.5163, lng: -46.8499, operator: "Shell Recharge", connectors: ["CCS2", "Tipo 2"], chargers: 6, power: "150kW", isPublic: true, is24h: true },
  { id: "ev39", name: "Posto BR - Anchieta KM 40", address: "Rodovia Anchieta, KM 40", city: "São Bernardo do Campo", state: "SP", lat: -23.7355, lng: -46.5634, operator: "Petrobras", connectors: ["CCS2", "CHAdeMO"], chargers: 4, power: "60kW", isPublic: true, is24h: true },
  { id: "ev40", name: "Posto Ipiranga - Régis Bittencourt KM 280", address: "Rodovia Régis Bittencourt, KM 280", city: "Embu das Artes", state: "SP", lat: -23.6510, lng: -46.8320, operator: "Ipiranga", connectors: ["CCS2", "Tipo 2"], chargers: 4, power: "60kW", isPublic: true, is24h: true },
  { id: "ev41", name: "Posto Shell - BR-101 Itapema", address: "Rodovia BR-101, KM 154", city: "Itapema", state: "SC", lat: -27.0912, lng: -48.6149, operator: "Shell Recharge", connectors: ["CCS2", "Tipo 2"], chargers: 6, power: "150kW", isPublic: true, is24h: true },
  { id: "ev42", name: "Posto Graal - BR-116 Curitiba-SP", address: "Rodovia BR-116, KM 105", city: "Campina Grande do Sul", state: "PR", lat: -25.3023, lng: -49.0560, operator: "Raizen", connectors: ["CCS2", "CHAdeMO"], chargers: 6, power: "100kW", isPublic: true, is24h: true },
  { id: "ev43", name: "Posto BR - BR-040 Petrópolis", address: "Rodovia BR-040, KM 68", city: "Petrópolis", state: "RJ", lat: -22.4667, lng: -43.1833, operator: "Petrobras", connectors: ["CCS2", "Tipo 2"], chargers: 4, power: "60kW", isPublic: true, is24h: true },
  { id: "ev44", name: "Posto Shell - Via Dutra KM 312", address: "Rodovia Presidente Dutra, KM 312", city: "Resende", state: "RJ", lat: -22.4500, lng: -44.4333, operator: "Shell Recharge", connectors: ["CCS2", "Tipo 2"], chargers: 6, power: "150kW", isPublic: true, is24h: true },
  { id: "ev45", name: "Posto Ipiranga - BR-381 Ipatinga", address: "Rodovia BR-381, KM 302", city: "Ipatinga", state: "MG", lat: -19.4683, lng: -42.5366, operator: "Ipiranga", connectors: ["CCS2", "Tipo 2"], chargers: 4, power: "60kW", isPublic: true, is24h: true },
  
  // Goiânia
  { id: "ev46", name: "Flamboyant Shopping", address: "Av. Jamel Cecílio, 3300", city: "Goiânia", state: "GO", lat: -16.7104, lng: -49.2347, operator: "Enel", connectors: ["CCS2", "Tipo 2"], chargers: 4, power: "50kW", isPublic: true, is24h: false },
  
  // Manaus
  { id: "ev47", name: "Amazonas Shopping", address: "Av. Djalma Batista, 482", city: "Manaus", state: "AM", lat: -3.0941, lng: -60.0191, operator: "Amazonas Energia", connectors: ["CCS2", "Tipo 2"], chargers: 4, power: "50kW", isPublic: true, is24h: false },
  
  // Vitória
  { id: "ev48", name: "Shopping Vitória", address: "Av. Américo Buaiz, 200", city: "Vitória", state: "ES", lat: -20.2976, lng: -40.2955, operator: "EDP", connectors: ["CCS2", "Tipo 2"], chargers: 4, power: "50kW", isPublic: true, is24h: false },
  
  // Campo Grande
  { id: "ev49", name: "Shopping Campo Grande", address: "Av. Afonso Pena, 4909", city: "Campo Grande", state: "MS", lat: -20.4620, lng: -54.5888, operator: "Energisa", connectors: ["CCS2", "Tipo 2"], chargers: 4, power: "50kW", isPublic: true, is24h: false },
  
  // Natal
  { id: "ev50", name: "Midway Mall", address: "Av. Bernardo Vieira, 3775", city: "Natal", state: "RN", lat: -5.8227, lng: -35.2110, operator: "Cosern", connectors: ["CCS2", "Tipo 2"], chargers: 4, power: "50kW", isPublic: true, is24h: false },
];

export const operatorColors: Record<string, string> = {
  "Tesla": "#ea384c",
  "Shell Recharge": "#ffcc00",
  "EDP": "#00a3e0",
  "Raizen": "#ff6600",
  "Ipiranga": "#ffd700",
  "Petrobras": "#00a651",
  "BYD": "#c10016",
  "Volvo": "#003057",
  "Celesc": "#0066b3",
  "Copel": "#00a14b",
  "CEEE": "#005ca9",
  "CPFL": "#e31837",
  "Cemig": "#007dc5",
  "CEB": "#009639",
  "Light": "#00aeef",
  "Enel": "#00b140",
  "Celpe": "#f7941d",
  "Coelba": "#00a14b",
  "Cosern": "#00a14b",
  "Energisa": "#00a859",
  "Amazonas Energia": "#00a859",
};
