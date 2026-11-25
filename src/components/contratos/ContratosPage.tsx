import { useEffect, useMemo, useState } from 'react';
import { ShieldAlert, Lock, UserCheck } from 'lucide-react';
import type { FinancePeriod, PolicyEvaluationResult } from '../../data/financeiroData';
import type { AgentOrder, OrderCategory, OrderLinkChip } from '../../data/agentOrdersData';
import type { PerfilRegra, Regra } from '../../data/rulesData';
import type { ContratosTabId } from '../../data/contratosData';
import {
  AskAgentOrderDrawer,
  type AskAgentRequestPayload,
} from '../financeiro/AskAgentOrderDrawer';
import { ModuleRulesPanel } from '../rules/ModuleRulesPanel';
import { ContratosTabVisaoGeral } from './ContratosTabVisaoGeral';
import { ContratosTabLista } from './ContratosTabLista';
import { ContratosTabRenovacoes } from './ContratosTabRenovacoes';
import { ContratosTabGarantias } from './ContratosTabGarantias';
import { ContratosTabRescisoesJuridico } from './ContratosTabRescisoesJuridico';
import { ContratosTabDocumentos } from './ContratosTabDocumentos';
import {
  AdjustmentCalculatorDrawer,
  ContractComparatorDrawer,
  type CalculatorTarget,
  type ComparatorTarget,
} from './ContratosDrawers';

interface ContratosPageProps {
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
  onNewReajusteRuleDraft: () => void;
  onProposeChangeToOwner: (sourceRule: Regra, targetModule: string) => void;
  onStartFromTemplate: (modulo: string) => void;
  onViewInCentral: (modulo: string) => void;
  onShowToast: (text: string, onUndo?: () => void) => void;
}

const ALL_TABS: { id: ContratosTabId; label: string }[] = [
  { id: 'visao-geral', label: 'Visão geral' },
  { id: 'contratos', label: 'Contratos' },
  { id: 'renovacoes-reajustes', label: 'Renovações e reajustes' },
  { id: 'garantias', label: 'Garantias' },
  { id: 'rescisoes-juridico', label: 'Rescisões e casos jurídicos' },
  { id: 'documentos-modelos', label: 'Documentos e modelos' },
  { id: 'definir-regras', label: 'Definir regras' },
];

const PROFILES: PerfilRegra[] = ['Gestor', 'Financeiro', 'Jurídico', 'Corretor'];

