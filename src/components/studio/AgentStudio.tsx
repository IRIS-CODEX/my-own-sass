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
  Code,
  Cpu,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useStudioStore } from '../../stores/useStudioStore';
import { useAgentsStore } from '../../stores/useAgentsStore';
import { useAppStore } from '../../stores/useAppStore';
import { AgentArchetype, Agent, AgentMultimodalCapability } from '../../types';
import { MultimodalIntegrationsPanel } from './MultimodalIntegrationsPanel';
import { MultimodalSandboxRunner } from './MultimodalSandboxRunner';

const PROMPT_PRESETS = [
  {
    title: 'Customer Support & Refunds',
    archetype: 'SUPPORT' as AgentArchetype,
    prompt: 'Build a Tier-1 customer support agent for our online store that checks order statuses, searches our vector knowledge base, and requires human approval for refunds over $50.'
  },
  {
    title: 'Creative Visual Studio & Video Creator',
    archetype: 'CREATIVE' as AgentArchetype,
    prompt: 'Build a creative multi-modal AI director that generates marketing concept images with Gemini Flash Image, creates cinematic promo videos with Veo 3, and composes ambient sound tracks with Lyria 3.'
  },
  {
    title: 'Real-Time Grounded Research Scout',
    archetype: 'RESEARCHER' as AgentArchetype,
    prompt: 'Create a live research analyst agent with Google Search Grounding and Google Maps integration to verify geopolitical facts, compare global tech hubs, and cite live web sources.'
  },
  {
    title: 'Voice Assistant & Meeting Transcriber',
    archetype: 'SUPPORT' as AgentArchetype,
    prompt: 'Build an executive AI voice assistant that listens to speech audio via Gemini 3.5 Transcribe, conducts live spoken conversations with Gemini 3.8 Live, and persists notes to Firestore.'
  },
  {
    title: 'Python Coding Mentor & Security Guard',
    archetype: 'SUPPORT' as AgentArchetype,
    prompt: 'Build an autonomous senior Python mentor agent that reviews pull requests, writes pytest test cases, inspects async code for memory leaks, and recommends security hardening.'
  }
];

