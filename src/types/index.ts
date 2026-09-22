export type AutonomyMode = 'FULL_AUTO' | 'SEMI_AUTO' | 'READ_ONLY' | 'PAUSED';

export type RiskLevel = 'GREEN' | 'YELLOW' | 'RED';

export type AgentArchetype = 'SUPPORT' | 'OUTREACH' | 'RESEARCHER' | 'DB_REPORTER' | 'CODING' | 'CUSTOM' | 'CREATIVE' | 'MULTIMODAL';

export type StepType = 'THOUGHT' | 'TOOL_INVOCATION' | 'EVALUATION' | 'OUTPUT' | 'ERROR';

export type AgentMultimodalCapability =
  | 'image_generation'
  | 'voice_live'
  | 'video_generation'
  | 'google_maps'
  | 'google_search'
  | 'music_generation'
  | 'firebase_auth_db'
  | 'audio_transcription'
  | 'gemini_chat';

export interface AgentIntegrationsConfig {
  imageGeneration?: {
    enabled: boolean;
    model: string; // 'gemini-3.1-flash-image-preview'
    aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  };
  voiceLive?: {
    enabled: boolean;
    model: string; // 'gemini-3.8-live'
    voice: 'Kore' | 'Zephyr' | 'Puck' | 'Fenrir' | 'Charon';
  };
  videoGeneration?: {
    enabled: boolean;
    model: string; // 'veo-3.1-fast-generate-preview'
    aspectRatio: '16:9' | '9:16';
  };
  googleMapsGrounding?: {
    enabled: boolean;
    model: string; // 'gemini-3.5-flash'
  };
  googleSearchGrounding?: {
    enabled: boolean;
    model: string; // 'gemini-3.5-flash'
  };
  musicGeneration?: {
    enabled: boolean;
    model: 'lyria-3-clip-preview' | 'lyria-3-pro-preview';
  };
  firebasePersistence?: {
    enabled: boolean;
    syncFirestore: boolean;
  };
  audioTranscription?: {
    enabled: boolean;
    model: string; // 'gemini-3.5-transcribe'
  };
  chatModel?: 'gemini-3.1-pro-preview' | 'gemini-3.5-flash' | 'gemini-3.1-flash-lite' | 'gemini-3.8-flash';
}

export interface Agent {
  id: string;
  userId?: string;
  orgId: string;
  name: string;
  description: string;
  archetype: AgentArchetype;
  autonomyMode: AutonomyMode;
  dailyBudgetUsd: number;
  spendTodayUsd: number;
  totalExecutions: number;
  systemPrompt: string;
  model: string;
  temperature: number;
  status: 'ONLINE' | 'BUSY' | 'PAUSED' | 'ERROR';
  createdAt: string;
  lastActiveAt: string;
  framework: string;
  tools?: string[];
  capabilities?: AgentMultimodalCapability[];
  integrationsConfig?: AgentIntegrationsConfig;
  suggestedPrompts?: string[];
  avatarIcon?: string;
  welcomeMessage?: string;
}

export interface ChatToolCall {
  toolName: string;
  params: Record<string, any>;
  result: string;
  riskLevel: RiskLevel;
  intercepted?: boolean;
}

export interface ChatMessage {
  id: string;
  agentId: string;
  sender: 'user' | 'agent' | 'system';
  content: string;
  timestamp: string;
  thoughts?: string[];
  toolCall?: ChatToolCall;
  mediaType?: 'image' | 'video' | 'audio' | 'music' | 'grounding';
  mediaUrl?: string;
  audioBase64?: string;
  lyrics?: string;
  groundingMetadata?: {
    webSearchQueries?: string[];
    searchChunks?: Array<{ title?: string; uri?: string; text?: string }>;
    mapsLocation?: string;
  };
  metrics?: {
    latencyMs: number;
    tokensUsed: number;
    costUsd: number;
  };
}

export type UpstreamAIProvider =
  | 'OPENAI'
  | 'ANTHROPIC'
  | 'GEMINI'
  | 'GROQ'
  | 'MISTRAL'
  | 'PERPLEXITY'
  | 'OPENROUTER'
  | 'CUSTOM';

export interface VirtualKey {
  id: string;
  userId?: string;
  orgId: string;
  agentId: string;
  agentName?: string;
  name: string;
  keyPrefix: string; // e.g. 'al_live_4f89'
  fullKeySecret?: string; // e.g. 'al_live_sec_99482fbc89a...'
  isActive: boolean;
  upstreamProvider: UpstreamAIProvider;
  upstreamKeyMasked: string;
  allowedModels: string[];
  dailyBudgetUsd: number;
  spendTodayUsd: number;
  promptInjectionDefense: boolean;
  piiRedaction: boolean;
  totalRequests: number;
  blockedRequests: number;
  createdAt: string;
  lastUsedAt?: string;
}

