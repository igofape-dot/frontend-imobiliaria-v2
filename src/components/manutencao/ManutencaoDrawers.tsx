import { useEffect, useMemo, useState } from 'react';
import {
  X,
  Bot,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Lock,
  Eye,
  EyeOff,
  Camera,
  Star,
  Pencil,
  Check,
  Clock,
  ArrowUpRight,
  SlidersHorizontal,
} from 'lucide-react';
import {
  avaliarRegra,
  formatBRL,
} from '../../data/financeiroData';
import type { PerfilRegra, Regra } from '../../data/rulesData';
import type { AskAgentRequestPayload } from '../financeiro/AskAgentOrderDrawer';
import {
  AgentRegisteredTag,
  PolicyModeBadge,
  RuleAppliedChip,
  SemaphoreBadge,
} from '../financeiro/FinanceiroShared';
import type {
  ComparatorClass,
  ComparatorItem,
  MaintenanceTicket,
  QuoteCase,
  ResponsavelSugerido,
} from '../../data/manutencaoData';

// ---------------------------------------------------------------------------
// 1. TICKET FICHA DRAWER ("Ficha do chamado")
// ---------------------------------------------------------------------------

interface TicketFichaDrawerProps {
  ticket: MaintenanceTicket | null;
  rules: Regra[];
  perfil: PerfilRegra;
  readOnly: boolean;
  onClose: () => void;
  onCorrectField: (
    ticketId: string,
    updates: Partial<MaintenanceTicket>,
    auditMsg: string
  ) => void;
  onRateAcceptance: (ticketId: string, stars: number) => void;
  onOpenRuleById: (ruleId: string) => void;
  onAskAgent: (req: AskAgentRequestPayload) => void;
  onOpenQuoteComparator?: (orcamentoId: string) => void;
  onShowToast: (text: string) => void;
}

