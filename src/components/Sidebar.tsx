import { useState, useRef, useEffect } from 'react';
import {
  Home,
  KeyRound,
  Tag,
  Megaphone,
  Wallet,
  Scale,
  Wrench,
  Users,
  UserCheck,
  BarChart2,
  Bot,
  ChevronUp,
  ChevronDown,
  Check,
  X,
} from 'lucide-react';
import { GoFapeLogo } from './GoFapeLogo';
import {
  SIDEBAR_NAV_ITEMS,
  type NavItem,
  type NavItemId,
  type WorkspaceTenant,
} from '../data/navigation';

interface SidebarProps {
  activeItem: NavItemId;
  onSelectItem: (itemId: NavItemId) => void;
  workspaces: WorkspaceTenant[];
  activeWorkspace: WorkspaceTenant;
  onSelectWorkspace: (workspace: WorkspaceTenant) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

function ItemIcon({
  icon,
  isActive,
}: {
  icon: NavItem['icon'];
  isActive: boolean;
}) {
  const colorClass = isActive ? 'text-[#2563EB]' : 'text-slate-500';
  const sizeClass = 'w-[17px] h-[17px] shrink-0';

  switch (icon) {
    case 'home':
      return <Home className={`${sizeClass} ${colorClass}`} strokeWidth={1.85} />;
    case 'key':
      return <KeyRound className={`${sizeClass} ${colorClass}`} strokeWidth={1.85} />;
    case 'tag':
      return <Tag className={`${sizeClass} ${colorClass}`} strokeWidth={1.85} />;
    case 'megaphone':
      return <Megaphone className={`${sizeClass} ${colorClass}`} strokeWidth={1.85} />;
    case 'wallet':
      return <Wallet className={`${sizeClass} ${colorClass}`} strokeWidth={1.85} />;
    case 'scale':
      return <Scale className={`${sizeClass} ${colorClass}`} strokeWidth={1.85} />;
    case 'wrench':
      return <Wrench className={`${sizeClass} ${colorClass}`} strokeWidth={1.85} />;
    case 'users':
      return <Users className={`${sizeClass} ${colorClass}`} strokeWidth={1.85} />;
    case 'user-check':
      return <UserCheck className={`${sizeClass} ${colorClass}`} strokeWidth={1.85} />;
    case 'chart':
      return <BarChart2 className={`${sizeClass} ${colorClass}`} strokeWidth={1.85} />;
    case 'bot':
      return (
        <Bot
          className={`${sizeClass} ${isActive ? 'text-[#5B3FD0]' : 'text-[#5B3FD0]/85'}`}
          strokeWidth={1.85}
        />
      );
  }
}

export function Sidebar({
  activeItem,
  onSelectItem,
  workspaces,
  activeWorkspace,
  onSelectWorkspace,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const [inicioExpanded, setInicioExpanded] = useState(true);
  const [tenantMenuOpen, setTenantMenuOpen] = useState(false);
  const tenantRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (tenantRef.current && !tenantRef.current.contains(e.target as Node)) {
        setTenantMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const sidebarContent = (
    <aside className="w-[260px] shrink-0 bg-white border-r border-slate-200/80 flex flex-col h-full select-none">
      {/* Brand header */}
      <div className="h-[58px] px-4 border-b border-slate-200/80 flex items-center justify-between shrink-0">
        <button
          type="button"
          onClick={() => {
            onSelectItem('painel');
            onCloseMobile();
          }}
          className="rounded-md py-1"
          aria-label="Ir para o Painel inicial GoFAPE"
        >
          <GoFapeLogo />
        </button>

        <button
          type="button"
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          aria-label="Fechar menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tenant / Company row */}
      <div ref={tenantRef} className="relative border-b border-slate-200/80 shrink-0">
        <button
          type="button"
          onClick={() => setTenantMenuOpen((prev) => !prev)}
          className="w-full px-4 py-3 flex items-center justify-between gap-2 text-left hover:bg-slate-50/80 transition-colors"
          aria-expanded={tenantMenuOpen}
        >
          <span className="text-[12.5px] font-medium text-slate-600 truncate">
            {activeWorkspace.name}
          </span>
          <span className="shrink-0 text-[10px] font-semibold tracking-wide text-[#2563EB] bg-[#EFF4FF] px-2 py-0.5 rounded-[4px] uppercase">
            {activeWorkspace.code}
          </span>
        </button>

        {tenantMenuOpen && (
          <div className="absolute left-3 right-3 top-[calc(100%+4px)] z-30 bg-white border border-slate-200 rounded-xl shadow-sm py-1.5">
            <div className="px-3 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">
              Unidade ativa
            </div>
            {workspaces.map((ws) => {
              const selected = ws.id === activeWorkspace.id;
              return (
                <button
                  key={ws.id}
                  type="button"
                  onClick={() => {
                    onSelectWorkspace(ws);
                    setTenantMenuOpen(false);
                  }}
                  className={`w-full px-3 py-2 flex items-center justify-between text-left text-[12.5px] transition-colors ${
                    selected
                      ? 'bg-[#EFF4FF] text-[#2563EB] font-medium'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{ws.name}</span>
                  <span className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-semibold text-slate-400">{ws.code}</span>
                    {selected && <Check className="w-3.5 h-3.5 text-[#2563EB]" />}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Navigation items */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5" aria-label="Navegação principal">
        {SIDEBAR_NAV_ITEMS.map((item) => {
          if (item.subItems && item.subItems.length > 0) {
            const isInicioActive = item.subItems.some((sub) => sub.id === activeItem);
            return (
              <div key={item.id} className="mb-1">
                <button
                  type="button"
                  onClick={() => setInicioExpanded((prev) => !prev)}
                  className={`w-full px-3 py-2 rounded-lg flex items-center justify-between text-[13px] transition-colors ${
                    isInicioActive
                      ? 'text-[#2563EB] font-semibold'
                      : 'text-slate-700 font-medium hover:bg-slate-50 hover:text-slate-900'
                  }`}
                  aria-expanded={inicioExpanded}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <ItemIcon icon={item.icon} isActive={isInicioActive} />
                    <span className="truncate">{item.label}</span>
                  </span>
                  {inicioExpanded ? (
                    <ChevronUp
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isInicioActive ? 'text-[#2563EB]' : 'text-slate-400'
                      }`}
                    />
                  ) : (
                    <ChevronDown
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isInicioActive ? 'text-[#2563EB]' : 'text-slate-400'
                      }`}
                    />
                  )}
                </button>

                {inicioExpanded && (
                  <div className="mt-0.5 space-y-0.5">
                    {item.subItems.map((sub) => {
                      const isSubActive = activeItem === sub.id;
                      const isAgent = sub.id === 'agente-ia';
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => {
                            onSelectItem(sub.id);
                            onCloseMobile();
                          }}
                          className={`w-full text-left pl-9 pr-3 py-2 rounded-lg text-[13px] flex items-center justify-between gap-2 transition-colors ${
                            isSubActive
                              ? 'bg-[#EFF4FF] text-[#2563EB] font-semibold'
                              : 'text-slate-600 font-normal hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <span className="truncate">{sub.label}</span>
                          {isAgent && (
                            <span className="text-[10px] font-semibold text-[#5B3FD0] bg-[#F3F0FF] px-1.5 py-0.5 rounded shrink-0">
                              IA
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const isActive = activeItem === item.id;
          const isRules = item.id === 'regras-agente';

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelectItem(item.id);
                onCloseMobile();
              }}
              className={`w-full px-3 py-2 rounded-lg flex items-center justify-between gap-2 text-[13px] transition-colors ${
                isActive
                  ? 'bg-[#EFF4FF] text-[#2563EB] font-semibold'
                  : 'text-slate-700 font-medium hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <ItemIcon icon={item.icon} isActive={isActive} />
                <span className="truncate">{item.label}</span>
              </span>
              {isRules && (
                <span className="text-[10px] font-semibold text-[#5B3FD0] bg-[#F3F0FF] px-1.5 py-0.5 rounded shrink-0">
                  IA
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );

  return (
    <>
      <div className="hidden lg:flex h-screen sticky top-0">{sidebarContent}</div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/25 backdrop-blur-[1px]"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
