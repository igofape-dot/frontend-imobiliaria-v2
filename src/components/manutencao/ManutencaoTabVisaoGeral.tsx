import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  Bot,
  Check,
  ChevronRight,
  Edit3,
  FileWarning,
  ShieldAlert,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { AgentOrder } from '../../data/agentOrdersData';
import { formatBRL } from '../../data/financeiroData';
import type { PerfilRegra, Regra } from '../../data/rulesData';
import type { AskAgentRequestPayload } from '../financeiro/AskAgentOrderDrawer';
import {
  AgentRegisteredTag,
  PolicyModeBadge,
  RuleAppliedChip,
  SemaphoreBadge,
} from '../financeiro/FinanceiroShared';
import {
  AUTONOMY_MAP_COLUMNS,
  MANUTENCAO_ALERTS,
  MANUTENCAO_CLOSED_RESPONSIBILITY,
  MANUTENCAO_OPPORTUNITIES,
  MANUTENCAO_STAGES_CHART,
  MANUTENCAO_TYPES_CHART,
  MANUTENCAO_WHO_PAID_30D,
  getManutencaoKpisByPeriod,
  type ManutencaoKpiCard,
  type ManutencaoPeriod,
  type ManutencaoTabId,
} from '../../data/manutencaoData';

interface ManutencaoTabVisaoGeralProps {
  period: ManutencaoPeriod;
  orders: AgentOrder[];
  rules: Regra[];
  perfil: PerfilRegra;
  readOnly: boolean;
  onNavigateTab: (tab: ManutencaoTabId) => void;
  onApproveOrder: (orderId: string) => void;
  onRejectOrder: (orderId: string) => void;
  onEditOrderDecision: (orderId: string, newTitle: string, newProposedAction: string) => void;
  onOpenOrderInCenter: (orderId: string) => void;
  onOpenRuleById: (ruleId: string) => void;
  onCreateReembolsoRuleDraft: () => void;
  onOpenQuoteComparator: (orcamentoId: string) => void;
  onOpenLago9Comparator: () => void;
  onAskAgent: (req: AskAgentRequestPayload) => void;
  onShowToast: (text: string, onUndo?: () => void) => void;
}

const PENDING_CARDS_META: Record<
  string,
  {
    tipoChip: string;
    imovel: string;
    detalheExtra: string;
    regraChip: string;
    regraVersao: number;
    acaoLink?: { label: string; kind: 'quote-acacias' | 'quote-cedro' | 'lago9' | 'reembolso' };
    requiresDamageConfirm?: boolean;
  }
> = {
  'ord-4809': {
    tipoChip: 'Manutenção e vistoria > Chamado',
    imovel: 'Casa Rua das Acácias 120 (Maria Souza / Ivone Tavares)',
    detalheExtra:
      'Orçamento Hidráulica Souza R$ 2.350,00 (alt. Hidrotec R$ 2.680,00). Portões: homologado ✓, 2 orçamentos ✓, autorização WhatsApp 22/11 ✓, FIN-011 → Gestor. Responsável sugerido: proprietária (86%).',
    regraChip: 'FIN-011',
    regraVersao: 2,
    acaoLink: { label: 'Ver comparação de orçamentos', kind: 'quote-acacias' },
  },
  'ord-4833': {
    tipoChip: 'Manutenção e vistoria > Orçamento',
    imovel: 'Casa Rua do Cedro 57 (vaga há 24 dias · aluguel R$ 2.700,00)',
    detalheExtra:
      'Pintura e troca de piso: Reformas Alvorada R$ 4.180,00 (alt. Reforma Fácil Leste R$ 4.620,00). Autorização por e-mail 21/11 ✓. Cada dia de atraso custa R$ 90,00 de aluguel parado.',
    regraChip: 'FIN-011',
    regraVersao: 2,
    acaoLink: { label: 'Ver comparação de orçamentos', kind: 'quote-cedro' },
  },
  'ord-4834': {
    tipoChip: 'Manutenção e vistoria > Vistoria',
    imovel: 'Casa Rua do Lago 9 (Lucas Andrade · acerto financeiro)',
    detalheExtra:
      '16 itens: 11 sem alteração, 2 desgaste natural (proprietário R$ 1.150,00), 3 danos (inquilino R$ 1.640,00). 1 item abaixo de 80% (76%) sinalizado.',
    regraChip: 'MAN-002',
    regraVersao: 3,
    acaoLink: { label: 'Abrir comparador de vistoria', kind: 'lago9' },
    requiresDamageConfirm: true,
  },
  'ord-4835': {
    tipoChip: 'Manutenção e vistoria > Chamado',
    imovel: 'Sala 05 Ed. Central (Rodrigo Pires)',
    detalheExtra:
      'Reparo do dreno do ar-condicionado por conta própria, R$ 420,00 (NF anexada). SEM regra: modo "só sugerir". Sugestão: consultar o proprietário antes de responder.',
    regraChip: 'SEM-REGRA',
    regraVersao: 0,
    acaoLink: { label: 'Criar regra para reembolso', kind: 'reembolso' },
  },
};

