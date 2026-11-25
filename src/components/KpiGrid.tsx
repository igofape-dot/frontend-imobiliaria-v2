import { useState } from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Pencil,
  Check,
  X,
  ArrowUpRight,
  Bot,
  RotateCcw,
} from 'lucide-react';
import type { KpiMetricItem, SemaphoreStatus } from '../data/commandCenterData';

interface KpiGridProps {
  kpis: KpiMetricItem[];
  isLoading: boolean;
  hasError?: boolean;
  onRetry?: () => void;
  onSelectKpi: (kpi: KpiMetricItem) => void;
  onCorrectKpi: (id: string, newValue: string) => void;
}

function getSemaphoreMeta(status: SemaphoreStatus) {
  switch (status) {
    case 'verde':
      return {
        dotClass: 'bg-emerald-600',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
        lineColor: '#16A34A',
        Icon: CheckCircle2,
      };
    case 'ambar':
      return {
        dotClass: 'bg-amber-500',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/80',
        lineColor: '#D97706',
        Icon: AlertTriangle,
      };
    case 'vermelho':
      return {
        dotClass: 'bg-red-600',
        badgeClass: 'bg-red-50 text-red-800 border-red-200/80',
        lineColor: '#DC2626',
        Icon: AlertOctagon,
      };
  }
}

export function KpiGrid({
  kpis,
  isLoading,
  hasError = false,
  onRetry,
  onSelectKpi,
  onCorrectKpi,
}: KpiGridProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const startEdit = (item: KpiMetricItem) => {
    setEditingId(item.id);
    setEditValue(item.value);
  };

  const saveEdit = (id: string) => {
    if (editValue.trim()) {
      onCorrectKpi(id, editValue.trim());
    }
    setEditingId(null);
  };

  return (
    <section aria-labelledby="heading-como-estou-agora">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <h2
            id="heading-como-estou-agora"
            className="text-[13px] font-bold uppercase tracking-wider text-slate-500"
          >
            Como estou agora
          </h2>
          <span className="text-[12px] text-slate-400">·</span>
          <span className="text-[12px] text-slate-500">
            Clique em qualquer indicador para abrir a tabela detalhada e acionar o agente
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4" aria-busy="true">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-slate-200/90 p-4 animate-pulse space-y-3"
            >
              <div className="flex justify-between">
                <div className="h-3.5 bg-slate-200 rounded w-32" />
                <div className="h-5 bg-slate-100 rounded w-16" />
              </div>
              <div className="h-7 bg-slate-200 rounded w-28" />
              <div className="h-8 bg-slate-100 rounded w-full" />
              <div className="h-3 bg-slate-100 rounded w-40" />
            </div>
          ))}
        </div>
      ) : hasError ? (
        <div className="bg-white rounded-xl border border-red-200 p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-[13.5px] text-slate-800">
            <AlertOctagon className="w-5 h-5 text-red-600 shrink-0" />
            <span>Não foi possível carregar os 8 indicadores do negócio.</span>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-700 hover:bg-slate-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Recarregar
            </button>
          )}
        </div>
      ) : kpis.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 text-center text-[13px] text-slate-500">
          Sem indicadores disponíveis para este recorte.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((kpi) => {
            const sem = getSemaphoreMeta(kpi.semaphore);
            const SemIcon = sem.Icon;
            const isEditing = editingId === kpi.id;

            return (
              <div
                key={kpi.id}
                className="bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 p-4 flex flex-col justify-between transition-colors group"
              >
                <div>
                  {/* Top row: Title + Semaphore badge (color + icon + label) */}
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectKpi(kpi)}
                      className="text-left text-[13px] font-semibold text-slate-800 hover:text-[#2563EB] transition-colors leading-snug"
                    >
                      {kpi.title}
                    </button>

                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10.5px] font-semibold shrink-0 ${sem.badgeClass}`}
                      title={kpi.semaphoreRule}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${sem.dotClass}`}
                        aria-hidden="true"
                      />
                      <SemIcon className="w-3 h-3" aria-hidden="true" />
                      <span>{kpi.semaphoreLabel}</span>
                    </span>
                  </div>

                  {/* Large Value + 1-click correction */}
                  <div className="mt-2.5 flex items-baseline justify-between gap-2">
                    {isEditing ? (
                      <div className="flex items-center gap-1 w-full">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          aria-label={`Corrigir ${kpi.title}`}
                          className="w-full px-2 py-1 text-[16px] font-bold border border-[#2563EB] rounded-lg bg-white tabular-nums"
                        />
                        <button
                          type="button"
                          onClick={() => saveEdit(kpi.id)}
                          className="p-1.5 rounded-lg bg-[#2563EB] text-white"
                          aria-label="Salvar correção"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600"
                          aria-label="Cancelar"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => onSelectKpi(kpi)}
                          className="text-left text-[22px] font-bold text-slate-900 tracking-tight leading-tight tabular-nums hover:text-[#2563EB] transition-colors"
                        >
                          {kpi.value}
                        </button>
                        <button
                          type="button"
                          onClick={() => startEdit(kpi)}
                          className="opacity-60 group-hover:opacity-100 text-slate-400 hover:text-slate-800 p-1 rounded transition-opacity"
                          aria-label={`Corrigir valor de ${kpi.title}`}
                          title="Corrigir em 1 clique"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Comparisons: vs previous AND vs target */}
                  <div className="mt-1.5 space-y-0.5 text-[11.5px] tabular-nums">
                    <div className="text-slate-700 font-medium">
                      {kpi.comparisonPrev}
                    </div>
                    <div className="text-slate-500">
                      {kpi.comparisonTarget} · {kpi.semaphoreRule}
                    </div>
                  </div>
                </div>

                {/* Mini Sparkline + Footer Action */}
                <div className="mt-3 pt-2.5 border-t border-slate-100">
                  <div className="h-[34px] w-full mb-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={kpi.sparkline}>
                        <YAxis domain={['dataMin', 'dataMax']} hide />
                        <Line
                          type="monotone"
                          dataKey="v"
                          stroke={sem.lineColor}
                          strokeWidth={1.85}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="inline-flex items-center gap-1 text-[#5B3FD0] font-medium truncate">
                      <Bot className="w-3 h-3 shrink-0" />
                      <span className="truncate">{kpi.registeredBy}</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => onSelectKpi(kpi)}
                      className="inline-flex items-center gap-0.5 text-[#2563EB] hover:text-blue-700 font-semibold shrink-0"
                    >
                      <span>Detalhar</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
