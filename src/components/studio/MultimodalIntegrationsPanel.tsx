import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Mic,
  Video,
  MapPin,
  Search,
  Music,
  Database,
  Volume2,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Layers,
  ChevronRight,
  Play,
  RotateCcw,
  Sliders,
  ExternalLink,
  ShieldCheck,
  Zap,
  Save,
  Bot,
  ArrowRight,
  X,
} from 'lucide-react';
import { AgentMultimodalCapability, AgentIntegrationsConfig, Agent } from '../../types';
import { useAgentsStore } from '../../stores/useAgentsStore';
import { useAppStore } from '../../stores/useAppStore';

export interface MultimodalFeatureDef {
  id: AgentMultimodalCapability;
  title: string;
  badge: string;
  model: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  category: 'CREATIVE' | 'VOICE_AUDIO' | 'GROUNDING' | 'PERSISTENCE' | 'CORE';
}

export const MULTIMODAL_FEATURES: MultimodalFeatureDef[] = [
  {
    id: 'image_generation',
    title: 'Image Creation & Editing',
    badge: 'Nano Banana 2',
    model: 'gemini-3.1-flash-image-preview',
    description: 'Generate high-resolution visual assets and edit existing images with prompt-driven instructions and custom aspect ratios.',
    icon: ImageIcon,
    accentColor: 'text-amber-500',
    category: 'CREATIVE',
  },
  {
    id: 'voice_live',
    title: 'Live Voice Conversations',
    badge: 'Live Audio',
    model: 'gemini-3.8-live',
    description: 'Engage in natural, low-latency spoken conversations with real-time audio playback and expressive voice synthesis.',
    icon: Volume2,
    accentColor: 'text-emerald-500',
    category: 'VOICE_AUDIO',
  },
  {
    id: 'video_generation',
    title: 'Video Generation & Animation',
    badge: 'Veo 3',
    model: 'veo-3.1-fast-generate-preview',
    description: 'Transform prompts and reference images into cinematic video clips in 16:9 widescreen or 9:16 portrait formats.',
    icon: Video,
    accentColor: 'text-blue-500',
    category: 'CREATIVE',
  },
  {
    id: 'google_maps',
    title: 'Google Maps Grounding',
    badge: 'Places & Geo',
    model: 'gemini-3.5-flash',
    description: 'Ground responses in real-time geospatial data, venue reviews, coordinates, and navigation metadata.',
    icon: MapPin,
    accentColor: 'text-rose-500',
    category: 'GROUNDING',
  },
  {
    id: 'google_search',
    title: 'Google Search Grounding',
    badge: 'Live Web',
    model: 'gemini-3.5-flash',
    description: 'Verify facts and fetch up-to-the-minute web information with live citations and web source links.',
    icon: Search,
    accentColor: 'text-cyan-500',
    category: 'GROUNDING',
  },
  {
    id: 'music_generation',
    title: 'Music Generation',
    badge: 'Lyria 3',
    model: 'lyria-3-clip-preview / pro',
    description: 'Compose original music clips (up to 30s) and full-length soundtrack stems directly from text and mood prompts.',
    icon: Music,
    accentColor: 'text-purple-500',
    category: 'CREATIVE',
  },
  {
    id: 'firebase_auth_db',
    title: 'Firebase Auth & Cloud Firestore',
    badge: 'Google Cloud',
    model: 'Firestore SDK',
    description: 'Authenticate team members via Google Auth and synchronize persistent agent state, memories, and audit logs.',
    icon: Database,
    accentColor: 'text-orange-500',
    category: 'PERSISTENCE',
  },
  {
    id: 'audio_transcription',
    title: 'Microphone & Audio Transcription',
    badge: 'Speech-to-Text',
    model: 'gemini-3.5-transcribe',
    description: 'Convert voice recordings, user mic inputs, and uploaded audio files into accurate verbatim text transcripts.',
    icon: Mic,
    accentColor: 'text-teal-500',
    category: 'VOICE_AUDIO',
  },
  {
    id: 'gemini_chat',
    title: 'Multi-Turn Gemini Chatbot',
    badge: 'Core LLM',
    model: 'gemini-3.1-pro / 3.5-flash / lite',
    description: 'Maintain multi-turn conversation memory, dynamic system instructions, and smart model tier routing.',
    icon: MessageSquare,
    accentColor: 'text-amber-500',
    category: 'CORE',
  },
];

