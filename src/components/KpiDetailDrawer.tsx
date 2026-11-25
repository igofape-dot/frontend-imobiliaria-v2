import { useEffect } from 'react';
import { X, Sparkles, Bot, CheckCircle2, AlertTriangle, AlertOctagon, ArrowRight } from 'lucide-react';
import type { KpiMetricItem, SemaphoreStatus } from '../data/commandCenterData';

interface KpiDetailDrawerProps {
  kpi: KpiMetricItem | null;
  onClose: () => void;
  onExecuteSuggestedCommand: (commandText: string) => void;
}

function getSemaphoreBadge(status: SemaphoreStatus, label: string) {
  switch (status) {
    case 'verde':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11.5px] font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {label}
        </span>
      );
    case 'ambar':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[11.5px] font-semibold">
          <AlertTriangle className="w-3.5 h-3.5" />
          {label}
        </span>
      );
    case 'vermelho':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 text-red-800 border border-red-200 text-[11.5px] font-semibold">
          <AlertOctagon className="w-3.5 h-3.5" />
          {label}
        </span>
      );
  }
}

export function KpiDetailDrawer({
  kpi,
  onClose,
  onExecuteSuggestedCommand,
}: KpiDetailDrawerProps) {
  useEffect(() => {
    if (!kpi) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [kpi, onClose]);

  if (!kpi) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-kpi-title"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full max-w-2xl bg-white h-full border-l border-slate-200 flex flex-col overflow-hidden">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 id="drawer-kpi-title" className="text-[17px] font-bold text-slate-900">
                {kpi.title}
              </h2>
              {getSemaphoreBadge(kpi.semaphore, kpi.semaphoreLabel)}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-slate-600 tabular-nums">
              <strong className="text-slate-900 font-bold text-[15px]">{kpi.value}</strong>
              <span aria-hidden="true">·</span>
              <span>{kpi.comparisonPrev}</span>
              <span aria-hidden="true">·</span>
              <span>{kpi.comparisonTarget}</span>
            </div>
            <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-[#5B3FD0]">
              <Bot className="w-3 h-3" />
              {kpi.registeredBy} ({kpi.semaphoreRule})
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Fechar detalhamento"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Leitura do agente */}
          <div className="rounded-xl border border-[#5B3FD0]/25 bg-[#F3F0FF]/55 p-4">
            <div className="flex items-center gap-2 text-[12.5px] font-semibold text-[#5B3FD0] mb-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Leitura do agente</span>
            </div>
            <p className="text-[13.5px] text-slate-800 leading-relaxed">
              {kpi.agentReading}
            </p>
            <div className="mt-3">
              <button
                type="button"
                onClick={() => {
                  onExecuteSuggestedCommand(kpi.suggestedCommand);
                  onClose();
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#5B3FD0] hover:bg-[#4C32B8] text-white text-[12.5px] font-semibold transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pedir ao agente: {kpi.suggestedCommand}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Detail Table */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-[13.5px] font-semibold text-slate-900">
                Detalhamento registrado ({kpi.drawerRows.length} itens)
              </h3>
              <span className="text-[11.5px] text-slate-500">
                Consolidado automaticamente pela IA
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-x-auto">
              <table className="w-full text-left border-collapse text-[12.5px]">
                <thead>
                  <tr className="bg-[#F8F9FB] border-b border-slate-200 text-slate-600">
                    {kpi.drawerColumns.map((col) => (
                      <th
                        key={col}
                        className="py-2.5 px-3 font-semibold text-[11.5px] whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {kpi.drawerRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 font-medium text-slate-900 whitespace-nowrap">
                        {row.col1}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                        {row.col2}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 tabular-nums whitespace-nowrap">
                        {row.col3}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                        {row.col4}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                        {row.col5}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
