import { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Search,
  X,
  Bot,
  Lock,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  History,
  ShieldBan,
  Sliders,
  ListChecks,
  RotateCcw,
  Eye,
  Play,
  FilePlus2,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  MODULOS_DISPONIVEIS,
  type AgentRuleSuggestion,
  type AutonomyMatrixCell,
  type GlobalHistoryItem,
  type Modo,
  type PerfilRegra,
  type Regra,
  type StatusRegra,
  type TipoRegra,
} from '../../data/rulesData';
import {
  BarrierLockTag,
  canCreateInModule,
  canEditRule,
  formatRuleSummary,
  MODO_LABELS,
  ModoBadge,
  STATUS_REGRA_LABELS,
  StatusRegraBadge,
  TIPO_REGRA_LABELS,
} from './RuleHelpers';
import { WordTruncatedText } from '../agent-center/OrderHelpers';

export type RulesPageTab = 'regras' | 'autonomia' | 'barreiras' | 'sugestoes' | 'historico';

type RulesKpiFilter =
  | 'all'
  | 'ativas'
  | 'rascunhos'
  | 'em_aprovacao'
  | 'conflitos'
  | 'acionamentos';

interface AgentRulesPageProps {
  rules: Regra[];
  initialRulesBaseline: {
    ativas: number;
    rascunhos: number;
    emAprovacao: number;
    conflitos: number;
  };
  autonomyMatrix: AutonomyMatrixCell[];
  suggestions: AgentRuleSuggestion[];
  globalHistory: GlobalHistoryItem[];
  perfil: PerfilRegra;
  onChangePerfil: (perfil: PerfilRegra) => void;
  initialModuleFilter?: string | null;
  onClearInitialModuleFilter?: () => void;
  isLoading: boolean;
  onSelectRule: (rule: Regra) => void;
  onNewRule: (presetModule?: string) => void;
  onUpdateAutonomyCell: (cellId: string, modo: Modo, limiteValor?: number) => void;
  onCreateDraftFromSuggestion: (suggestion: AgentRuleSuggestion) => void;
  onDismissSuggestion: (suggestionId: string) => void;
  onRestoreFromGlobalHistory: (ruleId: string, versao: number) => void;
}

const PERFIS: { id: PerfilRegra; hint: string }[] = [
  { id: 'Gestor', hint: 'Edita tudo, exceto barreiras travadas' },
  { id: 'Financeiro', hint: 'Edita apenas regras do módulo Financeiro' },
  { id: 'Jurídico', hint: 'Edita apenas regras de Contratos e Jurídico' },
  { id: 'Corretor', hint: 'Apenas visualiza (somente leitura)' },
];

