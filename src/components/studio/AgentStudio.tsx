import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Mail,
  Search,
  Database,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Copy,
  Download,
  Terminal,
  Code2,
  Check,
  Shield,
  Layers,
  ArrowRight,
  MessageSquare,
  Zap,
  Code
} from 'lucide-react';
import { useStudioStore } from '../../stores/useStudioStore';
import { useAgentsStore } from '../../stores/useAgentsStore';
import { useAppStore } from '../../stores/useAppStore';
import { AgentArchetype, Agent } from '../../types';

const PROMPT_PRESETS = [
  {
    title: 'Customer Support & Refunds',
    archetype: 'SUPPORT' as AgentArchetype,
    prompt: 'Build a Tier-1 customer support agent for our online store that checks order statuses, searches our vector knowledge base, and requires human approval for refunds over $50.'
  },
  {
    title: 'Python Coding Mentor',
    archetype: 'SUPPORT' as AgentArchetype,
    prompt: 'Build an autonomous senior Python mentor agent that reviews pull requests, writes pytest test cases, inspects async code for memory leaks, and recommends security hardening.'
  },
  {
    title: 'Outbound B2B Lead Scout',
    archetype: 'OUTREACH' as AgentArchetype,
    prompt: 'Create a sales outreach agent that enriches domain tech stacks, scores ICP fit, drafts personalized email sequences, and complies with anti-spam sending rules.'
  },
  {
    title: 'SEC Financial Ratio Auditor',
    archetype: 'RESEARCHER' as AgentArchetype,
    prompt: 'Build a read-only financial research agent that queries SEC EDGAR vector filings, parses 10-K disclosures, calculates EBITDA margins, and blocks any live trade execution.'
  },
  {
    title: 'Travel & Flight Concierge',
    archetype: 'SUPPORT' as AgentArchetype,
    prompt: 'Build an AI travel concierge that searches flight availability, compares boutique hotel deals, drafts custom 5-day itineraries, and checks passport requirements.'
  }
];

const ARCHETYPES: { id: AgentArchetype; title: string; desc: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'SUPPORT', title: 'Customer Support Sentinel', desc: 'Queries vector KB, drafts ticket resolutions, pauses for refunds > $50.', icon: Bot },
  { id: 'OUTREACH', title: 'Sales Pipeline Navigator', desc: 'Researches lead domain signals, personalizes pitch, gates outbound emails.', icon: Mail },
  { id: 'RESEARCHER', title: 'Financial & SEC Scout', desc: 'Parses quarterly 10-Ks, runs financial ratio calculations in read-only mode.', icon: Search },
  { id: 'DB_REPORTER', title: 'Database Analytics Oracle', desc: 'Queries SQL read-replicas, prepares daily rollups, blocks schema DDL.', icon: Database },
];

