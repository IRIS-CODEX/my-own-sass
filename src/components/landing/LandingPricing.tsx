import React, { useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { useAdminStore } from '../../stores/useAdminStore';
import { Check, ArrowRight } from 'lucide-react';

export const LandingPricing: React.FC = () => {
  const { setSubscriptionModalOpen, setAuthModalOpen } = useAppStore();
  const { pricingPackages } = useAdminStore();
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');

  // Filter to active tiers
  const activeTiers = (pricingPackages || []).filter((p) => p.isActive);

  return (
    <section id="pricing" className="py-20 sm:py-28 border-t border-[#e5e0d5] dark:border-[#33302b]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-mono text-amber-700 dark:text-amber-400 mb-2 uppercase tracking-wider">
            Plans &amp; Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif text-[#1f1e1b] dark:text-[#f5f3ef] font-normal tracking-tight mb-4">
            Transparent pricing for every scale.
          </h2>
          <p className="text-base text-[#5c5850] dark:text-[#b8b4aa] font-normal leading-relaxed">
            Predictable quotas and flexible options for solo engineers, fast-growing AI startups, and regulated enterprises.
          </p>

          {/* Monthly / Yearly Toggle - Claude Style */}
          <div className="inline-flex items-center p-1 rounded-full border border-[#e5e0d5] dark:border-[#33302b] bg-[#f4f1ea] dark:bg-[#282622] mt-6">
            <button
              onClick={() => setBillingCycle('MONTHLY')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                billingCycle === 'MONTHLY'
                  ? 'bg-white dark:bg-[#211f1c] text-[#1f1e1b] dark:text-[#f5f3ef] shadow-xs'
                  : 'text-[#5c5850] dark:text-[#b8b4aa]'
              }`}
            >
              Monthly billing
            </button>
            <button
              onClick={() => setBillingCycle('YEARLY')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                billingCycle === 'YEARLY'
                  ? 'bg-white dark:bg-[#211f1c] text-[#1f1e1b] dark:text-[#f5f3ef] shadow-xs'
                  : 'text-[#5c5850] dark:text-[#b8b4aa]'
              }`}
            >
              <span>Annual billing</span>
              <span className="px-1.5 py-0.5 rounded-full bg-amber-600/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px] font-semibold">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid - Claude Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {activeTiers.map((tier) => {
            const price = billingCycle === 'YEARLY' ? tier.yearlyPrice : tier.monthlyPrice;

            const handleTierClick = () => {
              if (tier.monthlyPrice === 0) {
                setAuthModalOpen(true, 'signup');
              } else {
                setSubscriptionModalOpen(true, tier.id as any);
              }
            };

            return (
              <div
                key={tier.id}
                className={`p-6 sm:p-7 rounded-2xl flex flex-col justify-between transition-all duration-200 ${
                  tier.isPopular
                    ? 'claude-box-highlight'
                    : 'claude-card'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-serif text-lg text-[#1f1e1b] dark:text-[#f5f3ef]">
                      {tier.name}
                    </span>
                    {tier.badge && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                        {tier.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa] leading-relaxed mb-6 min-h-[36px]">
                    {tier.description}
                  </p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="font-serif text-3xl sm:text-4xl text-[#1f1e1b] dark:text-[#f5f3ef] font-normal">
                        ${price}
                      </span>
                      <span className="text-xs text-[#878278]">
                        {tier.monthlyPrice === 0 ? ' forever' : ' / month'}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-[#878278] mt-1">
                      {tier.requestsQuota}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={handleTierClick}
                    className={`w-full py-2 px-3 text-xs mb-6 cursor-pointer flex items-center justify-center gap-1.5 ${
                      tier.isPopular
                        ? 'claude-btn-primary'
                        : 'claude-btn-secondary'
                    }`}
                  >
                    <span>{tier.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {/* Feature Checklist */}
                  <div className="pt-4 border-t border-[#f4f1ea] dark:border-[#282622] space-y-2.5">
                    <div className="text-[11px] font-mono text-[#878278] uppercase">
                      Included
                    </div>
                    {tier.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2 text-xs text-[#5c5850] dark:text-[#b8b4aa]">
                        <Check className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
