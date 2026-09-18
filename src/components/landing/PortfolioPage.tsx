import React from 'react';
import { LandingNavbar } from './LandingNavbar';
import { LandingHero } from './LandingHero';
import { LandingFeatures } from './LandingFeatures';
import { LandingInteractiveDemo } from './LandingInteractiveDemo';
import { LandingArchitecture } from './LandingArchitecture';
import { LandingPricing } from './LandingPricing';
import { LandingTestimonials } from './LandingTestimonials';
import { LandingFaq } from './LandingFaq';
import { LandingFooter } from './LandingFooter';
import { AuthModal } from '../auth/AuthModal';
import { SubscriptionModal } from '../subscription/SubscriptionModal';

export const PortfolioPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#faf8f5] dark:bg-[#181715] text-[#1f1e1b] dark:text-[#f5f3ef] selection:bg-amber-500/20 selection:text-amber-900 font-sans transition-colors duration-200">
      {/* Modals for Sign In, Sign Up & Paying Subscriptions */}
      <AuthModal />
      <SubscriptionModal />

      {/* Main Page Layout */}
      <LandingNavbar />

      <main>
        <LandingHero />
        <LandingFeatures />
        <LandingInteractiveDemo />
        <LandingArchitecture />
        <LandingPricing />
        <LandingTestimonials />
        <LandingFaq />
      </main>

      <LandingFooter />
    </div>
  );
};
