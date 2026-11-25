export type GestorSectionFilter =
  | 'todos'
  | 'carteira-contas'
  | 'alugueis-repasses'
  | 'garantias-reajustes'
  | 'financeiro-automacao';

export type PortfolioStatusKey =
  | 'ativos'
  | 'em_cobranca'
  | 'processo_juridico'
  | 'escritorio_cobranca'
  | 'vencendo_180d'
  | 'vencendo_60d'
  | 'vencidos'
  | 'desativados'
  | 'em_sinistro';

export interface PortfolioStatusCard {
  key: PortfolioStatusKey;
  label: string;
  count: number;
  tone: 'normal' | 'atencao' | 'critico' | 'neutro';
  description: string;
  requiresAction: boolean;
}

export interface GestorContractSummary {
  id: string;
  contrato: string;
  imovel: string;
  inquilino: string;
  proprietario: string;
  corretor: string;
  statusKey: PortfolioStatusKey;
  statusLabel: string;
  valorAluguel: number;
  inicioVigencia: string;
  fimVigencia: string;
  observacao: string;
}

export type OverdueObligationCategory =
  | 'IPTU'
  | 'Condomínio'
  | 'Energia'
  | 'Água'
  | 'Seguro incêndio'
  | 'Gás'
  | 'Seguro fiança'
  | 'Guia IRRF';

export interface OverdueObligationCategorySummary {
  category: OverdueObligationCategory;
  count: number;
  totalValue: number;
  highVolume: boolean;
  note: string;
}

export interface OverdueObligationItem {
  id: string;
  category: OverdueObligationCategory;
  contrato: string;
  imovel: string;
  responsavel: 'Inquilino' | 'Proprietário';
  nomeResponsavel: string;
  competencia: string;
  vencimento: string;
  diasAtraso: number;
  valor: number;
  situacao: 'Em aberto' | 'Cobrança enviada' | 'Aguardando guia';
}

export interface UpcomingRentItem {
  id: string;
  contrato: string;
  imovel: string;
  inquilino: string;
  corretor: string;
  vencimento: string;
  diasParaVencer: number;
  valor: number;
  lembreteStatus: 'Agendado' | 'Enviado' | 'Boleto emitido';
}

export type OverdueRentStatus =
  | 'Em atraso'
  | 'Em negociação'
  | 'Notificado'
  | 'Processo jurídico';

export interface OverdueRentItem {
  id: string;
  contrato: string;
  imovel: string;
  inquilino: string;
  corretor: string;
  competencia: string;
  vencimento: string;
  diasAtraso: number;
  valor: number;
  situacaoCobranca: OverdueRentStatus;
  ultimaProvidencia: string;
  historico: { data: string; evento: string; responsavel: string }[];
}

export interface UpcomingPayoutItem {
  id: string;
  contrato: string;
  imovel: string;
  proprietario: string;
  dataPrevista: string;
  valor: number;
  aluguelRecebido: 'Confirmado' | 'Compensando' | 'Garantido';
  contaDestino: string;
}

export interface OverduePayoutItem {
  id: string;
  contrato: string;
  imovel: string;
  proprietario: string;
  dataPrevista: string;
  diasAtraso: number;
  valor: number;
  situacaoRepasse: 'Aguardando conciliação' | 'Retido por documentação' | 'Em processamento' | 'Pendência bancária';
  statusAluguelInquilino: 'Recebido pelo inquilino' | 'Parcialmente recebido' | 'Aguardando baixa';
  historicoProprietario: { data: string; competencia: string; valor: number; status: 'Pago' | 'Atrasado' }[];
}

export type GuaranteeType = 'Seguro fiança' | 'Seguro incêndio' | 'Carta fiança';

export interface GuaranteeCounterSummary {
  type: GuaranteeType;
  expiring30d: number;
  expired: number;
  note: string;
}

export interface GuaranteeRecordItem {
  id: string;
  contrato: string;
  imovel: string;
  inquilino: string;
  tipo: GuaranteeType;
  instituicao: string;
  dataInicio: string;
  dataVencimento: string;
  situacao: 'Vencido' | 'Vence em 30 dias';
  diasRestantes: number;
  documentoCodigo: string;
  valorCobertura: number;
}

export interface AdjustmentRecordItem {
  id: string;
  contrato: string;
  imovel: string;
  inquilino: string;
  dataReajuste: string;
  situacao: 'Vencido' | 'Vence em 30 dias';
  diasDiferenca: number;
  indice: 'IGP-M' | 'IPCA' | 'INPC';
  percentualAplicado: number;
  aluguelAtual: number;
  aluguelProjetado: number;
  statusAplicacao: 'Pendente cálculo' | 'Aguardando aprovação' | 'Pronto p/ envio' | 'Em revisão jurídica';
  historicoReajustes: { ano: string; indice: string; percentual: string; valorAnterior: number; valorNovo: number }[];
}

export type FinancialEvolutionRange = '6m' | '12m' | '1sem';

export interface FinancialEvolutionPoint {
  mes: string;
  alugueisLiquidos: number;
  alugueisBrutos: number;
  taxaAdministrativa: number;
  taxaContrato: number;
  administracoesRecebidas: number;
  mensalidadesGeradas: number;
}

export type BillingWindowOption = '24h' | '7d' | 'mes';

export interface GeneratedBillingItem {
  id: string;
  vencimento: string;
  contrato: string;
  imovel: string;
  inquilino: string;
  valor: number;
  status: 'Gerada · em aberto' | 'Gerada · recebida';
  geradaEm: string;
  composicao: { item: string; valor: number }[];
}

export interface EmailAutomationDay {
  id: string;
  dia: string;
  enviados: number;
  naoEnviados: number;
  taxaEntregaPct: number;
  falhas: {
    id: string;
    horario: string;
    destinatario: string;
    contrato: string;
    assunto: string;
    motivoFalha: string;
  }[];
}

export interface FiscalNoteDay {
  id: string;
  dia: string;
  geradas: number;
  pendentes: number;
  emitidas: number;
  erros: number;
  registros: {
    id: string;
    rps: string;
    nfseNumero?: string;
    tomador: string;
    contrato: string;
    valor: number;
    estado: 'Emitida' | 'Pendente' | 'Erro';
    detalheErro?: string;
  }[];
}

export interface AdhocOverdueCharge {
  id: string;
  contrato: string;
  imovel: string;
  responsavelCobranca: string;
  origem: string;
  vencimento: string;
  diasAtraso: number;
  valor: number;
  situacao: 'Aguardando quitação' | 'Boleto vencido · reemitir' | 'Em contestação';
  historico: { data: string; evento: string }[];
}

export interface IndicatorDictionaryItem {
  id: string;
  bloco: string;
  nome: string;
  definicaoFuncional: string;
  regraCalculo: string;
  fonteDados: string;
  dataReferencia: string;
  ultimaAtualizacao: string;
  criterioInclusaoExclusao: string;
}

// ---------------------------------------------------------------------------
// BLOCO 1 — RESUMO DA CARTEIRA DE CONTRATOS (Total ativo + especiais = 587 / desativados = 1.017)
// ---------------------------------------------------------------------------

export const PORTFOLIO_STATUS_CARDS: PortfolioStatusCard[] = [
  {
    key: 'ativos',
    label: 'Ativos',
    count: 550,
    tone: 'normal',
    description: 'Contratos vigentes em operação regular',
    requiresAction: false,
  },
  {
    key: 'em_cobranca',
    label: 'Em cobrança',
    count: 0,
    tone: 'neutro',
    description: 'Contratos em régua formal de cobrança externa',
    requiresAction: false,
  },
  {
    key: 'processo_juridico',
    label: 'Processo jurídico',
    count: 3,
    tone: 'critico',
    description: 'Ações judiciais ou despejo em andamento',
    requiresAction: true,
  },
  {
    key: 'escritorio_cobranca',
    label: 'Escritório de cobrança',
    count: 0,
    tone: 'neutro',
    description: 'Contratos terceirizados para assessoria',
    requiresAction: false,
  },
  {
    key: 'vencendo_180d',
    label: 'Vencendo em 180 dias',
    count: 22,
    tone: 'atencao',
    description: 'Janela de renovação estratégica (91 a 180d)',
    requiresAction: true,
  },
  {
    key: 'vencendo_60d',
    label: 'Vencendo em 60 dias',
    count: 5,
    tone: 'atencao',
    description: 'Exigem definição imediata de renovação/saída',
    requiresAction: true,
  },
  {
    key: 'vencidos',
    label: 'Contratos vencidos',
    count: 7,
    tone: 'critico',
    description: 'Prazo determinado expirado sem aditivo',
    requiresAction: true,
  },
  {
    key: 'desativados',
    label: 'Desativados',
    count: 1017,
    tone: 'neutro',
    description: 'Contratos encerrados e rescindidos históricos',
    requiresAction: false,
  },
  {
    key: 'em_sinistro',
    label: 'Em sinistro',
    count: 0,
    tone: 'neutro',
    description: 'Ocorrências com seguro acionado',
    requiresAction: false,
  },
];

