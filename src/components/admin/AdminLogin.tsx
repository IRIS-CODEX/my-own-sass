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
    <div className="min-h-screen w-screen flex flex-col justify-between bg-[#faf8f5] dark:bg-[#181715] text-[#1f1e1b] dark:text-[#f5f3ef] selection:bg-amber-500/20 selection:text-amber-900 p-4 sm:p-8 transition-colors duration-200">
      {/* Top Escape Nav */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
        <button
          onClick={() => setIsAdminView(false)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-[#f4f1ea] dark:bg-[#211f1c] dark:hover:bg-[#282622] border border-[#e5e0d5] dark:border-[#33302b] text-xs font-semibold text-[#1f1e1b] dark:text-[#f5f3ef] transition-all cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 text-[#878278]" />
          <span>Exit to Customer Workspace</span>
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
              Restricted Back-System Control for Tenants, Subscriptions &amp; Financial Governance.
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

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
                  placeholder="admin@agentlens.internal"
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
                  Hardware Token or Master PIN
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
              className="w-full py-3 px-4 rounded-xl bg-[#d97706] hover:bg-[#b45309] dark:bg-[#f59e0b] dark:hover:bg-[#fbbf24] text-white dark:text-[#181715] font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-[0.99]"
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
          <div className="pt-3 border-t border-[#e5e0d5] dark:border-[#33302b] space-y-2">
            <div className="flex items-center justify-between text-[11px] text-[#5c5850] dark:text-[#b8b4aa]">
              <span>Testing credentials?</span>
              <span className="font-mono text-[#b45309] dark:text-[#fbbf24]">One-Click Root Access</span>
            </div>
            <button
              type="button"
              onClick={handleQuickDemoAccess}
              className="w-full py-2.5 px-3 rounded-xl bg-[#f4f1ea] hover:bg-[#e5e0d5] dark:bg-[#282622] dark:hover:bg-[#33302b] text-[#1f1e1b] dark:text-[#f5f3ef] border border-[#e5e0d5] dark:border-[#33302b] text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#d97706] dark:text-[#f59e0b]" />
              <span>One-Click Super-Admin Sign In (Demo)</span>
            </button>
          </div>
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
