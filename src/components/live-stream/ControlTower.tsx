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
            <h2 className="text-sm font-bold text-[#1f1e1b] dark:text-[#f5f3ef] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
              <span>Pending Human Sign-Offs ({pendingActions.length})</span>
            </h2>
            <span className="text-xs text-[#878278] dark:text-[#7d7970] font-mono">
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
                  className="bg-white dark:bg-[#211f1c] border border-amber-500/30 rounded-2xl p-5 shadow-xs space-y-4 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-amber-500/10 rounded-xl text-[#d97706] dark:text-[#f59e0b] border border-amber-500/20">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#1f1e1b] dark:text-[#f5f3ef] flex items-center gap-2">
                          <span>Action Paused:</span>
                          <span className="font-mono text-[#d97706] dark:text-[#f59e0b] font-bold">{action.toolName}</span>
                        </div>
                        <div className="text-xs text-[#5c5850] dark:text-[#b8b4aa] mt-0.5 font-medium">
                          Initiated by <strong className="text-[#1f1e1b] dark:text-[#f5f3ef]">{action.agentName}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-[#5c5850] dark:text-[#b8b4aa] font-mono bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                      <Clock className="w-3.5 h-3.5 text-[#d97706] dark:text-[#f59e0b]" />
                      <span className="font-bold">{action.expiresAt} remaining</span>
                    </div>
                  </div>

                  {/* Agent Internal Rationale */}
                  <div className="p-3 bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] rounded-xl text-xs text-[#5c5850] dark:text-[#b8b4aa]">
                    <span className="text-[#d97706] dark:text-[#f59e0b] uppercase tracking-wider text-[10px] font-bold block mb-1 font-mono">
                      Agent Stated Rationale & Context
                    </span>
                    "{action.agentReasoning}"
                  </div>

                  {/* Parameter Payload JSON Box */}
                  <div>
                    <span className="text-[#878278] dark:text-[#7d7970] uppercase tracking-wider text-[10px] font-bold block mb-1 font-mono">
                      Target Invocation Payload
                    </span>
                    <div className="bg-[#181715] p-3 rounded-xl border border-[#33302b] font-mono text-xs text-[#f5f3ef] overflow-x-auto max-h-36">
                      <pre>{JSON.stringify(action.parameters, null, 2)}</pre>
                    </div>
                  </div>

                  {/* Steering Guidance Textarea (If expanded) */}
                  {isFeedbackOpen && (
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-[#1f1e1b] dark:text-[#f5f3ef] font-mono">
                        Human Corrective Guidance for Agent
                      </label>
                      <textarea
                        value={currentFeedback}
                        onChange={(e) =>
                          setFeedbackMap({ ...feedbackMap, [action.actionId]: e.target.value })
                        }
                        placeholder="e.g. 'Refund rejected: Offer a $20 promotional coupon code instead of full refund.'"
                        rows={2}
                        className="w-full bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] rounded-xl p-2.5 text-xs text-[#1f1e1b] dark:text-[#f5f3ef] placeholder-[#878278] focus:outline-hidden focus:border-[#d97706] font-sans"
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
                          className="px-3 py-2 text-xs text-[#5c5850] dark:text-[#b8b4aa] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef] flex items-center gap-1.5 font-medium cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Add Steering Note</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleReject(action.actionId)}
                          className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject Action</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApprove(action.actionId)}
                          className="px-5 py-2 bg-[#d97706] hover:bg-[#b45309] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
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
                          className="px-3 py-2 text-xs text-[#878278] dark:text-[#7d7970] font-medium cursor-pointer"
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          onClick={() => handleReject(action.actionId)}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
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
      <div className="p-4 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#d97706] dark:text-[#f59e0b] animate-pulse" />
            <h3 className="font-bold text-sm text-[#1f1e1b] dark:text-[#f5f3ef]">
              Gateway Trace Waterfall
            </h3>
            <span className="text-[11px] text-[#878278] dark:text-[#7d7970] font-mono">
              ({filteredTraces.length} events)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Stream On/Off */}
            <button
              onClick={toggleStreaming}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border cursor-pointer ${
                isStreaming
                  ? 'border-[#d97706] bg-amber-500/10 text-[#d97706] dark:text-[#f59e0b]'
                  : 'border-[#e5e0d5] dark:border-[#33302b] text-[#5c5850] dark:text-[#b8b4aa]'
              }`}
            >
              {isStreaming ? <Play className="w-3.5 h-3.5 text-[#d97706] dark:text-[#f59e0b]" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{isStreaming ? 'Live Streaming' : 'Stream Paused'}</span>
            </button>

            {/* Clear button */}
            <button
              onClick={clearTraces}
              className="p-1.5 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] text-[#878278] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef] cursor-pointer transition-colors"
              title="Clear stream logs"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Filters Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-[#e5e0d5] dark:border-[#33302b] text-xs">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#878278]" />
            <input
              type="text"
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              placeholder="Search traces..."
              className="w-full bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-[#1f1e1b] dark:text-[#f5f3ef] placeholder-[#878278] focus:outline-hidden focus:border-[#d97706] font-medium"
            />
          </div>

          {/* Agent Filter */}
          <select
            value={filterAgent}
            onChange={(e) => setFilterAgent(e.target.value)}
            className="bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] rounded-xl px-2.5 py-1.5 text-xs text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:border-[#d97706] font-medium"
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
            className="bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] rounded-xl px-2.5 py-1.5 text-xs text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:border-[#d97706] font-medium"
          >
            <option value="ALL">All Risk Tiers</option>
            <option value="GREEN">GREEN (Safe)</option>
            <option value="YELLOW">YELLOW (Semi-Auto)</option>
            <option value="RED">RED (Blocked)</option>
          </select>
        </div>
      </div>

      {/* Terminal Monospace Stream View */}
      <div className="rounded-2xl bg-[#181715] border border-[#33302b] font-mono text-xs overflow-hidden shadow-md">
        <div className="p-3 bg-[#211f1c] border-b border-[#33302b] flex items-center justify-between text-[#878278] text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
            <span className="ml-2 text-[#f5f3ef] font-bold">stdout / websocket: telemetry:stream</span>
          </div>
          <span>Format: [UTC] [AGENT] [STEP] [PAYLOAD] [LATENCY]</span>
        </div>

        <div className="divide-y divide-[#33302b] max-h-[550px] overflow-y-auto p-2 space-y-0.5">
          {filteredTraces.length === 0 ? (
            <div className="py-8 text-center text-[#878278]">
              No telemetry events matching current filter criteria.
            </div>
          ) : (
            filteredTraces.map((trace) => {
              let tagColor = 'text-emerald-400';
              if (trace.status === 'PAUSED') tagColor = 'text-amber-400';
              if (trace.status === 'BLOCKED') tagColor = 'text-rose-400';

              return (
                <div
                  key={trace.id}
                  onClick={() => setSelectedTrace(trace)}
                  className="py-2 px-3 hover:bg-white/5 rounded-lg cursor-pointer transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <span className="text-[#878278] text-[11px] min-w-[75px]">
                      {trace.timestamp}
                    </span>
                    <span className="text-[#f5f3ef] font-bold min-w-[170px]">
                      [{trace.agentName}]
                    </span>
                    <span className="text-amber-400 min-w-[120px] font-medium">
                      {trace.toolName || trace.stepType}
                    </span>
                    <span className="text-[#b8b4aa] text-[11px] truncate max-w-md">
                      {trace.payload.thought || trace.payload.query || JSON.stringify(trace.payload)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="text-[#878278] text-[11px]">
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
          <div className="bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 text-[#1f1e1b] dark:text-[#f5f3ef]">
            <div className="flex items-center justify-between border-b border-[#e5e0d5] dark:border-[#33302b] pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-[#d97706] dark:text-[#f59e0b]" />
                <h3 className="font-bold text-sm font-mono">
                  Trace Inspector: {selectedTrace.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTrace(null)}
                className="text-[#878278] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b]">
                <span className="text-[#878278] dark:text-[#7d7970] block text-[10px] font-bold">AGENT</span>
                <span className="font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">{selectedTrace.agentName}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b]">
                <span className="text-[#878278] dark:text-[#7d7970] block text-[10px] font-bold">LATENCY</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedTrace.latencyMs}ms</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b]">
                <span className="text-[#878278] dark:text-[#7d7970] block text-[10px] font-bold">TOKEN COST</span>
                <span className="font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">${selectedTrace.tokenCostUsd.toFixed(5)}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b]">
                <span className="text-[#878278] dark:text-[#7d7970] block text-[10px] font-bold">STATUS</span>
                <span className="font-bold text-[#d97706] dark:text-[#f59e0b]">{selectedTrace.status}</span>
              </div>
            </div>

            <div>
              <span className="text-[#878278] dark:text-[#7d7970] uppercase tracking-wider text-[10px] font-bold block mb-1 font-mono">
                Full Ingress & Interception Payload (JSON)
              </span>
              <div className="bg-[#181715] p-4 rounded-xl border border-[#33302b] font-mono text-xs text-[#f5f3ef] max-h-72 overflow-y-auto">
                <pre>{JSON.stringify(selectedTrace, null, 2)}</pre>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedTrace(null)}
                className="px-4 py-2 bg-[#d97706] hover:bg-[#b45309] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
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
