/**
 * Registry central de módulos, categorias e subtipos.
 *
 * Estrutura única e escalável — futuramente pode ser carregada via API/backend.
 * Cada módulo contém suas categorias, e cada categoria seus subtipos (serviços).
 */

import {
  // Energia
  Sun, Wind, Zap, Flame, Atom, Cable, Building2,
  // Mineração
  Mountain, Factory, Gem, Truck, Building, HardHat,
  // Saneamento
  Droplets, Waves, Filter, Trash2, Recycle,
  // Infraestrutura
  Route, Train, Ship, Plane, Warehouse,
  // Indústria
  FileStack, Boxes, Leaf, Fuel, Beaker,
  // Petróleo
  Droplet, ArrowUpDown,
  // Ambiental
  TreePine, FileCheck, ClipboardCheck, Home, FileText, Map,
  type LucideIcon,
} from 'lucide-react';

// ──────────────────────────── Types ────────────────────────────

export type ModuleId =
  | 'energia'
  | 'mineracao'
  | 'saneamento'
  | 'infraestrutura'
  | 'industria'
  | 'petroleo';

export interface CategoryDef {
  id: string;
  title: string;
  icon: LucideIcon;
  /** Tailwind bg-color class, e.g. "bg-amber-500" */
  color: string;
  desc: string;
  subtypes: string[];
}

export interface ModuleDef {
  id: ModuleId;
  label: string;
  categories: CategoryDef[];
}

// ──────────────────────────── Data ────────────────────────────

const energiaCategorias: CategoryDef[] = [
  { id: 'solar', title: 'Geração Solar', icon: Sun, color: 'bg-amber-500', desc: 'Usinas fotovoltaicas e solares térmicas', subtypes: ['Usina Solar Fotovoltaica (UFV)', 'Usina Solar Térmica (CSP)', 'Geração Distribuída (GD)', 'Minigeração'] },
  { id: 'eolica', title: 'Geração Eólica', icon: Wind, color: 'bg-cyan-500', desc: 'Parques eólicos onshore e offshore', subtypes: ['Parque Eólico Onshore', 'Parque Eólico Offshore', 'Aerogerador Isolado'] },
  { id: 'hidraulica', title: 'Geração Hidráulica', icon: Zap, color: 'bg-blue-500', desc: 'PCHs, CGHs e UHEs', subtypes: ['CGH (até 5 MW)', 'PCH (5 a 30 MW)', 'UHE (acima 30 MW)', 'Reversível'] },
  { id: 'termica', title: 'Geração Térmica', icon: Flame, color: 'bg-orange-500', desc: 'Termelétricas a gás, carvão, biomassa', subtypes: ['Gás Natural', 'Carvão', 'Biomassa', 'Resíduos Sólidos', 'Cogeração'] },
  { id: 'nuclear', title: 'Geração Nuclear', icon: Atom, color: 'bg-purple-500', desc: 'Usinas nucleares', subtypes: ['Usina PWR', 'Usina BWR', 'SMR (Reator Modular Pequeno)'] },
  { id: 'transmissao', title: 'Linhas de Transmissão', icon: Cable, color: 'bg-yellow-500', desc: 'LTs de alta tensão', subtypes: ['LT 138 kV', 'LT 230 kV', 'LT 345 kV', 'LT 500 kV', 'LT 765 kV', 'LT CC'] },
  { id: 'subestacao', title: 'Subestações', icon: Building2, color: 'bg-yellow-600', desc: 'SEs de transformação', subtypes: ['SE Elevadora', 'SE Abaixadora', 'SE Seccionadora', 'SE Conversora'] },
  { id: 'distribuicao', title: 'Distribuição', icon: Zap, color: 'bg-emerald-500', desc: 'Redes de distribuição', subtypes: ['Rede de MT', 'Rede de BT', 'Subestação de Distribuição', 'Linha de Distribuição Rural'] },
];

