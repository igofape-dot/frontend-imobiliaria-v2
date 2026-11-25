import type { OrderCategory } from './agentOrdersData';

export type Modo = 'autonomo' | 'aprovacao' | 'sugerir' | 'bloqueado';
export type StatusRegra = 'rascunho' | 'em_aprovacao' | 'ativa' | 'pausada' | 'arquivada';
export type TipoRegra =
  | 'autonomia'
  | 'alcada'
  | 'prazo_sla'
  | 'politica_negocio'
  | 'comunicacao'
  | 'permissao'
  | 'qualidade_dados'
  | 'escalonamento'
  | 'meta_semaforo'
  | 'barreira';

export type PerfilRegra = 'Gestor' | 'Financeiro' | 'Jurídico' | 'Corretor';

export interface Condicao {
  campo: string;
  operador: string;
  valor: string | number;
}

export interface RuleVersionEntry {
  versao: number;
  data: string;
  autor: string;
  resumoMudanca: string;
  antes: string;
  depois: string;
  justificativa: string;
}

export interface RuleApplicationRecord {
  id: string;
  protocol: string;
  assunto: string;
  decisao: string;
  modoAplicado: Modo;
  versaoRegra: number;
  data: string;
  semEdicao: boolean;
}

export interface Regra {
  id: string; // ex.: FIN-014
  nome: string; // máx. 60
  justificativa: string; // máx. 200
  moduloDono: string;
  modulosAfetados: string[];
  tipo: TipoRegra;
  quando: Condicao[];
  entao: {
    modo: Modo;
    faixas?: { ate?: number; modo: Modo; aprovador?: string }[];
    parametros?: Record<string, string | number>;
  };
  excecoes: Condicao[];
  aprovador?: string;
  prazoAprovacaoHoras?: number;
  vigenciaInicio: string;
  vigenciaFim?: string;
  status: StatusRegra;
  versao: number;
  travada?: boolean; // travada = barreira, só administrador edita
  criadaPor: string;
  atualizadaEm: string;
  acionamentos30d: number;
  registradaPor?: string;
  conflitoCom?: { ruleId: string; descricao: string };
  historico?: RuleVersionEntry[];
  aplicacoes?: RuleApplicationRecord[];
  impactoSemanal?: { semana: string; acionamentos: number }[];
  aprovadasSemEdicaoPct?: number;
  bloqueiosRevertidosPct?: number;
}

export interface AgentRuleSuggestion {
  id: string;
  titulo: string;
  evidencia: string;
  amostra: string;
  impactoEstimado: string;
  ruleIdRelacionada?: string;
  draftTemplate: {
    nome: string;
    justificativa: string;
    moduloDono: string;
    modulosAfetados: string[];
    tipo: TipoRegra;
    quando: Condicao[];
    entao: Regra['entao'];
    excecoes: Condicao[];
    aprovador: string;
    prazoAprovacaoHoras: number;
  };
}

export interface GlobalHistoryItem {
  id: string;
  ruleId: string;
  ruleNome: string;
  versao: number;
  quem: string;
  quando: string;
  oQueMudou: string;
  antes: string;
  depois: string;
  justificativa: string;
}

export interface AutonomyMatrixCell {
  id: string;
  categoria: OrderCategory;
  subtipo: string;
  modo: Modo;
  limiteValor?: number;
}

export const MODULOS_DISPONIVEIS = [
  'Financeiro',
  'Contratos e Jurídico',
  'Locação e Administração',
  'Vendas',
  'Captação e Marketing',
  'Manutenção e Vistorias',
  'Clientes',
  'Equipe',
  'Relatórios',
  'Global',
] as const;

