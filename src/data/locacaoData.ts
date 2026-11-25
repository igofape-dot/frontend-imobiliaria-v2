import { formatBRL, type FinancePeriod, type FinanceSemaphore } from './financeiroData';
import type { Modo } from './rulesData';

export type LocacaoTabId =
  | 'visao-geral'
  | 'carteira'
  | 'vacancia-preco'
  | 'locacao'
  | 'captacao-retencao'
  | 'definir-regras';

export type LocacaoRegion = 'Centro' | 'Zona Norte' | 'Zona Sul' | 'Zona Leste';
export type LocacaoPropertyType = 'Apartamento' | 'Casa' | 'Sala/Loja';
export type PortfolioStatus =
  | 'Alugado'
  | 'Vago'
  | 'Em rescisão'
  | 'Em vistoria/reparo'
  | 'Captação em andamento';

export type VacantStage =
  | 'Anunciado e pronto'
  | 'Aguardando vistoria de saída'
  | 'Em reparo'
  | 'Aguardando autorização do proprietário'
  | 'Sem fotos ou dados para anunciar';

export interface LocacaoKpiItem {
  id: string;
  title: string;
  value: string;
  comparisonPrev: string;
  comparisonTarget: string;
  semaphore: FinanceSemaphore;
  semaphoreLabel: string;
  semaphoreRule: string;
  registeredBy: string;
  isEstimate?: boolean;
  agentReading: string;
  pedirPrompt: string;
  pedirSubtipo: string;
  pedirCategoria: 'Vendas e captação' | 'Cadastro e atualização' | 'Locação e contratos';
  pedirActionType:
    | 'meta_vacancia'
    | 'ajustar_preco'
    | 'publicar_anuncio'
    | 'atender_lead'
    | 'destravar_imovel'
    | 'captar_imovel'
    | 'relatorio_proprietario';
  pedirEvalParams: Record<string, string | number | boolean>;
  drawerColumns: [string, string, string, string];
  drawerRows: { col1: string; col2: string; col3: string; col4: string }[];
}

export const CALCULATION_HUMAN_CHECK_LABEL = 'Apoio ao cálculo. Conferência humana obrigatória.';
export const ESTIMATE_COMPARABLES_LABEL = 'estimativa do agente com comparáveis';

export const TAXA_ADM_MES_CARD = {
  titulo: 'Taxa de administração do mês',
  valor: 77760,
  aluguelFaturado: 864000,
  percentualMedio: 9,
  comparacao: '9% de R$ 864.000,00 de aluguéis faturados',
  nota: 'Link direto com o faturamento do Financeiro',
};

export const LOCACAO_KPIS_BY_PERIOD: Record<FinancePeriod, LocacaoKpiItem[]> = {
  mes: [
    {
      id: 'loc-carteira',
      title: 'Imóveis na carteira',
      value: '412',
      comparisonPrev: '+6 vs. mês anterior (11 entraram, 5 saíram)',
      comparisonTarget: '384 alugados · 28 vagos',
      semaphore: 'verde',
      semaphoreLabel: 'Saudável',
      semaphoreRule: 'Crescimento líquido positivo (+6 imóveis/mês)',
      registeredBy: 'Registrado pelo agente',
      agentReading:
        'A carteira cresceu 6 unidades líquidas no mês (11 captações vs. 5 saídas), mantendo 93,2% de ocupação física em 412 imóveis.',
      pedirPrompt: 'Gerar resumo mensal da carteira por região, tipo e taxa de administração média',
      pedirSubtipo: 'Captação de imóvel',
      pedirCategoria: 'Cadastro e atualização',
      pedirActionType: 'relatorio_proprietario',
      pedirEvalParams: {},
      drawerColumns: ['Região', 'Total imóveis', 'Alugados', 'Vagos'],
      drawerRows: [
        { col1: 'Centro', col2: '140', col3: '132', col4: '8 (5,7%)' },
        { col1: 'Zona Norte', col2: '112', col3: '103', col4: '9 (8,0%)' },
        { col1: 'Zona Sul', col2: '96', col3: '90', col4: '6 (6,3%)' },
        { col1: 'Zona Leste', col2: '64', col3: '59', col4: '5 (7,8%)' },
      ],
    },
    {
      id: 'loc-vacancia',
      title: 'Vacância atual',
      value: '6,8%',
      comparisonPrev: '28 de 412 imóveis (+0,9 p.p. vs. out/26)',
      comparisonTarget: 'meta ≤ 5,0% · crítico > 8,0% (LOC-006)',
      semaphore: 'ambar',
      semaphoreLabel: 'Atenção',
      semaphoreRule: 'Regra LOC-006: verde ≤ 5% · atenção 5%–8% · crítico > 8%',
      registeredBy: 'Registrado pelo agente',
      agentReading:
        'A vacância subiu de 5,9% para 6,8% em novembro porque 11 dos 28 imóveis vagos (39%) ainda não estão prontos para anunciar ou possuem pendências.',
      pedirPrompt: 'Destravar os 11 imóveis vagos não prontos cobrando vistoria, reparos e fotos',
      pedirSubtipo: 'Ajuste de preço',
      pedirCategoria: 'Cadastro e atualização',
      pedirActionType: 'destravar_imovel',
      pedirEvalParams: {},
      drawerColumns: ['Causa do imóvel vago', 'Quantidade', 'Participação', 'Ação do agente'],
      drawerRows: [
        { col1: 'Anunciados e prontos', col2: '17', col3: '61%', col4: 'Monitorar leads e preço' },
        { col1: 'Em reparo', col2: '4', col3: '14%', col4: 'Orçamentos / FIN-011' },
        { col1: 'Aguardando vistoria de saída', col2: '3', col3: '11%', col4: 'Cobrar vistoriador' },
        { col1: 'Autorização ou fotos faltando', col2: '4', col3: '14%', col4: 'Solicitado ao dono/fotógrafo' },
      ],
    },
    {
      id: 'loc-tempo-alugar',
      title: 'Tempo médio para alugar',
      value: '27 dias',
      comparisonPrev: '-2 dias vs. mês anterior · vagos hoje: 34d',
      comparisonTarget: 'meta ≤ 30 dias · crítico > 45d (LOC-006)',
      semaphore: 'verde',
      semaphoreLabel: 'Saudável',
      semaphoreRule: 'Regra LOC-006: verde ≤ 30d · crítico > 45d',
      registeredBy: 'Registrado pelo agente',
      agentReading:
        'Os 11 contratos fechados no mês giraram em média em 27 dias, mas o estoque vago atual já acumula média de 34 dias parado.',
      pedirPrompt: 'Gerar sugestões de preço para os 12 imóveis vagos há mais de 30 dias',
      pedirSubtipo: 'Ajuste de preço',
      pedirCategoria: 'Vendas e captação',
      pedirActionType: 'ajustar_preco',
      pedirEvalParams: { apenasSugerirPreco: true, variacaoPct: 8 },
      drawerColumns: ['Faixa parado hoje', 'Qtd vagos', 'Aluguel pedido', 'Status LOC-006'],
      drawerRows: [
        { col1: '0 a 15 dias', col2: '9', col3: 'R$ 17.550,00', col4: 'Dentro da janela' },
        { col1: '16 a 30 dias', col2: '7', col3: 'R$ 13.700,00', col4: 'Atenção D-30' },
        { col1: '31 a 60 dias', col2: '7', col3: 'R$ 21.850,00', col4: 'Alerta enviado' },
        { col1: 'Acima de 60 dias', col2: '5', col3: 'R$ 13.300,00', col4: 'Sugestão de preço pronta' },
      ],
    },
    {
      id: 'loc-vagos-30',
      title: 'Vagos há mais de 30 dias',
      value: '12',
      comparisonPrev: '43% dos vagos (5 acima de 60 dias)',
      comparisonTarget: 'meta ≤ 6 imóveis > 30d',
      semaphore: 'vermelho',
      semaphoreLabel: 'Crítico',
      semaphoreRule: 'Crítico quando > 10 imóveis vagos ultrapassam 30 dias',
      registeredBy: 'Registrado pelo agente',
      agentReading:
        'Cinco unidades já passaram de 60 dias e 6 dos 12 imóveis acima de 30 dias não receberam nenhuma visita nos últimos 30 dias.',
      pedirPrompt: 'Solicitar autorização de redução de preço aos proprietários dos imóveis com 0 visitas',
      pedirSubtipo: 'Ajuste de preço',
      pedirCategoria: 'Vendas e captação',
      pedirActionType: 'meta_vacancia',
      pedirEvalParams: { diasVago: 64, visitas30d: 0 },
      drawerColumns: ['Imóvel', 'Dias vago', 'Visitas 30d', 'Diferença mercado'],
      drawerRows: [
        { col1: 'Casa Rua das Figueiras 210', col2: '68 dias', col3: '0', col4: '+12,1% acima' },
        { col1: 'Loja 5 Galeria Norte', col2: '58 dias', col3: '2', col4: '+10,6% acima' },
        { col1: 'Apto 401 Ed. Aurora', col2: '64 dias', col3: '0', col4: '+8,9% · Em reparo' },
        { col1: 'Sala 301 Comercial Paulista', col2: '54 dias', col3: '4', col4: '+2,5% (proposta carência)' },
      ],
    },
    {
      id: 'loc-receita-perdida',
      title: 'Receita mensal parada pela vacância',
      value: 'R$ 66.400,00',
      comparisonPrev: '≈ R$ 5.976,00/mês em taxa (estimativa 9%)',
      comparisonTarget: 'teto tolerável ≤ R$ 45.000,00/mês',
      semaphore: 'vermelho',
      semaphoreLabel: 'Crítico',
      semaphoreRule: 'Soma exata dos 28 aluguéis pedidos sem contrato ativo',
      registeredBy: 'Registrado pelo agente · estimativa de taxa 9%',
      isEstimate: true,
      agentReading:
        'Os 28 imóveis vagos representam R$ 66.400,00/mês em aluguéis não realizados pelos proprietários e cerca de R$ 5.976,00/mês em taxa de administração estimada.',
      pedirPrompt: 'Priorizar anúncio e ajuste de preço nos 8 imóveis vagos de maior valor pedido',
      pedirSubtipo: 'Ajuste de preço',
      pedirCategoria: 'Vendas e captação',
      pedirActionType: 'ajustar_preco',
      pedirEvalParams: { apenasSugerirPreco: true, variacaoPct: 7 },
      drawerColumns: ['Segmento', 'Qtd vagos', 'Soma pedida/mês', 'Taxa est. 9%'],
      drawerRows: [
        { col1: 'Apartamentos', col2: '14', col3: 'R$ 28.050,00', col4: 'R$ 2.524,50' },
        { col1: 'Salas e Lojas', col2: '9', col3: 'R$ 24.400,00', col4: 'R$ 2.196,00' },
        { col1: 'Casas', col2: '5', col3: 'R$ 13.950,00', col4: 'R$ 1.255,50' },
        { col1: 'Total dos 28 vagos', col2: '28', col3: 'R$ 66.400,00', col4: 'R$ 5.976,00' },
      ],
    },
    {
      id: 'loc-conversao',
      title: 'Conversão lead → contrato',
      value: '11,5%',
      comparisonPrev: '11 fechados de 96 leads em 30d',
      comparisonTarget: 'meta ≥ 14,0%',
      semaphore: 'ambar',
      semaphoreLabel: 'Atenção',
      semaphoreRule: 'Meta ≥ 14% · gargalo Visita → Proposta (46%)',
      registeredBy: 'Registrado pelo agente',
      agentReading:
        'O maior estreitamento ocorre entre Visitas realizadas (41) e Propostas recebidas (19 — 46% de conversão); Sala 301 e Apto 604 aguardam decisão.',
      pedirPrompt: 'Enviar pesquisa rápida para leads que visitaram há 48h e não enviaram proposta',
      pedirSubtipo: 'Lead de portal',
      pedirCategoria: 'Vendas e captação',
      pedirActionType: 'atender_lead',
      pedirEvalParams: { foraJanelaHorario: false },
      drawerColumns: ['Etapa (30 dias)', 'Volume', 'Conversão etapa', 'Conversão topo'],
      drawerRows: [
        { col1: 'Leads de locação recebidos', col2: '96', col3: '100%', col4: '100%' },
        { col1: 'Visitas realizadas', col2: '41', col3: '42,7%', col4: '42,7%' },
        { col1: 'Propostas recebidas (gargalo)', col2: '19', col3: '46,3%', col4: '19,8%' },
        { col1: 'Cadastros aprovados → Contratos', col2: '14 → 11', col3: '78,6%', col4: '11,5%' },
      ],
    },
    {
      id: 'loc-acima-mercado',
      title: 'Vagos acima do preço de mercado',
      value: '9 de 28 (32%)',
      comparisonPrev: 'diferença > 5% vs. estimativa comparáveis',
      comparisonTarget: 'meta ≤ 15% dos vagos (> 5%)',
      semaphore: 'ambar',
      semaphoreLabel: 'Atenção',
      semaphoreRule: 'Comparação com estimativa do agente com comparáveis',
      registeredBy: 'Registrado pelo agente · estimativa com comparáveis',
      isEstimate: true,
      agentReading:
        'Nove imóveis vagos estão pedidos mais de 5% acima da mediana estimada de comparáveis; 4 deles já passam de 45 dias e têm simulação pronta.',
      pedirPrompt: 'Preparar dossiê de comparáveis para conversar com os proprietários dos 9 imóveis',
      pedirSubtipo: 'Ajuste de preço',
      pedirCategoria: 'Vendas e captação',
      pedirActionType: 'ajustar_preco',
      pedirEvalParams: { apenasSugerirPreco: true, variacaoPct: 9 },
      drawerColumns: ['Imóvel', 'Pedido', 'Est. mercado', 'Diferença'],
      drawerRows: [
        { col1: 'Casa Rua das Figueiras 210', col2: 'R$ 3.800,00', col3: 'R$ 3.390,00', col4: '+12,1%' },
        { col1: 'Loja 5 Galeria Norte', col2: 'R$ 4.600,00', col3: 'R$ 4.160,00', col4: '+10,6%' },
        { col1: 'Apto 401 Ed. Aurora', col2: 'R$ 2.450,00', col3: 'R$ 2.250,00', col4: '+8,9%' },
        { col1: 'Sala 12 Ed. Central', col2: 'R$ 3.200,00', col3: 'R$ 2.945,00', col4: '+8,7%' },
      ],
    },
    {
      id: 'loc-retencao',
      title: 'Retenção de proprietários (12m)',
      value: '92,5%',
      comparisonPrev: '247 de 267 proprietários mantidos (5 saídas/mês)',
      comparisonTarget: 'meta ≥ 94,0%',
      semaphore: 'ambar',
      semaphoreLabel: 'Atenção',
      semaphoreRule: 'Abaixo de 94% sinaliza atenção em vacância e atendimento',
      registeredBy: 'Registrado pelo agente',
      agentReading:
        'Dos 5 imóveis que saíram no mês, 2 foram por vacância longa acima de 60 dias e 1 por venda direta; 4 proprietários ativos estão em zona de atenção.',
      pedirPrompt: 'Preparar contato preventivo para os 4 proprietários em risco de saída',
      pedirSubtipo: 'Captação de imóvel',
      pedirCategoria: 'Cadastro e atualização',
      pedirActionType: 'relatorio_proprietario',
      pedirEvalParams: {},
      drawerColumns: ['Motivo de saída (mês)', 'Imóveis', 'Proprietários', 'Ação preventiva'],
      drawerRows: [
        { col1: 'Vacância longa (> 60 dias)', col2: '2', col3: '2', col4: 'Revisão preço + fotos' },
        { col1: 'Venda direta pelo proprietário', col2: '1', col3: '1', col4: 'Ofertar captação Vendas' },
        { col1: 'Uso próprio / familiar', col2: '1', col3: '1', col4: 'Manter relacionamento' },
        { col1: 'Troca de imobiliária', col2: '1', col3: '1', col4: 'Pesquisa de saída' },
      ],
    },
  ],
  '30d': [],
  '12m': [],
};

