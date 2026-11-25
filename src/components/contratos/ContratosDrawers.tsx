import { useEffect, useState } from 'react';
import {
  X,
  FileDiff,
  Calculator,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  RotateCcw,
} from 'lucide-react';
import {
  formatBRL,
  avaliarRegra,
} from '../../data/financeiroData';
import type { Regra } from '../../data/rulesData';
import {
  CALCULATION_HUMAN_CHECK_LABEL,
  REFERENCE_INDICES_DISCLAIMER,
} from '../../data/contratosData';
import type { AskAgentRequestPayload } from '../financeiro/AskAgentOrderDrawer';
import { PolicyModeBadge, RuleAppliedChip } from '../financeiro/FinanceiroShared';

export interface ComparatorTarget {
  contractNumber: string;
  locatario: string;
  imovel: string;
  clausulaAlterada: boolean;
  clausulaLabel: string;
  textoModelo: string;
  textoMinuta: string;
  aluguelAntes: number;
  aluguelDepois: number;
  modeloNome: string;
}

export function ContractComparatorDrawer({
  target,
  rules,
  readOnly,
  onClose,
  onOpenRuleById,
  onAskAgent,
}: {
  target: ComparatorTarget | null;
  rules: Regra[];
  readOnly?: boolean;
  onClose: () => void;
  onOpenRuleById: (ruleId: string) => void;
  onAskAgent: (req: AskAgentRequestPayload) => void;
}) {
  useEffect(() => {
    if (!target) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [target, onClose]);

  if (!target) return null;

  const evalEnviar = avaliarRegra(
    'enviar_minuta',
    { clausulaAlterada: target.clausulaAlterada, modeloAprovado: true },
    rules
  );

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="comparator-drawer-title"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-3xl bg-white h-full border-l border-slate-200 flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-start gap-3">
            <span className="w-9 h-9 rounded-lg bg-[#F3F0FF] text-[#5B3FD0] flex items-center justify-center shrink-0 mt-0.5">
              <FileDiff className="w-4 h-4" />
            </span>
            <div>
              <h2 id="comparator-drawer-title" className="text-[16px] font-bold text-slate-900">
                Comparador de minuta · {target.contractNumber}
              </h2>
              <p className="text-[12px] text-slate-500 mt-0.5">
                {target.locatario} · {target.imovel} · Base: {target.modeloNome}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar comparador"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Rule evaluation notice */}
          <div className="rounded-xl border border-slate-200 bg-[#F8F9FB] p-4 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Regra mais restritiva aplicada
                </span>
                <PolicyModeBadge modo={evalEnviar.modo} />
              </div>
              <RuleAppliedChip
                ruleId={evalEnviar.regraId}
                versao={evalEnviar.versao}
                onOpenRule={onOpenRuleById}
              />
            </div>
            <p className="text-[12px] text-slate-700 leading-relaxed">
              {target.clausulaAlterada ? (
                <>
                  Como há alteração fora do modelo padrão ({target.clausulaLabel}), prevalece a regra{' '}
                  <strong>JUR-005 v2</strong> (aprovação do <strong>Jurídico</strong> em 24h), mais restritiva que a{' '}
                  <strong>JUR-002 v4</strong> (Gestor em 8h).
                </>
              ) : (
                <>
                  Minuta 100% aderente ao modelo aprovado ({target.modeloNome}). Apenas o valor foi atualizado de{' '}
                  <span className="tabular-nums font-semibold">{formatBRL(target.aluguelAntes)}</span> para{' '}
                  <span className="tabular-nums font-semibold">{formatBRL(target.aluguelDepois)}</span> (aprovador:{' '}
                  <strong>Gestor</strong> em 8h pela JUR-002 v4).
                </>
              )}
            </p>
          </div>

          {/* Side by side comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-slate-900">Modelo aprovado</span>
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  Padrão Jurídico
                </span>
              </div>
              <div className="text-[12px] text-slate-600 leading-relaxed space-y-2 border-t border-slate-100 pt-2.5">
                <p>
                  <strong>Aluguel base:</strong>{' '}
                  <span className="tabular-nums">{formatBRL(target.aluguelAntes)}/mês</span>
                </p>
                <p>
                  <strong>{target.clausulaLabel}:</strong> {target.textoModelo}
                </p>
                <p className="text-slate-500">
                  Demais cláusulas de vigência, multa proporcional e garantia preservadas integralmente conforme {target.modeloNome}.
                </p>
              </div>
            </div>

            <div
              className={`rounded-xl border p-4 space-y-2.5 ${
                target.clausulaAlterada
                  ? 'border-amber-300 bg-amber-50/40'
                  : 'border-emerald-200 bg-emerald-50/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-slate-900">Minuta preparada pelo agente</span>
                {target.clausulaAlterada ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-md">
                    <AlertTriangle className="w-3 h-3" />
                    Divergência
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-md">
                    <CheckCircle2 className="w-3 h-3" />
                    Conforme modelo
                  </span>
                )}
              </div>
              <div className="text-[12px] text-slate-700 leading-relaxed space-y-2 border-t border-slate-200/70 pt-2.5">
                <p>
                  <strong>Novo aluguel:</strong>{' '}
                  <span className="tabular-nums font-semibold text-slate-900">
                    {formatBRL(target.aluguelDepois)}/mês
                  </span>
                </p>
                <p
                  className={
                    target.clausulaAlterada
                      ? 'rounded-lg bg-amber-100/70 border border-amber-200 p-2 text-amber-950 font-medium'
                      : ''
                  }
                >
                  <strong>{target.clausulaLabel}:</strong> {target.textoMinuta}
                </p>
                <p className="text-[11px] text-slate-500">
                  Edição livre bloqueada pela governança do agente. Para alterar, peça ao agente ou restaure o modelo aprovado.
                </p>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
            {CALCULATION_HUMAN_CHECK_LABEL}
          </p>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-[#F8F9FB] flex flex-wrap items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-[12px] font-semibold text-slate-700 hover:bg-slate-50"
          >
            Fechar
          </button>
          {!readOnly && (
            <div className="flex flex-wrap items-center gap-2">
              {target.clausulaAlterada && (
                <button
                  type="button"
                  onClick={() => {
                    onAskAgent({
                      title: 'Restaurar texto do modelo aprovado',
                      prefillText: `Restaurar o texto padrão do modelo aprovado (${target.modeloNome}) na ${target.clausulaLabel} do contrato ${target.contractNumber} (${target.locatario}), removendo a alteração fora do padrão.`,
                      categoria: 'Locação e contratos',
                      subtipo: 'Renovação',
                      actionType: 'enviar_minuta',
                      evalParams: { clausulaAlterada: false, modeloAprovado: true },
                    });
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-[12px] font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Pedir ao agente: restaurar modelo
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  onAskAgent({
                    title: 'Enviar minuta ao cliente',
                    prefillText: `Enviar minuta de renovação do contrato ${target.contractNumber} (${target.locatario} · ${target.imovel}) com aluguel atualizado para ${formatBRL(target.aluguelDepois)}.`,
                    categoria: 'Locação e contratos',
                    subtipo: 'Renovação',
                    actionType: 'enviar_minuta',
                    evalParams: { clausulaAlterada: target.clausulaAlterada, modeloAprovado: true },
                  });
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#5B3FD0] hover:bg-[#4c33b8] text-white text-[12px] font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Pedir ao agente: enviar minuta
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export interface CalculatorTarget {
  contractNumber: string;
  locatario: string;
  imovel: string;
  aluguelAtual: number;
  indice: 'IGP-M' | 'IPCA';
  percentualExemplo: number;
  aniversario: string;
  taxaAdmPct?: number;
  ultimoReajuste?: string;
}

export function AdjustmentCalculatorDrawer({
  target,
  rules,
  readOnly,
  onClose,
  onOpenRuleById,
  onCreateRuleForReajuste,
  onAskAgent,
}: {
  target: CalculatorTarget | null;
  rules: Regra[];
  readOnly?: boolean;
  onClose: () => void;
  onOpenRuleById: (ruleId: string) => void;
  onCreateRuleForReajuste: () => void;
  onAskAgent: (req: AskAgentRequestPayload) => void;
}) {
  const [indice, setIndice] = useState<'IGP-M' | 'IPCA'>('IGP-M');
  const [percentualStr, setPercentualStr] = useState('4,2');
  const [taxaAdmPct, setTaxaAdmPct] = useState(9);

  useEffect(() => {
    if (!target) return;
    setIndice(target.indice);
    setPercentualStr(target.percentualExemplo.toFixed(1).replace('.', ','));
    setTaxaAdmPct(target.taxaAdmPct ?? 9);
  }, [target]);

  useEffect(() => {
    if (!target) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [target, onClose]);

  if (!target) return null;

  const pct = Math.max(0, parseFloat(percentualStr.replace(',', '.')) || 0);
  const novoAluguel = Math.round(target.aluguelAtual * (1 + pct / 100) * 100) / 100;
  const diferencaMensal = novoAluguel - target.aluguelAtual;
  const taxaAdmValor = Math.round(novoAluguel * (taxaAdmPct / 100) * 100) / 100;
  const liquidoProprietario = novoAluguel - taxaAdmValor;

  const evaluation = avaliarRegra('reajuste_anual', {}, rules);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="calc-drawer-title"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-xl bg-white h-full border-l border-slate-200 flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-start gap-3">
            <span className="w-9 h-9 rounded-lg bg-[#F3F0FF] text-[#5B3FD0] flex items-center justify-center shrink-0 mt-0.5">
              <Calculator className="w-4 h-4" />
            </span>
            <div>
              <h2 id="calc-drawer-title" className="text-[16px] font-bold text-slate-900">
                Calculadora de reajuste · {target.contractNumber}
              </h2>
              <p className="text-[12px] text-slate-500 mt-0.5">
                {target.locatario} · {target.imovel} · Aniversário {target.aniversario}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar calculadora"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Lacuna de regra / Rule check */}
          {evaluation.lacunaRegra ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  Lacuna de regra
                </span>
                <PolicyModeBadge modo={evaluation.modo} />
              </div>
              <p className="text-[12px] text-amber-900 leading-relaxed">
                Não existe regra cadastrada para aplicação automática de reajuste anual. O agente calcula e sugere, mas exige confirmação humana.
              </p>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onCreateRuleForReajuste();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-[12px] font-semibold text-amber-900 hover:bg-amber-100/60"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#5B3FD0]" />
                  Criar regra para reajustes anuais?
                </button>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-[#F8F9FB] p-3.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <PolicyModeBadge modo={evaluation.modo} />
                <span className="text-[12px] text-slate-700">{evaluation.resultadoTexto}</span>
              </div>
              <RuleAppliedChip
                ruleId={evaluation.regraId}
                versao={evaluation.versao}
                onOpenRule={onOpenRuleById}
              />
            </div>
          )}

          {/* Parameters */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-bold text-slate-900">Parâmetros do cálculo</h3>
              <span className="text-[11px] text-slate-500">{REFERENCE_INDICES_DISCLAIMER}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Índice contratual
                </label>
                <select
                  value={indice}
                  onChange={(e) => {
                    const next = e.target.value as 'IGP-M' | 'IPCA';
                    setIndice(next);
                    setPercentualStr(next === 'IGP-M' ? '4,2' : '3,9');
                  }}
                  className="w-full px-3 py-2 text-[13px] rounded-lg border border-slate-200 bg-white text-slate-900"
                >
                  <option value="IGP-M">IGP-M (ex. 4,2%)</option>
                  <option value="IPCA">IPCA (ex. 3,9%)</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Variação 12m (%)
                </label>
                <input
                  type="text"
                  value={percentualStr}
                  onChange={(e) => setPercentualStr(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] rounded-lg border border-slate-200 bg-white text-slate-900 tabular-nums"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Taxa de adm. (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={30}
                  step={0.5}
                  value={taxaAdmPct}
                  onChange={(e) => setTaxaAdmPct(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-[13px] rounded-lg border border-slate-200 bg-white text-slate-900 tabular-nums"
                />
              </div>
            </div>

            {/* Legal periodicity check */}
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-[12px] text-emerald-800">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                <strong>Periodicidade mínima de 12 meses:</strong> ok ({target.ultimoReajuste ?? 'último reajuste há 12 meses'}).
              </span>
            </div>
          </div>

          {/* Calculation Breakdown */}
          <div className="rounded-xl border border-slate-200 bg-[#F8F9FB] p-4 space-y-3">
            <h3 className="text-[13px] font-bold text-slate-900">Memória de cálculo</h3>
            <div className="space-y-2 text-[13px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Aluguel atual</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {formatBRL(target.aluguelAtual)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">
                  Reajuste {indice} (+{pct.toFixed(2).replace('.', ',')}%)
                </span>
                <span className="font-semibold text-emerald-700 tabular-nums">
                  +{formatBRL(diferencaMensal)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-900">Novo aluguel bruto</span>
                <span className="text-[16px] font-bold text-[#2563EB] tabular-nums">
                  {formatBRL(novoAluguel)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[12px] pt-1">
                <span className="text-slate-600">
                  Taxa de administração ({taxaAdmPct.toFixed(1).replace('.', ',')}%)
                </span>
                <span className="font-medium text-slate-800 tabular-nums">
                  {formatBRL(taxaAdmValor)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-slate-600">Repasse líquido estimado ao proprietário</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {formatBRL(liquidoProprietario)}
                </span>
              </div>
            </div>
            <p className="text-[11px] font-medium text-slate-600 pt-2 border-t border-slate-200/80">
              {CALCULATION_HUMAN_CHECK_LABEL}
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-[#F8F9FB] flex items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-[12px] font-semibold text-slate-700 hover:bg-slate-50"
          >
            Fechar
          </button>
          {!readOnly && (
            <button
              type="button"
              onClick={() => {
                onAskAgent({
                  title: 'Aplicar reajuste anual',
                  prefillText: `Aplicar reajuste anual de ${indice} (+${pct.toFixed(2).replace('.', ',')}%) no contrato ${target.contractNumber} (${target.locatario} · ${target.imovel}), passando o aluguel de ${formatBRL(target.aluguelAtual)} para ${formatBRL(novoAluguel)} (taxa adm. ${formatBRL(taxaAdmValor)} e líquido ${formatBRL(liquidoProprietario)}).`,
                  categoria: 'Locação e contratos',
                  subtipo: 'Reajuste anual',
                  actionType: 'reajuste_anual',
                  evalParams: {},
                });
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#5B3FD0] hover:bg-[#4c33b8] text-white text-[12px] font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Pedir ao agente: aplicar reajuste
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