export const AgentStudio: React.FC = () => {
  const {
    prompt,
    setPrompt,
    selectedArchetype,
    setArchetype,
    isGenerating,
    buildSteps,
    generatedCode,
    sandboxLogs,
    isVerifiedSecure,
    activeTab,
    setActiveTab,
    startGeneration,
    resetStudio
  } = useStudioStore();

  const { createAgentFromPrompt } = useAgentsStore();
  const { setActiveNav, addToast, startChatWithAgent } = useAppStore();

  const [copied, setCopied] = useState(false);
  const [createdAgent, setCreatedAgent] = useState<Agent | null>(null);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    addToast({ title: 'Code Copied', description: 'Agent Python code copied to clipboard.', type: 'success' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCode = () => {
    const blob = new Blob([generatedCode], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agentlens_${selectedArchetype.toLowerCase()}_agent.py`;
    a.click();
    addToast({ title: 'Script Exported', description: 'Python script downloaded successfully.', type: 'success' });
  };

  const handleStartBuild = () => {
    if (!prompt.trim() || isGenerating) return;

    setCreatedAgent(null);

    startGeneration(() => {
      // Once build sequence completes, create the permanent agent
      const agent = createAgentFromPrompt(prompt);
      setCreatedAgent(agent);
      addToast({
        title: 'Agent Synthesized & Saved',
        description: `${agent.name} is ready. All safety rules, tools, and keys are active.`,
        type: 'success'
      });
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-yellow-100/90 via-amber-50/70 to-white/90 dark:from-yellow-950/40 dark:via-[#141724] dark:to-[#0c0e18] border border-yellow-300/60 dark:border-yellow-500/30 text-slate-950 dark:text-white space-y-2 shadow-xs">
        <div className="flex items-center gap-2 text-amber-700 dark:text-yellow-400 font-mono text-xs uppercase font-bold">
          <Sparkles className="w-4 h-4 text-amber-600 dark:text-yellow-400" />
          <span>AI Agent Creator & Synthesizer</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-950 dark:text-white">Write a Prompt to Build Any Kind of AI Agent</h2>
        <p className="text-xs text-slate-700 dark:text-slate-300 max-w-2xl font-medium">
          Describe what you want your agent to do. AgentLens will synthesize its system prompt, configure allowed tools, attach safety guardrails, run sandboxed red-team tests, and store it so you can chat with it immediately.
        </p>
      </div>

      {/* Main Split-Screen Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Intake & Build Pipeline */}
        <div className="lg:col-span-5 space-y-5">
          {/* Prompt Specification Box */}
          <div className="p-5 rounded-xl bg-white/85 dark:bg-[#0c0e18]/85 backdrop-blur-md border border-yellow-300/40 dark:border-yellow-500/20 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-mono">
                1. What Kind of AI Agent Do You Want?
              </label>
              <button
                type="button"
                onClick={() => {
                  resetStudio();
                  setCreatedAgent(null);
                }}
                className="text-[11px] font-bold text-slate-600 dark:text-yellow-300 hover:text-slate-950 dark:hover:text-yellow-200 cursor-pointer"
              >
                Clear
              </button>
            </div>

            {/* Quick Inspiration Chips */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono font-bold block">
                Quick Preset Ideas:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PROMPT_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPrompt(preset.prompt);
                      setArchetype(preset.archetype);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-md border border-yellow-300/60 dark:border-yellow-500/30 bg-yellow-50/50 dark:bg-[#131627]/60 hover:border-yellow-400 hover:text-slate-950 dark:hover:text-yellow-300 text-slate-800 dark:text-slate-200 transition-all cursor-pointer font-medium"
                  >
                    {preset.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Natural language textarea */}
            <textarea
              id="studio-prompt-textarea"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
              rows={4}
              placeholder="e.g. Build an AI customer service agent that checks order status, processes returns, and needs confirmation for refunds over $50..."
              className="w-full bg-white/90 dark:bg-[#131627]/80 border border-yellow-300/60 dark:border-yellow-500/25 rounded-lg p-3 text-xs text-slate-950 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400/20 transition-colors resize-none font-sans"
            />

            {/* Archetype selector buttons */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-mono block mb-2">
                Specialization Archetype
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ARCHETYPES.map(({ id, title, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setArchetype(id)}
                    className={`p-2 rounded-lg border text-left text-xs flex items-center gap-2 transition-all cursor-pointer ${
                      selectedArchetype === id
                        ? 'border-yellow-400 bg-yellow-100/70 dark:bg-yellow-950/40 text-slate-950 dark:text-yellow-300 font-bold shadow-2xs'
                        : 'border-yellow-300/40 dark:border-yellow-500/20 bg-yellow-50/30 dark:bg-[#131627]/40 text-slate-700 dark:text-slate-400'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${selectedArchetype === id ? 'text-amber-600 dark:text-yellow-400' : 'text-slate-400'}`} />
                    <span className="truncate">{title.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Build Button */}
            <button
              id="start-studio-synthesis-btn"
              onClick={handleStartBuild}
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm border border-yellow-300 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Synthesizing & Verifying Agent...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Build & Store AI Agent</span>
                </>
              )}
            </button>
          </div>

          {/* 5-Stage Verification Pipeline */}
          <div className="p-5 rounded-xl bg-white/85 dark:bg-[#0c0e18]/85 backdrop-blur-md border border-yellow-300/40 dark:border-yellow-500/20 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-mono">
                Verification Pipeline
              </h3>
              {isVerifiedSecure && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Verified & Ready
                </span>
              )}
            </div>

            <div className="space-y-2">
              {buildSteps.map((step, idx) => (
                <div
                  key={step.step}
                  className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition-all ${
                    step.status === 'IN_PROGRESS'
                      ? 'border-yellow-400 bg-yellow-100/60 dark:bg-yellow-950/40 text-slate-950 dark:text-yellow-300 font-bold'
                      : step.status === 'SUCCESS'
                      ? 'border-yellow-300/40 dark:border-yellow-500/20 bg-yellow-50/40 dark:bg-[#131627]/40 text-slate-800 dark:text-slate-200'
                      : 'border-yellow-300/20 dark:border-yellow-500/10 text-slate-400 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-[11px] text-slate-500 font-bold">0{idx + 1}</span>
                    <div>
                      <div className="font-bold text-slate-950 dark:text-white">{step.step}</div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 truncate max-w-[200px]">
                        {step.details || step.message}
                      </div>
                    </div>
                  </div>

                  <div>
                    {step.status === 'IN_PROGRESS' && <Loader2 className="w-4 h-4 text-amber-600 dark:text-yellow-400 animate-spin" />}
                    {step.status === 'SUCCESS' && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                    {step.status === 'FAILED' && <AlertCircle className="w-4 h-4 text-rose-500" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): Created Agent Highlight or Sandbox/Code */}
        <div className="lg:col-span-7 space-y-4">
          {/* If an agent was just built, prominently display the launch card! */}
          {createdAgent && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-yellow-100/90 via-amber-50/70 to-white/90 dark:from-yellow-950/40 dark:via-[#141724] dark:to-[#0c0e18] border border-yellow-400/80 dark:border-yellow-500/40 shadow-md space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full font-mono">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Agent Built & Stored Successfully!</span>
                </span>
                <span className="text-xs font-mono text-slate-600 dark:text-slate-400 font-bold">
                  Model: {createdAgent.model}
                </span>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-400 text-slate-950 font-bold flex items-center justify-center flex-shrink-0 shadow-sm border border-yellow-300">
                  <Bot className="w-6 h-6 text-slate-950" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-950 dark:text-white">
                    {createdAgent.name}
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 font-medium">
                    {createdAgent.description}
                  </p>
                </div>
              </div>

              {createdAgent.tools && (
                <div className="space-y-1 text-xs">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-600 dark:text-slate-400">
                    Configured Tools:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {createdAgent.tools.map((tool) => (
                      <span
                        key={tool}
                        className="px-2 py-0.5 rounded bg-yellow-100 dark:bg-yellow-950/60 border border-yellow-300/80 dark:border-yellow-500/30 text-slate-950 dark:text-yellow-300 font-mono font-bold text-[11px]"
                      >
                        {tool}()
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons: Chat now vs View in My Agents */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => startChatWithAgent(createdAgent.id)}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-sm border border-yellow-300 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat With This Agent Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setActiveNav('agents')}
                  className="w-full sm:w-auto py-3 px-4 rounded-xl border border-yellow-300/80 dark:border-yellow-500/30 hover:bg-yellow-100/50 dark:hover:bg-yellow-950/30 text-slate-950 dark:text-yellow-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>View in My AI Agents</span>
                </button>
              </div>
            </div>
          )}

          {/* Code, Sandbox, & Governance Tabs */}
          <div className="rounded-xl bg-white/85 dark:bg-[#0c0e18]/85 backdrop-blur-md border border-yellow-300/40 dark:border-yellow-500/20 overflow-hidden shadow-xs flex flex-col h-full min-h-[480px]">
            {/* Header Tabs */}
            <div className="px-4 py-2.5 border-b border-yellow-300/40 dark:border-yellow-500/20 bg-yellow-50/40 dark:bg-[#131627]/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('sandbox')}
                  className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer font-bold ${
                    activeTab === 'sandbox'
                      ? 'bg-yellow-400/25 text-slate-950 dark:text-yellow-300 border border-yellow-400/70 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-yellow-200'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Sandbox Test Logs ({sandboxLogs.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('code')}
                  className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer font-bold ${
                    activeTab === 'code'
                      ? 'bg-yellow-400/25 text-slate-950 dark:text-yellow-300 border border-yellow-400/70 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-yellow-200'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5 text-amber-600 dark:text-yellow-400" />
                  <span>Synthesized Code (Python)</span>
                </button>

                <button
                  onClick={() => setActiveTab('governance')}
                  className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer font-bold ${
                    activeTab === 'governance'
                      ? 'bg-yellow-400/25 text-slate-950 dark:text-yellow-300 border border-yellow-400/70 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-yellow-200'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-amber-600 dark:text-yellow-400" />
                  <span>Risk Blueprint</span>
                </button>
              </div>

              {/* Utility actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="p-1.5 rounded-md hover:bg-yellow-100 dark:hover:bg-yellow-950/40 text-slate-600 dark:text-yellow-300 hover:text-slate-950 transition-colors cursor-pointer"
                  title="Copy Python Code"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={handleDownloadCode}
                  className="p-1.5 rounded-md hover:bg-yellow-100 dark:hover:bg-yellow-950/40 text-slate-600 dark:text-yellow-300 hover:text-slate-950 transition-colors cursor-pointer"
                  title="Download Script (.py)"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Tab 1: Sandbox Logs Terminal */}
            {activeTab === 'sandbox' && (
              <div className="p-4 flex-1 bg-black text-emerald-400 font-mono text-xs space-y-1.5 overflow-y-auto max-h-[420px]">
                {sandboxLogs.length === 0 ? (
                  <div className="text-slate-500 italic">
                    Type your prompt on the left and click "Build & Store AI Agent" to simulate container verification and red-team tests.
                  </div>
                ) : (
                  sandboxLogs.map((log, i) => (
                    <div key={i} className="leading-normal">
                      {log}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 2: Code View */}
            {activeTab === 'code' && (
              <div className="p-4 flex-1 bg-[#060810] text-slate-200 font-mono text-xs overflow-x-auto select-text leading-relaxed max-h-[420px]">
                <pre>{generatedCode}</pre>
              </div>
            )}

            {/* Tab 3: Governance Summary */}
            {activeTab === 'governance' && (
              <div className="p-5 flex-1 bg-white/95 dark:bg-[#0c0e18]/95 space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-yellow-100/50 dark:bg-yellow-950/30 border border-yellow-300/70 dark:border-yellow-500/30">
                  <span className="font-bold text-slate-950 dark:text-yellow-300 block mb-1">
                    Zero-Trust Virtual Key Architecture
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 text-[11px] font-medium">
                    Every generated agent is bound to a virtual key prefix <code className="font-mono text-amber-700 dark:text-yellow-400 font-bold">al_live_***</code>. Master keys remain encrypted in the vault and are never exposed to agent code.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-950 dark:text-white uppercase tracking-wider font-mono text-[11px]">
                    Generated Tool Risk Boundaries
                  </h4>
                  <div className="p-2.5 rounded-lg border border-yellow-300/50 dark:border-yellow-500/20 bg-white/80 dark:bg-[#121526]/80 flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-slate-950 dark:text-white">search_knowledge_base</span>
                      <span className="text-slate-600 dark:text-slate-400 block text-[11px]">Read-only retrieval lookup</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                      GREEN (AUTO)
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg border border-yellow-300/50 dark:border-yellow-500/20 bg-white/80 dark:bg-[#121526]/80 flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-slate-950 dark:text-white">issue_customer_refund</span>
                      <span className="text-slate-600 dark:text-slate-400 block text-[11px]">Condition: IF amount &gt; $50.00</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-900 dark:text-yellow-300 border border-amber-500/40">
                      YELLOW (HITL APPROVAL)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
