import React, { useState } from 'react';
import {
  X,
  Bot,
  Sparkles,
  Zap,
  Mail,
  Send,
  MessageSquare,
  Globe,
  Phone,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Lock,
  ArrowRight,
  Sliders,
  DollarSign,
  KeyRound,
  MessageCircle,
  Clock,
  Terminal,
} from 'lucide-react';
import { useWorkflowStore } from '../../stores/useWorkflowStore';
import { useAgentsStore } from '../../stores/useAgentsStore';
import { useAppStore } from '../../stores/useAppStore';
import {
  connectGmailAccount,
  disconnectGmailAccount,
  isGmailConnected,
  getConnectedGmailEmail,
  fetchGmailMessages,
} from '../../lib/gmailService';
import { WorkflowNode, WorkflowEdge, AIBuildAction } from '../../types/workflow';

type SupportedPlatform =
  | 'whatsapp'
  | 'gmail'
  | 'telegram'
  | 'slack'
  | 'discord'
  | 'twilio'
  | 'rest_api';

interface PlatformOption {
  id: SupportedPlatform;
  name: string;
  category: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  description: string;
  defaultName: string;
  defaultPrompt: string;
  fields: {
    id: string;
    label: string;
    placeholder: string;
    defaultValue: string;
    type?: string;
  }[];
}

