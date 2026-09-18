import React from 'react';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  ShieldAlert,
  Server,
  Settings,
  LogOut,
  ArrowLeft,
  BadgeAlert,
  Zap,
  Lock,
  Tag
} from 'lucide-react';
import { useAdminStore, AdminPage } from '../../stores/useAdminStore';
import { useAppStore } from '../../stores/useAppStore';

export const AdminSidebar: React.FC = () => {
  const {
    adminActivePage,
    setAdminActivePage,
    adminUser,
    adminLogout,
    tenants,
    pricingPackages,
    globalKillSwitchActive,
    toggleGlobalKillSwitch
  } = useAdminStore();

  const { setIsAdminView, addToast } = useAppStore();

  const unpaidCount = tenants.filter(
    (t) => t.status === 'PAST_DUE' || (t.unpaidBalanceUsd && t.unpaidBalanceUsd > 0)
  ).length;

  const navItems: { id: AdminPage; label: string; icon: any; badge?: string; alert?: boolean }[] = [
    {
      id: 'dashboard',
      label: 'Executive Dashboard & MRR',
      icon: LayoutDashboard,
    },
    {
      id: 'tenants',
      label: 'Users & Tenant Roster',
      icon: Users,
      badge: `${tenants.length} orgs`,
    },
    {
      id: 'unpaid',
      label: 'Unpaid & Dunning Radar',
      icon: CreditCard,
      badge: unpaidCount > 0 ? `${unpaidCount} Overdue` : undefined,
      alert: unpaidCount > 0,
    },
    {
      id: 'pricing',
      label: 'Package & Price Studio',
      icon: Tag,
      badge: `${pricingPackages?.length || 4} tiers`,
    },
    {
      id: 'security',
      label: 'Security & Threat Audit',
      icon: ShieldAlert,
    },
    {
      id: 'gateway',
      label: 'Gateway Fleet & Cluster',
      icon: Server,
    },
    {
      id: 'settings',
      label: 'SaaS Platform Config',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-68 h-full flex flex-col justify-between bg-white/95 dark:bg-[#070912]/95 backdrop-blur-xl border-r border-yellow-300/50 dark:border-yellow-500/20 p-4 select-none">
      {/* Top Identity Header */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-xl bg-yellow-400 text-slate-950 flex items-center justify-center font-black text-lg shadow-sm">
            👑
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm text-slate-950 dark:text-white tracking-tight">
                SaaS Central
              </span>
              <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-yellow-400 text-slate-950">
                ROOT
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-600 dark:text-slate-400">
              Back-System Management
            </p>
          </div>
        </div>

        {/* Global Circuit Breaker Quick Alert (if engaged) */}
        {globalKillSwitchActive && (
          <div className="p-3 rounded-xl bg-rose-600/20 border border-rose-600 text-rose-700 dark:text-rose-300 text-[11px] font-bold space-y-1 animate-pulse">
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>KILL-SWITCH ENGAGED</span>
            </div>
            <p className="text-[10px] font-normal leading-tight">
              Gateway proxy suspended globally.
            </p>
          </div>
        )}

        {/* Navigation Deck */}
        <div className="space-y-1">
          <div className="px-2 pb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Operations &amp; Control
          </div>

          {navItems.map(({ id, label, icon: Icon, badge, alert }) => {
            const isActive = adminActivePage === id;
            return (
              <button
                key={id}
                id={`admin-nav-${id}`}
                onClick={() => setAdminActivePage(id)}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                  isActive
                    ? 'bg-yellow-400 text-slate-950 shadow-sm border border-yellow-300 font-black'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-yellow-400/15 dark:hover:bg-yellow-950/30'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${alert ? 'text-rose-600 dark:text-rose-400 animate-pulse' : ''}`} />
                  <span className="truncate">{label}</span>
                </div>

                {badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                      alert
                        ? 'bg-rose-600 text-white font-black'
                        : isActive
                        ? 'bg-yellow-200 text-slate-950'
                        : 'bg-yellow-100 dark:bg-yellow-950/60 text-slate-800 dark:text-yellow-300'
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Super-Admin Profile & System Escape */}
      <div className="space-y-3 pt-4 border-t border-yellow-200/60 dark:border-yellow-500/15">
        {/* Super-Admin Session Card */}
        <div className="p-3 rounded-xl bg-yellow-50/60 dark:bg-[#111424] border border-yellow-300/50 dark:border-yellow-500/20 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-amber-900 dark:text-yellow-400">
              OPERATOR LEVEL 0
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="font-bold text-xs text-slate-950 dark:text-white truncate">
            {adminUser?.email || 'root@agentlens.internal'}
          </div>
          <div className="text-[10px] font-mono text-slate-600 dark:text-slate-400">
            Signed in: {adminUser?.loginTime || 'Active'}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              adminLogout();
              addToast({
                title: 'Root Console Locked',
                description: 'Super-admin session terminated successfully.',
                type: 'info',
              });
            }}
            className="px-2.5 py-2 rounded-xl border border-yellow-300/70 dark:border-yellow-500/30 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-rose-500/10 hover:text-rose-600 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            title="Lock Console and Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>

          <button
            onClick={() => {
              setIsAdminView(false);
              addToast({
                title: 'Customer Workspace',
                description: 'Returned to standard frontend app.',
                type: 'info',
              });
            }}
            className="px-2.5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs border border-yellow-300"
            title="Switch to customer dashboard"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Workspace</span>
          </button>
        </div>

        {/* Public Website Preview Link */}
        <button
          onClick={() => {
            setIsAdminView(false);
            useAppStore.getState().setIsLandingPage(true);
          }}
          className="w-full py-1.5 px-2 rounded-lg border border-yellow-400/30 bg-yellow-400/5 hover:bg-yellow-400/15 text-yellow-800 dark:text-yellow-400 text-[10px] font-mono font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>↗ View Public Portfolio Website</span>
        </button>
      </div>
    </aside>
  );
};
