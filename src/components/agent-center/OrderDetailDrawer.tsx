import { useEffect, useState } from 'react';
import {
  X,
  Bot,
  Pencil,
  Check,
  Clock,
  PauseCircle,
  UserCheck,
  MessageSquarePlus,
  XCircle,
  CheckCircle2,
  RotateCcw,
  Star,
  Paperclip,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Building2,
  FileText,
  User,
  Lock,
  Sparkles,
  AlertTriangle,
  Split,
  ShieldCheck,
} from 'lucide-react';
import {
  ORDER_CATEGORIES,
  type AgentOrder,
  type OrderCategory,
  type OrderPriority,
  type TimelineActor,
  type TimelineEventItem,
} from '../../data/agentOrdersData';
import {
  AssigneeLabel,
  ChannelIcon,
  PriorityBadge,
  SlaSemaphoreIndicator,
  StatusBadge,
} from './OrderHelpers';

interface OrderDetailDrawerProps {
  order: AgentOrder | null;
  allOrders: AgentOrder[];
  onClose: () => void;
  onSelectOrder: (orderId: string) => void;
  onSaveInterpretation: (
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
  onOpenRuleById?: (ruleId: string) => void;
}

type DetailInnerTab = 'timeline' | 'original' | 'execution' | 'delivery';

const HUMAN_SPECIALISTS = [
  'Beatriz Souza (Locação & Operações)',
  'Lucas Andrade (Vendas)',
  'Rafael Costa (Comercial)',
  'Jurídico Farina',
  'Financeiro Farina',
];

function getActorBadgeColor(actor: TimelineActor) {
  switch (actor) {
    case 'Agente':
      return 'bg-[#F3F0FF] text-[#5B3FD0] border-[#5B3FD0]/25';
    case 'Solicitante':
      return 'bg-blue-50 text-[#2563EB] border-blue-200';
    case 'Gestor':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    case 'Sistema':
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

export function OrderDetailDrawer({
  order,
  allOrders,
  onClose,
  onSelectOrder,
  onSaveInterpretation,
  onApproveOrder,
  onRequestClarification,
  onEscalateToHuman,
  onCancelOrder,
  onUndoExecutionChange,
  onAcceptDelivery,
  onRequestAdjustment,
  onReopenOrder,
  onOpenRuleById,
}: OrderDetailDrawerProps) {
  const [innerTab, setInnerTab] = useState<DetailInnerTab>('timeline');
  const [expandedTimelineIds, setExpandedTimelineIds] = useState<Record<string, boolean>>({});

  // Ficha Padronizada editing state
  const [isEditingSheet, setIsEditingSheet] = useState(false);
  const [editSubject, setEditSubject] = useState('');
  const [editObjective, setEditObjective] = useState('');
  const [editNarrative, setEditNarrative] = useState('');
  const [editCategory, setEditCategory] = useState<OrderCategory>('Locação e contratos');
  const [editSubtype, setEditSubtype] = useState('');
  const [editPriority, setEditPriority] = useState<OrderPriority>('Normal');

  // Lateral action panels
  const [activeActionPanel, setActiveActionPanel] = useState<
    null | 'clarify' | 'escalate' | 'cancel'
  >(null);
  const [clarifyText, setClarifyText] = useState('');
  const [selectedHuman, setSelectedHuman] = useState(HUMAN_SPECIALISTS[0]);
  const [cancelReason, setCancelReason] = useState('');

  // Delivery & acceptance state
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');

  useEffect(() => {
    if (!order) return;
    setIsEditingSheet(false);
    setActiveActionPanel(null);
    setClarifyText('');
    setCancelReason('');
    setRating(order.delivery.rating ?? 5);
    setFeedbackComment(order.delivery.feedbackComment ?? '');
    setInnerTab(order.status === 'Entregue' ? 'delivery' : 'timeline');
  }, [order?.id]);

  useEffect(() => {
    if (!order) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [order, onClose]);

  if (!order) return null;

  const startEditingSheet = () => {
    setEditSubject(order.subject.slice(0, 60));
    setEditObjective(order.objective.slice(0, 140));
    setEditNarrative(order.narrative.slice(0, 400));
    setEditCategory(order.category);
    setEditSubtype(order.subtype);
    setEditPriority(order.priority);
    setIsEditingSheet(true);
  };

  const handleSaveSheet = () => {
    if (!editSubject.trim() || !editObjective.trim() || !editNarrative.trim()) return;
    onSaveInterpretation(order.id, {
      subject: editSubject.trim().slice(0, 60),
      objective: editObjective.trim().slice(0, 140),
      narrative: editNarrative.trim().slice(0, 400),
      category: editCategory,
      subtype: editSubtype,
      priority: editPriority,
    });
    setIsEditingSheet(false);
  };

  const requesterOrders = allOrders.filter(
    (item) => item.requesterName === order.requesterName && item.id !== order.id
  );

  const siblingOrders = order.subOrders
    ? allOrders.filter(
        (item) => order.subOrders?.includes(item.protocol) && item.id !== order.id
      )
    : [];

  const toggleTimelineDetail = (id: string) => {
    setExpandedTimelineIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const categoriesList = Object.keys(ORDER_CATEGORIES) as OrderCategory[];
  const subtypesForEditCategory = ORDER_CATEGORIES[editCategory] ?? [];

  const isClosed = order.status === 'Concluído' || order.status === 'Cancelado';

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/35 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-detail-protocol"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full max-w-[1080px] bg-[#F8F9FB] h-full border-l border-slate-200 flex flex-col overflow-hidden">
        {/* TOPO */}
        <header className="bg-white border-b border-slate-200 px-5 sm:px-6 py-4 flex items-start justify-between gap-4 shrink-0">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                id="order-detail-protocol"
                className="font-mono text-[15px] font-bold text-slate-900 tabular-nums"
              >
                {order.protocol}
              </span>
              {order.cycle > 1 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200 text-[11px] font-semibold">
                  Ciclo {order.cycle}
                </span>
              )}
              <StatusBadge status={order.status} />
              <PriorityBadge priority={order.priority} />
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11.5px] font-medium">
                <ChannelIcon channel={order.channel} className="w-3.5 h-3.5" />
                {order.channel}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F3F0FF] text-[#5B3FD0] border border-[#5B3FD0]/20 text-[11.5px] font-semibold tabular-nums">
                <Sparkles className="w-3 h-3" />
                Confiança {order.confidence}%
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-slate-500">
              <span className="inline-flex items-center gap-1 text-[#5B3FD0] font-medium">
                <Bot className="w-3.5 h-3.5" />
                {order.registeredBy}
              </span>
              <span aria-hidden="true">·</span>
              <span>Recebido: {order.createdAt}</span>
              <span aria-hidden="true">·</span>
              <AssigneeLabel type={order.assigneeType} name={order.assigneeName} />
              {siblingOrders.length > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1 text-slate-600">
                    <Split className="w-3 h-3" />
                    Sub-pedido irmão:
                    {siblingOrders.map((sib) => (
                      <button
                        key={sib.id}
                        type="button"
                        onClick={() => onSelectOrder(sib.id)}
                        className="font-mono font-semibold text-[#2563EB] hover:underline ml-1"
                      >
                        {sib.protocol}
                      </button>
                    ))}
                  </span>
                </>
              )}
            </div>

            {order.appliedRules && order.appliedRules.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {order.appliedRules.map((ar) => (
                  <button
                    key={`${ar.ruleId}-v${ar.version}`}
                    type="button"
                    onClick={() => onOpenRuleById?.(ar.ruleId)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F3F0FF] hover:bg-[#EAE3FF] border border-[#5B3FD0]/25 text-[#5B3FD0] text-[11.5px] font-semibold transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      Regra aplicada: {ar.ruleId} v{ar.version}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 shrink-0"
            aria-label="Fechar detalhes do pedido"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* BODY: 2-column layout (Main left + SLA/Actions/Requester right) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* LEFT MAIN COLUMN */}
            <div className="lg:col-span-8 space-y-5">
              {/* FICHA PADRONIZADA */}
              <section
                aria-labelledby="heading-ficha-padronizada"
                className="bg-white rounded-xl border border-slate-200/90 p-5 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3
                      id="heading-ficha-padronizada"
                      className="text-[14.5px] font-semibold text-slate-900"
                    >
                      Ficha padronizada
                    </h3>
                    <p className="text-[11.5px] text-slate-500 mt-0.5">
                      Resumo gerado pelo agente. Mensagem original completa preservada.
                    </p>
                  </div>

                  {!isEditingSheet ? (
                    <button
                      type="button"
                      onClick={startEditingSheet}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[12px] font-medium text-slate-700 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Corrigir interpretação
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingSheet(false)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-600 hover:bg-slate-50"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveSheet}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-[12px] font-semibold"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Salvar correção
                      </button>
                    </div>
                  )}
                </div>

                {isEditingSheet ? (
                  <div className="space-y-3.5 pt-1">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label
                          htmlFor="edit-sheet-subject"
                          className="text-[12px] font-semibold text-slate-700"
                        >
                          Assunto
                        </label>
                        <span className="text-[11px] font-mono tabular-nums text-slate-500">
                          {editSubject.length}/60
                        </span>
                      </div>
                      <input
                        id="edit-sheet-subject"
                        type="text"
                        maxLength={60}
                        value={editSubject}
                        onChange={(e) => setEditSubject(e.target.value.slice(0, 60))}
                        className="w-full px-3 py-2 rounded-lg border border-[#2563EB] bg-white text-[13px] font-medium text-slate-900"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label
                          htmlFor="edit-sheet-objective"
                          className="text-[12px] font-semibold text-slate-700"
                        >
                          Objetivo
                        </label>
                        <span className="text-[11px] font-mono tabular-nums text-slate-500">
                          {editObjective.length}/140
                        </span>
                      </div>
                      <input
                        id="edit-sheet-objective"
                        type="text"
                        maxLength={140}
                        value={editObjective}
                        onChange={(e) => setEditObjective(e.target.value.slice(0, 140))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-[12.5px] text-slate-800"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label
                          htmlFor="edit-sheet-narrative"
                          className="text-[12px] font-semibold text-slate-700"
                        >
                          Narrativa
                        </label>
                        <span className="text-[11px] font-mono tabular-nums text-slate-500">
                          {editNarrative.length}/400
                        </span>
                      </div>
                      <textarea
                        id="edit-sheet-narrative"
                        rows={3}
                        maxLength={400}
                        value={editNarrative}
                        onChange={(e) => setEditNarrative(e.target.value.slice(0, 400))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-[12.5px] text-slate-800 leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label
                          htmlFor="edit-sheet-category"
                          className="block text-[12px] font-semibold text-slate-700 mb-1"
                        >
                          Categoria
                        </label>
                        <select
                          id="edit-sheet-category"
                          value={editCategory}
                          onChange={(e) => {
                            const nextCat = e.target.value as OrderCategory;
                            setEditCategory(nextCat);
                            setEditSubtype(ORDER_CATEGORIES[nextCat][0]);
                          }}
                          className="w-full h-9 px-2.5 rounded-lg border border-slate-300 bg-white text-[12.5px]"
                        >
                          {categoriesList.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="edit-sheet-subtype"
                          className="block text-[12px] font-semibold text-slate-700 mb-1"
                        >
                          Subtipo
                        </label>
                        <select
                          id="edit-sheet-subtype"
                          value={editSubtype}
                          onChange={(e) => setEditSubtype(e.target.value)}
                          className="w-full h-9 px-2.5 rounded-lg border border-slate-300 bg-white text-[12.5px]"
                        >
                          {subtypesForEditCategory.map((sub) => (
                            <option key={sub} value={sub}>
                              {sub}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="edit-sheet-priority"
                          className="block text-[12px] font-semibold text-slate-700 mb-1"
                        >
                          Prioridade
                        </label>
                        <select
                          id="edit-sheet-priority"
                          value={editPriority}
                          onChange={(e) => setEditPriority(e.target.value as OrderPriority)}
                          className="w-full h-9 px-2.5 rounded-lg border border-slate-300 bg-white text-[12.5px]"
                        >
                          {(['Urgente', 'Alta', 'Normal', 'Baixa'] as OrderPriority[]).map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    <div>
                      <div className="flex items-center justify-between text-[11.5px] text-slate-500">
                        <span className="font-medium">Assunto</span>
                        <span className="font-mono tabular-nums">{order.subject.length}/60</span>
                      </div>
                      <p className="text-[15px] font-semibold text-slate-900 mt-0.5">
                        {order.subject}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[11.5px] text-slate-500">
                        <span className="font-medium">Objetivo</span>
                        <span className="font-mono tabular-nums">{order.objective.length}/140</span>
                      </div>
                      <p className="text-[13px] font-medium text-slate-800 mt-0.5 leading-snug">
                        {order.objective}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[11.5px] text-slate-500">
                        <span className="font-medium">Narrativa</span>
                        <span className="font-mono tabular-nums">{order.narrative.length}/400</span>
                      </div>
                      <p className="text-[12.5px] text-slate-600 mt-0.5 leading-relaxed">
                        {order.narrative}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-[12.5px]">
                      <div>
                        <span className="text-[11.5px] text-slate-500 block">
                          Categoria e subtipo
                        </span>
                        <span className="font-medium text-slate-900">
                          {order.category} &gt; {order.subtype}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11.5px] text-slate-500 block">
                          Solicitante e papel
                        </span>
                        <span className="font-medium text-slate-900">
                          {order.requesterName} · {order.requesterRole}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11.5px] text-slate-500 block">
                          Prazo solicitado vs. comprometido
                        </span>
                        <span className="font-medium text-slate-900 tabular-nums">
                          {order.slaRequested} → {order.slaCommitted}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11.5px] text-slate-500 block">Vínculos</span>
                        {order.links.length === 0 ? (
                          <span className="text-slate-400 text-[12px]">
                            Sem vínculos identificados ainda
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {order.links.map((lk) => (
                              <span
                                key={`${lk.type}-${lk.code}`}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F8F9FB] border border-slate-200 text-[11px] font-medium text-slate-700"
                              >
                                {lk.type === 'Imóvel' && (
                                  <Building2 className="w-3 h-3 text-[#2563EB]" />
                                )}
                                {lk.type === 'Contrato' && (
                                  <FileText className="w-3 h-3 text-[#5B3FD0]" />
                                )}
                                {lk.type === 'Pessoa' && (
                                  <User className="w-3 h-3 text-slate-500" />
                                )}
                                <span>{lk.label}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* ABAS INTERNAS */}
              <section className="bg-white rounded-xl border border-slate-200/90 overflow-hidden">
                <div
                  role="tablist"
                  aria-label="Seções do pedido"
                  className="flex overflow-x-auto border-b border-slate-200 px-3 pt-2 gap-1 bg-[#F8F9FB]/60"
                >
                  {(
                    [
                      { id: 'timeline', label: 'Linha do tempo', count: order.timeline.length },
                      { id: 'original', label: 'Mensagem original' },
                      { id: 'execution', label: 'Execução', count: order.executionSteps.length },
                      { id: 'delivery', label: 'Entrega e aceite' },
                    ] as { id: DetailInnerTab; label: string; count?: number }[]
                  ).map((tab) => {
                    const selected = innerTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        onClick={() => setInnerTab(tab.id)}
                        className={`px-3.5 py-2 text-[12.5px] font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                          selected
                            ? 'border-[#2563EB] text-[#2563EB] bg-white rounded-t-lg'
                            : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <span>{tab.label}</span>
                        {typeof tab.count === 'number' && (
                          <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 tabular-nums">
                            {tab.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="p-5">
                  {/* LINHA DO TEMPO */}
                  {innerTab === 'timeline' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-[11.5px] text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                          Eventos imutáveis (máx. 160 caracteres por registro)
                        </span>
                        <span>Ciclo atual: {order.cycle}</span>
                      </div>

                      <div className="space-y-3">
                        {order.timeline.map((ev: TimelineEventItem, idx) => {
                          const prevEv = idx > 0 ? order.timeline[idx - 1] : null;
                          const showCycleDivider = prevEv && ev.cycle > prevEv.cycle;
                          const detailsOpen = !!expandedTimelineIds[ev.id];

                          return (
                            <div key={ev.id}>
                              {showCycleDivider && (
                                <div className="my-4 flex items-center gap-3">
                                  <div className="h-px bg-red-200 flex-1" />
                                  <span className="px-2.5 py-0.5 rounded-md bg-red-50 border border-red-200 text-[11px] font-semibold text-red-700">
                                    Ciclo {ev.cycle}
                                  </span>
                                  <div className="h-px bg-red-200 flex-1" />
                                </div>
                              )}

                              <div className="flex gap-3">
                                <div className="flex flex-col items-center">
                                  <div className="w-2.5 h-2.5 rounded-full bg-[#2563EB] mt-1.5 shrink-0" />
                                  {idx < order.timeline.length - 1 && (
                                    <div className="w-px bg-slate-200 flex-1 mt-1" />
                                  )}
                                </div>

                                <div className="flex-1 pb-3">
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="text-[12.5px] font-semibold text-slate-900">
                                        {ev.type}
                                      </span>
                                      <span
                                        className={`inline-flex items-center px-1.5 py-0.5 rounded border text-[10.5px] font-medium ${getActorBadgeColor(
                                          ev.actor
                                        )}`}
                                      >
                                        {ev.actor}: {ev.actorName}
                                      </span>
                                    </div>
                                    <span className="text-[11px] text-slate-400 tabular-nums">
                                      {ev.timestamp}
                                    </span>
                                  </div>

                                  <p className="text-[12.5px] text-slate-700 mt-1 leading-snug">
                                    {ev.summary.slice(0, 160)}
                                  </p>

                                  <button
                                    type="button"
                                    onClick={() => toggleTimelineDetail(ev.id)}
                                    className="mt-1 inline-flex items-center gap-1 text-[11.5px] font-medium text-[#2563EB] hover:text-blue-700"
                                  >
                                    <span>ver detalhes</span>
                                    {detailsOpen ? (
                                      <ChevronUp className="w-3 h-3" />
                                    ) : (
                                      <ChevronDown className="w-3 h-3" />
                                    )}
                                  </button>

                                  {detailsOpen && (
                                    <div className="mt-2 rounded-lg bg-[#F8F9FB] border border-slate-200/80 px-3 py-2 text-[12px] text-slate-600">
                                      {ev.details}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* MENSAGEM ORIGINAL */}
                  {innerTab === 'original' && (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[12px] text-slate-500">
                        <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                          Mensagem original bruta (somente leitura e imutável)
                        </span>
                        <span className="tabular-nums">
                          Recebida em {order.originalMessage.receivedAt}
                        </span>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-[#F8F9FB] p-4 text-[13px] text-slate-800 leading-relaxed whitespace-pre-wrap select-text">
                        {order.originalMessage.rawText}
                      </div>

                      {order.originalMessage.attachments.length > 0 && (
                        <div>
                          <h4 className="text-[12px] font-semibold text-slate-700 mb-2">
                            Anexos recebidos ({order.originalMessage.attachments.length})
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {order.originalMessage.attachments.map((att) => (
                              <div
                                key={att.name}
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-[12px]"
                              >
                                <Paperclip className="w-3.5 h-3.5 text-[#5B3FD0]" />
                                <span className="font-medium text-slate-800">{att.name}</span>
                                <span className="text-slate-400 text-[11px]">{att.size}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="text-[12px] font-semibold text-slate-700 mb-2">
                          Metadados do canal
                        </h4>
                        <div className="rounded-lg border border-slate-200 divide-y divide-slate-100">
                          {order.originalMessage.channelMetadata.map((meta) => (
                            <div
                              key={meta.label}
                              className="px-3.5 py-2 flex items-center justify-between gap-4 text-[12px]"
                            >
                              <span className="text-slate-500">{meta.label}</span>
                              <span className="font-medium text-slate-900">{meta.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* EXECUÇÃO */}
                  {innerTab === 'execution' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[12px] text-slate-500">
                        <span>Checklist de passos executados pelo agente</span>
                        <span className="text-[#5B3FD0] font-medium">
                          Alterações podem ser desfeitas
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {order.executionSteps.map((step) => (
                          <div
                            key={step.id}
                            className="rounded-xl border border-slate-200 p-3.5 space-y-2.5"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-2.5">
                                {step.status === 'completed' ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                                ) : step.status === 'running' ? (
                                  <Sparkles className="w-4 h-4 text-[#5B3FD0] mt-0.5 shrink-0" />
                                ) : step.status === 'undone' ? (
                                  <RotateCcw className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                ) : (
                                  <Clock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                )}
                                <div>
                                  <p
                                    className={`text-[13px] font-medium ${
                                      step.status === 'undone'
                                        ? 'line-through text-slate-400'
                                        : 'text-slate-900'
                                    }`}
                                  >
                                    {step.label}
                                  </p>
                                  <span className="text-[11px] text-slate-500">
                                    {step.status === 'completed'
                                      ? 'Concluído'
                                      : step.status === 'running'
                                      ? 'Em andamento'
                                      : step.status === 'undone'
                                      ? 'Desfeito por você'
                                      : 'Pendente'}
                                  </span>
                                </div>
                              </div>

                              <span className="text-[11.5px] font-mono tabular-nums text-slate-500 shrink-0">
                                {step.duration}
                              </span>
                            </div>

                            {step.change && (
                              <div className="rounded-lg bg-[#F8F9FB] border border-slate-200/80 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="space-y-1 text-[12px]">
                                  <div className="font-semibold text-slate-800">
                                    {step.change.entity} · {step.change.field}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2 text-[11.5px]">
                                    <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200/70">
                                      Antes: {step.change.before}
                                    </span>
                                    <span className="text-slate-400">→</span>
                                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200/70">
                                      Depois: {step.change.after}
                                    </span>
                                  </div>
                                </div>

                                {!step.change.undone ? (
                                  <button
                                    type="button"
                                    onClick={() => onUndoExecutionChange(order.id, step.id)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11.5px] font-semibold text-slate-700 shrink-0"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    Desfazer
                                  </button>
                                ) : (
                                  <span className="text-[11.5px] font-medium text-slate-500 shrink-0">
                                    Revertido
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ENTREGA E ACEITE */}
                  {innerTab === 'delivery' && (
                    <div className="space-y-4">
                      {order.status === 'Entregue' && (
                        <div className="rounded-xl border border-[#5B3FD0]/25 bg-[#F3F0FF]/60 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-[12.5px] font-medium text-[#5B3FD0]">
                            <Clock className="w-4 h-4 shrink-0" />
                            <span>Aceite automático em 3 dias úteis</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onAcceptDelivery(order.id, rating, feedbackComment, true)}
                            className="text-[12px] font-semibold text-[#5B3FD0] hover:underline"
                          >
                            Simular aceite automático agora
                          </button>
                        </div>
                      )}

                      {order.delivery.acceptedType && (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 flex items-center justify-between gap-2 text-[12.5px] font-semibold text-emerald-800">
                          <span className="inline-flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            {order.delivery.acceptedType}
                          </span>
                          {order.delivery.rating && (
                            <span className="tabular-nums">
                              Nota: {order.delivery.rating}/5 estrelas
                            </span>
                          )}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-between text-[12px] text-slate-500 mb-1">
                          <span className="font-semibold text-slate-700">Resumo da solução</span>
                          <span className="font-mono tabular-nums">
                            {order.delivery.solutionSummary.slice(0, 280).length}/280
                          </span>
                        </div>
                        <p className="text-[13px] text-slate-800 leading-relaxed">
                          {order.delivery.solutionSummary.slice(0, 280)}
                        </p>
                      </div>

                      {order.delivery.artifacts.length > 0 && (
                        <div>
                          <h4 className="text-[12px] font-semibold text-slate-700 mb-2">
                            Artefatos gerados
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {order.delivery.artifacts.map((art) => (
                              <div
                                key={art.name}
                                className="rounded-lg border border-slate-200 px-3 py-2.5 flex items-center justify-between gap-2"
                              >
                                <div className="min-w-0">
                                  <div className="text-[12.5px] font-semibold text-slate-900 truncate">
                                    {art.name}
                                  </div>
                                  <div className="text-[11px] text-slate-500">{art.meta}</div>
                                </div>
                                <ExternalLink className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="text-[12px] font-semibold text-slate-700 mb-1.5">
                          O que mudou no sistema
                        </h4>
                        <ul className="list-disc pl-5 space-y-1 text-[12.5px] text-slate-600">
                          {order.delivery.systemChangesSummary.map((line, i) => (
                            <li key={i}>{line}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Formatted preview by origin channel */}
                      <div className="rounded-xl border border-slate-200 bg-[#F8F9FB] p-4 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-800">
                            <ChannelIcon
                              channel={order.delivery.requesterPreview.channel}
                              className="w-3.5 h-3.5"
                            />
                            Prévia do retorno ao solicitante ({order.delivery.requesterPreview.channel})
                          </span>
                          <span className="text-[11px] font-mono tabular-nums text-slate-500">
                            {order.delivery.requesterPreview.channel === 'WhatsApp'
                              ? `${order.delivery.requesterPreview.body.slice(0, 300).length}/300`
                              : order.delivery.requesterPreview.channel === 'E-mail'
                              ? `Corpo ${order.delivery.requesterPreview.body.slice(0, 600).length}/600`
                              : `${order.delivery.requesterPreview.body.length} caracteres`}
                          </span>
                        </div>

                        {order.delivery.requesterPreview.subject && (
                          <div className="text-[12px] text-slate-700 border-b border-slate-200 pb-1.5">
                            <span className="font-semibold">Assunto: </span>
                            {order.delivery.requesterPreview.subject.slice(0, 70)}
                            <span className="ml-2 text-[10.5px] font-mono text-slate-400">
                              ({order.delivery.requesterPreview.subject.slice(0, 70).length}/70)
                            </span>
                          </div>
                        )}

                        <p className="text-[12.5px] text-slate-700 leading-relaxed">
                          {order.delivery.requesterPreview.channel === 'WhatsApp'
                            ? order.delivery.requesterPreview.body.slice(0, 300)
                            : order.delivery.requesterPreview.channel === 'E-mail'
                            ? order.delivery.requesterPreview.body.slice(0, 600)
                            : order.delivery.requesterPreview.body}
                        </p>
                      </div>

                      {/* Acceptance controls */}
                      {!isClosed && (
                        <div className="pt-3 border-t border-slate-200 space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-[12.5px] font-semibold text-slate-900">
                              Avaliação da entrega
                            </span>
                            <div className="flex items-center gap-1" role="group" aria-label="Nota de 1 a 5 estrelas">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setRating(star)}
                                  aria-label={`${star} estrelas`}
                                  className="p-1 rounded hover:bg-slate-100"
                                >
                                  <Star
                                    className={`w-4 h-4 ${
                                      star <= rating
                                        ? 'text-amber-500 fill-amber-400'
                                        : 'text-slate-300'
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label
                                htmlFor="delivery-comment"
                                className="text-[12px] font-medium text-slate-600"
                              >
                                Comentário do aceite ou ajuste
                              </label>
                              <span className="text-[11px] font-mono tabular-nums text-slate-500">
                                {feedbackComment.length}/280
                              </span>
                            </div>
                            <textarea
                              id="delivery-comment"
                              rows={2}
                              maxLength={280}
                              value={feedbackComment}
                              onChange={(e) => setFeedbackComment(e.target.value.slice(0, 280))}
                              placeholder="Opcional no aceite; descreva o que ajustar ao pedir ajuste ou reabrir..."
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-[12.5px] text-slate-800"
                            />
                          </div>

                          <div className="flex flex-wrap items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                onReopenOrder(
                                  order.id,
                                  feedbackComment.trim() || 'Reaberto para nova conferência'
                                )
                              }
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-white hover:bg-red-50 text-[12px] font-medium text-red-700"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Reabrir
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                onRequestAdjustment(
                                  order.id,
                                  rating,
                                  feedbackComment.trim() || 'Solicitado ajuste pontual na entrega'
                                )
                              }
                              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[12px] font-medium text-slate-700"
                            >
                              Pedir ajuste
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                onAcceptDelivery(order.id, rating, feedbackComment.trim(), false)
                              }
                              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-[12px] font-semibold"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Aceitar
                            </button>
                          </div>
                        </div>
                      )}

                      {order.status === 'Concluído' && (
                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              onReopenOrder(
                                order.id,
                                feedbackComment.trim() || 'Pedido reaberto após conclusão para revisão'
                              )
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-[12px] font-medium text-slate-700"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Reabrir pedido (Ciclo {order.cycle + 1})
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* RIGHT SIDEBAR COLUMN */}
            <aside className="lg:col-span-4 space-y-4">
              {/* CARTÃO DE SLA */}
              <section
                aria-label="Cartão de SLA"
                className="bg-white rounded-xl border border-slate-200/90 p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-[13.5px] font-semibold text-slate-900 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#2563EB]" />
                    Prazo e SLA
                  </h3>
                  <PriorityBadge priority={order.priority} />
                </div>

                <div className="rounded-lg bg-[#F8F9FB] border border-slate-200/80 p-3 space-y-1.5">
                  <SlaSemaphoreIndicator semaphore={order.slaSemaphore} text={order.slaText} />
                  <div className="text-[11.5px] text-slate-500">
                    Comprometido: <strong className="text-slate-800">{order.slaCommitted}</strong>
                  </div>
                </div>

                {order.status === 'Aguardando esclarecimento' && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-2 flex items-start gap-2 text-[11.5px] text-amber-800">
                    <PauseCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold">Relógio pausado</div>
                      <p className="mt-0.5 leading-snug">
                        {order.slaPausedReason ?? 'Aguardando resposta do solicitante.'}
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5 pt-1">
                  <div className="text-[11.5px] font-semibold text-slate-600">
                    Tempo por etapa
                  </div>
                  {order.stageDurations.map((st) => (
                    <div
                      key={st.stage}
                      className="flex items-center justify-between text-[12px] py-1 border-b border-slate-100 last:border-b-0"
                    >
                      <span
                        className={
                          st.active ? 'font-semibold text-slate-900' : 'text-slate-600'
                        }
                      >
                        {st.stage}
                      </span>
                      <span className="font-mono tabular-nums text-[11.5px] text-slate-700">
                        {st.duration}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* AÇÕES */}
              <section
                aria-label="Ações operacionais do pedido"
                className="bg-white rounded-xl border border-slate-200/90 p-4 space-y-2.5"
              >
                <h3 className="text-[13.5px] font-semibold text-slate-900 mb-1">Ações</h3>

                {!isClosed && (
                  <button
                    type="button"
                    onClick={() => onApproveOrder(order.id)}
                    className="w-full py-2 px-3 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-[12.5px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Aprovar
                  </button>
                )}

                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    disabled={isClosed}
                    onClick={() =>
                      setActiveActionPanel((prev) => (prev === 'clarify' ? null : 'clarify'))
                    }
                    className="w-full py-2 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 text-[12.5px] font-medium text-slate-700 flex items-center justify-center gap-1.5"
                  >
                    <MessageSquarePlus className="w-3.5 h-3.5" />
                    Pedir esclarecimento
                  </button>

                  {activeActionPanel === 'clarify' && (
                    <div className="rounded-lg border border-slate-200 bg-[#F8F9FB] p-3 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-medium">Pergunta ao solicitante</span>
                        <span className="font-mono tabular-nums">{clarifyText.length}/200</span>
                      </div>
                      <textarea
                        rows={3}
                        maxLength={200}
                        value={clarifyText}
                        onChange={(e) => setClarifyText(e.target.value.slice(0, 200))}
                        placeholder="O relógio de SLA será pausado até a resposta..."
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-[12px]"
                      />
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setActiveActionPanel(null)}
                          className="px-2.5 py-1 rounded-md text-[11.5px] text-slate-600 hover:bg-slate-200/60"
                        >
                          Voltar
                        </button>
                        <button
                          type="button"
                          disabled={!clarifyText.trim()}
                          onClick={() => {
                            onRequestClarification(order.id, clarifyText.trim());
                            setClarifyText('');
                            setActiveActionPanel(null);
                          }}
                          className="px-3 py-1 rounded-md bg-[#2563EB] disabled:bg-slate-300 text-white text-[11.5px] font-semibold"
                        >
                          Enviar e pausar SLA
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={isClosed}
                    onClick={() =>
                      setActiveActionPanel((prev) => (prev === 'escalate' ? null : 'escalate'))
                    }
                    className="w-full py-2 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 text-[12.5px] font-medium text-slate-700 flex items-center justify-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Escalar para humano
                  </button>

                  {activeActionPanel === 'escalate' && (
                    <div className="rounded-lg border border-slate-200 bg-[#F8F9FB] p-3 space-y-2">
                      <label
                        htmlFor="escalate-human-select"
                        className="block text-[11px] font-medium text-slate-600"
                      >
                        Selecionar responsável humano
                      </label>
                      <select
                        id="escalate-human-select"
                        value={selectedHuman}
                        onChange={(e) => setSelectedHuman(e.target.value)}
                        className="w-full h-8 px-2 rounded-lg border border-slate-300 bg-white text-[12px]"
                      >
                        {HUMAN_SPECIALISTS.map((sp) => (
                          <option key={sp} value={sp}>
                            {sp}
                          </option>
                        ))}
                      </select>
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setActiveActionPanel(null)}
                          className="px-2.5 py-1 rounded-md text-[11.5px] text-slate-600"
                        >
                          Voltar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onEscalateToHuman(order.id, selectedHuman.split(' (')[0]);
                            setActiveActionPanel(null);
                          }}
                          className="px-3 py-1 rounded-md bg-slate-900 text-white text-[11.5px] font-semibold"
                        >
                          Confirmar escala
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={isClosed}
                    onClick={() =>
                      setActiveActionPanel((prev) => (prev === 'cancel' ? null : 'cancel'))
                    }
                    className="w-full py-2 px-3 rounded-lg border border-slate-200 bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-200 disabled:opacity-50 text-[12.5px] font-medium text-slate-600 flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Cancelar pedido
                  </button>

                  {activeActionPanel === 'cancel' && (
                    <div className="rounded-lg border border-red-200 bg-red-50/50 p-3 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-red-700">
                        <span className="font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Motivo do cancelamento
                        </span>
                        <span className="font-mono tabular-nums">{cancelReason.length}/200</span>
                      </div>
                      <textarea
                        rows={2}
                        maxLength={200}
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value.slice(0, 200))}
                        placeholder="Informe o motivo do cancelamento..."
                        className="w-full px-2.5 py-1.5 rounded-lg border border-red-200 bg-white text-[12px]"
                      />
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setActiveActionPanel(null)}
                          className="px-2.5 py-1 rounded-md text-[11.5px] text-slate-600"
                        >
                          Voltar
                        </button>
                        <button
                          type="button"
                          disabled={!cancelReason.trim()}
                          onClick={() => {
                            onCancelOrder(order.id, cancelReason.trim());
                            setCancelReason('');
                            setActiveActionPanel(null);
                          }}
                          className="px-3 py-1 rounded-md bg-red-600 disabled:bg-red-300 text-white text-[11.5px] font-semibold"
                        >
                          Confirmar cancelamento
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* CARTÃO DO SOLICITANTE */}
              <section
                aria-label="Dados e histórico do solicitante"
                className="bg-white rounded-xl border border-slate-200/90 p-4 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#EFF4FF] text-[#2563EB] flex items-center justify-center font-semibold text-[13px] shrink-0">
                    {order.requesterName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-semibold text-slate-900 truncate">
                      {order.requesterName}
                    </div>
                    <div className="text-[11.5px] text-slate-500">
                      {order.requesterRole} · {order.requesterContact}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className="text-[11.5px] font-semibold text-slate-600 mb-2">
                    Histórico recente do solicitante
                  </div>
                  {requesterOrders.length === 0 ? (
                    <p className="text-[12px] text-slate-400">
                      Primeiro pedido registrado para este solicitante na amostra atual.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {requesterOrders.map((hist) => (
                        <button
                          key={hist.id}
                          type="button"
                          onClick={() => onSelectOrder(hist.id)}
                          className="w-full text-left rounded-lg border border-slate-200/80 hover:border-[#2563EB]/50 p-2 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2 text-[11px]">
                            <span className="font-mono font-semibold text-[#2563EB]">
                              {hist.protocol}
                            </span>
                            <span className="text-slate-500">{hist.status}</span>
                          </div>
                          <div className="text-[12px] text-slate-800 truncate mt-0.5">
                            {hist.subject}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
