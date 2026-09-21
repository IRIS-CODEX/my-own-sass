import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Check,
  X as XIcon,
  Search,
  Eye,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  PortalUser,
  RoleDefinition,
  MASTER_PAGES_REGISTRY,
} from '../../../types/rbac';
import { useRoleManagementStore } from '../../../stores/useRoleManagementStore';

interface UserPermissionsInspectorModalProps {
  user: PortalUser | null;
  isOpen: boolean;
  onClose: () => void;
}

export const UserPermissionsInspectorModal: React.FC<UserPermissionsInspectorModalProps> = ({
  user,
  isOpen,
  onClose,
}) => {
  const { roles } = useRoleManagementStore();
  const [filterQuery, setFilterQuery] = useState('');

  if (!isOpen || !user) return null;

  const assignedRole = roles.find((r) => r.id === user.roleId);

  const filteredPages = MASTER_PAGES_REGISTRY.filter((p) => {
    return (
      p.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(filterQuery.toLowerCase()) ||
      p.route.toLowerCase().includes(filterQuery.toLowerCase())
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div
        className="w-full max-w-4xl my-6 bg-[#faf8f5] dark:bg-[#1c1b18] border border-[#e5e0d5] dark:border-[#33302b] rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#e5e0d5] dark:border-[#33302b] bg-white/70 dark:bg-[#22201d]/70 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center shadow-xs">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                  Effective Permissions Audit: {user.name}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {user.clearance}
                </span>
              </div>
              <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa]">
                Role: <strong>{assignedRole?.name || 'Unassigned'}</strong> ({assignedRole?.badge}) • Email: {user.email}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#5c5850] dark:text-[#b8b4aa] hover:bg-[#f4f1ea] dark:hover:bg-[#282622] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-4 border-b border-[#e5e0d5] dark:border-[#33302b] bg-[#f5f2eb] dark:bg-[#181715] flex items-center justify-between">
          <div className="relative w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#878278]" />
            <input
              type="text"
              placeholder="Filter by page or category..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-[#22201d] border border-[#e5e0d5] dark:border-[#33302b] text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:ring-1 focus:ring-[#d97706]"
            />
          </div>

          <div className="text-xs text-[#5c5850] dark:text-[#b8b4aa]">
            Department: <strong className="text-[#1f1e1b] dark:text-[#f5f3ef]">{user.department}</strong>
          </div>
        </div>

        {/* Permissions Table Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredPages.map((page) => {
            const pagePerm = assignedRole?.pagePermissions[page.id];
            const isGranted = pagePerm?.enabled;

            return (
              <div
                key={page.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isGranted
                    ? 'bg-white dark:bg-[#211f1c] border-[#e5e0d5] dark:border-[#33302b] shadow-2xs'
                    : 'bg-[#faf8f5]/50 dark:bg-[#181715]/40 border-dashed border-[#e5e0d5] dark:border-[#2a2723] opacity-60'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#1f1e1b] dark:text-[#f5f3ef]">
                      {page.name}
                    </span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#f4f1ea] dark:bg-[#282622] text-[#5c5850] dark:text-[#b8b4aa] border border-[#e5e0d5] dark:border-[#33302b]">
                      {page.route}
                    </span>
                    <span className="text-[10px] text-[#878278] dark:text-[#7d7970]">
                      ({page.category})
                    </span>
                  </div>

                  {isGranted ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      <Check className="w-3 h-3 stroke-[3]" />
                      Access Authorized
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                      <XIcon className="w-3 h-3 stroke-[3]" />
                      Access Denied
                    </span>
                  )}
                </div>

                {isGranted && pagePerm && (
                  <div className="space-y-2 mt-2 pt-2 border-t border-[#f0ede6] dark:border-[#2b2824]">
                    {/* Actions summary */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="font-mono uppercase text-[10px] font-bold text-[#878278] dark:text-[#7d7970]">
                        Actions:
                      </span>
                      {[
                        { label: 'View', allowed: pagePerm.actions.canView },
                        { label: 'Create', allowed: pagePerm.actions.canCreate },
                        { label: 'Edit', allowed: pagePerm.actions.canEdit },
                        { label: 'Delete', allowed: pagePerm.actions.canDelete },
                        { label: 'Export', allowed: pagePerm.actions.canExport },
                        { label: 'Override', allowed: pagePerm.actions.canAdminOverride },
                      ].map((a) => (
                        <span
                          key={a.label}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 border ${
                            a.allowed
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                              : 'bg-stone-500/10 text-stone-500 dark:text-stone-400 border-stone-500/20 line-through opacity-50'
                          }`}
                        >
                          {a.label}
                        </span>
                      ))}
                    </div>

                    {/* Sub features count */}
                    <div className="text-[11px] text-[#5c5850] dark:text-[#b8b4aa]">
                      Authorized sub-operations:{' '}
                      <strong>
                        {Object.values(pagePerm.granularFeatures).filter(Boolean).length}
                      </strong>{' '}
                      / {page.features.length} operations
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#e5e0d5] dark:border-[#33302b] bg-white/80 dark:bg-[#22201d]/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#1f1e1b] dark:bg-[#f5f3ef] text-white dark:text-[#1f1e1b] text-xs font-bold shadow-md hover:opacity-95 transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
