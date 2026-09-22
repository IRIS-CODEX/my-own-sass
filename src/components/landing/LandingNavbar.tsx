import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import {
  Moon,
  Sun,
  ArrowRight,
  Menu,
  X,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

const ClaudeStarburst = ({ className = "w-6 h-6 text-[#c15f3c]" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <line x1="12" y1="2" x2="12" y2="6.5" />
    <line x1="12" y1="17.5" x2="12" y2="22" />
    <line x1="2" y1="12" x2="6.5" y2="12" />
    <line x1="17.5" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="4.93" x2="8.1" y2="8.1" />
    <line x1="15.9" y1="15.9" x2="19.07" y2="19.07" />
    <line x1="4.93" y1="19.07" x2="8.1" y2="15.9" />
    <line x1="15.9" y1="8.1" x2="19.07" y2="4.93" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </svg>
);

export const LandingNavbar: React.FC = () => {
  const {
    theme,
    toggleTheme,
    setIsLandingPage,
    setIsLoginPage,
    setAuthModalOpen,
    isAuthenticated,
  } = useAppStore();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 ${
        scrolled
          ? 'bg-[#141413]/95 backdrop-blur-md border-b border-[#2d2c27]'
          : 'bg-[#141413] border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo - Agent Lens Style */}
        <div
          className="flex items-center gap-2.5 cursor-pointer group"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <ClaudeStarburst className="w-6 h-6 text-[#c15f3c] transition-transform duration-300 group-hover:rotate-45" />
          <span className="font-serif text-2xl font-normal tracking-tight text-[#f5f3ef]">
            Agent Lens
          </span>
        </div>

        {/* Desktop Navigation Links matching Screenshot */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-[14px] font-normal text-[#b8b4aa]">
          <div className="hover:text-[#f5f3ef] cursor-pointer transition-colors">
            <span>Product</span>
          </div>
          <div className="hover:text-[#f5f3ef] cursor-pointer transition-colors">
            <span>Developers</span>
          </div>
          <div className="hover:text-[#f5f3ef] cursor-pointer transition-colors">
            <span>Enterprise</span>
          </div>
          <div className="hover:text-[#f5f3ef] cursor-pointer transition-colors">
            <span>Resources</span>
          </div>
          <button
            onClick={() => scrollToSection('pricing')}
            className="hover:text-[#f5f3ef] transition-colors cursor-pointer"
          >
            <span>Pricing</span>
          </button>
        </nav>

        {/* Right Action Buttons matching Screenshot */}
        <div className="hidden sm:flex items-center gap-3 lg:gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-[#b8b4aa] hover:text-[#f5f3ef] hover:bg-[#282622] transition-colors cursor-pointer"
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Login button */}
          <button
            onClick={() => setIsLoginPage(true)}
            className="text-[14px] font-normal text-[#b8b4aa] hover:text-[#f5f3ef] transition-colors cursor-pointer px-2 flex items-center gap-1.5"
            title="Google Auth Login"
          >
            <span>Login</span>
          </button>

          {/* Contact Sales button (as in screenshot) */}
          <button
            onClick={() => scrollToSection('pricing')}
            className="px-4 py-2 rounded-xl border border-[#33312b] hover:border-[#48453e] hover:bg-[#1e1d1b] text-[#f5f3ef] text-[13px] font-normal transition-colors cursor-pointer"
          >
            Contact sales
          </button>

          {/* Try Claude (White pill button as in screenshot) */}
          {isAuthenticated ? (
            <button
              onClick={() => setIsLandingPage(false)}
              className="bg-white hover:bg-[#f3eee5] text-[#141413] px-5 py-2 rounded-xl text-[13px] font-medium transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <span>Workspace</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#141413]" />
            </button>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true, 'signup')}
              className="bg-white hover:bg-[#f3eee5] text-[#141413] px-5 py-2 rounded-xl text-[13px] font-medium transition-all cursor-pointer shadow-sm"
            >
              Try Agent Lens
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-[#5c5850] dark:text-[#b8b4aa]"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#5c5850] dark:text-[#b8b4aa]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden px-6 pt-3 pb-6 bg-[#faf8f5] dark:bg-[#181715] border-b border-[#e5e0d5] dark:border-[#33302b] space-y-4">
          <div className="flex flex-col space-y-3 text-sm">
            <button
              onClick={() => scrollToSection('claude-box-section')}
              className="text-left py-1 text-[#5c5850] dark:text-[#b8b4aa]"
            >
              Overview
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="text-left py-1 text-[#5c5850] dark:text-[#b8b4aa]"
            >
              Capabilities
            </button>
            <button
              onClick={() => scrollToSection('sandbox-demo')}
              className="text-left py-1 text-[#5c5850] dark:text-[#b8b4aa]"
            >
              Interactive Sandbox
            </button>
            <button
              onClick={() => scrollToSection('architecture')}
              className="text-left py-1 text-[#5c5850] dark:text-[#b8b4aa]"
            >
              Architecture
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className="text-left py-1 text-[#5c5850] dark:text-[#b8b4aa]"
            >
              Pricing
            </button>
          </div>

          <div className="pt-3 border-t border-[#e5e0d5] dark:border-[#33302b] flex flex-col gap-2.5">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsLandingPage(false);
                }}
                className="claude-btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-1.5"
              >
                <span>Enter Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthModalOpen(true, 'signin');
                  }}
                  className="py-2 rounded-full border border-[#e5e0d5] dark:border-[#33302b] text-xs font-medium"
                >
                  Log in
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthModalOpen(true, 'signup');
                  }}
                  className="claude-btn-primary py-2 text-xs"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
