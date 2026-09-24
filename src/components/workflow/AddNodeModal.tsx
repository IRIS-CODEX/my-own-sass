import React, { useState } from 'react';
import { useWorkflowStore } from '../../stores/useWorkflowStore';
import {
  X,
  Search,
  Zap,
  Bot,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Mail,
  DollarSign,
  Server,
  Folder,
  MessageSquare,
  Radio,
  Clock,
  Share2,
  Sparkles,
  Image as ImageIcon,
  CheckCircle2,
  Cpu,
  Send,
  Globe,
  Phone,
  MessageCircle,
} from 'lucide-react';
import { WorkflowNodeType, IntegrationPlatform } from '../../types/workflow';

interface NodeTemplate {
  name: string;
  type: WorkflowNodeType;
  platform: IntegrationPlatform;
  category: string;
  icon: string;
  description: string;
  config: Record<string, any>;
  inputs: { id: string; name: string; type: any }[];
  outputs: { id: string; name: string; type: any }[];
}

const TEMPLATES: NodeTemplate[] = [
  // Triggers
  {
    name: 'HTTP Webhook Ingress',
    type: 'trigger',
    platform: 'webhook',
    category: 'Ingress & Triggers',
    icon: 'Radio',
    description: 'Listen for REST/JSON API webhook requests with HMAC signature validation.',
    config: { endpoint: '/api/v1/webhook/custom' },
    inputs: [],
    outputs: [{ id: 'out_payload', name: 'payload', type: 'data' }],
  },
  {
    name: 'Scheduled Cron Event',
    type: 'trigger',
    platform: 'webhook',
    category: 'Ingress & Triggers',
    icon: 'Clock',
    description: 'Trigger agent workflows on recurring intervals (e.g. hourly, daily at 08:00 UTC).',
    config: { cronExpression: '0 * * * *' },
    inputs: [],
    outputs: [{ id: 'out_signal', name: 'cron_tick', type: 'signal' }],
  },
  {
    name: 'Gmail Inbox Push Event',
    type: 'trigger',
    platform: 'gmail',
    category: 'Ingress & Triggers',
    icon: 'Mail',
    description: 'Triggered when a new email arrives in user inbox via Google Cloud Pub/Sub.',
    config: { oauthScope: 'https://www.googleapis.com/auth/gmail.readonly' },
    inputs: [],
    outputs: [{ id: 'out_email', name: 'email_message', type: 'data' }],
  },
  {
    name: 'WhatsApp Cloud Ingress Webhook',
    type: 'trigger',
    platform: 'whatsapp',
    category: 'Ingress & Triggers',
    icon: 'MessageCircle',
    description: 'Receives real-time customer WhatsApp messages and status callbacks from Meta Graph API.',
    config: { phoneId: '104829104829104', verifyToken: 'agentlens_wa_secret_token_99' },
    inputs: [],
    outputs: [{ id: 'out_wa_msg', name: 'whatsapp_message', type: 'data' }],
  },
  {
    name: 'Telegram Bot Command Ingress',
    type: 'trigger',
    platform: 'telegram',
    category: 'Ingress & Triggers',
    icon: 'Send',
    description: 'Listens for /commands, channel mentions, and direct messages via Telegram Bot API webhook.',
    config: { commands: '/start, /help, /triage, /alert' },
    inputs: [],
    outputs: [{ id: 'out_tg_cmd', name: 'telegram_update', type: 'data' }],
  },

  // AI Models
  {
    name: 'Gemini 3.8 Flash',
    type: 'ai_model',
    platform: 'gemini',
    category: 'AI Models',
    icon: 'Zap',
    description: 'Google next-gen low latency model ($0.075/1M tokens) with multimodal reasoning.',
    config: { model: 'gemini-3.8-flash', temperature: 0.7 },
    inputs: [{ id: 'in_prompt', name: 'prompt', type: 'data' }],
    outputs: [{ id: 'out_text', name: 'response', type: 'data' }],
  },
  {
    name: 'Claude 3.5 Sonnet',
    type: 'ai_model',
    platform: 'anthropic',
    category: 'AI Models',
    icon: 'Bot',
    description: 'Anthropic frontier model for complex logic, multi-file code, and tool calling.',
    config: { model: 'claude-3.5-sonnet', temperature: 0.2 },
    inputs: [{ id: 'in_prompt', name: 'prompt', type: 'data' }],
    outputs: [{ id: 'out_text', name: 'response', type: 'data' }],
  },
  {
    name: 'Google Imagen 3 Image Gen',
    type: 'ai_model',
    platform: 'imagen',
    category: 'AI Models',
    icon: 'ImageIcon',
    description: 'Photorealistic image generation diffusion model with high detail and custom aspect ratios.',
    config: { imageResolution: '2048x1152', aspectRatio: '16:9' },
    inputs: [{ id: 'in_prompt', name: 'prompt', type: 'data' }],
    outputs: [{ id: 'out_image', name: 'image_url', type: 'image' }],
  },

  // API Key & Security
  {
    name: 'Virtual Key Escrow & Token Minter',
    type: 'api_key_proxy',
    platform: 'aws_nitro',
    category: 'Virtual Key Vault',
    icon: 'KeyRound',
    description: 'Mints ephemeral 300s proxy tokens with hardware budget caps to isolate master secrets.',
    config: { ttlSeconds: 300, budgetCapUsd: 20.0 },
    inputs: [{ id: 'in_req', name: 'request', type: 'data' }],
    outputs: [{ id: 'out_token', name: 'ephemeral_token', type: 'token' }],
  },
  {
    name: 'Zero-Trust AST Policy Guard',
    type: 'policy_gate',
    platform: 'aws_nitro',
    category: 'Zero-Trust Security',
    icon: 'ShieldCheck',
    description: 'Inspects Abstract Syntax Trees for prompt injections and enforces enterprise data policies.',
    config: { policyRuleId: 'SEC-AST-01', piiRedaction: true },
    inputs: [{ id: 'in_ast', name: 'payload', type: 'data' }],
    outputs: [{ id: 'out_safe', name: 'sanitized_ast', type: 'data' }],
  },
  {
    name: 'FIDO2 Multi-Sig HITL Escrow',
    type: 'policy_gate',
    platform: 'aws_nitro',
    category: 'Zero-Trust Security',
    icon: 'ShieldAlert',
    description: 'Quarantines high-value operations in cryptographic escrow requiring hardware approval.',
    config: { fido2Required: true, ttlSeconds: 300 },
    inputs: [{ id: 'in_action', name: 'action_intent', type: 'data' }],
    outputs: [{ id: 'out_approved', name: 'signed_action', type: 'data' }],
  },

  // Platforms & Integrations
  {
    name: 'Stripe Treasury Wire Payouts',
    type: 'integration',
    platform: 'stripe',
    category: 'Integrations',
    icon: 'DollarSign',
    description: 'Initiate outbound ACH/Fedwire payments and reconcile invoices.',
    config: { endpoint: 'https://api.stripe.com/v1/treasury' },
    inputs: [{ id: 'in_wire', name: 'wire_order', type: 'data' }],
    outputs: [{ id: 'out_receipt', name: 'receipt', type: 'data' }],
  },
  {
    name: 'Slack Security Ops Dispatcher',
    type: 'integration',
    platform: 'slack',
    category: 'Integrations',
    icon: 'MessageSquare',
    description: 'Post real-time incident alerts and interactive 1-click approval buttons.',
    config: { channel: '#security-ops' },
    inputs: [{ id: 'in_msg', name: 'message', type: 'signal' }],
    outputs: [],
  },
  {
    name: 'Google Drive Vault Archiver',
    type: 'integration',
    platform: 'gdrive',
    category: 'Integrations',
    icon: 'Folder',
    description: 'Archive compliance reports and generated agent assets into Google Drive.',
    config: { folderId: 'root' },
    inputs: [{ id: 'in_file', name: 'file_asset', type: 'file' }],
    outputs: [{ id: 'out_link', name: 'drive_url', type: 'data' }],
  },
  {
    name: 'Cloud SQL / PostgreSQL Ledger',
    type: 'integration',
    platform: 'cloudsql',
    category: 'Integrations',
    icon: 'Server',
    description: 'Persist cryptographic execution logs, user data, and state in Cloud SQL.',
    config: { tableName: 'agent_logs' },
    inputs: [{ id: 'in_record', name: 'record', type: 'data' }],
    outputs: [{ id: 'out_id', name: 'record_id', type: 'data' }],
  },
  {
    name: 'WhatsApp Cloud Message Sender',
    type: 'integration',
    platform: 'whatsapp',
    category: 'Integrations',
    icon: 'MessageCircle',
    description: 'Dispatch authorized customer messages, template responses, and media via Meta Cloud API.',
    config: { phoneId: '104829104829104', messagingType: 'CUSTOMER_SERVICE' },
    inputs: [{ id: 'in_msg', name: 'outbound_message', type: 'data' }],
    outputs: [{ id: 'out_receipt', name: 'meta_receipt', type: 'data' }],
  },
  {
    name: 'Telegram Bot Message Sender',
    type: 'integration',
    platform: 'telegram',
    category: 'Integrations',
    icon: 'Send',
    description: 'Dispatch Markdown messages, channel alerts, and inline keyboards via Telegram Bot API.',
    config: { parseMode: 'MarkdownV2', disableWebPagePreview: true },
    inputs: [{ id: 'in_msg', name: 'outbound_text', type: 'data' }],
    outputs: [{ id: 'out_receipt', name: 'delivery_receipt', type: 'data' }],
  },
  {
    name: 'Gmail Draft & Auto-Send API',
    type: 'integration',
    platform: 'gmail',
    category: 'Integrations',
    icon: 'Mail',
    description: 'Compose contextual email drafts or dispatch authenticated emails through your personal Gmail account.',
    config: { autoSend: false, requireConfirmation: true },
    inputs: [{ id: 'in_draft', name: 'email_draft', type: 'data' }],
    outputs: [{ id: 'out_receipt', name: 'send_receipt', type: 'data' }],
  },
  {
    name: 'Discord Bot & Webhook Dispatcher',
    type: 'integration',
    platform: 'discord',
    category: 'Integrations',
    icon: 'MessageSquare',
    description: 'Post structured agent briefings, status alerts, and community replies to Discord channels.',
    config: { channel: '#general' },
    inputs: [{ id: 'in_msg', name: 'discord_msg', type: 'data' }],
    outputs: [{ id: 'out_receipt', name: 'discord_receipt', type: 'data' }],
  },
  {
    name: 'Twilio SMS & Telephony Gateway',
    type: 'integration',
    platform: 'twilio',
    category: 'Integrations',
    icon: 'Phone',
    description: 'Send instant SMS text alerts or trigger synthesized voice calls for urgent incidents.',
    config: { fromNumber: '+18005550199', toNumber: '+15550199988' },
    inputs: [{ id: 'in_sms', name: 'sms_payload', type: 'data' }],
    outputs: [{ id: 'out_receipt', name: 'twilio_sid', type: 'data' }],
  },
  {
    name: 'Custom REST API / Webhook Dispatcher',
    type: 'integration',
    platform: 'rest_api',
    category: 'Integrations',
    icon: 'Globe',
    description: 'Dispatch HTTP requests (POST, GET, PUT) to any external SaaS platform or microservice.',
    config: { endpoint: 'https://api.example.com/v1/events', method: 'POST' },
    inputs: [{ id: 'in_body', name: 'json_payload', type: 'data' }],
    outputs: [{ id: 'out_res', name: 'http_response', type: 'data' }],
  },
];

