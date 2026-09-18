import { create } from 'zustand';
import { TenantAdmin, SecurityViolation } from '../types';

export interface SaaSConfig {
  publicSignupsEnabled: boolean;
  autoFreezeUnpaidAccounts: boolean;
  gracePeriodDays: number;
  maintenanceMode: boolean;
  strictModelFirewall: boolean;
  requireCreditCardForTrial: boolean;
}

export type AdminPage = 'dashboard' | 'tenants' | 'unpaid' | 'pricing' | 'security' | 'gateway' | 'settings';

export interface PricingPackage {
  id: string;
  name: string;
  badge: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  requestsQuota: string;
  activeAgents: string;
  features: string[];
  ctaText: string;
  isPopular: boolean;
  isActive: boolean;
  highlightNote?: string;
}

export interface AdminUser {
  name: string;
  email: string;
  role: string;
  clearance: string;
  loginTime: string;
}

export interface BillingTransaction {
  id: string;
  tenantName: string;
  tenantId: string;
  amountUsd: number;
  type: 'SUBSCRIPTION_CHARGE' | 'OVERAGE' | 'REFUND' | 'FAILED_ATTEMPT';
  status: 'SETTLED' | 'PENDING' | 'FAILED';
  paymentMethod: string;
  timestamp: string;
  invoiceUrl?: string;
  errorNote?: string;
}

interface AdminState {
  tenants: TenantAdmin[];
  violations: SecurityViolation[];
  recentTransactions: BillingTransaction[];
  globalKillSwitchActive: boolean;
  searchQuery: string;
  selectedTenant: TenantAdmin | null;
  quotaModalOpen: boolean;
  saasConfig: SaaSConfig;
  globalAnnouncement: string | null;

  // Dedicated Admin System Authentication & Navigation
  adminAuthenticated: boolean;
  adminActivePage: AdminPage;
  adminUser: AdminUser | null;
  setAdminActivePage: (page: AdminPage) => void;
  adminLogin: (email: string, masterKey: string) => boolean;
  adminLogout: () => void;

  setSearchQuery: (query: string) => void;
  setSelectedTenant: (tenant: TenantAdmin | null) => void;
  setQuotaModalOpen: (open: boolean) => void;
  toggleGlobalKillSwitch: () => void;
  updateTenantQuota: (tenantId: string, newLimit: number, extraDays: number) => void;
  
  // SaaS Tenant & Revenue Actions
  changeTenantPlan: (tenantId: string, newPlanTier: TenantAdmin['planTier']) => void;
  markTenantPaid: (tenantId: string) => void;
  retryTenantPayment: (tenantId: string) => { success: boolean; message: string };
  grantGracePeriod: (tenantId: string, days: number) => void;
  suspendTenant: (tenantId: string) => void;
  reactivateTenant: (tenantId: string) => void;
  sendDunningEmail: (tenantId: string) => void;
  sendBulkDunningReminders: () => number;
  autoFreezeAllOverdue: () => number;
  
  // Platform Controls
  updateSaaSConfig: (partial: Partial<SaaSConfig>) => void;
  setGlobalAnnouncement: (announcement: string | null) => void;
  recordNewSubscription: (data: {
    tenantName: string;
    email: string;
    planTier: TenantAdmin['planTier'];
    amountUsd: number;
    paymentMethod: 'MASTERCARD' | 'VISA' | 'PAYPAL';
    cardLast4?: string;
  }) => void;
  recordUserSignInOrSignUp: (data: {
    email: string;
    displayName?: string;
    organizationName?: string;
    planTier?: TenantAdmin['planTier'];
    authProvider?: 'google' | 'email' | 'demo' | 'admin';
    firebaseUid?: string;
  }) => void;

  // Portfolio Package & Price Management
  pricingPackages: PricingPackage[];
  updatePackagePrice: (packageId: string, updates: Partial<PricingPackage>) => void;
  resetPackagesToDefault: () => void;
  addNewPackage: (newPkg: PricingPackage) => void;
  deletePackage: (packageId: string) => void;
  togglePackageActive: (packageId: string) => void;
}

