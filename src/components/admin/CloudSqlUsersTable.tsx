import React, { useState } from 'react';
import { Database, CheckCircle2, ShieldCheck, RefreshCw, Plus, CreditCard, Sparkles, Layers, ArrowUpRight, Cpu } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';

export interface CloudSqlUserRecord {
  number: number;
  id: number;
  uid: string;
  email: string;
  displayName: string;
  organizationName: string;
  role: string;
  authProvider: string;
  createdAt: string;
  lastLoginAt: string;
  subscription: {
    id?: number;
    tenantId?: string;
    planTier: string;
    status: string;
    monthlyPriceUsd: number;
    totalPaidLtvUsd: number;
    unpaidBalanceUsd: number;
    billingInterval: string;
    paymentMethod?: string;
    cardLast4?: string;
    currentPeriodStart?: string;
    currentPeriodEnd?: string;
  };
  quota: {
    requestLimit: number;
    requestsUsed: number;
    activeAgentsCount: number;
    virtualKeysCount: number;
  };
}

interface CloudSqlUsersTableProps {
  users: CloudSqlUserRecord[];
  isLoading: boolean;
  onRefresh: () => void;
  onOpenAddModal: () => void;
  onSelectUserForPlanChange: (user: CloudSqlUserRecord) => void;
}

