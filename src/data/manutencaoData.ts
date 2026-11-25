import type { FinanceSemaphore } from './financeiroData';
import type { Modo } from './rulesData';

export type ManutencaoPeriod = 'hoje' | '7d' | '30d' | 'mes';

export type ManutencaoTabId =
  | 'visao-geral'
  | 'chamados'
  | 'vistorias'
  | 'orcamentos-fornecedores'
  | 'prontidao'
  | 'definir-regras';

export type UrgencyLevel = 'Emergência' | 'Urgente' | 'Normal' | 'Baixa';

export type TicketStage =
  | 'Triagem'
  | 'Orçamento'
  | 'Aguardando aprovação'
  | 'Agendado'
  | 'Em execução'
  | 'Aguardando aceite';

export type TicketCategory =
  | 'Hidráulica'
  | 'Elétrica'
  | 'Pintura e acabamento'
  | 'Esquadrias e fechaduras'
  | 'Ar-condicionado'
  | 'Infiltração e umidade'
  | 'Outros';

export type ResponsavelSugerido =
  | 'Proprietário'
  | 'Inquilino'
  | 'Condomínio ou terceiros'
  | 'A definir';

export interface MaintenanceTicket {
  id: string;
  protocol: string;
  orderId?: string;
  channel: 'WhatsApp' | 'E-mail' | 'Upload de laudo' | 'Chat do sistema';
  imovelCode: string;
  imovel: string;
  solicitanteNome: string;
  solicitantePapel: 'Inquilino' | 'Proprietário' | 'Agente' | 'Gestor' | 'Não identificado';
  solicitanteContatoMascarado: string;
  solicitanteContatoReal: string;
  proprietarioNome: string;
  proprietarioContatoMascarado: string;
  proprietarioContatoReal: string;
  corretor: string;
  problema: string; // máx. 60 caracteres
  objetivo: string; // máx. 140 caracteres
  narrativa: string; // máx. 400 caracteres
  categoria: TicketCategory;
  urgencia: UrgencyLevel;
  etapa: TicketStage;
  responsavelSugerido: ResponsavelSugerido;
  confiancaResponsavel: number;
  confiancaTriagem: number;
  fornecedor: string;
  valorOrcamento: number | null;
  statusTexto: string;
  prazoSemaforo: FinanceSemaphore;
  prazoTexto: string;
  regraId: string;
  regraVersao: number;
  registeredBy: string;
  fonteRegistro: string;
  imovelOcupado: boolean;
  aceiteVisitaInquilino: boolean;
  imovelIdentificado: boolean;
  lacunaRegra?: boolean;
  diasEmReparo?: number;
  chamados90dImovel: number;
  mensagemOriginal: string;
  fotos: { legenda: string; comodo: string; data: string }[];
  previaRetorno: { canal: 'WhatsApp' | 'E-mail'; assunto?: string; corpo: string };
  timeline: { data: string; etapa: string; ator: string; resumo: string }[];
  notaAceite?: number;
  orcamentoId?: string;
}

export interface ManutencaoKpiDrawerRow {
  col1: string;
  col2: string;
  col3: string;
  status: FinanceSemaphore;
  statusLabel: string;
}

export interface ManutencaoKpiCard {
  id: string;
  title: string;
  value: string;
  comparison: string;
  meta: string;
  semaphore: FinanceSemaphore;
  semaphoreLabel: string;
  semaphoreRule: string;
  badge?: string;
  sparkline: number[];
  agentReading: string;
  pedirPrompt: string;
  drawerHeaders: [string, string, string, string];
  drawerRows: ManutencaoKpiDrawerRow[];
}

export interface ManutencaoAlertItem {
  id: string;
  title: string;
  detail: string;
  severity: 'vermelho' | 'ambar';
  regraId: string;
  promptText: string;
  actionType:
    | 'classificar_chamado'
    | 'orcamento'
    | 'laudo'
    | 'pronto_para_alugar'
    | 'vistoria_periodica'
    | 'reembolso_inquilino';
  subtipo: string;
  targetTab?: ManutencaoTabId;
}

export interface InspectionScheduleItem {
  id: string;
  dataHora: string;
  tipo: 'Entrada' | 'Saída';
  imovelCode: string;
  imovel: string;
  vistoriador: string;
  inquilino: string;
  corretor: string;
  situacao: string;
  prazoSemaforo: FinanceSemaphore;
  prazoTexto: string;
  consentimentoRegistrado: boolean;
  origemRescisao?: string;
}

export interface InspectionReport {
  id: string;
  tipo: 'Entrada' | 'Saída';
  imovelCode: string;
  imovel: string;
  contratoCode: string;
  data: string;
  vistoriador: string;
  corretor: string;
  itensCount: number;
  resultadoTexto: string;
  valorDesgaste: number;
  valorEmDisputa: number;
  status: 'Gerado' | 'Aguardando aprovação' | 'Enviado' | 'Assinado';
  assinado: boolean;
  confianca: number;
  contestacaoInquilino?: boolean;
  protocolo?: string;
  orderId?: string;
  registeredBy: string;
}

export type ComparatorClass = 'Sem alteração' | 'Desgaste natural' | 'Dano';

export interface ComparatorItem {
  id: string;
  ordem: number;
  comodo: string;
  itemNome: string;
  fotoEntradaLegenda: string;
  fotoSaidaLegenda: string;
  estadoEntrada: string;
  estadoSaida: string;
  classificacao: ComparatorClass;
  responsavelSugerido: 'Sem custo' | 'Proprietário' | 'Inquilino';
  custoEstimado: number;
  confianca: number;
  fonte: string;
  revisaoHumana?: boolean;
  corrigido?: boolean;
}

export interface QuoteProposal {
  id: string;
  fornecedor: string;
  homologado: boolean;
  valor: number;
  prazoDias: number;
  garantiaDias: number;
  selecionado?: boolean;
}

export interface QuoteCase {
  id: string;
  imovelCode: string;
  imovel: string;
  aluguelMensal: number;
  servico: string;
  protocolo: string;
  orderId?: string;
  valorPrincipal: number;
  fornecedorPrincipal: string;
  prazoDiasPrincipal: number;
  emergencia: boolean;
  fornecedorHomologado: boolean;
  qtdOrcamentos: number;
  autorizacaoProprietario: boolean;
  autorizacaoEvidencia: string;
  status: 'Aguardando Gestor' | 'Aguardando proprietário' | 'Em cotação' | 'Aprovado';
  confianca: number;
  recomendacaoAgente: string;
  propostas: QuoteProposal[];
  corretor: string;
  registeredBy: string;
}

export interface SupplierItem {
  id: string;
  nome: string;
  especialidade: string;
  notaMedia: number;
  prazoMedio: string;
  servicos90d: number;
  retrabalhoPct: number;
  documentosAte: string;
  situacao: 'Ativo' | 'Documento vencendo' | 'Em alerta';
  alertaDetalhe?: string;
  contatoMascarado: string;
  cnpjOuMei: string;
  confianca: number;
  registeredBy: string;
}

export interface ReadinessChecklist {
  laudoSaidaAprovado: boolean;
  zeroOsAbertas: boolean;
  vistoriaFinalAprovada: boolean;
  limpezaConfirmada: boolean;
  chavesMedidoresRegistrados: boolean;
}

export interface ReadinessProperty {
  id: string;
  imovelCode: string;
  imovel: string;
  regiao: string;
  aluguelPedido: number;
  etapa: string;
  etapaIndex: number; // 0..6
  diasNaEtapa: number;
  bloqueio: string;
  proximoPassoAgente: string;
  previsaoPronto: string;
  custoPrevisto: number;
  protocolo: string;
  orderId?: string;
  regraId: string;
  regraVersao: number;
  prontoAnunciavel: boolean;
  corretor: string;
  checklist: ReadinessChecklist;
}

export const READINESS_PIPELINE_STEPS = [
  'Vistoria de saída',
  'Laudo aprovado',
  'Orçamento',
  'Autorização',
  'Execução',
  'Vistoria final',
  'PRONTO',
];

export const MANUTENCAO_STAGES_CHART = [
  { etapa: 'Triagem', quantidade: 3 },
  { etapa: 'Orçamento', quantidade: 9 },
  { etapa: 'Aguard. aprovação', quantidade: 3 },
  { etapa: 'Agendado', quantidade: 7 },
  { etapa: 'Em execução', quantidade: 8 },
  { etapa: 'Aguard. aceite', quantidade: 4 },
];

export const MANUTENCAO_TYPES_CHART = [
  { tipo: 'Hidráulica', abertos: 11, gasto30d: 11240 },
  { tipo: 'Elétrica', abertos: 6, gasto30d: 5310 },
  { tipo: 'Pintura e acabamento', abertos: 5, gasto30d: 9870 },
  { tipo: 'Esquadrias e fechaduras', abertos: 4, gasto30d: 4020 },
  { tipo: 'Ar-condicionado', abertos: 3, gasto30d: 3980 },
  { tipo: 'Infiltração e umidade', abertos: 3, gasto30d: 2640 },
  { tipo: 'Outros', abertos: 2, gasto30d: 1360 },
];

export const MANUTENCAO_WHO_PAID_30D = [
  { pagador: 'Proprietário (descontado no repasse)', valor: 34480, pct: 89.7 },
  { pagador: 'Inquilino (cobrança de danos)', valor: 3940, pct: 10.3 },
];

export const MANUTENCAO_CLOSED_RESPONSIBILITY = [
  { responsavel: 'Proprietário', qtd: 30, pct: 69.8 },
  { responsavel: 'Inquilino', qtd: 10, pct: 23.3 },
  { responsavel: 'Condomínio ou terceiros', qtd: 3, pct: 7.0 },
];

export const MANUTENCAO_ALERTS: ManutencaoAlertItem[] = [
  {
    id: 'malt-1',
    title: '7 itens atrasados (5 ordens de serviço + 2 vistorias de saída)',
    detail: '2 vistorias além dos 3 dias úteis (MAN-005) e 5 OS acima do prazo combinado',
    severity: 'vermelho',
    regraId: 'MAN-001',
    actionType: 'classificar_chamado',
    subtipo: 'Chamado',
    promptText: 'Cobrar imediatamente os 5 fornecedores com OS atrasada e confirmar as 2 vistorias de saída pendentes.',
    targetTab: 'chamados',
  },
  {
    id: 'malt-2',
    title: '1 emergência em andamento · Loja 7 Galeria Norte',
    detail: 'Curto-circuito no quadro elétrico · contenção feita hoje pela Elétrica Voltmax (MAN-001)',
    severity: 'vermelho',
    regraId: 'MAN-001',
    actionType: 'classificar_chamado',
    subtipo: 'Chamado',
    promptText: 'Acompanhar laudo definitivo do eletricista da Loja 7 Galeria Norte (PED-2026-004836) e solicitar orçamento corretivo.',
    targetTab: 'chamados',
  },
  {
    id: 'malt-3',
    title: '2 orçamentos aguardando aprovação do Gestor (R$ 6.530,00)',
    detail: 'Acácias 120 (R$ 2.350,00) e Cedro 57 (R$ 4.180,00) · integrados a Contas a pagar (FIN-011)',
    severity: 'ambar',
    regraId: 'FIN-011',
    actionType: 'orcamento',
    subtipo: 'Orçamento de reparo',
    promptText: 'Priorizar revisão dos 2 orçamentos acima de R$ 1.500,00 aguardando alçada do Gestor na FIN-011.',
    targetTab: 'orcamentos-fornecedores',
  },
  {
    id: 'malt-4',
    title: '1 orçamento aguardando autorização do proprietário (R$ 1.120,00)',
    detail: 'Apto 504 Ed. Solar · Vidraçaria Central > R$ 800,00 bloqueado pela MAN-004',
    severity: 'ambar',
    regraId: 'MAN-004',
    actionType: 'orcamento',
    subtipo: 'Orçamento de reparo',
    promptText: 'Enviar lembrete amigável via WhatsApp à proprietária do Apto 504 Ed. Solar para autorizar o reparo de R$ 1.120,00 (MAN-004).',
    targetTab: 'orcamentos-fornecedores',
  },
  {
    id: 'malt-5',
    title: '4 reparos de imóveis vagos há mais de 20 dias (≈ R$ 300,00/dia)',
    detail: 'Cedro 57 (24d), Apto 306 Solar (31d), Sala 18 Central (22d), Apto 710 Vila Verde (27d)',
    severity: 'vermelho',
    regraId: 'MAN-006',
    actionType: 'pronto_para_alugar',
    subtipo: 'Orçamento de reparo',
    promptText: 'Destravar os 4 reparos em imóveis vagos há mais de 20 dias aplicando a MAN-006 v1 (trocar fornecedor lento e acelerar aprovações).',
    targetTab: 'prontidao',
  },
  {
    id: 'malt-6',
    title: '1 fornecedor sem retorno há 9 dias (Impermeabilizações Delta)',
    detail: 'Nota média 3,1 e 25% retrabalho · atrasa Apto 306 Ed. Solar há 31 dias',
    severity: 'ambar',
    regraId: 'MAN-003',
    actionType: 'orcamento',
    subtipo: 'Orçamento de reparo',
    promptText: 'Substituir Impermeabilizações Delta no Apto 306 Ed. Solar e cobrar os 2 novos orçamentos homologados em 24h.',
    targetTab: 'orcamentos-fornecedores',
  },
  {
    id: 'malt-7',
    title: '2 fornecedores com documento vencendo em 30 dias',
    detail: 'Elétrica Voltmax (18/12/2026) e Hidrotec Serviços (20/12/2026)',
    severity: 'ambar',
    regraId: 'JUR-013',
    actionType: 'orcamento',
    subtipo: 'Orçamento de reparo',
    promptText: 'Solicitar certidões e seguro atualizados para Elétrica Voltmax e Hidrotec Serviços antes do vencimento em dezembro (JUR-013).',
    targetTab: 'orcamentos-fornecedores',
  },
  {
    id: 'malt-8',
    title: '6 imóveis concentram 22 chamados em 90 dias',
    detail: 'Reincidência hidráulica e elétrica sinalizada para vistoria preventiva',
    severity: 'ambar',
    regraId: 'MAN-007',
    actionType: 'vistoria_periodica',
    subtipo: 'Vistoria',
    promptText: 'Listar os 6 imóveis com ≥ 3 chamados em 90 dias e preparar plano sugerido de vistoria preventiva (MAN-007 em rascunho).',
    targetTab: 'chamados',
  },
  {
    id: 'malt-9',
    title: '1 lacuna de regra · Reembolso de reparo feito pelo inquilino',
    detail: 'PED-2026-004835 (Rodrigo Pires, R$ 420,00) operando em modo Só sugerir',
    severity: 'ambar',
    regraId: 'SEM-REGRA',
    actionType: 'reembolso_inquilino',
    subtipo: 'Chamado',
    promptText: 'Consultar proprietário da Sala 05 Ed. Central sobre o reembolso de R$ 420,00 (PED-2026-004835) e propor regra de reembolso.',
    targetTab: 'definir-regras',
  },
  {
    id: 'malt-10',
    title: '1 regra em rascunho · MAN-007 (Vistoria periódica anual)',
    detail: 'Agente não agenda vistorias preventivas automaticamente até ativação pelo Gestor',
    severity: 'ambar',
    regraId: 'MAN-007',
    actionType: 'vistoria_periodica',
    subtipo: 'Vistoria',
    promptText: 'Avaliar ativação da regra MAN-007 v1 para vistorias periódicas anuais com aviso prévio de 24h.',
    targetTab: 'definir-regras',
  },
];

export const MANUTENCAO_OPPORTUNITIES = [
  {
    id: 'mopp-1',
    title: '6 imóveis concentram 22 chamados em 90 dias',
    description:
      'A vistoria periódica (MAN-007, em rascunho) poderia antecipar parte das recorrências hidráulicas e evitar emergências.',
    ctaLabel: 'Ver regra em rascunho',
    type: 'rule-draft' as const,
  },
  {
    id: 'mopp-2',
    title: 'Impermeabilizações Delta: 9 dias sem retorno e nota 3,1',
    description:
      'Retrabalho de 25% e atraso direto no Apto 306 Ed. Solar (31 dias vago). Recomenda-se acelerar novas cotações.',
    ctaLabel: 'Pedir 2 novos orçamentos para o Apto 306 Ed. Solar',
    type: 'ask-agent' as const,
    promptText:
      'Pedir 2 novos orçamentos de impermeabilização com prazo de 24h para o Apto 306 Ed. Solar e substituir Impermeabilizações Delta.',
  },
  {
    id: 'mopp-3',
    title: '2 documentos de fornecedor vencem em 30 dias',
    description:
      'Elétrica Voltmax (18/12/2026) e Hidrotec Serviços (20/12/2026) precisam renovar certidões para não bloquear o Portão 1 da MAN-003.',
    ctaLabel: 'Solicitar renovação',
    type: 'ask-agent' as const,
    promptText:
      'Solicitar renovação de certidões e apólices de Elétrica Voltmax e Hidrotec Serviços com prazo até 10/12/2026 (MAN-003 / JUR-013).',
  },
];

