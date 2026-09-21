import React from 'react';
import {
  X,
  User,
  Mail,
  Building2,
  Phone,
  Briefcase,
  ShieldCheck,
  CreditCard,
  Layers,
  Database,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  Cpu,
} from 'lucide-react';
import { CloudSqlUserRecord } from './CloudSqlUsersTable';

interface UserDetailModalProps {
  user: CloudSqlUserRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectPlanChange?: (user: CloudSqlUserRecord) => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  isOpen,
  onClose,
  onSelectPlanChange,
}) => {
  if (!isOpen || !user) return null;

  const isGoogle = user.email?.toLowerCase().endsWith('@gmail.com') || user.authProvider === 'google';
  const sub = user.subscription;
  const quota = user.quota;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-[#1c1b18] border border-[#e5e0d5] dark:border-[#33302b] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#e5e0d5] dark:border-[#33302b] flex items-center justify-between bg-[#faf8f5] dark:bg-[#151412]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-base">
              {(user.displayName || user.email || 'U')[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                  {user.displayName || 'AgentLens User'}
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                  User #{user.number || user.id}
                </span>
                {isGoogle && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                    Google SSO Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa] font-mono mt-0.5">
                Cloud SQL DB ID: <span className="font-semibold text-blue-600 dark:text-blue-400">pg_{user.id}</span> • UID: <span className="text-[#878278]">{user.uid}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 flex items-center justify-center text-[#5c5850] dark:text-[#b8b4aa] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Section 1: User & Registration Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#5c5850] dark:text-[#b8b4aa] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-500" />
              <span>Registration Form Submission Details</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-[#faf8f5] dark:bg-[#151412] border border-[#e5e0d5] dark:border-[#33302b]">
              <div>
                <span className="text-[11px] text-[#878278] dark:text-[#7d7970] block font-medium">Registered Gmail / Email</span>
                <span className="text-xs font-mono font-bold text-[#1f1e1b] dark:text-[#f5f3ef] flex items-center gap-1 mt-0.5">
                  <Mail className="w-3 h-3 text-blue-500" />
                  {user.email}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#878278] dark:text-[#7d7970] block font-medium">Organization / Company</span>
                <span className="text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef] flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3 h-3 text-amber-500" />
                  {user.organizationName || 'Autonomous Fleet Labs'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#878278] dark:text-[#7d7970] block font-medium">Authentication Provider</span>
                <span className="text-xs font-mono text-[#1f1e1b] dark:text-[#f5f3ef] mt-0.5 block uppercase">
                  {user.authProvider || 'google'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#878278] dark:text-[#7d7970] block font-medium">Platform Role &amp; Clearance</span>
                <span className="text-xs font-semibold text-[#1f1e1b] dark:text-[#f5f3ef] flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  {user.role || 'owner'} (Zero-Trust Clearance)
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Selected Subscription Package & Billing */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#5c5850] dark:text-[#b8b4aa] flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-amber-500" />
                <span>Selected Package &amp; Subscription Details</span>
              </h4>
              {onSelectPlanChange && (
                <button
                  onClick={() => {
                    onClose();
                    onSelectPlanChange(user);
                  }}
                  className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                >
                  Change Package Tier →
                </button>
              )}
            </div>

            <div className="p-4 rounded-xl bg-[#faf8f5] dark:bg-[#151412] border border-[#e5e0d5] dark:border-[#33302b] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#e5e0d5] dark:border-[#33302b]">
                <div>
                  <span className="text-[11px] text-[#878278] dark:text-[#7d7970] block">Signed-Up Package Tier</span>
                  <span className="text-base font-bold font-mono text-[#b45309] dark:text-[#fbbf24]">
                    {sub.planTier}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[#878278] dark:text-[#7d7970] block">Monthly Charge</span>
                  <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    ${sub.monthlyPriceUsd}/mo
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[#878278] dark:text-[#7d7970] block">Subscription Status</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 inline-block mt-0.5 uppercase">
                    {sub.status || 'ACTIVE'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-[#878278] dark:text-[#7d7970] font-mono">Billing Frequency</span>
                  <div className="font-semibold text-[#1f1e1b] dark:text-[#f5f3ef] capitalize">{sub.billingInterval || 'Monthly'}</div>
                </div>
                <div>
                  <span className="text-[10px] text-[#878278] dark:text-[#7d7970] font-mono">Total Paid LTV</span>
                  <div className="font-semibold font-mono text-emerald-600 dark:text-emerald-400">${sub.totalPaidLtvUsd || sub.monthlyPriceUsd}</div>
                </div>
                <div>
                  <span className="text-[10px] text-[#878278] dark:text-[#7d7970] font-mono">Payment Instrument</span>
                  <div className="font-semibold text-[#1f1e1b] dark:text-[#f5f3ef] flex items-center gap-1">
                    <CreditCard className="w-3 h-3 text-neutral-400" />
                    <span>{sub.paymentMethod || 'MASTERCARD'} •••• {sub.cardLast4 || '8812'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Usage Quota & Provisioned Fleets */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#5c5850] dark:text-[#b8b4aa] flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-500" />
              <span>Fleet Quotas &amp; Autonomous Agent Capacity</span>
            </h4>
            <div className="p-4 rounded-xl bg-[#faf8f5] dark:bg-[#151412] border border-[#e5e0d5] dark:border-[#33302b] space-y-3">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1 text-[#5c5850] dark:text-[#b8b4aa]">
                  <span>LLM Request Volume</span>
                  <span>{quota.requestsUsed.toLocaleString()} / {quota.requestLimit.toLocaleString()} ({Math.min(100, Math.round((quota.requestsUsed / (quota.requestLimit || 1)) * 100))}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: `${Math.min(100, Math.round((quota.requestsUsed / (quota.requestLimit || 1)) * 100))}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-6 text-xs text-[#5c5850] dark:text-[#b8b4aa] pt-1">
                <div>
                  <span className="font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">{quota.activeAgentsCount}</span> Active Agents Allowed
                </div>
                <div>
                  <span className="font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">{quota.virtualKeysCount}</span> Zero-Trust Keys
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Timestamps */}
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] text-[11px] font-mono text-[#878278] dark:text-[#7d7970] flex flex-col sm:flex-row justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Signed Up: {user.createdAt ? new Date(user.createdAt).toLocaleString() : 'Recent'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Last Login: {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Active Now'}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#151412] flex items-center justify-between">
          <span className="text-[11px] text-[#878278] dark:text-[#7d7970] font-mono">
            Directly synced with Google Cloud SQL instance
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#1f1e1b] dark:bg-[#f5f3ef] text-white dark:text-[#181715] font-bold text-xs hover:opacity-90 transition-all cursor-pointer shadow-xs"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