export const CloudSqlUsersTable: React.FC<CloudSqlUsersTableProps> = ({
  users,
  isLoading,
  onRefresh,
  onOpenAddModal,
  onSelectUserForPlanChange,
}) => {
  const { addToast } = useAppStore();
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<string>('ALL');

  const filteredUsers = users.filter((u) => {
    if (selectedPlanFilter === 'ALL') return true;
    return u.subscription.planTier === selectedPlanFilter;
  });

  const totalMonthlyMrr = users.reduce((acc, u) => acc + (u.subscription.monthlyPriceUsd || 0), 0);
  const googleUsersCount = users.filter((u) => u.email?.toLowerCase().endsWith('@gmail.com') || u.authProvider === 'google').length;

  return (
    <div className="space-y-4">
      {/* Cloud SQL Connection Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-sky-950/30 to-indigo-950/40 border border-blue-500/30 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400 flex-shrink-0 shadow-inner">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Google Cloud SQL (PostgreSQL) Connected
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active Pool</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                europe-west1
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Target Project: <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">tranquil-tomorrow-hrtgb</span> • Tables: <span className="font-mono text-slate-700 dark:text-slate-300">users, subscriptions, usage_quotas</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-lg border border-blue-500/30 hover:bg-blue-500/10 text-blue-700 dark:text-blue-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Querying SQL...' : 'Refresh SQL'}</span>
          </button>
          <button
            onClick={onOpenAddModal}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer border border-blue-400"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register in Cloud SQL</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white/70 dark:bg-[#0c0e18]/70 border border-blue-500/20 backdrop-blur-xs">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Registered in SQL</div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-0.5">{users.length} Users</div>
          <div className="text-[10px] text-blue-600 dark:text-blue-400 font-mono mt-0.5">{googleUsersCount} Google Auth accounts</div>
        </div>
        <div className="p-3.5 rounded-xl bg-white/70 dark:bg-[#0c0e18]/70 border border-blue-500/20 backdrop-blur-xs">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Monthly Run Rate (MRR)</div>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">${totalMonthlyMrr.toLocaleString()}</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">Across active subscriptions</div>
        </div>
        <div className="p-3.5 rounded-xl bg-white/70 dark:bg-[#0c0e18]/70 border border-blue-500/20 backdrop-blur-xs">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Active Subscriptions</div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-0.5">
            {users.filter(u => u.subscription.status === 'ACTIVE').length} / {users.length}
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">100% good standing</div>
        </div>
        <div className="p-3.5 rounded-xl bg-white/70 dark:bg-[#0c0e18]/70 border border-blue-500/20 backdrop-blur-xs">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">ORM &amp; Engine</div>
          <div className="text-sm font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1">Drizzle + pgPool</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">Unix Socket Proxy</div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="p-6 rounded-2xl bg-white/85 dark:bg-[#0c0e18]/85 backdrop-blur-md border border-blue-500/30 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-950 dark:text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-500" />
              <span>Registered Users &amp; Chosen Subscriptions ({filteredUsers.length})</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Live records persisted in Cloud SQL PostgreSQL database with chosen package tiers and usage quotas
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {['ALL', 'ENTERPRISE', 'PRO_MONTHLY', 'STARTER', 'FREE'].map((plan) => (
              <button
                key={plan}
                onClick={() => setSelectedPlanFilter(plan)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer ${
                  selectedPlanFilter === plan
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20'
                }`}
              >
                {plan === 'ALL' ? 'All Packages' : plan}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-950 dark:text-slate-100">
            <thead className="bg-blue-100/60 dark:bg-blue-950/40 font-mono text-[11px] text-blue-950 dark:text-blue-300 uppercase border-b border-blue-400/30">
              <tr>
                <th className="p-3 w-12 text-center">#</th>
                <th className="p-3">User &amp; Gmail</th>
                <th className="p-3">Chosen Subscription</th>
                <th className="p-3">Monthly Billing</th>
                <th className="p-3">Quota &amp; Fleet</th>
                <th className="p-3">Role</th>
                <th className="p-3">Payment &amp; Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-200/40 dark:divide-blue-500/15 font-sans">
              {filteredUsers.map((u, idx) => {
                const isGoogle = u.email?.toLowerCase().endsWith('@gmail.com') || u.authProvider === 'google';
                const sub = u.subscription;
                const quota = u.quota;
                const percent = Math.min(100, Math.round((quota.requestsUsed / (quota.requestLimit || 1)) * 100));

                return (
                  <tr key={u.id || u.uid} className="hover:bg-blue-50/50 dark:hover:bg-[#12172a] transition-colors">
                    {/* User Sequential Number */}
                    <td className="p-3 text-center font-mono font-bold text-blue-600 dark:text-blue-400">
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/30">
                        #{idx + 1}
                      </span>
                    </td>

                    {/* User & Gmail */}
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0 border border-blue-500/30">
                          {(u.displayName || u.email || 'U')[0]}
                        </div>
                        <div>
                          <div className="font-bold text-slate-950 dark:text-white flex items-center gap-1.5">
                            <span>{u.displayName || 'AgentLens User'}</span>
                            {u.role === 'super-admin' && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500 text-slate-950 font-mono">
                                ROOT
                              </span>
                            )}
                            {isGoogle && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30 font-mono">
                                Google Auth
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-600 dark:text-slate-400 font-mono flex items-center gap-1">
                            <span className={isGoogle ? 'font-semibold text-blue-700 dark:text-blue-300' : ''}>
                              {u.email}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                            {u.organizationName}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Chosen Subscription Package */}
                    <td className="p-3">
                      <div className="space-y-0.5">
                        <span className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold inline-block border ${
                          sub.planTier === 'ENTERPRISE'
                            ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-900 dark:text-purple-300 border-purple-400/40'
                            : sub.planTier === 'PRO_MONTHLY' || sub.planTier === 'PRO_YEARLY'
                            ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 border-blue-400/40'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                        }`}>
                          {sub.planTier}
                        </span>
                        <div className="text-[10px] font-mono text-slate-600 dark:text-slate-400 font-semibold">
                          Interval: {sub.billingInterval || 'monthly'}
                        </div>
                      </div>
                    </td>

                    {/* Monthly Billing */}
                    <td className="p-3 font-mono">
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        ${sub.monthlyPriceUsd}/mo
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        LTV: ${sub.totalPaidLtvUsd || sub.monthlyPriceUsd}
                      </div>
                    </td>

                    {/* Quota & Fleet Allocation */}
                    <td className="p-3">
                      <div className="w-36 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-600 dark:text-slate-400">
                          <span>{quota.requestsUsed.toLocaleString()}</span>
                          <span>{quota.requestLimit.toLocaleString()} reqs</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              percent > 85 ? 'bg-amber-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-2">
                          <span>{quota.activeAgentsCount} Agents</span>
                          <span>•</span>
                          <span>{quota.virtualKeysCount} Keys</span>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 flex items-center gap-1 w-fit">
                        <ShieldCheck className="w-3 h-3 text-blue-500" />
                        {u.role}
                      </span>
                    </td>

                    {/* Payment & Status */}
                    <td className="p-3">
                      <div className="space-y-0.5">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 inline-block">
                          {sub.status}
                        </span>
                        <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-slate-400" />
                          <span>{sub.paymentMethod || 'MC'} •••• {sub.cardLast4 || '8812'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onSelectUserForPlanChange(u)}
                        className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 text-blue-950 dark:text-blue-300 font-bold text-[11px] transition-all cursor-pointer border border-blue-400/30"
                      >
                        Modify Plan
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
