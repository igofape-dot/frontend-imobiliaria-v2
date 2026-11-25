import { useState } from 'react';
import {
  Bot,
  Sparkles,
  Pencil,
  Check,
  X,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
} from 'lucide-react';
import type { BrokerRankingItem, SemaphoreStatus } from '../data/commandCenterData';

interface BrokerRankingCardProps {
  brokers: BrokerRankingItem[];
  isLoading: boolean;
  onTriggerBrokerAction: (broker: BrokerRankingItem) => void;
  onCorrectBrokerProduction: (id: string, newProduction: string) => void;
}

function StatusIcon({ status }: { status: SemaphoreStatus }) {
  if (status === 'verde') {
    return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-label="Saudável" />;
  }
  if (status === 'ambar') {
    return <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" aria-label="Atenção" />;
  }
  return <AlertOctagon className="w-3.5 h-3.5 text-red-600 shrink-0" aria-label="Crítico" />;
}

export function BrokerRankingCard({
  brokers,
  isLoading,
  onTriggerBrokerAction,
  onCorrectBrokerProduction,
}: BrokerRankingCardProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const startEdit = (item: BrokerRankingItem) => {
    setEditingId(item.id);
    setEditValue(item.production);
  };

  const saveEdit = (id: string) => {
    if (editValue.trim()) {
      onCorrectBrokerProduction(id, editValue.trim());
    }
    setEditingId(null);
  };

  return (
    <section
      aria-labelledby="heading-ranking-corretores"
      className="bg-white rounded-xl border border-slate-200/90 p-5 flex flex-col justify-between h-full"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <h2
            id="heading-ranking-corretores"
            className="text-[15px] font-semibold text-slate-900"
          >
            Ranking de corretores
          </h2>
          <span className="text-[11.5px] text-slate-500">Produção &amp; resposta</span>
        </div>

        {isLoading ? (
          <div className="space-y-3 animate-pulse" aria-busy="true">
            {[1, 2, 3, 4].map((idx) => (
              <div key={idx} className="h-14 bg-slate-100 rounded-lg" />
            ))}
          </div>
        ) : brokers.length === 0 ? (
          <div className="py-10 text-center text-[13px] text-slate-500">
            Nenhum corretor com movimentação registrada no período.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {brokers.map((broker, idx) => {
              const isEditing = editingId === broker.id;
              return (
                <div key={broker.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-[#F8F9FB] border border-slate-200 text-[11px] font-bold text-slate-700 flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[13px] font-semibold text-slate-900 truncate">
                            {broker.name}
                          </span>
                          <StatusIcon status={broker.status} />
                        </div>
                        <div className="text-[11.5px] text-slate-500 truncate">
                          {broker.role}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            aria-label={`Corrigir produção de ${broker.name}`}
                            className="w-24 px-1.5 py-0.5 text-[12px] font-semibold border border-[#2563EB] rounded bg-white tabular-nums"
                          />
                          <button
                            type="button"
                            onClick={() => saveEdit(broker.id)}
                            className="p-1 rounded bg-[#2563EB] text-white"
                            aria-label="Salvar"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="p-1 rounded border border-slate-200 text-slate-500"
                            aria-label="Cancelar"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1">
                          <span className="text-[13px] font-bold text-slate-900 tabular-nums">
                            {broker.production}
                          </span>
                          <button
                            type="button"
                            onClick={() => startEdit(broker)}
                            className="text-slate-400 hover:text-slate-700 p-0.5"
                            aria-label={`Corrigir produção de ${broker.name}`}
                            title="Corrigir em 1 clique"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      <div className="text-[11px] text-slate-500 tabular-nums">
                        {broker.contractsCount} fech. · {broker.conversionPct.toFixed(1).replace('.', ',')}% conv.
                      </div>
                    </div>
                  </div>

                  <div className="mt-1.5 pl-7 flex items-center justify-between gap-2 text-[11px]">
                    <span className="text-slate-500 tabular-nums">
                      Resp. média:{' '}
                      <strong
                        className={
                          broker.avgResponseMin > 20 ? 'text-red-700' : 'text-slate-700'
                        }
                      >
                        {broker.avgResponseMin} min
                      </strong>
                    </span>

                    <button
                      type="button"
                      onClick={() => onTriggerBrokerAction(broker)}
                      className="inline-flex items-center gap-1 text-[#5B3FD0] hover:text-[#4C32B8] font-medium"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>
                        {broker.avgResponseMin > 20 ? 'Redistribuir leads' : 'Pedir resumo'}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-[#5B3FD0] font-medium">
        <Bot className="w-3.5 h-3.5" />
        <span>Registrado pelo agente</span>
      </div>
    </section>
  );
}
