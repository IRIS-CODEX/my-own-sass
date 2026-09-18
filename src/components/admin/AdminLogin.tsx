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
  Sparkles,
  Fingerprint
} from 'lucide-react';
import { useAdminStore } from '../../stores/useAdminStore';
import { useAppStore } from '../../stores/useAppStore';

export const AdminLogin: React.FC = () => {
  const { adminLogin } = useAdminStore();
  const { setIsAdminView, addToast } = useAppStore();

  const [email, setEmail] = useState('root@agentlens.internal');
  const [masterKey, setMasterKey] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('928-401');
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    if (!masterKey.trim()) {
      setErrorMessage('Master Authorization Key is required.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const success = adminLogin(email, masterKey);
      setLoading(false);

      if (success) {
        addToast({
          title: 'Root Admin Authenticated',
          description: `Super-admin session established for ${email}. Accessing SaaS Central.`,
          type: 'success',
        });
      } else {
        setErrorMessage('Authentication failed: Invalid Master Key credentials.');
        addToast({
          title: 'Access Denied',
          description: 'Invalid credentials for Root Central Management.',
          type: 'error',
        });
      }
    }, 450);
  };

  const handleQuickDemoAccess = () => {
    setEmail('superadmin@agentlens.internal');
    setMasterKey('AL-ROOT-MASTER-2026');
    setTwoFactorCode('884-219');

    setLoading(true);
    setTimeout(() => {
      adminLogin('superadmin@agentlens.internal', 'AL-ROOT-MASTER-2026');
      setLoading(false);
      addToast({
        title: 'Super-Admin Console Initialized',
        description: 'Signed in with Root Clearance Level 0. Welcome back.',
        type: 'success',
      });
    }, 300);
  };

  return (
    <div className="min-h-screen w-screen flex flex-col justify-between bg-gradient-to-br from-amber-50/70 via-slate-100 to-yellow-100/40 dark:from-[#05070c] dark:via-[#090b14] dark:to-[#121626] text-slate-900 dark:text-slate-100 selection:bg-yellow-400 selection:text-slate-950 p-4 sm:p-8">
      {/* Top Escape Nav */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
        <button
          onClick={() => setIsAdminView(false)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 dark:bg-[#0c0e18]/80 backdrop-blur-md border border-yellow-300/60 dark:border-yellow-500/20 text-xs font-bold text-slate-800 dark:text-yellow-300 hover:bg-yellow-100/60 dark:hover:bg-yellow-950/40 transition-all cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to Customer Workspace</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>SaaS Master Ingress: Port 443 / Air-Gapped</span>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-md mx-auto my-8">
        <div className="p-8 rounded-3xl bg-white/90 dark:bg-[#0c0e18]/90 backdrop-blur-xl border-2 border-yellow-400/70 dark:border-yellow-500/30 shadow-2xl shadow-yellow-500/10 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-yellow-400 text-slate-950 flex items-center justify-center font-black text-2xl mx-auto shadow-md shadow-yellow-400/20">
              👑
            </div>
            <h1 className="text-xl font-black tracking-tight text-slate-950 dark:text-white">
              SaaS Central Management
            </h1>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
              Restricted Back-System Control for Tenants, Subscriptions &amp; Financial Governance.
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300 mb-1.5">
                Master Administrator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@agentlens.internal"
                  className="w-full bg-yellow-50/50 dark:bg-[#121524] border border-yellow-300/80 dark:border-yellow-500/30 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-950 dark:text-white placeholder-slate-500 focus:outline-hidden focus:border-yellow-500 font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300">
                  Master Security Key
                </label>
                <span className="text-[10px] font-mono text-amber-700 dark:text-yellow-400">
                  Hardware Token or Master PIN
                </span>
              </div>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showKey ? 'text' : 'password'}
                  value={masterKey}
                  onChange={(e) => setMasterKey(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full bg-yellow-50/50 dark:bg-[#121524] border border-yellow-300/80 dark:border-yellow-500/30 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-950 dark:text-white placeholder-slate-500 focus:outline-hidden focus:border-yellow-500 font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300 mb-1.5">
                Two-Factor Security Code
              </label>
              <div className="relative">
                <Fingerprint className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  placeholder="000-000"
                  className="w-full bg-yellow-50/50 dark:bg-[#121524] border border-yellow-300/80 dark:border-yellow-500/30 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-950 dark:text-white placeholder-slate-500 focus:outline-hidden focus:border-yellow-500 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-yellow-400/20 cursor-pointer border border-yellow-300 active:scale-[0.99]"
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

          {/* Quick Demo Root Login */}
          <div className="pt-2 border-t border-yellow-200/60 dark:border-yellow-500/20 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
              <span>Testing credentials?</span>
              <span className="font-mono text-amber-800 dark:text-yellow-400">One-Click Root Access</span>
            </div>
            <button
              type="button"
              onClick={handleQuickDemoAccess}
              className="w-full py-2.5 px-3 rounded-xl bg-yellow-100 hover:bg-yellow-200/80 dark:bg-yellow-950/40 dark:hover:bg-yellow-900/50 text-slate-950 dark:text-yellow-300 border border-yellow-300/80 dark:border-yellow-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-700 dark:text-yellow-400" />
              <span>One-Click Super-Admin Sign In (Demo)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Security Footer */}
      <div className="max-w-4xl mx-auto w-full text-center space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] font-mono text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Hardware Security Module (HSM) Bound
          </span>
          <span className="flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-amber-600 dark:text-yellow-400" />
            Zero-Trust Gateway Enforced
          </span>
          <span>SOC2 Type II Certified Pipeline</span>
        </div>
        <p className="text-[10px] text-slate-500">
          AgentLens SaaS Back-System Central • Internal Authorization Level 0 Only
        </p>
      </div>
    </div>
  );
};
