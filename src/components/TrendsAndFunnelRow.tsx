import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Sparkles, Bot, AlertTriangle, RotateCcw } from 'lucide-react';
import type {
  FunnelStageItem,
  MonthlyTrendPoint,
  TrendTabId,
} from '../data/commandCenterData';

interface TrendsAndFunnelRowProps {
  monthlyTrends: MonthlyTrendPoint[];
  funnelStages: FunnelStageItem[];
  isLoading: boolean;
  hasError?: boolean;
  onRetry?: () => void;
  onTriggerAgentCommand: (commandText: string) => void;
}

const TREND_TABS: { id: TrendTabId; label: string }[] = [
  { id: 'receita', label: 'Receita' },
  { id: 'vacancia', label: 'Vacância' },
  { id: 'inadimplencia', label: 'Inadimplência' },
];

export function TrendsAndFunnelRow({
  monthlyTrends,
  funnelStages,
  isLoading,
  hasError = false,
  onRetry,
  onTriggerAgentCommand,
}: TrendsAndFunnelRowProps) {
  const [activeTab, setActiveTab] = useState<TrendTabId>('receita');

  const metaValue =
    activeTab === 'receita'
      ? 200000
      : activeTab === 'vacancia'
      ? 5.0
      : 4.0;

  const metaLabel =
    activeTab === 'receita'
      ? 'Meta R$ 200 mil'
      : activeTab === 'vacancia'
      ? 'Meta ≤ 5,0%'
      : 'Meta ≤ 4,0%';

  const chartColor =
    activeTab === 'receita'
      ? '#2563EB'
      : activeTab === 'vacancia'
      ? '#D97706'
      : '#DC2626';

  const maxFunnelCount = funnelStages[0]?.count || 1;
  const bottleneckStage = funnelStages.find((s) => s.isBottleneck);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
      {/* Left 2/3: 12-month trend chart with dashed target line */}
      <section
        aria-labelledby="heading-tendencia-12m"
        className="lg:col-span-8 bg-white rounded-xl border border-slate-200/90 p-5 flex flex-col justify-between"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 id="heading-tendencia-12m" className="text-[15px] font-semibold text-slate-900">
              Evolução em 12 meses vs. meta
            </h2>
            <p className="text-[12px] text-slate-500 mt-0.5 inline-flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-[#5B3FD0]" />
              <span>Registrado pelo agente · Linha tracejada indica {metaLabel}</span>
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Indicador do gráfico de 12 meses"
            className="inline-flex items-center p-1 rounded-lg bg-[#F8F9FB] border border-slate-200/80"
          >
            {TREND_TABS.map((tab) => {
              const selected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1 rounded-md text-[12px] font-medium transition-colors whitespace-nowrap ${
                    selected
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200/70'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {isLoading ? (
          <div className="h-[230px] bg-slate-100 rounded-xl animate-pulse" aria-busy="true" />
        ) : hasError ? (
          <div className="h-[230px] flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50/40 text-center p-4">
            <AlertTriangle className="w-6 h-6 text-red-600 mb-2" />
            <p className="text-[13px] font-semibold text-slate-900">
              Erro ao carregar série de 12 meses
            </p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-[12px] font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Recarregar
              </button>
            )}
          </div>
        ) : (
          <div className="h-[230px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlyTrends}
                margin={{ top: 10, right: 16, left: 4, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F6" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                  width={56}
                  tickFormatter={(val: number) =>
                    activeTab === 'receita'
                      ? `R$${Math.round(val / 1000)}k`
                      : `${val.toFixed(1).replace('.', ',')}%`
                  }
                />
                <Tooltip
                  formatter={(val) => {
                    const num = typeof val === 'number' ? val : Number(val ?? 0);
                    if (activeTab === 'receita') {
                      return [
                        num.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                          maximumFractionDigits: 0,
                        }),
                        'Receita',
                      ];
                    }
                    return [
                      `${num.toFixed(1).replace('.', ',')}%`,
                      activeTab === 'vacancia' ? 'Vacância' : 'Inadimplência',
                    ];
                  }}
                  contentStyle={{
                    fontSize: '12px',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                  }}
                />
                <ReferenceLine
                  y={metaValue}
                  stroke="#94A3B8"
                  strokeDasharray="5 5"
                  label={{
                    value: metaLabel,
                    position: 'insideTopRight',
                    fill: '#475569',
                    fontSize: 11,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey={activeTab}
                  stroke={chartColor}
                  strokeWidth={2.4}
                  dot={{ r: 3, fill: chartColor, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: chartColor }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[12px] text-slate-600">
            {activeTab === 'receita'
              ? 'Projeção do agente: R$ 196.800 no fechamento se 2 escrituras forem assinadas.'
              : activeTab === 'vacancia'
              ? 'Tendência de alta nos últimos 3 meses concentrada em imóveis acima da mediana.'
              : 'Curva subiu +2,7 p.p. desde abril em contratos garantidos por caução.'}
          </span>
          <button
            type="button"
            onClick={() =>
              onTriggerAgentCommand(
                activeTab === 'receita'
                  ? 'Simular plano para atingir R$ 200.000 de receita ainda este mês'
                  : activeTab === 'vacancia'
                  ? 'Listar imóveis vagos com sugestão de ajuste de valor para reduzir vacância para 5%'
                  : 'Gerar plano de cobrança e troca de garantia para reduzir inadimplência abaixo de 4%'
              )
            }
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#5B3FD0] hover:text-[#4C32B8]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pedir plano ao agente</span>
          </button>
        </div>
      </section>

      {/* Right 1/3: Commercial Funnel with stage conversions and bottleneck highlight */}
      <section
        aria-labelledby="heading-funil-comercial"
        className="lg:col-span-4 bg-white rounded-xl border border-slate-200/90 p-5 flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-4">
            <div>
              <h2
                id="heading-funil-comercial"
                className="text-[15px] font-semibold text-slate-900"
              >
                Funil comercial
              </h2>
              <p className="text-[12px] text-slate-500 mt-0.5">
                Lead → Visita → Proposta → Fechamento
              </p>
            </div>
            <span className="text-[11px] font-medium text-[#5B3FD0]">IA</span>
          </div>

          {isLoading ? (
            <div className="space-y-3 animate-pulse" aria-busy="true">
              {[1, 2, 3, 4].map((idx) => (
                <div key={idx} className="h-11 bg-slate-100 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {funnelStages.map((stage) => {
                const widthPct = Math.max(14, Math.round((stage.count / maxFunnelCount) * 100));
                return (
                  <div
                    key={stage.id}
                    className={`rounded-lg p-2.5 border ${
                      stage.isBottleneck
                        ? 'border-amber-300 bg-amber-50/50'
                        : 'border-slate-200/70 bg-[#F8F9FB]/70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-[12.5px]">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">
                          {stage.label}
                        </span>
                        {stage.isBottleneck && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold">
                            <AlertTriangle className="w-3 h-3" />
                            Onde mais trava
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 tabular-nums">
                        {typeof stage.conversionFromPrev === 'number' && (
                          <span
                            className={`text-[11px] font-semibold ${
                              stage.isBottleneck ? 'text-amber-800' : 'text-slate-500'
                            }`}
                          >
                            {stage.conversionFromPrev.toFixed(1).replace('.', ',')}% conv.
                          </span>
                        )}
                        <strong className="font-bold text-slate-900 text-[13.5px]">
                          {stage.count}
                        </strong>
                      </div>
                    </div>

                    <div className="mt-1.5 h-2 rounded-full bg-white border border-slate-200/70 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          stage.isBottleneck ? 'bg-amber-500' : 'bg-[#2563EB]'
                        }`}
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-500 inline-flex items-center gap-1">
            <Bot className="w-3 h-3 text-[#5B3FD0]" />
            Registrado pelo agente
          </span>
          <button
            type="button"
            onClick={() =>
              onTriggerAgentCommand(
                `Analisar visitas sem proposta (${bottleneckStage?.label ?? 'Proposta'}) e enviar follow-up automático aos clientes`
              )
            }
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#5B3FD0] hover:text-[#4C32B8]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Destravar etapa</span>
          </button>
        </div>
      </section>
    </div>
  );
}