export const GESTOR_CONTRACTS_SAMPLE: GestorContractSummary[] = [
  // 3 Processo jurídico
  {
    id: 'gc-jur-1',
    contrato: 'CT-2023-0312',
    imovel: 'Rua dos Pinheiros, 840 · Apto 72',
    inquilino: 'Marcos Aurélio Tavares',
    proprietario: 'Heloísa Bastos',
    corretor: 'Rafael Souza',
    statusKey: 'processo_juridico',
    statusLabel: 'Processo jurídico',
    valorAluguel: 3450,
    inicioVigencia: '10/03/2023',
    fimVigencia: '09/03/2026',
    observacao: 'Ação de despejo por falta de pagamento (134 dias). Dossiê acompanhado por Dr. Renato.',
  },
  {
    id: 'gc-jur-2',
    contrato: 'CT-2022-0904',
    imovel: 'Av. Paulista, 1450 · Conj. 504',
    inquilino: 'Norte Sul Consultoria Ltda',
    proprietario: 'Edifício Paulista Investimentos',
    corretor: 'Marina Costa',
    statusKey: 'processo_juridico',
    statusLabel: 'Processo jurídico',
    valorAluguel: 5800,
    inicioVigencia: '01/11/2022',
    fimVigencia: '31/10/2025',
    observacao: 'Execução de aluguéis e encargos em curso na 14ª Vara Cível.',
  },
  {
    id: 'gc-jur-3',
    contrato: 'CT-2024-0188',
    imovel: 'Rua das Magnólias, 192 · Casa 2',
    inquilino: 'Patrícia Azevedo Lima',
    proprietario: 'Roberto Vasconcelos',
    corretor: 'Rafael Souza',
    statusKey: 'processo_juridico',
    statusLabel: 'Processo jurídico',
    valorAluguel: 2790,
    inicioVigencia: '15/02/2024',
    fimVigencia: '14/02/2027',
    observacao: 'Acordo judicial homologado; aguardando depósito da 2ª parcela.',
  },
  // 7 Contratos vencidos
  {
    id: 'gc-ven-1',
    contrato: 'CT-2023-0941',
    imovel: 'Rua Bela Cintra, 610 · Apto 31',
    inquilino: 'Luciana Ferreira Prado',
    proprietario: 'Sérgio Monteiro',
    corretor: 'Marina Costa',
    statusKey: 'vencidos',
    statusLabel: 'Contratos vencidos',
    valorAluguel: 2950,
    inicioVigencia: '05/10/2023',
    fimVigencia: '04/10/2026',
    observacao: 'Vencido há 49 dias; operando por prazo indeterminado, minuta de aditivo pronta.',
  },
  {
    id: 'gc-ven-2',
    contrato: 'CT-2023-1022',
    imovel: 'Rua Domingos de Morais, 1180 · Sala 12',
    inquilino: 'Clínica Odonto Vida',
    proprietario: 'Patrimonial Morais S.A.',
    corretor: 'Lucas Nogueira',
    statusKey: 'vencidos',
    statusLabel: 'Contratos vencidos',
    valorAluguel: 4200,
    inicioVigencia: '12/11/2023',
    fimVigencia: '11/11/2026',
    observacao: 'Inquilino solicitou renovação de 36 meses; aguardando retorno do proprietário.',
  },
  {
    id: 'gc-ven-3',
    contrato: 'CT-2023-0887',
    imovel: 'Rua Vergueiro, 2240 · Apto 94',
    inquilino: 'Tiago Henrique Campos',
    proprietario: 'Marta Helena Silveira',
    corretor: 'Rafael Souza',
    statusKey: 'vencidos',
    statusLabel: 'Contratos vencidos',
    valorAluguel: 2400,
    inicioVigencia: '20/09/2023',
    fimVigencia: '19/09/2026',
    observacao: 'Renovação tácita em vigor; proprietário avaliando atualização de valor de mercado.',
  },
  {
    id: 'gc-ven-4',
    contrato: 'CT-2023-1055',
    imovel: 'Alameda Santos, 780 · Conj. 22',
    inquilino: 'Studio Ágil Arquitetura',
    proprietario: 'Carlos Eduardo Ribeiro',
    corretor: 'Marina Costa',
    statusKey: 'vencidos',
    statusLabel: 'Contratos vencidos',
    valorAluguel: 3900,
    inicioVigencia: '01/11/2023',
    fimVigencia: '31/10/2026',
    observacao: 'Seguro fiança renovado; falta assinatura eletrônica do aditivo.',
  },
  {
    id: 'gc-ven-5',
    contrato: 'CT-2023-0975',
    imovel: 'Rua Augusta, 1920 · Apto 45',
    inquilino: 'Camila Duarte Nogueira',
    proprietario: 'Helena Guimarães',
    corretor: 'Lucas Nogueira',
    statusKey: 'vencidos',
    statusLabel: 'Contratos vencidos',
    valorAluguel: 2650,
    inicioVigencia: '15/10/2023',
    fimVigencia: '14/10/2026',
    observacao: 'Aguardando definição entre prorrogação por 12 meses ou desocupação.',
  },
  {
    id: 'gc-ven-6',
    contrato: 'CT-2023-1081',
    imovel: 'Rua Haddock Lobo, 412 · Loja 3',
    inquilino: 'Café & Prosa Comércio',
    proprietario: 'Grupo Lobo Participações',
    corretor: 'Rafael Souza',
    statusKey: 'vencidos',
    statusLabel: 'Contratos vencidos',
    valorAluguel: 6100,
    inicioVigencia: '18/11/2023',
    fimVigencia: '17/11/2026',
    observacao: 'Negociação comercial de novo prazo em andamento.',
  },
  {
    id: 'gc-ven-7',
    contrato: 'CT-2023-0918',
    imovel: 'Rua Tutóia, 515 · Apto 101',
    inquilino: 'Gustavo Moura Reis',
    proprietario: 'Antônio Carlos Dias',
    corretor: 'Marina Costa',
    statusKey: 'vencidos',
    statusLabel: 'Contratos vencidos',
    valorAluguel: 3300,
    inicioVigencia: '28/09/2023',
    fimVigencia: '27/09/2026',
    observacao: 'Minuta enviada ao inquilino; aguardando aceite.',
  },
  // 5 Vencendo em 60 dias
  {
    id: 'gc-60-1',
    contrato: 'CT-2024-0012',
    imovel: 'Av. Brigadeiro Luís Antônio, 3200 · Apto 61',
    inquilino: 'Fernanda Oliveira Rocha',
    proprietario: 'Sérgio Monteiro',
    corretor: 'Marina Costa',
    statusKey: 'vencendo_60d',
    statusLabel: 'Vencendo em 60 dias',
    valorAluguel: 3150,
    inicioVigencia: '05/01/2024',
    fimVigencia: '04/01/2027',
    observacao: 'Vence em 43 dias. Proprietário já sinalizou interesse em renovar com IPCA.',
  },
  {
    id: 'gc-60-2',
    contrato: 'CT-2024-0028',
    imovel: 'Rua Pamplona, 905 · Apto 88',
    inquilino: 'Bruno César Martins',
    proprietario: 'Clara Mendonça',
    corretor: 'Rafael Souza',
    statusKey: 'vencendo_60d',
    statusLabel: 'Vencendo em 60 dias',
    valorAluguel: 2880,
    inicioVigencia: '12/01/2024',
    fimVigencia: '11/01/2027',
    observacao: 'Vence em 50 dias. Consulta de intenção enviada ao inquilino via WhatsApp.',
  },
  {
    id: 'gc-60-3',
    contrato: 'CT-2024-0031',
    imovel: 'Rua Joaquim Floriano, 466 · Conj. 901',
    inquilino: 'Vértice Tecnologia Ltda',
    proprietario: 'Fundo Floriano',
    corretor: 'Lucas Nogueira',
    statusKey: 'vencendo_60d',
    statusLabel: 'Vencendo em 60 dias',
    valorAluguel: 7400,
    inicioVigencia: '15/01/2024',
    fimVigencia: '14/01/2027',
    observacao: 'Vence em 53 dias. Análise de renovação contratual e seguro fiança em curso.',
  },
  {
    id: 'gc-60-4',
    contrato: 'CT-2024-0045',
    imovel: 'Rua Oscar Freire, 1120 · Apto 32',
    inquilino: 'Juliana Salles Moreira',
    proprietario: 'Eduardo Salles',
    corretor: 'Marina Costa',
    statusKey: 'vencendo_60d',
    statusLabel: 'Vencendo em 60 dias',
    valorAluguel: 4600,
    inicioVigencia: '20/12/2023',
    fimVigencia: '19/12/2026',
    observacao: 'Vence em 27 dias. Aviso de desocupação não recebido; proposta de aditivo enviada.',
  },
  {
    id: 'gc-60-5',
    contrato: 'CT-2024-0052',
    imovel: 'Rua Cubatão, 310 · Apto 14',
    inquilino: 'Daniela Teixeira Ramos',
    proprietario: 'Helena Guimarães',
    corretor: 'Rafael Souza',
    statusKey: 'vencendo_60d',
    statusLabel: 'Vencendo em 60 dias',
    valorAluguel: 2350,
    inicioVigencia: '10/01/2024',
    fimVigencia: '09/01/2027',
    observacao: 'Vence em 48 dias. Aguardando confirmação de fiador ou troca de garantia.',
  },
  // Sample Vencendo em 180 dias (22 total)
  {
    id: 'gc-180-1',
    contrato: 'CT-2024-0190',
    imovel: 'Rua dos Três Irmãos, 412 · Apto 24',
    inquilino: 'André Luiz Baptista',
    proprietario: 'Sérgio Monteiro',
    corretor: 'Marina Costa',
    statusKey: 'vencendo_180d',
    statusLabel: 'Vencendo em 180 dias',
    valorAluguel: 2700,
    inicioVigencia: '01/03/2024',
    fimVigencia: '28/02/2027',
    observacao: 'Vence em 98 dias. Bom histórico de pontualidade.',
  },
  {
    id: 'gc-180-2',
    contrato: 'CT-2024-0244',
    imovel: 'Av. Rebouças, 2100 · Conj. 41',
    inquilino: 'Atlas Contabilidade ME',
    proprietario: 'Patrimonial Rebouças',
    corretor: 'Lucas Nogueira',
    statusKey: 'vencendo_180d',
    statusLabel: 'Vencendo em 180 dias',
    valorAluguel: 4950,
    inicioVigencia: '15/03/2024',
    fimVigencia: '14/03/2027',
    observacao: 'Vence em 112 dias. Agente agendou alerta de renovação para janeiro.',
  },
  {
    id: 'gc-180-3',
    contrato: 'CT-2024-0318',
    imovel: 'Rua França Pinto, 780 · Apto 51',
    inquilino: 'Beatriz Cardoso Alves',
    proprietario: 'Roberto Vasconcelos',
    corretor: 'Rafael Souza',
    statusKey: 'vencendo_180d',
    statusLabel: 'Vencendo em 180 dias',
    valorAluguel: 3100,
    inicioVigencia: '01/04/2024',
    fimVigencia: '31/03/2027',
    observacao: 'Vence em 129 dias. Contrato com IGP-M.',
  },
  {
    id: 'gc-180-4',
    contrato: 'CT-2024-0402',
    imovel: 'Rua Mourato Coelho, 620 · Casa 1',
    inquilino: 'Felipe Rocha Menezes',
    proprietario: 'Clara Mendonça',
    corretor: 'Marina Costa',
    statusKey: 'vencendo_180d',
    statusLabel: 'Vencendo em 180 dias',
    valorAluguel: 4400,
    inicioVigencia: '20/04/2024',
    fimVigencia: '19/04/2027',
    observacao: 'Vence em 148 dias. Garantia seguro incêndio vence em março.',
  },
  // Sample Ativos (550 total)
  {
    id: 'gc-atv-1',
    contrato: 'CT-2025-0412',
    imovel: 'Rua Melo Alves, 480 · Apto 112',
    inquilino: 'Carlos Mendes',
    proprietario: 'Sérgio Monteiro',
    corretor: 'Marina Costa',
    statusKey: 'ativos',
    statusLabel: 'Ativos',
    valorAluguel: 3200,
    inicioVigencia: '01/06/2025',
    fimVigencia: '31/05/2028',
    observacao: 'Pagamentos em dia · Seguro incêndio vigente.',
  },
  {
    id: 'gc-atv-2',
    contrato: 'CT-2025-0519',
    imovel: 'Av. Angélica, 1820 · Apto 63',
    inquilino: 'Renata Vasconcelos',
    proprietario: 'Helena Guimarães',
    corretor: 'Rafael Souza',
    statusKey: 'ativos',
    statusLabel: 'Ativos',
    valorAluguel: 3850,
    inicioVigencia: '10/08/2025',
    fimVigencia: '09/08/2028',
    observacao: 'Repasse automático ativo via D+2.',
  },
  {
    id: 'gc-atv-3',
    contrato: 'CT-2026-0118',
    imovel: 'Rua João Cachoeira, 910 · Sala 8',
    inquilino: 'Lumina Estética Ltda',
    proprietario: 'Grupo Lobo Participações',
    corretor: 'Lucas Nogueira',
    statusKey: 'ativos',
    statusLabel: 'Ativos',
    valorAluguel: 5200,
    inicioVigencia: '01/03/2026',
    fimVigencia: '28/02/2029',
    observacao: 'Contrato comercial adimplente.',
  },
  // Sample Desativados (1.017 total)
  {
    id: 'gc-des-1',
    contrato: 'CT-2024-0818',
    imovel: 'Casa Rua do Lago, 9',
    inquilino: 'Lucas Andrade',
    proprietario: 'Sérgio Monteiro',
    corretor: 'Marina Costa',
    statusKey: 'desativados',
    statusLabel: 'Desativados',
    valorAluguel: 2900,
    inicioVigencia: '08/02/2023',
    fimVigencia: '19/11/2026',
    observacao: 'Rescindido em 19/11/2026 · vistoria de saída em conferência.',
  },
  {
    id: 'gc-des-2',
    contrato: 'CT-2021-0440',
    imovel: 'Rua Alves Guimarães, 310 · Apto 21',
    inquilino: 'Paula Cristina Moraes',
    proprietario: 'Marta Helena Silveira',
    corretor: 'Rafael Souza',
    statusKey: 'desativados',
    statusLabel: 'Desativados',
    valorAluguel: 2450,
    inicioVigencia: '01/07/2021',
    fimVigencia: '30/06/2026',
    observacao: 'Encerrado com quitação integral e devolução de caução.',
  },
];

// ---------------------------------------------------------------------------
// BLOCO 2 — CONTROLE DE CONTAS VENCIDAS (778 obrigações no total)
// ---------------------------------------------------------------------------

export const OVERDUE_OBLIGATIONS_SUMMARY: OverdueObligationCategorySummary[] = [
  {
    category: 'IPTU',
    count: 537,
    totalValue: 198420,
    highVolume: true,
    note: 'Parcelas municipais vencidas em múltiplos contratos (múltiplas cotas por imóvel)',
  },
  {
    category: 'Seguro incêndio',
    count: 239,
    totalValue: 54970,
    highVolume: true,
    note: 'Apólices anuais ou parcelas obrigatórias pendentes de renovação/baixa',
  },
  {
    category: 'Condomínio',
    count: 1,
    totalValue: 890,
    highVolume: false,
    note: 'Cota condominial vencida em conferência com a administradora',
  },
  {
    category: 'Guia IRRF',
    count: 1,
    totalValue: 412.5,
    highVolume: false,
    note: 'DARF mensal retido na fonte aguardando validação fiscal',
  },
  {
    category: 'Energia',
    count: 0,
    totalValue: 0,
    highVolume: false,
    note: 'Nenhuma conta de energia vencida sob responsabilidade da carteira',
  },
  {
    category: 'Água',
    count: 0,
    totalValue: 0,
    highVolume: false,
    note: 'Nenhuma pendência de água/saneamento em aberto',
  },
  {
    category: 'Gás',
    count: 0,
    totalValue: 0,
    highVolume: false,
    note: 'Sem contas de gás vencidas no período',
  },
  {
    category: 'Seguro fiança',
    count: 0,
    totalValue: 0,
    highVolume: false,
    note: 'Parcelas de seguro fiança adimplentes junto às seguradoras',
  },
];

