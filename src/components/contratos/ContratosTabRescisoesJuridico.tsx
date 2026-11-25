import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Ban,
  Bot,
  CheckCircle2,
  Eye,
  EyeOff,
  FileCheck2,
  Lock,
  Scale,
  ShieldAlert,
  Sparkles,
  X,
} from 'lucide-react';
import { formatBRL } from '../../data/financeiroData';
import type { PerfilRegra } from '../../data/rulesData';
import {
  CALCULATION_HUMAN_CHECK_LABEL,
  INITIAL_LEGAL_CASES,
  INITIAL_RESCISSIONS,
  type LegalCaseItem,
  type RescissionItem,
} from '../../data/contratosData';
import type { AskAgentRequestPayload } from '../financeiro/AskAgentOrderDrawer';
import {
  AgentRegisteredTag,
  RuleAppliedChip,
  SemaphoreBadge,
} from '../financeiro/FinanceiroShared';

interface ContratosTabRescisoesJuridicoProps {
  perfil: PerfilRegra;
  readOnly: boolean;
  onAskAgent: (req: AskAgentRequestPayload) => void;
  onOpenRuleById: (ruleId: string) => void;
  onOpenOrderInCenter: (orderId: string) => void;
  onShowToast: (text: string) => void;
}

const RESCISSION_STEPS: RescissionItem['etapa'][] = [
  'Solicitada',
  'Calculada',
  'Aprovada',
  'Vistoria de saída',
  'Acerto financeiro',
  'Encerrada',
];

