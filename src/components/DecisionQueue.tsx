import { useState } from 'react';
import {
  FileSignature,
  Home,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Pencil,
  Check,
  X,
  RotateCcw,
  Bot,
} from 'lucide-react';
import type { DecisionCardItem, DecisionCategory, PauseReason } from '../data/commandCenterData';

interface DecisionQueueProps {
  decisions: DecisionCardItem[];
  isLoading: boolean;
  hasError?: boolean;
  onRetry?: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onEditSave: (id: string, newTitle: string, newProposedAction: string) => void;
}

function CategoryIcon({ category }: { category: DecisionCategory }) {
  const baseClass = 'w-4 h-4';
  switch (category) {
    case 'contrato':
      return <FileSignature className={`${baseClass} text-[#2563EB]`} strokeWidth={1.85} />;
    case 'imovel':
      return <Home className={`${baseClass} text-[#5B3FD0]`} strokeWidth={1.85} />;
    case 'financeiro':
      return <DollarSign className={`${baseClass} text-amber-600`} strokeWidth={1.85} />;
    case 'alerta':
      return <AlertTriangle className={`${baseClass} text-red-600`} strokeWidth={1.85} />;
  }
}

function getPauseReasonStyle(reason: PauseReason) {
  switch (reason) {
    case 'Ação sensível':
      return 'bg-amber-50 text-amber-700 border-amber-200/80';
    case 'Baixa confiança':
      return 'bg-red-50 text-red-700 border-red-200/80';
    case 'Exceção':
      return 'bg-blue-50 text-[#2563EB] border-blue-200/80';
  }
}

function getConfidenceBarColor(confidence: number) {
  if (confidence >= 85) return 'bg-emerald-600';
  if (confidence >= 75) return 'bg-amber-500';
  return 'bg-red-500';
}

