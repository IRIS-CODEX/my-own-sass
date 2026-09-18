import React from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { Crown, ArrowUp } from 'lucide-react';

export const LandingFooter: React.FC = () => {
  const { setIsAdminView, setAuthModalOpen } = useAppStore();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-[#e5e0d5] dark:border-[#33302b] bg-[#f4f1ea] dark:bg-[#151413] text-[#5c5850] dark:text-[#b8b4aa] pt-16 pb-12 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#e5e0d5] dark:border-[#33302b]">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4 text-left">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-600 dark:bg-amber-500 flex items-center justify-center text-white dark:text-[#181715] font-serif font-bold text-sm">
                A
              </div>
              <span className="font-serif text-xl text-[#1f1e1b] dark:text-[#f5f3ef] font-medium tracking-tight">
                AgentLens
              </span>
            </div>
            <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa] max-w-sm leading-relaxed">
              Zero-trust AI agent governance, real-time observability, and cryptographic virtual key enclaves for autonomous agent fleets.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] text-[11px] font-mono text-[#5c5850] dark:text-[#b8b4aa]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Edge Clusters Operational (0.8ms AST)</span>
            </div>
          </div>

          {/* Col 1: Platform */}
          <div className="space-y-3 text-left">
            <div className="text-[#1f1e1b] dark:text-[#f5f3ef] font-medium text-xs">Platform</div>
            <ul className="space-y-2">
              <li>
                <a href="#features" className="hover:text-amber-700 dark:hover:text-amber-400 transition-colors">
                  Virtual Key Vault
                </a>
              </li>
              <li>
                <a href="#sandbox-demo" className="hover:text-amber-700 dark:hover:text-amber-400 transition-colors">
                  Security Sandbox
                </a>
              </li>
              <li>
                <a href="#architecture" className="hover:text-amber-700 dark:hover:text-amber-400 transition-colors">
                  Architecture Pipeline
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-amber-700 dark:hover:text-amber-400 transition-colors">
                  Fleet Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Col 2: Enclave Compliance */}
          <div className="space-y-3 text-left">
            <div className="text-[#1f1e1b] dark:text-[#f5f3ef] font-medium text-xs">Security</div>
            <ul className="space-y-2">
              <li>
                <span className="text-[#878278]">SOC 2 Type II Attestation</span>
              </li>
              <li>
                <span className="text-[#878278]">HIPAA BAA Agreement</span>
              </li>
              <li>
                <span className="text-[#878278]">EU AI Act Compliance</span>
              </li>
              <li>
                <span className="text-[#878278]">AWS Nitro Enclaves</span>
              </li>
            </ul>
          </div>

          {/* Col 3: SaaS & Admin */}
          <div className="space-y-3 text-left">
            <div className="text-[#1f1e1b] dark:text-[#f5f3ef] font-medium text-xs">Administration</div>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setIsAdminView(true)}
                  className="hover:text-amber-700 dark:hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
                  <span>SaaS Management</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setAuthModalOpen(true, 'signin')}
                  className="hover:text-amber-700 dark:hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Operator Sign In
                </button>
              </li>
              <li>
                <button
                  onClick={() => setAuthModalOpen(true, 'signup')}
                  className="hover:text-amber-700 dark:hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Create Organization
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#878278]">
          <p>© {new Date().getFullYear()} AgentLens Systems Inc. Governed with precision.</p>

          <div className="flex items-center gap-6">
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef] transition-colors cursor-pointer"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
