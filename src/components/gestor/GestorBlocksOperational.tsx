import { useMemo, useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Scale,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  Lock,
} from 'lucide-react';
import { formatBRL } from '../../data/financeiroData';
import type { NavItemId } from '../../data/navigation';
import type { PerfilRegra } from '../../data/rulesData';
import type { AskAgentRequestPayload } from '../financeiro/AskAgentOrderDrawer';
import {
  ADJUSTMENTS_LIST,
  ADJUSTMENTS_OVERDUE_COUNT,
  ADJUSTMENTS_UPCOMING_COUNT,
  GUARANTEE_COUNTERS,
  GUARANTEE_RECORDS_LIST,
  OVERDUE_OBLIGATIONS_SUMMARY,
  OVERDUE_PAYOUTS_COUNT,
  OVERDUE_PAYOUTS_LIST,
  OVERDUE_PAYOUTS_TOTAL_VALUE,
  OVERDUE_RENTS_LIST,
  OVERDUE_RENTS_TOTAL_COUNT,
  OVERDUE_RENTS_TOTAL_VALUE,
  PORTFOLIO_STATUS_CARDS,
  UPCOMING_PAYOUTS_5D,
  UPCOMING_PAYOUTS_COUNT,
  UPCOMING_PAYOUTS_TOTAL_VALUE,
  UPCOMING_RENTS_10D,
  UPCOMING_RENTS_COUNT,
  UPCOMING_RENTS_TOTAL_VALUE,
  type AdjustmentRecordItem,
  type GuaranteeRecordItem,
  type GuaranteeType,
  type OverdueObligationCategorySummary,
  type OverduePayoutItem,
  type OverdueRentItem,
  type PortfolioStatusCard,
  type UpcomingPayoutItem,
} from '../../data/gestorData';

interface GestorBlocksOperationalProps {
  showCarteiraContas: boolean;
  showAlugueisRepasses: boolean;
  showGarantiasReajustes: boolean;
  globalSearch: string;
  perfil: PerfilRegra;
  onSelectPortfolioCard: (card: PortfolioStatusCard) => void;
  onSelectObligationCategory: (summary: OverdueObligationCategorySummary) => void;
  onSelectOverdueRent: (rent: OverdueRentItem) => void;
  onOpenFullOverdueRents: () => void;
  onSelectPayout: (payout: OverduePayoutItem | UpcomingPayoutItem, isOverdue: boolean) => void;
  onSelectGuarantee: (guarantee: GuaranteeRecordItem) => void;
  onSelectAdjustment: (adjustment: AdjustmentRecordItem) => void;
  onNavigateModule: (nav: NavItemId) => void;
  onAskAgent: (payload: AskAgentRequestPayload) => void;
}

