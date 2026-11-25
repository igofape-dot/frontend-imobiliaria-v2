import { useMemo } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Bot,
  ShieldCheck,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
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
import type { PerfilRegra } from '../../data/rulesData';
import {
  EXPIRING_GUARANTEES_LIST,
  GUARANTEES_SUMMARY_384,
} from '../../data/contratosData';
import type { AskAgentRequestPayload } from '../financeiro/AskAgentOrderDrawer';
import {
  AgentRegisteredTag,
  RuleAppliedChip,
  SemaphoreBadge,
} from '../financeiro/FinanceiroShared';

interface ContratosTabGarantiasProps {
  perfil: PerfilRegra;
  readOnly: boolean;
  onAskAgent: (req: AskAgentRequestPayload) => void;
  onOpenRuleById: (ruleId: string) => void;
  onOpenOrderInCenter: (orderId: string) => void;
}

export function ContratosTabGarantias({
  perfil,
  readOnly,
  onAskAgent,
  onOpenRuleById,
  onOpenOrderInCenter,
}: ContratosTabGarantiasProps) {
  const scopedList = useMemo(() => {
    if (perfil === 'Corretor') {
      return EXPIRING_GUARANTEES_LIST.filter(
        (g) => g.corretorResponsavel === 'Rafael Costa'
      );
    }
    return EXPIRING_GUARANTEES_LIST;
  }, [perfil]);

  return (
    <div className="space-y-5">
      {/* Top distribution cards (384 total) + Vencendo 60d + Sem garantia válida */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {GUARANTEES_SUMMARY_384.map((g) => (
          <div
            key={g.tipo}
            className="rounded-xl border border-slate-200 bg-white p-4 space-y-1"
          >
            <div className="text-[11px] font-semibold text-slate-500">{g.tipo}</div>
            <div className="text-[22px] font-bold text-slate-900 tabular-nums">
              {g.quantidade}
            </div>
            <div className="text-[11px] text-slate-500 tabular-nums">
              Inadimplência: <strong className="text-slate-700">{g.inadimplenciaPct.toFixed(1).replace('.', ',')}%</strong>
            </div>
          </div>
        ))}

        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-1">
          <div className="text-[11px] font-semibold text-amber-900">Vencendo em 60d</div>
          <div className="text-[22px] font-bold text-amber-900 tabular-nums">9</div>
          <div className="text-[11px] text-amber-800">6 seguros · 3 títulos</div>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50/60 p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-red-800">Sem garantia válida</span>
            <AlertOctagon className="w-3.5 h-3.5 text-red-600" />
          </div>
          <div className="text-[22px] font-bold text-red-700 tabular-nums">2</div>
          <div className="text-[11px] text-red-700 font-medium">Ação imediata (JUR-010)</div>
        </div>
      </div>

      {/* Chart + Agent reading */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-[15px] font-bold text-slate-900">
                Inadimplência por modalidade de garantia
              </h3>
              <p className="text-[12px] text-slate-500">
                Comparativo histórico dos 384 contratos ativos da carteira.
              </p>
            </div>
            <RuleAppliedChip ruleId="JUR-010" versao={2} onOpenRule={onOpenRuleById} />
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={GUARANTEES_SUMMARY_384} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="tipo" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  formatter={(v) => [`${Number(v ?? 0).toFixed(1).replace('.', ',')}%`, 'Inadimplência']}
                />
                <Bar dataKey="inadimplenciaPct" radius={[6, 6, 0, 0]}>
                  {GUARANTEES_SUMMARY_384.map((entry) => (
                    <Cell
                      key={entry.tipo}
                      fill={entry.inadimplenciaPct >= 5 ? '#D97706' : '#2563EB'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[13px] font-bold text-[#5B3FD0]">
              <Bot className="w-4 h-4" />
              Leitura do agente sobre garantias
            </div>
            <p className="text-[13px] text-slate-700 leading-relaxed">
              Contratos com <strong>Caução (5,4%)</strong> apresentam o dobro da inadimplência dos garantidos por{' '}
              <strong>Seguro fiança (2,7%)</strong>. Além disso, há <strong>2 contratos sem garantia válida</strong> (CT-2022-0190 e CT-2023-0745) que exigem substituição imediata.
            </p>
            <div className="rounded-lg border border-slate-200 bg-[#F8F9FB] p-3 text-[12px] text-slate-600 space-y-1">
              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Regra JUR-010 v2 em vigor
              </div>
              <p>
                Dispara alerta automático em D-60 antes do vencimento da apólice ou título e exige aprovação do Jurídico (24h) para qualquer troca de garantia.
              </p>
            </div>
          </div>

          {!readOnly && (
            <button
              type="button"
              onClick={() =>
                onAskAgent({
                  title: 'Relatório completo de garantias',
                  prefillText:
                    'Gerar relatório comparativo de risco por garantia (384 contratos), destacando os 2 contratos descobertos e os 9 vencimentos nos próximos 60 dias.',
                  categoria: 'Locação e contratos',
                  subtipo: 'Garantia locatícia',
                  actionType: 'alerta_garantia',
                  evalParams: { diasParaVencimentoGarantia: 30 },
                })
              }
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#5B3FD0] hover:bg-[#4c33b8] text-white text-[12px] font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Pedir ao agente: relatório de garantias
            </button>
          )}
        </div>
      </div>

      {/* Expiring / Uncovered Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-[14px] font-bold text-slate-900">
              Garantias vencendo em 60 dias ou sem cobertura ({scopedList.length})
            </h3>
            <p className="text-[12px] text-slate-500">
              Monitoramento contínuo pela regra JUR-010 v2.
            </p>
          </div>
          <AgentRegisteredTag label="Registrado pelo agente, fonte: seguradoras_nov26.pdf" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead className="bg-[#F8F9FB] border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Contrato</th>
                <th className="px-4 py-3 font-semibold">Imóvel / Locatário</th>
                <th className="px-4 py-3 font-semibold">Garantia</th>
                <th className="px-4 py-3 font-semibold">Vencimento</th>
                <th className="px-4 py-3 font-semibold">Situação (JUR-010)</th>
                <th className="px-4 py-3 font-semibold text-right">Ações ao agente</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {scopedList.map((g) => {
                const isUncovered = g.tipo === 'Sem garantia válida';
                return (
                  <tr key={g.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-bold text-slate-900 tabular-nums whitespace-nowrap">
                      <div>{g.contractNumber}</div>
                      {g.orderId && g.orderProtocol && (
                        <button
                          type="button"
                          onClick={() => onOpenOrderInCenter(g.orderId!)}
                          className="text-[11px] font-semibold text-[#2563EB] hover:underline"
                        >
                          {g.orderProtocol}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{g.locatario}</div>
                      <div className="text-[11px] text-slate-500">{g.imovel}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {isUncovered ? (
                        <SemaphoreBadge semaphore="vermelho" label="Sem garantia válida" />
                      ) : (
                        <span className="font-medium text-slate-800">{g.tipo}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 tabular-nums whitespace-nowrap">
                      <div className={isUncovered ? 'text-red-700 font-semibold' : 'text-slate-800'}>
                        {g.vencimento}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {g.diasRestantes >= 0 ? `em ${g.diasRestantes}d` : `expirada há ${Math.abs(g.diasRestantes)}d`}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold ${
                          g.situacaoJur010 === 'Descoberto'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : g.situacaoJur010 === 'Sem resposta'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-blue-50 text-[#2563EB] border-blue-200'
                        }`}
                      >
                        {g.situacaoJur010 === 'Descoberto' && <AlertTriangle className="w-3 h-3" />}
                        {g.situacaoJur010}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap space-x-2">
                      {!readOnly && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              onAskAgent({
                                title: `Renovar garantia · ${g.contractNumber}`,
                                prefillText: `Solicitar renovação imediata da garantia (${g.tipo}) do contrato ${g.contractNumber} (${g.locatario} · ${g.imovel}, vencimento ${g.vencimento}) conforme regra JUR-010.`,
                                categoria: 'Locação e contratos',
                                subtipo: 'Garantia locatícia',
                                actionType: 'alerta_garantia',
                                evalParams: { diasParaVencimentoGarantia: Math.max(0, g.diasRestantes) },
                              })
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#5B3FD0] hover:bg-[#4c33b8] text-white text-[11px] font-semibold"
                          >
                            <Sparkles className="w-3 h-3" />
                            Solicitar renovação
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onAskAgent({
                                title: `Propor troca de garantia · ${g.contractNumber}`,
                                prefillText: `Analisar documentação e propor troca de garantia do contrato ${g.contractNumber} (${g.locatario} · ${g.imovel}) para Fiador ou Seguro fiança, submetendo ao Jurídico pela JUR-010 v2.`,
                                categoria: 'Locação e contratos',
                                subtipo: 'Garantia locatícia',
                                actionType: 'troca_garantia',
                                evalParams: {},
                              })
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-700"
                          >
                            <RefreshCw className="w-3 h-3" />
                            Propor troca
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
