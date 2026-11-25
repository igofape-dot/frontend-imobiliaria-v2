import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  AlertOctagon,
  Calculator,
  FileDiff,
  Sparkles,
  Bot,
  CalendarClock,
} from 'lucide-react';
import { avaliarRegra, formatBRL } from '../../data/financeiroData';
import type { PerfilRegra, Regra } from '../../data/rulesData';
import {
  CALCULATION_HUMAN_CHECK_LABEL,
  INITIAL_ANNUAL_ADJUSTMENTS,
  INITIAL_RENEWAL_CARDS,
  REFERENCE_INDICES_DISCLAIMER,
  RENEWAL_STAGE_TOTALS,
  type RenewalStage,
} from '../../data/contratosData';
import type { AskAgentRequestPayload } from '../financeiro/AskAgentOrderDrawer';
import { PolicyModeBadge, RuleAppliedChip } from '../financeiro/FinanceiroShared';
import type { CalculatorTarget, ComparatorTarget } from './ContratosDrawers';

interface ContratosTabRenovacoesProps {
  rules: Regra[];
  perfil: PerfilRegra;
  readOnly: boolean;
  onAskAgent: (req: AskAgentRequestPayload) => void;
  onOpenRuleById: (ruleId: string) => void;
  onOpenOrderInCenter: (orderId: string) => void;
  onOpenComparator: (target: ComparatorTarget) => void;
  onOpenCalculator: (target: CalculatorTarget) => void;
  onCreateRuleForReajuste: () => void;
}

const STAGES: RenewalStage[] = [
  'Sem ação',
  'Em preparo',
  'Aguardando aprovação',
  'Enviada ao cliente',
  'Assinada',
];

