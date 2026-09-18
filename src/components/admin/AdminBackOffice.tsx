import React, { useState } from 'react';
import {
  ShieldAlert,
  Server,
  DollarSign,
  TrendingUp,
  Users,
  Activity,
  AlertTriangle,
  Lock,
  Search,
  Eye,
  Sliders,
  OctagonAlert,
  Play,
  RotateCcw,
  CheckCircle2,
  Cpu,
  Layers,
  Zap,
  X,
  CreditCard,
  Mail,
  Calendar,
  Clock,
  ArrowUpRight,
  UserCheck,
  UserX,
  AlertOctagon,
  RefreshCw,
  Send,
  Building,
  Filter,
  Check,
  ChevronRight,
  BadgeAlert,
  ArrowLeft,
  BellRing
} from 'lucide-react';
import { useAdminStore } from '../../stores/useAdminStore';
import { useAppStore } from '../../stores/useAppStore';
import { TenantAdmin } from '../../types';

export const AdminBackOffice: React.FC = () => {
  const {
    tenants,
    violations,
    recentTransactions,
    globalKillSwitchActive,
    toggleGlobalKillSwitch,
    searchQuery,
    setSearchQuery,
    selectedTenant,
    setSelectedTenant,
    quotaModalOpen,
    setQuotaModalOpen,
    updateTenantQuota,
    changeTenantPlan,
    markTenantPaid,
    retryTenantPayment,
    grantGracePeriod,
    suspendTenant,
    reactivateTenant,
    sendDunningEmail,
    sendBulkDunningReminders,
    autoFreezeAllOverdue,
    saasConfig,
    updateSaaSConfig,
    globalAnnouncement,
    setGlobalAnnouncement
  } = useAdminStore();

  const { addToast, setIsAdminView } = useAppStore();

  // Tab state in admin
  const [activeAdminTab, setActiveAdminTab] = useState<'revenue' | 'users' | 'unpaid' | 'platform'>('revenue');

  // Filters for Users tab
  const [userFilterStatus, setUserFilterStatus] = useState<'ALL' | 'ACTIVE' | 'PAST_DUE' | 'FREE' | 'SUSPENDED'>('ALL');

  // Quota & Plan Override Modals
  const [planModalTenant, setPlanModalTenant] = useState<TenantAdmin | null>(null);
  const [targetPlan, setTargetPlan] = useState<TenantAdmin['planTier']>('PRO_MONTHLY');

  const [newQuotaLimit, setNewQuotaLimit] = useState(300000);
  const [extraDays, setExtraDays] = useState(14);

  // Announcement Input
  const [announcementText, setAnnouncementText] = useState(globalAnnouncement || '');

  // Calculate SaaS Financial KPIs
  const totalMRR = tenants
    .filter((t) => t.status === 'ACTIVE' || t.status === 'PAST_DUE')
    .reduce((acc, t) => acc + (t.monthlySpendUsd || 0), 0);
  const totalARR = totalMRR * 12;
  const activePaidCount = tenants.filter((t) => t.status === 'ACTIVE' && t.planTier !== 'FREE').length;
  const unpaidTenants = tenants.filter((t) => t.status === 'PAST_DUE' || (t.unpaidBalanceUsd && t.unpaidBalanceUsd > 0));
  const totalOverdueDebt = unpaidTenants.reduce((acc, t) => acc + (t.unpaidBalanceUsd || 0), 0);
  const suspendedCount = tenants.filter((t) => t.status === 'SUSPENDED').length;

  const openQuotaOverride = (tenant: TenantAdmin) => {
    setSelectedTenant(tenant);
    setNewQuotaLimit(tenant.requestLimit + 50000);
    setQuotaModalOpen(true);
  };

  const handleSaveQuota = () => {
    if (!selectedTenant) return;
    updateTenantQuota(selectedTenant.id, newQuotaLimit, extraDays);
    addToast({
      title: 'Quota & Period Updated',
      description: `Updated request limit to ${newQuotaLimit.toLocaleString()} and extended subscription for ${selectedTenant.name}.`,
      type: 'success'
    });
  };

  const handleChangePlanSubmit = () => {
    if (!planModalTenant) return;
    changeTenantPlan(planModalTenant.id, targetPlan);
    addToast({
      title: 'Subscription Tier Changed',
      description: `Updated ${planModalTenant.name} subscription plan to ${targetPlan}.`,
      type: 'success'
    });
    setPlanModalTenant(null);
  };

  const handleRetryPayment = (tenant: TenantAdmin) => {
    const result = retryTenantPayment(tenant.id);
    if (result.success) {
      addToast({
        title: 'Payment Recovered',
        description: result.message,
        type: 'success'
      });
    } else {
      addToast({
        title: 'Charge Attempt Failed',
        description: result.message,
        type: 'error'
      });
    }
  };

  const handleSendDunningNotice = (tenant: TenantAdmin) => {
    sendDunningEmail(tenant.id);
    addToast({
      title: 'Dunning Notice Dispatched',
      description: `Urgent invoice notification sent to ${tenant.ownerEmail} (${tenant.name}).`,
      type: 'info'
    });
  };

  const handleBulkDunning = () => {
    const count = sendBulkDunningReminders();
    addToast({
      title: 'Bulk Dunning Emails Sent',
      description: `Sent urgent payment notices to ${count} past-due tenant accounts.`,
      type: 'success'
    });
  };

  const handleAutoFreeze = () => {
    const count = autoFreezeAllOverdue();
    addToast({
      title: 'Overdue Gate Enforced',
      description: `Suspended ${count} tenants whose unpaid status exceeded the grace period (${saasConfig.gracePeriodDays} days).`,
      type: 'warning'
    });
  };

  const filteredTenants = tenants.filter((t) => {
    const matchesQuery =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.ownerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.ownerName && t.ownerName.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesQuery) return false;

    if (userFilterStatus === 'ACTIVE') return t.status === 'ACTIVE' && t.planTier !== 'FREE';
    if (userFilterStatus === 'PAST_DUE') return t.status === 'PAST_DUE' || (t.unpaidBalanceUsd && t.unpaidBalanceUsd > 0);
    if (userFilterStatus === 'FREE') return t.planTier === 'FREE';
    if (userFilterStatus === 'SUSPENDED') return t.status === 'SUSPENDED';

    return true;
  });

  return (
    <div className="space-y-8 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Global Emergency Kill Switch Alert Bar (If Triggered) */}
      {globalKillSwitchActive && (
        <div className="p-4 rounded-xl bg-rose-600 text-white font-bold flex items-center justify-between shadow-xl animate-pulse">
          <div className="flex items-center gap-3">
            <OctagonAlert className="w-6 h-6 shrink-0" />
            <div>
              <span className="text-sm uppercase tracking-wider font-mono">
                PLATFORM-WIDE CIRCUIT BREAKER TRIPPED
              </span>
              <p className="text-xs text-rose-100 font-normal">
                All upstream Gateway dispatching is globally halted. All tenant ingress connections return HTTP 503.
              </p>
            </div>
          </div>
          <button
            onClick={toggleGlobalKillSwitch}
            className="px-4 py-2 bg-white text-rose-600 hover:bg-neutral-100 font-bold text-xs rounded-lg transition-all cursor-pointer"
          >
            Disengage Global Kill-Switch
          </button>
        </div>
      )}

      {/* Admin Top Master Header & Navigation Deck */}
      <div className="rounded-2xl bg-white/85 dark:bg-[#0c0e18]/85 backdrop-blur-md border border-yellow-300/40 dark:border-yellow-500/20 p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-yellow-200/50 dark:border-yellow-500/15 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400 text-slate-950 flex items-center justify-center font-black text-base shadow-sm">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-slate-950 dark:text-white">
                  SaaS Master Admin Panel
                </h1>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-yellow-100 dark:bg-yellow-950/60 text-amber-900 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-500/30">
                  Root SaaS Controls
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                  Production Mode
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                Manage registered user tenants, subscription revenue, unpaid customer accounts, and global SaaS configuration.
              </p>
            </div>
          </div>

          <button
            id="return-to-workspace-btn"
            onClick={() => {
              setIsAdminView(false);
              addToast({
                title: 'Exited Super-Admin',
                description: 'Returned to standard Customer Workspace.',
                type: 'info'
              });
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-yellow-300/70 dark:border-yellow-500/30 bg-yellow-50 hover:bg-yellow-100/80 dark:bg-yellow-950/30 dark:hover:bg-yellow-900/40 text-xs font-bold text-slate-950 dark:text-yellow-300 transition-all shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Workspace</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'revenue', label: '1. Revenue & MRR Intelligence', icon: DollarSign, badge: `$${totalMRR.toLocaleString()}/mo` },
              { id: 'users', label: '2. User & Tenant Directory', icon: Users, badge: `${tenants.length} tenants` },
              { id: 'unpaid', label: '3. Unpaid & Dunning Radar', icon: BadgeAlert, badge: unpaidTenants.length > 0 ? `${unpaidTenants.length} Overdue` : undefined, alert: unpaidTenants.length > 0 },
              { id: 'platform', label: '4. Platform Health & Kill-Switch', icon: Server },
            ].map(({ id, label, icon: Icon, badge, alert }) => (
              <button
                key={id}
                id={`admin-tab-${id}`}
                onClick={() => setActiveAdminTab(id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeAdminTab === id
                    ? 'bg-yellow-400 text-slate-950 shadow-sm border border-yellow-300'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-yellow-400/20 dark:hover:bg-yellow-950/30'
                }`}
              >
                <Icon className={`w-4 h-4 ${alert ? 'text-rose-600 dark:text-rose-400 animate-pulse' : ''}`} />
                <span>{label}</span>
                {badge && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                    alert
                      ? 'bg-rose-600 text-white font-black'
                      : activeAdminTab === id
                        ? 'bg-yellow-200 text-slate-950'
                        : 'bg-yellow-100 dark:bg-yellow-950/60 text-slate-800 dark:text-yellow-300'
                  }`}>
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 hidden lg:block">
            SaaS Gateway: <span className="font-bold text-emerald-600 dark:text-emerald-400">99.99% Uptime</span>
          </div>
        </div>
      </div>

      {/* TAB 1: Revenue & MRR Intelligence */}
      {activeAdminTab === 'revenue' && (
        <div className="space-y-6">
          {/* Key SaaS Financial Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white/85 dark:bg-[#0c0e18]/85 backdrop-blur-md border border-yellow-300/50 dark:border-yellow-500/20 shadow-xs">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Monthly Recurring Revenue (MRR)
              </span>
              <div className="mt-2 text-2xl font-black text-slate-950 dark:text-white flex items-baseline gap-2">
                ${totalMRR.toLocaleString()}
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  +22.4% MoM
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                Annual Run Rate: <span className="font-bold text-slate-950 dark:text-white font-mono">${totalARR.toLocaleString()} ARR</span>
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/85 dark:bg-[#0c0e18]/85 backdrop-blur-md border border-yellow-300/50 dark:border-yellow-500/20 shadow-xs">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-600 dark:text-yellow-400" />
                Active Paying Subscribers
              </span>
              <div className="mt-2 text-2xl font-black text-slate-950 dark:text-white flex items-baseline gap-2">
                {activePaidCount}
                <span className="text-xs text-slate-600 dark:text-slate-400 font-normal">
                  / {tenants.length} total tenants
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                ARPU: <span className="font-bold text-slate-950 dark:text-white font-mono">${activePaidCount > 0 ? Math.round(totalMRR / activePaidCount) : 0}/mo</span>
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/85 dark:bg-[#0c0e18]/85 backdrop-blur-md border border-yellow-300/50 dark:border-yellow-500/20 shadow-xs">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                Unpaid / Overdue Revenue
              </span>
              <div className="mt-2 text-2xl font-black text-rose-600 dark:text-rose-400 flex items-baseline gap-2">
                ${totalOverdueDebt.toLocaleString()}
                <span className="text-xs text-rose-600 dark:text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  {unpaidTenants.length} Accounts
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                Recovery Pipeline Active with Dunning
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/85 dark:bg-[#0c0e18]/85 backdrop-blur-md border border-yellow-300/50 dark:border-yellow-500/20 shadow-xs">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                Platform Churn & Retention
              </span>
              <div className="mt-2 text-2xl font-black text-slate-950 dark:text-white flex items-baseline gap-2">
                1.1%
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Sub-2% Target
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                Suspended Accounts: <span className="font-bold text-slate-950 dark:text-white font-mono">{suspendedCount}</span>
              </p>
            </div>
          </div>

          {/* SaaS Pricing Tier Distribution */}
          <div className="p-6 rounded-2xl bg-white/85 dark:bg-[#0c0e18]/85 backdrop-blur-md border border-yellow-300/50 dark:border-yellow-500/20 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-950 dark:text-white">
              SaaS Subscription Plan Breakdown
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { plan: 'FREE TIER', price: '$0 / mo', users: tenants.filter(t => t.planTier === 'FREE').length, desc: '10,000 monthly requests, 2 agents' },
                { plan: 'STARTER', price: '$49 / mo', users: tenants.filter(t => t.planTier === 'STARTER').length, desc: '50,000 requests, 5 agents, basic policies' },
                { plan: 'PRO (MONTHLY / YEARLY)', price: '$199 / mo', users: tenants.filter(t => t.planTier === 'PRO_MONTHLY' || t.planTier === 'PRO_YEARLY').length, desc: '500,000 requests, unlimited agents, virtual keys' },
                { plan: 'ENTERPRISE FLEET', price: '$799 / mo', users: tenants.filter(t => t.planTier === 'ENTERPRISE').length, desc: '2,000,000 requests, dedicated gateway, SLA' },
              ].map((tier) => (
                <div key={tier.plan} className="p-4 rounded-xl bg-yellow-50/50 dark:bg-[#121524] border border-yellow-300/50 dark:border-yellow-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-900 dark:text-yellow-400">{tier.plan}</span>
                    <span className="text-xs font-bold text-slate-950 dark:text-white font-mono">{tier.price}</span>
                  </div>
                  <div className="text-xl font-black text-slate-950 dark:text-white font-mono">
                    {tier.users} <span className="text-xs font-normal text-slate-600 dark:text-slate-400">active tenants</span>
                  </div>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                    {tier.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Billing & Payment Processor Transactions */}
          <div className="p-6 rounded-2xl bg-white/85 dark:bg-[#0c0e18]/85 backdrop-blur-md border border-yellow-300/50 dark:border-yellow-500/20 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-950 dark:text-white">
                  Live Payment Gateway Transactions (Stripe &amp; PayPal Webhooks)
                </h2>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  Real-time subscription billing charges, card settlements, and failed collection attempts.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                Webhooks Synced
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-950 dark:text-slate-100">
                <thead className="bg-yellow-100/60 dark:bg-[#121524] font-mono text-[11px] text-slate-800 dark:text-yellow-300 uppercase border-b border-yellow-300/50 dark:border-yellow-500/25">
                  <tr>
                    <th className="p-3">Customer Tenant</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Charge Type</th>
                    <th className="p-3">Payment Method</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-yellow-200/40 dark:divide-yellow-500/15 font-sans">
                  {recentTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-yellow-50/50 dark:hover:bg-[#121626] transition-colors">
                      <td className="p-3 font-bold text-slate-950 dark:text-white">
                        {tx.tenantName}
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-950 dark:text-white">
                        ${tx.amountUsd}.00
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                        {tx.type}
                      </td>
                      <td className="p-3 text-slate-800 dark:text-slate-300">
                        {tx.paymentMethod}
                      </td>
                      <td className="p-3">
                        {tx.status === 'SETTLED' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                            SETTLED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-800 dark:text-rose-300 border border-rose-500/30">
                            FAILED: {tx.errorNote || 'DECLINED'}
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        {tx.timestamp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: User & Tenant Management Directory */}
      {activeAdminTab === 'users' && (
        <div className="space-y-6">
          {/* Filter Bar & Search */}
          <div className="p-4 rounded-2xl bg-white/85 dark:bg-[#0c0e18]/85 backdrop-blur-md border border-yellow-300/50 dark:border-yellow-500/20 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'ALL', label: 'All Users', count: tenants.length },
                { id: 'ACTIVE', label: 'Paying Subscribers', count: activePaidCount },
                { id: 'PAST_DUE', label: 'Unpaid / Overdue', count: unpaidTenants.length },
                { id: 'FREE', label: 'Free Tier', count: tenants.filter(t => t.planTier === 'FREE').length },
                { id: 'SUSPENDED', label: 'Suspended', count: suspendedCount },
              ].map(({ id, label, count }) => (
                <button
                  key={id}
                  onClick={() => setUserFilterStatus(id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    userFilterStatus === id
                      ? 'bg-yellow-400 text-slate-950 border border-yellow-300'
                      : 'bg-yellow-50 hover:bg-yellow-100 dark:bg-[#121524] text-slate-700 dark:text-slate-300 border border-yellow-200 dark:border-yellow-500/20'
                  }`}
                >
                  <span>{label}</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-white/80 dark:bg-black/40 text-slate-950 dark:text-white">
                    {count}
                  </span>
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter users or emails..."
                className="w-full bg-white dark:bg-[#121524] border border-yellow-300/60 dark:border-yellow-500/30 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-950 dark:text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-yellow-500"
              />
            </div>
          </div>

          {/* Tenants Table */}
          <div className="p-6 rounded-2xl bg-white/85 dark:bg-[#0c0e18]/85 backdrop-blur-md border border-yellow-300/50 dark:border-yellow-500/20 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-950 dark:text-white">
                Customer Tenant Database ({filteredTenants.length} matching)
              </h2>
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Click any tenant to adjust subscription plan or manage billing state
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-950 dark:text-slate-100">
                <thead className="bg-yellow-100/60 dark:bg-[#121524] font-mono text-[11px] text-slate-800 dark:text-yellow-300 uppercase border-b border-yellow-300/50 dark:border-yellow-500/25">
                  <tr>
                    <th className="p-3">User &amp; Organization</th>
                    <th className="p-3">Subscription Tier</th>
                    <th className="p-3">Monthly Billing</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Requests Usage</th>
                    <th className="p-3">Agents</th>
                    <th className="p-3 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-yellow-200/40 dark:divide-yellow-500/15 font-sans">
                  {filteredTenants.map((t) => {
                    const usagePercent = Math.min(100, Math.round((t.requestsUsed / t.requestLimit) * 100));
                    return (
                      <tr key={t.id} className="hover:bg-yellow-50/50 dark:hover:bg-[#121626] transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-slate-950 dark:text-white">
                            {t.name}
                          </div>
                          <div className="text-[11px] text-slate-700 dark:text-slate-400 font-medium">
                            {t.ownerName ? `${t.ownerName} • ` : ''}{t.ownerEmail}
                          </div>
                          <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                            ID: {t.id}
                          </div>
                        </td>

                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-yellow-100 dark:bg-yellow-950/60 text-slate-950 dark:text-yellow-300 border border-yellow-300/70 dark:border-yellow-500/30">
                            {t.planTier}
                          </span>
                        </td>

                        <td className="p-3">
                          <div className="font-mono font-bold text-slate-950 dark:text-white">
                            ${t.monthlySpendUsd}/mo
                          </div>
                          <div className="text-[10px] text-slate-600 dark:text-slate-400">
                            LTV: ${t.totalPaidLtvUsd.toLocaleString()}
                          </div>
                        </td>

                        <td className="p-3">
                          {t.status === 'ACTIVE' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                              ACTIVE
                            </span>
                          )}
                          {t.status === 'PAST_DUE' && (
                            <div className="space-y-0.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/40 flex items-center gap-1 w-fit">
                                <AlertTriangle className="w-3 h-3" />
                                PAST DUE ({t.daysPastDue}d)
                              </span>
                              <div className="text-[10px] font-mono text-rose-600 dark:text-rose-400 font-bold">
                                Unpaid: ${t.unpaidBalanceUsd}
                              </div>
                            </div>
                          )}
                          {t.status === 'SUSPENDED' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-500/40">
                              SUSPENDED
                            </span>
                          )}
                        </td>

                        <td className="p-3">
                          <div className="w-32 space-y-1">
                            <div className="flex justify-between text-[10px] font-mono text-slate-700 dark:text-slate-300">
                              <span>{t.requestsUsed.toLocaleString()}</span>
                              <span>{t.requestLimit.toLocaleString()}</span>
                            </div>
                            <div className="w-full h-1.5 bg-yellow-200/50 dark:bg-neutral-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  usagePercent > 90 ? 'bg-rose-500' : 'bg-yellow-400'
                                }`}
                                style={{ width: `${usagePercent}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="p-3 font-mono font-bold text-slate-950 dark:text-white">
                          {t.activeAgentsCount}
                        </td>

                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Change Plan */}
                            <button
                              onClick={() => {
                                setPlanModalTenant(t);
                                setTargetPlan(t.planTier);
                              }}
                              title="Change Plan Tier"
                              className="px-2 py-1 rounded bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-950/40 dark:hover:bg-yellow-900/50 text-slate-900 dark:text-yellow-300 font-bold text-[11px] transition-all cursor-pointer border border-yellow-300 dark:border-yellow-500/30"
                            >
                              Change Plan
                            </button>

                            {/* Quota Override */}
                            <button
                              onClick={() => openQuotaOverride(t)}
                              title="Override Quota"
                              className="px-2 py-1 rounded bg-yellow-50 hover:bg-yellow-100 dark:bg-[#15192c] text-slate-800 dark:text-slate-300 text-[11px] font-medium transition-all cursor-pointer border border-yellow-200 dark:border-[#262c47]"
                            >
                              Quota
                            </button>

                            {/* Unpaid / Retry or Suspend */}
                            {t.status === 'PAST_DUE' ? (
                              <button
                                onClick={() => handleRetryPayment(t)}
                                title="Retry Card Charge"
                                className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                              >
                                <RefreshCw className="w-3 h-3" />
                                <span>Retry</span>
                              </button>
                            ) : t.status === 'ACTIVE' ? (
                              <button
                                onClick={() => {
                                  suspendTenant(t.id);
                                  addToast({
                                    title: 'Account Suspended',
                                    description: `Frozen API gateway access for ${t.name}.`,
                                    type: 'warning'
                                  });
                                }}
                                title="Suspend Account"
                                className="px-2 py-1 rounded hover:bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold text-[11px] transition-all cursor-pointer"
                              >
                                Suspend
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  reactivateTenant(t.id);
                                  addToast({
                                    title: 'Account Reactivated',
                                    description: `Reopened gateway access for ${t.name}.`,
                                    type: 'success'
                                  });
                                }}
                                title="Reactivate Account"
                                className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-all cursor-pointer"
                              >
                                Reactivate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Unpaid & Dunning Radar */}
      {activeAdminTab === 'unpaid' && (
        <div className="space-y-6">
          {/* Overdue Overview Card */}
          <div className="p-6 rounded-2xl bg-white/85 dark:bg-[#0c0e18]/85 backdrop-blur-md border border-rose-300/50 dark:border-rose-500/30 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black text-slate-950 dark:text-white">
                    Unpaid &amp; Delinquent Accounts Radar
                  </h2>
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-black bg-rose-600 text-white">
                    {unpaidTenants.length} AT-RISK ACCOUNTS
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-1">
                  Manage users with failed credit cards, expired PayPal agreements, or overdue enterprise PO invoices.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleBulkDunning}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-yellow-400 hover:bg-yellow-300 text-slate-950 flex items-center gap-2 transition-all shadow-xs cursor-pointer border border-yellow-300"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Dunning Notices to All ({unpaidTenants.length})</span>
                </button>

                <button
                  onClick={handleAutoFreeze}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Freeze Overdue Beyond Grace</span>
                </button>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
                <span className="text-[11px] font-mono uppercase font-bold text-rose-800 dark:text-rose-400">
                  Total Outstanding Debt
                </span>
                <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono mt-1">
                  ${totalOverdueDebt.toLocaleString()}.00
                </div>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1">
                  Awaiting payment collection
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                <span className="text-[11px] font-mono uppercase font-bold text-amber-800 dark:text-amber-400">
                  Platform Grace Period
                </span>
                <div className="text-2xl font-black text-slate-950 dark:text-white font-mono mt-1">
                  {saasConfig.gracePeriodDays} Days
                </div>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1">
                  Before automatic gateway kill-switch activates
                </p>
              </div>

              <div className="p-4 rounded-xl bg-yellow-50/50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/40">
                <span className="text-[11px] font-mono uppercase font-bold text-amber-900 dark:text-yellow-400">
                  Automated Card Retry Engine
                </span>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                  Enabled (Smart Retry)
                </div>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1">
                  Attempts retries at optimal bank clearing hours
                </p>
              </div>
            </div>
          </div>

          {/* Overdue Accounts Table */}
          <div className="p-6 rounded-2xl bg-white/85 dark:bg-[#0c0e18]/85 backdrop-blur-md border border-yellow-300/50 dark:border-yellow-500/20 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-950 dark:text-white">
              Detailed Unpaid Account Roster
            </h3>

            {unpaidTenants.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-950 dark:text-white">All Accounts In Good Standing</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">There are currently no overdue or unpaid customer subscriptions.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {unpaidTenants.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-xl border border-rose-300/60 dark:border-rose-500/30 bg-rose-50/25 dark:bg-rose-950/10 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-950 dark:text-white">{t.name}</span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-600 text-white">
                          ${t.unpaidBalanceUsd} OVERDUE
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-600/40">
                          {t.daysPastDue} DAYS LATE
                        </span>
                      </div>
                      <div className="text-xs text-slate-700 dark:text-slate-300">
                        {t.ownerName ? `${t.ownerName} • ` : ''}<span className="font-mono">{t.ownerEmail}</span>
                      </div>
                      <div className="text-[11px] font-mono text-rose-700 dark:text-rose-400 flex items-center gap-1">
                        <AlertOctagon className="w-3.5 h-3.5" />
                        Failure Cause: <span className="font-bold">{t.failureReason || 'Card issuer authorization declined'}</span>
                      </div>
                      <div className="text-[10px] text-slate-600 dark:text-slate-400">
                        Payment Method: {t.paymentMethod} {t.cardLast4 ? `(ending in ${t.cardLast4})` : ''} • Dunning Notices Sent: {t.dunningSentCount || 0}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleRetryPayment(t)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Retry Charge</span>
                      </button>

                      <button
                        onClick={() => handleSendDunningNotice(t)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-yellow-400 hover:bg-yellow-300 text-slate-950 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer border border-yellow-300"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Send Notice</span>
                      </button>

                      <button
                        onClick={() => {
                          grantGracePeriod(t.id, 7);
                          addToast({
                            title: 'Grace Period Extended',
                            description: `Added 7 extra grace days for ${t.name}.`,
                            type: 'info'
                          });
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-[#121524] text-slate-800 dark:text-slate-200 border border-yellow-300/80 dark:border-yellow-500/30 hover:bg-yellow-50 transition-all cursor-pointer"
                      >
                        +7 Days Grace
                      </button>

                      <button
                        onClick={() => {
                          markTenantPaid(t.id);
                          addToast({
                            title: 'Marked As Paid',
                            description: `Settled unpaid balance for ${t.name}. Account returned to Active.`,
                            type: 'success'
                          });
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-[#121524] text-slate-800 dark:text-slate-200 border border-yellow-300/80 dark:border-yellow-500/30 hover:bg-yellow-50 transition-all cursor-pointer"
                      >
                        Forgive / Mark Paid
                      </button>

                      <button
                        onClick={() => {
                          suspendTenant(t.id);
                          addToast({
                            title: 'Account Suspended',
                            description: `Frozen API gateway access for ${t.name}.`,
                            type: 'warning'
                          });
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all cursor-pointer"
                      >
                        Suspend Access
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Platform Health & Infrastructure Controls */}
      {activeAdminTab === 'platform' && (
        <div className="space-y-6">
          {/* SaaS Global Configuration Toggles */}
          <div className="p-6 rounded-2xl bg-white/85 dark:bg-[#0c0e18]/85 backdrop-blur-md border border-yellow-300/50 dark:border-yellow-500/20 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-950 dark:text-white">
              SaaS Business &amp; Registration Switches
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-yellow-50/50 dark:bg-[#121524] border border-yellow-300/50 dark:border-yellow-500/20 flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-slate-950 dark:text-white">Public Customer Signups</div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">Allow new users to create accounts and select plans</div>
                </div>
                <button
                  onClick={() => updateSaaSConfig({ publicSignupsEnabled: !saasConfig.publicSignupsEnabled })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    saasConfig.publicSignupsEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                  }`}
                >
                  {saasConfig.publicSignupsEnabled ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-yellow-50/50 dark:bg-[#121524] border border-yellow-300/50 dark:border-yellow-500/20 flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-slate-950 dark:text-white">Auto-Freeze Non-Paying Accounts</div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">Cut off API gateway access once grace period expires</div>
                </div>
                <button
                  onClick={() => updateSaaSConfig({ autoFreezeUnpaidAccounts: !saasConfig.autoFreezeUnpaidAccounts })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    saasConfig.autoFreezeUnpaidAccounts ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                  }`}
                >
                  {saasConfig.autoFreezeUnpaidAccounts ? 'ENFORCED' : 'OFF'}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-yellow-50/50 dark:bg-[#121524] border border-yellow-300/50 dark:border-yellow-500/20 flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-slate-950 dark:text-white">Strict AI Model Firewall</div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">Block unauthorized jailbreak payloads across all tenants</div>
                </div>
                <button
                  onClick={() => updateSaaSConfig({ strictModelFirewall: !saasConfig.strictModelFirewall })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    saasConfig.strictModelFirewall ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                  }`}
                >
                  {saasConfig.strictModelFirewall ? 'ACTIVE' : 'OFF'}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-yellow-50/50 dark:bg-[#121524] border border-yellow-300/50 dark:border-yellow-500/20 flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-slate-950 dark:text-white">Maintenance Mode</div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">Put workspace in read-only mode for scheduled upgrades</div>
                </div>
                <button
                  onClick={() => updateSaaSConfig({ maintenanceMode: !saasConfig.maintenanceMode })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    saasConfig.maintenanceMode ? 'bg-rose-600 text-white' : 'bg-slate-300 text-slate-700'
                  }`}
                >
                  {saasConfig.maintenanceMode ? 'MAINTENANCE ON' : 'NORMAL'}
                </button>
              </div>
            </div>
          </div>

          {/* Global Broadcast Announcement */}
          <div className="p-6 rounded-2xl bg-white/85 dark:bg-[#0c0e18]/85 backdrop-blur-md border border-yellow-300/50 dark:border-yellow-500/20 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-950 dark:text-white flex items-center gap-2">
              <BellRing className="w-4 h-4 text-amber-600 dark:text-yellow-400" />
              Global Tenant Broadcast Announcement
            </h2>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
              Publish an alert banner displayed at the top of every customer's workspace console (e.g. maintenance window, new agent models).
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="e.g., Scheduled maintenance on Sunday 02:00 UTC. Upstream Gemini 2.5 Pro added."
                className="flex-1 bg-white dark:bg-[#121524] border border-yellow-300/70 dark:border-yellow-500/30 rounded-xl px-4 py-2 text-xs text-slate-950 dark:text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-yellow-500"
              />
              <button
                onClick={() => {
                  setGlobalAnnouncement(announcementText.trim() ? announcementText.trim() : null);
                  addToast({
                    title: announcementText.trim() ? 'Announcement Published' : 'Announcement Cleared',
                    description: announcementText.trim() ? 'Broadcast sent to all tenant dashboards.' : 'Banner cleared.',
                    type: 'success'
                  });
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-yellow-400 hover:bg-yellow-300 text-slate-950 transition-all cursor-pointer border border-yellow-300"
              >
                Broadcast
              </button>
            </div>
          </div>

          {/* Emergency Platform Circuit Breaker / Kill-Switch */}
          <div className="p-6 rounded-2xl bg-white/85 dark:bg-[#0c0e18]/85 backdrop-blur-md border border-rose-400/50 dark:border-rose-500/30 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <OctagonAlert className="w-4 h-4" />
                  Global Gateway Emergency Circuit Breaker
                </h2>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-1">
                  Instantly severs all incoming proxy requests from every tenant. Use exclusively in case of zero-day exploits or credential compromise.
                </p>
              </div>

              <button
                onClick={toggleGlobalKillSwitch}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  globalKillSwitchActive
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm'
                }`}
              >
                {globalKillSwitchActive ? 'Disengage Circuit Breaker' : 'Engage Emergency Kill-Switch'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plan Change Modal */}
      {planModalTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white dark:bg-[#0e111e] border border-yellow-400/60 dark:border-yellow-500/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-yellow-200 dark:border-yellow-500/20 pb-3">
              <h3 className="text-sm font-bold text-slate-950 dark:text-white">
                Change Subscription Plan
              </h3>
              <button
                onClick={() => setPlanModalTenant(null)}
                className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                Modifying subscription plan for <span className="font-bold text-slate-950 dark:text-white">{planModalTenant.name}</span>.
              </p>

              <div className="space-y-2">
                {[
                  { id: 'FREE', name: 'Free Hobby Tier', price: '$0 / mo', quota: '10,000 reqs' },
                  { id: 'STARTER', name: 'Starter Plan', price: '$49 / mo', quota: '50,000 reqs' },
                  { id: 'PRO_MONTHLY', name: 'Pro Monthly Growth', price: '$199 / mo', quota: '250,000 reqs' },
                  { id: 'PRO_YEARLY', name: 'Pro Annual Fleet', price: '$179 / mo ($2,148/yr)', quota: '500,000 reqs' },
                  { id: 'ENTERPRISE', name: 'Enterprise Dedicated', price: '$799 / mo', quota: '2,000,000 reqs' },
                ].map((p) => (
                  <label
                    key={p.id}
                    onClick={() => setTargetPlan(p.id as any)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      targetPlan === p.id
                        ? 'bg-yellow-100/70 dark:bg-yellow-950/40 border-yellow-400 text-slate-950 dark:text-white font-bold'
                        : 'border-yellow-200/60 dark:border-yellow-500/20 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs">{p.name}</div>
                      <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{p.quota}</div>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-900 dark:text-yellow-400">{p.price}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setPlanModalTenant(null)}
                className="px-3 py-1.5 rounded-lg border border-yellow-200 dark:border-yellow-500/20 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePlanSubmit}
                className="px-4 py-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs transition-all cursor-pointer border border-yellow-300"
              >
                Apply Plan Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quota Override Modal */}
      {quotaModalOpen && selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white dark:bg-[#0e111e] border border-yellow-400/60 dark:border-yellow-500/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-yellow-200 dark:border-yellow-500/20 pb-3">
              <h3 className="text-sm font-bold text-slate-950 dark:text-white">
                Override Quota Limit
              </h3>
              <button
                onClick={() => setQuotaModalOpen(false)}
                className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                Adjust request limit and billing grace period for <span className="font-bold text-slate-950 dark:text-white">{selectedTenant.name}</span>.
              </p>

              <div>
                <label className="block text-[11px] font-mono text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Monthly Request Ceiling
                </label>
                <input
                  type="number"
                  value={newQuotaLimit}
                  onChange={(e) => setNewQuotaLimit(Number(e.target.value))}
                  className="w-full bg-white dark:bg-[#121524] border border-yellow-300/80 dark:border-yellow-500/30 rounded-lg p-2 text-xs font-mono text-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Extension Days
                </label>
                <input
                  type="number"
                  value={extraDays}
                  onChange={(e) => setExtraDays(Number(e.target.value))}
                  className="w-full bg-white dark:bg-[#121524] border border-yellow-300/80 dark:border-yellow-500/30 rounded-lg p-2 text-xs font-mono text-slate-950 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setQuotaModalOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-yellow-200 dark:border-yellow-500/20 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveQuota}
                className="px-4 py-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs transition-all cursor-pointer border border-yellow-300"
              >
                Update Quota
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
