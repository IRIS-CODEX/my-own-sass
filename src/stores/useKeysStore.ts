import { create } from 'zustand';
import { VirtualKey, MasterSecret, UpstreamAIProvider } from '../types';

export interface ProxySimulationResult {
  status: 'SUCCESS' | 'BLOCKED_PROMPT_INJECTION' | 'BLOCKED_CREDIT_EXCEEDED' | 'BLOCKED_INACTIVE_KEY';
  statusCode: number;
  message: string;
  responseContent?: string;
  tokenCount: number;
  costUsd: number;
  latencyMs: number;
  blockedRule?: string;
  timestamp: string;
  sanitizedPrompt?: string;
}

interface KeysState {
  virtualKeys: VirtualKey[];
  masterSecrets: MasterSecret[];
  newKeyModalOpen: boolean;
  recentlyCreatedKey: { name: string; fullSecret: string; provider: string; agentName: string; budget: number } | null;
  selectedKeyForTesting: string | null;

  setNewKeyModalOpen: (open: boolean) => void;
  setRecentlyCreatedKey: (key: { name: string; fullSecret: string; provider: string; agentName: string; budget: number } | null) => void;
  setSelectedKeyForTesting: (keyId: string | null) => void;

  createVirtualKey: (data: {
    name: string;
    agentId: string;
    agentName: string;
    upstreamProvider: UpstreamAIProvider;
    upstreamApiKey: string;
    allowedModels: string[];
    dailyBudgetUsd: number;
    promptInjectionDefense?: boolean;
    piiRedaction?: boolean;
  }) => { fullSecret: string; key: VirtualKey };

  revokeVirtualKey: (keyId: string) => void;
  reactivateVirtualKey: (keyId: string) => void;
  deleteVirtualKey: (keyId: string) => void;
  updateMasterSecret: (provider: MasterSecret['provider'], maskedSample: string) => void;
  simulateProxyRequest: (keyId: string, promptText: string) => Promise<ProxySimulationResult>;
}

const STORAGE_KEYS = 'agentlens_stored_virtual_keys_v2';

const INITIAL_KEYS: VirtualKey[] = [
  {
    id: 'vkey_supp_99182',
    orgId: 'org_enterprise_9981a',
    agentId: 'agent_support_01',
    agentName: 'Support-Desk-Sentinel',
    name: 'OpenAI-Prod-Support-Tunnel',
    keyPrefix: 'al_live_4f89',
    fullKeySecret: 'al_live_4f89_9a82bb1904ce831aef',
    isActive: true,
    upstreamProvider: 'OPENAI',
    upstreamKeyMasked: 'sk-proj-••••••••••••••••••••••••••••••••••••••••••••f82a',
    allowedModels: ['gpt-4o-mini', 'gpt-4o'],
    dailyBudgetUsd: 25.00,
    spendTodayUsd: 8.42,
    promptInjectionDefense: true,
    piiRedaction: true,
    totalRequests: 3840,
    blockedRequests: 42,
    createdAt: '2026-08-14',
    lastUsedAt: 'Just now'
  },
  {
    id: 'vkey_sales_77210',
    orgId: 'org_enterprise_9981a',
    agentId: 'agent_sales_02',
    agentName: 'Sales-Pipeline-Navigator',
    name: 'Anthropic-Outreach-Bridge',
    keyPrefix: 'al_live_9a22',
    fullKeySecret: 'al_live_9a22_1943aa0021ce449a0b',
    isActive: true,
    upstreamProvider: 'ANTHROPIC',
    upstreamKeyMasked: 'sk-ant-api03-•••••••••••••••••••••••••••••••••••••••bc14',
    allowedModels: ['claude-3-5-haiku', 'claude-3-5-sonnet'],
    dailyBudgetUsd: 35.00,
    spendTodayUsd: 14.19,
    promptInjectionDefense: true,
    piiRedaction: true,
    totalRequests: 1920,
    blockedRequests: 18,
    createdAt: '2026-08-18',
    lastUsedAt: '2 mins ago'
  },
  {
    id: 'vkey_research_11094',
    orgId: 'org_enterprise_9981a',
    agentId: 'agent_research_03',
    agentName: 'Financial-SEC-Auditor',
    name: 'Gemini-Research-Gateway',
    keyPrefix: 'al_live_11cb',
    fullKeySecret: 'al_live_11cb_88a4029ce1129bb88a',
    isActive: true,
    upstreamProvider: 'GEMINI',
    upstreamKeyMasked: 'AIzaSy•••••••••••••••••••••••••••••••••••92e',
    allowedModels: ['gemini-1.5-pro', 'gemini-1.5-flash'],
    dailyBudgetUsd: 50.00,
    spendTodayUsd: 29.80,
    promptInjectionDefense: true,
    piiRedaction: false,
    totalRequests: 850,
    blockedRequests: 7,
    createdAt: '2026-08-22',
    lastUsedAt: '12 mins ago'
  },
  {
    id: 'vkey_db_44821',
    orgId: 'org_enterprise_9981a',
    agentId: 'agent_db_04',
    agentName: 'Database-Telemetry-Reporter',
    name: 'Groq-UltraFast-Analytics',
    keyPrefix: 'al_live_77e0',
    fullKeySecret: 'al_live_77e0_3391ba99ce18429fac',
    isActive: true,
    upstreamProvider: 'GROQ',
    upstreamKeyMasked: 'gsk_•••••••••••••••••••••••••••••••••••••••••••1a98',
    allowedModels: ['llama-3.3-70b-versatile'],
    dailyBudgetUsd: 15.00,
    spendTodayUsd: 3.10,
    promptInjectionDefense: true,
    piiRedaction: true,
    totalRequests: 490,
    blockedRequests: 3,
    createdAt: '2026-09-02',
    lastUsedAt: '1 hour ago'
  }
];