export function ContratosTabRenovacoes({
  rules,
  perfil,
  readOnly,
  onAskAgent,
  onOpenRuleById,
  onOpenOrderInCenter,
  onOpenComparator,
  onOpenCalculator,
  onCreateRuleForReajuste,
}: ContratosTabRenovacoesProps) {
  const [subView, setSubView] = useState<'renovacoes' | 'reajustes'>('renovacoes');

  const scopedCards = useMemo(() => {
    if (perfil === 'Corretor') {
      return INITIAL_RENEWAL_CARDS.filter((c) => c.corretorResponsavel === 'Rafael Costa');
    }
    return INITIAL_RENEWAL_CARDS;
  }, [perfil]);

  const scopedAdjustments = useMemo(() => {
    if (perfil === 'Corretor') {
      return INITIAL_ANNUAL_ADJUSTMENTS.filter(
        (a) => a.corretorResponsavel === 'Rafael Costa'
      );
    }
    return INITIAL_ANNUAL_ADJUSTMENTS;
  }, [perfil]);

  const reajustePolicy = useMemo(() => avaliarRegra('reajuste_anual', {}, rules), [rules]);

  return (
    <div className="space-y-5">
      {/* Sub-navigation between Renovações Kanban (37) and Reajustes anuais (11) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex p-1 rounded-xl bg-white border border-slate-200">
          <button
            type="button"
            onClick={() => setSubView('renovacoes')}
            className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${
              subView === 'renovacoes'
                ? 'bg-[#2563EB] text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Renovações em 90 dias (37)
          </button>
          <button
            type="button"
            onClick={() => setSubView('reajustes')}
            className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${
              subView === 'reajustes'
                ? 'bg-[#2563EB] text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Reajustes anuais (11)
          </button>
        </div>

        <span className="text-[12px] text-slate-500">
          Marco padrão pela regra{' '}
          <button
            type="button"
            onClick={() => onOpenRuleById('JUR-002')}
            className="font-semibold text-[#5B3FD0] hover:underline"
          >
            JUR-002 v4
          </button>{' '}
          (início D-90 autônomo · envio ao cliente com aprovação do Gestor em 8h)
        </span>
      </div>

      {subView === 'renovacoes' ? (
        <div className="space-y-4">
          <div className="overflow-x-auto pb-2">
            <div className="grid grid-cols-5 gap-3.5 min-w-[1120px]">
              {STAGES.map((stage) => {
                const colCards = scopedCards.filter((c) => c.stage === stage);
                const totalLabel =
                  perfil === 'Gestor' || perfil === 'Jurídico'
                    ? RENEWAL_STAGE_TOTALS[stage]
                    : colCards.length;
                return (
                  <div
                    key={stage}
                    className="rounded-xl border border-slate-200 bg-white flex flex-col overflow-hidden"
                  >
                    <div className="px-3.5 py-3 border-b border-slate-200 bg-[#F8F9FB] flex items-center justify-between gap-2">
                      <span className="text-[12px] font-bold text-slate-900">{stage}</span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-bold tabular-nums ${
                          stage === 'Sem ação'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-slate-200/70 text-slate-700'
                        }`}
                      >
                        {totalLabel}
                      </span>
                    </div>

                    <div className="p-3 space-y-3 flex-1">
                      {colCards.map((card) => (
                        <div
                          key={card.id}
                          className={`rounded-xl border p-3 space-y-2 ${
                            card.inicioPrevistoPassou
                              ? 'border-red-200 bg-red-50/30'
                              : card.clausulaAlterada
                              ? 'border-amber-200 bg-amber-50/30'
                              : 'border-slate-200 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="text-[11px] font-bold text-[#2563EB] tabular-nums">
                              {card.contractNumber}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-600 tabular-nums">
                              {card.diasParaVencimento}d · {card.vencimento}
                            </span>
                          </div>

                          <div>
                            <div className="text-[13px] font-bold text-slate-900 leading-snug">
                              {card.locatario}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate" title={card.imovel}>
                              {card.imovel}
                            </div>
                          </div>

                          <div className="text-[11px] text-slate-700 tabular-nums">
                            {formatBRL(card.aluguelAtual)} →{' '}
                            <strong className="text-slate-900">
                              {formatBRL(card.aluguelProposto)}
                            </strong>{' '}
                            <span className="text-slate-500">
                              ({card.indice} +{card.percentualIndice.toFixed(1).replace('.', ',')}%)
                            </span>
                          </div>

                          {card.inicioPrevistoPassou && (
                            <div className="flex items-start gap-1 text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg px-2 py-1">
                              <AlertOctagon className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                              <span>Início previsto pela JUR-002 já passou</span>
                            </div>
                          )}

                          {card.clausulaAlterada && (
                            <div className="flex items-start gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                              <span>{card.clausulaAlteradaTexto ?? 'Cláusula alterada (JUR-005)'}</span>
                            </div>
                          )}

                          <div className="flex flex-wrap items-center gap-1 pt-1">
                            {card.regras.map((rg) => (
                              <RuleAppliedChip
                                key={rg.ruleId}
                                ruleId={rg.ruleId}
                                versao={rg.versao}
                                onOpenRule={onOpenRuleById}
                              />
                            ))}
                            {card.orderId && card.orderProtocol && (
                              <button
                                type="button"
                                onClick={() => onOpenOrderInCenter(card.orderId!)}
                                className="text-[10px] font-semibold text-[#2563EB] hover:underline ml-auto"
                              >
                                {card.orderProtocol}
                              </button>
                            )}
                          </div>

                          {!readOnly && stage !== 'Assinada' && (
                            <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                              {stage === 'Sem ação' && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    onAskAgent({
                                      title: `Preparar renovação · ${card.contractNumber}`,
                                      prefillText: `Iniciar renovação do contrato ${card.contractNumber} (${card.locatario} · ${card.imovel}, vence em ${card.diasParaVencimento} dias), atualizando o aluguel para ${formatBRL(card.aluguelProposto)} (${card.indice}) pela JUR-002.`,
                                      categoria: 'Locação e contratos',
                                      subtipo: 'Renovação',
                                      actionType: 'preparar_renovacao',
                                      evalParams: { diasParaVencimento: card.diasParaVencimento },
                                    })
                                  }
                                  className="w-full inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#5B3FD0] hover:bg-[#4c33b8] text-white text-[11px] font-semibold"
                                >
                                  <Sparkles className="w-3 h-3" />
                                  Pedir ao agente: iniciar
                                </button>
                              )}

                              {(stage === 'Em preparo' || stage === 'Aguardando aprovação') && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    onOpenComparator({
                                      contractNumber: card.contractNumber,
                                      locatario: card.locatario,
                                      imovel: card.imovel,
                                      clausulaAlterada: !!card.clausulaAlterada,
                                      clausulaLabel: card.clausulaAlterada
                                        ? 'Cláusula 8ª (Vistoria de saída)'
                                        : 'Cláusulas gerais e garantia',
                                      textoModelo: card.clausulaAlterada
                                        ? 'O locatário terá 5 dias úteis após entrega das chaves para contestação.'
                                        : 'Texto padrão Aditivo de renovação v3 sem alterações.',
                                      textoMinuta: card.clausulaAlterada
                                        ? 'O locatário terá 10 dias úteis após entrega das chaves para contestação.'
                                        : `Atualização exclusiva do aluguel para ${formatBRL(card.aluguelProposto)}.`,
                                      aluguelAntes: card.aluguelAtual,
                                      aluguelDepois: card.aluguelProposto,
                                      modeloNome: 'Aditivo de renovação v3',
                                    })
                                  }
                                  className="w-full inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-[11px] font-semibold"
                                >
                                  <FileDiff className="w-3 h-3 text-[#5B3FD0]" />
                                  Comparar com modelo
                                </button>
                              )}

                              {stage === 'Enviada ao cliente' && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    onAskAgent({
                                      title: `Lembrar assinatura · ${card.contractNumber}`,
                                      prefillText: `Enviar lembrete cordial na janela 8h–19h para assinatura da minuta de renovação do contrato ${card.contractNumber} (${card.locatario}).`,
                                      categoria: 'Locação e contratos',
                                      subtipo: 'Renovação',
                                      actionType: 'enviar_minuta',
                                      evalParams: { clausulaAlterada: false, modeloAprovado: true },
                                    })
                                  }
                                  className="w-full inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-semibold"
                                >
                                  Lembrar signatário
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* REAJUSTES ANUAIS (11) */
        <div className="space-y-4">
          {/* Lacuna de regra notice OR active rule */}
          {reajustePolicy.lacunaRegra ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[12px] font-bold text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    Lacuna de regra
                  </span>
                  <PolicyModeBadge modo={reajustePolicy.modo} />
                </div>
                <p className="text-[12px] text-amber-950">
                  Não há regra cadastrada para reajuste anual no GoFAPE. Por segurança, o agente apenas calcula e sugere; a aplicação exige confirmação manual.
                </p>
              </div>
              {!readOnly && (
                <button
                  type="button"
                  onClick={onCreateRuleForReajuste}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-amber-300 hover:bg-amber-100/70 text-[12px] font-semibold text-amber-950 shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#5B3FD0]" />
                  Criar regra para reajustes anuais?
                </button>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[12px] text-slate-700">
                <PolicyModeBadge modo={reajustePolicy.modo} />
                <span>{reajustePolicy.motivo}</span>
              </div>
              <RuleAppliedChip
                ruleId={reajustePolicy.regraId}
                versao={reajustePolicy.versao}
                onOpenRule={onOpenRuleById}
              />
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
            <span>
              Índices de referência: IGP-M 4,2% · IPCA 3,9% ({REFERENCE_INDICES_DISCLAIMER}).
            </span>
            <span className="font-medium text-slate-600">{CALCULATION_HUMAN_CHECK_LABEL}</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px]">
                <thead className="bg-[#F8F9FB] border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Contrato</th>
                    <th className="px-4 py-3 font-semibold">Locatário / Imóvel</th>
                    <th className="px-4 py-3 font-semibold">Aniversário</th>
                    <th className="px-4 py-3 font-semibold">Aluguel atual</th>
                    <th className="px-4 py-3 font-semibold">Índice</th>
                    <th className="px-4 py-3 font-semibold">Novo valor sugerido</th>
                    <th className="px-4 py-3 font-semibold">Situação</th>
                    <th className="px-4 py-3 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {scopedAdjustments.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 font-bold text-slate-900 tabular-nums whitespace-nowrap">
                        {item.contractNumber}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{item.locatario}</div>
                        <div className="text-[11px] text-slate-500">{item.imovel}</div>
                      </td>
                      <td className="px-4 py-3 tabular-nums text-slate-700 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <CalendarClock className="w-3.5 h-3.5 text-slate-400" />
                          {item.aniversario}
                        </span>
                      </td>
                      <td className="px-4 py-3 tabular-nums text-slate-700 whitespace-nowrap">
                        {formatBRL(item.aluguelAtual)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-semibold text-slate-800">{item.indice}</span>{' '}
                        <span className="text-slate-500 tabular-nums">
                          +{item.percentual.toFixed(1).replace('.', ',')}%
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-[#2563EB] tabular-nums whitespace-nowrap">
                        {formatBRL(item.novoAluguel)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-blue-200 bg-blue-50 text-[#2563EB] text-[11px] font-semibold">
                          <Bot className="w-3 h-3" />
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap space-x-2">
                        <button
                          type="button"
                          onClick={() =>
                            onOpenCalculator({
                              contractNumber: item.contractNumber,
                              locatario: item.locatario,
                              imovel: item.imovel,
                              aluguelAtual: item.aluguelAtual,
                              indice: item.indice,
                              percentualExemplo: item.percentual,
                              aniversario: item.aniversario,
                            })
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-700"
                        >
                          <Calculator className="w-3 h-3" />
                          Calculadora
                        </button>
                        {!readOnly && (
                          <button
                            type="button"
                            onClick={() =>
                              onAskAgent({
                                title: `Aplicar reajuste · ${item.contractNumber}`,
                                prefillText: `Aplicar reajuste anual de ${item.indice} (+${item.percentual.toFixed(1).replace('.', ',')}%) no contrato ${item.contractNumber} (${item.locatario}), alterando o aluguel de ${formatBRL(item.aluguelAtual)} para ${formatBRL(item.novoAluguel)}.`,
                                categoria: 'Locação e contratos',
                                subtipo: 'Reajuste anual',
                                actionType: 'reajuste_anual',
                                evalParams: {},
                              })
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#5B3FD0] hover:bg-[#4c33b8] text-white text-[11px] font-semibold"
                          >
                            <Sparkles className="w-3 h-3" />
                            Pedir ao agente
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
