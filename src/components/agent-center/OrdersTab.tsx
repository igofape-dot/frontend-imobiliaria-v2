import { useMemo, useState } from 'react';
import {
  Search,
  List,
  Columns3,
  X,
  AlertTriangle,
  RotateCcw,
  Inbox,
  CheckCircle2,
  Clock,
  AlertOctagon,
  UserCheck,
  Sparkles,
  Bot,
  Split,
} from 'lucide-react';
import {
  ORDER_CATEGORIES,
  type AgentOrder,
  type OrderCategory,
  type OrderChannel,
  type OrderPriority,
  type OrderStatus,
  type SlaSemaphore,
} from '../../data/agentOrdersData';
import {
  AssigneeLabel,
  ChannelIcon,
  PriorityBadge,
  SlaSemaphoreIndicator,
  StatusBadge,
  WordTruncatedText,
} from './OrderHelpers';

export type OrdersKpiFilter =
  | 'all'
  | 'abertos'
  | 'em_risco'
  | 'atrasados'
  | 'aguardando_voce'
  | 'aguardando_aceite'
  | 'concluidos_hoje';

interface OrdersTabProps {
  orders: AgentOrder[];
  initialOrdersBaseline: {
    abertos: number;
    emRisco: number;
    atrasados: number;
    aguardandoVoce: number;
    aguardandoAceite: number;
    concluidosHoje: number;
  };
  isLoading: boolean;
  hasError?: boolean;
  onRetry?: () => void;
  onSelectOrder: (orderId: string) => void;
}

const CHANNELS: OrderChannel[] = [
  'WhatsApp',
  'E-mail',
  'Chat do sistema',
  'Portais',
  'Upload de documentos',
];

const CATEGORIES = Object.keys(ORDER_CATEGORIES) as OrderCategory[];

const STATUSES: OrderStatus[] = [
  'Recebido',
  'Interpretado',
  'Aguardando esclarecimento',
  'Aguardando aprovação',
  'Em execução',
  'Entregue',
  'Concluído',
  'Reaberto',
  'Cancelado',
];

const PRIORITIES: OrderPriority[] = ['Urgente', 'Alta', 'Normal', 'Baixa'];

const KANBAN_COLUMNS: {
  id: string;
  title: string;
  subtitle: string;
  statuses: OrderStatus[];
}[] = [
  { id: 'recebido', title: 'Recebido', subtitle: 'Entrada bruta', statuses: ['Recebido'] },
  { id: 'interpretado', title: 'Interpretado', subtitle: 'Ficha padronizada', statuses: ['Interpretado'] },
  {
    id: 'aguardando',
    title: 'Aguardando',
    subtitle: 'Esclarecimento ou aprovação',
    statuses: ['Aguardando esclarecimento', 'Aguardando aprovação'],
  },
  {
    id: 'execucao',
    title: 'Em execução',
    subtitle: 'Processando / Ciclo 2',
    statuses: ['Em execução', 'Reaberto'],
  },
  { id: 'entregue', title: 'Entregue', subtitle: 'Aguardando aceite', statuses: ['Entregue'] },
  { id: 'concluido', title: 'Concluído', subtitle: 'Aceite registrado', statuses: ['Concluído'] },
];

