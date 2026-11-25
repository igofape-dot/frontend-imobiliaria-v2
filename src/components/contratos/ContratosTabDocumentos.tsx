import { useMemo, useState } from 'react';
import {
  Check,
  Clock,
  FileCheck2,
  FileText,
  AlertTriangle,
  Lock,
  Sparkles,
  Upload,
} from 'lucide-react';
import type { PerfilRegra } from '../../data/rulesData';
import {
  APPROVED_TEMPLATES_LIST,
  INITIAL_DOCUMENT_TRIAGE,
  MANDATORY_DOC_CHECKLISTS,
  PENDING_SIGNATURES_LIST,
  type DocumentTriageItem,
} from '../../data/contratosData';
import type { AskAgentRequestPayload } from '../financeiro/AskAgentOrderDrawer';
import {
  AgentRegisteredTag,
  InlineOneClickCorrector,
  RuleAppliedChip,
} from '../financeiro/FinanceiroShared';

interface ContratosTabDocumentosProps {
  perfil: PerfilRegra;
  readOnly: boolean;
  onAskAgent: (req: AskAgentRequestPayload) => void;
  onOpenRuleById: (ruleId: string) => void;
  onShowToast: (text: string) => void;
}

type DocFilter = 'todos' | 'Pendente' | 'Baixa confiança' | 'Assinaturas' | 'Vencido';