const INITIAL_SECRETS: MasterSecret[] = [
  {
    id: 'sec_openai_01',
    provider: 'OPENAI',
    maskedKey: 'sk-proj-••••••••••••••••••••••••••••••••••••••••••••f82a',
    lastUpdated: '3 days ago',
    status: 'ENCRYPTED_AES256_GCM',
    keyFingerprint: 'sha256:d82e81...99a0'
  },
  {
    id: 'sec_anthropic_02',
    provider: 'ANTHROPIC',
    maskedKey: 'sk-ant-api03-•••••••••••••••••••••••••••••••••••••••bc14',
    lastUpdated: '12 days ago',
    status: 'ENCRYPTED_AES256_GCM',
    keyFingerprint: 'sha256:71a2bc...33d1'
  },
  {
    id: 'sec_stripe_03',
    provider: 'STRIPE',
    maskedKey: 'rk_live_••••••••••••••••••••••••••••••••••••••••••••0129',
    lastUpdated: '1 month ago',
    status: 'ENCRYPTED_AES256_GCM',
    keyFingerprint: 'sha256:91ce02...55b4'
  },
  {
    id: 'sec_twilio_04',
    provider: 'TWILIO',
    maskedKey: 'AC•••••••••••••••••••••••••••••••••••••••••••••••••e238',
    lastUpdated: '2 months ago',
    status: 'ENCRYPTED_AES256_GCM',
    keyFingerprint: 'sha256:44aa11...9982'
  },
  {
    id: 'sec_db_05',
    provider: 'DATABASE',
    maskedKey: 'postgresql://proxy_ro:•••••••••••••••@prod-db.internal:6432',
    lastUpdated: '1 week ago',
    status: 'ENCRYPTED_AES256_GCM',
    keyFingerprint: 'sha256:32e091...bb21'
  }
];

function loadPersistedKeys(): VirtualKey[] {
  if (typeof window === 'undefined') return INITIAL_KEYS;
  try {
    const saved = localStorage.getItem(STORAGE_KEYS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load virtual keys from localStorage', e);
  }
  return INITIAL_KEYS;
}

function persistKeys(keys: VirtualKey[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS, JSON.stringify(keys));
  } catch (e) {
    console.error('Failed to save virtual keys to localStorage', e);
  }
}

