export type TimePeriod = 'hoje' | '7d' | '30d' | 'mes' | '12m';

export type DecisionCategory = 'contrato' | 'imovel' | 'financeiro' | 'alerta';
export type PauseReason = 'Ação sensível' | 'Baixa confiança' | 'Exceção';

export interface DecisionCardItem {
  id: string;
  category: DecisionCategory;
  title: string;
  proposedAction: string;
  pauseReason: PauseReason;
  confidence: number;
  evidenceSource: string;
  evidenceExcerpt: string;
  registeredBy: string;
  createdAt: string;
}

export interface OperationalAlertItem {
  id: string;
  title: string;
  detail: string;
  count: number;
  urgency: 'critico' | 'atencao';
  commandText: string;
  registeredBy: string;
}

export type SemaphoreStatus = 'verde' | 'ambar' | 'vermelho';

export interface KpiDrawerRow {
  col1: string;
  col2: string;
  col3: string;
  col4: string;
  col5: string;
}

export interface KpiMetricItem {
  id: string;
  title: string;
  value: string;
  comparisonPrev: string;
  comparisonTarget: string;
  semaphore: SemaphoreStatus;
  semaphoreRule: string;
  semaphoreLabel: string;
  registeredBy: string;
  sparkline: { label: string; v: number }[];
  drawerColumns: [string, string, string, string, string];
  drawerRows: KpiDrawerRow[];
  agentReading: string;
  suggestedCommand: string;
}

export type TrendTabId = 'receita' | 'vacancia' | 'inadimplencia';

export interface MonthlyTrendPoint {
  month: string;
  receita: number;
  receitaMeta: number;
  vacancia: number;
  vacanciaMeta: number;
  inadimplencia: number;
  inadimplenciaMeta: number;
}

export interface FunnelStageItem {
  id: string;
  label: string;
  count: number;
  conversionFromPrev?: number;
  isBottleneck?: boolean;
}

export interface BrokerRankingItem {
  id: string;
  name: string;
  role: string;
  production: string;
  contractsCount: number;
  conversionPct: number;
  avgResponseMin: number;
  status: SemaphoreStatus;
  registeredBy: string;
}

export type ActivityOrigin = 'WhatsApp' | 'E-mail' | 'PDF' | 'Portal' | 'Pedido seu';
export type ActivityStatus = 'running' | 'completed' | 'undone' | 'error';

export interface AgentActivityItem {
  id: string;
  time: string;
  description: string;
  origin: ActivityOrigin;
  confidence: number;
  status: ActivityStatus;
  registeredBy: string;
}

export interface ProactiveOpportunity {
  id: string;
  title: string;
  context: string;
  actionLabel: string;
  commandText: string;
  severity: 'amber' | 'red' | 'blue';
  detectedBy: string;
}

export interface AgentHealthStats {
  noHumanCorrectionPct: number;
  avgExecutionSeconds: number;
  processingCount: number;
  errorCount: number;
  hoursSavedWeek: number;
  accuracySparkline: { day: string; pct: number }[];
}

export interface IntakeStats {
  documents: { processed: number; total: number };
  messages: { processed: number; total: number };
  leads: { processed: number; total: number };
}

export const COMMAND_SUGGESTIONS: string[] = [
  'Renovar contratos que vencem em 60 dias',
  'Cobrar inquilinos em atraso',
  'Cadastrar imóveis do PDF de ontem',
  'Resumo da semana',
];

export const INITIAL_DECISIONS: DecisionCardItem[] = [
  {
    id: 'dec-1',
    category: 'contrato',
    title: 'Enviar minuta de renovação para Carlos Mendes – Apto 302, reajuste IGP-M 4,2%',
    proposedAction: 'Disparar minuta digital para assinatura e notificar a proprietária Marina.',
    pauseReason: 'Ação sensível',
    confidence: 96,
    evidenceSource: 'Extraído de contrato.pdf, pág. 3',
    evidenceExcerpt:
      'Locatário: Carlos Mendes · Aluguel atual: R$ 3.200,00 → Novo valor: R$ 3.334,40 · Vigência +12 meses.',
    registeredBy: 'Registrado pelo agente',
    createdAt: 'Há 6 min',
  },
  {
    id: 'dec-2',
    category: 'imovel',
    title: 'Publicar captação Rua das Acácias, 418 – Venda R$ 680.000',
    proposedAction: 'Ativar anúncio nos portais ZAP e VivaReal com 14 fotos e descrição padronizada.',
    pauseReason: 'Baixa confiança',
    confidence: 71,
    evidenceSource: 'Extraído do áudio do WhatsApp (01:42) de Roberto Farina',
    evidenceExcerpt:
      'Áudio com ruído no valor informado do condomínio ("entre seiscentos e oitenta e setecentos e oitenta reais").',
    registeredBy: 'Registrado pelo agente',
    createdAt: 'Há 18 min',
  },
  {
    id: 'dec-3',
    category: 'financeiro',
    title: 'Liberar lote de 6 repasses que vencem hoje totalizando R$ 28.450,00',
    proposedAction: 'Autorizar remessa bancária para proprietários com aluguel já compensado.',
    pauseReason: 'Ação sensível',
    confidence: 98,
    evidenceSource: 'Extraído de extrato_oficina_nov.ofx + regra de repasse D+2',
    evidenceExcerpt:
      '6 contratos conferidos e conciliados sem divergência de taxa administrativa.',
    registeredBy: 'Registrado pelo agente',
    createdAt: 'Há 31 min',
  },
  {
    id: 'dec-4',
    category: 'alerta',
    title: 'Vincular PIX de R$ 2.950,00 sem CPF à fatura da Casa 12 (Fernanda Lima)',
    proposedAction: 'Baixar parcela de novembro e suspender envio de cobrança automática.',
    pauseReason: 'Exceção',
    confidence: 74,
    evidenceSource: 'Extraído de comprovante_pix.png + E-mail de Fernanda Lima',
    evidenceExcerpt:
      'Pagamento feito por conta de terceiro (João P. Lima) com valor idêntico ao boleto em aberto.',
    registeredBy: 'Registrado pelo agente',
    createdAt: 'Há 47 min',
  },
];

