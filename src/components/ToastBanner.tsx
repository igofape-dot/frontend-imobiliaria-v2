import { CheckCircle2, RotateCcw, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  text: string;
  onUndo?: () => void;
}

interface ToastBannerProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export function ToastBanner({ toast, onDismiss }: ToastBannerProps) {
  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-slate-900 text-white px-4 py-3 rounded-xl border border-slate-800 shadow-lg max-w-md"
    >
      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
      <span className="text-[13px] font-medium leading-snug">{toast.text}</span>
      {toast.onUndo && (
        <button
          type="button"
          onClick={() => {
            toast.onUndo?.();
            onDismiss();
          }}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[12px] font-semibold text-white shrink-0 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Desfazer
        </button>
      )}
      <button
        type="button"
        onClick={onDismiss}
        className="text-slate-400 hover:text-white p-0.5 shrink-0"
        aria-label="Fechar aviso"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
