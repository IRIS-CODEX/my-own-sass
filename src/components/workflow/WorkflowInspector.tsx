import React, { useState } from 'react';
import { useWorkflowStore } from '../../stores/useWorkflowStore';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Zap,
  Server,
  Code2,
  Copy,
  Check,
  ExternalLink,
  Sliders,
  Trash2,
  Lock,
  RefreshCw,
  Sparkles,
  Image as ImageIcon,
  CheckCircle2,
  FileJson,
} from 'lucide-react';

export const WorkflowInspector: React.FC = () => {
  const {
    selectedNodeId,
    nodes,
    updateNodeConfig,
    deleteNode,
    resolveHITLApproval,
    setInspectorOpen,
  } = useWorkflowStore();

  const [copiedPayload, setCopiedPayload] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'payload' | 'credentials' | 'code'>('config');
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [isTestingScript, setIsTestingScript] = useState(false);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  // Generate fallback script if node doesn't have one
  const getNodeScript = () => {
    if (!selectedNode) return '';
    if (selectedNode.customScript) return selectedNode.customScript;

    if (selectedNode.platform === 'gemini') {
      return `// Google Gemini 2.0 Node Execution Script
import { GoogleGenAI } from '@google/genai';

export async function handleNodeExecution(inputData: any, proxyKey: string) {
  const ai = new GoogleGenAI({ apiKey: proxyKey });
  const response = await ai.models.generateContent({
    model: '${selectedNode.config.model || 'gemini-2.0-flash'}',
    contents: [{ role: 'user', parts: [{ text: inputData.prompt || 'Synthesize payload' }] }],
    config: { temperature: ${selectedNode.config.temperature || 0.7} }
  });
  return { text: response.text, timestamp: new Date().toISOString() };
}`;
    }

    if (selectedNode.platform === 'github') {
      return `// GitHub Action / PR Reviewer Integration
export async function handleGitHubEvent(payload: any, token: string) {
  console.log('Inspecting GitHub pull request payload...', payload);
  return {
    action: 'pr_reviewed',
    status: 'APPROVED',
    comment: 'Zero-Trust AST policy check passed with zero vulnerabilities.'
  };
}`;
    }

    return `// Node Transformer Function: ${selectedNode.name}
export async function transformData(item: Record<string, any>) {
  return {
    ...item,
    processedBy: "${selectedNode.id}",
    timestamp: new Date().toISOString(),
    status: "SUCCESS"
  };
}`;
  };

  const handleTestScript = async () => {
    setIsTestingScript(true);
    setTestOutput(null);
    await new Promise((r) => setTimeout(r, 450));
    setTestOutput(
      JSON.stringify(
        {
          nodeId: selectedNode?.id,
          executionStatus: 'COMPLETED_SUCCESSFULLY',
          returnValue: {
            text: 'Generated synthesis successfully via Gemini 2.0 Flash Zero-Trust proxy.',
            piiRedacted: true,
            latencyMs: 34.2,
          },
          timestamp: new Date().toISOString(),
        },
        null,
        2
      )
    );
    setIsTestingScript(false);
  };

  if (!selectedNode) {
    return (
      <div className="w-80 flex-shrink-0 border-l border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5]/95 dark:bg-[#181715]/95 p-6 flex flex-col items-center justify-center text-center select-none">
        <div className="w-12 h-12 rounded-2xl bg-[#f4f1ea] dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] flex items-center justify-center mb-3">
          <Sliders className="w-6 h-6 text-[#878278] dark:text-[#7d7970]" />
        </div>
        <h4 className="text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
          No Node Selected
        </h4>
        <p className="text-[11px] text-[#5c5850] dark:text-[#b8b4aa] mt-1">
          Click any node or wire on the canvas to inspect parameters, virtual key scopes, and live payload data.
        </p>
      </div>
    );
  }

  const handleCopyPayload = () => {
    const data = JSON.stringify(selectedNode.livePayload || {}, null, 2);
    navigator.clipboard.writeText(data);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  return (
    <aside className="w-84 sm:w-96 flex-shrink-0 border-l border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5]/95 dark:bg-[#181715]/95 flex flex-col justify-between select-none z-20 overflow-y-auto">
      <div>
        {/* Top Header */}
        <div className="p-4 border-b border-[#e5e0d5] dark:border-[#33302b] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#c15f3c]" />
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#878278] dark:text-[#7d7970] font-bold">
                {selectedNode.category}
              </span>
              <h3 className="text-sm font-bold text-[#1f1e1b] dark:text-[#f5f3ef] truncate max-w-[200px]">
                {selectedNode.name}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => deleteNode(selectedNode.id)}
              className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-600 dark:text-red-400 cursor-pointer transition-colors"
              title="Delete Node from Canvas"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setInspectorOpen(false)}
              className="p-1.5 rounded-lg hover:bg-[#f4f1ea] dark:hover:bg-[#211f1c] text-[#878278] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* HITL Escrow Alert Bar (If node is in Escrow) */}
        {selectedNode.status === 'intercepted' && (
          <div className="p-3.5 m-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Zero-Trust HITL Escrow Engaged</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#5c5850] dark:text-[#d5cfc2]">
              Policy rule #FIN-04 quarantined this payload with a 300s TTL. Operator signature required to release funds to the payment rails.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => resolveHITLApproval(selectedNode.id, false)}
                className="flex-1 py-1.5 rounded-xl border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
              >
                Reject
              </button>
              <button
                onClick={() => resolveHITLApproval(selectedNode.id, true)}
                className="flex-1 py-1.5 rounded-xl bg-[#c15f3c] hover:bg-[#ad5232] text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Approve (FIDO2)</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex border-b border-[#e5e0d5] dark:border-[#33302b] px-4 pt-2 gap-3 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('config')}
            className={`pb-2.5 cursor-pointer border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'config'
                ? 'border-[#c15f3c] text-[#1f1e1b] dark:text-[#f5f3ef] font-bold'
                : 'border-transparent text-[#878278] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef]'
            }`}
          >
            Parameters
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`pb-2.5 cursor-pointer border-b-2 transition-colors whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'code'
                ? 'border-[#c15f3c] text-[#c15f3c] font-bold'
                : 'border-transparent text-[#878278] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Code & Script</span>
          </button>
          <button
            onClick={() => setActiveTab('payload')}
            className={`pb-2.5 cursor-pointer border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'payload'
                ? 'border-[#c15f3c] text-[#1f1e1b] dark:text-[#f5f3ef] font-bold'
                : 'border-transparent text-[#878278] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef]'
            }`}
          >
            Live Payload
          </button>
          <button
            onClick={() => setActiveTab('credentials')}
            className={`pb-2.5 cursor-pointer border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'credentials'
                ? 'border-[#c15f3c] text-[#1f1e1b] dark:text-[#f5f3ef] font-bold'
                : 'border-transparent text-[#878278] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef]'
            }`}
          >
            Security & Vault
          </button>
        </div>

        {/* Tab 1: Configuration Parameters */}
        {activeTab === 'config' && (
          <div className="p-4 space-y-4 text-xs">
            {/* Model Selection */}
            {selectedNode.config.model !== undefined && (
              <div>
                <label className="block text-[11px] font-bold text-[#878278] dark:text-[#7d7970] uppercase tracking-wider mb-1.5 font-mono">
                  Upstream AI Model
                </label>
                <select
                  value={selectedNode.config.model}
                  onChange={(e) => updateNodeConfig(selectedNode.id, { model: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] text-[#1f1e1b] dark:text-[#f5f3ef] font-semibold focus:outline-none focus:ring-1 focus:ring-[#c15f3c]"
                >
                  <option value="gemini-2.0-flash">Gemini 2.0 Flash ($0.075 / 1M)</option>
                  <option value="claude-3.5-sonnet">Claude 3.5 Sonnet ($3.00 / 1M)</option>
                  <option value="gpt-4o">GPT-4o Omnimodal ($2.50 / 1M)</option>
                  <option value="imagen-3.0-generate">Google Imagen 3 (Diffusion)</option>
                </select>
              </div>
            )}

            {/* Virtual Token TTL Slider */}
            {selectedNode.config.ttlSeconds !== undefined && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-[#878278] dark:text-[#7d7970] uppercase tracking-wider font-mono">
                    Virtual Token TTL (Seconds)
                  </label>
                  <span className="text-xs font-mono font-bold text-[#c15f3c]">
                    {selectedNode.config.ttlSeconds}s
                  </span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="3600"
                  step="30"
                  value={selectedNode.config.ttlSeconds}
                  onChange={(e) =>
                    updateNodeConfig(selectedNode.id, { ttlSeconds: Number(e.target.value) })
                  }
                  className="w-full accent-[#c15f3c] cursor-pointer"
                />
              </div>
            )}

            {/* Daily Budget Cap */}
            {selectedNode.config.budgetCapUsd !== undefined && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-[#878278] dark:text-[#7d7970] uppercase tracking-wider font-mono">
                    Daily Budget Cap ($ USD)
                  </label>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    ${selectedNode.config.budgetCapUsd.toFixed(2)}
                  </span>
                </div>
                <input
                  type="number"
                  step="5"
                  value={selectedNode.config.budgetCapUsd}
                  onChange={(e) =>
                    updateNodeConfig(selectedNode.id, { budgetCapUsd: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] text-[#1f1e1b] dark:text-[#f5f3ef] font-mono font-bold"
                />
              </div>
            )}

            {/* Image Resolution & Aspect Ratio (If Multimodal) */}
            {selectedNode.config.imageResolution !== undefined && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-[#878278] dark:text-[#7d7970] uppercase tracking-wider mb-1 font-mono">
                    Resolution
                  </label>
                  <select
                    value={selectedNode.config.imageResolution}
                    onChange={(e) =>
                      updateNodeConfig(selectedNode.id, { imageResolution: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] text-xs font-mono"
                  >
                    <option value="2048x1152">2048x1152 (16:9)</option>
                    <option value="1024x1024">1024x1024 (1:1)</option>
                    <option value="1920x1080">1920x1080 (HD)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#878278] dark:text-[#7d7970] uppercase tracking-wider mb-1 font-mono">
                    Aspect Ratio
                  </label>
                  <select
                    value={selectedNode.config.aspectRatio || '16:9'}
                    onChange={(e) =>
                      updateNodeConfig(selectedNode.id, { aspectRatio: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] text-xs font-mono"
                  >
                    <option value="16:9">16:9 Landscape</option>
                    <option value="1:1">1:1 Square</option>
                    <option value="9:16">9:16 Portrait</option>
                  </select>
                </div>
              </div>
            )}

            {/* System Prompt or Template */}
            {selectedNode.config.promptTemplate !== undefined && (
              <div>
                <label className="block text-[11px] font-bold text-[#878278] dark:text-[#7d7970] uppercase tracking-wider mb-1.5 font-mono">
                  Prompt Expander Spec
                </label>
                <textarea
                  rows={3}
                  value={selectedNode.config.promptTemplate}
                  onChange={(e) =>
                    updateNodeConfig(selectedNode.id, { promptTemplate: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] text-xs text-[#1f1e1b] dark:text-[#f5f3ef] font-mono leading-relaxed resize-none"
                />
              </div>
            )}
          </div>
        )}

        {/* Tab: Node Code & Scripts */}
        {activeTab === 'code' && (
          <div className="p-4 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-[#1f1e1b] dark:text-[#f5f3ef] block">
                  Node Executable Logic
                </span>
                <span className="text-[10px] text-[#878278] font-mono">
                  Platform: {selectedNode.platform} • TypeScript / Node
                </span>
              </div>

              <button
                onClick={handleTestScript}
                disabled={isTestingScript}
                className="px-2.5 py-1 rounded-xl bg-[#c15f3c] hover:bg-[#a94f30] text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
              >
                {isTestingScript ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Executing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" />
                    <span>Test Run Logic</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Editor Box */}
            <div className="rounded-xl overflow-hidden border border-[#33302b] bg-[#141311]">
              <div className="flex items-center justify-between px-3 py-1.5 bg-[#1e1d1a] border-b border-[#33302b] text-[10px] font-mono text-[#878278]">
                <span>handler.ts</span>
                <span className="text-emerald-400 font-bold">Zero-Trust Verified</span>
              </div>
              <textarea
                rows={10}
                value={selectedNode.customScript || getNodeScript()}
                onChange={(e) =>
                  updateNodeConfig(selectedNode.id, { customScript: e.target.value })
                }
                className="w-full p-3 font-mono text-[11px] leading-relaxed bg-[#100f0e] text-emerald-400 focus:outline-none resize-y"
              />
            </div>

            {/* Test Run Output Preview */}
            {testOutput && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                  Test Execution Return Value:
                </span>
                <div className="p-2.5 rounded-xl bg-[#141311] border border-emerald-500/30 text-emerald-400 font-mono text-[10.5px] max-h-40 overflow-y-auto">
                  <pre>{testOutput}</pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Live Payload & Image Previews */}
        {activeTab === 'payload' && (
          <div className="p-4 space-y-4">
            {/* Image Preview (If Imagen Node) */}
            {selectedNode.livePayload?.output?.imageUrl && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#1f1e1b] dark:text-[#f5f3ef] flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-rose-500" />
                    <span>Generated Multimodal Asset</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-700 dark:text-rose-300 font-bold">
                    {selectedNode.livePayload.output.width}x{selectedNode.livePayload.output.height}
                  </span>
                </div>
                <div className="relative rounded-2xl overflow-hidden border border-[#e5e0d5] dark:border-[#33302b] shadow-md group">
                  <img
                    src={selectedNode.livePayload.output.imageUrl}
                    alt="Generated Asset"
                    referrerPolicy="no-referrer"
                    className="w-full h-44 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                    <span className="text-[10px] font-mono text-white/90">
                      Rendered in {selectedNode.livePayload.output.renderTimeMs}ms • WebP
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* JSON Payload Inspector */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#878278] dark:text-[#7d7970] uppercase tracking-wider font-mono">
                  Active IO Payload
                </span>
                <button
                  onClick={handleCopyPayload}
                  className="px-2 py-1 rounded-lg bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] text-[10px] font-mono font-semibold flex items-center gap-1 text-[#5c5850] dark:text-[#b8b4aa] hover:border-[#c15f3c] cursor-pointer"
                >
                  {copiedPayload ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedPayload ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-[#1e1d1a] text-[#f5f3ef] font-mono text-[11px] overflow-x-auto max-h-64 border border-[#33302b]">
                <pre className="text-emerald-400 leading-relaxed">
                  {JSON.stringify(selectedNode.livePayload || {}, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Security & Credentials */}
        {activeTab === 'credentials' && (
          <div className="p-4 space-y-4 text-xs">
            <div className="p-3 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                  Credential Security Level
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                  FIPS 140-3 Nitro Enclave
                </span>
              </div>
              <p className="text-[11px] text-[#5c5850] dark:text-[#b8b4aa] leading-relaxed">
                Master upstream API secrets are stored inside isolated AWS Nitro Enclaves. Only ephemeral virtual keys with hardware budget ceilings are minted.
              </p>
            </div>

            {selectedNode.credentials && (
              <div className="space-y-2">
                <div>
                  <span className="text-[10px] font-mono text-[#878278] block">Vault Mask</span>
                  <code className="text-xs font-mono font-bold text-[#c15f3c]">
                    {selectedNode.credentials.keyMask}
                  </code>
                </div>

                {selectedNode.credentials.enclaveAttestation && (
                  <div>
                    <span className="text-[10px] font-mono text-[#878278] block">
                      Hardware Cryptographic Attestation
                    </span>
                    <code className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 break-all">
                      {selectedNode.credentials.enclaveAttestation}
                    </code>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Metrics */}
      <div className="p-4 border-t border-[#e5e0d5] dark:border-[#33302b] bg-[#f4f1ea]/50 dark:bg-[#1f1d1a]/50 flex items-center justify-between text-[11px] font-mono">
        <span className="text-[#878278]">Total Executions: {selectedNode.metrics.executions}</span>
        <span className="text-emerald-700 dark:text-emerald-400 font-bold">
          ${selectedNode.metrics.costUsd.toFixed(4)} USD
        </span>
      </div>
    </aside>
  );
};