export const INITIAL_OPERATIONAL_ALERTS: OperationalAlertItem[] = [
  {
    id: 'alt-1',
    title: 'Repasses a proprietários',
    detail: '6 vencem hoje, 2 atrasados',
    count: 8,
    urgency: 'critico',
    commandText: 'Conciliar e preparar pagamento dos 2 repasses atrasados e 6 que vencem hoje',
    registeredBy: 'Detectado pelo agente',
  },
  {
    id: 'alt-2',
    title: 'Inadimplência crítica',
    detail: '9 com +5 dias, 4 com +15 dias, 3 com +30 dias',
    count: 16,
    urgency: 'critico',
    commandText: 'Enviar cobrança escalonada para os 16 inquilinos em atraso conforme faixa de dias',
    registeredBy: 'Detectado pelo agente',
  },
  {
    id: 'alt-3',
    title: 'Contratos vencendo sem ação iniciada',
    detail: '8 em 30 dias, 14 em 60, 15 em 90',
    count: 37,
    urgency: 'atencao',
    commandText: 'Iniciar fluxo de renovação para os 8 contratos críticos em 30 dias e 14 em 60 dias',
    registeredBy: 'Detectado pelo agente',
  },
  {
    id: 'alt-4',
    title: 'Reajustes anuais a aplicar',
    detail: '11 contratos com aniversário neste ciclo',
    count: 11,
    urgency: 'atencao',
    commandText: 'Calcular IGP-M/IPCA e gerar notificação de reajuste para os 11 contratos',
    registeredBy: 'Detectado pelo agente',
  },
  {
    id: 'alt-5',
    title: 'Vistorias e manutenções atrasadas',
    detail: '5 ordens de serviço + 2 vistorias fora do prazo',
    count: 7,
    urgency: 'atencao',
    commandText: 'Cobrar prestadores e reagendar as 5 ordens de serviço e 2 vistorias atrasadas',
    registeredBy: 'Detectado pelo agente',
  },
  {
    id: 'alt-6',
    title: 'Propostas aguardando resposta',
    detail: '5 negociações paradas há mais de 48h',
    count: 5,
    urgency: 'atencao',
    commandText: 'Enviar follow-up personalizado para as 5 propostas aguardando resposta',
    registeredBy: 'Detectado pelo agente',
  },
  {
    id: 'alt-7',
    title: 'Exclusividades vencendo',
    detail: '4 autorizações de venda expiram em 15 dias',
    count: 4,
    urgency: 'atencao',
    commandText: 'Gerar relatório de desempenho e pedir renovação das 4 exclusividades',
    registeredBy: 'Detectado pelo agente',
  },
];

