import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  X,
  Paperclip,
  Sparkles,
  Terminal,
  Loader2,
  CheckCircle2,
  FileText,
  ArrowRight,
} from 'lucide-react';
import {
  SLA_BY_PRIORITY,
  truncateAtWordBoundary,
  type AgentOrder,
  type OrderCategory,
  type OrderPriority,
} from '../../data/agentOrdersData';
import { PriorityBadge, StatusBadge } from './OrderHelpers';

export function inferOrderInterpretation(
  rawText: string,
  attachmentName?: string
): {
  category: OrderCategory;
  subtype: string;
  priority: OrderPriority;
  subject: string;
  objective: string;
  narrative: string;
  slaCommitted: string;
  slaText: string;
  confidence: number;
} {
  const lower = rawText.toLowerCase();

  let category: OrderCategory = 'Consulta e relatório';
  let subtype = 'Resumo operacional';
  let priority: OrderPriority = 'Normal';

  if (lower.includes('vazamento') || lower.includes('urgente') || lower.includes('emerg')) {
    category = 'Manutenção e vistoria';
    subtype = 'Chamado';
    priority = 'Urgente';
  } else if (lower.includes('renovar') || lower.includes('renovação') || lower.includes('reajuste')) {
    category = 'Locação e contratos';
    subtype = lower.includes('reajuste') ? 'Reajuste anual' : 'Renovação';
    priority = 'Alta';
  } else if (lower.includes('cobrar') || lower.includes('atraso') || lower.includes('boleto') || lower.includes('repasse')) {
    category = 'Cobrança e financeiro';
    subtype = lower.includes('repasse')
      ? 'Repasse'
      : lower.includes('boleto')
      ? 'Segunda via de boleto'
      : 'Cobrança';
    priority = 'Alta';
  } else if (attachmentName || lower.includes('pdf') || lower.includes('cadastrar') || lower.includes('imóvel')) {
    category = 'Cadastro e atualização';
    subtype = lower.includes('contrato') ? 'Cadastro de contrato' : 'Cadastro de imóvel';
    priority = 'Normal';
  } else if (lower.includes('visita') || lower.includes('lead') || lower.includes('captação') || lower.includes('preço')) {
    category = 'Vendas e captação';
    subtype = lower.includes('captação') ? 'Captação de imóvel' : 'Proposta de compra';
    priority = 'Normal';
  } else if (lower.includes('aditivo') || lower.includes('notifica') || lower.includes('minuta')) {
    category = 'Jurídico e documentos';
    subtype = 'Minuta de contrato';
    priority = 'Alta';
  } else if (lower.includes('resumo') || lower.includes('relatório') || lower.includes('inadimplência')) {
    category = 'Consulta e relatório';
    subtype = 'Relatório';
    priority = 'Normal';
  } else if (lower.includes('avisar') || lower.includes('follow-up') || lower.includes('mensagem')) {
    category = 'Comunicação';
    subtype = 'Follow-up comercial';
    priority = 'Normal';
  }

  const cleanSource = rawText.trim() || `Processar anexo ${attachmentName}`;
  const rawSubject = attachmentName
    ? `${cleanSource} (${attachmentName})`
    : cleanSource;
  const subject =
    rawSubject.length <= 60
      ? rawSubject
      : truncateAtWordBoundary(rawSubject, 59).display.replace(/…$/, '');

  const rawObjective = attachmentName
    ? `Interpretar "${attachmentName}" e executar: ${cleanSource}`
    : `Executar solicitação operacional: ${cleanSource}`;
  const objective = rawObjective.slice(0, 140);

  const rawNarrative = attachmentName
    ? `Pedido registrado via Chat do sistema com anexo "${attachmentName}". O agente classificou em ${category} > ${subtype} e preparou a execução automática conforme as regras da Farina Imobiliária.`
    : `Pedido registrado via Chat do sistema com texto livre: "${cleanSource}". O agente classificou em ${category} > ${subtype} e iniciou o fluxo com rastreabilidade completa.`;
  const narrative = rawNarrative.slice(0, 400);

  const slaRule = SLA_BY_PRIORITY[priority];
  const slaText =
    priority === 'Urgente'
      ? 'em 4h'
      : priority === 'Alta'
      ? 'em 1 dia útil'
      : priority === 'Normal'
      ? 'em 3 dias úteis'
      : 'em 7 dias úteis';

  return {
    category,
    subtype,
    priority,
    subject,
    objective,
    narrative,
    slaCommitted: `${slaRule.delivery} (conf. ${slaRule.confirmation})`,
    slaText,
    confidence: attachmentName ? 95 : 96,
  };
}

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateOrder: (rawText: string, attachmentName?: string) => AgentOrder;
  onOpenCreatedOrder: (orderId: string) => void;
}