export const DEFAULT_PACKAGES: PricingPackage[] = [
  {
    id: 'FREE',
    name: 'Free Sandbox',
    badge: 'Evaluation',
    description: 'For prototyping autonomous agents with basic zero-trust guardrails.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    requestsQuota: '10,000 requests / mo',
    activeAgents: 'Up to 2 agents',
    features: [
      'Single gateway proxy endpoint',
      'Standard LLM routing',
      'Basic prompt inspection log',
      '7-day trace retention',
      'Community Discord access',
    ],
    ctaText: 'Get Started Free',
    isPopular: false,
    isActive: true,
  },
  {
    id: 'STARTER',
    name: 'Starter Gateway',
    badge: 'Growing Teams',
    description: 'Essential safety guardrails for startups deploying client-facing agents.',
    monthlyPrice: 49,
    yearlyPrice: 39,
    requestsQuota: '50,000 requests / mo',
    activeAgents: 'Up to 5 agents',
    features: [
      'Everything in Free',
      'AST Prompt Injection Defense',
      'Scoped Virtual Keys & Budgets',
      'PII Redaction & Vault Masking',
      '30-day Merkle Audit Trail',
      'Standard Email Support',
    ],
    ctaText: 'Subscribe to Starter',
    isPopular: false,
    isActive: true,
  },
  {
    id: 'PRO_MONTHLY',
    name: 'Pro Fleet',
    badge: 'Recommended',
    description: 'Complete observability, Human-in-the-Loop escrows, and cost arbitrage.',
    monthlyPrice: 199,
    yearlyPrice: 159,
    requestsQuota: '500,000 requests / mo',
    activeAgents: 'Up to 25 agents',
    features: [
      'Everything in Starter',
      'Human-in-the-Loop Escrow Studio',
      'Multi-Model Cost Arbitrage',
      'Hardware Enclave Key Quarantines',
      '90-day Merkle Audit Trail',
      'Priority Slack Channel Support',
    ],
    ctaText: 'Upgrade to Pro Fleet',
    isPopular: true,
    isActive: true,
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise Enclave',
    badge: 'Scale & VPC',
    description: 'Dedicated VPC deployment, custom SLA, and SOC2 / HIPAA compliance.',
    monthlyPrice: 599,
    yearlyPrice: 499,
    requestsQuota: 'Unlimited requests',
    activeAgents: 'Unlimited agents',
    features: [
      'Everything in Pro Fleet',
      'Dedicated AWS / GCP VPC Air-Gapping',
      'Hardware HSM KMS Integration',
      'Custom Fine-Grained Policy Rules',
      '99.99% Guaranteed SLA Uptime',
      'Dedicated Enterprise Solution Architect',
    ],
    ctaText: 'Contact Enterprise',
    isPopular: false,
    isActive: true,
  },
];

const getStoredPackages = (): PricingPackage[] => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('agentlens_pricing_packages');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
  }
  return DEFAULT_PACKAGES;
};

const saveStoredPackages = (packages: PricingPackage[]) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('agentlens_pricing_packages', JSON.stringify(packages));
    } catch {}
  }
};

