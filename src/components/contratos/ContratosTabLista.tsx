import { useMemo, useState } from 'react';
import {
  Search,
  Eye,
  EyeOff,
  FileText,
  Sparkles,
  X,
  AlertTriangle,
  Bot,
  ShieldAlert,
} from 'lucide-react';
import { formatBRL, type FinanceSemaphore } from '../../data/financeiroData';
import type { PerfilRegra } from '../../data/rulesData';
import {
  INITIAL_CONTRACTS,
  type ContractItem,
} from '../../data/contratosData';
import type { AskAgentRequestPayload } from '../financeiro/AskAgentOrderDrawer';
import {
  AgentRegisteredTag,
  InlineOneClickCorrector,
  RuleAppliedChip,
  SemaphoreBadge,
} from '../financeiro/FinanceiroShared';

interface ContratosTabListaProps {
  perfil: PerfilRegra;
  readOnly: boolean;
  onAskAgent: (req: AskAgentRequestPayload) => void;
  onOpenRuleById: (ruleId: string) => void;
  onOpenOrderInCenter: (orderId: string) => void;
  onShowToast: (text: string) => void;
}

type StatusFilter =
  | 'todos'
  | 'Ativo'
  | 'Em renovação'
  | 'Em rescisão'
  | 'Em cobrança jurídica'
  | 'Sem garantia válida';

function getContractSemaphore(status: ContractItem['status']): {
  sem: FinanceSemaphore;
  label: string;
} {
  if (status === 'Ativo') return { sem: 'verde', label: 'Ativo' };
  if (status === 'Em renovação') return { sem: 'ambar', label: 'Em renovação' };
  if (status === 'Em rescisão') return { sem: 'ambar', label: 'Em rescisão' };
  if (status === 'Em cobrança jurídica') return { sem: 'vermelho', label: 'Cobrança jurídica' };
  return { sem: 'vermelho', label: 'Sem garantia' };
}

