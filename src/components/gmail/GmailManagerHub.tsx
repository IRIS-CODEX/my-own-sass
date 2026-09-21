import React, { useState, useEffect } from 'react';
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Send,
  Trash2,
  Sparkles,
  Bot,
  ExternalLink,
  ShieldCheck,
  Inbox,
  Star,
  Clock,
  ArrowRight,
  Eye,
  FileText,
  Lock,
  Layers,
  Zap,
} from 'lucide-react';
import {
  connectGmailAccount,
  disconnectGmailAccount,
  isGmailConnected,
  getConnectedGmailEmail,
  subscribeGmailConnection,
  fetchGmailMessages,
  sendGmailMessage,
  trashGmailMessage,
  createGmailDraft,
  markGmailMessageAsRead,
  GmailMessageSummary,
} from '../../lib/gmailService';
import { useAgentsStore } from '../../stores/useAgentsStore';
import { useAppStore } from '../../stores/useAppStore';

export const GmailManagerHub: React.FC = () => {
  const { setActiveNav, addToast } = useAppStore();
  const { provisionGmailAgent } = useAgentsStore();

  const [connected, setConnected] = useState(isGmailConnected());
  const [accountEmail, setAccountEmail] = useState<string | null>(getConnectedGmailEmail());
  const [isConnecting, setIsConnecting] = useState(false);

  // Email messages state
  const [messages, setMessages] = useState<GmailMessageSummary[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'UNREAD' | 'STARRED'>('ALL');

  // Selected email detail view
  const [selectedMessage, setSelectedMessage] = useState<GmailMessageSummary | null>(null);

  // Compose Modal State
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isDraftingAI, setIsDraftingAI] = useState(false);

  // Destructive Confirmation Dialog (Mandated by Google Workspace Skill)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionType: 'SEND' | 'TRASH' | 'DISCONNECT';
    payload?: any;
  }>({
    isOpen: false,
    title: '',
    description: '',
    actionType: 'SEND',
  });

  // AI Agent Summary State
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Subscribe to connection changes
  useEffect(() => {
    const unsub = subscribeGmailConnection((isConnected, email) => {
      setConnected(isConnected);
      setAccountEmail(email);
      if (isConnected) {
        loadInbox();
      }
    });
    return () => unsub();
  }, []);

  const loadInbox = async (q = searchQuery) => {
    if (!isGmailConnected()) return;
    setIsLoadingMessages(true);
    try {
      const res = await fetchGmailMessages({ q, maxResults: 15 });
      if (res.success) {
        setMessages(res.messages);
        setUnreadCount(res.unreadCount);
      } else if (res.error) {
        console.warn('Inbox fetch message notice:', res.error);
      }
    } catch (err: any) {
      console.error('Failed to load inbox:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const res = await connectGmailAccount();
      if (res.success) {
        addToast({
          title: 'Gmail Account Connected',
          description: `Authorized management for ${res.email || 'your account'} under zero-trust governance.`,
          type: 'success',
        });
        loadInbox();
      } else {
        addToast({
          title: 'Connection Cancelled',
          description: res.error || 'Google authorization was not completed.',
          type: 'error',
        });
      }
    } catch (err: any) {
      addToast({
        title: 'Connection Error',
        description: err.message || 'Failed to authenticate with Google.',
        type: 'error',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnectGmailAccount();
    setMessages([]);
    setSelectedMessage(null);
    setAiSummary(null);
    addToast({
      title: 'Gmail Disconnected',
      description: 'In-memory OAuth session purged safely.',
      type: 'info',
    });
  };

  const handleLaunchAgent = async () => {
    const agent = await provisionGmailAgent();
    addToast({
      title: 'Gmail Agent Activated',
      description: `Executive-Gmail-Inbox-Pilot provisioned with live Gmail tool access.`,
      type: 'success',
    });
    setActiveNav('chat');
  };

  const handleSummarizeInboxWithAI = async () => {
    if (messages.length === 0) {
      addToast({ title: 'Inbox Empty', description: 'No emails to summarize.', type: 'info' });
      return;
    }
    setIsSummarizing(true);
    try {
      // Build text representation of emails
      const emailDigest = messages
        .slice(0, 6)
        .map((m, i) => `${i + 1}. From: ${m.from} | Subject: "${m.subject}" | Date: ${m.date}\nPreview: ${m.snippet}`)
        .join('\n\n');

      const res = await fetch('/api/agents/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentName: 'Executive-Gmail-Inbox-Pilot',
          systemPrompt: 'You are the Executive Gmail Inbox Pilot. Summarize the user inbox digest concisely with bullet points: High Priority Action Items, Inquiries, and General Updates.',
          message: `Please summarize my current unread inbox and give me actionable next steps for these emails:\n\n${emailDigest}`,
        }),
      });

      const data = await res.json();
      setAiSummary(data.content || 'Inbox summarized successfully.');
    } catch (err) {
      setAiSummary('Failed to generate AI inbox summary. Please try again.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleDraftAIReply = async (msg: GmailMessageSummary) => {
    setIsDraftingAI(true);
    setComposeOpen(true);
    setComposeTo(msg.from);
    setComposeSubject(`Re: ${msg.subject.replace(/^Re:\s*/i, '')}`);
    setComposeBody('Generating intelligent response...');

    try {
      const res = await fetch('/api/agents/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentName: 'Executive-Gmail-Inbox-Pilot',
          systemPrompt: 'You are an executive email assistant. Draft a polite, concise, and professional reply.',
          message: `Draft a professional email reply to this incoming message:\nFrom: ${msg.from}\nSubject: ${msg.subject}\nContent: ${msg.snippet}`,
        }),
      });
      const data = await res.json();
      setComposeBody(data.content || 'Thank you for your email. I have received your message and will follow up shortly.');
    } catch {
      setComposeBody('Thank you for reaching out. I will review this and respond shortly.');
    } finally {
      setIsDraftingAI(false);
    }
  };

  const requestSendConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo.trim() || !composeSubject.trim() || !composeBody.trim()) {
      addToast({ title: 'Validation Error', description: 'Please fill in To, Subject, and Body.', type: 'error' });
      return;
    }
    setConfirmDialog({
      isOpen: true,
      title: 'Send Email via Gmail?',
      description: `You are about to dispatch an email to "${composeTo}" with subject "${composeSubject}". This will send from your authorized Gmail account.`,
      actionType: 'SEND',
    });
  };

  const requestTrashConfirmation = (msg: GmailMessageSummary) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Move Email to Trash?',
      description: `Are you sure you want to move the message "${msg.subject}" from "${msg.from}" to Gmail Trash?`,
      actionType: 'TRASH',
      payload: msg.id,
    });
  };

  const handleExecuteConfirmedAction = async () => {
    const { actionType, payload } = confirmDialog;
    setConfirmDialog({ ...confirmDialog, isOpen: false });

    if (actionType === 'SEND') {
      setIsSending(true);
      try {
        const formattedHtml = `<div style="font-family: sans-serif; line-height: 1.6; color: #1f1e1b;">${composeBody.replace(/\n/g, '<br/>')}</div>`;
        const res = await sendGmailMessage({
          to: composeTo,
          subject: composeSubject,
          htmlContent: formattedHtml,
        });

        if (res.success) {
          addToast({ title: 'Email Sent Successfully', description: `Transmitted via Gmail API (ID: ${res.messageId})`, type: 'success' });
          setComposeOpen(false);
          setComposeTo('');
          setComposeSubject('');
          setComposeBody('');
        } else {
          addToast({ title: 'Send Failed', description: res.error || 'Failed to dispatch email.', type: 'error' });
        }
      } catch (err: any) {
        addToast({ title: 'Error', description: err.message, type: 'error' });
      } finally {
        setIsSending(false);
      }
    } else if (actionType === 'TRASH') {
      const msgId = payload;
      try {
        const res = await trashGmailMessage(msgId);
        if (res.success) {
          setMessages((prev) => prev.filter((m) => m.id !== msgId));
          if (selectedMessage?.id === msgId) setSelectedMessage(null);
          addToast({ title: 'Message Trashed', description: 'Email moved to Gmail Trash.', type: 'info' });
        } else {
          addToast({ title: 'Trash Failed', description: res.error || 'Could not move message to trash.', type: 'error' });
        }
      } catch (err: any) {
        addToast({ title: 'Error', description: err.message, type: 'error' });
      }
    } else if (actionType === 'DISCONNECT') {
      handleDisconnect();
    }
  };

  const filteredMessages = messages.filter((m) => {
    if (activeFilter === 'UNREAD') return m.isUnread;
    if (activeFilter === 'STARRED') return m.labelIds.includes('STARRED');
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-[#d97706] dark:text-[#f59e0b] border border-amber-500/20 flex items-center justify-center">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-[#1f1e1b] dark:text-[#f5f3ef]">
                Personal Gmail & Autonomous Agent Hub
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-[#d97706] dark:text-[#f59e0b] border border-amber-500/20">
                OAuth 2.0 Governed
              </span>
            </div>
            <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa] mt-0.5">
              Connect your personal Gmail account to empower autonomous AI agents with inbox reading, smart drafting, and transactional invoice delivery.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {connected ? (
            <>
              <button
                type="button"
                onClick={handleLaunchAgent}
                className="px-4 py-2 rounded-xl bg-[#d97706] hover:bg-[#b45309] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <Bot className="w-4 h-4" />
                <span>Launch Gmail AI Agent</span>
              </button>
              <button
                type="button"
                onClick={() => setComposeOpen(true)}
                className="px-3.5 py-2 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715] hover:bg-[#f4f1ea] dark:hover:bg-[#282622] text-[#1f1e1b] dark:text-[#f5f3ef] text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Compose</span>
              </button>
            </>
          ) : null}
        </div>
      </div>

      {/* Connection State Banner */}
      <div
        className={`p-6 rounded-3xl border transition-all ${
          connected
            ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20'
            : 'bg-[#faf8f5] dark:bg-[#181715] border-[#e5e0d5] dark:border-[#33302b]'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            {connected ? (
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-amber-500/10 text-[#d97706] dark:text-[#f59e0b] mt-0.5">
                <Lock className="w-5 h-5" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                  {connected ? 'Personal Gmail Account Connected' : 'Connect Personal Gmail Account'}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    connected
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-500/20 text-amber-800 dark:text-amber-300'
                  }`}
                >
                  {connected ? 'Active In-Memory Session' : 'Permission Required'}
                </span>
              </div>
              <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa] mt-1">
                {connected
                  ? `Authorized account: ${accountEmail}. Tokens are held strictly in memory with zero persistence for maximum privacy.`
                  : 'Grant read, compose, and send permissions to let the AI agent summarize threads, draft replies, and deliver subscription receipts.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            {connected ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => loadInbox()}
                  disabled={isLoadingMessages}
                  className="px-3 py-2 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] text-xs font-semibold text-[#5c5850] dark:text-[#b8b4aa] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMessages ? 'animate-spin' : ''}`} />
                  <span>Sync</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setConfirmDialog({
                      isOpen: true,
                      title: 'Disconnect Gmail?',
                      description: 'This will purge the in-memory access token. The AI agent will no longer be able to read or draft emails until re-authenticated.',
                      actionType: 'DISCONNECT',
                    })
                  }
                  className="px-3 py-2 rounded-xl border border-rose-500/20 text-rose-600 dark:text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              /* Official Sign In with Google Button Style mandated by workspace-integration skill */
              <button
                type="button"
                onClick={handleConnect}
                disabled={isConnecting}
                className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] hover:bg-[#faf8f5] dark:hover:bg-[#181715] text-[#1f1e1b] dark:text-[#f5f3ef] text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4 shrink-0">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
                <span>{isConnecting ? 'Authenticating with Google...' : 'Sign in with Google (Connect Gmail)'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* AI Inbox Insights Bar */}
      {connected && (
        <div className="p-5 rounded-3xl bg-amber-500/5 border border-amber-500/20 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#d97706] dark:text-[#f59e0b]" />
              <span className="text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                Executive AI Inbox Pilot Insights
              </span>
            </div>
            <button
              type="button"
              onClick={handleSummarizeInboxWithAI}
              disabled={isSummarizing || messages.length === 0}
              className="px-3 py-1.5 rounded-xl bg-[#d97706] hover:bg-[#b45309] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isSummarizing ? 'Analyzing Inbox Digest...' : 'Scan & Summarize Inbox with AI'}</span>
            </button>
          </div>

          {aiSummary ? (
            <div className="p-4 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] text-xs leading-relaxed text-[#1f1e1b] dark:text-[#f5f3ef] whitespace-pre-line shadow-xs font-medium">
              {aiSummary}
            </div>
          ) : (
            <p className="text-[11px] text-[#5c5850] dark:text-[#b8b4aa]">
              Click "Scan & Summarize" to let the agent triage your unread emails, extract urgent deadlines, and propose responses.
            </p>
          )}
        </div>
      )}

      {/* Main Inbox Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Message List */}
        <div className="lg:col-span-7 space-y-3">
          {/* Filter and Search Toolbar */}
          <div className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-[#878278] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadInbox(searchQuery)}
                placeholder="Search Gmail messages (press Enter)..."
                disabled={!connected}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-transparent text-[#1f1e1b] dark:text-[#f5f3ef] placeholder:text-[#878278] focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeFilter === 'ALL'
                    ? 'bg-[#faf8f5] dark:bg-[#181715] text-[#d97706] dark:text-[#f59e0b] shadow-xs'
                    : 'text-[#878278]'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('UNREAD')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                  activeFilter === 'UNREAD'
                    ? 'bg-[#faf8f5] dark:bg-[#181715] text-[#d97706] dark:text-[#f59e0b] shadow-xs'
                    : 'text-[#878278]'
                }`}
              >
                <span>Unread</span>
                {unreadCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Email Messages Container */}
          <div className="rounded-3xl border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] overflow-hidden shadow-xs">
            {!connected ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] flex items-center justify-center text-[#878278]">
                  <Lock className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">Gmail Access Locked</h4>
                <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa] max-w-sm mx-auto">
                  Connect your personal Gmail above using Google Sign-In to view your inbox messages and unlock agent automation.
                </p>
                <button
                  type="button"
                  onClick={handleConnect}
                  className="px-4 py-2 rounded-xl bg-[#d97706] text-white text-xs font-bold hover:bg-[#b45309] transition-colors cursor-pointer shadow-xs"
                >
                  Connect Now
                </button>
              </div>
            ) : isLoadingMessages ? (
              <div className="p-12 text-center space-y-2">
                <div className="w-6 h-6 mx-auto border-2 border-[#d97706] border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa]">Fetching messages from Gmail API...</p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <Inbox className="w-8 h-8 mx-auto text-[#878278]" />
                <p className="text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">No messages found</p>
                <p className="text-[11px] text-[#5c5850] dark:text-[#b8b4aa]">
                  Your inbox matching this query is currently empty or caught up.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#e5e0d5] dark:divide-[#33302b]">
                {filteredMessages.map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => setSelectedMessage(msg)}
                    className={`p-4 transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      selectedMessage?.id === msg.id
                        ? 'bg-amber-500/10 dark:bg-amber-500/15'
                        : msg.isUnread
                        ? 'bg-[#faf8f5] dark:bg-[#181715] hover:bg-amber-500/5'
                        : 'hover:bg-[#faf8f5] dark:hover:bg-[#181715]'
                    }`}
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        {msg.isUnread && (
                          <span className="w-2 h-2 rounded-full bg-[#d97706] shrink-0" />
                        )}
                        <span className={`text-xs truncate ${msg.isUnread ? 'font-bold text-[#1f1e1b] dark:text-[#f5f3ef]' : 'text-[#5c5850] dark:text-[#b8b4aa]'}`}>
                          {msg.from}
                        </span>
                        <span className="text-[10px] text-[#878278] dark:text-[#7d7970] shrink-0 ml-auto font-mono">
                          {msg.date.slice(0, 16)}
                        </span>
                      </div>
                      <h4 className={`text-xs truncate ${msg.isUnread ? 'font-bold text-[#1f1e1b] dark:text-[#f5f3ef]' : 'text-[#1f1e1b] dark:text-[#f5f3ef]'}`}>
                        {msg.subject}
                      </h4>
                      <p className="text-[11px] text-[#5c5850] dark:text-[#b8b4aa] line-clamp-1">
                        {msg.snippet}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDraftAIReply(msg);
                        }}
                        className="p-1.5 rounded-lg border border-[#e5e0d5] dark:border-[#33302b] hover:bg-amber-500/10 text-[#d97706] dark:text-[#f59e0b] transition-colors cursor-pointer"
                        title="AI Draft Reply"
                      >
                        <Bot className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          requestTrashConfirmation(msg);
                        }}
                        className="p-1.5 rounded-lg border border-transparent hover:border-rose-500/20 hover:bg-rose-500/10 text-[#878278] hover:text-rose-600 transition-colors cursor-pointer"
                        title="Move to Trash"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Selected Message Detail Viewer */}
        <div className="lg:col-span-5">
          <div className="rounded-3xl border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] p-5 space-y-4 shadow-xs min-h-[420px] flex flex-col justify-between">
            {selectedMessage ? (
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2 border-b border-[#e5e0d5] dark:border-[#33302b] pb-3">
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                        {selectedMessage.subject}
                      </h3>
                      <div className="text-xs text-[#5c5850] dark:text-[#b8b4aa] mt-1 space-y-0.5 font-medium">
                        <div>From: <strong className="text-[#1f1e1b] dark:text-[#f5f3ef]">{selectedMessage.from}</strong></div>
                        <div>Date: <span className="font-mono text-[11px]">{selectedMessage.date}</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 rounded-2xl bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] text-xs text-[#1f1e1b] dark:text-[#f5f3ef] leading-relaxed max-h-72 overflow-y-auto font-sans">
                    {selectedMessage.fullBodyHtml ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: selectedMessage.fullBodyHtml }}
                        className="prose prose-sm dark:prose-invert max-w-none text-xs"
                      />
                    ) : (
                      <p className="whitespace-pre-line">{selectedMessage.snippet || selectedMessage.bodyPreview}</p>
                    )}
                  </div>
                </div>

                {/* Agent Action Buttons for Selected Email */}
                <div className="pt-3 border-t border-[#e5e0d5] dark:border-[#33302b] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleDraftAIReply(selectedMessage)}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#d97706] hover:bg-[#b45309] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>AI Draft Reply</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => requestTrashConfirmation(selectedMessage)}
                    className="p-2 rounded-xl border border-rose-500/20 text-rose-600 dark:text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 text-xs transition-colors cursor-pointer"
                    title="Trash Message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-2 text-[#878278]">
                <FileText className="w-8 h-8 opacity-40" />
                <h4 className="text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">Select an Email Message</h4>
                <p className="text-[11px] text-[#5c5850] dark:text-[#b8b4aa]">
                  Click any message on the left to read its full content, trigger AI analysis, or draft a governed response.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compose Modal */}
      {composeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-2xl p-6 space-y-4 text-[#1f1e1b] dark:text-[#f5f3ef]">
            <div className="flex items-center justify-between border-b border-[#e5e0d5] dark:border-[#33302b] pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-[#d97706] dark:text-[#f59e0b]" />
                <h3 className="font-bold text-sm">Compose Governed Email (Gmail API)</h3>
              </div>
              <button
                type="button"
                onClick={() => setComposeOpen(false)}
                className="text-[#878278] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef] text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={requestSendConfirmation} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#5c5850] dark:text-[#b8b4aa] mb-1">To</label>
                <input
                  type="email"
                  required
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  placeholder="recipient@example.com"
                  className="w-full px-3 py-2 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715] text-xs text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:border-[#d97706]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#5c5850] dark:text-[#b8b4aa] mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="Subject Line"
                  className="w-full px-3 py-2 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715] text-xs text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:border-[#d97706]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-[#5c5850] dark:text-[#b8b4aa]">Message Body</label>
                  {isDraftingAI && (
                    <span className="text-[10px] text-[#d97706] dark:text-[#f59e0b] font-mono animate-pulse">
                      AI is drafting response...
                    </span>
                  )}
                </div>
                <textarea
                  required
                  rows={6}
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Write message here..."
                  className="w-full p-3 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715] text-xs text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:border-[#d97706]"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] text-[#878278] dark:text-[#7d7970] font-mono">
                  Sender: <strong>{accountEmail || 'Authorized Gmail'}</strong>
                </span>
                <button
                  type="submit"
                  disabled={isSending}
                  className="px-4 py-2 rounded-xl bg-[#d97706] hover:bg-[#b45309] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Review & Send</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog Modal (MANDATORY per Workspace Skill) */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] p-6 space-y-4 shadow-2xl text-[#1f1e1b] dark:text-[#f5f3ef]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 text-[#d97706] dark:text-[#f59e0b] border border-amber-500/20">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold">{confirmDialog.title}</h3>
                <p className="text-[11px] text-[#878278] dark:text-[#7d7970] font-mono">
                  Human-In-The-Loop Verification
                </p>
              </div>
            </div>

            <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa] leading-relaxed font-medium">
              {confirmDialog.description}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                className="px-4 py-2 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715] hover:bg-[#f4f1ea] dark:hover:bg-[#282622] text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteConfirmedAction}
                className="px-4 py-2 rounded-xl bg-[#d97706] hover:bg-[#b45309] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Confirm & Execute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