const INITIAL_TENANTS: TenantAdmin[] = [
  {
    id: 'org_hamudi_01',
    name: 'Hamudi Autonomous AI',
    ownerName: 'Hamudi Jems',
    ownerEmail: 'hamudijems4@gmail.com',
    planTier: 'PRO_MONTHLY',
    status: 'ACTIVE',
    currentPeriodEnd: '2027-09-18',
    requestsUsed: 14200,
    requestLimit: 250000,
    activeAgentsCount: 5,
    virtualKeysCount: 4,
    monthlySpendUsd: 199,
    totalPaidLtvUsd: 199,
    paymentMethod: 'MASTERCARD',
    cardLast4: '8812',
    joinedAt: '2026-09-18',
    lastLoginAt: 'Just now (Google Auth)',
    unpaidBalanceUsd: 0,
    daysPastDue: 0,
    authProvider: 'google',
  },
  {
    id: 'org_enterprise_9981a',
    name: 'Acme Autonomous Labs',
    ownerName: 'Elena Rostova',
    ownerEmail: 'ciso@acmelabs.ai',
    planTier: 'PRO_MONTHLY',
    status: 'ACTIVE',
    currentPeriodEnd: '2026-10-01',
    requestsUsed: 84320,
    requestLimit: 250000,
    activeAgentsCount: 5,
    virtualKeysCount: 5,
    monthlySpendUsd: 199,
    totalPaidLtvUsd: 2388,
    paymentMethod: 'MASTERCARD',
    cardLast4: '4482',
    joinedAt: '2025-08-12',
    lastLoginAt: '12 mins ago',
    unpaidBalanceUsd: 0,
    daysPastDue: 0,
  },
  {
    id: 'org_novafin_7712',
    name: 'Nova Financial Technologies',
    ownerName: 'David Chen',
    ownerEmail: 'devops@novafin.com',
    planTier: 'PRO_YEARLY',
    status: 'ACTIVE',
    currentPeriodEnd: '2027-04-15',
    requestsUsed: 218400,
    requestLimit: 500000,
    activeAgentsCount: 14,
    virtualKeysCount: 18,
    monthlySpendUsd: 179,
    totalPaidLtvUsd: 4296,
    paymentMethod: 'VISA',
    cardLast4: '9901',
    joinedAt: '2025-04-15',
    lastLoginAt: '4 mins ago',
    unpaidBalanceUsd: 0,
    daysPastDue: 0,
  },
  {
    id: 'org_health_4419',
    name: 'OmniHealth AI Systems',
    ownerName: 'Sarah Jenkins',
    ownerEmail: 'compliance@omnihealth.io',
    planTier: 'ENTERPRISE',
    status: 'ACTIVE',
    currentPeriodEnd: '2027-01-01',
    requestsUsed: 894000,
    requestLimit: 2000000,
    activeAgentsCount: 32,
    virtualKeysCount: 45,
    monthlySpendUsd: 799,
    totalPaidLtvUsd: 9588,
    paymentMethod: 'WIRE',
    joinedAt: '2025-01-10',
    lastLoginAt: 'Just now',
    unpaidBalanceUsd: 0,
    daysPastDue: 0,
  },
  {
    id: 'org_devretail_1092',
    name: 'SwiftCart Commerce Labs',
    ownerName: 'Marcus Vance',
    ownerEmail: 'ops@swiftcart.shop',
    planTier: 'PRO_MONTHLY',
    status: 'PAST_DUE',
    currentPeriodEnd: '2026-09-12',
    requestsUsed: 98400,
    requestLimit: 100000,
    activeAgentsCount: 3,
    virtualKeysCount: 4,
    monthlySpendUsd: 199,
    totalPaidLtvUsd: 796,
    paymentMethod: 'MASTERCARD',
    cardLast4: '3819',
    unpaidBalanceUsd: 199,
    daysPastDue: 6,
    failureReason: 'card_declined: insufficient_funds',
    joinedAt: '2026-05-10',
    lastLoginAt: '1 day ago',
    dunningSentCount: 2,
  },
  {
    id: 'org_pulsemedia_5501',
    name: 'PulseMedia AI Studios',
    ownerName: 'Chloe Dupond',
    ownerEmail: 'billing@pulsemedia.agency',
    planTier: 'STARTER',
    status: 'PAST_DUE',
    currentPeriodEnd: '2026-09-08',
    requestsUsed: 46200,
    requestLimit: 50000,
    activeAgentsCount: 2,
    virtualKeysCount: 3,
    monthlySpendUsd: 49,
    totalPaidLtvUsd: 294,
    paymentMethod: 'PAYPAL',
    unpaidBalanceUsd: 49,
    daysPastDue: 10,
    failureReason: 'paypal_preapproved_payment_expired',
    joinedAt: '2026-03-22',
    lastLoginAt: '3 hours ago',
    dunningSentCount: 3,
  },
  {
    id: 'org_hyperlegal_9081',
    name: 'HyperLegal Discovery Corp',
    ownerName: 'Arthur Sterling',
    ownerEmail: 'finance@hyperlegal.law',
    planTier: 'ENTERPRISE',
    status: 'PAST_DUE',
    currentPeriodEnd: '2026-09-02',
    requestsUsed: 612000,
    requestLimit: 1000000,
    activeAgentsCount: 19,
    virtualKeysCount: 22,
    monthlySpendUsd: 799,
    totalPaidLtvUsd: 4794,
    paymentMethod: 'WIRE',
    unpaidBalanceUsd: 1598,
    daysPastDue: 16,
    failureReason: 'invoice_net15_unpaid_disputed_po',
    joinedAt: '2026-01-14',
    lastLoginAt: '2 days ago',
    dunningSentCount: 4,
  },
  {
    id: 'org_suspended_3310',
    name: 'CryptoMatrix Arbitrage Bots',
    ownerName: 'Igor Volkov',
    ownerEmail: 'support@cryptomatrix.io',
    planTier: 'PRO_MONTHLY',
    status: 'SUSPENDED',
    currentPeriodEnd: '2026-08-20',
    requestsUsed: 100000,
    requestLimit: 100000,
    activeAgentsCount: 8,
    virtualKeysCount: 9,
    monthlySpendUsd: 199,
    totalPaidLtvUsd: 597,
    paymentMethod: 'VISA',
    cardLast4: '1102',
    unpaidBalanceUsd: 398,
    daysPastDue: 29,
    failureReason: 'unpaid_balance_grace_expired_gateway_locked',
    joinedAt: '2026-04-01',
    lastLoginAt: '2 weeks ago',
    dunningSentCount: 5,
  },
  {
    id: 'org_sandbox_0018',
    name: 'VectorPulse Robotics',
    ownerName: 'Alex Mercer',
    ownerEmail: 'alex@vectorpulse.dev',
    planTier: 'FREE',
    status: 'ACTIVE',
    currentPeriodEnd: '2026-12-31',
    requestsUsed: 8200,
    requestLimit: 10000,
    activeAgentsCount: 2,
    virtualKeysCount: 2,
    monthlySpendUsd: 0,
    totalPaidLtvUsd: 0,
    paymentMethod: 'UNPAID',
    joinedAt: '2026-08-01',
    lastLoginAt: 'Yesterday',
    unpaidBalanceUsd: 0,
    daysPastDue: 0,
  },
];

