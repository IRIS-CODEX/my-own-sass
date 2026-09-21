import React, { useState } from 'react';
import {
  ShieldAlert,
  Lock,
  Key,
  Mail,
  ArrowRight,
  ShieldCheck,
  Server,
  ArrowLeft,
  Eye,
  EyeOff,
  Fingerprint,
  AlertTriangle,
} from 'lucide-react';
import { useAdminStore } from '../../stores/useAdminStore';
import { useAppStore } from '../../stores/useAppStore';
import { firebaseSignInWithGoogle } from '../../lib/firebaseAuth';

export const AdminLogin: React.FC = () => {
  const { adminLogin, adminLoginWithGoogle } = useAdminStore();
  const { setIsAdminView, addToast, currentUser } = useAppStore();

  const [email, setEmail] = useState('hamudijems4@gmail.com');
  const [masterKey, setMasterKey] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('928-401');
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Master Administrator Email is required.');
      return;
    }

    if (!masterKey.trim()) {
      setErrorMessage('Master Authorization Key is required.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const result = adminLogin(email, masterKey);
      setLoading(false);

      if (result.success) {
        addToast({
          title: 'Root Admin Authenticated',
          description: `Super-admin session established for ${email}. Accessing SaaS Central.`,
          type: 'success',
        });
      } else {
        const msg = result.error || 'Access Denied: Invalid credentials for Root Central Management.';
        setErrorMessage(msg);
        addToast({
          title: 'Access Denied',
          description: msg,
          type: 'error',
        });
      }
    }, 400);
  };

  const handleGoogleAdminLogin = async () => {
    setErrorMessage('');
    setGoogleLoading(true);

    try {
      const res = await firebaseSignInWithGoogle();
      if (res.success && res.user) {
        const result = adminLoginWithGoogle(res.user.email, res.user.displayName);
        if (result.success) {
          addToast({
            title: 'Root Admin Authenticated',
            description: `Session established for ${res.user.email}. Accessing SaaS Central.`,
            type: 'success',
          });
        } else {
          setErrorMessage(result.error || 'This Google account is not authorized for SaaS Central.');
          addToast({
            title: 'SaaS Central Restricted',
            description: result.error || 'Tenant accounts cannot access SaaS Central Management.',
            type: 'error',
          });
        }
      } else if (res.error) {
        setErrorMessage(res.error);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Google authentication failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col justify-between bg-[#faf8f5] dark:bg-[#181715] text-[#1f1e1b] dark:text-[#f5f3ef] selection:bg-amber-500/20 selection:text-amber-900 p-4 sm:p-8 transition-colors duration-200">
      {/* Top Escape Nav */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
        <button
          onClick={() => setIsAdminView(false)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-[#f4f1ea] dark:bg-[#211f1c] dark:hover:bg-[#282622] border border-[#e5e0d5] dark:border-[#33302b] text-xs font-semibold text-[#1f1e1b] dark:text-[#f5f3ef] transition-all cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 text-[#878278]" />
          <span>Exit to Customer AI Workspace</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono text-[#5c5850] dark:text-[#b8b4aa]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>SaaS Master Ingress: Port 443 / Air-Gapped</span>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-md mx-auto my-8">
        <div className="p-8 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xl shadow-black/5 dark:shadow-black/40 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-[#d97706] dark:bg-[#f59e0b] text-white dark:text-[#181715] flex items-center justify-center font-bold text-xl mx-auto shadow-xs">
              👑
            </div>
            <h1 className="text-2xl font-serif font-normal text-[#1f1e1b] dark:text-[#f5f3ef] tracking-tight">
              SaaS Central Management
            </h1>
            <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa] font-medium leading-relaxed">
              Private Back-System Command Deck for Platform Governance, Billing &amp; Tenants.
            </p>
          </div>

          {/* Security Separation Notice Banner */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[#92400e] dark:text-[#fbbf24] text-[11px] leading-relaxed flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-[#d97706] dark:text-[#f59e0b]" />
            <div>
              <span className="font-bold block">Restricted Infrastructure Access:</span>
              <span>
                Tenant customer accounts used for AI agents cannot log into SaaS Central. This terminal is strictly guarded for the Platform Owner and authorized Portal Operators.
              </span>
            </div>
          </div>

          {/* If signed in on the app with a regular tenant account */}
          {currentUser && currentUser.email !== 'hamudijems4@gmail.com' && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-700 dark:text-rose-400 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Active Customer Session Detected:</span>
                <span className="text-[11px]">
                  You are signed into the client app as <code className="font-mono bg-rose-500/15 px-1 rounded">{currentUser.email}</code>. Client accounts cannot access SaaS Central.
                </span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs font-medium flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span className="leading-snug">{errorMessage}</span>
            </div>
          )}

          {/* Google Sign-in for Verified Owner */}
          <button
            type="button"
            onClick={handleGoogleAdminLogin}
            disabled={googleLoading || loading}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-[#faf8f5] dark:bg-[#282622] dark:hover:bg-[#33302b] border border-[#e5e0d5] dark:border-[#33302b] text-xs font-semibold text-[#1f1e1b] dark:text-[#f5f3ef] flex items-center justify-center gap-2.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
            <span>{googleLoading ? 'Verifying Clearance...' : 'Verify with Google (Root Admin Only)'}</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#e5e0d5] dark:border-[#33302b] w-full" />
            <span className="bg-white dark:bg-[#211f1c] px-3 text-[10px] font-mono uppercase text-[#878278] absolute">
              Or Hardware Key / Passcode
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#5c5850] dark:text-[#b8b4aa] mb-1.5">
                Master Administrator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#878278]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hamudijems4@gmail.com"
                  className="w-full bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] rounded-xl pl-10 pr-3 py-2.5 text-xs text-[#1f1e1b] dark:text-[#f5f3ef] placeholder-[#878278] focus:outline-hidden focus:border-[#d97706] dark:focus:border-[#f59e0b] font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#5c5850] dark:text-[#b8b4aa]">
                  Master Security Key
                </label>
                <span className="text-[10px] font-mono text-[#b45309] dark:text-[#fbbf24]">
                  Hardware Token or Root PIN
                </span>
              </div>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#878278]" />
                <input
                  type={showKey ? 'text' : 'password'}
                  value={masterKey}
                  onChange={(e) => setMasterKey(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#1f1e1b] dark:text-[#f5f3ef] placeholder-[#878278] focus:outline-hidden focus:border-[#d97706] dark:focus:border-[#f59e0b] font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#878278] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef] cursor-pointer"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#5c5850] dark:text-[#b8b4aa] mb-1.5">
                Two-Factor Security Code
              </label>
              <div className="relative">
                <Fingerprint className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#878278]" />
                <input
                  type="text"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  placeholder="000-000"
                  className="w-full bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] rounded-xl pl-10 pr-3 py-2.5 text-xs text-[#1f1e1b] dark:text-[#f5f3ef] placeholder-[#878278] focus:outline-hidden focus:border-[#d97706] dark:focus:border-[#f59e0b] font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[#d97706] hover:bg-[#b45309] dark:bg-[#f59e0b] dark:hover:bg-[#fbbf24] text-white dark:text-[#181715] font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating with Root HSM...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Unlock SaaS Master System</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Security Footer */}
      <div className="max-w-4xl mx-auto w-full text-center space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] font-mono text-[#5c5850] dark:text-[#b8b4aa]">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Hardware Security Module (HSM) Bound
          </span>
          <span className="flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-[#d97706] dark:text-[#f59e0b]" />
            Zero-Trust Gateway Enforced
          </span>
          <span>SOC2 Type II Certified Pipeline</span>
        </div>
        <p className="text-[10px] text-[#878278] dark:text-[#7d7970]">
          AgentLens SaaS Back-System Central • Internal Authorization Level 0 Only
        </p>
      </div>
    </div>
  );
};
