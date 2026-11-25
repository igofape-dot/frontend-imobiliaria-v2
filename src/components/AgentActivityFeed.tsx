import { useState } from 'react';
import {
  Loader2,
  CheckCircle2,
  RotateCcw,
  Pencil,
  Check,
  X,
  Bot,
  AlertCircle,
} from 'lucide-react';
import type { ActivityOrigin, AgentActivityItem } from '../data/commandCenterData';

interface AgentActivityFeedProps {
  activities: AgentActivityItem[];
  isLoading: boolean;
  hasError?: boolean;
  onRetry?: () => void;
  onUndoActivity: (id: string) => void;
  onCorrectActivity: (id: string, newDescription: string) => void;
  onRetryFailedActivity?: (id: string) => void;
}

function getOriginStyle(origin: ActivityOrigin) {
  switch (origin) {
    case 'WhatsApp':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
    case 'E-mail':
      return 'bg-blue-50 text-[#2563EB] border-blue-200/80';
    case 'PDF':
      return 'bg-amber-50 text-amber-700 border-amber-200/80';
    case 'Portal':
      return 'bg-slate-100 text-slate-700 border-slate-200/80';
    case 'Pedido seu':
      return 'bg-[#F3F0FF] text-[#5B3FD0] border-[#5B3FD0]/20';
  }
}