const INADIMPLENCIA_16_ROWS: KpiDrawerRow[] = [
  { col1: 'Ricardo Alves', col2: 'Apto 401 – Ed. Central', col3: '41 dias', col4: 'R$ 9.640,00', col5: 'Caução' },
  { col1: 'Patrícia Lima', col2: 'Casa 08 – Cond. Ipês', col3: '33 dias', col4: 'R$ 7.120,50', col5: 'Caução' },
  { col1: 'Fernando Costa', col2: 'Sala 304 – Paulista', col3: '31 dias', col4: 'R$ 3.150,00', col5: 'Fiador (Judicial)' },
  { col1: 'Juliana Rocha', col2: 'Apto 204 – Bela Vista', col3: '24 dias', col4: 'R$ 2.890,00', col5: 'Caução' },
  { col1: 'Marcos Teixeira', col2: 'Apto 702 – Jardins', col3: '18 dias', col4: 'R$ 4.200,00', col5: 'Seguro fiança' },
  { col1: 'Aline Barros', col2: 'Studio 18 – Consolação', col3: '17 dias', col4: 'R$ 3.560,00', col5: 'Título Cap.' },
  { col1: 'Bruno Azevedo', col2: 'Apto 105 – Vila Nova', col3: '16 dias', col4: 'R$ 3.900,00', col5: 'Seguro fiança' },
  { col1: 'Camila Siqueira', col2: 'Apto 704 – Moema', col3: '14 dias', col4: 'R$ 4.900,00', col5: 'Fiador' },
  { col1: 'Paulo Henrique', col2: 'Loja 03 – Av. Brasil', col3: '12 dias', col4: 'R$ 2.480,00', col5: 'Caução' },
  { col1: 'Gustavo Rocha', col2: 'Casa Rua Turquesa, 90', col3: '11 dias', col4: 'R$ 4.600,00', col5: 'Fiador' },
  { col1: 'Rodrigo Peixoto', col2: 'Apto 306 – Pinheiros', col3: '10 dias', col4: 'R$ 3.120,00', col5: 'Caução' },
  { col1: 'Vanessa Lopes', col2: 'Apto 601 – Perdizes', col3: '9 dias', col4: 'R$ 2.840,00', col5: 'Caução' },
  { col1: 'Thiago Moreira', col2: 'Apto 1102 – Jardins', col3: '8 dias', col4: 'R$ 2.680,00', col5: 'Caução' },
  { col1: 'Sandra Vieira', col2: 'Apto 502 – Santana', col3: '7 dias', col4: 'R$ 2.150,00', col5: 'Fiador' },
  { col1: 'Luciana Freitas', col2: 'Casa 02 – Alto Lapa', col3: '7 dias', col4: 'R$ 2.519,50', col5: 'Caução' },
  { col1: 'Renata Campos', col2: 'Apto 901 – Ed. Horizonte', col3: '6 dias', col4: 'R$ 2.450,00', col5: 'Caução' },
];

