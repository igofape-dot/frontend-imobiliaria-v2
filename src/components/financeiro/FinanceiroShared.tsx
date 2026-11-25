import { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Bot,
  Pencil,
  Check,
  X,
  ShieldCheck,
  Clock,
  Ban,
  Sparkles,
} from 'lucide-react';
import type { FinanceSemaphore } from '../../data/financeiroData';
import type { Modo } from '../../data/rulesData';

export function SemaphoreBadge({
  semaphore,
  label,
  title,
}: {
  semaphore: FinanceSemaphore;
  label: string;
  title?: string;
}) {
  if (semaphore === 'verde') {
    return (
      <span
        title={title}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border bg-emerald-50 text-emerald-800 border-emerald-200 text-[11px] font-semibold whitespace-nowrap shrink-0"
      >
        <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
        <span>{label}</span>
      </span>
    );
  }
  if (semaphore === 'ambar') {
    return (
      <span
        title={title}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border bg-amber-50 text-amber-800 border-amber-200 text-[11px] font-semibold whitespace-nowrap shrink-0"
      >
        <AlertTriangle className="w-3 h-3" aria-hidden="true" />
        <span>{label}</span>
      </span>
    );
  }
  return (
    <span
      title={title}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border bg-red-50 text-red-700 border-red-200 text-[11px] font-semibold whitespace-nowrap shrink-0"
    >
      <AlertOctagon className="w-3 h-3" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}

export function PolicyModeBadge({ modo }: { modo: Modo }) {
  if (modo === 'autonomo') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border bg-emerald-50 text-emerald-800 border-emerald-200 text-[11px] font-semibold whitespace-nowrap">
        <ShieldCheck className="w-3 h-3" />
        Autônomo
      </span>
    );
  }
  if (modo === 'aprovacao') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border bg-amber-50 text-amber-800 border-amber-200 text-[11px] font-semibold whitespace-nowrap">
        <Clock className="w-3 h-3" />
        Pede aprovação
      </span>
    );
  }
  if (modo === 'sugerir') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border bg-blue-50 text-[#2563EB] border-blue-200 text-[11px] font-semibold whitespace-nowrap">
        <Sparkles className="w-3 h-3" />
        Sugere
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border bg-red-50 text-red-700 border-red-200 text-[11px] font-semibold whitespace-nowrap">
      <Ban className="w-3 h-3" />
      Bloqueado
    </span>
  );
}

export function RuleAppliedChip({
  ruleId,
  versao,
  onOpenRule,
}: {
  ruleId: string;
  versao?: number;
  onOpenRule: (ruleId: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpenRule(ruleId)}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-[#5B3FD0]/25 bg-[#F3F0FF]/70 hover:bg-[#EDE9FE] text-[#5B3FD0] text-[11px] font-semibold transition-colors whitespace-nowrap"
      title={`Abrir detalhes da regra ${ruleId}`}
    >
      <span>
        Regra aplicada: {ruleId}
        {versao ? ` v${versao}` : ''}
      </span>
    </button>
  );
}

export function AgentRegisteredTag({ label }: { label: string }) {
  const isCorrected = label.toLowerCase().includes('corrigido');
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-medium ${
        isCorrected ? 'text-slate-600' : 'text-[#5B3FD0]'
      }`}
    >
      <Bot className="w-3 h-3 shrink-0" />
      <span>{label}</span>
    </span>
  );
}

export function InlineOneClickCorrector({
  value,
  ariaLabel,
  onSave,
}: {
  value: string;
  ariaLabel: string;
  onSave: (newVal: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (!editing) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setDraft(value);
          setEditing(true);
        }}
        title="Corrigir em 1 clique"
        aria-label={ariaLabel}
        className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>
    );
  }

  return (
    <div
      className="inline-flex items-center gap-1"
      onClick={(e) => e.stopPropagation()}
    >
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        aria-label={ariaLabel}
        className="w-28 px-2 py-1 text-[12px] font-semibold border border-[#2563EB] rounded-lg bg-white text-slate-900 tabular-nums"
      />
      <button
        type="button"
        onClick={() => {
          if (draft.trim()) onSave(draft.trim());
          setEditing(false);
        }}
        className="p-1 rounded-md bg-[#2563EB] text-white"
        aria-label="Salvar correção"
      >
        <Check className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => setEditing(false)}
        className="p-1 rounded-md border border-slate-200 text-slate-600 bg-white"
        aria-label="Cancelar"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
