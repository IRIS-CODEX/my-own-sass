import React, { useState } from 'react';
import { useWorkflowStore } from '../../stores/useWorkflowStore';
import {
  X,
  Terminal,
  Trash2,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

export const WorkflowLogsDrawer: React.FC = () => {
  const { logs, clearLogs, logsDrawerOpen, setLogsDrawerOpen } = useWorkflowStore();
  const [filterLevel, setFilterLevel] = useState<string>('ALL');

  if (!logsDrawerOpen) return null;

  const filteredLogs =
    filterLevel === 'ALL' ? logs : logs.filter((l) => l.level === filterLevel);

  return (
    <div className="border-t border-[#e5e0d5] dark:border-[#33302b] bg-[#1e1d1a] text-[#f5f3ef] h-60 flex flex-col z-30 select-none shadow-2xl animate-in slide-in-from-bottom duration-200">
      {/* Header & Controls */}
      <div className="px-4 py-2 border-b border-[#33302b] flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-white tracking-tight">
              Live Workflow Telemetry & Execution Stream
            </span>
          </div>

          {/* Level Filter Chips */}
          <div className="flex items-center gap-1.5 ml-4">
            {['ALL', 'INFO', 'SUCCESS', 'INTERCEPT', 'ERROR'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                  filterLevel === lvl
                    ? 'bg-[#c15f3c] text-white'
                    : 'bg-[#2a2824] text-[#878278] hover:text-[#f5f3ef]'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearLogs}
            className="p-1 rounded hover:bg-[#2a2824] text-[#878278] hover:text-[#f5f3ef] cursor-pointer"
            title="Clear Stream"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setLogsDrawerOpen(false)}
            className="p-1 rounded hover:bg-[#2a2824] text-[#878278] hover:text-[#f5f3ef] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Logs Feed */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 text-[11px] font-mono">
        {filteredLogs.length === 0 ? (
          <div className="text-center text-[#878278] py-8">
            No telemetry events recorded for filter "{filterLevel}". Run the workflow simulation to stream live traces.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const timeStr = new Date(log.timestamp).toLocaleTimeString();
            return (
              <div
                key={log.id}
                className={`flex items-start gap-2.5 p-1.5 rounded hover:bg-white/5 transition-colors ${
                  log.level === 'INTERCEPT'
                    ? 'bg-amber-500/10 border-l-2 border-amber-500 text-amber-300'
                    : log.level === 'ERROR'
                    ? 'bg-red-500/10 border-l-2 border-red-500 text-red-300'
                    : log.level === 'SUCCESS'
                    ? 'text-emerald-400'
                    : 'text-[#d5cfc2]'
                }`}
              >
                <span className="text-[#878278] flex-shrink-0">{timeStr}</span>

                <span
                  className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase flex-shrink-0 ${
                    log.level === 'INTERCEPT'
                      ? 'bg-amber-500/20 text-amber-300'
                      : log.level === 'SUCCESS'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : log.level === 'ERROR'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-[#2a2824] text-[#878278]'
                  }`}
                >
                  {log.level}
                </span>

                <span className="font-bold text-white/90 flex-shrink-0">
                  [{log.nodeName}]
                </span>

                <span className="flex-1 leading-relaxed">{log.message}</span>

                {log.latencyMs !== undefined && (
                  <span className="text-[10px] text-[#878278] flex-shrink-0">
                    +{log.latencyMs}ms
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
