import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
} from 'recharts';
import {
  CheckCircle2,
  Clock,
  RotateCcw,
  Star,
  AlertTriangle,
  Bot,
} from 'lucide-react';
import {
  PERFORMANCE_BY_CATEGORY,
  PERFORMANCE_BY_CHANNEL,
  PERFORMANCE_DAILY_30D,
  PERFORMANCE_STAGE_TIMES,
} from '../../data/agentOrdersData';

interface PerformanceTabProps {
  isLoading: boolean;
  hasError?: boolean;
  onRetry?: () => void;
}

export function PerformanceTab({
  isLoading,
  hasError = false,
  onRetry,
}: PerformanceTabProps) {
  if (isLoading) {
    return (
      <div className="space-y-5 animate-pulse" aria-busy="true" aria-label="Carregando desempenho">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((idx) => (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5 h-28" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5 h-72" />
          <div className="bg-white rounded-xl border border-slate-200 p-5 h-72" />
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
        <AlertTriangle className="w-7 h-7 text-red-600 mx-auto mb-2" />
        <h3 className="text-[14px] font-semibold text-slate-900">
          Erro ao carregar indicadores de desempenho
        </h3>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 text-[12.5px] font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Tentar novamente
          </button>
        )}
      </div>
    );
  }

  const maxChannelCount = Math.max(...PERFORMANCE_BY_CHANNEL.map((c) => c.count), 1);

  return (
    <div className="space-y-5">
      {/* Top 4 KPI cards */}
      <section
        aria-label="Métricas principais de desempenho do agente"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        <div className="bg-white rounded-xl border border-slate-200/90 p-5">
          <div className="flex items-center justify-between text-[12.5px] font-medium text-slate-600">
            <span>% de SLA cumprido</span>
            <Clock className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div className="text-[26px] font-bold text-slate-900 mt-1.5 tabular-nums">89,4%</div>
          <div className="mt-1.5 flex items-center gap-1.5 text-[11.5px] text-emerald-700 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>+2,1 p.p. vs. 30 dias anteriores</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-5">
          <div className="flex items-center justify-between text-[12.5px] font-medium text-slate-600">
            <span>Taxa de aceite na 1ª entrega</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-[26px] font-bold text-slate-900 mt-1.5 tabular-nums">91,0%</div>
          <div className="mt-1.5 text-[11.5px] text-slate-500">
            Sem necessidade de ajuste ou reabertura
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-5">
          <div className="flex items-center justify-between text-[12.5px] font-medium text-slate-600">
            <span>Reaberturas</span>
            <RotateCcw className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-[26px] font-bold text-slate-900 mt-1.5 tabular-nums">4,2%</div>
          <div className="mt-1.5 text-[11.5px] text-slate-500 tabular-nums">
            16 pedidos entraram em Ciclo 2 nos últimos 30d
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-5">
          <div className="flex items-center justify-between text-[12.5px] font-medium text-slate-600">
            <span>Satisfação média</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
          </div>
          <div className="text-[26px] font-bold text-slate-900 mt-1.5 tabular-nums">4,8 / 5,0</div>
          <div className="mt-1.5 text-[11.5px] text-slate-500 tabular-nums">
            Base de 284 avaliações registradas no aceite
          </div>
        </div>
      </section>

      {/* Row 2: Tempo médio por etapa (barras horizontais) + Volume por canal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <section
          aria-labelledby="perf-stage-heading"
          className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 p-5 flex flex-col justify-between"
        >
          <div className="mb-3">
            <h3 id="perf-stage-heading" className="text-[15px] font-semibold text-slate-900">
              Tempo médio por etapa
            </h3>
            <p className="text-[12px] text-slate-500 mt-0.5">
              Ciclo médio total de 3h40 (em minutos por etapa)
            </p>
          </div>

          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={PERFORMANCE_STAGE_TIMES}
                layout="vertical"
                margin={{ top: 4, right: 24, left: 12, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F6" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                  unit="m"
                />
                <YAxis
                  type="category"
                  dataKey="stage"
                  width={185}
                  tick={{ fontSize: 11.5, fill: '#334155' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(val) => [`${val} min`, 'Tempo médio']}
                  contentStyle={{
                    fontSize: '12px',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                  }}
                />
                <Bar dataKey="minutes" fill="#2563EB" radius={[0, 6, 6, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section
          aria-labelledby="perf-channel-heading"
          className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 p-5 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div>
                <h3 id="perf-channel-heading" className="text-[15px] font-semibold text-slate-900">
                  Volume por canal
                </h3>
                <p className="text-[12px] text-slate-500 mt-0.5">
                  391 pedidos nos últimos 30 dias · SLA por canal
                </p>
              </div>
              <Bot className="w-4 h-4 text-[#5B3FD0]" />
            </div>

            <div className="space-y-3">
              {PERFORMANCE_BY_CHANNEL.map((row) => {
                const widthPct = Math.round((row.count / maxChannelCount) * 100);
                return (
                  <div key={row.channel} className="space-y-1">
                    <div className="flex items-center justify-between text-[12.5px]">
                      <span className="font-medium text-slate-800">{row.channel}</span>
                      <div className="flex items-center gap-3 tabular-nums">
                        <span className="text-[11.5px] text-slate-500">SLA {row.slaPct}%</span>
                        <strong className="font-semibold text-slate-900">{row.count}</strong>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-[#F8F9FB] border border-slate-200/70 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#2563EB]"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* Row 3: Volume por categoria + Volume diário 30 dias */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <section
          aria-labelledby="perf-category-heading"
          className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 p-5"
        >
          <div className="mb-3">
            <h3 id="perf-category-heading" className="text-[15px] font-semibold text-slate-900">
              Volume por categoria
            </h3>
            <p className="text-[12px] text-slate-500 mt-0.5">
              Distribuição das 9 categorias operacionais (30d)
            </p>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={PERFORMANCE_BY_CATEGORY}
                layout="vertical"
                margin={{ top: 4, right: 20, left: 4, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F6" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  width={165}
                  tick={{ fontSize: 11, fill: '#334155' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(val) => [`${val} pedidos`, 'Volume']}
                  contentStyle={{
                    fontSize: '12px',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                  }}
                />
                <Bar dataKey="count" fill="#5B3FD0" radius={[0, 5, 5, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section
          aria-labelledby="perf-daily-heading"
          className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 p-5"
        >
          <div className="mb-3">
            <h3 id="perf-daily-heading" className="text-[15px] font-semibold text-slate-900">
              Volume diário dos últimos 30 dias
            </h3>
            <p className="text-[12px] text-slate-500 mt-0.5">
              Pedidos recebidos vs. concluídos por dia
            </p>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={PERFORMANCE_DAILY_30D}
                margin={{ top: 8, right: 12, left: -12, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F6" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10.5, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                  interval={4}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: '12px',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="pedidos"
                  name="Recebidos"
                  stroke="#2563EB"
                  fill="#EFF4FF"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="concluidos"
                  name="Concluídos"
                  stroke="#16A34A"
                  fill="#ECFDF5"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}
