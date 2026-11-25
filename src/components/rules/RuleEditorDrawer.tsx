import { useEffect, useState } from 'react';
import {
  X,
  Sparkles,
  Plus,
  Trash2,
  Play,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  PauseCircle,
  Archive,
  Clock,
  Bot,
  ExternalLink,
} from 'lucide-react';
import {
  MODULOS_DISPONIVEIS,
  type Condicao,
  type Modo,
  type PerfilRegra,
  type Regra,
  type StatusRegra,
  type TipoRegra,
} from '../../data/rulesData';
import { MODO_LABELS, STATUS_REGRA_LABELS, TIPO_REGRA_LABELS } from './RuleHelpers';

interface RuleEditorDrawerProps {
  isOpen: boolean;
  initialRule: Regra | null;
  presetModule?: string;
  perfil: PerfilRegra;
  allRules: Regra[];
  onClose: () => void;
  onSaveRule: (
    ruleData: Omit<Regra, 'id' | 'versao' | 'criadaPor' | 'atualizadaEm' | 'acionamentos30d'> & {
      id?: string;
    },
    targetStatus: StatusRegra
  ) => void;
  onInspectOrderProtocol?: (protocol: string) => void;
}

const OPERATORS = [
  'igual a',
  'diferente de',
  'maior que',
  'maior ou igual a',
  'menor que',
  'menor ou igual a',
  'entre',
  'contém',
  'em',
];

const SIMULATED_PEDIDOS = [
  { protocol: 'PED-2026-004812', acao: 'Com aprovação', impacto: 'Aprovação Gestor em 4h' },
  { protocol: 'PED-2026-004809', acao: 'Bloqueado / Alçada', impacto: 'Exige aprovação acima de R$ 1.500' },
  { protocol: 'PED-2026-004803', acao: 'Autônomo', impacto: 'Execução imediata sem atraso' },
];