const ARCHETYPES: { id: AgentArchetype; title: string; desc: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'SUPPORT', title: 'Customer Support Sentinel', desc: 'Queries vector KB, drafts ticket resolutions, pauses for refunds > $50.', icon: Bot },
  { id: 'CREATIVE', title: 'Multimodal Creative Studio', desc: 'Generates images, creates Veo videos, and composes Lyria music stems.', icon: Sparkles },
  { id: 'RESEARCHER', title: 'Grounded Web & Maps Scout', desc: 'Grounds answers with live Google Search queries and Google Maps places.', icon: Search },
  { id: 'DB_REPORTER', title: 'Database & Cloud Oracle', desc: 'Queries SQL read-replicas, syncs Firestore, blocks destructive DDL.', icon: Database },
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

  // Multimodal Capabilities Configuration
  const [selectedCapabilities, setSelectedCapabilities] = useState<AgentMultimodalCapability[]>([
    'gemini_chat',
    'image_generation',
    'google_search',
    'voice_live',
    'audio_transcription',
  ]);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.5-flash');
  const [showIntegrationsSection, setShowIntegrationsSection] = useState(true);

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

    startGeneration(async () => {
      // Once build sequence completes, create the permanent agent with capabilities & model
      const agent = await createAgentFromPrompt(prompt, selectedCapabilities, selectedModel);
      setCreatedAgent(agent);
      addToast({
        title: 'Agent Synthesized & Saved',
        description: `${agent.name} is ready with ${selectedCapabilities.length} active integrations.`,
        type: 'success'
      });
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] text-[#1f1e1b] dark:text-[#f5f3ef] space-y-2 shadow-xs">
        <div className="flex items-center gap-2 text-[#d97706] dark:text-[#f59e0b] font-mono text-xs uppercase font-bold">
          <Sparkles className="w-4 h-4" />
          <span>Multimodal AI Agent Creator & Automations Synthesizer</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-[#1f1e1b] dark:text-[#f5f3ef]">Write a Prompt to Build Any Kind of AI Agent</h2>
        <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa] max-w-3xl font-medium leading-relaxed">
          Describe what you want your agent to do. Integrate advanced capabilities including <strong>Image Creation & Editing (Gemini Flash Image)</strong>, <strong>Live Voice Conversations (Gemini 3.8 Live)</strong>, <strong>Video Generation (Veo 3)</strong>, <strong>Google Search & Maps Grounding</strong>, <strong>Lyria 3 Music</strong>, and <strong>Firestore Database Sync</strong>.
        </p>
      </div>

      {/* Main Split-Screen Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Intake & Build Pipeline */}
        <div className="lg:col-span-5 space-y-5">
          {/* Prompt Specification Box */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#878278] dark:text-[#7d7970] uppercase tracking-wider font-mono">
                1. What Kind of AI Agent Do You Want?
              </label>
              <button
                type="button"
                onClick={() => {
                  resetStudio();
                  setCreatedAgent(null);
                }}
                className="text-[11px] font-bold text-[#878278] hover:text-[#1f1e1b] dark:text-[#7d7970] dark:hover:text-[#f5f3ef] cursor-pointer"
              >
                Clear
              </button>
            </div>

            {/* Quick Inspiration Chips */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-[#878278] dark:text-[#7d7970] uppercase font-mono font-bold block">
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
                    className="text-[11px] px-2.5 py-1 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715] hover:border-[#d97706]/50 dark:hover:border-[#f59e0b]/50 text-[#1f1e1b] dark:text-[#f5f3ef] transition-all cursor-pointer font-medium shadow-xs"
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
              placeholder="e.g. Build an AI multimedia agent that can listen to audio with Gemini 3.5 Transcribe, generate visual assets with Gemini Flash Image, and verify news with Google Search..."
              className="w-full bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] rounded-xl p-3 text-xs text-[#1f1e1b] dark:text-[#f5f3ef] placeholder-[#878278] dark:placeholder-[#7d7970] focus:outline-hidden focus:border-[#d97706] transition-colors resize-none font-medium shadow-xs"
            />

            {/* Archetype selector buttons */}
            <div>
              <label className="text-[11px] font-bold text-[#878278] dark:text-[#7d7970] uppercase tracking-wider font-mono block mb-2">
                Specialization Archetype
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ARCHETYPES.map(({ id, title, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setArchetype(id)}
                    className={`p-2 rounded-xl border text-left text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
                      selectedArchetype === id
                        ? 'border-[#d97706] dark:border-[#f59e0b] bg-amber-500/10 text-[#1f1e1b] dark:text-[#f5f3ef] font-bold'
                        : 'border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715] text-[#5c5850] dark:text-[#b8b4aa] hover:bg-[#f4f1ea] dark:hover:bg-[#282622]'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${selectedArchetype === id ? 'text-[#d97706] dark:text-[#f59e0b]' : 'text-[#878278]'}`} />
                    <span className="truncate">{title.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Collapsible Multimodal Integrations Selector */}
            <div className="border-t border-[#e5e0d5] dark:border-[#33302b] pt-3">
              <button
                type="button"
                onClick={() => setShowIntegrationsSection(!showIntegrationsSection)}
                className="w-full flex items-center justify-between text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef] cursor-pointer py-1"
              >
                <span className="flex items-center gap-1.5 font-mono uppercase text-[#878278] text-[11px]">
                  2. Select AI Capabilities ({selectedCapabilities.length} Enabled)
                </span>
                {showIntegrationsSection ? <ChevronUp className="w-4 h-4 text-[#878278]" /> : <ChevronDown className="w-4 h-4 text-[#878278]" />}
              </button>

              {showIntegrationsSection && (
                <div className="mt-3">
                  <MultimodalIntegrationsPanel
                    selectedCapabilities={selectedCapabilities}
                    onChangeCapabilities={setSelectedCapabilities}
                    selectedModel={selectedModel}
                    onChangeModel={setSelectedModel}
                    compact
                  />
                </div>
              )}
            </div>

            {/* Build Button */}
            <button
              id="start-studio-synthesis-btn"
              onClick={handleStartBuild}
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-3 bg-[#d97706] hover:bg-[#b45309] dark:bg-[#f59e0b] dark:hover:bg-[#fbbf24] disabled:opacity-50 text-white dark:text-[#181715] font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer mt-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white dark:text-[#181715]" />
                  <span>Synthesizing Multimodal Agent...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Build & Deploy Multimodal Agent</span>
                </>
              )}
            </button>
          </div>

          {/* 5-Stage Verification Pipeline */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#878278] dark:text-[#7d7970] uppercase tracking-wider font-mono">
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
                  className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                    step.status === 'IN_PROGRESS'
                      ? 'border-[#d97706] dark:border-[#f59e0b] bg-amber-500/10 text-[#1f1e1b] dark:text-[#f5f3ef] font-bold'
                      : step.status === 'SUCCESS'
                      ? 'border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715] text-[#1f1e1b] dark:text-[#f5f3ef]'
                      : 'border-[#e5e0d5]/40 dark:border-[#33302b]/40 text-[#878278] opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-[11px] text-[#878278] font-bold">0{idx + 1}</span>
                    <div>
                      <div className="font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">{step.step}</div>
                      <div className="text-[11px] text-[#5c5850] dark:text-[#b8b4aa] truncate max-w-[200px]">
                        {step.details || step.message}
                      </div>
                    </div>
                  </div>

                  <div>
                    {step.status === 'IN_PROGRESS' && <Loader2 className="w-4 h-4 text-[#d97706] dark:text-[#f59e0b] animate-spin" />}
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
            <div className="p-6 rounded-2xl bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full font-mono">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Agent Built & Stored Successfully!</span>
                </span>
                <span className="text-xs font-mono text-[#878278] dark:text-[#7d7970] font-bold">
                  Model: {createdAgent.model}
                </span>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#d97706] dark:bg-[#f59e0b] text-white dark:text-[#181715] font-bold flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                    {createdAgent.name}
                  </h3>
                  <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa] mt-0.5 font-medium">
                    {createdAgent.description}
                  </p>
                </div>
              </div>

              {createdAgent.capabilities && createdAgent.capabilities.length > 0 && (
                <div className="space-y-1 text-xs">
                  <span className="text-[10px] uppercase font-mono font-bold text-[#878278] dark:text-[#7d7970]">
                    Active Multimodal Capabilities:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {createdAgent.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-[11px]"
                      >
                        {cap.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons: Chat now vs View in My Agents */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => startChatWithAgent(createdAgent.id)}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#d97706] hover:bg-[#b45309] dark:bg-[#f59e0b] dark:hover:bg-[#fbbf24] text-white dark:text-[#181715] font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat With This Agent Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setActiveNav('agents')}
                  className="w-full sm:w-auto py-3 px-4 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] hover:bg-[#f4f1ea] dark:hover:bg-[#282622] text-[#1f1e1b] dark:text-[#f5f3ef] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <span>View in My AI Agents</span>
                </button>
              </div>
            </div>
          )}

          {/* Code, Sandbox, & Governance Tabs */}
          <div className="rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] overflow-hidden shadow-xs flex flex-col h-full min-h-[500px]">
            {/* Header Tabs */}
            <div className="px-4 py-2.5 border-b border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715] flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setActiveTab('sandbox')}
                  className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer font-bold ${
                    activeTab === 'sandbox'
                      ? 'bg-white dark:bg-[#211f1c] text-[#1f1e1b] dark:text-[#f5f3ef] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs'
                      : 'text-[#878278] dark:text-[#7d7970] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#d97706] dark:text-[#f59e0b]" />
                  <span>Live AI Capabilities Sandbox</span>
                </button>

                <button
                  onClick={() => setActiveTab('code')}
                  className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer font-bold ${
                    activeTab === 'code'
                      ? 'bg-white dark:bg-[#211f1c] text-[#1f1e1b] dark:text-[#f5f3ef] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs'
                      : 'text-[#878278] dark:text-[#7d7970] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef]'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5 text-[#d97706] dark:text-[#f59e0b]" />
                  <span>Synthesized Code</span>
                </button>

                <button
                  onClick={() => setActiveTab('governance')}
                  className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer font-bold ${
                    activeTab === 'governance'
                      ? 'bg-white dark:bg-[#211f1c] text-[#1f1e1b] dark:text-[#f5f3ef] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs'
                      : 'text-[#878278] dark:text-[#7d7970] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef]'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Risk Blueprint</span>
                </button>
              </div>

              {/* Utility actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="p-1.5 rounded-lg hover:bg-[#f4f1ea] dark:hover:bg-[#282622] text-[#878278] hover:text-[#1f1e1b] dark:text-[#7d7970] dark:hover:text-[#f5f3ef] transition-colors cursor-pointer"
                  title="Copy Python Code"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={handleDownloadCode}
                  className="p-1.5 rounded-lg hover:bg-[#f4f1ea] dark:hover:bg-[#282622] text-[#878278] hover:text-[#1f1e1b] dark:text-[#7d7970] dark:hover:text-[#f5f3ef] transition-colors cursor-pointer"
                  title="Download Script (.py)"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Tab 1: Live Multimodal AI Sandbox */}
            {activeTab === 'sandbox' && (
              <div className="p-4 flex-1 overflow-y-auto max-h-[550px]">
                <MultimodalSandboxRunner activeCapabilities={selectedCapabilities} />
              </div>
            )}

            {/* Tab 2: Code View */}
            {activeTab === 'code' && (
              <div className="p-4 flex-1 bg-[#181715] text-[#f5f3ef] font-mono text-xs overflow-x-auto select-text leading-relaxed max-h-[550px]">
                <pre>{generatedCode}</pre>
              </div>
            )}

            {/* Tab 3: Governance Summary */}
            {activeTab === 'governance' && (
              <div className="p-5 flex-1 bg-white dark:bg-[#211f1c] space-y-4 text-xs overflow-y-auto max-h-[550px]">
                <div className="p-3.5 rounded-xl bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b]">
                  <span className="font-bold text-[#1f1e1b] dark:text-[#f5f3ef] block mb-1">
                    Zero-Trust Virtual Key Architecture
                  </span>
                  <p className="text-[#5c5850] dark:text-[#b8b4aa] text-[11px] font-medium">
                    Every generated agent is bound to a virtual key prefix <code className="font-mono text-[#d97706] dark:text-[#f59e0b] font-bold">al_live_***</code>. Master keys remain encrypted in the vault and are never exposed to agent code.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-[#1f1e1b] dark:text-[#f5f3ef] uppercase tracking-wider font-mono text-[11px]">
                    Integrated Multimodal Guardrails
                  </h4>
                  <div className="p-2.5 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715] flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">generate_image (Gemini Flash Image)</span>
                      <span className="text-[#5c5850] dark:text-[#b8b4aa] block text-[11px]">Content safety filters & asset bounds</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                      GREEN (AUTO)
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715] flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">google_search_grounding (Gemini 3.5)</span>
                      <span className="text-[#5c5850] dark:text-[#b8b4aa] block text-[11px]">Live web queries & source verification</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                      GREEN (AUTO)
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715] flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">veo_video_generation (Veo 3)</span>
                      <span className="text-[#5c5850] dark:text-[#b8b4aa] block text-[11px]">Cost threshold: Rate limited per user</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-[#b45309] dark:text-[#fbbf24] border border-amber-500/40">
                      YELLOW (BUDGET GATED)
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