export function AgentRulesPage({
  rules,
  initialRulesBaseline,
  autonomyMatrix,
  suggestions,
  globalHistory,
  perfil,
  onChangePerfil,
  initialModuleFilter,
  onClearInitialModuleFilter,
  isLoading,
  onSelectRule,
  onNewRule,
  onUpdateAutonomyCell,
  onCreateDraftFromSuggestion,
  onDismissSuggestion,
  onRestoreFromGlobalHistory,
}: AgentRulesPageProps) {
  const [activeTab, setActiveTab] = useState<RulesPageTab>('regras');
  const [tabLoading, setTabLoading] = useState(false);

  const [kpiFilter, setKpiFilter] = useState<RulesKpiFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | TipoRegra>('all');
  const [modeFilter, setModeFilter] = useState<'all' | Modo>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | StatusRegra>('all');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');

  const [expandedEvidenceIds, setExpandedEvidenceIds] = useState<Record<string, boolean>>({});
  const [simulatedSuggestionIds, setSimulatedSuggestionIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (initialModuleFilter) {
      setActiveTab('regras');
      setModuleFilter(initialModuleFilter);
      onClearInitialModuleFilter?.();
    }
  }, [initialModuleFilter, onClearInitialModuleFilter]);

  const handleTabSwitch = (nextTab: RulesPageTab) => {
    if (nextTab === activeTab) return;
    setActiveTab(nextTab);
    setTabLoading(true);
    window.setTimeout(() => setTabLoading(false), 180);
  };

  const kpiCounters = useMemo(() => {
    const liveAtivas = rules.filter((r) => r.status === 'ativa').length;
    const liveRascunhos = rules.filter((r) => r.status === 'rascunho').length;
    const liveEmAprovacao = rules.filter((r) => r.status === 'em_aprovacao').length;
    const liveConflitos = Math.ceil(rules.filter((r) => !!r.conflitoCom && r.status === 'ativa').length / 2);

    return {
      ativas: Math.max(0, 64 + (liveAtivas - initialRulesBaseline.ativas)),
      rascunhos: Math.max(0, 5 + (liveRascunhos - initialRulesBaseline.rascunhos)),
      emAprovacao: Math.max(0, 2 + (liveEmAprovacao - initialRulesBaseline.emAprovacao)),
      conflitos: Math.max(0, 1 + (liveConflitos - initialRulesBaseline.conflitos)),
      acionamentos30d: 1284,
      sugestoes: suggestions.length,
    };
  }, [rules, initialRulesBaseline, suggestions.length]);

  const ownerOptions = useMemo(() => {
    return Array.from(new Set(rules.map((r) => r.criadaPor))).sort((a, b) =>
      a.localeCompare(b, 'pt-BR')
    );
  }, [rules]);

  const filteredRules = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return rules.filter((r) => {
      if (kpiFilter === 'ativas' && r.status !== 'ativa') return false;
      if (kpiFilter === 'rascunhos' && r.status !== 'rascunho') return false;
      if (kpiFilter === 'em_aprovacao' && r.status !== 'em_aprovacao') return false;
      if (kpiFilter === 'conflitos' && !r.conflitoCom) return false;
      if (kpiFilter === 'acionamentos' && r.acionamentos30d === 0) return false;

      if (q) {
        const summary = formatRuleSummary(r).toLowerCase();
        const hit =
          r.id.toLowerCase().includes(q) ||
          r.nome.toLowerCase().includes(q) ||
          r.moduloDono.toLowerCase().includes(q) ||
          summary.includes(q);
        if (!hit) return false;
      }

      if (
        moduleFilter !== 'all' &&
        r.moduloDono !== moduleFilter &&
        !r.modulosAfetados.includes(moduleFilter)
      ) {
        return false;
      }
      if (typeFilter !== 'all' && r.tipo !== typeFilter) return false;
      if (modeFilter !== 'all' && r.entao.modo !== modeFilter) return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (ownerFilter !== 'all' && r.criadaPor !== ownerFilter) return false;

      return true;
    });
  }, [
    rules,
    kpiFilter,
    searchQuery,
    moduleFilter,
    typeFilter,
    modeFilter,
    statusFilter,
    ownerFilter,
  ]);

  const hasAnyFilter =
    kpiFilter !== 'all' ||
    searchQuery.trim() !== '' ||
    moduleFilter !== 'all' ||
    typeFilter !== 'all' ||
    modeFilter !== 'all' ||
    statusFilter !== 'all' ||
    ownerFilter !== 'all';

  const clearFilters = () => {
    setKpiFilter('all');
    setSearchQuery('');
    setModuleFilter('all');
    setTypeFilter('all');
    setModeFilter('all');
    setStatusFilter('all');
    setOwnerFilter('all');
  };

  const barriers = useMemo(
    () => rules.filter((r) => r.travada || r.tipo === 'barreira'),
    [rules]
  );

  const groupedMatrix = useMemo(() => {
    const groups: Record<string, AutonomyMatrixCell[]> = {};
    for (const cell of autonomyMatrix) {
      if (!groups[cell.categoria]) groups[cell.categoria] = [];
      groups[cell.categoria].push(cell);
    }
    return Object.entries(groups);
  }, [autonomyMatrix]);

  const activePerfilMeta = PERFIS.find((p) => p.id === perfil) ?? PERFIS[0];
  const canCreateAny = canCreateInModule(perfil);
  const canEditAutonomyMatrix = perfil === 'Gestor';

  return (
    <main className="flex-1 bg-[#F8F9FB] px-4 sm:px-6 lg:px-7 py-5 sm:py-6">
      <div className="max-w-[1440px] mx-auto space-y-5">
        {/* CABEÇALHO + SELETOR DE PERFIL */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-[#F3F0FF] text-[#5B3FD0] flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" strokeWidth={2} />
              </span>
              <h1 className="text-[22px] sm:text-[24px] font-bold text-slate-900 tracking-tight leading-tight">
                Regras do agente
              </h1>
            </div>
            <p className="text-[13px] text-slate-500 mt-1">
              O que o agente faz sozinho, o que exige aprovação e o que é proibido
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Seletor de perfil (demo) */}
            <div className="bg-white rounded-xl border border-slate-200/90 px-3 py-1.5 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">
                Perfil (demo):
              </span>
              <div role="group" aria-label="Selecionar perfil de permissão" className="flex flex-wrap gap-1">
                {PERFIS.map((p) => {
                  const selected = perfil === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => onChangePerfil(p.id)}
                      aria-pressed={selected}
                      title={p.hint}
                      className={`px-2.5 py-1 rounded-lg text-[12px] font-medium transition-colors whitespace-nowrap ${
                        selected
                          ? 'bg-[#2563EB] text-white'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      {p.id}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              disabled={!canCreateAny}
              title={canCreateAny ? 'Criar nova regra' : 'Perfil Corretor apenas visualiza regras'}
              onClick={() => onNewRule()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-[13px] font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" strokeWidth={2.2} />
              <span>Nova regra</span>
            </button>
          </div>
        </div>

        {/* Permission context strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 text-[12px] text-slate-600">
          <span>
            Permissão ativa (<strong className="text-slate-900">{perfil}</strong>):{' '}
            {activePerfilMeta.hint}.
          </span>
          <span className="inline-flex items-center gap-1.5 text-slate-500">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            Barreiras de segurança só podem ser editadas pelo Administrador
          </span>
        </div>

        {/* 6 INDICADORES CLICÁVEIS */}
        <section aria-label="Indicadores de governança das regras">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
            <button
              type="button"
              onClick={() => {
                setActiveTab('regras');
                setKpiFilter((prev) => (prev === 'ativas' ? 'all' : 'ativas'));
              }}
              aria-pressed={kpiFilter === 'ativas' && activeTab === 'regras'}
              className={`text-left rounded-xl border p-3.5 transition-colors ${
                kpiFilter === 'ativas' && activeTab === 'regras'
                  ? 'border-[#2563EB] bg-[#EFF4FF]/55 ring-1 ring-[#2563EB]/25'
                  : 'border-slate-200/90 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-[12px] font-medium text-slate-600">
                <span className="truncate">Regras ativas</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              </div>
              <div className="text-[22px] font-bold text-slate-900 mt-1 tabular-nums">
                {kpiCounters.ativas}
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('regras');
                setKpiFilter((prev) => (prev === 'rascunhos' ? 'all' : 'rascunhos'));
              }}
              aria-pressed={kpiFilter === 'rascunhos' && activeTab === 'regras'}
              className={`text-left rounded-xl border p-3.5 transition-colors ${
                kpiFilter === 'rascunhos' && activeTab === 'regras'
                  ? 'border-[#2563EB] bg-[#EFF4FF]/55 ring-1 ring-[#2563EB]/25'
                  : 'border-slate-200/90 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-[12px] font-medium text-slate-600">
                <span className="truncate">Rascunhos</span>
                <FilePlus2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              </div>
              <div className="text-[22px] font-bold text-slate-900 mt-1 tabular-nums">
                {kpiCounters.rascunhos}
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('regras');
                setKpiFilter((prev) => (prev === 'em_aprovacao' ? 'all' : 'em_aprovacao'));
              }}
              aria-pressed={kpiFilter === 'em_aprovacao' && activeTab === 'regras'}
              className={`text-left rounded-xl border p-3.5 transition-colors ${
                kpiFilter === 'em_aprovacao' && activeTab === 'regras'
                  ? 'border-[#2563EB] bg-[#EFF4FF]/55 ring-1 ring-[#2563EB]/25'
                  : 'border-slate-200/90 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-[12px] font-medium text-slate-600">
                <span className="truncate">Aguardando aprovação</span>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              </div>
              <div className="text-[22px] font-bold text-amber-700 mt-1 tabular-nums">
                {kpiCounters.emAprovacao}
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('regras');
                setKpiFilter((prev) => (prev === 'conflitos' ? 'all' : 'conflitos'));
              }}
              aria-pressed={kpiFilter === 'conflitos' && activeTab === 'regras'}
              className={`text-left rounded-xl border p-3.5 transition-colors ${
                kpiFilter === 'conflitos' && activeTab === 'regras'
                  ? 'border-[#2563EB] bg-[#EFF4FF]/55 ring-1 ring-[#2563EB]/25'
                  : 'border-slate-200/90 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-[12px] font-medium text-slate-600">
                <span className="truncate">Conflitos detectados</span>
                <ShieldAlert className="w-3.5 h-3.5 text-red-600 shrink-0" />
              </div>
              <div className="text-[22px] font-bold text-red-700 mt-1 tabular-nums">
                {kpiCounters.conflitos}
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('regras');
                setKpiFilter((prev) => (prev === 'acionamentos' ? 'all' : 'acionamentos'));
              }}
              aria-pressed={kpiFilter === 'acionamentos' && activeTab === 'regras'}
              className={`text-left rounded-xl border p-3.5 transition-colors ${
                kpiFilter === 'acionamentos' && activeTab === 'regras'
                  ? 'border-[#2563EB] bg-[#EFF4FF]/55 ring-1 ring-[#2563EB]/25'
                  : 'border-slate-200/90 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-[12px] font-medium text-slate-600">
                <span className="truncate">Acionamentos (30d)</span>
                <Bot className="w-3.5 h-3.5 text-[#5B3FD0] shrink-0" />
              </div>
              <div className="text-[22px] font-bold text-slate-900 mt-1 tabular-nums">
                {kpiCounters.acionamentos30d.toLocaleString('pt-BR')}
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleTabSwitch('sugestoes')}
              aria-pressed={activeTab === 'sugestoes'}
              className={`text-left rounded-xl border p-3.5 transition-colors ${
                activeTab === 'sugestoes'
                  ? 'border-[#5B3FD0] bg-[#F3F0FF]/65 ring-1 ring-[#5B3FD0]/25'
                  : 'border-slate-200/90 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-[12px] font-medium text-slate-600">
                <span className="truncate">Sugestões do agente</span>
                <Sparkles className="w-3.5 h-3.5 text-[#5B3FD0] shrink-0" />
              </div>
              <div className="text-[22px] font-bold text-[#5B3FD0] mt-1 tabular-nums">
                {kpiCounters.sugestoes}
              </div>
            </button>
          </div>
        </section>

        {/* ABAS */}
        <div
          role="tablist"
          aria-label="Seções de Regras do agente"
          className="border-b border-slate-200 flex items-center gap-1 overflow-x-auto"
        >
          {(
            [
              { id: 'regras', label: 'Regras', icon: ListChecks, count: rules.length },
              { id: 'autonomia', label: 'Autonomia', icon: Sliders },
              { id: 'barreiras', label: 'Barreiras', icon: ShieldBan, count: barriers.length },
              {
                id: 'sugestoes',
                label: 'Sugestões do agente',
                icon: Sparkles,
                count: suggestions.length,
              },
              { id: 'historico', label: 'Histórico', icon: History, count: globalHistory.length },
            ] as {
              id: RulesPageTab;
              label: string;
              icon: typeof ListChecks;
              count?: number;
            }[]
          ).map((tab) => {
            const selected = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => handleTabSwitch(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                  selected
                    ? 'border-[#2563EB] text-[#2563EB]'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 tabular-nums">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* LOADING SKELETON */}
        {(isLoading || tabLoading) ? (
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 space-y-3 animate-pulse" aria-busy="true">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="h-12 bg-slate-100 rounded-lg" />
            ))}
          </div>
        ) : (
          <>
            {/* 1. ABA REGRAS */}
            {activeTab === 'regras' && (
              <div className="space-y-4">
                {/* Search + Filters */}
                <section className="bg-white rounded-xl border border-slate-200/90 p-3.5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar por ID (FIN-014), nome, módulo ou condição..."
                        aria-label="Buscar regras"
                        className="w-full h-9 pl-9 pr-8 rounded-lg border border-slate-200 bg-[#F8F9FB] text-[12.5px] focus:bg-white focus:border-[#2563EB]"
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

                    {hasAnyFilter && (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-600 hover:bg-slate-50 whitespace-nowrap"
                      >
                        <X className="w-3.5 h-3.5" />
                        Limpar filtros
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                    <select
                      value={moduleFilter}
                      onChange={(e) => setModuleFilter(e.target.value)}
                      aria-label="Filtrar por módulo"
                      className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-[12px]"
                    >
                      <option value="all">Módulo: Todos</option>
                      {MODULOS_DISPONIVEIS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>

                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value as 'all' | TipoRegra)}
                      aria-label="Filtrar por tipo"
                      className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-[12px]"
                    >
                      <option value="all">Tipo: Todos</option>
                      {(Object.keys(TIPO_REGRA_LABELS) as TipoRegra[]).map((t) => (
                        <option key={t} value={t}>
                          {TIPO_REGRA_LABELS[t]}
                        </option>
                      ))}
                    </select>

                    <select
                      value={modeFilter}
                      onChange={(e) => setModeFilter(e.target.value as 'all' | Modo)}
                      aria-label="Filtrar por modo"
                      className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-[12px]"
                    >
                      <option value="all">Modo: Todos</option>
                      {(Object.keys(MODO_LABELS) as Modo[]).map((m) => (
                        <option key={m} value={m}>
                          {MODO_LABELS[m]}
                        </option>
                      ))}
                    </select>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as 'all' | StatusRegra)}
                      aria-label="Filtrar por status"
                      className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-[12px]"
                    >
                      <option value="all">Status: Todos</option>
                      {(Object.keys(STATUS_REGRA_LABELS) as StatusRegra[]).map((s) => (
                        <option key={s} value={s}>
                          {STATUS_REGRA_LABELS[s]}
                        </option>
                      ))}
                    </select>

                    <select
                      value={ownerFilter}
                      onChange={(e) => setOwnerFilter(e.target.value)}
                      aria-label="Filtrar por responsável"
                      className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-[12px]"
                    >
                      <option value="all">Criada por: Todos</option>
                      {ownerOptions.map((ow) => (
                        <option key={ow} value={ow}>
                          {ow}
                        </option>
                      ))}
                    </select>
                  </div>
                </section>

                {/* Tabela de Regras */}
                {filteredRules.length === 0 ? (
                  <div className="bg-white rounded-xl border border-slate-200/90 p-10 text-center">
                    <p className="text-[14px] font-semibold text-slate-900">
                      Nenhuma regra encontrada para este filtro
                    </p>
                    <p className="text-[12.5px] text-slate-500 mt-1">
                      Limpe os filtros ativos ou crie uma nova regra para o módulo.
                    </p>
                    {hasAnyFilter && (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="mt-4 px-3.5 py-2 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Limpar filtros
                      </button>
                    )}
                  </div>
                ) : (
                  <section className="bg-white rounded-xl border border-slate-200/90 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-[12.5px]">
                        <thead>
                          <tr className="bg-[#F8F9FB] border-b border-slate-200 text-slate-600">
                            <th className="py-2.5 px-3 font-semibold text-[11.5px] whitespace-nowrap">
                              ID
                            </th>
                            <th className="py-2.5 px-3 font-semibold text-[11.5px] whitespace-nowrap">
                              Nome
                            </th>
                            <th className="py-2.5 px-3 font-semibold text-[11.5px] whitespace-nowrap">
                              Módulo dono
                            </th>
                            <th className="py-2.5 px-3 font-semibold text-[11.5px] whitespace-nowrap">
                              Tipo
                            </th>
                            <th className="py-2.5 px-3 font-semibold text-[11.5px] whitespace-nowrap">
                              Modo
                            </th>
                            <th className="py-2.5 px-3 font-semibold text-[11.5px] whitespace-nowrap">
                              Resumo (Quando / Então)
                            </th>
                            <th className="py-2.5 px-3 font-semibold text-[11.5px] whitespace-nowrap">
                              Vigência
                            </th>
                            <th className="py-2.5 px-3 font-semibold text-[11.5px] whitespace-nowrap">
                              Versão
                            </th>
                            <th className="py-2.5 px-3 font-semibold text-[11.5px] whitespace-nowrap text-right">
                              Acion. 30d
                            </th>
                            <th className="py-2.5 px-3 font-semibold text-[11.5px] whitespace-nowrap">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredRules.map((rule) => {
                            const summary = formatRuleSummary(rule);
                            const editable = canEditRule(perfil, rule);
                            return (
                              <tr
                                key={rule.id}
                                onClick={() => onSelectRule(rule)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    onSelectRule(rule);
                                  }
                                }}
                                tabIndex={0}
                                role="button"
                                aria-label={`Abrir regra ${rule.id}: ${rule.nome}`}
                                className="hover:bg-[#EFF4FF]/45 focus-visible:bg-[#EFF4FF]/60 transition-colors cursor-pointer"
                              >
                                <td className="py-3 px-3 whitespace-nowrap align-middle">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono text-[12px] font-bold text-slate-900">
                                      {rule.id}
                                    </span>
                                    {rule.travada && (
                                      <span title="Barreira travada: edição exclusiva do Administrador">
                                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                                      </span>
                                    )}
                                    {rule.conflitoCom && (
                                      <span title={`Conflita com ${rule.conflitoCom.ruleId}`}>
                                        <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                                      </span>
                                    )}
                                  </div>
                                </td>

                                <td className="py-3 px-3 max-w-[220px] align-middle">
                                  <WordTruncatedText
                                    text={rule.nome}
                                    maxChars={42}
                                    className="font-semibold text-slate-900 block"
                                  />
                                  {!editable && (
                                    <span className="text-[10.5px] text-slate-400">
                                      Somente leitura
                                    </span>
                                  )}
                                </td>

                                <td className="py-3 px-3 align-middle">
                                  <div className="font-medium text-slate-900 whitespace-nowrap">
                                    {rule.moduloDono}
                                  </div>
                                  {rule.modulosAfetados.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {rule.modulosAfetados.slice(0, 2).map((m) => (
                                        <span
                                          key={m}
                                          className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-600 whitespace-nowrap"
                                        >
                                          {m}
                                        </span>
                                      ))}
                                      {rule.modulosAfetados.length > 2 && (
                                        <span className="text-[10px] text-slate-400">
                                          +{rule.modulosAfetados.length - 2}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </td>

                                <td className="py-3 px-3 whitespace-nowrap align-middle text-slate-700">
                                  {TIPO_REGRA_LABELS[rule.tipo]}
                                </td>

                                <td className="py-3 px-3 whitespace-nowrap align-middle">
                                  <ModoBadge modo={rule.entao.modo} />
                                </td>

                                <td className="py-3 px-3 max-w-[260px] align-middle text-slate-600">
                                  <WordTruncatedText text={summary} maxChars={58} />
                                </td>

                                <td className="py-3 px-3 whitespace-nowrap align-middle tabular-nums text-slate-600">
                                  {rule.vigenciaInicio}
                                </td>

                                <td className="py-3 px-3 whitespace-nowrap align-middle tabular-nums font-medium text-slate-700">
                                  v{rule.versao}
                                </td>

                                <td className="py-3 px-3 whitespace-nowrap align-middle text-right tabular-nums font-semibold text-slate-900">
                                  {rule.acionamentos30d}
                                </td>

                                <td className="py-3 px-3 whitespace-nowrap align-middle">
                                  <StatusRegraBadge status={rule.status} />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* 2. ABA AUTONOMIA */}
            {activeTab === 'autonomia' && (
              <div className="space-y-4">
                <div className="rounded-xl border border-amber-200 bg-amber-50/65 px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-[12.5px] text-amber-900">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>
                      <strong>Alterações seguras:</strong> qualquer mudança na matriz cria um{' '}
                      <strong>rascunho</strong> na base de regras e <strong>não aplica na hora</strong>.
                    </span>
                  </div>
                  {!canEditAutonomyMatrix && (
                    <span className="text-[11.5px] font-semibold">
                      Somente o perfil Gestor altera a matriz global
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  {groupedMatrix.map(([categoria, cells]) => (
                    <section
                      key={categoria}
                      className="bg-white rounded-xl border border-slate-200/90 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-slate-200/80 bg-[#F8F9FB]/70 flex items-center justify-between">
                        <h3 className="text-[13.5px] font-semibold text-slate-900">{categoria}</h3>
                        <span className="text-[11.5px] text-slate-500">
                          {cells.length} subtipos
                        </span>
                      </div>

                      <div className="divide-y divide-slate-100">
                        {cells.map((cell) => (
                          <div
                            key={cell.id}
                            className="px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-[13px] font-medium text-slate-900">
                                {cell.subtipo}
                              </span>
                              <ModoBadge modo={cell.modo} />
                            </div>

                            <div className="flex flex-wrap items-center gap-2.5">
                              <select
                                value={cell.modo}
                                disabled={!canEditAutonomyMatrix}
                                onChange={(e) =>
                                  onUpdateAutonomyCell(
                                    cell.id,
                                    e.target.value as Modo,
                                    cell.limiteValor
                                  )
                                }
                                aria-label={`Modo de autonomia para ${categoria} - ${cell.subtipo}`}
                                className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white disabled:bg-slate-50 text-[12px]"
                              >
                                {(['autonomo', 'aprovacao', 'sugerir', 'bloqueado'] as Modo[]).map(
                                  (m) => (
                                    <option key={m} value={m}>
                                      {MODO_LABELS[m]}
                                    </option>
                                  )
                                )}
                              </select>

                              <div className="flex items-center gap-1.5">
                                <span className="text-[11.5px] text-slate-500 whitespace-nowrap">
                                  Limite R$:
                                </span>
                                <input
                                  type="number"
                                  disabled={!canEditAutonomyMatrix}
                                  value={cell.limiteValor ?? ''}
                                  placeholder="Sem teto"
                                  onChange={(e) =>
                                    onUpdateAutonomyCell(
                                      cell.id,
                                      cell.modo,
                                      e.target.value === '' ? undefined : Number(e.target.value)
                                    )
                                  }
                                  aria-label={`Limite de valor para ${cell.subtipo}`}
                                  className="w-24 h-8 px-2 rounded-lg border border-slate-200 bg-white disabled:bg-slate-50 text-[12px] tabular-nums"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            )}

            {/* 3. ABA BARREIRAS */}
            {activeTab === 'barreiras' && (
              <div className="space-y-4">
                <div className="rounded-xl border border-red-200 bg-red-50/55 px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-[12.5px] text-red-900">
                  <div className="flex items-center gap-2">
                    <ShieldBan className="w-4 h-4 text-red-700 shrink-0" />
                    <span>
                      <strong>O que o agente NUNCA faz:</strong> barreiras permanentes de conformidade
                      jurídica, financeira e LGPD.
                    </span>
                  </div>
                  <BarrierLockTag />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {barriers.map((bar) => (
                    <article
                      key={bar.id}
                      onClick={() => onSelectRule(bar)}
                      className="bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 p-4 space-y-2.5 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[12px] font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                            {bar.id}
                          </span>
                          <ModoBadge modo="bloqueado" />
                        </div>
                        <BarrierLockTag />
                      </div>

                      <h3 className="text-[14px] font-semibold text-slate-900">{bar.nome}</h3>
                      <p className="text-[12.5px] text-slate-600 leading-relaxed">
                        {bar.justificativa}
                      </p>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11.5px] text-slate-500">
                        <span>Módulo dono: {bar.moduloDono}</span>
                        <span className="tabular-nums">
                          {bar.acionamentos30d} bloqueios nos últimos 30d
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* 4. ABA SUGESTÕES DO AGENTE */}
            {activeTab === 'sugestoes' && (
              <div className="space-y-4">
                <div className="rounded-xl border border-[#5B3FD0]/25 bg-[#F3F0FF]/65 px-4 py-3 flex items-center gap-2.5 text-[12.5px] text-[#5B3FD0] font-medium">
                  <Bot className="w-4 h-4 shrink-0" />
                  <span>
                    O agente NUNCA ativa uma regra sozinho. Toda sugestão cria apenas um rascunho para revisão e aprovação humana.
                  </span>
                </div>

                {suggestions.length === 0 ? (
                  <div className="bg-white rounded-xl border border-slate-200/90 p-10 text-center">
                    <CheckCircle2 className="w-7 h-7 text-emerald-600 mx-auto mb-2" />
                    <p className="text-[14px] font-semibold text-slate-900">
                      Nenhuma sugestão pendente do agente
                    </p>
                    <p className="text-[12.5px] text-slate-500 mt-1">
                      Quando o agente detectar padrões repetitivos de aprovação ou bloqueio, novas sugestões aparecerão aqui.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {suggestions.map((sug) => {
                      const evOpen = !!expandedEvidenceIds[sug.id];
                      const simOpen = !!simulatedSuggestionIds[sug.id];

                      return (
                        <article
                          key={sug.id}
                          className="bg-white rounded-xl border border-slate-200/90 p-5 space-y-3"
                        >
                          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[#5B3FD0]">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Sugestão baseada em histórico real</span>
                              </div>
                              <h3 className="text-[15px] font-semibold text-slate-900">
                                {sug.titulo}
                              </h3>
                              <p className="text-[12.5px] text-slate-600">{sug.impactoEstimado}</p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedEvidenceIds((prev) => ({
                                    ...prev,
                                    [sug.id]: !prev[sug.id],
                                  }))
                                }
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[12px] font-medium text-slate-700"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Ver evidência</span>
                                {evOpen ? (
                                  <ChevronUp className="w-3 h-3" />
                                ) : (
                                  <ChevronDown className="w-3 h-3" />
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setSimulatedSuggestionIds((prev) => ({
                                    ...prev,
                                    [sug.id]: !prev[sug.id],
                                  }))
                                }
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[12px] font-medium text-slate-700"
                              >
                                <Play className="w-3.5 h-3.5" />
                                <span>Simular</span>
                              </button>

                              <button
                                type="button"
                                disabled={!canCreateAny}
                                onClick={() => onCreateDraftFromSuggestion(sug)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-[12px] font-semibold"
                              >
                                <FilePlus2 className="w-3.5 h-3.5" />
                                <span>Criar rascunho</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => onDismissSuggestion(sug.id)}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[12px] font-medium text-slate-500"
                              >
                                Dispensar
                              </button>
                            </div>
                          </div>

                          {evOpen && (
                            <div className="rounded-lg bg-[#F8F9FB] border border-slate-200/80 p-3.5 text-[12px] space-y-1">
                              <div className="font-semibold text-slate-900">{sug.amostra}</div>
                              <p className="text-slate-600">{sug.evidencia}</p>
                            </div>
                          )}

                          {simOpen && (
                            <div className="rounded-lg bg-blue-50/50 border border-blue-200 p-3.5 text-[12px] text-slate-800">
                              <strong>Simulação nos últimos 30 dias:</strong> aplicável sem conflitos
                              graves; reduziria o tempo de espera em fila humana mantendo 100% de
                              rastreabilidade.
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 5. ABA HISTÓRICO */}
            {activeTab === 'historico' && (
              <div className="space-y-3">
                {globalHistory.length === 0 ? (
                  <div className="bg-white rounded-xl border border-slate-200/90 p-8 text-center text-[13px] text-slate-500">
                    Nenhuma alteração registrada no histórico.
                  </div>
                ) : (
                  globalHistory.map((item) => {
                    const targetRule = rules.find((r) => r.id === item.ruleId);
                    const canRestore = targetRule ? canEditRule(perfil, targetRule) : false;

                    return (
                      <article
                        key={item.id}
                        className="bg-white rounded-xl border border-slate-200/90 p-4 space-y-2.5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-[12px] font-bold text-[#2563EB]">
                              {item.ruleId}
                            </span>
                            <span className="text-[13px] font-semibold text-slate-900">
                              {item.ruleNome}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[11px] font-semibold text-slate-700">
                              v{item.versao}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-[11.5px] text-slate-500">
                            <span>{item.quem}</span>
                            <span className="tabular-nums">{item.quando}</span>
                          </div>
                        </div>

                        <p className="text-[12.5px] font-medium text-slate-800">{item.oQueMudou}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px]">
                          <div className="rounded-lg bg-red-50/50 border border-red-200/70 px-3 py-2 text-red-800">
                            <span className="font-semibold block text-[10.5px]">Antes</span>
                            {item.antes}
                          </div>
                          <div className="rounded-lg bg-emerald-50/50 border border-emerald-200/70 px-3 py-2 text-emerald-800">
                            <span className="font-semibold block text-[10.5px]">Depois</span>
                            {item.depois}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[12px]">
                          <span className="text-slate-600">
                            <strong>Justificativa:</strong> {item.justificativa}
                          </span>

                          <button
                            type="button"
                            disabled={!canRestore}
                            title={
                              canRestore
                                ? 'Restaurar esta versão na base de regras'
                                : 'Seu perfil não pode restaurar esta regra'
                            }
                            onClick={() => onRestoreFromGlobalHistory(item.ruleId, item.versao)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-45 text-[11.5px] font-semibold text-slate-700"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Restaurar esta versão
                          </button>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
