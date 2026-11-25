/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { MainContent } from './components/MainContent';
import { KpiDetailDrawer } from './components/KpiDetailDrawer';
import { ToastBanner, type ToastMessage } from './components/ToastBanner';
import { inferOrderInterpretation } from './components/agent-center/CreateOrderModal';
import { RuleDetailDrawer } from './components/rules/RuleDetailDrawer';
import { RuleEditorDrawer } from './components/rules/RuleEditorDrawer';
import {
  INITIAL_NOTIFICATIONS,
  SIDEBAR_NAV_ITEMS,
  WORKSPACES,
  type NavItemId,
  type NotificationItem,
  type WorkspaceTenant,
} from './data/navigation';
import {
  FUNNEL_BY_PERIOD,
  HEALTH_BY_PERIOD,
  INITIAL_ACTIVITIES,
  INITIAL_BROKERS,
  INITIAL_OPERATIONAL_ALERTS,
  INITIAL_OPPORTUNITIES,
  INTAKE_BY_PERIOD,
  KPIS_BY_PERIOD,
  MONTHLY_TRENDS_12M,
  type AgentActivityItem,
  type BrokerRankingItem,
  type DecisionCardItem,
  type DecisionCategory,
  type KpiMetricItem,
  type OperationalAlertItem,
  type ProactiveOpportunity,
  type TimePeriod,
} from './data/commandCenterData';
import {
  INITIAL_INTAKE_MESSAGES,
  INITIAL_ORDERS,
  ORDER_CATEGORIES,
  type AgentOrder,
  type IntakeMessageItem,
  type OrderCategory,
  type OrderLinkChip,
  type OrderPriority,
} from './data/agentOrdersData';
import type { PolicyEvaluationResult } from './data/financeiroData';
import {
  CONSERVATIVE_STARTER_TEMPLATES,
  INITIAL_AUTONOMY_MATRIX,
  INITIAL_GLOBAL_HISTORY,
  INITIAL_RULES,
  INITIAL_SUGGESTIONS,
  type AgentRuleSuggestion,
  type AutonomyMatrixCell,
  type GlobalHistoryItem,
  type Modo,
  type PerfilRegra,
  type Regra,
  type StatusRegra,
} from './data/rulesData';
import { MODO_LABELS } from './components/rules/RuleHelpers';

function getBreadcrumbLabel(itemId: NavItemId): string | undefined {
  if (itemId === 'painel') return undefined;
  for (const item of SIDEBAR_NAV_ITEMS) {
    if (item.subItems) {
      const match = item.subItems.find((sub) => sub.id === itemId);
      if (match) return match.label;
    } else if (item.id === itemId) {
      return item.label;
    }
  }
  return undefined;
}

