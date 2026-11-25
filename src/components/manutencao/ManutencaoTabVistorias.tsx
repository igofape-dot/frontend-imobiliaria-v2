import { useMemo, useState } from 'react';
import {
  CalendarClock,
  Camera,
  CheckCircle2,
  FileCheck2,
  Lock,
  ShieldAlert,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { formatBRL } from '../../data/financeiroData';
import type { PerfilRegra } from '../../data/rulesData';
import type { AskAgentRequestPayload } from '../financeiro/AskAgentOrderDrawer';
import {
  AgentRegisteredTag,
  RuleAppliedChip,
  SemaphoreBadge,
} from '../financeiro/FinanceiroShared';
import type {
  InspectionReport,
  InspectionScheduleItem,
} from '../../data/manutencaoData';

interface ManutencaoTabVistoriasProps {
  schedule: InspectionScheduleItem[];
  reports: InspectionReport[];
  perfil: PerfilRegra;
  readOnly: boolean;
  onOpenLago9Comparator: () => void;
  onOpenRuleById: (ruleId: string) => void;
  onAskAgent: (req: AskAgentRequestPayload) => void;
}

type VistoriaFilterId =
  | 'todas'
  | 'entradas_7d'
  | 'saidas_agendadas'
  | 'saidas_pendentes'
  | 'aguardando_aprovacao'
  | 'contestados';

export function ManutencaoTabVistorias({
  schedule,
  reports,
  perfil,
  readOnly,
  onOpenLago9Comparator,
  onOpenRuleById,
  onAskAgent,
}: ManutencaoTabVistoriasProps) {
  const [filterId, setFilterId] = useState<VistoriaFilterId>('todas');
  const isCorretor = perfil === 'Corretor';

  const scopedSchedule = useMemo(
    () => (isCorretor ? schedule.filter((s) => s.corretor === 'Rafael Costa') : schedule),
    [schedule, isCorretor]
  );

  const scopedReports = useMemo(
    () => (isCorretor ? reports.filter((r) => r.corretor === 'Rafael Costa') : reports),
    [reports, isCorretor]
  );

  const filteredSchedule = useMemo(() => {
    if (filterId === 'entradas_7d') return scopedSchedule.filter((s) => s.tipo === 'Entrada');
    if (filterId === 'saidas_agendadas')
      return scopedSchedule.filter((s) => s.tipo === 'Saída' && s.prazoSemaforo === 'verde');
    if (filterId === 'saidas_pendentes')
      return scopedSchedule.filter((s) => s.tipo === 'Saída' && s.situacao.includes('Chaves devolvidas'));
    return scopedSchedule;
  }, [scopedSchedule, filterId]);

  const filteredReports = useMemo(() => {
    if (filterId === 'aguardando_aprovacao')
      return scopedReports.filter((r) => r.status === 'Aguardando aprovação');
    if (filterId === 'contestados')
      return scopedReports.filter((r) => r.contestacaoInquilino);
    return scopedReports;
  }, [scopedReports, filterId]);

  const cards: { id: VistoriaFilterId; label: string; count: number; sub?: string; tone?: 'red' | 'amber' }[] = [
    { id: 'entradas_7d', label: 'Entradas agendadas (7 dias)', count: 3 },
    { id: 'saidas_agendadas', label: 'Saídas agendadas', count: 1 },
    { id: 'saidas_pendentes', label: 'Saídas pendentes (chaves devolvidas)', count: 3, sub: 'sendo 2 atrasadas', tone: 'red' },
    { id: 'aguardando_aprovacao', label: 'Laudos aguardando aprovação', count: 1, tone: 'amber' },
    { id: 'contestados', label: 'Laudos contestados pelo inquilino', count: 0 },
  ];

  return (
    <div className="space-y-5">
      {/* 5 Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
        {cards.map((c) => {
          const active = filterId === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setFilterId(active ? 'todas' : c.id)}
              className={`text-left rounded-xl border p-3.5 transition-colors ${
                active
                  ? 'border-[#2563EB] bg-blue-50/50'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="text-[11.5px] font-medium text-slate-600">{c.label}</div>
              <div
                className={`text-[21px] font-bold tabular-nums mt-1 ${
                  c.tone === 'red'
                    ? 'text-red-700'
                    : c.tone === 'amber'
                    ? 'text-amber-700'
                    : 'text-slate-900'
                }`}
              >
                {c.count}
              </div>
              {c.sub && <div className="text-[11px] font-semibold text-red-700">{c.sub}</div>}
            </button>
          );
        })}
      </div>

      {/* Zero-typing & LGPD photo notice */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="text-[13px] font-bold text-slate-900 flex items-center gap-2">
            <Camera className="w-4 h-4 text-[#5B3FD0]" />
            O vistoriador envia fotos, vídeos e áudio pelo WhatsApp ou app. O agente gera o laudo e compara com a entrada. Ninguém digita laudo.
          </div>
          <div className="text-[11.5px] text-slate-500">
            Evite pessoas nas imagens. Acesso às fotos é registrado. Horário de visitas somente entre 8h e 19h (MAN-005 v2).
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenLago9Comparator}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-[12.5px] font-semibold"
          >
            <FileCheck2 className="w-4 h-4" />
            Abrir comparador Casa Rua do Lago 9 (16 itens)
          </button>
          {!readOnly && (
            <button
              type="button"
              onClick={() =>
                onAskAgent({
                  title: 'Pedir ao agente: agendar ou processar vistoria',
                  prefillText:
                    'Agendar vistoria respeitando janela 8h–19h, prazo de 3 dias úteis após chaves e gerar laudo comparativo em até 2 dias úteis pela MAN-005 v2.',
                  categoria: 'Manutenção e vistoria',
                  subtipo: 'Vistoria',
                  actionType: 'laudo',
                  evalParams: { tipoVistoria: 'Saída', cobrancaInquilino: false, confiancaExtracao: 92 },
                })
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#5B3FD0] hover:bg-[#4C32B8] text-white text-[12.5px] font-semibold"
            >
              <Sparkles className="w-4 h-4" />
              Pedir ao agente: agendar vistoria
            </button>
          )}
        </div>
      </div>

      {/* Entrada key handover gate (MAN-005) */}
      <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
          <div>
            <div className="text-[13px] font-bold text-red-950">
              Apto 1204 Ed. Aurora (PED-2026-004790) · Entrega de chaves bloqueada
            </div>
            <p className="text-[12px] text-red-900 mt-0.5">
              Sem laudo de entrada assinado o agente não registra a entrega das chaves (MAN-005 v2). Checklist e 22 fotos recebidos; provedor de assinatura digital pendente de aceite da inquilina Camila Duarte.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <RuleAppliedChip ruleId="MAN-005" versao={2} onOpenRule={onOpenRuleById} />
          {!readOnly && (
            <button
              type="button"
              onClick={() =>
                onAskAgent({
                  title: 'Cobrar assinatura do laudo de entrada · Apto 1204 Ed. Aurora',
                  prefillText:
                    'Testar entrega de chaves e reenviar link de assinatura digital do laudo de entrada para Camila Duarte (Apto 1204 Ed. Aurora) pela MAN-005 v2.',
                  categoria: 'Manutenção e vistoria',
                  subtipo: 'Entrega de chaves',
                  actionType: 'laudo',
                  evalParams: { tipoVistoria: 'Entrada', laudoAssinado: false },
                })
              }
              className="px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white text-[12px] font-semibold whitespace-nowrap"
            >
              Pedir ao agente: cobrar assinatura
            </button>
          )}
        </div>
      </div>

      {/* Agenda próximos 7 dias */}
      <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-[#2563EB]" />
            <h3 className="text-[14.5px] font-bold text-slate-900">
              Agenda dos próximos 7 dias (somente entre 8h e 19h)
            </h3>
          </div>
          <span className="text-[12px] text-slate-500">
            Vistoriadores: Edson Moraes e Carla Reis
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12.5px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Data e hora</th>
                <th className="px-4 py-2.5 font-semibold">Tipo</th>
                <th className="px-4 py-2.5 font-semibold">Imóvel</th>
                <th className="px-4 py-2.5 font-semibold">Vistoriador</th>
                <th className="px-4 py-2.5 font-semibold">Inquilino / Situação</th>
                <th className="px-4 py-2.5 font-semibold">Prazo MAN-005</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSchedule.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                    {item.dataHora}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        item.tipo === 'Saída'
                          ? 'bg-amber-50 text-amber-900 border border-amber-200'
                          : 'bg-blue-50 text-[#2563EB] border border-blue-200'
                      }`}
                    >
                      {item.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{item.imovel}</td>
                  <td className="px-4 py-3 text-slate-700">{item.vistoriador}</td>
                  <td className="px-4 py-3">
                    <div className="text-slate-800 font-medium">{item.inquilino}</div>
                    <div className="text-[11.5px] text-slate-500">
                      {item.situacao}
                      {item.origemRescisao ? ` · Rescisão ${item.origemRescisao}` : ''}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <SemaphoreBadge semaphore={item.prazoSemaforo} label={item.prazoTexto} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Lista de laudos recentes (8 linhas) */}
      <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-[14.5px] font-bold text-slate-900">
              Laudos recentes ({filteredReports.length})
            </h3>
            <p className="text-[12px] text-slate-500">
              Laudo gerado pelo agente em até 2 dias úteis após a visita (MAN-005 v2)
            </p>
          </div>
          {filterId !== 'todas' && (
            <button
              type="button"
              onClick={() => setFilterId('todas')}
              className="text-[12px] font-semibold text-[#2563EB] hover:underline"
            >
              Limpar filtro
            </button>
          )}
        </div>

        {filteredReports.length === 0 ? (
          <div className="p-8 text-center text-[13px] text-slate-500">
            Nenhum laudo encontrado neste filtro (0 laudos contestados pelo inquilino atualmente).
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Tipo / Data</th>
                  <th className="px-4 py-2.5 font-semibold">Imóvel / Contrato</th>
                  <th className="px-4 py-2.5 font-semibold">Vistoriador</th>
                  <th className="px-4 py-2.5 font-semibold">Itens &amp; Resultado</th>
                  <th className="px-4 py-2.5 font-semibold">Em disputa</th>
                  <th className="px-4 py-2.5 font-semibold">Status &amp; Confiança</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{rep.tipo}</div>
                      <div className="text-[11px] text-slate-500 tabular-nums">{rep.data}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{rep.imovel}</div>
                      <div className="text-[11px] text-slate-500">
                        {rep.contratoCode} {rep.protocolo ? `· ${rep.protocolo}` : ''}
                      </div>
                      <AgentRegisteredTag label={rep.registeredBy} />
                    </td>
                    <td className="px-4 py-3 text-slate-700">{rep.vistoriador}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{rep.itensCount} itens</div>
                      <div className="text-[11.5px] text-slate-600">{rep.resultadoTexto}</div>
                    </td>
                    <td className="px-4 py-3 font-bold tabular-nums text-slate-900">
                      {rep.valorEmDisputa > 0 ? formatBRL(rep.valorEmDisputa) : '—'}
                    </td>
                    <td className="px-4 py-3 space-y-1">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-semibold ${
                          rep.status === 'Aguardando aprovação'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : rep.status === 'Gerado'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {rep.status === 'Aguardando aprovação' ? (
                          <AlertTriangle className="w-3 h-3" />
                        ) : rep.status === 'Gerado' ? (
                          <ShieldAlert className="w-3 h-3" />
                        ) : (
                          <CheckCircle2 className="w-3 h-3" />
                        )}
                        {rep.status}
                      </span>
                      <div className="text-[11px] font-semibold text-[#5B3FD0]">
                        {rep.confianca}% confiança
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {rep.id === 'laudo-lago-9' ? (
                        <button
                          type="button"
                          onClick={onOpenLago9Comparator}
                          className="px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-[11.5px] font-semibold whitespace-nowrap"
                        >
                          Abrir comparador
                        </button>
                      ) : (
                        <RuleAppliedChip ruleId="MAN-005" versao={2} onOpenRule={onOpenRuleById} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