export const AUTONOMY_MAP_COLUMNS = [
  {
    modo: 'autonomo' as Modo,
    title: 'Autônomo',
    subtitle: 'Agente executa direto e registra protocolo',
    items: [
      { texto: 'Classificar e priorizar chamados', ruleId: 'MAN-001' },
      { texto: 'Acionar plantão em emergência e avisar na hora', ruleId: 'MAN-001' },
      { texto: 'Pedir e comparar orçamentos', ruleId: 'MAN-003' },
      { texto: 'Solicitar autorização do proprietário', ruleId: 'MAN-004' },
      { texto: 'Agendar fornecedor e vistoria (8h–19h)', ruleId: 'MAN-005' },
      { texto: 'Gerar laudo comparativo Entrada × Saída', ruleId: 'MAN-005' },
      { texto: 'Contratar até R$ 1.500,00 com portões ✓', ruleId: 'FIN-011' },
      { texto: 'Cobrar andamento de fornecedor', ruleId: 'MAN-006' },
      { texto: 'Avisar inquilino dentro da janela 8h–19h', ruleId: 'MAN-001' },
    ],
  },
  {
    modo: 'aprovacao' as Modo,
    title: 'Com aprovação',
    subtitle: 'Agente prepara tudo e pausa para decisão humana',
    items: [
      { texto: 'Pagamento acima de R$ 1.500,00 (Gestor, 4h)', ruleId: 'FIN-011' },
      { texto: 'Cobrança de dano ao inquilino (Gestor, 8h)', ruleId: 'MAN-002' },
      { texto: 'Triagem humana quando confiança < 80%', ruleId: 'MAN-001' },
    ],
  },
  {
    modo: 'sugerir' as Modo,
    title: 'Só sugerir',
    subtitle: 'Prepara rascunho sem agir por ausência/rascunho de regra',
    items: [
      { texto: 'Reembolso de reparo feito pelo inquilino (lacuna)', ruleId: 'SEM-REGRA' },
      { texto: 'Vistoria periódica anual (MAN-007 em rascunho)', ruleId: 'MAN-007' },
    ],
  },
  {
    modo: 'bloqueado' as Modo,
    title: 'Bloqueado',
    subtitle: 'Barreiras rígidas que o agente nunca ultrapassa',
    items: [
      { texto: 'Contratar fornecedor não homologado', ruleId: 'MAN-003' },
      { texto: 'Reparo > R$ 800,00 sem autorização do dono (exceto contenção)', ruleId: 'MAN-004' },
      { texto: 'Entrega de chaves sem vistoria de entrada assinada', ruleId: 'MAN-005' },
      { texto: 'Autorizar entrada em imóvel ocupado sem aceite', ruleId: 'MAN-001' },
      { texto: 'Afirmar culpa ao inquilino ou garantir prazo fixo', ruleId: 'MAN-002' },
    ],
  },
];

export function getManutencaoKpisByPeriod(period: ManutencaoPeriod): {
  kpis: ManutencaoKpiCard[];
  satisfaction: { value: string; comparison: string; meta: string; semaphore: FinanceSemaphore };
} {
  const mult = period === 'hoje' ? 0.15 : period === '7d' ? 0.35 : 1;
  const closedCount = period === 'hoje' ? 4 : period === '7d' ? 12 : 43;
  const spend = Math.round(38420 * mult);
  const spendFormatted = spend.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });

  const kpis: ManutencaoKpiCard[] = [
    {
      id: 'mkpi-1',
      title: 'Itens atrasados',
      value: '7',
      comparison: '5 ordens de serviço + 2 vistorias',
      meta: 'Meta ≤ 3',
      semaphore: 'ambar',
      semaphoreLabel: 'Atenção (4–8)',
      semaphoreRule: 'Verde ≤ 3 | Âmbar 4–8 | Vermelho > 8',
      sparkline: [5, 6, 6, 8, 7, 7],
      agentReading:
        'As 2 vistorias de saída atrasadas (Jacarandás 18 e Apto 214 Vila Verde) já têm visita confirmada para amanhã 23/11. Entre as 5 OS, Apto 306 Solar e Cedro 57 concentram o maior impacto de aluguel parado.',
      pedirPrompt: 'Cobrar os 5 fornecedores atrasados e confirmar as 2 vistorias de amanhã (23/11).',
      drawerHeaders: ['Item', 'Tipo', 'Atraso', 'Situação'],
      drawerRows: [
        { col1: 'Casa Rua dos Jacarandás 18', col2: 'Vistoria saída', col3: 'Desde 18/11', status: 'vermelho', statusLabel: 'Agendada 23/11 09h' },
        { col1: 'Apto 214 Ed. Vila Verde', col2: 'Vistoria saída', col3: 'Desde 19/11', status: 'vermelho', statusLabel: 'Agendada 23/11 14h' },
        { col1: 'Apto 306 Ed. Solar', col2: 'OS Orçamento', col3: '16 dias', status: 'vermelho', statusLabel: 'Delta sem retorno 9d' },
        { col1: 'Apto 710 Ed. Vila Verde', col2: 'OS Execução', col3: '12 dias', status: 'ambar', statusLabel: '27d em reparo' },
        { col1: 'Casa Rua do Cedro 57', col2: 'OS Aprovação', col3: '9 dias', status: 'ambar', statusLabel: 'Aguarda Gestor FIN-011' },
      ],
    },
    {
      id: 'mkpi-2',
      title: 'Primeira resposta ao chamado',
      value: '14 min',
      comparison: 'Média em horário comercial (3 min em emergência)',
      meta: 'Meta ≤ 30 min',
      semaphore: 'verde',
      semaphoreLabel: 'No alvo',
      semaphoreRule: 'Verde ≤ 30 min | Âmbar 31–60 min | Vermelho > 60 min',
      sparkline: [19, 17, 16, 15, 14, 14],
      agentReading:
        'A triagem automática via WhatsApp e e-mail manteve 14 min de média (53% abaixo do limite de 30 min), com resposta em 3 min na emergência da Loja 7.',
      pedirPrompt: 'Auditar chamados fora da janela 8h–19h com resposta pendente às 08h.',
      drawerHeaders: ['Canal', 'Volume', '1ª resposta média', 'Conformidade'],
      drawerRows: [
        { col1: 'WhatsApp (emergência)', col2: '1 chamado', col3: '3 min', status: 'verde', statusLabel: 'MAN-001 ≤ 5 min' },
        { col1: 'WhatsApp (geral)', col2: '24 chamados', col3: '11 min', status: 'verde', statusLabel: 'Dentro da meta' },
        { col1: 'E-mail', col2: '11 chamados', col3: '21 min', status: 'verde', statusLabel: 'Dentro da meta' },
        { col1: 'Chat / Upload', col2: '7 chamados', col3: '14 min', status: 'verde', statusLabel: 'Dentro da meta' },
      ],
    },
    {
      id: 'mkpi-3',
      title: 'Resolução no prazo (30 dias)',
      value: '86%',
      comparison: `${Math.round(closedCount * 0.86)} de ${closedCount} chamados`,
      meta: 'Meta ≥ 90%',
      semaphore: 'ambar',
      semaphoreLabel: 'Abaixo da meta',
      semaphoreRule: 'Verde ≥ 90% | Âmbar 80–89,9% | Vermelho < 80%',
      sparkline: [89, 88, 87, 85, 86, 86],
      agentReading:
        'A queda de 4 p.p. abaixo da meta decorre de fornecedores de pintura e infiltração com atraso na entrega de orçamento. Trocar fornecedores com SLA > 7d eleva o índice para ~92%.',
      pedirPrompt: 'Gerar ranking de atraso por fornecedor e sugerir substituições na MAN-003.',
      drawerHeaders: ['Urgência', 'Concluídos', 'No prazo', 'Situação'],
      drawerRows: [
        { col1: 'Emergência (2d úteis)', col2: '3', col3: '100% (3/3)', status: 'verde', statusLabel: 'Meta cumprida' },
        { col1: 'Urgente (3d úteis)', col2: '10', col3: '90% (9/10)', status: 'verde', statusLabel: 'Meta cumprida' },
        { col1: 'Normal (10d úteis)', col2: '24', col3: '83% (20/24)', status: 'ambar', statusLabel: 'Abaixo de 90%' },
        { col1: 'Baixa (20d úteis)', col2: '6', col3: '83% (5/6)', status: 'ambar', statusLabel: 'Abaixo de 90%' },
      ],
    },
    {
      id: 'mkpi-4',
      title: 'Tempo médio de resolução',
      value: '5,2 dias úteis',
      comparison: 'Emergência 1,2d · Normal 6,1d',
      meta: 'Meta ≤ 7 dias úteis',
      semaphore: 'verde',
      semaphoreLabel: 'Saudável',
      semaphoreRule: 'Verde ≤ 7d úteis | Âmbar 7,1–10d | Vermelho > 10d',
      sparkline: [6.4, 6.0, 5.8, 5.5, 5.3, 5.2],
      agentReading:
        'Redução contínua nos últimos 6 ciclos graças à liberação autônoma até R$ 1.500,00 pela FIN-011 quando os 3 primeiros portões estão completos.',
      pedirPrompt: 'Comparar tempo médio de reparos ≤ R$ 1.500 (autônomo) vs > R$ 1.500.',
      drawerHeaders: ['Categoria', 'Chamados', 'Média (dias úteis)', 'Semáforo'],
      drawerRows: [
        { col1: 'Hidráulica', col2: '14', col3: '3,8 d', status: 'verde', statusLabel: 'Rápido' },
        { col1: 'Elétrica / Fechaduras', col2: '11', col3: '2,6 d', status: 'verde', statusLabel: 'Rápido' },
        { col1: 'Pintura e acabamento', col2: '9', col3: '8,4 d', status: 'ambar', statusLabel: 'Acima de 7d' },
        { col1: 'Infiltração e umidade', col2: '5', col3: '9,8 d', status: 'ambar', statusLabel: 'Acima de 7d' },
      ],
    },
    {
      id: 'mkpi-5',
      title: 'Vagos presos em reparo ou vistoria',
      value: '7 de 28 (25%)',
      comparison: 'Aluguel parado R$ 18.250,00/mês · Taxa adm em jogo ≈ R$ 1.642,50/mês (9%)',
      meta: 'Meta ≤ 10% dos vagos',
      semaphore: 'vermelho',
      semaphoreLabel: 'Crítico (> 20%)',
      semaphoreRule: 'Verde ≤ 10% | Âmbar 11–20% | Vermelho > 20%',
      badge: 'Estimativa',
      sparkline: [4, 5, 5, 6, 7, 7],
      agentReading:
        'Os 4 reparos parados custam ≈ R$ 300,00 por dia de aluguel. Aprovar o orçamento da Casa Rua do Cedro 57 hoje e trocar o fornecedor do Apto 306 Ed. Solar libera 2 imóveis até 03/12/2026.',
      pedirPrompt: 'Destravar os 7 imóveis vagos presos em reparo ou vistoria priorizando os 4 acima de 20 dias.',
      drawerHeaders: ['Imóvel', 'Etapa', 'Tempo / Bloqueio', 'Aluguel parado'],
      drawerRows: [
        { col1: 'Casa Rua do Cedro 57', col2: 'Aguard. aprovação', col3: '24 dias · FIN-011', status: 'vermelho', statusLabel: 'R$ 2.700,00/mês' },
        { col1: 'Apto 306 Ed. Solar', col2: 'Fornecedor s/ retorno', col3: '31 dias · Delta 9d', status: 'vermelho', statusLabel: 'R$ 1.850,00/mês' },
        { col1: 'Sala 18 Ed. Central', col2: 'Aguardando peça', col3: '22 dias · prev. 27/11', status: 'ambar', statusLabel: 'R$ 2.050,00/mês' },
        { col1: 'Apto 710 Ed. Vila Verde', col2: 'Execução atrasada', col3: '27 dias (+12d meta)', status: 'vermelho', statusLabel: 'R$ 2.400,00/mês' },
        { col1: 'Jacarandás 18 / Vila Verde 214 / Galeria 9', col2: 'Vistoria saída', col3: '3 pendentes (2 atras.)', status: 'ambar', statusLabel: 'R$ 9.250,00/mês' },
      ],
    },
    {
      id: 'mkpi-6',
      title: 'Vistorias de saída no prazo (30 dias)',
      value: '10 de 12 (83,3%)',
      comparison: '2 atrasadas além de 3 dias úteis (MAN-005)',
      meta: 'Meta ≥ 90%',
      semaphore: 'ambar',
      semaphoreLabel: 'Atenção',
      semaphoreRule: 'Verde ≥ 90% | Âmbar 80–89,9% | Vermelho < 80%',
      sparkline: [91, 90, 88, 86, 83, 83],
      agentReading:
        'Ambas as vistorias em atraso tiveram devolução de chaves na semana passada e já estão confirmadas na agenda de 23/11 com Edson Moraes e Carla Reis.',
      pedirPrompt: 'Confirmar presença dos vistoriadores nas 2 vistorias de saída atrasadas de 23/11.',
      drawerHeaders: ['Imóvel', 'Chaves devolvidas', 'Agendamento', 'SLA MAN-005'],
      drawerRows: [
        { col1: 'Casa Rua dos Jacarandás 18', col2: '13/11/2026', col3: '23/11 09:00', status: 'vermelho', statusLabel: 'Atrasada desde 18/11' },
        { col1: 'Apto 214 Ed. Vila Verde', col2: '16/11/2026', col3: '23/11 14:00', status: 'vermelho', statusLabel: 'Atrasada desde 19/11' },
        { col1: 'Loja 9 Galeria Norte', col2: '19/11/2026', col3: '24/11 10:00', status: 'verde', statusLabel: 'Prazo até 24/11' },
        { col1: 'Sala 22 Ed. Central', col2: '22/11/2026', col3: '24/11 14:00', status: 'verde', statusLabel: 'Consentimento OK' },
      ],
    },
    {
      id: 'mkpi-7',
      title: `Gasto com reparos (${period === 'hoje' ? 'hoje' : period === '7d' ? '7 dias' : '30 dias'})`,
      value: spendFormatted,
      comparison:
        period === 'hoje' || period === '7d'
          ? 'Proporcional ao período · conta de terceiros'
          : 'R$ 93,25/imóvel · +16,4% vs. média 6m (R$ 33.000,00)',
      meta: 'Variação ≤ +10% s/ média 6m',
      semaphore: 'ambar',
      semaphoreLabel: '+16,4% (conta 3ºs)',
      semaphoreRule: 'Verde ≤ +10% | Âmbar +10% a +25% | Vermelho > +25%',
      badge: 'Estimativa gerencial: dinheiro de proprietários',
      sparkline: [31200, 32800, 33400, 34100, 36200, 38420],
      agentReading:
        'Valor 100% custeado em conta de terceiros (89,7% descontado no repasse ao proprietário, 10,3% cobrado de danos ao inquilino). Não entra na despesa operacional da imobiliária.',
      pedirPrompt: 'Detalhar os 3 maiores gastos de manutenção dos últimos 30 dias descontados nos repasses.',
      drawerHeaders: ['Categoria', 'Chamados', 'Valor 30d', 'Origem pagadora'],
      drawerRows: [
        { col1: 'Hidráulica', col2: '11 abertos', col3: 'R$ 11.240,00', status: 'ambar', statusLabel: 'Conta de terceiros' },
        { col1: 'Pintura e acabamento', col2: '5 abertos', col3: 'R$ 9.870,00', status: 'ambar', statusLabel: 'Pós-saída + danos' },
        { col1: 'Elétrica', col2: '6 abertos', col3: 'R$ 5.310,00', status: 'verde', statusLabel: 'Dentro da média' },
        { col1: 'Esquadrias / Ar / Infiltração / Outros', col2: '12 abertos', col3: 'R$ 12.000,00', status: 'verde', statusLabel: 'Dentro da média' },
      ],
    },
    {
      id: 'mkpi-8',
      title: 'Retrabalho (reabertos em 30 dias)',
      value: '3 de 43 (7,0%)',
      comparison: '2 em infiltração (Delta) e 1 em fechadura',
      meta: 'Meta ≤ 5%',
      semaphore: 'ambar',
      semaphoreLabel: 'Atenção (5,1–10%)',
      semaphoreRule: 'Verde ≤ 5% | Âmbar 5,1–10% | Vermelho > 10%',
      sparkline: [4.2, 4.8, 5.1, 6.2, 7.0, 7.0],
      agentReading:
        'Impermeabilizações Delta responde por 25% de retrabalho na carteira e puxa o índice acima dos 5%. Exigir vistoria final fotográfica antes da baixa reduz reaberturas.',
      pedirPrompt: 'Revisar os 3 chamados reabertos em 30 dias e acionar garantia de 90 dias dos fornecedores.',
      drawerHeaders: ['Imóvel', 'Fornecedor', 'Motivo reabertura', 'Garantia'],
      drawerRows: [
        { col1: 'Apto 306 Ed. Solar', col2: 'Impermeabilizações Delta', col3: 'Retorno de umidade no teto', status: 'vermelho', statusLabel: 'Acionar garantia' },
        { col1: 'Casa Rua das Flores 42', col2: 'Impermeabilizações Delta', col3: 'Fissura rejunte box', status: 'ambar', statusLabel: 'Em garantia' },
        { col1: 'Apto 803 Ed. Horizonte', col2: 'Chaveiro 24h', col3: 'Trinco desalinhado após ajuste', status: 'verde', statusLabel: 'Corrigido s/ custo' },
      ],
    },
  ];

  return {
    kpis,
    satisfaction: {
      value: '4,3 de 5',
      comparison: '39 avaliações de aceite em 30 dias',
      meta: 'Meta ≥ 4,5',
      semaphore: 'ambar',
    },
  };
}

