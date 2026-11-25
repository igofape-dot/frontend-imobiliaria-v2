import type { FinancePeriod, FinanceSemaphore } from './financeiroData';
import type { PolicyActionType, PolicyEvalParams } from './financeiroData';

export type ContratosTabId =
  | 'visao-geral'
  | 'contratos'
  | 'renovacoes-reajustes'
  | 'garantias'
  | 'rescisoes-juridico'
  | 'documentos-modelos'
  | 'definir-regras';

export type ContractType =
  | 'Locação residencial'
  | 'Locação comercial'
  | 'Administração'
  | 'Compra e venda';

export type GuaranteeType =
  | 'Caução'
  | 'Fiador'
  | 'Seguro fiança'
  | 'Título de capitalização'
  | 'Sem garantia válida'
  | 'Não aplicável';

export interface ContractExtractedClause {
  campo: string;
  valor: string;
  fonte: string;
  confianca: number;
  corrigidoPor?: string;
}

export interface ContractItem {
  id: string;
  numero: string;
  tipo: ContractType;
  imovel: string;
  imovelCode: string;
  locatario: string;
  locatarioCpfMask: string;
  locatarioCpfFull: string;
  locatarioRgMask: string;
  locatarioRgFull: string;
  proprietario: string;
  proprietarioBankMask: string;
  proprietarioBankFull: string;
  corretorResponsavel: string;
  aluguel: number;
  vigenciaInicio: string;
  vigenciaFim: string;
  diasParaVencimento: number;
  indice: 'IGP-M' | 'IPCA' | 'INPC' | 'N/A';
  garantiaTipo: GuaranteeType;
  garantiaValidade: string;
  status:
    | 'Ativo'
    | 'Em renovação'
    | 'Em rescisão'
    | 'Em cobrança jurídica'
    | 'Sem garantia válida';
  statusDetalhe: string;
  pendencias: string[];
  registeredBy: string;
  fonteArquivo: string;
  confiancaGeral: number;
  acaoJudicial?: boolean;
  clausulaAlterada?: boolean;
  regrasAplicaveis: { ruleId: string; versao: number }[];
  pedidosRelacionados: { orderId: string; protocol: string; resumo: string }[];
  clausulasChave: ContractExtractedClause[];
  timeline: { data: string; evento: string; ator: string }[];
  historicoReajustes: { competencia: string; indice: string; antes: number; depois: number }[];
  documentosAnexos: { nome: string; status: 'Validado' | 'Pendente' | 'Vencido'; fonte: string }[];
}

export interface ContratosKpiItem {
  id: string;
  title: string;
  value: string;
  comparisonPrev: string;
  comparisonTarget: string;
  semaphore: FinanceSemaphore;
  semaphoreLabel: string;
  semaphoreRule: string;
  registeredBy: string;
  sparkline: { label: string; v: number }[];
  agentReading: string;
  drawerColumns: [string, string, string, string];
  drawerRows: { col1: string; col2: string; col3: string; col4: string }[];
  pedirPrompt: string;
  pedirCategoria: 'Locação e contratos' | 'Jurídico e documentos';
  pedirSubtipo: string;
  pedirActionType: PolicyActionType;
  pedirEvalParams: PolicyEvalParams;
}

export interface ContratosAlertItem {
  id: string;
  titulo: string;
  detalhe: string;
  qtd: number;
  urgencia: 'critico' | 'atencao';
  targetTab: ContratosTabId;
  ruleId?: string;
}

export type RenewalStage =
  | 'Sem ação'
  | 'Em preparo'
  | 'Aguardando aprovação'
  | 'Enviada ao cliente'
  | 'Assinada';

export interface RenewalKanbanCard {
  id: string;
  contractNumber: string;
  locatario: string;
  imovel: string;
  corretorResponsavel: string;
  diasParaVencimento: number;
  vencimento: string;
  aluguelAtual: number;
  aluguelProposto: number;
  indice: 'IGP-M' | 'IPCA';
  percentualIndice: number;
  stage: RenewalStage;
  regras: { ruleId: string; versao: number }[];
  clausulaAlterada?: boolean;
  clausulaAlteradaTexto?: string;
  orderId?: string;
  orderProtocol?: string;
  inicioPrevistoPassou?: boolean;
}

export interface AnnualAdjustmentItem {
  id: string;
  contractNumber: string;
  locatario: string;
  imovel: string;
  corretorResponsavel: string;
  aluguelAtual: number;
  indice: 'IGP-M' | 'IPCA';
  percentual: number;
  aniversario: string;
  novoAluguel: number;
  status: 'A aplicar' | 'Sugestão gerada' | 'Aguardando conferência';
  fonte: string;
  confianca: number;
}

export interface ExpiringGuaranteeItem {
  id: string;
  contractNumber: string;
  imovel: string;
  locatario: string;
  corretorResponsavel: string;
  tipo: 'Seguro fiança' | 'Título de capitalização' | 'Sem garantia válida';
  vencimento: string;
  diasRestantes: number;
  situacaoJur010: 'Alerta enviado' | 'Sem resposta' | 'Troca proposta' | 'Descoberto';
  orderId?: string;
  orderProtocol?: string;
  fonte: string;
  confianca: number;
}

export interface RescissionItem {
  id: string;
  contractNumber: string;
  locatario: string;
  imovel: string;
  etapa:
    | 'Solicitada'
    | 'Calculada'
    | 'Aprovada'
    | 'Vistoria de saída'
    | 'Acerto financeiro'
    | 'Encerrada';
  aluguel: number;
  multaCalculada: number;
  motivoCalculo: string;
  impactoRepasse: string;
  impactoVacancia: string;
  orderId?: string;
  orderProtocol?: string;
  regraId: string;
  regraVersao: number;
  fonte: string;
  confianca: number;
}

export interface LegalCaseItem {
  id: string;
  contractNumber: string;
  locatario: string;
  imovel: string;
  valorRisco: number;
  diasAtraso: number;
  garantia: GuaranteeType;
  origem: string;
  statusJuridico: string;
  acaoJudicialIniciada: boolean;
  resumo: string; // max 400
  reguaPercorrida: string[];
  dossieItens: { item: string; status: 'Pronto' | 'Anexado' }[];
  andamentosAdvogado: { data: string; texto: string; fonte: string }[];
  proximoPrazo: string;
  advogadoExterno: string;
  cpfMask: string;
  cpfFull: string;
  regraId: string;
  regraVersao: number;
  conflitoFin014?: boolean;
}

export interface DocumentTriageItem {
  id: string;
  arquivo: string;
  origem: 'WhatsApp' | 'E-mail' | 'Upload de documentos';
  contratoRelacionado: string;
  tipoReconhecido: string;
  confianca: number;
  status: 'Pendente' | 'Baixa confiança' | 'Vencido' | 'Confirmado';
  fonte: string;
  camposExtraidos: { campo: string; valor: string; pagina: string }[];
}

export interface PendingSignatureItem {
  id: string;
  contractNumber: string;
  imovel: string;
  signatario: string;
  papel: 'Inquilino' | 'Proprietário' | 'Fiador';
  diasAguardando: number;
  provedor: string;
  ultimoLembrete: string;
}

export interface ApprovedTemplateItem {
  id: string;
  nome: string;
  versao: string;
  aprovadoPor: string;
  dataAprovacao: string;
  usos30d: number;
  observacao?: string;
}

export const CONTRATOS_KPIS_BY_PERIOD: Record<FinancePeriod, ContratosKpiItem[]> = {
  mes: [
    {
      id: 'ct-ativos',
      title: 'Contratos ativos',
      value: '384',
      comparisonPrev: 'de 412 imóveis (93,2%) · +4 no mês',
      comparisonTarget: 'semáforo herdado da vacância (GLO-003)',
      semaphore: 'ambar',
      semaphoreLabel: 'Atenção',
      semaphoreRule: 'Vacância 6,8% · GLO-003 (≤ 5%)',
      registeredBy: 'Registrado pelo agente, fonte: carteira_farina_nov.pdf, pág. 1',
      sparkline: [
        { label: 'Jul', v: 370 },
        { label: 'Ago', v: 374 },
        { label: 'Set', v: 378 },
        { label: 'Out', v: 380 },
        { label: 'Nov', v: 384 },
      ],
      agentReading:
        '384 contratos ativos representam 93,2% dos 412 imóveis administrados. O semáforo acompanha a regra global GLO-003 porque há 28 imóveis vagos (6,8% de vacância).',
      drawerColumns: ['Modalidade', 'Qtd', 'Aluguel médio', 'Participação'],
      drawerRows: [
        { col1: 'Locação residencial', col2: '296', col3: 'R$ 3.420,00', col4: '77,1%' },
        { col1: 'Locação comercial', col2: '68', col3: 'R$ 5.180,00', col4: '17,7%' },
        { col1: 'Administração / Venda', col2: '20', col3: 'R$ 2.850,00', col4: '5,2%' },
      ],
      pedirPrompt:
        'Gerar resumo da carteira de 384 contratos ativos cruzando os 28 imóveis vagos para priorizar renovações.',
      pedirCategoria: 'Locação e contratos',
      pedirSubtipo: 'Renovação',
      pedirActionType: 'preparar_renovacao',
      pedirEvalParams: { diasParaVencimento: 30 },
    },
    {
      id: 'ct-vencer-90',
      title: 'A vencer em 90 dias',
      value: '37',
      comparisonPrev: '8 até 30d · 14 (31–60d) · 15 (61–90d)',
      comparisonTarget: '8 sem ação iniciada (meta: 0)',
      semaphore: 'ambar',
      semaphoreLabel: 'Atenção',
      semaphoreRule: 'Regra: 0 verde · 1–10 âmbar · >10 vermelho',
      registeredBy: 'Registrado pelo agente, fonte: agenda_vencimentos_nov.xlsx, aba 1',
      sparkline: [
        { label: 'S1', v: 29 },
        { label: 'S2', v: 31 },
        { label: 'S3', v: 34 },
        { label: 'S4', v: 35 },
        { label: 'Atual', v: 37 },
      ],
      agentReading:
        'Há 37 contratos vencendo nos próximos 90 dias; 8 ainda estão sem ação iniciada (3 vencem em até 30 dias e já passaram do marco D-90 da regra JUR-002).',
      drawerColumns: ['Faixa', 'Total', 'Sem ação', 'Em andamento'],
      drawerRows: [
        { col1: 'Até 30 dias', col2: '8', col3: '3 (crítico)', col4: '5' },
        { col1: '31 a 60 dias', col2: '14', col3: '3', col4: '11' },
        { col1: '61 a 90 dias', col2: '15', col3: '2', col4: '13' },
      ],
      pedirPrompt:
        'Iniciar preparo de renovação pela JUR-002 para os 8 contratos sem ação iniciada nos próximos 90 dias.',
      pedirCategoria: 'Locação e contratos',
      pedirSubtipo: 'Renovação',
      pedirActionType: 'preparar_renovacao',
      pedirEvalParams: { diasParaVencimento: 28 },
    },
    {
      id: 'ct-taxa-renovacao',
      title: 'Taxa de renovação (12m)',
      value: '78%',
      comparisonPrev: '-2 p.p. vs. trimestre anterior',
      comparisonTarget: 'meta ≥ 80% (70–79% âmbar)',
      semaphore: 'ambar',
      semaphoreLabel: 'Atenção',
      semaphoreRule: 'Regra: ≥ 80% verde · 70–79% âmbar',
      registeredBy: 'Registrado pelo agente, fonte: historico_renovacoes_2026.pdf, pág. 2',
      sparkline: [
        { label: 'Jul', v: 82 },
        { label: 'Ago', v: 81 },
        { label: 'Set', v: 80 },
        { label: 'Out', v: 79 },
        { label: 'Nov', v: 78 },
      ],
      agentReading:
        'A taxa caiu para 78% por atrasos no início da negociação em contratos comerciais acima de R$ 4.000. Antecipar a etapa D-90 recupera ~4 pontos percentuais.',
      drawerColumns: ['Período', 'Vencidos', 'Renovados', 'Taxa'],
      drawerRows: [
        { col1: 'Set/2026', col2: '28', col3: '22', col4: '78,6%' },
        { col1: 'Out/2026', col2: '31', col3: '24', col4: '77,4%' },
        { col1: 'Nov/2026 (parcial)', col2: '23', col3: '18', col4: '78,3%' },
      ],
      pedirPrompt:
        'Analisar os motivos de não renovação dos últimos 90 dias e preparar plano de retenção pela JUR-002.',
      pedirCategoria: 'Locação e contratos',
      pedirSubtipo: 'Renovação',
      pedirActionType: 'preparar_renovacao',
      pedirEvalParams: { diasParaVencimento: 45 },
    },
    {
      id: 'ct-tempo-renovacao',
      title: 'Tempo médio de renovação',
      value: '11 dias',
      comparisonPrev: '-3 dias vs. mês anterior',
      comparisonTarget: 'meta ≤ 15 dias (início → assinatura)',
      semaphore: 'verde',
      semaphoreLabel: 'Saudável',
      semaphoreRule: 'Regra: ≤ 15 dias verde',
      registeredBy: 'Registrado pelo agente, fonte: trilha_pedidos_juridico.log, pág. 4',
      sparkline: [
        { label: 'Jul', v: 17 },
        { label: 'Ago', v: 15 },
        { label: 'Set', v: 14 },
        { label: 'Out', v: 12 },
        { label: 'Nov', v: 11 },
      ],
      agentReading:
        'O tempo do início ao aceite caiu para 11 dias graças ao preparo automático de minutas no D-90; o principal gargalo atual está nas aprovações de cláusulas alteradas.',
      drawerColumns: ['Etapa', 'Tempo médio', 'Responsável', 'Observação'],
      drawerRows: [
        { col1: 'Levantamento + minuta', col2: '1 dia', col3: 'Agente (JUR-002)', col4: 'Autônomo' },
        { col1: 'Aprovação interna', col2: '2 dias', col3: 'Gestor / Jurídico', col4: '8h ou 24h' },
        { col1: 'Assinatura das partes', col2: '8 dias', col3: 'Partes', col4: 'Lembretes 8h–19h' },
      ],
      pedirPrompt:
        'Enviar lembrete cordial aos signatários com minuta aguardando assinatura há mais de 3 dias.',
      pedirCategoria: 'Locação e contratos',
      pedirSubtipo: 'Renovação',
      pedirActionType: 'enviar_minuta',
      pedirEvalParams: { clausulaAlterada: false, modeloAprovado: true },
    },
    {
      id: 'ct-reajustes',
      title: 'Reajustes a aplicar',
      value: '11',
      comparisonPrev: '+3 vs. ciclo anterior',
      comparisonTarget: 'sem regra: o agente só sugere',
      semaphore: 'ambar',
      semaphoreLabel: 'Lacuna de regra',
      semaphoreRule: 'Sem regra ativa → modo sugerir',
      registeredBy: 'Registrado pelo agente, fonte: aniversario_contratos_dez26.pdf, pág. 1',
      sparkline: [
        { label: 'Ago', v: 7 },
        { label: 'Set', v: 9 },
        { label: 'Out', v: 8 },
        { label: 'Nov', v: 10 },
        { label: 'Dez', v: 11 },
      ],
      agentReading:
        '11 contratos fazem aniversário entre 01/12 e 20/12/2026 (IGP-M 4,2% e IPCA 3,9%). Como não há regra de alçada cadastrada para reajuste anual, o agente apenas calcula e sugere.',
      drawerColumns: ['Locatário', 'Imóvel', 'Índice', 'Novo aluguel'],
      drawerRows: [
        { col1: 'Ana Beatriz Torres', col2: 'Apto 12 Ed. Vila Verde', col3: 'IPCA 3,9%', col4: 'R$ 2.493,60' },
        { col1: 'Rodrigo Pires', col2: 'Sala 05 Ed. Central', col3: 'IGP-M 4,2%', col4: 'R$ 4.272,20' },
        { col1: 'Camila Ferraz', col2: 'Casa Rua das Acácias 98', col3: 'IGP-M 4,2%', col4: 'R$ 1.927,70' },
      ],
      pedirPrompt:
        'Calcular os 11 reajustes anuais de dezembro e preparar avisos para conferência humana antes de enviar.',
      pedirCategoria: 'Locação e contratos',
      pedirSubtipo: 'Reajuste anual',
      pedirActionType: 'reajuste_anual',
      pedirEvalParams: {},
    },
    {
      id: 'ct-garantias-60',
      title: 'Garantias vencendo em 60d',
      value: '9',
      comparisonPrev: '2 sem garantia válida',
      comparisonTarget: 'meta: 0 contratos descobertos',
      semaphore: 'vermelho',
      semaphoreLabel: 'Crítico',
      semaphoreRule: 'Qualquer contrato sem garantia válida = vermelho',
      registeredBy: 'Registrado pelo agente, fonte: apolices_seguro_fianca.pdf, pág. 3',
      sparkline: [
        { label: 'S1', v: 5 },
        { label: 'S2', v: 6 },
        { label: 'S3', v: 7 },
        { label: 'S4', v: 8 },
        { label: 'Atual', v: 9 },
      ],
      agentReading:
        '9 garantias vencem nos próximos 60 dias (6 seguros fiança e 3 títulos) e 2 contratos estão sem garantia válida. A regra JUR-010 dispara alertas automáticos em D-60.',
      drawerColumns: ['Contrato', 'Locatário', 'Tipo', 'Situação'],
      drawerRows: [
        { col1: 'CT-2024-0311', col2: 'Gustavo Reis (Loja 8)', col3: 'Seguro fiança', col4: 'Vence 02/12/2026' },
        { col1: 'CT-2023-0874', col2: 'Marina Cavalcanti', col3: 'Seguro fiança', col4: 'Troca p/ Fiador (4828)' },
        { col1: 'CT-2022-0190', col2: 'Sérgio Monteiro', col3: 'Sem garantia válida', col4: 'Apólice expirada' },
      ],
      pedirPrompt:
        'Solicitar renovação imediata para as 9 garantias vencendo em 60 dias e regularizar os 2 contratos descobertos.',
      pedirCategoria: 'Locação e contratos',
      pedirSubtipo: 'Garantia locatícia',
      pedirActionType: 'alerta_garantia',
      pedirEvalParams: { diasParaVencimentoGarantia: 26 },
    },
    {
      id: 'ct-pendencias-doc',
      title: 'Pendências docs e assinaturas',
      value: '14 / 6',
      comparisonPrev: '14 documentos · 6 assinaturas (+3d)',
      comparisonTarget: '4 extrações abaixo de 85%',
      semaphore: 'ambar',
      semaphoreLabel: 'Atenção',
      semaphoreRule: 'Regra JUR-013: confiança ≥ 85%',
      registeredBy: 'Registrado pelo agente, fonte: fila_upload_entradas.log, pág. 1',
      sparkline: [
        { label: 'S1', v: 24 },
        { label: 'S2', v: 22 },
        { label: 'S3', v: 19 },
        { label: 'S4', v: 21 },
        { label: 'Atual', v: 20 },
      ],
      agentReading:
        '14 documentos aguardam conferência ou envio (4 com confiança de leitura < 85% pela JUR-013) e 6 envelopes estão parados para assinatura há mais de 3 dias.',
      drawerColumns: ['Pendência', 'Quantidade', 'Regra', 'Ação sugerida'],
      drawerRows: [
        { col1: 'Extração < 85% confiança', col2: '4 arquivos', col3: 'JUR-013 v3', col4: 'Triagem humana' },
        { col1: 'Docs obrigatórios faltantes', col2: '7 contratos', col3: 'JUR-013 v3', col4: 'Pedir ao cliente' },
        { col1: 'Assinaturas paradas (>3d)', col2: '6 envelopes', col3: 'FIN-020 8h–19h', col4: 'Lembrar signatário' },
      ],
      pedirPrompt:
        'Cobrar documentos obrigatórios faltantes pela JUR-013 e enviar lembretes de assinatura pendentes na janela 8h–19h.',
      pedirCategoria: 'Jurídico e documentos',
      pedirSubtipo: 'Análise documental',
      pedirActionType: 'documento',
      pedirEvalParams: { documentoFaltando: true },
    },
    {
      id: 'ct-juridicos',
      title: 'Casos jurídicos abertos',
      value: '3',
      comparisonPrev: 'R$ 19.910,50 em risco · +3 rescisões',
      comparisonTarget: 'dossiês prontos · barreira JUR-001',
      semaphore: 'ambar',
      semaphoreLabel: 'Em curso',
      semaphoreRule: 'Regra JUR-001: advogado externo age',
      registeredBy: 'Registrado pelo agente, fonte: repasse_financeiro_d30.log, pág. 2',
      sparkline: [
        { label: 'Jul', v: 2 },
        { label: 'Ago', v: 2 },
        { label: 'Set', v: 4 },
        { label: 'Out', v: 3 },
        { label: 'Nov', v: 3 },
      ],
      agentReading:
        'Os 3 casos em D+30 vieram automaticamente da régua financeira FIN-020, totalizando R$ 19.910,50. Fernando Costa tem ação judicial ativa e aciona conflito JUR-007 × FIN-014.',
      drawerColumns: ['Locatário', 'Imóvel', 'Risco', 'Situação'],
      drawerRows: [
        { col1: 'Ricardo Alves', col2: 'Sala 1204 Ed. Central', col3: 'R$ 9.640,00', col4: 'D+41 · Dossiê pronto' },
        { col1: 'Patrícia Lima', col2: 'Casa R. Palmeiras 85', col3: 'R$ 7.120,50', col4: 'D+33 · Dossiê pronto' },
        { col1: 'Fernando Costa', col2: 'Apto 101 Ed. Solar', col3: 'R$ 3.150,00', col4: 'Ação judicial iniciada' },
      ],
      pedirPrompt:
        'Atualizar e consolidar os dossiês completos dos 3 casos jurídicos abertos para envio ao advogado externo.',
      pedirCategoria: 'Jurídico e documentos',
      pedirSubtipo: 'Análise documental',
      pedirActionType: 'montar_dossie',
      pedirEvalParams: {},
    },
  ],
  '30d': [],
  '12m': [],
};

