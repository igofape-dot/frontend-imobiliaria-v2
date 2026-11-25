import { SIDEBAR_NAV_ITEMS, type NavItemId } from '../data/navigation';
import type {
  AgentActivityItem,
  AgentHealthStats,
  BrokerRankingItem,
  DecisionCardItem,
  FunnelStageItem,
  IntakeStats,
  KpiMetricItem,
  MonthlyTrendPoint,
  OperationalAlertItem,
  ProactiveOpportunity,
  TimePeriod,
} from '../data/commandCenterData';
import { AgentCommandBar } from './AgentCommandBar';
import { DecisionQueue } from './DecisionQueue';
import { OperationalAlertsCard } from './OperationalAlertsCard';
import { KpiGrid } from './KpiGrid';
import { TrendsAndFunnelRow } from './TrendsAndFunnelRow';
import { BrokerRankingCard } from './BrokerRankingCard';
import { OpportunitiesPanel } from './OpportunitiesPanel';
import { AgentHealthCard } from './AgentHealthCard';
import { AgentActivityFeed } from './AgentActivityFeed';
import { ProcessingIntakeStrip } from './ProcessingIntakeStrip';
import { AgentOrdersPage } from './agent-center/AgentOrdersPage';
import { AgentRulesPage } from './rules/AgentRulesPage';
import { FinanceiroPage } from './financeiro/FinanceiroPage';
import { ContratosPage } from './contratos/ContratosPage';
import { LocacaoPage } from './locacao/LocacaoPage';
import { ManutencaoPage } from './manutencao/ManutencaoPage';
import { GestorPage } from './gestor/GestorPage';
import { ModuleWorkspacePage } from './ModuleWorkspacePage';
import type {
  AgentOrder,
  IntakeMessageItem,
  OrderCategory,
  OrderLinkChip,
  OrderPriority,
} from '../data/agentOrdersData';
import type { PolicyEvaluationResult } from '../data/financeiroData';
import type {
  AgentRuleSuggestion,
  AutonomyMatrixCell,
  GlobalHistoryItem,
  Modo,
  PerfilRegra,
  Regra,
} from '../data/rulesData';