LOCACAO_KPIS_BY_PERIOD['30d'] = LOCACAO_KPIS_BY_PERIOD.mes;
LOCACAO_KPIS_BY_PERIOD['12m'] = LOCACAO_KPIS_BY_PERIOD.mes.map((k) => {
  if (k.id === 'loc-vacancia') {
    return { ...k, value: '5,7%', comparisonPrev: 'média 12 meses (atual 6,8%)' };
  }
  if (k.id === 'loc-conversao') {
    return { ...k, value: '13,2%', comparisonPrev: '148 contratos / 1.121 leads (12m)' };
  }
  return k;
});

export interface LocacaoAlertItem {
  id: string;
  titulo: string;
  detalhe: string;
  urgencia: 'critico' | 'atencao';
  actionLabel: string;
  targetTab?: LocacaoTabId;
  externalNav?: 'manutencao-vistorias' | 'contratos-juridico' | 'financeiro' | 'captacao-marketing';
  askPayload?: {
    title: string;
    prefillText: string;
    categoria: 'Vendas e captação' | 'Cadastro e atualização' | 'Locação e contratos';
    subtipo: string;
    actionType:
      | 'meta_vacancia'
      | 'ajustar_preco'
      | 'publicar_anuncio'
      | 'destravar_imovel'
      | 'analise_cadastral'
      | 'captar_imovel'
      | 'relatorio_proprietario';
    evalParams: Record<string, string | number | boolean>;
  };
}

export const LOCACAO_ALERTS: LocacaoAlertItem[] = [
  {
    id: 'lalt-1',
    titulo: '12 imóveis vagos há > 30 dias',
    detalhe: '5 acima de 60 dias · alerta LOC-006 v2 ativo',
    urgencia: 'critico',
    actionLabel: 'Ver vagos',
    targetTab: 'vacancia-preco',
  },
  {
    id: 'lalt-2',
    titulo: '9 imóveis > 5% acima do mercado',
    detalhe: 'Estimativa do agente com comparáveis · 4 sem ajuste autorizado',
    urgencia: 'atencao',
    actionLabel: 'Simular preços',
    targetTab: 'vacancia-preco',
  },
  {
    id: 'lalt-3',
    titulo: '6 imóveis com 0 visitas em 30 dias',
    detalhe: 'Inclui Casa Rua das Figueiras 210 (68d) e Apto 401 (64d)',
    urgencia: 'critico',
    actionLabel: 'Pedir revisão',
    askPayload: {
      title: 'Revisar imóveis sem visitas em 30 dias',
      prefillText:
        'Gerar diagnóstico de preço, fotos e anúncio dos 6 imóveis vagos que tiveram zero visitas nos últimos 30 dias (LOC-006 v2).',
      categoria: 'Vendas e captação',
      subtipo: 'Ajuste de preço',
      actionType: 'meta_vacancia',
      evalParams: { diasVago: 64, visitas30d: 0 },
    },
  },
  {
    id: 'lalt-4',
    titulo: '3 aguardando vistoria de saída',
    detalhe: 'Bloqueados para anúncio pela LOC-002 v3 até vistoria',
    urgencia: 'atencao',
    actionLabel: 'Ir p/ Vistorias',
    externalNav: 'manutencao-vistorias',
  },
  {
    id: 'lalt-5',
    titulo: '4 em reparo · 2 acima de R$ 1.500',
    detalhe: 'Reparos > R$ 1.500 seguem alçada FIN-011 do Financeiro',
    urgencia: 'atencao',
    actionLabel: 'Destravar reparos',
    targetTab: 'vacancia-preco',
  },
  {
    id: 'lalt-6',
    titulo: '2 sem fotos/dados mínimos (LOC-002)',
    detalhe: 'Apto 205 e Loja 08 com menos de 8 fotos · anúncio bloqueado',
    urgencia: 'atencao',
    actionLabel: 'Solicitar fotos',
    askPayload: {
      title: 'Destravar anúncios incompletos (LOC-002)',
      prefillText:
        'Acionar fotógrafo e proprietários dos 2 imóveis com menos de 8 fotos ou dados incompletos para liberar publicação nos portais.',
      categoria: 'Cadastro e atualização',
      subtipo: 'Cadastro de imóvel',
      actionType: 'publicar_anuncio',
      evalParams: { fotosCount: 4, camposAnuncioCompletos: false, imovelPronto: true },
    },
  },
  {
    id: 'lalt-7',
    titulo: '2 análises cadastrais com pendência',
    detalhe: 'Renata Duarte (31,5%) e Bruno Vasconcelos (faltam 2 docs)',
    urgencia: 'atencao',
    actionLabel: 'Abrir Locação',
    targetTab: 'locacao',
  },
  {
    id: 'lalt-8',
    titulo: '4 exclusividades vencendo em 30d',
    detalhe: 'Inclui Loja 5 Galeria Norte (05/12/2026) e Sala 301 (18/12/2026)',
    urgencia: 'atencao',
    actionLabel: 'Ver retenção',
    targetTab: 'captacao-retencao',
  },
  {
    id: 'lalt-9',
    titulo: '4 proprietários em risco de saída',
    detalhe: 'Helena Prado, Otávio Ramos, Sérgio Valadares e Eliane Cardoso',
    urgencia: 'critico',
    actionLabel: 'Acionar retenção',
    targetTab: 'captacao-retencao',
  },
];

export const VACANCY_TREND_12M = [
  { mes: 'Dez/25', taxa: 5.2, meta: 5.0 },
  { mes: 'Jan/26', taxa: 5.4, meta: 5.0 },
  { mes: 'Fev/26', taxa: 5.3, meta: 5.0 },
  { mes: 'Mar/26', taxa: 5.6, meta: 5.0 },
  { mes: 'Abr/26', taxa: 5.5, meta: 5.0 },
  { mes: 'Mai/26', taxa: 5.7, meta: 5.0 },
  { mes: 'Jun/26', taxa: 5.6, meta: 5.0 },
  { mes: 'Jul/26', taxa: 5.8, meta: 5.0 },
  { mes: 'Ago/26', taxa: 5.7, meta: 5.0 },
  { mes: 'Set/26', taxa: 5.8, meta: 5.0 },
  { mes: 'Out/26', taxa: 5.9, meta: 5.0 },
  { mes: 'Nov/26', taxa: 6.8, meta: 5.0 },
];

export const VAGOS_STAGE_BREAKDOWN: {
  stage: VacantStage;
  count: number;
  pct: number;
  pronto: boolean;
  tone: 'emerald' | 'amber' | 'red';
}[] = [
  { stage: 'Anunciado e pronto', count: 17, pct: 61, pronto: true, tone: 'emerald' },
  { stage: 'Em reparo', count: 4, pct: 14, pronto: false, tone: 'amber' },
  { stage: 'Aguardando vistoria de saída', count: 3, pct: 11, pronto: false, tone: 'amber' },
  { stage: 'Aguardando autorização do proprietário', count: 2, pct: 7, pronto: false, tone: 'red' },
  { stage: 'Sem fotos ou dados para anunciar', count: 2, pct: 7, pronto: false, tone: 'red' },
];

export const VACANCY_BY_REGION: {
  regiao: LocacaoRegion;
  vagos: number;
  total: number;
  taxaPct: number;
}[] = [
  { regiao: 'Centro', vagos: 8, total: 140, taxaPct: 5.7 },
  { regiao: 'Zona Norte', vagos: 9, total: 112, taxaPct: 8.0 },
  { regiao: 'Zona Sul', vagos: 6, total: 96, taxaPct: 6.3 },
  { regiao: 'Zona Leste', vagos: 5, total: 64, taxaPct: 7.8 },
];

export const VACANCY_BY_TYPE: {
  tipo: LocacaoPropertyType;
  vagos: number;
  total: number;
  taxaPct: number;
}[] = [
  { tipo: 'Apartamento', vagos: 14, total: 238, taxaPct: 5.9 },
  { tipo: 'Casa', vagos: 5, total: 74, taxaPct: 6.8 },
  { tipo: 'Sala/Loja', vagos: 9, total: 100, taxaPct: 9.0 },
];

export interface FunnelStepLocacao {
  etapa: string;
  qtd: number;
  convAnteriorPct: string;
  gargalo?: boolean;
}

export const LOCACAO_FUNNEL_BY_PERIOD: Record<'hoje' | '7d' | '30d', FunnelStepLocacao[]> = {
  hoje: [
    { etapa: 'Leads de locação', qtd: 6, convAnteriorPct: '100%' },
    { etapa: 'Visitas agendadas/feitas', qtd: 3, convAnteriorPct: '50%' },
    { etapa: 'Propostas recebidas', qtd: 2, convAnteriorPct: '67%', gargalo: true },
    { etapa: 'Cadastros aprovados', qtd: 1, convAnteriorPct: '50%' },
    { etapa: 'Contratos fechados', qtd: 1, convAnteriorPct: '100%' },
  ],
  '7d': [
    { etapa: 'Leads de locação', qtd: 27, convAnteriorPct: '100%' },
    { etapa: 'Visitas realizadas', qtd: 12, convAnteriorPct: '44%' },
    { etapa: 'Propostas recebidas', qtd: 5, convAnteriorPct: '42%', gargalo: true },
    { etapa: 'Cadastros aprovados', qtd: 4, convAnteriorPct: '80%' },
    { etapa: 'Contratos fechados', qtd: 3, convAnteriorPct: '75%' },
  ],
  '30d': [
    { etapa: 'Leads de locação', qtd: 96, convAnteriorPct: '100%' },
    { etapa: 'Visitas realizadas', qtd: 41, convAnteriorPct: '43%' },
    { etapa: 'Propostas recebidas', qtd: 19, convAnteriorPct: '46%', gargalo: true },
    { etapa: 'Cadastros aprovados', qtd: 14, convAnteriorPct: '74%' },
    { etapa: 'Contratos fechados', qtd: 11, convAnteriorPct: '79%' },
  ],
};

