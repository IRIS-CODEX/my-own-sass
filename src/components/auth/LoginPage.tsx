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
    registerWithDetails,
    loginWithInstantSandboxUser,
    setIsLandingPage,
    setIsLoginPage,
    setIsAdminView,
    addToast,
  } = useAppStore();

  const [mode, setMode] = useState<'signin' | 'register'>('register');
  const [activeAuthTab, setActiveAuthTab] = useState<'google' | 'email'>('google');
  const [selectedPlan, setSelectedPlan] = useState<'FREE' | 'STARTER' | 'PRO_MONTHLY' | 'ENTERPRISE'>('PRO_MONTHLY');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notRegisteredAlert, setNotRegisteredAlert] = useState<{ email?: string; name?: string } | null>(null);

  // Form states for Registration Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [orgName, setOrgName] = useState('');
  const [jobTitle, setJobTitle] = useState('Lead AI Engineer');
  const [useCase, setUseCase] = useState('Autonomous Agent Fleet & Multi-Model Gateway');

  // Handle Google Sign In / Registration
  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setNotRegisteredAlert(null);

    try {
      if (mode === 'register') {
        // In Register mode, if email or name are provided, save to Cloud SQL with package
        if (!name.trim() || !email.trim()) {
          setErrorMessage('Please fill in your name and Gmail address in the form below before continuing.');
          setIsLoading(false);
          return;
        }

        const ok = await registerWithDetails({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          orgName: orgName.trim() || `${name.trim()}'s Fleet Team`,
          jobTitle: jobTitle.trim(),
          planTier: selectedPlan,
          useCase,
          authProvider: 'google',
        });

        if (ok) {
          setIsLoginPage(false);
          setIsLandingPage(false);
        }
      } else {
        // In Sign In mode: verify if already registered
        const result = await loginWithGoogle(selectedPlan);
        if (result.success) {
          setIsLoginPage(false);
          setIsLandingPage(false);
        } else if (result.notRegistered) {
          // Blocked: User has not signed up with package
          setNotRegisteredAlert({
            email: result.email,
            name: result.displayName,
          });
          if (result.email) setEmail(result.email);
          if (result.displayName) setName(result.displayName);
        } else {
          setErrorMessage(result.error || 'Google Sign-In was cancelled or closed.');
        }
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Google Auth error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstantSandbox = () => {
    loginWithInstantSandboxUser(selectedPlan, 'hamudijems4@gmail.com');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setNotRegisteredAlert(null);

    if (mode === 'register') {
      if (!name.trim() || !email.trim()) {
        setErrorMessage('Please fill in all required fields (Name and Email).');
        return;
      }
      setIsLoading(true);
      try {
        const ok = await registerWithDetails({
          name: name.trim(),
          email: email.trim(),
          password: password || undefined,
          phone: phone.trim(),
          orgName: orgName.trim() || `${name.trim()}'s Fleet Organization`,
          jobTitle: jobTitle.trim(),
          planTier: selectedPlan,
          useCase,
          authProvider: email.toLowerCase().endsWith('@gmail.com') ? 'google' : 'email',
        });
        if (ok) {
          setIsLoginPage(false);
          setIsLandingPage(false);
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Registration failed.');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Sign In Flow
      if (!email.trim() || !password) {
        setErrorMessage('Please provide your registered email and password.');
        return;
      }
      setIsLoading(true);
      try {
        const result = await loginWithEmailPassword(email.trim(), password);
        if (result.success) {
          setIsLoginPage(false);
          setIsLandingPage(false);
        } else if (result.notRegistered) {
          setNotRegisteredAlert({ email: email.trim() });
        } else {
          setErrorMessage(result.error || 'Invalid credentials or user not registered.');
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Sign in failed.');
      } finally {
        setIsLoading(false);
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
            <span>Cloud SQL &amp; Auth: europe-west1</span>
          </div>

          <button
            onClick={() => {
              setIsLoginPage(false);
              setIsAdminView(true);
            }}
            className="px-3 py-1.5 rounded-lg border border-amber-500/30 hover:border-amber-500/60 text-amber-300 font-mono flex items-center gap-1.5 transition-all cursor-pointer bg-amber-500/10"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>Main Admin Management</span>
          </button>
        </div>
      </header>

      {/* Main Center Stage */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 my-auto relative overflow-hidden">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(193,95,60,0.12),transparent_70%)] pointer-events-none" />

        <div className="w-full max-w-2xl z-10 space-y-6">
          {/* Headline & Subtitle */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#24231f] border border-[#33312b] text-[#b8b4aa] text-xs font-mono mb-1">
              <GoogleIcon className="w-3.5 h-3.5" />
              <span>Google Cloud SQL (PostgreSQL) Identity Enclave</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif text-[#f5f3ef] tracking-tight">
              {mode === 'register' ? 'Register Subscription & Join Fleet' : 'Sign In to Agent Lens'}
            </h1>
            <p className="text-sm text-[#9c9689] max-w-lg mx-auto">
              {mode === 'register'
                ? 'Complete your registration detail form and activate your package tier. All details are stored directly in Cloud SQL.'
                : 'Enter your credentials or use Google SSO. Only users with a registered subscription profile in Cloud SQL are permitted to login.'}
            </p>
          </div>

          {/* Mode Switcher Tabs (Sign In vs Sign Up) */}
          <div className="flex p-1.5 rounded-2xl bg-[#1a1917] border border-[#2f2e29] shadow-md max-w-md mx-auto">
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
                setNotRegisteredAlert(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'register'
                  ? 'bg-[#c15f3c] text-white shadow-xs'
                  : 'text-[#9c9689] hover:text-[#f5f3ef]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>1. Sign Up &amp; Select Package</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMessage(null);
                setNotRegisteredAlert(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'signin'
                  ? 'bg-white text-[#141413] shadow-xs'
                  : 'text-[#9c9689] hover:text-[#f5f3ef]'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>2. Sign In (Registered Users)</span>
            </button>
          </div>

          {/* NOT REGISTERED BLOCK ALERT */}
          {notRegisteredAlert && (
            <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-sm text-amber-300 block">
                    Access Blocked: Account Not Registered
                  </span>
                  <p className="mt-0.5 opacity-90 text-[11px]">
                    No active package or registration found in Cloud SQL for <span className="font-mono font-bold text-white">{notRegisteredAlert.email}</span>. You must complete the registration form and choose a package before you can log in.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setNotRegisteredAlert(null);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#141413] font-bold text-xs flex-shrink-0 transition-all cursor-pointer shadow-xs"
              >
                Complete Sign-Up Now →
              </button>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">Authentication Notice</span>
                  <p className="opacity-90">{errorMessage}</p>
                </div>
              </div>
              {(errorMessage.toLowerCase().includes('popup') || errorMessage.toLowerCase().includes('blocked')) && (
                <button
                  type="button"
                  onClick={handleInstantSandbox}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex-shrink-0 transition-all cursor-pointer shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Instant 1-Click Access</span>
                </button>
              )}
            </div>
          )}

          {/* Main Form Card */}
          <div className="rounded-2xl border border-[#2f2e29] bg-[#1a1917] p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Step 1: Package Selection */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[#b8b4aa] uppercase tracking-wider text-[11px] font-bold">
                  {mode === 'register' ? 'Select Your Subscription Package' : 'Active Package Scope'}
                </span>
                <span className="text-[11px] text-[#c15f3c] font-medium">
                  {selectedPlan === 'PRO_MONTHLY' ? '⭐ Recommended for Teams' : selectedPlan === 'ENTERPRISE' ? '🏢 Enterprise SLAs' : '⚡ Instant Activation'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'FREE', name: 'Free Tier', price: '$0', quota: '10k req/mo', tag: 'Evaluation' },
                  { id: 'STARTER', name: 'Starter', price: '$49', quota: '50k req/mo', tag: 'Devs' },
                  { id: 'PRO_MONTHLY', name: 'Pro Fleet', price: '$199', quota: '250k req/mo', tag: 'Standard' },
                  { id: 'ENTERPRISE', name: 'Enterprise', price: '$599', quota: 'Unlimited', tag: 'Dedicated' },
                ].map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlan(plan.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedPlan === plan.id
                        ? 'border-[#c15f3c] bg-[#c15f3c]/15 text-[#f5f3ef] shadow-xs ring-1 ring-[#c15f3c]'
                        : 'border-[#33312b] bg-[#151413] hover:border-[#48453e] text-[#9c9689]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-xs text-[#f5f3ef]">{plan.name}</div>
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-neutral-800 text-[#b8b4aa]">
                        {plan.tag}
                      </span>
                    </div>
                    <div className="font-mono text-sm font-bold text-[#c15f3c] mt-1">{plan.price}/mo</div>
                    <div className="text-[10px] text-[#736e65] mt-0.5 font-mono">{plan.quota}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Registration Form / Sign-In Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {mode === 'register' ? (
                /* REGISTRATION DETAIL FORM */
                <div className="space-y-3 pt-2 border-t border-[#2d2c27]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#b8b4aa]">
                      Registration Details Form (Persisted to Cloud SQL)
                    </span>
                    <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Zero-Trust Verification</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-mono text-[#9c9689] block mb-1 font-semibold">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="w-3.5 h-3.5 text-[#736e65] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Alex Mercer"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#33312b] bg-[#141413] text-xs text-[#f5f3ef] placeholder-[#736e65] focus:outline-hidden focus:border-[#c15f3c]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-mono text-[#9c9689] block mb-1 font-semibold">
                        Gmail or Work Email *
                      </label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 text-[#736e65] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. hamudijems4@gmail.com"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#33312b] bg-[#141413] text-xs text-[#f5f3ef] placeholder-[#736e65] focus:outline-hidden focus:border-[#c15f3c]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-mono text-[#9c9689] block mb-1 font-semibold">
                        Company / Organization
                      </label>
                      <div className="relative">
                        <Building2 className="w-3.5 h-3.5 text-[#736e65] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={orgName}
                          onChange={(e) => setOrgName(e.target.value)}
                          placeholder="e.g. Quantum Fleet AI Labs"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#33312b] bg-[#141413] text-xs text-[#f5f3ef] placeholder-[#736e65] focus:outline-hidden focus:border-[#c15f3c]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-mono text-[#9c9689] block mb-1 font-semibold">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +1 (555) 349-9210"
                        className="w-full px-3 py-2.5 rounded-xl border border-[#33312b] bg-[#141413] text-xs text-[#f5f3ef] placeholder-[#736e65] focus:outline-hidden focus:border-[#c15f3c]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-mono text-[#9c9689] block mb-1 font-semibold">
                        Job Title / Role
                      </label>
                      <input
                        type="text"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="e.g. Lead AI Architect"
                        className="w-full px-3 py-2.5 rounded-xl border border-[#33312b] bg-[#141413] text-xs text-[#f5f3ef] placeholder-[#736e65] focus:outline-hidden focus:border-[#c15f3c]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-mono text-[#9c9689] block mb-1 font-semibold">
                        Fleet Primary Use Case
                      </label>
                      <input
                        type="text"
                        value={useCase}
                        onChange={(e) => setUseCase(e.target.value)}
                        placeholder="e.g. Multi-Model LLM Governance"
                        className="w-full px-3 py-2.5 rounded-xl border border-[#33312b] bg-[#141413] text-xs text-[#f5f3ef] placeholder-[#736e65] focus:outline-hidden focus:border-[#c15f3c]"
                      />
                    </div>
                  </div>

                  {/* Password field for optional credentials */}
                  <div>
                    <label className="text-[11px] font-mono text-[#9c9689] block mb-1 font-semibold">
                      Account Password (Optional if using Google SSO)
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-[#736e65] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Set account password (min 6 characters)"
                        className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-[#33312b] bg-[#141413] text-xs text-[#f5f3ef] placeholder-[#736e65] focus:outline-hidden focus:border-[#c15f3c]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#736e65] hover:text-[#b8b4aa] cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 py-3 px-4 rounded-xl bg-[#c15f3c] hover:bg-[#a94f30] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{isLoading ? 'Saving to Cloud SQL...' : `Register & Activate ${selectedPlan} Tier`}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleGoogleAuth}
                      disabled={isLoading}
                      className="py-3 px-4 rounded-xl bg-white hover:bg-[#f3eee5] text-[#141413] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                    >
                      <GoogleIcon className="w-4 h-4" />
                      <span>Sign Up with Gmail</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* SIGN IN FORM (GATE CHECK ENFORCED) */
                <div className="space-y-3 pt-2 border-t border-[#2d2c27]">
                  <div className="p-3.5 rounded-xl bg-[#141413] border border-[#2f2e29] space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#f5f3ef]">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Protected Gateway Login Gate</span>
                    </div>
                    <p className="text-[11px] text-[#878278]">
                      Users must have an existing registered account in the Cloud SQL database to enter.
                    </p>
                  </div>

                  {/* Google SSO Login */}
                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-[#f3eee5] text-[#141413] text-xs font-bold transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-md disabled:opacity-50"
                  >
                    <GoogleIcon className="w-4 h-4" />
                    <span>{isLoading ? 'Verifying with Cloud SQL...' : 'Sign In with Google / Gmail'}</span>
                  </button>

                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#2e2d27]" />
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-wider">
                      <span className="bg-[#1a1917] px-2 text-[#736e65]">Or Work Email Credentials</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-[#9c9689] block mb-1 font-semibold">
                      Registered Email
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-[#736e65] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. name@organization.com"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#33312b] bg-[#141413] text-xs text-[#f5f3ef] placeholder-[#736e65] focus:outline-hidden focus:border-[#c15f3c]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-[#9c9689] block mb-1 font-semibold">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-[#736e65] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-[#33312b] bg-[#141413] text-xs text-[#f5f3ef] placeholder-[#736e65] focus:outline-hidden focus:border-[#c15f3c]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#736e65] hover:text-[#b8b4aa] cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl bg-[#c15f3c] hover:bg-[#a94f30] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    <span>{isLoading ? 'Verifying Account...' : 'Sign In to Workspace'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="pt-1 text-center">
                    <button
                      type="button"
                      onClick={handleInstantSandbox}
                      className="text-xs text-amber-400 hover:underline font-mono cursor-pointer"
                    >
                      ⚡ Quick Demo Login (hamudijems4@gmail.com)
                    </button>
                  </div>
                </div>
              )}
            </form>

            {/* Cloud Metadata & Status Footer */}
            <div className="pt-4 border-t border-[#2d2c27] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#736e65] gap-2">
              <div className="flex items-center gap-1.5 font-mono">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Cloud SQL Project: tranquil-tomorrow-hrtgb</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsLoginPage(false);
                    setIsAdminView(true);
                  }}
                  className="hover:text-amber-400 cursor-pointer underline font-mono"
                >
                  View Live SQL Users in Admin Portal →
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Page Footer */}
      <footer className="w-full border-t border-[#23221f] py-4 px-6 text-center text-xs text-[#736e65]">
        <span>Agent Lens Autonomous AI Security Gateway • Enforced Cloud SQL User Storage</span>
      </footer>
    </div>
  );
};
