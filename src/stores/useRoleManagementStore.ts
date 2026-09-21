import { create } from 'zustand';
import {
  PagePermissionId,
  ActionPermissions,
  RoleDefinition,
  PortalUser,
  DEFAULT_ROLES,
  DEFAULT_PORTAL_USERS,
  createFullPagePermissions,
  MASTER_PAGES_REGISTRY,
} from '../types/rbac';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';

const ROLES_STORAGE_KEY = 'agentlens_rbac_roles_v2';
const USERS_STORAGE_KEY = 'agentlens_rbac_users_v2';

interface RoleManagementState {
  roles: RoleDefinition[];
  portalUsers: PortalUser[];
  selectedRole: RoleDefinition | null;
  selectedUser: PortalUser | null;
  searchQuery: string;
  roleFilterCategory: string;
  userFilterStatus: string;
  isSyncingFirestore: boolean;

  // Selection & Filters
  setSelectedRole: (role: RoleDefinition | null) => void;
  setSelectedUser: (user: PortalUser | null) => void;
  setSearchQuery: (query: string) => void;
  setRoleFilterCategory: (category: string) => void;
  setUserFilterStatus: (status: string) => void;

  // Role CRUD & Granular Actions
  createRole: (roleData: {
    name: string;
    description: string;
    color: string;
    badge: string;
    clearanceLevel: RoleDefinition['clearanceLevel'];
    baseRoleTemplateId?: string;
  }) => RoleDefinition;
  updateRole: (roleId: string, updates: Partial<RoleDefinition>) => void;
  deleteRole: (roleId: string) => { success: boolean; message?: string };
  duplicateRole: (roleId: string, customName?: string) => RoleDefinition;
  resetRolesToDefault: () => void;

  // Granular page & feature permission mutators
  togglePageEnabled: (roleId: string, pageId: PagePermissionId, enabled?: boolean) => void;
  togglePageAction: (roleId: string, pageId: PagePermissionId, actionKey: keyof ActionPermissions) => void;
  toggleGranularFeature: (roleId: string, pageId: PagePermissionId, featureKey: string) => void;
  setAllActionsForPage: (roleId: string, pageId: PagePermissionId, enable: boolean) => void;
  setAllPagesForRole: (roleId: string, enable: boolean) => void;

  // Portal User CRUD
  createPortalUser: (userData: {
    name: string;
    email: string;
    roleId: string;
    department: string;
    clearance: RoleDefinition['clearanceLevel'];
    phone?: string;
    notes?: string;
  }) => PortalUser;
  updatePortalUser: (userId: string, updates: Partial<PortalUser>) => void;
  deletePortalUser: (userId: string) => void;
  toggleUserStatus: (userId: string) => void;
  assignUserRole: (userId: string, roleId: string) => void;
  resetUsersToDefault: () => void;

  // Firestore synchronization
  syncWithFirestore: () => Promise<void>;
  saveRoleToFirestore: (role: RoleDefinition) => Promise<void>;
  saveUserToFirestore: (user: PortalUser) => Promise<void>;
}

// Helper to load persisted state from localStorage
const loadInitialRoles = (): RoleDefinition[] => {
  try {
    const raw = localStorage.getItem(ROLES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load roles from localStorage', e);
  }
  return DEFAULT_ROLES;
};

const loadInitialPortalUsers = (): PortalUser[] => {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load portal users from localStorage', e);
  }
  return DEFAULT_PORTAL_USERS;
};

