import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Lock,
  ShieldAlert,
  Sparkles,
  Star,
} from 'lucide-react';
import { avaliarRegra, formatBRL } from '../../data/financeiroData';
import type { PerfilRegra, Regra } from '../../data/rulesData';
import type { AskAgentRequestPayload } from '../financeiro/AskAgentOrderDrawer';
import {
  AgentRegisteredTag,
  RuleAppliedChip,
} from '../financeiro/FinanceiroShared';
import type { QuoteCase, SupplierItem } from '../../data/manutencaoData';

interface ManutencaoTabOrcamentosProps {
  quotes: QuoteCase[];
  suppliers: SupplierItem[];
  rules: Regra[];
  perfil: PerfilRegra;
  readOnly: boolean;
  onOpenQuoteComparator: (quoteId: string) => void;
  onOpenRuleById: (ruleId: string) => void;
  onAskAgent: (req: AskAgentRequestPayload) => void;
}

type FilterMode =
  | 'todos'
  | 'gestor'
  | 'proprietario'
  | 'cotacao'
  | 'doc_vencendo';

export function ManutencaoTabOrcamentos({
  quotes,
  suppliers,
  rules,
  perfil,
  readOnly,
  onOpenQuoteComparator,
  onOpenRuleById,
  onAskAgent,
}: ManutencaoTabOrcamentosProps) {
  const [filterMode, setFilterMode] = useState<FilterMode>('todos');
  const isCorretor = perfil === 'Corretor';

  const scopedQuotes = useMemo(
    () => (isCorretor ? quotes.filter((q) => q.corretor === 'Rafael Costa') : quotes),
    [quotes, isCorretor]
  );

  const filteredQuotes = useMemo(() => {
    if (filterMode === 'gestor') return scopedQuotes.filter((q) => q.status === 'Aguardando Gestor');
    if (filterMode === 'proprietario')
      return scopedQuotes.filter((q) => q.status === 'Aguardando proprietário');
    if (filterMode === 'cotacao') return scopedQuotes.filter((q) => q.status === 'Em cotação');
    return scopedQuotes;
  }, [scopedQuotes, filterMode]);

  const filteredSuppliers = useMemo(() => {
    if (filterMode === 'doc_vencendo')
      return suppliers.filter((s) => s.situacao === 'Documento vencendo');
    return suppliers;
  }, [suppliers, filterMode]);

  const cards: { id: FilterMode; label: string; value: string; sub?: string; tone?: 'amber' | 'red' }[] = [
    {
      id: 'gestor',
      label: 'Aguardando aprovação do Gestor',
      value: '2',
      sub: isCorretor ? 'Alçada FIN-011' : 'R$ 6.530,00 (Contas a pagar)',
      tone: 'amber',
    },
    {
      id: 'proprietario',
      label: 'Aguardando autorização do proprietário',
      value: '1',
      sub: isCorretor ? 'MAN-004' : 'R$ 1.120,00 (MAN-004)',
      tone: 'amber',
    },
    { id: 'cotacao', label: 'Em cotação', value: '9', sub: 'MAN-003 v2' },
    { id: 'todos', label: 'Recebidos em 30 dias', value: '27', sub: 'Todos homologados' },
    { id: 'todos', label: 'Fornecedores homologados', value: '12', sub: 'Cadastro via agente' },
    { id: 'doc_vencendo', label: 'Com documento vencendo', value: '2', sub: 'Em 30 dias (JUR-013)', tone: 'red' },
  ];

  return (
    <div className="space-y-6">
      {/* 6 Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {cards.map((c, idx) => {
          const active = filterMode === c.id && idx !== 3 && idx !== 4;
          return (
            <button
              key={c.label}
              type="button"
              onClick={() => setFilterMode(active ? 'todos' : c.id)}
              className={`text-left rounded-xl border p-3.5 transition-colors ${
                active
                  ? 'border-[#2563EB] bg-blue-50/50'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="text-[11.5px] font-medium text-slate-600 leading-snug">{c.label}</div>
              <div
                className={`text-[21px] font-bold tabular-nums mt-1 ${
                  c.tone === 'red'
                    ? 'text-red-700'
                    : c.tone === 'amber'
                    ? 'text-amber-700'
                    : 'text-slate-900'
                }`}
              >
                {c.value}
              </div>
              {c.sub && <div className="text-[11px] text-slate-500 mt-0.5">{c.sub}</div>}
            </button>
          );
        })}
      </div>

      {/* Quick Comparators Banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="text-[13.5px] font-bold text-slate-900">
            Comparador ao vivo com 4 Portões (MAN-003 · MAN-004 · FIN-011)
          </div>
          <p className="text-[12px] text-slate-600">
            Os 2 orçamentos aguardando o Gestor (Acácias 120 R$ 2.350,00 e Cedro 57 R$ 4.180,00 = R$ 6.530,00) alimentam Contas a pagar e o desconto no repasse (conta de terceiros).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenQuoteComparator('orc-cedro-57')}
            className="px-3.5 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-[12px] font-semibold"
          >
            Comparar Cedro 57 (R$ 4.180)
          </button>
          <button
            type="button"
            onClick={() => onOpenQuoteComparator('orc-acacias-120')}
            className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-[12px] font-semibold"
          >
            Comparar Acácias 120 (R$ 2.350)
          </button>
        </div>
      </div>

      {/* Quotes Table */}
      <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-[14.5px] font-bold text-slate-900">
            Orçamentos em andamento ({filteredQuotes.length})
          </h3>
          {filterMode !== 'todos' && (
            <button
              type="button"
              onClick={() => setFilterMode('todos')}
              className="text-[12px] font-semibold text-[#2563EB] hover:underline"
            >
              Mostrar todos
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Fornecedor</th>
                <th className="px-4 py-2.5 font-semibold">Imóvel / Serviço</th>
                <th className="px-4 py-2.5 font-semibold">Pedido</th>
                <th className="px-4 py-2.5 font-semibold">Valor</th>
                <th className="px-4 py-2.5 font-semibold">Prazo</th>
                <th className="px-4 py-2.5 font-semibold">Portões (1–4)</th>
                <th className="px-4 py-2.5 font-semibold">Status</th>
                <th className="px-4 py-2.5 font-semibold text-right">Comparar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQuotes.map((q) => {
                const ev = avaliarRegra(
                  'orcamento',
                  {
                    valor: q.valorPrincipal,
                    emergencia: q.emergencia,
                    fornecedorHomologado: q.fornecedorHomologado,
                    qtdOrcamentos: q.qtdOrcamentos,
                    autorizacaoProprietario: q.autorizacaoProprietario,
                  },
                  rules
                );
                return (
                  <tr key={q.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{q.fornecedorPrincipal}</div>
                      <AgentRegisteredTag label={q.registeredBy} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{q.imovel}</div>
                      <div className="text-[11.5px] text-slate-600">{q.servico}</div>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-[#2563EB] whitespace-nowrap">
                      {q.protocolo}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900 tabular-nums whitespace-nowrap">
                      {isCorretor ? 'Restrito' : formatBRL(q.valorPrincipal)}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      Prev. {q.prazoDiasPrincipal} dia(s)
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {(ev.portoes ?? []).map((g, i) => (
                          <span
                            key={g.nome}
                            title={`${g.nome}: ${g.detalhe}`}
                            className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-[10px] font-bold border ${
                              g.status === 'ok'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : g.status === 'pendente'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                          >
                            {i + 1}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-semibold whitespace-nowrap ${
                          q.status === 'Aprovado'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : q.status === 'Aguardando Gestor'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {q.status === 'Aprovado' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : q.status === 'Aguardando Gestor' ? (
                          <AlertTriangle className="w-3 h-3" />
                        ) : (
                          <Lock className="w-3 h-3" />
                        )}
                        {q.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => onOpenQuoteComparator(q.id)}
                        className="px-3 py-1.5 rounded-lg bg-[#F3F0FF] hover:bg-[#EDE9FE] text-[#5B3FD0] text-[11.5px] font-semibold whitespace-nowrap"
                      >
                        Abrir comparador
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 12 Homologated Suppliers (NO "Novo fornecedor" button) */}
      <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-[14.5px] font-bold text-slate-900">
              Fornecedores homologados ({filteredSuppliers.length} de 12)
            </h3>
            <p className="text-[12px] text-slate-500">
              Homologação automática via documentos (CNPJ ou MEI, certidões, seguro quando aplicável; extração &lt; 85% vai para triagem JUR-013).
            </p>
          </div>
          {!readOnly && (
            <button
              type="button"
              onClick={() =>
                onAskAgent({
                  title: 'Pedir ao agente: homologar fornecedor a partir de documentos',
                  prefillText:
                    'Homologar novo fornecedor a partir do pacote documental (CNPJ ou MEI, certidões negativas e apólice de seguro quando aplicável); encaminhar ao Jurídico se confiança < 85% (MAN-003 / JUR-013).',
                  categoria: 'Manutenção e vistoria',
                  subtipo: 'Orçamento de reparo',
                  actionType: 'orcamento',
                  evalParams: {
                    valor: 1000,
                    fornecedorHomologado: false,
                    qtdOrcamentos: 1,
                    autorizacaoProprietario: true,
                  },
                })
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#5B3FD0] hover:bg-[#4C32B8] text-white text-[12px] font-semibold whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Pedir ao agente: homologar fornecedor a partir de documentos
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Fornecedor</th>
                <th className="px-4 py-2.5 font-semibold">Especialidade</th>
                <th className="px-4 py-2.5 font-semibold">Nota média</th>
                <th className="px-4 py-2.5 font-semibold">Prazo médio</th>
                <th className="px-4 py-2.5 font-semibold">Serviços 90d</th>
                <th className="px-4 py-2.5 font-semibold">Retrabalho</th>
                <th className="px-4 py-2.5 font-semibold">Documentos até</th>
                <th className="px-4 py-2.5 font-semibold">Situação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSuppliers.map((sup) => (
                <tr key={sup.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">{sup.nome}</div>
                    <div className="text-[11px] text-slate-500">
                      {sup.cnpjOuMei} · {sup.contatoMascarado}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{sup.especialidade}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 font-bold text-slate-900 tabular-nums">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      {sup.notaMedia.toFixed(1).replace('.', ',')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700 tabular-nums">{sup.prazoMedio}</td>
                  <td className="px-4 py-3 text-slate-700 tabular-nums">{sup.servicos90d}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`font-bold tabular-nums ${
                        sup.retrabalhoPct >= 15 ? 'text-red-700' : 'text-slate-800'
                      }`}
                    >
                      {sup.retrabalhoPct}%
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11.5px] text-slate-700">
                    {sup.documentosAte}
                  </td>
                  <td className="px-4 py-3">
                    {sup.situacao === 'Ativo' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        Ativo
                      </span>
                    ) : sup.situacao === 'Documento vencendo' ? (
                      <div className="space-y-0.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold">
                          <FileText className="w-3 h-3" />
                          Documento vencendo
                        </span>
                        {sup.alertaDetalhe && (
                          <div className="text-[10.5px] text-amber-800">{sup.alertaDetalhe}</div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 text-[11px] font-semibold">
                          <ShieldAlert className="w-3 h-3" />
                          Em alerta
                        </span>
                        {sup.alertaDetalhe && (
                          <div className="text-[10.5px] text-red-700">{sup.alertaDetalhe}</div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 bg-[#F8F9FB] border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11.5px] text-slate-600">
          <span>
            Regras aplicáveis: validação cadastral e certidões na contratação e renovação anual.
          </span>
          <div className="flex items-center gap-2">
            <RuleAppliedChip ruleId="MAN-003" versao={2} onOpenRule={onOpenRuleById} />
            <RuleAppliedChip ruleId="JUR-013" versao={3} onOpenRule={onOpenRuleById} />
          </div>
        </div>
      </section>
    </div>
  );
}
