import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Sliders,
  Plus,
  Trash2,
  Lock,
  EyeOff,
  Terminal,
  Zap,
  Check,
  CheckCircle2,
  X,
  FileText,
  Sparkles,
  Layers,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { usePoliciesStore, ALL_PII_ENTITIES } from '../../stores/usePoliciesStore';
import { useAppStore } from '../../stores/useAppStore';
import { RiskLevel } from '../../types';
import { PromptRulesManager } from './PromptRulesManager';
import { ReadmeViewer } from './ReadmeViewer';

type PolicyTab = 'matrix' | 'prompt-rules' | 'readme';

export const PolicyStudio: React.FC = () => {
  const {
    policies,
    industryPacks,
    promptRules,
    piiMaskingEnabled,
    selectedPiiEntities,
    promptInjectionDefenseEnabled,
    canaryTokenDefenseEnabled,
    ssrfFirewallEnabled,
    updatePolicyRisk,
    addConditionalRule,
    addToolPolicy,
    deleteToolPolicy,
    toggleIndustryPack,
    togglePiiEntity,
    setPiiMaskingEnabled,
    setPromptInjectionDefense,
    setCanaryTokenDefense,
    setSsrfFirewall
  } = usePoliciesStore();

  const { addToast } = useAppStore();

  const [activeTab, setActiveTab] = useState<PolicyTab>('matrix');

  // Modal to add new conditional rule
  const [ruleModalPolicyId, setRuleModalPolicyId] = useState<string | null>(null);
  const [ruleField, setRuleField] = useState('amount');
  const [ruleOp, setRuleOp] = useState<'>' | '<' | '==' | '!=' | 'CONTAINS'>('>');
  const [ruleValue, setRuleValue] = useState('50');

  // Modal to add new tool
  const [newToolModal, setNewToolModal] = useState(false);
  const [newToolName, setNewToolName] = useState('');
  const [newToolDesc, setNewToolDesc] = useState('');
  const [newToolRisk, setNewToolRisk] = useState<RiskLevel>('YELLOW');

  const handleSaveCondition = () => {
    if (!ruleModalPolicyId) return;
    addConditionalRule(ruleModalPolicyId, ruleField, ruleOp, isNaN(Number(ruleValue)) ? ruleValue : Number(ruleValue));
    addToast({
      title: 'Rule Condition Attached',
      description: `IF ${ruleField} ${ruleOp} ${ruleValue} rule enforced.`,
      type: 'success'
    });
    setRuleModalPolicyId(null);
  };

  const handleCreateTool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newToolName.trim()) return;
    addToolPolicy(newToolName, newToolDesc, newToolRisk);
    addToast({
      title: 'Tool Policy Enrolled',
      description: `Tool ${newToolName} is now governed under ${newToolRisk} tier.`,
      type: 'success'
    });
    setNewToolModal(false);
    setNewToolName('');
    setNewToolDesc('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Primary Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 bg-white/80 dark:bg-[#0c0e18]/90 backdrop-blur-md rounded-xl border border-yellow-300/50 dark:border-yellow-500/25 shadow-xs">
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            id="policy-tab-matrix"
            onClick={() => setActiveTab('matrix')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'matrix'
                ? 'bg-yellow-400/25 text-slate-950 border border-yellow-400/70 shadow-xs dark:bg-yellow-400/15 dark:text-yellow-300 dark:border-yellow-400/40'
                : 'text-slate-800 dark:text-slate-300 hover:bg-yellow-100/40 dark:hover:bg-[#141829] dark:hover:text-yellow-200'
            }`}
          >
            <ShieldCheck className={`w-4 h-4 ${activeTab === 'matrix' ? 'text-amber-600 dark:text-yellow-400' : 'text-slate-500 dark:text-slate-400'}`} />
            <span>Traffic Light Risk Matrix</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-yellow-100 dark:bg-yellow-950/60 text-slate-950 dark:text-yellow-300 border border-yellow-300/80 dark:border-yellow-500/30 font-bold">
              {policies.length} Tools
            </span>
          </button>

          <button
            id="policy-tab-prompt-rules"
            onClick={() => setActiveTab('prompt-rules')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'prompt-rules'
                ? 'bg-yellow-400/25 text-slate-950 border border-yellow-400/70 shadow-xs dark:bg-yellow-400/15 dark:text-yellow-300 dark:border-yellow-400/40'
                : 'text-slate-800 dark:text-slate-300 hover:bg-yellow-100/40 dark:hover:bg-[#141829] dark:hover:text-yellow-200'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${activeTab === 'prompt-rules' ? 'text-amber-600 dark:text-yellow-400' : 'text-slate-500 dark:text-slate-400'}`} />
            <span>Agent Rules with Prompt</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-yellow-100 dark:bg-yellow-950/60 text-amber-950 dark:text-yellow-300 font-bold border border-yellow-300/80 dark:border-yellow-500/30">
              {promptRules.length} Rules
            </span>
          </button>

          <button
            id="policy-tab-readme"
            onClick={() => setActiveTab('readme')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'readme'
                ? 'bg-yellow-400/25 text-slate-950 border border-yellow-400/70 shadow-xs dark:bg-yellow-400/15 dark:text-yellow-300 dark:border-yellow-400/40'
                : 'text-slate-800 dark:text-slate-300 hover:bg-yellow-100/40 dark:hover:bg-[#141829] dark:hover:text-yellow-200'
            }`}
          >
            <BookOpen className={`w-4 h-4 ${activeTab === 'readme' ? 'text-amber-600 dark:text-yellow-400' : 'text-slate-500 dark:text-slate-400'}`} />
            <span>Governance README.md</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-yellow-100 dark:bg-yellow-950/60 text-slate-950 dark:text-yellow-300 border border-yellow-300/80 dark:border-yellow-500/30 font-bold">
              Markdown
            </span>
          </button>
        </div>

        {/* Quick Context Action */}
        {activeTab === 'matrix' && (
          <button
            onClick={() => setActiveTab('prompt-rules')}
            className="px-3.5 py-1.5 text-xs font-bold text-amber-950 dark:text-yellow-300 hover:bg-yellow-100/60 dark:hover:bg-yellow-950/40 rounded-lg flex items-center gap-1.5 self-start sm:self-auto transition-all cursor-pointer border border-yellow-300/60 dark:border-yellow-500/30 shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-yellow-400" />
            <span>Generate Rule via Prompt &rarr;</span>
          </button>
        )}
      </div>

      {/* Tab 1: Traffic Light Tool Risk Matrix */}
      {activeTab === 'matrix' && (
        <div className="space-y-8">
          {/* Quick Banner to Prompt Rules */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-100/80 via-amber-50/60 to-white/90 dark:from-yellow-950/40 dark:via-[#0e111e] dark:to-[#0e111e] border border-yellow-300/60 dark:border-yellow-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-400 text-slate-950 font-bold flex-shrink-0 shadow-sm">
                <Sparkles className="w-4 h-4 text-slate-950" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-950 dark:text-white">
                  Add New Rules Using Natural Language Prompts
                </h4>
                <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                  Simply type prompts like "Do not allow refunds over $50 without approval" to automatically synthesize policy gates.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('prompt-rules')}
              className="px-3.5 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap self-start sm:self-auto shadow-sm shadow-yellow-500/20 border border-yellow-300 transition-all cursor-pointer"
            >
              <span>Open Prompt Rule Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 1-Click Industry Compliance Bundles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-950 dark:text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span>1-Click Regulatory Industry Packs</span>
                </h2>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5">
                  Instant policy templates for healthcare, retail, finance, and cloud security
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {industryPacks.map((pack) => (
                <div
                  key={pack.id}
                  className={`p-5 rounded-xl border backdrop-blur-md transition-all flex flex-col justify-between ${
                    pack.enabled
                      ? 'border-yellow-400/80 bg-yellow-50/75 dark:bg-yellow-950/30 shadow-xs'
                      : 'border-yellow-300/40 dark:border-yellow-500/20 bg-white/85 dark:bg-[#0c0e18]/85'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-yellow-100 dark:bg-yellow-950/60 text-amber-950 dark:text-yellow-300 border border-yellow-300/70 dark:border-yellow-500/30">
                        {pack.badge}
                      </span>
                      <input
                        type="checkbox"
                        checked={pack.enabled}
                        onChange={() => {
                          toggleIndustryPack(pack.id);
                          addToast({
                            title: pack.enabled ? 'Pack Deactivated' : 'Pack Activated',
                            description: `${pack.name} ${pack.enabled ? 'disabled' : 'enabled'}.`,
                            type: pack.enabled ? 'info' : 'success'
                          });
                        }}
                        className="w-4 h-4 accent-yellow-400 rounded cursor-pointer"
                      />
                    </div>

                    <h3 className="font-bold text-xs text-slate-950 dark:text-white mt-3">
                      {pack.name}
                    </h3>
                    <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 mt-1">
                      {pack.description}
                    </p>

                    <div className="mt-3 space-y-1">
                      {pack.features.map((f, i) => (
                        <div key={i} className="text-[10px] text-slate-800 dark:text-slate-200 flex items-center gap-1.5 font-mono">
                          <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-yellow-200/80 dark:border-[#1e2338] flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-800 dark:text-slate-400 font-semibold">{pack.rulesCount} Rules Applied</span>
                    <span className={pack.enabled ? 'text-amber-900 dark:text-yellow-400 font-bold' : 'text-slate-700 dark:text-slate-400 font-semibold'}>
                      {pack.enabled ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Traffic Light Risk Matrix */}
          <div className="p-5 rounded-xl bg-white/85 dark:bg-[#0c0e18]/85 backdrop-blur-md border border-yellow-300/40 dark:border-yellow-500/20 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-950 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Traffic Light Tool Risk Matrix
                </h3>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5">
                  Classify tool permissions into Green (Auto), Yellow (HITL Approval), or Red (Prohibited)
                </p>
              </div>

              <button
                onClick={() => setNewToolModal(true)}
                className="px-3.5 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1.5 self-start sm:self-auto transition-all cursor-pointer shadow-sm border border-yellow-300"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Enroll New Tool</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-yellow-100/60 dark:bg-[#131627] text-slate-800 dark:text-yellow-400 uppercase tracking-wider font-mono font-bold border-b border-yellow-300/60 dark:border-[#1e2338]">
                  <tr>
                    <th className="py-3 px-4">Tool Declaration</th>
                    <th className="py-3 px-4">Condition Gate</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-right">Governed Risk Tier</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-yellow-200/50 dark:divide-[#1e2338]">
                  {policies.map((p) => (
                    <tr key={p.id} className="hover:bg-yellow-50/60 dark:hover:bg-[#15192c]/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-950 dark:text-white">
                        {p.toolName}
                      </td>
                      <td className="py-3 px-4">
                        {p.ruleCondition ? (
                          <button
                            onClick={() => setRuleModalPolicyId(p.id)}
                            className="bg-yellow-100/80 dark:bg-[#15192c] hover:bg-yellow-200/80 dark:hover:bg-[#1c223c] px-2 py-1 rounded border border-yellow-300/70 dark:border-[#1e2338] font-mono text-[11px] font-bold text-slate-900 dark:text-yellow-300 transition-colors cursor-pointer"
                          >
                            IF {p.ruleCondition.field} {p.ruleCondition.operator} {p.ruleCondition.value}
                          </button>
                        ) : (
                          <button
                            onClick={() => setRuleModalPolicyId(p.id)}
                            className="text-amber-800 dark:text-yellow-400 hover:text-amber-950 text-[11px] font-bold underline cursor-pointer"
                          >
                            + Add Parameter Limit
                          </button>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium text-xs max-w-xs">
                        {p.description}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex p-1 bg-yellow-100/60 dark:bg-[#070913] border border-yellow-300/60 dark:border-[#1e2338] rounded-lg">
                          {(['GREEN', 'YELLOW', 'RED'] as RiskLevel[]).map((level) => {
                            const active = p.riskLevel === level;
                            let activeStyle = 'bg-white dark:bg-[#1e243d] text-slate-950 dark:text-white shadow-xs';
                            if (active && level === 'GREEN') activeStyle = 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40 font-bold';
                            if (active && level === 'YELLOW') activeStyle = 'bg-yellow-400 text-slate-950 border border-yellow-400/80 font-black shadow-xs';
                            if (active && level === 'RED') activeStyle = 'bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/30 font-bold';

                            return (
                              <button
                                key={level}
                                type="button"
                                onClick={() => updatePolicyRisk(p.id, level)}
                                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                                  active ? activeStyle : 'text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-yellow-200'
                                }`}
                              >
                                {level}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => deleteToolPolicy(p.id)}
                          className="text-slate-500 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                          title="Delete tool policy"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Defensive Guardrails & PII Masking */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: PII Scrubbing */}
            <div className="p-5 rounded-xl bg-white/85 dark:bg-[#0c0e18]/85 backdrop-blur-md border border-yellow-300/40 dark:border-yellow-500/20 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-yellow-400/20 text-amber-900 dark:text-yellow-300 border border-yellow-400/40 rounded-lg">
                    <EyeOff className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-950 dark:text-white">
                      Presidio PII Redaction Engine
                    </h3>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Scrub sensitive personal identifiers before dispatching to upstream LLMs
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={piiMaskingEnabled}
                  onChange={(e) => setPiiMaskingEnabled(e.target.checked)}
                  className="w-4 h-4 accent-yellow-400 rounded cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                {ALL_PII_ENTITIES.map((entity) => (
                  <label
                    key={entity.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-yellow-50/50 dark:bg-[#131627]/60 border border-yellow-300/40 dark:border-[#1e2338] cursor-pointer hover:border-yellow-400"
                  >
                    <input
                      type="checkbox"
                      disabled={!piiMaskingEnabled}
                      checked={selectedPiiEntities.includes(entity.id)}
                      onChange={() => togglePiiEntity(entity.id)}
                      className="w-3.5 h-3.5 accent-yellow-400 rounded cursor-pointer"
                    />
                    <span className="text-slate-900 dark:text-slate-200 font-medium truncate">{entity.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Right: Anti-Hacking & Canary Trap Defense */}
            <div className="p-5 rounded-xl bg-white/85 dark:bg-[#0c0e18]/85 backdrop-blur-md border border-yellow-300/40 dark:border-yellow-500/20 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-400/20 text-amber-950 dark:text-yellow-300 border border-amber-400/40 rounded-lg">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-950 dark:text-white">
                    Anti-Hacking & Canary Defense Controls
                  </h3>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Active defensive rules preventing model exfiltration & jailbreaks
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs pt-1">
                <div className="p-3 rounded-lg bg-yellow-50/50 dark:bg-[#131627]/60 border border-yellow-300/40 dark:border-[#1e2338] flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-950 dark:text-white block">
                      Invisible Canary Token Traps
                    </span>
                    <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                      Injects cryptographic canary string into prompts to catch exfiltration attempts.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={canaryTokenDefenseEnabled}
                    onChange={(e) => setCanaryTokenDefense(e.target.checked)}
                    className="w-4 h-4 accent-yellow-400 rounded cursor-pointer"
                  />
                </div>

                <div className="p-3 rounded-lg bg-yellow-50/50 dark:bg-[#131627]/60 border border-yellow-300/40 dark:border-[#1e2338] flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-950 dark:text-white block">
                      Heuristic & Semantic Prompt Injection Filter
                    </span>
                    <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                      Blocks "Ignore previous instructions", DAN payloads, and role hijacking.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={promptInjectionDefenseEnabled}
                    onChange={(e) => setPromptInjectionDefense(e.target.checked)}
                    className="w-4 h-4 accent-yellow-400 rounded cursor-pointer"
                  />
                </div>

                <div className="p-3 rounded-lg bg-yellow-50/50 dark:bg-[#131627]/60 border border-yellow-300/40 dark:border-[#1e2338] flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-950 dark:text-white block">
                      SSRF Private IP & Cloud Metadata Egress Firewall
                    </span>
                    <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                      Blocks RFC 1918 (10.0.0.0/8, 192.168.0.0/16) and 169.254.169.254 AWS metadata probes.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={ssrfFirewallEnabled}
                    onChange={(e) => setSsrfFirewall(e.target.checked)}
                    className="w-4 h-4 accent-yellow-400 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Agent Rules with Prompt */}
      {activeTab === 'prompt-rules' && <PromptRulesManager />}

      {/* Tab 3: Governance README.md */}
      {activeTab === 'readme' && <ReadmeViewer />}

      {/* Modal: Add Parameter Limit Condition */}
      {ruleModalPolicyId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white/95 dark:bg-[#0e111e]/95 backdrop-blur-md border border-yellow-300/60 dark:border-yellow-500/30 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-yellow-200/80 dark:border-[#1e2338] pb-3">
              <h3 className="font-bold text-sm text-slate-950 dark:text-white">
                Configure Parameter Gate Condition
              </h3>
              <button
                onClick={() => setRuleModalPolicyId(null)}
                className="text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  Target Parameter Name
                </label>
                <input
                  type="text"
                  value={ruleField}
                  onChange={(e) => setRuleField(e.target.value)}
                  placeholder="e.g. amount, recipient_domain, records_count"
                  className="w-full bg-white dark:bg-[#070913] border border-yellow-300/70 dark:border-[#1e2338] rounded-lg p-2.5 text-xs text-slate-950 dark:text-slate-100 font-mono focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  Operator
                </label>
                <select
                  value={ruleOp}
                  onChange={(e) => setRuleOp(e.target.value as any)}
                  className="w-full bg-white dark:bg-[#070913] border border-yellow-300/70 dark:border-[#1e2338] rounded-lg p-2 text-xs text-slate-950 dark:text-slate-100 font-mono focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                >
                  <option value=">">&gt; (Greater Than)</option>
                  <option value="<">&lt; (Less Than)</option>
                  <option value="==">== (Equals)</option>
                  <option value="!=">!= (Not Equal)</option>
                  <option value="CONTAINS">CONTAINS (Substring Match)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  Threshold Value
                </label>
                <input
                  type="text"
                  value={ruleValue}
                  onChange={(e) => setRuleValue(e.target.value)}
                  placeholder="e.g. 50, internal.com, 1000"
                  className="w-full bg-white dark:bg-[#070913] border border-yellow-300/70 dark:border-[#1e2338] rounded-lg p-2.5 text-xs text-slate-950 dark:text-slate-100 font-mono focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRuleModalPolicyId(null)}
                className="px-4 py-2 text-xs text-slate-600 hover:text-slate-950 dark:hover:text-white cursor-pointer font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCondition}
                className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs rounded-lg transition-all cursor-pointer shadow-sm border border-yellow-300"
              >
                Attach Condition Rule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Enroll New Tool */}
      {newToolModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form onSubmit={handleCreateTool} className="bg-white/95 dark:bg-[#0e111e]/95 backdrop-blur-md border border-yellow-300/60 dark:border-yellow-500/30 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-yellow-200/80 dark:border-[#1e2338] pb-3">
              <h3 className="font-bold text-sm text-slate-950 dark:text-white">
                Enroll Custom Tool in Policy Matrix
              </h3>
              <button
                type="button"
                onClick={() => setNewToolModal(false)}
                className="text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  Tool Name (Function Identifier)
                </label>
                <input
                  type="text"
                  required
                  value={newToolName}
                  onChange={(e) => setNewToolName(e.target.value)}
                  placeholder="e.g. execute_payout, modify_dns_record"
                  className="w-full bg-white dark:bg-[#070913] border border-yellow-300/70 dark:border-[#1e2338] rounded-lg p-2.5 text-xs text-slate-950 dark:text-slate-100 font-mono focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newToolDesc}
                  onChange={(e) => setNewToolDesc(e.target.value)}
                  placeholder="e.g. Triggers outbound payment or alters DNS"
                  className="w-full bg-white dark:bg-[#070913] border border-yellow-300/70 dark:border-[#1e2338] rounded-lg p-2.5 text-xs text-slate-950 dark:text-slate-100 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  Default Safety Tier
                </label>
                <select
                  value={newToolRisk}
                  onChange={(e) => setNewToolRisk(e.target.value as any)}
                  className="w-full bg-white dark:bg-[#070913] border border-yellow-300/70 dark:border-[#1e2338] rounded-lg p-2 text-xs text-slate-950 dark:text-slate-100 font-mono focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                >
                  <option value="GREEN">GREEN (Safe - Autonomous Execution)</option>
                  <option value="YELLOW">YELLOW (Restricted - Requires 1-Tap Approval)</option>
                  <option value="RED">RED (Prohibited - Automatically Blocked)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setNewToolModal(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:text-slate-950 dark:hover:text-white cursor-pointer font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs rounded-lg cursor-pointer shadow-sm border border-yellow-300"
              >
                Save Tool
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
