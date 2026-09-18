import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Radio,
  Plus,
  KeyRound,
  Shield,
  Bell,
  Sun,
  Moon,
  Sparkles,
  Smartphone,
  ExternalLink,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  Command,
  DollarSign,
  Users,
  Globe
} from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { useKeysStore } from '../../stores/useKeysStore';
import { useLiveStreamStore } from '../../stores/useLiveStreamStore';

export const Topbar: React.FC = () => {
  const {
    activeNav,
    setActiveNav,
    theme,
    toggleTheme,
    searchQuery,
    setSearchQuery,
    currentOrg,
    isAdminView,
    setIsAdminView,
    setIsLandingPage,
    addToast
  } = useAppStore();

  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const setNewKeyModalOpen = useKeysStore((s) => s.setNewKeyModalOpen);
  const pendingCount = useLiveStreamStore((s) => s.pendingActions.length);

  // Global hotkey: press '/' to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close command popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenMainAdmin = () => {
    setIsAdminView(true);
    setSearchQuery('');
    setSearchFocused(false);
    addToast({
      title: 'Root Admin Access Granted',
      description: 'Entered Main SaaS Super-Admin Control Panel. Managing users, subscriptions, and platform revenue.',
      type: 'success',
    });
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const normalized = searchQuery.trim().toLowerCase();
    if (e.key === 'Enter') {
      if (normalized === '/main-admin' || normalized === '/admin') {
        e.preventDefault();
        handleOpenMainAdmin();
      }
    }
  };

  // Check if query matches admin command
  const isCommandQuery = searchQuery.startsWith('/') || searchQuery.toLowerCase().includes('admin');
  const isExactAdminMatch = searchQuery.trim().toLowerCase() === '/main-admin';

  const getSectionTitle = () => {
    if (isAdminView) {
      return {
        title: 'SaaS Master Control Deck',
        subtitle: 'Root Governance: User accounts, recurring revenue (MRR), unpaid balances, and platform telemetry'
      };
    }

    switch (activeNav) {
      case 'chat':
        return { title: 'AI Agent Chat & Workspace', subtitle: 'Chat with your autonomous AI agents, execute governed tools, and inspect real-time reasoning' };
      case 'overview':
        return { title: 'Fleet Overview & Command Center', subtitle: 'Real-time telemetry, tool invocation metrics, and active autonomous agents' };
      case 'studio':
        return { title: 'AI Agent Studio', subtitle: '1-Prompt autonomous agent synthesizer with 5-stage sandboxed verification' };
      case 'agents':
        return { title: 'Agent Registry & Autonomy Control', subtitle: 'Govern runtime autonomy modes (Full Auto, Semi-Auto, Read-Only, Paused)' };
      case 'live-stream':
        return { title: 'Real-Time Control Tower & HITL', subtitle: 'Sub-millisecond trace waterfall and interactive supervisor steering queue' };
      case 'policies':
        return { title: 'Policy Studio & Agent Governance', subtitle: 'Traffic light boundaries, prompt-configured agent rules, and interactive README.md governance spec' };
      case 'keys':
        return { title: 'AI Proxy Gateway & Virtual Key Bridge', subtitle: 'Register external AI API keys, issue governed virtual keys, track credit usage, and block prompt injection attacks' };
      case 'compliance':
        return { title: 'Regulatory Compliance & Audit Hub', subtitle: 'EU AI Act Article 14, SOC 2 Type II, and tamper-proof Merkle cryptographic ledger' };
      case 'analytics':
        return { title: 'Cost Optimization & Model Routing', subtitle: 'Semantic cache hit savings calculation and dynamic model fallbacks' };
      case 'settings':
        return { title: 'Workspace Settings & Billing', subtitle: 'PayPal and Mastercard subscriptions, Telegram bot pairing, and team RBAC' };
      default:
        return { title: 'AgentLens Command Center', subtitle: 'Autonomous AI Agent Governance & Observability Gateway' };
    }
  };

  const { title, subtitle } = getSectionTitle();
  const quotaPercent = Math.round((currentOrg.monthlyRequestsUsed / currentOrg.monthlyRequestLimit) * 100);

  return (
    <header className="h-16 border-b border-yellow-300/40 dark:border-yellow-500/20 bg-white/85 dark:bg-[#090b12]/85 backdrop-blur-md px-6 flex items-center justify-between z-20 transition-colors duration-200">
      {/* Title & Context */}
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm md:text-base font-bold text-slate-950 dark:text-white tracking-tight">
              {title}
            </h1>
            {isAdminView && (
              <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-rose-600/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                Root Admin Mode
              </span>
            )}
          </div>
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300 hidden md:block">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Action Strip */}
      <div className="flex items-center gap-2.5">
        {/* Global Search & Command Center */}
        <div ref={searchContainerRef} className="relative w-48 sm:w-60 lg:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-yellow-400/80 pointer-events-none" />
          <input
            ref={searchInputRef}
            id="global-search-input"
            type="text"
            value={searchQuery}
            onFocus={() => setSearchFocused(true)}
            onChange={(e) => {
              const val = e.target.value;
              setSearchQuery(val);
              // If typed exact command directly
              if (val.trim().toLowerCase() === '/main-admin') {
                setSearchFocused(true);
              }
            }}
            onKeyDown={handleSearchKeyDown}
            placeholder="Type /main-admin or search..."
            className="w-full bg-white/90 dark:bg-[#121524] border border-yellow-300/70 dark:border-yellow-500/30 rounded-lg pl-8 pr-8 py-1.5 text-xs text-slate-950 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-hidden focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400/25 transition-colors font-sans shadow-2xs font-medium"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-slate-700 dark:text-yellow-400/90 bg-yellow-100/80 dark:bg-yellow-950/50 px-1.5 py-0.5 rounded border border-yellow-300/80 dark:border-yellow-500/40">
            /
          </kbd>

          {/* Autocomplete / Command Popup for /main-admin */}
          {(searchFocused && (isCommandQuery || searchQuery.trim().length > 0)) && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-[#0e111e] rounded-xl border border-yellow-400/70 dark:border-yellow-500/40 shadow-xl backdrop-blur-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-yellow-400/80 flex items-center justify-between border-b border-yellow-200/60 dark:border-[#1e2338] pb-1.5 mb-1.5">
                <span className="flex items-center gap-1">
                  <Command className="w-3 h-3" />
                  SaaS Control Command
                </span>
                <span className="text-[9px] lowercase text-slate-500 font-normal">press enter to execute</span>
              </div>

              {/* /main-admin Option */}
              <button
                type="button"
                id="cmd-execute-main-admin"
                onClick={handleOpenMainAdmin}
                className={`w-full text-left p-2.5 rounded-lg flex items-start justify-between gap-2 transition-all cursor-pointer ${
                  isExactAdminMatch
                    ? 'bg-yellow-400 text-slate-950 font-bold shadow-xs'
                    : 'bg-yellow-50 hover:bg-yellow-100/80 dark:bg-yellow-950/30 dark:hover:bg-yellow-900/40 text-slate-950 dark:text-white border border-yellow-300/60 dark:border-yellow-500/30'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-black bg-yellow-200 dark:bg-yellow-400/20 px-1.5 py-0.5 rounded text-slate-950 dark:text-yellow-300 border border-yellow-300">
                      /main-admin
                    </span>
                    <span className="text-xs font-bold">Launch SaaS Super-Admin Panel</span>
                  </div>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 font-normal leading-snug">
                    Root control deck: users, MRR, subscriptions, unpaid accounts &amp; platform telemetry.
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-600 dark:text-yellow-400 shrink-0 mt-1" />
              </button>
            </div>
          )}
        </div>

        {/* Live Pending Approvals Counter (if any) */}
        {pendingCount > 0 && (
          <button
            onClick={() => setActiveNav('live-stream')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-400/20 text-amber-950 dark:text-yellow-300 border border-amber-400/50 dark:border-yellow-400/40 hover:bg-amber-400/30 transition-all animate-pulse shadow-xs cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5 text-amber-600 dark:text-yellow-400" />
            <span className="hidden sm:inline">{pendingCount} Approval{pendingCount > 1 ? 's' : ''}</span>
          </button>
        )}

        {/* Admin Back-to-Workspace Quick Button if in Admin Mode */}
        {isAdminView && (
          <button
            id="exit-admin-btn"
            onClick={() => {
              setIsAdminView(false);
              addToast({
                title: 'Exited Admin Mode',
                description: 'Returned to standard Customer Workspace.',
                type: 'info'
              });
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <span>Exit Admin</span>
          </button>
        )}

        {/* Return to Public Website CTA */}
        {!isAdminView && (
          <button
            id="topbar-view-website-btn"
            onClick={() => setIsLandingPage(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-yellow-400/40 hover:border-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-700 dark:text-yellow-400 flex items-center gap-1.5 transition-all cursor-pointer"
            title="View Public Portfolio / Landing Website"
          >
            <Globe className="w-3.5 h-3.5 text-yellow-500" />
            <span className="hidden md:inline">Website</span>
          </button>
        )}

        {/* Quick Action: New Agent (if not in admin view) */}
        {!isAdminView && (
          <button
            id="topbar-create-agent-btn"
            onClick={() => setActiveNav('studio')}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-yellow-400 hover:bg-yellow-300 text-slate-950 flex items-center gap-1.5 transition-all shadow-sm shadow-yellow-400/30 border border-yellow-300 dark:border-yellow-400/50 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            <span className="hidden sm:inline">New Agent</span>
          </button>
        )}

        {/* Advanced Theme Toggle */}
        <button
          id="topbar-theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle color theme"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-yellow-300/70 dark:border-yellow-500/30 bg-white/90 dark:bg-[#121524] text-slate-900 dark:text-yellow-300 hover:border-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-950/30 transition-all text-xs font-semibold shadow-2xs cursor-pointer"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
              <span className="hidden sm:inline text-[11px] font-bold text-yellow-200">Dark (Gold)</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-slate-800" />
              <span className="hidden sm:inline text-[11px] font-bold text-slate-900">Light (Glass)</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