// Reuse base data with period variations for 30d and 12m
CONTRATOS_KPIS_BY_PERIOD['30d'] = CONTRATOS_KPIS_BY_PERIOD.mes.map((item) =>
  item.id === 'ct-taxa-renovacao'
    ? { ...item, value: '79%', comparisonPrev: 'últimos 30 dias fechados' }
    : item
);
CONTRATOS_KPIS_BY_PERIOD['12m'] = CONTRATOS_KPIS_BY_PERIOD.mes.map((item) =>
  item.id === 'ct-taxa-renovacao'
    ? { ...item, value: '78%', comparisonPrev: 'média móvel 12 meses (284 de 364)' }
    : item.id === 'ct-tempo-renovacao'
    ? { ...item, value: '12 dias', comparisonPrev: 'média anual ≤ 15 dias' }
    : item
);

export const ALUGUEL_MENSAL_RENOVACAO_CARD = {
  valorMensal: 83250,
  contratosQtd: 37,
  taxaAdmEmJogo: 7492.5,
  selo: 'estimativa',
};

export const CONTRATOS_ALERTS: ContratosAlertItem[] = [
  {
    id: 'calt-1',
    titulo: '3 contratos vencem em até 30 dias sem ação iniciada',
    detalhe: 'Início previsto pela JUR-002 (D-90) já passou · risco direto de vacância.',
    qtd: 3,
    urgencia: 'critico',
    targetTab: 'renovacoes-reajustes',
    ruleId: 'JUR-002',
  },
  {
    id: 'calt-2',
    titulo: '11 reajustes anuais a aplicar',
    detalhe: 'Lacuna de regra: agente calcula e sugere IGP-M/IPCA para conferência.',
    qtd: 11,
    urgencia: 'atencao',
    targetTab: 'renovacoes-reajustes',
  },
  {
    id: 'calt-3',
    titulo: '9 garantias vencem em 60 dias (2 sem garantia válida)',
    detalhe: '6 seguros fiança e 3 títulos · 2 contratos com cobertura expirada.',
    qtd: 9,
    urgencia: 'critico',
    targetTab: 'garantias',
    ruleId: 'JUR-010',
  },
  {
    id: 'calt-4',
    titulo: '6 assinaturas pendentes há mais de 3 dias',
    detalhe: 'Lembrete automático respeita janela 8h–19h · provedor a definir.',
    qtd: 6,
    urgencia: 'atencao',
    targetTab: 'documentos-modelos',
  },
  {
    id: 'calt-5',
    titulo: '14 documentos pendentes na fila de triagem',
    detalhe: '4 com confiança de extração abaixo de 85% (JUR-013).',
    qtd: 14,
    urgencia: 'atencao',
    targetTab: 'documentos-modelos',
    ruleId: 'JUR-013',
  },
  {
    id: 'calt-6',
    titulo: '3 casos jurídicos vindos do D+30 (Financeiro)',
    detalhe: 'Total de R$ 19.910,50 em risco · dossiês montados para advogado.',
    qtd: 3,
    urgencia: 'critico',
    targetTab: 'rescisoes-juridico',
    ruleId: 'JUR-001',
  },
  {
    id: 'calt-7',
    titulo: '1 conflito de regras ativo (JUR-007 × FIN-014)',
    detalhe: 'Contratos com ação judicial exigem aprovação do Jurídico (mais restritiva).',
    qtd: 1,
    urgencia: 'atencao',
    targetTab: 'definir-regras',
    ruleId: 'JUR-007',
  },
];

export const RENEWAL_FUNNEL_37 = [
  { etapa: 'Sem ação', qtd: 8, trava: true, nota: 'Etapa que mais trava · 3 vencem ≤ 30d' },
  { etapa: 'Em preparo', qtd: 11, trava: false, nota: 'Levantamento e minuta em rascunho' },
  { etapa: 'Aguardando aprovação', qtd: 5, trava: false, nota: 'Gestor (8h) ou Jurídico (24h)' },
  { etapa: 'Enviada ao cliente', qtd: 9, trava: false, nota: 'Aguardando assinatura' },
  { etapa: 'Assinada', qtd: 4, trava: false, nota: 'Concluídas nesta janela' },
];

export const EXPIRATIONS_90D_BUCKETS = [
  { faixa: 'Até 30 dias', qtd: 8, semAcao: 3 },
  { faixa: '31 a 60 dias', qtd: 14, semAcao: 3 },
  { faixa: '61 a 90 dias', qtd: 15, semAcao: 2 },
];

export const MODULE_AUTONOMY_MAP = {
  autonomo: [
    { acao: 'Levantar dados do contrato em D-90', ruleId: 'JUR-002', versao: 4 },
    { acao: 'Calcular reajuste (sugestão)', ruleId: 'JUR-002', versao: 4 },
    { acao: 'Gerar minuta em rascunho', ruleId: 'JUR-002', versao: 4 },
    { acao: 'Alertar garantia vencendo (D-60)', ruleId: 'JUR-010', versao: 2 },
    { acao: 'Pedir documento obrigatório ao cliente', ruleId: 'JUR-013', versao: 3 },
    { acao: 'Extrair dados de PDF (≥ 85%)', ruleId: 'JUR-013', versao: 3 },
    { acao: 'Montar dossiê para o advogado', ruleId: 'JUR-001', versao: 1 },
  ],
  aprovacao: [
    { acao: 'Enviar minuta ao cliente (Gestor, 8h)', ruleId: 'JUR-002', versao: 4 },
    { acao: 'Cláusula alterada (Jurídico, 24h)', ruleId: 'JUR-005', versao: 2 },
    { acao: 'Rescisão de contrato (Jurídico, 24h)', ruleId: 'JUR-007', versao: 1 },
    { acao: 'Troca de garantia (Jurídico, 24h)', ruleId: 'JUR-010', versao: 2 },
  ],
  bloqueado: [
    { acao: 'Enviar notificação extrajudicial', ruleId: 'JUR-001', versao: 1 },
    { acao: 'Ajuizar ação de despejo', ruleId: 'JUR-001', versao: 1 },
  ],
};

