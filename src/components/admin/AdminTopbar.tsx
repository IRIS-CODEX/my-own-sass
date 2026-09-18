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

export const AdminTopbar: React.FC = () => {
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
    <header className="h-16 px-6 bg-white/90 dark:bg-[#080a14]/90 backdrop-blur-xl border-b border-yellow-300/50 dark:border-yellow-500/20 flex items-center justify-between gap-4 select-none">
      {/* Left: Breadcrumbs & Current Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-xs font-mono font-bold text-amber-800 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-950/60 px-2 py-0.5 rounded border border-yellow-300 dark:border-yellow-500/30 shrink-0">
          SaaS Central
        </span>
        <span className="text-slate-400 dark:text-slate-600">/</span>
        <h1 className="text-sm font-black text-slate-950 dark:text-white truncate">
          {getPageTitle()}
        </h1>
      </div>

      {/* Right: Search, Health, Controls */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative w-48 sm:w-64 hidden md:block">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tenant or email..."
            className="w-full bg-yellow-50/50 dark:bg-[#121524] border border-yellow-300/70 dark:border-yellow-500/30 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-950 dark:text-white placeholder-slate-500 focus:outline-hidden focus:border-yellow-500 font-medium"
          />
        </div>

        {/* Live Cluster Health Badge */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-mono text-[11px] font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Cluster: 12/12 Online (14ms)</span>
        </div>

        {/* Kill Switch Toggle */}
        <button
          onClick={toggleGlobalKillSwitch}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            globalKillSwitchActive
              ? 'bg-rose-600 text-white animate-pulse shadow-md'
              : 'bg-yellow-50 hover:bg-rose-50 dark:bg-yellow-950/30 dark:hover:bg-rose-950/40 text-slate-800 dark:text-slate-200 border border-yellow-300/70 dark:border-yellow-500/30 hover:border-rose-400'
          }`}
          title={globalKillSwitchActive ? 'Disengage Circuit Breaker' : 'Engage Emergency Kill-Switch'}
        >
          <OctagonAlert className={`w-3.5 h-3.5 ${globalKillSwitchActive ? 'text-white' : 'text-rose-500'}`} />
          <span className="hidden sm:inline">
            {globalKillSwitchActive ? 'Kill-Switch ON' : 'Emergency Breaker'}
          </span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-yellow-300/70 dark:border-yellow-500/30 text-slate-700 dark:text-yellow-300 hover:bg-yellow-100/60 dark:hover:bg-yellow-950/40 transition-all cursor-pointer"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs transition-all shadow-xs cursor-pointer border border-yellow-300"
          title="Return to customer frontend application"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Customer App</span>
        </button>
      </div>
    </header>
  );
};