const INITIAL_TRANSACTIONS: BillingTransaction[] = [
  {
    id: 'tx_9981_01',
    tenantName: 'OmniHealth AI Systems',
    tenantId: 'org_health_4419',
    amountUsd: 799,
    type: 'SUBSCRIPTION_CHARGE',
    status: 'SETTLED',
    paymentMethod: 'ACH Wire •••• 9102',
    timestamp: 'Today, 09:14 UTC',
    invoiceUrl: '#inv_9981_01'
  },
  {
    id: 'tx_9981_02',
    tenantName: 'Nova Financial Technologies',
    tenantId: 'org_novafin_7712',
    amountUsd: 179,
    type: 'SUBSCRIPTION_CHARGE',
    status: 'SETTLED',
    paymentMethod: 'Visa •••• 9901',
    timestamp: 'Yesterday, 18:30 UTC',
    invoiceUrl: '#inv_9981_02'
  },
  {
    id: 'tx_9981_03',
    tenantName: 'SwiftCart Commerce Labs',
    tenantId: 'org_devretail_1092',
    amountUsd: 199,
    type: 'FAILED_ATTEMPT',
    status: 'FAILED',
    paymentMethod: 'Mastercard •••• 3819',
    timestamp: 'Sep 12, 14:20 UTC',
    errorNote: 'Card declined: Insufficient funds'
  },
  {
    id: 'tx_9981_04',
    tenantName: 'PulseMedia AI Studios',
    tenantId: 'org_pulsemedia_5501',
    amountUsd: 49,
    type: 'FAILED_ATTEMPT',
    status: 'FAILED',
    paymentMethod: 'PayPal preapproved token',
    timestamp: 'Sep 08, 11:05 UTC',
    errorNote: 'PayPal preapproval expired'
  },
  {
    id: 'tx_9981_05',
    tenantName: 'Acme Autonomous Labs',
    tenantId: 'org_enterprise_9981a',
    amountUsd: 199,
    type: 'SUBSCRIPTION_CHARGE',
    status: 'SETTLED',
    paymentMethod: 'Mastercard •••• 4482',
    timestamp: 'Sep 01, 00:00 UTC',
    invoiceUrl: '#inv_9981_05'
  }
];