export const AddNodeModal: React.FC = () => {
  const { addNodeModalOpen, setAddNodeModalOpen, addNode, nodes } = useWorkflowStore();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  if (!addNodeModalOpen) return null;

  const categories = ['ALL', 'Ingress & Triggers', 'AI Models', 'Virtual Key Vault', 'Zero-Trust Security', 'Integrations'];

  const filtered = TEMPLATES.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.platform.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || t.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleSelectTemplate = (template: NodeTemplate) => {
    // Determine a position that doesn't overlap
    const maxX = nodes.reduce((max, n) => Math.max(max, n.position.x), 0);
    const newX = maxX + 320;
    const newY = 160 + (nodes.length % 3) * 60;

    addNode({
      name: template.name,
      type: template.type,
      platform: template.platform,
      category: template.category,
      position: { x: newX, y: newY },
      status: 'idle',
      icon: template.icon,
      description: template.description,
      config: template.config,
      inputs: template.inputs,
      outputs: template.outputs,
      metrics: { latencyMs: 1.0, tokens: 0, costUsd: 0.0, executions: 0, errorRate: 0 },
      livePayload: { statusSummary: 'Node Added • Ready to Connect' },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#e5e0d5] dark:border-[#33302b] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#c15f3c]/10 text-[#c15f3c] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                Add Node to Workflow Canvas
              </h3>
              <p className="text-[11px] text-[#5c5850] dark:text-[#b8b4aa]">
                Select an AI model, Virtual Key proxy, trigger, or platform integration to connect.
              </p>
            </div>
          </div>
          <button
            onClick={() => setAddNodeModalOpen(false)}
            className="p-2 rounded-xl hover:bg-[#f4f1ea] dark:hover:bg-[#181715] text-[#878278] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="p-4 border-b border-[#e5e0d5] dark:border-[#33302b] space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#878278] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search nodes (e.g. Gemini, Stripe, Virtual Key, Slack, Imagen)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715] text-xs text-[#1f1e1b] dark:text-[#f5f3ef] placeholder-[#878278] focus:outline-none focus:ring-1 focus:ring-[#c15f3c]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#c15f3c] text-white'
                    : 'bg-[#faf8f5] dark:bg-[#181715] text-[#5c5850] dark:text-[#b8b4aa] hover:bg-[#f4f1ea]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Template Grid */}
        <div className="p-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh]">
          {filtered.map((t, idx) => (
            <div
              key={idx}
              onClick={() => handleSelectTemplate(t)}
              className="p-3.5 rounded-2xl border border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5] dark:bg-[#181715] hover:border-[#c15f3c] hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-mono font-bold uppercase text-[#878278] dark:text-[#7d7970]">
                    {t.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#c15f3c]/10 text-[#c15f3c]">
                    {t.platform}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef] group-hover:text-[#c15f3c] transition-colors">
                  {t.name}
                </h4>
                <p className="text-[11px] text-[#5c5850] dark:text-[#b8b4aa] mt-1 leading-relaxed">
                  {t.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 mt-2 border-t border-[#e5e0d5] dark:border-[#2a2824] text-[10px] font-mono text-[#878278]">
                <span>{t.inputs.length} in • {t.outputs.length} out</span>
                <span className="font-bold text-[#c15f3c] group-hover:translate-x-0.5 transition-transform">
                  + Add to Flow
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