export function CreateOrderModal({
  isOpen,
  onClose,
  onCreateOrder,
  onOpenCreatedOrder,
}: CreateOrderModalProps) {
  const [rawText, setRawText] = useState('');
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [phase, setPhase] = useState<'compose' | 'interpreting' | 'interpreted'>('compose');
  const [createdOrder, setCreatedOrder] = useState<AgentOrder | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setRawText('');
      setAttachmentName(null);
      setPhase('compose');
      setCreatedOrder(null);
      if (timerRef.current) window.clearTimeout(timerRef.current);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = rawText.trim();
    if (!trimmed && !attachmentName) return;

    const finalText = trimmed || `Processar documento anexado ${attachmentName}`;
    const order = onCreateOrder(finalText, attachmentName ?? undefined);
    setCreatedOrder(order);
    setPhase('interpreting');

    timerRef.current = window.setTimeout(() => {
      setPhase('interpreted');
    }, 950);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAttachmentName(file.name);
    e.target.value = '';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/35 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-order-title"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full max-w-2xl bg-white rounded-xl border border-slate-200 overflow-hidden shadow-lg">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-[#F3F0FF] text-[#5B3FD0] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h2 id="create-order-title" className="text-[15.5px] font-bold text-slate-900">
                Fazer pedido ao agente
              </h2>
              <p className="text-[12px] text-slate-500">
                Escreva em linguagem natural — o agente preenche a ficha e protocola tudo
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {phase === 'compose' && (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="flex items-center justify-between text-[12px]">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F3F0FF] text-[#5B3FD0] font-semibold">
                <Terminal className="w-3.5 h-3.5" />
                Canal: Chat do sistema
              </span>
              <span className="text-slate-500">Sem formulários manuais</span>
            </div>

            <div>
              <label htmlFor="free-order-input" className="sr-only">
                Descreva o que você precisa
              </label>
              <textarea
                id="free-order-input"
                rows={4}
                autoFocus
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Ex.: Preciso renovar o contrato da Rua das Acácias 120 por 12 meses com IPCA e enviar a minuta para a proprietária..."
                className="w-full rounded-xl border border-slate-300 bg-[#F8F9FB] focus:bg-white focus:border-[#5B3FD0] p-3.5 text-[13.5px] text-slate-900 placeholder:text-slate-400 leading-relaxed"
              />
            </div>

            {attachmentName && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F3F0FF] border border-[#5B3FD0]/25 text-[12px] font-medium text-[#5B3FD0]">
                <FileText className="w-3.5 h-3.5" />
                <span>{attachmentName}</span>
                <button
                  type="button"
                  onClick={() => setAttachmentName(null)}
                  className="hover:text-slate-900"
                  aria-label="Remover anexo"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div>
                <input
                  ref={fileRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xlsx,.csv"
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[12.5px] font-medium text-slate-700"
                >
                  <Paperclip className="w-4 h-4" />
                  Anexar documento
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-[12.5px] font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!rawText.trim() && !attachmentName}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-[12.5px] font-semibold transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  Enviar pedido
                </button>
              </div>
            </div>
          </form>
        )}

        {phase === 'interpreting' && createdOrder && (
          <div className="p-8 text-center space-y-3">
            <div className="w-11 h-11 rounded-full bg-[#F3F0FF] text-[#5B3FD0] flex items-center justify-center mx-auto">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
            <div className="font-mono text-[13px] font-bold text-slate-900">
              {createdOrder.protocol}
            </div>
            <h3 className="text-[16px] font-semibold text-slate-900">Interpretando…</h3>
            <p className="text-[12.5px] text-slate-500 max-w-md mx-auto">
              Gerando ficha padronizada, classificando categoria, definindo prioridade e comprometendo prazo de SLA.
            </p>
          </div>
        )}

        {phase === 'interpreted' && createdOrder && (
          <div className="p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-mono text-[14px] font-bold text-slate-900">
                  {createdOrder.protocol}
                </span>
                <StatusBadge status="Interpretado" />
                <PriorityBadge priority={createdOrder.priority} />
              </div>
              <span className="text-[11.5px] text-slate-500">
                Prazo: <strong className="text-slate-800">{createdOrder.slaCommitted}</strong>
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-[#F8F9FB] p-4 space-y-3">
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Assunto</span>
                  <span className="font-mono tabular-nums">{createdOrder.subject.length}/60</span>
                </div>
                <div className="text-[14px] font-semibold text-slate-900 mt-0.5">
                  {createdOrder.subject}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Objetivo</span>
                  <span className="font-mono tabular-nums">
                    {createdOrder.objective.length}/140
                  </span>
                </div>
                <div className="text-[12.5px] text-slate-800 mt-0.5">
                  {createdOrder.objective}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Narrativa</span>
                  <span className="font-mono tabular-nums">
                    {createdOrder.narrative.length}/400
                  </span>
                </div>
                <div className="text-[12px] text-slate-600 mt-0.5 leading-relaxed">
                  {createdOrder.narrative}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-[12px]">
                <span className="text-slate-700 font-medium">
                  {createdOrder.category} &gt; {createdOrder.subtype}
                </span>
                <span className="text-[#5B3FD0] font-medium">
                  Canal: {createdOrder.channel}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-lg border border-slate-200 text-[12.5px] font-medium text-slate-700 hover:bg-slate-50"
              >
                Permanecer na lista
              </button>
              <button
                type="button"
                onClick={() => {
                  onOpenCreatedOrder(createdOrder.id);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-[12.5px] font-semibold"
              >
                <span>Abrir ficha do pedido</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
