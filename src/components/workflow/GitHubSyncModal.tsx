import React, { useState } from 'react';
import {
  Github,
  X,
  GitBranch,
  GitCommit,
  CheckCircle2,
  Download,
  ExternalLink,
  ShieldCheck,
  KeyRound,
  FileCode,
  FileJson,
  Folder,
  RefreshCw,
  Clock,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { useGitHubStore } from '../../stores/useGitHubStore';
import { useWorkflowStore } from '../../stores/useWorkflowStore';
import { useAgentsStore } from '../../stores/useAgentsStore';

export const GitHubSyncModal: React.FC = () => {
  const {
    isGitHubModalOpen,
    setGitHubModalOpen,
    isConnected,
    personalAccessToken,
    owner,
    repo,
    branch,
    syncDirectory,
    configureGitHub,
    disconnectGitHub,
    pushToGitHub,
    downloadBundleZip,
    generateCodeBundle,
    commitHistory,
    isPushing,
    lastPushStatus,
  } = useGitHubStore();

  const { nodes, edges, selectedAgentId } = useWorkflowStore();
  const { agents } = useAgentsStore();

  const activeAgent = agents.find((a) => a.id === selectedAgentId) || {
    name: 'Archon AI Agent',
  };

  const [inputOwner, setInputOwner] = useState(owner);
  const [inputRepo, setInputRepo] = useState(repo);
  const [inputBranch, setInputBranch] = useState(branch);
  const [inputToken, setInputToken] = useState(personalAccessToken);
  const [commitMessage, setCommitMessage] = useState(
    `feat(agent): update ${activeAgent.name} workflow topology with ${nodes.length} nodes`
  );
  const [activeTab, setActiveTab] = useState<'sync' | 'files' | 'history' | 'settings'>('sync');

  if (!isGitHubModalOpen) return null;

  const currentBundle = generateCodeBundle(activeAgent.name, nodes, edges);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    configureGitHub({
      owner: inputOwner.trim(),
      repo: inputRepo.trim(),
      branch: inputBranch.trim(),
      token: inputToken.trim(),
    });
    setActiveTab('sync');
  };

  const handlePush = async () => {
    await pushToGitHub(commitMessage, activeAgent.name, nodes, edges);
  };

  const handleDownload = () => {
    downloadBundleZip({
      ...currentBundle,
      dockerfile: `FROM node:20-alpine\nWORKDIR /app\nCOPY package.json tsconfig.json ./\nRUN npm install\nCOPY . .\nEXPOSE 3000\nCMD ["npm", "start"]\n`,
      packageJson: JSON.stringify(
        {
          name: activeAgent.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          version: '1.0.0',
          type: 'module',
          scripts: { start: 'tsx index.ts' },
          dependencies: { '@google/genai': '^2.4.0', dotenv: '^17.2.3', tsx: '^4.21.0' },
        },
        null,
        2
      ),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white dark:bg-[#1c1b18] border border-[#e5e0d5] dark:border-[#33302b] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#e5e0d5] dark:border-[#33302b] flex items-center justify-between bg-[#faf8f5] dark:bg-[#181715]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#24292e] text-white flex items-center justify-center shadow-md">
              <Github className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                  GitHub Agent Repository Sync
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Ready
                </span>
              </div>
              <p className="text-xs text-[#878278] dark:text-[#7d7970] mt-0.5">
                Automatically push and store AI Agent code, n8n specs, and CI/CD pipelines to GitHub
              </p>
            </div>
          </div>

          <button
            onClick={() => setGitHubModalOpen(false)}
            className="p-2 rounded-xl text-[#878278] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef] hover:bg-[#e5e0d5]/40 dark:hover:bg-[#33302b] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-5 border-b border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5]/50 dark:bg-[#181715]/50 gap-2">
          <button
            onClick={() => setActiveTab('sync')}
            className={`py-3 px-3 border-b-2 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sync'
                ? 'border-[#c15f3c] text-[#c15f3c]'
                : 'border-transparent text-[#878278] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef]'
            }`}
          >
            <GitCommit className="w-3.5 h-3.5" />
            <span>Commit & Push</span>
          </button>

          <button
            onClick={() => setActiveTab('files')}
            className={`py-3 px-3 border-b-2 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'files'
                ? 'border-[#c15f3c] text-[#c15f3c]'
                : 'border-transparent text-[#878278] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef]'
            }`}
          >
            <Folder className="w-3.5 h-3.5" />
            <span>Generated File Tree (5)</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-3 border-b-2 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-[#c15f3c] text-[#c15f3c]'
                : 'border-transparent text-[#878278] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Commit History ({commitHistory.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-3 border-b-2 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'border-[#c15f3c] text-[#c15f3c]'
                : 'border-transparent text-[#878278] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef]'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Repository Settings</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'sync' && (
            <div className="space-y-4">
              {/* Target Repository Info Card */}
              <div className="p-4 rounded-2xl bg-[#faf8f5] dark:bg-[#141311] border border-[#e5e0d5] dark:border-[#33302b] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#c15f3c]/10 text-[#c15f3c] flex items-center justify-center">
                    <GitBranch className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-[#1f1e1b] dark:text-[#f5f3ef]">
                        {owner}/{repo}
                      </span>
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-mono bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold">
                        branch: {branch}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#878278] font-mono">
                      Target Directory: {syncDirectory}/{activeAgent.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}
                    </p>
                  </div>
                </div>

                <a
                  href={`https://github.com/${owner}/${repo}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] text-[11px] font-semibold text-[#5c5850] dark:text-[#b8b4aa] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef] flex items-center gap-1 shadow-2xs"
                >
                  <span>Open Repo</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>

              {/* Commit Message Box */}
              <div>
                <label className="block text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef] mb-1.5">
                  Commit Message
                </label>
                <input
                  type="text"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] text-xs text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-none focus:border-[#c15f3c]"
                  placeholder="e.g. feat: integrate Gemini 2.0 and Stripe escrow webhook"
                />
              </div>

              {/* Push Status Banner */}
              {lastPushStatus && (
                <div
                  className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 ${
                    lastPushStatus.success
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                      : 'bg-red-500/10 border border-red-500/30 text-red-800 dark:text-red-300'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold">{lastPushStatus.message}</p>
                    {lastPushStatus.url && (
                      <a
                        href={lastPushStatus.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] underline font-mono flex items-center gap-1 mt-0.5"
                      >
                        <span>View on GitHub</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-4 py-2.5 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] hover:bg-[#faf8f5] dark:hover:bg-[#282622] text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef] flex items-center gap-2 cursor-pointer shadow-2xs"
                >
                  <Download className="w-4 h-4 text-[#c15f3c]" />
                  <span>Download Complete ZIP</span>
                </button>

                <button
                  type="button"
                  onClick={handlePush}
                  disabled={isPushing}
                  className="px-5 py-2.5 rounded-xl bg-[#c15f3c] hover:bg-[#a94f30] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition-all"
                >
                  {isPushing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Pushing to GitHub...</span>
                    </>
                  ) : (
                    <>
                      <Github className="w-4 h-4" />
                      <span>Commit & Push to GitHub</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'files' && (
            <div className="space-y-3">
              <p className="text-xs text-[#878278]">
                These 5 files are automatically generated from your live canvas and will be committed to your repository:
              </p>

              <div className="space-y-2 font-mono text-xs">
                <div className="p-3 rounded-xl bg-[#faf8f5] dark:bg-[#141311] border border-[#e5e0d5] dark:border-[#33302b] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-blue-500" />
                    <span className="font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                      index.ts (TypeScript Agent Engine)
                    </span>
                  </div>
                  <span className="text-[10px] text-[#878278]">
                    {currentBundle.typescriptAgent.length} bytes
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#faf8f5] dark:bg-[#141311] border border-[#e5e0d5] dark:border-[#33302b] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileJson className="w-4 h-4 text-amber-500" />
                    <span className="font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                      workflow.n8n.json (n8n & Canvas Flow Schema)
                    </span>
                  </div>
                  <span className="text-[10px] text-[#878278]">
                    {currentBundle.n8nWorkflowJson.length} bytes
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#faf8f5] dark:bg-[#141311] border border-[#e5e0d5] dark:border-[#33302b] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-emerald-500" />
                    <span className="font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                      automation.py (Python Async Pipeline)
                    </span>
                  </div>
                  <span className="text-[10px] text-[#878278]">
                    {currentBundle.pythonScript.length} bytes
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#faf8f5] dark:bg-[#141311] border border-[#e5e0d5] dark:border-[#33302b] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Github className="w-4 h-4 text-purple-500" />
                    <span className="font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                      .github/workflows/agent-ci.yml (CI/CD Action)
                    </span>
                  </div>
                  <span className="text-[10px] text-[#878278]">
                    {currentBundle.githubActionYml.length} bytes
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#faf8f5] dark:bg-[#141311] border border-[#e5e0d5] dark:border-[#33302b] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4 text-[#c15f3c]" />
                    <span className="font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                      README.md (Architecture & Runbook)
                    </span>
                  </div>
                  <span className="text-[10px] text-[#878278]">
                    {currentBundle.readmeMd.length} bytes
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="space-y-2">
                {commitHistory.map((c) => (
                  <div
                    key={c.sha}
                    className="p-3.5 rounded-2xl bg-[#faf8f5] dark:bg-[#141311] border border-[#e5e0d5] dark:border-[#33302b] flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#c15f3c]">
                          #{c.sha}
                        </span>
                        <span className="text-xs font-semibold text-[#1f1e1b] dark:text-[#f5f3ef]">
                          {c.message}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-[#878278] font-mono mt-1">
                        <span>by {c.author}</span>
                        <span>•</span>
                        <span>{new Date(c.timestamp).toLocaleTimeString()}</span>
                        <span>•</span>
                        <span>{c.files.length} files changed</span>
                      </div>
                    </div>

                    <a
                      href={c.htmlUrl || `https://github.com/${owner}/${repo}/commit/${c.sha}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg hover:bg-[#e5e0d5]/40 dark:hover:bg-[#33302b] text-[#878278] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef] transition-colors"
                      title="View Commit on GitHub"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef] mb-1">
                    GitHub Owner / Org
                  </label>
                  <input
                    type="text"
                    value={inputOwner}
                    onChange={(e) => setInputOwner(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] text-xs text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-none focus:border-[#c15f3c]"
                    placeholder="e.g. hamudijems4"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef] mb-1">
                    Repository Name
                  </label>
                  <input
                    type="text"
                    value={inputRepo}
                    onChange={(e) => setInputRepo(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] text-xs text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-none focus:border-[#c15f3c]"
                    placeholder="e.g. agentlens-ai-agents"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef] mb-1">
                  Target Branch
                </label>
                <input
                  type="text"
                  value={inputBranch}
                  onChange={(e) => setInputBranch(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] text-xs text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-none focus:border-[#c15f3c]"
                  placeholder="main"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef] mb-1">
                  GitHub Personal Access Token (Optional for direct REST write)
                </label>
                <input
                  type="password"
                  value={inputToken}
                  onChange={(e) => setInputToken(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] text-xs font-mono text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-none focus:border-[#c15f3c]"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx (saved securely in browser storage)"
                />
                <p className="text-[10px] text-[#878278] mt-1">
                  Required permissions: <code className="font-mono">repo</code> (Read/Write). If omitted, commits are staged and exported locally with full Git history.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#c15f3c] text-white text-xs font-bold hover:bg-[#a94f30] transition-colors cursor-pointer"
                >
                  Save Repository Settings
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