export const KPIS_BY_PERIOD: Record<TimePeriod, KpiMetricItem[]> = {
  hoje: [
    {
      id: 'receita',
      title: 'Receita do mês',
      value: 'R$ 186.400',
      comparisonPrev: '+4,1% vs. mês anterior',
      comparisonTarget: 'de R$ 200.000 (93%)',
      semaphore: 'ambar',
      semaphoreRule: 'Regra: ≥ 95% da meta',
      semaphoreLabel: 'Atenção',
      registeredBy: 'Registrado pelo agente',
      sparkline: [
        { label: 'S1', v: 152 },
        { label: 'S2', v: 164 },
        { label: 'S3', v: 171 },
        { label: 'S4', v: 179 },
        { label: 'Atual', v: 186.4 },
      ],
      drawerColumns: ['Linha de receita', 'Qtd', 'Previsto', 'Realizado', 'Status'],
      drawerRows: [
        { col1: 'Taxa de administração', col2: '358', col3: 'R$ 81.000', col4: 'R$ 77.760', col5: '96,0%' },
        { col1: 'Comissões de locação', col2: '24', col3: 'R$ 51.000', col4: 'R$ 48.000', col5: '94,1%' },
        { col1: 'Comissões de venda', col2: '6', col3: 'R$ 59.000', col4: 'R$ 52.000', col5: '88,1%' },
        { col1: 'Outras (vistoria/intermediação)', col2: '19', col3: 'R$ 9.000', col4: 'R$ 8.640', col5: '96,0%' },
      ],
      agentReading: 'Receita do mês atingiu R$ 186.400 de R$ 200.000 (93%). Taxa de administração (96%) sustenta o caixa, com R$ 7.000 em comissões de venda previstos para fechamento nesta semana.',
      suggestedCommand: 'Cobrar cartório e gerente bancário sobre as 2 escrituras pendentes',
    },
    {
      id: 'imoveis',
      title: 'Imóveis administrados',
      value: '412',
      comparisonPrev: '+6 no mês',
      comparisonTarget: 'meta ≥ 405 imóveis',
      semaphore: 'verde',
      semaphoreRule: 'Regra: ≥ 405 imóveis',
      semaphoreLabel: 'Saudável',
      registeredBy: 'Registrado pelo agente',
      sparkline: [
        { label: '1', v: 396 },
        { label: '2', v: 401 },
        { label: '3', v: 405 },
        { label: '4', v: 409 },
        { label: '5', v: 412 },
      ],
      drawerColumns: ['Unidade / Bairro', 'Tipo', 'Aluguel médio', 'Origem cadastro', 'Situação'],
      drawerRows: [
        { col1: 'Jardins / Pinheiros', col2: 'Residencial', col3: 'R$ 4.450,00', col4: 'Agente (PDF)', col5: '142 ativos' },
        { col1: 'Vila Mariana / Moema', col2: 'Residencial', col3: 'R$ 3.680,00', col4: 'Agente (WhatsApp)', col5: '164 ativos' },
        { col1: 'Centro / Paulista', col2: 'Comercial', col3: 'R$ 5.120,00', col4: 'Agente (E-mail)', col5: '106 ativos' },
      ],
      agentReading: 'Crescimento líquido de +6 imóveis no mês impulsionado por 12 fichas captadas via PDF e áudios de proprietários.',
      suggestedCommand: 'Solicitar novas captações aos proprietários com 2+ imóveis na carteira',
    },
    {
      id: 'vacancia',
      title: 'Vacância',
      value: '6,8%',
      comparisonPrev: '+0,9 p.p. vs. anterior',
      comparisonTarget: 'meta ≤ 5,0%',
      semaphore: 'vermelho',
      semaphoreRule: 'Regra: ≤ 5,0%',
      semaphoreLabel: 'Crítico',
      registeredBy: 'Registrado pelo agente',
      sparkline: [
        { label: '1', v: 5.2 },
        { label: '2', v: 5.6 },
        { label: '3', v: 5.9 },
        { label: '4', v: 6.4 },
        { label: '5', v: 6.8 },
      ],
      drawerColumns: ['Imóvel', 'Bairro', 'Dias vago', 'Valor pedido', 'Ação sugerida'],
      drawerRows: [
        { col1: 'Rua dos Pinheiros, 210', col2: 'Pinheiros', col3: '45 dias', col4: 'R$ 5.200,00', col5: '12% acima do mercado' },
        { col1: 'Conj. Comercial 1408', col2: 'Centro', col3: '62 dias', col4: 'R$ 3.800,00', col5: 'Sem visitas há 20d' },
        { col1: 'Apto 901 – Ed. Horizonte', col2: 'Santana', col3: '38 dias', col4: 'R$ 3.100,00', col5: 'Fotos desatualizadas' },
      ],
      agentReading: '28 imóveis estão vagos (6,8%). 11 deles estão precificados entre 9% e 15% acima da mediana do bairro, travando agendamentos.',
      suggestedCommand: 'Gerar proposta de reajuste de preço para os 11 imóveis acima do mercado',
    },
    {
      id: 'inadimplencia',
      title: 'Inadimplência',
      value: '7,2%',
      comparisonPrev: '16 inquilinos em aberto',
      comparisonTarget: 'meta ≤ 4,0%',
      semaphore: 'vermelho',
      semaphoreRule: 'Regra: ≤ 4,0%',
      semaphoreLabel: 'Crítico',
      registeredBy: 'Registrado pelo agente',
      sparkline: [
        { label: '1', v: 4.8 },
        { label: '2', v: 5.3 },
        { label: '3', v: 6.1 },
        { label: '4', v: 6.7 },
        { label: '5', v: 7.2 },
      ],
      drawerColumns: ['Inquilino', 'Imóvel', 'Dias de atraso', 'Valor', 'Garantia'],
      drawerRows: INADIMPLENCIA_16_ROWS,
      agentReading: 'Inadimplência soma R$ 62.200 em 16 inquilinos (7,2%), com 9 contratos em Caução (54% do valor). Sugiro revisar a política de garantias e acionar a régua FIN-020.',
      suggestedCommand: 'Cobrar os 16 inquilinos',
    },
    {
      id: 'contratos-vencer',
      title: 'Contratos a vencer em 90 dias',
      value: '37',
      comparisonPrev: '8 sem ação iniciada',
      comparisonTarget: 'meta: 0 sem ação',
      semaphore: 'ambar',
      semaphoreRule: 'Regra: 0 sem ação ≤ 30d',
      semaphoreLabel: 'Atenção',
      registeredBy: 'Registrado pelo agente',
      sparkline: [
        { label: '1', v: 29 },
        { label: '2', v: 31 },
        { label: '3', v: 34 },
        { label: '4', v: 35 },
        { label: '5', v: 37 },
      ],
      drawerColumns: ['Janela', 'Qtd. contratos', 'Sem ação', 'Em negociação', 'Valor mensal'],
      drawerRows: [
        { col1: 'Até 30 dias', col2: '8', col3: '8', col4: '0', col5: 'R$ 29.400,00' },
        { col1: '31 a 60 dias', col2: '14', col3: '0', col4: '14', col5: 'R$ 48.200,00' },
        { col1: '61 a 90 dias', col2: '15', col3: '0', col4: '15', col5: 'R$ 52.800,00' },
      ],
      agentReading: 'Os 8 contratos com vencimento em até 30 dias ainda não tiveram proposta enviada ao proprietário. Risco direto na vacância do próximo mês.',
      suggestedCommand: 'Iniciar renovação dos 8 contratos que vencem em até 30 dias',
    },
    {
      id: 'leads-conversao',
      title: 'Leads novos e conversão',
      value: '128 leads',
      comparisonPrev: 'conversão 11,7% (+8% vs. ant.)',
      comparisonTarget: 'meta ≥ 10,0%',
      semaphore: 'verde',
      semaphoreRule: 'Regra: conversão ≥ 10%',
      semaphoreLabel: 'Saudável',
      registeredBy: 'Registrado pelo agente',
      sparkline: [
        { label: '1', v: 94 },
        { label: '2', v: 102 },
        { label: '3', v: 115 },
        { label: '4', v: 121 },
        { label: '5', v: 128 },
      ],
      drawerColumns: ['Canal', 'Leads', 'Qualificados IA', 'Visitas', 'Conversão'],
      drawerRows: [
        { col1: 'Portais (ZAP / VivaReal)', col2: '64', col3: '41', col4: '28', col5: '12,5%' },
        { col1: 'WhatsApp Direto', col2: '39', col3: '29', col4: '18', col5: '15,4%' },
        { col1: 'Site / Orgânico', col2: '25', col3: '14', col4: '8', col5: '8,0%' },
      ],
      agentReading: 'O atendimento inicial pelo agente em menos de 40 segundos elevou a conversão de WhatsApp para 15,4%.',
      suggestedCommand: 'Redistribuir leads sem visita marcada há mais de 24h',
    },
    {
      id: 'vgv-negociacao',
      title: 'VGV em negociação (vendas)',
      value: 'R$ 8,4 mi',
      comparisonPrev: 'em 23 propostas ativas',
      comparisonTarget: 'meta: R$ 9,5 mi',
      semaphore: 'ambar',
      semaphoreRule: 'Regra: ≥ R$ 9,5 mi',
      semaphoreLabel: 'Atenção',
      registeredBy: 'Registrado pelo agente',
      sparkline: [
        { label: '1', v: 7.1 },
        { label: '2', v: 7.4 },
        { label: '3', v: 7.9 },
        { label: '4', v: 8.1 },
        { label: '5', v: 8.4 },
      ],
      drawerColumns: ['Imóvel', 'Corretor', 'Valor proposta', 'Etapa', 'Parado há'],
      drawerRows: [
        { col1: 'Cobertura Vila Nova', col2: 'Lucas Andrade', col3: 'R$ 1.850.000', col4: 'Contraproposta', col5: '3 dias' },
        { col1: 'Casa Alto da Boa Vista', col2: 'Beatriz Souza', col3: 'R$ 1.280.000', col4: 'Análise crédito', col5: '2 dias' },
        { col1: 'Apto 1204 – Jardins', col2: 'Rafael Costa', col3: 'R$ 940.000', col4: 'Aguardando retorno', col5: '5 dias' },
      ],
      agentReading: '5 propostas somando R$ 2,6 mi estão paradas há mais de 48h aguardando resposta do vendedor.',
      suggestedCommand: 'Cobrar retorno dos 5 proprietários com propostas paradas',
    },
    {
      id: 'saldo-repassar',
      title: 'Saldo a repassar vs. caixa',
      value: 'R$ 214 mil / R$ 241 mil',
      comparisonPrev: 'cobertura 1,13x',
      comparisonTarget: 'meta cobertura ≥ 1,05x',
      semaphore: 'verde',
      semaphoreRule: 'Regra: cobertura ≥ 1,05x',
      semaphoreLabel: 'Saudável',
      registeredBy: 'Registrado pelo agente',
      sparkline: [
        { label: '1', v: 1.08 },
        { label: '2', v: 1.1 },
        { label: '3', v: 1.11 },
        { label: '4', v: 1.12 },
        { label: '5', v: 1.13 },
      ],
      drawerColumns: ['Conta / Grupo', 'A repassar', 'Disponível', 'Vencimento', 'Cobertura'],
      drawerRows: [
        { col1: 'Conta Vinculada Locação', col2: 'R$ 185.550', col3: 'R$ 209.000', col4: 'Próximos 5 dias', col5: '1,13x' },
        { col1: 'Repasses de Hoje', col2: 'R$ 28.450', col3: 'R$ 32.000', col4: 'Hoje (6 lotes)', col5: '1,12x' },
      ],
      agentReading: 'Caixa cobre integralmente os repasses programados com folga de R$ 27.000 após conciliação automática.',
      suggestedCommand: 'Preparar programação de repasses dos próximos 5 dias úteis',
    },
  ],
  '7d': [],
  '30d': [],
  mes: [],
  '12m': [],
};