export function TicketFichaDrawer({
  ticket,
  rules,
  perfil,
  readOnly,
  onClose,
  onCorrectField,
  onRateAcceptance,
  onOpenRuleById,
  onAskAgent,
  onOpenQuoteComparator,
  onShowToast,
}: TicketFichaDrawerProps) {
  const [lgpdRevealed, setLgpdRevealed] = useState(false);
  const [lgpdAuditLog, setLgpdAuditLog] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<'problema' | 'responsavel' | null>(null);
  const [draftProblema, setDraftProblema] = useState('');
  const [draftResponsavel, setDraftResponsavel] = useState<ResponsavelSugerido>('Proprietário');

  useEffect(() => {
    if (!ticket) return;
    setLgpdRevealed(false);
    setLgpdAuditLog(null);
    setEditingField(null);
    setDraftProblema(ticket.problema);
    setDraftResponsavel(ticket.responsavelSugerido);
  }, [ticket]);

  useEffect(() => {
    if (!ticket) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [ticket, onClose]);

  if (!ticket) return null;

  const isCorretor = perfil === 'Corretor';
  const slaDetails: Record<MaintenanceTicket['urgencia'], string> = {
    Emergência: '5 min confirmação · visita 4h · solução 2 dias úteis (MAN-001)',
    Urgente: 'visita 24h · solução 3 dias úteis (MAN-001)',
    Normal: 'visita 3 dias úteis · solução 10 dias úteis (MAN-001)',
    Baixa: 'visita 7 dias úteis · solução 20 dias úteis (MAN-001)',
  };

  const handleRevealLgpd = () => {
    if (isCorretor) {
      onShowToast('Perfil Corretor não possui permissão para revelar dados pessoais do proprietário.');
      return;
    }
    const next = !lgpdRevealed;
    setLgpdRevealed(next);
    if (next) {
      const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      setLgpdAuditLog(
        `Acesso LGPD registrado: ${perfil} Farina revelou contatos de ${ticket.protocol} em 22/11/2026 às ${time}.`
      );
      onShowToast('Dados revelados com registro na trilha de auditoria LGPD.');
    }
  };

  const liveEval = ticket.lacunaRegra
    ? avaliarRegra('reembolso_inquilino', { valor: ticket.valorOrcamento ?? 420 }, rules)
    : avaliarRegra(
        'classificar_chamado',
        {
          emergencia: ticket.urgencia === 'Emergência',
          imovelIdentificado: ticket.imovelIdentificado,
          confiancaExtracao: ticket.confiancaTriagem,
          imovelOcupado: ticket.imovelOcupado,
          aceiteVisitaInquilino: ticket.aceiteVisitaInquilino,
        },
        rules
      );

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ticket-ficha-title"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-2xl bg-white h-full border-l border-slate-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[12px] font-bold text-[#2563EB]">
                {ticket.protocol}
              </span>
              <SemaphoreBadge semaphore={ticket.prazoSemaforo} label={ticket.prazoTexto} />
              <PolicyModeBadge modo={liveEval.modo} />
              <RuleAppliedChip
                ruleId={ticket.regraId}
                versao={ticket.regraVersao || undefined}
                onOpenRule={onOpenRuleById}
              />
            </div>
            <h2 id="ticket-ficha-title" className="text-[17px] font-bold text-slate-900">
              {ticket.imovel} · {ticket.problema}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <AgentRegisteredTag
                label={`${ticket.registeredBy}, fonte: ${ticket.fonteRegistro} · ${ticket.confiancaTriagem}% confiança`}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Fechar ficha do chamado"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Padronized 60 / 140 / 400 */}
          <section className="rounded-xl border border-slate-200 bg-[#F8F9FB] p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Ficha padronizada (60 / 140 / 400)
              </span>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => setEditingField(editingField === 'problema' ? null : 'problema')}
                  className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#2563EB] hover:underline"
                >
                  <Pencil className="w-3 h-3" />
                  Corrigir em 1 clique
                </button>
              )}
            </div>

            {editingField === 'problema' ? (
              <div className="flex flex-wrap items-center gap-2 bg-white p-2.5 rounded-lg border border-blue-200">
                <input
                  type="text"
                  maxLength={60}
                  value={draftProblema}
                  onChange={(e) => setDraftProblema(e.target.value)}
                  className="flex-1 min-w-[220px] px-2.5 py-1.5 rounded-lg border border-slate-300 text-[13px]"
                />
                <button
                  type="button"
                  onClick={() => {
                    onCorrectField(
                      ticket.id,
                      {
                        problema: draftProblema.trim() || ticket.problema,
                        registeredBy: 'Registrado pelo agente · corrigido por você',
                      },
                      'A correção treina o agente'
                    );
                    setEditingField(null);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#2563EB] text-white text-[12px] font-semibold"
                >
                  <Check className="w-3.5 h-3.5" />
                  Salvar (treina agente)
                </button>
              </div>
            ) : (
              <div>
                <div className="text-[11px] font-semibold text-slate-500">Assunto (máx. 60)</div>
                <div className="text-[13.5px] font-semibold text-slate-900">{ticket.problema}</div>
              </div>
            )}

            <div>
              <div className="text-[11px] font-semibold text-slate-500">Objetivo (máx. 140)</div>
              <div className="text-[12.5px] text-slate-800">{ticket.objetivo}</div>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-slate-500">Narrativa completa (máx. 400)</div>
              <p className="text-[12.5px] text-slate-700 leading-relaxed">{ticket.narrativa}</p>
            </div>
          </section>

          {/* Urgency, SLA and LGPD Contacts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 p-4 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Urgência e prazos (MAN-001)
              </div>
              <div className="text-[13.5px] font-bold text-slate-900">{ticket.urgencia}</div>
              <p className="text-[12px] text-slate-600">{slaDetails[ticket.urgencia]}</p>
              <div className="text-[11.5px] text-slate-500 pt-1">
                {ticket.imovelOcupado
                  ? ticket.aceiteVisitaInquilino
                    ? 'Acesso: imóvel ocupado com aceite de visita registrado ✓'
                    : 'Acesso bloqueado: imóvel ocupado sem aceite de visita do inquilino'
                  : 'Imóvel vago · acesso com chave da imobiliária'}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Partes e privacidade (LGPD)
                </span>
                {!isCorretor && (
                  <button
                    type="button"
                    onClick={handleRevealLgpd}
                    className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#2563EB] hover:underline"
                  >
                    {lgpdRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {lgpdRevealed ? 'Ocultar' : 'Revelar'}
                  </button>
                )}
              </div>
              <div className="text-[12.5px] text-slate-800">
                <span className="font-semibold">Solicitante:</span> {ticket.solicitanteNome} ({ticket.solicitantePapel}) ·{' '}
                <span className="font-mono text-[12px]">
                  {lgpdRevealed && !isCorretor ? ticket.solicitanteContatoReal : ticket.solicitanteContatoMascarado}
                </span>
              </div>
              <div className="text-[12.5px] text-slate-800">
                <span className="font-semibold">Proprietário:</span>{' '}
                {isCorretor ? (
                  <span className="text-slate-500 italic">Dados pessoais do proprietário ocultos no perfil Corretor</span>
                ) : (
                  <>
                    {ticket.proprietarioNome} ·{' '}
                    <span className="font-mono text-[12px]">
                      {lgpdRevealed ? ticket.proprietarioContatoReal : ticket.proprietarioContatoMascarado}
                    </span>
                  </>
                )}
              </div>
              {lgpdAuditLog && (
                <div className="rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1.5 text-[11px] text-slate-600">
                  {lgpdAuditLog}
                </div>
              )}
            </div>
          </div>

          {/* Responsibility Suggestion */}
          <section className="rounded-xl border border-slate-200 p-4 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Responsável sugerido pelo agente (MAN-002 v3)
                </div>
                <div className="text-[14px] font-bold text-slate-900 mt-0.5">
                  {ticket.responsavelSugerido}{' '}
                  <span className="text-[12px] font-semibold text-[#5B3FD0]">
                    ({ticket.confiancaResponsavel}% confiança)
                  </span>
                </div>
              </div>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => setEditingField(editingField === 'responsavel' ? null : 'responsavel')}
                  className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#2563EB] hover:underline"
                >
                  <Pencil className="w-3 h-3" />
                  Corrigir responsável
                </button>
              )}
            </div>

            {editingField === 'responsavel' && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {(['Proprietário', 'Inquilino', 'Condomínio ou terceiros', 'A definir'] as ResponsavelSugerido[]).map(
                  (opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setDraftResponsavel(opt)}
                      className={`px-2.5 py-1 rounded-lg border text-[12px] font-semibold ${
                        draftResponsavel === opt
                          ? 'bg-[#2563EB] text-white border-[#2563EB]'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      {opt}
                    </button>
                  )
                )}
                <button
                  type="button"
                  onClick={() => {
                    onCorrectField(
                      ticket.id,
                      {
                        responsavelSugerido: draftResponsavel,
                        registeredBy: 'Registrado pelo agente · corrigido por você',
                      },
                      'A correção treina o agente'
                    );
                    setEditingField(null);
                  }}
                  className="px-3 py-1 rounded-lg bg-slate-900 text-white text-[12px] font-semibold"
                >
                  Aplicar (treina agente)
                </button>
              </div>
            )}

            <p className="text-[11.5px] text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
              Sugestão do agente. Decisão humana. Critérios a validar com o Jurídico. Fonte: {ticket.fonteRegistro}.
            </p>
          </section>

          {/* Linked Quote / Budget */}
          {ticket.orcamentoId && onOpenQuoteComparator && (
            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3.5 flex flex-wrap items-center justify-between gap-3">
              <div className="text-[12.5px] text-slate-800">
                <span className="font-semibold">Orçamento vinculado:</span> {ticket.fornecedor} ·{' '}
                {!isCorretor && ticket.valorOrcamento ? (
                  <span className="font-bold tabular-nums">{formatBRL(ticket.valorOrcamento)}</span>
                ) : (
                  <span className="text-slate-500">Valor restrito no perfil Corretor</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenQuoteComparator(ticket.orcamentoId!);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#2563EB] text-white text-[12px] font-semibold"
              >
                Ver comparação e portões
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Photos & Original Message */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 p-4 space-y-2.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Fotos recebidas ({ticket.fotos.length})
              </div>
              <p className="text-[11px] text-slate-500">
                Evite pessoas nas imagens. Acesso às fotos é registrado.
              </p>
              {ticket.fotos.length === 0 ? (
                <div className="rounded-lg bg-slate-100 border border-dashed border-slate-300 p-4 text-center text-[12px] text-slate-500">
                  Nenhuma foto enviada neste chamado
                </div>
              ) : (
                <div className="space-y-2">
                  {ticket.fotos.map((f, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg bg-slate-100 border border-slate-200 p-3 flex items-center gap-3"
                    >
                      <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                        <Camera className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[12px] font-semibold text-slate-800">{f.legenda}</div>
                        <div className="text-[11px] text-slate-500">
                          {f.comodo} · {f.data}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 p-4 space-y-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Mensagem original ({ticket.channel})
                </div>
                <p className="mt-1.5 text-[12px] text-slate-700 bg-slate-50 rounded-lg p-2.5 border border-slate-200 italic">
                  “{ticket.mensagemOriginal}”
                </p>
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Prévia de retorno ao solicitante ({ticket.previaRetorno.canal})
                </div>
                {ticket.previaRetorno.assunto && (
                  <div className="text-[11.5px] font-semibold text-slate-800 mt-1">
                    Assunto: {ticket.previaRetorno.assunto}
                  </div>
                )}
                <p className="mt-1 text-[12px] text-slate-700 bg-[#F3F0FF]/50 rounded-lg p-2.5 border border-[#5B3FD0]/20">
                  {ticket.previaRetorno.corpo}
                </p>
                <div className="text-[10.5px] text-slate-500 mt-1">
                  {ticket.previaRetorno.canal === 'WhatsApp'
                    ? `${ticket.previaRetorno.corpo.length}/300 caracteres · informa previsão, nunca garantia`
                    : `${ticket.previaRetorno.corpo.length}/600 caracteres · janela 8h–19h`}
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <section className="rounded-xl border border-slate-200 p-4 space-y-2.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Linha do tempo do chamado
            </div>
            <div className="space-y-2">
              {ticket.timeline.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-[12px]">
                  <Clock className="w-3.5 h-3.5 text-[#5B3FD0] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-mono text-[11px] text-slate-500">{step.data}</span> ·{' '}
                    <span className="font-semibold text-slate-900">{step.etapa}</span> ({step.ator}):{' '}
                    <span className="text-slate-700">{step.resumo}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Acceptance rating 1..5 */}
          <section className="rounded-xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[12.5px] font-bold text-slate-900">
                Aceite do solicitante (nota 1 a 5)
              </div>
              <div className="text-[11.5px] text-slate-500">
                {ticket.notaAceite
                  ? `Avaliação registrada: ${ticket.notaAceite} de 5 estrelas`
                  : 'Aguardando avaliação após conclusão do serviço'}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  disabled={readOnly}
                  onClick={() => onRateAcceptance(ticket.id, star)}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    (ticket.notaAceite ?? 0) >= star
                      ? 'bg-amber-50 border-amber-300 text-amber-500'
                      : 'bg-white border-slate-200 text-slate-300 hover:text-amber-400'
                  }`}
                  aria-label={`Avaliar com ${star} estrela(s)`}
                >
                  <Star className="w-4 h-4 fill-current" />
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Footer actions: Pedir ao agente */}
        <div className="px-6 py-4 border-t border-slate-200 bg-[#F8F9FB] flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            {!readOnly && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    onAskAgent({
                      title: `Cobrar fornecedor · ${ticket.imovel}`,
                      prefillText: `Cobrar posição e previsão de execução de ${ticket.fornecedor} para o chamado ${ticket.protocol} (${ticket.imovel}).`,
                      categoria: 'Manutenção e vistoria',
                      subtipo: 'Chamado',
                      actionType: 'classificar_chamado',
                      evalParams: {
                        emergencia: ticket.urgencia === 'Emergência',
                        imovelIdentificado: ticket.imovelIdentificado,
                        confiancaExtracao: ticket.confiancaTriagem,
                        imovelOcupado: ticket.imovelOcupado,
                        aceiteVisitaInquilino: ticket.aceiteVisitaInquilino,
                      },
                    })
                  }
                  className="px-3 py-1.5 rounded-lg bg-[#5B3FD0] hover:bg-[#4C32B8] text-white text-[12px] font-semibold whitespace-nowrap"
                >
                  Pedir ao agente: cobrar fornecedor
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onAskAgent({
                      title: `Pedir novos orçamentos · ${ticket.imovel}`,
                      prefillText: `Solicitar 2 novos orçamentos de fornecedores homologados para ${ticket.imovel} (${ticket.problema}) pela MAN-003.`,
                      categoria: 'Manutenção e vistoria',
                      subtipo: 'Orçamento de reparo',
                      actionType: 'orcamento',
                      evalParams: {
                        valor: ticket.valorOrcamento ?? 1600,
                        fornecedorHomologado: true,
                        qtdOrcamentos: 1,
                        autorizacaoProprietario: false,
                      },
                    })
                  }
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-[12px] font-semibold whitespace-nowrap"
                >
                  Pedir novos orçamentos
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onAskAgent({
                      title: `Solicitar autorização do proprietário · ${ticket.imovel}`,
                      prefillText: `Solicitar autorização formal do proprietário de ${ticket.imovel} para o reparo (${ticket.problema}) pela MAN-004.`,
                      categoria: 'Manutenção e vistoria',
                      subtipo: 'Orçamento de reparo',
                      actionType: 'orcamento',
                      evalParams: {
                        valor: ticket.valorOrcamento ?? 1120,
                        fornecedorHomologado: true,
                        qtdOrcamentos: 2,
                        autorizacaoProprietario: false,
                      },
                    })
                  }
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-[12px] font-semibold whitespace-nowrap"
                >
                  Solicitar autorização ao dono
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onAskAgent({
                      title: `Registrar contestação do inquilino · ${ticket.imovel}`,
                      prefillText: `Inquilino contestou cobrança de responsabilidade no chamado ${ticket.protocol}; bloquear cobrança automática e escalar dossiê ao Jurídico pela MAN-002 v3.`,
                      categoria: 'Manutenção e vistoria',
                      subtipo: 'Chamado',
                      actionType: 'atribuir_responsabilidade',
                      evalParams: {
                        contestacaoInquilino: true,
                        cobrancaInquilino: true,
                        confiancaExtracao: ticket.confiancaResponsavel,
                      },
                    })
                  }
                  className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-[12px] font-semibold whitespace-nowrap"
                >
                  Contestação → Jurídico
                </button>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white text-[12.5px] font-medium text-slate-700"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. INSPECTION COMPARATOR DRAWER (Casa Rua do Lago 9 · 16 itens)
