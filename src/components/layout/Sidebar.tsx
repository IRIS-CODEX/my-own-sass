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
  Server,
  Share2,
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
    { id: 'workflow', label: 'Flow & Integrations', icon: Share2, tag: 'n8n' },
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
    <aside className="w-64 flex-shrink-0 flex flex-col justify-between border-r border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5]/95 dark:bg-[#181715]/95 backdrop-blur-md select-none transition-colors duration-200 z-30">
      {/* Top Header & Workspace Branding */}
      <div>
        <div className="h-14 px-4 flex items-center justify-between border-b border-[#e5e0d5] dark:border-[#33302b]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#d97706] dark:bg-[#f59e0b] text-white dark:text-[#181715] flex items-center justify-center font-black text-xs tracking-wider shadow-xs">
              AL
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs tracking-tight text-[#1f1e1b] dark:text-[#f5f3ef]">AgentLens</span>
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-[#b45309] dark:text-[#fbbf24] font-bold border border-amber-500/20">
                  Console
                </span>
              </div>
              <p className="text-[10px] font-semibold text-[#5c5850] dark:text-[#b8b4aa] truncate max-w-[130px]">
                {currentOrg.name}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation List - Purely Workspace */}
        <div className="px-3 py-3 space-y-4">
          {/* Core Features */}
          <div className="space-y-0.5">
            <div className="px-2 py-1 text-[10px] font-bold text-[#878278] dark:text-[#7d7970] uppercase tracking-wider font-mono">
              Agents & Gateway
            </div>
            {coreNavItems.map(({ id, label, icon: Icon, badge, tag }) => {
              const isActive = activeNav === id;
              return (
                <button
                  key={id}
                  id={`nav-item-${id}`}
                  onClick={() => setActiveNav(id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-[#211f1c] text-[#1f1e1b] dark:text-[#f5f3ef] font-bold border border-[#e5e0d5] dark:border-[#33302b] shadow-xs'
                      : 'text-[#5c5850] hover:text-[#1f1e1b] hover:bg-[#f4f1ea] dark:text-[#b8b4aa] dark:hover:text-[#f5f3ef] dark:hover:bg-[#211f1c]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#d97706] dark:text-[#f59e0b]' : 'text-[#878278] dark:text-[#7d7970]'}`} />
                    <span className="truncate">{label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {badge !== undefined && badge > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500/10 text-[#b45309] dark:text-[#fbbf24] border border-amber-500/20">
                        {badge}
                      </span>
                    )}
                    {tag && !badge && (
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#f4f1ea] dark:bg-[#282622] text-[#5c5850] dark:text-[#b8b4aa] border border-[#e5e0d5] dark:border-[#33302b]">
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
            <div className="px-2 py-1 text-[10px] font-bold text-[#878278] dark:text-[#7d7970] uppercase tracking-wider font-mono">
              Operations
            </div>
            {opsNavItems.map(({ id, label, icon: Icon, badge }) => {
              const isActive = activeNav === id;
              return (
                <button
                  key={id}
                  id={`nav-item-${id}`}
                  onClick={() => setActiveNav(id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-[#211f1c] text-[#1f1e1b] dark:text-[#f5f3ef] font-bold border border-[#e5e0d5] dark:border-[#33302b] shadow-xs'
                      : 'text-[#5c5850] hover:text-[#1f1e1b] hover:bg-[#f4f1ea] dark:text-[#b8b4aa] dark:hover:text-[#f5f3ef] dark:hover:bg-[#211f1c]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#d97706] dark:text-[#f59e0b]' : 'text-[#878278] dark:text-[#7d7970]'}`} />
                    <span className="truncate">{label}</span>
                  </div>

                  {badge !== undefined && badge > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500/10 text-[#b45309] dark:text-[#fbbf24] border border-amber-500/20">
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Governance & Compliance */}
          <div className="space-y-0.5">
            <div className="px-2 py-1 text-[10px] font-bold text-[#878278] dark:text-[#7d7970] uppercase tracking-wider font-mono">
              Governance & Audit
            </div>
            {governanceNavItems.map(({ id, label, icon: Icon, badge }) => {
              const isActive = activeNav === id;
              return (
                <button
                  key={id}
                  id={`nav-item-${id}`}
                  onClick={() => setActiveNav(id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-[#211f1c] text-[#1f1e1b] dark:text-[#f5f3ef] font-bold border border-[#e5e0d5] dark:border-[#33302b] shadow-xs'
                      : 'text-[#5c5850] hover:text-[#1f1e1b] hover:bg-[#f4f1ea] dark:text-[#b8b4aa] dark:hover:text-[#f5f3ef] dark:hover:bg-[#211f1c]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#d97706] dark:text-[#f59e0b]' : 'text-[#878278] dark:text-[#7d7970]'}`} />
                    <span className="truncate">{label}</span>
                  </div>

                  {badge !== undefined && badge > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500/10 text-[#b45309] dark:text-[#fbbf24] border border-amber-500/20">
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
      <div className="p-3 border-t border-[#e5e0d5] dark:border-[#33302b] space-y-2 bg-[#faf8f5]/60 dark:bg-[#181715]/60">
        {/* Gateway Real-Time Status */}
        <div className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] flex items-center justify-between text-xs shadow-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">Gateway Online</span>
          </div>
          <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">0.8ms</span>
        </div>

        {/* Quick Utility Toggles */}
        <div className="flex items-center justify-between px-1">
          <button
            id="toggle-theme-btn"
            onClick={toggleTheme}
            className="flex items-center gap-1.5 text-xs text-[#5c5850] hover:text-[#1f1e1b] dark:text-[#b8b4aa] dark:hover:text-[#f5f3ef] py-1 px-2 rounded-lg hover:bg-[#f4f1ea] dark:hover:bg-[#211f1c] transition-colors cursor-pointer"
            title="Toggle Dark / Light Theme"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-[#f59e0b] animate-pulse" />
                <span className="text-[11px] font-bold">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-[#5c5850]" />
                <span className="text-[11px] font-bold text-[#1f1e1b]">Dark</span>
              </>
            )}
          </button>

          <button
            id="toggle-sound-btn"
            onClick={toggleSound}
            className="flex items-center gap-1 text-xs text-[#5c5850] hover:text-[#1f1e1b] dark:text-[#b8b4aa] dark:hover:text-[#f5f3ef] py-1 px-2 rounded-lg hover:bg-[#f4f1ea] dark:hover:bg-[#211f1c] transition-colors cursor-pointer"
            title="Toggle Audio Notifications"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#d97706] dark:text-[#f59e0b]" />
                <span className="text-[11px] font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">Chime</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-[#878278]" />
                <span className="text-[11px] font-medium">Muted</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
