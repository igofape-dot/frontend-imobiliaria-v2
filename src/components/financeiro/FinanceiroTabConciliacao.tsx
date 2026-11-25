import { useMemo, useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Search,
  Sliders,
  Pencil,
  Check,
  X,
} from 'lucide-react';
import {
  CONCILIACAO_RESUMO,
  avaliarRegra,
  formatBRL,
  type BankDivergenceItem,
} from '../../data/financeiroData';
import type { Regra } from '../../data/rulesData';
import type { AskAgentRequestPayload } from './AskAgentOrderDrawer';
import {
  AgentRegisteredTag,
  PolicyModeBadge,
  RuleAppliedChip,
  SemaphoreBadge,
} from './FinanceiroShared';

interface FinanceiroTabConciliacaoProps {
  divergences: BankDivergenceItem[];
  rules: Regra[];
  onAcceptSuggestion: (id: string) => void;
  onCorrectDivergence: (id: string, note: string) => void;
  onAskAgent: (payload: AskAgentRequestPayload) => void;
  onOpenRuleById: (ruleId: string) => void;
  onSwitchToRulesTab: () => void;
}

export function FinanceiroTabConciliacao({
  divergences,
  rules,
  onAcceptSuggestion,
  onCorrectDivergence,
  onAskAgent,
  onOpenRuleById,
  onSwitchToRulesTab,
}: FinanceiroTabConciliacaoProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const fin017 = useMemo(() => rules.find((r) => r.id === 'FIN-017'), [rules]);
  const isFin017Active = fin017?.status === 'ativa';

  const pendingCount = divergences.filter((d) => !d.resolvido).length;

  return (
    <div className="space-y-5">
      {/* Resumo da Conciliação */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/90 p-4">
          <div className="text-[12px] text-slate-500">Lançamentos no extrato OFX</div>
          <div className="text-[22px] font-bold text-slate-900 mt-1 tabular-nums">
            {CONCILIACAO_RESUMO.totalLancamentos} lançamentos
          </div>
          <div className="text-[11.5px] text-slate-500 mt-1">
            Conta de Terceiros + Conta Corrente Farina
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-slate-500">Casados pelo agente</span>
            <SemaphoreBadge semaphore="verde" label={`${CONCILIACAO_RESUMO.casadosPct}% automático`} />
          </div>
          <div className="text-[22px] font-bold text-emerald-700 mt-1 tabular-nums">
            {CONCILIACAO_RESUMO.casadosQtd} conciliados
          </div>
          <div className="text-[11.5px] text-slate-500 mt-1">
            Baixas automáticas sem intervenção manual
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-slate-500">Divergências pendentes</span>
            <SemaphoreBadge
              semaphore={pendingCount === 0 ? 'verde' : 'ambar'}
              label={pendingCount === 0 ? 'Tudo conciliado' : `${pendingCount} pendentes`}
            />
          </div>
          <div className="text-[22px] font-bold text-slate-900 mt-1 tabular-nums">
            {pendingCount} de {divergences.length}
          </div>
          <div className="text-[11.5px] text-slate-500 mt-1">
            A correção manual treina o modelo do agente
          </div>
        </div>
      </div>

      {/* Aviso dinâmico da regra FIN-017 (rascunho vs ativa) */}
      <div
        className={`rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isFin017Active
            ? 'border-emerald-200 bg-emerald-50/50'
            : 'border-amber-200 bg-amber-50/60'
        }`}
      >
        <div className="flex items-start gap-3">
          {isFin017Active ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          )}
          <div className="text-[12.5px] space-y-0.5">
            <div className="font-bold text-slate-900 flex flex-wrap items-center gap-2">
              <span>
                {isFin017Active
                  ? 'Regra FIN-017 ativa: tolerância automática de até R$ 0,50 está valendo.'
                  : 'Regra FIN-017 em rascunho: tolerância de R$ 0,50 ainda não vale.'}
              </span>
              <RuleAppliedChip
                ruleId="FIN-017"
                versao={fin017?.versao ?? 1}
                onOpenRule={onOpenRuleById}
              />
            </div>
            <p className="text-slate-600">
              {isFin017Active
                ? 'Diferenças de arredondamento até R$ 0,50 (sem pagador terceiro sem CPF) entram em modo autônomo.'
                : 'Enquanto a FIN-017 não for ativada em "Definir regras", toda diferença de centavos vai para sua revisão humana.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onSwitchToRulesTab}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[12px] font-semibold text-slate-800 shrink-0"
        >
          <Sliders className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>{isFin017Active ? 'Ver regra FIN-017' : 'Revisar/Ativar FIN-017'}</span>
        </button>
      </div>

      {/* Lista das 5 divergências */}
      <section className="bg-white rounded-xl border border-slate-200/90 divide-y divide-slate-100">
        {divergences.map((div) => {
          const evalResult = avaliarRegra(
            'conciliacao',
            {
              diferenca: div.diferenca,
              pagadorTerceiroSemCpf: div.pagadorTerceiroSemCpf,
            },
            rules
          );
          const isEditing = editingId === div.id;

          return (
            <div
              key={div.id}
              className={`p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                div.resolvido ? 'bg-slate-50/50 opacity-85' : ''
              }`}
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11.5px] font-semibold text-slate-500 tabular-nums">
                    {div.data}
                  </span>
                  <span className="font-mono text-[12.5px] font-bold text-slate-900">
                    {div.descricaoExtrato}
                  </span>
                  {div.resolvido ? (
                    <SemaphoreBadge semaphore="verde" label="Resolvido" />
                  ) : (
                    <PolicyModeBadge modo={evalResult.modo} />
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] tabular-nums">
                  <span>
                    Extrato banco: <strong className="text-slate-900">{formatBRL(div.valorBanco)}</strong>
                  </span>
                  <span>
                    Sistema:{' '}
                    <strong className="text-slate-900">
                      {div.valorSistema !== null ? formatBRL(div.valorSistema) : 'Não encontrado'}
                    </strong>
                  </span>
                  <span
                    className={`font-semibold ${
                      Math.abs(div.diferenca) <= 0.5 ? 'text-amber-700' : 'text-red-700'
                    }`}
                  >
                    Diferença: {div.diferenca >= 0 ? '+' : ''}
                    {formatBRL(div.diferenca)}
                  </span>
                </div>

                <div className="rounded-lg border border-slate-200/80 bg-[#F8F9FB] px-3.5 py-2 text-[12px] space-y-1">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-[#2563EB] bg-white text-[12.5px]"
                        aria-label="Corrigir classificação da divergência"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (editText.trim()) onCorrectDivergence(div.id, editText.trim());
                          setEditingId(null);
                        }}
                        className="p-1.5 rounded-lg bg-[#2563EB] text-white"
                        aria-label="Salvar correção"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600"
                        aria-label="Cancelar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-slate-700">
                        <strong className="text-[#5B3FD0]">Sugestão do agente ({div.confianca}%):</strong>{' '}
                        {div.resolucaoTexto ?? div.sugestaoAgente}
                      </span>
                      <RuleAppliedChip
                        ruleId={evalResult.regraId}
                        versao={evalResult.versao}
                        onOpenRule={onOpenRuleById}
                      />
                    </div>
                  )}
                  <AgentRegisteredTag label={div.registeredBy} />
                </div>
              </div>

              {!div.resolvido && !isEditing && (
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onAcceptSuggestion(div.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-[12px] font-semibold"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Aceitar sugestão</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(div.id);
                      setEditText(div.sugestaoAgente);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[12px] font-medium"
                  >
                    <Pencil className="w-3 h-3" />
                    <span>Corrigir</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onAskAgent({
                        title: 'Investigar divergência bancária',
                        prefillText: `Investigar a divergência de extrato "${div.descricaoExtrato}" (${div.data}, valor banco ${formatBRL(
                          div.valorBanco
                        )}, diferença ${formatBRL(div.diferenca)}) e localizar comprovante correspondente.`,
                        subtipo: 'Baixa de pagamento',
                        actionType: 'conciliacao',
                        evalParams: {
                          diferenca: div.diferenca,
                          pagadorTerceiroSemCpf: div.pagadorTerceiroSemCpf,
                        },
                      })
                    }
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#F3F0FF] hover:bg-[#EAE4FF] text-[#5B3FD0] text-[12px] font-semibold"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Investigar</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
