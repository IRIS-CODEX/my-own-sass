import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  Users,
  Key,
  Layers,
  Sparkles,
  Plus,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Lock,
  Copy,
  Trash2,
  Edit,
  Eye,
  Activity,
  FileCheck,
} from 'lucide-react';
import {
  RoleDefinition,
  PortalUser,
  MASTER_PAGES_REGISTRY,
} from '../../../types/rbac';
import { useRoleManagementStore } from '../../../stores/useRoleManagementStore';
import { useAppStore } from '../../../stores/useAppStore';
import { RoleDetailModal } from './RoleDetailModal';
import { CreateRoleModal } from './CreateRoleModal';
import { PortalUserModal } from './PortalUserModal';
import { UserPermissionsInspectorModal } from './UserPermissionsInspectorModal';
import { RoleMatrixView } from './RoleMatrixView';
import { PortalUsersView } from './PortalUsersView';

export const UserAndRoleManagement: React.FC = () => {
  const {
    roles,
    portalUsers,
    deleteRole,
    duplicateRole,
    resetRolesToDefault,
    syncWithFirestore,
    isSyncingFirestore,
  } = useRoleManagementStore();

  const { addToast } = useAppStore();

  // Tab navigation inside Role Management
  const [activeSubTab, setActiveSubTab] = useState<'roles' | 'users' | 'matrix' | 'governance'>('roles');

  // Modals state
  const [selectedRoleForDetail, setSelectedRoleForDetail] = useState<RoleDefinition | null>(null);
  const [isRoleDetailOpen, setIsRoleDetailOpen] = useState(false);

  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);

  const [selectedUserForModal, setSelectedUserForModal] = useState<PortalUser | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const [inspectUser, setInspectUser] = useState<PortalUser | null>(null);
  const [isInspectModalOpen, setIsInspectModalOpen] = useState(false);

  const totalPagesRegistered = MASTER_PAGES_REGISTRY.length;
  const totalSubFeaturesCount = MASTER_PAGES_REGISTRY.reduce((acc, p) => acc + p.features.length, 0);

  const handleOpenRoleDetail = (role: RoleDefinition) => {
    setSelectedRoleForDetail(role);
    setIsRoleDetailOpen(true);
  };

  const handleRoleCreated = (newRoleId: string) => {
    const created = roles.find((r) => r.id === newRoleId);
    if (created) {
      setSelectedRoleForDetail(created);
      setIsRoleDetailOpen(true);
    }
  };

  const handleDeleteRole = (role: RoleDefinition) => {
    const res = deleteRole(role.id);
    if (res.success) {
      addToast({
        title: 'Role Deleted',
        description: `Successfully removed custom role "${role.name}".`,
        type: 'info',
      });
    } else {
      addToast({
        title: 'Action Denied',
        description: res.message || 'Cannot delete role.',
        type: 'warning',
      });
    }
  };

  const handleSync = async () => {
    await syncWithFirestore();
    addToast({
      title: 'Governance Synced',
      description: 'Synced roles & portal operator permissions with Cloud Firestore.',
      type: 'success',
    });
  };

  return (
    <div className="space-y-6">
      {/* Internal Management Separation Notice Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-xs shadow-xs">
        <div className="w-9 h-9 rounded-xl bg-[#d97706]/20 dark:bg-[#f59e0b]/20 text-[#d97706] dark:text-[#f59e0b] flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-[#1f1e1b] dark:text-[#f5f3ef]">
              SaaS Central Staff &amp; Internal Governance (RBAC)
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-[#92400e] dark:text-[#fbbf24]">
              Internal Deck Operators
            </span>
          </div>
          <p className="text-[11px] text-[#5c5850] dark:text-[#b8b4aa] mt-0.5 leading-relaxed">
            This module is strictly for <span className="font-semibold text-[#b45309] dark:text-[#fbbf24]">SaaS Central internal operators, security officers, and administrators</span>. Roles and permissions configured here apply exclusively to this management backend. External client accounts (who sign in to run AI agents) cannot access this portal and are managed separately under <span className="font-semibold text-blue-600 dark:text-blue-400">Tenant Customers &amp; Users</span>.
          </p>
        </div>
      </div>

      {/* Top Banner & Metric Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 p-6 rounded-3xl bg-white/70 dark:bg-[#211f1c]/70 border border-[#e5e0d5] dark:border-[#33302b] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#d97706] dark:bg-[#f59e0b] text-white dark:text-[#181715] flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1f1e1b] dark:text-[#f5f3ef] tracking-tight">
                SaaS Central Staff &amp; Roles (RBAC)
              </h1>
              <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa]">
                Granular Role-Based Access Control (RBAC), multi-tier clearance, and portal operator administration.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSync}
            disabled={isSyncingFirestore}
            className="px-3 py-2 rounded-xl bg-white dark:bg-[#181715] hover:bg-[#f4f1ea] dark:hover:bg-[#282622] text-[#1f1e1b] dark:text-[#f5f3ef] border border-[#e5e0d5] dark:border-[#33302b] text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Sync with Firestore"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#d97706] ${isSyncingFirestore ? 'animate-spin' : ''}`} />
            <span>{isSyncingFirestore ? 'Syncing...' : 'Sync Firestore'}</span>
          </button>

          <button
            onClick={() => setIsCreateRoleOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#d97706] dark:bg-[#f59e0b] hover:opacity-90 text-white dark:text-[#181715] text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Custom Role</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs">
          <span className="text-xs font-bold text-[#5c5850] dark:text-[#b8b4aa] uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-[#d97706] dark:text-[#f59e0b]" />
            Defined Roles
          </span>
          <div className="mt-2 text-2xl font-bold text-[#1f1e1b] dark:text-[#f5f3ef] flex items-baseline gap-2">
            {roles.length}
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Active Hierarchy
            </span>
          </div>
          <p className="mt-2 text-xs text-[#5c5850] dark:text-[#b8b4aa]">
            {roles.filter((r) => r.isSystem).length} System standard, {roles.filter((r) => !r.isSystem).length} Custom
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs">
          <span className="text-xs font-bold text-[#5c5850] dark:text-[#b8b4aa] uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Portal Operators & Staff
          </span>
          <div className="mt-2 text-2xl font-bold text-[#1f1e1b] dark:text-[#f5f3ef] flex items-baseline gap-2">
            {portalUsers.length}
            <span className="text-xs text-blue-600 dark:text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
              Enrolled
            </span>
          </div>
          <p className="mt-2 text-xs text-[#5c5850] dark:text-[#b8b4aa]">
            {portalUsers.filter((u) => u.mfaEnabled).length} with biometric MFA verified
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs">
          <span className="text-xs font-bold text-[#5c5850] dark:text-[#b8b4aa] uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            Pages & Actions Registered
          </span>
          <div className="mt-2 text-2xl font-bold text-[#1f1e1b] dark:text-[#f5f3ef] flex items-baseline gap-2">
            {totalPagesRegistered}
            <span className="text-xs text-purple-600 dark:text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
              100% Granular
            </span>
          </div>
          <p className="mt-2 text-xs text-[#5c5850] dark:text-[#b8b4aa]">
            {totalSubFeaturesCount} distinct operations & CRUD privileges
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs">
          <span className="text-xs font-bold text-[#5c5850] dark:text-[#b8b4aa] uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Clearance Tiers
          </span>
          <div className="mt-2 text-2xl font-bold text-[#1f1e1b] dark:text-[#f5f3ef] flex items-baseline gap-2">
            5 Levels
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Zero-Trust
            </span>
          </div>
          <p className="mt-2 text-xs text-[#5c5850] dark:text-[#b8b4aa]">
            Guest (L1) to Root Authority (L5)
          </p>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-[#e5e0d5] dark:border-[#33302b] pb-2">
        <button
          onClick={() => setActiveSubTab('roles')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'roles'
              ? 'bg-[#1f1e1b] dark:bg-[#f5f3ef] text-white dark:text-[#1f1e1b] shadow-xs'
              : 'text-[#5c5850] dark:text-[#b8b4aa] hover:bg-[#f4f1ea] dark:hover:bg-[#282622]'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Role Definitions & Granular Policies ({roles.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'users'
              ? 'bg-[#1f1e1b] dark:bg-[#f5f3ef] text-white dark:text-[#1f1e1b] shadow-xs'
              : 'text-[#5c5850] dark:text-[#b8b4aa] hover:bg-[#f4f1ea] dark:hover:bg-[#282622]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Portal Administrators & Operators ({portalUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('matrix')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'matrix'
              ? 'bg-[#1f1e1b] dark:bg-[#f5f3ef] text-white dark:text-[#1f1e1b] shadow-xs'
              : 'text-[#5c5850] dark:text-[#b8b4aa] hover:bg-[#f4f1ea] dark:hover:bg-[#282622]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Role-Permissions Matrix Grid</span>
        </button>
      </div>

      {/* Sub-Tab 1: Role Definitions & Cards */}
      {activeSubTab === 'roles' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#5c5850] dark:text-[#b8b4aa]">
            <span>
              Click any role card to view and configure its page-by-page access privileges and granular operations.
            </span>
            <button
              onClick={() => setIsCreateRoleOpen(true)}
              className="font-bold text-[#d97706] hover:underline cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Role</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => {
              const enabledPagesCount = Object.values(role.pagePermissions).filter((p) => p.enabled).length;

              return (
                <div
                  key={role.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-xs shrink-0"
                          style={{ backgroundColor: role.color }}
                        >
                          <Shield className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-[#1f1e1b] dark:text-[#f5f3ef] leading-tight">
                            {role.name}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-[#f4f1ea] dark:bg-[#282622] text-[#5c5850] dark:text-[#b8b4aa] border border-[#e5e0d5] dark:border-[#33302b]">
                              {role.badge}
                            </span>
                            {role.isSystem ? (
                              <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.2 rounded">
                                System Standard
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-1.5 py-0.2 rounded">
                                Custom
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {role.clearanceLevel.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa] line-clamp-3">
                      {role.description}
                    </p>

                    <div className="p-3 rounded-xl bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#5c5850] dark:text-[#b8b4aa]">Authorized Pages:</span>
                        <span className="font-bold font-mono text-[#1f1e1b] dark:text-[#f5f3ef]">
                          {enabledPagesCount} / {totalPagesRegistered} Pages
                        </span>
                      </div>
                      <div className="w-full bg-[#e5e0d5] dark:bg-[#33302b] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(enabledPagesCount / totalPagesRegistered) * 100}%`,
                            backgroundColor: role.color,
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#878278] dark:text-[#7d7970] pt-0.5">
                        <span>Assigned Operators:</span>
                        <strong className="text-[#1f1e1b] dark:text-[#f5f3ef]">
                          {role.assignedUsersCount || 0} users
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#f0ede6] dark:border-[#2b2824] flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleOpenRoleDetail(role)}
                      className="flex-1 px-3 py-2 rounded-xl bg-[#faf8f5] hover:bg-[#f4f1ea] dark:bg-[#181715] dark:hover:bg-[#282622] text-[#1f1e1b] dark:text-[#f5f3ef] border border-[#e5e0d5] dark:border-[#33302b] text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sliders className="w-3.5 h-3.5 text-[#d97706]" />
                      <span>Configure All Pages</span>
                    </button>

                    <button
                      onClick={() => {
                        const cloned = duplicateRole(role.id);
                        addToast({ title: 'Role Cloned', description: `Created copy "${cloned.name}".`, type: 'info' });
                      }}
                      className="p-2 rounded-xl text-[#5c5850] dark:text-[#b8b4aa] hover:bg-[#f4f1ea] dark:hover:bg-[#282622] transition-all cursor-pointer border border-[#e5e0d5] dark:border-[#33302b]"
                      title="Duplicate Role"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {!role.isSystem && (
                      <button
                        onClick={() => handleDeleteRole(role)}
                        className="p-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer border border-rose-500/20"
                        title="Delete Custom Role"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Portal Administrators & Operators */}
      {activeSubTab === 'users' && (
        <PortalUsersView
          onOpenCreateUser={() => {
            setSelectedUserForModal(null);
            setIsUserModalOpen(true);
          }}
          onOpenEditUser={(u) => {
            setSelectedUserForModal(u);
            setIsUserModalOpen(true);
          }}
          onInspectPermissions={(u) => {
            setInspectUser(u);
            setIsInspectModalOpen(true);
          }}
        />
      )}

      {/* Sub-Tab 3: Matrix Grid */}
      {activeSubTab === 'matrix' && (
        <RoleMatrixView onOpenRoleDetail={handleOpenRoleDetail} />
      )}

      {/* Modal Dialogs */}
      <RoleDetailModal
        role={selectedRoleForDetail}
        isOpen={isRoleDetailOpen}
        onClose={() => {
          setIsRoleDetailOpen(false);
          setSelectedRoleForDetail(null);
        }}
      />

      <CreateRoleModal
        isOpen={isCreateRoleOpen}
        onClose={() => setIsCreateRoleOpen(false)}
        onRoleCreated={handleRoleCreated}
      />

      <PortalUserModal
        user={selectedUserForModal}
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setSelectedUserForModal(null);
        }}
      />

      <UserPermissionsInspectorModal
        user={inspectUser}
        isOpen={isInspectModalOpen}
        onClose={() => {
          setIsInspectModalOpen(false);
          setInspectUser(null);
        }}
      />
    </div>
  );
};