export const OVERDUE_OBLIGATIONS_SAMPLE: OverdueObligationItem[] = [
  // Notice CT-2023-0941 appears in both IPTU and Seguro incêndio to demonstrate obligations != unique contracts
  {
    id: 'ob-1',
    category: 'IPTU',
    contrato: 'CT-2023-0941',
    imovel: 'Rua Bela Cintra, 610 · Apto 31',
    responsavel: 'Inquilino',
    nomeResponsavel: 'Luciana Ferreira Prado',
    competencia: 'Cota 09/2026',
    vencimento: '15/09/2026',
    diasAtraso: 68,
    valor: 385.4,
    situacao: 'Cobrança enviada',
  },
  {
    id: 'ob-2',
    category: 'IPTU',
    contrato: 'CT-2023-0941',
    imovel: 'Rua Bela Cintra, 610 · Apto 31',
    responsavel: 'Inquilino',
    nomeResponsavel: 'Luciana Ferreira Prado',
    competencia: 'Cota 10/2026',
    vencimento: '15/10/2026',
    diasAtraso: 38,
    valor: 385.4,
    situacao: 'Em aberto',
  },
  {
    id: 'ob-3',
    category: 'IPTU',
    contrato: 'CT-2022-0904',
    imovel: 'Av. Paulista, 1450 · Conj. 504',
    responsavel: 'Inquilino',
    nomeResponsavel: 'Norte Sul Consultoria Ltda',
    competencia: 'Cota 08/2026',
    vencimento: '20/08/2026',
    diasAtraso: 94,
    valor: 1120,
    situacao: 'Cobrança enviada',
  },
  {
    id: 'ob-4',
    category: 'IPTU',
    contrato: 'CT-2024-0612',
    imovel: 'Rua Cardeal Arcoverde, 1502 · Apto 41',
    responsavel: 'Inquilino',
    nomeResponsavel: 'Rodrigo Almeida Prado',
    competencia: 'Cota 10/2026',
    vencimento: '25/10/2026',
    diasAtraso: 28,
    valor: 294.8,
    situacao: 'Em aberto',
  },
  {
    id: 'ob-5',
    category: 'Seguro incêndio',
    contrato: 'CT-2023-0941',
    imovel: 'Rua Bela Cintra, 610 · Apto 31',
    responsavel: 'Inquilino',
    nomeResponsavel: 'Luciana Ferreira Prado',
    competencia: 'Renovação 2026/2027',
    vencimento: '04/10/2026',
    diasAtraso: 49,
    valor: 268,
    situacao: 'Cobrança enviada',
  },
  {
    id: 'ob-6',
    category: 'Seguro incêndio',
    contrato: 'CT-2024-0188',
    imovel: 'Rua das Magnólias, 192 · Casa 2',
    responsavel: 'Inquilino',
    nomeResponsavel: 'Patrícia Azevedo Lima',
    competencia: 'Renovação anual',
    vencimento: '18/10/2026',
    diasAtraso: 35,
    valor: 245,
    situacao: 'Em aberto',
  },
  {
    id: 'ob-7',
    category: 'Seguro incêndio',
    contrato: 'CT-2025-0210',
    imovel: 'Rua Teodoro Sampaio, 890 · Sala 4',
    responsavel: 'Inquilino',
    nomeResponsavel: 'Vitor Hugo Pereira',
    competencia: 'Parcela 02/04',
    vencimento: '10/11/2026',
    diasAtraso: 12,
    valor: 192.5,
    situacao: 'Em aberto',
  },
  {
    id: 'ob-8',
    category: 'Condomínio',
    contrato: 'CT-2024-0740',
    imovel: 'Rua Harmonia, 440 · Apto 52',
    responsavel: 'Inquilino',
    nomeResponsavel: 'Juliano Moraes Ferreira',
    competencia: 'Nov/2026',
    vencimento: '10/11/2026',
    diasAtraso: 12,
    valor: 890,
    situacao: 'Cobrança enviada',
  },
  {
    id: 'ob-9',
    category: 'Guia IRRF',
    contrato: 'CT-2025-0084',
    imovel: 'Av. Faria Lima, 2410 · Conj. 1102',
    responsavel: 'Proprietário',
    nomeResponsavel: 'Fundo Patrimonial Faria',
    competencia: 'Competência 10/2026',
    vencimento: '20/11/2026',
    diasAtraso: 2,
    valor: 412.5,
    situacao: 'Aguardando guia',
  },
];

// ---------------------------------------------------------------------------
// BLOCO 3 — AGENDA DE ALUGUÉIS E INADIMPLÊNCIA (42 a vencer 10d | 378 atrasados)
// ---------------------------------------------------------------------------

export const UPCOMING_RENTS_COUNT = 42;
export const UPCOMING_RENTS_TOTAL_VALUE = 134800;

export const UPCOMING_RENTS_10D: UpcomingRentItem[] = [
  {
    id: 'ur-1',
    contrato: 'CT-2025-0412',
    imovel: 'Rua Melo Alves, 480 · Apto 112',
    inquilino: 'Carlos Mendes',
    corretor: 'Marina Costa',
    vencimento: '25/11/2026',
    diasParaVencer: 3,
    valor: 3200,
    lembreteStatus: 'Enviado',
  },
  {
    id: 'ur-2',
    contrato: 'CT-2026-0118',
    imovel: 'Rua João Cachoeira, 910 · Sala 8',
    inquilino: 'Lumina Estética Ltda',
    corretor: 'Lucas Nogueira',
    vencimento: '25/11/2026',
    diasParaVencer: 3,
    valor: 5200,
    lembreteStatus: 'Enviado',
  },
  {
    id: 'ur-3',
    contrato: 'CT-2024-0045',
    imovel: 'Rua Oscar Freire, 1120 · Apto 32',
    inquilino: 'Juliana Salles Moreira',
    corretor: 'Marina Costa',
    vencimento: '27/11/2026',
    diasParaVencer: 5,
    valor: 4600,
    lembreteStatus: 'Boleto emitido',
  },
  {
    id: 'ur-4',
    contrato: 'CT-2025-0519',
    imovel: 'Av. Angélica, 1820 · Apto 63',
    inquilino: 'Renata Vasconcelos',
    corretor: 'Rafael Souza',
    vencimento: '28/11/2026',
    diasParaVencer: 6,
    valor: 3850,
    lembreteStatus: 'Agendado',
  },
  {
    id: 'ur-5',
    contrato: 'CT-2024-0510',
    imovel: 'Rua Estados Unidos, 1410 · Casa 4',
    inquilino: 'Eduardo Fonseca Braga',
    corretor: 'Lucas Nogueira',
    vencimento: '30/11/2026',
    diasParaVencer: 8,
    valor: 6400,
    lembreteStatus: 'Boleto emitido',
  },
  {
    id: 'ur-6',
    contrato: 'CT-2025-0701',
    imovel: 'Rua Vergueiro, 1420 · Apto 74',
    inquilino: 'Tatiane Ribeiro Costa',
    corretor: 'Rafael Souza',
    vencimento: '01/12/2026',
    diasParaVencer: 9,
    valor: 2680,
    lembreteStatus: 'Agendado',
  },
  {
    id: 'ur-7',
    contrato: 'CT-2026-0205',
    imovel: 'Alameda Jaú, 590 · Apto 19',
    inquilino: 'Marcelo Teixeira Dias',
    corretor: 'Marina Costa',
    vencimento: '02/12/2026',
    diasParaVencer: 10,
    valor: 3490,
    lembreteStatus: 'Agendado',
  },
];

export const OVERDUE_RENTS_TOTAL_COUNT = 378;
export const OVERDUE_RENTS_TOTAL_VALUE = 842650;

export const OVERDUE_RENTS_LIST: OverdueRentItem[] = [
  {
    id: 'or-1',
    contrato: 'CT-2023-0312',
    imovel: 'Rua dos Pinheiros, 840 · Apto 72',
    inquilino: 'Marcos Aurélio Tavares',
    corretor: 'Rafael Souza',
    competencia: 'Jul/2026',
    vencimento: '10/07/2026',
    diasAtraso: 135,
    valor: 3450,
    situacaoCobranca: 'Processo jurídico',
    ultimaProvidencia: 'Dossiê entregue ao jurídico externo em 14/09/2026',
    historico: [
      { data: '15/07/2026', evento: '1ª cobrança automática via WhatsApp e E-mail', responsavel: 'Agente GoFAPE' },
      { data: '28/07/2026', evento: '2ª notificação com cálculo de multa e juros', responsavel: 'Agente GoFAPE' },
      { data: '14/09/2026', evento: 'Encaminhado para ação judicial (JUR-001)', responsavel: 'Dr. Renato (Jurídico)' },
    ],
  },
  {
    id: 'or-2',
    contrato: 'CT-2023-0312',
    imovel: 'Rua dos Pinheiros, 840 · Apto 72',
    inquilino: 'Marcos Aurélio Tavares',
    corretor: 'Rafael Souza',
    competencia: 'Ago/2026',
    vencimento: '10/08/2026',
    diasAtraso: 104,
    valor: 3450,
    situacaoCobranca: 'Processo jurídico',
    ultimaProvidencia: 'Incorporado ao cálculo atualizado da ação de despejo',
    historico: [
      { data: '13/08/2026', evento: 'Lançamento incluído no débito consolidado', responsavel: 'Agente GoFAPE' },
      { data: '14/09/2026', evento: 'Anexado ao processo judicial', responsavel: 'Dr. Renato (Jurídico)' },
    ],
  },
  {
    id: 'or-3',
    contrato: 'CT-2022-0904',
    imovel: 'Av. Paulista, 1450 · Conj. 504',
    inquilino: 'Norte Sul Consultoria Ltda',
    corretor: 'Marina Costa',
    competencia: 'Ago/2026',
    vencimento: '15/08/2026',
    diasAtraso: 99,
    valor: 5800,
    situacaoCobranca: 'Processo jurídico',
    ultimaProvidencia: 'Citação judicial expedida em 05/10/2026',
    historico: [
      { data: '20/08/2026', evento: 'Cobrança formal enviada à diretoria da locatária', responsavel: 'Agente GoFAPE' },
      { data: '05/10/2026', evento: 'Petição inicial protocolada', responsavel: 'Jurídico Externo' },
    ],
  },
  {
    id: 'or-4',
    contrato: 'CT-2024-0188',
    imovel: 'Rua das Magnólias, 192 · Casa 2',
    inquilino: 'Patrícia Azevedo Lima',
    corretor: 'Rafael Souza',
    competencia: 'Set/2026',
    vencimento: '10/09/2026',
    diasAtraso: 73,
    valor: 2790,
    situacaoCobranca: 'Em negociação',
    ultimaProvidencia: 'Proposta de parcelamento em 3x aguardando aprovação FIN-002',
    historico: [
      { data: '14/09/2026', evento: 'Aviso de atraso enviado via WhatsApp', responsavel: 'Agente GoFAPE' },
      { data: '19/11/2026', evento: 'Inquilina solicitou parcelamento em 3 vezes', responsavel: 'Agente GoFAPE' },
    ],
  },
  {
    id: 'or-5',
    contrato: 'CT-2023-0941',
    imovel: 'Rua Bela Cintra, 610 · Apto 31',
    inquilino: 'Luciana Ferreira Prado',
    corretor: 'Marina Costa',
    competencia: 'Out/2026',
    vencimento: '05/10/2026',
    diasAtraso: 48,
    valor: 2950,
    situacaoCobranca: 'Notificado',
    ultimaProvidencia: 'Carta de cobrança enviada em 12/11/2026',
    historico: [
      { data: '08/10/2026', evento: '1º lembrete enviado', responsavel: 'Agente GoFAPE' },
      { data: '12/11/2026', evento: 'Notificação amigável encaminhada por e-mail', responsavel: 'Agente GoFAPE' },
    ],
  },
  {
    id: 'or-6',
    contrato: 'CT-2024-0612',
    imovel: 'Rua Cardeal Arcoverde, 1502 · Apto 41',
    inquilino: 'Rodrigo Almeida Prado',
    corretor: 'Lucas Nogueira',
    competencia: 'Out/2026',
    vencimento: '18/10/2026',
    diasAtraso: 35,
    valor: 2480,
    situacaoCobranca: 'Em negociação',
    ultimaProvidencia: 'Promessa de pagamento registrada para 25/11/2026',
    historico: [
      { data: '21/10/2026', evento: 'Contato automático via WhatsApp', responsavel: 'Agente GoFAPE' },
      { data: '18/11/2026', evento: 'Compromisso de quitação informado pelo inquilino', responsavel: 'Agente GoFAPE' },
    ],
  },
  {
    id: 'or-7',
    contrato: 'CT-2023-1081',
    imovel: 'Rua Haddock Lobo, 412 · Loja 3',
    inquilino: 'Café & Prosa Comércio',
    corretor: 'Rafael Souza',
    competencia: 'Nov/2026',
    vencimento: '05/11/2026',
    diasAtraso: 17,
    valor: 6100,
    situacaoCobranca: 'Notificado',
    ultimaProvidencia: 'Segunda via atualizada enviada hoje às 09:15',
    historico: [
      { data: '08/11/2026', evento: 'Régua preventiva D+3 executada', responsavel: 'Agente GoFAPE' },
      { data: '22/11/2026', evento: 'Boleto atualizado com encargos enviado', responsavel: 'Agente GoFAPE' },
    ],
  },
  {
    id: 'or-8',
    contrato: 'CT-2025-0210',
    imovel: 'Rua Teodoro Sampaio, 890 · Sala 4',
    inquilino: 'Vitor Hugo Pereira',
    corretor: 'Marina Costa',
    competencia: 'Nov/2026',
    vencimento: '10/11/2026',
    diasAtraso: 12,
    valor: 2150,
    situacaoCobranca: 'Em atraso',
    ultimaProvidencia: 'Lembrete D+10 disparado por WhatsApp e E-mail',
    historico: [
      { data: '13/11/2026', evento: 'Aviso de vencimento D+3', responsavel: 'Agente GoFAPE' },
      { data: '20/11/2026', evento: 'Lembrete D+10 enviado', responsavel: 'Agente GoFAPE' },
    ],
  },
  {
    id: 'or-9',
    contrato: 'CT-2024-0740',
    imovel: 'Rua Harmonia, 440 · Apto 52',
    inquilino: 'Juliano Moraes Ferreira',
    corretor: 'Lucas Nogueira',
    competencia: 'Nov/2026',
    vencimento: '12/11/2026',
    diasAtraso: 10,
    valor: 3320,
    situacaoCobranca: 'Em atraso',
    ultimaProvidencia: 'Aguardando retorno da cobrança automática',
    historico: [
      { data: '15/11/2026', evento: 'Cobrança enviada via E-mail', responsavel: 'Agente GoFAPE' },
    ],
  },
  {
    id: 'or-10',
    contrato: 'CT-2025-0144',
    imovel: 'Rua dos Girassóis, 305 · Casa',
    inquilino: 'Aline Moreira Santos',
    corretor: 'Marina Costa',
    competencia: 'Nov/2026',
    vencimento: '15/11/2026',
    diasAtraso: 7,
    valor: 3100,
    situacaoCobranca: 'Em atraso',
    ultimaProvidencia: 'Boleto reenviado com link Pix',
    historico: [
      { data: '18/11/2026', evento: 'Link Pix gerado automaticamente (FIN-008)', responsavel: 'Agente GoFAPE' },
    ],
  },
  {
    id: 'or-11',
    contrato: 'CT-2025-0632',
    imovel: 'Av. Sumaré, 1180 · Apto 22',
    inquilino: 'Fernando Braga Junior',
    corretor: 'Rafael Souza',
    competencia: 'Nov/2026',
    vencimento: '18/11/2026',
    diasAtraso: 4,
    valor: 2640,
    situacaoCobranca: 'Em atraso',
    ultimaProvidencia: 'Régua D+3 enviada ontem',
    historico: [
      { data: '21/11/2026', evento: 'Mensagem amigável D+3 via WhatsApp', responsavel: 'Agente GoFAPE' },
    ],
  },
  {
    id: 'or-12',
    contrato: 'CT-2026-0091',
    imovel: 'Rua Dr. Alceu de Campos, 210 · Sala 3',
    inquilino: 'Inova Contábil Ltda',
    corretor: 'Lucas Nogueira',
    competencia: 'Out/2026',
    vencimento: '25/10/2026',
    diasAtraso: 28,
    valor: 4120,
    situacaoCobranca: 'Notificado',
    ultimaProvidencia: 'Notificação enviada com demonstrativo completo',
    historico: [
      { data: '29/10/2026', evento: 'Cobrança inicial enviada', responsavel: 'Agente GoFAPE' },
      { data: '15/11/2026', evento: 'Notificação formal de inadimplência', responsavel: 'Agente GoFAPE' },
    ],
  },
];