export const INITIAL_RULES: Regra[] = [
  {
    id: 'FIN-014',
    nome: 'Desconto de multa e juros em boletos',
    justificativa:
      'Agilizar negociações pequenas sem perder controle sobre descontos expressivos ou casos judicializados.',
    moduloDono: 'Financeiro',
    modulosAfetados: ['Locação e Administração', 'Contratos e Jurídico'],
    tipo: 'alcada',
    quando: [
      { campo: 'Tipo de pedido', operador: 'igual a', valor: 'Cobrança / Negociação' },
      { campo: 'Valor do desconto (%)', operador: 'entre', valor: '0% e 100%' },
    ],
    entao: {
      modo: 'aprovacao',
      faixas: [
        { ate: 10, modo: 'autonomo' },
        { ate: 30, modo: 'aprovacao', aprovador: 'Gestor' },
        { modo: 'bloqueado' },
      ],
      parametros: { unidade: '%' },
    },
    excecoes: [{ campo: 'Status judicial', operador: 'igual a', valor: 'Com ação judicial' }],
    aprovador: 'Gestor (ou Jurídico se ação judicial)',
    prazoAprovacaoHoras: 4,
    vigenciaInicio: '2026-09-01',
    status: 'ativa',
    versao: 3,
    criadaPor: 'Farina (Gestor)',
    atualizadaEm: '18/11/2026',
    acionamentos30d: 148,
    registradaPor: 'Redigida pelo agente, confirmada por Farina',
    conflitoCom: {
      ruleId: 'JUR-007',
      descricao:
        'Em contratos com ação judicial, FIN-014 permite acordo até 10%, enquanto JUR-007 exige aprovação jurídica em qualquer negociação rescisória.',
    },
    aprovadasSemEdicaoPct: 94,
    bloqueiosRevertidosPct: 8,
    impactoSemanal: [
      { semana: 'S1', acionamentos: 31 },
      { semana: 'S2', acionamentos: 38 },
      { semana: 'S3', acionamentos: 42 },
      { semana: 'S4', acionamentos: 37 },
    ],
    aplicacoes: [
      {
        id: 'app-1',
        protocol: 'PED-2026-004803',
        assunto: 'Executar cobrança escalonada dos 16 inquilinos em atraso',
        decisao: 'Aprovação exigida pela regra FIN-014 para faixas acima de 10% de desconto.',
        modoAplicado: 'aprovacao',
        versaoRegra: 3,
        data: '22/11/2026 · 10:02',
        semEdicao: true,
      },
      {
        id: 'app-2',
        protocol: 'PED-2026-004804.1',
        assunto: 'Emitir segunda via atualizada do boleto de novembro',
        decisao: 'Recálculo sem desconto aplicado dentro da autonomia da FIN-014.',
        modoAplicado: 'autonomo',
        versaoRegra: 3,
        data: '22/11/2026 · 08:20',
        semEdicao: true,
      },
    ],
    historico: [
      {
        versao: 3,
        data: '18/11/2026 · 16:40',
        autor: 'Farina (Gestor)',
        resumoMudanca: 'Inclusa exceção obrigatória para contratos com ação judicial.',
        antes: 'Sem exceção para contratos judicializados',
        depois: 'Exceção: Status judicial = Com ação judicial → sempre aprovação do Jurídico',
        justificativa: 'Evitar acordo automático em processo judicial em andamento.',
      },
      {
        versao: 2,
        data: '04/10/2026 · 11:15',
        autor: 'Financeiro Farina',
        resumoMudanca: 'Ampliado limite autônomo de 5% para 10%.',
        antes: 'Até 5% autônomo; 5–25% aprovação',
        depois: 'Até 10% autônomo; 10–30% aprovação em 4h',
        justificativa: 'Reduzir fila de aprovação para descontos pequenos.',
      },
      {
        versao: 1,
        data: '01/09/2026 · 09:00',
        autor: 'Farina (Gestor)',
        resumoMudanca: 'Criação inicial da regra de desconto.',
        antes: 'Sem regra cadastrada',
        depois: 'Até 5% autônomo; acima de 25% bloqueado',
        justificativa: 'Padronizar concessão de descontos pelo agente.',
      },
    ],
  },
  {
    id: 'FIN-009',
    nome: 'Acordo de parcelamento de débitos',
    justificativa:
      'Permitir parcelamento curto automático e submeter prazos maiores à validação financeira.',
    moduloDono: 'Financeiro',
    modulosAfetados: ['Locação e Administração'],
    tipo: 'alcada',
    quando: [{ campo: 'Quantidade de parcelas', operador: 'maior ou igual a', valor: 1 }],
    entao: {
      modo: 'aprovacao',
      faixas: [
        { ate: 3, modo: 'autonomo' },
        { ate: 6, modo: 'aprovacao', aprovador: 'Financeiro' },
        { modo: 'bloqueado' },
      ],
      parametros: { unidade: 'parcelas' },
    },
    excecoes: [{ campo: 'Garantia', operador: 'igual a', valor: 'Sem garantia ativa' }],
    aprovador: 'Financeiro',
    prazoAprovacaoHoras: 8,
    vigenciaInicio: '2026-08-15',
    status: 'ativa',
    versao: 2,
    criadaPor: 'Financeiro Farina',
    atualizadaEm: '02/11/2026',
    acionamentos30d: 89,
    registradaPor: 'Redigida pelo agente, confirmada por Financeiro Farina',
    aprovadasSemEdicaoPct: 91,
    bloqueiosRevertidosPct: 12,
    impactoSemanal: [
      { semana: 'S1', acionamentos: 21 },
      { semana: 'S2', acionamentos: 24 },
      { semana: 'S3', acionamentos: 20 },
      { semana: 'S4', acionamentos: 24 },
    ],
    aplicacoes: [],
    historico: [
      {
        versao: 2,
        data: '02/11/2026 · 14:20',
        autor: 'Financeiro Farina',
        resumoMudanca: 'Parcelamento até 3x liberado no modo autônomo.',
        antes: 'Até 2 parcelas autônomo',
        depois: 'Até 3 parcelas autônomo; até 6 aprovação',
        justificativa: '96% dos acordos em 3x vinham sendo aprovados sem alteração.',
      },
    ],
  },
  {
    id: 'FIN-020',
    nome: 'Régua de cobrança e horário de disparo',
    justificativa:
      'Garantir escalonamento previsível da inadimplência respeitando janela comercial de 8h às 19h.',
    moduloDono: 'Financeiro',
    modulosAfetados: ['Comunicação', 'Contratos e Jurídico'],
    tipo: 'comunicacao',
    quando: [
      { campo: 'Dias em atraso', operador: 'maior ou igual a', valor: 1 },
      { campo: 'Horário atual', operador: 'entre', valor: '08:00 e 19:00' },
    ],
    entao: {
      modo: 'autonomo',
      parametros: {
        d1: 'Lembrete WhatsApp',
        d5: 'E-mail formal',
        d15: 'Notificação formal (aprovação)',
        d30: 'Escalar ao Jurídico',
        janela: '08h às 19h',
      },
    },
    excecoes: [{ campo: 'Comprovante PIX', operador: 'igual a', valor: 'Em conciliação' }],
    aprovador: 'Gestor (em D+15)',
    prazoAprovacaoHoras: 4,
    vigenciaInicio: '2026-07-01',
    status: 'ativa',
    versao: 2,
    criadaPor: 'Farina (Gestor)',
    atualizadaEm: '10/11/2026',
    acionamentos30d: 412,
    registradaPor: 'Redigida pelo agente, confirmada por Farina',
    aprovadasSemEdicaoPct: 97,
    bloqueiosRevertidosPct: 3,
    impactoSemanal: [
      { semana: 'S1', acionamentos: 98 },
      { semana: 'S2', acionamentos: 105 },
      { semana: 'S3', acionamentos: 102 },
      { semana: 'S4', acionamentos: 107 },
    ],
    aplicacoes: [
      {
        id: 'app-20',
        protocol: 'PED-2026-004803',
        assunto: 'Executar cobrança escalonada dos 16 inquilinos em atraso',
        decisao: 'Disparos D+1 e D+5 automáticos; D+30 escalado ao Jurídico.',
        modoAplicado: 'autonomo',
        versaoRegra: 2,
        data: '20/11/2026 · 14:14',
        semEdicao: true,
      },
    ],
  },
  {
    id: 'FIN-003',
    nome: 'Repasse a proprietário acima de R$ 20 mil',
    justificativa:
      'Impedir transferência sem lastro bancário conciliado e exigir dupla checagem acima de R$ 20.000.',
    moduloDono: 'Financeiro',
    modulosAfetados: ['Locação e Administração'],
    tipo: 'alcada',
    quando: [
      { campo: 'Conciliação OFX', operador: 'igual a', valor: 'Confirmada' },
      { campo: 'Valor do lote/repasse', operador: 'acima de', valor: 20000 },
    ],
    entao: {
      modo: 'aprovacao',
      faixas: [
        { ate: 20000, modo: 'autonomo' },
        { modo: 'aprovacao', aprovador: 'Gestor' },
      ],
      parametros: { unidade: 'R$' },
    },
    excecoes: [{ campo: 'Divergência de taxa', operador: 'diferente de', valor: '0,00' }],
    aprovador: 'Gestor',
    prazoAprovacaoHoras: 2,
    vigenciaInicio: '2026-06-01',
    status: 'ativa',
    versao: 1,
    criadaPor: 'Farina (Gestor)',
    atualizadaEm: '01/06/2026',
    acionamentos30d: 164,
    registradaPor: 'Redigida pelo agente, confirmada por Farina',
    aprovadasSemEdicaoPct: 99,
    bloqueiosRevertidosPct: 2,
    aplicacoes: [
      {
        id: 'app-3',
        protocol: 'PED-2026-004807',
        assunto: 'Liberar lote de 6 repasses que vencem hoje (R$ 28.450)',
        decisao: 'Aprovação exigida pela regra FIN-003 (lote de R$ 28.450 > R$ 20.000).',
        modoAplicado: 'aprovacao',
        versaoRegra: 1,
        data: '22/11/2026 · 13:28',
        semEdicao: true,
      },
    ],
  },
  {
    id: 'FIN-011',
    nome: 'Pagamento a fornecedor e alçada de reparo',
    justificativa:
      'Agilizar manutenções corriqueiras até R$ 1.500 e exigir aprovação do gestor em orçamentos maiores.',
    moduloDono: 'Financeiro',
    modulosAfetados: ['Manutenção e Vistorias', 'Locação e Administração'],
    tipo: 'alcada',
    quando: [{ campo: 'Valor do orçamento/pagamento', operador: 'maior que', valor: 0 }],
    entao: {
      modo: 'aprovacao',
      faixas: [
        { ate: 1500, modo: 'autonomo' },
        { modo: 'aprovacao', aprovador: 'Gestor' },
      ],
      parametros: { unidade: 'R$' },
    },
    excecoes: [],
    aprovador: 'Gestor',
    prazoAprovacaoHoras: 4,
    vigenciaInicio: '2026-08-01',
    status: 'ativa',
    versao: 2,
    criadaPor: 'Farina (Gestor)',
    atualizadaEm: '12/10/2026',
    acionamentos30d: 73,
    registradaPor: 'Redigida pelo agente, confirmada por Farina',
    aprovadasSemEdicaoPct: 89,
    bloqueiosRevertidosPct: 5,
    aplicacoes: [
      {
        id: 'app-11',
        protocol: 'PED-2026-004809',
        assunto: 'Vazamento na cozinha, Rua das Acácias 120',
        decisao: 'Aprovação exigida pela regra FIN-011: orçamento R$ 2.350,00 acima da alçada de R$ 1.500.',
        modoAplicado: 'aprovacao',
        versaoRegra: 2,
        data: '22/11/2026 · 11:26',
        semEdicao: true,
      },
    ],
  },
  {
    id: 'FIN-017',
    nome: 'Tolerância automática de conciliação (R$ 0,50)',
    justificativa:
      'Evitar travar baixas bancárias por diferenças de centavos em arredondamento de boleto/PIX.',
    moduloDono: 'Financeiro',
    modulosAfetados: ['Financeiro'],
    tipo: 'politica_negocio',
    quando: [{ campo: 'Diferença de centavos', operador: 'menor ou igual a', valor: 0.5 }],
    entao: {
      modo: 'autonomo',
      parametros: { toleranciaReais: 0.5 },
    },
    excecoes: [{ campo: 'Pagador terceiro sem CPF', operador: 'igual a', valor: 'Sim' }],
    aprovador: 'Financeiro',
    prazoAprovacaoHoras: 12,
    vigenciaInicio: '2026-12-01',
    status: 'rascunho',
    versao: 1,
    criadaPor: 'Financeiro Farina',
    atualizadaEm: '21/11/2026',
    acionamentos30d: 0,
    registradaPor: 'Redigida pelo agente, confirmada por Financeiro Farina',
    aplicacoes: [],
  },
  {
    id: 'FIN-021',
    nome: 'Bloqueio de boleto com divergência de beneficiário',
    justificativa:
      'Segurar automaticamente remessas quando o CNPJ/CPF favorecido divergir do contrato ativo.',
    moduloDono: 'Financeiro',
    modulosAfetados: ['Locação e Administração'],
    tipo: 'qualidade_dados',
    quando: [{ campo: 'CPF/CNPJ beneficiário', operador: 'diferente de', valor: 'Cadastro do proprietário' }],
    entao: {
      modo: 'bloqueado',
      parametros: { exigirValidacao: 'Sim' },
    },
    excecoes: [],
    aprovador: 'Financeiro',
    prazoAprovacaoHoras: 4,
    vigenciaInicio: '2026-07-10',
    status: 'ativa',
    versao: 1,
    criadaPor: 'Financeiro Farina',
    atualizadaEm: '10/07/2026',
    acionamentos30d: 58,
    registradaPor: 'Redigida pelo agente, confirmada por Financeiro Farina',
    aprovadasSemEdicaoPct: 62,
    bloqueiosRevertidosPct: 53,
    aplicacoes: [
      {
        id: 'app-21',
        protocol: 'PED-2026-004806',
        assunto: 'Vincular PIX de R$ 2.950 sem CPF à fatura da Casa 12',
        decisao: 'Exceção sinalizada pela regra FIN-021 por pagamento via conta de terceiro.',
        modoAplicado: 'aprovacao',
        versaoRegra: 1,
        data: '22/11/2026 · 13:11',
        semEdicao: true,
      },
    ],
  },
  {
    id: 'JUR-002',
    nome: 'Renovação de contrato 90 dias antes do vencimento',
    justificativa:
      'Iniciar preparo autônomo em D-90 e exigir aprovação do Gestor em 8h para envio da minuta sem alteração.',
    moduloDono: 'Contratos e Jurídico',
    modulosAfetados: ['Locação e Administração', 'Financeiro'],
    tipo: 'politica_negocio',
    quando: [{ campo: 'Dias para vencimento', operador: 'menor ou igual a', valor: 90 }],
    entao: {
      modo: 'aprovacao',
      parametros: { antecedenciaDias: 90, indice: 'Índice do contrato (IGP-M/IPCA)', preparoAutonomo: 'Sim' },
    },
    excecoes: [{ campo: 'Notificação de desocupação', operador: 'igual a', valor: 'Protocolada' }],
    aprovador: 'Gestor',
    prazoAprovacaoHoras: 8,
    vigenciaInicio: '2026-05-01',
    status: 'ativa',
    versao: 4,
    criadaPor: 'Jurídico Farina',
    atualizadaEm: '20/11/2026',
    acionamentos30d: 92,
    registradaPor: 'Redigida pelo agente, confirmada por Jurídico Farina',
    aprovadasSemEdicaoPct: 93,
    bloqueiosRevertidosPct: 4,
    aplicacoes: [
      {
        id: 'app-jur2',
        protocol: 'PED-2026-004812',
        assunto: 'Enviar minuta de renovação Apto 302 (Carlos Mendes)',
        decisao: 'Minuta calculada com IGP-M 4,2% (R$ 3.334,40) e aprovação solicitada ao Gestor em 8h.',
        modoAplicado: 'aprovacao',
        versaoRegra: 4,
        data: '22/11/2026 · 10:15',
        semEdicao: true,
      },
    ],
  },
  {
    id: 'JUR-005',
    nome: 'Uso exclusivo de minutas jurídicas homologadas',
    justificativa:
      'Impedir alteração livre de cláusulas sem parecer do Jurídico (24h) e bloquear modelos não homologados.',
    moduloDono: 'Contratos e Jurídico',
    modulosAfetados: ['Locação e Administração', 'Vendas'],
    tipo: 'permissao',
    quando: [{ campo: 'Cláusula modificada', operador: 'igual a', valor: 'Sim' }],
    entao: {
      modo: 'aprovacao',
      parametros: { exigirModeloHomologado: 'Sim' },
    },
    excecoes: [{ campo: 'Modelo', operador: 'igual a', valor: 'Não aprovado (bloqueado)' }],
    aprovador: 'Jurídico',
    prazoAprovacaoHoras: 24,
    vigenciaInicio: '2026-06-01',
    status: 'ativa',
    versao: 2,
    criadaPor: 'Jurídico Farina',
    atualizadaEm: '12/11/2026',
    acionamentos30d: 41,
    registradaPor: 'Redigida pelo agente, confirmada por Jurídico Farina',
    aprovadasSemEdicaoPct: 88,
    bloqueiosRevertidosPct: 6,
  },
  {
    id: 'JUR-007',
    nome: 'Rescisão de contrato sempre exige aprovação',
    justificativa:
      'Rescisões envolvem multa proporcional, vistoria de saída e risco jurídico; exige aprovação do Jurídico em 24h.',
    moduloDono: 'Contratos e Jurídico',
    modulosAfetados: ['Financeiro', 'Locação e Administração', 'Manutenção e Vistorias'],
    tipo: 'autonomia',
    quando: [{ campo: 'Tipo de pedido', operador: 'igual a', valor: 'Rescisão / Encerramento' }],
    entao: {
      modo: 'aprovacao',
      parametros: { exigirVistoriaSaida: 'Sim' },
    },
    excecoes: [],
    aprovador: 'Jurídico',
    prazoAprovacaoHoras: 24,
    vigenciaInicio: '2026-06-01',
    status: 'ativa',
    versao: 1,
    criadaPor: 'Jurídico Farina',
    atualizadaEm: '14/11/2026',
    acionamentos30d: 34,
    registradaPor: 'Redigida pelo agente, confirmada por Jurídico Farina',
    conflitoCom: {
      ruleId: 'FIN-014',
      descricao:
        'Em contrato com ação judicial, prevalece a regra mais restritiva (aprovação do Jurídico via JUR-007).',
    },
    aprovadasSemEdicaoPct: 90,
    bloqueiosRevertidosPct: 0,
  },
  {
    id: 'JUR-010',
    nome: 'Alerta de vencimento de garantias (60 dias)',
    justificativa:
      'Alertar locatário 60 dias antes do vencimento (autônomo) e exigir aprovação do Jurídico em 24h para troca de garantia.',
    moduloDono: 'Contratos e Jurídico',
    modulosAfetados: ['Locação e Administração', 'Financeiro'],
    tipo: 'escalonamento',
    quando: [{ campo: 'Vencimento da garantia', operador: 'menor ou igual a', valor: '60 dias' }],
    entao: {
      modo: 'autonomo',
      parametros: { alertaAntecedenciaDias: 60, trocaGarantia: 'Aprovação Jurídico 24h' },
    },
    excecoes: [{ campo: 'Tipo de pedido', operador: 'igual a', valor: 'Troca de garantia' }],
    aprovador: 'Jurídico',
    prazoAprovacaoHoras: 24,
    vigenciaInicio: '2026-10-01',
    status: 'ativa',
    versao: 2,
    criadaPor: 'Jurídico Farina',
    atualizadaEm: '21/11/2026',
    acionamentos30d: 29,
    registradaPor: 'Redigida pelo agente, confirmada por Jurídico Farina',
  },
  {
    id: 'JUR-013',
    nome: 'Documentos obrigatórios e confiança mínima 85%',
    justificativa:
      'Confiança < 85% exige triagem humana; documento obrigatório faltando é solicitado ao cliente e bloqueia emissão.',
    moduloDono: 'Contratos e Jurídico',
    modulosAfetados: ['Cadastro e atualização', 'Locação e Administração'],
    tipo: 'qualidade_dados',
    quando: [{ campo: 'Confiança da extração PDF', operador: 'menor que', valor: '85%' }],
    entao: {
      modo: 'aprovacao',
      parametros: { confiancaMinimaPct: 85, bloqueiaEmissaoSemDoc: 'Sim' },
    },
    excecoes: [],
    aprovador: 'Jurídico',
    prazoAprovacaoHoras: 8,
    vigenciaInicio: '2026-07-01',
    status: 'ativa',
    versao: 3,
    criadaPor: 'Jurídico Farina',
    atualizadaEm: '15/11/2026',
    acionamentos30d: 47,
    registradaPor: 'Redigida pelo agente, confirmada por Jurídico Farina',
    aplicacoes: [
      {
        id: 'app-jur13',
        protocol: 'PED-2026-004810',
        assunto: 'Extrair e cadastrar contrato PDF Sala 804 Paulista',
        decisao: 'Extração atingiu 95% de confiança (acima dos 85% exigidos pela JUR-013).',
        modoAplicado: 'autonomo',
        versaoRegra: 3,
        data: '22/11/2026 · 13:46',
        semEdicao: true,
      },
    ],
  },
  {
    id: 'JUR-001',
    nome: 'Barreira: notificação judicial e ação de despejo',
    justificativa:
      'Medidas judiciais formais possuem responsabilidade legal exclusiva de advogado habilitado.',
    moduloDono: 'Contratos e Jurídico',
    modulosAfetados: ['Financeiro', 'Comunicação'],
    tipo: 'barreira',
    quando: [{ campo: 'Ação solicitada', operador: 'contém', valor: 'Notificação judicial / Despejo' }],
    entao: { modo: 'bloqueado' },
    excecoes: [],
    vigenciaInicio: '2026-01-01',
    status: 'ativa',
    versao: 1,
    travada: true,
    criadaPor: 'Administrador',
    atualizadaEm: '01/01/2026',
    acionamentos30d: 19,
    registradaPor: 'Barreira de segurança · edição exclusiva do Administrador',
    aplicacoes: [
      {
        id: 'app-jur1',
        protocol: 'PED-2026-004800',
        assunto: 'Revisar notificação extrajudicial Sala 902 Centro',
        decisao: 'Agente gerou apenas minuta preparatória; envio formal bloqueado pela JUR-001.',
        modoAplicado: 'bloqueado',
        versaoRegra: 1,
        data: '22/11/2026 · 09:42',
        semEdicao: true,
      },
    ],
  },
  {
    id: 'BAR-002',
    nome: 'Barreira: alterar valor de contrato sem aprovação',
    justificativa:
      'Impedir que qualquer reajuste ou aditivo financeiro altere valor contratual sem aprovação humana.',
    moduloDono: 'Global',
    modulosAfetados: ['Locação e Administração', 'Financeiro', 'Contratos e Jurídico'],
    tipo: 'barreira',
    quando: [{ campo: 'Campo alterado', operador: 'igual a', valor: 'Valor do aluguel / venda' }],
    entao: { modo: 'bloqueado' },
    excecoes: [],
    vigenciaInicio: '2026-01-01',
    status: 'ativa',
    versao: 1,
    travada: true,
    criadaPor: 'Administrador',
    atualizadaEm: '01/01/2026',
    acionamentos30d: 38,
    registradaPor: 'Barreira de segurança · edição exclusiva do Administrador',
  },
  {
    id: 'BAR-003',
    nome: 'Barreira: apagar registros do sistema',
    justificativa:
      'Preservar trilha completa de auditoria; registros podem apenas ser arquivados ou desfeitos.',
    moduloDono: 'Global',
    modulosAfetados: ['Global'],
    tipo: 'barreira',
    quando: [{ campo: 'Operação', operador: 'igual a', valor: 'Exclusão definitiva (DELETE)' }],
    entao: { modo: 'bloqueado' },
    excecoes: [],
    vigenciaInicio: '2026-01-01',
    status: 'ativa',
    versao: 1,
    travada: true,
    criadaPor: 'Administrador',
    atualizadaEm: '01/01/2026',
    acionamentos30d: 4,
    registradaPor: 'Barreira de segurança · edição exclusiva do Administrador',
  },
  {
    id: 'BAR-004',
    nome: 'Barreira: compartilhar dados de terceiros (LGPD)',
    justificativa:
      'Proibir envio de CPF, renda, extratos ou contratos para contatos externos não autenticados.',
    moduloDono: 'Global',
    modulosAfetados: ['Comunicação', 'Clientes'],
    tipo: 'barreira',
    quando: [{ campo: 'Destinatário', operador: 'diferente de', valor: 'Parte titular do contrato' }],
    entao: { modo: 'bloqueado' },
    excecoes: [],
    vigenciaInicio: '2026-01-01',
    status: 'ativa',
    versao: 1,
    travada: true,
    criadaPor: 'Administrador',
    atualizadaEm: '01/01/2026',
    acionamentos30d: 11,
    registradaPor: 'Barreira de segurança · edição exclusiva do Administrador',
  },
  {
    id: 'BAR-005',
    nome: 'Barreira: pagar ou transferir acima da alçada',
    justificativa:
      'Nenhuma remessa ou pagamento pode ser liquidado automaticamente acima do teto definido.',
    moduloDono: 'Financeiro',
    modulosAfetados: ['Financeiro'],
    tipo: 'barreira',
    quando: [{ campo: 'Pagamento', operador: 'maior que', valor: 'Teto da alçada ativa' }],
    entao: { modo: 'bloqueado' },
    excecoes: [],
    vigenciaInicio: '2026-01-01',
    status: 'ativa',
    versao: 1,
    travada: true,
    criadaPor: 'Administrador',
    atualizadaEm: '01/01/2026',
    acionamentos30d: 14,
    registradaPor: 'Barreira de segurança · edição exclusiva do Administrador',
  },
  {
    id: 'BAR-006',
    nome: 'Barreira: prometer prazos ou valores jurídicos ao cliente',
    justificativa:
      'Evitar comprometimento vinculante de decisões judiciais, indenizações ou acordos não assinados.',
    moduloDono: 'Contratos e Jurídico',
    modulosAfetados: ['Comunicação', 'Clientes'],
    tipo: 'barreira',
    quando: [{ campo: 'Conteúdo da resposta', operador: 'contém', valor: 'Promessa jurídica / indenização' }],
    entao: { modo: 'bloqueado' },
    excecoes: [],
    vigenciaInicio: '2026-01-01',
    status: 'ativa',
    versao: 1,
    travada: true,
    criadaPor: 'Administrador',
    atualizadaEm: '01/01/2026',
    acionamentos30d: 7,
    registradaPor: 'Barreira de segurança · edição exclusiva do Administrador',
  },
  {
    id: 'GLO-002',
    nome: 'SLAs padrão por prioridade de pedido',
    justificativa:
      'Definir prazos de resposta e entrega para todos os pedidos recebidos pelos canais.',
    moduloDono: 'Global',
    modulosAfetados: ['Global'],
    tipo: 'prazo_sla',
    quando: [{ campo: 'Prioridade do pedido', operador: 'em', valor: 'Urgente, Alta, Normal, Baixa' }],
    entao: {
      modo: 'autonomo',
      parametros: {
        urgenteHoras: 4,
        altaDiasUteis: 1,
        normalDiasUteis: 3,
        baixaDiasUteis: 7,
      },
    },
    excecoes: [{ campo: 'Status', operador: 'igual a', valor: 'Aguardando esclarecimento (pausa relógio)' }],
    vigenciaInicio: '2026-05-01',
    status: 'ativa',
    versao: 1,
    criadaPor: 'Farina (Gestor)',
    atualizadaEm: '01/05/2026',
    acionamentos30d: 185,
    registradaPor: 'Redigida pelo agente, confirmada por Farina',
  },
  {
    id: 'GLO-003',
    nome: 'Metas e semáforos dos KPIs da home',
    justificativa:
      'Controlar inadimplência da home (≤ 4% verde, > 7% crítico) e espelhar vacância diretamente da regra-fonte LOC-006 v2.',
    moduloDono: 'Global',
    modulosAfetados: ['Relatórios', 'Financeiro', 'Locação e Administração'],
    tipo: 'meta_semaforo',
    quando: [{ campo: 'Indicador', operador: 'em', valor: 'Vacância (via LOC-006), Inadimplência' }],
    entao: {
      modo: 'autonomo',
      parametros: {
        vacanciaRegraFonte: 'LOC-006 v2',
        vacanciaVerdeMax: 5,
        vacanciaVermelhaMin: 8,
        inadimplenciaVerdeMax: 4,
        inadimplenciaVermelhaMin: 7,
      },
    },
    excecoes: [],
    vigenciaInicio: '2026-05-01',
    status: 'ativa',
    versao: 2,
    criadaPor: 'Farina (Gestor)',
    atualizadaEm: '22/11/2026',
    acionamentos30d: 30,
    registradaPor: 'Redigida pelo agente, confirmada por Farina · Vacância aponta para LOC-006',
  },
  {
    id: 'GLO-004',
    nome: 'Limites de caracteres da ficha padronizada',
    justificativa:
      'Manter leitura objetiva nas fichas sem alterar ou cortar a mensagem original recebida.',
    moduloDono: 'Global',
    modulosAfetados: ['Global'],
    tipo: 'qualidade_dados',
    quando: [{ campo: 'Etapa', operador: 'igual a', valor: 'Interpretação do pedido' }],
    entao: {
      modo: 'autonomo',
      parametros: { assuntoMax: 60, objetivoMax: 140, narrativaMax: 400 },
    },
    excecoes: [],
    vigenciaInicio: '2026-05-01',
    status: 'ativa',
    versao: 1,
    criadaPor: 'Farina (Gestor)',
    atualizadaEm: '01/05/2026',
    acionamentos30d: 391,
    registradaPor: 'Redigida pelo agente, confirmada por Farina',
  },
  {
    id: 'COM-004',
    nome: 'Follow-up automático de propostas após 48h',
    justificativa:
      'Enviar lembrete cordial aos compradores e proprietários quando uma proposta ficar parada por 2 dias.',
    moduloDono: 'Vendas',
    modulosAfetados: ['Captação e Marketing', 'Clientes'],
    tipo: 'comunicacao',
    quando: [{ campo: 'Tempo sem resposta', operador: 'maior que', valor: '48 horas' }],
    entao: {
      modo: 'sugerir',
      parametros: { canalPreferencial: 'WhatsApp' },
    },
    excecoes: [],
    aprovador: 'Gestor',
    prazoAprovacaoHoras: 24,
    vigenciaInicio: '2026-11-24',
    status: 'em_aprovacao',
    versao: 1,
    criadaPor: 'Rafael Costa (Corretor)',
    atualizadaEm: '22/11/2026',
    acionamentos30d: 0,
    registradaPor: 'Redigida pelo agente, aguardando aprovação de Farina',
  },
  {
    id: 'LOC-001',
    nome: 'Alçada de ajuste de preço pedido de locação',
    justificativa:
      'Permitir pequenos ajustes com autorização do proprietário, exigir aprovação do Gestor de 5% a 15% e bloquear cortes acima de 15%.',
    moduloDono: 'Locação e Administração',
    modulosAfetados: ['Captação e Marketing', 'Comunicação'],
    tipo: 'alcada',
    quando: [
      { campo: 'Autorização do proprietário', operador: 'igual a', valor: 'Registrada' },
      { campo: 'Variação de preço (%)', operador: 'entre', valor: '0% e 15%' },
    ],
    entao: {
      modo: 'aprovacao',
      faixas: [
        { ate: 5, modo: 'autonomo' },
        { ate: 15, modo: 'aprovacao', aprovador: 'Gestor' },
        { modo: 'bloqueado' },
      ],
      parametros: { unidade: '%', sugerirSempreAutonomo: 'Sim' },
    },
    excecoes: [
      { campo: 'Autorização do proprietário', operador: 'igual a', valor: 'Ausente (bloqueado)' },
    ],
    aprovador: 'Gestor',
    prazoAprovacaoHoras: 4,
    vigenciaInicio: '2026-08-01',
    status: 'ativa',
    versao: 2,
    criadaPor: 'Farina (Gestor)',
    atualizadaEm: '14/11/2026',
    acionamentos30d: 34,
    registradaPor: 'Redigida pelo agente, confirmada por Farina',
    aplicacoes: [
      {
        id: 'app-loc1',
        protocol: 'PED-2026-004829',
        assunto: 'Reduzir aluguel pedido Casa Rua das Figueiras 210 (-8,2%)',
        decisao: 'Variação de -8,2% (faixa 5% a 15%) com autorização do proprietário exige Gestor em 4h.',
        modoAplicado: 'aprovacao',
        versaoRegra: 2,
        data: '22/11/2026 · 14:22',
        semEdicao: true,
      },
    ],
  },
  {
    id: 'LOC-002',
    nome: 'Requisitos obrigatórios para publicar anúncio',
    justificativa:
      'Garantir anúncios completos (≥ 8 fotos, metragem, valor, autorização) e imóvel pronto conforme regra-fonte MAN-006 v1.',
    moduloDono: 'Locação e Administração',
    modulosAfetados: ['Captação e Marketing', 'Manutenção e Vistorias'],
    tipo: 'qualidade_dados',
    quando: [
      { campo: 'Fotos válidas', operador: 'maior ou igual a', valor: 8 },
      { campo: 'Prontidão (via MAN-006 v1)', operador: 'igual a', valor: 'Imóvel pronto para alugar' },
    ],
    entao: {
      modo: 'autonomo',
      parametros: {
        fotosMinimas: 8,
        tituloMaxChars: 70,
        descricaoMaxChars: 800,
        exigirAutorizacaoDivulgacao: 'Sim',
        prontidaoRegraFonte: 'MAN-006 v1',
      },
    },
    excecoes: [
      { campo: 'Checklist de publicação ou MAN-006', operador: 'igual a', valor: 'Incompleto (bloqueia e solicita)' },
    ],
    vigenciaInicio: '2026-07-15',
    status: 'ativa',
    versao: 3,
    criadaPor: 'Farina (Gestor)',
    atualizadaEm: '09/11/2026',
    acionamentos30d: 52,
    registradaPor: 'Redigida pelo agente, confirmada por Farina · Imóvel pronto aponta para MAN-006',
  },
  {
    id: 'LOC-003',
    nome: 'Atendimento de lead e visitas com aviso 24h',
    justificativa:
      'Responder leads em até 5 min entre 8h e 19h e bloquear visitas em imóvel ocupado sem aviso de 24h e consentimento do inquilino.',
    moduloDono: 'Locação e Administração',
    modulosAfetados: ['Captação e Marketing', 'Comunicação'],
    tipo: 'comunicacao',
    quando: [{ campo: 'Horário de resposta', operador: 'entre', valor: '08:00 e 19:00 (SLA 5 min)' }],
    entao: {
      modo: 'autonomo',
      parametros: {
        slaPrimeiraRespostaMin: 5,
        janelaInicio: '08:00',
        janelaFim: '19:00',
        avisoImovelOcupadoHoras: 24,
      },
    },
    excecoes: [
      { campo: 'Imóvel ocupado sem aviso 24h e consentimento', operador: 'igual a', valor: 'Bloqueado' },
    ],
    vigenciaInicio: '2026-06-20',
    status: 'ativa',
    versao: 2,
    criadaPor: 'Farina (Gestor)',
    atualizadaEm: '05/11/2026',
    acionamentos30d: 118,
    registradaPor: 'Redigida pelo agente, confirmada por Farina',
  },
  {
    id: 'LOC-004',
    nome: 'Análise cadastral de candidato e aprovação humana',
    justificativa:
      'Agente calcula comprometimento de renda e consulta bureau apenas com consentimento; decisão final e recusa objetiva são humanas.',
    moduloDono: 'Locação e Administração',
    modulosAfetados: ['Contratos e Jurídico', 'Clientes'],
    tipo: 'autonomia',
    quando: [
      { campo: 'Consentimento LGPD para bureau', operador: 'igual a', valor: 'Registrado' },
      { campo: 'Comprometimento (aluguel+encargos)/renda', operador: 'calculado em', valor: '≤ 30% / ≤ 35% / > 35%' },
    ],
    entao: {
      modo: 'aprovacao',
      parametros: {
        faixaRecomendarMax: 30,
        faixaRessalvaMax: 35,
        nuncaReprovaSozinho: 'Sim',
        motivoRecusaMaxChars: 200,
      },
    },
    excecoes: [
      { campo: 'Base legal / consentimento bureau', operador: 'igual a', valor: 'Ausente (bloqueado)' },
    ],
    aprovador: 'Gestor',
    prazoAprovacaoHoras: 8,
    vigenciaInicio: '2026-08-10',
    status: 'ativa',
    versao: 1,
    criadaPor: 'Farina (Gestor)',
    atualizadaEm: '18/10/2026',
    acionamentos30d: 44,
    registradaPor: 'Redigida pelo agente, confirmada por Farina',
    aplicacoes: [
      {
        id: 'app-loc4',
        protocol: 'PED-2026-004830',
        assunto: 'Aprovar cadastro Renata Duarte · Apto 604 (31,5%)',
        decisao: 'Comprometimento 31,5% enquadrado em "recomendar com ressalva" · Gestor em 8h.',
        modoAplicado: 'aprovacao',
        versaoRegra: 1,
        data: '22/11/2026 · 14:35',
        semEdicao: true,
      },
    ],
  },
  {
    id: 'LOC-005',
    nome: 'Captação de imóvel e alçada de taxa de administração',
    justificativa:
      'Cadastro autônomo após extração ≥ 85%; taxa ≥ 9% autônoma, 7% a < 9% pede Gestor em 8h e < 7% bloqueada.',
    moduloDono: 'Locação e Administração',
    modulosAfetados: ['Contratos e Jurídico', 'Financeiro'],
    tipo: 'alcada',
    quando: [{ campo: 'Taxa de administração (%)', operador: 'maior que', valor: 0 }],
    entao: {
      modo: 'aprovacao',
      faixas: [
        { ate: 6.99, modo: 'bloqueado' },
        { ate: 8.99, modo: 'aprovacao', aprovador: 'Gestor' },
        { modo: 'autonomo' },
      ],
      parametros: {
        taxaAutonomaMinPct: 9,
        taxaAprovacaoMinPct: 7,
        minutaPadrao: 'Administração v5',
      },
    },
    excecoes: [
      { campo: 'Cláusula alterada na minuta Administração v5', operador: 'igual a', valor: 'Jurídico 24h (JUR-005)' },
    ],
    aprovador: 'Gestor',
    prazoAprovacaoHoras: 8,
    vigenciaInicio: '2026-09-10',
    status: 'ativa',
    versao: 2,
    criadaPor: 'Farina (Gestor)',
    atualizadaEm: '16/11/2026',
    acionamentos30d: 26,
    registradaPor: 'Redigida pelo agente, confirmada por Farina',
    aplicacoes: [
      {
        id: 'app-loc5',
        protocol: 'PED-2026-004831',
        assunto: 'Captar Apto 1405 Ed. Horizonte (Lúcia Menezes) · taxa 8%',
        decisao: 'Taxa de 8% (entre 7% e <9%) exige aprovação do Gestor em 8h.',
        modoAplicado: 'aprovacao',
        versaoRegra: 2,
        data: '22/11/2026 · 14:40',
        semEdicao: true,
      },
    ],
  },
  {
    id: 'LOC-006',
    nome: 'Metas de vacância e tempo para alugar (regra-fonte)',
    justificativa:
      'Regra-fonte única para semáforos de vacância (verde ≤ 5%, crítico > 8%) e tempo para alugar (verde ≤ 30d, crítico > 45d).',
    moduloDono: 'Locação e Administração',
    modulosAfetados: ['Global', 'Relatórios', 'Contratos e Jurídico'],
    tipo: 'meta_semaforo',
    quando: [{ campo: 'Dias vago do imóvel', operador: 'maior ou igual a', valor: 30 }],
    entao: {
      modo: 'autonomo',
      parametros: {
        vacanciaVerdeMax: 5,
        vacanciaVermelhaMin: 8,
        tempoAlugarVerdeMaxDias: 30,
        tempoAlugarVermelhoMinDias: 45,
        alertaGestorDias: 30,
        sugerirAjustePrecoDias: 45,
      },
    },
    excecoes: [
      { campo: 'Visitas em 30 dias', operador: 'igual a', valor: 0 },
    ],
    vigenciaInicio: '2026-05-01',
    status: 'ativa',
    versao: 2,
    criadaPor: 'Farina (Gestor)',
    atualizadaEm: '19/11/2026',
    acionamentos30d: 41,
    registradaPor: 'Redigida pelo agente, confirmada por Farina',
  },
  {
    id: 'LOC-007',
    nome: 'Envio automático de relatório mensal ao proprietário',
    justificativa:
      'Consolidar extrato de repasse, ocupação e manutenções e enviar ao proprietário todo dia 05 após revisão do modelo.',
    moduloDono: 'Locação e Administração',
    modulosAfetados: ['Financeiro', 'Comunicação'],
    tipo: 'comunicacao',
    quando: [{ campo: 'Dia do mês', operador: 'igual a', valor: 5 }],
    entao: {
      modo: 'sugerir',
      parametros: { incluirResumoRepasses: 'Sim', canal: 'E-mail + WhatsApp' },
    },
    excecoes: [],
    aprovador: 'Gestor',
    prazoAprovacaoHoras: 12,
    vigenciaInicio: '2026-12-01',
    status: 'rascunho',
    versao: 1,
    criadaPor: 'Farina (Gestor)',
    atualizadaEm: '21/11/2026',
    acionamentos30d: 0,
    registradaPor: 'Redigida pelo agente, aguardando ativação pelo Gestor',
  },
  {
    id: 'MAN-001',
    nome: 'Classificação, urgência e SLA de chamados',
    justificativa:
      'Triar chamados com ≥ 80% de confiança, acionar plantão 24h em emergências (5 min) e aplicar SLAs por nível de urgência.',
    moduloDono: 'Manutenção e Vistorias',
    modulosAfetados: ['Locação e Administração', 'Comunicação'],
    tipo: 'prazo_sla',
    quando: [{ campo: 'Urgência do chamado', operador: 'em', valor: 'Emergência, Urgente, Normal, Baixa' }],
    entao: {
      modo: 'autonomo',
      parametros: {
        confiancaMinimaPct: 80,
        emergenciaConfirmacaoMin: 5,
        emergenciaInicioHoras: 4,
        emergenciaSolucaoDiasUteis: 2,
        urgenteInicioHoras: 24,
        urgenteSolucaoDiasUteis: 3,
        normalInicioDiasUteis: 3,
        normalSolucaoDiasUteis: 10,
        baixaInicioDiasUteis: 7,
        baixaSolucaoDiasUteis: 20,
      },
    },
    excecoes: [
      { campo: 'Imóvel ocupado sem aceite de visita', operador: 'igual a', valor: 'Nunca autoriza entrada forçada' },
    ],
    aprovador: 'Gestor',
    prazoAprovacaoHoras: 4,
    vigenciaInicio: '2026-06-15',
    status: 'ativa',
    versao: 2,
    criadaPor: 'Farina (Gestor)',
    atualizadaEm: '12/11/2026',
    acionamentos30d: 61,
    registradaPor: 'Redigida pelo agente, confirmada por Farina',
    aplicacoes: [
      {
        id: 'app-man1',
        protocol: 'PED-2026-004836',
        assunto: 'EMERGÊNCIA: Vazamento com risco elétrico Loja 7 Galeria Norte',
        decisao: 'Confirmado em 3 min, plantão acionado e gestor/proprietário notificados imediatamente (MAN-001 v2).',
        modoAplicado: 'autonomo',
        versaoRegra: 2,
        data: '22/11/2026 · 14:15',
        semEdicao: true,
      },
    ],
  },
  {
    id: 'MAN-002',
    nome: 'Responsabilidade de reparo e cobrança ao inquilino',
    justificativa:
      'Agente sugere pagador com evidência e % de confiança; cobrar dano do inquilino exige Gestor (8h); contestação escala ao Jurídico.',
    moduloDono: 'Manutenção e Vistorias',
    modulosAfetados: ['Financeiro', 'Contratos e Jurídico'],
    tipo: 'autonomia',
    quando: [{ campo: 'Pagador sugerido', operador: 'em', valor: 'Proprietário, Inquilino, Condomínio, Terceiro' }],
    entao: {
      modo: 'aprovacao',
      parametros: { confiancaMinimaPct: 80, contestacaoEscalaJuridico: 'Sim' },
    },
    excecoes: [
      { campo: 'Contestação do inquilino', operador: 'igual a', valor: 'Bloqueia e escala ao Jurídico' },
    ],
    aprovador: 'Gestor',
    prazoAprovacaoHoras: 8,
    vigenciaInicio: '2026-07-01',
    status: 'ativa',
    versao: 3,
    criadaPor: 'Farina (Gestor)',
    atualizadaEm: '18/11/2026',
    acionamentos30d: 43,
    registradaPor: 'Redigida pelo agente, confirmada por Farina',
    aplicacoes: [
      {
        id: 'app-man2',
        protocol: 'PED-2026-004834',
        assunto: 'Laudo saída Casa Rua do Lago 9 · R$ 1.640 danos',
        decisao: 'Cobrança ao inquilino de R$ 1.640,00 submetida à aprovação do Gestor em 8h (MAN-002 v3).',
        modoAplicado: 'aprovacao',
        versaoRegra: 3,
        data: '22/11/2026 · 13:50',
        semEdicao: true,
      },
    ],
  },
  {
    id: 'MAN-003',
    nome: 'Fornecedores homologados e mínimo de orçamentos',
    justificativa:
      'Exigir fornecedor homologado (CNPJ e certidões; < 85% JUR-013) e 1/2/3 orçamentos conforme valor (1 em emergência de contenção).',
    moduloDono: 'Manutenção e Vistorias',
    modulosAfetados: ['Financeiro'],
    tipo: 'politica_negocio',
    quando: [
      { campo: 'Fornecedor homologado', operador: 'igual a', valor: 'Sim' },
      { campo: 'Valor do orçamento', operador: 'maior que', valor: 0 },
    ],
    entao: {
      modo: 'aprovacao',
      faixas: [
        { ate: 1500, modo: 'autonomo' },
        { ate: 5000, modo: 'aprovacao', aprovador: 'Gestor (mín. 2 orçamentos)' },
        { modo: 'aprovacao', aprovador: 'Gestor (mín. 3 orçamentos)' },
      ],
      parametros: {
        ate1500MinOrc: 1,
        ate5000MinOrc: 2,
        acima5000MinOrc: 3,
        emergenciaContencaoMinOrc: 1,
      },
    },
    excecoes: [
      { campo: 'Fornecedor não homologado', operador: 'igual a', valor: 'Bloqueado · inicia homologação' },
    ],
    aprovador: 'Gestor',
    prazoAprovacaoHoras: 4,
    vigenciaInicio: '2026-07-10',
    status: 'ativa',
    versao: 2,
    criadaPor: 'Farina (Gestor)',
    atualizadaEm: '11/11/2026',
    acionamentos30d: 38,
    registradaPor: 'Redigida pelo agente, confirmada por Farina',
    aplicacoes: [
      {
        id: 'app-man3',
        protocol: 'PED-2026-004833',
        assunto: 'Orçamento R$ 4.180 reforma pós-saída Cedro 57',
        decisao: '2 orçamentos de fornecedores homologados conferidos; liberado para etapa de alçada FIN-011.',
        modoAplicado: 'aprovacao',
        versaoRegra: 2,
        data: '22/11/2026 · 12:10',
        semEdicao: true,
      },
    ],
  },
  {
    id: 'MAN-004',
    nome: 'Autorização prévia do proprietário para reparos',
    justificativa:
      'Até R$ 800 dispensa autorização prévia; acima de R$ 800 exige aceite registrado, exceto contenção emergencial até R$ 1.500.',
    moduloDono: 'Manutenção e Vistorias',
    modulosAfetados: ['Financeiro', 'Comunicação'],
    tipo: 'alcada',
    quando: [{ campo: 'Valor do reparo', operador: 'maior que', valor: 800 }],
    entao: {
      modo: 'bloqueado',
      parametros: {
        isentoAteReais: 800,
        emergenciaContencaoAteReais: 1500,
        canaisAceite: 'WhatsApp, E-mail ou assinatura',
      },
    },
    excecoes: [
      { campo: 'Emergência de contenção (≤ R$ 1.500)', operador: 'igual a', valor: 'Executa e notifica proprietário' },
    ],
    aprovador: 'Proprietário',
    prazoAprovacaoHoras: 24,
    vigenciaInicio: '2026-08-01',
    status: 'ativa',
    versao: 1,
    criadaPor: 'Farina (Gestor)',
    atualizadaEm: '01/08/2026',
    acionamentos30d: 27,
    registradaPor: 'Redigida pelo agente, confirmada por Farina',
    aplicacoes: [
      {
        id: 'app-man4',
        protocol: 'PED-2026-004838',
        assunto: 'Troca fechadura R$ 1.120 Apto 504 Ed. Solar',
        decisao: 'Aprovado na FIN-011 (≤ R$ 1.500), mas bloqueado pela MAN-004 (> R$ 800 sem autorização do dono).',
        modoAplicado: 'bloqueado',
        versaoRegra: 1,
        data: '22/11/2026 · 11:05',
        semEdicao: true,
      },
    ],
  },
  {
    id: 'MAN-005',
    nome: 'Vistorias de entrada, saída e revisão de laudos',
    justificativa:
      'Bloquear chaves sem laudo assinado; vistoria de saída em 3 dias úteis (8h–19h) e laudo em 2 dias úteis; item < 80% vai a humano.',
    moduloDono: 'Manutenção e Vistorias',
    modulosAfetados: ['Contratos e Jurídico', 'Locação e Administração'],
    tipo: 'prazo_sla',
    quando: [{ campo: 'Tipo de vistoria', operador: 'em', valor: 'Entrada, Saída' }],
    entao: {
      modo: 'autonomo',
      parametros: {
        saidaPrazoDiasUteis: 3,
        laudoPrazoDiasUteis: 2,
        janelaVisita: '08h às 19h',
        confiancaMinimaItemPct: 80,
      },
    },
    excecoes: [
      { campo: 'Laudo entrada sem assinatura', operador: 'igual a', valor: 'Bloqueia entrega de chaves' },
    ],
    aprovador: 'Gestor',
    prazoAprovacaoHoras: 8,
    vigenciaInicio: '2026-06-20',
    status: 'ativa',
    versao: 2,
    criadaPor: 'Jurídico Farina',
    atualizadaEm: '15/11/2026',
    acionamentos30d: 24,
    registradaPor: 'Redigida pelo agente, confirmada por Jurídico Farina',
    aplicacoes: [
      {
        id: 'app-man5',
        protocol: 'PED-2026-004790',
        assunto: 'Entrega de chaves Apto 1204 Ed. Aurora (sem laudo assinado)',
        decisao: 'Entrega bloqueada pela MAN-005 v2 até assinatura da vistoria de entrada pela inquilina.',
        modoAplicado: 'bloqueado',
        versaoRegra: 2,
        data: '22/11/2026 · 09:15',
        semEdicao: true,
      },
    ],
  },
  {
    id: 'MAN-006',
    nome: 'Checklist de imóvel pronto para alugar (regra-fonte)',
    justificativa:
      'Regra-fonte única de prontidão (apontada por LOC-002): laudo saída, 0 OS abertas, vistoria final (> R$ 500), limpeza e chaves. Meta 15d.',
    moduloDono: 'Manutenção e Vistorias',
    modulosAfetados: ['Locação e Administração', 'Captação e Marketing'],
    tipo: 'qualidade_dados',
    quando: [{ campo: 'Imóvel em preparação pós-saída', operador: 'igual a', valor: 'Sim' }],
    entao: {
      modo: 'autonomo',
      parametros: {
        metaDiasCorridos: 15,
        escalarDiasCorridos: 20,
        vistoriaFinalAcimaReais: 500,
      },
    },
    excecoes: [
      { campo: 'Dias em preparação', operador: 'maior que', valor: 20 },
    ],
    vigenciaInicio: '2026-09-01',
    status: 'ativa',
    versao: 1,
    criadaPor: 'Farina (Gestor)',
    atualizadaEm: '19/11/2026',
    acionamentos30d: 19,
    registradaPor: 'Redigida pelo agente, confirmada por Farina · Regra-fonte de prontidão',
  },
  {
    id: 'MAN-007',
    nome: 'Vistoria periódica anual em imóveis alugados',
    justificativa:
      'Em rascunho: quando ativada, o agente agendará vistoria preventiva anual respeitando aviso de 24h e aceite do inquilino.',
    moduloDono: 'Manutenção e Vistorias',
    modulosAfetados: ['Locação e Administração'],
    tipo: 'comunicacao',
    quando: [{ campo: 'Meses desde última vistoria', operador: 'igual a', valor: 12 }],
    entao: {
      modo: 'sugerir',
      parametros: { periodicidadeMeses: 12, avisoPrevioHoras: 24 },
    },
    excecoes: [],
    aprovador: 'Gestor',
    prazoAprovacaoHoras: 24,
    vigenciaInicio: '2026-12-01',
    status: 'rascunho',
    versao: 1,
    criadaPor: 'Farina (Gestor)',
    atualizadaEm: '22/11/2026',
    acionamentos30d: 0,
    registradaPor: 'Redigida pelo agente, aguardando ativação pelo Gestor',
  },
];

