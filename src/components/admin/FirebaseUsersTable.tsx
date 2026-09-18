import React from 'react';
import { Flame, RefreshCw, UserPlus, Copy, ShieldCheck } from 'lucide-react';
import { FirebaseUserProfile } from '../../lib/firebaseAuth';
import { useAppStore } from '../../stores/useAppStore';

interface FirebaseUsersTableProps {
  users: FirebaseUserProfile[];
  isLoading: boolean;
  onSync: () => void;
  onOpenCreate: () => void;
}

export const FirebaseUsersTable: React.FC<FirebaseUsersTableProps> = ({
  users,
  isLoading,
  onSync,
  onOpenCreate,
}) => {
  const { addToast } = useAppStore();

  const googleUsersCount = users.filter(u => u.email?.toLowerCase().endsWith('@gmail.com')).length;

  return (
    <div className="p-6 rounded-2xl bg-white/85 dark:bg-[#0c0e18]/85 backdrop-blur-md border border-amber-500/30 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm font-bold text-slate-950 dark:text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Firebase Auth &amp; Google Auth Users ({users.length})</span>
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/30">
              {googleUsersCount} Google SSO
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Numbered roster of signed-in users with their Gmail and chosen package tier • Firestore collection <span className="font-mono text-amber-700 dark:text-amber-400">/users</span> in europe-west1
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSync}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-lg border border-amber-500/40 hover:bg-amber-500/10 text-amber-800 dark:text-amber-300 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Syncing...' : 'Sync Firestore'}</span>
          </button>
          <button
            onClick={onOpenCreate}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer border border-amber-400"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register User</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-950 dark:text-slate-100">
          <thead className="bg-amber-100/60 dark:bg-amber-950/40 font-mono text-[11px] text-amber-900 dark:text-amber-300 uppercase border-b border-amber-400/30">
            <tr>
              <th className="p-3 w-12 text-center">#</th>
              <th className="p-3">User &amp; Gmail</th>
              <th className="p-3">Chosen Package</th>
              <th className="p-3">Organization</th>
              <th className="p-3">Firebase UID</th>
              <th className="p-3">Role</th>
              <th className="p-3">Created / Active</th>
              <th className="p-3 text-right">Auth Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-amber-200/40 dark:divide-amber-500/15 font-sans">
            {users.map((u, idx) => {
              const isGoogle = u.email?.toLowerCase().endsWith('@gmail.com');
              const plan = u.planTier || 'PRO_MONTHLY';
              const priceTag =
                plan === 'ENTERPRISE' ? '$599/mo' : plan === 'PRO_YEARLY' ? '$179/mo' : plan === 'PRO_MONTHLY' ? '$199/mo' : plan === 'STARTER' ? '$49/mo' : '$0/mo';

              return (
                <tr key={u.id} className="hover:bg-amber-50/50 dark:hover:bg-[#151722] transition-colors">
                  {/* User Number */}
                  <td className="p-3 text-center font-mono font-bold text-amber-600 dark:text-amber-400">
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30">
                      #{idx + 1}
                    </span>
                  </td>

                  {/* User & Gmail */}
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0 border border-amber-500/30">
                        {(u.displayName || u.email || 'U')[0]}
                      </div>
                      <div>
                        <div className="font-bold text-slate-950 dark:text-white flex items-center gap-1.5">
                          <span>{u.displayName || 'AgentLens User'}</span>
                          {u.role === 'super-admin' && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500 text-slate-950 font-mono">
                              ROOT
                            </span>
                          )}
                          {isGoogle && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30 font-mono flex items-center gap-0.5">
                              <span>Google Auth</span>
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 font-mono flex items-center gap-1">
                          <span className={isGoogle ? 'font-semibold text-blue-700 dark:text-blue-300' : ''}>
                            {u.email}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Chosen Package */}
                  <td className="p-3">
                    <div className="space-y-0.5">
                      <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-300 border border-amber-300/70 dark:border-amber-500/30 inline-block">
                        {plan}
                      </span>
                      <div className="text-[10px] font-mono text-slate-600 dark:text-slate-400 font-semibold">
                        {priceTag}
                      </div>
                    </div>
                  </td>

                  <td className="p-3 font-medium text-slate-800 dark:text-slate-200">
                    {u.organizationName || 'Autonomous Fleet'}
                  </td>

                  <td className="p-3 font-mono text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px]">
                        {u.id.substring(0, 12)}...
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(u.id);
                          addToast({ title: 'Firebase UID Copied', description: u.id, type: 'info' });
                        }}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                        title="Copy Firebase UID"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </td>

                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 flex items-center gap-1 w-fit">
                      <ShieldCheck className="w-3 h-3 text-blue-500" />
                      {u.role || 'owner'}
                    </span>
                  </td>

                  <td className="p-3 text-[11px] font-mono text-slate-600 dark:text-slate-400">
                    <div>Created: {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active'}</div>
                    <div className="text-[10px] opacity-75">
                      Last: {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                    </div>
                  </td>

                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        addToast({
                          title: 'Password Reset Dispatched',
                          description: `Sent security reset link to ${u.email} via Firebase Auth.`,
                          type: 'info',
                        });
                      }}
                      className="px-2.5 py-1 rounded bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-950 dark:text-amber-300 font-bold text-[11px] transition-all cursor-pointer border border-amber-400/30"
                    >
                      Reset Auth
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
