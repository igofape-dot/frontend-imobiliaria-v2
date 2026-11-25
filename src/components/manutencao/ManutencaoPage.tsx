import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Info,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';
import type { AgentOrder, OrderCategory, OrderLinkChip } from '../../data/agentOrdersData';
import type { PolicyEvaluationResult } from '../../data/financeiroData';
import type { NavItemId } from '../../data/navigation';
import type { PerfilRegra, Regra } from '../../data/rulesData';
import {
  AskAgentOrderDrawer,
  type AskAgentRequestPayload,
} from '../financeiro/AskAgentOrderDrawer';
import { ModuleRulesPanel } from '../rules/ModuleRulesPanel';
import {
  INITIAL_INSPECTION_REPORTS,
  INITIAL_INSPECTION_SCHEDULE,
  INITIAL_LAGO9_COMPARATOR_ITEMS,
  INITIAL_MAINTENANCE_TICKETS,
  INITIAL_QUOTES,
  INITIAL_READINESS_PROPERTIES,
  INITIAL_SUPPLIERS,
  type ComparatorClass,
  type ComparatorItem,
  type MaintenanceTicket,
  type ManutencaoPeriod,
  type ManutencaoTabId,
  type ReadinessChecklist,
  type ReadinessProperty,
} from '../../data/manutencaoData';
import {
  InspectionComparatorDrawer,
  QuoteComparatorDrawer,
  TicketFichaDrawer,
} from './ManutencaoDrawers';
import { ManutencaoTabVisaoGeral } from './ManutencaoTabVisaoGeral';
import { ManutencaoTabChamados } from './ManutencaoTabChamados';
import { ManutencaoTabVistorias } from './ManutencaoTabVistorias';
import { ManutencaoTabOrcamentos } from './ManutencaoTabOrcamentos';
import { ManutencaoTabProntidao } from './ManutencaoTabProntidao';

interface ManutencaoPageProps {
  orders: AgentOrder[];
  rules: Regra[];
  perfil: PerfilRegra;
  isLoading: boolean;
  onChangePerfil: (perfil: PerfilRegra) => void;
  onApproveOrder: (orderId: string) => void;
  onRejectOrder: (orderId: string) => void;
  onEditOrderDecision: (orderId: string, newTitle: string, newProposedAction: string) => void;
  onCreateAgentOrder: (payload: {
    promptText: string;
    categoria?: OrderCategory;
    subtipo: string;
    evaluation: PolicyEvaluationResult;
    links?: OrderLinkChip[];
  }) => AgentOrder;
  onOpenOrderInCenter: (orderId: string) => void;
  onOpenRuleById: (ruleId: string) => void;
  onSelectRule: (rule: Regra) => void;
  onEditRule: (rule: Regra) => void;
  onNewRuleInModule: (modulo: string) => void;
  onNewReembolsoRuleDraft: () => void;
  onProposeChangeToOwner: (sourceRule: Regra, targetModule: string) => void;
  onStartFromTemplate: (modulo: string) => void;
  onViewInCentral: (modulo: string) => void;
  onNavigateModule: (navId: NavItemId) => void;
  onShowToast: (text: string, onUndo?: () => void) => void;
}

const ALL_TABS: { id: ManutencaoTabId; label: string }[] = [
  { id: 'visao-geral', label: 'Visão geral' },
  { id: 'chamados', label: 'Chamados' },
  { id: 'vistorias', label: 'Vistorias' },
  { id: 'orcamentos-fornecedores', label: 'Orçamentos e fornecedores' },
  { id: 'prontidao', label: 'Prontidão para alugar' },
  { id: 'definir-regras', label: 'Definir regras' },
];

const PROFILES: PerfilRegra[] = ['Gestor', 'Financeiro', 'Jurídico', 'Corretor'];

