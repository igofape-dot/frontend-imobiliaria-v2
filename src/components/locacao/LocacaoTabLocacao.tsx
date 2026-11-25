import { useMemo, useState } from 'react';
import {
  Calendar,
  FileText,
  UserCheck,
  Lock,
  Eye,
  EyeOff,
  Check,
  X,
  Sparkles,
  AlertTriangle,
  ArrowUpRight,
  Clock,
} from 'lucide-react';
import { formatBRL } from '../../data/financeiroData';
import type { PerfilRegra, Regra } from '../../data/rulesData';
import {
  INITIAL_PROPOSALS,
  INITIAL_VISITS_6,
  LOCACAO_FUNNEL_BY_PERIOD,
  formatPctBR,
  type CandidateAnalysisItem,
} from '../../data/locacaoData';
import type { AskAgentRequestPayload } from '../financeiro/AskAgentOrderDrawer';
import { RuleAppliedChip } from '../financeiro/FinanceiroShared';

interface LocacaoTabLocacaoProps {
  candidates: CandidateAnalysisItem[];
  rules: Regra[];
  perfil: PerfilRegra;
  readOnly: boolean;
  onApproveCandidate: (candidateId: string) => void;
  onRejectCandidate: (candidateId: string, reason: string) => void;
  onAskAgent: (req: AskAgentRequestPayload) => void;
  onOpenRuleById: (ruleId: string) => void;
  onOpenOrderInCenter: (orderId: string) => void;
  onCreateConcessaoRuleDraft: () => void;
  onNavigateModule: (navId: 'contratos-juridico' | 'captacao-marketing') => void;
}

