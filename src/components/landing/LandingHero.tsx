import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import {
  ArrowRight,
  Shield,
  KeyRound,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Send,
  Lock,
  Mail,
  User,
  Building,
  ChevronDown,
  Eye,
  EyeOff,
  ShieldCheck,
  Check,
  Terminal,
  Folder,
  Plus,
  FileSpreadsheet,
  LineChart,
  Layout,
  Sunrise,
  FolderOpen,
  MessageSquare,
  Code2,
  CheckCheck,
} from 'lucide-react';

interface QuickTile {
  id: string;
  label: string;
  iconType: 'file' | 'chart' | 'prototype' | 'prep' | 'folder' | 'message';
  prompt: string;
  agent: string;
  model: string;
  status: 'SAFE' | 'INTERCEPTED' | 'BLOCKED';
  action: string;
  reasoning: string;
  result: string;
  filePreview?: string;
}

const ACTION_TILES: QuickTile[] = [
  {
    id: 'create_file',
    label: 'Create a file',
    iconType: 'file',
    prompt: 'Create an autonomous Stripe Treasury wire transfer reconciliation agent with Zero-Trust AST guardrails.',
    agent: 'Financial Autopilot Agent',
    model: 'Claude 3.5 Sonnet / AST Gate',
    status: 'INTERCEPTED',
    action: 'stripe_wire_transfer({"amountUsd": 14200, "recipient": "Acme Hardware"})',
    reasoning: 'Zero-Trust Policy #FIN-04: Wire transfers exceeding $5,000 require FIDO2 Human-in-the-Loop multi-sig approval. Placed in escrow with 300s TTL.',
    result: 'Escrow Lock Engaged (TTL: 284s) • Awaiting Operator Approval',
    filePreview: `// escrow_policy_fin04.ts
export const verifyWireEscrow = async (tx: WireTransfer) => {
  if (tx.amountUsd > 5000) {
    return EscrowGate.requireHumanSignature({
      policy: "FIN-04",
      ttlSeconds: 300,
      merkleLog: true
    });
  }
};`,
  },
  {
    id: 'crunch_data',
    label: 'Crunch data',
    iconType: 'chart',
    prompt: 'Crunch latency and multi-model cost metrics across 45,000 agent queries from the last 24 hours.',
    agent: 'Cost Arbitrage Router',
    model: 'Arbitrage Engine (Flash + Claude)',
    status: 'SAFE',
    action: 'compute_arbitrage_efficiency({"window": "24h", "queries": 45200})',
    reasoning: '91% of routine parsing queries routed to Gemini 2.0 Flash ($0.075/M). 9% complex reasoning routed to Claude 3.5 Sonnet. Net savings: $1,428.50.',
    result: 'Arbitrage Active • 68% Spend Reduction ($68.40 vs $214.00)',
  },
  {
    id: 'make_prototype',
    label: 'Make a prototype',
    iconType: 'prototype',
    prompt: 'Make a prototype virtual key proxy with 300s TTL and a strict $20 budget cap for Worker #7.',
    agent: 'Nitro Enclave Key Escrow',
    model: 'AWS Nitro Enclave / FIPS 140-3',
    status: 'SAFE',
    action: 'mint_ephemeral_key({"ttl": 300, "budgetUsd": 20.0, "scope": ["gemini-2.0-flash"]})',
    reasoning: 'Generated virtual proxy token al_live_sec_99a1... Upstream master keys remain quarantined inside AWS Nitro Enclaves.',
    result: 'Proxy Token Active: al_live_sec_99a1... (Expires in 5m)',
  },
  {
    id: 'prep_day',
    label: 'Prep for the day',
    iconType: 'prep',
    prompt: 'Audit overnight agent execution logs and summarize intercepted policy violations.',
    agent: 'Merkle Audit Supervisor',
    model: 'Zero-Trust Auditor',
    status: 'SAFE',
    action: 'audit_merkle_tree({"since": "00:00:00Z", "status": "FLAGGED"})',
    reasoning: '14,890 tool calls verified. 2 prompt injection attempts neutralized at AST gateway. Cryptographic Merkle root signed on-chain.',
    result: 'Health Score: 99.8% • All Swarm Enclaves Quarantined',
  },
  {
    id: 'organize_files',
    label: 'Organize files',
    iconType: 'folder',
    prompt: 'Quarantine and organize raw memory dumps from decommissioned agent worker instances.',
    agent: 'Enclave Cleaner',
    model: 'Zero-Persistence Gate',
    status: 'SAFE',
    action: 'purge_ephemeral_state({"instances": ["worker-04", "worker-08"]})',
    reasoning: 'Wiped volatile runtime memory using DoD 5220.22-M zeroization. No master keys or customer credentials persisted.',
    result: 'Memory Zeroized • Cryptographic Attestation Issued',
  },
  {
    id: 'send_message',
    label: 'Send a message',
    iconType: 'message',
    prompt: 'Dispatch urgent Slack notification to security lead regarding intercepted $14,200 wire transfer.',
    agent: 'Incident Notifier',
    model: 'AST Guard Webhook',
    status: 'SAFE',
    action: 'notify_security_ops({"channel": "#security-escrow", "priority": "HIGH"})',
    reasoning: 'Dispatched signed webhook alert with FIDO2 approval link. Notification delivered in 240ms.',
    result: 'Alert Delivered to #security-escrow • Awaiting Signature',
  },
];

