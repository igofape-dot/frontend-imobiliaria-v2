import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Bot,
  ArrowRight,
  RotateCcw,
  Inbox,
  UserX,
  Split,
  Paperclip,
  Check,
} from 'lucide-react';
import {
  ORDER_CATEGORIES,
  type IntakeMessageItem,
  type OrderCategory,
  type OrderChannel,
} from '../../data/agentOrdersData';
import { ChannelIcon, WordTruncatedText } from './OrderHelpers';

interface IntakeTabProps {
  intakeItems: IntakeMessageItem[];
  isLoading: boolean;
  hasError?: boolean;
  onRetry?: () => void;
  onOpenOrderByProtocol: (protocol: string) => void;
  onClassifyIntakeItem: (itemId: string, category: OrderCategory) => void;
}

const CHANNELS_INFO: {
  channel: OrderChannel;
  statusLabel: string;
  baseCount: number;
}[] = [
  { channel: 'WhatsApp', statusLabel: 'Conectado · tempo real', baseCount: 142 },
  { channel: 'E-mail', statusLabel: 'IMAP sincronizado', baseCount: 96 },
  { channel: 'Chat do sistema', statusLabel: 'Ativo na central', baseCount: 68 },
  { channel: 'Portais', statusLabel: 'ZAP / VivaReal ativos', baseCount: 54 },
  { channel: 'Upload de documentos', statusLabel: 'OCR ativo', baseCount: 31 },
];

const CATEGORIES = (Object.keys(ORDER_CATEGORIES) as OrderCategory[]).filter(
  (c) => c !== 'Triagem (não classificado)'
);

