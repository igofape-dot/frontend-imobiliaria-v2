import { useMemo, useState } from 'react';
import {
  Search,
  List,
  Columns3,
  MessageSquare,
  Mail,
  Upload,
  Monitor,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { formatBRL } from '../../data/financeiroData';
import type { PerfilRegra } from '../../data/rulesData';
import type { AskAgentRequestPayload } from '../financeiro/AskAgentOrderDrawer';
import {
  AgentRegisteredTag,
  RuleAppliedChip,
  SemaphoreBadge,
} from '../financeiro/FinanceiroShared';
import type {
  MaintenanceTicket,
  TicketStage,
  UrgencyLevel,
} from '../../data/manutencaoData';

interface ManutencaoTabChamadosProps {
  tickets: MaintenanceTicket[];
  perfil: PerfilRegra;
  readOnly: boolean;
  onOpenTicket: (ticket: MaintenanceTicket) => void;
  onOpenRuleById: (ruleId: string) => void;
  onAskAgent: (req: AskAgentRequestPayload) => void;
}

type FilterChipId =
  | 'abertos'
  | 'emergencia'
  | 'urgentes'
  | 'atrasados'
  | 'orcamento'
  | 'aprovacao'
  | 'concluidos30d';

const KANBAN_COLUMNS: { stage: TicketStage; totalCount: number }[] = [
  { stage: 'Triagem', totalCount: 3 },
  { stage: 'Orçamento', totalCount: 9 },
  { stage: 'Aguardando aprovação', totalCount: 3 },
  { stage: 'Agendado', totalCount: 7 },
  { stage: 'Em execução', totalCount: 8 },
  { stage: 'Aguardando aceite', totalCount: 4 },
];

function ChannelIcon({ channel }: { channel: MaintenanceTicket['channel'] }) {
  if (channel === 'WhatsApp') return <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />;
  if (channel === 'E-mail') return <Mail className="w-3.5 h-3.5 text-blue-700" />;
  if (channel === 'Upload de laudo') return <Upload className="w-3.5 h-3.5 text-[#5B3FD0]" />;
  return <Monitor className="w-3.5 h-3.5 text-slate-600" />;
}

function UrgencyBadge({ urgencia }: { urgencia: UrgencyLevel }) {
  if (urgencia === 'Emergência') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-600 text-white text-[11px] font-bold whitespace-nowrap">
        <AlertTriangle className="w-3 h-3" />
        Emergência
      </span>
    );
  }
  if (urgencia === 'Urgente') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-semibold whitespace-nowrap">
        Urgente
      </span>
    );
  }
  if (urgencia === 'Normal') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-semibold whitespace-nowrap">
        Normal
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-50 text-slate-500 border border-slate-200 text-[11px] font-medium whitespace-nowrap">
      Baixa
    </span>
  );
}

