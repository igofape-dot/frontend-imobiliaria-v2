import { useState } from 'react';
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Pencil,
  Check,
  X,
} from 'lucide-react';
import type { ProactiveOpportunity } from '../data/commandCenterData';

interface OpportunitiesPanelProps {
  opportunities: ProactiveOpportunity[];
  isLoading: boolean;
  hasError?: boolean;
  onRetry?: () => void;
  onTriggerOpportunity: (opportunity: ProactiveOpportunity) => void;
  onCorrectOpportunity: (id: string, newTitle: string) => void;
}

function getSeverityDotColor(severity: ProactiveOpportunity['severity']) {
  switch (severity) {
    case 'red':
      return 'bg-red-500';
    case 'amber':
      return 'bg-amber-500';
    case 'blue':
      return 'bg-[#2563EB]';
  }
}

export function OpportunitiesPanel({
  opportunities,
  isLoading,
  hasError = false,
  onRetry,
  onTriggerOpportunity,
  onCorrectOpportunity,
}: OpportunitiesPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const startEdit = (item: ProactiveOpportunity) => {
    setEditingId(item.id);
    setEditTitle(item.title);
  };

  const saveEdit = (id: string) => {
    if (editTitle.trim()) {
      onCorrectOpportunity(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <section
      aria-labelledby="heading-oportunidades-alertas"
      className="bg-white rounded-xl border border-slate-200/90 p-5 flex flex-col h-full"
    >
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <h2
            id="heading-oportunidades-alertas"
            className="text-[15px] font-semibold text-slate-900"
          >
            Oportunidades do agente
          </h2>
          <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-[#F3F0FF] text-[#5B3FD0] text-[12px] font-semibold tabular-nums">
            {isLoading ? '—' : opportunities.length}
          </span>
        </div>
        <span className="text-[11.5px] text-slate-500">Sugestões proativas da IA</span>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse" aria-busy="true">
          {[1, 2, 3, 4].map((idx) => (
            <div key={idx} className="rounded-xl border border-slate-200/80 p-3.5 space-y-2">
              <div className="h-3.5 bg-slate-200 rounded w-4/5" />
              <div className="h-3 bg-slate-100 rounded w-3/5" />
            </div>
          ))}
        </div>
      ) : hasError ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8 px-4 rounded-xl border border-red-200 bg-red-50/40">
          <AlertTriangle className="w-6 h-6 text-red-600 mb-2" />
          <p className="text-[13px] font-semibold text-slate-900">
            Falha ao analisar oportunidades
          </p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-[12px] font-medium text-slate-700 hover:bg-slate-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Tentar novamente
            </button>
          )}
        </div>
      ) : opportunities.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-10 px-4 rounded-xl border border-emerald-200/70 bg-emerald-50/30">
          <CheckCircle2 className="w-6 h-6 text-emerald-700 mb-2" />
          <p className="text-[13.5px] font-semibold text-slate-900">
            Todas as oportunidades foram acionadas
          </p>
          <p className="text-[12px] text-slate-500 mt-1">
            O agente continua monitorando contratos, preços e carteira 24h.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 flex-1">
          {opportunities.map((opp) => {
            const isEditing = editingId === opp.id;
            return (
              <article
                key={opp.id}
                className="rounded-xl border border-slate-200/90 bg-[#F8F9FB]/60 p-3.5 hover:bg-white hover:border-slate-300/90 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          aria-label="Corrigir alerta detectado pelo agente"
                          className="flex-1 px-2.5 py-1 text-[12.5px] font-medium text-slate-900 border border-[#2563EB] rounded-lg bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => saveEdit(opp.id)}
                          className="p-1.5 rounded-lg bg-[#2563EB] text-white hover:bg-blue-700"
                          aria-label="Salvar correção"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                          aria-label="Cancelar"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <span
                          className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${getSeverityDotColor(
                            opp.severity
                          )}`}
                          aria-hidden="true"
                        />
                        <h3 className="text-[13px] font-semibold text-slate-900 leading-snug">
                          {opp.title}
                        </h3>
                      </div>
                    )}

                    <p className="text-[12px] text-slate-500 mt-1 pl-4 leading-snug">
                      {opp.context}
                    </p>

                    <div className="mt-1.5 pl-4 flex items-center gap-2.5 text-[11px] text-[#5B3FD0] font-medium">
                      <span className="inline-flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {opp.detectedBy}
                      </span>
                      {!isEditing && (
                        <button
                          type="button"
                          onClick={() => startEdit(opp)}
                          className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 font-medium"
                        >
                          <Pencil className="w-3 h-3" />
                          Corrigir
                        </button>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onTriggerOpportunity(opp)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#5B3FD0]/25 bg-white hover:bg-[#F3F0FF] text-[#5B3FD0] text-[12px] font-semibold transition-colors whitespace-nowrap shrink-0 self-start sm:self-center"
                  >
                    <span>{opp.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