export function GestorBlocksOperational({
  showCarteiraContas,
  showAlugueisRepasses,
  showGarantiasReajustes,
  globalSearch,
  perfil,
  onSelectPortfolioCard,
  onSelectObligationCategory,
  onSelectOverdueRent,
  onOpenFullOverdueRents,
  onSelectPayout,
  onSelectGuarantee,
  onSelectAdjustment,
  onNavigateModule,
  onAskAgent,
}: GestorBlocksOperationalProps) {
  // Bloco 3 local search & filters
  const [rentSearch, setRentSearch] = useState('');
  const [rentAgingFilter, setRentAgingFilter] = useState<'todos' | '>90' | '31-90' | '1-30'>('todos');
  const [rentStatusFilter, setRentStatusFilter] = useState<string>('Todos');

  // Bloco 4 toggle show all 18 overdue payouts or top 8
  const [showAllOverduePayouts, setShowAllOverduePayouts] = useState(false);

  // Bloco 5 filters
  const [guaranteeTypeFilter, setGuaranteeTypeFilter] = useState<'Todos' | GuaranteeType>('Todos');
  const [guaranteeStatusFilter, setGuaranteeStatusFilter] = useState<'Todos' | 'Vencido' | 'Vence em 30 dias'>('Todos');

  // Bloco 6 expanded view toggles
  const [showAllUpcomingAdj, setShowAllUpcomingAdj] = useState(false);
  const [showAllOverdueAdj, setShowAllOverdueAdj] = useState(false);

  const effectiveSearch = (rentSearch || globalSearch).trim().toLowerCase();

  const filteredUpcomingRents = useMemo(() => {
    const q = globalSearch.trim().toLowerCase();
    if (!q) return UPCOMING_RENTS_10D;
    return UPCOMING_RENTS_10D.filter(
      (r) =>
        r.contrato.toLowerCase().includes(q) ||
        r.imovel.toLowerCase().includes(q) ||
        r.inquilino.toLowerCase().includes(q)
    );
  }, [globalSearch]);

  const filteredOverdueRents = useMemo(() => {
    return OVERDUE_RENTS_LIST.filter((r) => {
      if (rentStatusFilter !== 'Todos' && r.situacaoCobranca !== rentStatusFilter) return false;
      if (rentAgingFilter === '>90' && r.diasAtraso <= 90) return false;
      if (rentAgingFilter === '31-90' && (r.diasAtraso < 31 || r.diasAtraso > 90)) return false;
      if (rentAgingFilter === '1-30' && r.diasAtraso > 30) return false;
      if (!effectiveSearch) return true;
      return (
        r.contrato.toLowerCase().includes(effectiveSearch) ||
        r.imovel.toLowerCase().includes(effectiveSearch) ||
        r.inquilino.toLowerCase().includes(effectiveSearch)
      );
    }).sort((a, b) => b.diasAtraso - a.diasAtraso);
  }, [rentStatusFilter, rentAgingFilter, effectiveSearch]);

  const filteredGuarantees = useMemo(() => {
    const q = globalSearch.trim().toLowerCase();
    return GUARANTEE_RECORDS_LIST.filter((g) => {
      if (guaranteeTypeFilter !== 'Todos' && g.tipo !== guaranteeTypeFilter) return false;
      if (guaranteeStatusFilter !== 'Todos' && g.situacao !== guaranteeStatusFilter) return false;
      if (!q) return true;
      return (
        g.contrato.toLowerCase().includes(q) ||
        g.imovel.toLowerCase().includes(q) ||
        g.inquilino.toLowerCase().includes(q)
      );
    });
  }, [guaranteeTypeFilter, guaranteeStatusFilter, globalSearch]);

  const upcomingAdjustments = useMemo(() => {
    const q = globalSearch.trim().toLowerCase();
    return ADJUSTMENTS_LIST.filter(
      (a) =>
        a.situacao === 'Vence em 30 dias' &&
        (!q ||
          a.contrato.toLowerCase().includes(q) ||
          a.imovel.toLowerCase().includes(q) ||
          a.inquilino.toLowerCase().includes(q))
    );
  }, [globalSearch]);

  const overdueAdjustments = useMemo(() => {
    const q = globalSearch.trim().toLowerCase();
    return ADJUSTMENTS_LIST.filter(
      (a) =>
        a.situacao === 'Vencido' &&
        (!q ||
          a.contrato.toLowerCase().includes(q) ||
          a.imovel.toLowerCase().includes(q) ||
          a.inquilino.toLowerCase().includes(q))
    );
  }, [globalSearch]);

  const visibleOverduePayouts = showAllOverduePayouts
    ? OVERDUE_PAYOUTS_LIST
    : OVERDUE_PAYOUTS_LIST.slice(0, 6);

  const isFinancialRestrictedForCorretor = perfil === 'Corretor';

  return (
    <div className="space-y-6">
      {/* ===================================================================== */}
      {/* BLOCO 1 — RESUMO DA CARTEIRA DE CONTRATOS                             */}
      {/* ===================================================================== */}
      {showCarteiraContas && (
        <section aria-labelledby="bloco-1-carteira" className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 id="bloco-1-carteira" className="text-[15px] font-bold text-slate-900">
                1. Resumo da carteira de contratos
              </h2>
              <p className="text-[12px] text-slate-500">
                Visão por situação jurídica e vigência. Clique em qualquer cartão para abrir a relação filtrada.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateModule('contratos-juridico')}
              className="inline-flex items-center gap-1 text-[12px] font-medium text-[#2563EB] hover:underline whitespace-nowrap shrink-0"
            >
              <span>Ir para Contratos e Jurídico</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-3">
            {PORTFOLIO_STATUS_CARDS.map((card) => {
              const isCritical = card.tone === 'critico';
              const isAttention = card.tone === 'atencao';
              const isNormal = card.tone === 'normal';

              const cardStyle = isCritical
                ? 'border-red-200 bg-white hover:border-red-300 hover:bg-red-50/20'
                : isAttention
                ? 'border-amber-200 bg-white hover:border-amber-300 hover:bg-amber-50/20'
                : isNormal
                ? 'border-emerald-200 bg-white hover:border-emerald-300'
                : 'border-slate-200/90 bg-white hover:border-slate-300';

              const numColor = isCritical
                ? 'text-red-700'
                : isAttention
                ? 'text-amber-800'
                : isNormal
                ? 'text-emerald-800'
                : 'text-slate-800';

              return (
                <button
                  key={card.key}
                  type="button"
                  onClick={() => onSelectPortfolioCard(card)}
                  title={`${card.description} · Clique para listar contratos`}
                  className={`text-left rounded-xl border p-3.5 transition-colors flex flex-col justify-between min-h-[112px] ${cardStyle}`}
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <span className="text-[12px] font-semibold text-slate-800 leading-snug">
                      {card.label}
                    </span>
                    {isCritical ? (
                      <AlertOctagon className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
                    ) : isAttention ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
                    ) : isNormal ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
                    )}
                  </div>

                  <div className={`text-[26px] font-bold tracking-tight tabular-nums leading-none mt-3 ${numColor}`}>
                    {card.count.toLocaleString('pt-BR')}
                  </div>

                  <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between gap-1">
                    <span className="truncate">
                      {isCritical
                        ? 'Ação imediata'
                        : isAttention
                        ? 'Requer atenção'
                        : isNormal
                        ? 'Em operação'
                        : card.count === 0
                        ? 'Sem registros'
                        : 'Histórico'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ===================================================================== */}
      {/* BLOCO 2 — CONTROLE DE CONTAS VENCIDAS                                 */}
      {/* ===================================================================== */}
      {showCarteiraContas && (
        <section
          aria-labelledby="bloco-2-contas-vencidas"
          className="bg-white rounded-xl border border-slate-200/90 p-5 space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 id="bloco-2-contas-vencidas" className="text-[15px] font-bold text-slate-900">
                2. Controle de contas vencidas
              </h2>
              <p className="text-[12px] text-slate-500 mt-0.5">
                Quantidade de obrigações acessórias pendentes por categoria (um contrato pode acumular múltiplas obrigações). Total: <strong className="text-slate-800 tabular-nums">778 obrigações</strong> · <strong className="text-slate-800 tabular-nums">{formatBRL(254692.5)}</strong> estimados.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                onAskAgent({
                  title: 'Auditar e cobrar contas vencidas (IPTU e Seguros)',
                  prefillText:
                    'Agrupar as 537 obrigações de IPTU e 239 de Seguro incêndio por contrato ativo, identificar responsáveis e preparar notificações de regularização.',
                  categoria: 'Cobrança e financeiro',
                  subtipo: 'Cobrança',
                  actionType: 'regua_cobranca',
                  evalParams: { diasAtraso: 30, valor: 254692.5 },
                })
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F3F0FF] hover:bg-[#EDE9FE] text-[#5B3FD0] text-[12px] font-semibold transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pedir ao agente: cobrar pendentes</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {OVERDUE_OBLIGATIONS_SUMMARY.map((item) => {
              const hasPending = item.count > 0;
              return (
                <button
                  key={item.category}
                  type="button"
                  onClick={() => onSelectObligationCategory(item)}
                  className={`text-left rounded-xl border p-3.5 transition-colors flex flex-col justify-between ${
                    item.highVolume
                      ? 'border-red-200 bg-red-50/30 hover:bg-red-50/60'
                      : hasPending
                      ? 'border-amber-200 bg-amber-50/25 hover:bg-amber-50/50'
                      : 'border-slate-200/80 bg-[#F8F9FB]/60 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[12px] font-semibold text-slate-800 truncate">
                      {item.category}
                    </span>
                    {item.highVolume ? (
                      <AlertOctagon className="w-3.5 h-3.5 text-red-600 shrink-0" aria-hidden="true" />
                    ) : hasPending ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" aria-hidden="true" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
                    )}
                  </div>

                  <div
                    className={`text-[24px] font-bold tabular-nums leading-none mt-2.5 ${
                      item.highVolume
                        ? 'text-red-700'
                        : hasPending
                        ? 'text-amber-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {item.count.toLocaleString('pt-BR')}
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-200/70 text-[11px] tabular-nums text-slate-600 truncate">
                    {hasPending ? formatBRL(item.totalValue) : 'R$ 0,00'}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ===================================================================== */}
      {/* BLOCO 3 — AGENDA DE ALUGUÉIS E INADIMPLÊNCIA                          */}
      {/* ===================================================================== */}
      {showAlugueisRepasses && (
        <section aria-labelledby="bloco-3-alugueis" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 id="bloco-3-alugueis" className="text-[15px] font-bold text-slate-900">
                3. Agenda de aluguéis e inadimplência
              </h2>
              <p className="text-[12px] text-slate-500">
                Contagem por registro de mensalidade de aluguel (um contrato pode ter mais de uma parcela em atraso).
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateModule('financeiro')}
              className="inline-flex items-center gap-1 text-[12px] font-medium text-[#2563EB] hover:underline whitespace-nowrap shrink-0"
            >
              <span>Abrir Contas a receber e Inadimplência</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {isFinancialRestrictedForCorretor ? (
            <div className="bg-white rounded-xl border border-amber-200 p-5 flex items-start gap-3">
              <Lock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-[13px] text-slate-700">
                <strong className="text-slate-900">Acesso restrito no perfil Corretor:</strong> detalhamento financeiro de inadimplência e repasses fica disponível para os perfis Gestor e Financeiro.
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
              {/* 3.1 Aluguéis a vencer nos próximos 10 dias */}
              <div className="xl:col-span-5 bg-white rounded-xl border border-slate-200/90 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-[14px] font-bold text-slate-900">
                        Aluguéis a vencer (próximos 10 dias)
                      </h3>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-[#2563EB] border border-blue-200 text-[11px] font-bold tabular-nums">
                        {UPCOMING_RENTS_COUNT}
                      </span>
                    </div>
                    <p className="text-[12px] text-slate-500 mt-0.5 tabular-nums">
                      Total previsto: <strong className="text-slate-800">{formatBRL(UPCOMING_RENTS_TOTAL_VALUE)}</strong>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onAskAgent({
                        title: 'Antecipar lembretes de vencimento (10 dias)',
                        prefillText: `Enviar lembrete preventivo com link Pix/boleto para os ${UPCOMING_RENTS_COUNT} aluguéis a vencer nos próximos 10 dias (${formatBRL(UPCOMING_RENTS_TOTAL_VALUE)}).`,
                        categoria: 'Cobrança e financeiro',
                        subtipo: 'Cobrança',
                        actionType: 'regua_cobranca',
                        evalParams: { diasAtraso: 0, valor: UPCOMING_RENTS_TOTAL_VALUE },
                      })
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#F3F0FF] hover:bg-[#EDE9FE] text-[#5B3FD0] text-[11.5px] font-semibold whitespace-nowrap shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Lembrar todos</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F8F9FB] border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                        <th className="py-2.5 px-4">Contrato / Imóvel</th>
                        <th className="py-2.5 px-3">Inquilino</th>
                        <th className="py-2.5 px-3">Venc.</th>
                        <th className="py-2.5 px-4 text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[12.5px]">
                      {filteredUpcomingRents.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2.5 px-4">
                            <div className="font-mono text-[12px] font-semibold text-[#2563EB]">
                              {item.contrato}
                            </div>
                            <div className="text-[11.5px] text-slate-600 max-w-[190px] truncate">
                              {item.imovel}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-slate-800 max-w-[130px] truncate">
                            {item.inquilino}
                          </td>
                          <td className="py-2.5 px-3 tabular-nums whitespace-nowrap text-slate-700">
                            {item.vencimento}
                          </td>
                          <td className="py-2.5 px-4 text-right font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                            {formatBRL(item.valor)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="px-5 py-2.5 bg-[#F8F9FB] border-t border-slate-100 text-[11.5px] text-slate-500 flex items-center justify-between">
                  <span>Exibindo {filteredUpcomingRents.length} de {UPCOMING_RENTS_COUNT} próximos vencimentos</span>
                  <span>Lembretes automáticos ativos</span>
                </div>
              </div>

              {/* 3.2 Aluguéis atrasados (378 registros) */}
              <div className="xl:col-span-7 bg-white rounded-xl border border-slate-200/90 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-[14px] font-bold text-slate-900">
                        Aluguéis atrasados
                      </h3>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200 text-[11.5px] font-bold tabular-nums">
                        <AlertOctagon className="w-3 h-3" />
                        {OVERDUE_RENTS_TOTAL_COUNT} registros
                      </span>
                    </div>
                    <p className="text-[12px] text-slate-500 mt-0.5 tabular-nums">
                      Total em atraso: <strong className="text-red-700">{formatBRL(OVERDUE_RENTS_TOTAL_VALUE)}</strong> · Mais antigos no topo
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={onOpenFullOverdueRents}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[12px] font-semibold text-slate-700 whitespace-nowrap shrink-0"
                  >
                    <span>Ver relação completa ({OVERDUE_RENTS_TOTAL_COUNT})</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Search & filters */}
                <div className="px-5 py-3 border-b border-slate-100 bg-[#F8F9FB]/70 flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={rentSearch}
                      onChange={(e) => setRentSearch(e.target.value)}
                      placeholder="Pesquisar contrato, endereço ou inquilino..."
                      className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 bg-white text-[12.5px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>
                  <select
                    value={rentAgingFilter}
                    onChange={(e) =>
                      setRentAgingFilter(e.target.value as 'todos' | '>90' | '31-90' | '1-30')
                    }
                    aria-label="Filtrar atraso por período"
                    className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-[12px] text-slate-700"
                  >
                    <option value="todos">Qualquer antiguidade</option>
                    <option value=">90">Mais de 90 dias</option>
                    <option value="31-90">31 a 90 dias</option>
                    <option value="1-30">Até 30 dias</option>
                  </select>
                  <select
                    value={rentStatusFilter}
                    onChange={(e) => setRentStatusFilter(e.target.value)}
                    aria-label="Filtrar por situação de cobrança"
                    className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-[12px] text-slate-700"
                  >
                    <option value="Todos">Todas situações</option>
                    <option value="Processo jurídico">Processo jurídico</option>
                    <option value="Em negociação">Em negociação</option>
                    <option value="Notificado">Notificado</option>
                    <option value="Em atraso">Em atraso</option>
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F8F9FB] border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                        <th className="py-2.5 px-4">Contrato</th>
                        <th className="py-2.5 px-3">Imóvel</th>
                        <th className="py-2.5 px-3">Inquilino</th>
                        <th className="py-2.5 px-3">Vencimento</th>
                        <th className="py-2.5 px-4 text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[12.5px]">
                      {filteredOverdueRents.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-[12.5px] text-slate-500">
                            Nenhum registro encontrado com os filtros aplicados.
                          </td>
                        </tr>
                      ) : (
                        filteredOverdueRents.slice(0, 6).map((item) => (
                          <tr
                            key={item.id}
                            onClick={() => onSelectOverdueRent(item)}
                            className="hover:bg-slate-50 cursor-pointer transition-colors"
                          >
                            <td className="py-2.5 px-4 whitespace-nowrap">
                              <div className="font-mono text-[12px] font-bold text-[#2563EB]">
                                {item.contrato}
                              </div>
                              <div className="text-[11px] text-slate-500">{item.situacaoCobranca}</div>
                            </td>
                            <td className="py-2.5 px-3 text-slate-800 max-w-[190px] truncate">
                              {item.imovel}
                            </td>
                            <td className="py-2.5 px-3 text-slate-700 max-w-[140px] truncate">
                              {item.inquilino}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap tabular-nums">
                              <div className="text-slate-900">{item.vencimento}</div>
                              <span
                                className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                                  item.diasAtraso > 60
                                    ? 'text-red-700'
                                    : item.diasAtraso > 30
                                    ? 'text-amber-800'
                                    : 'text-slate-600'
                                }`}
                              >
                                {item.diasAtraso > 60 ? (
                                  <AlertOctagon className="w-3 h-3" />
                                ) : (
                                  <AlertTriangle className="w-3 h-3" />
                                )}
                                {item.diasAtraso}d em atraso
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-right font-bold text-slate-900 tabular-nums whitespace-nowrap">
                              {formatBRL(item.valor)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="px-5 py-2.5 bg-[#F8F9FB] border-t border-slate-100 text-[11.5px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
                  <span>
                    Clique em uma linha para abrir histórico financeiro e providências do contrato.
                  </span>
                  <button
                    type="button"
                    onClick={onOpenFullOverdueRents}
                    className="font-semibold text-[#2563EB] hover:underline"
                  >
                    Abrir lista completa ({OVERDUE_RENTS_TOTAL_COUNT})
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ===================================================================== */}
      {/* BLOCO 4 — REPASSES AOS PROPRIETÁRIOS                                  */}
      {/* ===================================================================== */}
      {showAlugueisRepasses && !isFinancialRestrictedForCorretor && (
        <section aria-labelledby="bloco-4-repasses" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 id="bloco-4-repasses" className="text-[15px] font-bold text-slate-900">
                4. Repasses aos proprietários
              </h2>
              <p className="text-[12px] text-slate-500">
                Controle próprio de obrigações com proprietários, separado do recebimento de aluguéis dos inquilinos.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateModule('financeiro')}
              className="inline-flex items-center gap-1 text-[12px] font-medium text-[#2563EB] hover:underline whitespace-nowrap shrink-0"
            >
              <span>Abrir Repasses no Financeiro</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
            {/* 4.1 Repasses a vencer nos próximos 5 dias */}
            <div className="xl:col-span-5 bg-white rounded-xl border border-slate-200/90 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[14px] font-bold text-slate-900">
                      Repasses a vencer (próximos 5 dias)
                    </h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold tabular-nums">
                      {UPCOMING_PAYOUTS_COUNT}
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-500 mt-0.5 tabular-nums">
                    Total previsto: <strong className="text-slate-800">{formatBRL(UPCOMING_PAYOUTS_TOTAL_VALUE)}</strong>
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8F9FB] border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                      <th className="py-2.5 px-4">Contrato / Imóvel</th>
                      <th className="py-2.5 px-3">Proprietário</th>
                      <th className="py-2.5 px-3">Previsto</th>
                      <th className="py-2.5 px-4 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[12.5px]">
                    {UPCOMING_PAYOUTS_5D.map((p) => (
                      <tr
                        key={p.id}
                        onClick={() => onSelectPayout(p, false)}
                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <td className="py-2.5 px-4">
                          <div className="font-mono text-[12px] font-semibold text-[#2563EB]">
                            {p.contrato}
                          </div>
                          <div className="text-[11.5px] text-slate-600 max-w-[180px] truncate">
                            {p.imovel}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-800 max-w-[130px] truncate">
                          {p.proprietario}
                        </td>
                        <td className="py-2.5 px-3 tabular-nums whitespace-nowrap text-slate-700">
                          {p.dataPrevista}
                        </td>
                        <td className="py-2.5 px-4 text-right font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                          {formatBRL(p.valor)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4.2 Repasses atrasados (18 registros) */}
            <div className="xl:col-span-7 bg-white rounded-xl border border-slate-200/90 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[14px] font-bold text-slate-900">
                      Repasses atrasados
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200 text-[11.5px] font-bold tabular-nums">
                      <AlertOctagon className="w-3 h-3" />
                      {OVERDUE_PAYOUTS_COUNT} repasses
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-500 mt-0.5 tabular-nums">
                    Total pendente: <strong className="text-red-700">{formatBRL(OVERDUE_PAYOUTS_TOTAL_VALUE)}</strong> · Ordenados do mais antigo ao mais recente
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onAskAgent({
                      title: 'Auditar e destravar 18 repasses atrasados',
                      prefillText: `Conciliar os ${OVERDUE_PAYOUTS_COUNT} repasses atrasados (${formatBRL(OVERDUE_PAYOUTS_TOTAL_VALUE)}), separar os já recebidos do inquilino e preparar lote de liberação conforme FIN-003.`,
                      categoria: 'Cobrança e financeiro',
                      subtipo: 'Repasse',
                      actionType: 'repasse',
                      evalParams: { valor: OVERDUE_PAYOUTS_TOTAL_VALUE, conciliado: false },
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F3F0FF] hover:bg-[#EDE9FE] text-[#5B3FD0] text-[12px] font-semibold whitespace-nowrap shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Pedir ao agente: destravar lote</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8F9FB] border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                      <th className="py-2.5 px-4">Contrato</th>
                      <th className="py-2.5 px-3">Endereço do imóvel</th>
                      <th className="py-2.5 px-3">Proprietário</th>
                      <th className="py-2.5 px-3">Data prevista</th>
                      <th className="py-2.5 px-4 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[12.5px]">
                    {visibleOverduePayouts.map((p) => (
                      <tr
                        key={p.id}
                        onClick={() => onSelectPayout(p, true)}
                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <td className="py-2.5 px-4 whitespace-nowrap">
                          <div className="font-mono text-[12px] font-bold text-[#2563EB]">
                            {p.contrato}
                          </div>
                          <div className="text-[11px] text-slate-500">{p.situacaoRepasse}</div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-800 max-w-[190px] truncate">
                          {p.imovel}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 max-w-[140px] truncate">
                          {p.proprietario}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap tabular-nums">
                          <div className="text-slate-900">{p.dataPrevista}</div>
                          <span
                            className={`text-[11px] font-semibold ${
                              p.diasAtraso >= 10 ? 'text-red-700' : 'text-amber-800'
                            }`}
                          >
                            {p.diasAtraso}d de atraso
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right font-bold text-slate-900 tabular-nums whitespace-nowrap">
                          {formatBRL(p.valor)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-5 py-2.5 bg-[#F8F9FB] border-t border-slate-100 flex items-center justify-between text-[12px]">
                <span className="text-slate-500">
                  Exibindo {visibleOverduePayouts.length} de {OVERDUE_PAYOUTS_COUNT} repasses atrasados
                </span>
                <button
                  type="button"
                  onClick={() => setShowAllOverduePayouts((prev) => !prev)}
                  className="font-semibold text-[#2563EB] hover:underline"
                >
                  {showAllOverduePayouts
                    ? 'Recolher lista'
                    : `Ver todos os ${OVERDUE_PAYOUTS_COUNT} repasses`}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===================================================================== */}
      {/* BLOCO 5 — SEGUROS E GARANTIAS LOCATÍCIAS                              */}
      {/* ===================================================================== */}
      {showGarantiasReajustes && (
        <section
          aria-labelledby="bloco-5-garantias"
          className="bg-white rounded-xl border border-slate-200/90 p-5 space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="bloco-5-garantias" className="text-[15px] font-bold text-slate-900">
                5. Seguros e garantias locatícias
              </h2>
              <p className="text-[12px] text-slate-500 mt-0.5">
                Monitoramento de vencimentos nos próximos 30 dias e apólices vencidas por modalidade de garantia.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateModule('contratos-juridico')}
              className="inline-flex items-center gap-1 text-[12px] font-medium text-[#2563EB] hover:underline whitespace-nowrap shrink-0"
            >
              <span>Gerir em Contratos e Jurídico</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {GUARANTEE_COUNTERS.map((g) => (
              <div
                key={g.type}
                className="rounded-xl border border-slate-200 bg-[#F8F9FB]/60 p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
                    <span className="text-[13.5px] font-bold text-slate-900">{g.type}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGuaranteeTypeFilter(g.type)}
                    className="text-[11.5px] font-medium text-[#2563EB] hover:underline"
                  >
                    Filtrar
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-amber-200 bg-white px-3 py-2.5">
                    <div className="text-[11px] font-medium text-slate-500">A vencer (30 dias)</div>
                    <div className="text-[22px] font-bold text-amber-800 tabular-nums mt-0.5">
                      {g.expiring30d}
                    </div>
                  </div>
                  <div
                    className={`rounded-lg border px-3 py-2.5 bg-white ${
                      g.expired > 0 ? 'border-red-200' : 'border-slate-200'
                    }`}
                  >
                    <div className="text-[11px] font-medium text-slate-500">Vencidos</div>
                    <div
                      className={`text-[22px] font-bold tabular-nums mt-0.5 ${
                        g.expired > 0 ? 'text-red-700' : 'text-slate-400'
                      }`}
                    >
                      {g.expired}
                    </div>
                  </div>
                </div>

                <p className="text-[11.5px] text-slate-500">{g.note}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex flex-wrap items-center gap-1.5">
              {(['Todos', 'Seguro fiança', 'Seguro incêndio', 'Carta fiança'] as const).map(
                (tipo) => (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => setGuaranteeTypeFilter(tipo)}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                      guaranteeTypeFilter === tipo
                        ? 'bg-[#2563EB] text-white'
                        : 'bg-[#F8F9FB] text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {tipo}
                  </button>
                )
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {(['Todos', 'Vencido', 'Vence em 30 dias'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setGuaranteeStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                    guaranteeStatusFilter === st
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8F9FB] border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                  <th className="py-2.5 px-4">Contrato</th>
                  <th className="py-2.5 px-3">Imóvel / Inquilino</th>
                  <th className="py-2.5 px-3">Garantia</th>
                  <th className="py-2.5 px-3">Seguradora / Instituição</th>
                  <th className="py-2.5 px-3">Vigência</th>
                  <th className="py-2.5 px-3">Situação</th>
                  <th className="py-2.5 px-4 text-right">Documento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[12.5px]">
                {filteredGuarantees.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => onSelectGuarantee(item)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-4 font-mono font-bold text-[#2563EB] whitespace-nowrap">
                      {item.contrato}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-900 max-w-[220px] truncate">
                        {item.imovel}
                      </div>
                      <div className="text-[11.5px] text-slate-500">{item.inquilino}</div>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800 whitespace-nowrap">
                      {item.tipo}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">
                      {item.instituicao}
                    </td>
                    <td className="py-2.5 px-3 tabular-nums whitespace-nowrap text-slate-600 text-[12px]">
                      {item.dataInicio} – <strong className="text-slate-900">{item.dataVencimento}</strong>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold ${
                          item.situacao === 'Vencido'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {item.situacao === 'Vencido' ? (
                          <ShieldAlert className="w-3 h-3" />
                        ) : (
                          <AlertTriangle className="w-3 h-3" />
                        )}
                        {item.situacao}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[#2563EB]">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Apólice</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ===================================================================== */}
      {/* BLOCO 6 — REAJUSTES CONTRATUAIS                                       */}
      {/* ===================================================================== */}
      {showGarantiasReajustes && (
        <section aria-labelledby="bloco-6-reajustes" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 id="bloco-6-reajustes" className="text-[15px] font-bold text-slate-900">
                6. Controle de reajustes contratuais
              </h2>
              <p className="text-[12px] text-slate-500">
                Acompanhamento preventivo e corretivo para assegurar a aplicação pontual dos índices previstos em contrato.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateModule('contratos-juridico')}
              className="inline-flex items-center gap-1 text-[12px] font-medium text-[#2563EB] hover:underline whitespace-nowrap shrink-0"
            >
              <span>Abrir Renovações e reajustes</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
            {/* 6.1 Reajustes a vencer nos próximos 30 dias (36) */}
            <div className="xl:col-span-6 bg-white rounded-xl border border-slate-200/90 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[14px] font-bold text-slate-900">
                      Reajustes a vencer (próximos 30 dias)
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[11.5px] font-bold tabular-nums">
                      <TrendingUp className="w-3 h-3" />
                      {ADJUSTMENTS_UPCOMING_COUNT}
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-500 mt-0.5">
                    Ordenados cronologicamente por data do próximo aniversário
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8F9FB] border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                      <th className="py-2.5 px-4">Contrato</th>
                      <th className="py-2.5 px-3">Endereço do imóvel</th>
                      <th className="py-2.5 px-3">Índice / %</th>
                      <th className="py-2.5 px-4 text-right">Próximo reajuste</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[12.5px]">
                    {(showAllUpcomingAdj
                      ? upcomingAdjustments
                      : upcomingAdjustments.slice(0, 6)
                    ).map((adj) => (
                      <tr
                        key={adj.id}
                        onClick={() => onSelectAdjustment(adj)}
                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <td className="py-2.5 px-4 font-mono font-bold text-[#2563EB] whitespace-nowrap">
                          {adj.contrato}
                        </td>
                        <td className="py-2.5 px-3 text-slate-800 max-w-[210px] truncate">
                          {adj.imovel}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap tabular-nums text-slate-700">
                          {adj.indice} (+{adj.percentualAplicado.toFixed(2).replace('.', ',')}%)
                        </td>
                        <td className="py-2.5 px-4 text-right font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                          {adj.dataReajuste}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-5 py-2.5 bg-[#F8F9FB] border-t border-slate-100 flex items-center justify-between text-[12px]">
                <span className="text-slate-500">
                  Exibindo {showAllUpcomingAdj ? upcomingAdjustments.length : Math.min(6, upcomingAdjustments.length)} de {ADJUSTMENTS_UPCOMING_COUNT} reajustes próximos
                </span>
                <button
                  type="button"
                  onClick={() => setShowAllUpcomingAdj((prev) => !prev)}
                  className="font-semibold text-[#2563EB] hover:underline"
                >
                  {showAllUpcomingAdj ? 'Recolher' : `Ver todos (${ADJUSTMENTS_UPCOMING_COUNT})`}
                </button>
              </div>
            </div>

            {/* 6.2 Reajustes vencidos (15) */}
            <div className="xl:col-span-6 bg-white rounded-xl border border-slate-200/90 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[14px] font-bold text-slate-900">
                      Reajustes vencidos
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200 text-[11.5px] font-bold tabular-nums">
                      <AlertOctagon className="w-3 h-3" />
                      {ADJUSTMENTS_OVERDUE_COUNT}
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-500 mt-0.5">
                    Contratos com data de reajuste ultrapassada sem aplicação confirmada
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onAskAgent({
                      title: 'Aplicar 15 reajustes contratuais vencidos',
                      prefillText: `Calcular valores atualizados com índice contratual dos ${ADJUSTMENTS_OVERDUE_COUNT} reajustes vencidos e preparar notificações aos locatários.`,
                      categoria: 'Locação e contratos',
                      subtipo: 'Reajuste anual',
                      actionType: 'reajuste_anual',
                      evalParams: { diasParaVencimento: -10 },
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F3F0FF] hover:bg-[#EDE9FE] text-[#5B3FD0] text-[12px] font-semibold whitespace-nowrap shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Pedir ao agente</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8F9FB] border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                      <th className="py-2.5 px-4">Contrato</th>
                      <th className="py-2.5 px-3">Endereço do imóvel</th>
                      <th className="py-2.5 px-3">Status aplicação</th>
                      <th className="py-2.5 px-4 text-right">Vencimento reajuste</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[12.5px]">
                    {(showAllOverdueAdj
                      ? overdueAdjustments
                      : overdueAdjustments.slice(0, 6)
                    ).map((adj) => (
                      <tr
                        key={adj.id}
                        onClick={() => onSelectAdjustment(adj)}
                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <td className="py-2.5 px-4 whitespace-nowrap">
                          <div className="font-mono font-bold text-[#2563EB]">{adj.contrato}</div>
                          <div className="text-[11px] text-slate-500">
                            {adj.indice} (+{adj.percentualAplicado.toFixed(2).replace('.', ',')}%)
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-800 max-w-[190px] truncate">
                          {adj.imovel}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">
                          {adj.statusAplicacao}
                        </td>
                        <td className="py-2.5 px-4 text-right tabular-nums whitespace-nowrap">
                          <span className="font-semibold text-red-700">{adj.dataReajuste}</span>
                          <div className="text-[11px] text-red-600">
                            {Math.abs(adj.diasDiferenca)}d vencido
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-5 py-2.5 bg-[#F8F9FB] border-t border-slate-100 flex items-center justify-between text-[12px]">
                <span className="text-slate-500">
                  Exibindo {showAllOverdueAdj ? overdueAdjustments.length : Math.min(6, overdueAdjustments.length)} de {ADJUSTMENTS_OVERDUE_COUNT} vencidos
                </span>
                <button
                  type="button"
                  onClick={() => setShowAllOverdueAdj((prev) => !prev)}
                  className="font-semibold text-[#2563EB] hover:underline"
                >
                  {showAllOverdueAdj ? 'Recolher' : `Ver todos (${ADJUSTMENTS_OVERDUE_COUNT})`}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
