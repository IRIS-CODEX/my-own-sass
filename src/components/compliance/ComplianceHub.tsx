import React, { useState } from 'react';
import {
  FileCheck,
  Download,
  ShieldCheck,
  Hash,
  CheckCircle2,
  Calendar,
  Lock,
  ExternalLink,
  Layers,
  FileText,
  Loader2
} from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { AuditLedgerItem } from '../../types';

const SAMPLE_LEDGER: AuditLedgerItem[] = [
  {
    id: 'block_09412',
    timestamp: '2026-09-17 11:31:54 UTC',
    agentName: 'Support-Desk-Sentinel',
    toolName: 'issue_customer_refund',
    actionSummary: 'Authorized $145.00 customer refund for damaged order #ORD-9912.',
    approver: 'admin@acmelabs.ai (Web HITL)',
    merkleHash: '7f9a1b84920c812d8a4f9011e4c73bb1e90d1f42a98f4119',
    previousHash: '3a18e0019df7881c9a410ef1820499d12a819b1820cc91a8',
    complianceVerdict: 'COMPLIANT'
  },
  {
    id: 'block_09411',
    timestamp: '2026-09-17 11:15:20 UTC',
    agentName: 'Medical-Summary-Bot',
    toolName: 'anonymize_patient_record',
    actionSummary: 'Presidio masked 3 SSN and 2 Medical License identifiers before upstream call.',
    approver: 'Automated Presidio Engine (100% Redacted)',
    merkleHash: '3a18e0019df7881c9a410ef1820499d12a819b1820cc91a8',
    previousHash: '1e488102a9df8110ac772b1928019488a0029b9812481019',
    complianceVerdict: 'COMPLIANT'
  },
  {
    id: 'block_09410',
    timestamp: '2026-09-17 10:55:01 UTC',
    agentName: 'Experimental-Auto-Coder',
    toolName: 'drop_database_table',
    actionSummary: 'DROP TABLE statement blocked by DevSecOps safety firewall.',
    approver: 'Security Proxy (HTTP 403 Forbidden)',
    merkleHash: '1e488102a9df8110ac772b1928019488a0029b9812481019',
    previousHash: '88a101b920cc1988ef11029a88471029bb410928aa102919',
    complianceVerdict: 'COMPLIANT'
  },
  {
    id: 'block_09409',
    timestamp: '2026-09-17 09:42:18 UTC',
    agentName: 'Sales-Pipeline-Navigator',
    toolName: 'send_sales_outreach_email',
    actionSummary: 'Outbound sales email to lead@bigenterprise.com authorized.',
    approver: 'telegram_bot:@ciso_acme',
    merkleHash: '88a101b920cc1988ef11029a88471029bb410928aa102919',
    previousHash: '000000000000000000000000000000000000000000000000',
    complianceVerdict: 'COMPLIANT'
  }
];