export const ENTRADAS_PREVISTAS_90D = {
  rescisoesEmCurso: 3,
  renovacoesSemRespostaEstimada: 8,
  totalPrevisto: 11,
  leituraAgente:
    'Há 3 rescisões confirmadas e cerca de 8 contratos vencendo em 90 dias sem retorno do locatário (de 37 acompanhados em Contratos e Jurídico). Se entrarem sem pré-captação, a vacância pode subir de 6,8% para 9,5%.',
};

export const LOCACAO_AUTONOMY_MAP: {
  autonomo: { texto: string; regra: string }[];
  aprovacao: { texto: string; regra: string }[];
  sugerir: { texto: string; regra: string }[];
  bloqueado: { texto: string; regra: string }[];
} = {
  autonomo: [
    { texto: 'Atender leads em ≤ 5 min (8h–19h) e agendar visitas sem ocupação', regra: 'LOC-003 v2' },
    { texto: 'Publicar anúncios com ≥ 8 fotos, dados completos e imóvel pronto', regra: 'LOC-002 v3' },
    { texto: 'Ajuste de preço ≤ 5% com autorização registrada do proprietário', regra: 'LOC-001 v2' },
    { texto: 'Cadastrar imóvel captado após extração ≥ 85% (taxa ≥ 9%)', regra: 'LOC-005 v2' },
    { texto: 'Alertar gestor aos 30d e sugerir ajuste de preço aos 45d / 0 visitas', regra: 'LOC-006 v2' },
  ],
  aprovacao: [
    { texto: 'Ajustar preço entre 5% e 15% com autorização do proprietário (Gestor 4h)', regra: 'LOC-001 v2' },
    { texto: 'Decidir aprovação cadastral de candidato (Gestor 8h · nunca reprova só)', regra: 'LOC-004 v1' },
    { texto: 'Aprovar taxa de administração entre 7% e < 9% (Gestor 8h)', regra: 'LOC-005 v2' },
    { texto: 'Cláusula alterada na minuta Administração v5 (Jurídico 24h)', regra: 'JUR-005 v2' },
    { texto: 'Orçamentos de reparo de imóvel vago > R$ 1.500 (Gestor 4h)', regra: 'FIN-011 v2' },
  ],
  sugerir: [
    { texto: 'Concessões na negociação (carência ou desconto no 1º aluguel)', regra: 'Lacuna de regra' },
    { texto: 'Relatório mensal automático ao proprietário (regra em rascunho)', regra: 'LOC-007 v1' },
  ],
  bloqueado: [
    { texto: 'Alterar preço sem autorização do proprietário ou variar > 15%', regra: 'LOC-001 v2' },
    { texto: 'Publicar anúncio incompleto (< 8 fotos ou em vistoria/reparo)', regra: 'LOC-002 v3' },
    { texto: 'Agendar visita em imóvel ocupado sem aviso 24h e consentimento', regra: 'LOC-003 v2' },
    { texto: 'Consultar bureau sem consentimento LGPD ou reprovar candidato só', regra: 'LOC-004 v1' },
    { texto: 'Captar com taxa < 7% ou alterar valor/cláusula sem aprovação', regra: 'LOC-005 · BAR-002' },
  ],
};

// ---------------------------------------------------------------------------
// CARTEIRA (20 de 412 imóveis exibidos)
// ---------------------------------------------------------------------------

export interface PropertyPortfolioItem {
  id: string;
  codigo: string;
  endereco: string;
  regiao: LocacaoRegion;
  tipo: LocacaoPropertyType;
  metragemM2: number;
  quartos: number;
  vagas: number;
  situacao: PortfolioStatus;
  inquilino: string | null;
  proprietario: string;
  proprietarioCpfMascarado: string;
  proprietarioCpfReal: string;
  proprietarioBancoMascarado: string;
  proprietarioBancoReal: string;
  aluguelValor: number;
  condominioIptu: number;
  taxaAdmPct: number;
  contratoNum: string | null;
  vencimentoContrato: string | null;
  corretor: string;
  anunciadoEm: string[];
  diasVago: number;
  ultimaLocacaoEm: string;
  extracaoFonte: string;
  extracaoConfianca: number;
  registeredBy: string;
  fotosCount: number;
  autorizacaoDivulgacao: boolean;
  tituloAnuncio: string;
  descricaoAnuncio: string;
  historicoLocacoes: { periodo: string; inquilino: string; valor: number; motivoSaida?: string }[];
  manutencoesHistorico: { data: string; descricao: string; valor: number; status: string }[];
  pedidosRelacionados: string[];
}