// Helper to mask PII cleanly while keeping revealable original for audit trail
export const INITIAL_CONTRACTS: ContractItem[] = [
  {
    id: 'ct-1',
    numero: 'CT-2024-0187',
    tipo: 'Locação residencial',
    imovel: 'Apto 302 · Ed. Vista Verde',
    imovelCode: 'IMV-302',
    locatario: 'Carlos Mendes',
    locatarioCpfMask: '***.456.789-**',
    locatarioCpfFull: '312.456.789-04',
    locatarioRgMask: '**.345.678-*',
    locatarioRgFull: '41.345.678-2',
    proprietario: 'João Batista',
    proprietarioBankMask: 'Itaú · Ag **** · Cc *****-9',
    proprietarioBankFull: 'Itaú (341) · Ag 0412 · Cc 28914-9',
    corretorResponsavel: 'Rafael Costa',
    aluguel: 3200,
    vigenciaInicio: '21/06/2024',
    vigenciaFim: '20/12/2026',
    diasParaVencimento: 28,
    indice: 'IGP-M',
    garantiaTipo: 'Fiador',
    garantiaValidade: 'Vigência do contrato (20/12/2026)',
    status: 'Em renovação',
    statusDetalhe: 'Em renovação · minuta aguardando Gestor',
    pendencias: ['Aprovação Gestor (PED-2026-004812)'],
    registeredBy: 'Registrado pelo agente, fonte: CT-2024-0187.pdf, pág. 1',
    fonteArquivo: 'CT-2024-0187.pdf',
    confiancaGeral: 96,
    regrasAplicaveis: [{ ruleId: 'JUR-002', versao: 4 }],
    pedidosRelacionados: [
      { orderId: 'ord-4812', protocol: 'PED-2026-004812', resumo: 'Enviar minuta de renovação (R$ 3.334,40)' },
    ],
    clausulasChave: [
      { campo: 'Valor mensal', valor: 'R$ 3.200,00', fonte: 'CT-2024-0187.pdf, pág. 2', confianca: 98 },
      { campo: 'Prazo', valor: '30 meses (21/06/2024 a 20/12/2026)', fonte: 'CT-2024-0187.pdf, pág. 1', confianca: 97 },
      { campo: 'Índice de reajuste', valor: 'IGP-M (FGV) anual', fonte: 'CT-2024-0187.pdf, pág. 3', confianca: 96 },
      { campo: 'Multa rescisória', valor: '3 aluguéis proporcionais', fonte: 'CT-2024-0187.pdf, pág. 5', confianca: 95 },
      { campo: 'Garantia', valor: 'Fiador com imóvel quitado', fonte: 'CT-2024-0187.pdf, pág. 6', confianca: 94 },
    ],
    timeline: [
      { data: '22/11/2026 10:16', evento: 'Minuta gerada sem alterações (R$ 3.334,40) e enviada para aprovação', ator: 'Agente (JUR-002 v4)' },
      { data: '22/11/2026 10:14', evento: 'Proprietário João Batista solicitou renovação via WhatsApp', ator: 'WhatsApp' },
      { data: '21/06/2025', evento: 'Reajuste anual IGP-M aplicado (+3,6%)', ator: 'Agente' },
    ],
    historicoReajustes: [
      { competencia: 'Jun/2025', indice: 'IGP-M 3,6%', antes: 3088.8, depois: 3200 },
    ],
    documentosAnexos: [
      { nome: 'CT-2024-0187_assinado.pdf', status: 'Validado', fonte: 'Upload inicial, pág. 1–8' },
      { nome: 'Matricula_Fiador_2024.pdf', status: 'Validado', fonte: 'E-mail, pág. 1–2' },
    ],
  },
  {
    id: 'ct-2',
    numero: 'CT-2023-0412',
    tipo: 'Locação comercial',
    imovel: 'Loja 3 · Galeria Norte',
    imovelCode: 'IMV-412',
    locatario: 'Marcos Teixeira',
    locatarioCpfMask: '***.814.205-**',
    locatarioCpfFull: '284.814.205-19',
    locatarioRgMask: '**.190.442-*',
    locatarioRgFull: '33.190.442-8',
    proprietario: 'Marta Siqueira',
    proprietarioBankMask: 'Bradesco · Ag **** · Cc *****-2',
    proprietarioBankFull: 'Bradesco (237) · Ag 1904 · Cc 11402-2',
    corretorResponsavel: 'Carla Nogueira',
    aluguel: 4200,
    vigenciaInicio: '15/03/2023',
    vigenciaFim: '14/03/2027',
    diasParaVencimento: 112,
    indice: 'IPCA',
    garantiaTipo: 'Seguro fiança',
    garantiaValidade: 'Apólice válida até 15/03/2027',
    status: 'Ativo',
    statusDetalhe: 'Vigente, inadimplente 18 dias',
    pendencias: ['Notificação D+15 pendente (PED-2026-004825)'],
    registeredBy: 'Registrado pelo agente, fonte: CT-2023-0412.pdf, pág. 1',
    fonteArquivo: 'CT-2023-0412.pdf',
    confiancaGeral: 95,
    regrasAplicaveis: [{ ruleId: 'FIN-020', versao: 2 }],
    pedidosRelacionados: [
      { orderId: 'ord-4825', protocol: 'PED-2026-004825', resumo: 'Notificação formal D+15 (R$ 4.200,00)' },
    ],
    clausulasChave: [
      { campo: 'Valor mensal', valor: 'R$ 4.200,00', fonte: 'CT-2023-0412.pdf, pág. 2', confianca: 97 },
      { campo: 'Prazo', valor: '48 meses (15/03/2023 a 14/03/2027)', fonte: 'CT-2023-0412.pdf, pág. 1', confianca: 96 },
      { campo: 'Índice de reajuste', valor: 'IPCA (IBGE) anual', fonte: 'CT-2023-0412.pdf, pág. 3', confianca: 95 },
      { campo: 'Multa rescisória', valor: '3 aluguéis proporcionais', fonte: 'CT-2023-0412.pdf, pág. 5', confianca: 94 },
      { campo: 'Garantia', valor: 'Seguro fiança Porto Seguro #88412', fonte: 'apolice_88412.pdf, pág. 1', confianca: 96 },
    ],
    timeline: [
      { data: '22/11/2026 13:48', evento: 'Alcançou D+15 na régua FIN-020 — notificação aguardando aprovação', ator: 'Agente (FIN-020)' },
      { data: '09/11/2026', evento: 'E-mail formal D+5 enviado ao locatário', ator: 'Agente' },
    ],
    historicoReajustes: [
      { competencia: 'Mar/2026', indice: 'IPCA 4,1%', antes: 4034.58, depois: 4200 },
    ],
    documentosAnexos: [
      { nome: 'CT-2023-0412_comercial.pdf', status: 'Validado', fonte: 'Upload inicial, pág. 1–10' },
      { nome: 'Contrato_Social_Loja3.pdf', status: 'Validado', fonte: 'E-mail, pág. 1–4' },
    ],
  },
  {
    id: 'ct-3',
    numero: 'CT-2024-0055',
    tipo: 'Locação residencial',
    imovel: 'Apto 101 · Ed. Solar',
    imovelCode: 'IMV-101',
    locatario: 'Fernando Costa',
    locatarioCpfMask: '***.612.904-**',
    locatarioCpfFull: '198.612.904-55',
    locatarioRgMask: '**.701.883-*',
    locatarioRgFull: '29.701.883-5',
    proprietario: 'Helena Vasconcelos',
    proprietarioBankMask: 'Santander · Ag **** · Cc *****-4',
    proprietarioBankFull: 'Santander (033) · Ag 3301 · Cc 01948-4',
    corretorResponsavel: 'Rafael Costa',
    aluguel: 2950,
    vigenciaInicio: '01/02/2024',
    vigenciaFim: '31/01/2027',
    diasParaVencimento: 70,
    indice: 'IGP-M',
    garantiaTipo: 'Fiador',
    garantiaValidade: 'Fiador solidário (execução em curso)',
    status: 'Em cobrança jurídica',
    statusDetalhe: 'Em cobrança jurídica (ação judicial iniciada)',
    pendencias: ['Ação judicial ativa (conflito JUR-007 × FIN-014)'],
    registeredBy: 'Registrado pelo agente, fonte: CT-2024-0055.pdf, pág. 1',
    fonteArquivo: 'CT-2024-0055.pdf',
    confiancaGeral: 94,
    acaoJudicial: true,
    regrasAplicaveis: [
      { ruleId: 'JUR-007', versao: 1 },
      { ruleId: 'FIN-014', versao: 3 },
      { ruleId: 'JUR-001', versao: 1 },
    ],
    pedidosRelacionados: [
      { orderId: 'ord-4803', protocol: 'PED-2026-004803', resumo: 'Escalonamento D+30 com ação judicial' },
    ],
    clausulasChave: [
      { campo: 'Valor mensal', valor: 'R$ 2.950,00', fonte: 'CT-2024-0055.pdf, pág. 2', confianca: 98 },
      { campo: 'Prazo', valor: '36 meses (01/02/2024 a 31/01/2027)', fonte: 'CT-2024-0055.pdf, pág. 1', confianca: 97 },
      { campo: 'Índice de reajuste', valor: 'IGP-M anual', fonte: 'CT-2024-0055.pdf, pág. 3', confianca: 95 },
      { campo: 'Multa rescisória', valor: '3 aluguéis proporcionais', fonte: 'CT-2024-0055.pdf, pág. 5', confianca: 93 },
      { campo: 'Garantia', valor: 'Fiador · matrícula #44.120', fonte: 'CT-2024-0055.pdf, pág. 7', confianca: 92 },
    ],
    timeline: [
      { data: '14/11/2026', evento: 'Petição inicial protocolada (registrado de e-mail do advogado)', ator: 'Dr. Eduardo Prado (Adv.)' },
      { data: '22/10/2026', evento: 'D+30 atingido na régua FIN-020; dossiê montado pelo agente', ator: 'Agente (JUR-001)' },
    ],
    historicoReajustes: [
      { competencia: 'Fev/2026', indice: 'IGP-M 3,8%', antes: 2842, depois: 2950 },
    ],
    documentosAnexos: [
      { nome: 'Peticao_Inicial_Apto101.pdf', status: 'Validado', fonte: 'E-mail advogado, pág. 1–14' },
      { nome: 'Dossie_Completo_CT20240055.pdf', status: 'Validado', fonte: 'Montado pelo agente' },
    ],
  },
  {
    id: 'ct-4',
    numero: 'CT-2025-0098',
    tipo: 'Locação residencial',
    imovel: 'Apto 405 · Ed. Vila Verde',
    imovelCode: 'IMV-405',
    locatario: 'Beatriz Moura',
    locatarioCpfMask: '***.301.442-**',
    locatarioCpfFull: '405.301.442-11',
    locatarioRgMask: '**.812.119-*',
    locatarioRgFull: '44.812.119-0',
    proprietario: 'André Albuquerque',
    proprietarioBankMask: 'Banco do Brasil · Ag **** · Cc *****-1',
    proprietarioBankFull: 'Banco do Brasil (001) · Ag 2210 · Cc 49201-1',
    corretorResponsavel: 'Carla Nogueira',
    aluguel: 1920,
    vigenciaInicio: '01/04/2025',
    vigenciaFim: '31/03/2027',
    diasParaVencimento: 129,
    indice: 'IPCA',
    garantiaTipo: 'Caução',
    garantiaValidade: 'Caução depositada (R$ 5.760,00)',
    status: 'Em rescisão',
    statusDetalhe: 'Em rescisão · Calculada (aguardando Jurídico)',
    pendencias: ['Aprovação rescisão (PED-2026-004827)'],
    registeredBy: 'Registrado pelo agente, fonte: CT-2025-0098.pdf, pág. 1',
    fonteArquivo: 'CT-2025-0098.pdf',
    confiancaGeral: 95,
    regrasAplicaveis: [{ ruleId: 'JUR-007', versao: 1 }],
    pedidosRelacionados: [
      { orderId: 'ord-4827', protocol: 'PED-2026-004827', resumo: 'Rescisão antecipada (multa R$ 1.920,00)' },
    ],
    clausulasChave: [
      { campo: 'Valor mensal', valor: 'R$ 1.920,00', fonte: 'CT-2025-0098.pdf, pág. 2', confianca: 98 },
      { campo: 'Prazo', valor: '24 meses (01/04/2025 a 31/03/2027)', fonte: 'CT-2025-0098.pdf, pág. 1', confianca: 96 },
      { campo: 'Índice de reajuste', valor: 'IPCA anual', fonte: 'CT-2025-0098.pdf, pág. 3', confianca: 95 },
      { campo: 'Multa rescisória', valor: '3 aluguéis proporcionais ao tempo restante', fonte: 'CT-2025-0098.pdf, pág. 4', confianca: 93 },
      { campo: 'Garantia', valor: 'Caução 3 meses em conta vinculada', fonte: 'CT-2025-0098.pdf, pág. 5', confianca: 95 },
    ],
    timeline: [
      { data: '22/11/2026 13:12', evento: 'Multa proporcional calculada (R$ 1.920,00) e enviada ao Jurídico', ator: 'Agente (JUR-007)' },
      { data: '22/11/2026 13:10', evento: 'Beatriz Moura solicitou rescisão via WhatsApp', ator: 'WhatsApp' },
    ],
    historicoReajustes: [],
    documentosAnexos: [
      { nome: 'CT-2025-0098.pdf', status: 'Validado', fonte: 'Upload inicial, pág. 1–7' },
      { nome: 'Termo_Rescisao_Rascunho.pdf', status: 'Pendente', fonte: 'Gerado pelo agente' },
    ],
  },
  {
    id: 'ct-5',
    numero: 'CT-2024-0241',
    tipo: 'Locação residencial',
    imovel: 'Casa Rua dos Ipês, 44',
    imovelCode: 'IMV-044',
    locatario: 'Daniel Freitas',
    locatarioCpfMask: '***.778.120-**',
    locatarioCpfFull: '351.778.120-88',
    locatarioRgMask: '**.410.902-*',
    locatarioRgFull: '38.410.902-1',
    proprietario: 'Sônia Maria Ribeiro',
    proprietarioBankMask: 'Nubank · Ag **** · Cc *****-7',
    proprietarioBankFull: 'Nu Pagamentos (260) · Ag 0001 · Cc 841209-7',
    corretorResponsavel: 'Rafael Costa',
    aluguel: 3850,
    vigenciaInicio: '15/01/2024',
    vigenciaFim: '14/01/2027',
    diasParaVencimento: 53,
    indice: 'IGP-M',
    garantiaTipo: 'Caução',
    garantiaValidade: 'Caução depositada (R$ 11.550,00)',
    status: 'Em renovação',
    statusDetalhe: 'Renovação com cláusula alterada',
    pendencias: ['Parecer Jurídico cláusula 8ª (PED-2026-004826)'],
    registeredBy: 'Registrado pelo agente, fonte: CT-2024-0241.pdf, pág. 1',
    fonteArquivo: 'CT-2024-0241.pdf',
    confiancaGeral: 93,
    clausulaAlterada: true,
    regrasAplicaveis: [
      { ruleId: 'JUR-005', versao: 2 },
      { ruleId: 'JUR-002', versao: 4 },
    ],
    pedidosRelacionados: [
      { orderId: 'ord-4826', protocol: 'PED-2026-004826', resumo: 'Alteração cláusula 8ª (5 → 10 dias úteis)' },
    ],
    clausulasChave: [
      { campo: 'Valor mensal', valor: 'R$ 3.850,00', fonte: 'CT-2024-0241.pdf, pág. 2', confianca: 97 },
      { campo: 'Prazo', valor: '36 meses (15/01/2024 a 14/01/2027)', fonte: 'CT-2024-0241.pdf, pág. 1', confianca: 96 },
      { campo: 'Índice de reajuste', valor: 'IGP-M anual', fonte: 'CT-2024-0241.pdf, pág. 3', confianca: 94 },
      { campo: 'Cláusula 8ª (proposta)', valor: 'Vistoria de saída em 10 dias úteis (alterada)', fonte: 'email_daniel.eml, pág. 1', confianca: 92 },
      { campo: 'Garantia', valor: 'Caução 3 aluguéis', fonte: 'CT-2024-0241.pdf, pág. 6', confianca: 94 },
    ],
    timeline: [
      { data: '22/11/2026 13:53', evento: 'Alteração na cláusula 8ª enviada ao Jurídico (JUR-005 v2)', ator: 'Agente' },
    ],
    historicoReajustes: [
      { competencia: 'Jan/2026', indice: 'IGP-M 3,5%', antes: 3719.8, depois: 3850 },
    ],
    documentosAnexos: [
      { nome: 'CT-2024-0241.pdf', status: 'Validado', fonte: 'Upload inicial, pág. 1–9' },
    ],
  },
  {
    id: 'ct-6',
    numero: 'CT-2023-0874',
    tipo: 'Locação residencial',
    imovel: 'Apto 1102 · Ed. Aurora',
    imovelCode: 'IMV-1102',
    locatario: 'Marina Cavalcanti',
    locatarioCpfMask: '***.904.118-**',
    locatarioCpfFull: '229.904.118-40',
    locatarioRgMask: '**.551.309-*',
    locatarioRgFull: '31.551.309-4',
    proprietario: 'Fundo Imobiliário Aurora',
    proprietarioBankMask: 'BTG · Ag **** · Cc *****-0',
    proprietarioBankFull: 'BTG Pactual (208) · Ag 0050 · Cc 90412-0',
    corretorResponsavel: 'Carla Nogueira',
    aluguel: 4600,
    vigenciaInicio: '18/12/2023',
    vigenciaFim: '17/12/2027',
    diasParaVencimento: 390,
    indice: 'IPCA',
    garantiaTipo: 'Seguro fiança',
    garantiaValidade: 'Seguro fiança vence em 18/12/2026',
    status: 'Ativo',
    statusDetalhe: 'Troca de garantia em aprovação',
    pendencias: ['Aprovação troca Seguro → Fiador (PED-2026-004828)'],
    registeredBy: 'Registrado pelo agente, fonte: CT-2023-0874.pdf, pág. 1',
    fonteArquivo: 'CT-2023-0874.pdf',
    confiancaGeral: 91,
    regrasAplicaveis: [{ ruleId: 'JUR-010', versao: 2 }],
    pedidosRelacionados: [
      { orderId: 'ord-4828', protocol: 'PED-2026-004828', resumo: 'Troca de garantia Seguro fiança → Fiador' },
    ],
    clausulasChave: [
      { campo: 'Valor mensal', valor: 'R$ 4.600,00', fonte: 'CT-2023-0874.pdf, pág. 2', confianca: 96 },
      { campo: 'Prazo', valor: '48 meses (18/12/2023 a 17/12/2027)', fonte: 'CT-2023-0874.pdf, pág. 1', confianca: 95 },
      { campo: 'Índice de reajuste', valor: 'IPCA anual', fonte: 'CT-2023-0874.pdf, pág. 3', confianca: 94 },
      { campo: 'Multa rescisória', valor: '3 aluguéis proporcionais', fonte: 'CT-2023-0874.pdf, pág. 5', confianca: 92 },
      { campo: 'Garantia atual', valor: 'Seguro fiança (vence 18/12/2026)', fonte: 'apolice_aurora.pdf, pág. 1', confianca: 89 },
    ],
    timeline: [
      { data: '22/11/2026 14:17', evento: 'Proposta de troca para Fiador enviada ao Jurídico (JUR-010 v2)', ator: 'Agente' },
    ],
    historicoReajustes: [
      { competencia: 'Dez/2025', indice: 'IPCA 4,4%', antes: 4406.13, depois: 4600 },
    ],
    documentosAnexos: [
      { nome: 'matricula_fiador_aurora.pdf', status: 'Pendente', fonte: 'E-mail locatária, pág. 1–3' },
    ],
  },
  {
    id: 'ct-7',
    numero: 'CT-2023-0619',
    tipo: 'Locação comercial',
    imovel: 'Sala 1204 · Ed. Central',
    imovelCode: 'IMV-1204',
    locatario: 'Ricardo Alves',
    locatarioCpfMask: '***.219.840-**',
    locatarioCpfFull: '145.219.840-02',
    locatarioRgMask: '**.920.114-*',
    locatarioRgFull: '22.920.114-7',
    proprietario: 'Carlos Eduardo Nunes',
    proprietarioBankMask: 'Itaú · Ag **** · Cc *****-3',
    proprietarioBankFull: 'Itaú (341) · Ag 0821 · Cc 55102-3',
    corretorResponsavel: 'Rafael Costa',
    aluguel: 4600,
    vigenciaInicio: '10/07/2023',
    vigenciaFim: '09/07/2027',
    diasParaVencimento: 229,
    indice: 'IGP-M',
    garantiaTipo: 'Caução',
    garantiaValidade: 'Caução R$ 13.800,00',
    status: 'Em cobrança jurídica',
    statusDetalhe: 'Escalado ao Jurídico (41 dias)',
    pendencias: ['Dossiê pronto para advogado externo (R$ 9.640,00)'],
    registeredBy: 'Registrado pelo agente, fonte: CT-2023-0619.pdf, pág. 1',
    fonteArquivo: 'CT-2023-0619.pdf',
    confiancaGeral: 95,
    regrasAplicaveis: [
      { ruleId: 'FIN-020', versao: 2 },
      { ruleId: 'JUR-001', versao: 1 },
    ],
    pedidosRelacionados: [
      { orderId: 'ord-4803', protocol: 'PED-2026-004803', resumo: 'Escalonamento D+30 · 41 dias em aberto' },
    ],
    clausulasChave: [
      { campo: 'Valor mensal', valor: 'R$ 4.600,00', fonte: 'CT-2023-0619.pdf, pág. 2', confianca: 98 },
      { campo: 'Prazo', valor: '48 meses (10/07/2023 a 09/07/2027)', fonte: 'CT-2023-0619.pdf, pág. 1', confianca: 97 },
      { campo: 'Índice de reajuste', valor: 'IGP-M anual', fonte: 'CT-2023-0619.pdf, pág. 3', confianca: 95 },
      { campo: 'Multa rescisória', valor: '3 aluguéis proporcionais', fonte: 'CT-2023-0619.pdf, pág. 4', confianca: 94 },
      { campo: 'Garantia', valor: 'Caução em dinheiro (3 meses)', fonte: 'CT-2023-0619.pdf, pág. 6', confianca: 96 },
    ],
    timeline: [
      { data: '12/11/2026', evento: 'Dossiê probatório concluído pelo agente e enviado ao escritório parceiro', ator: 'Agente (JUR-001)' },
    ],
    historicoReajustes: [
      { competencia: 'Jul/2026', indice: 'IGP-M 4,0%', antes: 4423.08, depois: 4600 },
    ],
    documentosAnexos: [
      { nome: 'CT-2023-0619_comercial.pdf', status: 'Validado', fonte: 'Upload inicial, pág. 1–9' },
    ],
  },
  {
    id: 'ct-8',
    numero: 'CT-2024-0302',
    tipo: 'Locação residencial',
    imovel: 'Casa Rua das Palmeiras, 85',
    imovelCode: 'IMV-085',
    locatario: 'Patrícia Lima',
    locatarioCpfMask: '***.530.712-**',
    locatarioCpfFull: '274.530.712-66',
    locatarioRgMask: '**.609.221-*',
    locatarioRgFull: '35.609.221-9',
    proprietario: 'Marcelo Ribeiro',
    proprietarioBankMask: 'Santander · Ag **** · Cc *****-8',
    proprietarioBankFull: 'Santander (033) · Ag 0419 · Cc 77412-8',
    corretorResponsavel: 'Carla Nogueira',
    aluguel: 3400,
    vigenciaInicio: '05/05/2024',
    vigenciaFim: '04/05/2027',
    diasParaVencimento: 163,
    indice: 'IGP-M',
    garantiaTipo: 'Caução',
    garantiaValidade: 'Caução R$ 10.200,00',
    status: 'Em cobrança jurídica',
    statusDetalhe: 'Escalado ao Jurídico (33 dias)',
    pendencias: ['Aguardando retorno de notificação do advogado (R$ 7.120,50)'],
    registeredBy: 'Registrado pelo agente, fonte: CT-2024-0302.pdf, pág. 1',
    fonteArquivo: 'CT-2024-0302.pdf',
    confiancaGeral: 94,
    regrasAplicaveis: [{ ruleId: 'JUR-001', versao: 1 }],
    pedidosRelacionados: [],
    clausulasChave: [
      { campo: 'Valor mensal', valor: 'R$ 3.400,00', fonte: 'CT-2024-0302.pdf, pág. 2', confianca: 97 },
      { campo: 'Prazo', valor: '36 meses (05/05/2024 a 04/05/2027)', fonte: 'CT-2024-0302.pdf, pág. 1', confianca: 96 },
      { campo: 'Índice de reajuste', valor: 'IGP-M anual', fonte: 'CT-2024-0302.pdf, pág. 3', confianca: 94 },
      { campo: 'Multa rescisória', valor: '3 aluguéis proporcionais', fonte: 'CT-2024-0302.pdf, pág. 5', confianca: 92 },
      { campo: 'Garantia', valor: 'Caução 3 meses', fonte: 'CT-2024-0302.pdf, pág. 6', confianca: 93 },
    ],
    timeline: [
      { data: '19/11/2026', evento: 'Dossiê entregue ao advogado externo após D+30', ator: 'Agente (JUR-001)' },
    ],
    historicoReajustes: [],
    documentosAnexos: [
      { nome: 'CT-2024-0302.pdf', status: 'Validado', fonte: 'Upload inicial, pág. 1–8' },
    ],
  },
  {
    id: 'ct-9',
    numero: 'CT-2024-0419',
    tipo: 'Locação residencial',
    imovel: 'Apto 12 · Ed. Vila Verde',
    imovelCode: 'IMV-012',
    locatario: 'Ana Beatriz Torres',
    locatarioCpfMask: '***.112.908-**',
    locatarioCpfFull: '389.112.908-21',
    locatarioRgMask: '**.231.094-*',
    locatarioRgFull: '42.231.094-3',
    proprietario: 'Luciano Torres',
    proprietarioBankMask: 'Itaú · Ag **** · Cc *****-5',
    proprietarioBankFull: 'Itaú (341) · Ag 1094 · Cc 33812-5',
    corretorResponsavel: 'Rafael Costa',
    aluguel: 2400,
    vigenciaInicio: '01/12/2024',
    vigenciaFim: '30/11/2027',
    diasParaVencimento: 373,
    indice: 'IPCA',
    garantiaTipo: 'Seguro fiança',
    garantiaValidade: 'Apólice até 30/11/2027',
    status: 'Ativo',
    statusDetalhe: 'Aniversário 01/12/2026 (IPCA 3,9%)',
    pendencias: ['Reajuste anual a aplicar (R$ 2.493,60)'],
    registeredBy: 'Registrado pelo agente, fonte: CT-2024-0419.pdf, pág. 2',
    fonteArquivo: 'CT-2024-0419.pdf',
    confiancaGeral: 97,
    regrasAplicaveis: [],
    pedidosRelacionados: [],
    clausulasChave: [
      { campo: 'Valor mensal', valor: 'R$ 2.400,00', fonte: 'CT-2024-0419.pdf, pág. 2', confianca: 98 },
      { campo: 'Prazo', valor: '36 meses (01/12/2024 a 30/11/2027)', fonte: 'CT-2024-0419.pdf, pág. 1', confianca: 97 },
      { campo: 'Índice de reajuste', valor: 'IPCA anual (01/12)', fonte: 'CT-2024-0419.pdf, pág. 3', confianca: 97 },
      { campo: 'Multa rescisória', valor: '3 aluguéis proporcionais', fonte: 'CT-2024-0419.pdf, pág. 5', confianca: 95 },
      { campo: 'Garantia', valor: 'Seguro fiança vigente', fonte: 'CT-2024-0419.pdf, pág. 6', confianca: 96 },
    ],
    timeline: [
      { data: '22/11/2026', evento: 'Sugestão de reajuste IPCA 3,9% calculada pelo agente', ator: 'Agente (sem regra ativa)' },
    ],
    historicoReajustes: [],
    documentosAnexos: [
      { nome: 'CT-2024-0419.pdf', status: 'Validado', fonte: 'Upload inicial, pág. 1–7' },
    ],
  },
  {
    id: 'ct-10',
    numero: 'CT-2024-0501',
    tipo: 'Locação comercial',
    imovel: 'Sala 05 · Ed. Central',
    imovelCode: 'IMV-005',
    locatario: 'Rodrigo Pires',
    locatarioCpfMask: '***.640.331-**',
    locatarioCpfFull: '211.640.331-70',
    locatarioRgMask: '**.803.112-*',
    locatarioRgFull: '30.803.112-4',
    proprietario: 'Carlos Eduardo Nunes',
    proprietarioBankMask: 'Itaú · Ag **** · Cc *****-3',
    proprietarioBankFull: 'Itaú (341) · Ag 0821 · Cc 55102-3',
    corretorResponsavel: 'Carla Nogueira',
    aluguel: 4100,
    vigenciaInicio: '05/12/2023',
    vigenciaFim: '04/12/2026',
    diasParaVencimento: 12,
    indice: 'IGP-M',
    garantiaTipo: 'Fiador',
    garantiaValidade: 'Fiador validado',
    status: 'Em renovação',
    statusDetalhe: 'Vence em 12 dias · sem ação de renovação',
    pendencias: ['Início D-90 já passou (JUR-002)', 'Reajuste 05/12/2026'],
    registeredBy: 'Registrado pelo agente, fonte: CT-2024-0501.pdf, pág. 1',
    fonteArquivo: 'CT-2024-0501.pdf',
    confiancaGeral: 95,
    regrasAplicaveis: [{ ruleId: 'JUR-002', versao: 4 }],
    pedidosRelacionados: [],
    clausulasChave: [
      { campo: 'Valor mensal', valor: 'R$ 4.100,00', fonte: 'CT-2024-0501.pdf, pág. 2', confianca: 97 },
      { campo: 'Prazo', valor: '36 meses (05/12/2023 a 04/12/2026)', fonte: 'CT-2024-0501.pdf, pág. 1', confianca: 96 },
      { campo: 'Índice de reajuste', valor: 'IGP-M anual', fonte: 'CT-2024-0501.pdf, pág. 3', confianca: 95 },
      { campo: 'Multa rescisória', valor: '3 aluguéis proporcionais', fonte: 'CT-2024-0501.pdf, pág. 4', confianca: 94 },
      { campo: 'Garantia', valor: 'Fiador solidário', fonte: 'CT-2024-0501.pdf, pág. 6', confianca: 94 },
    ],
    timeline: [],
    historicoReajustes: [],
    documentosAnexos: [],
  },
  {
    id: 'ct-11',
    numero: 'CT-2024-0612',
    tipo: 'Locação comercial',
    imovel: 'Loja 8 · Galeria Norte',
    imovelCode: 'IMV-008',
    locatario: 'Gustavo Reis',
    locatarioCpfMask: '***.412.559-**',
    locatarioCpfFull: '309.412.559-18',
    locatarioRgMask: '**.118.440-*',
    locatarioRgFull: '39.118.440-6',
    proprietario: 'Marta Siqueira',
    proprietarioBankMask: 'Bradesco · Ag **** · Cc *****-2',
    proprietarioBankFull: 'Bradesco (237) · Ag 1904 · Cc 11402-2',
    corretorResponsavel: 'Rafael Costa',
    aluguel: 5100,
    vigenciaInicio: '02/12/2024',
    vigenciaFim: '01/12/2026',
    diasParaVencimento: 9,
    indice: 'IGP-M',
    garantiaTipo: 'Seguro fiança',
    garantiaValidade: 'Apólice vence 02/12/2026 (10d)',
    status: 'Em renovação',
    statusDetalhe: 'Vence em 9 dias · alerta garantia enviado',
    pendencias: ['Seguro fiança vence 02/12/2026', 'Renovação sem ação iniciada'],
    registeredBy: 'Registrado pelo agente, fonte: apolice_loja8.pdf, pág. 1',
    fonteArquivo: 'CT-2024-0612.pdf',
    confiancaGeral: 96,
    regrasAplicaveis: [
      { ruleId: 'JUR-002', versao: 4 },
      { ruleId: 'JUR-010', versao: 2 },
    ],
    pedidosRelacionados: [],
    clausulasChave: [
      { campo: 'Valor mensal', valor: 'R$ 5.100,00', fonte: 'CT-2024-0612.pdf, pág. 2', confianca: 98 },
      { campo: 'Prazo', valor: '24 meses (02/12/2024 a 01/12/2026)', fonte: 'CT-2024-0612.pdf, pág. 1', confianca: 97 },
      { campo: 'Índice de reajuste', valor: 'IGP-M anual', fonte: 'CT-2024-0612.pdf, pág. 3', confianca: 96 },
      { campo: 'Multa rescisória', valor: '3 aluguéis proporcionais', fonte: 'CT-2024-0612.pdf, pág. 5', confianca: 95 },
      { campo: 'Garantia', valor: 'Seguro fiança vence 02/12/2026', fonte: 'apolice_loja8.pdf, pág. 1', confianca: 96 },
    ],
    timeline: [],
    historicoReajustes: [],
    documentosAnexos: [],
  },
  {
    id: 'ct-12',
    numero: 'CT-2022-0190',
    tipo: 'Locação residencial',
    imovel: 'Apto 201 · Ed. Horizonte',
    imovelCode: 'IMV-201',
    locatario: 'Sérgio Monteiro',
    locatarioCpfMask: '***.890.123-**',
    locatarioCpfFull: '187.890.123-09',
    locatarioRgMask: '**.402.771-*',
    locatarioRgFull: '27.402.771-2',
    proprietario: 'Regina Célia Prado',
    proprietarioBankMask: 'Caixa · Ag **** · Cc *****-6',
    proprietarioBankFull: 'Caixa (104) · Ag 0912 · Cc 004129-6',
    corretorResponsavel: 'Carla Nogueira',
    aluguel: 2750,
    vigenciaInicio: '10/08/2022',
    vigenciaFim: '09/08/2027',
    diasParaVencimento: 260,
    indice: 'IPCA',
    garantiaTipo: 'Sem garantia válida',
    garantiaValidade: 'Apólice expirada em 10/11/2026',
    status: 'Sem garantia válida',
    statusDetalhe: 'Sem garantia válida · risco crítico',
    pendencias: ['Garantia expirada (JUR-010)'],
    registeredBy: 'Registrado pelo agente, fonte: alerta_seguradora_nov.eml, pág. 1',
    fonteArquivo: 'CT-2022-0190.pdf',
    confiancaGeral: 92,
    regrasAplicaveis: [{ ruleId: 'JUR-010', versao: 2 }],
    pedidosRelacionados: [],
    clausulasChave: [
      { campo: 'Valor mensal', valor: 'R$ 2.750,00', fonte: 'CT-2022-0190.pdf, pág. 2', confianca: 95 },
      { campo: 'Prazo', valor: '60 meses (10/08/2022 a 09/08/2027)', fonte: 'CT-2022-0190.pdf, pág. 1', confianca: 94 },
      { campo: 'Índice de reajuste', valor: 'IPCA anual', fonte: 'CT-2022-0190.pdf, pág. 3', confianca: 93 },
      { campo: 'Multa rescisória', valor: '3 aluguéis proporcionais', fonte: 'CT-2022-0190.pdf, pág. 4', confianca: 91 },
      { campo: 'Garantia', valor: 'Expirada em 10/11/2026', fonte: 'alerta_seguradora_nov.eml', confianca: 90 },
    ],
    timeline: [],
    historicoReajustes: [],
    documentosAnexos: [],
  },
  {
    id: 'ct-13',
    numero: 'CT-2023-0745',
    tipo: 'Locação residencial',
    imovel: 'Casa 04 · Cond. Jardins',
    imovelCode: 'IMV-040',
    locatario: 'Vanessa Nogueira',
    locatarioCpfMask: '***.340.912-**',
    locatarioCpfFull: '332.340.912-44',
    locatarioRgMask: '**.712.501-*',
    locatarioRgFull: '40.712.501-7',
    proprietario: 'Pedro Augusto Lima',
    proprietarioBankMask: 'Itaú · Ag **** · Cc *****-1',
    proprietarioBankFull: 'Itaú (341) · Ag 0410 · Cc 19283-1',
    corretorResponsavel: 'Rafael Costa',
    aluguel: 3600,
    vigenciaInicio: '15/06/2023',
    vigenciaFim: '14/06/2027',
    diasParaVencimento: 204,
    indice: 'IGP-M',
    garantiaTipo: 'Sem garantia válida',
    garantiaValidade: 'Título resgatado sem reposição',
    status: 'Sem garantia válida',
    statusDetalhe: 'Sem garantia válida · regularização urgente',
    pendencias: ['Título de capitalização baixado sem substituição'],
    registeredBy: 'Registrado pelo agente, fonte: aviso_banco_titulo.pdf, pág. 1',
    fonteArquivo: 'CT-2023-0745.pdf',
    confiancaGeral: 91,
    regrasAplicaveis: [{ ruleId: 'JUR-010', versao: 2 }],
    pedidosRelacionados: [],
    clausulasChave: [
      { campo: 'Valor mensal', valor: 'R$ 3.600,00', fonte: 'CT-2023-0745.pdf, pág. 2', confianca: 96 },
      { campo: 'Prazo', valor: '48 meses (15/06/2023 a 14/06/2027)', fonte: 'CT-2023-0745.pdf, pág. 1', confianca: 95 },
      { campo: 'Índice de reajuste', valor: 'IGP-M anual', fonte: 'CT-2023-0745.pdf, pág. 3', confianca: 94 },
      { campo: 'Multa rescisória', valor: '3 aluguéis proporcionais', fonte: 'CT-2023-0745.pdf, pág. 5', confianca: 92 },
      { campo: 'Garantia', valor: 'Sem garantia válida', fonte: 'aviso_banco_titulo.pdf', confianca: 91 },
    ],
    timeline: [],
    historicoReajustes: [],
    documentosAnexos: [],
  },
  {
    id: 'ct-14',
    numero: 'CT-2024-0711',
    tipo: 'Locação residencial',
    imovel: 'Casa Rua das Acácias, 98',
    imovelCode: 'IMV-098',
    locatario: 'Camila Ferraz',
    locatarioCpfMask: '***.192.441-**',
    locatarioCpfFull: '291.192.441-10',
    locatarioRgMask: '**.304.881-*',
    locatarioRgFull: '36.304.881-0',
    proprietario: 'Eduardo Ferraz',
    proprietarioBankMask: 'Bradesco · Ag **** · Cc *****-0',
    proprietarioBankFull: 'Bradesco (237) · Ag 0219 · Cc 44109-0',
    corretorResponsavel: 'Carla Nogueira',
    aluguel: 1850,
    vigenciaInicio: '10/12/2024',
    vigenciaFim: '09/12/2026',
    diasParaVencimento: 17,
    indice: 'IGP-M',
    garantiaTipo: 'Caução',
    garantiaValidade: 'Caução R$ 5.550,00',
    status: 'Em renovação',
    statusDetalhe: 'Vence em 17 dias · sem ação iniciada',
    pendencias: ['Início D-90 já passou (JUR-002)', 'Reajuste 10/12/2026'],
    registeredBy: 'Registrado pelo agente, fonte: CT-2024-0711.pdf, pág. 1',
    fonteArquivo: 'CT-2024-0711.pdf',
    confiancaGeral: 96,
    regrasAplicaveis: [{ ruleId: 'JUR-002', versao: 4 }],
    pedidosRelacionados: [],
    clausulasChave: [
      { campo: 'Valor mensal', valor: 'R$ 1.850,00', fonte: 'CT-2024-0711.pdf, pág. 2', confianca: 98 },
      { campo: 'Prazo', valor: '24 meses (10/12/2024 a 09/12/2026)', fonte: 'CT-2024-0711.pdf, pág. 1', confianca: 97 },
      { campo: 'Índice de reajuste', valor: 'IGP-M anual', fonte: 'CT-2024-0711.pdf, pág. 3', confianca: 96 },
      { campo: 'Multa rescisória', valor: '3 aluguéis proporcionais', fonte: 'CT-2024-0711.pdf, pág. 5', confianca: 94 },
      { campo: 'Garantia', valor: 'Caução 3 meses', fonte: 'CT-2024-0711.pdf, pág. 6', confianca: 95 },
    ],
    timeline: [],
    historicoReajustes: [],
    documentosAnexos: [],
  },
  {
    id: 'ct-15',
    numero: 'CT-2025-0140',
    tipo: 'Locação comercial',
    imovel: 'Sala 22 · Ed. Central',
    imovelCode: 'IMV-022',
    locatario: 'Tiago Pires',
    locatarioCpfMask: '***.488.203-**',
    locatarioCpfFull: '304.488.203-14',
    locatarioRgMask: '**.991.503-*',
    locatarioRgFull: '41.991.503-8',
    proprietario: 'Carlos Eduardo Nunes',
    proprietarioBankMask: 'Itaú · Ag **** · Cc *****-3',
    proprietarioBankFull: 'Itaú (341) · Ag 0821 · Cc 55102-3',
    corretorResponsavel: 'Rafael Costa',
    aluguel: 3100,
    vigenciaInicio: '01/03/2025',
    vigenciaFim: '28/02/2027',
    diasParaVencimento: 98,
    indice: 'IPCA',
    garantiaTipo: 'Título de capitalização',
    garantiaValidade: 'Título até 28/02/2027',
    status: 'Em rescisão',
    statusDetalhe: 'Em rescisão · Vistoria de saída agendada',
    pendencias: ['Laudo de vistoria de saída pendente'],
    registeredBy: 'Registrado pelo agente, fonte: CT-2025-0140.pdf, pág. 1',
    fonteArquivo: 'CT-2025-0140.pdf',
    confiancaGeral: 94,
    regrasAplicaveis: [{ ruleId: 'JUR-007', versao: 1 }],
    pedidosRelacionados: [],
    clausulasChave: [
      { campo: 'Valor mensal', valor: 'R$ 3.100,00', fonte: 'CT-2025-0140.pdf, pág. 2', confianca: 96 },
      { campo: 'Prazo', valor: '24 meses', fonte: 'CT-2025-0140.pdf, pág. 1', confianca: 95 },
      { campo: 'Índice de reajuste', valor: 'IPCA anual', fonte: 'CT-2025-0140.pdf, pág. 3', confianca: 94 },
      { campo: 'Multa rescisória', valor: '3 aluguéis proporcionais', fonte: 'CT-2025-0140.pdf, pág. 4', confianca: 93 },
      { campo: 'Garantia', valor: 'Título de capitalização R$ 15.000', fonte: 'CT-2025-0140.pdf, pág. 6', confianca: 94 },
    ],
    timeline: [],
    historicoReajustes: [],
    documentosAnexos: [],
  },
  {
    id: 'ct-16',
    numero: 'CT-2024-0818',
    tipo: 'Locação residencial',
    imovel: 'Casa Rua do Lago, 9',
    imovelCode: 'IMV-009',
    locatario: 'Lucas Andrade',
    locatarioCpfMask: '***.702.311-**',
    locatarioCpfFull: '366.702.311-90',
    locatarioRgMask: '**.220.419-*',
    locatarioRgFull: '33.220.419-1',
    proprietario: 'Mariana Duarte',
    proprietarioBankMask: 'Santander · Ag **** · Cc *****-2',
    proprietarioBankFull: 'Santander (033) · Ag 1102 · Cc 20394-2',
    corretorResponsavel: 'Carla Nogueira',
    aluguel: 2900,
    vigenciaInicio: '15/02/2024',
    vigenciaFim: '14/02/2027',
    diasParaVencimento: 84,
    indice: 'IGP-M',
    garantiaTipo: 'Caução',
    garantiaValidade: 'Caução em acerto de saída',
    status: 'Em rescisão',
    statusDetalhe: 'Em rescisão · Acerto financeiro',
    pendencias: ['Conferência final de pintura e caução'],
    registeredBy: 'Registrado pelo agente, fonte: CT-2024-0818.pdf, pág. 1',
    fonteArquivo: 'CT-2024-0818.pdf',
    confiancaGeral: 95,
    regrasAplicaveis: [{ ruleId: 'JUR-007', versao: 1 }],
    pedidosRelacionados: [],
    clausulasChave: [
      { campo: 'Valor mensal', valor: 'R$ 2.900,00', fonte: 'CT-2024-0818.pdf, pág. 2', confianca: 97 },
      { campo: 'Prazo', valor: '36 meses', fonte: 'CT-2024-0818.pdf, pág. 1', confianca: 96 },
      { campo: 'Índice de reajuste', valor: 'IGP-M anual', fonte: 'CT-2024-0818.pdf, pág. 3', confianca: 95 },
      { campo: 'Multa rescisória', valor: 'Isento após 12 meses (aviso 30d)', fonte: 'CT-2024-0818.pdf, pág. 5', confianca: 93 },
      { campo: 'Garantia', valor: 'Caução R$ 8.700,00', fonte: 'CT-2024-0818.pdf, pág. 6', confianca: 94 },
    ],
    timeline: [],
    historicoReajustes: [],
    documentosAnexos: [],
  },
  {
    id: 'ct-17',
    numero: 'CT-2026-0044',
    tipo: 'Administração',
    imovel: 'Sala 804 · Av. Paulista, 1400',
    imovelCode: 'IMV-804',
    locatario: 'Empresa Nexo Tech Ltda',
    locatarioCpfMask: '**.412.890/0001-**',
    locatarioCpfFull: '18.412.890/0001-32',
    locatarioRgMask: 'IE ***.441.200',
    locatarioRgFull: 'IE 114.441.200.118',
    proprietario: 'Ricardo Vasconcelos',
    proprietarioBankMask: 'Itaú · Ag **** · Cc *****-0',
    proprietarioBankFull: 'Itaú (341) · Ag 0312 · Cc 99201-0',
    corretorResponsavel: 'Rafael Costa',
    aluguel: 5800,
    vigenciaInicio: '01/12/2026',
    vigenciaFim: '30/11/2029',
    diasParaVencimento: 1104,
    indice: 'IPCA',
    garantiaTipo: 'Seguro fiança',
    garantiaValidade: 'Apólice emitida até 30/11/2027',
    status: 'Ativo',
    statusDetalhe: 'Extraído de contrato_sala804_paulista_assinado.pdf',
    pendencias: [],
    registeredBy: 'Registrado pelo agente, fonte: contrato_sala804_paulista_assinado.pdf, pág. 1',
    fonteArquivo: 'contrato_sala804_paulista_assinado.pdf',
    confiancaGeral: 95,
    regrasAplicaveis: [{ ruleId: 'JUR-013', versao: 3 }],
    pedidosRelacionados: [
      { orderId: 'ord-4810', protocol: 'PED-2026-004810', resumo: 'Extração e cadastro automático (95%)' },
    ],
    clausulasChave: [
      { campo: 'Valor mensal', valor: 'R$ 5.800,00', fonte: 'contrato_sala804_paulista_assinado.pdf, pág. 2', confianca: 98 },
      { campo: 'Prazo', valor: '36 meses (01/12/2026 a 30/11/2029)', fonte: 'contrato_sala804_paulista_assinado.pdf, pág. 1', confianca: 96 },
      { campo: 'Índice de reajuste', valor: 'IPCA anual', fonte: 'contrato_sala804_paulista_assinado.pdf, pág. 4', confianca: 95 },
      { campo: 'Taxa administração', valor: '9% sobre aluguel bruto', fonte: 'contrato_sala804_paulista_assinado.pdf, pág. 7', confianca: 94 },
      { campo: 'Garantia', valor: 'Seguro fiança empresarial', fonte: 'contrato_sala804_paulista_assinado.pdf, pág. 8', confianca: 95 },
    ],
    timeline: [],
    historicoReajustes: [],
    documentosAnexos: [],
  },
  {
    id: 'ct-18',
    numero: 'CT-2026-0112',
    tipo: 'Compra e venda',
    imovel: 'Rua das Acácias, 418 · Jardim América',
    imovelCode: 'IMV-418',
    locatario: 'Juliana Martins (Compradora)',
    locatarioCpfMask: '***.552.901-**',
    locatarioCpfFull: '344.552.901-73',
    locatarioRgMask: '**.810.332-*',
    locatarioRgFull: '43.810.332-5',
    proprietario: 'Roberto Farina (Vendedor)',
    proprietarioBankMask: 'Itaú · Ag **** · Cc *****-4',
    proprietarioBankFull: 'Itaú (341) · Ag 0412 · Cc 10294-4',
    corretorResponsavel: 'Rafael Costa',
    aluguel: 680000,
    vigenciaInicio: '10/11/2026',
    vigenciaFim: '10/01/2027',
    diasParaVencimento: 49,
    indice: 'N/A',
    garantiaTipo: 'Não aplicável',
    garantiaValidade: 'Sinal de R$ 68.000,00 em conta vinculada',
    status: 'Ativo',
    statusDetalhe: 'Escritura e certidões em conferência',
    pendencias: ['Certidão negativa de débitos municipais'],
    registeredBy: 'Registrado pelo agente, fonte: compromisso_acacias418.pdf, pág. 1',
    fonteArquivo: 'compromisso_acacias418.pdf',
    confiancaGeral: 91,
    regrasAplicaveis: [{ ruleId: 'JUR-013', versao: 3 }],
    pedidosRelacionados: [],
    clausulasChave: [
      { campo: 'Valor de venda', valor: 'R$ 680.000,00', fonte: 'compromisso_acacias418.pdf, pág. 2', confianca: 97 },
      { campo: 'Prazo escritura', valor: '60 dias (até 10/01/2027)', fonte: 'compromisso_acacias418.pdf, pág. 3', confianca: 93 },
      { campo: 'Sinal / Arras', valor: 'R$ 68.000,00 (10%)', fonte: 'compromisso_acacias418.pdf, pág. 2', confianca: 95 },
      { campo: 'Comissão intermediação', valor: '6% (R$ 40.800,00)', fonte: 'compromisso_acacias418.pdf, pág. 5', confianca: 92 },
    ],
    timeline: [],
    historicoReajustes: [],
    documentosAnexos: [],
  },
  {
    id: 'ct-19',
    numero: 'CT-2024-0903',
    tipo: 'Locação residencial',
    imovel: 'Apto 704 · Ed. Moema Park',
    imovelCode: 'IMV-704',
    locatario: 'Camila Siqueira',
    locatarioCpfMask: '***.310.774-**',
    locatarioCpfFull: '299.310.774-15',
    locatarioRgMask: '**.661.209-*',
    locatarioRgFull: '34.661.209-8',
    proprietario: 'Henrique Campos',
    proprietarioBankMask: 'Santander · Ag **** · Cc *****-5',
    proprietarioBankFull: 'Santander (033) · Ag 2091 · Cc 31029-5',
    corretorResponsavel: 'Carla Nogueira',
    aluguel: 4900,
    vigenciaInicio: '20/01/2024',
    vigenciaFim: '19/01/2027',
    diasParaVencimento: 58,
    indice: 'IGP-M',
    garantiaTipo: 'Fiador',
    garantiaValidade: 'Fiador validado',
    status: 'Em renovação',
    statusDetalhe: 'Em preparo de renovação (58 dias)',
    pendencias: [],
    registeredBy: 'Registrado pelo agente, fonte: CT-2024-0903.pdf, pág. 1',
    fonteArquivo: 'CT-2024-0903.pdf',
    confiancaGeral: 95,
    regrasAplicaveis: [{ ruleId: 'JUR-002', versao: 4 }],
    pedidosRelacionados: [],
    clausulasChave: [
      { campo: 'Valor mensal', valor: 'R$ 4.900,00', fonte: 'CT-2024-0903.pdf, pág. 2', confianca: 97 },
      { campo: 'Prazo', valor: '36 meses', fonte: 'CT-2024-0903.pdf, pág. 1', confianca: 96 },
      { campo: 'Índice de reajuste', valor: 'IGP-M anual', fonte: 'CT-2024-0903.pdf, pág. 3', confianca: 95 },
      { campo: 'Multa rescisória', valor: '3 aluguéis proporcionais', fonte: 'CT-2024-0903.pdf, pág. 5', confianca: 94 },
      { campo: 'Garantia', valor: 'Fiador', fonte: 'CT-2024-0903.pdf, pág. 6', confianca: 95 },
    ],
    timeline: [],
    historicoReajustes: [],
    documentosAnexos: [],
  },
  {
    id: 'ct-20',
    numero: 'CT-2024-0988',
    tipo: 'Administração',
    imovel: 'Conj. 901 · Ed. Paulista Prime',
    imovelCode: 'IMV-901',
    locatario: 'Clínica Vida Plena',
    locatarioCpfMask: '**.901.340/0001-**',
    locatarioCpfFull: '27.901.340/0001-81',
    locatarioRgMask: 'IE ***.881.902',
    locatarioRgFull: 'IE 119.881.902.411',
    proprietario: 'Fundo Imobiliário Aurora',
    proprietarioBankMask: 'BTG · Ag **** · Cc *****-0',
    proprietarioBankFull: 'BTG Pactual (208) · Ag 0050 · Cc 90412-0',
    corretorResponsavel: 'Rafael Costa',
    aluguel: 7200,
    vigenciaInicio: '01/02/2024',
    vigenciaFim: '31/01/2027',
    diasParaVencimento: 70,
    indice: 'IPCA',
    garantiaTipo: 'Seguro fiança',
    garantiaValidade: 'Apólice vence 10/01/2027 (49d)',
    status: 'Em renovação',
    statusDetalhe: 'Minuta enviada ao cliente',
    pendencias: ['Garantia vence em 49 dias (alerta JUR-010)'],
    registeredBy: 'Registrado pelo agente, fonte: CT-2024-0988.pdf, pág. 1',
    fonteArquivo: 'CT-2024-0988.pdf',
    confiancaGeral: 96,
    regrasAplicaveis: [
      { ruleId: 'JUR-002', versao: 4 },
      { ruleId: 'JUR-010', versao: 2 },
    ],
    pedidosRelacionados: [],
    clausulasChave: [
      { campo: 'Valor mensal', valor: 'R$ 7.200,00', fonte: 'CT-2024-0988.pdf, pág. 2', confianca: 98 },
      { campo: 'Prazo', valor: '36 meses', fonte: 'CT-2024-0988.pdf, pág. 1', confianca: 97 },
      { campo: 'Índice de reajuste', valor: 'IPCA anual', fonte: 'CT-2024-0988.pdf, pág. 3', confianca: 96 },
      { campo: 'Multa rescisória', valor: '3 aluguéis proporcionais', fonte: 'CT-2024-0988.pdf, pág. 5', confianca: 95 },
      { campo: 'Garantia', valor: 'Seguro fiança empresarial', fonte: 'CT-2024-0988.pdf, pág. 7', confianca: 95 },
    ],
    timeline: [],
    historicoReajustes: [],
    documentosAnexos: [],
  },
];

