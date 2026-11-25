import { FileText, MessageSquare, Users, Bot, Sparkles } from 'lucide-react';
import type { IntakeStats } from '../data/commandCenterData';

interface ProcessingIntakeStripProps {
  intake: IntakeStats;
  isLoading: boolean;
  onTriggerIntakeAudit?: () => void;
}

export function ProcessingIntakeStrip({
  intake,
  isLoading,
  onTriggerIntakeAudit,
}: ProcessingIntakeStripProps) {
  const totalReceived =
    intake.documents.total + intake.messages.total + intake.leads.total;
  const totalProcessed =
    intake.documents.processed + intake.messages.processed + intake.leads.processed;
  const pct = totalReceived > 0 ? Math.round((totalProcessed / totalReceived) * 100) : 100;

  const docPct = Math.round((intake.documents.processed / Math.max(1, intake.documents.total)) * 100);
  const msgPct = Math.round((intake.messages.processed / Math.max(1, intake.messages.total)) * 100);
  const leadPct = Math.round((intake.leads.processed / Math.max(1, intake.leads.total)) * 100);

  return (
    <section
      aria-labelledby="heading-entradas-processamento"
      className="bg-white rounded-xl border border-slate-200/90 p-5 flex flex-col justify-between h-full"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <h2
            id="heading-entradas-processamento"
            className="text-[15px] font-semibold text-slate-900"
          >
            Entradas em processamento
          </h2>
          <span className="text-[12px] font-semibold text-[#5B3FD0] tabular-nums">
            {isLoading ? '—' : `${pct}%`}
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-4 animate-pulse" aria-busy="true">
            <div className="h-3 bg-slate-200 rounded w-full" />
            <div className="h-12 bg-slate-100 rounded-lg" />
            <div className="h-12 bg-slate-100 rounded-lg" />
            <div className="h-12 bg-slate-100 rounded-lg" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Overall Progress Bar */}
            <div>
              <div className="flex items-center justify-between text-[12px] text-slate-600 mb-1.5 tabular-nums">
                <span>Total recebido vs. processado</span>
                <strong className="text-slate-900 font-semibold">
                  {totalProcessed.toLocaleString('pt-BR')} / {totalReceived.toLocaleString('pt-BR')}
                </strong>
              </div>
              <div
                className="w-full h-2 rounded-full bg-slate-100 overflow-hidden"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Progresso total de entradas em processamento"
              >
                <div
                  className="h-full rounded-full bg-[#5B3FD0] transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            {/* Channel Breakdown */}
            <div className="space-y-2.5 pt-1">
              <div className="rounded-lg bg-[#F8F9FB] border border-slate-200/70 p-3">
                <div className="flex items-center justify-between text-[12.5px] tabular-nums">
                  <span className="inline-flex items-center gap-2 font-medium text-slate-800">
                    <FileText className="w-4 h-4 text-slate-500" />
                    Documentos (PDF/Contratos)
                  </span>
                  <span className="font-semibold text-slate-900">
                    {intake.documents.processed.toLocaleString('pt-BR')}/{intake.documents.total.toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-slate-200/70 overflow-hidden">
                  <div className="h-full bg-[#2563EB] rounded-full" style={{ width: `${docPct}%` }} />
                </div>
              </div>

              <div className="rounded-lg bg-[#F8F9FB] border border-slate-200/70 p-3">
                <div className="flex items-center justify-between text-[12.5px] tabular-nums">
                  <span className="inline-flex items-center gap-2 font-medium text-slate-800">
                    <MessageSquare className="w-4 h-4 text-slate-500" />
                    Mensagens (WhatsApp/E-mail)
                  </span>
                  <span className="font-semibold text-slate-900">
                    {intake.messages.processed.toLocaleString('pt-BR')}/{intake.messages.total.toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-slate-200/70 overflow-hidden">
                  <div className="h-full bg-[#5B3FD0] rounded-full" style={{ width: `${msgPct}%` }} />
                </div>
              </div>

              <div className="rounded-lg bg-[#F8F9FB] border border-slate-200/70 p-3">
                <div className="flex items-center justify-between text-[12.5px] tabular-nums">
                  <span className="inline-flex items-center gap-2 font-medium text-slate-800">
                    <Users className="w-4 h-4 text-slate-500" />
                    Leads de portais
                  </span>
                  <span className="font-semibold text-slate-900">
                    {intake.leads.processed.toLocaleString('pt-BR')}/{intake.leads.total.toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-slate-200/70 overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${leadPct}%` }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px]">
        <span className="inline-flex items-center gap-1 text-[#5B3FD0] font-medium">
          <Bot className="w-3.5 h-3.5" />
          Registrado pelo agente
        </span>
        {onTriggerIntakeAudit && (
          <button
            type="button"
            onClick={onTriggerIntakeAudit}
            className="inline-flex items-center gap-1 text-[#5B3FD0] hover:text-[#4C32B8] font-semibold"
          >
            <Sparkles className="w-3 h-3" />
            Priorizar fila
          </button>
        )}
      </div>
    </section>
  );
}
