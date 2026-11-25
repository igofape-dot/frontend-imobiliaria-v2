import { useMemo, useState } from 'react';
import {
  Search,
  Sparkles,
  CheckCircle2,
  Clock,
  FileText,
  Send,
} from 'lucide-react';
import {
  RECEIVABLES_SUMMARY,
  formatBRL,
  formatBRLCompact,
  type GuaranteeType,
  type PaymentMethod,
  type ReceivableItem,
  type ReceivableStatus,
} from '../../data/financeiroData';
import type { AskAgentRequestPayload } from './AskAgentOrderDrawer';
import {
  AgentRegisteredTag,
  InlineOneClickCorrector,
  SemaphoreBadge,
} from './FinanceiroShared';

interface FinanceiroTabReceberProps {
  items: ReceivableItem[];
  onCorrectReceivableValue: (id: string, newVal: number) => void;
  onAskAgent: (payload: AskAgentRequestPayload) => void;
  onSwitchToInadimplencia: () => void;
}

type CardFilter = 'todos' | ReceivableStatus;

export function FinanceiroTabReceber({
  items,
  onCorrectReceivableValue,
  onAskAgent,
  onSwitchToInadimplencia,
}: FinanceiroTabReceberProps) {
  const [cardFilter, setCardFilter] = useState<CardFilter>('todos');
  const [search, setSearch] = useState('');
  const [formaFilter, setFormaFilter] = useState<'todas' | PaymentMethod>('todas');
  const [garantiaFilter, setGarantiaFilter] = useState<'todas' | GuaranteeType>('todas');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (cardFilter !== 'todos' && item.status !== cardFilter) return false;
      if (formaFilter !== 'todas' && item.forma !== formaFilter) return false;
      if (garantiaFilter !== 'todas' && item.garantia !== garantiaFilter) return false;
      if (
        q &&
        !item.inquilino.toLowerCase().includes(q) &&
        !item.imovel.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [items, cardFilter, formaFilter, garantiaFilter, search]);

  const cards: { id: CardFilter; label: string; value: string; sub: string; activeTone: string }[] = [
    {
      id: 'todos',
      label: 'Vencido na competência',
      value: formatBRLCompact(RECEIVABLES_SUMMARY.vencido),
      sub: 'Total faturado no mês · Ver todos',
      activeTone: 'border-[#2563EB] bg-[#EFF4FF]/50',
    },
    {
      id: 'Recebido',
      label: 'Recebido',
      value: formatBRLCompact(RECEIVABLES_SUMMARY.recebido),
      sub: '92,8% já compensado',
      activeTone: 'border-emerald-500 bg-emerald-50/40',
    },
    {
      id: 'Em atraso',
      label: 'Em atraso',
      value: formatBRLCompact(RECEIVABLES_SUMMARY.emAtraso),
      sub: '16 inquilinos · 7,2%',
      activeTone: 'border-red-500 bg-red-50/40',
    },
    {
      id: 'A vencer 7d',
      label: 'A vencer em 7 dias',
      value: formatBRLCompact(RECEIVABLES_SUMMARY.aVencer7d),
      sub: '54 boletos e PIX ativos',
      activeTone: 'border-[#2563EB] bg-[#EFF4FF]/50',
    },
    {
      id: 'Em acordo',
      label: 'Em acordo',
      value: formatBRLCompact(RECEIVABLES_SUMMARY.emAcordo),
      sub: '3 acordos parcelados',
      activeTone: 'border-amber-500 bg-amber-50/40',
    },
  ];

  return (
    <div className="space-y-5">
      {/* 5 clickable summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {cards.map((card) => {
          const isActive = cardFilter === card.id;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => setCardFilter(card.id)}
              className={`text-left rounded-xl border p-4 transition-colors ${
                isActive ? card.activeTone : 'bg-white border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div className="text-[12px] font-medium text-slate-500">{card.label}</div>
              <div className="text-[20px] font-bold text-slate-900 mt-1 tabular-nums">
                {card.value}
              </div>
              <div className="text-[11.5px] text-slate-600 mt-1">{card.sub}</div>
            </button>
          );
        })}
      </div>

      {/* Filters bar (no "Novo boleto" / "Novo lançamento") */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por inquilino ou imóvel..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-[13px] bg-[#F8F9FB] focus:bg-white focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <select
            value={formaFilter}
            onChange={(e) => setFormaFilter(e.target.value as 'todas' | PaymentMethod)}
            aria-label="Filtrar por forma de pagamento"
            className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-[12.5px] text-slate-700"
          >
            <option value="todas">Forma: Todas</option>
            <option value="PIX">PIX</option>
            <option value="Boleto">Boleto</option>
          </select>

          <select
            value={garantiaFilter}
            onChange={(e) => setGarantiaFilter(e.target.value as 'todas' | GuaranteeType)}
            aria-label="Filtrar por garantia"
            className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-[12.5px] text-slate-700"
          >
            <option value="todas">Garantia: Todas</option>
            <option value="Caução">Caução</option>
            <option value="Fiador">Fiador</option>
            <option value="Seguro fiança">Seguro fiança</option>
            <option value="Título de capitalização">Título de capitalização</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() =>
            onAskAgent({
              title: 'Pedir ao agente · Contas a receber',
              prefillText:
                'Emitir 2ª via atualizada e enviar lembrete de pagamento por WhatsApp para todos os boletos a vencer nos próximos 7 dias.',
              subtipo: 'Segunda via de boleto',
              actionType: 'regua_cobranca',
              evalParams: { diasAtraso: 1 },
            })
          }
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#5B3FD0] hover:bg-[#4C32B8] text-white text-[12.5px] font-semibold shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Pedir ao agente: emitir 2ª via em lote</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-[13px] text-slate-500">
            Nenhum lançamento encontrado para os filtros selecionados.
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-[12.5px]">
            <thead>
              <tr className="bg-[#F8F9FB] border-b border-slate-200 text-slate-600">
                <th className="py-3 px-4 font-semibold text-[11.5px]">Competência</th>
                <th className="py-3 px-4 font-semibold text-[11.5px]">Inquilino / Imóvel</th>
                <th className="py-3 px-4 font-semibold text-[11.5px]">Vencimento</th>
                <th className="py-3 px-4 font-semibold text-[11.5px]">Valor</th>
                <th className="py-3 px-4 font-semibold text-[11.5px]">Forma</th>
                <th className="py-3 px-4 font-semibold text-[11.5px]">Status</th>
                <th className="py-3 px-4 font-semibold text-[11.5px]">Conciliação</th>
                <th className="py-3 px-4 font-semibold text-[11.5px]">Origem</th>
                <th className="py-3 px-4 font-semibold text-[11.5px] text-right">
                  Pedir ao agente
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => {
                const sem =
                  item.status === 'Recebido'
                    ? 'verde'
                    : item.status === 'Em atraso'
                    ? 'vermelho'
                    : 'ambar';

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono text-[12px] text-slate-700 tabular-nums whitespace-nowrap">
                      {item.competencia}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{item.inquilino}</div>
                      <div className="text-[11.5px] text-slate-500">
                        {item.imovel} · {item.garantia}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 tabular-nums whitespace-nowrap">
                      {item.vencimento}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <span>{formatBRL(item.valor)}</span>
                        <InlineOneClickCorrector
                          value={String(item.valor)}
                          ariaLabel={`Corrigir valor de ${item.inquilino}`}
                          onSave={(raw) => {
                            const parsed = parseFloat(raw.replace(',', '.').replace(/[^0-9.]/g, ''));
                            if (!Number.isNaN(parsed) && parsed > 0) {
                              onCorrectReceivableValue(item.id, parsed);
                            }
                          }}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 whitespace-nowrap">{item.forma}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <SemaphoreBadge semaphore={sem} label={item.status} />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {item.conciliado ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-medium text-[12px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Conciliado</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-medium text-[12px]">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Pendente</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <AgentRegisteredTag label={item.registeredBy} />
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            onAskAgent({
                              title: `Enviar 2ª via · ${item.inquilino}`,
                              prefillText: `Gerar e enviar 2ª via (${item.forma}) da fatura ${item.competencia} de ${item.inquilino} (${item.imovel}) no valor de ${formatBRL(item.valor)}.`,
                              subtipo: 'Segunda via de boleto',
                              actionType: 'regua_cobranca',
                              evalParams: { diasAtraso: 1 },
                            })
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11.5px] font-medium text-slate-700"
                        >
                          <FileText className="w-3 h-3" />
                          <span>2ª via</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onAskAgent({
                              title: `Lembrar cliente · ${item.inquilino}`,
                              prefillText: `Enviar lembrete cordial de pagamento para ${item.inquilino} referente ao ${item.imovel} (vencimento ${item.vencimento}, ${formatBRL(item.valor)}).`,
                              subtipo: 'Cobrança',
                              actionType: 'regua_cobranca',
                              evalParams: { diasAtraso: item.status === 'Em atraso' ? 6 : 1 },
                            })
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F3F0FF] hover:bg-[#EAE4FF] text-[#5B3FD0] text-[11.5px] font-semibold"
                        >
                          <Send className="w-3 h-3" />
                          <span>Lembrar</span>
                        </button>
                        {item.status === 'Em atraso' && (
                          <button
                            type="button"
                            onClick={onSwitchToInadimplencia}
                            className="px-2.5 py-1 rounded-lg border border-red-200 bg-red-50 text-red-700 text-[11.5px] font-semibold hover:bg-red-100"
                          >
                            Ver cobrança
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
