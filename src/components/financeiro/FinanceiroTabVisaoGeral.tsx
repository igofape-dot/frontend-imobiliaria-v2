import { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Pencil,
  Check,
  X,
  ArrowUpRight,
  Landmark,
  Briefcase,
  ShieldAlert,
  Lock,
} from 'lucide-react';
import {
  DRE_GERENCIAL_BY_PERIOD,
  FINANCE_ALERTS,
  FINANCE_KPIS_BY_PERIOD,
  FLUXO_PROJETADO_30D,
  RECEITA_POR_LINHA_BY_PERIOD,
  SEGREGATED_BALANCES,
  formatBRL,
  formatBRLCompact,
  type FinanceKpiItem,
  type FinancePeriod,
  type FinanceSemaphore,
  type FinanceTabId,
} from '../../data/financeiroData';
import type { AgentOrder } from '../../data/agentOrdersData';
import type { Regra } from '../../data/rulesData';
import type { AskAgentRequestPayload } from './AskAgentOrderDrawer';
import {
  AgentRegisteredTag,
  InlineOneClickCorrector,
  RuleAppliedChip,
  SemaphoreBadge,
} from './FinanceiroShared';

interface FinanceiroTabVisaoGeralProps {
  period: FinancePeriod;
  orders: AgentOrder[];
  rules: Regra[];
  onApproveOrder: (orderId: string) => void;
  onRejectOrder: (orderId: string) => void;
  onEditOrderDecision: (orderId: string, newTitle: string, newProposedAction: string) => void;
  onOpenOrderInCenter: (orderId: string) => void;
  onOpenRuleById: (ruleId: string) => void;
  onAskAgent: (payload: AskAgentRequestPayload) => void;
  onSwitchTab: (tab: FinanceTabId) => void;
  onShowToast: (text: string, onUndo?: () => void) => void;
}

const PRIORITY_FINANCIAL_ORDER_IDS = [
  'ord-4822',
  'ord-4823',
  'ord-4809',
  'ord-4825',
  'ord-4807',
  'ord-4806',
];