export function ManutencaoTabVisaoGeral({
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
  onCreateReembolsoRuleDraft,
  onOpenQuoteComparator,
  onOpenLago9Comparator,
  onAskAgent,
  onShowToast,
}: ManutencaoTabVisaoGeralProps) {
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editActionText, setEditActionText] = useState('');
  const [evidenceOpenId, setEvidenceOpenId] = useState<string | null>(null);
  const [confirmDamageOrderId, setConfirmDamageOrderId] = useState<string | null>(null);
  const [selectedKpi, setSelectedKpi] = useState<ManutencaoKpiCard | null>(null);

  const isCorretor = perfil === 'Corretor';
  const isJuridico = perfil === 'Jurídico';
  const isFinanceiro = perfil === 'Financeiro';

  const pendingOrders = useMemo(() => {
    const targetIds = ['ord-4809', 'ord-4833', 'ord-4834', 'ord-4835'];
    return orders.filter((o) => targetIds.includes(o.id) && o.status === 'Aguardando aprovação');
  }, [orders]);

  const { kpis, satisfaction } = useMemo(() => getManutencaoKpisByPeriod(period), [period]);

  const handleActionClick = (order: AgentOrder) => {
    const meta = PENDING_CARDS_META[order.id];
    if (meta?.requiresDamageConfirm) {
      setConfirmDamageOrderId(order.id);
      return;
    }
    onApproveOrder(order.id);
    if (order.id === 'ord-4835') {
      onShowToast('Sugestão aprovada: consulta enviada ao proprietário da Sala 05 Ed. Central.');
    }
  };

  const renderSparkline = (values: number[], sem: 'verde' | 'ambar' | 'vermelho') => {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    const stroke =
      sem === 'verde' ? '#059669' : sem === 'ambar' ? '#D97706' : '#DC2626';
    const points = values
      .map((v, i) => {
        const x = (i / Math.max(values.length - 1, 1)) * 76 + 2;
        const y = 20 - ((v - min) / span) * 16;
        return `${x},${y}`;
      })
      .join(' ');
    return (
      <svg width="80" height="24" className="shrink-0" aria-hidden="true">
        <polyline fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" points={points} />
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. PRECISA DE VOCÊ + ALERTAS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <section className="lg:col-span-7 space-y-3" aria-labelledby="man-precisa-de-voce">
          <div className="flex items-center justify-between gap-2">
            <h2 id="man-precisa-de-voce" className="text-[13px] font-bold uppercase tracking-wider text-slate-500">
              Precisa de você ({pendingOrders.length})
            </h2>
            <span className="text-[11.5px] text-slate-500">
              Aprovações sensíveis, danos e lacunas de regra
            </span>
          </div>

          {pendingOrders.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-[13px] text-slate-500">
              Nenhuma decisão pendente no momento. Todas as aprovações recentes foram processadas.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingOrders.map((order) => {
                const meta = PENDING_CARDS_META[order.id];
                const isLacuna = order.id === 'ord-4835';
                const canApproveThis =
                  !readOnly &&
                  !(isFinanceiro && order.id === 'ord-4834') &&
                  !(isJuridico && (order.id === 'ord-4809' || order.id === 'ord-4833'));
                return (
                  <div
                    key={order.id}
                    className={`rounded-xl border bg-white p-4 space-y-3 ${
                      isLacuna ? 'border-amber-300' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[12px] font-bold text-[#2563EB]">
                            {order.protocol}
                          </span>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {meta?.tipoChip ?? order.subtype}
                          </span>
                          {isLacuna ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-amber-300 bg-amber-50 text-amber-900 text-[11px] font-semibold">
                              <AlertTriangle className="w-3 h-3" />
                              Lacuna de regra · Só sugerir
                            </span>
                          ) : (
                            meta && (
                              <RuleAppliedChip
                                ruleId={meta.regraChip}
                                versao={meta.regraVersao}
                                onOpenRule={onOpenRuleById}
                              />
                            )
                          )}
                        </div>
                        <h3 className="text-[14.5px] font-bold text-slate-900">{order.subject}</h3>
                        <p className="text-[12px] font-medium text-slate-600">{meta?.imovel}</p>
                      </div>
                      <span className="text-[11px] font-semibold text-[#5B3FD0] bg-[#F3F0FF] px-2 py-0.5 rounded">
                        {order.confidence}% confiança
                      </span>
                    </div>

                    <p className="text-[12.5px] text-slate-700 leading-relaxed">
                      {isCorretor && (order.id === 'ord-4809' || order.id === 'ord-4833')
                        ? 'Orçamento em revisão pelo Gestor/Financeiro. Valores detalhados de repasse ficam ocultos no perfil Corretor.'
                        : meta?.detalheExtra ?? order.decisionMeta?.proposedAction}
                    </p>

                    {evidenceOpenId === order.id && (
                      <div className="rounded-lg border border-slate-200 bg-[#F8F9FB] p-3 text-[12px] text-slate-700 space-y-1">
                        <div>
                          <strong>Evidência:</strong> {order.decisionMeta?.evidenceSource}
                        </div>
                        <div>{order.decisionMeta?.evidenceExcerpt}</div>
                        <button
                          type="button"
                          onClick={() => onOpenOrderInCenter(order.id)}
                          className="text-[#2563EB] font-semibold hover:underline inline-flex items-center gap-1 pt-0.5"
                        >
                          Abrir ficha completa em Agente de IA
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {editingOrderId === order.id && (
                      <div className="rounded-lg border border-blue-200 bg-blue-50/40 p-3 space-y-2">
                        <textarea
                          rows={2}
                          value={editActionText}
                          onChange={(e) => setEditActionText(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[12.5px]"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              onEditOrderDecision(order.id, order.subject, editActionText);
                              setEditingOrderId(null);
                            }}
                            className="px-3 py-1 rounded-lg bg-[#2563EB] text-white text-[12px] font-semibold"
                          >
                            Salvar ajuste
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingOrderId(null)}
                            className="px-3 py-1 rounded-lg border border-slate-200 bg-white text-[12px]"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                      <div className="flex flex-wrap items-center gap-2">
                        {canApproveThis && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleActionClick(order)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-[12px] font-semibold"
                            >
                              <Check className="w-3.5 h-3.5" />
                              {isLacuna ? 'Aprovar sugestão (enviar consulta)' : 'Aprovar'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingOrderId(order.id);
                                setEditActionText(order.decisionMeta?.proposedAction ?? order.objective);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[12px] font-medium"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => onRejectOrder(order.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-[12px] font-medium"
                            >
                              <X className="w-3.5 h-3.5" />
                              Recusar
                            </button>
                          </>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-[12px]">
                        <button
                          type="button"
                          onClick={() =>
                            setEvidenceOpenId(evidenceOpenId === order.id ? null : order.id)
                          }
                          className="font-semibold text-slate-600 hover:text-slate-900"
                        >
                          {evidenceOpenId === order.id ? 'Ocultar evidência' : 'Ver evidência'}
                        </button>
                        {meta?.acaoLink && (
                          <button
                            type="button"
                            onClick={() => {
                              if (meta.acaoLink!.kind === 'quote-acacias') onOpenQuoteComparator('orc-acacias-120');
                              else if (meta.acaoLink!.kind === 'quote-cedro') onOpenQuoteComparator('orc-cedro-57');
                              else if (meta.acaoLink!.kind === 'lago9') onOpenLago9Comparator();
                              else onCreateReembolsoRuleDraft();
                            }}
                            className="font-semibold text-[#2563EB] hover:underline"
                          >
                            {meta.acaoLink.label}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 2. ALERTAS (10 alertas) */}
        <section className="lg:col-span-5 space-y-3" aria-labelledby="man-alertas">
          <h2 id="man-alertas" className="text-[13px] font-bold uppercase tracking-wider text-slate-500">
            Alertas operacionais ({MANUTENCAO_ALERTS.length})
          </h2>
          <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
            {MANUTENCAO_ALERTS.map((al) => (
              <div key={al.id} className="p-3.5 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  {al.severity === 'vermelho' ? (
                    <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0">
                    <div className="text-[12.5px] font-bold text-slate-900">{al.title}</div>
                    <div className="text-[11.5px] text-slate-600 mt-0.5">{al.detail}</div>
                  </div>
                </div>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() =>
                      onAskAgent({
                        title: `Resolver alerta · ${al.regraId}`,
                        prefillText: al.promptText,
                        categoria: 'Manutenção e vistoria',
                        subtipo: al.subtipo,
                        actionType: al.actionType,
                        evalParams: {},
                      })
                    }
                    className="px-2.5 py-1 rounded-lg bg-[#F3F0FF] hover:bg-[#EDE9FE] text-[#5B3FD0] text-[11.5px] font-semibold shrink-0 whitespace-nowrap"
                  >
                    Resolver com o agente
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 3. OITO KPIs + CARD SECUNDÁRIO */}
      <section aria-labelledby="man-kpis-heading" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="man-kpis-heading" className="text-[13px] font-bold uppercase tracking-wider text-slate-500">
            Indicadores de manutenção e vistorias (clique para abrir detalhes)
          </h2>
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px]">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="font-semibold text-slate-800">Satisfação com a manutenção:</span>
            <span className="font-bold text-slate-900 tabular-nums">{satisfaction.value}</span>
            <span className="text-slate-500">({satisfaction.comparison} · {satisfaction.meta})</span>
            <SemaphoreBadge semaphore={satisfaction.semaphore} label="Abaixo de 4,5" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <button
              key={kpi.id}
              type="button"
              onClick={() => setSelectedKpi(kpi)}
              className="text-left rounded-xl border border-slate-200 bg-white hover:border-[#2563EB]/50 transition-colors p-4 flex flex-col justify-between gap-3"
            >
              <div className="flex items-start justify-between gap-2 w-full">
                <div className="space-y-1">
                  <div className="text-[12px] font-semibold text-slate-500">{kpi.title}</div>
                  {kpi.badge && (
                    <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10.5px] font-semibold">
                      {kpi.badge}
                    </span>
                  )}
                </div>
                <SemaphoreBadge
                  semaphore={kpi.semaphore}
                  label={kpi.semaphoreLabel}
                  title={kpi.semaphoreRule}
                />
              </div>

              <div className="flex items-end justify-between gap-2 w-full">
                <div>
                  <div className="text-[22px] font-bold text-slate-900 tabular-nums leading-tight">
                    {isCorretor && kpi.id === 'mkpi-7' ? 'Restrito' : kpi.value}
                  </div>
                  <div className="text-[11.5px] text-slate-600 mt-1">{kpi.comparison}</div>
                </div>
                {renderSparkline(kpi.sparkline, kpi.semaphore)}
              </div>

              <div className="w-full pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>{kpi.meta}</span>
                <span className="inline-flex items-center gap-0.5 font-semibold text-[#2563EB]">
                  Abrir análise
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 4. GRÁFICOS */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5" aria-label="Distribuição operacional e custos">
        <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[14.5px] font-bold text-slate-900">Chamados por etapa</h3>
              <p className="text-[12px] text-slate-500">Total de 34 chamados abertos agora</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('chamados')}
              className="text-[12px] font-semibold text-[#2563EB] hover:underline"
            >
              Ver fila completa
            </button>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MANUTENCAO_STAGES_CHART} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="etapa" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                <Tooltip formatter={(val) => [`${val} chamados`, 'Quantidade']} />
                <Bar dataKey="quantidade" fill="#2563EB" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <div>
            <h3 className="text-[14.5px] font-bold text-slate-900">
              Chamados abertos por tipo e gasto em 30 dias
            </h3>
            <p className="text-[12px] text-slate-500">
              34 chamados abertos · R$ 38.420,00 em 30 dias (conta de terceiros, não é despesa da imobiliária)
            </p>
          </div>
          <div className="space-y-2">
            {MANUTENCAO_TYPES_CHART.map((row) => {
              const widthPct = Math.round((row.abertos / 11) * 100);
              return (
                <div key={row.tipo} className="space-y-1">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-medium text-slate-800">{row.tipo}</span>
                    <span className="tabular-nums text-slate-600">
                      <strong className="text-slate-900">{row.abertos}</strong> abertos
                      {!isCorretor && (
                        <> · {formatBRL(row.gasto30d)}</>
                      )}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#2563EB]"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Who Paid + Closed Responsibility */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <h3 className="text-[14.5px] font-bold text-slate-900">
            Quem arcou com o custo (30 dias · {isCorretor ? 'Restrito' : 'R$ 38.420,00'})
          </h3>
          <div className="space-y-2.5">
            {MANUTENCAO_WHO_PAID_30D.map((item) => (
              <div key={item.pagador} className="space-y-1">
                <div className="flex items-center justify-between text-[12.5px]">
                  <span className="font-medium text-slate-800">{item.pagador}</span>
                  <span className="font-bold text-slate-900 tabular-nums">
                    {isCorretor ? `${item.pct}%` : `${formatBRL(item.valor)} (${item.pct}%)`}
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      item.pagador.includes('Inquilino') ? 'bg-amber-500' : 'bg-[#2563EB]'
                    }`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <h3 className="text-[14.5px] font-bold text-slate-900">
            Responsabilidade dos 43 chamados fechados (30 dias)
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {MANUTENCAO_CLOSED_RESPONSIBILITY.map((r) => (
              <div key={r.responsavel} className="rounded-xl border border-slate-200 bg-[#F8F9FB] p-3">
                <div className="text-[11px] font-semibold text-slate-500">{r.responsavel}</div>
                <div className="text-[20px] font-bold text-slate-900 tabular-nums mt-1">{r.qtd}</div>
                <div className="text-[11px] text-slate-500 tabular-nums">{r.pct}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. OPORTUNIDADES DO AGENTE */}
      <section className="space-y-3" aria-labelledby="man-oportunidades">
        <h2 id="man-oportunidades" className="text-[13px] font-bold uppercase tracking-wider text-slate-500">
          Oportunidades do agente
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MANUTENCAO_OPPORTUNITIES.map((opp) => (
            <div
              key={opp.id}
              className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between gap-3"
            >
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5B3FD0]">
                  <Sparkles className="w-3.5 h-3.5" />
                  Sugestão proativa do agente
                </div>
                <h3 className="text-[14px] font-bold text-slate-900">{opp.title}</h3>
                <p className="text-[12px] text-slate-600 leading-relaxed">{opp.description}</p>
              </div>
              <button
                type="button"
                disabled={readOnly}
                onClick={() => {
                  if (opp.type === 'rule-draft') {
                    onNavigateTab('definir-regras');
                    onOpenRuleById('MAN-007');
                  } else if (opp.promptText) {
                    onAskAgent({
                      title: opp.title,
                      prefillText: opp.promptText,
                      categoria: 'Manutenção e vistoria',
                      subtipo: 'Orçamento de reparo',
                      actionType: 'orcamento',
                      evalParams: { valor: 1920, fornecedorHomologado: true, qtdOrcamentos: 1 },
                    });
                  }
                }}
                className="w-full px-3 py-2 rounded-lg bg-[#F3F0FF] hover:bg-[#EDE9FE] disabled:opacity-50 text-[#5B3FD0] text-[12px] font-semibold text-center"
              >
                {opp.ctaLabel}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 6. MAPA DE AUTONOMIA DO MÓDULO (4 colunas somente leitura) */}
      <section className="space-y-3" aria-labelledby="man-autonomia-map">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="man-autonomia-map" className="text-[13px] font-bold uppercase tracking-wider text-slate-500">
            Mapa de autonomia do módulo (somente leitura)
          </h2>
          <button
            type="button"
            onClick={() => onNavigateTab('definir-regras')}
            className="text-[12px] font-semibold text-[#2563EB] hover:underline"
          >
            Editar regras em Definir regras
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {AUTONOMY_MAP_COLUMNS.map((col) => (
            <div key={col.modo} className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
              <div className="space-y-1">
                <PolicyModeBadge modo={col.modo} />
                <div className="text-[11.5px] text-slate-500">{col.subtitle}</div>
              </div>
              <ul className="space-y-2">
                {col.items.map((item) => (
                  <li
                    key={item.texto}
                    className="rounded-lg border border-slate-100 bg-[#F8F9FB] p-2.5 space-y-1.5"
                  >
                    <div className="text-[12px] font-medium text-slate-800">{item.texto}</div>
                    {item.ruleId === 'SEM-REGRA' ? (
                      <span className="inline-block text-[10.5px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                        Lacuna de regra
                      </span>
                    ) : (
                      <RuleAppliedChip ruleId={item.ruleId} onOpenRule={onOpenRuleById} />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
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
                <SemaphoreBadge
                  semaphore={selectedKpi.semaphore}
                  label={selectedKpi.semaphoreLabel}
                />
                <h3 className="text-[17px] font-bold text-slate-900 mt-1">{selectedKpi.title}</h3>
                <p className="text-[12px] text-slate-500">{selectedKpi.semaphoreRule}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedKpi(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                aria-label="Fechar detalhes do indicador"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="rounded-xl border border-slate-200 bg-[#F8F9FB] p-4">
                <div className="text-[26px] font-bold text-slate-900 tabular-nums">
                  {selectedKpi.value}
                </div>
                <div className="text-[12.5px] text-slate-600 mt-0.5">{selectedKpi.comparison}</div>
              </div>

              <div className="rounded-xl border border-[#5B3FD0]/25 bg-[#F3F0FF]/50 p-4 space-y-1.5">
                <div className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#5B3FD0]">
                  <Bot className="w-4 h-4" />
                  Leitura do agente
                </div>
                <p className="text-[13px] text-slate-800 leading-relaxed">{selectedKpi.agentReading}</p>
              </div>

              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-[12.5px]">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <tr>
                      {selectedKpi.drawerHeaders.map((h) => (
                        <th key={h} className="px-3.5 py-2.5 font-semibold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedKpi.drawerRows.map((row, idx) => (
                      <tr key={idx}>
                        <td className="px-3.5 py-2.5 font-medium text-slate-900">{row.col1}</td>
                        <td className="px-3.5 py-2.5 text-slate-600">{row.col2}</td>
                        <td className="px-3.5 py-2.5 text-slate-700 tabular-nums">{row.col3}</td>
                        <td className="px-3.5 py-2.5">
                          <SemaphoreBadge semaphore={row.status} label={row.statusLabel} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-[#F8F9FB] flex items-center justify-between gap-2">
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => {
                    const prompt = selectedKpi.pedirPrompt;
                    setSelectedKpi(null);
                    onAskAgent({
                      title: `Pedir ao agente · ${selectedKpi.title}`,
                      prefillText: prompt,
                      categoria: 'Manutenção e vistoria',
                      subtipo: 'Chamado',
                      actionType: selectedKpi.id === 'mkpi-5' ? 'pronto_para_alugar' : 'classificar_chamado',
                      evalParams: {},
                    });
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#5B3FD0] hover:bg-[#4C32B8] text-white text-[12.5px] font-semibold"
                >
                  <Sparkles className="w-4 h-4" />
                  Pedir ao agente
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedKpi(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-[12.5px] font-medium"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL BEFORE CHARGING TENANT DAMAGES */}
      {confirmDamageOrderId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-start gap-3">
              <span className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <FileWarning className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-[15px] font-bold text-slate-900">
                  Confirmar cobrança de danos ao inquilino
                </h3>
                <p className="text-[12.5px] text-slate-600 mt-1 leading-relaxed">
                  Você está aprovando a cobrança de <strong>R$ 1.640,00</strong> de danos ao inquilino Lucas Andrade (Casa Rua do Lago 9 · MAN-002 v3). Se o inquilino contestar, o caso será bloqueado e escalado ao Jurídico.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDamageOrderId(null)}
                className="px-3.5 py-2 rounded-lg border border-slate-200 text-[12.5px] font-medium text-slate-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onApproveOrder(confirmDamageOrderId);
                  setConfirmDamageOrderId(null);
                }}
                className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-[12.5px] font-semibold"
              >
                Confirmar aprovação (MAN-002)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
