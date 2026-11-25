import {
  MessageCircle,
  Mail,
  Terminal,
  Globe,
  FileUp,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  PauseCircle,
  Clock,
  Bot,
  User,
  RotateCcw,
  XCircle,
  Sparkles,
  FileSearch,
  Send,
} from 'lucide-react';
import {
  truncateAtWordBoundary,
  type OrderChannel,
  type OrderPriority,
  type OrderStatus,
  type SlaSemaphore,
} from '../../data/agentOrdersData';

export function ChannelIcon({
  channel,
  className = 'w-4 h-4',
}: {
  channel: OrderChannel;
  className?: string;
}) {
  switch (channel) {
    case 'WhatsApp':
      return <MessageCircle className={`${className} text-emerald-600`} strokeWidth={1.9} />;
    case 'E-mail':
      return <Mail className={`${className} text-[#2563EB]`} strokeWidth={1.9} />;
    case 'Chat do sistema':
      return <Terminal className={`${className} text-[#5B3FD0]`} strokeWidth={1.9} />;
    case 'Portais':
      return <Globe className={`${className} text-amber-600`} strokeWidth={1.9} />;
    case 'Upload de documentos':
      return <FileUp className={`${className} text-slate-600`} strokeWidth={1.9} />;
  }
}

export function PriorityBadge({ priority }: { priority: OrderPriority }) {
  switch (priority) {
    case 'Urgente':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200 text-[11px] font-semibold whitespace-nowrap">
          <AlertOctagon className="w-3 h-3 shrink-0" />
          Urgente
        </span>
      );
    case 'Alta':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold whitespace-nowrap">
          <AlertTriangle className="w-3 h-3 shrink-0" />
          Alta
        </span>
      );
    case 'Normal':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-[#2563EB] border border-blue-200 text-[11px] font-medium whitespace-nowrap">
          Normal
        </span>
      );
    case 'Baixa':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-medium whitespace-nowrap">
          Baixa
        </span>
      );
  }
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  switch (status) {
    case 'Recebido':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium whitespace-nowrap">
          <Clock className="w-3 h-3 shrink-0" />
          Recebido
        </span>
      );
    case 'Interpretado':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F3F0FF] text-[#5B3FD0] border border-[#5B3FD0]/25 text-[11px] font-semibold whitespace-nowrap">
          <FileSearch className="w-3 h-3 shrink-0" />
          Interpretado
        </span>
      );
    case 'Aguardando esclarecimento':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold whitespace-nowrap">
          <PauseCircle className="w-3 h-3 shrink-0" />
          Aguardando esclarecimento
        </span>
      );
    case 'Aguardando aprovação':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold whitespace-nowrap">
          <AlertTriangle className="w-3 h-3 shrink-0" />
          Aguardando aprovação
        </span>
      );
    case 'Em execução':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-[#2563EB] border border-blue-200 text-[11px] font-semibold whitespace-nowrap">
          <Sparkles className="w-3 h-3 shrink-0" />
          Em execução
        </span>
      );
    case 'Entregue':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F3F0FF] text-[#5B3FD0] border border-[#5B3FD0]/25 text-[11px] font-semibold whitespace-nowrap">
          <Send className="w-3 h-3 shrink-0" />
          Entregue
        </span>
      );
    case 'Concluído':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold whitespace-nowrap">
          <CheckCircle2 className="w-3 h-3 shrink-0" />
          Concluído
        </span>
      );
    case 'Reaberto':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200 text-[11px] font-semibold whitespace-nowrap">
          <RotateCcw className="w-3 h-3 shrink-0" />
          Reaberto
        </span>
      );
    case 'Cancelado':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200 text-[11px] font-medium whitespace-nowrap">
          <XCircle className="w-3 h-3 shrink-0" />
          Cancelado
        </span>
      );
  }
}

export function SlaSemaphoreIndicator({
  semaphore,
  text,
}: {
  semaphore: SlaSemaphore;
  text: string;
}) {
  switch (semaphore) {
    case 'no_prazo':
      return (
        <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-emerald-700 whitespace-nowrap tabular-nums">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{text}</span>
        </span>
      );
    case 'em_risco':
      return (
        <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-amber-700 whitespace-nowrap tabular-nums">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{text}</span>
        </span>
      );
    case 'atrasado':
      return (
        <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-red-700 whitespace-nowrap tabular-nums">
          <AlertOctagon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{text}</span>
        </span>
      );
    case 'pausado':
      return (
        <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-600 whitespace-nowrap tabular-nums">
          <PauseCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" aria-hidden="true" />
          <span>{text}</span>
        </span>
      );
  }
}

export function AssigneeLabel({
  type,
  name,
}: {
  type: 'Agente' | 'Humano';
  name: string;
}) {
  if (type === 'Agente') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#5B3FD0] whitespace-nowrap">
        <Bot className="w-3.5 h-3.5 shrink-0" />
        <span>Agente</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-700 whitespace-nowrap">
      <User className="w-3.5 h-3.5 shrink-0 text-slate-500" />
      <span>{name}</span>
    </span>
  );
}

export function WordTruncatedText({
  text,
  maxChars,
  className = '',
}: {
  text: string;
  maxChars: number;
  className?: string;
}) {
  const { display, truncated } = truncateAtWordBoundary(text, maxChars);
  return (
    <span title={truncated ? text : undefined} className={className}>
      {display}
    </span>
  );
}