// Populate realistic period variations cleanly
function cloneKpisWithOverrides(
  overrides: Record<string, Partial<KpiMetricItem>>
): KpiMetricItem[] {
  return KPIS_BY_PERIOD.hoje.map((item) => ({
    ...item,
    ...(overrides[item.id] ?? {}),
  }));
}

KPIS_BY_PERIOD['7d'] = cloneKpisWithOverrides({
  receita: {
    value: 'R$ 52.800',
    comparisonPrev: '+6,4% vs. semana ant.',
    comparisonTarget: 'meta semanal R$ 50.000 (105%)',
    semaphore: 'verde',
    semaphoreLabel: 'Saudável',
  },
  'leads-conversao': {
    value: '39 leads',
    comparisonPrev: 'conversão 12,8% (+1,2 p.p.)',
  },
});

KPIS_BY_PERIOD['30d'] = KPIS_BY_PERIOD.hoje;

KPIS_BY_PERIOD.mes = KPIS_BY_PERIOD.hoje;

KPIS_BY_PERIOD['12m'] = cloneKpisWithOverrides({
  receita: {
    value: 'R$ 2,18 mi',
    comparisonPrev: '+14,2% vs. 12m ant.',
    comparisonTarget: 'meta anual R$ 2,20 mi (99%)',
    semaphore: 'verde',
    semaphoreLabel: 'Saudável',
  },
  imoveis: {
    value: '412',
    comparisonPrev: '+58 nos últimos 12m',
  },
  vacancia: {
    value: '5,9%',
    comparisonPrev: '-0,6 p.p. vs. ano ant.',
    semaphore: 'ambar',
    semaphoreLabel: 'Atenção',
  },
  inadimplencia: {
    value: '5,4%',
    comparisonPrev: 'média anual · 16 atuais',
    semaphore: 'ambar',
    semaphoreLabel: 'Atenção',
  },
  'leads-conversao': {
    value: '1.480 leads',
    comparisonPrev: 'conversão 11,2% (+1,9 p.p.)',
  },
  'vgv-negociacao': {
    value: 'R$ 34,2 mi',
    comparisonPrev: 'VGV anual negociado',
    semaphore: 'verde',
    semaphoreLabel: 'Saudável',
  },
});

