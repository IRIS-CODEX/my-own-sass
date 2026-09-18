import React, { useState } from 'react';
import { useAdminStore, PricingPackage } from '../../stores/useAdminStore';
import { useAppStore } from '../../stores/useAppStore';
import {
  DollarSign,
  Tag,
  Percent,
  Sparkles,
  Check,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  RotateCcw,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Globe,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingDown,
  Layers,
  Save,
  Edit3,
} from 'lucide-react';

export const AdminPricingManagement: React.FC = () => {
  const {
    pricingPackages,
    updatePackagePrice,
    resetPackagesToDefault,
    addNewPackage,
    deletePackage,
    togglePackageActive,
  } = useAdminStore();

  const { addToast, setIsAdminView } = useAppStore();

  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [previewBillingCycle, setPreviewBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [newFeatureText, setNewFeatureText] = useState<{ [key: string]: string }>({});

  // New package template
  const [newPackageForm, setNewPackageForm] = useState<Omit<PricingPackage, 'id'>>({
    name: 'Custom Team Tier',
    badge: 'New Tier',
    description: 'Custom tailored security guardrails for high-velocity teams.',
    monthlyPrice: 99,
    yearlyPrice: 79,
    requestsQuota: '100,000 requests / mo',
    activeAgents: 'Up to 10 agents',
    features: [
      'AST Zero-Trust Guardrails',
      'Virtual Key Enclave Quotas',
      'Real-time Token Auditing',
      'Email & Slack Support',
    ],
    ctaText: 'Subscribe to Tier',
    isPopular: false,
    isActive: true,
  });

  // Calculate pricing metrics
  const activePackages = pricingPackages.filter((p) => p.isActive);
  const paidPackages = activePackages.filter((p) => p.monthlyPrice > 0);
  const avgMonthlyPrice =
    paidPackages.length > 0
      ? Math.round(paidPackages.reduce((sum, p) => sum + p.monthlyPrice, 0) / paidPackages.length)
      : 0;

  const handlePriceChange = (id: string, field: 'monthlyPrice' | 'yearlyPrice', val: number) => {
    const safeVal = Math.max(0, isNaN(val) ? 0 : val);
    updatePackagePrice(id, { [field]: safeVal });
  };

  const handleAutoCalcYearly = (pkg: PricingPackage) => {
    // 20% discount standard
    const discountPrice = Math.max(0, Math.round(pkg.monthlyPrice * 0.8));
    updatePackagePrice(pkg.id, { yearlyPrice: discountPrice });
    addToast({
      title: 'Annual Price Adjusted',
      description: `Applied 20% discount to ${pkg.name}: $${discountPrice}/mo billed annually.`,
      type: 'success',
    });
  };

  const handleAddFeature = (pkgId: string) => {
    const text = newFeatureText[pkgId]?.trim();
    if (!text) return;
    const target = pricingPackages.find((p) => p.id === pkgId);
    if (!target) return;
    updatePackagePrice(pkgId, { features: [...target.features, text] });
    setNewFeatureText((prev) => ({ ...prev, [pkgId]: '' }));
    addToast({ title: 'Feature Added', description: `Added "${text}" to ${target.name}.`, type: 'info' });
  };

  const handleRemoveFeature = (pkgId: string, index: number) => {
    const target = pricingPackages.find((p) => p.id === pkgId);
    if (!target) return;
    const updated = target.features.filter((_, i) => i !== index);
    updatePackagePrice(pkgId, { features: updated });
  };

  const handleCreatePackageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = 'TIER_' + Math.random().toString(36).substring(2, 8).toUpperCase();
    addNewPackage({
      ...newPackageForm,
      id: newId,
    });
    setShowAddModal(false);
    addToast({
      title: 'Package Created',
      description: `${newPackageForm.name} is now published to the portfolio pricing page.`,
      type: 'success',
    });
  };

  const handleJumpToWebsite = () => {
    setIsAdminView(false);
    setTimeout(() => {
      const el = document.getElementById('pricing');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Context Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-[#b45309] dark:text-[#fbbf24] border border-amber-500/20">
              Live Website Control
            </span>
            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Connected to Portfolio Landing Page
            </span>
          </div>
          <h1 className="text-2xl font-serif font-normal text-[#1f1e1b] dark:text-[#f5f3ef] tracking-tight">
            Portfolio Package &amp; Price Management
          </h1>
          <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa] max-w-2xl mt-1 leading-relaxed">
            Configure subscription tiers, price points, billing cycles, quotas, and feature checklists. Any edits made here immediately synchronize with the live portfolio website and customer checkout modals.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-[#d97706] hover:bg-[#b45309] dark:bg-[#f59e0b] dark:hover:bg-[#fbbf24] text-white dark:text-[#181715] font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Tier</span>
          </button>

          <button
            onClick={resetPackagesToDefault}
            className="px-3 py-2 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] hover:bg-[#f4f1ea] dark:hover:bg-[#282622] text-[#5c5850] dark:text-[#b8b4aa] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reset all prices to factory defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleJumpToWebsite}
            className="px-3 py-2 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/15 text-[#b45309] dark:text-[#fbbf24] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Switch to website view and scroll to pricing"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>View on Website</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#5c5850] dark:text-[#b8b4aa] font-mono">
            <span>ACTIVE TIERS</span>
            <Layers className="w-3.5 h-3.5 text-[#d97706] dark:text-[#f59e0b]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#1f1e1b] dark:text-[#f5f3ef] font-mono">
            {activePackages.length}{' '}
            <span className="text-xs font-normal text-[#878278] dark:text-[#7d7970]">/ {pricingPackages.length} total</span>
          </div>
          <p className="mt-1 text-[11px] text-[#5c5850] dark:text-[#b8b4aa]">
            Visible on the portfolio website
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#5c5850] dark:text-[#b8b4aa] font-mono">
            <span>STARTER BASELINE</span>
            <Tag className="w-3.5 h-3.5 text-[#d97706] dark:text-[#f59e0b]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#1f1e1b] dark:text-[#f5f3ef] font-mono">
            ${pricingPackages.find((p) => p.id === 'STARTER')?.monthlyPrice || 49}
            <span className="text-xs font-normal text-[#878278] dark:text-[#7d7970]"> / mo</span>
          </div>
          <p className="mt-1 text-[11px] text-[#5c5850] dark:text-[#b8b4aa]">
            Annual: ${pricingPackages.find((p) => p.id === 'STARTER')?.yearlyPrice || 39} / mo
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#5c5850] dark:text-[#b8b4aa] font-mono">
            <span>PRO FLEET (PRIMARY)</span>
            <Sparkles className="w-3.5 h-3.5 text-[#d97706] dark:text-[#f59e0b]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#b45309] dark:text-[#fbbf24] font-mono">
            ${pricingPackages.find((p) => p.id === 'PRO_MONTHLY')?.monthlyPrice || 199}
            <span className="text-xs font-normal text-[#878278] dark:text-[#7d7970]"> / mo</span>
          </div>
          <p className="mt-1 text-[11px] text-[#5c5850] dark:text-[#b8b4aa]">
            Annual: ${pricingPackages.find((p) => p.id === 'PRO_MONTHLY')?.yearlyPrice || 159} / mo
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#5c5850] dark:text-[#b8b4aa] font-mono">
            <span>ENTERPRISE ENCLAVE</span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#d97706] dark:text-[#f59e0b]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#1f1e1b] dark:text-[#f5f3ef] font-mono">
            ${pricingPackages.find((p) => p.id === 'ENTERPRISE')?.monthlyPrice || 599}
            <span className="text-xs font-normal text-[#878278] dark:text-[#7d7970]"> / mo</span>
          </div>
          <p className="mt-1 text-[11px] text-[#5c5850] dark:text-[#b8b4aa]">
            Dedicated Air-Gapped VPC SLA
          </p>
        </div>
      </div>

      {/* PACKAGES EDITOR LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#1f1e1b] dark:text-[#f5f3ef] flex items-center gap-2">
            <span>Manage All Subscription Packages</span>
            <span className="text-xs font-normal text-[#878278] dark:text-[#7d7970] font-mono">
              ({pricingPackages.length} configured)
            </span>
          </h2>

          <div className="text-xs text-[#5c5850] dark:text-[#b8b4aa] flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Changes save in real-time</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {pricingPackages.map((pkg) => {
            const isEditing = editingPackageId === pkg.id;
            const annualSavingsPercent =
              pkg.monthlyPrice > 0
                ? Math.round(((pkg.monthlyPrice - pkg.yearlyPrice) / pkg.monthlyPrice) * 100)
                : 0;

            return (
              <div
                key={pkg.id}
                className={`p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#211f1c] border transition-all duration-200 ${
                  pkg.isPopular
                    ? 'border-[#d97706] dark:border-[#f59e0b] shadow-md ring-1 ring-[#d97706]/30'
                    : 'border-[#e5e0d5] dark:border-[#33302b] shadow-xs'
                } ${!pkg.isActive ? 'opacity-60 bg-[#faf8f5]/60 dark:bg-[#181715]/60' : ''}`}
              >
                {/* Header Row: Badge, Popular Switch, Visibility Switch */}
                <div className="flex items-center justify-between pb-3 border-b border-[#e5e0d5] dark:border-[#33302b] gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-[#b45309] dark:text-[#fbbf24] border border-amber-500/20">
                      {pkg.badge}
                    </span>
                    {pkg.isPopular && (
                      <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-[#d97706] dark:bg-[#f59e0b] text-white dark:text-[#181715]">
                        ⭐ Recommended
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Toggle Popular */}
                    <button
                      type="button"
                      onClick={() => {
                        updatePackagePrice(pkg.id, { isPopular: !pkg.isPopular });
                        addToast({
                          title: 'Status Updated',
                          description: `${pkg.name} popular badge toggled.`,
                          type: 'info',
                        });
                      }}
                      className={`px-2 py-1 rounded text-[11px] font-mono border transition-colors cursor-pointer ${
                        pkg.isPopular
                          ? 'bg-[#d97706] text-white dark:bg-[#f59e0b] dark:text-[#181715] border-[#d97706] dark:border-[#f59e0b] font-bold'
                          : 'border-[#e5e0d5] dark:border-[#33302b] text-[#5c5850] dark:text-[#b8b4aa] hover:text-[#1f1e1b]'
                      }`}
                      title="Set as Recommended on Website"
                    >
                      {pkg.isPopular ? 'Featured' : 'Make Featured'}
                    </button>

                    {/* Toggle Visibility */}
                    <button
                      type="button"
                      onClick={() => {
                        togglePackageActive(pkg.id);
                        addToast({
                          title: 'Visibility Changed',
                          description: `${pkg.name} is now ${!pkg.isActive ? 'visible' : 'hidden'} on the portfolio website.`,
                          type: 'info',
                        });
                      }}
                      className="p-1.5 rounded-lg border border-[#e5e0d5] dark:border-[#33302b] hover:bg-[#f4f1ea] dark:hover:bg-[#282622] text-[#5c5850] dark:text-[#b8b4aa] cursor-pointer"
                      title={pkg.isActive ? 'Hide from website' : 'Show on website'}
                    >
                      {pkg.isActive ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-rose-500" />}
                    </button>

                    {/* Delete for custom packages */}
                    {!['FREE', 'STARTER', 'PRO_MONTHLY', 'ENTERPRISE'].includes(pkg.id) && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete tier "${pkg.name}"?`)) {
                            deletePackage(pkg.id);
                            addToast({ title: 'Package Deleted', description: `${pkg.name} removed.`, type: 'info' });
                          }
                        }}
                        className="p-1.5 rounded-lg border border-rose-300 dark:border-rose-800 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                        title="Delete custom package"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Package Name & Description */}
                <div className="py-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={pkg.name}
                      onChange={(e) => updatePackagePrice(pkg.id, { name: e.target.value })}
                      className="font-bold text-base sm:text-lg text-[#1f1e1b] dark:text-[#f5f3ef] bg-transparent border-b border-transparent hover:border-[#e5e0d5] dark:hover:border-[#33302b] focus:border-[#d97706] dark:focus:border-[#f59e0b] focus:outline-hidden w-full transition-colors"
                      placeholder="Package Name"
                    />
                    <span className="text-[10px] font-mono text-[#878278] dark:text-[#7d7970] shrink-0">ID: {pkg.id}</span>
                  </div>

                  <input
                    type="text"
                    value={pkg.description}
                    onChange={(e) => updatePackagePrice(pkg.id, { description: e.target.value })}
                    className="text-xs text-[#5c5850] dark:text-[#b8b4aa] bg-transparent border-b border-transparent hover:border-[#e5e0d5] dark:hover:border-[#33302b] focus:border-[#d97706] dark:focus:border-[#f59e0b] focus:outline-hidden w-full transition-colors"
                    placeholder="Short description for customers..."
                  />
                </div>

                {/* PRICE CONTROLS BOX */}
                <div className="p-3.5 rounded-xl bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] my-3 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Monthly Price */}
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-[#5c5850] dark:text-[#b8b4aa] uppercase mb-1">
                        Monthly Price ($/mo)
                      </label>
                      <div className="flex items-center gap-1.5">
                        <div className="relative flex-1">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-[#878278] font-bold">$</span>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={pkg.monthlyPrice}
                            onChange={(e) => handlePriceChange(pkg.id, 'monthlyPrice', parseInt(e.target.value) || 0)}
                            className="w-full pl-6 pr-2 py-1.5 rounded-lg border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] text-sm font-mono font-bold text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:border-[#d97706] dark:focus:border-[#f59e0b]"
                          />
                        </div>
                        {/* Quick increment buttons */}
                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            onClick={() => handlePriceChange(pkg.id, 'monthlyPrice', pkg.monthlyPrice + 10)}
                            className="px-1 py-0.5 text-[9px] font-mono font-bold bg-[#f4f1ea] dark:bg-[#282622] text-[#1f1e1b] dark:text-[#f5f3ef] border border-[#e5e0d5] dark:border-[#33302b] rounded hover:bg-[#e5e0d5] cursor-pointer"
                          >
                            +10
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePriceChange(pkg.id, 'monthlyPrice', Math.max(0, pkg.monthlyPrice - 10))}
                            className="px-1 py-0.5 text-[9px] font-mono font-bold bg-[#f4f1ea] dark:bg-[#282622] text-[#1f1e1b] dark:text-[#f5f3ef] border border-[#e5e0d5] dark:border-[#33302b] rounded hover:bg-[#e5e0d5] cursor-pointer"
                          >
                            -10
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Yearly Price */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-mono font-bold text-[#5c5850] dark:text-[#b8b4aa] uppercase">
                          Annual Price ($/mo)
                        </label>
                        {pkg.monthlyPrice > 0 && (
                          <button
                            type="button"
                            onClick={() => handleAutoCalcYearly(pkg)}
                            className="text-[9px] font-mono text-[#b45309] dark:text-[#fbbf24] underline hover:no-underline cursor-pointer"
                            title="Set to 20% discount of monthly"
                          >
                            Auto -20%
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="relative flex-1">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-[#878278] font-bold">$</span>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={pkg.yearlyPrice}
                            onChange={(e) => handlePriceChange(pkg.id, 'yearlyPrice', parseInt(e.target.value) || 0)}
                            className="w-full pl-6 pr-2 py-1.5 rounded-lg border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] text-sm font-mono font-bold text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:border-[#d97706] dark:focus:border-[#f59e0b]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary row */}
                  <div className="flex items-center justify-between text-[11px] pt-1 text-[#5c5850] dark:text-[#b8b4aa] font-mono">
                    <span>
                      Annual Savings:{' '}
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {annualSavingsPercent > 0 ? `${annualSavingsPercent}% off` : 'No discount'}
                      </span>
                    </span>
                    <span>
                      Billed Annually:{' '}
                      <span className="font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                        ${pkg.yearlyPrice * 12}/yr
                      </span>
                    </span>
                  </div>
                </div>

                {/* Quotas & Limits Inputs */}
                <div className="grid grid-cols-2 gap-3 py-2">
                  <div>
                    <label className="block text-[10px] font-mono text-[#5c5850] dark:text-[#b8b4aa] uppercase mb-0.5">
                      Request Quota
                    </label>
                    <input
                      type="text"
                      value={pkg.requestsQuota}
                      onChange={(e) => updatePackagePrice(pkg.id, { requestsQuota: e.target.value })}
                      className="w-full px-2.5 py-1 text-xs rounded border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:border-[#d97706] dark:focus:border-[#f59e0b]"
                      placeholder="e.g. 50,000 / mo"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-[#5c5850] dark:text-[#b8b4aa] uppercase mb-0.5">
                      Agent Capacity
                    </label>
                    <input
                      type="text"
                      value={pkg.activeAgents}
                      onChange={(e) => updatePackagePrice(pkg.id, { activeAgents: e.target.value })}
                      className="w-full px-2.5 py-1 text-xs rounded border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:border-[#d97706] dark:focus:border-[#f59e0b]"
                      placeholder="e.g. Up to 5 agents"
                    />
                  </div>
                </div>

                {/* CTA Button Text */}
                <div className="py-2">
                  <label className="block text-[10px] font-mono text-[#5c5850] dark:text-[#b8b4aa] uppercase mb-0.5">
                    Button Label (Call to Action)
                  </label>
                  <input
                    type="text"
                    value={pkg.ctaText}
                    onChange={(e) => updatePackagePrice(pkg.id, { ctaText: e.target.value })}
                    className="w-full px-2.5 py-1 text-xs rounded border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:border-[#d97706] dark:focus:border-[#f59e0b]"
                    placeholder="e.g. Subscribe to Starter"
                  />
                </div>

                {/* Feature Bullet List Manager */}
                <div className="pt-2">
                  <label className="block text-[10px] font-mono font-bold text-[#5c5850] dark:text-[#b8b4aa] uppercase mb-1.5">
                    Features Included ({pkg.features.length})
                  </label>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {pkg.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs py-1 px-2 rounded bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] gap-2 group"
                      >
                        <span className="flex items-center gap-1.5 text-[#1f1e1b] dark:text-[#f5f3ef]">
                          <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="truncate">{feature}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(pkg.id, idx)}
                          className="text-[#878278] hover:text-rose-600 p-0.5 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove feature bullet"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add feature input */}
                  <div className="mt-2 flex items-center gap-1.5">
                    <input
                      type="text"
                      value={newFeatureText[pkg.id] || ''}
                      onChange={(e) =>
                        setNewFeatureText((prev) => ({ ...prev, [pkg.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddFeature(pkg.id);
                        }
                      }}
                      placeholder="Add new feature bullet..."
                      className="flex-1 px-2 py-1 text-xs rounded border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:border-[#d97706] dark:focus:border-[#f59e0b]"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddFeature(pkg.id)}
                      className="px-2.5 py-1 rounded-lg bg-[#d97706] hover:bg-[#b45309] dark:bg-[#f59e0b] dark:hover:bg-[#fbbf24] text-white dark:text-[#181715] text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-4 pt-3 border-t border-[#e5e0d5] dark:border-[#33302b] flex items-center justify-between text-[11px] text-[#5c5850] dark:text-[#b8b4aa]">
                  <span className="font-mono">
                    Status: {pkg.isActive ? '🟢 Active on Website' : '⚪ Hidden'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      addToast({
                        title: 'Tier Synced',
                        description: `All settings for ${pkg.name} saved and active on website.`,
                        type: 'success',
                      });
                    }}
                    className="flex items-center gap-1 text-[#b45309] dark:text-[#fbbf24] font-semibold hover:underline cursor-pointer"
                  >
                    <Save className="w-3 h-3" />
                    <span>Save &amp; Confirm</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* LIVE PREVIEW SIMULATOR ON ADMIN PAGE */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e5e0d5] dark:border-[#33302b]">
          <div>
            <h2 className="text-sm font-bold text-[#1f1e1b] dark:text-[#f5f3ef] flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#d97706] dark:text-[#f59e0b]" />
              <span>Real-Time Website Pricing Preview</span>
            </h2>
            <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa] mt-0.5">
              This preview shows how visitors see your prices right now on the portfolio landing page.
            </p>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="inline-flex items-center p-1 rounded-xl bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b]">
            <button
              onClick={() => setPreviewBillingCycle('MONTHLY')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                previewBillingCycle === 'MONTHLY'
                  ? 'bg-white dark:bg-[#211f1c] text-[#1f1e1b] dark:text-[#f5f3ef] shadow-xs border border-[#e5e0d5] dark:border-[#33302b]'
                  : 'text-[#5c5850] dark:text-[#b8b4aa] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef]'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setPreviewBillingCycle('YEARLY')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                previewBillingCycle === 'YEARLY'
                  ? 'bg-white dark:bg-[#211f1c] text-[#1f1e1b] dark:text-[#f5f3ef] shadow-xs border border-[#e5e0d5] dark:border-[#33302b]'
                  : 'text-[#5c5850] dark:text-[#b8b4aa] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef]'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-500/20">
                SAVE 20%
              </span>
            </button>
          </div>
        </div>

        {/* Live Preview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {activePackages.map((pkg) => {
            const price = previewBillingCycle === 'MONTHLY' ? pkg.monthlyPrice : pkg.yearlyPrice;
            return (
              <div
                key={pkg.id}
                className={`p-4 rounded-xl border flex flex-col justify-between ${
                  pkg.isPopular
                    ? 'bg-white dark:bg-[#211f1c] border-[#d97706] dark:border-[#f59e0b] shadow-xs ring-1 ring-[#d97706]/20'
                    : 'bg-[#faf8f5] dark:bg-[#181715] border-[#e5e0d5] dark:border-[#33302b]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold uppercase text-[#b45309] dark:text-[#fbbf24]">
                      {pkg.badge}
                    </span>
                    {pkg.isPopular && (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-[#b45309] dark:text-[#fbbf24] border border-amber-500/20">
                        Popular
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-[#1f1e1b] dark:text-[#f5f3ef]">{pkg.name}</h3>
                  <div className="mt-2 mb-3">
                    <span className="text-2xl font-black text-[#1f1e1b] dark:text-[#f5f3ef] font-mono">
                      ${price}
                    </span>
                    <span className="text-xs text-[#878278] dark:text-[#7d7970] font-mono">
                      {pkg.monthlyPrice === 0 ? ' forever' : ' / mo'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5c5850] dark:text-[#b8b4aa] mb-3 line-clamp-2 leading-relaxed">
                    {pkg.description}
                  </p>
                  <ul className="space-y-1 text-[11px] text-[#5c5850] dark:text-[#b8b4aa] mb-4">
                    {pkg.features.slice(0, 4).map((f, i) => (
                      <li key={i} className="flex items-center gap-1 truncate">
                        <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={handleJumpToWebsite}
                  className={`w-full py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    pkg.isPopular
                      ? 'bg-[#d97706] hover:bg-[#b45309] dark:bg-[#f59e0b] dark:hover:bg-[#fbbf24] text-white dark:text-[#181715]'
                      : 'border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] text-[#1f1e1b] dark:text-[#f5f3ef] hover:bg-[#f4f1ea]'
                  }`}
                >
                  {pkg.ctaText}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* CREATE NEW PACKAGE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#211f1c] rounded-2xl border border-[#e5e0d5] dark:border-[#33302b] p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5e0d5] dark:border-[#33302b]">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#d97706] dark:text-[#f59e0b]" />
                <h3 className="font-serif font-normal text-lg text-[#1f1e1b] dark:text-[#f5f3ef]">
                  Add New Subscription Tier
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#878278] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePackageSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-mono font-bold text-[#5c5850] dark:text-[#b8b4aa] uppercase mb-1">
                  Package Name
                </label>
                <input
                  type="text"
                  required
                  value={newPackageForm.name}
                  onChange={(e) => setNewPackageForm({ ...newPackageForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715] text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:border-[#d97706] dark:focus:border-[#f59e0b]"
                  placeholder="e.g. Growth Team Gate"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#5c5850] dark:text-[#b8b4aa] uppercase mb-1">
                  Badge Tag
                </label>
                <input
                  type="text"
                  required
                  value={newPackageForm.badge}
                  onChange={(e) => setNewPackageForm({ ...newPackageForm, badge: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715] text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:border-[#d97706] dark:focus:border-[#f59e0b]"
                  placeholder="e.g. Growth"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#5c5850] dark:text-[#b8b4aa] uppercase mb-1">
                    Monthly Price ($/mo)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newPackageForm.monthlyPrice}
                    onChange={(e) =>
                      setNewPackageForm({
                        ...newPackageForm,
                        monthlyPrice: parseInt(e.target.value) || 0,
                        yearlyPrice: Math.round((parseInt(e.target.value) || 0) * 0.8),
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715] text-[#1f1e1b] dark:text-[#f5f3ef] font-mono font-bold focus:outline-hidden focus:border-[#d97706] dark:focus:border-[#f59e0b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[#5c5850] dark:text-[#b8b4aa] uppercase mb-1">
                    Annual Price ($/mo)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newPackageForm.yearlyPrice}
                    onChange={(e) =>
                      setNewPackageForm({
                        ...newPackageForm,
                        yearlyPrice: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715] text-[#1f1e1b] dark:text-[#f5f3ef] font-mono font-bold focus:outline-hidden focus:border-[#d97706] dark:focus:border-[#f59e0b]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#5c5850] dark:text-[#b8b4aa] uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newPackageForm.description}
                  onChange={(e) => setNewPackageForm({ ...newPackageForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715] text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:border-[#d97706] dark:focus:border-[#f59e0b]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#5c5850] dark:text-[#b8b4aa] uppercase mb-1">
                    Request Quota
                  </label>
                  <input
                    type="text"
                    value={newPackageForm.requestsQuota}
                    onChange={(e) => setNewPackageForm({ ...newPackageForm, requestsQuota: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715] text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:border-[#d97706] dark:focus:border-[#f59e0b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[#5c5850] dark:text-[#b8b4aa] uppercase mb-1">
                    Agent Capacity
                  </label>
                  <input
                    type="text"
                    value={newPackageForm.activeAgents}
                    onChange={(e) => setNewPackageForm({ ...newPackageForm, activeAgents: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715] text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:border-[#d97706] dark:focus:border-[#f59e0b]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#5c5850] dark:text-[#b8b4aa] uppercase mb-1">
                  CTA Button Text
                </label>
                <input
                  type="text"
                  value={newPackageForm.ctaText}
                  onChange={(e) => setNewPackageForm({ ...newPackageForm, ctaText: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715] text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:border-[#d97706] dark:focus:border-[#f59e0b]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isPopularCheck"
                  checked={newPackageForm.isPopular}
                  onChange={(e) => setNewPackageForm({ ...newPackageForm, isPopular: e.target.checked })}
                  className="rounded text-[#d97706] focus:ring-[#d97706]"
                />
                <label htmlFor="isPopularCheck" className="text-xs text-[#5c5850] dark:text-[#b8b4aa] font-medium cursor-pointer">
                  Mark as "Recommended" popular choice on website
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#e5e0d5] dark:border-[#33302b]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] text-[#5c5850] dark:text-[#b8b4aa] hover:bg-[#f4f1ea] dark:hover:bg-[#282622] text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#d97706] hover:bg-[#b45309] dark:bg-[#f59e0b] dark:hover:bg-[#fbbf24] text-white dark:text-[#181715] text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  Publish to Website
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