export const INITIAL_PORTFOLIO_20: PropertyPortfolioItem[] = [
  {
    id: 'imv-1',
    codigo: 'IMV-302',
    endereco: 'Apto 302 · Ed. Vista Verde',
    regiao: 'Centro',
    tipo: 'Apartamento',
    metragemM2: 78,
    quartos: 2,
    vagas: 1,
    situacao: 'Alugado',
    inquilino: 'Carlos Mendes',
    proprietario: 'João Batista',
    proprietarioCpfMascarado: '***.412.889-**',
    proprietarioCpfReal: '318.412.889-04',
    proprietarioBancoMascarado: 'Itaú Ag **** · CC *****-2',
    proprietarioBancoReal: 'Itaú (341) Ag 0412 · CC 44810-2',
    aluguelValor: 3200,
    condominioIptu: 790,
    taxaAdmPct: 9,
    contratoNum: 'CT-2024-0187',
    vencimentoContrato: '15/12/2026',
    corretor: 'Rafael Costa',
    anunciadoEm: [],
    diasVago: 0,
    ultimaLocacaoEm: '15/12/2024',
    extracaoFonte: 'Matricula_IMV302.pdf, pág. 1',
    extracaoConfianca: 97,
    registeredBy: 'Registrado pelo agente, fonte: Matricula_IMV302.pdf, pág. 1',
    fotosCount: 14,
    autorizacaoDivulgacao: true,
    tituloAnuncio: 'Apto 2 dorms Ed. Vista Verde c/ 1 vaga no Centro',
    descricaoAnuncio:
      'Apartamento claro de 78 m² com 2 dormitórios, varanda envidraçada, armários planejados e 1 vaga coberta a 400m do metrô.',
    historicoLocacoes: [
      { periodo: '12/2024 – atual', inquilino: 'Carlos Mendes', valor: 3200 },
      { periodo: '08/2022 – 11/2024', inquilino: 'Lívia Moraes', valor: 2850, motivoSaida: 'Mudança de cidade' },
    ],
    manutencoesHistorico: [
      { data: '12/09/2026', descricao: 'Revisão elétrica do quadro de disjuntores', valor: 420, status: 'Concluída' },
    ],
    pedidosRelacionados: ['PED-2026-004812'],
  },
  {
    id: 'imv-2',
    codigo: 'IMV-104',
    endereco: 'Casa Rua das Figueiras 210',
    regiao: 'Zona Sul',
    tipo: 'Casa',
    metragemM2: 142,
    quartos: 3,
    vagas: 2,
    situacao: 'Vago',
    inquilino: null,
    proprietario: 'Otávio Ramos',
    proprietarioCpfMascarado: '***.701.224-**',
    proprietarioCpfReal: '294.701.224-11',
    proprietarioBancoMascarado: 'Bradesco Ag **** · CC *****-8',
    proprietarioBancoReal: 'Bradesco (237) Ag 2219 · CC 19832-8',
    aluguelValor: 3800,
    condominioIptu: 380,
    taxaAdmPct: 9,
    contratoNum: null,
    vencimentoContrato: null,
    corretor: 'Rafael Costa',
    anunciadoEm: ['ZAP', 'VivaReal', 'Site próprio'],
    diasVago: 68,
    ultimaLocacaoEm: '15/09/2026',
    extracaoFonte: 'Ficha_Captacao_Figueiras210.pdf, pág. 1',
    extracaoConfianca: 94,
    registeredBy: 'Registrado pelo agente, fonte: Ficha_Captacao_Figueiras210.pdf, pág. 1',
    fotosCount: 16,
    autorizacaoDivulgacao: true,
    tituloAnuncio: 'Casa térrea 3 dorms e quintal na Rua das Figueiras 210',
    descricaoAnuncio:
      'Casa espaçosa de 142 m² com 3 dormitórios (1 suíte), quintal arborizado, edícula e 2 vagas cobertas em rua tranquila da Zona Sul.',
    historicoLocacoes: [
      { periodo: '09/2023 – 09/2026', inquilino: 'Marcos Silveira', valor: 3500, motivoSaida: 'Compra de imóvel próprio' },
    ],
    manutencoesHistorico: [
      { data: '25/09/2026', descricao: 'Pintura externa e revisão de calhas pós-saída', valor: 1380, status: 'Concluída' },
    ],
    pedidosRelacionados: ['PED-2026-004829'],
  },
  {
    id: 'imv-3',
    codigo: 'IMV-405',
    endereco: 'Loja 5 Galeria Norte',
    regiao: 'Zona Norte',
    tipo: 'Sala/Loja',
    metragemM2: 64,
    quartos: 0,
    vagas: 1,
    situacao: 'Vago',
    inquilino: null,
    proprietario: 'Sérgio Valadares',
    proprietarioCpfMascarado: '***.559.103-**',
    proprietarioCpfReal: '185.559.103-82',
    proprietarioBancoMascarado: 'Santander Ag **** · CC *****-4',
    proprietarioBancoReal: 'Santander (033) Ag 1104 · CC 88412-4',
    aluguelValor: 4600,
    condominioIptu: 920,
    taxaAdmPct: 9,
    contratoNum: null,
    vencimentoContrato: null,
    corretor: 'Rafael Costa',
    anunciadoEm: ['ZAP', 'Imovelweb'],
    diasVago: 58,
    ultimaLocacaoEm: '25/09/2026',
    extracaoFonte: 'Matricula_Loja5_GaleriaNorte.pdf, pág. 2',
    extracaoConfianca: 92,
    registeredBy: 'Registrado pelo agente, fonte: Matricula_Loja5_GaleriaNorte.pdf, pág. 2',
    fotosCount: 11,
    autorizacaoDivulgacao: true,
    tituloAnuncio: 'Loja térrea 64 m² na Galeria Norte com vitrine ampla',
    descricaoAnuncio:
      'Loja comercial pronta para operação no piso térreo da Galeria Norte, pé-direito 4,2m, copa e banheiro privativo.',
    historicoLocacoes: [
      { periodo: '05/2023 – 09/2026', inquilino: 'Ótica Horizonte Ltda', valor: 4400, motivoSaida: 'Encerramento filial' },
    ],
    manutencoesHistorico: [],
    pedidosRelacionados: [],
  },
  {
    id: 'imv-4',
    codigo: 'IMV-301',
    endereco: 'Sala 301 · Ed. Comercial Paulista',
    regiao: 'Centro',
    tipo: 'Sala/Loja',
    metragemM2: 52,
    quartos: 0,
    vagas: 1,
    situacao: 'Vago',
    inquilino: null,
    proprietario: 'Eliane Cardoso',
    proprietarioCpfMascarado: '***.882.441-**',
    proprietarioCpfReal: '402.882.441-90',
    proprietarioBancoMascarado: 'Banco do Brasil Ag **** · CC *****-1',
    proprietarioBancoReal: 'BB (001) Ag 3042 · CC 22901-1',
    aluguelValor: 4100,
    condominioIptu: 840,
    taxaAdmPct: 9,
    contratoNum: null,
    vencimentoContrato: null,
    corretor: 'Rafael Costa',
    anunciadoEm: ['ZAP', 'VivaReal', 'Site próprio'],
    diasVago: 54,
    ultimaLocacaoEm: '29/09/2026',
    extracaoFonte: 'Contrato_Admin_IMV301.pdf, pág. 1',
    extracaoConfianca: 95,
    registeredBy: 'Registrado pelo agente, fonte: Contrato_Admin_IMV301.pdf, pág. 1',
    fotosCount: 12,
    autorizacaoDivulgacao: true,
    tituloAnuncio: 'Sala 52 m² c/ recepção e ar central · Ed. Comercial Paulista',
    descricaoAnuncio:
      'Sala comercial pronta com piso elevado, ar-condicionado central, recepção e 1 vaga com manobrista a 150m do metrô.',
    historicoLocacoes: [
      { periodo: '02/2024 – 09/2026', inquilino: 'Consultoria Ápex', valor: 3900, motivoSaida: 'Expansão de equipe' },
    ],
    manutencoesHistorico: [],
    pedidosRelacionados: ['PED-2026-004832'],
  },
  {
    id: 'imv-5',
    codigo: 'IMV-604',
    endereco: 'Apto 604 · Ed. Jardins Sul',
    regiao: 'Zona Sul',
    tipo: 'Apartamento',
    metragemM2: 74,
    quartos: 2,
    vagas: 1,
    situacao: 'Captação em andamento',
    inquilino: null,
    proprietario: 'Fundo Aurora (9 imóveis)',
    proprietarioCpfMascarado: '**.482.100/0001-**',
    proprietarioCpfReal: '14.482.100/0001-76',
    proprietarioBancoMascarado: 'BTG Ag **** · CC *****-9',
    proprietarioBancoReal: 'BTG (208) Ag 0001 · CC 90124-9',
    aluguelValor: 2950,
    condominioIptu: 700,
    taxaAdmPct: 8,
    contratoNum: null,
    vencimentoContrato: null,
    corretor: 'Rafael Costa',
    anunciadoEm: ['ZAP', 'Site próprio'],
    diasVago: 19,
    ultimaLocacaoEm: '03/11/2026',
    extracaoFonte: 'Portfolio_Aurora_Nov26.pdf, pág. 3',
    extracaoConfianca: 93,
    registeredBy: 'Registrado pelo agente, fonte: Portfolio_Aurora_Nov26.pdf, pág. 3',
    fotosCount: 10,
    autorizacaoDivulgacao: true,
    tituloAnuncio: 'Apto 2 dorms reformado Ed. Jardins Sul · pronto p/ morar',
    descricaoAnuncio:
      'Apartamento de 74 m² reformado no Jardins Sul com cozinha americana, sacada e área de lazer completa.',
    historicoLocacoes: [],
    manutencoesHistorico: [],
    pedidosRelacionados: ['PED-2026-004830'],
  },
  {
    id: 'imv-6',
    codigo: 'IMV-902',
    endereco: 'Apto 401 · Ed. Aurora',
    regiao: 'Zona Norte',
    tipo: 'Apartamento',
    metragemM2: 62,
    quartos: 2,
    vagas: 1,
    situacao: 'Em vistoria/reparo',
    inquilino: null,
    proprietario: 'Fundo Aurora (9 imóveis)',
    proprietarioCpfMascarado: '**.482.100/0001-**',
    proprietarioCpfReal: '14.482.100/0001-76',
    proprietarioBancoMascarado: 'BTG Ag **** · CC *****-9',
    proprietarioBancoReal: 'BTG (208) Ag 0001 · CC 90124-9',
    aluguelValor: 2450,
    condominioIptu: 540,
    taxaAdmPct: 9,
    contratoNum: null,
    vencimentoContrato: null,
    corretor: 'Rafael Costa',
    anunciadoEm: [],
    diasVago: 64,
    ultimaLocacaoEm: '19/09/2026',
    extracaoFonte: 'Vistoria_Saida_Apto401_Aurora.pdf, pág. 1',
    extracaoConfianca: 89,
    registeredBy: 'Registrado pelo agente, fonte: Vistoria_Saida_Apto401_Aurora.pdf, pág. 1',
    fotosCount: 9,
    autorizacaoDivulgacao: true,
    tituloAnuncio: 'Apto 2 dorms Ed. Aurora · Zona Norte próximo ao parque',
    descricaoAnuncio:
      'Apartamento bem iluminado com 2 quartos e 1 vaga coberta em condomínio familiar na Zona Norte.',
    historicoLocacoes: [
      { periodo: '03/2024 – 09/2026', inquilino: 'Bruno Meireles', valor: 2300, motivoSaida: 'Término de contrato' },
    ],
    manutencoesHistorico: [
      { data: '18/11/2026', descricao: 'Troca de piso laminado da sala (orçamento > R$ 1.500)', valor: 1980, status: 'Aguardando aprovação FIN-011' },
    ],
    pedidosRelacionados: [],
  },
  {
    id: 'imv-7',
    codigo: 'IMV-204',
    endereco: 'Apto 204 · Ed. Bela Vista',
    regiao: 'Centro',
    tipo: 'Apartamento',
    metragemM2: 68,
    quartos: 2,
    vagas: 1,
    situacao: 'Em rescisão',
    inquilino: 'Juliana Rocha',
    proprietario: 'Marta Siqueira',
    proprietarioCpfMascarado: '***.119.305-**',
    proprietarioCpfReal: '215.119.305-44',
    proprietarioBancoMascarado: 'Itaú Ag **** · CC *****-7',
    proprietarioBancoReal: 'Itaú (341) Ag 0910 · CC 33091-7',
    aluguelValor: 2890,
    condominioIptu: 650,
    taxaAdmPct: 9,
    contratoNum: 'CT-2023-0912',
    vencimentoContrato: '10/01/2027',
    corretor: 'Rafael Costa',
    anunciadoEm: [],
    diasVago: 0,
    ultimaLocacaoEm: '10/01/2024',
    extracaoFonte: 'CT-2023-0912.pdf, pág. 1',
    extracaoConfianca: 96,
    registeredBy: 'Registrado pelo agente, fonte: CT-2023-0912.pdf, pág. 1',
    fotosCount: 11,
    autorizacaoDivulgacao: true,
    tituloAnuncio: 'Apto 2 dorms Ed. Bela Vista · 68 m² a 3 min do metrô',
    descricaoAnuncio:
      'Apartamento funcional no Ed. Bela Vista com 2 dormitórios, cozinha equipada e portaria 24 horas.',
    historicoLocacoes: [
      { periodo: '01/2024 – atual', inquilino: 'Juliana Rocha', valor: 2890 },
    ],
    manutencoesHistorico: [],
    pedidosRelacionados: ['PED-2026-004827'],
  },
  {
    id: 'imv-8',
    codigo: 'IMV-804',
    endereco: 'Sala 804 · Ed. Paulista Center',
    regiao: 'Centro',
    tipo: 'Sala/Loja',
    metragemM2: 88,
    quartos: 0,
    vagas: 2,
    situacao: 'Alugado',
    inquilino: 'Clínica Vitae Ltda',
    proprietario: 'Helena Prado',
    proprietarioCpfMascarado: '***.640.772-**',
    proprietarioCpfReal: '176.640.772-09',
    proprietarioBancoMascarado: 'Sicredi Ag **** · CC *****-5',
    proprietarioBancoReal: 'Sicredi (748) Ag 0718 · CC 51209-5',
    aluguelValor: 5800,
    condominioIptu: 1290,
    taxaAdmPct: 9,
    contratoNum: 'CT-2026-0418',
    vencimentoContrato: '30/11/2029',
    corretor: 'Mariana Salles',
    anunciadoEm: [],
    diasVago: 0,
    ultimaLocacaoEm: '22/11/2026',
    extracaoFonte: 'contrato_sala804_paulista_assinado.pdf, pág. 1',
    extracaoConfianca: 95,
    registeredBy: 'Registrado pelo agente, fonte: contrato_sala804_paulista_assinado.pdf, pág. 1',
    fotosCount: 15,
    autorizacaoDivulgacao: false,
    tituloAnuncio: 'Conjunto 88 m² · Ed. Paulista Center c/ 2 vagas',
    descricaoAnuncio:
      'Sala comercial corporativa com 3 ambientes e 2 vagas no coração da Paulista.',
    historicoLocacoes: [
      { periodo: '11/2026 – atual', inquilino: 'Clínica Vitae Ltda', valor: 5800 },
    ],
    manutencoesHistorico: [],
    pedidosRelacionados: ['PED-2026-004810'],
  },
  // 12 additional representative properties summing 20 displayed of 412
  {
    id: 'imv-9',
    codigo: 'IMV-112',
    endereco: 'Apto 112 · Residencial Parque Sul',
    regiao: 'Zona Sul',
    tipo: 'Apartamento',
    metragemM2: 92,
    quartos: 3,
    vagas: 2,
    situacao: 'Alugado',
    inquilino: 'Renato Queiroz',
    proprietario: 'Fundo Aurora (9 imóveis)',
    proprietarioCpfMascarado: '**.482.100/0001-**',
    proprietarioCpfReal: '14.482.100/0001-76',
    proprietarioBancoMascarado: 'BTG Ag **** · CC *****-9',
    proprietarioBancoReal: 'BTG (208) Ag 0001 · CC 90124-9',
    aluguelValor: 4200,
    condominioIptu: 980,
    taxaAdmPct: 8,
    contratoNum: 'CT-2025-0211',
    vencimentoContrato: '14/04/2027',
    corretor: 'Rafael Costa',
    anunciadoEm: [],
    diasVago: 0,
    ultimaLocacaoEm: '14/04/2025',
    extracaoFonte: 'CT-2025-0211.pdf, pág. 1',
    extracaoConfianca: 98,
    registeredBy: 'Registrado pelo agente, fonte: CT-2025-0211.pdf, pág. 1',
    fotosCount: 12,
    autorizacaoDivulgacao: true,
    tituloAnuncio: 'Apto 3 dorms Parque Sul 92 m²',
    descricaoAnuncio: 'Apartamento de 3 dormitórios com suíte e vista para o parque.',
    historicoLocacoes: [{ periodo: '04/2025 – atual', inquilino: 'Renato Queiroz', valor: 4200 }],
    manutencoesHistorico: [],
    pedidosRelacionados: [],
  },
  {
    id: 'imv-10',
    codigo: 'IMV-510',
    endereco: 'Apto 12 · Ed. Primavera',
    regiao: 'Zona Leste',
    tipo: 'Apartamento',
    metragemM2: 54,
    quartos: 2,
    vagas: 1,
    situacao: 'Em vistoria/reparo',
    inquilino: null,
    proprietario: 'Marta Siqueira',
    proprietarioCpfMascarado: '***.119.305-**',
    proprietarioCpfReal: '215.119.305-44',
    proprietarioBancoMascarado: 'Itaú Ag **** · CC *****-7',
    proprietarioBancoReal: 'Itaú (341) Ag 0910 · CC 33091-7',
    aluguelValor: 1850,
    condominioIptu: 430,
    taxaAdmPct: 9,
    contratoNum: null,
    vencimentoContrato: null,
    corretor: 'Mariana Salles',
    anunciadoEm: [],
    diasVago: 49,
    ultimaLocacaoEm: '04/10/2026',
    extracaoFonte: 'Ficha_IMV510.pdf, pág. 1',
    extracaoConfianca: 91,
    registeredBy: 'Registrado pelo agente, fonte: Ficha_IMV510.pdf, pág. 1',
    fotosCount: 10,
    autorizacaoDivulgacao: true,
    tituloAnuncio: 'Apto 2 dorms Ed. Primavera · Zona Leste',
    descricaoAnuncio: 'Apartamento prático com 2 dormitórios e 1 vaga.',
    historicoLocacoes: [],
    manutencoesHistorico: [],
    pedidosRelacionados: [],
  },
  {
    id: 'imv-11',
    codigo: 'IMV-120',
    endereco: 'Casa Rua das Acácias 120',
    regiao: 'Zona Sul',
    tipo: 'Casa',
    metragemM2: 128,
    quartos: 3,
    vagas: 2,
    situacao: 'Alugado',
    inquilino: 'Maria Souza',
    proprietario: 'João Batista',
    proprietarioCpfMascarado: '***.412.889-**',
    proprietarioCpfReal: '318.412.889-04',
    proprietarioBancoMascarado: 'Itaú Ag **** · CC *****-2',
    proprietarioBancoReal: 'Itaú (341) Ag 0412 · CC 44810-2',
    aluguelValor: 3400,
    condominioIptu: 290,
    taxaAdmPct: 9,
    contratoNum: 'CT-2024-0619',
    vencimentoContrato: '20/08/2027',
    corretor: 'Rafael Costa',
    anunciadoEm: [],
    diasVago: 0,
    ultimaLocacaoEm: '20/08/2024',
    extracaoFonte: 'CT-2024-0619.pdf, pág. 1',
    extracaoConfianca: 96,
    registeredBy: 'Registrado pelo agente, fonte: CT-2024-0619.pdf, pág. 1',
    fotosCount: 12,
    autorizacaoDivulgacao: false,
    tituloAnuncio: 'Casa 3 dorms Rua das Acácias 120',
    descricaoAnuncio: 'Casa residencial ampla com jardim e 2 vagas.',
    historicoLocacoes: [{ periodo: '08/2024 – atual', inquilino: 'Maria Souza', valor: 3400 }],
    manutencoesHistorico: [
      { data: '22/11/2026', descricao: 'Reparo hidráulico pia cozinha (OS-914)', valor: 2350, status: 'Aguardando aprovação FIN-011' },
    ],
    pedidosRelacionados: ['PED-2026-004809'],
  },
  {
    id: 'imv-12',
    codigo: 'IMV-712',
    endereco: 'Casa 12 · Vila Mariana',
    regiao: 'Zona Sul',
    tipo: 'Casa',
    metragemM2: 110,
    quartos: 2,
    vagas: 2,
    situacao: 'Alugado',
    inquilino: 'Fernanda Lima',
    proprietario: 'Otávio Ramos',
    proprietarioCpfMascarado: '***.701.224-**',
    proprietarioCpfReal: '294.701.224-11',
    proprietarioBancoMascarado: 'Bradesco Ag **** · CC *****-8',
    proprietarioBancoReal: 'Bradesco (237) Ag 2219 · CC 19832-8',
    aluguelValor: 2950,
    condominioIptu: 260,
    taxaAdmPct: 9,
    contratoNum: 'CT-2024-0712',
    vencimentoContrato: '05/03/2027',
    corretor: 'Rafael Costa',
    anunciadoEm: [],
    diasVago: 0,
    ultimaLocacaoEm: '05/03/2024',
    extracaoFonte: 'CT-2024-0712.pdf, pág. 1',
    extracaoConfianca: 95,
    registeredBy: 'Registrado pelo agente, fonte: CT-2024-0712.pdf, pág. 1',
    fotosCount: 10,
    autorizacaoDivulgacao: false,
    tituloAnuncio: 'Casa Vila Mariana 2 dorms',
    descricaoAnuncio: 'Casa reformada em vila fechada na Vila Mariana.',
    historicoLocacoes: [{ periodo: '03/2024 – atual', inquilino: 'Fernanda Lima', valor: 2950 }],
    manutencoesHistorico: [],
    pedidosRelacionados: ['PED-2026-004806'],
  },
  {
    id: 'imv-13',
    codigo: 'IMV-504',
    endereco: 'Apto 504 · Ed. Bela Vista',
    regiao: 'Centro',
    tipo: 'Apartamento',
    metragemM2: 72,
    quartos: 2,
    vagas: 1,
    situacao: 'Alugado',
    inquilino: 'Eduardo Pinheiro',
    proprietario: 'Marina Duarte',
    proprietarioCpfMascarado: '***.340.192-**',
    proprietarioCpfReal: '332.340.192-51',
    proprietarioBancoMascarado: 'Itaú Ag **** · CC *****-0',
    proprietarioBancoReal: 'Itaú (341) Ag 0190 · CC 77420-0',
    aluguelValor: 3100,
    condominioIptu: 690,
    taxaAdmPct: 9,
    contratoNum: 'CT-2024-0504',
    vencimentoContrato: '18/06/2027',
    corretor: 'Carlos Eduardo',
    anunciadoEm: [],
    diasVago: 0,
    ultimaLocacaoEm: '18/06/2024',
    extracaoFonte: 'CT-2024-0504.pdf, pág. 1',
    extracaoConfianca: 97,
    registeredBy: 'Registrado pelo agente, fonte: CT-2024-0504.pdf, pág. 1',
    fotosCount: 9,
    autorizacaoDivulgacao: false,
    tituloAnuncio: 'Apto 504 Ed. Bela Vista · aceita pet',
    descricaoAnuncio: 'Apartamento 2 quartos com aditivo pet aprovado.',
    historicoLocacoes: [{ periodo: '06/2024 – atual', inquilino: 'Eduardo Pinheiro', valor: 3100 }],
    manutencoesHistorico: [],
    pedidosRelacionados: ['PED-2026-004805'],
  },
  {
    id: 'imv-14',
    codigo: 'IMV-305',
    endereco: 'Apto 305 · Ed. Vila Nova',
    regiao: 'Zona Norte',
    tipo: 'Apartamento',
    metragemM2: 60,
    quartos: 2,
    vagas: 1,
    situacao: 'Vago',
    inquilino: null,
    proprietario: 'Helena Prado',
    proprietarioCpfMascarado: '***.640.772-**',
    proprietarioCpfReal: '176.640.772-09',
    proprietarioBancoMascarado: 'Sicredi Ag **** · CC *****-5',
    proprietarioBancoReal: 'Sicredi (748) Ag 0718 · CC 51209-5',
    aluguelValor: 2200,
    condominioIptu: 480,
    taxaAdmPct: 9,
    contratoNum: null,
    vencimentoContrato: null,
    corretor: 'Rafael Costa',
    anunciadoEm: [],
    diasVago: 42,
    ultimaLocacaoEm: '11/10/2026',
    extracaoFonte: 'Ficha_IMV305.pdf, pág. 1',
    extracaoConfianca: 90,
    registeredBy: 'Registrado pelo agente, fonte: Ficha_IMV305.pdf, pág. 1',
    fotosCount: 10,
    autorizacaoDivulgacao: false,
    tituloAnuncio: 'Apto 2 dorms Ed. Vila Nova c/ sacada',
    descricaoAnuncio: 'Apartamento arejado próximo à estação Santana.',
    historicoLocacoes: [],
    manutencoesHistorico: [],
    pedidosRelacionados: [],
  },
  {
    id: 'imv-15',
    codigo: 'IMV-884',
    endereco: 'Sala 12 · Ed. Central',
    regiao: 'Centro',
    tipo: 'Sala/Loja',
    metragemM2: 58,
    quartos: 0,
    vagas: 1,
    situacao: 'Vago',
    inquilino: null,
    proprietario: 'João Batista',
    proprietarioCpfMascarado: '***.412.889-**',
    proprietarioCpfReal: '318.412.889-04',
    proprietarioBancoMascarado: 'Itaú Ag **** · CC *****-2',
    proprietarioBancoReal: 'Itaú (341) Ag 0412 · CC 44810-2',
    aluguelValor: 3200,
    condominioIptu: 720,
    taxaAdmPct: 9,
    contratoNum: null,
    vencimentoContrato: null,
    corretor: 'Mariana Salles',
    anunciadoEm: ['ZAP', 'VivaReal'],
    diasVago: 52,
    ultimaLocacaoEm: '01/10/2026',
    extracaoFonte: 'Matricula_Sala12_Central.pdf, pág. 1',
    extracaoConfianca: 93,
    registeredBy: 'Registrado pelo agente, fonte: Matricula_Sala12_Central.pdf, pág. 1',
    fotosCount: 9,
    autorizacaoDivulgacao: true,
    tituloAnuncio: 'Sala 58 m² Ed. Central com divisórias',
    descricaoAnuncio: 'Conjunto comercial no centro financeiro com portaria 24h.',
    historicoLocacoes: [],
    manutencoesHistorico: [],
    pedidosRelacionados: [],
  },
  {
    id: 'imv-16',
    codigo: 'IMV-910',
    endereco: 'Apto 910 · Torre Leste',
    regiao: 'Zona Leste',
    tipo: 'Apartamento',
    metragemM2: 66,
    quartos: 2,
    vagas: 1,
    situacao: 'Alugado',
    inquilino: 'Tatiana Gomes',
    proprietario: 'Marta Siqueira',
    proprietarioCpfMascarado: '***.119.305-**',
    proprietarioCpfReal: '215.119.305-44',
    proprietarioBancoMascarado: 'Itaú Ag **** · CC *****-7',
    proprietarioBancoReal: 'Itaú (341) Ag 0910 · CC 33091-7',
    aluguelValor: 2350,
    condominioIptu: 510,
    taxaAdmPct: 9,
    contratoNum: 'CT-2025-0910',
    vencimentoContrato: '22/02/2027',
    corretor: 'Carlos Eduardo',
    anunciadoEm: [],
    diasVago: 0,
    ultimaLocacaoEm: '22/02/2025',
    extracaoFonte: 'CT-2025-0910.pdf, pág. 1',
    extracaoConfianca: 98,
    registeredBy: 'Registrado pelo agente, fonte: CT-2025-0910.pdf, pág. 1',
    fotosCount: 11,
    autorizacaoDivulgacao: false,
    tituloAnuncio: 'Apto 2 dorms Torre Leste',
    descricaoAnuncio: 'Apartamento em andar alto na Zona Leste.',
    historicoLocacoes: [{ periodo: '02/2025 – atual', inquilino: 'Tatiana Gomes', valor: 2350 }],
    manutencoesHistorico: [],
    pedidosRelacionados: [],
  },
  {
    id: 'imv-17',
    codigo: 'IMV-205',
    endereco: 'Apto 205 · Ed. República',
    regiao: 'Centro',
    tipo: 'Apartamento',
    metragemM2: 50,
    quartos: 1,
    vagas: 1,
    situacao: 'Vago',
    inquilino: null,
    proprietario: 'Fundo Aurora (9 imóveis)',
    proprietarioCpfMascarado: '**.482.100/0001-**',
    proprietarioCpfReal: '14.482.100/0001-76',
    proprietarioBancoMascarado: 'BTG Ag **** · CC *****-9',
    proprietarioBancoReal: 'BTG (208) Ag 0001 · CC 90124-9',
    aluguelValor: 2400,
    condominioIptu: 520,
    taxaAdmPct: 8,
    contratoNum: null,
    vencimentoContrato: null,
    corretor: 'Rafael Costa',
    anunciadoEm: [],
    diasVago: 74,
    ultimaLocacaoEm: '09/09/2026',
    extracaoFonte: 'Portfolio_Aurora_Nov26.pdf, pág. 7',
    extracaoConfianca: 87,
    registeredBy: 'Registrado pelo agente, fonte: Portfolio_Aurora_Nov26.pdf, pág. 7',
    fotosCount: 4,
    autorizacaoDivulgacao: true,
    tituloAnuncio: 'Studio/1 dorm Ed. República · 50 m²',
    descricaoAnuncio: 'Unidade compacta no Centro aguardando complemento de fotos.',
    historicoLocacoes: [],
    manutencoesHistorico: [],
    pedidosRelacionados: [],
  },
  {
    id: 'imv-18',
    codigo: 'IMV-704',
    endereco: 'Apto 704 · Ed. Moema Park',
    regiao: 'Zona Sul',
    tipo: 'Apartamento',
    metragemM2: 86,
    quartos: 3,
    vagas: 2,
    situacao: 'Alugado',
    inquilino: 'Camila Siqueira',
    proprietario: 'Helena Prado',
    proprietarioCpfMascarado: '***.640.772-**',
    proprietarioCpfReal: '176.640.772-09',
    proprietarioBancoMascarado: 'Sicredi Ag **** · CC *****-5',
    proprietarioBancoReal: 'Sicredi (748) Ag 0718 · CC 51209-5',
    aluguelValor: 4500,
    condominioIptu: 1050,
    taxaAdmPct: 9,
    contratoNum: 'CT-2024-0704',
    vencimentoContrato: '10/11/2027',
    corretor: 'Mariana Salles',
    anunciadoEm: [],
    diasVago: 0,
    ultimaLocacaoEm: '10/11/2024',
    extracaoFonte: 'CT-2024-0704.pdf, pág. 1',
    extracaoConfianca: 97,
    registeredBy: 'Registrado pelo agente, fonte: CT-2024-0704.pdf, pág. 1',
    fotosCount: 14,
    autorizacaoDivulgacao: false,
    tituloAnuncio: 'Apto 3 dorms Moema Park',
    descricaoAnuncio: 'Apartamento de 86 m² próximo ao metrô Moema.',
    historicoLocacoes: [{ periodo: '11/2024 – atual', inquilino: 'Camila Siqueira', valor: 4500 }],
    manutencoesHistorico: [],
    pedidosRelacionados: [],
  },
  {
    id: 'imv-19',
    codigo: 'IMV-109',
    endereco: 'Casa 09 · Jardim Paulista',
    regiao: 'Zona Sul',
    tipo: 'Casa',
    metragemM2: 118,
    quartos: 3,
    vagas: 2,
    situacao: 'Vago',
    inquilino: null,
    proprietario: 'Otávio Ramos',
    proprietarioCpfMascarado: '***.701.224-**',
    proprietarioCpfReal: '294.701.224-11',
    proprietarioBancoMascarado: 'Bradesco Ag **** · CC *****-8',
    proprietarioBancoReal: 'Bradesco (237) Ag 2219 · CC 19832-8',
    aluguelValor: 3500,
    condominioIptu: 320,
    taxaAdmPct: 9,
    contratoNum: null,
    vencimentoContrato: null,
    corretor: 'Rafael Costa',
    anunciadoEm: ['ZAP', 'VivaReal'],
    diasVago: 47,
    ultimaLocacaoEm: '06/10/2026',
    extracaoFonte: 'Ficha_IMV109.pdf, pág. 1',
    extracaoConfianca: 94,
    registeredBy: 'Registrado pelo agente, fonte: Ficha_IMV109.pdf, pág. 1',
    fotosCount: 13,
    autorizacaoDivulgacao: true,
    tituloAnuncio: 'Casa 3 dorms Jardim Paulista com jardim',
    descricaoAnuncio: 'Casa térrea bem localizada com 3 dormitórios e 2 vagas.',
    historicoLocacoes: [],
    manutencoesHistorico: [],
    pedidosRelacionados: [],
  },
  {
    id: 'imv-20',
    codigo: 'IMV-1405',
    endereco: 'Apto 1405 · Ed. Horizonte',
    regiao: 'Zona Norte',
    tipo: 'Apartamento',
    metragemM2: 96,
    quartos: 3,
    vagas: 2,
    situacao: 'Captação em andamento',
    inquilino: null,
    proprietario: 'Lúcia Menezes',
    proprietarioCpfMascarado: '***.904.115-**',
    proprietarioCpfReal: '268.904.115-30',
    proprietarioBancoMascarado: 'Itaú Ag **** · CC *****-6',
    proprietarioBancoReal: 'Itaú (341) Ag 0288 · CC 65102-6',
    aluguelValor: 4600,
    condominioIptu: 940,
    taxaAdmPct: 8,
    contratoNum: null,
    vencimentoContrato: null,
    corretor: 'Rafael Costa',
    anunciadoEm: [],
    diasVago: 0,
    ultimaLocacaoEm: 'Captação nova',
    extracaoFonte: 'Matricula_Apto1405_Horizonte.pdf, pág. 1',
    extracaoConfianca: 92,
    registeredBy: 'Registrado pelo agente, fonte: Matricula_Apto1405_Horizonte.pdf, pág. 1',
    fotosCount: 10,
    autorizacaoDivulgacao: true,
    tituloAnuncio: 'Apto 3 dorms alto padrão Ed. Horizonte 96 m²',
    descricaoAnuncio: 'Unidade nova em captação aguardando aprovação de taxa de 8% (LOC-005).',
    historicoLocacoes: [],
    manutencoesHistorico: [],
    pedidosRelacionados: ['PED-2026-004831'],
  },
];

