import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Check,
  Sliders,
  Layers,
  Sparkles,
  Info,
  Save,
  Copy,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  RoleDefinition,
  PagePermissionId,
  MASTER_PAGES_REGISTRY,
  ClearanceLevel,
} from '../../../types/rbac';
import { useRoleManagementStore } from '../../../stores/useRoleManagementStore';
import { useAppStore } from '../../../stores/useAppStore';

interface RoleDetailModalProps {
  role: RoleDefinition | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RoleDetailModal: React.FC<RoleDetailModalProps> = ({ role, isOpen, onClose }) => {
  const {
    updateRole,
    duplicateRole,
    togglePageEnabled,
    togglePageAction,
    toggleGranularFeature,
    setAllActionsForPage,
    setAllPagesForRole,
  } = useRoleManagementStore();

  const { addToast } = useAppStore();

  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [expandedPages, setExpandedPages] = useState<Record<string, boolean>>({});
  const [searchFilter, setSearchFilter] = useState('');
  const [roleName, setRoleName] = useState(role?.name || '');
  const [roleDescription, setRoleDescription] = useState(role?.description || '');
  const [clearance, setClearance] = useState<ClearanceLevel>(role?.clearanceLevel || 'LEVEL_2_OPERATOR');
  const [roleBadge, setRoleBadge] = useState(role?.badge || '');
  const [roleColor, setRoleColor] = useState(role?.color || '#3b82f6');

  // Keep local state in sync when selected role changes
  React.useEffect(() => {
    if (role) {
      setRoleName(role.name);
      setRoleDescription(role.description);
      setClearance(role.clearanceLevel);
      setRoleBadge(role.badge);
      setRoleColor(role.color);
    }
  }, [role]);

  if (!isOpen || !role) return null;

  const categories = [
    'ALL',
    'Application Core',
    'Security & Privacy',
    'Compliance & Billing',
    'SaaS Central Main-Admin',
  ];

  const filteredPages = MASTER_PAGES_REGISTRY.filter((p) => {
    const matchesCategory = activeCategory === 'ALL' || p.category === activeCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.route.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.features.some((f) => f.name.toLowerCase().includes(searchFilter.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const togglePageExpand = (pageId: string) => {
    setExpandedPages((prev) => ({ ...prev, [pageId]: !prev[pageId] }));
  };

  const handleSaveHeaderInfo = () => {
    updateRole(role.id, {
      name: roleName,
      description: roleDescription,
      clearanceLevel: clearance,
      badge: roleBadge,
      color: roleColor,
    });
    addToast({
      title: 'Role Updated',
      description: `Saved profile updates for role "${roleName}".`,
      type: 'success',
    });
  };

  const handleCloneRole = () => {
    const cloned = duplicateRole(role.id, `${role.name} (Custom Copy)`);
    addToast({
      title: 'Role Duplicated',
      description: `Created clone "${cloned.name}".`,
      type: 'info',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div
        className="w-full max-w-5xl my-6 bg-[#faf8f5] dark:bg-[#1c1b18] border border-[#e5e0d5] dark:border-[#33302b] rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-[#e5e0d5] dark:border-[#33302b] bg-white/70 dark:bg-[#22201d]/70 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0 text-xl font-bold"
              style={{ backgroundColor: roleColor }}
            >
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                  {role.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  {role.badge}
                </span>
                {role.isSystem ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    System Standard
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                    Custom Custom Role
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {role.clearanceLevel}
                </span>
              </div>
              <p className="mt-1 text-xs text-[#5c5850] dark:text-[#b8b4aa] max-w-2xl">
                {role.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCloneRole}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#282622] hover:bg-[#f4f1ea] dark:hover:bg-[#33302b] text-[#1f1e1b] dark:text-[#f5f3ef] border border-[#e5e0d5] dark:border-[#33302b] text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              title="Duplicate this role"
            >
              <Copy className="w-3.5 h-3.5 text-[#d97706] dark:text-[#f59e0b]" />
              <span>Clone Role</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#5c5850] dark:text-[#b8b4aa] hover:bg-[#f4f1ea] dark:hover:bg-[#282622] transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Subheader & Controls */}
        <div className="p-4 border-b border-[#e5e0d5] dark:border-[#33302b] bg-[#f5f2eb] dark:bg-[#181715] flex flex-wrap items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-[#1f1e1b] dark:bg-[#f5f3ef] text-white dark:text-[#1f1e1b] shadow-xs'
                    : 'bg-white dark:bg-[#22201d] text-[#5c5850] dark:text-[#b8b4aa] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef] border border-[#e5e0d5] dark:border-[#33302b]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Global Quick Action Toggles */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search pages or features..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="px-3 py-1 text-xs rounded-xl bg-white dark:bg-[#22201d] border border-[#e5e0d5] dark:border-[#33302b] text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:ring-1 focus:ring-[#d97706] w-48"
            />
            <button
              onClick={() => {
                setAllPagesForRole(role.id, true);
                addToast({ title: 'Full Access Granted', description: `Enabled all pages and features for ${role.name}.`, type: 'info' });
              }}
              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 transition-all cursor-pointer"
            >
              Grant All
            </button>
            <button
              onClick={() => {
                setAllPagesForRole(role.id, false);
                addToast({ title: 'Access Revoked', description: `Disabled all pages and features for ${role.name}.`, type: 'warning' });
              }}
              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/20 transition-all cursor-pointer"
            >
              Revoke All
            </button>
          </div>
        </div>

        {/* Scrollable Detailed Pages & Granular Permissions List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Metadata editor drawer if custom role or editable */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5c5850] dark:text-[#b8b4aa] font-mono flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#d97706]" />
                Role Identity & Clearance Definition
              </span>
              <button
                onClick={handleSaveHeaderInfo}
                className="px-3 py-1 rounded-lg bg-[#d97706] dark:bg-[#f59e0b] hover:opacity-90 text-white dark:text-[#181715] text-xs font-bold shadow-xs flex items-center gap-1 transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Identity</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#5c5850] dark:text-[#b8b4aa] mb-1">
                  Role Title
                </label>
                <input
                  type="text"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] text-[#1f1e1b] dark:text-[#f5f3ef]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#5c5850] dark:text-[#b8b4aa] mb-1">
                  Badge Tag
                </label>
                <input
                  type="text"
                  value={roleBadge}
                  onChange={(e) => setRoleBadge(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] text-[#1f1e1b] dark:text-[#f5f3ef]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#5c5850] dark:text-[#b8b4aa] mb-1">
                  Clearance Level
                </label>
                <select
                  value={clearance}
                  onChange={(e) => setClearance(e.target.value as ClearanceLevel)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] text-[#1f1e1b] dark:text-[#f5f3ef]"
                >
                  <option value="LEVEL_1_GUEST">Level 1: Guest / Observer</option>
                  <option value="LEVEL_2_OPERATOR">Level 2: Standard Operator</option>
                  <option value="LEVEL_3_ENGINEER">Level 3: Systems Engineer</option>
                  <option value="LEVEL_4_EXECUTIVE">Level 4: Security Executive</option>
                  <option value="LEVEL_5_ROOT">Level 5: Root Authority</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#5c5850] dark:text-[#b8b4aa] mb-1">
                  Theme Accent Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={roleColor}
                    onChange={(e) => setRoleColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-[#e5e0d5] dark:border-[#33302b] p-0.5 bg-transparent"
                  />
                  <span className="text-xs font-mono text-[#5c5850] dark:text-[#b8b4aa] uppercase">
                    {roleColor}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-[#5c5850] dark:text-[#b8b4aa] font-medium flex items-center justify-between">
            <span>
              Showing {filteredPages.length} registered application & admin pages
            </span>
            <span className="text-[11px] text-amber-600 dark:text-amber-400">
              ⚡ Changes to toggles apply immediately to active session
            </span>
          </div>

          {/* Pages Accordion Cards */}
          {filteredPages.map((page) => {
            const pagePerm = role.pagePermissions[page.id] || {
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

            const isExpanded = expandedPages[page.id] !== false; // expanded by default

            return (
              <div
                key={page.id}
                className={`rounded-2xl border transition-all ${
                  pagePerm.enabled
                    ? 'bg-white dark:bg-[#211f1c] border-[#e5e0d5] dark:border-[#33302b] shadow-xs'
                    : 'bg-[#faf8f5]/60 dark:bg-[#181715]/40 border-dashed border-[#e5e0d5] dark:border-[#2a2723] opacity-80'
                }`}
              >
                {/* Page Card Header */}
                <div className="p-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#f0ede6] dark:border-[#2b2824]">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => togglePageEnabled(role.id, page.id)}
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-all cursor-pointer ${
                        pagePerm.enabled
                          ? 'bg-[#d97706] dark:bg-[#f59e0b] text-white dark:text-[#181715] shadow-2xs'
                          : 'border border-[#d1cbbe] dark:border-[#423f38] hover:border-[#d97706]'
                      }`}
                    >
                      {pagePerm.enabled && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#1f1e1b] dark:text-[#f5f3ef]">
                          {page.name}
                        </span>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#f4f1ea] dark:bg-[#282622] text-[#5c5850] dark:text-[#b8b4aa] border border-[#e5e0d5] dark:border-[#33302b]">
                          {page.route}
                        </span>
                        <span className="text-[10px] font-semibold text-[#878278] dark:text-[#7d7970]">
                          • {page.category}
                        </span>
                      </div>
                      <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa] mt-0.5">
                        {page.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {pagePerm.enabled ? (
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                        Page Enabled
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                        Access Blocked
                      </span>
                    )}

                    <button
                      onClick={() => togglePageExpand(page.id)}
                      className="p-1.5 rounded-lg text-[#5c5850] dark:text-[#b8b4aa] hover:bg-[#f4f1ea] dark:hover:bg-[#282622] transition-all cursor-pointer"
                      title={isExpanded ? 'Collapse features' : 'Expand features'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Granular Capabilities & Actions */}
                {isExpanded && (
                  <div className="p-4 bg-[#faf8f5]/40 dark:bg-[#181715]/20 space-y-4">
                    {/* Action Permissions Grid */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#5c5850] dark:text-[#b8b4aa] font-mono">
                          CRUD & Administrative Actions:
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setAllActionsForPage(role.id, page.id, true)}
                            className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                          >
                            Allow All Actions
                          </button>
                          <span className="text-[#878278] dark:text-[#7d7970]">•</span>
                          <button
                            onClick={() => setAllActionsForPage(role.id, page.id, false)}
                            className="text-[10px] font-bold text-[#5c5850] dark:text-[#b8b4aa] hover:underline cursor-pointer"
                          >
                            Disallow All
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                        {(
                          [
                            { key: 'canView', label: 'View (Read)', desc: 'Access page data' },
                            { key: 'canCreate', label: 'Create (Write)', desc: 'Provision new items' },
                            { key: 'canEdit', label: 'Edit (Modify)', desc: 'Adjust parameters' },
                            { key: 'canDelete', label: 'Delete (Purge)', desc: 'Revoke or delete' },
                            { key: 'canExport', label: 'Export (Report)', desc: 'Download CSV / audit' },
                            { key: 'canAdminOverride', label: 'Override', desc: 'Bypass / emergency kill' },
                          ] as const
                        ).map((act) => {
                          const isAllowed = pagePerm.actions[act.key];
                          const isOverride = act.key === 'canAdminOverride';
                          return (
                            <button
                              key={act.key}
                              onClick={() => togglePageAction(role.id, page.id, act.key)}
                              disabled={!pagePerm.enabled}
                              className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                                !pagePerm.enabled
                                  ? 'opacity-40 cursor-not-allowed bg-transparent border-dashed border-[#e5e0d5] dark:border-[#33302b]'
                                  : isAllowed
                                  ? isOverride
                                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                                  : 'bg-white dark:bg-[#22201d] border-[#e5e0d5] dark:border-[#33302b] text-[#5c5850] dark:text-[#b8b4aa] hover:border-[#b8b4aa]'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[11px] tracking-tight">
                                  {act.label}
                                </span>
                                <div
                                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${
                                    isAllowed
                                      ? isOverride
                                        ? 'bg-amber-500 text-white'
                                        : 'bg-emerald-500 text-white'
                                      : 'border border-[#b8b4aa]'
                                  }`}
                                >
                                  {isAllowed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                </div>
                              </div>
                              <p className="text-[10px] text-[#5c5850] dark:text-[#b8b4aa] mt-0.5 leading-tight">
                                {act.desc}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Granular Individual Page Features */}
                    {page.features.length > 0 && (
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#5c5850] dark:text-[#b8b4aa] font-mono block mb-2">
                          Granular Sub-Features & Operations:
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {page.features.map((feat) => {
                            const isFeatActive = !!pagePerm.granularFeatures[feat.key];
                            const isCritical = feat.riskLevel === 'CRITICAL';
                            const isHigh = feat.riskLevel === 'HIGH';

                            return (
                              <div
                                key={feat.key}
                                className={`p-2.5 rounded-xl border flex items-start justify-between gap-3 transition-all ${
                                  !pagePerm.enabled
                                    ? 'opacity-40 bg-transparent border-dashed border-[#e5e0d5] dark:border-[#33302b]'
                                    : isFeatActive
                                    ? 'bg-white dark:bg-[#22201d] border-[#e5e0d5] dark:border-[#33302b] shadow-2xs'
                                    : 'bg-white/40 dark:bg-[#1c1b18]/40 border-dashed border-[#e5e0d5] dark:border-[#2f2c27]'
                                }`}
                              >
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                                      {feat.name}
                                    </span>
                                    <span
                                      className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded border ${
                                        isCritical
                                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                                          : isHigh
                                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                          : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                                      }`}
                                    >
                                      {feat.riskLevel}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-[#5c5850] dark:text-[#b8b4aa]">
                                    {feat.description}
                                  </p>
                                </div>

                                <button
                                  disabled={!pagePerm.enabled}
                                  onClick={() => toggleGranularFeature(role.id, page.id, feat.key)}
                                  className={`w-8 h-4.5 rounded-full transition-colors relative shrink-0 mt-0.5 cursor-pointer ${
                                    !pagePerm.enabled
                                      ? 'bg-stone-300 dark:bg-stone-700 cursor-not-allowed'
                                      : isFeatActive
                                      ? 'bg-[#d97706] dark:bg-[#f59e0b]'
                                      : 'bg-stone-300 dark:bg-stone-700'
                                  }`}
                                >
                                  <div
                                    className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                                      isFeatActive ? 'translate-x-4' : 'translate-x-0.5'
                                    }`}
                                  />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#e5e0d5] dark:border-[#33302b] bg-white/80 dark:bg-[#22201d]/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#5c5850] dark:text-[#b8b4aa]">
            <Info className="w-4 h-4 text-blue-500" />
            <span>
              Assigned to <strong>{role.assignedUsersCount || 0}</strong> operators and portal users.
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#1f1e1b] dark:bg-[#f5f3ef] text-white dark:text-[#1f1e1b] text-xs font-bold shadow-md hover:opacity-95 transition-all cursor-pointer"
          >
            Close & Apply Matrix
          </button>
        </div>
      </div>
    </div>
  );
};