// ---------------------------------------------------------------------------
// 20 TICKETS (sample of 34 open tickets)
// ---------------------------------------------------------------------------

export const INITIAL_MAINTENANCE_TICKETS: MaintenanceTicket[] = [
  {
    id: 'tk-1',
    protocol: 'PED-2026-004836',
    orderId: 'ord-4836',
    channel: 'WhatsApp',
    imovelCode: 'IMV-407',
    imovel: 'Loja 7 Galeria Norte',
    solicitanteNome: 'Ivan Prates',
    solicitantePapel: 'Inquilino',
    solicitanteContatoMascarado: '(11) 9****-3310',
    solicitanteContatoReal: '(11) 97102-3310',
    proprietarioNome: 'Sérgio Valadares',
    proprietarioContatoMascarado: '(11) 9****-9012',
    proprietarioContatoReal: '(11) 99104-9012',
    corretor: 'Rafael Costa',
    problema: 'Curto-circuito no quadro, cheiro de queimado',
    objetivo: 'Contenção imediata em plantão 24h (MAN-001) e orçamento corretivo após laudo do eletricista.',
    narrativa:
      'Inquilino Ivan Prates reportou curto-circuito no quadro com cheiro de queimado. Agente confirmou em 3 min, acionou plantão Elétrica Voltmax (contenção feita hoje) e notificou gestor e proprietário na hora.',
    categoria: 'Elétrica',
    urgencia: 'Emergência',
    etapa: 'Em execução',
    responsavelSugerido: 'A definir',
    confiancaResponsavel: 72,
    confiancaTriagem: 97,
    fornecedor: 'Elétrica Voltmax (plantão 24h)',
    valorOrcamento: 1180,
    statusTexto: 'Contenção feita hoje; correção definitiva a orçar',
    prazoSemaforo: 'ambar',
    prazoTexto: 'visita em 4h · contenção OK',
    regraId: 'MAN-001',
    regraVersao: 2,
    registeredBy: 'Registrado pelo agente',
    fonteRegistro: 'WhatsApp + foto do quadro elétrico',
    imovelOcupado: true,
    aceiteVisitaInquilino: true,
    imovelIdentificado: true,
    chamados90dImovel: 2,
    mensagemOriginal:
      'URGENTE! Curto-circuito no quadro elétrico da Loja 7 Galeria Norte e cheiro forte de fio queimado.',
    fotos: [
      { legenda: 'Foto 1 de 3, Quadro de disjuntores · Evite pessoas nas imagens', comodo: 'Área técnica', data: '22/11 14:12' },
      { legenda: 'Foto 2 de 3, Luminária próxima ao forro', comodo: 'Salão principal', data: '22/11 14:13' },
    ],
    previaRetorno: {
      canal: 'WhatsApp',
      corpo:
        'Ivan, emergência confirmada (PED-2026-004836). A Elétrica Voltmax concluiu a contenção segura hoje e aguardamos o laudo técnico para previsão da correção definitiva.',
    },
    timeline: [
      { data: '22/11 · 14:12', etapa: 'Recebido', ator: 'Ivan Prates (WhatsApp)', resumo: 'Relato de curto-circuito com cheiro de queimado.' },
      { data: '22/11 · 14:15', etapa: 'Classificado (3 min)', ator: 'Agente · MAN-001 v2', resumo: 'Emergência confirmada; plantão 24h e avisos disparados.' },
      { data: '22/11 · 15:40', etapa: 'Contenção executada', ator: 'Elétrica Voltmax', resumo: 'Circuito isolado com segurança; aguardando laudo de causa (< 80% confiança).' },
    ],
  },
  {
    id: 'tk-2',
    protocol: 'PED-2026-004809',
    orderId: 'ord-4809',
    channel: 'E-mail',
    imovelCode: 'IMV-120',
    imovel: 'Casa Rua das Acácias 120',
    solicitanteNome: 'Maria Souza',
    solicitantePapel: 'Inquilino',
    solicitanteContatoMascarado: 'ma***@email.com',
    solicitanteContatoReal: 'maria.souza@email.com',
    proprietarioNome: 'Ivone Tavares',
    proprietarioContatoMascarado: '(11) 9****-4120',
    proprietarioContatoReal: '(11) 98211-4120',
    corretor: 'Beatriz Souza',
    problema: 'Vazamento na cozinha (tubulação embutida)',
    objetivo: 'Aprovar orçamento vencedor Hidráulica Souza R$ 2.350,00 na alçada FIN-011 (> R$ 1.500).',
    narrativa:
      'Vazamento atrás da pia da cozinha. Portões 1–3 cumpridos (2 cotações homologadas e autorização da proprietária Ivone Tavares em 22/11 via WhatsApp). Aguarda aprovação do Gestor (FIN-011).',
    categoria: 'Hidráulica',
    urgencia: 'Urgente',
    etapa: 'Aguardando aprovação',
    responsavelSugerido: 'Proprietário',
    confiancaResponsavel: 86,
    confiancaTriagem: 94,
    fornecedor: 'Hidráulica Souza',
    valorOrcamento: 2350,
    statusTexto: 'Aguardando aprovação do Gestor (FIN-011)',
    prazoSemaforo: 'ambar',
    prazoTexto: 'em risco · 1d restante',
    regraId: 'FIN-011',
    regraVersao: 2,
    registeredBy: 'Registrado pelo agente',
    fonteRegistro: 'E-mail + foto do registro + WhatsApp proprietária',
    imovelOcupado: true,
    aceiteVisitaInquilino: true,
    imovelIdentificado: true,
    chamados90dImovel: 1,
    orcamentoId: 'orc-acacias-120',
    mensagemOriginal:
      'Boa tarde, começou a escorrer água por trás do gabinete da cozinha desde ontem à noite. Fechei o registro geral da cozinha.',
    fotos: [
      { legenda: 'Foto 1 de 4, Parede atrás da pia da cozinha', comodo: 'Cozinha', data: '22/11 10:18' },
      { legenda: 'Foto 2 de 4, Registro de gaveta fechado', comodo: 'Cozinha', data: '22/11 13:18' },
    ],
    previaRetorno: {
      canal: 'E-mail',
      assunto: 'Atualização do chamado na cozinha - Rua das Acácias 120 [PED-2026-004809]',
      corpo:
        'Olá Maria, já recebemos a autorização da proprietária e os orçamentos. Estamos na etapa final de liberação interna para informar a previsão de visita da Hidráulica Souza.',
    },
    timeline: [
      { data: '22/11 · 10:18', etapa: 'Recebido', ator: 'Maria Souza (E-mail)', resumo: 'Solicitação de reparo de vazamento na cozinha.' },
      { data: '22/11 · 12:30', etapa: '2 orçamentos', ator: 'Agente · MAN-003 v2', resumo: 'Hidráulica Souza (R$ 2.350) e Hidrotec (R$ 2.680).' },
      { data: '22/11 · 13:45', etapa: 'Autorizado pelo dono', ator: 'Ivone Tavares', resumo: 'Aceite registrado via WhatsApp (MAN-004 v1).' },
      { data: '22/11 · 13:50', etapa: 'Aprovação exigida', ator: 'FIN-011 v2', resumo: 'Aguarda Gestor em até 4h (> R$ 1.500).' },
    ],
  },
  {
    id: 'tk-3',
    protocol: 'PED-2026-004833',
    orderId: 'ord-4833',
    channel: 'Upload de laudo',
    imovelCode: 'IMV-057',
    imovel: 'Casa Rua do Cedro 57',
    solicitanteNome: 'Agente (a partir do laudo de saída)',
    solicitantePapel: 'Agente',
    solicitanteContatoMascarado: 'ag***@farina.com.br',
    solicitanteContatoReal: 'agente@farina.com.br',
    proprietarioNome: 'Sérgio Valadares',
    proprietarioContatoMascarado: '(11) 9****-9012',
    proprietarioContatoReal: '(11) 99104-9012',
    corretor: 'Rafael Costa',
    problema: 'Preparação: pintura e troca de piso',
    objetivo: 'Aprovar Reformas Alvorada R$ 4.180,00 e destravar imóvel vago parado há 24 dias.',
    narrativa:
      'Orçamento gerado a partir do laudo de saída. Reformas Alvorada R$ 4.180,00 (9 dias) vs Reforma Fácil Leste R$ 4.620,00 (7 dias). Autorização do dono por e-mail em 21/11. Cada dia de atraso custa R$ 90,00 de aluguel parado.',
    categoria: 'Pintura e acabamento',
    urgencia: 'Normal',
    etapa: 'Aguardando aprovação',
    responsavelSugerido: 'Proprietário',
    confiancaResponsavel: 93,
    confiancaTriagem: 95,
    fornecedor: 'Reformas Alvorada',
    valorOrcamento: 4180,
    statusTexto: 'Aguardando aprovação do Gestor (FIN-011)',
    prazoSemaforo: 'vermelho',
    prazoTexto: 'atrasado 9 dias (meta de 15)',
    regraId: 'MAN-006',
    regraVersao: 1,
    registeredBy: 'Registrado pelo agente',
    fonteRegistro: 'Upload de laudo de saída + e-mail proprietário',
    imovelOcupado: false,
    aceiteVisitaInquilino: true,
    imovelIdentificado: true,
    diasEmReparo: 24,
    chamados90dImovel: 1,
    orcamentoId: 'orc-cedro-57',
    mensagemOriginal:
      'Preparação pós-saída extraída automaticamente do laudo de saída da Casa Rua do Cedro 57.',
    fotos: [
      { legenda: 'Foto 1 de 6, Piso da sala com desgaste acentuado', comodo: 'Sala', data: '20/11 11:00' },
    ],
    previaRetorno: {
      canal: 'E-mail',
      assunto: 'Preparação pós-saída · Casa Rua do Cedro 57 [PED-2026-004833]',
      corpo:
        'Sérgio, com sua autorização de 21/11, submetemos o orçamento da Reformas Alvorada (R$ 4.180,00, previsão 9 dias) para aprovação final e liberação da obra.',
    },
    timeline: [
      { data: '29/10 · 10:00', etapa: 'Laudo aprovado', ator: 'Agente', resumo: 'Itens de preparação convertidos em OS-921.' },
      { data: '21/11 · 17:15', etapa: 'Autorização recebida', ator: 'Sérgio Valadares', resumo: 'E-mail autorizando até R$ 4.300,00.' },
      { data: '22/11 · 11:22', etapa: 'Aguardando aprovação', ator: 'FIN-011 v2', resumo: 'Portões 1–3 OK; aguarda Gestor.' },
    ],
  },
  {
    id: 'tk-4',
    protocol: 'PED-2026-004837',
    orderId: 'ord-4837',
    channel: 'E-mail',
    imovelCode: 'IMV-306',
    imovel: 'Apto 306 Ed. Solar',
    solicitanteNome: 'Gestor (interno)',
    solicitantePapel: 'Gestor',
    solicitanteContatoMascarado: 'ge***@farina.com.br',
    solicitanteContatoReal: 'gestao@farina.com.br',
    proprietarioNome: 'Marta Siqueira',
    proprietarioContatoMascarado: 'ma***@email.com',
    proprietarioContatoReal: 'marta.siqueira@email.com',
    corretor: 'Rafael Costa',
    problema: 'Infiltração no banheiro (vago há 31 dias)',
    objetivo: 'Substituir Impermeabilizações Delta (9d sem retorno) e concluir 2 novos orçamentos.',
    narrativa:
      'Imóvel vago preso em reparo há 31 dias. Fornecedor anterior (Impermeabilizações Delta) ficou 9 dias sem retorno. Agente disparou 2 novos pedidos de cotação pela MAN-003 e MAN-006 (> 20 dias).',
    categoria: 'Infiltração e umidade',
    urgencia: 'Normal',
    etapa: 'Orçamento',
    responsavelSugerido: 'Proprietário',
    confiancaResponsavel: 95,
    confiancaTriagem: 95,
    fornecedor: 'Impermeabilizações Delta (9d sem retorno)',
    valorOrcamento: 1920,
    statusTexto: 'Aguardando orçamento (2 novos pedidos enviados)',
    prazoSemaforo: 'vermelho',
    prazoTexto: 'atrasado 16 dias',
    regraId: 'MAN-006',
    regraVersao: 1,
    registeredBy: 'Registrado pelo agente',
    fonteRegistro: 'E-mail interno + alerta MAN-006 (> 20d)',
    imovelOcupado: false,
    aceiteVisitaInquilino: true,
    imovelIdentificado: true,
    diasEmReparo: 31,
    chamados90dImovel: 3,
    orcamentoId: 'orc-solar-306',
    mensagemOriginal: 'Infiltração persistente no box do banheiro do Apto 306 Ed. Solar impedindo anúncio.',
    fotos: [
      { legenda: 'Foto 1 de 5, Mancha de umidade próxima ao rodapé do banheiro', comodo: 'Banheiro', data: '13/11 09:40' },
    ],
    previaRetorno: {
      canal: 'E-mail',
      assunto: 'Novas cotações de impermeabilização · Apto 306 Ed. Solar',
      corpo:
        'Marta, como a Impermeabilizações Delta não retornou em 9 dias, já acionamos 2 novos fornecedores homologados para agilizar o reparo.',
    },
    timeline: [
      { data: '13/11 · 09:40', etapa: 'Cotação enviada', ator: 'Agente', resumo: 'Solicitado orçamento à Impermeabilizações Delta.' },
      { data: '22/11 · 08:30', etapa: 'Escalonado (> 20d)', ator: 'Agente · MAN-006', resumo: 'Sugerida troca de fornecedor e disparados 2 novos pedidos.' },
    ],
  },
  {
    id: 'tk-5',
    protocol: 'PED-2026-004838',
    orderId: 'ord-4838',
    channel: 'WhatsApp',
    imovelCode: 'IMV-504',
    imovel: 'Apto 504 Ed. Solar',
    solicitanteNome: 'Débora Queiroz',
    solicitantePapel: 'Inquilino',
    solicitanteContatoMascarado: '(11) 9****-8821',
    solicitanteContatoReal: '(11) 99310-8821',
    proprietarioNome: 'Marina Duarte',
    proprietarioContatoMascarado: '(11) 9****-7710',
    proprietarioContatoReal: '(11) 98401-7710',
    corretor: 'Rafael Costa',
    problema: 'Vedação do box do banheiro solta',
    objetivo: 'Obter autorização da proprietária (> R$ 800 na MAN-004) para liberar contratação autônoma.',
    narrativa:
      'Orçamento único da Vidraçaria Central em R$ 1.120,00 (≤ R$ 1.500, autônomo na FIN-011), porém excede R$ 800,00 e está bloqueado na MAN-004 até autorização da proprietária Marina Duarte.',
    categoria: 'Esquadrias e fechaduras',
    urgencia: 'Normal',
    etapa: 'Aguardando aprovação',
    responsavelSugerido: 'Proprietário',
    confiancaResponsavel: 81,
    confiancaTriagem: 93,
    fornecedor: 'Vidraçaria Central',
    valorOrcamento: 1120,
    statusTexto: 'Aguardando autorização do proprietário (MAN-004)',
    prazoSemaforo: 'verde',
    prazoTexto: 'no prazo',
    regraId: 'MAN-004',
    regraVersao: 1,
    registeredBy: 'Registrado pelo agente',
    fonteRegistro: 'WhatsApp + orçamento PDF Vidraçaria Central',
    imovelOcupado: true,
    aceiteVisitaInquilino: true,
    imovelIdentificado: true,
    chamados90dImovel: 1,
    orcamentoId: 'orc-solar-504',
    mensagemOriginal: 'Oi, a borracha de vedação do box do banheiro soltou inteira e está molhando fora.',
    fotos: [
      { legenda: 'Foto 1 de 2, Perfil inferior do box com vedação solta', comodo: 'Banheiro', data: '22/11 10:25' },
    ],
    previaRetorno: {
      canal: 'WhatsApp',
      corpo:
        'Débora, já temos o orçamento da Vidraçaria Central e aguardamos o OK da proprietária para agendar a troca dentro da janela de 8h–19h.',
    },
    timeline: [
      { data: '22/11 · 10:30', etapa: 'Recebido', ator: 'Débora Queiroz', resumo: 'Relato de vedação solta no box.' },
      { data: '22/11 · 10:40', etapa: 'Aguarda proprietário', ator: 'MAN-004 v1', resumo: 'R$ 1.120 > R$ 800: enviado pedido de autorização à Marina Duarte.' },
    ],
  },
  {
    id: 'tk-6',
    protocol: 'PED-2026-004790',
    orderId: 'ord-4790',
    channel: 'WhatsApp',
    imovelCode: 'IMV-1204',
    imovel: 'Apto 1204 Ed. Aurora',
    solicitanteNome: 'Letícia Tavares',
    solicitantePapel: 'Inquilino',
    solicitanteContatoMascarado: '(11) 9****-4402',
    solicitanteContatoReal: '(11) 99120-4402',
    proprietarioNome: 'Eduardo Tavares',
    proprietarioContatoMascarado: '(11) 9****-1209',
    proprietarioContatoReal: '(11) 98880-1209',
    corretor: 'Rafael Costa',
    problema: 'Fechadura da porta de entrada travando',
    objetivo: 'Executar ajuste/troca com Chaveiro 24h (R$ 260) após 2 reagendamentos do fornecedor.',
    narrativa:
      'Chaveiro 24h reagendou 2 vezes a visita para a fechadura de entrada do Apto 1204 Ed. Aurora. Agente cobrou cumprimento do prazo e confirmou janela com a inquilina Letícia Tavares.',
    categoria: 'Esquadrias e fechaduras',
    urgencia: 'Normal',
    etapa: 'Agendado',
    responsavelSugerido: 'Proprietário',
    confiancaResponsavel: 84,
    confiancaTriagem: 92,
    fornecedor: 'Chaveiro 24h',
    valorOrcamento: 260,
    statusTexto: 'Agendado · fornecedor reagendou 2 vezes',
    prazoSemaforo: 'vermelho',
    prazoTexto: 'atrasado 3 dias úteis',
    regraId: 'MAN-001',
    regraVersao: 2,
    registeredBy: 'Registrado pelo agente',
    fonteRegistro: 'WhatsApp da inquilina',
    imovelOcupado: true,
    aceiteVisitaInquilino: true,
    imovelIdentificado: true,
    chamados90dImovel: 3,
    mensagemOriginal: 'A fechadura da porta de entrada está travando e o chaveiro já remarcou duas vezes.',
    fotos: [
      { legenda: 'Foto 1 de 1, Fechadura da porta de entrada', comodo: 'Entrada', data: '19/11 16:00' },
    ],
    previaRetorno: {
      canal: 'WhatsApp',
      corpo:
        'Letícia, cobramos prioridade do Chaveiro 24h para amanhã entre 09h e 11h; se houver novo atraso, acionaremos outro prestador.',
    },
    timeline: [
      { data: '18/11 · 15:00', etapa: 'Recebido', ator: 'Letícia Tavares', resumo: 'Chamado de fechadura travando.' },
      { data: '20/11 · 11:00', etapa: 'Reagendado (2x)', ator: 'Chaveiro 24h', resumo: 'Fornecedor reagendou visita; agente enviou cobrança.' },
    ],
  },
  {
    id: 'tk-7',
    protocol: 'PED-2026-004819',
    channel: 'Chat do sistema',
    imovelCode: 'IMV-018',
    imovel: 'Sala 18 Ed. Central',
    solicitanteNome: 'Agente (vistoria de saída)',
    solicitantePapel: 'Agente',
    solicitanteContatoMascarado: 'ag***@farina.com.br',
    solicitanteContatoReal: 'agente@farina.com.br',
    proprietarioNome: 'Clara Vasconcelos',
    proprietarioContatoMascarado: '(11) 9****-5511',
    proprietarioContatoReal: '(11) 99511-5511',
    corretor: 'Beatriz Souza',
    problema: 'Ar-condicionado e elétrica (imóvel vago)',
    objetivo: 'Concluir troca de placa e circuito dedicado prevista para 27/11/2026 (22d em reparo).',
    narrativa:
      'Refrigeração Polar em execução, aguardando peça de reposição do fabricante. Previsão informada de entrega até 27/11/2026.',
    categoria: 'Ar-condicionado',
    urgencia: 'Normal',
    etapa: 'Em execução',
    responsavelSugerido: 'Proprietário',
    confiancaResponsavel: 94,
    confiancaTriagem: 96,
    fornecedor: 'Refrigeração Polar',
    valorOrcamento: 1340,
    statusTexto: 'Em execução · aguardando peça, previsão 27/11/2026',
    prazoSemaforo: 'vermelho',
    prazoTexto: 'atrasado 7 dias (22 dias em reparo)',
    regraId: 'FIN-011',
    regraVersao: 2,
    registeredBy: 'Registrado pelo agente',
    fonteRegistro: 'Laudo saída + OS Refrigeração Polar',
    imovelOcupado: false,
    aceiteVisitaInquilino: true,
    imovelIdentificado: true,
    diasEmReparo: 22,
    chamados90dImovel: 2,
    orcamentoId: 'orc-sala-18',
    mensagemOriginal: 'Manutenção de ar-condicionado e circuito elétrico após saída do inquilino anterior.',
    fotos: [
      { legenda: 'Foto 1 de 3, Evaporadora split da sala principal', comodo: 'Sala principal', data: '05/11 10:10' },
    ],
    previaRetorno: {
      canal: 'E-mail',
      assunto: 'Previsão de entrega · Sala 18 Ed. Central',
      corpo:
        'Clara, a Refrigeração Polar confirmou chegada da peça para 26/11 com previsão de conclusão em 27/11/2026.',
    },
    timeline: [
      { data: '01/11 · 10:00', etapa: 'OS aberta', ator: 'Agente', resumo: 'Contratação autônoma R$ 1.340,00 (FIN-011 ≤ R$ 1.500).' },
      { data: '18/11 · 16:00', etapa: 'Aguardando peça', ator: 'Refrigeração Polar', resumo: 'Previsão atualizada para 27/11/2026.' },
    ],
  },
  {
    id: 'tk-8',
    protocol: 'PED-2026-004815',
    channel: 'Upload de laudo',
    imovelCode: 'IMV-710',
    imovel: 'Apto 710 Ed. Vila Verde',
    solicitanteNome: 'Agente (a partir do laudo de saída)',
    solicitantePapel: 'Agente',
    solicitanteContatoMascarado: 'ag***@farina.com.br',
    solicitanteContatoReal: 'agente@farina.com.br',
    proprietarioNome: 'João Batista',
    proprietarioContatoMascarado: '(11) 9****-8810',
    proprietarioContatoReal: '(11) 99142-8810',
    corretor: 'Rafael Costa',
    problema: 'Pintura geral e ajuste de portas (imóvel vago)',
    objetivo: 'Finalizar pintura pela Pinturas Norte (R$ 980, autônomo FIN-011) com 27d em preparo.',
    narrativa:
      'Execução pela Pinturas Norte contratada de forma autônoma (R$ 980,00 ≤ R$ 1.500), mas ultrapassou a meta de 15 dias da MAN-006 em 12 dias.',
    categoria: 'Pintura e acabamento',
    urgencia: 'Normal',
    etapa: 'Em execução',
    responsavelSugerido: 'Proprietário',
    confiancaResponsavel: 96,
    confiancaTriagem: 96,
    fornecedor: 'Pinturas Norte',
    valorOrcamento: 980,
    statusTexto: 'Em execução · autônomo (FIN-011)',
    prazoSemaforo: 'vermelho',
    prazoTexto: 'atrasado 12 dias (27 dias em reparo)',
    regraId: 'MAN-006',
    regraVersao: 1,
    registeredBy: 'Registrado pelo agente',
    fonteRegistro: 'Laudo saída + OS Pinturas Norte',
    imovelOcupado: false,
    aceiteVisitaInquilino: true,
    imovelIdentificado: true,
    diasEmReparo: 27,
    chamados90dImovel: 1,
    orcamentoId: 'orc-apto-710',
    mensagemOriginal: 'Pintura geral e regulagem de portas internas pós-desocupação.',
    fotos: [
      { legenda: 'Foto 1 de 4, Paredes da sala em preparação para 2ª demão', comodo: 'Sala', data: '19/11 14:20' },
    ],
    previaRetorno: {
      canal: 'WhatsApp',
      corpo:
        'João, a Pinturas Norte está na última demão no Apto 710 e já programamos a vistoria final logo após a conclusão.',
    },
    timeline: [
      { data: '26/10 · 11:00', etapa: 'OS iniciada', ator: 'Agente · FIN-011', resumo: 'Serviço R$ 980,00 liberado em modo autônomo.' },
      { data: '20/11 · 09:00', etapa: 'Alerta MAN-006', ator: 'Agente', resumo: 'Passou de 20 dias; vistoria final pré-agendada.' },
    ],
  },
  {
    id: 'tk-9',
    protocol: 'PED-2026-004835',
    orderId: 'ord-4835',
    channel: 'WhatsApp',
    imovelCode: 'IMV-505',
    imovel: 'Sala 05 Ed. Central',
    solicitanteNome: 'Rodrigo Pires',
    solicitantePapel: 'Inquilino',
    solicitanteContatoMascarado: '(11) 9****-5501',
    solicitanteContatoReal: '(11) 98412-5501',
    proprietarioNome: 'Heloísa Mendes',
    proprietarioContatoMascarado: '(11) 9****-3108',
    proprietarioContatoReal: '(11) 98115-3108',
    corretor: 'Beatriz Souza',
    problema: 'Reembolso de reparo do dreno (R$ 420,00)',
    objetivo: 'Decisão humana sobre reembolso sem regra cadastrada (Lacuna de regra: modo só sugerir).',
    narrativa:
      'Rodrigo Pires realizou por conta própria o reparo do dreno do ar-condicionado (R$ 420,00 com NF) e pede reembolso. Sem regra ativa: modo Só sugerir (consultar proprietário antes de responder).',
    categoria: 'Ar-condicionado',
    urgencia: 'Baixa',
    etapa: 'Triagem',
    responsavelSugerido: 'Proprietário',
    confiancaResponsavel: 78,
    confiancaTriagem: 91,
    fornecedor: 'Externo (contratado pelo inquilino)',
    valorOrcamento: 420,
    statusTexto: 'Só sugerir · Lacuna de regra (reembolso)',
    prazoSemaforo: 'ambar',
    prazoTexto: 'aguarda decisão humana',
    regraId: 'SEM-REGRA',
    regraVersao: 0,
    registeredBy: 'Registrado pelo agente',
    fonteRegistro: 'WhatsApp + NF-e 88412 anexada',
    imovelOcupado: true,
    aceiteVisitaInquilino: true,
    imovelIdentificado: true,
    lacunaRegra: true,
    chamados90dImovel: 1,
    mensagemOriginal:
      'Boa tarde! O dreno do ar-condicionado da Sala 05 vazou e paguei técnico para não estragar o piso. Segue nota de R$ 420,00 para reembolso.',
    fotos: [
      { legenda: 'Foto 1 de 2, Nota fiscal 88412 · R$ 420,00', comodo: 'Documento fiscal', data: '22/11 13:15' },
    ],
    previaRetorno: {
      canal: 'WhatsApp',
      corpo:
        'Rodrigo, recebemos sua nota de R$ 420,00 e encaminhamos consulta ao gestor e ao proprietário para retorno em breve.',
    },
    timeline: [
      { data: '22/11 · 13:15', etapa: 'Recebido', ator: 'Rodrigo Pires', resumo: 'Pedido de reembolso com NF-e R$ 420,00.' },
      { data: '22/11 · 13:16', etapa: 'Lacuna de regra', ator: 'Motor de Políticas', resumo: 'Sem regra ativa para reembolso feito pelo inquilino (Só sugerir).' },
    ],
  },
  // 2 more in Triagem (unidentified property & unidentified requester)
  {
    id: 'tk-10',
    protocol: 'PED-2026-004832',
    channel: 'WhatsApp',
    imovelCode: 'SEM-IMV',
    imovel: 'Imóvel não identificado',
    solicitanteNome: 'Carla Nogueira',
    solicitantePapel: 'Inquilino',
    solicitanteContatoMascarado: '(11) 9****-6214',
    solicitanteContatoReal: '(11) 98614-6214',
    proprietarioNome: 'A confirmar',
    proprietarioContatoMascarado: '—',
    proprietarioContatoReal: '—',
    corretor: 'Rafael Costa',
    problema: 'Torneira pingando no banheiro (sem endereço)',
    objetivo: 'Triagem humana: mensagem não informou qual apartamento ou endereço (MAN-001 confiança 64%).',
    narrativa:
      'Inquilina possui 2 contratos em cadastro e enviou foto fechada da torneira sem mencionar imóvel. Agente já pediu confirmação pelo WhatsApp e pausou em triagem (< 80%).',
    categoria: 'Hidráulica',
    urgencia: 'Normal',
    etapa: 'Triagem',
    responsavelSugerido: 'A definir',
    confiancaResponsavel: 64,
    confiancaTriagem: 64,
    fornecedor: 'A definir após triagem',
    valorOrcamento: null,
    statusTexto: 'Triagem · falta identificar imóvel',
    prazoSemaforo: 'ambar',
    prazoTexto: 'aguarda endereço',
    regraId: 'MAN-001',
    regraVersao: 2,
    registeredBy: 'Registrado pelo agente',
    fonteRegistro: 'WhatsApp (confiança 64% < 80%)',
    imovelOcupado: true,
    aceiteVisitaInquilino: false,
    imovelIdentificado: false,
    chamados90dImovel: 0,
    mensagemOriginal: 'Oi, a torneira do banheiro social voltou a pingar forte hoje cedo, conseguem mandar alguém?',
    fotos: [
      { legenda: 'Foto 1 de 1, Detalhe de torneira sem referência do imóvel', comodo: 'Banheiro', data: '22/11 11:50' },
    ],
    previaRetorno: {
      canal: 'WhatsApp',
      corpo: 'Olá Carla! Para abrir a ordem de serviço, você confirma se o chamado é para o Apto 204 ou para a Sala 12?',
    },
    timeline: [
      { data: '22/11 · 11:50', etapa: 'Recebido', ator: 'Carla Nogueira', resumo: 'Mensagem sem indicação de unidade.' },
      { data: '22/11 · 11:51', etapa: 'Triagem MAN-001', ator: 'Agente', resumo: 'Confiança 64% (< 80%): agente solicitou confirmação do imóvel.' },
    ],
  },
  {
    id: 'tk-11',
    protocol: 'PED-2026-004831',
    channel: 'WhatsApp',
    imovelCode: 'IMV-901',
    imovel: 'Apto 901 Ed. Horizonte',
    solicitanteNome: 'Número não cadastrado',
    solicitantePapel: 'Não identificado',
    solicitanteContatoMascarado: '(11) 9****-3309',
    solicitanteContatoReal: '(11) 98412-3309',
    proprietarioNome: 'Otávio Ramos',
    proprietarioContatoMascarado: '(11) 9****-1180',
    proprietarioContatoReal: '(11) 99100-1180',
    corretor: 'Beatriz Souza',
    problema: 'Relato de interfone mudo (solicitante s/ cadastro)',
    objetivo: 'Confirmar vínculo do número não cadastrado com o contrato do Apto 901 antes de agendar acesso.',
    narrativa:
      'Número externo mencionou interfone do 901 do Ed. Horizonte. Pela MAN-001, agente não autoriza entrada e pede identificação formal do morador.',
    categoria: 'Elétrica',
    urgencia: 'Normal',
    etapa: 'Triagem',
    responsavelSugerido: 'Condomínio ou terceiros',
    confiancaResponsavel: 74,
    confiancaTriagem: 71,
    fornecedor: 'A definir após identificação',
    valorOrcamento: null,
    statusTexto: 'Triagem · solicitante não identificado',
    prazoSemaforo: 'ambar',
    prazoTexto: 'aguarda confirmação',
    regraId: 'MAN-001',
    regraVersao: 2,
    registeredBy: 'Registrado pelo agente',
    fonteRegistro: 'WhatsApp número externo (71%)',
    imovelOcupado: true,
    aceiteVisitaInquilino: false,
    imovelIdentificado: true,
    chamados90dImovel: 1,
    mensagemOriginal: 'Boa tarde, o interfone do 901 no Horizonte está sem áudio desde ontem.',
    fotos: [],
    previaRetorno: {
      canal: 'WhatsApp',
      corpo: 'Olá! Para prosseguirmos com o atendimento do Apto 901 Ed. Horizonte, informe seu nome completo e CPF cadastrado.',
    },
    timeline: [
      { data: '22/11 · 13:35', etapa: 'Recebido', ator: '(11) 9****-3309', resumo: 'Solicitação de número não cadastrado.' },
      { data: '22/11 · 13:36', etapa: 'Triagem humana', ator: 'MAN-001 v2', resumo: 'Aguarda confirmação de titularidade antes de liberar visita.' },
    ],
  },
  // Remaining 9 coherent tickets across Urgente / Orçamento / Agendado / Em execução / Aguardando aceite
  {
    id: 'tk-12',
    protocol: 'PED-2026-004829',
    channel: 'WhatsApp',
    imovelCode: 'IMV-302',
    imovel: 'Apto 302 Ed. Vista Verde',
    solicitanteNome: 'Fernanda Lima',
    solicitantePapel: 'Inquilino',
    solicitanteContatoMascarado: '(11) 9****-2104',
    solicitanteContatoReal: '(11) 99201-2104',
    proprietarioNome: 'João Batista',
    proprietarioContatoMascarado: '(11) 9****-8810',
    proprietarioContatoReal: '(11) 99142-8810',
    corretor: 'Rafael Costa',
    problema: 'Vazamento no sifão da lavanderia',
    objetivo: 'Agendar Hidráulica Souza após orçamento autônomo aprovado (R$ 390,00).',
    narrativa: 'Vazamento na lavanderia com 3º chamado em 90 dias no imóvel; orçamento R$ 390,00 liberado pela FIN-011.',
    categoria: 'Hidráulica',
    urgencia: 'Urgente',
    etapa: 'Agendado',
    responsavelSugerido: 'Proprietário',
    confiancaResponsavel: 89,
    confiancaTriagem: 95,
    fornecedor: 'Hidráulica Souza',
    valorOrcamento: 390,
    statusTexto: 'Agendado para 23/11 10:00 (aceite inquilino ✓)',
    prazoSemaforo: 'verde',
    prazoTexto: 'no prazo (24h)',
    regraId: 'FIN-011',
    regraVersao: 2,
    registeredBy: 'Registrado pelo agente',
    fonteRegistro: 'WhatsApp + aceite de visita registrado',
    imovelOcupado: true,
    aceiteVisitaInquilino: true,
    imovelIdentificado: true,
    chamados90dImovel: 4,
    mensagemOriginal: 'Está pingando água embaixo do tanque da lavanderia toda vez que a máquina escoa.',
    fotos: [{ legenda: 'Foto 1 de 2, Sifão da lavanderia', comodo: 'Área de serviço', data: '22/11 09:10' }],
    previaRetorno: {
      canal: 'WhatsApp',
      corpo: 'Fernanda, visita da Hidráulica Souza confirmada para amanhã 23/11 às 10h conforme sua disponibilidade.',
    },
    timeline: [
      { data: '22/11 · 09:10', etapa: 'Recebido', ator: 'Fernanda Lima', resumo: 'Relato de vazamento no tanque.' },
      { data: '22/11 · 10:20', etapa: 'Agendado', ator: 'Agente · MAN-001', resumo: 'Visita confirmada para 23/11 10:00.' },
    ],
  },
  {
    id: 'tk-13',
    protocol: 'PED-2026-004828',
    channel: 'E-mail',
    imovelCode: 'IMV-401',
    imovel: 'Apto 401 Ed. Solaris',
    solicitanteNome: 'Marcos Prado',
    solicitantePapel: 'Inquilino',
    solicitanteContatoMascarado: 'ma***@email.com',
    solicitanteContatoReal: 'marcos.prado@email.com',
    proprietarioNome: 'Eduardo Tavares',
    proprietarioContatoMascarado: '(11) 9****-1209',
    proprietarioContatoReal: '(11) 98880-1209',
    corretor: 'Beatriz Souza',
    problema: 'Interfone da cozinha mudo (verificar prumada)',
    objetivo: 'Verificar se defeito é na prumada condominial ou aparelho interno (PED-2026-004804.2).',
    narrativa: 'Sub-pedido desmembrado do e-mail de Marcos Prado; zeladoria e Elétrica Voltmax agendadas.',
    categoria: 'Elétrica',
    urgencia: 'Normal',
    etapa: 'Agendado',
    responsavelSugerido: 'Condomínio ou terceiros',
    confiancaResponsavel: 85,
    confiancaTriagem: 93,
    fornecedor: 'Elétrica Voltmax (plantão 24h)',
    valorOrcamento: 280,
    statusTexto: 'Agendado com zeladoria para 23/11 09:30',
    prazoSemaforo: 'verde',
    prazoTexto: 'no prazo',
    regraId: 'MAN-002',
    regraVersao: 3,
    registeredBy: 'Registrado pelo agente',
    fonteRegistro: 'E-mail desmembrado .2',
    imovelOcupado: true,
    aceiteVisitaInquilino: true,
    imovelIdentificado: true,
    chamados90dImovel: 1,
    mensagemOriginal: 'O interfone da cozinha está mudo desde segunda-feira, poderiam verificar?',
    fotos: [],
    previaRetorno: {
      canal: 'E-mail',
      assunto: 'Agendamento técnico do interfone - Apto 401',
      corpo: 'Marcos, confirmamos a verificação técnica do interfone amanhã às 09h30 junto à zeladoria.',
    },
    timeline: [
      { data: '22/11 · 08:20', etapa: 'Recebido', ator: 'Marcos Prado', resumo: 'Sub-pedido .2 gerado automaticamente.' },
      { data: '22/11 · 09:10', etapa: 'Agendado', ator: 'Agente', resumo: 'Janela confirmada com zeladoria.' },
    ],
  },
  {
    id: 'tk-14',
    protocol: 'PED-2026-004826',
    channel: 'WhatsApp',
    imovelCode: 'IMV-604',
    imovel: 'Casa Rua das Flores 42',
    solicitanteNome: 'Camila Siqueira',
    solicitantePapel: 'Inquilino',
    solicitanteContatoMascarado: '(11) 9****-9941',
    solicitanteContatoReal: '(11) 99741-9941',
    proprietarioNome: 'Helena Prado',
    proprietarioContatoMascarado: '(11) 9****-3381',
    proprietarioContatoReal: '(11) 99381-3381',
    corretor: 'Rafael Costa',
    problema: 'Infiltração na parede da área gourmet',
    objetivo: 'Obter 2 cotações homologadas para infiltração externa (> R$ 1.500 estimados).',
    narrativa: 'Imóvel com 4 chamados em 90 dias; agente aguarda retorno da 2ª empresa de impermeabilização.',
    categoria: 'Infiltração e umidade',
    urgencia: 'Urgente',
    etapa: 'Orçamento',
    responsavelSugerido: 'Proprietário',
    confiancaResponsavel: 88,
    confiancaTriagem: 92,
    fornecedor: 'Em cotação (2 fornecedores)',
    valorOrcamento: 2150,
    statusTexto: '1 de 2 orçamentos recebidos (MAN-003)',
    prazoSemaforo: 'ambar',
    prazoTexto: 'vence hoje 18h',
    regraId: 'MAN-003',
    regraVersao: 2,
    registeredBy: 'Registrado pelo agente',
    fonteRegistro: 'WhatsApp + fotos externas',
    imovelOcupado: true,
    aceiteVisitaInquilino: true,
    imovelIdentificado: true,
    chamados90dImovel: 4,
    mensagemOriginal: 'Com a chuva de ontem apareceu uma mancha grande e bolha na parede da área gourmet.',
    fotos: [{ legenda: 'Foto 1 de 3, Parede com bolhas de umidade', comodo: 'Área gourmet', data: '21/11 17:10' }],
    previaRetorno: {
      canal: 'WhatsApp',
      corpo: 'Camila, já recebemos a primeira cotação e cobramos o 2º orçamento hoje para encaminhar à proprietária.',
    },
    timeline: [
      { data: '21/11 · 17:10', etapa: 'Recebido', ator: 'Camila Siqueira', resumo: 'Relato de infiltração pós-chuva.' },
      { data: '22/11 · 10:00', etapa: 'Em cotação', ator: 'Agente · MAN-003', resumo: '1 orçamento recebido; 2º cobrado.' },
    ],
  },
  {
    id: 'tk-15',
    protocol: 'PED-2026-004824',
    channel: 'WhatsApp',
    imovelCode: 'IMV-208',
    imovel: 'Apto 208 Ed. Parque Sul',
    solicitanteNome: 'Bruno Azevedo',
    solicitantePapel: 'Inquilino',
    solicitanteContatoMascarado: '(11) 9****-7712',
    solicitanteContatoReal: '(11) 99712-7712',
    proprietarioNome: 'Paulo Henrique',
    proprietarioContatoMascarado: '(11) 9****-1190',
    proprietarioContatoReal: '(11) 98190-1190',
    corretor: 'Rafael Costa',
    problema: 'Troca de registro de pressão do chuveiro',
    objetivo: 'Confirmar aceite do inquilino após troca concluída hoje pela Hidrotec Serviços.',
    narrativa: 'Serviço concluído com foto de entrega pela Hidrotec Serviços (R$ 480,00). Aguarda nota de 1 a 5 do solicitante.',
    categoria: 'Hidráulica',
    urgencia: 'Normal',
    etapa: 'Aguardando aceite',
    responsavelSugerido: 'Proprietário',
    confiancaResponsavel: 91,
    confiancaTriagem: 94,
    fornecedor: 'Hidrotec Serviços',
    valorOrcamento: 480,
    statusTexto: 'Entregue · aguarda aceite do inquilino',
    prazoSemaforo: 'verde',
    prazoTexto: 'concluído no prazo',
    regraId: 'FIN-011',
    regraVersao: 2,
    registeredBy: 'Registrado pelo agente',
    fonteRegistro: 'WhatsApp + foto conclusão fornecedor',
    imovelOcupado: true,
    aceiteVisitaInquilino: true,
    imovelIdentificado: true,
    chamados90dImovel: 1,
    mensagemOriginal: 'Registro do chuveiro espanou e não fecha a água.',
    fotos: [{ legenda: 'Foto 1 de 2, Novo acabamento instalado', comodo: 'Suíte', data: '22/11 11:40' }],
    previaRetorno: {
      canal: 'WhatsApp',
      corpo: 'Bruno, a Hidrotec concluiu a troca do registro! Avalie de 1 a 5 se ficou tudo funcionando bem.',
    },
    timeline: [
      { data: '21/11 · 09:00', etapa: 'Aprovado autônomo', ator: 'FIN-011', resumo: 'R$ 480,00 autorizado.' },
      { data: '22/11 · 11:40', etapa: 'Entregue', ator: 'Hidrotec Serviços', resumo: 'Registro substituído e testado.' },
    ],
  },
  {
    id: 'tk-16',
    protocol: 'PED-2026-004821',
    channel: 'E-mail',
    imovelCode: 'IMV-803',
    imovel: 'Apto 803 Ed. Horizonte',
    solicitanteNome: 'Renata Campos',
    solicitantePapel: 'Inquilino',
    solicitanteContatoMascarado: 're***@email.com',
    solicitanteContatoReal: 'renata.campos@email.com',
    proprietarioNome: 'Lúcia Menezes',
    proprietarioContatoMascarado: '(11) 9****-6640',
    proprietarioContatoReal: '(11) 99640-6640',
    corretor: 'Beatriz Souza',
    problema: 'Aquecedor a gás desarmando no banho',
    objetivo: 'Aguardar aceite da inquilina após limpeza e troca de sensor (R$ 540,00).',
    narrativa: 'Técnico da Climatiza & Gás Sul concluiu manutenção preventiva no aquecedor; aguarda aceite final.',
    categoria: 'Outros',
    urgencia: 'Urgente',
    etapa: 'Aguardando aceite',
    responsavelSugerido: 'Proprietário',
    confiancaResponsavel: 90,
    confiancaTriagem: 95,
    fornecedor: 'TermoGás Paulista',
    valorOrcamento: 540,
    statusTexto: 'Entregue · aguarda avaliação de aceite',
    prazoSemaforo: 'verde',
    prazoTexto: 'concluído no prazo',
    regraId: 'FIN-011',
    regraVersao: 2,
    registeredBy: 'Registrado pelo agente',
    fonteRegistro: 'E-mail + OS assinada',
    imovelOcupado: true,
    aceiteVisitaInquilino: true,
    imovelIdentificado: true,
    chamados90dImovel: 3,
    mensagemOriginal: 'O aquecedor a gás desliga sozinho depois de 2 minutos ligado.',
    fotos: [{ legenda: 'Foto 1 de 2, Aquecedor revisado na área de serviço', comodo: 'Área de serviço', data: '22/11 10:15' }],
    previaRetorno: {
      canal: 'E-mail',
      assunto: 'Serviço concluído no aquecedor - Apto 803',
      corpo: 'Renata, o técnico finalizou a manutenção do aquecedor. Confirme o aceite e avalie o atendimento.',
    },
    timeline: [
      { data: '21/11 · 14:00', etapa: 'Agendado', ator: 'Agente', resumo: 'Visita autorizada pela inquilina.' },
      { data: '22/11 · 10:15', etapa: 'Entregue', ator: 'TermoGás Paulista', resumo: 'Sensor trocado e pressão ajustada.' },
    ],
  },
  {
    id: 'tk-17',
    protocol: 'PED-2026-004818',
    channel: 'WhatsApp',
    imovelCode: 'IMV-105',
    imovel: 'Apto 105 Ed. Vila Nova',
    solicitanteNome: 'Gustavo Rocha',
    solicitantePapel: 'Inquilino',
    solicitanteContatoMascarado: '(11) 9****-4500',
    solicitanteContatoReal: '(11) 99500-4500',
    proprietarioNome: 'Eduardo Tavares',
    proprietarioContatoMascarado: '(11) 9****-1209',
    proprietarioContatoReal: '(11) 98880-1209',
    corretor: 'Rafael Costa',
    problema: 'Vazamento na válvula Hydra do banheiro social',
    objetivo: 'Executar reparo com Hidráulica Souza agendado para 24/11 15:00.',
    narrativa: 'Troca de reparo Hydra (R$ 320,00) aprovada em modo autônomo; visita aceita pelo inquilino.',
    categoria: 'Hidráulica',
    urgencia: 'Urgente',
    etapa: 'Agendado',
    responsavelSugerido: 'Proprietário',
    confiancaResponsavel: 92,
    confiancaTriagem: 96,
    fornecedor: 'Hidráulica Souza',
    valorOrcamento: 320,
    statusTexto: 'Agendado para 24/11 15:00',
    prazoSemaforo: 'verde',
    prazoTexto: 'no prazo',
    regraId: 'FIN-011',
    regraVersao: 2,
    registeredBy: 'Registrado pelo agente',
    fonteRegistro: 'WhatsApp',
    imovelOcupado: true,
    aceiteVisitaInquilino: true,
    imovelIdentificado: true,
    chamados90dImovel: 3,
    mensagemOriginal: 'A descarga da parede não para de correr água após apertar.',
    fotos: [{ legenda: 'Foto 1 de 1, Válvula Hydra banheiro social', comodo: 'Banheiro', data: '22/11 08:40' }],
    previaRetorno: {
      canal: 'WhatsApp',
      corpo: 'Gustavo, confirmamos a visita da Hidráulica Souza para 24/11 às 15h conforme combinado.',
    },
    timeline: [
      { data: '22/11 · 08:40', etapa: 'Recebido', ator: 'Gustavo Rocha', resumo: 'Chamado de descarga correndo.' },
      { data: '22/11 · 09:30', etapa: 'Agendado', ator: 'Agente', resumo: 'Orçamento R$ 320,00 autônomo.' },
    ],
  },
  {
    id: 'tk-18',
    protocol: 'PED-2026-004814',
    channel: 'WhatsApp',
    imovelCode: 'IMV-601',
    imovel: 'Apto 601 Perdizes',
    solicitanteNome: 'Aline Barros',
    solicitantePapel: 'Inquilino',
    solicitanteContatoMascarado: '(11) 9****-3189',
    solicitanteContatoReal: '(11) 98389-3189',
    proprietarioNome: 'Clara Vasconcelos',
    proprietarioContatoMascarado: '(11) 9****-5511',
    proprietarioContatoReal: '(11) 99511-5511',
    corretor: 'Beatriz Souza',
    problema: 'Tomada 220V da cozinha sem energia',
    objetivo: 'Aguardar retorno do 1º orçamento da Elétrica Voltmax.',
    narrativa: 'Disjuntor específico da tomada do forno desarma; aguardando vistoria orçamentária.',
    categoria: 'Elétrica',
    urgencia: 'Normal',
    etapa: 'Orçamento',
    responsavelSugerido: 'Proprietário',
    confiancaResponsavel: 87,
    confiancaTriagem: 92,
    fornecedor: 'Elétrica Voltmax (plantão 24h)',
    valorOrcamento: 460,
    statusTexto: 'Aguardando orçamento formalizado',
    prazoSemaforo: 'verde',
    prazoTexto: 'no prazo',
    regraId: 'MAN-003',
    regraVersao: 2,
    registeredBy: 'Registrado pelo agente',
    fonteRegistro: 'WhatsApp',
    imovelOcupado: true,
    aceiteVisitaInquilino: true,
    imovelIdentificado: true,
    chamados90dImovel: 1,
    mensagemOriginal: 'A tomada do forno elétrico parou de funcionar e o disjuntor não segura.',
    fotos: [],
    previaRetorno: {
      canal: 'WhatsApp',
      corpo: 'Aline, a Elétrica Voltmax enviará o orçamento hoje para liberarmos o reparo dentro do prazo.',
    },
    timeline: [
      { data: '21/11 · 15:20', etapa: 'Recebido', ator: 'Aline Barros', resumo: 'Tomada 220V sem energia.' },
    ],
  },
  {
    id: 'tk-19',
    protocol: 'PED-2026-004813',
    channel: 'E-mail',
    imovelCode: 'IMV-902',
    imovel: 'Conjunto 902 Centro',
    solicitanteNome: 'Eduardo Tavares',
    solicitantePapel: 'Proprietário',
    solicitanteContatoMascarado: 'ed***@email.com',
    solicitanteContatoReal: 'eduardo.tavares@email.com',
    proprietarioNome: 'Eduardo Tavares',
    proprietarioContatoMascarado: '(11) 9****-1209',
    proprietarioContatoReal: '(11) 98880-1209',
    corretor: 'Rafael Costa',
    problema: 'Higienização de 3 aparelhos de ar-condicionado',
    objetivo: 'Executar manutenção preventiva pela Refrigeração Polar (R$ 690,00 autônomo).',
    narrativa: 'Em execução com conclusão prevista para hoje às 17h30.',
    categoria: 'Ar-condicionado',
    urgencia: 'Normal',
    etapa: 'Em execução',
    responsavelSugerido: 'Proprietário',
    confiancaResponsavel: 98,
    confiancaTriagem: 97,
    fornecedor: 'Refrigeração Polar',
    valorOrcamento: 690,
    statusTexto: 'Em execução · equipe no local',
    prazoSemaforo: 'verde',
    prazoTexto: 'no prazo',
    regraId: 'FIN-011',
    regraVersao: 2,
    registeredBy: 'Registrado pelo agente',
    fonteRegistro: 'E-mail do proprietário',
    imovelOcupado: false,
    aceiteVisitaInquilino: true,
    imovelIdentificado: true,
    chamados90dImovel: 3,
    mensagemOriginal: 'Autorizo higienização preventiva dos 3 splits do Conjunto 902 antes da entrada do novo inquilino.',
    fotos: [],
    previaRetorno: {
      canal: 'E-mail',
      assunto: 'Execução iniciada - Conjunto 902 Centro',
      corpo: 'Eduardo, a Refrigeração Polar está no local realizando a higienização dos 3 equipamentos.',
    },
    timeline: [
      { data: '22/11 · 13:00', etapa: 'Em execução', ator: 'Refrigeração Polar', resumo: 'Equipe iniciou limpeza e troca de filtros.' },
    ],
  },
  {
    id: 'tk-20',
    protocol: 'PED-2026-004807',
    channel: 'WhatsApp',
    imovelCode: 'IMV-220',
    imovel: 'Casa Jardim das Palmeiras 88',
    solicitanteNome: 'Patrícia Viana',
    solicitantePapel: 'Inquilino',
    solicitanteContatoMascarado: '(11) 9****-7019',
    solicitanteContatoReal: '(11) 99701-7019',
    proprietarioNome: 'João Batista',
    proprietarioContatoMascarado: '(11) 9****-8810',
    proprietarioContatoReal: '(11) 99142-8810',
    corretor: 'Rafael Costa',
    problema: 'Vidro trincado na janela da área de serviço',
    objetivo: 'Aguardar aceite da inquilina após reposição do vidro (custo atribuído ao inquilino, MAN-002).',
    narrativa: 'Inquilina assumiu quebra acidental do vidro; Vidraçaria Central concluiu troca (R$ 380,00) e aguarda aceite.',
    categoria: 'Esquadrias e fechaduras',
    urgencia: 'Baixa',
    etapa: 'Aguardando aceite',
    responsavelSugerido: 'Inquilino',
    confiancaResponsavel: 94,
    confiancaTriagem: 95,
    fornecedor: 'Vidraçaria Central',
    valorOrcamento: 380,
    statusTexto: 'Entregue · aguarda aceite final',
    prazoSemaforo: 'verde',
    prazoTexto: 'concluído no prazo',
    regraId: 'MAN-002',
    regraVersao: 3,
    registeredBy: 'Registrado pelo agente',
    fonteRegistro: 'WhatsApp + aceite de cobrança aprovado',
    imovelOcupado: true,
    aceiteVisitaInquilino: true,
    imovelIdentificado: true,
    chamados90dImovel: 1,
    mensagemOriginal: 'Bateu vento forte e trincou o vidro da área de serviço, podem mandar trocar?',
    fotos: [{ legenda: 'Foto 1 de 1, Vidro novo instalado e vedado', comodo: 'Área de serviço', data: '22/11 11:20' }],
    previaRetorno: {
      canal: 'WhatsApp',
      corpo: 'Patrícia, a troca do vidro foi concluída hoje. Você pode confirmar e avaliar o serviço de 1 a 5?',
    },
    timeline: [
      { data: '22/11 · 11:20', etapa: 'Entregue', ator: 'Vidraçaria Central', resumo: 'Vidro substituído com sucesso.' },
    ],
  },
];