const GoogleLogo = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
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

const MousePointerIcon = () => (
  <svg className="w-6 h-6 text-black fill-black filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" viewBox="0 0 24 24">
    <path d="M4 2l16 11-7 1.5 4 8.5-3 1.5-4-8.5L4 19V2z" />
  </svg>
);

export const LandingHero: React.FC = () => {
  const {
    loginWithGoogle,
    loginWithEmailPassword,
    signupWithEmailPassword,
    logoutUser,
    currentUser,
    isAuthenticated,
    setIsLandingPage,
    addToast,
  } = useAppStore();

  // Auth Card State
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authName, setAuthName] = useState('');
  const [authOrg, setAuthOrg] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Video / Interactive Simulation State
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [videoProgress, setVideoProgress] = useState(14); // 0 to 42 seconds
  const [videoStep, setVideoStep] = useState<0 | 1 | 2 | 3>(1); // 0: Idle/Cursor moves, 1: Hover/Click tile, 2: Typing, 3: Executing
  const [selectedTileId, setSelectedTileId] = useState<string>('create_file');
  const [inputValue, setInputValue] = useState(ACTION_TILES[0].prompt);
  const [activeExecution, setActiveExecution] = useState<QuickTile | null>(ACTION_TILES[0]);
  const [hitlDecision, setHitlDecision] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [isExecuting, setIsExecuting] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 92, y: 140 });
  const [cursorClicking, setCursorClicking] = useState(false);

  // Auto-play video timeline loop
  useEffect(() => {
    if (!isVideoPlaying) return;

    const interval = setInterval(() => {
      setVideoProgress((prev) => {
        const next = prev >= 42 ? 0 : prev + 1;

        // Step 0 (0-4s): Cursor floats towards "Create a file"
        if (next < 5) {
          setVideoStep(0);
          setCursorPosition({ x: 75 + next * 4, y: 110 + next * 6 });
          setCursorClicking(false);
        }
        // Step 1 (5-9s): Cursor clicks "Create a file"
        else if (next < 10) {
          setVideoStep(1);
          setSelectedTileId('create_file');
          setCursorPosition({ x: 92, y: 138 });
          if (next === 6) {
            setCursorClicking(true);
            setTimeout(() => setCursorClicking(false), 300);
          }
        }
        // Step 2 (10-18s): Cursor moves to Prompt bar, types prompt
        else if (next < 19) {
          setVideoStep(2);
          setCursorPosition({ x: 260, y: 285 });
          const fullText = ACTION_TILES[0].prompt;
          const charsToShow = Math.min(fullText.length, Math.floor(((next - 10) / 8) * fullText.length));
          setInputValue(fullText.slice(0, charsToShow));
        }
        // Step 3 (19-35s): Cursor clicks "Let's go ->", execution panel pops up!
        else if (next < 36) {
          if (videoStep !== 3) {
            setVideoStep(3);
            setCursorPosition({ x: 420, y: 290 });
            setCursorClicking(true);
            setTimeout(() => setCursorClicking(false), 350);
            setActiveExecution(ACTION_TILES[0]);
          }
          // Simulate HITL approval midway
          if (next === 26) {
            setHitlDecision('APPROVED');
          }
        }
        // Step 4 (36-42s): Reset and cycle to next scenario
        else {
          setHitlDecision('PENDING');
          setVideoStep(0);
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVideoPlaying, videoStep]);

  // Click handler on tile
  const handleTileClick = (tile: QuickTile) => {
    setSelectedTileId(tile.id);
    setInputValue(tile.prompt);
    setActiveExecution(tile);
    setHitlDecision('PENDING');
    setVideoStep(3);
    setCursorClicking(true);
    setTimeout(() => setCursorClicking(false), 250);
  };

  // Submit prompt
  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setIsExecuting(true);
    setHitlDecision('PENDING');

    setTimeout(() => {
      const lower = inputValue.toLowerCase();
      let matched = ACTION_TILES[0];

      if (lower.includes('crunch') || lower.includes('data') || lower.includes('cost') || lower.includes('arbitrage')) {
        matched = ACTION_TILES[1];
      } else if (lower.includes('prototype') || lower.includes('key') || lower.includes('proxy') || lower.includes('token')) {
        matched = ACTION_TILES[2];
      } else if (lower.includes('prep') || lower.includes('audit') || lower.includes('merkle')) {
        matched = ACTION_TILES[3];
      } else if (lower.includes('clean') || lower.includes('organize') || lower.includes('memory')) {
        matched = ACTION_TILES[4];
      } else if (lower.includes('message') || lower.includes('alert') || lower.includes('slack')) {
        matched = ACTION_TILES[5];
      } else {
        matched = {
          id: 'custom_' + Date.now(),
          label: 'Custom Autonomous Task',
          iconType: 'prototype',
          prompt: inputValue,
          agent: 'Autonomous Production Agent',
          model: 'Gemini 2.0 Flash / AST Guard',
          status: 'SAFE',
          action: `execute_governed_task({"query": "${inputValue.slice(0, 40)}..."})`,
          reasoning: 'Evaluated against Zero-Trust policy semantics. Latency: 0.72ms. Merkle tree signature cryptographically validated.',
          result: 'Task Verified & Executed Safely Through Zero-Trust Gateway',
        };
      }

      setActiveExecution(matched);
      setIsExecuting(false);
      setVideoStep(3);
    }, 450);
  };

  // Real Firebase Sign In / Sign Up Handlers
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setAuthError(null);
    try {
      const res = await loginWithGoogle('PRO_MONTHLY');
      if (res.success) {
        setIsLandingPage(false);
      } else if (res.notRegistered) {
        setAuthError(`No active subscription found for ${res.email}. Please fill out the registration form to choose your package.`);
      } else if (res.isPopupBlocked) {
        setAuthError('Sign-in popup was blocked by browser or iframe settings. Please use Instant Demo Access or allow popups.');
      } else {
        setAuthError(res.error || 'Google sign-in was not completed.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Google Auth error.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim()) {
      addToast({ title: 'Email Required', description: 'Please enter your work email to continue.', type: 'warning' });
      return;
    }
    if (!authPassword) {
      addToast({ title: 'Password Required', description: 'Please enter your account password.', type: 'warning' });
      return;
    }
    setIsSubmittingAuth(true);
    setAuthError(null);
    try {
      const success = await loginWithEmailPassword(authEmail.trim(), authPassword);
      if (success) {
        setIsLandingPage(false);
      } else {
        setAuthError('Sign-in failed. Please verify credentials or use Google Auth.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim() || !authName.trim()) {
      addToast({ title: 'Missing Details', description: 'Please provide your name and work email.', type: 'warning' });
      return;
    }
    if (!authPassword || authPassword.length < 6) {
      addToast({ title: 'Password Required', description: 'Password must be at least 6 characters.', type: 'warning' });
      return;
    }
    setIsSubmittingAuth(true);
    setAuthError(null);
    try {
      const success = await signupWithEmailPassword(
        authName.trim(),
        authEmail.trim(),
        authPassword,
        authOrg.trim() || `${authName.trim()}'s Organization`,
        'PRO_MONTHLY'
      );
      if (success) {
        setIsLandingPage(false);
      } else {
        setAuthError('Could not create account. Please check your credentials or use Google Auth.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const renderTileIcon = (type: QuickTile['iconType']) => {
    switch (type) {
      case 'file':
        return <FileSpreadsheet className="w-4 h-4 text-[#878278]" />;
      case 'chart':
        return <LineChart className="w-4 h-4 text-[#878278]" />;
      case 'prototype':
        return <Layout className="w-4 h-4 text-[#878278]" />;
      case 'prep':
        return <Sunrise className="w-4 h-4 text-[#878278]" />;
      case 'folder':
        return <FolderOpen className="w-4 h-4 text-[#878278]" />;
      case 'message':
        return <MessageSquare className="w-4 h-4 text-[#878278]" />;
    }
  };

  return (
    <section className="min-h-screen flex flex-col justify-between pt-24 pb-12 sm:pt-28 sm:pb-12 relative overflow-hidden bg-[#141413] text-[#f5f3ef] transition-colors duration-200">
      {/* Subtle Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(193,95,60,0.12),transparent)] pointer-events-none" />

      {/* ========================================================================= */}
      {/* 2-COLUMN SPLIT MAIN STAGE (MATCHING CLAUDE.COM SCREENSHOT EXACTLY)        */}
      {/* ========================================================================= */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-auto z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* --------------------------------------------------------------------- */}
          {/* LEFT COLUMN: EDITORIAL TYPOGRAPHY & CLAUDE SIGN-IN CARD                */}
          {/* --------------------------------------------------------------------- */}
          <div className="lg:col-span-5 flex flex-col justify-center text-left">
            {/* Display Headline matching selected element 2 */}
            <h1 className="text-5xl sm:text-6xl md:text-[68px] font-serif font-normal text-[#f5f3ef] tracking-tight leading-[1.04] mb-4">
              Safe Agent
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#9c9689] font-normal mb-8 leading-relaxed">
              Brainstorm in chat, build safe agents in Agent Lens
            </p>

            {/* Auth Card Container matching screenshot */}
            <div className="rounded-2xl border border-[#2c2b26] bg-[#1a1917] p-5 sm:p-6 shadow-2xl max-w-md w-full">
              {isAuthenticated && currentUser ? (
                /* Authenticated State */
                <div className="space-y-4 text-center py-2">
                  <div className="w-12 h-12 rounded-full bg-[#c15f3c]/20 border border-[#c15f3c]/40 text-[#c15f3c] flex items-center justify-center mx-auto text-lg font-serif font-bold">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Authenticated Session</span>
                    </div>
                    <h3 className="font-serif text-lg text-[#f5f3ef]">
                      Welcome back, {currentUser.name}
                    </h3>
                    <p className="text-xs text-[#9c9689]">
                      {currentUser.organizationName} • {currentUser.planTier}
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-2 justify-center">
                    <button
                      onClick={() => setIsLandingPage(false)}
                      className="w-full sm:w-auto bg-white hover:bg-[#f3eee5] text-[#141413] px-6 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors"
                    >
                      <span>Enter Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#141413]" />
                    </button>
                    <button
                      onClick={() => logoutUser()}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#33312b] text-[#b8b4aa] hover:text-[#f5f3ef] text-xs cursor-pointer transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                /* Unauthenticated Sign-in Card */
                <div className="space-y-3.5">
                  {/* Error Notification */}
                  {authError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{authError}</span>
                    </div>
                  )}

                  {/* Continue with Google - Real Firebase Google Auth */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading}
                    className="w-full py-3 px-4 rounded-xl border border-[#33312b] hover:border-[#48453e] bg-[#1e1d1c] hover:bg-[#252422] text-[#f5f3ef] text-sm font-medium transition-all flex items-center justify-center gap-3 cursor-pointer shadow-sm active:scale-[0.99] disabled:opacity-60"
                  >
                    <GoogleLogo />
                    <span>{isGoogleLoading ? 'Connecting to Google Firebase Auth...' : 'Continue with Google'}</span>
                  </button>

                  {/* Centered OR Divider */}
                  <div className="relative my-2 text-center">
                    <span className="text-[11px] font-mono text-[#736e65] uppercase tracking-widest">
                      OR
                    </span>
                  </div>

                  {/* Continue with email */}
                  {!showEmailForm ? (
                    <button
                      type="button"
                      onClick={() => setShowEmailForm(true)}
                      className="w-full py-3 px-4 rounded-xl bg-white hover:bg-[#f3eee5] text-[#141413] text-sm font-semibold transition-colors flex items-center justify-center cursor-pointer shadow-sm"
                    >
                      <span>Continue with email</span>
                    </button>
                  ) : (
                    /* Seamless expanded email input */
                    <form onSubmit={isSigningUp ? handleSignUp : handleSignIn} className="space-y-3 pt-1 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between pb-1 border-b border-[#2d2c27]">
                        <span className="text-xs text-[#b8b4aa] font-medium">
                          {isSigningUp ? 'Create Workspace' : 'Sign in with work email'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setIsSigningUp(!isSigningUp);
                            setAuthError(null);
                          }}
                          className="text-[11px] text-[#c15f3c] hover:underline cursor-pointer"
                        >
                          {isSigningUp ? 'Already have account?' : 'Need an account?'}
                        </button>
                      </div>

                      {isSigningUp && (
                        <div>
                          <input
                            type="text"
                            required
                            value={authName}
                            onChange={(e) => setAuthName(e.target.value)}
                            placeholder="Your full name"
                            className="w-full px-3 py-2 rounded-lg border border-[#33312b] bg-[#141413] text-xs text-[#f5f3ef] placeholder-[#736e65] focus:outline-hidden focus:border-[#c15f3c]"
                          />
                        </div>
                      )}

                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 text-[#736e65] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          placeholder="name@organization.ai"
                          className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#33312b] bg-[#141413] text-xs text-[#f5f3ef] placeholder-[#736e65] focus:outline-hidden focus:border-[#c15f3c]"
                        />
                      </div>

                      <div className="relative">
                        <Lock className="w-3.5 h-3.5 text-[#736e65] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          placeholder={isSigningUp ? 'Password (min 6 characters)' : 'Account password'}
                          className="w-full pl-9 pr-8 py-2 rounded-lg border border-[#33312b] bg-[#141413] text-xs text-[#f5f3ef] placeholder-[#736e65] focus:outline-hidden focus:border-[#c15f3c]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#736e65] hover:text-[#b8b4aa] cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingAuth}
                        className="w-full py-2.5 rounded-lg bg-white hover:bg-[#f3eee5] text-[#141413] text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isSubmittingAuth ? (
                          <span>Verifying Firebase Credentials...</span>
                        ) : (
                          <>
                            <span>{isSigningUp ? 'Create Workspace' : 'Sign in to Console'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </form>
                  )}

                  {/* Legal disclaimer */}
                  <p className="text-[11px] text-[#736e65] text-center leading-normal pt-1">
                    By continuing, you authenticate securely with{' '}
                    <span className="text-[#b8b4aa] font-medium">Google Firebase Auth</span>.
                  </p>
                </div>
              )}
            </div>

            {/* Below Card: Download desktop app pill (as in screenshot) */}
            <div className="pt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => addToast({ title: 'Desktop App', description: 'Desktop application installer package is preparing.', type: 'info' })}
                className="px-5 py-2 rounded-full border border-[#2e2d29] hover:border-[#42403a] hover:bg-[#1e1d1b] text-[#b8b4aa] hover:text-[#f5f3ef] text-xs font-medium transition-colors cursor-pointer"
              >
                Download desktop app
              </button>
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* RIGHT COLUMN: VIDEO SIMULATION OF HOW YOU USE THE SOFTWARE             */}
          {/* --------------------------------------------------------------------- */}
          <div className="lg:col-span-7">
            {/* The Signature Rounded Cream Card with Grid Paper Texture */}
            <div className="relative rounded-3xl bg-[#fbf9f5] border border-[#e5e0d5] text-[#1f1e1b] shadow-2xl p-5 sm:p-8 min-h-[580px] flex flex-col justify-between overflow-hidden">
              {/* Grid Paper Texture (Authentic Claude.com canvas background) */}
              <div
                className="absolute inset-0 pointer-events-none opacity-60"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, rgba(0, 0, 0, 0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.045) 1px, transparent 1px)',
                  backgroundSize: '34px 34px',
                }}
              />

              {/* CENTER STAGE: THE 6 ACTION TILES (MATCHING SCREENSHOT) */}
              <div className="relative z-10 space-y-4 my-auto">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 max-w-xl mx-auto">
                  {ACTION_TILES.map((tile) => {
                    const isSelected = selectedTileId === tile.id;
                    return (
                      <button
                        key={tile.id}
                        type="button"
                        onClick={() => handleTileClick(tile)}
                        className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer flex items-center gap-2.5 ${
                          isSelected
                            ? 'bg-white border-[#c15f3c] shadow-sm ring-1 ring-[#c15f3c]/30'
                            : 'bg-white/80 hover:bg-white border-[#e5e0d5] hover:border-[#d5cfc2] shadow-xs'
                        }`}
                      >
                        <div className="p-1.5 rounded-lg bg-[#f4f1ea] border border-[#e5e0d5]">
                          {renderTileIcon(tile.iconType)}
                        </div>
                        <span className="text-xs sm:text-[13px] font-medium text-[#1f1e1b] tracking-tight">
                          {tile.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* ANIMATED CURSOR SIMULATION (AS SEEN IN SCREENSHOT OVER "CREATE A FILE") */}
                <div
                  className="absolute pointer-events-none transition-all duration-500 ease-out z-30"
                  style={{
                    left: `${cursorPosition.x}px`,
                    top: `${cursorPosition.y}px`,
                  }}
                >
                  <MousePointerIcon />
                  {cursorClicking && (
                    <span className="absolute -left-2 -top-2 w-8 h-8 rounded-full border-2 border-[#c15f3c] animate-ping" />
                  )}
                </div>

                {/* THE CLAUDE PROMPT BAR (AS SEEN IN SCREENSHOT) */}
                <div className="pt-3 max-w-xl mx-auto">
                  <div className="rounded-2xl border border-[#e5e0d5] bg-white shadow-md p-3 sm:p-4">
                    <form onSubmit={handlePromptSubmit}>
                      <div className="min-h-[44px]">
                        <textarea
                          rows={2}
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          placeholder="What would you like to build or govern today?"
                          className="w-full bg-transparent border-0 resize-none text-[13px] sm:text-sm text-[#1f1e1b] placeholder-[#878278] focus:outline-hidden focus:ring-0 leading-relaxed font-normal"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-2 mt-1 border-t border-[#f4f1ea]">
                        {/* "Work in a folder +" Pill matching screenshot */}
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#e5e0d5] bg-[#faf8f5] hover:bg-[#f4f1ea] text-[#5c5850] text-xs font-medium cursor-pointer transition-colors">
                          <Folder className="w-3.5 h-3.5 text-[#878278]" />
                          <span>Work in a folder</span>
                          <Plus className="w-3 h-3 text-[#878278] ml-0.5" />
                        </div>

                        {/* "Let's go ->" Button matching screenshot (terracotta orange) */}
                        <button
                          type="submit"
                          disabled={isExecuting || !inputValue.trim()}
                          className="px-4 py-2 rounded-xl bg-[#c15f3c] hover:bg-[#ad5232] text-white text-xs sm:text-[13px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-40"
                        >
                          <span>Let's go</span>
                          <ArrowRight className="w-3.5 h-3.5 text-white" />
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              {/* LIVE AGENT / COWORK EXECUTION PANEL (WHEN VIDEO PLAYS OR USER RUNS ACTION) */}
              {activeExecution && videoStep === 3 && (
                <div className="relative z-20 mt-4 p-4 rounded-2xl bg-white border border-[#e5e0d5] shadow-lg text-left animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-[#1f1e1b]">
                        {activeExecution.agent}
                      </span>
                      <span className="text-[#878278]">•</span>
                      <span className="font-mono text-[11px] text-[#5c5850]">
                        {activeExecution.model}
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${
                        activeExecution.status === 'INTERCEPTED'
                          ? hitlDecision === 'APPROVED'
                            ? 'border-emerald-600/30 text-emerald-700 bg-emerald-50'
                            : 'border-[#c15f3c]/40 text-[#c15f3c] bg-[#c15f3c]/10'
                          : 'border-emerald-600/30 text-emerald-700 bg-emerald-50'
                      }`}
                    >
                      {activeExecution.status === 'INTERCEPTED'
                        ? hitlDecision === 'APPROVED'
                          ? '✓ HUMAN SIGNED & APPROVED'
                          : 'ESCROW HELD (FIDO2 APPROVAL REQUIRED)'
                        : 'SAFE EXECUTION'}
                    </span>
                  </div>

                  {/* Code / Policy Preview */}
                  {activeExecution.filePreview ? (
                    <div className="p-2.5 rounded-xl bg-[#1e1d1a] text-white font-mono text-[11px] mb-2 overflow-x-auto">
                      <pre className="text-amber-300 leading-relaxed">{activeExecution.filePreview}</pre>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-[#faf8f5] border border-[#e5e0d5] font-mono text-[11px] text-[#5c5850] mb-2">
                      <span className="text-[#878278]">Action: </span>
                      <code className="text-[#c15f3c]">{activeExecution.action}</code>
                    </div>
                  )}

                  <p className="text-xs text-[#5c5850] leading-relaxed mb-2.5">
                    {activeExecution.reasoning}
                  </p>

                  {/* Human Approval Button for Wire Transfer Interception */}
                  {activeExecution.status === 'INTERCEPTED' && (
                    <div className="p-2.5 rounded-xl border border-[#c15f3c]/30 bg-[#c15f3c]/5 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-medium text-[#c15f3c]">
                        Multi-Sig Sign-off Required (Zero-Trust Policy #FIN-04)
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setHitlDecision('REJECTED')}
                          className="px-2.5 py-1 rounded-md border border-red-300 text-red-700 text-[11px] font-medium hover:bg-red-50 cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => setHitlDecision('APPROVED')}
                          className="px-3 py-1 rounded-md bg-[#c15f3c] hover:bg-[#ad5232] text-white text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          <span>Approve Wire ($14,200)</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Bottom footer badge inside video card */}
              <div className="relative z-10 flex items-center justify-between text-[11px] text-[#878278] pt-3 border-t border-[#ece8df]">
                <span>FIPS 140-3 Hardware Nitro Enclaves Quarantined</span>
                <span className="font-mono">AST Gateway Latency: &lt;0.8ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BOTTOM PROOF METRICS & ARCHITECTURE EXPLORER ANCHOR                       */}
      {/* ========================================================================= */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-5 border-t border-[#2d2c27] text-center">
          <div>
            <div className="font-serif text-2xl sm:text-3xl text-[#f5f3ef] font-normal mb-0.5">
              &lt; 0.8ms
            </div>
            <div className="text-[11px] text-[#878278]">AST Gateway Latency</div>
          </div>
          <div>
            <div className="font-serif text-2xl sm:text-3xl text-[#f5f3ef] font-normal mb-0.5">
              $0 Exfiltration
            </div>
            <div className="text-[11px] text-[#878278]">Nitro Enclaves Quarantined</div>
          </div>
          <div>
            <div className="font-serif text-2xl sm:text-3xl text-[#f5f3ef] font-normal mb-0.5">
              100%
            </div>
            <div className="text-[11px] text-[#878278]">Merkle Audit Verified</div>
          </div>
          <div>
            <div className="font-serif text-2xl sm:text-3xl text-[#f5f3ef] font-normal mb-0.5">
              68% Saved
            </div>
            <div className="text-[11px] text-[#878278]">Multi-Model Cost Arbitrage</div>
          </div>
        </div>
      </div>
    </section>
  );
};
