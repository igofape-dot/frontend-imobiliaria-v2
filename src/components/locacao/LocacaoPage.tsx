import { useEffect, useMemo, useState } from 'react';
import { ShieldAlert, UserCheck, AlertTriangle } from 'lucide-react';
import type { FinancePeriod, PolicyEvaluationResult } from '../../data/financeiroData';
import type { AgentOrder, OrderCategory, OrderLinkChip } from '../../data/agentOrdersData';
import type { PerfilRegra, Regra } from '../../data/rulesData';
import type { NavItemId } from '../../data/navigation';
import {
  INITIAL_CANDIDATES_4,
  INITIAL_PORTFOLIO_20,
  INITIAL_VACANT_28,
  type CandidateAnalysisItem,
  type LocacaoTabId,
  type PropertyPortfolioItem,
  type VacantPropertyItem,
} from '../../data/locacaoData';
import {
  AskAgentOrderDrawer,
  type AskAgentRequestPayload,
} from '../financeiro/AskAgentOrderDrawer';
import { ModuleRulesPanel } from '../rules/ModuleRulesPanel';
import { LocacaoTabVisaoGeral } from './LocacaoTabVisaoGeral';
import { LocacaoTabCarteira } from './LocacaoTabCarteira';
import { LocacaoTabVacanciaPreco } from './LocacaoTabVacanciaPreco';
import { LocacaoTabLocacao } from './LocacaoTabLocacao';
import { LocacaoTabCaptacaoRetencao } from './LocacaoTabCaptacaoRetencao';
import { PriceSimulatorDrawer, PropertyFichaDrawer } from './LocacaoDrawers';

interface LocacaoPageProps {
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
  onNewConcessaoRuleDraft: () => void;
  onProposeChangeToOwner: (sourceRule: Regra, targetModule: string) => void;
  onStartFromTemplate: (modulo: string) => void;
  onViewInCentral: (modulo: string) => void;
  onNavigateModule: (navId: NavItemId) => void;
  onShowToast: (text: string, onUndo?: () => void) => void;
}

const ALL_TABS: { id: LocacaoTabId; label: string }[] = [
  { id: 'visao-geral', label: 'Visão geral' },
  { id: 'carteira', label: 'Carteira' },
  { id: 'vacancia-preco', label: 'Vacância e preço' },
  { id: 'locacao', label: 'Locação' },
  { id: 'captacao-retencao', label: 'Captação e retenção' },
  { id: 'definir-regras', label: 'Definir regras' },
];

const PROFILES: PerfilRegra[] = ['Gestor', 'Financeiro', 'Jurídico', 'Corretor'];

