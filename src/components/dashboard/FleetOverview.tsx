import React from 'react';
import {
  Bot,
  Activity,
  AlertTriangle,
  Zap,
  Radio,
  ShieldCheck,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  Clock,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { useAgentsStore } from '../../stores/useAgentsStore';
import { useLiveStreamStore } from '../../stores/useLiveStreamStore';
import { usePoliciesStore } from '../../stores/usePoliciesStore';
import { AutonomyMode } from '../../types';

export const FleetOverview: React.FC = () => {
  const { setActiveNav, currentOrg } = useAppStore();
  const agents = useAgentsStore((s) => s.agents);
  const traces = useLiveStreamStore((s) => s.traces);
  const pendingActions = useLiveStreamStore((s) => s.pendingActions);
  const policies = usePoliciesStore((s) => s.policies);

  const activeAgentsCount = agents.filter((a) => a.status === 'ONLINE' || a.status === 'BUSY').length;
  const totalDailySpend = agents.reduce((acc, a) => acc + a.spendTodayUsd, 0);
  const totalExecutionsToday = agents.reduce((acc, a) => acc + a.totalExecutions, 0);

  const quotaPercent = Math.round((currentOrg.monthlyRequestsUsed / currentOrg.monthlyRequestLimit) * 100);

  return (
    <div className="space-y-6 pb-12">
      {/* Pending Action Critical Banner (If Any Paused Action Waiting) */}
      {pendingActions.length > 0 && (
        <div 
          onClick={() => setActiveNav('live-stream')}
          className="p-4 rounded-xl bg-gradient-to-r from-amber-100/90 via-yellow-50/80 to-white/90 dark:from-yellow-950/60 dark:via-[#141724] dark:to-[#0e111e] border-2 border-yellow-400/80 dark:border-yellow-400/50 cursor-pointer hover:border-yellow-400 transition-all flex items-center justify-between shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-yellow-400 text-slate-950 font-bold rounded-lg shadow-sm">
              <AlertTriangle className="w-5 h-5 animate-pulse text-slate-950" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-950 dark:text-white flex items-center gap-2">
                <span>{pendingActions.length} Action{pendingActions.length > 1 ? 's' : ''} Suspended in Redis Queue</span>
                <span className="text-xs px-2 py-0.5 rounded bg-yellow-400 text-slate-950 font-bold border border-yellow-300">
                  Requires Human Approval
                </span>
              </div>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5">
                Agent <strong className="font-mono text-slate-950 dark:text-yellow-200">{pendingActions[0].agentName}</strong> paused calling <code className="text-amber-800 dark:text-yellow-300 font-mono font-bold">{pendingActions[0].toolName}</code>. Click to open Control Tower & steer.
              </p>
            </div>
          </div>
          <button className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-sm border border-yellow-300 cursor-pointer">
            <span>Open Approvals Queue</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Primary KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Agents */}
        <div className="p-5 rounded-xl bg-white/85 dark:bg-[#0c0e18]/85 backdrop-blur-md border border-yellow-300/40 dark:border-yellow-500/20 shadow-xs hover:border-yellow-400/70 dark:hover:border-yellow-400/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-400 uppercase tracking-wider font-mono">
              Active Agents
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-950 dark:text-white font-mono">
              {activeAgentsCount}
            </span>
            <span className="text-xs text-slate-700 dark:text-slate-400 font-mono font-medium">
              / {agents.length} registered
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>All heartbeats transmitting</span>
          </div>
        </div>

        {/* Card 2: Daily Actions Evaluated */}
        <div className="p-5 rounded-xl bg-white/85 dark:bg-[#0c0e18]/85 backdrop-blur-md border border-yellow-300/40 dark:border-yellow-500/20 shadow-xs hover:border-yellow-400/70 dark:hover:border-yellow-400/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-400 uppercase tracking-wider font-mono">
              Evaluations Today
            </span>
            <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-950/60 text-slate-950 dark:text-yellow-300 border border-yellow-300/70 dark:border-yellow-500/30">
              <Zap className="w-4 h-4 text-amber-600 dark:text-yellow-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-950 dark:text-white font-mono">
              {totalExecutionsToday.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center font-mono font-bold">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +14%
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-800 dark:text-slate-400 font-medium">
            Gateway latency p95: <span className="font-mono text-slate-950 dark:text-yellow-300 font-bold">1.42ms</span>
          </p>
        </div>

        {/* Card 3: Pending Approvals */}
        <div 
          onClick={() => setActiveNav('live-stream')}
          className="p-5 rounded-xl bg-white/85 dark:bg-[#0c0e18]/85 backdrop-blur-md border border-yellow-300/40 dark:border-yellow-500/20 shadow-xs cursor-pointer hover:border-yellow-400 dark:hover:border-yellow-400 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-400 uppercase tracking-wider font-mono">
              HITL Approvals
            </span>
            <div className="p-2 rounded-lg bg-amber-500/15 text-amber-700 dark:text-yellow-400 border border-amber-500/30">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600 dark:text-yellow-400 font-mono">
              {pendingActions.length}
            </span>
            <span className="text-xs text-slate-800 dark:text-slate-400 font-medium">pending sign-off</span>
          </div>
          <p className="mt-2 text-xs text-slate-800 dark:text-slate-400 flex items-center justify-between font-medium">
            <span>Avg response time: 28s</span>
            <span className="text-slate-950 dark:text-yellow-300 font-bold hover:underline">Review →</span>
          </p>
        </div>

        {/* Card 4: Monthly Quota Gauge */}
        <div className="p-5 rounded-xl bg-white/85 dark:bg-[#0c0e18]/85 backdrop-blur-md border border-yellow-300/40 dark:border-yellow-500/20 shadow-xs hover:border-yellow-400/70 dark:hover:border-yellow-400/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-400 uppercase tracking-wider font-mono">
              Monthly Ingress Quota
            </span>
            <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-950/60 text-slate-950 dark:text-yellow-300 border border-yellow-300/70 dark:border-yellow-500/30">
              <Cpu className="w-4 h-4 text-amber-600 dark:text-yellow-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-950 dark:text-white font-mono">
              {quotaPercent}%
            </span>
            <span className="text-xs text-slate-800 dark:text-slate-400 font-mono font-bold">
              {(currentOrg.monthlyRequestsUsed / 1000).toFixed(0)}k / {(currentOrg.monthlyRequestLimit / 1000).toFixed(0)}k
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-yellow-100/70 dark:bg-[#1a1f36] mt-2.5 overflow-hidden">
            <div 
              className="h-full rounded-full bg-yellow-400 dark:bg-yellow-400"
              style={{ width: `${quotaPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Middle Layout: Live Action Waterfall & Top Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Action Waterfall Stream */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-white/85 dark:bg-[#0c0e18]/85 backdrop-blur-md border border-yellow-300/40 dark:border-yellow-500/20 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-950 dark:text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-amber-600 dark:text-yellow-400" />
                <span>Live Action Waterfall</span>
              </h2>
              <p className="text-xs font-medium text-slate-800 dark:text-slate-300 mt-0.5">
                Sub-millisecond tool interception stream via Redis Pub/Sub
              </p>
            </div>
            <button
              onClick={() => setActiveNav('live-stream')}
              className="text-xs font-bold text-slate-950 dark:text-yellow-300 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Inspect Full Stream</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-yellow-200/50 dark:divide-yellow-500/10 font-mono text-xs max-h-[360px] overflow-y-auto pr-1">
            {traces.slice(0, 7).map((t) => {
              let statusBadge = (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  APPROVED
                </span>
              );
              if (t.status === 'PAUSED') {
                statusBadge = (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-900 dark:text-yellow-300 border border-amber-500/40 animate-pulse">
                    PAUSED (HITL)
                  </span>
                );
              } else if (t.status === 'BLOCKED') {
                statusBadge = (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                    BLOCKED
                  </span>
                );
              }

              return (
                <div key={t.id} className="py-2.5 flex items-center justify-between hover:bg-yellow-50/60 dark:hover:bg-yellow-950/20 px-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-700 dark:text-slate-400 text-[11px] min-w-[70px] font-semibold">
                      {t.timestamp}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-950 dark:text-white">
                          {t.agentName}
                        </span>
                        <span className="text-amber-500 font-bold">→</span>
                        <span className="text-amber-800 dark:text-yellow-300 font-bold">
                          {t.toolName || t.stepType}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-800 dark:text-slate-300 truncate max-w-xs sm:max-w-md font-medium">
                        {t.payload.thought || t.payload.query || JSON.stringify(t.payload)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-slate-700 dark:text-slate-400 text-[11px] hidden sm:inline font-mono font-semibold">
                      {t.latencyMs}ms
                    </span>
                    {statusBadge}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Top Tools & Autonomy Breakdown */}
        <div className="space-y-6">
          {/* Autonomy Breakdown Card */}
          <div className="p-5 rounded-xl bg-white/85 dark:bg-[#0c0e18]/85 backdrop-blur-md border border-yellow-300/40 dark:border-yellow-500/20 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-400 uppercase tracking-wider font-mono">
              Fleet Autonomy Breakdown
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  Full Auto (Zero Gating)
                </span>
                <span className="font-mono font-bold text-slate-950 dark:text-white">
                  {agents.filter(a => a.autonomyMode === 'FULL_AUTO').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  Semi-Auto (HITL Gated)
                </span>
                <span className="font-mono font-bold text-slate-950 dark:text-white">
                  {agents.filter(a => a.autonomyMode === 'SEMI_AUTO').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  Read-Only (No Mutations)
                </span>
                <span className="font-mono font-bold text-slate-950 dark:text-white">
                  {agents.filter(a => a.autonomyMode === 'READ_ONLY').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  Paused / Kill-Switch
                </span>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                  {agents.filter(a => a.autonomyMode === 'PAUSED').length}
                </span>
              </div>
            </div>
            <button
              onClick={() => setActiveNav('agents')}
              className="w-full mt-2 py-1.5 text-xs text-center text-slate-800 dark:text-yellow-300 font-bold hover:text-slate-950 dark:hover:text-yellow-200 border border-yellow-300/60 dark:border-yellow-500/30 rounded-lg hover:bg-yellow-100/50 dark:hover:bg-yellow-950/30 transition-all cursor-pointer"
            >
              Adjust Autonomy Tiers →
            </button>
          </div>

          {/* Quick Studio Synthesizer Teaser */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-yellow-100/80 via-white to-amber-50/70 dark:from-yellow-950/40 dark:via-[#0e111e] dark:to-[#0c0e18] border border-yellow-300/60 dark:border-yellow-500/30 text-slate-950 dark:text-white space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-amber-700 dark:text-yellow-400 text-xs font-bold uppercase tracking-wider font-mono">
              <Sparkles className="w-4 h-4" />
              <span>Agent Studio</span>
            </div>
            <h4 className="text-sm font-bold text-slate-950 dark:text-white">Synthesize an Agent from 1 Prompt</h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              Generate Python agent code with automated tool schemas, virtual key injection, and 1-tap mobile approval handlers.
            </p>
            <button
              onClick={() => setActiveNav('studio')}
              className="w-full py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-sm border border-yellow-300 cursor-pointer"
            >
              Launch Synthesizer
            </button>
          </div>
        </div>
      </div>

      {/* Governed Tools Status Table */}
      <div className="p-5 rounded-xl bg-white/85 dark:bg-[#0c0e18]/85 backdrop-blur-md border border-yellow-300/40 dark:border-yellow-500/20 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-950 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Governed Tools & Safety Interception Rate</span>
            </h3>
            <p className="text-xs font-medium text-slate-800 dark:text-slate-300 mt-0.5">
              Tools monitored by AgentLens Gateway and matched against the Risk Matrix
            </p>
          </div>
          <button
            onClick={() => setActiveNav('policies')}
            className="text-xs font-bold text-slate-950 dark:text-yellow-300 hover:underline cursor-pointer"
          >
            Configure Rules →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-yellow-100/50 dark:bg-yellow-950/30 text-slate-900 dark:text-yellow-300 uppercase tracking-wider font-mono font-bold border-b border-yellow-300/50 dark:border-yellow-500/20">
              <tr>
                <th className="py-2.5 px-3">Tool Identifier</th>
                <th className="py-2.5 px-3">Safety Tier</th>
                <th className="py-2.5 px-3">Condition Rule</th>
                <th className="py-2.5 px-3 text-right">Auto Executed</th>
                <th className="py-2.5 px-3 text-right">Intercepted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-yellow-200/50 dark:divide-yellow-500/10 font-mono">
              {policies.map((p) => (
                <tr key={p.id} className="hover:bg-yellow-50/50 dark:hover:bg-yellow-950/20 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-950 dark:text-white">
                    {p.toolName}
                  </td>
                  <td className="py-2.5 px-3">
                    {p.riskLevel === 'GREEN' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                        GREEN (SAFE)
                      </span>
                    )}
                    {p.riskLevel === 'YELLOW' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-900 dark:text-yellow-300 border border-amber-500/40">
                        YELLOW (SEMI-AUTO)
                      </span>
                    )}
                    {p.riskLevel === 'RED' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                        RED (PROHIBITED)
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-slate-800 dark:text-slate-300 font-sans font-medium">
                    {p.ruleCondition ? (
                      <span className="font-mono bg-yellow-100/70 dark:bg-yellow-950/40 text-slate-950 dark:text-yellow-300 px-2 py-0.5 rounded border border-yellow-300/70 dark:border-yellow-500/30 font-bold">
                        IF {p.ruleCondition.field} {p.ruleCondition.operator} {p.ruleCondition.value}
                      </span>
                    ) : (
                      <span className="text-slate-700 dark:text-slate-400 font-semibold">Universal Tier</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                    {p.autoApprovalCount.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-amber-700 dark:text-yellow-400">
                    {p.interceptedCount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