const INITIAL_VIOLATIONS: SecurityViolation[] = [
  {
    id: 'viol_inj_01',
    timestamp: '11:28:44 UTC',
    orgName: 'SwiftCart Commerce Labs',
    agentName: 'Checkout-Rebate-Bot',
    attemptedAction: 'System Prompt Hijack (DAN jailbreak string)',
    reason: 'PROMPT_INJECTION',
    severity: 'CRITICAL',
    blocked: true,
  },
  {
    id: 'viol_ssrf_02',
    timestamp: '11:24:10 UTC',
    orgName: 'Nova Financial Technologies',
    agentName: 'Crawler-Alpha',
    attemptedAction: 'Socket connect 169.254.169.254:80',
    reason: 'SSRF_ATTEMPT',
    severity: 'CRITICAL',
    blocked: true,
  },
  {
    id: 'viol_pii_03',
    timestamp: '11:15:20 UTC',
    orgName: 'OmniHealth AI Systems',
    agentName: 'Medical-Summary-Bot',
    attemptedAction: 'Unmasked SSN detected in OpenAI payload',
    reason: 'PII_LEAK',
    severity: 'HIGH',
    blocked: true,
  },
];

const getInitialAdminAuth = (): boolean => {
  if (typeof window !== 'undefined') {
    try {
      return sessionStorage.getItem('agentlens_admin_auth') === 'true';
    } catch {}
  }
  return false;
};

