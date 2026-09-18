import React, { useState } from 'react';
import {
  KeyRound,
  Radio,
  ShieldCheck,
  TrendingDown,
  Layers,
  Fingerprint,
  Lock,
  ArrowRight,
} from 'lucide-react';

export const LandingFeatures: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const features = [
    {
      icon: KeyRound,
      title: 'Scoped Virtual Keys & Budgets',
      description:
        'Never distribute raw OpenAI or Anthropic API secrets. Issue scoped proxy keys per agent with hard daily spending limits and auto-kill switches.',
      stat: '100% Secret Isolation',
      tag: 'Security Core',
    },
    {
      icon: Radio,
      title: 'Real-Time Telemetry Stream',
      description:
        'Inspect the agent internal reasoning chain, tool parameters, and response evaluation live with sub-millisecond SSE telemetry.',
      stat: '< 15ms Latency Overhead',
      tag: 'Observability',
    },
    {
      icon: ShieldCheck,
      title: 'Human-in-the-Loop Interception',
      description:
        'Define zero-trust policies for high-risk actions (e.g. database deletes, wire transfers). Hold execution in escrow until an authorized operator approves.',
      stat: '300s Escrow TTL',
      tag: 'Escrow Steering',
    },
    {
      icon: TrendingDown,
      title: 'Multi-Model Cost Arbitrage',
      description:
        'Dynamically route routine classification queries to Gemini 2.0 Flash and complex code generation to Claude 3.5 Sonnet, slashing monthly token bills by 68%.',
      stat: '68% Token Savings',
      tag: 'Financial Ops',
    },
    {
      icon: Fingerprint,
      title: 'Cryptographic Merkle Audit Trail',
      description:
        'Every tool call, policy evaluation, and human override is cryptographically hashed and chained into an immutable audit trail for SOC2 & HIPAA audits.',
      stat: 'SHA-256 Merkle Chain',
      tag: 'Compliance',
    },
    {
      icon: Layers,
      title: 'Multi-Tenant SaaS Governance',
      description:
        'Centralized administration panel for enterprise fleets with plan tier switches, automated dunning, and instant tenant suspension.',
      stat: 'Real-Time Radar',
      tag: 'Fleet Control',
    },
  ];

  return (
    <section id="features" className="py-20 sm:py-28 border-t border-[#e5e0d5] dark:border-[#33302b]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - Claude Style */}
        <div className="max-w-2xl mb-16 text-left">
          <div className="text-xs font-mono text-amber-700 dark:text-amber-400 mb-2 uppercase tracking-wider">
            Capabilities & Enclaves
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif text-[#1f1e1b] dark:text-[#f5f3ef] font-normal tracking-tight mb-4">
            Engineered for production agent swarms.
          </h2>
          <p className="text-base text-[#5c5850] dark:text-[#b8b4aa] font-normal leading-relaxed">
            From single autonomous coding agents to distributed enterprise agent swarms, AgentLens delivers safety, visibility, and financial predictability.
          </p>
        </div>

        {/* Clean Bento Grid - Claude Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            const isHovered = hoveredIndex === idx;
            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`claude-card p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 ${
                  isHovered ? 'shadow-sm border-[#d5cfc2] dark:border-[#48453e]' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-10 h-10 rounded-xl bg-[#f4f1ea] dark:bg-[#282622] flex items-center justify-center text-amber-700 dark:text-amber-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono text-[#878278]">
                      {feat.tag}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg text-[#1f1e1b] dark:text-[#f5f3ef] font-normal mb-2.5">
                    {feat.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#5c5850] dark:text-[#b8b4aa] leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-[#f4f1ea] dark:border-[#282622] flex items-center justify-between font-mono text-xs">
                  <span className="text-[#878278]">Benchmark:</span>
                  <span className="font-medium text-amber-700 dark:text-amber-400">
                    {feat.stat}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