export const INITIAL_AUTONOMY_MATRIX: AutonomyMatrixCell[] = [
  { id: 'aut-1', categoria: 'Cadastro e atualização', subtipo: 'Cadastro de imóvel', modo: 'aprovacao', limiteValor: 0 },
  { id: 'aut-2', categoria: 'Cadastro e atualização', subtipo: 'Cadastro de contrato', modo: 'aprovacao' },
  { id: 'aut-3', categoria: 'Cadastro e atualização', subtipo: 'Atualização cadastral', modo: 'autonomo' },
  { id: 'aut-4', categoria: 'Cadastro e atualização', subtipo: 'Cadastro de pessoa', modo: 'autonomo' },

  { id: 'aut-5', categoria: 'Locação e contratos', subtipo: 'Renovação', modo: 'aprovacao' },
  { id: 'aut-6', categoria: 'Locação e contratos', subtipo: 'Rescisão', modo: 'aprovacao' },
  { id: 'aut-7', categoria: 'Locação e contratos', subtipo: 'Reajuste anual', modo: 'autonomo' },
  { id: 'aut-8', categoria: 'Locação e contratos', subtipo: 'Garantia locatícia', modo: 'aprovacao' },

  { id: 'aut-9', categoria: 'Cobrança e financeiro', subtipo: 'Segunda via de boleto', modo: 'autonomo', limiteValor: 500 },
  { id: 'aut-10', categoria: 'Cobrança e financeiro', subtipo: 'Cobrança', modo: 'autonomo', limiteValor: 5000 },
  { id: 'aut-11', categoria: 'Cobrança e financeiro', subtipo: 'Repasse', modo: 'aprovacao', limiteValor: 20000 },
  { id: 'aut-12', categoria: 'Cobrança e financeiro', subtipo: 'Baixa de pagamento', modo: 'autonomo', limiteValor: 10000 },

  { id: 'aut-13', categoria: 'Vendas e captação', subtipo: 'Lead de portal', modo: 'autonomo' },
  { id: 'aut-14', categoria: 'Vendas e captação', subtipo: 'Captação de imóvel', modo: 'aprovacao' },
  { id: 'aut-15', categoria: 'Vendas e captação', subtipo: 'Proposta de compra', modo: 'sugerir' },
  { id: 'aut-16', categoria: 'Vendas e captação', subtipo: 'Exclusividade', modo: 'aprovacao' },

  { id: 'aut-17', categoria: 'Manutenção e vistoria', subtipo: 'Chamado', modo: 'autonomo', limiteValor: 1500 },
  { id: 'aut-18', categoria: 'Manutenção e vistoria', subtipo: 'Vistoria', modo: 'autonomo' },
  { id: 'aut-19', categoria: 'Manutenção e vistoria', subtipo: 'Orçamento de reparo', modo: 'aprovacao', limiteValor: 1500 },
  { id: 'aut-20', categoria: 'Manutenção e vistoria', subtipo: 'Entrega de chaves', modo: 'aprovacao' },

  { id: 'aut-21', categoria: 'Jurídico e documentos', subtipo: 'Aditivo contratual', modo: 'aprovacao' },
  { id: 'aut-22', categoria: 'Jurídico e documentos', subtipo: 'Notificação', modo: 'bloqueado' },
  { id: 'aut-23', categoria: 'Jurídico e documentos', subtipo: 'Minuta de contrato', modo: 'sugerir' },
  { id: 'aut-24', categoria: 'Jurídico e documentos', subtipo: 'Análise documental', modo: 'autonomo' },

  { id: 'aut-25', categoria: 'Consulta e relatório', subtipo: 'Relatório', modo: 'autonomo' },
  { id: 'aut-26', categoria: 'Consulta e relatório', subtipo: 'Consulta cadastral', modo: 'autonomo' },
  { id: 'aut-27', categoria: 'Consulta e relatório', subtipo: 'Resumo operacional', modo: 'autonomo' },
  { id: 'aut-28', categoria: 'Consulta e relatório', subtipo: 'Extrato financeiro', modo: 'autonomo' },

  { id: 'aut-29', categoria: 'Comunicação', subtipo: 'Agendamento de visita', modo: 'autonomo' },
  { id: 'aut-30', categoria: 'Comunicação', subtipo: 'Aviso a inquilino', modo: 'autonomo' },
  { id: 'aut-31', categoria: 'Comunicação', subtipo: 'Retorno a proprietário', modo: 'sugerir' },
  { id: 'aut-32', categoria: 'Comunicação', subtipo: 'Follow-up comercial', modo: 'autonomo' },

  { id: 'aut-33', categoria: 'Triagem (não classificado)', subtipo: 'Mensagem ambígua', modo: 'sugerir' },
  { id: 'aut-34', categoria: 'Triagem (não classificado)', subtipo: 'Solicitante desconhecido', modo: 'sugerir' },
  { id: 'aut-35', categoria: 'Triagem (não classificado)', subtipo: 'Anexo ilegível', modo: 'aprovacao' },
];