function getCurrentTimeHHMM() {
  const now = new Date();
  return now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function getCurrentTimelineTimestamp() {
  const now = new Date();
  const hhmm = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const ddmm = now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  return `${hhmm} · ${ddmm}`;
}

function buildAgentResultDescription(commandText: string, attachmentName?: string): string {
  const lower = commandText.toLowerCase();
  if (attachmentName) {
    return `Processei o arquivo "${attachmentName}" e extraí 4 novos registros para conferência ("${commandText}").`;
  }
  if (lower.includes('renovar') || lower.includes('renovação') || lower.includes('contrato')) {
    return 'Preparei minutas de renovação com atualização de índice e notifiquei proprietários e locatários.';
  }
  if (lower.includes('pdf') || lower.includes('cadastrar') || lower.includes('imóve')) {
    return 'Extraí 6 fichas de imóveis do PDF de ontem, padronizei fotos e publiquei na carteira.';
  }
  if (lower.includes('cobrar') || lower.includes('atraso') || lower.includes('inadimpl')) {
    return 'Enviei cobrança escalonada via WhatsApp e E-mail para os inquilinos em atraso.';
  }
  if (lower.includes('resumo') || lower.includes('semana')) {
    return 'Consolidei o resumo da semana: 128 leads, conversão de 11,7%, R$ 186.400 faturados e 8 alertas sinalizados.';
  }
  if (lower.includes('repasse')) {
    return 'Conciliei os repasses pendentes e deixei a remessa bancária pronta para liberação.';
  }
  return `Executei seu pedido: "${commandText}" e atualizei os registros automaticamente.`;
}

function mapCategoryToDecisionCategory(cat: OrderCategory): DecisionCategory {
  if (cat === 'Locação e contratos' || cat === 'Jurídico e documentos') return 'contrato';
  if (cat === 'Vendas e captação' || cat === 'Cadastro e atualização') return 'imovel';
  if (cat === 'Cobrança e financeiro') return 'financeiro';
  return 'alerta';
}

export default function App() {
  const [activeItem, setActiveItem] = useState<NavItemId>('gestor');
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceTenant>(WORKSPACES[0]);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [period, setPeriod] = useState<TimePeriod>('mes');
  const [isLoading, setIsLoading] = useState(true);

  const [orders, setOrders] = useState<AgentOrder[]>(INITIAL_ORDERS);
  const [intakeItems, setIntakeItems] = useState<IntakeMessageItem[]>(INITIAL_INTAKE_MESSAGES);
  const nextProtocolNumRef = useRef(4839);

  // SINGLE SOURCE OF TRUTH FOR AGENT RULES
  const [rules, setRules] = useState<Regra[]>(INITIAL_RULES);
  const [autonomyMatrix, setAutonomyMatrix] = useState<AutonomyMatrixCell[]>(INITIAL_AUTONOMY_MATRIX);
  const [suggestions, setSuggestions] = useState<AgentRuleSuggestion[]>(INITIAL_SUGGESTIONS);
  const [globalHistory, setGlobalHistory] = useState<GlobalHistoryItem[]>(INITIAL_GLOBAL_HISTORY);
  const [perfilRegra, setPerfilRegra] = useState<PerfilRegra>('Gestor');
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [ruleEditorState, setRuleEditorState] = useState<{
    isOpen: boolean;
    initialRule: Regra | null;
    presetModule?: string;
  }>({ isOpen: false, initialRule: null });
  const [rulesInitialModuleFilter, setRulesInitialModuleFilter] = useState<string | null>(null);
  const [pendingOrderToOpenId, setPendingOrderToOpenId] = useState<string | null>(null);
  const nextRuleSeqRef = useRef(25);

  const [alerts, setAlerts] = useState<OperationalAlertItem[]>(INITIAL_OPERATIONAL_ALERTS);
  const [kpisByPeriod, setKpisByPeriod] = useState<Record<TimePeriod, KpiMetricItem[]>>(
    KPIS_BY_PERIOD
  );
  const [brokers, setBrokers] = useState<BrokerRankingItem[]>(INITIAL_BROKERS);
  const [opportunities, setOpportunities] = useState<ProactiveOpportunity[]>(
    INITIAL_OPPORTUNITIES
  );
  const [activities, setActivities] = useState<AgentActivityItem[]>(INITIAL_ACTIVITIES);

  const [selectedKpiId, setSelectedKpiId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const initialRulesBaseline = useMemo(
    () => ({
      ativas: INITIAL_RULES.filter((r) => r.status === 'ativa').length,
      rascunhos: INITIAL_RULES.filter((r) => r.status === 'rascunho').length,
      emAprovacao: INITIAL_RULES.filter((r) => r.status === 'em_aprovacao').length,
      conflitos: Math.ceil(
        INITIAL_RULES.filter((r) => !!r.conflitoCom && r.status === 'ativa').length / 2
      ),
    }),
    []
  );

  const initialOrdersBaseline = useMemo(
    () => ({
      abertos: INITIAL_ORDERS.filter(
        (o) => o.status !== 'Concluído' && o.status !== 'Cancelado'
      ).length,
      emRisco: INITIAL_ORDERS.filter(
        (o) => o.slaSemaphore === 'em_risco' && o.status !== 'Concluído' && o.status !== 'Cancelado'
      ).length,
      atrasados: INITIAL_ORDERS.filter(
        (o) => o.slaSemaphore === 'atrasado' && o.status !== 'Concluído' && o.status !== 'Cancelado'
      ).length,
      aguardandoVoce: INITIAL_ORDERS.filter(
        (o) => o.status === 'Aguardando aprovação' || o.assigneeType === 'Humano'
      ).length,
      aguardandoAceite: INITIAL_ORDERS.filter((o) => o.status === 'Entregue').length,
      concluidosHoje: INITIAL_ORDERS.filter((o) => o.status === 'Concluído').length,
    }),
    []
  );

  // "Decisões do agente" on the Home page corresponds 1-to-1 with orders in "Aguardando aprovação"
  const decisions: DecisionCardItem[] = useMemo(() => {
    return orders
      .filter((o) => o.status === 'Aguardando aprovação')
      .map((o) => ({
        id: o.id,
        category: mapCategoryToDecisionCategory(o.category),
        title: `${o.protocol} · ${o.subject}`,
        proposedAction: o.decisionMeta?.proposedAction ?? o.objective,
        pauseReason: o.decisionMeta?.pauseReason ?? 'Ação sensível',
        confidence: o.confidence,
        evidenceSource: o.decisionMeta?.evidenceSource ?? `${o.channel} · ${o.requesterName}`,
        evidenceExcerpt: o.decisionMeta?.evidenceExcerpt ?? o.narrative,
        registeredBy: o.registeredBy,
        createdAt: o.createdAt,
      }));
  }, [orders]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsLoading(false);
    }, 380);
    return () => window.clearTimeout(timer);
  }, []);

  const showToast = (text: string, onUndo?: () => void) => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setToast({
      id: `toast-${Date.now()}`,
      text,
      onUndo,
    });
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
    }, 5500);
  };

  const handleChangePeriod = (nextPeriod: TimePeriod) => {
    if (nextPeriod === period) return;
    setPeriod(nextPeriod);
    setIsLoading(true);
    window.setTimeout(() => {
      setIsLoading(false);
    }, 280);
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  // Core order builder used both by "Fazer pedido" in Agente de IA and CommandBar on Home
  const createFormalOrder = (
    rawText: string,
    attachmentName?: string,
    startInExecution = false
  ): AgentOrder => {
    const seq = nextProtocolNumRef.current;
    nextProtocolNumRef.current += 1;
    const protocol = `PED-2026-00${seq}`;
    const orderId = `ord-${seq}`;
    const interp = inferOrderInterpretation(rawText, attachmentName);
    const nowTime = getCurrentTimeHHMM();
    const tlTime = getCurrentTimelineTimestamp();

    // Respect active SLA rule GLO-002 when computing committed SLA
    const slaRule = rules.find((r) => r.id === 'GLO-002' && r.status === 'ativa');
    const slaParams = slaRule?.entao.parametros ?? {};
    const committedByRule =
      interp.priority === 'Urgente'
        ? `Hoje (${Number(slaParams.urgenteHoras ?? 4)} h · regra GLO-002)`
        : interp.priority === 'Alta'
        ? `${Number(slaParams.altaDiasUteis ?? 1)} dia útil · regra GLO-002`
        : interp.priority === 'Normal'
        ? `${Number(slaParams.normalDiasUteis ?? 3)} dias úteis · regra GLO-002`
        : `${Number(slaParams.baixaDiasUteis ?? 7)} dias úteis · regra GLO-002`;

    const newOrder: AgentOrder = {
      id: orderId,
      protocol,
      cycle: 1,
      channel: 'Chat do sistema',
      category: interp.category,
      subtype: interp.subtype,
      subject: interp.subject,
      objective: interp.objective,
      narrative: interp.narrative,
      requesterName: 'Gestor Farina',
      requesterRole: 'Gestor',
      requesterContact: 'gestao@farina.com.br',
      priority: interp.priority,
      status: startInExecution ? 'Em execução' : 'Interpretado',
      slaSemaphore: 'no_prazo',
      slaText: interp.slaText,
      slaRequested: 'Solicitação imediata',
      slaCommitted: slaRule ? committedByRule : interp.slaCommitted,
      appliedRules: slaRule ? [{ ruleId: slaRule.id, version: slaRule.versao }] : undefined,
      stageDurations: [
        { stage: 'Recebimento e leitura', duration: '1s' },
        {
          stage: startInExecution ? 'Em execução' : 'Interpretado',
          duration: 'Agora',
          active: true,
        },
      ],
      assigneeType: 'Agente',
      assigneeName: 'Agente GoFAPE',
      confidence: interp.confidence,
      registeredBy: 'Registrado pelo agente',
      createdAt: `Hoje, ${nowTime}`,
      links: [
        { type: 'Pessoa', code: 'PES-001', label: 'Gestor Farina (Gestor)' },
      ],
      originalMessage: {
        receivedAt: `22/11/2026 às ${nowTime}`,
        rawText,
        attachments: attachmentName
          ? [{ name: attachmentName, size: '185 KB', mime: 'application/octet-stream' }]
          : [],
        channelMetadata: [
          { label: 'Canal', value: 'Chat do sistema' },
          { label: 'Protocolo gerado', value: protocol },
        ],
      },
      timeline: [
        {
          id: `tl-${seq}-1`,
          cycle: 1,
          type: 'Recebido',
          actor: 'Solicitante',
          actorName: 'Gestor Farina',
          timestamp: tlTime,
          summary: `Pedido recebido pelo Chat do sistema (${protocol}).`.slice(0, 160),
          details: 'Texto livre original preservado sem edições.',
        },
        {
          id: `tl-${seq}-2`,
          cycle: 1,
          type: 'Classificado',
          actor: 'Agente',
          actorName: 'Agente GoFAPE',
          timestamp: tlTime,
          summary: `Interpretado em ${interp.category} > ${interp.subtype} (Prioridade ${interp.priority}).`.slice(
            0,
            160
          ),
          details: `Prazo comprometido: ${interp.slaCommitted}. Confiança ${interp.confidence}%.`,
        },
      ],
      executionSteps: [
        {
          id: `st-${seq}-1`,
          label: 'Interpretar solicitação e preencher ficha padronizada',
          status: 'completed',
          duration: '0,9s',
        },
        {
          id: `st-${seq}-2`,
          label: `Executar rotina de ${interp.category.toLowerCase()}`,
          status: startInExecution ? 'running' : 'pending',
          duration: startInExecution ? 'Em andamento' : 'Aguardando início',
        },
      ],
      delivery: {
        solutionSummary: `Pedido protocolado em ${interp.category} > ${interp.subtype} e pronto para acompanhamento.`,
        artifacts: [],
        systemChangesSummary: [`Protocolo ${protocol} criado na fila operacional`],
        requesterPreview: {
          channel: 'Chat do sistema',
          body: `Pedido ${protocol} interpretado: ${interp.subject}. Prazo comprometido: ${interp.slaCommitted}.`,
        },
      },
    };

    setOrders((prev) => [newOrder, ...prev]);

    setIntakeItems((prev) => [
      {
        id: `int-${seq}`,
        receivedAt: nowTime,
        channel: 'Chat do sistema',
        senderRaw: 'Gestor Farina',
        excerpt: rawText.slice(0, 96),
        fullText: rawText,
        outcomeType: 'created_order',
        outcomeLabel: `Virou o pedido ${protocol}`,
        linkedProtocols: [protocol],
        suggestedCategory: interp.category,
      },
      ...prev,
    ]);

    return newOrder;
  };

  const handleCreateOrderFromModal = (rawText: string, attachmentName?: string): AgentOrder => {
    const created = createFormalOrder(rawText, attachmentName, false);
    setActivities((prev) => [
      {
        id: `act-${created.id}`,
        time: getCurrentTimeHHMM(),
        description: `Criei o pedido ${created.protocol}: ${created.subject}`,
        origin: 'Pedido seu',
        confidence: created.confidence,
        status: 'completed',
        registeredBy: 'Registrado pelo agente',
      },
      ...prev,
    ]);
    showToast(`Pedido ${created.protocol} criado e interpretado.`);
    return created;
  };

  const handleCreateFinancialAgentOrder = (payload: {
    promptText: string;
    categoria?: OrderCategory;
    subtipo: string;
    evaluation: PolicyEvaluationResult;
    links?: OrderLinkChip[];
  }): AgentOrder => {
    const seq = nextProtocolNumRef.current;
    nextProtocolNumRef.current += 1;
    const protocol = `PED-2026-00${seq}`;
    const orderId = `ord-${seq}`;
    const nowTime = getCurrentTimeHHMM();
    const tlTime = getCurrentTimelineTimestamp();
    const { evaluation, promptText, subtipo, links } = payload;
    const resolvedCategory: OrderCategory = payload.categoria ?? 'Cobrança e financeiro';
    const moduleOriginLabel =
      resolvedCategory === 'Cobrança e financeiro'
        ? 'Financeiro'
        : resolvedCategory === 'Vendas e captação' || resolvedCategory === 'Cadastro e atualização'
        ? 'Locação e Administração'
        : resolvedCategory === 'Manutenção e vistoria'
        ? 'Manutenção e Vistorias'
        : resolvedCategory === 'Consulta e relatório' || resolvedCategory === 'Comunicação'
        ? 'Gestor'
        : 'Contratos e Jurídico';

    const orderStatus: AgentOrder['status'] =
      evaluation.modo === 'autonomo'
        ? 'Em execução'
        : evaluation.modo === 'aprovacao'
        ? 'Aguardando aprovação'
        : 'Recebido';

    const assigneeType: AgentOrder['assigneeType'] =
      evaluation.modo === 'bloqueado' ? 'Humano' : 'Agente';
    const assigneeName =
      evaluation.modo === 'bloqueado'
        ? `${evaluation.aprovador ?? 'Gestor / Jurídico'} (Escalado)`
        : 'Agente GoFAPE';

    const slaText =
      evaluation.modo === 'aprovacao' && evaluation.prazoHoras
        ? `em ${evaluation.prazoHoras}h`
        : evaluation.modo === 'bloqueado'
        ? 'bloqueado · escalado'
        : evaluation.modo === 'sugerir'
        ? 'só sugerir'
        : 'em 2h';

    const subject = promptText.split('.')[0].slice(0, 60) || `Pedido ${moduleOriginLabel} · ${subtipo}`;
    const objective = promptText.slice(0, 140);
    const narrative = `${promptText} Avaliação de política: ${evaluation.regraId} v${evaluation.versao} — ${evaluation.motivo}`.slice(
      0,
      400
    );

    const ruleTimelineSummary =
      evaluation.modo === 'aprovacao'
        ? `Aprovação exigida pela regra ${evaluation.regraId} v${evaluation.versao} (${
            evaluation.aprovador ?? 'Gestor'
          }, prazo ${evaluation.prazoHoras ?? 4}h).`
        : evaluation.modo === 'bloqueado'
        ? `Bloqueado e escalado pela regra ${evaluation.regraId} v${evaluation.versao}: ${evaluation.motivo}`
        : evaluation.modo === 'sugerir'
        ? `Modo sugerir registrado (${evaluation.regraId} v${evaluation.versao}): aguarda decisão humana.`
        : `Execução autônoma autorizada pela regra ${evaluation.regraId} v${evaluation.versao}.`;

    const newOrder: AgentOrder = {
      id: orderId,
      protocol,
      cycle: 1,
      channel: 'Chat do sistema',
      category: resolvedCategory,
      subtype: subtipo,
      subject,
      objective,
      narrative,
      requesterName: `${perfilRegra} Farina`,
      requesterRole: perfilRegra,
      requesterContact:
        resolvedCategory === 'Cobrança e financeiro'
          ? 'financeiro@farina.com.br'
          : resolvedCategory === 'Vendas e captação' || resolvedCategory === 'Cadastro e atualização'
          ? 'locacao@farina.com.br'
          : resolvedCategory === 'Manutenção e vistoria'
          ? 'manutencao@farina.com.br'
          : resolvedCategory === 'Consulta e relatório' || resolvedCategory === 'Comunicação'
          ? 'gestao@farina.com.br'
          : 'juridico@farina.com.br',
      priority: evaluation.modo === 'bloqueado' ? 'Urgente' : 'Alta',
      status: orderStatus,
      slaSemaphore: evaluation.modo === 'bloqueado' ? 'em_risco' : 'no_prazo',
      slaText,
      slaRequested: `Solicitação imediata via ${moduleOriginLabel}`,
      slaCommitted:
        evaluation.modo === 'aprovacao' && evaluation.prazoHoras
          ? `Aprovação em ${evaluation.prazoHoras}h · ${evaluation.regraId} v${evaluation.versao}`
          : evaluation.modo === 'bloqueado'
          ? `Escalado imediatamente · ${evaluation.regraId} v${evaluation.versao}`
          : `Execução imediata · ${evaluation.regraId} v${evaluation.versao}`,
      appliedRules: [{ ruleId: evaluation.regraId, version: evaluation.versao }],
      stageDurations: [
        { stage: 'Recebimento e política', duration: '1s' },
        { stage: orderStatus, duration: 'Agora', active: true },
      ],
      assigneeType,
      assigneeName,
      confidence: evaluation.modo === 'bloqueado' ? 99 : 95,
      registeredBy: 'Registrado pelo agente',
      createdAt: `Hoje, ${nowTime}`,
      links: links && links.length > 0 ? links : [{ type: 'Pessoa', code: 'MOD-REQ', label: `${perfilRegra} Farina` }],
      originalMessage: {
        receivedAt: `22/11/2026 às ${nowTime}`,
        rawText: promptText,
        attachments: [],
        channelMetadata: [
          { label: 'Módulo origem', value: moduleOriginLabel },
          { label: 'Regra avaliada', value: `${evaluation.regraId} v${evaluation.versao}` },
          { label: 'Resultado', value: evaluation.resultadoTexto },
        ],
      },
      timeline: [
        {
          id: `tl-${seq}-1`,
          cycle: 1,
          type: 'Recebido',
          actor: 'Solicitante',
          actorName: `${perfilRegra} Farina`,
          timestamp: tlTime,
          summary: `Solicitação protocolada (${protocol}) em ${resolvedCategory} > ${subtipo}.`.slice(
            0,
            160
          ),
          details: promptText,
        },
        {
          id: `tl-${seq}-2`,
          cycle: 1,
          type: 'Classificado',
          actor: 'Agente',
          actorName: 'Motor de Políticas GoFAPE',
          timestamp: tlTime,
          summary: ruleTimelineSummary.slice(0, 160),
          details: evaluation.motivo,
        },
      ],
      executionSteps: [
        {
          id: `st-${seq}-1`,
          label: `Avaliar regra ${evaluation.regraId} v${evaluation.versao}`,
          status: 'completed',
          duration: '0,4s',
        },
        {
          id: `st-${seq}-2`,
          label:
            evaluation.modo === 'autonomo'
              ? `Executar ${subtipo.toLowerCase()} de forma autônoma`
              : evaluation.modo === 'aprovacao'
              ? `Aguardar aprovação de ${evaluation.aprovador ?? 'Gestor'}`
              : `Escalar bloqueio para ${evaluation.aprovador ?? 'Gestor / Jurídico'}`,
          status: evaluation.modo === 'autonomo' ? 'running' : 'pending',
          duration: evaluation.modo === 'autonomo' ? 'Em andamento' : 'Pausado por regra',
        },
      ],
      delivery: {
        solutionSummary: `${evaluation.resultadoTexto}. ${evaluation.motivo}`.slice(0, 280),
        artifacts: [],
        systemChangesSummary: [
          `Protocolo ${protocol} vinculado à regra ${evaluation.regraId} v${evaluation.versao}`,
        ],
        requesterPreview: {
          channel: 'Chat do sistema',
          body: `${protocol}: ${evaluation.resultadoTexto} (${evaluation.regraId} v${evaluation.versao}).`,
        },
      },
      decisionMeta:
        evaluation.modo === 'aprovacao'
          ? {
              proposedAction: promptText.slice(0, 180),
              pauseReason: 'Ação sensível',
              evidenceSource: `${evaluation.regraId} v${evaluation.versao} · Aprovação de ${
                evaluation.aprovador ?? 'Gestor'
              } em ${evaluation.prazoHoras ?? 4}h`,
              evidenceExcerpt: evaluation.motivo,
            }
          : undefined,
    };

    setOrders((prev) => [newOrder, ...prev]);

    setIntakeItems((prev) => [
      {
        id: `int-${seq}`,
        receivedAt: nowTime,
        channel: 'Chat do sistema',
        senderRaw: `${perfilRegra} Farina (${moduleOriginLabel})`,
        excerpt: promptText.slice(0, 96),
        fullText: promptText,
        outcomeType: 'created_order',
        outcomeLabel: `Virou o pedido ${protocol}`,
        linkedProtocols: [protocol],
        suggestedCategory: resolvedCategory,
      },
      ...prev,
    ]);

    setRules((prev) =>
      prev.map((r) =>
        r.id === evaluation.regraId
          ? { ...r, acionamentos30d: r.acionamentos30d + 1 }
          : r
      )
    );

    setActivities((prev) => [
      {
        id: `act-${orderId}`,
        time: nowTime,
        description: `${protocol} · ${evaluation.regraId} v${evaluation.versao} (${evaluation.resultadoTexto}): ${subject}`,
        origin: 'Pedido seu',
        confidence: newOrder.confidence,
        status: evaluation.modo === 'autonomo' ? 'running' : 'completed',
        registeredBy: 'Registrado pelo agente',
      },
      ...prev,
    ]);

    showToast(
      `${protocol} gerado · Regra aplicada: ${evaluation.regraId} v${evaluation.versao} (${evaluation.resultadoTexto}).`
    );

    return newOrder;
  };

  const handleSubmitCommand = (commandText: string, attachmentName?: string) => {
    const createdOrder = createFormalOrder(commandText, attachmentName, true);
    const newId = `act-${Date.now()}`;
    const runningItem: AgentActivityItem = {
      id: newId,
      time: getCurrentTimeHHMM(),
      description: attachmentName
        ? `Processando ${createdOrder.protocol} ("${commandText}") com anexo ${attachmentName}...`
        : `Executando ${createdOrder.protocol}: "${commandText}"...`,
      origin: 'Pedido seu',
      confidence: createdOrder.confidence,
      status: 'running',
      registeredBy: 'Registrado pelo agente',
    };

    setActivities((prev) => [runningItem, ...prev]);

    window.setTimeout(() => {
      const completedText = buildAgentResultDescription(commandText, attachmentName);
      setActivities((prev) =>
        prev.map((item) =>
          item.id === newId
            ? {
                ...item,
                status: 'completed',
                description: `${createdOrder.protocol} · ${completedText}`,
              }
            : item
        )
      );
      setOrders((prev) =>
        prev.map((o) =>
          o.id === createdOrder.id
            ? {
                ...o,
                status: 'Entregue',
                timeline: [
                  ...o.timeline,
                  {
                    id: `tl-ent-${Date.now()}`,
                    cycle: o.cycle,
                    type: 'Entregue',
                    actor: 'Agente',
                    actorName: 'Agente GoFAPE',
                    timestamp: getCurrentTimelineTimestamp(),
                    summary: completedText.slice(0, 160),
                    details: 'Aceite automático programado em 3 dias úteis.',
                  },
                ],
                executionSteps: o.executionSteps.map((st) => ({
                  ...st,
                  status: 'completed',
                  duration: st.status === 'running' ? '1,8s' : st.duration,
                })),
                delivery: {
                  ...o.delivery,
                  solutionSummary: completedText.slice(0, 280),
                  autoAcceptNotice: true,
                },
              }
            : o
        )
      );
      showToast(`Pedido ${createdOrder.protocol} entregue pelo agente.`, () => {
        setActivities((prev) =>
          prev.map((item) => (item.id === newId ? { ...item, status: 'undone' } : item))
        );
      });
    }, 1800);
  };

  // Order Detail & Home Decision Handlers (synchronized)
  const handleSaveOrderInterpretation = (
    orderId: string,
    updates: {
      subject: string;
      objective: string;
      narrative: string;
      category: OrderCategory;
      subtype: string;
      priority: OrderPriority;
    }
  ) => {
    const snapshot = orders.find((o) => o.id === orderId);
    if (!snapshot) return;

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              ...updates,
              registeredBy: 'Registrado pelo agente · corrigido por você',
              timeline: [
                ...o.timeline,
                {
                  id: `tl-corr-${Date.now()}`,
                  cycle: o.cycle,
                  type: 'Classificado',
                  actor: 'Gestor',
                  actorName: 'Gestor Farina',
                  timestamp: getCurrentTimelineTimestamp(),
                  summary: `Interpretação ajustada: ${updates.category} > ${updates.subtype} (${updates.priority}).`.slice(
                    0,
                    160
                  ),
                  details: `Assunto atualizado para "${updates.subject}". Mensagem original preservada.`,
                },
              ],
            }
          : o
      )
    );

    showToast(`Interpretação de ${snapshot.protocol} atualizada.`, () => {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? snapshot : o)));
    });
  };

  const handleApproveOrder = (orderId: string) => {
    const snapshot = orders.find((o) => o.id === orderId);
    if (!snapshot) return;

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'Em execução',
              timeline: [
                ...o.timeline,
                {
                  id: `tl-apr-${Date.now()}`,
                  cycle: o.cycle,
                  type: 'Aprovado por',
                  actor: 'Gestor',
                  actorName: 'Gestor Farina',
                  timestamp: getCurrentTimelineTimestamp(),
                  summary: 'Ação aprovada pela gestão e liberada para execução do agente.'.slice(
                    0,
                    160
                  ),
                  details: `Aprovado em ${getCurrentTimelineTimestamp()}.`,
                },
              ],
            }
          : o
      )
    );

    const activityId = `act-apr-${Date.now()}`;
    setActivities((prev) => [
      {
        id: activityId,
        time: getCurrentTimeHHMM(),
        description: `Aprovei e liberei ${snapshot.protocol}: ${snapshot.subject}`,
        origin: 'Pedido seu',
        confidence: snapshot.confidence,
        status: 'completed',
        registeredBy: 'Registrado pelo agente',
      },
      ...prev,
    ]);

    showToast(`Aprovado: ${snapshot.protocol}`, () => {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? snapshot : o)));
      setActivities((prev) => prev.filter((a) => a.id !== activityId));
    });
  };

  const handleRejectDecision = (orderId: string) => {
    const snapshot = orders.find((o) => o.id === orderId);
    if (!snapshot) return;

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'Cancelado',
              timeline: [
                ...o.timeline,
                {
                  id: `tl-rej-${Date.now()}`,
                  cycle: o.cycle,
                  type: 'Passo executado',
                  actor: 'Gestor',
                  actorName: 'Gestor Farina',
                  timestamp: getCurrentTimelineTimestamp(),
                  summary: 'Execução recusada pela supervisão na fila de decisões.'.slice(0, 160),
                  details: 'Pedido encerrado como Cancelado a partir da Central de Comando.',
                },
              ],
            }
          : o
      )
    );

    const activityId = `act-rej-${Date.now()}`;
    setActivities((prev) => [
      {
        id: activityId,
        time: getCurrentTimeHHMM(),
        description: `Decisão recusada pela supervisão: ${snapshot.protocol} · ${snapshot.subject}`,
        origin: 'Pedido seu',
        confidence: snapshot.confidence,
        status: 'undone',
        registeredBy: 'Registrado pelo agente',
      },
      ...prev,
    ]);

    showToast(`Recusado: ${snapshot.protocol}`, () => {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? snapshot : o)));
      setActivities((prev) => prev.filter((a) => a.id !== activityId));
    });
  };

  const handleEditDecision = (
    orderId: string,
    newTitle: string,
    newProposedAction: string
  ) => {
    const cleanSubject = newTitle.replace(/^PED-\d{4}-\d+\s*·\s*/i, '').slice(0, 60);
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              subject: cleanSubject,
              objective: newProposedAction.slice(0, 140),
              registeredBy: 'Registrado pelo agente · corrigido por você',
              decisionMeta: o.decisionMeta
                ? { ...o.decisionMeta, proposedAction: newProposedAction }
                : undefined,
            }
          : o
      )
    );
    showToast('Correção salva no pedido.');
  };

  const handleRequestClarification = (orderId: string, question: string) => {
    const snapshot = orders.find((o) => o.id === orderId);
    if (!snapshot) return;

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'Aguardando esclarecimento',
              slaSemaphore: 'pausado',
              slaText: 'pausado · aguarda resposta',
              slaPausedReason: question,
              timeline: [
                ...o.timeline,
                {
                  id: `tl-cla-${Date.now()}`,
                  cycle: o.cycle,
                  type: 'Pergunta enviada',
                  actor: 'Gestor',
                  actorName: 'Gestor Farina',
                  timestamp: getCurrentTimelineTimestamp(),
                  summary: `Esclarecimento solicitado (${o.channel}): ${question}`.slice(0, 160),
                  details: 'Relógio de SLA pausado até o recebimento da resposta.',
                },
              ],
            }
          : o
      )
    );

    showToast(`Esclarecimento enviado e SLA pausado (${snapshot.protocol}).`, () => {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? snapshot : o)));
    });
  };

  const handleEscalateToHuman = (orderId: string, humanName: string) => {
    const snapshot = orders.find((o) => o.id === orderId);
    if (!snapshot) return;

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              assigneeType: 'Humano',
              assigneeName: humanName,
              timeline: [
                ...o.timeline,
                {
                  id: `tl-esc-${Date.now()}`,
                  cycle: o.cycle,
                  type: 'Passo executado',
                  actor: 'Gestor',
                  actorName: 'Gestor Farina',
                  timestamp: getCurrentTimelineTimestamp(),
                  summary: `Pedido escalado para atendimento humano de ${humanName}.`.slice(0, 160),
                  details: 'Responsabilidade transferida mantendo histórico completo do agente.',
                },
              ],
            }
          : o
      )
    );

    showToast(`Pedido escalado para ${humanName}.`, () => {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? snapshot : o)));
    });
  };

  const handleCancelOrder = (orderId: string, reason: string) => {
    const snapshot = orders.find((o) => o.id === orderId);
    if (!snapshot) return;

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'Cancelado',
              slaSemaphore: 'pausado',
              slaText: 'cancelado',
              timeline: [
                ...o.timeline,
                {
                  id: `tl-can-${Date.now()}`,
                  cycle: o.cycle,
                  type: 'Passo executado',
                  actor: 'Gestor',
                  actorName: 'Gestor Farina',
                  timestamp: getCurrentTimelineTimestamp(),
                  summary: `Pedido cancelado: ${reason}`.slice(0, 160),
                  details: `Motivo registrado: ${reason}`,
                },
              ],
            }
          : o
      )
    );

    showToast(`Pedido ${snapshot.protocol} cancelado.`, () => {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? snapshot : o)));
    });
  };

  const handleUndoExecutionChange = (orderId: string, stepId: string) => {
    const snapshot = orders.find((o) => o.id === orderId);
    if (!snapshot) return;

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              executionSteps: o.executionSteps.map((st) =>
                st.id === stepId
                  ? {
                      ...st,
                      status: 'undone',
                      change: st.change ? { ...st.change, undone: true } : undefined,
                    }
                  : st
              ),
              timeline: [
                ...o.timeline,
                {
                  id: `tl-undo-${Date.now()}`,
                  cycle: o.cycle,
                  type: 'Passo executado',
                  actor: 'Gestor',
                  actorName: 'Gestor Farina',
                  timestamp: getCurrentTimelineTimestamp(),
                  summary: 'Alteração do agente desfeita manualmente na aba Execução.'.slice(0, 160),
                  details: 'Valor restaurado para o estado anterior.',
                },
              ],
            }
          : o
      )
    );

    showToast('Alteração do agente desfeita.', () => {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? snapshot : o)));
    });
  };

  const handleAcceptDelivery = (
    orderId: string,
    rating: number,
    comment: string,
    autoTacit = false
  ) => {
    const snapshot = orders.find((o) => o.id === orderId);
    if (!snapshot) return;
    const acceptedType = autoTacit ? 'Aceite automático' : 'Aceito';

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'Concluído',
              slaSemaphore: 'no_prazo',
              slaText: autoTacit ? 'aceite automático' : 'concluído e aceito',
              delivery: {
                ...o.delivery,
                acceptedType,
                rating: autoTacit ? undefined : rating,
                feedbackComment: comment || o.delivery.feedbackComment,
              },
              timeline: [
                ...o.timeline,
                {
                  id: `tl-acc-${Date.now()}`,
                  cycle: o.cycle,
                  type: 'Aceito',
                  actor: autoTacit ? 'Sistema' : 'Gestor',
                  actorName: autoTacit ? 'Aceite automático' : 'Gestor Farina',
                  timestamp: getCurrentTimelineTimestamp(),
                  summary: autoTacit
                    ? 'Concluído por aceite automático após 3 dias úteis sem contestação.'
                    : `Entrega aceita (${rating} estrelas)${comment ? `: ${comment}` : '.'}`.slice(
                        0,
                        160
                      ),
                  details: comment || 'Entrega validada com sucesso.',
                },
              ],
            }
          : o
      )
    );

    showToast(
      autoTacit
        ? `${snapshot.protocol} concluído por Aceite automático.`
        : `Entrega de ${snapshot.protocol} aceita.`,
      () => {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? snapshot : o)));
      }
    );
  };

  const handleRequestAdjustment = (orderId: string, rating: number, comment: string) => {
    const snapshot = orders.find((o) => o.id === orderId);
    if (!snapshot) return;

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'Em execução',
              delivery: {
                ...o.delivery,
                acceptedType: 'Ajuste solicitado',
                rating,
                feedbackComment: comment,
              },
              timeline: [
                ...o.timeline,
                {
                  id: `tl-adj-${Date.now()}`,
                  cycle: o.cycle,
                  type: 'Passo executado',
                  actor: 'Gestor',
                  actorName: 'Gestor Farina',
                  timestamp: getCurrentTimelineTimestamp(),
                  summary: `Ajuste solicitado na entrega: ${comment}`.slice(0, 160),
                  details: 'Pedido retornou para execução do agente sem encerrar o ciclo.',
                },
              ],
            }
          : o
      )
    );

    showToast(`Ajuste solicitado para ${snapshot.protocol}.`, () => {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? snapshot : o)));
    });
  };

  const handleReopenOrder = (orderId: string, comment: string) => {
    const snapshot = orders.find((o) => o.id === orderId);
    if (!snapshot) return;
    const nextCycle = snapshot.cycle + 1;

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              cycle: nextCycle,
              status: 'Reaberto',
              slaSemaphore: 'em_risco',
              slaText: `reaberto · ciclo ${nextCycle}`,
              delivery: {
                ...o.delivery,
                acceptedType: undefined,
                feedbackComment: comment,
              },
              timeline: [
                ...o.timeline,
                {
                  id: `tl-reo-${Date.now()}`,
                  cycle: nextCycle,
                  type: 'Reaberto',
                  actor: 'Gestor',
                  actorName: 'Gestor Farina',
                  timestamp: getCurrentTimelineTimestamp(),
                  summary: `Pedido reaberto (Ciclo ${nextCycle}): ${comment}`.slice(0, 160),
                  details: `Ciclo ${nextCycle} iniciado com preservação integral do ciclo anterior.`,
                },
              ],
            }
          : o
      )
    );

    showToast(`${snapshot.protocol} reaberto no Ciclo ${nextCycle}.`, () => {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? snapshot : o)));
    });
  };

  const handleClassifyIntakeItem = (itemId: string, category: OrderCategory) => {
    const prevIntakeSnapshot = intakeItems;
    const prevOrdersSnapshot = orders;
    const targetItem = intakeItems.find((i) => i.id === itemId);
    if (!targetItem) return;

    const subtype = ORDER_CATEGORIES[category][0];

    setIntakeItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              resolved: true,
              confirmedCategory: category,
            }
          : item
      )
    );

    if (targetItem.linkedProtocols.length > 0) {
      const targetProt = targetItem.linkedProtocols[0];
      setOrders((prev) =>
        prev.map((o) =>
          o.protocol === targetProt
            ? {
                ...o,
                category,
                subtype,
                status: 'Interpretado',
                assigneeType: 'Agente',
                assigneeName: 'Agente GoFAPE',
                confidence: 92,
                registeredBy: 'Registrado pelo agente · corrigido por você',
                timeline: [
                  ...o.timeline,
                  {
                    id: `tl-tri-${Date.now()}`,
                    cycle: o.cycle,
                    type: 'Classificado',
                    actor: 'Gestor',
                    actorName: 'Gestor Farina',
                    timestamp: getCurrentTimelineTimestamp(),
                    summary: `Triagem confirmada em ${category} > ${subtype}. A correção treina o agente.`.slice(
                      0,
                      160
                    ),
                    details: 'Modelo atualizado com exemplo rotulado.',
                  },
                ],
              }
            : o
        )
      );
    } else {
      createFormalOrder(targetItem.fullText);
    }

    showToast(`Categoria "${category}" confirmada. A correção treina o agente.`, () => {
      setIntakeItems(prevIntakeSnapshot);
      setOrders(prevOrdersSnapshot);
    });
  };

  const handleResolveAlert = (alert: OperationalAlertItem) => {
    const alertIndex = alerts.findIndex((a) => a.id === alert.id);
    setAlerts((prev) => prev.filter((a) => a.id !== alert.id));
    handleSubmitCommand(alert.commandText);
    showToast(`Agente acionado para "${alert.title}"`, () => {
      if (alertIndex !== -1) {
        setAlerts((prev) => {
          const copy = [...prev];
          copy.splice(Math.min(alertIndex, copy.length), 0, alert);
          return copy;
        });
      }
    });
  };

  const handleCorrectKpi = (id: string, newValue: string) => {
    setKpisByPeriod((prev) => ({
      ...prev,
      [period]: prev[period].map((kpi) =>
        kpi.id === id
          ? {
              ...kpi,
              value: newValue,
              registeredBy: 'Corrigido por você',
            }
          : kpi
      ),
    }));
    showToast('Indicador corrigido em 1 clique.');
  };

  const handleTriggerBrokerAction = (broker: BrokerRankingItem) => {
    const cmd =
      broker.avgResponseMin > 20
        ? `Redistribuir leads sem resposta de ${broker.name} para corretores com tempo abaixo de 10 min`
        : `Gerar resumo de carteira e metas de ${broker.name}`;
    handleSubmitCommand(cmd);
  };

  const handleCorrectBrokerProduction = (id: string, newProduction: string) => {
    setBrokers((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              production: newProduction,
              registeredBy: 'Corrigido por você',
            }
          : b
      )
    );
    showToast('Produção do corretor atualizada.');
  };

  const handleTriggerOpportunity = (opp: ProactiveOpportunity) => {
    const oppIndex = opportunities.findIndex((o) => o.id === opp.id);
    setOpportunities((prev) => prev.filter((o) => o.id !== opp.id));
    handleSubmitCommand(opp.commandText);
    showToast(`Agente acionado: "${opp.actionLabel}"`, () => {
      if (oppIndex !== -1) {
        setOpportunities((prev) => {
          const copy = [...prev];
          copy.splice(Math.min(oppIndex, copy.length), 0, opp);
          return copy;
        });
      }
    });
  };

  const handleCorrectOpportunity = (id: string, newTitle: string) => {
    setOpportunities((prev) =>
      prev.map((o) =>
        o.id === id
          ? { ...o, title: newTitle, detectedBy: 'Detectado pelo agente · corrigido por você' }
          : o
      )
    );
    showToast('Oportunidade atualizada.');
  };

  const handleUndoActivity = (id: string) => {
    const target = activities.find((a) => a.id === id);
    if (!target) return;
    const previousStatus = target.status;

    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'undone' } : a))
    );
    showToast('Ação do agente desfeita.', () => {
      setActivities((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: previousStatus } : a))
      );
    });
  };

  const handleCorrectActivity = (id: string, newDescription: string) => {
    setActivities((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              description: newDescription,
              registeredBy: 'Registrado pelo agente · corrigido por você',
            }
          : a
      )
    );
    showToast('Registro corrigido.');
  };

  // UNIFIED RULES HANDLERS
  const getModulePrefix = (modulo: string) => {
    if (modulo === 'Financeiro') return 'FIN';
    if (modulo === 'Contratos e Jurídico') return 'JUR';
    if (modulo === 'Locação e Administração') return 'LOC';
    if (modulo === 'Vendas') return 'VEN';
    if (modulo === 'Captação e Marketing') return 'MKT';
    if (modulo === 'Manutenção e Vistorias') return 'MAN';
    if (modulo === 'Global') return 'GLO';
    return 'REG';
  };

  const handleSaveRule = (
    ruleData: Omit<Regra, 'id' | 'versao' | 'criadaPor' | 'atualizadaEm' | 'acionamentos30d'> & {
      id?: string;
    },
    targetStatus: StatusRegra
  ) => {
    const prevRules = rules;
    const prevHistory = globalHistory;
    const timestamp = getCurrentTimelineTimestamp();

    if (ruleData.id) {
      const existing = rules.find((r) => r.id === ruleData.id);
      if (!existing) return;
      const nextVersion = existing.versao + 1;
      const changeSummary = `Regra atualizada para "${MODO_LABELS[ruleData.entao.modo]}" (${targetStatus}).`;

      const updated: Regra = {
        ...existing,
        ...ruleData,
        id: existing.id,
        status: targetStatus,
        versao: nextVersion,
        atualizadaEm: '22/11/2026',
        historico: [
          {
            versao: nextVersion,
            data: timestamp,
            autor: `${perfilRegra} Farina`,
            resumoMudanca: changeSummary,
            antes: `Modo ${MODO_LABELS[existing.entao.modo]} (${existing.status})`,
            depois: `Modo ${MODO_LABELS[ruleData.entao.modo]} (${targetStatus})`,
            justificativa: ruleData.justificativa,
          },
          ...(existing.historico ?? []),
        ],
      };

      setRules((prev) => prev.map((r) => (r.id === existing.id ? updated : r)));
      setGlobalHistory((prev) => [
        {
          id: `hist-${Date.now()}`,
          ruleId: existing.id,
          ruleNome: updated.nome,
          versao: nextVersion,
          quem: `${perfilRegra} Farina`,
          quando: timestamp,
          oQueMudou: changeSummary,
          antes: `Modo ${MODO_LABELS[existing.entao.modo]} (${existing.status})`,
          depois: `Modo ${MODO_LABELS[ruleData.entao.modo]} (${targetStatus})`,
          justificativa: ruleData.justificativa,
        },
        ...prev,
      ]);

      showToast(`Regra ${existing.id} v${nextVersion} salva (${targetStatus}).`, () => {
        setRules(prevRules);
        setGlobalHistory(prevHistory);
      });
    } else {
      const seq = nextRuleSeqRef.current;
      nextRuleSeqRef.current += 1;
      const newId = `${getModulePrefix(ruleData.moduloDono)}-0${seq}`;

      const created: Regra = {
        ...ruleData,
        id: newId,
        status: targetStatus,
        versao: 1,
        criadaPor: `${perfilRegra} Farina`,
        atualizadaEm: '22/11/2026',
        acionamentos30d: 0,
        historico: [
          {
            versao: 1,
            data: timestamp,
            autor: `${perfilRegra} Farina`,
            resumoMudanca: `Criação inicial da regra em "${ruleData.moduloDono}".`,
            antes: 'Sem regra cadastrada',
            depois: `Modo ${MODO_LABELS[ruleData.entao.modo]} (${targetStatus})`,
            justificativa: ruleData.justificativa,
          },
        ],
      };

      setRules((prev) => [created, ...prev]);
      setGlobalHistory((prev) => [
        {
          id: `hist-${Date.now()}`,
          ruleId: newId,
          ruleNome: created.nome,
          versao: 1,
          quem: `${perfilRegra} Farina`,
          quando: timestamp,
          oQueMudou: `Criada nova regra em ${created.moduloDono}`,
          antes: 'Inexistente',
          depois: `${MODO_LABELS[created.entao.modo]} (${targetStatus})`,
          justificativa: created.justificativa,
        },
        ...prev,
      ]);

      showToast(`Regra ${newId} criada (${targetStatus}).`, () => {
        setRules(prevRules);
        setGlobalHistory(prevHistory);
      });
    }
  };

  const handleApproveRule = (ruleId: string) => {
    const prevRules = rules;
    const prevHistory = globalHistory;
    const target = rules.find((r) => r.id === ruleId);
    if (!target) return;
    const nextVersion = target.versao + 1;

    setRules((prev) =>
      prev.map((r) =>
        r.id === ruleId
          ? {
              ...r,
              status: 'ativa',
              versao: nextVersion,
              registradaPor: `Redigida pelo agente, aprovada por ${perfilRegra}`,
              atualizadaEm: '22/11/2026',
            }
          : r
      )
    );
    setGlobalHistory((prev) => [
      {
        id: `hist-apr-${Date.now()}`,
        ruleId: target.id,
        ruleNome: target.nome,
        versao: nextVersion,
        quem: `${perfilRegra} Farina`,
        quando: getCurrentTimelineTimestamp(),
        oQueMudou: 'Regra aprovada e ativada',
        antes: 'Aguardando aprovação',
        depois: 'Ativa',
        justificativa: target.justificativa,
      },
      ...prev,
    ]);

    showToast(`Regra ${ruleId} aprovada e ativada.`, () => {
      setRules(prevRules);
      setGlobalHistory(prevHistory);
    });
  };

  const handleTogglePauseRule = (ruleId: string) => {
    const prevRules = rules;
    const target = rules.find((r) => r.id === ruleId);
    if (!target) return;
    const nextStatus: StatusRegra = target.status === 'ativa' ? 'pausada' : 'ativa';

    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, status: nextStatus } : r))
    );
    showToast(
      nextStatus === 'pausada' ? `Regra ${ruleId} pausada.` : `Regra ${ruleId} reativada.`,
      () => setRules(prevRules)
    );
  };

  const handleRestoreRuleVersion = (ruleId: string, versionNumber: number) => {
    const prevRules = rules;
    const prevHistory = globalHistory;
    const target = rules.find((r) => r.id === ruleId);
    if (!target) return;
    const nextVersion = target.versao + 1;

    setRules((prev) =>
      prev.map((r) =>
        r.id === ruleId
          ? {
              ...r,
              versao: nextVersion,
              atualizadaEm: '22/11/2026',
              historico: [
                {
                  versao: nextVersion,
                  data: getCurrentTimelineTimestamp(),
                  autor: `${perfilRegra} Farina`,
                  resumoMudanca: `Restaurada configuração da versão v${versionNumber}.`,
                  antes: `v${target.versao}`,
                  depois: `Configuração restaurada de v${versionNumber}`,
                  justificativa: 'Reversão preventiva registrada pelo gestor.',
                },
                ...(r.historico ?? []),
              ],
            }
          : r
      )
    );
    setGlobalHistory((prev) => [
      {
        id: `hist-rst-${Date.now()}`,
        ruleId: target.id,
        ruleNome: target.nome,
        versao: nextVersion,
        quem: `${perfilRegra} Farina`,
        quando: getCurrentTimelineTimestamp(),
        oQueMudou: `Restaurada versão v${versionNumber}`,
        antes: `v${target.versao}`,
        depois: `v${nextVersion} (espelho v${versionNumber})`,
        justificativa: 'Restauração rápida de histórico.',
      },
      ...prev,
    ]);

    showToast(`Regra ${ruleId} restaurada para v${versionNumber} (salva como v${nextVersion}).`, () => {
      setRules(prevRules);
      setGlobalHistory(prevHistory);
    });
  };

  const handleUpdateAutonomyCell = (cellId: string, modo: Modo, limiteValor?: number) => {
    const prevMatrix = autonomyMatrix;
    const prevRules = rules;
    const cell = autonomyMatrix.find((c) => c.id === cellId);
    if (!cell) return;

    setAutonomyMatrix((prev) =>
      prev.map((c) => (c.id === cellId ? { ...c, modo, limiteValor } : c))
    );

    const seq = nextRuleSeqRef.current;
    nextRuleSeqRef.current += 1;
    const draftId = `AUT-0${seq}`;

    const draftRule: Regra = {
      id: draftId,
      nome: `Autonomia: ${cell.subtipo}`.slice(0, 60),
      justificativa: `Rascunho gerado pela Matriz de Autonomia (${cell.categoria} > ${cell.subtipo}). Não aplica na hora.`,
      moduloDono: 'Global',
      modulosAfetados: [cell.categoria],
      tipo: 'autonomia',
      quando: [{ campo: 'Subtipo', operador: 'igual a', valor: cell.subtipo }],
      entao: {
        modo,
        parametros: limiteValor !== undefined ? { limiteReais: limiteValor } : undefined,
      },
      excecoes: [],
      aprovador: 'Gestor',
      prazoAprovacaoHoras: 4,
      vigenciaInicio: '2026-11-24',
      status: 'rascunho',
      versao: 1,
      criadaPor: `${perfilRegra} Farina`,
      atualizadaEm: '22/11/2026',
      acionamentos30d: 0,
      registradaPor: `Redigida pelo agente, confirmada por ${perfilRegra}`,
    };

    setRules((prev) => [draftRule, ...prev]);

    showToast(
      `Rascunho ${draftId} criado para "${cell.subtipo}" (${MODO_LABELS[modo]}). Aprovação necessária para ativar.`,
      () => {
        setAutonomyMatrix(prevMatrix);
        setRules(prevRules);
      }
    );
  };

  const handleCreateDraftFromSuggestion = (suggestion: AgentRuleSuggestion) => {
    const prevRules = rules;
    const prevSug = suggestions;
    const seq = nextRuleSeqRef.current;
    nextRuleSeqRef.current += 1;
    const draftId = `${getModulePrefix(suggestion.draftTemplate.moduloDono)}-0${seq}`;

    const draftRule: Regra = {
      id: draftId,
      nome: suggestion.draftTemplate.nome.slice(0, 60),
      justificativa: suggestion.draftTemplate.justificativa.slice(0, 200),
      moduloDono: suggestion.draftTemplate.moduloDono,
      modulosAfetados: suggestion.draftTemplate.modulosAfetados,
      tipo: suggestion.draftTemplate.tipo,
      quando: suggestion.draftTemplate.quando,
      entao: suggestion.draftTemplate.entao,
      excecoes: suggestion.draftTemplate.excecoes,
      aprovador: suggestion.draftTemplate.aprovador,
      prazoAprovacaoHoras: suggestion.draftTemplate.prazoAprovacaoHoras,
      vigenciaInicio: '2026-11-24',
      status: 'rascunho',
      versao: 1,
      criadaPor: `${perfilRegra} (via Sugestão IA)`,
      atualizadaEm: '22/11/2026',
      acionamentos30d: 0,
      registradaPor: `Redigida pelo agente, aguardando confirmação de ${perfilRegra}`,
    };

    setRules((prev) => [draftRule, ...prev]);
    setSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id));
    setSelectedRuleId(draftId);

    showToast(`Rascunho ${draftId} criado para revisão humana (não ativado).`, () => {
      setRules(prevRules);
      setSuggestions(prevSug);
      setSelectedRuleId(null);
    });
  };

  const handleDismissSuggestion = (suggestionId: string) => {
    const prevSug = suggestions;
    setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId));
    showToast('Sugestão dispensada.', () => setSuggestions(prevSug));
  };

  const handleProposeChangeToOwner = (sourceRule: Regra, targetModule: string) => {
    const prevRules = rules;
    const seq = nextRuleSeqRef.current;
    nextRuleSeqRef.current += 1;
    const draftId = `${getModulePrefix(sourceRule.moduloDono)}-0${seq}`;

    const proposedDraft: Regra = {
      ...sourceRule,
      id: draftId,
      nome: `Proposta p/ ${sourceRule.id}: ${sourceRule.nome}`.slice(0, 60),
      justificativa: `Proposta enviada pelo módulo ${targetModule} para ajuste de ${sourceRule.id}.`.slice(
        0,
        200
      ),
      status: 'rascunho',
      versao: 1,
      criadaPor: `${targetModule} (${perfilRegra})`,
      atualizadaEm: '22/11/2026',
      acionamentos30d: 0,
      registradaPor: `Proposta redigida por ${targetModule}, aguardando ${sourceRule.moduloDono}`,
    };

    setRules((prev) => [proposedDraft, ...prev]);
    showToast(
      `Rascunho ${draftId} criado para avaliação do módulo ${sourceRule.moduloDono}.`,
      () => setRules(prevRules)
    );
  };

  const handleStartFromTemplate = (modulo: string) => {
    const prevRules = rules;
    const templates = CONSERVATIVE_STARTER_TEMPLATES[modulo] ?? [
      {
        nome: `Aprovação prévia em ações sensíveis de ${modulo}`.slice(0, 60),
        justificativa: `Modelo conservador inicial para ${modulo}: agente prepara e pede validação humana.`,
        tipo: 'autonomia' as const,
        quando: [{ campo: 'Módulo', operador: 'igual a', valor: modulo }],
        entao: { modo: 'aprovacao' as const },
      },
    ];

    const createdRules: Regra[] = templates.map((tpl) => {
      const seq = nextRuleSeqRef.current;
      nextRuleSeqRef.current += 1;
      return {
        id: `${getModulePrefix(modulo)}-0${seq}`,
        nome: tpl.nome.slice(0, 60),
        justificativa: tpl.justificativa.slice(0, 200),
        moduloDono: modulo,
        modulosAfetados: [modulo],
        tipo: tpl.tipo,
        quando: tpl.quando,
        entao: tpl.entao,
        excecoes: [],
        aprovador: 'Gestor',
        prazoAprovacaoHoras: 8,
        vigenciaInicio: '2026-11-24',
        status: 'rascunho',
        versao: 1,
        criadaPor: `${perfilRegra} Farina`,
        atualizadaEm: '22/11/2026',
        acionamentos30d: 0,
        registradaPor: `Modelo conservador redigido pelo agente, revisado por ${perfilRegra}`,
      };
    });

    setRules((prev) => [...createdRules, ...prev]);
    showToast(`Pacote conservador adicionado como rascunho em ${modulo}.`, () =>
      setRules(prevRules)
    );
  };

  const handleOpenOrderByProtocol = (protocol: string) => {
    const match = orders.find((o) => o.protocol === protocol);
    if (!match) {
      showToast(`Protocolo ${protocol} não encontrado na amostra recente.`);
      return;
    }
    setSelectedRuleId(null);
    setRuleEditorState({ isOpen: false, initialRule: null });
    setPendingOrderToOpenId(match.id);
    setActiveItem('agente-ia');
  };

  // Dynamically evaluate Home KPI semaphores using active rules LOC-006 (vacancy) and GLO-003 (others)
  const currentKpis = useMemo(() => {
    const baseKpis = kpisByPeriod[period];
    const kpiRule = rules.find((r) => r.id === 'GLO-003' && r.status === 'ativa');
    const loc006Rule = rules.find((r) => r.id === 'LOC-006' && r.status === 'ativa');
    if (!kpiRule?.entao.parametros && !loc006Rule?.entao.parametros) return baseKpis;

    const vacVerde = Number(
      loc006Rule?.entao.parametros?.vacanciaVerdeMax ??
        kpiRule?.entao.parametros?.vacanciaVerdeMax ??
        5
    );
    const vacVerm = Number(
      loc006Rule?.entao.parametros?.vacanciaVermelhaMin ??
        kpiRule?.entao.parametros?.vacanciaVermelhaMin ??
        8
    );
    const vacRuleLabel = loc006Rule ? 'LOC-006' : 'GLO-003';
    const inadVerde = Number(kpiRule?.entao.parametros?.inadimplenciaVerdeMax ?? 4);
    const inadVerm = Number(kpiRule?.entao.parametros?.inadimplenciaVermelhaMin ?? 7);

    return baseKpis.map((kpi) => {
      const numericVal = parseFloat(kpi.value.replace(',', '.').replace(/[^0-9.]/g, ''));
      if (Number.isNaN(numericVal)) return kpi;

      if (kpi.id === 'vacancia') {
        const sem: KpiMetricItem['semaphore'] =
          numericVal <= vacVerde ? 'verde' : numericVal > vacVerm ? 'vermelho' : 'ambar';
        return {
          ...kpi,
          semaphore: sem,
          semaphoreLabel:
            sem === 'verde' ? 'Saudável' : sem === 'vermelho' ? 'Crítico' : 'Atenção',
          semaphoreRule: `Regra ${vacRuleLabel}: ≤ ${vacVerde}% (crítico > ${vacVerm}%)`,
        };
      }

      if (kpi.id === 'inadimplencia') {
        const sem: KpiMetricItem['semaphore'] =
          numericVal <= inadVerde ? 'verde' : numericVal > inadVerm ? 'vermelho' : 'ambar';
        return {
          ...kpi,
          semaphore: sem,
          semaphoreLabel:
            sem === 'verde' ? 'Saudável' : sem === 'vermelho' ? 'Crítico' : 'Atenção',
          semaphoreRule: `Regra GLO-003: ≤ ${inadVerde}% (crítico > ${inadVerm}%)`,
        };
      }

      return kpi;
    });
  }, [kpisByPeriod, period, rules]);

  const selectedKpi = currentKpis.find((k) => k.id === selectedKpiId) ?? null;
  const selectedRule = rules.find((r) => r.id === selectedRuleId) ?? null;

  return (
    <div className="min-h-screen flex bg-[#F8F9FB] text-slate-900">
      <Sidebar
        activeItem={activeItem}
        onSelectItem={setActiveItem}
        workspaces={WORKSPACES}
        activeWorkspace={activeWorkspace}
        onSelectWorkspace={setActiveWorkspace}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <TopBar
          workspaceShortName={activeWorkspace.shortName}
          breadcrumbCurrent={getBreadcrumbLabel(activeItem)}
          notifications={notifications}
          onMarkAllRead={handleMarkAllRead}
          onNavigate={setActiveItem}
          onSendAgentCommand={(prompt) => {
            handleSubmitCommand(prompt);
          }}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        <MainContent
          activeItem={activeItem}
          workspaceShortName={activeWorkspace.shortName}
          period={period}
          onChangePeriod={handleChangePeriod}
          isLoading={isLoading}
          decisions={decisions}
          alerts={alerts}
          kpis={currentKpis}
          monthlyTrends={MONTHLY_TRENDS_12M}
          funnelStages={FUNNEL_BY_PERIOD[period]}
          brokers={brokers}
          opportunities={opportunities}
          health={HEALTH_BY_PERIOD[period]}
          activities={activities}
          intake={INTAKE_BY_PERIOD[period]}
          orders={orders}
          intakeItems={intakeItems}
          initialOrdersBaseline={initialOrdersBaseline}
          onCreateOrder={handleCreateOrderFromModal}
          onSaveOrderInterpretation={handleSaveOrderInterpretation}
          onApproveOrder={handleApproveOrder}
          onRequestClarification={handleRequestClarification}
          onEscalateToHuman={handleEscalateToHuman}
          onCancelOrder={handleCancelOrder}
          onUndoExecutionChange={handleUndoExecutionChange}
          onAcceptDelivery={handleAcceptDelivery}
          onRequestAdjustment={handleRequestAdjustment}
          onReopenOrder={handleReopenOrder}
          onClassifyIntakeItem={handleClassifyIntakeItem}
          onSubmitCommand={handleSubmitCommand}
          onApproveDecision={handleApproveOrder}
          onRejectDecision={handleRejectDecision}
          onEditDecision={handleEditDecision}
          onResolveAlert={handleResolveAlert}
          onSelectKpi={(kpi) => setSelectedKpiId(kpi.id)}
          onCorrectKpi={handleCorrectKpi}
          onTriggerBrokerAction={handleTriggerBrokerAction}
          onCorrectBrokerProduction={handleCorrectBrokerProduction}
          onTriggerOpportunity={handleTriggerOpportunity}
          onCorrectOpportunity={handleCorrectOpportunity}
          onUndoActivity={handleUndoActivity}
          onCorrectActivity={handleCorrectActivity}
          onReturnToPainel={() => setActiveItem('painel')}
          onOpenRuleById={(ruleId) => setSelectedRuleId(ruleId)}
          externalSelectedOrderId={pendingOrderToOpenId}
          onClearExternalSelectedOrderId={() => setPendingOrderToOpenId(null)}
          rules={rules}
          initialRulesBaseline={initialRulesBaseline}
          autonomyMatrix={autonomyMatrix}
          suggestions={suggestions}
          globalHistory={globalHistory}
          perfilRegra={perfilRegra}
          onChangePerfilRegra={setPerfilRegra}
          initialRulesModuleFilter={rulesInitialModuleFilter}
          onClearInitialRulesModuleFilter={() => setRulesInitialModuleFilter(null)}
          onSelectRule={(rule) => setSelectedRuleId(rule.id)}
          onEditRule={(rule) =>
            setRuleEditorState({ isOpen: true, initialRule: rule, presetModule: rule.moduloDono })
          }
          onNewRule={(presetModule) =>
            setRuleEditorState({ isOpen: true, initialRule: null, presetModule })
          }
          onNewReajusteRuleDraft={() =>
            setRuleEditorState({
              isOpen: true,
              presetModule: 'Contratos e Jurídico',
              initialRule: {
                id: '',
                nome: 'Reajuste anual por índice contratual (IGP-M / IPCA)',
                justificativa:
                  'Definir alçada do agente para calcular e aplicar reajustes anuais previstos em contrato após conferência do índice oficial.',
                moduloDono: 'Contratos e Jurídico',
                modulosAfetados: ['Contratos e Jurídico', 'Financeiro'],
                tipo: 'alcada',
                quando: [
                  { campo: 'Aniversário contratual', operador: 'igual a', valor: '12 meses' },
                  { campo: 'Índice', operador: 'em', valor: 'IGP-M, IPCA' },
                ],
                entao: { modo: 'aprovacao' },
                excecoes: [],
                aprovador: 'Gestor',
                prazoAprovacaoHoras: 8,
                vigenciaInicio: '2026-11-23',
                status: 'rascunho',
                versao: 1,
                criadaPor: `${perfilRegra} Farina`,
                atualizadaEm: '22/11/2026',
                acionamentos30d: 0,
              },
            })
          }
          onNewConcessaoRuleDraft={() =>
            setRuleEditorState({
              isOpen: true,
              presetModule: 'Locação e Administração',
              initialRule: {
                id: '',
                nome: 'Concessões na negociação (carência e desconto)',
                justificativa:
                  'Definir limites e alçadas do agente para aceitar ou submeter propostas com carência inicial ou desconto no 1º aluguel após consulta ao proprietário.',
                moduloDono: 'Locação e Administração',
                modulosAfetados: ['Locação e Administração', 'Financeiro', 'Contratos e Jurídico'],
                tipo: 'alcada',
                quando: [
                  { campo: 'Concessão na proposta', operador: 'igual a', valor: 'Sim' },
                  { campo: 'Carência máxima dias', operador: 'menor ou igual a', valor: 30 },
                ],
                entao: { modo: 'aprovacao' },
                excecoes: [],
                aprovador: 'Gestor',
                prazoAprovacaoHoras: 4,
                vigenciaInicio: '2026-11-23',
                status: 'rascunho',
                versao: 1,
                criadaPor: `${perfilRegra} Farina`,
                atualizadaEm: '22/11/2026',
                acionamentos30d: 0,
              },
            })
          }
          onNewReembolsoRuleDraft={() =>
            setRuleEditorState({
              isOpen: true,
              presetModule: 'Manutenção e Vistorias',
              initialRule: {
                id: '',
                nome: 'Reembolso de reparo feito pelo inquilino',
                justificativa:
                  'Definir alçada e exigência de nota fiscal + autorização prévia antes de abater ou reembolsar reparo executado diretamente pelo inquilino.',
                moduloDono: 'Manutenção e Vistorias',
                modulosAfetados: ['Manutenção e Vistorias', 'Financeiro'],
                tipo: 'alcada',
                quando: [
                  { campo: 'Solicitante', operador: 'igual a', valor: 'Inquilino' },
                  { campo: 'Tipo de pedido', operador: 'igual a', valor: 'Reembolso de reparo' },
                ],
                entao: { modo: 'aprovacao' },
                excecoes: [],
                aprovador: 'Gestor',
                prazoAprovacaoHoras: 8,
                vigenciaInicio: '2026-11-23',
                status: 'rascunho',
                versao: 1,
                criadaPor: `${perfilRegra} Farina`,
                atualizadaEm: '22/11/2026',
                acionamentos30d: 0,
              },
            })
          }
          onUpdateAutonomyCell={handleUpdateAutonomyCell}
          onCreateDraftFromSuggestion={handleCreateDraftFromSuggestion}
          onDismissSuggestion={handleDismissSuggestion}
          onRestoreFromGlobalHistory={handleRestoreRuleVersion}
          onProposeChangeToOwner={handleProposeChangeToOwner}
          onStartFromTemplate={handleStartFromTemplate}
          onViewModuleRulesInCentral={(modulo) => {
            setRulesInitialModuleFilter(modulo);
            setActiveItem('regras-agente');
          }}
          onOpenOrderInCenter={(orderId) => {
            setPendingOrderToOpenId(orderId);
            setActiveItem('agente-ia');
          }}
          onNavigateModule={setActiveItem}
          onCreateFinancialAgentOrder={handleCreateFinancialAgentOrder}
          onShowToast={showToast}
        />
      </div>

      <KpiDetailDrawer
        kpi={selectedKpi}
        onClose={() => setSelectedKpiId(null)}
        onExecuteSuggestedCommand={(cmd) => handleSubmitCommand(cmd)}
      />

      <RuleDetailDrawer
        rule={selectedRule}
        perfil={perfilRegra}
        onClose={() => setSelectedRuleId(null)}
        onEditRule={(rule) =>
          setRuleEditorState({ isOpen: true, initialRule: rule, presetModule: rule.moduloDono })
        }
        onApproveRule={handleApproveRule}
        onTogglePauseRule={handleTogglePauseRule}
        onRestoreVersion={handleRestoreRuleVersion}
        onOpenOrderByProtocol={handleOpenOrderByProtocol}
      />

      <RuleEditorDrawer
        isOpen={ruleEditorState.isOpen}
        initialRule={ruleEditorState.initialRule}
        presetModule={ruleEditorState.presetModule}
        perfil={perfilRegra}
        allRules={rules}
        onClose={() => setRuleEditorState({ isOpen: false, initialRule: null })}
        onSaveRule={handleSaveRule}
        onInspectOrderProtocol={handleOpenOrderByProtocol}
      />

      <ToastBanner toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