interface MainContentProps {
  activeItem: NavItemId;
  workspaceShortName: string;
  period: TimePeriod;
  onChangePeriod: (period: TimePeriod) => void;
  isLoading: boolean;
  decisions: DecisionCardItem[];
  alerts: OperationalAlertItem[];
  kpis: KpiMetricItem[];
  monthlyTrends: MonthlyTrendPoint[];
  funnelStages: FunnelStageItem[];
  brokers: BrokerRankingItem[];
  opportunities: ProactiveOpportunity[];
  health: AgentHealthStats;
  activities: AgentActivityItem[];
  intake: IntakeStats;
  orders: AgentOrder[];
  intakeItems: IntakeMessageItem[];
  initialOrdersBaseline: {
    abertos: number;
    emRisco: number;
    atrasados: number;
    aguardandoVoce: number;
    aguardandoAceite: number;
    concluidosHoje: number;
  };
  onCreateOrder: (rawText: string, attachmentName?: string) => AgentOrder;
  onSaveOrderInterpretation: (
    orderId: string,
    updates: {
      subject: string;
      objective: string;
      narrative: string;
      category: OrderCategory;
      subtype: string;
      priority: OrderPriority;
    }
  ) => void;
  onApproveOrder: (orderId: string) => void;
  onRequestClarification: (orderId: string, question: string) => void;
  onEscalateToHuman: (orderId: string, humanName: string) => void;
  onCancelOrder: (orderId: string, reason: string) => void;
  onUndoExecutionChange: (orderId: string, stepId: string) => void;
  onAcceptDelivery: (
    orderId: string,
    rating: number,
    comment: string,
    autoTacit?: boolean
  ) => void;
  onRequestAdjustment: (orderId: string, rating: number, comment: string) => void;
  onReopenOrder: (orderId: string, comment: string) => void;
  onClassifyIntakeItem: (itemId: string, category: OrderCategory) => void;
  onSubmitCommand: (commandText: string, attachmentName?: string) => void;
  onApproveDecision: (id: string) => void;
  onRejectDecision: (id: string) => void;
  onEditDecision: (id: string, newTitle: string, newProposedAction: string) => void;
  onResolveAlert: (alert: OperationalAlertItem) => void;
  onSelectKpi: (kpi: KpiMetricItem) => void;
  onCorrectKpi: (id: string, newValue: string) => void;
  onTriggerBrokerAction: (broker: BrokerRankingItem) => void;
  onCorrectBrokerProduction: (id: string, newProduction: string) => void;
  onTriggerOpportunity: (opportunity: ProactiveOpportunity) => void;
  onCorrectOpportunity: (id: string, newTitle: string) => void;
  onUndoActivity: (id: string) => void;
  onCorrectActivity: (id: string, newDescription: string) => void;
  onReturnToPainel: () => void;
  // Order <-> Rule cross-navigation
  onOpenRuleById: (ruleId: string) => void;
  externalSelectedOrderId: string | null;
  onClearExternalSelectedOrderId: () => void;
  // Single rules store & handlers
  rules: Regra[];
  initialRulesBaseline: {
    ativas: number;
    rascunhos: number;
    emAprovacao: number;
    conflitos: number;
  };
  autonomyMatrix: AutonomyMatrixCell[];
  suggestions: AgentRuleSuggestion[];
  globalHistory: GlobalHistoryItem[];
  perfilRegra: PerfilRegra;
  onChangePerfilRegra: (perfil: PerfilRegra) => void;
  initialRulesModuleFilter: string | null;
  onClearInitialRulesModuleFilter: () => void;
  onSelectRule: (rule: Regra) => void;
  onEditRule: (rule: Regra) => void;
  onNewRule: (presetModule?: string) => void;
  onNewReajusteRuleDraft: () => void;
  onNewConcessaoRuleDraft: () => void;
  onNewReembolsoRuleDraft: () => void;
  onUpdateAutonomyCell: (cellId: string, modo: Modo, limiteValor?: number) => void;
  onCreateDraftFromSuggestion: (suggestion: AgentRuleSuggestion) => void;
  onDismissSuggestion: (suggestionId: string) => void;
  onRestoreFromGlobalHistory: (ruleId: string, versao: number) => void;
  onProposeChangeToOwner: (sourceRule: Regra, targetModule: string) => void;
  onStartFromTemplate: (modulo: string) => void;
  onViewModuleRulesInCentral: (modulo: string) => void;
  onOpenOrderInCenter: (orderId: string) => void;
  onNavigateModule: (navId: NavItemId) => void;
  onCreateFinancialAgentOrder: (payload: {
    promptText: string;
    categoria?: OrderCategory;
    subtipo: string;
    evaluation: PolicyEvaluationResult;
    links?: OrderLinkChip[];
  }) => AgentOrder;
  onShowToast: (text: string, onUndo?: () => void) => void;
}

function getModuleTitle(itemId: NavItemId): string {
  for (const item of SIDEBAR_NAV_ITEMS) {
    if (item.subItems) {
      const match = item.subItems.find((s) => s.id === itemId);
      if (match) return match.label;
    } else if (item.id === itemId) {
      return item.label;
    }
  }
  return 'Painel';
}