export const INITIAL_RENEWAL_CARDS: RenewalKanbanCard[] = [
  {
    id: 'ren-1',
    contractNumber: 'CT-2024-0501',
    locatario: 'Rodrigo Pires',
    imovel: 'Sala 05 · Ed. Central',
    corretorResponsavel: 'Carla Nogueira',
    diasParaVencimento: 12,
    vencimento: '04/12/2026',
    aluguelAtual: 4100,
    aluguelProposto: 4272.2,
    indice: 'IGP-M',
    percentualIndice: 4.2,
    stage: 'Sem ação',
    regras: [{ ruleId: 'JUR-002', versao: 4 }],
    inicioPrevistoPassou: true,
  },
  {
    id: 'ren-2',
    contractNumber: 'CT-2024-0612',
    locatario: 'Gustavo Reis',
    imovel: 'Loja 8 · Galeria Norte',
    corretorResponsavel: 'Rafael Costa',
    diasParaVencimento: 9,
    vencimento: '01/12/2026',
    aluguelAtual: 5100,
    aluguelProposto: 5314.2,
    indice: 'IGP-M',
    percentualIndice: 4.2,
    stage: 'Sem ação',
    regras: [{ ruleId: 'JUR-002', versao: 4 }],
    inicioPrevistoPassou: true,
  },
  {
    id: 'ren-3',
    contractNumber: 'CT-2024-0711',
    locatario: 'Camila Ferraz',
    imovel: 'Casa Rua das Acácias, 98',
    corretorResponsavel: 'Carla Nogueira',
    diasParaVencimento: 17,
    vencimento: '09/12/2026',
    aluguelAtual: 1850,
    aluguelProposto: 1927.7,
    indice: 'IGP-M',
    percentualIndice: 4.2,
    stage: 'Sem ação',
    regras: [{ ruleId: 'JUR-002', versao: 4 }],
    inicioPrevistoPassou: true,
  },
  {
    id: 'ren-4',
    contractNumber: 'CT-2024-0903',
    locatario: 'Camila Siqueira',
    imovel: 'Apto 704 · Ed. Moema Park',
    corretorResponsavel: 'Carla Nogueira',
    diasParaVencimento: 58,
    vencimento: '19/01/2027',
    aluguelAtual: 4900,
    aluguelProposto: 5105.8,
    indice: 'IGP-M',
    percentualIndice: 4.2,
    stage: 'Em preparo',
    regras: [{ ruleId: 'JUR-002', versao: 4 }],
  },
  {
    id: 'ren-5',
    contractNumber: 'CT-2024-1015',
    locatario: 'Paulo Henrique',
    imovel: 'Loja 03 · Av. Brasil',
    corretorResponsavel: 'Rafael Costa',
    diasParaVencimento: 44,
    vencimento: '05/01/2027',
    aluguelAtual: 2480,
    aluguelProposto: 2576.72,
    indice: 'IPCA',
    percentualIndice: 3.9,
    stage: 'Em preparo',
    regras: [{ ruleId: 'JUR-002', versao: 4 }],
  },
  {
    id: 'ren-6',
    contractNumber: 'CT-2024-0187',
    locatario: 'Carlos Mendes',
    imovel: 'Apto 302 · Ed. Vista Verde',
    corretorResponsavel: 'Rafael Costa',
    diasParaVencimento: 28,
    vencimento: '20/12/2026',
    aluguelAtual: 3200,
    aluguelProposto: 3334.4,
    indice: 'IGP-M',
    percentualIndice: 4.2,
    stage: 'Aguardando aprovação',
    regras: [{ ruleId: 'JUR-002', versao: 4 }],
    orderId: 'ord-4812',
    orderProtocol: 'PED-2026-004812',
  },
  {
    id: 'ren-7',
    contractNumber: 'CT-2024-0241',
    locatario: 'Daniel Freitas',
    imovel: 'Casa Rua dos Ipês, 44',
    corretorResponsavel: 'Rafael Costa',
    diasParaVencimento: 53,
    vencimento: '14/01/2027',
    aluguelAtual: 3850,
    aluguelProposto: 4011.7,
    indice: 'IGP-M',
    percentualIndice: 4.2,
    stage: 'Aguardando aprovação',
    regras: [
      { ruleId: 'JUR-005', versao: 2 },
      { ruleId: 'JUR-002', versao: 4 },
    ],
    clausulaAlterada: true,
    clausulaAlteradaTexto: 'Cláusula 8ª: vistoria de saída de 5 para 10 dias úteis',
    orderId: 'ord-4826',
    orderProtocol: 'PED-2026-004826',
  },
  {
    id: 'ren-8',
    contractNumber: 'CT-2024-1102',
    locatario: 'Thiago Moreira',
    imovel: 'Apto 1102 · Jardins',
    corretorResponsavel: 'Carla Nogueira',
    diasParaVencimento: 41,
    vencimento: '02/01/2027',
    aluguelAtual: 2680,
    aluguelProposto: 2784.52,
    indice: 'IPCA',
    percentualIndice: 3.9,
    stage: 'Aguardando aprovação',
    regras: [{ ruleId: 'JUR-002', versao: 4 }],
  },
  {
    id: 'ren-9',
    contractNumber: 'CT-2024-0988',
    locatario: 'Clínica Vida Plena',
    imovel: 'Conj. 901 · Ed. Paulista Prime',
    corretorResponsavel: 'Rafael Costa',
    diasParaVencimento: 70,
    vencimento: '31/01/2027',
    aluguelAtual: 7200,
    aluguelProposto: 7480.8,
    indice: 'IPCA',
    percentualIndice: 3.9,
    stage: 'Enviada ao cliente',
    regras: [{ ruleId: 'JUR-002', versao: 4 }],
  },
  {
    id: 'ren-10',
    contractNumber: 'CT-2024-1144',
    locatario: 'Vanessa Lopes',
    imovel: 'Apto 601 · Perdizes',
    corretorResponsavel: 'Carla Nogueira',
    diasParaVencimento: 62,
    vencimento: '23/01/2027',
    aluguelAtual: 2840,
    aluguelProposto: 2959.28,
    indice: 'IGP-M',
    percentualIndice: 4.2,
    stage: 'Enviada ao cliente',
    regras: [{ ruleId: 'JUR-002', versao: 4 }],
  },
  {
    id: 'ren-11',
    contractNumber: 'CT-2024-1208',
    locatario: 'Sandra Vieira',
    imovel: 'Apto 502 · Santana',
    corretorResponsavel: 'Rafael Costa',
    diasParaVencimento: 78,
    vencimento: '08/02/2027',
    aluguelAtual: 2150,
    aluguelProposto: 2233.85,
    indice: 'IPCA',
    percentualIndice: 3.9,
    stage: 'Assinada',
    regras: [{ ruleId: 'JUR-002', versao: 4 }],
  },
  {
    id: 'ren-12',
    contractNumber: 'CT-2024-1255',
    locatario: 'Rodrigo Peixoto',
    imovel: 'Apto 306 · Pinheiros',
    corretorResponsavel: 'Carla Nogueira',
    diasParaVencimento: 82,
    vencimento: '12/02/2027',
    aluguelAtual: 3120,
    aluguelProposto: 3251.04,
    indice: 'IGP-M',
    percentualIndice: 4.2,
    stage: 'Assinada',
    regras: [{ ruleId: 'JUR-002', versao: 4 }],
  },
];

