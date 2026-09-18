import React, { useState } from 'react';
import {
  TrendingDown,
  Zap,
  DollarSign,
  Cpu,
  Layers,
  ArrowRight,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';

interface RoutingRule {
  id: string;
  condition: string;
  sourceModel: string;
  fallbackModel: string;
  savingsEstimate: string;
  enabled: boolean;
}

const INITIAL_ROUTING_RULES: RoutingRule[] = [
  {
    id: 'rule_class_01',
    condition: 'Task == "classification" OR prompt_tokens < 200',
    sourceModel: 'gpt-4o ($5.00/M tokens)',
    fallbackModel: 'gpt-4o-mini ($0.15/M tokens)',
    savingsEstimate: '97% reduction',
    enabled: true
  },
  {
    id: 'rule_extract_02',
    condition: 'Task == "json_entity_extraction" AND tools_count <= 2',
    sourceModel: 'claude-3-5-sonnet ($3.00/M tokens)',
    fallbackModel: 'claude-3-5-haiku ($0.25/M tokens)',
    savingsEstimate: '91% reduction',
    enabled: true
  },
  {
    id: 'rule_cache_03',
    condition: 'Cosine Similarity >= 0.94 against Redis Vector Cache',
    sourceModel: 'Any LLM API',
    fallbackModel: 'Instant In-Memory Cache Hit ($0.00)',
    savingsEstimate: '100% cost elimination',
    enabled: true
  }
];

export const CostAnalytics: React.FC = () => {
  const { addToast } = useAppStore();
  const [rules, setRules] = useState<RoutingRule[]>(INITIAL_ROUTING_RULES);

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
    addToast({ title: 'Routing Rule Toggled', type: 'info' });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Savings KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white/85 dark:bg-[#0c0e18]/85 backdrop-blur-md border border-yellow-300/50 dark:border-yellow-500/20 shadow-xs">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider font-mono">
              Direct Dollar Savings
            </span>
            <div className="p-2 rounded-lg bg-yellow-400/20 text-amber-800 dark:text-yellow-300 border border-yellow-400/30">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-950 dark:text-white font-mono">
              $1,482.50
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold font-mono">
              this month
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Eliminated via Semantic Caching & Smart Routing
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white/85 dark:bg-[#0c0e18]/85 backdrop-blur-md border border-yellow-300/50 dark:border-yellow-500/20 shadow-xs">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider font-mono">
              Semantic Cache Hit Ratio
            </span>
            <div className="p-2 rounded-lg bg-yellow-400/20 text-amber-800 dark:text-yellow-300 border border-yellow-400/30">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-950 dark:text-white font-mono">
              34.8%
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-medium">
              (29,340 queries)
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Redis Vector similarity &gt; 0.94
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white/85 dark:bg-[#0c0e18]/85 backdrop-blur-md border border-yellow-300/50 dark:border-yellow-500/20 shadow-xs">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider font-mono">
              Latency Saved
            </span>
            <div className="p-2 rounded-lg bg-yellow-400/20 text-amber-800 dark:text-yellow-300 border border-yellow-400/30">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-950 dark:text-white font-mono">
              -620ms
            </span>
            <span className="text-xs text-amber-700 dark:text-yellow-300 font-bold font-mono">
              avg per hit
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Sub-millisecond cache returns vs. LLM sockets
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white/85 dark:bg-[#0c0e18]/85 backdrop-blur-md border border-yellow-300/50 dark:border-yellow-500/20 shadow-xs">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider font-mono">
              Tokens Saved
            </span>
            <div className="p-2 rounded-lg bg-yellow-400/20 text-amber-800 dark:text-yellow-300 border border-yellow-400/30">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-950 dark:text-white font-mono">
              18.4M
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-medium">
              tokens avoided
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Reduced carbon & server compute load
          </p>
        </div>
      </div>

      {/* Smart Model Routing Rules Engine */}
      <div className="p-5 rounded-xl bg-white/85 dark:bg-[#0c0e18]/85 backdrop-blur-md border border-yellow-300/40 dark:border-yellow-500/20 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-950 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-yellow-400" />
              <span>Smart Dynamic Model Router Rules</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
              Automatically route simple classification & summarization tasks to lean models to eliminate 30-70% of LLM billing
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                rule.enabled
                  ? 'border-yellow-400/60 dark:border-yellow-500/30 bg-yellow-50/40 dark:bg-yellow-950/20'
                  : 'border-yellow-200/50 dark:border-yellow-500/10 bg-slate-50/40 dark:bg-neutral-900/30 opacity-60'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-yellow-400/20 text-slate-900 dark:text-yellow-200 border border-yellow-400/40">
                    IF {rule.condition}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    ({rule.savingsEstimate})
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-700 dark:text-slate-300 pt-1 font-medium">
                  <span className="line-through text-slate-400">{rule.sourceModel}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-600 dark:text-yellow-400" />
                  <span className="font-bold text-amber-800 dark:text-yellow-300">{rule.fallbackModel}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <button
                  onClick={() => toggleRule(rule.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    rule.enabled
                      ? 'bg-yellow-400 hover:bg-yellow-300 text-slate-950 border border-yellow-300 shadow-sm'
                      : 'bg-slate-200 dark:bg-neutral-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {rule.enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
