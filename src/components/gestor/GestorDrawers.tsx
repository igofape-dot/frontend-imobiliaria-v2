import { useEffect, useMemo, useState } from 'react';
import {
  X,
  Search,
  Sparkles,
  ExternalLink,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  FileText,
  MailWarning,
  Receipt,
  ShieldCheck,
  TrendingUp,
  Info,
  ArrowUpRight,
  Lock,
} from 'lucide-react';
import { formatBRL } from '../../data/financeiroData';
import type { NavItemId } from '../../data/navigation';
import type { PerfilRegra } from '../../data/rulesData';
import type { AskAgentRequestPayload } from '../financeiro/AskAgentOrderDrawer';
import {
  INDICATOR_DICTIONARY,
  OVERDUE_RENTS_TOTAL_COUNT,
  OVERDUE_RENTS_TOTAL_VALUE,
  type AdhocOverdueCharge,
  type AdjustmentRecordItem,
  type EmailAutomationDay,
  type FiscalNoteDay,
  type GeneratedBillingItem,
  type GestorContractSummary,
  type GuaranteeRecordItem,
  type OverdueObligationCategorySummary,
  type OverdueObligationItem,
  type OverduePayoutItem,
  type OverdueRentItem,
  type PortfolioStatusCard,
  type UpcomingPayoutItem,
} from '../../data/gestorData';

