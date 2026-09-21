import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Terminal,
  ChevronDown,
  Bot,
  Sparkles,
} from 'lucide-react';
import { useWorkflowStore } from '../../stores/useWorkflowStore';

export const WorkflowTopHeader: React.FC = () => {
  const {
    presets,
    activePresetId,
    loadPreset,
    executionState,
    runSimulation,
    pauseSimulation,
    resetSimulation,
    zoom,
    setZoom,
    resetView,
    setAddNodeModalOpen,
    logsDrawerOpen,
    setLogsDrawerOpen,
    logs,
    agentSidebarOpen,
    setAgentSidebarOpen,
    aiBuildHistory,
  } = useWorkflowStore();

  const activePreset = presets.find((p) => p.id === activePresetId) || presets[0];

  return (
    <div className="flex-shrink-0 border-b border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5]/95 dark:bg-[#181715]/95 backdrop-blur-md z-20 select-none">
      {/* Blueprint Preset Selector & Workflow Controls */}
      <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Template / Preset Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#c15f3c] to-[#d97706] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              n8n
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#1f1e1b] dark:text-[#f5f3ef]">
                  Agent Flow & Integrations
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#c15f3c]/10 text-[#c15f3c] border border-[#c15f3c]/20">
                  {activePreset.badge}
                </span>
              </div>
              <p className="text-[11px] text-[#878278] dark:text-[#9e998f] font-medium hidden sm:block">
                {activePreset.tagline}
              </p>
            </div>
          </div>

          {/* Preset Dropdown */}
          <div className="relative inline-block ml-2">
            <select
              value={activePresetId}
              onChange={(e) => loadPreset(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] text-xs font-semibold text-[#1f1e1b] dark:text-[#f5f3ef] cursor-pointer hover:border-[#c15f3c] transition-colors focus:outline-none focus:ring-1 focus:ring-[#c15f3c]"
            >
              {presets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#878278] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Right: Action Controls (Run Simulation, Add Node, Zoom, Logs) */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Add Node Button */}
          <button
            onClick={() => setAddNodeModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#211f1c] hover:bg-[#f4f1ea] dark:hover:bg-[#2a2824] border border-[#e5e0d5] dark:border-[#33302b] text-xs font-semibold text-[#1f1e1b] dark:text-[#f5f3ef] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#c15f3c]" />
            <span>Add Node</span>
          </button>

          {/* Run / Simulate Workflow Button */}
          {executionState === 'running' ? (
            <button
              onClick={pauseSimulation}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs animate-pulse"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Simulating...</span>
            </button>
          ) : (
            <button
              onClick={runSimulation}
              className="px-3.5 py-1.5 rounded-xl bg-[#c15f3c] hover:bg-[#ad5232] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Flow</span>
            </button>
          )}

          {/* Reset Flow */}
          <button
            onClick={resetSimulation}
            className="p-1.5 rounded-xl bg-white dark:bg-[#211f1c] hover:bg-[#f4f1ea] dark:hover:bg-[#2a2824] border border-[#e5e0d5] dark:border-[#33302b] text-[#5c5850] dark:text-[#b8b4aa] transition-colors cursor-pointer"
            title="Reset Workflow Execution State"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Divider */}
          <div className="h-5 w-px bg-[#e5e0d5] dark:bg-[#33302b] mx-1" />

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] rounded-xl p-0.5">
            <button
              onClick={() => setZoom(zoom - 0.15)}
              className="p-1 rounded-lg hover:bg-[#f4f1ea] dark:hover:bg-[#2a2824] text-[#5c5850] dark:text-[#b8b4aa] cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-1 font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(zoom + 0.15)}
              className="p-1 rounded-lg hover:bg-[#f4f1ea] dark:hover:bg-[#2a2824] text-[#5c5850] dark:text-[#b8b4aa] cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={resetView}
              className="p-1 rounded-lg hover:bg-[#f4f1ea] dark:hover:bg-[#2a2824] text-[#5c5850] dark:text-[#b8b4aa] cursor-pointer ml-0.5"
              title="Reset View (Fit)"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Live Logs Terminal Toggle */}
          <button
            onClick={() => setLogsDrawerOpen(!logsDrawerOpen)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              logsDrawerOpen
                ? 'bg-[#1f1e1b] text-white border-[#1f1e1b] dark:bg-[#f5f3ef] dark:text-[#181715]'
                : 'bg-white dark:bg-[#211f1c] hover:bg-[#f4f1ea] dark:hover:bg-[#2a2824] border-[#e5e0d5] dark:border-[#33302b] text-[#5c5850] dark:text-[#b8b4aa]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Logs</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold">
              {logs.length}
            </span>
          </button>

          {/* AI Coding Agent Builder Toggle Button */}
          <button
            id="btn-toggle-workflow-agent"
            onClick={() => setAgentSidebarOpen(!agentSidebarOpen)}
            title={agentSidebarOpen ? "Hide AI Builder Agent Sidebar (Ctrl+B / Cmd+B)" : "Show / Open AI Builder Agent Sidebar (Ctrl+B / Cmd+B)"}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
              agentSidebarOpen
                ? 'bg-[#c15f3c] text-white border-[#c15f3c]'
                : 'bg-gradient-to-r from-[#c15f3c]/10 to-amber-500/10 hover:from-[#c15f3c]/20 hover:to-amber-500/20 border-[#c15f3c]/30 text-[#c15f3c] dark:text-[#e07a5f]'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>{agentSidebarOpen ? 'AI Builder' : 'Open AI Builder'}</span>
            {aiBuildHistory.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                agentSidebarOpen ? 'bg-white/20 text-white' : 'bg-[#c15f3c]/20 text-[#c15f3c]'
              }`}>
                {aiBuildHistory.length}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
