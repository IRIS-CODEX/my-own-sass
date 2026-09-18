import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useAppStore } from '../../stores/useAppStore';
import { useAdminStore } from '../../stores/useAdminStore';
import {
  X,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Lock,
  Sparkles,
  ArrowRight,
  Globe,
  Radio,
} from 'lucide-react';

interface PlanDetails {
  id: 'FREE' | 'STARTER' | 'PRO_MONTHLY' | 'PRO_YEARLY' | 'ENTERPRISE';
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  requests: string;
  agents: string;
  features: string[];
}

const PLANS: Record<string, PlanDetails> = {
  FREE: {
    id: 'FREE',
    name: 'Hobby Sandbox',
    monthlyPrice: 0,
    yearlyPrice: 0,
    requests: '10,000 / mo',
    agents: 'Up to 2 agents',
    features: ['Standard LLM proxy', 'Basic prompt inspection', 'Community Discord support'],
  },
  STARTER: {
    id: 'STARTER',
    name: 'Starter Gateway',
    monthlyPrice: 49,
    yearlyPrice: 39,
    requests: '50,000 / mo',
    agents: 'Up to 5 agents',
    features: ['AST Prompt Injection Defense', 'Scoped Virtual Keys', '30-day Merkle Audit Trail', 'Email Support'],
  },
  PRO_MONTHLY: {
    id: 'PRO_MONTHLY',
    name: 'Pro Growth Fleet',
    monthlyPrice: 199,
    yearlyPrice: 159,
    requests: '250,000 / mo',
    agents: 'Unlimited agents',
    features: [
      'Human-in-the-Loop Interception',
      'PII Redaction & Vault Masking',
      'Multi-Model Cost Arbitrage',
      'Real-time Live Stream & Control Tower',
      'Priority 99.99% Gateway SLA',
    ],
  },
  PRO_YEARLY: {
    id: 'PRO_YEARLY',
    name: 'Pro Growth (Annual)',
    monthlyPrice: 159,
    yearlyPrice: 159,
    requests: '500,000 / mo',
    agents: 'Unlimited agents',
    features: [
      'Everything in Pro Monthly',
      'Double Monthly Quota (500k)',
      'Dedicated Slack / Teams Bridge',
      'Free Red-Teaming Simulator',
    ],
  },
  ENTERPRISE: {
    id: 'ENTERPRISE',
    name: 'Enterprise Mission-Critical',
    monthlyPrice: 799,
    yearlyPrice: 639,
    requests: '2,000,000+ / mo',
    agents: 'Unlimited fleets',
    features: [
      'Dedicated Regional Clusters',
      'Custom SLA 99.999% with Financial Guarantee',
      'Air-Gapped Private VPC Deployment',
      'SOC2 Type II & HIPAA BAA Signed',
      'Dedicated AI Security Architect',
    ],
  },
};

