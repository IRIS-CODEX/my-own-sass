import React from 'react';
import {
  MessageSquare,
  LayoutDashboard,
  Sparkles,
  Bot,
  Radio,
  ShieldCheck,
  KeyRound,
  FileCheck,
  TrendingDown,
  Settings,
  ShieldAlert,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  ExternalLink,
  ChevronRight,
  Server
} from 'lucide-react';
import { useAppStore, NavItem } from '../../stores/useAppStore';
import { useLiveStreamStore } from '../../stores/useLiveStreamStore';
import { useAgentsStore } from '../../stores/useAgentsStore';

export const Sidebar: React.FC = () => {
  const {
    activeNav,
    setActiveNav,
    theme,
    toggleTheme,
    soundEnabled,
    toggleSound,
    currentOrg,
  } = useAppStore();

  const pendingApprovalsCount = useLiveStreamStore((s) => s.pendingActions.length);
  const totalAgentsCount = useAgentsStore((s) => s.agents.length);

  const coreNavItems: { id: NavItem; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number; tag?: string }[] = [
    { id: 'chat', label: 'Chat with Agents', icon: MessageSquare, tag: 'Live' },
    { id: 'agents', label: 'My AI Agents', icon: Bot, badge: totalAgentsCount },
    { id: 'keys', label: 'Proxy Gateway & Keys', icon: KeyRound, tag: 'Virtual Keys' },
  ];

  const opsNavItems: { id: NavItem; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'live-stream', label: 'Control Tower', icon: Radio, badge: pendingApprovalsCount },
    { id: 'overview', label: 'Fleet Overview', icon: LayoutDashboard },
    { id: 'studio', label: 'Agent Studio', icon: Sparkles },
  ];

  const governanceNavItems: { id: NavItem; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'policies', label: 'Policy Studio', icon: ShieldCheck },
    { id: 'compliance', label: 'Compliance & Audit', icon: FileCheck },
    { id: 'analytics', label: 'Cost & Analytics', icon: TrendingDown },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col justify-between border-r border-yellow-300/40 dark:border-yellow-500/20 bg-white/90 dark:bg-[#080911]/95 backdrop-blur-md select-none transition-colors duration-200 z-30">
      {/* Top Header & Workspace Branding */}
      <div>
        <div className="h-14 px-4 flex items-center justify-between border-b border-yellow-300/40 dark:border-yellow-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-yellow-400 text-slate-950 flex items-center justify-center font-black text-xs tracking-wider shadow-sm shadow-yellow-500/20 dark:shadow-[0_0_14px_rgba(250,204,21,0.45)]">
              AL
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs tracking-tight text-slate-950 dark:text-white">AgentLens</span>
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-yellow-100 dark:bg-yellow-950/50 text-amber-900 dark:text-yellow-300 font-bold border border-yellow-300/80 dark:border-yellow-500/40">
                  Console
                </span>
              </div>
              <p className="text-[10px] font-semibold text-slate-700 dark:text-slate-400 truncate max-w-[130px]">
                {currentOrg.name}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation List - Purely Workspace */}
        <div className="px-3 py-3 space-y-4">
          {/* Core Features */}
          <div className="space-y-0.5">
            <div className="px-2 py-1 text-[10px] font-bold text-amber-900 dark:text-yellow-400/90 uppercase tracking-wider font-mono">
              Agents & Gateway
            </div>
            {coreNavItems.map(({ id, label, icon: Icon, badge, tag }) => {
              const isActive = activeNav === id;
              return (
                <button
                  key={id}
                  id={`nav-item-${id}`}
                  onClick={() => setActiveNav(id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-yellow-400/25 text-slate-950 font-bold border border-yellow-400/70 shadow-xs dark:bg-yellow-400/15 dark:text-yellow-300 dark:border-yellow-400/40 dark:shadow-[0_0_12px_rgba(250,204,21,0.15)]'
                      : 'text-slate-800 hover:bg-yellow-100/40 dark:text-slate-300 dark:hover:bg-[#15192c] dark:hover:text-yellow-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-amber-700 dark:text-yellow-400' : 'text-slate-600 dark:text-slate-400'}`} />
                    <span className="truncate">{label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {badge !== undefined && badge > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-yellow-200 dark:bg-yellow-950/60 text-slate-900 dark:text-yellow-300 border border-yellow-300/80 dark:border-yellow-500/30">
                        {badge}
                      </span>
                    )}
                    {tag && !badge && (
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-yellow-100/80 dark:bg-[#181d30] text-amber-900 dark:text-yellow-300 border border-yellow-200 dark:border-[#262c47]">
                        {tag}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Operations & Control */}
          <div className="space-y-0.5">
            <div className="px-2 py-1 text-[10px] font-bold text-amber-900 dark:text-yellow-400/90 uppercase tracking-wider font-mono">
              Operations
            </div>
            {opsNavItems.map(({ id, label, icon: Icon, badge }) => {
              const isActive = activeNav === id;
              return (
                <button
                  key={id}
                  id={`nav-item-${id}`}
                  onClick={() => setActiveNav(id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-yellow-400/25 text-slate-950 font-bold border border-yellow-400/70 shadow-xs dark:bg-yellow-400/15 dark:text-yellow-300 dark:border-yellow-400/40 dark:shadow-[0_0_12px_rgba(250,204,21,0.15)]'
                      : 'text-slate-800 hover:bg-yellow-100/40 dark:text-slate-300 dark:hover:bg-[#15192c] dark:hover:text-yellow-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-amber-700 dark:text-yellow-400' : 'text-slate-600 dark:text-slate-400'}`} />
                    <span className="truncate">{label}</span>
                  </div>

                  {badge !== undefined && badge > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-400/25 text-amber-950 dark:text-yellow-300 border border-amber-400/50">
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Governance & Compliance */}
          <div className="space-y-0.5">
            <div className="px-2 py-1 text-[10px] font-bold text-amber-900 dark:text-yellow-400/90 uppercase tracking-wider font-mono">
              Governance & Audit
            </div>
            {governanceNavItems.map(({ id, label, icon: Icon, badge }) => {
              const isActive = activeNav === id;
              return (
                <button
                  key={id}
                  id={`nav-item-${id}`}
                  onClick={() => setActiveNav(id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-yellow-400/25 text-slate-950 font-bold border border-yellow-400/70 shadow-xs dark:bg-yellow-400/15 dark:text-yellow-300 dark:border-yellow-400/40 dark:shadow-[0_0_12px_rgba(250,204,21,0.15)]'
                      : 'text-slate-800 hover:bg-yellow-100/40 dark:text-slate-300 dark:hover:bg-[#15192c] dark:hover:text-yellow-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-amber-700 dark:text-yellow-400' : 'text-slate-600 dark:text-slate-400'}`} />
                    <span className="truncate">{label}</span>
                  </div>

                  {badge !== undefined && badge > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-yellow-200 dark:bg-yellow-950/60 text-slate-900 dark:text-yellow-300 border border-yellow-300/80">
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Controls (Theme, Sound, Gateway Status) */}
      <div className="p-3 border-t border-yellow-300/40 dark:border-yellow-500/20 space-y-2 bg-white/50 dark:bg-[#07080d]/60">
        {/* Gateway Real-Time Status */}
        <div className="px-2.5 py-1.5 rounded-lg bg-white/90 dark:bg-[#111422] border border-yellow-300/50 dark:border-yellow-500/25 flex items-center justify-between text-xs shadow-2xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] font-bold text-slate-900 dark:text-slate-200">Gateway Online</span>
          </div>
          <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">0.8ms</span>
        </div>

        {/* Quick Utility Toggles */}
        <div className="flex items-center justify-between px-1">
          <button
            id="toggle-theme-btn"
            onClick={toggleTheme}
            className="flex items-center gap-1.5 text-xs text-slate-800 hover:text-slate-950 dark:text-yellow-300 dark:hover:text-yellow-100 py-1 px-1.5 rounded-md hover:bg-yellow-100/70 dark:hover:bg-[#161a2d] transition-colors cursor-pointer"
            title="Toggle Dark / Light Theme"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
                <span className="text-[11px] font-bold">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-800" />
                <span className="text-[11px] font-bold text-slate-900">Dark</span>
              </>
            )}
          </button>

          <button
            id="toggle-sound-btn"
            onClick={toggleSound}
            className="flex items-center gap-1 text-xs text-slate-800 hover:text-slate-950 dark:text-yellow-300 dark:hover:text-yellow-100 py-1 px-1.5 rounded-md hover:bg-yellow-100/70 dark:hover:bg-[#161a2d] transition-colors cursor-pointer"
            title="Toggle Audio Notifications"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-amber-600 dark:text-yellow-400" />
                <span className="text-[11px] font-bold">Chime</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] font-medium">Muted</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
