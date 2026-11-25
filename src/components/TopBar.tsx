import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Bell, Menu, CheckCheck, X, Sparkles, ArrowRight } from 'lucide-react';
import {
  SEARCH_RECORDS,
  type NavItemId,
  type NotificationItem,
  type SearchRecord,
} from '../data/navigation';

interface TopBarProps {
  workspaceShortName: string;
  breadcrumbCurrent?: string;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onNavigate: (itemId: NavItemId) => void;
  onSendAgentCommand: (prompt: string) => void;
  onOpenMobileMenu: () => void;
}

export function TopBar({
  workspaceShortName,
  breadcrumbCurrent,
  notifications,
  onMarkAllRead,
  onNavigate,
  onSendAgentCommand,
  onOpenMobileMenu,
}: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      const target = e.target as Node;
      if (searchRef.current && !searchRef.current.contains(target)) {
        setSearchFocused(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setSearchFocused(true);
      }
      if (e.key === 'Escape') {
        setSearchFocused(false);
        setNotifOpen(false);
        setProfileOpen(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredRecords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return SEARCH_RECORDS.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleSelectRecord = (record: SearchRecord) => {
    onNavigate(record.targetItem);
    setSearchQuery('');
    setSearchFocused(false);
  };

  const handleAskFromTopbar = () => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    onSendAgentCommand(trimmed);
    setSearchQuery('');
    setSearchFocused(false);
    inputRef.current?.blur();
  };

  return (
    <header className="h-[58px] bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 sticky top-0 z-20">
      {/* Left: Mobile menu button + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-1.5 -ml-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          aria-label="Abrir menu lateral"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center text-[13px] whitespace-nowrap truncate">
          <button
            type="button"
            onClick={() => onNavigate('painel')}
            className="text-slate-500 hover:text-slate-800 transition-colors font-normal"
          >
            GoFAPE
          </button>
          <span className="mx-2 text-slate-400 select-none">/</span>
          <span className="text-slate-900 font-semibold">{workspaceShortName}</span>
          {breadcrumbCurrent && (
            <>
              <span className="mx-2 text-slate-400 select-none">/</span>
              <span className="text-slate-600 font-medium truncate">{breadcrumbCurrent}</span>
            </>
          )}
        </nav>
      </div>

      {/* Right: Search + Notifications + Avatar */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div ref={searchRef} className="relative hidden sm:block">
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            strokeWidth={1.85}
          />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                e.preventDefault();
                handleAskFromTopbar();
              }
            }}
            placeholder="Buscar ou pedir ao agente..."
            aria-label="Buscar ou pedir ao agente"
            className="w-[260px] md:w-[310px] h-9 pl-9 pr-16 rounded-full border border-slate-200/90 bg-[#F8F9FB] text-[12.5px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#5B3FD0]/50 focus:ring-2 focus:ring-[#5B3FD0]/15 transition-all"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              aria-label="Limpar busca"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-slate-500 bg-white border border-slate-200 rounded">
              Ctrl+K
            </kbd>
          )}

          {searchFocused && searchQuery.trim().length > 0 && (
            <div className="absolute right-0 mt-2 w-[360px] bg-white border border-slate-200 rounded-xl shadow-sm py-2 z-30">
              <button
                type="button"
                onClick={handleAskFromTopbar}
                className="w-full px-3.5 py-2.5 text-left hover:bg-[#F3F0FF]/70 flex items-center justify-between gap-2 border-b border-slate-100 transition-colors"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <Sparkles className="w-4 h-4 text-[#5B3FD0] shrink-0" />
                  <span className="text-[12.5px] font-medium text-slate-900 truncate">
                    Pedir ao agente: &ldquo;{searchQuery}&rdquo;
                  </span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[#5B3FD0] shrink-0" />
              </button>

              {filteredRecords.length === 0 ? (
                <div className="px-4 py-3 text-[12px] text-slate-500">
                  Nenhum registro encontrado. Pressione Enter para pedir ao agente.
                </div>
              ) : (
                <>
                  <div className="px-3.5 pt-2 pb-1 text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">
                    Registros do agente ({filteredRecords.length})
                  </div>
                  <div className="divide-y divide-slate-100">
                    {filteredRecords.map((record) => (
                      <button
                        key={record.id}
                        type="button"
                        onClick={() => handleSelectRecord(record)}
                        className="w-full px-3.5 py-2.5 text-left hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[12.5px] font-medium text-slate-900 truncate">
                            {record.title}
                          </span>
                          <span className="text-[10.5px] font-medium text-[#2563EB] shrink-0">
                            {record.type}
                          </span>
                        </div>
                        <div className="text-[11.5px] text-slate-500 mt-0.5 truncate">
                          {record.subtitle} · {record.registeredBy}
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Bell with counter */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setNotifOpen((prev) => !prev);
              setProfileOpen(false);
            }}
            className="w-9 h-9 rounded-full border border-slate-200/90 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors relative"
            aria-label={`Notificações (${unreadCount} não lidas)`}
            aria-expanded={notifOpen}
          >
            <Bell className="w-[16px] h-[16px]" strokeWidth={1.85} />
            {unreadCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#2563EB] text-white text-[10px] font-semibold flex items-center justify-center tabular-nums border-2 border-white"
                aria-hidden="true"
              >
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-[320px] bg-white border border-slate-200 rounded-xl shadow-sm z-30 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                <span className="text-[13px] font-semibold text-slate-900">
                  Notificações
                </span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={onMarkAllRead}
                    className="inline-flex items-center gap-1 text-[11.5px] font-medium text-[#2563EB] hover:text-blue-700"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Marcar como lidas
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-100 max-h-[280px] overflow-y-auto">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`px-4 py-3 ${item.unread ? 'bg-blue-50/40' : 'bg-white'}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[12.5px] font-medium text-slate-900">
                        {item.title}
                      </span>
                      <span className="text-[11px] text-slate-400 shrink-0 tabular-nums">
                        {item.time}
                      </span>
                    </div>
                    <p className="text-[12px] text-slate-500 mt-0.5 leading-relaxed">
                      {item.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Avatar F */}
        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setProfileOpen((prev) => !prev);
              setNotifOpen(false);
            }}
            className="w-9 h-9 rounded-full bg-[#5B3FD0] hover:bg-[#4C32B8] text-white text-[13px] font-semibold flex items-center justify-center transition-colors"
            aria-label="Menu da conta Farina"
            aria-expanded={profileOpen}
          >
            F
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-[230px] bg-white border border-slate-200 rounded-xl shadow-sm py-1.5 z-30">
              <div className="px-3.5 py-2 border-b border-slate-100">
                <div className="text-[13px] font-semibold text-slate-900">
                  Farina Imobiliária
                </div>
                <div className="text-[11.5px] text-slate-500">
                  Gestão e Supervisão · FIMP
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onNavigate('painel');
                  setProfileOpen(false);
                }}
                className="w-full px-3.5 py-2 text-left text-[12.5px] text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Central de Comando (Painel)
              </button>
              <button
                type="button"
                onClick={() => {
                  onNavigate('agente-ia');
                  setProfileOpen(false);
                }}
                className="w-full px-3.5 py-2 text-left text-[12.5px] text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Agente de IA
              </button>
              <button
                type="button"
                onClick={() => {
                  onNavigate('regras-agente');
                  setProfileOpen(false);
                }}
                className="w-full px-3.5 py-2 text-left text-[12.5px] text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Regras do agente
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
