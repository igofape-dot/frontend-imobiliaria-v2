import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Bot, Clock, AlertCircle, RotateCcw } from 'lucide-react';
import type { AgentHealthStats } from '../data/commandCenterData';

interface AgentHealthCardProps {
  health: AgentHealthStats;
  waitingCount: number;
  runningCount: number;
  isLoading: boolean;
  hasError?: boolean;
  onRetry?: () => void;
}

export function AgentHealthCard({
  health,
  waitingCount,
  runningCount,
  isLoading,
  hasError = false,
  onRetry,
}: AgentHealthCardProps) {
  const totalProcessing = health.processingCount + runningCount;

  return (
    <section
      aria-labelledby="heading-saude-agente"
      className="bg-white rounded-xl border border-slate-200/90 p-5 flex flex-col justify-between h-full"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <h2 id="heading-saude-agente" className="text-[15px] font-semibold text-slate-900">
              Saúde do agente
            </h2>
            <span className="text-[10.5px] font-semibold text-[#5B3FD0] bg-[#F3F0FF] px-1.5 py-0.5 rounded">
              IA
            </span>
          </div>
          <span className="text-[11.5px] text-slate-500">Últimos 7 dias</span>
        </div>

        {isLoading ? (
          <div className="space-y-4 animate-pulse" aria-busy="true">
            <div className="h-12 w-36 bg-slate-200 rounded-lg" />
            <div className="grid grid-cols-2 gap-2.5">
              <div className="h-14 bg-slate-100 rounded-lg" />
              <div className="h-14 bg-slate-100 rounded-lg" />
            </div>
            <div className="space-y-2">
              <div className="h-8 bg-slate-100 rounded-lg" />
              <div className="h-8 bg-slate-100 rounded-lg" />
              <div className="h-8 bg-slate-100 rounded-lg" />
            </div>
            <div className="h-20 bg-slate-100 rounded-lg" />
          </div>
        ) : hasError ? (
          <div className="py-10 px-4 text-center rounded-xl border border-red-200 bg-red-50/40">
            <AlertCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
            <p className="text-[13px] font-semibold text-slate-900">
              Falha ao ler métricas do agente
            </p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-[12px] font-medium text-slate-700 hover:bg-slate-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Recarregar
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Big highlight metric */}
            <div className="pb-4 border-b border-slate-100">
              <div className="flex items-baseline gap-2">
                <span className="text-[34px] font-bold text-slate-900 tracking-tight leading-none tabular-nums">
                  {health.noHumanCorrectionPct.toFixed(1).replace('.', ',')}%
                </span>
                <span className="text-[12px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Operação autônoma
                </span>
              </div>
              <p className="text-[12.5px] text-slate-500 mt-1.5">
                Ações executadas sem correção humana
              </p>
            </div>

            {/* Execution time & Hours saved */}
            <div className="grid grid-cols-2 gap-2.5 py-3.5 border-b border-slate-100">
              <div className="rounded-lg bg-[#F8F9FB] border border-slate-200/70 px-3 py-2.5">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Tempo médio</span>
                </div>
                <div className="text-[16px] font-bold text-slate-900 mt-0.5 tabular-nums">
                  {health.avgExecutionSeconds.toFixed(1).replace('.', ',')}s
                </div>
              </div>

              <div className="rounded-lg bg-[#F3F0FF]/50 border border-[#5B3FD0]/15 px-3 py-2.5">
                <div className="flex items-center gap-1.5 text-[11px] text-[#5B3FD0] font-medium">
                  <Bot className="w-3.5 h-3.5" />
                  <span>Horas economizadas</span>
                </div>
                <div className="text-[16px] font-bold text-slate-900 mt-0.5 tabular-nums">
                  {health.hoursSavedWeek.toFixed(1).replace('.', ',')}h
                  <span className="text-[11px] font-normal text-slate-500 ml-1">/sem</span>
                </div>
              </div>
            </div>

            {/* Item counts by state */}
            <div className="py-3.5 space-y-2 border-b border-slate-100">
              <div className="text-[11.5px] font-semibold text-slate-500 uppercase tracking-wider">
                Itens por estado
              </div>

              <div className="flex items-center justify-between text-[12.5px] py-1">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-[#5B3FD0]" aria-hidden="true" />
                  Em processamento
                </span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {totalProcessing}
                </span>
              </div>

              <div className="flex items-center justify-between text-[12.5px] py-1">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-amber-500" aria-hidden="true" />
                  Aguardando você
                </span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {waitingCount}
                </span>
              </div>

              <div className="flex items-center justify-between text-[12.5px] py-1">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-red-500" aria-hidden="true" />
                  Com erro
                </span>
                <span className="font-semibold text-red-700 tabular-nums">
                  {health.errorCount}
                </span>
              </div>
            </div>

            {/* 7-day accuracy sparkline */}
            <div className="pt-3.5">
              <div className="flex items-center justify-between text-[12px] mb-1.5">
                <span className="font-medium text-slate-700">
                  Taxa de acerto (7 dias)
                </span>
                <span className="text-[11.5px] text-slate-500 tabular-nums">
                  Meta 90%
                </span>
              </div>

              <div className="h-[74px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={health.accuracySparkline}
                    margin={{ top: 6, right: 6, left: 6, bottom: 2 }}
                  >
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#94A3B8' }}
                    />
                    <YAxis domain={['dataMin - 2', 100]} hide />
                    <Tooltip
                      formatter={(val) => {
                        const num = typeof val === 'number' ? val : Number(val ?? 0);
                        return [`${num.toFixed(1).replace('.', ',')}%`, 'Acerto'];
                      }}
                      contentStyle={{
                        fontSize: '12px',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        padding: '4px 8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="pct"
                      stroke="#5B3FD0"
                      strokeWidth={2}
                      dot={{ r: 2.5, fill: '#5B3FD0', strokeWidth: 0 }}
                      activeDot={{ r: 4, fill: '#5B3FD0' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