export const useRoleManagementStore = create<RoleManagementState>((set, get) => ({
  roles: loadInitialRoles(),
  portalUsers: loadInitialPortalUsers(),
  selectedRole: null,
  selectedUser: null,
  searchQuery: '',
  roleFilterCategory: 'ALL',
  userFilterStatus: 'ALL',
  isSyncingFirestore: false,

  setSelectedRole: (role) => set({ selectedRole: role }),
  setSelectedUser: (user) => set({ selectedUser: user }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setRoleFilterCategory: (category) => set({ roleFilterCategory: category }),
  setUserFilterStatus: (status) => set({ userFilterStatus: status }),

  // --------------------------------------------------------------------------
  // Role CRUD Operations
  // --------------------------------------------------------------------------
  createRole: (roleData) => {
    const state = get();
    let basePermissions = createFullPagePermissions(false);

    if (roleData.baseRoleTemplateId) {
      const template = state.roles.find((r) => r.id === roleData.baseRoleTemplateId);
      if (template) {
        basePermissions = JSON.parse(JSON.stringify(template.pagePermissions));
      }
    }

    const newRole: RoleDefinition = {
      id: `role_custom_${Date.now()}`,
      name: roleData.name,
      badge: roleData.badge || 'Custom Role',
      description: roleData.description,
      isSystem: false,
      color: roleData.color || '#3b82f6',
      clearanceLevel: roleData.clearanceLevel,
      pagePermissions: basePermissions,
      assignedUsersCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedRoles = [...state.roles, newRole];
    set({ roles: updatedRoles });
    localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(updatedRoles));
    get().saveRoleToFirestore(newRole).catch(() => {});
    return newRole;
  },

  updateRole: (roleId, updates) => {
    const updatedRoles = get().roles.map((r) => {
      if (r.id === roleId) {
        const updated = {
          ...r,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        get().saveRoleToFirestore(updated).catch(() => {});
        return updated;
      }
      return r;
    });

    set({
      roles: updatedRoles,
      selectedRole: get().selectedRole?.id === roleId
        ? { ...get().selectedRole!, ...updates, updatedAt: new Date().toISOString() }
        : get().selectedRole,
    });
    localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(updatedRoles));
  },

  deleteRole: (roleId) => {
    const target = get().roles.find((r) => r.id === roleId);
    if (!target) return { success: false, message: 'Role not found' };
    if (target.isSystem) {
      return { success: false, message: 'System standard roles cannot be deleted to preserve core governance.' };
    }
    const assignedCount = get().portalUsers.filter((u) => u.roleId === roleId).length;
    if (assignedCount > 0) {
      return { success: false, message: `Cannot delete: Role is currently assigned to ${assignedCount} active users.` };
    }

    const updatedRoles = get().roles.filter((r) => r.id !== roleId);
    set({
      roles: updatedRoles,
      selectedRole: get().selectedRole?.id === roleId ? null : get().selectedRole,
    });
    localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(updatedRoles));

    if (db) {
      try {
        deleteDoc(doc(db, 'portal_roles', roleId)).catch(() => {});
      } catch {
        // Safe catch
      }
    }
    return { success: true };
  },

  duplicateRole: (roleId, customName) => {
    const source = get().roles.find((r) => r.id === roleId) || DEFAULT_ROLES[0];
    const clonedRole: RoleDefinition = {
      id: `role_clone_${Date.now()}`,
      name: customName || `Copy of ${source.name}`,
      badge: 'Cloned Role',
      description: `Cloned from ${source.name}. ${source.description}`,
      isSystem: false,
      color: source.color,
      clearanceLevel: source.clearanceLevel,
      pagePermissions: JSON.parse(JSON.stringify(source.pagePermissions)),
      assignedUsersCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedRoles = [...get().roles, clonedRole];
    set({ roles: updatedRoles, selectedRole: clonedRole });
    localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(updatedRoles));
    get().saveRoleToFirestore(clonedRole).catch(() => {});
    return clonedRole;
  },

  resetRolesToDefault: () => {
    set({ roles: DEFAULT_ROLES, selectedRole: null });
    localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(DEFAULT_ROLES));
  },

  // --------------------------------------------------------------------------
  // Granular Page & Feature Permission Controls
  // --------------------------------------------------------------------------
  togglePageEnabled: (roleId, pageId, enabled) => {
    const role = get().roles.find((r) => r.id === roleId);
    if (!role) return;

    const current = role.pagePermissions[pageId];
    const nextState = enabled !== undefined ? enabled : !current?.enabled;

    const updatedPermissions = {
      ...role.pagePermissions,
      [pageId]: {
        ...current,
        enabled: nextState,
        // If enabling and all actions were false, give view permission by default
        actions: {
          ...current.actions,
          canView: nextState ? (current.actions.canView || true) : false,
        },
      },
    };

    get().updateRole(roleId, { pagePermissions: updatedPermissions });
  },

  togglePageAction: (roleId, pageId, actionKey) => {
    const role = get().roles.find((r) => r.id === roleId);
    if (!role) return;

    const current = role.pagePermissions[pageId];
    if (!current) return;

    const nextActionValue = !current.actions[actionKey];

    const updatedPermissions = {
      ...role.pagePermissions,
      [pageId]: {
        ...current,
        enabled: nextActionValue ? true : current.enabled,
        actions: {
          ...current.actions,
          [actionKey]: nextActionValue,
        },
      },
    };

    get().updateRole(roleId, { pagePermissions: updatedPermissions });
  },

  toggleGranularFeature: (roleId, pageId, featureKey) => {
    const role = get().roles.find((r) => r.id === roleId);
    if (!role) return;

    const current = role.pagePermissions[pageId];
    if (!current) return;

    const nextFeatureValue = !current.granularFeatures[featureKey];

    const updatedPermissions = {
      ...role.pagePermissions,
      [pageId]: {
        ...current,
        enabled: nextFeatureValue ? true : current.enabled,
        granularFeatures: {
          ...current.granularFeatures,
          [featureKey]: nextFeatureValue,
        },
      },
    };

    get().updateRole(roleId, { pagePermissions: updatedPermissions });
  },

  setAllActionsForPage: (roleId, pageId, enable) => {
    const role = get().roles.find((r) => r.id === roleId);
    if (!role) return;

    const current = role.pagePermissions[pageId];
    if (!current) return;

    const granular: Record<string, boolean> = {};
    for (const k in current.granularFeatures) {
      granular[k] = enable;
    }

    const updatedPermissions = {
      ...role.pagePermissions,
      [pageId]: {
        enabled: enable,
        actions: {
          canView: enable,
          canCreate: enable,
          canEdit: enable,
          canDelete: enable,
          canExport: enable,
          canAdminOverride: enable,
        },
        granularFeatures: granular,
      },
    };

    get().updateRole(roleId, { pagePermissions: updatedPermissions });
  },

  setAllPagesForRole: (roleId, enable) => {
    const updatedPermissions = createFullPagePermissions(enable);
    get().updateRole(roleId, { pagePermissions: updatedPermissions });
  },

  // --------------------------------------------------------------------------
  // Portal Users CRUD
  // --------------------------------------------------------------------------
  createPortalUser: (userData) => {
    const newUser: PortalUser = {
      id: `usr_op_${Date.now()}`,
      name: userData.name,
      email: userData.email,
      roleId: userData.roleId,
      department: userData.department || 'Platform Operations',
      clearance: userData.clearance || 'LEVEL_2_OPERATOR',
      status: 'ACTIVE',
      mfaEnabled: true,
      lastLoginAt: 'Never',
      lastLoginIp: 'Pending First Session',
      createdAt: new Date().toISOString(),
      phone: userData.phone,
      notes: userData.notes,
    };

    const updatedUsers = [newUser, ...get().portalUsers];
    
    // Recount assigned users on roles
    const updatedRoles = get().roles.map((r) => {
      if (r.id === userData.roleId) {
        return { ...r, assignedUsersCount: (r.assignedUsersCount || 0) + 1 };
      }
      return r;
    });

    set({ portalUsers: updatedUsers, roles: updatedRoles });
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
    localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(updatedRoles));
    get().saveUserToFirestore(newUser).catch(() => {});
    return newUser;
  },

  updatePortalUser: (userId, updates) => {
    const prevUser = get().portalUsers.find((u) => u.id === userId);
    const updatedUsers = get().portalUsers.map((u) => {
      if (u.id === userId) {
        const next = { ...u, ...updates };
        get().saveUserToFirestore(next).catch(() => {});
        return next;
      }
      return u;
    });

    // If role changed, recalculate counts
    let updatedRoles = get().roles;
    if (prevUser && updates.roleId && updates.roleId !== prevUser.roleId) {
      updatedRoles = updatedRoles.map((r) => {
        if (r.id === prevUser.roleId) {
          return { ...r, assignedUsersCount: Math.max(0, (r.assignedUsersCount || 1) - 1) };
        }
        if (r.id === updates.roleId) {
          return { ...r, assignedUsersCount: (r.assignedUsersCount || 0) + 1 };
        }
        return r;
      });
      localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(updatedRoles));
    }

    set({
      portalUsers: updatedUsers,
      roles: updatedRoles,
      selectedUser: get().selectedUser?.id === userId ? { ...get().selectedUser!, ...updates } : get().selectedUser,
    });
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
  },

  deletePortalUser: (userId) => {
    const target = get().portalUsers.find((u) => u.id === userId);
    if (!target) return;

    const updatedUsers = get().portalUsers.filter((u) => u.id !== userId);
    const updatedRoles = get().roles.map((r) => {
      if (r.id === target.roleId) {
        return { ...r, assignedUsersCount: Math.max(0, (r.assignedUsersCount || 1) - 1) };
      }
      return r;
    });

    set({
      portalUsers: updatedUsers,
      roles: updatedRoles,
      selectedUser: get().selectedUser?.id === userId ? null : get().selectedUser,
    });
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
    localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(updatedRoles));

    if (db) {
      try {
        deleteDoc(doc(db, 'portal_users', userId)).catch(() => {});
      } catch {
        // Safe catch
      }
    }
  },

  toggleUserStatus: (userId) => {
    const target = get().portalUsers.find((u) => u.id === userId);
    if (!target) return;
    const nextStatus = target.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    get().updatePortalUser(userId, { status: nextStatus });
  },

  assignUserRole: (userId, roleId) => {
    get().updatePortalUser(userId, { roleId });
  },

  resetUsersToDefault: () => {
    set({ portalUsers: DEFAULT_PORTAL_USERS, selectedUser: null });
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_PORTAL_USERS));
  },

  // --------------------------------------------------------------------------
  // Firestore Persistence
  // --------------------------------------------------------------------------
  syncWithFirestore: async () => {
    if (!db) return;
    set({ isSyncingFirestore: true });
    try {
      const rolesSnap = await getDocs(collection(db, 'portal_roles'));
      if (!rolesSnap.empty) {
        const firestoreRoles: RoleDefinition[] = [];
        rolesSnap.forEach((docSnap) => {
          firestoreRoles.push(docSnap.data() as RoleDefinition);
        });
        if (firestoreRoles.length > 0) {
          set({ roles: firestoreRoles });
          localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(firestoreRoles));
        }
      }

      const usersSnap = await getDocs(collection(db, 'portal_users'));
      if (!usersSnap.empty) {
        const firestoreUsers: PortalUser[] = [];
        usersSnap.forEach((docSnap) => {
          firestoreUsers.push(docSnap.data() as PortalUser);
        });
        if (firestoreUsers.length > 0) {
          set({ portalUsers: firestoreUsers });
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(firestoreUsers));
        }
      }
    } catch (e) {
      console.warn('Firestore RBAC sync notice: using local cached definitions', e);
    } finally {
      set({ isSyncingFirestore: false });
    }
  },

  saveRoleToFirestore: async (role) => {
    if (!db) return;
    try {
      await setDoc(doc(db, 'portal_roles', role.id), role);
    } catch (err) {
      console.warn('Firestore role save skipped:', err);
    }
  },

  saveUserToFirestore: async (user) => {
    if (!db) return;
    try {
      await setDoc(doc(db, 'portal_users', user.id), user);
    } catch (err) {
      console.warn('Firestore portal user save skipped:', err);
    }
  },
}));