export const MONTHLY_TRENDS_12M: MonthlyTrendPoint[] = [
  { month: 'Dez/25', receita: 158000, receitaMeta: 175000, vacancia: 5.4, vacanciaMeta: 5.0, inadimplencia: 4.5, inadimplenciaMeta: 4.0 },
  { month: 'Jan/26', receita: 162400, receitaMeta: 175000, vacancia: 5.8, vacanciaMeta: 5.0, inadimplencia: 4.9, inadimplenciaMeta: 4.0 },
  { month: 'Fev/26', receita: 168900, receitaMeta: 180000, vacancia: 5.5, vacanciaMeta: 5.0, inadimplencia: 5.1, inadimplenciaMeta: 4.0 },
  { month: 'Mar/26', receita: 174200, receitaMeta: 180000, vacancia: 5.1, vacanciaMeta: 5.0, inadimplencia: 4.6, inadimplenciaMeta: 4.0 },
  { month: 'Abr/26', receita: 179500, receitaMeta: 185000, vacancia: 4.9, vacanciaMeta: 5.0, inadimplencia: 4.3, inadimplenciaMeta: 4.0 },
  { month: 'Mai/26', receita: 183100, receitaMeta: 185000, vacancia: 5.2, vacanciaMeta: 5.0, inadimplencia: 4.7, inadimplenciaMeta: 4.0 },
  { month: 'Jun/26', receita: 181000, receitaMeta: 190000, vacancia: 5.6, vacanciaMeta: 5.0, inadimplencia: 5.4, inadimplenciaMeta: 4.0 },
  { month: 'Jul/26', receita: 188400, receitaMeta: 190000, vacancia: 5.5, vacanciaMeta: 5.0, inadimplencia: 5.8, inadimplenciaMeta: 4.0 },
  { month: 'Ago/26', receita: 191200, receitaMeta: 195000, vacancia: 5.9, vacanciaMeta: 5.0, inadimplencia: 6.1, inadimplenciaMeta: 4.0 },
  { month: 'Set/26', receita: 184600, receitaMeta: 195000, vacancia: 6.1, vacanciaMeta: 5.0, inadimplencia: 6.3, inadimplenciaMeta: 4.0 },
  { month: 'Out/26', receita: 179050, receitaMeta: 200000, vacancia: 5.9, vacanciaMeta: 5.0, inadimplencia: 6.8, inadimplenciaMeta: 4.0 },
  { month: 'Nov/26', receita: 186400, receitaMeta: 200000, vacancia: 6.8, vacanciaMeta: 5.0, inadimplencia: 7.2, inadimplenciaMeta: 4.0 },
];

