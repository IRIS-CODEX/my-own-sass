import React, { useEffect, useState } from 'react';
import { useAppStore } from './stores/useAppStore';
import { useLiveStreamStore } from './stores/useLiveStreamStore';
import { useAdminStore } from './stores/useAdminStore';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { FleetOverview } from './components/dashboard/FleetOverview';
import { AgentStudio } from './components/studio/AgentStudio';
import { AgentRegistry } from './components/agents/AgentRegistry';
import { AgentChat } from './components/chat/AgentChat';
import { ControlTower } from './components/live-stream/ControlTower';
import { PolicyStudio } from './components/policies/PolicyStudio';
import { VirtualKeyVault } from './components/keys/VirtualKeyVault';
import { ComplianceHub } from './components/compliance/ComplianceHub';
import { CostAnalytics } from './components/analytics/CostAnalytics';
import { SettingsHub } from './components/settings/SettingsHub';
import { AdminPortal } from './components/admin/AdminPortal';
import { PortfolioPage } from './components/landing/PortfolioPage';
import { LoginPage } from './components/auth/LoginPage';
import { onFirebaseAuthStateChanged } from './lib/firebaseAuth';
import { CheckCircle2, AlertTriangle, Info, X, Menu } from 'lucide-react';

export default function App() {
  const {
    activeNav,
    isAdminView,
    isLandingPage,
    isLoginPage,
    theme,
    toasts,
    removeToast,
    soundEnabled,
  } = useAppStore();

  const pendingApprovalsCount = useLiveStreamStore((s) => s.pendingActions.length);
  const globalAnnouncement = useAdminStore((s) => s.globalAnnouncement);
  const setGlobalAnnouncement = useAdminStore((s) => s.setGlobalAnnouncement);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync theme class to documentElement
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Sync /main-admin URL route with Admin Panel state
  useEffect(() => {
    const handleUrlRoute = () => {
      try {
        const path = (window.location.pathname || '').toLowerCase();
        const hash = (window.location.hash || '').toLowerCase();
        const search = (window.location.search || '').toLowerCase();
        const matchesAdmin =
          path.includes('/main-admin') ||
          path === '/main-admin' ||
          path.endsWith('main-admin') ||
          hash.includes('main-admin') ||
          search.includes('main-admin');

        const matchesLogin =
          path.includes('/login') ||
          path.includes('/signin') ||
          path.includes('/google-auth') ||
          hash.includes('login') ||
          hash.includes('signin') ||
          hash.includes('google-auth') ||
          search.includes('login');

        const currentIsAdmin = useAppStore.getState().isAdminView;
        const currentIsLogin = useAppStore.getState().isLoginPage;

        if (matchesAdmin && !currentIsAdmin) {
          useAppStore.getState().setIsAdminView(true);
        } else if (matchesLogin && !currentIsLogin) {
          useAppStore.getState().setIsLoginPage(true);
        } else if (!matchesAdmin && !matchesLogin && currentIsAdmin && (path === '/' || path === '') && !hash.includes('main-admin')) {
          useAppStore.getState().setIsAdminView(false);
        }
      } catch (e) {}
    };

    handleUrlRoute();

    window.addEventListener('popstate', handleUrlRoute);
    window.addEventListener('hashchange', handleUrlRoute);
    window.addEventListener('focus', handleUrlRoute);

    return () => {
      window.removeEventListener('popstate', handleUrlRoute);
      window.removeEventListener('hashchange', handleUrlRoute);
      window.removeEventListener('focus', handleUrlRoute);
    };
  }, []);

  // Listen to Firebase Auth state for real session persistence
  useEffect(() => {
    const unsubscribe = onFirebaseAuthStateChanged((profile) => {
      useAppStore.getState().setAuthReady(true);
      if (profile) {
        useAppStore.getState().setCurrentUserFromProfile(profile);
      }
    });
    return () => unsubscribe();
  }, []);

  // Audio Chime with Web Audio API synthesizer for approvals
  useEffect(() => {
    if (!soundEnabled || pendingApprovalsCount === 0) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      // Soft dual-tone chime
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start(ctx.currentTime + 0.08);
      osc1.stop(ctx.currentTime + 0.35);
      osc2.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio context might be restricted before first gesture; silently ignore
    }
  }, [pendingApprovalsCount, soundEnabled]);

  // Render appropriate view in customer workspace
  const renderCurrentView = () => {
    switch (activeNav) {
      case 'chat':
        return <AgentChat />;
      case 'overview':
        return <FleetOverview />;
      case 'studio':
        return <AgentStudio />;
      case 'agents':
        return <AgentRegistry />;
      case 'live-stream':
        return <ControlTower />;
      case 'policies':
        return <PolicyStudio />;
      case 'keys':
        return <VirtualKeyVault />;
      case 'compliance':
        return <ComplianceHub />;
      case 'analytics':
        return <CostAnalytics />;
      case 'settings':
        return <SettingsHub />;
      default:
        return <FleetOverview />;
    }
  };

  // Dedicated SaaS Super-Admin System
  if (isAdminView) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-amber-50/60 via-slate-50 to-yellow-50/40 dark:from-[#05070c] dark:via-[#070912] dark:to-[#0f1220] text-slate-900 dark:text-slate-100 font-sans selection:bg-yellow-400 selection:text-slate-950">
        <AdminPortal />

        {/* Global Toast Notification Container */}
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="pointer-events-auto p-4 rounded-xl shadow-xl shadow-yellow-950/10 bg-white/95 dark:bg-[#0c0e18]/95 backdrop-blur-md border border-yellow-300/60 dark:border-yellow-500/30 flex items-start gap-3 text-xs transition-all animate-in fade-in slide-in-from-bottom-2 duration-200"
            >
              {toast.type === 'success' && (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              )}
              {toast.type === 'warning' && (
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              )}
              {toast.type === 'info' && (
                <Info className="w-4 h-4 text-amber-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              )}

              <div className="flex-1">
                <span className="font-bold text-slate-950 dark:text-white block">
                  {toast.title}
                </span>
                {toast.description && (
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5 font-medium">
                    {toast.description}
                  </p>
                )}
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Dedicated Google Auth & User Login Page
  if (isLoginPage) {
    return (
      <div className="min-h-screen w-full bg-[#141413] text-[#f5f3ef] font-sans selection:bg-[#c15f3c] selection:text-white">
        <LoginPage />

        {/* Global Toast Notification Container */}
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="pointer-events-auto p-4 rounded-xl shadow-xl shadow-black/40 bg-[#1e1d1b]/95 backdrop-blur-md border border-[#38342c] flex items-start gap-3 text-xs transition-all animate-in fade-in slide-in-from-bottom-2 duration-200 text-[#f5f3ef]"
            >
              {toast.type === 'success' && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              )}
              {toast.type === 'warning' && (
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              )}
              {toast.type === 'info' && (
                <Info className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
              )}

              <div className="flex-1">
                <span className="font-bold text-[#f5f3ef] block">
                  {toast.title}
                </span>
                {toast.description && (
                  <p className="text-[#9c9689] text-[11px] mt-0.5 font-medium">
                    {toast.description}
                  </p>
                )}
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="text-[#736e65] hover:text-[#f5f3ef] p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Public High-Performance 3D Portfolio & Gateway Website
  if (isLandingPage) {
    return (
      <div className="min-h-screen w-full bg-slate-50 dark:bg-[#060810] text-slate-900 dark:text-slate-100 font-sans selection:bg-yellow-400 selection:text-slate-950">
        <PortfolioPage />

        {/* Global Toast Notification Container */}
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="pointer-events-auto p-4 rounded-xl shadow-xl shadow-yellow-950/10 bg-white/95 dark:bg-[#0c0e18]/95 backdrop-blur-md border border-yellow-300/60 dark:border-yellow-500/30 flex items-start gap-3 text-xs transition-all animate-in fade-in slide-in-from-bottom-2 duration-200"
            >
              {toast.type === 'success' && (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              )}
              {toast.type === 'warning' && (
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              )}
              {toast.type === 'info' && (
                <Info className="w-4 h-4 text-amber-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              )}

              <div className="flex-1">
                <span className="font-bold text-slate-950 dark:text-white block">
                  {toast.title}
                </span>
                {toast.description && (
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5 font-medium">
                    {toast.description}
                  </p>
                )}
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gradient-to-br from-amber-50/50 via-white to-yellow-50/30 dark:from-[#07080d] dark:via-[#090b12] dark:to-[#0f111a] text-slate-900 dark:text-slate-100 font-sans selection:bg-yellow-400 selection:text-slate-950 transition-colors duration-200">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:flex flex-shrink-0 h-full">
        <Sidebar />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 dark:bg-black/80 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-72 h-full">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Primary Application Body */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-transparent">
        {/* Mobile Header Bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white/90 dark:bg-[#0c0e18]/90 backdrop-blur-md border-b border-yellow-200/80 dark:border-yellow-500/20">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 rounded-lg border border-yellow-300/80 dark:border-yellow-500/30 text-slate-800 dark:text-yellow-300"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-yellow-400 text-slate-950 flex items-center justify-center font-bold text-xs shadow-sm">
              AL
            </div>
            <span className="font-bold text-sm text-slate-900 dark:text-white">AgentLens</span>
          </div>

          <div className="w-6" />
        </div>

        <Topbar />

        {/* Platform Announcement Banner if active */}
        {globalAnnouncement && (
          <div className="bg-yellow-400 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-between shadow-xs border-b border-yellow-500/40">
            <div className="flex items-center gap-2 max-w-5xl mx-auto flex-1">
              <span className="font-mono uppercase text-[10px] bg-slate-950 text-yellow-400 px-1.5 py-0.5 rounded">
                Announcement
              </span>
              <span>{globalAnnouncement}</span>
            </div>
            <button
              onClick={() => setGlobalAnnouncement(null)}
              className="p-1 rounded hover:bg-yellow-500/30 text-slate-950 cursor-pointer"
              title="Dismiss announcement"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 max-w-7xl w-full mx-auto">
          {renderCurrentView()}
        </main>
      </div>

      {/* Global Toast Notification Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto p-4 rounded-xl shadow-xl shadow-yellow-950/10 bg-white/95 dark:bg-[#0c0e18]/95 backdrop-blur-md border border-yellow-300/60 dark:border-yellow-500/30 flex items-start gap-3 text-xs transition-all animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            {toast.type === 'success' && (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            )}
            {toast.type === 'warning' && (
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            )}
            {toast.type === 'info' && (
              <Info className="w-4 h-4 text-amber-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            )}

            <div className="flex-1">
              <span className="font-bold text-slate-950 dark:text-white block">
                {toast.title}
              </span>
              {toast.description && (
                <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5 font-medium">
                  {toast.description}
                </p>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
