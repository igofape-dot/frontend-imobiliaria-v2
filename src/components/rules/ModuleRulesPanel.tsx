import {
  Plus,
  ExternalLink,
  Pencil,
  Bot,
  Sparkles,
  MessageSquarePlus,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import type { PerfilRegra, Regra } from '../../data/rulesData';
import {
  BarrierLockTag,
  canCreateInModule,
  canEditRule,
  formatRuleSummary,
  getEditDeniedReason,
  ModoBadge,
  StatusRegraBadge,
  TIPO_REGRA_LABELS,
} from './RuleHelpers';
import { WordTruncatedText } from '../agent-center/OrderHelpers';

interface ModuleRulesPanelProps {
  moduleFilter: string;
  rules: Regra[];
  perfil: PerfilRegra;
  onChangePerfil?: (perfil: PerfilRegra) => void;
  isLoading?: boolean;
  hasError?: boolean;
  onRetry?: () => void;
  onSelectRule: (rule: Regra) => void;
  onEditRule: (rule: Regra) => void;
  onNewRuleInModule: (modulo: string) => void;
  onProposeChangeToOwner: (sourceRule: Regra, targetModule: string) => void;
  onStartFromTemplate: (modulo: string) => void;
  onViewInCentral: (modulo: string) => void;
}

export function ModuleRulesPanel({
  moduleFilter,
  rules,
  perfil,
  onChangePerfil,
  isLoading = false,
  hasError = false,
  onRetry,
  onSelectRule,
  onEditRule,
  onNewRuleInModule,
  onProposeChangeToOwner,
  onStartFromTemplate,
  onViewInCentral,
}: ModuleRulesPanelProps) {
  const ownedRules = rules.filter((r) => r.moduloDono === moduleFilter);
  const affectingRules = rules.filter(
    (r) =>
      r.moduloDono !== moduleFilter &&
      (r.modulosAfetados.includes(moduleFilter) || r.modulosAfetados.includes('Global'))
  );

  const canCreateHere = canCreateInModule(perfil, moduleFilter);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse" aria-busy="true">
        <div className="h-20 bg-white rounded-xl border border-slate-200" />
        <div className="h-56 bg-white rounded-xl border border-slate-200" />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
        <AlertTriangle className="w-7 h-7 text-red-600 mx-auto mb-2" />
        <p className="text-[14px] font-semibold text-slate-900">
          Não foi possível carregar as regras de {moduleFilter}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-[12px] font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Tentar novamente
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header card */}
      <section className="bg-white rounded-xl border border-slate-200/90 p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[16px] font-bold text-slate-900">
              Regras de {moduleFilter}
            </h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F3F0FF] text-[#5B3FD0] text-[11px] font-semibold">
              <Bot className="w-3 h-3" />
              Base única do agente
            </span>
          </div>
          <p className="text-[12.5px] text-slate-500 mt-1">
            As regras definidas aqui governam automaticamente todas as ações do agente neste módulo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {onChangePerfil && (
            <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-[#F8F9FB] border border-slate-200 text-[11.5px]">
              {(['Gestor', 'Financeiro', 'Jurídico', 'Corretor'] as PerfilRegra[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onChangePerfil(p)}
                  className={`px-2 py-1 rounded font-medium transition-colors ${
                    perfil === p
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => onViewInCentral(moduleFilter)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[12.5px] font-medium text-slate-700"
          >
            <span>Ver na central</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            disabled={!canCreateHere}
            title={
              canCreateHere
                ? `Criar nova regra em ${moduleFilter}`
                : `Perfil ${perfil} não pode criar regras em ${moduleFilter}`
            }
            onClick={() => onNewRuleInModule(moduleFilter)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-[12.5px] font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nova regra
          </button>
        </div>
      </section>

      {/* Owned rules section */}
      <section className="bg-white rounded-xl border border-slate-200/90 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200/80 flex items-center justify-between gap-2 bg-[#F8F9FB]/60">
          <h3 className="text-[13.5px] font-semibold text-slate-900">
            Regras cujo dono é {moduleFilter} ({ownedRules.length})
          </h3>
          <span className="text-[11.5px] text-slate-500">
            Perfil ativo: <strong className="text-slate-800">{perfil}</strong>
          </span>
        </div>

        {ownedRules.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#F3F0FF] text-[#5B3FD0] flex items-center justify-center mx-auto">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[14.5px] font-semibold text-slate-900">
                Nenhuma regra específica cadastrada em {moduleFilter}
              </h4>
              <p className="text-[12.5px] text-slate-500 mt-1 max-w-md mx-auto">
                Por padrão, o agente segue apenas as barreiras globais e pede aprovação humana para ações sensíveis.
              </p>
            </div>
            <button
              type="button"
              disabled={!canCreateHere}
              onClick={() => onStartFromTemplate(moduleFilter)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-[12.5px] font-semibold"
            >
              <Sparkles className="w-4 h-4" />
              Começar por um modelo
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {ownedRules.map((rule) => {
              const editable = canEditRule(perfil, rule);
              const deniedReason = getEditDeniedReason(perfil, rule);
              const summary = formatRuleSummary(rule);

              return (
                <div
                  key={rule.id}
                  className="p-4 sm:px-5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => onSelectRule(rule)}
                    className="text-left min-w-0 flex-1 space-y-1"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[12px] font-bold text-slate-900">
                        {rule.id}
                      </span>
                      <span className="text-[13.5px] font-semibold text-slate-900">
                        {rule.nome}
                      </span>
                      <StatusRegraBadge status={rule.status} />
                      <ModoBadge modo={rule.entao.modo} />
                      {rule.travada && <BarrierLockTag />}
                    </div>

                    <div className="text-[12px] text-slate-600">
                      <WordTruncatedText text={summary} maxChars={105} />
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-slate-500">
                      <span>{TIPO_REGRA_LABELS[rule.tipo]}</span>
                      <span>·</span>
                      <span className="tabular-nums">v{rule.versao}</span>
                      <span>·</span>
                      <span className="tabular-nums">{rule.acionamentos30d} acionamentos/30d</span>
                      <span>·</span>
                      <span className="text-[#5B3FD0] font-medium">
                        {rule.registradaPor ?? `Redigida pelo agente, confirmada por ${rule.criadaPor}`}
                      </span>
                    </div>
                  </button>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onSelectRule(rule)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[12px] font-medium text-slate-700"
                    >
                      Detalhes
                    </button>
                    <button
                      type="button"
                      disabled={!editable}
                      title={!editable ? deniedReason : 'Editar regra'}
                      onClick={() => onEditRule(rule)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-45 text-[12px] font-medium text-slate-700"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Editar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Affecting rules from other modules (read-only + Propor alteração) */}
      <section className="bg-white rounded-xl border border-slate-200/90 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200/80 flex items-center justify-between gap-2 bg-[#F8F9FB]/60">
          <div>
            <h3 className="text-[13.5px] font-semibold text-slate-900">
              Regras de outros módulos que afetam este ({affectingRules.length})
            </h3>
            <p className="text-[11.5px] text-slate-500">
              Visualização somente leitura. Alterações criam rascunho para aprovação do módulo dono.
            </p>
          </div>
        </div>

        {ownedRules.some((r) => r.conflitoCom) && (
          <div className="mx-5 mt-4 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 flex items-start gap-2.5 text-[12.5px] text-amber-950">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold">
                Conflito detectado ({ownedRules.find((r) => r.conflitoCom)?.id} ×{' '}
                {ownedRules.find((r) => r.conflitoCom)?.conflitoCom?.ruleId}) — decisão: vale a mais restritiva
              </div>
              <p className="text-amber-900 mt-0.5">
                {ownedRules.find((r) => r.conflitoCom)?.conflitoCom?.descricao}
              </p>
            </div>
          </div>
        )}

        {affectingRules.length === 0 ? (
          <div className="p-6 text-center text-[12.5px] text-slate-500">
            Nenhuma regra externa afeta {moduleFilter} no momento.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {affectingRules.map((rule) => (
              <div
                key={rule.id}
                className="p-4 sm:px-5 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <button
                  type="button"
                  onClick={() => onSelectRule(rule)}
                  className="text-left min-w-0 flex-1 space-y-1"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[12px] font-bold text-slate-800">
                      {rule.id}
                    </span>
                    <span className="text-[13px] font-semibold text-slate-900">{rule.nome}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-[11px] font-medium text-slate-700">
                      Dono: {rule.moduloDono}
                    </span>
                    <ModoBadge modo={rule.entao.modo} />
                    {rule.travada && <BarrierLockTag />}
                  </div>
                  <div className="text-[12px] text-slate-600">
                    <WordTruncatedText text={formatRuleSummary(rule)} maxChars={100} />
                  </div>
                </button>

                <button
                  type="button"
                  disabled={rule.travada || perfil === 'Corretor'}
                  title={
                    rule.travada
                      ? 'Barreira travada: edição exclusiva do Administrador'
                      : perfil === 'Corretor'
                      ? 'Perfil Corretor apenas visualiza'
                      : `Criar rascunho de proposta para ${rule.moduloDono}`
                  }
                  onClick={() => onProposeChangeToOwner(rule, moduleFilter)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-[#EFF4FF] hover:border-[#2563EB]/40 hover:text-[#2563EB] disabled:opacity-45 text-[12px] font-medium text-slate-700 shrink-0 transition-colors"
                >
                  <MessageSquarePlus className="w-3.5 h-3.5" />
                  Propor alteração
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
