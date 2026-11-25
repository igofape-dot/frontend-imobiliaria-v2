import { useMemo, useState } from 'react';
import {
  Check,
  X,
  Pencil,
  Eye,
  AlertTriangle,
  AlertOctagon,
  ShieldCheck,
  Clock,
  Ban,
  Bot,
  ArrowUpRight,
  Sparkles,
  Sliders,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import {
  formatBRL,
  type FinancePeriod,
  type FinanceSemaphore,
} from '../../data/financeiroData';
import type { AgentOrder } from '../../data/agentOrdersData';
import type { PerfilRegra, Regra } from '../../data/rulesData';
import {
  ENTRADAS_PREVISTAS_90D,
  ESTIMATE_COMPARABLES_LABEL,
  INITIAL_VACANT_28,
  LOCACAO_ALERTS,
  LOCACAO_AUTONOMY_MAP,
  LOCACAO_FUNNEL_BY_PERIOD,
  LOCACAO_KPIS_BY_PERIOD,
  TAXA_ADM_MES_CARD,
  VACANCY_BY_REGION,
  VACANCY_BY_TYPE,
  VACANCY_TREND_12M,
  VAGOS_STAGE_BREAKDOWN,
  type LocacaoKpiItem,
  type LocacaoTabId,
  type VacantPropertyItem,
} from '../../data/locacaoData';
import type { AskAgentRequestPayload } from '../financeiro/AskAgentOrderDrawer';
import {
  AgentRegisteredTag,
  RuleAppliedChip,
  SemaphoreBadge,
} from '../financeiro/FinanceiroShared';

interface LocacaoTabVisaoGeralProps {
  period: FinancePeriod;
  orders: AgentOrder[];
  rules: Regra[];
  perfil: PerfilRegra;
  readOnly: boolean;
  onNavigateTab: (tab: LocacaoTabId) => void;
  onNavigateModule: (navId: 'manutencao-vistorias' | 'contratos-juridico' | 'financeiro' | 'captacao-marketing') => void;
  onApproveOrder: (orderId: string) => void;
  onRejectOrder: (orderId: string) => void;
  onEditOrderDecision: (orderId: string, newTitle: string, newProposedAction: string) => void;
  onOpenOrderInCenter: (orderId: string) => void;
  onOpenRuleById: (ruleId: string) => void;
  onCreateConcessaoRuleDraft: () => void;
  onAskAgent: (req: AskAgentRequestPayload) => void;
  onOpenSimulator: (vacant: VacantPropertyItem) => void;
}

const LOCACAO_PENDING_ORDER_IDS = new Set(['ord-4829', 'ord-4830', 'ord-4831', 'ord-4832']);

export function LocacaoTabVisaoGeral({
  period,
  orders,
  rules,
  perfil,
  readOnly,
  onNavigateTab,
  onNavigateModule,
  onApproveOrder,
  onRejectOrder,
  onEditOrderDecision,
  onOpenOrderInCenter,
  onOpenRuleById,
  onCreateConcessaoRuleDraft,
  onAskAgent,
  onOpenSimulator,
}: LocacaoTabVisaoGeralProps) {
  const [expandedEvidenceId, setExpandedEvidenceId] = useState<string | null>(null);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editActionDraft, setEditActionDraft] = useState('');
  const [selectedKpi, setSelectedKpi] = useState<LocacaoKpiItem | null>(null);
  const [confirmPriceOrder, setConfirmPriceOrder] = useState<AgentOrder | null>(null);
  const [funnelRange, setFunnelRange] = useState<'hoje' | '7d' | '30d'>('30d');

  // Pending decisions belonging to Locação e Administração
  const pendingOrders = useMemo(() => {
    return orders.filter((o) => {
      if (o.status !== 'Aguardando aprovação') return false;
      const isLoc =
        LOCACAO_PENDING_ORDER_IDS.has(o.id) ||
        o.category === 'Vendas e captação' ||
        (o.category === 'Cadastro e atualização' && o.subtype === 'Cadastro de imóvel');
      if (!isLoc) return false;
      if (perfil === 'Corretor') {
        // Corretor sees his own proposals/properties (ord-4829 Figueiras, ord-4830 Renata, ord-4832 Bruno)
        // never owner-level admin fee negotiations unless his own
        return o.id === 'ord-4829' || o.id === 'ord-4830' || o.id === 'ord-4832';
      }
      return true;
    });
  }, [orders, perfil]);

  // Sync Vacância & Tempo médio KPI semaphores with active LOC-006
  const kpis = useMemo(() => {
    const base = LOCACAO_KPIS_BY_PERIOD[period] ?? LOCACAO_KPIS_BY_PERIOD.mes;
    const loc006 = rules.find((r) => r.id === 'LOC-006' && r.status === 'ativa');
    const vacVerde = Number(loc006?.entao.parametros?.vacanciaVerdeMax ?? 5);
    const vacVerm = Number(loc006?.entao.parametros?.vacanciaVermelhaMin ?? 8);
    const tempoVerde = Number(loc006?.entao.parametros?.tempoAlugarVerdeMaxDias ?? 30);
    const tempoVerm = Number(loc006?.entao.parametros?.tempoAlugarVermelhoMinDias ?? 45);
    const currentVac = period === '12m' ? 5.7 : 6.8;
    const vacSem: FinanceSemaphore =
      currentVac <= vacVerde ? 'verde' : currentVac > vacVerm ? 'vermelho' : 'ambar';
    const currentTempo = 27;
    const tempoSem: FinanceSemaphore =
      currentTempo <= tempoVerde ? 'verde' : currentTempo > tempoVerm ? 'vermelho' : 'ambar';

    return base.map((k) => {
      if (k.id === 'loc-vacancia') {
        return {
          ...k,
          semaphore: vacSem,
          semaphoreLabel:
            vacSem === 'verde' ? 'Saudável' : vacSem === 'vermelho' ? 'Crítico' : 'Atenção',
          semaphoreRule: `Regra LOC-006: verde ≤ ${vacVerde}% · crítico > ${vacVerm}%`,
        };
      }
      if (k.id === 'loc-tempo-alugar') {
        return {
          ...k,
          semaphore: tempoSem,
          semaphoreLabel:
            tempoSem === 'verde' ? 'Saudável' : tempoSem === 'vermelho' ? 'Crítico' : 'Atenção',
          semaphoreRule: `Regra LOC-006: verde ≤ ${tempoVerde}d · crítico > ${tempoVerm}d`,
        };
      }
      return k;
    });
  }, [period, rules]);

  const loc006Rule = rules.find((r) => r.id === 'LOC-006' && r.status === 'ativa');
  const vacVerdeLine = Number(loc006Rule?.entao.parametros?.vacanciaVerdeMax ?? 5);
  const vacVermBand = Number(loc006Rule?.entao.parametros?.vacanciaVermelhaMin ?? 8);

  const visibleAlerts = useMemo(() => {
    if (perfil === 'Corretor') {
      return LOCACAO_ALERTS.filter(
        (a) => a.targetTab !== 'captacao-retencao' && a.targetTab !== 'definir-regras'
      );
    }
    return LOCACAO_ALERTS;
  }, [perfil]);

  const handleApproveCard = (order: AgentOrder) => {
    if (readOnly) return;
    if (order.id === 'ord-4829') {
      setConfirmPriceOrder(order);
      return;
    }
    onApproveOrder(order.id);
  };

  return (
    <div className="space-y-6">
      {/* 1. PRECISA DE VOCÊ + ALERTAS */}
      <section className="space-y-3" aria-labelledby="loc-precisa-voce">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2
            id="loc-precisa-voce"
            className="text-[13px] font-bold uppercase tracking-wider text-slate-500"
          >
            Precisa de você ({pendingOrders.length})
          </h2>
          <span className="text-[12px] text-slate-500">
            Sincronizado com a fila de pedidos do Agente de IA
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Decision cards */}
          <div className="lg:col-span-8 space-y-3">
            {pendingOrders.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-center space-y-1.5">
                <p className="text-[14px] font-semibold text-slate-800">
                  Nenhuma pendência aguardando sua decisão neste perfil
                </p>
                <p className="text-[12px] text-slate-500">
                  Pedidos liberados avançam imediatamente na fila e permanecem auditáveis em Agente de IA.
                </p>
              </div>
            ) : (
              pendingOrders.map((order) => {
                const primaryRule = order.appliedRules?.[0];
                const isGapOrder = order.id === 'ord-4832';
                const isEditing = editingOrderId === order.id;
                const isEvidenceOpen = expandedEvidenceId === order.id;

                return (
                  <div
                    key={order.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 space-y-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onOpenOrderInCenter(order.id)}
                            className="font-mono text-[11.5px] font-bold text-[#2563EB] hover:underline"
                          >
                            {order.protocol}
                          </button>
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                            {isGapOrder ? 'Lacuna de regra · Só sugerir' : order.status}
                          </span>
                          <span className="text-[11px] text-slate-500 tabular-nums">
                            {order.slaText} · confiança {order.confidence}%
                          </span>
                          {primaryRule && (
                            <RuleAppliedChip
                              ruleId={primaryRule.ruleId}
                              versao={primaryRule.version}
                              onOpenRule={onOpenRuleById}
                            />
                          )}
                        </div>
                        <h3 className="text-[14px] font-bold text-slate-900">
                          {order.subject}
                        </h3>

                        {isEditing ? (
                          <div className="pt-1 space-y-2">
                            <textarea
                              rows={2}
                              value={editActionDraft}
                              onChange={(e) => setEditActionDraft(e.target.value)}
                              className="w-full px-3 py-2 text-[12px] rounded-lg border border-[#2563EB] bg-white text-slate-900"
                            />
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  if (editActionDraft.trim()) {
                                    onEditOrderDecision(order.id, order.subject, editActionDraft.trim());
                                  }
                                  setEditingOrderId(null);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-[#2563EB] text-white text-[12px] font-semibold"
                              >
                                Salvar ajuste
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingOrderId(null)}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-[12px] font-medium"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-[12.5px] text-slate-600 leading-relaxed">
                            {order.decisionMeta?.proposedAction ?? order.objective}
                          </p>
                        )}
                      </div>
                    </div>

                    {isEvidenceOpen && order.decisionMeta && (
                      <div className="rounded-lg border border-slate-200 bg-[#F8F9FB] px-3 py-2.5 text-[12px] space-y-1">
                        <div className="font-semibold text-slate-700">
                          Fonte: {order.decisionMeta.evidenceSource}
                        </div>
                        <p className="text-slate-600">{order.decisionMeta.evidenceExcerpt}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <AgentRegisteredTag label={order.registeredBy} />

                      <div className="flex flex-wrap items-center gap-1.5">
                        {order.id === 'ord-4829' && (
                          <button
                            type="button"
                            onClick={() => onOpenSimulator(INITIAL_VACANT_28[0])}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-[#F8F9FB] hover:bg-slate-100 text-[12px] font-medium text-slate-700"
                          >
                            <Sliders className="w-3.5 h-3.5 text-[#5B3FD0]" />
                            Ver simulação
                          </button>
                        )}

                        {isGapOrder && !readOnly && (
                          <button
                            type="button"
                            onClick={onCreateConcessaoRuleDraft}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-[12px] font-semibold text-amber-900"
                          >
                            Criar regra para concessões
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            setExpandedEvidenceId((prev) => (prev === order.id ? null : order.id))
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-600 hover:bg-slate-50"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          {isEvidenceOpen ? 'Ocultar fonte' : 'Ver fonte'}
                        </button>

                        {!readOnly && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingOrderId(order.id);
                                setEditActionDraft(
                                  order.decisionMeta?.proposedAction ?? order.objective
                                );
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-600 hover:bg-slate-50"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => onRejectOrder(order.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50/70 hover:bg-red-100 text-[12px] font-semibold text-red-700"
                            >
                              <X className="w-3.5 h-3.5" />
                              Recusar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleApproveCard(order)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-[12px] font-semibold"
                            >
                              <Check className="w-3.5 h-3.5" />
                              {isGapOrder ? 'Aprovar sugestão' : 'Aprovar'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* 9 Operational alerts */}
          <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-[13.5px] font-bold text-slate-900">
                Alertas operacionais ({visibleAlerts.length})
              </h3>
              <span className="text-[11px] font-medium text-slate-500">Carteira e funil</span>
            </div>
            <div className="divide-y divide-slate-100 max-h-[540px] overflow-y-auto">
              {visibleAlerts.map((alt) => (
                <div key={alt.id} className="px-4 py-3 flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2 min-w-0">
                    {alt.urgencia === 'critico' ? (
                      <AlertOctagon className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0">
                      <div className="text-[12.5px] font-semibold text-slate-900 leading-snug">
                        {alt.titulo}
                      </div>
                      <div className="text-[11.5px] text-slate-500 mt-0.5 leading-snug">
                        {alt.detalhe}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (alt.externalNav) {
                        onNavigateModule(alt.externalNav);
                      } else if (alt.askPayload && !readOnly) {
                        onAskAgent(alt.askPayload);
                      } else if (alt.targetTab) {
                        onNavigateTab(alt.targetTab);
                      }
                    }}
                    className="shrink-0 text-[11.5px] font-semibold text-[#2563EB] hover:underline whitespace-nowrap"
                  >
                    {alt.actionLabel}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. KPI GRID (8 KPIs + Taxa de administração card) */}
      <section className="space-y-3" aria-labelledby="loc-kpis-title">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2
            id="loc-kpis-title"
            className="text-[13px] font-bold uppercase tracking-wider text-slate-500"
          >
            Indicadores de locação e carteira
          </h2>
          <span className="text-[12px] text-slate-500">
            Clique em qualquer número para leitura do agente e ação
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <button
              key={kpi.id}
              type="button"
              onClick={() => setSelectedKpi(kpi)}
              className="text-left rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300 transition-colors flex flex-col justify-between gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
            >
              <div className="flex items-start justify-between gap-2 w-full">
                <span className="text-[12.5px] font-semibold text-slate-600 leading-snug">
                  {kpi.title}
                </span>
                <SemaphoreBadge
                  semaphore={kpi.semaphore}
                  label={kpi.semaphoreLabel}
                  title={kpi.semaphoreRule}
                />
              </div>

              <div>
                <div className="text-[22px] font-bold text-slate-900 tracking-tight tabular-nums">
                  {kpi.value}
                </div>
                <div className="text-[11.5px] text-slate-600 mt-1">{kpi.comparisonPrev}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{kpi.comparisonTarget}</div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 w-full">
                <span className="text-[11px] text-[#5B3FD0] font-medium truncate">
                  {kpi.isEstimate ? ESTIMATE_COMPARABLES_LABEL : kpi.registeredBy}
                </span>
                <span className="text-[11px] font-semibold text-[#2563EB] shrink-0">
                  Detalhar →
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Secondary Taxa de administração card */}
        {perfil !== 'Corretor' && (
          <div className="rounded-xl border border-slate-200 bg-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[12.5px] font-semibold text-slate-600">
                {TAXA_ADM_MES_CARD.titulo}:
              </span>
              <span className="text-[17px] font-bold text-slate-900 tabular-nums">
                {formatBRL(TAXA_ADM_MES_CARD.valor)}
              </span>
              <span className="text-[12px] text-slate-500">
                ({TAXA_ADM_MES_CARD.comparacao})
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigateModule('financeiro')}
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#2563EB] hover:underline"
            >
              <span>Ver faturamento no Financeiro</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </section>

      {/* 3. CHARTS: VACÂNCIA 12M + POR QUE OS 28 ESTÃO VAGOS */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="text-[14.5px] font-bold text-slate-900">
                Vacância nos últimos 12 meses (%)
              </h3>
              <p className="text-[12px] text-slate-500">
                Linha tracejada = meta ≤ {vacVerdeLine}% · Faixa âmbar = {vacVerdeLine}% a {vacVermBand}% (LOC-006)
              </p>
            </div>
            <RuleAppliedChip
              ruleId="LOC-006"
              versao={loc006Rule?.versao ?? 2}
              onOpenRule={onOpenRuleById}
            />
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={VACANCY_TREND_12M} margin={{ top: 10, right: 16, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis
                  domain={[3, 9]}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                />
                <Tooltip
                  formatter={(v) => [`${v}%`, 'Vacância']}
                  contentStyle={{ borderRadius: 10, borderColor: '#E2E8F0', fontSize: 12 }}
                />
                <ReferenceArea
                  y1={vacVerdeLine}
                  y2={vacVermBand}
                  fill="#FEF3C7"
                  fillOpacity={0.45}
                />
                <ReferenceLine
                  y={vacVerdeLine}
                  stroke="#059669"
                  strokeDasharray="4 4"
                  label={{ value: `Meta ${vacVerdeLine}%`, position: 'insideTopRight', fontSize: 11, fill: '#059669' }}
                />
                <Line
                  type="monotone"
                  dataKey="taxa"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: '#2563EB' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Por que os 28 imóveis estão vagos */}
        <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div>
              <h3 className="text-[14.5px] font-bold text-slate-900">
                Por que os 28 imóveis estão vagos
              </h3>
              <p className="text-[12px] text-slate-500">
                11 de 28 imóveis (39%) ainda não estão prontos para anunciar
              </p>
            </div>

            <div className="space-y-2.5">
              {VAGOS_STAGE_BREAKDOWN.map((item) => {
                const barColor =
                  item.tone === 'emerald'
                    ? 'bg-emerald-500'
                    : item.tone === 'amber'
                    ? 'bg-amber-500'
                    : 'bg-red-500';
                return (
                  <div key={item.stage} className="space-y-1">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="font-medium text-slate-800">{item.stage}</span>
                      <span className="font-bold text-slate-900 tabular-nums">
                        {item.count} ({item.pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${barColor}`}
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {!readOnly && (
            <button
              type="button"
              onClick={() =>
                onAskAgent({
                  title: 'Destravar os 11 imóveis vagos não prontos',
                  prefillText:
                    'Cobrar os 3 laudos de vistoria de saída, agilizar orçamentos dos 4 imóveis em reparo, solicitar as 2 autorizações faltantes aos proprietários e agendar fotógrafo para os 2 imóveis sem fotos.',
                  categoria: 'Cadastro e atualização',
                  subtipo: 'Cadastro de imóvel',
                  actionType: 'destravar_imovel',
                  evalParams: {},
                })
              }
              className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#5B3FD0] hover:bg-[#4C32B8] text-white text-[12.5px] font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pedir ao agente: destravar os 11</span>
            </button>
          )}
        </div>
      </section>

      {/* 4. VACÂNCIA POR REGIÃO / TIPO + FUNIL + ENTRADAS PREVISTAS 90D */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Região e Tipo */}
        <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <h3 className="text-[14.5px] font-bold text-slate-900">
            Vacância por região e por tipo
          </h3>

          <div className="space-y-2">
            <div className="text-[11.5px] font-bold uppercase tracking-wider text-slate-500">
              Por região (28 de 412)
            </div>
            {VACANCY_BY_REGION.map((r) => (
              <div
                key={r.regiao}
                className="flex items-center justify-between text-[12.5px] py-1 border-b border-slate-100 last:border-0"
              >
                <span className="text-slate-800 font-medium">{r.regiao}</span>
                <span className="tabular-nums text-slate-700">
                  <strong>{r.vagos}</strong> de {r.total} ({r.taxaPct.toFixed(1).replace('.', ',')}%)
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="text-[11.5px] font-bold uppercase tracking-wider text-slate-500">
              Por tipo (28 de 412)
            </div>
            {VACANCY_BY_TYPE.map((t) => (
              <div
                key={t.tipo}
                className="flex items-center justify-between text-[12.5px] py-1 border-b border-slate-100 last:border-0"
              >
                <span className="text-slate-800 font-medium">{t.tipo}</span>
                <span className="tabular-nums text-slate-700">
                  <strong>{t.vagos}</strong> de {t.total} ({t.taxaPct.toFixed(1).replace('.', ',')}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Funil de locação */}
        <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[14.5px] font-bold text-slate-900">Funil de locação</h3>
              <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-[#F8F9FB]">
                {(['hoje', '7d', '30d'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setFunnelRange(r)}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold ${
                      funnelRange === r
                        ? 'bg-[#2563EB] text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {r === 'hoje' ? 'Hoje' : r === '7d' ? '7 dias' : '30 dias'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {LOCACAO_FUNNEL_BY_PERIOD[funnelRange].map((step) => (
                <div
                  key={step.etapa}
                  className={`rounded-lg border px-3 py-2 flex items-center justify-between text-[12px] ${
                    step.gargalo
                      ? 'border-amber-200 bg-amber-50/60'
                      : 'border-slate-200 bg-[#F8F9FB]'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-slate-900">{step.etapa}</div>
                    {step.gargalo && (
                      <div className="text-[11px] font-medium text-amber-800">
                        Principal gargalo: Visita → Proposta
                      </div>
                    )}
                  </div>
                  <div className="text-right tabular-nums">
                    <div className="font-bold text-slate-900">{step.qtd}</div>
                    <div className="text-[11px] text-slate-500">{step.convAnteriorPct}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('locacao')}
            className="text-[12px] font-semibold text-[#2563EB] hover:underline self-start"
          >
            Abrir fila de visitas e propostas →
          </button>
        </div>

        {/* Entradas previstas na vacância (90d) */}
        <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-[14.5px] font-bold text-slate-900">
                Entradas previstas na vacância (90 dias)
              </h3>
              <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold tabular-nums shrink-0">
                ≈ {ENTRADAS_PREVISTAS_90D.totalPrevisto} imóveis
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-[12px]">
              <div className="rounded-lg border border-slate-200 bg-[#F8F9FB] p-3">
                <div className="text-slate-500">Rescisões em curso</div>
                <div className="text-[18px] font-bold text-slate-900 tabular-nums mt-0.5">
                  {ENTRADAS_PREVISTAS_90D.rescisoesEmCurso}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-[#F8F9FB] p-3">
                <div className="text-slate-500">Sem retorno (de 37)</div>
                <div className="text-[18px] font-bold text-slate-900 tabular-nums mt-0.5">
                  ≈ {ENTRADAS_PREVISTAS_90D.renovacoesSemRespostaEstimada}
                </div>
              </div>
            </div>

            <p className="text-[12px] text-slate-600 leading-relaxed">
              {ENTRADAS_PREVISTAS_90D.leituraAgente}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigateModule('contratos-juridico')}
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#2563EB] hover:underline self-start"
          >
            <span>Ver 37 contratos em Contratos e Jurídico</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* 5. MAPA DE AUTONOMIA DO MÓDULO */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-[14.5px] font-bold text-slate-900">
              Mapa de autonomia em Locação e Administração
            </h3>
            <p className="text-[12px] text-slate-500">
              O que o agente executa sozinho, submete para aprovação, apenas sugere ou bloqueia por regra
            </p>
          </div>
          {perfil === 'Gestor' && (
            <button
              type="button"
              onClick={() => onNavigateTab('definir-regras')}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-[12px] font-semibold text-slate-700 hover:bg-slate-50"
            >
              Ajustar em Definir regras →
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3.5 space-y-2.5">
            <div className="flex items-center gap-1.5 text-[12px] font-bold text-emerald-800">
              <ShieldCheck className="w-4 h-4" />
              <span>Autônomo</span>
            </div>
            <ul className="space-y-2 text-[12px] text-slate-700">
              {LOCACAO_AUTONOMY_MAP.autonomo.map((item) => (
                <li key={item.texto}>
                  <div>{item.texto}</div>
                  <div className="text-[11px] font-semibold text-[#5B3FD0]">{item.regra}</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3.5 space-y-2.5">
            <div className="flex items-center gap-1.5 text-[12px] font-bold text-amber-800">
              <Clock className="w-4 h-4" />
              <span>Com aprovação</span>
            </div>
            <ul className="space-y-2 text-[12px] text-slate-700">
              {LOCACAO_AUTONOMY_MAP.aprovacao.map((item) => (
                <li key={item.texto}>
                  <div>{item.texto}</div>
                  <div className="text-[11px] font-semibold text-[#5B3FD0]">{item.regra}</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-3.5 space-y-2.5">
            <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#2563EB]">
              <Sparkles className="w-4 h-4" />
              <span>Só sugerir</span>
            </div>
            <ul className="space-y-2 text-[12px] text-slate-700">
              {LOCACAO_AUTONOMY_MAP.sugerir.map((item) => (
                <li key={item.texto}>
                  <div>{item.texto}</div>
                  <div className="text-[11px] font-semibold text-amber-800">{item.regra}</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-red-200 bg-red-50/40 p-3.5 space-y-2.5">
            <div className="flex items-center gap-1.5 text-[12px] font-bold text-red-700">
              <Ban className="w-4 h-4" />
              <span>Bloqueado</span>
            </div>
            <ul className="space-y-2 text-[12px] text-slate-700">
              {LOCACAO_AUTONOMY_MAP.bloqueado.map((item) => (
                <li key={item.texto}>
                  <div>{item.texto}</div>
                  <div className="text-[11px] font-semibold text-red-700">{item.regra}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* KPI DETAIL DRAWER */}
      {selectedKpi && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-[1px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="loc-kpi-drawer-title"
        >
          <div className="fixed inset-0" onClick={() => setSelectedKpi(null)} aria-hidden="true" />
          <div className="relative z-10 w-full max-w-xl bg-white h-full border-l border-slate-200 flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <SemaphoreBadge
                    semaphore={selectedKpi.semaphore}
                    label={selectedKpi.semaphoreLabel}
                  />
                  <span className="text-[11px] text-slate-500">{selectedKpi.semaphoreRule}</span>
                </div>
                <h2 id="loc-kpi-drawer-title" className="text-[17px] font-bold text-slate-900 mt-1">
                  {selectedKpi.title}: {selectedKpi.value}
                </h2>
                <p className="text-[12px] text-slate-500">{selectedKpi.comparisonPrev}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedKpi(null)}
                aria-label="Fechar detalhes do indicador"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              <div className="rounded-xl border border-slate-200 bg-[#F8F9FB] p-4 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#5B3FD0]">
                  <Bot className="w-3.5 h-3.5" />
                  <span>Leitura do agente</span>
                </div>
                <p className="text-[13px] text-slate-700 leading-relaxed">
                  {selectedKpi.agentReading}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse text-[12.5px]">
                  <thead className="bg-[#F8F9FB] border-b border-slate-200 text-slate-500 font-semibold">
                    <tr>
                      {selectedKpi.drawerColumns.map((col) => (
                        <th key={col} className="px-3.5 py-2.5">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedKpi.drawerRows.map((row, i) => (
                      <tr key={i} className="bg-white">
                        <td className="px-3.5 py-2.5 font-medium text-slate-900">{row.col1}</td>
                        <td className="px-3.5 py-2.5 tabular-nums text-slate-700">{row.col2}</td>
                        <td className="px-3.5 py-2.5 tabular-nums text-slate-700">{row.col3}</td>
                        <td className="px-3.5 py-2.5 tabular-nums text-slate-600">{row.col4}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setSelectedKpi(null)}
                className="px-3.5 py-2 rounded-lg border border-slate-200 text-[12.5px] font-medium text-slate-700 hover:bg-slate-50"
              >
                Fechar
              </button>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => {
                    const k = selectedKpi;
                    setSelectedKpi(null);
                    onAskAgent({
                      title: `Pedir ao agente · ${k.title}`,
                      prefillText: k.pedirPrompt,
                      categoria: k.pedirCategoria,
                      subtipo: k.pedirSubtipo,
                      actionType: k.pedirActionType,
                      evalParams: k.pedirEvalParams,
                    });
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#5B3FD0] hover:bg-[#4C32B8] text-white text-[12.5px] font-semibold"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Pedir ao agente</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION SUMMARY MODAL FOR PRICE REDUCTION */}
      {confirmPriceOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/35 backdrop-blur-[1px]"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-5 space-y-4 shadow-lg">
            <h3 className="text-[15.5px] font-bold text-slate-900">
              Confirmar redução de valor pedido
            </h3>
            <p className="text-[12.5px] text-slate-600 leading-relaxed">
              {confirmPriceOrder.decisionMeta?.proposedAction ?? confirmPriceOrder.objective}
            </p>
            <div className="rounded-lg border border-slate-200 bg-[#F8F9FB] p-3 text-[12px] space-y-1 text-slate-700">
              <div>
                <strong>Antes:</strong> R$ 3.800,00 → <strong>Depois:</strong> R$ 3.490,00 (-8,2%)
              </div>
              <div>
                <strong>Regra aplicada:</strong> LOC-001 v2 (autorização do proprietário registrada)
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmPriceOrder(null)}
                className="px-3.5 py-2 rounded-lg border border-slate-200 text-[12.5px] font-medium text-slate-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onApproveOrder(confirmPriceOrder.id);
                  setConfirmPriceOrder(null);
                }}
                className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-[12.5px] font-semibold"
              >
                Confirmar aprovação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