// ---------------------------------------------------------------------------
// VISTORIAS (7 AGENDADAS + 8 LAUDOS + 16 ITENS DO COMPARADOR CASA RUA DO LAGO 9)
// ---------------------------------------------------------------------------

export const INITIAL_INSPECTION_SCHEDULE: InspectionScheduleItem[] = [
  {
    id: 'vis-ag-1',
    dataHora: '23/11 · 09:00',
    tipo: 'Saída',
    imovelCode: 'IMV-018J',
    imovel: 'Casa Rua dos Jacarandás 18',
    vistoriador: 'Edson Moraes',
    inquilino: 'Renato Salgado',
    corretor: 'Rafael Costa',
    situacao: 'Chaves devolvidas em 13/11 · atrasada',
    prazoSemaforo: 'vermelho',
    prazoTexto: 'atrasada desde 18/11',
    consentimentoRegistrado: true,
  },
  {
    id: 'vis-ag-2',
    dataHora: '23/11 · 14:00',
    tipo: 'Saída',
    imovelCode: 'IMV-214',
    imovel: 'Apto 214 Ed. Vila Verde',
    vistoriador: 'Carla Reis',
    inquilino: 'Sônia Magalhães',
    corretor: 'Rafael Costa',
    situacao: 'Chaves devolvidas em 16/11 · atrasada',
    prazoSemaforo: 'vermelho',
    prazoTexto: 'atrasada desde 19/11',
    consentimentoRegistrado: true,
  },
  {
    id: 'vis-ag-3',
    dataHora: '24/11 · 10:00',
    tipo: 'Saída',
    imovelCode: 'IMV-409',
    imovel: 'Loja 9 Galeria Norte',
    vistoriador: 'Edson Moraes',
    inquilino: 'Ótica Visão Ltda',
    corretor: 'Beatriz Souza',
    situacao: 'Chaves devolvidas em 19/11',
    prazoSemaforo: 'verde',
    prazoTexto: 'prazo até 24/11',
    consentimentoRegistrado: true,
  },
  {
    id: 'vis-ag-4',
    dataHora: '24/11 · 14:00',
    tipo: 'Saída',
    imovelCode: 'IMV-022',
    imovel: 'Sala 22 Ed. Central',
    vistoriador: 'Carla Reis',
    inquilino: 'Tiago Pires',
    corretor: 'Beatriz Souza',
    situacao: 'Etapa "Vistoria de saída" da rescisão',
    prazoSemaforo: 'verde',
    prazoTexto: 'consentimento do inquilino ✓',
    consentimentoRegistrado: true,
    origemRescisao: 'CT-2025-0140',
  },
  {
    id: 'vis-ag-5',
    dataHora: '25/11 · 10:30',
    tipo: 'Entrada',
    imovelCode: 'IMV-302',
    imovel: 'Apto 302 Ed. Vista Verde',
    vistoriador: 'Edson Moraes',
    inquilino: 'Helena Vasconcelos',
    corretor: 'Rafael Costa',
    situacao: 'Locação recém-assinada (janela 8h–19h)',
    prazoSemaforo: 'verde',
    prazoTexto: 'confirmada',
    consentimentoRegistrado: true,
  },
  {
    id: 'vis-ag-6',
    dataHora: '26/11 · 15:00',
    tipo: 'Entrada',
    imovelCode: 'IMV-804',
    imovel: 'Sala 804 Av. Paulista',
    vistoriador: 'Carla Reis',
    inquilino: 'Grupo Alpha Consultoria',
    corretor: 'Lucas Andrade',
    situacao: 'Locação comercial recém-assinada',
    prazoSemaforo: 'verde',
    prazoTexto: 'confirmada',
    consentimentoRegistrado: true,
  },
  {
    id: 'vis-ag-7',
    dataHora: '27/11 · 11:00',
    tipo: 'Entrada',
    imovelCode: 'IMV-1102',
    imovel: 'Apto 1102 Ed. Jardins',
    vistoriador: 'Edson Moraes',
    inquilino: 'Juliana Martins',
    corretor: 'Rafael Costa',
    situacao: 'Locação recém-assinada (aguarda assinatura laudo)',
    prazoSemaforo: 'verde',
    prazoTexto: 'agendada 8h–19h',
    consentimentoRegistrado: true,
  },
];

