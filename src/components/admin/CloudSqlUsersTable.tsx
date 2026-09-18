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
      <div className="p-4 rounded-2xl bg-white dark:bg-[#211f1c] border border-blue-500/30 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-400/30 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0 shadow-xs">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                Google Cloud SQL (PostgreSQL) Connected
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active Pool</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/15 text-blue-800 dark:text-blue-300 border border-blue-500/30">
                europe-west1
              </span>
            </div>
            <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa] mt-0.5">
              Target Project: <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">tranquil-tomorrow-hrtgb</span> • Tables: <span className="font-mono text-[#1f1e1b] dark:text-[#f5f3ef]">users, subscriptions, usage_quotas</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715] hover:bg-[#f4f1ea] text-[#1f1e1b] dark:text-[#f5f3ef] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Querying SQL...' : 'Refresh SQL'}</span>
          </button>
          <button
            onClick={onOpenAddModal}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register in Cloud SQL</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs">
          <div className="text-[11px] font-medium text-[#5c5850] dark:text-[#b8b4aa]">Total Registered in SQL</div>
          <div className="text-xl font-bold font-mono text-[#1f1e1b] dark:text-[#f5f3ef] mt-0.5">{users.length} Users</div>
          <div className="text-[10px] text-blue-600 dark:text-blue-400 font-mono mt-0.5">{googleUsersCount} Google Auth accounts</div>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs">
          <div className="text-[11px] font-medium text-[#5c5850] dark:text-[#b8b4aa]">Monthly Run Rate (MRR)</div>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">${totalMonthlyMrr.toLocaleString()}</div>
          <div className="text-[10px] text-[#878278] dark:text-[#7d7970] font-mono mt-0.5">Across active subscriptions</div>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs">
          <div className="text-[11px] font-medium text-[#5c5850] dark:text-[#b8b4aa]">Active Subscriptions</div>
          <div className="text-xl font-bold font-mono text-[#1f1e1b] dark:text-[#f5f3ef] mt-0.5">
            {users.filter(u => u.subscription.status === 'ACTIVE').length} / {users.length}
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">100% good standing</div>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs">
          <div className="text-[11px] font-medium text-[#5c5850] dark:text-[#b8b4aa]">ORM &amp; Engine</div>
          <div className="text-sm font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1">Drizzle + pgPool</div>
          <div className="text-[10px] text-[#878278] dark:text-[#7d7970] font-mono mt-0.5">Unix Socket Proxy</div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-[#1f1e1b] dark:text-[#f5f3ef] flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-500" />
              <span>Registered Users &amp; Chosen Subscriptions ({filteredUsers.length})</span>
            </h2>
            <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa] mt-0.5">
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
                    ? 'bg-[#d97706] dark:bg-[#f59e0b] text-white dark:text-[#181715] shadow-xs'
                    : 'bg-[#faf8f5] dark:bg-[#181715] hover:bg-[#f4f1ea] text-[#5c5850] dark:text-[#b8b4aa] border border-[#e5e0d5] dark:border-[#33302b]'
                }`}
              >
                {plan === 'ALL' ? 'All Packages' : plan}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#1f1e1b] dark:text-[#f5f3ef]">
            <thead className="bg-[#faf8f5] dark:bg-[#181715] font-mono text-[11px] text-[#5c5850] dark:text-[#b8b4aa] uppercase border-b border-[#e5e0d5] dark:border-[#33302b]">
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
            <tbody className="divide-y divide-[#e5e0d5]/60 dark:divide-[#33302b]/60 font-sans">
              {filteredUsers.map((u, idx) => {
                const isGoogle = u.email?.toLowerCase().endsWith('@gmail.com') || u.authProvider === 'google';
                const sub = u.subscription;
                const quota = u.quota;
                const percent = Math.min(100, Math.round((quota.requestsUsed / (quota.requestLimit || 1)) * 100));

                return (
                  <tr key={u.id || u.uid} className="hover:bg-[#f4f1ea]/50 dark:hover:bg-[#282622]/50 transition-colors">
                    {/* User Sequential Number */}
                    <td className="p-3 text-center font-mono font-bold text-blue-600 dark:text-blue-400">
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/30">
                        #{idx + 1}
                      </span>
                    </td>

                    {/* User & Gmail */}
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0 border border-blue-500/30">
                          {(u.displayName || u.email || 'U')[0]}
                        </div>
                        <div>
                          <div className="font-bold text-[#1f1e1b] dark:text-[#f5f3ef] flex items-center gap-1.5">
                            <span>{u.displayName || 'AgentLens User'}</span>
                            {u.role === 'super-admin' && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500 text-white font-mono">
                                ROOT
                              </span>
                            )}
                            {isGoogle && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30 font-mono">
                                Google Auth
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#5c5850] dark:text-[#b8b4aa] font-mono flex items-center gap-1">
                            <span className={isGoogle ? 'font-semibold text-blue-700 dark:text-blue-300' : ''}>
                              {u.email}
                            </span>
                          </div>
                          <div className="text-[10px] text-[#878278] dark:text-[#7d7970] font-medium">
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
                            ? 'bg-purple-500/10 text-purple-900 dark:text-purple-300 border-purple-400/40'
                            : sub.planTier === 'PRO_MONTHLY' || sub.planTier === 'PRO_YEARLY'
                            ? 'bg-amber-500/10 text-[#b45309] dark:text-[#fbbf24] border-amber-400/40'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-[#5c5850] dark:text-[#b8b4aa] border-[#e5e0d5] dark:border-[#33302b]'
                        }`}>
                          {sub.planTier}
                        </span>
                        <div className="text-[10px] font-mono text-[#5c5850] dark:text-[#b8b4aa] font-semibold">
                          Interval: {sub.billingInterval || 'monthly'}
                        </div>
                      </div>
                    </td>

                    {/* Monthly Billing */}
                    <td className="p-3 font-mono">
                      <div className="text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                        ${sub.monthlyPriceUsd}/mo
                      </div>
                      <div className="text-[10px] text-[#878278] dark:text-[#7d7970]">
                        LTV: ${sub.totalPaidLtvUsd || sub.monthlyPriceUsd}
                      </div>
                    </td>

                    {/* Quota & Fleet Allocation */}
                    <td className="p-3">
                      <div className="w-36 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono text-[#5c5850] dark:text-[#b8b4aa]">
                          <span>{quota.requestsUsed.toLocaleString()}</span>
                          <span>{quota.requestLimit.toLocaleString()} reqs</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              percent > 85 ? 'bg-amber-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="text-[10px] font-mono text-[#878278] dark:text-[#7d7970] flex items-center gap-2">
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
                        <div className="text-[10px] font-mono text-[#878278] dark:text-[#7d7970] flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-neutral-400" />
                          <span>{sub.paymentMethod || 'MC'} •••• {sub.cardLast4 || '8812'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onSelectUserForPlanChange(u)}
                        className="px-2.5 py-1 rounded-lg bg-[#faf8f5] hover:bg-[#f4f1ea] dark:bg-[#181715] dark:hover:bg-[#282622] text-[#1f1e1b] dark:text-[#f5f3ef] font-bold text-[11px] transition-all cursor-pointer border border-[#e5e0d5] dark:border-[#33302b] shadow-xs"
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
