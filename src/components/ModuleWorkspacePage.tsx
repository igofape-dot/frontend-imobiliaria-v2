import { useEffect, useState } from 'react';
import {
  Bot,
  Sliders,
  LayoutDashboard,
  Wallet,
  Scale,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import type { NavItemId } from '../data/navigation';
import type { PerfilRegra, Regra } from '../data/rulesData';
import type { AgentOrder } from '../data/agentOrdersData';
import { ModuleRulesPanel } from './rules/ModuleRulesPanel';

interface ModuleWorkspacePageProps {
  moduleId: NavItemId;
  moduleTitle: string;
  workspaceShortName: string;
  rules: Regra[];
  orders: AgentOrder[];
  perfil: PerfilRegra;
  isLoading: boolean;
  onChangePerfil: (perfil: PerfilRegra) => void;
  onSelectRule: (rule: Regra) => void;
  onEditRule: (rule: Regra) => void;
  onNewRuleInModule: (modulo: string) => void;
  onProposeChangeToOwner: (sourceRule: Regra, targetModule: string) => void;
  onStartFromTemplate: (modulo: string) => void;
  onViewInCentral: (modulo: string) => void;
  onOpenOrderInCenter: (orderId: string) => void;
  onReturnToPainel: () => void;
}

const FINANCEIRO_ITEMS = [
  {
    id: 'fin-row-1',
    protocol: 'PED-2026-004807',
    orderId: 'ord-4807',
    titulo: 'Lote REM-20261122-06 · 6 repasses que vencem hoje',
    valor: 'R$ 28.450,00',
    regra: 'FIN-003 v1',
    statusLabel: 'Aguardando aprovação',
    tone: 'amber' as const,
  },
  {
    id: 'fin-row-2',
    protocol: 'PED-2026-004803',
    orderId: 'ord-4803',
    titulo: 'Régua escalonada de cobrança · 16 contratos em atraso',
    valor: 'R$ 56.880,00',
    regra: 'FIN-014 v3 · FIN-020 v2',
    statusLabel: '13 enviados · 3 em cartório',
    tone: 'red' as const,
  },
  {
    id: 'fin-row-3',
    protocol: 'PED-2026-004806',
    orderId: 'ord-4806',
    titulo: 'Conciliação PIX sem CPF · Casa 12 (Fernanda Lima)',
    valor: 'R$ 2.950,00',
    regra: 'FIN-021 v1',
    statusLabel: 'Pausado por exceção',
    tone: 'amber' as const,
  },
  {
    id: 'fin-row-4',
    protocol: 'PED-2026-004804.1',
    orderId: 'ord-4804-1',
    titulo: 'Segunda via boleto Apto 401 · atualização monetária',
    valor: 'R$ 3.450,00',
    regra: 'FIN-014 v3',
    statusLabel: 'Concluído no prazo',
    tone: 'emerald' as const,
  },
];

const JURIDICO_ITEMS = [
  {
    id: 'jur-row-1',
    protocol: 'PED-2026-004812',
    orderId: 'ord-4812',
    titulo: 'Minuta de renovação CTR-302 · Apto 302 (IGP-M 4,2%)',
    prazo: 'Vence hoje 17:00',
    regra: 'JUR-002 v2',
    statusLabel: 'Conferência das partes',
    tone: 'amber' as const,
  },
  {
    id: 'jur-row-2',
    protocol: 'PED-2026-004805',
    orderId: 'ord-4805',
    titulo: 'Aditivo de permissão de pet · Apto 504 (Ed. Bela Vista)',
    prazo: 'SLA pausado',
    regra: 'JUR-005 v1',
    statusLabel: 'Aguardando proprietária',
    tone: 'amber' as const,
  },
  {
    id: 'jur-row-3',
    protocol: 'PED-2026-004800',
    orderId: 'ord-4800',
    titulo: 'Notificação extrajudicial v2 · Sala 902 Centro',
    prazo: 'Ciclo 2 · +4h',
    regra: 'JUR-001 v1 (Barreira)',
    statusLabel: 'Minuta preparatória',
    tone: 'red' as const,
  },
  {
    id: 'jur-row-4',
    protocol: 'PED-2026-004810',
    orderId: 'ord-4810',
    titulo: 'Leitura PDF contrato assinado · Sala 804 Paulista',
    prazo: 'Em 2d 18h',
    regra: 'JUR-013 v1 (Conf. 95%)',
    statusLabel: 'Interpretado pelo agente',
    tone: 'emerald' as const,
  },
];

function StatusTonePill({
  tone,
  label,
}: {
  tone: 'emerald' | 'amber' | 'red';
  label: string;
}) {
  if (tone === 'emerald') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11.5px] font-semibold">
        <CheckCircle2 className="w-3.5 h-3.5" />
        {label}
      </span>
    );
  }
  if (tone === 'red') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 border border-red-200 text-red-700 text-[11.5px] font-semibold">
        <AlertTriangle className="w-3.5 h-3.5" />
        {label}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[11.5px] font-semibold">
      <Clock className="w-3.5 h-3.5" />
      {label}
    </span>
  );
}

