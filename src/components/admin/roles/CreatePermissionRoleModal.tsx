import React, { useState } from 'react';
import {
  X,
  ShieldPlus,
  Check,
  Ban,
  Eye,
  Search,
  Lock,
  Unlock,
  Layers,
  Sparkles,
  CheckSquare,
  Square,
  Sliders,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  MASTER_PAGES_REGISTRY,
  PagePermissionId,
  ClearanceLevel,
  PagePermissionConfig,
  ActionPermissions,
  createFullPagePermissions,
} from '../../../types/rbac';
import { useRoleManagementStore } from '../../../stores/useRoleManagementStore';
import { useAppStore } from '../../../stores/useAppStore';

interface CreatePermissionRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoleCreated?: (roleId: string) => void;
}

export const CreatePermissionRoleModal: React.FC<CreatePermissionRoleModalProps> = ({
  isOpen,
  onClose,
  onRoleCreated,
}) => {
  const { roles, createRoleWithPermissions } = useRoleManagementStore();
  const { addToast } = useAppStore();

  // Active step inside modal
  const [activeStep, setActiveStep] = useState<'profile' | 'permissions'>('permissions');

  // Role identity state
  const [name, setName] = useState('');
  const [badge, setBadge] = useState('');
  const [description, setDescription] = useState('');
  const [clearanceLevel, setClearanceLevel] = useState<ClearanceLevel>('LEVEL_2_OPERATOR');
  const [color, setColor] = useState('#d97706');

  // Permissions state: initialized with Zero-Trust (all denied) by default or custom
  const [permissions, setPermissions] = useState<Record<PagePermissionId, PagePermissionConfig>>(() => {
    return createFullPagePermissions(false);
  });

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [expandedPages, setExpandedPages] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const categories = [
    'ALL',
    'Application Core',
    'Security & Privacy',
    'Compliance & Billing',
    'SaaS Central Main-Admin',
  ];

  const filteredPages = MASTER_PAGES_REGISTRY.filter((p) => {
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesQuery =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.features.some((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  const totalPages = MASTER_PAGES_REGISTRY.length;
  const allowedPagesCount = Object.values(permissions).filter((p) => p.enabled).length;
  const deniedPagesCount = totalPages - allowedPagesCount;

  // Bulk presets
  const handleAllowAll = () => {
    setPermissions(createFullPagePermissions(true));
    addToast({
      title: 'Granted Full Access',
      description: 'All pages and operational actions marked as Allowed.',
      type: 'info',
    });
  };

  const handleDenyAll = () => {
    setPermissions(createFullPagePermissions(false));
    addToast({
      title: 'Zero-Trust Enforced',
      description: 'All pages and operational actions marked as Prohibited.',
      type: 'info',
    });
  };

  const handleReadOnlyPreset = () => {
    const next: Record<PagePermissionId, PagePermissionConfig> = createFullPagePermissions(false);
    for (const page of MASTER_PAGES_REGISTRY) {
      next[page.id] = {
        enabled: true,
        actions: {
          canView: true,
          canCreate: false,
          canEdit: false,
          canDelete: false,
          canExport: true,
          canAdminOverride: false,
        },
        granularFeatures: {},
      };
      for (const feat of page.features) {
        // Only low/medium risk features enabled for read-only
        next[page.id].granularFeatures[feat.key] = feat.riskLevel === 'LOW';
      }
    }
    setPermissions(next);
    addToast({
      title: 'Read-Only Preset Applied',
      description: 'Configured view-only access across all pages.',
      type: 'info',
    });
  };

  const handleApplyTemplate = (templateRoleId: string) => {
    const template = roles.find((r) => r.id === templateRoleId);
    if (!template) return;
    setPermissions(JSON.parse(JSON.stringify(template.pagePermissions)));
    setClearanceLevel(template.clearanceLevel);
    setColor(template.color);
    addToast({
      title: 'Template Cloned',
      description: `Loaded access matrix from existing role "${template.name}".`,
      type: 'info',
    });
  };

  // Toggle single page access allowed / prohibited
  const handleTogglePage = (pageId: PagePermissionId, enable?: boolean) => {
    setPermissions((prev) => {
      const current = prev[pageId] || {
        enabled: false,
        actions: {
          canView: false,
          canCreate: false,
          canEdit: false,
          canDelete: false,
          canExport: false,
          canAdminOverride: false,
        },
        granularFeatures: {},
      };

      const newEnabled = enable !== undefined ? enable : !current.enabled;
      const pageDef = MASTER_PAGES_REGISTRY.find((p) => p.id === pageId);

      const granularFeatures: Record<string, boolean> = {};
      if (pageDef) {
        for (const f of pageDef.features) {
          granularFeatures[f.key] = newEnabled;
        }
      }

      return {
        ...prev,
        [pageId]: {
          enabled: newEnabled,
          actions: {
            canView: newEnabled,
            canCreate: newEnabled,
            canEdit: newEnabled,
            canDelete: newEnabled,
            canExport: newEnabled,
            canAdminOverride: false,
          },
          granularFeatures,
        },
      };
    });
  };

  // Toggle single action on a page
  const handleToggleAction = (pageId: PagePermissionId, actionKey: keyof ActionPermissions) => {
    setPermissions((prev) => {
      const current = prev[pageId];
      if (!current) return prev;
      return {
        ...prev,
        [pageId]: {
          ...current,
          actions: {
            ...current.actions,
            [actionKey]: !current.actions[actionKey],
          },
        },
      };
    });
  };

  // Toggle single granular feature
  const handleToggleFeature = (pageId: PagePermissionId, featureKey: string) => {
    setPermissions((prev) => {
      const current = prev[pageId];
      if (!current) return prev;
      return {
        ...prev,
        [pageId]: {
          ...current,
          granularFeatures: {
            ...current.granularFeatures,
            [featureKey]: !current.granularFeatures[featureKey],
          },
        },
      };
    });
  };

  const togglePageExpand = (pageId: string) => {
    setExpandedPages((prev) => ({ ...prev, [pageId]: !prev[pageId] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast({
        title: 'Role Name Required',
        description: 'Please specify a title for the new role or permission profile.',
        type: 'warning',
      });
      setActiveStep('profile');
      return;
    }

    const created = createRoleWithPermissions({
      name: name.trim(),
      badge: badge.trim() || 'Custom Role',
      description:
        description.trim() ||
        `Custom role with ${allowedPagesCount} allowed access sections and ${deniedPagesCount} prohibited sections.`,
      clearanceLevel,
      color,
      pagePermissions: permissions,
    });

    addToast({
      title: 'Role & Permissions Created',
      description: `Successfully registered "${created.name}" with ${allowedPagesCount} allowed and ${deniedPagesCount} prohibited pages.`,
      type: 'success',
    });

    if (onRoleCreated) {
      onRoleCreated(created.id);
    }
    onClose();
  };

  const presetColors = [
    '#d97706',
    '#3b82f6',
    '#10b981',
    '#8b5cf6',
    '#ef4444',
    '#ec4899',
    '#06b6d4',
    '#f59e0b',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div
        className="w-full max-w-5xl bg-[#faf8f5] dark:bg-[#1c1b18] border border-[#e5e0d5] dark:border-[#33302b] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#e5e0d5] dark:border-[#33302b] bg-white/80 dark:bg-[#22201d]/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0"
              style={{ backgroundColor: color }}
            >
              <ShieldPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                  Add New Role &amp; Permission Profile
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#d97706]/15 text-[#b45309] dark:text-[#fbbf24]">
                  Access Governance
                </span>
              </div>
              <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa] mt-0.5">
                Define what this new role is allowed to access and what is strictly prohibited.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] text-xs font-mono">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-3 h-3" /> {allowedPagesCount} Allowed
              </span>
              <span className="text-[#878278] dark:text-[#7d7970]">|</span>
              <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                <Ban className="w-3 h-3" /> {deniedPagesCount} Prohibited
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#5c5850] dark:text-[#b8b4aa] hover:bg-[#f4f1ea] dark:hover:bg-[#282622] transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step Selector Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-[#e5e0d5] dark:border-[#33302b] bg-[#f5f2eb] dark:bg-[#191815] shrink-0">
          <button
            type="button"
            onClick={() => setActiveStep('permissions')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeStep === 'permissions'
                ? 'bg-white dark:bg-[#22201d] text-[#1f1e1b] dark:text-[#f5f3ef] shadow-xs'
                : 'text-[#5c5850] dark:text-[#b8b4aa] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-[#d97706]" />
            <span>1. What It Should Access &amp; What It Shouldn't ({allowedPagesCount}/{totalPages})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStep('profile')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeStep === 'profile'
                ? 'bg-white dark:bg-[#22201d] text-[#1f1e1b] dark:text-[#f5f3ef] shadow-xs'
                : 'text-[#5c5850] dark:text-[#b8b4aa] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef]'
            }`}
          >
            <ShieldPlus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>2. Role Profile &amp; Clearance Level</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* STEP 1: PERMISSIONS ACCESS & PROHIBITION MATRIX */}
          {activeStep === 'permissions' && (
            <div className="space-y-4">
              {/* Role Title Quick Bar */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex-1 min-w-[220px]">
                  <label className="block text-[11px] font-bold text-[#5c5850] dark:text-[#b8b4aa] mb-1">
                    Role / Permission Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Compliance Auditor, Tier-2 Support, Gateway Operator..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-bold rounded-xl bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:ring-1 focus:ring-[#d97706]"
                  />
                </div>

                {/* Clone From Existing Role */}
                <div className="min-w-[180px]">
                  <label className="block text-[11px] font-bold text-[#5c5850] dark:text-[#b8b4aa] mb-1">
                    Pre-fill From Existing Role
                  </label>
                  <select
                    onChange={(e) => {
                      if (e.target.value) handleApplyTemplate(e.target.value);
                    }}
                    defaultValue=""
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] text-[#1f1e1b] dark:text-[#f5f3ef] cursor-pointer"
                  >
                    <option value="" disabled>
                      Select Role Template...
                    </option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.clearanceLevel})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick Presets & Filters Toolbar */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-bold text-[#5c5850] dark:text-[#b8b4aa] mr-1">
                      Quick Presets:
                    </span>
                    <button
                      type="button"
                      onClick={handleAllowAll}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>Allow All</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDenyAll}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/20 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Ban className="w-3 h-3" />
                      <span>Deny All (Zero-Trust)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleReadOnlyPreset}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/20 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Read-Only</span>
                    </button>
                  </div>

                  {/* Search */}
                  <div className="relative w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#878278]" />
                    <input
                      type="text"
                      placeholder="Search pages & operations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:ring-1 focus:ring-[#d97706]"
                    />
                  </div>
                </div>

                {/* Category Filters */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-[#f0ede6] dark:border-[#2b2824]">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                        selectedCategory === cat
                          ? 'bg-[#1f1e1b] dark:bg-[#f5f3ef] text-white dark:text-[#1f1e1b]'
                          : 'bg-[#faf8f5] dark:bg-[#181715] text-[#5c5850] dark:text-[#b8b4aa] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef] border border-[#e5e0d5] dark:border-[#33302b]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pages Access Configuration Cards */}
              <div className="space-y-3">
                {filteredPages.map((page) => {
                  const pageConfig = permissions[page.id] || {
                    enabled: false,
                    actions: {
                      canView: false,
                      canCreate: false,
                      canEdit: false,
                      canDelete: false,
                      canExport: false,
                      canAdminOverride: false,
                    },
                    granularFeatures: {},
                  };

                  const isAllowed = pageConfig.enabled;
                  const isExpanded = !!expandedPages[page.id];

                  return (
                    <div
                      key={page.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isAllowed
                          ? 'bg-white dark:bg-[#211f1c] border-emerald-500/30 dark:border-emerald-500/30 shadow-xs'
                          : 'bg-[#faf8f5]/60 dark:bg-[#181715]/60 border-[#e5e0d5] dark:border-[#33302b] opacity-85'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleTogglePage(page.id)}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                              isAllowed
                                ? 'bg-emerald-500 text-white shadow-xs'
                                : 'bg-[#e5e0d5] dark:bg-[#33302b] text-[#878278]'
                            }`}
                            title={isAllowed ? 'Click to prohibit access' : 'Click to grant access'}
                          >
                            {isAllowed ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                          </button>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-xs text-[#1f1e1b] dark:text-[#f5f3ef]">
                                {page.name}
                              </h4>
                              <span className="font-mono text-[10px] text-[#878278] dark:text-[#7d7970]">
                                {page.route}
                              </span>
                              <span className="text-[10px] font-bold text-[#878278] dark:text-[#7d7970] px-1.5 py-0.2 rounded bg-[#f4f1ea] dark:bg-[#282622]">
                                {page.category}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#5c5850] dark:text-[#b8b4aa] mt-0.5 line-clamp-1">
                              {page.description}
                            </p>
                          </div>
                        </div>

                        {/* Allowed / Prohibited Status Toggle */}
                        <div className="flex items-center gap-2">
                          {isAllowed ? (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                              <Check className="w-3 h-3" /> Access Allowed
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1">
                              <Ban className="w-3 h-3" /> Access Prohibited
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleTogglePage(page.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isAllowed
                                ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                            }`}
                          >
                            {isAllowed ? 'Revoke Access' : 'Grant Access'}
                          </button>

                          {isAllowed && (
                            <button
                              type="button"
                              onClick={() => togglePageExpand(page.id)}
                              className="p-1.5 rounded-lg text-[#5c5850] dark:text-[#b8b4aa] hover:bg-[#f4f1ea] dark:hover:bg-[#282622] transition-all cursor-pointer"
                              title="Fine-tune actions"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Granular Actions & Operations (When Page is Allowed) */}
                      {isAllowed && (
                        <div className="mt-3 pt-3 border-t border-[#f0ede6] dark:border-[#2b2824] space-y-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-[#5c5850] dark:text-[#b8b4aa]">
                              Allowed Operational Privileges:
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setPermissions((prev) => ({
                                    ...prev,
                                    [page.id]: {
                                      ...prev[page.id],
                                      actions: {
                                        canView: true,
                                        canCreate: true,
                                        canEdit: true,
                                        canDelete: true,
                                        canExport: true,
                                        canAdminOverride: true,
                                      },
                                    },
                                  }));
                                }}
                                className="text-[10px] font-bold text-[#d97706] hover:underline cursor-pointer"
                              >
                                Enable All Actions
                              </button>
                              <span className="text-[#878278]">·</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setPermissions((prev) => ({
                                    ...prev,
                                    [page.id]: {
                                      ...prev[page.id],
                                      actions: {
                                        canView: true,
                                        canCreate: false,
                                        canEdit: false,
                                        canDelete: false,
                                        canExport: false,
                                        canAdminOverride: false,
                                      },
                                    },
                                  }));
                                }}
                                className="text-[10px] font-bold text-[#878278] hover:underline cursor-pointer"
                              >
                                View Only
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                            {[
                              { key: 'canView', label: 'View / Read' },
                              { key: 'canCreate', label: 'Create' },
                              { key: 'canEdit', label: 'Edit / Modify' },
                              { key: 'canDelete', label: 'Delete' },
                              { key: 'canExport', label: 'Export Data' },
                              { key: 'canAdminOverride', label: 'Admin Override' },
                            ].map(({ key, label }) => {
                              const actionKey = key as keyof ActionPermissions;
                              const checked = pageConfig.actions[actionKey];

                              return (
                                <button
                                  key={key}
                                  type="button"
                                  onClick={() => handleToggleAction(page.id, actionKey)}
                                  className={`p-2 rounded-xl text-left text-xs transition-all cursor-pointer flex items-center gap-2 border ${
                                    checked
                                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
                                      : 'bg-[#faf8f5] dark:bg-[#181715] border-[#e5e0d5] dark:border-[#33302b] text-[#878278]'
                                  }`}
                                >
                                  {checked ? (
                                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                  ) : (
                                    <Square className="w-3.5 h-3.5 text-[#878278] shrink-0" />
                                  )}
                                  <span className="truncate font-medium">{label}</span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Expanded Granular Features */}
                          {isExpanded && page.features.length > 0 && (
                            <div className="mt-3 p-3 rounded-xl bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] space-y-2">
                              <span className="text-[11px] font-bold text-[#1f1e1b] dark:text-[#f5f3ef] block">
                                Fine-Grained Security Features ({page.features.length}):
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {page.features.map((feat) => {
                                  const featEnabled = pageConfig.granularFeatures[feat.key] !== false;

                                  return (
                                    <button
                                      key={feat.key}
                                      type="button"
                                      onClick={() => handleToggleFeature(page.id, feat.key)}
                                      className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-start gap-2 ${
                                        featEnabled
                                          ? 'bg-white dark:bg-[#211f1c] border-[#e5e0d5] dark:border-[#33302b]'
                                          : 'bg-transparent border-[#e5e0d5]/60 dark:border-[#33302b]/60 opacity-60'
                                      }`}
                                    >
                                      {featEnabled ? (
                                        <CheckSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                                      ) : (
                                        <Square className="w-3.5 h-3.5 text-[#878278] mt-0.5 shrink-0" />
                                      )}
                                      <div className="flex-1">
                                        <div className="flex items-center gap-1.5">
                                          <span className="font-bold text-xs text-[#1f1e1b] dark:text-[#f5f3ef]">
                                            {feat.name}
                                          </span>
                                          <span
                                            className={`text-[9px] font-mono font-bold px-1 rounded uppercase ${
                                              feat.riskLevel === 'CRITICAL'
                                                ? 'bg-rose-500/10 text-rose-600'
                                                : feat.riskLevel === 'HIGH'
                                                ? 'bg-amber-500/10 text-amber-600'
                                                : 'bg-blue-500/10 text-blue-600'
                                            }`}
                                          >
                                            {feat.riskLevel}
                                          </span>
                                        </div>
                                        <p className="text-[10px] text-[#5c5850] dark:text-[#b8b4aa]">
                                          {feat.description}
                                        </p>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {!isAllowed && (
                        <div className="mt-2 text-[11px] text-[#878278] dark:text-[#7d7970] italic">
                          This role is barred from viewing or executing actions on this section.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: ROLE PROFILE & CLEARANCE LEVEL */}
          {activeStep === 'profile' && (
            <div className="space-y-4 max-w-xl mx-auto py-2">
              <div>
                <label className="block text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef] mb-1">
                  Role Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Governance Officer, Compliance Lead..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-bold rounded-xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:ring-1 focus:ring-[#d97706]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef] mb-1">
                    Badge / Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. COMPLIANCE, SECURITY, OPS"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:ring-1 focus:ring-[#d97706]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef] mb-1">
                    Clearance Tier
                  </label>
                  <select
                    value={clearanceLevel}
                    onChange={(e) => setClearanceLevel(e.target.value as ClearanceLevel)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:ring-1 focus:ring-[#d97706]"
                  >
                    <option value="LEVEL_1_GUEST">Level 1 - Guest (Minimal / Read-Only)</option>
                    <option value="LEVEL_2_OPERATOR">Level 2 - Operator (Daily Operations)</option>
                    <option value="LEVEL_3_ENGINEER">Level 3 - Engineer (Routing &amp; Firewalls)</option>
                    <option value="LEVEL_4_EXECUTIVE">Level 4 - Executive (Billing &amp; Governance)</option>
                    <option value="LEVEL_5_ROOT">Level 5 - Root (Full Platform Authority)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef] mb-1">
                  Accent Color
                </label>
                <div className="flex items-center gap-2">
                  {presetColors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-xl transition-all cursor-pointer ${
                        color === c ? 'ring-2 ring-offset-2 ring-[#d97706] scale-110' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef] mb-1">
                  Description &amp; Operational Scope
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe what responsibilities and authority this role holds within the SaaS Central portal..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:ring-1 focus:ring-[#d97706]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-[#e5e0d5] dark:border-[#33302b] bg-white/80 dark:bg-[#22201d]/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-[#5c5850] dark:text-[#b8b4aa] font-mono">
            Configured:{' '}
            <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
              {allowedPagesCount} pages allowed
            </strong>
            ,{' '}
            <strong className="text-rose-600 dark:text-rose-400 font-bold">
              {deniedPagesCount} prohibited
            </strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#5c5850] dark:text-[#b8b4aa] hover:bg-[#f4f1ea] dark:hover:bg-[#282622] transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2 rounded-xl bg-[#d97706] hover:bg-[#b45309] text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save &amp; Register Role Permissions</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
