import React from 'react';
import {
  ShieldAlert,
  Server,
  Sun,
  Moon,
  Search,
  ArrowLeft,
  Bell,
  CheckCircle2,
  Lock,
  OctagonAlert
} from 'lucide-react';
import { useAdminStore } from '../../stores/useAdminStore';
import { useAppStore } from '../../stores/useAppStore';
import { CloudSqlDiagnosticIndicator } from './CloudSqlDiagnosticIndicator';

interface AdminTopbarProps {
  onOpenCloudSqlDiagnostics?: () => void;
}

export const AdminTopbar: React.FC<AdminTopbarProps> = ({ onOpenCloudSqlDiagnostics }) => {
  const {
    adminActivePage,
    searchQuery,
    setSearchQuery,
    globalKillSwitchActive,
    toggleGlobalKillSwitch,
  } = useAdminStore();

  const { theme, toggleTheme, setIsAdminView, addToast } = useAppStore();

  const getPageTitle = () => {
    switch (adminActivePage) {
      case 'dashboard':
        return 'Executive Revenue & MRR Intelligence';
      case 'tenants':
        return 'Users & Tenant Organization Directory';
      case 'unpaid':
        return 'Unpaid Accounts & Dunning Radar';
      case 'pricing':
        return 'Portfolio Package & Price Management Studio';
      case 'security':
        return 'Security Audit & Threat Prevention';
      case 'gateway':
        return 'Gateway Fleet & Cluster Ingress';
      case 'settings':
        return 'SaaS Platform Configuration';
      default:
        return 'Back-System Management';
    }
  };

  return (
    <header className="h-16 px-6 bg-[#faf8f5]/90 dark:bg-[#181715]/90 backdrop-blur-xl border-b border-[#e5e0d5] dark:border-[#33302b] flex items-center justify-between gap-4 select-none">
      {/* Left: Breadcrumbs & Current Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-xs font-mono font-bold text-[#b45309] dark:text-[#fbbf24] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 shrink-0">
          SaaS Central
        </span>
        <span className="text-[#878278] dark:text-[#7d7970]">/</span>
        <h1 className="text-sm font-bold text-[#1f1e1b] dark:text-[#f5f3ef] truncate">
          {getPageTitle()}
        </h1>
      </div>

      {/* Right: Search, Cloud SQL Diagnostic, Health, Controls */}
      <div className="flex items-center gap-2.5">
        {/* Search */}
        <div className="relative w-40 sm:w-56 hidden xl:block">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#878278] dark:text-[#7d7970]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tenant or email..."
            className="w-full bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#1f1e1b] dark:text-[#f5f3ef] placeholder-[#878278] dark:placeholder-[#7d7970] focus:outline-hidden focus:border-[#d97706] dark:focus:border-[#f59e0b] font-medium shadow-xs"
          />
        </div>

        {/* Real-time Cloud SQL Diagnostic Indicator */}
        <CloudSqlDiagnosticIndicator onOpenFullModal={onOpenCloudSqlDiagnostics} />

        {/* Live Cluster Health Badge */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-neutral-500/10 border border-[#e5e0d5] dark:border-[#33302b] text-[#5c5850] dark:text-[#b8b4aa] font-mono text-[11px] font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Cluster: 12/12</span>
        </div>

        {/* Kill Switch Toggle */}
        <button
          onClick={toggleGlobalKillSwitch}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
            globalKillSwitchActive
              ? 'bg-rose-600 text-white animate-pulse'
              : 'bg-white hover:bg-rose-50 dark:bg-[#211f1c] dark:hover:bg-rose-950/40 text-[#1f1e1b] dark:text-[#f5f3ef] border border-[#e5e0d5] dark:border-[#33302b] hover:border-rose-400'
          }`}
          title={globalKillSwitchActive ? 'Disengage Circuit Breaker' : 'Engage Emergency Kill-Switch'}
        >
          <OctagonAlert className={`w-3.5 h-3.5 ${globalKillSwitchActive ? 'text-white' : 'text-rose-500'}`} />
          <span className="hidden sm:inline">
            {globalKillSwitchActive ? 'Kill-Switch ON' : 'Emergency'}
          </span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] text-[#5c5850] dark:text-[#b8b4aa] hover:bg-[#f4f1ea] dark:hover:bg-[#282622] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef] transition-all cursor-pointer shadow-xs"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-[#f59e0b]" /> : <Moon className="w-4 h-4 text-[#5c5850]" />}
        </button>

        {/* Return to Customer App */}
        <button
          onClick={() => {
            setIsAdminView(false);
            addToast({
              title: 'Customer Workspace',
              description: 'Returned to standard client dashboard.',
              type: 'info',
            });
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#d97706] hover:bg-[#b45309] dark:bg-[#f59e0b] dark:hover:bg-[#fbbf24] text-white dark:text-[#181715] font-semibold text-xs transition-all shadow-xs cursor-pointer"
          title="Return to customer frontend application"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Customer App</span>
        </button>
      </div>
    </header>
  );
};

