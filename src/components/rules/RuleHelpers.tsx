import {
  Sparkles,
  AlertTriangle,
  Eye,
  ShieldBan,
  CheckCircle2,
  Clock,
  PauseCircle,
  Archive,
  FileEdit,
  Lock,
} from 'lucide-react';
import type { Modo, PerfilRegra, Regra, StatusRegra, TipoRegra } from '../../data/rulesData';

export const TIPO_REGRA_LABELS: Record<TipoRegra, string> = {
  autonomia: 'Autonomia',
  alcada: 'Alçada',
  prazo_sla: 'Prazo e SLA',
  politica_negocio: 'Política de negócio',
  comunicacao: 'Comunicação',
  permissao: 'Permissão',
  qualidade_dados: 'Qualidade de dados',
  escalonamento: 'Escalonamento',
  meta_semaforo: 'Meta e semáforo',
  barreira: 'Barreira',
};

export const MODO_LABELS: Record<Modo, string> = {
  autonomo: 'Autônomo',
  aprovacao: 'Pedir aprovação',
  sugerir: 'Só sugerir',
  bloqueado: 'Bloqueado',
};

export const STATUS_REGRA_LABELS: Record<StatusRegra, string> = {
  rascunho: 'Rascunho',
  em_aprovacao: 'Em aprovação',
  ativa: 'Ativa',
  pausada: 'Pausada',
  arquivada: 'Arquivada',
};

export function ModoBadge({ modo }: { modo: Modo }) {
  switch (modo) {
    case 'autonomo':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold whitespace-nowrap">
          <Sparkles className="w-3 h-3 shrink-0" />
          Autônomo
        </span>
      );
    case 'aprovacao':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold whitespace-nowrap">
          <AlertTriangle className="w-3 h-3 shrink-0" />
          Pedir aprovação
        </span>
      );
    case 'sugerir':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F3F0FF] text-[#5B3FD0] border border-[#5B3FD0]/25 text-[11px] font-semibold whitespace-nowrap">
          <Eye className="w-3 h-3 shrink-0" />
          Só sugerir
        </span>
      );
    case 'bloqueado':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200 text-[11px] font-semibold whitespace-nowrap">
          <ShieldBan className="w-3 h-3 shrink-0" />
          Bloqueado
        </span>
      );
  }
}

export function StatusRegraBadge({ status }: { status: StatusRegra }) {
  switch (status) {
    case 'ativa':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold whitespace-nowrap">
          <CheckCircle2 className="w-3 h-3 shrink-0" />
          Ativa
        </span>
      );
    case 'em_aprovacao':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold whitespace-nowrap">
          <Clock className="w-3 h-3 shrink-0" />
          Em aprovação
        </span>
      );
    case 'rascunho':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium whitespace-nowrap">
          <FileEdit className="w-3 h-3 shrink-0" />
          Rascunho
        </span>
      );
    case 'pausada':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50/70 text-amber-800 border border-amber-200 text-[11px] font-medium whitespace-nowrap">
          <PauseCircle className="w-3 h-3 shrink-0" />
          Pausada
        </span>
      );
    case 'arquivada':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200 text-[11px] font-medium whitespace-nowrap">
          <Archive className="w-3 h-3 shrink-0" />
          Arquivada
        </span>
      );
  }
}

export function canEditRule(perfil: PerfilRegra, regra: Regra): boolean {
  if (regra.travada || regra.tipo === 'barreira') return false;
  if (perfil === 'Gestor') return true;
  if (perfil === 'Financeiro') return regra.moduloDono === 'Financeiro';
  if (perfil === 'Jurídico') return regra.moduloDono === 'Contratos e Jurídico';
  return false; // Corretor apenas visualiza
}

export function getEditDeniedReason(perfil: PerfilRegra, regra: Regra): string {
  if (regra.travada || regra.tipo === 'barreira') {
    return 'Barreira travada: edição exclusiva do Administrador';
  }
  if (perfil === 'Corretor') {
    return 'Perfil Corretor tem acesso somente de visualização';
  }
  if (perfil === 'Financeiro' && regra.moduloDono !== 'Financeiro') {
    return 'Perfil Financeiro edita apenas regras do módulo Financeiro';
  }
  if (perfil === 'Jurídico' && regra.moduloDono !== 'Contratos e Jurídico') {
    return 'Perfil Jurídico edita apenas regras de Contratos e Jurídico';
  }
  return '';
}

export function canCreateInModule(perfil: PerfilRegra, modulo?: string): boolean {
  if (perfil === 'Corretor') return false;
  if (perfil === 'Gestor') return true;
  if (!modulo) return true;
  if (perfil === 'Financeiro') return modulo === 'Financeiro';
  if (perfil === 'Jurídico') return modulo === 'Contratos e Jurídico';
  return false;
}

export function formatRuleSummary(regra: Regra): string {
  const qText =
    regra.quando.length > 0
      ? regra.quando.map((c) => `${c.campo} ${c.operador} ${c.valor}`).join(' e ')
      : 'Qualquer solicitação';

  let eText = MODO_LABELS[regra.entao.modo];
  if (regra.entao.faixas && regra.entao.faixas.length > 0) {
    const unit = regra.entao.parametros?.unidade ?? '';
    eText = regra.entao.faixas
      .map((f) =>
        f.ate !== undefined
          ? `até ${unit === 'R$' ? `R$ ${f.ate}` : `${f.ate}${unit ? ` ${unit}` : ''}`}: ${MODO_LABELS[f.modo]}`
          : `acima: ${MODO_LABELS[f.modo]}`
      )
      .join('; ');
  }
  return `Quando ${qText} → Então ${eText}`;
}

export function BarrierLockTag() {
  return (
    <span
      title="Barreira travada: edição exclusiva do Administrador"
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10.5px] font-medium text-slate-600 whitespace-nowrap"
    >
      <Lock className="w-3 h-3 text-slate-500" />
      <span>Administrador</span>
    </span>
  );
}
