import { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import {
  Sliders,
  Building2,
  Sparkles,
  Wrench,
  Camera,
  FileCheck2,
  ClipboardCheck,
  ExternalLink,
} from 'lucide-react';
import { formatBRL } from '../../data/financeiroData';
import type { PerfilRegra, Regra } from '../../data/rulesData';
import {
  ESTIMATE_COMPARABLES_LABEL,
  INITIAL_VACANT_28,
  formatPctBR,
  type VacantPropertyItem,
} from '../../data/locacaoData';
import type { AskAgentRequestPayload } from '../financeiro/AskAgentOrderDrawer';
import { RuleAppliedChip } from '../financeiro/FinanceiroShared';

interface LocacaoTabVacanciaPrecoProps {
  rules: Regra[];
  perfil: PerfilRegra;
  readOnly: boolean;
  onOpenSimulator: (vacant: VacantPropertyItem) => void;
  onOpenFichaById: (portfolioId: string) => void;
  onAskAgent: (req: AskAgentRequestPayload) => void;
  onOpenRuleById: (ruleId: string) => void;
  onNavigateModule: (navId: 'manutencao-vistorias' | 'financeiro') => void;
}

type VacantFilterKey =
  | 'todos'
  | 'maior30'
  | 'acima5'
  | 'sem_visitas'
  | 'nao_prontos'
  | 'sem_autorizacao';

export function LocacaoTabVacanciaPreco({
  rules,
  perfil,
  readOnly,
  onOpenSimulator,
  onOpenFichaById,
  onAskAgent,
  onOpenRuleById,
  onNavigateModule,
}: LocacaoTabVacanciaPrecoProps) {
  const [filterKey, setFilterKey] = useState<VacantFilterKey>('todos');
  const [regionFilter, setRegionFilter] = useState<string>('Todas');

  const isCorretor = perfil === 'Corretor';

  const baseList = useMemo(() => {
    if (isCorretor) {
      return INITIAL_VACANT_28.filter((v) => v.corretor === 'Rafael Costa');
    }
    return INITIAL_VACANT_28;
  }, [isCorretor]);

  const counts = useMemo(() => {
    return {
      todos: baseList.length,
      maior30: baseList.filter((v) => v.diasVago > 30).length,
      acima5: baseList.filter((v) => v.diferencaPct > 5).length,
      sem_visitas: baseList.filter((v) => v.visitas30d === 0).length,
      nao_prontos: baseList.filter((v) => !v.prontoParaAnunciar).length,
      sem_autorizacao: baseList.filter((v) => !v.autorizacaoProprietario).length,
    };
  }, [baseList]);

  const filtered = useMemo(() => {
    return baseList.filter((v) => {
      if (regionFilter !== 'Todas' && v.regiao !== regionFilter) return false;
      if (filterKey === 'maior30') return v.diasVago > 30;
      if (filterKey === 'acima5') return v.diferencaPct > 5;
      if (filterKey === 'sem_visitas') return v.visitas30d === 0;
      if (filterKey === 'nao_prontos') return !v.prontoParaAnunciar;
      if (filterKey === 'sem_autorizacao') return !v.autorizacaoProprietario;
      return true;
    });
  }, [baseList, filterKey, regionFilter]);

  const totalValorPedido = useMemo(
    () => filtered.reduce((acc, v) => acc + v.valorPedido, 0),
    [filtered]
  );

  const avgDiasVago = useMemo(() => {
    if (filtered.length === 0) return 0;
    return Math.round(filtered.reduce((acc, v) => acc + v.diasVago, 0) / filtered.length);
  }, [filtered]);

  const bucketData = useMemo(() => {
    const b0 = baseList.filter((v) => v.faixaDias === '0-15d').length;
    const b1 = baseList.filter((v) => v.faixaDias === '16-30d').length;
    const b2 = baseList.filter((v) => v.faixaDias === '31-60d').length;
    const b3 = baseList.filter((v) => v.faixaDias === '>60d').length;
    return [
      { faixa: '0–15 dias', qtd: b0, fill: '#059669' },
      { faixa: '16–30 dias', qtd: b1, fill: '#2563EB' },
      { faixa: '31–60 dias', qtd: b2, fill: '#D97706' },
      { faixa: '> 60 dias', qtd: b3, fill: '#DC2626' },
    ];
  }, [baseList]);

  const notReadyGroups = useMemo(() => {
    const reparos = baseList.filter((v) => v.situacaoAnuncio === 'Em reparo');
    const vistorias = baseList.filter((v) => v.situacaoAnuncio === 'Aguardando vistoria de saída');
    const auths = baseList.filter((v) => v.situacaoAnuncio === 'Aguardando autorização do proprietário');
    const fotos = baseList.filter((v) => v.situacaoAnuncio === 'Sem fotos ou dados para anunciar');
    return { reparos, vistorias, auths, fotos };
  }, [baseList]);

  const loc001 = rules.find((r) => r.id === 'LOC-001');
  const fin011 = rules.find((r) => r.id === 'FIN-011');

  const FILTER_CARDS: { key: VacantFilterKey; label: string; count: number; hint: string }[] = [
    { key: 'todos', label: 'Total vagos', count: counts.todos, hint: '6,8% da carteira' },
    { key: 'maior30', label: 'Vagos > 30 dias', count: counts.maior30, hint: 'Alerta LOC-006' },
    { key: 'acima5', label: 'Acima do mercado > 5%', count: counts.acima5, hint: 'Est. comparáveis' },
    { key: 'sem_visitas', label: 'Sem visitas em 30d', count: counts.sem_visitas, hint: '0 visitas' },
    { key: 'nao_prontos', label: 'Não prontos p/ anunciar', count: counts.nao_prontos, hint: '39% dos vagos' },
    { key: 'sem_autorizacao', label: 'Sem autorização ajuste', count: counts.sem_autorizacao, hint: 'Trava LOC-001' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. 6 Clickable filter cards */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {FILTER_CARDS.map((card) => {
          const active = filterKey === card.key;
          return (
            <button
              key={card.key}
              type="button"
              onClick={() => setFilterKey(card.key)}
              aria-pressed={active}
              className={`text-left rounded-xl border p-3.5 transition-colors ${
                active
                  ? 'border-[#2563EB] bg-[#EFF4FF]/60 ring-1 ring-[#2563EB]/25'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="text-[11.5px] font-semibold text-slate-600 leading-snug">
                {card.label}
              </div>
              <div className="text-[20px] font-bold text-slate-900 tabular-nums mt-1">
                {card.count}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">{card.hint}</div>
            </button>
          );
        })}
      </section>

      {/* 2. Chart of days vacant + Price authority summary */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-[14.5px] font-bold text-slate-900">
                Tempo vago dos imóveis atuais ({baseList.length} unidades)
              </h3>
              <p className="text-[12px] text-slate-500">
                Média atual do estoque vago: <strong className="tabular-nums">34 dias</strong> · Meta LOC-006 ≤ 30 dias para alugar
              </p>
            </div>
            <RuleAppliedChip
              ruleId="LOC-006"
              versao={2}
              onOpenRule={onOpenRuleById}
            />
          </div>

          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bucketData} margin={{ top: 10, right: 16, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="faixa" tick={{ fontSize: 11.5, fill: '#475569' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11.5, fill: '#64748B' }} />
                <Tooltip
                  formatter={(v) => [`${v} imóveis`, 'Quantidade']}
                  contentStyle={{ borderRadius: 10, borderColor: '#E2E8F0', fontSize: 12 }}
                />
                <Bar dataKey="qtd" radius={[6, 6, 0, 0]}>
                  {bucketData.map((entry) => (
                    <Cell key={entry.faixa} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between gap-4">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[14.5px] font-bold text-slate-900">
                Alçada de ajuste de preço
              </h3>
              <RuleAppliedChip
                ruleId="LOC-001"
                versao={loc001?.versao ?? 2}
                onOpenRule={onOpenRuleById}
              />
            </div>

            <div className="rounded-lg border border-slate-200 bg-[#F8F9FB] p-3 space-y-1.5 text-[12px] text-slate-700">
              <div>
                • <strong>Até 5%</strong> com autorização registrada do dono: <span className="text-emerald-700 font-semibold">Autônomo</span>
              </div>
              <div>
                • <strong>Entre 5% e 15%</strong> com autorização: <span className="text-amber-800 font-semibold">Aprovação do Gestor (4h)</span>
              </div>
              <div>
                • <strong>Sem autorização ou &gt; 15%</strong>: <span className="text-red-700 font-semibold">Bloqueado</span> (agente solicita autorização ao dono)
              </div>
            </div>

            <p className="text-[11.5px] text-slate-500">
              Referência de mercado sempre exibida como <strong>{ESTIMATE_COMPARABLES_LABEL}</strong>, nunca como preço oficial.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 flex items-center justify-between text-[12.5px]">
            <span className="text-slate-600">Soma pedida (filtro atual):</span>
            <strong className="text-slate-900 text-[15px] tabular-nums">
              {formatBRL(totalValorPedido)}/mês
            </strong>
          </div>
        </div>
      </section>

      {/* 3. 28 Vacant Properties Table */}
      <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-[14.5px] font-bold text-slate-900">
              Estoque de imóveis vagos ({filtered.length})
            </h3>
            <p className="text-[12px] text-slate-500 tabular-nums">
              Soma pedida: <strong>{formatBRL(totalValorPedido)}</strong> · Média parado: <strong>{avgDiasVago} dias</strong> · {ESTIMATE_COMPARABLES_LABEL}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              aria-label="Filtrar vagos por região"
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-[12px] font-medium text-slate-700"
            >
              <option value="Todas">Todas regiões</option>
              <option value="Centro">Centro</option>
              <option value="Zona Norte">Zona Norte</option>
              <option value="Zona Sul">Zona Sul</option>
              <option value="Zona Leste">Zona Leste</option>
            </select>

            {filterKey !== 'todos' && (
              <button
                type="button"
                onClick={() => setFilterKey('todos')}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-700 hover:bg-slate-50"
              >
                Limpar filtro
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[12.5px]">
            <thead className="bg-[#F8F9FB] border-b border-slate-200 text-slate-500 font-semibold">
              <tr>
                <th className="px-4 py-2.5">Imóvel</th>
                <th className="px-3 py-2.5">Região / Tipo</th>
                <th className="px-3 py-2.5">Dias vago</th>
                <th className="px-3 py-2.5">Aluguel pedido</th>
                <th className="px-3 py-2.5">Est. mercado</th>
                <th className="px-3 py-2.5">Diferença</th>
                <th className="px-3 py-2.5">Visitas 30d</th>
                <th className="px-3 py-2.5">Situação anúncio</th>
                <th className="px-3 py-2.5">Sugestão do agente</th>
                <th className="px-4 py-2.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((v) => {
                const isHighDiff = v.diferencaPct > 5;
                return (
                  <tr key={v.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] font-bold text-[#2563EB]">
                          {v.codigo}
                        </span>
                        {!v.autorizacaoProprietario && (
                          <span className="px-1.5 py-0.5 rounded bg-red-50 border border-red-200 text-red-700 text-[10px] font-semibold">
                            Sem aut. dono
                          </span>
                        )}
                      </div>
                      <div className="font-semibold text-slate-900">{v.imovel}</div>
                      <div className="text-[11px] text-slate-500">Dono: {v.proprietario}</div>
                    </td>

                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="text-slate-800">{v.regiao}</div>
                      <div className="text-[11px] text-slate-500">
                        {v.tipo} · {v.metragemM2} m²
                      </div>
                    </td>

                    <td className="px-3 py-3 whitespace-nowrap tabular-nums">
                      <span
                        className={`font-bold ${
                          v.diasVago > 60
                            ? 'text-red-700'
                            : v.diasVago > 30
                            ? 'text-amber-700'
                            : 'text-slate-800'
                        }`}
                      >
                        {v.diasVago} dias
                      </span>
                    </td>

                    <td className="px-3 py-3 whitespace-nowrap font-bold text-slate-900 tabular-nums">
                      {formatBRL(v.valorPedido)}
                    </td>

                    <td className="px-3 py-3 whitespace-nowrap tabular-nums">
                      <div className="text-slate-800">{formatBRL(v.estimativaMercado)}</div>
                      <div className="text-[10.5px] text-slate-500">
                        conf. {v.confiancaMercadoPct}% ({v.comparaveisQtd} comp.)
                      </div>
                    </td>

                    <td className="px-3 py-3 whitespace-nowrap tabular-nums">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-md border text-[11px] font-semibold ${
                          isHighDiff
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {formatPctBR(v.diferencaPct, true)}
                      </span>
                    </td>

                    <td className="px-3 py-3 whitespace-nowrap tabular-nums">
                      <div className={v.visitas30d === 0 ? 'font-bold text-red-700' : 'text-slate-800'}>
                        {v.visitas30d} visita(s)
                      </div>
                      {v.propostas > 0 && (
                        <div className="text-[11px] font-semibold text-[#2563EB]">
                          {v.propostas} proposta(s)
                        </div>
                      )}
                    </td>

                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-md border text-[11px] font-medium ${
                          v.prontoParaAnunciar
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-900 border-amber-200'
                        }`}
                      >
                        {v.situacaoAnuncio}
                      </span>
                    </td>

                    <td className="px-3 py-3 max-w-[230px] text-[11.5px] text-slate-700">
                      {v.sugestaoAgente}
                    </td>

                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenSimulator(v)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#F3F0FF] hover:bg-[#EDE9FE] text-[#5B3FD0] text-[11.5px] font-semibold"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>Simular preço</span>
                        </button>
                        {v.linkedPortfolioId && (
                          <button
                            type="button"
                            onClick={() => onOpenFichaById(v.linkedPortfolioId!)}
                            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-[11.5px] font-medium"
                            title="Abrir ficha completa do imóvel"
                          >
                            <Building2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. DESTRAVAR IMÓVEIS NÃO PRONTOS (11) */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-[15px] font-bold text-slate-900">
              Destravar imóveis não prontos para anunciar ({counts.nao_prontos})
            </h3>
            <p className="text-[12px] text-slate-500">
              O agente não publica anúncios sem fotos, sem autorização ou com vistoria/reparo aberto (LOC-002 v3). Reparos acima de R$ 1.500 seguem FIN-011.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <RuleAppliedChip ruleId="LOC-002" versao={3} onOpenRule={onOpenRuleById} />
            <RuleAppliedChip
              ruleId="FIN-011"
              versao={fin011?.versao ?? 2}
              onOpenRule={onOpenRuleById}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Card 1: Reparos (4) */}
          <div className="rounded-xl border border-slate-200 bg-[#F8F9FB] p-4 flex flex-col justify-between gap-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-slate-900">
                  <Wrench className="w-4 h-4 text-amber-600" />
                  Em reparo ({notReadyGroups.reparos.length})
                </span>
                <button
                  type="button"
                  onClick={() => onNavigateModule('manutencao-vistorias')}
                  className="text-[11px] font-semibold text-[#2563EB] hover:underline inline-flex items-center gap-0.5"
                >
                  Manutenção <ExternalLink className="w-3 h-3" />
                </button>
              </div>
              <ul className="space-y-1.5 text-[11.5px] text-slate-700">
                {notReadyGroups.reparos.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-2">
                    <span className="truncate">{r.imovel}</span>
                    <span className="font-mono font-semibold shrink-0">
                      {r.reparoValorEstimado ? formatBRL(r.reparoValorEstimado) : 'Orçam.'}
                      {(r.reparoValorEstimado ?? 0) > 1500 && ' · FIN-011'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {!readOnly && (
              <button
                type="button"
                onClick={() =>
                  onAskAgent({
                    title: 'Aprovar e agilizar reparos acima de R$ 1.500 (FIN-011)',
                    prefillText:
                      'Submeter orçamentos de reparo de Apto 401 Ed. Aurora (R$ 1.980,00) e Apto 114 Ed. Anhangabaú (R$ 1.720,00) conforme FIN-011 e acelerar os reparos autônomos.',
                    categoria: 'Cadastro e atualização',
                    subtipo: 'Cadastro de imóvel',
                    actionType: 'destravar_imovel',
                    evalParams: { reparoValor: 1980 },
                  })
                }
                className="w-full inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-[#5B3FD0] hover:bg-[#4C32B8] text-white text-[12px] font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pedir ao agente: liberar reparos</span>
              </button>
            )}
          </div>

          {/* Card 2: Vistoria de saída (3) */}
          <div className="rounded-xl border border-slate-200 bg-[#F8F9FB] p-4 flex flex-col justify-between gap-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-slate-900">
                  <ClipboardCheck className="w-4 h-4 text-amber-600" />
                  Vistoria de saída ({notReadyGroups.vistorias.length})
                </span>
                <button
                  type="button"
                  onClick={() => onNavigateModule('manutencao-vistorias')}
                  className="text-[11px] font-semibold text-[#2563EB] hover:underline inline-flex items-center gap-0.5"
                >
                  Vistorias <ExternalLink className="w-3 h-3" />
                </button>
              </div>
              <ul className="space-y-1.5 text-[11.5px] text-slate-700">
                {notReadyGroups.vistorias.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-2">
                    <span className="truncate">{r.imovel}</span>
                    <span className="text-slate-500 shrink-0 tabular-nums">{r.diasVago}d</span>
                  </li>
                ))}
              </ul>
            </div>

            {!readOnly && (
              <button
                type="button"
                onClick={() =>
                  onAskAgent({
                    title: 'Cobrar laudos de vistoria de saída',
                    prefillText:
                      'Cobrar laudo pendente dos vistoriadores para os imóveis em vistoria de saída e liberar publicação imediata caso sem avarias.',
                    categoria: 'Cadastro e atualização',
                    subtipo: 'Cadastro de imóvel',
                    actionType: 'destravar_imovel',
                    evalParams: {},
                  })
                }
                className="w-full inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-[#5B3FD0] hover:bg-[#4C32B8] text-white text-[12px] font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pedir ao agente: cobrar vistoria</span>
              </button>
            )}
          </div>

          {/* Card 3: Autorização do dono (2) */}
          <div className="rounded-xl border border-slate-200 bg-[#F8F9FB] p-4 flex flex-col justify-between gap-3">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-slate-900">
                <FileCheck2 className="w-4 h-4 text-red-600" />
                Autorização dono ({notReadyGroups.auths.length})
              </span>
              <ul className="space-y-1.5 text-[11.5px] text-slate-700">
                {notReadyGroups.auths.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-2">
                    <span className="truncate">{r.imovel}</span>
                    <span className="text-slate-500 shrink-0">{r.proprietario}</span>
                  </li>
                ))}
              </ul>
            </div>

            {!readOnly && (
              <button
                type="button"
                onClick={() =>
                  onAskAgent({
                    title: 'Solicitar autorização de divulgação aos proprietários',
                    prefillText:
                      'Enviar link de assinatura rápida por WhatsApp para Helena Prado (Apto 305) e Antonio Nogueira (Apto 44) liberarem a divulgação nos portais.',
                    categoria: 'Cadastro e atualização',
                    subtipo: 'Cadastro de imóvel',
                    actionType: 'publicar_anuncio',
                    evalParams: { fotosCount: 10, camposAnuncioCompletos: true, autorizacaoDivulgacao: false, imovelPronto: true },
                  })
                }
                className="w-full inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-[#5B3FD0] hover:bg-[#4C32B8] text-white text-[12px] font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pedir ao agente: cobrar assinatura</span>
              </button>
            )}
          </div>

          {/* Card 4: Sem fotos (2) */}
          <div className="rounded-xl border border-slate-200 bg-[#F8F9FB] p-4 flex flex-col justify-between gap-3">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-slate-900">
                <Camera className="w-4 h-4 text-red-600" />
                Sem fotos mínimas ({notReadyGroups.fotos.length})
              </span>
              <ul className="space-y-1.5 text-[11.5px] text-slate-700">
                {notReadyGroups.fotos.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-2">
                    <span className="truncate">{r.imovel}</span>
                    <span className="text-red-700 font-semibold shrink-0">{r.fotosCount}/8 fotos</span>
                  </li>
                ))}
              </ul>
            </div>

            {!readOnly && (
              <button
                type="button"
                onClick={() =>
                  onAskAgent({
                    title: 'Agendar fotógrafo para cumprir mínimo de 8 fotos (LOC-002)',
                    prefillText:
                      'Agendar sessão fotográfica para Apto 205 Ed. República (4 fotos) e Loja 02 Boulevard Sul (5 fotos) para cumprir a trava mínima de 8 fotos da regra LOC-002.',
                    categoria: 'Cadastro e atualização',
                    subtipo: 'Cadastro de imóvel',
                    actionType: 'publicar_anuncio',
                    evalParams: { fotosCount: 4, camposAnuncioCompletos: true, autorizacaoDivulgacao: true, imovelPronto: true },
                  })
                }
                className="w-full inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-[#5B3FD0] hover:bg-[#4C32B8] text-white text-[12px] font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pedir ao agente: agendar fotos</span>
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
