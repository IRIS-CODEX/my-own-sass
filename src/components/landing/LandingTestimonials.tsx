import React from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

export const LandingTestimonials: React.FC = () => {
  const complianceBadges = [
    { name: 'SOC 2 Type II', detail: 'Audited & Attested' },
    { name: 'HIPAA Compliant', detail: 'Signed BAA Healthcare' },
    { name: 'ISO 27001', detail: 'ISMS Certified' },
    { name: 'EU AI Act Ready', detail: 'High-Risk AI System Logging' },
    { name: 'AES-256 GCM', detail: 'Hardware Security Module' },
  ];

  const testimonials = [
    {
      quote:
        'AgentLens caught 4 prompt injection probes on day one that attempted to extract our production Stripe secrets. It is literally Cloudflare for autonomous agents.',
      author: 'Elena Rostova',
      role: 'Chief Information Security Officer',
      company: 'Acme Autonomous Labs',
    },
    {
      quote:
        'The Human-in-the-Loop approval studio gave our compliance board the confidence to greenlight 20+ automated financial reconciliation agents in production.',
      author: 'David Chen',
      role: 'VP of Platform Engineering',
      company: 'Nova Financial Technologies',
    },
    {
      quote:
        'Our token bill went from $38,000 down to $12,400 monthly because AgentLens automatically arbitrates simple queries to Gemini 2.0 while reserving Claude 3.5 for heavy tasks.',
      author: 'Sarah Lin',
      role: 'Director of AI Infrastructure',
      company: 'FleetForge Intelligence',
    },
  ];

  return (
    <section id="security" className="py-20 sm:py-28 border-t border-[#e5e0d5] dark:border-[#33302b]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Compliance Badges Row */}
        <div className="mb-20">
          <div className="text-center mb-8">
            <div className="text-xs font-mono text-amber-700 dark:text-amber-400 mb-2 uppercase tracking-wider">
              Security & Compliance
            </div>
            <h3 className="font-serif text-2xl text-[#1f1e1b] dark:text-[#f5f3ef] font-normal">
              Enterprise attestations & verifiable security.
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {complianceBadges.map((badge, idx) => (
              <div
                key={idx}
                className="claude-card p-4 text-center flex flex-col items-center justify-center"
              >
                <ShieldCheck className="w-5 h-5 text-amber-700 dark:text-amber-400 mb-2" />
                <div className="text-xs font-medium text-[#1f1e1b] dark:text-[#f5f3ef]">
                  {badge.name}
                </div>
                <div className="text-[10px] text-[#878278] mt-0.5">
                  {badge.detail}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Editorial Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, idx) => (
            <div
              key={idx}
              className="claude-card p-6 sm:p-8 flex flex-col justify-between"
            >
              <blockquote className="text-sm sm:text-base text-[#1f1e1b] dark:text-[#f5f3ef] font-normal leading-relaxed mb-6">
                "{item.quote}"
              </blockquote>

              <div className="pt-4 border-t border-[#f4f1ea] dark:border-[#282622]">
                <div className="font-serif text-sm text-[#1f1e1b] dark:text-[#f5f3ef] font-medium">
                  {item.author}
                </div>
                <div className="text-xs text-[#878278]">
                  {item.role}, {item.company}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