export function LocacaoTabLocacao({
  candidates,
  rules,
  perfil,
  readOnly,
  onApproveCandidate,
  onRejectCandidate,
  onAskAgent,
  onOpenRuleById,
  onOpenOrderInCenter,
  onCreateConcessaoRuleDraft,
  onNavigateModule,
}: LocacaoTabLocacaoProps) {
  const [funnelRange, setFunnelRange] = useState<'hoje' | '7d' | '30d'>('30d');
  const [revealedIds, setRevealedIds] = useState<Record<string, string>>({});
  const [rejectModalTarget, setRejectModalTarget] = useState<CandidateAnalysisItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const isCorretor = perfil === 'Corretor';

  const scopedVisits = useMemo(
    () =>
      isCorretor
        ? INITIAL_VISITS_6.filter((v) => v.corretor === 'Rafael Costa')
        : INITIAL_VISITS_6,
    [isCorretor]
  );

  const scopedProposals = useMemo(
    () =>
      isCorretor
        ? INITIAL_PROPOSALS.filter((p) => p.corretor === 'Rafael Costa')
        : INITIAL_PROPOSALS,
    [isCorretor]
  );

  const scopedCandidates = useMemo(
    () =>
      isCorretor
        ? candidates.filter((c) => c.corretor === 'Rafael Costa')
        : candidates,
    [candidates, isCorretor]
  );

  const hasConcessaoRule = rules.some(
    (r) =>
      r.status === 'ativa' &&
      (r.nome.toLowerCase().includes('concess') || r.nome.toLowerCase().includes('carên'))
  );

  const toggleRevealCandidate = (candId: string) => {
    if (isCorretor) return;
    setRevealedIds((prev) => {
      if (prev[candId]) {
        const copy = { ...prev };
        delete copy[candId];
        return copy;
      }
      const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      return {
        ...prev,
        [candId]: `LGPD revelado em 22/11/2026 às ${time} por ${perfil}`,
      };
    });
  };

  const getRecBadgeStyle = (rec: CandidateAnalysisItem['recomendacaoAgente']) => {
    if (rec === 'Recomendar') return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (rec === 'Recomendar com ressalva') return 'bg-amber-50 text-amber-800 border-amber-200';
    return 'bg-red-50 text-red-700 border-red-200';
  };

  return (
    <div className="space-y-6">
      {/* 1. FAIXA AGORA */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-[12px] font-semibold text-slate-600">Visitas hoje</div>
          <div className="text-[22px] font-bold text-slate-900 tabular-nums mt-0.5">3</div>
          <div className="text-[11px] text-amber-800 mt-0.5">1 pendente aviso 24h (LOC-003)</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-[12px] font-semibold text-slate-600">Propostas em análise</div>
          <div className="text-[22px] font-bold text-slate-900 tabular-nums mt-0.5">4</div>
          <div className="text-[11px] text-slate-500 mt-0.5">1 com carência (Lacuna de regra)</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-[12px] font-semibold text-slate-600">
            Cadastros aguardando decisão
          </div>
          <div className="text-[22px] font-bold text-slate-900 tabular-nums mt-0.5">2</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Decisão exclusivamente humana (LOC-004)</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-[12px] font-semibold text-slate-600">Locações fechadas no mês</div>
          <div className="text-[22px] font-bold text-slate-900 tabular-nums mt-0.5">12</div>
          <div className="text-[11px] text-emerald-700 mt-0.5">Média de giro: 27 dias</div>
        </div>
      </section>

      {/* 2. FUNIL DE LOCAÇÃO */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-[14.5px] font-bold text-slate-900">
              Funil completo de locação
            </h3>
            <p className="text-[12px] text-slate-500">
              Gargalo identificado pelo agente entre Visita realizada e Proposta recebida. Origem detalhada e custo por lead ficam em{' '}
              <button
                type="button"
                onClick={() => onNavigateModule('captacao-marketing')}
                className="font-semibold text-[#2563EB] hover:underline"
              >
                Captação e Marketing
              </button>
              .
            </p>
          </div>
          <div className="inline-flex rounded-xl border border-slate-200 p-1 bg-[#F8F9FB]">
            {(['hoje', '7d', '30d'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setFunnelRange(r)}
                className={`px-3 py-1 rounded-lg text-[12px] font-semibold ${
                  funnelRange === r
                    ? 'bg-[#2563EB] text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r === 'hoje' ? 'Hoje' : r === '7d' ? '7 dias' : '30 dias'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {LOCACAO_FUNNEL_BY_PERIOD[funnelRange].map((step) => (
            <div
              key={step.etapa}
              className={`rounded-xl border p-3.5 space-y-1 ${
                step.gargalo
                  ? 'border-amber-200 bg-amber-50/60'
                  : 'border-slate-200 bg-[#F8F9FB]'
              }`}
            >
              <div className="text-[12px] font-semibold text-slate-700">{step.etapa}</div>
              <div className="text-[22px] font-bold text-slate-900 tabular-nums">{step.qtd}</div>
              <div className="text-[11px] font-medium text-slate-600">
                Conversão etapa: {step.convAnteriorPct}
              </div>
              {step.gargalo && (
                <div className="text-[11px] font-semibold text-amber-800 pt-0.5">
                  Principal gargalo
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 3. VISITAS (6) */}
      <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#2563EB]" />
            <h3 className="text-[14.5px] font-bold text-slate-900">
              Agenda de visitas ({scopedVisits.length})
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <RuleAppliedChip ruleId="LOC-003" versao={2} onOpenRule={onOpenRuleById} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[12.5px]">
            <thead className="bg-[#F8F9FB] border-b border-slate-200 text-slate-500 font-semibold">
              <tr>
                <th className="px-4 py-2.5">Data / Hora</th>
                <th className="px-3 py-2.5">Imóvel</th>
                <th className="px-3 py-2.5">Interessado</th>
                <th className="px-3 py-2.5">Corretor</th>
                <th className="px-3 py-2.5">Situação LOC-003</th>
                <th className="px-4 py-2.5 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {scopedVisits.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 whitespace-nowrap font-semibold text-slate-900 tabular-nums">
                    {v.dataHora}
                  </td>
                  <td className="px-3 py-3">
                    <div className="font-semibold text-slate-900">{v.imovel}</div>
                    <div className="text-[11px] font-mono text-slate-500">{v.codigoImovel}</div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-slate-800">{v.interessado}</div>
                    {v.foraJanelaNota && (
                      <div className="inline-flex items-center gap-1 text-[11px] text-[#5B3FD0] mt-0.5">
                        <Clock className="w-3 h-3" />
                        {v.foraJanelaNota}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-slate-700">{v.corretor}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-md border text-[11px] font-semibold ${
                        v.status === 'Pendente aviso 24h'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {v.status}
                    </span>
                    {v.imovelOcupado && (
                      <div className="text-[11px] text-amber-800 mt-0.5">
                        Imóvel ocupado · exige aviso 24h e consentimento
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() =>
                          onAskAgent({
                            title: v.imovelOcupado
                              ? `Notificar inquilino 24h antes · ${v.codigoImovel}`
                              : `Reconfirmar visita · ${v.codigoImovel}`,
                            prefillText: v.imovelOcupado
                              ? `Enviar aviso formal com 24h de antecedência e solicitar consentimento do locatário de ${v.imovel} para visita de ${v.interessado} (LOC-003 v2).`
                              : `Enviar lembrete de confirmação via WhatsApp para ${v.interessado} e corretor ${v.corretor} da visita em ${v.imovel}.`,
                            categoria: 'Vendas e captação',
                            subtipo: 'Lead de portal',
                            actionType: 'agendar_visita',
                            evalParams: {
                              imovelOcupado: v.imovelOcupado,
                              aviso24hRegistrado: v.aviso24hRegistrado,
                              consentimentoInquilino: v.consentimentoInquilino,
                            },
                            links: [{ type: 'Imóvel', code: v.codigoImovel, label: v.imovel }],
                          })
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#F3F0FF] hover:bg-[#EDE9FE] text-[#5B3FD0] text-[11.5px] font-semibold"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{v.imovelOcupado ? 'Pedir aviso 24h' : 'Pedir confirmação'}</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. PROPOSTAS EM NEGOCIAÇÃO (4) */}
      <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#2563EB]" />
            <h3 className="text-[14.5px] font-bold text-slate-900">
              Propostas de locação ({scopedProposals.length})
            </h3>
          </div>
          {!hasConcessaoRule && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold">
                <AlertTriangle className="w-3 h-3" />
                Lacuna de regra: concessões/carência
              </span>
              {perfil === 'Gestor' && (
                <button
                  type="button"
                  onClick={onCreateConcessaoRuleDraft}
                  className="text-[12px] font-semibold text-[#2563EB] hover:underline"
                >
                  Criar regra para concessões →
                </button>
              )}
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[12.5px]">
            <thead className="bg-[#F8F9FB] border-b border-slate-200 text-slate-500 font-semibold">
              <tr>
                <th className="px-4 py-2.5">Imóvel</th>
                <th className="px-3 py-2.5">Candidato</th>
                <th className="px-3 py-2.5">Pedido → Ofertado</th>
                <th className="px-3 py-2.5">Concessão / Carência</th>
                <th className="px-3 py-2.5">Garantia</th>
                <th className="px-3 py-2.5">Status / Regra</th>
                <th className="px-4 py-2.5 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {scopedProposals.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{p.imovel}</div>
                    <div className="text-[11px] font-mono text-slate-500">{p.codigoImovel}</div>
                  </td>
                  <td className="px-3 py-3 font-medium text-slate-800">{p.candidato}</td>
                  <td className="px-3 py-3 whitespace-nowrap tabular-nums">
                    <span className="text-slate-500">{formatBRL(p.valorPedido)}</span> →{' '}
                    <strong className="text-slate-900">{formatBRL(p.valorOfertado)}</strong>
                  </td>
                  <td className="px-3 py-3">
                    {p.temConcessao ? (
                      <span className="inline-flex px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold">
                        {p.carenciaSolicitada}
                      </span>
                    ) : (
                      <span className="text-slate-500">{p.carenciaSolicitada}</span>
                    )}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-slate-700">
                    {p.garantiaProposta}
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-[12px] font-semibold text-slate-800">{p.status}</div>
                    {p.temConcessao && !hasConcessaoRule && (
                      <div className="text-[11px] text-amber-800 font-medium">
                        Lacuna de regra · Só sugerir
                      </div>
                    )}
                    {p.orderId && p.protocoloRelacionado && (
                      <button
                        type="button"
                        onClick={() => onOpenOrderInCenter(p.orderId!)}
                        className="font-mono text-[11px] text-[#2563EB] hover:underline"
                      >
                        {p.protocoloRelacionado}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() =>
                          onAskAgent({
                            title: p.temConcessao
                              ? `Pedir sugestão ao agente · ${p.codigoImovel}`
                              : `Encaminhar proposta · ${p.codigoImovel}`,
                            prefillText: p.temConcessao
                              ? `Simular contraproposta para ${p.candidato} em ${p.imovel} (${p.carenciaSolicitada}) preservando o repasse do proprietário após carência ou desconto diluído.`
                              : `Atualizar negociação da proposta de ${p.candidato} para ${p.imovel} (${formatBRL(p.valorOfertado)}, garantia ${p.garantiaProposta}).`,
                            categoria: 'Vendas e captação',
                            subtipo: 'Proposta de locação',
                            actionType: p.temConcessao ? 'concessao_negociacao' : 'analise_cadastral',
                            evalParams: p.temConcessao
                              ? { carenciaMeses: 1 }
                              : { consentimentoBureau: true, documentoFaltando: false, comprometimentoRendaPct: 29.6 },
                            gapMessage: p.temConcessao
                              ? 'Lacuna de regra: concessões na negociação (carência ou desconto no 1º aluguel) não têm regra ativa.'
                              : undefined,
                            gapCtaLabel: p.temConcessao
                              ? 'Criar regra para concessões na negociação?'
                              : undefined,
                            links: [{ type: 'Imóvel', code: p.codigoImovel, label: p.imovel }],
                          })
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#5B3FD0] hover:bg-[#4C32B8] text-white text-[11.5px] font-semibold"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{p.temConcessao ? 'Pedir sugestão' : 'Pedir ao agente'}</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. ANÁLISE CADASTRAL (4) */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#5B3FD0]" />
            <h3 className="text-[14.5px] font-bold text-slate-900">
              Análise cadastral de candidatos ({scopedCandidates.length})
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <RuleAppliedChip ruleId="LOC-004" versao={1} onOpenRule={onOpenRuleById} />
            <RuleAppliedChip ruleId="JUR-013" versao={3} onOpenRule={onOpenRuleById} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {scopedCandidates.map((c) => {
            const isRevealed = Boolean(revealedIds[c.id]);
            const canDecide = !readOnly && !isCorretor && c.statusDecisao === 'Aguardando Gestor';

            return (
              <div
                key={c.id}
                className="rounded-xl border border-slate-200 bg-white p-4 space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-[14.5px] font-bold text-slate-900">{c.nome}</h4>
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-md border text-[11px] font-semibold ${getRecBadgeStyle(
                          c.recomendacaoAgente
                        )}`}
                      >
                        {c.recomendacaoAgente}
                      </span>
                    </div>
                    <p className="text-[12px] text-slate-500 mt-0.5">
                      {c.imovel} · Confiança extração: {c.confiancaPct}%
                    </p>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-md border text-[11px] font-semibold ${
                      c.statusDecisao === 'Aprovado pelo Gestor'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : c.statusDecisao === 'Recusado pelo Gestor'
                        ? 'bg-red-50 border-red-200 text-red-700'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {c.statusDecisao}
                  </span>
                </div>

                {/* LGPD Income & CPF Block */}
                <div className="rounded-lg border border-slate-200 bg-[#F8F9FB] p-3 space-y-2 text-[12px]">
                  {isCorretor ? (
                    <div className="flex items-center justify-between gap-2 text-slate-700">
                      <span className="inline-flex items-center gap-1.5 font-medium">
                        <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>Renda: restrito ao Gestor · CPF: {c.cpfMascarado}</span>
                      </span>
                      <span className="font-semibold text-slate-700 tabular-nums">
                        Comprometimento: {formatPctBR(c.comprometimentoPct)}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <div>
                            <span className="text-slate-500">CPF:</span>{' '}
                            <span className="font-mono text-slate-800">
                              {isRevealed ? c.cpfReal : c.cpfMascarado}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500">Renda comprovada:</span>{' '}
                            <strong className="font-mono text-slate-900 tabular-nums">
                              {isRevealed ? formatBRL(c.rendaReal) : c.rendaMascarada}
                            </strong>{' '}
                            <span className="text-slate-500 tabular-nums">
                              (comprometimento {formatPctBR(c.comprometimentoPct)} sobre {formatBRL(c.aluguelMaisEncargos)})
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleRevealCandidate(c.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11.5px] font-semibold text-slate-700"
                        >
                          {isRevealed ? (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              Ocultar
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              Revelar LGPD
                            </>
                          )}
                        </button>
                      </div>
                      {revealedIds[c.id] && (
                        <div className="text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                          {revealedIds[c.id]}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Bureau & Checklist */}
                <div className="space-y-1.5 text-[12px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-600">{c.bureauResumo}</span>
                    {!c.consentimentoBureau && (
                      <span className="px-2 py-0.5 rounded bg-red-50 border border-red-200 text-red-700 text-[10.5px] font-semibold shrink-0">
                        Sem termo LGPD
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {c.documentosChecklist.map((doc) => (
                      <span
                        key={doc.nome}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] ${
                          doc.recebido
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                            : 'bg-red-50 border-red-200 text-red-700 font-semibold'
                        }`}
                      >
                        {doc.recebido ? '✓' : '×'} {doc.nome}
                      </span>
                    ))}
                  </div>
                </div>

                {c.motivoRecusa && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11.5px] text-red-800">
                    <strong>Motivo objetivo registrado:</strong> {c.motivoRecusa}
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-500">
                    {c.protocolo ? (
                      <button
                        type="button"
                        onClick={() => c.orderId && onOpenOrderInCenter(c.orderId)}
                        className="font-mono font-semibold text-[#2563EB] hover:underline"
                      >
                        {c.protocolo}
                      </button>
                    ) : (
                      'O agente analisa e recomenda; decisão humana'
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {!c.consentimentoBureau && !readOnly && (
                      <button
                        type="button"
                        onClick={() =>
                          onAskAgent({
                            title: `Cobrar termo LGPD e docs · ${c.nome}`,
                            prefillText: `Solicitar a ${c.nome} o envio do termo de consentimento LGPD assinado e documentos faltantes (${c.documentosFaltantes}) para liberar consulta de bureau conforme LOC-004.`,
                            categoria: 'Locação e contratos',
                            subtipo: 'Análise cadastral',
                            actionType: 'analise_cadastral',
                            evalParams: {
                              consentimentoBureau: false,
                              documentoFaltando: c.documentosFaltantes > 0,
                            },
                            links: [{ type: 'Imóvel', code: c.codigoImovel, label: c.imovel }],
                          })
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#5B3FD0] hover:bg-[#4C32B8] text-white text-[11.5px] font-semibold"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Pedir termo LGPD e docs</span>
                      </button>
                    )}

                    {canDecide && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setRejectModalTarget(c);
                            setRejectReason('');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50/70 hover:bg-red-100 text-red-700 text-[11.5px] font-semibold"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Recusar c/ motivo</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onApproveCandidate(c.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-[11.5px] font-semibold"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Aprovar pelo Gestor</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Link to Contratos */}
      <div className="rounded-xl border border-slate-200 bg-white px-5 py-3 flex flex-wrap items-center justify-between gap-2 text-[12px]">
        <span className="text-slate-600">
          Após aprovação cadastral do Gestor, a minuta padrão é gerada em{' '}
          <strong>Contratos e Jurídico</strong>.
        </span>
        <button
          type="button"
          onClick={() => onNavigateModule('contratos-juridico')}
          className="inline-flex items-center gap-1 font-semibold text-[#2563EB] hover:underline"
        >
          <span>Abrir Contratos e Jurídico</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Modal: Recusa com motivo objetivo ≤ 200 chars */}
      {rejectModalTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/35 backdrop-blur-[1px]"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-5 space-y-4 shadow-lg">
            <div>
              <h3 className="text-[15.5px] font-bold text-slate-900">
                Recusar cadastro · {rejectModalTarget.nome}
              </h3>
              <p className="text-[12px] text-slate-500 mt-0.5">
                A decisão e a recusa são humanas e ficam registradas na trilha (LOC-004). Informe motivo objetivo e não discriminatório.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11.5px] text-slate-600">
                <label htmlFor="reject-reason-input" className="font-semibold">
                  Motivo objetivo da recusa
                </label>
                <span className="font-mono tabular-nums">{rejectReason.length}/200</span>
              </div>
              <textarea
                id="reject-reason-input"
                rows={3}
                maxLength={200}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ex.: Comprometimento de renda superior ao aceito pelo proprietário sem garantia adicional."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-[12.5px] text-slate-900 focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectModalTarget(null)}
                className="px-3.5 py-2 rounded-lg border border-slate-200 text-[12.5px] font-medium text-slate-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={rejectReason.trim().length < 10}
                onClick={() => {
                  onRejectCandidate(rejectModalTarget.id, rejectReason.trim());
                  setRejectModalTarget(null);
                }}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-[12.5px] font-semibold"
              >
                Registrar recusa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