export const INITIAL_SUGGESTIONS: AgentRuleSuggestion[] = [
  {
    id: 'sug-1',
    titulo: 'Você aprovou 47 de 47 cobranças até R$ 500 sem editar. Tornar autônomas?',
    evidencia:
      'Nos últimos 30 dias, 100% das cobranças de taxas e boletos até R$ 500 foram aprovadas sem alteração de texto ou valor.',
    amostra: '47 pedidos aprovados · tempo médio de espera economizado: 42 min/pedido',
    impactoEstimado: 'Reduzirá a fila "Aguardando você" em ~11 pedidos por semana.',
    ruleIdRelacionada: 'FIN-020',
    draftTemplate: {
      nome: 'Cobranças até R$ 500 em modo autônomo',
      justificativa:
        'Baseada em histórico de 47 aprovações consecutivas sem edição para valores até R$ 500.',
      moduloDono: 'Financeiro',
      modulosAfetados: ['Comunicação'],
      tipo: 'autonomia',
      quando: [
        { campo: 'Tipo de pedido', operador: 'igual a', valor: 'Cobrança' },
        { campo: 'Valor em aberto', operador: 'menor ou igual a', valor: 500 },
      ],
      entao: {
        modo: 'autonomo',
        faixas: [
          { ate: 500, modo: 'autonomo' },
          { modo: 'aprovacao', aprovador: 'Financeiro' },
        ],
        parametros: { unidade: 'R$' },
      },
      excecoes: [{ campo: 'Contestação aberta', operador: 'igual a', valor: 'Sim' }],
      aprovador: 'Gestor',
      prazoAprovacaoHoras: 4,
    },
  },
  {
    id: 'sug-2',
    titulo: 'A regra FIN-021 bloqueou 31 pedidos que depois foram liberados. Revisar?',
    evidencia:
      'Em 53% dos bloqueios de FIN-021 (beneficiário divergente), o pagador era cônjuge ou sócio cadastrado na mesma ficha.',
    amostra: '31 de 58 bloqueios liberados manualmente nos últimos 30 dias',
    impactoEstimado: 'Diminui falsos bloqueios em baixas PIX e acelera conciliação em 1h20.',
    ruleIdRelacionada: 'FIN-021',
    draftTemplate: {
      nome: 'Aceitar pagador cônjuge/sócio na FIN-021 com valor exato',
      justificativa:
        'Evitar bloqueio quando o valor bater exatamente com o boleto e o pagador constar como cônjuge/sócio.',
      moduloDono: 'Financeiro',
      modulosAfetados: ['Locação e Administração'],
      tipo: 'qualidade_dados',
      quando: [
        { campo: 'Valor pago', operador: 'igual a', valor: 'Valor exato da fatura' },
        { campo: 'Vínculo pagador', operador: 'em', valor: 'Cônjuge, Sócio cadastrado' },
      ],
      entao: {
        modo: 'aprovacao',
        parametros: { exigirComprovante: 'Sim' },
      },
      excecoes: [],
      aprovador: 'Financeiro',
      prazoAprovacaoHoras: 4,
    },
  },
  {
    id: 'sug-3',
    titulo: 'Agendamentos de visita de portais têm 98% de aceite automático. Padronizar?',
    evidencia:
      'Leads vindos do ZAP e VivaReal com janela livre na agenda do corretor não geraram nenhuma reclamação em 64 visitas.',
    amostra: '64 agendamentos no mês · satisfação média 4,9/5',
    impactoEstimado: 'Mantém resposta imediata (< 1 min) mesmo fora do horário comercial.',
    draftTemplate: {
      nome: 'Agendamento autônomo de visitas de portais',
      justificativa:
        'Confirmar visitas automaticamente quando o corretor responsável possuir horário livre.',
      moduloDono: 'Vendas',
      modulosAfetados: ['Comunicação', 'Captação e Marketing'],
      tipo: 'autonomia',
      quando: [{ campo: 'Origem do lead', operador: 'em', valor: 'ZAP, VivaReal' }],
      entao: { modo: 'autonomo' },
      excecoes: [{ campo: 'Imóvel ocupado sem aviso', operador: 'igual a', valor: 'Sim' }],
      aprovador: 'Gestor',
      prazoAprovacaoHoras: 8,
    },
  },
];