export function ContratosPage({
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
  onNewReajusteRuleDraft,
  onProposeChangeToOwner,
  onStartFromTemplate,
  onViewInCentral,
  onShowToast,
}: ContratosPageProps) {
  const [activeTab, setActiveTab] = useState<ContratosTabId>('visao-geral');
  const [period, setPeriod] = useState<FinancePeriod>('mes');
  const [askRequest, setAskRequest] = useState<AskAgentRequestPayload | null>(null);
  const [comparatorTarget, setComparatorTarget] = useState<ComparatorTarget | null>(null);
  const [calculatorTarget, setCalculatorTarget] = useState<CalculatorTarget | null>(null);

  const isReadOnlyFinanceiro = perfil === 'Financeiro';

  const visibleTabs = useMemo(() => {
    if (perfil === 'Corretor') {
      // Corretor sees only contracts of their properties; never legal cases or rule governance
      return ALL_TABS.filter(
        (t) => t.id !== 'rescisoes-juridico' && t.id !== 'definir-regras'
      );
    }
    if (perfil === 'Financeiro') {
      // Financeiro sees only collection cases & rescissions in read-only mode
      return ALL_TABS.filter(
        (t) =>
          t.id === 'visao-geral' ||
          t.id === 'contratos' ||
          t.id === 'rescisoes-juridico'
      );
    }
    return ALL_TABS;
  }, [perfil]);

  // Keep activeTab valid when switching profile
  useEffect(() => {
    if (!visibleTabs.some((t) => t.id === activeTab)) {
      setActiveTab(visibleTabs[0]?.id ?? 'visao-geral');
    }
  }, [visibleTabs, activeTab]);

  const handleNavigateTab = (tab: ContratosTabId) => {
    if (visibleTabs.some((t) => t.id === tab)) {
      setActiveTab(tab);
    } else {
      onShowToast(`A aba selecionada não está disponível no perfil ${perfil}.`);
    }
  };

  return (
    <main className="flex-1 bg-[#F8F9FB] px-4 sm:px-6 lg:px-7 py-5 sm:py-6">
      <div className="max-w-[1440px] mx-auto space-y-5">
        {/* HEADER */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
          <div>
            <h1 className="text-[22px] sm:text-[24px] font-bold text-slate-900 tracking-tight leading-tight">
              Contratos e Jurídico
            </h1>
            <p className="text-[13px] text-slate-500 mt-1">
              Contratos, garantias e riscos com o agente · Referência 22/11/2026
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

            {/* Profile switcher (same as Regras do agente & Financeiro) */}
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

        {/* FIXED DISCREET BANNER (JUR-001) */}
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex items-center gap-2 text-slate-700">
            <Lock className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span>
              O agente não envia notificação extrajudicial nem ajuíza ação (barreira{' '}
              <button
                type="button"
                onClick={() => onOpenRuleById('JUR-001')}
                className="font-bold text-[#5B3FD0] hover:underline"
              >
                JUR-001
              </button>
              , travada). Ele monta o dossiê; quem age é o advogado.
            </span>
          </div>

          {perfil === 'Financeiro' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold">
              <ShieldAlert className="w-3.5 h-3.5" />
              Financeiro: somente leitura em cobrança e rescisões
            </span>
          )}
          {perfil === 'Corretor' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-[#2563EB] text-[11px] font-semibold">
              Escopo Corretor: apenas imóveis de Rafael Costa · casos jurídicos ocultos
            </span>
          )}
        </div>

        {/* NAVIGATION TABS */}
        <div
          role="tablist"
          aria-label="Seções de Contratos e Jurídico"
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

        {/* LOADING SKELETON OR ACTIVE TAB */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-xl border border-slate-200 bg-white" />
            ))}
          </div>
        ) : (
          <div>
            {activeTab === 'visao-geral' && (
              <ContratosTabVisaoGeral
                period={period}
                orders={orders}
                rules={rules}
                perfil={perfil}
                readOnly={isReadOnlyFinanceiro}
                onNavigateTab={handleNavigateTab}
                onApproveOrder={onApproveOrder}
                onRejectOrder={onRejectOrder}
                onEditOrderDecision={onEditOrderDecision}
                onOpenOrderInCenter={onOpenOrderInCenter}
                onOpenRuleById={onOpenRuleById}
                onAskAgent={setAskRequest}
                onOpenComparator={setComparatorTarget}
              />
            )}

            {activeTab === 'contratos' && (
              <ContratosTabLista
                perfil={perfil}
                readOnly={isReadOnlyFinanceiro}
                onAskAgent={setAskRequest}
                onOpenRuleById={onOpenRuleById}
                onOpenOrderInCenter={onOpenOrderInCenter}
                onShowToast={(t) => onShowToast(t)}
              />
            )}

            {activeTab === 'renovacoes-reajustes' && (
              <ContratosTabRenovacoes
                rules={rules}
                perfil={perfil}
                readOnly={isReadOnlyFinanceiro}
                onAskAgent={setAskRequest}
                onOpenRuleById={onOpenRuleById}
                onOpenOrderInCenter={onOpenOrderInCenter}
                onOpenComparator={setComparatorTarget}
                onOpenCalculator={setCalculatorTarget}
                onCreateRuleForReajuste={onNewReajusteRuleDraft}
              />
            )}

            {activeTab === 'garantias' && (
              <ContratosTabGarantias
                perfil={perfil}
                readOnly={isReadOnlyFinanceiro}
                onAskAgent={setAskRequest}
                onOpenRuleById={onOpenRuleById}
                onOpenOrderInCenter={onOpenOrderInCenter}
              />
            )}

            {activeTab === 'rescisoes-juridico' && (
              <ContratosTabRescisoesJuridico
                perfil={perfil}
                readOnly={isReadOnlyFinanceiro}
                onAskAgent={setAskRequest}
                onOpenRuleById={onOpenRuleById}
                onOpenOrderInCenter={onOpenOrderInCenter}
                onShowToast={(t) => onShowToast(t)}
              />
            )}

            {activeTab === 'documentos-modelos' && (
              <ContratosTabDocumentos
                perfil={perfil}
                readOnly={isReadOnlyFinanceiro}
                onAskAgent={setAskRequest}
                onOpenRuleById={onOpenRuleById}
                onShowToast={(t) => onShowToast(t)}
              />
            )}

            {activeTab === 'definir-regras' && (
              <ModuleRulesPanel
                moduleFilter="Contratos e Jurídico"
                rules={rules}
                perfil={perfil}
                onSelectRule={onSelectRule}
                onEditRule={onEditRule}
                onNewRuleInModule={onNewRuleInModule}
                onProposeChangeToOwner={onProposeChangeToOwner}
                onStartFromTemplate={onStartFromTemplate}
                onViewInCentral={onViewInCentral}
              />
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
          onNewReajusteRuleDraft();
        }}
      />

      <ContractComparatorDrawer
        target={comparatorTarget}
        rules={rules}
        readOnly={isReadOnlyFinanceiro}
        onClose={() => setComparatorTarget(null)}
        onOpenRuleById={onOpenRuleById}
        onAskAgent={setAskRequest}
      />

      <AdjustmentCalculatorDrawer
        target={calculatorTarget}
        rules={rules}
        readOnly={isReadOnlyFinanceiro}
        onClose={() => setCalculatorTarget(null)}
        onOpenRuleById={onOpenRuleById}
        onCreateRuleForReajuste={onNewReajusteRuleDraft}
        onAskAgent={setAskRequest}
      />
    </main>
  );
}
