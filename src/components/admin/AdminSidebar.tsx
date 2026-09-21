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
  Tag,
  ShieldCheck,
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
      label: 'Tenant Customers & Users',
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
      id: 'roles',
      label: 'SaaS Staff & Roles (RBAC)',
      icon: ShieldCheck,
      badge: 'Internal',
    },
    {
      id: 'settings',
      label: 'SaaS Platform Config',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-68 h-full flex flex-col justify-between bg-[#faf8f5]/95 dark:bg-[#181715]/95 backdrop-blur-xl border-r border-[#e5e0d5] dark:border-[#33302b] p-4 select-none">
      {/* Top Identity Header */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-xl bg-[#d97706] dark:bg-[#f59e0b] text-white dark:text-[#181715] flex items-center justify-center font-black text-lg shadow-xs">
            👑
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-[#1f1e1b] dark:text-[#f5f3ef] tracking-tight">
                SaaS Central
              </span>
              <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-amber-500/10 text-[#b45309] dark:text-[#fbbf24] border border-amber-500/20">
                ROOT
              </span>
            </div>
            <p className="text-[10px] font-mono text-[#5c5850] dark:text-[#b8b4aa]">
              Back-System Management
            </p>
          </div>
        </div>

        {/* Global Circuit Breaker Quick Alert (if engaged) */}
        {globalKillSwitchActive && (
          <div className="p-3 rounded-xl bg-rose-600/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-[11px] font-bold space-y-1 animate-pulse">
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>KILL-SWITCH ENGAGED</span>
            </div>
            <p className="text-[10px] font-normal leading-tight text-rose-600/80 dark:text-rose-300/80">
              Gateway proxy suspended globally.
            </p>
          </div>
        )}

        {/* Navigation Deck */}
        <div className="space-y-1">
          <div className="px-2 pb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#878278] dark:text-[#7d7970]">
            Operations &amp; Control
          </div>

          {navItems.map(({ id, label, icon: Icon, badge, alert }) => {
            const isActive = adminActivePage === id;
            return (
              <button
                key={id}
                id={`admin-nav-${id}`}
                onClick={() => setAdminActivePage(id)}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-[#211f1c] text-[#1f1e1b] dark:text-[#f5f3ef] shadow-xs border border-[#e5e0d5] dark:border-[#33302b] font-bold'
                    : 'text-[#5c5850] dark:text-[#b8b4aa] hover:bg-[#f4f1ea] dark:hover:bg-[#211f1c] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${alert ? 'text-rose-600 dark:text-rose-400 animate-pulse' : isActive ? 'text-[#d97706] dark:text-[#f59e0b]' : 'text-[#878278] dark:text-[#7d7970]'}`} />
                  <span className="truncate">{label}</span>
                </div>

                {badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                      alert
                        ? 'bg-rose-600 text-white font-bold'
                        : 'bg-amber-500/10 text-[#b45309] dark:text-[#fbbf24] border border-amber-500/20'
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
      <div className="space-y-3 pt-4 border-t border-[#e5e0d5] dark:border-[#33302b]">
        {/* Super-Admin Session Card */}
        <div className="p-3 rounded-xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] space-y-1 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#b45309] dark:text-[#fbbf24]">
              OPERATOR LEVEL 0
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="font-bold text-xs text-[#1f1e1b] dark:text-[#f5f3ef] truncate">
            {adminUser?.email || 'root@agentlens.internal'}
          </div>
          <div className="text-[10px] font-mono text-[#878278] dark:text-[#7d7970]">
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
            className="px-2.5 py-2 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] text-[11px] font-semibold text-[#5c5850] dark:text-[#b8b4aa] hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
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
            className="px-2.5 py-2 rounded-xl bg-[#d97706] hover:bg-[#b45309] dark:bg-[#f59e0b] dark:hover:bg-[#fbbf24] text-white dark:text-[#181715] text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
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
          className="w-full py-1.5 px-2 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] hover:bg-[#f4f1ea] dark:hover:bg-[#282622] text-[#1f1e1b] dark:text-[#f5f3ef] text-[10px] font-mono font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
        >
          <span>↗ View Public Portfolio Website</span>
        </button>
      </div>
    </aside>
  );
};