// Prompt injection heuristic signatures
const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
  /disregard\s+(all\s+)?(rules|guidelines|safety|instructions)/i,
  /print\s+(the\s+)?(confidential|system\s+prompt|master\s+key|api\s+key|password|secret)/i,
  /reveal\s+(the\s+)?(system\s+prompt|instructions|hidden\s+text)/i,
  /you\s+are\s+now\s+in\s+DAN\s+mode/i,
  /bypass\s+(content\s+filter|safety|guardrail|firewall)/i,
  /output\s+above\s+as\s+raw\s+json/i,
  /repeat\s+words\s+above/i,
  /drop\s+table/i,
  /select\s+\*\s+from\s+passwords/i,
  /eval\s*\(.*\)/i
];

export const useKeysStore = create<KeysState>((set, get) => ({
  virtualKeys: loadPersistedKeys(),
  masterSecrets: INITIAL_SECRETS,
  newKeyModalOpen: false,
  recentlyCreatedKey: null,
  selectedKeyForTesting: 'vkey_supp_99182',

  setNewKeyModalOpen: (newKeyModalOpen) => set({ newKeyModalOpen }),
  setRecentlyCreatedKey: (recentlyCreatedKey) => set({ recentlyCreatedKey }),
  setSelectedKeyForTesting: (selectedKeyForTesting) => set({ selectedKeyForTesting }),

  createVirtualKey: ({
    name,
    agentId,
    agentName,
    upstreamProvider,
    upstreamApiKey,
    allowedModels,
    dailyBudgetUsd,
    promptInjectionDefense = true,
    piiRedaction = true
  }) => {
    const randomHex = Math.random().toString(36).substring(2, 6);
    const randomSecret = Math.random().toString(36).substring(2, 16) + Math.random().toString(36).substring(2, 16);
    const prefix = `al_live_${randomHex}`;
    const fullSecret = `${prefix}_${randomSecret}`;

    // Safely mask the user-entered upstream API key for storage
    const trimmedKey = upstreamApiKey.trim();
    let upstreamKeyMasked = 'sk-••••••••••••••••••••••••••••';
    if (trimmedKey.length > 8) {
      upstreamKeyMasked = `${trimmedKey.slice(0, 6)}••••••••••••••••${trimmedKey.slice(-4)}`;
    }

    const newKey: VirtualKey = {
      id: `vkey_${Date.now()}_${randomHex}`,
      orgId: 'org_enterprise_9981a',
      agentId,
      agentName,
      name,
      keyPrefix: prefix,
      fullKeySecret: fullSecret,
      isActive: true,
      upstreamProvider,
      upstreamKeyMasked,
      allowedModels,
      dailyBudgetUsd,
      spendTodayUsd: 0.0,
      promptInjectionDefense,
      piiRedaction,
      totalRequests: 0,
      blockedRequests: 0,
      createdAt: new Date().toISOString().split('T')[0],
      lastUsedAt: 'Never'
    };

    set((state) => {
      const updated = [newKey, ...state.virtualKeys];
      persistKeys(updated);
      return {
        virtualKeys: updated,
        recentlyCreatedKey: {
          name,
          fullSecret,
          provider: upstreamProvider,
          agentName,
          budget: dailyBudgetUsd
        },
        selectedKeyForTesting: newKey.id
      };
    });

    return { fullSecret, key: newKey };
  },

  revokeVirtualKey: (keyId) =>
    set((state) => {
      const updated = state.virtualKeys.map((k) =>
        k.id === keyId ? { ...k, isActive: false } : k
      );
      persistKeys(updated);
      return { virtualKeys: updated };
    }),

  reactivateVirtualKey: (keyId) =>
    set((state) => {
      const updated = state.virtualKeys.map((k) =>
        k.id === keyId ? { ...k, isActive: true } : k
      );
      persistKeys(updated);
      return { virtualKeys: updated };
    }),

  deleteVirtualKey: (keyId) =>
    set((state) => {
      const updated = state.virtualKeys.filter((k) => k.id !== keyId);
      persistKeys(updated);
      return {
        virtualKeys: updated,
        selectedKeyForTesting: state.selectedKeyForTesting === keyId ? (updated[0]?.id || null) : state.selectedKeyForTesting
      };
    }),

  updateMasterSecret: (provider, maskedSample) =>
    set((state) => ({
      masterSecrets: state.masterSecrets.map((s) =>
        s.provider === provider
          ? {
              ...s,
              maskedKey: maskedSample,
              lastUpdated: 'Just now',
              status: 'ENCRYPTED_AES256_GCM'
            }
          : s
      )
    })),

  simulateProxyRequest: async (keyId, promptText) => {
    const key = get().virtualKeys.find((k) => k.id === keyId);
    const now = new Date().toLocaleTimeString();

    if (!key) {
      return {
        status: 'BLOCKED_INACTIVE_KEY',
        statusCode: 401,
        message: 'Invalid or missing AgentLens Virtual Key credential.',
        tokenCount: 0,
        costUsd: 0,
        latencyMs: 14,
        timestamp: now
      };
    }

    if (!key.isActive) {
      return {
        status: 'BLOCKED_INACTIVE_KEY',
        statusCode: 403,
        message: `Virtual Key [${key.keyPrefix}] has been revoked by workspace admin. Execution halted.`,
        tokenCount: 0,
        costUsd: 0,
        latencyMs: 16,
        timestamp: now
      };
    }

    // 1. Check Credit / Daily Budget Cap
    if (key.spendTodayUsd >= key.dailyBudgetUsd) {
      return {
        status: 'BLOCKED_CREDIT_EXCEEDED',
        statusCode: 429,
        message: `Agent daily credit limit reached ($${key.spendTodayUsd.toFixed(2)} / $${key.dailyBudgetUsd.toFixed(2)}). Upstream API blocked to prevent cost runaway.`,
        tokenCount: 0,
        costUsd: 0,
        latencyMs: 22,
        timestamp: now
      };
    }

    // Simulate network ingress latency
    await new Promise((r) => setTimeout(r, 450));

    // 2. Prompt Injection Defense Scan
    if (key.promptInjectionDefense) {
      const matchedPattern = PROMPT_INJECTION_PATTERNS.find((p) => p.test(promptText));
      if (matchedPattern) {
        // Increment blocked counter
        set((state) => {
          const updated = state.virtualKeys.map((k) =>
            k.id === keyId ? { ...k, blockedRequests: k.blockedRequests + 1, lastUsedAt: 'Just now' } : k
          );
          persistKeys(updated);
          return { virtualKeys: updated };
        });

        return {
          status: 'BLOCKED_PROMPT_INJECTION',
          statusCode: 403,
          message: '🛡️ BLOCKED BY AGENTLENS FIREWALL: Malicious prompt injection / jailbreak pattern detected.',
          blockedRule: `RULE_INJECTION_DEFENSE_SIG: "${matchedPattern.source}"`,
          tokenCount: 0,
          costUsd: 0.0,
          latencyMs: 44,
          timestamp: now
        };
      }
    }

    // 3. Safe Execution Through Proxy to Upstream
    const tokenCount = Math.floor(promptText.length * 0.4) + Math.floor(Math.random() * 120) + 60;
    const costUsd = Number(((tokenCount / 1000) * 0.00015).toFixed(5));
    const latencyMs = Math.floor(Math.random() * 160) + 120;

    // Update key usage and spend
    set((state) => {
      const updated = state.virtualKeys.map((k) =>
        k.id === keyId
          ? {
              ...k,
              spendTodayUsd: Number((k.spendTodayUsd + costUsd).toFixed(4)),
              totalRequests: k.totalRequests + 1,
              lastUsedAt: 'Just now'
            }
          : k
      );
      persistKeys(updated);
      return { virtualKeys: updated };
    });

    return {
      status: 'SUCCESS',
      statusCode: 200,
      message: `200 OK • Passed through AgentLens Proxy safely to ${key.upstreamProvider}`,
      responseContent: `Hello! Your request was inspected and validated by AgentLens Gateway.\n\n- Connected Agent: ${key.agentName || 'General Agent'}\n- Upstream Provider: ${key.upstreamProvider} (${key.allowedModels[0] || 'Default'})\n- Security Check: 0 injection patterns detected, PII masked\n- Credit Deducted: $${costUsd.toFixed(5)} USD (${tokenCount} tokens)\n- Upstream Key: AES-256 protected, never exposed to client.`,
      tokenCount,
      costUsd,
      latencyMs,
      timestamp: now
    };
  }
}));
