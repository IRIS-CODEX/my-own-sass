import React, { useState } from 'react';
import {
  Check,
  X as XIcon,
  Shield,
  Layers,
  Search,
  Filter,
  Eye,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { MASTER_PAGES_REGISTRY, RoleDefinition } from '../../../types/rbac';
import { useRoleManagementStore } from '../../../stores/useRoleManagementStore';

interface RoleMatrixViewProps {
  onOpenRoleDetail: (role: RoleDefinition) => void;
}

export const RoleMatrixView: React.FC<RoleMatrixViewProps> = ({ onOpenRoleDetail }) => {
  const { roles, togglePageEnabled } = useRoleManagementStore();
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = ['ALL', 'Application Core', 'Security & Privacy', 'Compliance & Billing', 'SaaS Central Main-Admin'];

  const filteredPages = MASTER_PAGES_REGISTRY.filter((p) => {
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesQuery =
      p.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      p.route.toLowerCase().includes(filterQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-4">
      {/* Search & Category Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs">
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#878278]" />
            <input
              type="text"
              placeholder="Search matrix pages..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:ring-1 focus:ring-[#d97706]"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
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

        <div className="text-xs text-[#5c5850] dark:text-[#b8b4aa] font-medium">
          Showing <strong>{filteredPages.length}</strong> pages across <strong>{roles.length}</strong> defined roles
        </div>
      </div>

      {/* Cross-Reference Matrix Table */}
      <div className="rounded-2xl border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715]">
              <th className="p-3.5 font-bold text-[#1f1e1b] dark:text-[#f5f3ef] min-w-[240px] sticky left-0 bg-[#faf8f5] dark:bg-[#181715] z-10">
                Application & Admin Page
              </th>
              <th className="p-3.5 font-bold text-[#5c5850] dark:text-[#b8b4aa] w-28">
                Route
              </th>
              {roles.map((r) => (
                <th
                  key={r.id}
                  className="p-3.5 text-center min-w-[130px] border-l border-[#f0ede6] dark:border-[#2b2824]"
                >
                  <button
                    onClick={() => onOpenRoleDetail(r)}
                    className="w-full text-center group cursor-pointer hover:opacity-80 transition-opacity"
                    title="Click to configure role"
                  >
                    <div className="font-bold text-xs text-[#1f1e1b] dark:text-[#f5f3ef] truncate">
                      {r.name}
                    </div>
                    <div className="flex items-center justify-center gap-1 mt-0.5">
                      <span
                        className="w-2 h-2 rounded-full inline-block"
                        style={{ backgroundColor: r.color }}
                      />
                      <span className="text-[10px] font-mono font-bold uppercase text-[#878278] dark:text-[#7d7970]">
                        {r.badge}
                      </span>
                    </div>
                  </button>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#f0ede6] dark:divide-[#2b2824]">
            {filteredPages.map((page) => (
              <tr
                key={page.id}
                className="hover:bg-[#faf8f5]/60 dark:hover:bg-[#1c1b18]/60 transition-colors"
              >
                <td className="p-3.5 sticky left-0 bg-white dark:bg-[#211f1c] z-10 border-r border-[#f0ede6] dark:border-[#2b2824]">
                  <div>
                    <div className="font-bold text-xs text-[#1f1e1b] dark:text-[#f5f3ef]">
                      {page.name}
                    </div>
                    <div className="text-[10px] text-[#878278] dark:text-[#7d7970]">
                      {page.category} • {page.features.length} sub-operations
                    </div>
                  </div>
                </td>

                <td className="p-3.5 font-mono text-[10px] text-[#5c5850] dark:text-[#b8b4aa] whitespace-nowrap">
                  {page.route}
                </td>

                {roles.map((r) => {
                  const perm = r.pagePermissions[page.id];
                  const isEnabled = perm?.enabled;
                  const canOverride = perm?.actions.canAdminOverride;

                  return (
                    <td
                      key={r.id}
                      className="p-3 text-center border-l border-[#f0ede6] dark:border-[#2b2824]"
                    >
                      <button
                        onClick={() => togglePageEnabled(r.id, page.id)}
                        className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all cursor-pointer ${
                          isEnabled
                            ? canOverride
                              ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 shadow-2xs hover:scale-105'
                              : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-2xs hover:scale-105'
                            : 'bg-stone-500/10 text-stone-400 dark:text-stone-600 border border-stone-500/20 hover:border-stone-400'
                        }`}
                        title={
                          isEnabled
                            ? `Authorized for ${r.name}. Click to revoke.`
                            : `Access blocked for ${r.name}. Click to grant.`
                        }
                      >
                        {isEnabled ? (
                          <Check className="w-4 h-4 stroke-[2.5]" />
                        ) : (
                          <XIcon className="w-3.5 h-3.5 stroke-[2]" />
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
