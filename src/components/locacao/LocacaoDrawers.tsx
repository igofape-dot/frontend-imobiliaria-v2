import { useEffect, useState } from 'react';
import {
  X,
  Building2,
  Sliders,
  Sparkles,
  Eye,
  EyeOff,
  Lock,
  Pencil,
  Check,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Bot,
  ExternalLink,
} from 'lucide-react';
import {
  avaliarRegra,
  formatBRL,
} from '../../data/financeiroData';
import type { PerfilRegra, Regra } from '../../data/rulesData';
import {
  CALCULATION_HUMAN_CHECK_LABEL,
  ESTIMATE_COMPARABLES_LABEL,
  formatPctBR,
  type PropertyPortfolioItem,
  type VacantPropertyItem,
} from '../../data/locacaoData';
import type { AskAgentRequestPayload } from '../financeiro/AskAgentOrderDrawer';
import {
  AgentRegisteredTag,
  PolicyModeBadge,
  RuleAppliedChip,
} from '../financeiro/FinanceiroShared';

export function PropertyFichaDrawer({
  property,
  rules,
  perfil,
  readOnly,
  onClose,
  onCorrectProperty,
  onOpenRuleById,
  onAskAgent,
  onNavigateModule,
  onShowToast,
}: {
  property: PropertyPortfolioItem | null;
  rules: Regra[];
  perfil: PerfilRegra;
  readOnly?: boolean;
  onClose: () => void;
  onCorrectProperty: (id: string, updates: Partial<PropertyPortfolioItem>) => void;
  onOpenRuleById: (ruleId: string) => void;
  onAskAgent: (req: AskAgentRequestPayload) => void;
  onNavigateModule: (navId: 'manutencao-vistorias' | 'contratos-juridico' | 'financeiro') => void;
  onShowToast: (msg: string) => void;
}) {
  const [lgpdRevealed, setLgpdRevealed] = useState(false);
  const [revealAuditTime, setRevealAuditTime] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<'metragem' | 'titulo' | 'descricao' | null>(null);
  const [draftMetragem, setDraftMetragem] = useState('');
  const [draftTitulo, setDraftTitulo] = useState('');
  const [draftDescricao, setDraftDescricao] = useState('');

  useEffect(() => {
    setLgpdRevealed(false);
    setRevealAuditTime(null);
    setEditingField(null);
    if (property) {
      setDraftMetragem(String(property.metragemM2));
      setDraftTitulo(property.tituloAnuncio);
      setDraftDescricao(property.descricaoAnuncio);
    }
  }, [property]);

  useEffect(() => {
    if (!property) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [property, onClose]);

  if (!property) return null;

  const isCorretor = perfil === 'Corretor';
  const camposCompletos =
    property.tituloAnuncio.length > 10 &&
    property.tituloAnuncio.length <= 70 &&
    property.descricaoAnuncio.length > 20 &&
    property.descricaoAnuncio.length <= 800 &&
    property.metragemM2 > 0 &&
    property.aluguelValor > 0;
  const imovelPronto = property.situacao !== 'Em vistoria/reparo' && property.situacao !== 'Em rescisão';

  const evalAnuncio = avaliarRegra(
    'publicar_anuncio',
    {
      fotosCount: property.fotosCount,
      camposAnuncioCompletos: camposCompletos,
      autorizacaoDivulgacao: property.autorizacaoDivulgacao,
      imovelPronto,
    },
    rules
  );

  const handleToggleReveal = () => {
    if (isCorretor) return;
    if (!lgpdRevealed) {
      const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      setRevealAuditTime(`Revelado em 22/11/2026 às ${now} por ${perfil} (trilha LGPD registrada)`);
      setLgpdRevealed(true);
    } else {
      setLgpdRevealed(false);
    }
  };

  const saveCorrection = (field: 'metragem' | 'titulo' | 'descricao') => {
    if (readOnly) return;
    if (field === 'metragem') {
      const num = Number(draftMetragem);
      if (!Number.isFinite(num) || num <= 0) return;
      onCorrectProperty(property.id, {
        metragemM2: num,
        registeredBy: `${property.registeredBy} · corrigido por você`,
      });
    } else if (field === 'titulo') {
      const clean = draftTitulo.trim().slice(0, 70);
      if (!clean) return;
      onCorrectProperty(property.id, {
        tituloAnuncio: clean,
        registeredBy: `${property.registeredBy} · corrigido por você`,
      });
    } else {
      const clean = draftDescricao.trim().slice(0, 800);
      if (!clean) return;
      onCorrectProperty(property.id, {
        descricaoAnuncio: clean,
        registeredBy: `${property.registeredBy} · corrigido por você`,
      });
    }
    setEditingField(null);
    onShowToast('Correção registrada · A correção treina o agente');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ficha-imovel-title"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-2xl bg-white h-full border-l border-slate-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-start gap-3">
            <span className="w-9 h-9 rounded-lg bg-[#EFF4FF] text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5">
              <Building2 className="w-4 h-4" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[12px] font-bold text-[#2563EB]">
                  {property.codigo}
                </span>
                <span className="px-2 py-0.5 rounded-md border border-slate-200 bg-slate-50 text-slate-700 text-[11px] font-semibold">
                  {property.situacao}
                </span>
              </div>
              <h2 id="ficha-imovel-title" className="text-[16px] font-bold text-slate-900 mt-0.5">
                {property.endereco}
              </h2>
              <p className="text-[12px] text-slate-500">
                {property.regiao} · {property.tipo} · Corretor: {property.corretor}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar ficha do imóvel"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Extraction & 1-click correction banner */}
          <div className="rounded-xl border border-slate-200 bg-[#F8F9FB] p-3.5 space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <AgentRegisteredTag label={property.registeredBy} />
              <span className="text-[11px] font-semibold text-slate-600 tabular-nums">
                Confiança da extração: {property.extracaoConfianca}%
              </span>
            </div>
            <p className="text-[11.5px] text-slate-500">
              Qualquer campo extraído pode ser ajustado em 1 clique — <strong>A correção treina o agente</strong>.
            </p>
          </div>

          {/* Core Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="text-[11px] text-slate-500 flex items-center justify-between">
                <span>Metragem</span>
                {!readOnly && editingField !== 'metragem' && (
                  <button
                    type="button"
                    onClick={() => setEditingField('metragem')}
                    className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#2563EB] hover:underline"
                  >
                    <Pencil className="w-3 h-3" />
                    Corrigir
                  </button>
                )}
              </div>
              {editingField === 'metragem' ? (
                <div className="mt-1 flex items-center gap-1">
                  <input
                    type="number"
                    value={draftMetragem}
                    onChange={(e) => setDraftMetragem(e.target.value)}
                    className="w-16 px-1.5 py-0.5 border border-[#2563EB] rounded text-[13px] tabular-nums"
                  />
                  <button
                    type="button"
                    onClick={() => saveCorrection('metragem')}
                    className="p-1 rounded bg-[#2563EB] text-white"
                    aria-label="Salvar metragem"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="text-[15px] font-bold text-slate-900 mt-0.5 tabular-nums">
                  {property.metragemM2} m²
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="text-[11px] text-slate-500">Aluguel</div>
              <div className="text-[15px] font-bold text-slate-900 mt-0.5 tabular-nums">
                {formatBRL(property.aluguelValor)}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="text-[11px] text-slate-500">Cond. + IPTU</div>
              <div className="text-[15px] font-bold text-slate-900 mt-0.5 tabular-nums">
                {formatBRL(property.condominioIptu)}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="text-[11px] text-slate-500">Taxa adm.</div>
              <div className="text-[15px] font-bold text-slate-900 mt-0.5 tabular-nums">
                {isCorretor ? 'Restrito' : `${property.taxaAdmPct}%`}
              </div>
            </div>
          </div>

          {/* Proprietário + LGPD */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-[13px] font-bold text-slate-900">
                Proprietário e contrato de administração
              </h3>
              {!isCorretor && (
                <button
                  type="button"
                  onClick={handleToggleReveal}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-[#F8F9FB] hover:bg-slate-100 text-[11.5px] font-semibold text-slate-700"
                >
                  {lgpdRevealed ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      Ocultar LGPD
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      Revelar
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[12.5px]">
              <div>
                <span className="text-slate-500">Proprietário:</span>{' '}
                <strong className="text-slate-900">{property.proprietario}</strong>
              </div>
              <div>
                <span className="text-slate-500">Contrato ativo:</span>{' '}
                <strong className="text-slate-900">
                  {property.contratoNum
                    ? `${property.contratoNum} (vence ${property.vencimentoContrato})`
                    : 'Sem contrato vigente'}
                </strong>
              </div>
              {isCorretor ? (
                <div className="sm:col-span-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] text-slate-600 flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>
                    Dados financeiros e bancários do proprietário são restritos ao perfil Gestor/Financeiro.
                  </span>
                </div>
              ) : (
                <>
                  <div>
                    <span className="text-slate-500">CPF/CNPJ:</span>{' '}
                    <span className="font-mono text-slate-800">
                      {lgpdRevealed ? property.proprietarioCpfReal : property.proprietarioCpfMascarado}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Dados bancários:</span>{' '}
                    <span className="font-mono text-slate-800">
                      {lgpdRevealed ? property.proprietarioBancoReal : property.proprietarioBancoMascarado}
                    </span>
                  </div>
                </>
              )}
            </div>

            {revealAuditTime && (
              <p className="text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
                {revealAuditTime}
              </p>
            )}
          </div>

          {/* Anúncio nos portais + Checklist LOC-002 */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-[13px] font-bold text-slate-900">
                  Anúncio e checklist de publicação
                </h3>
                <p className="text-[11.5px] text-slate-500">
                  {property.fotosCount} fotos · Autorização:{' '}
                  {property.autorizacaoDivulgacao ? 'Registrada' : 'Pendente'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <PolicyModeBadge modo={evalAnuncio.modo} />
                <RuleAppliedChip
                  ruleId="LOC-002"
                  versao={evalAnuncio.versao}
                  onOpenRule={onOpenRuleById}
                />
              </div>
            </div>

            {/* Título ≤ 70 */}
            <div className="rounded-lg border border-slate-200 bg-[#F8F9FB] p-3 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-semibold">Título do anúncio (máx. 70 caracteres)</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono tabular-nums">
                    {(editingField === 'titulo' ? draftTitulo : property.tituloAnuncio).length}/70
                  </span>
                  {!readOnly && editingField !== 'titulo' && (
                    <button
                      type="button"
                      onClick={() => setEditingField('titulo')}
                      className="text-[#2563EB] font-semibold hover:underline"
                    >
                      Corrigir
                    </button>
                  )}
                </div>
              </div>
              {editingField === 'titulo' ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={70}
                    value={draftTitulo}
                    onChange={(e) => setDraftTitulo(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 text-[12.5px] rounded-lg border border-[#2563EB] bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => saveCorrection('titulo')}
                    className="px-2.5 py-1.5 rounded-lg bg-[#2563EB] text-white text-[12px] font-semibold"
                  >
                    Salvar
                  </button>
                </div>
              ) : (
                <p className="text-[12.5px] font-medium text-slate-900">{property.tituloAnuncio}</p>
              )}
            </div>

            {/* Descrição ≤ 800 */}
            <div className="rounded-lg border border-slate-200 bg-[#F8F9FB] p-3 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-semibold">Descrição nos portais (máx. 800 caracteres)</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono tabular-nums">
                    {(editingField === 'descricao' ? draftDescricao : property.descricaoAnuncio).length}/800
                  </span>
                  {!readOnly && editingField !== 'descricao' && (
                    <button
                      type="button"
                      onClick={() => setEditingField('descricao')}
                      className="text-[#2563EB] font-semibold hover:underline"
                    >
                      Corrigir
                    </button>
                  )}
                </div>
              </div>
              {editingField === 'descricao' ? (
                <div className="space-y-2">
                  <textarea
                    rows={3}
                    maxLength={800}
                    value={draftDescricao}
                    onChange={(e) => setDraftDescricao(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-[12.5px] rounded-lg border border-[#2563EB] bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => saveCorrection('descricao')}
                    className="px-2.5 py-1 rounded-lg bg-[#2563EB] text-white text-[12px] font-semibold"
                  >
                    Salvar texto
                  </button>
                </div>
              ) : (
                <p className="text-[12px] text-slate-700 leading-relaxed">{property.descricaoAnuncio}</p>
              )}
            </div>

            {evalAnuncio.modo === 'bloqueado' && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-950">
                {evalAnuncio.motivo}
              </div>
            )}
          </div>

          {/* Histórico de locações e manutenções */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
              <h3 className="text-[12.5px] font-bold text-slate-900">Histórico de locações</h3>
              {property.historicoLocacoes.length === 0 ? (
                <p className="text-[12px] text-slate-500">Sem contratos anteriores registrados.</p>
              ) : (
                <ul className="space-y-2 text-[12px]">
                  {property.historicoLocacoes.map((h, i) => (
                    <li key={i} className="border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                      <div className="font-semibold text-slate-800">{h.inquilino}</div>
                      <div className="text-slate-500 tabular-nums">
                        {h.periodo} · {formatBRL(h.valor)}
                      </div>
                      {h.motivoSaida && (
                        <div className="text-[11px] text-slate-500">Saída: {h.motivoSaida}</div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-[12.5px] font-bold text-slate-900">Manutenções e vistorias</h3>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateModule('manutencao-vistorias');
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2563EB] hover:underline"
                >
                  <span>Abrir módulo</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
              {property.manutencoesHistorico.length === 0 ? (
                <p className="text-[12px] text-slate-500">Nenhuma manutenção aberta.</p>
              ) : (
                <ul className="space-y-2 text-[12px]">
                  {property.manutencoesHistorico.map((m, i) => (
                    <li key={i} className="border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                      <div className="font-semibold text-slate-800">{m.descricao}</div>
                      <div className="text-slate-500 tabular-nums">
                        {m.data} · {formatBRL(m.valor)} · {m.status}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg border border-slate-200 text-[12.5px] font-medium text-slate-700 hover:bg-slate-50"
          >
            Fechar
          </button>

          {!readOnly && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAskAgent({
                    title: `Publicar ou atualizar anúncio · ${property.codigo}`,
                    prefillText: `Validar checklist LOC-002 (${property.fotosCount} fotos, autorização e status ${property.situacao}) e publicar/atualizar ${property.endereco} nos portais.`,
                    categoria: 'Cadastro e atualização',
                    subtipo: 'Cadastro de imóvel',
                    actionType: 'publicar_anuncio',
                    evalParams: {
                      fotosCount: property.fotosCount,
                      camposAnuncioCompletos: camposCompletos,
                      autorizacaoDivulgacao: property.autorizacaoDivulgacao,
                      imovelPronto,
                    },
                    links: [{ type: 'Imóvel', code: property.codigo, label: property.endereco }],
                  });
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#5B3FD0] hover:bg-[#4C32B8] text-white text-[12.5px] font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pedir ao agente: publicar/atualizar anúncio</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function PriceSimulatorDrawer({
  target,
  rules,
  readOnly,
  onClose,
  onOpenRuleById,
  onAskAgent,
}: {
  target: VacantPropertyItem | null;
  rules: Regra[];
  readOnly?: boolean;
  onClose: () => void;
  onOpenRuleById: (ruleId: string) => void;
  onAskAgent: (req: AskAgentRequestPayload) => void;
}) {
  const [novoValor, setNovoValor] = useState<number>(0);
  const [hasOwnerAuth, setHasOwnerAuth] = useState<boolean>(true);
  const [confirmBigDrop, setConfirmBigDrop] = useState<boolean>(false);

  useEffect(() => {
    if (!target) return;
    setNovoValor(target.valorSugerido || target.valorPedido);
    setHasOwnerAuth(target.autorizacaoProprietario);
    setConfirmBigDrop(false);
  }, [target]);

  useEffect(() => {
    if (!target) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [target, onClose]);

  if (!target) return null;

  const minSlider = Math.round(target.valorPedido * 0.75);
  const maxSlider = Math.round(target.valorPedido * 1.1);
  const variacaoPct = Number(
    (((novoValor - target.valorPedido) / target.valorPedido) * 100).toFixed(1)
  );
  const absVar = Math.abs(variacaoPct);
  const diffMercadoNovo = Number(
    (((novoValor - target.estimativaMercado) / target.estimativaMercado) * 100).toFixed(1)
  );

  const taxaAntes = target.valorPedido * 0.09;
  const liquidoAntes = target.valorPedido - taxaAntes;
  const taxaDepois = novoValor * 0.09;
  const liquidoDepois = novoValor - taxaDepois;
  const diferencaMensalLiquida = target.valorPedido - novoValor;

  // Break-even: comparing closing now at novoValor vs waiting 1 more vacant month to get target.valorPedido
  const breakEvenMeses =
    diferencaMensalLiquida > 0
      ? Math.max(1, Math.round(liquidoDepois / diferencaMensalLiquida))
      : null;

  const evalPreco = avaliarRegra(
    'ajustar_preco',
    {
      variacaoPct: absVar,
      semAutorizacaoProprietario: !hasOwnerAuth,
    },
    rules
  );

  const isDropOver10 = variacaoPct < -10;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="price-sim-title"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-2xl bg-white h-full border-l border-slate-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-start gap-3">
            <span className="w-9 h-9 rounded-lg bg-[#F3F0FF] text-[#5B3FD0] flex items-center justify-center shrink-0 mt-0.5">
              <Sliders className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[12px] font-bold text-[#2563EB]">
                  {target.codigo}
                </span>
                <span className="text-[11px] font-medium text-slate-500">
                  {target.diasVago} dias vago · {target.visitas30d} visita(s) em 30d
                </span>
              </div>
              <h2 id="price-sim-title" className="text-[16px] font-bold text-slate-900">
                Simulador de preço · {target.imovel}
              </h2>
              <p className="text-[12px] text-slate-500 mt-0.5">
                Proprietário: {target.proprietario} · {ESTIMATE_COMPARABLES_LABEL} ({target.comparaveisQtd} imóveis · conf. {target.confiancaMercadoPct}%)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar simulador"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Slider & Value Input */}
          <div className="rounded-xl border border-slate-200 bg-[#F8F9FB] p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <label htmlFor="sim-valor-range" className="text-[13px] font-bold text-slate-900">
                  Novo valor pedido simulado
                </label>
                <p className="text-[11.5px] text-slate-500">
                  Valor atual: <strong className="tabular-nums">{formatBRL(target.valorPedido)}</strong> · Estimativa mercado:{' '}
                  <strong className="tabular-nums">{formatBRL(target.estimativaMercado)}</strong>
                </p>
              </div>
              <div className="text-right">
                <div className="text-[22px] font-bold text-slate-900 tabular-nums">
                  {formatBRL(novoValor)}
                </div>
                <div
                  className={`text-[12px] font-semibold tabular-nums ${
                    variacaoPct < 0 ? 'text-[#2563EB]' : 'text-amber-700'
                  }`}
                >
                  Variação: {formatPctBR(variacaoPct, true)}
                </div>
              </div>
            </div>

            <input
              id="sim-valor-range"
              type="range"
              min={minSlider}
              max={maxSlider}
              step={10}
              value={novoValor}
              onChange={(e) => setNovoValor(Number(e.target.value))}
              className="w-full accent-[#2563EB]"
            />

            <div className="flex flex-wrap items-center gap-2">
              {[-5, -8.2, -12, -16].map((pct) => {
                const candidateVal = Math.round((target.valorPedido * (1 + pct / 100)) / 10) * 10;
                return (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setNovoValor(candidateVal)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11.5px] font-semibold text-slate-700 tabular-nums"
                  >
                    {pct}% ({formatBRL(candidateVal)})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Impact breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
              <div className="text-[11px] text-slate-500">Posição vs. mercado</div>
              <div className="text-[16px] font-bold text-slate-900 mt-0.5 tabular-nums">
                {formatPctBR(diffMercadoNovo, true)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Antes: {formatPctBR(target.diferencaPct, true)} · {ESTIMATE_COMPARABLES_LABEL}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
              <div className="text-[11px] text-slate-500">Líquido proprietário (após 9%)</div>
              <div className="text-[16px] font-bold text-slate-900 mt-0.5 tabular-nums">
                {formatBRL(liquidoDepois)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
                Antes: {formatBRL(liquidoAntes)} · Taxa: {formatBRL(taxaDepois)}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
              <div className="text-[11px] text-slate-500">Ponto de equilíbrio</div>
              <div className="text-[16px] font-bold text-slate-900 mt-0.5 tabular-nums">
                {breakEvenMeses ? `${breakEvenMeses} meses` : 'Sem perda'}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Alugar agora vs. ficar mais 1 mês vago
              </div>
            </div>
          </div>

          {/* Authorization check */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[12.5px] font-bold text-slate-900">
                Autorização do proprietário ({target.proprietario})
              </span>
              <button
                type="button"
                onClick={() => setHasOwnerAuth((v) => !v)}
                className={`px-2.5 py-1 rounded-lg border text-[11.5px] font-semibold ${
                  hasOwnerAuth
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-red-200 bg-red-50 text-red-700'
                }`}
              >
                {hasOwnerAuth
                  ? `Registrada (até -${target.autorizacaoAtePct ?? 10}%)`
                  : 'Ausente (simular bloqueio LOC-001)'}
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <PolicyModeBadge modo={evalPreco.modo} />
                <span className="text-[12.5px] font-semibold text-slate-900">
                  {evalPreco.resultadoTexto}
                </span>
              </div>
              <RuleAppliedChip
                ruleId={evalPreco.regraId}
                versao={evalPreco.versao}
                onOpenRule={onOpenRuleById}
              />
            </div>

            <p className="text-[12px] text-slate-600 leading-relaxed">{evalPreco.motivo}</p>
          </div>

          {isDropOver10 && hasOwnerAuth && (
            <label className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmBigDrop}
                onChange={(e) => setConfirmBigDrop(e.target.checked)}
                className="mt-0.5 rounded border-amber-400 text-[#2563EB]"
              />
              <span className="text-[12px] text-amber-950 leading-snug">
                Confirmo a redução superior a 10% ({formatPctBR(variacaoPct, true)}, de{' '}
                {formatBRL(target.valorPedido)} para {formatBRL(novoValor)}) ciente do impacto mensal no líquido do proprietário e na taxa de administração.
              </span>
            </label>
          )}

          <div className="rounded-lg border border-slate-200 bg-[#F8F9FB] px-3 py-2 flex items-center gap-2 text-[11.5px] text-slate-600">
            <Bot className="w-3.5 h-3.5 text-[#5B3FD0] shrink-0" />
            <span>{CALCULATION_HUMAN_CHECK_LABEL}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg border border-slate-200 text-[12.5px] font-medium text-slate-700 hover:bg-slate-50"
          >
            Fechar
          </button>

          {!readOnly && (
            <div className="flex flex-wrap items-center gap-2">
              {!hasOwnerAuth ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onAskAgent({
                      title: `Solicitar autorização ao proprietário · ${target.codigo}`,
                      prefillText: `Solicitar autorização formal via WhatsApp ao proprietário ${target.proprietario} para reduzir o aluguel pedido de ${target.imovel} de ${formatBRL(target.valorPedido)} para ${formatBRL(novoValor)} (${formatPctBR(variacaoPct, true)}), anexando comparáveis.`,
                      categoria: 'Vendas e captação',
                      subtipo: 'Ajuste de preço',
                      actionType: 'ajustar_preco',
                      evalParams: { apenasSugerirPreco: true, variacaoPct: absVar },
                      links: [{ type: 'Imóvel', code: target.codigo, label: target.imovel }],
                    });
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#5B3FD0] hover:bg-[#4C32B8] text-white text-[12.5px] font-semibold"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Pedir ao agente: solicitar autorização ao proprietário</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isDropOver10 && !confirmBigDrop}
                  onClick={() => {
                    onClose();
                    onAskAgent({
                      title: `Aplicar ajuste de preço · ${target.codigo}`,
                      prefillText: `Ajustar aluguel pedido de ${target.imovel} (${target.codigo}) de ${formatBRL(target.valorPedido)} para ${formatBRL(novoValor)} (${formatPctBR(variacaoPct, true)}) com autorização de ${target.proprietario} e atualizar portais.`,
                      categoria: 'Vendas e captação',
                      subtipo: 'Ajuste de preço',
                      actionType: 'ajustar_preco',
                      evalParams: {
                        variacaoPct: absVar,
                        semAutorizacaoProprietario: false,
                      },
                      links: [{ type: 'Imóvel', code: target.codigo, label: target.imovel }],
                    });
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#5B3FD0] hover:bg-[#4C32B8] disabled:opacity-50 text-white text-[12.5px] font-semibold"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Pedir ao agente: aplicar novo valor</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
