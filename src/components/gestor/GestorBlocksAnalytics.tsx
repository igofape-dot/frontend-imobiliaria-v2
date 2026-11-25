import { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Mail,
  Receipt,
  Sparkles,
  ArrowUpRight,
  Info,
  Clock,
  Lock,
} from 'lucide-react';
import { formatBRL, formatBRLCompact } from '../../data/financeiroData';
import type { NavItemId } from '../../data/navigation';
import type { PerfilRegra } from '../../data/rulesData';
import type { AskAgentRequestPayload } from '../financeiro/AskAgentOrderDrawer';
import {
  ADHOC_OVERDUE_CHARGES,
  EMAIL_AUTOMATION_7D,
  FINANCIAL_EVOLUTION_BY_RANGE,
  FISCAL_NOTES_7D,
  GENERATED_BILLING_BY_WINDOW,
  type AdhocOverdueCharge,
  type BillingWindowOption,
  type EmailAutomationDay,
  type FinancialEvolutionRange,
  type FiscalNoteDay,
  type GeneratedBillingItem,
} from '../../data/gestorData';

interface GestorBlocksAnalyticsProps {
  globalSearch: string;
  perfil: PerfilRegra;
  onSelectBillingItem: (item: GeneratedBillingItem) => void;
  onSelectEmailDay: (day: EmailAutomationDay) => void;
  onSelectFiscalDay: (day: FiscalNoteDay) => void;
  onSelectAdhocCharge: (charge: AdhocOverdueCharge) => void;
  onNavigateModule: (nav: NavItemId) => void;
  onAskAgent: (payload: AskAgentRequestPayload) => void;
}

type SeriesKey =
  | 'alugueisBrutos'
  | 'alugueisLiquidos'
  | 'mensalidadesGeradas'
  | 'taxaAdministrativa'
  | 'administracoesRecebidas'
  | 'taxaContrato';

const SERIES_META: {
  key: SeriesKey;
  label: string;
  color: string;
  kind: 'bar' | 'line';
}[] = [
  { key: 'mensalidadesGeradas', label: 'Mensalidades geradas', color: '#94A3B8', kind: 'bar' },
  { key: 'alugueisBrutos', label: 'Aluguéis brutos recebidos', color: '#2563EB', kind: 'line' },
  { key: 'alugueisLiquidos', label: 'Aluguéis líquidos recebidos', color: '#16A34A', kind: 'line' },
  { key: 'taxaAdministrativa', label: 'Taxa administrativa', color: '#5B3FD0', kind: 'line' },
  { key: 'administracoesRecebidas', label: 'Administrações recebidas', color: '#0EA5E9', kind: 'line' },
  { key: 'taxaContrato', label: 'Taxa de contrato', color: '#D97706', kind: 'line' },
];

interface TooltipPayloadEntry {
  dataKey?: string;
  name?: string;
  value?: number;
  color?: string;
}

function FinancialChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm text-[12px] min-w-[230px]">
      <div className="font-bold text-slate-900 pb-1.5 mb-1.5 border-b border-slate-100">
        Competência: {label}
      </div>
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={String(entry.dataKey)} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: entry.color }}
                aria-hidden="true"
              />
              <span className="truncate">{entry.name}</span>
            </span>
            <span className="font-semibold text-slate-900 tabular-nums">
              {formatBRL(Number(entry.value ?? 0))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function GestorBlocksAnalytics({
  globalSearch,
  perfil,
  onSelectBillingItem,
  onSelectEmailDay,
  onSelectFiscalDay,
  onSelectAdhocCharge,
  onNavigateModule,
  onAskAgent,
}: GestorBlocksAnalyticsProps) {
  const [evolutionRange, setEvolutionRange] = useState<FinancialEvolutionRange>('6m');
  const [activeSeries, setActiveSeries] = useState<Record<SeriesKey, boolean>>({
    mensalidadesGeradas: true,
    alugueisBrutos: true,
    alugueisLiquidos: true,
    taxaAdministrativa: true,
    administracoesRecebidas: true,
    taxaContrato: true,
  });
  const [billingWindow, setBillingWindow] = useState<BillingWindowOption>('24h');

  const evolutionData = FINANCIAL_EVOLUTION_BY_RANGE[evolutionRange];
  const billingData = GENERATED_BILLING_BY_WINDOW[billingWindow];

  const filteredBillingItems = billingData.items.filter((item) => {
    const q = globalSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      item.contrato.toLowerCase().includes(q) ||
      item.imovel.toLowerCase().includes(q) ||
      item.inquilino.toLowerCase().includes(q)
    );
  });

  const filteredAdhoc = ADHOC_OVERDUE_CHARGES.filter((c) => {
    const q = globalSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      c.contrato.toLowerCase().includes(q) ||
      c.imovel.toLowerCase().includes(q) ||
      c.responsavelCobranca.toLowerCase().includes(q) ||
      c.origem.toLowerCase().includes(q)
    );
  });

  const totalEmails7d = EMAIL_AUTOMATION_7D.reduce((acc, d) => acc + d.enviados, 0);
  const totalEmailFailures7d = EMAIL_AUTOMATION_7D.reduce((acc, d) => acc + d.naoEnviados, 0);

  const totalFiscalGenerated = FISCAL_NOTES_7D.reduce((acc, d) => acc + d.geradas, 0);
  const totalFiscalIssued = FISCAL_NOTES_7D.reduce((acc, d) => acc + d.emitidas, 0);
  const totalFiscalPending = FISCAL_NOTES_7D.reduce((acc, d) => acc + d.pendentes, 0);
  const totalFiscalErrors = FISCAL_NOTES_7D.reduce((acc, d) => acc + d.erros, 0);

  const toggleSeries = (key: SeriesKey) => {
    const activeCount = Object.values(activeSeries).filter(Boolean).length;
    if (activeSeries[key] && activeCount <= 1) return;
    setActiveSeries((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isFinancialRestricted = perfil === 'Corretor';

  return (
    <div className="space-y-6">
      {/* ===================================================================== */}
      {/* BLOCO 7 — EVOLUÇÃO FINANCEIRA                                         */}
      {/* ===================================================================== */}
      <section
        aria-labelledby="bloco-7-evolucao"
        className="bg-white rounded-xl border border-slate-200/90 p-5 space-y-4"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 id="bloco-7-evolucao" className="text-[15px] font-bold text-slate-900">
              7. Evolução financeira mensal
            </h2>
            <p className="text-[12px] text-slate-500 mt-0.5">
              Séries contábeis independentes: aluguéis brutos, líquidos, taxas e mensalidades geradas.
            </p>
          </div>

          <div
            role="group"
            aria-label="Período da evolução financeira"
            className="inline-flex items-center p-1 rounded-xl bg-[#F8F9FB] border border-slate-200 self-start md:self-auto"
          >
            {(
              [
                { id: '6m', label: 'Jun–Nov 2026' },
                { id: '12m', label: '12 meses' },
                { id: '1sem', label: '1º Sem 2026' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setEvolutionRange(opt.id)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                  evolutionRange === opt.id
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {isFinancialRestricted ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 flex items-center gap-3 text-[13px] text-slate-700">
            <Lock className="w-5 h-5 text-amber-700 shrink-0" />
            <span>
              Indicadores consolidados de receita da imobiliária são restritos aos perfis Gestor, Financeiro e Jurídico.
            </span>
          </div>
        ) : (
          <>
            {/* Interactive legend / independent series toggles */}
            <div className="flex flex-wrap items-center gap-2">
              {SERIES_META.map((s) => {
                const enabled = activeSeries[s.key];
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => toggleSeries(s.key)}
                    aria-pressed={enabled}
                    className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border text-[12px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                      enabled
                        ? 'bg-white border-slate-300 text-slate-800'
                        : 'bg-[#F8F9FB] border-slate-200 text-slate-400'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-sm shrink-0"
                      style={{ backgroundColor: enabled ? s.color : '#CBD5E1' }}
                      aria-hidden="true"
                    />
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="h-[310px] w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={evolutionData} margin={{ top: 10, right: 16, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis
                    dataKey="mes"
                    tick={{ fontSize: 12, fill: '#64748B' }}
                    axisLine={{ stroke: '#CBD5E1' }}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) => formatBRLCompact(Number(v))}
                    tick={{ fontSize: 11.5, fill: '#64748B' }}
                    axisLine={false}
                    tickLine={false}
                    width={84}
                  />
                  <Tooltip content={<FinancialChartTooltip />} />
                  {activeSeries.mensalidadesGeradas && (
                    <Bar
                      dataKey="mensalidadesGeradas"
                      name="Mensalidades geradas"
                      fill="#94A3B8"
                      fillOpacity={0.32}
                      radius={[6, 6, 0, 0]}
                      barSize={28}
                    />
                  )}
                  {activeSeries.alugueisBrutos && (
                    <Line
                      type="monotone"
                      dataKey="alugueisBrutos"
                      name="Aluguéis brutos recebidos"
                      stroke="#2563EB"
                      strokeWidth={2.5}
                      dot={{ r: 3.5 }}
                      activeDot={{ r: 5 }}
                    />
                  )}
                  {activeSeries.alugueisLiquidos && (
                    <Line
                      type="monotone"
                      dataKey="alugueisLiquidos"
                      name="Aluguéis líquidos recebidos"
                      stroke="#16A34A"
                      strokeWidth={2.5}
                      dot={{ r: 3.5 }}
                    />
                  )}
                  {activeSeries.taxaAdministrativa && (
                    <Line
                      type="monotone"
                      dataKey="taxaAdministrativa"
                      name="Taxa administrativa"
                      stroke="#5B3FD0"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  )}
                  {activeSeries.administracoesRecebidas && (
                    <Line
                      type="monotone"
                      dataKey="administracoesRecebidas"
                      name="Administrações recebidas"
                      stroke="#0EA5E9"
                      strokeWidth={2}
                      strokeDasharray="4 3"
                      dot={{ r: 3 }}
                    />
                  )}
                  {activeSeries.taxaContrato && (
                    <Line
                      type="monotone"
                      dataKey="taxaContrato"
                      name="Taxa de contrato"
                      stroke="#D97706"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-lg border border-slate-200/80 bg-[#F8F9FB] px-3.5 py-2 text-[11.5px] text-slate-600 flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
              <span>
                Séries mantidas independentes por natureza contábil (faturado, recebido bruto, líquido repassável e receitas de administração/contrato).
              </span>
            </div>
          </>
        )}
      </section>

      {/* ===================================================================== */}
      {/* BLOCO 8 — MENSALIDADES GERADAS                                        */}
      {/* ===================================================================== */}
      {!isFinancialRestricted && (
        <section
          aria-labelledby="bloco-8-mensalidades"
          className="bg-white rounded-xl border border-slate-200/90 overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="bloco-8-mensalidades" className="text-[15px] font-bold text-slate-900">
                  8. Mensalidades geradas
                </h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-[#2563EB] border border-blue-200 text-[11.5px] font-bold tabular-nums">
                  {billingData.totalCount} registros
                </span>
              </div>
              <p className="text-[12px] text-slate-500 mt-0.5 tabular-nums">
                Intervalo consultado: <strong className="text-slate-800">{billingData.intervalLabel}</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-4 text-[12px] tabular-nums">
                <div>
                  <span className="text-slate-500">Gerado: </span>
                  <strong className="text-slate-900">{formatBRL(billingData.totalGenerated)}</strong>
                </div>
                <span className="text-slate-300">|</span>
                <div>
                  <span className="text-slate-500">Já recebido: </span>
                  <strong className="text-emerald-700">{formatBRL(billingData.totalReceived)}</strong>
                </div>
              </div>

              <div className="inline-flex items-center p-1 rounded-lg bg-[#F8F9FB] border border-slate-200">
                {(
                  [
                    { id: '24h', label: 'Últimas 24h' },
                    { id: '7d', label: '7 dias' },
                    { id: 'mes', label: 'Mês' },
                  ] as const
                ).map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setBillingWindow(w.id)}
                    className={`px-2.5 py-1 rounded-md text-[11.5px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                      billingWindow === w.id
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8F9FB] border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                  <th className="py-2.5 px-4">Vencimento</th>
                  <th className="py-2.5 px-3">Contrato</th>
                  <th className="py-2.5 px-3">Endereço do imóvel</th>
                  <th className="py-2.5 px-3">Inquilino</th>
                  <th className="py-2.5 px-3">Situação (Gerada × Recebida)</th>
                  <th className="py-2.5 px-4 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[12.5px]">
                {filteredBillingItems.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => onSelectBillingItem(item)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-4 tabular-nums whitespace-nowrap text-slate-900 font-medium">
                      {item.vencimento}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#2563EB] whitespace-nowrap">
                      {item.contrato}
                    </td>
                    <td className="py-2.5 px-3 text-slate-800 max-w-[230px] truncate">
                      {item.imovel}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">
                      {item.inquilino}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold ${
                          item.status === 'Gerada · recebida'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {item.status === 'Gerada · recebida' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {item.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold text-slate-900 tabular-nums whitespace-nowrap">
                      {formatBRL(item.valor)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ===================================================================== */}
      {/* BLOCO 9 & BLOCO 10 — COMUNICAÇÃO AUTOMATIZADA + NOTAS FISCAIS         */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* BLOCO 9 — Comunicação automatizada (E-mails últimos 7 dias) */}
        <section
          aria-labelledby="bloco-9-comunicacao"
          className="xl:col-span-5 bg-white rounded-xl border border-slate-200/90 overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#2563EB]" />
                <h2 id="bloco-9-comunicacao" className="text-[15px] font-bold text-slate-900">
                  9. Comunicação automatizada
                </h2>
              </div>
              <p className="text-[12px] text-slate-500 mt-0.5 tabular-nums">
                E-mails automáticos (7 dias): <strong className="text-slate-900">{totalEmails7d.toLocaleString('pt-BR')} enviados</strong> ·{' '}
                <strong className="text-red-700">{totalEmailFailures7d} não enviados</strong>
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8F9FB] border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                  <th className="py-2.5 px-4">Dia</th>
                  <th className="py-2.5 px-3 text-right">Enviados</th>
                  <th className="py-2.5 px-3 text-right">Não enviados</th>
                  <th className="py-2.5 px-4 text-right">Situação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[12.5px]">
                {EMAIL_AUTOMATION_7D.map((d) => {
                  const hasFail = d.naoEnviados > 0;
                  return (
                    <tr
                      key={d.id}
                      onClick={() => onSelectEmailDay(d)}
                      className={`cursor-pointer transition-colors ${
                        hasFail ? 'bg-red-50/25 hover:bg-red-50/50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-2.5 px-4 font-medium text-slate-900 tabular-nums whitespace-nowrap">
                        {d.dia}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-slate-900 tabular-nums">
                        {d.enviados}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-bold tabular-nums ${
                          hasFail ? 'text-red-700' : 'text-slate-400'
                        }`}
                      >
                        {d.naoEnviados}
                      </td>
                      <td className="py-2.5 px-4 text-right whitespace-nowrap">
                        {hasFail ? (
                          <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-red-700">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Investigar
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            100%
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-2.5 bg-[#F8F9FB] border-t border-slate-100 text-[11.5px] text-slate-500">
            Escopo atual: e-mails transacionais. Telemetria de WhatsApp prevista em etapa futura do módulo.
          </div>
        </section>

        {/* BLOCO 10 — Notas fiscais (últimos 7 dias) */}
        <section
          aria-labelledby="bloco-10-notas"
          className="xl:col-span-7 bg-white rounded-xl border border-slate-200/90 overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#2563EB]" />
                <h2 id="bloco-10-notas" className="text-[15px] font-bold text-slate-900">
                  10. Emissão de notas fiscais (7 dias)
                </h2>
              </div>
              <p className="text-[12px] text-slate-500 mt-0.5 tabular-nums">
                Geradas (RPS): <strong className="text-slate-900">{totalFiscalGenerated}</strong> · Emitidas (NFSe):{' '}
                <strong className="text-emerald-700">{totalFiscalIssued}</strong> · Pendentes:{' '}
                <strong className="text-amber-800">{totalFiscalPending}</strong> · Erros:{' '}
                <strong className="text-red-700">{totalFiscalErrors}</strong>
              </p>
            </div>

            {totalFiscalErrors > 0 && (
              <button
                type="button"
                onClick={() =>
                  onAskAgent({
                    title: 'Tratar notas fiscais com erro (7 dias)',
                    prefillText: `Diagnosticar os ${totalFiscalErrors} erros de emissão de NFSe nos últimos 7 dias, validar Inscrição Municipal/CNPJ dos tomadores e reenviar lotes à prefeitura.`,
                    categoria: 'Cobrança e financeiro',
                    subtipo: 'Repasse',
                    actionType: 'conciliacao',
                    evalParams: { conciliado: false, diferenca: 0 },
                  })
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F3F0FF] hover:bg-[#EDE9FE] text-[#5B3FD0] text-[12px] font-semibold whitespace-nowrap shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pedir ao agente</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8F9FB] border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                  <th className="py-2.5 px-4">Dia</th>
                  <th className="py-2.5 px-3 text-right">Geradas</th>
                  <th className="py-2.5 px-3 text-right">Pendentes</th>
                  <th className="py-2.5 px-3 text-right">Emitidas</th>
                  <th className="py-2.5 px-3 text-right">Erros</th>
                  <th className="py-2.5 px-4 text-right">Detalhe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[12.5px]">
                {FISCAL_NOTES_7D.map((d) => {
                  const hasError = d.erros > 0;
                  const hasPending = d.pendentes > 0;
                  return (
                    <tr
                      key={d.id}
                      onClick={() => onSelectFiscalDay(d)}
                      className={`cursor-pointer transition-colors ${
                        hasError ? 'bg-red-50/25 hover:bg-red-50/50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-2.5 px-4 font-medium text-slate-900 tabular-nums whitespace-nowrap">
                        {d.dia}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-slate-900 tabular-nums">
                        {d.geradas}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-semibold tabular-nums ${
                          hasPending ? 'text-amber-800' : 'text-slate-400'
                        }`}
                      >
                        {d.pendentes}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-emerald-700 tabular-nums">
                        {d.emitidas}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-bold tabular-nums ${
                          hasError ? 'text-red-700' : 'text-slate-400'
                        }`}
                      >
                        {d.erros}
                      </td>
                      <td className="py-2.5 px-4 text-right whitespace-nowrap">
                        {hasError ? (
                          <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-red-700">
                            <AlertOctagon className="w-3.5 h-3.5" />
                            Ver erro
                          </span>
                        ) : hasPending ? (
                          <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-amber-800">
                            <Clock className="w-3.5 h-3.5" />
                            Fila
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Regular
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-2.5 bg-[#F8F9FB] border-t border-slate-100 text-[11.5px] text-slate-500">
            Geração de RPS e emissão efetiva da NFSe na prefeitura são monitoradas como estados independentes.
          </div>
        </section>
      </div>

      {/* ===================================================================== */}
      {/* BLOCO 11 — COBRANÇAS AVULSAS ATRASADAS (3 registros)                  */}
      {/* ===================================================================== */}
      {!isFinancialRestricted && (
        <section
          aria-labelledby="bloco-11-avulsas"
          className="bg-white rounded-xl border border-slate-200/90 overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 id="bloco-11-avulsas" className="text-[15px] font-bold text-slate-900">
                  11. Cobranças avulsas atrasadas
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[11.5px] font-bold tabular-nums">
                  <AlertTriangle className="w-3 h-3" />
                  {ADHOC_OVERDUE_CHARGES.length} registros
                </span>
              </div>
              <p className="text-[12px] text-slate-500 mt-0.5">
                Lançamentos extras fora da mensalidade normal do aluguel (reembolsos, reparos de vistoria e multas).
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigateModule('financeiro')}
              className="inline-flex items-center gap-1 text-[12px] font-medium text-[#2563EB] hover:underline whitespace-nowrap shrink-0"
            >
              <span>Gerir cobranças no Financeiro</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8F9FB] border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                  <th className="py-2.5 px-4">Contrato</th>
                  <th className="py-2.5 px-3">Imóvel</th>
                  <th className="py-2.5 px-3">Responsável pela cobrança</th>
                  <th className="py-2.5 px-3">Origem</th>
                  <th className="py-2.5 px-3">Vencimento</th>
                  <th className="py-2.5 px-4 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[12.5px]">
                {filteredAdhoc.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => onSelectAdhocCharge(c)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <div className="font-mono font-bold text-[#2563EB]">{c.contrato}</div>
                      <div className="text-[11px] text-slate-500">{c.situacao}</div>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900 whitespace-nowrap">
                      {c.imovel}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">
                      {c.responsavelCobranca}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 max-w-[260px] truncate">
                      {c.origem}
                    </td>
                    <td className="py-2.5 px-3 tabular-nums whitespace-nowrap">
                      <span className="text-slate-900">{c.vencimento}</span>
                      <span className="ml-1.5 text-[11px] font-semibold text-red-700">
                        ({c.diasAtraso}d)
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold text-red-700 tabular-nums whitespace-nowrap">
                      {formatBRL(c.valor)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
