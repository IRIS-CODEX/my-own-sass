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
        <div className="p-5 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs">
          <div className="flex items-center justify-between text-[#878278] dark:text-[#7d7970]">
            <span className="text-xs font-bold uppercase tracking-wider font-mono">
              Direct Dollar Savings
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-[#d97706] dark:text-[#f59e0b] border border-amber-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1f1e1b] dark:text-[#f5f3ef] font-mono">
              $1,482.50
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold font-mono">
              this month
            </span>
          </div>
          <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa] mt-1 font-medium">
            Eliminated via Semantic Caching & Smart Routing
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs">
          <div className="flex items-center justify-between text-[#878278] dark:text-[#7d7970]">
            <span className="text-xs font-bold uppercase tracking-wider font-mono">
              Semantic Cache Hit Ratio
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-[#d97706] dark:text-[#f59e0b] border border-amber-500/20">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1f1e1b] dark:text-[#f5f3ef] font-mono">
              34.8%
            </span>
            <span className="text-xs text-[#878278] dark:text-[#7d7970] font-mono font-medium">
              (29,340 queries)
            </span>
          </div>
          <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa] mt-1 font-medium">
            Redis Vector similarity &gt; 0.94
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs">
          <div className="flex items-center justify-between text-[#878278] dark:text-[#7d7970]">
            <span className="text-xs font-bold uppercase tracking-wider font-mono">
              Latency Saved
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-[#d97706] dark:text-[#f59e0b] border border-amber-500/20">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1f1e1b] dark:text-[#f5f3ef] font-mono">
              -620ms
            </span>
            <span className="text-xs text-[#d97706] dark:text-[#f59e0b] font-bold font-mono">
              avg per hit
            </span>
          </div>
          <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa] mt-1 font-medium">
            Sub-millisecond cache returns vs. LLM sockets
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs">
          <div className="flex items-center justify-between text-[#878278] dark:text-[#7d7970]">
            <span className="text-xs font-bold uppercase tracking-wider font-mono">
              Tokens Saved
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-[#d97706] dark:text-[#f59e0b] border border-amber-500/20">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1f1e1b] dark:text-[#f5f3ef] font-mono">
              18.4M
            </span>
            <span className="text-xs text-[#878278] dark:text-[#7d7970] font-mono font-medium">
              tokens avoided
            </span>
          </div>
          <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa] mt-1 font-medium">
            Reduced carbon & server compute load
          </p>
        </div>
      </div>

      {/* Smart Model Routing Rules Engine */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#1f1e1b] dark:text-[#f5f3ef] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#d97706] dark:text-[#f59e0b]" />
              <span>Smart Dynamic Model Router Rules</span>
            </h2>
            <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa] mt-0.5 font-medium">
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
                  ? 'border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715]'
                  : 'border-[#e5e0d5]/40 dark:border-[#33302b]/40 bg-white/40 dark:bg-[#211f1c]/40 opacity-60'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-500/10 text-[#b45309] dark:text-[#fbbf24] border border-amber-500/20">
                    IF {rule.condition}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    ({rule.savingsEstimate})
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-[#5c5850] dark:text-[#b8b4aa] pt-1 font-medium">
                  <span className="line-through text-[#878278]">{rule.sourceModel}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#d97706] dark:text-[#f59e0b]" />
                  <span className="font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">{rule.fallbackModel}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <button
                  onClick={() => toggleRule(rule.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    rule.enabled
                      ? 'bg-[#d97706] hover:bg-[#b45309] dark:bg-[#f59e0b] dark:hover:bg-[#fbbf24] text-white dark:text-[#181715] shadow-xs'
                      : 'bg-white dark:bg-[#282622] text-[#878278] dark:text-[#7d7970] border border-[#e5e0d5] dark:border-[#33302b]'
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