export const INITIAL_INSPECTION_REPORTS: InspectionReport[] = [
  {
    id: 'laudo-lago-9',
    tipo: 'Saída',
    imovelCode: 'IMV-009',
    imovel: 'Casa Rua do Lago 9 (Lucas Andrade)',
    contratoCode: 'CT-2024-0818',
    data: '19/11/2026',
    vistoriador: 'Edson Moraes',
    corretor: 'Rafael Costa',
    itensCount: 16,
    resultadoTexto: '11 sem alteração · 2 desgaste · 3 danos',
    valorDesgaste: 1150,
    valorEmDisputa: 1640,
    status: 'Aguardando aprovação',
    assinado: false,
    confianca: 89,
    protocolo: 'PED-2026-004834',
    orderId: 'ord-4834',
    registeredBy: 'Registrado pelo agente · 18 fotos e áudio',
  },
  {
    id: 'laudo-aurora-1204',
    tipo: 'Entrada',
    imovelCode: 'IMV-1204',
    imovel: 'Apto 1204 Ed. Aurora (Camila Duarte)',
    contratoCode: 'CT-2026-1204',
    data: '22/11/2026',
    vistoriador: 'Carla Reis',
    corretor: 'Rafael Costa',
    itensCount: 14,
    resultadoTexto: 'Checklist e 22 fotos OK · falta assinatura',
    valorDesgaste: 0,
    valorEmDisputa: 0,
    status: 'Gerado',
    assinado: false,
    confianca: 97,
    protocolo: 'PED-2026-004790',
    orderId: 'ord-4790',
    registeredBy: 'Registrado pelo agente · chaves bloqueadas MAN-005',
  },
  {
    id: 'laudo-cedro-57',
    tipo: 'Saída',
    imovelCode: 'IMV-057',
    imovel: 'Casa Rua do Cedro 57',
    contratoCode: 'CT-2023-0057',
    data: '29/10/2026',
    vistoriador: 'Edson Moraes',
    corretor: 'Rafael Costa',
    itensCount: 18,
    resultadoTexto: 'Desgaste natural (pintura e piso R$ 4.180)',
    valorDesgaste: 4180,
    valorEmDisputa: 0,
    status: 'Assinado',
    assinado: true,
    confianca: 95,
    protocolo: 'PED-2026-004833',
    orderId: 'ord-4833',
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'laudo-vilaverde-710',
    tipo: 'Saída',
    imovelCode: 'IMV-710',
    imovel: 'Apto 710 Ed. Vila Verde',
    contratoCode: 'CT-2024-0710',
    data: '26/10/2026',
    vistoriador: 'Carla Reis',
    corretor: 'Rafael Costa',
    itensCount: 12,
    resultadoTexto: 'Desgaste natural (R$ 980)',
    valorDesgaste: 980,
    valorEmDisputa: 0,
    status: 'Assinado',
    assinado: true,
    confianca: 96,
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'laudo-central-18',
    tipo: 'Saída',
    imovelCode: 'IMV-018',
    imovel: 'Sala 18 Ed. Central',
    contratoCode: 'CT-2024-0018',
    data: '31/10/2026',
    vistoriador: 'Edson Moraes',
    corretor: 'Beatriz Souza',
    itensCount: 10,
    resultadoTexto: 'Manutenção ar-condicionado e elétrica',
    valorDesgaste: 1340,
    valorEmDisputa: 0,
    status: 'Enviado',
    assinado: true,
    confianca: 94,
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'laudo-palmeiras-88',
    tipo: 'Saída',
    imovelCode: 'IMV-220',
    imovel: 'Casa Jardim das Palmeiras 88',
    contratoCode: 'CT-2023-0220',
    data: '18/11/2026',
    vistoriador: 'Carla Reis',
    corretor: 'Rafael Costa',
    itensCount: 15,
    resultadoTexto: '14 sem alteração · 1 dano aceito (R$ 380)',
    valorDesgaste: 0,
    valorEmDisputa: 380,
    status: 'Assinado',
    assinado: true,
    confianca: 95,
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'laudo-moema-704',
    tipo: 'Entrada',
    imovelCode: 'IMV-704',
    imovel: 'Apto 704 Moema',
    contratoCode: 'CT-2026-0704',
    data: '14/11/2026',
    vistoriador: 'Edson Moraes',
    corretor: 'Beatriz Souza',
    itensCount: 14,
    resultadoTexto: 'Sem ressalvas · assinado digitalmente',
    valorDesgaste: 0,
    valorEmDisputa: 0,
    status: 'Assinado',
    assinado: true,
    confianca: 98,
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'laudo-pinheiros-112',
    tipo: 'Saída',
    imovelCode: 'IMV-112',
    imovel: 'Studio 112 Pinheiros',
    contratoCode: 'CT-2024-0112',
    data: '12/11/2026',
    vistoriador: 'Carla Reis',
    corretor: 'Rafael Costa',
    itensCount: 9,
    resultadoTexto: 'Sem alteração · chaves liberadas',
    valorDesgaste: 0,
    valorEmDisputa: 0,
    status: 'Enviado',
    assinado: true,
    confianca: 97,
    registeredBy: 'Registrado pelo agente',
  },
];

