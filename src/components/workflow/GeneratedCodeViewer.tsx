import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  Download,
  Github,
  FileJson,
  FileCode,
  Terminal,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  GitBranch,
} from 'lucide-react';
import { useGitHubStore } from '../../stores/useGitHubStore';
import { useWorkflowStore } from '../../stores/useWorkflowStore';

interface GeneratedCodeViewerProps {
  bundle: {
    agentName: string;
    workflowTitle: string;
    typescriptAgent: string;
    pythonScript: string;
    n8nWorkflowJson: string;
    githubActionYml: string;
    readmeMd: string;
  };
  compact?: boolean;
}

export const GeneratedCodeViewer: React.FC<GeneratedCodeViewerProps> = ({ bundle, compact = false }) => {
  const [activeTab, setActiveTab] = useState<'ts' | 'n8n' | 'python' | 'github' | 'readme'>('ts');
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [isPushingLocal, setIsPushingLocal] = useState(false);
  const [pushSuccess, setPushSuccess] = useState<string | null>(null);

  const { pushToGitHub, downloadBundleZip, setGitHubModalOpen, owner, repo, branch, lastCommitSha } = useGitHubStore();
  const { nodes, edges } = useWorkflowStore();

  const getActiveCode = () => {
    switch (activeTab) {
      case 'ts':
        return bundle.typescriptAgent;
      case 'n8n':
        return bundle.n8nWorkflowJson;
      case 'python':
        return bundle.pythonScript;
      case 'github':
        return bundle.githubActionYml;
      case 'readme':
        return bundle.readmeMd;
      default:
        return bundle.typescriptAgent;
    }
  };

  const getLanguageLabel = () => {
    switch (activeTab) {
      case 'ts':
        return 'TypeScript (Gemini 2.0 SDK)';
      case 'n8n':
        return 'n8n Workflow JSON Spec';
      case 'python':
        return 'Python 3.11 Async Automation';
      case 'github':
        return 'GitHub Action Workflow (YAML)';
      case 'readme':
        return 'Markdown Documentation';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePushToGitHub = async () => {
    setIsPushingLocal(true);
    setPushSuccess(null);
    try {
      const res = await pushToGitHub(
        `feat(agent): deploy ${bundle.agentName} workflow to GitHub repo`,
        bundle.agentName,
        nodes,
        edges
      );
      if (res.success) {
        setPushSuccess(`Pushed commit ${res.sha || 'latest'}!`);
        setTimeout(() => setPushSuccess(null), 4000);
      }
    } finally {
      setIsPushingLocal(false);
    }
  };

  const handleDownloadZip = () => {
    downloadBundleZip({
      ...bundle,
      dockerfile: `FROM node:20-alpine\nWORKDIR /app\nCOPY package.json tsconfig.json ./\nRUN npm install\nCOPY . .\nEXPOSE 3000\nCMD ["npm", "start"]\n`,
      packageJson: JSON.stringify(
        {
          name: bundle.agentName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
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
    <div className="my-2 rounded-2xl border border-[#e5e0d5] dark:border-[#33302b] bg-[#1c1b18] text-[#f5f3ef] overflow-hidden shadow-md">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#141311] border-b border-[#33302b]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-mono font-bold text-emerald-400">
            {bundle.agentName} • {getLanguageLabel()}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* GitHub Quick Sync Button */}
          <button
            onClick={handlePushToGitHub}
            disabled={isPushingLocal}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              pushSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-[#2b2925] hover:bg-[#383530] text-[#f5f3ef] border border-[#423f39]'
            }`}
            title={`Sync code to GitHub (${owner}/${repo}@${branch})`}
          >
            <Github className="w-3 h-3 text-[#f5f3ef]" />
            <span>
              {isPushingLocal
                ? 'Pushing...'
                : pushSuccess
                ? 'Synced to GitHub!'
                : 'Save to GitHub'}
            </span>
          </button>

          {/* Download Zip */}
          <button
            onClick={handleDownloadZip}
            className="p-1 rounded-lg bg-[#2b2925] hover:bg-[#383530] text-[#878278] hover:text-[#f5f3ef] border border-[#423f39] transition-colors cursor-pointer"
            title="Download complete Workspace ZIP"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="p-1 rounded-lg bg-[#2b2925] hover:bg-[#383530] text-[#878278] hover:text-[#f5f3ef] border border-[#423f39] transition-colors cursor-pointer"
            title="Copy current code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Collapse/Expand Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg hover:bg-[#2b2925] text-[#878278] hover:text-[#f5f3ef] transition-colors cursor-pointer"
            title={isExpanded ? 'Collapse Code' : 'Expand Code'}
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* File Selector Tabs */}
          <div className="flex items-center gap-1 px-2 py-1.5 bg-[#181715] border-b border-[#2b2925] overflow-x-auto text-[10px] font-mono">
            <button
              onClick={() => setActiveTab('ts')}
              className={`px-2 py-1 rounded-md flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'ts'
                  ? 'bg-[#c15f3c] text-white font-bold'
                  : 'text-[#878278] hover:text-[#f5f3ef] hover:bg-[#262421]'
              }`}
            >
              <FileCode className="w-3 h-3" />
              <span>index.ts</span>
            </button>

            <button
              onClick={() => setActiveTab('n8n')}
              className={`px-2 py-1 rounded-md flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'n8n'
                  ? 'bg-[#c15f3c] text-white font-bold'
                  : 'text-[#878278] hover:text-[#f5f3ef] hover:bg-[#262421]'
              }`}
            >
              <FileJson className="w-3 h-3" />
              <span>workflow.n8n.json</span>
            </button>

            <button
              onClick={() => setActiveTab('python')}
              className={`px-2 py-1 rounded-md flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'python'
                  ? 'bg-[#c15f3c] text-white font-bold'
                  : 'text-[#878278] hover:text-[#f5f3ef] hover:bg-[#262421]'
              }`}
            >
              <Terminal className="w-3 h-3" />
              <span>automation.py</span>
            </button>

            <button
              onClick={() => setActiveTab('github')}
              className={`px-2 py-1 rounded-md flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'github'
                  ? 'bg-[#c15f3c] text-white font-bold'
                  : 'text-[#878278] hover:text-[#f5f3ef] hover:bg-[#262421]'
              }`}
            >
              <Github className="w-3 h-3" />
              <span>agent-ci.yml</span>
            </button>

            <button
              onClick={() => setActiveTab('readme')}
              className={`px-2 py-1 rounded-md flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'readme'
                  ? 'bg-[#c15f3c] text-white font-bold'
                  : 'text-[#878278] hover:text-[#f5f3ef] hover:bg-[#262421]'
              }`}
            >
              <span>README.md</span>
            </button>
          </div>

          {/* Code Body */}
          <div className="p-3 max-h-64 overflow-y-auto font-mono text-[11px] leading-relaxed bg-[#100f0e] text-[#e0deda]">
            <pre className="whitespace-pre overflow-x-auto select-text font-mono">
              <code>{getActiveCode()}</code>
            </pre>
          </div>

          {/* Footer info bar */}
          <div className="px-3 py-1.5 bg-[#141311] border-t border-[#2b2925] flex items-center justify-between text-[10px] text-[#878278] font-mono">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <GitBranch className="w-3 h-3 text-[#c15f3c]" />
                <span>{owner}/{repo} ({branch})</span>
              </span>
              {lastCommitSha && <span>• Commit #{lastCommitSha}</span>}
            </div>

            <button
              onClick={() => setGitHubModalOpen(true)}
              className="text-[#c15f3c] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Configure GitHub Repo</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
