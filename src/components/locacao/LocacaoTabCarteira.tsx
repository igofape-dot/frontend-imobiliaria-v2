import { useMemo, useState } from 'react';
import { Search, Building2, Lock, Sparkles, ArrowUpRight } from 'lucide-react';
import { formatBRL } from '../../data/financeiroData';
import type { PerfilRegra } from '../../data/rulesData';
import {
  OWNER_CONCENTRATION,
  VACANCY_BY_REGION,
  VACANCY_BY_TYPE,
  type LocacaoPropertyType,
  type LocacaoRegion,
  type PortfolioStatus,
  type PropertyPortfolioItem,
} from '../../data/locacaoData';
import type { AskAgentRequestPayload } from '../financeiro/AskAgentOrderDrawer';

interface LocacaoTabCarteiraProps {
  items: PropertyPortfolioItem[];
  perfil: PerfilRegra;
  readOnly: boolean;
  onOpenFicha: (item: PropertyPortfolioItem) => void;
  onAskAgent: (req: AskAgentRequestPayload) => void;
}

type FilterBucket = 'todos' | PortfolioStatus;

const SUMMARY_CARDS: {
  id: FilterBucket;
  label: string;
  countTotal: number;
  sub: string;
}[] = [
  { id: 'todos', label: 'Total carteira', countTotal: 412, sub: '100% administrados' },
  { id: 'Alugado', label: 'Alugados', countTotal: 384, sub: '93,2% ocupação física' },
  { id: 'Vago', label: 'Vagos', countTotal: 28, sub: '6,8% vacância (LOC-006)' },
  { id: 'Em rescisão', label: 'Em rescisão', countTotal: 3, sub: 'Pré-captação ativa' },
  { id: 'Em vistoria/reparo', label: 'Em vistoria/reparo', countTotal: 4, sub: '2 reparos > R$ 1.500' },
];

