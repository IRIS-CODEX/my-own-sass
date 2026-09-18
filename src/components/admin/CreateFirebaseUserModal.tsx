import React, { useState } from 'react';
import { X, Flame, ShieldAlert, CheckCircle2, UserPlus } from 'lucide-react';
import { firebaseSignUpWithEmail, FirebaseUserProfile } from '../../lib/firebaseAuth';
import { useAppStore } from '../../stores/useAppStore';
import { useAdminStore } from '../../stores/useAdminStore';
import { TenantAdmin } from '../../types';

interface CreateFirebaseUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: (user: FirebaseUserProfile) => void;
}

export const CreateFirebaseUserModal: React.FC<CreateFirebaseUserModalProps> = ({
  isOpen,
  onClose,
  onUserCreated,
}) => {
  const { addToast } = useAppStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organization, setOrganization] = useState('');
  const [planTier, setPlanTier] = useState<TenantAdmin['planTier']>('PRO_MONTHLY');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim() || !organization.trim()) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await firebaseSignUpWithEmail(
        name.trim(),
        email.trim(),
        password,
        organization.trim(),
        planTier
      );

      if (res.success && res.user) {
        useAdminStore.getState().recordNewSubscription({
          tenantName: organization.trim(),
          email: email.trim(),
          planTier,
          amountUsd: planTier === 'ENTERPRISE' ? 599 : planTier === 'PRO_MONTHLY' ? 199 : 49,
          paymentMethod: 'MASTERCARD',
        });
        onUserCreated(res.user);
        addToast({
          title: 'Firebase User Provisioned',
          description: `User ${name} (${email}) created in Firebase Auth and synced to Cloud Firestore.`,
          type: 'success',
        });
        onClose();
        setName('');
        setEmail('');
        setPassword('');
        setOrganization('');
      } else {
        // Fallback local registration
        useAdminStore.getState().recordNewSubscription({
          tenantName: organization.trim(),
          email: email.trim(),
          planTier,
          amountUsd: planTier === 'ENTERPRISE' ? 599 : planTier === 'PRO_MONTHLY' ? 199 : 49,
          paymentMethod: 'MASTERCARD',
        });
        addToast({
          title: 'Tenant Registered',
          description: res.error || `Added ${name} to tenant organization directory.`,
          type: 'info',
        });
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to provision user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-lg p-6 rounded-2xl bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#e5e0d5] dark:border-[#33302b] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-[#d97706] dark:text-[#f59e0b]">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                Sign Up &amp; Register User with Firebase
              </h3>
              <p className="text-[11px] text-[#5c5850] dark:text-[#b8b4aa]">
                Creates Firebase Auth credentials and writes to Firestore /users in europe-west1
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 text-[#5c5850] dark:text-[#b8b4aa] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#5c5850] dark:text-[#b8b4aa] mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Elena Vance"
                className="w-full bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] rounded-xl p-2.5 text-xs text-[#1f1e1b] dark:text-[#f5f3ef] placeholder-[#878278] dark:placeholder-[#7d7970] focus:outline-hidden focus:border-[#d97706]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#5c5850] dark:text-[#b8b4aa] mb-1">
                Work Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="elena@blackmesa.io"
                className="w-full bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] rounded-xl p-2.5 text-xs text-[#1f1e1b] dark:text-[#f5f3ef] placeholder-[#878278] dark:placeholder-[#7d7970] focus:outline-hidden focus:border-[#d97706]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#5c5850] dark:text-[#b8b4aa] mb-1">
                Organization / Company *
              </label>
              <input
                type="text"
                required
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="Black Mesa Operations"
                className="w-full bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] rounded-xl p-2.5 text-xs text-[#1f1e1b] dark:text-[#f5f3ef] placeholder-[#878278] dark:placeholder-[#7d7970] focus:outline-hidden focus:border-[#d97706]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5c5850] dark:text-[#b8b4aa] mb-1">
                Initial Password *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] rounded-xl p-2.5 text-xs text-[#1f1e1b] dark:text-[#f5f3ef] placeholder-[#878278] dark:placeholder-[#7d7970] focus:outline-hidden focus:border-[#d97706]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#5c5850] dark:text-[#b8b4aa] mb-1">
              Subscription Plan Tier
            </label>
            <select
              value={planTier}
              onChange={(e) => setPlanTier(e.target.value as any)}
              className="w-full bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] rounded-xl p-2.5 text-xs text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:border-[#d97706] cursor-pointer"
            >
              <option value="FREE">Free Tier (10,000 monthly calls / 2 agents)</option>
              <option value="STARTER">Starter Tier ($49/mo - 50,000 calls / 5 agents)</option>
              <option value="PRO_MONTHLY">Pro Monthly ($199/mo - 300,000 calls / 20 agents)</option>
              <option value="ENTERPRISE">Enterprise SLA ($599/mo - 2,500,000 calls / Unlimited)</option>
            </select>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-[#5c5850] dark:text-[#b8b4aa] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>
              The user can immediately log in on the landing page or portal using these credentials or their Google account.
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#e5e0d5] dark:border-[#33302b]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] text-xs font-semibold text-[#5c5850] dark:text-[#b8b4aa] cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-[#d97706] hover:bg-[#b45309] dark:bg-[#f59e0b] dark:hover:bg-[#fbbf24] text-white dark:text-[#181715] font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{loading ? 'Registering with Firebase...' : 'Register User'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
