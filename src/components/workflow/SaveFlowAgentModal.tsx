import React, { useState, useEffect } from 'react';
import {
  X,
  Bot,
  Save,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  Layers,
  Sliders,
  DollarSign,
  Workflow,
  Cpu,
  Lock,
  Zap,
} from 'lucide-react';
import { useWorkflowStore } from '../../stores/useWorkflowStore';
import { useAgentsStore } from '../../stores/useAgentsStore';
import { useAppStore } from '../../stores/useAppStore';
import { Agent, AgentArchetype, AutonomyMode } from '../../types';

export const SaveFlowAgentModal: React.FC = () => {
  const {
    saveFlowModalOpen,
    setSaveFlowModalOpen,
    nodes,
    edges,
    activePresetId,
    presets,
  } = useWorkflowStore();

  const { addAgent } = useAgentsStore();
  const { setActiveNav, addToast, startChatWithAgent } = useAppStore();

  const activePreset = presets.find((p) => p.id === activePresetId);

  // Form State
  const [agentName, setAgentName] = useState('');
  const [description, setDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-3.8-flash');
  const [archetype, setArchetype] = useState<AgentArchetype>('SUPPORT');
  const [autonomyMode, setAutonomyMode] = useState<AutonomyMode>('SEMI_AUTO');
  const [dailyBudgetUsd, setDailyBudgetUsd] = useState(25.0);
  const [isSaving, setIsSaving] = useState(false);
  const [savedAgent, setSavedAgent] = useState<Agent | null>(null);

  // Derive initial values when modal opens or preset changes
  useEffect(() => {
    if (saveFlowModalOpen) {
      setSavedAgent(null);

      // Find AI model nodes in canvas
      const aiNode = nodes.find((n) => n.type === 'ai_model' || n.category === 'AI_MODELS');
      const triggerNodes = nodes.filter((n) => n.category === 'TRIGGERS');
      const toolNodes = nodes.filter((n) => n.category === 'TOOLS' || n.category === 'ACTIONS');
      const policyNodes = nodes.filter((n) => n.category === 'SAFEGUARDS');

      const defaultName = activePreset?.name
        ? `${activePreset.name.replace(/\s+/g, '-')}-Agent`
        : 'Autonomous-Flow-Agent';

      setAgentName(defaultName);
      setDescription(
        activePreset?.description ||
          `Autonomous agent orchestrated via ${nodes.length} flow nodes and ${edges.length} wires.`
      );

      // Synthesize rich system instructions based on active nodes
      const nodeToolsSummary = toolNodes.map((t) => t.name).join(', ') || 'general web tools';
      const triggersSummary = triggerNodes.map((t) => t.name).join(', ') || 'user message';
      const promptFromAiNode = aiNode?.config?.systemPrompt || aiNode?.config?.prompt;

      const synthesizedInstructions =
        promptFromAiNode ||
        `You are ${defaultName}, a specialized autonomous AI agent governed by AgentLens Zero-Trust policies.
Trigger Ingress: ${triggersSummary}
Connected Tools: ${nodeToolsSummary}
Governance Rules: ${policyNodes.length > 0 ? policyNodes.map((p) => p.name).join('; ') : 'Zero-Trust AST validation'}.
Respond helpfully, safely, and execute authorized flow actions when triggered.`;

      setSystemPrompt(synthesizedInstructions);

      if (aiNode?.config?.model) {
        setSelectedModel(aiNode.config.model);
      }

      // Infer archetype
      if (activePresetId?.includes('support') || activePresetId?.includes('triage')) {
        setArchetype('SUPPORT');
      } else if (activePresetId?.includes('research') || activePresetId?.includes('lead')) {
        setArchetype('RESEARCHER');
      } else if (activePresetId?.includes('code') || activePresetId?.includes('pr')) {
        setArchetype('CODING');
      } else if (activePresetId?.includes('multimodal') || activePresetId?.includes('creative')) {
        setArchetype('CREATIVE');
      } else {
        setArchetype('SUPPORT');
      }
    }
  }, [saveFlowModalOpen, nodes, edges, activePreset, activePresetId]);

  if (!saveFlowModalOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentName.trim() || isSaving) return;

    setIsSaving(true);
    try {
      // Gather all tool IDs from active nodes
      const toolNames = nodes
        .filter((n) => n.category === 'TOOLS' || n.category === 'ACTIONS')
        .map((n) => n.name.toLowerCase().replace(/\s+/g, '_'));

      if (toolNames.length === 0) {
        toolNames.push('workflow_flow_evaluator', 'knowledge_search');
      }

      // Collect capabilities
      const capabilities: any[] = ['gemini_chat'];
      if (nodes.some((n) => n.name.toLowerCase().includes('image') || n.name.toLowerCase().includes('visual'))) {
        capabilities.push('image_generation');
      }
      if (nodes.some((n) => n.name.toLowerCase().includes('search') || n.name.toLowerCase().includes('web'))) {
        capabilities.push('google_search');
      }
      if (nodes.some((n) => n.name.toLowerCase().includes('map') || n.name.toLowerCase().includes('geo'))) {
        capabilities.push('google_maps');
      }
      if (nodes.some((n) => n.name.toLowerCase().includes('voice') || n.name.toLowerCase().includes('audio'))) {
        capabilities.push('voice_live', 'audio_transcription');
      }

      const newAgent = await addAgent({
        orgId: 'org_enterprise_fleet',
        userId: 'usr_owner_main',
        name: agentName.trim(),
        description: description.trim() || `Flow-engineered agent built in AgentLens Flow Builder.`,
        archetype,
        autonomyMode,
        dailyBudgetUsd,
        systemPrompt: systemPrompt.trim(),
        model: selectedModel,
        temperature: 0.25,
        status: 'ONLINE',
        framework: `AgentLens Flow Engine (${nodes.length} Nodes)`,
        avatarIcon: archetype === 'CODING' ? 'Code' : archetype === 'RESEARCHER' ? 'Brain' : archetype === 'OUTREACH' ? 'Zap' : 'Bot',
        tools: toolNames,
        capabilities,
        suggestedPrompts: [
          `Execute workflow trigger for ${agentName}`,
          `Show connected tools and node configuration`,
          `Check policy logs and Zero-Trust status`,
        ],
        welcomeMessage: `Greetings! I am ${agentName.trim()}. I have been compiled and deployed from your Flow canvas (${nodes.length} active nodes). How can I assist you?`,
      });

      setSavedAgent(newAgent);

      addToast({
        title: 'Agent Saved to Fleet & Cloud',
        description: `"${agentName}" is now active in your AI Fleet and available in Agent Chat.`,
        type: 'success',
      });
    } catch (err: any) {
      console.error('Failed to save flow agent:', err);
      addToast({
        title: 'Save Failed',
        description: err.message || 'Could not save agent to fleet.',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChatNow = () => {
    if (savedAgent) {
      setSaveFlowModalOpen(false);
      startChatWithAgent(savedAgent.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-[#1c1a17] border border-[#e5e0d5] dark:border-[#33302b] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#c15f3c] to-amber-600 text-white flex items-center justify-center shadow-xs">
              <Workflow className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                Save Flow as Live AI Agent
              </h2>
              <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa]">
                Compile your {nodes.length} canvas nodes & {edges.length} wires into a deployable, interactive agent.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSaveFlowModalOpen(false)}
            className="w-8 h-8 rounded-xl hover:bg-[#f4f1ea] dark:hover:bg-[#282622] text-[#878278] hover:text-[#1f1e1b] dark:text-[#7d7970] dark:hover:text-[#f5f3ef] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {savedAgent ? (
            /* Success State */
            <div className="space-y-5 text-center py-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  Successfully Deployed to Fleet & Cloud
                </span>
                <h3 className="text-lg font-bold text-[#1f1e1b] dark:text-[#f5f3ef] mt-2">
                  {savedAgent.name}
                </h3>
                <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa] max-w-md mx-auto mt-1 leading-relaxed">
                  Your flow architecture is saved with full Zero-Trust telemetry. You can now chat with it live, test prompt injections, or execute automated triggers.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleChatNow}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#c15f3c] hover:bg-[#ad5232] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat & Test With Agent Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSaveFlowModalOpen(false);
                    setActiveNav('agents');
                  }}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] hover:bg-[#faf8f5] dark:hover:bg-[#282622] text-[#1f1e1b] dark:text-[#f5f3ef] text-xs font-bold transition-colors cursor-pointer"
                >
                  <span>View in Fleet Registry</span>
                </button>
              </div>
            </div>
          ) : (
            /* Edit Form */
            <form onSubmit={handleSave} className="space-y-4">
              {/* Active Flow Summary Pill */}
              <div className="p-3.5 rounded-2xl bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <div className="flex items-center gap-2 text-[#878278]">
                  <Layers className="w-4 h-4 text-[#c15f3c]" />
                  <span>Flow Composition:</span>
                  <span className="font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                    {nodes.length} Nodes • {edges.length} Wires
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold border border-amber-500/20">
                    AST Zero-Trust Active
                  </span>
                </div>
              </div>

              {/* Grid 1: Name & Model */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#878278] dark:text-[#7d7970] uppercase tracking-wider mb-1.5 font-mono">
                    Agent Name
                  </label>
                  <input
                    type="text"
                    required
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="e.g. Executive-Inbox-Pilot"
                    className="w-full px-3 py-2.5 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-none focus:ring-1 focus:ring-[#c15f3c]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#878278] dark:text-[#7d7970] uppercase tracking-wider mb-1.5 font-mono">
                    AI Reasoning Model
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-none focus:ring-1 focus:ring-[#c15f3c] cursor-pointer"
                  >
                    <option value="gemini-3.8-flash">Google Gemini 3.8 Flash (Ultra Fast & Governed)</option>
                    <option value="gemini-3.1-pro-preview">Google Gemini 3.1 Pro (Deep Complex Reasoning)</option>
                    <option value="gemini-3.1-flash-lite">Google Gemini 3.1 Flash Lite (Low Latency)</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-bold text-[#878278] dark:text-[#7d7970] uppercase tracking-wider mb-1.5 font-mono">
                  Mission & Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief summary of what this flow agent accomplishes..."
                  className="w-full px-3 py-2 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] text-xs text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-none focus:ring-1 focus:ring-[#c15f3c]"
                />
              </div>

              {/* System Instructions */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-[#878278] dark:text-[#7d7970] uppercase tracking-wider font-mono">
                    Compiled System Instructions
                  </label>
                  <span className="text-[10px] font-mono text-[#878278]">
                    {systemPrompt.length} chars
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] text-xs font-mono text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-none focus:ring-1 focus:ring-[#c15f3c] leading-relaxed resize-none"
                />
              </div>

              {/* Grid 2: Archetype, Autonomy & Budget */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#878278] dark:text-[#7d7970] uppercase tracking-wider mb-1.5 font-mono">
                    Archetype
                  </label>
                  <select
                    value={archetype}
                    onChange={(e) => setArchetype(e.target.value as AgentArchetype)}
                    className="w-full px-2.5 py-2 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] text-xs font-semibold text-[#1f1e1b] dark:text-[#f5f3ef] cursor-pointer"
                  >
                    <option value="SUPPORT">SUPPORT</option>
                    <option value="RESEARCHER">RESEARCHER</option>
                    <option value="OUTREACH">OUTREACH</option>
                    <option value="CODING">CODING</option>
                    <option value="DB_REPORTER">DB_REPORTER</option>
                    <option value="CREATIVE">CREATIVE</option>
                    <option value="MULTIMODAL">MULTIMODAL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#878278] dark:text-[#7d7970] uppercase tracking-wider mb-1.5 font-mono">
                    Autonomy Mode
                  </label>
                  <select
                    value={autonomyMode}
                    onChange={(e) => setAutonomyMode(e.target.value as AutonomyMode)}
                    className="w-full px-2.5 py-2 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] text-xs font-semibold text-[#1f1e1b] dark:text-[#f5f3ef] cursor-pointer"
                  >
                    <option value="FULL_AUTO">FULL_AUTO (Zero Interruption)</option>
                    <option value="SEMI_AUTO">SEMI_AUTO (FIDO2 HITL)</option>
                    <option value="READ_ONLY">READ_ONLY (Safe)</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-[#878278] dark:text-[#7d7970] uppercase tracking-wider font-mono">
                      Daily Budget Cap
                    </label>
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      ${dailyBudgetUsd.toFixed(0)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={dailyBudgetUsd}
                    onChange={(e) => setDailyBudgetUsd(Number(e.target.value))}
                    className="w-full accent-[#c15f3c] cursor-pointer mt-1"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-[#e5e0d5] dark:border-[#33302b] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSaveFlowModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] text-xs font-semibold text-[#5c5850] dark:text-[#b8b4aa] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef] cursor-pointer transition-colors"
                >
                  Cancel
                </button>

                <button
                  id="btn-save-flow-agent"
                  type="submit"
                  disabled={isSaving || !agentName.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[#c15f3c] hover:bg-[#ad5232] disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving Agent...' : 'Save Agent & Add to Fleet'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
