import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const LandingFaq: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'What is the proxy latency overhead of AgentLens?',
      answer:
        'AgentLens adds an average of 14 milliseconds of latency overhead for real-time AST syntax parsing, prompt injection verification, and policy evaluation. Given typical LLM time-to-first-token times of 600ms to 2,500ms, the 14ms overhead is virtually imperceptible to end-users.',
    },
    {
      question: 'How do Scoped Virtual Keys protect our upstream API keys?',
      answer:
        'Instead of putting raw OpenAI, Anthropic, or Gemini API keys inside agent environment variables or client builds, you generate an AgentLens Virtual Key (e.g. al_live_sec_...). The virtual key enforces daily budgets, allowed models, and rate limits. If an agent gets exploited, the attacker only gets a scoped proxy key that can be revoked with one click without resetting master credentials.',
    },
    {
      question: 'How does Human-in-the-Loop (HITL) steering work in production?',
      answer:
        'You configure rule policies (e.g. any tool call touching customer credit cards, database drops, or spend over $5,000). When an agent invokes that tool, AgentLens places the execution token into an escrow state with a customizable TTL (e.g. 300 seconds). An authorized human operator can review the agent’s reasoning and approve or reject the action.',
    },
    {
      question: 'Can AgentLens be deployed on-prem or inside a private VPC?',
      answer:
        'Yes. For Enterprise customers with strict data sovereignty or air-gapped compliance requirements, AgentLens provides hardened Helm charts and Docker containers that run entirely inside your AWS, GCP, or Azure VPC, connecting to your internal KMS.',
    },
    {
      question: 'How does subscription billing and payment processing work?',
      answer:
        'We support both Credit Card (via Stripe) and PayPal recurring subscription billing. When you subscribe or upgrade your plan, quota limits increase immediately without restarting your agents. Annual subscriptions receive a 20% discount.',
    },
  ];

  return (
    <section className="py-20 sm:py-28 border-t border-[#e5e0d5] dark:border-[#33302b]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        {/* Section Header */}
        <div className="mb-12">
          <div className="text-xs font-mono text-amber-700 dark:text-amber-400 mb-2 uppercase tracking-wider">
            Frequently Asked Questions
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif text-[#1f1e1b] dark:text-[#f5f3ef] font-normal tracking-tight">
            Everything you need to know.
          </h2>
        </div>

        {/* Accordion List - Claude Minimalist Dividers */}
        <div className="divide-y divide-[#e5e0d5] dark:divide-[#33302b] border-t border-b border-[#e5e0d5] dark:border-[#33302b]">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className="py-5">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between text-left group cursor-pointer"
                >
                  <span className="font-serif text-base sm:text-lg text-[#1f1e1b] dark:text-[#f5f3ef] font-normal pr-4 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#878278] transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-amber-700 dark:text-amber-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="mt-3 text-xs sm:text-sm text-[#5c5850] dark:text-[#b8b4aa] leading-relaxed pr-8">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
