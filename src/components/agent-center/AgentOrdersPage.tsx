import { useEffect, useState } from 'react';
import { Plus, Bot, Inbox, BarChart3, ClipboardList } from 'lucide-react';
import type {
  AgentOrder,
  IntakeMessageItem,
  OrderCategory,
  OrderPriority,
} from '../../data/agentOrdersData';
import { OrdersTab } from './OrdersTab';
import { IntakeTab } from './IntakeTab';
import { PerformanceTab } from './PerformanceTab';
import { OrderDetailDrawer } from './OrderDetailDrawer';
import { CreateOrderModal } from './CreateOrderModal';

type AgentCenterTab = 'pedidos' | 'entradas' | 'desempenho';

interface AgentOrdersPageProps {
  orders: AgentOrder[];
  intakeItems: IntakeMessageItem[];
  initialOrdersBaseline: {
    abertos: number;
    emRisco: number;
    atrasados: number;
    aguardandoVoce: number;
    aguardandoAceite: number;
    concluidosHoje: number;
  };
  isLoading: boolean;
  onCreateOrder: (rawText: string, attachmentName?: string) => AgentOrder;
  onSaveInterpretation: (
    orderId: string,
    updates: {
      subject: string;
      objective: string;
      narrative: string;
      category: OrderCategory;
      subtype: string;
      priority: OrderPriority;
    }
  ) => void;
  onApproveOrder: (orderId: string) => void;
  onRequestClarification: (orderId: string, question: string) => void;
  onEscalateToHuman: (orderId: string, humanName: string) => void;
  onCancelOrder: (orderId: string, reason: string) => void;
  onUndoExecutionChange: (orderId: string, stepId: string) => void;
  onAcceptDelivery: (
    orderId: string,
    rating: number,
    comment: string,
    autoTacit?: boolean
  ) => void;
  onRequestAdjustment: (orderId: string, rating: number, comment: string) => void;
  onReopenOrder: (orderId: string, comment: string) => void;
  onClassifyIntakeItem: (itemId: string, category: OrderCategory) => void;
  onOpenRuleById?: (ruleId: string) => void;
  externalSelectedOrderId?: string | null;
  onClearExternalSelectedOrderId?: () => void;
}

export function AgentOrdersPage({
  orders,
  intakeItems,
  initialOrdersBaseline,
  isLoading,
  onCreateOrder,
  onSaveInterpretation,
  onApproveOrder,
  onRequestClarification,
  onEscalateToHuman,
  onCancelOrder,
  onUndoExecutionChange,
  onAcceptDelivery,
  onRequestAdjustment,
  onReopenOrder,
  onClassifyIntakeItem,
  onOpenRuleById,
  externalSelectedOrderId,
  onClearExternalSelectedOrderId,
}: AgentOrdersPageProps) {
  const [activeTab, setActiveTab] = useState<AgentCenterTab>('pedidos');
  const [tabLoading, setTabLoading] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    if (externalSelectedOrderId) {
      setActiveTab('pedidos');
      setSelectedOrderId(externalSelectedOrderId);
      onClearExternalSelectedOrderId?.();
    }
  }, [externalSelectedOrderId, onClearExternalSelectedOrderId]);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) ?? null;

  const handleTabChange = (nextTab: AgentCenterTab) => {
    if (nextTab === activeTab) return;
    setActiveTab(nextTab);
    setTabLoading(true);
    window.setTimeout(() => {
      setTabLoading(false);
    }, 220);
  };

  const handleOpenOrderByProtocol = (protocol: string) => {
    const match = orders.find((o) => o.protocol === protocol);
    if (match) {
      setSelectedOrderId(match.id);
    }
  };

  const pendingTriageCount = intakeItems.filter(
    (i) =>
      (i.outcomeType === 'triage_unclassified' || i.outcomeType === 'unidentified_requester') &&
      !i.resolved
  ).length;

  return (
    <main className="flex-1 bg-[#F8F9FB] px-4 sm:px-6 lg:px-7 py-5 sm:py-6">
      <div className="max-w-[1440px] mx-auto space-y-5">
        {/* CABEÇALHO */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-[#F3F0FF] text-[#5B3FD0] flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" strokeWidth={2} />
              </span>
              <h1 className="text-[22px] sm:text-[24px] font-bold text-slate-900 tracking-tight leading-tight">
                Agente de IA
              </h1>
            </div>
            <p className="text-[13px] text-slate-500 mt-1">
              Pedidos, prazos e entregas · Central operacional de solicitações
            </p>
          </div>

          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-[13px] font-semibold transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" strokeWidth={2.2} />
            <span>Fazer pedido</span>
          </button>
        </div>

        {/* ABAS: Pedidos | Entradas | Desempenho */}
        <div
          role="tablist"
          aria-label="Seções da Central de Pedidos"
          className="border-b border-slate-200 flex items-center gap-1 overflow-x-auto"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'pedidos'}
            onClick={() => handleTabChange('pedidos')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'pedidos'
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Pedidos</span>
            <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 tabular-nums">
              {orders.length}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'entradas'}
            onClick={() => handleTabChange('entradas')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'entradas'
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Entradas</span>
            {pendingTriageCount > 0 && (
              <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 tabular-nums">
                {pendingTriageCount} triagem
              </span>
            )}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'desempenho'}
            onClick={() => handleTabChange('desempenho')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'desempenho'
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Desempenho</span>
          </button>
        </div>

        {/* TAB PANELS */}
        {activeTab === 'pedidos' && (
          <OrdersTab
            orders={orders}
            initialOrdersBaseline={initialOrdersBaseline}
            isLoading={isLoading || tabLoading}
            onSelectOrder={(id) => setSelectedOrderId(id)}
          />
        )}

        {activeTab === 'entradas' && (
          <IntakeTab
            intakeItems={intakeItems}
            isLoading={isLoading || tabLoading}
            onOpenOrderByProtocol={handleOpenOrderByProtocol}
            onClassifyIntakeItem={onClassifyIntakeItem}
          />
        )}

        {activeTab === 'desempenho' && (
          <PerformanceTab isLoading={isLoading || tabLoading} />
        )}
      </div>

      {/* WIDE ORDER DETAIL DRAWER */}
      <OrderDetailDrawer
        order={selectedOrder}
        allOrders={orders}
        onClose={() => setSelectedOrderId(null)}
        onSelectOrder={(id) => setSelectedOrderId(id)}
        onSaveInterpretation={onSaveInterpretation}
        onApproveOrder={onApproveOrder}
        onRequestClarification={onRequestClarification}
        onEscalateToHuman={onEscalateToHuman}
        onCancelOrder={onCancelOrder}
        onUndoExecutionChange={onUndoExecutionChange}
        onAcceptDelivery={onAcceptDelivery}
        onRequestAdjustment={onRequestAdjustment}
        onReopenOrder={onReopenOrder}
        onOpenRuleById={onOpenRuleById}
      />

      {/* CREATE ORDER FREE-TEXT MODAL */}
      <CreateOrderModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreateOrder={onCreateOrder}
        onOpenCreatedOrder={(id) => setSelectedOrderId(id)}
      />
    </main>
  );
}
