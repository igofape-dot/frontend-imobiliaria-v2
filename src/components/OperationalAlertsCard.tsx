import { AlertTriangle, AlertOctagon, Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';
import type { OperationalAlertItem } from '../data/commandCenterData';

interface OperationalAlertsCardProps {
  alerts: OperationalAlertItem[];
  isLoading: boolean;
  hasError?: boolean;
  onRetry?: () => void;
  onResolveAlert: (alert: OperationalAlertItem) => void;
}

export function OperationalAlertsCard({
  alerts,
  isLoading,
  hasError = false,
  onRetry,
  onResolveAlert,
}: OperationalAlertsCardProps) {
  const totalCount = alerts.reduce((acc, item) => acc + item.count, 0);

  return (
    <section
      aria-labelledby="heading-alertas-operacionais"
      className="bg-white rounded-xl border border-slate-200/90 p-5 flex flex-col h-full"
    >
      <div className="flex items-center justify-between gap-2 mb-3.5">
        <div className="flex items-center gap-2">
          <h2
            id="heading-alertas-operacionais"
            className="text-[15px] font-semibold text-slate-900"
          >
            Alertas operacionais
          </h2>
          <span className="inline-flex items-center justify-center min-w-[24px] h-[22px] px-1.5 rounded-full bg-red-50 text-red-700 border border-red-200/70 text-[12px] font-semibold tabular-nums">
            {isLoading ? '—' : totalCount}
          </span>
        </div>
        <span className="text-[11.5px] text-slate-500">
          {isLoading ? '' : `${alerts.length} frentes`}
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-2.5 animate-pulse" aria-busy="true">
          {[1, 2, 3, 4, 5, 6, 7].map((idx) => (
            <div key={idx} className="h-12 bg-slate-100 rounded-lg" />
          ))}
        </div>
      ) : hasError ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8 px-4 rounded-xl border border-red-200 bg-red-50/40">
          <AlertTriangle className="w-6 h-6 text-red-600 mb-2" />
          <p className="text-[13px] font-semibold text-slate-900">
            Erro ao carregar alertas
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
      ) : alerts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-10 px-4 rounded-xl border border-emerald-200/70 bg-emerald-50/30">
          <CheckCircle2 className="w-6 h-6 text-emerald-700 mb-2" />
          <p className="text-[13.5px] font-semibold text-slate-900">
            Nenhum alerta operacional aberto
          </p>
          <p className="text-[12px] text-slate-500 mt-1">
            Todos os repasses, contratos e vistorias estão encaminhados.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 flex-1">
          {alerts.map((alert) => {
            const isCritico = alert.urgency === 'critico';
            return (
              <div
                key={alert.id}
                className="py-2.5 first:pt-0.5 last:pb-0.5 flex flex-col gap-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    {isCritico ? (
                      <AlertOctagon
                        className="w-4 h-4 text-red-600 shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                    ) : (
                      <AlertTriangle
                        className="w-4 h-4 text-amber-600 shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[12.5px] font-semibold text-slate-900 leading-snug">
                          {alert.title}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                            isCritico
                              ? 'bg-red-50 text-red-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {isCritico ? 'Crítico' : 'Atenção'}
                        </span>
                      </div>
                      <p className="text-[12px] text-slate-600 mt-0.5 leading-snug tabular-nums">
                        {alert.detail}
                      </p>
                    </div>
                  </div>

                  <span className="text-[12px] font-bold text-slate-800 tabular-nums shrink-0">
                    {alert.count}
                  </span>
                </div>

                <div className="pl-6 flex items-center justify-between gap-2">
                  <span className="text-[10.5px] text-slate-400">
                    {alert.registeredBy}
                  </span>
                  <button
                    type="button"
                    onClick={() => onResolveAlert(alert)}
                    className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#5B3FD0] hover:text-[#4C32B8] hover:underline"
                  >
                    <Sparkles className="w-3 h-3" />
                    Resolver com o agente
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
