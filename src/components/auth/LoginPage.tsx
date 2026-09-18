import React, { useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { useAdminStore } from '../../stores/useAdminStore';
import {
  ShieldCheck,
  Flame,
  ArrowRight,
  Mail,
  Lock,
  User,
  Building2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Crown,
  Sparkles,
  ArrowLeft,
  Server,
  Zap,
} from 'lucide-react';

export const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24">
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
);

const ClaudeStarburst = ({ className = "w-6 h-6 text-[#c15f3c]" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <line x1="12" y1="2" x2="12" y2="6.5" />
    <line x1="12" y1="17.5" x2="12" y2="22" />
    <line x1="2" y1="12" x2="6.5" y2="12" />
    <line x1="17.5" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="4.93" x2="8.1" y2="8.1" />
    <line x1="15.9" y1="15.9" x2="19.07" y2="19.07" />
    <line x1="4.93" y1="19.07" x2="8.1" y2="15.9" />
    <line x1="15.9" y1="8.1" x2="19.07" y2="4.93" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </svg>
);

export const LoginPage: React.FC = () => {
  const {
    loginWithGoogle,
    loginWithEmailPassword,
    signupWithEmailPassword,
    setIsLandingPage,
    setIsLoginPage,
    setIsAdminView,
    addToast,
  } = useAppStore();

  const [activeAuthTab, setActiveAuthTab] = useState<'google' | 'email'>('google');
  const [selectedPlan, setSelectedPlan] = useState<'FREE' | 'STARTER' | 'PRO_MONTHLY' | 'ENTERPRISE'>('PRO_MONTHLY');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [orgName, setOrgName] = useState('');

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);
    try {
      const ok = await loginWithGoogle(selectedPlan);
      if (!ok) {
        setErrorMessage('Google Authentication was cancelled or could not complete.');
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Google Auth encountered an error.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isSigningUp) {
      if (!name.trim() || !email.trim() || !password) {
        setErrorMessage('Please fill in all registration fields.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters.');
        return;
      }
      setIsEmailLoading(true);
      try {
        const ok = await signupWithEmailPassword(
          name.trim(),
          email.trim(),
          password,
          orgName.trim() || `${name.trim()}'s Labs`,
          selectedPlan
        );
        if (!ok) {
          setErrorMessage('Could not complete registration. Check credentials or use Google Auth.');
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Registration failed.');
      } finally {
        setIsEmailLoading(false);
      }
    } else {
      if (!email.trim() || !password) {
        setErrorMessage('Please provide your work email and password.');
        return;
      }
      setIsEmailLoading(true);
      try {
        const ok = await loginWithEmailPassword(email.trim(), password);
        if (!ok) {
          setErrorMessage('Invalid credentials. Check email and password or use Google Auth.');
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Sign in failed.');
      } finally {
        setIsEmailLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#141413] text-[#f5f3ef] font-sans flex flex-col justify-between selection:bg-[#c15f3c] selection:text-white">
      {/* Top Navigation Bar */}
      <header className="w-full border-b border-[#282723] bg-[#141413]/90 backdrop-blur-md px-4 sm:px-8 py-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setIsLoginPage(false);
              setIsLandingPage(true);
            }}
            className="flex items-center gap-2 text-xs font-mono text-[#9c9689] hover:text-[#f5f3ef] transition-colors cursor-pointer mr-2 px-2.5 py-1 rounded-lg border border-[#2e2d27] hover:border-[#424039]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>

          <div
            onClick={() => {
              setIsLoginPage(false);
              setIsLandingPage(true);
            }}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <ClaudeStarburst className="w-6 h-6 text-[#c15f3c]" />
            <span className="font-serif text-xl font-normal tracking-tight text-[#f5f3ef]">
              Agent Lens
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-mono text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Firebase Auth: europe-west1</span>
          </div>

          <button
            onClick={() => {
              setIsLoginPage(false);
              setIsAdminView(true);
            }}
            className="px-3 py-1.5 rounded-lg border border-amber-500/30 hover:border-amber-500/60 text-amber-300 font-mono flex items-center gap-1.5 transition-all cursor-pointer bg-amber-500/10"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>Main-Admin Portal</span>
          </button>
        </div>
      </header>

      {/* Main Center Stage */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 my-auto relative overflow-hidden">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(193,95,60,0.12),transparent_70%)] pointer-events-none" />

        <div className="w-full max-w-xl z-10 space-y-6">
          {/* Headline & Subtitle */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#24231f] border border-[#33312b] text-[#b8b4aa] text-xs font-mono mb-1">
              <GoogleIcon className="w-3.5 h-3.5" />
              <span>Google Cloud Identity &amp; Firebase Auth</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif text-[#f5f3ef] tracking-tight">
              Sign In to Agent Lens
            </h1>
            <p className="text-sm text-[#9c9689] max-w-md mx-auto">
              Authenticate your identity using Google OAuth or work credentials. Choose your package tier below.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block">Authentication Notice</span>
                <p className="opacity-90">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Main Card */}
          <div className="rounded-2xl border border-[#2f2e29] bg-[#1a1917] p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Step 1: Package Selection (Which tier the user wants) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[#b8b4aa] uppercase tracking-wider text-[11px]">
                  Step 1: Choose Subscription Package
                </span>
                <span className="text-[11px] text-[#c15f3c] font-medium">
                  {selectedPlan === 'PRO_MONTHLY' ? 'Most Popular' : selectedPlan === 'ENTERPRISE' ? 'Custom SLA' : 'Instant Setup'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'FREE', name: 'Free', price: '$0', quota: '10k req' },
                  { id: 'STARTER', name: 'Starter', price: '$49', quota: '50k req' },
                  { id: 'PRO_MONTHLY', name: 'Pro Fleet', price: '$199', quota: '250k req' },
                  { id: 'ENTERPRISE', name: 'Enterprise', price: '$599', quota: 'Unlimited' },
                ].map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlan(plan.id as any)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedPlan === plan.id
                        ? 'border-[#c15f3c] bg-[#c15f3c]/15 text-[#f5f3ef] shadow-xs'
                        : 'border-[#33312b] bg-[#151413] hover:border-[#48453e] text-[#9c9689]'
                    }`}
                  >
                    <div className="font-semibold text-xs text-[#f5f3ef]">{plan.name}</div>
                    <div className="font-mono text-[11px] font-bold text-[#c15f3c] mt-0.5">{plan.price}/mo</div>
                    <div className="text-[10px] text-[#736e65] mt-0.5 font-mono">{plan.quota}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Auth Method Tabs */}
            <div className="flex p-1 rounded-xl bg-[#141413] border border-[#2f2e29]">
              <button
                type="button"
                onClick={() => setActiveAuthTab('google')}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeAuthTab === 'google'
                    ? 'bg-white text-[#141413] shadow-sm'
                    : 'text-[#9c9689] hover:text-[#f5f3ef]'
                }`}
              >
                <GoogleIcon className="w-4 h-4" />
                <span>Google Auth</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveAuthTab('email')}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeAuthTab === 'email'
                    ? 'bg-white text-[#141413] shadow-sm'
                    : 'text-[#9c9689] hover:text-[#f5f3ef]'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Work Email</span>
              </button>
            </div>

            {/* TAB 1: GOOGLE AUTH */}
            {activeAuthTab === 'google' && (
              <div className="space-y-4 text-center py-2 animate-in fade-in duration-200">
                <div className="p-4 rounded-xl bg-[#141413] border border-[#2f2e29] text-left space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-[#b8b4aa]">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Single Sign-On (SSO) with your Google Workspace or Gmail</span>
                  </div>
                  <p className="text-xs text-[#736e65]">
                    Clicking below launches the official Google Firebase Auth popup. Upon authorization, your account is immediately provisioned and listed in the database with your chosen <span className="font-mono text-[#c15f3c]">{selectedPlan}</span> tier.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={isGoogleLoading}
                  className="w-full py-3.5 px-5 rounded-xl bg-white hover:bg-[#f3eee5] text-[#141413] text-sm font-semibold transition-all flex items-center justify-center gap-3 cursor-pointer shadow-md active:scale-[0.99] disabled:opacity-50"
                >
                  <GoogleIcon className="w-5 h-5" />
                  <span>
                    {isGoogleLoading ? 'Connecting to Google Firebase Auth...' : 'Continue with Google Account'}
                  </span>
                </button>

                <p className="text-[11px] text-[#736e65]">
                  Secure popup via <span className="font-mono text-[#9c9689]">accounts.google.com</span>. No password stored.
                </p>
              </div>
            )}

            {/* TAB 2: EMAIL / PASSWORD */}
            {activeAuthTab === 'email' && (
              <form onSubmit={handleEmailAuth} className="space-y-3 pt-1 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-1 border-b border-[#2d2c27]">
                  <span className="text-xs text-[#b8b4aa] font-medium">
                    {isSigningUp ? 'Create New Organization Account' : 'Sign in with Work Email'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsSigningUp(!isSigningUp)}
                    className="text-[11px] text-[#c15f3c] hover:underline cursor-pointer"
                  >
                    {isSigningUp ? 'Already registered? Sign In' : 'Need an account? Sign Up'}
                  </button>
                </div>

                {isSigningUp && (
                  <>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-[#736e65] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full Name (e.g. Elena Rostova)"
                        className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#33312b] bg-[#141413] text-xs text-[#f5f3ef] placeholder-[#736e65] focus:outline-hidden focus:border-[#c15f3c]"
                      />
                    </div>

                    <div className="relative">
                      <Building2 className="w-3.5 h-3.5 text-[#736e65] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        placeholder="Organization Name (e.g. Acme Autonomous Labs)"
                        className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#33312b] bg-[#141413] text-xs text-[#f5f3ef] placeholder-[#736e65] focus:outline-hidden focus:border-[#c15f3c]"
                      />
                    </div>
                  </>
                )}

                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-[#736e65] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Work Email (e.g. name@organization.ai)"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#33312b] bg-[#141413] text-xs text-[#f5f3ef] placeholder-[#736e65] focus:outline-hidden focus:border-[#c15f3c]"
                  />
                </div>

                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-[#736e65] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password (min 6 characters)"
                    className="w-full pl-9 pr-9 py-2.5 rounded-lg border border-[#33312b] bg-[#141413] text-xs text-[#f5f3ef] placeholder-[#736e65] focus:outline-hidden focus:border-[#c15f3c]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#736e65] hover:text-[#b8b4aa] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isEmailLoading}
                  className="w-full py-3 rounded-lg bg-white hover:bg-[#f3eee5] text-[#141413] text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  <span>{isEmailLoading ? 'Verifying with Firebase...' : isSigningUp ? 'Create Account & Start' : 'Sign in to Console'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}

            {/* Cloud Metadata & Status Footer */}
            <div className="pt-4 border-t border-[#2d2c27] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#736e65] gap-2">
              <div className="flex items-center gap-1.5 font-mono">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Project: tranquil-tomorrow-hrtgb</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsLoginPage(false);
                    setIsAdminView(true);
                  }}
                  className="hover:text-amber-400 cursor-pointer underline"
                >
                  View Users Roster in Main-Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Page Footer */}
      <footer className="w-full border-t border-[#23221f] py-4 px-6 text-center text-xs text-[#736e65]">
        <span>Agent Lens Autonomous AI Security Gateway • Zero-Trust Enclaves</span>
      </footer>
    </div>
  );
};
