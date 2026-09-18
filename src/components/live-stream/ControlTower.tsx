import React, { useState, useEffect } from 'react';
import {
  Radio,
  ShieldAlert,
  Check,
  X,
  MessageSquare,
  Clock,
  Search,
  Filter,
  Trash2,
  Pause,
  Play,
  FileCode,
  Volume2,
  VolumeX,
  Sparkles,
  ChevronRight,
  Info
} from 'lucide-react';
import { useLiveStreamStore } from '../../stores/useLiveStreamStore';
import { useAgentsStore } from '../../stores/useAgentsStore';
import { useAppStore } from '../../stores/useAppStore';
import { TraceEvent, PendingAction } from '../../types';

export const ControlTower: React.FC = () => {
  const {
    traces,
    pendingActions,
    selectedTrace,
    setSelectedTrace,
    filterAgent,
    setFilterAgent,
    filterRisk,
    setFilterRisk,
    filterSearch,
    setFilterSearch,
    isStreaming,
    toggleStreaming,
    clearTraces,
    approveAction,
    rejectAction,
    injectMockTrace
  } = useLiveStreamStore();

  const agents = useAgentsStore((s) => s.agents);
  const { soundEnabled, toggleSound, addToast } = useAppStore();

  // Steering feedback state per action
  const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({});
  const [expandedFeedback, setExpandedFeedback] = useState<Record<string, boolean>>({});

  // Periodic simulated live events when isStreaming is active
  useEffect(() => {
    if (!isStreaming) return;
    const interval = setInterval(() => {
      // 30% chance to simulate incoming trace
      if (Math.random() > 0.65) {
        injectMockTrace();
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [isStreaming, injectMockTrace]);

  const handleApprove = (actionId: string) => {
    approveAction(actionId);
    addToast({
      title: 'Action Approved',
      description: 'The paused tool execution was unblocked and dispatched upstream.',
      type: 'success'
    });
  };

  const handleReject = (actionId: string) => {
    const feedback = feedbackMap[actionId] || '';
    rejectAction(actionId, feedback);
    addToast({
      title: 'Action Blocked & Steered',
      description: 'Corrective natural language guidance sent back to the agent.',
      type: 'info'
    });
    setExpandedFeedback((prev) => ({ ...prev, [actionId]: false }));
  };

  const filteredTraces = traces.filter((t) => {
    const matchesAgent = filterAgent === 'ALL' || t.agentId === filterAgent;
    const matchesRisk = filterRisk === 'ALL' || t.riskLevel === filterRisk;
    const matchesSearch =
      !filterSearch ||
      t.agentName.toLowerCase().includes(filterSearch.toLowerCase()) ||
      (t.toolName && t.toolName.toLowerCase().includes(filterSearch.toLowerCase())) ||
      JSON.stringify(t.payload).toLowerCase().includes(filterSearch.toLowerCase());
    return matchesAgent && matchesRisk && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Pending Actions Queue: High-Priority Approval Cards */}
      {pendingActions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-950 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
              <span>Pending Human Sign-Offs ({pendingActions.length})</span>
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Action TTL: 300s
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {pendingActions.map((action) => {
              const isFeedbackOpen = expandedFeedback[action.actionId] || false;
              const currentFeedback = feedbackMap[action.actionId] || '';

              return (
                <div
                  key={action.actionId}
                  className="bg-white/90 dark:bg-[#0c0e18]/90 backdrop-blur-md border-2 border-yellow-400/80 rounded-xl p-5 shadow-xl shadow-yellow-950/10 space-y-4 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-yellow-400/20 rounded-xl text-amber-600 dark:text-yellow-400 border border-yellow-400/30">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-950 dark:text-white flex items-center gap-2">
                          <span>Action Paused:</span>
                          <span className="font-mono text-amber-600 dark:text-yellow-400 font-bold">{action.toolName}</span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                          Initiated by <strong className="text-slate-900 dark:text-slate-200">{action.agentName}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-mono bg-yellow-400/10 dark:bg-yellow-950/30 px-2.5 py-1 rounded-md border border-yellow-300/60 dark:border-yellow-500/30">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span className="font-bold">{action.expiresAt} remaining</span>
                    </div>
                  </div>

                  {/* Agent Internal Rationale */}
                  <div className="p-3 bg-yellow-50/40 dark:bg-yellow-950/20 border border-yellow-200/60 dark:border-yellow-500/20 rounded-lg text-xs text-slate-700 dark:text-slate-300">
                    <span className="text-amber-800 dark:text-yellow-400 uppercase tracking-wider text-[10px] font-bold block mb-1 font-mono">
                      Agent Stated Rationale & Context
                    </span>
                    "{action.agentReasoning}"
                  </div>

                  {/* Parameter Payload JSON Box */}
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-bold block mb-1 font-mono">
                      Target Invocation Payload
                    </span>
                    <div className="bg-slate-950 p-3 rounded-lg border border-yellow-500/20 font-mono text-xs text-yellow-100/90 overflow-x-auto max-h-36">
                      <pre>{JSON.stringify(action.parameters, null, 2)}</pre>
                    </div>
                  </div>

                  {/* Steering Guidance Textarea (If expanded) */}
                  {isFeedbackOpen && (
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-800 dark:text-slate-200 font-mono">
                        Human Corrective Guidance for Agent
                      </label>
                      <textarea
                        value={currentFeedback}
                        onChange={(e) =>
                          setFeedbackMap({ ...feedbackMap, [action.actionId]: e.target.value })
                        }
                        placeholder="e.g. 'Refund rejected: Offer a $20 promotional coupon code instead of full refund.'"
                        rows={2}
                        className="w-full bg-white/90 dark:bg-[#080910] border border-yellow-300/60 dark:border-yellow-500/30 rounded-lg p-2.5 text-xs text-slate-950 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-yellow-500 font-sans"
                      />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-1">
                    {!isFeedbackOpen ? (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedFeedback({ ...expandedFeedback, [action.actionId]: true })
                          }
                          className="px-3 py-2 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white flex items-center gap-1.5 font-medium cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Add Steering Note</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleReject(action.actionId)}
                          className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject Action</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApprove(action.actionId)}
                          className="px-5 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-sm border border-yellow-300 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>Approve Action</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedFeedback({ ...expandedFeedback, [action.actionId]: false })
                          }
                          className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400 font-medium cursor-pointer"
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          onClick={() => handleReject(action.actionId)}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Send Rejection & Guidance</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Trace Waterfall Header & Controls */}
      <div className="p-4 rounded-xl bg-white/85 dark:bg-[#0c0e18]/85 backdrop-blur-md border border-yellow-300/40 dark:border-yellow-500/20 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-amber-600 dark:text-yellow-400 animate-pulse" />
            <h3 className="font-bold text-sm text-slate-950 dark:text-white">
              Gateway Trace Waterfall
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              ({filteredTraces.length} events)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Stream On/Off */}
            <button
              onClick={toggleStreaming}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border cursor-pointer ${
                isStreaming
                  ? 'border-yellow-400 bg-yellow-400/20 text-yellow-800 dark:text-yellow-300'
                  : 'border-yellow-300/60 dark:border-yellow-500/30 text-slate-600 dark:text-slate-400'
              }`}
            >
              {isStreaming ? <Play className="w-3.5 h-3.5 text-amber-600 dark:text-yellow-400" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{isStreaming ? 'Live Streaming' : 'Stream Paused'}</span>
            </button>

            {/* Clear button */}
            <button
              onClick={clearTraces}
              className="p-1.5 rounded-lg border border-yellow-300/60 dark:border-yellow-500/30 text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
              title="Clear stream logs"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Filters Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-yellow-200/60 dark:border-yellow-500/20 text-xs">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              placeholder="Search traces..."
              className="w-full bg-white/90 dark:bg-[#080910] border border-yellow-300/60 dark:border-yellow-500/30 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-950 dark:text-white focus:outline-none focus:border-yellow-500 font-medium"
            />
          </div>

          {/* Agent Filter */}
          <select
            value={filterAgent}
            onChange={(e) => setFilterAgent(e.target.value)}
            className="bg-white/90 dark:bg-[#080910] border border-yellow-300/60 dark:border-yellow-500/30 rounded-lg px-2.5 py-1.5 text-xs text-slate-950 dark:text-white focus:outline-none focus:border-yellow-500 font-medium"
          >
            <option value="ALL">All Agents</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>

          {/* Risk Level Filter */}
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="bg-white/90 dark:bg-[#080910] border border-yellow-300/60 dark:border-yellow-500/30 rounded-lg px-2.5 py-1.5 text-xs text-slate-950 dark:text-white focus:outline-none focus:border-yellow-500 font-medium"
          >
            <option value="ALL">All Risk Tiers</option>
            <option value="GREEN">GREEN (Safe)</option>
            <option value="YELLOW">YELLOW (Semi-Auto)</option>
            <option value="RED">RED (Blocked)</option>
          </select>
        </div>
      </div>

      {/* Terminal Monospace Stream View */}
      <div className="rounded-xl bg-[#080910] border border-yellow-400/40 dark:border-yellow-500/20 font-mono text-xs overflow-hidden shadow-md">
        <div className="p-3 bg-yellow-50/10 dark:bg-yellow-950/20 border-b border-yellow-400/30 dark:border-yellow-500/20 flex items-center justify-between text-slate-400 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
            <span className="ml-2 text-slate-300 font-bold">stdout / websocket: telemetry:stream</span>
          </div>
          <span>Format: [UTC] [AGENT] [STEP] [PAYLOAD] [LATENCY]</span>
        </div>

        <div className="divide-y divide-yellow-500/10 max-h-[550px] overflow-y-auto p-2 space-y-0.5">
          {filteredTraces.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              No telemetry events matching current filter criteria.
            </div>
          ) : (
            filteredTraces.map((trace) => {
              let tagColor = 'text-emerald-400';
              if (trace.status === 'PAUSED') tagColor = 'text-yellow-400';
              if (trace.status === 'BLOCKED') tagColor = 'text-rose-400';

              return (
                <div
                  key={trace.id}
                  onClick={() => setSelectedTrace(trace)}
                  className="py-2 px-3 hover:bg-yellow-400/10 rounded cursor-pointer transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <span className="text-slate-500 text-[11px] min-w-[75px]">
                      {trace.timestamp}
                    </span>
                    <span className="text-slate-200 font-bold min-w-[170px]">
                      [{trace.agentName}]
                    </span>
                    <span className="text-amber-400 min-w-[120px] font-medium">
                      {trace.toolName || trace.stepType}
                    </span>
                    <span className="text-slate-400 text-[11px] truncate max-w-md">
                      {trace.payload.thought || trace.payload.query || JSON.stringify(trace.payload)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="text-slate-500 text-[11px]">
                      {trace.latencyMs}ms
                    </span>
                    <span className={`text-[10px] font-bold ${tagColor}`}>
                      [{trace.status}]
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Trace JSON Inspection Drawer Modal */}
      {selectedTrace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-white/95 dark:bg-[#0c0e18]/95 backdrop-blur-md border border-yellow-400/50 dark:border-yellow-500/30 rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-4 text-slate-950 dark:text-white">
            <div className="flex items-center justify-between border-b border-yellow-300/40 dark:border-yellow-500/20 pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-amber-600 dark:text-yellow-400" />
                <h3 className="font-bold text-sm font-mono">
                  Trace Inspector: {selectedTrace.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTrace(null)}
                className="text-slate-500 hover:text-slate-950 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-yellow-50/40 dark:bg-yellow-950/20 border border-yellow-300/50 dark:border-yellow-500/20">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-bold">AGENT</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedTrace.agentName}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-yellow-50/40 dark:bg-yellow-950/20 border border-yellow-300/50 dark:border-yellow-500/20">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-bold">LATENCY</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedTrace.latencyMs}ms</span>
              </div>
              <div className="p-2.5 rounded-lg bg-yellow-50/40 dark:bg-yellow-950/20 border border-yellow-300/50 dark:border-yellow-500/20">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-bold">TOKEN COST</span>
                <span className="font-bold text-slate-900 dark:text-white">${selectedTrace.tokenCostUsd.toFixed(5)}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-yellow-50/40 dark:bg-yellow-950/20 border border-yellow-300/50 dark:border-yellow-500/20">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-bold">STATUS</span>
                <span className="font-bold text-amber-700 dark:text-yellow-300">{selectedTrace.status}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-bold block mb-1 font-mono">
                Full Ingress & Interception Payload (JSON)
              </span>
              <div className="bg-slate-950 p-4 rounded-lg border border-yellow-500/20 font-mono text-xs text-yellow-100/90 max-h-72 overflow-y-auto">
                <pre>{JSON.stringify(selectedTrace, null, 2)}</pre>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedTrace(null)}
                className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-bold rounded-lg border border-yellow-300 shadow-sm cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
