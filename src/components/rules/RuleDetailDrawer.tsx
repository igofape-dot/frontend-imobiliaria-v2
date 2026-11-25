import { useEffect, useState } from 'react';
import {
  X,
  Pencil,
  Bot,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  ExternalLink,
  PauseCircle,
  PlayCircle,
  BarChart2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import type { PerfilRegra, Regra } from '../../data/rulesData';
import {
  BarrierLockTag,
  canEditRule,
  getEditDeniedReason,
  MODO_LABELS,
  ModoBadge,
  StatusRegraBadge,
  TIPO_REGRA_LABELS,
} from './RuleHelpers';

interface RuleDetailDrawerProps {
  rule: Regra | null;
  perfil: PerfilRegra;
  onClose: () => void;
  onEditRule: (rule: Regra) => void;
  onApproveRule: (ruleId: string) => void;
  onTogglePauseRule: (ruleId: string) => void;
  onRestoreVersion: (ruleId: string, versionNumber: number) => void;
  onOpenOrderByProtocol: (protocol: string) => void;
}

type RuleDetailTab = 'resumo' | 'versoes' | 'aplicacoes' | 'impacto';

export function RuleDetailDrawer({
  rule,
  perfil,
  onClose,
  onEditRule,
  onApproveRule,
  onTogglePauseRule,
  onRestoreVersion,
  onOpenOrderByProtocol,
}: RuleDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<RuleDetailTab>('resumo');

  useEffect(() => {
    if (rule) setActiveTab('resumo');
  }, [rule?.id]);

  useEffect(() => {
    if (!rule) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [rule, onClose]);

  if (!rule) return null;

  const editable = canEditRule(perfil, rule);
  const deniedReason = getEditDeniedReason(perfil, rule);

  const weeklyImpact = rule.impactoSemanal ?? [
    { semana: 'S1', acionamentos: Math.max(2, Math.round(rule.acionamentos30d * 0.22)) },
    { semana: 'S2', acionamentos: Math.max(3, Math.round(rule.acionamentos30d * 0.26)) },
    { semana: 'S3', acionamentos: Math.max(2, Math.round(rule.acionamentos30d * 0.24)) },
    { semana: 'S4', acionamentos: Math.max(3, Math.round(rule.acionamentos30d * 0.28)) },
  ];

  const applications = rule.aplicacoes ?? [];
  const versions = rule.historico ?? [
    {
      versao: rule.versao,
      data: rule.atualizadaEm,
      autor: rule.criadaPor,
      resumoMudanca: 'Versão ativa atual registrada na base de regras.',
      antes: '—',
      depois: `Modo ${MODO_LABELS[rule.entao.modo]}`,
      justificativa: rule.justificativa,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/35 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rule-detail-title"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full max-w-4xl bg-[#F8F9FB] h-full border-l border-slate-200 flex flex-col overflow-hidden">
        {/* TOP HEADER */}
        <header className="bg-white border-b border-slate-200 px-5 sm:px-6 py-4 flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[13px] font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                {rule.id}
              </span>
              <span className="text-[12px] font-semibold text-slate-500">v{rule.versao}</span>
              <StatusRegraBadge status={rule.status} />
              <ModoBadge modo={rule.entao.modo} />
              {rule.travada && <BarrierLockTag />}
            </div>

            <h2 id="rule-detail-title" className="text-[17px] font-bold text-slate-900 leading-snug">
              {rule.nome}
            </h2>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-slate-500">
              <span className="inline-flex items-center gap-1 text-[#5B3FD0] font-medium">
                <Bot className="w-3.5 h-3.5" />
                {rule.registradaPor ?? `Redigida pelo agente, confirmada por ${rule.criadaPor}`}
              </span>
              <span>·</span>
              <span>Módulo dono: <strong className="text-slate-800">{rule.moduloDono}</strong></span>
              <span>·</span>
              <span className="tabular-nums">{rule.acionamentos30d} acionamentos (30d)</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 shrink-0"
            aria-label="Fechar detalhe da regra"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* ACTION BAR */}
        <div className="bg-white border-b border-slate-200 px-5 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div role="tablist" aria-label="Abas do detalhe da regra" className="flex items-center gap-1 overflow-x-auto">
            {(
              [
                { id: 'resumo', label: 'Resumo' },
                { id: 'versoes', label: `Versões (${versions.length})` },
                { id: 'aplicacoes', label: `Onde foi aplicada (${applications.length})` },
                { id: 'impacto', label: 'Impacto' },
              ] as { id: RuleDetailTab; label: string }[]
            ).map((tab) => {
              const selected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-[12.5px] font-semibold transition-colors whitespace-nowrap ${
                    selected
                      ? 'bg-[#EFF4FF] text-[#2563EB]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {rule.status === 'em_aprovacao' && perfil === 'Gestor' && (
              <button
                type="button"
                onClick={() => onApproveRule(rule.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-semibold"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Aprovar regra
              </button>
            )}

            {editable && (rule.status === 'ativa' || rule.status === 'pausada') && (
              <button
                type="button"
                onClick={() => onTogglePauseRule(rule.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[12px] font-medium text-slate-700"
              >
                {rule.status === 'ativa' ? (
                  <>
                    <PauseCircle className="w-3.5 h-3.5" />
                    Pausar
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-3.5 h-3.5" />
                    Reativar
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              disabled={!editable}
              title={!editable ? deniedReason : 'Editar esta regra'}
              onClick={() => {
                if (editable) {
                  onClose();
                  onEditRule(rule);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-[12px] font-semibold transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Editar regra
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {!editable && (
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[12px] text-slate-600 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{deniedReason}. Exibição em modo somente leitura para o perfil {perfil}.</span>
            </div>
          )}

          {/* TAB 1: RESUMO */}
          {activeTab === 'resumo' && (
            <div className="space-y-4">
              {rule.conflitoCom && (
                <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div className="text-[12.5px]">
                    <div className="font-semibold text-amber-900">
                      Conflito detectado com {rule.conflitoCom.ruleId}
                    </div>
                    <p className="text-amber-800 mt-0.5">{rule.conflitoCom.descricao}</p>
                  </div>
                </div>
              )}

              <section className="bg-white rounded-xl border border-slate-200/90 p-5 space-y-4">
                <div>
                  <span className="text-[11.5px] font-semibold text-slate-500">Justificativa</span>
                  <p className="text-[13.5px] text-slate-800 mt-0.5 leading-relaxed">
                    {rule.justificativa}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100 text-[12.5px]">
                  <div>
                    <span className="text-[11.5px] text-slate-500 block">Tipo</span>
                    <strong className="font-semibold text-slate-900">
                      {TIPO_REGRA_LABELS[rule.tipo]}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11.5px] text-slate-500 block">Vigência</span>
                    <strong className="font-semibold text-slate-900 tabular-nums">
                      {rule.vigenciaInicio}
                      {rule.vigenciaFim ? ` até ${rule.vigenciaFim}` : ' (contínua)'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11.5px] text-slate-500 block">Aprovador e prazo</span>
                    <strong className="font-semibold text-slate-900">
                      {rule.aprovador
                        ? `${rule.aprovador} (${rule.prazoAprovacaoHoras ?? 4}h)`
                        : 'Sem etapa de aprovação'}
                    </strong>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[11.5px] font-semibold text-slate-500 block mb-1.5">
                    Módulos afetados
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {rule.modulosAfetados.map((m) => (
                      <span
                        key={m}
                        className="px-2.5 py-0.5 rounded-md bg-[#F8F9FB] border border-slate-200 text-[11.5px] font-medium text-slate-700"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </section>

              {/* QUANDO / ENTÃO / EXCETO */}
              <section className="bg-white rounded-xl border border-slate-200/90 p-5 space-y-4">
                <div>
                  <h3 className="text-[12px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Quando
                  </h3>
                  <div className="space-y-1.5">
                    {rule.quando.map((c, i) => (
                      <div
                        key={i}
                        className="rounded-lg bg-[#F8F9FB] border border-slate-200/80 px-3 py-2 text-[12.5px] text-slate-800"
                      >
                        <strong>{c.campo}</strong> {c.operador} <strong>{c.valor}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[12px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Então
                  </h3>
                  {rule.entao.faixas && rule.entao.faixas.length > 0 ? (
                    <div className="space-y-1.5">
                      {rule.entao.faixas.map((f, idx) => {
                        const unit = rule.entao.parametros?.unidade ?? '';
                        const rangeLabel =
                          f.ate !== undefined
                            ? `Até ${unit === 'R$' ? `R$ ${f.ate}` : `${f.ate} ${unit}`}`
                            : 'Acima dessa faixa';
                        return (
                          <div
                            key={idx}
                            className="rounded-lg bg-[#F8F9FB] border border-slate-200/80 px-3 py-2 flex items-center justify-between gap-2 text-[12.5px]"
                          >
                            <span className="font-medium text-slate-800">{rangeLabel}</span>
                            <div className="flex items-center gap-2">
                              {f.aprovador && (
                                <span className="text-[11.5px] text-slate-500">
                                  Aprovador: {f.aprovador}
                                </span>
                              )}
                              <ModoBadge modo={f.modo} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-lg bg-[#F8F9FB] border border-slate-200/80 px-3 py-2 flex items-center justify-between">
                      <span className="text-[12.5px] text-slate-700">Comportamento do agente</span>
                      <ModoBadge modo={rule.entao.modo} />
                    </div>
                  )}

                  {rule.entao.parametros && Object.keys(rule.entao.parametros).length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {Object.entries(rule.entao.parametros)
                        .filter(([k]) => k !== 'unidade')
                        .map(([k, v]) => (
                          <span
                            key={k}
                            className="px-2.5 py-1 rounded-md bg-slate-100 text-[11.5px] text-slate-700"
                          >
                            <span className="text-slate-500">{k}:</span>{' '}
                            <strong className="font-semibold">{String(v)}</strong>
                          </span>
                        ))}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-[12px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Exceto
                  </h3>
                  {rule.excecoes.length === 0 ? (
                    <p className="text-[12px] text-slate-400">Nenhuma exceção registrada.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {rule.excecoes.map((e, i) => (
                        <div
                          key={i}
                          className="rounded-lg bg-amber-50/50 border border-amber-200/80 px-3 py-2 text-[12.5px] text-amber-900"
                        >
                          <strong>{e.campo}</strong> {e.operador} <strong>{e.valor}</strong>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          {/* TAB 2: VERSÕES */}
          {activeTab === 'versoes' && (
            <div className="space-y-3">
              {versions.map((ver) => (
                <article
                  key={ver.versao}
                  className="bg-white rounded-xl border border-slate-200/90 p-4 space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-[11.5px] font-bold text-slate-900">
                        v{ver.versao}
                      </span>
                      <span className="text-[13px] font-semibold text-slate-900">
                        {ver.resumoMudanca}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11.5px] text-slate-500">
                      <span>{ver.autor}</span>
                      <span className="tabular-nums">{ver.data}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px]">
                    <div className="rounded-lg bg-red-50/60 border border-red-200/70 px-3 py-2 text-red-800">
                      <span className="font-semibold block text-[11px]">Antes</span>
                      {ver.antes}
                    </div>
                    <div className="rounded-lg bg-emerald-50/60 border border-emerald-200/70 px-3 py-2 text-emerald-800">
                      <span className="font-semibold block text-[11px]">Depois</span>
                      {ver.depois}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[12px]">
                    <span className="text-slate-600">
                      <strong>Justificativa:</strong> {ver.justificativa}
                    </span>

                    {ver.versao !== rule.versao && editable && (
                      <button
                        type="button"
                        onClick={() => onRestoreVersion(rule.id, ver.versao)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11.5px] font-semibold text-slate-700"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Restaurar esta versão
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* TAB 3: ONDE FOI APLICADA */}
          {activeTab === 'aplicacoes' && (
            <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden">
              {applications.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-[13.5px] font-semibold text-slate-900">
                    Nenhum pedido vinculado na amostra recente
                  </p>
                  <p className="text-[12px] text-slate-500 mt-1">
                    Novos pedidos avaliados por {rule.id} aparecerão automaticamente aqui.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onOpenOrderByProtocol(app.protocol)}
                            className="inline-flex items-center gap-1 font-mono text-[12.5px] font-bold text-[#2563EB] hover:underline"
                          >
                            {app.protocol}
                            <ExternalLink className="w-3 h-3" />
                          </button>
                          <span className="text-[11.5px] text-slate-500">
                            v{app.versaoRegra}
                          </span>
                          <ModoBadge modo={app.modoAplicado} />
                        </div>
                        <div className="text-[13px] font-medium text-slate-900">{app.assunto}</div>
                        <p className="text-[12px] text-slate-600">{app.decisao}</p>
                      </div>

                      <div className="text-[11.5px] text-slate-500 shrink-0 tabular-nums">
                        {app.data}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: IMPACTO */}
          {activeTab === 'impacto' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-slate-200/90 p-4">
                  <div className="text-[12px] text-slate-500">Acionamentos (30 dias)</div>
                  <div className="text-[24px] font-bold text-slate-900 mt-1 tabular-nums">
                    {rule.acionamentos30d}
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200/90 p-4">
                  <div className="text-[12px] text-slate-500">% aprovadas sem edição</div>
                  <div className="text-[24px] font-bold text-emerald-700 mt-1 tabular-nums">
                    {rule.aprovadasSemEdicaoPct ?? 92}%
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200/90 p-4">
                  <div className="text-[12px] text-slate-500">% bloqueios revertidos</div>
                  <div className="text-[24px] font-bold text-amber-700 mt-1 tabular-nums">
                    {rule.bloqueiosRevertidosPct ?? 6}%
                  </div>
                </div>
              </div>

              <section className="bg-white rounded-xl border border-slate-200/90 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[14px] font-semibold text-slate-900 flex items-center gap-1.5">
                    <BarChart2 className="w-4 h-4 text-[#2563EB]" />
                    Acionamentos por semana
                  </h3>
                  <span className="text-[11.5px] text-slate-500">Últimas 4 semanas</span>
                </div>

                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyImpact} margin={{ top: 8, right: 12, left: -12, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F6" vertical={false} />
                      <XAxis dataKey="semana" tick={{ fontSize: 11.5, fill: '#64748B' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11.5, fill: '#64748B' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        formatter={(val) => [`${val} acionamentos`, 'Total']}
                        contentStyle={{ fontSize: '12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}
                      />
                      <Bar dataKey="acionamentos" fill="#2563EB" radius={[6, 6, 0, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