// ---------------------------------------------------------------------------
// BLOCO 4 — REPASSES AOS PROPRIETÁRIOS (14 a vencer 5d | 18 atrasados)
// ---------------------------------------------------------------------------

export const UPCOMING_PAYOUTS_COUNT = 14;
export const UPCOMING_PAYOUTS_TOTAL_VALUE = 46920;

export const UPCOMING_PAYOUTS_5D: UpcomingPayoutItem[] = [
  {
    id: 'up-1',
    contrato: 'CT-2025-0412',
    imovel: 'Rua Melo Alves, 480 · Apto 112',
    proprietario: 'Sérgio Monteiro',
    dataPrevista: '24/11/2026',
    valor: 2944,
    aluguelRecebido: 'Confirmado',
    contaDestino: 'Itaú Ag. 0412 · CC 88412-0',
  },
  {
    id: 'up-2',
    contrato: 'CT-2025-0519',
    imovel: 'Av. Angélica, 1820 · Apto 63',
    proprietario: 'Helena Guimarães',
    dataPrevista: '25/11/2026',
    valor: 3542,
    aluguelRecebido: 'Confirmado',
    contaDestino: 'Bradesco Ag. 1204 · CC 45120-2',
  },
  {
    id: 'up-3',
    contrato: 'CT-2026-0118',
    imovel: 'Rua João Cachoeira, 910 · Sala 8',
    proprietario: 'Grupo Lobo Participações',
    dataPrevista: '26/11/2026',
    valor: 4784,
    aluguelRecebido: 'Compensando',
    contaDestino: 'Santander Ag. 3310 · CC 19002-7',
  },
  {
    id: 'up-4',
    contrato: 'CT-2024-0012',
    imovel: 'Av. Brigadeiro Luís Antônio, 3200 · Apto 61',
    proprietario: 'Sérgio Monteiro',
    dataPrevista: '26/11/2026',
    valor: 2898,
    aluguelRecebido: 'Confirmado',
    contaDestino: 'Itaú Ag. 0412 · CC 88412-0',
  },
  {
    id: 'up-5',
    contrato: 'CT-2024-0510',
    imovel: 'Rua Estados Unidos, 1410 · Casa 4',
    proprietario: 'Patrimonial Jardins Ltda',
    dataPrevista: '27/11/2026',
    valor: 5888,
    aluguelRecebido: 'Confirmado',
    contaDestino: 'BTG Pactual · CC 20194-1',
  },
  {
    id: 'up-6',
    contrato: 'CT-2024-0045',
    imovel: 'Rua Oscar Freire, 1120 · Apto 32',
    proprietario: 'Eduardo Salles',
    dataPrevista: '27/11/2026',
    valor: 4232,
    aluguelRecebido: 'Garantido',
    contaDestino: 'Banco do Brasil · CC 11920-4',
  },
];

export const OVERDUE_PAYOUTS_COUNT = 18;
export const OVERDUE_PAYOUTS_TOTAL_VALUE = 58340;

