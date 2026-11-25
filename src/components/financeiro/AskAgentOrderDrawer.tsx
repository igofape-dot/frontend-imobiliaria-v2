import { useEffect, useState } from 'react';
import {
  X,
  Sparkles,
  Bot,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';
import {
  avaliarRegra,
  type PolicyActionType,
  type PolicyEvalParams,
  type PolicyEvaluationResult,
} from '../../data/financeiroData';
import type { Regra } from '../../data/rulesData';
import type { AgentOrder, OrderCategory, OrderLinkChip } from '../../data/agentOrdersData';
import { PolicyModeBadge, RuleAppliedChip } from './FinanceiroShared';

export interface AskAgentRequestPayload {
  title: string;
  prefillText: string;
  categoria?: OrderCategory;
  subtipo: string;
  actionType: PolicyActionType;
  evalParams: PolicyEvalParams;
  links?: OrderLinkChip[];
  requiresExtraConfirmation?: boolean;
  extraConfirmationText?: string;
  gapMessage?: string;
  gapCtaLabel?: string;
}

interface AskAgentOrderDrawerProps {
  request: AskAgentRequestPayload | null;
  rules: Regra[];
  onClose: () => void;
  onConfirmRequest: (payload: {
    promptText: string;
    categoria?: OrderCategory;
    subtipo: string;
    evaluation: PolicyEvaluationResult;
    links?: OrderLinkChip[];
  }) => AgentOrder;
  onOpenRuleById: (ruleId: string) => void;
  onOpenOrderInCenter: (orderId: string) => void;
  onCreateRuleFromGap?: () => void;
}

export function AskAgentOrderDrawer({
  request,
  rules,
  onClose,
  onConfirmRequest,
  onOpenRuleById,
  onOpenOrderInCenter,
  onCreateRuleFromGap,
}: AskAgentOrderDrawerProps) {
  const [promptText, setPromptText] = useState('');
  const [createdOrder, setCreatedOrder] = useState<{
    order: AgentOrder;
    evaluation: PolicyEvaluationResult;
  } | null>(null);
  const [impactConfirmed, setImpactConfirmed] = useState(false);

  useEffect(() => {
    if (!request) return;
    setPromptText(request.prefillText);
    setCreatedOrder(null);
    setImpactConfirmed(!request.requiresExtraConfirmation);
  }, [request]);

  useEffect(() => {
    if (!request) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [request, onClose]);

  if (!request) return null;

  const evaluation = avaliarRegra(request.actionType, request.evalParams, rules);
  const categoriaLabel = request.categoria ?? 'Cobrança e financeiro';

  const handleConfirm = () => {
    if (!promptText.trim()) return;
    const order = onConfirmRequest({
      promptText: promptText.trim(),
      categoria: categoriaLabel,
      subtipo: request.subtipo,
      evaluation,
      links: request.links,
    });
    setCreatedOrder({ order, evaluation });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ask-agent-drawer-title"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full max-w-xl bg-white h-full border-l border-slate-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-start gap-3">
            <span className="w-9 h-9 rounded-lg bg-[#F3F0FF] text-[#5B3FD0] flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h2 id="ask-agent-drawer-title" className="text-[16px] font-bold text-slate-900">
                {request.title}
              </h2>
              <p className="text-[12px] text-slate-500 mt-0.5">
                Categoria: {categoriaLabel} · Subtipo: {request.subtipo}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Fechar painel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {createdOrder ? (
            <div className="space-y-4">
              <div
                className={`rounded-xl border p-4 ${
                  createdOrder.evaluation.modo === 'autonomo'
                    ? 'border-emerald-200 bg-emerald-50/50'
                    : createdOrder.evaluation.modo === 'aprovacao' || createdOrder.evaluation.modo === 'sugerir'
                    ? 'border-amber-200 bg-amber-50/50'
                    : 'border-red-200 bg-red-50/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {createdOrder.evaluation.modo === 'autonomo' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  ) : createdOrder.evaluation.modo === 'aprovacao' || createdOrder.evaluation.modo === 'sugerir' ? (
                    <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  ) : (
                    <ShieldAlert className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[13px] font-bold text-[#2563EB]">
                        {createdOrder.order.protocol}
                      </span>
                      <PolicyModeBadge modo={createdOrder.evaluation.modo} />
                    </div>
                    <p className="text-[13.5px] font-semibold text-slate-900">
                      {createdOrder.evaluation.lacunaRegra
                        ? `Lacuna de regra · ${createdOrder.evaluation.resultadoTexto}`
                        : `Regra aplicada: ${createdOrder.evaluation.regraId} v${createdOrder.evaluation.versao} · ${createdOrder.evaluation.resultadoTexto}`}
                    </p>
                    <p className="text-[12.5px] text-slate-700 leading-relaxed">
                      {createdOrder.evaluation.motivo}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-[#F8F9FB] p-4 space-y-2 text-[12.5px]">
                <div className="font-semibold text-slate-800">
                  Pedido formal registrado na Central de Pedidos
                </div>
                <p className="text-slate-600">{createdOrder.order.subject}</p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <RuleAppliedChip
                    ruleId={createdOrder.evaluation.regraId}
                    versao={createdOrder.evaluation.versao}
                    onOpenRule={onOpenRuleById}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      onOpenOrderInCenter(createdOrder.order.id);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-[12px] font-semibold"
                  >
                    <span>Abrir pedido em Agente de IA</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div>
                <label
                  htmlFor="pedir-agente-textarea"
                  className="block text-[12.5px] font-semibold text-slate-800 mb-1.5"
                >
                  Instrução ao agente (edite se necessário)
                </label>
                <textarea
                  id="pedir-agente-textarea"
                  rows={4}
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-[13.5px] text-slate-900 focus:outline-none focus:border-[#5B3FD0]"
                />
                <div className="mt-1.5 flex items-center gap-1.5 text-[11.5px] text-slate-500">
                  <Bot className="w-3.5 h-3.5 text-[#5B3FD0]" />
                  <span>
                    Ao confirmar, gera protocolo formal <span className="font-mono">PED-2026-00xxxx</span> e consulta as regras em vigor.
                  </span>
                </div>
              </div>

              {/* Policy Evaluation Preview */}
              <div className="rounded-xl border border-slate-200 bg-[#F8F9FB] p-4 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500">
                    Avaliação prévia do motor de políticas
                  </span>
                  {evaluation.lacunaRegra ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold">
                      Lacuna de regra
                    </span>
                  ) : (
                    <RuleAppliedChip
                      ruleId={evaluation.regraId}
                      versao={evaluation.versao}
                      onOpenRule={onOpenRuleById}
                    />
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <PolicyModeBadge modo={evaluation.modo} />
                  <span className="text-[13px] font-semibold text-slate-900">
                    {evaluation.resultadoTexto}
                  </span>
                </div>

                <p className="text-[12.5px] text-slate-600 leading-relaxed">
                  {evaluation.motivo}
                </p>

                {evaluation.portoes && evaluation.portoes.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {evaluation.portoes.map((gate) => (
                      <div
                        key={gate.nome}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 flex items-start justify-between gap-2 text-[11.5px]"
                      >
                        <div>
                          <div className="font-semibold text-slate-800">{gate.nome}</div>
                          <div className="text-slate-600">{gate.detalhe}</div>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-semibold shrink-0 whitespace-nowrap ${
                            gate.status === 'ok'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : gate.status === 'pendente'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {gate.status === 'ok' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" /> OK
                            </>
                          ) : gate.status === 'pendente' ? (
                            <>
                              <AlertTriangle className="w-3 h-3" /> Pendente
                            </>
                          ) : (
                            <>
                              <ShieldAlert className="w-3 h-3" /> Bloqueado
                            </>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {evaluation.lacunaRegra && onCreateRuleFromGap && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-[12px] text-amber-950">
                    <span>
                      {request.gapMessage ??
                        'Lacuna de regra: item sem regra ativa no módulo.'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onCreateRuleFromGap();
                      }}
                      className="font-semibold text-[#2563EB] hover:underline"
                    >
                      {request.gapCtaLabel ?? 'Criar regra para reajustes anuais?'}
                    </button>
                  </div>
                )}

                {evaluation.conflitoJuridico && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-800 font-medium">
                    {evaluation.conflitoJuridico}
                  </div>
                )}
              </div>

              {request.requiresExtraConfirmation && request.extraConfirmationText && (
                <label className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={impactConfirmed}
                    onChange={(e) => setImpactConfirmed(e.target.checked)}
                    className="mt-0.5 rounded border-amber-400 text-[#2563EB]"
                  />
                  <span className="text-[12.5px] text-amber-950 leading-snug">
                    {request.extraConfirmationText}
                  </span>
                </label>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-end gap-2.5 shrink-0">
          {createdOrder ? (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-[13px] font-semibold"
            >
              Concluir
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!promptText.trim() || !impactConfirmed}
                onClick={handleConfirm}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#5B3FD0] hover:bg-[#4C32B8] disabled:opacity-50 text-white text-[13px] font-semibold transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>Confirmar pedido ao agente</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