export function ManutencaoPage({
  orders,
  rules,
  perfil,
  isLoading,
  onChangePerfil,
  onApproveOrder,
  onRejectOrder,
  onEditOrderDecision,
  onCreateAgentOrder,
  onOpenOrderInCenter,
  onOpenRuleById,
  onSelectRule,
  onEditRule,
  onNewRuleInModule,
  onNewReembolsoRuleDraft,
  onProposeChangeToOwner,
  onStartFromTemplate,
  onViewInCentral,
  onNavigateModule,
  onShowToast,
}: ManutencaoPageProps) {
  const [activeTab, setActiveTab] = useState<ManutencaoTabId>('visao-geral');
  const [period, setPeriod] = useState<ManutencaoPeriod>('mes');

  const [tickets, setTickets] = useState<MaintenanceTicket[]>(INITIAL_MAINTENANCE_TICKETS);
  const [comparatorItems, setComparatorItems] = useState<ComparatorItem[]>(
    INITIAL_LAGO9_COMPARATOR_ITEMS
  );
  const [readinessProps, setReadinessProps] = useState<ReadinessProperty[]>(
    INITIAL_READINESS_PROPERTIES
  );

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isLago9Open, setIsLago9Open] = useState(false);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const [askRequest, setAskRequest] = useState<AskAgentRequestPayload | null>(null);

  // Profile access rules:
  // Gestor: full access & editing
  // Financeiro: sees quotes/payments/spend (approves only FIN-011; non-financial items read-only)
  // Jurídico: sees inspection reports with damage charges & contestations (read-only on budgets)
  // Corretor: sees tickets & readiness ONLY for own properties, never repasse/owner personal data
  const isReadOnlyTab = useMemo(() => {
    if (perfil === 'Gestor') return false;
    if (perfil === 'Financeiro') return activeTab !== 'orcamentos-fornecedores' && activeTab !== 'visao-geral';
    if (perfil === 'Jurídico') return activeTab !== 'vistorias';
    return true;
  }, [perfil, activeTab]);

  const visibleTabs = useMemo(() => {
    if (perfil === 'Financeiro') {
      return ALL_TABS.filter(
        (t) => t.id === 'visao-geral' || t.id === 'orcamentos-fornecedores'
      );
    }
    if (perfil === 'Jurídico') {
      return ALL_TABS.filter((t) => t.id === 'visao-geral' || t.id === 'vistorias');
    }
    if (perfil === 'Corretor') {
      return ALL_TABS.filter((t) => t.id === 'chamados' || t.id === 'prontidao');
    }
    return ALL_TABS;
  }, [perfil]);

  useEffect(() => {
    if (!visibleTabs.some((t) => t.id === activeTab)) {
      setActiveTab(visibleTabs[0]?.id ?? 'visao-geral');
    }
  }, [visibleTabs, activeTab]);

  const selectedTicket = useMemo(
    () => tickets.find((t) => t.id === selectedTicketId) ?? null,
    [tickets, selectedTicketId]
  );

  const selectedQuote = useMemo(
    () => INITIAL_QUOTES.find((q) => q.id === selectedQuoteId) ?? null,
    [selectedQuoteId]
  );

  const hasReembolsoRule = rules.some(
    (r) =>
      r.status === 'ativa' &&
      (r.nome.toLowerCase().includes('reembolso') ||
        r.quando.some((c) => String(c.valor).toLowerCase().includes('reembolso')))
  );

  const handleCorrectTicket = (
    ticketId: string,
    updates: Partial<MaintenanceTicket>,
    auditMsg: string
  ) => {
    const prev = tickets;
    setTickets((list) => list.map((t) => (t.id === ticketId ? { ...t, ...updates } : t)));
    onShowToast(`Correção salva no chamado (${auditMsg}).`, () => setTickets(prev));
  };

  const handleRateAcceptance = (ticketId: string, stars: number) => {
    setTickets((list) =>
      list.map((t) => (t.id === ticketId ? { ...t, notaAceite: stars } : t))
    );
    onShowToast(`Avaliação de aceite (${stars}/5) registrada no chamado.`);
  };

  const handleReclassifyComparatorItem = (itemId: string, nextClass: ComparatorClass) => {
    const prev = comparatorItems;
    setComparatorItems((list) =>
      list.map((it) => {
        if (it.id !== itemId) return it;
        const nextResp =
          nextClass === 'Sem alteração'
            ? 'Sem custo'
            : nextClass === 'Desgaste natural'
            ? 'Proprietário'
            : 'Inquilino';
        const nextCost =
          nextClass === 'Sem alteração'
            ? 0
            : it.custoEstimado > 0
            ? it.custoEstimado
            : nextClass === 'Dano'
            ? 450
            : 350;
        return {
          ...it,
          classificacao: nextClass,
          responsavelSugerido: nextResp,
          custoEstimado: nextCost,
          corrigido: true,
        };
      })
    );
    onShowToast('Item reclassificado ao vivo. A correção treina o agente.', () =>
      setComparatorItems(prev)
    );
  };

  const handleConfirmLowConfidenceItem = (itemId: string) => {
    setComparatorItems((list) =>
      list.map((it) =>
        it.id === itemId ? { ...it, revisaoHumana: false, corrigido: true, confianca: 98 } : it
      )
    );
    onShowToast('Item #16 confirmado por revisão humana. A correção treina o agente.');
  };

  const handleToggleChecklistItem = (propId: string, key: keyof ReadinessChecklist) => {
    setReadinessProps((list) =>
      list.map((p) =>
        p.id === propId
          ? { ...p, checklist: { ...p.checklist, [key]: !p.checklist[key] } }
          : p
      )
    );
  };

  const handleMarkReady = (propId: string) => {
    const prev = readinessProps;
    setReadinessProps((list) =>
      list.map((p) =>
        p.id === propId
          ? {
              ...p,
              etapa: 'PRONTO',
              etapaIndex: 6,
              bloqueio: 'Liberado pela MAN-006 v1',
              proximoPassoAgente: 'Avaliado pela LOC-002 para publicação nos portais',
              prontoAnunciavel: true,
            }
          : p
      )
    );
    onShowToast('Imóvel marcado como Pronto e anunciável pela MAN-006 v1 (LOC-002).', () =>
      setReadinessProps(prev)
    );
  };

  return (
    <main className="flex-1 bg-[#F8F9FB] px-4 sm:px-6 lg:px-7 py-5 sm:py-6">
      <div className="max-w-[1440px] mx-auto space-y-5">
        {/* HEADER */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
          <div>
            <h1 className="text-[22px] sm:text-[24px] font-bold text-slate-900 tracking-tight leading-tight">
              Manutenção e Vistorias
            </h1>
            <p className="text-[13px] text-slate-500 mt-1">
              Chamados, vistorias e imóveis prontos com o agente · Referência 22/11/2026
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Period Selector: Hoje | 7 dias | 30 dias | Mês */}
            <div
              role="group"
              aria-label="Período de análise"
              className="inline-flex p-1 rounded-xl bg-white border border-slate-200"
            >
              {[
                { id: 'hoje' as ManutencaoPeriod, label: 'Hoje' },
                { id: '7d' as ManutencaoPeriod, label: '7 dias' },
                { id: '30d' as ManutencaoPeriod, label: '30 dias' },
                { id: 'mes' as ManutencaoPeriod, label: 'Mês' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPeriod(opt.id)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                    period === opt.id
                      ? 'bg-[#2563EB] text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Profile Switcher */}
            <div
              role="group"
              aria-label="Perfil de acesso"
              className="inline-flex flex-wrap items-center gap-1 p-1 rounded-xl bg-white border border-slate-200"
            >
              <span className="inline-flex items-center gap-1 px-2 text-[11px] font-semibold text-slate-500">
                <UserCheck className="w-3.5 h-3.5" />
                Perfil:
              </span>
              {PROFILES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onChangePerfil(p)}
                  className={`px-2.5 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${
                    perfil === p
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* DISCREET FIXED THIRD-PARTY ACCOUNT BANNER */}
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 flex items-center gap-2 text-[12px] text-slate-700">
          <Info className="w-4 h-4 text-[#2563EB] shrink-0" />
          <span>
            Manutenção é paga com dinheiro do proprietário (conta de terceiros) e descontada no repasse. Não é despesa da imobiliária.
          </span>
        </div>

        {/* PROFILE SCOPE BANNER */}
        {perfil !== 'Gestor' && (
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 flex items-center gap-2 text-[12px]">
            {perfil === 'Financeiro' && (
              <span className="inline-flex items-center gap-1.5 text-amber-900 font-medium">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                Perfil Financeiro: visualiza orçamentos, pagamentos e gastos (aprova somente alçadas FIN-011; demais itens em leitura).
              </span>
            )}
            {perfil === 'Jurídico' && (
              <span className="inline-flex items-center gap-1.5 text-amber-900 font-medium">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                Perfil Jurídico: acessa laudos com cobrança de danos e contestações escaladas (MAN-002 v3).
              </span>
            )}
            {perfil === 'Corretor' && (
              <span className="inline-flex items-center gap-1.5 text-[#2563EB] font-medium">
                <UserCheck className="w-4 h-4 shrink-0" />
                Escopo Corretor (Rafael Costa): apenas chamados e prontidão dos próprios imóveis. Valores de repasse e dados pessoais do proprietário ficam ocultos.
              </span>
            )}
          </div>
        )}

        {/* NAVIGATION TABS */}
        <div
          role="tablist"
          aria-label="Seções de Manutenção e Vistorias"
          className="flex items-center gap-1 overflow-x-auto border-b border-slate-200 pb-px"
        >
          {visibleTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-[13px] font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? 'border-[#2563EB] text-[#2563EB]'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* CONTENT */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-xl border border-slate-200 bg-white" />
            ))}
          </div>
        ) : (
          <div>
            {activeTab === 'visao-geral' && (
              <ManutencaoTabVisaoGeral
                period={period}
                orders={orders}
                rules={rules}
                perfil={perfil}
                readOnly={isReadOnlyTab}
                onNavigateTab={(t) => {
                  if (visibleTabs.some((vt) => vt.id === t)) setActiveTab(t);
                }}
                onApproveOrder={onApproveOrder}
                onRejectOrder={onRejectOrder}
                onEditOrderDecision={onEditOrderDecision}
                onOpenOrderInCenter={onOpenOrderInCenter}
                onOpenRuleById={onOpenRuleById}
                onCreateReembolsoRuleDraft={onNewReembolsoRuleDraft}
                onOpenQuoteComparator={(qId) => setSelectedQuoteId(qId)}
                onOpenLago9Comparator={() => setIsLago9Open(true)}
                onAskAgent={setAskRequest}
                onShowToast={onShowToast}
              />
            )}

            {activeTab === 'chamados' && (
              <ManutencaoTabChamados
                tickets={tickets}
                perfil={perfil}
                readOnly={isReadOnlyTab}
                onOpenTicket={(t) => setSelectedTicketId(t.id)}
                onOpenRuleById={onOpenRuleById}
                onAskAgent={setAskRequest}
              />
            )}

            {activeTab === 'vistorias' && (
              <ManutencaoTabVistorias
                schedule={INITIAL_INSPECTION_SCHEDULE}
                reports={INITIAL_INSPECTION_REPORTS}
                perfil={perfil}
                readOnly={isReadOnlyTab}
                onOpenLago9Comparator={() => setIsLago9Open(true)}
                onOpenRuleById={onOpenRuleById}
                onAskAgent={setAskRequest}
              />
            )}

            {activeTab === 'orcamentos-fornecedores' && (
              <ManutencaoTabOrcamentos
                quotes={INITIAL_QUOTES}
                suppliers={INITIAL_SUPPLIERS}
                rules={rules}
                perfil={perfil}
                readOnly={isReadOnlyTab}
                onOpenQuoteComparator={(qId) => setSelectedQuoteId(qId)}
                onOpenRuleById={onOpenRuleById}
                onAskAgent={setAskRequest}
              />
            )}

            {activeTab === 'prontidao' && (
              <ManutencaoTabProntidao
                properties={readinessProps}
                rules={rules}
                perfil={perfil}
                readOnly={isReadOnlyTab}
                onToggleChecklistItem={handleToggleChecklistItem}
                onMarkReady={handleMarkReady}
                onOpenRuleById={onOpenRuleById}
                onNavigateModule={onNavigateModule}
                onAskAgent={setAskRequest}
              />
            )}

            {activeTab === 'definir-regras' && (
              <div className="space-y-4">
                {!hasReembolsoRule && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[13px] font-bold text-amber-950">
                          Lacuna de regra: reembolso de reparo feito pelo inquilino
                        </div>
                        <p className="text-[12px] text-amber-900 mt-0.5">
                          Pedidos como o de Rodrigo Pires (PED-2026-004835, R$ 420,00) permanecem em “Só sugerir” até que uma regra defina limites, comprovação fiscal e consulta ao proprietário.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={onNewReembolsoRuleDraft}
                      className="px-3.5 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-[12px] font-semibold shrink-0"
                    >
                      Criar rascunho
                    </button>
                  </div>
                )}

                <ModuleRulesPanel
                  moduleFilter="Manutenção e Vistorias"
                  rules={rules}
                  perfil={perfil}
                  onSelectRule={onSelectRule}
                  onEditRule={onEditRule}
                  onNewRuleInModule={onNewRuleInModule}
                  onProposeChangeToOwner={onProposeChangeToOwner}
                  onStartFromTemplate={onStartFromTemplate}
                  onViewInCentral={onViewInCentral}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* DRAWERS */}
      <AskAgentOrderDrawer
        request={askRequest}
        rules={rules}
        onClose={() => setAskRequest(null)}
        onConfirmRequest={(payload) => onCreateAgentOrder(payload)}
        onOpenRuleById={onOpenRuleById}
        onOpenOrderInCenter={onOpenOrderInCenter}
        onCreateRuleFromGap={() => {
          setAskRequest(null);
          onNewReembolsoRuleDraft();
        }}
      />

      <TicketFichaDrawer
        ticket={selectedTicket}
        rules={rules}
        perfil={perfil}
        readOnly={isReadOnlyTab}
        onClose={() => setSelectedTicketId(null)}
        onCorrectField={handleCorrectTicket}
        onRateAcceptance={handleRateAcceptance}
        onOpenRuleById={onOpenRuleById}
        onAskAgent={setAskRequest}
        onOpenQuoteComparator={(qId) => setSelectedQuoteId(qId)}
        onShowToast={(msg) => onShowToast(msg)}
      />

      <InspectionComparatorDrawer
        isOpen={isLago9Open}
        items={comparatorItems}
        rules={rules}
        readOnly={isReadOnlyTab}
        onClose={() => setIsLago9Open(false)}
        onReclassifyItem={handleReclassifyComparatorItem}
        onConfirmLowConfidenceItem={handleConfirmLowConfidenceItem}
        onOpenRuleById={onOpenRuleById}
        onAskAgent={setAskRequest}
      />

      <QuoteComparatorDrawer
        quoteCase={selectedQuote}
        rules={rules}
        readOnly={isReadOnlyTab}
        onClose={() => setSelectedQuoteId(null)}
        onOpenRuleById={onOpenRuleById}
        onAskAgent={setAskRequest}
      />
    </main>
  );
}