export interface MasterSecret {
  id: string;
  provider: 'OPENAI' | 'ANTHROPIC' | 'STRIPE' | 'TWILIO' | 'DATABASE';
  maskedKey: string;
  lastUpdated: string;
  status: 'ENCRYPTED_AES256_GCM' | 'UNCONFIGURED';
  keyFingerprint: string;
}

export interface ToolPolicy {
  id: string;
  userId?: string;
  orgId: string;
  agentId?: string;
  toolName: string;
  description: string;
  riskLevel: RiskLevel;
  ruleCondition?: {
    field: string;
    operator: '>' | '<' | '==' | '!=' | 'CONTAINS';
    value: string | number;
  };
  autoApprovalCount: number;
  interceptedCount: number;
  createdAt: string;
}

export interface AgentPromptRule {
  id: string;
  userId?: string;
  agentId?: string; // 'ALL' or specific agent ID
  agentName?: string;
  sourcePrompt: string;
  ruleName: string;
  category: 'SECURITY' | 'FINANCIAL' | 'DATA_PRIVACY' | 'BEHAVIORAL' | 'COMPLIANCE' | 'OPERATIONAL';
  riskLevel: RiskLevel;
  targetTool?: string;
  conditionExpression?: string;
  systemInstructionAddition: string;
  isEnabled: boolean;
  createdAt: string;
}

export interface PendingAction {
  actionId: string;
  userId?: string;
  orgId: string;
  agentId: string;
  agentName: string;
  toolName: string;
  parameters: Record<string, any>;
  agentReasoning: string;
  riskLevel: RiskLevel;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'TIMED_OUT';
  createdAt: string;
  expiresAt: string; // 300 seconds TTL
  humanFeedback?: string;
}

export interface TraceEvent {
  id: string;
  userId?: string;
  orgId: string;
  agentId: string;
  agentName: string;
  stepType: StepType;
  toolName?: string;
  payload: Record<string, any>;
  latencyMs: number;
  tokenCostUsd: number;
  riskLevel?: RiskLevel;
  timestamp: string;
  status: 'SUCCESS' | 'PAUSED' | 'BLOCKED' | 'FLAGGED';
}

export interface StudioBuildStep {
  step: 'ARCHITECT' | 'CODER' | 'LINTER' | 'SANDBOX' | 'RED_TEAM';
  status: 'PENDING' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILED';
  message: string;
  details?: string;
}

export interface IndustryPack {
  id: string;
  name: string;
  badge: string;
  description: string;
  rulesCount: number;
  enabled: boolean;
  features: string[];
}

export interface Organization {
  id: string;
  name: string;
  planTier: 'FREE' | 'STARTER' | 'PRO_MONTHLY' | 'PRO_YEARLY' | 'ENTERPRISE';
  planStatus: 'ACTIVE' | 'PAST_DUE' | 'EXPIRED' | 'CANCELLED';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  monthlyRequestLimit: number;
  monthlyRequestsUsed: number;
  paypalSubscriptionId?: string;
  autoRenew: boolean;
}

export interface AuditLedgerItem {
  id: string;
  timestamp: string;
  agentName: string;
  toolName: string;
  actionSummary: string;
  approver: string;
  merkleHash: string;
  previousHash: string;
  complianceVerdict: 'COMPLIANT' | 'FLAGGED' | 'MANUALLY_OVERRIDDEN';
}

export interface TenantAdmin {
  id: string;
  name: string;
  ownerEmail: string;
  ownerName?: string;
  planTier: 'FREE' | 'STARTER' | 'PRO_MONTHLY' | 'PRO_YEARLY' | 'ENTERPRISE';
  status: 'ACTIVE' | 'PAST_DUE' | 'EXPIRED' | 'SUSPENDED';
  currentPeriodEnd: string;
  requestsUsed: number;
  requestLimit: number;
  activeAgentsCount: number;
  virtualKeysCount: number;
  monthlySpendUsd: number;
  totalPaidLtvUsd: number;
  paymentMethod: 'MASTERCARD' | 'VISA' | 'PAYPAL' | 'WIRE' | 'UNPAID';
  cardLast4?: string;
  unpaidBalanceUsd?: number;
  daysPastDue?: number;
  failureReason?: string;
  joinedAt?: string;
  lastLoginAt?: string;
  dunningSentCount?: number;
  authProvider?: 'google' | 'email' | 'demo' | 'admin';
}

export interface SecurityViolation {
  id: string;
  timestamp: string;
  orgName: string;
  agentName: string;
  attemptedAction: string;
  reason: 'PROMPT_INJECTION' | 'PII_LEAK' | 'FORBIDDEN_TOOL' | 'BUDGET_EXCEEDED' | 'SSRF_ATTEMPT';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  blocked: boolean;
}