export function OrdersTab({
  orders,
  initialOrdersBaseline,
  isLoading,
  hasError = false,
  onRetry,
  onSelectOrder,
}: OrdersTabProps) {
  const [kpiFilter, setKpiFilter] = useState<OrdersKpiFilter>('all');
  const [viewMode, setViewMode] = useState<'lista' | 'kanban'>('lista');
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState<'all' | OrderChannel>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | OrderCategory>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | OrderPriority>('all');
  const [requesterFilter, setRequesterFilter] = useState<string>('all');
  const [slaFilter, setSlaFilter] = useState<'all' | SlaSemaphore>('all');

  const requesterOptions = useMemo(() => {
    const names = Array.from(new Set(orders.map((o) => o.requesterName)));
    return names.sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [orders]);

  // Compute dynamic KPI counters anchored to the baseline figures (38, 6, 3, 7, 9, 21)
  const kpiCounters = useMemo(() => {
    const liveAbertos = orders.filter(
      (o) => o.status !== 'Concluído' && o.status !== 'Cancelado'
    ).length;
    const liveRisco = orders.filter(
      (o) => o.slaSemaphore === 'em_risco' && o.status !== 'Concluído' && o.status !== 'Cancelado'
    ).length;
    const liveAtrasados = orders.filter(
      (o) => o.slaSemaphore === 'atrasado' && o.status !== 'Concluído' && o.status !== 'Cancelado'
    ).length;
    const liveAguardandoVoce = orders.filter(
      (o) => o.status === 'Aguardando aprovação' || o.assigneeType === 'Humano'
    ).length;
    const liveAguardandoAceite = orders.filter((o) => o.status === 'Entregue').length;
    const liveConcluidos = orders.filter((o) => o.status === 'Concluído').length;

    return {
      abertos: Math.max(0, 38 + (liveAbertos - initialOrdersBaseline.abertos)),
      emRisco: Math.max(0, 6 + (liveRisco - initialOrdersBaseline.emRisco)),
      atrasados: Math.max(0, 3 + (liveAtrasados - initialOrdersBaseline.atrasados)),
      aguardandoVoce: Math.max(0, 7 + (liveAguardandoVoce - initialOrdersBaseline.aguardandoVoce)),
      aguardandoAceite: Math.max(
        0,
        9 + (liveAguardandoAceite - initialOrdersBaseline.aguardandoAceite)
      ),
      concluidosHoje: Math.max(
        0,
        21 + (liveConcluidos - initialOrdersBaseline.concluidosHoje)
      ),
    };
  }, [orders, initialOrdersBaseline]);

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return orders.filter((order) => {
      if (kpiFilter === 'abertos') {
        if (order.status === 'Concluído' || order.status === 'Cancelado') return false;
      } else if (kpiFilter === 'em_risco') {
        if (
          order.slaSemaphore !== 'em_risco' ||
          order.status === 'Concluído' ||
          order.status === 'Cancelado'
        ) {
          return false;
        }
      } else if (kpiFilter === 'atrasados') {
        if (
          order.slaSemaphore !== 'atrasado' ||
          order.status === 'Concluído' ||
          order.status === 'Cancelado'
        ) {
          return false;
        }
      } else if (kpiFilter === 'aguardando_voce') {
        if (order.status !== 'Aguardando aprovação' && order.assigneeType !== 'Humano') {
          return false;
        }
      } else if (kpiFilter === 'aguardando_aceite') {
        if (order.status !== 'Entregue') return false;
      } else if (kpiFilter === 'concluidos_hoje') {
        if (order.status !== 'Concluído') return false;
      }

      if (q) {
        const matches =
          order.protocol.toLowerCase().includes(q) ||
          order.subject.toLowerCase().includes(q) ||
          order.requesterName.toLowerCase().includes(q) ||
          order.requesterRole.toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (channelFilter !== 'all' && order.channel !== channelFilter) return false;
      if (categoryFilter !== 'all' && order.category !== categoryFilter) return false;
      if (statusFilter !== 'all' && order.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && order.priority !== priorityFilter) return false;
      if (requesterFilter !== 'all' && order.requesterName !== requesterFilter) return false;
      if (slaFilter !== 'all' && order.slaSemaphore !== slaFilter) return false;

      return true;
    });
  }, [
    orders,
    kpiFilter,
    searchQuery,
    channelFilter,
    categoryFilter,
    statusFilter,
    priorityFilter,
    requesterFilter,
    slaFilter,
  ]);

  const hasAnyFilter =
    kpiFilter !== 'all' ||
    searchQuery.trim() !== '' ||
    channelFilter !== 'all' ||
    categoryFilter !== 'all' ||
    statusFilter !== 'all' ||
    priorityFilter !== 'all' ||
    requesterFilter !== 'all' ||
    slaFilter !== 'all';

  const clearAllFilters = () => {
    setKpiFilter('all');
    setSearchQuery('');
    setChannelFilter('all');
    setCategoryFilter('all');
    setStatusFilter('all');
    setPriorityFilter('all');
    setRequesterFilter('all');
    setSlaFilter('all');
  };

  const kpiCards: {
    id: OrdersKpiFilter;
    label: string;
    value: number;
    tone: 'neutral' | 'amber' | 'red' | 'blue' | 'purple' | 'green';
  }[] = [
    { id: 'abertos', label: 'Abertos', value: kpiCounters.abertos, tone: 'blue' },
    { id: 'em_risco', label: 'Em risco de prazo', value: kpiCounters.emRisco, tone: 'amber' },
    { id: 'atrasados', label: 'Atrasados', value: kpiCounters.atrasados, tone: 'red' },
    {
      id: 'aguardando_voce',
      label: 'Aguardando você',
      value: kpiCounters.aguardandoVoce,
      tone: 'amber',
    },
    {
      id: 'aguardando_aceite',
      label: 'Aguardando aceite',
      value: kpiCounters.aguardandoAceite,
      tone: 'purple',
    },
    {
      id: 'concluidos_hoje',
      label: 'Concluídos hoje',
      value: kpiCounters.concluidosHoje,
      tone: 'green',
    },
  ];

  const getEmptyMessage = () => {
    if (kpiFilter === 'aguardando_voce') return 'Nenhum pedido aguardando você';
    if (kpiFilter === 'atrasados') return 'Nenhum pedido atrasado no momento';
    if (kpiFilter === 'em_risco') return 'Nenhum pedido em risco de prazo';
    if (kpiFilter === 'aguardando_aceite') return 'Nenhum pedido aguardando aceite';
    if (kpiFilter === 'concluidos_hoje') return 'Nenhum pedido concluído hoje';
    return 'Nenhum pedido encontrado para os filtros selecionados';
  };

  return (
    <div className="space-y-5">
      {/* 1. Faixa de 6 indicadores clicáveis + 2 secundários */}
      <section aria-label="Indicadores da fila de pedidos" className="space-y-2.5">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3" aria-busy="true">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200/90 p-3.5 animate-pulse h-[78px]"
              >
                <div className="h-3 w-24 bg-slate-200 rounded" />
                <div className="h-6 w-12 bg-slate-100 rounded mt-2.5" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
            {kpiCards.map((card) => {
              const selected = kpiFilter === card.id;
              const toneBorder = selected
                ? 'border-[#2563EB] bg-[#EFF4FF]/55 ring-1 ring-[#2563EB]/25'
                : 'border-slate-200/90 bg-white hover:border-slate-300';

              const valueColor =
                card.tone === 'red'
                  ? 'text-red-700'
                  : card.tone === 'amber'
                  ? 'text-amber-700'
                  : card.tone === 'green'
                  ? 'text-emerald-700'
                  : card.tone === 'purple'
                  ? 'text-[#5B3FD0]'
                  : 'text-slate-900';

              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setKpiFilter((prev) => (prev === card.id ? 'all' : card.id))}
                  aria-pressed={selected}
                  className={`text-left rounded-xl border px-3.5 py-3 transition-colors ${toneBorder}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] font-medium text-slate-600 truncate">
                      {card.label}
                    </span>
                    {card.id === 'em_risco' && (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    )}
                    {card.id === 'atrasados' && (
                      <AlertOctagon className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    )}
                    {card.id === 'aguardando_voce' && (
                      <UserCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    )}
                    {card.id === 'aguardando_aceite' && (
                      <Sparkles className="w-3.5 h-3.5 text-[#5B3FD0] shrink-0" />
                    )}
                    {card.id === 'concluidos_hoje' && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    )}
                    {card.id === 'abertos' && (
                      <Clock className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                    )}
                  </div>
                  <div className={`text-[22px] font-bold mt-1 tabular-nums leading-tight ${valueColor}`}>
                    {card.value}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Secondary KPIs strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-[12px] text-slate-600">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Taxa de aceite na 1ª entrega:</span>
              <strong className="font-semibold text-slate-900 tabular-nums">91%</strong>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Tempo médio de ciclo:</span>
              <strong className="font-semibold text-slate-900 tabular-nums">3h40</strong>
            </span>
          </div>

          <span className="inline-flex items-center gap-1 text-[11.5px] text-[#5B3FD0] font-medium">
            <Bot className="w-3.5 h-3.5" />
            Clique em um indicador acima para filtrar a fila
          </span>
        </div>
      </section>

      {/* 2. Barra de ferramentas */}
      <section
        aria-label="Filtros e busca de pedidos"
        className="bg-white rounded-xl border border-slate-200/90 p-3.5 space-y-3"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[240px]">
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              strokeWidth={1.85}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por protocolo (PED-...), assunto ou solicitante..."
              aria-label="Buscar por protocolo, assunto ou solicitante"
              className="w-full h-9 pl-9 pr-8 rounded-lg border border-slate-200 bg-[#F8F9FB] text-[12.5px] text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#2563EB] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                aria-label="Limpar busca"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right: Lista | Kanban toggle */}
          <div className="flex items-center justify-between lg:justify-end gap-2.5 shrink-0">
            {hasAnyFilter && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 whitespace-nowrap"
              >
                <X className="w-3.5 h-3.5" />
                Limpar filtros
              </button>
            )}

            <div
              role="group"
              aria-label="Alternar visualização Lista ou Kanban"
              className="inline-flex items-center p-1 rounded-lg bg-[#F8F9FB] border border-slate-200/80"
            >
              <button
                type="button"
                onClick={() => setViewMode('lista')}
                aria-pressed={viewMode === 'lista'}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[12px] font-medium transition-colors whitespace-nowrap ${
                  viewMode === 'lista'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/70'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                Lista
              </button>
              <button
                type="button"
                onClick={() => setViewMode('kanban')}
                aria-pressed={viewMode === 'kanban'}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[12px] font-medium transition-colors whitespace-nowrap ${
                  viewMode === 'kanban'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/70'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Columns3 className="w-3.5 h-3.5" />
                Kanban
              </button>
            </div>
          </div>
        </div>

        {/* 6 Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value as 'all' | OrderChannel)}
            aria-label="Filtrar por canal"
            className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-[12px] text-slate-700"
          >
            <option value="all">Canal: Todos</option>
            {CHANNELS.map((ch) => (
              <option key={ch} value={ch}>
                {ch}
              </option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as 'all' | OrderCategory)}
            aria-label="Filtrar por categoria"
            className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-[12px] text-slate-700"
          >
            <option value="all">Categoria: Todas</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | OrderStatus)}
            aria-label="Filtrar por status"
            className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-[12px] text-slate-700"
          >
            <option value="all">Status: Todos</option>
            {STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as 'all' | OrderPriority)}
            aria-label="Filtrar por prioridade"
            className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-[12px] text-slate-700"
          >
            <option value="all">Prioridade: Todas</option>
            {PRIORITIES.map((pr) => (
              <option key={pr} value={pr}>
                {pr}
              </option>
            ))}
          </select>

          <select
            value={requesterFilter}
            onChange={(e) => setRequesterFilter(e.target.value)}
            aria-label="Filtrar por solicitante"
            className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-[12px] text-slate-700"
          >
            <option value="all">Solicitante: Todos</option>
            {requesterOptions.map((req) => (
              <option key={req} value={req}>
                {req}
              </option>
            ))}
          </select>

          <select
            value={slaFilter}
            onChange={(e) => setSlaFilter(e.target.value as 'all' | SlaSemaphore)}
            aria-label="Filtrar por prazo"
            className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-[12px] text-slate-700"
          >
            <option value="all">Prazo: Todos</option>
            <option value="no_prazo">No prazo</option>
            <option value="em_risco">Em risco</option>
            <option value="atrasado">Atrasado</option>
            <option value="pausado">Pausado</option>
          </select>
        </div>
      </section>

      {/* 3 & 4. LISTA or KANBAN */}
      {isLoading ? (
        <div
          className="bg-white rounded-xl border border-slate-200/90 p-4 space-y-3 animate-pulse"
          aria-busy="true"
          aria-label="Carregando lista de pedidos"
        >
          {[1, 2, 3, 4, 5, 6].map((row) => (
            <div key={row} className="h-11 rounded-lg bg-slate-100" />
          ))}
        </div>
      ) : hasError ? (
        <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
          <AlertTriangle className="w-7 h-7 text-red-600 mx-auto mb-2" />
          <h3 className="text-[14px] font-semibold text-slate-900">
            Não foi possível carregar a fila de pedidos
          </h3>
          <p className="text-[12.5px] text-slate-600 mt-1">
            O agente continua recebendo solicitações pelos canais integrados.
          </p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-[12.5px] font-medium text-slate-800 hover:bg-slate-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Tentar novamente
            </button>
          )}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/90 p-10 text-center">
          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
            <Inbox className="w-5 h-5" />
          </div>
          <h3 className="text-[14.5px] font-semibold text-slate-900">{getEmptyMessage()}</h3>
          <p className="text-[12.5px] text-slate-500 mt-1">
            Ajuste os filtros ativos ou envie um novo pedido diretamente para o agente.
          </p>
          {hasAnyFilter && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-[12.5px] font-medium text-slate-800 hover:bg-slate-50"
            >
              Limpar filtros
            </button>
          )}
        </div>
      ) : viewMode === 'lista' ? (
        <section
          aria-label="Lista de pedidos"
          className="bg-white rounded-xl border border-slate-200/90 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[12.5px]">
              <thead>
                <tr className="bg-[#F8F9FB] border-b border-slate-200 text-slate-600">
                  <th className="py-2.5 px-3 font-semibold text-[11.5px] whitespace-nowrap">
                    Protocolo
                  </th>
                  <th className="py-2.5 px-3 font-semibold text-[11.5px] whitespace-nowrap">
                    Canal
                  </th>
                  <th className="py-2.5 px-3 font-semibold text-[11.5px] whitespace-nowrap">
                    Assunto
                  </th>
                  <th className="py-2.5 px-3 font-semibold text-[11.5px] whitespace-nowrap">
                    Categoria &gt; Subtipo
                  </th>
                  <th className="py-2.5 px-3 font-semibold text-[11.5px] whitespace-nowrap">
                    Solicitante
                  </th>
                  <th className="py-2.5 px-3 font-semibold text-[11.5px] whitespace-nowrap">
                    Prioridade
                  </th>
                  <th className="py-2.5 px-3 font-semibold text-[11.5px] whitespace-nowrap">
                    Status
                  </th>
                  <th className="py-2.5 px-3 font-semibold text-[11.5px] whitespace-nowrap">
                    Prazo
                  </th>
                  <th className="py-2.5 px-3 font-semibold text-[11.5px] whitespace-nowrap">
                    Responsável
                  </th>
                  <th className="py-2.5 px-3 font-semibold text-[11.5px] whitespace-nowrap text-right">
                    Confiança
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => onSelectOrder(order.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectOrder(order.id);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Abrir pedido ${order.protocol}: ${order.subject}`}
                    className="hover:bg-[#EFF4FF]/45 focus-visible:bg-[#EFF4FF]/60 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-3 whitespace-nowrap align-middle">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[12px] font-semibold text-slate-900 tabular-nums">
                          {order.protocol}
                        </span>
                        {order.parentProtocol && (
                          <span
                            title={`Dividido de ${order.parentProtocol}`}
                            className="inline-flex items-center text-slate-400"
                          >
                            <Split className="w-3 h-3" />
                          </span>
                        )}
                        {order.cycle > 1 && (
                          <span className="text-[10px] font-semibold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                            Ciclo {order.cycle}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap align-middle">
                      <span
                        className="inline-flex items-center gap-1.5 text-slate-700"
                        title={order.channel}
                      >
                        <ChannelIcon channel={order.channel} />
                        <span className="sr-only">{order.channel}</span>
                      </span>
                    </td>

                    <td className="py-3 px-3 max-w-[260px] align-middle">
                      <WordTruncatedText
                        text={order.subject}
                        maxChars={48}
                        className="font-medium text-slate-900 block"
                      />
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap align-middle">
                      <WordTruncatedText
                        text={`${order.category} > ${order.subtype}`}
                        maxChars={34}
                        className="text-slate-600"
                      />
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap align-middle">
                      <div className="font-medium text-slate-900">
                        <WordTruncatedText text={order.requesterName} maxChars={24} />
                      </div>
                      <div className="text-[11px] text-slate-500">{order.requesterRole}</div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap align-middle">
                      <PriorityBadge priority={order.priority} />
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap align-middle">
                      <StatusBadge status={order.status} />
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap align-middle">
                      <SlaSemaphoreIndicator semaphore={order.slaSemaphore} text={order.slaText} />
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap align-middle">
                      <AssigneeLabel type={order.assigneeType} name={order.assigneeName} />
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap align-middle text-right font-semibold tabular-nums text-slate-800">
                      {order.confidence}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2.5 bg-[#F8F9FB] border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-[11.5px] text-slate-500">
            <span>
              Exibindo <strong className="text-slate-800 tabular-nums">{filteredOrders.length}</strong>{' '}
              de <strong className="text-slate-800 tabular-nums">{orders.length}</strong> pedidos da amostra ativa
            </span>
            <span>Clique em qualquer pedido para abrir a ficha, linha do tempo e entrega</span>
          </div>
        </section>
      ) : (
        /* KANBAN */
        <section
          aria-label="Quadro Kanban de pedidos"
          className="overflow-x-auto pb-2"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3.5 min-w-[1060px] items-start">
            {KANBAN_COLUMNS.map((col) => {
              const colOrders = filteredOrders.filter((o) => col.statuses.includes(o.status));
              return (
                <div
                  key={col.id}
                  className="bg-white rounded-xl border border-slate-200/90 flex flex-col"
                >
                  <div className="px-3.5 py-3 border-b border-slate-100 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-[13px] font-semibold text-slate-900 truncate">
                        {col.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 truncate">{col.subtitle}</p>
                    </div>
                    <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-[#F8F9FB] border border-slate-200 text-[11.5px] font-semibold text-slate-700 tabular-nums shrink-0">
                      {colOrders.length}
                    </span>
                  </div>

                  <div className="p-2.5 space-y-2.5 min-h-[220px]">
                    {colOrders.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-[11.5px] text-slate-400">
                        Nenhum pedido nesta etapa
                      </div>
                    ) : (
                      colOrders.map((order) => (
                        <button
                          key={order.id}
                          type="button"
                          onClick={() => onSelectOrder(order.id)}
                          className="w-full text-left rounded-lg border border-slate-200/90 bg-[#F8F9FB]/65 hover:bg-white hover:border-[#2563EB]/50 p-3 transition-colors space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-[11px] font-semibold text-slate-700 tabular-nums">
                              {order.protocol}
                            </span>
                            <span title={order.channel}>
                              <ChannelIcon channel={order.channel} className="w-3.5 h-3.5" />
                            </span>
                          </div>

                          <div className="text-[12.5px] font-semibold text-slate-900 leading-snug">
                            <WordTruncatedText text={order.subject} maxChars={52} />
                          </div>

                          <div className="text-[11px] text-slate-500">
                            {order.requesterName} · {order.requesterRole}
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <PriorityBadge priority={order.priority} />
                            {order.cycle > 1 && (
                              <span className="text-[10px] font-semibold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                                Ciclo {order.cycle}
                              </span>
                            )}
                          </div>

                          <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between gap-2">
                            <SlaSemaphoreIndicator
                              semaphore={order.slaSemaphore}
                              text={order.slaText}
                            />
                            <span className="text-[11px] font-semibold text-slate-600 tabular-nums">
                              {order.confidence}%
                            </span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
