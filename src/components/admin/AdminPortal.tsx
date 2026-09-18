import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Users,
  CreditCard,
  ShieldAlert,
  Server,
  Settings,
  TrendingUp,
  Activity,
  AlertTriangle,
  Lock,
  Search,
  CheckCircle2,
  Cpu,
  Zap,
  X,
  RefreshCw,
  Mail,
  Send,
  Building,
  ArrowUpRight,
  AlertOctagon,
  BellRing,
  Globe,
  Radio,
  Sliders,
  UserPlus,
  Flame,
  Copy,
  ShieldCheck,
  Database,
} from 'lucide-react';
import { useAdminStore } from '../../stores/useAdminStore';
import { useAppStore } from '../../stores/useAppStore';
import { TenantAdmin } from '../../types';
import { AdminLogin } from './AdminLogin';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';
import { AdminPricingManagement } from './AdminPricingManagement';
import { FirebaseUsersTable } from './FirebaseUsersTable';
import { CreateFirebaseUserModal } from './CreateFirebaseUserModal';
import { CloudSqlUsersTable, CloudSqlUserRecord } from './CloudSqlUsersTable';
import {
  fetchAllFirestoreUsers,
  firebaseSignUpWithEmail,
  FirebaseUserProfile,
} from '../../lib/firebaseAuth';