export const OWNER_CONCENTRATION: {
  proprietario: string;
  imoveis: number;
  participacaoPct: number;
  risco: string;
}[] = [
  { proprietario: 'Fundo Aurora', imoveis: 9, participacaoPct: 2.2, risco: 'Baixo' },
  { proprietario: 'Marta Siqueira', imoveis: 6, participacaoPct: 1.5, risco: 'Baixo' },
  { proprietario: 'João Batista', imoveis: 5, participacaoPct: 1.2, risco: 'Baixo' },
  { proprietario: 'Helena Prado', imoveis: 4, participacaoPct: 1.0, risco: 'Baixo' },
  { proprietario: 'Otávio Ramos', imoveis: 4, participacaoPct: 1.0, risco: 'Baixo' },
];

// ---------------------------------------------------------------------------
// 28 IMÓVEIS VAGOS (SUM = R$ 66.400,00 | AVG = 34 dias | 9 / 7 / 7 / 5 | 8/9/6/5 | 14/5/9 | 9 > 5% | 6 com 0 visitas)
// ---------------------------------------------------------------------------

export interface VacantPropertyItem {
  id: string;
  codigo: string;
  imovel: string;
  regiao: LocacaoRegion;
  tipo: LocacaoPropertyType;
  metragemM2: number;
  diasVago: number;
  faixaDias: '0-15d' | '16-30d' | '31-60d' | '>60d';
  valorPedido: number;
  estimativaMercado: number;
  diferencaPct: number;
  confiancaMercadoPct: number;
  comparaveisQtd: number;
  visitas30d: number;
  propostas: number;
  situacaoAnuncio: VacantStage;
  prontoParaAnunciar: boolean;
  autorizacaoProprietario: boolean;
  autorizacaoAtePct?: number;
  proprietario: string;
  corretor: string;
  fotosCount: number;
  reparoValorEstimado?: number;
  sugestaoAgente: string;
  variacaoSugeridaPct: number;
  valorSugerido: number;
  linkedPortfolioId?: string;
}