export const INITIAL_GLOBAL_HISTORY: GlobalHistoryItem[] = [
  {
    id: 'hist-1',
    ruleId: 'FIN-014',
    ruleNome: 'Desconto de multa e juros em boletos',
    versao: 3,
    quem: 'Farina (Gestor)',
    quando: '18/11/2026 · 16:40',
    oQueMudou: 'Inclusa exceção obrigatória para contratos com ação judicial',
    antes: 'Sem exceção para contratos judicializados',
    depois: 'Exceção: Com ação judicial → sempre aprovação do Jurídico',
    justificativa: 'Evitar acordo automático em processo judicial em andamento.',
  },
  {
    id: 'hist-2',
    ruleId: 'JUR-007',
    ruleNome: 'Rescisão de contrato sempre exige aprovação',
    versao: 2,
    quem: 'Jurídico Farina',
    quando: '14/11/2026 · 10:12',
    oQueMudou: 'Reduzido prazo máximo de aprovação de 12h para 6h',
    antes: 'Prazo de aprovação: 12 horas',
    depois: 'Prazo de aprovação: 6 horas',
    justificativa: 'Acelerar devolutivas de entrega de chaves.',
  },
  {
    id: 'hist-3',
    ruleId: 'JUR-002',
    ruleNome: 'Renovação de contrato 90 dias antes do vencimento',
    versao: 2,
    quem: 'Jurídico Farina',
    quando: '08/11/2026 · 15:30',
    oQueMudou: 'Antecedência ampliada de 60 para 90 dias antes do vencimento',
    antes: 'Iniciar 60 dias antes',
    depois: 'Iniciar 90 dias antes do vencimento',
    justificativa: 'Reduzir vacância por atraso em negociações de renovação.',
  },
  {
    id: 'hist-4',
    ruleId: 'FIN-009',
    ruleNome: 'Acordo de parcelamento de débitos',
    versao: 2,
    quem: 'Financeiro Farina',
    quando: '02/11/2026 · 14:20',
    oQueMudou: 'Limite autônomo alterado de 2 para 3 parcelas',
    antes: 'Até 2 parcelas autônomo',
    depois: 'Até 3 parcelas autônomo; até 6 aprovação',
    justificativa: '96% dos acordos em 3x eram aprovados sem edição.',
  },
];

