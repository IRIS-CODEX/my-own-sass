import React, { useState } from 'react';
import {
  Flame,
  RefreshCw,
  UserPlus,
  Copy,
  ShieldCheck,
  Search,
  KeyRound,
  Trash2,
  Sliders,
  Check,
  Mail,
  Building,
  TrendingUp,
  X,
  Eye,
} from 'lucide-react';
import { FirebaseUserProfile, updateFirestoreUserPlan, deleteFirestoreUser, dispatchPasswordReset } from '../../lib/firebaseAuth';
import { useAppStore } from '../../stores/useAppStore';
import { useAdminStore } from '../../stores/useAdminStore';
import { UserDetailModal } from './UserDetailModal';

interface FirebaseUsersTableProps {
  users: FirebaseUserProfile[];
  isLoading: boolean;
  onSync: () => void;
  onOpenCreate: () => void;
  onPlanChanged?: (userId: string, newPlan: string) => void;
  onDeleteUser?: (userId: string) => void;
}

export const FirebaseUsersTable: React.FC<FirebaseUsersTableProps> = ({
  users,
  isLoading,
  onSync,
  onOpenCreate,
  onPlanChanged,
  onDeleteUser,
}) => {
  const { addToast } = useAppStore();
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('ALL');
  const [editingPlanUserId, setEditingPlanUserId] = useState<string | null>(null);
  const [selectedPlanForUser, setSelectedPlanForUser] = useState<string>('PRO_MONTHLY');
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);
  const [copiedUid, setCopiedUid] = useState<string | null>(null);
  const [selectedDetailUser, setSelectedDetailUser] = useState<FirebaseUserProfile | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const googleUsersCount = users.filter((u) => u.email?.toLowerCase().endsWith('@gmail.com')).length;

  // Filter users by search and plan
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !search.trim() ||
      u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.organizationName?.toLowerCase().includes(search.toLowerCase()) ||
      u.id?.toLowerCase().includes(search.toLowerCase());

    const matchesPlan = filterPlan === 'ALL' || u.planTier === filterPlan;

    return matchesSearch && matchesPlan;
  });

  // Calculate approximate MRR from Firebase subscriptions
  const calculatedMRR = users.reduce((acc, u) => {
    const p = u.planTier;
    if (p === 'ENTERPRISE') return acc + 599;
    if (p === 'PRO_YEARLY') return acc + 179;
    if (p === 'PRO_MONTHLY') return acc + 199;
    if (p === 'STARTER') return acc + 49;
    return acc;
  }, 0);

  const handleCopy = (uid: string) => {
    navigator.clipboard.writeText(uid);
    setCopiedUid(uid);
    setTimeout(() => setCopiedUid(null), 2000);
    addToast({ title: 'Firebase UID Copied', description: uid, type: 'info' });
  };

  const handlePasswordReset = async (email: string) => {
    try {
      const res = await dispatchPasswordReset(email);
      if (res.success) {
        addToast({
          title: 'Password Reset Dispatched',
          description: `Sent security password reset instructions to ${email} via Firebase Auth.`,
          type: 'success',
        });
      } else {
        addToast({
          title: 'Password Reset Notice',
          description: res.error || `Instructions queued for ${email}.`,
          type: 'info',
        });
      }
    } catch {
      addToast({
        title: 'Reset Triggered',
        description: `Triggered reset email to ${email}.`,
        type: 'info',
      });
    }
  };

  const handleSavePlanChange = async (user: FirebaseUserProfile) => {
    setIsUpdatingPlan(true);
    try {
      // 1. Update Firestore
      await updateFirestoreUserPlan(user.id, selectedPlanForUser);

      // 2. Update Admin Store
      useAdminStore.getState().changeTenantPlan(user.id, selectedPlanForUser as any);

      // 3. Callback if provided
      if (onPlanChanged) {
        onPlanChanged(user.id, selectedPlanForUser);
      }

      addToast({
        title: 'Package Tier Updated',
        description: `Updated ${user.displayName || user.email} to ${selectedPlanForUser} in Firebase Firestore.`,
        type: 'success',
      });

      setEditingPlanUserId(null);
      onSync();
    } catch (err: any) {
      addToast({
        title: 'Plan Update Failed',
        description: err.message || 'Could not update package.',
        type: 'error',
      });
    } finally {
      setIsUpdatingPlan(false);
    }
  };

  const handleDeleteUser = async (user: FirebaseUserProfile) => {
    if (!window.confirm(`Are you sure you want to remove ${user.displayName || user.email} from Firebase?`)) {
      return;
    }
    try {
      await deleteFirestoreUser(user.id);
      useAdminStore.getState().deleteTenant(user.id);
      if (onDeleteUser) onDeleteUser(user.id);

      addToast({
        title: 'User Deleted',
        description: `Removed user ${user.email} from Firebase Firestore.`,
        type: 'success',
      });
      onSync();
    } catch (err: any) {
      addToast({
        title: 'Delete Failed',
        description: err.message || 'Could not delete user.',
        type: 'error',
      });
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs space-y-4">
      {/* Header & Stats Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm font-bold text-[#1f1e1b] dark:text-[#f5f3ef] flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#d97706] dark:text-[#f59e0b]" />
              <span>Firebase Auth &amp; Google Auth Users ({users.length})</span>
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-[#b45309] dark:text-[#fbbf24] border border-amber-500/20">
              {googleUsersCount} Google SSO
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              ${calculatedMRR.toLocaleString()}/mo MRR
            </span>
          </div>
          <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa] mt-0.5">
            Real-time subscriber roster managed exclusively via Firebase Auth &amp; Firestore collection <span className="font-mono text-[#b45309] dark:text-[#fbbf24]">/users</span> (Cloud Region: europe-west1)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSync}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715] hover:bg-[#f4f1ea] text-[#1f1e1b] dark:text-[#f5f3ef] font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Syncing...' : 'Sync Firestore'}</span>
          </button>
          <button
            onClick={onOpenCreate}
            className="px-3.5 py-1.5 rounded-xl bg-[#d97706] hover:bg-[#b45309] dark:bg-[#f59e0b] dark:hover:bg-[#fbbf24] text-white dark:text-[#181715] font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register User</span>
          </button>
        </div>
      </div>

      {/* Filter Chips & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {['ALL', 'FREE', 'STARTER', 'PRO_MONTHLY', 'ENTERPRISE'].map((plan) => {
            const count = plan === 'ALL' ? users.length : users.filter((u) => u.planTier === plan).length;
            return (
              <button
                key={plan}
                onClick={() => setFilterPlan(plan)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  filterPlan === plan
                    ? 'bg-[#d97706] dark:bg-[#f59e0b] text-white dark:text-[#181715]'
                    : 'bg-[#faf8f5] dark:bg-[#181715] hover:bg-[#f4f1ea] dark:hover:bg-[#282622] text-[#5c5850] dark:text-[#b8b4aa] border border-[#e5e0d5] dark:border-[#33302b]'
                }`}
              >
                <span>{plan === 'ALL' ? 'All Packages' : plan.replace('_', ' ')}</span>
                <span className="text-[10px] font-mono opacity-80">({count})</span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#878278]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Firebase user, Gmail, or Org..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715] text-xs text-[#1f1e1b] dark:text-[#f5f3ef] placeholder-[#878278] focus:outline-hidden focus:border-amber-500 font-medium"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#1f1e1b] dark:text-[#f5f3ef]">
          <thead className="bg-[#faf8f5] dark:bg-[#181715] font-mono text-[11px] text-[#5c5850] dark:text-[#b8b4aa] uppercase border-b border-[#e5e0d5] dark:border-[#33302b]">
            <tr>
              <th className="p-3 w-12 text-center">#</th>
              <th className="p-3">User &amp; Gmail</th>
              <th className="p-3">Chosen Package</th>
              <th className="p-3">Organization</th>
              <th className="p-3">Firebase UID</th>
              <th className="p-3">Role</th>
              <th className="p-3">Created / Active</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e0d5]/60 dark:divide-[#33302b]/60 font-sans">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-[#878278] dark:text-[#7d7970] text-xs">
                  No Firebase users match your query. Click "Register User" or "Sync Firestore".
                </td>
              </tr>
            ) : (
              filteredUsers.map((u, idx) => {
                const isGoogle = u.email?.toLowerCase().endsWith('@gmail.com');
                const plan = u.planTier || 'PRO_MONTHLY';
                const priceTag =
                  plan === 'ENTERPRISE'
                    ? '$599/mo'
                    : plan === 'PRO_YEARLY'
                    ? '$179/mo'
                    : plan === 'PRO_MONTHLY'
                    ? '$199/mo'
                    : plan === 'STARTER'
                    ? '$49/mo'
                    : '$0/mo';

                const isEditingThisUser = editingPlanUserId === u.id;

                return (
                  <tr key={u.id} className="hover:bg-[#f4f1ea]/50 dark:hover:bg-[#282622]/50 transition-colors">
                    {/* User Number */}
                    <td className="p-3 text-center font-mono font-bold text-[#b45309] dark:text-[#fbbf24]">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">
                        #{idx + 1}
                      </span>
                    </td>

                    {/* User & Gmail */}
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-amber-500/10 text-[#b45309] dark:text-[#fbbf24] flex items-center justify-center font-bold text-xs uppercase flex-shrink-0 border border-amber-500/20">
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
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30 font-mono flex items-center gap-0.5">
                                <span>Google Auth</span>
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#5c5850] dark:text-[#b8b4aa] font-mono flex items-center gap-1">
                            <span className={isGoogle ? 'font-semibold text-blue-700 dark:text-blue-300' : ''}>
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Chosen Package */}
                    <td className="p-3">
                      {isEditingThisUser ? (
                        <div className="flex items-center gap-1.5">
                          <select
                            value={selectedPlanForUser}
                            onChange={(e) => setSelectedPlanForUser(e.target.value)}
                            className="px-2 py-1 rounded-lg border border-amber-500 bg-[#faf8f5] dark:bg-[#151412] text-xs font-mono font-bold text-[#1f1e1b] dark:text-[#f5f3ef]"
                          >
                            <option value="FREE">FREE ($0)</option>
                            <option value="STARTER">STARTER ($49/mo)</option>
                            <option value="PRO_MONTHLY">PRO MONTHLY ($199/mo)</option>
                            <option value="ENTERPRISE">ENTERPRISE ($599/mo)</option>
                          </select>
                          <button
                            onClick={() => handleSavePlanChange(u)}
                            disabled={isUpdatingPlan}
                            className="p-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                            title="Confirm Plan"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingPlanUserId(null)}
                            className="p-1 rounded-lg bg-neutral-300 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 cursor-pointer"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-amber-500/10 text-[#b45309] dark:text-[#fbbf24] border border-amber-500/20 inline-block">
                              {plan}
                            </span>
                            <button
                              onClick={() => {
                                setEditingPlanUserId(u.id);
                                setSelectedPlanForUser(u.planTier || 'PRO_MONTHLY');
                              }}
                              className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
                              title="Change Plan"
                            >
                              Change
                            </button>
                          </div>
                          <div className="text-[10px] font-mono text-[#5c5850] dark:text-[#b8b4aa] font-semibold">
                            {priceTag}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Organization */}
                    <td className="p-3 font-medium text-[#1f1e1b] dark:text-[#f5f3ef]">
                      {u.organizationName || 'Autonomous Fleet'}
                    </td>

                    {/* Firebase UID */}
                    <td className="p-3 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-[#5c5850] dark:text-[#b8b4aa] font-mono text-[10px] border border-[#e5e0d5] dark:border-[#33302b]">
                          {u.id.substring(0, 12)}...
                        </span>
                        <button
                          onClick={() => handleCopy(u.id)}
                          className="p-1 text-[#878278] hover:text-[#1f1e1b] dark:hover:text-white cursor-pointer"
                          title="Copy Firebase UID"
                        >
                          {copiedUid === u.id ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 flex items-center gap-1 w-fit">
                        <ShieldCheck className="w-3 h-3 text-blue-500" />
                        {u.role || 'owner'}
                      </span>
                    </td>

                    {/* Created / Last Active */}
                    <td className="p-3 text-[11px] font-mono text-[#5c5850] dark:text-[#b8b4aa]">
                      <div>Created: {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active'}</div>
                      <div className="text-[10px] opacity-75">
                        Last: {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedDetailUser(u);
                            setIsDetailModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-400 font-bold text-[11px] transition-all cursor-pointer border border-blue-500/20 flex items-center gap-1 shadow-2xs"
                          title="View User Details"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-500" />
                          <span>Detail</span>
                        </button>
                        <button
                          onClick={() => handlePasswordReset(u.email)}
                          className="px-2.5 py-1 rounded-lg bg-[#faf8f5] hover:bg-[#f4f1ea] dark:bg-[#181715] dark:hover:bg-[#282622] text-[#1f1e1b] dark:text-[#f5f3ef] font-bold text-[11px] transition-all cursor-pointer border border-[#e5e0d5] dark:border-[#33302b] shadow-xs flex items-center gap-1"
                          title="Send Password Reset Email"
                        >
                          <KeyRound className="w-3 h-3 text-amber-500" />
                          <span>Reset</span>
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer border border-transparent hover:border-rose-500/20"
                          title="Delete User from Firebase"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* User Details Modal */}
      <UserDetailModal
        user={selectedDetailUser}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedDetailUser(null);
        }}
        onSelectPlanChange={(user) => {
          setEditingPlanUserId(user.id);
          setSelectedPlanForUser(user.planTier || 'PRO_MONTHLY');
        }}
      />
    </div>
  );
};