export const INITIAL_LAGO9_COMPARATOR_ITEMS: ComparatorItem[] = [
  {
    id: 'cmp-1',
    ordem: 1,
    comodo: 'Externo',
    itemNome: 'Fachada e portão',
    fotoEntradaLegenda: 'Foto 1 de 18 (Entrada 08/02/2023), Fachada',
    fotoSaidaLegenda: 'Foto 1 de 18 (Saída 19/11/2026), Fachada',
    estadoEntrada: 'Portão basculante funcionando, pintura íntegra',
    estadoSaida: 'Portão funcionando e pintura preservada',
    classificacao: 'Sem alteração',
    responsavelSugerido: 'Sem custo',
    custoEstimado: 0,
    confianca: 95,
    fonte: 'Foto 1 de 18 + vídeo de chegada',
  },
  {
    id: 'cmp-2',
    ordem: 2,
    comodo: 'Sala',
    itemNome: 'Sala piso',
    fotoEntradaLegenda: 'Foto 2 de 18 (Entrada), Sala piso',
    fotoSaidaLegenda: 'Foto 2 de 18 (Saída), Sala piso',
    estadoEntrada: 'Porcelanato acetinado sem trincas',
    estadoSaida: 'Porcelanato limpo, sem lascas ou manchas',
    classificacao: 'Sem alteração',
    responsavelSugerido: 'Sem custo',
    custoEstimado: 0,
    confianca: 96,
    fonte: 'Foto 2 de 18 + áudio do vistoriador',
  },
  {
    id: 'cmp-3',
    ordem: 3,
    comodo: 'Sala',
    itemNome: 'Sala paredes e teto',
    fotoEntradaLegenda: 'Foto 3 de 18 (Entrada), Sala paredes',
    fotoSaidaLegenda: 'Foto 3 de 18 (Saída), Sala paredes',
    estadoEntrada: 'Pintura látex branco gelo nova',
    estadoSaida: 'Desbotamento uniforme pelo sol após 45 meses de uso',
    classificacao: 'Desgaste natural',
    responsavelSugerido: 'Proprietário',
    custoEstimado: 880,
    confianca: 88,
    fonte: 'Foto 3 de 18 + áudio 01:12 do vistoriador',
  },
  {
    id: 'cmp-4',
    ordem: 4,
    comodo: 'Cozinha',
    itemNome: 'Cozinha pia e armários',
    fotoEntradaLegenda: 'Foto 4 de 18 (Entrada), Cozinha pia',
    fotoSaidaLegenda: 'Foto 4 de 18 (Saída), Cozinha pia',
    estadoEntrada: 'Bancada granito e 6 portas alinhadas',
    estadoSaida: 'Bancada e ferragens funcionando normalmente',
    classificacao: 'Sem alteração',
    responsavelSugerido: 'Sem custo',
    custoEstimado: 0,
    confianca: 93,
    fonte: 'Foto 4 de 18',
  },
  {
    id: 'cmp-5',
    ordem: 5,
    comodo: 'Cozinha',
    itemNome: 'Cozinha azulejos',
    fotoEntradaLegenda: 'Foto 5 de 18 (Entrada), Cozinha azulejos',
    fotoSaidaLegenda: 'Foto 5 de 18 (Saída), Cozinha azulejos',
    estadoEntrada: 'Revestimento branco íntegro',
    estadoSaida: 'Sem peças soltas ou quebradas',
    classificacao: 'Sem alteração',
    responsavelSugerido: 'Sem custo',
    custoEstimado: 0,
    confianca: 94,
    fonte: 'Foto 5 de 18',
  },
  {
    id: 'cmp-6',
    ordem: 6,
    comodo: 'Banheiro social',
    itemNome: 'Banheiro social',
    fotoEntradaLegenda: 'Foto 6 de 18 (Entrada), Banheiro social',
    fotoSaidaLegenda: 'Foto 6 de 18 (Saída), Banheiro social',
    estadoEntrada: 'Rejunte branco contínuo no box',
    estadoSaida: 'Desgaste natural de rejunte na área molhada',
    classificacao: 'Desgaste natural',
    responsavelSugerido: 'Proprietário',
    custoEstimado: 270,
    confianca: 86,
    fonte: 'Foto 6 de 18 + áudio 02:05 do vistoriador',
  },
  {
    id: 'cmp-7',
    ordem: 7,
    comodo: 'Suíte',
    itemNome: 'Suíte',
    fotoEntradaLegenda: 'Foto 7 de 18 (Entrada), Suíte',
    fotoSaidaLegenda: 'Foto 7 de 18 (Saída), Suíte',
    estadoEntrada: 'Parede lisa branca sem furos ou manchas',
    estadoSaida: 'Pintura com manchas escuras e 8 furos sem bucha',
    classificacao: 'Dano',
    responsavelSugerido: 'Inquilino',
    custoEstimado: 630,
    confianca: 91,
    fonte: 'Foto 7 de 18 + áudio 02:48 do vistoriador',
  },
  {
    id: 'cmp-8',
    ordem: 8,
    comodo: 'Quarto 2',
    itemNome: 'Quarto 2 paredes',
    fotoEntradaLegenda: 'Foto 8 de 18 (Entrada), Quarto 2 paredes',
    fotoSaidaLegenda: 'Foto 8 de 18 (Saída), Quarto 2 paredes',
    estadoEntrada: 'Parede branca limpa',
    estadoSaida: 'Riscos de caneta e adesivos removidos com descascamento',
    classificacao: 'Dano',
    responsavelSugerido: 'Inquilino',
    custoEstimado: 630,
    confianca: 92,
    fonte: 'Foto 8 de 18 + áudio 03:14 do vistoriador',
  },
  {
    id: 'cmp-9',
    ordem: 9,
    comodo: 'Quarto 2',
    itemNome: 'Quarto 2 janela e vidro',
    fotoEntradaLegenda: 'Foto 9 de 18 (Entrada), Quarto 2 janela',
    fotoSaidaLegenda: 'Foto 9 de 18 (Saída), Quarto 2 janela',
    estadoEntrada: 'Folha de vidro temperado 6 mm intacta',
    estadoSaida: 'Trinca diagonal no canto inferior direito do vidro',
    classificacao: 'Dano',
    responsavelSugerido: 'Inquilino',
    custoEstimado: 380,
    confianca: 94,
    fonte: 'Foto 9 de 18',
  },
  {
    id: 'cmp-10',
    ordem: 10,
    comodo: 'Quarto 3',
    itemNome: 'Quarto 3',
    fotoEntradaLegenda: 'Foto 10 de 18 (Entrada), Quarto 3',
    fotoSaidaLegenda: 'Foto 10 de 18 (Saída), Quarto 3',
    estadoEntrada: 'Piso laminado e pintura em bom estado',
    estadoSaida: 'Mantido sem alterações relevantes',
    classificacao: 'Sem alteração',
    responsavelSugerido: 'Sem custo',
    custoEstimado: 0,
    confianca: 92,
    fonte: 'Foto 10 de 18',
  },
  {
    id: 'cmp-11',
    ordem: 11,
    comodo: 'Área de serviço',
    itemNome: 'Área de serviço',
    fotoEntradaLegenda: 'Foto 11 de 18 (Entrada), Área de serviço',
    fotoSaidaLegenda: 'Foto 11 de 18 (Saída), Área de serviço',
    estadoEntrada: 'Tanque cerâmico e torneira funcionando',
    estadoSaida: 'Tanque e ponto de máquina intactos',
    classificacao: 'Sem alteração',
    responsavelSugerido: 'Sem custo',
    custoEstimado: 0,
    confianca: 93,
    fonte: 'Foto 11 de 18',
  },
  {
    id: 'cmp-12',
    ordem: 12,
    comodo: 'Quintal',
    itemNome: 'Quintal',
    fotoEntradaLegenda: 'Foto 12 de 18 (Entrada), Quintal',
    fotoSaidaLegenda: 'Foto 12 de 18 (Saída), Quintal',
    estadoEntrada: 'Piso antiderrapante limpo e ralo desobstruído',
    estadoSaida: 'Entregue limpo e sem danos',
    classificacao: 'Sem alteração',
    responsavelSugerido: 'Sem custo',
    custoEstimado: 0,
    confianca: 90,
    fonte: 'Foto 12 de 18',
  },
  {
    id: 'cmp-13',
    ordem: 13,
    comodo: 'Geral',
    itemNome: 'Portas e fechaduras',
    fotoEntradaLegenda: 'Foto 13 de 18 (Entrada), Portas',
    fotoSaidaLegenda: 'Foto 13 de 18 (Saída), Portas',
    estadoEntrada: '6 portas internas com trincos testados',
    estadoSaida: 'Todas as portas abrindo e fechando sem avaria',
    classificacao: 'Sem alteração',
    responsavelSugerido: 'Sem custo',
    custoEstimado: 0,
    confianca: 91,
    fonte: 'Foto 13 de 18 + vídeo',
  },
  {
    id: 'cmp-14',
    ordem: 14,
    comodo: 'Geral',
    itemNome: 'Instalação elétrica',
    fotoEntradaLegenda: 'Foto 14 de 18 (Entrada), Quadro elétrico',
    fotoSaidaLegenda: 'Foto 14 de 18 (Saída), Quadro elétrico',
    estadoEntrada: 'Tomadas, interruptores e disjuntores testados',
    estadoSaida: 'Circuito e disjuntores funcionando',
    classificacao: 'Sem alteração',
    responsavelSugerido: 'Sem custo',
    custoEstimado: 0,
    confianca: 89,
    fonte: 'Foto 14 de 18',
  },
  {
    id: 'cmp-15',
    ordem: 15,
    comodo: 'Geral',
    itemNome: 'Instalação hidráulica',
    fotoEntradaLegenda: 'Foto 15 de 18 (Entrada), Registros',
    fotoSaidaLegenda: 'Foto 15 de 18 (Saída), Registros',
    estadoEntrada: 'Sem vazamentos em pias e registros',
    estadoSaida: 'Pressão normal e sem vazamentos',
    classificacao: 'Sem alteração',
    responsavelSugerido: 'Sem custo',
    custoEstimado: 0,
    confianca: 91,
    fonte: 'Foto 15 de 18',
  },
  {
    id: 'cmp-16',
    ordem: 16,
    comodo: 'Recepção / Entrega',
    itemNome: 'Chaves, controles e medidores',
    fotoEntradaLegenda: 'Foto 16 de 18 (Entrada), 4 chaves + 2 controles',
    fotoSaidaLegenda: 'Foto 16 de 18 (Saída), 4 chaves + 1 controle visível na foto',
    estadoEntrada: '4 chaves + 2 controles do portão + leitura luz/água',
    estadoSaida: '4 chaves confirmadas; 2º controle citado no áudio, imagem cortada',
    classificacao: 'Sem alteração',
    responsavelSugerido: 'Sem custo',
    custoEstimado: 0,
    confianca: 76,
    fonte: 'Foto 16 de 18 + áudio 04:18 (confiança < 80%)',
    revisaoHumana: true,
  },
];