export function ContratosTabDocumentos({
  readOnly,
  onAskAgent,
  onOpenRuleById,
  onShowToast,
}: ContratosTabDocumentosProps) {
  const [triageItems, setTriageItems] = useState<DocumentTriageItem[]>(
    INITIAL_DOCUMENT_TRIAGE
  );
  const [filter, setFilter] = useState<DocFilter>('todos');
  const [withinWindowSim, setWithinWindowSim] = useState(true);

  const visibleTriage = useMemo(() => {
    if (filter === 'Assinaturas') return [];
    if (filter === 'todos') return triageItems;
    return triageItems.filter((d) => d.status === filter);
  }, [triageItems, filter]);

  const handleConfirmDoc = (docId: string, arquivo: string) => {
    setTriageItems((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, status: 'Confirmado', confianca: 100 } : d))
    );
    onShowToast(`Extração de "${arquivo}" confirmada e vinculada ao contrato.`);
  };

  const handleCorrectField = (docId: string, campo: string, newVal: string) => {
    setTriageItems((prev) =>
      prev.map((d) =>
        d.id === docId
          ? {
              ...d,
              camposExtraidos: d.camposExtraidos.map((f) =>
                f.campo === campo ? { ...f, valor: newVal } : f
              ),
            }
          : d
      )
    );
    onShowToast(`Campo "${campo}" corrigido. A correção treina o agente.`);
  };

  return (
    <div className="space-y-6">
      {/* 4 Filter cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[
          { id: 'Pendente' as DocFilter, label: 'Documentos pendentes', count: '14' },
          {
            id: 'Baixa confiança' as DocFilter,
            label: 'Baixa confiança (< 85%)',
            count: '4',
            highlight: true,
          },
          { id: 'Assinaturas' as DocFilter, label: 'Assinaturas pendentes', count: '6' },
          { id: 'Vencido' as DocFilter, label: 'Certidões vencidas', count: '3' },
        ].map((card) => {
          const active = filter === card.id;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => setFilter(active ? 'todos' : card.id)}
              className={`text-left rounded-xl border p-4 transition-colors ${
                active
                  ? 'border-[#2563EB] bg-blue-50/40'
                  : card.highlight
                  ? 'border-amber-200 bg-amber-50/30 hover:border-amber-300'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="text-[11px] font-semibold text-slate-600">{card.label}</div>
              <div className="text-[22px] font-bold text-slate-900 tabular-nums mt-1">
                {card.count}
              </div>
            </button>
          );
        })}
      </div>

      {/* TRIAGE QUEUE (JUR-013) */}
      {filter !== 'Assinaturas' && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-[15px] font-bold text-slate-900">
                Fila de triagem documental ({visibleTriage.length} exibidos)
              </h2>
              <p className="text-[12px] text-slate-500">
                Regra JUR-013 v3: extrações com confiança abaixo de 85% exigem revisão humana. A correção treina o agente.
              </p>
            </div>
            <RuleAppliedChip ruleId="JUR-013" versao={3} onOpenRule={onOpenRuleById} />
          </div>

          <div className="space-y-3">
            {visibleTriage.map((doc) => (
              <div
                key={doc.id}
                className={`rounded-xl border p-4 space-y-3 ${
                  doc.confianca < 85 && doc.status !== 'Confirmado'
                    ? 'border-amber-200 bg-amber-50/30'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[13px] font-bold text-slate-900">{doc.arquivo}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {doc.origem}
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded border tabular-nums ${
                          doc.status === 'Confirmado'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : doc.confianca < 85
                            ? 'bg-amber-100 text-amber-900 border-amber-200'
                            : 'bg-blue-50 text-[#2563EB] border-blue-200'
                        }`}
                      >
                        Confiança {doc.confianca}% · {doc.status}
                      </span>
                    </div>
                    <p className="text-[12px] text-slate-600 mt-1">
                      <strong>{doc.tipoReconhecido}</strong> · {doc.contratoRelacionado}
                    </p>
                    <AgentRegisteredTag label={`Registrado pelo agente, fonte: ${doc.fonte}`} />
                  </div>

                  {!readOnly && doc.status !== 'Confirmado' && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleConfirmDoc(doc.id, doc.arquivo)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-[12px] font-semibold"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Confirmar
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onAskAgent({
                            title: `Cobrar documento · ${doc.contratoRelacionado}`,
                            prefillText: `Solicitar reenvio legível ou documento atualizado referente a "${doc.arquivo}" (${doc.contratoRelacionado}) pela regra JUR-013.`,
                            categoria: 'Jurídico e documentos',
                            subtipo: 'Análise documental',
                            actionType: 'documento',
                            evalParams: { documentoFaltando: true },
                          })
                        }
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[12px] font-semibold text-slate-700"
                      >
                        Pedir novo envio
                      </button>
                    </div>
                  )}
                </div>

                {/* Extracted fields with 1-click Corrigir */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-100">
                  {doc.camposExtraidos.map((f) => (
                    <div
                      key={f.campo}
                      className="rounded-lg border border-slate-200 bg-[#F8F9FB] px-3 py-2 flex items-center justify-between gap-2 text-[12px]"
                    >
                      <div className="min-w-0">
                        <div className="text-[11px] text-slate-500">
                          {f.campo} ({f.pagina})
                        </div>
                        <div className="font-semibold text-slate-900 truncate">{f.valor}</div>
                      </div>
                      {!readOnly && (
                        <InlineOneClickCorrector
                          value={f.valor}
                          ariaLabel={`Corrigir ${f.campo}`}
                          onSave={(nextVal) => handleCorrectField(doc.id, f.campo, nextVal)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ASSINATURAS PENDENTES (6) */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-bold text-slate-900">
              Assinaturas pendentes ({PENDING_SIGNATURES_LIST.length})
            </h2>
            <p className="text-[12px] text-slate-500">
              Integração de assinatura eletrônica: <span className="font-medium text-slate-700">provedor a definir</span> · Lembretes respeitam a janela 8h–19h.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setWithinWindowSim((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-semibold ${
              withinWindowSim
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-amber-200 bg-amber-50 text-amber-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            {withinWindowSim
              ? 'Simulação: 14:30 (dentro da janela 8h–19h)'
              : 'Simulação: 21:15 (fora da janela — pausa até 08:00)'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead className="bg-[#F8F9FB] border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Contrato / Imóvel</th>
                <th className="px-4 py-2.5 font-semibold">Signatário</th>
                <th className="px-4 py-2.5 font-semibold">Aguardando</th>
                <th className="px-4 py-2.5 font-semibold">Último lembrete</th>
                <th className="px-4 py-2.5 font-semibold text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PENDING_SIGNATURES_LIST.map((sig) => (
                <tr key={sig.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-2.5">
                    <div className="font-bold text-slate-900 tabular-nums">{sig.contractNumber}</div>
                    <div className="text-[11px] text-slate-500">{sig.imovel}</div>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="font-semibold text-slate-800">{sig.signatario}</div>
                    <div className="text-[11px] text-slate-500">{sig.papel} · {sig.provedor}</div>
                  </td>
                  <td className="px-4 py-2.5 tabular-nums font-semibold text-amber-800">
                    {sig.diasAguardando} dias
                  </td>
                  <td className="px-4 py-2.5 tabular-nums text-slate-600">{sig.ultimoLembrete}</td>
                  <td className="px-4 py-2.5 text-right">
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => {
                          if (!withinWindowSim) {
                            onShowToast(
                              `Fora da janela 8h–19h: lembrete para ${sig.signatario} agendado pelo agente para 08:00 do próximo dia útil.`
                            );
                            return;
                          }
                          onAskAgent({
                            title: `Lembrar signatário · ${sig.contractNumber}`,
                            prefillText: `Enviar lembrete cordial de assinatura para ${sig.signatario} (${sig.papel}) no contrato ${sig.contractNumber} (${sig.imovel}), respeitando a janela 8h–19h.`,
                            categoria: 'Jurídico e documentos',
                            subtipo: 'Análise documental',
                            actionType: 'enviar_minuta',
                            evalParams: { clausulaAlterada: false, modeloAprovado: true },
                          });
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-700"
                      >
                        <Sparkles className="w-3 h-3 text-[#5B3FD0]" />
                        {withinWindowSim ? 'Lembrar signatário' : 'Agendar p/ 08:00'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* CHECKLISTS + MODELOS APROVADOS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Mandatory checklists */}
        <section className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <div>
            <h2 className="text-[15px] font-bold text-slate-900">
              Documentos obrigatórios por tipo
            </h2>
            <p className="text-[11px] text-amber-800 font-medium mt-0.5">
              Lista de exemplo, validar com o Jurídico. Bloqueia emissão pela JUR-013 v3 se faltar item.
            </p>
          </div>
          <div className="space-y-3">
            {MANDATORY_DOC_CHECKLISTS.map((group) => (
              <div
                key={group.tipo}
                className="rounded-lg border border-slate-200 bg-[#F8F9FB] p-3 space-y-1.5"
              >
                <div className="text-[12px] font-bold text-slate-900">{group.tipo}</div>
                <ul className="space-y-1">
                  {group.itens.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-1.5 text-[11px] text-slate-700"
                    >
                      <FileCheck2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Approved Models (Read-only) */}
        <section className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-[15px] font-bold text-slate-900">
                Modelos aprovados ({APPROVED_TEMPLATES_LIST.length} · somente leitura)
              </h2>
              <p className="text-[12px] text-slate-500 mt-0.5">
                O agente só redige minutas a partir destes modelos versionados. Sem edição de texto livre.
              </p>
            </div>
            {!readOnly && (
              <button
                type="button"
                onClick={() =>
                  onAskAgent({
                    title: 'Cadastrar modelo a partir de arquivo',
                    prefillText:
                      'Analisar o arquivo de minuta padrão enviado pelo Jurídico, extrair cláusulas variáveis e submeter novo modelo versionado para aprovação.',
                    categoria: 'Jurídico e documentos',
                    subtipo: 'Análise documental',
                    actionType: 'documento',
                    evalParams: { documentoFaltando: false },
                  })
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5B3FD0] hover:bg-[#4c33b8] text-white text-[11px] font-semibold"
              >
                <Upload className="w-3.5 h-3.5" />
                Pedir ao agente: cadastrar modelo de arquivo
              </button>
            )}
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-3 text-[11px] text-slate-700 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
            <div>
              <strong>Distinção importante:</strong> o modelo{' '}
              <em>Notificação de cobrança (comunicado administrativo)</em> é usado pelo agente no marco D+15 da régua FIN-020. Já a{' '}
              <strong>notificação extrajudicial</strong> permanece bloqueada pela barreira <strong>JUR-001 (travada)</strong> e cabe apenas ao advogado externo.
            </div>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {APPROVED_TEMPLATES_LIST.map((tpl) => (
              <div
                key={tpl.id}
                className="px-4 py-3 flex flex-wrap items-center justify-between gap-2 bg-white text-[12px]"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span>{tpl.nome}</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {tpl.versao}
                      </span>
                      <Lock className="w-3 h-3 text-slate-400" aria-label="Somente leitura" />
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Aprovado por {tpl.aprovadoPor} em {tpl.dataAprovacao}
                      {tpl.observacao ? ` · ${tpl.observacao}` : ''}
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-slate-600 tabular-nums shrink-0">
                  {tpl.usos30d} usos (30d)
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
