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

export const FleetOverview: React.FC = () => {
  const { setActiveNav, currentOrg } = useAppStore();
  const agents = useAgentsStore((s) => s.agents);
  const traces = useLiveStreamStore((s) => s.traces);
  const pendingActions = useLiveStreamStore((s) => s.pendingActions);
  const policies = usePoliciesStore((s) => s.policies);

  const activeAgentsCount = agents.filter((a) => a.status === 'ONLINE' || a.status === 'BUSY').length;
  const totalExecutionsToday = agents.reduce((acc, a) => acc + a.totalExecutions, 0);
  const quotaPercent = Math.round((currentOrg.monthlyRequestsUsed / currentOrg.monthlyRequestLimit) * 100);

  return (
    <div className="space-y-6 pb-12">
      {/* Pending Action Critical Banner (If Any Paused Action Waiting) */}
      {pendingActions.length > 0 && (
        <div 
          onClick={() => setActiveNav('live-stream')}
          className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 cursor-pointer hover:bg-amber-500/15 transition-all flex items-center justify-between shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#d97706] dark:bg-[#f59e0b] text-white dark:text-[#181715] font-bold rounded-xl shadow-xs">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#1f1e1b] dark:text-[#f5f3ef] flex items-center gap-2">
                <span>{pendingActions.length} Action{pendingActions.length > 1 ? 's' : ''} Suspended in Control Queue</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-[#b45309] dark:text-[#fbbf24] font-bold border border-amber-500/30">
                  Requires Human Approval
                </span>
              </div>
              <p className="text-xs font-medium text-[#5c5850] dark:text-[#b8b4aa] mt-0.5">
                Agent <strong className="font-mono text-[#1f1e1b] dark:text-[#f5f3ef]">{pendingActions[0].agentName}</strong> paused calling <code className="text-[#b45309] dark:text-[#fbbf24] font-mono font-bold">{pendingActions[0].toolName}</code>. Click to open Control Tower.
              </p>
            </div>
          </div>
          <button className="px-4 py-2 bg-[#d97706] hover:bg-[#b45309] dark:bg-[#f59e0b] dark:hover:bg-[#fbbf24] text-white dark:text-[#181715] font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer">
            <span>Open Queue</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Primary KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Agents */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs hover:border-[#d97706]/40 dark:hover:border-[#f59e0b]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#878278] dark:text-[#7d7970] uppercase tracking-wider font-mono">
              Active Agents
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1f1e1b] dark:text-[#f5f3ef] font-mono">
              {activeAgentsCount}
            </span>
            <span className="text-xs text-[#878278] dark:text-[#7d7970] font-mono font-medium">
              / {agents.length} registered
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>All heartbeats transmitting</span>
          </div>
        </div>

        {/* Card 2: Daily Actions Evaluated */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs hover:border-[#d97706]/40 dark:hover:border-[#f59e0b]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#878278] dark:text-[#7d7970] uppercase tracking-wider font-mono">
              Evaluations Today
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-[#d97706] dark:text-[#f59e0b] border border-amber-500/20">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1f1e1b] dark:text-[#f5f3ef] font-mono">
              {totalExecutionsToday.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center font-mono font-bold">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +14%
            </span>
          </div>
          <p className="mt-2 text-xs text-[#5c5850] dark:text-[#b8b4aa] font-medium">
            Gateway latency p95: <span className="font-mono text-[#1f1e1b] dark:text-[#f5f3ef] font-bold">1.42ms</span>
          </p>
        </div>

        {/* Card 3: Pending Approvals */}
        <div 
          onClick={() => setActiveNav('live-stream')}
          className="p-5 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs cursor-pointer hover:border-[#d97706]/40 dark:hover:border-[#f59e0b]/40 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#878278] dark:text-[#7d7970] uppercase tracking-wider font-mono">
              HITL Approvals
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-[#d97706] dark:text-[#f59e0b] border border-amber-500/20">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#d97706] dark:text-[#f59e0b] font-mono">
              {pendingActions.length}
            </span>
            <span className="text-xs text-[#5c5850] dark:text-[#b8b4aa] font-medium">pending sign-off</span>
          </div>
          <p className="mt-2 text-xs text-[#5c5850] dark:text-[#b8b4aa] flex items-center justify-between font-medium">
            <span>Avg response time: 28s</span>
            <span className="text-[#d97706] dark:text-[#f59e0b] font-bold hover:underline">Review →</span>
          </p>
        </div>

        {/* Card 4: Monthly Quota Gauge */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs hover:border-[#d97706]/40 dark:hover:border-[#f59e0b]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#878278] dark:text-[#7d7970] uppercase tracking-wider font-mono">
              Monthly Ingress Quota
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-[#d97706] dark:text-[#f59e0b] border border-amber-500/20">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#1f1e1b] dark:text-[#f5f3ef] font-mono">
              {quotaPercent}%
            </span>
            <span className="text-xs text-[#878278] dark:text-[#7d7970] font-mono font-bold">
              {(currentOrg.monthlyRequestsUsed / 1000).toFixed(0)}k / {(currentOrg.monthlyRequestLimit / 1000).toFixed(0)}k
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] mt-2.5 overflow-hidden">
            <div 
              className="h-full rounded-full bg-[#d97706] dark:bg-[#f59e0b]"
              style={{ width: `${quotaPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Middle Layout: Live Action Waterfall & Fleet Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Action Waterfall Stream */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#1f1e1b] dark:text-[#f5f3ef] flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#d97706] dark:text-[#f59e0b]" />
                <span>Live Action Waterfall</span>
              </h2>
              <p className="text-xs font-medium text-[#5c5850] dark:text-[#b8b4aa] mt-0.5">
                Sub-millisecond tool interception stream via Redis Gateway
              </p>
            </div>
            <button
              onClick={() => setActiveNav('live-stream')}
              className="text-xs font-bold text-[#d97706] dark:text-[#f59e0b] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Inspect Full Stream</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[#e5e0d5]/60 dark:divide-[#33302b]/60 font-mono text-xs max-h-[360px] overflow-y-auto pr-1">
            {traces.slice(0, 7).map((t) => {
              let statusBadge = (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  APPROVED
                </span>
              );
              if (t.status === 'PAUSED') {
                statusBadge = (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-[#b45309] dark:text-[#fbbf24] border border-amber-500/30 animate-pulse">
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
                <div key={t.id} className="py-2.5 flex items-center justify-between hover:bg-[#faf8f5] dark:hover:bg-[#181715] px-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-[#878278] dark:text-[#7d7970] text-[11px] min-w-[70px] font-semibold">
                      {t.timestamp}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                          {t.agentName}
                        </span>
                        <span className="text-[#878278] font-bold">→</span>
                        <span className="text-[#d97706] dark:text-[#f59e0b] font-bold">
                          {t.toolName || t.stepType}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#5c5850] dark:text-[#b8b4aa] truncate max-w-xs sm:max-w-md font-medium">
                        {t.payload.thought || t.payload.query || JSON.stringify(t.payload)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[#878278] dark:text-[#7d7970] text-[11px] hidden sm:inline font-mono font-semibold">
                      {t.latencyMs}ms
                    </span>
                    {statusBadge}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Fleet Breakdown & Studio Teaser */}
        <div className="space-y-6">
          {/* Autonomy Breakdown Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-[#878278] dark:text-[#7d7970] uppercase tracking-wider font-mono">
              Fleet Autonomy Breakdown
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[#5c5850] dark:text-[#b8b4aa] font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  Full Auto (Zero Gating)
                </span>
                <span className="font-mono font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                  {agents.filter(a => a.autonomyMode === 'FULL_AUTO').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[#5c5850] dark:text-[#b8b4aa] font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  Semi-Auto (HITL Gated)
                </span>
                <span className="font-mono font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                  {agents.filter(a => a.autonomyMode === 'SEMI_AUTO').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[#5c5850] dark:text-[#b8b4aa] font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  Read-Only (No Mutations)
                </span>
                <span className="font-mono font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                  {agents.filter(a => a.autonomyMode === 'READ_ONLY').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[#5c5850] dark:text-[#b8b4aa] font-medium">
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
              className="w-full mt-2 py-2 text-xs text-center text-[#1f1e1b] dark:text-[#f5f3ef] font-bold border border-[#e5e0d5] dark:border-[#33302b] rounded-xl hover:bg-[#faf8f5] dark:hover:bg-[#181715] transition-all cursor-pointer"
            >
              Adjust Autonomy Tiers →
            </button>
          </div>

          {/* Quick Studio Synthesizer Teaser */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] text-[#1f1e1b] dark:text-[#f5f3ef] space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-[#d97706] dark:text-[#f59e0b] text-xs font-bold uppercase tracking-wider font-mono">
              <Sparkles className="w-4 h-4" />
              <span>Agent Studio</span>
            </div>
            <h4 className="text-sm font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">Synthesize an Agent from 1 Prompt</h4>
            <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa] leading-relaxed font-medium">
              Generate Python agent code with automated tool schemas, virtual key injection, and 1-tap mobile approval handlers.
            </p>
            <button
              onClick={() => setActiveNav('studio')}
              className="w-full py-2 bg-[#d97706] hover:bg-[#b45309] dark:bg-[#f59e0b] dark:hover:bg-[#fbbf24] text-white dark:text-[#181715] font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Launch Synthesizer
            </button>
          </div>
        </div>
      </div>

      {/* Governed Tools Status Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#1f1e1b] dark:text-[#f5f3ef] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Governed Tools & Safety Interception Rate</span>
            </h3>
            <p className="text-xs font-medium text-[#5c5850] dark:text-[#b8b4aa] mt-0.5">
              Tools monitored by AgentLens Gateway and matched against the Risk Matrix
            </p>
          </div>
          <button
            onClick={() => setActiveNav('policies')}
            className="text-xs font-bold text-[#d97706] dark:text-[#f59e0b] hover:underline cursor-pointer"
          >
            Configure Rules →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#faf8f5] dark:bg-[#181715] text-[#878278] dark:text-[#7d7970] uppercase tracking-wider font-mono font-bold border-b border-[#e5e0d5] dark:border-[#33302b]">
              <tr>
                <th className="py-2.5 px-3">Tool Identifier</th>
                <th className="py-2.5 px-3">Safety Tier</th>
                <th className="py-2.5 px-3">Condition Rule</th>
                <th className="py-2.5 px-3 text-right">Auto Executed</th>
                <th className="py-2.5 px-3 text-right">Intercepted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e0d5]/60 dark:divide-[#33302b]/60 font-mono">
              {policies.map((p) => (
                <tr key={p.id} className="hover:bg-[#faf8f5] dark:hover:bg-[#181715] transition-colors">
                  <td className="py-2.5 px-3 font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                    {p.toolName}
                  </td>
                  <td className="py-2.5 px-3">
                    {p.riskLevel === 'GREEN' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                        GREEN (SAFE)
                      </span>
                    )}
                    {p.riskLevel === 'YELLOW' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-[#b45309] dark:text-[#fbbf24] border border-amber-500/30">
                        YELLOW (SEMI-AUTO)
                      </span>
                    )}
                    {p.riskLevel === 'RED' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                        RED (PROHIBITED)
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-[#5c5850] dark:text-[#b8b4aa] font-sans font-medium">
                    {p.ruleCondition ? (
                      <span className="font-mono bg-amber-500/10 text-[#b45309] dark:text-[#fbbf24] px-2 py-0.5 rounded border border-amber-500/20 font-bold">
                        IF {p.ruleCondition.field} {p.ruleCondition.operator} {p.ruleCondition.value}
                      </span>
                    ) : (
                      <span className="text-[#878278] dark:text-[#7d7970] font-semibold">Universal Tier</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                    {p.autoApprovalCount.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-[#d97706] dark:text-[#f59e0b]">
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