export const OVERDUE_PAYOUTS_LIST: OverduePayoutItem[] = [
  {
    id: 'op-1',
    contrato: 'CT-2024-0818',
    imovel: 'Casa Rua do Lago, 9',
    proprietario: 'Sérgio Monteiro',
    dataPrevista: '05/11/2026',
    diasAtraso: 17,
    valor: 2668,
    situacaoRepasse: 'Retido por documentação',
    statusAluguelInquilino: 'Recebido pelo inquilino',
    historicoProprietario: [
      { data: '05/09/2026', competencia: 'Set/2026', valor: 2668, status: 'Pago' },
      { data: '05/10/2026', competencia: 'Out/2026', valor: 2668, status: 'Pago' },
      { data: '05/11/2026', competencia: 'Nov/2026', valor: 2668, status: 'Atrasado' },
    ],
  },
  {
    id: 'op-2',
    contrato: 'CT-2023-0975',
    imovel: 'Rua Augusta, 1920 · Apto 45',
    proprietario: 'Helena Guimarães',
    dataPrevista: '08/11/2026',
    diasAtraso: 14,
    valor: 2438,
    situacaoRepasse: 'Aguardando conciliação',
    statusAluguelInquilino: 'Recebido pelo inquilino',
    historicoProprietario: [
      { data: '08/09/2026', competencia: 'Set/2026', valor: 2438, status: 'Pago' },
      { data: '08/10/2026', competencia: 'Out/2026', valor: 2438, status: 'Pago' },
      { data: '08/11/2026', competencia: 'Nov/2026', valor: 2438, status: 'Atrasado' },
    ],
  },
  {
    id: 'op-3',
    contrato: 'CT-2023-1022',
    imovel: 'Rua Domingos de Morais, 1180 · Sala 12',
    proprietario: 'Patrimonial Morais S.A.',
    dataPrevista: '10/11/2026',
    diasAtraso: 12,
    valor: 3864,
    situacaoRepasse: 'Pendência bancária',
    statusAluguelInquilino: 'Recebido pelo inquilino',
    historicoProprietario: [
      { data: '10/09/2026', competencia: 'Set/2026', valor: 3864, status: 'Pago' },
      { data: '10/10/2026', competencia: 'Out/2026', valor: 3864, status: 'Pago' },
      { data: '10/11/2026', competencia: 'Nov/2026', valor: 3864, status: 'Atrasado' },
    ],
  },
  {
    id: 'op-4',
    contrato: 'CT-2024-0031',
    imovel: 'Rua Joaquim Floriano, 466 · Conj. 901',
    proprietario: 'Fundo Floriano',
    dataPrevista: '12/11/2026',
    diasAtraso: 10,
    valor: 6808,
    situacaoRepasse: 'Em processamento',
    statusAluguelInquilino: 'Recebido pelo inquilino',
    historicoProprietario: [
      { data: '12/10/2026', competencia: 'Out/2026', valor: 6808, status: 'Pago' },
      { data: '12/11/2026', competencia: 'Nov/2026', valor: 6808, status: 'Atrasado' },
    ],
  },
  {
    id: 'op-5',
    contrato: 'CT-2023-0918',
    imovel: 'Rua Tutóia, 515 · Apto 101',
    proprietario: 'Antônio Carlos Dias',
    dataPrevista: '13/11/2026',
    diasAtraso: 9,
    valor: 3036,
    situacaoRepasse: 'Aguardando conciliação',
    statusAluguelInquilino: 'Parcialmente recebido',
    historicoProprietario: [
      { data: '13/10/2026', competencia: 'Out/2026', valor: 3036, status: 'Pago' },
      { data: '13/11/2026', competencia: 'Nov/2026', valor: 3036, status: 'Atrasado' },
    ],
  },
  {
    id: 'op-6',
    contrato: 'CT-2024-0402',
    imovel: 'Rua Mourato Coelho, 620 · Casa 1',
    proprietario: 'Clara Mendonça',
    dataPrevista: '14/11/2026',
    diasAtraso: 8,
    valor: 4048,
    situacaoRepasse: 'Em processamento',
    statusAluguelInquilino: 'Recebido pelo inquilino',
    historicoProprietario: [
      { data: '14/10/2026', competencia: 'Out/2026', valor: 4048, status: 'Pago' },
      { data: '14/11/2026', competencia: 'Nov/2026', valor: 4048, status: 'Atrasado' },
    ],
  },
  {
    id: 'op-7',
    contrato: 'CT-2024-0318',
    imovel: 'Rua França Pinto, 780 · Apto 51',
    proprietario: 'Roberto Vasconcelos',
    dataPrevista: '15/11/2026',
    diasAtraso: 7,
    valor: 2852,
    situacaoRepasse: 'Aguardando conciliação',
    statusAluguelInquilino: 'Recebido pelo inquilino',
    historicoProprietario: [
      { data: '15/10/2026', competencia: 'Out/2026', valor: 2852, status: 'Pago' },
      { data: '15/11/2026', competencia: 'Nov/2026', valor: 2852, status: 'Atrasado' },
    ],
  },
  {
    id: 'op-8',
    contrato: 'CT-2024-0190',
    imovel: 'Rua dos Três Irmãos, 412 · Apto 24',
    proprietario: 'Sérgio Monteiro',
    dataPrevista: '16/11/2026',
    diasAtraso: 6,
    valor: 2484,
    situacaoRepasse: 'Em processamento',
    statusAluguelInquilino: 'Recebido pelo inquilino',
    historicoProprietario: [
      { data: '16/10/2026', competencia: 'Out/2026', valor: 2484, status: 'Pago' },
      { data: '16/11/2026', competencia: 'Nov/2026', valor: 2484, status: 'Atrasado' },
    ],
  },
  {
    id: 'op-9',
    contrato: 'CT-2025-0084',
    imovel: 'Av. Faria Lima, 2410 · Conj. 1102',
    proprietario: 'Fundo Patrimonial Faria',
    dataPrevista: '18/11/2026',
    diasAtraso: 4,
    valor: 5490,
    situacaoRepasse: 'Retido por documentação',
    statusAluguelInquilino: 'Recebido pelo inquilino',
    historicoProprietario: [
      { data: '18/10/2026', competencia: 'Out/2026', valor: 5490, status: 'Pago' },
      { data: '18/11/2026', competencia: 'Nov/2026', valor: 5490, status: 'Atrasado' },
    ],
  },
  {
    id: 'op-10',
    contrato: 'CT-2023-0887',
    imovel: 'Rua Vergueiro, 2240 · Apto 94',
    proprietario: 'Marta Helena Silveira',
    dataPrevista: '18/11/2026',
    diasAtraso: 4,
    valor: 2208,
    situacaoRepasse: 'Aguardando conciliação',
    statusAluguelInquilino: 'Recebido pelo inquilino',
    historicoProprietario: [
      { data: '18/10/2026', competencia: 'Out/2026', valor: 2208, status: 'Pago' },
      { data: '18/11/2026', competencia: 'Nov/2026', valor: 2208, status: 'Atrasado' },
    ],
  },
  {
    id: 'op-11',
    contrato: 'CT-2024-0244',
    imovel: 'Av. Rebouças, 2100 · Conj. 41',
    proprietario: 'Patrimonial Rebouças',
    dataPrevista: '19/11/2026',
    diasAtraso: 3,
    valor: 4554,
    situacaoRepasse: 'Em processamento',
    statusAluguelInquilino: 'Recebido pelo inquilino',
    historicoProprietario: [
      { data: '19/10/2026', competencia: 'Out/2026', valor: 4554, status: 'Pago' },
      { data: '19/11/2026', competencia: 'Nov/2026', valor: 4554, status: 'Atrasado' },
    ],
  },
  {
    id: 'op-12',
    contrato: 'CT-2024-0028',
    imovel: 'Rua Pamplona, 905 · Apto 88',
    proprietario: 'Clara Mendonça',
    dataPrevista: '19/11/2026',
    diasAtraso: 3,
    valor: 2649.6,
    situacaoRepasse: 'Aguardando conciliação',
    statusAluguelInquilino: 'Recebido pelo inquilino',
    historicoProprietario: [
      { data: '19/10/2026', competencia: 'Out/2026', valor: 2649.6, status: 'Pago' },
      { data: '19/11/2026', competencia: 'Nov/2026', valor: 2649.6, status: 'Atrasado' },
    ],
  },
  {
    id: 'op-13',
    contrato: 'CT-2023-1055',
    imovel: 'Alameda Santos, 780 · Conj. 22',
    proprietario: 'Carlos Eduardo Ribeiro',
    dataPrevista: '20/11/2026',
    diasAtraso: 2,
    valor: 3588,
    situacaoRepasse: 'Em processamento',
    statusAluguelInquilino: 'Recebido pelo inquilino',
    historicoProprietario: [
      { data: '20/10/2026', competencia: 'Out/2026', valor: 3588, status: 'Pago' },
      { data: '20/11/2026', competencia: 'Nov/2026', valor: 3588, status: 'Atrasado' },
    ],
  },
  {
    id: 'op-14',
    contrato: 'CT-2024-0052',
    imovel: 'Rua Cubatão, 310 · Apto 14',
    proprietario: 'Helena Guimarães',
    dataPrevista: '20/11/2026',
    diasAtraso: 2,
    valor: 2162,
    situacaoRepasse: 'Aguardando conciliação',
    statusAluguelInquilino: 'Aguardando baixa',
    historicoProprietario: [
      { data: '20/10/2026', competencia: 'Out/2026', valor: 2162, status: 'Pago' },
      { data: '20/11/2026', competencia: 'Nov/2026', valor: 2162, status: 'Atrasado' },
    ],
  },
  {
    id: 'op-15',
    contrato: 'CT-2025-0309',
    imovel: 'Rua Guarará, 240 · Apto 44',
    proprietario: 'Eduardo Salles',
    dataPrevista: '20/11/2026',
    diasAtraso: 2,
    valor: 3128,
    situacaoRepasse: 'Em processamento',
    statusAluguelInquilino: 'Recebido pelo inquilino',
    historicoProprietario: [
      { data: '20/10/2026', competencia: 'Out/2026', valor: 3128, status: 'Pago' },
      { data: '20/11/2026', competencia: 'Nov/2026', valor: 3128, status: 'Atrasado' },
    ],
  },
  {
    id: 'op-16',
    contrato: 'CT-2025-0488',
    imovel: 'Rua Gabriele D’Annunzio, 810 · Casa 2',
    proprietario: 'Patrimonial Jardins Ltda',
    dataPrevista: '21/11/2026',
    diasAtraso: 1,
    valor: 2806,
    situacaoRepasse: 'Aguardando conciliação',
    statusAluguelInquilino: 'Recebido pelo inquilino',
    historicoProprietario: [
      { data: '21/10/2026', competencia: 'Out/2026', valor: 2806, status: 'Pago' },
      { data: '21/11/2026', competencia: 'Nov/2026', valor: 2806, status: 'Atrasado' },
    ],
  },
  {
    id: 'op-17',
    contrato: 'CT-2025-0611',
    imovel: 'Rua Bela Vista, 118 · Apto 15',
    proprietario: 'Antônio Carlos Dias',
    dataPrevista: '21/11/2026',
    diasAtraso: 1,
    valor: 1932,
    situacaoRepasse: 'Em processamento',
    statusAluguelInquilino: 'Recebido pelo inquilino',
    historicoProprietario: [
      { data: '21/10/2026', competencia: 'Out/2026', valor: 1932, status: 'Pago' },
      { data: '21/11/2026', competencia: 'Nov/2026', valor: 1932, status: 'Atrasado' },
    ],
  },
  {
    id: 'op-18',
    contrato: 'CT-2026-0041',
    imovel: 'Av. Santo Amaro, 1490 · Conj. 14',
    proprietario: 'Carlos Eduardo Ribeiro',
    dataPrevista: '21/11/2026',
    diasAtraso: 1,
    valor: 1624.4,
    situacaoRepasse: 'Pendência bancária',
    statusAluguelInquilino: 'Recebido pelo inquilino',
    historicoProprietario: [
      { data: '21/10/2026', competencia: 'Out/2026', valor: 1624.4, status: 'Pago' },
      { data: '21/11/2026', competencia: 'Nov/2026', valor: 1624.4, status: 'Atrasado' },
    ],
  },
];

// ---------------------------------------------------------------------------
// BLOCO 5 — SEGUROS E GARANTIAS LOCATÍCIAS
// ---------------------------------------------------------------------------

export const GUARANTEE_COUNTERS: GuaranteeCounterSummary[] = [
  {
    type: 'Seguro fiança',
    expiring30d: 4,
    expired: 2,
    note: 'Monitoramento automático de endossos junto às seguradoras',
  },
  {
    type: 'Seguro incêndio',
    expiring30d: 19,
    expired: 239,
    note: 'Obrigatório por lei em toda carteira ativa; renovação automática ou cobrança',
  },
  {
    type: 'Carta fiança',
    expiring30d: 1,
    expired: 0,
    note: 'Garantias bancárias ou empresariais com termo específico',
  },
];

export const GUARANTEE_RECORDS_LIST: GuaranteeRecordItem[] = [
  {
    id: 'gar-1',
    contrato: 'CT-2023-0941',
    imovel: 'Rua Bela Cintra, 610 · Apto 31',
    inquilino: 'Luciana Ferreira Prado',
    tipo: 'Seguro incêndio',
    instituicao: 'Porto Seguro',
    dataInicio: '05/10/2025',
    dataVencimento: '04/10/2026',
    situacao: 'Vencido',
    diasRestantes: -49,
    documentoCodigo: 'APOL-INC-99201.pdf',
    valorCobertura: 380000,
  },
  {
    id: 'gar-2',
    contrato: 'CT-2024-0188',
    imovel: 'Rua das Magnólias, 192 · Casa 2',
    inquilino: 'Patrícia Azevedo Lima',
    tipo: 'Seguro incêndio',
    instituicao: 'Tokio Marine',
    dataInicio: '19/10/2025',
    dataVencimento: '18/10/2026',
    situacao: 'Vencido',
    diasRestantes: -35,
    documentoCodigo: 'APOL-INC-88412.pdf',
    valorCobertura: 450000,
  },
  {
    id: 'gar-3',
    contrato: 'CT-2024-0740',
    imovel: 'Rua Harmonia, 440 · Apto 52',
    inquilino: 'Juliano Moraes Ferreira',
    tipo: 'Seguro fiança',
    instituicao: 'Pottencial Seguradora',
    dataInicio: '10/11/2025',
    dataVencimento: '09/11/2026',
    situacao: 'Vencido',
    diasRestantes: -13,
    documentoCodigo: 'APOL-FIA-41903.pdf',
    valorCobertura: 48000,
  },
  {
    id: 'gar-4',
    contrato: 'CT-2025-0210',
    imovel: 'Rua Teodoro Sampaio, 890 · Sala 4',
    inquilino: 'Vitor Hugo Pereira',
    tipo: 'Seguro fiança',
    instituicao: 'Too Seguros',
    dataInicio: '15/11/2025',
    dataVencimento: '14/11/2026',
    situacao: 'Vencido',
    diasRestantes: -8,
    documentoCodigo: 'APOL-FIA-30118.pdf',
    valorCobertura: 36000,
  },
  {
    id: 'gar-5',
    contrato: 'CT-2024-0045',
    imovel: 'Rua Oscar Freire, 1120 · Apto 32',
    inquilino: 'Juliana Salles Moreira',
    tipo: 'Seguro fiança',
    instituicao: 'Porto Seguro',
    dataInicio: '20/12/2025',
    dataVencimento: '19/12/2026',
    situacao: 'Vence em 30 dias',
    diasRestantes: 27,
    documentoCodigo: 'APOL-FIA-55209.pdf',
    valorCobertura: 62000,
  },
  {
    id: 'gar-6',
    contrato: 'CT-2024-0031',
    imovel: 'Rua Joaquim Floriano, 466 · Conj. 901',
    inquilino: 'Vértice Tecnologia Ltda',
    tipo: 'Carta fiança',
    instituicao: 'Banco Safra S.A.',
    dataInicio: '15/12/2025',
    dataVencimento: '14/12/2026',
    situacao: 'Vence em 30 dias',
    diasRestantes: 22,
    documentoCodigo: 'CARTA-FIA-SAFRA-09.pdf',
    valorCobertura: 88800,
  },
  {
    id: 'gar-7',
    contrato: 'CT-2025-0412',
    imovel: 'Rua Melo Alves, 480 · Apto 112',
    inquilino: 'Carlos Mendes',
    tipo: 'Seguro incêndio',
    instituicao: 'Allianz Seguros',
    dataInicio: '02/12/2025',
    dataVencimento: '01/12/2026',
    situacao: 'Vence em 30 dias',
    diasRestantes: 9,
    documentoCodigo: 'APOL-INC-71920.pdf',
    valorCobertura: 520000,
  },
  {
    id: 'gar-8',
    contrato: 'CT-2025-0519',
    imovel: 'Av. Angélica, 1820 · Apto 63',
    inquilino: 'Renata Vasconcelos',
    tipo: 'Seguro fiança',
    instituicao: 'Porto Seguro',
    dataInicio: '10/12/2025',
    dataVencimento: '09/12/2026',
    situacao: 'Vence em 30 dias',
    diasRestantes: 17,
    documentoCodigo: 'APOL-FIA-61204.pdf',
    valorCobertura: 54000,
  },
];

// ---------------------------------------------------------------------------
// BLOCO 6 — REAJUSTES CONTRATUAIS (36 a vencer 30d | 15 vencidos)
// ---------------------------------------------------------------------------

export const ADJUSTMENTS_UPCOMING_COUNT = 36;
export const ADJUSTMENTS_OVERDUE_COUNT = 15;