const PLATFORM_OPTIONS: PlatformOption[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp Cloud API',
    category: 'Messaging & Chat',
    badge: 'Meta Cloud API',
    icon: MessageCircle,
    iconColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    description: 'Autonomous customer chat agent for WhatsApp. Handles incoming queries, verifies webhook signatures, and sends interactive replies.',
    defaultName: 'WhatsApp-Customer-Assistant',
    defaultPrompt: 'You are an autonomous WhatsApp customer support agent. Answer customer inquiries politely, concisely, and helpfully. Keep messages under 300 characters when possible and provide structured options.',
    fields: [
      { id: 'phoneId', label: 'Phone Number ID', placeholder: '104829104829104', defaultValue: '104829104829104' },
      { id: 'recipientPhone', label: 'Test Recipient Phone', placeholder: '+1 555 019 2834', defaultValue: '+1 555 019 2834' },
      { id: 'verifyToken', label: 'Webhook Verify Token', placeholder: 'agentlens_wa_secret_token_99', defaultValue: 'agentlens_wa_secret_token_99' },
      { id: 'accessToken', label: 'Meta Access Token (Proxy Protected)', placeholder: 'EAAGm0PX4ZCsBO...', defaultValue: 'EAAGm0PX4ZCsBO99281xTokenMasked', type: 'password' },
    ],
  },
  {
    id: 'gmail',
    name: 'Personal Gmail Hub & Pilot',
    category: 'Google Workspace',
    badge: 'OAuth 2.0 Governed',
    icon: Mail,
    iconColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    description: 'Autonomous executive inbox copilot. Reads unread threads, summarizes priorities, writes smart contextual drafts, and delivers transactional updates.',
    defaultName: 'Executive-Gmail-Inbox-Pilot',
    defaultPrompt: 'You are the Executive Gmail Inbox Pilot. You assist with managing personal Gmail. Search, read unread threads, summarize key emails, categorize priorities, and draft contextual replies under strict Zero-Trust approval.',
    fields: [
      { id: 'queryFilter', label: 'Inbox Filter Query', placeholder: 'is:unread category:primary', defaultValue: 'is:unread category:primary' },
      { id: 'draftMode', label: 'Drafting Protocol', placeholder: 'Auto-Draft with Human Confirmation', defaultValue: 'Auto-Draft with Human Confirmation' },
      { id: 'oauthScope', label: 'OAuth Permission Scope', placeholder: 'https://www.googleapis.com/auth/gmail.modify', defaultValue: 'https://www.googleapis.com/auth/gmail.modify' },
    ],
  },
  {
    id: 'telegram',
    name: 'Telegram Bot API',
    category: 'Messaging & Chat',
    badge: 'BotFather API',
    icon: Send,
    iconColor: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
    description: 'Deploy an autonomous Telegram agent. Listens to /commands, moderates community groups, and broadcasts high-priority system alerts.',
    defaultName: 'Telegram-Community-Sentinel',
    defaultPrompt: 'You are an intelligent Telegram bot agent. Respond to user commands (/start, /status, /help, /triage), explain technical details concisely, and format messages with Telegram Markdown.',
    fields: [
      { id: 'botToken', label: 'Telegram Bot Token', placeholder: '7198234102:AAFtX...', defaultValue: '7198234102:AAFtX_9921_LiveMasked', type: 'password' },
      { id: 'chatId', label: 'Default Chat / Channel ID', placeholder: '@my_team_channel or -1001928374', defaultValue: '@ops_broadcast_channel' },
      { id: 'commands', label: 'Registered Commands', placeholder: '/start, /help, /triage, /alert', defaultValue: '/start, /help, /triage, /alert' },
    ],
  },
  {
    id: 'slack',
    name: 'Slack Security Ops Agent',
    category: 'Workplace Collab',
    badge: 'Slack Bolt API',
    icon: MessageSquare,
    iconColor: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    description: 'Post automated incident alerts, summarize logs, and dispatch interactive 1-click FIDO2 HITL approval buttons directly into Slack.',
    defaultName: 'Slack-SecOps-Sentinel',
    defaultPrompt: 'You are the SecOps Slack Assistant. Format threat intelligence briefings, incident postmortems, and HITL authorization prompts with Slack BlockKit.',
    fields: [
      { id: 'channel', label: 'Default Channel', placeholder: '#security-ops', defaultValue: '#security-ops' },
      { id: 'webhookUrl', label: 'Slack Webhook URL', placeholder: 'https://hooks.slack.com/services/...', defaultValue: 'https://hooks.slack.com/services/T00/B00/X00Live' },
    ],
  },
  {
    id: 'discord',
    name: 'Discord Community Bot',
    category: 'Workplace Collab',
    badge: 'Discord Bot API',
    icon: MessageSquare,
    iconColor: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    description: 'Listen to Discord server mentions, answer developer questions, and broadcast agent status updates to community channels.',
    defaultName: 'Discord-Developer-Copilot',
    defaultPrompt: 'You are a friendly Discord AI developer assistant. Answer programming questions, explain repository architectures, and provide clean code examples.',
    fields: [
      { id: 'channelName', label: 'Target Channel', placeholder: '#general-chat', defaultValue: '#general-chat' },
      { id: 'botToken', label: 'Discord Bot Token / Webhook', placeholder: 'OTc0MjM...', defaultValue: 'OTc0MjM4LiveMaskedToken', type: 'password' },
    ],
  },
  {
    id: 'twilio',
    name: 'Twilio SMS & Voice Gateway',
    category: 'Telephony & SMS',
    badge: 'Twilio REST API',
    icon: Phone,
    iconColor: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    description: 'Dispatch instant cellular SMS alerts or synthesize automated voice calls during high-severity Zero-Trust policy violations.',
    defaultName: 'Twilio-Emergency-Dispatcher',
    defaultPrompt: 'You are an emergency telephony dispatcher. Format critical SMS notifications concisely with time, severity, and action links.',
    fields: [
      { id: 'fromNumber', label: 'Twilio Phone Number', placeholder: '+1 800 555 0199', defaultValue: '+1 800 555 0199' },
      { id: 'toNumber', label: 'Alert Recipient Number', placeholder: '+1 555 019 9988', defaultValue: '+1 555 019 9988' },
      { id: 'accountSid', label: 'Account SID', placeholder: 'AC991823746...', defaultValue: 'AC991823746MaskedSid' },
    ],
  },
  {
    id: 'rest_api',
    name: 'Custom REST API / Webhook',
    category: 'Custom API',
    badge: 'HTTP / REST',
    icon: Globe,
    iconColor: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
    description: 'Integrate with any external SaaS API (HubSpot, Salesforce, Shopify, Airtable, internal microservices) with custom headers and JSON body templates.',
    defaultName: 'Custom-API-Ingress-Agent',
    defaultPrompt: 'You are a generalized API integration agent. Parse incoming JSON payloads, map fields according to schema, and dispatch authorized HTTP requests.',
    fields: [
      { id: 'endpointUrl', label: 'Endpoint Base URL', placeholder: 'https://api.example.com/v1/events', defaultValue: 'https://api.example.com/v1/events' },
      { id: 'httpMethod', label: 'HTTP Method', placeholder: 'POST', defaultValue: 'POST' },
      { id: 'authHeader', label: 'Authorization Header', placeholder: 'Bearer eyJhbGciOi...', defaultValue: 'Bearer al_virtual_key_proxy_live' },
    ],
  },
];

