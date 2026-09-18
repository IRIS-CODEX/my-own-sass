import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Zap,
  Brain,
  Database,
  Code,
  Send,
  Sparkles,
  Trash2,
  ChevronDown,
  ChevronRight,
  Shield,
  ShieldAlert,
  Play,
  OctagonAlert,
  Terminal,
  Search,
  ArrowRight,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useAgentsStore } from '../../stores/useAgentsStore';
import { useChatStore } from '../../stores/useChatStore';
import { useAppStore } from '../../stores/useAppStore';
import { usePoliciesStore } from '../../stores/usePoliciesStore';
import { useLiveStreamStore } from '../../stores/useLiveStreamStore';
import { Agent, AgentArchetype, AutonomyMode } from '../../types';

export const AgentChat: React.FC = () => {
  const { agents, setAutonomyMode, toggleKillSwitch } = useAgentsStore();
  const {
    activeAgentId,
    setActiveAgentId,
    getMessages,
    sendMessage,
    clearChat,
    isThinking,
    thinkingStage
  } = useChatStore();

  const { activeChatAgentId, setActiveNav, addToast } = useAppStore();
  const { promptRules } = usePoliciesStore();
  const { pendingActions, approveAction } = useLiveStreamStore();

  const [inputMessage, setInputMessage] = useState('');
  const [agentSearch, setAgentSearch] = useState('');
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [showRulesDrawer, setShowRulesDrawer] = useState(false);
  const [collapsedThoughts, setCollapsedThoughts] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Sync if appStore requested a specific agent
  useEffect(() => {
    if (activeChatAgentId && agents.some((a) => a.id === activeChatAgentId)) {
      setActiveAgentId(activeChatAgentId);
    }
  }, [activeChatAgentId, agents, setActiveAgentId]);

  // Fallback to first agent if active agent is invalid
  useEffect(() => {
    if (!agents.some((a) => a.id === activeAgentId) && agents.length > 0) {
      setActiveAgentId(agents[0].id);
    }
  }, [agents, activeAgentId, setActiveAgentId]);

  const currentAgent = agents.find((a) => a.id === activeAgentId) || agents[0];
  const messages = currentAgent ? getMessages(currentAgent.id) : [];

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || !currentAgent || isThinking) return;

    setInputMessage('');
    await sendMessage(currentAgent.id, text, currentAgent);
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

  const getAgentIcon = (archetype?: AgentArchetype, iconName?: string) => {
    if (iconName === 'Zap' || archetype === 'OUTREACH') return Zap;
    if (iconName === 'Brain' || archetype === 'RESEARCHER') return Brain;
    if (iconName === 'Database' || archetype === 'DB_REPORTER') return Database;
    if (iconName === 'Code' || archetype === 'CODING') return Code;
    return Bot;
  };

  const filteredAgents = agents.filter((a) =>
    a.name.toLowerCase().includes(agentSearch.toLowerCase()) ||
    a.description.toLowerCase().includes(agentSearch.toLowerCase())
  );

  const isCurrentAgentPaused = currentAgent?.autonomyMode === 'PAUSED';

  const activeAgentRules = currentAgent
    ? promptRules.filter((r) => r.isEnabled && (r.agentId === 'ALL' || r.agentId === currentAgent.id))
    : [];

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col md:flex-row rounded-2xl border border-yellow-300/50 dark:border-yellow-500/20 bg-white/85 dark:bg-[#0c0e18]/85 backdrop-blur-md overflow-hidden shadow-sm shadow-yellow-950/5">
      {/* Left Column: Agent Selector */}
      <div className="w-full md:w-72 lg:w-80 border-b md:border-b-0 md:border-r border-yellow-300/40 dark:border-yellow-500/20 flex flex-col bg-yellow-50/30 dark:bg-[#080911]/90 backdrop-blur-md">
        {/* Header & Search */}
        <div className="p-3.5 border-b border-yellow-300/40 dark:border-yellow-500/20 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-yellow-400/20 text-amber-600 dark:text-yellow-400 border border-yellow-400/30 flex items-center justify-center font-bold text-xs">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-xs text-slate-950 dark:text-white">
                Active Agents
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-yellow-100 dark:bg-yellow-950/50 text-amber-900 dark:text-yellow-300 border border-yellow-300/70 dark:border-yellow-500/40">
                {agents.length}
              </span>
            </div>

            <button
              onClick={() => setActiveNav('studio')}
              className="text-[11px] font-bold px-2 py-1 rounded-md bg-yellow-400 hover:bg-yellow-300 text-slate-950 flex items-center gap-1 transition-all cursor-pointer shadow-xs border border-yellow-300"
              title="Create new agent"
            >
              <Sparkles className="w-3 h-3 text-slate-950" />
              <span>New</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400" />
            <input
              type="text"
              value={agentSearch}
              onChange={(e) => setAgentSearch(e.target.value)}
              placeholder="Search agents..."
              className="w-full bg-white/90 dark:bg-[#080910] border border-yellow-300/60 dark:border-yellow-500/30 rounded-lg pl-7 pr-3 py-1.5 text-xs text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:border-yellow-500 transition-colors font-medium"
            />
          </div>
        </div>

        {/* Agent List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredAgents.map((agent) => {
            const isSelected = agent.id === activeAgentId;
            const Icon = getAgentIcon(agent.archetype, agent.avatarIcon);
            const isPaused = agent.autonomyMode === 'PAUSED';

            return (
              <button
                key={agent.id}
                onClick={() => {
                  setActiveAgentId(agent.id);
                  inputRef.current?.focus();
                }}
                className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 border cursor-pointer ${
                  isSelected
                    ? 'bg-yellow-400/20 dark:bg-yellow-400/10 border-yellow-400/80 dark:border-yellow-400/50 text-slate-950 dark:text-yellow-200 shadow-xs'
                    : 'border-transparent hover:bg-yellow-100/40 dark:hover:bg-[#141724]/60 text-slate-900 dark:text-slate-300'
                }`}
              >
                <div
                  className={`p-2 rounded-lg flex-shrink-0 mt-0.5 ${
                    isPaused
                      ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                      : isSelected
                      ? 'bg-yellow-400 text-slate-950 font-bold shadow-xs border border-yellow-300'
                      : 'bg-yellow-100/60 dark:bg-[#15192c] text-amber-800 dark:text-yellow-400 border border-yellow-300/40 dark:border-yellow-500/20'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-xs truncate text-slate-950 dark:text-white">
                      {agent.name}
                    </span>
                    <span
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        isPaused ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                    />
                  </div>

                  <p className="text-[11px] text-slate-800 dark:text-slate-300 truncate mt-0.5 font-medium">
                    {agent.description}
                  </p>

                  <div className="flex items-center gap-1.5 mt-1.5 text-[10px] font-mono">
                    <span className="px-1.5 py-0.2 rounded bg-yellow-50 dark:bg-yellow-950/40 text-amber-900 dark:text-yellow-300 border border-yellow-300/60 dark:border-yellow-500/30 font-bold">
                      {agent.model}
                    </span>
                    <span className="text-slate-700 dark:text-slate-300 font-bold">
                      {agent.autonomyMode}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}

          {filteredAgents.length === 0 && (
            <div className="p-6 text-center text-xs text-slate-700 dark:text-slate-300 space-y-1.5 font-medium">
              <p>No agents found.</p>
              <button
                onClick={() => setActiveNav('studio')}
                className="text-amber-800 dark:text-yellow-400 font-bold hover:underline cursor-pointer"
              >
                Build new agent
              </button>
            </div>
          )}
        </div>

        {/* Footer Shortcut */}
        <div className="p-2.5 border-t border-yellow-300/40 dark:border-yellow-500/20 bg-white/50 dark:bg-[#07080d]/60">
          <button
            onClick={() => setActiveNav('agents')}
            className="w-full py-1.5 px-3 rounded-lg border border-yellow-300/60 dark:border-yellow-500/30 text-slate-900 dark:text-yellow-200 text-xs font-bold hover:bg-yellow-100/50 dark:hover:bg-[#161a2a] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Manage All Agents</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-600 dark:text-yellow-400" />
          </button>
        </div>
      </div>

      {/* Right Column: Chat Canvas */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-white/80 dark:bg-[#0b0c14]/85 backdrop-blur-md">
        {/* Top Chat Header */}
        {currentAgent && (
          <div className="px-4 py-3 border-b border-yellow-300/40 dark:border-yellow-500/20 bg-white/90 dark:bg-[#0c0e18]/90 backdrop-blur-md flex items-center justify-between z-10">
            <div className="flex items-center gap-3 min-w-0">
              {React.createElement(getAgentIcon(currentAgent.archetype, currentAgent.avatarIcon), {
                className: `w-5 h-5 flex-shrink-0 ${
                  isCurrentAgentPaused ? 'text-rose-500' : 'text-amber-600 dark:text-yellow-400'
                }`
              })}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-sm text-slate-950 dark:text-white truncate">
                    {currentAgent.name}
                  </h2>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-yellow-100 dark:bg-yellow-950/60 text-amber-900 dark:text-yellow-300 border border-yellow-300/70 dark:border-yellow-500/30 font-bold">
                    {currentAgent.model}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isCurrentAgentPaused
                        ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {isCurrentAgentPaused ? 'HALTED' : 'READY'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-800 dark:text-slate-300 truncate font-medium">
                  {currentAgent.description}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              {/* Autonomy Mode Selector */}
              <select
                value={currentAgent.autonomyMode}
                onChange={(e) => setAutonomyMode(currentAgent.id, e.target.value as AutonomyMode)}
                className="hidden sm:block bg-white/90 dark:bg-[#080910] border border-yellow-300/60 dark:border-yellow-500/30 rounded-lg px-2 py-1 text-xs font-bold text-slate-950 dark:text-white focus:outline-none focus:border-yellow-500 font-mono cursor-pointer"
                title="Runtime autonomy mode"
              >
                <option value="FULL_AUTO">Full Auto</option>
                <option value="SEMI_AUTO">Semi-Auto (HITL)</option>
                <option value="READ_ONLY">Read-Only</option>
                <option value="PAUSED">Kill-Switch</option>
              </select>

              {/* Kill Switch Toggle */}
              <button
                onClick={() => toggleKillSwitch(currentAgent.id)}
                className={`p-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  isCurrentAgentPaused
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'border-rose-300 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                }`}
                title={isCurrentAgentPaused ? 'Resume Agent' : 'Emergency Halt'}
              >
                {isCurrentAgentPaused ? <Play className="w-3.5 h-3.5" /> : <OctagonAlert className="w-3.5 h-3.5" />}
              </button>

              {/* Inspect Rules & Prompt */}
              <button
                onClick={() => {
                  setShowRulesDrawer(!showRulesDrawer);
                  if (showSystemPrompt) setShowSystemPrompt(false);
                }}
                className={`p-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  showRulesDrawer
                    ? 'bg-yellow-400 text-slate-950 border-yellow-400 shadow-xs'
                    : 'border-yellow-300/60 dark:border-yellow-500/30 text-slate-900 dark:text-yellow-300 bg-yellow-50/70 dark:bg-yellow-950/30 hover:bg-yellow-100'
                }`}
                title="Active Governed Rules"
              >
                <Shield className="w-3.5 h-3.5 text-amber-600 dark:text-yellow-400" />
                <span className="hidden sm:inline">Rules</span>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-yellow-400/30 dark:bg-yellow-400/20 text-slate-950 dark:text-yellow-200 font-bold">
                  {activeAgentRules.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setShowSystemPrompt(!showSystemPrompt);
                  if (showRulesDrawer) setShowRulesDrawer(false);
                }}
                className={`p-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                  showSystemPrompt
                    ? 'bg-yellow-400 text-slate-950 border-yellow-300 shadow-xs'
                    : 'border-yellow-300/60 dark:border-yellow-500/30 text-slate-700 dark:text-slate-400 hover:bg-yellow-100/50 dark:hover:bg-yellow-950/20'
                }`}
                title="System Prompt & Config"
              >
                <Sliders className="w-3.5 h-3.5" />
              </button>

              {/* Clear messages */}
              <button
                onClick={() => {
                  clearChat(currentAgent.id);
                  addToast({ title: 'Chat Cleared', description: 'Conversation reset.', type: 'info' });
                }}
                className="p-1.5 rounded-lg border border-yellow-300/60 dark:border-yellow-500/30 text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white hover:bg-yellow-100/50 dark:hover:bg-yellow-950/20 transition-colors cursor-pointer"
                title="Clear conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Collapsible System Prompt Drawer */}
        {showSystemPrompt && currentAgent && (
          <div className="p-3.5 bg-yellow-50/60 dark:bg-yellow-950/20 border-b border-yellow-300/40 dark:border-yellow-500/20 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-wider font-mono text-amber-900 dark:text-yellow-400 text-[10px]">
                System Prompt ({currentAgent.framework})
              </span>
              <span className="text-[10px] text-slate-700 dark:text-slate-400 font-mono font-bold">
                Daily Budget: ${currentAgent.dailyBudgetUsd} USD
              </span>
            </div>
            <pre className="p-2.5 bg-slate-950 rounded-lg border border-yellow-500/20 text-yellow-100/90 font-mono text-[11px] whitespace-pre-wrap max-h-32 overflow-y-auto">
              {currentAgent.systemPrompt}
            </pre>
            {currentAgent.tools && currentAgent.tools.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-slate-700 dark:text-slate-400 text-[10px] font-mono font-bold">Tools:</span>
                {currentAgent.tools.map((tool) => (
                  <span
                    key={tool}
                    className="px-1.5 py-0.5 rounded bg-yellow-100 dark:bg-yellow-950/40 text-amber-950 dark:text-yellow-300 font-mono text-[10px] border border-yellow-300/60 dark:border-yellow-500/30 font-bold"
                  >
                    {tool}()
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Collapsible Governed Rules Drawer */}
        {showRulesDrawer && currentAgent && (
          <div className="p-3.5 bg-yellow-50/80 dark:bg-[#151710] border-b border-yellow-300/40 dark:border-yellow-500/20 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-600 dark:text-yellow-400" />
                <span className="font-bold uppercase tracking-wider font-mono text-slate-950 dark:text-yellow-300 text-[11px]">
                  Active Governance Policies ({activeAgentRules.length})
                </span>
              </div>
              <button
                onClick={() => setActiveNav('policies')}
                className="text-[11px] font-bold text-amber-900 dark:text-yellow-300 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Edit in Policy Studio</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {activeAgentRules.length === 0 ? (
              <p className="text-slate-700 dark:text-slate-400 text-xs italic font-medium">
                No custom prompt rules currently targeting this agent. Autonomous parameters adhere to standard Traffic Light matrix.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {activeAgentRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="p-2.5 rounded-xl bg-white/95 dark:bg-[#0c0e18]/90 border border-yellow-300/60 dark:border-yellow-500/30 space-y-1 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-950 dark:text-white text-xs">
                        {rule.ruleName}
                      </span>
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                          rule.riskLevel === 'RED'
                            ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30'
                            : rule.riskLevel === 'YELLOW'
                            ? 'bg-amber-500/15 text-amber-900 dark:text-yellow-300 border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        {rule.riskLevel}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-700 dark:text-slate-400">
                      <span>Tool: <strong className="text-slate-950 dark:text-slate-200">{rule.targetTool || 'All Tools'}</strong></span>
                      <span>•</span>
                      <span className="truncate font-semibold text-slate-800 dark:text-slate-300">{rule.conditionExpression || 'Always Active'}</span>
                    </div>
                    <p className="text-[11px] text-slate-800 dark:text-slate-300 line-clamp-2 italic bg-yellow-50/70 dark:bg-yellow-950/20 p-1.5 rounded-md border border-yellow-200/80 dark:border-yellow-500/20 font-medium">
                      "{rule.systemInstructionAddition}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Paused Warning Banner */}
        {isCurrentAgentPaused && (
          <div className="px-4 py-2 bg-rose-500/10 border-b border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs flex items-center justify-between font-semibold">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Agent halted. Outgoing tool calls suspended.</span>
            </div>
            <button
              onClick={() => toggleKillSwitch(currentAgent.id)}
              className="px-2.5 py-0.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded transition-colors cursor-pointer shadow-xs"
            >
              Resume
            </button>
          </div>
        )}

        {/* Message Thread Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Welcome Screen when conversation is empty */}
          {messages.length === 0 && currentAgent && (
            <div className="max-w-lg mx-auto py-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-400 text-slate-950 flex items-center justify-center mx-auto shadow-md shadow-yellow-500/30 border border-yellow-300 font-bold">
                {React.createElement(getAgentIcon(currentAgent.archetype, currentAgent.avatarIcon), {
                  className: 'w-6 h-6'
                })}
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-950 dark:text-white">
                  {currentAgent.name}
                </h3>
                <p className="text-xs text-slate-750 dark:text-slate-300 text-slate-700 mt-1 max-w-sm mx-auto font-semibold">
                  {currentAgent.welcomeMessage || currentAgent.description}
                </p>
              </div>

              {/* Starter Prompts */}
              {currentAgent.suggestedPrompts && currentAgent.suggestedPrompts.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-bold text-amber-900 dark:text-yellow-400 uppercase tracking-wider font-mono block">
                    Suggested Questions
                  </span>
                  <div className="grid grid-cols-1 gap-1.5 text-left">
                    {currentAgent.suggestedPrompts.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(prompt)}
                        className="p-2.5 rounded-lg border border-yellow-300/70 dark:border-yellow-500/30 bg-white/95 dark:bg-[#0c0e18]/80 hover:border-yellow-400 hover:bg-yellow-50/80 dark:hover:bg-yellow-950/30 text-xs text-slate-900 dark:text-slate-200 transition-all flex items-center justify-between group cursor-pointer shadow-2xs font-semibold"
                      >
                        <span className="line-clamp-1">{prompt}</span>
                        <Send className="w-3 h-3 text-slate-600 dark:text-slate-400 group-hover:text-amber-700 dark:group-hover:text-yellow-400 transition-colors ml-2 flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Messages list */}
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isThoughtCollapsed = collapsedThoughts[msg.id];

            return (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-yellow-400/20 text-amber-800 dark:text-yellow-400 border border-yellow-400/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {React.createElement(getAgentIcon(currentAgent.archetype, currentAgent.avatarIcon), {
                      className: 'w-3.5 h-3.5'
                    })}
                  </div>
                )}

                <div className={`space-y-1.5 max-w-[85%] sm:max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
                  {/* Internal Reasoning Steps */}
                  {!isUser && msg.thoughts && msg.thoughts.length > 0 && (
                    <div className="rounded-lg border border-yellow-300/60 dark:border-yellow-500/25 bg-yellow-50/50 dark:bg-yellow-950/20 overflow-hidden text-[11px]">
                      <button
                        onClick={() => toggleThought(msg.id)}
                        className="w-full px-2.5 py-1.5 flex items-center justify-between text-slate-850 dark:text-slate-200 text-slate-900 hover:text-slate-950 dark:hover:text-white font-mono cursor-pointer font-bold"
                      >
                        <span className="flex items-center gap-1.5 font-bold">
                          <Brain className="w-3 h-3 text-amber-700 dark:text-yellow-400" />
                          <span>Reasoning ({msg.thoughts.length} steps)</span>
                        </span>
                        {isThoughtCollapsed ? (
                          <ChevronRight className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                        ) : (
                          <ChevronDown className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                        )}
                      </button>

                      {!isThoughtCollapsed && (
                        <div className="px-2.5 pb-2 pt-1 border-t border-yellow-300/40 dark:border-yellow-500/20 font-mono space-y-1 text-slate-900 dark:text-slate-300 font-medium">
                          {msg.thoughts.map((t, i) => (
                            <div key={i} className="flex items-start gap-1.5">
                              <span className="text-amber-700 dark:text-yellow-400 font-bold text-[10px]">{i + 1}.</span>
                              <span>{t}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tool Execution Card */}
                  {!isUser && msg.toolCall && (
                    <div
                      className={`p-2.5 rounded-lg border text-xs font-mono space-y-1 ${
                        msg.toolCall.riskLevel === 'YELLOW'
                          ? 'border-yellow-400/90 bg-yellow-400/15'
                          : 'border-yellow-300/60 dark:border-yellow-500/25 bg-yellow-50/40 dark:bg-yellow-950/15'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-slate-950 dark:text-slate-100">
                          <Terminal className="w-3 h-3 text-amber-700 dark:text-yellow-400" />
                          <span>Tool: {msg.toolCall.toolName}()</span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                            msg.toolCall.riskLevel === 'YELLOW'
                              ? 'bg-amber-500/20 text-amber-950 dark:text-yellow-300 border-amber-500/40'
                              : 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {msg.toolCall.riskLevel} {msg.toolCall.intercepted ? '(GATED)' : '(AUTO)'}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-750 text-slate-800 dark:text-slate-400 font-medium">
                        <strong className="text-slate-950 dark:text-slate-300">Input:</strong> {JSON.stringify(msg.toolCall.params)}
                      </div>

                      <div className="text-[11px] text-slate-850 text-slate-800 dark:text-slate-300 pt-1 border-t border-yellow-300/40 dark:border-yellow-500/20 font-medium">
                        <strong className="text-slate-950 dark:text-slate-300">Output:</strong> {msg.toolCall.result}
                      </div>

                      {msg.toolCall.riskLevel === 'YELLOW' && msg.toolCall.intercepted && (
                        <div className="pt-2 border-t border-yellow-400/40 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-[11px] text-amber-950 dark:text-yellow-300 font-sans font-bold">
                            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>Awaiting Supervisor Approval</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                const pending = pendingActions.find((a) => a.toolName === msg.toolCall?.toolName);
                                if (pending) {
                                  approveAction(pending.actionId);
                                  addToast({
                                    title: 'Tool Call Authorized',
                                    description: `Tool ${pending.toolName} unblocked and executed successfully.`,
                                    type: 'success'
                                  });
                                } else {
                                  addToast({
                                    title: 'Tool Authorized',
                                    description: 'Human-in-the-loop authorization granted.',
                                    type: 'success'
                                  });
                                }
                              }}
                              className="px-2.5 py-1 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-[11px] font-sans rounded-md flex items-center gap-1 cursor-pointer shadow-xs border border-yellow-300"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>1-Tap Authorize</span>
                            </button>
                            <button
                              onClick={() => setActiveNav('live-stream')}
                              className="px-2 py-1 bg-white dark:bg-[#121526] border border-yellow-400/70 hover:border-yellow-400 text-amber-900 dark:text-yellow-300 text-[11px] font-sans font-bold rounded-md flex items-center gap-1 cursor-pointer"
                            >
                              <span>Control Tower</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`p-3.5 rounded-xl leading-relaxed whitespace-pre-wrap shadow-xs ${
                      isUser
                        ? 'bg-yellow-400 text-slate-950 font-bold border border-yellow-300'
                        : 'bg-white/95 dark:bg-[#0c0e18]/90 backdrop-blur-md text-slate-950 dark:text-white border border-yellow-300/60 dark:border-yellow-500/25 font-medium'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* Telemetry Footer */}
                  <div
                    className={`flex items-center gap-2 text-[10px] font-mono text-slate-700 dark:text-slate-400 px-1 font-semibold ${
                      isUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {!isUser && msg.metrics && (
                      <>
                        <span>•</span>
                        <span>{msg.metrics.latencyMs}ms</span>
                        <span>•</span>
                        <span>{msg.metrics.tokensUsed} toks</span>
                        <span>•</span>
                        <span>${msg.metrics.costUsd.toFixed(5)}</span>
                      </>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-slate-950 dark:bg-yellow-400 text-white dark:text-slate-950 font-bold flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] border border-yellow-400/50 shadow-xs">
                    ME
                  </div>
                )}
              </div>
            );
          })}

          {/* Thinking animation */}
          {isThinking && (
            <div className="flex gap-3 text-xs justify-start items-start">
              <div className="w-7 h-7 rounded-lg bg-yellow-400/20 text-amber-700 dark:text-yellow-400 border border-yellow-400/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 animate-spin" />
              </div>

              <div className="p-3 rounded-xl bg-white/95 dark:bg-[#0c0e18]/90 backdrop-blur-md border border-yellow-300/60 dark:border-yellow-500/25 shadow-xs text-slate-800 dark:text-slate-300 space-y-1 font-medium">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="font-bold text-slate-950 dark:text-white text-xs">
                    {currentAgent?.name} is thinking...
                  </span>
                </div>
                <p className="text-[10px] font-mono text-slate-700 dark:text-slate-400 font-semibold">
                  {thinkingStage}
                </p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3.5 border-t border-yellow-300/40 dark:border-yellow-500/20 bg-white/90 dark:bg-[#0c0e18]/90 backdrop-blur-md">
          <div className="relative rounded-xl border border-yellow-300/70 dark:border-yellow-500/30 bg-white dark:bg-[#080910] focus-within:border-yellow-500 focus-within:ring-2 focus-within:ring-yellow-400/20 transition-all shadow-2xs">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isThinking}
              rows={2}
              placeholder={
                isCurrentAgentPaused
                  ? 'Agent paused. Resume above to chat...'
                  : `Message ${currentAgent?.name || 'Agent'}... (Press Enter)`
              }
              className="w-full bg-transparent p-3 pr-10 text-xs text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none resize-none font-semibold"
            />

            <button
              onClick={() => handleSend()}
              disabled={!inputMessage.trim() || isThinking}
              className="absolute right-2 bottom-2 p-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 disabled:opacity-30 text-slate-950 font-bold border border-yellow-300 transition-all shadow-xs cursor-pointer"
              title="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-between mt-1.5 px-1 text-[10px] text-slate-700 dark:text-slate-400 font-mono font-semibold">
            <span>
              Governed Key: <strong className="text-amber-800 dark:text-yellow-400 font-bold">al_live_scoped</strong>
            </span>
            <span>Shift + Enter for new line</span>
          </div>
        </div>
      </div>
    </div>
  );
};