export function ContratosTabRescisoesJuridico({
  perfil,
  readOnly,
  onAskAgent,
  onOpenRuleById,
  onOpenOrderInCenter,
  onShowToast,
}: ContratosTabRescisoesJuridicoProps) {
  const [selectedCase, setSelectedCase] = useState<LegalCaseItem | null>(null);
  const [revealedCaseIds, setRevealedCaseIds] = useState<Record<string, boolean>>({});
  const [caseAuditLog, setCaseAuditLog] = useState<Record<string, string[]>>({});

  const totalRisco = useMemo(
    () => INITIAL_LEGAL_CASES.reduce((acc, c) => acc + c.valorRisco, 0),
    []
  );

  const handleToggleRevealCaseCpf = (item: LegalCaseItem) => {
    const isRevealed = !!revealedCaseIds[item.id];
    if (!isRevealed) {
      const now = new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const line = `22/11/2026 ${now} · Perfil ${perfil} revelou CPF de ${item.locatario} (${item.contractNumber})`;
      setCaseAuditLog((prev) => ({
        ...prev,
        [item.id]: [line, ...(prev[item.id] ?? [])],
      }));
      onShowToast(`Acesso LGPD registrado na trilha do caso ${item.contractNumber}.`);
    }
    setRevealedCaseIds((prev) => ({ ...prev, [item.id]: !isRevealed }));
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1: RESCISÕES EM ANDAMENTO (3) */}
      <section className="space-y-3" aria-labelledby="rescisoes-heading">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 id="rescisoes-heading" className="text-[14px] font-bold text-slate-900">
              Rescisões em andamento ({INITIAL_RESCISSIONS.length})
            </h2>
            <p className="text-[12px] text-slate-500">
              {CALCULATION_HUMAN_CHECK_LABEL} Aprovação exigida pela regra JUR-007 (Jurídico, 24h).
            </p>
          </div>
          <RuleAppliedChip ruleId="JUR-007" versao={1} onOpenRule={onOpenRuleById} />
        </div>

        <div className="space-y-4">
          {INITIAL_RESCISSIONS.map((res) => {
            const currentStepIdx = RESCISSION_STEPS.indexOf(res.etapa);
            return (
              <div
                key={res.id}
                className="rounded-xl border border-slate-200 bg-white p-5 space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[12px] font-bold text-[#2563EB] tabular-nums">
                        {res.contractNumber}
                      </span>
                      <SemaphoreBadge semaphore="ambar" label={res.etapa} />
                      {res.orderId && res.orderProtocol && (
                        <button
                          type="button"
                          onClick={() => onOpenOrderInCenter(res.orderId!)}
                          className="text-[11px] font-semibold text-[#2563EB] hover:underline"
                        >
                          {res.orderProtocol}
                        </button>
                      )}
                      <RuleAppliedChip
                        ruleId={res.regraId}
                        versao={res.regraVersao}
                        onOpenRule={onOpenRuleById}
                      />
                    </div>
                    <h3 className="text-[15px] font-bold text-slate-900 mt-1">
                      {res.locatario} · {res.imovel}
                    </h3>
                    <p className="text-[12px] text-slate-600 mt-0.5">
                      Aluguel base: <strong className="tabular-nums">{formatBRL(res.aluguel)}</strong> · Multa calculada:{' '}
                      <strong className="tabular-nums text-slate-900">{formatBRL(res.multaCalculada)}</strong>{' '}
                      <span className="text-slate-500">({res.motivoCalculo})</span>
                    </p>
                  </div>

                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() =>
                        onAskAgent({
                          title: `Avançar rescisão · ${res.contractNumber}`,
                          prefillText: `Preparar termo e liberar próxima etapa da rescisão do contrato ${res.contractNumber} (${res.locatario} · ${res.imovel}) com multa calculada de ${formatBRL(res.multaCalculada)}.`,
                          categoria: 'Locação e contratos',
                          subtipo: 'Rescisão',
                          actionType: 'rescisao',
                          evalParams: {},
                          requiresExtraConfirmation: true,
                          extraConfirmationText: `Impacto: ${res.impactoRepasse}. Vacância: ${res.impactoVacancia}.`,
                        })
                      }
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#5B3FD0] hover:bg-[#4c33b8] text-white text-[12px] font-semibold shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Pedir ao agente: avançar etapa
                    </button>
                  )}
                </div>

                {/* 6-step stepper */}
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                  {RESCISSION_STEPS.map((step, idx) => {
                    const done = idx < currentStepIdx;
                    const active = idx === currentStepIdx;
                    return (
                      <div
                        key={step}
                        className={`rounded-lg border px-2.5 py-2 text-[11px] font-semibold flex items-center gap-1.5 ${
                          active
                            ? 'border-[#2563EB] bg-blue-50 text-[#2563EB]'
                            : done
                            ? 'border-emerald-200 bg-emerald-50/70 text-emerald-800'
                            : 'border-slate-200 bg-[#F8F9FB] text-slate-400'
                        }`}
                      >
                        <span className="tabular-nums">{idx + 1}.</span>
                        <span className="truncate">{step}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Impact grid & disclaimers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[12px]">
                  <div className="rounded-lg border border-slate-200 bg-[#F8F9FB] p-3">
                    <span className="font-semibold text-slate-800">Impacto no repasse: </span>
                    <span className="text-slate-600">{res.impactoRepasse}</span>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-[#F8F9FB] p-3">
                    <span className="font-semibold text-slate-800">Impacto na vacância: </span>
                    <span className="text-slate-600">{res.impactoVacancia}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-1">
                  <AgentRegisteredTag
                    label={`Registrado pelo agente, fonte: ${res.fonte} · confiança ${res.confianca}%`}
                  />
                  <span className="font-medium text-amber-800">{CALCULATION_HUMAN_CHECK_LABEL}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 2: CASOS JURÍDICOS ABERTOS (3 · R$ 19.910,50) */}
      <section className="space-y-3" aria-labelledby="casos-juridicos-heading">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 id="casos-juridicos-heading" className="text-[14px] font-bold text-slate-900">
              Casos jurídicos abertos ({INITIAL_LEGAL_CASES.length}) ·{' '}
              <span className="tabular-nums text-red-700">{formatBRL(totalRisco)}</span> em risco
            </h2>
            <p className="text-[12px] text-slate-500">
              Casos escalados automaticamente a partir do marco D+30 da régua financeira (FIN-020).
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-800 text-[11px] font-semibold">
            <Lock className="w-3.5 h-3.5" />
            Notificação extrajudicial e ajuizamento bloqueados pela JUR-001 (travada)
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {INITIAL_LEGAL_CASES.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedCase(item)}
              className="rounded-xl border border-slate-200 bg-white p-4 hover:border-[#2563EB]/50 cursor-pointer flex flex-col justify-between gap-3 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[12px] font-bold text-[#2563EB] tabular-nums">
                    {item.contractNumber}
                  </span>
                  <SemaphoreBadge
                    semaphore="vermelho"
                    label={item.acaoJudicialIniciada ? 'Ação iniciada' : `D+${item.diasAtraso}`}
                  />
                </div>

                <div>
                  <h3 className="text-[15px] font-bold text-slate-900">{item.locatario}</h3>
                  <p className="text-[12px] text-slate-500">{item.imovel}</p>
                </div>

                <div className="text-[18px] font-bold text-slate-900 tabular-nums">
                  {formatBRL(item.valorRisco)}
                </div>

                <div className="text-[11px] text-slate-600 space-y-1">
                  <div>
                    <strong>Garantia:</strong> {item.garantia} · <strong>Origem:</strong> {item.origem}
                  </div>
                  <div>
                    <strong>Advogado:</strong> {item.advogadoExterno}
                  </div>
                  <div>
                    <strong>Próximo prazo:</strong>{' '}
                    <span className="tabular-nums">{item.proximoPrazo}</span>
                  </div>
                </div>

                {item.conflitoFin014 && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-[11px] text-amber-900 flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                    <span>
                      Conflito ativo <strong>JUR-007 × FIN-014</strong>: exige aprovação do Jurídico.
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <RuleAppliedChip
                  ruleId={item.regraId}
                  versao={item.regraVersao}
                  onOpenRule={(id) => onOpenRuleById(id)}
                />
                <span className="text-[12px] font-semibold text-[#2563EB]">
                  Abrir dossiê →
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CASE DOSSIER DRAWER */}
      {selectedCase && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-[1px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="legal-case-drawer-title"
        >
          <div className="fixed inset-0" onClick={() => setSelectedCase(null)} aria-hidden="true" />
          <div className="relative z-10 w-full max-w-2xl bg-white h-full border-l border-slate-200 flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-4 shrink-0">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[12px] font-bold text-[#2563EB] tabular-nums">
                    {selectedCase.contractNumber}
                  </span>
                  <SemaphoreBadge semaphore="vermelho" label={selectedCase.statusJuridico} />
                </div>
                <h2 id="legal-case-drawer-title" className="text-[17px] font-bold text-slate-900 mt-1">
                  {selectedCase.locatario} · {selectedCase.imovel}
                </h2>
                <p className="text-[12px] text-slate-500 mt-0.5">
                  Risco: <strong className="tabular-nums text-slate-800">{formatBRL(selectedCase.valorRisco)}</strong> ·{' '}
                  {selectedCase.diasAtraso} dias de atraso · {selectedCase.origem}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCase(null)}
                aria-label="Fechar caso"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* JUR-001 Barrier reminder */}
              <div className="rounded-xl border border-red-200 bg-red-50/70 p-3.5 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 text-[12px] text-red-900">
                  <Scale className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                  <div>
                    <strong>Barreira JUR-001 (travada):</strong> o agente nunca envia notificação extrajudicial nem ajuíza ação de despejo. Ele consolida provas e dossiê para{' '}
                    <strong>{selectedCase.advogadoExterno}</strong>.
                  </div>
                </div>
                <RuleAppliedChip ruleId="JUR-001" versao={1} onOpenRule={onOpenRuleById} />
              </div>

              {/* Resumo (<=400) */}
              <div className="rounded-xl border border-slate-200 bg-[#F8F9FB] p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#5B3FD0]">
                  <Bot className="w-4 h-4" />
                  Resumo do caso preparado pelo agente
                </div>
                <p className="text-[13px] text-slate-800 leading-relaxed">{selectedCase.resumo}</p>
              </div>

              {/* LGPD CPF */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[12px] font-bold text-slate-900">
                    <ShieldAlert className="w-4 h-4 text-[#2563EB]" />
                    Identificação LGPD · CPF:{' '}
                    <span className="tabular-nums">
                      {revealedCaseIds[selectedCase.id]
                        ? selectedCase.cpfFull
                        : selectedCase.cpfMask}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleRevealCaseCpf(selectedCase)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {revealedCaseIds[selectedCase.id] ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" /> Ocultar
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" /> Revelar
                      </>
                    )}
                  </button>
                </div>
                {(caseAuditLog[selectedCase.id] ?? []).map((line, i) => (
                  <p key={i} className="text-[11px] text-slate-500 tabular-nums">
                    Auditoria LGPD: {line}
                  </p>
                ))}
              </div>

              {/* Régua percorrida */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                <h3 className="text-[12px] font-bold text-slate-900">Régua de cobrança percorrida</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCase.reguaPercorrida.map((step) => (
                    <span
                      key={step}
                      className="px-2.5 py-1 rounded-lg bg-[#F8F9FB] border border-slate-200 text-[11px] font-medium text-slate-700"
                    >
                      {step}
                    </span>
                  ))}
                </div>
              </div>

              {/* Dossiê items */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5">
                <h3 className="text-[12px] font-bold text-slate-900">Dossiê probatório para advogado</h3>
                <ul className="space-y-1.5">
                  {selectedCase.dossieItens.map((doc) => (
                    <li
                      key={doc.item}
                      className="flex items-center justify-between gap-2 text-[12px] py-1 border-b border-slate-100 last:border-0"
                    >
                      <span className="flex items-center gap-2 text-slate-800">
                        <FileCheck2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        {doc.item}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        {doc.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Andamento do advogado externo */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5">
                <h3 className="text-[12px] font-bold text-slate-900">
                  Andamento do advogado externo ({selectedCase.advogadoExterno})
                </h3>
                {selectedCase.andamentosAdvogado.map((and, i) => (
                  <div key={i} className="rounded-lg bg-[#F8F9FB] border border-slate-200 p-3 space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <span className="font-bold text-slate-800 tabular-nums">{and.data}</span>
                      <AgentRegisteredTag label={and.fonte} />
                    </div>
                    <p className="text-[12px] text-slate-700">{and.texto}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-[#F8F9FB] flex flex-wrap items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedCase(null)}
                className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-[12px] font-semibold text-slate-700"
              >
                Fechar
              </button>
              {!readOnly && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onAskAgent({
                        title: `Testar barreira JUR-001 · ${selectedCase.contractNumber}`,
                        prefillText: `Enviar notificação extrajudicial ou ajuizar ação referente ao contrato ${selectedCase.contractNumber} (${selectedCase.locatario}).`,
                        categoria: 'Jurídico e documentos',
                        subtipo: 'Análise documental',
                        actionType: 'notificacao_extrajudicial',
                        evalParams: {},
                      })
                    }
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-red-700 text-[12px] font-semibold"
                    title="Bloqueado pela barreira JUR-001 (travada)"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    Notificação / Ação (JUR-001)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onAskAgent({
                        title: `Montar dossiê · ${selectedCase.contractNumber}`,
                        prefillText: `Atualizar e gerar resumo completo + dossiê probatório do contrato ${selectedCase.contractNumber} (${selectedCase.locatario}, ${formatBRL(selectedCase.valorRisco)}) para envio ao advogado ${selectedCase.advogadoExterno}.`,
                        categoria: 'Jurídico e documentos',
                        subtipo: 'Análise documental',
                        actionType: 'montar_dossie',
                        evalParams: {},
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#5B3FD0] hover:bg-[#4c33b8] text-white text-[12px] font-semibold"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Pedir ao agente: montar dossiê
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
