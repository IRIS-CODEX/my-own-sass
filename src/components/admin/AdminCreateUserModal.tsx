import React, { useState } from 'react';
import { X, User, Mail, Building2, Phone, Briefcase, CreditCard, Sparkles, AlertCircle, Flame } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { useAdminStore } from '../../stores/useAdminStore';
import { db, doc, setDoc } from '../../lib/firebase';
import { FirebaseUserProfile } from '../../lib/firebaseAuth';

interface AdminCreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

export const AdminCreateUserModal: React.FC<AdminCreateUserModalProps> = ({
  isOpen,
  onClose,
  onUserCreated,
}) => {
  const { addToast } = useAppStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [orgName, setOrgName] = useState('');
  const [jobTitle, setJobTitle] = useState('Lead AI Engineer');
  const [planTier, setPlanTier] = useState<'FREE' | 'STARTER' | 'PRO_MONTHLY' | 'ENTERPRISE'>('PRO_MONTHLY');
  const [role, setRole] = useState<'owner' | 'super-admin' | 'user' | 'admin'>('owner');
  const [useCase, setUseCase] = useState('Production Autonomous Agent Fleet');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Please provide user name and email address.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const uid = `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
      const organizationName = orgName.trim() || `${name.trim()}'s Team`;

      const profile: FirebaseUserProfile = {
        id: uid,
        email: email.trim(),
        displayName: name.trim(),
        organizationName,
        planTier,
        role: role as any,
        phone: phone.trim() || undefined,
        jobTitle: jobTitle.trim() || undefined,
        useCase: useCase.trim() || undefined,
        authProvider: email.toLowerCase().endsWith('@gmail.com') ? 'google' : 'email',
        requestsUsed: 0,
        requestLimit: planTier === 'ENTERPRISE' ? 2000000 : planTier === 'PRO_MONTHLY' ? 250000 : planTier === 'STARTER' ? 50000 : 10000,
        activeAgentsCount: planTier === 'ENTERPRISE' ? 30 : planTier === 'PRO_MONTHLY' ? 10 : 3,
        virtualKeysCount: planTier === 'ENTERPRISE' ? 25 : planTier === 'PRO_MONTHLY' ? 5 : 2,
        monthlySpendUsd: planTier === 'ENTERPRISE' ? 599 : planTier === 'PRO_MONTHLY' ? 199 : planTier === 'STARTER' ? 49 : 0,
        paymentMethod: 'MASTERCARD',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      // 1. Write directly to Firestore /users collection
      await setDoc(doc(db, 'users', uid), profile);

      // 2. Record user in Admin Store & Tenants
      useAdminStore.getState().recordUserSignInOrSignUp({
        email: email.trim(),
        displayName: name.trim(),
        organizationName,
        planTier,
        authProvider: email.toLowerCase().endsWith('@gmail.com') ? 'google' : 'email',
        firebaseUid: uid,
      });

      addToast({
        title: 'User Registered in Firebase',
        description: `Successfully registered ${name} (${email}) on ${planTier} package.`,
        type: 'success',
      });

      onUserCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create user in Firebase');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white dark:bg-[#1c1b18] border border-[#e5e0d5] dark:border-[#33302b] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#e5e0d5] dark:border-[#33302b] flex items-center justify-between bg-[#faf8f5] dark:bg-[#151412]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                Register User &amp; Assign Package in Firebase
              </h3>
              <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa]">
                Stores user profile, authentication credentials, and active subscription package into Firebase
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 flex items-center justify-center text-[#5c5850] dark:text-[#b8b4aa] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono uppercase text-[#5c5850] dark:text-[#b8b4aa] block mb-1 font-bold">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-[#878278] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Mercer"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#151412] text-xs text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase text-[#5c5850] dark:text-[#b8b4aa] block mb-1 font-bold">
                Gmail or Work Email *
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-[#878278] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. alex@gmail.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#151412] text-xs text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono uppercase text-[#5c5850] dark:text-[#b8b4aa] block mb-1 font-bold">
                Company / Organization
              </label>
              <div className="relative">
                <Building2 className="w-3.5 h-3.5 text-[#878278] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. Quantum Autonomous"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#151412] text-xs text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase text-[#5c5850] dark:text-[#b8b4aa] block mb-1 font-bold">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-[#878278] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +1 (555) 019-2831"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#151412] text-xs text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono uppercase text-[#5c5850] dark:text-[#b8b4aa] block mb-1 font-bold">
                Job Title / Role in Team
              </label>
              <div className="relative">
                <Briefcase className="w-3.5 h-3.5 text-[#878278] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Chief AI Officer"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#151412] text-xs text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase text-[#5c5850] dark:text-[#b8b4aa] block mb-1 font-bold">
                Access Level
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#151412] text-xs text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:border-blue-500"
              >
                <option value="owner">Owner (Full Permissions)</option>
                <option value="super-admin">Super Admin (Root Operations)</option>
                <option value="admin">Administrator</option>
                <option value="user">Standard User</option>
              </select>
            </div>
          </div>

          {/* Package Selection */}
          <div className="space-y-2 pt-1">
            <label className="text-[11px] font-mono uppercase text-[#5c5850] dark:text-[#b8b4aa] block font-bold">
              Subscription Package Assignment *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'FREE', name: 'Free', price: '$0/mo', req: '10k req' },
                { id: 'STARTER', name: 'Starter', price: '$49/mo', req: '50k req' },
                { id: 'PRO_MONTHLY', name: 'Pro Fleet', price: '$199/mo', req: '250k req' },
                { id: 'ENTERPRISE', name: 'Enterprise', price: '$599/mo', req: 'Unlimited' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlanTier(p.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    planTier === p.id
                      ? 'border-blue-500 bg-blue-500/10 text-[#1f1e1b] dark:text-[#f5f3ef]'
                      : 'border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#151412] text-[#5c5850] dark:text-[#b8b4aa] hover:border-[#b8b4aa]'
                  }`}
                >
                  <div className="font-bold text-xs">{p.name}</div>
                  <div className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400 mt-0.5">{p.price}</div>
                  <div className="font-mono text-[10px] text-[#878278] dark:text-[#7d7970] mt-0.5">{p.req}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Footer actions */}
          <div className="pt-4 border-t border-[#e5e0d5] dark:border-[#33302b] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] text-xs font-semibold text-[#5c5850] dark:text-[#b8b4aa] hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isLoading ? 'Saving to Firebase...' : 'Register User in Firebase'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
