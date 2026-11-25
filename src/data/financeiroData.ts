import type { Modo, Regra } from './rulesData';

export type FinancePeriod = 'mes' | '30d' | '12m';

export type FinanceTabId =
  | 'visao-geral'
  | 'contas-receber'
  | 'inadimplencia'
  | 'repasses'
  | 'contas-pagar'
  | 'conciliacao'
  | 'definir-regras';

export type FinanceSemaphore = 'verde' | 'ambar' | 'vermelho';

export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatBRLCompact(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

// ---------------------------------------------------------------------------
// PURE POLICY ENGINE: avaliarRegra(acao, params, rules?)
// ---------------------------------------------------------------------------

export type PolicyActionType =
  | 'desconto_multa_juros'
  | 'parcelamento'
  | 'repasse'
  | 'pagamento_fornecedor'
  | 'conciliacao'
  | 'regua_cobranca'
  | 'preparar_renovacao'
  | 'enviar_minuta'
  | 'rescisao'
  | 'alerta_garantia'
  | 'troca_garantia'
  | 'documento'
  | 'notificacao_extrajudicial'
  | 'acao_despejo'
  | 'montar_dossie'
  | 'reajuste_anual'
  | 'ajustar_preco'
  | 'publicar_anuncio'
  | 'atender_lead'
  | 'agendar_visita'
  | 'analise_cadastral'
  | 'captar_imovel'
  | 'meta_vacancia'
  | 'relatorio_proprietario'
  | 'concessao_negociacao'
  | 'destravar_imovel'
  | 'classificar_chamado'
  | 'atribuir_responsabilidade'
  | 'orcamento'
  | 'laudo'
  | 'pronto_para_alugar'
  | 'vistoria_periodica'
  | 'reembolso_inquilino';

export interface PolicyEvalParams {
  percentualDesconto?: number;
  acaoJudicial?: boolean;
  parcelas?: number;
  valor?: number;
  conciliado?: boolean;
  diferenca?: number;
  diasAtraso?: number;
  foraJanelaHorario?: boolean;
  pagadorTerceiroSemCpf?: boolean;
  // Contratos e Jurídico params
  diasParaVencimento?: number;
  dataInicioPrevista?: string;
  clausulaAlterada?: boolean;
  modeloAprovado?: boolean;
  diasParaVencimentoGarantia?: number;
  confiancaExtracao?: number;
  documentoFaltando?: boolean;
  // Locação e Administração params
  variacaoPct?: number;
  semAutorizacaoProprietario?: boolean;
  apenasSugerirPreco?: boolean;
  fotosCount?: number;
  camposAnuncioCompletos?: boolean;
  autorizacaoDivulgacao?: boolean;
  imovelPronto?: boolean;
  imovelOcupado?: boolean;
  aviso24hRegistrado?: boolean;
  consentimentoInquilino?: boolean;
  consentimentoBureau?: boolean;
  comprometimentoRendaPct?: number;
  taxaAdmPct?: number;
  diasVago?: number;
  visitas30d?: number;
  reparoValor?: number;
  carenciaMeses?: number;
  // Manutenção e Vistorias params
  emergencia?: boolean;
  imovelIdentificado?: boolean;
  aceiteVisitaInquilino?: boolean;
  fornecedorHomologado?: boolean;
  qtdOrcamentos?: number;
  autorizacaoProprietario?: boolean;
  cobrancaInquilino?: boolean;
  contestacaoInquilino?: boolean;
  tipoVistoria?: 'Entrada' | 'Saída' | 'Periódica';
  laudoAssinado?: boolean;
  checklistPronto?: boolean;
  diasPreparacao?: number;
}

export interface PolicyGateResult {
  nome: string;
  status: 'ok' | 'falha' | 'pendente';
  detalhe: string;
  quemDestrava?: string;
}

export interface PolicyEvaluationResult {
  modo: Modo;
  regraId: string;
  versao: number;
  aprovador?: string;
  prazoHoras?: number;
  motivo: string;
  conflitoJuridico?: string;
  lacunaRegra?: boolean;
  resultadoTexto: string;
  portoes?: PolicyGateResult[];
}

export function getPolicyOutcomeLabel(res: PolicyEvaluationResult): string {
  if (res.modo === 'autonomo') return 'Em execução';
  if (res.modo === 'aprovacao') {
    const quem = res.aprovador ?? 'Gestor';
    const prazo = res.prazoHoras ? `${res.prazoHoras}h` : 'prazo padrão';
    return `Aguardando aprovação de ${quem} em ${prazo}`;
  }
  if (res.modo === 'sugerir') {
    return 'Sugestão registrada: decisão humana';
  }
  return 'Bloqueado e escalado';
}

export function avaliarRegra(
  acao: PolicyActionType,
  params: PolicyEvalParams,
  rules: Regra[] = []
): PolicyEvaluationResult {
  const findRule = (id: string) => rules.find((r) => r.id === id);

  if (acao === 'desconto_multa_juros') {
    const fin014 = findRule('FIN-014');
    const jur007 = findRule('JUR-007');
    const finVer = fin014?.versao ?? 3;
    const jurVer = jur007?.versao ?? 2;
    const pct = Number(params.percentualDesconto ?? 0);

    if (params.acaoJudicial) {
      const res: PolicyEvaluationResult = {
        modo: 'aprovacao',
        regraId: 'JUR-007',
        versao: jurVer,
        aprovador: 'Jurídico',
        prazoHoras: jur007?.prazoAprovacaoHoras ?? 6,
        conflitoJuridico: `Conflito FIN-014 v${finVer} × JUR-007 v${jurVer}: contrato possui ação judicial ativa; prevalece a regra mais restritiva (aprovação obrigatória do Jurídico).`,
        motivo: `Contrato judicializado: desconto de ${pct}% bloqueado para autonomia pela exceção da FIN-014 e exigência da JUR-007.`,
        resultadoTexto: '',
      };
      res.resultadoTexto = getPolicyOutcomeLabel(res);
      return res;
    }

    if (pct <= 10) {
      const res: PolicyEvaluationResult = {
        modo: 'autonomo',
        regraId: 'FIN-014',
        versao: finVer,
        motivo: `Desconto de ${pct}% sobre multa e juros está dentro da faixa autônoma (≤ 10%).`,
        resultadoTexto: '',
      };
      res.resultadoTexto = getPolicyOutcomeLabel(res);
      return res;
    }
    if (pct <= 30) {
      const res: PolicyEvaluationResult = {
        modo: 'aprovacao',
        regraId: 'FIN-014',
        versao: finVer,
        aprovador: 'Gestor',
        prazoHoras: fin014?.prazoAprovacaoHoras ?? 4,
        motivo: `Desconto de ${pct}% (faixa de 10% a 30%) exige aprovação do Gestor em até 4h.`,
        resultadoTexto: '',
      };
      res.resultadoTexto = getPolicyOutcomeLabel(res);
      return res;
    }
    const res: PolicyEvaluationResult = {
      modo: 'bloqueado',
      regraId: 'FIN-014',
      versao: finVer,
      aprovador: 'Gestor / Diretoria',
      motivo: `Desconto de ${pct}% ultrapassa o teto de 30% e é bloqueado automaticamente pela FIN-014.`,
      resultadoTexto: '',
    };
    res.resultadoTexto = getPolicyOutcomeLabel(res);
    return res;
  }

  if (acao === 'parcelamento') {
    const fin009 = findRule('FIN-009');
    const ver = fin009?.versao ?? 2;
    const parcelas = Number(params.parcelas ?? 1);

    if (params.acaoJudicial) {
      const res: PolicyEvaluationResult = {
        modo: 'aprovacao',
        regraId: 'JUR-007',
        versao: findRule('JUR-007')?.versao ?? 2,
        aprovador: 'Jurídico',
        prazoHoras: 6,
        conflitoJuridico: `Conflito FIN-009 v${ver} × JUR-007: ação judicial em curso exige validação do Jurídico mesmo em parcelamento curto.`,
        motivo: `Parcelamento em ${parcelas}x para contrato judicializado requer aprovação do Jurídico.`,
        resultadoTexto: '',
      };
      res.resultadoTexto = getPolicyOutcomeLabel(res);
      return res;
    }

    if (parcelas <= 3) {
      const res: PolicyEvaluationResult = {
        modo: 'autonomo',
        regraId: 'FIN-009',
        versao: ver,
        motivo: `Parcelamento em ${parcelas}x está dentro da autonomia (≤ 3 parcelas).`,
        resultadoTexto: '',
      };
      res.resultadoTexto = getPolicyOutcomeLabel(res);
      return res;
    }
    if (parcelas <= 6) {
      const res: PolicyEvaluationResult = {
        modo: 'aprovacao',
        regraId: 'FIN-009',
        versao: ver,
        aprovador: 'Financeiro',
        prazoHoras: fin009?.prazoAprovacaoHoras ?? 8,
        motivo: `Parcelamento em ${parcelas}x (4 a 6 parcelas) exige aprovação do Financeiro em até 8h.`,
        resultadoTexto: '',
      };
      res.resultadoTexto = getPolicyOutcomeLabel(res);
      return res;
    }
    const res: PolicyEvaluationResult = {
      modo: 'bloqueado',
      regraId: 'FIN-009',
      versao: ver,
      aprovador: 'Financeiro',
      motivo: `Parcelamento em ${parcelas}x (> 6 parcelas) é bloqueado e escalado pela regra FIN-009.`,
      resultadoTexto: '',
    };
    res.resultadoTexto = getPolicyOutcomeLabel(res);
    return res;
  }

  if (acao === 'repasse') {
    const fin003 = findRule('FIN-003');
    const ver = fin003?.versao ?? 1;
    const valor = Number(params.valor ?? 0);
    const conciliado = params.conciliado !== false;

    if (!conciliado) {
      const res: PolicyEvaluationResult = {
        modo: 'bloqueado',
        regraId: 'FIN-003',
        versao: ver,
        aprovador: 'Financeiro',
        motivo: `Repasse de ${formatBRL(valor)} bloqueado: o pagamento do inquilino ainda não foi conciliado no extrato bancário.`,
        resultadoTexto: '',
      };
      res.resultadoTexto = getPolicyOutcomeLabel(res);
      return res;
    }

    if (valor > 20000) {
      const res: PolicyEvaluationResult = {
        modo: 'aprovacao',
        regraId: 'FIN-003',
        versao: ver,
        aprovador: 'Gestor',
        prazoHoras: fin003?.prazoAprovacaoHoras ?? 2,
        motivo: `Repasse conciliado de ${formatBRL(valor)} supera R$ 20.000,00 e exige aprovação do Gestor em até 2h.`,
        resultadoTexto: '',
      };
      res.resultadoTexto = getPolicyOutcomeLabel(res);
      return res;
    }

    const res: PolicyEvaluationResult = {
      modo: 'autonomo',
      regraId: 'FIN-003',
      versao: ver,
      motivo: `Repasse de ${formatBRL(valor)} está conciliado e dentro da alçada autônoma (≤ R$ 20.000,00).`,
      resultadoTexto: '',
    };
    res.resultadoTexto = getPolicyOutcomeLabel(res);
    return res;
  }

  if (acao === 'pagamento_fornecedor') {
    const fin011 = findRule('FIN-011');
    const ver = fin011?.versao ?? 2;
    const valor = Number(params.valor ?? 0);

    if (valor <= 1500) {
      const res: PolicyEvaluationResult = {
        modo: 'autonomo',
        regraId: 'FIN-011',
        versao: ver,
        motivo: `Pagamento a fornecedor de ${formatBRL(valor)} está dentro da alçada autônoma (≤ R$ 1.500,00).`,
        resultadoTexto: '',
      };
      res.resultadoTexto = getPolicyOutcomeLabel(res);
      return res;
    }

    const res: PolicyEvaluationResult = {
      modo: 'aprovacao',
      regraId: 'FIN-011',
      versao: ver,
      aprovador: 'Gestor',
      prazoHoras: fin011?.prazoAprovacaoHoras ?? 4,
      motivo: `Pagamento de ${formatBRL(valor)} excede R$ 1.500,00 e requer aprovação do Gestor em até 4h.`,
      resultadoTexto: '',
    };
    res.resultadoTexto = getPolicyOutcomeLabel(res);
    return res;
  }

  if (acao === 'conciliacao') {
    const fin017 = findRule('FIN-017');
    const ver = fin017?.versao ?? 1;
    const diff = Math.abs(Number(params.diferenca ?? 0));
    const isActive = fin017?.status === 'ativa';

    if (!isActive) {
      const res: PolicyEvaluationResult = {
        modo: 'aprovacao',
        regraId: 'FIN-017',
        versao: ver,
        aprovador: 'Financeiro',
        prazoHoras: 12,
        motivo: `Regra FIN-017 em ${fin017?.status === 'pausada' ? 'pausa' : 'rascunho'}: tolerância de R$ 0,50 ainda não vale. Diferença de ${formatBRL(diff)} enviada para revisão humana.`,
        resultadoTexto: '',
      };
      res.resultadoTexto = getPolicyOutcomeLabel(res);
      return res;
    }

    if (params.pagadorTerceiroSemCpf) {
      const res: PolicyEvaluationResult = {
        modo: 'aprovacao',
        regraId: 'FIN-017',
        versao: ver,
        aprovador: 'Financeiro',
        prazoHoras: 4,
        motivo: 'Exceção da FIN-017 ativa: pagador terceiro sem CPF exige conferência humana.',
        resultadoTexto: '',
      };
      res.resultadoTexto = getPolicyOutcomeLabel(res);
      return res;
    }

    if (diff <= 0.5) {
      const res: PolicyEvaluationResult = {
        modo: 'autonomo',
        regraId: 'FIN-017',
        versao: ver,
        motivo: `Regra FIN-017 ativa: diferença de ${formatBRL(diff)} está dentro da tolerância automática (≤ R$ 0,50).`,
        resultadoTexto: '',
      };
      res.resultadoTexto = getPolicyOutcomeLabel(res);
      return res;
    }

    const res: PolicyEvaluationResult = {
      modo: 'aprovacao',
      regraId: 'FIN-017',
      versao: ver,
      aprovador: 'Financeiro',
      prazoHoras: 8,
      motivo: `Diferença de ${formatBRL(diff)} supera a tolerância de R$ 0,50 e requer conferência do Financeiro.`,
      resultadoTexto: '',
    };
    res.resultadoTexto = getPolicyOutcomeLabel(res);
    return res;
  }

  if (acao === 'preparar_renovacao') {
    const jur002 = findRule('JUR-002');
    const ver = jur002?.versao ?? 4;
    const dias = Number(params.diasParaVencimento ?? 30);

    if (dias <= 90) {
      const res: PolicyEvaluationResult = {
        modo: 'autonomo',
        regraId: 'JUR-002',
        versao: ver,
        motivo: `Faltam ${dias} dias para o vencimento (≤ 90 dias): o agente levanta os dados, calcula o reajuste e gera a minuta em rascunho de forma autônoma.`,
        resultadoTexto: '',
      };
      res.resultadoTexto = getPolicyOutcomeLabel(res);
      return res;
    }

    const prevista = params.dataInicioPrevista ?? 'data D-90';
    const res: PolicyEvaluationResult = {
      modo: 'sugerir',
      regraId: 'JUR-002',
      versao: ver,
      aprovador: 'Gestor',
      motivo: `Ainda faltam ${dias} dias para o vencimento (> 90 dias pela JUR-002 v${ver}). Início previsto em ${prevista}.`,
      resultadoTexto: `Início previsto em ${prevista}`,
    };
    return res;
  }

  if (acao === 'enviar_minuta') {
    const jur002 = findRule('JUR-002');
    const jur005 = findRule('JUR-005');
    const ver2 = jur002?.versao ?? 4;
    const ver5 = jur005?.versao ?? 2;

    if (params.modeloAprovado === false) {
      const res: PolicyEvaluationResult = {
        modo: 'bloqueado',
        regraId: 'JUR-005',
        versao: ver5,
        aprovador: 'Jurídico',
        motivo: `Modelo utilizado não está homologado. Envio bloqueado e escalado ao Jurídico pela regra JUR-005 v${ver5}.`,
        resultadoTexto: '',
      };
      res.resultadoTexto = getPolicyOutcomeLabel(res);
      return res;
    }

    if (params.clausulaAlterada) {
      const res: PolicyEvaluationResult = {
        modo: 'aprovacao',
        regraId: 'JUR-005',
        versao: ver5,
        aprovador: 'Jurídico',
        prazoHoras: jur005?.prazoAprovacaoHoras ?? 24,
        conflitoJuridico: `Cláusula alterada exige aprovação do Jurídico em 24h (JUR-005 v${ver5}). Renovação padrão exige Gestor em 8h (JUR-002 v${ver2}). Prevalece a regra mais restritiva (Jurídico, 24h).`,
        motivo: `Há alteração de cláusula frente ao modelo aprovado: aprovação obrigatória do Jurídico em até 24h.`,
        resultadoTexto: '',
      };
      res.resultadoTexto = getPolicyOutcomeLabel(res);
      return res;
    }

    const res: PolicyEvaluationResult = {
      modo: 'aprovacao',
      regraId: 'JUR-002',
      versao: ver2,
      aprovador: 'Gestor',
      prazoHoras: jur002?.prazoAprovacaoHoras ?? 8,
      motivo: `Modelo homologado sem alteração de cláusulas: envio ao cliente depende apenas de aprovação do Gestor em até 8h (JUR-002 v${ver2}).`,
      resultadoTexto: '',
    };
    res.resultadoTexto = getPolicyOutcomeLabel(res);
    return res;
  }

  if (acao === 'rescisao') {
    const jur007 = findRule('JUR-007');
    const fin014 = findRule('FIN-014');
    const ver = jur007?.versao ?? 1;
    const res: PolicyEvaluationResult = {
      modo: 'aprovacao',
      regraId: 'JUR-007',
      versao: ver,
      aprovador: 'Jurídico',
      prazoHoras: jur007?.prazoAprovacaoHoras ?? 24,
      conflitoJuridico: params.acaoJudicial
        ? `Conflito JUR-007 v${ver} × FIN-014 v${fin014?.versao ?? 3}: contrato possui ação judicial ativa; vale a regra mais restritiva (aprovação do Jurídico em 24h).`
        : undefined,
      motivo: `Rescisão de contrato exige conferência de multa, vistoria e aprovação do Jurídico em até 24h (JUR-007 v${ver}).`,
      resultadoTexto: '',
    };
    res.resultadoTexto = getPolicyOutcomeLabel(res);
    return res;
  }

  if (acao === 'alerta_garantia') {
    const jur010 = findRule('JUR-010');
    const ver = jur010?.versao ?? 2;
    const dias = Number(params.diasParaVencimentoGarantia ?? 45);
    if (dias <= 60) {
      const res: PolicyEvaluationResult = {
        modo: 'autonomo',
        regraId: 'JUR-010',
        versao: ver,
        motivo: `Garantia vence em ${dias} dias (≤ 60 dias): agente alerta e solicita renovação da apólice/título ao locatário de forma autônoma.`,
        resultadoTexto: '',
      };
      res.resultadoTexto = getPolicyOutcomeLabel(res);
      return res;
    }
    const res: PolicyEvaluationResult = {
      modo: 'sugerir',
      regraId: 'JUR-010',
      versao: ver,
      aprovador: 'Jurídico',
      motivo: `Garantia ainda a ${dias} dias do vencimento; disparo automático ocorrerá em D-60 pela JUR-010 v${ver}.`,
      resultadoTexto: 'Programado para D-60',
    };
    return res;
  }

  if (acao === 'troca_garantia') {
    const jur010 = findRule('JUR-010');
    const ver = jur010?.versao ?? 2;
    const res: PolicyEvaluationResult = {
      modo: 'aprovacao',
      regraId: 'JUR-010',
      versao: ver,
      aprovador: 'Jurídico',
      prazoHoras: jur010?.prazoAprovacaoHoras ?? 24,
      motivo: `Substituição de modalidade de garantia exige análise documental e aprovação do Jurídico em até 24h (JUR-010 v${ver}).`,
      resultadoTexto: '',
    };
    res.resultadoTexto = getPolicyOutcomeLabel(res);
    return res;
  }

  if (acao === 'documento') {
    const jur013 = findRule('JUR-013');
    const ver = jur013?.versao ?? 3;
    const conf = Number(params.confiancaExtracao ?? 94);

    if (params.documentoFaltando) {
      const res: PolicyEvaluationResult = {
        modo: 'autonomo',
        regraId: 'JUR-013',
        versao: ver,
        motivo: `Documento obrigatório ausente: o agente solicita o envio ao cliente automaticamente e mantém a emissão do contrato bloqueada até completar (JUR-013 v${ver}).`,
        resultadoTexto: 'Em execução · emissão bloqueada até completar documentos',
      };
      return res;
    }

    if (conf < 85) {
      const res: PolicyEvaluationResult = {
        modo: 'aprovacao',
        regraId: 'JUR-013',
        versao: ver,
        aprovador: 'Jurídico',
        prazoHoras: jur013?.prazoAprovacaoHoras ?? 8,
        motivo: `Confiança de extração (${conf}%) abaixo do mínimo de 85%: enviado para triagem humana pela regra JUR-013 v${ver}.`,
        resultadoTexto: '',
      };
      res.resultadoTexto = getPolicyOutcomeLabel(res);
      return res;
    }

    const res: PolicyEvaluationResult = {
      modo: 'autonomo',
      regraId: 'JUR-013',
      versao: ver,
      motivo: `Extração com ${conf}% de confiança (≥ 85%) e checklist obrigatório completo pela JUR-013 v${ver}.`,
      resultadoTexto: '',
    };
    res.resultadoTexto = getPolicyOutcomeLabel(res);
    return res;
  }

  if (acao === 'notificacao_extrajudicial' || acao === 'acao_despejo') {
    const jur001 = findRule('JUR-001');
    const ver = jur001?.versao ?? 1;
    const res: PolicyEvaluationResult = {
      modo: 'bloqueado',
      regraId: 'JUR-001',
      versao: ver,
      aprovador: 'Advogado externo / Jurídico',
      motivo:
        'Barreira travada JUR-001 v1: o agente não envia notificação extrajudicial nem ajuíza ação de despejo. O agente monta o dossiê e escala para o advogado externo agir.',
      resultadoTexto: 'Bloqueado e escalado',
    };
    return res;
  }

  if (acao === 'montar_dossie') {
    const jur001 = findRule('JUR-001');
    const ver = jur001?.versao ?? 1;
    const res: PolicyEvaluationResult = {
      modo: 'autonomo',
      regraId: 'JUR-001',
      versao: ver,
      motivo:
        'Montagem do dossiê (contrato, parcelas, comunicações, garantia e documentos) executada de forma autônoma para entrega ao advogado externo (JUR-001 v1).',
      resultadoTexto: '',
    };
    res.resultadoTexto = getPolicyOutcomeLabel(res);
    return res;
  }

  if (acao === 'reajuste_anual') {
    const activeReajusteRule = rules.find(
      (r) =>
        r.status === 'ativa' &&
        (r.nome.toLowerCase().includes('reajuste') ||
          r.quando.some((c) => String(c.valor).toLowerCase().includes('reajuste')))
    );

    if (activeReajusteRule) {
      const res: PolicyEvaluationResult = {
        modo: activeReajusteRule.entao.modo,
        regraId: activeReajusteRule.id,
        versao: activeReajusteRule.versao,
        aprovador: activeReajusteRule.aprovador ?? 'Gestor',
        prazoHoras: activeReajusteRule.prazoAprovacaoHoras ?? 8,
        motivo: `Regra ativa ${activeReajusteRule.id} v${activeReajusteRule.versao} aplicada ao cálculo de reajuste anual.`,
        resultadoTexto: '',
      };
      res.resultadoTexto = getPolicyOutcomeLabel(res);
      return res;
    }

    const res: PolicyEvaluationResult = {
      modo: 'sugerir',
      regraId: 'SEM-REGRA',
      versao: 0,
      aprovador: 'Gestor',
      lacunaRegra: true,
      motivo:
        'Lacuna de regra: não há regra ativa para reajustes anuais no módulo. Modo padrão "só sugerir" ativo — o agente calcula a atualização para conferência humana.',
      resultadoTexto: 'Sugestão registrada: decisão humana',
    };
    return res;
  }

  if (acao === 'ajustar_preco') {
    const loc001 = findRule('LOC-001');
    const ver = loc001?.versao ?? 2;
    const pct = Math.abs(Number(params.variacaoPct ?? 0));

    if (params.apenasSugerirPreco) {
      const res: PolicyEvaluationResult = {
        modo: 'autonomo',
        regraId: 'LOC-001',
        versao: ver,
        motivo: `Sugerir ajuste de preço com base em comparáveis é sempre autônomo pela LOC-001 v${ver} (sem alterar valor publicado).`,
        resultadoTexto: '',
      };
      res.resultadoTexto = getPolicyOutcomeLabel(res);
      return res;
    }

    if (params.semAutorizacaoProprietario) {
      const res: PolicyEvaluationResult = {
        modo: 'bloqueado',
        regraId: 'LOC-001',
        versao: ver,
        aprovador: 'Proprietário / Gestor',
        motivo: `Alteração de preço sem autorização registrada do proprietário é bloqueada pela LOC-001 v${ver}. O agente solicita a autorização ao proprietário de forma autônoma.`,
        resultadoTexto: 'Bloqueado até autorização do proprietário',
      };
      return res;
    }

    if (pct <= 5) {
      const res: PolicyEvaluationResult = {
        modo: 'autonomo',
        regraId: 'LOC-001',
        versao: ver,
        motivo: `Variação de ${pct.toFixed(1).replace('.', ',')}% com autorização do proprietário está na faixa autônoma (≤ 5%) pela LOC-001 v${ver}.`,
        resultadoTexto: '',
      };
      res.resultadoTexto = getPolicyOutcomeLabel(res);
      return res;
    }

    if (pct <= 15) {
      const res: PolicyEvaluationResult = {
        modo: 'aprovacao',
        regraId: 'LOC-001',
        versao: ver,
        aprovador: 'Gestor',
        prazoHoras: loc001?.prazoAprovacaoHoras ?? 4,
        motivo: `Variação de ${pct.toFixed(1).replace('.', ',')}% (entre 5% e 15%) com autorização do proprietário exige aprovação do Gestor em até 4h (LOC-001 v${ver}).`,
        resultadoTexto: '',
      };
      res.resultadoTexto = getPolicyOutcomeLabel(res);
      return res;
    }

    const res: PolicyEvaluationResult = {
      modo: 'bloqueado',
      regraId: 'LOC-001',
      versao: ver,
      aprovador: 'Gestor / Diretoria',
      motivo: `Variação de ${pct.toFixed(1).replace('.', ',')}% supera 15% e é bloqueada e escalada automaticamente pela LOC-001 v${ver}.`,
      resultadoTexto: '',
    };
    res.resultadoTexto = getPolicyOutcomeLabel(res);
    return res;
  }

  if (acao === 'publicar_anuncio') {
    const loc002 = findRule('LOC-002');
    const ver = loc002?.versao ?? 3;
    const fotos = Number(params.fotosCount ?? 10);
    const missing: string[] = [];
    if (fotos < 8) missing.push(`mínimo 8 fotos (atual: ${fotos})`);
    if (params.camposAnuncioCompletos === false) missing.push('metragem/valor/título completo');
    if (params.autorizacaoDivulgacao === false) missing.push('autorização de divulgação');
    if (params.imovelPronto === false) missing.push('imóvel pronto (vistoria de saída ou reparo aberto)');

    if (missing.length > 0) {
      const res: PolicyEvaluationResult = {
        modo: 'bloqueado',
        regraId: 'LOC-002',
        versao: ver,
        aprovador: 'Gestor / Proprietário',
        motivo: `Publicação bloqueada pela LOC-002 v${ver}. Pendências: ${missing.join('; ')}. O agente já solicita os itens faltantes de forma autônoma.`,
        resultadoTexto: 'Bloqueado · agente solicitando pendências',
      };
      return res;
    }

    const res: PolicyEvaluationResult = {
      modo: 'autonomo',
      regraId: 'LOC-002',
      versao: ver,
      motivo: `Checklist completo (${fotos} fotos, campos obrigatórios, autorização e imóvel pronto): publicação nos portais autorizada pela LOC-002 v${ver}.`,
      resultadoTexto: '',
    };
    res.resultadoTexto = getPolicyOutcomeLabel(res);
    return res;
  }

  if (acao === 'atender_lead' || acao === 'agendar_visita') {
    const loc003 = findRule('LOC-003');
    const ver = loc003?.versao ?? 2;

    if (
      params.imovelOcupado &&
      (!params.aviso24hRegistrado || !params.consentimentoInquilino)
    ) {
      const res: PolicyEvaluationResult = {
        modo: 'bloqueado',
        regraId: 'LOC-003',
        versao: ver,
        aprovador: 'Corretor / Inquilino',
        motivo: `Visita em imóvel ocupado bloqueada pela LOC-003 v${ver}: exige aviso com 24h de antecedência e consentimento registrado do inquilino atual.`,
        resultadoTexto: 'Bloqueado · falta aviso 24h / consentimento do inquilino',
      };
      return res;
    }

    if (params.foraJanelaHorario) {
      const res: PolicyEvaluationResult = {
        modo: 'autonomo',
        regraId: 'LOC-003',
        versao: ver,
        motivo: `Fora da janela 8h–19h: o agente confirma recebimento em até 5 min e programa resposta completa às 08:00 (LOC-003 v${ver}).`,
        resultadoTexto: '',
      };
      res.resultadoTexto = getPolicyOutcomeLabel(res);
      return res;
    }

    const res: PolicyEvaluationResult = {
      modo: 'autonomo',
      regraId: 'LOC-003',
      versao: ver,
      motivo:
        acao === 'atender_lead'
          ? `1ª resposta em até 5 min dentro da janela 8h–19h pela LOC-003 v${ver}.`
          : `Visita confirmada de forma autônoma respeitando janela e aviso contratual (LOC-003 v${ver}).`,
      resultadoTexto: '',
    };
    res.resultadoTexto = getPolicyOutcomeLabel(res);
    return res;
  }

  if (acao === 'analise_cadastral') {
    const loc004 = findRule('LOC-004');
    const jur013 = findRule('JUR-013');
    const ver4 = loc004?.versao ?? 1;
    const ver13 = jur013?.versao ?? 3;

    if (params.consentimentoBureau === false) {
      const res: PolicyEvaluationResult = {
        modo: 'bloqueado',
        regraId: 'LOC-004',
        versao: ver4,
        aprovador: 'Corretor / Candidato',
        motivo: `Consulta de crédito bloqueada pela LOC-004 v${ver4}: falta consentimento LGPD/base legal registrada do candidato.`,
        resultadoTexto: 'Bloqueado · sem consentimento LGPD para bureau',
      };
      return res;
    }

    if (params.documentoFaltando) {
      const res: PolicyEvaluationResult = {
        modo: 'autonomo',
        regraId: 'JUR-013',
        versao: ver13,
        motivo: `Documentos obrigatórios faltando: o agente solicita ao candidato automaticamente (JUR-013 v${ver13}) e bloqueia emissão até completar (LOC-004 v${ver4}).`,
        resultadoTexto: 'Em execução · emissão bloqueada até completar docs',
      };
      return res;
    }

    const comp = Number(params.comprometimentoRendaPct ?? 28);
    const faixaTexto =
      comp <= 30
        ? 'recomendar (≤ 30%)'
        : comp <= 35
        ? 'recomendar com ressalva (> 30% a 35%)'
        : 'recomendar garantia reforçada (> 35%)';

    const res: PolicyEvaluationResult = {
      modo: 'aprovacao',
      regraId: 'LOC-004',
      versao: ver4,
      aprovador: 'Gestor',
      prazoHoras: loc004?.prazoAprovacaoHoras ?? 8,
      motivo: `Comprometimento de renda em ${comp.toFixed(1).replace('.', ',')}% → parecer "${faixaTexto}". Decisão final sempre humana (Gestor em 8h · LOC-004 v${ver4}). O agente nunca reprova sozinho.`,
      resultadoTexto: '',
    };
    res.resultadoTexto = getPolicyOutcomeLabel(res);
    return res;
  }

  if (acao === 'captar_imovel') {
    const loc005 = findRule('LOC-005');
    const jur005 = findRule('JUR-005');
    const jur013 = findRule('JUR-013');
    const verLoc5 = loc005?.versao ?? 2;
    const verJur5 = jur005?.versao ?? 2;
    const verJur13 = jur013?.versao ?? 3;
    const conf = Number(params.confiancaExtracao ?? 92);
    const taxa = Number(params.taxaAdmPct ?? 9);

    if (conf < 85) {
      const res: PolicyEvaluationResult = {
        modo: 'aprovacao',
        regraId: 'JUR-013',
        versao: verJur13,
        aprovador: 'Gestor / Jurídico',
        prazoHoras: jur013?.prazoAprovacaoHoras ?? 8,
        motivo: `Confiança da extração (${conf}%) abaixo de 85%: enviado para triagem humana pela JUR-013 v${verJur13} antes do cadastro pela LOC-005 v${verLoc5}.`,
        resultadoTexto: '',
      };
      res.resultadoTexto = getPolicyOutcomeLabel(res);
      return res;
    }

    if (params.clausulaAlterada) {
      const res: PolicyEvaluationResult = {
        modo: 'aprovacao',
        regraId: 'JUR-005',
        versao: verJur5,
        aprovador: 'Jurídico',
        prazoHoras: jur005?.prazoAprovacaoHoras ?? 24,
        conflitoJuridico: `Minuta Administração v5 com cláusula alterada: prevalece JUR-005 v${verJur5} (aprovação do Jurídico em 24h) sobre LOC-005 v${verLoc5} (Gestor 8h).`,
        motivo: `Alteração de cláusula na minuta de administração exige parecer do Jurídico em até 24h.`,
        resultadoTexto: '',
      };
      res.resultadoTexto = getPolicyOutcomeLabel(res);
      return res;
    }

    if (taxa < 7) {
      const res: PolicyEvaluationResult = {
        modo: 'bloqueado',
        regraId: 'LOC-005',
        versao: verLoc5,
        aprovador: 'Diretoria / Gestor',
        motivo: `Taxa de administração de ${taxa}% abaixo do piso de 7% é bloqueada pela LOC-005 v${verLoc5}.`,
        resultadoTexto: '',
      };
      res.resultadoTexto = getPolicyOutcomeLabel(res);
      return res;
    }

    if (taxa < 9) {
      const res: PolicyEvaluationResult = {
        modo: 'aprovacao',
        regraId: 'LOC-005',
        versao: verLoc5,
        aprovador: 'Gestor',
        prazoHoras: loc005?.prazoAprovacaoHoras ?? 8,
        motivo: `Taxa de administração de ${taxa}% (faixa 7% a < 9%) na minuta Administração v5 exige aprovação do Gestor em 8h (LOC-005 v${verLoc5}).`,
        resultadoTexto: '',
      };
      res.resultadoTexto = getPolicyOutcomeLabel(res);
      return res;
    }

    const res: PolicyEvaluationResult = {
      modo: 'autonomo',
      regraId: 'LOC-005',
      versao: verLoc5,
      motivo: `Taxa padrão de ${taxa}% (≥ 9%), extração ${conf}% (≥ 85%) e minuta Administração v5 sem alteração: cadastro e fluxo executados em modo autônomo (LOC-005 v${verLoc5}).`,
      resultadoTexto: '',
    };
    res.resultadoTexto = getPolicyOutcomeLabel(res);
    return res;
  }

  if (acao === 'meta_vacancia') {
    const loc006 = findRule('LOC-006');
    const ver = loc006?.versao ?? 2;
    const dias = Number(params.diasVago ?? 30);
    const visitas = Number(params.visitas30d ?? 0);

    if (dias >= 45 || visitas === 0) {
      const res: PolicyEvaluationResult = {
        modo: 'autonomo',
        regraId: 'LOC-006',
        versao: ver,
        motivo: `Imóvel com ${dias} dias vago e ${visitas} visita(s) em 30d: pela LOC-006 v${ver}, o agente gera alerta e sugere ajuste de preço (submetido à LOC-001).`,
        resultadoTexto: '',
      };
      res.resultadoTexto = getPolicyOutcomeLabel(res);
      return res;
    }

    const res: PolicyEvaluationResult = {
      modo: 'autonomo',
      regraId: 'LOC-006',
      versao: ver,
      motivo: `Imóvel vago há ${dias} dias (≥ 30d): alerta automático enviado ao gestor pela LOC-006 v${ver}.`,
      resultadoTexto: '',
    };
    res.resultadoTexto = getPolicyOutcomeLabel(res);
    return res;
  }

  if (acao === 'relatorio_proprietario') {
    const loc007 = findRule('LOC-007');
    const ver = loc007?.versao ?? 1;
    const isActive = loc007?.status === 'ativa';

    if (!isActive) {
      const res: PolicyEvaluationResult = {
        modo: 'sugerir',
        regraId: 'LOC-007',
        versao: ver,
        aprovador: 'Gestor',
        motivo: `Regra LOC-007 v${ver} em ${loc007?.status === 'pausada' ? 'pausa' : 'rascunho'}: o agente ainda não envia o relatório mensal ao proprietário automaticamente (prepara apenas sugestão para decisão humana).`,
        resultadoTexto: 'Sugestão registrada: decisão humana',
      };
      return res;
    }

    const res: PolicyEvaluationResult = {
      modo: 'autonomo',
      regraId: 'LOC-007',
      versao: ver,
      motivo: `Regra LOC-007 v${ver} ativa: envio mensal ao proprietário liberado para o dia 05.`,
      resultadoTexto: '',
    };
    res.resultadoTexto = getPolicyOutcomeLabel(res);
    return res;
  }

  if (acao === 'concessao_negociacao') {
    const activeConcessaoRule = rules.find(
      (r) =>
        r.status === 'ativa' &&
        (r.nome.toLowerCase().includes('concess') ||
          r.nome.toLowerCase().includes('carência') ||
          r.nome.toLowerCase().includes('carencia'))
    );

    if (activeConcessaoRule) {
      const res: PolicyEvaluationResult = {
        modo: activeConcessaoRule.entao.modo,
        regraId: activeConcessaoRule.id,
        versao: activeConcessaoRule.versao,
        aprovador: activeConcessaoRule.aprovador ?? 'Gestor',
        prazoHoras: activeConcessaoRule.prazoAprovacaoHoras ?? 4,
        motivo: `Regra ativa ${activeConcessaoRule.id} v${activeConcessaoRule.versao} aplicada à concessão na negociação.`,
        resultadoTexto: '',
      };
      res.resultadoTexto = getPolicyOutcomeLabel(res);
      return res;
    }

    const res: PolicyEvaluationResult = {
      modo: 'sugerir',
      regraId: 'SEM-REGRA',
      versao: 0,
      aprovador: 'Gestor',
      lacunaRegra: true,
      motivo:
        'Lacuna de regra: não há regra ativa para concessões na negociação (carência ou desconto no 1º aluguel). O agente nunca promete sozinho e apenas prepara sugestão para decisão humana.',
      resultadoTexto: 'Sugestão registrada: decisão humana',
    };
    return res;
  }

  if (acao === 'destravar_imovel') {
    const reparoVal = Number(params.reparoValor ?? 0);
    if (reparoVal > 0) {
      return avaliarRegra('orcamento', { valor: reparoVal, fornecedorHomologado: true, qtdOrcamentos: reparoVal > 1500 ? 2 : 1, autorizacaoProprietario: true }, rules);
    }
    const man006 = findRule('MAN-006');
    const ver6 = man006?.versao ?? 1;
    const res: PolicyEvaluationResult = {
      modo: 'autonomo',
      regraId: 'MAN-006',
      versao: ver6,
      motivo: `Destravamento operacional (cobrança de vistoria de saída, solicitação de autorização ou agendamento de vistoria final) executado pelo agente conforme regra-fonte MAN-006 v${ver6} (apontada pela LOC-002).`,
      resultadoTexto: '',
    };
    res.resultadoTexto = getPolicyOutcomeLabel(res);
    return res;
  }

  if (acao === 'classificar_chamado') {
    const man001 = findRule('MAN-001');
    const ver = man001?.versao ?? 2;
    const conf = Number(params.confiancaExtracao ?? 94);

    if (params.imovelOcupado && params.aceiteVisitaInquilino === false) {
      const res: PolicyEvaluationResult = {
        modo: 'bloqueado',
        regraId: 'MAN-001',
        versao: ver,
        aprovador: 'Inquilino / Gestor',
        motivo: `Imóvel ocupado sem aceite de visita do inquilino: pela MAN-001 v${ver}, o agente solicita agendamento e nunca autoriza entrada forçada.`,
        resultadoTexto: 'Bloqueado · aguarda aceite de visita do inquilino',
      };
      return res;
    }

    if (params.imovelIdentificado === false || conf < 80) {
      const res: PolicyEvaluationResult = {
        modo: 'aprovacao',
        regraId: 'MAN-001',
        versao: ver,
        aprovador: 'Gestor',
        prazoHoras: 4,
        motivo: `Confiança de triagem (${conf}%) abaixo de 80% ou imóvel não identificado: encaminhado para triagem humana pela MAN-001 v${ver}.`,
        resultadoTexto: '',
      };
      res.resultadoTexto = getPolicyOutcomeLabel(res);
      return res;
    }

    if (params.emergencia) {
      const res: PolicyEvaluationResult = {
        modo: 'autonomo',
        regraId: 'MAN-001',
        versao: ver,
        motivo: `Emergência detectada (gás, curto-circuito, vazamento com risco elétrico ou risco estrutural): confirmação em até 5 min, plantão 24h acionado e notificação imediata a Gestor e Proprietário (MAN-001 v${ver}).`,
        resultadoTexto: '',
      };
      res.resultadoTexto = getPolicyOutcomeLabel(res);
      return res;
    }

    const res: PolicyEvaluationResult = {
      modo: 'autonomo',
      regraId: 'MAN-001',
      versao: ver,
      motivo: `Chamado classificado com ${conf}% de confiança e SLA definido conforme urgência (MAN-001 v${ver}).`,
      resultadoTexto: '',
    };
    res.resultadoTexto = getPolicyOutcomeLabel(res);
    return res;
  }

  if (acao === 'atribuir_responsabilidade') {
    const man002 = findRule('MAN-002');
    const ver = man002?.versao ?? 3;
    const conf = Number(params.confiancaExtracao ?? 90);

    if (params.contestacaoInquilino) {
      const res: PolicyEvaluationResult = {
        modo: 'bloqueado',
        regraId: 'MAN-002',
        versao: ver,
        aprovador: 'Jurídico',
        motivo: `Inquilino contestou a responsabilidade pelo dano: cobrança bloqueada e escalada automaticamente ao Jurídico pela MAN-002 v${ver}.`,
        resultadoTexto: 'Bloqueado e escalado ao Jurídico',
      };
      return res;
    }

    if (conf < 80) {
      const res: PolicyEvaluationResult = {
        modo: 'aprovacao',
        regraId: 'MAN-002',
        versao: ver,
        aprovador: 'Gestor',
        prazoHoras: man002?.prazoAprovacaoHoras ?? 8,
        motivo: `Confiança da atribuição (${conf}%) abaixo de 80%: requer decisão humana do Gestor em até 8h (MAN-002 v${ver}).`,
        resultadoTexto: '',
      };
      res.resultadoTexto = getPolicyOutcomeLabel(res);
      return res;
    }

    if (params.cobrancaInquilino) {
      const res: PolicyEvaluationResult = {
        modo: 'aprovacao',
        regraId: 'MAN-002',
        versao: ver,
        aprovador: 'Gestor',
        prazoHoras: man002?.prazoAprovacaoHoras ?? 8,
        motivo: `Cobrança de dano ao inquilino exige validação humana do Gestor em até 8h pela MAN-002 v${ver}. Sugestão do agente. Decisão humana.`,
        resultadoTexto: '',
      };
      res.resultadoTexto = getPolicyOutcomeLabel(res);
      return res;
    }

    const res: PolicyEvaluationResult = {
      modo: 'autonomo',
      regraId: 'MAN-002',
      versao: ver,
      motivo: `Responsabilidade sugerida ao proprietário/condomínio com ${conf}% de confiança e fonte citada (MAN-002 v${ver}).`,
      resultadoTexto: '',
    };
    res.resultadoTexto = getPolicyOutcomeLabel(res);
    return res;
  }

  if (acao === 'orcamento') {
    const man003 = findRule('MAN-003');
    const man004 = findRule('MAN-004');
    const fin011 = findRule('FIN-011');
    const ver3 = man003?.versao ?? 2;
    const ver4 = man004?.versao ?? 1;
    const ver11 = fin011?.versao ?? 2;

    const valor = Number(params.valor ?? 0);
    const emergencia = Boolean(params.emergencia);
    const homologado = params.fornecedorHomologado !== false;
    const qtdOrc = Number(params.qtdOrcamentos ?? 1);
    const minOrc = emergencia
      ? 1
      : valor <= 1500
      ? 1
      : valor <= 5000
      ? 2
      : 3;
    const isentoDono = valor <= 800 || (emergencia && valor <= 1500);
    const temAuthDono = isentoDono || params.autorizacaoProprietario === true;
    const passaFin011Autonomo = valor <= 1500;

    const portoes: PolicyGateResult[] = [
      {
        nome: '1. Fornecedor homologado (MAN-003)',
        status: homologado ? 'ok' : 'falha',
        detalhe: homologado
          ? 'CNPJ ativo e certidões válidas (confiança ≥ 85%).'
          : 'Fornecedor não homologado. Agente inicia homologação documental (JUR-013 se confiança < 85%).',
        quemDestrava: homologado ? undefined : 'Agente / Jurídico',
      },
      {
        nome: '2. Mínimo de orçamentos (MAN-003)',
        status: qtdOrc >= minOrc ? 'ok' : 'pendente',
        detalhe:
          qtdOrc >= minOrc
            ? `${qtdOrc} de ${minOrc} orçamento(s) recebido(s) para faixa ${formatBRL(valor)}.`
            : `Falta(m) ${minOrc - qtdOrc} orçamento(s): faixa exige ${minOrc} (${qtdOrc}/${minOrc}). Agente solicita automaticamente.`,
        quemDestrava: qtdOrc >= minOrc ? undefined : 'Agente (novas cotações)',
      },
      {
        nome: '3. Autorização do proprietário (MAN-004)',
        status: temAuthDono ? 'ok' : 'falha',
        detalhe: isentoDono
          ? emergencia && valor > 800
            ? 'Contenção de emergência ≤ R$ 1.500: liberada com aviso imediato ao proprietário.'
            : 'Valor ≤ R$ 800: dispensa autorização prévia do proprietário.'
          : params.autorizacaoProprietario
          ? 'Autorização do proprietário registrada em canal formal.'
          : `Valor ${formatBRL(valor)} (> R$ 800) sem autorização do proprietário registrada.`,
        quemDestrava: temAuthDono ? undefined : 'Proprietário (WhatsApp / E-mail)',
      },
      {
        nome: '4. Alçada de pagamento (FIN-011)',
        status: passaFin011Autonomo ? 'ok' : 'pendente',
        detalhe: passaFin011Autonomo
          ? `Valor ${formatBRL(valor)} ≤ R$ 1.500: pagamento liberado em modo autônomo.`
          : `Valor ${formatBRL(valor)} > R$ 1.500: exige aprovação do Gestor em até 4h (conta de terceiros).`,
        quemDestrava: passaFin011Autonomo ? undefined : 'Gestor (4h)',
      },
    ];

    if (!homologado) {
      return {
        modo: 'bloqueado',
        regraId: 'MAN-003',
        versao: ver3,
        aprovador: 'Agente / Jurídico',
        motivo: `Portão 1 bloqueado pela MAN-003 v${ver3}: fornecedor não homologado. O agente já iniciou a homologação documental.`,
        resultadoTexto: 'Bloqueado · fornecedor não homologado',
        portoes,
      };
    }

    if (qtdOrc < minOrc) {
      return {
        modo: 'bloqueado',
        regraId: 'MAN-003',
        versao: ver3,
        aprovador: 'Agente / Fornecedores',
        motivo: `Portão 2 bloqueado pela MAN-003 v${ver3}: valor ${formatBRL(valor)} exige ${minOrc} orçamento(s) e há apenas ${qtdOrc}. O agente está solicitando novas cotações.`,
        resultadoTexto: `Bloqueado · faltam ${minOrc - qtdOrc} orçamento(s)`,
        portoes,
      };
    }

    if (!temAuthDono) {
      return {
        modo: 'bloqueado',
        regraId: 'MAN-004',
        versao: ver4,
        aprovador: 'Proprietário',
        motivo: `Portão 3 bloqueado pela MAN-004 v${ver4}: reparo de ${formatBRL(valor)} (> R$ 800) exige autorização registrada do proprietário antes de executar/pagar.`,
        resultadoTexto: 'Bloqueado · aguarda autorização do proprietário',
        portoes,
      };
    }

    if (!passaFin011Autonomo) {
      const res: PolicyEvaluationResult = {
        modo: 'aprovacao',
        regraId: 'FIN-011',
        versao: ver11,
        aprovador: 'Gestor',
        prazoHoras: fin011?.prazoAprovacaoHoras ?? 4,
        motivo: `Portões 1–3 cumpridos (MAN-003 v${ver3} e MAN-004 v${ver4}). Portão 4 (FIN-011 v${ver11}): orçamento de ${formatBRL(valor)} > R$ 1.500 exige aprovação do Gestor em 4h.`,
        resultadoTexto: '',
        portoes,
      };
      res.resultadoTexto = getPolicyOutcomeLabel(res);
      return res;
    }

    const res: PolicyEvaluationResult = {
      modo: 'autonomo',
      regraId: 'FIN-011',
      versao: ver11,
      motivo: `Todos os 4 portões cumpridos (MAN-003 v${ver3}, MAN-004 v${ver4} e FIN-011 v${ver11} ≤ R$ 1.500): execução e pagamento autorizados em modo autônomo.`,
      resultadoTexto: '',
      portoes,
    };
    res.resultadoTexto = getPolicyOutcomeLabel(res);
    return res;
  }

  if (acao === 'laudo') {
    const man005 = findRule('MAN-005');
    const man002 = findRule('MAN-002');
    const ver5 = man005?.versao ?? 2;
    const ver2 = man002?.versao ?? 3;
    const conf = Number(params.confiancaExtracao ?? 92);

    if (params.tipoVistoria === 'Entrada' && params.laudoAssinado === false) {
      return {
        modo: 'bloqueado',
        regraId: 'MAN-005',
        versao: ver5,
        aprovador: 'Inquilino / Gestor',
        motivo: `Entrega de chaves bloqueada pela MAN-005 v${ver5}: vistoria de entrada sem assinatura do inquilino.`,
        resultadoTexto: 'Bloqueado · falta assinatura no laudo de entrada',
      };
    }

    if (conf < 80) {
      const res: PolicyEvaluationResult = {
        modo: 'aprovacao',
        regraId: 'MAN-005',
        versao: ver5,
        aprovador: 'Gestor',
        prazoHoras: 8,
        motivo: `Item do laudo com confiança ${conf}% (< 80%): enviado para conferência humana antes da emissão pela MAN-005 v${ver5}.`,
        resultadoTexto: '',
      };
      res.resultadoTexto = getPolicyOutcomeLabel(res);
      return res;
    }

    if (params.cobrancaInquilino) {
      const res: PolicyEvaluationResult = {
        modo: 'aprovacao',
        regraId: 'MAN-002',
        versao: ver2,
        aprovador: 'Gestor',
        prazoHoras: 8,
        motivo: `Laudo de saída com cobrança de danos ao inquilino exige aprovação do Gestor em até 8h (MAN-002 v${ver2} e MAN-005 v${ver5}).`,
        resultadoTexto: '',
      };
      res.resultadoTexto = getPolicyOutcomeLabel(res);
      return res;
    }

    const res: PolicyEvaluationResult = {
      modo: 'autonomo',
      regraId: 'MAN-005',
      versao: ver5,
      motivo: `Laudo conferido sem cobrança ao inquilino (confiança ${conf}% ≥ 80%): envio às partes em modo autônomo pela MAN-005 v${ver5}.`,
      resultadoTexto: '',
    };
    res.resultadoTexto = getPolicyOutcomeLabel(res);
    return res;
  }

  if (acao === 'pronto_para_alugar') {
    const man006 = findRule('MAN-006');
    const ver = man006?.versao ?? 1;
    const dias = Number(params.diasPreparacao ?? 10);

    if (params.checklistPronto === false) {
      return {
        modo: 'bloqueado',
        regraId: 'MAN-006',
        versao: ver,
        aprovador: 'Gestor / Manutenção',
        motivo: `Imóvel não liberado para anúncio pela regra-fonte MAN-006 v${ver} (apontada pela LOC-002): há itens pendentes no checklist de prontidão${dias > 20 ? ` e ${dias} dias em preparo (> 20d)` : ''}.`,
        resultadoTexto: 'Bloqueado · checklist MAN-006 incompleto',
      };
    }

    const res: PolicyEvaluationResult = {
      modo: 'autonomo',
      regraId: 'MAN-006',
      versao: ver,
      motivo: `Checklist 100% completo na regra-fonte MAN-006 v${ver}: imóvel marcado como "Pronto e anunciável" para LOC-002.`,
      resultadoTexto: '',
    };
    res.resultadoTexto = getPolicyOutcomeLabel(res);
    return res;
  }

  if (acao === 'vistoria_periodica') {
    const man007 = findRule('MAN-007');
    const ver = man007?.versao ?? 1;
    const isActive = man007?.status === 'ativa';

    if (!isActive) {
      return {
        modo: 'sugerir',
        regraId: 'MAN-007',
        versao: ver,
        aprovador: 'Gestor',
        motivo: `Regra MAN-007 em ${man007?.status === 'pausada' ? 'pausa' : 'rascunho'}: o agente ainda não agenda vistoria periódica automaticamente.`,
        resultadoTexto: 'Sugestão registrada: aguarda ativação da MAN-007',
      };
    }

    const res: PolicyEvaluationResult = {
      modo: 'autonomo',
      regraId: 'MAN-007',
      versao: ver,
      motivo: `Regra MAN-007 v${ver} ativa: agendamento automático de vistoria periódica com aviso de 24h.`,
      resultadoTexto: '',
    };
    res.resultadoTexto = getPolicyOutcomeLabel(res);
    return res;
  }

  if (acao === 'reembolso_inquilino') {
    const activeReembolsoRule = rules.find(
      (r) =>
        r.status === 'ativa' &&
        (r.nome.toLowerCase().includes('reembolso') ||
          r.quando.some((c) => String(c.valor).toLowerCase().includes('reembolso')))
    );

    if (activeReembolsoRule) {
      const res: PolicyEvaluationResult = {
        modo: activeReembolsoRule.entao.modo,
        regraId: activeReembolsoRule.id,
        versao: activeReembolsoRule.versao,
        aprovador: activeReembolsoRule.aprovador ?? 'Gestor',
        prazoHoras: activeReembolsoRule.prazoAprovacaoHoras ?? 8,
        motivo: `Regra ativa ${activeReembolsoRule.id} v${activeReembolsoRule.versao} aplicada à solicitação de reembolso de reparo.`,
        resultadoTexto: '',
      };
      res.resultadoTexto = getPolicyOutcomeLabel(res);
      return res;
    }

    return {
      modo: 'sugerir',
      regraId: 'SEM-REGRA',
      versao: 0,
      aprovador: 'Gestor',
      lacunaRegra: true,
      motivo:
        'Lacuna de regra: não há regra cadastrada para reembolso de reparos feitos pelo inquilino. O agente apenas registra sugestão para decisão humana.',
      resultadoTexto: 'Sugestão registrada: decisão humana',
    };
  }

  // regua_cobranca (FIN-020)
  const fin020 = findRule('FIN-020');
  const ver = fin020?.versao ?? 2;
  const dias = Number(params.diasAtraso ?? 1);
  const foraJanela = Boolean(params.foraJanelaHorario);
  const janelaNote = foraJanela ? ' Fora da janela 8h–19h: próximo envio às 08:00 de amanhã.' : '';

  if (dias >= 30) {
    const res: PolicyEvaluationResult = {
      modo: 'aprovacao',
      regraId: 'FIN-020',
      versao: ver,
      aprovador: 'Jurídico',
      prazoHoras: 4,
      motivo: `Atraso de ${dias} dias (etapa D+30): escalar cobrança ao Jurídico.${janelaNote}`,
      resultadoTexto: '',
    };
    res.resultadoTexto = getPolicyOutcomeLabel(res);
    return res;
  }
  if (dias >= 15) {
    const res: PolicyEvaluationResult = {
      modo: 'aprovacao',
      regraId: 'FIN-020',
      versao: ver,
      aprovador: 'Gestor',
      prazoHoras: fin020?.prazoAprovacaoHoras ?? 4,
      motivo: `Atraso de ${dias} dias (etapa D+15): envio de notificação formal exige aprovação do Gestor.${janelaNote}`,
      resultadoTexto: '',
    };
    res.resultadoTexto = getPolicyOutcomeLabel(res);
    return res;
  }
  if (dias >= 5) {
    const res: PolicyEvaluationResult = {
      modo: 'autonomo',
      regraId: 'FIN-020',
      versao: ver,
      motivo: `Atraso de ${dias} dias (etapa D+5): e-mail formal disparado automaticamente na janela 8h–19h.${janelaNote}`,
      resultadoTexto: '',
    };
    res.resultadoTexto = getPolicyOutcomeLabel(res);
    return res;
  }

  const res: PolicyEvaluationResult = {
    modo: 'autonomo',
    regraId: 'FIN-020',
    versao: ver,
    motivo: `Atraso de ${dias} dia(s) (etapa D+1): lembrete automático via WhatsApp na janela 8h–19h.${janelaNote}`,
    resultadoTexto: '',
  };
  res.resultadoTexto = getPolicyOutcomeLabel(res);
  return res;
}

// ---------------------------------------------------------------------------
// BALANCES (STRICTLY SEPARATED — NEVER SUMMED)
// ---------------------------------------------------------------------------

export interface SegregatedBalanceData {
  contaTerceiros: {
    titulo: string;
    subtitulo: string;
    saldoEmConta: number;
    aRepassar: number;
    cobertura: number;
    ultimaConciliacao: string;
  };
  caixaProprio: {
    titulo: string;
    subtitulo: string;
    saldoDisponivel: number;
    receitaMes: number;
    despesasOperacionais: number;
    comissoesAPagar: number;
  };
}

export const SEGREGATED_BALANCES: SegregatedBalanceData = {
  contaTerceiros: {
    titulo: 'Conta de terceiros (valores a repassar)',
    subtitulo: 'Conta vinculada exclusiva de aluguéis recebidos para repasse a proprietários',
    saldoEmConta: 241000,
    aRepassar: 214000,
    cobertura: 1.13,
    ultimaConciliacao: 'Hoje, 13:27 · OFX Banco Itaú',
  },
  caixaProprio: {
    titulo: 'Caixa próprio da imobiliária',
    subtitulo: 'Taxas de administração, comissões e despesas operacionais da Farina',
    saldoDisponivel: 118450,
    receitaMes: 186400,
    despesasOperacionais: 71800,
    comissoesAPagar: 31200,
  },
};

// ---------------------------------------------------------------------------
// VISÃO GERAL: KPIs, ALERTS, CHARTS & DRE
// ---------------------------------------------------------------------------

export interface FinanceKpiItem {
  id: string;
  title: string;
  value: string;
  comparisonPrev: string;
  comparisonTarget: string;
  semaphore: FinanceSemaphore;
  semaphoreLabel: string;
  semaphoreRule: string;
  registeredBy: string;
  agentReading: string;
  pedirPrompt: string;
  pedirActionType: PolicyActionType;
  pedirEvalParams: PolicyEvalParams;
  pedirSubtipo: string;
  drawerColumns: [string, string, string, string];
  drawerRows: { col1: string; col2: string; col3: string; col4: string }[];
}

export const FINANCE_KPIS_BY_PERIOD: Record<FinancePeriod, FinanceKpiItem[]> = {
  mes: [
    {
      id: 'fin-receita',
      title: 'Receita do mês',
      value: 'R$ 186.400',
      comparisonPrev: '+4,1% vs. mês anterior',
      comparisonTarget: 'de R$ 200.000 (93%)',
      semaphore: 'ambar',
      semaphoreLabel: 'Atenção',
      semaphoreRule: 'Meta ≥ 95% (R$ 190.000)',
      registeredBy: 'Registrado pelo agente',
      agentReading:
        'A receita atingiu 93% da meta mensal com taxa de administração em 96% do previsto; faltam R$ 13.600 concentrados em duas comissões de venda em cartório.',
      pedirPrompt: 'Cobrar cartório e gerente bancário sobre as 2 comissões de venda previstas para esta semana',
      pedirActionType: 'regua_cobranca',
      pedirEvalParams: { diasAtraso: 2 },
      pedirSubtipo: 'Cobrança',
      drawerColumns: ['Linha', 'Previsto', 'Realizado', 'Atingimento'],
      drawerRows: [
        { col1: 'Taxa de administração', col2: 'R$ 81.000,00', col3: 'R$ 77.760,00', col4: '96,0%' },
        { col1: 'Comissões de locação', col2: 'R$ 51.000,00', col3: 'R$ 48.000,00', col4: '94,1%' },
        { col1: 'Comissões de venda', col2: 'R$ 59.000,00', col3: 'R$ 52.000,00', col4: '88,1%' },
        { col1: 'Outras (vistoria/intermediação)', col2: 'R$ 9.000,00', col3: 'R$ 8.640,00', col4: '96,0%' },
      ],
    },
    {
      id: 'fin-recebido-vencido',
      title: 'Recebido sobre vencido',
      value: '92,8%',
      comparisonPrev: 'R$ 801.800 de R$ 864.000',
      comparisonTarget: 'meta ≥ 96,0%',
      semaphore: 'ambar',
      semaphoreLabel: 'Atenção',
      semaphoreRule: 'Meta ≥ 96% até o dia 25',
      registeredBy: 'Registrado pelo agente',
      agentReading:
        'Dos R$ 864.000 vencidos na competência, R$ 801.800 já entraram na Conta de Terceiros e R$ 62.200 seguem em aberto com 16 inquilinos.',
      pedirPrompt: 'Disparar lembrete automático de 2ª via PIX para faturas vencidas há menos de 15 dias',
      pedirActionType: 'regua_cobranca',
      pedirEvalParams: { diasAtraso: 6 },
      pedirSubtipo: 'Segunda via de boleto',
      drawerColumns: ['Situação', 'Títulos', 'Valor total', 'Participação'],
      drawerRows: [
        { col1: 'Recebido e conciliado', col2: '342', col3: 'R$ 801.800,00', col4: '92,8%' },
        { col1: 'Em aberto (6–15 dias)', col2: '9', col3: 'R$ 27.739,50', col4: '3,2%' },
        { col1: 'Em aberto (16–30 dias)', col2: '4', col3: 'R$ 14.550,00', col4: '1,7%' },
        { col1: 'Em aberto (> 30 dias)', col2: '3', col3: 'R$ 19.910,50', col4: '2,3%' },
      ],
    },
    {
      id: 'fin-inadimplencia',
      title: 'Inadimplência',
      value: '7,2%',
      comparisonPrev: 'R$ 62.200 em 16 inquilinos',
      comparisonTarget: 'meta ≤ 4,0% (GLO-003)',
      semaphore: 'vermelho',
      semaphoreLabel: 'Crítico',
      semaphoreRule: 'Regra GLO-003: ≤ 4% (crítico > 7%)',
      registeredBy: 'Registrado pelo agente',
      agentReading:
        'A inadimplência chegou a 7,2% (acima do limite crítico de 7% na GLO-003). Três casos > 30 dias concentram R$ 19.910,50 (32% do total em atraso).',
      pedirPrompt: 'Executar régua FIN-020 para os 16 inquilinos em atraso conforme faixa de dias',
      pedirActionType: 'regua_cobranca',
      pedirEvalParams: { diasAtraso: 18 },
      pedirSubtipo: 'Cobrança',
      drawerColumns: ['Faixa', 'Inquilinos', 'Valor em aberto', 'Ação ativa'],
      drawerRows: [
        { col1: 'Até 5 dias (tolerância)', col2: '4', col3: 'R$ 11.400,00', col4: 'Não entra na inadimplência' },
        { col1: '6 a 15 dias', col2: '9', col3: 'R$ 27.739,50', col4: 'D+5 e-mail enviado' },
        { col1: '16 a 30 dias', col2: '4', col3: 'R$ 14.550,00', col4: 'D+15 notificação / aprovação' },
        { col1: 'Acima de 30 dias', col2: '3', col3: 'R$ 19.910,50', col4: 'Jurídico / Ação judicial' },
      ],
    },
    {
      id: 'fin-repassar',
      title: 'A repassar',
      value: 'R$ 214.000',
      comparisonPrev: 'saldo terceiros R$ 241.000',
      comparisonTarget: 'cobertura 1,13x (meta ≥ 1,05x)',
      semaphore: 'verde',
      semaphoreLabel: 'Saudável',
      semaphoreRule: 'Cobertura ≥ 1,05x na Conta de Terceiros',
      registeredBy: 'Registrado pelo agente',
      agentReading:
        'A Conta de Terceiros possui R$ 241.000 disponíveis frente a R$ 214.000 em 14 repasses programados (folga de R$ 27.000), com 2 bloqueados por conciliação.',
      pedirPrompt: 'Preparar remessa dos repasses conciliados dentro da alçada autônoma FIN-003',
      pedirActionType: 'repasse',
      pedirEvalParams: { valor: 12450, conciliado: true },
      pedirSubtipo: 'Repasse',
      drawerColumns: ['Grupo', 'Qtd', 'Valor líquido', 'Situação'],
      drawerRows: [
        { col1: 'Vencem hoje (dentro alçada)', col2: '5', col3: 'R$ 19.812,00', col4: 'Prontos pela FIN-003' },
        { col1: 'Fundo Aurora (PED-2026-004822)', col2: '1', col3: 'R$ 24.800,00', col4: 'Aguardando aprovação Gestor' },
        { col1: 'Atrasados / Bloqueados', col2: '4', col3: 'R$ 12.140,00', col4: '2 aguardando conciliação' },
        { col1: 'Programados D+2 a D+7', col2: '4', col3: 'R$ 157.248,00', col4: 'Cobertura garantida' },
      ],
    },
    {
      id: 'fin-vencer-7d',
      title: 'A vencer nos próximos 7 dias',
      value: 'R$ 138.000',
      comparisonPrev: '54 boletos e PIX emitidos',
      comparisonTarget: 'previsão de liquidez 95%',
      semaphore: 'verde',
      semaphoreLabel: 'Saudável',
      semaphoreRule: '100% dos boletos emitidos ≥ 5d antes',
      registeredBy: 'Registrado pelo agente',
      agentReading:
        'Todos os 54 títulos com vencimento nos próximos 7 dias já foram registrados e enviados pelo agente; 18 inquilinos aderiram ao lembrete via PIX.',
      pedirPrompt: 'Enviar lembrete preventivo D-2 via WhatsApp para os 54 boletos que vencem em 7 dias',
      pedirActionType: 'regua_cobranca',
      pedirEvalParams: { diasAtraso: 1 },
      pedirSubtipo: 'Cobrança',
      drawerColumns: ['Janela', 'Títulos', 'Valor previsto', 'Canal de envio'],
      drawerRows: [
        { col1: 'Amanhã (D+1)', col2: '14', col3: 'R$ 36.200,00', col4: 'WhatsApp + E-mail' },
        { col1: '2 a 4 dias', col2: '22', col3: 'R$ 56.400,00', col4: 'Boleto registrado' },
        { col1: '5 a 7 dias', col2: '18', col3: 'R$ 45.400,00', col4: 'PIX programado' },
      ],
    },
    {
      id: 'fin-acordos',
      title: 'Acordos ativos',
      value: '3 · R$ 9.400',
      comparisonPrev: 'cumprimento 66% (2 em dia)',
      comparisonTarget: 'meta cumprimento ≥ 85%',
      semaphore: 'ambar',
      semaphoreLabel: 'Atenção',
      semaphoreRule: 'Atenção quando cumprimento < 85%',
      registeredBy: 'Registrado pelo agente',
      agentReading:
        'Dos 3 acordos em vigor somando R$ 9.400, 2 estão com parcelas em dia e 1 (Paulo Henrique) está com a 2ª parcela vencendo em 48h.',
      pedirPrompt: 'Enviar lembrete de vencimento da parcela de acordo para Paulo Henrique',
      pedirActionType: 'regua_cobranca',
      pedirEvalParams: { diasAtraso: 2 },
      pedirSubtipo: 'Acordo',
      drawerColumns: ['Inquilino', 'Parcelas', 'Valor acordo', 'Cumprimento'],
      drawerRows: [
        { col1: 'Camila Siqueira', col2: '2/3 pagas', col3: 'R$ 3.600,00', col4: 'Em dia (100%)' },
        { col1: 'Sandra Vieira', col2: '1/2 paga', col3: 'R$ 2.400,00', col4: 'Em dia (100%)' },
        { col1: 'Paulo Henrique', col2: '1/3 paga', col3: 'R$ 3.400,00', col4: 'Parcela vence em 48h' },
      ],
    },
  ],
  '30d': [],
  '12m': [],
};

FINANCE_KPIS_BY_PERIOD['30d'] = FINANCE_KPIS_BY_PERIOD.mes.map((k) =>
  k.id === 'fin-receita'
    ? { ...k, title: 'Receita (últimos 30d)', value: 'R$ 192.100', comparisonTarget: 'de R$ 200.000 (96%)', semaphore: 'verde', semaphoreLabel: 'Saudável' }
    : k
);

FINANCE_KPIS_BY_PERIOD['12m'] = [
  {
    ...FINANCE_KPIS_BY_PERIOD.mes[0],
    title: 'Receita acumulada 12m',
    value: 'R$ 2.184.000',
    comparisonPrev: '+14,2% vs. 12m anteriores',
    comparisonTarget: 'de R$ 2.200.000 (99,3%)',
    semaphore: 'verde',
    semaphoreLabel: 'Saudável',
  },
  {
    ...FINANCE_KPIS_BY_PERIOD.mes[1],
    value: '95,4%',
    comparisonPrev: 'R$ 9.642.000 de R$ 10.107.000',
    semaphore: 'ambar',
    semaphoreLabel: 'Atenção',
  },
  {
    ...FINANCE_KPIS_BY_PERIOD.mes[2],
    value: '5,4%',
    comparisonPrev: 'média 12m · 7,2% atual',
    semaphore: 'ambar',
    semaphoreLabel: 'Atenção',
  },
  {
    ...FINANCE_KPIS_BY_PERIOD.mes[3],
    value: 'R$ 214.000',
    comparisonPrev: 'média repasse D+2 (99,1% no prazo)',
  },
  {
    ...FINANCE_KPIS_BY_PERIOD.mes[4],
    title: 'Previsão próxima semana',
    value: 'R$ 138.000',
  },
  {
    ...FINANCE_KPIS_BY_PERIOD.mes[5],
    value: '28 · R$ 84.200',
    comparisonPrev: 'cumprimento 89% em 12 meses',
    semaphore: 'verde',
    semaphoreLabel: 'Saudável',
  },
];

export const FINANCE_ALERTS = [
  {
    id: 'fin-alt-1',
    title: 'Repasses em atenção',
    detail: '6 repasses vencem hoje e 2 estão atrasados',
    urgency: 'critico' as const,
    tabTarget: 'repasses' as FinanceTabId,
  },
  {
    id: 'fin-alt-2',
    title: 'Inadimplência crítica',
    detail: '9 de 6–15 dias · 4 de 16–30 dias · 3 acima de 30 dias',
    urgency: 'critico' as const,
    tabTarget: 'inadimplencia' as FinanceTabId,
  },
  {
    id: 'fin-alt-3',
    title: 'Acordos em andamento',
    detail: '3 acordos ativos somando R$ 9.400,00 (66% em dia)',
    urgency: 'atencao' as const,
    tabTarget: 'inadimplencia' as FinanceTabId,
  },
  {
    id: 'fin-alt-4',
    title: 'Divergências de conciliação',
    detail: '5 lançamentos OFX precisam de conferência (FIN-017 em rascunho)',
    urgency: 'atencao' as const,
    tabTarget: 'conciliacao' as FinanceTabId,
  },
];

export const RECEITA_POR_LINHA_BY_PERIOD: Record<
  FinancePeriod,
  { linha: string; valor: number; meta: number }[]
> = {
  mes: [
    { linha: 'Taxa de administração', valor: 77760, meta: 81000 },
    { linha: 'Comissões de venda', valor: 52000, meta: 59000 },
    { linha: 'Comissões de locação', valor: 48000, meta: 51000 },
    { linha: 'Outras', valor: 8640, meta: 9000 },
  ],
  '30d': [
    { linha: 'Taxa de administração', valor: 79400, meta: 81000 },
    { linha: 'Comissões de venda', valor: 55200, meta: 59000 },
    { linha: 'Comissões de locação', valor: 48700, meta: 51000 },
    { linha: 'Outras', valor: 8800, meta: 9000 },
  ],
  '12m': [
    { linha: 'Taxa de administração', valor: 912000, meta: 920000 },
    { linha: 'Comissões de venda', valor: 618000, meta: 630000 },
    { linha: 'Comissões de locação', valor: 552000, meta: 550000 },
    { linha: 'Outras', valor: 102000, meta: 100000 },
  ],
};

export const FLUXO_PROJETADO_30D = {
  totais: { entradas: 1020000, saidas: 954400, saldo: 65600 },
  semanas: [
    { semana: 'Sem 1 (23–29/11)', entradas: 312000, saidas: 288400 },
    { semana: 'Sem 2 (30/11–06/12)', entradas: 268000, saidas: 249000 },
    { semana: 'Sem 3 (07–13/12)', entradas: 234000, saidas: 221000 },
    { semana: 'Sem 4 (14–22/12)', entradas: 206000, saidas: 196000 },
  ],
};

export const DRE_GERENCIAL_BY_PERIOD: Record<
  FinancePeriod,
  { receita: number; comissoes: number; despesasOperacionais: number; resultado: number }
> = {
  mes: {
    receita: 186400,
    comissoes: 54600,
    despesasOperacionais: 71800,
    resultado: 60000,
  },
  '30d': {
    receita: 192100,
    comissoes: 56100,
    despesasOperacionais: 71800,
    resultado: 64200,
  },
  '12m': {
    receita: 2184000,
    comissoes: 642000,
    despesasOperacionais: 846000,
    resultado: 696000,
  },
};

// ---------------------------------------------------------------------------
// CONTAS A RECEBER
// ---------------------------------------------------------------------------

export type ReceivableStatus = 'Recebido' | 'Em atraso' | 'A vencer 7d' | 'Em acordo';
export type PaymentMethod = 'PIX' | 'Boleto';
export type GuaranteeType = 'Caução' | 'Fiador' | 'Seguro fiança' | 'Título de capitalização';

export interface ReceivableItem {
  id: string;
  competencia: string;
  inquilino: string;
  imovel: string;
  vencimento: string;
  valor: number;
  forma: PaymentMethod;
  garantia: GuaranteeType;
  status: ReceivableStatus;
  conciliado: boolean;
  registeredBy: string;
}

export const RECEIVABLES_SUMMARY = {
  vencido: 864000,
  recebido: 801800,
  emAtraso: 62200,
  aVencer7d: 138000,
  emAcordo: 9400,
};

export const INITIAL_RECEIVABLES: ReceivableItem[] = [
  {
    id: 'rec-1',
    competencia: '11/2026',
    inquilino: 'Carlos Mendes',
    imovel: 'Apto 302 · Ed. Vista Verde',
    vencimento: '10/11/2026',
    valor: 3200,
    forma: 'PIX',
    garantia: 'Caução',
    status: 'Recebido',
    conciliado: true,
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'rec-2',
    competencia: '11/2026',
    inquilino: 'Ricardo Alves',
    imovel: 'Apto 401 - Ed. Central',
    vencimento: '12/10/2026',
    valor: 9640,
    forma: 'Boleto',
    garantia: 'Caução',
    status: 'Em atraso',
    conciliado: false,
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'rec-3',
    competencia: '11/2026',
    inquilino: 'Juliana Rocha',
    imovel: 'Apto 204 - Bela Vista',
    vencimento: '29/10/2026',
    valor: 2890,
    forma: 'Boleto',
    garantia: 'Caução',
    status: 'Em atraso',
    conciliado: false,
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'rec-4',
    competencia: '11/2026',
    inquilino: 'Marcos Teixeira',
    imovel: 'Apto 702 - Jardins',
    vencimento: '04/11/2026',
    valor: 4200,
    forma: 'Boleto',
    garantia: 'Seguro fiança',
    status: 'Em atraso',
    conciliado: false,
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'rec-5',
    competencia: '11/2026',
    inquilino: 'Camila Siqueira',
    imovel: 'Apto 704 - Moema',
    vencimento: '25/11/2026',
    valor: 1200,
    forma: 'PIX',
    garantia: 'Fiador',
    status: 'Em acordo',
    conciliado: true,
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'rec-6',
    competencia: '11/2026',
    inquilino: 'Fernanda Lima',
    imovel: 'Casa 12 · Vila Mariana',
    vencimento: '20/11/2026',
    valor: 2950,
    forma: 'PIX',
    garantia: 'Caução',
    status: 'Recebido',
    conciliado: false,
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'rec-7',
    competencia: '11/2026',
    inquilino: 'Mariana Duarte',
    imovel: 'Apto 108 · Perdizes',
    vencimento: '24/11/2026',
    valor: 3850,
    forma: 'PIX',
    garantia: 'Seguro fiança',
    status: 'A vencer 7d',
    conciliado: false,
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'rec-8',
    competencia: '11/2026',
    inquilino: 'Henrique Vasconcelos',
    imovel: 'Conj. 1402 · Paulista',
    vencimento: '27/11/2026',
    valor: 6400,
    forma: 'Boleto',
    garantia: 'Fiador',
    status: 'A vencer 7d',
    conciliado: false,
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'rec-9',
    competencia: '11/2026',
    inquilino: 'Paulo Henrique',
    imovel: 'Loja 03 - Av. Brasil',
    vencimento: '10/11/2026',
    valor: 2480,
    forma: 'Boleto',
    garantia: 'Caução',
    status: 'Em acordo',
    conciliado: false,
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'rec-10',
    competencia: '11/2026',
    inquilino: 'Grupo Orion Ltda',
    imovel: 'Galpão Industrial 04',
    vencimento: '15/11/2026',
    valor: 14900,
    forma: 'Boleto',
    garantia: 'Seguro fiança',
    status: 'Recebido',
    conciliado: true,
    registeredBy: 'Registrado pelo agente',
  },
];

// ---------------------------------------------------------------------------
// INADIMPLÊNCIA E COBRANÇA (EXACT 16 INQUILINOS = R$ 62.200,00 | 9 / 4 / 3)
// ---------------------------------------------------------------------------

export interface DelinquentTenant {
  id: string;
  nome: string;
  imovel: string;
  contratoCode: string;
  diasAtraso: number;
  faixa: '6-15' | '16-30' | '>30';
  principal: number;
  multa: number;
  juros: number;
  valorTotal: number;
  garantia: GuaranteeType;
  etapaRegua: 'D+1' | 'D+5' | 'D+15' | 'D+30';
  etapaTexto: string;
  proximaAcao: string;
  acaoJudicial: boolean;
  statusTexto: string;
  regraId: string;
  regraVersao: number;
  protocoloRelacionado?: string;
  orderIdRelacionado?: string;
  registeredBy: string;
  parcelasAbertas: { competencia: string; vencimento: string; principal: number; encargos: number }[];
  historicoCobranca: { data: string; canal: string; evento: string }[];
}

export const INITIAL_DELINQUENTS: DelinquentTenant[] = [
  {
    id: 'inad-1',
    nome: 'Ricardo Alves',
    imovel: 'Apto 401 - Ed. Central',
    contratoCode: 'CTR-401',
    diasAtraso: 41,
    faixa: '>30',
    principal: 8400,
    multa: 840,
    juros: 400,
    valorTotal: 9640,
    garantia: 'Caução',
    etapaRegua: 'D+30',
    etapaTexto: 'D+30 escalado ao Jurídico',
    proximaAcao: 'Parecer jurídico · Hoje 16:30',
    acaoJudicial: false,
    statusTexto: 'Escalado ao Jurídico',
    regraId: 'FIN-020',
    regraVersao: 2,
    registeredBy: 'Registrado pelo agente',
    parcelasAbertas: [
      { competencia: '10/2026', vencimento: '12/10/2026', principal: 4200, encargos: 780 },
      { competencia: '11/2026', vencimento: '12/11/2026', principal: 4200, encargos: 460 },
    ],
    historicoCobranca: [
      { data: '13/10 · 09:05', canal: 'WhatsApp', evento: 'D+1 lembrete automático enviado (FIN-020)' },
      { data: '17/10 · 10:12', canal: 'E-mail', evento: 'D+5 e-mail formal enviado sem retorno' },
      { data: '27/10 · 14:00', canal: 'E-mail + AR', evento: 'D+15 notificação formal aprovada e entregue' },
      { data: '11/11 · 09:30', canal: 'Sistema', evento: 'D+30 escalado automaticamente ao Jurídico' },
    ],
  },
  {
    id: 'inad-2',
    nome: 'Patrícia Lima',
    imovel: 'Casa 08 - Cond. Ipês',
    contratoCode: 'CTR-088',
    diasAtraso: 33,
    faixa: '>30',
    principal: 6200,
    multa: 620,
    juros: 300.5,
    valorTotal: 7120.5,
    garantia: 'Caução',
    etapaRegua: 'D+30',
    etapaTexto: 'D+30 escalado ao Jurídico',
    proximaAcao: 'Notificação extrajudicial · Amanhã 09:00',
    acaoJudicial: false,
    statusTexto: 'Escalado ao Jurídico',
    regraId: 'FIN-020',
    regraVersao: 2,
    registeredBy: 'Registrado pelo agente',
    parcelasAbertas: [
      { competencia: '10/2026', vencimento: '20/10/2026', principal: 6200, encargos: 920.5 },
    ],
    historicoCobranca: [
      { data: '21/10 · 08:40', canal: 'WhatsApp', evento: 'D+1 lembrete enviado' },
      { data: '25/10 · 11:00', canal: 'E-mail', evento: 'D+5 e-mail formal enviado' },
      { data: '04/11 · 15:10', canal: 'E-mail', evento: 'D+15 notificação formal enviada' },
      { data: '19/11 · 10:00', canal: 'Sistema', evento: 'D+30 escalado ao Jurídico' },
    ],
  },
  {
    id: 'inad-3',
    nome: 'Fernando Costa',
    imovel: 'Sala 304 - Paulista',
    contratoCode: 'CTR-304',
    diasAtraso: 31,
    faixa: '>30',
    principal: 2750,
    multa: 275,
    juros: 125,
    valorTotal: 3150,
    garantia: 'Fiador',
    etapaRegua: 'D+30',
    etapaTexto: 'Ação judicial iniciada',
    proximaAcao: 'Acompanhamento jurídico · Aprovação JUR-007',
    acaoJudicial: true,
    statusTexto: 'Ação judicial ativa',
    regraId: 'JUR-007',
    regraVersao: 2,
    registeredBy: 'Registrado pelo agente',
    parcelasAbertas: [
      { competencia: '10/2026', vencimento: '22/10/2026', principal: 2750, encargos: 400 },
    ],
    historicoCobranca: [
      { data: '23/10 · 09:00', canal: 'WhatsApp', evento: 'D+1 lembrete automático' },
      { data: '06/11 · 16:20', canal: 'E-mail', evento: 'D+15 notificação ao inquilino e ao fiador' },
      { data: '18/11 · 14:30', canal: 'Jurídico', evento: 'Ação judicial protocolada — acordos exigem aprovação Jurídico (JUR-007)' },
    ],
  },
  {
    id: 'inad-4',
    nome: 'Juliana Rocha',
    imovel: 'Apto 204 - Bela Vista',
    contratoCode: 'CTR-204',
    diasAtraso: 24,
    faixa: '16-30',
    principal: 2500,
    multa: 250,
    juros: 140,
    valorTotal: 2890,
    garantia: 'Caução',
    etapaRegua: 'D+15',
    etapaTexto: 'D+15 aguardando aprovação',
    proximaAcao: 'Aprovar desconto 15% · PED-2026-004823',
    acaoJudicial: false,
    statusTexto: 'Aguardando aprovação',
    regraId: 'FIN-014',
    regraVersao: 3,
    protocoloRelacionado: 'PED-2026-004823',
    orderIdRelacionado: 'ord-4823',
    registeredBy: 'Registrado pelo agente',
    parcelasAbertas: [
      { competencia: '10/2026', vencimento: '29/10/2026', principal: 2500, encargos: 390 },
    ],
    historicoCobranca: [
      { data: '30/10 · 08:30', canal: 'WhatsApp', evento: 'D+1 lembrete automático' },
      { data: '03/11 · 09:15', canal: 'E-mail', evento: 'D+5 e-mail formal enviado' },
      { data: '22/11 · 13:20', canal: 'WhatsApp', evento: 'Cliente pediu 15% de desconto em multa/juros (PED-2026-004823)' },
    ],
  },
  {
    id: 'inad-5',
    nome: 'Marcos Teixeira',
    imovel: 'Apto 702 - Jardins',
    contratoCode: 'CTR-702',
    diasAtraso: 18,
    faixa: '16-30',
    principal: 3700,
    multa: 370,
    juros: 130,
    valorTotal: 4200,
    garantia: 'Seguro fiança',
    etapaRegua: 'D+15',
    etapaTexto: 'D+15 notificação aguardando aprovação',
    proximaAcao: 'Aprovar D+15 · PED-2026-004825',
    acaoJudicial: false,
    statusTexto: 'Aguardando aprovação',
    regraId: 'FIN-020',
    regraVersao: 2,
    protocoloRelacionado: 'PED-2026-004825',
    orderIdRelacionado: 'ord-4825',
    registeredBy: 'Registrado pelo agente',
    parcelasAbertas: [
      { competencia: '11/2026', vencimento: '04/11/2026', principal: 3700, encargos: 500 },
    ],
    historicoCobranca: [
      { data: '05/11 · 09:05', canal: 'WhatsApp', evento: 'D+1 lembrete enviado' },
      { data: '09/11 · 10:40', canal: 'E-mail', evento: 'D+5 e-mail formal enviado' },
      { data: '22/11 · 13:48', canal: 'Sistema', evento: 'Minuta D+15 gerada para aprovação (PED-2026-004825)' },
    ],
  },
  {
    id: 'inad-6',
    nome: 'Aline Barros',
    imovel: 'Studio 18 - Consolação',
    contratoCode: 'CTR-018',
    diasAtraso: 17,
    faixa: '16-30',
    principal: 3150,
    multa: 315,
    juros: 95,
    valorTotal: 3560,
    garantia: 'Título de capitalização',
    etapaRegua: 'D+15',
    etapaTexto: 'D+15 notificação enviada',
    proximaAcao: 'Resgate título em D+25 · 30/11 10:00',
    acaoJudicial: false,
    statusTexto: 'Notificação enviada',
    regraId: 'FIN-020',
    regraVersao: 2,
    registeredBy: 'Registrado pelo agente',
    parcelasAbertas: [
      { competencia: '11/2026', vencimento: '05/11/2026', principal: 3150, encargos: 410 },
    ],
    historicoCobranca: [
      { data: '06/11 · 08:15', canal: 'WhatsApp', evento: 'D+1 lembrete enviado' },
      { data: '10/11 · 09:45', canal: 'E-mail', evento: 'D+5 e-mail formal enviado' },
      { data: '20/11 · 14:20', canal: 'E-mail', evento: 'D+15 notificação aprovada e enviada' },
    ],
  },
  {
    id: 'inad-7',
    nome: 'Bruno Azevedo',
    imovel: 'Apto 105 - Vila Nova',
    contratoCode: 'CTR-105',
    diasAtraso: 16,
    faixa: '16-30',
    principal: 3450,
    multa: 345,
    juros: 105,
    valorTotal: 3900,
    garantia: 'Seguro fiança',
    etapaRegua: 'D+15',
    etapaTexto: 'D+15 notificação enviada',
    proximaAcao: 'Comunicar seguradora · 26/11 09:00',
    acaoJudicial: false,
    statusTexto: 'Notificação enviada',
    regraId: 'FIN-020',
    regraVersao: 2,
    registeredBy: 'Registrado pelo agente',
    parcelasAbertas: [
      { competencia: '11/2026', vencimento: '06/11/2026', principal: 3450, encargos: 450 },
    ],
    historicoCobranca: [
      { data: '07/11 · 08:50', canal: 'WhatsApp', evento: 'D+1 lembrete enviado' },
      { data: '22/11 · 10:15', canal: 'E-mail', evento: 'D+15 notificação enviada' },
    ],
  },
  {
    id: 'inad-8',
    nome: 'Camila Siqueira',
    imovel: 'Apto 704 - Moema',
    contratoCode: 'CTR-704',
    diasAtraso: 14,
    faixa: '6-15',
    principal: 4350,
    multa: 435,
    juros: 115,
    valorTotal: 4900,
    garantia: 'Fiador',
    etapaRegua: 'D+5',
    etapaTexto: 'D+5 e-mail enviado',
    proximaAcao: 'Preparar D+15 amanhã · 09:00',
    acaoJudicial: false,
    statusTexto: 'Em régua automática',
    regraId: 'FIN-020',
    regraVersao: 2,
    registeredBy: 'Registrado pelo agente',
    parcelasAbertas: [
      { competencia: '11/2026', vencimento: '08/11/2026', principal: 4350, encargos: 550 },
    ],
    historicoCobranca: [
      { data: '09/11 · 08:30', canal: 'WhatsApp', evento: 'D+1 lembrete automático' },
      { data: '13/11 · 09:10', canal: 'E-mail', evento: 'D+5 e-mail formal enviado' },
    ],
  },
  {
    id: 'inad-9',
    nome: 'Paulo Henrique',
    imovel: 'Loja 03 - Av. Brasil',
    contratoCode: 'CTR-003',
    diasAtraso: 12,
    faixa: '6-15',
    principal: 2200,
    multa: 220,
    juros: 60,
    valorTotal: 2480,
    garantia: 'Caução',
    etapaRegua: 'D+5',
    etapaTexto: 'D+5 e-mail enviado',
    proximaAcao: 'D+15 em 3 dias · 25/11 09:00',
    acaoJudicial: false,
    statusTexto: 'Em régua automática',
    regraId: 'FIN-020',
    regraVersao: 2,
    registeredBy: 'Registrado pelo agente',
    parcelasAbertas: [
      { competencia: '11/2026', vencimento: '10/11/2026', principal: 2200, encargos: 280 },
    ],
    historicoCobranca: [
      { data: '11/11 · 09:00', canal: 'WhatsApp', evento: 'D+1 lembrete enviado' },
      { data: '15/11 · 10:00', canal: 'E-mail', evento: 'D+5 e-mail formal enviado' },
    ],
  },
  {
    id: 'inad-10',
    nome: 'Gustavo Rocha',
    imovel: 'Casa Turquesa, 90',
    contratoCode: 'CTR-090',
    diasAtraso: 11,
    faixa: '6-15',
    principal: 4100,
    multa: 410,
    juros: 90,
    valorTotal: 4600,
    garantia: 'Fiador',
    etapaRegua: 'D+5',
    etapaTexto: 'D+5 e-mail enviado',
    proximaAcao: 'D+15 em 4 dias · 26/11 08:30',
    acaoJudicial: false,
    statusTexto: 'Em régua automática',
    regraId: 'FIN-020',
    regraVersao: 2,
    registeredBy: 'Registrado pelo agente',
    parcelasAbertas: [
      { competencia: '11/2026', vencimento: '11/11/2026', principal: 4100, encargos: 500 },
    ],
    historicoCobranca: [
      { data: '12/11 · 08:20', canal: 'WhatsApp', evento: 'D+1 lembrete automático' },
      { data: '16/11 · 09:40', canal: 'E-mail', evento: 'D+5 e-mail formal enviado' },
    ],
  },
  {
    id: 'inad-11',
    nome: 'Rodrigo Peixoto',
    imovel: 'Apto 306 - Pinheiros',
    contratoCode: 'CTR-306',
    diasAtraso: 10,
    faixa: '6-15',
    principal: 2780,
    multa: 278,
    juros: 62,
    valorTotal: 3120,
    garantia: 'Caução',
    etapaRegua: 'D+5',
    etapaTexto: 'D+5 e-mail enviado',
    proximaAcao: 'D+15 em 5 dias · 27/11 09:00',
    acaoJudicial: false,
    statusTexto: 'Em régua automática',
    regraId: 'FIN-020',
    regraVersao: 2,
    registeredBy: 'Registrado pelo agente',
    parcelasAbertas: [
      { competencia: '11/2026', vencimento: '12/11/2026', principal: 2780, encargos: 340 },
    ],
    historicoCobranca: [
      { data: '17/11 · 10:15', canal: 'E-mail', evento: 'D+5 e-mail formal enviado' },
    ],
  },
  {
    id: 'inad-12',
    nome: 'Vanessa Lopes',
    imovel: 'Apto 601 - Perdizes',
    contratoCode: 'CTR-601',
    diasAtraso: 9,
    faixa: '6-15',
    principal: 2530,
    multa: 253,
    juros: 57,
    valorTotal: 2840,
    garantia: 'Caução',
    etapaRegua: 'D+5',
    etapaTexto: 'D+5 e-mail enviado',
    proximaAcao: 'Lembrete PIX · Hoje 17:30',
    acaoJudicial: false,
    statusTexto: 'Em régua automática',
    regraId: 'FIN-020',
    regraVersao: 2,
    registeredBy: 'Registrado pelo agente',
    parcelasAbertas: [
      { competencia: '11/2026', vencimento: '13/11/2026', principal: 2530, encargos: 310 },
    ],
    historicoCobranca: [
      { data: '18/11 · 09:20', canal: 'E-mail', evento: 'D+5 e-mail formal enviado' },
    ],
  },
  {
    id: 'inad-13',
    nome: 'Thiago Moreira',
    imovel: 'Apto 1102 - Jardins',
    contratoCode: 'CTR-1102',
    diasAtraso: 8,
    faixa: '6-15',
    principal: 2390,
    multa: 239,
    juros: 51,
    valorTotal: 2680,
    garantia: 'Caução',
    etapaRegua: 'D+5',
    etapaTexto: 'D+5 e-mail enviado',
    proximaAcao: 'D+15 em 7 dias · 29/11 08:30',
    acaoJudicial: false,
    statusTexto: 'Em régua automática',
    regraId: 'FIN-020',
    regraVersao: 2,
    registeredBy: 'Registrado pelo agente',
    parcelasAbertas: [
      { competencia: '11/2026', vencimento: '14/11/2026', principal: 2390, encargos: 290 },
    ],
    historicoCobranca: [
      { data: '19/11 · 11:05', canal: 'E-mail', evento: 'D+5 e-mail formal enviado' },
    ],
  },
  {
    id: 'inad-14',
    nome: 'Sandra Vieira',
    imovel: 'Apto 502 - Santana',
    contratoCode: 'CTR-502',
    diasAtraso: 7,
    faixa: '6-15',
    principal: 1920,
    multa: 192,
    juros: 38,
    valorTotal: 2150,
    garantia: 'Fiador',
    etapaRegua: 'D+5',
    etapaTexto: 'D+5 e-mail enviado',
    proximaAcao: 'Contato telefônico · Amanhã 10:00',
    acaoJudicial: false,
    statusTexto: 'Em régua automática',
    regraId: 'FIN-020',
    regraVersao: 2,
    registeredBy: 'Registrado pelo agente',
    parcelasAbertas: [
      { competencia: '11/2026', vencimento: '15/11/2026', principal: 1920, encargos: 230 },
    ],
    historicoCobranca: [
      { data: '16/11 · 08:45', canal: 'WhatsApp', evento: 'D+1 lembrete enviado' },
      { data: '20/11 · 09:00', canal: 'E-mail', evento: 'D+5 e-mail formal enviado' },
    ],
  },
  {
    id: 'inad-15',
    nome: 'Luciana Freitas',
    imovel: 'Casa 02 - Alto Lapa',
    contratoCode: 'CTR-002',
    diasAtraso: 7,
    faixa: '6-15',
    principal: 2250,
    multa: 225,
    juros: 44.5,
    valorTotal: 2519.5,
    garantia: 'Caução',
    etapaRegua: 'D+5',
    etapaTexto: 'D+5 e-mail enviado',
    proximaAcao: 'D+15 em 8 dias · 30/11 09:00',
    acaoJudicial: false,
    statusTexto: 'Em régua automática',
    regraId: 'FIN-020',
    regraVersao: 2,
    registeredBy: 'Registrado pelo agente',
    parcelasAbertas: [
      { competencia: '11/2026', vencimento: '15/11/2026', principal: 2250, encargos: 269.5 },
    ],
    historicoCobranca: [
      { data: '20/11 · 09:10', canal: 'E-mail', evento: 'D+5 e-mail formal enviado' },
    ],
  },
  {
    id: 'inad-16',
    nome: 'Renata Campos',
    imovel: 'Apto 901 - Ed. Horizonte',
    contratoCode: 'CTR-901',
    diasAtraso: 6,
    faixa: '6-15',
    principal: 2190,
    multa: 219,
    juros: 41,
    valorTotal: 2450,
    garantia: 'Caução',
    etapaRegua: 'D+5',
    etapaTexto: 'D+5 e-mail enviado',
    proximaAcao: 'Reenvio 2ª via · Amanhã 08:30',
    acaoJudicial: false,
    statusTexto: 'Em régua automática',
    regraId: 'FIN-020',
    regraVersao: 2,
    registeredBy: 'Registrado pelo agente',
    parcelasAbertas: [
      { competencia: '11/2026', vencimento: '16/11/2026', principal: 2190, encargos: 260 },
    ],
    historicoCobranca: [
      { data: '21/11 · 08:55', canal: 'E-mail', evento: 'D+5 e-mail formal enviado' },
    ],
  },
];

export const INADIMPLENCIA_POR_GARANTIA = [
  { garantia: 'Caução', inquilinos: 9, valor: 33600 },
  { garantia: 'Fiador', inquilinos: 4, valor: 14800 },
  { garantia: 'Seguro fiança', inquilinos: 2, valor: 8100 },
  { garantia: 'Título de capitalização', inquilinos: 1, valor: 5700 },
];

// ---------------------------------------------------------------------------
// REPASSES (14 REPASSES = R$ 214.000,00 | 6 hoje, 2 atrasados, 1 aprovacao, 2 bloqueados)
// ---------------------------------------------------------------------------

export type RepasseStatus =
  | 'Pronto (autônomo)'
  | 'Aguardando aprovação'
  | 'Bloqueado (conciliação)'
  | 'Atrasado'
  | 'Agendado'
  | 'Pago';

export interface RepasseItem {
  id: string;
  proprietario: string;
  imoveisDesc: string;
  vencimento: string;
  venceHoje?: boolean;
  atrasado?: boolean;
  aluguelRecebido: number;
  taxaAdm: number;
  iptuCondominio: number;
  manutencao: number;
  comissao: number;
  valorLiquido: number;
  conciliado: boolean;
  motivoBloqueio?: string;
  status: RepasseStatus;
  regraId: string;
  regraVersao: number;
  orderProtocol?: string;
  orderId?: string;
  canalPreferencial: 'WhatsApp' | 'E-mail';
  chavePixOuBanco: string;
  registeredBy: string;
}

export const INITIAL_REPASSES: RepasseItem[] = [
  {
    id: 'rep-1',
    proprietario: 'João Batista',
    imoveisDesc: 'Apto 302 · Ed. Vista Verde',
    vencimento: 'Hoje, 22/11',
    venceHoje: true,
    aluguelRecebido: 3200,
    taxaAdm: 288,
    iptuCondominio: 0,
    manutencao: 0,
    comissao: 0,
    valorLiquido: 2912,
    conciliado: true,
    status: 'Pronto (autônomo)',
    regraId: 'FIN-003',
    regraVersao: 1,
    canalPreferencial: 'WhatsApp',
    chavePixOuBanco: 'Banco Itaú · Ag. 1420 · CC 33910-2',
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'rep-2',
    proprietario: 'Fundo Imobiliário Aurora',
    imoveisDesc: 'Portfólio 9 imóveis comerciais e residenciais',
    vencimento: 'Hoje, 22/11',
    venceHoje: true,
    aluguelRecebido: 27555.56,
    taxaAdm: 2755.56,
    iptuCondominio: 0,
    manutencao: 0,
    comissao: 0,
    valorLiquido: 24800,
    conciliado: true,
    status: 'Aguardando aprovação',
    regraId: 'FIN-003',
    regraVersao: 1,
    orderProtocol: 'PED-2026-004822',
    orderId: 'ord-4822',
    canalPreferencial: 'E-mail',
    chavePixOuBanco: 'Banco BTG Pactual · CNPJ 21.440.190/0001-88',
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'rep-3',
    proprietario: 'Helena Prado',
    imoveisDesc: 'Casa 04 · Jardim Paulistano',
    vencimento: 'Hoje, 22/11',
    venceHoje: true,
    aluguelRecebido: 4950,
    taxaAdm: 495,
    iptuCondominio: 0,
    manutencao: 305,
    comissao: 0,
    valorLiquido: 4150,
    conciliado: false,
    motivoBloqueio: 'Aluguel do inquilino ainda não foi conciliado no extrato bancário.',
    status: 'Bloqueado (conciliação)',
    regraId: 'FIN-003',
    regraVersao: 1,
    canalPreferencial: 'WhatsApp',
    chavePixOuBanco: 'Banco Bradesco · Ag. 0812 · CC 11204-9',
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'rep-4',
    proprietario: 'Otávio Ramos',
    imoveisDesc: 'Apto 801 · Higienópolis',
    vencimento: 'Ontem, 21/11',
    atrasado: true,
    aluguelRecebido: 2400,
    taxaAdm: 240,
    iptuCondominio: 290,
    manutencao: 0,
    comissao: 0,
    valorLiquido: 1870,
    conciliado: false,
    motivoBloqueio: 'Comprovante bancário pendente de baixa no extrato OFX.',
    status: 'Atrasado',
    regraId: 'FIN-003',
    regraVersao: 1,
    canalPreferencial: 'E-mail',
    chavePixOuBanco: 'PIX CPF ***.418.902-**',
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'rep-5',
    proprietario: 'Marina Duarte',
    imoveisDesc: 'Apto 504 · Ed. Bela Vista',
    vencimento: 'Hoje, 22/11',
    venceHoje: true,
    aluguelRecebido: 4500,
    taxaAdm: 450,
    iptuCondominio: 0,
    manutencao: 0,
    comissao: 0,
    valorLiquido: 4050,
    conciliado: true,
    status: 'Pronto (autônomo)',
    regraId: 'FIN-003',
    regraVersao: 1,
    canalPreferencial: 'WhatsApp',
    chavePixOuBanco: 'Banco Santander · Ag. 0214 · CC 44012-7',
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'rep-6',
    proprietario: 'Eduardo Tavares',
    imoveisDesc: 'Conjunto 902 · Centro + 2 salas',
    vencimento: 'Hoje, 22/11',
    venceHoje: true,
    aluguelRecebido: 14200,
    taxaAdm: 1420,
    iptuCondominio: 680,
    manutencao: 0,
    comissao: 0,
    valorLiquido: 12100,
    conciliado: true,
    status: 'Pronto (autônomo)',
    regraId: 'FIN-003',
    regraVersao: 1,
    canalPreferencial: 'E-mail',
    chavePixOuBanco: 'Banco Itaú · Ag. 4410 · CC 91204-5',
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'rep-7',
    proprietario: 'Clara Vasconcelos',
    imoveisDesc: 'Casa 12 · Vila Mariana',
    vencimento: 'Hoje, 22/11',
    venceHoje: true,
    aluguelRecebido: 6800,
    taxaAdm: 680,
    iptuCondominio: 0,
    manutencao: 0,
    comissao: 0,
    valorLiquido: 6120,
    conciliado: false,
    motivoBloqueio: 'PIX recebido em conta de terceiro sem CPF (PED-2026-004806).',
    status: 'Bloqueado (conciliação)',
    regraId: 'FIN-003',
    regraVersao: 1,
    canalPreferencial: 'WhatsApp',
    chavePixOuBanco: 'Banco do Brasil · Ag. 3100 · CC 20194-1',
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'rep-8',
    proprietario: 'Sérgio Albuquerque',
    imoveisDesc: 'Galpão Logístico 02 · Barra Funda',
    vencimento: '20/11/2026',
    atrasado: true,
    aluguelRecebido: 18500,
    taxaAdm: 1480,
    iptuCondominio: 1120,
    manutencao: 450,
    comissao: 0,
    valorLiquido: 15450,
    conciliado: true,
    status: 'Atrasado',
    regraId: 'FIN-003',
    regraVersao: 1,
    canalPreferencial: 'E-mail',
    chavePixOuBanco: 'Banco Safra · CNPJ 14.901.112/0001-10',
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'rep-9',
    proprietario: 'Patrimonial Paulista S.A.',
    imoveisDesc: 'Laje Corporativa 1401 · Paulista',
    vencimento: '24/11/2026',
    aluguelRecebido: 22400,
    taxaAdm: 1792,
    iptuCondominio: 0,
    manutencao: 0,
    comissao: 1120,
    valorLiquido: 19488,
    conciliado: true,
    status: 'Agendado',
    regraId: 'FIN-003',
    regraVersao: 1,
    canalPreferencial: 'E-mail',
    chavePixOuBanco: 'Banco Itaú BBA · CNPJ 09.110.320/0001-04',
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'rep-10',
    proprietario: 'Beatriz Monteiro',
    imoveisDesc: '4 apartamentos · Moema e Brooklin',
    vencimento: '25/11/2026',
    aluguelRecebido: 21500,
    taxaAdm: 2150,
    iptuCondominio: 940,
    manutencao: 0,
    comissao: 0,
    valorLiquido: 18410,
    conciliado: true,
    status: 'Agendado',
    regraId: 'FIN-003',
    regraVersao: 1,
    canalPreferencial: 'WhatsApp',
    chavePixOuBanco: 'Banco XP · Ag. 0001 · CC 718290-3',
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'rep-11',
    proprietario: 'Holding Monte Carlo',
    imoveisDesc: '6 lojas comerciais · Zona Sul',
    vencimento: '26/11/2026',
    aluguelRecebido: 42000,
    taxaAdm: 3360,
    iptuCondominio: 1840,
    manutencao: 0,
    comissao: 0,
    valorLiquido: 36800,
    conciliado: true,
    status: 'Agendado',
    regraId: 'FIN-003',
    regraVersao: 1,
    canalPreferencial: 'E-mail',
    chavePixOuBanco: 'Banco Itaú · CNPJ 33.902.114/0001-55',
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'rep-12',
    proprietario: 'Marcelo Guimarães',
    imoveisDesc: '3 conjuntos · Faria Lima',
    vencimento: '27/11/2026',
    aluguelRecebido: 31800,
    taxaAdm: 2544,
    iptuCondominio: 1256,
    manutencao: 0,
    comissao: 0,
    valorLiquido: 28000,
    conciliado: true,
    status: 'Agendado',
    regraId: 'FIN-003',
    regraVersao: 1,
    canalPreferencial: 'E-mail',
    chavePixOuBanco: 'Banco Santander · Ag. 1091 · CC 01092-4',
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'rep-13',
    proprietario: 'Luciana Cavalcanti',
    imoveisDesc: '2 coberturas · Jardins',
    vencimento: '28/11/2026',
    aluguelRecebido: 26400,
    taxaAdm: 2112,
    iptuCondominio: 888,
    manutencao: 0,
    comissao: 0,
    valorLiquido: 23400,
    conciliado: true,
    status: 'Agendado',
    regraId: 'FIN-003',
    regraVersao: 1,
    canalPreferencial: 'WhatsApp',
    chavePixOuBanco: 'Banco Itaú · Ag. 0399 · CC 11892-0',
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'rep-14',
    proprietario: 'Investimentos Farina Sul',
    imoveisDesc: '5 salas · Berrini',
    vencimento: '29/11/2026',
    aluguelRecebido: 18900,
    taxaAdm: 1890,
    iptuCondominio: 560,
    manutencao: 0,
    comissao: 0,
    valorLiquido: 16450,
    conciliado: true,
    status: 'Agendado',
    regraId: 'FIN-003',
    regraVersao: 1,
    canalPreferencial: 'E-mail',
    chavePixOuBanco: 'Banco Bradesco · CNPJ 18.774.209/0001-20',
    registeredBy: 'Registrado pelo agente',
  },
];

export const COBERTURA_CAIXA_7D = [
  { dia: 'Hoje 22/11', saldoTerceiros: 241000, repassesAcumulados: 50832 },
  { dia: '23/11', saldoTerceiros: 248000, repassesAcumulados: 68152 },
  { dia: '24/11', saldoTerceiros: 256000, repassesAcumulados: 87640 },
  { dia: '25/11', saldoTerceiros: 263000, repassesAcumulados: 106050 },
  { dia: '26/11', saldoTerceiros: 274000, repassesAcumulados: 142850 },
  { dia: '27/11', saldoTerceiros: 282000, repassesAcumulados: 170850 },
  { dia: '29/11', saldoTerceiros: 295000, repassesAcumulados: 214000 },
];

// ---------------------------------------------------------------------------
// CONTAS A PAGAR (FORNECEDORES + COMISSÕES DE 7 CORRETORES = R$ 31.200,00)
// ---------------------------------------------------------------------------

export interface PayableSupplierItem {
  id: string;
  favorecido: string;
  descricao: string;
  imovelOuCentro: string;
  vencimento: string;
  valor: number;
  modoRegra: Modo;
  regraId: string;
  regraVersao: number;
  status: 'Aguardando aprovação' | 'Agendado' | 'Pago';
  protocolo?: string;
  orderId?: string;
  registeredBy: string;
}

export interface BrokerCommissionItem {
  id: string;
  corretor: string;
  tipo: 'Venda' | 'Locação';
  referencia: string;
  valorBase: number;
  percentual: string;
  valorComissao: number;
  previsaoPagamento: string;
  status: 'Aprovada · agendada' | 'Aguardando conciliação' | 'Paga';
  registeredBy: string;
}

export const INITIAL_PAYABLES: PayableSupplierItem[] = [
  {
    id: 'pag-1',
    favorecido: 'Hidráulica Souza',
    descricao: 'Reparo emergencial tubulação cozinha (OS-914)',
    imovelOuCentro: 'Rua das Acácias, 120 · CTR-619',
    vencimento: 'Hoje, 22/11',
    valor: 2350,
    modoRegra: 'aprovacao',
    regraId: 'FIN-011',
    regraVersao: 2,
    status: 'Aguardando aprovação',
    protocolo: 'PED-2026-004809',
    orderId: 'ord-4809',
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'pag-2',
    favorecido: 'Pinturas Norte',
    descricao: 'Pintura de preparação para entrega de chaves',
    imovelOuCentro: 'Apto 601 · Perdizes',
    vencimento: '24/11/2026',
    valor: 980,
    modoRegra: 'autonomo',
    regraId: 'FIN-011',
    regraVersao: 2,
    status: 'Agendado',
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'pag-3',
    favorecido: 'Reformas Alvorada',
    descricao: 'Pintura e troca de piso pós-saída · conta de terceiros (OS-921)',
    imovelOuCentro: 'Casa Rua do Cedro, 57 · IMV-057',
    vencimento: '25/11/2026',
    valor: 4180,
    modoRegra: 'aprovacao',
    regraId: 'FIN-011',
    regraVersao: 2,
    status: 'Aguardando aprovação',
    protocolo: 'PED-2026-004833',
    orderId: 'ord-4833',
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'pag-4',
    favorecido: 'ZAP / VivaReal Portais',
    descricao: 'Plano mensal de anúncios imobiliários (Nov/26)',
    imovelOuCentro: 'Marketing e Captação · Caixa Próprio',
    vencimento: '26/11/2026',
    valor: 1420,
    modoRegra: 'autonomo',
    regraId: 'FIN-011',
    regraVersao: 2,
    status: 'Agendado',
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'pag-5',
    favorecido: 'Cartório 9º Ofício Notas',
    descricao: 'Autenticações e certidões de contratos locatícios',
    imovelOuCentro: 'Operacional Farina · Caixa Próprio',
    vencimento: '27/11/2026',
    valor: 640,
    modoRegra: 'autonomo',
    regraId: 'FIN-011',
    regraVersao: 2,
    status: 'Agendado',
    registeredBy: 'Registrado pelo agente',
  },
];

export const INITIAL_COMMISSIONS: BrokerCommissionItem[] = [
  {
    id: 'com-1',
    corretor: 'Beatriz Souza',
    tipo: 'Venda',
    referencia: 'Apto 1204 Jardins (VGV R$ 940.000)',
    valorBase: 940000,
    percentual: '0,9%',
    valorComissao: 8460,
    previsaoPagamento: '25/11/2026',
    status: 'Aprovada · agendada',
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'com-2',
    corretor: 'Lucas Andrade',
    tipo: 'Venda',
    referencia: 'Cobertura Vila Nova (VGV R$ 1.250.000)',
    valorBase: 1250000,
    percentual: '0,6%',
    valorComissao: 7500,
    previsaoPagamento: '25/11/2026',
    status: 'Aprovada · agendada',
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'com-3',
    corretor: 'Rafael Costa',
    tipo: 'Locação',
    referencia: '3 contratos fechados em Nov/26',
    valorBase: 14800,
    percentual: '30% 1º aluguel',
    valorComissao: 4440,
    previsaoPagamento: '26/11/2026',
    status: 'Aprovada · agendada',
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'com-4',
    corretor: 'Carla Menezes',
    tipo: 'Locação',
    referencia: 'Sala 804 Paulista + Loja 09',
    valorBase: 11200,
    percentual: '30% 1º aluguel',
    valorComissao: 3360,
    previsaoPagamento: '26/11/2026',
    status: 'Aguardando conciliação',
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'com-5',
    corretor: 'Thiago Nogueira',
    tipo: 'Locação',
    referencia: '2 apartamentos Moema',
    valorBase: 9400,
    percentual: '30% 1º aluguel',
    valorComissao: 2820,
    previsaoPagamento: '26/11/2026',
    status: 'Aprovada · agendada',
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'com-6',
    corretor: 'Mariana Farias',
    tipo: 'Locação',
    referencia: '2 estúdios Pinheiros',
    valorBase: 8600,
    percentual: '30% 1º aluguel',
    valorComissao: 2580,
    previsaoPagamento: '27/11/2026',
    status: 'Aprovada · agendada',
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'com-7',
    corretor: 'Bruno Silveira',
    tipo: 'Locação',
    referencia: 'Casa Alto da Lapa (captação)',
    valorBase: 6800,
    percentual: '30% 1º aluguel',
    valorComissao: 2040,
    previsaoPagamento: '27/11/2026',
    status: 'Aprovada · agendada',
    registeredBy: 'Registrado pelo agente',
  },
];

// ---------------------------------------------------------------------------
// CONCILIAÇÃO BANCÁRIA (412 LANÇAMENTOS, 96% CASADOS, 5 DIVERGÊNCIAS)
// ---------------------------------------------------------------------------

export interface BankDivergenceItem {
  id: string;
  data: string;
  descricaoExtrato: string;
  valorBanco: number;
  valorSistema: number | null;
  diferenca: number;
  sugestaoAgente: string;
  confianca: number;
  pagadorTerceiroSemCpf?: boolean;
  resolvido?: boolean;
  resolucaoTexto?: string;
  registeredBy: string;
}

export const CONCILIACAO_RESUMO = {
  totalLancamentos: 412,
  casadosPct: 96,
  casadosQtd: 396,
  emProcessamento: 11,
  divergenciasTotal: 5,
};

export const INITIAL_DIVERGENCES: BankDivergenceItem[] = [
  {
    id: 'div-1',
    data: '22/11/2026',
    descricaoExtrato: 'PIX REC JOAO P LIMA · REF CASA 12 (SEM CPF)',
    valorBanco: 2950,
    valorSistema: 2950,
    diferenca: 0,
    sugestaoAgente: 'Vincular à fatura FAT-1126-12 de Fernanda Lima (mesmo valor, pagador cônjuge)',
    confianca: 74,
    pagadorTerceiroSemCpf: true,
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'div-2',
    data: '22/11/2026',
    descricaoExtrato: 'TED RECEBIDA HELENA PRADO / INQUILINO CTR-044',
    valorBanco: 4949.6,
    valorSistema: 4950,
    diferenca: -0.4,
    sugestaoAgente: 'Baixar fatura Casa 04 com diferença de R$ 0,40 (arredondamento bancário ≤ R$ 0,50)',
    confianca: 98,
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'div-3',
    data: '21/11/2026',
    descricaoExtrato: 'LIQ BOLETO SISPAG · PARCELA 11/26 CTR-801',
    valorBanco: 2385,
    valorSistema: 2400,
    diferenca: -15,
    sugestaoAgente: 'Tarifa de compensação ou abatimento de R$ 15,00; confirmar antes de liberar repasse a Otávio Ramos',
    confianca: 81,
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'div-4',
    data: '21/11/2026',
    descricaoExtrato: 'CREDITO PIX CONDOMINIO VISTA VERDE REEMB',
    valorBanco: 412.8,
    valorSistema: null,
    diferenca: 412.8,
    sugestaoAgente: 'Lançar como reembolso de despesa ordinária do Apto 302 (CTR-302)',
    confianca: 79,
    registeredBy: 'Registrado pelo agente',
  },
  {
    id: 'div-5',
    data: '20/11/2026',
    descricaoExtrato: 'LIQ BOLETO MULTA/JUROS CTR-118 · ATRASO 4D',
    valorBanco: 3180.42,
    valorSistema: 3180,
    diferenca: 0.42,
    sugestaoAgente: 'Conciliar diferença de R$ 0,42 referente a centavos de juros diários (≤ R$ 0,50)',
    confianca: 96,
    registeredBy: 'Registrado pelo agente',
  },
];