// ---------------------------------------------------------------------------
// ORÇAMENTOS E 12 FORNECEDORES HOMOLOGADOS
// ---------------------------------------------------------------------------

export const INITIAL_QUOTES: QuoteCase[] = [
  {
    id: 'orc-cedro-57',
    imovelCode: 'IMV-057',
    imovel: 'Casa Rua do Cedro 57',
    aluguelMensal: 2700,
    servico: 'Pintura e troca de piso pós-saída',
    protocolo: 'PED-2026-004833',
    orderId: 'ord-4833',
    valorPrincipal: 4180,
    fornecedorPrincipal: 'Reformas Alvorada',
    prazoDiasPrincipal: 9,
    emergencia: false,
    fornecedorHomologado: true,
    qtdOrcamentos: 2,
    autorizacaoProprietario: true,
    autorizacaoEvidencia: 'Autorização do proprietário Sérgio Valadares por e-mail em 21/11/2026',
    status: 'Aguardando Gestor',
    confianca: 93,
    recomendacaoAgente:
      'Reformas Alvorada: 2 dias a mais custam ≈ R$ 180,00 de aluguel parado, e a diferença de preço é R$ 440,00: o mais barato compensa.',
    corretor: 'Rafael Costa',
    registeredBy: 'Registrado pelo agente · 2 cotações PDF',
    propostas: [
      {
        id: 'prop-cedro-1',
        fornecedor: 'Reformas Alvorada',
        homologado: true,
        valor: 4180,
        prazoDias: 9,
        garantiaDias: 90,
        selecionado: true,
      },
      {
        id: 'prop-cedro-2',
        fornecedor: 'Reforma Fácil Leste',
        homologado: true,
        valor: 4620,
        prazoDias: 7,
        garantiaDias: 60,
      },
    ],
  },
  {
    id: 'orc-acacias-120',
    imovelCode: 'IMV-120',
    imovel: 'Casa Rua das Acácias 120',
    aluguelMensal: 3200,
    servico: 'Vazamento na cozinha (tubulação embutida)',
    protocolo: 'PED-2026-004809',
    orderId: 'ord-4809',
    valorPrincipal: 2350,
    fornecedorPrincipal: 'Hidráulica Souza',
    prazoDiasPrincipal: 1,
    emergencia: false,
    fornecedorHomologado: true,
    qtdOrcamentos: 2,
    autorizacaoProprietario: true,
    autorizacaoEvidencia: 'Autorização da proprietária Ivone Tavares por WhatsApp em 22/11/2026',
    status: 'Aguardando Gestor',
    confianca: 86,
    recomendacaoAgente:
      'Hidráulica Souza entrega menor valor (R$ 330,00 abaixo), prazo menor (1 dia) e garantia estendida de 90 dias.',
    corretor: 'Beatriz Souza',
    registeredBy: 'Registrado pelo agente · 2 cotações PDF',
    propostas: [
      {
        id: 'prop-acac-1',
        fornecedor: 'Hidráulica Souza',
        homologado: true,
        valor: 2350,
        prazoDias: 1,
        garantiaDias: 90,
        selecionado: true,
      },
      {
        id: 'prop-acac-2',
        fornecedor: 'Hidrotec Serviços',
        homologado: true,
        valor: 2680,
        prazoDias: 2,
        garantiaDias: 60,
      },
    ],
  },
  {
    id: 'orc-solar-504',
    imovelCode: 'IMV-504',
    imovel: 'Apto 504 Ed. Solar',
    aluguelMensal: 2600,
    servico: 'Vedação do box do banheiro',
    protocolo: 'PED-2026-004838',
    orderId: 'ord-4838',
    valorPrincipal: 1120,
    fornecedorPrincipal: 'Vidraçaria Central',
    prazoDiasPrincipal: 1,
    emergencia: false,
    fornecedorHomologado: true,
    qtdOrcamentos: 1,
    autorizacaoProprietario: false,
    autorizacaoEvidencia: 'Aguardando resposta da proprietária Marina Duarte (MAN-004 > R$ 800)',
    status: 'Aguardando proprietário',
    confianca: 81,
    recomendacaoAgente:
      'Abaixo de R$ 1.500 (FIN-011 autônomo após aceite), porém bloqueado na MAN-004 por superar R$ 800 sem autorização do dono.',
    corretor: 'Rafael Costa',
    registeredBy: 'Registrado pelo agente · 1 cotação PDF',
    propostas: [
      {
        id: 'prop-504-1',
        fornecedor: 'Vidraçaria Central',
        homologado: true,
        valor: 1120,
        prazoDias: 1,
        garantiaDias: 90,
        selecionado: true,
      },
    ],
  },
  {
    id: 'orc-solar-306',
    imovelCode: 'IMV-306',
    imovel: 'Apto 306 Ed. Solar',
    aluguelMensal: 1850,
    servico: 'Infiltração e impermeabilização do banheiro',
    protocolo: 'PED-2026-004837',
    orderId: 'ord-4837',
    valorPrincipal: 1920,
    fornecedorPrincipal: 'Em cotação (2 novos pedidos)',
    prazoDiasPrincipal: 4,
    emergencia: false,
    fornecedorHomologado: true,
    qtdOrcamentos: 1,
    autorizacaoProprietario: false,
    autorizacaoEvidencia: 'Solicitados 2 novos orçamentos após 9 dias sem retorno da Delta',
    status: 'Em cotação',
    confianca: 89,
    recomendacaoAgente:
      'Substituir Impermeabilizações Delta evita mais dias de vacância (≈ R$ 61,67/dia parado).',
    corretor: 'Rafael Costa',
    registeredBy: 'Registrado pelo agente',
    propostas: [
      {
        id: 'prop-306-1',
        fornecedor: 'Impermeabilizações Delta',
        homologado: true,
        valor: 1920,
        prazoDias: 11,
        garantiaDias: 60,
        selecionado: true,
      },
    ],
  },
  {
    id: 'orc-loja-7',
    imovelCode: 'IMV-407',
    imovel: 'Loja 7 Galeria Norte',
    aluguelMensal: 4400,
    servico: 'Contenção emergencial de curto-circuito no quadro',
    protocolo: 'PED-2026-004836',
    orderId: 'ord-4836',
    valorPrincipal: 1180,
    fornecedorPrincipal: 'Elétrica Voltmax (plantão 24h)',
    prazoDiasPrincipal: 1,
    emergencia: true,
    fornecedorHomologado: true,
    qtdOrcamentos: 1,
    autorizacaoProprietario: true,
    autorizacaoEvidencia: 'Contenção emergencial ≤ R$ 1.500 liberada com aviso imediato ao dono (MAN-004)',
    status: 'Aprovado',
    confianca: 97,
    recomendacaoAgente:
      'Contenção executada em plantão 24h conforme MAN-001/MAN-003/MAN-004.',
    corretor: 'Rafael Costa',
    registeredBy: 'Registrado pelo agente',
    propostas: [
      {
        id: 'prop-l7-1',
        fornecedor: 'Elétrica Voltmax (plantão 24h)',
        homologado: true,
        valor: 1180,
        prazoDias: 1,
        garantiaDias: 90,
        selecionado: true,
      },
    ],
  },
];