export function FinanceiroTabVisaoGeral({
  period,
  orders,
  rules,
  onApproveOrder,
  onRejectOrder,
  onEditOrderDecision,
  onOpenOrderInCenter,
  onOpenRuleById,
  onAskAgent,
  onSwitchTab,
  onShowToast,
}: FinanceiroTabVisaoGeralProps) {
  const [expandedEvidence, setExpandedEvidence] = useState<Record<string, boolean>>({});
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editAction, setEditAction] = useState('');
  const [kpiOverrides, setKpiOverrides] = useState<Record<string, { value: string; by: string }>>({});
  const [selectedKpi, setSelectedKpi] = useState<FinanceKpiItem | null>(null);
  const [confirmHighValueOrder, setConfirmHighValueOrder] = useState<AgentOrder | null>(null);

  // Filter pending financial approvals
  const pendingDecisions = useMemo(() => {
    const finPending = orders.filter(
      (o) =>
        o.status === 'Aguardando aprovação' &&
        (o.category === 'Cobrança e financeiro' || o.id === 'ord-4809')
    );
    return [...finPending].sort((a, b) => {
      const ia = PRIORITY_FINANCIAL_ORDER_IDS.indexOf(a.id);
      const ib = PRIORITY_FINANCIAL_ORDER_IDS.indexOf(b.id);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return 0;
    });
  }, [orders]);

  // Evaluate GLO-003 dynamically for inadimplencia KPI
  const kpis = useMemo(() => {
    const base = FINANCE_KPIS_BY_PERIOD[period];
    const glo003 = rules.find((r) => r.id === 'GLO-003' && r.status === 'ativa');
    const inadVerde = Number(glo003?.entao.parametros?.inadimplenciaVerdeMax ?? 4);
    const inadVerm = Number(glo003?.entao.parametros?.inadimplenciaVermelhaMin ?? 7);

    return base.map((kpi) => {
      const override = kpiOverrides[kpi.id];
      const valStr = override?.value ?? kpi.value;
      const byStr = override?.by ?? kpi.registeredBy;

      if (kpi.id === 'fin-inadimplencia' && glo003) {
        const numeric = parseFloat(valStr.replace(',', '.').replace(/[^0-9.]/g, ''));
        if (!Number.isNaN(numeric)) {
          const sem: FinanceSemaphore =
            numeric <= inadVerde ? 'verde' : numeric > inadVerm ? 'vermelho' : 'ambar';
          return {
            ...kpi,
            value: valStr,
            registeredBy: byStr,
            semaphore: sem,
            semaphoreLabel: sem === 'verde' ? 'Saudável' : sem === 'vermelho' ? 'Crítico' : 'Atenção',
            semaphoreRule: `Regra GLO-003: ≤ ${inadVerde}% (crítico > ${inadVerm}%)`,
          };
        }
      }
      return { ...kpi, value: valStr, registeredBy: byStr };
    });
  }, [period, rules, kpiOverrides]);

  const receitaLinha = RECEITA_POR_LINHA_BY_PERIOD[period];
  const dre = DRE_GERENCIAL_BY_PERIOD[period];

  const handleCorrectKpi = (kpi: FinanceKpiItem, newValue: string) => {
    const prevSnapshot = kpiOverrides[kpi.id];
    setKpiOverrides((prev) => ({
      ...prev,
      [kpi.id]: { value: newValue, by: 'Corrigido por você' },
    }));
    onShowToast(`Indicador "${kpi.title}" corrigido em 1 clique.`, () => {
      setKpiOverrides((prev) => {
        const copy = { ...prev };
        if (prevSnapshot) copy[kpi.id] = prevSnapshot;
        else delete copy[kpi.id];
        return copy;
      });
    });
  };

  const handleTryApprove = (ord: AgentOrder) => {
    const isHighRepasse =
      ord.id === 'ord-4822' ||
      ord.id === 'ord-4807' ||
      (ord.subtype === 'Repasse' &&
        (ord.subject.includes('24.800') || ord.subject.includes('28.450')));
    if (isHighRepasse) {
      setConfirmHighValueOrder(ord);
      return;
    }
    onApproveOrder(ord.id);
  };

  return (
    <div className="space-y-6">
      {/* 1. SALDOS ESTRITAMENTE SEPARADOS (CONTA DE TERCEIROS vs CAIXA PRÓPRIO) */}
      <section aria-labelledby="heading-saldos-segregados">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h2
            id="heading-saldos-segregados"
            className="text-[12.5px] font-bold uppercase tracking-wider text-slate-500"
          >
            Saldos segregados
          </h2>
          <span className="inline-flex items-center gap-1.5 text-[11.5px] text-slate-500 font-medium">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Conta de terceiros e caixa próprio nunca são somados</span>
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Conta de Terceiros */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 flex flex-col justify-between gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="w-9 h-9 rounded-lg bg-[#EFF4FF] text-[#2563EB] flex items-center justify-center shrink-0">
                  <Landmark className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-[14.5px] font-semibold text-slate-900">
                    {SEGREGATED_BALANCES.contaTerceiros.titulo}
                  </h3>
                  <p className="text-[12px] text-slate-500 mt-0.5">
                    {SEGREGATED_BALANCES.contaTerceiros.subtitulo}
                  </p>
                </div>
              </div>
              <SemaphoreBadge semaphore="verde" label="Cobertura 1,13x" />
            </div>

            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100 tabular-nums">
              <div>
                <div className="text-[11.5px] text-slate-500">Saldo em conta</div>
                <div className="text-[19px] font-bold text-slate-900 mt-0.5">
                  {formatBRL(SEGREGATED_BALANCES.contaTerceiros.saldoEmConta)}
                </div>
              </div>
              <div>
                <div className="text-[11.5px] text-slate-500">Total a repassar</div>
                <div className="text-[19px] font-bold text-[#2563EB] mt-0.5">
                  {formatBRL(SEGREGATED_BALANCES.contaTerceiros.aRepassar)}
                </div>
              </div>
              <div>
                <div className="text-[11.5px] text-slate-500">Folga conciliada</div>
                <div className="text-[19px] font-bold text-emerald-700 mt-0.5">
                  {formatBRL(
                    SEGREGATED_BALANCES.contaTerceiros.saldoEmConta -
                      SEGREGATED_BALANCES.contaTerceiros.aRepassar
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[11.5px] text-slate-500 pt-2 border-t border-slate-100">
              <AgentRegisteredTag
                label={`Registrado pelo agente · ${SEGREGATED_BALANCES.contaTerceiros.ultimaConciliacao}`}
              />
              <button
                type="button"
                onClick={() => onSwitchTab('repasses')}
                className="inline-flex items-center gap-1 text-[#2563EB] font-semibold hover:underline"
              >
                <span>Ver 14 repasses</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Caixa Próprio da Imobiliária */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 flex flex-col justify-between gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <Briefcase className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-[14.5px] font-semibold text-slate-900">
                    {SEGREGATED_BALANCES.caixaProprio.titulo}
                  </h3>
                  <p className="text-[12px] text-slate-500 mt-0.5">
                    {SEGREGATED_BALANCES.caixaProprio.subtitulo}
                  </p>
                </div>
              </div>
              <SemaphoreBadge semaphore="verde" label="Operação positiva" />
            </div>

            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100 tabular-nums">
              <div>
                <div className="text-[11.5px] text-slate-500">Disponível próprio</div>
                <div className="text-[19px] font-bold text-slate-900 mt-0.5">
                  {formatBRL(SEGREGATED_BALANCES.caixaProprio.saldoDisponivel)}
                </div>
              </div>
              <div>
                <div className="text-[11.5px] text-slate-500">Comissões a pagar</div>
                <div className="text-[19px] font-bold text-slate-800 mt-0.5">
                  {formatBRL(SEGREGATED_BALANCES.caixaProprio.comissoesAPagar)}
                </div>
              </div>
              <div>
                <div className="text-[11.5px] text-slate-500">Resultado previsto</div>
                <div className="text-[19px] font-bold text-emerald-700 mt-0.5">
                  {formatBRL(dre.resultado)}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[11.5px] text-slate-500 pt-2 border-t border-slate-100">
              <AgentRegisteredTag label="Registrado pelo agente · Conta Corrente Farina" />
              <button
                type="button"
                onClick={() => onSwitchTab('contas-pagar')}
                className="inline-flex items-center gap-1 text-[#2563EB] font-semibold hover:underline"
              >
                <span>Ver contas a pagar</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PRECISA DE VOCÊ + ALERTAS DO FINANCEIRO */}
      <section aria-labelledby="heading-fin-precisa-voce" className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/90 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <h2
                id="heading-fin-precisa-voce"
                className="text-[15px] font-semibold text-slate-900"
              >
                Precisa de você no Financeiro
              </h2>
              <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-[#EFF4FF] text-[#2563EB] text-[12px] font-semibold tabular-nums">
                {pendingDecisions.length}
              </span>
            </div>
            <span className="text-[12px] text-slate-500">
              Sincronizado com a fila de pedidos do agente
            </span>
          </div>

          {pendingDecisions.length === 0 ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-6 text-center space-y-1.5">
              <CheckCircle2 className="w-6 h-6 text-emerald-700 mx-auto" />
              <p className="text-[13.5px] font-semibold text-slate-900">
                Nenhuma aprovação financeira pendente no momento.
              </p>
              <p className="text-[12px] text-slate-600">
                Novos repasses acima da alçada, descontos e notificações D+15 aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingDecisions.map((ord) => {
                const isEvidenceOpen = !!expandedEvidence[ord.id];
                const isEditing = editingOrderId === ord.id;
                const appliedRule = ord.appliedRules?.[0];

                return (
                  <article
                    key={ord.id}
                    className="rounded-xl border border-slate-200/90 p-4 space-y-3 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onOpenOrderInCenter(ord.id)}
                            className="font-mono text-[12px] font-bold text-[#2563EB] hover:underline"
                          >
                            {ord.protocol}
                          </button>
                          {appliedRule && (
                            <RuleAppliedChip
                              ruleId={appliedRule.ruleId}
                              versao={appliedRule.version}
                              onOpenRule={onOpenRuleById}
                            />
                          )}
                          <span className="text-[11.5px] text-slate-500 tabular-nums">
                            {ord.slaCommitted}
                          </span>
                        </div>

                        {isEditing ? (
                          <div className="space-y-2 pt-1">
                            <input
                              type="text"
                              value={editSubject}
                              onChange={(e) => setEditSubject(e.target.value)}
                              className="w-full px-2.5 py-1.5 text-[13px] font-semibold border border-[#2563EB] rounded-lg"
                              aria-label="Editar assunto"
                            />
                            <input
                              type="text"
                              value={editAction}
                              onChange={(e) => setEditAction(e.target.value)}
                              className="w-full px-2.5 py-1.5 text-[12px] border border-slate-300 rounded-lg bg-[#F8F9FB]"
                              aria-label="Editar ação proposta"
                            />
                          </div>
                        ) : (
                          <>
                            <h3 className="text-[13.5px] font-semibold text-slate-900">
                              {ord.subject}
                            </h3>
                            <p className="text-[12.5px] text-slate-600">
                              {ord.decisionMeta?.proposedAction ?? ord.objective}
                            </p>
                          </>
                        )}

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-[11.5px]">
                          <AgentRegisteredTag label={ord.registeredBy} />
                          <span className="text-slate-300">·</span>
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedEvidence((prev) => ({
                                ...prev,
                                [ord.id]: !prev[ord.id],
                              }))
                            }
                            className="inline-flex items-center gap-1 text-[#2563EB] font-medium hover:underline"
                          >
                            <span>Ver evidência</span>
                            {isEvidenceOpen ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1.5 shrink-0">
                        <span className="px-2 py-0.5 rounded-md border border-amber-200 bg-amber-50 text-amber-800 text-[11px] font-semibold">
                          {ord.decisionMeta?.pauseReason ?? 'Ação sensível'}
                        </span>
                        <span className="text-[11.5px] font-semibold text-slate-700 tabular-nums">
                          Confiança {ord.confidence}%
                        </span>
                      </div>
                    </div>

                    {isEvidenceOpen && (
                      <div className="rounded-lg border border-slate-200 bg-[#F8F9FB] px-3.5 py-2.5 text-[12px]">
                        <div className="font-semibold text-slate-800">
                          {ord.decisionMeta?.evidenceSource ?? ord.channel}
                        </div>
                        <p className="text-slate-600 mt-0.5">
                          {ord.decisionMeta?.evidenceExcerpt ?? ord.narrative}
                        </p>
                      </div>
                    )}

                    <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setEditingOrderId(null)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-600"
                          >
                            <X className="w-3.5 h-3.5" />
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (editSubject.trim()) {
                                onEditOrderDecision(
                                  ord.id,
                                  editSubject.trim(),
                                  editAction.trim()
                                );
                              }
                              setEditingOrderId(null);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#2563EB] text-white text-[12px] font-semibold"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Salvar correção
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => onRejectOrder(ord.id)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                          >
                            Recusar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingOrderId(ord.id);
                              setEditSubject(ord.subject);
                              setEditAction(ord.decisionMeta?.proposedAction ?? ord.objective);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <Pencil className="w-3 h-3" />
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTryApprove(ord)}
                            className="px-3.5 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-[12px] font-semibold"
                          >
                            Aprovar
                          </button>
                        </>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Alertas do Financeiro */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/90 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-slate-900">Alertas do agente</h2>
            <span className="text-[11.5px] font-medium text-[#5B3FD0]">Monitoramento contínuo</span>
          </div>

          <div className="space-y-2.5">
            {FINANCE_ALERTS.map((alert) => (
              <button
                key={alert.id}
                type="button"
                onClick={() => onSwitchTab(alert.tabTarget)}
                className="w-full text-left rounded-xl border border-slate-200/90 hover:border-slate-300 bg-[#F8F9FB]/60 p-3.5 transition-colors flex items-start justify-between gap-2.5"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <SemaphoreBadge
                      semaphore={alert.urgency === 'critico' ? 'vermelho' : 'ambar'}
                      label={alert.urgency === 'critico' ? 'Crítico' : 'Atenção'}
                    />
                    <span className="text-[13px] font-semibold text-slate-900">
                      {alert.title}
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-600">{alert.detail}</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. 6 INDICADORES FINANCEIROS CLICÁVEIS */}
      <section aria-labelledby="heading-fin-kpis" className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2
            id="heading-fin-kpis"
            className="text-[12.5px] font-bold uppercase tracking-wider text-slate-500"
          >
            Indicadores financeiros
          </h2>
          <span className="text-[12px] text-slate-500">
            Clique para abrir detalhamento, leitura do agente e pedir ação
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {kpis.map((kpi) => (
            <div
              key={kpi.id}
              onClick={() => setSelectedKpi(kpi)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedKpi(kpi);
                }
              }}
              className="bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 p-4 flex flex-col justify-between gap-3 cursor-pointer transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[13px] font-semibold text-slate-800">{kpi.title}</span>
                  <SemaphoreBadge
                    semaphore={kpi.semaphore}
                    label={kpi.semaphoreLabel}
                    title={kpi.semaphoreRule}
                  />
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-[22px] font-bold text-slate-900 tracking-tight tabular-nums">
                    {kpi.value}
                  </span>
                  <InlineOneClickCorrector
                    value={kpi.value}
                    ariaLabel={`Corrigir ${kpi.title}`}
                    onSave={(val) => handleCorrectKpi(kpi, val)}
                  />
                </div>

                <div className="space-y-0.5 text-[11.5px] tabular-nums">
                  <div className="text-slate-700 font-medium">{kpi.comparisonPrev}</div>
                  <div className="text-slate-500">
                    {kpi.comparisonTarget} · {kpi.semaphoreRule}
                  </div>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                <AgentRegisteredTag label={kpi.registeredBy} />
                <span className="inline-flex items-center gap-0.5 text-[11.5px] font-semibold text-[#2563EB]">
                  Detalhar
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. GRÁFICOS: RECEITA POR LINHA + FLUXO 30D + DRE GERENCIAL */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Receita por linha */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/90 p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-[14.5px] font-semibold text-slate-900">Receita por linha</h3>
            <p className="text-[12px] text-slate-500 mt-0.5">
              Composição do faturamento próprio da imobiliária
            </p>
          </div>

          <div className="h-[220px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={receitaLinha}
                layout="vertical"
                margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis
                  type="number"
                  tickFormatter={(v) => `R$ ${Math.round(v / 1000)}k`}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                />
                <YAxis
                  type="category"
                  dataKey="linha"
                  width={132}
                  tick={{ fontSize: 11, fill: '#334155' }}
                />
                <Tooltip
                  formatter={(v) => [formatBRL(Number(v ?? 0)), 'Realizado']}
                  contentStyle={{ borderRadius: '10px', borderColor: '#E2E8F0', fontSize: '12px' }}
                />
                <Bar dataKey="valor" fill="#2563EB" radius={[0, 6, 6, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-1 text-[12px] tabular-nums">
            {receitaLinha.map((item) => (
              <div key={item.linha} className="flex items-center justify-between text-slate-600">
                <span>{item.linha}</span>
                <span className="font-semibold text-slate-900">{formatBRLCompact(item.valor)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fluxo projetado 30 dias */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 p-5 flex flex-col justify-between">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="text-[14.5px] font-semibold text-slate-900">
                Fluxo projetado de 30 dias
              </h3>
              <p className="text-[12px] text-slate-500 mt-0.5">
                Entradas vs. saídas semanais previstas pelo agente
              </p>
            </div>
            <span className="text-[12px] font-bold text-emerald-700 tabular-nums">
              Saldo +{formatBRLCompact(FLUXO_PROJETADO_30D.totais.saldo)}
            </span>
          </div>

          <div className="h-[220px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={FLUXO_PROJETADO_30D.semanas}
                margin={{ top: 8, right: 8, left: 0, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="semana" tick={{ fontSize: 10.5, fill: '#64748B' }} />
                <YAxis
                  tickFormatter={(v) => `R$ ${Math.round(v / 1000)}k`}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                />
                <Tooltip
                  formatter={(v, name) => [
                    formatBRL(Number(v ?? 0)),
                    name === 'entradas' ? 'Entradas' : 'Saídas',
                  ]}
                  contentStyle={{ borderRadius: '10px', borderColor: '#E2E8F0', fontSize: '12px' }}
                />
                <Legend
                  formatter={(v) => (v === 'entradas' ? 'Entradas' : 'Saídas')}
                  wrapperStyle={{ fontSize: '11.5px' }}
                />
                <Bar dataKey="entradas" fill="#2563EB" radius={[6, 6, 0, 0]} />
                <Bar dataKey="saidas" fill="#94A3B8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-[12px] tabular-nums">
            <div>
              <div className="text-slate-500">Entradas 30d</div>
              <div className="font-bold text-slate-900">
                {formatBRLCompact(FLUXO_PROJETADO_30D.totais.entradas)}
              </div>
            </div>
            <div>
              <div className="text-slate-500">Saídas 30d</div>
              <div className="font-bold text-slate-900">
                {formatBRLCompact(FLUXO_PROJETADO_30D.totais.saidas)}
              </div>
            </div>
            <div>
              <div className="text-slate-500">Saldo líquido</div>
              <div className="font-bold text-emerald-700">
                +{formatBRLCompact(FLUXO_PROJETADO_30D.totais.saldo)}
              </div>
            </div>
          </div>
        </div>

        {/* Resultado do mês — DRE Gerencial */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200/90 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[14.5px] font-semibold text-slate-900">Resultado do mês</h3>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10.5px] font-semibold">
                DRE gerencial
              </span>
            </div>
            <p className="text-[11.5px] text-slate-500 mt-1">
              Estimativa gerencial consolidada pelo agente (não substitui balancete contábil).
            </p>

            <div className="mt-4 space-y-2.5 text-[13px] tabular-nums">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-700">Receita própria</span>
                <span className="font-semibold text-slate-900">{formatBRLCompact(dre.receita)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">(-) Comissões</span>
                <span className="font-medium text-red-700">
                  -{formatBRLCompact(dre.comissoes)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">(-) Despesas operacionais</span>
                <span className="font-medium text-red-700">
                  -{formatBRLCompact(dre.despesasOperacionais)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="font-bold text-slate-900">(=) Resultado gerencial</span>
                <span className="text-[17px] font-bold text-emerald-700">
                  {formatBRLCompact(dre.resultado)}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <AgentRegisteredTag label="Registrado pelo agente" />
            <button
              type="button"
              onClick={() =>
                onAskAgent({
                  title: 'Pedir resumo gerencial DRE',
                  prefillText:
                    'Gerar comparativo detalhado do DRE gerencial do mês com variação de despesas operacionais e repassar resumo por e-mail.',
                  subtipo: 'Cobrança',
                  actionType: 'pagamento_fornecedor',
                  evalParams: { valor: 0 },
                })
              }
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#F3F0FF] hover:bg-[#EAE4FF] text-[#5B3FD0] text-[12px] font-semibold transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pedir análise ao agente</span>
            </button>
          </div>
        </div>
      </section>

      {/* KPI DETAIL DRAWER */}
      {selectedKpi && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-[1px]"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0"
            onClick={() => setSelectedKpi(null)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-xl bg-white h-full border-l border-slate-200 flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-[16px] font-bold text-slate-900">{selectedKpi.title}</h2>
                  <SemaphoreBadge
                    semaphore={selectedKpi.semaphore}
                    label={selectedKpi.semaphoreLabel}
                  />
                </div>
                <div className="text-[13px] text-slate-600 mt-1 tabular-nums">
                  <strong className="text-slate-900">{selectedKpi.value}</strong> ·{' '}
                  {selectedKpi.comparisonPrev} · {selectedKpi.comparisonTarget}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedKpi(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="rounded-xl border border-[#5B3FD0]/25 bg-[#F3F0FF]/60 p-4 space-y-3">
                <div className="flex items-center gap-1.5 text-[12.5px] font-semibold text-[#5B3FD0]">
                  <Sparkles className="w-4 h-4" />
                  <span>Leitura do agente</span>
                </div>
                <p className="text-[13px] text-slate-800 leading-relaxed">
                  {selectedKpi.agentReading}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const current = selectedKpi;
                    setSelectedKpi(null);
                    onAskAgent({
                      title: `Pedir ao agente · ${current.title}`,
                      prefillText: current.pedirPrompt,
                      subtipo: current.pedirSubtipo,
                      actionType: current.pedirActionType,
                      evalParams: current.pedirEvalParams,
                    });
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#5B3FD0] hover:bg-[#4C32B8] text-white text-[12.5px] font-semibold"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Pedir ao agente</span>
                </button>
              </div>

              <div className="rounded-xl border border-slate-200 overflow-x-auto">
                <table className="w-full text-left border-collapse text-[12.5px]">
                  <thead>
                    <tr className="bg-[#F8F9FB] border-b border-slate-200 text-slate-600">
                      {selectedKpi.drawerColumns.map((col) => (
                        <th key={col} className="py-2.5 px-3 font-semibold text-[11.5px]">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 tabular-nums">
                    {selectedKpi.drawerRows.map((row, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-3 font-medium text-slate-900">{row.col1}</td>
                        <td className="py-2.5 px-3 text-slate-600">{row.col2}</td>
                        <td className="py-2.5 px-3 text-slate-700">{row.col3}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{row.col4}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HIGH VALUE REPASSE IMPACT CONFIRMATION MODAL (> R$ 20.000) */}
      {confirmHighValueOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 backdrop-blur-[1px] p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-start gap-3">
              <span className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-[15px] font-bold text-slate-900">
                  Confirmar impacto do repasse ({confirmHighValueOrder.protocol})
                </h3>
                <p className="text-[12.5px] text-slate-600 mt-1">
                  {confirmHighValueOrder.subject}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-[#F8F9FB] p-3.5 space-y-1.5 text-[12px] tabular-nums">
              <div className="flex justify-between">
                <span className="text-slate-500">Origem</span>
                <span className="font-semibold text-slate-900">Conta de Terceiros</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Regra aplicada</span>
                <span className="font-semibold text-[#5B3FD0]">FIN-003 v1 (&gt; R$ 20.000)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Saldo após liberação</span>
                <span className="font-semibold text-emerald-700">R$ 216.200,00 (cobertura OK)</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setConfirmHighValueOrder(null)}
                className="px-3.5 py-2 rounded-lg border border-slate-200 text-[12.5px] font-medium text-slate-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = confirmHighValueOrder;
                  setConfirmHighValueOrder(null);
                  onApproveOrder(target.id);
                }}
                className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-[12.5px] font-semibold"
              >
                Confirmar e liberar remessa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