function DrawerShell({
  title,
  subtitle,
  onClose,
  maxWidth = 'max-w-2xl',
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  maxWidth?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div
        className={`relative z-10 w-full ${maxWidth} bg-white h-full border-l border-slate-200 flex flex-col overflow-hidden`}
      >
        <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-4 shrink-0">
          <div className="min-w-0">
            <h2 className="text-[16px] font-bold text-slate-900 truncate">{title}</h2>
            {subtitle && (
              <p className="text-[12.5px] text-slate-500 mt-0.5 leading-snug">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 shrink-0"
            aria-label="Fechar painel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">{children}</div>

        {footer && (
          <div className="px-6 py-4 border-t border-slate-200 bg-white flex flex-wrap items-center justify-end gap-2.5 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 1. Contract Filter Drawer (Bloco 1)
// ---------------------------------------------------------------------------

export function ContractFilterDrawer({
  statusCard,
  contracts,
  perfil,
  onClose,
  onNavigateModule,
  onAskAgent,
}: {
  statusCard: PortfolioStatusCard | null;
  contracts: GestorContractSummary[];
  perfil: PerfilRegra;
  onClose: () => void;
  onNavigateModule: (nav: NavItemId) => void;
  onAskAgent: (payload: AskAgentRequestPayload) => void;
}) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!statusCard) return [];
    const base = contracts.filter((c) => c.statusKey === statusCard.key);
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter(
      (c) =>
        c.contrato.toLowerCase().includes(q) ||
        c.imovel.toLowerCase().includes(q) ||
        c.inquilino.toLowerCase().includes(q) ||
        c.proprietario.toLowerCase().includes(q)
    );
  }, [statusCard, contracts, query]);

  if (!statusCard) return null;

  const isJudicialBlockedForCorretor =
    perfil === 'Corretor' && statusCard.key === 'processo_juridico';

  return (
    <DrawerShell
      title={`Carteira · ${statusCard.label} (${statusCard.count.toLocaleString('pt-BR')})`}
      subtitle={statusCard.description}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigateModule('contratos-juridico');
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 text-[12.5px] font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
          >
            <span>Abrir módulo Contratos e Jurídico</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onAskAgent({
                title: `Agir sobre contratos: ${statusCard.label}`,
                prefillText: `Listar prioridades e preparar providências para os ${statusCard.count} contratos na situação "${statusCard.label}".`,
                categoria: 'Locação e contratos',
                subtipo: 'Renovação',
                actionType: 'preparar_renovacao',
                evalParams: { diasParaVencimento: statusCard.key === 'vencendo_60d' ? 45 : 120 },
              });
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#5B3FD0] hover:bg-[#4C32B8] text-white text-[12.5px] font-semibold whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Pedir ao agente</span>
          </button>
        </>
      }
    >
      {isJudicialBlockedForCorretor ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
          <Lock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-[13px] text-amber-950">
            <div className="font-semibold">Acesso restrito pelo perfil Corretor</div>
            <p className="mt-1 text-amber-900">
              Processos jurídicos ficam visíveis apenas para os perfis Gestor e Jurídico (barreira de privacidade e sigilo processual).
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por contrato, endereço, inquilino ou proprietário..."
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 bg-[#F8F9FB] text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#2563EB]"
            />
          </div>

          {statusCard.count > filtered.length && filtered.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-[#F8F9FB] px-3.5 py-2.5 text-[12px] text-slate-600 flex items-center justify-between gap-2">
              <span>
                Exibindo amostra operacional de <strong className="tabular-nums text-slate-900">{filtered.length}</strong> de{' '}
                <strong className="tabular-nums text-slate-900">{statusCard.count.toLocaleString('pt-BR')}</strong> contratos nesta situação.
              </span>
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-[#F8F9FB] p-8 text-center text-[13px] text-slate-500">
              {statusCard.count === 0
                ? `Nenhum contrato enquadrado em "${statusCard.label}" na data de referência 22/11/2026.`
                : 'Nenhum contrato encontrado para o termo pesquisado.'}
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {filtered.map((item) => (
                <div key={item.id} className="p-4 bg-white hover:bg-slate-50/70 transition-colors space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-[12.5px] font-bold text-[#2563EB]">
                        {item.contrato}
                      </span>
                      <span className="text-[13px] font-semibold text-slate-900 truncate">
                        {item.imovel}
                      </span>
                    </div>
                    <span className="text-[13px] font-bold text-slate-900 tabular-nums">
                      {formatBRL(item.valorAluguel)}/mês
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-slate-600">
                    <span>Inquilino: {item.inquilino}</span>
                    <span aria-hidden="true">·</span>
                    <span>Proprietário: {item.proprietario}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">
                      Vigência: {item.inicioVigencia} – {item.fimVigencia}
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-500">{item.observacao}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </DrawerShell>
  );
}

// ---------------------------------------------------------------------------
// 2. Overdue Obligations Drawer (Bloco 2)
// ---------------------------------------------------------------------------

export function OverdueObligationsDrawer({
  summary,
  items,
  onClose,
  onNavigateModule,
  onAskAgent,
}: {
  summary: OverdueObligationCategorySummary | null;
  items: OverdueObligationItem[];
  onClose: () => void;
  onNavigateModule: (nav: NavItemId) => void;
  onAskAgent: (payload: AskAgentRequestPayload) => void;
}) {
  const [query, setQuery] = useState('');
  if (!summary) return null;

  const matching = items.filter(
    (it) =>
      it.category === summary.category &&
      (!query.trim() ||
        it.contrato.toLowerCase().includes(query.trim().toLowerCase()) ||
        it.imovel.toLowerCase().includes(query.trim().toLowerCase()) ||
        it.nomeResponsavel.toLowerCase().includes(query.trim().toLowerCase()))
  );

  return (
    <DrawerShell
      title={`Contas vencidas · ${summary.category}`}
      subtitle={`${summary.count.toLocaleString('pt-BR')} obrigações pendentes · Total estimado ${formatBRL(summary.totalValue)}`}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigateModule('financeiro');
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 text-[12.5px] font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
          >
            <span>Abrir Financeiro</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          {summary.count > 0 && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onAskAgent({
                  title: `Cobrar obrigações vencidas de ${summary.category}`,
                  prefillText: `Consolidar as ${summary.count} obrigações vencidas de ${summary.category} (${formatBRL(summary.totalValue)}) agrupadas por contrato e enviar cobrança conforme a régua.`,
                  categoria: 'Cobrança e financeiro',
                  subtipo: 'Cobrança',
                  actionType: 'regua_cobranca',
                  evalParams: { diasAtraso: 30, valor: summary.totalValue },
                });
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#5B3FD0] hover:bg-[#4C32B8] text-white text-[12.5px] font-semibold whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>Pedir ao agente</span>
            </button>
          )}
        </>
      }
    >
      <div className="rounded-xl border border-slate-200 bg-[#F8F9FB] p-3.5 text-[12.5px] text-slate-700 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-900">Quantidade de obrigações ≠ contratos únicos: </span>
          {summary.note}. Um mesmo contrato pode possuir mais de uma parcela vencida nesta categoria.
        </div>
      </div>

      {summary.count === 0 ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-6 text-center space-y-1">
          <CheckCircle2 className="w-6 h-6 text-emerald-700 mx-auto" />
          <p className="text-[13.5px] font-semibold text-slate-900">
            Nenhuma obrigação vencida em {summary.category}
          </p>
          <p className="text-[12.5px] text-slate-600">{summary.note}</p>
        </div>
      ) : (
        <>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filtrar por contrato, imóvel ou responsável..."
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 bg-[#F8F9FB] text-[13px] text-slate-900 focus:outline-none focus:bg-white focus:border-[#2563EB]"
            />
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {matching.map((ob) => (
              <div key={ob.id} className="p-4 bg-white space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-[12.5px] font-bold text-[#2563EB]">
                      {ob.contrato}
                    </span>
                    <span className="text-[13px] font-semibold text-slate-900 truncate">
                      {ob.imovel}
                    </span>
                  </div>
                  <span className="text-[13px] font-bold text-red-700 tabular-nums">
                    {formatBRL(ob.valor)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[12px] text-slate-600">
                  <span>{ob.competencia}</span>
                  <span>·</span>
                  <span className="tabular-nums">Venc. {ob.vencimento} ({ob.diasAtraso}d atraso)</span>
                  <span>·</span>
                  <span>{ob.responsavel}: {ob.nomeResponsavel}</span>
                  <span>·</span>
                  <span className="font-medium text-slate-800">{ob.situacao}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </DrawerShell>
  );
}

// ---------------------------------------------------------------------------
// 3. Rent Detail & Full 378 Overdue Drawer (Bloco 3)
// ---------------------------------------------------------------------------

export function RentDetailDrawer({
  rent,
  onClose,
  onNavigateModule,
  onAskAgent,
}: {
  rent: OverdueRentItem | null;
  onClose: () => void;
  onNavigateModule: (nav: NavItemId) => void;
  onAskAgent: (payload: AskAgentRequestPayload) => void;
}) {
  if (!rent) return null;

  return (
    <DrawerShell
      title={`${rent.contrato} · Aluguel em atraso (${rent.diasAtraso} dias)`}
      subtitle={`${rent.imovel} · Inquilino: ${rent.inquilino}`}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigateModule('financeiro');
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 text-[12.5px] font-medium text-slate-700 hover:bg-slate-50"
          >
            <span>Ver no Financeiro</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onAskAgent({
                title: `Cobrança do contrato ${rent.contrato}`,
                prefillText: `Atualizar cálculo com multa e juros do aluguel ${rent.competencia} do contrato ${rent.contrato} (${rent.inquilino}, venc. ${rent.vencimento}, ${formatBRL(rent.valor)}) e executar próximo passo da régua.`,
                categoria: 'Cobrança e financeiro',
                subtipo: 'Cobrança',
                actionType: 'regua_cobranca',
                evalParams: {
                  diasAtraso: rent.diasAtraso,
                  valor: rent.valor,
                  acaoJudicial: rent.situacaoCobranca === 'Processo jurídico',
                },
                links: [{ type: 'Contrato', code: rent.contrato, label: rent.imovel }],
              });
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#5B3FD0] hover:bg-[#4C32B8] text-white text-[12.5px] font-semibold"
          >
            <Sparkles className="w-4 h-4" />
            <span>Pedir ao agente</span>
          </button>
        </>
      }
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200 bg-[#F8F9FB] p-3">
          <div className="text-[11px] text-slate-500">Valor original</div>
          <div className="text-[15px] font-bold text-slate-900 tabular-nums mt-0.5">
            {formatBRL(rent.valor)}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-[#F8F9FB] p-3">
          <div className="text-[11px] text-slate-500">Vencimento</div>
          <div className="text-[15px] font-bold text-slate-900 tabular-nums mt-0.5">
            {rent.vencimento}
          </div>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50/50 p-3">
          <div className="text-[11px] text-red-700">Antiguidade</div>
          <div className="text-[15px] font-bold text-red-700 tabular-nums mt-0.5">
            {rent.diasAtraso} dias
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-[#F8F9FB] p-3">
          <div className="text-[11px] text-slate-500">Situação</div>
          <div className="text-[13px] font-semibold text-slate-900 mt-1">
            {rent.situacaoCobranca}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
        <h3 className="text-[13px] font-semibold text-slate-900">Última providência</h3>
        <p className="text-[13px] text-slate-700">{rent.ultimaProvidencia}</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 bg-[#F8F9FB] text-[12.5px] font-semibold text-slate-800">
          Histórico financeiro e providências
        </div>
        <div className="divide-y divide-slate-100">
          {rent.historico.map((h, idx) => (
            <div key={idx} className="px-4 py-3 flex items-start justify-between gap-3 text-[12.5px]">
              <div>
                <div className="font-medium text-slate-900">{h.evento}</div>
                <div className="text-[11.5px] text-slate-500 mt-0.5">Por {h.responsavel}</div>
              </div>
              <span className="text-[11.5px] text-slate-500 tabular-nums shrink-0">{h.data}</span>
            </div>
          ))}
        </div>
      </div>
    </DrawerShell>
  );
}

export function FullOverdueRentsDrawer({
  isOpen,
  rents,
  onClose,
  onSelectRent,
}: {
  isOpen: boolean;
  rents: OverdueRentItem[];
  onClose: () => void;
  onSelectRent: (rent: OverdueRentItem) => void;
}) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [agingFilter, setAgingFilter] = useState<string>('Todos');

  const filtered = useMemo(() => {
    return rents
      .filter((r) => {
        if (statusFilter !== 'Todos' && r.situacaoCobranca !== statusFilter) return false;
        if (agingFilter === '>90' && r.diasAtraso <= 90) return false;
        if (agingFilter === '31-90' && (r.diasAtraso < 31 || r.diasAtraso > 90)) return false;
        if (agingFilter === '1-30' && r.diasAtraso > 30) return false;
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return (
          r.contrato.toLowerCase().includes(q) ||
          r.imovel.toLowerCase().includes(q) ||
          r.inquilino.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.diasAtraso - a.diasAtraso);
  }, [rents, query, statusFilter, agingFilter]);

  if (!isOpen) return null;

  return (
    <DrawerShell
      title={`Relação completa de aluguéis atrasados (${OVERDUE_RENTS_TOTAL_COUNT} registros)`}
      subtitle={`Valor consolidado em aberto: ${formatBRL(OVERDUE_RENTS_TOTAL_VALUE)} · Ordenados dos vencimentos mais antigos para os mais recentes`}
      maxWidth="max-w-4xl"
      onClose={onClose}
    >
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar contrato, endereço ou inquilino..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 bg-[#F8F9FB] text-[13px] text-slate-900 focus:outline-none focus:bg-white focus:border-[#2563EB]"
          />
        </div>
        <select
          value={agingFilter}
          onChange={(e) => setAgingFilter(e.target.value)}
          aria-label="Filtrar por antiguidade"
          className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-[12.5px] text-slate-700"
        >
          <option value="Todos">Todos os períodos</option>
          <option value=">90">Acima de 90 dias</option>
          <option value="31-90">De 31 a 90 dias</option>
          <option value="1-30">Até 30 dias</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filtrar por situação de cobrança"
          className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-[12.5px] text-slate-700"
        >
          <option value="Todos">Todas as situações</option>
          <option value="Processo jurídico">Processo jurídico</option>
          <option value="Em negociação">Em negociação</option>
          <option value="Notificado">Notificado</option>
          <option value="Em atraso">Em atraso</option>
        </select>
      </div>

      <div className="rounded-lg border border-slate-200 bg-[#F8F9FB] px-3.5 py-2 text-[12px] text-slate-600">
        Registros contam parcelas em aberto (um mesmo contrato com múltiplas competências atrasadas aparece por parcela). Exibindo os{' '}
        <strong className="text-slate-900 tabular-nums">{filtered.length}</strong> registros prioritários ordenados por antiguidade.
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8F9FB] border-b border-slate-200 text-[11.5px] font-semibold text-slate-500">
              <th className="py-2.5 px-3.5">Contrato</th>
              <th className="py-2.5 px-3.5">Imóvel</th>
              <th className="py-2.5 px-3.5">Inquilino</th>
              <th className="py-2.5 px-3.5">Vencimento</th>
              <th className="py-2.5 px-3.5">Situação</th>
              <th className="py-2.5 px-3.5 text-right">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[12.5px]">
            {filtered.map((r) => (
              <tr
                key={r.id}
                onClick={() => onSelectRent(r)}
                className="hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <td className="py-2.5 px-3.5 font-mono font-semibold text-[#2563EB] whitespace-nowrap">
                  {r.contrato}
                </td>
                <td className="py-2.5 px-3.5 text-slate-800 max-w-[210px] truncate">{r.imovel}</td>
                <td className="py-2.5 px-3.5 text-slate-700 whitespace-nowrap">{r.inquilino}</td>
                <td className="py-2.5 px-3.5 whitespace-nowrap tabular-nums">
                  <span className="text-slate-900">{r.vencimento}</span>
                  <span
                    className={`ml-1.5 text-[11px] font-semibold ${
                      r.diasAtraso > 60 ? 'text-red-700' : 'text-amber-700'
                    }`}
                  >
                    ({r.diasAtraso}d)
                  </span>
                </td>
                <td className="py-2.5 px-3.5 whitespace-nowrap text-slate-700">
                  {r.situacaoCobranca}
                </td>
                <td className="py-2.5 px-3.5 text-right font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                  {formatBRL(r.valor)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DrawerShell>
  );
}

// ---------------------------------------------------------------------------
// 4. Owner Payout Detail Drawer (Bloco 4)
// ---------------------------------------------------------------------------

export function PayoutDetailDrawer({
  payout,
  isOverdue,
  onClose,
  onNavigateModule,
  onAskAgent,
}: {
  payout: OverduePayoutItem | UpcomingPayoutItem | null;
  isOverdue: boolean;
  onClose: () => void;
  onNavigateModule: (nav: NavItemId) => void;
  onAskAgent: (payload: AskAgentRequestPayload) => void;
}) {
  if (!payout) return null;

  const overdue = isOverdue ? (payout as OverduePayoutItem) : null;
  const upcoming = !isOverdue ? (payout as UpcomingPayoutItem) : null;

  return (
    <DrawerShell
      title={`${payout.contrato} · Repasse ao proprietário`}
      subtitle={`${payout.proprietario} · ${payout.imovel}`}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigateModule('financeiro');
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 text-[12.5px] font-medium text-slate-700 hover:bg-slate-50"
          >
            <span>Abrir Repasses no Financeiro</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onAskAgent({
                title: `Executar repasse ${payout.contrato}`,
                prefillText: overdue
                  ? `Verificar pendência ("${overdue.situacaoRepasse}") e preparar liberação do repasse atrasado de ${formatBRL(overdue.valor)} para ${overdue.proprietario} (${overdue.contrato}).`
                  : `Confirmar programação do repasse de ${formatBRL(payout.valor)} para ${payout.proprietario} (${payout.contrato}) previsto em ${payout.dataPrevista}.`,
                categoria: 'Cobrança e financeiro',
                subtipo: 'Repasse',
                actionType: 'repasse',
                evalParams: {
                  valor: payout.valor,
                  conciliado: overdue ? overdue.statusAluguelInquilino === 'Recebido pelo inquilino' : true,
                },
                links: [{ type: 'Contrato', code: payout.contrato, label: payout.proprietario }],
              });
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#5B3FD0] hover:bg-[#4C32B8] text-white text-[12.5px] font-semibold"
          >
            <Sparkles className="w-4 h-4" />
            <span>Pedir ao agente</span>
          </button>
        </>
      }
    >
      <div className="rounded-xl border border-slate-200 bg-[#F8F9FB] p-3.5 text-[12px] text-slate-700">
        <strong className="text-slate-900">Separação financeira:</strong> recebimento do aluguel (evento do inquilino) e repasse ao proprietário (obrigação da imobiliária) possuem status e conciliações independentes.
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <div className="text-[11px] text-slate-500">Valor líquido do repasse</div>
          <div className="text-[16px] font-bold text-slate-900 tabular-nums mt-0.5">
            {formatBRL(payout.valor)}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <div className="text-[11px] text-slate-500">Data prevista</div>
          <div className="text-[15px] font-bold text-slate-900 tabular-nums mt-0.5">
            {payout.dataPrevista}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <div className="text-[11px] text-slate-500">Situação do repasse</div>
          <div className={`text-[13px] font-semibold mt-1 ${overdue ? 'text-red-700' : 'text-emerald-800'}`}>
            {overdue ? `${overdue.situacaoRepasse} (${overdue.diasAtraso}d)` : 'Programado'}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 text-[13px]">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Status do recebimento do inquilino</span>
          <span className="font-semibold text-slate-900">
            {overdue ? overdue.statusAluguelInquilino : upcoming?.aluguelRecebido}
          </span>
        </div>
        {upcoming && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-slate-500">Conta bancária de destino</span>
            <span className="font-mono text-[12px] text-slate-800">{upcoming.contaDestino}</span>
          </div>
        )}
      </div>

      {overdue && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 bg-[#F8F9FB] text-[12.5px] font-semibold text-slate-800">
            Histórico recente de repasses a {overdue.proprietario}
          </div>
          <div className="divide-y divide-slate-100">
            {overdue.historicoProprietario.map((h, idx) => (
              <div key={idx} className="px-4 py-2.5 flex items-center justify-between text-[12.5px]">
                <div>
                  <span className="font-medium text-slate-900">{h.competencia}</span>
                  <span className="text-slate-400 mx-1.5">·</span>
                  <span className="text-slate-500 tabular-nums">{h.data}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-900 tabular-nums">{formatBRL(h.valor)}</span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                      h.status === 'Pago'
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {h.status === 'Pago' ? <CheckCircle2 className="w-3 h-3" /> : <AlertOctagon className="w-3 h-3" />}
                    {h.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DrawerShell>
  );
}

// ---------------------------------------------------------------------------
// 5. Guarantee Detail Drawer (Bloco 5)
// ---------------------------------------------------------------------------

export function GuaranteeDetailDrawer({
  guarantee,
  onClose,
  onNavigateModule,
  onAskAgent,
}: {
  guarantee: GuaranteeRecordItem | null;
  onClose: () => void;
  onNavigateModule: (nav: NavItemId) => void;
  onAskAgent: (payload: AskAgentRequestPayload) => void;
}) {
  if (!guarantee) return null;

  return (
    <DrawerShell
      title={`${guarantee.tipo} · ${guarantee.contrato}`}
      subtitle={`${guarantee.imovel} · Inquilino: ${guarantee.inquilino}`}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigateModule('contratos-juridico');
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 text-[12.5px] font-medium text-slate-700 hover:bg-slate-50"
          >
            <span>Ver Garantias</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onAskAgent({
                title: `Renovar ${guarantee.tipo} · ${guarantee.contrato}`,
                prefillText: `Solicitar renovação de ${guarantee.tipo} (${guarantee.instituicao}, vencimento ${guarantee.dataVencimento}) para o contrato ${guarantee.contrato} (${guarantee.inquilino}).`,
                categoria: 'Locação e contratos',
                subtipo: 'Garantia locatícia',
                actionType: 'alerta_garantia',
                evalParams: { diasParaVencimentoGarantia: guarantee.diasRestantes },
                links: [{ type: 'Contrato', code: guarantee.contrato, label: guarantee.tipo }],
              });
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#5B3FD0] hover:bg-[#4C32B8] text-white text-[12.5px] font-semibold"
          >
            <Sparkles className="w-4 h-4" />
            <span>Pedir ao agente</span>
          </button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-200 bg-[#F8F9FB] p-3.5">
          <div className="text-[11px] text-slate-500">Seguradora / Instituição</div>
          <div className="text-[14px] font-semibold text-slate-900 mt-0.5">{guarantee.instituicao}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-[#F8F9FB] p-3.5">
          <div className="text-[11px] text-slate-500">Cobertura contratada</div>
          <div className="text-[14px] font-bold text-slate-900 tabular-nums mt-0.5">
            {formatBRL(guarantee.valorCobertura)}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-[#F8F9FB] p-3.5">
          <div className="text-[11px] text-slate-500">Vigência da apólice</div>
          <div className="text-[13.5px] font-semibold text-slate-900 tabular-nums mt-0.5">
            {guarantee.dataInicio} até {guarantee.dataVencimento}
          </div>
        </div>
        <div
          className={`rounded-xl border p-3.5 ${
            guarantee.situacao === 'Vencido'
              ? 'border-red-200 bg-red-50/50'
              : 'border-amber-200 bg-amber-50/50'
          }`}
        >
          <div className="text-[11px] text-slate-600">Situação</div>
          <div
            className={`text-[13.5px] font-bold mt-0.5 ${
              guarantee.situacao === 'Vencido' ? 'text-red-700' : 'text-amber-800'
            }`}
          >
            {guarantee.situacao === 'Vencido'
              ? `Vencido há ${Math.abs(guarantee.diasRestantes)} dias`
              : `Vence em ${guarantee.diasRestantes} dias`}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-9 h-9 rounded-lg bg-[#EFF4FF] text-[#2563EB] flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-slate-900 truncate">
              {guarantee.documentoCodigo}
            </div>
            <div className="text-[11.5px] text-slate-500">
              Documento vinculado à garantia · Extraído pelo agente
            </div>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-emerald-700 shrink-0">
          <ShieldCheck className="w-3.5 h-3.5" />
          Autenticado
        </span>
      </div>
    </DrawerShell>
  );
}

// ---------------------------------------------------------------------------
// 6. Adjustment Detail Drawer (Bloco 6)
// ---------------------------------------------------------------------------

export function AdjustmentDetailDrawer({
  adjustment,
  onClose,
  onNavigateModule,
  onAskAgent,
}: {
  adjustment: AdjustmentRecordItem | null;
  onClose: () => void;
  onNavigateModule: (nav: NavItemId) => void;
  onAskAgent: (payload: AskAgentRequestPayload) => void;
}) {
  if (!adjustment) return null;

  return (
    <DrawerShell
      title={`Reajuste contratual · ${adjustment.contrato}`}
      subtitle={`${adjustment.imovel} · Inquilino: ${adjustment.inquilino}`}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigateModule('contratos-juridico');
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 text-[12.5px] font-medium text-slate-700 hover:bg-slate-50"
          >
            <span>Abrir Renovações e Reajustes</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onAskAgent({
                title: `Aplicar reajuste ${adjustment.indice} · ${adjustment.contrato}`,
                prefillText: `Calcular e preparar aditivo de reajuste anual (${adjustment.indice} +${adjustment.percentualAplicado.toFixed(2).replace('.', ',')}%) para o contrato ${adjustment.contrato}, passando de ${formatBRL(adjustment.aluguelAtual)} para ${formatBRL(adjustment.aluguelProjetado)}.`,
                categoria: 'Locação e contratos',
                subtipo: 'Reajuste anual',
                actionType: 'reajuste_anual',
                evalParams: {
                  valor: adjustment.aluguelProjetado,
                  diasParaVencimento: adjustment.diasDiferenca,
                },
                links: [{ type: 'Contrato', code: adjustment.contrato, label: adjustment.indice }],
              });
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#5B3FD0] hover:bg-[#4C32B8] text-white text-[12.5px] font-semibold"
          >
            <Sparkles className="w-4 h-4" />
            <span>Pedir ao agente</span>
          </button>
        </>
      }
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200 bg-[#F8F9FB] p-3">
          <div className="text-[11px] text-slate-500">Índice / %</div>
          <div className="text-[14px] font-bold text-slate-900 tabular-nums mt-0.5">
            {adjustment.indice} · +{adjustment.percentualAplicado.toFixed(2).replace('.', ',')}%
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-[#F8F9FB] p-3">
          <div className="text-[11px] text-slate-500">Aluguel atual</div>
          <div className="text-[14px] font-semibold text-slate-900 tabular-nums mt-0.5">
            {formatBRL(adjustment.aluguelAtual)}
          </div>
        </div>
        <div className="rounded-xl border border-blue-200 bg-[#EFF4FF]/60 p-3">
          <div className="text-[11px] text-[#2563EB]">Novo valor projetado</div>
          <div className="text-[14px] font-bold text-[#2563EB] tabular-nums mt-0.5">
            {formatBRL(adjustment.aluguelProjetado)}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-[#F8F9FB] p-3">
          <div className="text-[11px] text-slate-500">Status aplicação</div>
          <div className="text-[12.5px] font-semibold text-slate-900 mt-1">
            {adjustment.statusAplicacao}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 bg-[#F8F9FB] text-[12.5px] font-semibold text-slate-800 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#2563EB]" />
          <span>Histórico de reajustes aplicados</span>
        </div>
        <div className="divide-y divide-slate-100">
          {adjustment.historicoReajustes.map((h, i) => (
            <div key={i} className="px-4 py-3 flex items-center justify-between text-[12.5px]">
              <div>
                <span className="font-semibold text-slate-900">Ano {h.ano}</span>
                <span className="text-slate-400 mx-1.5">·</span>
                <span className="text-slate-600">{h.indice} ({h.percentual})</span>
              </div>
              <div className="tabular-nums text-slate-800">
                {formatBRL(h.valorAnterior)} → <strong>{formatBRL(h.valorNovo)}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DrawerShell>
  );
}

// ---------------------------------------------------------------------------
// 7. Billing Entry Drawer (Bloco 8)
// ---------------------------------------------------------------------------

export function BillingDetailDrawer({
  entry,
  onClose,
  onAskAgent,
}: {
  entry: GeneratedBillingItem | null;
  onClose: () => void;
  onAskAgent: (payload: AskAgentRequestPayload) => void;
}) {
  if (!entry) return null;

  return (
    <DrawerShell
      title={`Mensalidade gerada · ${entry.contrato}`}
      subtitle={`${entry.imovel} · Inquilino: ${entry.inquilino}`}
      onClose={onClose}
      footer={
        <button
          type="button"
          onClick={() => {
            onClose();
            onAskAgent({
              title: `Reenviar fatura · ${entry.contrato}`,
              prefillText: `Reenviar 2ª via da mensalidade gerada em ${entry.geradaEm} (venc. ${entry.vencimento}, ${formatBRL(entry.valor)}) para ${entry.inquilino}.`,
              categoria: 'Cobrança e financeiro',
              subtipo: 'Segunda via de boleto',
              actionType: 'regua_cobranca',
              evalParams: { valor: entry.valor, diasAtraso: 0 },
              links: [{ type: 'Contrato', code: entry.contrato, label: entry.inquilino }],
            });
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#5B3FD0] hover:bg-[#4C32B8] text-white text-[12.5px] font-semibold"
        >
          <Sparkles className="w-4 h-4" />
          <span>Pedir ao agente: enviar 2ª via</span>
        </button>
      }
    >
      <div className="rounded-xl border border-slate-200 bg-[#F8F9FB] p-4 flex flex-wrap items-center justify-between gap-2 text-[12.5px]">
        <div>
          <span className="text-slate-500">Gerada em: </span>
          <strong className="text-slate-900 tabular-nums">{entry.geradaEm}</strong>
          <span className="mx-2 text-slate-400">·</span>
          <span className="text-slate-500">Vencimento: </span>
          <strong className="text-slate-900 tabular-nums">{entry.vencimento}</strong>
        </div>
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold ${
            entry.status === 'Gerada · recebida'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}
        >
          {entry.status === 'Gerada · recebida' ? (
            <CheckCircle2 className="w-3 h-3" />
          ) : (
            <AlertTriangle className="w-3 h-3" />
          )}
          {entry.status}
        </span>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 bg-[#F8F9FB] text-[12.5px] font-semibold text-slate-800">
          Composição do lançamento gerado
        </div>
        <div className="divide-y divide-slate-100">
          {entry.composicao.map((c, idx) => (
            <div key={idx} className="px-4 py-2.5 flex items-center justify-between text-[13px]">
              <span className="text-slate-700">{c.item}</span>
              <span className="font-semibold text-slate-900 tabular-nums">{formatBRL(c.valor)}</span>
            </div>
          ))}
          <div className="px-4 py-3 bg-[#F8F9FB] flex items-center justify-between text-[13.5px] font-bold text-slate-900">
            <span>Total gerado</span>
            <span className="tabular-nums">{formatBRL(entry.valor)}</span>
          </div>
        </div>
      </div>
    </DrawerShell>
  );
}

// ---------------------------------------------------------------------------
// 8. Email Automation Investigation Drawer (Bloco 9)
// ---------------------------------------------------------------------------

export function EmailDayDrawer({
  day,
  onClose,
  onAskAgent,
}: {
  day: EmailAutomationDay | null;
  onClose: () => void;
  onAskAgent: (payload: AskAgentRequestPayload) => void;
}) {
  if (!day) return null;

  return (
    <DrawerShell
      title={`Comunicação automatizada · ${day.dia}`}
      subtitle={`${day.enviados} enviados · ${day.naoEnviados} não enviados · Taxa de entrega ${day.taxaEntregaPct.toFixed(1).replace('.', ',')}%`}
      onClose={onClose}
      footer={
        day.naoEnviados > 0 ? (
          <button
            type="button"
            onClick={() => {
              onClose();
              onAskAgent({
                title: `Tratar falhas de e-mail (${day.dia})`,
                prefillText: `Investigar os ${day.naoEnviados} e-mails não enviados de ${day.dia}, solicitar atualização cadastral aos contatos com bounce e reenviar notificações.`,
                categoria: 'Comunicação',
                subtipo: 'Cobrança',
                actionType: 'regua_cobranca',
                evalParams: { diasAtraso: 5, valor: 0 },
              });
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#5B3FD0] hover:bg-[#4C32B8] text-white text-[12.5px] font-semibold"
          >
            <Sparkles className="w-4 h-4" />
            <span>Pedir ao agente: reprocessar falhas</span>
          </button>
        ) : undefined
      }
    >
      {day.falhas.length === 0 ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-6 text-center space-y-1.5">
          <CheckCircle2 className="w-6 h-6 text-emerald-700 mx-auto" />
          <div className="text-[14px] font-semibold text-slate-900">
            100% dos e-mails entregues neste dia
          </div>
          <p className="text-[12.5px] text-slate-600">
            Todos os {day.enviados} disparos automáticos foram aceitos pelos servidores de destino.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {day.falhas.map((f) => (
            <div key={f.id} className="rounded-xl border border-red-200 bg-white p-4 space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <MailWarning className="w-4 h-4 text-red-700 shrink-0" />
                  <span className="font-mono text-[12px] font-bold text-[#2563EB]">{f.contrato}</span>
                  <span className="text-[13px] font-semibold text-slate-900">{f.destinatario}</span>
                </div>
                <span className="text-[11.5px] text-slate-500 tabular-nums">{f.horario}</span>
              </div>
              <div className="text-[12.5px] text-slate-700">Assunto: {f.assunto}</div>
              <div className="text-[12px] text-red-700 bg-red-50 rounded-lg px-2.5 py-1.5 font-medium">
                Erro SMTP: {f.motivoFalha}
              </div>
            </div>
          ))}
        </div>
      )}
    </DrawerShell>
  );
}

// ---------------------------------------------------------------------------
// 9. Fiscal Notes Error Investigation Drawer (Bloco 10)
// ---------------------------------------------------------------------------

export function FiscalDayDrawer({
  day,
  onClose,
  onAskAgent,
}: {
  day: FiscalNoteDay | null;
  onClose: () => void;
  onAskAgent: (payload: AskAgentRequestPayload) => void;
}) {
  if (!day) return null;

  return (
    <DrawerShell
      title={`Notas fiscais · ${day.dia}`}
      subtitle={`Geradas: ${day.geradas} · Emitidas: ${day.emitidas} · Pendentes: ${day.pendentes} · Erros: ${day.erros}`}
      onClose={onClose}
      footer={
        day.erros > 0 || day.pendentes > 0 ? (
          <button
            type="button"
            onClick={() => {
              onClose();
              onAskAgent({
                title: `Regularizar notas fiscais (${day.dia})`,
                prefillText: `Corrigir dados cadastrais das ${day.erros} notas com erro e retransmitir os ${day.pendentes} RPS pendentes de ${day.dia} junto à prefeitura.`,
                categoria: 'Cobrança e financeiro',
                subtipo: 'Repasse',
                actionType: 'conciliacao',
                evalParams: { conciliado: false, diferenca: 0 },
              });
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#5B3FD0] hover:bg-[#4C32B8] text-white text-[12.5px] font-semibold"
          >
            <Sparkles className="w-4 h-4" />
            <span>Pedir ao agente: corrigir e retransmitir</span>
          </button>
        ) : undefined
      }
    >
      <div className="rounded-xl border border-slate-200 bg-[#F8F9FB] p-3.5 text-[12px] text-slate-700">
        <strong>Distinção fiscal:</strong> <em>Gerada</em> indica o RPS preparado pelo sistema; <em>Emitida</em> confirma a autorização efetiva da NFSe pela prefeitura.
      </div>

      {day.registros.length === 0 ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-6 text-center space-y-1">
          <CheckCircle2 className="w-6 h-6 text-emerald-700 mx-auto" />
          <div className="text-[13.5px] font-semibold text-slate-900">
            Todas as {day.emitidas} notas emitidas sem erros ou pendências
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {day.registros.map((r) => (
            <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-4 space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-slate-500" />
                  <span className="font-mono text-[12px] font-bold text-slate-900">
                    {r.nfseNumero ?? r.rps}
                  </span>
                  <span className="text-[12.5px] font-semibold text-slate-900">{r.tomador}</span>
                  <span className="font-mono text-[11.5px] text-[#2563EB]">{r.contrato}</span>
                </div>
                <span className="text-[13px] font-bold text-slate-900 tabular-nums">
                  {formatBRL(r.valor)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold ${
                    r.estado === 'Emitida'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : r.estado === 'Pendente'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}
                >
                  {r.estado === 'Emitida' && <CheckCircle2 className="w-3 h-3" />}
                  {r.estado === 'Pendente' && <AlertTriangle className="w-3 h-3" />}
                  {r.estado === 'Erro' && <AlertOctagon className="w-3 h-3" />}
                  {r.estado}
                </span>
              </div>
              {r.detalheErro && (
                <div className="text-[12px] text-red-700 bg-red-50 rounded-lg px-2.5 py-1.5 font-medium">
                  {r.detalheErro}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DrawerShell>
  );
}

// ---------------------------------------------------------------------------
// 10. Ad-hoc Overdue Charge Drawer (Bloco 11)
// ---------------------------------------------------------------------------

export function AdhocChargeDetailDrawer({
  charge,
  onClose,
  onNavigateModule,
  onAskAgent,
}: {
  charge: AdhocOverdueCharge | null;
  onClose: () => void;
  onNavigateModule: (nav: NavItemId) => void;
  onAskAgent: (payload: AskAgentRequestPayload) => void;
}) {
  if (!charge) return null;

  return (
    <DrawerShell
      title={`Cobrança avulsa atrasada · ${charge.contrato}`}
      subtitle={`${charge.imovel} · ${charge.responsavelCobranca}`}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigateModule('financeiro');
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 text-[12.5px] font-medium text-slate-700 hover:bg-slate-50"
          >
            <span>Abrir no Financeiro</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onAskAgent({
                title: `Regularizar cobrança avulsa · ${charge.contrato}`,
                prefillText: `Tratar cobrança avulsa atrasada de ${formatBRL(charge.valor)} (${charge.origem}) do contrato ${charge.contrato} — ${charge.responsavelCobranca}.`,
                categoria: 'Cobrança e financeiro',
                subtipo: 'Cobrança',
                actionType: 'regua_cobranca',
                evalParams: { diasAtraso: charge.diasAtraso, valor: charge.valor },
                links: [{ type: 'Contrato', code: charge.contrato, label: charge.origem }],
              });
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#5B3FD0] hover:bg-[#4C32B8] text-white text-[12.5px] font-semibold"
          >
            <Sparkles className="w-4 h-4" />
            <span>Pedir ao agente: baixar / reemitir</span>
          </button>
        </>
      }
    >
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 bg-[#F8F9FB] p-3">
          <div className="text-[11px] text-slate-500">Valor em aberto</div>
          <div className="text-[15px] font-bold text-red-700 tabular-nums mt-0.5">
            {formatBRL(charge.valor)}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-[#F8F9FB] p-3">
          <div className="text-[11px] text-slate-500">Vencimento</div>
          <div className="text-[14px] font-semibold text-slate-900 tabular-nums mt-0.5">
            {charge.vencimento} ({charge.diasAtraso}d)
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-[#F8F9FB] p-3">
          <div className="text-[11px] text-slate-500">Situação</div>
          <div className="text-[13px] font-semibold text-slate-900 mt-1">{charge.situacao}</div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-1">
        <div className="text-[11.5px] font-semibold uppercase tracking-wider text-slate-500">
          Origem da cobrança avulsa
        </div>
        <div className="text-[13.5px] font-medium text-slate-900">{charge.origem}</div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 bg-[#F8F9FB] text-[12.5px] font-semibold text-slate-800">
          Histórico da cobrança
        </div>
        <div className="divide-y divide-slate-100">
          {charge.historico.map((h, i) => (
            <div key={i} className="px-4 py-2.5 flex items-center justify-between text-[12.5px]">
              <span className="text-slate-800">{h.evento}</span>
              <span className="text-slate-500 tabular-nums shrink-0">{h.data}</span>
            </div>
          ))}
        </div>
      </div>
    </DrawerShell>
  );
}

// ---------------------------------------------------------------------------
// 11. Indicator Governance Dictionary Drawer (Seções 15 & 16)
// ---------------------------------------------------------------------------

export function IndicatorDictionaryDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  if (!isOpen) return null;

  const filtered = INDICATOR_DICTIONARY.filter(
    (d) =>
      !search.trim() ||
      d.nome.toLowerCase().includes(search.toLowerCase()) ||
      d.bloco.toLowerCase().includes(search.toLowerCase()) ||
      d.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DrawerShell
      title="Governança e Dicionário dos Indicadores"
      subtitle="Definição funcional, regra de cálculo, fonte de dados e critérios de inclusão/exclusão (Seções 15 e 16)"
      maxWidth="max-w-3xl"
      onClose={onClose}
    >
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar indicador por código, bloco ou definição..."
          className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 bg-[#F8F9FB] text-[13px] text-slate-900 focus:outline-none focus:bg-white focus:border-[#2563EB]"
        />
      </div>

      <div className="space-y-3">
        {filtered.map((ind) => (
          <div key={ind.id} className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11.5px] font-bold text-[#2563EB]">{ind.id}</span>
                <span className="text-[12px] font-medium text-slate-500">{ind.bloco}</span>
              </div>
              <span className="text-[11.5px] text-slate-500 tabular-nums">
                Ref. {ind.dataReferencia} · {ind.ultimaAtualizacao}
              </span>
            </div>
            <h4 className="text-[14px] font-bold text-slate-900">{ind.nome}</h4>
            <p className="text-[12.5px] text-slate-700">{ind.definicaoFuncional}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[12px]">
              <div className="rounded-lg bg-[#F8F9FB] border border-slate-200/80 px-3 py-2">
                <span className="font-semibold text-slate-700">Regra de cálculo: </span>
                <span className="text-slate-600">{ind.regraCalculo}</span>
              </div>
              <div className="rounded-lg bg-[#F8F9FB] border border-slate-200/80 px-3 py-2">
                <span className="font-semibold text-slate-700">Fonte: </span>
                <span className="text-slate-600">{ind.fonteDados}</span>
              </div>
            </div>
            <div className="text-[12px] text-slate-600">
              <strong className="text-slate-800">Inclusão/exclusão: </strong>
              {ind.criterioInclusaoExclusao}
            </div>
          </div>
        ))}
      </div>
    </DrawerShell>
  );
}

export function QuickNavModuleChip({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-[12px] font-medium text-[#2563EB] hover:text-blue-700 hover:underline whitespace-nowrap shrink-0"
    >
      <span>{label}</span>
      <ArrowUpRight className="w-3.5 h-3.5" />
    </button>
  );
}