const mineracaoCategorias: CategoryDef[] = [
  { id: 'extracao', title: 'Mineração', icon: Mountain, color: 'bg-stone-500', desc: 'Extração mineral a céu aberto e subterrânea', subtypes: ['Mina a Céu Aberto', 'Mina Subterrânea', 'Lavra de Aluvião', 'Garimpo', 'Pedreira'] },
  { id: 'infraestrutura', title: 'Infraestrutura Mineral', icon: Factory, color: 'bg-stone-600', desc: 'Usinas de beneficiamento e processamento', subtypes: ['Usina de Beneficiamento', 'Planta de Pelotização', 'Concentrador', 'Barragem de Rejeitos', 'Pilha de Estéril'] },
  { id: 'patrimonial', title: 'Patrimonial', icon: Building, color: 'bg-amber-600', desc: 'Gestão de patrimônio mineral', subtypes: ['Aquisição de Direitos', 'Joint Venture', 'Cessão de Direitos', 'Arrendamento'] },
  { id: 'jazidas', title: 'Jazidas e Minas', icon: Gem, color: 'bg-purple-500', desc: 'Pesquisa e desenvolvimento de jazidas', subtypes: ['Pesquisa Mineral', 'Avaliação de Recursos', 'Estudo de Pré-Viabilidade', 'Estudo de Viabilidade (FS)'] },
  { id: 'logistica', title: 'Logística Mineral', icon: Truck, color: 'bg-orange-500', desc: 'Transporte e escoamento', subtypes: ['Mineroduto', 'Correia Transportadora', 'Terminal Portuário', 'Ramal Ferroviário'] },
  { id: 'concessao', title: 'Áreas de Concessão', icon: HardHat, color: 'bg-emerald-500', desc: 'Gestão de títulos e direitos minerários', subtypes: ['Requerimento de Pesquisa', 'Portaria de Lavra', 'Licenciamento', 'PLG', 'Guia de Utilização'] },
];

const saneamentoCategorias: CategoryDef[] = [
  { id: 'agua', title: 'Saneamento - Água', icon: Droplets, color: 'bg-cyan-500', desc: 'Captação, tratamento e distribuição', subtypes: ['Sistema de Captação', 'ETA - Estação de Tratamento', 'Reservatório', 'Adutora', 'Rede de Distribuição', 'Poço Profundo'] },
  { id: 'esgoto', title: 'Saneamento - Esgoto', icon: Waves, color: 'bg-cyan-600', desc: 'Coleta e tratamento de esgoto', subtypes: ['Rede Coletora', 'Coletor Tronco', 'Interceptor', 'Emissário', 'Estação Elevatória (EEEB)', 'Ligação Domiciliar'] },
  { id: 'drenagem', title: 'Saneamento - Drenagem', icon: Filter, color: 'bg-blue-500', desc: 'Drenagem de águas pluviais', subtypes: ['Microdrenagem', 'Macrodrenagem', 'Piscinão/Reservatório', 'Canal de Drenagem', 'Galeria', 'Bacia de Detenção'] },
  { id: 'ete', title: 'Coleta e Tratamento', icon: Building2, color: 'bg-teal-500', desc: 'ETEs e sistemas de tratamento', subtypes: ['ETE - Lodos Ativados', 'ETE - Lagoas', 'ETE - UASB', 'ETE - MBR', 'Reúso de Água', 'Tratamento de Lodo'] },
  { id: 'residuos', title: 'Resíduos Sólidos', icon: Trash2, color: 'bg-orange-500', desc: 'Coleta, transbordo e aterros', subtypes: ['Aterro Sanitário', 'Central de Transbordo', 'Coleta Seletiva', 'Coleta Convencional', 'Unidade de Valorização Energética'] },
  { id: 'reciclagem', title: 'Reciclagem', icon: Recycle, color: 'bg-green-500', desc: 'Centrais de triagem e reciclagem', subtypes: ['Central de Triagem', 'Cooperativa de Catadores', 'Usina de Compostagem', 'CDR - Combustível Derivado de Resíduos'] },
];

