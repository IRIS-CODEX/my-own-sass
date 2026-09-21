import React, { useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import {
  X,
  Lock,
  Mail,
  Building2,
  User,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  Flame,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    authModalTab,
    setAuthModalOpen,
    loginWithGoogle,
    loginWithEmailPassword,
    signupWithEmailPassword,
    loginUser,
    signupUser,
    setSubscriptionModalOpen,
    addToast,
  } = useAppStore();

  const [tab, setTab] = useState<'signin' | 'signup'>(authModalTab || 'signin');
  const [showPassword, setShowPassword] = useState(false);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'FREE' | 'STARTER' | 'PRO_MONTHLY' | 'ENTERPRISE'>('PRO_MONTHLY');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Keep tab synced with store prop
  React.useEffect(() => {
    if (authModalTab) setTab(authModalTab);
    setErrorMessage(null);
  }, [authModalTab]);

  if (!authModalOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsGoogleSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await loginWithGoogle();
      if (!res.success) {
        if (res.notRegistered) {
          setErrorMessage(`No active package found for ${res.email}. Please register an account with your selected package.`);
        } else if (res.isPopupBlocked) {
          setErrorMessage('Sign-in popup was blocked by browser or iframe settings. You can use Quick Demo Access below.');
        } else {
          setErrorMessage(res.error || 'Google Sign-in was not completed. You can use email or one-click demo access below.');
        }
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Google authentication error.');
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      addToast({ title: 'Missing credentials', description: 'Please enter your work email and password.', type: 'warning' });
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const success = await loginWithEmailPassword(email, password);
      if (!success) {
        setErrorMessage('Firebase sign-in failed. Please verify your credentials or continue with Google.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Sign in failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name || !orgName || !password) {
      addToast({ title: 'Missing fields', description: 'Please complete all required fields.', type: 'warning' });
      return;
    }
    if (!agreeTerms) {
      addToast({ title: 'Terms acceptance required', description: 'Please accept the Master Service Agreement.', type: 'warning' });
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const success = await signupWithEmailPassword(name, email, password, orgName, selectedPlan);
      if (success) {
        // If user chose a paid plan, launch checkout modal
        if (selectedPlan !== 'FREE') {
          setSubscriptionModalOpen(true, selectedPlan);
        }
      } else {
        setErrorMessage('Could not register account. If email/password is not enabled in Firebase, use Google Sign-in.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-[#faf8f5] dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xl text-[#1f1e1b] dark:text-[#f5f3ef]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-xl text-[#878278] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef] hover:bg-[#ece8df] dark:hover:bg-[#282622] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-amber-600 dark:bg-amber-500 flex items-center justify-center shadow-xs text-white dark:text-[#181715] font-serif font-bold text-lg">
              A
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-xl text-[#1f1e1b] dark:text-[#f5f3ef] tracking-tight">
                  {tab === 'signin' ? 'Sign In to AgentLens' : 'Create Organization Workspace'}
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25">
                  <Flame className="w-3 h-3 text-amber-500" />
                  Firebase Auth
                </span>
              </div>
              <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa]">
                Zero-Trust AI Agent Governance &amp; Observability Gateway
              </p>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex p-1 mb-5 rounded-xl bg-[#ece8df] dark:bg-[#282622] border border-[#e5e0d5] dark:border-[#33302b]">
            <button
              onClick={() => { setTab('signin'); setErrorMessage(null); }}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                tab === 'signin'
                  ? 'bg-white dark:bg-[#211f1c] text-[#1f1e1b] dark:text-[#f5f3ef] shadow-xs font-semibold'
                  : 'text-[#5c5850] dark:text-[#b8b4aa] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef]'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setTab('signup'); setErrorMessage(null); }}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                tab === 'signup'
                  ? 'bg-white dark:bg-[#211f1c] text-[#1f1e1b] dark:text-[#f5f3ef] shadow-xs font-semibold'
                  : 'text-[#5c5850] dark:text-[#b8b4aa] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef]'
              }`}
            >
              Register Organization
            </button>
          </div>

          {/* Primary Firebase Auth: Continue with Google */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleSubmitting || isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#1a1815] hover:bg-[#f4f1ea] dark:hover:bg-[#25221d] text-[#1f1e1b] dark:text-[#f5f3ef] text-xs font-semibold flex items-center justify-center gap-2.5 transition-all shadow-xs cursor-pointer mb-4"
          >
            {isGoogleSubmitting ? (
              <span className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500 animate-spin" />
                Connecting to Google Firebase Auth...
              </span>
            ) : (
              <>
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e5e0d5] dark:border-[#33302b]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-[#faf8f5] dark:bg-[#211f1c] text-[#878278] font-mono text-[10px]">
                OR WORK EMAIL
              </span>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs">
              {errorMessage}
            </div>
          )}

          {/* SIGN IN FORM */}
          {tab === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@organization.ai"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070912] text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      addToast({ title: 'Password Reset', description: 'Reset instructions sent to your email.', type: 'info' });
                    }}
                    className="text-[11px] text-[#d97706] dark:text-[#f59e0b] hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715] text-sm focus:outline-hidden focus:border-[#d97706]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 claude-btn-primary py-2.5 text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Authenticating Session...</span>
                ) : (
                  <>
                    <span>Sign In to Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* SIGN UP FORM */
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Your Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Elena Rostova"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715] text-xs focus:outline-hidden focus:border-[#d97706]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Organization / Company
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="Nova Financial AI"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715] text-xs focus:outline-hidden focus:border-[#d97706]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="elena@novafin.ai"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715] text-xs focus:outline-hidden focus:border-[#d97706]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715] text-xs focus:outline-hidden focus:border-[#d97706]"
                  />
                </div>
              </div>

              {/* Plan Tier Selector */}
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                  Select Fleet Plan Tier
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'FREE', name: 'Sandbox', price: '$0' },
                    { id: 'STARTER', name: 'Starter', price: '$49' },
                    { id: 'PRO_MONTHLY', name: 'Pro', price: '$199' },
                    { id: 'ENTERPRISE', name: 'Enterprise', price: '$599' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPlan(p.id as any)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        selectedPlan === p.id
                          ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold ring-1 ring-amber-500'
                          : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-400'
                      }`}
                    >
                      <div className="text-[11px] font-bold">{p.name}</div>
                      <div className="text-[10px] font-mono opacity-80">{p.price}/mo</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="rounded mt-0.5 text-amber-500 focus:ring-amber-500/40"
                  />
                  <span>
                    I agree to the AgentLens Master Subscription Agreement, Zero-Trust SLA, and Privacy Policy.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 claude-btn-primary text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Registering with Firebase...</span>
                ) : (
                  <>
                    <span>Create Account &amp; Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer Security Note */}
          <div className="mt-5 pt-4 border-t border-[#e5e0d5] dark:border-[#33302b] flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Zero-Trust Enclave</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-400">
              <Flame className="w-3 h-3 text-amber-500" />
              <span>europe-west1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
