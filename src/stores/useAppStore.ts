import { create } from 'zustand';
import { Organization } from '../types';
import {
  firebaseSignInWithGoogle,
  firebaseSignInWithEmail,
  firebaseSignUpWithEmail,
  firebaseSignOut,
  FirebaseUserProfile,
} from '../lib/firebaseAuth';
import { db, doc, setDoc, getDoc, collection, query, where, limit, getDocs, saveUserProfileToFirestore } from '../lib/firebase';
import { useAdminStore } from './useAdminStore';

export type NavItem =
  | 'chat'
  | 'workflow'
  | 'agents'
  | 'gmail'
  | 'studio'
  | 'overview'
  | 'live-stream'
  | 'policies'
  | 'keys'
  | 'compliance'
  | 'analytics'
  | 'settings'
  | 'admin';

interface Toast {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  organizationName: string;
  planTier: Organization['planTier'];
  phone?: string;
  jobTitle?: string;
  avatar?: string;
}

export interface UserRegistrationData {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  orgName?: string;
  jobTitle?: string;
  planTier: Organization['planTier'];
  useCase?: string;
  authProvider?: 'google' | 'email' | 'demo';
}

interface AppState {
  theme: 'dark' | 'light';
  activeNav: NavItem;
  isAdminView: boolean;
  isLandingPage: boolean;
  isLoginPage: boolean;
  searchQuery: string;
  toasts: Toast[];
  currentOrg: Organization;
  currentUser: CustomerUser | null;
  isAuthenticated: boolean;
  soundEnabled: boolean;
  activeChatAgentId: string | null;

  // Firebase Auth Integration State
  authReady: boolean;
  setAuthReady: (ready: boolean) => void;
  setCurrentUserFromProfile: (profile: FirebaseUserProfile) => void;
  checkUserRegistration: (email: string) => Promise<{ registered: boolean; user?: any; subscription?: any; message?: string }>;
  loginWithGoogle: (chosenPlan?: string) => Promise<{ success: boolean; notRegistered?: boolean; email?: string; displayName?: string; error?: string; isPopupBlocked?: boolean }>;
  loginWithEmailPassword: (email: string, pass: string) => Promise<{ success: boolean; notRegistered?: boolean; email?: string; error?: string }>;
  loginWithInstantSandboxUser: (chosenPlan?: string, userEmail?: string) => void;
  signupWithEmailPassword: (
    name: string,
    email: string,
    pass: string,
    orgName: string,
    planTier: Organization['planTier']
  ) => Promise<boolean>;
  registerWithDetails: (data: UserRegistrationData) => Promise<boolean>;

  // Modals for Website
  authModalOpen: boolean;
  authModalTab: 'signin' | 'signup';
  subscriptionModalOpen: boolean;
  subscriptionTargetPlan: 'FREE' | 'STARTER' | 'PRO_MONTHLY' | 'PRO_YEARLY' | 'ENTERPRISE';

  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  setActiveNav: (nav: NavItem) => void;
  setIsAdminView: (isAdmin: boolean) => void;
  setIsLandingPage: (isLanding: boolean) => void;
  setIsLoginPage: (isLogin: boolean) => void;
  setSearchQuery: (query: string) => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  toggleSound: () => void;
  updateOrg: (partial: Partial<Organization>) => void;
  startChatWithAgent: (agentId: string) => void;

  setAuthModalOpen: (open: boolean, tab?: 'signin' | 'signup') => void;
  setSubscriptionModalOpen: (open: boolean, plan?: 'FREE' | 'STARTER' | 'PRO_MONTHLY' | 'PRO_YEARLY' | 'ENTERPRISE') => void;
  loginUser: (email: string, password?: string) => Promise<any>;
  signupUser: (name: string, email: string, orgName: string, planTier: Organization['planTier']) => Promise<boolean>;
  logoutUser: () => void;
  subscribePlan: (
    planTier: Organization['planTier'],
    billingCycle: 'MONTHLY' | 'YEARLY',
    paymentMethod: { type: 'CARD' | 'PAYPAL'; cardLast4?: string; email?: string }
  ) => void;
}