export const INITIAL_SUPPLIERS: SupplierItem[] = [
  {
    id: 'forn-1',
    nome: 'Hidráulica Souza',
    especialidade: 'Hidráulica',
    notaMedia: 4.6,
    prazoMedio: '1,4 dia',
    servicos90d: 12,
    retrabalhoPct: 4,
    documentosAte: '15/03/2027',
    situacao: 'Ativo',
    contatoMascarado: '(11) 9****-2210',
    cnpjOuMei: 'CNPJ 18.420.112/0001-44',
    confianca: 98,
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'forn-2',
    nome: 'Pinturas Norte',
    especialidade: 'Pintura',
    notaMedia: 4.4,
    prazoMedio: '6,1 dias',
    servicos90d: 9,
    retrabalhoPct: 5,
    documentosAte: '30/06/2027',
    situacao: 'Ativo',
    contatoMascarado: '(11) 9****-4418',
    cnpjOuMei: 'CNPJ 29.110.840/0001-09',
    confianca: 96,
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'forn-3',
    nome: 'Reformas Alvorada',
    especialidade: 'Reforma e acabamento',
    notaMedia: 4.5,
    prazoMedio: '8,7 dias',
    servicos90d: 7,
    retrabalhoPct: 3,
    documentosAte: '10/02/2027',
    situacao: 'Ativo',
    contatoMascarado: '(11) 9****-7120',
    cnpjOuMei: 'CNPJ 33.904.221/0001-12',
    confianca: 97,
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'forn-4',
    nome: 'Hidrotec Serviços',
    especialidade: 'Hidráulica',
    notaMedia: 4.1,
    prazoMedio: '2,1 dias',
    servicos90d: 6,
    retrabalhoPct: 8,
    documentosAte: '20/12/2026',
    situacao: 'Documento vencendo',
    alertaDetalhe: 'CND e apólice vencem em 28 dias',
    contatoMascarado: '(11) 9****-5902',
    cnpjOuMei: 'CNPJ 41.229.010/0001-35',
    confianca: 94,
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'forn-5',
    nome: 'Elétrica Voltmax (plantão 24h)',
    especialidade: 'Elétrica',
    notaMedia: 4.7,
    prazoMedio: '0,3 dia',
    servicos90d: 8,
    retrabalhoPct: 2,
    documentosAte: '18/12/2026',
    situacao: 'Documento vencendo',
    alertaDetalhe: 'Certificado NR-10 vence em 26 dias',
    contatoMascarado: '(11) 9****-0024',
    cnpjOuMei: 'CNPJ 22.874.331/0001-90',
    confianca: 99,
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'forn-6',
    nome: 'Impermeabilizações Delta',
    especialidade: 'Infiltração',
    notaMedia: 3.1,
    prazoMedio: '11 dias',
    servicos90d: 4,
    retrabalhoPct: 25,
    documentosAte: '05/05/2027',
    situacao: 'Em alerta',
    alertaDetalhe: 'Sem retorno há 9 dias no Apto 306 Ed. Solar',
    contatoMascarado: '(11) 9****-8301',
    cnpjOuMei: 'CNPJ 38.412.660/0001-71',
    confianca: 91,
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'forn-7',
    nome: 'Refrigeração Polar',
    especialidade: 'Ar-condicionado',
    notaMedia: 4.2,
    prazoMedio: '4,8 dias',
    servicos90d: 5,
    retrabalhoPct: 6,
    documentosAte: '12/08/2027',
    situacao: 'Ativo',
    contatoMascarado: '(11) 9****-1194',
    cnpjOuMei: 'CNPJ 19.770.512/0001-28',
    confianca: 95,
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'forn-8',
    nome: 'Chaveiro 24h',
    especialidade: 'Fechaduras',
    notaMedia: 4.0,
    prazoMedio: '1,1 dia',
    servicos90d: 7,
    retrabalhoPct: 9,
    documentosAte: '01/09/2027',
    situacao: 'Ativo',
    contatoMascarado: 'MEI · (11) 9****-6630',
    cnpjOuMei: 'MEI 44.198.204/0001-03',
    confianca: 92,
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'forn-9',
    nome: 'Vidraçaria Central',
    especialidade: 'Esquadrias e vidros',
    notaMedia: 4.5,
    prazoMedio: '2,2 dias',
    servicos90d: 6,
    retrabalhoPct: 3,
    documentosAte: '18/04/2027',
    situacao: 'Ativo',
    contatoMascarado: '(11) 9****-4821',
    cnpjOuMei: 'CNPJ 27.519.440/0001-82',
    confianca: 96,
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'forn-10',
    nome: 'Reforma Fácil Leste',
    especialidade: 'Reforma e acabamento',
    notaMedia: 4.3,
    prazoMedio: '6,8 dias',
    servicos90d: 5,
    retrabalhoPct: 6,
    documentosAte: '22/07/2027',
    situacao: 'Ativo',
    contatoMascarado: '(11) 9****-9102',
    cnpjOuMei: 'CNPJ 36.120.774/0001-66',
    confianca: 95,
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'forn-11',
    nome: 'TermoGás Paulista',
    especialidade: 'Aquecedores e gás',
    notaMedia: 4.6,
    prazoMedio: '1,8 dia',
    servicos90d: 4,
    retrabalhoPct: 2,
    documentosAte: '14/10/2027',
    situacao: 'Ativo',
    contatoMascarado: '(11) 9****-3044',
    cnpjOuMei: 'CNPJ 21.840.918/0001-55',
    confianca: 97,
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'forn-12',
    nome: 'Serralheria Paulista',
    especialidade: 'Esquadrias e portões',
    notaMedia: 4.2,
    prazoMedio: '3,9 dias',
    servicos90d: 4,
    retrabalhoPct: 5,
    documentosAte: '09/05/2027',
    situacao: 'Ativo',
    contatoMascarado: 'MEI · (11) 9****-7490',
    cnpjOuMei: 'MEI 48.301.119/0001-17',
    confianca: 93,
    registeredBy: 'Registrado pelo agente',
  },
];

// ---------------------------------------------------------------------------
// PRONTIDÃO PARA ALUGAR (7 IMÓVEIS PRESOS EM REPARO OU VISTORIA · R$ 18.250,00/mês)
// ---------------------------------------------------------------------------

export const INITIAL_READINESS_PROPERTIES: ReadinessProperty[] = [
  {
    id: 'pront-1',
    imovelCode: 'IMV-057',
    imovel: 'Casa Rua do Cedro 57',
    regiao: 'Zona Leste',
    aluguelPedido: 2700,
    etapa: 'Aguardando aprovação de orçamento',
    etapaIndex: 2,
    diasNaEtapa: 24,
    bloqueio: 'Orçamento R$ 4.180,00 aguarda Gestor (FIN-011)',
    proximoPassoAgente: 'Aprovar orçamento hoje → previsão 03/12/2026 se aprovado até 24/11',
    previsaoPronto: '03/12/2026',
    custoPrevisto: 4180,
    protocolo: 'PED-2026-004833',
    orderId: 'ord-4833',
    regraId: 'MAN-006',
    regraVersao: 1,
    prontoAnunciavel: false,
    corretor: 'Rafael Costa',
    checklist: {
      laudoSaidaAprovado: true,
      zeroOsAbertas: false,
      vistoriaFinalAprovada: false,
      limpezaConfirmada: false,
      chavesMedidoresRegistrados: true,
    },
  },
  {
    id: 'pront-2',
    imovelCode: 'IMV-306',
    imovel: 'Apto 306 Ed. Solar',
    regiao: 'Zona Norte',
    aluguelPedido: 1850,
    etapa: 'Fornecedor sem retorno',
    etapaIndex: 2,
    diasNaEtapa: 31,
    bloqueio: 'Impermeabilizações Delta sem retorno há 9 dias',
    proximoPassoAgente: '2 novos orçamentos pedidos (MAN-003 / MAN-006 > 20d)',
    previsaoPronto: '03/12/2026',
    custoPrevisto: 1920,
    protocolo: 'PED-2026-004837',
    orderId: 'ord-4837',
    regraId: 'MAN-006',
    regraVersao: 1,
    prontoAnunciavel: false,
    corretor: 'Rafael Costa',
    checklist: {
      laudoSaidaAprovado: true,
      zeroOsAbertas: false,
      vistoriaFinalAprovada: false,
      limpezaConfirmada: false,
      chavesMedidoresRegistrados: true,
    },
  },
  {
    id: 'pront-3',
    imovelCode: 'IMV-018',
    imovel: 'Sala 18 Ed. Central',
    regiao: 'Centro',
    aluguelPedido: 2050,
    etapa: 'Aguardando peça',
    etapaIndex: 4,
    diasNaEtapa: 22,
    bloqueio: 'Refrigeração Polar aguarda peça do fabricante',
    proximoPassoAgente: 'Acompanhar instalação com previsão 27/11/2026 e agendar vistoria final',
    previsaoPronto: '29/11/2026',
    custoPrevisto: 1340,
    protocolo: 'PED-2026-004819',
    regraId: 'MAN-006',
    regraVersao: 1,
    prontoAnunciavel: false,
    corretor: 'Beatriz Souza',
    checklist: {
      laudoSaidaAprovado: true,
      zeroOsAbertas: false,
      vistoriaFinalAprovada: false,
      limpezaConfirmada: true,
      chavesMedidoresRegistrados: true,
    },
  },
  {
    id: 'pront-4',
    imovelCode: 'IMV-710',
    imovel: 'Apto 710 Ed. Vila Verde',
    regiao: 'Zona Sul',
    aluguelPedido: 2400,
    etapa: 'Em execução atrasada',
    etapaIndex: 4,
    diasNaEtapa: 27,
    bloqueio: '12 dias além da meta de 15d (Pinturas Norte)',
    proximoPassoAgente: 'Cobrar conclusão da 2ª demão e executar vistoria final (> R$ 500)',
    previsaoPronto: '28/11/2026',
    custoPrevisto: 980,
    protocolo: 'PED-2026-004815',
    regraId: 'MAN-006',
    regraVersao: 1,
    prontoAnunciavel: false,
    corretor: 'Rafael Costa',
    checklist: {
      laudoSaidaAprovado: true,
      zeroOsAbertas: false,
      vistoriaFinalAprovada: false,
      limpezaConfirmada: false,
      chavesMedidoresRegistrados: true,
    },
  },
  {
    id: 'pront-5',
    imovelCode: 'IMV-018J',
    imovel: 'Casa Rua dos Jacarandás 18',
    regiao: 'Zona Sul',
    aluguelPedido: 3100,
    etapa: 'Vistoria de saída pendente',
    etapaIndex: 0,
    diasNaEtapa: 9,
    bloqueio: 'Chaves devolvidas em 13/11/2026 · atrasada desde 18/11',
    proximoPassoAgente: 'Vistoria agendada para 23/11 09:00 com Edson Moraes',
    previsaoPronto: '26/11/2026',
    custoPrevisto: 0,
    protocolo: 'PED-2026-004820',
    regraId: 'MAN-005',
    regraVersao: 2,
    prontoAnunciavel: false,
    corretor: 'Rafael Costa',
    checklist: {
      laudoSaidaAprovado: false,
      zeroOsAbertas: true,
      vistoriaFinalAprovada: true,
      limpezaConfirmada: false,
      chavesMedidoresRegistrados: false,
    },
  },
  {
    id: 'pront-6',
    imovelCode: 'IMV-214',
    imovel: 'Apto 214 Ed. Vila Verde',
    regiao: 'Zona Sul',
    aluguelPedido: 2250,
    etapa: 'Vistoria de saída pendente',
    etapaIndex: 0,
    diasNaEtapa: 6,
    bloqueio: 'Chaves devolvidas em 16/11/2026 · atrasada desde 19/11',
    proximoPassoAgente: 'Vistoria agendada para 23/11 14:00 com Carla Reis',
    previsaoPronto: '26/11/2026',
    custoPrevisto: 0,
    protocolo: 'PED-2026-004822',
    regraId: 'MAN-005',
    regraVersao: 2,
    prontoAnunciavel: false,
    corretor: 'Rafael Costa',
    checklist: {
      laudoSaidaAprovado: false,
      zeroOsAbertas: true,
      vistoriaFinalAprovada: true,
      limpezaConfirmada: false,
      chavesMedidoresRegistrados: false,
    },
  },
  {
    id: 'pront-7',
    imovelCode: 'IMV-409',
    imovel: 'Loja 9 Galeria Norte',
    regiao: 'Zona Norte',
    aluguelPedido: 3900,
    etapa: 'Vistoria de saída pendente',
    etapaIndex: 0,
    diasNaEtapa: 3,
    bloqueio: 'Chaves em 19/11/2026 · no prazo (MAN-005)',
    proximoPassoAgente: 'Vistoria agendada para 24/11 10:00 com Edson Moraes',
    previsaoPronto: '27/11/2026',
    custoPrevisto: 0,
    protocolo: 'PED-2026-004825',
    regraId: 'MAN-005',
    regraVersao: 2,
    prontoAnunciavel: false,
    corretor: 'Beatriz Souza',
    checklist: {
      laudoSaidaAprovado: false,
      zeroOsAbertas: true,
      vistoriaFinalAprovada: true,
      limpezaConfirmada: false,
      chavesMedidoresRegistrados: false,
    },
  },
];
