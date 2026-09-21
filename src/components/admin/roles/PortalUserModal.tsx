import React, { useState, useEffect } from 'react';
import {
  X,
  UserCheck,
  UserPlus,
  Mail,
  Shield,
  Building,
  Phone,
  FileText,
  Lock,
  Key,
  CheckCircle2,
} from 'lucide-react';
import { PortalUser, ClearanceLevel, UserStatus } from '../../../types/rbac';
import { useRoleManagementStore } from '../../../stores/useRoleManagementStore';
import { useAppStore } from '../../../stores/useAppStore';
import { sendPasswordReset } from '../../../lib/firebaseAuth';

interface PortalUserModalProps {
  user: PortalUser | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PortalUserModal: React.FC<PortalUserModalProps> = ({
  user,
  isOpen,
  onClose,
}) => {
  const { roles, createPortalUser, updatePortalUser } = useRoleManagementStore();
  const { addToast } = useAppStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [roleId, setRoleId] = useState('');
  const [clearance, setClearance] = useState<ClearanceLevel>('LEVEL_2_OPERATOR');
  const [status, setStatus] = useState<UserStatus>('ACTIVE');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);

  const isEditing = !!user;

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setDepartment(user.department);
      setRoleId(user.roleId);
      setClearance(user.clearance);
      setStatus(user.status);
      setPhone(user.phone || '');
      setNotes(user.notes || '');
    } else {
      setName('');
      setEmail('');
      setDepartment('Platform Operations');
      setRoleId(roles[0]?.id || 'role_developer');
      setClearance('LEVEL_2_OPERATOR');
      setStatus('ACTIVE');
      setPhone('');
      setNotes('');
    }
  }, [user, roles]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      addToast({ title: 'Missing required fields', description: 'Please enter Name and Email.', type: 'warning' });
      return;
    }

    if (isEditing) {
      updatePortalUser(user.id, {
        name: name.trim(),
        email: email.trim(),
        department: department.trim(),
        roleId,
        clearance,
        status,
        phone: phone.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      addToast({
        title: 'Operator Profile Updated',
        description: `Successfully updated permissions for ${name}.`,
        type: 'success',
      });
    } else {
      createPortalUser({
        name: name.trim(),
        email: email.trim(),
        department: department.trim() || 'Platform Operations',
        roleId: roleId || roles[0]?.id || 'role_developer',
        clearance,
        phone: phone.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      addToast({
        title: 'New Portal Operator Created',
        description: `Registered operator account for ${name}.`,
        type: 'success',
      });
    }

    onClose();
  };

  const handleSendResetLink = async () => {
    if (!email.trim()) return;
    setIsSendingReset(true);
    try {
      const res = await sendPasswordReset(email.trim());
      if (res.success) {
        addToast({
          title: 'Password Reset Dispatched',
          description: `Security credential setup link emailed to ${email}.`,
          type: 'success',
        });
      } else {
        addToast({
          title: 'Dispatch Notice',
          description: res.error || 'Check Firebase Auth configuration.',
          type: 'info',
        });
      }
    } finally {
      setIsSendingReset(false);
    }
  };

  const selectedRoleObj = roles.find((r) => r.id === roleId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div
        className="w-full max-w-xl bg-[#faf8f5] dark:bg-[#1c1b18] border border-[#e5e0d5] dark:border-[#33302b] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#e5e0d5] dark:border-[#33302b] bg-white/70 dark:bg-[#22201d]/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d97706] dark:bg-[#f59e0b] text-white dark:text-[#181715] flex items-center justify-center shadow-xs">
              {isEditing ? <UserCheck className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                {isEditing ? 'Configure Portal Operator' : 'Register Portal Administrator'}
              </h3>
              <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa]">
                Manage role clearance, access credentials, and security clearance for SaaS Central.
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef] mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Jane Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-[#22201d] border border-[#e5e0d5] dark:border-[#33302b] text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:ring-2 focus:ring-[#d97706]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef] mb-1">
                Official Email *
              </label>
              <input
                type="email"
                required
                placeholder="jane.smith@agentlens.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-[#22201d] border border-[#e5e0d5] dark:border-[#33302b] text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:ring-2 focus:ring-[#d97706]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef] mb-1">
                Department / Functional Group
              </label>
              <input
                type="text"
                placeholder="e.g. Cybersecurity Operations"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-[#22201d] border border-[#e5e0d5] dark:border-[#33302b] text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:ring-2 focus:ring-[#d97706]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef] mb-1">
                Emergency Contact Phone
              </label>
              <input
                type="tel"
                placeholder="+1 (555) 012-3456"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-[#22201d] border border-[#e5e0d5] dark:border-[#33302b] text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:ring-2 focus:ring-[#d97706]"
              />
            </div>
          </div>

          {/* Role and Clearance Assignment */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5c5850] dark:text-[#b8b4aa] font-mono flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#d97706]" />
              Role-Based Authorization & Clearance
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef] mb-1">
                  Assigned Role *
                </label>
                <select
                  value={roleId}
                  onChange={(e) => {
                    const newRoleId = e.target.value;
                    setRoleId(newRoleId);
                    const matched = roles.find((r) => r.id === newRoleId);
                    if (matched) {
                      setClearance(matched.clearanceLevel);
                    }
                  }}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:ring-2 focus:ring-[#d97706]"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.badge})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef] mb-1">
                  Clearance Level
                </label>
                <select
                  value={clearance}
                  onChange={(e) => setClearance(e.target.value as ClearanceLevel)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:ring-2 focus:ring-[#d97706]"
                >
                  <option value="LEVEL_1_GUEST">Level 1 - Guest / Observer</option>
                  <option value="LEVEL_2_OPERATOR">Level 2 - Standard Operator</option>
                  <option value="LEVEL_3_ENGINEER">Level 3 - Systems Engineer</option>
                  <option value="LEVEL_4_EXECUTIVE">Level 4 - Security Executive</option>
                  <option value="LEVEL_5_ROOT">Level 5 - Root Authority</option>
                </select>
              </div>
            </div>

            {selectedRoleObj && (
              <div className="p-3 rounded-xl bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-[#1f1e1b] dark:text-[#f5f3ef]">
                      {selectedRoleObj.name}
                    </span>
                    <span className="text-[10px] px-2 py-0.2 rounded-full font-mono uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold">
                      {selectedRoleObj.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5c5850] dark:text-[#b8b4aa] mt-0.5">
                    {selectedRoleObj.description}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef] mb-1">
                Account Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as UserStatus)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-[#22201d] border border-[#e5e0d5] dark:border-[#33302b] text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:ring-2 focus:ring-[#d97706]"
              >
                <option value="ACTIVE">Active (Normal Access)</option>
                <option value="SUSPENDED">Suspended (Access Revoked)</option>
                <option value="INVITED">Invited (Pending Confirmation)</option>
                <option value="MFA_REQUIRED">MFA Enrollment Required</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef] mb-1">
                Credential Dispatch
              </label>
              <button
                type="button"
                onClick={handleSendResetLink}
                disabled={isSendingReset || !email}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#faf8f5] dark:bg-[#22201d] hover:bg-[#f4f1ea] dark:hover:bg-[#2a2824] border border-[#e5e0d5] dark:border-[#33302b] text-[#1f1e1b] dark:text-[#f5f3ef] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <Mail className="w-3.5 h-3.5 text-[#d97706]" />
                <span>{isSendingReset ? 'Sending Email...' : 'Send Setup / Reset Link'}</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef] mb-1">
              Internal Governance Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Approved by Head of Ops for on-call proxy cluster maintenance..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-[#22201d] border border-[#e5e0d5] dark:border-[#33302b] text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:ring-2 focus:ring-[#d97706]"
            />
          </div>

          <div className="pt-3 border-t border-[#e5e0d5] dark:border-[#33302b] flex items-center justify-between">
            {user ? (
              <span className="text-[11px] font-mono text-[#878278] dark:text-[#7d7970]">
                ID: {user.id} • Created {new Date(user.createdAt).toLocaleDateString()}
              </span>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#5c5850] dark:text-[#b8b4aa] hover:bg-[#f4f1ea] dark:hover:bg-[#282622] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#d97706] dark:bg-[#f59e0b] hover:opacity-90 text-white dark:text-[#181715] text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <UserCheck className="w-4 h-4" />
                <span>{isEditing ? 'Save Changes' : 'Register Operator'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
