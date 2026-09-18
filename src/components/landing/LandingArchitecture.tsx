import React from 'react';
import { Layers, ArrowRight, ShieldCheck, KeyRound, Database } from 'lucide-react';

export const LandingArchitecture: React.FC = () => {
  return (
    <section id="architecture" className="py-20 sm:py-28 border-t border-[#e5e0d5] dark:border-[#33302b]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mb-16 text-left">
          <div className="text-xs font-mono text-amber-700 dark:text-amber-400 mb-2 uppercase tracking-wider">
            Architecture Pipeline
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif text-[#1f1e1b] dark:text-[#f5f3ef] font-normal tracking-tight mb-4">
            A single drop-in baseURL change.
          </h2>
          <p className="text-base text-[#5c5850] dark:text-[#b8b4aa] font-normal leading-relaxed">
            Zero SDK rewrites, zero infrastructure friction. Replace your standard client URL and immediately gain cryptographic virtual keys and real-time governance.
          </p>
        </div>

        {/* 3-Step Clean Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* STEP 1 */}
          <div className="claude-card p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-8 h-8 rounded-full bg-amber-600 dark:bg-amber-500 text-white dark:text-[#181715] font-serif font-semibold text-sm flex items-center justify-center">
                  1
                </span>
                <span className="text-[11px] font-mono text-[#878278]">Client Ingress</span>
              </div>
              <h3 className="font-serif text-lg text-[#1f1e1b] dark:text-[#f5f3ef] font-normal mb-2">
                Drop-In SDK BaseURL
              </h3>
              <p className="text-xs sm:text-sm text-[#5c5850] dark:text-[#b8b4aa] leading-relaxed mb-4">
                Point your standard OpenAI, Anthropic, or LangChain client directly to the AgentLens secure gateway.
              </p>
              <pre className="p-3.5 rounded-xl bg-[#f4f1ea] dark:bg-[#1e1d1a] border border-[#e5e0d5] dark:border-[#33302b] text-[11px] font-mono text-amber-800 dark:text-amber-300 overflow-x-auto leading-relaxed">
{`const client = new OpenAI({
  baseURL: "https://gateway.agentlens.ai/v1",
  apiKey: "al_live_sec_..."
});`}
              </pre>
            </div>
            <div className="mt-6 pt-4 border-t border-[#f4f1ea] dark:border-[#282622] text-xs font-mono text-[#878278]">
              Drop-in compatibility
            </div>
          </div>

          {/* STEP 2 */}
          <div className="claude-card p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-8 h-8 rounded-full bg-amber-600 dark:bg-amber-500 text-white dark:text-[#181715] font-serif font-semibold text-sm flex items-center justify-center">
                  2
                </span>
                <span className="text-[11px] font-mono text-[#878278]">Enclave Execution</span>
              </div>
              <h3 className="font-serif text-lg text-[#1f1e1b] dark:text-[#f5f3ef] font-normal mb-2">
                Zero-Trust Policy Enclave
              </h3>
              <p className="text-xs sm:text-sm text-[#5c5850] dark:text-[#b8b4aa] leading-relaxed mb-4">
                AST semantic parser verifies tool calls against active policies, redacting sensitive credentials and enforcing token budgets.
              </p>
              <div className="p-3.5 rounded-xl bg-[#f4f1ea] dark:bg-[#1e1d1a] border border-[#e5e0d5] dark:border-[#33302b] font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#878278]">AST Parser:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">PASSED (0.7ms)</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#878278]">Budget Meter:</span>
                  <span className="text-[#1f1e1b] dark:text-[#f5f3ef]">$14.20 / $50.00</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#878278]">Key Isolation:</span>
                  <span className="text-amber-700 dark:text-amber-400">Nitro Enclave</span>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-[#f4f1ea] dark:border-[#282622] text-xs font-mono text-[#878278]">
              Cryptographic quarantine
            </div>
          </div>

          {/* STEP 3 */}
          <div className="claude-card p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-8 h-8 rounded-full bg-amber-600 dark:bg-amber-500 text-white dark:text-[#181715] font-serif font-semibold text-sm flex items-center justify-center">
                  3
                </span>
                <span className="text-[11px] font-mono text-[#878278]">Model Dispatch</span>
              </div>
              <h3 className="font-serif text-lg text-[#1f1e1b] dark:text-[#f5f3ef] font-normal mb-2">
                Arbitrage & Model Egress
              </h3>
              <p className="text-xs sm:text-sm text-[#5c5850] dark:text-[#b8b4aa] leading-relaxed mb-4">
                Dispatches to the lowest-cost model meeting accuracy requirements. Real-time telemetry streams back via SSE.
              </p>
              <div className="p-3.5 rounded-xl bg-[#f4f1ea] dark:bg-[#1e1d1a] border border-[#e5e0d5] dark:border-[#33302b] font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#878278]">Route:</span>
                  <span className="text-amber-700 dark:text-amber-400 font-semibold">Gemini 2.0 Flash</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#878278]">Token Cost:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">-68% Optimized</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#878278]">Merkle Proof:</span>
                  <span className="text-[#5c5850] dark:text-[#b8b4aa]">0x9b4f...11a2</span>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-[#f4f1ea] dark:border-[#282622] text-xs font-mono text-[#878278]">
              Automated cost arbitrage
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
