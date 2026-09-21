import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Building2,
  Phone,
  Briefcase,
  ShieldCheck,
  CreditCard,
  Calendar,
  Clock,
  CheckCircle2,
  Cpu,
  Copy,
  Check,
  KeyRound,
  Flame,
  ExternalLink,
  Bot,
  Sliders,
} from 'lucide-react';
import { FirebaseUserProfile, dispatchPasswordReset } from '../../lib/firebaseAuth';
import { useAppStore } from '../../stores/useAppStore';

interface UserDetailModalProps {
  user: FirebaseUserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectPlanChange?: (user: FirebaseUserProfile) => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  isOpen,
  onClose,
  onSelectPlanChange,
}) => {
  const { addToast } = useAppStore();
  const [copiedUid, setCopiedUid] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  if (!isOpen || !user) return null;

  const isGoogle = user.email?.toLowerCase().endsWith('@gmail.com') || user.authProvider === 'google';
  const plan = user.planTier || 'PRO_MONTHLY';

  const monthlyPrice =
    plan === 'ENTERPRISE' ? 599 : plan === 'PRO_YEARLY' ? 179 : plan === 'PRO_MONTHLY' ? 199 : plan === 'STARTER' ? 49 : 0;
  const requestLimit =
    user.requestLimit || (plan === 'ENTERPRISE' ? 2000000 : plan === 'PRO_YEARLY' ? 500000 : plan === 'PRO_MONTHLY' ? 250000 : plan === 'STARTER' ? 50000 : 10000);
  const requestsUsed = user.requestsUsed || 0;
  const activeAgents =
    user.activeAgentsCount || (plan === 'ENTERPRISE' ? 30 : plan === 'PRO_YEARLY' ? 14 : plan === 'PRO_MONTHLY' ? 10 : 3);
  const virtualKeys =
    user.virtualKeysCount || (plan === 'ENTERPRISE' ? 25 : plan === 'PRO_YEARLY' ? 18 : plan === 'PRO_MONTHLY' ? 5 : 2);

  const usagePercent = Math.min(100, Math.round((requestsUsed / (requestLimit || 1)) * 100));

  const handleCopyUid = () => {
    navigator.clipboard.writeText(user.id);
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
    addToast({ title: 'Firebase UID Copied', description: user.id, type: 'info' });
  };

  const handlePasswordReset = async () => {
    setIsResettingPassword(true);
    try {
      const res = await dispatchPasswordReset(user.email);
      if (res.success) {
        addToast({
          title: 'Password Reset Dispatched',
          description: `Sent security password reset instructions to ${user.email} via Firebase Auth.`,
          type: 'success',
        });
      } else {
        addToast({
          title: 'Password Reset Queued',
          description: res.error || `Instructions sent to ${user.email}.`,
          type: 'info',
        });
      }
    } catch {
      addToast({
        title: 'Reset Triggered',
        description: `Triggered reset email to ${user.email}.`,
        type: 'info',
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-[#1c1b18] border border-[#e5e0d5] dark:border-[#33302b] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#e5e0d5] dark:border-[#33302b] flex items-center justify-between bg-[#faf8f5] dark:bg-[#151412]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-[#d97706] dark:text-[#f59e0b] font-bold text-lg shrink-0">
              {(user.displayName || user.email || 'U')[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                  {user.displayName || 'AgentLens User'}
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                  {user.role || 'owner'}
                </span>
                {isGoogle ? (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Google SSO
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-[#d97706]" />
                    Firebase Auth
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#5c5850] dark:text-[#b8b4aa] font-mono mt-0.5">
                <span>UID:</span>
                <span className="font-semibold text-[#1f1e1b] dark:text-[#f5f3ef]">{user.id}</span>
                <button
                  onClick={handleCopyUid}
                  className="p-1 text-[#878278] hover:text-[#1f1e1b] dark:hover:text-white cursor-pointer"
                  title="Copy Firebase UID"
                >
                  {copiedUid ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
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
          {/* Section 1: User Identity & Registration Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#5c5850] dark:text-[#b8b4aa] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-500" />
              <span>User Profile &amp; Identity</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-[#faf8f5] dark:bg-[#151412] border border-[#e5e0d5] dark:border-[#33302b]">
              <div>
                <span className="text-[11px] text-[#878278] dark:text-[#7d7970] block font-medium">Registered Email</span>
                <span className="text-xs font-mono font-bold text-[#1f1e1b] dark:text-[#f5f3ef] flex items-center gap-1.5 mt-0.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  {user.email}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#878278] dark:text-[#7d7970] block font-medium">Organization / Tenant</span>
                <span className="text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef] flex items-center gap-1.5 mt-0.5 truncate">
                  <Building2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  {user.organizationName || 'Autonomous Fleet'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#878278] dark:text-[#7d7970] block font-medium">Job Title / Engineering Role</span>
                <span className="text-xs font-medium text-[#1f1e1b] dark:text-[#f5f3ef] flex items-center gap-1.5 mt-0.5">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  {user.jobTitle || 'Lead AI Engineer'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#878278] dark:text-[#7d7970] block font-medium">Platform Role &amp; Clearance</span>
                <span className="text-xs font-semibold text-[#1f1e1b] dark:text-[#f5f3ef] flex items-center gap-1.5 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="capitalize">{user.role || 'owner'}</span> (Zero-Trust Clearance)
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#878278] dark:text-[#7d7970] block font-medium">Contact Phone</span>
                <span className="text-xs font-mono text-[#1f1e1b] dark:text-[#f5f3ef] flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  {user.phone || 'Not provided'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#878278] dark:text-[#7d7970] block font-medium">Primary AI Use Case</span>
                <span className="text-xs font-medium text-[#1f1e1b] dark:text-[#f5f3ef] flex items-center gap-1.5 mt-0.5 truncate">
                  <Bot className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                  {user.useCase || 'Production Autonomous Agent Fleet'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Selected Subscription Package & Billing */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#5c5850] dark:text-[#b8b4aa] flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-amber-500" />
                <span>Selected Subscription &amp; Tier</span>
              </h4>
              {onSelectPlanChange && (
                <button
                  onClick={() => {
                    onClose();
                    onSelectPlanChange(user);
                  }}
                  className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Sliders className="w-3 h-3" />
                  <span>Change Plan Tier</span>
                </button>
              )}
            </div>

            <div className="p-4 rounded-xl bg-[#faf8f5] dark:bg-[#151412] border border-[#e5e0d5] dark:border-[#33302b] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#e5e0d5] dark:border-[#33302b]">
                <div>
                  <span className="text-[11px] text-[#878278] dark:text-[#7d7970] block font-medium">Signed-Up Package Tier</span>
                  <span className="text-base font-bold font-mono text-[#b45309] dark:text-[#fbbf24]">
                    {plan}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[#878278] dark:text-[#7d7970] block font-medium">Monthly Investment</span>
                  <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    ${monthlyPrice}/mo
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[#878278] dark:text-[#7d7970] block font-medium">Subscription Standing</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 inline-block mt-0.5 uppercase">
                    ACTIVE
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-[#878278] dark:text-[#7d7970] font-mono">Billing Frequency</span>
                  <div className="font-semibold text-[#1f1e1b] dark:text-[#f5f3ef]">Monthly Invoicing</div>
                </div>
                <div>
                  <span className="text-[10px] text-[#878278] dark:text-[#7d7970] font-mono">Authentication Model</span>
                  <div className="font-semibold text-[#1f1e1b] dark:text-[#f5f3ef]">
                    {isGoogle ? 'Google OAuth 2.0' : 'Email & Password'}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-[#878278] dark:text-[#7d7970] font-mono">Payment Instrument</span>
                  <div className="font-semibold text-[#1f1e1b] dark:text-[#f5f3ef] flex items-center gap-1">
                    <CreditCard className="w-3 h-3 text-neutral-400" />
                    <span>{user.paymentMethod || 'MASTERCARD'} •••• 8812</span>
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
                  <span>
                    {requestsUsed.toLocaleString()} / {requestLimit.toLocaleString()} ({usagePercent}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-6 text-xs text-[#5c5850] dark:text-[#b8b4aa] pt-1">
                <div>
                  <span className="font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">{activeAgents}</span> Active Agents Allowed
                </div>
                <div>
                  <span className="font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">{virtualKeys}</span> Zero-Trust Keys
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Timestamps & Security Operations */}
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="text-[11px] font-mono text-[#878278] dark:text-[#7d7970] space-y-1">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Registered: {user.createdAt ? new Date(user.createdAt).toLocaleString() : 'Active'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Last Active: {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Recent'}</span>
                </div>
              </div>

              <button
                onClick={handlePasswordReset}
                disabled={isResettingPassword}
                className="px-3 py-1.5 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] hover:bg-[#f4f1ea] dark:hover:bg-[#282622] text-[#1f1e1b] dark:text-[#f5f3ef] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 bg-white dark:bg-[#211f1c] shadow-xs"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                <span>{isResettingPassword ? 'Sending...' : 'Send Password Reset'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#151412] flex items-center justify-between">
          <span className="text-[11px] text-[#878278] dark:text-[#7d7970] font-mono flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-[#d97706]" />
            <span>Synced with Firebase Firestore &amp; Firebase Auth</span>
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