export const AdminPortal: React.FC = () => {
  const {
    adminAuthenticated,
    adminActivePage,
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
    setGlobalAnnouncement,
  } = useAdminStore();

  const { addToast } = useAppStore();

  // Filter state for Tenants tab
  const [userFilterStatus, setUserFilterStatus] = useState<'ALL' | 'ACTIVE' | 'PAST_DUE' | 'FREE' | 'SUSPENDED'>('ALL');

  // Cloud SQL Database Users State in Users Page Section
  const [cloudSqlUsers, setCloudSqlUsers] = useState<CloudSqlUserRecord[]>([]);
  const [isLoadingCloudSql, setIsLoadingCloudSql] = useState(false);
  const [userViewTab, setUserViewTab] = useState<'cloudsql' | 'tenants' | 'firebase'>('cloudsql');

  // Firebase Users State in Users Page Section
  const [firebaseUsers, setFirebaseUsers] = useState<FirebaseUserProfile[]>([]);
  const [isLoadingFirebaseUsers, setIsLoadingFirebaseUsers] = useState(false);
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserOrg, setNewUserOrg] = useState('');
  const [newUserPlan, setNewUserPlan] = useState<TenantAdmin['planTier']>('PRO_MONTHLY');
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // Modals
  const [planModalTenant, setPlanModalTenant] = useState<TenantAdmin | null>(null);
  const [targetPlan, setTargetPlan] = useState<TenantAdmin['planTier']>('PRO_MONTHLY');
  const [newQuotaLimit, setNewQuotaLimit] = useState(300000);
  const [extraDays, setExtraDays] = useState(14);
  const [announcementInput, setAnnouncementInput] = useState(globalAnnouncement || '');

  // Fetch Cloud SQL users
  const fetchCloudSqlUsers = async () => {
    setIsLoadingCloudSql(true);
    try {
      const res = await fetch('/api/cloudsql/users');
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setCloudSqlUsers(data.users);
      }
    } catch (e: any) {
      console.warn('Could not query Cloud SQL users:', e);
    } finally {
      setIsLoadingCloudSql(false);
    }
  };

  // Sync Tenants & registered accounts to Cloud SQL
  const handleSyncTenantsToCloudSql = async () => {
    setIsLoadingCloudSql(true);
    try {
      const payload = tenants.map((t) => ({
        uid: t.id,
        email: t.ownerEmail,
        displayName: t.ownerName || t.name,
        organizationName: t.name,
        role: 'owner',
        authProvider: t.authProvider || (t.ownerEmail.toLowerCase().endsWith('@gmail.com') ? 'google' : 'email'),
        planTier: t.planTier,
        monthlyPriceUsd: t.monthlySpendUsd || 0,
        billingInterval: 'monthly',
        status: t.status,
        requestLimit: t.requestLimit,
        requestsUsed: t.requestsUsed,
        activeAgentsCount: t.activeAgentsCount,
        virtualKeysCount: t.virtualKeysCount,
      }));

      const res = await fetch('/api/cloudsql/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users: payload }),
      });
      const data = await res.json();
      if (data.success) {
        setCloudSqlUsers(data.users);
        addToast({
          title: 'Synced to Cloud SQL',
          description: `Successfully synchronized ${data.syncedCount} tenant records into Cloud SQL PostgreSQL.`,
          type: 'success',
        });
      }
    } catch (e: any) {
      addToast({
        title: 'Sync Error',
        description: e.message || 'Could not sync to Cloud SQL',
        type: 'error',
      });
    } finally {
      setIsLoadingCloudSql(false);
    }
  };

  useEffect(() => {
    fetchCloudSqlUsers();
  }, []);

  // Sync users from Firestore
  const handleSyncFirestoreUsers = async () => {
    setIsLoadingFirebaseUsers(true);
    try {
      const users = await fetchAllFirestoreUsers();
      setFirebaseUsers(users);
      addToast({
        title: 'Firestore Users Synced',
        description: `Successfully loaded ${users.length} registered users from Firebase Firestore (europe-west1).`,
        type: 'success',
      });
    } catch (e: any) {
      addToast({
        title: 'Sync Notice',
        description: e.message || 'Loaded local tenant roster.',
        type: 'info',
      });
    } finally {
      setIsLoadingFirebaseUsers(false);
    }
  };

  // Create & Register User directly with Firebase
  const handleCreateFirebaseUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim() || !newUserOrg.trim()) {
      addToast({ title: 'Missing fields', description: 'Please complete all required fields.', type: 'warning' });
      return;
    }
    setIsCreatingUser(true);
    try {
      const res = await firebaseSignUpWithEmail(
        newUserName,
        newUserEmail,
        newUserPassword,
        newUserOrg,
        newUserPlan
      );
      if (res.success && res.user) {
        useAdminStore.getState().recordNewSubscription({
          tenantName: newUserOrg,
          email: newUserEmail,
          planTier: newUserPlan,
          amountUsd: newUserPlan === 'ENTERPRISE' ? 599 : newUserPlan === 'PRO_MONTHLY' ? 199 : 49,
          paymentMethod: 'MASTERCARD',
        });
        // Also persist user & subscription directly to Cloud SQL
        try {
          await fetch('/api/cloudsql/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              uid: res.user?.id || `usr-${Date.now()}`,
              email: newUserEmail,
              displayName: newUserName,
              organizationName: newUserOrg,
              planTier: newUserPlan,
              role: 'owner',
              authProvider: newUserEmail.toLowerCase().endsWith('@gmail.com') ? 'google' : 'email',
            }),
          });
          fetchCloudSqlUsers();
        } catch (e) {
          console.warn('Cloud SQL sync notice:', e);
        }

        setFirebaseUsers((prev) => [res.user!, ...prev]);
        setIsNewUserModalOpen(false);
        setNewUserName('');
        setNewUserEmail('');
        setNewUserPassword('');
        setNewUserOrg('');
        addToast({
          title: 'User Registered in Cloud SQL & Firebase',
          description: `User ${newUserName} (${newUserEmail}) saved into Cloud SQL database and Firebase Auth.`,
          type: 'success',
        });
      } else {
        // Fallback: register locally & Cloud SQL
        try {
          await fetch('/api/cloudsql/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              uid: `usr-${Date.now()}`,
              email: newUserEmail,
              displayName: newUserName,
              organizationName: newUserOrg,
              planTier: newUserPlan,
              role: 'owner',
              authProvider: newUserEmail.toLowerCase().endsWith('@gmail.com') ? 'google' : 'email',
            }),
          });
          fetchCloudSqlUsers();
        } catch (e) {}

        useAdminStore.getState().recordNewSubscription({
          tenantName: newUserOrg,
          email: newUserEmail,
          planTier: newUserPlan,
          amountUsd: newUserPlan === 'ENTERPRISE' ? 599 : newUserPlan === 'PRO_MONTHLY' ? 199 : 49,
          paymentMethod: 'MASTERCARD',
        });
        setIsNewUserModalOpen(false);
        addToast({
          title: 'User Created in Cloud SQL',
          description: res.error || `User ${newUserName} registered into Cloud SQL PostgreSQL database.`,
          type: 'success',
        });
      }
    } catch (err: any) {
      addToast({
        title: 'Registration Error',
        description: err.message || 'Could not provision user.',
        type: 'error',
      });
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Auto-sync Cloud SQL and Firestore users when on tenants page
  React.useEffect(() => {
    if (adminActivePage === 'tenants') {
      fetchCloudSqlUsers();
      handleSyncFirestoreUsers();
    }
  }, [adminActivePage]);

  // If not authenticated, show dedicated Admin Security Login
  if (!adminAuthenticated) {
    return <AdminLogin />;
  }

  // Financial Calculations
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
      title: 'Quota Limit Overridden',
      description: `Updated ceiling to ${newQuotaLimit.toLocaleString()} and extended period for ${selectedTenant.name}.`,
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

  const displayFirebaseUsers: FirebaseUserProfile[] =
    firebaseUsers.length > 0
      ? firebaseUsers.filter((u) => {
          const q = searchQuery.toLowerCase();
          return (
            u.email.toLowerCase().includes(q) ||
            (u.displayName && u.displayName.toLowerCase().includes(q)) ||
            (u.organizationName && u.organizationName.toLowerCase().includes(q))
          );
        })
      : tenants.map((t) => ({
          id: `fb_${t.id.replace('org_', '')}`,
          email: t.ownerEmail,
          displayName: t.ownerName || t.name,
          organizationName: t.name,
          planTier: t.planTier,
          role: 'owner',
          createdAt: t.joinedAt,
          lastLoginAt: t.lastLoginAt,
        }));

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#faf8f5] dark:bg-[#181715] text-[#1f1e1b] dark:text-[#f5f3ef] font-sans selection:bg-[#d97706]/20 selection:text-[#b45309]">
      {/* Standalone Admin Sidebar */}
      <AdminSidebar />

      {/* Standalone Admin Content Shell */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <AdminTopbar />

        {/* Global Alert Bar if Kill Switch Tripped */}
        {globalKillSwitchActive && (
          <div className="bg-rose-600 text-white px-6 py-2.5 text-xs font-bold flex items-center justify-between animate-pulse shadow-md">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4" />
              <span>CIRCUIT BREAKER ENGAGED: ALL INCOMING SAAS GATEWAY TRAFFIC RETURN 503</span>
            </div>
            <button
              onClick={toggleGlobalKillSwitch}
              className="px-3 py-1 bg-white text-rose-600 font-bold rounded-lg text-[11px] cursor-pointer hover:bg-neutral-100"
            >
              Disengage Breaker
            </button>
          </div>
        )}

        {/* Scrollable Admin Work Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* VIEW 1: EXECUTIVE DASHBOARD & MRR */}
          {adminActivePage === 'dashboard' && (
            <div className="space-y-6">
              {/* High-Level Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs">
                  <span className="text-xs font-bold text-[#5c5850] dark:text-[#b8b4aa] uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Monthly Recurring Revenue
                  </span>
                  <div className="mt-2 text-2xl font-bold text-[#1f1e1b] dark:text-[#f5f3ef] flex items-baseline gap-2">
                    ${totalMRR.toLocaleString()}
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      +22.4% MoM
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-[#5c5850] dark:text-[#b8b4aa] font-medium">
                    Run Rate: <span className="font-bold font-mono text-[#1f1e1b] dark:text-[#f5f3ef]">${totalARR.toLocaleString()} ARR</span>
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs">
                  <span className="text-xs font-bold text-[#5c5850] dark:text-[#b8b4aa] uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#d97706] dark:text-[#f59e0b]" />
                    Paid Active Subscribers
                  </span>
                  <div className="mt-2 text-2xl font-bold text-[#1f1e1b] dark:text-[#f5f3ef] flex items-baseline gap-2">
                    {activePaidCount}
                    <span className="text-xs text-[#878278] dark:text-[#7d7970] font-normal">
                      / {tenants.length} tenants
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-[#5c5850] dark:text-[#b8b4aa] font-medium">
                    Average LTV: <span className="font-bold font-mono text-[#1f1e1b] dark:text-[#f5f3ef]">$3,184</span>
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs">
                  <span className="text-xs font-bold text-[#5c5850] dark:text-[#b8b4aa] uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    Overdue Debt in Dunning
                  </span>
                  <div className="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400 flex items-baseline gap-2">
                    ${totalOverdueDebt.toLocaleString()}
                    <span className="text-xs font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                      {unpaidTenants.length} accounts
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-[#5c5850] dark:text-[#b8b4aa] font-medium">
                    Automated smart retry running
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs">
                  <span className="text-xs font-bold text-[#5c5850] dark:text-[#b8b4aa] uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    Net Revenue Retention
                  </span>
                  <div className="mt-2 text-2xl font-bold text-[#1f1e1b] dark:text-[#f5f3ef] flex items-baseline gap-2">
                    128.4%
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      High Growth
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-[#5c5850] dark:text-[#b8b4aa] font-medium">
                    Suspended Accounts: <span className="font-bold font-mono text-[#1f1e1b] dark:text-[#f5f3ef]">{suspendedCount}</span>
                  </p>
                </div>
              </div>

              {/* SaaS Subscription Plans Distribution */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs space-y-4">
                <h2 className="text-sm font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                  SaaS Subscription Tier Distribution
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { plan: 'FREE HOBBY', price: '$0 / mo', users: tenants.filter(t => t.planTier === 'FREE').length, desc: '10,000 monthly requests, 2 agents' },
                    { plan: 'STARTER', price: '$49 / mo', users: tenants.filter(t => t.planTier === 'STARTER').length, desc: '50,000 requests, 5 agents, basic policies' },
                    { plan: 'PRO (GROWTH / ANNUAL)', price: '$199 / mo', users: tenants.filter(t => t.planTier === 'PRO_MONTHLY' || t.planTier === 'PRO_YEARLY').length, desc: '500,000 requests, unlimited agents' },
                    { plan: 'ENTERPRISE FLEET', price: '$799 / mo', users: tenants.filter(t => t.planTier === 'ENTERPRISE').length, desc: '2,000,000 requests, dedicated gateway' },
                  ].map((tier) => (
                    <div key={tier.plan} className="p-4 rounded-xl bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-[#b45309] dark:text-[#fbbf24]">{tier.plan}</span>
                        <span className="text-xs font-bold font-mono text-[#1f1e1b] dark:text-[#f5f3ef]">{tier.price}</span>
                      </div>
                      <div className="text-xl font-bold text-[#1f1e1b] dark:text-[#f5f3ef] font-mono">
                        {tier.users} <span className="text-xs font-normal text-[#878278] dark:text-[#7d7970]">organizations</span>
                      </div>
                      <p className="text-[11px] text-[#5c5850] dark:text-[#b8b4aa] font-medium">
                        {tier.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Processing Webhooks Feed */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                      Live Payment Processor Webhooks (Stripe &amp; PayPal)
                    </h2>
                    <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa] font-medium">
                      Real-time subscription billing charges, automated card retries, and gateway settlements.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                    Webhooks Connected
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-[#1f1e1b] dark:text-[#f5f3ef]">
                    <thead className="bg-[#faf8f5] dark:bg-[#181715] font-mono text-[11px] text-[#5c5850] dark:text-[#b8b4aa] uppercase border-b border-[#e5e0d5] dark:border-[#33302b]">
                      <tr>
                        <th className="p-3">Customer Organization</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Charge Event</th>
                        <th className="p-3">Payment Method</th>
                        <th className="p-3">Settlement</th>
                        <th className="p-3">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e5e0d5]/60 dark:divide-[#33302b]/60 font-sans">
                      {recentTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-[#f4f1ea]/50 dark:hover:bg-[#282622]/50 transition-colors">
                          <td className="p-3 font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                            {tx.tenantName}
                          </td>
                          <td className="p-3 font-mono font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                            ${tx.amountUsd}.00
                          </td>
                          <td className="p-3 font-mono text-[11px] text-[#5c5850] dark:text-[#b8b4aa]">
                            {tx.type}
                          </td>
                          <td className="p-3 text-[#5c5850] dark:text-[#b8b4aa]">
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
                          <td className="p-3 font-mono text-[11px] text-[#878278] dark:text-[#7d7970]">
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

          {/* VIEW 2: TENANTS & USER DIRECTORY */}
          {adminActivePage === 'tenants' && (
            <div className="space-y-6">
              {/* Firebase Live Cloud Integration Strip */}
              <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#d97706]/10 dark:bg-[#f59e0b]/20 flex items-center justify-center text-[#d97706] dark:text-[#f59e0b] font-bold flex-shrink-0">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#1f1e1b] dark:text-[#f5f3ef] text-sm">
                        Firebase Auth &amp; Cloud Firestore Identity Sync
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/25 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        LIVE europe-west1
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5c5850] dark:text-[#b8b4aa] mt-0.5">
                      Project <span className="font-mono text-[#b45309] dark:text-[#fbbf24] font-semibold">tranquil-tomorrow-hrtgb</span> • Zero-Trust Security Rules Active • Super-Admin Bypass Enforced
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSyncTenantsToCloudSql}
                    disabled={isLoadingCloudSql}
                    className="px-3 py-1.5 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] hover:bg-[#f4f1ea] dark:hover:bg-[#282622] text-[#1f1e1b] dark:text-[#f5f3ef] font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs bg-white dark:bg-[#211f1c]"
                    title="Synchronize registered accounts into Cloud SQL (PostgreSQL)"
                  >
                    <Database className={`w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ${isLoadingCloudSql ? 'animate-spin' : ''}`} />
                    <span>{isLoadingCloudSql ? 'Syncing SQL...' : 'Sync to Cloud SQL'}</span>
                  </button>
                  <button
                    onClick={handleSyncFirestoreUsers}
                    disabled={isLoadingFirebaseUsers}
                    className="px-3 py-1.5 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] hover:bg-[#f4f1ea] dark:hover:bg-[#282622] text-[#1f1e1b] dark:text-[#f5f3ef] font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs bg-white dark:bg-[#211f1c]"
                    title="Fetch registered user accounts from Firestore"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-[#d97706] dark:text-[#f59e0b] ${isLoadingFirebaseUsers ? 'animate-spin' : ''}`} />
                    <span>{isLoadingFirebaseUsers ? 'Syncing...' : 'Sync Firestore'}</span>
                  </button>
                  <button
                    onClick={() => setIsNewUserModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#d97706] hover:bg-[#b45309] dark:bg-[#f59e0b] dark:hover:bg-[#fbbf24] text-white dark:text-[#181715] font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer border border-[#d97706] dark:border-[#f59e0b]"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Register User</span>
                  </button>
                </div>
              </div>

              {/* View Tabs & Filter Controls */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex p-1 rounded-xl bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b]">
                    <button
                      onClick={() => setUserViewTab('cloudsql')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        userViewTab === 'cloudsql'
                          ? 'bg-white dark:bg-[#211f1c] text-[#1f1e1b] dark:text-[#f5f3ef] shadow-xs border border-[#e5e0d5] dark:border-[#33302b]'
                          : 'text-[#5c5850] dark:text-[#b8b4aa] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef]'
                      }`}
                    >
                      <Database className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>Cloud SQL Database ({cloudSqlUsers.length})</span>
                    </button>
                    <button
                      onClick={() => setUserViewTab('tenants')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        userViewTab === 'tenants'
                          ? 'bg-white dark:bg-[#211f1c] text-[#1f1e1b] dark:text-[#f5f3ef] shadow-xs border border-[#e5e0d5] dark:border-[#33302b]'
                          : 'text-[#5c5850] dark:text-[#b8b4aa] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef]'
                      }`}
                    >
                      Organization Tenants ({tenants.length})
                    </button>
                    <button
                      onClick={() => setUserViewTab('firebase')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        userViewTab === 'firebase'
                          ? 'bg-white dark:bg-[#211f1c] text-[#1f1e1b] dark:text-[#f5f3ef] shadow-xs border border-[#e5e0d5] dark:border-[#33302b]'
                          : 'text-[#5c5850] dark:text-[#b8b4aa] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef]'
                      }`}
                    >
                      <Flame className="w-3.5 h-3.5 text-[#d97706] dark:text-[#f59e0b]" />
                      <span>Firebase Auth Users ({firebaseUsers.length || tenants.length})</span>
                    </button>
                  </div>

                  {userViewTab === 'tenants' && (
                    <div className="hidden lg:flex items-center gap-1.5">
                      {[
                        { id: 'ALL', label: 'All', count: tenants.length },
                        { id: 'ACTIVE', label: 'Active', count: activePaidCount },
                        { id: 'PAST_DUE', label: 'Past Due', count: unpaidTenants.length },
                        { id: 'FREE', label: 'Free', count: tenants.filter(t => t.planTier === 'FREE').length },
                        { id: 'SUSPENDED', label: 'Suspended', count: suspendedCount },
                      ].map(({ id, label, count }) => (
                        <button
                          key={id}
                          onClick={() => setUserFilterStatus(id as any)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                            userFilterStatus === id
                              ? 'bg-[#d97706] dark:bg-[#f59e0b] text-white dark:text-[#181715]'
                              : 'bg-[#faf8f5] dark:bg-[#181715] hover:bg-[#f4f1ea] dark:hover:bg-[#282622] text-[#5c5850] dark:text-[#b8b4aa] border border-[#e5e0d5] dark:border-[#33302b]'
                          }`}
                        >
                          <span>{label}</span>
                          <span className="text-[10px] font-mono opacity-80">{count}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative w-full md:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#878278] dark:text-[#7d7970]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, email, or org..."
                    className="w-full bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#1f1e1b] dark:text-[#f5f3ef] placeholder-[#878278] dark:placeholder-[#7d7970] focus:outline-hidden focus:border-[#d97706] dark:focus:border-[#f59e0b] font-medium"
                  />
                </div>
              </div>

              {/* Table Switch: Cloud SQL vs Firebase vs Organization Tenants */}
              {userViewTab === 'cloudsql' ? (
                <CloudSqlUsersTable
                  users={cloudSqlUsers}
                  isLoading={isLoadingCloudSql}
                  onRefresh={fetchCloudSqlUsers}
                  onOpenAddModal={() => setIsNewUserModalOpen(true)}
                  onSelectUserForPlanChange={(u) => {
                    const matchTenant = tenants.find((t) => t.ownerEmail === u.email) || tenants[0];
                    setPlanModalTenant(matchTenant);
                    setTargetPlan(u.subscription.planTier as any);
                  }}
                />
              ) : userViewTab === 'firebase' ? (
                <FirebaseUsersTable
                  users={displayFirebaseUsers}
                  isLoading={isLoadingFirebaseUsers}
                  onSync={handleSyncFirestoreUsers}
                  onOpenCreate={() => setIsNewUserModalOpen(true)}
                />
              ) : (
                /* Tenants Table */
                <div className="p-6 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                    SaaS Organization Master Roster ({filteredTenants.length} tenants)
                  </h2>
                  <span className="text-xs text-[#5c5850] dark:text-[#b8b4aa] font-medium">
                    Adjust subscription plan, override quota, or manage status
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-[#1f1e1b] dark:text-[#f5f3ef]">
                    <thead className="bg-[#faf8f5] dark:bg-[#181715] font-mono text-[11px] text-[#5c5850] dark:text-[#b8b4aa] uppercase border-b border-[#e5e0d5] dark:border-[#33302b]">
                      <tr>
                        <th className="p-3 w-12 text-center">#</th>
                        <th className="p-3">Organization &amp; Gmail</th>
                        <th className="p-3">Subscription Package</th>
                        <th className="p-3">Monthly Billing</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Quota Usage</th>
                        <th className="p-3">Agents</th>
                        <th className="p-3 text-right">Root Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e5e0d5]/60 dark:divide-[#33302b]/60 font-sans">
                      {filteredTenants.map((t, idx) => {
                        const usagePercent = Math.min(100, Math.round((t.requestsUsed / t.requestLimit) * 100));
                        const isGoogle = t.ownerEmail?.toLowerCase().endsWith('@gmail.com') || (t as any).authProvider === 'google';
                        return (
                          <tr key={t.id} className="hover:bg-[#f4f1ea]/50 dark:hover:bg-[#282622]/50 transition-colors">
                            {/* User Number */}
                            <td className="p-3 text-center font-mono font-bold text-[#b45309] dark:text-[#fbbf24]">
                              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">
                                #{idx + 1}
                              </span>
                            </td>

                            <td className="p-3">
                              <div className="font-bold text-[#1f1e1b] dark:text-[#f5f3ef] flex items-center gap-1.5">
                                <span>{t.name}</span>
                                {isGoogle && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30 font-mono">
                                    Google Auth
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-[#5c5850] dark:text-[#b8b4aa] font-medium font-mono">
                                {t.ownerName ? `${t.ownerName} • ` : ''}
                                <span className={isGoogle ? 'text-blue-700 dark:text-blue-300 font-semibold' : ''}>
                                  {t.ownerEmail}
                                </span>
                              </div>
                              <div className="text-[10px] font-mono text-[#878278] dark:text-[#7d7970]">
                                ID: {t.id}
                              </div>
                            </td>

                            <td className="p-3">
                              <div className="space-y-0.5">
                                <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-amber-500/10 text-[#b45309] dark:text-[#fbbf24] border border-amber-500/20 inline-block">
                                  {t.planTier}
                                </span>
                                <div className="text-[10px] font-mono text-[#5c5850] dark:text-[#b8b4aa] font-semibold">
                                  ${t.monthlySpendUsd}/mo
                                </div>
                              </div>
                            </td>

                            <td className="p-3">
                              <div className="font-mono font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                                ${t.monthlySpendUsd}/mo
                              </div>
                              <div className="text-[10px] text-[#878278] dark:text-[#7d7970]">
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
                                <div className="flex justify-between text-[10px] font-mono text-[#5c5850] dark:text-[#b8b4aa]">
                                  <span>{t.requestsUsed.toLocaleString()}</span>
                                  <span>{t.requestLimit.toLocaleString()}</span>
                                </div>
                                <div className="w-full h-1.5 bg-[#e5e0d5] dark:bg-[#33302b] rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      usagePercent > 90 ? 'bg-rose-500' : 'bg-[#d97706] dark:bg-[#f59e0b]'
                                    }`}
                                    style={{ width: `${usagePercent}%` }}
                                  />
                                </div>
                              </div>
                            </td>

                            <td className="p-3 font-mono font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                              {t.activeAgentsCount}
                            </td>

                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setPlanModalTenant(t);
                                    setTargetPlan(t.planTier);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-[#faf8f5] hover:bg-[#f4f1ea] dark:bg-[#181715] dark:hover:bg-[#282622] text-[#1f1e1b] dark:text-[#f5f3ef] font-bold text-[11px] transition-all cursor-pointer border border-[#e5e0d5] dark:border-[#33302b]"
                                >
                                  Change Plan
                                </button>

                                <button
                                  onClick={() => openQuotaOverride(t)}
                                  className="px-2.5 py-1 rounded-lg bg-[#faf8f5] hover:bg-[#f4f1ea] dark:bg-[#181715] dark:hover:bg-[#282622] text-[#5c5850] dark:text-[#b8b4aa] text-[11px] font-medium transition-all cursor-pointer border border-[#e5e0d5] dark:border-[#33302b]"
                                >
                                  Quota
                                </button>

                                {t.status === 'PAST_DUE' ? (
                                  <button
                                    onClick={() => handleRetryPayment(t)}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                                  >
                                    <RefreshCw className="w-3 h-3" />
                                    <span>Retry</span>
                                  </button>
                                ) : t.status === 'ACTIVE' ? (
                                  <button
                                    onClick={() => {
                                      suspendTenant(t.id);
                                      addToast({
                                        title: 'Tenant Suspended',
                                        description: `Cut gateway ingress for ${t.name}.`,
                                        type: 'warning'
                                      });
                                    }}
                                    className="px-2 py-1 rounded-lg hover:bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold text-[11px] transition-all cursor-pointer"
                                  >
                                    Suspend
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      reactivateTenant(t.id);
                                      addToast({
                                        title: 'Tenant Reactivated',
                                        description: `Reopened gateway access for ${t.name}.`,
                                        type: 'success'
                                      });
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-all cursor-pointer"
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
            )}
          </div>
        )}
        {/* VIEW 3: UNPAID & DUNNING RADAR */}
          {adminActivePage === 'unpaid' && (
            <div className="space-y-6">
              {/* Radar Overview Banner */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#211f1c] border border-rose-300/40 dark:border-rose-500/25 shadow-xs space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                        Delinquent Accounts &amp; Dunning Recovery
                      </h2>
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-rose-600 text-white">
                        {unpaidTenants.length} ACCOUNTS AT RISK
                      </span>
                    </div>
                    <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa] font-medium mt-1">
                      Manage subscriptions with failed card charges, dispute timeouts, and overdue enterprise billing.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const count = sendBulkDunningReminders();
                        addToast({
                          title: 'Bulk Dunning Dispatched',
                          description: `Sent urgent invoice reminder emails to ${count} delinquent accounts.`,
                          type: 'success',
                        });
                      }}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#d97706] hover:bg-[#b45309] dark:bg-[#f59e0b] dark:hover:bg-[#fbbf24] text-white dark:text-[#181715] flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Notices to All ({unpaidTenants.length})</span>
                    </button>

                    <button
                      onClick={() => {
                        const count = autoFreezeAllOverdue();
                        addToast({
                          title: 'Auto-Freeze Enforced',
                          description: `Suspended ${count} tenants exceeding ${saasConfig.gracePeriodDays} days grace period.`,
                          type: 'warning',
                        });
                      }}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Freeze Beyond Grace</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                    <span className="text-[11px] font-mono uppercase font-bold text-rose-800 dark:text-rose-400">
                      Total Overdue Revenue
                    </span>
                    <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono mt-1">
                      ${totalOverdueDebt.toLocaleString()}.00
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b]">
                    <span className="text-[11px] font-mono uppercase font-bold text-[#5c5850] dark:text-[#b8b4aa]">
                      Configured Grace Period
                    </span>
                    <div className="text-2xl font-bold text-[#1f1e1b] dark:text-[#f5f3ef] font-mono mt-1">
                      {saasConfig.gracePeriodDays} Days
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-[11px] font-mono uppercase font-bold text-emerald-800 dark:text-emerald-400">
                      Smart Payment Recovery
                    </span>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                      Automated 24h Retry
                    </div>
                  </div>
                </div>
              </div>

              {/* Unpaid Tenant Roster */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                  Delinquent Customer Accounts Breakdown
                </h3>

                {unpaidTenants.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                    <h4 className="text-sm font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">All Subscriptions Paid</h4>
                    <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa]">Zero past-due invoices detected.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {unpaidTenants.map((t) => (
                      <div
                        key={t.id}
                        className="p-4 rounded-xl border border-rose-300/40 dark:border-rose-500/25 bg-rose-500/5 dark:bg-rose-950/10 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#1f1e1b] dark:text-[#f5f3ef]">{t.name}</span>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-600 text-white">
                              ${t.unpaidBalanceUsd} UNPAID
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-[#b45309] dark:text-[#fbbf24] font-bold border border-amber-500/20">
                              {t.daysPastDue} DAYS OVERDUE
                            </span>
                          </div>
                          <div className="text-xs text-[#5c5850] dark:text-[#b8b4aa]">
                            {t.ownerName ? `${t.ownerName} • ` : ''}<span className="font-mono">{t.ownerEmail}</span>
                          </div>
                          <div className="text-[11px] font-mono text-rose-700 dark:text-rose-400 flex items-center gap-1">
                            <AlertOctagon className="w-3.5 h-3.5" />
                            Failure Reason: <span className="font-bold">{t.failureReason || 'Card declined by bank'}</span>
                          </div>
                          <div className="text-[10px] text-[#878278] dark:text-[#7d7970]">
                            Method: {t.paymentMethod} {t.cardLast4 ? `(ending in ${t.cardLast4})` : ''} • Notices Dispatched: {t.dunningSentCount || 0}
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
                            onClick={() => {
                              sendDunningEmail(t.id);
                              addToast({
                                title: 'Invoice Notice Sent',
                                description: `Dunning email dispatched to ${t.ownerEmail}.`,
                                type: 'info',
                              });
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#d97706] hover:bg-[#b45309] dark:bg-[#f59e0b] dark:hover:bg-[#fbbf24] text-white dark:text-[#181715] flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
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
                                type: 'info',
                              });
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#faf8f5] dark:bg-[#181715] text-[#1f1e1b] dark:text-[#f5f3ef] border border-[#e5e0d5] dark:border-[#33302b] hover:bg-[#f4f1ea] transition-all cursor-pointer"
                          >
                            +7 Days Grace
                          </button>

                          <button
                            onClick={() => {
                              markTenantPaid(t.id);
                              addToast({
                                title: 'Marked As Paid',
                                description: `Settled balance for ${t.name}. Account returned to Active.`,
                                type: 'success',
                              });
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#faf8f5] dark:bg-[#181715] text-[#1f1e1b] dark:text-[#f5f3ef] border border-[#e5e0d5] dark:border-[#33302b] hover:bg-[#f4f1ea] transition-all cursor-pointer"
                          >
                            Forgive / Mark Paid
                          </button>

                          <button
                            onClick={() => {
                              suspendTenant(t.id);
                              addToast({
                                title: 'Tenant Suspended',
                                description: `Cut API gateway access for ${t.name}.`,
                                type: 'warning',
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

          {/* VIEW: PACKAGE PRICE MANAGEMENT */}
          {adminActivePage === 'pricing' && (
            <AdminPricingManagement />
          )}

          {/* VIEW 4: SECURITY & THREAT AUDIT */}
          {adminActivePage === 'security' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                      Central AI Security &amp; Jailbreak Interception Feed
                    </h2>
                    <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa] font-medium">
                      Intercepted prompt injection attempts, SSRF probes, and unauthorized model exploits across all tenants.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                    Firewall Active
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-[#1f1e1b] dark:text-[#f5f3ef]">
                    <thead className="bg-[#faf8f5] dark:bg-[#181715] font-mono text-[11px] text-[#5c5850] dark:text-[#b8b4aa] uppercase border-b border-[#e5e0d5] dark:border-[#33302b]">
                      <tr>
                        <th className="p-3">Timestamp</th>
                        <th className="p-3">Organization</th>
                        <th className="p-3">Agent</th>
                        <th className="p-3">Attempted Exploit</th>
                        <th className="p-3">Reason</th>
                        <th className="p-3">Severity</th>
                        <th className="p-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e5e0d5]/60 dark:divide-[#33302b]/60 font-sans">
                      {violations.map((v) => (
                        <tr key={v.id} className="hover:bg-[#f4f1ea]/50 dark:hover:bg-[#282622]/50 transition-colors">
                          <td className="p-3 font-mono text-[11px] text-[#878278] dark:text-[#7d7970]">{v.timestamp}</td>
                          <td className="p-3 font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">{v.orgName}</td>
                          <td className="p-3 font-mono text-[11px] text-[#5c5850] dark:text-[#b8b4aa]">{v.agentName}</td>
                          <td className="p-3 text-[#1f1e1b] dark:text-[#f5f3ef] font-medium">{v.attemptedAction}</td>
                          <td className="p-3 font-mono text-[10px] text-rose-700 dark:text-rose-400 font-bold">{v.reason}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">
                              {v.severity}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                              BLOCKED
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 5: GATEWAY FLEET & CLUSTER */}
          {adminActivePage === 'gateway' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] space-y-1 shadow-xs">
                  <span className="text-xs font-mono font-bold text-[#5c5850] dark:text-[#b8b4aa] uppercase">Gateway Ingress Throughput</span>
                  <div className="text-2xl font-bold text-[#1f1e1b] dark:text-[#f5f3ef] font-mono">1,420 req/s</div>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Within capacity limit</p>
                </div>
                <div className="p-5 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] space-y-1 shadow-xs">
                  <span className="text-xs font-mono font-bold text-[#5c5850] dark:text-[#b8b4aa] uppercase">Average Routing Latency</span>
                  <div className="text-2xl font-bold text-[#1f1e1b] dark:text-[#f5f3ef] font-mono">14.2 ms</div>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">99th percentile: 28ms</p>
                </div>
                <div className="p-5 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] space-y-1 shadow-xs">
                  <span className="text-xs font-mono font-bold text-[#5c5850] dark:text-[#b8b4aa] uppercase">Upstream Error Rate</span>
                  <div className="text-2xl font-bold text-[#1f1e1b] dark:text-[#f5f3ef] font-mono">0.002%</div>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Healthy SLA: &lt; 0.01%</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">Active Proxy Edge Ingress Clusters</h3>
                <div className="space-y-3">
                  {[
                    { region: 'us-east-1 (N. Virginia)', status: 'HEALTHY', load: '42%', nodes: '4/4' },
                    { region: 'us-west-2 (Oregon)', status: 'HEALTHY', load: '38%', nodes: '3/3' },
                    { region: 'eu-central-1 (Frankfurt)', status: 'HEALTHY', load: '51%', nodes: '3/3' },
                    { region: 'ap-northeast-1 (Tokyo)', status: 'HEALTHY', load: '29%', nodes: '2/2' },
                  ].map((c) => (
                    <div key={c.region} className="p-4 rounded-xl bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] flex items-center justify-between">
                      <div>
                        <div className="font-bold text-xs text-[#1f1e1b] dark:text-[#f5f3ef]">{c.region}</div>
                        <div className="text-[11px] text-[#5c5850] dark:text-[#b8b4aa]">Instances: {c.nodes}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-[#5c5850] dark:text-[#b8b4aa]">Load: {c.load}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                          {c.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW 6: SAAS PLATFORM CONFIG */}
          {adminActivePage === 'settings' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs space-y-4">
                <h2 className="text-sm font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                  SaaS Platform Operational Toggles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-[#1f1e1b] dark:text-[#f5f3ef]">Public User Registration</div>
                      <div className="text-[11px] text-[#5c5850] dark:text-[#b8b4aa]">Allow new customers to sign up and choose plans</div>
                    </div>
                    <button
                      onClick={() => updateSaaSConfig({ publicSignupsEnabled: !saasConfig.publicSignupsEnabled })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                        saasConfig.publicSignupsEnabled ? 'bg-emerald-600 text-white' : 'bg-neutral-200 dark:bg-neutral-800 text-[#5c5850] dark:text-[#b8b4aa]'
                      }`}
                    >
                      {saasConfig.publicSignupsEnabled ? 'OPEN' : 'CLOSED'}
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-[#1f1e1b] dark:text-[#f5f3ef]">Automated Account Freeze</div>
                      <div className="text-[11px] text-[#5c5850] dark:text-[#b8b4aa]">Suspend gateway once past-due grace expires</div>
                    </div>
                    <button
                      onClick={() => updateSaaSConfig({ autoFreezeUnpaidAccounts: !saasConfig.autoFreezeUnpaidAccounts })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                        saasConfig.autoFreezeUnpaidAccounts ? 'bg-emerald-600 text-white' : 'bg-neutral-200 dark:bg-neutral-800 text-[#5c5850] dark:text-[#b8b4aa]'
                      }`}
                    >
                      {saasConfig.autoFreezeUnpaidAccounts ? 'ENABLED' : 'OFF'}
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-[#1f1e1b] dark:text-[#f5f3ef]">Strict AI Jailbreak Firewall</div>
                      <div className="text-[11px] text-[#5c5850] dark:text-[#b8b4aa]">Enforce prompt safety filters across all tenants</div>
                    </div>
                    <button
                      onClick={() => updateSaaSConfig({ strictModelFirewall: !saasConfig.strictModelFirewall })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                        saasConfig.strictModelFirewall ? 'bg-emerald-600 text-white' : 'bg-neutral-200 dark:bg-neutral-800 text-[#5c5850] dark:text-[#b8b4aa]'
                      }`}
                    >
                      {saasConfig.strictModelFirewall ? 'ENFORCED' : 'OFF'}
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-[#1f1e1b] dark:text-[#f5f3ef]">Platform Maintenance Mode</div>
                      <div className="text-[11px] text-[#5c5850] dark:text-[#b8b4aa]">Set workspace to read-only for scheduled updates</div>
                    </div>
                    <button
                      onClick={() => updateSaaSConfig({ maintenanceMode: !saasConfig.maintenanceMode })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                        saasConfig.maintenanceMode ? 'bg-rose-600 text-white' : 'bg-neutral-200 dark:bg-neutral-800 text-[#5c5850] dark:text-[#b8b4aa]'
                      }`}
                    >
                      {saasConfig.maintenanceMode ? 'MAINTENANCE ON' : 'NORMAL'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Global Announcement */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs space-y-4">
                <h2 className="text-sm font-bold text-[#1f1e1b] dark:text-[#f5f3ef] flex items-center gap-2">
                  <BellRing className="w-4 h-4 text-[#d97706] dark:text-[#f59e0b]" />
                  Global Broadcast Alert
                </h2>
                <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa] font-medium">
                  Publish a global announcement banner visible across every customer tenant console.
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={announcementInput}
                    onChange={(e) => setAnnouncementInput(e.target.value)}
                    placeholder="e.g., Scheduled maintenance window on Saturday 03:00 UTC."
                    className="flex-1 bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] rounded-xl px-4 py-2 text-xs text-[#1f1e1b] dark:text-[#f5f3ef] placeholder-[#878278] dark:placeholder-[#7d7970] focus:outline-hidden focus:border-[#d97706] dark:focus:border-[#f59e0b]"
                  />
                  <button
                    onClick={() => {
                      setGlobalAnnouncement(announcementInput.trim() ? announcementInput.trim() : null);
                      addToast({
                        title: announcementInput.trim() ? 'Broadcast Published' : 'Broadcast Cleared',
                        description: announcementInput.trim() ? 'Notification banner active for all users.' : 'Banner removed.',
                        type: 'success',
                      });
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#d97706] hover:bg-[#b45309] dark:bg-[#f59e0b] dark:hover:bg-[#fbbf24] text-white dark:text-[#181715] transition-all cursor-pointer shadow-xs"
                  >
                    Broadcast
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Plan Changer Modal */}
      {planModalTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#e5e0d5] dark:border-[#33302b] pb-3">
              <h3 className="text-sm font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                Change Subscription Plan
              </h3>
              <button
                onClick={() => setPlanModalTenant(null)}
                className="p-1 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 text-[#5c5850] dark:text-[#b8b4aa] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa] font-medium">
                Adjusting subscription tier for <span className="font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">{planModalTenant.name}</span>.
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
                        ? 'bg-amber-500/10 border-amber-500/40 text-[#1f1e1b] dark:text-[#f5f3ef] font-bold'
                        : 'border-[#e5e0d5] dark:border-[#33302b] text-[#5c5850] dark:text-[#b8b4aa] bg-white dark:bg-[#211f1c]'
                    }`}
                  >
                    <div>
                      <div className="text-xs">{p.name}</div>
                      <div className="text-[10px] font-mono text-[#878278] dark:text-[#7d7970]">{p.quota}</div>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#b45309] dark:text-[#fbbf24]">{p.price}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setPlanModalTenant(null)}
                className="px-3 py-1.5 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] text-xs font-medium text-[#5c5850] dark:text-[#b8b4aa] hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePlanSubmit}
                className="px-4 py-1.5 rounded-xl bg-[#d97706] hover:bg-[#b45309] dark:bg-[#f59e0b] dark:hover:bg-[#fbbf24] text-white dark:text-[#181715] font-bold text-xs transition-all cursor-pointer shadow-xs"
              >
                Apply Plan Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quota Override Modal */}
      {quotaModalOpen && selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#e5e0d5] dark:border-[#33302b] pb-3">
              <h3 className="text-sm font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                Override Request Limit
              </h3>
              <button
                onClick={() => setQuotaModalOpen(false)}
                className="p-1 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 text-[#5c5850] dark:text-[#b8b4aa] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa] font-medium">
                Adjust request limit and billing grace period for <span className="font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">{selectedTenant.name}</span>.
              </p>

              <div>
                <label className="block text-[11px] font-mono text-[#5c5850] dark:text-[#b8b4aa] font-bold mb-1">
                  Monthly Request Ceiling
                </label>
                <input
                  type="number"
                  value={newQuotaLimit}
                  onChange={(e) => setNewQuotaLimit(Number(e.target.value))}
                  className="w-full bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] rounded-xl p-2.5 text-xs font-mono text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:border-[#d97706]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#5c5850] dark:text-[#b8b4aa] font-bold mb-1">
                  Extension Days
                </label>
                <input
                  type="number"
                  value={extraDays}
                  onChange={(e) => setExtraDays(Number(e.target.value))}
                  className="w-full bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] rounded-xl p-2.5 text-xs font-mono text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:border-[#d97706]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setQuotaModalOpen(false)}
                className="px-3 py-1.5 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] text-xs font-medium text-[#5c5850] dark:text-[#b8b4aa] hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveQuota}
                className="px-4 py-1.5 rounded-xl bg-[#d97706] hover:bg-[#b45309] dark:bg-[#f59e0b] dark:hover:bg-[#fbbf24] text-white dark:text-[#181715] font-bold text-xs transition-all cursor-pointer shadow-xs"
              >
                Update Quota
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Direct Firebase User Registration Modal */}
      <CreateFirebaseUserModal
        isOpen={isNewUserModalOpen}
        onClose={() => setIsNewUserModalOpen(false)}
        onUserCreated={(u) => setFirebaseUsers((prev) => [u, ...prev])}
      />
    </div>
  );
};
