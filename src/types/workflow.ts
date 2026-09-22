export type WorkflowNodeType =
  | 'trigger'
  | 'ai_model'
  | 'api_key_proxy'
  | 'integration'
  | 'policy_gate'
  | 'transformer'
  | 'output';

export type IntegrationPlatform =
  | 'gemini'
  | 'anthropic'
  | 'openai'
  | 'gmail'
  | 'whatsapp'
  | 'telegram'
  | 'discord'
  | 'rest_api'
  | 'gdrive'
  | 'stripe'
  | 'github'
  | 'slack'
  | 'aws_nitro'
  | 'cloudsql'
  | 'redis'
  | 'twilio'
  | 'imagen'
  | 'webhook';

export interface NodePort {
  id: string;
  name: string;
  type: 'data' | 'token' | 'signal' | 'error' | 'file' | 'image';
  description?: string;
}

export interface NodeCredentialInfo {
  type: string;
  status: 'CONNECTED' | 'ENCLAVE_LOCKED' | 'EXPIRED' | 'MINTED_EPHEMERAL';
  keyMask: string;
  enclaveAttestation?: string;
}

export interface WorkflowNode {
  id: string;
  name: string;
  type: WorkflowNodeType;
  platform: IntegrationPlatform;
  category: string;
  position: { x: number; y: number };
  status: 'idle' | 'running' | 'success' | 'intercepted' | 'error';
  icon: string;
  description: string;
  inputs: NodePort[];
  outputs: NodePort[];
  customScript?: string;
  scriptLanguage?: 'typescript' | 'python' | 'javascript' | 'json';
  config: {
    model?: string;
    temperature?: number;
    ttlSeconds?: number;
    budgetCapUsd?: number;
    policyRuleId?: string;
    endpoint?: string;
    webhookUrl?: string;
    oauthScope?: string;
    piiRedaction?: boolean;
    fido2Required?: boolean;
    promptTemplate?: string;
    imageResolution?: string;
    aspectRatio?: string;
    cronExpression?: string;
    filterCondition?: string;
    [key: string]: any;
  };
  metrics: {
    latencyMs: number;
    tokens: number;
    costUsd: number;
    executions: number;
    errorRate: number;
  };
  livePayload?: {
    input?: any;
    output?: any;
    error?: string;
    timestamp?: string;
    statusSummary?: string;
  };
  credentials?: NodeCredentialInfo;
}

export interface WorkflowEdge {
  id: string;
  sourceNodeId: string;
  sourcePortId: string;
  targetNodeId: string;
  targetPortId: string;
  label?: string;
  dataType?: string;
  animated?: boolean;
  status?: 'idle' | 'transmitting' | 'error' | 'intercepted';
}

export interface ExecutionPacket {
  id: string;
  edgeId: string;
  sourceNodeId: string;
  targetNodeId: string;
  progress: number; // 0 to 1
  payloadPreview: string;
  dataType: string;
}

export interface WorkflowPreset {
  id: string;
  name: string;
  badge: string;
  tagline: string;
  description: string;
  category: 'MULTIMODAL' | 'TREASURY' | 'WORKSPACE' | 'ARBITRAGE' | 'CUSTOM';
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface WorkflowLogEntry {
  id: string;
  timestamp: string;
  nodeId: string;
  nodeName: string;
  level: 'INFO' | 'SUCCESS' | 'WARN' | 'INTERCEPT' | 'ERROR';
  message: string;
  payload?: any;
  latencyMs?: number;
}

export interface AIBuildAction {
  id: string;
  timestamp: string;
  agentId: string;
  agentName: string;
  actionType: 'ADD_NODE' | 'CONNECT_EDGE' | 'UPDATE_CONFIG' | 'DELETE_NODE' | 'RUN_SIMULATION' | 'APPLY_PRESET' | 'OPTIMIZE_GRAPH';
  title: string;
  description: string;
  nodeIds?: string[];
  edgeIds?: string[];
  diffSummary?: string;
  details?: Record<string, any>;
}

export interface WorkflowAgentMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  agentId?: string;
  agentName?: string;
  avatar?: string;
  timestamp: string;
  content: string;
  thought?: string;
  actionsTaken?: AIBuildAction[];
  suggestedPrompts?: string[];
  generatedCodeBundle?: {
    agentName: string;
    workflowTitle: string;
    typescriptAgent: string;
    pythonScript: string;
    n8nWorkflowJson: string;
    githubActionYml: string;
    readmeMd: string;
  };
}