export const ADJUSTMENTS_LIST: AdjustmentRecordItem[] = [
  // 15 Vencidos
  ...Array.from({ length: 15 }).map((_, i): AdjustmentRecordItem => {
    const baseContracts = [
      ['CT-2023-0941', 'Rua Bela Cintra, 610 · Apto 31', 'Luciana Ferreira Prado', 2950, 'IGP-M', 4.42],
      ['CT-2023-0975', 'Rua Augusta, 1920 · Apto 45', 'Camila Duarte Nogueira', 2650, 'IPCA', 4.18],
      ['CT-2023-1022', 'Rua Domingos de Morais, 1180 · Sala 12', 'Clínica Odonto Vida', 4200, 'IGP-M', 4.42],
      ['CT-2023-1055', 'Alameda Santos, 780 · Conj. 22', 'Studio Ágil Arquitetura', 3900, 'IPCA', 4.18],
      ['CT-2023-1081', 'Rua Haddock Lobo, 412 · Loja 3', 'Café & Prosa Comércio', 6100, 'IGP-M', 4.42],
      ['CT-2024-0612', 'Rua Cardeal Arcoverde, 1502 · Apto 41', 'Rodrigo Almeida Prado', 2480, 'IPCA', 4.18],
      ['CT-2024-0740', 'Rua Harmonia, 440 · Apto 52', 'Juliano Moraes Ferreira', 3320, 'INPC', 4.05],
      ['CT-2024-0802', 'Rua Fradique Coutinho, 312 · Apto 18', 'Mariana Duarte Silveira', 3100, 'IPCA', 4.18],
      ['CT-2024-0819', 'Rua Alves Guimarães, 620 · Apto 92', 'Henrique Costa Lima', 2890, 'IGP-M', 4.42],
      ['CT-2024-0840', 'Av. Nove de Julho, 3140 · Conj. 81', 'Soluções Ágape Ltda', 4750, 'IPCA', 4.18],
      ['CT-2024-0855', 'Rua Capitão Prudente, 190 · Casa', 'Fábio Mendes Ribeiro', 3600, 'IGP-M', 4.42],
      ['CT-2024-0867', 'Rua Groenlândia, 412 · Casa 3', 'Sônia Regina Tavares', 7200, 'IPCA', 4.18],
      ['CT-2024-0881', 'Rua Peixoto Gomide, 990 · Apto 44', 'Thiago Naves Rocha', 3180, 'IPCA', 4.18],
      ['CT-2024-0899', 'Rua Artur de Azevedo, 1210 · Sala 6', 'Consultório Dr. Paulo', 3950, 'IGP-M', 4.42],
      ['CT-2024-0912', 'Rua Wisard, 480 · Apto 12', 'Laura Beatriz Gomes', 2740, 'IPCA', 4.18],
    ] as const;
    const row = baseContracts[i];
    const day = 4 + i;
    const dayStr = `${String(day).padStart(2, '0')}/11/2026`;
    const pct = row[5];
    const proj = Number((row[3] * (1 + pct / 100)).toFixed(2));
    return {
      id: `adj-ov-${i + 1}`,
      contrato: row[0],
      imovel: row[1],
      inquilino: row[2],
      dataReajuste: dayStr,
      situacao: 'Vencido',
      diasDiferenca: -(22 - day),
      indice: row[4],
      percentualAplicado: pct,
      aluguelAtual: row[3],
      aluguelProjetado: proj,
      statusAplicacao: i < 5 ? 'Aguardando aprovação' : i < 10 ? 'Pendente cálculo' : 'Pronto p/ envio',
      historicoReajustes: [
        { ano: '2024', indice: row[4], percentual: '3,85%', valorAnterior: Number((row[3] / 1.041).toFixed(2)), valorNovo: row[3] },
        { ano: '2025', indice: row[4], percentual: '4,10%', valorAnterior: Number((row[3] / 1.041).toFixed(2)), valorNovo: row[3] },
      ],
    };
  }),
  // 36 A vencer nos próximos 30 dias (representative chronological entries + full 36 count)
  ...Array.from({ length: 36 }).map((_, i): AdjustmentRecordItem => {
    const streets = [
      'Rua Melo Alves, 480 · Apto 112',
      'Av. Angélica, 1820 · Apto 63',
      'Rua João Cachoeira, 910 · Sala 8',
      'Rua Estados Unidos, 1410 · Casa 4',
      'Rua Oscar Freire, 1120 · Apto 32',
      'Alameda Jaú, 590 · Apto 19',
      'Rua Pamplona, 905 · Apto 88',
      'Rua Cubatão, 310 · Apto 14',
      'Rua Tutóia, 515 · Apto 101',
    ];
    const tenants = [
      'Carlos Mendes',
      'Renata Vasconcelos',
      'Lumina Estética Ltda',
      'Eduardo Fonseca Braga',
      'Juliana Salles Moreira',
      'Marcelo Teixeira Dias',
      'Bruno César Martins',
      'Daniela Teixeira Ramos',
      'Gustavo Moura Reis',
    ];
    const isNov = i < 10;
    const dayNum = isNov ? 23 + Math.min(i, 7) : 1 + ((i - 10) % 21);
    const monthStr = isNov ? '11' : '12';
    const dataReajuste = `${String(dayNum).padStart(2, '0')}/${monthStr}/2026`;
    const baseVal = 2400 + (i % 9) * 420;
    const indice = i % 3 === 0 ? 'IGP-M' : i % 3 === 1 ? 'IPCA' : 'INPC';
    const pct = indice === 'IGP-M' ? 4.35 : indice === 'IPCA' ? 4.12 : 3.98;
    return {
      id: `adj-up-${i + 1}`,
      contrato: `CT-2025-${String(700 + i).padStart(4, '0')}`,
      imovel: `${streets[i % streets.length]} (Unid. ${i + 1})`,
      inquilino: tenants[i % tenants.length],
      dataReajuste,
      situacao: 'Vence em 30 dias',
      diasDiferenca: isNov ? dayNum - 22 : 8 + dayNum,
      indice,
      percentualAplicado: pct,
      aluguelAtual: baseVal,
      aluguelProjetado: Number((baseVal * (1 + pct / 100)).toFixed(2)),
      statusAplicacao: i < 8 ? 'Pronto p/ envio' : i < 20 ? 'Aguardando aprovação' : 'Pendente cálculo',
      historicoReajustes: [
        { ano: '2025', indice, percentual: '3,95%', valorAnterior: Number((baseVal / 1.0395).toFixed(2)), valorNovo: baseVal },
      ],
    };
  }),
];

// ---------------------------------------------------------------------------
// BLOCO 7 — EVOLUÇÃO FINANCEIRA (Jun–Nov 2026 + períodos alternativos)
// ---------------------------------------------------------------------------

export const FINANCIAL_EVOLUTION_BY_RANGE: Record<FinancialEvolutionRange, FinancialEvolutionPoint[]> = {
  '6m': [
    {
      mes: 'Jun/26',
      alugueisBrutos: 1684000,
      alugueisLiquidos: 1522000,
      mensalidadesGeradas: 1745000,
      taxaAdministrativa: 138600,
      administracoesRecebidas: 134100,
      taxaContrato: 23400,
    },
    {
      mes: 'Jul/26',
      alugueisBrutos: 1712000,
      alugueisLiquidos: 1548000,
      mensalidadesGeradas: 1779000,
      taxaAdministrativa: 141200,
      administracoesRecebidas: 136800,
      taxaContrato: 25100,
    },
    {
      mes: 'Ago/26',
      alugueisBrutos: 1749000,
      alugueisLiquidos: 1581000,
      mensalidadesGeradas: 1814000,
      taxaAdministrativa: 144500,
      administracoesRecebidas: 139900,
      taxaContrato: 27900,
    },
    {
      mes: 'Set/26',
      alugueisBrutos: 1735000,
      alugueisLiquidos: 1568000,
      mensalidadesGeradas: 1802000,
      taxaAdministrativa: 142900,
      administracoesRecebidas: 138200,
      taxaContrato: 21800,
    },
    {
      mes: 'Out/26',
      alugueisBrutos: 1791000,
      alugueisLiquidos: 1621000,
      mensalidadesGeradas: 1858000,
      taxaAdministrativa: 148400,
      administracoesRecebidas: 144700,
      taxaContrato: 29400,
    },
    {
      mes: 'Nov/26',
      alugueisBrutos: 1824000,
      alugueisLiquidos: 1650000,
      mensalidadesGeradas: 1892000,
      taxaAdministrativa: 151800,
      administracoesRecebidas: 146900,
      taxaContrato: 31200,
    },
  ],
  '12m': [
    { mes: 'Dez/25', alugueisBrutos: 1520000, alugueisLiquidos: 1372000, mensalidadesGeradas: 1590000, taxaAdministrativa: 124000, administracoesRecebidas: 119500, taxaContrato: 18200 },
    { mes: 'Jan/26', alugueisBrutos: 1554000, alugueisLiquidos: 1404000, mensalidadesGeradas: 1618000, taxaAdministrativa: 127100, administracoesRecebidas: 122800, taxaContrato: 20400 },
    { mes: 'Fev/26', alugueisBrutos: 1581000, alugueisLiquidos: 1429000, mensalidadesGeradas: 1644000, taxaAdministrativa: 129600, administracoesRecebidas: 125100, taxaContrato: 19600 },
    { mes: 'Mar/26', alugueisBrutos: 1612000, alugueisLiquidos: 1456000, mensalidadesGeradas: 1679000, taxaAdministrativa: 132200, administracoesRecebidas: 128000, taxaContrato: 22900 },
    { mes: 'Abr/26', alugueisBrutos: 1639000, alugueisLiquidos: 1481000, mensalidadesGeradas: 1702000, taxaAdministrativa: 134500, administracoesRecebidas: 130100, taxaContrato: 21300 },
    { mes: 'Mai/26', alugueisBrutos: 1661000, alugueisLiquidos: 1501000, mensalidadesGeradas: 1725000, taxaAdministrativa: 136400, administracoesRecebidas: 132000, taxaContrato: 24200 },
    { mes: 'Jun/26', alugueisBrutos: 1684000, alugueisLiquidos: 1522000, mensalidadesGeradas: 1745000, taxaAdministrativa: 138600, administracoesRecebidas: 134100, taxaContrato: 23400 },
    { mes: 'Jul/26', alugueisBrutos: 1712000, alugueisLiquidos: 1548000, mensalidadesGeradas: 1779000, taxaAdministrativa: 141200, administracoesRecebidas: 136800, taxaContrato: 25100 },
    { mes: 'Ago/26', alugueisBrutos: 1749000, alugueisLiquidos: 1581000, mensalidadesGeradas: 1814000, taxaAdministrativa: 144500, administracoesRecebidas: 139900, taxaContrato: 27900 },
    { mes: 'Set/26', alugueisBrutos: 1735000, alugueisLiquidos: 1568000, mensalidadesGeradas: 1802000, taxaAdministrativa: 142900, administracoesRecebidas: 138200, taxaContrato: 21800 },
    { mes: 'Out/26', alugueisBrutos: 1791000, alugueisLiquidos: 1621000, mensalidadesGeradas: 1858000, taxaAdministrativa: 148400, administracoesRecebidas: 144700, taxaContrato: 29400 },
    { mes: 'Nov/26', alugueisBrutos: 1824000, alugueisLiquidos: 1650000, mensalidadesGeradas: 1892000, taxaAdministrativa: 151800, administracoesRecebidas: 146900, taxaContrato: 31200 },
  ],
  '1sem': [
    { mes: 'Jan/26', alugueisBrutos: 1554000, alugueisLiquidos: 1404000, mensalidadesGeradas: 1618000, taxaAdministrativa: 127100, administracoesRecebidas: 122800, taxaContrato: 20400 },
    { mes: 'Fev/26', alugueisBrutos: 1581000, alugueisLiquidos: 1429000, mensalidadesGeradas: 1644000, taxaAdministrativa: 129600, administracoesRecebidas: 125100, taxaContrato: 19600 },
    { mes: 'Mar/26', alugueisBrutos: 1612000, alugueisLiquidos: 1456000, mensalidadesGeradas: 1679000, taxaAdministrativa: 132200, administracoesRecebidas: 128000, taxaContrato: 22900 },
    { mes: 'Abr/26', alugueisBrutos: 1639000, alugueisLiquidos: 1481000, mensalidadesGeradas: 1702000, taxaAdministrativa: 134500, administracoesRecebidas: 130100, taxaContrato: 21300 },
    { mes: 'Mai/26', alugueisBrutos: 1661000, alugueisLiquidos: 1501000, mensalidadesGeradas: 1725000, taxaAdministrativa: 136400, administracoesRecebidas: 132000, taxaContrato: 24200 },
    { mes: 'Jun/26', alugueisBrutos: 1684000, alugueisLiquidos: 1522000, mensalidadesGeradas: 1745000, taxaAdministrativa: 138600, administracoesRecebidas: 134100, taxaContrato: 23400 },
  ],
};

// ---------------------------------------------------------------------------
// BLOCO 8 — MENSALIDADES GERADAS (Janela 24h padrão)
// ---------------------------------------------------------------------------

export const GENERATED_BILLING_BY_WINDOW: Record<
  BillingWindowOption,
  {
    intervalLabel: string;
    totalCount: number;
    totalGenerated: number;
    totalReceived: number;
    items: GeneratedBillingItem[];
  }