export const FUNNEL_BY_PERIOD: Record<TimePeriod, FunnelStageItem[]> = {
  hoje: [
    { id: 'lead', label: 'Lead', count: 128 },
    { id: 'visita', label: 'Visita', count: 54, conversionFromPrev: 42.2 },
    { id: 'proposta', label: 'Proposta', count: 19, conversionFromPrev: 35.2, isBottleneck: true },
    { id: 'fechamento', label: 'Fechamento', count: 15, conversionFromPrev: 78.9 },
  ],
  '7d': [
    { id: 'lead', label: 'Lead', count: 39 },
    { id: 'visita', label: 'Visita', count: 18, conversionFromPrev: 46.2 },
    { id: 'proposta', label: 'Proposta', count: 6, conversionFromPrev: 33.3, isBottleneck: true },
    { id: 'fechamento', label: 'Fechamento', count: 5, conversionFromPrev: 83.3 },
  ],
  '30d': [
    { id: 'lead', label: 'Lead', count: 128 },
    { id: 'visita', label: 'Visita', count: 54, conversionFromPrev: 42.2 },
    { id: 'proposta', label: 'Proposta', count: 19, conversionFromPrev: 35.2, isBottleneck: true },
    { id: 'fechamento', label: 'Fechamento', count: 15, conversionFromPrev: 78.9 },
  ],
  mes: [
    { id: 'lead', label: 'Lead', count: 128 },
    { id: 'visita', label: 'Visita', count: 54, conversionFromPrev: 42.2 },
    { id: 'proposta', label: 'Proposta', count: 19, conversionFromPrev: 35.2, isBottleneck: true },
    { id: 'fechamento', label: 'Fechamento', count: 15, conversionFromPrev: 78.9 },
  ],
  '12m': [
    { id: 'lead', label: 'Lead', count: 1480 },
    { id: 'visita', label: 'Visita', count: 632, conversionFromPrev: 42.7 },
    { id: 'proposta', label: 'Proposta', count: 214, conversionFromPrev: 33.9, isBottleneck: true },
    { id: 'fechamento', label: 'Fechamento', count: 166, conversionFromPrev: 77.6 },
  ],
};

export const INITIAL_BROKERS: BrokerRankingItem[] = [
  {
    id: 'brk-1',
    name: 'Beatriz Souza',
    role: 'Locação & Vendas',
    production: 'R$ 54.200',
    contractsCount: 6,
    conversionPct: 16.4,
    avgResponseMin: 4,
    status: 'verde',
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'brk-2',
    name: 'Lucas Andrade',
    role: 'Vendas Alto Padrão',
    production: 'R$ 48.900',
    contractsCount: 4,
    conversionPct: 13.2,
    avgResponseMin: 7,
    status: 'verde',
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'brk-3',
    name: 'Rafael Costa',
    role: 'Locação Residencial',
    production: 'R$ 31.400',
    contractsCount: 3,
    conversionPct: 9.8,
    avgResponseMin: 18,
    status: 'ambar',
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'brk-4',
    name: 'Carla Menezes',
    role: 'Comercial & Salas',
    production: 'R$ 18.600',
    contractsCount: 2,
    conversionPct: 6.5,
    avgResponseMin: 34,
    status: 'vermelho',
    registeredBy: 'Registrado pelo agente',
  },
];

export const INITIAL_OPPORTUNITIES: ProactiveOpportunity[] = [
  {
    id: 'opp-1',
    title: '8 contratos vencem em 60 dias',
    context: 'Risco de vacância em apartamentos de alto giro.',
    actionLabel: 'Iniciar renovações',
    commandText: 'Iniciar renovação dos 8 contratos que vencem em 60 dias',
    severity: 'amber',
    detectedBy: 'Detectado pelo agente',
  },
  {
    id: 'opp-2',
    title: 'Imóvel Rua dos Pinheiros, 210 há 45 dias sem visita e 12% acima do mercado',
    context: 'Comparativo automático com 9 imóveis similares na região.',
    actionLabel: 'Sugerir novo preço',
    commandText: 'Preparar estudo de novo preço para Rua dos Pinheiros, 210',
    severity: 'blue',
    detectedBy: 'Detectado pelo agente',
  },
  {
    id: 'opp-3',
    title: '3 inquilinos com risco de inadimplência recorrente',
    context: 'Atrasos consecutivos nos últimos 2 fechamentos.',
    actionLabel: 'Enviar lembrete',
    commandText: 'Enviar lembrete preventivo via WhatsApp para os 3 inquilinos de risco',
    severity: 'red',
    detectedBy: 'Detectado pelo agente',
  },
  {
    id: 'opp-4',
    title: '5 propostas de venda sem resposta há mais de 48h',
    context: 'Total de R$ 2,6 mi em VGV aguardando retorno.',
    actionLabel: 'Cobrar retorno',
    commandText: 'Fazer follow-up automático das 5 propostas paradas há mais de 48h',
    severity: 'amber',
    detectedBy: 'Detectado pelo agente',
  },
];