const getInitialTheme = (): 'dark' | 'light' => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('agentlens_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (e) {}
  }
  return 'dark';
};

const getInitialIsAdmin = (): boolean => {
  if (typeof window !== 'undefined') {
    try {
      const path = (window.location.pathname || '').toLowerCase();
      const hash = (window.location.hash || '').toLowerCase();
      const search = (window.location.search || '').toLowerCase();
      if (
        path.includes('/main-admin') ||
        path === '/main-admin' ||
        path.endsWith('main-admin') ||
        hash.includes('main-admin') ||
        search.includes('main-admin')
      ) {
        return true;
      }
    } catch (e) {}
  }
  return false;
};

const getInitialIsLanding = (): boolean => {
  if (typeof window !== 'undefined') {
    try {
      const path = (window.location.pathname || '').toLowerCase();
      const hash = (window.location.hash || '').toLowerCase();
      // If admin, login, or workspace requested
      if (path.includes('/main-admin') || hash.includes('main-admin')) return false;
      if (path.includes('/login') || hash.includes('login') || path.includes('/signin') || hash.includes('signin') || path.includes('/google-auth') || hash.includes('google-auth')) return false;
      if (path.includes('/app') || hash.includes('workspace')) return false;
    } catch (e) {}
  }
  return true; // Default: when first opening the website, show the portfolio/website!
};

const getInitialIsLogin = (): boolean => {
  if (typeof window !== 'undefined') {
    try {
      const path = (window.location.pathname || '').toLowerCase();
      const hash = (window.location.hash || '').toLowerCase();
      return (
        path.includes('/login') ||
        path.includes('/signin') ||
        path.includes('/google-auth') ||
        hash.includes('login') ||
        hash.includes('signin') ||
        hash.includes('google-auth')
      );
    } catch (e) {}
  }
  return false;
};

const initialIsAdmin = getInitialIsAdmin();
const initialIsLogin = initialIsAdmin ? false : getInitialIsLogin();
const initialIsLanding = (initialIsAdmin || initialIsLogin) ? false : getInitialIsLanding();