export function RuleEditorDrawer({
  isOpen,
  initialRule,
  presetModule,
  perfil,
  allRules,
  onClose,
  onSaveRule,
  onInspectOrderProtocol,
}: RuleEditorDrawerProps) {
  const [naturalText, setNaturalText] = useState('');
  const [agentStructuredNotice, setAgentStructuredNotice] = useState(false);

  const [nome, setNome] = useState('');
  const [justificativa, setJustificativa] = useState('');
  const [moduloDono, setModuloDono] = useState('Financeiro');
  const [modulosAfetados, setModulosAfetados] = useState<string[]>(['Locação e Administração']);
  const [tipo, setTipo] = useState<TipoRegra>('alcada');
  const [quando, setQuando] = useState<Condicao[]>([
    { campo: 'Valor do pedido', operador: 'maior que', valor: '0' },
  ]);
  const [modo, setModo] = useState<Modo>('aprovacao');
  const [useFaixas, setUseFaixas] = useState(false);
  const [faixas, setFaixas] = useState<{ ate?: number; modo: Modo; aprovador?: string }[]>([
    { ate: 1000, modo: 'autonomo' },
    { modo: 'aprovacao', aprovador: 'Gestor' },
  ]);
  const [excecoes, setExcecoes] = useState<Condicao[]>([]);
  const [aprovador, setAprovador] = useState('Gestor');
  const [prazoAprovacaoHoras, setPrazoAprovacaoHoras] = useState<number>(4);
  const [vigenciaInicio, setVigenciaInicio] = useState('2026-11-23');
  const [vigenciaFim, setVigenciaFim] = useState('');
  const [status, setStatus] = useState<StatusRegra>('rascunho');

  // Specific parameters for meta_semaforo or prazo_sla rules
  const [paramVacVerde, setParamVacVerde] = useState(5);
  const [paramVacVerm, setParamVacVerm] = useState(8);
  const [paramInadVerde, setParamInadVerde] = useState(4);
  const [paramInadVerm, setParamInadVerm] = useState(7);
  const [paramUrgenteHoras, setParamUrgenteHoras] = useState(4);
  const [paramAltaDias, setParamAltaDias] = useState(1);
  const [paramNormalDias, setParamNormalDias] = useState(3);
  const [paramBaixaDias, setParamBaixaDias] = useState(7);

  // Simulation & confirmation states
  const [simResultVisible, setSimResultVisible] = useState(false);
  const [simOrdersExpanded, setSimOrdersExpanded] = useState(false);
  const [confirmCriticalActivate, setConfirmCriticalActivate] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setAgentStructuredNotice(false);
    setSimResultVisible(false);
    setSimOrdersExpanded(false);
    setConfirmCriticalActivate(false);
    setNaturalText('');

    if (initialRule) {
      setNome(initialRule.nome.slice(0, 60));
      setJustificativa(initialRule.justificativa.slice(0, 200));
      setModuloDono(initialRule.moduloDono);
      setModulosAfetados(initialRule.modulosAfetados);
      setTipo(initialRule.tipo);
      setQuando(
        initialRule.quando.length > 0
          ? initialRule.quando
          : [{ campo: 'Tipo de pedido', operador: 'igual a', valor: 'Geral' }]
      );
      setModo(initialRule.entao.modo);
      if (initialRule.entao.faixas && initialRule.entao.faixas.length > 0) {
        setUseFaixas(true);
        setFaixas(initialRule.entao.faixas);
      } else {
        setUseFaixas(false);
      }
      setExcecoes(initialRule.excecoes);
      setAprovador(initialRule.aprovador ?? 'Gestor');
      setPrazoAprovacaoHoras(initialRule.prazoAprovacaoHoras ?? 4);
      setVigenciaInicio(initialRule.vigenciaInicio);
      setVigenciaFim(initialRule.vigenciaFim ?? '');
      setStatus(initialRule.status);

      const params = initialRule.entao.parametros ?? {};
      setParamVacVerde(Number(params.vacanciaVerdeMax ?? 5));
      setParamVacVerm(Number(params.vacanciaVermelhaMin ?? 8));
      setParamInadVerde(Number(params.inadimplenciaVerdeMax ?? 4));
      setParamInadVerm(Number(params.inadimplenciaVermelhaMin ?? 7));
      setParamUrgenteHoras(Number(params.urgenteHoras ?? 4));
      setParamAltaDias(Number(params.altaDiasUteis ?? 1));
      setParamNormalDias(Number(params.normalDiasUteis ?? 3));
      setParamBaixaDias(Number(params.baixaDiasUteis ?? 7));
    } else {
      const defaultMod =
        presetModule ??
        (perfil === 'Financeiro'
          ? 'Financeiro'
          : perfil === 'Jurídico'
          ? 'Contratos e Jurídico'
          : 'Financeiro');
      setNome('');
      setJustificativa('');
      setModuloDono(defaultMod);
      setModulosAfetados(defaultMod === 'Financeiro' ? ['Locação e Administração'] : ['Financeiro']);
      setTipo('alcada');
      setQuando([{ campo: 'Valor da solicitação', operador: 'maior que', valor: '0' }]);
      setModo('aprovacao');
      setUseFaixas(true);
      setFaixas([
        { ate: 500, modo: 'autonomo' },
        { modo: 'aprovacao', aprovador: 'Gestor' },
      ]);
      setExcecoes([]);
      setAprovador('Gestor');
      setPrazoAprovacaoHoras(4);
      setVigenciaInicio('2026-11-23');
      setVigenciaFim('');
      setStatus('rascunho');
    }
  }, [isOpen, initialRule, presetModule, perfil]);

  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isCriticalType = tipo === 'autonomia' || tipo === 'alcada';

  const handleStructureWithAgent = () => {
    const raw = naturalText.trim();
    if (!raw) return;
    const lower = raw.toLowerCase();

    if (lower.includes('desconto') || lower.includes('multa') || lower.includes('juros')) {
      setNome('Desconto comercial em cobranças recorrentes'.slice(0, 60));
      setJustificativa(
        'Padronizar descontos até o teto definido com aprovação rápida do gestor para valores maiores.'.slice(
          0,
          200
        )
      );
      setModuloDono(presetModule ?? 'Financeiro');
      setTipo('alcada');
      setQuando([{ campo: 'Desconto solicitado (%)', operador: 'maior que', valor: '0' }]);
      setUseFaixas(true);
      setFaixas([
        { ate: 10, modo: 'autonomo' },
        { ate: 25, modo: 'aprovacao', aprovador: 'Gestor' },
        { modo: 'bloqueado' },
      ]);
      setModo('aprovacao');
      setExcecoes([{ campo: 'Status judicial', operador: 'igual a', valor: 'Com ação judicial' }]);
    } else if (lower.includes('rescis') || lower.includes('contrato') || lower.includes('minuta')) {
      setNome('Validação jurídica antes de enviar minutas ou rescisões'.slice(0, 60));
      setJustificativa(
        'Evitar envio de documentos jurídicos sem revisão formal da equipe de Contratos e Jurídico.'.slice(
          0,
          200
        )
      );
      setModuloDono(presetModule ?? 'Contratos e Jurídico');
      setTipo('autonomia');
      setQuando([{ campo: 'Documento jurídico', operador: 'em', valor: 'Minuta, Aditivo, Rescisão' }]);
      setUseFaixas(false);
      setModo('aprovacao');
      setAprovador('Jurídico');
      setPrazoAprovacaoHoras(6);
      setExcecoes([]);
    } else {
      setNome(raw.slice(0, 60));
      setJustificativa(
        `Regra estruturada automaticamente pelo agente a partir da diretriz: "${raw}"`.slice(0, 200)
      );
      setModuloDono(presetModule ?? (perfil === 'Jurídico' ? 'Contratos e Jurídico' : 'Financeiro'));
      setTipo('politica_negocio');
      setQuando([{ campo: 'Solicitação', operador: 'contém', valor: raw.slice(0, 32) }]);
      setUseFaixas(false);
      setModo('aprovacao');
      setAprovador('Gestor');
      setPrazoAprovacaoHoras(4);
      setExcecoes([]);
    }

    setAgentStructuredNotice(true);
  };

  // Detect live conflicts against active rules
  const detectedConflict = (() => {
    const hasJudicialEx = excecoes.some((e) => e.valor.toString().toLowerCase().includes('judicial'));
    if (moduloDono === 'Financeiro' && (hasJudicialEx || nome.toLowerCase().includes('desconto'))) {
      const jur = allRules.find((r) => r.id === 'JUR-007');
      if (jur) {
        return `Conflita com ${jur.id} (${jur.nome}): vale a regra mais restritiva (aprovação do Jurídico).`;
      }
    }
    if (initialRule?.conflitoCom) {
      return `Conflita com ${initialRule.conflitoCom.ruleId}: ${initialRule.conflitoCom.descricao}`;
    }
    return null;
  })();

  const toggleAffectedModule = (mod: string) => {
    setModulosAfetados((prev) =>
      prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod]
    );
  };

  const buildPayload = (
    targetStatus: StatusRegra
  ): Omit<Regra, 'id' | 'versao' | 'criadaPor' | 'atualizadaEm' | 'acionamentos30d'> & {
    id?: string;
  } => {
    let parametros: Record<string, string | number> | undefined = initialRule?.entao.parametros;
    if (tipo === 'meta_semaforo') {
      parametros = {
        vacanciaVerdeMax: paramVacVerde,
        vacanciaVermelhaMin: paramVacVerm,
        inadimplenciaVerdeMax: paramInadVerde,
        inadimplenciaVermelhaMin: paramInadVerm,
      };
    } else if (tipo === 'prazo_sla') {
      parametros = {
        urgenteHoras: paramUrgenteHoras,
        altaDiasUteis: paramAltaDias,
        normalDiasUteis: paramNormalDias,
        baixaDiasUteis: paramBaixaDias,
      };
    }

    return {
      id: initialRule?.id,
      nome: nome.trim().slice(0, 60) || 'Nova regra operacional',
      justificativa:
        justificativa.trim().slice(0, 200) ||
        'Diretriz cadastrada para governança do agente.',
      moduloDono,
      modulosAfetados: modulosAfetados.length > 0 ? modulosAfetados : [moduloDono],
      tipo,
      quando,
      entao: {
        modo,
        faixas: useFaixas ? faixas : undefined,
        parametros,
      },
      excecoes,
      aprovador: modo === 'aprovacao' || useFaixas ? aprovador : undefined,
      prazoAprovacaoHoras:
        modo === 'aprovacao' || useFaixas ? Number(prazoAprovacaoHoras) || 4 : undefined,
      vigenciaInicio,
      vigenciaFim: vigenciaFim || undefined,
      status: targetStatus,
      registradaPor: `Redigida pelo agente, confirmada por ${perfil}`,
    };
  };

  const handleTriggerSave = (targetStatus: StatusRegra) => {
    if (targetStatus === 'ativa' && isCriticalType && !confirmCriticalActivate) {
      setSimResultVisible(true);
      setConfirmCriticalActivate(true);
      return;
    }
    onSaveRule(buildPayload(targetStatus), targetStatus);
    onClose();
  };

  const agentPreviewResponse =
    modo === 'bloqueado'
      ? `“Não posso executar "${nome || 'esta ação'}" automaticamente porque há bloqueio ativo na regra. Encaminhei o protocolo para revisão.”`
      : modo === 'sugerir'
      ? `“Preparei a análise de "${nome || 'esta solicitação'}" como sugestão na ficha do pedido. Aguardando sua decisão.”`
      : modo === 'aprovacao'
      ? `“Estruturei a execução dentro da regra e pausei o pedido na fila de aprovação de ${aprovador} (prazo ${prazoAprovacaoHoras}h).”`
      : `“Executei automaticamente dentro dos limites definidos em "${nome || 'regra ativa'}" e registrei na linha do tempo.”`;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/35 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rule-editor-title"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full max-w-[1100px] bg-[#F8F9FB] h-full border-l border-slate-200 flex flex-col overflow-hidden">
        {/* TOP HEADER */}
        <header className="bg-white border-b border-slate-200 px-5 sm:px-6 py-4 flex items-center justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 id="rule-editor-title" className="text-[16px] font-bold text-slate-900">
                {initialRule ? `Editar regra ${initialRule.id}` : 'Nova regra do agente'}
              </h2>
              {isCriticalType && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold">
                  <ShieldAlert className="w-3 h-3" />
                  Regra crítica: requer segunda aprovação
                </span>
              )}
            </div>
            <p className="text-[12px] text-slate-500 mt-0.5">
              O agente nunca ativa regras sozinho — toda criação ou alteração exige validação humana.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Fechar editor de regra"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* MAIN SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* LEFT FORM */}
            <div className="lg:col-span-8 space-y-5">
              {/* Descrever com minhas palavras */}
              <section className="bg-white rounded-xl border border-[#5B3FD0]/25 p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="rule-natural-input"
                    className="text-[13px] font-semibold text-slate-900 flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4 text-[#5B3FD0]" />
                    Descrever com minhas palavras
                  </label>
                  <span className="text-[11px] text-slate-500">
                    O agente traduz para condições estruturadas
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    id="rule-natural-input"
                    type="text"
                    value={naturalText}
                    onChange={(e) => setNaturalText(e.target.value)}
                    placeholder="Ex.: Permitir desconto de multa até 10% sozinho, até 25% pedir aprovação do gestor, nunca em ação judicial..."
                    className="flex-1 h-9 px-3 rounded-lg border border-slate-200 bg-[#F8F9FB] focus:bg-white focus:border-[#5B3FD0] text-[12.5px] text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={handleStructureWithAgent}
                    disabled={!naturalText.trim()}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#5B3FD0] hover:bg-[#4C32B8] disabled:bg-slate-200 disabled:text-slate-400 text-white text-[12px] font-semibold whitespace-nowrap shrink-0 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Estruturar com o agente
                  </button>
                </div>

                {agentStructuredNotice && (
                  <div className="rounded-lg bg-[#F3F0FF] border border-[#5B3FD0]/20 px-3 py-2 flex items-center gap-2 text-[12px] font-medium text-[#5B3FD0]">
                    <Bot className="w-4 h-4 shrink-0" />
                    <span>Campos preenchidos com base no seu texto. Revise antes de salvar.</span>
                  </div>
                )}
              </section>

              {/* Campos principais */}
              <section className="bg-white rounded-xl border border-slate-200/90 p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="rule-name" className="text-[12px] font-semibold text-slate-700">
                        Nome da regra
                      </label>
                      <span className="text-[11px] font-mono tabular-nums text-slate-500">
                        {nome.length}/60
                      </span>
                    </div>
                    <input
                      id="rule-name"
                      type="text"
                      maxLength={60}
                      value={nome}
                      onChange={(e) => setNome(e.target.value.slice(0, 60))}
                      placeholder="Ex.: Desconto de multa e juros em boletos"
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-[13px] font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label htmlFor="rule-owner" className="block text-[12px] font-semibold text-slate-700 mb-1">
                      Módulo dono
                    </label>
                    <select
                      id="rule-owner"
                      value={moduloDono}
                      onChange={(e) => setModuloDono(e.target.value)}
                      disabled={perfil === 'Financeiro' || perfil === 'Jurídico'}
                      className="w-full h-9 px-2.5 rounded-lg border border-slate-300 bg-white disabled:bg-slate-50 text-[12.5px]"
                    >
                      {MODULOS_DISPONIVEIS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="rule-type" className="block text-[12px] font-semibold text-slate-700 mb-1">
                      Tipo de regra
                    </label>
                    <select
                      id="rule-type"
                      value={tipo}
                      onChange={(e) => setTipo(e.target.value as TipoRegra)}
                      className="w-full h-9 px-2.5 rounded-lg border border-slate-300 bg-white text-[12.5px]"
                    >
                      {(Object.keys(TIPO_REGRA_LABELS) as TipoRegra[])
                        .filter((t) => t !== 'barreira')
                        .map((t) => (
                          <option key={t} value={t}>
                            {TIPO_REGRA_LABELS[t]}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="rule-just" className="text-[12px] font-semibold text-slate-700">
                        Justificativa
                      </label>
                      <span className="text-[11px] font-mono tabular-nums text-slate-500">
                        {justificativa.length}/200
                      </span>
                    </div>
                    <textarea
                      id="rule-just"
                      rows={2}
                      maxLength={200}
                      value={justificativa}
                      onChange={(e) => setJustificativa(e.target.value.slice(0, 200))}
                      placeholder="Por que esta regra existe e qual risco ela controla..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-[12.5px] text-slate-800"
                    />
                  </div>
                </div>

                {/* Módulos afetados */}
                <div>
                  <span className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                    Módulos afetados
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {MODULOS_DISPONIVEIS.filter((m) => m !== moduloDono).map((mod) => {
                      const active = modulosAfetados.includes(mod);
                      return (
                        <button
                          key={mod}
                          type="button"
                          onClick={() => toggleAffectedModule(mod)}
                          className={`px-2.5 py-1 rounded-md border text-[11.5px] font-medium transition-colors ${
                            active
                              ? 'bg-[#EFF4FF] border-[#2563EB]/40 text-[#2563EB]'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {mod}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* QUANDO */}
              <section className="bg-white rounded-xl border border-slate-200/90 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[13px] font-bold uppercase tracking-wider text-slate-500">
                    Quando (condições)
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      setQuando((prev) => [
                        ...prev,
                        { campo: 'Categoria', operador: 'igual a', valor: '' },
                      ])
                    }
                    className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#2563EB] hover:text-blue-700"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar condição
                  </button>
                </div>

                <div className="space-y-2">
                  {quando.map((cond, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                      <input
                        type="text"
                        value={cond.campo}
                        onChange={(e) =>
                          setQuando((prev) =>
                            prev.map((c, i) => (i === idx ? { ...c, campo: e.target.value } : c))
                          )
                        }
                        aria-label={`Campo condição ${idx + 1}`}
                        placeholder="Campo"
                        className="sm:col-span-4 h-8 px-2.5 rounded-lg border border-slate-300 text-[12px]"
                      />
                      <select
                        value={cond.operador}
                        onChange={(e) =>
                          setQuando((prev) =>
                            prev.map((c, i) => (i === idx ? { ...c, operador: e.target.value } : c))
                          )
                        }
                        aria-label={`Operador condição ${idx + 1}`}
                        className="sm:col-span-3 h-8 px-2 rounded-lg border border-slate-300 bg-white text-[12px]"
                      >
                        {OPERATORS.map((op) => (
                          <option key={op} value={op}>
                            {op}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={cond.valor}
                        onChange={(e) =>
                          setQuando((prev) =>
                            prev.map((c, i) => (i === idx ? { ...c, valor: e.target.value } : c))
                          )
                        }
                        aria-label={`Valor condição ${idx + 1}`}
                        placeholder="Valor"
                        className="sm:col-span-4 h-8 px-2.5 rounded-lg border border-slate-300 text-[12px]"
                      />
                      <button
                        type="button"
                        onClick={() => setQuando((prev) => prev.filter((_, i) => i !== idx))}
                        disabled={quando.length <= 1}
                        className="sm:col-span-1 p-1.5 rounded-lg text-slate-400 hover:text-red-600 disabled:opacity-30 justify-self-end"
                        aria-label="Remover condição"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* ENTÃO */}
              <section className="bg-white rounded-xl border border-slate-200/90 p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-[13px] font-bold uppercase tracking-wider text-slate-500">
                    Então (ação do agente)
                  </h3>
                  <label className="inline-flex items-center gap-2 text-[12px] font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useFaixas}
                      onChange={(e) => setUseFaixas(e.target.checked)}
                      className="rounded border-slate-300"
                    />
                    Usar faixas de valor (até R$ / %)
                  </label>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['autonomo', 'aprovacao', 'sugerir', 'bloqueado'] as Modo[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setModo(m)}
                      className={`px-3 py-2 rounded-lg border text-[12px] font-semibold transition-colors ${
                        modo === m
                          ? 'border-[#2563EB] bg-[#EFF4FF] text-[#2563EB]'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {MODO_LABELS[m]}
                    </button>
                  ))}
                </div>

                {useFaixas && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-semibold text-slate-700">
                        Faixas escalonadas
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setFaixas((prev) => [...prev, { ate: 5000, modo: 'aprovacao', aprovador: 'Gestor' }])
                        }
                        className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#2563EB]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Adicionar faixa
                      </button>
                    </div>

                    {faixas.map((fx, idx) => (
                      <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                        <div className="sm:col-span-4 flex items-center gap-1.5">
                          <span className="text-[11.5px] text-slate-500 whitespace-nowrap">
                            Até R$ / %
                          </span>
                          <input
                            type="number"
                            value={fx.ate ?? ''}
                            placeholder="Acima"
                            onChange={(e) => {
                              const val = e.target.value === '' ? undefined : Number(e.target.value);
                              setFaixas((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, ate: val } : item))
                              );
                            }}
                            className="w-full h-8 px-2 rounded-lg border border-slate-300 text-[12px] tabular-nums"
                          />
                        </div>
                        <select
                          value={fx.modo}
                          onChange={(e) =>
                            setFaixas((prev) =>
                              prev.map((item, i) =>
                                i === idx ? { ...item, modo: e.target.value as Modo } : item
                              )
                            )
                          }
                          className="sm:col-span-4 h-8 px-2 rounded-lg border border-slate-300 bg-white text-[12px]"
                        >
                          {(['autonomo', 'aprovacao', 'sugerir', 'bloqueado'] as Modo[]).map((m) => (
                            <option key={m} value={m}>
                              {MODO_LABELS[m]}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={fx.aprovador ?? ''}
                          placeholder="Aprovador (se houver)"
                          onChange={(e) =>
                            setFaixas((prev) =>
                              prev.map((item, i) =>
                                i === idx ? { ...item, aprovador: e.target.value } : item
                              )
                            )
                          }
                          className="sm:col-span-3 h-8 px-2 rounded-lg border border-slate-300 text-[12px]"
                        />
                        <button
                          type="button"
                          onClick={() => setFaixas((prev) => prev.filter((_, i) => i !== idx))}
                          className="sm:col-span-1 p-1.5 text-slate-400 hover:text-red-600 justify-self-end"
                          aria-label="Remover faixa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Parameters editor for meta_semaforo or prazo_sla */}
                {tipo === 'meta_semaforo' && (
                  <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Vacância verde ≤ (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={paramVacVerde}
                        onChange={(e) => setParamVacVerde(Number(e.target.value))}
                        className="w-full h-8 px-2 rounded-lg border border-slate-300 text-[12px] tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Vacância vermelha &gt; (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={paramVacVerm}
                        onChange={(e) => setParamVacVerm(Number(e.target.value))}
                        className="w-full h-8 px-2 rounded-lg border border-slate-300 text-[12px] tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Inadimplência verde ≤ (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={paramInadVerde}
                        onChange={(e) => setParamInadVerde(Number(e.target.value))}
                        className="w-full h-8 px-2 rounded-lg border border-slate-300 text-[12px] tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Inadimplência vermelha &gt; (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={paramInadVerm}
                        onChange={(e) => setParamInadVerm(Number(e.target.value))}
                        className="w-full h-8 px-2 rounded-lg border border-slate-300 text-[12px] tabular-nums"
                      />
                    </div>
                  </div>
                )}

                {tipo === 'prazo_sla' && (
                  <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Urgente (horas)
                      </label>
                      <input
                        type="number"
                        value={paramUrgenteHoras}
                        onChange={(e) => setParamUrgenteHoras(Number(e.target.value))}
                        className="w-full h-8 px-2 rounded-lg border border-slate-300 text-[12px] tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Alta (dias úteis)
                      </label>
                      <input
                        type="number"
                        value={paramAltaDias}
                        onChange={(e) => setParamAltaDias(Number(e.target.value))}
                        className="w-full h-8 px-2 rounded-lg border border-slate-300 text-[12px] tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Normal (dias úteis)
                      </label>
                      <input
                        type="number"
                        value={paramNormalDias}
                        onChange={(e) => setParamNormalDias(Number(e.target.value))}
                        className="w-full h-8 px-2 rounded-lg border border-slate-300 text-[12px] tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Baixa (dias úteis)
                      </label>
                      <input
                        type="number"
                        value={paramBaixaDias}
                        onChange={(e) => setParamBaixaDias(Number(e.target.value))}
                        className="w-full h-8 px-2 rounded-lg border border-slate-300 text-[12px] tabular-nums"
                      />
                    </div>
                  </div>
                )}
              </section>

              {/* EXCETO + GOVERNANÇA + VIGÊNCIA */}
              <section className="bg-white rounded-xl border border-slate-200/90 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[13px] font-bold uppercase tracking-wider text-slate-500">
                    Exceto (exceções obrigatórias)
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      setExcecoes((prev) => [
                        ...prev,
                        { campo: 'Status judicial', operador: 'igual a', valor: '' },
                      ])
                    }
                    className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#2563EB]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar exceção
                  </button>
                </div>

                {excecoes.length === 0 ? (
                  <p className="text-[12px] text-slate-400">
                    Nenhuma exceção configurada — a regra vale para todos os casos correspondentes.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {excecoes.map((exc, idx) => (
                      <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                        <input
                          type="text"
                          value={exc.campo}
                          onChange={(e) =>
                            setExcecoes((prev) =>
                              prev.map((c, i) => (i === idx ? { ...c, campo: e.target.value } : c))
                            )
                          }
                          className="sm:col-span-4 h-8 px-2.5 rounded-lg border border-slate-300 text-[12px]"
                        />
                        <select
                          value={exc.operador}
                          onChange={(e) =>
                            setExcecoes((prev) =>
                              prev.map((c, i) =>
                                i === idx ? { ...c, operador: e.target.value } : c
                              )
                            )
                          }
                          className="sm:col-span-3 h-8 px-2 rounded-lg border border-slate-300 bg-white text-[12px]"
                        >
                          {OPERATORS.map((op) => (
                            <option key={op} value={op}>
                              {op}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={exc.valor}
                          onChange={(e) =>
                            setExcecoes((prev) =>
                              prev.map((c, i) => (i === idx ? { ...c, valor: e.target.value } : c))
                            )
                          }
                          className="sm:col-span-4 h-8 px-2.5 rounded-lg border border-slate-300 text-[12px]"
                        />
                        <button
                          type="button"
                          onClick={() => setExcecoes((prev) => prev.filter((_, i) => i !== idx))}
                          className="sm:col-span-1 p-1.5 text-slate-400 hover:text-red-600 justify-self-end"
                          aria-label="Remover exceção"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
                  <div>
                    <label className="block text-[11.5px] font-semibold text-slate-700 mb-1">
                      Quem aprova
                    </label>
                    <input
                      type="text"
                      value={aprovador}
                      onChange={(e) => setAprovador(e.target.value)}
                      className="w-full h-8 px-2.5 rounded-lg border border-slate-300 text-[12px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11.5px] font-semibold text-slate-700 mb-1">
                      Prazo aprovação (h)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={prazoAprovacaoHoras}
                      onChange={(e) => setPrazoAprovacaoHoras(Number(e.target.value))}
                      className="w-full h-8 px-2.5 rounded-lg border border-slate-300 text-[12px] tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-[11.5px] font-semibold text-slate-700 mb-1">
                      Vigência início
                    </label>
                    <input
                      type="date"
                      value={vigenciaInicio}
                      onChange={(e) => setVigenciaInicio(e.target.value)}
                      className="w-full h-8 px-2.5 rounded-lg border border-slate-300 text-[12px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11.5px] font-semibold text-slate-700 mb-1">
                      Vigência fim (opcional)
                    </label>
                    <input
                      type="date"
                      value={vigenciaFim}
                      onChange={(e) => setVigenciaFim(e.target.value)}
                      className="w-full h-8 px-2.5 rounded-lg border border-slate-300 text-[12px]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 text-[12px] text-slate-500">
                  <span>
                    Status atual:{' '}
                    <strong className="text-slate-800">{STATUS_REGRA_LABELS[status]}</strong>
                  </span>
                  <span className="inline-flex items-center gap-1 text-[#5B3FD0] font-medium">
                    <Bot className="w-3.5 h-3.5" />
                    Redigida pelo agente, confirmada por {perfil}
                  </span>
                </div>
              </section>
            </div>

            {/* RIGHT SIDEBAR: ANTES DE ATIVAR */}
            <aside className="lg:col-span-4 space-y-4">
              <section
                aria-label="Antes de ativar"
                className="bg-white rounded-xl border border-slate-200/90 p-4 space-y-4"
              >
                <h3 className="text-[14px] font-semibold text-slate-900">Antes de ativar</h3>

                {/* Simular */}
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => setSimResultVisible(true)}
                    className="w-full py-2 px-3 rounded-lg bg-[#EFF4FF] hover:bg-blue-100/80 border border-[#2563EB]/30 text-[#2563EB] text-[12.5px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Simular com os últimos 30 dias
                  </button>

                  {simResultVisible && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3 space-y-2 text-[12px]">
                      <p className="font-semibold text-slate-900 leading-snug">
                        Teria afetado <span className="tabular-nums">38</span> pedidos: 22 autônomos,
                        12 com aprovação, 4 bloqueados. 3 pedidos atrasariam o prazo.
                      </p>

                      <button
                        type="button"
                        onClick={() => setSimOrdersExpanded((prev) => !prev)}
                        className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#2563EB] hover:underline"
                      >
                        <span>Ver pedidos</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>

                      {simOrdersExpanded && (
                        <div className="pt-2 border-t border-blue-200/70 space-y-1.5">
                          {SIMULATED_PEDIDOS.map((item) => (
                            <div
                              key={item.protocol}
                              className="flex items-center justify-between gap-2 text-[11px]"
                            >
                              <button
                                type="button"
                                onClick={() => onInspectOrderProtocol?.(item.protocol)}
                                className="font-mono font-semibold text-[#2563EB] hover:underline"
                              >
                                {item.protocol}
                              </button>
                              <span className="text-slate-600 truncate">{item.acao}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Conflitos */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="text-[12px] font-semibold text-slate-700">Conflitos</div>
                  {detectedConflict ? (
                    <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-2.5 flex items-start gap-2 text-[11.5px] text-amber-900">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{detectedConflict}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[12px] text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Nenhum conflito detectado com regras ativas.</span>
                    </div>
                  )}
                </div>

                {/* Quem é afetado */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="text-[12px] font-semibold text-slate-700">Quem é afetado</div>
                  <div className="text-[12px] text-slate-600">
                    <div>
                      <span className="text-slate-500">Módulos: </span>
                      <strong className="font-medium text-slate-800">
                        {[moduloDono, ...modulosAfetados].join(', ')}
                      </strong>
                    </div>
                    <div className="mt-1">
                      <span className="text-slate-500">Canais: </span>
                      <strong className="font-medium text-slate-800">
                        WhatsApp, E-mail, Chat do sistema, Portais
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Prévia "Como o agente responderia" */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="text-[12px] font-semibold text-[#5B3FD0] flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5" />
                    Como o agente responderia
                  </div>
                  <div className="rounded-lg bg-[#F3F0FF]/55 border border-[#5B3FD0]/20 p-3 text-[12px] text-slate-700 leading-relaxed italic">
                    {agentPreviewResponse}
                  </div>
                </div>

                {/* Critical activation confirmation */}
                {confirmCriticalActivate && (
                  <div className="rounded-lg border border-red-200 bg-red-50/60 p-3 space-y-2">
                    <div className="text-[12px] font-semibold text-red-800 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      Confirmar ativação de regra crítica
                    </div>
                    <p className="text-[11.5px] text-red-700 leading-snug">
                      Impacto simulado: 38 pedidos nos últimos 30d (22 autônomos, 12 aprovações, 4
                      bloqueios). Deseja confirmar ativação?
                    </p>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmCriticalActivate(false)}
                        className="px-2.5 py-1 rounded text-[11.5px] font-medium text-slate-700 bg-white border border-slate-200"
                      >
                        Revisar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onSaveRule(buildPayload('ativa'), 'ativa');
                          onClose();
                        }}
                        className="px-3 py-1 rounded text-[11.5px] font-semibold text-white bg-red-600 hover:bg-red-700"
                      >
                        Confirmar ativação
                      </button>
                    </div>
                  </div>
                )}
              </section>
            </aside>
          </div>
        </div>

        {/* BOTTOM FOOTER ACTIONS */}
        <footer className="bg-white border-t border-slate-200 px-5 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            {initialRule && (
              <>
                <button
                  type="button"
                  onClick={() => handleTriggerSave('pausada')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-700 hover:bg-slate-50"
                >
                  <PauseCircle className="w-3.5 h-3.5" />
                  Pausar
                </button>
                <button
                  type="button"
                  onClick={() => handleTriggerSave('arquivada')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                >
                  <Archive className="w-3.5 h-3.5" />
                  Arquivar
                </button>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleTriggerSave('rascunho')}
              className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[12.5px] font-medium text-slate-700"
            >
              Salvar rascunho
            </button>

            <button
              type="button"
              onClick={() => handleTriggerSave('em_aprovacao')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-[12.5px] font-semibold"
            >
              <Clock className="w-3.5 h-3.5" />
              Enviar para aprovação
            </button>

            {(!isCriticalType || perfil === 'Gestor') && (
              <button
                type="button"
                onClick={() => handleTriggerSave('ativa')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-[12.5px] font-semibold"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Ativar com vigência agendada
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