export function DecisionQueue({
  decisions,
  isLoading,
  hasError = false,
  onRetry,
  onApprove,
  onReject,
  onEditSave,
}: DecisionQueueProps) {
  const [expandedEvidence, setExpandedEvidence] = useState<Record<string, boolean>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editProposedAction, setEditProposedAction] = useState('');

  const toggleEvidence = (id: string) => {
    setExpandedEvidence((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const startEditing = (item: DecisionCardItem) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditProposedAction(item.proposedAction);
  };

  const handleSaveEdit = (id: string) => {
    if (editTitle.trim()) {
      onEditSave(id, editTitle.trim(), editProposedAction.trim());
    }
    setEditingId(null);
  };

  return (
    <section
      aria-labelledby="heading-precisa-de-voce"
      className="bg-white rounded-xl border border-slate-200/90 p-5 flex flex-col h-full"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <h2 id="heading-precisa-de-voce" className="text-[15px] font-semibold text-slate-900">
            Decisões do agente
          </h2>
          <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-[#EFF4FF] text-[#2563EB] text-[12px] font-semibold tabular-nums">
            {isLoading ? '—' : decisions.length}
          </span>
        </div>
        <span className="text-[12px] text-slate-500">
          Fila de decisão supervisionada
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-3" aria-busy="true" aria-label="Carregando decisões pendentes">
          {[1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-200/80 p-4 animate-pulse"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3.5 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-5 w-24 bg-slate-100 rounded-md" />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="h-2.5 bg-slate-100 rounded w-32" />
                <div className="flex gap-2">
                  <div className="h-7 w-16 bg-slate-200 rounded-lg" />
                  <div className="h-7 w-16 bg-slate-100 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : hasError ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-10 px-4 rounded-xl border border-red-200 bg-red-50/40">
          <AlertTriangle className="w-7 h-7 text-red-600 mb-2" />
          <p className="text-[13.5px] font-semibold text-slate-900">
            Não foi possível carregar a fila de decisões
          </p>
          <p className="text-[12.5px] text-slate-600 mt-1">
            O agente continua operando em segundo plano. Tente sincronizar novamente.
          </p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-[12.5px] font-medium text-slate-800 hover:bg-slate-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Tentar novamente
            </button>
          )}
        </div>
      ) : decisions.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-4 rounded-xl border border-emerald-200/70 bg-emerald-50/30">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-[14px] font-semibold text-slate-900">
            Tudo em dia. O agente está cuidando do resto.
          </p>
          <p className="text-[12.5px] text-slate-500 mt-1 max-w-sm">
            Novas exceções ou ações sensíveis aparecerão aqui automaticamente para sua aprovação.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {decisions.map((item) => {
            const isEvidenceOpen = !!expandedEvidence[item.id];
            const isEditing = editingId === item.id;

            return (
              <article
                key={item.id}
                className="rounded-xl border border-slate-200/90 bg-white p-4 hover:border-slate-300/90 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-[#F8F9FB] border border-slate-200/80 flex items-center justify-center shrink-0 mt-0.5">
                      <CategoryIcon category={item.category} />
                    </div>

                    <div className="min-w-0 flex-1">
                      {isEditing ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            aria-label="Editar título da decisão"
                            className="w-full px-2.5 py-1.5 text-[13.5px] font-medium text-slate-900 border border-[#2563EB] rounded-lg bg-white"
                          />
                          <input
                            type="text"
                            value={editProposedAction}
                            onChange={(e) => setEditProposedAction(e.target.value)}
                            aria-label="Editar ação proposta"
                            className="w-full px-2.5 py-1.5 text-[12px] text-slate-700 border border-slate-300 rounded-lg bg-[#F8F9FB]"
                          />
                        </div>
                      ) : (
                        <>
                          <h3 className="text-[13.5px] font-semibold text-slate-900 leading-snug">
                            {item.title}
                          </h3>
                          <p className="text-[12.5px] text-slate-600 mt-1 leading-snug">
                            {item.proposedAction}
                          </p>
                        </>
                      )}

                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11.5px] text-slate-500">
                        <span className="inline-flex items-center gap-1 text-[#5B3FD0] font-medium">
                          <Bot className="w-3 h-3" />
                          {item.registeredBy}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{item.createdAt}</span>
                        <span aria-hidden="true">·</span>
                        <button
                          type="button"
                          onClick={() => toggleEvidence(item.id)}
                          aria-expanded={isEvidenceOpen}
                          className="inline-flex items-center gap-1 text-[#2563EB] hover:text-blue-700 font-medium"
                        >
                          <span>Ver evidência</span>
                          {isEvidenceOpen ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right metadata: Pause reason + Confidence */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-medium whitespace-nowrap ${getPauseReasonStyle(
                        item.pauseReason
                      )}`}
                    >
                      {item.pauseReason}
                    </span>

                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${getConfidenceBarColor(item.confidence)}`}
                          style={{ width: `${item.confidence}%` }}
                        />
                      </div>
                      <span className="text-[11.5px] font-semibold text-slate-700 tabular-nums">
                        {item.confidence}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expandable evidence box */}
                {isEvidenceOpen && (
                  <div className="mt-3 rounded-lg bg-[#F8F9FB] border border-slate-200/80 px-3.5 py-2.5 text-[12px]">
                    <div className="font-semibold text-slate-800">
                      {item.evidenceSource}
                    </div>
                    <p className="text-slate-600 mt-0.5 leading-relaxed">
                      {item.evidenceExcerpt}
                    </p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-600 hover:bg-slate-50"
                      >
                        <X className="w-3.5 h-3.5" />
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(item.id)}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-[12px] font-semibold"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Salvar correção
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => onReject(item.id)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-[12px] font-medium text-slate-600 transition-colors"
                      >
                        Recusar
                      </button>
                      <button
                        type="button"
                        onClick={() => startEditing(item)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[12px] font-medium text-slate-700 transition-colors"
                      >
                        <Pencil className="w-3 h-3" />
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => onApprove(item.id)}
                        className="px-3.5 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-[12px] font-semibold transition-colors"
                      >
                        Aprovar
                      </button>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
