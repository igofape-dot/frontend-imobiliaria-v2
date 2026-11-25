import { useEffect, useState } from 'react';
import {
  Wallet,
  Sparkles,
  LayoutDashboard,
  ArrowDownLeft,
  AlertTriangle,
  ArrowUpRight,
  CreditCard,
  FileCheck2,
  Sliders,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import {
  INITIAL_DELINQUENTS,
  INITIAL_DIVERGENCES,
  INITIAL_PAYABLES,
  INITIAL_RECEIVABLES,
  INITIAL_REPASSES,
  INITIAL_COMMISSIONS,
  type BankDivergenceItem,
  type DelinquentTenant,
  type FinancePeriod,
  type FinanceTabId,
  type PayableSupplierItem,
  type PolicyEvaluationResult,
  type ReceivableItem,
  type RepasseItem,
} from '../../data/financeiroData';
import type { AgentOrder, OrderLinkChip } from '../../data/agentOrdersData';
import type { PerfilRegra, Regra } from '../../data/rulesData';
import { ModuleRulesPanel } from '../rules/ModuleRulesPanel';
import {
  AskAgentOrderDrawer,
  type AskAgentRequestPayload,
} from './AskAgentOrderDrawer';
import { FinanceiroTabVisaoGeral } from './FinanceiroTabVisaoGeral';
import { FinanceiroTabReceber } from './FinanceiroTabReceber';
import { FinanceiroTabInadimplencia } from './FinanceiroTabInadimplencia';
import { FinanceiroTabRepasses } from './FinanceiroTabRepasses';
import { FinanceiroTabPagar } from './FinanceiroTabPagar';
import { FinanceiroTabConciliacao } from './FinanceiroTabConciliacao';

interface FinanceiroPageProps {
  workspaceShortName: string;
  orders: AgentOrder[];
  rules: Regra[];
  perfil: PerfilRegra;
  isLoading: boolean;
  onChangePerfil: (perfil: PerfilRegra) => void;
  onApproveOrder: (orderId: string) => void;
  onRejectOrder: (orderId: string) => void;
  onEditOrderDecision: (orderId: string, newTitle: string, newProposedAction: string) => void;
  onCreateFinancialAgentOrder: (payload: {
    promptText: string;
    subtipo: string;
    evaluation: PolicyEvaluationResult;
    links?: OrderLinkChip[];
  }) => AgentOrder;
  onOpenOrderInCenter: (orderId: string) => void;
  onOpenRuleById: (ruleId: string) => void;
  onSelectRule: (rule: Regra) => void;
  onEditRule: (rule: Regra) => void;
  onNewRuleInModule: (modulo: string) => void;
  onProposeChangeToOwner: (sourceRule: Regra, targetModule: string) => void;
  onStartFromTemplate: (modulo: string) => void;
  onViewInCentral: (modulo: string) => void;
  onShowToast: (text: string, onUndo?: () => void) => void;
}

const PERFIS: PerfilRegra[] = ['Gestor', 'Financeiro', 'Jurídico', 'Corretor'];

const FINANCE_PERIOD_OPTIONS: { id: FinancePeriod; label: string }[] = [
  { id: 'mes', label: 'Mês' },
  { id: '30d', label: '30 dias' },
  { id: '12m', label: '12 meses' },
];

const TABS: { id: FinanceTabId; label: string; Icon: typeof LayoutDashboard }[] = [
  { id: 'visao-geral', label: 'Visão geral', Icon: LayoutDashboard },
  { id: 'contas-receber', label: 'Contas a receber', Icon: ArrowDownLeft },
  { id: 'inadimplencia', label: 'Inadimplência e cobrança', Icon: AlertTriangle },
  { id: 'repasses', label: 'Repasses', Icon: ArrowUpRight },
  { id: 'contas-pagar', label: 'Contas a pagar', Icon: CreditCard },
  { id: 'conciliacao', label: 'Conciliação', Icon: FileCheck2 },
  { id: 'definir-regras', label: 'Definir regras', Icon: Sliders },
];

export function FinanceiroPage({
  workspaceShortName,
  orders,
  rules,
  perfil,
  isLoading,
  onChangePerfil,
  onApproveOrder,
  onRejectOrder,
  onEditOrderDecision,
  onCreateFinancialAgentOrder,
  onOpenOrderInCenter,
  onOpenRuleById,
  onSelectRule,
  onEditRule,
  onNewRuleInModule,
  onProposeChangeToOwner,
  onStartFromTemplate,
  onViewInCentral,
  onShowToast,
}: FinanceiroPageProps) {
  const [period, setPeriod] = useState<FinancePeriod>('mes');
  const [activeTab, setActiveTab] = useState<FinanceTabId>('visao-geral');
  const [hasError, setHasError] = useState(false);

  // Local financial records operated by the AI Agent (with 1-click correction + Undo)
  const [receivables, setReceivables] = useState<ReceivableItem[]>(INITIAL_RECEIVABLES);
  const [delinquents] = useState<DelinquentTenant[]>(INITIAL_DELINQUENTS);
  const [repasses] = useState<RepasseItem[]>(INITIAL_REPASSES);
  const [payables, setPayables] = useState<PayableSupplierItem[]>(INITIAL_PAYABLES);
  const [divergences, setDivergences] = useState<BankDivergenceItem[]>(INITIAL_DIVERGENCES);
  const [askAgentRequest, setAskAgentRequest] = useState<AskAgentRequestPayload | null>(null);

  // Enforce profile access boundaries
  useEffect(() => {
    if (perfil === 'Jurídico' && activeTab !== 'inadimplencia') {
      setActiveTab('inadimplencia');
    } else if (perfil === 'Corretor' && activeTab !== 'contas-pagar') {
      setActiveTab('contas-pagar');
    }
  }, [perfil, activeTab]);

  const handleCorrectReceivable = (id: string, newVal: number) => {
    const prev = receivables;
    setReceivables((list) =>
      list.map((r) =>
        r.id === id ? { ...r, valor: newVal, registeredBy: 'Corrigido por você' } : r
      )
    );
    onShowToast('Valor a receber corrigido em 1 clique.', () => setReceivables(prev));
  };

  const handleCorrectPayable = (id: string, newVal: number) => {
    const prev = payables;
    setPayables((list) =>
      list.map((p) =>
        p.id === id ? { ...p, valor: newVal, registeredBy: 'Corrigido por você' } : p
      )
    );
    onShowToast('Valor a pagar corrigido em 1 clique.', () => setPayables(prev));
  };

  const handleAcceptDivergenceSuggestion = (id: string) => {
    const prev = divergences;
    setDivergences((list) =>
      list.map((d) =>
        d.id === id
          ? { ...d, resolvido: true, registeredBy: 'Registrado pelo agente · aceito por você' }
          : d
      )
    );
    onShowToast('Sugestão de conciliação aceita e baixada.', () => setDivergences(prev));
  };

  const handleCorrectDivergence = (id: string, note: string) => {
    const prev = divergences;
    setDivergences((list) =>
      list.map((d) =>
        d.id === id
          ? {
              ...d,
              resolvido: true,
              resolucaoTexto: note,
              registeredBy: 'Corrigido por você',
            }
          : d
      )
    );
    onShowToast('Divergência corrigida. A correção treina o agente.', () =>
      setDivergences(prev)
    );
  };

  const visibleTabs = TABS.filter((tab) => {
    if (perfil === 'Jurídico') return tab.id === 'inadimplencia';
    if (perfil === 'Corretor') return tab.id === 'contas-pagar';
    return true;
  });

  const ownedRulesCount = rules.filter((r) => r.moduloDono === 'Financeiro').length;

  return (
    <main className="flex-1 bg-[#F8F9FB] px-4 sm:px-6 lg:px-7 py-5 sm:py-6">
      <div className="max-w-[1440px] mx-auto space-y-5">
        {/* CABEÇALHO */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-[#EFF4FF] text-[#2563EB] flex items-center justify-center shrink-0">
                <Wallet className="w-4 h-4" strokeWidth={2} />
              </span>
              <h1 className="text-[22px] sm:text-[24px] font-bold text-slate-900 tracking-tight leading-tight">
                Financeiro
              </h1>
            </div>
            <p className="text-[13px] text-slate-500 mt-1">
              Receber, repassar e pagar com o agente · {workspaceShortName}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Seletor de Período */}
            <div
              role="group"
              aria-label="Período financeiro"
              className="inline-flex items-center p-1 rounded-xl bg-white border border-slate-200/90"
            >
              {FINANCE_PERIOD_OPTIONS.map((opt) => {
                const selected = period === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPeriod(opt.id)}
                    aria-pressed={selected}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                      selected
                        ? 'bg-[#2563EB] text-white'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* Seletor de Perfil (sincronizado com Regras do agente) */}
            <div
              role="group"
              aria-label="Perfil de acesso financeiro"
              className="inline-flex items-center p-1 rounded-xl bg-white border border-slate-200/90"
            >
              <span className="px-2 text-[11px] font-semibold text-slate-400 hidden sm:inline">
                Perfil:
              </span>
              {PERFIS.map((p) => {
                const active = perfil === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onChangePerfil(p)}
                    aria-pressed={active}
                    className={`px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                      active
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            {/* Botão único de ação (ZERO "Novo lançamento" / "Novo boleto") */}
            <button
              type="button"
              onClick={() =>
                setAskAgentRequest({
                  title: 'Pedir ao agente no Financeiro',
                  prefillText:
                    'Cobrar os 16 inquilinos em atraso conforme régua FIN-020 e enviar 2ª via atualizada para os vencimentos de hoje.',
                  subtipo: 'Cobrança',
                  actionType: 'regua_cobranca',
                  evalParams: { diasAtraso: 6 },
                })
              }
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5B3FD0] hover:bg-[#4C32B8] text-white text-[12.5px] font-semibold transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Pedir ao agente</span>
            </button>
          </div>
        </div>

        {/* Banner de restrição para perfil Jurídico */}
        {perfil === 'Jurídico' && (
          <div className="rounded-xl border border-blue-200 bg-[#EFF4FF]/65 px-4 py-3 flex items-center gap-2.5 text-[12.5px] text-slate-800">
            <ShieldCheck className="w-4 h-4 text-[#2563EB] shrink-0" />
            <span>
              <strong>Perfil Jurídico:</strong> acesso restrito a{' '}
              <strong>Inadimplência e cobrança</strong> para acompanhamento de ações judiciais e
              validação obrigatória de acordos (JUR-007).
            </span>
          </div>
        )}

        {/* ABAS */}
        <div
          role="tablist"
          aria-label="Seções do módulo Financeiro"
          className="border-b border-slate-200 flex items-center gap-1 overflow-x-auto"
        >
          {visibleTabs.map((tab) => {
            const Icon = tab.Icon;
            const isActive = activeTab === tab.id;
            const label =
              perfil === 'Corretor' && tab.id === 'contas-pagar'
                ? 'Minhas comissões'
                : tab.label;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 text-[13px] font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'border-[#2563EB] text-[#2563EB]'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
                {tab.id === 'definir-regras' && (
                  <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 tabular-nums">
                    {ownedRulesCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ESTADOS DE CARREGAMENTO / ERRO / CONTEÚDO */}
        {isLoading ? (
          <div className="space-y-4 animate-pulse" aria-busy="true">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl border border-slate-200/90 p-5 space-y-3"
                >
                  <div className="h-3.5 bg-slate-200 rounded w-36" />
                  <div className="h-7 bg-slate-200 rounded w-28" />
                  <div className="h-3 bg-slate-100 rounded w-48" />
                </div>
              ))}
            </div>
          </div>
        ) : hasError ? (
          <div className="bg-white rounded-xl border border-red-200 p-8 text-center space-y-3">
            <AlertTriangle className="w-7 h-7 text-red-600 mx-auto" />
            <div className="text-[14px] font-semibold text-slate-900">
              Não foi possível sincronizar os dados financeiros
            </div>
            <button
              type="button"
              onClick={() => setHasError(false)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-[12.5px] font-semibold text-slate-700 hover:bg-slate-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Tentar novamente</span>
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'visao-geral' && (
              <FinanceiroTabVisaoGeral
                period={period}
                orders={orders}
                rules={rules}
                onApproveOrder={onApproveOrder}
                onRejectOrder={onRejectOrder}
                onEditOrderDecision={onEditOrderDecision}
                onOpenOrderInCenter={onOpenOrderInCenter}
                onOpenRuleById={onOpenRuleById}
                onAskAgent={setAskAgentRequest}
                onSwitchTab={setActiveTab}
                onShowToast={onShowToast}
              />
            )}

            {activeTab === 'contas-receber' && (
              <FinanceiroTabReceber
                items={receivables}
                onCorrectReceivableValue={handleCorrectReceivable}
                onAskAgent={setAskAgentRequest}
                onSwitchToInadimplencia={() => setActiveTab('inadimplencia')}
              />
            )}

            {activeTab === 'inadimplencia' && (
              <FinanceiroTabInadimplencia
                tenants={delinquents}
                rules={rules}
                onAskAgent={setAskAgentRequest}
                onOpenRuleById={onOpenRuleById}
                onOpenOrderInCenter={onOpenOrderInCenter}
              />
            )}

            {activeTab === 'repasses' && (
              <FinanceiroTabRepasses
                repasses={repasses}
                onAskAgent={setAskAgentRequest}
                onOpenRuleById={onOpenRuleById}
                onOpenOrderInCenter={onOpenOrderInCenter}
              />
            )}

            {activeTab === 'contas-pagar' && (
              <FinanceiroTabPagar
                payables={payables}
                commissions={INITIAL_COMMISSIONS}
                isCorretorOnly={perfil === 'Corretor'}
                onCorrectPayableValue={handleCorrectPayable}
                onAskAgent={setAskAgentRequest}
                onOpenRuleById={onOpenRuleById}
                onOpenOrderInCenter={onOpenOrderInCenter}
                onApproveOrder={onApproveOrder}
              />
            )}

            {activeTab === 'conciliacao' && (
              <FinanceiroTabConciliacao
                divergences={divergences}
                rules={rules}
                onAcceptSuggestion={handleAcceptDivergenceSuggestion}
                onCorrectDivergence={handleCorrectDivergence}
                onAskAgent={setAskAgentRequest}
                onOpenRuleById={onOpenRuleById}
                onSwitchToRulesTab={() => setActiveTab('definir-regras')}
              />
            )}

            {activeTab === 'definir-regras' && (
              <ModuleRulesPanel
                moduleFilter="Financeiro"
                rules={rules}
                perfil={perfil}
                onChangePerfil={onChangePerfil}
                isLoading={isLoading}
                onSelectRule={onSelectRule}
                onEditRule={onEditRule}
                onNewRuleInModule={onNewRuleInModule}
                onProposeChangeToOwner={onProposeChangeToOwner}
                onStartFromTemplate={onStartFromTemplate}
                onViewInCentral={onViewInCentral}
              />
            )}
          </>
        )}
      </div>

      {/* Unified Pedir ao Agente Drawer (creates formal PED-2026-00xxxx + evaluates policy) */}
      <AskAgentOrderDrawer
        request={askAgentRequest}
        rules={rules}
        onClose={() => setAskAgentRequest(null)}
        onConfirmRequest={onCreateFinancialAgentOrder}
        onOpenRuleById={onOpenRuleById}
        onOpenOrderInCenter={onOpenOrderInCenter}
      />
    </main>
  );
}
