import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Zap,
  Shield,
  Layers,
  History,
  Trash2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  Plus,
  Play,
  RotateCcw,
  Sliders,
  X,
  Code2,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Palette,
  Terminal,
  Cpu,
  GripVertical,
  Maximize2,
  Minimize2,
  MoveHorizontal,
  PanelRightClose,
  Github,
  Download,
  GitBranch,
} from 'lucide-react';
import { useWorkflowStore } from '../../stores/useWorkflowStore';
import { useAgentsStore } from '../../stores/useAgentsStore';
import { useGitHubStore } from '../../stores/useGitHubStore';
import { GeneratedCodeViewer } from './GeneratedCodeViewer';
import { GitHubSyncModal } from './GitHubSyncModal';

export const WorkflowAgentSidebar: React.FC = () => {
  const {
    agentSidebarOpen,
    setAgentSidebarOpen,
    agentSidebarTab,
    setAgentSidebarTab,
    selectedAgentId,
    setSelectedAgentId,
    agentMessages,
    aiBuildHistory,
    isAgentThinking,
    agentThinkingStep,
    sendWorkflowAgentMessage,
    clearAgentMessages,
    revertBuildAction,
    focusNode,
    nodes,
  } = useWorkflowStore();

  const { agents } = useAgentsStore();
  const { setGitHubModalOpen, owner, repo, branch, lastCommitSha } = useGitHubStore();

  const [inputVal, setInputVal] = useState('');
  const [collapsedThoughts, setCollapsedThoughts] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Flexible / Resizable width state (min 280px, max 850px)
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('agent_sidebar_width');
      return saved ? Math.min(850, Math.max(280, Number(saved))) : 400;
    } catch {
      return 400;
    }
  });
  const [isResizing, setIsResizing] = useState(false);

  // Resize mouse/touch listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      const maxWidth = Math.min(850, window.innerWidth - 280);
      const clampedWidth = Math.max(280, Math.min(maxWidth, newWidth));
      setSidebarWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        try {
          localStorage.setItem('agent_sidebar_width', String(sidebarWidth));
        } catch {}
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isResizing || !e.touches[0]) return;
      const newWidth = window.innerWidth - e.touches[0].clientX;
      const maxWidth = Math.min(850, window.innerWidth - 200);
      const clampedWidth = Math.max(280, Math.min(maxWidth, newWidth));
      setSidebarWidth(clampedWidth);
    };

    const handleTouchEnd = () => {
      if (isResizing) {
        setIsResizing(false);
      }
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, sidebarWidth]);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const startTouchResizing = (e: React.TouchEvent) => {
    setIsResizing(true);
  };

  const setPresetWidth = (w: number) => {
    setSidebarWidth(w);
    try {
      localStorage.setItem('agent_sidebar_width', String(w));
    } catch {}
  };

  const resetWidth = () => {
    setPresetWidth(400);
  };

  // Available agent options
  const defaultAgentOptions = [
    { id: 'archon-workflow', name: 'Archon (Workflow Architect)', archetype: 'ORCHESTRATOR', model: 'gemini-2.0-flash' },
    { id: 'apex-coder', name: 'Apex (Master Coder & Builder)', archetype: 'CODER', model: 'gemini-2.0-flash' },
    { id: 'secguard-zero-trust', name: 'SecGuard (Zero-Trust Officer)', archetype: 'SECURITY', model: 'claude-3-5-sonnet' },
    { id: 'finops-cost', name: 'FinOps (Cost Engine)', archetype: 'ANALYST', model: 'gpt-4o' },
  ];

  const combinedAgents = [
    ...defaultAgentOptions,
    ...agents.filter((a) => !defaultAgentOptions.some((d) => d.id === a.id)).map((a) => ({
      id: a.id,
      name: a.name,
      archetype: a.archetype,
      model: a.model,
    })),
  ];

  const currentAgent = combinedAgents.find((a) => a.id === selectedAgentId) || combinedAgents[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [agentMessages, isAgentThinking]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputVal;
    if (!text.trim() || isAgentThinking) return;

    setInputVal('');
    await sendWorkflowAgentMessage(text, currentAgent.name);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleThought = (msgId: string) => {
    setCollapsedThoughts((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  // Keyboard shortcut (Cmd/Ctrl + B) to toggle AI builder sidebar
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setAgentSidebarOpen(!agentSidebarOpen);
      }
      if (e.key === 'Escape' && agentSidebarOpen) {
        // Only if not currently in a modal
        const activeEl = document.activeElement;
        if (activeEl?.tagName !== 'INPUT' && activeEl?.tagName !== 'TEXTAREA') {
          setAgentSidebarOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [agentSidebarOpen, setAgentSidebarOpen]);

  // If closed / hidden: render a floating docked toggle button on the right edge
  if (!agentSidebarOpen) {
    return (
      <div className="absolute right-0 top-1/2 -translate-y-1/2 z-30 flex items-center">
        <button
          id="btn-summon-workflow-agent"
          onClick={() => setAgentSidebarOpen(true)}
          className="group relative flex items-center gap-2 py-3 px-2 rounded-l-2xl bg-white dark:bg-[#1c1b18] border-y border-l border-[#e5e0d5] dark:border-[#33302b] shadow-xl hover:shadow-2xl hover:border-[#c15f3c] transition-all cursor-pointer select-none"
          title="Open AI Builder Sidebar (Shortcut: Ctrl+B or Cmd+B)"
        >
          {/* Pulsing indicator */}
          <span className="absolute -top-1 -left-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c15f3c] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#c15f3c]"></span>
          </span>

          <div className="flex flex-col items-center gap-1.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#c15f3c] to-amber-500 text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <Bot className="w-4 h-4" />
            </div>

            <span className="[writing-mode:vertical-lr] text-[11px] font-bold tracking-wider uppercase text-[#5c5850] dark:text-[#b8b4aa] group-hover:text-[#c15f3c] transition-colors py-1">
              AI Builder
            </span>

            {aiBuildHistory.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#c15f3c]/15 text-[#c15f3c]">
                {aiBuildHistory.length}
              </span>
            )}
          </div>
        </button>
      </div>
    );
  }

  return (
    <aside
      id="workflow-agent-chat-sidebar"
      style={{ width: `${sidebarWidth}px` }}
      className={`flex-shrink-0 border-l border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#1c1b18] flex flex-col h-full z-20 shadow-lg select-none relative transition-[width] ${
        isResizing ? 'transition-none pointer-events-auto' : 'duration-150 ease-out'
      }`}
    >
      {/* ========================================================================= */}
      {/* LEFT DRAG-TO-RESIZE HANDLE BAR                                            */}
      {/* ========================================================================= */}
      <div
        onMouseDown={startResizing}
        onTouchStart={startTouchResizing}
        onDoubleClick={resetWidth}
        className={`absolute -left-2 top-0 bottom-0 w-4 cursor-col-resize z-30 group flex items-center justify-center select-none transition-colors ${
          isResizing ? 'bg-[#c15f3c]/20' : 'hover:bg-[#c15f3c]/15'
        }`}
        title="Drag left/right to resize AI Builder panel (Double-click to reset to 400px)"
      >
        <div
          className={`w-1 rounded-full transition-all flex flex-col items-center justify-center gap-1 ${
            isResizing
              ? 'h-16 bg-[#c15f3c] shadow-md shadow-[#c15f3c]/40'
              : 'h-10 bg-[#e5e0d5] dark:bg-[#33302b] group-hover:bg-[#c15f3c] group-hover:h-14'
          }`}
        >
          <GripVertical className="w-2.5 h-2.5 text-white opacity-90" />
        </div>
      </div>

      {/* 1. Header: Agent Selector & Tab Bar */}
      <div className="p-3 border-b border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5]/90 dark:bg-[#181715]/90 flex-shrink-0">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#c15f3c] text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <select
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef] bg-transparent border-none focus:outline-none cursor-pointer truncate max-w-[170px] block"
              >
                {combinedAgents.map((ag) => (
                  <option key={ag.id} value={ag.id} className="dark:bg-[#211f1c]">
                    {ag.name}
                  </option>
                ))}
              </select>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono truncate">
                {currentAgent.model}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setGitHubModalOpen(true)}
              className="w-7 h-7 rounded-lg hover:bg-[#e5e0d5]/50 dark:hover:bg-[#33302b] text-[#5c5850] dark:text-[#b8b4aa] flex items-center justify-center transition-colors cursor-pointer"
              title={`Sync AI Agent Code to GitHub (${owner}/${repo}@${branch})`}
            >
              <Github className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={clearAgentMessages}
              className="w-7 h-7 rounded-lg hover:bg-[#e5e0d5]/50 dark:hover:bg-[#33302b] text-[#5c5850] dark:text-[#b8b4aa] flex items-center justify-center transition-colors cursor-pointer"
              title="Clear conversation history"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setAgentSidebarOpen(false)}
              className="w-7 h-7 rounded-lg hover:bg-[#e5e0d5]/50 dark:hover:bg-[#33302b] text-[#5c5850] dark:text-[#b8b4aa] flex items-center justify-center transition-colors cursor-pointer"
              title="Close sidebar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center p-0.5 rounded-xl bg-[#f4f1ea] dark:bg-[#24221f] text-[11px] font-medium text-[#878278] dark:text-[#9e998f]">
          <button
            onClick={() => setAgentSidebarTab('chat')}
            className={`flex-1 py-1 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              agentSidebarTab === 'chat'
                ? 'bg-white dark:bg-[#1c1b18] text-[#1f1e1b] dark:text-[#f5f3ef] shadow-2xs font-semibold'
                : 'hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef]'
            }`}
          >
            <Sparkles className="w-3 h-3 text-[#c15f3c]" />
            <span>Builder</span>
          </button>
          <button
            onClick={() => setAgentSidebarTab('builds')}
            className={`flex-1 py-1 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              agentSidebarTab === 'builds'
                ? 'bg-white dark:bg-[#1c1b18] text-[#1f1e1b] dark:text-[#f5f3ef] shadow-2xs font-semibold'
                : 'hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef]'
            }`}
          >
            <History className="w-3 h-3 text-[#d97706]" />
            <span>History ({aiBuildHistory.length})</span>
          </button>
          <button
            onClick={() => setAgentSidebarTab('fleet')}
            className={`flex-1 py-1 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              agentSidebarTab === 'fleet'
                ? 'bg-white dark:bg-[#1c1b18] text-[#1f1e1b] dark:text-[#f5f3ef] shadow-2xs font-semibold'
                : 'hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef]'
            }`}
          >
            <Sliders className="w-3 h-3 text-indigo-500" />
            <span>Fleet</span>
          </button>
        </div>
      </div>

      {/* 2. Main Content Area */}
      {agentSidebarTab === 'chat' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Scrollable Message History */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-4 text-xs">
            {agentMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* Sender Info */}
                {msg.sender === 'agent' && (
                  <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] font-mono text-[#878278] dark:text-[#9e998f]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c15f3c]" />
                    <span className="font-bold">{msg.agentName || 'Workflow AI'}</span>
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`max-w-[92%] rounded-2xl p-3 leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#c15f3c] text-white rounded-br-xs shadow-xs'
                      : 'bg-[#f4f1ea] dark:bg-[#262421] text-[#1f1e1b] dark:text-[#f5f3ef] rounded-bl-xs border border-[#e5e0d5] dark:border-[#33302b]'
                  }`}
                >
                  {/* Thought Collapsible if Agent */}
                  {msg.thought && (
                    <div className="mb-2 pb-2 border-b border-[#e5e0d5]/60 dark:border-[#33302b]/60">
                      <button
                        onClick={() => toggleThought(msg.id)}
                        className="flex items-center gap-1 text-[10px] font-mono text-[#878278] dark:text-[#9e998f] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef] cursor-pointer"
                      >
                        {collapsedThoughts[msg.id] ? (
                          <ChevronRight className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                        <span className="uppercase font-bold">Reasoning & Plan</span>
                      </button>
                      {!collapsedThoughts[msg.id] && (
                        <div className="mt-1 p-2 rounded-lg bg-black/5 dark:bg-black/20 text-[10.5px] font-mono text-[#5c5850] dark:text-[#b8b4aa] leading-normal">
                          {msg.thought}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Main text content formatted */}
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {/* Generated Code & n8n / GitHub Artifacts */}
                  {msg.generatedCodeBundle && (
                    <GeneratedCodeViewer bundle={msg.generatedCodeBundle} />
                  )}

                  {/* Visual Action / Build Card Embedded */}
                  {msg.actionsTaken && msg.actionsTaken.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-[#e5e0d5]/80 dark:border-[#33302b]/80 flex flex-col gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Actions Executed On Canvas:
                      </span>
                      {msg.actionsTaken.map((act) => (
                        <div
                          key={act.id}
                          className="p-2 rounded-xl bg-white/90 dark:bg-[#1f1d1a]/90 border border-emerald-500/30 text-[11px] shadow-2xs flex flex-col gap-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                              {act.title}
                            </span>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold">
                              {act.actionType}
                            </span>
                          </div>
                          <p className="text-[10.5px] text-[#5c5850] dark:text-[#b8b4aa]">
                            {act.description}
                          </p>
                          {act.nodeIds && act.nodeIds.length > 0 && (
                            <button
                              onClick={() => focusNode(act.nodeIds![0])}
                              className="mt-1 self-start px-2 py-0.5 rounded-md bg-[#c15f3c]/10 hover:bg-[#c15f3c]/20 text-[#c15f3c] text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <ExternalLink className="w-2.5 h-2.5" />
                              <span>Focus Node on Canvas</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Clean Suggested Starters */}
                {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                  <div className="mt-2 flex flex-col gap-1 w-full max-w-[92%]">
                    <span className="text-[10px] font-mono text-[#878278] dark:text-[#9e998f] px-0.5">
                      Suggested actions:
                    </span>
                    <div className="grid grid-cols-1 gap-1">
                      {msg.suggestedPrompts.map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(prompt)}
                          className="text-left text-[11px] px-2.5 py-1.5 rounded-lg bg-white/70 dark:bg-[#211f1c]/70 hover:bg-[#c15f3c]/10 hover:border-[#c15f3c]/30 text-[#1f1e1b] dark:text-[#f5f3ef] border border-[#e5e0d5] dark:border-[#33302b] cursor-pointer transition-all flex items-center justify-between group shadow-2xs"
                        >
                          <span className="truncate">{prompt}</span>
                          <ChevronRight className="w-3 h-3 text-[#878278] group-hover:text-[#c15f3c] transition-colors flex-shrink-0 ml-1" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Live Agent Thinking Indicator */}
            {isAgentThinking && (
              <div className="flex items-start gap-2 p-3 rounded-2xl bg-[#f4f1ea] dark:bg-[#262421] border border-[#e5e0d5] dark:border-[#33302b] animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 text-[#c15f3c] animate-spin mt-0.5" />
                <div className="flex-1">
                  <div className="text-[11px] font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                    AI Agent is building...
                  </div>
                  <div className="text-[10px] font-mono text-[#878278] dark:text-[#9e998f]">
                    {agentThinkingStep || 'Synthesizing graph changes...'}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Unified Composer Container with Quick Insert */}
          <div className="p-3 border-t border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#1c1b18] flex-shrink-0 space-y-2">
            {/* Quick Insert Shortcuts */}
            <div className="flex items-center gap-1 overflow-x-auto text-[10px] no-scrollbar">
              <span className="text-[#878278] dark:text-[#7d7970] font-mono flex-shrink-0 mr-1">Insert:</span>
              <button
                onClick={() => handleSend('Add Google Gemini 2.0 Flash node')}
                className="px-2 py-0.5 rounded-md bg-[#faf8f5] dark:bg-[#211f1c] hover:bg-[#f0ebe1] dark:hover:bg-[#2a2824] text-[#5c5850] dark:text-[#b8b4aa] hover:text-[#c15f3c] cursor-pointer transition-colors font-medium flex items-center gap-1 border border-[#e5e0d5]/70 dark:border-[#33302b]/70 flex-shrink-0"
              >
                <Sparkles className="w-2.5 h-2.5 text-[#c15f3c]" />
                Gemini
              </button>
              <button
                onClick={() => handleSend('Add Google Imagen 3 node')}
                className="px-2 py-0.5 rounded-md bg-[#faf8f5] dark:bg-[#211f1c] hover:bg-[#f0ebe1] dark:hover:bg-[#2a2824] text-[#5c5850] dark:text-[#b8b4aa] hover:text-[#c15f3c] cursor-pointer transition-colors font-medium flex items-center gap-1 border border-[#e5e0d5]/70 dark:border-[#33302b]/70 flex-shrink-0"
              >
                <Palette className="w-2.5 h-2.5 text-[#d97706]" />
                Imagen
              </button>
              <button
                onClick={() => handleSend('Add Stripe Treasury node')}
                className="px-2 py-0.5 rounded-md bg-[#faf8f5] dark:bg-[#211f1c] hover:bg-[#f0ebe1] dark:hover:bg-[#2a2824] text-[#5c5850] dark:text-[#b8b4aa] hover:text-[#c15f3c] cursor-pointer transition-colors font-medium flex items-center gap-1 border border-[#e5e0d5]/70 dark:border-[#33302b]/70 flex-shrink-0"
              >
                <CreditCard className="w-2.5 h-2.5 text-emerald-600" />
                Stripe
              </button>
              <button
                onClick={() => handleSend('Add AST Zero-Trust Policy Filter')}
                className="px-2 py-0.5 rounded-md bg-[#faf8f5] dark:bg-[#211f1c] hover:bg-[#f0ebe1] dark:hover:bg-[#2a2824] text-[#5c5850] dark:text-[#b8b4aa] hover:text-[#c15f3c] cursor-pointer transition-colors font-medium flex items-center gap-1 border border-[#e5e0d5]/70 dark:border-[#33302b]/70 flex-shrink-0"
              >
                <ShieldCheck className="w-2.5 h-2.5 text-indigo-500" />
                Policy
              </button>
            </div>

            {/* Chat Input Field */}
            <div className="relative rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#211f1c] focus-within:border-[#c15f3c] focus-within:ring-1 focus-within:ring-[#c15f3c] transition-all p-1.5">
              <textarea
                ref={inputRef}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask ${currentAgent.name.split(' ')[0]} to build or modify flow...`}
                rows={2}
                className="w-full bg-transparent border-none text-xs text-[#1f1e1b] dark:text-[#f5f3ef] placeholder-[#878278] dark:placeholder-[#7d7970] focus:outline-none resize-none p-1.5 leading-relaxed"
              />
              <div className="flex items-center justify-between px-1.5 pt-1 border-t border-[#e5e0d5]/40 dark:border-[#33302b]/40">
                <span className="text-[10px] font-mono text-[#878278] dark:text-[#7d7970]">
                  Enter ↵ to build
                </span>
                <button
                  onClick={() => handleSend()}
                  disabled={!inputVal.trim() || isAgentThinking}
                  className="px-3 py-1 rounded-lg bg-[#c15f3c] hover:bg-[#ad5232] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                >
                  <span>Build</span>
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Build History & Diffs Tab */}
      {agentSidebarTab === 'builds' && (
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-xs text-[#1f1e1b] dark:text-[#f5f3ef]">
              AI Modifications Stream
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#c15f3c]/10 text-[#c15f3c] font-bold">
              {aiBuildHistory.length} Actions
            </span>
          </div>

          {aiBuildHistory.length === 0 ? (
            <div className="p-8 text-center text-[#878278] dark:text-[#7d7970] space-y-2">
              <Code2 className="w-8 h-8 mx-auto opacity-40 text-[#c15f3c]" />
              <p className="font-medium text-xs">No AI modifications logged yet.</p>
              <p className="text-[11px]">
                Ask the AI agent to add nodes or optimize your workflow to see live change streams.
              </p>
            </div>
          ) : (
            aiBuildHistory.map((build) => (
              <div
                key={build.id}
                className="p-3 rounded-2xl bg-[#faf8f5] dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-xs text-[#1f1e1b] dark:text-[#f5f3ef]">
                      {build.title}
                    </div>
                    <div className="text-[10px] font-mono text-[#878278] dark:text-[#9e998f]">
                      By {build.agentName} • {new Date(build.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold">
                    {build.actionType}
                  </span>
                </div>

                <p className="text-[11px] text-[#5c5850] dark:text-[#b8b4aa] leading-relaxed">
                  {build.description}
                </p>

                {build.diffSummary && (
                  <div className="p-1.5 rounded-lg bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 text-[10.5px] font-mono text-emerald-800 dark:text-emerald-300 font-medium">
                    {build.diffSummary}
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-[#e5e0d5]/60 dark:border-[#33302b]/60">
                  {build.nodeIds && build.nodeIds.length > 0 ? (
                    <button
                      onClick={() => focusNode(build.nodeIds![0])}
                      className="px-2.5 py-1 rounded-lg bg-[#c15f3c]/10 hover:bg-[#c15f3c]/20 text-[#c15f3c] text-[10.5px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Focus on Canvas</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  <button
                    onClick={() => revertBuildAction(build.id)}
                    className="px-2.5 py-1 rounded-lg hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10.5px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Revert</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 4. Fleet & Governance Tab */}
      {agentSidebarTab === 'fleet' && (
        <div className="flex-1 overflow-y-auto p-3.5 space-y-4 text-xs">
          <div>
            <span className="font-bold text-xs text-[#1f1e1b] dark:text-[#f5f3ef]">
              Active Agent Governance
            </span>
            <p className="text-[11px] text-[#878278] dark:text-[#9e998f] mt-0.5">
              Control autonomy, model routing, and token escrow for the active workflow builder.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-[#faf8f5] dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b]">
              <label className="text-[10.5px] font-mono text-[#878278] dark:text-[#9e998f] uppercase font-bold block mb-1">
                Assisting Agent
              </label>
              <div className="font-bold text-xs text-[#1f1e1b] dark:text-[#f5f3ef]">
                {currentAgent.name}
              </div>
              <div className="text-[11px] text-[#5c5850] dark:text-[#b8b4aa] mt-1 font-mono">
                Model: {currentAgent.model} • Archetype: {currentAgent.archetype}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#faf8f5] dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] space-y-2">
              <label className="text-[10.5px] font-mono text-[#878278] dark:text-[#9e998f] uppercase font-bold block">
                Workflow Autonomy Level
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-[10.5px] font-bold">
                <button className="py-1.5 px-2 rounded-xl bg-emerald-500 text-white text-center">
                  Full Auto
                </button>
                <button className="py-1.5 px-2 rounded-xl bg-white dark:bg-[#262421] border border-[#e5e0d5] dark:border-[#33302b] text-[#5c5850] dark:text-[#b8b4aa] hover:border-[#c15f3c]">
                  Semi-Auto
                </button>
                <button className="py-1.5 px-2 rounded-xl bg-white dark:bg-[#262421] border border-[#e5e0d5] dark:border-[#33302b] text-[#5c5850] dark:text-[#b8b4aa] hover:border-[#c15f3c]">
                  Supervised
                </button>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#faf8f5] dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-mono text-[#878278] dark:text-[#9e998f] uppercase font-bold">
                  Zero-Trust Budget Ceiling
                </span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  $20.00 / day
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                defaultValue="20"
                className="w-full accent-[#c15f3c] cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* GitHub Sync Modal */}
      <GitHubSyncModal />
    </aside>
  );
};
