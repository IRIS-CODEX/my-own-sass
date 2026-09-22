import { create } from 'zustand';
import {
  WorkflowNode,
  WorkflowEdge,
  WorkflowPreset,
  WorkflowLogEntry,
  ExecutionPacket,
  AIBuildAction,
  WorkflowAgentMessage,
} from '../types/workflow';
import { WORKFLOW_PRESETS } from '../data/workflowPresets';
import { useGitHubStore } from './useGitHubStore';

interface WorkflowState {
  presets: WorkflowPreset[];
  activePresetId: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  
  // Canvas viewport
  zoom: number;
  panX: number;
  panY: number;
  isPanning: boolean;
  
  // Simulation / Execution
  executionState: 'idle' | 'running' | 'paused' | 'intercepted';
  currentExecutionStep: number;
  activePackets: ExecutionPacket[];
  logs: WorkflowLogEntry[];
  
  // UI Panels & Modals
  inspectorOpen: boolean;
  logsDrawerOpen: boolean;
  addNodeModalOpen: boolean;
  buildAgentModalOpen: boolean;
  selectedCategoryFilter: string;

  // AI Agent Builder Sidebar State
  agentSidebarOpen: boolean;
  agentSidebarTab: 'chat' | 'builds' | 'fleet';
  selectedAgentId: string;
  agentMessages: WorkflowAgentMessage[];
  aiBuildHistory: AIBuildAction[];
  isAgentThinking: boolean;
  agentThinkingStep: string;

  // Actions
  loadPreset: (presetId: string) => void;
  selectNode: (nodeId: string | null) => void;
  selectEdge: (edgeId: string | null) => void;
  updateNodePosition: (nodeId: string, x: number, y: number) => void;
  updateNodeConfig: (nodeId: string, config: Record<string, any>) => void;
  addNode: (node: Omit<WorkflowNode, 'id'>) => void;
  deleteNode: (nodeId: string) => void;
  addEdge: (sourceNodeId: string, sourcePortId: string, targetNodeId: string, targetPortId: string) => void;
  deleteEdge: (edgeId: string) => void;
  
  // Simulation
  runSimulation: () => void;
  stepSimulation: () => void;
  pauseSimulation: () => void;
  resetSimulation: () => void;
  resolveHITLApproval: (nodeId: string, approved: boolean) => void;
  
  // Canvas Nav
  setZoom: (zoom: number) => void;
  setPan: (panX: number, panY: number) => void;
  resetView: () => void;
  focusNode: (nodeId: string) => void;
  
  // Modal toggles & Agent Sidebar
  setInspectorOpen: (open: boolean) => void;
  setLogsDrawerOpen: (open: boolean) => void;
  setAddNodeModalOpen: (open: boolean) => void;
  setBuildAgentModalOpen: (open: boolean) => void;
  setSelectedCategoryFilter: (cat: string) => void;
  clearLogs: () => void;

  setAgentSidebarOpen: (open: boolean) => void;
  setAgentSidebarTab: (tab: 'chat' | 'builds' | 'fleet') => void;
  setSelectedAgentId: (id: string) => void;
  sendWorkflowAgentMessage: (content: string, agentName?: string) => Promise<void>;
  clearAgentMessages: () => void;
  revertBuildAction: (actionId: string) => void;
}

const initialPreset = WORKFLOW_PRESETS[0];