function getGreetingByHour(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

const PERIOD_OPTIONS: { id: TimePeriod; label: string }[] = [
  { id: 'hoje', label: 'Hoje' },
  { id: '7d', label: '7 dias' },
  { id: '30d', label: '30 dias' },
  { id: 'mes', label: 'Mês' },
  { id: '12m', label: '12 meses' },
];

export function MainContent({
  activeItem,
  workspaceShortName,
  period,
  onChangePeriod,
  isLoading,
  decisions,
  alerts,
  kpis,
  monthlyTrends,
  funnelStages,
  brokers,
  opportunities,
  health,
  activities,
  intake,
  orders,
  intakeItems,
  initialOrdersBaseline,
  onCreateOrder,
  onSaveOrderInterpretation,
  onApproveOrder,
  onRequestClarification,
  onEscalateToHuman,
  onCancelOrder,
  onUndoExecutionChange,
  onAcceptDelivery,
  onRequestAdjustment,
  onReopenOrder,
  onClassifyIntakeItem,
  onSubmitCommand,
  onApproveDecision,
  onRejectDecision,
  onEditDecision,
  onResolveAlert,
  onSelectKpi,
  onCorrectKpi,
  onTriggerBrokerAction,
  onCorrectBrokerProduction,
  onTriggerOpportunity,
  onCorrectOpportunity,
  onUndoActivity,
  onCorrectActivity,
  onReturnToPainel,
  onOpenRuleById,
  externalSelectedOrderId,
  onClearExternalSelectedOrderId,
  rules,
  initialRulesBaseline,
  autonomyMatrix,
  suggestions,
  globalHistory,
  perfilRegra,
  onChangePerfilRegra,
  initialRulesModuleFilter,
  onClearInitialRulesModuleFilter,
  onSelectRule,
  onEditRule,
  onNewRule,
  onNewReajusteRuleDraft,
  onNewConcessaoRuleDraft,
  onNewReembolsoRuleDraft,
  onUpdateAutonomyCell,
  onCreateDraftFromSuggestion,
  onDismissSuggestion,
  onRestoreFromGlobalHistory,
  onProposeChangeToOwner,
  onStartFromTemplate,
  onViewModuleRulesInCentral,
  onOpenOrderInCenter,
  onNavigateModule,
  onCreateFinancialAgentOrder,
  onShowToast,
}: MainContentProps) {
  const runningCount = activities.filter((a) => a.status === 'running').length;

  const formattedToday = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
  const capitalizedToday =
    formattedToday.charAt(0).toUpperCase() + formattedToday.slice(1);

  if (activeItem === 'agente-ia') {
    return (
      <AgentOrdersPage
        orders={orders}
        intakeItems={intakeItems}
        initialOrdersBaseline={initialOrdersBaseline}
        isLoading={isLoading}
        onCreateOrder={onCreateOrder}
        onSaveInterpretation={onSaveOrderInterpretation}
        onApproveOrder={onApproveOrder}
        onRequestClarification={onRequestClarification}
        onEscalateToHuman={onEscalateToHuman}
        onCancelOrder={onCancelOrder}
        onUndoExecutionChange={onUndoExecutionChange}
        onAcceptDelivery={onAcceptDelivery}
        onRequestAdjustment={onRequestAdjustment}
        onReopenOrder={onReopenOrder}
        onClassifyIntakeItem={onClassifyIntakeItem}
        onOpenRuleById={onOpenRuleById}
        externalSelectedOrderId={externalSelectedOrderId}
        onClearExternalSelectedOrderId={onClearExternalSelectedOrderId}
      />
    );
  }

  if (activeItem === 'gestor') {
    return (
      <GestorPage
        rules={rules}
        perfil={perfilRegra}
        isLoading={isLoading}
        onChangePerfil={onChangePerfilRegra}
        onCreateAgentOrder={onCreateFinancialAgentOrder}
        onOpenOrderInCenter={onOpenOrderInCenter}
        onOpenRuleById={onOpenRuleById}
        onNavigateModule={onNavigateModule}
      />
    );
  }

  if (activeItem === 'regras-agente') {
    return (
      <AgentRulesPage
        rules={rules}
        initialRulesBaseline={initialRulesBaseline}
        autonomyMatrix={autonomyMatrix}
        suggestions={suggestions}
        globalHistory={globalHistory}
        perfil={perfilRegra}
        onChangePerfil={onChangePerfilRegra}
        initialModuleFilter={initialRulesModuleFilter}
        onClearInitialModuleFilter={onClearInitialRulesModuleFilter}
        isLoading={isLoading}
        onSelectRule={onSelectRule}
        onNewRule={onNewRule}
        onUpdateAutonomyCell={onUpdateAutonomyCell}
        onCreateDraftFromSuggestion={onCreateDraftFromSuggestion}
        onDismissSuggestion={onDismissSuggestion}
        onRestoreFromGlobalHistory={onRestoreFromGlobalHistory}
      />
    );
  }

  if (activeItem === 'painel') {
    return (
      <main className="flex-1 bg-[#F8F9FB] px-4 sm:px-6 lg:px-7 py-5 sm:py-6">
        <div className="max-w-[1440px] mx-auto space-y-6">
          {/* 1. CABEÇALHO */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div>
              <h1 className="text-[22px] sm:text-[24px] font-bold text-slate-900 tracking-tight leading-tight">
                {getGreetingByHour()}, {workspaceShortName}
              </h1>
              <p className="text-[13px] text-slate-500 mt-1">
                {capitalizedToday} · Central de comando do gestor
              </p>
            </div>

            <div
              role="group"
              aria-label="Período de análise"
              className="inline-flex flex-wrap items-center p-1 rounded-xl bg-white border border-slate-200/90 self-start md:self-auto"
            >
              {PERIOD_OPTIONS.map((opt) => {
                const isSelected = period === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChangePeriod(opt.id)}
                    aria-pressed={isSelected}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors whitespace-nowrap ${
                      isSelected
                        ? 'bg-[#2563EB] text-white'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. BARRA DE COMANDO DO AGENTE (destaque máximo) */}
          <AgentCommandBar onSubmitCommand={onSubmitCommand} isBusy={runningCount > 2} />

          {/* 3. CAMADA 1 — "PRECISA DE VOCÊ HOJE" (2 colunas, 2/3 + 1/3) */}
          <section aria-labelledby="layer-precisa-de-voce-hoje" className="space-y-3">
            <h2
              id="layer-precisa-de-voce-hoje"
              className="text-[13px] font-bold uppercase tracking-wider text-slate-500"
            >
              Precisa de você hoje
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              <div className="lg:col-span-8">
                <DecisionQueue
                  decisions={decisions}
                  isLoading={isLoading}
                  onApprove={onApproveDecision}
                  onReject={onRejectDecision}
                  onEditSave={onEditDecision}
                />
              </div>

              <div className="lg:col-span-4">
                <OperationalAlertsCard
                  alerts={alerts}
                  isLoading={isLoading}
                  onResolveAlert={onResolveAlert}
                />
              </div>
            </div>
          </section>

          {/* 4. CAMADA 2 — "COMO ESTOU AGORA" (grade 4x2 de 8 KPIs) */}
          <KpiGrid
            kpis={kpis}
            isLoading={isLoading}
            onSelectKpi={onSelectKpi}
            onCorrectKpi={onCorrectKpi}
          />

          {/* 5. CAMADA 3 — "PARA ONDE ESTOU INDO" */}
          <section aria-labelledby="layer-para-onde-estou-indo" className="space-y-5">
            <h2
              id="layer-para-onde-estou-indo"
              className="text-[13px] font-bold uppercase tracking-wider text-slate-500"
            >
              Para onde estou indo
            </h2>

            {/* Linha A (2/3 + 1/3): Gráfico 12 meses + Funil comercial */}
            <TrendsAndFunnelRow
              monthlyTrends={monthlyTrends}
              funnelStages={funnelStages}
              isLoading={isLoading}
              onTriggerAgentCommand={onSubmitCommand}
            />

            {/* Linha B (3 colunas): Ranking de corretores + Oportunidades do agente + Saúde do agente */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
              <BrokerRankingCard
                brokers={brokers}
                isLoading={isLoading}
                onTriggerBrokerAction={onTriggerBrokerAction}
                onCorrectBrokerProduction={onCorrectBrokerProduction}
              />

              <OpportunitiesPanel
                opportunities={opportunities}
                isLoading={isLoading}
                onTriggerOpportunity={onTriggerOpportunity}
                onCorrectOpportunity={onCorrectOpportunity}
              />

              <AgentHealthCard
                health={health}
                waitingCount={decisions.length}
                runningCount={runningCount}
                isLoading={isLoading}
              />
            </div>

            {/* Linha C (2/3 + 1/3): Atividade do agente + Entradas em processamento */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              <div className="lg:col-span-8">
                <AgentActivityFeed
                  activities={activities}
                  isLoading={isLoading}
                  onUndoActivity={onUndoActivity}
                  onCorrectActivity={onCorrectActivity}
                />
              </div>

              <div className="lg:col-span-4">
                <ProcessingIntakeStrip
                  intake={intake}
                  isLoading={isLoading}
                  onTriggerIntakeAudit={() =>
                    onSubmitCommand(
                      'Priorizar processamento dos documentos e mensagens pendentes na fila'
                    )
                  }
                />
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (activeItem === 'financeiro') {
    return (
      <FinanceiroPage
        workspaceShortName={workspaceShortName}
        orders={orders}
        rules={rules}
        perfil={perfilRegra}
        isLoading={isLoading}
        onChangePerfil={onChangePerfilRegra}
        onApproveOrder={onApproveOrder}
        onRejectOrder={onRejectDecision}
        onEditOrderDecision={onEditDecision}
        onCreateFinancialAgentOrder={onCreateFinancialAgentOrder}
        onOpenOrderInCenter={onOpenOrderInCenter}
        onOpenRuleById={onOpenRuleById}
        onSelectRule={onSelectRule}
        onEditRule={onEditRule}
        onNewRuleInModule={(mod) => onNewRule(mod)}
        onProposeChangeToOwner={onProposeChangeToOwner}
        onStartFromTemplate={onStartFromTemplate}
        onViewInCentral={onViewModuleRulesInCentral}
        onShowToast={onShowToast}
      />
    );
  }

  if (activeItem === 'contratos-juridico') {
    return (
      <ContratosPage
        orders={orders}
        rules={rules}
        perfil={perfilRegra}
        isLoading={isLoading}
        onChangePerfil={onChangePerfilRegra}
        onApproveOrder={onApproveOrder}
        onRejectOrder={onRejectDecision}
        onEditOrderDecision={onEditDecision}
        onCreateAgentOrder={onCreateFinancialAgentOrder}
        onOpenOrderInCenter={onOpenOrderInCenter}
        onOpenRuleById={onOpenRuleById}
        onSelectRule={onSelectRule}
        onEditRule={onEditRule}
        onNewRuleInModule={(mod) => onNewRule(mod)}
        onNewReajusteRuleDraft={onNewReajusteRuleDraft}
        onProposeChangeToOwner={onProposeChangeToOwner}
        onStartFromTemplate={onStartFromTemplate}
        onViewInCentral={onViewModuleRulesInCentral}
        onShowToast={onShowToast}
      />
    );
  }

  if (activeItem === 'locacao-administracao') {
    return (
      <LocacaoPage
        orders={orders}
        rules={rules}
        perfil={perfilRegra}
        isLoading={isLoading}
        onChangePerfil={onChangePerfilRegra}
        onApproveOrder={onApproveOrder}
        onRejectOrder={onRejectDecision}
        onEditOrderDecision={onEditDecision}
        onCreateAgentOrder={onCreateFinancialAgentOrder}
        onOpenOrderInCenter={onOpenOrderInCenter}
        onOpenRuleById={onOpenRuleById}
        onSelectRule={onSelectRule}
        onEditRule={onEditRule}
        onNewRuleInModule={(mod) => onNewRule(mod)}
        onNewConcessaoRuleDraft={onNewConcessaoRuleDraft}
        onProposeChangeToOwner={onProposeChangeToOwner}
        onStartFromTemplate={onStartFromTemplate}
        onViewInCentral={onViewModuleRulesInCentral}
        onNavigateModule={onNavigateModule}
        onShowToast={onShowToast}
      />
    );
  }

  if (activeItem === 'manutencao-vistorias') {
    return (
      <ManutencaoPage
        orders={orders}
        rules={rules}
        perfil={perfilRegra}
        isLoading={isLoading}
        onChangePerfil={onChangePerfilRegra}
        onApproveOrder={onApproveOrder}
        onRejectOrder={onRejectDecision}
        onEditOrderDecision={onEditDecision}
        onCreateAgentOrder={onCreateFinancialAgentOrder}
        onOpenOrderInCenter={onOpenOrderInCenter}
        onOpenRuleById={onOpenRuleById}
        onSelectRule={onSelectRule}
        onEditRule={onEditRule}
        onNewRuleInModule={(mod) => onNewRule(mod)}
        onNewReembolsoRuleDraft={onNewReembolsoRuleDraft}
        onProposeChangeToOwner={onProposeChangeToOwner}
        onStartFromTemplate={onStartFromTemplate}
        onViewInCentral={onViewModuleRulesInCentral}
        onNavigateModule={onNavigateModule}
        onShowToast={onShowToast}
      />
    );
  }

  // Workspace page for all sidebar modules with integrated "Definir regras" tab
  const moduleTitle = getModuleTitle(activeItem);

  return (
    <ModuleWorkspacePage
      moduleId={activeItem}
      moduleTitle={moduleTitle}
      workspaceShortName={workspaceShortName}
      rules={rules}
      orders={orders}
      perfil={perfilRegra}
      isLoading={isLoading}
      onChangePerfil={onChangePerfilRegra}
      onSelectRule={onSelectRule}
      onEditRule={onEditRule}
      onNewRuleInModule={(mod) => onNewRule(mod)}
      onProposeChangeToOwner={onProposeChangeToOwner}
      onStartFromTemplate={onStartFromTemplate}
      onViewInCentral={onViewModuleRulesInCentral}
      onOpenOrderInCenter={onOpenOrderInCenter}
      onReturnToPainel={onReturnToPainel}
    />
  );
}
