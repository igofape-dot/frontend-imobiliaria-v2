import { useState, useRef, type FormEvent, type ChangeEvent } from 'react';
import { Sparkles, Paperclip, Mic, ArrowUp, X, FileText, Loader2 } from 'lucide-react';
import { COMMAND_SUGGESTIONS } from '../data/commandCenterData';

interface AgentCommandBarProps {
  onSubmitCommand: (commandText: string, attachmentName?: string) => void;
  isBusy?: boolean;
}

export function AgentCommandBar({ onSubmitCommand, isBusy = false }: AgentCommandBarProps) {
  const [input, setInput] = useState('');
  const [attachment, setAttachment] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const voiceTimerRef = useRef<number | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed && !attachment) return;
    const finalPrompt = trimmed || `Processar e cadastrar conteúdo de ${attachment}`;
    onSubmitCommand(finalPrompt, attachment ?? undefined);
    setInput('');
    setAttachment(null);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment(file.name);
      textInputRef.current?.focus();
    }
    e.target.value = '';
  };

  const handleToggleVoice = () => {
    if (isListening) {
      if (voiceTimerRef.current) window.clearTimeout(voiceTimerRef.current);
      setIsListening(false);
      return;
    }

    setIsListening(true);
    voiceTimerRef.current = window.setTimeout(() => {
      setInput('Cadastrar apartamento 2 quartos na Av. Paulista enviado pelo proprietário');
      setIsListening(false);
      textInputRef.current?.focus();
    }, 1400);
  };

  const handleChipClick = (suggestion: string) => {
    onSubmitCommand(suggestion);
  };

  return (
    <section
      aria-label="Barra de comando do agente de IA"
      className="bg-white rounded-xl border border-[#5B3FD0]/25 p-4 sm:p-5 shadow-[0_0_0_1px_rgba(91,63,208,0.08),0_6px_20px_-6px_rgba(91,63,208,0.12)]"
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-[#F3F0FF] text-[#5B3FD0]">
            <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
          </span>
          <span className="text-[12.5px] font-semibold text-slate-900">
            Comando direto ao agente
          </span>
          <span className="text-[10.5px] font-semibold text-[#5B3FD0] bg-[#F3F0FF] px-2 py-0.5 rounded-md">
            IA
          </span>
        </div>

        <span className="text-[11.5px] text-slate-500 hidden sm:inline">
          Você pede, a IA registra e executa
        </span>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-xl border border-slate-200 bg-[#F8F9FB] px-3.5 py-2.5 focus-within:bg-white focus-within:border-[#5B3FD0] focus-within:ring-2 focus-within:ring-[#5B3FD0]/15 transition-all">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Sparkles
              className="w-5 h-5 text-[#5B3FD0] shrink-0"
              strokeWidth={1.9}
              aria-hidden="true"
            />
            <input
              ref={textInputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isListening
                  ? 'Ouvindo comando de voz...'
                  : 'O que você quer que eu faça?'
              }
              aria-label="O que você quer que eu faça?"
              className="w-full bg-transparent text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-1.5 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-200/70">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="hidden"
              aria-hidden="true"
              accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx,.doc,.docx"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
              aria-label="Anexar arquivo para o agente processar"
              title="Anexar arquivo"
            >
              <Paperclip className="w-4 h-4" strokeWidth={1.85} />
              <span className="hidden md:inline">Anexar</span>
            </button>

            <button
              type="button"
              onClick={handleToggleVoice}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                isListening
                  ? 'bg-[#F3F0FF] text-[#5B3FD0]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              aria-label={isListening ? 'Parar captura de voz' : 'Ditar comando por voz'}
              aria-pressed={isListening}
              title="Comando por voz"
            >
              <Mic className="w-4 h-4" strokeWidth={1.85} />
              <span className="hidden md:inline">
                {isListening ? 'Ouvindo...' : 'Voz'}
              </span>
            </button>

            <button
              type="submit"
              disabled={(!input.trim() && !attachment) || isBusy}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#5B3FD0] hover:bg-[#4C32B8] disabled:bg-slate-200 disabled:text-slate-400 text-white text-[12.5px] font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              {isBusy ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowUp className="w-4 h-4" strokeWidth={2.2} />
              )}
              <span>Executar</span>
            </button>
          </div>
        </div>

        {attachment && (
          <div className="mt-2 inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#F3F0FF] border border-[#5B3FD0]/20 text-[12px] text-[#5B3FD0] font-medium">
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate max-w-[240px]">{attachment}</span>
            <button
              type="button"
              onClick={() => setAttachment(null)}
              className="hover:text-slate-900"
              aria-label="Remover anexo"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </form>

      {/* 4 clickable suggestion chips */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-[11.5px] font-medium text-slate-400 mr-0.5">
          Sugestões:
        </span>
        {COMMAND_SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => handleChipClick(suggestion)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-[#5B3FD0]/40 hover:bg-[#F3F0FF]/50 hover:text-[#5B3FD0] text-[12px] font-medium text-slate-700 transition-colors text-left"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </section>
  );
}