const infraestruturaCategorias: CategoryDef[] = [
  { id: 'rodovias', title: 'Rodovias', icon: Route, color: 'bg-blue-500', desc: 'Implantação, duplicação e concessão rodoviária', subtypes: ['Duplicação', 'Implantação', 'Concessão', 'Restauração', 'Contorno/Anel Viário', 'Ponte/Viaduto'] },
  { id: 'ferrovias', title: 'Ferrovias', icon: Train, color: 'bg-emerald-500', desc: 'Ferrovias de carga e passageiros', subtypes: ['Ferrovia de Carga', 'VLT/Metrô', 'Trem de Passageiros', 'Ramal Ferroviário', 'TAV', 'Pátio de Manobras'] },
  { id: 'portos', title: 'Portos', icon: Ship, color: 'bg-cyan-500', desc: 'Terminais portuários e TUPs', subtypes: ['Terminal de Contêineres', 'Terminal Granéis Sólidos', 'Terminal Granéis Líquidos', 'TUP', 'Porto Seco', 'Marina'] },
  { id: 'aeroportos', title: 'Aeroportos', icon: Plane, color: 'bg-sky-500', desc: 'Aeroportos e terminais de carga aérea', subtypes: ['Aeroporto Internacional', 'Aeroporto Regional', 'Terminal de Carga (TECA)', 'Ampliação de Pista', 'Novo Terminal'] },
  { id: 'logistica', title: 'Logística', icon: Truck, color: 'bg-orange-500', desc: 'Centros logísticos e intermodais', subtypes: ['Centro de Distribuição', 'Terminal Intermodal', 'Estação Aduaneira (EADI)', 'Hub Logístico', 'Plataforma Logística'] },
  { id: 'armazenamento', title: 'Armazenamento', icon: Warehouse, color: 'bg-amber-500', desc: 'Armazéns, silos e terminais', subtypes: ['Silo Graneleiro', 'Armazém Frigorífico', 'Terminal de Combustíveis', 'Armazém Geral', 'Centro de Armazenagem'] },
];

const industriaCategorias: CategoryDef[] = [
  { id: 'celulose', title: 'Papel e Celulose', icon: FileStack, color: 'bg-amber-600', desc: 'Fábricas de celulose, papel e embalagens', subtypes: ['Fábrica de Celulose Kraft', 'Fábrica de Celulose Solúvel', 'Fábrica de Papel', 'Fábrica de Embalagens', 'Linha de Fibras', 'Planta de Tissue'] },
  { id: 'cimento', title: 'Cimento', icon: Boxes, color: 'bg-stone-500', desc: 'Fábricas de cimento e concreto', subtypes: ['Fábrica Integrada', 'Moagem de Cimento', 'Planta de Concreto (Batching)', 'Fábrica de Argamassa', 'Planta de Cal'] },
  { id: 'fertilizantes', title: 'Fertilizantes', icon: Leaf, color: 'bg-green-500', desc: 'Plantas de fertilizantes e agroquímicos', subtypes: ['Planta de NPK', 'Fábrica de Fosfatados', 'Fábrica de Nitrogenados', 'Planta de Potássio', 'Defensivos Agrícolas', 'Misturadora'] },
  { id: 'biocombustiveis', title: 'Biocombustíveis', icon: Fuel, color: 'bg-emerald-500', desc: 'Usinas de etanol, biodiesel e biogás', subtypes: ['Usina de Etanol 1G', 'Usina de Etanol 2G', 'Planta de Biodiesel', 'Planta de Biogás', 'Usina de Cogeração (Biomassa)', 'Planta de SAF'] },
  { id: 'petroquimica', title: 'Petroquímica', icon: Beaker, color: 'bg-purple-500', desc: 'Plantas petroquímicas e polímeros', subtypes: ['Central Petroquímica', 'Planta de Polietileno', 'Planta de Polipropileno', 'Planta de PVC', 'Planta de PET', 'Planta de Resinas'] },
];