export const RENEWAL_STAGE_TOTALS: Record<RenewalStage, number> = {
  'Sem ação': 8,
  'Em preparo': 11,
  'Aguardando aprovação': 5,
  'Enviada ao cliente': 9,
  Assinada: 4,
};

export const INITIAL_ANNUAL_ADJUSTMENTS: AnnualAdjustmentItem[] = [
  {
    id: 'rea-1',
    contractNumber: 'CT-2024-0419',
    locatario: 'Ana Beatriz Torres',
    imovel: 'Apto 12 · Ed. Vila Verde',
    corretorResponsavel: 'Rafael Costa',
    aluguelAtual: 2400,
    indice: 'IPCA',
    percentual: 3.9,
    aniversario: '01/12/2026',
    novoAluguel: 2493.6,
    status: 'Sugestão gerada',
    fonte: 'CT-2024-0419.pdf, pág. 3',
    confianca: 97,
  },
  {
    id: 'rea-2',
    contractNumber: 'CT-2024-0501',
    locatario: 'Rodrigo Pires',
    imovel: 'Sala 05 · Ed. Central',
    corretorResponsavel: 'Carla Nogueira',
    aluguelAtual: 4100,
    indice: 'IGP-M',
    percentual: 4.2,
    aniversario: '05/12/2026',
    novoAluguel: 4272.2,
    status: 'A aplicar',
    fonte: 'CT-2024-0501.pdf, pág. 3',
    confianca: 95,
  },
  {
    id: 'rea-3',
    contractNumber: 'CT-2024-0711',
    locatario: 'Camila Ferraz',
    imovel: 'Casa Rua das Acácias, 98',
    corretorResponsavel: 'Carla Nogueira',
    aluguelAtual: 1850,
    indice: 'IGP-M',
    percentual: 4.2,
    aniversario: '10/12/2026',
    novoAluguel: 1927.7,
    status: 'A aplicar',
    fonte: 'CT-2024-0711.pdf, pág. 3',
    confianca: 96,
  },
  {
    id: 'rea-4',
    contractNumber: 'CT-2024-0187',
    locatario: 'Carlos Mendes',
    imovel: 'Apto 302 · Ed. Vista Verde',
    corretorResponsavel: 'Rafael Costa',
    aluguelAtual: 3200,
    indice: 'IGP-M',
    percentual: 4.2,
    aniversario: '20/12/2026',
    novoAluguel: 3334.4,
    status: 'Aguardando conferência',
    fonte: 'CT-2024-0187.pdf, pág. 3',
    confianca: 96,
  },
  {
    id: 'rea-5',
    contractNumber: 'CT-2023-0874',
    locatario: 'Marina Cavalcanti',
    imovel: 'Apto 1102 · Ed. Aurora',
    corretorResponsavel: 'Carla Nogueira',
    aluguelAtual: 4600,
    indice: 'IPCA',
    percentual: 3.9,
    aniversario: '18/12/2026',
    novoAluguel: 4779.4,
    status: 'Sugestão gerada',
    fonte: 'CT-2023-0874.pdf, pág. 3',
    confianca: 94,
  },
  {
    id: 'rea-6',
    contractNumber: 'CT-2024-0612',
    locatario: 'Gustavo Reis',
    imovel: 'Loja 8 · Galeria Norte',
    corretorResponsavel: 'Rafael Costa',
    aluguelAtual: 5100,
    indice: 'IGP-M',
    percentual: 4.2,
    aniversario: '02/12/2026',
    novoAluguel: 5314.2,
    status: 'A aplicar',
    fonte: 'CT-2024-0612.pdf, pág. 3',
    confianca: 96,
  },
  {
    id: 'rea-7',
    contractNumber: 'CT-2024-0991',
    locatario: 'Juliana Rocha',
    imovel: 'Apto 204 · Bela Vista',
    corretorResponsavel: 'Carla Nogueira',
    aluguelAtual: 2890,
    indice: 'IPCA',
    percentual: 3.9,
    aniversario: '12/12/2026',
    novoAluguel: 3002.71,
    status: 'A aplicar',
    fonte: 'CT-2024-0991.pdf, pág. 3',
    confianca: 93,
  },
  {
    id: 'rea-8',
    contractNumber: 'CT-2024-1033',
    locatario: 'Bruno Azevedo',
    imovel: 'Apto 105 · Vila Nova',
    corretorResponsavel: 'Rafael Costa',
    aluguelAtual: 3900,
    indice: 'IGP-M',
    percentual: 4.2,
    aniversario: '14/12/2026',
    novoAluguel: 4063.8,
    status: 'Sugestão gerada',
    fonte: 'CT-2024-1033.pdf, pág. 3',
    confianca: 95,
  },
  {
    id: 'rea-9',
    contractNumber: 'CT-2024-1088',
    locatario: 'Aline Barros',
    imovel: 'Studio 18 · Consolação',
    corretorResponsavel: 'Carla Nogueira',
    aluguelAtual: 3560,
    indice: 'IPCA',
    percentual: 3.9,
    aniversario: '15/12/2026',
    novoAluguel: 3698.84,
    status: 'A aplicar',
    fonte: 'CT-2024-1088.pdf, pág. 3',
    confianca: 94,
  },
  {
    id: 'rea-10',
    contractNumber: 'CT-2024-1120',
    locatario: 'Gustavo Rocha',
    imovel: 'Casa Rua Turquesa, 90',
    corretorResponsavel: 'Rafael Costa',
    aluguelAtual: 4600,
    indice: 'IGP-M',
    percentual: 4.2,
    aniversario: '18/12/2026',
    novoAluguel: 4793.2,
    status: 'A aplicar',
    fonte: 'CT-2024-1120.pdf, pág. 3',
    confianca: 95,
  },
  {
    id: 'rea-11',
    contractNumber: 'CT-2024-1165',
    locatario: 'Luciana Freitas',
    imovel: 'Casa 02 · Alto da Lapa',
    corretorResponsavel: 'Carla Nogueira',
    aluguelAtual: 2519.5,
    indice: 'IPCA',
    percentual: 3.9,
    aniversario: '20/12/2026',
    novoAluguel: 2617.76,
    status: 'A aplicar',
    fonte: 'CT-2024-1165.pdf, pág. 3',
    confianca: 94,
  },
];