export function AgentActivityFeed({
  activities,
  isLoading,
  hasError = false,
  onRetry,
  onUndoActivity,
  onCorrectActivity,
  onRetryFailedActivity,
}: AgentActivityFeedProps) {
  const [showAllModal, setShowAllModal] = useState(false);
  const [originFilter, setOriginFilter] = useState<ActivityOrigin | 'Todos'>('Todos');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const visibleActivities = activities.slice(0, 5);
  const filteredModalActivities =
    originFilter === 'Todos'
      ? activities
      : activities.filter((a) => a.origin === originFilter);

  const startCorrection = (item: AgentActivityItem) => {
    setEditingId(item.id);
    setEditText(item.description);
  };

  const saveCorrection = (id: string) => {
    if (editText.trim()) {
      onCorrectActivity(id, editText.trim());
    }
    setEditingId(null);
  };

  const renderTimelineItem = (item: AgentActivityItem, isLast: boolean) => {
    const isEditing = editingId === item.id;
    const isUndone = item.status === 'undone';

    return (
      <div key={item.id} className="relative pl-6 pb-4 last:pb-0">
        {/* Vertical connector line */}
        {!isLast && (
          <span
            className="absolute left-[7px] top-5 bottom-0 w-px bg-slate-200"
            aria-hidden="true"
          />
        )}

        {/* Timeline status node */}
        <span
          className="absolute left-0 top-1 flex items-center justify-center w-4 h-4 rounded-full bg-white"
          aria-hidden="true"
        >
          {item.status === 'running' ? (
            <Loader2 className="w-4 h-4 text-[#5B3FD0] animate-spin" />
          ) : item.status === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-600" />
          ) : item.status === 'undone' ? (
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          )}
        </span>

        <div className={isUndone ? 'opacity-60' : ''}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11.5px] font-semibold text-slate-500 tabular-nums">
                {item.time}
              </span>
              <span
                className={`inline-flex items-center px-1.5 py-0.5 rounded border text-[10.5px] font-medium ${getOriginStyle(
                  item.origin
                )}`}
              >
                {item.origin}
              </span>
              {item.status === 'running' ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5B3FD0]">
                  Em execução
                </span>
              ) : item.status === 'undone' ? (
                <span className="text-[11px] font-medium text-slate-500">
                  Desfeito por você
                </span>
              ) : item.status === 'error' ? (
                <span className="text-[11px] font-semibold text-red-700">
                  Erro na execução
                </span>
              ) : (
                <span className="text-[11px] font-medium text-emerald-700">
                  Concluído
                </span>
              )}
            </div>

            <span className="text-[11px] font-medium text-slate-500 tabular-nums">
              Confiança {item.confidence}%
            </span>
          </div>

          {isEditing ? (
            <div className="mt-1.5 flex items-center gap-1.5">
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                aria-label="Corrigir registro do agente"
                className="flex-1 px-2.5 py-1 text-[12.5px] text-slate-900 border border-[#2563EB] rounded-lg bg-white"
              />
              <button
                type="button"
                onClick={() => saveCorrection(item.id)}
                className="p-1.5 rounded-lg bg-[#2563EB] text-white hover:bg-blue-700"
                aria-label="Salvar correção"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                aria-label="Cancelar correção"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <p
              className={`mt-1 text-[13px] text-slate-800 leading-snug ${
                isUndone ? 'line-through' : ''
              }`}
            >
              {item.description}
            </p>
          )}

          <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1 text-[#5B3FD0] font-medium">
              <Bot className="w-3 h-3" />
              {item.registeredBy}
            </span>

            {item.status !== 'running' && !isUndone && !isEditing && (
              <div className="flex items-center gap-3">
                {item.status === 'error' && onRetryFailedActivity && (
                  <button
                    type="button"
                    onClick={() => onRetryFailedActivity(item.id)}
                    className="inline-flex items-center gap-1 text-red-700 hover:text-red-800 font-medium"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Tentar novamente
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => startCorrection(item)}
                  className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 font-medium"
                >
                  <Pencil className="w-3 h-3" />
                  Corrigir
                </button>
                <button
                  type="button"
                  onClick={() => onUndoActivity(item.id)}
                  className="inline-flex items-center gap-1 text-[#2563EB] hover:text-blue-700 font-medium"
                >
                  <RotateCcw className="w-3 h-3" />
                  Desfazer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <section
        aria-labelledby="heading-atividade-agente"
        className="bg-white rounded-xl border border-slate-200/90 p-5 flex flex-col h-full"
      >
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <h2 id="heading-atividade-agente" className="text-[15px] font-semibold text-slate-900">
              Atividade do agente
            </h2>
            <span className="text-[11px] font-medium text-slate-500">
              Tempo real
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowAllModal(true)}
            className="text-[12.5px] font-medium text-[#2563EB] hover:text-blue-700 transition-colors"
          >
            Ver tudo
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-4 animate-pulse" aria-busy="true">
            {[1, 2, 3, 4].map((idx) => (
              <div key={idx} className="pl-6 space-y-2">
                <div className="h-3 bg-slate-200 rounded w-36" />
                <div className="h-3.5 bg-slate-100 rounded w-full" />
              </div>
            ))}
          </div>
        ) : hasError ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8 px-4 rounded-xl border border-red-200 bg-red-50/40">
            <AlertCircle className="w-6 h-6 text-red-600 mb-2" />
            <p className="text-[13px] font-semibold text-slate-900">
              Erro ao carregar a linha do tempo
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
        ) : visibleActivities.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-10 px-4 rounded-xl border border-slate-200/80 bg-[#F8F9FB]">
            <Bot className="w-6 h-6 text-[#5B3FD0] mb-2" />
            <p className="text-[13.5px] font-semibold text-slate-900">
              Nenhuma atividade registrada neste período
            </p>
            <p className="text-[12px] text-slate-500 mt-1">
              Use a barra de comando acima para pedir uma ação ao agente.
            </p>
          </div>
        ) : (
          <div className="flex-1">
            {visibleActivities.map((item, idx) =>
              renderTimelineItem(item, idx === visibleActivities.length - 1)
            )}
          </div>
        )}
      </section>

      {/* "Ver tudo" Modal */}
      {showAllModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/35 backdrop-blur-[1px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-atividade-completa"
        >
          <div className="bg-white rounded-xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
              <div>
                <h3
                  id="modal-atividade-completa"
                  className="text-[15px] font-semibold text-slate-900"
                >
                  Histórico completo do agente
                </h3>
                <p className="text-[12px] text-slate-500">
                  Todas as ações executadas e registradas automaticamente
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAllModal(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                aria-label="Fechar histórico"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 py-2.5 border-b border-slate-100 flex flex-wrap items-center gap-1.5 bg-[#F8F9FB]">
              {(['Todos', 'Pedido seu', 'WhatsApp', 'PDF', 'E-mail', 'Portal'] as const).map(
                (origin) => (
                  <button
                    key={origin}
                    type="button"
                    onClick={() => setOriginFilter(origin)}
                    className={`px-2.5 py-1 rounded-lg text-[11.5px] font-medium transition-colors ${
                      originFilter === origin
                        ? 'bg-[#2563EB] text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {origin}
                  </button>
                )
              )}
            </div>

            <div className="p-5 overflow-y-auto flex-1">
              {filteredModalActivities.length === 0 ? (
                <div className="py-10 text-center text-[13px] text-slate-500">
                  Nenhum registro encontrado para a origem &ldquo;{originFilter}&rdquo;.
                </div>
              ) : (
                filteredModalActivities.map((item, idx) =>
                  renderTimelineItem(item, idx === filteredModalActivities.length - 1)
                )
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
