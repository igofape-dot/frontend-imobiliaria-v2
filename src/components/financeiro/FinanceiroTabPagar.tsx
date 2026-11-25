import { useMemo, useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Users,
  Wrench,
  ShieldCheck,
} from 'lucide-react';
import {
  formatBRL,
  formatBRLCompact,
  type BrokerCommissionItem,
  type PayableSupplierItem,
} from '../../data/financeiroData';
import type { AskAgentRequestPayload } from './AskAgentOrderDrawer';
import {
  AgentRegisteredTag,
  InlineOneClickCorrector,
  PolicyModeBadge,
  RuleAppliedChip,
  SemaphoreBadge,
} from './FinanceiroShared';

interface FinanceiroTabPagarProps {
  payables: PayableSupplierItem[];
  commissions: BrokerCommissionItem[];
  isCorretorOnly: boolean;
  onCorrectPayableValue: (id: string, newVal: number) => void;
  onAskAgent: (payload: AskAgentRequestPayload) => void;
  onOpenRuleById: (ruleId: string) => void;
  onOpenOrderInCenter: (orderId: string) => void;
  onApproveOrder: (orderId: string) => void;
}

export function FinanceiroTabPagar({
  payables,
  commissions,
  isCorretorOnly,
  onCorrectPayableValue,
  onAskAgent,
  onOpenRuleById,
  onOpenOrderInCenter,
  onApproveOrder,
}: FinanceiroTabPagarProps) {
  const [corretorLogado, setCorretorLogado] = useState('Lucas Andrade');

  const summary = useMemo(() => {
    const totalFornecedores = payables.reduce((acc, p) => acc + p.valor, 0);
    const aguardandoAprovacao = payables.filter(
      (p) => p.status === 'Aguardando aprovação'
    ).length;
    const totalComissoes = commissions.reduce((acc, c) => acc + c.valorComissao, 0);
    return { totalFornecedores, aguardandoAprovacao, totalComissoes };
  }, [payables, commissions]);

  const visibleCommissions = useMemo(() => {
    if (!isCorretorOnly) return commissions;
    return commissions.filter((c) => c.corretor === corretorLogado);
  }, [commissions, isCorretorOnly, corretorLogado]);

  if (isCorretorOnly) {
    const myTotal = visibleCommissions.reduce((acc, c) => acc + c.valorComissao, 0);
    return (
      <div className="space-y-5">
        <div className="rounded-xl border border-blue-200 bg-[#EFF4FF]/60 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5 text-[12.5px] text-slate-800">
            <ShieldCheck className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
            <div>
              <strong>Acesso restrito ao perfil Corretor:</strong> você não acessa contas da
              imobiliária, repasses ou inadimplência; visualiza apenas suas próprias comissões.
            </div>
          </div>
          <select
            value={corretorLogado}
            onChange={(e) => setCorretorLogado(e.target.value)}
            aria-label="Selecionar corretor demonstrado"
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-[12px] font-medium text-slate-700 shrink-0"
          >
            {commissions.map((c) => (
              <option key={c.id} value={c.corretor}>
                Corretor: {c.corretor}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-[12px] text-slate-500">Suas comissões previstas ({corretorLogado})</div>
            <div className="text-[24px] font-bold text-slate-900 mt-1 tabular-nums">
              {formatBRL(myTotal)}
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              onAskAgent({
                title: `Consultar comissão · ${corretorLogado}`,
                prefillText: `Enviar demonstrativo detalhado das minhas comissões previstas para pagamento (${corretorLogado}, total ${formatBRL(myTotal)}).`,
                subtipo: 'Comissão',
                actionType: 'pagamento_fornecedor',
                evalParams: { valor: myTotal },
              })
            }
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#5B3FD0] hover:bg-[#4C32B8] text-white text-[12.5px] font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pedir demonstrativo ao agente</span>
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 overflow-x-auto">
          <table className="w-full text-left border-collapse text-[12.5px]">
            <thead>
              <tr className="bg-[#F8F9FB] border-b border-slate-200 text-slate-600">
                <th className="py-3 px-4 font-semibold text-[11.5px]">Tipo</th>
                <th className="py-3 px-4 font-semibold text-[11.5px]">Referência</th>
                <th className="py-3 px-4 font-semibold text-[11.5px]">Base / Regra</th>
                <th className="py-3 px-4 font-semibold text-[11.5px]">Comissão</th>
                <th className="py-3 px-4 font-semibold text-[11.5px]">Previsão</th>
                <th className="py-3 px-4 font-semibold text-[11.5px]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 tabular-nums">
              {visibleCommissions.map((c) => (
                <tr key={c.id}>
                  <td className="py-3 px-4 font-semibold text-slate-800">{c.tipo}</td>
                  <td className="py-3 px-4 text-slate-700">{c.referencia}</td>
                  <td className="py-3 px-4 text-slate-600">
                    {formatBRL(c.valorBase)} · {c.percentual}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {formatBRL(c.valorComissao)}
                  </td>
                  <td className="py-3 px-4 text-slate-700">{c.previsaoPagamento}</td>
                  <td className="py-3 px-4">
                    <SemaphoreBadge
                      semaphore={c.status.includes('Aprovada') ? 'verde' : 'ambar'}
                      label={c.status}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/90 p-4">
          <div className="text-[12px] text-slate-500">A pagar na semana (fornecedores)</div>
          <div className="text-[22px] font-bold text-slate-900 mt-1 tabular-nums">
            {formatBRL(summary.totalFornecedores)}
          </div>
          <div className="text-[11.5px] text-slate-500 mt-1">
            Caixa próprio / reembolsável conforme contrato
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-slate-500">Aguardando aprovação</span>
            <SemaphoreBadge semaphore="ambar" label="Alçada FIN-011" />
          </div>
          <div className="text-[22px] font-bold text-amber-700 mt-1 tabular-nums">
            {summary.aguardandoAprovacao}
          </div>
          <div className="text-[11.5px] text-slate-500 mt-1">
            Pagamentos acima de R$ 1.500 exigem Gestor (4h)
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-4">
          <div className="text-[12px] text-slate-500">Comissões a pagar</div>
          <div className="text-[22px] font-bold text-[#2563EB] mt-1 tabular-nums">
            {formatBRLCompact(summary.totalComissoes)} · {commissions.length} corretores
          </div>
          <div className="text-[11.5px] text-slate-500 mt-1">
            Calculadas automaticamente sobre vendas e locações
          </div>
        </div>
      </div>

      {/* Fornecedores & Manutenção */}
      <section className="bg-white rounded-xl border border-slate-200/90 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-slate-600" />
            <div>
              <h2 className="text-[15px] font-semibold text-slate-900">
                Fornecedores e despesas operacionais
              </h2>
              <p className="text-[12px] text-slate-500">
                Orçamentos e boletos interpretados pelo agente sob a alçada da regra FIN-011
              </p>
            </div>
          </div>
          <RuleAppliedChip ruleId="FIN-011" versao={2} onOpenRule={onOpenRuleById} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[12.5px]">
            <thead>
              <tr className="bg-[#F8F9FB] border-b border-slate-200 text-slate-600">
                <th className="py-3 px-4 font-semibold text-[11.5px]">Favorecido / Serviço</th>
                <th className="py-3 px-4 font-semibold text-[11.5px]">Vencimento</th>
                <th className="py-3 px-4 font-semibold text-[11.5px]">Valor</th>
                <th className="py-3 px-4 font-semibold text-[11.5px]">Regra</th>
                <th className="py-3 px-4 font-semibold text-[11.5px]">Status</th>
                <th className="py-3 px-4 font-semibold text-[11.5px] text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payables.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{p.favorecido}</div>
                    <div className="text-[11.5px] text-slate-500">
                      {p.descricao} · {p.imovelOuCentro}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <AgentRegisteredTag label={p.registeredBy} />
                      {p.protocolo && (
                        <button
                          type="button"
                          onClick={() => p.orderId && onOpenOrderInCenter(p.orderId)}
                          className="font-mono text-[11px] font-bold text-[#2563EB] hover:underline"
                        >
                          {p.protocolo}
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-700 tabular-nums whitespace-nowrap">
                    {p.vencimento}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900 tabular-nums whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <span>{formatBRL(p.valor)}</span>
                      <InlineOneClickCorrector
                        value={String(p.valor)}
                        ariaLabel={`Corrigir valor de ${p.favorecido}`}
                        onSave={(raw) => {
                          const parsed = parseFloat(raw.replace(',', '.').replace(/[^0-9.]/g, ''));
                          if (!Number.isNaN(parsed) && parsed > 0) {
                            onCorrectPayableValue(p.id, parsed);
                          }
                        }}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex flex-col items-start gap-1">
                      <PolicyModeBadge modo={p.modoRegra} />
                      <RuleAppliedChip
                        ruleId={p.regraId}
                        versao={p.regraVersao}
                        onOpenRule={onOpenRuleById}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <SemaphoreBadge
                      semaphore={p.status === 'Aguardando aprovação' ? 'ambar' : 'verde'}
                      label={p.status}
                    />
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      {p.status === 'Aguardando aprovação' && p.orderId ? (
                        <button
                          type="button"
                          onClick={() => onApproveOrder(p.orderId!)}
                          className="px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-[12px] font-semibold"
                        >
                          Aprovar
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() =>
                          onAskAgent({
                            title: `Pagar fornecedor · ${p.favorecido}`,
                            prefillText: `Processar pagamento de ${formatBRL(p.valor)} para ${p.favorecido} referente a ${p.descricao} (${p.imovelOuCentro}).`,
                            subtipo: 'Baixa de pagamento',
                            actionType: 'pagamento_fornecedor',
                            evalParams: { valor: p.valor },
                          })
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#F3F0FF] hover:bg-[#EAE4FF] text-[#5B3FD0] text-[12px] font-semibold"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Pedir ao agente</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Comissões de 7 corretores */}
      <section className="bg-white rounded-xl border border-slate-200/90 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-600" />
            <div>
              <h2 className="text-[15px] font-semibold text-slate-900">
                Comissões de corretores ({commissions.length} corretores ·{' '}
                <span className="tabular-nums">{formatBRL(summary.totalComissoes)}</span>)
              </h2>
              <p className="text-[12px] text-slate-500">
                Apuração automática sobre contratos fechados e vendas escrituradas
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              onAskAgent({
                title: 'Liberar lote de comissões',
                prefillText: `Gerar comprovantes individuais e agendar pagamento das comissões aprovadas dos ${commissions.length} corretores totalizando ${formatBRL(
                  summary.totalComissoes
                )}.`,
                subtipo: 'Comissão',
                actionType: 'pagamento_fornecedor',
                evalParams: { valor: summary.totalComissoes },
              })
            }
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#5B3FD0] hover:bg-[#4C32B8] text-white text-[12.5px] font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pedir ao agente: agendar comissões</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[12.5px]">
            <thead>
              <tr className="bg-[#F8F9FB] border-b border-slate-200 text-slate-600">
                <th className="py-3 px-4 font-semibold text-[11.5px]">Corretor</th>
                <th className="py-3 px-4 font-semibold text-[11.5px]">Tipo / Referência</th>
                <th className="py-3 px-4 font-semibold text-[11.5px]">Base / Alíquota</th>
                <th className="py-3 px-4 font-semibold text-[11.5px]">Comissão</th>
                <th className="py-3 px-4 font-semibold text-[11.5px]">Previsão</th>
                <th className="py-3 px-4 font-semibold text-[11.5px]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 tabular-nums">
              {commissions.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{c.corretor}</div>
                    <AgentRegisteredTag label={c.registeredBy} />
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-800">{c.tipo}</span> ·{' '}
                    <span className="text-slate-600">{c.referencia}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {formatBRL(c.valorBase)} · {c.percentual}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {formatBRL(c.valorComissao)}
                  </td>
                  <td className="py-3 px-4 text-slate-700">{c.previsaoPagamento}</td>
                  <td className="py-3 px-4">
                    {c.status.includes('Aprovada') ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[12px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{c.status}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-700 font-semibold text-[12px]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{c.status}</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
