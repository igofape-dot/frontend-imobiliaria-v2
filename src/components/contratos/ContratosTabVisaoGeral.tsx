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
  FileDiff,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import {
  formatBRL,
  type FinancePeriod,
  type FinanceSemaphore,
} from '../../data/financeiroData';
import type { AgentOrder } from '../../data/agentOrdersData';
import type { PerfilRegra, Regra } from '../../data/rulesData';
import {
  ALUGUEL_MENSAL_RENOVACAO_CARD,
  CALCULATION_HUMAN_CHECK_LABEL,
  CONTRATOS_ALERTS,
  CONTRATOS_KPIS_BY_PERIOD,
  EXPIRATIONS_90D_BUCKETS,
  MODULE_AUTONOMY_MAP,
  RENEWAL_FUNNEL_37,
  type ContratosKpiItem,
  type ContratosTabId,
} from '../../data/contratosData';
import type { AskAgentRequestPayload } from '../financeiro/AskAgentOrderDrawer';
import {
  AgentRegisteredTag,
  RuleAppliedChip,
  SemaphoreBadge,
} from '../financeiro/FinanceiroShared';
import type { ComparatorTarget } from './ContratosDrawers';

interface ContratosTabVisaoGeralProps {
  period: FinancePeriod;
  orders: AgentOrder[];
  rules: Regra[];
  perfil: PerfilRegra;
  readOnly: boolean;
  onNavigateTab: (tab: ContratosTabId) => void;
  onApproveOrder: (orderId: string) => void;
  onRejectOrder: (orderId: string) => void;
  onEditOrderDecision: (orderId: string, newTitle: string, newProposedAction: string) => void;
  onOpenOrderInCenter: (orderId: string) => void;
  onOpenRuleById: (ruleId: string) => void;
  onAskAgent: (req: AskAgentRequestPayload) => void;
  onOpenComparator: (target: ComparatorTarget) => void;
}

const CONTRATOS_PENDING_ORDER_IDS = new Set(['ord-4812', 'ord-4826', 'ord-4827', 'ord-4828']);

