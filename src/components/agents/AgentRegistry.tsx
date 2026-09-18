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
          <h2 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-amber-600 dark:text-yellow-400" />
            <span>AI Agents Fleet</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
            Manage your autonomous agents, configure safety boundaries, and initiate secure interactive sessions.
          </p>
        </div>

        <button
          onClick={() => setActiveNav('studio')}
          className="px-3.5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm border border-yellow-300 transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-slate-950" />
          <span>Build Agent with Prompt</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="agent-search-input"
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter agents..."
            className="w-full bg-white/90 dark:bg-[#131627] border border-yellow-300/60 dark:border-yellow-500/25 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-950 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400/20 transition-colors"
          />
        </div>

        {/* Autonomy Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          <button
            onClick={() => setAutonomyFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              autonomyFilter === 'ALL'
                ? 'bg-yellow-400 text-slate-950 shadow-sm border border-yellow-300'
                : 'text-slate-700 dark:text-slate-400 hover:bg-yellow-100/50 dark:hover:bg-yellow-950/30'
            }`}
          >
            All ({agents.length})
          </button>
          {TIERS.map((tier) => (
            <button
              key={tier.id}
              onClick={() => setAutonomyFilter(tier.id)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                autonomyFilter === tier.id
                  ? 'bg-yellow-400 text-slate-950 shadow-sm border border-yellow-300'
                  : 'text-slate-700 dark:text-slate-400 hover:bg-yellow-100/50 dark:hover:bg-yellow-950/30'
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
              className={`p-4 rounded-xl bg-white/85 dark:bg-[#0c0e18]/85 backdrop-blur-md border transition-all ${
                isPaused
                  ? 'border-rose-500/40 bg-rose-500/[0.04]'
                  : 'border-yellow-300/50 dark:border-yellow-500/20 hover:border-yellow-400/80 dark:hover:border-yellow-500/40'
              } shadow-xs space-y-3.5`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Agent Identity */}
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg flex-shrink-0 mt-0.5 ${
                      isPaused ? 'bg-rose-500/10 text-rose-600' : 'bg-yellow-400/20 text-amber-700 dark:text-yellow-300 border border-yellow-400/30'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-xs sm:text-sm text-slate-950 dark:text-white">
                        {agent.name}
                      </h3>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-yellow-100/70 dark:bg-yellow-950/40 text-slate-800 dark:text-yellow-300 border border-yellow-300/60 dark:border-yellow-500/20">
                        {agent.framework}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-100/70 dark:bg-yellow-950/60 text-amber-900 dark:text-yellow-300 border border-amber-300/60 dark:border-yellow-500/30">
                        {agent.model}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isPaused
                            ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                            : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {isPaused ? 'HALTED' : 'ONLINE'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl line-clamp-1 font-medium">
                      {agent.description}
                    </p>
                  </div>
                </div>

                {/* Primary Action & Controls */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Chat button */}
                  <button
                    onClick={() => startChatWithAgent(agent.id)}
                    className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-sm border border-yellow-300 transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-slate-950" />
                    <span>Chat</span>
                  </button>

                  {/* Autonomy Selector */}
                  <select
                    value={agent.autonomyMode}
                    onChange={(e) => setAutonomyMode(agent.id, e.target.value as AutonomyMode)}
                    className="bg-yellow-50/70 dark:bg-[#131627] border border-yellow-300/60 dark:border-yellow-500/30 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 dark:text-yellow-300 focus:outline-none focus:border-yellow-500 font-mono"
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
                    className={`p-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
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
                    className="p-1.5 rounded-lg border border-yellow-300/60 dark:border-yellow-500/30 hover:bg-yellow-100/50 dark:hover:bg-yellow-950/40 text-slate-700 dark:text-yellow-300 transition-colors cursor-pointer"
                    title="Agent Configuration"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                  </button>

                  {agents.length > 1 && (
                    <button
                      onClick={() => handleDeleteAgent(agent)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Remove Agent"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Bottom details: Authorized tools & Daily budget */}
              <div className="pt-2 border-t border-yellow-200/50 dark:border-yellow-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                {/* Tools */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] font-mono font-bold">Tools:</span>
                  {agent.tools && agent.tools.length > 0 ? (
                    agent.tools.map((tool) => (
                      <span
                        key={tool}
                        className="px-1.5 py-0.2 rounded bg-yellow-100/70 dark:bg-yellow-950/40 text-slate-900 dark:text-yellow-300 border border-yellow-300/50 dark:border-yellow-500/20 font-mono font-bold text-[10px]"
                      >
                        {tool}()
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 text-[10px]">None</span>
                  )}
                </div>

                {/* Budget */}
                <div className="flex items-center gap-2 font-mono text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                  <span>Spend:</span>
                  <span className="font-bold text-slate-950 dark:text-white">
                    ${agent.spendTodayUsd.toFixed(2)} / ${agent.dailyBudgetUsd.toFixed(2)} USD
                  </span>
                  <div className="w-16 h-1.5 rounded-full bg-yellow-100 dark:bg-[#1a2035] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${spendPercent > 80 ? 'bg-amber-500' : 'bg-yellow-400'}`}
                      style={{ width: `${spendPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredAgents.length === 0 && (
          <div className="p-8 text-center bg-white/85 dark:bg-[#0e111e]/85 rounded-xl border border-yellow-300/40 dark:border-yellow-500/20 space-y-2">
            <Bot className="w-8 h-8 mx-auto text-amber-500" />
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">No agents match your filter criteria.</p>
            <button
              onClick={() => setActiveNav('studio')}
              className="px-3.5 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 rounded-lg text-xs font-bold cursor-pointer border border-yellow-300"
            >
              Build New Agent
            </button>
          </div>
        )}
      </div>

      {/* Remote Prompt Tuning Modal */}
      {tuningAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#0c0e18] border border-yellow-400/80 dark:border-yellow-500/40 rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-yellow-200 dark:border-yellow-500/20 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-600 dark:text-yellow-400" />
                <h3 className="font-bold text-sm text-slate-950 dark:text-white">
                  Configure: {tuningAgent.name}
                </h3>
              </div>
              <button
                onClick={() => setTuningAgent(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  System Prompt
                </label>
                <textarea
                  value={editedPrompt}
                  onChange={(e) => setEditedPrompt(e.target.value)}
                  rows={4}
                  className="w-full bg-yellow-50/30 dark:bg-[#131627] border border-yellow-300/60 dark:border-yellow-500/30 rounded-lg p-2.5 text-xs text-slate-950 dark:text-slate-100 focus:outline-none focus:border-yellow-500 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  Model
                </label>
                <select
                  value={editedModel}
                  onChange={(e) => setEditedModel(e.target.value)}
                  className="w-full bg-yellow-50/30 dark:bg-[#131627] border border-yellow-300/60 dark:border-yellow-500/30 rounded-lg p-2 text-xs text-slate-950 dark:text-slate-100 focus:outline-none focus:border-yellow-500 font-mono"
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
                  <label className="font-bold text-slate-800 dark:text-slate-200">
                    Daily Budget Cap
                  </label>
                  <span className="font-mono font-bold text-amber-700 dark:text-yellow-400">
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
                  className="w-full accent-yellow-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-yellow-200 dark:border-yellow-500/20">
              <button
                onClick={() => setTuningAgent(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-950 dark:hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTuning}
                className="px-4 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs rounded-lg transition-all border border-yellow-300 cursor-pointer"
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