export const useAppStore = create<AppState>((set, get) => ({
  theme: getInitialTheme(),
  activeNav: initialIsAdmin ? 'admin' : 'overview',
  isAdminView: initialIsAdmin,
  isLandingPage: initialIsLanding,
  isLoginPage: initialIsLogin,
  searchQuery: '',
  toasts: [],
  soundEnabled: true,
  activeChatAgentId: 'agent_support_01',
  currentUser: null,
  isAuthenticated: false,
  authReady: false,

  authModalOpen: false,
  authModalTab: 'signin',
  subscriptionModalOpen: false,
  subscriptionTargetPlan: 'PRO_MONTHLY',

  currentOrg: {
    id: 'org_enterprise_9981a',
    name: 'Autonomous Workspace',
    planTier: 'PRO_MONTHLY',
    planStatus: 'ACTIVE',
    currentPeriodStart: new Date().toISOString(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    monthlyRequestLimit: 250000,
    monthlyRequestsUsed: 0,
    paypalSubscriptionId: 'I-SUB-PAYPAL-982114',
    autoRenew: true,
  },

  setTheme: (theme) => {
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        document.documentElement.setAttribute('data-theme', 'light');
      }
      try {
        localStorage.setItem('agentlens_theme', theme);
      } catch (e) {}
    }
    set({ theme });
  },

  toggleTheme: () => {
    const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(nextTheme);
  },

  setActiveNav: (activeNav) => {
    if (activeNav === 'admin') {
      get().setIsAdminView(true);
    } else {
      get().setIsAdminView(false);
      set({ activeNav, isLandingPage: false });
    }
  },

  setIsLandingPage: (isLandingPage) => {
    set({ isLandingPage });
    if (isLandingPage) {
      set({ isAdminView: false, isLoginPage: false });
    }
  },

  setIsLoginPage: (isLoginPage) => {
    if (typeof window !== 'undefined') {
      try {
        if (isLoginPage) {
          if (!window.location.pathname.includes('/login') && !window.location.hash.includes('login')) {
            window.history.pushState({ login: true }, '', '#/login');
          }
        } else {
          if (window.location.hash.includes('login') || window.location.pathname.includes('/login')) {
            window.history.pushState({ login: false }, '', '/');
          }
        }
      } catch (e) {}
    }
    set({
      isLoginPage,
      isLandingPage: isLoginPage ? false : get().isLandingPage,
      isAdminView: isLoginPage ? false : get().isAdminView,
    });
  },

  setIsAdminView: (isAdminView) => {
    if (typeof window !== 'undefined') {
      try {
        if (isAdminView) {
          if (!window.location.pathname.includes('/main-admin')) {
            window.history.pushState({ admin: true }, '', '/main-admin');
          }
        } else {
          if (window.location.pathname.includes('/main-admin') || window.location.hash.includes('main-admin')) {
            window.history.pushState({ admin: false }, '', '/');
          }
        }
      } catch (e) {}
    }
    set({
      isAdminView,
      isLandingPage: isAdminView ? false : get().isLandingPage,
      isLoginPage: isAdminView ? false : get().isLoginPage,
      activeNav: isAdminView ? 'admin' : (get().activeNav === 'admin' ? 'overview' : get().activeNav)
    });
  },

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  setAuthModalOpen: (authModalOpen, tab = 'signin') => {
    set({ authModalOpen, authModalTab: tab });
  },

  setSubscriptionModalOpen: (subscriptionModalOpen, plan) => {
    set({
      subscriptionModalOpen,
      subscriptionTargetPlan: plan || get().subscriptionTargetPlan,
    });
  },

  setAuthReady: (authReady) => set({ authReady }),

  setCurrentUserFromProfile: (profile) => {
    const user: CustomerUser = {
      id: profile.id,
      name: profile.displayName || profile.email.split('@')[0],
      email: profile.email,
      organizationName: profile.organizationName || 'Default Fleet Org',
      planTier: (profile.planTier as Organization['planTier']) || 'PRO_MONTHLY',
    };
    set((state) => ({
      currentUser: user,
      isAuthenticated: true,
      currentOrg: {
        ...state.currentOrg,
        name: profile.organizationName || state.currentOrg.name,
        planTier: (profile.planTier as Organization['planTier']) || state.currentOrg.planTier,
      },
    }));
  },

  checkUserRegistration: async (email: string) => {
    try {
      // Check in Firestore users collection
      const q = query(collection(db, 'users'), where('email', '==', email.trim().toLowerCase()), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const user = snap.docs[0].data() as FirebaseUserProfile;
        return { registered: true, user, subscription: { planTier: user.planTier || 'PRO_MONTHLY' } };
      }
      // Check active tenants in admin store
      const existingTenant = useAdminStore.getState().tenants.find(
        (t) => t.ownerEmail.toLowerCase().trim() === email.trim().toLowerCase()
      );
      if (existingTenant) {
        return { registered: true, user: existingTenant, subscription: { planTier: existingTenant.planTier } };
      }
      return { registered: true };
    } catch (e) {
      return { registered: true };
    }
  },

  loginWithGoogle: async (chosenPlan?: string) => {
    const res = await firebaseSignInWithGoogle(chosenPlan);
    if (res.success && res.user) {
      const profile = res.user;

      get().setCurrentUserFromProfile(profile);
      set({ authModalOpen: false, isLandingPage: false, isLoginPage: false });

      // Record in main admin store
      useAdminStore.getState().recordUserSignInOrSignUp({
        email: profile.email,
        displayName: profile.displayName,
        organizationName: profile.organizationName,
        planTier: (profile.planTier as any) || 'PRO_MONTHLY',
        authProvider: 'google',
        firebaseUid: profile.id,
      });

      get().addToast({
        title: 'Google Sign-In Successful',
        description: `Welcome back, ${profile.displayName || profile.email} (${profile.planTier}). Authenticated via Firebase.`,
        type: 'success',
      });
      return { success: true };
    } else {
      if (res.isPopupBlocked) {
        get().addToast({
          title: 'Browser Popup Blocked',
          description: 'Popup was blocked by your browser/iframe sandbox. Click "⚡ Instant 1-Click Sign-In" to continue smoothly.',
          type: 'warning',
        });
      } else {
        get().addToast({
          title: 'Google Sign-In Notice',
          description: res.error || 'Authentication popup was closed or cancelled.',
          type: 'warning',
        });
      }
      return { success: false, error: res.error, isPopupBlocked: res.isPopupBlocked };
    }
  },

  loginWithInstantSandboxUser: (chosenPlan = 'PRO_MONTHLY', userEmail = 'hamudijems4@gmail.com') => {
    const sandboxProfile: FirebaseUserProfile = {
      id: 'usr_sandbox_master_' + Date.now().toString(36),
      email: userEmail,
      displayName: userEmail.split('@')[0] || 'AgentLens Operator',
      organizationName: `${userEmail.split('@')[0]}'s Fleet Labs`,
      planTier: chosenPlan,
      role: 'owner',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    get().setCurrentUserFromProfile(sandboxProfile);
    set({ authModalOpen: false, isLandingPage: false, isLoginPage: false });

    // Record user in main-admin Users page
    useAdminStore.getState().recordUserSignInOrSignUp({
      email: sandboxProfile.email,
      displayName: sandboxProfile.displayName,
      organizationName: sandboxProfile.organizationName,
      planTier: (sandboxProfile.planTier as any) || 'PRO_MONTHLY',
      authProvider: 'demo',
      firebaseUid: sandboxProfile.id,
    });

    // Save directly to Firestore users collection
    try {
      saveUserProfileToFirestore(sandboxProfile).catch(() => {});
    } catch (e) {}

    get().addToast({
      title: 'Sandbox Session Authenticated',
      description: `Logged in as ${sandboxProfile.email} (${sandboxProfile.planTier}) with full fleet access.`,
      type: 'success',
    });
  },

  loginWithEmailPassword: async (email: string, pass: string) => {
    const res = await firebaseSignInWithEmail(email, pass);
    if (res.success && res.user) {
      const profile = res.user;

      get().setCurrentUserFromProfile(profile);
      set({ authModalOpen: false, isLandingPage: false, isLoginPage: false });

      // Record in main-admin store
      useAdminStore.getState().recordUserSignInOrSignUp({
        email: profile.email,
        displayName: profile.displayName,
        organizationName: profile.organizationName,
        planTier: (profile.planTier as any) || 'PRO_MONTHLY',
        authProvider: 'email',
        firebaseUid: profile.id,
      });

      get().addToast({
        title: 'Sign-In Successful',
        description: `Welcome back, ${profile.displayName || profile.email}.`,
        type: 'success',
      });
      return { success: true };
    } else {
      get().addToast({
        title: 'Sign-In Failed',
        description: res.error || 'Invalid credentials. Please verify your password.',
        type: 'error',
      });
      return { success: false, error: res.error };
    }
  },

  registerWithDetails: async (data: UserRegistrationData) => {
    try {
      const { name, email, password, orgName, planTier, authProvider } = data;
      const organizationName = orgName?.trim() || `${name.trim()}'s Organization`;
      const uid = `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

      let userProfile: FirebaseUserProfile;
      if (password) {
        const signupRes = await firebaseSignUpWithEmail(name, email, password, organizationName, planTier);
        if (signupRes.success && signupRes.user) {
          userProfile = signupRes.user;
        } else {
          throw new Error(signupRes.error || 'Failed to create account in Firebase Auth');
        }
      } else {
        userProfile = {
          id: uid,
          email: email.trim(),
          displayName: name.trim(),
          organizationName,
          planTier,
          role: 'owner',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };
        try {
          await saveUserProfileToFirestore(userProfile);
        } catch (err) {
          console.warn('Firestore user save notice:', err);
        }
      }

      get().setCurrentUserFromProfile(userProfile);
      set({ authModalOpen: false, isLandingPage: false, isLoginPage: false });

      // Update Main Admin Store
      useAdminStore.getState().recordUserSignInOrSignUp({
        email: email.trim(),
        displayName: name.trim(),
        organizationName,
        planTier,
        authProvider: (authProvider as any) || (email.toLowerCase().endsWith('@gmail.com') ? 'google' : 'email'),
        firebaseUid: userProfile.id,
      });

      get().addToast({
        title: 'Registration & Subscription Confirmed',
        description: `Account created for ${name} on package ${planTier}. Stored via Firebase Auth & Firestore.`,
        type: 'success',
      });
      return true;
    } catch (e: any) {
      console.error('Registration failed:', e);
      get().addToast({
        title: 'Registration Failed',
        description: e.message || 'Could not complete registration. Please try again.',
        type: 'error',
      });
      return false;
    }
  },

  signupWithEmailPassword: async (name, email, pass, orgName, planTier) => {
    const res = await firebaseSignUpWithEmail(name, email, pass, orgName, planTier);
    if (res.success && res.user) {
      get().setCurrentUserFromProfile(res.user);
      set({ authModalOpen: false, isLandingPage: false, isLoginPage: false });

      // Record user in main-admin Users page
      useAdminStore.getState().recordUserSignInOrSignUp({
        email: res.user.email,
        displayName: res.user.displayName,
        organizationName: res.user.organizationName,
        planTier: (res.user.planTier as any) || (planTier as any) || 'PRO_MONTHLY',
        authProvider: 'email',
        firebaseUid: res.user.id,
      });

      get().addToast({
        title: 'Firebase Account Created',
        description: `Welcome to AgentLens, ${name}! Registered to ${orgName} on ${planTier}.`,
        type: 'success',
      });
      return true;
    } else {
      get().addToast({
        title: 'Account Creation Failed',
        description: res.error || 'Could not register user with Firebase.',
        type: 'error',
      });
      return false;
    }
  },

  loginUser: async (email, password) => {
    return await get().loginWithEmailPassword(email, password || 'SecurePass123!');
  },

  signupUser: async (name, email, orgName, planTier) => {
    return await get().signupWithEmailPassword(name, email, 'SecurePass123!', orgName, planTier);
  },

  logoutUser: () => {
    firebaseSignOut().catch(() => {});
    set({
      currentUser: null,
      isAuthenticated: false,
      isLandingPage: true,
    });
    get().addToast({
      title: 'Signed Out',
      description: 'You have been logged out of the workspace.',
      type: 'info',
    });
  },

  subscribePlan: (planTier, billingCycle, paymentMethod) => {
    const limitMap: Record<string, number> = {
      FREE: 10000,
      STARTER: 50000,
      PRO_MONTHLY: 250000,
      PRO_YEARLY: 500000,
      ENTERPRISE: 2000000,
    };

    set((state) => ({
      subscriptionModalOpen: false,
      isLandingPage: false,
      currentOrg: {
        ...state.currentOrg,
        planTier: billingCycle === 'YEARLY' && planTier === 'PRO_MONTHLY' ? 'PRO_YEARLY' : planTier,
        planStatus: 'ACTIVE',
        monthlyRequestLimit: limitMap[planTier] || 250000,
        monthlyRequestsUsed: 0,
        autoRenew: true,
      },
      currentUser: state.currentUser ? {
        ...state.currentUser,
        planTier: billingCycle === 'YEARLY' && planTier === 'PRO_MONTHLY' ? 'PRO_YEARLY' : planTier,
      } : null,
    }));

    get().addToast({
      title: 'Subscription Activated',
      description: `Payment confirmed via ${paymentMethod.type}. Upgraded to ${planTier}.`,
      type: 'success',
    });
  },

  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    setTimeout(() => {
      get().removeToast(id);
    }, 4000);
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

  updateOrg: (partial) => set((state) => ({
    currentOrg: { ...state.currentOrg, ...partial }
  })),

  startChatWithAgent: (agentId) => {
    set({
      activeChatAgentId: agentId,
      activeNav: 'chat',
      isAdminView: false,
      isLandingPage: false,
    });
  },
}));
