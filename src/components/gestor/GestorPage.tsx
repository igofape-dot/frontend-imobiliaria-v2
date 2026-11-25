import { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  BookOpen,
  Search,
  Sparkles,
  UserCheck,
  X,
} from 'lucide-react';
import type { AgentOrder, OrderCategory, OrderLinkChip } from '../../data/agentOrdersData';
import type { PolicyEvaluationResult } from '../../data/financeiroData';
import type { NavItemId } from '../../data/navigation';
import type { PerfilRegra, Regra } from '../../data/rulesData';
import {
  AskAgentOrderDrawer,
  type AskAgentRequestPayload,
} from '../financeiro/AskAgentOrderDrawer';
import {
  ADJUSTMENTS_OVERDUE_COUNT,
  GESTOR_CONTRACTS_SAMPLE,
  OVERDUE_OBLIGATIONS_SAMPLE,
  OVERDUE_PAYOUTS_COUNT,
  OVERDUE_RENTS_LIST,
  OVERDUE_RENTS_TOTAL_COUNT,
  PORTFOLIO_STATUS_CARDS,
  type AdhocOverdueCharge,
  type AdjustmentRecordItem,
  type EmailAutomationDay,
  type FiscalNoteDay,
  type GeneratedBillingItem,
  type GestorSectionFilter,
  type GuaranteeRecordItem,
  type OverdueObligationCategorySummary,
  type OverduePayoutItem,
  type OverdueRentItem,
  type PortfolioStatusCard,
  type UpcomingPayoutItem,
} from '../../data/gestorData';
import {
  AdhocChargeDetailDrawer,
  AdjustmentDetailDrawer,
  BillingDetailDrawer,
  ContractFilterDrawer,
  EmailDayDrawer,
  FiscalDayDrawer,
  FullOverdueRentsDrawer,
  GuaranteeDetailDrawer,
  IndicatorDictionaryDrawer,
  OverdueObligationsDrawer,
  PayoutDetailDrawer,
  RentDetailDrawer,
} from './GestorDrawers';
import { GestorBlocksOperational } from './GestorBlocksOperational';
import { GestorBlocksAnalytics } from './GestorBlocksAnalytics';

interface GestorPageProps {
  rules: Regra[];
  perfil: PerfilRegra;
  isLoading: boolean;
  onChangePerfil: (perfil: PerfilRegra) => void;
  onCreateAgentOrder: (payload: {
    promptText: string;
    categoria?: OrderCategory;
    subtipo: string;
    evaluation: PolicyEvaluationResult;
    links?: OrderLinkChip[];
  }) => AgentOrder;
  onOpenOrderInCenter: (orderId: string) => void;
  onOpenRuleById: (ruleId: string) => void;
  onNavigateModule: (navId: NavItemId) => void;
}

const SECTION_FILTERS: { id: GestorSectionFilter; label: string }[] = [
  { id: 'todos', label: 'Todos os blocos (1–11)' },
  { id: 'carteira-contas', label: '1–2 Carteira e contas' },
  { id: 'alugueis-repasses', label: '3–4 Aluguéis e repasses' },
  { id: 'garantias-reajustes', label: '5–6 Garantias e reajustes' },
  { id: 'financeiro-automacao', label: '7–11 Financeiro e automação' },
];

const PROFILES: PerfilRegra[] = ['Gestor', 'Financeiro', 'Jurídico', 'Corretor'];