> = {
  '24h': {
    intervalLabel: '21/11/2026 16:00 até 22/11/2026 16:00 (24 horas)',
    totalCount: 64,
    totalGenerated: 192450,
    totalReceived: 28400,
    items: [
      {
        id: 'gb-1',
        vencimento: '01/12/2026',
        contrato: 'CT-2025-0701',
        imovel: 'Rua Vergueiro, 1420 · Apto 74',
        inquilino: 'Tatiane Ribeiro Costa',
        valor: 3140,
        status: 'Gerada · em aberto',
        geradaEm: '22/11/2026 06:12',
        composicao: [
          { item: 'Aluguel base', valor: 2680 },
          { item: 'IPTU mensal', valor: 185 },
          { item: 'Condomínio repassado', valor: 245 },
          { item: 'Seguro incêndio', valor: 30 },
        ],
      },
      {
        id: 'gb-2',
        vencimento: '02/12/2026',
        contrato: 'CT-2026-0205',
        imovel: 'Alameda Jaú, 590 · Apto 19',
        inquilino: 'Marcelo Teixeira Dias',
        valor: 4120,
        status: 'Gerada · recebida',
        geradaEm: '22/11/2026 06:15',
        composicao: [
          { item: 'Aluguel base', valor: 3490 },
          { item: 'IPTU mensal', valor: 220 },
          { item: 'Condomínio repassado', valor: 380 },
          { item: 'Seguro incêndio', valor: 30 },
        ],
      },
      {
        id: 'gb-3',
        vencimento: '05/12/2026',
        contrato: 'CT-2025-0412',
        imovel: 'Rua Melo Alves, 480 · Apto 112',
        inquilino: 'Carlos Mendes',
        valor: 3780,
        status: 'Gerada · em aberto',
        geradaEm: '22/11/2026 06:18',
        composicao: [
          { item: 'Aluguel base', valor: 3200 },
          { item: 'IPTU mensal', valor: 195 },
          { item: 'Condomínio repassado', valor: 355 },
          { item: 'Seguro incêndio', valor: 30 },
        ],
      },
      {
        id: 'gb-4',
        vencimento: '05/12/2026',
        contrato: 'CT-2026-0118',
        imovel: 'Rua João Cachoeira, 910 · Sala 8',
        inquilino: 'Lumina Estética Ltda',
        valor: 5890,
        status: 'Gerada · em aberto',
        geradaEm: '21/11/2026 18:40',
        composicao: [
          { item: 'Aluguel comercial', valor: 5200 },
          { item: 'IPTU mensal', valor: 410 },
          { item: 'Seguro incêndio', valor: 280 },
        ],
      },
      {
        id: 'gb-5',
        vencimento: '05/12/2026',
        contrato: 'CT-2024-0045',
        imovel: 'Rua Oscar Freire, 1120 · Apto 32',
        inquilino: 'Juliana Salles Moreira',
        valor: 5190,
        status: 'Gerada · recebida',
        geradaEm: '21/11/2026 17:15',
        composicao: [
          { item: 'Aluguel base', valor: 4600 },
          { item: 'IPTU mensal', valor: 290 },
          { item: 'Seguro fiança', valor: 300 },
        ],
      },
      {
        id: 'gb-6',
        vencimento: '05/12/2026',
        contrato: 'CT-2025-0519',
        imovel: 'Av. Angélica, 1820 · Apto 63',
        inquilino: 'Renata Vasconcelos',
        valor: 4290,
        status: 'Gerada · em aberto',
        geradaEm: '21/11/2026 16:35',
        composicao: [
          { item: 'Aluguel base', valor: 3850 },
          { item: 'IPTU mensal', valor: 230 },
          { item: 'Seguro fiança', valor: 210 },
        ],
      },
    ],
  },
  '7d': {
    intervalLabel: '16/11/2026 00:00 até 22/11/2026 16:00 (7 dias)',
    totalCount: 218,
    totalGenerated: 684200,
    totalReceived: 189400,
    items: [
      {
        id: 'gb-7d-1',
        vencimento: '30/11/2026',
        contrato: 'CT-2024-0510',
        imovel: 'Rua Estados Unidos, 1410 · Casa 4',
        inquilino: 'Eduardo Fonseca Braga',
        valor: 6980,
        status: 'Gerada · recebida',
        geradaEm: '18/11/2026 06:00',
        composicao: [
          { item: 'Aluguel base', valor: 6400 },
          { item: 'IPTU mensal', valor: 580 },
        ],
      },
      {
        id: 'gb-7d-2',
        vencimento: '01/12/2026',
        contrato: 'CT-2025-0701',
        imovel: 'Rua Vergueiro, 1420 · Apto 74',
        inquilino: 'Tatiane Ribeiro Costa',
        valor: 3140,
        status: 'Gerada · em aberto',
        geradaEm: '22/11/2026 06:12',
        composicao: [
          { item: 'Aluguel base', valor: 2680 },
          { item: 'Encargos', valor: 460 },
        ],
      },
      {
        id: 'gb-7d-3',
        vencimento: '05/12/2026',
        contrato: 'CT-2025-0412',
        imovel: 'Rua Melo Alves, 480 · Apto 112',
        inquilino: 'Carlos Mendes',
        valor: 3780,
        status: 'Gerada · em aberto',
        geradaEm: '22/11/2026 06:18',
        composicao: [
          { item: 'Aluguel base', valor: 3200 },
          { item: 'Encargos', valor: 580 },
        ],
      },
    ],
  },
  mes: {
    intervalLabel: '01/11/2026 00:00 até 22/11/2026 16:00 (Mês atual)',
    totalCount: 550,
    totalGenerated: 1892000,
    totalReceived: 1486200,
    items: [
      {
        id: 'gb-m-1',
        vencimento: '10/11/2026',
        contrato: 'CT-2024-0012',
        imovel: 'Av. Brigadeiro Luís Antônio, 3200 · Apto 61',
        inquilino: 'Fernanda Oliveira Rocha',
        valor: 3490,
        status: 'Gerada · recebida',
        geradaEm: '01/11/2026 06:00',
        composicao: [
          { item: 'Aluguel base', valor: 3150 },
          { item: 'Encargos', valor: 340 },
        ],
      },
      {
        id: 'gb-m-2',
        vencimento: '15/11/2026',
        contrato: 'CT-2024-0028',
        imovel: 'Rua Pamplona, 905 · Apto 88',
        inquilino: 'Bruno César Martins',
        valor: 3220,
        status: 'Gerada · recebida',
        geradaEm: '05/11/2026 06:00',
        composicao: [
          { item: 'Aluguel base', valor: 2880 },
          { item: 'Encargos', valor: 340 },
        ],
      },
      {
        id: 'gb-m-3',
        vencimento: '05/12/2026',
        contrato: 'CT-2026-0118',
        imovel: 'Rua João Cachoeira, 910 · Sala 8',
        inquilino: 'Lumina Estética Ltda',
        valor: 5890,
        status: 'Gerada · em aberto',
        geradaEm: '21/11/2026 18:40',
        composicao: [
          { item: 'Aluguel comercial', valor: 5200 },
          { item: 'Encargos', valor: 690 },
        ],
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// BLOCO 9 — COMUNICAÇÃO AUTOMATIZADA (E-mails últimos 7 dias)
// ---------------------------------------------------------------------------

export const EMAIL_AUTOMATION_7D: EmailAutomationDay[] = [
  {
    id: 'em-1',
    dia: '22/11/2026 (Hoje)',
    enviados: 142,
    naoEnviados: 3,
    taxaEntregaPct: 97.9,
    falhas: [
      {
        id: 'emf-1',
        horario: '08:14',
        destinatario: 'contato.antigo@nortesul.com.br',
        contrato: 'CT-2022-0904',
        assunto: 'Demonstrativo de débitos atualizados · Nov/2026',
        motivoFalha: '550 5.1.1 Caixa postal inexistente (hard bounce)',
      },
      {
        id: 'emf-2',
        horario: '09:42',
        destinatario: 'vitor.pereira@uol.com.br',
        contrato: 'CT-2025-0210',
        assunto: '2ª via de boleto e seguro incêndio',
        motivoFalha: 'Caixa de entrada do destinatário cheia (soft bounce)',
      },
      {
        id: 'emf-3',
        horario: '11:05',
        destinatario: 'juliano_moraes@empresa.com',
        contrato: 'CT-2024-0740',
        assunto: 'Lembrete de vencimento de condomínio',
        motivoFalha: 'Domínio sem resposta SMTP após 3 tentativas',
      },
    ],
  },
  {
    id: 'em-2',
    dia: '21/11/2026',
    enviados: 186,
    naoEnviados: 0,
    taxaEntregaPct: 100,
    falhas: [],
  },
  {
    id: 'em-3',
    dia: '20/11/2026',
    enviados: 214,
    naoEnviados: 2,
    taxaEntregaPct: 99.1,
    falhas: [
      {
        id: 'emf-4',
        horario: '07:30',
        destinatario: 'financeiro@cafeprosa.com.br',
        contrato: 'CT-2023-1081',
        assunto: 'Aviso de vencimento em atraso D+15',
        motivoFalha: 'Bloqueio de anti-spam corporativo (SPF timeout)',
      },
      {
        id: 'emf-5',
        horario: '14:18',
        destinatario: 'patricia.lima99@gmail.com',
        contrato: 'CT-2024-0188',
        assunto: 'Renovação de seguro incêndio pendente',
        motivoFalha: 'E-mail marcado com erro de sintaxe no cadastro antigo',
      },
    ],
  },
  {
    id: 'em-4',
    dia: '19/11/2026',
    enviados: 165,
    naoEnviados: 0,
    taxaEntregaPct: 100,
    falhas: [],
  },
  {
    id: 'em-5',
    dia: '18/11/2026',
    enviados: 198,
    naoEnviados: 1,
    taxaEntregaPct: 99.5,
    falhas: [
      {
        id: 'emf-6',
        horario: '10:22',
        destinatario: 'sergio.silva@provedor.com.br',
        contrato: 'CT-2024-0819',
        assunto: 'Comunicado de reajuste anual IGP-M',
        motivoFalha: 'Servidor destinatário recusou conexão temporariamente',
      },
    ],
  },
  {
    id: 'em-6',
    dia: '17/11/2026',
    enviados: 121,
    naoEnviados: 0,
    taxaEntregaPct: 100,
    falhas: [],
  },
  {
    id: 'em-7',
    dia: '16/11/2026',
    enviados: 94,
    naoEnviados: 0,
    taxaEntregaPct: 100,
    falhas: [],
  },
];

// ---------------------------------------------------------------------------
// BLOCO 10 — NOTAS FISCAIS (Últimos 7 dias: Geradas vs Pendentes vs Emitidas vs Erros)
// ---------------------------------------------------------------------------

export const FISCAL_NOTES_7D: FiscalNoteDay[] = [
  {
    id: 'nf-1',
    dia: '22/11/2026 (Hoje)',
    geradas: 38,
    pendentes: 4,
    emitidas: 32,
    erros: 2,
    registros: [
      {
        id: 'nfr-1',
        rps: 'RPS-2026-4120',
        tomador: 'Patrimonial Morais S.A.',
        contrato: 'CT-2023-1022',
        valor: 336,
        estado: 'Erro',
        detalheErro: 'Prefeitura SP (E142): Inscrição Municipal do tomador divergente do CNPJ na receita.',
      },
      {
        id: 'nfr-2',
        rps: 'RPS-2026-4121',
        tomador: 'Grupo Lobo Participações',
        contrato: 'CT-2026-0118',
        valor: 416,
        estado: 'Erro',
        detalheErro: 'Timeout na transmissão do lote ao webservice da prefeitura. Reenvio recomendado.',
      },
      {
        id: 'nfr-3',
        rps: 'RPS-2026-4122',
        tomador: 'Sérgio Monteiro',
        contrato: 'CT-2025-0412',
        valor: 256,
        estado: 'Pendente',
      },
      {
        id: 'nfr-4',
        rps: 'RPS-2026-4119',
        nfseNumero: 'NFSe 0084912',
        tomador: 'Helena Guimarães',
        contrato: 'CT-2025-0519',
        valor: 308,
        estado: 'Emitida',
      },
    ],
  },
  {
    id: 'nf-2',
    dia: '21/11/2026',
    geradas: 45,
    pendentes: 0,
    emitidas: 45,
    erros: 0,
    registros: [
      {
        id: 'nfr-5',
        rps: 'RPS-2026-4098',
        nfseNumero: 'NFSe 0084880',
        tomador: 'Eduardo Salles',
        contrato: 'CT-2024-0045',
        valor: 368,
        estado: 'Emitida',
      },
    ],
  },
  {
    id: 'nf-3',
    dia: '20/11/2026',
    geradas: 62,
    pendentes: 1,
    emitidas: 60,
    erros: 1,
    registros: [
      {
        id: 'nfr-6',
        rps: 'RPS-2026-4041',
        tomador: 'Fundo Patrimonial Faria',
        contrato: 'CT-2025-0084',
        valor: 450,
        estado: 'Erro',
        detalheErro: 'Código de serviço LC 116 (17.12) exige retenção ISS informada para este CNPJ.',
      },
      {
        id: 'nfr-7',
        rps: 'RPS-2026-4042',
        tomador: 'Clara Mendonça',
        contrato: 'CT-2024-0402',
        valor: 352,
        estado: 'Pendente',
      },
    ],
  },
  {
    id: 'nf-4',
    dia: '19/11/2026',
    geradas: 51,
    pendentes: 0,
    emitidas: 51,
    erros: 0,
    registros: [],
  },
  {
    id: 'nf-5',
    dia: '18/11/2026',
    geradas: 48,
    pendentes: 0,
    emitidas: 48,
    erros: 0,
    registros: [],
  },
  {
    id: 'nf-6',
    dia: '17/11/2026',
    geradas: 29,
    pendentes: 0,
    emitidas: 29,
    erros: 0,
    registros: [],
  },
  {
    id: 'nf-7',
    dia: '16/11/2026',
    geradas: 18,
    pendentes: 0,
    emitidas: 18,
    erros: 0,
    registros: [],
  },
];

// ---------------------------------------------------------------------------
// BLOCO 11 — COBRANÇAS AVULSAS ATRASADAS (Exatamente 3 registros)
// ---------------------------------------------------------------------------

export const ADHOC_OVERDUE_CHARGES: AdhocOverdueCharge[] = [
  {
    id: 'adh-1',
    contrato: 'CT-2024-0818',
    imovel: 'Casa Rua do Lago, 9',
    responsavelCobranca: 'Lucas Andrade (Inquilino)',
    origem: 'Danos apurados na vistoria de saída (OS-924)',
    vencimento: '12/11/2026',
    diasAtraso: 10,
    valor: 1640,
    situacao: 'Em contestação',
    historico: [
      { data: '19/11/2026', evento: 'Laudo comparativo gerado (PED-2026-004834)' },
      { data: '20/11/2026', evento: 'Inquilino pediu revisão do item box banheiro' },
    ],
  },
  {
    id: 'adh-2',
    contrato: 'CT-2023-0941',
    imovel: 'Rua Bela Cintra, 610 · Apto 31',
    responsavelCobranca: 'Luciana Ferreira Prado (Inquilino)',
    origem: 'Reembolso de taxa condominial extraordinária / multa regimental',
    vencimento: '08/11/2026',
    diasAtraso: 14,
    valor: 1480,
    situacao: 'Boleto vencido · reemitir',
    historico: [
      { data: '01/11/2026', evento: 'Cobrança avulsa emitida após rateio do síndico' },
      { data: '11/11/2026', evento: 'Lembrete D+3 enviado por e-mail' },
    ],
  },
  {
    id: 'adh-3',
    contrato: 'CT-2024-0612',
    imovel: 'Rua Cardeal Arcoverde, 1502 · Apto 41',
    responsavelCobranca: 'Rodrigo Almeida Prado (Inquilino)',
    origem: 'Troca emergencial de fechadura e reparo de sifão (OS-910)',
    vencimento: '15/11/2026',
    diasAtraso: 7,
    valor: 1260,
    situacao: 'Aguardando quitação',
    historico: [
      { data: '08/11/2026', evento: 'Nota fiscal do chaveiro vinculada ao contrato' },
      { data: '18/11/2026', evento: 'Boleto avulso enviado com vencimento atualizado' },
    ],
  },
];

// ---------------------------------------------------------------------------
// SEÇÕES 15 E 16 — DICIONÁRIO E GOVERNANÇA DOS INDICADORES
// ---------------------------------------------------------------------------

export const INDICATOR_DICTIONARY: IndicatorDictionaryItem[] = [
  {
    id: 'IND-GES-001',
    bloco: 'Bloco 1 · Carteira de Contratos',
    nome: 'Contratos por Situação (Ativos, Jurídico, Vencendo, Vencidos, Desativados)',
    definicaoFuncional: 'Contagem de contratos únicos classificados pela situação jurídica e vigência vigente na data de referência.',
    regraCalculo: 'COUNT(DISTINCT contrato_id) agrupado por status operacional e janela de término (<=60d, 61-180d, <0d).',
    fonteDados: 'Domínio Contratos (contratos_locacao)',
    dataReferencia: '22/11/2026 16:00',
    ultimaAtualizacao: 'Tempo real (cache 5 min)',
    criterioInclusaoExclusao: 'Inclui todos os contratos administrados pela unidade ativa. Desativados contempla encerrados e rescindidos históricos.',
  },
  {
    id: 'IND-GES-002',
    bloco: 'Bloco 2 · Contas Vencidas',
    nome: 'Obrigações Vencidas por Categoria',
    definicaoFuncional: 'Quantidade de obrigações acessórias em aberto após o vencimento (IPTU, Condomínio, Seguros, Utilidades, IRRF).',
    regraCalculo: 'COUNT(obrigacao_id) WHERE status = "Em aberto" AND data_vencimento < hoje. Não presume 1 obrigação por contrato.',
    fonteDados: 'Domínio Financeiro / Cobranças (obrigacoes_acessorias)',
    dataReferencia: '22/11/2026 16:00',
    ultimaAtualizacao: 'Sincronizado às 16:00',
    criterioInclusaoExclusao: 'Exclui obrigações quitadas, canceladas ou vinculadas a contratos em sinistro encerrado.',
  },
  {
    id: 'IND-GES-003',
    bloco: 'Bloco 3 · Aluguéis e Inadimplência',
    nome: 'Aluguéis a Vencer (10d) e Aluguéis Atrasados (378 registros)',
    definicaoFuncional: 'Monitoramento de parcelas de aluguel próximas do vencimento ou vencidas sem liquidação bancária.',
    regraCalculo: 'COUNT(lancamento_aluguel_id) por faixa temporal. Considera atrasado quando data_vencimento < hoje e sem baixa compensada (D+1).',
    fonteDados: 'Domínio Cobranças / Recebíveis (parcelas_aluguel)',
    dataReferencia: '22/11/2026 16:00',
    ultimaAtualizacao: 'Conciliação bancária D+1',
    criterioInclusaoExclusao: 'Conta registros de mensalidade (um contrato com 2 meses em aberto gera 2 registros). Exclui cobranças avulsas.',
  },
  {
    id: 'IND-GES-004',
    bloco: 'Bloco 4 · Repasses aos Proprietários',
    nome: 'Repasses Previstos (5d) e Repasses Atrasados (18 registros)',
    definicaoFuncional: 'Obrigações de pagamento líquido da imobiliária aos proprietários, independentes do evento de recebimento do inquilino.',
    regraCalculo: 'COUNT(repasse_id) WHERE status != "Pago" agrupado por data_prevista <= +5d ou < hoje.',
    fonteDados: 'Domínio Repasses (ordens_repasse)',
    dataReferencia: '22/11/2026 16:00',
    ultimaAtualizacao: 'Remessa bancária 15:30',
    criterioInclusaoExclusao: 'Diferencia previsto (futuro), pendente de liberação e efetivamente liquidado (comprovante bancário).',
  },
  {
    id: 'IND-GES-005',
    bloco: 'Bloco 5 · Seguros e Garantias',
    nome: 'Vencimentos de Seguro Fiança, Incêndio e Carta Fiança',
    definicaoFuncional: 'Controle de vigência das apólices e cartas fiança para evitar descobertura contratual.',
    regraCalculo: 'COUNT(garantia_id) para contratos ativos com vencimento < hoje (Vencidos) ou entre hoje e +30 dias.',
    fonteDados: 'Domínio Garantias (garantias_contratuais)',
    dataReferencia: '22/11/2026 16:00',
    ultimaAtualizacao: 'Diária às 06:00',
    criterioInclusaoExclusao: 'Inclui contratos ativos e em renovação. Exclui contratos desativados.',
  },
  {
    id: 'IND-GES-006',
    bloco: 'Bloco 6 · Reajustes Contratuais',
    nome: 'Reajustes a Vencer (30d) e Reajustes Vencidos',
    definicaoFuncional: 'Calendário de aniversários contratuais pendentes de aplicação do índice (IGP-M, IPCA ou INPC).',
    regraCalculo: 'COUNT(reajuste_id) WHERE aplicado = false e data_aniversario <= +30d ou < hoje.',
    fonteDados: 'Domínio Reajustes (agenda_reajustes)',
    dataReferencia: '22/11/2026 16:00',
    ultimaAtualizacao: 'Diária às 07:00',
    criterioInclusaoExclusao: 'Exclui contratos com termo de isenção formal ou em processo de rescisão formalizada.',
  },
  {
    id: 'IND-GES-007',
    bloco: 'Bloco 7 · Evolução Financeira',
    nome: 'Séries Mensais Independentes (Bruto, Líquido, Taxas e Gerado)',
    definicaoFuncional: 'Comparativo mensal preservando separação contábil entre faturamento gerado, recebimento bruto, líquido repassado e receita de taxas.',
    regraCalculo: 'SUM(valor) por competência contábil e natureza financeira sem compensação cruzada.',
    fonteDados: 'Domínio Financeiro (razão_financeira)',
    dataReferencia: 'Jun/2026 – Nov/2026',
    ultimaAtualizacao: 'Fechamento diário 16:00',
    criterioInclusaoExclusao: 'Estornos e devoluções deduzidos na respectiva série de origem.',
  },
  {
    id: 'IND-GES-008',
    bloco: 'Bloco 8 · Mensalidades Geradas',
    nome: 'Faturamento Gerado em Janela de 24h',
    definicaoFuncional: 'Acompanhamento de boletos/faturas emitidas na janela temporal consultada, separando faturado de efetivamente recebido.',
    regraCalculo: 'COUNT e SUM(valor) WHERE gerado_em BETWEEN inicio_janela AND fim_janela.',
    fonteDados: 'Domínio Cobranças (faturas_mensais)',
    dataReferencia: '21/11/2026 16:00 – 22/11/2026 16:00',
    ultimaAtualizacao: 'Lote automático 16:00',
    criterioInclusaoExclusao: 'Inclui faturas válidas emitidas; exclui rascunhos cancelados.',
  },
  {
    id: 'IND-GES-009',
    bloco: 'Bloco 9 · Comunicação Automatizada',
    nome: 'Monitoramento de E-mails Automáticos (7 dias)',
    definicaoFuncional: 'Totais diários de disparos automáticos e falhas de entrega (bounces SMTP).',
    regraCalculo: 'COUNT(envio_id) agrupado por data e status (Enviado vs Não enviado) nos últimos 7 dias corridos.',
    fonteDados: 'Domínio Comunicação (logs_smtp)',
    dataReferencia: '16/11/2026 – 22/11/2026',
    ultimaAtualizacao: 'Webhook em tempo real',
    criterioInclusaoExclusao: 'Escopo atual limitado a e-mail transacional; WhatsApp previsto para etapa futura.',
  },
  {
    id: 'IND-GES-010',
    bloco: 'Bloco 10 · Notas Fiscais',
    nome: 'Ciclo de Geração vs Emissão Efetiva de NFSe (7 dias)',
    definicaoFuncional: 'Distingue documentos gerados (RPS), pendentes na fila, efetivamente emitidos pela prefeitura e com erro de validação.',
    regraCalculo: 'COUNT(rps_id) por estado fiscal diário nos últimos 7 dias.',
    fonteDados: 'Domínio Fiscal (nfse_lotes)',
    dataReferencia: '16/11/2026 – 22/11/2026',
    ultimaAtualizacao: 'Retorno prefeitura a cada 15 min',
    criterioInclusaoExclusao: 'Notas canceladas antes da transmissão não entram como emitidas.',
  },
  {
    id: 'IND-GES-011',
    bloco: 'Bloco 11 · Cobranças Avulsas Atrasadas',
    nome: 'Pendências Avulsas Fora da Mensalidade',
    definicaoFuncional: 'Controle isolado de reembolsos, reparos, multas e taxas extras vencidas, separadas da inadimplência de aluguel.',
    regraCalculo: 'COUNT(cobranca_avulsa_id) WHERE tipo = "Avulsa" AND vencimento < hoje AND status != "Quitada".',
    fonteDados: 'Domínio Cobranças (cobrancas_avulsas)',
    dataReferencia: '22/11/2026 16:00',
    ultimaAtualizacao: 'Tempo real',
    criterioInclusaoExclusao: 'Exclui parcelas ordinárias de aluguel e encargos mensais consolidados na fatura.',
  },
];