// ---------------------------------------------------------------------------

interface InspectionComparatorDrawerProps {
  isOpen: boolean;
  items: ComparatorItem[];
  rules: Regra[];
  readOnly: boolean;
  onClose: () => void;
  onReclassifyItem: (itemId: string, nextClass: ComparatorClass) => void;
  onConfirmLowConfidenceItem: (itemId: string) => void;
  onOpenRuleById: (ruleId: string) => void;
  onAskAgent: (req: AskAgentRequestPayload) => void;
}

export function InspectionComparatorDrawer({
  isOpen,
  items,
  rules,
  readOnly,
  onClose,
  onReclassifyItem,
  onConfirmLowConfidenceItem,
  onOpenRuleById,
  onAskAgent,
}: InspectionComparatorDrawerProps) {
  const [filterMode, setFilterMode] = useState<'todos' | 'alterados' | 'revisao'>('todos');

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const summary = useMemo(() => {
    let semAlteracao = 0;
    let desgasteCount = 0;
    let desgasteTotal = 0;
    let danoCount = 0;
    let danoTotal = 0;
    let lowConfCount = 0;

    items.forEach((it) => {
      if (it.classificacao === 'Sem alteração') semAlteracao += 1;
      else if (it.classificacao === 'Desgaste natural') {
        desgasteCount += 1;
        desgasteTotal += it.custoEstimado || 350;
      } else {
        danoCount += 1;
        danoTotal += it.custoEstimado || 450;
      }
      if (it.confianca < 80 && !it.corrigido) lowConfCount += 1;
    });

    return {
      semAlteracao,
      desgasteCount,
      desgasteTotal,
      danoCount,
      danoTotal,
      totalPrevisto: desgasteTotal + danoTotal,
      lowConfCount,
    };
  }, [items]);

  const liveEval = useMemo(
    () =>
      avaliarRegra(
        'laudo',
        {
          tipoVistoria: 'Saída',
          cobrancaInquilino: summary.danoCount > 0,
          confiancaExtracao: summary.lowConfCount > 0 ? 76 : 92,
        },
        rules
      ),
    [rules, summary.danoCount, summary.lowConfCount]
  );

  if (!isOpen) return null;

  const filtered = items.filter((it) => {
    if (filterMode === 'alterados') return it.classificacao !== 'Sem alteração';
    if (filterMode === 'revisao') return it.confianca < 80 || it.revisaoHumana;
    return true;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/35 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="comparator-title"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-5xl bg-white h-full border-l border-slate-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-4 shrink-0">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[12px] font-bold text-[#2563EB]">PED-2026-004834</span>
              <span className="text-[11.5px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                CT-2024-0818 · Acerto financeiro
              </span>
              <PolicyModeBadge modo={liveEval.modo} />
              <RuleAppliedChip
                ruleId={liveEval.regraId}
                versao={liveEval.versao}
                onOpenRule={onOpenRuleById}
              />
            </div>
            <h2 id="comparator-title" className="text-[18px] font-bold text-slate-900 mt-1">
              Comparador de Vistoria · Casa Rua do Lago 9 (Lucas Andrade)
            </h2>
            <p className="text-[12.5px] text-slate-500">
              Entrada 08/02/2023 × Saída 19/11/2026 · 16 itens comparados · Evite pessoas nas imagens. Acesso às fotos é registrado.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Fechar comparador de vistoria"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Totals + Rule Status Strip */}
        <div className="px-6 py-3.5 bg-[#F8F9FB] border-b border-slate-200 space-y-3 shrink-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5">
              <div className="text-[11px] font-semibold text-slate-500">Sem alteração</div>
              <div className="text-[18px] font-bold text-slate-900 tabular-nums">
                {summary.semAlteracao} itens
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5">
              <div className="text-[11px] font-semibold text-slate-500">
                Desgaste natural (Proprietário)
              </div>
              <div className="text-[18px] font-bold text-slate-900 tabular-nums">
                {summary.desgasteCount} · {formatBRL(summary.desgasteTotal)}
              </div>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 px-3.5 py-2.5">
              <div className="text-[11px] font-semibold text-amber-800">Danos (Inquilino)</div>
              <div className="text-[18px] font-bold text-amber-950 tabular-nums">
                {summary.danoCount} · {formatBRL(summary.danoTotal)}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5">
              <div className="text-[11px] font-semibold text-slate-500">Total previsto</div>
              <div className="text-[18px] font-bold text-[#2563EB] tabular-nums">
                {formatBRL(summary.totalPrevisto)}
              </div>
              <div className="text-[10px] text-slate-500">
                Apoio ao cálculo. Conferência humana obrigatória.
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-medium text-slate-800">
                <Bot className="w-3.5 h-3.5 text-[#5B3FD0]" />
                <span>
                  Resultado ao vivo: <strong>{liveEval.resultadoTexto}</strong> — {liveEval.motivo}
                </span>
              </span>
            </div>
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
              {[
                { id: 'todos' as const, label: `Todos (${items.length})` },
                { id: 'alterados' as const, label: `Com alteração (${summary.desgasteCount + summary.danoCount})` },
                { id: 'revisao' as const, label: `Revisão humana (${items.filter((i) => i.confianca < 80 || i.revisaoHumana).length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterMode(tab.id)}
                  className={`px-2.5 py-1 rounded-md text-[11.5px] font-semibold ${
                    filterMode === tab.id ? 'bg-[#2563EB] text-white' : 'text-slate-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11.5px] text-slate-600">
            <span>
              <strong>Resumo:</strong> Cobrança de dano ao inquilino exige aprovação humana. Se o inquilino contestar, o caso vai ao Jurídico.
            </span>
            <span className="font-semibold text-amber-800">
              Prazo previsto de preparação: 9 dias. Em cada dia vago, o proprietário deixa de receber o aluguel.
            </span>
          </div>
        </div>

        {/* 16 Items Table/Cards */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filtered.map((item) => {
            const isLowConf = item.confianca < 80 && !item.corrigido;
            return (
              <div
                key={item.id}
                className={`rounded-xl border p-4 space-y-3 ${
                  isLowConf
                    ? 'border-amber-300 bg-amber-50/40'
                    : item.classificacao === 'Dano'
                    ? 'border-red-200 bg-red-50/20'
                    : item.classificacao === 'Desgaste natural'
                    ? 'border-slate-300 bg-slate-50/50'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-400 tabular-nums">
                        #{item.ordem.toString().padStart(2, '0')}
                      </span>
                      <span className="text-[14px] font-bold text-slate-900">{item.itemNome}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                        {item.comodo}
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                          isLowConf
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-[#F3F0FF] text-[#5B3FD0] border-[#5B3FD0]/20'
                        }`}
                      >
                        {item.confianca}% confiança {isLowConf ? '· revisão humana' : ''}
                      </span>
                      {item.corrigido && (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          A correção treina o agente ✓
                        </span>
                      )}
                    </div>
                    <div className="text-[11.5px] text-slate-500 mt-0.5">
                      Fonte: {item.fonte}
                    </div>
                  </div>

                  {/* Interactive Reclassification */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(['Sem alteração', 'Desgaste natural', 'Dano'] as ComparatorClass[]).map((cls) => {
                      const active = item.classificacao === cls;
                      return (
                        <button
                          key={cls}
                          type="button"
                          disabled={readOnly}
                          onClick={() => onReclassifyItem(item.id, cls)}
                          className={`px-2.5 py-1 rounded-lg border text-[11.5px] font-semibold transition-colors ${
                            active
                              ? cls === 'Dano'
                                ? 'bg-red-600 text-white border-red-600'
                                : cls === 'Desgaste natural'
                                ? 'bg-slate-800 text-white border-slate-800'
                                : 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {cls}
                        </button>
                      );
                    })}
                    {isLowConf && !readOnly && (
                      <button
                        type="button"
                        onClick={() => onConfirmLowConfidenceItem(item.id)}
                        className="px-2.5 py-1 rounded-lg bg-[#2563EB] text-white text-[11.5px] font-semibold"
                      >
                        Confirmar item (76%)
                      </button>
                    )}
                  </div>
                </div>

                {/* Two photo columns Entrada vs Saida */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-lg border border-slate-200 bg-white p-3 flex items-start gap-3">
                    <div className="w-16 h-14 rounded-md bg-slate-200 flex flex-col items-center justify-center text-slate-500 shrink-0 text-[10px] font-medium">
                      <Camera className="w-4 h-4 mb-0.5" />
                      Entrada
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-slate-500">
                        {item.fotoEntradaLegenda}
                      </div>
                      <div className="text-[12.5px] text-slate-800 mt-0.5">{item.estadoEntrada}</div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-3 flex items-start gap-3">
                    <div className="w-16 h-14 rounded-md bg-slate-200 flex flex-col items-center justify-center text-slate-500 shrink-0 text-[10px] font-medium">
                      <Camera className="w-4 h-4 mb-0.5" />
                      Saída
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-slate-500">
                        {item.fotoSaidaLegenda}
                      </div>
                      <div className="text-[12.5px] text-slate-800 mt-0.5">{item.estadoSaida}</div>
                    </div>
                  </div>
                </div>

                {item.classificacao !== 'Sem alteração' && (
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[12px] pt-1 border-t border-slate-200/70">
                    <span>
                      <strong>Responsável sugerido:</strong>{' '}
                      {item.classificacao === 'Dano' ? 'Inquilino' : 'Proprietário'}{' '}
                      <span className="text-slate-500">
                        (Sugestão do agente. Decisão humana. Critérios a validar com o Jurídico.)
                      </span>
                    </span>
                    <span className="font-bold text-slate-900 tabular-nums">
                      Custo estimado: {formatBRL(item.custoEstimado || (item.classificacao === 'Dano' ? 450 : 350))}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-[#F8F9FB] flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            {!readOnly && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    onAskAgent({
                      title: 'Aprovar laudo e enviar ao inquilino · Casa Rua do Lago 9',
                      prefillText: `Aprovar o laudo de saída da Casa Rua do Lago 9 (CT-2024-0818): ${summary.desgasteCount} desgastes (${formatBRL(summary.desgasteTotal)} proprietário) e ${summary.danoCount} danos (${formatBRL(summary.danoTotal)} inquilino Lucas Andrade), liberando sequência para Acerto financeiro.`,
                      categoria: 'Manutenção e vistoria',
                      subtipo: 'Vistoria',
                      actionType: 'laudo',
                      evalParams: {
                        tipoVistoria: 'Saída',
                        cobrancaInquilino: summary.danoCount > 0,
                        confiancaExtracao: summary.lowConfCount > 0 ? 76 : 92,
                      },
                      requiresExtraConfirmation: summary.danoCount > 0,
                      extraConfirmationText: `Confirmo a cobrança de danos ao inquilino Lucas Andrade no total de ${formatBRL(summary.danoTotal)} (aprovação humana obrigatória pela MAN-002 v3; se contestar, escala ao Jurídico).`,
                    })
                  }
                  className="px-3.5 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-[12.5px] font-semibold"
                >
                  Pedir ao agente: aprovar laudo e enviar ao inquilino
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onAskAgent({
                      title: 'Pedir orçamentos de reparo · Casa Rua do Lago 9',
                      prefillText: `Solicitar 2 orçamentos homologados para os reparos do laudo da Casa Rua do Lago 9 (total estimado ${formatBRL(summary.totalPrevisto)}, previsão de 9 dias).`,
                      categoria: 'Manutenção e vistoria',
                      subtipo: 'Orçamento de reparo',
                      actionType: 'orcamento',
                      evalParams: {
                        valor: summary.totalPrevisto,
                        fornecedorHomologado: true,
                        qtdOrcamentos: 1,
                        autorizacaoProprietario: false,
                      },
                    })
                  }
                  className="px-3.5 py-2 rounded-lg bg-[#5B3FD0] hover:bg-[#4C32B8] text-white text-[12.5px] font-semibold"
                >
                  Pedir ao agente: pedir orçamentos do reparo
                </button>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-[12.5px] font-medium text-slate-700"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. QUOTE COMPARATOR DRAWER (Portões ao vivo · MAN-003, MAN-004, FIN-011)
// ---------------------------------------------------------------------------

interface QuoteComparatorDrawerProps {
  quoteCase: QuoteCase | null;
  rules: Regra[];
  readOnly: boolean;
  onClose: () => void;
  onOpenRuleById: (ruleId: string) => void;
  onAskAgent: (req: AskAgentRequestPayload) => void;
}

export function QuoteComparatorDrawer({
  quoteCase,
  rules,
  readOnly,
  onClose,
  onOpenRuleById,
  onAskAgent,
}: QuoteComparatorDrawerProps) {
  const [selectedProposalId, setSelectedProposalId] = useState<string>('');
  const [simOver5000, setSimOver5000] = useState(false);
  const [simOwnerAuthorized, setSimOwnerAuthorized] = useState(true);
  const [simHomologated, setSimHomologated] = useState(true);

  useEffect(() => {
    if (!quoteCase) return;
    const def = quoteCase.propostas.find((p) => p.selecionado) ?? quoteCase.propostas[0];
    setSelectedProposalId(def?.id ?? '');
    setSimOver5000(false);
    setSimOwnerAuthorized(quoteCase.autorizacaoProprietario);
    setSimHomologated(quoteCase.fornecedorHomologado);
  }, [quoteCase]);

  useEffect(() => {
    if (!quoteCase) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [quoteCase, onClose]);

  if (!quoteCase) return null;

  const selectedProp =
    quoteCase.propostas.find((p) => p.id === selectedProposalId) ?? quoteCase.propostas[0];
  const baseValue = selectedProp?.valor ?? quoteCase.valorPrincipal;
  const effectiveValue = simOver5000 ? Math.max(baseValue + 1200, 5400) : baseValue;

  const evalResult = avaliarRegra(
    'orcamento',
    {
      valor: effectiveValue,
      emergencia: quoteCase.emergencia,
      fornecedorHomologado: simHomologated && (selectedProp?.homologado ?? true),
      qtdOrcamentos: quoteCase.qtdOrcamentos,
      autorizacaoProprietario: simOwnerAuthorized,
    },
    rules
  );

  const missingOwnerAuth = !simOwnerAuthorized && effectiveValue > 800 && !(quoteCase.emergencia && effectiveValue <= 1500);
  const dailyRent = quoteCase.aluguelMensal / 30;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/35 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quote-comparator-title"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-4xl bg-white h-full border-l border-slate-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-4 shrink-0">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[12px] font-bold text-[#2563EB]">{quoteCase.protocolo}</span>
              <PolicyModeBadge modo={evalResult.modo} />
              <RuleAppliedChip ruleId="MAN-003" versao={2} onOpenRule={onOpenRuleById} />
              <RuleAppliedChip ruleId="MAN-004" versao={1} onOpenRule={onOpenRuleById} />
              <RuleAppliedChip ruleId="FIN-011" versao={2} onOpenRule={onOpenRuleById} />
            </div>
            <h2 id="quote-comparator-title" className="text-[18px] font-bold text-slate-900 mt-1">
              Comparador de Orçamentos · {quoteCase.imovel}
            </h2>
            <p className="text-[12.5px] text-slate-500">
              {quoteCase.servico} · Aluguel pedido {formatBRL(quoteCase.aluguelMensal)}/mês ({formatBRL(dailyRent)}/dia)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Fechar comparador de orçamentos"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Agent Recommendation */}
          <div className="rounded-xl border border-[#5B3FD0]/25 bg-[#F3F0FF]/50 p-4 flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#5B3FD0]">
                <Bot className="w-4 h-4" />
                Recomendação do agente ({quoteCase.confianca}% confiança)
              </div>
              <p className="text-[13px] text-slate-800">{quoteCase.recomendacaoAgente}</p>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-[11px] font-semibold text-slate-700">
              Apoio ao cálculo. Conferência humana obrigatória.
            </span>
          </div>

          {/* Proposals Selector */}
          <section className="space-y-2.5">
            <div className="text-[12px] font-bold uppercase tracking-wider text-slate-500">
              Propostas recebidas (selecione para testar nos portões)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {quoteCase.propostas.map((prop) => {
                const isSelected = prop.id === selectedProp?.id;
                return (
                  <button
                    key={prop.id}
                    type="button"
                    onClick={() => setSelectedProposalId(prop.id)}
                    className={`text-left rounded-xl border p-4 transition-colors ${
                      isSelected
                        ? 'border-[#2563EB] bg-blue-50/40'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-[14px] font-bold text-slate-900">{prop.fornecedor}</div>
                        <div className="text-[11.5px] text-slate-500 mt-0.5">
                          {prop.homologado ? 'Fornecedor homologado ✓' : 'Não homologado ✗'} · Garantia {prop.garantiaDias} dias
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[16px] font-bold text-slate-900 tabular-nums">
                          {formatBRL(prop.valor)}
                        </div>
                        <div className="text-[11.5px] text-slate-600">Previsão {prop.prazoDias} dia(s)</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Interactive Simulation Controls */}
          <section className="rounded-xl border border-slate-200 bg-[#F8F9FB] p-4 space-y-3">
            <div className="flex items-center gap-2 text-[12px] font-bold text-slate-700">
              <SlidersHorizontal className="w-4 h-4 text-[#2563EB]" />
              Simular cenário nos portões (sem alterar cadastro)
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[12.5px]">
              <label className="inline-flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                <input
                  type="checkbox"
                  checked={simOver5000}
                  onChange={(e) => setSimOver5000(e.target.checked)}
                  className="rounded border-slate-300 text-[#2563EB]"
                />
                <span>Simular valor &gt; R$ 5.000,00 ({formatBRL(Math.max(baseValue + 1200, 5400))})</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                <input
                  type="checkbox"
                  checked={simOwnerAuthorized}
                  onChange={(e) => setSimOwnerAuthorized(e.target.checked)}
                  className="rounded border-slate-300 text-[#2563EB]"
                />
                <span>Autorização do proprietário registrada</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                <input
                  type="checkbox"
                  checked={simHomologated}
                  onChange={(e) => setSimHomologated(e.target.checked)}
                  className="rounded border-slate-300 text-[#2563EB]"
                />
                <span>Fornecedor homologado</span>
              </label>
            </div>
          </section>

          {/* Live 4 Gates Panel */}
          <section className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500">
                Painel de Portões ao vivo (resultado = mais restritivo)
              </span>
              <span className="text-[12.5px] font-bold text-slate-900">
                {evalResult.resultadoTexto}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(evalResult.portoes ?? []).map((gate) => (
                <div
                  key={gate.nome}
                  className={`rounded-xl border p-3.5 space-y-1 ${
                    gate.status === 'ok'
                      ? 'border-emerald-200 bg-emerald-50/40'
                      : gate.status === 'pendente'
                      ? 'border-amber-200 bg-amber-50/50'
                      : 'border-red-200 bg-red-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12.5px] font-bold text-slate-900">{gate.nome}</span>
                    {gate.status === 'ok' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" /> ✓
                      </span>
                    ) : gate.status === 'pendente' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800">
                        <AlertTriangle className="w-3.5 h-3.5" /> Pendente
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700">
                        <Lock className="w-3.5 h-3.5" /> ✗ Bloqueado
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-slate-700">{gate.detalhe}</p>
                  {gate.quemDestrava && (
                    <div className="text-[11px] font-semibold text-slate-600">
                      Quem destrava: {gate.quemDestrava}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <p className="text-[12px] text-slate-600 bg-slate-50 rounded-lg p-3 border border-slate-200">
              <strong>Motor de políticas:</strong> {evalResult.motivo}
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-[#F8F9FB] flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            {!readOnly && (
              <>
                {missingOwnerAuth ? (
                  <button
                    type="button"
                    onClick={() =>
                      onAskAgent({
                        title: `Solicitar autorização ao proprietário · ${quoteCase.imovel}`,
                        prefillText: `Solicitar autorização formal do proprietário de ${quoteCase.imovel} para o orçamento de ${formatBRL(effectiveValue)} (${selectedProp?.fornecedor}) pela MAN-004.`,
                        categoria: 'Manutenção e vistoria',
                        subtipo: 'Orçamento de reparo',
                        actionType: 'orcamento',
                        evalParams: {
                          valor: effectiveValue,
                          emergencia: quoteCase.emergencia,
                          fornecedorHomologado: simHomologated,
                          qtdOrcamentos: quoteCase.qtdOrcamentos,
                          autorizacaoProprietario: false,
                        },
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#5B3FD0] hover:bg-[#4C32B8] text-white text-[12.5px] font-semibold"
                  >
                    <Sparkles className="w-4 h-4" />
                    Pedir ao agente: solicitar autorização ao proprietário
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      onAskAgent({
                        title: `Contratar ${selectedProp?.fornecedor} · ${quoteCase.imovel}`,
                        prefillText: `Contratar ${selectedProp?.fornecedor} por ${formatBRL(effectiveValue)} para ${quoteCase.imovel} (${quoteCase.servico}) com registro na conta de terceiros e desconto no repasse (FIN-011 / FIN-003).`,
                        categoria: 'Manutenção e vistoria',
                        subtipo: 'Orçamento de reparo',
                        actionType: 'orcamento',
                        evalParams: {
                          valor: effectiveValue,
                          emergencia: quoteCase.emergencia,
                          fornecedorHomologado: simHomologated,
                          qtdOrcamentos: quoteCase.qtdOrcamentos,
                          autorizacaoProprietario: simOwnerAuthorized,
                        },
                        requiresExtraConfirmation: effectiveValue > 5000,
                        extraConfirmationText:
                          effectiveValue > 5000
                            ? `Pagamento simulado acima de R$ 5.000,00 (${formatBRL(effectiveValue)}): confirmo impacto em conta de terceiros e exigência de 3 orçamentos pela MAN-003.`
                            : undefined,
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-[12.5px] font-semibold"
                  >
                    <Sparkles className="w-4 h-4" />
                    Pedir ao agente: contratar fornecedor selecionado
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    onAskAgent({
                      title: `Pedir mais orçamentos · ${quoteCase.imovel}`,
                      prefillText: `Solicitar orçamento adicional de fornecedor homologado para ${quoteCase.imovel} (${quoteCase.servico}) pela MAN-003 v2.`,
                      categoria: 'Manutenção e vistoria',
                      subtipo: 'Orçamento de reparo',
                      actionType: 'orcamento',
                      evalParams: {
                        valor: effectiveValue,
                        fornecedorHomologado: true,
                        qtdOrcamentos: 1,
                        autorizacaoProprietario: simOwnerAuthorized,
                      },
                    })
                  }
                  className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-[12.5px] font-semibold"
                >
                  Pedir ao agente: pedir mais orçamentos
                </button>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-[12.5px] font-medium text-slate-700"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