const petroleoCategorias: CategoryDef[] = [
  { id: 'offshore', title: 'Exploração Offshore', icon: Ship, color: 'bg-amber-500', desc: 'Plataformas e campos marítimos', subtypes: ['Plataforma Fixa', 'FPSO', 'Semi-Submersível', 'Jacket', 'TLP', 'SPAR'] },
  { id: 'onshore', title: 'Exploração Onshore', icon: Fuel, color: 'bg-amber-600', desc: 'Campos terrestres de petróleo e gás', subtypes: ['Campo Terrestre', 'Poços de Desenvolvimento', 'EOR/IOR', 'Gás Não-Convencional'] },
  { id: 'refino', title: 'Refino', icon: Factory, color: 'bg-orange-500', desc: 'Refinarias e unidades de processamento', subtypes: ['Refinaria Completa', 'Unidade de Destilação', 'FCC', 'HDT', 'Coqueamento'] },
  { id: 'petroquimica', title: 'Petroquímica', icon: Droplet, color: 'bg-yellow-500', desc: 'Plantas petroquímicas', subtypes: ['Crackeador de Etileno', 'Planta de Polímeros', 'Aromáticos', 'Fertilizantes'] },
  { id: 'dutos', title: 'Oleoduto e Gasoduto', icon: ArrowUpDown, color: 'bg-amber-400', desc: 'Dutos de transporte', subtypes: ['Oleoduto', 'Gasoduto', 'Poliduto', 'Duto de GLP', 'Flowline Submarino'] },
  { id: 'tratamento', title: 'Gás - Tratamento', icon: Waves, color: 'bg-orange-400', desc: 'UPGNs e unidades de tratamento', subtypes: ['UPGN', 'Unidade de Dessulfurização', 'Planta de CO2', 'Unidade de Desidratação'] },
  { id: 'processamento', title: 'Gás - Processamento', icon: Flame, color: 'bg-red-500', desc: 'Processamento de gás natural', subtypes: ['Planta de Processamento', 'Unidade de Separação', 'Planta de LNG', 'Planta de GTL'] },
  { id: 'distribuicao', title: 'Gás - Distribuição', icon: ArrowUpDown, color: 'bg-yellow-600', desc: 'Redes de distribuição de gás', subtypes: ['Rede de Média Pressão', 'Rede de Baixa Pressão', 'Estação de Regulagem', 'City Gate'] },
];

// ──────────────────────────── Registry ────────────────────────────

export const MODULE_REGISTRY: Record<ModuleId, ModuleDef> = {
  energia:         { id: 'energia',         label: 'Energia Elétrica',           categories: energiaCategorias },
  mineracao:       { id: 'mineracao',       label: 'Mineração',                  categories: mineracaoCategorias },
  saneamento:      { id: 'saneamento',      label: 'Saneamento Básico',          categories: saneamentoCategorias },
  infraestrutura:  { id: 'infraestrutura',  label: 'Infraestrutura & Transportes', categories: infraestruturaCategorias },
  industria:       { id: 'industria',       label: 'Indústria',                  categories: industriaCategorias },
  petroleo:        { id: 'petroleo',        label: 'Petróleo & Gás',             categories: petroleoCategorias },
};

// ──────────────────────────── Helpers ────────────────────────────

/** Retorna as categorias de um módulo */
export function getModuleCategories(moduleId: ModuleId): CategoryDef[] {
  return MODULE_REGISTRY[moduleId]?.categories ?? [];
}

/** Retorna uma categoria específica */
export function getCategory(moduleId: ModuleId, categoryId: string): CategoryDef | undefined {
  return getModuleCategories(moduleId).find((c) => c.id === categoryId);
}

/** Retorna os subtipos de uma categoria */
export function getSubtypes(moduleId: ModuleId, categoryId: string): string[] {
  return getCategory(moduleId, categoryId)?.subtypes ?? [];
}

/** Lista de estados brasileiros (compartilhada) */
export const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

/** Workflow steps padrão para projetos */
export const DEFAULT_WORKFLOW_STEPS = [
  { step: 1, id: 'tipo',      title: 'Tipo de Projeto' },
  { step: 2, id: 'local',     title: 'Localização' },
  { step: 3, id: 'tecnico',   title: 'Dados Técnicos' },
  { step: 4, id: 'analise',   title: 'Análise IA' },
  { step: 5, id: 'resultado', title: 'Resultado' },
];