export function IntakeTab({
  intakeItems,
  isLoading,
  hasError = false,
  onRetry,
  onOpenOrderByProtocol,
  onClassifyIntakeItem,
}: IntakeTabProps) {
  const [selectedChannel, setSelectedChannel] = useState<'all' | OrderChannel>('all');
  const [outcomeFilter, setOutcomeFilter] = useState<'all' | 'triage'>('all');
  const [selectedCategories, setSelectedCategories] = useState<Record<string, OrderCategory>>({});

  const filteredItems = useMemo(() => {
    return intakeItems.filter((item) => {
      if (selectedChannel !== 'all' && item.channel !== selectedChannel) return false;
      if (outcomeFilter === 'triage') {
        const needsTriage =
          (item.outcomeType === 'triage_unclassified' ||
            item.outcomeType === 'unidentified_requester') &&
          !item.resolved;
        if (!needsTriage) return false;
      }
      return true;
    });
  }, [intakeItems, selectedChannel, outcomeFilter]);

  const pendingTriageCount = intakeItems.filter(
    (i) =>
      (i.outcomeType === 'triage_unclassified' || i.outcomeType === 'unidentified_requester') &&
      !i.resolved
  ).length;

  return (
    <div className="space-y-5">
      {/* Faixa de canais */}
      <section aria-label="Canais de entrada monitorados pelo agente">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {CHANNELS_INFO.map((ch) => {
            const isSelected = selectedChannel === ch.channel;
            const liveExtra = intakeItems.filter((i) => i.channel === ch.channel).length;
            return (
              <button
                key={ch.channel}
                type="button"
                onClick={() =>
                  setSelectedChannel((prev) => (prev === ch.channel ? 'all' : ch.channel))
                }
                aria-pressed={isSelected}
                className={`text-left rounded-xl border p-3.5 transition-colors ${
                  isSelected
                    ? 'border-[#2563EB] bg-[#EFF4FF]/55 ring-1 ring-[#2563EB]/25'
                    : 'border-slate-200/90 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <ChannelIcon channel={ch.channel} />
                    <span className="text-[13px] font-semibold text-slate-900 truncate">
                      {ch.channel}
                    </span>
                  </div>
                  <span className="text-[16px] font-bold text-slate-900 tabular-nums">
                    {ch.baseCount + Math.max(0, liveExtra - 2)}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span className="truncate">{ch.statusLabel}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200/90 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-[14.5px] font-semibold text-slate-900">
            Mensagens brutas e resultados de triagem
          </h2>
          {pendingTriageCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold tabular-nums">
              <AlertTriangle className="w-3 h-3" />
              {pendingTriageCount} em triagem
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div
            role="group"
            aria-label="Filtrar fila de entradas"
            className="inline-flex items-center p-1 rounded-lg bg-[#F8F9FB] border border-slate-200/80"
          >
            <button
              type="button"
              onClick={() => setOutcomeFilter('all')}
              className={`px-3 py-1 rounded-md text-[12px] font-medium transition-colors ${
                outcomeFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/70'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todas ({intakeItems.length})
            </button>
            <button
              type="button"
              onClick={() => setOutcomeFilter('triage')}
              className={`px-3 py-1 rounded-md text-[12px] font-medium transition-colors ${
                outcomeFilter === 'triage'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/70'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Somente triagem ({pendingTriageCount})
            </button>
          </div>
        </div>
      </div>

      {/* Intake List */}
      {isLoading ? (
        <div className="space-y-3 animate-pulse" aria-busy="true">
          {[1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-slate-200/90 p-4 h-24"
            />
          ))}
        </div>
      ) : hasError ? (
        <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
          <AlertTriangle className="w-7 h-7 text-red-600 mx-auto mb-2" />
          <p className="text-[14px] font-semibold text-slate-900">
            Erro ao sincronizar entradas brutas
          </p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-[12px] font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Tentar novamente
            </button>
          )}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/90 p-10 text-center">
          <Inbox className="w-7 h-7 text-slate-400 mx-auto mb-2" />
          <p className="text-[14px] font-semibold text-slate-900">
            Nenhuma entrada encontrada para este filtro
          </p>
          <p className="text-[12.5px] text-slate-500 mt-1">
            Novas mensagens recebidas pelos canais aparecerão aqui automaticamente.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const isTriage =
              (item.outcomeType === 'triage_unclassified' ||
                item.outcomeType === 'unidentified_requester') &&
              !item.resolved;
            const chosenCategory =
              selectedCategories[item.id] ??
              (item.suggestedCategory === 'Triagem (não classificado)'
                ? 'Cobrança e financeiro'
                : item.suggestedCategory);

            return (
              <article
                key={item.id}
                className={`bg-white rounded-xl border p-4 space-y-3 ${
                  isTriage ? 'border-amber-300/90' : 'border-slate-200/90'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-[12px]">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-slate-900">
                        <ChannelIcon channel={item.channel} className="w-3.5 h-3.5" />
                        {item.channel}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="font-medium text-slate-700">{item.senderRaw}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-500 tabular-nums">{item.receivedAt}</span>
                    </div>

                    <p className="text-[13px] text-slate-800 leading-relaxed">
                      <WordTruncatedText text={item.fullText} maxChars={190} />
                    </p>
                  </div>

                  {/* Outcome status */}
                  <div className="flex flex-col items-start lg:items-end gap-2 shrink-0">
                    {item.resolved ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11.5px] font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Classificado: {item.confirmedCategory}
                      </span>
                    ) : item.outcomeType === 'created_order' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-[#2563EB] text-[11.5px] font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {item.outcomeLabel}
                      </span>
                    ) : item.outcomeType === 'attached_order' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F3F0FF] border border-[#5B3FD0]/25 text-[#5B3FD0] text-[11.5px] font-semibold">
                        <Paperclip className="w-3.5 h-3.5" />
                        {item.outcomeLabel}
                      </span>
                    ) : item.outcomeType === 'split_orders' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-[#2563EB] text-[11.5px] font-semibold">
                        <Split className="w-3.5 h-3.5" />
                        {item.outcomeLabel}
                      </span>
                    ) : item.outcomeType === 'unidentified_requester' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[11.5px] font-semibold">
                        <UserX className="w-3.5 h-3.5" />
                        {item.outcomeLabel}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 border border-red-200 text-red-700 text-[11.5px] font-semibold">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {item.outcomeLabel}
                      </span>
                    )}

                    {item.linkedProtocols.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {item.linkedProtocols.map((prot) => (
                          <button
                            key={prot}
                            type="button"
                            onClick={() => onOpenOrderByProtocol(prot)}
                            className="inline-flex items-center gap-1 text-[11.5px] font-mono font-semibold text-[#2563EB] hover:underline"
                          >
                            <span>Abrir {prot}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 1-click triage confirmation / correction */}
                {isTriage && (
                  <div className="pt-3 border-t border-amber-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50/40 -mx-4 -mb-4 px-4 py-3 rounded-b-xl">
                    <div className="flex items-center gap-2 text-[12px] text-slate-700">
                      <Bot className="w-4 h-4 text-[#5B3FD0] shrink-0" />
                      <span>
                        Classificar entrada em 1 clique ·{' '}
                        <strong className="font-semibold text-[#5B3FD0]">
                          A correção treina o agente
                        </strong>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={chosenCategory}
                        onChange={(e) =>
                          setSelectedCategories((prev) => ({
                            ...prev,
                            [item.id]: e.target.value as OrderCategory,
                          }))
                        }
                        aria-label="Selecionar categoria correta para treinar o agente"
                        className="h-8 px-2.5 rounded-lg border border-slate-300 bg-white text-[12px] text-slate-800"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => onClassifyIntakeItem(item.id, chosenCategory)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-[12px] font-semibold transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Confirmar categoria
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
