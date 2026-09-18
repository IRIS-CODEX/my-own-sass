import React, { useState } from 'react';
import {
  CreditCard,
  Check,
  Send,
  MessageSquare,
  Users,
  Shield,
  Clock,
  ExternalLink,
  Download,
  AlertCircle,
  Sparkles,
  Smartphone,
  Copy,
  Receipt
} from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';

interface Invoice {
  id: string;
  date: string;
  amount: string;
  method: string;
  status: 'PAID' | 'PENDING';
  downloadUrl: string;
}

const SAMPLE_INVOICES: Invoice[] = [
  { id: 'INV-2026-09-8812', date: 'Sep 01, 2026', amount: '$49.00 USD', method: 'PayPal (I-SUB-PAYPAL-982114)', status: 'PAID', downloadUrl: '#' },
  { id: 'INV-2026-08-7719', date: 'Aug 01, 2026', amount: '$49.00 USD', method: 'Mastercard ending in 4112', status: 'PAID', downloadUrl: '#' },
  { id: 'INV-2026-07-6604', date: 'Jul 01, 2026', amount: '$49.00 USD', method: 'Mastercard ending in 4112', status: 'PAID', downloadUrl: '#' },
];

export const SettingsHub: React.FC = () => {
  const { currentOrg, updateOrg, addToast } = useAppStore();
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [telegramTokenCopied, setTelegramTokenCopied] = useState(false);

  // Invite user state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'MEMBER' | 'AUDITOR'>('MEMBER');

  const quotaPercent = Math.round((currentOrg.monthlyRequestsUsed / currentOrg.monthlyRequestLimit) * 100);

  const handleCopyTelegramLink = () => {
    navigator.clipboard.writeText('https://t.me/AgentLensBot?start=tok_org_9981a_pair');
    setTelegramTokenCopied(true);
    setTimeout(() => setTelegramTokenCopied(false), 2000);
    addToast({ title: 'Telegram Pairing Link Copied', type: 'info' });
  };

  const handleSwitchPlan = (cycle: 'MONTHLY' | 'YEARLY') => {
    setSelectedBillingCycle(cycle);
    updateOrg({
      planTier: cycle === 'YEARLY' ? 'PRO_YEARLY' : 'PRO_MONTHLY',
    });
    addToast({
      title: 'Plan Updated',
      description: `Switched to Pro ${cycle.toLowerCase()} plan.`,
      type: 'success'
    });
  };

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    addToast({
      title: 'Team Member Invited',
      description: `Invitation sent to ${inviteEmail} with role ${inviteRole}.`,
      type: 'success'
    });
    setInviteEmail('');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Subscription & PayPal / Mastercard Billing */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-[#1f1e1b] dark:text-[#f5f3ef] flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#d97706] dark:text-[#f59e0b]" />
              <span>Subscription & Gateway Quota Billing</span>
            </h2>
            <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa] mt-0.5 font-medium">
              Managed recurring subscriptions via PayPal Subscriptions & Mastercard / Visa debit/credit
            </p>
          </div>

          {/* Monthly / Yearly Toggle */}
          <div className="inline-flex p-1 bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] rounded-xl text-xs font-bold">
            <button
              onClick={() => handleSwitchPlan('MONTHLY')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedBillingCycle === 'MONTHLY'
                  ? 'bg-[#1f1e1b] dark:bg-[#f5f3ef] text-white dark:text-[#181715] font-bold shadow-xs'
                  : 'text-[#5c5850] dark:text-[#b8b4aa] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef]'
              }`}
            >
              Pro Monthly ($49/mo)
            </button>
            <button
              onClick={() => handleSwitchPlan('YEARLY')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                selectedBillingCycle === 'YEARLY'
                  ? 'bg-[#1f1e1b] dark:bg-[#f5f3ef] text-white dark:text-[#181715] font-bold shadow-xs'
                  : 'text-[#5c5850] dark:text-[#b8b4aa] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef]'
              }`}
            >
              <span>Pro Yearly ($470/yr)</span>
              <span className="text-[10px] text-[#d97706] dark:text-[#f59e0b] font-bold bg-amber-500/10 px-1 rounded">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Current Plan Overview Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl border border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715] space-y-2">
            <span className="text-[11px] font-mono uppercase text-[#878278] dark:text-[#7d7970] font-bold">Current Active Plan</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                {currentOrg.planTier === 'PRO_YEARLY' ? 'Pro Yearly' : 'Pro Monthly'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-[#d97706] dark:text-[#f59e0b] border border-amber-500/20">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa] font-medium">
              Renews automatically on <strong className="text-[#1f1e1b] dark:text-[#f5f3ef] font-mono">Oct 01, 2026</strong>
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715] space-y-2">
            <span className="text-[11px] font-mono uppercase text-[#878278] dark:text-[#7d7970] font-bold">Gateway Requests Consumed</span>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-[#1f1e1b] dark:text-[#f5f3ef] font-mono">
                {currentOrg.monthlyRequestsUsed.toLocaleString()}
              </span>
              <span className="text-xs text-[#878278] dark:text-[#7d7970] font-mono font-medium">
                / {currentOrg.monthlyRequestLimit.toLocaleString()}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#e5e0d5] dark:bg-[#33302b] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#d97706] dark:bg-[#f59e0b]"
                style={{ width: `${quotaPercent}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715] space-y-2">
            <span className="text-[11px] font-mono uppercase text-[#878278] dark:text-[#7d7970] font-bold">Primary Payment Method</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                PayPal Wallet & Mastercard
              </span>
            </div>
            <p className="text-[11px] text-[#878278] dark:text-[#7d7970] font-mono truncate">
              ID: {currentOrg.paypalSubscriptionId}
            </p>
          </div>
        </div>

        {/* PayPal SDK & Card Container */}
        <div className="p-5 rounded-2xl border border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-[#1f1e1b] dark:text-[#f5f3ef] font-mono">
                PayPal JS SDK / Hosted Card Gateway
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-[#d97706] dark:text-[#f59e0b] font-mono font-bold border border-amber-500/20">
                PCI-DSS Level 1
              </span>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              Recurring HMAC Webhook Verified
            </span>
          </div>

          <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa] font-medium">
            AgentLens integrates with PayPal Subscriptions API (`BILLING.SUBSCRIPTION.ACTIVATED`, `PAYMENT.SALE.COMPLETED`). Time-bound access cutoff is synced with <code className="font-mono font-bold text-[#d97706] dark:text-[#f59e0b]">current_period_end</code> in Redis.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => addToast({ title: 'PayPal Sandbox Loaded', description: 'PayPal checkout subscription ready.', type: 'info' })}
              className="px-4 py-2 bg-[#0070ba] hover:bg-[#005ea6] text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <span>PayPal Subscribe</span>
            </button>

            <button
              onClick={() => addToast({ title: 'Debit or Credit Card', description: 'Mastercard / Visa card fields initialized.', type: 'info' })}
              className="px-4 py-2 bg-[#d97706] hover:bg-[#b45309] text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Debit or Credit Card (Mastercard / Visa)</span>
            </button>
          </div>
        </div>

        {/* Invoice History Table */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef] uppercase tracking-wider font-mono">
            Invoice Ledger & Tax Receipts
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#faf8f5] dark:bg-[#181715] text-[#1f1e1b] dark:text-[#f5f3ef] border-b border-[#e5e0d5] dark:border-[#33302b] font-bold">
                <tr>
                  <th className="py-2.5 px-3">Invoice ID</th>
                  <th className="py-2.5 px-3">Billing Date</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Payment Method</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e0d5] dark:divide-[#33302b]">
                {SAMPLE_INVOICES.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#faf8f5]/60 dark:hover:bg-[#181715]/60 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                      {inv.id}
                    </td>
                    <td className="py-2.5 px-3 text-[#878278] dark:text-[#7d7970]">{inv.date}</td>
                    <td className="py-2.5 px-3 font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">{inv.amount}</td>
                    <td className="py-2.5 px-3 text-[#5c5850] dark:text-[#b8b4aa] font-sans text-xs">{inv.method}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-sans">
                      <button
                        onClick={() => addToast({ title: 'Invoice Downloaded', description: `Downloaded PDF receipt for ${inv.id}.`, type: 'success' })}
                        className="text-[#d97706] dark:text-[#f59e0b] font-bold hover:underline inline-flex items-center gap-1 text-xs cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        <span>PDF</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 2. Mobile Pairing Integrations: Telegram & Slack */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs space-y-6">
        <div>
          <h2 className="text-sm font-bold text-[#1f1e1b] dark:text-[#f5f3ef] flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#d97706] dark:text-[#f59e0b]" />
            <span>Mobile 1-Tap Approvals Pairing (Telegram & Slack)</span>
          </h2>
          <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa] mt-0.5 font-medium">
            Receive push notifications on your smartphone when agents require supervisor authorization
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Telegram Card */}
          <div className="p-5 rounded-2xl border border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#229ED9]/15 text-[#229ED9] rounded-xl">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-[#1f1e1b] dark:text-[#f5f3ef]">
                    Telegram Approval Bot
                  </h3>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                    ONLINE & PAIRED
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa] font-medium">
              Receive inline keyboard cards with <strong className="text-[#1f1e1b] dark:text-[#f5f3ef]">[Approve]</strong> and <strong className="text-[#1f1e1b] dark:text-[#f5f3ef]">[Reject]</strong> buttons directly in Telegram.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <div className="flex-1 bg-white dark:bg-[#211f1c] p-2 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] font-mono text-xs text-[#5c5850] dark:text-[#b8b4aa] truncate">
                https://t.me/AgentLensBot?start=tok_org_9981a_pair
              </div>
              <button
                onClick={handleCopyTelegramLink}
                className="p-2 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] hover:bg-amber-500/10 text-[#5c5850] dark:text-[#b8b4aa] transition-colors cursor-pointer"
                title="Copy deep link"
              >
                {telegramTokenCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Slack Card */}
          <div className="p-5 rounded-2xl border border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#4A154B]/15 text-[#E01E5A] rounded-xl">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-[#1f1e1b] dark:text-[#f5f3ef]">
                    Slack App Block Kit Integration
                  </h3>
                  <span className="text-[10px] text-[#878278] dark:text-[#7d7970] font-mono font-medium">
                    Target: #agent-supervisors
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa] font-medium">
              Interactive Block Kit messages with immediate supervisor steering textarea in your team channel.
            </p>

            <div className="pt-1">
              <button
                onClick={() => addToast({ title: 'Slack Connected', description: 'Webhook test ping dispatched to #agent-supervisors.', type: 'success' })}
                className="px-3.5 py-2 bg-[#4A154B] hover:bg-[#3d113d] text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Send Test Slack Block Kit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Team RBAC Access Management */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#1f1e1b] dark:text-[#f5f3ef] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#d97706] dark:text-[#f59e0b]" />
              <span>Team Members & Role-Based Access Control (RBAC)</span>
            </h2>
            <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa] mt-0.5 font-medium">
              Manage operators authorized to approve actions, modify policies, and inspect secret keys
            </p>
          </div>
        </div>

        {/* Invite Bar */}
        <form onSubmit={handleInviteUser} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
          <input
            type="email"
            required
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="colleague@acmelabs.ai"
            className="flex-1 bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] rounded-xl p-2.5 text-xs text-[#1f1e1b] dark:text-[#f5f3ef] placeholder-[#878278] focus:outline-hidden focus:border-[#d97706] font-medium"
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as any)}
            className="bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] rounded-xl p-2.5 text-xs text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:border-[#d97706] font-medium"
          >
            <option value="ADMIN">ADMIN (Full Governance & Vault Access)</option>
            <option value="MEMBER">MEMBER (HITL Approval Sign-Off Only)</option>
            <option value="AUDITOR">AUDITOR (Read-Only Compliance Logs)</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2.5 bg-[#d97706] hover:bg-[#b45309] text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
          >
            Send Invite
          </button>
        </form>

        {/* Members List */}
        <div className="space-y-2 pt-2">
          <div className="p-3.5 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715] flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-[#1f1e1b] dark:text-[#f5f3ef] block">ciso@acmelabs.ai</span>
              <span className="text-[11px] text-[#878278] dark:text-[#7d7970] font-medium">Workspace Owner • 2FA TOTP Enforced</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full font-mono font-bold text-[10px] bg-amber-500/10 text-[#d97706] dark:text-[#f59e0b] border border-amber-500/20">
              OWNER
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715] flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-[#1f1e1b] dark:text-[#f5f3ef] block">lead-dev@acmelabs.ai</span>
              <span className="text-[11px] text-[#878278] dark:text-[#7d7970] font-medium">Joined Aug 12, 2026 • Telegram Paired</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full font-mono font-bold text-[10px] bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
              ADMIN
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