export function ContratosTabLista({
  perfil,
  readOnly,
  onAskAgent,
  onOpenRuleById,
  onOpenOrderInCenter,
  onShowToast,
}: ContratosTabListaProps) {
  const [contracts, setContracts] = useState<ContractItem[]>(INITIAL_CONTRACTS);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos');
  const [search, setSearch] = useState('');
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [revealedPiiIds, setRevealedPiiIds] = useState<Record<string, boolean>>({});
  const [piiAuditLog, setPiiAuditLog] = useState<Record<string, string[]>>({});

  // Role scoping:
  // - Corretor: only contracts of their properties (Rafael Costa), never legal cases
  // - Financeiro: only collection / rescission contracts (read-only)
  const scopedContracts = useMemo(() => {
    if (perfil === 'Corretor') {
      return contracts.filter(
        (c) =>
          c.corretorResponsavel === 'Rafael Costa' &&
          c.status !== 'Em cobrança jurídica'
      );
    }
    if (perfil === 'Financeiro') {
      return contracts.filter(
        (c) => c.status === 'Em cobrança jurídica' || c.status === 'Em rescisão'
      );
    }
    return contracts;
  }, [contracts, perfil]);

  const filteredContracts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return scopedContracts.filter((c) => {
      if (statusFilter !== 'todos' && c.status !== statusFilter) return false;
      if (!q) return true;
      return (
        c.numero.toLowerCase().includes(q) ||
        c.locatario.toLowerCase().includes(q) ||
        c.proprietario.toLowerCase().includes(q) ||
        c.imovel.toLowerCase().includes(q)
      );
    });
  }, [scopedContracts, statusFilter, search]);

  const selectedContract =
    scopedContracts.find((c) => c.id === selectedContractId) ?? null;

  const handleToggleRevealPii = (contractId: string, contractNumber: string) => {
    const isRevealed = !!revealedPiiIds[contractId];
    if (!isRevealed) {
      const now = new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const entry = `22/11/2026 ${now} · Perfil ${perfil} revelou CPF/RG/dados bancários (${contractNumber})`;
      setPiiAuditLog((prev) => ({
        ...prev,
        [contractId]: [entry, ...(prev[contractId] ?? [])],
      }));
      onShowToast(`Acesso LGPD registrado na trilha de auditoria (${contractNumber}).`);
    }
    setRevealedPiiIds((prev) => ({ ...prev, [contractId]: !isRevealed }));
  };

  const handleCorrectClause = (
    contractId: string,
    campo: string,
    newVal: string
  ) => {
    setContracts((prev) =>
      prev.map((c) =>
        c.id === contractId
          ? {
              ...c,
              registeredBy: `Registrado pelo agente, fonte: ${c.fonteArquivo} · corrigido por você`,
              clausulasChave: c.clausulasChave.map((cl) =>
                cl.campo === campo
                  ? { ...cl, valor: newVal, corrigidoPor: `${perfil} Farina` }
                  : cl
              ),
            }
          : c
      )
    );
    onShowToast(`Campo "${campo}" corrigido. A correção treina o agente.`);
  };

  const filterCards: {
    id: StatusFilter;
    label: string;
    countLabel: string;
    hiddenForRoles?: PerfilRegra[];
  }[] = [
    { id: 'Ativo', label: 'Ativos', countLabel: '384' },
    { id: 'Em renovação', label: 'Em renovação', countLabel: '29' },
    { id: 'Em rescisão', label: 'Em rescisão', countLabel: '3' },
    {
      id: 'Em cobrança jurídica',
      label: 'Em cobrança jurídica',
      countLabel: '3',
      hiddenForRoles: ['Corretor'],
    },
    { id: 'Sem garantia válida', label: 'Sem garantia válida', countLabel: '2' },
  ];

  return (
    <div className="space-y-5">
      {/* 5 Clickable status cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {filterCards
          .filter((fc) => !fc.hiddenForRoles?.includes(perfil))
          .map((card) => {
            const active = statusFilter === card.id;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => setStatusFilter(active ? 'todos' : card.id)}
                className={`text-left rounded-xl border p-3.5 transition-colors ${
                  active
                    ? 'border-[#2563EB] bg-blue-50/40'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="text-[11px] font-semibold text-slate-500">{card.label}</div>
                <div className="text-[20px] font-bold text-slate-900 tabular-nums mt-1">
                  {perfil === 'Gestor' || perfil === 'Jurídico'
                    ? card.countLabel
                    : scopedContracts.filter((c) => c.status === card.id).length}
                </div>
              </button>
            );
          })}
      </div>

      {/* Search & scope bar (NO "Novo contrato" / "Novo aditivo" / "Editar contrato" buttons) */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por número, imóvel, locatário ou proprietário..."
            className="w-full pl-9 pr-3 py-2 text-[13px] rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[12px] text-slate-500">
          {statusFilter !== 'todos' && (
            <button
              type="button"
              onClick={() => setStatusFilter('todos')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-slate-200"
            >
              Limpar filtro ({statusFilter})
            </button>
          )}
          <span className="tabular-nums">
            Exibindo {filteredContracts.length} de {perfil === 'Gestor' || perfil === 'Jurídico' ? '384' : scopedContracts.length} contratos
          </span>
        </div>
      </div>

      {/* Contracts table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {filteredContracts.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <FileText className="w-7 h-7 text-slate-300 mx-auto" />
            <p className="text-[14px] font-semibold text-slate-800">
              Nenhum contrato encontrado para este filtro
            </p>
            <p className="text-[12px] text-slate-500">
              Limpe a busca ou alterne o cartão de status acima. Novos contratos entram exclusivamente via pedidos ao agente.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead className="bg-[#F8F9FB] border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Contrato</th>
                  <th className="px-4 py-3 font-semibold">Tipo</th>
                  <th className="px-4 py-3 font-semibold">Imóvel</th>
                  <th className="px-4 py-3 font-semibold">Locatário / Proprietário</th>
                  <th className="px-4 py-3 font-semibold">Aluguel</th>
                  <th className="px-4 py-3 font-semibold">Vigência</th>
                  <th className="px-4 py-3 font-semibold">Garantia</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Ficha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredContracts.map((ct) => {
                  const sem = getContractSemaphore(ct.status);
                  return (
                    <tr
                      key={ct.id}
                      onClick={() => setSelectedContractId(ct.id)}
                      className="hover:bg-slate-50/80 cursor-pointer"
                    >
                      <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap tabular-nums">
                        {ct.numero}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{ct.tipo}</td>
                      <td className="px-4 py-3 text-slate-800 font-medium max-w-[200px] truncate" title={ct.imovel}>
                        {ct.imovel}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{ct.locatario}</div>
                        <div className="text-[11px] text-slate-500">Prop.: {ct.proprietario}</div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                        {ct.aluguel > 0 ? formatBRL(ct.aluguel) : 'Administração'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                        <div className="text-slate-800">{ct.vigenciaFim}</div>
                        <div className="text-[11px] text-slate-500">
                          {ct.diasParaVencimento <= 90 ? `em ${ct.diasParaVencimento}d` : `${ct.indice}`}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                        {ct.garantiaTipo}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <SemaphoreBadge
                          semaphore={sem.sem}
                          label={sem.label}
                          title={ct.statusDetalhe}
                        />
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedContractId(ct.id);
                          }}
                          className="text-[12px] font-semibold text-[#2563EB] hover:underline"
                        >
                          Abrir ficha
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FICHA DO CONTRATO DRAWER */}
      {selectedContract && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-[1px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ficha-contrato-title"
        >
          <div className="fixed inset-0" onClick={() => setSelectedContractId(null)} aria-hidden="true" />
          <div className="relative z-10 w-full max-w-2xl bg-white h-full border-l border-slate-200 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-4 shrink-0">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[12px] font-bold text-[#2563EB] tabular-nums">
                    {selectedContract.numero}
                  </span>
                  <SemaphoreBadge
                    semaphore={getContractSemaphore(selectedContract.status).sem}
                    label={selectedContract.status}
                  />
                  <span className="text-[11px] text-slate-500 tabular-nums">
                    Confiança de extração: {selectedContract.confiancaGeral}%
                  </span>
                </div>
                <h2 id="ficha-contrato-title" className="text-[17px] font-bold text-slate-900 mt-1">
                  {selectedContract.imovel} · {selectedContract.locatario}
                </h2>
                <p className="text-[12px] text-slate-500 mt-0.5">
                  {selectedContract.tipo} · Proprietário: {selectedContract.proprietario} · Corretor: {selectedContract.corretorResponsavel}
                </p>
                <div className="mt-1.5">
                  <AgentRegisteredTag label={selectedContract.registeredBy} />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedContractId(null)}
                aria-label="Fechar ficha"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* LGPD Masked PII Block */}
              <div className="rounded-xl border border-slate-200 bg-[#F8F9FB] p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-[#2563EB]" />
                    <span className="text-[13px] font-bold text-slate-900">
                      Dados pessoais e bancários (proteção LGPD)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleToggleRevealPii(selectedContract.id, selectedContract.numero)
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[12px] font-semibold text-slate-800"
                  >
                    {revealedPiiIds[selectedContract.id] ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        Ocultar dados
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        Revelar
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[12px]">
                  <div className="rounded-lg bg-white border border-slate-200 p-2.5">
                    <div className="text-[10px] font-semibold uppercase text-slate-400">
                      CPF do locatário
                    </div>
                    <div className="font-semibold text-slate-900 tabular-nums mt-0.5">
                      {revealedPiiIds[selectedContract.id]
                        ? selectedContract.locatarioCpfFull
                        : selectedContract.locatarioCpfMask}
                    </div>
                  </div>
                  <div className="rounded-lg bg-white border border-slate-200 p-2.5">
                    <div className="text-[10px] font-semibold uppercase text-slate-400">
                      RG do locatário
                    </div>
                    <div className="font-semibold text-slate-900 tabular-nums mt-0.5">
                      {revealedPiiIds[selectedContract.id]
                        ? selectedContract.locatarioRgFull
                        : selectedContract.locatarioRgMask}
                    </div>
                  </div>
                  <div className="rounded-lg bg-white border border-slate-200 p-2.5">
                    <div className="text-[10px] font-semibold uppercase text-slate-400">
                      Dados bancários (repasse)
                    </div>
                    <div className="font-semibold text-slate-900 tabular-nums mt-0.5">
                      {revealedPiiIds[selectedContract.id]
                        ? selectedContract.proprietarioBankFull
                        : selectedContract.proprietarioBankMask}
                    </div>
                  </div>
                </div>

                {(piiAuditLog[selectedContract.id] ?? []).length > 0 && (
                  <div className="text-[11px] text-slate-600 border-t border-slate-200 pt-2 space-y-0.5">
                    <span className="font-semibold text-slate-700">Registro de auditoria LGPD:</span>
                    {piiAuditLog[selectedContract.id].map((line, i) => (
                      <div key={i} className="tabular-nums">
                        {line}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Extracted Clauses with 1-click Corrigir */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-[13px] font-bold text-slate-900">
                    Cláusulas extraídas pelo agente
                  </h3>
                  <span className="text-[11px] text-[#5B3FD0] font-medium">
                    A correção treina o agente (sem edição livre de minuta)
                  </span>
                </div>
                <div className="divide-y divide-slate-100">
                  {selectedContract.clausulasChave.map((cl) => (
                    <div
                      key={cl.campo}
                      className="py-2.5 flex flex-wrap items-center justify-between gap-2 text-[12px]"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-slate-900">
                          {cl.campo}: <span className="font-normal text-slate-800">{cl.valor}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2 mt-0.5">
                          <span>Registrado pelo agente, fonte: {cl.fonte}</span>
                          <span className="tabular-nums">· Confiança {cl.confianca}%</span>
                          {cl.corrigidoPor && (
                            <span className="text-emerald-700 font-medium">
                              · Corrigido por {cl.corrigidoPor}
                            </span>
                          )}
                        </div>
                      </div>
                      {!readOnly && (
                        <InlineOneClickCorrector
                          value={cl.valor}
                          ariaLabel={`Corrigir ${cl.campo}`}
                          onSave={(nextVal) =>
                            handleCorrectClause(selectedContract.id, cl.campo, nextVal)
                          }
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Rules & Linked Orders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5">
                  <h4 className="text-[12px] font-bold text-slate-900">Regras aplicáveis</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedContract.regrasAplicaveis.map((rg) => (
                      <RuleAppliedChip
                        key={rg.ruleId}
                        ruleId={rg.ruleId}
                        versao={rg.versao}
                        onOpenRule={(id) => {
                          setSelectedContractId(null);
                          onOpenRuleById(id);
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5">
                  <h4 className="text-[12px] font-bold text-slate-900">Pedidos ligados</h4>
                  {selectedContract.pedidosRelacionados.length === 0 ? (
                    <p className="text-[12px] text-slate-500">Nenhum pedido aberto no ciclo atual.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {selectedContract.pedidosRelacionados.map((ped) => (
                        <button
                          key={ped.orderId}
                          type="button"
                          onClick={() => {
                            setSelectedContractId(null);
                            onOpenOrderInCenter(ped.orderId);
                          }}
                          className="w-full text-left text-[12px] rounded-lg border border-slate-200 hover:bg-slate-50 px-2.5 py-1.5"
                        >
                          <span className="font-bold text-[#2563EB]">{ped.protocol}</span>
                          <span className="text-slate-600 ml-1.5">{ped.resumo}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline & Documents */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5">
                  <h4 className="text-[12px] font-bold text-slate-900">Linha do tempo</h4>
                  <ul className="space-y-2 text-[12px]">
                    {selectedContract.timeline.map((ev, idx) => (
                      <li key={idx} className="border-l-2 border-slate-200 pl-2.5">
                        <div className="text-[11px] font-semibold text-slate-500 tabular-nums">
                          {ev.data} · {ev.ator}
                        </div>
                        <div className="text-slate-800">{ev.evento}</div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5">
                  <h4 className="text-[12px] font-bold text-slate-900">Documentos e reajustes</h4>
                  <ul className="space-y-1.5 text-[12px]">
                    {selectedContract.documentosAnexos.map((doc) => (
                      <li key={doc.nome} className="flex items-center justify-between gap-2">
                        <span className="text-slate-800 truncate">{doc.nome}</span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                            doc.status === 'Validado'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : doc.status === 'Pendente'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          {doc.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {selectedContract.historicoReajustes.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 space-y-1">
                      <span className="font-semibold text-slate-800">Últimos reajustes:</span>
                      {selectedContract.historicoReajustes.map((r) => (
                        <div key={r.competencia} className="tabular-nums">
                          {r.competencia} ({r.indice}): {formatBRL(r.antes)} →{' '}
                          <strong>{formatBRL(r.depois)}</strong>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {selectedContract.acaoJudicial && (
                <div className="rounded-xl border border-red-200 bg-red-50/70 p-3.5 flex items-start gap-2.5 text-[12px] text-red-900">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Ação judicial em andamento:</strong> qualquer rescisão ou acordo neste contrato aciona o conflito{' '}
                    <strong>JUR-007 × FIN-014</strong> e exige aprovação obrigatória do Jurídico.
                  </div>
                </div>
              )}
            </div>

            {/* Footer: Pedir ao agente actions only */}
            <div className="px-6 py-4 border-t border-slate-200 bg-[#F8F9FB] flex flex-wrap items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedContractId(null)}
                className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-[12px] font-semibold text-slate-700"
              >
                Fechar
              </button>
              {readOnly ? (
                <span className="text-[11px] font-medium text-slate-500">
                  Visualização somente leitura no perfil Financeiro
                </span>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onAskAgent({
                        title: `Renovar contrato · ${selectedContract.numero}`,
                        prefillText: `Preparar minuta de renovação do contrato ${selectedContract.numero} (${selectedContract.imovel} · ${selectedContract.locatario}) seguindo o modelo aprovado e regra JUR-002.`,
                        categoria: 'Locação e contratos',
                        subtipo: 'Renovação',
                        actionType: 'preparar_renovacao',
                        evalParams: { diasParaVencimento: selectedContract.diasParaVencimento },
                      })
                    }
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-[#5B3FD0] hover:bg-[#4c33b8] text-white text-[12px] font-semibold"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Pedir ao agente: renovar
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onAskAgent({
                        title: `Aplicar reajuste · ${selectedContract.numero}`,
                        prefillText: `Calcular e sugerir reajuste anual pelo índice ${selectedContract.indice} para o contrato ${selectedContract.numero} (${selectedContract.locatario}).`,
                        categoria: 'Locação e contratos',
                        subtipo: 'Reajuste anual',
                        actionType: 'reajuste_anual',
                        evalParams: {},
                      })
                    }
                    className="px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[12px] font-semibold text-slate-700"
                  >
                    Aplicar reajuste
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onAskAgent({
                        title: `2ª via do contrato · ${selectedContract.numero}`,
                        prefillText: `Enviar 2ª via autenticada do contrato ${selectedContract.numero} (${selectedContract.imovel}) para ${selectedContract.locatario} e proprietário ${selectedContract.proprietario}.`,
                        categoria: 'Jurídico e documentos',
                        subtipo: 'Análise documental',
                        actionType: 'documento',
                        evalParams: { documentoFaltando: false },
                      })
                    }
                    className="px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[12px] font-semibold text-slate-700"
                  >
                    2ª via
                  </button>
                  {perfil !== 'Corretor' && (
                    <button
                      type="button"
                      onClick={() =>
                        onAskAgent({
                          title: `Iniciar rescisão · ${selectedContract.numero}`,
                          prefillText: `Calcular multa proporcional e montar termo de rescisão do contrato ${selectedContract.numero} (${selectedContract.locatario} · ${selectedContract.imovel}).`,
                          categoria: 'Locação e contratos',
                          subtipo: 'Rescisão',
                          actionType: 'rescisao',
                          evalParams: { acaoJudicial: selectedContract.acaoJudicial },
                          requiresExtraConfirmation: true,
                          extraConfirmationText:
                            'Confirmar início de rescisão? Impacta repasse ao proprietário e vacância do imóvel.',
                        })
                      }
                      className="px-3 py-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-[12px] font-semibold text-red-700"
                    >
                      Iniciar rescisão
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