export function ModuleWorkspacePage({
  moduleId,
  moduleTitle,
  workspaceShortName,
  rules,
  orders,
  perfil,
  isLoading,
  onChangePerfil,
  onSelectRule,
  onEditRule,
  onNewRuleInModule,
  onProposeChangeToOwner,
  onStartFromTemplate,
  onViewInCentral,
  onOpenOrderInCenter,
  onReturnToPainel,
}: ModuleWorkspacePageProps) {
  const isFinanceiro = moduleId === 'financeiro';
  const isJuridico = moduleId === 'contratos-juridico';

  const [activeTab, setActiveTab] = useState<'visao' | 'operacional' | 'regras'>(
    isFinanceiro || isJuridico ? 'regras' : 'regras'
  );

  useEffect(() => {
    setActiveTab('regras');
  }, [moduleId]);

  const ownedRulesCount = rules.filter((r) => r.moduloDono === moduleTitle).length;
  const activeOwnedCount = rules.filter(
    (r) => r.moduloDono === moduleTitle && r.status === 'ativa'
  ).length;
  const affectingCount = rules.filter(
    (r) =>
      r.moduloDono !== moduleTitle &&
      (r.modulosAfetados.includes(moduleTitle) || r.modulosAfetados.includes('Global'))
  ).length;

  const moduleOrders = orders.filter((o) => {
    if (isFinanceiro) return o.category === 'Cobrança e financeiro';
    if (isJuridico) {
      return o.category === 'Jurídico e documentos' || o.category === 'Locação e contratos';
    }
    return true;
  });

  const ModuleIcon = isFinanceiro ? Wallet : isJuridico ? Scale : Bot;

  return (
    <main className="flex-1 bg-[#F8F9FB] px-4 sm:px-6 lg:px-7 py-5 sm:py-6">
      <div className="max-w-[1440px] mx-auto space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-[#EFF4FF] text-[#2563EB] flex items-center justify-center shrink-0">
                <ModuleIcon className="w-4 h-4" strokeWidth={2} />
              </span>
              <h1 className="text-[22px] sm:text-[24px] font-bold text-slate-900 tracking-tight leading-tight">
                {moduleTitle}
              </h1>
            </div>
            <p className="text-[13px] text-slate-500 mt-1">
              {workspaceShortName} · Operado automaticamente pelo agente sob as regras abaixo
            </p>
          </div>

          <button
            type="button"
            onClick={onReturnToPainel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-[12.5px] font-medium text-slate-700 hover:bg-slate-50 self-start sm:self-auto"
          >
            Voltar ao Painel
          </button>
        </div>

        {/* Module tabs */}
        <div
          role="tablist"
          aria-label={`Abas de ${moduleTitle}`}
          className="border-b border-slate-200 flex items-center gap-1 overflow-x-auto"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'visao'}
            onClick={() => setActiveTab('visao')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'visao'
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Visão geral</span>
          </button>

          {(isFinanceiro || isJuridico) && (
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'operacional'}
              onClick={() => setActiveTab('operacional')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'operacional'
                  ? 'border-[#2563EB] text-[#2563EB]'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {isFinanceiro ? <Wallet className="w-4 h-4" /> : <Scale className="w-4 h-4" />}
              <span>{isFinanceiro ? 'Repasses e cobranças' : 'Minutas e prazos'}</span>
            </button>
          )}

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'regras'}
            onClick={() => setActiveTab('regras')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'regras'
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Definir regras</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 tabular-nums">
              {ownedRulesCount}
            </span>
          </button>
        </div>

        {/* Tab: Definir regras (reusable central component filtered by module) */}
        {activeTab === 'regras' && (
          <ModuleRulesPanel
            moduleFilter={moduleTitle}
            rules={rules}
            perfil={perfil}
            onChangePerfil={onChangePerfil}
            isLoading={isLoading}
            onSelectRule={onSelectRule}
            onEditRule={onEditRule}
            onNewRuleInModule={onNewRuleInModule}
            onProposeChangeToOwner={onProposeChangeToOwner}
            onStartFromTemplate={onStartFromTemplate}
            onViewInCentral={onViewInCentral}
          />
        )}

        {/* Tab: Visão geral */}
        {activeTab === 'visao' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-slate-200/90 p-4">
                <div className="text-[12px] text-slate-500">Regras ativas deste módulo</div>
                <div className="text-[24px] font-bold text-slate-900 mt-1 tabular-nums">
                  {activeOwnedCount}
                </div>
                <div className="text-[11.5px] text-slate-500 mt-1">
                  +{affectingCount} regras externas aplicáveis
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/90 p-4">
                <div className="text-[12px] text-slate-500">Pedidos em andamento pelo agente</div>
                <div className="text-[24px] font-bold text-slate-900 mt-1 tabular-nums">
                  {moduleOrders.length}
                </div>
                <div className="text-[11.5px] text-[#5B3FD0] font-medium mt-1">
                  Nenhum cadastro manual necessário
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/90 p-4 flex flex-col justify-between">
                <div>
                  <div className="text-[12px] text-slate-500">Governança</div>
                  <div className="text-[13.5px] font-semibold text-slate-900 mt-1">
                    Defina o que o agente faz sozinho
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('regras')}
                  className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-[#2563EB] hover:underline self-start"
                >
                  Abrir Definir regras
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <section className="bg-white rounded-xl border border-slate-200/90 p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[14.5px] font-semibold text-slate-900">
                  Operações recentes executadas pelo agente em {moduleTitle}
                </h2>
                <span className="inline-flex items-center gap-1 text-[11.5px] text-[#5B3FD0] font-medium">
                  <Bot className="w-3.5 h-3.5" />
                  100% via fila de pedidos
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {moduleOrders.slice(0, 4).map((ord) => (
                  <div
                    key={ord.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[12px] font-bold text-[#2563EB]">
                          {ord.protocol}
                        </span>
                        <span className="text-[13px] font-semibold text-slate-900 truncate">
                          {ord.subject}
                        </span>
                      </div>
                      <div className="text-[12px] text-slate-500 mt-0.5">
                        {ord.requesterName} ({ord.requesterRole}) · {ord.registeredBy}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenOrderInCenter(ord.id)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-700 hover:bg-slate-50 shrink-0 self-start sm:self-auto"
                    >
                      Ver pedido
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Tab: Operacional for Financeiro or Contratos e Jurídico */}
        {activeTab === 'operacional' && (isFinanceiro || isJuridico) && (
          <section className="bg-white rounded-xl border border-slate-200/90 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2 bg-[#F8F9FB]/60">
              <div>
                <h2 className="text-[14.5px] font-semibold text-slate-900">
                  {isFinanceiro
                    ? 'Repasses, baixas e cobranças executadas pelo agente'
                    : 'Minutas, renovações e notificações jurídicas em curso'}
                </h2>
                <p className="text-[12px] text-slate-500">
                  Todos os itens obedecem às regras definidas na aba "Definir regras".
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('regras')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[12px] font-medium text-slate-700"
              >
                <Sliders className="w-3.5 h-3.5" />
                Ajustar regras do módulo
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {isFinanceiro
                ? FINANCEIRO_ITEMS.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 sm:px-5 flex flex-col md:flex-row md:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[12px] font-bold text-[#2563EB]">
                            {item.protocol}
                          </span>
                          <span className="text-[13.5px] font-semibold text-slate-900">
                            {item.titulo}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[12px] text-slate-500">
                          <span className="font-semibold text-slate-800 tabular-nums">
                            {item.valor}
                          </span>
                          <span>·</span>
                          <span className="text-[#5B3FD0] font-medium">Regra: {item.regra}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <StatusTonePill tone={item.tone} label={item.statusLabel} />
                        <button
                          type="button"
                          onClick={() => onOpenOrderInCenter(item.orderId)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Abrir pedido
                        </button>
                      </div>
                    </div>
                  ))
                : JURIDICO_ITEMS.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 sm:px-5 flex flex-col md:flex-row md:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[12px] font-bold text-[#2563EB]">
                            {item.protocol}
                          </span>
                          <span className="text-[13.5px] font-semibold text-slate-900">
                            {item.titulo}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[12px] text-slate-500">
                          <span className="tabular-nums">{item.prazo}</span>
                          <span>·</span>
                          <span className="text-[#5B3FD0] font-medium">Regra: {item.regra}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <StatusTonePill tone={item.tone} label={item.statusLabel} />
                        <button
                          type="button"
                          onClick={() => onOpenOrderInCenter(item.orderId)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Abrir pedido
                        </button>
                      </div>
                    </div>
                  ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