function mkVacant(
  id: string,
  codigo: string,
  imovel: string,
  regiao: LocacaoRegion,
  tipo: LocacaoPropertyType,
  metragemM2: number,
  diasVago: number,
  valorPedido: number,
  estimativaMercado: number,
  confiancaMercadoPct: number,
  visitas30d: number,
  propostas: number,
  situacaoAnuncio: VacantStage,
  proprietario: string,
  corretor: string,
  fotosCount: number,
  autorizacaoProprietario: boolean,
  sugestaoAgente: string,
  valorSugerido: number,
  reparoValorEstimado?: number,
  autorizacaoAtePct?: number,
  linkedPortfolioId?: string
): VacantPropertyItem {
  const diferencaPct = Number(
    (((valorPedido - estimativaMercado) / estimativaMercado) * 100).toFixed(1)
  );
  const variacaoSugeridaPct = Number(
    (((valorSugerido - valorPedido) / valorPedido) * 100).toFixed(1)
  );
  const faixaDias: VacantPropertyItem['faixaDias'] =
    diasVago > 60 ? '>60d' : diasVago > 30 ? '31-60d' : diasVago > 15 ? '16-30d' : '0-15d';

  return {
    id,
    codigo,
    imovel,
    regiao,
    tipo,
    metragemM2,
    diasVago,
    faixaDias,
    valorPedido,
    estimativaMercado,
    diferencaPct,
    confiancaMercadoPct,
    comparaveisQtd: 6,
    visitas30d,
    propostas,
    situacaoAnuncio,
    prontoParaAnunciar: situacaoAnuncio === 'Anunciado e pronto',
    autorizacaoProprietario,
    autorizacaoAtePct,
    proprietario,
    corretor,
    fotosCount,
    reparoValorEstimado,
    sugestaoAgente,
    variacaoSugeridaPct,
    valorSugerido,
    linkedPortfolioId,
  };
}

export const INITIAL_VACANT_28: VacantPropertyItem[] = [
  mkVacant(
    'vag-1',
    'IMV-104',
    'Casa Rua das Figueiras 210',
    'Zona Sul',
    'Casa',
    142,
    68,
    3800,
    3390,
    91,
    0,
    0,
    'Anunciado e pronto',
    'Otávio Ramos',
    'Rafael Costa',
    16,
    true,
    'Reduzir para R$ 3.490 (-8,2%) · autorização até -10%',
    3490,
    undefined,
    10,
    'imv-2'
  ),
  mkVacant(
    'vag-2',
    'IMV-405',
    'Loja 5 Galeria Norte',
    'Zona Norte',
    'Sala/Loja',
    64,
    58,
    4600,
    4160,
    89,
    2,
    0,
    'Anunciado e pronto',
    'Sérgio Valadares',
    'Rafael Costa',
    11,
    true,
    'Ajustar para R$ 4.250 (-7,6%) com 12m fixos',
    4250,
    undefined,
    8,
    'imv-3'
  ),
  mkVacant(
    'vag-3',
    'IMV-884',
    'Sala 12 Ed. Central',
    'Centro',
    'Sala/Loja',
    58,
    52,
    3200,
    2945,
    88,
    1,
    0,
    'Anunciado e pronto',
    'João Batista',
    'Mariana Salles',
    9,
    false,
    'Solicitar autorização ao proprietário para R$ 2.980 (-6,9%)',
    2980,
    undefined,
    undefined,
    'imv-15'
  ),
  mkVacant(
    'vag-4',
    'IMV-301',
    'Sala 301 Ed. Comercial Paulista',
    'Centro',
    'Sala/Loja',
    52,
    54,
    4100,
    4000,
    94,
    4,
    1,
    'Anunciado e pronto',
    'Eliane Cardoso',
    'Rafael Costa',
    12,
    true,
    'Proposta ativa com 1 mês carência (Bruno Vasconcelos)',
    4100,
    undefined,
    5,
    'imv-4'
  ),
  mkVacant(
    'vag-5',
    'IMV-902',
    'Apto 401 Ed. Aurora',
    'Zona Norte',
    'Apartamento',
    62,
    64,
    2450,
    2250,
    90,
    0,
    0,
    'Em reparo',
    'Fundo Aurora',
    'Rafael Costa',
    9,
    true,
    'Aprovar reparo piso R$ 1.980 (FIN-011) e ajustar para R$ 2.290 (-6,5%)',
    2290,
    1980,
    10,
    'imv-6'
  ),
  mkVacant(
    'vag-6',
    'IMV-510',
    'Apto 12 Ed. Primavera',
    'Zona Leste',
    'Apartamento',
    54,
    49,
    1850,
    1710,
    87,
    0,
    0,
    'Aguardando vistoria de saída',
    'Marta Siqueira',
    'Mariana Salles',
    10,
    true,
    'Concluir vistoria de saída e baixar pedido para R$ 1.750 (-5,4%)',
    1750,
    undefined,
    6,
    'imv-10'
  ),
  mkVacant(
    'vag-7',
    'IMV-305',
    'Apto 305 Ed. Vila Nova',
    'Zona Norte',
    'Apartamento',
    60,
    42,
    2200,
    2020,
    89,
    0,
    0,
    'Aguardando autorização do proprietário',
    'Helena Prado',
    'Rafael Costa',
    10,
    false,
    'Cobrar assinatura de divulgação e sugerir R$ 2.050 (-6,8%)',
    2050,
    undefined,
    undefined,
    'imv-14'
  ),
  mkVacant(
    'vag-8',
    'IMV-109',
    'Casa 09 Jardim Paulista',
    'Zona Sul',
    'Casa',
    118,
    47,
    3500,
    3280,
    92,
    3,
    0,
    'Anunciado e pronto',
    'Otávio Ramos',
    'Rafael Costa',
    13,
    true,
    'Ajuste leve para R$ 3.350 (-4,3%) · autônomo LOC-001',
    3350,
    undefined,
    5,
    'imv-19'
  ),
  mkVacant(
    'vag-9',
    'IMV-808',
    'Sala 808 Ed. Faria Lima',
    'Zona Sul',
    'Sala/Loja',
    48,
    28,
    2800,
    2610,
    90,
    2,
    0,
    'Anunciado e pronto',
    'Carlos Eduardo',
    'Carlos Eduardo',
    10,
    true,
    'Reduzir R$ 150 (-5,4%) para acelerar fechamento',
    2650,
    undefined,
    8
  ),
  mkVacant(
    'vag-10',
    'IMV-201',
    'Apto 201 Ed. Santana Prime',
    'Zona Norte',
    'Apartamento',
    52,
    26,
    1900,
    1775,
    88,
    1,
    0,
    'Anunciado e pronto',
    'Paulo Moraes',
    'Rafael Costa',
    9,
    false,
    'Propor redução para R$ 1.800 (-5,3%) ao proprietário',
    1800
  ),
  mkVacant(
    'vag-11',
    'IMV-205',
    'Apto 205 Ed. República',
    'Centro',
    'Apartamento',
    50,
    74,
    2400,
    2350,
    91,
    2,
    0,
    'Sem fotos ou dados para anunciar',
    'Fundo Aurora',
    'Rafael Costa',
    4,
    true,
    'Agendar 6 novas fotos para cumprir LOC-002 (mín. 8 fotos)',
    2350,
    undefined,
    5,
    'imv-17'
  ),
  mkVacant(
    'vag-12',
    'IMV-114',
    'Apto 114 Ed. Anhangabaú',
    'Centro',
    'Apartamento',
    46,
    66,
    2100,
    2050,
    86,
    0,
    0,
    'Em reparo',
    'Marta Siqueira',
    'Carlos Eduardo',
    10,
    true,
    'Finalizar pintura elétrica (R$ 1.720 · FIN-011) antes de reanunciar',
    2050,
    1720,
    5
  ),
  mkVacant(
    'vag-13',
    'IMV-318',
    'Casa 318 Tucuruvi',
    'Zona Norte',
    'Casa',
    88,
    62,
    1950,
    1900,
    88,
    0,
    0,
    'Em reparo',
    'Antonio Nogueira',
    'Mariana Salles',
    9,
    true,
    'Concluir troca de torneiras e telha (R$ 890 · autônomo)',
    1900,
    890,
    5
  ),
  mkVacant(
    'vag-14',
    'IMV-604B',
    'Apto 502 Ed. Brooklin Sul',
    'Zona Sul',
    'Apartamento',
    65,
    25,
    2250,
    2200,
    93,
    4,
    1,
    'Anunciado e pronto',
    'João Batista',
    'Rafael Costa',
    12,
    true,
    'Preço aderente (+2,3%) · 1 proposta em negociação',
    2250,
    undefined,
    5
  ),
  mkVacant(
    'vag-15',
    'IMV-412',
    'Casa 18 Tatuapé Sul',
    'Zona Leste',
    'Casa',
    82,
    24,
    1800,
    1750,
    91,
    3,
    0,
    'Anunciado e pronto',
    'Beatriz Azevedo',
    'Carlos Eduardo',
    11,
    true,
    'Manter valor e destacar quintal nos portais',
    1800,
    undefined,
    5
  ),
  mkVacant(
    'vag-16',
    'IMV-419',
    'Apto 19 Ed. Anália Franco',
    'Zona Leste',
    'Apartamento',
    49,
    22,
    1650,
    1620,
    89,
    1,
    0,
    'Aguardando vistoria de saída',
    'Marta Siqueira',
    'Rafael Costa',
    9,
    true,
    'Cobrar retorno do vistoriador para liberar anúncio hoje',
    1650,
    undefined,
    5
  ),
  mkVacant(
    'vag-17',
    'IMV-522',
    'Sala 22 Ed. Consolação',
    'Centro',
    'Sala/Loja',
    44,
    20,
    2300,
    2250,
    92,
    3,
    0,
    'Anunciado e pronto',
    'Fundo Aurora',
    'Mariana Salles',
    10,
    true,
    'Manter valor · bom fluxo de visitas semanais',
    2300,
    undefined,
    5
  ),
  mkVacant(
    'vag-18',
    'IMV-531',
    'Apto 31 Ed. Mandaqui',
    'Zona Norte',
    'Apartamento',
    56,
    19,
    2000,
    1960,
    90,
    2,
    0,
    'Em reparo',
    'Helena Prado',
    'Rafael Costa',
    10,
    true,
    'Concluir vedação de box (R$ 540 · autônomo FIN-011)',
    2000,
    540,
    5
  ),
  mkVacant(
    'vag-19',
    'IMV-601',
    'Apto 61 Ed. Tremembé',
    'Zona Norte',
    'Apartamento',
    51,
    15,
    1750,
    1720,
    91,
    3,
    0,
    'Anunciado e pronto',
    'Paulo Moraes',
    'Carlos Eduardo',
    11,
    true,
    'Preço competitivo (+1,7%) · acompanhar leads',
    1750,
    undefined,
    5
  ),
  mkVacant(
    'vag-20',
    'IMV-608',
    'Loja 08 Galeria Santana',
    'Zona Norte',
    'Sala/Loja',
    36,
    14,
    1900,
    1880,
    88,
    2,
    0,
    'Aguardando vistoria de saída',
    'Sérgio Valadares',
    'Rafael Costa',
    8,
    true,
    'Agendar conferência de chaves com ex-locatário',
    1900,
    undefined,
    5
  ),
  mkVacant(
    'vag-21',
    'IMV-615',
    'Apto 72 Ed. Campo Belo',
    'Zona Sul',
    'Apartamento',
    63,
    14,
    2200,
    2150,
    94,
    4,
    1,
    'Anunciado e pronto',
    'Fundo Aurora',
    'Rafael Costa',
    14,
    true,
    'Anúncio ativo com alta procura (4 visitas em 14d)',
    2200,
    undefined,
    5
  ),
  mkVacant(
    'vag-22',
    'IMV-620',
    'Sala 14 Ed. República Plaza',
    'Centro',
    'Sala/Loja',
    41,
    13,
    2150,
    2100,
    91,
    3,
    0,
    'Anunciado e pronto',
    'Eliane Cardoso',
    'Mariana Salles',
    10,
    true,
    'Manter valor pedido (+2,4%)',
    2150,
    undefined,
    5
  ),
  mkVacant(
    'vag-23',
    'IMV-624',
    'Apto 44 Ed. Penha',
    'Zona Leste',
    'Apartamento',
    48,
    13,
    1600,
    1580,
    89,
    2,
    0,
    'Aguardando autorização do proprietário',
    'Antonio Nogueira',
    'Carlos Eduardo',
    10,
    false,
    'Solicitar autorização de divulgação assinada via WhatsApp',
    1600
  ),
  mkVacant(
    'vag-24',
    'IMV-633',
    'Casa 44 Parada Inglesa',
    'Zona Norte',
    'Casa',
    96,
    12,
    2400,
    2360,
    92,
    5,
    1,
    'Anunciado e pronto',
    'João Batista',
    'Rafael Costa',
    13,
    true,
    '5 visitas em 12d · alta aderência ao mercado',
    2400,
    undefined,
    5
  ),
  mkVacant(
    'vag-25',
    'IMV-640',
    'Apto 82 Ed. Liberdade',
    'Centro',
    'Apartamento',
    52,
    11,
    1950,
    1920,
    93,
    3,
    0,
    'Anunciado e pronto',
    'Marta Siqueira',
    'Rafael Costa',
    11,
    true,
    'Manter preço · 3 visitas agendadas na semana',
    1950,
    undefined,
    5
  ),
  mkVacant(
    'vag-26',
    'IMV-647',
    'Loja 02 Boulevard Sul',
    'Zona Sul',
    'Sala/Loja',
    35,
    11,
    1850,
    1820,
    87,
    2,
    0,
    'Sem fotos ou dados para anunciar',
    'Beatriz Azevedo',
    'Mariana Salles',
    5,
    true,
    'Faltam 3 fotos internas e metragem confirmada (LOC-002)',
    1850,
    undefined,
    5
  ),
  mkVacant(
    'vag-27',
    'IMV-655',
    'Apto 15 Ed. Mooca Alta',
    'Zona Leste',
    'Apartamento',
    57,
    11,
    1900,
    1880,
    92,
    4,
    0,
    'Anunciado e pronto',
    'Fundo Aurora',
    'Rafael Costa',
    12,
    true,
    'Preço excelente (+1,1%) · 4 visitas em 11 dias',
    1900,
    undefined,
    5
  ),
  mkVacant(
    'vag-28',
    'IMV-662',
    'Sala 09 Ed. São Bento',
    'Centro',
    'Sala/Loja',
    38,
    38,
    1850,
    1800,
    90,
    2,
    0,
    'Anunciado e pronto',
    'Helena Prado',
    'Rafael Costa',
    9,
    true,
    'Alerta D-30 ativo · avaliar pequena redução de 2,7%',
    1800,
    undefined,
    5
  ),
];