export const useAdminStore = create<AdminState>((set, get) => ({
  tenants: INITIAL_TENANTS,
  violations: INITIAL_VIOLATIONS,
  recentTransactions: INITIAL_TRANSACTIONS,
  globalKillSwitchActive: false,
  searchQuery: '',
  selectedTenant: null,
  quotaModalOpen: false,
  globalAnnouncement: null,

  // Dedicated Admin System State
  adminAuthenticated: getInitialAdminAuth(),
  adminActivePage: 'dashboard',
  adminUser: getInitialAdminAuth()
    ? {
        name: 'Root Super-Admin',
        email: 'root@agentlens.internal',
        role: 'SUPER_ADMIN_LEVEL_0',
        clearance: 'INFRA_FINANCE_ROOT',
        loginTime: 'Restored Active Session',
      }
    : null,

  setAdminActivePage: (adminActivePage) => set({ adminActivePage }),

  adminLogin: (email, masterKey) => {
    if (masterKey.trim().length >= 4) {
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('agentlens_admin_auth', 'true');
        } catch {}
      }
      set({
        adminAuthenticated: true,
        adminUser: {
          name: 'Root Super-Admin',
          email: email.trim() || 'root@agentlens.internal',
          role: 'SUPER_ADMIN_LEVEL_0',
          clearance: 'INFRA_FINANCE_ROOT',
          loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' UTC',
        },
      });
      return true;
    }
    return false;
  },

  adminLogout: () => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('agentlens_admin_auth');
      } catch {}
    }
    set({
      adminAuthenticated: false,
      adminUser: null,
      selectedTenant: null,
      quotaModalOpen: false,
    });
  },

  saasConfig: {
    publicSignupsEnabled: true,
    autoFreezeUnpaidAccounts: true,
    gracePeriodDays: 14,
    maintenanceMode: false,
    strictModelFirewall: true,
    requireCreditCardForTrial: false,
  },

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedTenant: (selectedTenant) => set({ selectedTenant }),
  setQuotaModalOpen: (quotaModalOpen) => set({ quotaModalOpen }),

  toggleGlobalKillSwitch: () =>
    set((state) => ({ globalKillSwitchActive: !state.globalKillSwitchActive })),

  updateTenantQuota: (tenantId, newLimit, extraDays) =>
    set((state) => ({
      tenants: state.tenants.map((t) => {
        if (t.id === tenantId) {
          const currentEnd = new Date(t.currentPeriodEnd);
          currentEnd.setDate(currentEnd.getDate() + extraDays);
          return {
            ...t,
            requestLimit: newLimit,
            currentPeriodEnd: currentEnd.toISOString().split('T')[0],
            status: t.status === 'SUSPENDED' ? 'ACTIVE' : t.status,
          };
        }
        return t;
      }),
      quotaModalOpen: false,
      selectedTenant: null,
    })),

  changeTenantPlan: (tenantId, newPlanTier) => {
    const planPrices: Record<string, { price: number; quota: number }> = {
      FREE: { price: 0, quota: 10000 },
      STARTER: { price: 49, quota: 50000 },
      PRO_MONTHLY: { price: 199, quota: 250000 },
      PRO_YEARLY: { price: 179, quota: 500000 },
      ENTERPRISE: { price: 799, quota: 2000000 },
    };

    const target = planPrices[newPlanTier] || { price: 49, quota: 50000 };

    set((state) => ({
      tenants: state.tenants.map((t) =>
        t.id === tenantId
          ? {
              ...t,
              planTier: newPlanTier,
              monthlySpendUsd: target.price,
              requestLimit: target.quota,
              status: 'ACTIVE',
              unpaidBalanceUsd: 0,
              daysPastDue: 0,
            }
          : t
      ),
    }));
  },

  markTenantPaid: (tenantId) => {
    set((state) => ({
      tenants: state.tenants.map((t) => {
        if (t.id === tenantId) {
          const paidAmt = t.unpaidBalanceUsd || t.monthlySpendUsd || 199;
          return {
            ...t,
            status: 'ACTIVE',
            unpaidBalanceUsd: 0,
            daysPastDue: 0,
            failureReason: undefined,
            totalPaidLtvUsd: t.totalPaidLtvUsd + paidAmt,
          };
        }
        return t;
      }),
      recentTransactions: [
        {
          id: `tx_manual_${Date.now()}`,
          tenantName: state.tenants.find((t) => t.id === tenantId)?.name || 'Tenant',
          tenantId,
          amountUsd: state.tenants.find((t) => t.id === tenantId)?.unpaidBalanceUsd || 199,
          type: 'SUBSCRIPTION_CHARGE',
          status: 'SETTLED',
          paymentMethod: 'Manual Admin Settlement / Wire Verified',
          timestamp: 'Just now'
        },
        ...state.recentTransactions
      ]
    }));
  },

  retryTenantPayment: (tenantId) => {
    const tenant = get().tenants.find((t) => t.id === tenantId);
    if (!tenant) return { success: false, message: 'Tenant not found' };

    // Simulate 70% chance payment recovery on retry
    const success = true;
    if (success) {
      get().markTenantPaid(tenantId);
      return { success: true, message: `Successfully charged $${tenant.unpaidBalanceUsd || tenant.monthlySpendUsd} via ${tenant.paymentMethod}!` };
    }
    return { success: false, message: 'Charge declined again by card issuer.' };
  },

  grantGracePeriod: (tenantId, days) => {
    set((state) => ({
      tenants: state.tenants.map((t) => {
        if (t.id === tenantId) {
          const date = new Date();
          date.setDate(date.getDate() + days);
          return {
            ...t,
            currentPeriodEnd: date.toISOString().split('T')[0],
            daysPastDue: Math.max(0, (t.daysPastDue || 0) - days),
            status: 'ACTIVE',
          };
        }
        return t;
      }),
    }));
  },

  suspendTenant: (tenantId) =>
    set((state) => ({
      tenants: state.tenants.map((t) =>
        t.id === tenantId ? { ...t, status: 'SUSPENDED' } : t
      ),
    })),

  reactivateTenant: (tenantId) =>
    set((state) => ({
      tenants: state.tenants.map((t) =>
        t.id === tenantId ? { ...t, status: 'ACTIVE', daysPastDue: 0 } : t
      ),
    })),

  sendDunningEmail: (tenantId) => {
    set((state) => ({
      tenants: state.tenants.map((t) =>
        t.id === tenantId
          ? { ...t, dunningSentCount: (t.dunningSentCount || 0) + 1 }
          : t
      ),
    }));
  },

  sendBulkDunningReminders: () => {
    let count = 0;
    set((state) => ({
      tenants: state.tenants.map((t) => {
        if (t.status === 'PAST_DUE' || (t.unpaidBalanceUsd && t.unpaidBalanceUsd > 0)) {
          count++;
          return { ...t, dunningSentCount: (t.dunningSentCount || 0) + 1 };
        }
        return t;
      }),
    }));
    return count;
  },

  autoFreezeAllOverdue: () => {
    let count = 0;
    const graceDays = get().saasConfig.gracePeriodDays;
    set((state) => ({
      tenants: state.tenants.map((t) => {
        if (t.status === 'PAST_DUE' && (t.daysPastDue || 0) >= graceDays) {
          count++;
          return {
            ...t,
            status: 'SUSPENDED',
            failureReason: `Suspended automatically: ${t.daysPastDue} days overdue (exceeded ${graceDays} day grace period)`
          };
        }
        return t;
      }),
    }));
    return count;
  },

  updateSaaSConfig: (partial) =>
    set((state) => ({
      saasConfig: { ...state.saasConfig, ...partial },
    })),

  setGlobalAnnouncement: (globalAnnouncement) => set({ globalAnnouncement }),

  recordNewSubscription: (data) => {
    const newId = `org_${Math.random().toString(36).substring(2, 9)}`;
    const newTenant: TenantAdmin = {
      id: newId,
      name: data.tenantName,
      ownerName: data.email.split('@')[0].replace(/[._]/g, ' '),
      ownerEmail: data.email,
      planTier: data.planTier,
      status: 'ACTIVE',
      currentPeriodEnd: '2027-09-18',
      requestsUsed: 0,
      requestLimit: data.planTier === 'ENTERPRISE' ? 2000000 : data.planTier === 'PRO_YEARLY' ? 500000 : 250000,
      activeAgentsCount: 2,
      virtualKeysCount: 2,
      monthlySpendUsd: data.amountUsd,
      totalPaidLtvUsd: data.amountUsd,
      paymentMethod: data.paymentMethod,
      cardLast4: data.cardLast4 || (data.paymentMethod === 'PAYPAL' ? undefined : '9921'),
      joinedAt: new Date().toISOString().split('T')[0],
      lastLoginAt: 'Just now',
      unpaidBalanceUsd: 0,
      daysPastDue: 0,
    };

    const newTx: BillingTransaction = {
      id: `tx_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: 'Just now',
      tenantId: newId,
      tenantName: data.tenantName,
      amountUsd: data.amountUsd,
      type: 'SUBSCRIPTION_CHARGE',
      status: 'SETTLED',
      paymentMethod: data.paymentMethod,
      invoiceUrl: `https://billing.agentlens.ai/inv_${Math.random().toString(36).substring(2, 8)}`,
    };

    set((state) => ({
      tenants: [newTenant, ...state.tenants],
      recentTransactions: [newTx, ...state.recentTransactions],
    }));
  },

  recordUserSignInOrSignUp: (data) => {
    set((state) => {
      const emailLower = data.email.toLowerCase().trim();
      const existingIndex = state.tenants.findIndex(
        (t) => t.ownerEmail.toLowerCase().trim() === emailLower
      );
      const plan = data.planTier || 'PRO_MONTHLY';
      const monthlySpend =
        plan === 'ENTERPRISE' ? 599 : plan === 'PRO_YEARLY' ? 179 : plan === 'PRO_MONTHLY' ? 199 : plan === 'STARTER' ? 49 : 0;
      const requestLimit =
        plan === 'ENTERPRISE' ? 2000000 : plan === 'PRO_YEARLY' ? 500000 : plan === 'PRO_MONTHLY' ? 250000 : plan === 'STARTER' ? 50000 : 10000;
      const isGoogle = data.authProvider === 'google' || emailLower.endsWith('@gmail.com');

      if (existingIndex >= 0) {
        const updated = [...state.tenants];
        const existing = updated[existingIndex];
        updated[existingIndex] = {
          ...existing,
          planTier: plan,
          monthlySpendUsd: monthlySpend,
          requestLimit,
          authProvider: data.authProvider || existing.authProvider || (isGoogle ? 'google' : 'email'),
          lastLoginAt: `Just now (${isGoogle ? 'Google Auth' : 'Active'})`,
        };
        // Move to position 0 so the active user is at the very top as #1
        const [target] = updated.splice(existingIndex, 1);
        return { tenants: [target, ...updated] };
      } else {
        const newTenant: TenantAdmin = {
          id: data.firebaseUid ? `fb_${data.firebaseUid.substring(0, 10)}` : `org_${Math.random().toString(36).substring(2, 8)}`,
          name: data.organizationName || `${data.displayName || data.email.split('@')[0]}'s Org`,
          ownerName: data.displayName || data.email.split('@')[0],
          ownerEmail: data.email,
          planTier: plan,
          status: 'ACTIVE',
          currentPeriodEnd: '2027-09-18',
          requestsUsed: 420,
          requestLimit,
          activeAgentsCount: plan === 'ENTERPRISE' ? 10 : plan === 'PRO_MONTHLY' ? 5 : 2,
          virtualKeysCount: plan === 'ENTERPRISE' ? 8 : 3,
          monthlySpendUsd: monthlySpend,
          totalPaidLtvUsd: monthlySpend,
          paymentMethod: 'MASTERCARD',
          cardLast4: '4111',
          joinedAt: new Date().toISOString().split('T')[0],
          lastLoginAt: `Just now (${isGoogle ? 'Google Auth' : 'Active'})`,
          authProvider: isGoogle ? 'google' : 'email',
          unpaidBalanceUsd: 0,
          daysPastDue: 0,
        };
        return { tenants: [newTenant, ...state.tenants] };
      }
    });
  },

  // Portfolio Package & Price Management Implementation
  pricingPackages: getStoredPackages(),

  updatePackagePrice: (packageId, updates) => {
    set((state) => {
      const updated = state.pricingPackages.map((p) =>
        p.id === packageId ? { ...p, ...updates } : p
      );
      saveStoredPackages(updated);
      return { pricingPackages: updated };
    });
  },

  resetPackagesToDefault: () => {
    saveStoredPackages(DEFAULT_PACKAGES);
    set({ pricingPackages: DEFAULT_PACKAGES });
  },

  addNewPackage: (newPkg) => {
    set((state) => {
      const updated = [...state.pricingPackages, newPkg];
      saveStoredPackages(updated);
      return { pricingPackages: updated };
    });
  },

  deletePackage: (packageId) => {
    set((state) => {
      const updated = state.pricingPackages.filter((p) => p.id !== packageId);
      saveStoredPackages(updated);
      return { pricingPackages: updated };
    });
  },

  togglePackageActive: (packageId) => {
    set((state) => {
      const updated = state.pricingPackages.map((p) =>
        p.id === packageId ? { ...p, isActive: !p.isActive } : p
      );
      saveStoredPackages(updated);
      return { pricingPackages: updated };
    });
  },
}));
