import { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Bot,
  CheckCircle2,
  Clock,
  Lock,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { avaliarRegra, formatBRL } from '../../data/financeiroData';
import type { NavItemId } from '../../data/navigation';
import type { PerfilRegra, Regra } from '../../data/rulesData';
import type { AskAgentRequestPayload } from '../financeiro/AskAgentOrderDrawer';
import { RuleAppliedChip } from '../financeiro/FinanceiroShared';
import {
  READINESS_PIPELINE_STEPS,
  type ReadinessChecklist,
  type ReadinessProperty,
} from '../../data/manutencaoData';

interface ManutencaoTabProntidaoProps {
  properties: ReadinessProperty[];
  rules: Regra[];
  perfil: PerfilRegra;
  readOnly: boolean;
  onToggleChecklistItem: (propId: string, key: keyof ReadinessChecklist) => void;
  onMarkReady: (propId: string) => void;
  onOpenRuleById: (ruleId: string) => void;
  onNavigateModule: (navId: NavItemId) => void;
  onAskAgent: (req: AskAgentRequestPayload) => void;
}

const CHECKLIST_LABELS: { key: keyof ReadinessChecklist; label: string }[] = [
  { key: 'laudoSaidaAprovado', label: 'Laudo de saída aprovado' },
  { key: 'zeroOsAbertas', label: 'Nenhuma OS aberta' },
  { key: 'vistoriaFinalAprovada', label: 'Vistoria final aprovada (> R$ 500)' },
  { key: 'limpezaConfirmada', label: 'Limpeza confirmada' },
  { key: 'chavesMedidoresRegistrados', label: 'Chaves e medidores registrados' },
];

export function ManutencaoTabProntidao({
  properties,
  rules,
  perfil,
  readOnly,
  onToggleChecklistItem,
  onMarkReady,
  onOpenRuleById,
  onNavigateModule,
  onAskAgent,
}: ManutencaoTabProntidaoProps) {
  const [selectedPropId, setSelectedPropId] = useState<string>(properties[0]?.id ?? 'pront-1');
  const isCorretor = perfil === 'Corretor';

  const scopedProps = useMemo(
    () => (isCorretor ? properties.filter((p) => p.corretor === 'Rafael Costa') : properties),
    [properties, isCorretor]
  );

  const selectedProp =
    scopedProps.find((p) => p.id === selectedPropId) ?? scopedProps[0] ?? properties[0];

  const isChecklistComplete = (c: ReadinessChecklist) =>
    c.laudoSaidaAprovado &&
    c.zeroOsAbertas &&
    c.vistoriaFinalAprovada &&
    c.limpezaConfirmada &&
    c.chavesMedidoresRegistrados;

  const readyEvaluation = selectedProp
    ? avaliarRegra(
        'pronto_para_alugar',
        {
          checklistPronto: isChecklistComplete(selectedProp.checklist),
          diasPreparacao: selectedProp.diasNaEtapa,
        },
        rules
      )
    : null;

  return (
    <div className="space-y-5">
      {/* 5 Summary Strip Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
        <div className="rounded-xl border border-red-200 bg-white p-3.5">
          <div className="text-[11.5px] font-medium text-slate-600">
            Vagos presos em reparo ou vistoria
          </div>
          <div className="text-[21px] font-bold text-red-700 tabular-nums mt-1">
            {properties.filter((p) => !p.prontoAnunciavel).length} de 28
          </div>
          <div className="text-[11px] text-slate-500">25% da carteira vaga</div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-white p-3.5">
          <div className="text-[11.5px] font-medium text-slate-600">
            Reparos há mais de 20 dias
          </div>
          <div className="text-[21px] font-bold text-amber-800 tabular-nums mt-1">4</div>
          <div className="text-[11px] text-slate-500">Meta MAN-006: 15 dias</div>
        </div>

        <div className="rounded-xl border border-red-200 bg-white p-3.5">
          <div className="text-[11.5px] font-medium text-slate-600">
            Vistorias de saída pendentes
          </div>
          <div className="text-[21px] font-bold text-red-700 tabular-nums mt-1">3</div>
          <div className="text-[11px] font-semibold text-red-700">2 atrasadas (MAN-005)</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <div className="text-[11.5px] font-medium text-slate-600">Aluguel parado</div>
          <div className="text-[21px] font-bold text-slate-900 tabular-nums mt-1">
            {isCorretor ? 'Restrito' : 'R$ 18.250,00'}
          </div>
          <div className="text-[11px] text-slate-500">por mês · 7 imóveis</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <div className="text-[11.5px] font-medium text-slate-600">
            Aluguel não recebido nos reparos
          </div>
          <div className="text-[21px] font-bold text-slate-900 tabular-nums mt-1">
            {isCorretor ? 'Restrito' : 'R$ 7.735,00'}
          </div>
          <div className="text-[10.5px] text-slate-500">
            Estimativa · Apoio ao cálculo. Conferência humana obrigatória.
          </div>
        </div>
      </div>

      {/* Leitura do agente + Ações em lote */}
      <div className="rounded-xl border border-[#5B3FD0]/25 bg-[#F3F0FF]/50 p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#5B3FD0]">
              <Bot className="w-4 h-4" />
              Leitura do agente · Regra-fonte MAN-006 v1 (apontada pela LOC-002)
            </span>
            <RuleAppliedChip ruleId="MAN-006" versao={1} onOpenRule={onOpenRuleById} />
            <RuleAppliedChip ruleId="LOC-002" versao={3} onOpenRule={onOpenRuleById} />
          </div>
          <p className="text-[13px] text-slate-800">
            Os 4 reparos parados custam ≈ R$ 300,00 por dia de aluguel. Aprovar o orçamento da Casa Rua do Cedro 57 hoje e trocar o fornecedor do Apto 306 libera 2 imóveis até 03/12/2026.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!readOnly && (
            <>
              <button
                type="button"
                onClick={() =>
                  onAskAgent({
                    title: 'Destravar os 7 imóveis vagos',
                    prefillText:
                      'Priorizar aprovação da Casa Rua do Cedro 57, substituir Impermeabilizações Delta no Apto 306 Ed. Solar e confirmar as 3 vistorias de saída para liberar anúncio na LOC-002.',
                    categoria: 'Manutenção e vistoria',
                    subtipo: 'Orçamento de reparo',
                    actionType: 'pronto_para_alugar',
                    evalParams: { checklistPronto: false, diasPreparacao: 24 },
                  })
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#5B3FD0] hover:bg-[#4C32B8] text-white text-[12px] font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Pedir ao agente: destravar os 7
              </button>
              <button
                type="button"
                onClick={() =>
                  onAskAgent({
                    title: 'Cobrar fornecedores atrasados',
                    prefillText:
                      'Cobrar atualização diária de Pinturas Norte (Apto 710), Refrigeração Polar (Sala 18) e novos proponentes do Apto 306 Ed. Solar (MAN-006 > 20 dias).',
                    categoria: 'Manutenção e vistoria',
                    subtipo: 'Chamado',
                    actionType: 'pronto_para_alugar',
                    evalParams: { checklistPronto: false, diasPreparacao: 27 },
                  })
                }
                className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-[12px] font-semibold"
              >
                Pedir ao agente: cobrar fornecedores atrasados
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Table + Interactive Pipeline & MAN-006 Checklist */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        <div className="xl:col-span-8 rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-[14.5px] font-bold text-slate-900">
              Imóveis em preparação e prontidão ({scopedProps.length})
            </h3>
            <button
              type="button"
              onClick={() => onNavigateModule('locacao-administracao')}
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#2563EB] hover:underline"
            >
              Ver em Locação &gt; Vacância e preço
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="px-3.5 py-2.5 font-semibold">Imóvel / Região</th>
                  <th className="px-3.5 py-2.5 font-semibold">Aluguel</th>
                  <th className="px-3.5 py-2.5 font-semibold">Etapa / Dias</th>
                  <th className="px-3.5 py-2.5 font-semibold">Bloqueio &amp; Próximo passo</th>
                  <th className="px-3.5 py-2.5 font-semibold">Prev. / Custo</th>
                  <th className="px-3.5 py-2.5 font-semibold">Locação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scopedProps.map((prop) => {
                  const active = selectedProp?.id === prop.id;
                  return (
                    <tr
                      key={prop.id}
                      onClick={() => setSelectedPropId(prop.id)}
                      className={`cursor-pointer transition-colors ${
                        active ? 'bg-blue-50/50' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="px-3.5 py-3 align-top">
                        <div className="font-bold text-slate-900">{prop.imovel}</div>
                        <div className="text-[11px] text-slate-500">
                          {prop.regiao} · <span className="font-mono">{prop.protocolo}</span>
                        </div>
                      </td>
                      <td className="px-3.5 py-3 align-top font-bold text-slate-900 tabular-nums whitespace-nowrap">
                        {isCorretor ? 'Restrito' : formatBRL(prop.aluguelPedido)}
                      </td>
                      <td className="px-3.5 py-3 align-top">
                        <div className="font-semibold text-slate-800">
                          {prop.prontoAnunciavel ? 'Pronto e anunciável (LOC-002)' : prop.etapa}
                        </div>
                        <div
                          className={`text-[11px] font-bold tabular-nums ${
                            prop.diasNaEtapa > 20 ? 'text-red-700' : 'text-amber-700'
                          }`}
                        >
                          {prop.diasNaEtapa} dias na etapa
                        </div>
                      </td>
                      <td className="px-3.5 py-3 align-top max-w-[230px]">
                        <div className="text-slate-700">{prop.bloqueio}</div>
                        <div className="text-[11px] text-[#5B3FD0] font-medium mt-0.5">
                          {prop.proximoPassoAgente}
                        </div>
                      </td>
                      <td className="px-3.5 py-3 align-top whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{prop.previsaoPronto}</div>
                        <div className="text-[11px] text-slate-500 tabular-nums">
                          {prop.custoPrevisto > 0 && !isCorretor
                            ? formatBRL(prop.custoPrevisto)
                            : '—'}
                        </div>
                      </td>
                      <td
                        className="px-3.5 py-3 align-top"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigateModule('locacao-administracao');
                        }}
                      >
                        <button
                          type="button"
                          className="text-[11.5px] font-semibold text-[#2563EB] hover:underline whitespace-nowrap"
                        >
                          Ver na Locação
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Property Readiness Pipeline + MAN-006 Checklist */}
        {selectedProp && (
          <div className="xl:col-span-4 rounded-xl border border-slate-200 bg-white p-4 space-y-4">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Linha de prontidão e checklist MAN-006
                </span>
                <RuleAppliedChip ruleId="MAN-006" versao={1} onOpenRule={onOpenRuleById} />
              </div>
              <h4 className="text-[15px] font-bold text-slate-900 mt-1">{selectedProp.imovel}</h4>
              <p className="text-[12px] text-slate-500">
                {selectedProp.prontoAnunciavel
                  ? 'Pronto e anunciável — liberado para avaliação de publicação na LOC-002'
                  : `Etapa atual: ${selectedProp.etapa} (${selectedProp.diasNaEtapa} dias)`}
              </p>
            </div>

            {/* 7-Step Pipeline */}
            <div className="space-y-1.5">
              {READINESS_PIPELINE_STEPS.map((stepName, idx) => {
                const done = selectedProp.prontoAnunciavel || idx < selectedProp.etapaIndex;
                const current = !selectedProp.prontoAnunciavel && idx === selectedProp.etapaIndex;
                return (
                  <div
                    key={stepName}
                    className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[12px] border ${
                      done
                        ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                        : current
                        ? 'bg-amber-50 border-amber-300 text-amber-950 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                  >
                    <span>
                      {idx + 1}. {stepName}
                    </span>
                    {done ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    ) : current ? (
                      <Clock className="w-3.5 h-3.5 text-amber-700" />
                    ) : (
                      <Lock className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Interactive 5-item Checklist MAN-006 */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="text-[12px] font-bold text-slate-800">
                Checklist obrigatório de “pronto” (MAN-006 v1)
              </div>
              {CHECKLIST_LABELS.map(({ key, label }) => {
                const checked = selectedProp.checklist[key];
                return (
                  <label
                    key={key}
                    className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2 text-[12px] cursor-pointer hover:bg-slate-50"
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        disabled={readOnly}
                        checked={checked}
                        onChange={() => onToggleChecklistItem(selectedProp.id, key)}
                        className="rounded border-slate-300 text-[#2563EB]"
                      />
                      <span className={checked ? 'text-slate-900 font-medium' : 'text-slate-600'}>
                        {label}
                      </span>
                    </span>
                    {checked ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                    )}
                  </label>
                );
              })}
            </div>

            {readyEvaluation && (
              <div className="rounded-lg border border-slate-200 bg-[#F8F9FB] p-3 text-[11.5px] text-slate-700">
                <strong>Avaliação ao vivo:</strong> {readyEvaluation.motivo}
              </div>
            )}

            {!readOnly && (
              <button
                type="button"
                disabled={selectedProp.prontoAnunciavel}
                onClick={() => {
                  if (isChecklistComplete(selectedProp.checklist)) {
                    onMarkReady(selectedProp.id);
                  } else {
                    onAskAgent({
                      title: `Liberar prontidão · ${selectedProp.imovel}`,
                      prefillText: `Avaliar liberação de "${selectedProp.imovel}" como Pronto e anunciável na regra-fonte MAN-006 v1 para publicação pela LOC-002.`,
                      categoria: 'Manutenção e vistoria',
                      subtipo: 'Vistoria',
                      actionType: 'pronto_para_alugar',
                      evalParams: {
                        checklistPronto: false,
                        diasPreparacao: selectedProp.diasNaEtapa,
                      },
                    });
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 disabled:bg-emerald-600 text-white text-[12.5px] font-semibold transition-colors"
              >
                {selectedProp.prontoAnunciavel
                  ? 'Pronto e anunciável (liberado para LOC-002 ✓)'
                  : isChecklistComplete(selectedProp.checklist)
                  ? 'Marcar Pronto e anunciável (MAN-006 ✓)'
                  : 'Solicitar validação MAN-006 ao agente'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
