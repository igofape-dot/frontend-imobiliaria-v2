import { useEffect, useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  Sparkles,
  Scale,
  Clock,
  AlertTriangle,
  CheckCircle2,
  X,
  ArrowUpRight,
  Calculator,
  Gavel,
  Send,
  ShieldAlert,
} from 'lucide-react';
import {
  INADIMPLENCIA_POR_GARANTIA,
  avaliarRegra,
  formatBRL,
  formatBRLCompact,
  type DelinquentTenant,
} from '../../data/financeiroData';
import type { Modo, Regra } from '../../data/rulesData';
import type { AskAgentRequestPayload } from './AskAgentOrderDrawer';
import {
  AgentRegisteredTag,
  PolicyModeBadge,
  RuleAppliedChip,
  SemaphoreBadge,
} from './FinanceiroShared';

interface FinanceiroTabInadimplenciaProps {
  tenants: DelinquentTenant[];
  rules: Regra[];
  onAskAgent: (payload: AskAgentRequestPayload) => void;
  onOpenRuleById: (ruleId: string) => void;
  onOpenOrderInCenter: (orderId: string) => void;
}

type BucketFilter = 'todos' | '6-15' | '16-30' | '>30';

export function FinanceiroTabInadimplencia({
  tenants,
  rules,
  onAskAgent,
  onOpenRuleById,
  onOpenOrderInCenter,
}: FinanceiroTabInadimplenciaProps) {
  const [bucketFilter, setBucketFilter] = useState<BucketFilter>('todos');
  const [garantiaFilter, setGarantiaFilter] = useState<string>('todas');
  const [foraJanelaDemo, setForaJanelaDemo] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<DelinquentTenant | null>(null);

  // Simulator state inside drawer
  const [simParcelas, setSimParcelas] = useState(3);
  const [simDescontoPct, setSimDescontoPct] = useState(10);

  useEffect(() => {
    if (!selectedTenant) return;
    setSimParcelas(selectedTenant.acaoJudicial ? 2 : 3);
    setSimDescontoPct(selectedTenant.id === 'inad-4' ? 15 : 10);
  }, [selectedTenant]);

  useEffect(() => {
    if (!selectedTenant) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setSelectedTenant(null);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [selectedTenant]);

  const counts = useMemo(() => {
    const b615 = tenants.filter((t) => t.faixa === '6-15').length;
    const b1630 = tenants.filter((t) => t.faixa === '16-30').length;
    const b30 = tenants.filter((t) => t.faixa === '>30').length;
    const total = tenants.reduce((acc, t) => acc + t.valorTotal, 0);
    return { b615, b1630, b30, total };
  }, [tenants]);

  const filteredTenants = useMemo(() => {
    return tenants.filter((t) => {
      if (bucketFilter !== 'todos' && t.faixa !== bucketFilter) return false;
      if (garantiaFilter !== 'todas' && t.garantia !== garantiaFilter) return false;
      return true;
    });
  }, [tenants, bucketFilter, garantiaFilter]);

  const rulerCounts = useMemo(
    () => ({
      d1: 4, // tolerância
      d5: tenants.filter((t) => t.etapaRegua === 'D+5').length,
      d15: tenants.filter((t) => t.etapaRegua === 'D+15').length,
      d30: tenants.filter((t) => t.etapaRegua === 'D+30').length,
    }),
    [tenants]
  );

  // Live simulator calculations
  const simulatorCalc = useMemo(() => {
    if (!selectedTenant) return null;
    const encargos = selectedTenant.multa + selectedTenant.juros;
    const descontoReais = (encargos * simDescontoPct) / 100;
    const totalComDesconto = Math.max(selectedTenant.principal, selectedTenant.valorTotal - descontoReais);
    const valorParcela = totalComDesconto / Math.max(1, simParcelas);

    const evalDesconto = avaliarRegra(
      'desconto_multa_juros',
      {
        percentualDesconto: simDescontoPct,
        acaoJudicial: selectedTenant.acaoJudicial,
      },
      rules
    );
    const evalParcelas = avaliarRegra(
      'parcelamento',
      {
        parcelas: simParcelas,
        acaoJudicial: selectedTenant.acaoJudicial,
      },
      rules
    );

    const hasBlocked = evalDesconto.modo === 'bloqueado' || evalParcelas.modo === 'bloqueado';
    const needsApproval =
      !hasBlocked &&
      (evalDesconto.modo === 'aprovacao' || evalParcelas.modo === 'aprovacao');

    const combinedModo: Modo = hasBlocked
      ? 'bloqueado'
      : needsApproval
      ? 'aprovacao'
      : 'autonomo';

    return {
      encargos,
      descontoReais,
      totalComDesconto,
      valorParcela,
      evalDesconto,
      evalParcelas,
      combinedModo,
    };
  }, [selectedTenant, simParcelas, simDescontoPct, rules]);

  return (
    <div className="space-y-6">
      {/* 1. FAIXAS DE ATRASO (TOLERÂNCIA + 9 / 4 / 3) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-slate-200/90 bg-white p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[12px] font-medium text-slate-500">Tolerância (até 5 dias)</span>
            <SemaphoreBadge semaphore="verde" label="Não conta" />
          </div>
          <div className="text-[20px] font-bold text-slate-900 mt-1 tabular-nums">4 títulos</div>
          <div className="text-[11.5px] text-slate-500 mt-1">
            Lembrete D+1 automático · sem impacto na meta de inadimplência
          </div>
        </div>

        <button
          type="button"
          onClick={() => setBucketFilter((prev) => (prev === '6-15' ? 'todos' : '6-15'))}
          className={`text-left rounded-xl border p-4 transition-colors ${
            bucketFilter === '6-15'
              ? 'border-amber-500 bg-amber-50/40'
              : 'bg-white border-slate-200/90 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[12px] font-medium text-slate-500">6 a 15 dias</span>
            <SemaphoreBadge semaphore="ambar" label="D+5" />
          </div>
          <div className="text-[20px] font-bold text-slate-900 mt-1 tabular-nums">
            {counts.b615} inquilinos
          </div>
          <div className="text-[11.5px] text-slate-600 mt-1">
            E-mail formal enviado · clicar para filtrar
          </div>
        </button>

        <button
          type="button"
          onClick={() => setBucketFilter((prev) => (prev === '16-30' ? 'todos' : '16-30'))}
          className={`text-left rounded-xl border p-4 transition-colors ${
            bucketFilter === '16-30'
              ? 'border-amber-500 bg-amber-50/40'
              : 'bg-white border-slate-200/90 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[12px] font-medium text-slate-500">16 a 30 dias</span>
            <SemaphoreBadge semaphore="ambar" label="D+15" />
          </div>
          <div className="text-[20px] font-bold text-slate-900 mt-1 tabular-nums">
            {counts.b1630} inquilinos
          </div>
          <div className="text-[11.5px] text-slate-600 mt-1">
            Notificação formal / aprovação pendente
          </div>
        </button>

        <button
          type="button"
          onClick={() => setBucketFilter((prev) => (prev === '>30' ? 'todos' : '>30'))}
          className={`text-left rounded-xl border p-4 transition-colors ${
            bucketFilter === '>30'
              ? 'border-red-500 bg-red-50/40'
              : 'bg-white border-slate-200/90 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[12px] font-medium text-slate-500">Acima de 30 dias</span>
            <SemaphoreBadge semaphore="vermelho" label="Crítico" />
          </div>
          <div className="text-[20px] font-bold text-red-700 mt-1 tabular-nums">
            {counts.b30} inquilinos
          </div>
          <div className="text-[11.5px] text-slate-600 mt-1">
            Escalados ao Jurídico / 1 ação judicial
          </div>
        </button>
      </div>

      {/* 2. RÉGUA VISUAL HORIZONTAL (FIN-020 + JANELA 8H-19H) */}
      <section className="bg-white rounded-xl border border-slate-200/90 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[15px] font-semibold text-slate-900">
                Régua automática de cobrança
              </h2>
              <RuleAppliedChip ruleId="FIN-020" versao={2} onOpenRule={onOpenRuleById} />
            </div>
            <p className="text-[12px] text-slate-500 mt-0.5">
              Disparos permitidos apenas na janela comercial de <strong>08h às 19h</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setForaJanelaDemo((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-medium transition-colors ${
                foraJanelaDemo
                  ? 'border-amber-300 bg-amber-50 text-amber-900'
                  : 'border-slate-200 bg-[#F8F9FB] text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>
                {foraJanelaDemo ? 'Simulando 21:15 (fora da janela)' : 'Dentro da janela (14:15)'}
              </span>
            </button>
          </div>
        </div>

        {foraJanelaDemo && (
          <div className="rounded-lg border border-amber-200 bg-amber-50/70 px-3.5 py-2.5 flex items-center gap-2 text-[12.5px] text-amber-900 font-medium">
            <Clock className="w-4 h-4 shrink-0 text-amber-700" />
            <span>
              Fora do horário permitido pela regra FIN-020 (08h–19h). Próximo envio programado: <strong>amanhã 08:00</strong>.
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              etapa: 'D+1',
              canal: 'WhatsApp',
              regra: 'Autônomo (FIN-020)',
              qtd: rulerCounts.d1,
              nota: 'Tolerância — lembrete amigável',
              tone: 'border-emerald-200 bg-emerald-50/35',
            },
            {
              etapa: 'D+5',
              canal: 'E-mail formal',
              regra: 'Autônomo (FIN-020)',
              qtd: rulerCounts.d5,
              nota: '2ª via + memória de cálculo',
              tone: 'border-blue-200 bg-[#EFF4FF]/45',
            },
            {
              etapa: 'D+15',
              canal: 'Notificação formal',
              regra: 'Exige aprovação Gestor',
              qtd: rulerCounts.d15,
              nota: 'Aviso de garantia / seguradora',
              tone: 'border-amber-200 bg-amber-50/45',
            },
            {
              etapa: 'D+30',
              canal: 'Escalar ao Jurídico',
              regra: 'Jurídico (JUR-007)',
              qtd: rulerCounts.d30,
              nota: 'Notificação extrajudicial / ação',
              tone: 'border-red-200 bg-red-50/45',
            },
          ].map((step) => (
            <div key={step.etapa} className={`rounded-xl border p-3.5 space-y-1.5 ${step.tone}`}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[13px] font-bold text-slate-900">
                  {step.etapa} · {step.canal}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-[11.5px] font-bold text-slate-900 tabular-nums">
                  {step.qtd}
                </span>
              </div>
              <div className="text-[12px] font-semibold text-slate-700">{step.regra}</div>
              <div className="text-[11.5px] text-slate-500">{step.nota}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. GRÁFICO POR TIPO DE GARANTIA + LEITURA DO AGENTE */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <h3 className="text-[14.5px] font-semibold text-slate-900">
                Inadimplência por tipo de garantia
              </h3>
              <p className="text-[12px] text-slate-500">
                Distribuição dos 16 inquilinos totalizando {formatBRL(counts.total)}
              </p>
            </div>
            {garantiaFilter !== 'todas' && (
              <button
                type="button"
                onClick={() => setGarantiaFilter('todas')}
                className="text-[12px] font-semibold text-[#2563EB] hover:underline"
              >
                Limpar filtro ({garantiaFilter})
              </button>
            )}
          </div>

          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={INADIMPLENCIA_POR_GARANTIA}
                layout="vertical"
                margin={{ top: 4, right: 20, left: 4, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis
                  type="number"
                  tickFormatter={(v) => `R$ ${Math.round(v / 1000)}k`}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                />
                <YAxis
                  type="category"
                  dataKey="garantia"
                  width={150}
                  tick={{ fontSize: 11, fill: '#334155' }}
                />
                <Tooltip
                  formatter={(v) => [formatBRL(Number(v ?? 0)), 'Valor em aberto']}
                  contentStyle={{ borderRadius: '10px', borderColor: '#E2E8F0', fontSize: '12px' }}
                />
                <Bar dataKey="valor" fill="#2563EB" radius={[0, 6, 6, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 p-5 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[12.5px] font-semibold text-[#5B3FD0]">
              <Sparkles className="w-4 h-4" />
              <span>Leitura do agente sobre garantias</span>
            </div>
            <p className="text-[13px] text-slate-700 leading-relaxed">
              Contratos com <strong>Caução</strong> concentram 56% dos casos (9 de 16 inquilinos, R$ 33.600) e os maiores atrasos acima de 30 dias. Nos contratos com <strong>Seguro fiança</strong> (R$ 8.100), o acionamento da seguradora ocorre automaticamente após D+15.
            </p>

            <div className="grid grid-cols-2 gap-2 text-[12px] tabular-nums">
              {INADIMPLENCIA_POR_GARANTIA.map((g) => (
                <button
                  key={g.garantia}
                  type="button"
                  onClick={() =>
                    setGarantiaFilter((prev) => (prev === g.garantia ? 'todas' : g.garantia))
                  }
                  className={`text-left rounded-lg border p-2.5 transition-colors ${
                    garantiaFilter === g.garantia
                      ? 'border-[#2563EB] bg-[#EFF4FF]/60'
                      : 'border-slate-200 bg-[#F8F9FB] hover:border-slate-300'
                  }`}
                >
                  <div className="font-semibold text-slate-900 truncate">{g.garantia}</div>
                  <div className="text-slate-600 mt-0.5">
                    {g.inquilinos} · {formatBRLCompact(g.valor)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              onAskAgent({
                title: 'Pedir relatório de garantias',
                prefillText:
                  'Gerar relatório executivo de inadimplência por tipo de garantia (Caução, Fiador, Seguro fiança e Título) com recomendação de regra de aprovação para novos contratos.',
                subtipo: 'Cobrança',
                actionType: 'regua_cobranca',
                evalParams: { diasAtraso: 6 },
              })
            }
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#5B3FD0] hover:bg-[#4C32B8] text-white text-[12.5px] font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pedir ao agente: relatório de garantias</span>
          </button>
        </div>
      </section>

      {/* 4. TABELA DOS 16 INADIMPLENTES */}
      <section className="bg-white rounded-xl border border-slate-200/90 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-[15px] font-semibold text-slate-900">
              Carteira inadimplente ({filteredTenants.length} de {tenants.length} inquilinos ·{' '}
              <span className="tabular-nums">
                {formatBRL(filteredTenants.reduce((acc, t) => acc + t.valorTotal, 0))}
              </span>
              )
            </h3>
            <p className="text-[12px] text-slate-500 mt-0.5">
              Clique em um inquilino para abrir o histórico completo e o Simulador de Acordo.
            </p>
          </div>
          {(bucketFilter !== 'todos' || garantiaFilter !== 'todas') && (
            <button
              type="button"
              onClick={() => {
                setBucketFilter('todos');
                setGarantiaFilter('todas');
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-700 hover:bg-slate-50"
            >
              Mostrar todos os 16
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[12.5px]">
            <thead>
              <tr className="bg-[#F8F9FB] border-b border-slate-200 text-slate-600">
                <th className="py-3 px-4 font-semibold text-[11.5px]">Inquilino / Imóvel</th>
                <th className="py-3 px-4 font-semibold text-[11.5px]">Atraso</th>
                <th className="py-3 px-4 font-semibold text-[11.5px]">Valor devido</th>
                <th className="py-3 px-4 font-semibold text-[11.5px]">Garantia</th>
                <th className="py-3 px-4 font-semibold text-[11.5px]">Etapa &amp; Próxima ação</th>
                <th className="py-3 px-4 font-semibold text-[11.5px]">Regra aplicada</th>
                <th className="py-3 px-4 font-semibold text-[11.5px] text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTenants.map((tenant) => {
                const sem =
                  tenant.diasAtraso > 30 ? 'vermelho' : tenant.diasAtraso > 15 ? 'ambar' : 'ambar';
                const nextActionText = foraJanelaDemo
                  ? 'Próximo envio: amanhã 08:00 (FIN-020)'
                  : tenant.proximaAcao;

                return (
                  <tr
                    key={tenant.id}
                    onClick={() => setSelectedTenant(tenant)}
                    className="hover:bg-slate-50/80 cursor-pointer"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-900">{tenant.nome}</span>
                        {tenant.acaoJudicial && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-red-200 bg-red-50 text-red-700 text-[10.5px] font-semibold">
                            <Gavel className="w-3 h-3" />
                            <span>Ação judicial</span>
                          </span>
                        )}
                      </div>
                      <div className="text-[11.5px] text-slate-500">
                        {tenant.imovel} · {tenant.contratoCode}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap tabular-nums">
                      <SemaphoreBadge semaphore={sem} label={`${tenant.diasAtraso} dias`} />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap tabular-nums">
                      <div className="font-bold text-slate-900">{formatBRL(tenant.valorTotal)}</div>
                      <div className="text-[11px] text-slate-500">
                        Princ. {formatBRL(tenant.principal)} + enc.{' '}
                        {formatBRL(tenant.multa + tenant.juros)}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                      {tenant.garantia}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{tenant.etapaTexto}</div>
                      <div className="text-[11.5px] text-slate-500">{nextActionText}</div>
                      {tenant.protocoloRelacionado && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (tenant.orderIdRelacionado) {
                              onOpenOrderInCenter(tenant.orderIdRelacionado);
                            }
                          }}
                          className="mt-0.5 font-mono text-[11px] font-bold text-[#2563EB] hover:underline"
                        >
                          {tenant.protocoloRelacionado}
                        </button>
                      )}
                    </td>
                    <td
                      className="py-3 px-4 whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <RuleAppliedChip
                        ruleId={tenant.regraId}
                        versao={tenant.regraVersao}
                        onOpenRule={onOpenRuleById}
                      />
                    </td>
                    <td
                      className="py-3 px-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedTenant(tenant)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[12px] font-semibold text-slate-700"
                      >
                        <Calculator className="w-3.5 h-3.5 text-[#5B3FD0]" />
                        <span>Simular acordo</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* DRAWER DETALHE DO INADIMPLENTE + SIMULADOR DE ACORDO */}
      {selectedTenant && simulatorCalc && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-[1px]"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0"
            onClick={() => setSelectedTenant(null)}
            aria-hidden="true"
          />

          <div className="relative z-10 w-full max-w-2xl bg-white h-full border-l border-slate-200 flex flex-col overflow-hidden">
            {/* Drawer Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-4 shrink-0">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-[17px] font-bold text-slate-900">{selectedTenant.nome}</h2>
                  <SemaphoreBadge
                    semaphore={selectedTenant.diasAtraso > 30 ? 'vermelho' : 'ambar'}
                    label={`${selectedTenant.diasAtraso} dias de atraso`}
                  />
                  {selectedTenant.acaoJudicial && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-red-200 bg-red-50 text-red-700 text-[11px] font-semibold">
                      <Gavel className="w-3 h-3" />
                      <span>Ação judicial ativa</span>
                    </span>
                  )}
                </div>
                <p className="text-[12.5px] text-slate-600 mt-1">
                  {selectedTenant.imovel} · {selectedTenant.contratoCode} · Garantia:{' '}
                  <strong>{selectedTenant.garantia}</strong>
                </p>
                <div className="mt-1">
                  <AgentRegisteredTag label={selectedTenant.registeredBy} />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTenant(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                aria-label="Fechar detalhes"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Parcelas e Encargos */}
              <div className="rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[13.5px] font-semibold text-slate-900">
                    Composição do débito em aberto
                  </h3>
                  <span className="text-[16px] font-bold text-slate-900 tabular-nums">
                    {formatBRL(selectedTenant.valorTotal)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-[12px] tabular-nums bg-[#F8F9FB] rounded-lg p-3 border border-slate-200/80">
                  <div>
                    <div className="text-slate-500">Principal</div>
                    <div className="font-semibold text-slate-900 mt-0.5">
                      {formatBRL(selectedTenant.principal)}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Multa contratual</div>
                    <div className="font-semibold text-slate-900 mt-0.5">
                      {formatBRL(selectedTenant.multa)}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Juros de mora</div>
                    <div className="font-semibold text-slate-900 mt-0.5">
                      {formatBRL(selectedTenant.juros)}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-[12px] tabular-nums">
                  {selectedTenant.parcelasAbertas.map((p) => (
                    <div
                      key={p.competencia}
                      className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-b-0"
                    >
                      <span className="text-slate-700">
                        Competência <strong>{p.competencia}</strong> · Venc. {p.vencimento}
                      </span>
                      <span className="font-semibold text-slate-900">
                        {formatBRL(p.principal + p.encargos)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SIMULADOR DE ACORDO EM TEMPO REAL */}
              <div className="rounded-xl border border-[#5B3FD0]/30 bg-[#F3F0FF]/35 p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-[#5B3FD0]" />
                    <h3 className="text-[14.5px] font-bold text-slate-900">
                      Simulador de acordo (regras em tempo real)
                    </h3>
                  </div>
                  <PolicyModeBadge modo={simulatorCalc.combinedModo} />
                </div>

                {selectedTenant.acaoJudicial && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 flex items-start gap-2.5 text-[12.5px] text-red-900">
                    <ShieldAlert className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                    <div>
                      <strong>Aprovação do Jurídico obrigatória:</strong> este contrato possui ação
                      judicial iniciada. Conflito FIN-014 × JUR-007 resolvido em favor da regra mais
                      restritiva (Jurídico).
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between text-[12px] font-semibold text-slate-800 mb-1.5">
                      <span>Parcelas do acordo</span>
                      <span className="tabular-nums text-[#2563EB]">{simParcelas}x</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={12}
                      value={simParcelas}
                      onChange={(e) => setSimParcelas(Number(e.target.value))}
                      className="w-full accent-[#5B3FD0]"
                      aria-label="Quantidade de parcelas"
                    />
                    <div className="flex justify-between text-[10.5px] text-slate-500 mt-1">
                      <span>1–3 autônomo</span>
                      <span>4–6 Financeiro</span>
                      <span>&gt;6 bloqueado</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[12px] font-semibold text-slate-800 mb-1.5">
                      <span>Desconto em multa e juros</span>
                      <span className="tabular-nums text-[#2563EB]">{simDescontoPct}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={50}
                      step={5}
                      value={simDescontoPct}
                      onChange={(e) => setSimDescontoPct(Number(e.target.value))}
                      className="w-full accent-[#5B3FD0]"
                      aria-label="Percentual de desconto sobre multa e juros"
                    />
                    <div className="flex justify-between text-[10.5px] text-slate-500 mt-1">
                      <span>≤10% autônomo</span>
                      <span>10–30% Gestor</span>
                      <span>&gt;30% bloqueado</span>
                    </div>
                  </div>
                </div>

                {/* Live Result Numbers */}
                <div className="grid grid-cols-3 gap-3 bg-white rounded-xl border border-slate-200 p-3.5 tabular-nums">
                  <div>
                    <div className="text-[11px] text-slate-500">Desconto aplicado</div>
                    <div className="text-[15px] font-bold text-slate-900 mt-0.5">
                      -{formatBRL(simulatorCalc.descontoReais)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500">Total do acordo</div>
                    <div className="text-[15px] font-bold text-[#2563EB] mt-0.5">
                      {formatBRL(simulatorCalc.totalComDesconto)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500">Valor da parcela</div>
                    <div className="text-[15px] font-bold text-emerald-700 mt-0.5">
                      {simParcelas}x de {formatBRL(simulatorCalc.valorParcela)}
                    </div>
                  </div>
                </div>

                {/* Rules breakdown */}
                <div className="space-y-2 text-[12px]">
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-white rounded-lg border border-slate-200 px-3 py-2">
                    <div>
                      <span className="font-semibold text-slate-800">Desconto ({simDescontoPct}%): </span>
                      <span className="text-slate-600">{simulatorCalc.evalDesconto.resultadoTexto}</span>
                    </div>
                    <RuleAppliedChip
                      ruleId={simulatorCalc.evalDesconto.regraId}
                      versao={simulatorCalc.evalDesconto.versao}
                      onOpenRule={onOpenRuleById}
                    />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-white rounded-lg border border-slate-200 px-3 py-2">
                    <div>
                      <span className="font-semibold text-slate-800">Parcelas ({simParcelas}x): </span>
                      <span className="text-slate-600">{simulatorCalc.evalParcelas.resultadoTexto}</span>
                    </div>
                    <RuleAppliedChip
                      ruleId={simulatorCalc.evalParcelas.regraId}
                      versao={simulatorCalc.evalParcelas.versao}
                      onOpenRule={onOpenRuleById}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const target = selectedTenant;
                      const calc = simulatorCalc;
                      setSelectedTenant(null);
                      onAskAgent({
                        title: `Propor acordo · ${target.nome}`,
                        prefillText: `Propor acordo para ${target.nome} (${target.imovel}) com ${simDescontoPct}% de desconto sobre multa e juros e parcelamento em ${simParcelas}x de ${formatBRL(calc.valorParcela)} (total ${formatBRL(calc.totalComDesconto)}).`,
                        subtipo: 'Acordo',
                        actionType:
                          calc.evalDesconto.modo !== 'autonomo' || target.acaoJudicial
                            ? 'desconto_multa_juros'
                            : 'parcelamento',
                        evalParams: {
                          percentualDesconto: simDescontoPct,
                          parcelas: simParcelas,
                          acaoJudicial: target.acaoJudicial,
                        },
                        links: [
                          { type: 'Contrato', code: target.contratoCode, label: target.imovel },
                          { type: 'Pessoa', code: target.id.toUpperCase(), label: `${target.nome} (Inquilino)` },
                        ],
                      });
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#5B3FD0] hover:bg-[#4C32B8] text-white text-[12.5px] font-semibold"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Pedir ao agente: propor acordo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const target = selectedTenant;
                      setSelectedTenant(null);
                      onAskAgent({
                        title: `Cobrar agora · ${target.nome}`,
                        prefillText: `Enviar cobrança imediata para ${target.nome} (${target.imovel}, ${target.diasAtraso} dias de atraso, ${formatBRL(target.valorTotal)}) com link PIX atualizado.`,
                        subtipo: 'Cobrança',
                        actionType: 'regua_cobranca',
                        evalParams: {
                          diasAtraso: target.diasAtraso,
                          foraJanelaHorario: foraJanelaDemo,
                        },
                      });
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-[12.5px] font-semibold"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Cobrar agora</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const target = selectedTenant;
                      setSelectedTenant(null);
                      onAskAgent({
                        title: `Escalar ao Jurídico · ${target.nome}`,
                        prefillText: `Escalar débito de ${target.nome} (${target.imovel}, ${formatBRL(target.valorTotal)}, garantia ${target.garantia}) ao Jurídico para notificação extrajudicial.`,
                        subtipo: 'Cobrança',
                        actionType: 'regua_cobranca',
                        evalParams: { diasAtraso: 30, foraJanelaHorario: foraJanelaDemo },
                      });
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-[12.5px] font-semibold"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>Escalar ao Jurídico</span>
                  </button>
                </div>
              </div>

              {/* Timeline de Cobrança */}
              <div className="space-y-2.5">
                <h3 className="text-[13.5px] font-semibold text-slate-900">
                  Linha do tempo da régua de cobrança
                </h3>
                <div className="space-y-2">
                  {selectedTenant.historicoCobranca.map((h, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-slate-200 bg-[#F8F9FB] px-3.5 py-2.5 flex items-start justify-between gap-3 text-[12px]"
                    >
                      <div>
                        <span className="font-semibold text-slate-900">{h.canal}: </span>
                        <span className="text-slate-700">{h.evento}</span>
                      </div>
                      <span className="text-slate-500 tabular-nums shrink-0">{h.data}</span>
                    </div>
                  ))}
                </div>
                {selectedTenant.orderIdRelacionado && (
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedTenant.orderIdRelacionado) {
                        onOpenOrderInCenter(selectedTenant.orderIdRelacionado);
                        setSelectedTenant(null);
                      }
                    }}
                    className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-[#2563EB] hover:underline pt-1"
                  >
                    <span>Ver pedido {selectedTenant.protocoloRelacionado} em Agente de IA</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