export const GUARANTEES_SUMMARY_384 = [
  { tipo: 'Caução', quantidade: 168, inadimplenciaPct: 5.4, casosInadimplentes: '9 de 168' },
  { tipo: 'Fiador', quantidade: 109, inadimplenciaPct: 3.7, casosInadimplentes: '4 de 109' },
  { tipo: 'Seguro fiança', quantidade: 74, inadimplenciaPct: 2.7, casosInadimplentes: '2 de 74' },
  { tipo: 'Título de capitalização', quantidade: 33, inadimplenciaPct: 3.0, casosInadimplentes: '1 de 33' },
];

export const EXPIRING_GUARANTEES_LIST: ExpiringGuaranteeItem[] = [
  {
    id: 'gar-1',
    contractNumber: 'CT-2024-0612',
    imovel: 'Loja 8 · Galeria Norte',
    locatario: 'Gustavo Reis',
    corretorResponsavel: 'Rafael Costa',
    tipo: 'Seguro fiança',
    vencimento: '02/12/2026',
    diasRestantes: 10,
    situacaoJur010: 'Alerta enviado',
    fonte: 'apolice_loja8.pdf, pág. 1',
    confianca: 96,
  },
  {
    id: 'gar-2',
    contractNumber: 'CT-2023-0874',
    imovel: 'Apto 1102 · Ed. Aurora',
    locatario: 'Marina Cavalcanti',
    corretorResponsavel: 'Carla Nogueira',
    tipo: 'Seguro fiança',
    vencimento: '18/12/2026',
    diasRestantes: 26,
    situacaoJur010: 'Troca proposta',
    orderId: 'ord-4828',
    orderProtocol: 'PED-2026-004828',
    fonte: 'apolice_aurora.pdf, pág. 1',
    confianca: 89,
  },
  {
    id: 'gar-3',
    contractNumber: 'CT-2022-0190',
    imovel: 'Apto 201 · Ed. Horizonte',
    locatario: 'Sérgio Monteiro',
    corretorResponsavel: 'Carla Nogueira',
    tipo: 'Sem garantia válida',
    vencimento: '10/11/2026 (vencida)',
    diasRestantes: -12,
    situacaoJur010: 'Descoberto',
    fonte: 'alerta_seguradora_nov.eml',
    confianca: 92,
  },
  {
    id: 'gar-4',
    contractNumber: 'CT-2023-0745',
    imovel: 'Casa 04 · Cond. Jardins',
    locatario: 'Vanessa Nogueira',
    corretorResponsavel: 'Rafael Costa',
    tipo: 'Sem garantia válida',
    vencimento: '05/11/2026 (resgatado)',
    diasRestantes: -17,
    situacaoJur010: 'Descoberto',
    fonte: 'aviso_banco_titulo.pdf',
    confianca: 91,
  },
  {
    id: 'gar-5',
    contractNumber: 'CT-2024-0988',
    imovel: 'Conj. 901 · Ed. Paulista Prime',
    locatario: 'Clínica Vida Plena',
    corretorResponsavel: 'Rafael Costa',
    tipo: 'Seguro fiança',
    vencimento: '10/01/2027',
    diasRestantes: 49,
    situacaoJur010: 'Alerta enviado',
    fonte: 'apolice_clinica_vida.pdf',
    confianca: 95,
  },
  {
    id: 'gar-6',
    contractNumber: 'CT-2024-1033',
    imovel: 'Apto 105 · Vila Nova',
    locatario: 'Bruno Azevedo',
    corretorResponsavel: 'Rafael Costa',
    tipo: 'Seguro fiança',
    vencimento: '28/12/2026',
    diasRestantes: 36,
    situacaoJur010: 'Sem resposta',
    fonte: 'apolice_1033.pdf',
    confianca: 93,
  },
  {
    id: 'gar-7',
    contractNumber: 'CT-2024-1088',
    imovel: 'Studio 18 · Consolação',
    locatario: 'Aline Barros',
    corretorResponsavel: 'Carla Nogueira',
    tipo: 'Título de capitalização',
    vencimento: '04/01/2027',
    diasRestantes: 43,
    situacaoJur010: 'Alerta enviado',
    fonte: 'titulo_cap_1088.pdf',
    confianca: 94,
  },
  {
    id: 'gar-8',
    contractNumber: 'CT-2024-1210',
    imovel: 'Apto 803 · Paraíso',
    locatario: 'Marcelo Gomes',
    corretorResponsavel: 'Carla Nogueira',
    tipo: 'Seguro fiança',
    vencimento: '15/01/2027',
    diasRestantes: 54,
    situacaoJur010: 'Alerta enviado',
    fonte: 'apolice_1210.pdf',
    confianca: 95,
  },
  {
    id: 'gar-9',
    contractNumber: 'CT-2024-1280',
    imovel: 'Loja 02 · Centro',
    locatario: 'Ótica Visão Clara',
    corretorResponsavel: 'Rafael Costa',
    tipo: 'Título de capitalização',
    vencimento: '19/01/2027',
    diasRestantes: 58,
    situacaoJur010: 'Sem resposta',
    fonte: 'titulo_1280.pdf',
    confianca: 92,
  },
];