export function ManutencaoTabChamados({
  tickets,
  perfil,
  readOnly,
  onOpenTicket,
  onOpenRuleById,
  onAskAgent,
}: ManutencaoTabChamadosProps) {
  const [activeChip, setActiveChip] = useState<FilterChipId>('abertos');
  const [viewMode, setViewMode] = useState<'lista' | 'kanban'>('lista');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('Todas');

  const isCorretor = perfil === 'Corretor';

  const scopedTickets = useMemo(() => {
    if (isCorretor) {
      return tickets.filter((t) => t.corretor === 'Rafael Costa');
    }
    return tickets;
  }, [tickets, isCorretor]);

  const filteredTickets = useMemo(() => {
    return scopedTickets.filter((t) => {
      if (activeChip === 'emergencia' && t.urgencia !== 'Emergência') return false;
      if (activeChip === 'urgentes' && t.urgencia !== 'Urgente') return false;
      if (activeChip === 'atrasados' && t.prazoSemaforo !== 'vermelho') return false;
      if (activeChip === 'orcamento' && t.etapa !== 'Orçamento') return false;
      if (activeChip === 'aprovacao' && t.etapa !== 'Aguardando aprovação') return false;
      if (activeChip === 'concluidos30d' && t.etapa !== 'Aguardando aceite') return false;
      if (categoryFilter !== 'Todas' && t.categoria !== categoryFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const match =
          t.protocol.toLowerCase().includes(q) ||
          t.imovel.toLowerCase().includes(q) ||
          t.problema.toLowerCase().includes(q) ||
          t.solicitanteNome.toLowerCase().includes(q) ||
          t.fornecedor.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [scopedTickets, activeChip, categoryFilter, search]);

  const filterCards: { id: FilterChipId; label: string; count: number; highlight?: 'red' | 'amber' }[] = [
    { id: 'abertos', label: 'Abertos', count: isCorretor ? scopedTickets.length : 34 },
    { id: 'emergencia', label: 'Emergência', count: 1, highlight: 'red' },
    { id: 'urgentes', label: 'Urgentes', count: 6, highlight: 'amber' },
    { id: 'atrasados', label: 'Atrasados', count: 5, highlight: 'red' },
    { id: 'orcamento', label: 'Aguardando orçamento', count: 9 },
    { id: 'aprovacao', label: 'Aguardando aprovação/aut.', count: 3, highlight: 'amber' },
    { id: 'concluidos30d', label: 'Concluídos em 30 dias', count: 43 },
  ];

  return (
    <div className="space-y-5">
      {/* 7 Filter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3">
        {filterCards.map((card) => {
          const isActive = activeChip === card.id;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => setActiveChip(card.id)}
              className={`text-left rounded-xl border p-3 transition-colors ${
                isActive
                  ? 'border-[#2563EB] bg-blue-50/50'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="text-[11.5px] font-medium text-slate-600 leading-snug">
                {card.label}
              </div>
              <div
                className={`text-[20px] font-bold tabular-nums mt-1 ${
                  card.highlight === 'red'
                    ? 'text-red-700'
                    : card.highlight === 'amber'
                    ? 'text-amber-700'
                    : 'text-slate-900'
                }`}
              >
                {card.count}
              </div>
            </button>
          );
        })}
      </div>

      {/* Toolbar: NEVER "Novo chamado", always "Pedir ao agente" */}
      <div className="rounded-xl border border-slate-200 bg-white p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[240px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar protocolo, imóvel, solicitante ou fornecedor..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-[12.5px] bg-[#F8F9FB] focus:bg-white focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <select
            aria-label="Filtrar por categoria"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-[12.5px] font-medium text-slate-700"
          >
            <option value="Todas">Todas as categorias</option>
            <option value="Hidráulica">Hidráulica</option>
            <option value="Elétrica">Elétrica</option>
            <option value="Pintura e acabamento">Pintura e acabamento</option>
            <option value="Esquadrias e fechaduras">Esquadrias e fechaduras</option>
            <option value="Ar-condicionado">Ar-condicionado</option>
            <option value="Infiltração e umidade">Infiltração e umidade</option>
            <option value="Outros">Outros</option>
          </select>

          <span className="text-[12px] font-medium text-slate-500">
            {activeChip === 'abertos' && !search && categoryFilter === 'Todas' && !isCorretor
              ? `Exibindo ${filteredTickets.length} de 34 chamados abertos`
              : `Exibindo ${filteredTickets.length} chamado(s)`}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-200 bg-[#F8F9FB] p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('lista')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[12px] font-semibold ${
                viewMode === 'lista' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Lista
            </button>
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[12px] font-semibold ${
                viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" />
              Kanban
            </button>
          </div>

          {!readOnly && (
            <button
              type="button"
              onClick={() =>
                onAskAgent({
                  title: 'Pedir ao agente: abrir chamado de manutenção',
                  prefillText:
                    'Registrar chamado a partir de relato recebido: classificar urgência pela MAN-001, sugerir responsável pela MAN-002 e acionar fornecedor homologado.',
                  categoria: 'Manutenção e vistoria',
                  subtipo: 'Chamado',
                  actionType: 'classificar_chamado',
                  evalParams: {
                    imovelIdentificado: true,
                    confiancaExtracao: 92,
                    imovelOcupado: true,
                    aceiteVisitaInquilino: true,
                  },
                })
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#5B3FD0] hover:bg-[#4C32B8] text-white text-[12.5px] font-semibold whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Pedir ao agente: abrir chamado
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {filteredTickets.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center space-y-2">
          <div className="text-[14px] font-bold text-slate-900">
            {activeChip === 'atrasados'
              ? 'Nenhum chamado atrasado neste filtro'
              : 'Nenhum chamado encontrado'}
          </div>
          <p className="text-[12.5px] text-slate-500">
            Ajuste os filtros ou peça ao agente para localizar solicitações na Central de Pedidos.
          </p>
        </div>
      ) : viewMode === 'lista' ? (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="px-3.5 py-3 font-semibold">Protocolo</th>
                  <th className="px-3.5 py-3 font-semibold">Imóvel</th>
                  <th className="px-3.5 py-3 font-semibold">Solicitante</th>
                  <th className="px-3.5 py-3 font-semibold">Problema</th>
                  <th className="px-3.5 py-3 font-semibold">Urgência</th>
                  <th className="px-3.5 py-3 font-semibold">Responsável</th>
                  <th className="px-3.5 py-3 font-semibold">Fornecedor / Valor</th>
                  <th className="px-3.5 py-3 font-semibold">Status &amp; Prazo</th>
                  <th className="px-3.5 py-3 font-semibold">Regra</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTickets.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => onOpenTicket(t)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="px-3.5 py-3 align-top">
                      <div className="flex items-center gap-1.5">
                        <ChannelIcon channel={t.channel} />
                        <span className="font-mono font-bold text-[#2563EB] whitespace-nowrap">
                          {t.protocol}
                        </span>
                      </div>
                      <div className="mt-1">
                        <AgentRegisteredTag label={t.registeredBy} />
                      </div>
                    </td>
                    <td className="px-3.5 py-3 align-top">
                      <div className="font-semibold text-slate-900">{t.imovel}</div>
                      {t.chamados90dImovel >= 3 && (
                        <span className="inline-block mt-0.5 text-[10.5px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                          {t.chamados90dImovel} chamados em 90d
                        </span>
                      )}
                    </td>
                    <td className="px-3.5 py-3 align-top">
                      <div className="font-medium text-slate-800">{t.solicitanteNome}</div>
                      <div className="text-[11px] text-slate-500">{t.solicitantePapel}</div>
                    </td>
                    <td className="px-3.5 py-3 align-top max-w-[220px]">
                      <div className="font-medium text-slate-900">{t.problema}</div>
                      <div className="text-[11px] text-slate-500">{t.categoria}</div>
                    </td>
                    <td className="px-3.5 py-3 align-top">
                      <UrgencyBadge urgencia={t.urgencia} />
                    </td>
                    <td className="px-3.5 py-3 align-top">
                      <div className="font-medium text-slate-800">{t.responsavelSugerido}</div>
                      <div className="text-[11px] text-[#5B3FD0] font-semibold">
                        {t.confiancaResponsavel}% conf.
                        {t.confiancaResponsavel < 80 ? ' · decisão humana' : ''}
                      </div>
                    </td>
                    <td className="px-3.5 py-3 align-top">
                      <div className="font-medium text-slate-800">{t.fornecedor}</div>
                      {t.valorOrcamento !== null && (
                        <div className="font-bold text-slate-900 tabular-nums">
                          {isCorretor ? 'Valor restrito' : formatBRL(t.valorOrcamento)}
                        </div>
                      )}
                    </td>
                    <td className="px-3.5 py-3 align-top space-y-1">
                      <div className="text-[11.5px] font-medium text-slate-700">{t.statusTexto}</div>
                      <SemaphoreBadge semaphore={t.prazoSemaforo} label={t.prazoTexto} />
                    </td>
                    <td className="px-3.5 py-3 align-top" onClick={(e) => e.stopPropagation()}>
                      {t.lacunaRegra ? (
                        <span className="inline-block px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold whitespace-nowrap">
                          Lacuna de regra
                        </span>
                      ) : (
                        <RuleAppliedChip
                          ruleId={t.regraId}
                          versao={t.regraVersao}
                          onOpenRule={onOpenRuleById}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* KANBAN VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3.5">
          {KANBAN_COLUMNS.map((col) => {
            const colItems = filteredTickets.filter((t) => t.etapa === col.stage);
            return (
              <div
                key={col.stage}
                className="rounded-xl border border-slate-200 bg-white flex flex-col overflow-hidden"
              >
                <div className="px-3 py-2.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                  <span className="text-[12px] font-bold text-slate-800">{col.stage}</span>
                  <span className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-[11px] font-bold text-slate-700 tabular-nums">
                    {activeChip === 'abertos' && !search && categoryFilter === 'Todas' && !isCorretor
                      ? col.totalCount
                      : colItems.length}
                  </span>
                </div>
                <div className="p-2.5 space-y-2.5 flex-1 bg-[#F8F9FB]">
                  {colItems.length === 0 ? (
                    <div className="text-[11.5px] text-slate-400 text-center py-6">
                      Nenhum item visível nesta amostra
                    </div>
                  ) : (
                    colItems.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => onOpenTicket(t)}
                        className="w-full text-left rounded-xl border border-slate-200 bg-white hover:border-[#2563EB] p-3 space-y-2 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono text-[11px] font-bold text-[#2563EB]">
                            {t.protocol}
                          </span>
                          <UrgencyBadge urgencia={t.urgencia} />
                        </div>
                        <div className="text-[12.5px] font-bold text-slate-900 leading-snug">
                          {t.imovel}
                        </div>
                        <div className="text-[11.5px] text-slate-600 line-clamp-2">
                          {t.problema}
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-1 pt-1">
                          <SemaphoreBadge semaphore={t.prazoSemaforo} label={t.prazoTexto} />
                          {!isCorretor && t.valorOrcamento !== null && (
                            <span className="text-[11.5px] font-bold text-slate-900 tabular-nums">
                              {formatBRL(t.valorOrcamento)}
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
