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
    setBuildAgentModalOpen,
    agentSidebarOpen,
    setAgentSidebarOpen,
    aiBuildHistory,
  } = useWorkflowStore();

  const activePreset = presets.find((p) => p.id === activePresetId) || presets[0];

  return (
    <div className="flex-shrink-0 border-b border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5]/95 dark:bg-[#181715]/95 backdrop-blur-md z-20 select-none">
      <div className="h-13 px-4 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
        {/* Left: Template / Preset Selector */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs sm:text-sm text-[#1f1e1b] dark:text-[#f5f3ef] tracking-tight">
              Agent Flow
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#c15f3c]/10 text-[#c15f3c] border border-[#c15f3c]/20">
              {activePreset.badge}
            </span>
          </div>

          {/* Preset Dropdown */}
          <div className="relative inline-block">
            <select
              value={activePresetId}
              onChange={(e) => loadPreset(e.target.value)}
              className="appearance-none pl-2.5 pr-7 py-1 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] text-xs font-medium text-[#1f1e1b] dark:text-[#f5f3ef] cursor-pointer hover:border-[#c15f3c] transition-colors focus:outline-none"
            >
              {presets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#878278] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Right: Consolidated Action Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Node & Agent Creation */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setBuildAgentModalOpen(true)}
              className="h-8 px-3 rounded-xl bg-[#c15f3c] hover:bg-[#ad5232] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Build Agent</span>
            </button>

            <button
              onClick={() => setAddNodeModalOpen(true)}
              className="h-8 px-2.5 rounded-xl bg-white dark:bg-[#211f1c] hover:bg-[#f4f1ea] dark:hover:bg-[#2a2824] border border-[#e5e0d5] dark:border-[#33302b] text-xs font-semibold text-[#1f1e1b] dark:text-[#f5f3ef] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-[#c15f3c]" />
              <span>Add Node</span>
            </button>
          </div>

          <div className="h-4 w-px bg-[#e5e0d5] dark:border-[#33302b] mx-0.5" />

          {/* Flow Simulation Controls */}
          <div className="flex items-center gap-1">
            {executionState === 'running' ? (
              <button
                onClick={pauseSimulation}
                className="h-8 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs animate-pulse"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Simulating...</span>
              </button>
            ) : (
              <button
                onClick={runSimulation}
                className="h-8 px-3 rounded-xl bg-[#1f1e1b] dark:bg-[#f5f3ef] text-white dark:text-[#181715] hover:opacity-90 text-xs font-bold flex items-center gap-1.5 transition-opacity cursor-pointer shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run</span>
              </button>
            )}

            <button
              onClick={resetSimulation}
              className="h-8 w-8 rounded-xl bg-white dark:bg-[#211f1c] hover:bg-[#f4f1ea] dark:hover:bg-[#2a2824] border border-[#e5e0d5] dark:border-[#33302b] text-[#5c5850] dark:text-[#b8b4aa] flex items-center justify-center transition-colors cursor-pointer"
              title="Reset Flow"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-4 w-px bg-[#e5e0d5] dark:border-[#33302b] mx-0.5" />

          {/* Zoom Controls */}
          <div className="flex items-center h-8 bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] rounded-xl px-1">
            <button
              onClick={() => setZoom(zoom - 0.15)}
              className="p-1 rounded-lg hover:bg-[#f4f1ea] dark:hover:bg-[#2a2824] text-[#5c5850] dark:text-[#b8b4aa] cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="text-[10px] font-mono px-1 font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(zoom + 0.15)}
              className="p-1 rounded-lg hover:bg-[#f4f1ea] dark:hover:bg-[#2a2824] text-[#5c5850] dark:text-[#b8b4aa] cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
            <button
              onClick={resetView}
              className="p-1 rounded-lg hover:bg-[#f4f1ea] dark:hover:bg-[#2a2824] text-[#5c5850] dark:text-[#b8b4aa] cursor-pointer"
              title="Fit to Screen"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          </div>

          {/* Live Logs Toggle */}
          <button
            onClick={() => setLogsDrawerOpen(!logsDrawerOpen)}
            className={`h-8 px-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              logsDrawerOpen
                ? 'bg-[#1f1e1b] text-white border-[#1f1e1b] dark:bg-[#f5f3ef] dark:text-[#181715]'
                : 'bg-white dark:bg-[#211f1c] hover:bg-[#f4f1ea] dark:hover:bg-[#2a2824] border-[#e5e0d5] dark:border-[#33302b] text-[#5c5850] dark:text-[#b8b4aa]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Logs</span>
            <span className="text-[10px] font-mono text-[#878278]">
              {logs.length}
            </span>
          </button>

          {/* AI Builder Sidebar Toggle */}
          <button
            id="btn-toggle-workflow-agent"
            onClick={() => setAgentSidebarOpen(!agentSidebarOpen)}
            title={agentSidebarOpen ? "Hide AI Builder (Ctrl+B)" : "Open AI Builder (Ctrl+B)"}
            className={`h-8 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
              agentSidebarOpen
                ? 'bg-[#c15f3c] text-white border-[#c15f3c]'
                : 'bg-[#c15f3c]/10 hover:bg-[#c15f3c]/15 border-[#c15f3c]/25 text-[#c15f3c]'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI Builder</span>
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