export function ContratosTabVisaoGeral({
  period,
  orders,
  rules,
  perfil,
  readOnly,
  onNavigateTab,
  onApproveOrder,
  onRejectOrder,
  onEditOrderDecision,
  onOpenOrderInCenter,
  onOpenRuleById,
  onAskAgent,
  onOpenComparator,
}: ContratosTabVisaoGeralProps) {
  const [expandedEvidenceId, setExpandedEvidenceId] = useState<string | null>(null);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editActionDraft, setEditActionDraft] = useState('');
  const [selectedKpi, setSelectedKpi] = useState<ContratosKpiItem | null>(null);
  const [confirmRescissionOrder, setConfirmRescissionOrder] = useState<AgentOrder | null>(null);

  // "Precisa de você": pending approval orders belonging to Contratos & Jurídico
  const pendingOrders = useMemo(() => {
    return orders.filter((o) => {
      if (o.status !== 'Aguardando aprovação') return false;
      const isContratoJuridico =
        o.category === 'Locação e contratos' ||
        o.category === 'Jurídico e documentos' ||
        CONTRATOS_PENDING_ORDER_IDS.has(o.id);
      if (!isContratoJuridico) return false;
      if (perfil === 'Corretor') {
        // Corretor Rafael Costa only sees his properties (not Daniel/Beatriz/Marina unless his, or Carlos Mendes CT-2024-0187)
        return o.id === 'ord-4812';
      }
      return true;
    });
  }, [orders, perfil]);

  // Dynamic sync with GLO-003 for Contratos ativos KPI
  const kpis = useMemo(() => {
    const base = CONTRATOS_KPIS_BY_PERIOD[period] ?? CONTRATOS_KPIS_BY_PERIOD.mes;
    const glo003 = rules.find((r) => r.id === 'GLO-003' && r.status === 'ativa');
    const vacVerde = Number(glo003?.entao.parametros?.vacanciaVerdeMax ?? 5);
    const vacVerm = Number(glo003?.entao.parametros?.vacanciaVermelhaMin ?? 8);
    const currentVacancia = 6.8;
    const syncedSem: FinanceSemaphore =
      currentVacancia <= vacVerde
        ? 'verde'
        : currentVacancia > vacVerm
        ? 'vermelho'
        : 'ambar';

    return base.map((k) =>
      k.id === 'ct-ativos'
        ? {
            ...k,
            semaphore: syncedSem,
            semaphoreLabel:
              syncedSem === 'verde' ? 'Saudável' : syncedSem === 'vermelho' ? 'Crítico' : 'Atenção',
            semaphoreRule: `Vacância 6,8% · GLO-003 (≤ ${vacVerde}% verde · > ${vacVerm}% crítico)`,
          }
        : k
    );
  }, [period, rules]);

  const visibleAlerts = useMemo(() => {
    if (perfil === 'Corretor') {
      return CONTRATOS_ALERTS.filter((a) => a.targetTab !== 'rescisoes-juridico' && a.targetTab !== 'definir-regras');
    }
    if (perfil === 'Financeiro') {
      return CONTRATOS_ALERTS.filter((a) => a.targetTab === 'rescisoes-juridico' || a.id === 'calt-7');
    }
    return CONTRATOS_ALERTS;
  }, [perfil]);

  const handleTriggerApprove = (order: AgentOrder) => {
    if (readOnly) return;
    if (order.id === 'ord-4827' || order.subtype.toLowerCase().includes('rescis')) {
      setConfirmRescissionOrder(order);
      return;
    }
    onApproveOrder(order.id);
  };

  return (
    <div className="space-y-6">
      {/* 1. PRECISA DE VOCÊ + ALERTAS */}
      <section className="space-y-3" aria-labelledby="ct-precisa-voce-title">
        <div className="flex items-center justify-between gap-2">
          <h2
            id="ct-precisa-voce-title"
            className="text-[13px] font-bold uppercase tracking-wider text-slate-500"
          >
            Precisa de você ({pendingOrders.length})
          </h2>
          <span className="text-[12px] text-slate-500">
            Sincronizado com a fila de pedidos do Agente de IA
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Pending approval cards */}
          <div className="lg:col-span-8 space-y-3">
            {pendingOrders.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-center space-y-1.5">
                <p className="text-[14px] font-semibold text-slate-800">
                  Nenhuma pendência aguardando sua aprovação neste perfil
                </p>
                <p className="text-[12px] text-slate-500">
                  Pedidos liberados avançam imediatamente para execução e permanecem auditáveis na Central de Pedidos.
                </p>
              </div>
            ) : (
              pendingOrders.map((order) => {
                const primaryRule = order.appliedRules?.[0];
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
                            className="text-[11px] font-bold text-[#2563EB] hover:underline tabular-nums"
                          >
                            {order.protocol}
                          </button>
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                            {order.status}
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
                          <p className="text-[12px] text-slate-600 leading-relaxed">
                            {order.decisionMeta?.proposedAction ?? order.objective}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                        {(order.id === 'ord-4812' || order.id === 'ord-4826') && (
                          <button
                            type="button"
                            onClick={() =>
                              onOpenComparator(
                                order.id === 'ord-4812'
                                  ? {
                                      contractNumber: 'CT-2024-0187',
                                      locatario: 'Carlos Mendes',
                                      imovel: 'Apto 302 · Ed. Vista Verde',
                                      clausulaAlterada: false,
                                      clausulaLabel: 'Cláusulas gerais e garantia',
                                      textoModelo: 'Texto integral do modelo Aditivo de renovação v3 sem alterações.',
                                      textoMinuta: 'Texto integral mantido sem alterações; atualização exclusiva do aluguel para R$ 3.334,40.',
                                      aluguelAntes: 3200,
                                      aluguelDepois: 3334.4,
                                      modeloNome: 'Aditivo de renovação v3',
                                    }
                                  : {
                                      contractNumber: 'CT-2024-0241',
                                      locatario: 'Daniel Freitas',
                                      imovel: 'Casa Rua dos Ipês, 44',
                                      clausulaAlterada: true,
                                      clausulaLabel: 'Cláusula 8ª (Vistoria de saída)',
                                      textoModelo: 'O locatário terá o prazo de 5 dias úteis após a entrega das chaves para contestar o laudo.',
                                      textoMinuta: 'O locatário terá o prazo de 10 dias úteis após a entrega das chaves para contestar o laudo (alterado a pedido do locatário).',
                                      aluguelAntes: 3850,
                                      aluguelDepois: 4011.7,
                                      modeloNome: 'Aditivo de renovação v3',
                                    }
                              )
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[12px] font-medium text-slate-700"
                          >
                            <FileDiff className="w-3.5 h-3.5 text-[#5B3FD0]" />
                            Ver comparação com o modelo
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedEvidenceId(isEvidenceOpen ? null : order.id)
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[12px] font-medium text-slate-700"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Ver evidência
                        </button>
                      </div>
                    </div>

                    {isEvidenceOpen && (
                      <div className="rounded-lg border border-slate-200 bg-[#F8F9FB] p-3 text-[12px] space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="font-semibold text-slate-700">
                            {order.decisionMeta?.evidenceSource ?? order.channel}
                          </span>
                          <AgentRegisteredTag label={order.registeredBy} />
                        </div>
                        <p className="text-slate-700 leading-relaxed">
                          “{order.decisionMeta?.evidenceExcerpt ?? order.originalMessage.rawText}”
                        </p>
                        {order.id === 'ord-4827' && (
                          <p className="text-[11px] text-amber-800 font-medium pt-1">
                            {CALCULATION_HUMAN_CHECK_LABEL}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <AgentRegisteredTag label={order.registeredBy} />
                      {readOnly ? (
                        <span className="text-[11px] font-medium text-slate-500">
                          Perfil Financeiro em modo somente leitura
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleTriggerApprove(order)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-[12px] font-semibold"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Aprovar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingOrderId(order.id);
                              setEditActionDraft(
                                order.decisionMeta?.proposedAction ?? order.objective
                              );
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[12px] font-medium"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => onRejectOrder(order.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50/70 hover:bg-red-100 text-red-700 text-[12px] font-medium"
                          >
                            <X className="w-3.5 h-3.5" />
                            Recusar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Operational Alerts Card (7 items) */}
          <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-bold text-slate-900">
                Alertas jurídicos e contratuais
              </h3>
              <span className="text-[11px] font-semibold text-slate-500 tabular-nums">
                {visibleAlerts.length} ativos
              </span>
            </div>

            <div className="space-y-2">
              {visibleAlerts.map((alert) => (
                <button
                  key={alert.id}
                  type="button"
                  onClick={() => onNavigateTab(alert.targetTab)}
                  className="w-full text-left rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 p-3 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      {alert.urgencia === 'critico' ? (
                        <AlertOctagon className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0">
                        <p className="text-[12px] font-semibold text-slate-900 leading-snug">
                          {alert.titulo}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          {alert.detalhe}
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#2563EB] shrink-0 mt-0.5" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. 8 KPIs + ALUGUEL EM RENOVAÇÃO */}
      <section className="space-y-3" aria-labelledby="ct-kpis-title">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2
            id="ct-kpis-title"
            className="text-[13px] font-bold uppercase tracking-wider text-slate-500"
          >
            Indicadores da carteira ({kpis.length})
          </h2>
          <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 flex flex-wrap items-center gap-2.5 text-[12px]">
            <span className="text-slate-500">Aluguel mensal em renovação:</span>
            <span className="font-bold text-slate-900 tabular-nums">
              {formatBRL(ALUGUEL_MENSAL_RENOVACAO_CARD.valorMensal)}
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-600">
              {ALUGUEL_MENSAL_RENOVACAO_CARD.contratosQtd} contratos · taxa adm. em jogo{' '}
              <strong className="tabular-nums text-slate-800">
                ≈ {formatBRL(ALUGUEL_MENSAL_RENOVACAO_CARD.taxaAdmEmJogo)}/mês
              </strong>
            </span>
            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold uppercase tracking-wide">
              {ALUGUEL_MENSAL_RENOVACAO_CARD.selo}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <button
              key={kpi.id}
              type="button"
              onClick={() => setSelectedKpi(kpi)}
              className="text-left rounded-xl border border-slate-200 bg-white p-4 hover:border-[#2563EB]/50 transition-colors flex flex-col justify-between gap-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[12px] font-semibold text-slate-600 leading-snug">
                  {kpi.title}
                </span>
                <SemaphoreBadge
                  semaphore={kpi.semaphore}
                  label={kpi.semaphoreLabel}
                  title={kpi.semaphoreRule}
                />
              </div>

              <div className="flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[22px] font-bold text-slate-900 tracking-tight tabular-nums leading-none">
                    {kpi.value}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1.5 truncate" title={kpi.comparisonPrev}>
                    {kpi.comparisonPrev}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate" title={kpi.comparisonTarget}>
                    {kpi.comparisonTarget}
                  </p>
                </div>

                <div className="w-20 h-10 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={kpi.sparkline}>
                      <Line
                        type="monotone"
                        dataKey="v"
                        stroke={
                          kpi.semaphore === 'verde'
                            ? '#059669'
                            : kpi.semaphore === 'vermelho'
                            ? '#DC2626'
                            : '#D97706'
                        }
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[10px] text-[#5B3FD0] truncate" title={kpi.registeredBy}>
                  {kpi.registeredBy}
                </span>
                <span className="text-[11px] font-semibold text-[#2563EB] shrink-0">
                  Detalhar
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 3. FUNIL DE RENOVAÇÃO + VENCIMENTOS 90D */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-[15px] font-bold text-slate-900">
                Funil de renovação (37 contratos nos próximos 90 dias)
              </h3>
              <p className="text-[12px] text-slate-500 mt-0.5">
                Etapa que mais trava: <strong className="text-red-700">Sem ação (8)</strong> — 3 já passaram do marco D-90.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('renovacoes-reajustes')}
              className="text-[12px] font-semibold text-[#2563EB] hover:underline"
            >
              Abrir quadro de renovações
            </button>
          </div>

          <div className="space-y-2.5">
            {RENEWAL_FUNNEL_37.map((item) => {
              const pct = Math.round((item.qtd / 37) * 100);
              return (
                <div key={item.etapa} className="space-y-1">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-semibold text-slate-800 flex items-center gap-2">
                      {item.etapa}
                      {item.trava && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 text-[10px] font-semibold">
                          <AlertOctagon className="w-3 h-3" />
                          Gargalo principal
                        </span>
                      )}
                    </span>
                    <span className="tabular-nums font-bold text-slate-900">
                      {item.qtd} <span className="font-normal text-slate-500">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        item.trava ? 'bg-red-500' : 'bg-[#2563EB]'
                      }`}
                      style={{ width: `${Math.max(8, pct * 2.5)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">{item.nota}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div>
            <h3 className="text-[15px] font-bold text-slate-900">
              Vencimentos nos próximos 90 dias
            </h3>
            <p className="text-[12px] text-slate-500 mt-0.5">
              Total de contratos a vencer vs. contratos ainda sem ação iniciada.
            </p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={EXPIRATIONS_90D_BUCKETS} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="faixa" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val, name) => [
                    `${Number(val ?? 0)} contratos`,
                    name === 'qtd' ? 'Total a vencer' : 'Sem ação',
                  ]}
                />
                <Bar dataKey="qtd" name="Total a vencer" radius={[6, 6, 0, 0]} fill="#2563EB">
                  {EXPIRATIONS_90D_BUCKETS.map((entry, idx) => (
                    <Cell key={entry.faixa} fill={idx === 0 ? '#DC2626' : '#2563EB'} />
                  ))}
                </Bar>
                <Bar dataKey="semAcao" name="Sem ação" radius={[6, 6, 0, 0]} fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. MAPA DE AUTONOMIA DO MÓDULO (READ-ONLY) */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-[15px] font-bold text-slate-900">
              Mapa de autonomia do módulo (somente leitura)
            </h3>
            <p className="text-[12px] text-slate-500 mt-0.5">
              O que o agente faz sozinho, o que depende de aprovação e o que está bloqueado por barreira. Clique na regra para inspecionar.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('definir-regras')}
            className="text-[12px] font-semibold text-[#2563EB] hover:underline"
          >
            Gerenciar em Definir regras
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-[12px] font-bold text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Autônomo
            </div>
            <ul className="space-y-2">
              {MODULE_AUTONOMY_MAP.autonomo.map((item) => (
                <li key={item.acao} className="flex items-center justify-between gap-2 text-[12px] text-slate-700">
                  <span>{item.acao}</span>
                  <button
                    type="button"
                    onClick={() => onOpenRuleById(item.ruleId)}
                    className="text-[11px] font-semibold text-[#5B3FD0] hover:underline shrink-0"
                  >
                    {item.ruleId}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-[12px] font-bold text-amber-900">
              <Clock className="w-4 h-4 text-amber-700" />
              Com aprovação humana
            </div>
            <ul className="space-y-2">
              {MODULE_AUTONOMY_MAP.aprovacao.map((item) => (
                <li key={item.acao} className="flex items-center justify-between gap-2 text-[12px] text-slate-700">
                  <span>{item.acao}</span>
                  <button
                    type="button"
                    onClick={() => onOpenRuleById(item.ruleId)}
                    className="text-[11px] font-semibold text-[#5B3FD0] hover:underline shrink-0"
                  >
                    {item.ruleId}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-red-200 bg-red-50/40 p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-[12px] font-bold text-red-900">
              <Ban className="w-4 h-4 text-red-700" />
              Bloqueado (barreira travada)
            </div>
            <ul className="space-y-2">
              {MODULE_AUTONOMY_MAP.bloqueado.map((item) => (
                <li key={item.acao} className="flex items-center justify-between gap-2 text-[12px] text-slate-700">
                  <span>{item.acao}</span>
                  <button
                    type="button"
                    onClick={() => onOpenRuleById(item.ruleId)}
                    className="text-[11px] font-semibold text-red-700 hover:underline shrink-0"
                  >
                    {item.ruleId}
                  </button>
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
                <h3 className="text-[17px] font-bold text-slate-900 mt-1.5">
                  {selectedKpi.title}: <span className="tabular-nums">{selectedKpi.value}</span>
                </h3>
                <p className="text-[12px] text-slate-500 mt-0.5">
                  {selectedKpi.comparisonPrev} · {selectedKpi.comparisonTarget}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedKpi(null)}
                aria-label="Fechar detalhe"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              <div className="rounded-xl border border-[#5B3FD0]/25 bg-[#F3F0FF]/60 p-4 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#5B3FD0]">
                  <Bot className="w-4 h-4" />
                  Leitura do agente
                </div>
                <p className="text-[13px] text-slate-800 leading-relaxed">
                  {selectedKpi.agentReading}
                </p>
                <p className="text-[11px] text-slate-500">{selectedKpi.registeredBy}</p>
              </div>

              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-[12px]">
                  <thead className="bg-[#F8F9FB] border-b border-slate-200 text-slate-600">
                    <tr>
                      {selectedKpi.drawerColumns.map((col) => (
                        <th key={col} className="px-3.5 py-2.5 font-semibold">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedKpi.drawerRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="px-3.5 py-2.5 font-medium text-slate-900">{row.col1}</td>
                        <td className="px-3.5 py-2.5 text-slate-700 tabular-nums">{row.col2}</td>
                        <td className="px-3.5 py-2.5 text-slate-700 tabular-nums">{row.col3}</td>
                        <td className="px-3.5 py-2.5 text-slate-600">{row.col4}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-[#F8F9FB] flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setSelectedKpi(null)}
                className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-[12px] font-semibold text-slate-700"
              >
                Fechar
              </button>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => {
                    onAskAgent({
                      title: `Pedir ao agente · ${selectedKpi.title}`,
                      prefillText: selectedKpi.pedirPrompt,
                      categoria: selectedKpi.pedirCategoria,
                      subtipo: selectedKpi.pedirSubtipo,
                      actionType: selectedKpi.pedirActionType,
                      evalParams: selectedKpi.pedirEvalParams,
                    });
                    setSelectedKpi(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#5B3FD0] hover:bg-[#4c33b8] text-white text-[12px] font-semibold"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Pedir ao agente
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* IMPACT CONFIRMATION MODAL FOR RESCISSION (PED-2026-004827) */}
      {confirmRescissionOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-start gap-3">
              <span className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-[15px] font-bold text-slate-900">
                  Confirmar impacto da rescisão
                </h3>
                <p className="text-[12px] text-slate-500 mt-0.5">
                  {confirmRescissionOrder.protocol} · {confirmRescissionOrder.subject}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3.5 text-[12px] text-amber-950 space-y-1.5">
              <p>
                <strong>Multa calculada:</strong> R$ 1.920,00 (4 meses proporcionais restantes).
              </p>
              <p>
                <strong>Impacto operacional:</strong> altera o repasse final ao proprietário André Albuquerque e eleva a vacância estimada em +0,24 p.p. a partir de 01/12/2026.
              </p>
              <p className="text-[11px] font-medium pt-1">{CALCULATION_HUMAN_CHECK_LABEL}</p>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmRescissionOrder(null)}
                className="px-3.5 py-2 rounded-lg border border-slate-200 text-[12px] font-semibold text-slate-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onApproveOrder(confirmRescissionOrder.id);
                  setConfirmRescissionOrder(null);
                }}
                className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-[12px] font-semibold"
              >
                Confirmar e liberar rescisão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