export function GestorPage({
  rules,
  perfil,
  isLoading,
  onChangePerfil,
  onCreateAgentOrder,
  onOpenOrderInCenter,
  onOpenRuleById,
  onNavigateModule,
}: GestorPageProps) {
  const [sectionFilter, setSectionFilter] = useState<GestorSectionFilter>('todos');
  const [globalSearch, setGlobalSearch] = useState('');

  // Drill-down drawer states
  const [selectedPortfolioCard, setSelectedPortfolioCard] = useState<PortfolioStatusCard | null>(null);
  const [selectedObligationCat, setSelectedObligationCat] =
    useState<OverdueObligationCategorySummary | null>(null);
  const [selectedOverdueRent, setSelectedOverdueRent] = useState<OverdueRentItem | null>(null);
  const [isFullRentsOpen, setIsFullRentsOpen] = useState(false);
  const [selectedPayoutState, setSelectedPayoutState] = useState<{
    payout: OverduePayoutItem | UpcomingPayoutItem;
    isOverdue: boolean;
  } | null>(null);
  const [selectedGuarantee, setSelectedGuarantee] = useState<GuaranteeRecordItem | null>(null);
  const [selectedAdjustment, setSelectedAdjustment] = useState<AdjustmentRecordItem | null>(null);
  const [selectedBillingItem, setSelectedBillingItem] = useState<GeneratedBillingItem | null>(null);
  const [selectedEmailDay, setSelectedEmailDay] = useState<EmailAutomationDay | null>(null);
  const [selectedFiscalDay, setSelectedFiscalDay] = useState<FiscalNoteDay | null>(null);
  const [selectedAdhocCharge, setSelectedAdhocCharge] = useState<AdhocOverdueCharge | null>(null);
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false);
  const [askRequest, setAskRequest] = useState<AskAgentRequestPayload | null>(null);

  const showCarteiraContas =
    sectionFilter === 'todos' || sectionFilter === 'carteira-contas';
  const showAlugueisRepasses =
    sectionFilter === 'todos' || sectionFilter === 'alugueis-repasses';
  const showGarantiasReajustes =
    sectionFilter === 'todos' || sectionFilter === 'garantias-reajustes';
  const showFinanceiroAutomacao =
    sectionFilter === 'todos' || sectionFilter === 'financeiro-automacao';

  if (isLoading) {
    return (
      <main className="flex-1 bg-[#F8F9FB] px-4 sm:px-6 lg:px-7 py-5 sm:py-6">
        <div className="max-w-[1440px] mx-auto space-y-5 animate-pulse" aria-busy="true">
          <div className="h-14 bg-white rounded-xl border border-slate-200" />
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-28 bg-white rounded-xl border border-slate-200" />
            ))}
          </div>
          <div className="h-72 bg-white rounded-xl border border-slate-200" />
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-[#F8F9FB] px-4 sm:px-6 lg:px-7 py-5 sm:py-6">
      <div className="max-w-[1440px] mx-auto space-y-6">
        {/* ================================================================= */}
        {/* CABEÇALHO DO PAINEL GESTOR                                        */}
        {/* ================================================================= */}
        <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
          <div>
            <h1 className="text-[22px] sm:text-[24px] font-bold text-slate-900 tracking-tight leading-tight">
              Gestor
            </h1>
            <p className="text-[13px] text-slate-500 mt-1">
              Painel executivo-operacional de administração de locações · Referência 22/11/2026 às 16:00
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Profile switch */}
            <div
              role="group"
              aria-label="Perfil de visualização"
              className="inline-flex items-center gap-1 p-1 rounded-xl bg-white border border-slate-200/90"
            >
              <UserCheck className="w-3.5 h-3.5 text-slate-400 ml-2 mr-0.5 shrink-0" />
              {PROFILES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onChangePerfil(p)}
                  aria-pressed={perfil === p}
                  className={`px-2.5 py-1 rounded-lg text-[12px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                    perfil === p
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsDictionaryOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[12.5px] font-medium text-slate-700 transition-colors whitespace-nowrap shrink-0"
            >
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span>Dicionário de indicadores</span>
            </button>

            <button
              type="button"
              onClick={() =>
                setAskRequest({
                  title: 'Solicitar plano de ação ao agente (Carteira de Locações)',
                  prefillText:
                    'Priorizar as pendências críticas do painel Gestor: 3 processos jurídicos, 7 contratos vencidos, 18 repasses atrasados, 15 reajustes vencidos e 2 notas fiscais com erro hoje.',
                  categoria: 'Consulta e relatório',
                  subtipo: 'Cobrança',
                  actionType: 'regua_cobranca',
                  evalParams: { diasAtraso: 30, valor: 0 },
                })
              }
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5B3FD0] hover:bg-[#4C32B8] text-white text-[12.5px] font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>Pedir ao agente</span>
            </button>
          </div>
        </header>

        {/* ================================================================= */}
        {/* PRIORIDADE 1 — FAIXA DE SITUAÇÕES CRÍTICAS E PENDÊNCIAS           */}
        {/* ================================================================= */}
        <section
          aria-label="Pendências críticas imediatas"
          className="bg-white rounded-xl border border-slate-200/90 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="w-8 h-8 rounded-lg bg-red-50 text-red-700 flex items-center justify-center shrink-0">
              <AlertOctagon className="w-4 h-4" />
            </span>
            <div>
              <div className="text-[13px] font-bold text-slate-900">
                Prioridades críticas para encaminhamento
              </div>
              <div className="text-[11.5px] text-slate-500">
                Clique em qualquer alerta para abrir os registros correspondentes
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setSelectedPortfolioCard(
                  PORTFOLIO_STATUS_CARDS.find((c) => c.key === 'processo_juridico') ?? null
                )
              }
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50/60 hover:bg-red-50 text-[12px] font-semibold text-red-800 tabular-nums whitespace-nowrap shrink-0"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>3 processos jurídicos</span>
            </button>

            <button
              type="button"
              onClick={() =>
                setSelectedPortfolioCard(
                  PORTFOLIO_STATUS_CARDS.find((c) => c.key === 'vencidos') ?? null
                )
              }
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50/60 hover:bg-red-50 text-[12px] font-semibold text-red-800 tabular-nums whitespace-nowrap shrink-0"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>7 contratos vencidos</span>
            </button>

            <button
              type="button"
              onClick={() => setIsFullRentsOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50/60 hover:bg-red-50 text-[12px] font-semibold text-red-800 tabular-nums whitespace-nowrap shrink-0"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{OVERDUE_RENTS_TOTAL_COUNT} aluguéis atrasados</span>
            </button>

            <button
              type="button"
              onClick={() => setSectionFilter('alugueis-repasses')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-amber-200 bg-amber-50/70 hover:bg-amber-50 text-[12px] font-semibold text-amber-900 tabular-nums whitespace-nowrap shrink-0"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{OVERDUE_PAYOUTS_COUNT} repasses atrasados</span>
            </button>

            <button
              type="button"
              onClick={() => setSectionFilter('garantias-reajustes')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-amber-200 bg-amber-50/70 hover:bg-amber-50 text-[12px] font-semibold text-amber-900 tabular-nums whitespace-nowrap shrink-0"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{ADJUSTMENTS_OVERDUE_COUNT} reajustes vencidos</span>
            </button>
          </div>
        </section>

        {/* ================================================================= */}
        {/* BARRA DE NAVEGAÇÃO POR BLOCOS + BUSCA GLOBAL                      */}
        {/* ================================================================= */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div
            role="tablist"
            aria-label="Blocos do painel Gestor"
            className="flex flex-wrap items-center gap-1.5"
          >
            {SECTION_FILTERS.map((f) => {
              const active = sectionFilter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSectionFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-[#2563EB] text-white'
                      : 'bg-white text-slate-600 border border-slate-200/90 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          <div className="relative w-full lg:w-[320px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Filtrar tabelas por contrato, imóvel ou pessoa..."
              aria-label="Filtrar tabelas por contrato, imóvel ou pessoa"
              className="w-full h-9 pl-9 pr-8 rounded-lg border border-slate-200/90 bg-white text-[12.5px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB]"
            />
            {globalSearch && (
              <button
                type="button"
                onClick={() => setGlobalSearch('')}
                aria-label="Limpar filtro"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ================================================================= */}
        {/* BLOCOS 1 A 6                                                      */}
        {/* ================================================================= */}
        {(showCarteiraContas || showAlugueisRepasses || showGarantiasReajustes) && (
          <GestorBlocksOperational
            showCarteiraContas={showCarteiraContas}
            showAlugueisRepasses={showAlugueisRepasses}
            showGarantiasReajustes={showGarantiasReajustes}
            globalSearch={globalSearch}
            perfil={perfil}
            onSelectPortfolioCard={(card) => setSelectedPortfolioCard(card)}
            onSelectObligationCategory={(cat) => setSelectedObligationCat(cat)}
            onSelectOverdueRent={(rent) => setSelectedOverdueRent(rent)}
            onOpenFullOverdueRents={() => setIsFullRentsOpen(true)}
            onSelectPayout={(payout, isOverdue) =>
              setSelectedPayoutState({ payout, isOverdue })
            }
            onSelectGuarantee={(g) => setSelectedGuarantee(g)}
            onSelectAdjustment={(adj) => setSelectedAdjustment(adj)}
            onNavigateModule={onNavigateModule}
            onAskAgent={(payload) => setAskRequest(payload)}
          />
        )}

        {/* ================================================================= */}
        {/* BLOCOS 7 A 11                                                     */}
        {/* ================================================================= */}
        {showFinanceiroAutomacao && (
          <GestorBlocksAnalytics
            globalSearch={globalSearch}
            perfil={perfil}
            onSelectBillingItem={(item) => setSelectedBillingItem(item)}
            onSelectEmailDay={(day) => setSelectedEmailDay(day)}
            onSelectFiscalDay={(day) => setSelectedFiscalDay(day)}
            onSelectAdhocCharge={(charge) => setSelectedAdhocCharge(charge)}
            onNavigateModule={onNavigateModule}
            onAskAgent={(payload) => setAskRequest(payload)}
          />
        )}
      </div>

      {/* =================================================================== */}
      {/* DRAWERS DE DETALHAMENTO E AGENTE                                    */}
      {/* =================================================================== */}
      <ContractFilterDrawer
        statusCard={selectedPortfolioCard}
        contracts={GESTOR_CONTRACTS_SAMPLE}
        perfil={perfil}
        onClose={() => setSelectedPortfolioCard(null)}
        onNavigateModule={onNavigateModule}
        onAskAgent={(payload) => setAskRequest(payload)}
      />

      <OverdueObligationsDrawer
        summary={selectedObligationCat}
        items={OVERDUE_OBLIGATIONS_SAMPLE}
        onClose={() => setSelectedObligationCat(null)}
        onNavigateModule={onNavigateModule}
        onAskAgent={(payload) => setAskRequest(payload)}
      />

      <FullOverdueRentsDrawer
        isOpen={isFullRentsOpen}
        rents={OVERDUE_RENTS_LIST}
        onClose={() => setIsFullRentsOpen(false)}
        onSelectRent={(rent) => {
          setIsFullRentsOpen(false);
          setSelectedOverdueRent(rent);
        }}
      />

      <RentDetailDrawer
        rent={selectedOverdueRent}
        onClose={() => setSelectedOverdueRent(null)}
        onNavigateModule={onNavigateModule}
        onAskAgent={(payload) => setAskRequest(payload)}
      />

      <PayoutDetailDrawer
        payout={selectedPayoutState?.payout ?? null}
        isOverdue={selectedPayoutState?.isOverdue ?? false}
        onClose={() => setSelectedPayoutState(null)}
        onNavigateModule={onNavigateModule}
        onAskAgent={(payload) => setAskRequest(payload)}
      />

      <GuaranteeDetailDrawer
        guarantee={selectedGuarantee}
        onClose={() => setSelectedGuarantee(null)}
        onNavigateModule={onNavigateModule}
        onAskAgent={(payload) => setAskRequest(payload)}
      />

      <AdjustmentDetailDrawer
        adjustment={selectedAdjustment}
        onClose={() => setSelectedAdjustment(null)}
        onNavigateModule={onNavigateModule}
        onAskAgent={(payload) => setAskRequest(payload)}
      />

      <BillingDetailDrawer
        entry={selectedBillingItem}
        onClose={() => setSelectedBillingItem(null)}
        onAskAgent={(payload) => setAskRequest(payload)}
      />

      <EmailDayDrawer
        day={selectedEmailDay}
        onClose={() => setSelectedEmailDay(null)}
        onAskAgent={(payload) => setAskRequest(payload)}
      />

      <FiscalDayDrawer
        day={selectedFiscalDay}
        onClose={() => setSelectedFiscalDay(null)}
        onAskAgent={(payload) => setAskRequest(payload)}
      />

      <AdhocChargeDetailDrawer
        charge={selectedAdhocCharge}
        onClose={() => setSelectedAdhocCharge(null)}
        onNavigateModule={onNavigateModule}
        onAskAgent={(payload) => setAskRequest(payload)}
      />

      <IndicatorDictionaryDrawer
        isOpen={isDictionaryOpen}
        onClose={() => setIsDictionaryOpen(false)}
      />

      <AskAgentOrderDrawer
        request={askRequest}
        rules={rules}
        onClose={() => setAskRequest(null)}
        onConfirmRequest={onCreateAgentOrder}
        onOpenRuleById={onOpenRuleById}
        onOpenOrderInCenter={onOpenOrderInCenter}
      />
    </main>
  );
}