export function LocacaoPage({
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
  onNewConcessaoRuleDraft,
  onProposeChangeToOwner,
  onStartFromTemplate,
  onViewInCentral,
  onNavigateModule,
  onShowToast,
}: LocacaoPageProps) {
  const [activeTab, setActiveTab] = useState<LocacaoTabId>('visao-geral');
  const [period, setPeriod] = useState<FinancePeriod>('mes');
  const [portfolioItems, setPortfolioItems] =
    useState<PropertyPortfolioItem[]>(INITIAL_PORTFOLIO_20);
  const [candidates, setCandidates] =
    useState<CandidateAnalysisItem[]>(INITIAL_CANDIDATES_4);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [simulatorTarget, setSimulatorTarget] = useState<VacantPropertyItem | null>(null);
  const [askRequest, setAskRequest] = useState<AskAgentRequestPayload | null>(null);

  const isReadOnlyFinJur = perfil === 'Financeiro' || perfil === 'Jurídico';

  const visibleTabs = useMemo(() => {
    if (perfil === 'Financeiro' || perfil === 'Jurídico') {
      // Financeiro and Jurídico access ONLY Carteira and Vacância e preço in read-only mode
      return ALL_TABS.filter((t) => t.id === 'carteira' || t.id === 'vacancia-preco');
    }
    if (perfil === 'Corretor') {
      return ALL_TABS.filter(
        (t) => t.id !== 'captacao-retencao' && t.id !== 'definir-regras'
      );
    }
    return ALL_TABS;
  }, [perfil]);

  useEffect(() => {
    if (!visibleTabs.some((t) => t.id === activeTab)) {
      setActiveTab(visibleTabs[0]?.id ?? 'carteira');
    }
  }, [visibleTabs, activeTab]);

  const handleNavigateTab = (tab: LocacaoTabId) => {
    if (visibleTabs.some((t) => t.id === tab)) {
      setActiveTab(tab);
    } else {
      onShowToast(`A aba selecionada não está disponível no perfil ${perfil}.`);
    }
  };

  const handleCorrectProperty = (id: string, updates: Partial<PropertyPortfolioItem>) => {
    setPortfolioItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleApproveCandidate = (candidateId: string) => {
    const target = candidates.find((c) => c.id === candidateId);
    if (!target) return;
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === candidateId ? { ...c, statusDecisao: 'Aprovado pelo Gestor' } : c
      )
    );
    if (target.orderId) {
      onApproveOrder(target.orderId);
    } else {
      onShowToast(`Cadastro de ${target.nome} aprovado pelo Gestor (LOC-004).`);
    }
  };

  const handleRejectCandidate = (candidateId: string, reason: string) => {
    const target = candidates.find((c) => c.id === candidateId);
    if (!target) return;
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === candidateId
          ? { ...c, statusDecisao: 'Recusado pelo Gestor', motivoRecusa: reason }
          : c
      )
    );
    if (target.orderId) {
      onRejectOrder(target.orderId);
    }
    onShowToast(`Recusa de ${target.nome} registrada com motivo objetivo (LOC-004).`);
  };

  const selectedProperty = useMemo(
    () => portfolioItems.find((p) => p.id === selectedPropertyId) ?? null,
    [portfolioItems, selectedPropertyId]
  );

  const hasConcessaoRule = rules.some(
    (r) =>
      r.status === 'ativa' &&
      (r.nome.toLowerCase().includes('concess') || r.nome.toLowerCase().includes('carên'))
  );

  return (
    <main className="flex-1 bg-[#F8F9FB] px-4 sm:px-6 lg:px-7 py-5 sm:py-6">
      <div className="max-w-[1440px] mx-auto space-y-5">
        {/* HEADER */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
          <div>
            <h1 className="text-[22px] sm:text-[24px] font-bold text-slate-900 tracking-tight leading-tight">
              Locação e Administração
            </h1>
            <p className="text-[13px] text-slate-500 mt-1">
              Carteira, vacância e locação com o agente · Referência 22/11/2026
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Period selector */}
            <div
              role="group"
              aria-label="Período"
              className="inline-flex p-1 rounded-xl bg-white border border-slate-200"
            >
              {[
                { id: 'mes' as FinancePeriod, label: 'Mês' },
                { id: '30d' as FinancePeriod, label: '30 dias' },
                { id: '12m' as FinancePeriod, label: '12 meses' },
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

            {/* Profile switcher */}
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

        {/* PROFILE SCOPE BANNER */}
        {(isReadOnlyFinJur || perfil === 'Corretor') && (
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-[12px]">
            {isReadOnlyFinJur ? (
              <span className="inline-flex items-center gap-1.5 text-amber-900 font-medium">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                Perfil {perfil}: acesso somente leitura restrito às abas Carteira e Vacância e preço.
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[#2563EB] font-medium">
                <UserCheck className="w-4 h-4 shrink-0" />
                Escopo Corretor (Rafael Costa): apenas seus imóveis, visitas e propostas. Renda de candidatos e dados bancários de proprietários permanecem ocultos.
              </span>
            )}
          </div>
        )}

        {/* NAVIGATION TABS */}
        <div
          role="tablist"
          aria-label="Seções de Locação e Administração"
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
              <LocacaoTabVisaoGeral
                period={period}
                orders={orders}
                rules={rules}
                perfil={perfil}
                readOnly={isReadOnlyFinJur}
                onNavigateTab={handleNavigateTab}
                onNavigateModule={(nav) => onNavigateModule(nav)}
                onApproveOrder={onApproveOrder}
                onRejectOrder={onRejectOrder}
                onEditOrderDecision={onEditOrderDecision}
                onOpenOrderInCenter={onOpenOrderInCenter}
                onOpenRuleById={onOpenRuleById}
                onCreateConcessaoRuleDraft={onNewConcessaoRuleDraft}
                onAskAgent={setAskRequest}
                onOpenSimulator={setSimulatorTarget}
              />
            )}

            {activeTab === 'carteira' && (
              <LocacaoTabCarteira
                items={portfolioItems}
                perfil={perfil}
                readOnly={isReadOnlyFinJur}
                onOpenFicha={(item) => setSelectedPropertyId(item.id)}
                onAskAgent={setAskRequest}
              />
            )}

            {activeTab === 'vacancia-preco' && (
              <LocacaoTabVacanciaPreco
                rules={rules}
                perfil={perfil}
                readOnly={isReadOnlyFinJur}
                onOpenSimulator={setSimulatorTarget}
                onOpenFichaById={(id) => setSelectedPropertyId(id)}
                onAskAgent={setAskRequest}
                onOpenRuleById={onOpenRuleById}
                onNavigateModule={(nav) => onNavigateModule(nav)}
              />
            )}

            {activeTab === 'locacao' && (
              <LocacaoTabLocacao
                candidates={candidates}
                rules={rules}
                perfil={perfil}
                readOnly={isReadOnlyFinJur}
                onApproveCandidate={handleApproveCandidate}
                onRejectCandidate={handleRejectCandidate}
                onAskAgent={setAskRequest}
                onOpenRuleById={onOpenRuleById}
                onOpenOrderInCenter={onOpenOrderInCenter}
                onCreateConcessaoRuleDraft={onNewConcessaoRuleDraft}
                onNavigateModule={(nav) => onNavigateModule(nav)}
              />
            )}

            {activeTab === 'captacao-retencao' && (
              <LocacaoTabCaptacaoRetencao
                rules={rules}
                readOnly={isReadOnlyFinJur}
                onAskAgent={setAskRequest}
                onOpenRuleById={onOpenRuleById}
                onOpenOrderInCenter={onOpenOrderInCenter}
                onNavigateModule={(nav) => onNavigateModule(nav)}
              />
            )}

            {activeTab === 'definir-regras' && (
              <div className="space-y-4">
                {!hasConcessaoRule && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[13px] font-bold text-amber-950">
                          Lacuna de regra detectada: concessões na negociação (carência ou desconto no 1º aluguel)
                        </div>
                        <p className="text-[12px] text-amber-900 mt-0.5">
                          Propostas como a da Sala 301 (1 mês de carência) ficam no modo "Só sugerir" até que uma regra defina limites e alçadas.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={onNewConcessaoRuleDraft}
                      className="px-3.5 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-[12px] font-semibold shrink-0"
                    >
                      Criar rascunho para concessões
                    </button>
                  </div>
                )}

                <ModuleRulesPanel
                  moduleFilter="Locação e Administração"
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
          onNewConcessaoRuleDraft();
        }}
      />

      <PropertyFichaDrawer
        property={selectedProperty}
        rules={rules}
        perfil={perfil}
        readOnly={isReadOnlyFinJur}
        onClose={() => setSelectedPropertyId(null)}
        onCorrectProperty={handleCorrectProperty}
        onOpenRuleById={onOpenRuleById}
        onAskAgent={setAskRequest}
        onNavigateModule={(nav) => onNavigateModule(nav)}
        onShowToast={(msg) => onShowToast(msg)}
      />

      <PriceSimulatorDrawer
        target={simulatorTarget}
        rules={rules}
        readOnly={isReadOnlyFinJur}
        onClose={() => setSimulatorTarget(null)}
        onOpenRuleById={onOpenRuleById}
        onAskAgent={setAskRequest}
      />
    </main>
  );
}