// ---------------------------------------------------------------------------
// VISITAS, PROPOSTAS & ANÁLISE CADASTRAL (ABA LOCAÇÃO)
// ---------------------------------------------------------------------------

export interface VisitItem {
  id: string;
  dataHora: string;
  imovel: string;
  codigoImovel: string;
  interessado: string;
  corretor: string;
  imovelOcupado: boolean;
  aviso24hRegistrado: boolean;
  consentimentoInquilino: boolean;
  status: 'Confirmada pelo agente' | 'Pendente aviso 24h' | 'Realizada (aguarda retorno)';
  foraJanelaNota?: string;
}

export const INITIAL_VISITS_6: VisitItem[] = [
  {
    id: 'vis-1',
    dataHora: 'Hoje, 15:30',
    imovel: 'Sala 301 Ed. Comercial Paulista',
    codigoImovel: 'IMV-301',
    interessado: 'Camila Freitas',
    corretor: 'Rafael Costa',
    imovelOcupado: false,
    aviso24hRegistrado: true,
    consentimentoInquilino: true,
    status: 'Confirmada pelo agente',
  },
  {
    id: 'vis-2',
    dataHora: 'Hoje, 16:45',
    imovel: 'Apto 72 Ed. Campo Belo',
    codigoImovel: 'IMV-615',
    interessado: 'Gustavo Neres',
    corretor: 'Rafael Costa',
    imovelOcupado: false,
    aviso24hRegistrado: true,
    consentimentoInquilino: true,
    status: 'Confirmada pelo agente',
  },
  {
    id: 'vis-3',
    dataHora: 'Hoje, 18:00',
    imovel: 'Apto 204 Ed. Bela Vista (Ocupado)',
    codigoImovel: 'IMV-204',
    interessado: 'Andréa Soares',
    corretor: 'Rafael Costa',
    imovelOcupado: true,
    aviso24hRegistrado: false,
    consentimentoInquilino: false,
    status: 'Pendente aviso 24h',
  },
  {
    id: 'vis-4',
    dataHora: 'Amanhã, 09:30',
    imovel: 'Casa 44 Parada Inglesa',
    codigoImovel: 'IMV-633',
    interessado: 'Thiago Ribeiro',
    corretor: 'Rafael Costa',
    imovelOcupado: false,
    aviso24hRegistrado: true,
    consentimentoInquilino: true,
    status: 'Confirmada pelo agente',
    foraJanelaNota: 'Lead entrou às 21:40 · resposta automática às 08:00 (LOC-003)',
  },
  {
    id: 'vis-5',
    dataHora: 'Amanhã, 11:00',
    imovel: 'Loja 5 Galeria Norte',
    codigoImovel: 'IMV-405',
    interessado: 'Bistro Café Ltda',
    corretor: 'Rafael Costa',
    imovelOcupado: false,
    aviso24hRegistrado: true,
    consentimentoInquilino: true,
    status: 'Confirmada pelo agente',
  },
  {
    id: 'vis-6',
    dataHora: 'Amanhã, 14:30',
    imovel: 'Sala 14 Ed. República Plaza',
    codigoImovel: 'IMV-620',
    interessado: 'Dr. Lucas Moura',
    corretor: 'Mariana Salles',
    imovelOcupado: false,
    aviso24hRegistrado: true,
    consentimentoInquilino: true,
    status: 'Confirmada pelo agente',
  },
];

export interface ProposalItem {
  id: string;
  imovel: string;
  codigoImovel: string;
  candidato: string;
  corretor: string;
  valorPedido: number;
  valorOfertado: number;
  carenciaSolicitada: string;
  temConcessao: boolean;
  garantiaProposta: string;
  status: 'Em análise' | 'Aguardando decisão humana' | 'Aguardando cadastro';
  protocoloRelacionado?: string;
  orderId?: string;
}

export const INITIAL_PROPOSALS: ProposalItem[] = [
  {
    id: 'prop-1',
    imovel: 'Sala 301 Ed. Comercial Paulista',
    codigoImovel: 'IMV-301',
    candidato: 'Bruno Vasconcelos',
    corretor: 'Rafael Costa',
    valorPedido: 4100,
    valorOfertado: 4100,
    carenciaSolicitada: '1 mês de carência',
    temConcessao: true,
    garantiaProposta: 'Seguro fiança',
    status: 'Aguardando decisão humana',
    protocoloRelacionado: 'PED-2026-004832',
    orderId: 'ord-4832',
  },
  {
    id: 'prop-2',
    imovel: 'Apto 604 Ed. Jardins Sul',
    codigoImovel: 'IMV-604',
    candidato: 'Renata Duarte',
    corretor: 'Rafael Costa',
    valorPedido: 2950,
    valorOfertado: 2950,
    carenciaSolicitada: 'Sem carência',
    temConcessao: false,
    garantiaProposta: 'Seguro fiança',
    status: 'Em análise',
    protocoloRelacionado: 'PED-2026-004830',
    orderId: 'ord-4830',
  },
  {
    id: 'prop-3',
    imovel: 'Apto 72 Ed. Campo Belo',
    codigoImovel: 'IMV-615',
    candidato: 'Felipe Andrade',
    corretor: 'Rafael Costa',
    valorPedido: 2200,
    valorOfertado: 2150,
    carenciaSolicitada: 'Sem carência',
    temConcessao: false,
    garantiaProposta: 'Caução 3x',
    status: 'Em análise',
  },
  {
    id: 'prop-4',
    imovel: 'Casa 44 Parada Inglesa',
    codigoImovel: 'IMV-633',
    candidato: 'Larissa Campos',
    corretor: 'Rafael Costa',
    valorPedido: 2400,
    valorOfertado: 2400,
    carenciaSolicitada: 'Sem carência',
    temConcessao: false,
    garantiaProposta: 'Fiador / Seguro fiança',
    status: 'Aguardando cadastro',
  },
];

export interface CandidateAnalysisItem {
  id: string;
  nome: string;
  imovel: string;
  codigoImovel: string;
  corretor: string;
  cpfMascarado: string;
  cpfReal: string;
  rendaMascarada: string;
  rendaReal: number;
  aluguelMaisEncargos: number;
  comprometimentoPct: number;
  recomendacaoAgente: 'Recomendar' | 'Recomendar com ressalva' | 'Recomendar garantia reforçada' | 'Docs incompletos';
  consentimentoBureau: boolean;
  bureauResumo: string;
  documentosChecklist: { nome: string; recebido: boolean; fonte?: string }[];
  documentosFaltantes: number;
  confiancaPct: number;
  orderId?: string;
  protocolo?: string;
  statusDecisao: 'Aguardando Gestor' | 'Aprovado pelo Gestor' | 'Recusado pelo Gestor' | 'Aguardando documentos';
  motivoRecusa?: string;
}

