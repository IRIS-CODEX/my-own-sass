import React, { useState } from 'react';
import { X, ShieldPlus, Sparkles, Check, Layers } from 'lucide-react';
import { ClearanceLevel } from '../../../types/rbac';
import { useRoleManagementStore } from '../../../stores/useRoleManagementStore';
import { useAppStore } from '../../../stores/useAppStore';

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoleCreated: (roleId: string) => void;
}

export const CreateRoleModal: React.FC<CreateRoleModalProps> = ({
  isOpen,
  onClose,
  onRoleCreated,
}) => {
  const { roles, createRole } = useRoleManagementStore();
  const { addToast } = useAppStore();

  const [name, setName] = useState('');
  const [badge, setBadge] = useState('');
  const [description, setDescription] = useState('');
  const [clearanceLevel, setClearanceLevel] = useState<ClearanceLevel>('LEVEL_2_OPERATOR');
  const [color, setColor] = useState('#3b82f6');
  const [templateId, setTemplateId] = useState<string>(roles[0]?.id || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast({ title: 'Role Name Required', description: 'Please enter a name for the custom role.', type: 'warning' });
      return;
    }

    const created = createRole({
      name: name.trim(),
      badge: badge.trim() || 'Custom',
      description: description.trim() || 'Custom platform role with tailored page and operational clearance.',
      clearanceLevel,
      color,
      baseRoleTemplateId: templateId || undefined,
    });

    addToast({
      title: 'Custom Role Registered',
      description: `Created custom role "${created.name}" based on template.`,
      type: 'success',
    });

    onRoleCreated(created.id);
    onClose();
  };

  const presetColors = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div
        className="w-full max-w-lg bg-[#faf8f5] dark:bg-[#1c1b18] border border-[#e5e0d5] dark:border-[#33302b] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#e5e0d5] dark:border-[#33302b] bg-white/70 dark:bg-[#22201d]/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs"
              style={{ backgroundColor: color }}
            >
              <ShieldPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                Create New Custom Role
              </h3>
              <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa]">
                Register custom role with granular page-by-page access rights.
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
          <div>
            <label className="block text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef] mb-1">
              Role Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Lead Prompt Auditor, Tier 2 Security Analyst"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-[#22201d] border border-[#e5e0d5] dark:border-[#33302b] text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:ring-2 focus:ring-[#d97706]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef] mb-1">
                Badge Tag
              </label>
              <input
                type="text"
                placeholder="e.g. SOC Tier 2"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-[#22201d] border border-[#e5e0d5] dark:border-[#33302b] text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:ring-2 focus:ring-[#d97706]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef] mb-1">
                Clearance Tier
              </label>
              <select
                value={clearanceLevel}
                onChange={(e) => setClearanceLevel(e.target.value as ClearanceLevel)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-[#22201d] border border-[#e5e0d5] dark:border-[#33302b] text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:ring-2 focus:ring-[#d97706]"
              >
                <option value="LEVEL_1_GUEST">Level 1 - Guest / Observer</option>
                <option value="LEVEL_2_OPERATOR">Level 2 - Standard Operator</option>
                <option value="LEVEL_3_ENGINEER">Level 3 - Systems Engineer</option>
                <option value="LEVEL_4_EXECUTIVE">Level 4 - Security Executive</option>
                <option value="LEVEL_5_ROOT">Level 5 - Root Authority</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef] mb-1">
              Description & Purpose
            </label>
            <textarea
              rows={2}
              placeholder="Describe what responsibilities and systems this role governs..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-[#22201d] border border-[#e5e0d5] dark:border-[#33302b] text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:ring-2 focus:ring-[#d97706]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef] mb-1">
              Inherit Permissions from Existing Role (Template)
            </label>
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-[#22201d] border border-[#e5e0d5] dark:border-[#33302b] text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:ring-2 focus:ring-[#d97706]"
            >
              <option value="">Start from Scratch (All Pages Denied by Default)</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  Copy from: {r.name} ({r.badge})
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-[#5c5850] dark:text-[#b8b4aa]">
              You can fine-tune every individual page toggle right after creating.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef] mb-1.5">
              Accent Color
            </label>
            <div className="flex items-center gap-2">
              {presetColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                    color === c ? 'scale-125 ring-2 ring-offset-2 ring-[#d97706]' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-6 h-6 rounded-md cursor-pointer border border-[#e5e0d5] dark:border-[#33302b] p-0 bg-transparent ml-2"
                title="Custom color picker"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#e5e0d5] dark:border-[#33302b] flex items-center justify-end gap-2">
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
              <ShieldPlus className="w-4 h-4" />
              <span>Create Role & Open Matrix</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