interface Props {
  selectedCapabilities: AgentMultimodalCapability[];
  onChangeCapabilities: (caps: AgentMultimodalCapability[]) => void;
  selectedModel: string;
  onChangeModel: (model: string) => void;
  compact?: boolean;
}

export const MultimodalIntegrationsPanel: React.FC<Props> = ({
  selectedCapabilities,
  onChangeCapabilities,
  selectedModel,
  onChangeModel,
  compact = false,
}) => {
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'CREATIVE' | 'VOICE_AUDIO' | 'GROUNDING' | 'PERSISTENCE' | 'CORE'>('ALL');

  const { addAgent } = useAgentsStore();
  const { setActiveNav, addToast, startChatWithAgent } = useAppStore();

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveName, setSaveName] = useState('Multimodal-Integrations-Agent');
  const [saveDesc, setSaveDesc] = useState('Agent equipped with custom selected multimodal AI capabilities.');
  const [isSaving, setIsSaving] = useState(false);
  const [savedAgent, setSavedAgent] = useState<Agent | null>(null);

  const toggleCapability = (capId: AgentMultimodalCapability) => {
    if (selectedCapabilities.includes(capId)) {
      onChangeCapabilities(selectedCapabilities.filter((id) => id !== capId));
    } else {
      onChangeCapabilities([...selectedCapabilities, capId]);
    }
  };

  const selectAll = () => {
    onChangeCapabilities(MULTIMODAL_FEATURES.map((f) => f.id));
  };

  const clearAll = () => {
    onChangeCapabilities(['gemini_chat']);
  };

  const handleSaveIntegrationsAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveName.trim() || isSaving) return;

    setIsSaving(true);
    try {
      const capabilitiesToSave: AgentMultimodalCapability[] =
        selectedCapabilities.length > 0 ? selectedCapabilities : ['gemini_chat'];
      const capNames = capabilitiesToSave.map((c) => c.replace(/_/g, ' ')).join(', ');

      const newAgent = await addAgent({
        orgId: 'org_enterprise_fleet',
        userId: 'usr_owner_main',
        name: saveName.trim(),
        description: saveDesc.trim() || `Agent equipped with ${capNames}.`,
        archetype: capabilitiesToSave.includes('image_generation') || capabilitiesToSave.includes('video_generation') ? 'CREATIVE' : 'SUPPORT',
        autonomyMode: 'SEMI_AUTO',
        dailyBudgetUsd: 25.0,
        systemPrompt: `You are ${saveName.trim()}, a multimodal AI agent equipped with the following capabilities: ${capNames}.\nModel: ${selectedModel}.\nRespond interactively, execute tools, and assist the user across text, voice, visual, and search queries.`,
        model: selectedModel,
        temperature: 0.2,
        status: 'ONLINE',
        framework: 'AgentLens Multimodal Engine v3.8',
        avatarIcon: 'Sparkles',
        tools: capabilitiesToSave.map((c) => `tool_${c}`),
        capabilities: capabilitiesToSave,
        suggestedPrompts: [
          'What multimodal capabilities do you have enabled?',
          'Generate a test response with your active model',
          'Check your integrated tool status',
        ],
        welcomeMessage: `Hello! I am ${saveName.trim()}. I am configured with ${selectedCapabilities.length} multimodal capability modules (${capNames}). How can I help you today?`,
      });

      setSavedAgent(newAgent);
      addToast({
        title: 'Agent Saved Successfully',
        description: `"${newAgent.name}" is now stored in your Fleet and ready to chat.`,
        type: 'success',
      });
    } catch (err: any) {
      addToast({
        title: 'Save Failed',
        description: err.message || 'Could not save agent.',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredFeatures = MULTIMODAL_FEATURES.filter((f) =>
    filterCategory === 'ALL' ? true : f.category === filterCategory
  );

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e5e0d5] dark:border-[#33302b] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#d97706] dark:text-[#f59e0b]" />
            <h3 className="text-sm font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
              Integrations & AI Capabilities
            </h3>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-[#b45309] dark:text-[#fbbf24] border border-amber-500/20">
              {selectedCapabilities.length} Active
            </span>
          </div>
          {!compact && (
            <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa] mt-0.5">
              Enable advanced vision, audio, search grounding, video, music, and database capabilities for this agent.
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => {
              setSavedAgent(null);
              setIsSaveModalOpen(true);
            }}
            className="px-2.5 py-1 rounded-lg bg-[#d97706] hover:bg-[#b45309] dark:bg-[#f59e0b] dark:hover:bg-[#fbbf24] text-white dark:text-[#181715] font-bold text-[11px] flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Agent</span>
          </button>
          <span className="text-[#878278]">•</span>
          <button
            type="button"
            onClick={selectAll}
            className="text-[11px] font-bold text-[#d97706] hover:text-[#b45309] dark:text-[#f59e0b] dark:hover:text-[#fbbf24] cursor-pointer"
          >
            Enable All
          </button>
          <span className="text-[#878278]">•</span>
          <button
            type="button"
            onClick={clearAll}
            className="text-[11px] font-bold text-[#878278] hover:text-[#1f1e1b] dark:text-[#7d7970] dark:hover:text-[#f5f3ef] cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Model Tier Selector */}
      <div className="p-3 rounded-xl bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#d97706] dark:text-[#f59e0b]" />
          <div>
            <span className="text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef] block">
              Primary Model Engine
            </span>
            <span className="text-[11px] text-[#5c5850] dark:text-[#b8b4aa]">
              Select the default LLM reasoning tier
            </span>
          </div>
        </div>

        <select
          value={selectedModel}
          onChange={(e) => onChangeModel(e.target.value)}
          className="bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] rounded-lg px-3 py-1.5 text-xs text-[#1f1e1b] dark:text-[#f5f3ef] font-mono focus:outline-hidden focus:border-[#d97706]"
        >
          <option value="gemini-3.5-flash">gemini-3.5-flash (Balanced & Multimodal)</option>
          <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Complex Reasoning)</option>
          <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Ultra Fast & Low Latency)</option>
          <option value="gemini-3.8-flash">gemini-3.8-flash (General Purpose)</option>
        </select>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-1.5">
        {[
          { id: 'ALL', label: 'All Capabilities' },
          { id: 'CREATIVE', label: 'Creative & Visual' },
          { id: 'VOICE_AUDIO', label: 'Voice & Speech' },
          { id: 'GROUNDING', label: 'Search & Maps' },
          { id: 'PERSISTENCE', label: 'Database & Auth' },
        ].map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setFilterCategory(cat.id as any)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              filterCategory === cat.id
                ? 'bg-[#1f1e1b] text-white dark:bg-[#f5f3ef] dark:text-[#181715]'
                : 'bg-[#faf8f5] dark:bg-[#181715] text-[#5c5850] dark:text-[#b8b4aa] border border-[#e5e0d5] dark:border-[#33302b] hover:border-[#878278]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid of Multimodal Capabilities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredFeatures.map((feat) => {
          const isSelected = selectedCapabilities.includes(feat.id);
          const Icon = feat.icon;

          return (
            <div
              key={feat.id}
              onClick={() => toggleCapability(feat.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between select-none shadow-xs ${
                isSelected
                  ? 'border-[#d97706] dark:border-[#f59e0b] bg-amber-500/5 dark:bg-amber-500/10'
                  : 'border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] hover:bg-[#faf8f5] dark:hover:bg-[#282622]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-amber-500/20 text-[#d97706] dark:text-[#f59e0b]' : 'bg-[#faf8f5] dark:bg-[#181715] text-[#878278]'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                        {feat.title}
                      </h4>
                      <span className="text-[10px] font-mono text-[#878278] dark:text-[#7d7970]">
                        {feat.model}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] text-[#5c5850] dark:text-[#b8b4aa] font-bold">
                      {feat.badge}
                    </span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-4 h-4 accent-[#d97706] dark:accent-[#f59e0b] cursor-pointer"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-[#5c5850] dark:text-[#b8b4aa] leading-relaxed line-clamp-2">
                  {feat.description}
                </p>
              </div>

              {isSelected && (
                <div className="mt-2.5 pt-2 border-t border-amber-500/20 flex items-center justify-between text-[10px] font-mono text-[#b45309] dark:text-[#fbbf24] font-bold">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Active In Agent Runtime
                  </span>
                  <span>Ready</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Deploy Bar */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#d97706] text-white">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef] block">
              Ready to deploy {selectedCapabilities.length} configured capability modules?
            </span>
            <span className="text-[11px] text-[#5c5850] dark:text-[#b8b4aa]">
              Save this configuration as a live agent and immediately test it in Agent Chat.
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setSavedAgent(null);
            setIsSaveModalOpen(true);
          }}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#d97706] hover:bg-[#b45309] dark:bg-[#f59e0b] dark:hover:bg-[#fbbf24] text-white dark:text-[#181715] font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save & Deploy Agent to Fleet</span>
        </button>
      </div>

      {/* Save Agent Modal */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-[#1c1a17] border border-[#e5e0d5] dark:border-[#33302b] rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-amber-500/10 text-[#d97706] dark:text-[#f59e0b]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                  Save Agent with Selected Capabilities
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSaveModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-[#f4f1ea] dark:hover:bg-[#282622] text-[#878278] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              {savedAgent ? (
                <div className="text-center py-4 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                      {savedAgent.name} Saved & Ready!
                    </h4>
                    <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa] mt-1">
                      Agent is registered with {savedAgent.capabilities?.length || 0} active capabilities.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSaveModalOpen(false);
                        startChatWithAgent(savedAgent.id);
                      }}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#d97706] hover:bg-[#b45309] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Chat with Agent Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsSaveModalOpen(false);
                        setActiveNav('agents');
                      }}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] text-[#1f1e1b] dark:text-[#f5f3ef] text-xs font-bold cursor-pointer"
                    >
                      <span>View in Fleet</span>
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveIntegrationsAgent} className="space-y-3.5">
                  <div className="p-2.5 rounded-xl bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] text-[11px] font-mono">
                    <span className="text-[#878278] block mb-1">Active Capabilities ({selectedCapabilities.length}):</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedCapabilities.map((c) => (
                        <span key={c} className="px-1.5 py-0.5 rounded bg-amber-500/10 text-[#d97706] dark:text-[#f59e0b] font-bold">
                          {c.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#878278] dark:text-[#7d7970] uppercase font-mono mb-1">
                      Agent Name
                    </label>
                    <input
                      type="text"
                      required
                      value={saveName}
                      onChange={(e) => setSaveName(e.target.value)}
                      placeholder="e.g. Vision-Voice-Assistant"
                      className="w-full px-3 py-2 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-none focus:ring-1 focus:ring-[#d97706]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#878278] dark:text-[#7d7970] uppercase font-mono mb-1">
                      Description & Mission
                    </label>
                    <input
                      type="text"
                      value={saveDesc}
                      onChange={(e) => setSaveDesc(e.target.value)}
                      placeholder="Brief summary of agent scope..."
                      className="w-full px-3 py-2 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] text-xs text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-none focus:ring-1 focus:ring-[#d97706]"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#e5e0d5] dark:border-[#33302b]">
                    <button
                      type="button"
                      onClick={() => setIsSaveModalOpen(false)}
                      className="px-3.5 py-2 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] text-xs font-semibold text-[#5c5850] dark:text-[#b8b4aa] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving || !saveName.trim()}
                      className="px-4 py-2 rounded-xl bg-[#d97706] hover:bg-[#b45309] dark:bg-[#f59e0b] dark:hover:bg-[#fbbf24] disabled:opacity-50 text-white dark:text-[#181715] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSaving ? 'Saving...' : 'Save Agent'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