export const INITIAL_RESCISSIONS: RescissionItem[] = [
  {
    id: 'res-1',
    contractNumber: 'CT-2025-0098',
    locatario: 'Beatriz Moura',
    imovel: 'Apto 405 · Ed. Vila Verde',
    etapa: 'Calculada',
    aluguel: 1920,
    multaCalculada: 1920,
    motivoCalculo: '3 aluguéis (R$ 5.760,00) × 4/12 meses restantes = R$ 1.920,00',
    impactoRepasse: 'Repasse final proporcional até 30/11 + crédito de multa ao proprietário',
    impactoVacancia: '+0,24 p.p. na vacância (entra em captação de locação em 01/12)',
    orderId: 'ord-4827',
    orderProtocol: 'PED-2026-004827',
    regraId: 'JUR-007',
    regraVersao: 1,
    fonte: 'CT-2025-0098.pdf, pág. 4',
    confianca: 91,
  },
  {
    id: 'res-2',
    contractNumber: 'CT-2025-0140',
    locatario: 'Tiago Pires',
    imovel: 'Sala 22 · Ed. Central',
    etapa: 'Vistoria de saída',
    aluguel: 3100,
    multaCalculada: 2325,
    motivoCalculo: 'Multa proporcional de 3 meses restantes sobre 12 meses = R$ 2.325,00',
    impactoRepasse: 'Aguardando laudo de saída para compensar eventual reparo no título',
    impactoVacancia: 'Sala comercial já pré-divulgada para evitar dias vagos',
    regraId: 'JUR-007',
    regraVersao: 1,
    fonte: 'CT-2025-0140.pdf, pág. 4',
    confianca: 94,
  },
  {
    id: 'res-3',
    contractNumber: 'CT-2024-0818',
    locatario: 'Lucas Andrade',
    imovel: 'Casa Rua do Lago, 9',
    etapa: 'Acerto financeiro',
    aluguel: 2900,
    multaCalculada: 0,
    motivoCalculo: 'Isento de multa após 12 meses de contrato com aviso prévio de 30 dias',
    impactoRepasse: 'Devolução parcial de caução (R$ 7.450,00 após dedução de pintura)',
    impactoVacancia: 'Imóvel entra em estoque disponível em 25/11/2026',
    regraId: 'JUR-007',
    regraVersao: 1,
    fonte: 'CT-2024-0818.pdf, pág. 5',
    confianca: 95,
  },
];

