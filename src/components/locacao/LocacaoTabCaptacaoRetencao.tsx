import {
  UserPlus,
  AlertTriangle,
  Sparkles,
  ArrowUpRight,
  Clock,
  FileWarning,
  ShieldAlert,
} from 'lucide-react';
import { formatBRL } from '../../data/financeiroData';
import type { Regra } from '../../data/rulesData';
import {
  AT_RISK_OWNERS_4,
  CAPTACAO_ORIGEM,
  CAPTACAO_PIPELINE,
  EXPIRING_EXCLUSIVITIES_4,
  INITIAL_ACQUISITIONS_6,
  RETENCAO_MES,
} from '../../data/locacaoData';
import type { AskAgentRequestPayload } from '../financeiro/AskAgentOrderDrawer';
import { RuleAppliedChip } from '../financeiro/FinanceiroShared';

interface LocacaoTabCaptacaoRetencaoProps {
  rules: Regra[];
  readOnly: boolean;
  onAskAgent: (req: AskAgentRequestPayload) => void;
  onOpenRuleById: (ruleId: string) => void;
  onOpenOrderInCenter: (orderId: string) => void;
  onNavigateModule: (navId: 'financeiro' | 'vendas' | 'captacao-marketing') => void;
}

export function LocacaoTabCaptacaoRetencao({
  rules,
  readOnly,
  onAskAgent,
  onOpenRuleById,
  onOpenOrderInCenter,
  onNavigateModule,
}: LocacaoTabCaptacaoRetencaoProps) {
  const loc007 = rules.find((r) => r.id === 'LOC-007');
  const loc007IsDraft = !loc007 || loc007.status !== 'ativa';

  return (
    <div className="space-y-6">
      {/* 1. PIPELINE DE CAPTAÇÃO & ORIGEM */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-8 rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-[14.5px] font-bold text-slate-900">
                Pipeline de captação de novos imóveis (mês)
              </h3>
              <p className="text-[12px] text-slate-500">
                11 novos imóveis captados no mês · regras LOC-005 (taxa adm), JUR-005 (minuta v5) e JUR-013 (extração &lt; 85%)
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <RuleAppliedChip ruleId="LOC-005" versao={2} onOpenRule={onOpenRuleById} />
              <RuleAppliedChip ruleId="JUR-005" versao={2} onOpenRule={onOpenRuleById} />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {CAPTACAO_PIPELINE.map((st, idx) => (
              <div
                key={st.etapa}
                className={`rounded-xl border p-3 ${
                  idx === CAPTACAO_PIPELINE.length - 1
                    ? 'border-emerald-200 bg-emerald-50/50'
                    : 'border-slate-200 bg-[#F8F9FB]'
                }`}
              >
                <div className="text-[11.5px] font-medium text-slate-600 leading-snug">
                  {st.etapa}
                </div>
                <div className="text-[20px] font-bold text-slate-900 tabular-nums mt-1">
                  {st.qtd}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[14px] font-bold text-slate-900">
              Origem dos 11 captados
            </h3>
            <button
              type="button"
              onClick={() => onNavigateModule('vendas')}
              className="text-[11.5px] font-semibold text-[#2563EB] hover:underline inline-flex items-center gap-0.5"
            >
              Vendas <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {CAPTACAO_ORIGEM.map((o) => (
              <div
                key={o.origem}
                className="flex items-center justify-between text-[12px] py-1 border-b border-slate-100 last:border-0"
              >
                <span className="text-slate-700">{o.origem}</span>
                <strong className="text-slate-900 tabular-nums">{o.qtd}</strong>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onNavigateModule('captacao-marketing')}
            className="text-[11.5px] font-semibold text-[#2563EB] hover:underline inline-flex items-center gap-1"
          >
            <span>Custo por lead e portais em Captação e Marketing</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </section>

      {/* 2. CAPTAÇÕES EM ANDAMENTO (6) */}
      <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-[#2563EB]" />
            <h3 className="text-[14.5px] font-bold text-slate-900">
              Captações em andamento e conferência de regras (6)
            </h3>
          </div>
          <span className="text-[12px] text-slate-500">
            Taxa padrão ≥ 9% (autônomo) · 7%–8,9% (Gestor 8h) · &lt; 7% (Bloqueado)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[12.5px]">
            <thead className="bg-[#F8F9FB] border-b border-slate-200 text-slate-500 font-semibold">
              <tr>
                <th className="px-4 py-2.5">Imóvel / Proprietário</th>
                <th className="px-3 py-2.5">Origem</th>
                <th className="px-3 py-2.5">Aluguel est.</th>
                <th className="px-3 py-2.5">Taxa adm</th>
                <th className="px-3 py-2.5">Minuta / Extração</th>
                <th className="px-3 py-2.5">Etapa / Regra</th>
                <th className="px-4 py-2.5 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {INITIAL_ACQUISITIONS_6.map((cap) => (
                <tr key={cap.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{cap.imovel}</div>
                    <div className="text-[11px] text-slate-500">Dono: {cap.proprietario}</div>
                  </td>
                  <td className="px-3 py-3 text-slate-700">{cap.origem}</td>
                  <td className="px-3 py-3 whitespace-nowrap font-bold text-slate-900 tabular-nums">
                    {formatBRL(cap.aluguelEstimado)}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap tabular-nums">
                    <span
                      className={`font-bold ${
                        cap.taxaAdmPct < 7
                          ? 'text-red-700'
                          : cap.taxaAdmPct < 9
                          ? 'text-amber-700'
                          : 'text-emerald-700'
                      }`}
                    >
                      {cap.taxaAdmPct.toString().replace('.', ',')}%
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-slate-800">{cap.minuta}</div>
                    <div
                      className={`text-[11px] tabular-nums ${
                        cap.confiancaExtracao < 85 ? 'text-red-700 font-semibold' : 'text-slate-500'
                      }`}
                    >
                      Extração: {cap.confiancaExtracao}%{' '}
                      {cap.clausulaAlterada && '· Cláusula alterada'}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="font-semibold text-slate-800">{cap.etapa}</div>
                    <div className="text-[11px] text-[#5B3FD0] font-medium">{cap.statusRegra}</div>
                    {cap.orderId && cap.protocolo && (
                      <button
                        type="button"
                        onClick={() => onOpenOrderInCenter(cap.orderId!)}
                        className="font-mono text-[11px] text-[#2563EB] hover:underline"
                      >
                        {cap.protocolo}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() =>
                          onAskAgent({
                            title: `Processar captação · ${cap.imovel}`,
                            prefillText: `Avaliar minuta ${cap.minuta} para ${cap.imovel} (${cap.proprietario}) com taxa de administração de ${cap.taxaAdmPct}% e extração de ${cap.confiancaExtracao}%.`,
                            categoria: 'Cadastro e atualização',
                            subtipo: 'Captação de imóvel',
                            actionType: 'captar_imovel',
                            evalParams: {
                              taxaAdmPct: cap.taxaAdmPct,
                              confiancaExtracao: cap.confiancaExtracao,
                              clausulaAlterada: cap.clausulaAlterada,
                            },
                          })
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#5B3FD0] hover:bg-[#4C32B8] text-white text-[11.5px] font-semibold"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Pedir ao agente</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. EXCLUSIVIDADES VENCENDO (4) & RETENÇÃO DE PROPRIETÁRIOS (4) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Exclusividades */}
        <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <h3 className="text-[14px] font-bold text-slate-900">
                Exclusividades vencendo em 30 dias (4)
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-amber-800">Renovação preventiva</span>
          </div>
          <div className="divide-y divide-slate-100">
            {EXPIRING_EXCLUSIVITIES_4.map((ex) => (
              <div key={ex.id} className="px-5 py-3.5 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="font-semibold text-[13px] text-slate-900">{ex.imovel}</div>
                  <div className="text-[11.5px] text-slate-600">
                    {ex.proprietario} · Vence em <strong className="text-red-700">{ex.venceEm}</strong> ({ex.diasRestantes}d) · {ex.diasVago}d vago
                  </div>
                  <div className="text-[11.5px] text-slate-500">{ex.motivo}</div>
                </div>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() =>
                      onAskAgent({
                        title: `Renovar exclusividade · ${ex.imovel}`,
                        prefillText: `Preparar relatório de divulgação/visitas e enviar termo de renovação de exclusividade para ${ex.proprietario} (${ex.imovel}, vence em ${ex.venceEm}).`,
                        categoria: 'Cadastro e atualização',
                        subtipo: 'Captação de imóvel',
                        actionType: 'captar_imovel',
                        evalParams: { taxaAdmPct: 9, confiancaExtracao: 95 },
                      })
                    }
                    className="shrink-0 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11.5px] font-semibold text-[#2563EB]"
                  >
                    Pedir renovação
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Retenção de proprietários */}
        <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <h3 className="text-[14px] font-bold text-slate-900">
                Retenção de proprietários · 4 em atenção
              </h3>
            </div>
            <span className="text-[12px] font-bold text-slate-700 tabular-nums">
              {RETENCAO_MES.saidasMes} saídas/mês · {RETENCAO_MES.taxa12mPct.toString().replace('.', ',')}% em 12m
            </span>
          </div>

          <div className="p-4 border-b border-slate-100 bg-[#F8F9FB] space-y-2">
            {loc007IsDraft && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 flex items-start justify-between gap-2 text-[12px] text-amber-950">
                <div className="flex items-start gap-2">
                  <FileWarning className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    <strong>Regra LOC-007 em rascunho:</strong> o agente ainda não envia o relatório mensal automático ao proprietário.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenRuleById('LOC-007')}
                  className="font-semibold text-[#2563EB] hover:underline shrink-0"
                >
                  Revisar LOC-007
                </button>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 text-[11.5px] text-slate-600">
              <span className="font-semibold text-slate-700">Saídas do mês:</span>
              {RETENCAO_MES.motivosSaida.map((m) => (
                <span key={m.motivo}>
                  {m.motivo}: <strong>{m.qtd}</strong>
                </span>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {AT_RISK_OWNERS_4.map((owner) => (
              <div key={owner.id} className="px-5 py-3.5 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[13px] text-slate-900">
                      {owner.proprietario}
                    </span>
                    <span className="text-[11px] text-slate-500">({owner.imoveis} imóveis)</span>
                    {owner.urgencia === 'critico' && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-red-50 border border-red-200 text-red-700 text-[10px] font-semibold">
                        <AlertTriangle className="w-2.5 h-2.5" /> Crítico
                      </span>
                    )}
                  </div>
                  <div className="text-[11.5px] text-slate-600">{owner.motivo}</div>
                  <div className="text-[11px] text-slate-500">Último contato: {owner.ultimaContato}</div>
                </div>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() =>
                      onAskAgent({
                        title: `Contato preventivo · ${owner.proprietario}`,
                        prefillText: `Preparar dossiê de performance, comparáveis e histórico de visitas para ligação/mensagem preventiva ao proprietário ${owner.proprietario} (${owner.motivo}).`,
                        categoria: 'Cadastro e atualização',
                        subtipo: 'Captação de imóvel',
                        actionType: 'relatorio_proprietario',
                        evalParams: {},
                      })
                    }
                    className="shrink-0 px-2.5 py-1.5 rounded-lg bg-[#F3F0FF] hover:bg-[#EDE9FE] text-[#5B3FD0] text-[11.5px] font-semibold"
                  >
                    Contato preventivo
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="px-5 py-3 border-t border-slate-100 bg-[#F8F9FB] flex flex-wrap items-center justify-between gap-2 text-[11.5px]">
            <span className="text-slate-500">Repasses e extratos mensais dos proprietários:</span>
            <button
              type="button"
              onClick={() => onNavigateModule('financeiro')}
              className="font-semibold text-[#2563EB] hover:underline inline-flex items-center gap-1"
            >
              <span>Ver Financeiro &gt; Repasses</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
