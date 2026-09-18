import React, { useState } from 'react';
import {
  Bot,
  Play,
  OctagonAlert,
  Sliders,
  Search,
  MessageSquare,
  Trash2,
  Brain,
  Database,
  Code,
  Sparkles,
  Zap,
  X,
  Plus
} from 'lucide-react';
import { useAgentsStore } from '../../stores/useAgentsStore';
import { useAppStore } from '../../stores/useAppStore';
import { Agent, AutonomyMode, AgentArchetype } from '../../types';

const TIERS: { id: AutonomyMode; label: string; desc: string }[] = [
  { id: 'FULL_AUTO', label: 'Full Auto', desc: 'Permitted tools run without confirmation' },
  { id: 'SEMI_AUTO', label: 'Semi-Auto', desc: 'High-risk tools require human sign-off' },
  { id: 'READ_ONLY', label: 'Read-Only', desc: 'Read queries allowed; writes blocked' },
  { id: 'PAUSED', label: 'Halted', desc: 'Emergency kill-switch active' },
];

export const AgentRegistry: React.FC = () => {
  const {
    agents,
    searchFilter,
    setSearchFilter,
    autonomyFilter,
    setAutonomyFilter,
    setAutonomyMode,
    toggleKillSwitch,
    updateBudget,
    updateSystemPrompt,
    updateModel,
    deleteAgent
  } = useAgentsStore();

  const { addToast, setActiveNav, startChatWithAgent } = useAppStore();

  // Drawer modal for tuning selected agent
  const [tuningAgent, setTuningAgent] = useState<Agent | null>(null);
  const [editedPrompt, setEditedPrompt] = useState('');
  const [editedBudget, setEditedBudget] = useState(25);
  const [editedModel, setEditedModel] = useState('gpt-4o-mini');

  const openTuning = (agent: Agent) => {
    setTuningAgent(agent);
    setEditedPrompt(agent.systemPrompt);
    setEditedBudget(agent.dailyBudgetUsd);
    setEditedModel(agent.model);
  };

  const handleSaveTuning = () => {
    if (!tuningAgent) return;
    updateSystemPrompt(tuningAgent.id, editedPrompt);
    updateBudget(tuningAgent.id, editedBudget);
    updateModel(tuningAgent.id, editedModel);
    addToast({
      title: 'Configuration Updated',
      description: `Saved settings for ${tuningAgent.name}.`,
      type: 'success'
    });
    setTuningAgent(null);
  };

  const handleDeleteAgent = (agent: Agent) => {
    deleteAgent(agent.id);
    addToast({
      title: 'Agent Removed',
      description: `${agent.name} deleted.`,
      type: 'info'
    });
  };

  const getAgentIcon = (archetype?: AgentArchetype, iconName?: string) => {
    if (iconName === 'Zap' || archetype === 'OUTREACH') return Zap;
    if (iconName === 'Brain' || archetype === 'RESEARCHER') return Brain;
    if (iconName === 'Database' || archetype === 'DB_REPORTER') return Database;
    if (iconName === 'Code' || archetype === 'CODING') return Code;
    return Bot;
  };

  const filteredAgents = agents.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      a.description.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesAutonomy = autonomyFilter === 'ALL' || a.autonomyMode === autonomyFilter;
    return matchesSearch && matchesAutonomy;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#1f1e1b] dark:text-[#f5f3ef] flex items-center gap-2">
            <Bot className="w-5 h-5 text-[#d97706] dark:text-[#f59e0b]" />
            <span>AI Agents Fleet</span>
          </h2>
          <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa] mt-0.5 font-medium">
            Manage your autonomous agents, configure safety boundaries, and initiate secure interactive sessions.
          </p>
        </div>

        <button
          onClick={() => setActiveNav('studio')}
          className="px-4 py-2 rounded-xl bg-[#d97706] hover:bg-[#b45309] dark:bg-[#f59e0b] dark:hover:bg-[#fbbf24] text-white dark:text-[#181715] font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Build Agent with Prompt</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#878278] dark:text-[#7d7970]" />
          <input
            id="agent-search-input"
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter agents..."
            className="w-full bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#1f1e1b] dark:text-[#f5f3ef] placeholder-[#878278] dark:placeholder-[#7d7970] focus:outline-hidden focus:border-[#d97706] transition-colors shadow-xs"
          />
        </div>

        {/* Autonomy Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          <button
            onClick={() => setAutonomyFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              autonomyFilter === 'ALL'
                ? 'bg-[#1f1e1b] dark:bg-[#f5f3ef] text-white dark:text-[#181715] shadow-xs'
                : 'bg-white dark:bg-[#211f1c] text-[#5c5850] dark:text-[#b8b4aa] border border-[#e5e0d5] dark:border-[#33302b] hover:bg-[#f4f1ea] dark:hover:bg-[#282622]'
            }`}
          >
            All ({agents.length})
          </button>
          {TIERS.map((tier) => (
            <button
              key={tier.id}
              onClick={() => setAutonomyFilter(tier.id)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                autonomyFilter === tier.id
                  ? 'bg-[#1f1e1b] dark:bg-[#f5f3ef] text-white dark:text-[#181715] shadow-xs'
                  : 'bg-white dark:bg-[#211f1c] text-[#5c5850] dark:text-[#b8b4aa] border border-[#e5e0d5] dark:border-[#33302b] hover:bg-[#f4f1ea] dark:hover:bg-[#282622]'
              }`}
            >
              {tier.label}
            </button>
          ))}
        </div>
      </div>

      {/* Agents Card Grid */}
      <div className="grid grid-cols-1 gap-3.5">
        {filteredAgents.map((agent) => {
          const isPaused = agent.autonomyMode === 'PAUSED';
          const spendPercent = Math.min(Math.round((agent.spendTodayUsd / agent.dailyBudgetUsd) * 100), 100);
          const Icon = getAgentIcon(agent.archetype, agent.avatarIcon);

          return (
            <div
              key={agent.id}
              className={`p-4 rounded-2xl bg-white dark:bg-[#211f1c] border transition-all ${
                isPaused
                  ? 'border-rose-500/40 bg-rose-500/[0.04]'
                  : 'border-[#e5e0d5] dark:border-[#33302b] hover:border-[#d97706]/40 dark:hover:border-[#f59e0b]/40'
              } shadow-xs space-y-3.5`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Agent Identity */}
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-xl flex-shrink-0 mt-0.5 ${
                      isPaused ? 'bg-rose-500/10 text-rose-600' : 'bg-amber-500/10 text-[#d97706] dark:text-[#f59e0b] border border-amber-500/20'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-xs sm:text-sm text-[#1f1e1b] dark:text-[#f5f3ef]">
                        {agent.name}
                      </h3>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-[#b45309] dark:text-[#fbbf24] border border-amber-500/20">
                        {agent.framework}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-[#b45309] dark:text-[#fbbf24] border border-amber-500/20">
                        {agent.model}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          isPaused
                            ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                            : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {isPaused ? 'HALTED' : 'ONLINE'}
                      </span>
                    </div>
                    <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa] mt-1 max-w-2xl line-clamp-1 font-medium">
                      {agent.description}
                    </p>
                  </div>
                </div>

                {/* Primary Action & Controls */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Chat button */}
                  <button
                    onClick={() => startChatWithAgent(agent.id)}
                    className="px-3 py-1.5 bg-[#d97706] hover:bg-[#b45309] dark:bg-[#f59e0b] dark:hover:bg-[#fbbf24] text-white dark:text-[#181715] font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat</span>
                  </button>

                  {/* Autonomy Selector */}
                  <select
                    value={agent.autonomyMode}
                    onChange={(e) => setAutonomyMode(agent.id, e.target.value as AutonomyMode)}
                    className="bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] rounded-xl px-2.5 py-1 text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:border-[#d97706] font-mono shadow-xs"
                  >
                    {TIERS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>

                  {/* Kill Switch */}
                  <button
                    onClick={() => toggleKillSwitch(agent.id)}
                    className={`p-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      isPaused
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'border-rose-300 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                    }`}
                    title={isPaused ? 'Resume Agent' : 'Emergency Stop'}
                  >
                    {isPaused ? <Play className="w-3.5 h-3.5" /> : <OctagonAlert className="w-3.5 h-3.5" />}
                  </button>

                  {/* Settings */}
                  <button
                    onClick={() => openTuning(agent)}
                    className="p-1.5 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] hover:bg-[#faf8f5] dark:hover:bg-[#181715] text-[#5c5850] dark:text-[#b8b4aa] transition-colors cursor-pointer shadow-xs"
                    title="Agent Configuration"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                  </button>

                  {agents.length > 1 && (
                    <button
                      onClick={() => handleDeleteAgent(agent)}
                      className="p-1.5 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] hover:bg-rose-50 dark:hover:bg-rose-950/30 text-[#878278] hover:text-rose-600 transition-colors cursor-pointer"
                      title="Remove Agent"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Bottom details: Authorized tools & Daily budget */}
              <div className="pt-2 border-t border-[#e5e0d5]/60 dark:border-[#33302b]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                {/* Tools */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[#878278] dark:text-[#7d7970] text-[10px] font-mono font-bold">Tools:</span>
                  {agent.tools && agent.tools.length > 0 ? (
                    agent.tools.map((tool) => (
                      <span
                        key={tool}
                        className="px-1.5 py-0.2 rounded bg-[#faf8f5] dark:bg-[#181715] text-[#5c5850] dark:text-[#b8b4aa] border border-[#e5e0d5] dark:border-[#33302b] font-mono font-bold text-[10px]"
                      >
                        {tool}()
                      </span>
                    ))
                  ) : (
                    <span className="text-[#878278] dark:text-[#7d7970] text-[10px]">None</span>
                  )}
                </div>

                {/* Budget */}
                <div className="flex items-center gap-2 font-mono text-[11px] text-[#5c5850] dark:text-[#b8b4aa] font-medium">
                  <span>Spend:</span>
                  <span className="font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                    ${agent.spendTodayUsd.toFixed(2)} / ${agent.dailyBudgetUsd.toFixed(2)} USD
                  </span>
                  <div className="w-16 h-1.5 rounded-full bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${spendPercent > 80 ? 'bg-amber-500' : 'bg-[#d97706] dark:bg-[#f59e0b]'}`}
                      style={{ width: `${spendPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredAgents.length === 0 && (
          <div className="p-8 text-center bg-white dark:bg-[#211f1c] rounded-2xl border border-[#e5e0d5] dark:border-[#33302b] space-y-2">
            <Bot className="w-8 h-8 mx-auto text-[#d97706] dark:text-[#f59e0b]" />
            <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa] font-medium">No agents match your filter criteria.</p>
            <button
              onClick={() => setActiveNav('studio')}
              className="px-3.5 py-1.5 bg-[#d97706] hover:bg-[#b45309] dark:bg-[#f59e0b] dark:hover:bg-[#fbbf24] text-white dark:text-[#181715] rounded-xl text-xs font-bold cursor-pointer"
            >
              Build New Agent
            </button>
          </div>
        )}
      </div>

      {/* Remote Prompt Tuning Modal */}
      {tuningAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#e5e0d5] dark:border-[#33302b] pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#d97706] dark:text-[#f59e0b]" />
                <h3 className="font-bold text-sm text-[#1f1e1b] dark:text-[#f5f3ef]">
                  Configure: {tuningAgent.name}
                </h3>
              </div>
              <button
                onClick={() => setTuningAgent(null)}
                className="text-[#878278] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#1f1e1b] dark:text-[#f5f3ef] block mb-1">
                  System Prompt
                </label>
                <textarea
                  value={editedPrompt}
                  onChange={(e) => setEditedPrompt(e.target.value)}
                  rows={4}
                  className="w-full bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] rounded-xl p-2.5 text-xs text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:border-[#d97706] font-mono font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-[#1f1e1b] dark:text-[#f5f3ef] block mb-1">
                  Model
                </label>
                <select
                  value={editedModel}
                  onChange={(e) => setEditedModel(e.target.value)}
                  className="w-full bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] rounded-xl p-2 text-xs text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:border-[#d97706] font-mono font-medium"
                >
                  <option value="gpt-4o-mini">OpenAI gpt-4o-mini</option>
                  <option value="gpt-4o">OpenAI gpt-4o</option>
                  <option value="claude-3-5-haiku">Anthropic Claude 3.5 Haiku</option>
                  <option value="claude-3-5-sonnet">Anthropic Claude 3.5 Sonnet</option>
                  <option value="gemini-1.5-flash">Google Gemini 1.5 Flash</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                    Daily Budget Cap
                  </label>
                  <span className="font-mono font-bold text-[#d97706] dark:text-[#f59e0b]">
                    ${editedBudget}.00 / day
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={250}
                  step={5}
                  value={editedBudget}
                  onChange={(e) => setEditedBudget(Number(e.target.value))}
                  className="w-full accent-[#d97706] cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e5e0d5] dark:border-[#33302b]">
              <button
                onClick={() => setTuningAgent(null)}
                className="px-3 py-1.5 text-xs font-semibold text-[#5c5850] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTuning}
                className="px-4 py-1.5 bg-[#d97706] hover:bg-[#b45309] dark:bg-[#f59e0b] dark:hover:bg-[#fbbf24] text-white dark:text-[#181715] font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