export const INITIAL_LEGAL_CASES: LegalCaseItem[] = [
  {
    id: 'jur-1',
    contractNumber: 'CT-2023-0619',
    locatario: 'Ricardo Alves',
    imovel: 'Sala 1204 · Ed. Central',
    valorRisco: 9640,
    diasAtraso: 41,
    garantia: 'Caução',
    origem: 'Financeiro (FIN-020 · D+30)',
    statusJuridico: 'Escalado ao Jurídico · Aguardando notificação pelo advogado',
    acaoJudicialIniciada: false,
    resumo:
      'Locatário comercial com 2 competências em aberto totalizando R$ 9.640,00 (41 dias de atraso). Régua FIN-020 concluída até D+30 sem acordo; dossiê completo entregue ao escritório parceiro para notificação extrajudicial.',
    reguaPercorrida: ['D+1 WhatsApp (12/10)', 'D+5 E-mail formal (16/10)', 'D+15 Notificação adm. (26/10)', 'D+30 Escalado ao Jurídico (10/11)'],
    dossieItens: [
      { item: 'Contrato CT-2023-0619 assinado', status: 'Pronto' },
      { item: 'Demonstrativo atualizado de 2 parcelas (R$ 9.640,00)', status: 'Pronto' },
      { item: 'Histórico completo de mensagens D+1 a D+30', status: 'Pronto' },
      { item: 'Comprovante de caução (R$ 13.800,00)', status: 'Anexado' },
      { item: 'Laudo de vistoria inicial', status: 'Anexado' },
    ],
    andamentosAdvogado: [
      {
        data: '18/11/2026',
        texto: 'Minuta de notificação extrajudicial revisada pelo advogado externo; envio com AR agendado.',
        fonte: 'Registrado pelo agente a partir de e-mail do advogado',
      },
      {
        data: '12/11/2026',
        texto: 'Dossiê recebido pelo escritório parceiro Prado & Associados.',
        fonte: 'Registrado pelo agente a partir de upload do advogado',
      },
    ],
    proximoPrazo: '26/11/2026 · Retorno de protocolo AR',
    advogadoExterno: 'Dr. Eduardo Prado (OAB/SP 214.890)',
    cpfMask: '***.219.840-**',
    cpfFull: '145.219.840-02',
    regraId: 'JUR-001',
    regraVersao: 1,
  },
  {
    id: 'jur-2',
    contractNumber: 'CT-2024-0302',
    locatario: 'Patrícia Lima',
    imovel: 'Casa Rua das Palmeiras, 85',
    valorRisco: 7120.5,
    diasAtraso: 33,
    garantia: 'Caução',
    origem: 'Financeiro (FIN-020 · D+30)',
    statusJuridico: 'Escalado ao Jurídico · Em análise para notificação',
    acaoJudicialIniciada: false,
    resumo:
      'Inadimplência acumulada de R$ 7.120,50 (33 dias de atraso) em locação residencial com caução. Dossiê probatório preparado pelo agente após falha na tentativa de parcelamento D+15.',
    reguaPercorrida: ['D+1 WhatsApp (21/10)', 'D+5 E-mail formal (25/10)', 'D+15 Notificação adm. (04/11)', 'D+30 Escalado ao Jurídico (19/11)'],
    dossieItens: [
      { item: 'Contrato CT-2024-0302 assinado', status: 'Pronto' },
      { item: 'Planilha de débitos + encargos (R$ 7.120,50)', status: 'Pronto' },
      { item: 'Log de comunicações FIN-020', status: 'Pronto' },
      { item: 'Recibo de depósito caução', status: 'Anexado' },
    ],
    andamentosAdvogado: [
      {
        data: '20/11/2026',
        texto: 'Dossiê conferido pelo advogado externo; aguardando validação de endereço para notificação.',
        fonte: 'Registrado pelo agente a partir de e-mail do advogado',
      },
    ],
    proximoPrazo: '27/11/2026 · Definição de notificação pelo advogado',
    advogadoExterno: 'Dr. Eduardo Prado (OAB/SP 214.890)',
    cpfMask: '***.530.712-**',
    cpfFull: '274.530.712-66',
    regraId: 'JUR-001',
    regraVersao: 1,
  },
  {
    id: 'jur-3',
    contractNumber: 'CT-2024-0055',
    locatario: 'Fernando Costa',
    imovel: 'Apto 101 · Ed. Solar',
    valorRisco: 3150,
    diasAtraso: 31,
    garantia: 'Fiador',
    origem: 'Financeiro (FIN-020 · D+30)',
    statusJuridico: 'Ação judicial iniciada (Execução / Despejo)',
    acaoJudicialIniciada: true,
    resumo:
      'Contrato com ação judicial iniciada pelo advogado externo (R$ 3.150,00 em aberto há 31 dias, garantia Fiador). Qualquer proposta de acordo ou rescisão aciona o conflito JUR-007 × FIN-014 e exige aprovação obrigatória do Jurídico.',
    reguaPercorrida: ['D+1 WhatsApp', 'D+5 E-mail formal', 'D+15 Notificação adm.', 'D+30 Escalado (22/10)', 'Ação protocolada (14/11)'],
    dossieItens: [
      { item: 'Contrato CT-2024-0055 + escritura do fiador', status: 'Pronto' },
      { item: 'Memória de cálculo judicial (R$ 3.150,00)', status: 'Pronto' },
      { item: 'Comunicações FIN-020 anexadas aos autos', status: 'Pronto' },
      { item: 'Cópia da petição inicial protocolada', status: 'Anexado' },
    ],
    andamentosAdvogado: [
      {
        data: '14/11/2026',
        texto: 'Petição inicial protocolada em 14/11/2026.',
        fonte: 'Registrado pelo agente a partir de e-mail do advogado',
      },
    ],
    proximoPrazo: '04/12/2026 · Prazo de citação do locatário e fiador',
    advogadoExterno: 'Dr. Eduardo Prado (OAB/SP 214.890)',
    cpfMask: '***.612.904-**',
    cpfFull: '198.612.904-55',
    regraId: 'JUR-007',
    regraVersao: 1,
    conflitoFin014: true,
  },
];

export const INITIAL_DOCUMENT_TRIAGE: DocumentTriageItem[] = [
  {
    id: 'doc-1',
    arquivo: 'rg_cnh_fiador_aurora.jpg',
    origem: 'E-mail',
    contratoRelacionado: 'CT-2023-0874 (Marina Cavalcanti)',
    tipoReconhecido: 'Documento de identidade do fiador',
    confianca: 78,
    status: 'Baixa confiança',
    fonte: 'rg_cnh_fiador_aurora.jpg, pág. 1',
    camposExtraidos: [
      { campo: 'Nome completo', valor: 'Antônio Carlos Cavalcanti', pagina: 'pág. 1' },
      { campo: 'CPF (leitura parcial)', valor: '***.418.902-**', pagina: 'pág. 1' },
    ],
  },
  {
    id: 'doc-2',
    arquivo: 'apolice_seguro_loja8_rascunho.pdf',
    origem: 'WhatsApp',
    contratoRelacionado: 'CT-2024-0612 (Gustavo Reis)',
    tipoReconhecido: 'Proposta de renovação de Seguro fiança',
    confianca: 81,
    status: 'Baixa confiança',
    fonte: 'apolice_seguro_loja8_rascunho.pdf, pág. 1–2',
    camposExtraidos: [
      { campo: 'Vigência proposta', valor: '02/12/2026 a 01/12/2027', pagina: 'pág. 1' },
      { campo: 'Cobertura mensal', valor: 'R$ 5.314,20', pagina: 'pág. 2' },
    ],
  },
  {
    id: 'doc-3',
    arquivo: 'certidao_matric_418.pdf',
    origem: 'Upload de documentos',
    contratoRelacionado: 'CT-2026-0112 (Rua das Acácias, 418)',
    tipoReconhecido: 'Matrícula atualizada do imóvel',
    confianca: 74,
    status: 'Baixa confiança',
    fonte: 'certidao_matric_418.pdf, pág. 3',
    camposExtraidos: [
      { campo: 'Matrícula', valor: '89.412 · 4º RI', pagina: 'pág. 1' },
      { campo: 'Ônus / Averbações', valor: 'Texto manuscrito na margem', pagina: 'pág. 3' },
    ],
  },
  {
    id: 'doc-4',
    arquivo: 'comprovante_renda_scan.jpg',
    origem: 'WhatsApp',
    contratoRelacionado: 'CT-2026-0149 (Novo candidato Apto 901)',
    tipoReconhecido: 'Comprovante de renda',
    confianca: 79,
    status: 'Baixa confiança',
    fonte: 'comprovante_renda_scan.jpg, pág. 1',
    camposExtraidos: [
      { campo: 'Renda líquida apurada', valor: 'R$ 11.400,00', pagina: 'pág. 1' },
    ],
  },
  {
    id: 'doc-5',
    arquivo: 'contrato_sala804_paulista_assinado.pdf',
    origem: 'Upload de documentos',
    contratoRelacionado: 'CT-2026-0044 (Nexo Tech)',
    tipoReconhecido: 'Contrato de locação comercial assinado',
    confianca: 95,
    status: 'Pendente',
    fonte: 'contrato_sala804_paulista_assinado.pdf, pág. 1–11',
    camposExtraidos: [
      { campo: 'Aluguel mensal', valor: 'R$ 5.800,00', pagina: 'pág. 2' },
      { campo: 'Início', valor: '01/12/2026', pagina: 'pág. 1' },
    ],
  },
  {
    id: 'doc-6',
    arquivo: 'certidao_cnd_iptu_2025.pdf',
    origem: 'E-mail',
    contratoRelacionado: 'CT-2023-0745 (Casa 04)',
    tipoReconhecido: 'Certidão negativa vencida',
    confianca: 93,
    status: 'Vencido',
    fonte: 'certidao_cnd_iptu_2025.pdf, pág. 1',
    camposExtraidos: [
      { campo: 'Validade expirada em', valor: '15/11/2026', pagina: 'pág. 1' },
    ],
  },
];

export const MANDATORY_DOC_CHECKLISTS: {
  tipo: ContractType;
  itens: string[];
}[] = [
  {
    tipo: 'Locação residencial',
    itens: [
      'Identidade (RG ou CNH)',
      'CPF regular',
      'Comprovante de renda',
      'Comprovante de residência',
      'Documento da garantia (fiador, apólice ou caução)',
      'Laudo de vistoria inicial',
    ],
  },
  {
    tipo: 'Locação comercial',
    itens: [
      'Todos os documentos da Locação residencial',
      'Contrato social consolidado / Alterações',
      'Documentos pessoais (RG/CPF) dos sócios administradores',
    ],
  },
  {
    tipo: 'Administração',
    itens: [
      'Matrícula atualizada do imóvel',
      'Identidade do proprietário',
      'Dados bancários validados para repasse',
    ],
  },
  {
    tipo: 'Compra e venda',
    itens: [
      'Matrícula atualizada (validade 30 dias)',
      'Certidões negativas (tributos municipais, estaduais, federais e trabalhistas)',
    ],
  },
];

export const PENDING_SIGNATURES_LIST: PendingSignatureItem[] = [
  {
    id: 'sig-1',
    contractNumber: 'CT-2024-0988',
    imovel: 'Conj. 901 · Ed. Paulista Prime',
    signatario: 'Clínica Vida Plena',
    papel: 'Inquilino',
    diasAguardando: 6,
    provedor: 'provedor a definir',
    ultimoLembrete: '18/11/2026 · 14:20',
  },
  {
    id: 'sig-2',
    contractNumber: 'CT-2024-1144',
    imovel: 'Apto 601 · Perdizes',
    signatario: 'Vanessa Lopes',
    papel: 'Inquilino',
    diasAguardando: 5,
    provedor: 'provedor a definir',
    ultimoLembrete: '19/11/2026 · 10:05',
  },
  {
    id: 'sig-3',
    contractNumber: 'CT-2025-0140',
    imovel: 'Sala 22 · Ed. Central',
    signatario: 'Tiago Pires',
    papel: 'Inquilino',
    diasAguardando: 4,
    provedor: 'provedor a definir',
    ultimoLembrete: '20/11/2026 · 16:40',
  },
  {
    id: 'sig-4',
    contractNumber: 'CT-2026-0112',
    imovel: 'Rua das Acácias, 418',
    signatario: 'Juliana Martins',
    papel: 'Inquilino',
    diasAguardando: 4,
    provedor: 'provedor a definir',
    ultimoLembrete: '19/11/2026 · 11:30',
  },
  {
    id: 'sig-5',
    contractNumber: 'CT-2024-0903',
    imovel: 'Apto 704 · Ed. Moema Park',
    signatario: 'Henrique Campos',
    papel: 'Proprietário',
    diasAguardando: 4,
    provedor: 'provedor a definir',
    ultimoLembrete: '20/11/2026 · 09:15',
  },
  {
    id: 'sig-6',
    contractNumber: 'CT-2024-0818',
    imovel: 'Casa Rua do Lago, 9',
    signatario: 'Lucas Andrade',
    papel: 'Inquilino',
    diasAguardando: 3,
    provedor: 'provedor a definir',
    ultimoLembrete: '21/11/2026 · 15:00',
  },
];

export const APPROVED_TEMPLATES_LIST: ApprovedTemplateItem[] = [
  {
    id: 'tpl-1',
    nome: 'Locação residencial',
    versao: 'v7',
    aprovadoPor: 'Jurídico Farina (Dra. Helena)',
    dataAprovacao: '10/10/2026',
    usos30d: 34,
  },
  {
    id: 'tpl-2',
    nome: 'Locação comercial',
    versao: 'v4',
    aprovadoPor: 'Jurídico Farina (Dra. Helena)',
    dataAprovacao: '02/09/2026',
    usos30d: 12,
  },
  {
    id: 'tpl-3',
    nome: 'Administração',
    versao: 'v5',
    aprovadoPor: 'Gestor + Jurídico Farina',
    dataAprovacao: '18/08/2026',
    usos30d: 9,
  },
  {
    id: 'tpl-4',
    nome: 'Aditivo de renovação',
    versao: 'v3',
    aprovadoPor: 'Jurídico Farina (Dra. Helena)',
    dataAprovacao: '05/11/2026',
    usos30d: 26,
  },
  {
    id: 'tpl-5',
    nome: 'Termo de rescisão',
    versao: 'v2',
    aprovadoPor: 'Jurídico Farina (Dra. Helena)',
    dataAprovacao: '14/09/2026',
    usos30d: 5,
  },
  {
    id: 'tpl-6',
    nome: 'Notificação de cobrança (comunicado administrativo)',
    versao: 'v2',
    aprovadoPor: 'Jurídico Farina + Financeiro',
    dataAprovacao: '03/11/2026',
    usos30d: 18,
    observacao: 'Usada na etapa D+15 da régua FIN-020',
  },
];

export const REFERENCE_INDICES_DISCLAIMER =
  'valores de exemplo; em produção vêm da fonte oficial';
export const CALCULATION_HUMAN_CHECK_LABEL =
  'Apoio ao cálculo. Conferência humana obrigatória.';