export const INITIAL_ACTIVITIES: AgentActivityItem[] = [
  {
    id: 'act-1',
    time: '14:32',
    description: 'Cadastrei o imóvel Apto 302 a partir do áudio do proprietário no WhatsApp',
    origin: 'WhatsApp',
    confidence: 97,
    status: 'completed',
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'act-2',
    time: '14:11',
    description: 'Extraí 12 fichas técnicas de captacao_novembro.pdf e atualizei a carteira',
    origin: 'PDF',
    confidence: 95,
    status: 'completed',
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'act-3',
    time: '13:48',
    description: 'Qualifiquei o lead Juliana Martins e agendei visita para amanhã às 10h30',
    origin: 'Portal',
    confidence: 93,
    status: 'completed',
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'act-4',
    time: '12:55',
    description: 'Respondi o e-mail da proprietária Marina com a prévia do repasse de novembro',
    origin: 'E-mail',
    confidence: 99,
    status: 'completed',
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'act-5',
    time: '11:20',
    description: 'Gerei 18 boletos da competência 12/2026 e validei conciliação OFX',
    origin: 'Pedido seu',
    confidence: 98,
    status: 'completed',
    registeredBy: 'Registrado pelo agente',
  },
];

export const HEALTH_BY_PERIOD: Record<TimePeriod, AgentHealthStats> = {
  hoje: {
    noHumanCorrectionPct: 94.2,
    avgExecutionSeconds: 1.8,
    processingCount: 3,
    errorCount: 1,
    hoursSavedWeek: 38.5,
    accuracySparkline: [
      { day: 'Seg', pct: 91.4 },
      { day: 'Ter', pct: 92.1 },
      { day: 'Qua', pct: 93.0 },
      { day: 'Qui', pct: 92.6 },
      { day: 'Sex', pct: 93.8 },
      { day: 'Sáb', pct: 94.0 },
      { day: 'Dom', pct: 94.2 },
    ],
  },
  '7d': {
    noHumanCorrectionPct: 93.6,
    avgExecutionSeconds: 1.9,
    processingCount: 3,
    errorCount: 2,
    hoursSavedWeek: 38.5,
    accuracySparkline: [
      { day: 'Seg', pct: 91.4 },
      { day: 'Ter', pct: 92.1 },
      { day: 'Qua', pct: 93.0 },
      { day: 'Qui', pct: 92.6 },
      { day: 'Sex', pct: 93.8 },
      { day: 'Sáb', pct: 94.0 },
      { day: 'Dom', pct: 93.6 },
    ],
  },
  '30d': {
    noHumanCorrectionPct: 92.9,
    avgExecutionSeconds: 2.0,
    processingCount: 3,
    errorCount: 3,
    hoursSavedWeek: 38.5,
    accuracySparkline: [
      { day: 'S1', pct: 90.2 },
      { day: 'S2', pct: 91.5 },
      { day: 'S3', pct: 92.1 },
      { day: 'S4', pct: 92.9 },
    ],
  },
  mes: {
    noHumanCorrectionPct: 93.1,
    avgExecutionSeconds: 1.9,
    processingCount: 3,
    errorCount: 2,
    hoursSavedWeek: 38.5,
    accuracySparkline: [
      { day: 'Seg', pct: 91.4 },
      { day: 'Ter', pct: 92.1 },
      { day: 'Qua', pct: 93.0 },
      { day: 'Qui', pct: 92.6 },
      { day: 'Sex', pct: 93.8 },
      { day: 'Sáb', pct: 94.0 },
      { day: 'Dom', pct: 93.1 },
    ],
  },
  '12m': {
    noHumanCorrectionPct: 91.8,
    avgExecutionSeconds: 2.1,
    processingCount: 3,
    errorCount: 4,
    hoursSavedWeek: 38.5,
    accuracySparkline: [
      { day: 'T1', pct: 87.5 },
      { day: 'T2', pct: 89.8 },
      { day: 'T3', pct: 91.2 },
      { day: 'T4', pct: 93.4 },
    ],
  },
};

export const INTAKE_BY_PERIOD: Record<TimePeriod, IntakeStats> = {
  hoje: {
    documents: { processed: 42, total: 45 },
    messages: { processed: 318, total: 324 },
    leads: { processed: 28, total: 28 },
  },
  '7d': {
    documents: { processed: 264, total: 270 },
    messages: { processed: 1842, total: 1850 },
    leads: { processed: 39, total: 39 },
  },
  '30d': {
    documents: { processed: 1120, total: 1134 },
    messages: { processed: 7640, total: 7658 },
    leads: { processed: 128, total: 128 },
  },
  mes: {
    documents: { processed: 942, total: 950 },
    messages: { processed: 6410, total: 6425 },
    leads: { processed: 128, total: 128 },
  },
  '12m': {
    documents: { processed: 11420, total: 11480 },
    messages: { processed: 84210, total: 84300 },
    leads: { processed: 1480, total: 1480 },
  },
};