export function LocacaoTabCarteira({
  items,
  perfil,
  readOnly,
  onOpenFicha,
  onAskAgent,
}: LocacaoTabCarteiraProps) {
  const [bucket, setBucket] = useState<FilterBucket>('todos');
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState<LocacaoRegion | 'Todas'>('Todas');
  const [typeFilter, setTypeFilter] = useState<LocacaoPropertyType | 'Todos'>('Todos');
  const [corretorFilter, setCorretorFilter] = useState<string>('Todos');

  const isCorretor = perfil === 'Corretor';

  const scopedItems = useMemo(() => {
    if (isCorretor) {
      return items.filter((it) => it.corretor === 'Rafael Costa');
    }
    return items;
  }, [items, isCorretor]);

  const corretores = useMemo(() => {
    const set = new Set(scopedItems.map((it) => it.corretor));
    return ['Todos', ...Array.from(set)];
  }, [scopedItems]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return scopedItems.filter((it) => {
      if (bucket !== 'todos') {
        if (bucket === 'Vago') {
          const isVacantBucket =
            it.situacao === 'Vago' ||
            it.situacao === 'Em vistoria/reparo' ||
            (it.situacao === 'Captação em andamento' && it.diasVago > 0);
          if (!isVacantBucket) return false;
        } else if (it.situacao !== bucket) {
          return false;
        }
      }
      if (regionFilter !== 'Todas' && it.regiao !== regionFilter) return false;
      if (typeFilter !== 'Todos' && it.tipo !== typeFilter) return false;
      if (corretorFilter !== 'Todos' && it.corretor !== corretorFilter) return false;
      if (q) {
        const hay = `${it.codigo} ${it.endereco} ${it.proprietario} ${it.inquilino ?? ''} ${it.contratoNum ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [scopedItems, bucket, regionFilter, typeFilter, corretorFilter, search]);

  const getStatusBadgeStyle = (sit: PortfolioStatus) => {
    if (sit === 'Alugado') return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (sit === 'Vago') return 'bg-amber-50 text-amber-800 border-amber-200';
    if (sit === 'Em rescisão') return 'bg-red-50 text-red-700 border-red-200';
    if (sit === 'Em vistoria/reparo') return 'bg-amber-50 text-amber-900 border-amber-200';
    return 'bg-blue-50 text-[#2563EB] border-blue-200';
  };

  return (
    <div className="space-y-6">
      {/* 1. 5 Clickable summary cards */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {SUMMARY_CARDS.map((card) => {
          const isActive = bucket === card.id;
          const displayCount = isCorretor
            ? scopedItems.filter((it) =>
                card.id === 'todos'
                  ? true
                  : card.id === 'Vago'
                  ? it.situacao === 'Vago' || it.situacao === 'Em vistoria/reparo'
                  : it.situacao === card.id
              ).length
            : card.countTotal;

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => setBucket(card.id)}
              aria-pressed={isActive}
              className={`text-left rounded-xl border p-4 transition-colors ${
                isActive
                  ? 'border-[#2563EB] bg-[#EFF4FF]/60 ring-1 ring-[#2563EB]/25'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="text-[12px] font-semibold text-slate-600">{card.label}</div>
              <div className="text-[22px] font-bold text-slate-900 tabular-nums mt-0.5">
                {displayCount}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {isCorretor ? 'Na carteira de Rafael Costa' : card.sub}
              </div>
            </button>
          );
        })}
      </section>

      {/* 2. Toolbar & filters */}
      <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar código, imóvel, inquilino ou dono..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 bg-[#F8F9FB] text-[12.5px] text-slate-900 focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value as LocacaoRegion | 'Todas')}
              aria-label="Filtrar por região"
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-[12px] font-medium text-slate-700"
            >
              <option value="Todas">Todas regiões</option>
              <option value="Centro">Centro</option>
              <option value="Zona Norte">Zona Norte</option>
              <option value="Zona Sul">Zona Sul</option>
              <option value="Zona Leste">Zona Leste</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as LocacaoPropertyType | 'Todos')}
              aria-label="Filtrar por tipo"
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-[12px] font-medium text-slate-700"
            >
              <option value="Todos">Todos tipos</option>
              <option value="Apartamento">Apartamento</option>
              <option value="Casa">Casa</option>
              <option value="Sala/Loja">Sala/Loja</option>
            </select>

            {!isCorretor && (
              <select
                value={corretorFilter}
                onChange={(e) => setCorretorFilter(e.target.value)}
                aria-label="Filtrar por corretor"
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-[12px] font-medium text-slate-700"
              >
                {corretores.map((c) => (
                  <option key={c} value={c}>
                    {c === 'Todos' ? 'Todos corretores' : c}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12px] font-medium text-slate-500 tabular-nums">
              Exibindo {filtered.length} de {isCorretor ? scopedItems.length : 412} imóveis
            </span>
            {!readOnly && !isCorretor && (
              <button
                type="button"
                onClick={() =>
                  onAskAgent({
                    title: 'Cadastrar ou atualizar imóvel via documentos',
                    prefillText:
                      'Processar matrícula, IPTU e ficha de captação enviados no WhatsApp para atualizar a carteira sem cadastro manual.',
                    categoria: 'Cadastro e atualização',
                    subtipo: 'Cadastro de imóvel',
                    actionType: 'captar_imovel',
                    evalParams: { taxaAdmPct: 9, confiancaExtracao: 92 },
                  })
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5B3FD0] hover:bg-[#4C32B8] text-white text-[12px] font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pedir ao agente: cadastrar via PDF</span>
              </button>
            )}
          </div>
        </div>

        {/* Portfolio Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[12.5px]">
            <thead className="bg-[#F8F9FB] border-b border-slate-200 text-slate-500 font-semibold">
              <tr>
                <th className="px-4 py-2.5">Imóvel / código</th>
                <th className="px-3 py-2.5">Região / Tipo</th>
                <th className="px-3 py-2.5">Situação</th>
                <th className="px-3 py-2.5">Inquilino / Proprietário</th>
                <th className="px-3 py-2.5">Aluguel + encargos</th>
                <th className="px-3 py-2.5">Taxa adm</th>
                <th className="px-3 py-2.5">Contrato / Venc.</th>
                <th className="px-3 py-2.5">Corretor</th>
                <th className="px-3 py-2.5">Anunciado em</th>
                <th className="px-4 py-2.5 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-slate-500">
                    Nenhum imóvel encontrado com os filtros atuais.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] font-bold text-[#2563EB]">
                          {item.codigo}
                        </span>
                        <span className="text-[11px] text-slate-400">· {item.metragemM2} m²</span>
                      </div>
                      <div className="font-semibold text-slate-900">{item.endereco}</div>
                    </td>

                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="text-slate-800">{item.regiao}</div>
                      <div className="text-[11px] text-slate-500">{item.tipo}</div>
                    </td>

                    <td className="px-3 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-md border text-[11px] font-semibold ${getStatusBadgeStyle(
                          item.situacao
                        )}`}
                      >
                        {item.situacao}
                      </span>
                      {item.diasVago > 0 && (
                        <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
                          {item.diasVago} dias vago
                        </div>
                      )}
                    </td>

                    <td className="px-3 py-3">
                      <div className="text-slate-900 font-medium">
                        {item.inquilino ?? <span className="text-slate-400">Sem inquilino</span>}
                      </div>
                      <div className="text-[11px] text-slate-500">Dono: {item.proprietario}</div>
                    </td>

                    <td className="px-3 py-3 whitespace-nowrap tabular-nums">
                      <div className="font-bold text-slate-900">{formatBRL(item.aluguelValor)}</div>
                      <div className="text-[11px] text-slate-500">
                        + {formatBRL(item.condominioIptu)} enc.
                      </div>
                    </td>

                    <td className="px-3 py-3 whitespace-nowrap tabular-nums">
                      {isCorretor ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                          <Lock className="w-3 h-3" />
                          Restrito
                        </span>
                      ) : (
                        <span className="font-semibold text-slate-800">{item.taxaAdmPct}%</span>
                      )}
                    </td>

                    <td className="px-3 py-3 whitespace-nowrap">
                      {item.contratoNum ? (
                        <>
                          <div className="font-mono text-[11.5px] font-semibold text-slate-800">
                            {item.contratoNum}
                          </div>
                          <div className="text-[11px] text-slate-500 tabular-nums">
                            vence {item.vencimentoContrato}
                          </div>
                        </>
                      ) : (
                        <span className="text-[11.5px] text-slate-400">—</span>
                      )}
                    </td>

                    <td className="px-3 py-3 whitespace-nowrap text-slate-700">{item.corretor}</td>

                    <td className="px-3 py-3">
                      {item.anunciadoEm.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-[140px]">
                          {item.anunciadoEm.map((p) => (
                            <span
                              key={p}
                              className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10.5px] font-medium"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">Não anunciado</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onOpenFicha(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[12px] font-semibold text-[#2563EB]"
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Abrir ficha</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Distribuição por região / tipo + Concentração de proprietários */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <h3 className="text-[14px] font-bold text-slate-900">Distribuição por região (412)</h3>
          <div className="space-y-2.5">
            {VACANCY_BY_REGION.map((r) => {
              const pctCarteira = Math.round((r.total / 412) * 100);
              return (
                <div key={r.regiao} className="space-y-1">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-semibold text-slate-800">{r.regiao}</span>
                    <span className="tabular-nums text-slate-600">
                      {r.total} ({pctCarteira}%) · {r.vagos} vagos
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#2563EB]"
                      style={{ width: `${pctCarteira}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <h3 className="text-[14px] font-bold text-slate-900">Distribuição por tipo (412)</h3>
          <div className="space-y-2.5">
            {VACANCY_BY_TYPE.map((t) => {
              const pctCarteira = Math.round((t.total / 412) * 100);
              return (
                <div key={t.tipo} className="space-y-1">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-semibold text-slate-800">{t.tipo}</span>
                    <span className="tabular-nums text-slate-600">
                      {t.total} ({pctCarteira}%) · {t.vagos} vagos
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-slate-700"
                      style={{ width: `${pctCarteira}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[14px] font-bold text-slate-900">
              Concentração de proprietários
            </h3>
            <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
              Baixo risco
            </span>
          </div>

          {isCorretor ? (
            <div className="rounded-lg border border-slate-200 bg-[#F8F9FB] p-3.5 text-[12px] text-slate-600 flex items-start gap-2">
              <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <span>
                Visão consolidada de carteira por proprietário e participações financeiras restrita à gestão administrativa.
              </span>
            </div>
          ) : (
            <div className="space-y-2">
              {OWNER_CONCENTRATION.map((o) => (
                <div
                  key={o.proprietario}
                  className="flex items-center justify-between text-[12px] py-1 border-b border-slate-100 last:border-0"
                >
                  <span className="font-medium text-slate-800">{o.proprietario}</span>
                  <span className="tabular-nums text-slate-700">
                    <strong>{o.imoveis}</strong> imóveis ({o.participacaoPct.toFixed(1).replace('.', ',')}%)
                  </span>
                </div>
              ))}
              <p className="text-[11px] text-slate-500 pt-1 inline-flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                Maior proprietário representa apenas 2,2% da carteira total.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