export const INITIAL_CANDIDATES_4: CandidateAnalysisItem[] = [
  {
    id: 'cand-1',
    nome: 'Renata Duarte',
    imovel: 'Apto 604 · Ed. Jardins Sul',
    codigoImovel: 'IMV-604',
    corretor: 'Rafael Costa',
    cpfMascarado: '***.391.480-**',
    cpfReal: '341.391.480-12',
    rendaMascarada: 'R$ **.**0,00',
    rendaReal: 11587.3,
    aluguelMaisEncargos: 3650,
    comprometimentoPct: 31.5,
    recomendacaoAgente: 'Recomendar com ressalva',
    consentimentoBureau: true,
    bureauResumo: 'Sem restrições no CPF · Score 742 (consulta LGPD #8821)',
    documentosChecklist: [
      { nome: 'RG e CPF', recebido: true, fonte: 'RG_Renata.pdf, pág. 1' },
      { nome: '3 últimos holerites', recebido: true, fonte: 'Holerite_Renata_Nov26.pdf, pág. 1' },
      { nome: 'Comprovante residência', recebido: true, fonte: 'Conta_Luz_Renata.pdf, pág. 1' },
      { nome: 'Termo de consentimento LGPD', recebido: true, fonte: 'Termo_LGPD_Renata.pdf, pág. 1' },
    ],
    documentosFaltantes: 0,
    confiancaPct: 88,
    orderId: 'ord-4830',
    protocolo: 'PED-2026-004830',
    statusDecisao: 'Aguardando Gestor',
  },
  {
    id: 'cand-2',
    nome: 'Felipe Andrade',
    imovel: 'Apto 72 · Ed. Campo Belo',
    codigoImovel: 'IMV-615',
    corretor: 'Rafael Costa',
    cpfMascarado: '***.804.221-**',
    cpfReal: '419.804.221-05',
    rendaMascarada: 'R$ **.**0,00',
    rendaReal: 9290.5,
    aluguelMaisEncargos: 2750,
    comprometimentoPct: 29.6,
    recomendacaoAgente: 'Recomendar',
    consentimentoBureau: true,
    bureauResumo: 'Sem apontamentos · Score 812 (consulta LGPD #8829)',
    documentosChecklist: [
      { nome: 'CNH digital', recebido: true, fonte: 'CNH_Felipe.pdf, pág. 1' },
      { nome: 'Declaração IR 2026', recebido: true, fonte: 'IRPF_Felipe_2026.pdf, pág. 2' },
      { nome: 'Extrato bancário 90d', recebido: true, fonte: 'Extrato_Felipe.pdf, pág. 1' },
      { nome: 'Termo de consentimento LGPD', recebido: true, fonte: 'Termo_LGPD_Felipe.pdf, pág. 1' },
    ],
    documentosFaltantes: 0,
    confiancaPct: 94,
    statusDecisao: 'Aguardando Gestor',
  },
  {
    id: 'cand-3',
    nome: 'Larissa Campos',
    imovel: 'Casa 44 · Parada Inglesa',
    codigoImovel: 'IMV-633',
    corretor: 'Rafael Costa',
    cpfMascarado: '***.112.905-**',
    cpfReal: '389.112.905-77',
    rendaMascarada: 'R$ *.***,00',
    rendaReal: 6500,
    aluguelMaisEncargos: 2750,
    comprometimentoPct: 42.3,
    recomendacaoAgente: 'Recomendar garantia reforçada',
    consentimentoBureau: true,
    bureauResumo: 'Sem restrições · Score 690 (consulta LGPD #8834)',
    documentosChecklist: [
      { nome: 'RG e CPF', recebido: true, fonte: 'RG_Larissa.pdf, pág. 1' },
      { nome: '3 últimos holerites', recebido: true, fonte: 'Holerite_Larissa.pdf, pág. 1' },
      { nome: 'Comprovante endereço', recebido: true, fonte: 'Fatura_Larissa.pdf, pág. 1' },
      { nome: 'Termo de consentimento LGPD', recebido: true, fonte: 'Termo_LGPD_Larissa.pdf, pág. 1' },
    ],
    documentosFaltantes: 0,
    confiancaPct: 91,
    statusDecisao: 'Aguardando Gestor',
  },
  {
    id: 'cand-4',
    nome: 'Bruno Vasconcelos',
    imovel: 'Sala 301 · Ed. Comercial Paulista',
    codigoImovel: 'IMV-301',
    corretor: 'Rafael Costa',
    cpfMascarado: '***.670.318-**',
    cpfReal: '275.670.318-63',
    rendaMascarada: 'R$ **.**0,00',
    rendaReal: 18500,
    aluguelMaisEncargos: 4940,
    comprometimentoPct: 26.7,
    recomendacaoAgente: 'Docs incompletos',
    consentimentoBureau: false,
    bureauResumo: 'Bloqueado (LOC-004): aguardando termo LGPD assinado',
    documentosChecklist: [
      { nome: 'Contrato social e CNPJ', recebido: true, fonte: 'ContratoSocial_BV.pdf, pág. 1' },
      { nome: 'Faturamento 12 meses', recebido: true, fonte: 'Faturamento_BV.pdf, pág. 1' },
      { nome: 'Comprovante de endereço sócio', recebido: false },
      { nome: 'Termo de consentimento LGPD', recebido: false },
    ],
    documentosFaltantes: 2,
    confiancaPct: 85,
    orderId: 'ord-4832',
    protocolo: 'PED-2026-004832',
    statusDecisao: 'Aguardando documentos',
  },
];

// ---------------------------------------------------------------------------
// CAPTAÇÃO & RETENÇÃO
// ---------------------------------------------------------------------------

export const CAPTACAO_PIPELINE = [
  { etapa: 'Proprietários contatados', qtd: 14 },
  { etapa: 'Avaliações de preço', qtd: 9 },
  { etapa: 'Propostas de administração', qtd: 7 },
  { etapa: 'Minutas enviadas', qtd: 4 },
  { etapa: 'Imóveis captados no mês', qtd: 11 },
];

export const CAPTACAO_ORIGEM = [
  { origem: 'Indicação de proprietário atual', qtd: 4 },
  { origem: 'Conversão de venda para locação', qtd: 3 },
  { origem: 'Formulário do site', qtd: 2 },
  { origem: 'Prospecção ativa', qtd: 2 },
];

export interface AcquisitionItem {
  id: string;
  imovel: string;
  proprietario: string;
  origem: string;
  taxaAdmPct: number;
  aluguelEstimado: number;
  minuta: string;
  clausulaAlterada: boolean;
  confiancaExtracao: number;
  etapa: string;
  statusRegra: string;
  protocolo?: string;
  orderId?: string;
}

export const INITIAL_ACQUISITIONS_6: AcquisitionItem[] = [
  {
    id: 'cap-1',
    imovel: 'Apto 1405 · Ed. Horizonte (Zona Norte)',
    proprietario: 'Lúcia Menezes',
    origem: 'Indicação de proprietário atual',
    taxaAdmPct: 8,
    aluguelEstimado: 4600,
    minuta: 'Administração v5',
    clausulaAlterada: false,
    confiancaExtracao: 92,
    etapa: 'Aguardando aprovação taxa 8%',
    statusRegra: 'LOC-005 v2 · Gestor em 8h',
    protocolo: 'PED-2026-004831',
    orderId: 'ord-4831',
  },
  {
    id: 'cap-2',
    imovel: 'Apto 903 · Ed. Paraíso (Centro)',
    proprietario: 'Marcos Rezende',
    origem: 'Conversão de venda para locação',
    taxaAdmPct: 9,
    aluguelEstimado: 3600,
    minuta: 'Administração v5',
    clausulaAlterada: false,
    confiancaExtracao: 96,
    etapa: 'Captado e publicado',
    statusRegra: 'LOC-005 v2 · Autônomo',
  },
  {
    id: 'cap-3',
    imovel: 'Loja 02 · Av. Conselheiro (Centro)',
    proprietario: 'Grupo Alvorada',
    origem: 'Prospecção ativa',
    taxaAdmPct: 9,
    aluguelEstimado: 5400,
    minuta: 'Administração v5 (cláusula revisada)',
    clausulaAlterada: true,
    confiancaExtracao: 94,
    etapa: 'Minuta enviada',
    statusRegra: 'JUR-005 v2 · Jurídico 24h',
  },
  {
    id: 'cap-4',
    imovel: 'Casa 15 · Vila Prudente (Zona Leste)',
    proprietario: 'Cláudia Ferreira',
    origem: 'Formulário do site',
    taxaAdmPct: 9,
    aluguelEstimado: 2800,
    minuta: 'Administração v5',
    clausulaAlterada: false,
    confiancaExtracao: 79,
    etapa: 'Triagem extração (79%)',
    statusRegra: 'JUR-013 v3 · Confiança < 85%',
  },
  {
    id: 'cap-5',
    imovel: 'Apto 1104 · Ed. Jardins Sul (Zona Sul)',
    proprietario: 'Fundo Aurora',
    origem: 'Indicação de proprietário atual',
    taxaAdmPct: 8.5,
    aluguelEstimado: 3900,
    minuta: 'Administração v5',
    clausulaAlterada: false,
    confiancaExtracao: 95,
    etapa: 'Proposta de administração',
    statusRegra: 'LOC-005 v2 · Gestor 8h',
  },
  {
    id: 'cap-6',
    imovel: 'Sala 402 · Berrini (Zona Sul)',
    proprietario: 'Henrique Tavares',
    origem: 'Conversão de venda para locação',
    taxaAdmPct: 6.5,
    aluguelEstimado: 4900,
    minuta: 'Administração v5',
    clausulaAlterada: false,
    confiancaExtracao: 91,
    etapa: 'Bloqueado (taxa < 7%)',
    statusRegra: 'LOC-005 v2 · Bloqueado',
  },
];

export const EXPIRING_EXCLUSIVITIES_4 = [
  {
    id: 'exc-1',
    imovel: 'Loja 5 · Galeria Norte',
    proprietario: 'Sérgio Valadares',
    venceEm: '05/12/2026',
    diasRestantes: 13,
    diasVago: 58,
    visitas30d: 2,
    motivo: 'Preço +10,6% acima do mercado',
  },
  {
    id: 'exc-2',
    imovel: 'Sala 301 · Ed. Comercial Paulista',
    proprietario: 'Eliane Cardoso',
    venceEm: '18/12/2026',
    diasRestantes: 26,
    diasVago: 54,
    visitas30d: 4,
    motivo: 'Proposta com 1 mês de carência pendente',
  },
  {
    id: 'exc-3',
    imovel: 'Apto 305 · Ed. Vila Nova',
    proprietario: 'Helena Prado',
    venceEm: '12/12/2026',
    diasRestantes: 20,
    diasVago: 42,
    visitas30d: 0,
    motivo: 'Aguardando autorização e revisão de valor',
  },
  {
    id: 'exc-4',
    imovel: 'Casa Rua das Figueiras 210',
    proprietario: 'Otávio Ramos',
    venceEm: '20/12/2026',
    diasRestantes: 28,
    diasVago: 68,
    visitas30d: 0,
    motivo: 'Redução de -8,2% aguardando aprovação Gestor',
  },
];

export const AT_RISK_OWNERS_4 = [
  {
    id: 'risk-1',
    proprietario: 'Helena Prado',
    imoveis: 4,
    motivo: 'Apto 305 parado há 42d sem anúncio + 2 solicitações no mês',
    ultimaContato: 'Há 9 dias',
    urgencia: 'critico' as const,
  },
  {
    id: 'risk-2',
    proprietario: 'Otávio Ramos',
    imoveis: 4,
    motivo: 'Casa Figueiras 210 vaga há 68d (aguarda redução de preço)',
    ultimaContato: 'Hoje (autorizou -10%)',
    urgencia: 'critico' as const,
  },
  {
    id: 'risk-3',
    proprietario: 'Sérgio Valadares',
    imoveis: 2,
    motivo: 'Exclusividade Loja 5 vence em 05/12/2026 (58d vago)',
    ultimaContato: 'Há 6 dias',
    urgencia: 'atencao' as const,
  },
  {
    id: 'risk-4',
    proprietario: 'Eliane Cardoso',
    imoveis: 2,
    motivo: 'Exclusividade Sala 301 vence em 18/12/2026 · aguarda decisão carência',
    ultimaContato: 'Há 3 dias',
    urgencia: 'atencao' as const,
  },
];

export const RETENCAO_MES = {
  saidasMes: 5,
  taxa12mPct: 92.5,
  motivosSaida: [
    { motivo: 'Vacância longa (> 60 dias)', qtd: 2 },
    { motivo: 'Venda direta', qtd: 1 },
    { motivo: 'Uso próprio', qtd: 1 },
    { motivo: 'Troca de imobiliária', qtd: 1 },
  ],
};

export function getModoBadgeLabel(modo: Modo): string {
  if (modo === 'autonomo') return 'Autônomo';
  if (modo === 'aprovacao') return 'Com aprovação';
  if (modo === 'sugerir') return 'Só sugerir';
  return 'Bloqueado';
}

export function formatPctBR(val: number, showSign = false): string {
  const abs = Math.abs(val).toFixed(1).replace('.', ',');
  if (!showSign) return `${val.toFixed(1).replace('.', ',')}%`;
  return val >= 0 ? `+${abs}%` : `-${abs}%`;
}

export { formatBRL };