export const CONSERVATIVE_STARTER_TEMPLATES: Record<
  string,
  {
    nome: string;
    justificativa: string;
    tipo: TipoRegra;
    quando: Condicao[];
    entao: Regra['entao'];
  }[]
> = {
  'Locação e Administração': [
    {
      nome: 'Pré-aprovação de renovação e vistoria de saída',
      justificativa: 'Modelo conservador inicial: agente prepara minutas e pede aprovação antes do envio.',
      tipo: 'autonomia',
      quando: [{ campo: 'Módulo', operador: 'igual a', valor: 'Locação e Administração' }],
      entao: { modo: 'aprovacao' },
    },
  ],
  Vendas: [
    {
      nome: 'Propostas de compra sempre com validação do gestor',
      justificativa: 'Modelo conservador inicial para negociações de compra e venda.',
      tipo: 'alcada',
      quando: [{ campo: 'Tipo de pedido', operador: 'igual a', valor: 'Proposta de compra' }],
      entao: { modo: 'aprovacao' },
    },
  ],
  'Captação e Marketing': [
    {
      nome: 'Revisar anúncios antes de publicar nos portais',
      justificativa: 'Modelo conservador: confere fotos, condomínio e IPTU antes de ativar portal.',
      tipo: 'qualidade_dados',
      quando: [{ campo: 'Ação', operador: 'igual a', valor: 'Publicação em portal' }],
      entao: { modo: 'aprovacao' },
    },
  ],
  'Manutenção e Vistorias': [
    {
      nome: 'Orçamentos de reparo exigem aprovação acima de R$ 800',
      justificativa: 'Modelo conservador inicial até definição de alçada específica do módulo.',
      tipo: 'alcada',
      quando: [{ campo: 'Valor do reparo', operador: 'maior que', valor: 800 }],
      entao: { modo: 'aprovacao' },
    },
  ],
};