export const SubscriptionModal: React.FC = () => {
  const {
    subscriptionModalOpen,
    subscriptionTargetPlan,
    setSubscriptionModalOpen,
    subscribePlan,
    currentOrg,
    currentUser,
    addToast,
  } = useAppStore();

  const { recordNewSubscription, pricingPackages } = useAdminStore();

  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'PAYPAL'>('CARD');

  // Card Form State
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardHolder, setCardHolder] = useState(currentUser?.name || '');
  const [postalCode, setPostalCode] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!subscriptionModalOpen) return null;

  // Dynamic pricing package from Admin store if available
  const dynamicPkg = (pricingPackages || []).find((p) => p.id === subscriptionTargetPlan);
  const fallbackPlan = PLANS[subscriptionTargetPlan] || PLANS['PRO_MONTHLY'];
  const currentPlan = dynamicPkg
    ? {
        id: dynamicPkg.id as any,
        name: dynamicPkg.name,
        monthlyPrice: dynamicPkg.monthlyPrice,
        yearlyPrice: dynamicPkg.yearlyPrice,
        requests: dynamicPkg.requestsQuota,
        agents: dynamicPkg.activeAgents,
        features: dynamicPkg.features,
      }
    : fallbackPlan;

  const unitPrice = billingCycle === 'YEARLY' ? currentPlan.yearlyPrice : currentPlan.monthlyPrice;
  const annualTotal = currentPlan.yearlyPrice * 12;
  const amountToCharge = billingCycle === 'YEARLY' ? annualTotal : unitPrice;

  const handleTestCardFill = () => {
    setCardNumber('4242 8841 9920 4482');
    setCardExpiry('08/29');
    setCardCvc('482');
    setPostalCode('94103');
    addToast({ title: 'Test Card Filled', description: 'Stripe sandbox test card injected.', type: 'info' });
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      // Trigger confetti celebration
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#d97706', '#f59e0b', '#38bdf8', '#ffffff'],
        });
      } catch (err) {}

      setIsProcessing(false);
      setIsSuccess(true);

      // Record in Admin store for central bookkeeping
      recordNewSubscription({
        tenantName: currentOrg.name || 'Acme Autonomous Labs',
        email: currentUser?.email || 'alex@acmelabs.ai',
        planTier: currentPlan.id as any,
        amountUsd: amountToCharge,
        paymentMethod: paymentMethod === 'PAYPAL' ? 'PAYPAL' : 'MASTERCARD',
        cardLast4: paymentMethod === 'CARD' ? cardNumber.slice(-4).replace(/\s/g, '') || '4482' : undefined,
      });

      // Update Customer Workspace Store
      subscribePlan(currentPlan.id, billingCycle, {
        type: paymentMethod,
        cardLast4: cardNumber.slice(-4).replace(/\s/g, '') || '4482',
        email: currentUser?.email,
      });

      setTimeout(() => {
        setIsSuccess(false);
      }, 1400);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-[#faf8f5] dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xl text-[#1f1e1b] dark:text-[#f5f3ef]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={() => setSubscriptionModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-xl text-[#878278] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef] hover:bg-[#ece8df] dark:hover:bg-[#282622] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          /* SUCCESS STATE */
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-[#1f1e1b] dark:text-[#f5f3ef]">Payment Succeeded & Fleet Activated!</h3>
            <p className="text-sm text-[#5c5850] dark:text-[#b8b4aa] max-w-md mx-auto">
              Your organization has been upgraded to <strong className="text-[#d97706] dark:text-[#f59e0b]">{currentPlan.name}</strong>. Quota limits increased immediately.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-[#d97706] dark:text-[#f59e0b] border border-amber-500/20 text-xs font-mono">
              <Sparkles className="w-4 h-4" />
              <span>Redirecting to Customer Workspace...</span>
            </div>
          </div>
        ) : (
          /* CHECKOUT FORM */
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left: Plan Summary & Quota */}
            <div className="md:col-span-5 flex flex-col justify-between p-5 rounded-2xl bg-[#f4f1ea] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b]">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#1f1e1b] text-white dark:bg-[#f5f3ef] dark:text-[#181715] uppercase tracking-wider">
                    {billingCycle} PLAN
                  </span>
                  <span className="text-xs text-[#878278] dark:text-[#7d7970] font-mono">ID: {currentPlan.id}</span>
                </div>

                <h3 className="text-lg font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">{currentPlan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-black tracking-tight text-[#1f1e1b] dark:text-[#f5f3ef]">
                    ${unitPrice}
                  </span>
                  <span className="text-xs text-[#878278] dark:text-[#7d7970]">/ month</span>
                </div>

                {billingCycle === 'YEARLY' && unitPrice > 0 && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                    Billed annually at ${annualTotal} (Save 20%)
                  </p>
                )}

                {/* Billing Cycle Switcher */}
                <div className="flex p-1 mt-4 rounded-xl bg-[#e5e0d5] dark:bg-[#282622] text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setBillingCycle('MONTHLY')}
                    className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                      billingCycle === 'MONTHLY'
                        ? 'bg-white dark:bg-[#181715] text-[#1f1e1b] dark:text-[#f5f3ef] shadow-xs font-bold'
                        : 'text-[#5c5850] dark:text-[#b8b4aa]'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle('YEARLY')}
                    className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                      billingCycle === 'YEARLY'
                        ? 'bg-white dark:bg-[#181715] text-[#1f1e1b] dark:text-[#f5f3ef] shadow-xs font-bold'
                        : 'text-[#5c5850] dark:text-[#b8b4aa]'
                    }`}
                  >
                    Yearly (-20%)
                  </button>
                </div>

                {/* Features list */}
                <div className="mt-5 space-y-2 pt-4 border-t border-[#e5e0d5] dark:border-[#33302b]">
                  <div className="text-[11px] font-mono uppercase text-[#878278] dark:text-[#7d7970] tracking-wider font-bold">
                    Included Capabilities
                  </div>
                  {currentPlan.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-[#5c5850] dark:text-[#b8b4aa]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#d97706] dark:text-[#f59e0b] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Organization Footnote */}
              <div className="mt-6 pt-3 border-t border-[#e5e0d5] dark:border-[#33302b] text-[11px] text-[#878278] dark:text-[#7d7970]">
                Billing Account: <strong className="text-[#1f1e1b] dark:text-[#f5f3ef]">{currentOrg.name}</strong>
              </div>
            </div>

            {/* Right: Payment Method & Execution */}
            <div className="md:col-span-7 flex flex-col justify-between">
              <form onSubmit={handleProcessPayment} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#878278] dark:text-[#7d7970] font-mono">
                      Select Payment Method
                    </label>
                    <button
                      type="button"
                      onClick={handleTestCardFill}
                      className="text-[11px] text-[#d97706] dark:text-[#f59e0b] hover:underline font-mono cursor-pointer"
                    >
                      Fill Demo Card
                    </button>
                  </div>

                  {/* Payment Method Selector Tabs */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CARD')}
                      className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        paymentMethod === 'CARD'
                          ? 'border-[#d97706] bg-amber-500/10 text-[#d97706] dark:text-[#f59e0b] font-bold'
                          : 'border-[#e5e0d5] dark:border-[#33302b] text-[#5c5850] dark:text-[#b8b4aa] hover:border-amber-500/30'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span className="text-xs">Credit Card</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('PAYPAL')}
                      className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        paymentMethod === 'PAYPAL'
                          ? 'border-[#d97706] bg-amber-500/10 text-[#d97706] dark:text-[#f59e0b] font-bold'
                          : 'border-[#e5e0d5] dark:border-[#33302b] text-[#5c5850] dark:text-[#b8b4aa] hover:border-amber-500/30'
                      }`}
                    >
                      <span className="font-black italic text-blue-500 text-xs">P</span>
                      <span className="font-black italic text-sky-400 text-xs">PayPal</span>
                    </button>
                  </div>
                </div>

                {paymentMethod === 'CARD' ? (
                  /* CARD INPUTS */
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#5c5850] dark:text-[#b8b4aa] mb-1">
                        Card Number
                      </label>
                      <div className="relative">
                        <CreditCard className="w-4 h-4 text-[#878278] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="4242 4242 4242 4242"
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715] text-xs font-mono text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:border-[#d97706]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#5c5850] dark:text-[#b8b4aa] mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full px-3 py-2 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715] text-xs font-mono text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:border-[#d97706]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#5c5850] dark:text-[#b8b4aa] mb-1">
                          Security CVC
                        </label>
                        <input
                          type="text"
                          required
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          placeholder="CVC"
                          className="w-full px-3 py-2 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715] text-xs font-mono text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:border-[#d97706]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#5c5850] dark:text-[#b8b4aa] mb-1">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          required
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          placeholder="Alex Vance"
                          className="w-full px-3 py-2 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715] text-xs font-mono text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:border-[#d97706]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#5c5850] dark:text-[#b8b4aa] mb-1">
                          Postal / Zip Code
                        </label>
                        <input
                          type="text"
                          required
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          placeholder="94107"
                          className="w-full px-3 py-2 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715] text-xs font-mono text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:border-[#d97706]"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* PAYPAL FAST CHECKOUT */
                  <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 text-center space-y-3">
                    <div className="text-xs text-[#5c5850] dark:text-[#b8b4aa]">
                      Connect your PayPal account for automated monthly recurring subscription billing with instant PayPal Buyer Protection.
                    </div>
                    <div className="py-2.5 px-4 rounded-xl bg-[#ffc439] text-[#003087] font-bold text-sm shadow-xs hover:bg-[#ffb71b] cursor-pointer flex items-center justify-center gap-2">
                      <span className="italic font-black">PayPal</span>
                      <span className="text-xs font-bold text-slate-900">Subscribe Now</span>
                    </div>
                  </div>
                )}

                {/* Cost Breakdown */}
                <div className="p-3 rounded-2xl bg-[#f4f1ea] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] font-mono text-xs space-y-1.5">
                  <div className="flex justify-between text-[#878278] dark:text-[#7d7970]">
                    <span>Subtotal:</span>
                    <span>${amountToCharge}.00</span>
                  </div>
                  <div className="flex justify-between text-[#878278] dark:text-[#7d7970]">
                    <span>Tax (0% Reverse Charge B2B):</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-[#e5e0d5] dark:border-[#33302b] text-sm font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                    <span>Total Due Today:</span>
                    <span className="text-[#d97706] dark:text-[#f59e0b]">${amountToCharge}.00 USD</span>
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3 claude-btn-primary text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white dark:border-[#181715] border-t-transparent rounded-full animate-spin" />
                      <span>Authorizing Gateway...</span>
                    </div>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Authorize & Upgrade Fleet (${amountToCharge})</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-4 text-[10px] text-[#878278] dark:text-[#7d7970] font-mono">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" /> PCI-DSS Level 1
                  </span>
                  <span>•</span>
                  <span>Instant Activation</span>
                  <span>•</span>
                  <span>Cancel Anytime</span>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