const INITIAL_AGENT_MESSAGES: WorkflowAgentMessage[] = [
  {
    id: 'msg-welcome',
    sender: 'agent',
    agentId: 'archon-workflow',
    agentName: 'Archon (Workflow Architect)',
    timestamp: new Date().toISOString(),
    content: `I am your workflow co-pilot. I can architect, wire, and modify your agent graph in real-time. Describe what you want to build or select a quick starter below.`,
    suggestedPrompts: [
      'Build WhatsApp AI Agent',
      'Build Gmail Manager Agent',
      'Add Gemini 2.0 Flash Node',
      'Add AST Zero-Trust Policy Gate',
    ],
  },
];

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  presets: WORKFLOW_PRESETS,
  activePresetId: initialPreset.id,
  nodes: JSON.parse(JSON.stringify(initialPreset.nodes)),
  edges: JSON.parse(JSON.stringify(initialPreset.edges)),
  selectedNodeId: initialPreset.nodes[0]?.id || null,
  selectedEdgeId: null,

  zoom: 1.0,
  panX: 40,
  panY: 40,
  isPanning: false,

  executionState: 'idle',
  currentExecutionStep: 0,
  activePackets: [],
  logs: [
    {
      id: 'log-init-1',
      timestamp: new Date().toISOString(),
      nodeId: 'node_trigger_user',
      nodeName: 'Client Ingress & User Prompt',
      level: 'INFO',
      message: 'Workflow canvas initialized. Zero-Trust Nitro Enclave proxy verified.',
      latencyMs: 1.2,
    },
    {
      id: 'log-init-2',
      timestamp: new Date().toISOString(),
      nodeId: 'node_key_escrow',
      nodeName: 'Virtual Key Escrow & Token Minter',
      level: 'SUCCESS',
      message: 'Active Virtual Proxy Key (al_live_sec_8849) active with $20.00 budget cap and 300s TTL.',
      latencyMs: 0.4,
    },
  ],

  inspectorOpen: false,
  logsDrawerOpen: false,
  addNodeModalOpen: false,
  buildAgentModalOpen: false,
  selectedCategoryFilter: 'ALL',

  // AI Agent Sidebar Initial State
  agentSidebarOpen: true,
  agentSidebarTab: 'chat',
  selectedAgentId: 'archon-workflow',
  agentMessages: INITIAL_AGENT_MESSAGES,
  aiBuildHistory: [],
  isAgentThinking: false,
  agentThinkingStep: '',

  loadPreset: (presetId: string) => {
    const preset = get().presets.find((p) => p.id === presetId);
    if (!preset) return;
    set({
      activePresetId: preset.id,
      nodes: JSON.parse(JSON.stringify(preset.nodes)),
      edges: JSON.parse(JSON.stringify(preset.edges)),
      selectedNodeId: preset.nodes[0]?.id || null,
      selectedEdgeId: null,
      executionState: 'idle',
      currentExecutionStep: 0,
      activePackets: [],
      panX: 40,
      panY: 40,
      zoom: 1.0,
      logs: [
        {
          id: `log-switch-${Date.now()}`,
          timestamp: new Date().toISOString(),
          nodeId: preset.nodes[0]?.id || 'root',
          nodeName: preset.name,
          level: 'INFO',
          message: `Loaded workflow template "${preset.name}". Ready for live graph execution.`,
        },
      ],
    });
  },

  selectNode: (nodeId: string | null) => {
    set({ selectedNodeId: nodeId, selectedEdgeId: null, inspectorOpen: !!nodeId });
  },

  selectEdge: (edgeId: string | null) => {
    set({ selectedEdgeId: edgeId, selectedNodeId: null });
  },

  updateNodePosition: (nodeId: string, x: number, y: number) => {
    set((state) => ({
      nodes: state.nodes.map((node) => (node.id === nodeId ? { ...node, position: { x, y } } : node)),
    }));
  },

  updateNodeConfig: (nodeId: string, config: Record<string, any>) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? { ...node, config: { ...node.config, ...config } } : node
      ),
    }));
  },

  addNode: (newNodeData) => {
    const id = `node_custom_${Date.now()}`;
    const newNode: WorkflowNode = {
      ...newNodeData,
      id,
    };
    set((state) => ({
      nodes: [...state.nodes, newNode],
      selectedNodeId: id,
      addNodeModalOpen: false,
      logs: [
        ...state.logs,
        {
          id: `log-add-${Date.now()}`,
          timestamp: new Date().toISOString(),
          nodeId: id,
          nodeName: newNode.name,
          level: 'INFO',
          message: `Added new node "${newNode.name}" to canvas.`,
        },
      ],
    }));
  },

  deleteNode: (nodeId: string) => {
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter((e) => e.sourceNodeId !== nodeId && e.targetNodeId !== nodeId),
      selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
    }));
  },

  addEdge: (sourceNodeId, sourcePortId, targetNodeId, targetPortId) => {
    const edgeId = `edge_${sourceNodeId}_${targetNodeId}_${Date.now()}`;
    const newEdge: WorkflowEdge = {
      id: edgeId,
      sourceNodeId,
      sourcePortId,
      targetNodeId,
      targetPortId,
      animated: true,
      status: 'transmitting',
      dataType: 'data',
    };
    set((state) => ({
      edges: [...state.edges, newEdge],
    }));
  },

  deleteEdge: (edgeId: string) => {
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== edgeId),
      selectedEdgeId: state.selectedEdgeId === edgeId ? null : state.selectedEdgeId,
    }));
  },

  runSimulation: () => {
    const state = get();
    if (state.executionState === 'running') return;

    set({ executionState: 'running', currentExecutionStep: 0 });

    const nodes = state.nodes;
    let step = 0;

    const interval = setInterval(() => {
      const currentStep = get().currentExecutionStep;
      if (currentStep >= nodes.length) {
        clearInterval(interval);
        set({ executionState: 'idle' });
        return;
      }

      const activeNode = nodes[currentStep];
      if (!activeNode) {
        clearInterval(interval);
        set({ executionState: 'idle' });
        return;
      }

      // Check if node is intercepted HITL
      if (activeNode.status === 'intercepted' || activeNode.config.fido2Required) {
        clearInterval(interval);
        set({
          executionState: 'intercepted',
          selectedNodeId: activeNode.id,
          inspectorOpen: true,
          logs: [
            ...get().logs,
            {
              id: `log-hitl-${Date.now()}`,
              timestamp: new Date().toISOString(),
              nodeId: activeNode.id,
              nodeName: activeNode.name,
              level: 'INTERCEPT',
              message: `🚨 ZERO-TRUST INTERCEPTION: ${activeNode.description} requires Human FIDO2 Multi-Sig approval.`,
            },
          ],
        });
        return;
      }

      // Create animated packet on connected edges
      const outgoingEdges = state.edges.filter((e) => e.sourceNodeId === activeNode.id);
      const newPackets: ExecutionPacket[] = outgoingEdges.map((e) => ({
        id: `pkt_${e.id}_${Date.now()}`,
        edgeId: e.id,
        sourceNodeId: e.sourceNodeId,
        targetNodeId: e.targetNodeId,
        progress: 0,
        payloadPreview: activeNode.livePayload?.statusSummary || 'Data transmitted',
        dataType: e.dataType || 'data',
      }));

      set((s) => ({
        currentExecutionStep: currentStep + 1,
        activePackets: newPackets,
        logs: [
          ...s.logs,
          {
            id: `log-step-${Date.now()}`,
            timestamp: new Date().toISOString(),
            nodeId: activeNode.id,
            nodeName: activeNode.name,
            level: 'SUCCESS',
            message: `Executed "${activeNode.name}" -> ${activeNode.livePayload?.statusSummary || 'OK'}`,
            latencyMs: activeNode.metrics.latencyMs,
          },
        ],
      }));

      step++;
    }, 1200);
  },

  stepSimulation: () => {
    const { nodes, currentExecutionStep } = get();
    if (currentExecutionStep >= nodes.length) {
      set({ currentExecutionStep: 0, executionState: 'idle' });
      return;
    }
    const node = nodes[currentExecutionStep];
    set((s) => ({
      currentExecutionStep: s.currentExecutionStep + 1,
      selectedNodeId: node.id,
      logs: [
        ...s.logs,
        {
          id: `log-step-${Date.now()}`,
          timestamp: new Date().toISOString(),
          nodeId: node.id,
          nodeName: node.name,
          level: 'INFO',
          message: `Stepped execution to [${node.name}]: ${node.description}`,
          latencyMs: node.metrics.latencyMs,
        },
      ],
    }));
  },

  pauseSimulation: () => {
    set({ executionState: 'paused' });
  },

  resetSimulation: () => {
    set({
      executionState: 'idle',
      currentExecutionStep: 0,
      activePackets: [],
    });
  },

  resolveHITLApproval: (nodeId: string, approved: boolean) => {
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              status: approved ? 'success' : 'error',
              livePayload: {
                ...n.livePayload,
                statusSummary: approved ? '✓ FIDO2 Approved by Operator' : '✗ Rejected by Operator',
              },
            }
          : n
      ),
      executionState: 'idle',
      logs: [
        ...state.logs,
        {
          id: `log-hitl-res-${Date.now()}`,
          timestamp: new Date().toISOString(),
          nodeId,
          nodeName: state.nodes.find((n) => n.id === nodeId)?.name || 'HITL Gate',
          level: approved ? 'SUCCESS' : 'ERROR',
          message: approved
            ? 'Operator authenticated via FIDO2 WebAuthn. Escrow released.'
            : 'Operator rejected execution. Transaction aborted.',
        },
      ],
    }));
  },

  setZoom: (zoom: number) => set({ zoom: Math.min(Math.max(zoom, 0.4), 2.0) }),
  setPan: (panX: number, panY: number) => set({ panX, panY }),
  resetView: () => set({ zoom: 1.0, panX: 40, panY: 40 }),

  focusNode: (nodeId: string) => {
    const node = get().nodes.find((n) => n.id === nodeId);
    if (!node) return;
    // Calculate pan to bring node near center
    const targetPanX = Math.max(-2000, Math.min(200, 350 - node.position.x));
    const targetPanY = Math.max(-2000, Math.min(200, 250 - node.position.y));
    set({
      selectedNodeId: nodeId,
      selectedEdgeId: null,
      inspectorOpen: true,
      panX: targetPanX,
      panY: targetPanY,
    });
  },

  setInspectorOpen: (open: boolean) => set({ inspectorOpen: open }),
  setLogsDrawerOpen: (open: boolean) => set({ logsDrawerOpen: open }),
  setAddNodeModalOpen: (open: boolean) => set({ addNodeModalOpen: open }),
  setBuildAgentModalOpen: (open: boolean) => set({ buildAgentModalOpen: open }),
  setSelectedCategoryFilter: (cat: string) => set({ selectedCategoryFilter: cat }),
  clearLogs: () => set({ logs: [] }),

  setAgentSidebarOpen: (open: boolean) => set({ agentSidebarOpen: open }),
  setAgentSidebarTab: (tab) => set({ agentSidebarTab: tab }),
  setSelectedAgentId: (id) => set({ selectedAgentId: id }),

  clearAgentMessages: () => {
    set({ agentMessages: INITIAL_AGENT_MESSAGES });
  },

  revertBuildAction: (actionId: string) => {
    const action = get().aiBuildHistory.find((a) => a.id === actionId);
    if (!action) return;

    if (action.actionType === 'ADD_NODE' && action.nodeIds?.length) {
      const idToRemove = action.nodeIds[0];
      get().deleteNode(idToRemove);
    }

    set((state) => ({
      aiBuildHistory: state.aiBuildHistory.filter((a) => a.id !== actionId),
      logs: [
        ...state.logs,
        {
          id: `log-revert-${Date.now()}`,
          timestamp: new Date().toISOString(),
          nodeId: 'builder',
          nodeName: 'AI Builder',
          level: 'WARN',
          message: `Reverted AI build action "${action.title}".`,
        },
      ],
    }));
  },

  sendWorkflowAgentMessage: async (content: string, customAgentName?: string) => {
    const userMsgId = `usr-${Date.now()}`;
    const userMsg: WorkflowAgentMessage = {
      id: userMsgId,
      sender: 'user',
      timestamp: new Date().toISOString(),
      content,
    };

    set((state) => ({
      agentMessages: [...state.agentMessages, userMsg],
      isAgentThinking: true,
      agentThinkingStep: 'Analyzing workflow graph topology & requirements...',
    }));

    // Simulate Agent reasoning & action delay
    await new Promise((r) => setTimeout(r, 600));

    set({ agentThinkingStep: 'Determining optimal integration nodes, wires, and security policies...' });
    await new Promise((r) => setTimeout(r, 600));

    const lower = content.toLowerCase();
    const actionsTaken: AIBuildAction[] = [];
    let responseText = '';
    let thoughtText = '';
    const suggestedPrompts: string[] = [];

    const state = get();
    const currentNodes = [...state.nodes];
    const currentEdges = [...state.edges];

    // Find the rightmost node to place new nodes nicely
    let maxX = 80;
    let maxY = 100;
    currentNodes.forEach((n) => {
      if (n.position.x > maxX) maxX = n.position.x;
      if (n.position.y > maxY) maxY = n.position.y;
    });

    // 0A. BUILD WHATSAPP AI AGENT SWARM
    if (lower.includes('whatsapp')) {
      const ts = Date.now();
      const trigId = `node_trig_wa_${ts}`;
      const policyId = `node_policy_wa_${ts}`;
      const aiId = `node_ai_wa_${ts}`;
      const dispatchId = `node_dispatch_wa_${ts}`;

      const waTrigNode: WorkflowNode = {
        id: trigId,
        name: 'WhatsApp Cloud Ingress',
        type: 'trigger',
        platform: 'whatsapp',
        category: 'Ingress & Triggers',
        position: { x: maxX + 100, y: 120 },
        status: 'idle',
        icon: 'MessageCircle',
        description: 'Receives customer messages and webhook verification events from Meta Cloud API.',
        inputs: [],
        outputs: [{ id: 'out_wa_msg', name: 'customer_message', type: 'data', description: 'Incoming customer text and metadata' }],
        config: {
          phoneId: '104829104829104',
          verifyToken: 'agentlens_wa_secret_token_99',
          recipientPhone: '+1 555 019 2834',
        },
        metrics: { latencyMs: 1.2, tokens: 0, costUsd: 0, executions: 0, errorRate: 0 },
        livePayload: {
          output: { sender: '+15550192834', message: 'Hello! Can you help me check my order status?', timestamp: new Date().toISOString() },
          statusSummary: 'Webhook Handshake Verified',
        },
      };

      const waPolicyNode: WorkflowNode = {
        id: policyId,
        name: 'AST Zero-Trust & PII Filter',
        type: 'policy_gate',
        platform: 'aws_nitro',
        category: 'Zero-Trust Security',
        position: { x: maxX + 380, y: 90 },
        status: 'idle',
        icon: 'ShieldCheck',
        description: 'Redacts customer credit cards/SSNs and scans against prompt injection jailbreaks.',
        inputs: [{ id: 'in_raw', name: 'customer_message', type: 'data' }],
        outputs: [{ id: 'out_sanitized', name: 'sanitized_msg', type: 'data' }],
        config: { policyRuleId: 'SEC-WHATSAPP-01', piiRedaction: true, fido2Required: false },
        metrics: { latencyMs: 0.8, tokens: 60, costUsd: 0.0001, executions: 0, errorRate: 0 },
      };

      const waAiNode: WorkflowNode = {
        id: aiId,
        name: 'WhatsApp Support Agent',
        type: 'ai_model',
        platform: 'gemini',
        category: 'AI Models',
        position: { x: maxX + 660, y: 120 },
        status: 'idle',
        icon: 'Sparkles',
        description: 'Gemini 2.0 Flash customer support reasoning with sub-second response streaming.',
        inputs: [
          { id: 'in_context', name: 'sanitized_msg', type: 'data' },
          { id: 'in_key', name: 'Virtual Proxy Key', type: 'token' },
        ],
        outputs: [
          { id: 'out_reply', name: 'support_reply', type: 'data' },
          { id: 'out_sig', name: 'dispatch_signal', type: 'signal' },
        ],
        config: {
          model: 'gemini-2.0-flash',
          systemPrompt: 'You are an autonomous WhatsApp customer support agent. Answer customer inquiries politely, concisely, and helpfully. Keep messages under 300 characters when possible.',
          temperature: 0.3,
          budgetCapUsd: 25.0,
        },
        metrics: { latencyMs: 290, tokens: 940, costUsd: 0.0005, executions: 0, errorRate: 0 },
        credentials: { type: 'Meta Cloud API Proxy Key', status: 'CONNECTED', keyMask: 'EAAGm...9281' },
      };

      const waDispatchNode: WorkflowNode = {
        id: dispatchId,
        name: 'WhatsApp Cloud Dispatcher',
        type: 'integration',
        platform: 'whatsapp',
        category: 'Integrations',
        position: { x: maxX + 940, y: 130 },
        status: 'idle',
        icon: 'MessageCircle',
        description: 'Sends authorized interactive message replies back to the customer on WhatsApp.',
        inputs: [
          { id: 'in_reply', name: 'support_reply', type: 'data' },
          { id: 'in_sig', name: 'dispatch_signal', type: 'signal' },
        ],
        outputs: [{ id: 'out_receipt', name: 'meta_receipt', type: 'data' }],
        config: { phoneId: '104829104829104', messagingType: 'CUSTOMER_SERVICE' },
        metrics: { latencyMs: 180, tokens: 0, costUsd: 0.001, executions: 0, errorRate: 0 },
      };

      const e1: WorkflowEdge = { id: `e_${trigId}_${policyId}`, sourceNodeId: trigId, sourcePortId: 'out_wa_msg', targetNodeId: policyId, targetPortId: 'in_raw', animated: true, status: 'idle', dataType: 'data' };
      const e2: WorkflowEdge = { id: `e_${policyId}_${aiId}`, sourceNodeId: policyId, sourcePortId: 'out_sanitized', targetNodeId: aiId, targetPortId: 'in_context', animated: true, status: 'idle', dataType: 'data' };
      const e3: WorkflowEdge = { id: `e_${aiId}_${dispatchId}`, sourceNodeId: aiId, sourcePortId: 'out_reply', targetNodeId: dispatchId, targetPortId: 'in_reply', animated: true, status: 'idle', dataType: 'data' };

      set((s) => ({
        nodes: [...s.nodes, waTrigNode, waPolicyNode, waAiNode, waDispatchNode],
        edges: [...s.edges, e1, e2, e3],
        selectedNodeId: aiId,
        inspectorOpen: true,
      }));

      const action: AIBuildAction = {
        id: `act-${ts}-wa`,
        timestamp: new Date().toISOString(),
        agentId: state.selectedAgentId,
        agentName: customAgentName || 'Archon (Workflow Architect)',
        actionType: 'ADD_NODE',
        title: 'Provisioned WhatsApp Autonomous Agent Swarm',
        description: 'Built and connected WhatsApp Cloud Ingress -> AST Zero-Trust -> Gemini 2.0 Flash -> WhatsApp Cloud Dispatcher.',
        nodeIds: [trigId, policyId, aiId, dispatchId],
        edgeIds: [e1.id, e2.id, e3.id],
        diffSummary: '+ 4 Nodes (WhatsApp Swarm) & 3 Wires',
      };
      actionsTaken.push(action);

      thoughtText = 'Constructed complete WhatsApp Cloud API agent swarm with ingress webhook, AST PII redaction, Gemini 2.0 Flash support engine, and Meta dispatch API.';
      responseText = `📱 **WhatsApp AI Agent Swarm Deployed!**\n\nI have built and wired a complete 4-node WhatsApp integration pipeline:\n1. **WhatsApp Cloud Ingress**: Webhook listener for incoming customer chats.\n2. **AST Zero-Trust Guard**: Sanitizes customer inputs and redacts sensitive PII.\n3. **WhatsApp Support Agent**: Gemini 2.0 Flash reasoning core with sub-second streaming.\n4. **WhatsApp Cloud Dispatcher**: Sends authorized replies to Meta's servers under proxy key governance.`;
      suggestedPrompts.push('🚀 Run Simulation', '✉️ Build Gmail Manager Agent', '✈️ Build Telegram Bot Agent');
    }
    // 0B. BUILD GMAIL AI AGENT SWARM
    else if (lower.includes('gmail') || lower.includes('email') || lower.includes('inbox')) {
      const ts = Date.now();
      const trigId = `node_trig_gmail_${ts}`;
      const policyId = `node_policy_gmail_${ts}`;
      const aiId = `node_ai_gmail_${ts}`;
      const dispatchId = `node_dispatch_gmail_${ts}`;

      const gmailTrigNode: WorkflowNode = {
        id: trigId,
        name: 'Gmail Inbox Trigger',
        type: 'trigger',
        platform: 'gmail',
        category: 'Google Workspace',
        position: { x: maxX + 100, y: 120 },
        status: 'idle',
        icon: 'Mail',
        description: 'Polls and receives unread messages and priority email threads via Google OAuth 2.0.',
        inputs: [],
        outputs: [{ id: 'out_thread', name: 'email_thread', type: 'data', description: 'Incoming email thread context' }],
        config: { queryFilter: 'is:unread category:primary', maxResults: 15 },
        metrics: { latencyMs: 240, tokens: 0, costUsd: 0, executions: 0, errorRate: 0 },
        livePayload: {
          output: { subject: 'Urgent: Q3 Vendor Agreement Revision', from: 'procurement@acme.corp', snippet: 'Please review the updated indemnification clause attached...' },
          statusSummary: 'OAuth Scope Authorized',
        },
      };

      const gmailPolicyNode: WorkflowNode = {
        id: policyId,
        name: 'AST Email Guard & Privacy Shield',
        type: 'policy_gate',
        platform: 'aws_nitro',
        category: 'Zero-Trust Security',
        position: { x: maxX + 380, y: 90 },
        status: 'idle',
        icon: 'ShieldCheck',
        description: 'Strips malicious phishing payloads, prompt injection markers, and protects personal contact info.',
        inputs: [{ id: 'in_raw', name: 'email_thread', type: 'data' }],
        outputs: [{ id: 'out_sanitized', name: 'sanitized_thread', type: 'data' }],
        config: { policyRuleId: 'SEC-GMAIL-01', piiRedaction: true, fido2Required: true },
        metrics: { latencyMs: 0.9, tokens: 80, costUsd: 0.0001, executions: 0, errorRate: 0 },
      };

      const gmailAiNode: WorkflowNode = {
        id: aiId,
        name: 'Executive Gmail Inbox Pilot',
        type: 'ai_model',
        platform: 'gemini',
        category: 'AI Models',
        position: { x: maxX + 660, y: 120 },
        status: 'idle',
        icon: 'Sparkles',
        description: 'Autonomous copilot that categorizes emails, summarizes threads, and writes smart drafts.',
        inputs: [
          { id: 'in_context', name: 'sanitized_thread', type: 'data' },
          { id: 'in_key', name: 'Virtual Proxy Key', type: 'token' },
        ],
        outputs: [
          { id: 'out_draft', name: 'email_draft', type: 'data' },
          { id: 'out_action', name: 'triage_signal', type: 'signal' },
        ],
        config: {
          model: 'gemini-2.0-flash',
          systemPrompt: 'You are the Executive Gmail Inbox Pilot. Summarize unread emails, prioritize inquiries, and compose professional, courteous email replies under strict Zero-Trust approval.',
          temperature: 0.2,
          budgetCapUsd: 30.0,
        },
        metrics: { latencyMs: 320, tokens: 1200, costUsd: 0.0008, executions: 0, errorRate: 0 },
        credentials: { type: 'Google OAuth 2.0 / Gmail API', status: 'CONNECTED', keyMask: 'google_oauth_session' },
      };

      const gmailDispatchNode: WorkflowNode = {
        id: dispatchId,
        name: 'Gmail Draft & Send API',
        type: 'integration',
        platform: 'gmail',
        category: 'Google Workspace',
        position: { x: maxX + 940, y: 130 },
        status: 'intercepted',
        icon: 'Mail',
        description: 'Creates email drafts and dispatches authorized replies through your personal Gmail account.',
        inputs: [
          { id: 'in_draft', name: 'email_draft', type: 'data' },
          { id: 'in_action', name: 'triage_signal', type: 'signal' },
        ],
        outputs: [{ id: 'out_receipt', name: 'send_receipt', type: 'data' }],
        config: { autoSend: false, requireConfirmation: true, draftMode: 'CREATE_DRAFT_AND_NOTIFY' },
        metrics: { latencyMs: 290, tokens: 0, costUsd: 0.0, executions: 0, errorRate: 0 },
      };

      const e1: WorkflowEdge = { id: `e_${trigId}_${policyId}`, sourceNodeId: trigId, sourcePortId: 'out_thread', targetNodeId: policyId, targetPortId: 'in_raw', animated: true, status: 'idle', dataType: 'data' };
      const e2: WorkflowEdge = { id: `e_${policyId}_${aiId}`, sourceNodeId: policyId, sourcePortId: 'out_sanitized', targetNodeId: aiId, targetPortId: 'in_context', animated: true, status: 'idle', dataType: 'data' };
      const e3: WorkflowEdge = { id: `e_${aiId}_${dispatchId}`, sourceNodeId: aiId, sourcePortId: 'out_draft', targetNodeId: dispatchId, targetPortId: 'in_draft', animated: true, status: 'idle', dataType: 'data' };

      set((s) => ({
        nodes: [...s.nodes, gmailTrigNode, gmailPolicyNode, gmailAiNode, gmailDispatchNode],
        edges: [...s.edges, e1, e2, e3],
        selectedNodeId: aiId,
        inspectorOpen: true,
      }));

      const action: AIBuildAction = {
        id: `act-${ts}-gmail`,
        timestamp: new Date().toISOString(),
        agentId: state.selectedAgentId,
        agentName: customAgentName || 'Archon (Workflow Architect)',
        actionType: 'ADD_NODE',
        title: 'Provisioned Executive Gmail Manager Agent',
        description: 'Built complete Gmail pipeline: OAuth Ingress -> AST Guard -> Executive Inbox Pilot -> Gmail Draft/Send API.',
        nodeIds: [trigId, policyId, aiId, dispatchId],
        edgeIds: [e1.id, e2.id, e3.id],
        diffSummary: '+ 4 Nodes (Gmail Swarm) & 3 Wires',
      };
      actionsTaken.push(action);

      thoughtText = 'Configured Gmail autonomous agent swarm with Google Workspace OAuth 2.0 integration, AST privacy gate, and HITL email drafting.';
      responseText = `✉️ **Executive Gmail AI Agent Swarm Deployed!**\n\nI have wired your personal Gmail integration flow:\n1. **Gmail Inbox Trigger**: Monitors unread messages via Google OAuth 2.0.\n2. **AST Email Guard**: Scans for phishing risks and redacts PII.\n3. **Executive Gmail Inbox Pilot**: Gemini 2.0 Flash reasoning agent that prioritizes emails and drafts replies.\n4. **Gmail Draft & Send API**: Held in HITL approval escrow so no external emails send without your sign-off.\n\n💡 *Tip: You can click the Gmail node in the inspector or use the "Open Live Gmail AI Hub" button to test reading live inbox messages and composing drafts!*`;
      suggestedPrompts.push('🚀 Run Simulation', '📱 Build WhatsApp AI Agent', '✈️ Build Telegram Bot Agent');
    }
    // 0C. BUILD TELEGRAM BOT AGENT SWARM
    else if (lower.includes('telegram')) {
      const ts = Date.now();
      const trigId = `node_trig_tg_${ts}`;
      const policyId = `node_policy_tg_${ts}`;
      const aiId = `node_ai_tg_${ts}`;
      const dispatchId = `node_dispatch_tg_${ts}`;

      const tgTrigNode: WorkflowNode = {
        id: trigId,
        name: 'Telegram Bot Webhook',
        type: 'trigger',
        platform: 'telegram',
        category: 'Ingress & Triggers',
        position: { x: maxX + 100, y: 120 },
        status: 'idle',
        icon: 'Send',
        description: 'Listens for /commands, group mentions, and direct messages via Telegram Bot API.',
        inputs: [],
        outputs: [{ id: 'out_tg_update', name: 'telegram_update', type: 'data', description: 'Incoming update with chat_id and text' }],
        config: { botToken: '7198234102:AAFtX_LiveMasked', registeredCommands: '/start, /help, /triage, /alert' },
        metrics: { latencyMs: 1.4, tokens: 0, costUsd: 0, executions: 0, errorRate: 0 },
        livePayload: {
          output: { update_id: 881923, message: { text: '/triage check server latency', from: { username: 'alex_ops' } } },
          statusSummary: 'Bot Polling Active',
        },
      };

      const tgPolicyNode: WorkflowNode = {
        id: policyId,
        name: 'AST Telegram Guard',
        type: 'policy_gate',
        platform: 'aws_nitro',
        category: 'Zero-Trust Security',
        position: { x: maxX + 380, y: 90 },
        status: 'idle',
        icon: 'ShieldCheck',
        description: 'Validates authorized user IDs and blocks injection payloads in group chats.',
        inputs: [{ id: 'in_raw', name: 'telegram_update', type: 'data' }],
        outputs: [{ id: 'out_sanitized', name: 'sanitized_cmd', type: 'data' }],
        config: { policyRuleId: 'SEC-TELEGRAM-01', piiRedaction: true, fido2Required: false },
        metrics: { latencyMs: 0.7, tokens: 70, costUsd: 0.0001, executions: 0, errorRate: 0 },
      };

      const tgAiNode: WorkflowNode = {
        id: aiId,
        name: 'Telegram Sentinel Copilot',
        type: 'ai_model',
        platform: 'gemini',
        category: 'AI Models',
        position: { x: maxX + 660, y: 120 },
        status: 'idle',
        icon: 'Sparkles',
        description: 'Gemini 2.0 Flash agent interpreting commands, moderating chats, and compiling summaries.',
        inputs: [
          { id: 'in_context', name: 'sanitized_cmd', type: 'data' },
          { id: 'in_key', name: 'Virtual Proxy Key', type: 'token' },
        ],
        outputs: [
          { id: 'out_msg', name: 'telegram_reply', type: 'data' },
          { id: 'out_sig', name: 'send_signal', type: 'signal' },
        ],
        config: {
          model: 'gemini-2.0-flash',
          systemPrompt: 'You are an intelligent Telegram bot assistant. Respond to user commands (/start, /help, /triage), explain technical operations clearly, and format responses with clean Markdown.',
          temperature: 0.3,
          budgetCapUsd: 20.0,
        },
        metrics: { latencyMs: 280, tokens: 820, costUsd: 0.0004, executions: 0, errorRate: 0 },
        credentials: { type: 'Telegram Bot Token Proxy', status: 'CONNECTED', keyMask: '7198234102:AAFtX...' },
      };

      const tgDispatchNode: WorkflowNode = {
        id: dispatchId,
        name: 'Telegram Bot Send API',
        type: 'integration',
        platform: 'telegram',
        category: 'Integrations',
        position: { x: maxX + 940, y: 130 },
        status: 'idle',
        icon: 'Send',
        description: 'Dispatches authorized Markdown messages and inline button keyboards back to Telegram.',
        inputs: [
          { id: 'in_msg', name: 'telegram_reply', type: 'data' },
          { id: 'in_sig', name: 'send_signal', type: 'signal' },
        ],
        outputs: [{ id: 'out_receipt', name: 'delivery_receipt', type: 'data' }],
        config: { parseMode: 'MarkdownV2', disableWebPagePreview: true },
        metrics: { latencyMs: 140, tokens: 0, costUsd: 0.0, executions: 0, errorRate: 0 },
      };

      const e1: WorkflowEdge = { id: `e_${trigId}_${policyId}`, sourceNodeId: trigId, sourcePortId: 'out_tg_update', targetNodeId: policyId, targetPortId: 'in_raw', animated: true, status: 'idle', dataType: 'data' };
      const e2: WorkflowEdge = { id: `e_${policyId}_${aiId}`, sourceNodeId: policyId, sourcePortId: 'out_sanitized', targetNodeId: aiId, targetPortId: 'in_context', animated: true, status: 'idle', dataType: 'data' };
      const e3: WorkflowEdge = { id: `e_${aiId}_${dispatchId}`, sourceNodeId: aiId, sourcePortId: 'out_msg', targetNodeId: dispatchId, targetPortId: 'in_msg', animated: true, status: 'idle', dataType: 'data' };

      set((s) => ({
        nodes: [...s.nodes, tgTrigNode, tgPolicyNode, tgAiNode, tgDispatchNode],
        edges: [...s.edges, e1, e2, e3],
        selectedNodeId: aiId,
        inspectorOpen: true,
      }));

      const action: AIBuildAction = {
        id: `act-${ts}-tg`,
        timestamp: new Date().toISOString(),
        agentId: state.selectedAgentId,
        agentName: customAgentName || 'Archon (Workflow Architect)',
        actionType: 'ADD_NODE',
        title: 'Provisioned Telegram Bot Swarm',
        description: 'Built and connected Telegram Webhook -> AST Zero-Trust -> Gemini 2.0 Flash -> Telegram Send API.',
        nodeIds: [trigId, policyId, aiId, dispatchId],
        edgeIds: [e1.id, e2.id, e3.id],
        diffSummary: '+ 4 Nodes (Telegram Swarm) & 3 Wires',
      };
      actionsTaken.push(action);

      thoughtText = 'Constructed Telegram Bot API agent swarm with BotFather token proxy, AST validation, and automated Markdown response dispatch.';
      responseText = `✈️ **Telegram Bot Agent Swarm Deployed!**\n\nI have wired your Telegram automation pipeline:\n1. **Telegram Bot Webhook**: Receives commands (/start, /triage) and chat messages.\n2. **AST Telegram Guard**: Restricts commands to authorized admins and sanitizes text.\n3. **Telegram Sentinel Copilot**: Gemini 2.0 Flash reasoning agent.\n4. **Telegram Bot Send API**: Formats and delivers Markdown messages to your target channel.`;
      suggestedPrompts.push('🚀 Run Simulation', '📱 Build WhatsApp AI Agent', '✉️ Build Gmail Manager Agent');
    }
    // 1. ADD GEMINI NODE
    else if (lower.includes('gemini') || lower.includes('ai model') || lower.includes('llm') || lower.includes('reasoning')) {
      const newNodeId = `node_gemini_${Date.now()}`;
      const newNode: WorkflowNode = {
        id: newNodeId,
        name: 'Google Gemini 2.0 Flash',
        type: 'ai_model',
        platform: 'gemini',
        category: 'AI_MODELS',
        position: { x: maxX + 320, y: 120 },
        status: 'idle',
        icon: 'Sparkles',
        description: 'Multimodal generative reasoning with sub-second streaming inference & function calling.',
        inputs: [
          { id: 'in_prompt', name: 'Prompt Context', type: 'data' },
          { id: 'in_key', name: 'Virtual Proxy Key', type: 'token' },
        ],
        outputs: [
          { id: 'out_text', name: 'Generated Markdown', type: 'data' },
          { id: 'out_tool_call', name: 'Tool Directives', type: 'signal' },
        ],
        config: {
          model: 'gemini-2.0-flash',
          temperature: 0.7,
          promptTemplate: 'You are an autonomous operations copilot.',
          piiRedaction: true,
        },
        metrics: {
          latencyMs: 380,
          tokens: 2840,
          costUsd: 0.0014,
          executions: 12,
          errorRate: 0.0,
        },
        credentials: {
          type: 'Gemini API Key Proxy',
          status: 'CONNECTED',
          keyMask: 'AIzaSy...v9Kq',
        },
      };

      // Connect from latest node if possible
      const lastNode = currentNodes[currentNodes.length - 1];
      let newEdge: WorkflowEdge | null = null;
      if (lastNode && lastNode.outputs.length > 0) {
        newEdge = {
          id: `edge_${lastNode.id}_${newNodeId}_${Date.now()}`,
          sourceNodeId: lastNode.id,
          sourcePortId: lastNode.outputs[0].id,
          targetNodeId: newNodeId,
          targetPortId: newNode.inputs[0].id,
          animated: true,
          status: 'idle',
          dataType: 'data',
        };
      }

      set((s) => ({
        nodes: [...s.nodes, newNode],
        edges: newEdge ? [...s.edges, newEdge] : s.edges,
        selectedNodeId: newNodeId,
        inspectorOpen: true,
      }));

      const action: AIBuildAction = {
        id: `act-${Date.now()}-1`,
        timestamp: new Date().toISOString(),
        agentId: state.selectedAgentId,
        agentName: customAgentName || 'Archon (Workflow Architect)',
        actionType: 'ADD_NODE',
        title: 'Provisioned Google Gemini 2.0 Flash Node',
        description: `Created multimodal LLM node at (x: ${newNode.position.x}, y: ${newNode.position.y}) and connected to ingress bus.`,
        nodeIds: [newNodeId],
        edgeIds: newEdge ? [newEdge.id] : [],
        diffSummary: `+ 1 Node (Gemini 2.0 Flash), ${newEdge ? '+ 1 Wire Connection' : '0 Wires'}`,
      };
      actionsTaken.push(action);

      thoughtText = `Identified request for Gemini/LLM capabilities. Provisioned Gemini 2.0 Flash with automatic AST PII redaction and wired it to upstream ingress.`;
      responseText = `I have added the **Google Gemini 2.0 Flash** node to your canvas and connected it to your active pipeline! The node has been configured with Zero-Trust token proxies and sub-second streaming latency.`;
      suggestedPrompts.push('🎨 Connect Gemini to Imagen 3', '🚀 Run Simulation', '🛡️ Add Policy Gate');
    }
    // 2. ADD IMAGEN 3 NODE
    else if (lower.includes('imagen') || lower.includes('image') || lower.includes('diffusion') || lower.includes('picture')) {
      const newNodeId = `node_imagen_${Date.now()}`;
      const newNode: WorkflowNode = {
        id: newNodeId,
        name: 'Google Imagen 3 Studio',
        type: 'ai_model',
        platform: 'imagen',
        category: 'AI_MODELS',
        position: { x: maxX + 320, y: 140 },
        status: 'idle',
        icon: 'Palette',
        description: 'State-of-the-art visual generation diffusion model with photorealistic fidelity.',
        inputs: [
          { id: 'in_prompt', name: 'Image Prompt', type: 'data' },
          { id: 'in_key', name: 'Virtual Token', type: 'token' },
        ],
        outputs: [
          { id: 'out_image', name: 'Rendered Asset (PNG)', type: 'image' },
          { id: 'out_meta', name: 'EXIF & Seed Metadata', type: 'data' },
        ],
        config: {
          model: 'imagen-3.0-generate-002',
          imageResolution: '1024x1024',
          aspectRatio: '1:1',
        },
        metrics: {
          latencyMs: 1420,
          tokens: 0,
          costUsd: 0.030,
          executions: 4,
          errorRate: 0.0,
        },
      };

      const lastNode = currentNodes[currentNodes.length - 1];
      let newEdge: WorkflowEdge | null = null;
      if (lastNode && lastNode.outputs.length > 0) {
        newEdge = {
          id: `edge_${lastNode.id}_${newNodeId}_${Date.now()}`,
          sourceNodeId: lastNode.id,
          sourcePortId: lastNode.outputs[0].id,
          targetNodeId: newNodeId,
          targetPortId: newNode.inputs[0].id,
          animated: true,
          status: 'idle',
          dataType: 'image',
        };
      }

      set((s) => ({
        nodes: [...s.nodes, newNode],
        edges: newEdge ? [...s.edges, newEdge] : s.edges,
        selectedNodeId: newNodeId,
        inspectorOpen: true,
      }));

      const action: AIBuildAction = {
        id: `act-${Date.now()}-2`,
        timestamp: new Date().toISOString(),
        agentId: state.selectedAgentId,
        agentName: customAgentName || 'Archon (Workflow Architect)',
        actionType: 'ADD_NODE',
        title: 'Provisioned Google Imagen 3 Studio Node',
        description: 'Created 1024x1024 diffusion synthesis node wired for live artifact streaming.',
        nodeIds: [newNodeId],
        edgeIds: newEdge ? [newEdge.id] : [],
        diffSummary: `+ 1 Node (Google Imagen 3), ${newEdge ? '+ 1 Wire Connection' : '0 Wires'}`,
      };
      actionsTaken.push(action);

      thoughtText = `Synthesized visual generation request into an Imagen 3 node with high-fidelity 1024x1024 aspect ratio.`;
      responseText = `I have added the **Google Imagen 3 Studio** diffusion node! You can now generate high-definition visual assets directly within this workflow and inspect them in the live artifact viewer.`;
      suggestedPrompts.push('🚀 Run Simulation', '🛡️ Add HITL Approval Gate', '⚡ Connect to Cloud SQL');
    }
    // 3. ADD STRIPE OR TREASURY NODE
    else if (lower.includes('stripe') || lower.includes('payment') || lower.includes('money') || lower.includes('treasury') || lower.includes('payout')) {
      const newNodeId = `node_stripe_${Date.now()}`;
      const newNode: WorkflowNode = {
        id: newNodeId,
        name: 'Stripe Payout & Treasury Escrow',
        type: 'integration',
        platform: 'stripe',
        category: 'INTEGRATIONS',
        position: { x: maxX + 320, y: 160 },
        status: 'intercepted',
        icon: 'CreditCard',
        description: 'Automated treasury payout engine with hardware FIDO2 WebAuthn signing requirements.',
        inputs: [
          { id: 'in_amount', name: 'Invoice Amount ($)', type: 'data' },
          { id: 'in_sig', name: 'FIDO2 Human Sig', type: 'signal' },
        ],
        outputs: [
          { id: 'out_receipt', name: 'Stripe Charge ID', type: 'data' },
          { id: 'out_ledger', name: 'Audit Log Entry', type: 'data' },
        ],
        config: {
          endpoint: 'https://api.stripe.com/v1/transfers',
          budgetCapUsd: 50.00,
          fido2Required: true,
        },
        metrics: {
          latencyMs: 420,
          tokens: 0,
          costUsd: 0.15,
          executions: 2,
          errorRate: 0.0,
        },
      };

      set((s) => ({
        nodes: [...s.nodes, newNode],
        selectedNodeId: newNodeId,
        inspectorOpen: true,
      }));

      const action: AIBuildAction = {
        id: `act-${Date.now()}-3`,
        timestamp: new Date().toISOString(),
        agentId: state.selectedAgentId,
        agentName: customAgentName || 'Archon (Workflow Architect)',
        actionType: 'ADD_NODE',
        title: 'Provisioned Stripe Treasury & HITL Escrow Node',
        description: 'Configured zero-trust financial transfer node with enforced hardware WebAuthn multi-sig.',
        nodeIds: [newNodeId],
        diffSummary: `+ 1 Node (Stripe Payouts) [HITL Enforced]`,
      };
      actionsTaken.push(action);

      thoughtText = `Configured Stripe payout node with mandatory Human-In-The-Loop FIDO2 security constraint.`;
      responseText = `I have added the **Stripe Payout & Treasury Escrow** node! Financial transactions on this node are locked behind AST Zero-Trust and require operator FIDO2 multi-sig confirmation before execution.`;
      suggestedPrompts.push('🚀 Run Simulation', '🛡️ Review Security Gate');
    }
    // 4. ADD POLICY GATE / SECURITY
    else if (lower.includes('security') || lower.includes('policy') || lower.includes('zero-trust') || lower.includes('ast') || lower.includes('gate') || lower.includes('shield')) {
      const newNodeId = `node_policy_${Date.now()}`;
      const newNode: WorkflowNode = {
        id: newNodeId,
        name: 'AST Zero-Trust Policy Filter',
        type: 'policy_gate',
        platform: 'aws_nitro',
        category: 'SECURITY',
        position: { x: maxX + 280, y: 100 },
        status: 'idle',
        icon: 'ShieldCheck',
        description: 'Syntax AST scanner intercepting prompt injection, PII leakages, and budget anomalies.',
        inputs: [{ id: 'in_raw', name: 'Raw Ingress', type: 'data' }],
        outputs: [
          { id: 'out_clean', name: 'Sanitized Stream', type: 'data' },
          { id: 'out_blocked', name: 'Security Quarantine', type: 'error' },
        ],
        config: {
          policyRuleId: 'pol_strict_enclave_9',
          piiRedaction: true,
          budgetCapUsd: 20.00,
        },
        metrics: {
          latencyMs: 1.2,
          tokens: 0,
          costUsd: 0.0,
          executions: 48,
          errorRate: 0.0,
        },
      };

      set((s) => ({
        nodes: [...s.nodes, newNode],
        selectedNodeId: newNodeId,
        inspectorOpen: true,
      }));

      const action: AIBuildAction = {
        id: `act-${Date.now()}-4`,
        timestamp: new Date().toISOString(),
        agentId: state.selectedAgentId,
        agentName: customAgentName || 'Archon (Workflow Architect)',
        actionType: 'ADD_NODE',
        title: 'Installed AST Zero-Trust Policy Filter',
        description: 'Attached Nitro Enclave microsecond syntax inspector to guard against prompt injections.',
        nodeIds: [newNodeId],
        diffSummary: `+ 1 Node (AST Policy Gate)`,
      };
      actionsTaken.push(action);

      thoughtText = `Hardened graph topology with an AST Zero-Trust policy gate inside hardware Nitro Enclaves.`;
      responseText = `I have installed the **AST Zero-Trust Policy Filter**! Every incoming data packet will now be scanned for prompt injections, PII disclosures, and token overflows in 1.2ms.`;
      suggestedPrompts.push('🚀 Run Simulation', '✨ Add Gemini 2.0 Flash');
    }
    // 5. RUN SIMULATION / TEST
    else if (lower.includes('run') || lower.includes('simulate') || lower.includes('test') || lower.includes('execute') || lower.includes('play')) {
      get().runSimulation();

      const action: AIBuildAction = {
        id: `act-${Date.now()}-5`,
        timestamp: new Date().toISOString(),
        agentId: state.selectedAgentId,
        agentName: customAgentName || 'Archon (Workflow Architect)',
        actionType: 'RUN_SIMULATION',
        title: 'Triggered Real-Time Workflow Simulation',
        description: `Dispatched live execution packets across all ${state.nodes.length} nodes with telemetry tracing.`,
        diffSummary: `Simulating ${state.nodes.length} Nodes & ${state.edges.length} Connections`,
      };
      actionsTaken.push(action);

      thoughtText = `Triggered animated step simulation. Monitoring wire throughput, packet propagation, and latency counters.`;
      responseText = `🚀 **Workflow Simulation Started!** You can watch the live data packets traversing the animated wires in real-time on the canvas. Any HITL interception will trigger an interactive operator prompt.`;
      suggestedPrompts.push('⏸️ Pause Simulation', '📊 Inspect Execution Logs');
    }
    // 6. OPTIMIZE WORKFLOW
    else if (lower.includes('optimize') || lower.includes('faster') || lower.includes('speed') || lower.includes('latency') || lower.includes('cost')) {
      // Update nodes with optimized configs
      set((s) => ({
        nodes: s.nodes.map((n) => ({
          ...n,
          metrics: {
            ...n.metrics,
            latencyMs: Math.max(0.4, Number((n.metrics.latencyMs * 0.65).toFixed(1))),
          },
          config: {
            ...n.config,
            temperature: 0.5,
          },
        })),
      }));

      const action: AIBuildAction = {
        id: `act-${Date.now()}-6`,
        timestamp: new Date().toISOString(),
        agentId: state.selectedAgentId,
        agentName: customAgentName || 'FinOps (Cost Engine)',
        actionType: 'OPTIMIZE_GRAPH',
        title: 'Applied Graph Latency & Cost Optimization',
        description: 'Reduced average token latency by 35% through Nitro Enclave caching and temperature quantization.',
        diffSummary: `~35% Latency Reduction across ${state.nodes.length} Nodes`,
      };
      actionsTaken.push(action);

      thoughtText = `Quantized temperature parameters and enabled response streaming caches on all active models.`;
      responseText = `⚡ **Optimization Complete!**\n- **Latency Reduction**: ~35% average speedup across all node executions.\n- **Cache Strategy**: Enabled ephemeral Nitro token reuse.\n- **Budget Efficiency**: Reduced estimated token cost.`;
      suggestedPrompts.push('🚀 Run Simulation', '✨ Add Slack Notification Node');
    }
    // 7. GENERATE CODE / PYTHON SCRIPT / GITHUB REPO / WEBHOOK / AGENT BUILD
    else if (
      lower.includes('code') ||
      lower.includes('generate') ||
      lower.includes('build') ||
      lower.includes('script') ||
      lower.includes('github') ||
      lower.includes('python') ||
      lower.includes('webhook') ||
      lower.includes('slack') ||
      lower.includes('n8n')
    ) {
      const newNodeId = `node_code_${Date.now()}`;
      const isPython = lower.includes('python');
      const isGitHub = lower.includes('github');
      const isSlack = lower.includes('slack') || lower.includes('webhook');

      const newNode: WorkflowNode = {
        id: newNodeId,
        name: isGitHub
          ? 'GitHub CI/CD & PR Reviewer'
          : isPython
          ? 'Python Async Transformer'
          : isSlack
          ? 'Slack Real-time Webhook Dispatcher'
          : 'Zero-Trust TypeScript Handler',
        type: isGitHub ? 'integration' : isSlack ? 'integration' : 'ai_model',
        platform: isGitHub ? 'github' : isSlack ? 'aws_nitro' : 'gemini',
        category: isGitHub ? 'INTEGRATIONS' : 'AI_MODELS',
        position: { x: maxX + 320, y: 130 },
        status: 'idle',
        icon: isGitHub ? 'Code2' : isSlack ? 'Zap' : 'Sparkles',
        description: isGitHub
          ? 'Automated GitHub pull request reviewer checking Zero-Trust AST safety and syncing code commits.'
          : isPython
          ? 'High-performance Python execution container with NumPy & Pandas tensor transformations.'
          : isSlack
          ? 'Secure event webhook dispatcher sending real-time operational alerts.'
          : 'Modular TypeScript agent runtime with Zero-Trust proxy key isolation.',
        inputs: [
          { id: 'in_payload', name: 'Raw Event Ingress', type: 'data' },
          { id: 'in_auth', name: 'Token Authorization', type: 'token' },
        ],
        outputs: [
          { id: 'out_result', name: 'Processed Output Stream', type: 'data' },
          { id: 'out_audit', name: 'Telemetry Log', type: 'signal' },
        ],
        customScript: isPython
          ? `# Python Async Transform Handler
import json
import time

def process_stream(event_packet):
    print(f"Executing Python data transform for {event_packet.get('id', 'unknown')}")
    return {
        "status": "PROCESSED",
        "timestamp": time.time(),
        "cleaned_data": event_packet.get("payload", {})
    }`
          : isGitHub
          ? `// GitHub PR Reviewer & Automated Commit Engine
import { Octokit } from '@octokit/rest';

export async function reviewPullRequest(prNumber: number, token: string) {
  const octokit = new Octokit({ auth: token });
  console.log('Scanning AST for PR #' + prNumber);
  return { approved: true, comment: 'All Zero-Trust checks passed.' };
}`
          : `// Zero-Trust TypeScript Agent Module
import { GoogleGenAI } from '@google/genai';

export async function executeAgentLogic(context: Record<string, any>, apiKey: string) {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [{ role: 'user', parts: [{ text: JSON.stringify(context) }] }]
  });
  return { result: response.text, executionMs: 24.5 };
}`,
        config: {
          model: 'gemini-2.0-flash',
          temperature: 0.7,
          piiRedaction: true,
          budgetCapUsd: 15.0,
        },
        metrics: {
          latencyMs: isPython ? 45.2 : 28.6,
          tokens: 1420,
          costUsd: 0.0008,
          executions: 1,
          errorRate: 0.0,
        },
      };

      // Connect from latest node if possible
      const lastNode = currentNodes[currentNodes.length - 1];
      let newEdge: WorkflowEdge | null = null;
      if (lastNode && lastNode.outputs.length > 0) {
        newEdge = {
          id: `edge_${lastNode.id}_${newNodeId}_${Date.now()}`,
          sourceNodeId: lastNode.id,
          sourcePortId: lastNode.outputs[0].id,
          targetNodeId: newNodeId,
          targetPortId: newNode.inputs[0].id,
          animated: true,
          status: 'idle',
          dataType: 'data',
        };
      }

      set((s) => ({
        nodes: [...s.nodes, newNode],
        edges: newEdge ? [...s.edges, newEdge] : s.edges,
        selectedNodeId: newNodeId,
        inspectorOpen: true,
      }));

      const action: AIBuildAction = {
        id: `act-${Date.now()}-7`,
        timestamp: new Date().toISOString(),
        agentId: state.selectedAgentId,
        agentName: customAgentName || 'Archon (Workflow Architect)',
        actionType: 'ADD_NODE',
        title: `Generated & Deployed: ${newNode.name}`,
        description: `Created executable ${isPython ? 'Python' : 'TypeScript'} logic on canvas and generated GitHub/n8n code export bundle.`,
        nodeIds: [newNodeId],
        edgeIds: newEdge ? [newEdge.id] : [],
        diffSummary: `+ 1 Executable Node (${newNode.name}) + Code Artifacts`,
      };
      actionsTaken.push(action);

      thoughtText = `Synthesized executable node logic, generated complete code artifacts for TypeScript, Python, n8n workflow JSON, Dockerfile, and staged commit for GitHub.`;
      responseText = `I have generated and deployed the **${newNode.name}** onto your workflow canvas!\n\nAll executable files, n8n pipeline JSON, Dockerfile, and GitHub repository sync files have been generated below. You can inspect the code tabs, run test executions, or push directly to GitHub:`;
      suggestedPrompts.push('🚀 Test Run Logic', '📦 Push to GitHub Repo', '⚡ Add Policy Gate');
    }
    // 8. DEFAULT GENERAL ARCHITECT ASSISTANT
    else {
      thoughtText = `Analyzed prompt "${content}". Formulating architectural guidance and actionable workflow recommendations.`;
      responseText = `I have analyzed your request: **"${content}"**.\n\nHere is how I can build this for you:\n1. **Add Nodes**: Say *"Add Gemini node"*, *"Add Imagen 3 node"*, or *"Add Stripe payout"*\n2. **Generate Code**: Say *"Generate Python transform"* or *"Build GitHub reviewer agent"*\n3. **Simulate**: Say *"Run flow"* to test the real-time execution\n4. **Sync Code**: Use the GitHub button to push generated agent code to your repo.\n\nWhat would you like me to build next?`;
      suggestedPrompts.push(
        '💻 Generate Agent Code & n8n JSON',
        '✨ Add Gemini 2.0 Flash Node',
        '🎨 Add Imagen 3 Diffusion Node',
        '🚀 Run Workflow Simulation'
      );
    }

    // Always generate full code bundle so user can see and sync everything
    const agentName = customAgentName || 'Autonomous Operations Agent';
    const finalNodes = get().nodes;
    const finalEdges = get().edges;
    const codeBundle = useGitHubStore.getState().generateCodeBundle(agentName, finalNodes, finalEdges);

    const agentMsgId = `ag-${Date.now()}`;
    const agentMsg: WorkflowAgentMessage = {
      id: agentMsgId,
      sender: 'agent',
      agentId: state.selectedAgentId,
      agentName: customAgentName || 'Archon (Workflow Architect)',
      timestamp: new Date().toISOString(),
      content: responseText,
      thought: thoughtText,
      actionsTaken: actionsTaken.length > 0 ? actionsTaken : undefined,
      suggestedPrompts,
      generatedCodeBundle: codeBundle,
    };

    set((state) => ({
      agentMessages: [...state.agentMessages, agentMsg],
      aiBuildHistory: actionsTaken.length > 0 ? [...actionsTaken, ...state.aiBuildHistory] : state.aiBuildHistory,
      isAgentThinking: false,
      agentThinkingStep: '',
    }));
  },
}));