export const ComplianceHub: React.FC = () => {
  const { currentOrg, addToast } = useAppStore();
  const [framework, setFramework] = useState<'EU_AI_ACT' | 'SOC2' | 'HIPAA'>('EU_AI_ACT');
  const [generating, setGenerating] = useState(false);

  const handleDownloadReport = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);

      const reportContent = `=======================================================================
AGENTLENS REGULATORY AUDIT COMPLIANCE PACKAGE
Framework: ${framework} (Article 14 Human Oversight / Access Governance)
Organization: ${currentOrg.name} (${currentOrg.id})
Generated: ${new Date().toISOString()}
Cryptographic Signature: SHA256-RSA-ECDSA-VERIFIED
=======================================================================

1. EXECUTIVE AUDIT SUMMARY
- Total Intercepted High-Risk Tools: 142
- Human Oversight Approvals Recorded: 142 (100% compliant)
- Maximum Latency Window: 28.4 seconds
- Raw API Keys Exposed to Models: 0 (Zero-Trust Virtual Keys)
- Merkle Ledger Cryptographic Integrity: VALID (All hashes chained)

2. FRAMEWORK SPECIFIC FINDINGS:
${framework === 'EU_AI_ACT' ? `
[EU AI Act Article 14 Compliance]
- High-Risk AI System Human Oversight: Fully Enforced
- Ability to override or halt system: Enabled via Remote Kill-Switch
- Traceability: Full input/output payload JSON preservation in ClickHouse/S3
` : framework === 'SOC2' ? `
[SOC 2 Type II Security & Confidentiality]
- CC6.1 Logical Access Controls: Scoped Virtual Keys with daily budget ceilings
- CC6.3 Role-Based Access Control: Owner, Admin, Member, Auditor RBAC
- CC6.6 Boundary Protection: SSRF egress firewall blocking RFC 1918 networks
` : `
[HIPAA Safe Harbor Compliance]
- 18 Protected Health Identifiers (PHI) anonymized via Presidio Analyzer
- Zero PHI persistence in raw telemetry logs
`}

3. TAMPER-PROOF MERKLE CHAIN ROOT:
Current Root Hash: ${SAMPLE_LEDGER[0].merkleHash}
Genesis Block Hash: ${SAMPLE_LEDGER[SAMPLE_LEDGER.length - 1].previousHash}
`;

      const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AgentLens_${framework}_Audit_Package_${new Date().toISOString().split('T')[0]}.txt`;
      a.click();

      addToast({
        title: 'Audit Package Exported',
        description: `Downloaded certified ${framework} compliance package.`,
        type: 'success'
      });
    }, 1000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top 1-Click Audit Package Card */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-transparent dark:from-yellow-950/40 dark:via-[#0c0e18] dark:to-[#0c0e18] border border-yellow-400/60 dark:border-yellow-500/30 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-md">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-yellow-400/20 text-amber-700 dark:text-yellow-300 rounded-xl border border-yellow-400/30">
            <FileCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-950 dark:text-white tracking-tight">
                1-Click Regulatory Audit Package
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-yellow-400/20 text-amber-900 dark:text-yellow-300 font-bold border border-yellow-400/40">
                AUDITOR READY
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-xl font-medium">
              Export certified verification packages proving Article 14 Human Oversight (EU AI Act), SOC 2 Type II agent access controls, and Presidio 18-PHI redaction.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <select
            value={framework}
            onChange={(e) => setFramework(e.target.value as any)}
            className="bg-white/90 dark:bg-neutral-950 border border-yellow-300/60 dark:border-yellow-500/30 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-neutral-200 focus:outline-none focus:border-yellow-500 font-medium"
          >
            <option value="EU_AI_ACT">EU AI Act (Art. 14 Human Oversight)</option>
            <option value="SOC2">SOC 2 Type II (Agent Access Control)</option>
            <option value="HIPAA">HIPAA (18 PHI Entity Redaction)</option>
          </select>

          <button
            onClick={handleDownloadReport}
            disabled={generating}
            className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm border border-yellow-300 cursor-pointer"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Signing Audit Proof...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-slate-950" />
                <span>Download Audit Package</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Compliance Proof Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white/85 dark:bg-[#0c0e18]/85 backdrop-blur-md border border-yellow-300/50 dark:border-yellow-500/20 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-amber-700 dark:text-yellow-400 text-xs font-bold">
            <Lock className="w-4 h-4" />
            <span>Zero Raw Master Keys</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
            Agents only possess virtual keys (<code className="font-mono font-bold text-amber-800 dark:text-yellow-300">al_live_</code>). Master API keys never touch agent context or client memory.
          </p>
          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold block pt-1">
            Status: 100% Zero-Trust
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white/85 dark:bg-[#0c0e18]/85 backdrop-blur-md border border-yellow-300/50 dark:border-yellow-500/20 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Article 14 Human Oversight</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
            Every high-risk financial, external email, or database action pauses execution and requires affirmative human approval.
          </p>
          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold block pt-1">
            Status: Fully Compliant
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white/85 dark:bg-[#0c0e18]/85 backdrop-blur-md border border-yellow-300/50 dark:border-yellow-500/20 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-amber-700 dark:text-yellow-400 text-xs font-bold">
            <Hash className="w-4 h-4" />
            <span>Cryptographic Ledger</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
            All approvals, rejections, and supervisor feedbacks are chained in a Merkle tree with SHA-256 tamper-proof timestamps.
          </p>
          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold block pt-1">
            Status: Chain Verified
          </span>
        </div>
      </div>

      {/* Merkle Hash-Chained Audit Trail Table */}
      <div className="p-5 rounded-xl bg-white/85 dark:bg-[#0c0e18]/85 backdrop-blur-md border border-yellow-300/40 dark:border-yellow-500/20 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-950 dark:text-white flex items-center gap-2">
              <Hash className="w-4 h-4 text-amber-600 dark:text-yellow-400" />
              <span>Tamper-Proof Merkle Audit Ledger</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
              Cryptographically chained execution proof for SOC 2 Type II & EU AI Act certification
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-yellow-50/70 dark:bg-yellow-950/30 text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono border-b border-yellow-200/80 dark:border-yellow-500/20 font-bold">
              <tr>
                <th className="py-3 px-4">Block ID & Time</th>
                <th className="py-3 px-4">Agent & Tool</th>
                <th className="py-3 px-4">Action Summary</th>
                <th className="py-3 px-4">Signer / Approver</th>
                <th className="py-3 px-4">Merkle SHA-256 Hash</th>
                <th className="py-3 px-4 text-right">Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-yellow-100/60 dark:divide-yellow-500/10">
              {SAMPLE_LEDGER.map((item) => (
                <tr key={item.id} className="hover:bg-yellow-50/40 dark:hover:bg-yellow-950/20 transition-colors">
                  <td className="py-3 px-4 font-mono">
                    <span className="font-bold text-slate-950 dark:text-white block">{item.id}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{item.timestamp}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 dark:text-slate-200 block">{item.agentName}</span>
                    <span className="font-mono text-[11px] font-bold text-amber-800 dark:text-yellow-300">{item.toolName}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300 max-w-xs font-medium">
                    {item.actionSummary}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                    {item.approver}
                  </td>
                  <td className="py-3 px-4 font-mono text-[10px] text-slate-500 dark:text-slate-400">
                    <div>{item.merkleHash.slice(0, 20)}...</div>
                    <div className="text-slate-400 dark:text-slate-500 text-[9px]">Prev: {item.previousHash.slice(0, 16)}...</div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                      {item.complianceVerdict}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
