import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Shield,
  ShieldCheck,
  Eye,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Copy,
  Activity,
  UserCheck,
} from 'lucide-react';
import { PortalUser, UserStatus } from '../../../types/rbac';
import { useRoleManagementStore } from '../../../stores/useRoleManagementStore';
import { useAppStore } from '../../../stores/useAppStore';

interface PortalUsersViewProps {
  onOpenCreateUser: () => void;
  onOpenEditUser: (user: PortalUser) => void;
  onInspectPermissions: (user: PortalUser) => void;
}

export const PortalUsersView: React.FC<PortalUsersViewProps> = ({
  onOpenCreateUser,
  onOpenEditUser,
  onInspectPermissions,
}) => {
  const {
    portalUsers,
    roles,
    deletePortalUser,
    toggleUserStatus,
    assignUserRole,
  } = useRoleManagementStore();

  const { addToast } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const filteredUsers = portalUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    const matchesRole = roleFilter === 'ALL' || u.roleId === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 1500);
    addToast({ title: 'Email Copied', description: email, type: 'info' });
  };

  const handleDelete = (user: PortalUser) => {
    if (user.email === 'hamudijems4@gmail.com') {
      addToast({
        title: 'Protected Operator',
        description: 'Primary Root Administrator cannot be removed.',
        type: 'warning',
      });
      return;
    }
    if (window.confirm(`Are you sure you want to remove administrator ${user.name}?`)) {
      deletePortalUser(user.id);
      addToast({
        title: 'Operator Removed',
        description: `Successfully removed ${user.name} from portal registry.`,
        type: 'info',
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter and Controls Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#878278]" />
            <input
              type="text"
              placeholder="Search by name, email, dept..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:ring-1 focus:ring-[#d97706]"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:ring-1 focus:ring-[#d97706]"
          >
            <option value="ALL">All Account Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="SUSPENDED">Suspended Only</option>
            <option value="MFA_REQUIRED">MFA Required</option>
          </select>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:ring-1 focus:ring-[#d97706]"
          >
            <option value="ALL">All Roles</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        {/* Create Operator Button */}
        <button
          onClick={onOpenCreateUser}
          className="px-4 py-2 rounded-xl bg-[#d97706] dark:bg-[#f59e0b] hover:opacity-90 text-white dark:text-[#181715] text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Administrator</span>
        </button>
      </div>

      {/* Users Roster Table */}
      <div className="rounded-2xl border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715]">
                <th className="p-3.5 font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                  Portal Administrator
                </th>
                <th className="p-3.5 font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                  Assigned Role & Clearance
                </th>
                <th className="p-3.5 font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                  Department
                </th>
                <th className="p-3.5 font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                  MFA & Auth Security
                </th>
                <th className="p-3.5 font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                  Status
                </th>
                <th className="p-3.5 font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                  Last Active
                </th>
                <th className="p-3.5 font-bold text-[#1f1e1b] dark:text-[#f5f3ef] text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#f0ede6] dark:divide-[#2b2824]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#5c5850] dark:text-[#b8b4aa]">
                    No portal operators match the search criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const assignedRole = roles.find((r) => r.id === user.roleId);
                  const isPrimaryRoot = user.email === 'hamudijems4@gmail.com';

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-[#faf8f5]/60 dark:hover:bg-[#1c1b18]/60 transition-colors"
                    >
                      {/* Name & Avatar */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-2xs shrink-0"
                            style={{ backgroundColor: assignedRole?.color || '#3b82f6' }}
                          >
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-[#1f1e1b] dark:text-[#f5f3ef]">
                                {user.name}
                              </span>
                              {isPrimaryRoot && (
                                <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                  Primary Root
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-[11px] text-[#5c5850] dark:text-[#b8b4aa]">
                                {user.email}
                              </span>
                              <button
                                onClick={() => handleCopyEmail(user.email)}
                                className="text-[#878278] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef] cursor-pointer"
                                title="Copy Email"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Assigned Role & Clearance */}
                      <td className="p-3.5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-[#1f1e1b] dark:text-[#f5f3ef]">
                              {assignedRole?.name || 'Unassigned'}
                            </span>
                            {assignedRole && (
                              <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-[#f4f1ea] dark:bg-[#282622] text-[#5c5850] dark:text-[#b8b4aa] border border-[#e5e0d5] dark:border-[#33302b]">
                                {assignedRole.badge}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400">
                              {user.clearance}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="p-3.5 text-xs text-[#5c5850] dark:text-[#b8b4aa]">
                        {user.department}
                      </td>

                      {/* MFA & Security */}
                      <td className="p-3.5">
                        <div className="space-y-0.5">
                          {user.mfaEnabled ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              <ShieldCheck className="w-3 h-3" />
                              MFA Enforced
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                              <AlertTriangle className="w-3 h-3" />
                              Password Only
                            </span>
                          )}
                          <div className="text-[10px] font-mono text-[#878278] dark:text-[#7d7970] truncate max-w-[140px]">
                            {user.lastLoginIp}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        {user.status === 'ACTIVE' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            Active
                          </span>
                        ) : user.status === 'SUSPENDED' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                            Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                            {user.status}
                          </span>
                        )}
                      </td>

                      {/* Last Active */}
                      <td className="p-3.5 text-xs text-[#5c5850] dark:text-[#b8b4aa] whitespace-nowrap">
                        {user.lastLoginAt}
                      </td>

                      {/* Action Buttons */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Live Permission Inspector */}
                          <button
                            onClick={() => onInspectPermissions(user)}
                            className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-400 font-bold text-[11px] transition-all cursor-pointer border border-blue-500/20 flex items-center gap-1 shadow-2xs"
                            title="Inspect live authorized page permissions"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-500" />
                            <span>Inspect</span>
                          </button>

                          {/* Edit Operator */}
                          <button
                            onClick={() => onOpenEditUser(user)}
                            className="px-2.5 py-1 rounded-lg bg-[#faf8f5] hover:bg-[#f4f1ea] dark:bg-[#181715] dark:hover:bg-[#282622] text-[#1f1e1b] dark:text-[#f5f3ef] font-bold text-[11px] transition-all cursor-pointer border border-[#e5e0d5] dark:border-[#33302b] shadow-2xs flex items-center gap-1"
                            title="Edit Operator Role & Clearance"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-[#d97706]" />
                            <span>Edit</span>
                          </button>

                          {/* Suspend / Reactivate */}
                          {!isPrimaryRoot && (
                            <button
                              onClick={() => toggleUserStatus(user.id)}
                              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                user.status === 'ACTIVE'
                                  ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 border-amber-500/20'
                                  : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 border-emerald-500/20'
                              }`}
                              title={user.status === 'ACTIVE' ? 'Suspend Operator Access' : 'Reactivate Operator'}
                            >
                              {user.status === 'ACTIVE' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                            </button>
                          )}

                          {/* Delete */}
                          {!isPrimaryRoot && (
                            <button
                              onClick={() => handleDelete(user)}
                              className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-all cursor-pointer"
                              title="Delete Operator Account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
