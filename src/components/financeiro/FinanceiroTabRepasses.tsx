import { useEffect, useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Ban,
  Clock,
  X,
  FileText,
  Landmark,
  ShieldAlert,
} from 'lucide-react';
import {
  COBERTURA_CAIXA_7D,
  SEGREGATED_BALANCES,
  formatBRL,
  formatBRLCompact,
  type RepasseItem,
} from '../../data/financeiroData';
import type { AskAgentRequestPayload } from './AskAgentOrderDrawer';
import {
  AgentRegisteredTag,
  RuleAppliedChip,
  SemaphoreBadge,
} from './FinanceiroShared';

interface FinanceiroTabRepassesProps {
  repasses: RepasseItem[];
  onAskAgent: (payload: AskAgentRequestPayload) => void;
  onOpenRuleById: (ruleId: string) => void;
  onOpenOrderInCenter: (orderId: string) => void;
}

type RepasseCardFilter = 'todos' | 'hoje' | 'atrasado' | 'aprovacao' | 'bloqueado';

export function FinanceiroTabRepasses({
  repasses,
  onAskAgent,
  onOpenRuleById,
  onOpenOrderInCenter,
}: FinanceiroTabRepassesProps) {
  const [filter, setFilter] = useState<RepasseCardFilter>('todos');
  const [selectedRepasse, setSelectedRepasse] = useState<RepasseItem | null>(null);
  const [previewChannel, setPreviewChannel] = useState<'WhatsApp' | 'E-mail'>('WhatsApp');

  useEffect(() => {
    if (!selectedRepasse) return;
    setPreviewChannel(selectedRepasse.canalPreferencial);
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setSelectedRepasse(null);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [selectedRepasse]);

  const metrics = useMemo(() => {
    const vencemHoje = repasses.filter((r) => r.venceHoje).length;
    const atrasados = repasses.filter((r) => r.atrasado).length;
    const aguardandoAprovacao = repasses.filter(
      (r) => r.status === 'Aguardando aprovação'
    ).length;
    const bloqueados = repasses.filter(
      (r) => r.status === 'Bloqueado (conciliação)'
    ).length;
    const totalRepassar = repasses.reduce((acc, r) => acc + r.valorLiquido, 0);
    return { vencemHoje, atrasados, aguardandoAprovacao, bloqueados, totalRepassar };
  }, [repasses]);

  const filtered = useMemo(() => {
    return repasses.filter((r) => {
      if (filter === 'hoje') return !!r.venceHoje;
      if (filter === 'atrasado') return !!r.atrasado;
      if (filter === 'aprovacao') return r.status === 'Aguardando aprovação';
      if (filter === 'bloqueado') return r.status === 'Bloqueado (conciliação)';
      return true;
    });
  }, [repasses, filter]);

  const buildOwnerPreviewText = (rep: RepasseItem, ch: 'WhatsApp' | 'E-mail') => {
    if (ch === 'WhatsApp') {
      const msg = `Olá, ${rep.proprietario}! Seu demonstrativo de repasse (${rep.imoveisDesc}) está pronto: aluguel ${formatBRL(
        rep.aluguelRecebido
      )}, taxa adm -${formatBRL(rep.taxaAdm)}, líquido a transferir ${formatBRL(
        rep.valorLiquido
      )} em ${rep.vencimento}.`;
      return { subject: undefined, body: msg.slice(0, 300) };
    }
    const subj = `Demonstrativo de Repasse Nov/2026 · ${rep.imoveisDesc}`.slice(0, 70);
    const body = `Prezado(a) ${rep.proprietario},\n\nEncaminhamos o demonstrativo do repasse referente a ${rep.imoveisDesc}:\n• Aluguel recebido: ${formatBRL(
      rep.aluguelRecebido
    )}\n• Taxa de administração: -${formatBRL(rep.taxaAdm)}\n• Descontos/manutenções: -${formatBRL(
      rep.iptuCondominio + rep.manutencao + rep.comissao
    )}\n• Valor líquido: ${formatBRL(rep.valorLiquido)}\n\nConta destino: ${
      rep.chavePixOuBanco
    }.\nPrevisão de liquidação: ${rep.vencimento}.`.slice(0, 600);
    return { subject: subj, body };
  };

  return (
    <div className="space-y-6">
      {/* 1. CARDS DE STATUS E SALDO */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <button
          type="button"
          onClick={() => setFilter((p) => (p === 'hoje' ? 'todos' : 'hoje'))}
          className={`text-left rounded-xl border p-4 transition-colors ${
            filter === 'hoje'
              ? 'border-[#2563EB] bg-[#EFF4FF]/50'
              : 'bg-white border-slate-200/90 hover:border-slate-300'
          }`}
        >
          <div className="text-[12px] text-slate-500">Vencem hoje</div>
          <div className="text-[22px] font-bold text-slate-900 mt-1 tabular-nums">
            {metrics.vencemHoje}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Corte 16:00</div>
        </button>

        <button
          type="button"
          onClick={() => setFilter((p) => (p === 'atrasado' ? 'todos' : 'atrasado'))}
          className={`text-left rounded-xl border p-4 transition-colors ${
            filter === 'atrasado'
              ? 'border-red-500 bg-red-50/40'
              : 'bg-white border-slate-200/90 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-slate-500">Atrasados</span>
            <SemaphoreBadge semaphore="vermelho" label="Atenção" />
          </div>
          <div className="text-[22px] font-bold text-red-700 mt-1 tabular-nums">
            {metrics.atrasados}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Prioridade urgente</div>
        </button>

        <button
          type="button"
          onClick={() => setFilter((p) => (p === 'aprovacao' ? 'todos' : 'aprovacao'))}
          className={`text-left rounded-xl border p-4 transition-colors ${
            filter === 'aprovacao'
              ? 'border-amber-500 bg-amber-50/40'
              : 'bg-white border-slate-200/90 hover:border-slate-300'
          }`}
        >
          <div className="text-[12px] text-slate-500">Aguardando aprovação</div>
          <div className="text-[22px] font-bold text-amber-700 mt-1 tabular-nums">
            {metrics.aguardandoAprovacao}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Acima de R$ 20 mil</div>
        </button>

        <button
          type="button"
          onClick={() => setFilter((p) => (p === 'bloqueado' ? 'todos' : 'bloqueado'))}
          className={`text-left rounded-xl border p-4 transition-colors ${
            filter === 'bloqueado'
              ? 'border-red-500 bg-red-50/40'
              : 'bg-white border-slate-200/90 hover:border-slate-300'
          }`}
        >
          <div className="text-[12px] text-slate-500">Bloqueados conciliação</div>
          <div className="text-[22px] font-bold text-slate-900 mt-1 tabular-nums">
            {metrics.bloqueados}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Regra FIN-003</div>
        </button>

        <div className="rounded-xl border border-slate-200/90 bg-white p-4">
          <div className="text-[12px] text-slate-500">Total a repassar (14)</div>
          <div className="text-[19px] font-bold text-[#2563EB] mt-1 tabular-nums">
            {formatBRLCompact(metrics.totalRepassar)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Conta de Terceiros</div>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/35 p-4">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[12px] text-slate-600">Saldo terceiros</span>
            <SemaphoreBadge semaphore="verde" label="1,13x" />
          </div>
          <div className="text-[19px] font-bold text-slate-900 mt-1 tabular-nums">
            {formatBRLCompact(SEGREGATED_BALANCES.contaTerceiros.saldoEmConta)}
          </div>
          <div className="text-[11px] text-emerald-800 font-medium mt-0.5">
            Cobertura integral garantida
          </div>
        </div>
      </div>

      {/* 2. TABELA DOS 14 REPASSES */}
      <section className="bg-white rounded-xl border border-slate-200/90 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-semibold text-slate-900">
              Fila de repasses a proprietários ({filtered.length} de {repasses.length})
            </h2>
            <p className="text-[12px] text-slate-500 mt-0.5">
              Clique em qualquer repasse para abrir o Demonstrativo detalhado e solicitar execução ao agente.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {filter !== 'todos' && (
              <button
                type="button"
                onClick={() => setFilter('todos')}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-700 hover:bg-slate-50"
              >
                Ver todos (14)
              </button>
            )}
            <button
              type="button"
              onClick={() =>
                onAskAgent({
                  title: 'Executar lote autônomo de repasses',
                  prefillText:
                    'Executar os repasses conciliados de hoje que estão dentro da alçada autônoma (≤ R$ 20.000) pela regra FIN-003 e enviar demonstrativos aos proprietários.',
                  subtipo: 'Repasse',
                  actionType: 'repasse',
                  evalParams: { valor: 12100, conciliado: true },
                })
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#5B3FD0] hover:bg-[#4C32B8] text-white text-[12.5px] font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pedir ao agente: executar lote autônomo</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[12.5px]">
            <thead>
              <tr className="bg-[#F8F9FB] border-b border-slate-200 text-slate-600">
                <th className="py-3 px-4 font-semibold text-[11.5px]">Proprietário / Imóveis</th>
                <th className="py-3 px-4 font-semibold text-[11.5px]">Vencimento</th>
                <th className="py-3 px-4 font-semibold text-[11.5px]">Líquido a repassar</th>
                <th className="py-3 px-4 font-semibold text-[11.5px]">Conciliação</th>
                <th className="py-3 px-4 font-semibold text-[11.5px]">Status / Regra</th>
                <th className="py-3 px-4 font-semibold text-[11.5px] text-right">
                  Demonstrativo
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((rep) => {
                const sem =
                  rep.status === 'Pronto (autônomo)' || rep.status === 'Pago'
                    ? 'verde'
                    : rep.status === 'Bloqueado (conciliação)' || rep.status === 'Atrasado'
                    ? 'vermelho'
                    : 'ambar';

                return (
                  <tr
                    key={rep.id}
                    onClick={() => setSelectedRepasse(rep)}
                    className="hover:bg-slate-50/80 cursor-pointer"
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{rep.proprietario}</div>
                      <div className="text-[11.5px] text-slate-500">{rep.imoveisDesc}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap tabular-nums text-slate-700">
                      {rep.vencimento}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap tabular-nums">
                      <div className="font-bold text-slate-900">{formatBRL(rep.valorLiquido)}</div>
                      <div className="text-[11px] text-slate-500">
                        Bruto {formatBRL(rep.aluguelRecebido)} · Adm -{formatBRL(rep.taxaAdm)}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {rep.conciliado ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-medium text-[12px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Conciliado</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-700 font-medium text-[12px]">
                          <Ban className="w-3.5 h-3.5" />
                          <span>Não conciliado</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <SemaphoreBadge semaphore={sem} label={rep.status} />
                        <span onClick={(e) => e.stopPropagation()}>
                          <RuleAppliedChip
                            ruleId={rep.regraId}
                            versao={rep.regraVersao}
                            onOpenRule={onOpenRuleById}
                          />
                        </span>
                      </div>
                      {rep.orderProtocol && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (rep.orderId) onOpenOrderInCenter(rep.orderId);
                          }}
                          className="mt-1 font-mono text-[11px] font-bold text-[#2563EB] hover:underline"
                        >
                          {rep.orderProtocol}
                        </button>
                      )}
                    </td>
                    <td
                      className="py-3 px-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedRepasse(rep)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[12px] font-semibold text-slate-700"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#2563EB]" />
                        <span>Demonstrativo</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. PAINEL DE COBERTURA DE CAIXA (7 DIAS) */}
      <section className="bg-white rounded-xl border border-slate-200/90 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-[#EFF4FF] text-[#2563EB] flex items-center justify-center">
              <Landmark className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-[14.5px] font-semibold text-slate-900">
                Cobertura de caixa — Conta de Terceiros (próximos 7 dias)
              </h3>
              <p className="text-[12px] text-slate-500">
                Projeção diária de saldo em Conta de Terceiros frente aos repasses programados
              </p>
            </div>
          </div>
          <SemaphoreBadge semaphore="verde" label="Cobertura mínima 1,13x · Saudável" />
        </div>

        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={COBERTURA_CAIXA_7D} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis
                tickFormatter={(v) => `R$ ${Math.round(v / 1000)}k`}
                tick={{ fontSize: 11, fill: '#64748B' }}
              />
              <Tooltip
                formatter={(v, name) => [
                  formatBRL(Number(v ?? 0)),
                  name === 'saldoTerceiros' ? 'Saldo Conta Terceiros' : 'Repasses acumulados',
                ]}
                contentStyle={{ borderRadius: '10px', borderColor: '#E2E8F0', fontSize: '12px' }}
              />
              <Area
                type="monotone"
                dataKey="saldoTerceiros"
                stroke="#16A34A"
                fill="#DCFCE7"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="repassesAcumulados"
                stroke="#2563EB"
                fill="#DBEAFE"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* DRAWER DEMONSTRATIVO DO REPASSE */}
      {selectedRepasse && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-[1px]"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0"
            onClick={() => setSelectedRepasse(null)}
            aria-hidden="true"
          />

          <div className="relative z-10 w-full max-w-2xl bg-white h-full border-l border-slate-200 flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-4 shrink-0">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-[17px] font-bold text-slate-900">
                    Demonstrativo do repasse · {selectedRepasse.proprietario}
                  </h2>
                  <RuleAppliedChip
                    ruleId={selectedRepasse.regraId}
                    versao={selectedRepasse.regraVersao}
                    onOpenRule={onOpenRuleById}
                  />
                </div>
                <p className="text-[12.5px] text-slate-600 mt-1">
                  {selectedRepasse.imoveisDesc} · Vencimento {selectedRepasse.vencimento}
                </p>
                <div className="mt-1">
                  <AgentRegisteredTag label={selectedRepasse.registeredBy} />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRepasse(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                aria-label="Fechar demonstrativo"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {selectedRepasse.motivoBloqueio && (
                <div className="rounded-xl border border-red-200 bg-red-50/70 p-4 flex items-start gap-3 text-[12.5px] text-red-900">
                  <ShieldAlert className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Bloqueio preventivo pela regra FIN-003</div>
                    <p className="mt-0.5">{selectedRepasse.motivoBloqueio}</p>
                  </div>
                </div>
              )}

              {/* Cálculo itemizado */}
              <div className="rounded-xl border border-slate-200 p-4 space-y-2.5 text-[13px] tabular-nums">
                <h3 className="text-[13.5px] font-semibold text-slate-900 mb-2">
                  Memória de cálculo do repasse
                </h3>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-700">(+) Aluguel recebido do inquilino</span>
                  <span className="font-semibold text-slate-900">
                    {formatBRL(selectedRepasse.aluguelRecebido)}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">(-) Taxa de administração Farina</span>
                  <span className="text-red-700">-{formatBRL(selectedRepasse.taxaAdm)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">(-) IPTU / Condomínio repassado</span>
                  <span className="text-slate-700">
                    -{formatBRL(selectedRepasse.iptuCondominio)}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">(-) Manutenção autorizada</span>
                  <span className="text-slate-700">-{formatBRL(selectedRepasse.manutencao)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">(-) Comissão / intermediação</span>
                  <span className="text-slate-700">-{formatBRL(selectedRepasse.comissao)}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="font-bold text-slate-900">(=) Valor líquido ao proprietário</span>
                  <span className="text-[18px] font-bold text-[#2563EB]">
                    {formatBRL(selectedRepasse.valorLiquido)}
                  </span>
                </div>
                <div className="text-[11.5px] text-slate-500 pt-1">
                  Destino: {selectedRepasse.chavePixOuBanco}
                </div>
              </div>

              {/* Pré-requisitos da FIN-003 */}
              <div className="rounded-xl border border-slate-200 bg-[#F8F9FB] p-4 space-y-2 text-[12.5px]">
                <div className="font-semibold text-slate-900">
                  Conferência de pré-requisitos (FIN-003 v1)
                </div>
                <div className="flex items-center gap-2">
                  {selectedRepasse.conciliado ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  ) : (
                    <Ban className="w-4 h-4 text-red-600" />
                  )}
                  <span className={selectedRepasse.conciliado ? 'text-emerald-800' : 'text-red-700 font-medium'}>
                    {selectedRepasse.conciliado
                      ? 'Recebimento do inquilino conciliado no extrato bancário OFX'
                      : 'Recebimento ainda não conciliado — repasse bloqueado até conciliação'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {selectedRepasse.valorLiquido <= 20000 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-700" />
                  )}
                  <span className="text-slate-700">
                    {selectedRepasse.valorLiquido <= 20000
                      ? 'Valor líquido ≤ R$ 20.000,00 (execução autônoma permitida)'
                      : 'Valor líquido > R$ 20.000,00 (exige aprovação do Gestor em até 2h)'}
                  </span>
                </div>
              </div>

              {/* Prévia da mensagem formatada por canal */}
              <div className="rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-slate-900">
                    Prévia da mensagem ao proprietário
                  </span>
                  <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-[#F8F9FB]">
                    {(['WhatsApp', 'E-mail'] as const).map((ch) => (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => setPreviewChannel(ch)}
                        className={`px-2.5 py-1 rounded-md text-[11.5px] font-semibold ${
                          previewChannel === ch
                            ? 'bg-white text-[#2563EB] border border-slate-200'
                            : 'text-slate-600'
                        }`}
                      >
                        {ch}
                      </button>
                    ))}
                  </div>
                </div>

                {(() => {
                  const preview = buildOwnerPreviewText(selectedRepasse, previewChannel);
                  return (
                    <div className="rounded-lg border border-slate-200 bg-[#F8F9FB] p-3.5 text-[12px] space-y-1.5">
                      {preview.subject && (
                        <div className="font-semibold text-slate-900">
                          Assunto ({preview.subject.length}/70): {preview.subject}
                        </div>
                      )}
                      <pre className="whitespace-pre-wrap font-sans text-slate-700 leading-relaxed">
                        {preview.body}
                      </pre>
                      <div className="text-[10.5px] text-slate-400 text-right tabular-nums">
                        {preview.body.length}/{previewChannel === 'WhatsApp' ? 300 : 600} caracteres
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-white flex flex-wrap items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedRepasse(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-700"
              >
                Fechar
              </button>

              {!selectedRepasse.conciliado ? (
                <button
                  type="button"
                  onClick={() => {
                    const target = selectedRepasse;
                    setSelectedRepasse(null);
                    onAskAgent({
                      title: `Resolver bloqueio · ${target.proprietario}`,
                      prefillText: `Investigar e conciliar recebimento pendente do imóvel ${target.imoveisDesc} para liberar o repasse líquido de ${formatBRL(
                        target.valorLiquido
                      )} ao proprietário ${target.proprietario}.`,
                      subtipo: 'Repasse',
                      actionType: 'repasse',
                      evalParams: { valor: target.valorLiquido, conciliado: false },
                    });
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[13px] font-semibold"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Pedir ao agente: resolver bloqueio</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const target = selectedRepasse;
                    setSelectedRepasse(null);
                    onAskAgent({
                      title: `Executar repasse · ${target.proprietario}`,
                      prefillText: `Executar repasse líquido de ${formatBRL(
                        target.valorLiquido
                      )} para ${target.proprietario} (${target.imoveisDesc}) via ${target.chavePixOuBanco} e enviar demonstrativo por ${previewChannel}.`,
                      subtipo: 'Repasse',
                      actionType: 'repasse',
                      evalParams: { valor: target.valorLiquido, conciliado: true },
                      requiresExtraConfirmation: target.valorLiquido > 20000,
                      extraConfirmationText: `Confirmo que revisei o demonstrativo de ${formatBRL(
                        target.valorLiquido
                      )} (> R$ 20.000,00) para ${target.proprietario} e autorizo o encaminhamento pela Conta de Terceiros.`,
                    });
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#5B3FD0] hover:bg-[#4C32B8] text-white text-[13px] font-semibold"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Pedir ao agente: executar repasse</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