export const BuildAgentModal: React.FC = () => {
  const {
    buildAgentModalOpen,
    setBuildAgentModalOpen,
    nodes,
    edges,
    addNode,
    focusNode,
  } = useWorkflowStore();

  const { addToast } = useAppStore();
  const { provisionGmailAgent, addAgent } = useAgentsStore();

  const [selectedPlatformId, setSelectedPlatformId] = useState<SupportedPlatform>('whatsapp');
  const [agentName, setAgentName] = useState('WhatsApp-Customer-Assistant');
  const [selectedModel, setSelectedModel] = useState('gemini-3.8-flash');
  const [systemPrompt, setSystemPrompt] = useState(PLATFORM_OPTIONS[0].defaultPrompt);
  const [budgetCap, setBudgetCap] = useState(25.0);
  const [piiRedaction, setPiiRedaction] = useState(true);
  const [hitlEscrow, setHitlEscrow] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);

  // Field values keyed by field ID
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    PLATFORM_OPTIONS.forEach((p) => {
      p.fields.forEach((f) => {
        initial[f.id] = f.defaultValue;
      });
    });
    return initial;
  });

  const [testingInbox, setTestingInbox] = useState(false);
  const [inboxTestResult, setInboxTestResult] = useState<string | null>(null);

  if (!buildAgentModalOpen) return null;

  const currentPlatform = PLATFORM_OPTIONS.find((p) => p.id === selectedPlatformId) || PLATFORM_OPTIONS[0];

  const handleSelectPlatform = (platformId: SupportedPlatform) => {
    setSelectedPlatformId(platformId);
    const plat = PLATFORM_OPTIONS.find((p) => p.id === platformId);
    if (plat) {
      setAgentName(plat.defaultName);
      setSystemPrompt(plat.defaultPrompt);
    }
  };

  const handleFieldChange = (fieldId: string, val: string) => {
    setFieldValues((prev) => ({ ...prev, [fieldId]: val }));
  };

  const handleDisconnectGmail = () => {
    disconnectGmailAccount();
    setInboxTestResult(null);
    addToast({
      title: 'Google Account Disconnected',
      description: 'Gmail session terminated. The agent will run in local simulation mode.',
      type: 'info',
    });
  };

  const handleTestFetchInbox = async () => {
    setTestingInbox(true);
    try {
      const res = await fetchGmailMessages({ maxResults: 5 });
      setInboxTestResult(`Detected ${res.messages.length} thread(s) • ${res.unreadCount} unread.`);
      addToast({
        title: 'Inbox Polling Successful',
        description: `Verified connection: retrieved ${res.messages.length} email thread(s) from inbox.`,
        type: 'success',
      });
    } catch (err: any) {
      setInboxTestResult('Inbox sync error: ' + (err.message || 'Check OAuth scopes'));
    } finally {
      setTestingInbox(false);
    }
  };

  const handleConnectGmail = async () => {
    try {
      const res = await connectGmailAccount();
      if (res.success) {
        addToast({
          title: 'Gmail Account Connected',
          description: `Authorized management for ${res.email || 'your account'} under zero-trust governance.`,
          type: 'success',
        });
      } else {
        addToast({
          title: 'Connection Cancelled',
          description: res.error || 'Google authorization was not completed.',
          type: 'error',
        });
      }
    } catch (err: any) {
      addToast({
        title: 'Connection Error',
        description: err.message || 'Failed to authenticate with Google.',
        type: 'error',
      });
    }
  };

  const handleDeployAgent = async () => {
    setIsDeploying(true);

    try {
      // 1. Calculate Canvas Positioning
      let maxX = 60;
      let maxY = 120;
      nodes.forEach((n) => {
        if (n.position.x > maxX) maxX = n.position.x;
        if (n.position.y > maxY) maxY = n.position.y;
      });

      const startX = maxX + 280;
      const startY = 120;

      // 2. Build Nodes for the Agent Swarm
      const timestamp = Date.now();
      const triggerNodeId = `node_trigger_${selectedPlatformId}_${timestamp}`;
      const policyNodeId = `node_policy_${selectedPlatformId}_${timestamp}`;
      const aiNodeId = `node_ai_${selectedPlatformId}_${timestamp}`;
      const dispatchNodeId = `node_dispatch_${selectedPlatformId}_${timestamp}`;

      // A. Ingress Trigger Node
      const triggerNode: WorkflowNode = {
        id: triggerNodeId,
        name: `${currentPlatform.name} Ingress`,
        type: 'trigger',
        platform: selectedPlatformId === 'gmail' ? 'gmail' : (selectedPlatformId as any),
        category: 'Ingress & Triggers',
        position: { x: startX, y: startY },
        status: 'idle',
        icon: currentPlatform.id === 'gmail' ? 'Mail' : currentPlatform.id === 'whatsapp' ? 'MessageCircle' : 'Radio',
        description: `Receives incoming events, messages, and payloads from ${currentPlatform.name}.`,
        inputs: [],
        outputs: [{ id: 'out_payload', name: 'raw_event', type: 'data', description: 'Normalized message payload' }],
        config: {
          platform: selectedPlatformId,
          ...fieldValues,
        },
        metrics: { latencyMs: 1.1, tokens: 0, costUsd: 0, executions: 0, errorRate: 0 },
        livePayload: {
          output: {
            source: currentPlatform.id,
            status: 'READY_TO_RECEIVE',
            verifiedAt: new Date().toISOString(),
          },
          statusSummary: 'Listener Active & Verified',
        },
      };

      // B. AST Zero-Trust Policy Gate
      const policyNode: WorkflowNode = {
        id: policyNodeId,
        name: 'AST Zero-Trust Guard',
        type: 'policy_gate',
        platform: 'aws_nitro',
        category: 'Zero-Trust Security',
        position: { x: startX + 280, y: startY - 20 },
        status: 'idle',
        icon: 'ShieldCheck',
        description: 'Scans message inputs for prompt injection vectors and redacts sensitive customer PII.',
        inputs: [{ id: 'in_raw', name: 'raw_event', type: 'data' }],
        outputs: [{ id: 'out_safe', name: 'sanitized_ast', type: 'data' }],
        config: {
          policyRuleId: `SEC-${selectedPlatformId.toUpperCase()}-01`,
          piiRedaction,
          fido2Required: hitlEscrow,
        },
        metrics: { latencyMs: 0.8, tokens: 120, costUsd: 0.0001, executions: 0, errorRate: 0 },
      };

      // C. Autonomous AI Agent Core Node
      const aiNode: WorkflowNode = {
        id: aiNodeId,
        name: `${agentName} Core`,
        type: 'ai_model',
        platform: 'gemini',
        category: 'AI Models',
        position: { x: startX + 560, y: startY },
        status: 'idle',
        icon: 'Sparkles',
        description: `${selectedModel} core executing system prompt and tool calling directives.`,
        inputs: [
          { id: 'in_context', name: 'sanitized_ast', type: 'data' },
          { id: 'in_key', name: 'virtual_proxy_key', type: 'token' },
        ],
        outputs: [
          { id: 'out_response', name: 'agent_decision', type: 'data' },
          { id: 'out_signal', name: 'dispatch_signal', type: 'signal' },
        ],
        config: {
          model: selectedModel,
          systemPrompt,
          temperature: 0.3,
          budgetCapUsd: budgetCap,
        },
        metrics: { latencyMs: 340, tokens: 1420, costUsd: 0.0007, executions: 0, errorRate: 0 },
        credentials: {
          type: 'Virtual Enclave Proxy Key',
          status: 'CONNECTED',
          keyMask: 'al_live_proxy_key_vault',
        },
      };

      // D. Platform Dispatch / Action Node
      const dispatchNode: WorkflowNode = {
        id: dispatchNodeId,
        name: `${currentPlatform.name} Dispatcher`,
        type: 'integration',
        platform: selectedPlatformId === 'gmail' ? 'gmail' : (selectedPlatformId as any),
        category: 'Integrations',
        position: { x: startX + 840, y: startY + 10 },
        status: hitlEscrow ? 'intercepted' : 'idle',
        icon: currentPlatform.id === 'gmail' ? 'Mail' : currentPlatform.id === 'whatsapp' ? 'MessageCircle' : 'Send',
        description: `Dispatches outbound API replies and actions to ${currentPlatform.name}.`,
        inputs: [
          { id: 'in_msg', name: 'agent_decision', type: 'data' },
          { id: 'in_sig', name: 'dispatch_signal', type: 'signal' },
        ],
        outputs: [{ id: 'out_receipt', name: 'api_receipt', type: 'data' }],
        config: {
          platform: selectedPlatformId,
          fido2Required: hitlEscrow,
          ...fieldValues,
        },
        metrics: { latencyMs: 240, tokens: 0, costUsd: 0.002, executions: 0, errorRate: 0 },
      };

      // 3. Connect Edges
      const edge1: WorkflowEdge = {
        id: `edge_${triggerNodeId}_${policyNodeId}`,
        sourceNodeId: triggerNodeId,
        sourcePortId: 'out_payload',
        targetNodeId: policyNodeId,
        targetPortId: 'in_raw',
        animated: true,
        status: 'idle',
        dataType: 'data',
      };

      const edge2: WorkflowEdge = {
        id: `edge_${policyNodeId}_${aiNodeId}`,
        sourceNodeId: policyNodeId,
        sourcePortId: 'out_safe',
        targetNodeId: aiNodeId,
        targetPortId: 'in_context',
        animated: true,
        status: 'idle',
        dataType: 'data',
      };

      const edge3: WorkflowEdge = {
        id: `edge_${aiNodeId}_${dispatchNodeId}`,
        sourceNodeId: aiNodeId,
        sourcePortId: 'out_response',
        targetNodeId: dispatchNodeId,
        targetPortId: 'in_msg',
        animated: true,
        status: 'idle',
        dataType: 'data',
      };

      // 4. Update Workflow Store
      useWorkflowStore.setState((s) => ({
        nodes: [...s.nodes, triggerNode, policyNode, aiNode, dispatchNode],
        edges: [...s.edges, edge1, edge2, edge3],
        selectedNodeId: aiNodeId,
        inspectorOpen: true,
        aiBuildHistory: [
          {
            id: `build-agent-${timestamp}`,
            timestamp: new Date().toISOString(),
            agentId: 'archon-workflow',
            agentName: 'Archon (Workflow Architect)',
            actionType: 'ADD_NODE',
            title: `Deployed ${agentName} (${currentPlatform.name})`,
            description: `Provisioned 4-node swarm (Ingress -> AST Zero-Trust -> ${selectedModel} -> ${currentPlatform.name} API Dispatcher).`,
            nodeIds: [triggerNodeId, policyNodeId, aiNodeId, dispatchNodeId],
            edgeIds: [edge1.id, edge2.id, edge3.id],
            diffSummary: `+ 4 Nodes (${currentPlatform.name} Swarm) & 3 Wires`,
          },
          ...s.aiBuildHistory,
        ],
        logs: [
          ...s.logs,
          {
            id: `log-agent-built-${timestamp}`,
            timestamp: new Date().toISOString(),
            nodeId: aiNodeId,
            nodeName: agentName,
            level: 'SUCCESS',
            message: `Successfully generated and wired ${agentName} with ${currentPlatform.name} API gateway.`,
          },
        ],
      }));

      // 5. Register in Agents Fleet (useAgentsStore)
      if (selectedPlatformId === 'gmail') {
        await provisionGmailAgent();
      } else {
        await addAgent({
          orgId: 'org_enterprise_fleet',
          userId: 'usr_owner_main',
          name: agentName,
          description: `Autonomous agent connected to ${currentPlatform.name}. ${currentPlatform.description}`,
          archetype: selectedPlatformId === 'whatsapp' || selectedPlatformId === 'telegram' ? 'SUPPORT' : 'RESEARCHER',
          autonomyMode: hitlEscrow ? 'SEMI_AUTO' : 'FULL_AUTO',
          dailyBudgetUsd: budgetCap,
          systemPrompt,
          model: selectedModel,
          temperature: 0.3,
          status: 'ONLINE',
          framework: `AgentLens / ${currentPlatform.name}`,
          avatarIcon: selectedPlatformId === 'whatsapp' ? 'Zap' : selectedPlatformId === 'telegram' ? 'Brain' : 'Bot',
          tools: [`${selectedPlatformId}_send_message`, `${selectedPlatformId}_read_webhook`, 'ast_pii_sanitize'],
          suggestedPrompts: [
            `Send a test message via ${currentPlatform.name}`,
            `Check incoming webhook status for ${agentName}`,
            `Review Zero-Trust policy logs`,
          ],
          welcomeMessage: `Greetings! I am ${agentName}, integrated with ${currentPlatform.name}. I am active and ready to process traffic.`,
        });
      }

      setBuildAgentModalOpen(false);
      focusNode(aiNodeId);

      addToast({
        title: 'AI Agent Swarm Deployed',
        description: `"${agentName}" wired to ${currentPlatform.name} on the Flow canvas and added to your Agent Fleet!`,
        type: 'success',
      });
    } catch (err: any) {
      console.error('Error deploying agent:', err);
      addToast({
        title: 'Deployment Error',
        description: err.message || 'Failed to deploy agent workflow.',
        type: 'error',
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const isGmail = selectedPlatformId === 'gmail';
  const gmailConnected = isGmailConnected();
  const connectedEmail = getConnectedGmailEmail();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#1c1b18] border border-[#e5e0d5] dark:border-[#33302b] rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Top Header */}
        <div className="p-5 border-b border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5]/90 dark:bg-[#181715]/90 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#c15f3c] to-amber-500 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                  Build AI Agent with Platform Integrations
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#c15f3c]/10 text-[#c15f3c] border border-[#c15f3c]/20">
                  Zero-Trust Enclave
                </span>
              </div>
              <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa]">
                Select a messaging or SaaS platform, customize your agent persona, and wire it to the live workflow graph.
              </p>
            </div>
          </div>

          <button
            onClick={() => setBuildAgentModalOpen(false)}
            className="p-2 rounded-xl text-[#878278] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef] hover:bg-[#e5e0d5]/40 dark:hover:bg-[#33302b] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Two-Column Layout */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Step 1: Select Platform */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef] uppercase tracking-wider font-mono">
                1. Choose Integration Platform API
              </span>
              <span className="text-[11px] text-[#878278] font-mono">
                WhatsApp, Gmail, Telegram & External SaaS
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {PLATFORM_OPTIONS.map((plat) => {
                const Icon = plat.icon;
                const isSelected = selectedPlatformId === plat.id;
                return (
                  <button
                    key={plat.id}
                    type="button"
                    onClick={() => handleSelectPlatform(plat.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#c15f3c]/5 dark:bg-[#c15f3c]/10 border-[#c15f3c] shadow-xs ring-1 ring-[#c15f3c]'
                        : 'bg-white dark:bg-[#211f1c] border-[#e5e0d5] dark:border-[#33302b] hover:border-[#878278]/40 hover:bg-[#faf8f5] dark:hover:bg-[#282622]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${plat.iconColor}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#f4f1ea] dark:bg-[#282622] text-[#5c5850] dark:text-[#b8b4aa] border border-[#e5e0d5] dark:border-[#33302b]">
                          {plat.badge}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef] mb-1">
                        {plat.name}
                      </h4>
                      <p className="text-[11px] text-[#5c5850] dark:text-[#b8b4aa] leading-relaxed line-clamp-2">
                        {plat.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#e5e0d5]/60 dark:border-[#33302b]/60 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-[#878278]">{plat.category}</span>
                      {isSelected ? (
                        <span className="font-bold text-[#c15f3c] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Selected
                        </span>
                      ) : (
                        <span className="text-[#878278] hover:text-[#1f1e1b]">Select →</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Special Banner for Gmail Integration (Full Functionality) */}
          {isGmail && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-[#d97706] dark:text-[#f59e0b] mt-0.5">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                        Google Workspace & Gmail OAuth 2.0
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300">
                        {gmailConnected ? 'OAuth Connected' : 'Google OAuth Required'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5c5850] dark:text-[#d5cfc2] mt-0.5">
                      {gmailConnected
                        ? `Active session for ${connectedEmail}. Your agent swarm is authorized to poll unread threads, compose AI drafts, and manage executive inbox actions.`
                        : 'Connect your personal Google account with one click to authorize live inbox triage, AI drafting, and automated email replies.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {!gmailConnected ? (
                    <button
                      type="button"
                      onClick={handleConnectGmail}
                      className="px-3.5 py-2 rounded-xl bg-[#d97706] hover:bg-[#b45309] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Connect Google Account</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleTestFetchInbox}
                        disabled={testingInbox}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#d97706]" />
                        <span>{testingInbox ? 'Polling...' : 'Test Polling'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleDisconnectGmail}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#211f1c] hover:bg-[#f4f1ea] dark:hover:bg-[#282622] border border-[#e5e0d5] dark:border-[#33302b] text-[11px] font-bold text-[#5c5850] dark:text-[#b8b4aa] transition-colors cursor-pointer"
                      >
                        Disconnect
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {inboxTestResult && (
                <div className="px-3 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center gap-2 text-xs font-mono text-amber-900 dark:text-amber-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span>{inboxTestResult}</span>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Agent Configuration & System Instructions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-[#e5e0d5] dark:border-[#33302b]">
            {/* Left: Identity & Instructions */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef] uppercase tracking-wider font-mono block">
                2. Agent Identity & Intelligence
              </span>

              <div>
                <label className="block text-[11px] font-bold text-[#878278] dark:text-[#7d7970] uppercase tracking-wider mb-1.5 font-mono">
                  Agent Fleet Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    className="w-full px-3 py-2 pl-9 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-none focus:ring-1 focus:ring-[#c15f3c]"
                    placeholder="e.g. WhatsApp-Support-Agent"
                  />
                  <Bot className="w-4 h-4 text-[#878278] absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#878278] dark:text-[#7d7970] uppercase tracking-wider mb-1.5 font-mono">
                  Underlying AI Reasoning Engine
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] text-xs font-semibold text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-none focus:ring-1 focus:ring-[#c15f3c] cursor-pointer"
                >
                  <option value="gemini-3.8-flash">Google Gemini 3.8 Flash ($0.075 / 1M • Sub-second streaming)</option>
                  <option value="gemini-3.1-pro-preview">Google Gemini 3.1 Pro ($1.25 / 1M • Advanced reasoning)</option>
                  <option value="claude-3.5-sonnet">Claude 3.5 Sonnet ($3.00 / 1M • Advanced logic & code)</option>
                  <option value="gpt-4o">GPT-4o Omnimodal ($2.50 / 1M • Multimodal tasks)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-[#878278] dark:text-[#7d7970] uppercase tracking-wider font-mono">
                    System Instructions & Persona
                  </label>
                  <span className="text-[10px] text-[#878278] font-mono">
                    {systemPrompt.length} chars
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] text-xs text-[#1f1e1b] dark:text-[#f5f3ef] font-mono leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-[#c15f3c]"
                  placeholder="Define your agent's behavior, tone, constraints, and operational goals..."
                />
              </div>

              {/* Security & Governance Controls */}
              <div className="p-3.5 rounded-xl bg-[#faf8f5] dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                      AST Zero-Trust PII Redaction
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={piiRedaction}
                    onChange={(e) => setPiiRedaction(e.target.checked)}
                    className="accent-[#c15f3c] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                      Enforce FIDO2 HITL Approval
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={hitlEscrow}
                    onChange={(e) => setHitlEscrow(e.target.checked)}
                    className="accent-[#c15f3c] cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Right: Platform-Specific Configuration Fields */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef] uppercase tracking-wider font-mono block">
                3. {currentPlatform.name} API Parameters
              </span>

              <div className="space-y-3">
                {currentPlatform.fields.map((f) => (
                  <div key={f.id}>
                    <label className="block text-[11px] font-bold text-[#878278] dark:text-[#7d7970] uppercase tracking-wider mb-1 font-mono">
                      {f.label}
                    </label>
                    <input
                      type={f.type || 'text'}
                      value={fieldValues[f.id] || ''}
                      onChange={(e) => handleFieldChange(f.id, e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full px-3 py-2 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] text-xs font-mono text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-none focus:ring-1 focus:ring-[#c15f3c]"
                    />
                  </div>
                ))}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-[#878278] dark:text-[#7d7970] uppercase tracking-wider font-mono">
                      Daily Virtual Token Budget Cap ($ USD)
                    </label>
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      ${budgetCap.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={budgetCap}
                    onChange={(e) => setBudgetCap(Number(e.target.value))}
                    className="w-full accent-[#c15f3c] cursor-pointer"
                  />
                </div>
              </div>

              {/* Topology Preview Box */}
              <div className="p-3 rounded-xl bg-[#f4f1ea] dark:bg-[#151412] border border-[#e5e0d5] dark:border-[#33302b] text-[11px] font-mono text-[#5c5850] dark:text-[#b8b4aa] space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#878278] block">
                  Generated Swarm Architecture:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-500/20">
                    [1] {currentPlatform.name} Ingress
                  </span>
                  <span>→</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold border border-amber-500/20">
                    [2] AST Zero-Trust
                  </span>
                  <span>→</span>
                  <span className="px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-700 dark:text-violet-400 font-bold border border-violet-500/20">
                    [3] {selectedModel}
                  </span>
                  <span>→</span>
                  <span className="px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-700 dark:text-orange-400 font-bold border border-orange-500/20">
                    [4] API Dispatcher
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="p-4 border-t border-[#e5e0d5] dark:border-[#33302b] bg-[#faf8f5]/90 dark:bg-[#181715]/90 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2 text-xs text-[#878278] font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Hardware Enclave Attested • Virtual Proxy Key Escrow</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setBuildAgentModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-[#e5e0d5] dark:border-[#33302b] text-xs font-semibold text-[#5c5850] dark:text-[#b8b4aa] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef] transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleDeployAgent}
              disabled={isDeploying}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-[#c15f3c] hover:from-amber-700 hover:to-[#b05230] text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isDeploying ? 'Deploying Swarm...' : `Deploy ${currentPlatform.name} Agent to Canvas`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
